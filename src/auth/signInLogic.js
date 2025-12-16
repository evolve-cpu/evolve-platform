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

import { supabase } from "../supabaseClient";
import { generateGuestProfile } from "./generateGuest";

export async function handleSignIn(setUser) {
  // 1️⃣ Anonymous sign-in (NO EMAIL)
  const { data, error } = await supabase.auth.signInAnonymously();

  if (error) {
    console.error("Anonymous sign-in failed:", error);
    return;
  }

  const userId = data.user.id;

  // 2️⃣ Generate guest profile
  const { username, avatar_url } = generateGuestProfile();

  // 3️⃣ Store profile in DB
  await supabase.from("profiles").insert({
    id: userId,
    username,
    avatar_url,
    is_guest: true
  });

  // 4️⃣ Update UI
  setUser({
    id: userId,
    username,
    avatar_url,
    is_guest: true
  });
}
