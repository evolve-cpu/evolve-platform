// Typetober — shared constants + date math.
// One letter unlocks per calendar day, Oct 1 (A) through Oct 26 (Z).

export const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Cycled per-letter accent, pulled straight from the evolve palette
// (tailwind.config.ts `colors.evolve-*`) rather than hex duplicated here.
export const ACCENTS = [
  "rgba(255,208,7,1)", // evolve-yellow
  "rgba(223,5,134,1)", // evolve-pink
  "rgba(163,91,251,1)", // evolve-lavender-indigo
  "rgba(194,253,92,1)", // evolve-inchworm
  "rgba(1,241,217,1)", // evolve-bright-turquoise
  "rgba(235,83,40,1)" // evolve-flame
];

export const accentFor = (i) => ACCENTS[i % ACCENTS.length];

export const CERT_TIERS = [
  { key: "bronze", need: 10, label: "Bronze", color: "#E28B4F" },
  { key: "silver", need: 18, label: "Silver", color: "#D9DDE8" },
  { key: "gold", need: 26, label: "Gold", color: "#FFD007" }
];

/**
 * Which year's October this challenge points at. Once this year's window
 * (Oct 1 – Oct 31) has fully passed, roll forward to next year rather than
 * needing a code change every twelve months.
 */
export function getEventYear() {
  const now = new Date();
  const y = now.getFullYear();
  const afterWindow = new Date(y, 10, 1); // Nov 1
  return now >= afterWindow ? y + 1 : y;
}

/** Calendar date (local) that letter `i` (0=A .. 25=Z) unlocks on. */
export function dateForLetter(i, year = getEventYear()) {
  return new Date(year, 8, i + 1); // month 9 = October
}

/**
 * How many letters are open for submission right now.
 * 0  → event hasn't started yet (before Oct 1)
 * 1-26 → that many letters (A.. ) are open, most recent = "today"
 * 26 → also covers "event is over", so the full board stays browsable/postable-to
 */
export function getCurrentDay(year = getEventYear()) {
  const now = new Date();
  const start = new Date(year, 8, 1);
  const end = new Date(year, 10, 1); // Nov 1 — exclusive
  if (now < start) return 0;
  if (now >= end) return 26;
  const diffDays = Math.floor((now - start) / 86400000);
  return Math.min(26, diffDays + 1);
}

export function ordinalOctDate(letterIndex, year = getEventYear()) {
  return `Oct ${letterIndex + 1}`;
}

export function formatCountdown(year = getEventYear()) {
  const start = new Date(year, 9, 1);
  const diff = start.getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  return { days, hours };
}
