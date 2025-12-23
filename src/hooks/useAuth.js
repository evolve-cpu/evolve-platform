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

import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const authUser = data?.session?.user;
      if (authUser) loadProfile(authUser);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const authUser = session?.user;
        if (authUser) loadProfile(authUser);
        else setUser(null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // async function loadProfile(authUser) {
  //   // 1️⃣ Try fetching profile (DO NOT crash if missing)
  //   const { data, error } = await supabase
  //     .from("profiles")
  //     .select("*")
  //     .eq("id", authUser.id)
  //     .maybeSingle(); // ✅ IMPORTANT

  //   // 2️⃣ If profile does NOT exist → create it (Google One Tap case)
  //   if (!data) {
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
  //       .insert({
  //         id: authUser.id,
  //         username,
  //         avatar_url,
  //         is_guest: authUser.is_anonymous ?? false
  //       })
  //       .select()
  //       .single();

  //     setUser({
  //       id: authUser.id,
  //       email: authUser.email,
  //       username: newProfile.username,
  //       avatar_url: newProfile.avatar_url,
  //       is_guest: newProfile.is_guest
  //     });

  //     return;
  //   }

  //   // 3️⃣ Profile exists → normal flow
  //   setUser({
  //     id: authUser.id,
  //     email: authUser.email,
  //     username: data.username,
  //     avatar_url: data.avatar_url,
  //     is_guest: data.is_guest
  //   });
  // }

  // return { user, setUser };

  async function loadProfile(authUser) {
    setAuthLoading(true);

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle();

    // Profile already exists → DO NOT TOUCH username/avatar
    if (data) {
      setUser({
        id: authUser.id,
        email: authUser.email,
        username: data.username,
        avatar_url: data.avatar_url,
        is_guest: data.is_guest
      });
      setAuthLoading(false);
      return;
    }

    // Profile does NOT exist → create ONCE
    const username =
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.name ||
      "evolve_user";

    const avatar_url =
      authUser.user_metadata?.avatar_url ||
      authUser.user_metadata?.picture ||
      `https://api.dicebear.com/7.x/thumbs/svg?seed=${authUser.id}`;

    const { data: newProfile } = await supabase
      .from("profiles")
      .upsert(
        {
          id: authUser.id,
          username,
          avatar_url,
          is_guest: authUser.is_anonymous ?? false
        },
        { onConflict: "id" } // 🔒 PREVENT DUPLICATES
      )
      .select()
      .single();

    setUser({
      id: authUser.id,
      email: authUser.email,
      username: newProfile.username,
      avatar_url: newProfile.avatar_url,
      is_guest: newProfile.is_guest
    });

    setAuthLoading(false);
  }

  return { user, setUser, authLoading, setAuthLoading };
}
