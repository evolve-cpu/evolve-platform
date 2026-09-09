const DAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

// No admin-set real datetime yet? Show a reasonable placeholder — the next
// occurrence of a preferred day/time, `weeksOut` weeks further out (used by
// sessions, which run on a weekly cadence from the single initial booking;
// job-application calls always pass weeksOut=0 since each is its own
// one-off booking) — so the page isn't empty while an admin hasn't
// attached the real Calendly-scheduled meeting yet.
export function nextOccurrence(preferredDay, preferredTime, weeksOut = 0) {
  const targetDow = DAY_INDEX[preferredDay];
  if (targetDow === undefined) return null;
  const [, hourStr, minStr, meridiem] = preferredTime.match(/(\d+):(\d+)\s*(AM|PM)/i) || [];
  if (!hourStr) return null;
  let hour = parseInt(hourStr, 10) % 12;
  if (/pm/i.test(meridiem)) hour += 12;

  const now = new Date();
  const result = new Date(now);
  result.setHours(hour, parseInt(minStr, 10), 0, 0);
  let dayDiff = (targetDow - now.getDay() + 7) % 7;
  if (dayDiff === 0 && result <= now) dayDiff = 7;
  result.setDate(result.getDate() + dayDiff + weeksOut * 7);
  return result;
}

export function fmtDateTime(d) {
  if (!d) return null;
  return {
    date: d.toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }),
    time: d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }) + " IST"
  };
}
