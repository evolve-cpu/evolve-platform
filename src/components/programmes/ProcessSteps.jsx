// Shared "how it works" step layout for programme pages (Portfolio Review's
// "the process", Mentorship's "our framework") — a staircase of steps
// ascending left to right on desktop: each step is a "tread" (title + body,
// underlined) connected to the next by a vertical "riser" line, falling back
// to a simple vertical timeline on mobile where there's no room to stagger.
const UNIT = 58;

export default function ProcessSteps({ steps, prefix = true }) {
  return (
    <div>
      <div
        className="hidden md:grid items-end gap-8 pb-2"
        style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
      >
        {steps.map((s, i) => (
          <div key={s.title} className="relative" style={{ marginBottom: i * UNIT }}>
            <div className="pr-4 pb-3.5 border-b-2 border-evolve-yellow">
              <p className="text-evolve-yellow font-bold text-sm font-bricolage mb-2 whitespace-nowrap">
                {prefix ? `step ${i + 1} — ${s.title}` : s.title}
              </p>
              <p className="text-white/45 text-xs leading-relaxed">{s.body}</p>
            </div>
            {i < steps.length - 1 && (
              <span
                className="absolute right-0 w-[2px] bg-evolve-yellow"
                style={{ bottom: -2, height: UNIT }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex md:hidden flex-col gap-0">
        {steps.map((s, i) => (
          <div key={s.title} className="relative pl-7 pb-7 border-l-2 border-white/10 last:border-transparent last:pb-0">
            <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-evolve-yellow" />
            <p className="text-evolve-yellow font-bold text-sm font-bricolage">
              {prefix ? `step ${i + 1} — ${s.title}` : s.title}
            </p>
            <p className="text-white/40 text-sm mt-1 leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
