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
