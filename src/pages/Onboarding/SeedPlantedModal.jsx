import GrowthMascot from "../../components/GrowthMascot";

/**
 * Final beat of onboarding — shown once the profile (and space, if any) is
 * actually saved, replacing the old editable "review" screen. There's
 * nothing left to confirm at this point, so this is just a landing moment
 * before handing the user off to their new space.
 */
export default function SeedPlantedModal({ onContinue, spaceName }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-8 px-6 text-center"
      style={{ backgroundColor: "#161618" }}
    >
      <div className="w-full max-w-xs rounded-3xl border border-evolve-yellow/25 bg-evolve-yellow/[0.06] px-8 py-10 flex flex-col items-center gap-4">
        <GrowthMascot progress={10} size={72} />
        <h1 className="text-white font-bold text-xl">your seed has been planted 🌱</h1>
        <p className="text-white/50 text-sm leading-relaxed">
          {spaceName
            ? `${spaceName} is live — time to start growing it.`
            : "your space is ready — time to start growing."}
        </p>
        <button
          onClick={onContinue}
          className="w-full bg-evolve-yellow text-evolve-black font-bold text-base rounded-2xl py-4 mt-2 active:scale-[0.98] transition-transform"
        >
          let's go →
        </button>
      </div>
    </div>
  );
}
