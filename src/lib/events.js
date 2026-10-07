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
