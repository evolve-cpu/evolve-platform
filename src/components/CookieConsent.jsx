import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CONSENT_KEY, applyConsent } from "../lib/clarity";

// Accept / reject cookies banner. The choice is kept in localStorage and
// handed to Clarity + Google Analytics consent (src/lib/clarity.js); a
// returning visitor's stored choice is applied in index.html before either
// script runs, so this only shows until someone picks.
export default function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let stored = null;
    try {
      stored = localStorage.getItem(CONSENT_KEY);
    } catch {
      // storage blocked — ask anyway, the choice just won't stick
    }
    if (stored !== "accepted" && stored !== "rejected") {
      const t = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  function choose(accepted) {
    try {
      localStorage.setItem(CONSENT_KEY, accepted ? "accepted" : "rejected");
    } catch {
      // ignore
    }
    applyConsent(accepted);
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed z-[8000] bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-sm rounded-2xl border border-[#373737] p-5 flex flex-col gap-4 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
      style={{ backgroundColor: "#1c1c1f" }}
    >
      <div className="flex flex-col gap-1.5">
        <p className="text-white font-bold text-sm">We use cookies 🍪</p>
        <p className="text-white/50 text-xs leading-relaxed">
          We use analytics cookies to understand how evolve is used and make it
          better. You can accept or reject them — the site works either way.{" "}
          <Link to="/privacy" className="text-white/70 underline hover:text-white">
            Privacy policy
          </Link>
        </p>
      </div>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => choose(false)}
          className="flex-1 text-white font-bold text-xs rounded-xl border border-[#373737] hover:bg-[#232325] px-4 py-2.5 transition-colors"
        >
          Reject cookies
        </button>
        <button
          type="button"
          onClick={() => choose(true)}
          className="flex-1 bg-evolve-yellow text-evolve-black font-bold text-xs rounded-xl px-4 py-2.5 hover:opacity-90 transition-opacity"
        >
          Accept cookies
        </button>
      </div>
    </div>
  );
}
