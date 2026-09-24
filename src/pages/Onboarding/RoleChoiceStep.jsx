const ROLES = [
  {
    value: "student",
    emoji: "🎓",
    title: "Student",
    sub: "Currently studying at a design school, college, or university."
  },
  {
    value: "professional",
    emoji: "💼",
    title: "Working professional",
    sub: "Already working in design. Coming soon.",
    disabled: true
  }
];

/**
 * The very first onboarding screen for an individual sign-in — decides
 * between the Student path (fully built) and Working Professional (shown
 * but disabled, that flow is defined in a later phase).
 */
export default function RoleChoiceStep({ onSelect }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
      style={{ backgroundColor: "#161618" }}
    >
      <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-6 text-center">
        <p className="text-evolve-lavender-indigo text-xs font-bold tracking-widest uppercase">
          welcome
        </p>
        <h1 className="text-white font-bold text-3xl md:text-4xl leading-tight">
          Which of these
          <br />
          sounds like you?
        </h1>
        <p className="text-white/50 text-sm max-w-sm">
          This shapes what we ask you next.
        </p>

        <div className="w-full flex flex-col gap-3 mt-4">
          {ROLES.map((opt) => (
            <button
              key={opt.value}
              onClick={() => !opt.disabled && onSelect(opt.value)}
              disabled={opt.disabled}
              className="w-full text-left rounded-2xl border p-5 flex items-start gap-4 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "rgba(255,255,255,0.04)",
                borderColor: "rgba(255,255,255,0.12)"
              }}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span className="flex flex-col gap-1.5">
                <span className="text-white font-bold text-base flex items-center gap-2">
                  {opt.title}
                  {opt.disabled && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-white/40 bg-white/5 rounded-full px-2 py-0.5">
                      coming soon
                    </span>
                  )}
                </span>
                <span className="text-white/50 text-sm leading-relaxed">{opt.sub}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
