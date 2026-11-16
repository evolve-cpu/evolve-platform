// User analytics: one row per account for the admin "user analytics" tab
// (op "platform_users" in api/admin.js) — how they found evolve, how they
// signed up, where they went next, how much time they've spent, where they
// left, how far they got, and how active they are now. Built for picking
// out groups to follow up with (CSV export in the tab).
//
// Tracking data comes from the admin_user_analytics() SQL function
// (supabase/migrations/platform_user_analytics.sql); actions from the
// tables that record them (loadActions in _platformJourneys.js).
// The evolve team is left out, as in the other platform reports.
// The leading underscore keeps Vercel from deploying this as a function.

import { TEAM_DOMAIN, addDays, attachSelfBuilt, fetchAll, hostOf, istDay, soft } from "./_platformReport.js";
import { loadActions, pageName } from "./_platformJourneys.js";

const DAY_MS = 86400000;

export const STAGES = [
  "Signed up",
  "Opened the platform",
  "Built AI profile",
  "Asked for verification",
  "Took part (event / review / mentorship / purchase)"
];

export const SEGMENTS = {
  daily: "Daily users",
  active: "Active this week",
  lapsing: "Lapsing (8–30 days)",
  dormant: "Dormant (30+ days)",
  one_day: "Never came back",
  never: "Never opened the platform"
};

const PART_ACTIONS = new Set([
  "Submitted portfolio review",
  "Enrolled in mentorship",
  "Registered for an event",
  "Bought membership",
  "Bought event ticket",
  "Bought recording"
]);

const CTA_LABELS = { sign_in: "Sign in button", start_for_free: "Start for free button" };

function sourceOf(r) {
  if (r.first_utm_source || r.first_utm_medium)
    return `${r.first_utm_source || "(none)"} / ${r.first_utm_medium || "(none)"}`;
  if (r.first_visit_at) return hostOf(r.first_referrer) || "(direct)";
  return null; // no tracked visit (account older than tracking, or tracking blocked)
}

// broad bucket for filtering: Instagram, LinkedIn, Google, …
function channelOf(r) {
  const s = `${r.first_utm_source || ""} ${r.first_utm_medium || ""} ${hostOf(r.first_referrer) || ""}`.toLowerCase();
  if (!r.first_visit_at) return "Not tracked";
  if (/instagram|ig\b/.test(s)) return "Instagram";
  if (/linkedin|lnkd/.test(s)) return "LinkedIn";
  if (/whatsapp|wa\.me/.test(s)) return "WhatsApp";
  if (/youtube|youtu\.be/.test(s)) return "YouTube";
  if (/facebook|fb\b/.test(s)) return "Facebook";
  if (/twitter|t\.co|x\.com/.test(s)) return "X / Twitter";
  if (/discord/.test(s)) return "Discord";
  if (/email|newsletter|brevo|mail/.test(s)) return "Email";
  if (/google|bing|duckduckgo|yahoo|search/.test(s)) return "Search";
  if (/chatgpt|openai|perplexity|claude|gemini|copilot/.test(s)) return "AI assistant";
  if (!s.trim()) return "Direct";
  if (r.first_utm_source || r.first_utm_medium) return "Other campaign";
  return "Other website";
}

async function loadProfiles(db) {
  const base =
    "id,name,email,username,created_at,signup_method,onboarding_completed,ai_profile_status,ai_profile_first_built_at,verification_status,verification_requested_at,plan,plan_expires_at,trial_ends_at";
  try {
    return await fetchAll(db, "profiles", `${base},phone`);
  } catch {
    return fetchAll(db, "profiles", base);
  }
}

async function loadTracking(db) {
  const out = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.rpc("admin_user_analytics").range(from, from + 999);
    if (error) throw new Error(`admin_user_analytics: ${error.message}`);
    out.push(...(data || []));
    if (!data || data.length < 1000) return out;
  }
}

export async function buildUserAnalytics(db, { now = Date.now() } = {}) {
  const warnings = [];
  const [profiles, admins, tracking, daily, explored] = await Promise.all([
    loadProfiles(db),
    soft(fetchAll(db, "admin_users", "email"), "admin_users", warnings),
    soft(
      loadTracking(db),
      "tracking (run supabase/migrations/platform_user_analytics.sql)",
      warnings
    ),
    soft(fetchAll(db, "user_daily_activity", "user_id,day"), "user_daily_activity", warnings),
    soft(fetchAll(db, "user_explored", "user_id,area"), "user_explored", warnings)
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
  await attachSelfBuilt(db, profiles, warnings);
  const people = { profiles, byId: new Map(profiles.map((p) => [p.id, p])), teamIds };
  const actions = await loadActions(db, people, warnings);

  const trackById = new Map(tracking.map((t) => [t.user_id, t]));
  const daysById = new Map();
  for (const d of daily) (daysById.get(d.user_id) || daysById.set(d.user_id, new Set()).get(d.user_id)).add(d.day);
  const areasById = new Map();
  for (const e of explored) (areasById.get(e.user_id) || areasById.set(e.user_id, []).get(e.user_id)).push(e.area);
  const actionsById = new Map();
  for (const a of actions)
    if (a.name !== "Signed up") (actionsById.get(a.user_id) || actionsById.set(a.user_id, []).get(a.user_id)).push(a);

  const today = istDay(new Date(now).toISOString());
  const last7 = new Set(Array.from({ length: 7 }, (_, i) => addDays(today, -i)));

  const users = [];
  for (const p of profiles) {
    if (teamIds.has(p.id)) continue;
    const t = trackById.get(p.id) || {};
    const days = daysById.get(p.id) || new Set();
    const areas = areasById.get(p.id) || [];
    const acts = (actionsById.get(p.id) || []).sort((a, b) => (a.at < b.at ? -1 : 1));
    const signupDay = p.created_at ? istDay(p.created_at) : null;

    // last time we saw them: signed-in activity day or a tracked step
    const lastSeen = [t.last_seen_at, ...[...days].map((d) => `${d}T12:00:00+05:30`)]
      .filter(Boolean)
      .map((x) => Date.parse(x))
      .reduce((m, x) => Math.max(m, x), 0);
    const lastActiveDay = days.size ? [...days].sort().at(-1) : null;
    const activeDays7 = [...days].filter((d) => last7.has(d)).length;
    const daysSinceSeen = lastSeen ? Math.floor((now - lastSeen) / DAY_MS) : null;

    const openedPlatform =
      areas.length > 0 || days.size > 0 || /^\/app(\/|$)/.test(t.first_page_after_signup || "") || /^\/app(\/|$)/.test(t.last_page || "");
    // built by the user themselves — a profile the team pre-generated from
    // their portfolio / resume doesn't count (it's flagged as teamProfile)
    const builtProfile = !!p.selfBuiltAt;
    const teamProfile = !builtProfile && p.ai_profile_status === "done";
    const askedVerification = !!p.verification_requested_at || !!p.verification_status;
    const tookPart = acts.some((a) => PART_ACTIONS.has(a.name));
    const stage = tookPart ? 4 : askedVerification ? 3 : builtProfile ? 2 : openedPlatform ? 1 : 0;

    let segment;
    if (!openedPlatform && !t.sessions) segment = "never";
    else if (activeDays7 >= 4) segment = "daily";
    else if (daysSinceSeen != null && daysSinceSeen <= 7) segment = "active";
    else if ([...days].every((d) => d === signupDay) && (!t.last_seen_at || istDay(t.last_seen_at) === signupDay))
      segment = "one_day";
    else if (daysSinceSeen != null && daysSinceSeen <= 30) segment = "lapsing";
    else segment = "dormant";

    const plan =
      p.plan && p.plan_expires_at && Date.parse(p.plan_expires_at) > now
        ? `paid (${p.plan})`
        : p.trial_ends_at && Date.parse(p.trial_ends_at) > now
          ? "trial"
          : p.plan
            ? "expired plan"
            : "free";

    users.push({
      id: p.id,
      name: p.name || p.username || "",
      email: p.email || "",
      phone: p.phone || "",
      username: p.username || "",
      signedUpAt: p.created_at,
      signupMethod: p.signup_method || "unknown",
      source: sourceOf(t),
      channel: channelOf(t),
      campaign: t.first_utm_campaign || null,
      firstLanding: t.first_landing_path ? pageName(t.first_landing_path) : null,
      firstVisitAt: t.first_visit_at || null,
      signupVia: t.signup_cta
        ? `${CTA_LABELS[t.signup_cta] || t.signup_cta}${t.signup_cta_location ? ` · ${t.signup_cta_location}` : ""}`
        : null,
      signupPage: t.signup_path ? pageName(t.signup_path) : null,
      firstPageAfterSignup: t.first_page_after_signup ? pageName(t.first_page_after_signup) : null,
      sessions: Number(t.sessions || 0),
      totalMs: Number(t.total_ms || 0),
      pagesViewed: Number(t.pages_viewed || 0),
      daysActive: days.size,
      activeDays7,
      lastSeenAt: lastSeen ? new Date(lastSeen).toISOString() : null,
      lastActiveDay,
      daysSinceSeen,
      lastPage: t.last_page ? pageName(t.last_page) : null,
      areas,
      actions: [...new Set(acts.map((a) => a.name))],
      onboarded: !!p.onboarding_completed,
      teamProfile,
      plan,
      stage,
      stageName: STAGES[stage],
      segment,
      segmentName: SEGMENTS[segment]
    });
  }

  // ── summary ──
  const count = (fn) => users.filter(fn).length;
  const tallyBy = (key) => {
    const m = new Map();
    for (const u of users) {
      const k = u[key] || "unknown";
      m.set(k, (m.get(k) || 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([name, n]) => ({ name, n }));
  };
  const funnel = STAGES.map((name, i) => {
    const n = count((u) => u.stage >= i);
    return { name, n, pct: users.length ? Math.round((n / users.length) * 100) : 0 };
  });
  const tracked = users.filter((u) => u.sessions > 0);

  return {
    generatedAt: new Date(now).toISOString(),
    total: users.length,
    activeToday: count((u) => u.lastActiveDay === today),
    segments: Object.entries(SEGMENTS).map(([id, name]) => ({ id, name, n: count((u) => u.segment === id) })),
    funnel,
    channels: tallyBy("channel"),
    signupMethods: tallyBy("signupMethod"),
    exitPages: tallyBy("lastPage").filter((x) => x.name !== "unknown").slice(0, 10),
    avgTimeMs: tracked.length ? Math.round(tracked.reduce((s, u) => s + u.totalMs, 0) / tracked.length) : 0,
    trackedUsers: tracked.length,
    selfBuiltProfiles: count((u) => u.actions.includes("Built AI profile")),
    teamProfiles: count((u) => u.teamProfile),
    users,
    warnings
  };
}
