// import { supabase } from "../supabaseClient";
// import { generateGuestProfile } from "./generateGuest";

// // export async function handleSignIn(setUser) {
// //   // 1️⃣ Try Google One-Tap
// //   if (window.google?.accounts?.id) {
// //     window.google.accounts.id.prompt();
// //     return;
// //   }

// //   // 2️⃣ Fallback → Guest Login
// //   const { username, avatar_url } = generateGuestProfile();

// //   const email = `${username}@guest.evolve`;
// //   const password = crypto.randomUUID();

// //   const { data, error } = await supabase.auth.signUp({
// //     email,
// //     password
// //   });

// //   if (error) {
// //     console.error("Guest signup failed:", error);
// //     return;
// //   }

// //   const userId = data.user.id;

// //   // Store profile in DB
// //   await supabase.from("profiles").insert({
// //     id: userId,
// //     username,
// //     avatar_url,
// //     is_guest: true
// //   });

// //   // Update UI immediately
// //   setUser({
// //     id: userId,
// //     username,
// //     avatar_url,
// //     is_guest: true
// //   });
// // }

// export async function handleSignIn(setUser) {
//   // Manual Google Sign-In (popup)
//   const { error } = await supabase.auth.signInWithOAuth({
//     provider: "google",
//     options: {
//       redirectTo: window.location.origin
//     }
//   });

//   if (!error) return;

//   // Fallback → Guest
//   const { username, avatar_url } = generateGuestProfile();

//   const email = `${username}@guest.evolve`;
//   const password = crypto.randomUUID();

//   const { data } = await supabase.auth.signUp({ email, password });

//   await supabase.from("profiles").insert({
//     id: data.user.id,
//     username,
//     avatar_url,
//     is_guest: true
//   });

//   setUser({
//     id: data.user.id,
//     username,
//     avatar_url,
//     is_guest: true
//   });
// }

// export async function handleSignIn(setUser) {
//   // 1️⃣ Anonymous sign-in (NO EMAIL)
//   const { data, error } = await supabase.auth.signInAnonymously();

//   if (error) {
//     console.error("Anonymous sign-in failed:", error);
//     return;
//   }

//   const userId = data.user.id;

//   // 2️⃣ Generate guest profile
//   const { username, avatar_url } = generateGuestProfile();

//   // 3️⃣ Store profile in DB
//   await supabase.from("profiles").insert({
//     id: userId,
//     username,
//     avatar_url,
//     is_guest: true
//   });

//   // 4️⃣ Update UI
//   setUser({
//     id: userId,
//     username,
//     avatar_url,
//     is_guest: true
//   });
// }
// ── OLD CODE (anonymous guest sign-in) — kept for reference ───────────────
// import { supabase } from "../supabaseClient";
// import { generateGuestProfile } from "./generateGuest";
//
// export async function handleSignIn(setUser, setAuthLoading) {
//   setAuthLoading(true);
//   const { data, error } = await supabase.auth.signInAnonymously();
//   if (error) { setAuthLoading(false); return; }
//   const userId = data.user.id;
//   const { username, avatar_url } = generateGuestProfile();
//   await supabase.from("profiles").upsert(
//     { id: userId, username, avatar_url, is_guest: true },
//     { onConflict: "id" }
//   );
//   setUser({ id: userId, username, avatar_url, is_guest: true });
//   setAuthLoading(false);
// }
// ── END OLD CODE ───────────────────────────────────────────────────────────

import { supabase } from "../supabaseClient";

/**
 * Step 1 — send OTP to the user's email.
 * `name` is stored in user_metadata so useAuth can create the profile
 * automatically after the OTP is verified.
 *
 * @throws {Error} if supabase returns an error
 */
export async function sendOtp(name, email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      data: { full_name: name }
    }
  });
  if (error) throw error;
}

/**
 * Step 2 — verify the 6-digit OTP code.
 * On success, supabase fires onAuthStateChange → useAuth creates/loads profile.
 *
 * @throws {Error} if the code is wrong or expired
 */
export async function verifyOtp(email, token) {
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email"
  });
  if (error) throw error;
}

/**
 * Sign in with Google via OAuth redirect.
 * After redirect, supabase fires onAuthStateChange → useAuth creates/loads profile.
 *
 * @throws {Error} if OAuth setup fails
 */
// OAuth is a hard, cross-origin redirect — it lands back on `destination`
// with a fresh page load, bypassing every in-SPA "where should this user
// end up" check (resolveLandingPath, App.jsx's onboarding guard, ...).
// This flag survives that round trip (sessionStorage persists across a
// same-tab redirect) so the app can, once the session is back, still send
// an already-onboarded user to their profile instead of stranding them on
// `destination` (which defaults to "/" for a generic sign-in). See the
// matching check in App.jsx's AppLayout.
function flagPostOAuthRedirectCheck() {
  sessionStorage.setItem("oauth_post_signin_check", "1");
}

export async function signInWithGoogle(destination = "/") {
  flagPostOAuthRedirectCheck();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      // Redirect directly to the destination — avoids double-redirect which breaks
      // mobile browsers (iOS Safari ITP clears OAuth state between cross-origin hops)
      redirectTo: `${window.location.origin}${destination}`
    }
  });
  if (error) throw error;
}

export async function signInWithLinkedIn(destination = "/") {
  flagPostOAuthRedirectCheck();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "linkedin_oidc",
    options: {
      redirectTo: `${window.location.origin}${destination}`
    }
  });
  if (error) throw error;
}
