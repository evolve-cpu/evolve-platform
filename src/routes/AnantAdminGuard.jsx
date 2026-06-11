import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { supabaseAdmin } from "../supabaseAdminClient";

/**
 * Guard for ANU admin/faculty routes.
 *
 * Allows access if:
 *   1. PIN-based: sessionStorage admin_access = "true"  (evolve super admin)
 *   2. Supabase session: user email is in anu_faculty OR anu_admins
 *
 * On Supabase-based access, writes anu_role / anu_stream into sessionStorage
 * so AdminDashboard can filter accordingly.
 */
export default function AnantAdminGuard({ children }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    verify();
  }, []);

  async function verify() {
    // 1. PIN access (evolve super admin — fastest check)
    if (sessionStorage.getItem("admin_access") === "true") {
      setStatus("ok");
      return;
    }

    // 2. Supabase session check
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) { setStatus("denied"); return; }

      const email = user.email.toLowerCase();

      // check faculty
      const { data: faculty } = await supabaseAdmin
        .from("anu_faculty")
        .select("id, stream, program, auth_user_id, invite_accepted_at")
        .eq("anu_email", email)
        .maybeSingle();

      if (faculty) {
        // stamp accepted if first time
        if (!faculty.auth_user_id) {
          await supabaseAdmin.from("anu_faculty").update({
            auth_user_id: user.id,
            invite_accepted_at: new Date().toISOString()
          }).eq("id", faculty.id);
        }
        sessionStorage.setItem("admin_access",  "true");
        sessionStorage.setItem("admin_tenant",  "anant");
        sessionStorage.setItem("anu_role",      "faculty");
        sessionStorage.setItem("anu_stream",    faculty.stream   || "");
        sessionStorage.setItem("anu_program",   faculty.program  || "");
        setStatus("ok");
        return;
      }

      // check university admin
      const { data: admin } = await supabaseAdmin
        .from("anu_admins")
        .select("id, auth_user_id, invite_accepted_at")
        .eq("anu_email", email)
        .maybeSingle();

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
        setStatus("ok");
        return;
      }

      setStatus("denied");
    } catch {
      setStatus("denied");
    }
  }

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
