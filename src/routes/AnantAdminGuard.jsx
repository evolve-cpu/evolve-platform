import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { fetchAdminRole } from "../supabaseAdminClient";

/**
 * Guard for ANU admin/faculty routes.
 *
 * Access is granted when the signed-in user is an Evolve admin
 * (admin_users) or their email is in anu_faculty / anu_admins — decided by
 * api/admin.js, never by anything stored in the browser.
 *
 * Uses onAuthStateChange to catch magic link sessions from URL hash,
 * so faculty/admin clicking an invite link land here automatically.
 */
export default function AnantAdminGuard({ children }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let resolved = false;
    let timeoutId;
    let unsubFn = null;

    // api/admin.js decides the role from the signed-in, verified email
    // (and links a first-time staff member's auth id). Everything the
    // dashboard loads is checked again on the server, so the flags set here
    // only choose which screens to show.
    async function verifyRole() {
      if (resolved) return;
      const who = await fetchAdminRole();

      if (who.role === "anant_faculty") {
        sessionStorage.setItem("admin_access", "true");
        sessionStorage.setItem("admin_tenant", "anant");
        sessionStorage.setItem("anu_role",     "faculty");
        sessionStorage.setItem("anu_stream",   who.stream  || "");
        sessionStorage.setItem("anu_program",  who.program || "");
        resolved = true; setStatus("ok"); return;
      }

      if (who.role === "anant_admin" || who.role === "evolve") {
        sessionStorage.setItem("admin_access", "true");
        sessionStorage.setItem("admin_tenant", "anant");
        if (who.role === "anant_admin") sessionStorage.setItem("anu_role", "uni_admin");
        else sessionStorage.removeItem("anu_role"); // Evolve admin: full Anant view
        sessionStorage.removeItem("anu_stream");
        sessionStorage.removeItem("anu_program");
        resolved = true; setStatus("ok"); return;
      }

      sessionStorage.removeItem("admin_access");
      resolved = true; setStatus("denied");
    }

    async function init() {
      // getSession processes the URL hash (magic link tokens) if present
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await verifyRole();
        return;
      }

      // No session yet — wait for onAuthStateChange (magic link URL hash processing)
      // This fires within milliseconds on the same page load
      timeoutId = setTimeout(() => {
        if (!resolved) { resolved = true; setStatus("denied"); }
      }, 6000);

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, sess) => {
          if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && sess?.user) {
            clearTimeout(timeoutId);
            await verifyRole();
            subscription.unsubscribe();
          }
        }
      );
      unsubFn = () => subscription.unsubscribe();
    }

    init();
    return () => {
      clearTimeout(timeoutId);
      unsubFn?.();
    };
  }, []);

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#060c17" }}>
        <div className="w-7 h-7 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (status === "denied") return <Navigate to="/admin" replace />;
  return children;
}
