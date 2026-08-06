import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/* ─── Sunburst SVG (inside the card) ─────────────────────────────────────── */
function Sunburst() {
  return (
    <svg
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {Array.from({ length: 24 }).map((_, i) => {
        const a1 = (i / 24) * 2 * Math.PI;
        const a2 = ((i + 0.5) / 24) * 2 * Math.PI;
        const R  = 600;
        return (
          <polygon
            key={i}
            points={`200,200 ${200 + Math.cos(a1) * R},${200 + Math.sin(a1) * R} ${200 + Math.cos(a2) * R},${200 + Math.sin(a2) * R}`}
            fill={i % 2 === 0 ? "#FFD007" : "#FFC300"}
          />
        );
      })}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   WelcomeOverlay
   — rendered at App level, above all routes
   — triggered by sessionStorage.show_welcome_overlay after sign-in
   — design: dark dimmed backdrop + yellow sunburst card slides up from bottom
══════════════════════════════════════════════════════════════════════════════ */
export default function WelcomeOverlay() {
  const { user, isNewUser } = useAuth();
  const location            = useLocation();
  const navigate            = useNavigate();

  const [visible, setVisible] = useState(false);
  const [sheetUp, setSheetUp] = useState(false);
  const [leaving, setLeaving] = useState(false);

  /* ── check flag on every route change AND when user loads ────────────────
     Why both? For email OTP flow: the flag is set inside a setTimeout in
     SignIn, so by the time location changes (after navigate), the flag exists.
     For Google OAuth: flag is set before navigate, so user-change alone works.
  ─────────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!user) return;
    // onboarding isn't forced at sign-in — an incomplete profile just means no
    // welcome yet; this fires once onboarding actually finishes and lands them
    // somewhere (e.g. their new profile), since the onboarding flow itself is
    // their "welcome," not this overlay
    if (!user.onboarding_completed) return;
    const flag = sessionStorage.getItem("show_welcome_overlay") || localStorage.getItem("show_welcome_overlay");
    if (!flag) return;

    // OAuth fallback: if Supabase redirected to the wrong page (e.g. site root instead
    // of the original page), redirect there now before showing the overlay.
    const signinFrom = localStorage.getItem("signin_from") || sessionStorage.getItem("signin_from");
    if (signinFrom) {
      localStorage.removeItem("signin_from");
      sessionStorage.removeItem("signin_from");
      if (signinFrom !== location.pathname) {
        // Navigate to the correct page; effect re-fires on location change and shows overlay
        navigate(signinFrom, { replace: true });
        return;
      }
    }

    // OAuth landed on the generic "/" (no specific page was requested) — send an
    // already-onboarded user to their own profile instead of the landing page.
    const wasDefaultLanding = localStorage.getItem("oauth_default_landing") === "1";
    localStorage.removeItem("oauth_default_landing");
    if (wasDefaultLanding && user.username) {
      sessionStorage.removeItem("show_welcome_overlay");
      localStorage.removeItem("show_welcome_overlay");
      navigate(`/profile/${user.username}`, { replace: true });
      return;
    }

    sessionStorage.removeItem("show_welcome_overlay");
    localStorage.removeItem("show_welcome_overlay");
    setSheetUp(false);
    setVisible(true);
    // slight delay so the destination page paints first
    setTimeout(() => setSheetUp(true), 100);
  }, [user, location.pathname]);

  function dismiss() {
    if (leaving) return;
    setLeaving(true);
    setSheetUp(false);
    setTimeout(() => { setVisible(false); setLeaving(false); }, 520);
  }

  if (!visible) return null;

  return (
    /* ── fixed overlay ─────────────────────────────────────────────────────── */
    <div className="fixed inset-0 z-[200] flex flex-col justify-end">

      {/* dark backdrop — dims the page behind */}
      <div
        className="absolute inset-0 bg-evolve-black/60"
        style={{
          opacity:    sheetUp ? 1 : 0,
          transition: "opacity 0.4s ease"
        }}
      />

      {/* ── yellow card slides up ────────────────────────────────────────────── */}
      <div
        className="relative w-full md:max-w-md md:mx-auto md:mb-10 md:rounded-3xl overflow-hidden rounded-t-[32px] border-2 border-evolve-yellow/40"
        style={{
          backgroundColor: "rgba(255,208,7,1)",
          transform:  sheetUp ? "translateY(0)" : "translateY(110%)",
          transition: "transform 0.5s cubic-bezier(0.32, 0.72, 0, 1)",
          boxShadow: "0 -4px 40px rgba(255,208,7,0.35)"
        }}
      >
        {/* sunburst rays on top of solid yellow base */}
        <Sunburst />

        {/* content above sunburst */}
        <div className="relative z-10 px-6 pt-10 pb-12 flex flex-col items-center gap-4">
          <h2 className="text-evolve-black font-bold text-2xl text-center">
            {isNewUser ? "welcome to evolve." : "welcome back to evolve."}
          </h2>

          {/* avatar */}
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt="avatar"
              className="w-20 h-20 rounded-full object-cover border-4 border-white/50 shadow-md"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-evolve-black flex items-center justify-center shadow-md">
              <span className="text-3xl font-bold text-evolve-yellow">
                {(user?.name || "U")[0].toUpperCase()}
              </span>
            </div>
          )}

          {user?.name && (
            <p className="text-evolve-black font-semibold text-base">{user.name}</p>
          )}

          <button
            onClick={dismiss}
            className="w-full bg-evolve-black text-white font-bold text-base rounded-2xl py-4 mt-2 active:opacity-80"
          >
            all set, let's go
          </button>
        </div>
      </div>
    </div>
  );
}
