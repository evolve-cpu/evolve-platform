import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { fetchAdminRole } from "../../supabaseAdminClient";

// Admins sign in with their normal Evolve account; api/admin.js checks the
// verified email against admin_users (or anu_admins / anu_faculty). This
// replaced a 4-digit PIN that shipped inside the public JS bundle.
export default function AdminLogin() {
  const navigate = useNavigate();
  const [state, setState] = useState("checking"); // checking | signed-out | denied
  const [email, setEmail] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user;
      if (!user) {
        if (!cancelled) setState("signed-out");
        return;
      }
      const who = await fetchAdminRole();
      if (cancelled) return;
      if (who.role) {
        navigate("/admin/dashboard", { replace: true });
        return;
      }
      setEmail(user.email || "");
      setState("denied");
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  function goSignIn() {
    sessionStorage.setItem("signin_from", "/admin");
    navigate("/signin", { state: { from: "/admin" } });
  }

  async function switchAccount() {
    await supabase.auth.signOut();
    goSignIn();
  }

  return (
    <div className="min-h-screen bg-evolve-yellow flex items-center justify-center px-6">
      <div
        className="
          w-full max-w-[420px]
          bg-evolve-yellow
          border-2 border-black
          rounded-3xl
          p-8
          shadow-[10px_10px_0px_rgba(0,0,0,0.25)]
        "
      >
        <h1 className="text-black font-extrabold text-[32px] tracking-[-0.04em]">
          admin access
        </h1>

        {state === "checking" && <p className="mt-2 text-black/80 text-[16px]">checking your account…</p>}

        {state === "signed-out" && (
          <>
            <p className="mt-2 text-black/80 text-[16px]">
              sign in with your evolve team account to continue
            </p>
            <AdminButton onClick={goSignIn}>sign in</AdminButton>
          </>
        )}

        {state === "denied" && (
          <>
            <p className="mt-2 text-black/80 text-[16px]">
              <b>{email}</b> isn&apos;t on the admin list. Ask a team admin to add it, or switch account.
            </p>
            <AdminButton onClick={switchAccount}>switch account</AdminButton>
          </>
        )}
      </div>
    </div>
  );
}

function AdminButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        mt-8 w-full
        bg-black text-white font-extrabold
        rounded-[37.11px]
        px-10 py-4
        text-[18px]
        shadow-[6px_6px_0px_rgba(0,0,0,0.25)]
        transition-all duration-300
        active:scale-[0.98]
      "
    >
      {children}
    </button>
  );
}
