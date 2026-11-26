import { useEffect, useMemo, useState } from "react";
import { callAdminApi } from "../../supabaseAdminClient";

// Admin: payments. Every paid service (old batch mentorship left out), from
// api/_payments.js (op "payments_report"). Typetober comes grouped per
// checkout — one row per payment, not per illustration:
//   totals → per service → per event (INR + USD) → every payment, searchable.
// One row = one payment attempt; "paid" = status success.

const Y = "#FFD007";
const G = "#22c55e";
const R = "#f87171";
const O = "#fb923c";
const B = "#60a5fa";
const MUTED = "#777";
const box = { background: "#111", border: "1px solid #222" };

const SERVICES = {
  plan: { label: "Membership plans", color: Y },
  event: { label: "Live events", color: B },
  recording: { label: "Event recordings", color: "#a78bfa" },
  portfolio_review: { label: "Portfolio reviews", color: G },
  mentorship: { label: "1:1 mentorship", color: O },
  typetober: { label: "Typetober", color: "#f472b6" }
};
const SERVICE_ORDER = Object.keys(SERVICES);

const SOURCES = [
  { id: "razorpay", label: "razorpay only", match: (s) => s === "razorpay" },
  { id: "paid", label: "razorpay + manual", match: (s) => s !== "test" },
  { id: "manual", label: "manual grants only", match: (s) => s === "manual" },
  { id: "all", label: "everything incl. test", match: () => true }
];
const STATUSES = ["success", "pending", "failed", "refunded", "all"];
const RANGES = [
  { id: 0, label: "all time" },
  { id: 7, label: "7 days" },
  { id: 30, label: "30 days" },
  { id: 90, label: "90 days" }
];
const STATUS_COLOR = { success: G, pending: Y, failed: R, refunded: O };
const SOURCE_COLOR = { razorpay: B, manual: O, test: "#555" };

const money = (n, cur = "INR") =>
  cur === "USD"
    ? `$${Number(n || 0).toLocaleString("en-US")}`
    : `₹${Number(n || 0).toLocaleString("en-IN")}`;
const fmtWhen = (t) =>
  t
    ? new Date(t).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : "—";
const fmtDay = (t) =>
  t
    ? new Date(t).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    : "—";

// totals across a set of rows, split by currency
function sum(rows) {
  const paid = rows.filter((r) => r.status === "success");
  const inr = paid.filter((r) => r.currency !== "USD");
  const usd = paid.filter((r) => r.currency === "USD");
  return {
    paid: paid.length,
    payers: new Set(paid.map((r) => r.user_id || r.email)).size,
    inr: inr.reduce((s, r) => s + r.amount, 0),
    usd: usd.reduce((s, r) => s + r.amount, 0),
    inrCount: inr.length,
    usdCount: usd.length,
    pending: rows.filter((r) => r.status === "pending").length,
    failed: rows.filter((r) => r.status === "failed").length,
    free: paid.filter((r) => !r.amount).length
  };
}

const moneyLine = (t) =>
  [t.inr || !t.usd ? money(t.inr) : null, t.usd ? money(t.usd, "USD") : null]
    .filter(Boolean)
    .join(" + ");

function downloadCSV(name, rows) {
  if (!rows.length) return;
  const cols = Object.keys(rows[0]);
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [
    cols.join(","),
    ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))
  ].join("\n");
  const url = URL.createObjectURL(
    new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" })
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function Stat({ label, value, sub, color = "#fff" }) {
  return (
    <div className="rounded-xl p-4" style={box}>
      <div
        className="text-[11px] font-semibold uppercase tracking-wider"
        style={{ color: MUTED }}
      >
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

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-lg text-xs font-semibold"
      style={{
        background: active ? Y : "#111",
        color: active ? "#000" : "#888",
        border: "1px solid #222"
      }}
    >
      {children}
    </button>
  );
}

function Pill({ color, children }) {
  return (
    <span
      className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap"
      style={{
        background: `${color}22`,
        color,
        border: `1px solid ${color}55`
      }}
    >
      {children}
    </span>
  );
}

function Section({ title, note, right, children }) {
  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-white">{title}</h3>
          {note && (
            <p className="text-[13px] mt-1 max-w-3xl" style={{ color: MUTED }}>
              {note}
            </p>
          )}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

const th = "px-3 py-2.5 text-left font-semibold text-[12px] whitespace-nowrap";
const td = "px-3 py-2.5 align-top";

export default function PaymentsTab() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);

  const [source, setSource] = useState("razorpay");
  const [range, setRange] = useState(0);
  const [status, setStatus] = useState("success");
  const [service, setService] = useState("all");
  const [eventId, setEventId] = useState(null);
  const [search, setSearch] = useState("");
  const [showAllEvents, setShowAllEvents] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    callAdminApi({ op: "payments_report" }).then((r) => {
      if (cancelled) return;
      if (r.error) setError(r.error.message || "failed to load");
      else {
        setError("");
        setData(r);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [reload]);

  // source + date range apply everywhere; status / service / search only to the list
  const scoped = useMemo(() => {
    if (!data) return [];
    const match = SOURCES.find((s) => s.id === source).match;
    const since = range ? Date.now() - range * 86400000 : 0;
    return data.rows.filter(
      (r) => match(r.source) && (!since || Date.parse(r.created_at) >= since)
    );
  }, [data, source, range]);

  const totals = useMemo(() => sum(scoped), [scoped]);

  const byService = useMemo(
    () =>
      SERVICE_ORDER.map((id) => ({
        id,
        ...SERVICES[id],
        t: sum(scoped.filter((r) => r.service === id))
      })).filter((s) => s.t.paid || s.t.pending || s.t.failed),
    [scoped]
  );

  // per event: live seats (INR / USD) + recordings
  const eventRows = useMemo(() => {
    if (!data) return [];
    const evMeta = new Map(data.events.map((e) => [e.id, e]));
    const groups = new Map();
    for (const r of scoped) {
      if (r.service !== "event" && r.service !== "recording") continue;
      const key = r.event_id || `title:${r.item}`;
      if (!groups.has(key))
        groups.set(key, {
          key,
          event_id: r.event_id,
          title: r.item,
          live: [],
          rec: []
        });
      groups.get(key)[r.service === "event" ? "live" : "rec"].push(r);
    }
    return [...groups.values()]
      .map((g) => ({
        ...g,
        meta: evMeta.get(g.event_id),
        live: sum(g.live),
        rec: sum(g.rec)
      }))
      .filter(
        (g) => g.live.paid || g.rec.paid || g.live.pending || g.rec.pending
      )
      .sort(
        (a, b) =>
          Date.parse(b.meta?.start_time || 0) -
            Date.parse(a.meta?.start_time || 0) || b.live.paid - a.live.paid
      );
  }, [data, scoped]);

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return scoped.filter(
      (r) =>
        (status === "all" || r.status === status) &&
        (service === "all" || r.service === service) &&
        (!eventId || r.event_id === eventId) &&
        (!q ||
          [
            r.name,
            r.email,
            r.username,
            r.phone,
            r.item,
            r.order_id,
            r.payment_ref
          ]
            .join(" ")
            .toLowerCase()
            .includes(q))
    );
  }, [scoped, status, service, eventId, search]);

  const listTotals = useMemo(() => sum(list), [list]);

  const focusEvent = (id) => {
    setEventId(id);
    setService("all");
    setTimeout(
      () =>
        document
          .getElementById("payments-list")
          ?.scrollIntoView({ behavior: "smooth" }),
      0
    );
  };
  const focusService = (id) => {
    setService(id);
    setEventId(null);
    setTimeout(
      () =>
        document
          .getElementById("payments-list")
          ?.scrollIntoView({ behavior: "smooth" }),
      0
    );
  };

  if (loading && !data)
    return (
      <div className="py-20 text-center text-sm" style={{ color: MUTED }}>
        loading payments…
      </div>
    );
  if (error && !data)
    return (
      <div className="py-20 text-center text-sm" style={{ color: R }}>
        couldn't load payments: {error}
        <div>
          <button
            className="mt-3 underline"
            style={{ color: Y }}
            onClick={() => setReload((k) => k + 1)}
          >
            try again
          </button>
        </div>
      </div>
    );

  const focusedEvent = eventId
    ? eventRows.find((e) => e.event_id === eventId)
    : null;
  const shownEvents = showAllEvents ? eventRows : eventRows.slice(0, 15);

  return (
    <div className="pb-16">
      {/* header + global filters */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">Payments</h2>
          <p className="text-[13px] mt-1 max-w-3xl" style={{ color: MUTED }}>
            Every paid service on the platform: membership plans, live events (₹
            and $), recordings, portfolio reviews, 1:1 mentorship and Typetober
            (one row per checkout, however many illustrations it covered).
          </p>
        </div>
        <button
          onClick={() => setReload((k) => k + 1)}
          className="text-xs px-3 py-1.5 rounded-lg font-semibold"
          style={{ ...box, color: Y }}
        >
          {loading ? "refreshing…" : "↻ refresh"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mt-5 items-center">
        {SOURCES.map((s) => (
          <Chip
            key={s.id}
            active={source === s.id}
            onClick={() => setSource(s.id)}
          >
            {s.label}
          </Chip>
        ))}
        <span className="mx-2" style={{ color: "#333" }}>
          |
        </span>
        {RANGES.map((r) => (
          <Chip
            key={r.id}
            active={range === r.id}
            onClick={() => setRange(r.id)}
          >
            {r.label}
          </Chip>
        ))}
      </div>

      {data?.warnings?.length > 0 && (
        <div
          className="mt-4 rounded-lg px-4 py-3 text-[12px]"
          style={{ ...box, color: O }}
        >
          Some data couldn't load: {data.warnings.join(" · ")}
        </div>
      )}

      {/* totals */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
        <Stat
          label="Revenue (₹)"
          value={money(totals.inr)}
          sub={`${totals.inrCount} paid in rupees`}
          color={Y}
        />
        <Stat
          label="Revenue ($)"
          value={money(totals.usd, "USD")}
          sub={`${totals.usdCount} paid in dollars`}
          color={B}
        />
        <Stat
          label="Paid payments"
          value={totals.paid.toLocaleString("en-IN")}
          sub={
            totals.free
              ? `${totals.free} of them free grants (₹0)`
              : "status success"
          }
        />
        <Stat
          label="People who paid"
          value={totals.payers.toLocaleString("en-IN")}
          sub={`${totals.pending} pending · ${totals.failed} failed`}
        />
      </div>

      {/* per service */}
      <Section
        title="By service"
        note="Click a service to see who paid for it."
      >
        {!byService.length && (
          <div className="text-sm" style={{ color: "#555" }}>
            No payments in this range.
          </div>
        )}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {byService.map((s) => (
            <button
              key={s.id}
              onClick={() => focusService(s.id)}
              className="rounded-xl p-4 text-left transition-colors"
              style={{
                ...box,
                borderColor: service === s.id ? s.color : "#222"
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: s.color }}
                />
                <span className="text-sm font-bold text-white">{s.label}</span>
              </div>
              <div
                className="text-xl font-extrabold mt-2"
                style={{ color: s.color }}
              >
                {moneyLine(s.t)}
              </div>
              <div className="text-[12px] mt-1" style={{ color: MUTED }}>
                {s.t.paid} paid · {s.t.payers}{" "}
                {s.t.payers === 1 ? "person" : "people"}
                {s.t.pending ? ` · ${s.t.pending} pending` : ""}
                {s.t.failed ? ` · ${s.t.failed} failed` : ""}
              </div>
            </button>
          ))}
        </div>
      </Section>

      {/* every payment */}
      <div id="payments-list" />
      <Section
        title="Who paid"
        note="One row per payment. Manual grants are payments recorded from the grant access tab (paid by UPI / bank transfer, or given free)."
      >
        <div className="flex flex-wrap gap-2 items-center mb-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search name, email, phone, item, payment id…"
            className="flex-1 min-w-[220px] px-4 py-2 rounded-lg text-sm outline-none"
            style={{ ...box, color: "#fff" }}
          />
          <select
            value={service}
            onChange={(e) => {
              setService(e.target.value);
              setEventId(null);
            }}
            className="px-3 py-2 rounded-lg text-sm outline-none"
            style={{ ...box, color: "#ddd" }}
          >
            <option value="all">all services</option>
            {SERVICE_ORDER.map((id) => (
              <option key={id} value={id}>
                {SERVICES[id].label}
              </option>
            ))}
          </select>
          {STATUSES.map((s) => (
            <Chip key={s} active={status === s} onClick={() => setStatus(s)}>
              {s === "success" ? "paid" : s}
            </Chip>
          ))}
        </div>

        {focusedEvent && (
          <div
            className="flex items-center gap-2 mb-3 text-[13px]"
            style={{ color: "#ddd" }}
          >
            <span style={{ color: MUTED }}>event:</span>
            <span className="font-semibold">{focusedEvent.title}</span>
            <button
              className="text-xs underline"
              style={{ color: Y }}
              onClick={() => setEventId(null)}
            >
              clear
            </button>
          </div>
        )}

        <div
          className="flex flex-wrap items-center justify-between gap-2 mb-3 text-[12px]"
          style={{ color: MUTED }}
        >
          <span>
            {list.length.toLocaleString("en-IN")} rows · {listTotals.paid} paid
            · {moneyLine(listTotals)}
          </span>
          <button
            className="text-xs px-3 py-1.5 rounded-lg font-semibold"
            style={{ ...box, color: Y }}
            onClick={() =>
              downloadCSV(
                "payments.csv",
                list.map((r) => ({
                  date: fmtWhen(r.created_at),
                  name: r.name,
                  email: r.email,
                  phone: r.phone,
                  service: SERVICES[r.service]?.label || r.service,
                  item: r.item,
                  amount: r.amount,
                  currency: r.currency,
                  status: r.status,
                  source: r.source,
                  order_id: r.order_id,
                  payment_ref: r.payment_ref
                }))
              )
            }
          >
            ↓ csv
          </button>
        </div>

        <div className="rounded-xl overflow-hidden" style={box}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid #222", color: "#666" }}>
                  <th className={th}>date</th>
                  <th className={th}>who</th>
                  <th className={th}>service</th>
                  <th className={th}>item</th>
                  <th className={`${th} text-right`}>amount</th>
                  <th className={th}>status</th>
                  <th className={th}>source</th>
                  <th className={th}>payment ref</th>
                </tr>
              </thead>
              <tbody>
                {!list.length && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-10 text-center"
                      style={{ color: "#555" }}
                    >
                      no payments match these filters
                    </td>
                  </tr>
                )}
                {list.slice(0, 500).map((r, i) => (
                  <tr
                    key={`${r.table}:${r.id}`}
                    style={{
                      borderBottom: "1px solid #1a1a1a",
                      background: i % 2 ? "#0d0d0d" : "transparent"
                    }}
                  >
                    <td
                      className={`${td} whitespace-nowrap text-[12px]`}
                      style={{ color: MUTED }}
                    >
                      {fmtWhen(r.created_at)}
                    </td>
                    <td className={td}>
                      <div className="text-white font-semibold">
                        {r.name || "—"}
                      </div>
                      <div className="text-[12px]" style={{ color: MUTED }}>
                        {r.email}
                        {r.phone ? ` · ${r.phone}` : ""}
                      </div>
                    </td>
                    <td className={td}>
                      <Pill color={SERVICES[r.service]?.color || "#888"}>
                        {SERVICES[r.service]?.label || r.service}
                      </Pill>
                    </td>
                    <td
                      className={`${td} max-w-[260px]`}
                      style={{ color: "#ddd" }}
                    >
                      {r.item}
                    </td>
                    <td
                      className={`${td} text-right font-bold whitespace-nowrap`}
                      style={{ color: r.currency === "USD" ? B : Y }}
                    >
                      {r.amount ? money(r.amount, r.currency) : "free"}
                    </td>
                    <td className={td}>
                      <Pill color={STATUS_COLOR[r.status] || "#888"}>
                        {r.status === "success" ? "paid" : r.status}
                      </Pill>
                    </td>
                    <td className={td}>
                      <Pill color={SOURCE_COLOR[r.source] || "#888"}>
                        {r.source}
                      </Pill>
                    </td>
                    <td
                      className={`${td} text-[11px] font-mono max-w-[200px] truncate`}
                      style={{ color: "#555" }}
                      title={[r.payment_ref, r.order_id]
                        .filter(Boolean)
                        .join("\n")}
                    >
                      {r.payment_ref || r.order_id || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {list.length > 500 && (
            <div
              className="py-2.5 text-center text-[12px]"
              style={{ color: MUTED, borderTop: "1px solid #222" }}
            >
              showing the latest 500 of {list.length.toLocaleString("en-IN")} —
              narrow the filters or download the csv for all of them
            </div>
          )}
        </div>
      </Section>
      {/* per event */}
      <Section
        title="Events"
        note="Live seats split by currency (Indian buyers pay ₹, everyone else $), plus recordings bought after the event. Click a row for the list of payers."
        right={
          eventRows.length > 0 && (
            <button
              className="text-xs px-3 py-1.5 rounded-lg font-semibold"
              style={{ ...box, color: Y }}
              onClick={() =>
                downloadCSV(
                  "event-payments-summary.csv",
                  eventRows.map((e) => ({
                    event: e.title,
                    date: fmtDay(e.meta?.start_time),
                    type: e.meta?.event_type || "",
                    price_inr: e.meta?.price_inr ?? "",
                    price_usd: e.meta?.price_usd ?? "",
                    live_paid_inr: e.live.inrCount,
                    live_revenue_inr: e.live.inr,
                    live_paid_usd: e.live.usdCount,
                    live_revenue_usd: e.live.usd,
                    recordings_paid: e.rec.paid,
                    recordings_revenue_inr: e.rec.inr,
                    pending: e.live.pending + e.rec.pending
                  }))
                )
              }
            >
              ↓ csv
            </button>
          )
        }
      >
        {!eventRows.length ? (
          <div className="text-sm" style={{ color: "#555" }}>
            No event payments in this range.
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden" style={box}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid #222", color: "#666" }}>
                    <th className={th}>event</th>
                    <th className={th}>date</th>
                    <th className={th}>price</th>
                    <th className={`${th} text-right`}>paid ₹</th>
                    <th className={`${th} text-right`}>₹ total</th>
                    <th className={`${th} text-right`}>paid $</th>
                    <th className={`${th} text-right`}>$ total</th>
                    <th className={`${th} text-right`}>recordings</th>
                    <th className={`${th} text-right`}>pending</th>
                  </tr>
                </thead>
                <tbody>
                  {shownEvents.map((e, i) => (
                    <tr
                      key={e.key}
                      onClick={() => e.event_id && focusEvent(e.event_id)}
                      className="cursor-pointer hover:bg-[#161616]"
                      style={{
                        borderBottom: "1px solid #1a1a1a",
                        background:
                          eventId && eventId === e.event_id
                            ? "#1a1a0a"
                            : i % 2
                              ? "#0d0d0d"
                              : "transparent"
                      }}
                    >
                      <td
                        className={`${td} text-white font-semibold max-w-[280px]`}
                      >
                        {e.title}
                        {e.meta?.event_type && (
                          <span
                            className="ml-2 text-[11px] font-normal"
                            style={{ color: MUTED }}
                          >
                            {e.meta.event_type}
                          </span>
                        )}
                      </td>
                      <td
                        className={`${td} whitespace-nowrap text-[12px]`}
                        style={{ color: MUTED }}
                      >
                        {fmtDay(e.meta?.start_time)}
                      </td>
                      <td
                        className={`${td} whitespace-nowrap text-[12px]`}
                        style={{ color: "#aaa" }}
                      >
                        {e.meta
                          ? `${e.meta.price_inr != null ? money(e.meta.price_inr) : "default"} / ${money(
                              e.meta.price_usd ?? 1,
                              "USD"
                            )}`
                          : "—"}
                      </td>
                      <td
                        className={`${td} text-right`}
                        style={{ color: "#ddd" }}
                      >
                        {e.live.inrCount || "—"}
                      </td>
                      <td
                        className={`${td} text-right font-bold`}
                        style={{ color: Y }}
                      >
                        {e.live.inr ? money(e.live.inr) : "—"}
                      </td>
                      <td
                        className={`${td} text-right`}
                        style={{ color: "#ddd" }}
                      >
                        {e.live.usdCount || "—"}
                      </td>
                      <td
                        className={`${td} text-right font-bold`}
                        style={{ color: B }}
                      >
                        {e.live.usd ? money(e.live.usd, "USD") : "—"}
                      </td>
                      <td
                        className={`${td} text-right whitespace-nowrap`}
                        style={{ color: "#ddd" }}
                      >
                        {e.rec.paid
                          ? `${e.rec.paid} · ${money(e.rec.inr)}`
                          : "—"}
                      </td>
                      <td
                        className={`${td} text-right`}
                        style={{
                          color: e.live.pending + e.rec.pending ? Y : "#444"
                        }}
                      >
                        {e.live.pending + e.rec.pending || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {eventRows.length > 15 && (
              <button
                className="w-full py-2.5 text-xs font-semibold"
                style={{ color: Y, borderTop: "1px solid #222" }}
                onClick={() => setShowAllEvents((v) => !v)}
              >
                {showAllEvents
                  ? "show fewer"
                  : `show all ${eventRows.length} events`}
              </button>
            )}
          </div>
        )}
      </Section>

    </div>
  );
}
