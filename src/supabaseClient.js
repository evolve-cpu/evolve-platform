import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// flowType "pkce" removed — it breaks signInWithIdToken (Google One Tap)
// the /# cleanup is handled in useAuth onAuthStateChange instead
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
