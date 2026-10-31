// Platform report: the numbers behind the admin "platform report" tab
// (op "platform_report" in api/admin.js), built with the service role.
// Kept to one function so the weekly Discord post can reuse it as is.
// Tables: supabase/migrations/platform_analytics.sql. Days are India
// calendar days; "this week" starts Monday, "this month" on the 1st.
//
// The evolve team (anyone on an @evolvedesign.academy address, plus
// admin_users) is left out of every user-level number. Their browsers are
// also kept out of visits by src/lib/platformAnalytics.js.
//
// The leading underscore keeps Vercel from deploying this as a function.

const IST_MS = 5.5 * 3600000;
const DAY_MS = 86400000;
export const TEAM_DOMAIN = "@evolvedesign.academy";

// "% of platform explored" is out of these six
export const AREAS = ["profile", "grow", "events", "community", "portfolio_review", "mentorship"];
const SECTIONS = ["profile", "grow", "events", "community"];

export const istDay = (ts) => new Date(Date.parse(ts) + IST_MS).toISOString().slice(0, 10);
export const istDayStartIso = (day) => new Date(Date.parse(`${day}T00:00:00Z`) - IST_MS).toISOString();
export const addDays = (day, n) => new Date(Date.parse(`${day}T00:00:00Z`) + n * DAY_MS).toISOString().slice(0, 10);

export function windows(now = Date.now()) {
  const today = istDay(new Date(now).toISOString());
  const dow = (new Date(`${today}T00:00:00Z`).getUTCDay() + 6) % 7; // Monday = 0
  return { today, week: addDays(today, -dow), month: `${today.slice(0, 8)}01` };
}

export async function fetchAll(db, table, columns, apply = (q) => q) {
  const out = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await apply(db.from(table).select(columns)).range(from, from + 999);
    if (error) throw new Error(`${table}: ${error.message}`);
    out.push(...(data || []));
    if (!data || data.length < 1000) return out;
  }
}

// a missing table (migration not run yet) shouldn't blank the whole report
export const soft = (p, label, warnings) =>
  p.catch((err) => {
    warnings.push(`${label}: ${err.message}`);
    return [];
  });

export function tally(rows, keyOf) {
  const m = new Map();
  for (const r of rows) {
    const k = keyOf(r);
    if (k == null) continue;
    m.set(k, (m.get(k) || 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

// today / this week / this month / total, from a list of timestamps
// (anything after "today" is left out, for reports on a past day)
function periods(stamps, w) {
  const days = stamps.filter(Boolean).map(istDay).filter((d) => d <= w.today);
  return {
    today: days.filter((d) => d === w.today).length,
    week: days.filter((d) => d >= w.week).length,
    month: days.filter((d) => d >= w.month).length,
    total: days.length
  };
}

export function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * @param {number} rangeDays  window for visits, CTA clicks, sign-up split,
 *                            DAU average and the per-day series (default 7)
 * @param {number} now        report as of this moment (default: now); the
 *                            weekly Discord post passes the end of last Sunday
 */
export async function buildPlatformReport(db, { rangeDays = 7, now = Date.now() } = {}) {
  const days = Math.min(Math.max(Number(rangeDays) || 7, 1), 90);
  const w = windows(now);
  const rangeStartDay = addDays(w.today, -(days - 1));
  const rangeStart = istDayStartIso(rangeStartDay);
  const rangeEnd = istDayStartIso(addDays(w.today, 1));
  const mauStartDay = addDays(w.today, -29);
  const activityStartDay = rangeStartDay < mauStartDay ? rangeStartDay : mauStartDay;
  const warnings = [];

  const [profiles, admins, visits, events, activity, explored, reviews, enrollments] = await Promise.all([
    fetchAll(
      db,
      "profiles",
      "id,name,email,username,created_at,signup_method,ai_profile_status,ai_profile_first_built_at,verification_status,verification_requested_at"
    ),
    soft(fetchAll(db, "admin_users", "email"), "admin_users", warnings),
    soft(
      fetchAll(db, "analytics_visits", "visitor_id,user_id,landing_path,referrer,utm_source,utm_medium,utm_campaign,created_at", (q) =>
        q.gte("created_at", rangeStart).lt("created_at", rangeEnd)
      ),
      "analytics_visits",
      warnings
    ),
    soft(
      fetchAll(db, "analytics_events", "user_id,event,props,created_at", (q) => q.gte("created_at", rangeStart).lt("created_at", rangeEnd)),
      "analytics_events",
      warnings
    ),
    soft(
      fetchAll(db, "user_daily_activity", "user_id,day", (q) => q.gte("day", activityStartDay).lte("day", w.today)),
      "user_daily_activity",
      warnings
    ),
    soft(fetchAll(db, "user_explored", "user_id,area,first_at,last_at,visits"), "user_explored", warnings),
    soft(fetchAll(db, "evolve_portfolio_reviews", "user_id,review_status,created_at"), "evolve_portfolio_reviews", warnings),
    soft(fetchAll(db, "mentorship_enrollments", "user_id,status,created_at"), "mentorship_enrollments", warnings)
  ]);

  // ── who counts ──────────────────────────────────────────────────────
  const adminEmails = new Set(admins.map((a) => a.email?.toLowerCase()).filter(Boolean));
  const isTeam = (p) => {
    const e = p.email?.toLowerCase() || "";
    return e.endsWith(TEAM_DOMAIN) || adminEmails.has(e);
  };
  const teamIds = new Set(profiles.filter(isTeam).map((p) => p.id));
  const users = profiles.filter((p) => !teamIds.has(p.id));
  const byId = new Map(users.map((p) => [p.id, p]));
  const real = (r) => !r.user_id || !teamIds.has(r.user_id);
  const realUser = (r) => r.user_id && byId.has(r.user_id);

  // ── website visits by UTM ───────────────────────────────────────────
  const v = visits.filter(real);
  const tagged = v.filter((r) => r.utm_source || r.utm_medium || r.utm_campaign);
  const visitsReport = {
    sessions: v.length,
    visitors: new Set(v.map((r) => r.visitor_id)).size,
    tagged: tagged.length,
    untagged: v.length - tagged.length,
    bySource: tally(tagged, (r) => `${r.utm_source || "(none)"} / ${r.utm_medium || "(none)"}`),
    byCampaign: tally(
      tagged.filter((r) => r.utm_campaign),
      (r) => r.utm_campaign
    ),
    // untagged traffic, by where it came from
    byReferrer: tally(
      v.filter((r) => !r.utm_source && !r.utm_medium && !r.utm_campaign),
      (r) => hostOf(r.referrer) || "(direct)"
    ),
    byLandingPage: tally(v, (r) => r.landing_path || "/")
  };

  // ── sign-up CTAs ────────────────────────────────────────────────────
  const ev = events.filter(real);
  const clicks = ev.filter((e) => e.event === "cta_click");
  const signups = ev.filter((e) => e.event === "signup");
  const ctaReport = {
    byCta: tally(clicks, (e) => e.props?.cta),
    byLocation: tally(clicks, (e) => (e.props?.cta ? `${e.props.cta} · ${e.props.location || "?"}` : null)),
    // sign-ups in the range, credited to the last CTA clicked (within an hour)
    signupsByCta: tally(signups, (e) => e.props?.cta || "(no CTA)")
  };

  // ── accounts ────────────────────────────────────────────────────────
  const inRange = (ts) => ts && istDay(ts) >= rangeStartDay && istDay(ts) <= w.today;
  const accounts = {
    ...periods(users.map((p) => p.created_at), w),
    byMethodInRange: tally(users.filter((p) => inRange(p.created_at)), (p) => p.signup_method || "unknown"),
    byMethodAllTime: tally(users, (p) => p.signup_method || "unknown")
  };

  // ── profiles + verification ─────────────────────────────────────────
  const built = users.filter((p) => p.ai_profile_status === "done");
  const profilesCreated = periods(built.map((p) => p.ai_profile_first_built_at || p.created_at), w);
  const asked = users.filter((p) => p.verification_status);
  const verification = {
    ...periods(asked.map((p) => p.verification_requested_at || p.created_at), w),
    byStatus: tally(asked, (p) => p.verification_status)
  };

  // ── interest: opened the programme on the platform, or went further ──
  const ex = explored.filter(realUser);
  const openedBy = (area) => new Map(ex.filter((r) => r.area === area).map((r) => [r.user_id, r.first_at]));
  function interest(area, actedRows, actedLabel) {
    const opened = openedBy(area);
    const acted = new Map();
    for (const r of actedRows.filter(realUser)) if (!acted.has(r.user_id)) acted.set(r.user_id, r.created_at);
    const all = new Map(opened);
    for (const [id, ts] of acted) if (!all.has(id) || ts < all.get(id)) all.set(id, ts);
    return { ...periods([...all.values()], w), opened: opened.size, [actedLabel]: acted.size };
  }
  const portfolioReview = interest(
    "portfolio_review",
    reviews.filter((r) => r.review_status !== "draft"),
    "submitted"
  );
  const mentorship = interest(
    "mentorship",
    enrollments.filter((r) => r.status === "success"),
    "enrolled"
  );

  // ── platform sections ───────────────────────────────────────────────
  const sectionUsers = (area, from) =>
    new Set(
      ex
        .filter((r) => r.area === area && istDay(r.first_at) <= w.today && (!from || istDay(r.last_at) >= from))
        .map((r) => r.user_id)
    ).size;
  const sections = SECTIONS.map((area) => ({
    area,
    allTime: sectionUsers(area),
    inRange: sectionUsers(area, rangeStartDay)
  }));

  // ── active users ────────────────────────────────────────────────────
  const act = activity.filter(realUser);
  const perDay = new Map();
  for (const r of act) {
    if (!perDay.has(r.day)) perDay.set(r.day, new Set());
    perDay.get(r.day).add(r.user_id);
  }
  const series = [];
  for (let d = rangeStartDay; d <= w.today; d = addDays(d, 1)) series.push({ day: d, users: perDay.get(d)?.size || 0 });
  // today only counts toward the average once it's over (a report on a past week)
  const todayOver = now >= Date.parse(rangeEnd) - 1000;
  const completeDays = series.filter((s) => s.day < w.today || todayOver);
  const active = {
    today: perDay.get(w.today)?.size || 0,
    yesterday: perDay.get(addDays(w.today, -1))?.size || 0,
    avgDaily: completeDays.length
      ? Math.round((completeDays.reduce((s, x) => s + x.users, 0) / completeDays.length) * 10) / 10
      : 0,
    mau: new Set(act.filter((r) => r.day >= mauStartDay).map((r) => r.user_id)).size,
    wau: new Set(act.filter((r) => r.day >= addDays(w.today, -6)).map((r) => r.user_id)).size,
    series
  };
  active.stickiness = active.mau ? Math.round((active.avgDaily / active.mau) * 100) : 0; // DAU / MAU %

  // ── per user: % of platform explored ────────────────────────────────
  const areasOf = new Map();
  for (const r of ex) {
    if (!areasOf.has(r.user_id)) areasOf.set(r.user_id, { areas: new Set(), lastAt: r.last_at, visits: 0 });
    const u = areasOf.get(r.user_id);
    u.areas.add(r.area);
    u.visits += r.visits || 0;
    if (r.last_at > u.lastAt) u.lastAt = r.last_at;
  }
  const perUser = [...areasOf.entries()]
    .map(([id, u]) => {
      const p = byId.get(id);
      return {
        id,
        name: p?.name || null,
        email: p?.email || null,
        username: p?.username || null,
        areas: AREAS.filter((a) => u.areas.has(a)),
        pct: Math.round((u.areas.size / AREAS.length) * 100),
        visits: u.visits,
        lastAt: u.lastAt
      };
    })
    .sort((a, b) => b.pct - a.pct || (b.lastAt > a.lastAt ? 1 : -1));
  const buckets = [
    ["0%", (p) => p === 0],
    ["1–33%", (p) => p > 0 && p <= 33],
    ["34–66%", (p) => p > 33 && p <= 66],
    ["67–99%", (p) => p > 66 && p < 100],
    ["100%", (p) => p === 100]
  ];
  const pcts = users.map((p) => (areasOf.has(p.id) ? Math.round((areasOf.get(p.id).areas.size / AREAS.length) * 100) : 0));
  const exploration = {
    areas: AREAS,
    tracked: perUser.length,
    avgPct: perUser.length ? Math.round(perUser.reduce((s, u) => s + u.pct, 0) / perUser.length) : 0,
    distribution: buckets.map(([label, test]) => [label, pcts.filter(test).length]),
    users: perUser
  };

  return {
    generatedAt: new Date(now).toISOString(),
    range: { days, from: rangeStartDay, to: w.today },
    periods: w,
    visits: visitsReport,
    ctas: ctaReport,
    accounts,
    profilesCreated,
    verification,
    portfolioReview,
    mentorship,
    sections,
    active,
    exploration,
    excludedTeamAccounts: teamIds.size,
    warnings
  };
}
