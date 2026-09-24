import OnboardingProgressBar from "./OnboardingProgressBar";

function GraduationCapIcon({ className }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 3l10 5-10 5L2 8l10-5z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M6 10.5v5c0 1.4 2.7 3 6 3s6-1.6 6-3v-5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M21 9v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function BriefcaseIcon({ className }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="7.5" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 7.5V6a2 2 0 012-2h4a2 2 0 012 2v1.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M3 12.5h18" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function ChevronRightIcon({ className }) {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ROLES = [
  {
    value: "student",
    Icon: GraduationCapIcon,
    title: "Student (ID Verification)",
    sub: "Get special student pricing with a valid college ID."
  },
  {
    value: "professional",
    Icon: BriefcaseIcon,
    title: "Professional & Recent Grad",
    sub: "Working, freelancing, or recently graduated and stepping up.",
    disabled: true
  }
];

/**
 * The very first onboarding screen for an individual sign-in — decides
 * between the Student path (fully built) and Professional & Recent Grad
 * (shown but disabled: that flow doesn't exist yet, only "student" ever
 * reaches handleRoleChoice — see the comment on it in Onboarding.jsx).
 */
export default function RoleChoiceStep({ onSelect, onBack }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
      style={{ backgroundColor: "#161618" }}
    >
      <div
        className="w-full max-w-lg mx-auto rounded-3xl border border-[#373737] p-6 sm:p-8 flex flex-col gap-6"
        style={{ backgroundColor: "#1c1c1f" }}
      >
        <OnboardingProgressBar step={1} total={3} />

        {onBack && (
          <button
            onClick={onBack}
            className="self-start flex items-center gap-1 text-white/40 text-xs font-semibold hover:text-white/70 transition-colors -mb-2"
          >
            <ChevronRightIcon className="rotate-180" />
            back
          </button>
        )}

        <div className="flex flex-col gap-2">
          <h1 className="text-white font-bold text-2xl sm:text-3xl leading-tight">
            So, which one's you?
          </h1>
          <p className="text-white/50 text-sm">
            No wrong answers here — just pick what fits today. We'll take you
            straight there.
          </p>
        </div>

        <div className="w-full flex flex-col gap-3">
          {ROLES.map((opt) => (
            <button
              key={opt.value}
              onClick={() => !opt.disabled && onSelect(opt.value)}
              disabled={opt.disabled}
              className="w-full text-left rounded-2xl border p-4 flex items-center gap-4 transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:border-white/25"
              style={{
                backgroundColor: "rgba(255,255,255,0.03)",
                borderColor: "#373737"
              }}
            >
              <span
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "rgba(163,91,251,0.15)", color: "#A35BFB" }}
              >
                <opt.Icon />
              </span>
              <span className="flex-1 flex flex-col gap-0.5 min-w-0">
                <span className="text-white font-bold text-base flex items-center gap-2">
                  {opt.title}
                  {opt.disabled && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-white/40 bg-white/5 rounded-full px-2 py-0.5">
                      coming soon
                    </span>
                  )}
                </span>
                <span className="text-white/50 text-xs leading-relaxed">{opt.sub}</span>
              </span>
              {!opt.disabled && (
                <ChevronRightIcon className="text-white/30 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
