/**
 * Which days/times a learner can pick on the weekly "Book a slot" step.
 * Everyone gets DEFAULT_SLOT_CONFIG; a learner with special availability gets
 * an entry in SLOT_OVERRIDES keyed by their (lower-cased) account email.
 *
 * All times are IST. A time like "2:00 AM" on "Mon" means Monday 2 AM IST
 * (the early hours of Monday) — same as events-notify's weeklySessionTimes,
 * which turns the saved day/time into the real 5-session calendar series.
 * The DB accepts Mon–Fri and any "H:MM AM/PM" (mentorship_bookings_flexible_slots.sql).
 */

// "10:00 PM", "11:00 PM", "12:00 AM", ... for each whole hour from `startHour`
// (24h) for `count` hours, wrapping past midnight
function hourlySlots(startHour, count) {
  return Array.from({ length: count }, (_, i) => {
    const h = (startHour + i) % 24;
    return `${h % 12 === 0 ? 12 : h % 12}:00 ${h < 12 ? "AM" : "PM"}`;
  });
}

export const DEFAULT_SLOT_CONFIG = {
  layout: "chips",
  days: ["Mon", "Tue", "Wed", "Thu"],
  times: ["9:00 PM", "10:00 PM", "11:00 PM"],
  subtitle: "You'll be meeting Yagnesh Ahir for 5 consecutive sessions during your selected day and time."
};

export const SLOT_OVERRIDES = {
  // Mon–Fri, any 1-hour slot between 10 PM and 10 AM IST (last start 9 AM)
  "aditimahajan.work@gmail.com": {
    layout: "dropdown",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    times: hourlySlots(22, 12),
    subtitle:
      "Choose a weekly day and time that works best for you. You'll meet at this same slot for the next 5 weeks."
  }
};

export function getSlotConfig(email) {
  return SLOT_OVERRIDES[String(email || "").trim().toLowerCase()] || DEFAULT_SLOT_CONFIG;
}

export const DAY_NAMES = {
  Sun: "Sunday", Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday"
};
const DAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const IST_OFFSET_MS = 5.5 * 3600000;
const MIN_LEAD_MS = 2 * 3600000; // keep in sync with MENTORSHIP_MIN_LEAD_MS in events-notify
const SESSIONS = 5;

/**
 * The 5 weekly session start times (as Dates) the server will create for an
 * IST day/time — a client copy of events-notify's weeklySessionTimes, so the
 * page can show the exact dates before booking. `now` is injectable for testing.
 */
export function weeklySessionTimes(day, time, now = Date.now()) {
  const targetDow = DAY_INDEX[day];
  const [, hourStr, minStr, meridiem] = String(time || "").match(/(\d+):(\d+)\s*(AM|PM)/i) || [];
  if (targetDow === undefined || !hourStr) return null;
  let hour = parseInt(hourStr, 10) % 12;
  if (/pm/i.test(meridiem)) hour += 12;

  const nowIst = new Date(now + IST_OFFSET_MS);
  const firstIst = new Date(nowIst);
  firstIst.setUTCHours(hour, parseInt(minStr, 10), 0, 0);
  firstIst.setUTCDate(firstIst.getUTCDate() + ((targetDow - nowIst.getUTCDay() + 7) % 7));
  if (firstIst.getTime() - nowIst.getTime() < MIN_LEAD_MS) firstIst.setUTCDate(firstIst.getUTCDate() + 7);
  const first = firstIst.getTime() - IST_OFFSET_MS;
  return Array.from({ length: SESSIONS }, (_, i) => new Date(first + i * 7 * 86400000));
}

const IST = "Asia/Kolkata";
export const fmtIstDate = (d, opts = {}) =>
  d.toLocaleDateString("en-IN", { timeZone: IST, day: "numeric", month: "short", ...opts });
export const fmtIstTime = (d) =>
  d.toLocaleTimeString("en-IN", { timeZone: IST, hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase();

// "10:00 PM" -> "10:00 PM – 11:00 PM"
export function slotRange(time) {
  const [, h, m, mer] = String(time).match(/(\d+):(\d+)\s*(AM|PM)/i) || [];
  if (!h) return time;
  let hour = (parseInt(h, 10) % 12) + (/pm/i.test(mer) ? 12 : 0);
  hour = (hour + 1) % 24;
  return `${time} – ${hour % 12 === 0 ? 12 : hour % 12}:${m} ${hour < 12 ? "AM" : "PM"}`;
}
