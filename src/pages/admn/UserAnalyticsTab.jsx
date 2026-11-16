import { useEffect, useMemo, useState } from "react";
import { callAdminApi } from "../../supabaseAdminClient";
import { UserJourneyModal } from "./JourneysPanel";

// Admin → "user analytics": every user's source, sign-up, journey, time
// spent, exit page, funnel stage and activity segment, with filters and a
// CSV export for targeting. Click a row for their step-by-step journey.
// Built by api/_platformUsers.js (op "platform_users").

const Y = "#FFD007";
const G = "#22c55e";
const P = "#DF0586";
const B = "#60a5fa";

const SEGMENT_COLOR = {
  daily: G,
  active: "#86efac",
  lapsing: Y,
  dormant: "#fb923c",
  one_day: P,
  never: "#888"
};

const dur = (ms) => {
  if (!ms) return "—";
  const m = Math.round(ms / 60000);
  if (m < 1) return `${Math.round(ms / 1000)}s`;
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
};
const date = (ts) =>
  ts ? new Date(ts).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "2-digit" }) : "—";
const ago = (days) => (days == null ? "—" : days === 0 ? "today" : days === 1 ? "yesterday" : `${days}d ago`);

function downloadCSV(filename, rows) {
  if (!rows.length) return;
  const cols = Object.keys(rows[0]);
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function Card({ label, value, sub, color = "#fff", active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl p-4 text-left transition"
      style={{
        background: active ? "#1a1a1a" : "#111",
        border: `1px solid ${active ? color : "#222"}`,
        cursor: onClick ? "pointer" : "default"
      }}
    >
      <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#777" }}>
        {label}
      </div>
      <div className="text-2xl font-extrabold mt-1" style={{ color }}>
        {value}
      </div>
      {sub && (
        <div className="text-[12px] mt-1" style={{ color: "#777" }}>
          {sub}
        </div>
      )}
    </button>
  );
}

function Breakdown({ title, items, selected, onSelect, total }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "#111", border: "1px solid #222" }}>
      <div className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#777" }}>
        {title}
      </div>
      <div className="space-y-1.5">
        {items.slice(0, 10).map((it) => (
          <button
            key={it.name}
            onClick={onSelect ? () => onSelect(selected === it.name ? "all" : it.name) : undefined}
            className="w-full flex items-center gap-2 text-left text-[13px]"
            style={{ cursor: onSelect ? "pointer" : "default" }}
          >
            <span className="flex-1 truncate" style={{ color: selected === it.name ? Y : "#ccc" }}>
              {it.name}
            </span>
            <span className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: "#222" }}>
              <span
                className="block h-full rounded-full"
                style={{ width: `${total ? (it.n / total) * 100 : 0}%`, background: selected === it.name ? Y : "#555" }}
              />
            </span>
            <span className="w-10 text-right tabular-nums" style={{ color: "#999" }}>
              {it.n}
            </span>
          </button>
        ))}
        {!items.length && <div className="text-xs" style={{ color: "#555" }}>no data yet</div>}
      </div>
    </div>
  );
}

const Select = ({ value, onChange, children }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="px-3 py-2 rounded-lg text-xs outline-none"
    style={{ background: "#111", border: "1px solid #222", color: "#fff" }}
  >
    {children}
  </select>
);

export default function UserAnalyticsTab() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState("all");
  const [stage, setStage] = useState("all");
  const [channel, setChannel] = useState("all");
  const [method, setMethod] = useState("all");
  const [sort, setSort] = useState("lastSeen");
  const [limit, setLimit] = useState(100);
  const [journeyUser, setJourneyUser] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    const res = await callAdminApi({ op: "platform_users" });
    if (res.error) setError(res.error.message);
    else setData(res);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    const rows = data.users.filter(
      (u) =>
        (segment === "all" || u.segment === segment) &&
        (stage === "all" || String(u.stage) === stage) &&
        (channel === "all" || u.channel === channel) &&
        (method === "all" || u.signupMethod === method) &&
        (!q || [u.name, u.email, u.username, u.phone].some((v) => v && v.toLowerCase().includes(q)))
    );
    const by = {
      lastSeen: (u) => (u.lastSeenAt ? Date.parse(u.lastSeenAt) : 0),
      signedUp: (u) => (u.signedUpAt ? Date.parse(u.signedUpAt) : 0),
      time: (u) => u.totalMs,
      sessions: (u) => u.sessions,
      days: (u) => u.daysActive
    }[sort];
    return [...rows].sort((a, b) => by(b) - by(a));
  }, [data, search, segment, stage, channel, method, sort]);

  useEffect(() => setLimit(100), [search, segment, stage, channel, method, sort]);

  function exportCSV() {
    downloadCSV(
      `evolve-users-${segment}-${new Date().toISOString().slice(0, 10)}.csv`,
      filtered.map((u) => ({
        name: u.name,
        email: u.email,
        phone: u.phone,
        username: u.username,
        signed_up: date(u.signedUpAt),
        signup_method: u.signupMethod,
        channel: u.channel,
        source: u.source || "",
        campaign: u.campaign || "",
        first_landing_page: u.firstLanding || "",
        signed_up_via: u.signupVia || "",
        signup_page: u.signupPage || "",
        first_page_after_signup: u.firstPageAfterSignup || "",
        sessions: u.sessions,
        total_time_min: Math.round(u.totalMs / 60000),
        pages_viewed: u.pagesViewed,
        days_active: u.daysActive,
        active_days_last_7: u.activeDays7,
        last_seen: date(u.lastSeenAt),
        days_since_seen: u.daysSinceSeen ?? "",
        left_from: u.lastPage || "",
        areas_explored: u.areas.join(" | "),
        ai_profile: u.actions.includes("Built AI profile") ? "built by user" : u.teamProfile ? "pre-generated by team" : "none",
        actions: u.actions.join(" | "),
        plan: u.plan,
        funnel_stage: u.stageName,
        segment: u.segmentName
      }))
    );
  }

  if (loading && !data)
    return <div className="py-16 text-center text-sm" style={{ color: "#666" }}>loading every user's analytics…</div>;
  if (error && !data)
    return (
      <div className="py-16 text-center text-sm" style={{ color: "#f87171" }}>
        couldn't load: {error}{" "}
        <button onClick={load} className="underline ml-2" style={{ color: Y }}>
          retry
        </button>
      </div>
    );

  const total = data.total;

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1">
          <div className="text-lg font-bold" style={{ color: "#fff" }}>
            User analytics
          </div>
          <div className="text-xs" style={{ color: "#666" }}>
            {total} users · {data.trackedUsers} with tracked visits · avg time on evolve {dur(data.avgTimeMs)} · team excluded
            <br />
            AI profiles: {data.selfBuiltProfiles} built by users themselves · {data.teamProfiles} pre-generated by the team (not
            counted in the funnel)
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="text-xs px-3 py-1.5 rounded-lg font-semibold disabled:opacity-50"
          style={{ background: "#111", border: "1px solid #333", color: Y }}
        >
          {loading ? "refreshing…" : "↻ refresh"}
        </button>
      </div>

      {data.warnings?.length > 0 && (
        <div className="text-xs rounded-lg p-3" style={{ background: "#2a1a00", color: Y }}>
          {data.warnings.map((w) => (
            <div key={w}>⚠ {w}</div>
          ))}
        </div>
      )}

      {/* segments */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card
          label="All users"
          value={total}
          sub={`${data.activeToday} active today`}
          active={segment === "all"}
          onClick={() => setSegment("all")}
        />
        {data.segments.map((s) => (
          <Card
            key={s.id}
            label={s.name}
            value={s.n}
            sub={total ? `${Math.round((s.n / total) * 100)}%` : ""}
            color={SEGMENT_COLOR[s.id]}
            active={segment === s.id}
            onClick={() => setSegment(segment === s.id ? "all" : s.id)}
          />
        ))}
      </div>

      {/* funnel + breakdowns */}
      <div className="grid lg:grid-cols-2 gap-3">
        <div className="rounded-xl p-4" style={{ background: "#111", border: "1px solid #222" }}>
          <div className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#777" }}>
            Funnel · how far each user got
          </div>
          <div className="space-y-2">
            {data.funnel.map((f, i) => (
              <button
                key={f.name}
                onClick={() => setStage(stage === String(i) ? "all" : String(i))}
                className="w-full text-left"
              >
                <div className="flex justify-between text-[13px] mb-1">
                  <span style={{ color: stage === String(i) ? Y : "#ccc" }}>
                    {i + 1}. {f.name}
                  </span>
                  <span className="tabular-nums" style={{ color: "#999" }}>
                    {f.n} · {f.pct}%
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "#222" }}>
                  <div className="h-full rounded-full" style={{ width: `${f.pct}%`, background: i === 4 ? G : Y }} />
                </div>
              </button>
            ))}
          </div>
          <div className="text-[11px] mt-3" style={{ color: "#555" }}>
            click a stage to list users who stopped exactly there
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Breakdown title="How they found evolve" items={data.channels} selected={channel} onSelect={setChannel} total={total} />
          <Breakdown title="Sign-up method" items={data.signupMethods} selected={method} onSelect={setMethod} total={total} />
          <div className="sm:col-span-2">
            <Breakdown title="Where they left from (last page)" items={data.exitPages} total={total} />
          </div>
        </div>
      </div>

      {/* filters */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="search name, email, phone…"
          className="flex-1 min-w-[200px] max-w-sm px-4 py-2 rounded-lg text-sm outline-none"
          style={{ background: "#111", border: "1px solid #222", color: "#fff" }}
        />
        <Select value={segment} onChange={setSegment}>
          <option value="all">all segments</option>
          {data.segments.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
        <Select value={stage} onChange={setStage}>
          <option value="all">all stages</option>
          {data.funnel.map((f, i) => (
            <option key={f.name} value={String(i)}>
              stopped at: {f.name}
            </option>
          ))}
        </Select>
        <Select value={channel} onChange={setChannel}>
          <option value="all">all sources</option>
          {data.channels.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select value={method} onChange={setMethod}>
          <option value="all">all sign-up methods</option>
          {data.signupMethods.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select value={sort} onChange={setSort}>
          <option value="lastSeen">sort: last seen</option>
          <option value="signedUp">sort: newest sign-ups</option>
          <option value="time">sort: most time spent</option>
          <option value="sessions">sort: most sessions</option>
          <option value="days">sort: most days active</option>
        </Select>
        <span className="text-xs" style={{ color: "#666" }}>
          {filtered.length} users
        </span>
        <button
          onClick={exportCSV}
          disabled={!filtered.length}
          className="text-xs px-3 py-1.5 rounded-lg font-semibold disabled:opacity-40"
          style={{ background: "#111", border: "1px solid #333", color: Y }}
        >
          ↓ csv ({filtered.length})
        </button>
      </div>

      {/* table */}
      <div className="rounded-xl border overflow-x-auto" style={{ borderColor: "#222" }}>
        <table className="w-full text-[13px]">
          <thead>
            <tr style={{ background: "#0d0d0d", color: "#666" }}>
              {[
                "user",
                "signed up",
                "found us via",
                "signed up via",
                "landed after sign-up",
                "sessions",
                "time spent",
                "days active",
                "last seen",
                "left from",
                "did",
                "stage",
                "segment"
              ].map((h) => (
                <th key={h} className="text-left text-[11px] font-semibold px-3 py-3 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, limit).map((u) => (
              <tr
                key={u.id}
                onClick={() => setJourneyUser(u.id)}
                className="border-t cursor-pointer hover:bg-[#141414]"
                style={{ borderColor: "#1a1a1a" }}
              >
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <div style={{ color: "#fff" }}>{u.name || "—"}</div>
                  <div className="text-[11px]" style={{ color: "#666" }}>
                    {u.email}
                  </div>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: "#aaa" }}>
                  <div>{date(u.signedUpAt)}</div>
                  <div className="text-[11px]" style={{ color: "#666" }}>
                    {u.signupMethod}
                  </div>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: "#aaa" }}>
                  <div>{u.channel}</div>
                  <div className="text-[11px] max-w-[180px] truncate" style={{ color: "#666" }} title={u.source || ""}>
                    {[u.source, u.campaign && `campaign: ${u.campaign}`, u.firstLanding && `landed: ${u.firstLanding}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: "#aaa" }}>
                  <div>{u.signupVia || "—"}</div>
                  {u.signupPage && (
                    <div className="text-[11px]" style={{ color: "#666" }}>
                      on {u.signupPage}
                    </div>
                  )}
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: "#aaa" }}>
                  {u.firstPageAfterSignup || "—"}
                </td>
                <td className="px-3 py-2.5 tabular-nums" style={{ color: "#aaa" }}>
                  {u.sessions || "—"}
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap tabular-nums" style={{ color: "#aaa" }}>
                  {dur(u.totalMs)}
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap tabular-nums" style={{ color: "#aaa" }}>
                  {u.daysActive || "—"}
                  {u.activeDays7 > 0 && (
                    <span className="text-[11px]" style={{ color: "#666" }}>
                      {" "}
                      ({u.activeDays7}/7)
                    </span>
                  )}
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: "#aaa" }}>
                  {ago(u.daysSinceSeen)}
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: "#aaa" }}>
                  {u.lastPage || "—"}
                </td>
                <td className="px-3 py-2.5 text-[11px] max-w-[220px]" style={{ color: "#999" }} title={u.actions.join(", ")}>
                  <div className="truncate">{u.actions.length ? u.actions.join(", ") : "—"}</div>
                  {u.teamProfile && (
                    <div className="truncate" style={{ color: "#a78bfa" }}>
                      AI profile pre-generated by team
                    </div>
                  )}
                  {u.areas.length > 0 && (
                    <div className="truncate" style={{ color: B }}>
                      explored: {u.areas.join(", ")}
                    </div>
                  )}
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap text-[12px]" style={{ color: "#ccc" }}>
                  {u.stage + 1}. {u.stageName.split(" (")[0]}
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <span
                    className="text-[11px] px-2 py-0.5 rounded-full font-bold"
                    style={{ background: `${SEGMENT_COLOR[u.segment]}22`, color: SEGMENT_COLOR[u.segment] }}
                  >
                    {u.segmentName}
                  </span>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={13} className="px-4 py-10 text-center text-xs" style={{ color: "#555" }}>
                  no users match these filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {filtered.length > limit && (
        <div className="text-center">
          <button
            onClick={() => setLimit((l) => l + 200)}
            className="text-xs px-4 py-2 rounded-lg font-semibold"
            style={{ background: "#111", border: "1px solid #333", color: Y }}
          >
            show more ({filtered.length - limit} left)
          </button>
        </div>
      )}

      <UserJourneyModal userId={journeyUser} onClose={() => setJourneyUser(null)} />
    </div>
  );
}
