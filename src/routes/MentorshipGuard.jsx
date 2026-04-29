import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function MentorshipGuard({ children }) {
  const [status, setStatus] = useState("loading"); // "loading" | "ok" | "no-auth" | "no-payment"

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setStatus("no-auth"); return; }

      const { data } = await supabase
        .from("mentorship_payments")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("status", "success")
        .limit(1)
        .maybeSingle();

      setStatus(data ? "ok" : "no-payment");
    })();
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#161618" }}>
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
      </div>
    );
  }

  if (status === "no-auth") return <Navigate to="/signin" replace />;
  if (status === "no-payment") return <Navigate to="/mentorship" replace />;

  return children;
}
