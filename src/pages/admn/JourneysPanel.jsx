import { useCallback, useEffect, useState } from "react";
import { callAdminApi } from "../../supabaseAdminClient";

// Admin platform report → Journeys: where people start, where they go on
// the site and in the platform, what they do, and where they leave.
// Built by api/_platformJourneys.js (ops "platform_journeys" and
// "platform_user_journey"); tracking in src/lib/platformAnalytics.js.

const Y = "#FFD007";
const G = "#22c55e";
const P = "#DF0586";

const KIND_COLOR = { page: "#ddd", cta: Y, action: G, leave: P };

const when = (ts) =>
  new Date(ts).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
const time = (ts) =>
  new Date(ts).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" });
const mins = (ms) => (ms < 60000 ? `${Math.round(ms / 1000)}s` : `${Math.round(ms / 60000)} min`);

function Card({ label, value, sub, color = "#fff" }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "#111", border: "1px solid #222" }}>
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
    </div>
  );
}

const Box = ({ title, children }) => (
  <div className="rounded-xl p-4" style={{ background: "#111", border: "1px solid #222" }}>
    {title && (
      <div className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#777" }}>
        {title}
      </div>
    )}
    {children}
  </div>
);

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

function Bars({ rows, color = Y, extra }) {
  const max = Math.max(1, ...rows.map((r) => r[1]));
  if (!rows.length)
    return (
      <div className="text-sm" style={{ color: "#555" }}>
        Nothing yet.
      </div>
    );
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r[0]}>
          <div className="flex justify-between text-[13px]" style={{ color: "#ddd" }}>
            <span className="truncate pr-3">{r[0]}</span>
            <span className="whitespace-nowrap">
              {r[1]}
              {extra && <span style={{ color: "#666" }}> · {extra(r)}</span>}
            </span>
          </div>
          <div className="h-1.5 rounded mt-1" style={{ background: "#1d1d1d" }}>
            <div className="h-1.5 rounded" style={{ width: `${(r[1] / max) * 100}%`, background: color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Funnel({ stages }) {
  const max = Math.max(1, stages[0]?.people || 0);
  return (
    <div className="space-y-2">
      {stages.map((s, i) => (
        <div key={s.name}>
          <div className="flex justify-between text-[13px]" style={{ color: "#ddd" }}>
            <span>
              <span style={{ color: "#666" }}>{i + 1}. </span>
              {s.name}
            </span>
            <span className="whitespace-nowrap">
              <b className="text-white">{s.people}</b>
              <span style={{ color: "#666" }}>
                {" "}
                · {s.ofAll}% of visitors
                {s.ofPrev != null && (
                  <>
                    {" "}
                    · <span style={{ color: s.ofPrev < 30 ? P : "#888" }}>{s.ofPrev}% of step {i}</span>
                  </>
                )}
              </span>
            </span>
          </div>
          <div className="h-5 rounded mt-1" style={{ background: "#1d1d1d" }}>
            <div
              className="h-5 rounded"
              style={{ width: `${(s.people / max) * 100}%`, minWidth: s.people ? 4 : 0, background: i === stages.length - 1 ? G : Y }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// one session as a row of chips: page → page → action → Left
function StepChain({ steps }) {
  return (
    <div className="flex flex-wrap items-center gap-1 text-[12px]">
      {steps.map((st, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span style={{ color: "#444" }}>→</span>}
          <span
            className="px-2 py-0.5 rounded-md"
            title={when(st.t)}
            style={{
              background: st.kind === "page" ? "#1a1a1a" : "transparent",
              border: `1px solid ${st.kind === "page" ? "#2a2a2a" : KIND_COLOR[st.kind]}`,
              color: KIND_COLOR[st.kind]
            }}
          >
            {st.name}
          </span>
        </span>
      ))}
    </div>
  );
}

export default function JourneysPanel({ rangeDays, onOpenUser }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [source, setSource] = useState("");
  const [from, setFrom] = useState("");
  const [onlySignedIn, setOnlySignedIn] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await callAdminApi({ op: "platform_journeys", rangeDays });
    if (res.error) setError(res.error.message || "Couldn't load journeys.");
    else {
      setData(res);
      setFrom((f) => f || res.next?.[0]?.name || "");
    }
    setLoading(false);
  }, [rangeDays]);

  useEffect(() => {
    load();
  }, [load]);

  if (error)
    return (
      <div className="rounded-lg p-3 text-sm" style={{ background: "#2a0f12", color: "#f87171" }}>
        {error}
      </div>
    );
  if (!data) return <p style={{ color: "#666" }}>{loading ? "Loading journeys…" : ""}</p>;

  const d = data;
  const funnel = source ? d.funnelBySource.find((f) => f.source === source)?.stages || d.funnel : d.funnel;
  const nextFrom = d.next.find((n) => n.name === from);
  const recent = onlySignedIn ? d.recent.filter((s) => s.user) : d.recent;

  return (
    <div>
      {d.warnings?.length > 0 && (
        <div className="mb-4 rounded-lg p-3 text-sm" style={{ background: "#2a230f", color: Y }}>
          Journeys need supabase/migrations/platform_journeys.sql to be run.
          <div className="text-[12px] mt-1" style={{ color: "#a08a3a" }}>
            {d.warnings.join(" · ")}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <Card label="Sessions" value={d.summary.sessions} color={Y} />
        <Card label="People" value={d.summary.people} sub="accounts, or browsers if signed out" />
        <Card label="Signed-in sessions" value={d.summary.signedIn} />
        <Card label="Pages per session" value={d.summary.avgPages} />
        <Card label="Time per session" value={`${d.summary.avgMinutes} min`} sub="sessions with 2+ steps" />
        <Card label="Bounced" value={`${d.summary.bounceRate}%`} sub="one page, nothing else" color={d.summary.bounceRate > 60 ? P : "#fff"} />
      </div>

      <Section
        title="Funnel"
        note="How far each person got in the range, in any session. Someone who signed in counts as having passed the steps before it."
      >
        <Box>
          <div className="flex flex-wrap gap-2 mb-4">
            {[["", "Everyone"], ...d.funnelBySource.map((f) => [f.source, f.source])].map(([k, l]) => (
              <button
                key={k || "all"}
                onClick={() => setSource(k)}
                className="px-3 py-1.5 rounded-lg text-[12px] font-semibold"
                style={source === k ? { background: Y, color: "#000" } : { background: "#1a1a1a", border: "1px solid #333", color: "#ddd" }}
              >
                {l}
              </button>
            ))}
          </div>
          <Funnel stages={funnel} />
        </Box>
      </Section>

      <Section title="Where people start and where they leave">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Box title="Entry page (first page of a session)">
            <Bars rows={d.entries} />
          </Box>
          <Box title="Exit page (last page before leaving)">
            <Bars rows={d.exits} color={P} extra={(r) => `${r[2]}% of sessions on it ended there`} />
          </Box>
        </div>
      </Section>

      <Section title="Where people go next" note="Pick a page or step to see what people did right after it.">
        <Box>
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm mb-4 w-full md:w-auto"
            style={{ background: "#1a1a1a", border: "1px solid #333", color: "#ddd" }}
          >
            {d.next.map((n) => (
              <option key={n.name} value={n.name}>
                {n.name} ({n.total})
              </option>
            ))}
          </select>
          {nextFrom ? (
            <Bars
              rows={nextFrom.next}
              color={G}
              extra={(r) => `${Math.round((r[1] / nextFrom.total) * 100)}%`}
            />
          ) : (
            <div className="text-sm" style={{ color: "#555" }}>
              Nothing yet.
            </div>
          )}
        </Box>
      </Section>

      <Section title="Most common journeys" note="The first six steps of each session.">
        <Box>
          <div className="space-y-2">
            {d.paths.map(([path, n]) => (
              <div key={path} className="flex items-start justify-between gap-3 text-[13px]" style={{ color: "#ddd" }}>
                <span>{path}</span>
                <span className="whitespace-nowrap font-bold text-white">{n}</span>
              </div>
            ))}
            {!d.paths.length && (
              <div className="text-sm" style={{ color: "#555" }}>
                Nothing yet.
              </div>
            )}
          </div>
        </Box>
      </Section>

      <Section
        title="Recent sessions"
        note="Grey: pages · yellow: CTA clicks · green: actions · pink: left the site. Click a name for that person's whole journey."
      >
        <label className="flex items-center gap-2 text-[13px] mb-2" style={{ color: "#aaa" }}>
          <input type="checkbox" checked={onlySignedIn} onChange={(e) => setOnlySignedIn(e.target.checked)} />
          Signed-in only
        </label>
        <div className="space-y-2">
          {recent.map((s) => (
            <div key={s.id} className="rounded-xl p-3" style={{ background: "#111", border: "1px solid #222" }}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] mb-2" style={{ color: "#888" }}>
                {s.user ? (
                  <button onClick={() => onOpenUser(s.user.id)} className="font-semibold underline" style={{ color: Y }}>
                    {s.user.name || s.user.email}
                  </button>
                ) : (
                  <span>Signed-out visitor</span>
                )}
                <span>{when(s.start)}</span>
                <span>{mins(s.durationMs)}</span>
                <span>from {s.source}</span>
                {s.campaign && <span>· {s.campaign}</span>}
              </div>
              <StepChain steps={s.steps} />
            </div>
          ))}
          {!recent.length && (
            <p className="text-sm" style={{ color: "#555" }}>
              No sessions yet.
            </p>
          )}
        </div>
      </Section>
    </div>
  );
}

// a person's whole journey, every session, newest first
export function UserJourneyModal({ userId, onClose }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;
    setData(null);
    setError("");
    callAdminApi({ op: "platform_user_journey", userId }).then((res) =>
      res.error ? setError(res.error.message || "Couldn't load.") : setData(res)
    );
  }, [userId]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!userId) return null;
  const u = data?.user;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div
        className="h-full w-full max-w-2xl overflow-y-auto p-5"
        style={{ background: "#0a0a0a", borderLeft: "1px solid #222" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">{u ? u.name || u.email : "Journey"}</h3>
            {u && (
              <p className="text-[13px]" style={{ color: "#888" }}>
                {u.email} · account created {when(u.created_at)}
              </p>
            )}
          </div>
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg text-sm" style={{ background: "#1a1a1a", color: "#ddd" }}>
            Close
          </button>
        </div>

        {error && <p style={{ color: "#f87171" }}>{error}</p>}
        {!data && !error && <p style={{ color: "#666" }}>Loading…</p>}

        {data && (
          <>
            <div className="grid grid-cols-3 gap-2 mb-5">
              <Card label="First came from" value={<span className="text-base">{data.firstSource || "unknown"}</span>} sub={data.firstCampaign} />
              <Card label="First seen" value={<span className="text-base">{data.firstSeen ? when(data.firstSeen) : "–"}</span>} />
              <Card label="Sessions" value={data.sessionCount} />
            </div>

            {data.sessions.map((s) => (
              <div key={s.id} className="rounded-xl p-3 mb-2" style={{ background: "#111", border: "1px solid #222" }}>
                <div className="flex flex-wrap gap-x-3 text-[12px] mb-2" style={{ color: "#888" }}>
                  <span className="text-white font-semibold">{when(s.start)}</span>
                  <span>{mins(s.durationMs)}</span>
                  <span>from {s.source}</span>
                </div>
                <div className="space-y-1">
                  {s.steps.map((st, i) => (
                    <div key={i} className="flex gap-3 text-[13px]">
                      <span className="w-12 shrink-0" style={{ color: "#555" }}>
                        {time(st.t)}
                      </span>
                      <span style={{ color: KIND_COLOR[st.kind] }}>{st.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {!data.sessions.length && (
              <p className="text-sm" style={{ color: "#555" }}>
                No tracked sessions yet. Tracking started with the journeys update.
              </p>
            )}

            {data.otherActions.length > 0 && (
              <>
                <h4 className="text-sm font-bold text-white mt-5 mb-2">Actions outside a tracked session</h4>
                <div className="space-y-1">
                  {data.otherActions.map((a, i) => (
                    <div key={i} className="flex gap-3 text-[13px]">
                      <span className="w-28 shrink-0" style={{ color: "#555" }}>
                        {when(a.t)}
                      </span>
                      <span style={{ color: G }}>{a.name}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
