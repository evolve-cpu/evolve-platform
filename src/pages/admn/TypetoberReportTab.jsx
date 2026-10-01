import { useCallback, useEffect, useMemo, useState } from "react";
import { supabaseAdmin } from "../../supabaseAdminClient";

// Admin: Typetober daily report. Everything is aggregated here from three
// tables (see supabase/migrations/typetober_submissions.sql):
//   typetober_submissions   payments and submissions (one row per image)
//   typetober_participants  accounts that opened /typetober signed in,
//                           new_account = created for Typetober
//   typetober_activity      one row per user per India day, last_seen for
//                           "online now"
// Days are India calendar days (IST).

const Y = "#FFD007";
const P = "#DF0586";
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const ONLINE_MS = 5 * 60000;
const STALE_PENDING_MS = 60 * 60000; // unpaid for an hour = abandoned

const istDay = (ts) => new Date(Date.parse(ts) + 5.5 * 3600000).toISOString().slice(0, 10);
const todayIst = () => istDay(new Date().toISOString());
const inr = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const usd = (n) => `$${Number(n).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
const dayLabel = (d) =>
  new Date(`${d}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", weekday: "short" });

async function fetchAll(table, columns) {
  const out = [];
  const size = 1000;
  for (let from = 0; ; from += size) {
    const { data, error } = await supabaseAdmin
      .from(table)
      .select(columns)
      .range(from, from + size - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    out.push(...(data || []));
    if (!data || data.length < size) break;
  }
  return out;
}

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

export default function TypetoberReportTab() {
  const [subs, setSubs] = useState([]);
  const [parts, setParts] = useState([]);
  const [acts, setActs] = useState([]);
  const [names, setNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updated, setUpdated] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [s, p, a] = await Promise.all([
        fetchAll(
          "typetober_submissions",
          "id,user_id,letter_index,amount,currency,status,razorpay_order_id,created_at"
        ),
        fetchAll("typetober_participants", "user_id,joined_at,new_account").catch((e) => {
          console.error(e);
          return [];
        }),
        fetchAll("typetober_activity", "user_id,day,last_seen").catch((e) => {
          console.error(e);
          return [];
        })
      ]);
      setSubs(s);
      setParts(p);
      setActs(a);

      // Names for the latest orders.
      const ids = [...new Set(s.filter((r) => r.status === "success").slice(-200).map((r) => r.user_id))];
      if (ids.length) {
        const { data } = await supabaseAdmin
          .from("profiles")
          .select("id,name,username,email")
          .in("id", ids);
        const m = {};
        (data || []).forEach((r) => (m[r.id] = r));
        setNames(m);
      }
      setUpdated(new Date());
    } catch (err) {
      console.error("typetober report error:", err);
      setError(err.message || "Couldn't load the report.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [load]);

  const report = useMemo(() => {
    const now = Date.now();
    const paid = subs.filter((r) => r.status === "success");
    const abandoned = subs.filter(
      (r) => r.status === "failed" || (r.status === "pending" && now - Date.parse(r.created_at) > STALE_PENDING_MS)
    );
    const orderKey = (r) => r.razorpay_order_id || `dev-${r.id}`;

    const days = new Map();
    const day = (d) => {
      if (!days.has(d))
        days.set(d, {
          day: d,
          newAccounts: 0,
          joined: 0,
          active: 0,
          submissions: 0,
          payers: new Set(),
          orders: new Map(),
          inr: 0,
          usd: 0,
          abandoned: 0
        });
      return days.get(d);
    };

    parts.forEach((r) => {
      const d = day(istDay(r.joined_at));
      d.joined++;
      if (r.new_account) d.newAccounts++;
    });
    acts.forEach((r) => day(r.day).active++);
    paid.forEach((r) => {
      const d = day(istDay(r.created_at));
      d.submissions++;
      d.payers.add(r.user_id);
      const k = orderKey(r);
      d.orders.set(k, (d.orders.get(k) || 0) + 1);
      if (r.currency === "USD") d.usd += Number(r.amount) || 0;
      else d.inr += Number(r.amount) || 0;
    });
    abandoned.forEach((r) => day(istDay(r.created_at)).abandoned++);

    const rows = [...days.values()]
      .map((d) => ({
        ...d,
        payers: d.payers.size,
        orderCount: d.orders.size,
        bulkOrders: [...d.orders.values()].filter((n) => n > 1).length
      }))
      .sort((a, b) => (a.day < b.day ? 1 : -1));

    const orders = new Map();
    paid.forEach((r) => {
      const k = orderKey(r);
      const o = orders.get(k) || { key: k, user_id: r.user_id, n: 0, amount: 0, currency: r.currency, at: r.created_at, letters: new Set() };
      o.n++;
      o.amount += Number(r.amount) || 0;
      o.letters.add(r.letter_index);
      if (r.created_at > o.at) o.at = r.created_at;
      orders.set(k, o);
    });

    const perLetter = LETTERS.map((_, i) => paid.filter((r) => r.letter_index === i).length);
    const payers = new Set(paid.map((r) => r.user_id));
    const today = todayIst();
    const perUser = new Map();
    paid.forEach((r) => {
      const set = perUser.get(r.user_id) || new Set();
      set.add(r.letter_index);
      perUser.set(r.user_id, set);
    });

    return {
      rows,
      perLetter,
      orders: [...orders.values()].sort((a, b) => (a.at < b.at ? 1 : -1)),
      totals: {
        newAccounts: parts.filter((r) => r.new_account).length,
        joined: parts.length,
        online: acts.filter((r) => now - Date.parse(r.last_seen) < ONLINE_MS).length,
        activeToday: acts.filter((r) => r.day === today).length,
        submissions: paid.length,
        payers: payers.size,
        orders: orders.size,
        bulkOrders: [...orders.values()].filter((o) => o.n > 1).length,
        inr: paid.filter((r) => r.currency !== "USD").reduce((s, r) => s + (Number(r.amount) || 0), 0),
        usd: paid.filter((r) => r.currency === "USD").reduce((s, r) => s + (Number(r.amount) || 0), 0),
        abandoned: abandoned.length,
        allLetters: [...perUser.values()].filter((s) => s.size === 26).length,
        conversion: parts.length ? Math.round((payers.size / parts.length) * 100) : null
      }
    };
  }, [subs, parts, acts]);

  function downloadCsv() {
    const head = [
      "Date (IST)",
      "New accounts for Typetober",
      "Joined Typetober",
      "Active users",
      "Paid submissions",
      "Paying users",
      "Orders",
      "Bulk orders",
      "Revenue INR",
      "Revenue USD",
      "Failed or abandoned"
    ];
    const lines = report.rows.map((r) =>
      [r.day, r.newAccounts, r.joined, r.active, r.submissions, r.payers, r.orderCount, r.bulkOrders, r.inr, r.usd, r.abandoned].join(",")
    );
    const t = report.totals;
    lines.push(["Total", t.newAccounts, t.joined, "", t.submissions, t.payers, t.orders, t.bulkOrders, t.inr, t.usd, t.abandoned].join(","));
    const blob = new Blob([[head.join(","), ...lines].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `typetober-report-${todayIst()}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  const t = report.totals;
  const maxLetter = Math.max(1, ...report.perLetter);
  const th = "text-left text-[11px] font-semibold uppercase tracking-wider px-3 py-2 whitespace-nowrap";
  const td = "px-3 py-2 whitespace-nowrap";

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-white">Typetober report</h2>
          <p className="text-sm mt-1" style={{ color: "#888" }}>
            Daily and total numbers. Days are India time. Refreshes every minute
            {updated ? `, last at ${updated.toLocaleTimeString("en-IN")}` : ""}.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: "#1a1a1a", border: "1px solid #333", color: "#ddd" }}
          >
            {loading ? "Loading…" : "Refresh"}
          </button>
          <button
            onClick={downloadCsv}
            disabled={!report.rows.length}
            className="px-4 py-2 rounded-lg text-sm font-bold"
            style={{ background: Y, color: "#000" }}
          >
            Download CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg p-3 text-sm" style={{ background: "#2a0f12", color: "#f87171" }}>
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card label="Online now" value={t.online} sub={`${t.activeToday} active today`} color="#22c55e" />
        <Card label="Accounts created for Typetober" value={t.newAccounts} sub={`${t.joined} accounts joined in total`} />
        <Card label="Paid submissions" value={t.submissions} sub={`${t.payers} people · ${t.allLetters} finished all 26`} color={Y} />
        <Card
          label="Revenue"
          value={inr(t.inr)}
          sub={`+ ${usd(t.usd)} international`}
          color={Y}
        />
        <Card label="Orders" value={t.orders} sub={`${t.bulkOrders} bulk orders`} />
        <Card
          label="Avg per paying user"
          value={t.payers ? (t.submissions / t.payers).toFixed(1) : "0"}
          sub="submissions"
        />
        <Card
          label="Joined → paid"
          value={t.conversion === null ? "–" : `${t.conversion}%`}
          sub="of accounts that opened Typetober"
        />
        <Card label="Failed or abandoned" value={t.abandoned} sub="payments not completed" color={t.abandoned ? P : "#fff"} />
      </div>

      <h3 className="text-sm font-bold text-white mt-8 mb-2">Day by day</h3>
      <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid #222" }}>
        <table className="w-full text-sm" style={{ color: "#ddd" }}>
          <thead style={{ background: "#111", color: "#777" }}>
            <tr>
              <th className={th}>Date</th>
              <th className={th}>New accounts</th>
              <th className={th}>Joined</th>
              <th className={th}>Active users</th>
              <th className={th}>Submissions</th>
              <th className={th}>Paying users</th>
              <th className={th}>Orders (bulk)</th>
              <th className={th}>Revenue ₹</th>
              <th className={th}>Revenue $</th>
              <th className={th}>Failed / abandoned</th>
            </tr>
          </thead>
          <tbody>
            {report.rows.map((r) => (
              <tr key={r.day} style={{ borderTop: "1px solid #1d1d1d" }}>
                <td className={`${td} font-semibold text-white`}>{dayLabel(r.day)}</td>
                <td className={td}>{r.newAccounts}</td>
                <td className={td}>{r.joined}</td>
                <td className={td}>{r.active}</td>
                <td className={td} style={{ color: Y }}>
                  {r.submissions}
                </td>
                <td className={td}>{r.payers}</td>
                <td className={td}>
                  {r.orderCount}
                  {r.bulkOrders ? <span style={{ color: "#777" }}> ({r.bulkOrders})</span> : null}
                </td>
                <td className={td}>{inr(r.inr)}</td>
                <td className={td}>{usd(r.usd)}</td>
                <td className={td} style={{ color: r.abandoned ? P : "#555" }}>
                  {r.abandoned}
                </td>
              </tr>
            ))}
            {!report.rows.length && (
              <tr>
                <td colSpan={10} className="px-3 py-6 text-center" style={{ color: "#666" }}>
                  {loading ? "Loading…" : "No Typetober activity yet."}
                </td>
              </tr>
            )}
            {report.rows.length > 0 && (
              <tr style={{ borderTop: "1px solid #333", background: "#111" }} className="font-bold text-white">
                <td className={td}>Total</td>
                <td className={td}>{t.newAccounts}</td>
                <td className={td}>{t.joined}</td>
                <td className={td} style={{ color: "#555" }}>
                  –
                </td>
                <td className={td} style={{ color: Y }}>
                  {t.submissions}
                </td>
                <td className={td}>{t.payers}</td>
                <td className={td}>
                  {t.orders} <span style={{ color: "#777" }}>({t.bulkOrders})</span>
                </td>
                <td className={td}>{inr(t.inr)}</td>
                <td className={td}>{usd(t.usd)}</td>
                <td className={td}>{t.abandoned}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-[12px] mt-2" style={{ color: "#666" }}>
        New accounts: signed up from the Typetober sign-in. Joined: any account that opened Typetober signed in for the
        first time that day. Active users: signed-in people on the Typetober page that day. Revenue counts paid
        submissions only.
      </p>

      <h3 className="text-sm font-bold text-white mt-8 mb-2">Submissions per letter</h3>
      <div className="rounded-xl p-4" style={{ background: "#111", border: "1px solid #222" }}>
        <div className="flex items-end gap-1 h-36">
          {report.perLetter.map((n, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full min-w-0" title={`${LETTERS[i]}: ${n}`}>
              <span className="text-[10px] mb-1" style={{ color: "#888" }}>
                {n || ""}
              </span>
              <div className="w-full rounded-t" style={{ height: `${(n / maxLetter) * 100}%`, minHeight: n ? 3 : 0, background: Y }} />
            </div>
          ))}
        </div>
        <div className="flex gap-1 mt-1">
          {LETTERS.map((ch) => (
            <div key={ch} className="flex-1 text-center text-[11px] font-bold" style={{ color: "#888" }}>
              {ch}
            </div>
          ))}
        </div>
      </div>

      <h3 className="text-sm font-bold text-white mt-8 mb-2">Latest paid orders</h3>
      <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid #222" }}>
        <table className="w-full text-sm" style={{ color: "#ddd" }}>
          <thead style={{ background: "#111", color: "#777" }}>
            <tr>
              <th className={th}>When (IST)</th>
              <th className={th}>Participant</th>
              <th className={th}>Email</th>
              <th className={th}>Images</th>
              <th className={th}>Letters</th>
              <th className={th}>Amount</th>
              <th className={th}>Order</th>
            </tr>
          </thead>
          <tbody>
            {report.orders.slice(0, 50).map((o) => {
              const p = names[o.user_id];
              return (
                <tr key={o.key} style={{ borderTop: "1px solid #1d1d1d" }}>
                  <td className={td}>
                    {new Date(o.at).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </td>
                  <td className={`${td} text-white`}>{p?.name || p?.username || o.user_id.slice(0, 8)}</td>
                  <td className={td} style={{ color: "#999" }}>
                    {p?.email || "–"}
                  </td>
                  <td className={td}>{o.n}</td>
                  <td className={td} style={{ color: "#999" }}>
                    {[...o.letters].sort((a, b) => a - b).map((i) => LETTERS[i]).join(" ")}
                  </td>
                  <td className={td} style={{ color: Y }}>
                    {o.currency === "USD" ? usd(o.amount) : inr(o.amount)}
                  </td>
                  <td className={td} style={{ color: "#666" }}>
                    {o.key.startsWith("dev-") ? "test" : o.key}
                  </td>
                </tr>
              );
            })}
            {!report.orders.length && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center" style={{ color: "#666" }}>
                  No paid orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
