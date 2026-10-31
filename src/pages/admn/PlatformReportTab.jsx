import { useCallback, useEffect, useMemo, useState } from "react";
import { callAdminApi } from "../../supabaseAdminClient";
import JourneysPanel, { UserJourneyModal } from "./JourneysPanel";

// Admin: platform report. All numbers come from api/_platformReport.js
// (op "platform_report"), which reads the first-party tracking tables in
// supabase/migrations/platform_analytics.sql plus profiles, reviews and
// mentorship enrollments. The evolve team's own accounts are left out.
// Days are India calendar days.

const Y = "#FFD007";
const G = "#22c55e";
const RANGES = [7, 30, 90];

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
  portfolio_review: "Portfolio review",
  mentorship: "Mentorship",
  booked: "Booked",
  verifying: "Verifying",
  verified: "Verified",
  needs_attention: "Needs attention"
};
const label = (k) => LABELS[k] || k;

const dayLabel = (d) =>
  new Date(`${d}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", weekday: "short" });

function Card({ label: l, value, sub, color = "#fff" }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "#111", border: "1px solid #222" }}>
      <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#777" }}>
        {l}
      </div>
      <div className="text-2xl font-extrabold mt-1" style={{ color }}>
        {value}
      </div>
      {sub && (
        <div className="text-[12px] mt-1" style={{ color: "#777" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

// today / this week / this month / total in one card
function PeriodCard({ title, p, sub, color = "#fff" }) {
  const cells = [
    ["Today", p?.today],
    ["This week", p?.week],
    ["This month", p?.month],
    ["Total", p?.total]
  ];
  return (
    <div className="rounded-xl p-4" style={{ background: "#111", border: "1px solid #222" }}>
      <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#777" }}>
        {title}
      </div>
      <div className="grid grid-cols-4 gap-2 mt-2">
        {cells.map(([k, n]) => (
          <div key={k}>
            <div className="text-xl font-extrabold" style={{ color: k === "Total" ? color : "#fff" }}>
              {n ?? "–"}
            </div>
            <div className="text-[11px]" style={{ color: "#666" }}>
              {k}
            </div>
          </div>
        ))}
      </div>
      {sub && (
        <div className="text-[12px] mt-2" style={{ color: "#777" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

// ranked [key, count] rows as horizontal bars
function RankList({ title, rows = [], empty = "Nothing yet.", limit = 10, color = Y }) {
  const total = rows.reduce((s, [, n]) => s + n, 0);
  const max = Math.max(1, ...rows.map(([, n]) => n));
  return (
    <div className="rounded-xl p-4" style={{ background: "#111", border: "1px solid #222" }}>
      <div className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#777" }}>
        {title}
      </div>
      {!rows.length && (
        <div className="text-sm" style={{ color: "#555" }}>
          {empty}
        </div>
      )}
      <div className="space-y-2">
        {rows.slice(0, limit).map(([k, n]) => (
          <div key={k}>
            <div className="flex justify-between text-[13px]" style={{ color: "#ddd" }}>
              <span className="truncate pr-3">{label(k)}</span>
              <span className="whitespace-nowrap">
                {n}
                <span style={{ color: "#666" }}> · {total ? Math.round((n / total) * 100) : 0}%</span>
              </span>
            </div>
            <div className="h-1.5 rounded mt-1" style={{ background: "#1d1d1d" }}>
              <div className="h-1.5 rounded" style={{ width: `${(n / max) * 100}%`, background: color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const Section = ({ title, note, children }) => (
  <>
    <h3 className="text-sm font-bold text-white mt-8 mb-1">{title}</h3>
    {note && (
      <p className="text-[12px] mb-3" style={{ color: "#666" }}>
        {note}
      </p>
    )}
    {children}
  </>
);

export default function PlatformReportTab() {
  const [rangeDays, setRangeDays] = useState(7);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState("");
  const [view, setView] = useState("overview");
  const [journeyUser, setJourneyUser] = useState(null);

  // same post the Monday cron sends: last full Monday–Sunday week
  async function sendToDiscord() {
    if (!window.confirm("Post last week's report to #platform-analytics now?")) return;
    setSending(true);
    setSent("");
    const res = await callAdminApi({ op: "platform_report_discord" });
    setSent(res.error ? `Couldn't send: ${res.error.message}` : res.skipped ? `Not sent: ${res.skipped}` : "Sent to Discord.");
    setSending(false);
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await callAdminApi({ op: "platform_report", rangeDays });
    if (res.error) setError(res.error.message || "Couldn't load the report.");
    else setReport(res);
    setLoading(false);
  }, [rangeDays]);

  useEffect(() => {
    load();
  }, [load]);

  const users = useMemo(() => {
    const q = search.trim().toLowerCase();
    const all = report?.exploration?.users || [];
    return q
      ? all.filter((u) => [u.name, u.email, u.username].some((s) => s?.toLowerCase().includes(q)))
      : all;
  }, [report, search]);

  function downloadCsv() {
    const areas = report.exploration.areas;
    const esc = (s) => `"${String(s ?? "").replace(/"/g, '""')}"`;
    const rows = [
      ["name", "email", "username", "% explored", ...areas, "area visits", "last seen"],
      ...report.exploration.users.map((u) => [
        u.name,
        u.email,
        u.username,
        u.pct,
        ...areas.map((a) => (u.areas.includes(a) ? 1 : 0)),
        u.visits,
        u.lastAt
      ])
    ];
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([rows.map((r) => r.map(esc).join(",")).join("\n")], { type: "text/csv" }));
    a.download = `platform-exploration-${report.range.to}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  const r = report;
  const th = "text-left text-[11px] font-semibold uppercase tracking-wider px-3 py-2 whitespace-nowrap";
  const td = "px-3 py-2 whitespace-nowrap";
  const maxDay = Math.max(1, ...(r?.active.series || []).map((s) => s.users));
  const rangeText = r ? `${dayLabel(r.range.from)} – ${dayLabel(r.range.to)}` : "";

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-white">Platform report</h2>
          <p className="text-sm mt-1" style={{ color: "#888" }}>
            Visits, sign-ups and platform use; posted weekly to Discord just after midnight on Sunday. Days are India time; the
            evolve team's accounts are left out
            {r ? ` (${r.excludedTeamAccounts})` : ""}.
            {r ? ` Range: ${rangeText}.` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          {RANGES.map((d) => (
            <button
              key={d}
              onClick={() => setRangeDays(d)}
              className="px-3 py-2 rounded-lg text-sm font-semibold"
              style={
                rangeDays === d
                  ? { background: Y, color: "#000" }
                  : { background: "#1a1a1a", border: "1px solid #333", color: "#ddd" }
              }
            >
              {d} days
            </button>
          ))}
          <button
            onClick={load}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: "#1a1a1a", border: "1px solid #333", color: "#ddd" }}
          >
            {loading ? "Loading…" : "Refresh"}
          </button>
          <button
            onClick={sendToDiscord}
            disabled={sending}
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: "#5865F2", color: "#fff" }}
          >
            {sending ? "Sending…" : "Send last week to Discord"}
          </button>
        </div>
      </div>
      {sent && (
        <p className="text-sm -mt-3 mb-4" style={{ color: sent === "Sent to Discord." ? G : "#f87171" }}>
          {sent}
        </p>
      )}

      <div className="flex gap-1 mb-5 p-1 rounded-xl w-fit" style={{ background: "#111", border: "1px solid #222" }}>
        {[
          ["overview", "Overview"],
          ["journeys", "Journeys"]
        ].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setView(k)}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold"
            style={view === k ? { background: Y, color: "#000" } : { color: "#aaa" }}
          >
            {l}
          </button>
        ))}
      </div>

      {view === "journeys" && <JourneysPanel rangeDays={rangeDays} onOpenUser={setJourneyUser} />}
      <UserJourneyModal userId={journeyUser} onClose={() => setJourneyUser(null)} />

      {view === "overview" && error && (
        <div className="mb-4 rounded-lg p-3 text-sm" style={{ background: "#2a0f12", color: "#f87171" }}>
          {error}
        </div>
      )}
      {view === "overview" && r?.warnings?.length > 0 && (
        <div className="mb-4 rounded-lg p-3 text-sm" style={{ background: "#2a230f", color: Y }}>
          Some numbers are missing. Has supabase/migrations/platform_analytics.sql been run?
          <div className="text-[12px] mt-1" style={{ color: "#a08a3a" }}>
            {r.warnings.join(" · ")}
          </div>
        </div>
      )}
      {view === "overview" && !r && loading && <p style={{ color: "#666" }}>Loading…</p>}

      {view === "overview" && r && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            <PeriodCard title="Accounts created" p={r.accounts} color={Y} />
            <PeriodCard title="Profiles created" p={r.profilesCreated} sub="AI profile built" color={Y} />
            <PeriodCard
              title="Asked for verification"
              p={r.verification}
              sub={r.verification.byStatus.map(([k, n]) => `${label(k)} ${n}`).join(" · ") || "–"}
            />
            <PeriodCard
              title="Interested in portfolio review"
              p={r.portfolioReview}
              sub={`${r.portfolioReview.opened} opened it · ${r.portfolioReview.submitted} submitted a review`}
            />
            <PeriodCard
              title="Interested in 1:1 mentorship"
              p={r.mentorship}
              sub={`${r.mentorship.opened} opened it · ${r.mentorship.enrolled} enrolled`}
            />
          </div>

          <Section title="Active users" note="Signed-in people who opened the site that day.">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
              <Card label="Active today" value={r.active.today} color={G} />
              <Card label="Yesterday" value={r.active.yesterday} />
              <Card label="Avg daily (DAU)" value={r.active.avgDaily} sub={`over the last ${r.range.days} days`} />
              <Card label="Weekly (WAU)" value={r.active.wau} sub="last 7 days" />
              <Card label="Monthly (MAU)" value={r.active.mau} sub="last 30 days" color={Y} />
              <Card label="DAU / MAU" value={`${r.active.stickiness}%`} sub="how often people come back" />
            </div>
            <div className="rounded-xl p-4 mt-3" style={{ background: "#111", border: "1px solid #222" }}>
              <div className="flex items-end gap-1 h-32">
                {r.active.series.map((s) => (
                  <div
                    key={s.day}
                    className="flex-1 flex flex-col items-center justify-end h-full min-w-0"
                    title={`${dayLabel(s.day)}: ${s.users}`}
                  >
                    {r.active.series.length <= 31 && (
                      <span className="text-[10px] mb-1" style={{ color: "#888" }}>
                        {s.users || ""}
                      </span>
                    )}
                    <div
                      className="w-full rounded-t"
                      style={{ height: `${(s.users / maxDay) * 100}%`, minHeight: s.users ? 3 : 0, background: G }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[11px] mt-1" style={{ color: "#666" }}>
                <span>{dayLabel(r.range.from)}</span>
                <span>{dayLabel(r.range.to)}</span>
              </div>
            </div>
          </Section>

          <Section
            title="People landing on the website"
            note="One visit per browser session. UTM tags come from the landing URL (?utm_source=…); untagged visits are split by referrer."
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <Card label="Visits" value={r.visits.sessions} sub={rangeText} color={Y} />
              <Card label="Visitors" value={r.visits.visitors} sub="unique browsers*" />
              <Card label="With UTM tags" value={r.visits.tagged} />
              <Card label="Without UTM tags" value={r.visits.untagged} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <RankList title="UTM source / medium" rows={r.visits.bySource} empty="No tagged visits yet." />
              <RankList title="UTM campaign" rows={r.visits.byCampaign} empty="No campaigns yet." />
              <RankList title="Untagged, by referrer" rows={r.visits.byReferrer} color="#888" />
              <RankList title="Landing page" rows={r.visits.byLandingPage} color="#888" />
            </div>
            <p className="text-[12px] mt-2" style={{ color: "#666" }}>
              *Visitors who reject cookies are counted once per session, so unique visitors runs a little high.
            </p>
          </Section>

          <Section title="Sign-up CTAs" note={`Clicks by signed-out visitors, ${rangeText}.`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <RankList title="Most clicked" rows={r.ctas.byCta} />
              <RankList title="By button" rows={r.ctas.byLocation} color="#888" />
              <RankList title="Sign-ups after a CTA" rows={r.ctas.signupsByCta} color={G} />
            </div>
          </Section>

          <Section
            title="How accounts are created"
            note="Accounts from before this tracking show One Tap and Google redirect together as Google."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <RankList title={`Sign-up method, ${rangeText}`} rows={r.accounts.byMethodInRange} />
              <RankList title="Sign-up method, all time" rows={r.accounts.byMethodAllTime} />
            </div>
          </Section>

          <Section title="Platform sections explored" note="People who opened each tab.">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {r.sections.map((s) => (
                <Card key={s.area} label={label(s.area)} value={s.inRange} sub={`in range · ${s.allTime} all time`} />
              ))}
            </div>
          </Section>

          <Section
            title="% of platform explored, per user"
            note={`Out of ${r.exploration.areas.length} areas: ${r.exploration.areas.map(label).join(", ")}.`}
          >
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-3">
              <Card label="Avg explored" value={`${r.exploration.avgPct}%`} sub={`of ${r.exploration.tracked} tracked users`} color={Y} />
              {r.exploration.distribution.map(([k, n]) => (
                <Card key={k} label={k} value={n} sub="users" />
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or email"
                className="px-3 py-2 rounded-lg text-sm flex-1 min-w-[200px]"
                style={{ background: "#111", border: "1px solid #333", color: "#ddd" }}
              />
              <button
                onClick={downloadCsv}
                disabled={!r.exploration.users.length}
                className="px-4 py-2 rounded-lg text-sm font-bold"
                style={{ background: Y, color: "#000" }}
              >
                Download CSV
              </button>
            </div>
            <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid #222" }}>
              <table className="w-full text-sm" style={{ color: "#ddd" }}>
                <thead style={{ background: "#111", color: "#777" }}>
                  <tr>
                    <th className={th}>User</th>
                    <th className={th}>Email</th>
                    <th className={th}>Explored</th>
                    {r.exploration.areas.map((a) => (
                      <th key={a} className={th}>
                        {label(a)}
                      </th>
                    ))}
                    <th className={th}>Last seen</th>
                  </tr>
                </thead>
                <tbody>
                  {users.slice(0, 200).map((u) => (
                    <tr key={u.id} style={{ borderTop: "1px solid #1d1d1d" }}>
                      <td className={td}>
                        <button onClick={() => setJourneyUser(u.id)} className="text-white underline decoration-[#444] hover:decoration-white" title="See journey">
                          {u.name || u.username || u.id.slice(0, 8)}
                        </button>
                      </td>
                      <td className={td} style={{ color: "#999" }}>
                        {u.email || "–"}
                      </td>
                      <td className={td} style={{ color: u.pct === 100 ? G : Y }}>
                        {u.pct}%
                      </td>
                      {r.exploration.areas.map((a) => (
                        <td key={a} className={td} style={{ color: u.areas.includes(a) ? G : "#333" }}>
                          {u.areas.includes(a) ? "✓" : "·"}
                        </td>
                      ))}
                      <td className={td} style={{ color: "#999" }}>
                        {new Date(u.lastAt).toLocaleString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                    </tr>
                  ))}
                  {!users.length && (
                    <tr>
                      <td colSpan={r.exploration.areas.length + 4} className="px-3 py-6 text-center" style={{ color: "#666" }}>
                        No one tracked yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {users.length > 200 && (
              <p className="text-[12px] mt-2" style={{ color: "#666" }}>
                Showing 200 of {users.length}. Download the CSV for everyone.
              </p>
            )}
          </Section>
        </>
      )}
    </div>
  );
}
