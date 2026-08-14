// Shared "how it works" step layout for programme pages (Portfolio Review's
// "the process", Mentorship's "our framework") — a simple vertical timeline,
// same on every breakpoint.
export default function ProcessSteps({ steps, prefix = true }) {
  return (
    <div className="flex flex-col gap-0">
      {steps.map((s, i) => (
        <div
          key={s.title}
          className="relative pl-7 pb-7 border-l-2 border-white/10 last:border-transparent last:pb-0"
        >
          <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-evolve-yellow" />
          <p className="text-evolve-yellow font-bold text-sm font-bricolage">
            {prefix ? `step ${i + 1} — ${s.title}` : s.title}
          </p>
          <p className="text-white/40 text-sm mt-1 leading-relaxed">{s.body}</p>
        </div>
      ))}
    </div>
  );
}
