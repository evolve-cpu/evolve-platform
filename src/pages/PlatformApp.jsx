import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
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
 * Someone who deleted their account and came back resumes the old trial
 * instead of getting a new one (trial_rejoin_ledger.sql).
 */
export default function PlatformApp() {
  const { user, setUser, authLoading, refreshUser } = useAuth();
  const location = useLocation();
  const [trialReady, setTrialReady] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const needsTrialStart = !!user && !user.trial_started_at;

  useEffect(() => {
    if (!user) return;
    if (!needsTrialStart) {
      setTrialReady(true);
      return;
    }
    let cancelled = false;
    supabase.rpc("start_trial").then(async ({ data, error }) => {
      if (cancelled) return;
      if (error) {
        console.error("start_trial error:", error);
      } else {
        // was this a resumed trial (deleted account, same email)? drives the
        // "welcome back, N days left" sheet in PublicProfile.jsx
        const { data: row } = await supabase
          .from("profiles")
          .select("trial_resumed_at")
          .eq("id", user.id)
          .maybeSingle();
        if (cancelled) return;
        // patched in place rather than refreshUser(), which would flip
        // authLoading and remount the whole platform
        setUser((u) =>
          u
            ? {
                ...u,
                trial_started_at: u.trial_started_at || new Date().toISOString(),
                trial_ends_at: data ?? u.trial_ends_at,
                trial_resumed_at: row?.trial_resumed_at ?? u.trial_resumed_at ?? null
              }
            : u
        );
      }
      setTrialReady(true);
    }, (err) => {
      // network failure — don't hold the platform hostage to the trial stamp
      console.error("start_trial error:", err);
      if (!cancelled) setTrialReady(true);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, needsTrialStart]);

  if (authLoading) return <PlatformLoading />;

  if (!user) {
    // survives the OAuth round trip, unlike router state (see SignIn.jsx)
    const from = location.pathname + location.search;
    sessionStorage.setItem("signin_from", from);
    return <Navigate to="/signin" replace state={{ from }} />;
  }

  // a signed-in user always gets a username in AuthContext; if that failed
  // (network, DB error) show a way out instead of an endless blank screen
  if (!user.username) {
    return (
      <PlatformLoading
        failed
        onRetry={async () => {
          setRetrying(true);
          await refreshUser();
          setRetrying(false);
        }}
        retrying={retrying}
      />
    );
  }

  if (!trialReady) return <PlatformLoading />;

  return (
    <Routes>
      <Route index element={<Navigate to="profile" replace />} />
      <Route path="typetober/*" element={<Typetober platform />} />
      <Route path="*" element={<PublicProfile platform />} />
    </Routes>
  );
}

function PlatformLoading({ failed, onRetry, retrying }) {
  return (
    <div className="min-h-screen bg-evolve-black flex flex-col items-center justify-center gap-5 px-6 text-center">
      {failed ? (
        <>
          <p className="text-white text-base font-semibold">
            We couldn&apos;t finish setting up your account.
          </p>
          <p className="text-white/50 text-sm max-w-xs">
            Check your connection and try again.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onRetry}
              disabled={retrying}
              className="rounded-xl bg-evolve-yellow text-black font-semibold px-5 py-2.5 text-sm disabled:opacity-60"
            >
              {retrying ? "Retrying..." : "Try again"}
            </button>
            <Link
              to="/"
              className="rounded-xl border border-white/20 text-white font-semibold px-5 py-2.5 text-sm"
            >
              Go home
            </Link>
          </div>
        </>
      ) : (
        <span
          className="w-8 h-8 rounded-full border-2 border-white/15 border-t-evolve-yellow animate-spin"
          aria-label="Loading"
        />
      )}
    </div>
  );
}
