import { useCallback, useEffect, useMemo, useState } from "react";
import { supabaseAdmin } from "../../supabaseAdminClient";

// Admin: Typetober daily report. Everything is aggregated here from three
// tables (see supabase/migrations/typetober_submissions.sql):
//   typetober_submissions   payments and submissions (one row per image)
//   typetober_participants  accounts that opened /typetober signed in,
//                           new_account = created for Typetober
//   typetober_activity      one row per user per India day, last_seen for
//                           "online now"
// and, for community-favourite voting (typetober_voting.sql):
//   typetober_votes         current votes, one row per voter per submission
//   typetober_vote_events   every vote, take-back and turned-away attempt
//   typetober_vote_config   voting window + votes per person
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

const imageUrl = (path) =>
  path ? supabaseAdmin.storage.from("typetober-submissions").getPublicUrl(path).data?.publicUrl : "";

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
  const [votes, setVotes] = useState([]);
  const [voteEvents, setVoteEvents] = useState([]);
  const [voteConfig, setVoteConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updated, setUpdated] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const soft = (e) => {
        console.error(e);
        return [];
      };
      const [s, p, a, v, ve, vc] = await Promise.all([
        fetchAll(
          "typetober_submissions",
          "id,user_id,letter_index,image_path,amount,currency,status,razorpay_order_id,created_at"
        ),
        fetchAll("typetober_participants", "user_id,joined_at,new_account").catch((e) => {
          console.error(e);
          return [];
        }),
        fetchAll("typetober_activity", "user_id,day,last_seen").catch((e) => {
          console.error(e);
          return [];
        }),
        fetchAll("typetober_votes", "submission_id,voter_id,created_at").catch(soft),
        fetchAll("typetober_vote_events", "voter_id,submission_id,action,created_at").catch(soft),
        fetchAll("typetober_vote_config", "opens_at,closes_at,vote_limit").catch(soft)
      ]);
      setSubs(s);
      setParts(p);
      setActs(a);
      setVotes(v);
      setVoteEvents(ve);
      setVoteConfig(vc[0] || null);

      // Names for the latest orders and for the creators who got votes.
      const subOwner = new Map(s.map((r) => [r.id, r.user_id]));
      const ids = [
        ...new Set([
          ...s.filter((r) => r.status === "success").slice(-200).map((r) => r.user_id),
          ...v.map((r) => subOwner.get(r.submission_id)).filter(Boolean)
        ])
      ];
      const m = {};
      for (let i = 0; i < ids.length; i += 200) {
        const { data } = await supabaseAdmin
          .from("profiles")
          .select("id,name,username,email")
          .in("id", ids.slice(i, i + 200));
        (data || []).forEach((r) => (m[r.id] = r));
      }
      setNames(m);
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

  const voting = useMemo(() => {
    const subById = new Map(subs.filter((r) => r.status === "success").map((r) => [r.id, r]));
    const perSub = new Map();
    votes.forEach((v) => perSub.set(v.submission_id, (perSub.get(v.submission_id) || 0) + 1));
    const leaderboard = [...perSub.entries()]
      .map(([id, n]) => ({ sub: subById.get(id), votes: n }))
      .filter((r) => r.sub)
      .sort((a, b) => b.votes - a.votes || (a.sub.created_at < b.sub.created_at ? -1 : 1));

    const perCreator = new Map();
    leaderboard.forEach(({ sub, votes: n }) => {
      const c = perCreator.get(sub.user_id) || { user_id: sub.user_id, votes: 0, entries: 0 };
      c.votes += n;
      c.entries++;
      perCreator.set(sub.user_id, c);
    });

    const perVoter = new Map();
    votes.forEach((v) => perVoter.set(v.voter_id, (perVoter.get(v.voter_id) || 0) + 1));
    const limit = voteConfig?.vote_limit || 0;

    const count = (action) => voteEvents.filter((e) => e.action === action).length;
    const days = new Map();
    voteEvents.forEach((e) => {
      const d = istDay(e.created_at);
      const row = days.get(d) || {
        day: d,
        vote: 0,
        unvote: 0,
        blocked_own: 0,
        blocked_limit: 0,
        blocked_closed: 0,
        people: new Set()
      };
      row[e.action]++;
      row.people.add(e.voter_id);
      days.set(d, row);
    });

    return {
      leaderboard,
      creators: [...perCreator.values()].sort((a, b) => b.votes - a.votes),
      days: [...days.values()].map((d) => ({ ...d, people: d.people.size })).sort((a, b) => (a.day < b.day ? 1 : -1)),
      totals: {
        votes: votes.length,
        voters: perVoter.size,
        usedAll: limit ? [...perVoter.values()].filter((n) => n >= limit).length : 0,
        avg: perVoter.size ? (votes.length / perVoter.size).toFixed(1) : "0",
        votedSubs: perSub.size,
        unvotes: count("unvote"),
        blockedOwn: count("blocked_own"),
        blockedLimit: count("blocked_limit"),
        blockedClosed: count("blocked_closed")
      }
    };
  }, [subs, votes, voteEvents, voteConfig]);

  const personLabel = (id) => {
    const p = names[id];
    return p?.name || p?.username || id?.slice(0, 8) || "–";
  };

  function downloadVotesCsv() {
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const head = ["Rank", "Votes", "Letter", "Creator", "Username", "Email", "Submitted (IST)", "Image", "Submission id"];
    const lines = voting.leaderboard.map(({ sub, votes: n }, i) => {
      const p = names[sub.user_id] || {};
      return [i + 1, n, LETTERS[sub.letter_index], p.name, p.username, p.email, istDay(sub.created_at), imageUrl(sub.image_path), sub.id]
        .map(esc)
        .join(",");
    });
    const blob = new Blob([[head.join(","), ...lines].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `typetober-votes-${todayIst()}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

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
  const vt = voting.totals;
  const istTime = (ts) =>
    new Date(ts).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit"
    });
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

      <div className="flex flex-wrap items-end justify-between gap-3 mt-12 mb-4 pt-6" style={{ borderTop: "1px solid #222" }}>
        <div>
          <h2 className="text-lg font-bold text-white">Community favourite voting</h2>
          <p className="text-sm mt-1" style={{ color: "#888" }}>
            {voteConfig
              ? `Open ${istTime(voteConfig.opens_at)} to ${istTime(Date.parse(voteConfig.closes_at) - 60000)} IST · ${voteConfig.vote_limit} votes per person`
              : "Voting isn't set up yet. Run supabase/migrations/typetober_voting.sql."}
          </p>
        </div>
        <button
          onClick={downloadVotesCsv}
          disabled={!voting.leaderboard.length}
          className="px-4 py-2 rounded-lg text-sm font-bold"
          style={{ background: Y, color: "#000" }}
        >
          Download votes CSV
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card label="Votes cast" value={vt.votes} sub={`on ${vt.votedSubs} submissions`} color={P} />
        <Card label="Voters" value={vt.voters} sub={`${vt.avg} votes each · ${vt.usedAll} used all`} />
        <Card label="Votes taken back" value={vt.unvotes} sub="then free to use again" />
        <Card
          label="Turned away"
          value={vt.blockedOwn + vt.blockedLimit + vt.blockedClosed}
          sub={`${vt.blockedOwn} own work · ${vt.blockedLimit} out of votes · ${vt.blockedClosed} closed`}
        />
      </div>

      <h3 className="text-sm font-bold text-white mt-8 mb-2">Most voted submissions</h3>
      <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid #222" }}>
        <table className="w-full text-sm" style={{ color: "#ddd" }}>
          <thead style={{ background: "#111", color: "#777" }}>
            <tr>
              <th className={th}>#</th>
              <th className={th}>Image</th>
              <th className={th}>Letter</th>
              <th className={th}>Creator</th>
              <th className={th}>Email</th>
              <th className={th}>Votes</th>
            </tr>
          </thead>
          <tbody>
            {voting.leaderboard.slice(0, 50).map(({ sub, votes: n }, i) => (
              <tr key={sub.id} style={{ borderTop: "1px solid #1d1d1d" }}>
                <td className={`${td} font-bold text-white`}>{i + 1}</td>
                <td className="px-3 py-1.5">
                  <a href={imageUrl(sub.image_path)} target="_blank" rel="noreferrer">
                    <img src={imageUrl(sub.image_path)} alt="" className="w-12 h-12 rounded object-cover" loading="lazy" />
                  </a>
                </td>
                <td className={`${td} font-bold`} style={{ color: Y }}>
                  {LETTERS[sub.letter_index]}
                </td>
                <td className={`${td} text-white`}>{personLabel(sub.user_id)}</td>
                <td className={td} style={{ color: "#999" }}>
                  {names[sub.user_id]?.email || "–"}
                </td>
                <td className={`${td} font-extrabold`} style={{ color: P }}>
                  {n}
                </td>
              </tr>
            ))}
            {!voting.leaderboard.length && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center" style={{ color: "#666" }}>
                  No votes yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div>
          <h3 className="text-sm font-bold text-white mb-2">Votes by creator (all their entries)</h3>
          <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid #222" }}>
            <table className="w-full text-sm" style={{ color: "#ddd" }}>
              <thead style={{ background: "#111", color: "#777" }}>
                <tr>
                  <th className={th}>Creator</th>
                  <th className={th}>Entries voted</th>
                  <th className={th}>Votes</th>
                </tr>
              </thead>
              <tbody>
                {voting.creators.slice(0, 25).map((c) => (
                  <tr key={c.user_id} style={{ borderTop: "1px solid #1d1d1d" }}>
                    <td className={`${td} text-white`}>{personLabel(c.user_id)}</td>
                    <td className={td}>{c.entries}</td>
                    <td className={`${td} font-bold`} style={{ color: P }}>
                      {c.votes}
                    </td>
                  </tr>
                ))}
                {!voting.creators.length && (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-center" style={{ color: "#666" }}>
                      No votes yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold text-white mb-2">Voting day by day</h3>
          <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid #222" }}>
            <table className="w-full text-sm" style={{ color: "#ddd" }}>
              <thead style={{ background: "#111", color: "#777" }}>
                <tr>
                  <th className={th}>Date</th>
                  <th className={th}>People</th>
                  <th className={th}>Votes</th>
                  <th className={th}>Taken back</th>
                  <th className={th}>Own work</th>
                  <th className={th}>Out of votes</th>
                </tr>
              </thead>
              <tbody>
                {voting.days.map((d) => (
                  <tr key={d.day} style={{ borderTop: "1px solid #1d1d1d" }}>
                    <td className={`${td} font-semibold text-white`}>{dayLabel(d.day)}</td>
                    <td className={td}>{d.people}</td>
                    <td className={td} style={{ color: P }}>
                      {d.vote}
                    </td>
                    <td className={td}>{d.unvote}</td>
                    <td className={td}>{d.blocked_own}</td>
                    <td className={td}>{d.blocked_limit}</td>
                  </tr>
                ))}
                {!voting.days.length && (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center" style={{ color: "#666" }}>
                      No voting activity yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <p className="text-[12px] mt-2" style={{ color: "#666" }}>
        Votes are what stands now; taken-back votes don't count. Own work, out of votes and closed are attempts the
        server refused.
      </p>
    </div>
  );
}
