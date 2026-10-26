// Weekly platform report → Discord (#platform-analytics), through a channel
// webhook: DISCORD_PLATFORM_REPORT_WEBHOOK_URL (unset = skipped).
// Same numbers as the admin "platform report" tab (_platformReport.js),
// for the last full Monday–Sunday week (India time), with the week before
// for comparison. Sent by the weekly cron (api/admin.js GET
// ?cron=platform-report) or the tab's "Send to Discord" button.
// The leading underscore keeps Vercel from deploying this as a function.

import { buildPlatformReport } from "./_platformReport.js";

const IST_MS = 5.5 * 3600000;
const DAY_MS = 86400000;
const SITE = (process.env.SITE_URL || "https://www.evolvedesign.academy").replace(/\/$/, "");

const LABELS = {
  sign_in: "Sign in",
  start_for_free: "Start for free",
  google_one_tap: "Google One Tap",
  google: "Google",
  linkedin: "LinkedIn",
  email: "Email",
  discord: "Discord",
  unknown: "Unknown",
  profile: "My Profile",
  grow: "Grow",
  events: "Events",
  community: "Community",
  "(no CTA)": "No CTA"
};
const label = (k) => LABELS[k] || k;

const istToday = (now) => new Date(now + IST_MS).toISOString().slice(0, 10);
// last moment of an India day
const endOfIstDay = (day) => Date.parse(`${day}T00:00:00Z`) - IST_MS + DAY_MS - 1;
const dayLabel = (d) =>
  new Date(`${d}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });

/** The Sunday that ended the last full week, as YYYY-MM-DD (India time). */
export function lastSunday(now = Date.now()) {
  const today = istToday(now);
  const dow = new Date(`${today}T00:00:00Z`).getUTCDay(); // Sunday = 0
  return new Date(Date.parse(`${today}T00:00:00Z`) - (dow === 0 ? 7 : dow) * DAY_MS).toISOString().slice(0, 10);
}

/** this week's report + last week's, as of the end of `endDay` (a Sunday) */
export async function buildWeeklyReports(db, endDay = lastSunday()) {
  const end = endOfIstDay(endDay);
  const [week, prev] = await Promise.all([
    buildPlatformReport(db, { rangeDays: 7, now: end }),
    buildPlatformReport(db, { rangeDays: 7, now: end - 7 * DAY_MS })
  ]);
  return { week, prev };
}

function delta(now, before) {
  if (before == null) return "";
  const d = now - before;
  if (!d) return " (same as last week)";
  return ` (${d > 0 ? "▲" : "▼"} ${Math.abs(Math.round(d * 10) / 10)} vs last week)`;
}

const list = (rows, n = 5) =>
  rows?.length
    ? rows
        .slice(0, n)
        .map(([k, v]) => `${label(k)} **${v}**`)
        .join("\n")
    : "–";

async function send(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ allowed_mentions: { parse: [] }, ...body })
  });
  if (!res.ok) throw new Error(`discord ${res.status}: ${await res.text()}`);
}

export async function postWeeklyReportToDiscord({ week: r, prev: p }, opts = {}) {
  const url = opts.webhookUrl || process.env.DISCORD_PLATFORM_REPORT_WEBHOOK_URL;
  if (!url) return { skipped: "DISCORD_PLATFORM_REPORT_WEBHOOK_URL not set" };

  const range = `${dayLabel(r.range.from)} – ${dayLabel(r.range.to)}`;
  const sections = r.sections.map((s) => `${label(s.area)} **${s.inRange}**`).join(" · ");
  const clicks = r.ctas.byCta.map(([k, n]) => `${label(k)} **${n}**`).join(" · ") || "–";

  const overview = {
    title: `evolve weekly platform report · ${range}`,
    url: `${SITE}/admin/dashboard`,
    color: 0xffd007,
    fields: [
      { name: "New accounts", value: `**${r.accounts.week}**${delta(r.accounts.week, p.accounts.week)}`, inline: true },
      {
        name: "Profiles created",
        value: `**${r.profilesCreated.week}**${delta(r.profilesCreated.week, p.profilesCreated.week)}`,
        inline: true
      },
      {
        name: "Asked for verification",
        value: `**${r.verification.week}**${delta(r.verification.week, p.verification.week)}`,
        inline: true
      },
      {
        name: "Interested in portfolio review",
        value: `**${r.portfolioReview.week}**${delta(r.portfolioReview.week, p.portfolioReview.week)}`,
        inline: true
      },
      {
        name: "Interested in 1:1 mentorship",
        value: `**${r.mentorship.week}**${delta(r.mentorship.week, p.mentorship.week)}`,
        inline: true
      },
      {
        name: "Website visits",
        value: `**${r.visits.sessions}** from ${r.visits.visitors} visitors${delta(r.visits.sessions, p.visits.sessions)}`,
        inline: true
      },
      {
        name: "Active users",
        value: [
          `Avg daily (DAU) **${r.active.avgDaily}**${delta(r.active.avgDaily, p.active.avgDaily)}`,
          `Weekly **${r.active.wau}** · Monthly (MAU) **${r.active.mau}**`,
          `DAU / MAU ${r.active.stickiness}%`
        ].join("\n")
      },
      {
        name: "Totals so far",
        value: [
          `${r.accounts.total} accounts · ${r.profilesCreated.total} profiles`,
          `${r.verification.total} asked for verification`,
          `${r.portfolioReview.total} interested in portfolio review · ${r.mentorship.total} in mentorship`
        ].join("\n")
      }
    ]
  };

  const detail = {
    title: "Where people came from, and what they did",
    color: 0xdf0586,
    fields: [
      { name: "Top UTM source / medium", value: list(r.visits.bySource), inline: true },
      { name: "Top campaigns", value: list(r.visits.byCampaign), inline: true },
      { name: "Untagged, by referrer", value: list(r.visits.byReferrer), inline: true },
      { name: "Sign-up CTA clicks", value: clicks, inline: true },
      { name: "Sign-ups after a CTA", value: list(r.ctas.signupsByCta), inline: true },
      { name: "Accounts created via", value: list(r.accounts.byMethodInRange), inline: true },
      { name: "Platform sections explored (users)", value: sections || "–" },
      {
        name: "% of platform explored",
        value: [
          `Avg **${r.exploration.avgPct}%** across ${r.exploration.tracked} users`,
          r.exploration.distribution.map(([k, n]) => `${k}: ${n}`).join(" · ")
        ].join("\n")
      }
    ],
    footer: {
      text: `Monday–Sunday, India time · evolve team left out${r.warnings.length ? " · some numbers missing, check the admin tab" : ""}`
    }
  };

  await send(url, { username: "Platform Report", embeds: [overview, detail] });
  return { ok: true, week: r.range };
}
