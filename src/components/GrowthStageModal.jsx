import GrowthMascot from "./GrowthMascot";
import { stageForProgress, stageLabel } from "../lib/growthStage";

/**
 * Celebratory overlay shown whenever the growth mascot advances a stage
 * outside of onboarding (e.g. after a Portfolio Review payment, or after
 * submitting the intake form) — same card language as
 * Onboarding/SeedPlantedModal, just as a dialog over existing content
 * instead of a full-screen takeover.
 */
export default function GrowthStageModal({ progress, heading, message, onContinue }) {
  const stage = stageForProgress(progress);
  const label = stageLabel(progress);

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-evolve-black/40" onClick={onContinue} />
      <div
        className="relative w-full max-w-xs rounded-3xl border border-white/10 px-8 py-10 flex flex-col items-center gap-4 text-center"
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

        <h1 className="text-white font-bold text-xl mt-1">{heading}</h1>
        <p className="text-white/50 text-sm leading-relaxed">{message}</p>

        <GrowthMascot progress={progress} size={110} />

        <span className="text-evolve-inchworm text-sm font-bold capitalize">
          stage {stage} · {label}
        </span>

        <button
          onClick={onContinue}
          className="w-full bg-evolve-yellow text-evolve-black font-bold text-base rounded-2xl py-4 mt-2 active:scale-[0.98] transition-transform"
        >
          Keep going →
        </button>
      </div>
    </div>
  );
}
