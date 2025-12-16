import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export function useAuth() {
  const [user, setUser] = useState(null);

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

  async function loadProfile(authUser) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (data) {
      setUser({
        id: authUser.id,
        email: authUser.email,
        username: data.username,
        avatar_url: data.avatar_url,
        is_guest: data.is_guest
      });
    }
  }

  return { user, setUser };
}
