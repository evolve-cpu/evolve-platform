import GrowthMascot from "../../components/GrowthMascot";
import { stageForProgress, stageLabel } from "../../lib/growthStage";

/**
 * Final beat of onboarding — shown once the profile (and space, if any) is
 * actually saved, replacing the old editable "review" screen. There's
 * nothing left to confirm at this point, so this is just a landing moment
 * before handing the user off to their new space.
 */
export default function SeedPlantedModal({ onContinue, spaceName }) {
  const stage = stageForProgress(10);
  const label = stageLabel(10);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-8 px-6 text-center"
      style={{ backgroundColor: "#0d0d0e" }}
    >
      <div
        className="relative w-full max-w-xs rounded-3xl border border-white/10 px-8 py-10 flex flex-col items-center gap-4"
        style={{ backgroundColor: "#1c1c1e" }}
      >
        <button
          onClick={onContinue}
          aria-label="close"
          className="absolute top-4 right-4 w-7 h-7 rounded-full border border-white/10 bg-white/[0.04] flex items-center justify-center text-white/40 hover:text-white hover:border-white/25 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>

        <span className="text-evolve-inchworm text-[10px] font-bold uppercase tracking-wide bg-evolve-inchworm/10 rounded-full px-3 py-1">
          stage progress
        </span>

        <h1 className="text-white font-bold text-xl mt-1">your seed has been planted 🌱</h1>
        <p className="text-white/50 text-sm leading-relaxed">
          {spaceName
            ? `${spaceName} is live. every course, project and follow-through grows it further. come back often — it's watching.`
            : "every course, project and follow-through grows it further. come back often — it's watching."}
        </p>

        <GrowthMascot progress={10} size={110} />

        <span className="text-white/60 text-[11px] font-semibold bg-white/[0.05] border border-white/10 rounded-full px-3 py-1 capitalize">
          stage {stage} · {label}
        </span>

        <button
          onClick={onContinue}
          className="w-full bg-evolve-lavender-indigo text-white font-bold text-base rounded-2xl py-4 mt-2 active:scale-[0.98] transition-transform"
        >
          let's go
        </button>
      </div>
    </div>
  );
}
