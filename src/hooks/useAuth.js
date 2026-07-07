// import { useEffect, useState } from "react";
// import { supabase } from "../supabaseClient";

// export function useAuth() {
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data }) => {
//       const authUser = data?.session?.user;
//       if (authUser) loadProfile(authUser);
//     });

//     const { data: listener } = supabase.auth.onAuthStateChange(
//       (_event, session) => {
//         const authUser = session?.user;
//         if (authUser) loadProfile(authUser);
//         else setUser(null);
//       }
//     );

//     return () => listener.subscription.unsubscribe();
//   }, []);

//   async function loadProfile(authUser) {
//     const { data } = await supabase
//       .from("profiles")
//       .select("*")
//       .eq("id", authUser.id)
//       .single();

//     if (data) {
//       setUser({
//         id: authUser.id,
//         email: authUser.email,
//         username: data.username,
//         avatar_url: data.avatar_url,
//         is_guest: data.is_guest
//       });
//     }
//   }

//   return { user, setUser };
// }

// import { useEffect, useState } from "react";
// import { supabase } from "../supabaseClient";

// export function useAuth() {
//   const [user, setUser] = useState(null);
//   const [authLoading, setAuthLoading] = useState(false);

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data }) => {
//       const authUser = data?.session?.user;
//       if (authUser) loadProfile(authUser);
//     });

//     const { data: listener } = supabase.auth.onAuthStateChange(
//       (_event, session) => {
//         const authUser = session?.user;
//         if (authUser) loadProfile(authUser);
//         else setUser(null);
//       }
//     );

//     return () => listener.subscription.unsubscribe();
//   }, []);

//   async function loadProfile(authUser) {
//     setAuthLoading(true);

//     const { data } = await supabase
//       .from("profiles")
//       .select("*")
//       .eq("id", authUser.id)
//       .maybeSingle();

//     // Profile already exists → DO NOT TOUCH username/avatar
//     if (data) {
//       setUser({
//         id: authUser.id,
//         email: authUser.email,
//         username: data.username,
//         avatar_url: data.avatar_url,
//         is_guest: data.is_guest
//       });
//       setAuthLoading(false);
//       return;
//     }

//     // Profile does NOT exist → create ONCE
//     const username =
//       authUser.user_metadata?.full_name ||
//       authUser.user_metadata?.name ||
//       "evolve_user";

//     const avatar_url =
//       authUser.user_metadata?.avatar_url ||
//       authUser.user_metadata?.picture ||
//       `https://api.dicebear.com/7.x/thumbs/svg?seed=${authUser.id}`;

//     const { data: newProfile } = await supabase
//       .from("profiles")
//       .upsert(
//         {
//           id: authUser.id,
//           username,
//           avatar_url,
//           is_guest: authUser.is_anonymous ?? false
//         },
//         { onConflict: "id" } // 🔒 PREVENT DUPLICATES
//       )
//       .select()
//       .single();

//     setUser({
//       id: authUser.id,
//       email: authUser.email,
//       username: newProfile.username,
//       avatar_url: newProfile.avatar_url,
//       is_guest: newProfile.is_guest
//     });

//     setAuthLoading(false);
//   }

//   return { user, setUser, authLoading, setAuthLoading };
// }

// ── OLD CODE (guest/anonymous flow) — kept for reference ──────────────────
// import { useEffect, useState } from "react";
// import { supabase } from "../supabaseClient";
//
// export function useAuth() {
//   const [user, setUser] = useState(null);
//   const [authLoading, setAuthLoading] = useState(false);
//
//   useEffect(() => {
//     supabase.auth.getSession().then(({ data }) => {
//       const authUser = data?.session?.user;
//       if (authUser) loadProfile(authUser);
//     });
//
//     const { data: listener } = supabase.auth.onAuthStateChange(
//       (_event, session) => {
//         const authUser = session?.user;
//         if (authUser) loadProfile(authUser);
//         else setUser(null);
//       }
//     );
//
//     return () => listener.subscription.unsubscribe();
//   }, []);
//
//   async function loadProfile(authUser) {
//     setAuthLoading(true);
//
//     const { data } = await supabase
//       .from("profiles")
//       .select("*")
//       .eq("id", authUser.id)
//       .maybeSingle();
//
//     if (data) {
//       setUser({
//         id: authUser.id,
//         email: authUser.email,
//         username: data.username,
//         avatar_url: data.avatar_url,
//         is_guest: data.is_guest
//       });
//       setAuthLoading(false);
//       return;
//     }
//
//     const username =
//       authUser.user_metadata?.full_name ||
//       authUser.user_metadata?.name ||
//       "evolve_user";
//
//     const avatar_url =
//       authUser.user_metadata?.avatar_url ||
//       authUser.user_metadata?.picture ||
//       `https://api.dicebear.com/7.x/thumbs/svg?seed=${authUser.id}`;
//
//     const { data: newProfile } = await supabase
//       .from("profiles")
//       .upsert(
//         { id: authUser.id, username, avatar_url, is_guest: authUser.is_anonymous ?? false },
//         { onConflict: "id" }
//       )
//       .select()
//       .single();
//
//     if (newProfile) {
//       setUser({
//         id: authUser.id,
//         email: authUser.email,
//         username: newProfile.username,
//         avatar_url: newProfile.avatar_url,
//         is_guest: newProfile.is_guest
//       });
//     }
//     setAuthLoading(false);
//   }
//
//   const refreshUser = async () => {
//     const { data } = await supabase.auth.getUser();
//     const authUser = data?.user;
//     if (authUser) await loadProfile(authUser);
//   };
//
//   return { user, setUser, authLoading, setAuthLoading, refreshUser };
// }
// ── END OLD CODE ───────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

/**
 * useAuth
 * ───────
 * Listens to Supabase auth state and syncs with the `profiles` table.
 *
 * Supports:
 *   • Google One Tap   (signInWithIdToken — initialised in App.jsx)
 *   • Email OTP        (signInWithOtp → verifyOtp — in AuthModal)
 *   • Google OAuth     (signInWithOAuth — in AuthModal)
 *
 * No guest / anonymous users.
 */
export function useAuth() {
  const [user, setUser]               = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // true on start to avoid UI flash
  const [isNewUser, setIsNewUser]     = useState(false);

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
      if (authUser) loadProfile(authUser);
      else { setUser(null); setAuthLoading(false); }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function loadProfile(authUser) {
    setAuthLoading(true);

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
      id:                     authUser.id,
      email:                  authUser.email,
      name:                   profile.name,
      avatar_url:             profile.avatar_url,
      phone:                  profile.phone ?? null,
      username:               profile.username ?? null,
      bio:                    profile.bio ?? null,
      persona:                profile.persona ?? null,
      level:                  profile.level ?? null,
      level_confidence:       profile.level_confidence ?? null,
      country:                profile.country ?? null,
      motivation:             profile.motivation ?? null,
      learning_method:        profile.learning_method ?? null,
      learning_modes:         profile.learning_modes ?? [],
      discipline:             profile.discipline ?? [],
      intent:                 profile.intent ?? [],
      work_type:              profile.work_type ?? null,
      onboarding_completed:   profile.onboarding_completed ?? false,
      onboarding_completed_at:profile.onboarding_completed_at ?? null,
      growth_stage:           profile.growth_stage ?? 0
    };
  }

  /** re-fetch profile from DB (e.g. after saving phone number) */
  const refreshUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data?.user) await loadProfile(data.user);
  };

  return { user, setUser, authLoading, setAuthLoading, refreshUser, isNewUser };
}
