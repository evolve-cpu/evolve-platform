import { useState } from "react";
import GrowthMascot from "../../components/GrowthMascot";

const OPTIONS = [
  {
    value: "individual",
    emoji: "🌱",
    title: "myself",
    sub: "i'm building a personal space to track my design journey, showcase my work, and grow my career.",
    tags: ["individual", "personal portfolio", "career growth"]
  },
  {
    value: "team",
    emoji: "🏛️",
    title: "for my team",
    sub: "i'm setting up a space for a design institute, company, or studio — to showcase the team and grow together.",
    tags: ["design institute", "company", "studio"]
  }
];

export default function SpaceTypeStep({ onContinue }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16" style={{ backgroundColor: "#161618" }}>
      <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-6 text-center">
        <GrowthMascot progress={5} size={64} />

        <p className="text-evolve-lavender-indigo text-xs font-bold tracking-widest uppercase">
          your seed · waiting to be planted
        </p>
        <h1 className="text-white font-bold text-3xl md:text-4xl leading-tight">
          who are you creating<br />this evolve space for?
        </h1>
        <p className="text-white/50 text-sm max-w-sm">
          your answer shapes how we build your space and what features you'll have access to.
        </p>

        <div className="w-full flex flex-col gap-3 mt-4">
          {OPTIONS.map(opt => {
            const isSelected = selected === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setSelected(opt.value)}
                className="w-full text-left rounded-2xl border p-5 flex items-start gap-4 transition-colors"
                style={{
                  backgroundColor: isSelected ? "rgba(163,91,251,0.12)" : "rgba(255,255,255,0.04)",
                  borderColor: isSelected ? "rgba(163,91,251,0.8)" : "rgba(255,255,255,0.12)"
                }}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span className="flex flex-col gap-2">
                  <span className="text-white font-bold text-base">{opt.title}</span>
                  <span className="text-white/50 text-sm leading-relaxed">{opt.sub}</span>
                  <span className="flex flex-wrap gap-1.5 mt-1">
                    {opt.tags.map(t => (
                      <span key={t} className="text-[10px] font-semibold uppercase tracking-wide text-white/40 bg-white/5 rounded-full px-2 py-0.5">
                        {t}
                      </span>
                    ))}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => selected && onContinue(selected)}
          disabled={!selected}
          className="w-full bg-evolve-yellow text-evolve-black font-bold text-base rounded-2xl py-4 mt-2 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity active:scale-[0.98]"
        >
          continue →
        </button>
      </div>
    </div>
  );
}
