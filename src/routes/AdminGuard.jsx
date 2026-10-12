import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { fetchAdminRole } from "../supabaseAdminClient";

// The real check happens on the server (api/admin.js) for every request
// the dashboard makes; this only decides whether to show the dashboard and
// which tenant view to open.
export default function AdminGuard({ children }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data?.session?.user) {
        if (!cancelled) setStatus("denied");
        return;
      }
      const who = await fetchAdminRole();
      if (cancelled) return;

      if (who.role === "evolve") {
        sessionStorage.setItem("admin_tenant", "evolve");
        sessionStorage.removeItem("anu_role");
      } else if (who.role === "anant_admin" || who.role === "anant_faculty") {
        sessionStorage.setItem("admin_tenant", "anant");
        sessionStorage.setItem("anu_role", who.role === "anant_admin" ? "uni_admin" : "faculty");
        sessionStorage.setItem("anu_stream", who.stream || "");
        sessionStorage.setItem("anu_program", who.program || "");
      } else {
        sessionStorage.removeItem("admin_access");
        setStatus("denied");
        return;
      }
      sessionStorage.setItem("admin_access", "true");
      setStatus("ok");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-evolve-black">
        <div className="w-7 h-7 border-2 border-evolve-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (status === "denied") return <Navigate to="/admin" replace />;
  return children;
}
