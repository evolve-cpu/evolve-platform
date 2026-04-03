import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from "recharts";

/* ─── brand ──────────────────────────────────────────────────────────────── */
const Y = "#FFD007";
const P = "#DF0586";
const GR = "#22c55e";
const PLAN_COLORS = { starter: Y, accelerator: P };

/* ─── helpers ─────────────────────────────────────────────────────────────── */
const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    : "—";

function KpiCard({ label, value, sub, accent = Y }) {
  return (
    <div
      className="rounded-xl border p-5 flex flex-col gap-1"
      style={{ background: "#111", borderColor: "#222" }}
    >
      <p
        className="text-[11px] uppercase tracking-widest"
        style={{ color: "#666" }}
      >
        {label}
      </p>
      <p className="text-3xl font-black" style={{ color: accent }}>
        {value}
      </p>
      {sub && (
        <p className="text-[12px]" style={{ color: "#555" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function Badge({ children, color = "#333", text = "#fff" }) {
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide"
      style={{ background: color, color: text }}
    >
      {children}
    </span>
  );
}

const STATUS_COLOR = { success: GR, pending: Y, failed: "#ef4444" };
const STATUS_TEXT = { success: "#000", pending: "#000", failed: "#fff" };

function StatusBadge({ status }) {
  return (
    <Badge
      color={STATUS_COLOR[status] || "#333"}
      text={STATUS_TEXT[status] || "#fff"}
    >
      {status}
    </Badge>
  );
}

const TOOLTIP_STYLE = {
  background: "#1a1a1a",
  border: "1px solid #333",
  borderRadius: 8,
  color: "#fff",
  fontSize: 13
};

/* ─── AI renderer ─────────────────────────────────────────────────────────── */
function AiBlock({ text }) {
  const lines = text.split("\n").filter(Boolean);
  return (
    <div
      className="space-y-3 text-sm leading-relaxed"
      style={{ color: "#ccc" }}
    >
      {lines.map((line, i) => {
        const bold = line.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
        return <p key={i} dangerouslySetInnerHTML={{ __html: bold }} />;
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [portfolioReviews, setPortfolioReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [payFilter, setPayFilter] = useState("all");

  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState("");
  const [aiError, setAiError] = useState("");

  const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  /* allow text selection on admin page */
  useEffect(() => {
    const prev = document.body.style.userSelect;
    document.body.style.userSelect = "text";
    return () => {
      document.body.style.userSelect = prev || "";
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("admin_access");
    navigate("/admin");
  };

  /* ── fetch ──────────────────────────────────────────────────────────── */
  const fetchAll = async (isRefresh = false) => {
    try {
      setError("");
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [
        { data: pData, error: pErr },
        { data: bData, error: bErr },
        { data: wData, error: wErr },
        { data: prData, error: prErr },
        { data: reviewData, error: reviewErr } // 👈 ADD THIS
      ] = await Promise.all([
        supabase
          .from("mentorship_payments")
          .select(
            "*, batch:mentorship_batches(batch_number, start_date, total_seats)"
          )
          .order("created_at", { ascending: false }),

        supabase.from("mentorship_batches").select("*").order("batch_number"),

        supabase
          .from("mentorship_waitlist")
          .select("*")
          .order("created_at", { ascending: false }),

        supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false }),

        // 👇 NEW TABLE
        supabase
          .from("portfolio_reviews")
          .select("*")
          .order("created_at", { ascending: false })
      ]);

      if (pErr) throw pErr;
      if (bErr) throw bErr;
      if (wErr) throw wErr;
      if (prErr) throw prErr;
      if (reviewErr) throw reviewErr;

      setPortfolioReviews(reviewData || []);

      setPayments(pData || []);
      setBatches(bData || []);
      setWaitlist(wData || []);
      setProfiles(prData || []);
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  /* ── stats ──────────────────────────────────────────────────────────── */
  const stats = useMemo(() => {
    const realPay = payments.filter((p) => !p.is_test);
    const success = realPay.filter((p) => p.status === "success");
    const failed = realPay.filter((p) => p.status === "failed");
    const pending = realPay.filter((p) => p.status === "pending");

    const totalRevenue = success.reduce(
      (s, p) => s + (Number(p.amount) || 0),
      0
    );
    const starterPay = success.filter((p) => p.plan === "starter");
    const accelPay = success.filter((p) => p.plan === "accelerator");
    const starterRevenue = starterPay.reduce(
      (s, p) => s + (Number(p.amount) || 0),
      0
    );
    const accelRevenue = accelPay.reduce(
      (s, p) => s + (Number(p.amount) || 0),
      0
    );

    const attempts = success.length + failed.length;
    const convRate =
      attempts > 0 ? Math.round((success.length / attempts) * 100) : 0;
    const avgRevenue =
      success.length > 0 ? Math.round(totalRevenue / success.length) : 0;

    /* batch fill chart */
    const batchFillData = batches.map((b) => {
      const filled = success.filter(
        (p) => p.batch?.batch_number === b.batch_number
      ).length;
      return {
        name: `B${b.batch_number}`,
        fullName: `Batch ${b.batch_number}`,
        filled,
        remaining: Math.max(0, b.total_seats - filled),
        total: b.total_seats,
        pct: b.total_seats > 0 ? Math.round((filled / b.total_seats) * 100) : 0
      };
    });

    /* plan pie */
    const planPie = [
      {
        name: "Starter",
        value: starterPay.length,
        revenue: starterRevenue,
        color: Y
      },
      {
        name: "Accelerator",
        value: accelPay.length,
        revenue: accelRevenue,
        color: P
      }
    ].filter((d) => d.value > 0);

    /* revenue pie */
    const revPie = [
      { name: "Starter", value: starterRevenue, color: Y },
      { name: "Accelerator", value: accelRevenue, color: P }
    ].filter((d) => d.value > 0);

    /* enrollment timeline by month */
    const byMonth = {};
    success.forEach((p) => {
      const d = new Date(p.created_at);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      byMonth[k] = (byMonth[k] || 0) + 1;
    });
    const timeline = Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([m, c]) => ({ month: m.slice(5) + "/" + m.slice(2, 4), count: c }));

    /* pending revenue (if all convert) */
    const pendingRevenue = pending.reduce(
      (s, p) => s + (Number(p.amount) || 0),
      0
    );

    return {
      totalRevenue,
      enrolled: success.length,
      waitlistCount: waitlist.length,
      openBatches: batches.filter((b) => b.status === "open").length,
      convRate,
      avgRevenue,
      starterCount: starterPay.length,
      accelCount: accelPay.length,
      starterRevenue,
      accelRevenue,
      pendingCount: pending.length,
      failedCount: failed.length,
      pendingRevenue,
      batchFillData,
      planPie,
      revPie,
      timeline,
      recentEnrolled: success.slice(0, 6)
    };
  }, [payments, batches, waitlist]);

  /* ── filtered tables ────────────────────────────────────────────────── */
  const filteredPayments = useMemo(() => {
    let list = payments;
    if (payFilter !== "all") list = list.filter((p) => p.status === payFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          (p.user_name || "").toLowerCase().includes(q) ||
          (p.plan || "").toLowerCase().includes(q) ||
          (p.razorpay_payment_id || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [payments, payFilter, search]);

  const filteredWaitlist = useMemo(() => {
    if (!search.trim()) return waitlist;
    const q = search.toLowerCase();
    return waitlist.filter(
      (w) =>
        (w.user_name || "").toLowerCase().includes(q) ||
        (w.email || "").toLowerCase().includes(q)
    );
  }, [waitlist, search]);

  const filteredProfiles = useMemo(() => {
    if (!search.trim()) return profiles;
    const q = search.toLowerCase();
    return profiles.filter(
      (p) =>
        (p.username || "").toLowerCase().includes(q) ||
        (p.email || "").toLowerCase().includes(q)
    );
  }, [profiles, search]);

  const filteredReviews = useMemo(() => {
    if (!search.trim()) return portfolioReviews;
    const q = search.toLowerCase();
    return portfolioReviews.filter(
      (r) =>
        (r.user_name || "").toLowerCase().includes(q) ||
        (r.status || "").toLowerCase().includes(q)
    );
  }, [portfolioReviews, search]);

  /* set of enrolled user_ids for quick lookup */
  const enrolledIds = useMemo(
    () =>
      new Set(
        payments
          .filter((p) => p.status === "success" && !p.is_test)
          .map((p) => p.user_id)
      ),
    [payments]
  );

  /* ── Gemini AI ──────────────────────────────────────────────────────── */
  const generateInsights = async () => {
    if (!GEMINI_KEY) {
      setAiError("Missing VITE_GEMINI_API_KEY in .env");
      return;
    }
    setAiLoading(true);
    setAiInsight("");
    setAiError("");

    const {
      enrolled,
      waitlistCount,
      convRate,
      starterCount,
      accelCount,
      totalRevenue,
      batchFillData,
      pendingCount
    } = stats;

    const prompt = `You are a business analyst for evolve, a premium design mentorship platform in India.

LIVE DATA:
- Enrolled students (paid): ${enrolled}
- On waitlist: ${waitlistCount}
- Registered users total: ${profiles.length}
- Conversion rate (payment attempts → success): ${convRate}%
- Starter plan (₹15,000): ${starterCount} students
- Accelerator plan (₹35,000): ${accelCount} students
- Total revenue: ₹${totalRevenue.toLocaleString("en-IN")}
- Pending payments: ${pendingCount}
- Batch fill: ${batchFillData.map((b) => `${b.fullName}: ${b.filled}/${b.total} (${b.pct}%)`).join(", ")}

Give exactly 3 sharp, practical insights for a non-technical founder. Focus on: what's working, what to improve, and one concrete action to take this week. Use plain language, no buzzwords. Number each insight 1. 2. 3.`;

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.6, maxOutputTokens: 500 }
          })
        }
      );
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (text) setAiInsight(text);
      else setAiError("No response from Gemini. Check API key.");
    } catch (e) {
      setAiError("Gemini error: " + e.message);
    } finally {
      setAiLoading(false);
    }
  };

  /* ─────────────────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0a0a0a" }}
      >
        <div className="text-center">
          <div
            className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: Y, borderTopColor: "transparent" }}
          />
          <p style={{ color: "#555" }}>loading mentorship data…</p>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: "overview", label: "overview" },
    { id: "tables", label: "all tables" },
    { id: "payments", label: `payments (${payments.length})` },
    { id: "batches", label: `batches (${batches.length})` },
    { id: "waitlist", label: `waitlist (${stats.waitlistCount})` },
    { id: "reviews", label: `reviews (${portfolioReviews.length})` }
  ];

  return (
    <div
      className="min-h-screen"
      style={{
        background: "#0a0a0a",
        color: "#fff",
        fontFamily: "system-ui, sans-serif"
      }}
    >
      {/* ── header ── */}
      <div
        className="sticky top-0 z-30 border-b px-6 py-4 flex items-center justify-between"
        style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl font-black" style={{ color: Y }}>
            evolve
          </span>
          <span style={{ color: "#333" }}>/</span>
          <span className="text-sm font-semibold" style={{ color: "#888" }}>
            mentorship analytics
          </span>
        </div>
        <div className="flex items-center gap-3">
          {error && <span className="text-xs text-red-400">{error}</span>}
          <button
            onClick={() => fetchAll(true)}
            disabled={refreshing}
            className="text-xs px-3 py-1.5 rounded-lg border font-semibold transition-opacity disabled:opacity-40"
            style={{ borderColor: "#333", color: "#888" }}
          >
            {refreshing ? "refreshing…" : "↻ refresh"}
          </button>
          <button
            onClick={handleLogout}
            className="text-xs px-3 py-1.5 rounded-lg font-semibold"
            style={{ background: "#1a1a1a", color: "#888" }}
          >
            logout
          </button>
        </div>
      </div>

      {/* ── tabs ── */}
      <div
        className="px-6 pt-4 flex gap-1 flex-wrap border-b"
        style={{ borderColor: "#1a1a1a" }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setActiveTab(t.id);
              setSearch("");
            }}
            className="px-4 py-2 text-sm font-semibold rounded-t-lg transition-all"
            style={{
              background: activeTab === t.id ? "#111" : "transparent",
              color: activeTab === t.id ? Y : "#555",
              borderBottom:
                activeTab === t.id ? `2px solid ${Y}` : "2px solid transparent"
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-6 py-6 max-w-7xl mx-auto">
        {/* ══════════════════════════════════════════════════════════════
            OVERVIEW TAB
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* KPI grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <KpiCard
                label="total revenue"
                value={fmt(stats.totalRevenue)}
                sub="from paid enrollments"
                accent={Y}
              />
              <KpiCard
                label="enrolled"
                value={stats.enrolled}
                sub="confirmed payments"
                accent={GR}
              />
              <KpiCard
                label="waitlist"
                value={stats.waitlistCount}
                sub="waiting for spot"
                accent={P}
              />
              <KpiCard
                label="conversion"
                value={`${stats.convRate}%`}
                sub="attempts → paid"
                accent={Y}
              />
              <KpiCard
                label="avg ticket"
                value={fmt(stats.avgRevenue)}
                sub="per student"
                accent="#888"
              />
              <KpiCard
                label="open batches"
                value={stats.openBatches}
                sub={`of ${batches.length} total`}
                accent={P}
              />
            </div>

            {/* plan + pending row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <KpiCard
                label="starter plan"
                value={stats.starterCount}
                sub={fmt(stats.starterRevenue) + " revenue"}
                accent={Y}
              />
              <KpiCard
                label="accelerator plan"
                value={stats.accelCount}
                sub={fmt(stats.accelRevenue) + " revenue"}
                accent={P}
              />
              <KpiCard
                label="pending payments"
                value={stats.pendingCount}
                sub={`${fmt(stats.pendingRevenue)} at risk`}
                accent="#f97316"
              />
              <KpiCard
                label="registered users"
                value={profiles.length}
                sub={`${stats.enrolled} enrolled (${profiles.length > 0 ? Math.round((stats.enrolled / profiles.length) * 100) : 0}%)`}
                accent="#888"
              />
            </div>

            {/* charts row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* batch fill */}
              <div
                className="rounded-xl border p-5"
                style={{ background: "#111", borderColor: "#222" }}
              >
                <h3
                  className="text-sm font-bold mb-4"
                  style={{ color: "#888" }}
                >
                  batch fill status
                </h3>
                {stats.batchFillData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stats.batchFillData} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#666", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "#666", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={TOOLTIP_STYLE}
                        formatter={(val, name) => [
                          val,
                          name === "filled" ? "enrolled" : "remaining"
                        ]}
                      />
                      <Bar
                        dataKey="filled"
                        fill={Y}
                        radius={[4, 4, 0, 0]}
                        name="filled"
                      />
                      <Bar
                        dataKey="remaining"
                        fill="#222"
                        radius={[4, 4, 0, 0]}
                        name="remaining"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p
                    className="text-sm text-center py-10"
                    style={{ color: "#444" }}
                  >
                    no batch data
                  </p>
                )}
              </div>

              {/* plan split */}
              <div
                className="rounded-xl border p-5"
                style={{ background: "#111", borderColor: "#222" }}
              >
                <h3
                  className="text-sm font-bold mb-4"
                  style={{ color: "#888" }}
                >
                  enrollment by plan
                </h3>
                {stats.planPie.length > 0 ? (
                  <div className="flex items-center gap-6">
                    <ResponsiveContainer width={180} height={180}>
                      <PieChart>
                        <Pie
                          data={stats.planPie}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          dataKey="value"
                          paddingAngle={3}
                        >
                          {stats.planPie.map((e, i) => (
                            <Cell key={i} fill={e.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={TOOLTIP_STYLE}
                          formatter={(val, _name, props) => [
                            `${val} students · ${fmt(props.payload.revenue)}`,
                            props.payload.name
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-3">
                      {stats.planPie.map((d, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ background: d.color }}
                          />
                          <div>
                            <p className="text-sm font-bold text-white">
                              {d.name}
                            </p>
                            <p className="text-xs" style={{ color: "#666" }}>
                              {d.value} students · {fmt(d.revenue)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p
                    className="text-sm text-center py-10"
                    style={{ color: "#444" }}
                  >
                    no enrollment data yet
                  </p>
                )}
              </div>
            </div>

            {/* enrollment timeline */}
            {stats.timeline.length > 0 && (
              <div
                className="rounded-xl border p-5"
                style={{ background: "#111", borderColor: "#222" }}
              >
                <h3
                  className="text-sm font-bold mb-4"
                  style={{ color: "#888" }}
                >
                  enrollments over time
                </h3>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={stats.timeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "#666", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: "#666", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke={Y}
                      strokeWidth={2}
                      dot={{ fill: Y, r: 4 }}
                      name="enrollments"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* recent enrolled + AI side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* recent paid */}
              <div
                className="rounded-xl border p-5"
                style={{ background: "#111", borderColor: "#222" }}
              >
                <h3
                  className="text-sm font-bold mb-4"
                  style={{ color: "#888" }}
                >
                  recent enrollments
                </h3>
                {stats.recentEnrolled.length === 0 ? (
                  <p className="text-sm" style={{ color: "#444" }}>
                    no enrollments yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {stats.recentEnrolled.map((p, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {p.user_name || "—"}
                          </p>
                          <p className="text-xs" style={{ color: "#555" }}>
                            {fmtDate(p.created_at)} · Batch{" "}
                            {p.batch?.batch_number ?? "—"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold" style={{ color: Y }}>
                            {fmt(p.amount)}
                          </p>
                          <Badge
                            color={PLAN_COLORS[p.plan] || "#333"}
                            text="#000"
                          >
                            {p.plan}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Gemini AI */}
              <div
                className="rounded-xl border p-5"
                style={{ background: "#111", borderColor: "#222" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold" style={{ color: "#888" }}>
                    AI insights
                  </h3>
                  <button
                    onClick={generateInsights}
                    disabled={aiLoading}
                    className="text-xs px-3 py-1.5 rounded-lg font-bold transition-opacity disabled:opacity-40"
                    style={{ background: Y, color: "#000" }}
                  >
                    {aiLoading ? "thinking…" : "✦ generate"}
                  </button>
                </div>
                {aiError && (
                  <p className="text-xs text-red-400 mb-2">{aiError}</p>
                )}
                {aiInsight ? (
                  <AiBlock text={aiInsight} />
                ) : (
                  <p className="text-sm" style={{ color: "#444" }}>
                    Click "generate" to get AI-powered business insights based
                    on live data.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            PAYMENTS TAB
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "payments" && (
          <div className="space-y-4">
            {/* filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="search by name, plan, ref…"
                className="flex-1 min-w-[200px] px-4 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: "#111",
                  border: "1px solid #222",
                  color: "#fff"
                }}
              />
              {["all", "success", "pending", "failed"].map((f) => (
                <button
                  key={f}
                  onClick={() => setPayFilter(f)}
                  className="px-3 py-2 rounded-lg text-xs font-semibold capitalize"
                  style={{
                    background: payFilter === f ? Y : "#111",
                    color: payFilter === f ? "#000" : "#666",
                    border: "1px solid #222"
                  }}
                >
                  {f}
                </button>
              ))}
              <span className="text-xs" style={{ color: "#555" }}>
                {filteredPayments.length} rows
              </span>
            </div>

            {/* table */}
            <div
              className="rounded-xl border overflow-hidden"
              style={{ borderColor: "#222" }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      style={{
                        background: "#111",
                        borderBottom: "1px solid #222"
                      }}
                    >
                      {[
                        "name",
                        "plan",
                        "amount",
                        "batch",
                        "status",
                        "test?",
                        "date",
                        "ref"
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left font-semibold"
                          style={{ color: "#555" }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.length === 0 && (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-8 text-center"
                          style={{ color: "#444" }}
                        >
                          no payments found
                        </td>
                      </tr>
                    )}
                    {filteredPayments.map((p, i) => (
                      <tr
                        key={p.id || i}
                        style={{
                          borderBottom: "1px solid #1a1a1a",
                          background: i % 2 === 0 ? "#0d0d0d" : "#0a0a0a"
                        }}
                      >
                        <td className="px-4 py-3 font-semibold text-white">
                          {p.user_name || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            color={PLAN_COLORS[p.plan] || "#333"}
                            text="#000"
                          >
                            {p.plan || "—"}
                          </Badge>
                        </td>
                        <td
                          className="px-4 py-3 font-bold"
                          style={{ color: Y }}
                        >
                          {p.amount ? fmt(p.amount) : "—"}
                        </td>
                        <td className="px-4 py-3" style={{ color: "#888" }}>
                          {p.batch?.batch_number
                            ? `Batch ${p.batch.batch_number}`
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="px-4 py-3">
                          {p.is_test ? (
                            <Badge color="#333" text="#aaa">
                              test
                            </Badge>
                          ) : (
                            <span style={{ color: "#333" }}>—</span>
                          )}
                        </td>
                        <td
                          className="px-4 py-3 text-xs"
                          style={{ color: "#666" }}
                        >
                          {fmtDate(p.created_at)}
                        </td>
                        <td
                          className="px-4 py-3 text-xs font-mono"
                          style={{
                            color: "#444",
                            maxWidth: 120,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {p.razorpay_payment_id || p.razorpay_order_id || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            BATCHES TAB
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "batches" && (
          <div className="space-y-4">
            {batches.length === 0 ? (
              <p style={{ color: "#444" }}>no batches found</p>
            ) : (
              batches.map((b) => {
                const bMembers = payments.filter(
                  (p) =>
                    p.status === "success" &&
                    !p.is_test &&
                    p.batch?.batch_number === b.batch_number
                );
                const fillPct =
                  b.total_seats > 0
                    ? Math.round((bMembers.length / b.total_seats) * 100)
                    : 0;

                return (
                  <div
                    key={b.id}
                    className="rounded-xl border p-5 space-y-4"
                    style={{ background: "#111", borderColor: "#222" }}
                  >
                    {/* batch header */}
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-black text-white">
                            Batch {b.batch_number}
                          </h3>
                          <Badge
                            color={b.status === "open" ? GR : "#333"}
                            text={b.status === "open" ? "#000" : "#aaa"}
                          >
                            {b.status}
                          </Badge>
                        </div>
                        <p className="text-xs mt-1" style={{ color: "#555" }}>
                          starts {fmtDate(b.start_date)} · {b.total_seats} total
                          seats
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black" style={{ color: Y }}>
                          {bMembers.length}/{b.total_seats}
                        </p>
                        <p className="text-xs" style={{ color: "#555" }}>
                          {fillPct}% filled
                        </p>
                      </div>
                    </div>

                    {/* fill bar */}
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{ background: "#222" }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${fillPct}%`,
                          background: fillPct >= 90 ? P : Y
                        }}
                      />
                    </div>

                    {/* members */}
                    {bMembers.length > 0 && (
                      <div>
                        <p
                          className="text-xs font-bold mb-2"
                          style={{ color: "#555" }}
                        >
                          enrolled students
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {bMembers.map((m, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between rounded-lg px-3 py-2"
                              style={{
                                background: "#0d0d0d",
                                border: "1px solid #1a1a1a"
                              }}
                            >
                              <span className="text-sm text-white font-semibold">
                                {m.user_name || "—"}
                              </span>
                              <div className="flex items-center gap-2">
                                <Badge
                                  color={PLAN_COLORS[m.plan] || "#333"}
                                  text="#000"
                                >
                                  {m.plan}
                                </Badge>
                                <span
                                  className="text-xs"
                                  style={{ color: "#555" }}
                                >
                                  {fmt(m.amount)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            WAITLIST TAB
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "waitlist" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="search by name or email…"
                className="flex-1 max-w-sm px-4 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: "#111",
                  border: "1px solid #222",
                  color: "#fff"
                }}
              />
              <span className="text-xs" style={{ color: "#555" }}>
                {filteredWaitlist.length} on waitlist
              </span>
            </div>

            <div
              className="rounded-xl border overflow-hidden"
              style={{ borderColor: "#222" }}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr
                    style={{
                      background: "#111",
                      borderBottom: "1px solid #222"
                    }}
                  >
                    {["#", "name", "email", "phone", "joined"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left font-semibold"
                        style={{ color: "#555" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredWaitlist.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center"
                        style={{ color: "#444" }}
                      >
                        waitlist is empty
                      </td>
                    </tr>
                  )}
                  {filteredWaitlist.map((w, i) => (
                    <tr
                      key={w.id || i}
                      style={{
                        borderBottom: "1px solid #1a1a1a",
                        background: i % 2 === 0 ? "#0d0d0d" : "#0a0a0a"
                      }}
                    >
                      <td
                        className="px-4 py-3 text-xs"
                        style={{ color: "#444" }}
                      >
                        {i + 1}
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">
                        {w.user_name || "—"}
                      </td>
                      <td className="px-4 py-3" style={{ color: "#888" }}>
                        {w.email || "—"}
                      </td>
                      <td className="px-4 py-3" style={{ color: "#666" }}>
                        {w.phone || "—"}
                      </td>
                      <td
                        className="px-4 py-3 text-xs"
                        style={{ color: "#555" }}
                      >
                        {fmtDate(w.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === "reviews" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="search by name or status…"
                className="flex-1 max-w-sm px-4 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: "#111",
                  border: "1px solid #222",
                  color: "#fff"
                }}
              />
              <span className="text-xs" style={{ color: "#555" }}>
                {filteredReviews.length} reviews
              </span>
            </div>

            <div
              className="rounded-xl border overflow-x-auto"
              style={{ borderColor: "#222" }}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr
                    style={{
                      background: "#111",
                      borderBottom: "1px solid #222"
                    }}
                  >
                    {[
                      "name",
                      "email",
                      "portfolio",
                      "walkthrough",
                      "notes",
                      "submitted"
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left font-semibold"
                        style={{ color: "#555" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredReviews.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center"
                        style={{ color: "#444" }}
                      >
                        no portfolio reviews
                      </td>
                    </tr>
                  )}

                  {filteredReviews.map((r, i) => (
                    <tr
                      key={r.id || i}
                      style={{
                        borderBottom: "1px solid #1a1a1a",
                        background: i % 2 === 0 ? "#0d0d0d" : "#0a0a0a"
                      }}
                    >
                      {/* NAME */}
                      <td className="px-4 py-3 font-semibold text-white">
                        {r.name || "—"}
                      </td>

                      {/* EMAIL */}
                      <td
                        className="px-4 py-3 text-xs"
                        style={{ color: "#888" }}
                      >
                        {r.email || "—"}
                      </td>

                      {/* PORTFOLIO */}
                      <td className="px-4 py-3 text-xs">
                        {r.portfolio_link ? (
                          <a
                            href={r.portfolio_link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-yellow-400 underline"
                          >
                            open link
                          </a>
                        ) : r.portfolio_file_url ? (
                          <a
                            href={r.portfolio_file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-yellow-400 underline"
                          >
                            view file
                          </a>
                        ) : (
                          <span style={{ color: "#444" }}>—</span>
                        )}
                      </td>

                      {/* WALKTHROUGH */}
                      <td className="px-4 py-3 text-xs">
                        {r.walkthrough_link ? (
                          <a
                            href={r.walkthrough_link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-yellow-400 underline"
                          >
                            watch
                          </a>
                        ) : (
                          <span style={{ color: "#444" }}>—</span>
                        )}
                      </td>

                      {/* NOTES */}
                      <td
                        className="px-4 py-3 text-xs"
                        style={{
                          color: "#aaa",
                          maxWidth: 300,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}
                        title={r.notes}
                      >
                        {r.notes || "—"}
                      </td>

                      {/* DATE */}
                      <td
                        className="px-4 py-3 text-xs"
                        style={{ color: "#666" }}
                      >
                        {fmtDate(r.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            ALL TABLES TAB — profiles → payments → batches → waitlist
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "tables" && (
          <div className="space-y-8">
            {/* global search */}
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="search across all tables…"
              className="w-full max-w-md px-4 py-2 rounded-lg text-sm outline-none"
              style={{
                background: "#111",
                border: "1px solid #222",
                color: "#fff"
              }}
            />

            {/* ── PROFILES ── */}
            <section>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-base font-black text-white">profiles</h2>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{ background: "#1a1a1a", color: "#666" }}
                >
                  {filteredProfiles.length} rows
                </span>
              </div>
              <div
                className="rounded-xl border overflow-x-auto"
                style={{ borderColor: "#222" }}
              >
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      style={{
                        background: "#111",
                        borderBottom: "1px solid #222"
                      }}
                    >
                      {[
                        "avatar",
                        "name",
                        "email",
                        "phone",
                        "enrolled?",
                        "joined"
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left font-semibold"
                          style={{ color: "#555" }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProfiles.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-8 text-center"
                          style={{ color: "#444" }}
                        >
                          no users found
                        </td>
                      </tr>
                    )}
                    {filteredProfiles.map((p, i) => {
                      const paid = enrolledIds.has(p.id);
                      return (
                        <tr
                          key={p.id || i}
                          style={{
                            borderBottom: "1px solid #1a1a1a",
                            background: i % 2 === 0 ? "#0d0d0d" : "#0a0a0a"
                          }}
                        >
                          <td className="px-4 py-3">
                            <img
                              src={
                                p.avatar_url ||
                                `https://api.dicebear.com/7.x/thumbs/svg?seed=${p.id}`
                              }
                              alt=""
                              className="w-8 h-8 rounded-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          </td>
                          <td className="px-4 py-3 font-semibold text-white">
                            {p.name || p.username || "—"}
                          </td>
                          <td
                            className="px-4 py-3 text-xs"
                            style={{ color: "#666" }}
                          >
                            {p.email || "—"}
                          </td>
                          <td
                            className="px-4 py-3 text-xs"
                            style={{ color: "#666" }}
                          >
                            {p.phone || "—"}
                          </td>
                          <td className="px-4 py-3">
                            {paid ? (
                              <Badge color={GR} text="#000">
                                enrolled
                              </Badge>
                            ) : (
                              <span style={{ color: "#333" }}>—</span>
                            )}
                          </td>
                          <td
                            className="px-4 py-3 text-xs"
                            style={{ color: "#555" }}
                          >
                            {fmtDate(p.created_at)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── PAYMENTS ── */}
            <section>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-base font-black text-white">
                  mentorship_payments
                </h2>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{ background: "#1a1a1a", color: "#666" }}
                >
                  {filteredPayments.length} rows
                </span>
              </div>
              <div
                className="rounded-xl border overflow-x-auto"
                style={{ borderColor: "#222" }}
              >
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      style={{
                        background: "#111",
                        borderBottom: "1px solid #222"
                      }}
                    >
                      {[
                        "name",
                        "plan",
                        "amount",
                        "batch",
                        "status",
                        "test?",
                        "phone",
                        "date",
                        "razorpay ref"
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left font-semibold"
                          style={{ color: "#555" }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.length === 0 && (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-4 py-8 text-center"
                          style={{ color: "#444" }}
                        >
                          no payments
                        </td>
                      </tr>
                    )}
                    {filteredPayments.map((p, i) => (
                      <tr
                        key={p.id || i}
                        style={{
                          borderBottom: "1px solid #1a1a1a",
                          background: i % 2 === 0 ? "#0d0d0d" : "#0a0a0a"
                        }}
                      >
                        <td className="px-4 py-3 font-semibold text-white">
                          {p.user_name || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            color={PLAN_COLORS[p.plan] || "#333"}
                            text="#000"
                          >
                            {p.plan || "—"}
                          </Badge>
                        </td>
                        <td
                          className="px-4 py-3 font-bold"
                          style={{ color: Y }}
                        >
                          {p.amount ? fmt(p.amount) : "—"}
                        </td>
                        <td className="px-4 py-3" style={{ color: "#888" }}>
                          {p.batch?.batch_number
                            ? `Batch ${p.batch.batch_number}`
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="px-4 py-3">
                          {p.is_test ? (
                            <Badge color="#333" text="#aaa">
                              test
                            </Badge>
                          ) : (
                            <span style={{ color: "#333" }}>—</span>
                          )}
                        </td>
                        <td
                          className="px-4 py-3 text-xs"
                          style={{ color: "#666" }}
                        >
                          {p.phone || "—"}
                        </td>
                        <td
                          className="px-4 py-3 text-xs"
                          style={{ color: "#555" }}
                        >
                          {fmtDate(p.created_at)}
                        </td>
                        <td
                          className="px-4 py-3 text-xs font-mono"
                          style={{
                            color: "#444",
                            maxWidth: 140,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {p.razorpay_payment_id || p.razorpay_order_id || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── BATCHES ── */}
            <section>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-base font-black text-white">
                  mentorship_batches
                </h2>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{ background: "#1a1a1a", color: "#666" }}
                >
                  {batches.length} rows
                </span>
              </div>
              <div
                className="rounded-xl border overflow-x-auto"
                style={{ borderColor: "#222" }}
              >
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      style={{
                        background: "#111",
                        borderBottom: "1px solid #222"
                      }}
                    >
                      {[
                        "batch #",
                        "start date",
                        "total seats",
                        "enrolled",
                        "spots left",
                        "status",
                        "created"
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left font-semibold"
                          style={{ color: "#555" }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {batches.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-8 text-center"
                          style={{ color: "#444" }}
                        >
                          no batches
                        </td>
                      </tr>
                    )}
                    {batches.map((b, i) => {
                      const enrolled = payments.filter(
                        (p) =>
                          p.status === "success" &&
                          !p.is_test &&
                          p.batch?.batch_number === b.batch_number
                      ).length;
                      const spotsLeft = Math.max(0, b.total_seats - enrolled);
                      return (
                        <tr
                          key={b.id || i}
                          style={{
                            borderBottom: "1px solid #1a1a1a",
                            background: i % 2 === 0 ? "#0d0d0d" : "#0a0a0a"
                          }}
                        >
                          <td className="px-4 py-3 font-black text-white">
                            Batch {b.batch_number}
                          </td>
                          <td className="px-4 py-3" style={{ color: "#888" }}>
                            {fmtDate(b.start_date)}
                          </td>
                          <td className="px-4 py-3" style={{ color: "#888" }}>
                            {b.total_seats}
                          </td>
                          <td
                            className="px-4 py-3 font-bold"
                            style={{ color: Y }}
                          >
                            {enrolled}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="font-bold"
                              style={{ color: spotsLeft === 0 ? P : GR }}
                            >
                              {spotsLeft}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              color={b.status === "open" ? GR : "#333"}
                              text={b.status === "open" ? "#000" : "#aaa"}
                            >
                              {b.status}
                            </Badge>
                          </td>
                          <td
                            className="px-4 py-3 text-xs"
                            style={{ color: "#555" }}
                          >
                            {fmtDate(b.created_at)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── WAITLIST ── */}
            <section>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-base font-black text-white">
                  mentorship_waitlist
                </h2>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{ background: "#1a1a1a", color: "#666" }}
                >
                  {filteredWaitlist.length} rows
                </span>
              </div>
              <div
                className="rounded-xl border overflow-x-auto"
                style={{ borderColor: "#222" }}
              >
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      style={{
                        background: "#111",
                        borderBottom: "1px solid #222"
                      }}
                    >
                      {["#", "name", "email", "phone", "joined"].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left font-semibold"
                          style={{ color: "#555" }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWaitlist.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-8 text-center"
                          style={{ color: "#444" }}
                        >
                          waitlist is empty
                        </td>
                      </tr>
                    )}
                    {filteredWaitlist.map((w, i) => (
                      <tr
                        key={w.id || i}
                        style={{
                          borderBottom: "1px solid #1a1a1a",
                          background: i % 2 === 0 ? "#0d0d0d" : "#0a0a0a"
                        }}
                      >
                        <td
                          className="px-4 py-3 text-xs"
                          style={{ color: "#444" }}
                        >
                          {i + 1}
                        </td>
                        <td className="px-4 py-3 font-semibold text-white">
                          {w.user_name || "—"}
                        </td>
                        <td
                          className="px-4 py-3 text-xs"
                          style={{ color: "#666" }}
                        >
                          {w.email || "—"}
                        </td>
                        <td
                          className="px-4 py-3 text-xs"
                          style={{ color: "#666" }}
                        >
                          {w.phone || "—"}
                        </td>
                        <td
                          className="px-4 py-3 text-xs"
                          style={{ color: "#555" }}
                        >
                          {fmtDate(w.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── PORTFOLIO REVIEWS ── */}
            <section>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-base font-black text-white">
                  portfolio_reviews
                </h2>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{ background: "#1a1a1a", color: "#666" }}
                >
                  {filteredReviews.length} rows
                </span>
              </div>

              <div
                className="rounded-xl border overflow-x-auto"
                style={{ borderColor: "#222" }}
              >
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      style={{
                        background: "#111",
                        borderBottom: "1px solid #222"
                      }}
                    >
                      {[
                        "name",
                        "email",
                        "portfolio",
                        "walkthrough",
                        "notes",
                        "submitted"
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left font-semibold"
                          style={{ color: "#555" }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredReviews.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-8 text-center"
                          style={{ color: "#444" }}
                        >
                          no portfolio reviews
                        </td>
                      </tr>
                    )}

                    {filteredReviews.map((r, i) => (
                      <tr
                        key={r.id || i}
                        style={{
                          borderBottom: "1px solid #1a1a1a",
                          background: i % 2 === 0 ? "#0d0d0d" : "#0a0a0a"
                        }}
                      >
                        {/* NAME */}
                        <td className="px-4 py-3 font-semibold text-white">
                          {r.name || "—"}
                        </td>

                        {/* EMAIL */}
                        <td
                          className="px-4 py-3 text-xs"
                          style={{ color: "#888" }}
                        >
                          {r.email || "—"}
                        </td>

                        {/* PORTFOLIO */}
                        <td className="px-4 py-3 text-xs">
                          {r.portfolio_link ? (
                            <a
                              href={r.portfolio_link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-yellow-400 underline"
                            >
                              open link
                            </a>
                          ) : r.portfolio_file_url ? (
                            <a
                              href={r.portfolio_file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-yellow-400 underline"
                            >
                              view file
                            </a>
                          ) : (
                            <span style={{ color: "#444" }}>—</span>
                          )}
                        </td>

                        {/* WALKTHROUGH */}
                        <td className="px-4 py-3 text-xs">
                          {r.walkthrough_link ? (
                            <a
                              href={r.walkthrough_link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-yellow-400 underline"
                            >
                              watch
                            </a>
                          ) : (
                            <span style={{ color: "#444" }}>—</span>
                          )}
                        </td>

                        {/* NOTES */}
                        <td
                          className="px-4 py-3 text-xs"
                          style={{
                            color: "#aaa",
                            maxWidth: 300,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}
                          title={r.notes}
                        >
                          {r.notes || "—"}
                        </td>

                        {/* DATE */}
                        <td
                          className="px-4 py-3 text-xs"
                          style={{ color: "#666" }}
                        >
                          {fmtDate(r.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
