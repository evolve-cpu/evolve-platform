import { useState } from "react";
import GrowthMascot from "../../components/GrowthMascot";

const ORG_TYPES = [
  {
    value: "institute",
    emoji: "🎓",
    title: "design institute",
    sub: "a college, design school, or coaching institute — set up a space for your faculty and students.",
    tags: ["college", "design school", "bootcamp"]
  },
  {
    value: "company",
    emoji: "🏢",
    title: "company / studio",
    sub: "a design team, studio, or startup — set up a space for your team.",
    tags: ["studio", "startup", "in-house team"]
  }
];

/**
 * Shown right after "for my team" is picked in SpaceTypeStep — decides which
 * flavor of team onboarding to run. Institute picks the rich, link-fetch-driven
 * self-serve flow (Door 2); company falls back to the existing lightweight
 * team-setup flow until that door gets its own shape.
 */
export default function OrgTypeStep({ onBack, onContinue }) {
  const [selected, setSelected] = useState(null);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
      style={{ backgroundColor: "#161618" }}
    >
      <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-6 text-center">
        {/* <GrowthMascot progress={8} size={64} /> */}

        <p className="text-evolve-lavender-indigo text-xs font-bold tracking-widest uppercase">
          team setup · step 1
        </p>
        <h1 className="text-white font-bold text-3xl md:text-4xl leading-tight">
          what kind of space
          <br />
          are you setting up?
        </h1>
        <p className="text-white/50 text-sm max-w-sm">
          this shapes the questions we ask next and how your space gets built.
        </p>

        <div className="w-full flex flex-col gap-3 mt-4">
          {ORG_TYPES.map((opt) => {
            const isSelected = selected === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setSelected(opt.value)}
                className="w-full text-left rounded-2xl border p-5 flex items-start gap-4 transition-colors"
                style={{
                  backgroundColor: isSelected
                    ? "rgba(163,91,251,0.12)"
                    : "rgba(255,255,255,0.04)",
                  borderColor: isSelected
                    ? "rgba(163,91,251,0.8)"
                    : "rgba(255,255,255,0.12)"
                }}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span className="flex flex-col gap-2">
                  <span className="text-white font-bold text-base">
                    {opt.title}
                  </span>
                  <span className="text-white/50 text-sm leading-relaxed">
                    {opt.sub}
                  </span>
                  <span className="flex flex-wrap gap-1.5 mt-1">
                    {opt.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-semibold uppercase tracking-wide text-white/40 bg-white/5 rounded-full px-2 py-0.5"
                      >
                        {t}
                      </span>
                    ))}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="w-full flex gap-3 mt-2">
          <button
            onClick={onBack}
            className="flex-1 border border-white/20 text-white font-semibold text-sm rounded-2xl py-4 active:opacity-80"
          >
            back
          </button>
          <button
            onClick={() => selected && onContinue(selected)}
            disabled={!selected}
            className="flex-[2] bg-evolve-yellow text-evolve-black font-bold text-base rounded-2xl py-4 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity active:scale-[0.98]"
          >
            continue →
          </button>
        </div>
      </div>
    </div>
  );
}
