// Shared "how it works" step layout for programme pages (Portfolio Review's
// "the process", Mentorship's "our framework") — a staircase of steps
// ascending left to right on desktop, falling back to a simple vertical
// timeline on mobile where there's no room for the stagger.
export default function ProcessSteps({ steps }) {
  return (
    <div>
      <div className="hidden md:flex items-end gap-8">
        {steps.map((s, i) => (
          <div
            key={s.title}
            className="flex-1 min-w-0 border-t-2 border-evolve-yellow pt-4"
            style={{ marginBottom: i * 32 }}
          >
            <p className="text-evolve-yellow font-bold text-sm whitespace-nowrap">
              step {i + 1} — {s.title}
            </p>
            <p className="text-white/40 text-xs mt-1.5 leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>

      <div className="flex md:hidden flex-col gap-0">
        {steps.map((s, i) => (
          <div key={s.title} className="relative pl-7 pb-7 border-l-2 border-white/10 last:border-transparent last:pb-0">
            <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-evolve-yellow" />
            <p className="text-evolve-yellow font-bold text-sm">
              step {i + 1} — {s.title}
            </p>
            <p className="text-white/40 text-sm mt-1 leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
