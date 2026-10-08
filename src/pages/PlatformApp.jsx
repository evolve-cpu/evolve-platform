import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../hooks/useAuth";
import PublicProfile from "./PublicProfile";
import Typetober from "./Typetober/Typetober";

/**
 * The signed-in platform, at /app/*. Every section has its own URL so back /
 * refresh / shared links all work:
 *
 *   /app/profile                      my profile
 *   /app/grow                         programmes
 *   /app/grow/portfolio-review        portfolio review programme
 *   /app/grow/mentorship              mentorship programme
 *   /app/events                       events (+ Typetober)
 *   /app/events/:slug                 one event — registration happens here
 *   /app/typetober                    Typetober board (full-screen)
 *   /app/community                    community
 *   /app/account[/details|/invoice]   account
 *
 * Public counterparts (/events/:slug, /typetober, /profile/:username) stay
 * viewable signed out and hand people over to these once they sign in.
 *
 * The 30-day trial starts here, the first time someone lands on the platform
 * (public.start_trial(), see platform_entry_trial.sql) — not at sign-up.
 */
export default function PlatformApp() {
  const { user, setUser, authLoading } = useAuth();
  const location = useLocation();
  const [trialReady, setTrialReady] = useState(false);

  const needsTrialStart = !!user && !user.trial_started_at;

  useEffect(() => {
    if (!user) return;
    if (!needsTrialStart) {
      setTrialReady(true);
      return;
    }
    let cancelled = false;
    supabase.rpc("start_trial").then(({ data, error }) => {
      if (cancelled) return;
      if (error) {
        console.error("start_trial error:", error);
      } else {
        // patched in place rather than refreshUser(), which would flip
        // authLoading and remount the whole platform
        setUser((u) =>
          u
            ? {
                ...u,
                trial_started_at: u.trial_started_at || new Date().toISOString(),
                trial_ends_at: data ?? u.trial_ends_at
              }
            : u
        );
      }
      setTrialReady(true);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, needsTrialStart]);

  if (authLoading) return <div className="min-h-screen bg-evolve-black" />;

  if (!user) {
    // survives the OAuth round trip, unlike router state (see SignIn.jsx)
    const from = location.pathname + location.search;
    sessionStorage.setItem("signin_from", from);
    return <Navigate to="/signin" replace state={{ from }} />;
  }

  if (!trialReady || !user.username) {
    return <div className="min-h-screen bg-evolve-black" />;
  }

  return (
    <Routes>
      <Route index element={<Navigate to="profile" replace />} />
      <Route path="typetober/*" element={<Typetober platform />} />
      <Route path="*" element={<PublicProfile platform />} />
    </Routes>
  );
}
