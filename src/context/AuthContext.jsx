import { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../supabaseClient";

/**
 * AuthContext
 * ───────────
 * Single shared instance of auth state for the whole app. Every component
 * that calls useAuth() reads/writes the SAME user object — critical for
 * things like Navigation's account modal, which must see a profile update
 * (e.g. onboarding_completed flipping to true) the instant another component
 * (Onboarding.jsx) calls refreshUser(), not just on its own next mount.
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
      if (!authUser) {
        loadedUserIdRef.current = null;
        setUser(null);
        setAuthLoading(false);
        return;
      }
      // same user already loaded — this is just Supabase re-validating the
      // session on focus, not a real sign-in. Skip the reload entirely.
      if (loadedUserIdRef.current === authUser.id) return;
      loadProfile(authUser);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function loadProfile(authUser) {
    setAuthLoading(true);
    loadedUserIdRef.current = authUser.id;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle();

    if (profile) {
      setUser(buildUser(authUser, profile));
      setAuthLoading(false);
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

    const { data: newProfile } = await supabase
      .from("profiles")
      .upsert(
        { id: authUser.id, email: authUser.email, name, avatar_url },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (newProfile) {
      setIsNewUser(true);
      setUser(buildUser(authUser, newProfile));
    }
    setAuthLoading(false);
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
      onboarding_completed:    profile.onboarding_completed ?? false,
      onboarding_completed_at: profile.onboarding_completed_at ?? null,
      growth_stage:            profile.growth_stage ?? 0
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
