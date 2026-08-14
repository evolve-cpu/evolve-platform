import { useState } from "react";
import GrowthMascot from "../../components/GrowthMascot";

const ORG_TYPES = [
  { value: "institute", emoji: "🎓", title: "Design institute", sub: "A college, school, or bootcamp" },
  { value: "company", emoji: "🏢", title: "Company / studio", sub: "A design team, studio, or startup" }
];

export default function TeamSetupStep({ onBack, onContinue, presetOrgType }) {
  const [name, setName] = useState("");
  const [orgType, setOrgType] = useState(presetOrgType || null);

  const canContinue = name.trim().length > 1 && orgType;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16" style={{ backgroundColor: "#161618" }}>
      <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-6 text-center">
        <GrowthMascot progress={12} size={64} />

        <p className="text-evolve-lavender-indigo text-xs font-bold tracking-widest uppercase">
          account setup · step 2 of 2
        </p>
        <h1 className="text-white font-bold text-3xl md:text-4xl leading-tight">
          Tell us about your team.
        </h1>
        <p className="text-white/50 text-sm max-w-sm">
          This creates your team space — you can invite members and manage it any time from there.
        </p>

        <div className="w-full flex flex-col gap-4 mt-2 text-left">
          <div>
            <label className="text-white/40 text-xs font-semibold uppercase tracking-wide mb-2 block">
              institute or company name
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Northgate Design School"
              className="w-full border border-white/15 rounded-2xl px-5 py-4 text-white placeholder-white/30 text-base outline-none focus:border-evolve-yellow/60 transition-colors"
              style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
            />
          </div>

          <div className="flex flex-col gap-2" style={{ display: presetOrgType ? "none" : undefined }}>
            {ORG_TYPES.map(t => {
              const isSelected = orgType === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => setOrgType(t.value)}
                  className="w-full text-left rounded-2xl border p-4 flex items-center gap-3 transition-colors"
                  style={{
                    backgroundColor: isSelected ? "rgba(163,91,251,0.12)" : "rgba(255,255,255,0.04)",
                    borderColor: isSelected ? "rgba(163,91,251,0.8)" : "rgba(255,255,255,0.12)"
                  }}
                >
                  <span className="text-xl">{t.emoji}</span>
                  <span>
                    <span className="text-white font-semibold text-sm block">{t.title}</span>
                    <span className="text-white/40 text-xs">{t.sub}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-full flex gap-3 mt-2">
          <button
            onClick={onBack}
            className="flex-1 border border-white/20 text-white font-semibold text-sm rounded-2xl py-4 active:opacity-80"
          >
            Back
          </button>
          <button
            onClick={() => canContinue && onContinue({ name: name.trim(), org_type: orgType })}
            disabled={!canContinue}
            className="flex-[2] bg-evolve-yellow text-evolve-black font-bold text-base rounded-2xl py-4 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity active:scale-[0.98]"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}
