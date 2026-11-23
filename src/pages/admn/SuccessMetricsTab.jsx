import { useCallback, useEffect, useState } from "react";
import { callAdminApi } from "../../supabaseAdminClient";

// Admin: success metrics. One business story, not per user, from
// api/_successMetrics.js (op "success_metrics"):
//   where to focus → funnel → signed in vs not → why people don't sign in
//   → which sources work → event funnels.
// The evolve team is left out; days are India time.

const Y = "#FFD007";
const G = "#22c55e";
const R = "#f87171";
const O = "#fb923c";
const MUTED = "#777";
const RANGES = [7, 30, 90];
const LEVEL_COLOR = { high: R, medium: O, info: "#60a5fa" };
const LEVEL_LABEL = { high: "Fix first", medium: "Worth a look", info: "Good to know" };

const box = { background: "#111", border: "1px solid #222" };
const dayLabel = (d) => new Date(`${d}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const fmtWhen = (t) => (t ? new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "");
const fmtSec = (s) => (s == null ? "–" : s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`);
const rateColor = (r) => (r >= 30 ? G : r >= 10 ? Y : R);

function Section({ n, title, note, children }) {
  return (
    <section className="mt-10">
      <h3 className="text-base font-bold text-white">
        {n && <span style={{ color: Y }}>{n}. </span>}
        {title}
      </h3>
      {note && (
        <p className="text-[13px] mt-1 mb-4 max-w-3xl" style={{ color: MUTED }}>
          {note}
        </p>
      )}
      {children}
    </section>
  );
}

function Stat({ label, value, sub, color = "#fff" }) {
  return (
    <div className="rounded-xl p-4" style={box}>
      <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: MUTED }}>
        {label}
      </div>
      <div className="text-2xl font-extrabold mt-1" style={{ color }}>
        {value}
      </div>
      {sub && (
        <div className="text-[12px] mt-1" style={{ color: MUTED }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function Bars({ title, rows = [], limit = 8, color = Y, empty = "Nothing yet.", unit = "people" }) {
  const max = Math.max(1, ...rows.map(([, n]) => n));
  const total = rows.reduce((s, [, n]) => s + n, 0);
  return (
    <div className="rounded-xl p-4" style={box}>
      {title && (
        <div className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: MUTED }}>
          {title}
        </div>
      )}
      {!rows.length && (
        <div className="text-sm" style={{ color: "#555" }}>
          {empty}
        </div>
      )}
      <div className="space-y-2">
        {rows.slice(0, limit).map(([k, n]) => (
          <div key={k}>
            <div className="flex justify-between text-[13px]" style={{ color: "#ddd" }}>
              <span className="truncate pr-3">{k}</span>
              <span className="whitespace-nowrap" title={unit}>
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

// stepped funnel: each bar is % of the first step; the gap row shows the drop
function Funnel({ steps }) {
  if (!steps?.length) return null;
  const top = Math.max(1, steps[0].people);
  return (
    <div className="rounded-xl p-5" style={box}>
      {steps.map((s, i) => (
        <div key={s.key}>
          {i > 0 && (
            <div className="flex items-center gap-2 text-[12px] py-1.5 pl-1" style={{ color: s.ofPrev < 30 ? R : MUTED }}>
              <span>↓</span>
              <span>
                {s.ofPrev}% move on · <b>{s.dropped}</b> drop here
              </span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="w-48 flex-shrink-0">
              <div className="text-sm font-semibold text-white">{s.name}</div>
              <div className="text-[11px] leading-snug" style={{ color: "#666" }}>
                {s.help}
              </div>
            </div>
            <div className="flex-1 h-8 rounded relative" style={{ background: "#1a1a1a" }}>
              <div
                className="h-8 rounded"
                style={{ width: `${Math.max(1, (s.people / top) * 100)}%`, background: i === steps.length - 1 ? G : Y, opacity: 1 - i * 0.08 }}
              />
            </div>
            <div className="w-24 text-right">
              <div className="text-lg font-extrabold text-white">{s.people}</div>
              <div className="text-[11px]" style={{ color: "#666" }}>
                {s.ofAll}% of all
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function GroupColumn({ title, color, g, extra }) {
  return (
    <div className="rounded-xl p-5" style={{ ...box, borderTop: `3px solid ${color}` }}>
      <div className="text-sm font-bold text-white">{title}</div>
      <div className="text-3xl font-extrabold mt-1" style={{ color }}>
        {g.people}
        <span className="text-sm font-semibold" style={{ color: MUTED }}>
          {" "}
          people
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
        {[
          ["Sessions", g.sessions],
          ["Sessions / person", g.sessionsPerPerson],
          ["Pages / session", g.avgPages],
          ["Minutes / session", g.avgMinutes],
          ["Bounce rate", `${g.bounceRate}%`],
          ...extra
        ].map(([k, v]) => (
          <div key={k}>
            <div className="text-[11px] uppercase tracking-wider" style={{ color: "#666" }}>
              {k}
            </div>
            <div className="font-bold text-white">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Table({ cols, rows, rowKey, highlight }) {
  const th = "text-left text-[11px] font-semibold uppercase tracking-wider px-3 py-2 whitespace-nowrap";
  return (
    <div className="rounded-xl overflow-x-auto" style={box}>
      <table className="w-full text-sm" style={{ color: "#ddd" }}>
        <thead>
          <tr style={{ color: MUTED, borderBottom: "1px solid #222" }}>
            {cols.map((c) => (
              <th key={c.label} className={th} title={c.help}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={rowKey(r)} style={{ borderBottom: "1px solid #1a1a1a", background: highlight?.(r) ? "#1a1606" : undefined }}>
              {cols.map((c) => (
                <td key={c.label} className="px-3 py-2 whitespace-nowrap">
                  {c.render(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const sourceCols = [
  { label: "Source", render: (r) => <span className="font-semibold text-white">{r.label}</span> },
  { label: "People", render: (r) => `${r.people} (${r.share}%)` },
  { label: "New visitors", help: "Arrived without an account", render: (r) => r.newcomers },
  { label: "Made an account", render: (r) => r.newSignups },
  {
    label: "Join rate",
    help: "Of new visitors from this source, % who made an account",
    render: (r) => (
      <span style={{ color: r.enough ? rateColor(r.joinRate) : MUTED }} title={r.enough ? "" : "Small sample"}>
        {r.joinRate}%{r.enough ? "" : "*"}
      </span>
    )
  },
  { label: "Returning members", render: (r) => r.returning },
  { label: "Bounced", render: (r) => `${r.bounced}%` },
  { label: "Took action", render: (r) => `${r.acted} (${r.actRate}%)` },
  { label: "Event viewers → registered", render: (r) => `${r.eventViewers} → ${r.eventRegistered}` }
];

function EventRow({ e, clickTracking }) {
  const [open, setOpen] = useState(false);
  const steps = [
    ["Viewed the event page", e.viewers],
    ...(clickTracking ? [["Clicked “Book your spot”", e.clicked]] : []),
    ["Registered", e.registeredFromViewers]
  ];
  return (
    <div className="rounded-xl" style={box}>
      <button onClick={() => setOpen(!open)} className="w-full text-left p-4 flex flex-wrap items-center gap-x-6 gap-y-2">
        <div className="flex-1 min-w-[220px]">
          <div className="font-semibold text-white">{e.title}</div>
          <div className="text-[12px]" style={{ color: MUTED }}>
            {fmtWhen(e.startTime)} · {e.past ? "past" : "upcoming"}
            {e.status !== "published" ? ` · ${e.status}` : ""}
          </div>
        </div>
        {[
          ["Viewers", e.viewers],
          ...(clickTracking ? [["Clicked book", e.clicked]] : []),
          ["Registered", e.registered],
          ["Viewed, didn't register", e.viewedNotRegistered],
          ["Attended", e.attended]
        ].map(([k, v]) => (
          <div key={k} className="text-center">
            <div className="text-lg font-extrabold text-white">{v}</div>
            <div className="text-[11px]" style={{ color: "#666" }}>
              {k}
            </div>
          </div>
        ))}
        <div className="text-center">
          <div className="text-lg font-extrabold" style={{ color: e.viewers >= 10 ? rateColor(e.conversion) : MUTED }}>
            {e.conversion}%
          </div>
          <div className="text-[11px]" style={{ color: "#666" }}>
            view → register
          </div>
        </div>
        <span style={{ color: MUTED }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-4" style={{ borderTop: "1px solid #1f1f1f" }}>
          <div className="grid md:grid-cols-3 gap-3 pt-4">
            <div className="rounded-lg p-4" style={{ background: "#0c0c0c", border: "1px solid #1f1f1f" }}>
              <div className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: MUTED }}>
                Funnel
              </div>
              {steps.map(([k, v], i) => (
                <div key={k} className="mb-2">
                  <div className="flex justify-between text-[13px]">
                    <span>{k}</span>
                    <span className="font-bold text-white">
                      {v}
                      {i > 0 && <span style={{ color: MUTED }}> · {steps[i - 1][1] ? Math.round((v / steps[i - 1][1]) * 100) : 0}%</span>}
                    </span>
                  </div>
                  <div className="h-2 rounded mt-1" style={{ background: "#1d1d1d" }}>
                    <div className="h-2 rounded" style={{ width: `${e.viewers ? (v / e.viewers) * 100 : 0}%`, background: i === steps.length - 1 ? G : Y }} />
                  </div>
                </div>
              ))}
              {clickTracking && e.clickedSignedOut > 0 && (
                <p className="text-[12px] mt-3" style={{ color: "#aaa" }}>
                  {e.clickedSignedOut} clicked while signed out → {e.signedInAfterClick} signed in.{" "}
                  {e.clickedSignedOut - e.signedInAfterClick > 0 && (
                    <span style={{ color: R }}>{e.clickedSignedOut - e.signedInAfterClick} lost at sign-in.</span>
                  )}
                </p>
              )}
              {e.registeredUntracked > 0 && (
                <p className="text-[12px] mt-2" style={{ color: "#666" }}>
                  +{e.registeredUntracked} registrations with no tracked page view (invites, blocked tracking, earlier visit).
                </p>
              )}
              {e.pending > 0 && (
                <p className="text-[12px] mt-1" style={{ color: "#666" }}>
                  {e.pending} waiting for approval.
                </p>
              )}
            </div>
            <Bars title="Who registered: source" rows={e.regSources} color={G} empty="No registrations." />
            <div className="rounded-lg p-4" style={{ background: "#0c0c0c", border: "1px solid #1f1f1f" }}>
              <div className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: MUTED }}>
                Viewers who didn't register
              </div>
              <div className="text-[13px] mb-3" style={{ color: "#aaa" }}>
                Median time on the page: <b className="text-white">{fmtSec(e.medianSecNotReg)}</b>
                {e.medianSecReg != null && (
                  <>
                    {" "}
                    (registrants: <b className="text-white">{fmtSec(e.medianSecReg)}</b>)
                  </>
                )}
              </div>
              <div className="text-[11px] uppercase tracking-wider mb-2" style={{ color: "#666" }}>
                What they did next
              </div>
              {e.nextAfter.map(([k, n]) => (
                <div key={k} className="flex justify-between text-[13px]">
                  <span className="truncate pr-2">{k}</span>
                  <span>{n}</span>
                </div>
              ))}
            </div>
          </div>
          <Table
            rows={e.bySource}
            rowKey={(r) => r.source}
            cols={[
              { label: "Viewers came from", render: (r) => <span className="text-white">{r.source}</span> },
              { label: "Viewers", render: (r) => r.viewers },
              { label: "Registered", render: (r) => r.registered },
              {
                label: "Conversion",
                render: (r) => <span style={{ color: r.viewers >= 5 ? rateColor(r.rate) : MUTED }}>{r.rate}%</span>
              }
            ]}
          />
        </div>
      )}
    </div>
  );
}

export default function SuccessMetricsTab() {
  const [rangeDays, setRangeDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newcomersOnly, setNewcomersOnly] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await callAdminApi({ op: "success_metrics", rangeDays });
    if (res.error) setError(res.error.message || "Couldn't load success metrics.");
    else setData(res);
    setLoading(false);
  }, [rangeDays]);

  useEffect(() => {
    load();
  }, [load]);

  const d = data;
  const ev = d?.events.overview;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-white">Success metrics</h2>
          <p className="text-sm mt-1 max-w-3xl" style={{ color: "#888" }}>
            How people find evolve, how many sign in, what they do, and where we lose them. Counted per person (an account, or a browser
            if they never signed in). The evolve team is left out; days are India time.
            {d ? ` Range: ${dayLabel(d.range.from)} – ${dayLabel(d.range.to)}.` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          {RANGES.map((n) => (
            <button
              key={n}
              onClick={() => setRangeDays(n)}
              className="px-3 py-2 rounded-lg text-sm font-semibold"
              style={rangeDays === n ? { background: Y, color: "#000" } : { background: "#1a1a1a", border: "1px solid #333", color: "#ddd" }}
            >
              {n} days
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
        </div>
      </div>

      {error && <p style={{ color: R }}>{error}</p>}
      {d?.warnings?.length > 0 && (
        <div className="rounded-xl p-3 mb-4 text-[12px]" style={{ background: "#1f1606", border: "1px solid #3a2a0a", color: "#e6b85c" }}>
          {d.warnings.map((w) => (
            <div key={w}>{w}</div>
          ))}
        </div>
      )}
      {!d && loading && <p style={{ color: "#666" }}>Loading… (this reads every visit in the range, give it a few seconds)</p>}

      {d && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Stat label="People who came" value={d.totals.people} sub={`${d.totals.sessions} sessions`} />
            <Stat label="Signed in" value={d.totals.signedIn} sub={`${Math.round((d.totals.signedIn / (d.totals.people || 1)) * 100)}% of people`} color={G} />
            <Stat label="New accounts" value={d.totals.newSignups} color={Y} />
            <Stat label="Never signed in" value={d.totals.anonymous} color={R} />
            <Stat label="Event registrations" value={ev.registrations} sub={`${ev.attended} attended`} />
          </div>

          {/* ── focus ── */}
          <Section title="Where to focus" note="Worked out from the numbers below, most important first. Percentages on fewer than 10 people are skipped.">
            {!d.focus.length && <p style={{ color: "#666" }}>Not enough data in this range yet.</p>}
            <div className="grid md:grid-cols-2 gap-3">
              {d.focus.map((f) => (
                <div key={f.title} className="rounded-xl p-4" style={{ ...box, borderLeft: `3px solid ${LEVEL_COLOR[f.level]}` }}>
                  <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: LEVEL_COLOR[f.level] }}>
                    {LEVEL_LABEL[f.level]}
                  </div>
                  <div className="font-semibold text-white mt-1">{f.title}</div>
                  <div className="text-[13px] mt-1" style={{ color: "#aaa" }}>
                    {f.detail}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ── 1 funnel ── */}
          <Section
            n={1}
            title="The funnel: from visit to real action"
            note="Each person is counted at the furthest step they reached in the range. “New visitors only” leaves out returning members, so it shows how well we turn strangers into members."
          >
            <div className="flex gap-1 mb-3 p-1 rounded-xl w-fit" style={box}>
              {[
                [false, "Everyone"],
                [true, "New visitors only"]
              ].map(([k, l]) => (
                <button
                  key={l}
                  onClick={() => setNewcomersOnly(k)}
                  className="px-4 py-1.5 rounded-lg text-sm font-semibold"
                  style={newcomersOnly === k ? { background: Y, color: "#000" } : { color: "#aaa" }}
                >
                  {l}
                </button>
              ))}
            </div>
            <Funnel steps={newcomersOnly ? d.newcomerFunnel : d.funnel} />
          </Section>

          {/* ── 2 groups ── */}
          <Section
            n={2}
            title="Signed in vs. not signed in: what they explored"
            note="Pages are counted by people who opened them, not raw views. Entry = first page of a session, exit = last."
          >
            <div className="grid md:grid-cols-2 gap-3">
              <GroupColumn
                title="Signed in"
                color={G}
                g={d.signedIn}
                extra={[
                  ["New accounts", d.signedIn.newSignups],
                  ["Returning members", d.signedIn.returning],
                  ["Never opened the platform", d.signedIn.neverOpenedPlatform],
                  ["Explored, no action yet", d.signedIn.exploredNoAction]
                ]}
              />
              <GroupColumn
                title="Not signed in"
                color={R}
                g={d.anonymous}
                extra={[["Came back 2+ times", d.anonymous.returningVisitors]]}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-3 mt-3">
              <div className="space-y-3">
                <Bars title="Signed in · platform areas opened" rows={d.signedIn.areas} color={G} />
                <Bars title="Signed in · actions taken" rows={d.signedIn.actions} color={G} empty="No actions in this range." />
                <Bars title="Signed in · pages opened" rows={d.signedIn.topPages} color={G} limit={10} />
                <Bars title="Signed in · where sessions end" rows={d.signedIn.exits} color={G} unit="sessions" />
              </div>
              <div className="space-y-3">
                <Bars title="Not signed in · pages opened" rows={d.anonymous.topPages} color={R} limit={10} />
                <Bars title="Not signed in · where they enter" rows={d.anonymous.entries} color={R} unit="sessions" />
                <Bars title="Not signed in · last page before leaving for good" rows={d.anonymous.lastPages} color={R} />
              </div>
            </div>
          </Section>

          {/* ── 3 why not ── */}
          <Section
            n={3}
            title="Why visitors don't sign in"
            note={`Each of the ${d.totals.anonymous} visitors who never signed in is put in the one bucket that best explains it, based on what they did. Biggest bucket first.`}
          >
            <div className="space-y-3">
              {d.reasons.map((r) => (
                <div key={r.key} className="rounded-xl p-4" style={box}>
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="w-24">
                      <div className="text-3xl font-extrabold" style={{ color: r.key === "event_signin_wall" || r.key === "signin_dropoff" ? R : Y }}>
                        {r.pct}%
                      </div>
                      <div className="text-[12px]" style={{ color: MUTED }}>
                        {r.people} people
                      </div>
                    </div>
                    <div className="flex-1 min-w-[260px]">
                      <div className="font-semibold text-white">{r.name}</div>
                      <div className="text-[13px] mt-1" style={{ color: "#aaa" }}>
                        {r.why}
                      </div>
                      <div className="text-[13px] mt-2" style={{ color: G }}>
                        What to do: <span style={{ color: "#ccc" }}>{r.fix}</span>
                      </div>
                    </div>
                    {r.people > 0 && (
                      <div className="grid sm:grid-cols-2 gap-3 w-full lg:w-[520px]">
                        <Bars title="Left from" rows={r.leftFrom} limit={5} color={R} />
                        <Bars title={r.pages.length ? "Pages they read" : "Came from"} rows={r.pages.length ? r.pages : r.channels} limit={5} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ── 4 sources ── */}
          <Section
            n={4}
            title="Where people come from, and which sources actually convert"
            note="Source = UTM tag if the link had one, else the site they came from. Join rate is the % of new visitors from that source who made an account; * means fewer than 10 people. Highlighted: main source and best-converting source."
          >
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Stat label="Main source (most people)" value={d.sources.main || "–"} color={Y} />
              <Stat label="Best-converting source" value={d.sources.best || "Not enough data"} color={G} />
            </div>
            <Table
              rows={d.sources.channels}
              rowKey={(r) => r.label}
              cols={sourceCols}
              highlight={(r) => r.label === d.sources.main || r.label === d.sources.best}
            />
            {d.sources.campaigns.length > 0 && (
              <>
                <h4 className="text-sm font-semibold text-white mt-6 mb-2">By campaign (utm_campaign)</h4>
                <Table rows={d.sources.campaigns} rowKey={(r) => r.label} cols={[{ ...sourceCols[0], label: "Campaign" }, ...sourceCols.slice(1)]} />
              </>
            )}
          </Section>

          {/* ── 5 events ── */}
          <Section
            n={5}
            title="Events: views → registrations"
            note="Viewers = people who opened an event page (site or platform). “Inside evolve” means they reached the event from another evolve page rather than from an outside link. Click an event for its full funnel."
          >
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Stat label="Viewed an event" value={ev.viewers} />
              <Stat label="Clicked “Book your spot”" value={ev.clickTracking ? ev.clicked : "–"} sub={ev.clickTracking ? `${ev.clickedSignedOut} while signed out` : "not tracked yet"} />
              <Stat label="Registered (viewers)" value={ev.registeredFromViewers} color={G} sub={`${ev.registrations} registrations in all`} />
              <Stat label="Viewed, didn't register" value={ev.viewers - ev.registeredFromViewers} color={R} />
              <Stat label="View → register" value={`${ev.conversion}%`} color={rateColor(ev.conversion)} />
            </div>
            {ev.clickTracking && ev.clickedSignedOut > 0 && (
              <p className="text-[13px] mt-3" style={{ color: "#aaa" }}>
                Sign-in wall: {ev.clickedSignedOut} people clicked “Book your spot” while signed out, {ev.signedInAfterClick} of them signed in
                {ev.clickedSignedOut - ev.signedInAfterClick > 0 && (
                  <span style={{ color: R }}> · {ev.clickedSignedOut - ev.signedInAfterClick} lost there</span>
                )}
                .
              </p>
            )}
            {ev.listingVisitorsNoDetail > 0 && (
              <p className="text-[13px] mt-1" style={{ color: "#aaa" }}>
                {ev.listingVisitorsNoDetail} people opened the events list but never opened an event.
              </p>
            )}
            <div className="grid md:grid-cols-2 gap-3 mt-3">
              <Bars title="How viewers reached the event page" rows={ev.viewerSources} />
              <Bars title="Where registrations came from" rows={ev.regSources} color={G} empty="No registrations in this range." />
            </div>
            <div className="space-y-3 mt-4">
              {!d.events.list.length && <p style={{ color: "#666" }}>No event views or registrations in this range.</p>}
              {d.events.list.map((e) => (
                <EventRow key={e.slug} e={e} clickTracking={ev.clickTracking} />
              ))}
            </div>
          </Section>
        </>
      )}
    </div>
  );
}
