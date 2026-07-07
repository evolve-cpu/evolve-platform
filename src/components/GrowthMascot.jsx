import { growthFrameSrc } from "../lib/growthStage";

/**
 * Renders the seed→sprout→plant illustration at the frame matching `progress`
 * (0-100). Used across onboarding, the review step, and the public profile
 * header so the same growth visual follows the user through the journey.
 */
export default function GrowthMascot({ progress = 0, size = 72, className = "" }) {
  return (
    <img
      src={growthFrameSrc(progress)}
      alt="your growth"
      width={size}
      height={size}
      className={`select-none pointer-events-none object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
