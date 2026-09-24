import { useEffect, useState } from "react";

// The "your 14-day free trial has started" bottom sheet shown once when the
// owner first lands on their own platform page. Bottom sheet on mobile,
// centered card on desktop — same shell pattern as the other modals in this
// codebase (see the logout/delete confirm dialogs in PublicProfile.jsx),
// just slide-up instead of fade-in so it reads as a sheet, not an alert.
export default function TrialSheet({ daysLeft, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 220);
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end md:items-center md:justify-center">
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        onClick={handleClose}
      />
      <div
        className={`relative w-full md:max-w-sm rounded-t-3xl md:rounded-3xl border border-[#373737] p-6 pb-8 md:pb-6 flex flex-col items-center text-center gap-4 transition-transform duration-300 ${
          visible ? "translate-y-0" : "translate-y-full md:translate-y-8"
        }`}
        style={{ backgroundColor: "#1c1c1f" }}
      >
        <div className="w-10 h-1 rounded-full bg-white/15 md:hidden" />
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "rgba(255,208,7,0.12)" }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#FFD007" strokeWidth="2" />
            <path
              d="M12 7v5l3.5 2"
              stroke="#FFD007"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">
            Your 14-day free trial has started
          </h3>
          <p className="text-white/50 text-sm mt-1.5 leading-relaxed">
            Full access to your profile and everything in Grow for the next{" "}
            {daysLeft ?? 14} days — no card needed.
          </p>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="w-full bg-evolve-yellow text-evolve-black font-extrabold text-sm rounded-2xl px-6 py-3.5 active:opacity-80 transition-opacity"
        >
          Let's go
        </button>
      </div>
    </div>
  );
}
