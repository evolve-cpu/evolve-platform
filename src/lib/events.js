// One rule for "is this event over?", shared by every list and the event
// page: it's past once it has ENDED (end_time, or an hour after the start
// when no end is set) — so a session that's live right now still counts as
// upcoming, and moves to Past on its own the moment it finishes. No admin
// action or status change needed.
const DEFAULT_LENGTH_MS = 60 * 60 * 1000;

export function eventEndsAt(ev) {
  if (ev?.end_time) return new Date(ev.end_time).getTime();
  return new Date(ev?.start_time).getTime() + DEFAULT_LENGTH_MS;
}

export function isEventOver(ev, now = Date.now()) {
  return eventEndsAt(ev) < now;
}

// for .gte() filters that should keep live sessions in "upcoming"
export function upcomingCutoffIso() {
  return new Date(Date.now() - DEFAULT_LENGTH_MS * 6).toISOString();
}

// started but not ended yet — "Live now" in the lists
export function isEventLive(ev, now = Date.now()) {
  return new Date(ev?.start_time).getTime() <= now && !isEventOver(ev, now);
}

// Why registration is closed, or null while it's open. Mirrors the
// event_registration_rules trigger (events_registration_controls.sql),
// which is what actually refuses the insert. `going` = confirmed count.
export function registrationClosedReason(ev, going = 0, now = Date.now()) {
  if (!ev) return null;
  if (isEventOver(ev, now)) return "ended";
  if (ev.registration_open === false) return "closed";
  if (ev.registration_closes_at && new Date(ev.registration_closes_at).getTime() <= now) return "closed";
  if (!ev.requires_approval && ev.capacity != null && going >= ev.capacity) return "full";
  return null;
}

// ── recurring sessions ─────────────────────────────────────────────────
// Every occurrence is its own events row; rows sharing a series_id are one
// series and each carries the same `recurrence`:
//   { freq: "daily" | "weekly" | "monthly", interval, weekdays: [0-6],
//     ends: { type: "never" | "on" | "after", date, count }, slug }
// Weekdays/dates are India time. IST has no DST, so stepping whole days in
// UTC keeps the same IST wall-clock time. The events-notify edge function
// has a copy of seriesOccurrences for topping up open-ended series — keep
// the two in step.
const DAY_MS = 24 * 60 * 60 * 1000;
const IST_MS = 5.5 * 60 * 60 * 1000;
export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
// how far ahead an open-ended ("never ends") series is created
export const SERIES_HORIZON_DAYS = 28;

export function seriesOccurrences(firstStartIso, rec, { horizonMs, max = 60 } = {}) {
  const first = new Date(firstStartIso).getTime();
  if (!rec?.freq) return [first];
  const interval = Math.max(1, parseInt(rec.interval, 10) || 1);
  const ends = rec.ends || { type: "never" };
  const count = ends.type === "after" ? Math.max(1, parseInt(ends.count, 10) || 1) : Infinity;
  const until = Math.min(
    ends.type === "on" && ends.date ? new Date(`${ends.date}T23:59:59+05:30`).getTime() : Infinity,
    horizonMs ?? (ends.type === "never" ? Date.now() + SERIES_HORIZON_DAYS * DAY_MS : Infinity),
    first + 366 * DAY_MS
  );
  const firstIst = new Date(first + IST_MS);
  const weekdays = rec.freq === "weekly" && rec.weekdays?.length ? rec.weekdays : [firstIst.getUTCDay()];
  const firstWeekStart = first - firstIst.getUTCDay() * DAY_MS;
  const out = [];
  for (let t = first; t <= until && out.length < Math.min(count, max); t += DAY_MS) {
    const d = new Date(t + IST_MS);
    const days = Math.round((t - first) / DAY_MS);
    let hit = t === first;
    if (rec.freq === "daily") hit = days % interval === 0;
    else if (rec.freq === "weekly")
      hit = hit || (weekdays.includes(d.getUTCDay()) && Math.floor(Math.round((t - firstWeekStart) / DAY_MS) / 7) % interval === 0);
    else if (rec.freq === "monthly") {
      const months = (d.getUTCFullYear() - firstIst.getUTCFullYear()) * 12 + d.getUTCMonth() - firstIst.getUTCMonth();
      hit = d.getUTCDate() === firstIst.getUTCDate() && months % interval === 0;
    }
    if (hit) out.push(t);
  }
  return out;
}

export function describeRecurrence(rec) {
  if (!rec?.freq) return "";
  const n = Math.max(1, parseInt(rec.interval, 10) || 1);
  const unit = { daily: "day", weekly: "week", monthly: "month" }[rec.freq];
  let s = n === 1 ? `Every ${unit}` : `Every ${n} ${unit}s`;
  if (rec.freq === "weekly" && rec.weekdays?.length) {
    s += ` on ${[...rec.weekdays].sort().map((d) => WEEKDAYS[d]).join(", ")}`;
  }
  if (rec.ends?.type === "on" && rec.ends.date) s += `, until ${rec.ends.date}`;
  if (rec.ends?.type === "after") s += `, ${rec.ends.count} times`;
  return s;
}

// Public upcoming lists show one card per series — its next session.
export function collapseSeries(events) {
  const seen = new Set();
  return events.filter((e) => {
    if (!e.series_id) return true;
    if (seen.has(e.series_id)) return false;
    seen.add(e.series_id);
    return true;
  });
}

// Typetober isn't a row in `events` — it's a month-long challenge (Oct 1–31)
// that the platform's event lists pin alongside the real events.
export const TYPETOBER_EVENT = {
  title: "Typetober",
  description: "One letter a day, A to Z. Post yours to the wall and climb the leaderboard.",
  thumb:
    "https://res.cloudinary.com/diuswhkzn/image/upload/v1791456141/Typetober_thumbnail_z5s1fa.png",
  path: "/app/typetober"
};

export function typetoberWindow(now = new Date()) {
  const y = now.getFullYear();
  return { start: new Date(y, 9, 1), end: new Date(y, 10, 1) };
}

export function isTypetoberLive(now = new Date()) {
  const { start, end } = typetoberWindow(now);
  return now >= start && now < end;
}
