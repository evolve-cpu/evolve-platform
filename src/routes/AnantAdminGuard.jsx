import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { supabaseAdmin } from "../supabaseAdminClient";

/**
 * Guard for ANU admin/faculty routes.
 *
 * Access is granted if:
 *   1. PIN-based: sessionStorage admin_access = "true"  (evolve super admin)
 *   2. Supabase session: user email found in anu_faculty OR anu_admins
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

    async function verifyRole(user) {
      if (resolved) return;

      const email = user.email?.toLowerCase();
      if (!email) { resolved = true; setStatus("denied"); return; }

      const [{ data: faculty }, { data: admin }] = await Promise.all([
        supabaseAdmin
          .from("anu_faculty")
          .select("id, stream, program, auth_user_id")
          .eq("anu_email", email)
          .maybeSingle(),
        supabaseAdmin
          .from("anu_admins")
          .select("id, auth_user_id")
          .eq("anu_email", email)
          .maybeSingle()
      ]);

      if (faculty) {
        if (!faculty.auth_user_id) {
          await supabaseAdmin.from("anu_faculty").update({
            auth_user_id: user.id,
            invite_accepted_at: new Date().toISOString()
          }).eq("id", faculty.id);
        }
        sessionStorage.setItem("admin_access", "true");
        sessionStorage.setItem("admin_tenant", "anant");
        sessionStorage.setItem("anu_role",     "faculty");
        sessionStorage.setItem("anu_stream",   faculty.stream  || "");
        sessionStorage.setItem("anu_program",  faculty.program || "");
        resolved = true; setStatus("ok"); return;
      }

      if (admin) {
        if (!admin.auth_user_id) {
          await supabaseAdmin.from("anu_admins").update({
            auth_user_id: user.id,
            invite_accepted_at: new Date().toISOString()
          }).eq("id", admin.id);
        }
        sessionStorage.setItem("admin_access", "true");
        sessionStorage.setItem("admin_tenant", "anant");
        sessionStorage.setItem("anu_role",     "uni_admin");
        sessionStorage.removeItem("anu_stream");
        sessionStorage.removeItem("anu_program");
        resolved = true; setStatus("ok"); return;
      }

      resolved = true; setStatus("denied");
    }

    async function init() {
      // Fast path: PIN already in session
      if (sessionStorage.getItem("admin_access") === "true") {
        setStatus("ok"); return;
      }

      // getSession processes the URL hash (magic link tokens) if present
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await verifyRole(session.user);
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
            await verifyRole(sess.user);
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
