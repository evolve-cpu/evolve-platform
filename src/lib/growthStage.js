// Maps a 0-100 growth/progress value onto one of the 242 frames of the
// "seed to plant" sprite sequence living in public/assets/seed_to_plant/.
const TOTAL_FRAMES = 242; // seed to plant_alpha000.png … alpha241.png

export function frameForProgress(progress) {
  const clamped = Math.max(0, Math.min(100, progress ?? 0));
  const index = Math.round((clamped / 100) * (TOTAL_FRAMES - 1));
  return index;
}

export function growthFrameSrc(progress) {
  const index = frameForProgress(progress);
  const padded = String(index).padStart(3, "0");
  return encodeURI(`/assets/seed_to_plant/seed to plant_alpha${padded}.png`);
}
