import { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../supabaseClient";
import { findFreeSlug } from "../lib/slug";
import { callAdminApi } from "../supabaseAdminClient";
import { excludeIfTeam } from "../lib/clarity";
import { trackSignup, pingActive } from "../lib/platformAnalytics";

/**
 * AuthContext
 * ───────────
 * Single shared instance of auth state for the whole app. Every component
 * that calls useAuth() reads/writes the SAME user object — critical for
 * things like Navigation's account modal, which must see a profile update
 * (e.g. trial_ends_at being set on first platform entry) the instant another
 * component (PlatformApp.jsx) calls refreshUser(), not just on its own next mount.
 *
 * Supports:
 *   • Google One Tap   (signInWithIdToken — initialised in App.jsx)
 *   • Email OTP        (signInWithOtp → verifyOtp — in AuthModal)
 *   • Google OAuth     (signInWithOAuth — in AuthModal)
 *
 * No guest / anonymous users.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // true on start to avoid UI flash
  const [isNewUser, setIsNewUser]     = useState(false);

  // Tracks whose profile is currently loaded into `user`. Supabase's client
  // re-validates the session (and fires onAuthStateChange again — often as
  // TOKEN_REFRESHED, sometimes even SIGNED_IN) every time the tab regains
  // focus/visibility, even though nothing actually changed. Without this
  // guard, that re-fire calls loadProfile() again, which flips authLoading
  // to true and back — every screen gated on authLoading (mid-onboarding
  // forms included) unmounts and remounts, wiping whatever the user had
  // typed. So: only do a full (re)load when the session's user is actually
  // different from the one we already have loaded.
  const loadedUserIdRef = useRef(null);

  useEffect(() => {
    // 1. restore existing session on mount
    // clean OAuth callback params AFTER getSession() so Supabase can exchange the code first
    supabase.auth.getSession().then(({ data }) => {
      // window.location.hash returns "" for a bare "#" — use href.includes instead
      const hasFragment = window.location.href.includes("#");
      const hasCode = new URLSearchParams(window.location.search).has("code");
      if (hasFragment || hasCode) {
        window.history.replaceState(null, "", window.location.pathname);
      }
      const authUser = data?.session?.user;
      excludeIfTeam(authUser?.email);
      if (authUser) loadProfile(authUser);
      else setAuthLoading(false);
    });

    // 2. react to every future sign-in / sign-out
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const hasFragment = window.location.href.includes("#");
      const hasCode = new URLSearchParams(window.location.search).has("code");
      if (hasFragment || hasCode) {
        window.history.replaceState(null, "", window.location.pathname);
      }
      const authUser = session?.user;
      excludeIfTeam(authUser?.email);
      if (!authUser) {
        loadedUserIdRef.current = null;
        setUser(null);
        setAuthLoading(false);
        return;
      }
      // same user already loaded — this is just Supabase re-validating the
      // session on focus, not a real sign-in. Skip the reload entirely.
      if (loadedUserIdRef.current === authUser.id) return;
      // deferred: calling Supabase from inside this callback can deadlock on
      // the auth lock (notably in in-app browsers like Discord/Instagram)
      setTimeout(() => loadProfile(authUser), 0);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Always ends with authLoading=false, even if a query throws — otherwise
  // every screen gated on authLoading (all of /app) stays blank forever.
  async function loadProfile(authUser) {
    setAuthLoading(true);
    loadedUserIdRef.current = authUser.id;
    pingActive(authUser.id);
    try {
      await loadProfileInner(authUser);
    } catch (e) {
      console.error("loadProfile error:", e);
      loadedUserIdRef.current = null;
    } finally {
      setAuthLoading(false);
    }
  }

  async function loadProfileInner(authUser) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle();

    if (profile) {
      const provisioned = profile.username
        ? profile
        : await provisionIndividual(authUser, profile);
      setUser(buildUser(authUser, provisioned));
      return;
    }

    // new user — build profile from OAuth/OTP metadata
    const name =
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.name      ||
      authUser.email?.split("@")[0]     ||
      "user";

    const avatar_url =
      authUser.user_metadata?.avatar_url ||
      authUser.user_metadata?.picture    ||
      null;

    // google_one_tap / google / linkedin / email, for the admin platform report
    const signup_method = trackSignup(authUser);

    const { data: newProfile } = await supabase
      .from("profiles")
      .upsert(
        { id: authUser.id, email: authUser.email, name, avatar_url, signup_method },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (newProfile) {
      setIsNewUser(true);
      // "Welcome to Evolve" email — server sends it once, to this account only
      callAdminApi({ op: "welcome_email" });
      setUser(buildUser(authUser, await provisionIndividual(authUser, newProfile)));
    }
  }

  // There's no onboarding step any more — signing in drops people straight
  // onto the platform (/app), which is keyed off their username. So every
  // profile without one gets a username here and is marked onboarded as an
  // individual. Student vs pro is decided later, at checkout (student ID
  // upload). Institution admins still go through /onboarding explicitly from
  // the institutions page, which reuses this username.
  // findFreeSlug only checks profile_cards, so the name can still collide
  // with another profile's username — on a unique violation, retry with a
  // random suffix rather than leaving the user without one (which blanks /app).
  async function provisionIndividual(authUser, profile) {
    const base = await findFreeSlug(
      supabase,
      "profile_cards",
      "username",
      profile.name || authUser.email
    );
    for (let attempt = 0; attempt < 4; attempt++) {
      const username =
        attempt === 0
          ? base
          : `${base}-${Math.random().toString(36).slice(2, 6)}`;
      const { data, error } = await supabase
        .from("profiles")
        .update({
          username,
          onboarding_completed: true,
          onboarding_completed_at:
            profile.onboarding_completed_at || new Date().toISOString()
        })
        .eq("id", authUser.id)
        .select()
        .single();
      if (data) return data;
      if (error?.code !== "23505") {
        console.error("provisionIndividual error:", error);
        break;
      }
    }
    return profile;
  }

  function buildUser(authUser, profile) {
    return {
      id:                      authUser.id,
      email:                   authUser.email,
      name:                    profile.name,
      avatar_url:              profile.avatar_url,
      phone:                   profile.phone ?? null,
      username:                profile.username ?? null,
      bio:                     profile.bio ?? null,
      portfolio_url:           profile.portfolio_url ?? null,
      portfolio_link:          profile.portfolio_link ?? null,
      portfolio_file_url:      profile.portfolio_file_url ?? null,
      resume_link:             profile.resume_link ?? null,
      resume_file_url:         profile.resume_file_url ?? null,
      ai_profile:              profile.ai_profile ?? null,
      ai_profile_public:       profile.ai_profile_public ?? false,
      social_links:            profile.social_links ?? [],
      persona:                 profile.persona ?? null,
      level:                   profile.level ?? null,
      level_confidence:        profile.level_confidence ?? null,
      country:                 profile.country ?? null,
      motivation:              profile.motivation ?? null,
      learning_method:         profile.learning_method ?? null,
      learning_modes:          profile.learning_modes ?? [],
      discipline:              profile.discipline ?? [],
      intent:                  profile.intent ?? [],
      work_type:               profile.work_type ?? null,
      school_name:             profile.school_name ?? null,
      standard:                profile.standard ?? null,
      stream:                  profile.stream ?? null,
      role:                    profile.role ?? null,
      program:                 profile.program ?? null,
      student_id_verification_status: profile.student_id_verification_status ?? "none",
      onboarding_completed:    profile.onboarding_completed ?? false,
      onboarding_completed_at: profile.onboarding_completed_at ?? null,
      growth_stage:            profile.growth_stage ?? 0,
      trial_ends_at:           profile.trial_ends_at ?? null,
      trial_started_at:        profile.trial_started_at ?? null,
      // set when a deleted account's trial was resumed (trial_rejoin_ledger.sql)
      trial_resumed_at:        profile.trial_resumed_at ?? null,
      // invited with a free portfolio review — no trial (review_invite.sql)
      review_invite_at:        profile.review_invite_at ?? null,
      // demo access from the admin panel — plan reads "Demo access" (demo_access.sql)
      demo_until:              profile.demo_until ?? null,
      // after-trial membership (see src/lib/membership.js)
      designation:             profile.designation ?? null,
      plan:                    profile.plan ?? null,
      plan_expires_at:         profile.plan_expires_at ?? null,
      review_credits:          profile.review_credits ?? 0,
      verification_status:     profile.verification_status ?? null
    };
  }

  /** re-fetch profile from DB (e.g. after saving phone number, or completing onboarding) */
  const refreshUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data?.user) await loadProfile(data.user);
  };

  /** shared sign-out — e.g. the onboarding flow's "not you? log out" escape hatch */
  const logout = async () => {
    setAuthLoading(true);
    try {
      await supabase.auth.signOut();
      loadedUserIdRef.current = null;
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, authLoading, setAuthLoading, refreshUser, isNewUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth() must be called within <AuthProvider>");
  }
  return ctx;
}
