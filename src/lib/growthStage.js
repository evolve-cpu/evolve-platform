import { GROWTH_STAGES } from "../assets/images/GrowthStages";

// Maps a 0-100 growth/progress value onto one of the 10 seed→sprout
// illustrations in src/assets/images/GrowthStages/ — stage 1 (bare seed) at
// progress 0, stage 10 (sprouted) at progress 100.
const TOTAL_STAGES = GROWTH_STAGES.length;

export const STAGE_LABELS = [
  "seed",
  "sprouting",
  "sprouting",
  "budding",
  "budding",
  "budding",
  "growing",
  "growing",
  "blooming",
  "blooming"
];

export function stageForProgress(progress) {
  const clamped = Math.max(0, Math.min(100, progress ?? 0));
  const stage = Math.max(1, Math.ceil((clamped / 100) * TOTAL_STAGES));
  return Math.min(TOTAL_STAGES, stage);
}

export function growthFrameSrc(progress) {
  const stage = stageForProgress(progress);
  return GROWTH_STAGES[stage - 1];
}

export function stageLabel(progress) {
  const stage = stageForProgress(progress);
  return STAGE_LABELS[stage - 1];
}
