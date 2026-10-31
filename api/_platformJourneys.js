// Journeys: the path people take through the site and the platform, for
// the admin platform report's Journeys view (ops "platform_journeys" and
// "platform_user_journey" in api/admin.js).
//
// A session is one tab's visit (src/lib/platformAnalytics.js starts a new
// one after 30 minutes idle). Its steps, in time order:
//   page    every page opened (analytics_steps), named by pageName() below
//   cta     a sign-up CTA click (analytics_events)
//   action  something that already has its own table: signed up, built the
//           AI profile, asked for verification, submitted a portfolio
//           review, enrolled in mentorship, registered for an event, paid.
//           Placed in the user's session running at that moment.
// The session ends with "Left" when the tab was closed / left the site.
//
// Sessions before sign-up are tied to the account through the visitor id
// (same browser), so a journey can start before the person had an account.
// The evolve team is left out, as in _platformReport.js.
// The leading underscore keeps Vercel from deploying this as a function.

import {
  TEAM_DOMAIN,
  addDays,
  fetchAll,
  hostOf,
  istDayStartIso,
  soft,
  tally,
  windows
} from "./_platformReport.js";

const LEFT = "Left";
const ACTION_SLACK_MS = 30 * 60000; // an action this close to a session belongs to it

const APP_PAGES = {
  profile: "App · My Profile",
  grow: "App · Grow",
  "grow/portfolio-review": "App · Portfolio review",
  "grow/mentorship": "App · Mentorship",
  events: "App · Events",
  community: "App · Community",
  account: "App · Account",
  "account/details": "App · Account",
  "account/invoice": "App · Account"
};
const SITE_PAGES = {
  "": "Home",
  signin: "Sign-in page",
  about: "About",
  grow: "Grow (site)",
  community: "Community (site)",
  events: "Events (site)",
  mentorship: "Mentorship (site)",
  "portfolio-review": "Portfolio review (site)",
  "profile-creation": "Profile creation (site)",
  pricing: "Pricing",
  webinars: "Webinars",
  institutions: "Institutions",
  corporates: "Corporates",
  payment: "Payment",
  onboarding: "Onboarding",
  contact: "Contact",
  typetober: "Typetober"
};

/** "/app/grow/portfolio-review" → "App · Portfolio review" */
export function pageName(path = "/") {
  const p = path.replace(/\/+$/, "").replace(/^\/+/, "");
  if (p === "app" || p.startsWith("app/")) {
    const rest = p.slice(4);
    if (rest.startsWith("events/")) return "App · Event detail";
    return APP_PAGES[rest] || APP_PAGES[rest.split("/")[0]] || "App · My Profile";
  }
  const [first, second] = p.split("/");
  if (first === "profile" && second) return "Public profile";
  if (first === "events" && second) return "Event page";
  if (first === "institute" || first === "space") return "Institute page";
  if (first === "invite") return "Invite link";
  if (first in SITE_PAGES) return SITE_PAGES[first];
  return `/${first}`;
}

const CTA_LABELS = { sign_in: "Clicked Sign in", start_for_free: "Clicked Start for free" };

// ── loading ───────────────────────────────────────────────────────────
async function loadPeople(db, warnings) {
  const [profiles, admins] = await Promise.all([
    fetchAll(db, "profiles", "id,name,email,username,created_at,ai_profile_first_built_at,verification_requested_at"),
    soft(fetchAll(db, "admin_users", "email"), "admin_users", warnings)
  ]);
  const adminEmails = new Set(admins.map((a) => a.email?.toLowerCase()).filter(Boolean));
  const teamIds = new Set(
    profiles
      .filter((p) => {
        const e = p.email?.toLowerCase() || "";
        return e.endsWith(TEAM_DOMAIN) || adminEmails.has(e);
      })
      .map((p) => p.id)
  );
  return { profiles, byId: new Map(profiles.map((p) => [p.id, p])), teamIds };
}

// every action that has its own table, as { user_id, at, name }
async function loadActions(db, people, warnings, userIds = null) {
  const only = (q) => (userIds ? q.in("user_id", userIds) : q);
  const [reviews, enrollments, registrations, purchases] = await Promise.all([
    soft(fetchAll(db, "evolve_portfolio_reviews", "user_id,review_status,created_at", only), "evolve_portfolio_reviews", warnings),
    soft(fetchAll(db, "mentorship_enrollments", "user_id,status,created_at", only), "mentorship_enrollments", warnings),
    soft(fetchAll(db, "event_registrations", "user_id,status,registered_at", only), "event_registrations", warnings),
    soft(fetchAll(db, "purchases", "user_id,kind,status,title,created_at", only), "purchases", warnings)
  ]);
  const profiles = userIds ? userIds.map((id) => people.byId.get(id)).filter(Boolean) : people.profiles;
  const out = [];
  for (const p of profiles) {
    if (p.created_at) out.push({ user_id: p.id, at: p.created_at, name: "Signed up" });
    if (p.ai_profile_first_built_at) out.push({ user_id: p.id, at: p.ai_profile_first_built_at, name: "Built AI profile" });
    if (p.verification_requested_at) out.push({ user_id: p.id, at: p.verification_requested_at, name: "Asked for verification" });
  }
  for (const r of reviews) if (r.review_status !== "draft") out.push({ user_id: r.user_id, at: r.created_at, name: "Submitted portfolio review" });
  for (const r of enrollments) if (r.status === "success") out.push({ user_id: r.user_id, at: r.created_at, name: "Enrolled in mentorship" });
  for (const r of registrations) if (r.status !== "cancelled") out.push({ user_id: r.user_id, at: r.registered_at, name: "Registered for an event" });
  for (const r of purchases) {
    if (r.status !== "success") continue;
    const what = r.kind === "plan" ? "Bought membership" : r.kind === "event" ? "Bought event ticket" : "Bought recording";
    out.push({ user_id: r.user_id, at: r.created_at, name: what });
  }
  return out.filter((a) => a.at && !people.teamIds.has(a.user_id));
}

// ── sessions ──────────────────────────────────────────────────────────
function sourceOf(visit) {
  if (!visit) return null;
  if (visit.utm_source || visit.utm_medium) return `${visit.utm_source || "(none)"} / ${visit.utm_medium || "(none)"}`;
  return hostOf(visit.referrer) || "(direct)";
}

function buildSessions({ steps, visits, events, actions, people }) {
  const visitorUser = new Map();
  for (const s of steps) if (s.user_id && !visitorUser.has(s.visitor_id)) visitorUser.set(s.visitor_id, s.user_id);
  const visitBySession = new Map(visits.filter((v) => v.session_id).map((v) => [v.session_id, v]));
  const firstVisitByVisitor = new Map();
  for (const v of [...visits].sort((a, b) => (a.created_at < b.created_at ? -1 : 1)))
    if (!firstVisitByVisitor.has(v.visitor_id)) firstVisitByVisitor.set(v.visitor_id, v);

  const sessions = new Map();
  for (const s of steps) {
    if (!sessions.has(s.session_id))
      sessions.set(s.session_id, { id: s.session_id, visitor: s.visitor_id, userId: null, raw: [] });
    const ses = sessions.get(s.session_id);
    if (s.user_id) ses.userId = s.user_id;
    ses.raw.push({ t: s.created_at, kind: s.kind === "leave" ? "leave" : "page", name: s.kind === "leave" ? LEFT : pageName(s.path), path: s.path });
  }
  for (const e of events) {
    if (e.event !== "cta_click" || !e.session_id || !sessions.has(e.session_id)) continue;
    sessions.get(e.session_id).raw.push({ t: e.created_at, kind: "cta", name: CTA_LABELS[e.props?.cta] || "Clicked a CTA" });
  }

  const list = [];
  for (const ses of sessions.values()) {
    ses.userId ||= visitorUser.get(ses.visitor) || null;
    if (ses.userId && people.teamIds.has(ses.userId)) continue;
    ses.raw.sort((a, b) => (a.t < b.t ? -1 : a.t > b.t ? 1 : 0));
    ses.start = ses.raw[0].t;
    ses.end = ses.raw[ses.raw.length - 1].t;
    const visit = visitBySession.get(ses.id) || firstVisitByVisitor.get(ses.visitor);
    ses.source = sourceOf(visit) || "(unknown)";
    ses.campaign = visit?.utm_campaign || null;
    list.push(ses);
  }

  // actions go into the user's session running at the time
  const byUser = new Map();
  for (const s of list) if (s.userId) (byUser.get(s.userId) || byUser.set(s.userId, []).get(s.userId)).push(s);
  for (const a of actions) {
    const at = Date.parse(a.at);
    let best = null;
    let bestGap = Infinity;
    for (const s of byUser.get(a.user_id) || []) {
      const from = Date.parse(s.start) - 2 * 60000;
      const to = Date.parse(s.end) + ACTION_SLACK_MS;
      if (at < from || at > to) continue;
      const gap = at < Date.parse(s.start) ? Date.parse(s.start) - at : Math.max(0, at - Date.parse(s.end));
      if (gap < bestGap) [best, bestGap] = [s, gap];
    }
    if (best) {
      best.raw.push({ t: a.at, kind: "action", name: a.name });
      if (a.at > best.end) best.end = a.at;
    }
  }

  // final step lists: sorted, repeats of the same page collapsed, a
  // "Left" only when it's the last thing (a reload leaves then comes back)
  for (const s of list) {
    s.raw.sort((a, b) => (a.t < b.t ? -1 : a.t > b.t ? 1 : 0));
    const out = [];
    s.raw.forEach((st, i) => {
      if (st.kind === "leave" && i !== s.raw.length - 1) return;
      const prev = out[out.length - 1];
      if (prev && prev.kind === "page" && st.kind === "page" && prev.name === st.name) return;
      out.push(st);
    });
    s.steps = out;
    s.left = out[out.length - 1]?.kind === "leave";
    s.pages = out.filter((x) => x.kind === "page");
    s.durationMs = Date.parse(s.end) - Date.parse(s.start);
    delete s.raw;
  }
  return list.sort((a, b) => (a.start < b.start ? 1 : -1));
}

function publicSession(s, people) {
  const p = s.userId ? people.byId.get(s.userId) : null;
  return {
    id: s.id,
    start: s.start,
    durationMs: s.durationMs,
    source: s.source,
    campaign: s.campaign,
    left: s.left,
    user: p ? { id: p.id, name: p.name, email: p.email, username: p.username } : null,
    steps: s.steps.map(({ t, kind, name }) => ({ t, kind, name }))
  };
}

// ── range report ──────────────────────────────────────────────────────
const FUNNEL = [
  "Visited the site",
  "Clicked sign-up / opened sign-in",
  "Signed in",
  "Opened the platform",
  "Explored 2+ platform areas",
  "Took an action"
];

// how far one person got: the furthest stage reached in any session
function stageOf(sessions) {
  let stage = 0;
  const appAreas = new Set();
  for (const s of sessions) {
    for (const st of s.steps) {
      if (st.kind === "cta" || st.name === "Sign-in page") stage = Math.max(stage, 1);
      if (st.kind === "page" && st.name.startsWith("App · ")) appAreas.add(st.name);
      if (st.kind === "action") stage = 5;
    }
    if (s.userId) stage = Math.max(stage, 2);
  }
  if (appAreas.size) stage = Math.max(stage, 3);
  if (appAreas.size >= 2) stage = Math.max(stage, 4);
  return stage;
}

function funnelOf(personStages) {
  const counts = FUNNEL.map((_, i) => personStages.filter((s) => s >= i).length);
  return FUNNEL.map((name, i) => ({
    name,
    people: counts[i],
    ofPrev: i && counts[i - 1] ? Math.round((counts[i] / counts[i - 1]) * 100) : null,
    ofAll: counts[0] ? Math.round((counts[i] / counts[0]) * 100) : 0
  }));
}

export async function buildJourneyReport(db, { rangeDays = 7, now = Date.now() } = {}) {
  const days = Math.min(Math.max(Number(rangeDays) || 7, 1), 90);
  const w = windows(now);
  const from = istDayStartIso(addDays(w.today, -(days - 1)));
  const to = istDayStartIso(addDays(w.today, 1));
  const warnings = [];
  const inRange = (col) => (q) => q.gte(col, from).lt(col, to).order("id");

  const people = await loadPeople(db, warnings);
  const [steps, visits, events, actions] = await Promise.all([
    soft(fetchAll(db, "analytics_steps", "visitor_id,session_id,user_id,kind,path,created_at", inRange("created_at")), "analytics_steps", warnings),
    soft(
      fetchAll(db, "analytics_visits", "visitor_id,session_id,referrer,utm_source,utm_medium,utm_campaign,created_at", inRange("created_at")),
      "analytics_visits",
      warnings
    ),
    soft(fetchAll(db, "analytics_events", "session_id,event,props,created_at", inRange("created_at")), "analytics_events", warnings),
    loadActions(db, people, warnings)
  ]);
  const sessions = buildSessions({
    steps,
    visits,
    events,
    actions: actions.filter((a) => a.at >= from && a.at < to),
    people
  });

  // people: an account where known, else the browser
  const byPerson = new Map();
  for (const s of sessions) {
    const key = s.userId || `v:${s.visitor}`;
    (byPerson.get(key) || byPerson.set(key, []).get(key)).push(s);
  }
  const persons = [...byPerson.values()].map((ss) => {
    const first = [...ss].sort((a, b) => (a.start < b.start ? -1 : 1))[0];
    return { stage: stageOf(ss), source: first.source };
  });
  const topSources = tally(persons, (p) => p.source).slice(0, 6);

  // entry, exit, paths, next steps
  const pageViews = new Map();
  const transitions = new Map();
  const bump = (m, k, n = 1) => m.set(k, (m.get(k) || 0) + n);
  for (const s of sessions) {
    const names = s.steps.map((x) => x.name);
    new Set(s.pages.map((x) => x.name)).forEach((n) => bump(pageViews, n));
    names.forEach((n, i) => {
      if (n === LEFT) return;
      if (!transitions.has(n)) transitions.set(n, new Map());
      bump(transitions.get(n), names[i + 1] || (s.left ? LEFT : "End (no more steps)"));
    });
  }
  const exits = tally(
    sessions.filter((s) => s.pages.length),
    (s) => s.pages[s.pages.length - 1].name
  ).map(([name, n]) => [name, n, Math.round((n / (pageViews.get(name) || n)) * 100)]);
  const pathOf = (s) => {
    const names = s.steps.map((x) => x.name).filter((n) => n !== LEFT);
    return names.slice(0, 6).join(" → ") + (names.length > 6 ? " → …" : "");
  };
  const multi = sessions.filter((s) => s.steps.length > 1);
  const next = [...transitions.entries()]
    .map(([name, m]) => {
      const total = [...m.values()].reduce((a, b) => a + b, 0);
      return { name, total, next: [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8) };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 40);

  return {
    range: { days, from: addDays(w.today, -(days - 1)), to: w.today },
    summary: {
      sessions: sessions.length,
      people: persons.length,
      signedIn: sessions.filter((s) => s.userId).length,
      avgPages: sessions.length ? Math.round((sessions.reduce((a, s) => a + s.pages.length, 0) / sessions.length) * 10) / 10 : 0,
      bounceRate: sessions.length
        ? Math.round((sessions.filter((s) => s.pages.length <= 1 && !s.steps.some((x) => x.kind !== "page" && x.kind !== "leave")).length / sessions.length) * 100)
        : 0,
      avgMinutes: multi.length ? Math.round((multi.reduce((a, s) => a + s.durationMs, 0) / multi.length / 60000) * 10) / 10 : 0
    },
    funnel: funnelOf(persons.map((p) => p.stage)),
    funnelBySource: topSources.map(([source]) => ({
      source,
      stages: funnelOf(persons.filter((p) => p.source === source).map((p) => p.stage))
    })),
    entries: tally(sessions, (s) => s.pages[0]?.name || null).slice(0, 15),
    exits: exits.slice(0, 15),
    paths: tally(sessions, pathOf).slice(0, 20),
    next,
    recent: sessions.slice(0, 60).map((s) => publicSession(s, people)),
    warnings
  };
}

// ── one user, all time ────────────────────────────────────────────────
export async function buildUserJourney(db, userId) {
  if (typeof userId !== "string" || !userId) throw new Error("user_id required");
  const warnings = [];
  const people = await loadPeople(db, warnings);
  const p = people.byId.get(userId);
  if (!p) throw new Error("no such user");

  // their signed-in steps, then everything else from the same browsers
  // (the visits before they had an account)
  const own = await fetchAll(db, "analytics_steps", "visitor_id,session_id,user_id,kind,path,created_at", (q) =>
    q.eq("user_id", userId).order("id")
  );
  const visitors = [...new Set(own.map((s) => s.visitor_id))].slice(0, 50);
  const shared = visitors.length
    ? await fetchAll(db, "analytics_steps", "visitor_id,session_id,user_id,kind,path,created_at", (q) =>
        q.in("visitor_id", visitors).order("id")
      )
    : [];
  // a shared browser: someone else's signed-in steps aren't this journey
  const steps = [...new Map([...own, ...shared].filter((s) => !s.user_id || s.user_id === userId).map((s) => [`${s.session_id}|${s.created_at}|${s.kind}|${s.path}`, s])).values()];
  const sessionIds = [...new Set(steps.map((s) => s.session_id))];
  const [visits, events, actions] = await Promise.all([
    visitors.length ? soft(fetchAll(db, "analytics_visits", "visitor_id,session_id,referrer,utm_source,utm_medium,utm_campaign,created_at", (q) => q.in("visitor_id", visitors)), "analytics_visits", warnings) : [],
    sessionIds.length ? soft(fetchAll(db, "analytics_events", "session_id,event,props,created_at", (q) => q.in("session_id", sessionIds.slice(0, 300))), "analytics_events", warnings) : [],
    loadActions(db, people, warnings, [userId])
  ]);
  const sessions = buildSessions({ steps, visits, events, actions, people: { ...people, teamIds: new Set() } });
  sessions.forEach((s) => (s.userId = userId));

  // actions that didn't happen during a tracked session still belong on the timeline
  const placed = new Set(sessions.flatMap((s) => s.steps.filter((x) => x.kind === "action").map((x) => `${x.name}|${x.t}`)));
  const unplaced = actions.filter((a) => !placed.has(`${a.name}|${a.at}`)).map((a) => ({ t: a.at, name: a.name }));
  const firstVisit = [...visits].sort((a, b) => (a.created_at < b.created_at ? -1 : 1))[0];

  return {
    user: { id: p.id, name: p.name, email: p.email, username: p.username, created_at: p.created_at },
    firstSource: sourceOf(firstVisit),
    firstCampaign: firstVisit?.utm_campaign || null,
    firstSeen: sessions.length ? sessions[sessions.length - 1].start : null,
    sessionCount: sessions.length,
    sessions: sessions.slice(0, 50).map((s) => publicSession(s, people)),
    otherActions: unplaced.sort((a, b) => (a.t < b.t ? 1 : -1)),
    warnings
  };
}
