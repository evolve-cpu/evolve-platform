import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../supabaseClient";
import { supabaseAdmin } from "../../supabaseAdminClient";
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

function downloadCSV(filename, rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (v) => {
    // Prefix with a tab so Excel treats the cell as plain text, not a date/number
    const s = String(v ?? "").replace(/"/g, '""');
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s}"`
      : s;
  };
  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))
  ];
  const blob = new Blob(["\uFEFF" + lines.join("\n")], {
    type: "text/csv;charset=utf-8;"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

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

function AvatarCell({ name, url }) {
  const initial = (name || "?")[0].toUpperCase();
  const [failed, setFailed] = useState(false);
  if (url && !failed) {
    return (
      <img
        src={url}
        alt=""
        referrerPolicy="no-referrer"
        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
      style={{ background: "#2a2a2a", color: "#888" }}
    >
      {initial}
    </div>
  );
}

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

/* ─── Review upload + send cell ──────────────────────────────────────────── */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const BREVO_PORTFOLIO_TEMPLATE_ID = import.meta.env
  .VITE_BREVO_PORTFOLIO_TEMPLATE_ID;

function ReviewUploadCell({ review, onDone }) {
  const [state, setState] = useState("idle"); // idle | preview | uploading | sending | done | error
  const [msg, setMsg] = useState("");
  const [remarks, setRemarks] = useState(review.remarks || "");
  const [pendingFile, setPendingFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const inputRef = useRef(null);

  const onFileChosen = (file) => {
    if (!file || file.type !== "application/pdf") {
      setMsg("PDF only");
      setState("error");
      return;
    }
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setState("preview");
  };

  const cancelPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPendingFile(null);
    setPreviewUrl(null);
    setState("idle");
    setMsg("");
    // reset input so same file can be re-selected
    if (inputRef.current) inputRef.current.value = "";
  };

  const handle = async (file) => {
    if (!file || file.type !== "application/pdf") {
      setMsg("PDF only");
      setState("error");
      return;
    }

    setState("uploading");
    setMsg("");

    // 1. Upload PDF to Supabase Storage bucket "review-reports"
    const path = `${review.user_id}/${review.id}.pdf`;
    const { error: upErr } = await supabaseAdmin.storage
      .from("review-reports")
      .upload(path, file, { upsert: true, contentType: "application/pdf" });

    if (upErr) {
      setState("error");
      setMsg(upErr.message);
      return;
    }

    const { data: urlData } = supabaseAdmin.storage
      .from("review-reports")
      .getPublicUrl(path);
    const reportUrl = urlData?.publicUrl;

    // 2. Save URL + remarks + mark done in portfolio_reviews row
    const { error: dbErr } = await supabaseAdmin
      .from("portfolio_reviews")
      .update({ review_report_url: reportUrl, review_status: "done", remarks: remarks.trim() })
      .eq("id", review.id);

    if (dbErr) {
      setState("error");
      setMsg(dbErr.message);
      return;
    }

    // 3. Call edge function to send Brevo email with PDF attachment
    setState("sending");
    const fnUrl = `${SUPABASE_URL}/functions/v1/send-review-email`;
    const res = await fetch(fnUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "apikey": SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        to_email: review.email,
        to_name: review.name,
        report_url: reportUrl,
        template_id: BREVO_PORTFOLIO_TEMPLATE_ID,
        remarks: remarks.trim()
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setState("error");
      setMsg(err.error || err.message || `email failed (${res.status})`);
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setState("done");
    setMsg("sent ✓");
    onDone(review.id, reportUrl, remarks.trim());
  };

  if (state === "done") {
    return (
      <span className="text-xs font-bold" style={{ color: GR }}>
        sent ✓
      </span>
    );
  }

  if (review.review_report_url) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold" style={{ color: GR }}>
          done
        </span>
        <a
          href={review.review_report_url}
          target="_blank"
          rel="noreferrer"
          className="text-xs underline"
          style={{ color: "#888" }}
        >
          pdf
        </a>
      </div>
    );
  }

  const busy = state === "uploading" || state === "sending";

  // Preview/confirm modal
  if (state === "preview" && previewUrl) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col"
        style={{ background: "rgba(0,0,0,0.92)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <p className="text-white font-bold text-sm">{review.name} — {pendingFile?.name}</p>
            {remarks.trim() && (
              <p className="text-xs mt-1" style={{ color: "#aaa" }}>
                remarks: {remarks.trim()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={cancelPreview}
              className="text-xs px-4 py-2 rounded-lg font-semibold border border-white/20 text-white hover:bg-white/10"
            >
              ✕ cancel
            </button>
            <button
              onClick={() => handle(pendingFile)}
              className="text-xs px-4 py-2 rounded-lg font-bold"
              style={{ background: GR, color: "#000" }}
            >
              ✓ looks good — send
            </button>
          </div>
        </div>
        {/* PDF preview */}
        <iframe
          src={previewUrl}
          title="preview report"
          className="flex-1 w-full"
          style={{ border: "none" }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5" style={{ minWidth: 180 }}>
      <textarea
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
        placeholder="remarks (shown in email)…"
        rows={2}
        disabled={busy}
        className="text-xs rounded-lg px-2 py-1.5 resize-none disabled:opacity-40"
        style={{ background: "#1a1a1a", border: "1px solid #333", color: "#ccc", width: "100%" }}
      />
      <button
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="text-xs px-3 py-1.5 rounded-lg font-semibold disabled:opacity-40 whitespace-nowrap"
        style={{ background: Y, color: "#000" }}
      >
        {state === "uploading"
          ? "uploading…"
          : state === "sending"
            ? "sending…"
            : "↑ upload report"}
      </button>
      {msg && (
        <span
          className="text-xs"
          style={{ color: state === "error" ? "#ef4444" : GR }}
        >
          {msg}
        </span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => onFileChosen(e.target.files?.[0])}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MentorshipPortfolioUploadCell — similar to ReviewUploadCell
   but saves to mentorship_portfolio_versions (no email)
═══════════════════════════════════════════════════════════════════════════ */
function MentorshipPortfolioUploadCell({ version, onDone }) {
  const [state, setState] = useState("idle");
  const [msg, setMsg] = useState("");
  const [remarks, setRemarks] = useState(version.review_remarks || "");
  const [pendingFile, setPendingFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const inputRef = useRef(null);

  const onFileChosen = (file) => {
    if (!file || file.type !== "application/pdf") { setMsg("PDF only"); setState("error"); return; }
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setState("preview");
  };

  const cancelPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPendingFile(null); setPreviewUrl(null); setState("idle"); setMsg("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const handle = async (file) => {
    if (!file || file.type !== "application/pdf") { setMsg("PDF only"); setState("error"); return; }
    setState("uploading"); setMsg("");
    const path = `mentorship/${version.user_id}/${version.id}.pdf`;
    const { error: upErr } = await supabaseAdmin.storage.from("review-reports").upload(path, file, { upsert: true, contentType: "application/pdf" });
    if (upErr) { setState("error"); setMsg(upErr.message); return; }
    const { data: urlData } = supabaseAdmin.storage.from("review-reports").getPublicUrl(path);
    const reportUrl = urlData?.publicUrl;
    const { error: dbErr } = await supabaseAdmin
      .from("mentorship_portfolio_versions")
      .update({ review_report_url: reportUrl, review_remarks: remarks.trim() })
      .eq("id", version.id);
    if (dbErr) { setState("error"); setMsg(dbErr.message); return; }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setState("done"); setMsg("saved ✓");
    onDone(version.id, reportUrl, remarks.trim());
  };

  if (state === "done") return <span className="text-xs font-bold" style={{ color: "#22c55e" }}>saved ✓</span>;

  if (version.review_report_url) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold" style={{ color: "#22c55e" }}>done</span>
        <a href={version.review_report_url} target="_blank" rel="noreferrer" className="text-xs underline" style={{ color: "#888" }}>view</a>
      </div>
    );
  }

  if (state === "preview") {
    return (
      <div className="flex flex-col gap-1.5">
        <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="remarks (optional)" rows={2}
          className="text-xs px-2 py-1 rounded outline-none resize-none" style={{ background: "#1a1a1a", border: "1px solid #333", color: "#ddd", width: 180 }} />
        <a href={previewUrl} target="_blank" rel="noreferrer" className="text-xs underline" style={{ color: Y }}>preview pdf</a>
        <div className="flex gap-2">
          <button onClick={() => handle(pendingFile)} className="text-xs px-2 py-1 rounded font-semibold" style={{ background: Y, color: "#000" }}>send</button>
          <button onClick={cancelPreview} className="text-xs px-2 py-1 rounded" style={{ background: "#222", color: "#888" }}>cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="remarks (optional)" rows={2}
        className="text-xs px-2 py-1 rounded outline-none resize-none" style={{ background: "#1a1a1a", border: "1px solid #333", color: "#ddd", width: 180 }} />
      {state === "error" && <span className="text-xs" style={{ color: "#f87171" }}>{msg}</span>}
      <label className="cursor-pointer text-xs px-3 py-1.5 rounded-lg font-semibold inline-block" style={{ background: "#111", border: "1px solid #333", color: Y }}>
        {state === "uploading" ? "uploading…" : "↑ upload pdf"}
        <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => onFileChosen(e.target.files?.[0])} />
      </label>
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
  const [mentorshipPortfolios, setMentorshipPortfolios] = useState([]);
  const [mentorshipProfilesData, setMentorshipProfilesData] = useState([]);
  const [mentorshipResumes, setMentorshipResumes] = useState([]);
  const [sessions, setSessions] = useState([]);
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
        { data: reviewData, error: reviewErr },
        { data: sessData }
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

        supabase
          .from("portfolio_reviews")
          .select("*")
          .order("created_at", { ascending: false }),

        supabase
          .from("mentorship_sessions")
          .select("*")
          .order("batch_id")
          .order("session_number")
      ]);

      if (pErr) throw pErr;
      if (bErr) throw bErr;
      if (wErr) throw wErr;
      if (prErr) throw prErr;
      if (reviewErr) throw reviewErr;

      setPortfolioReviews(reviewData || []);
      setSessions(sessData || []);

      // Mentorship portfolio versions (joined with profiles for name/email)
      const { data: mpData } = await supabaseAdmin
        .from("mentorship_portfolio_versions")
        .select("*, profiles:user_id(name, email)")
        .order("created_at", { ascending: false });
      setMentorshipPortfolios(mpData || []);

      // Mentorship profiles (the onboarding form data)
      const { data: mprofData } = await supabaseAdmin
        .from("mentorship_profiles")
        .select("*, batch:batch_id(batch_number, start_date)")
        .order("created_at", { ascending: false });
      setMentorshipProfilesData(mprofData || []);

      // Mentorship resume versions
      const { data: mrData } = await supabaseAdmin
        .from("mentorship_resume_versions")
        .select("*")
        .order("version_number", { ascending: true });
      setMentorshipResumes(mrData || []);

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

  /* ── optimistic update after report upload ──────────────────────────── */
  const handleReportDone = (reviewId, reportUrl, remarks) => {
    setPortfolioReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, review_report_url: reportUrl, review_status: "done", remarks }
          : r
      )
    );
  };

  const handleMentorshipReportDone = (versionId, reportUrl, remarks) => {
    setMentorshipPortfolios((prev) =>
      prev.map((v) =>
        v.id === versionId ? { ...v, review_report_url: reportUrl, review_remarks: remarks } : v
      )
    );
  };

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
        (r.name || "").toLowerCase().includes(q) ||
        (r.email || "").toLowerCase().includes(q)
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
    { id: "profiles", label: `profiles (${profiles.length})` },
    { id: "reviews", label: `reviews (${portfolioReviews.length})` },
    { id: "m-portfolios", label: `m-portfolios (${mentorshipPortfolios.length})` },
    { id: "m-profiles", label: `m-profiles (${mentorshipProfilesData.length})` },
    { id: "sessions", label: "sessions" }
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
              <button
                onClick={() =>
                  downloadCSV(
                    "payments.csv",
                    filteredPayments.map((p) => ({
                      name: p.user_name || "",
                      plan: p.plan || "",
                      amount: p.amount || "",
                      batch: p.batch?.batch_number
                        ? `Batch ${p.batch.batch_number}`
                        : "",
                      status: p.status || "",
                      is_test: p.is_test ? "yes" : "no",
                      phone: p.phone || "",
                      date: fmtDate(p.created_at),
                      razorpay_ref:
                        p.razorpay_payment_id || p.razorpay_order_id || ""
                    }))
                  )
                }
                className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                style={{
                  background: "#111",
                  border: "1px solid #333",
                  color: Y
                }}
              >
                ↓ csv
              </button>
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
              <button
                onClick={() =>
                  downloadCSV(
                    "waitlist.csv",
                    filteredWaitlist.map((w) => ({
                      name: w.user_name || "",
                      email: w.email || "",
                      phone: w.phone || "",
                      joined: fmtDate(w.created_at)
                    }))
                  )
                }
                className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                style={{
                  background: "#111",
                  border: "1px solid #333",
                  color: Y
                }}
              >
                ↓ csv
              </button>
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
        {/* ══════════════════════════════════════════════════════════════
            PROFILES TAB
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "profiles" && (
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
                {filteredProfiles.length} users
              </span>
              <button
                onClick={() =>
                  downloadCSV(
                    "profiles.csv",
                    filteredProfiles.map((p) => ({
                      name: p.name || p.username || "",
                      email: p.email || "",
                      phone: p.phone || "",
                      enrolled: enrolledIds.has(p.id) ? "yes" : "no",
                      joined: fmtDate(p.created_at)
                    }))
                  )
                }
                className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                style={{
                  background: "#111",
                  border: "1px solid #333",
                  color: Y
                }}
              >
                ↓ csv
              </button>
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
                          <AvatarCell
                            name={p.name || p.username}
                            url={p.avatar_url}
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
          </div>
        )}

        {activeTab === "reviews" && (
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
                {filteredReviews.length} reviews
              </span>
              <button
                onClick={() =>
                  downloadCSV(
                    "portfolio_reviews.csv",
                    filteredReviews.map((r) => ({
                      name: r.name || "",
                      email: r.email || "",
                      portfolio_link: r.portfolio_link || "",
                      portfolio_file: r.portfolio_file_url || "",
                      target_roles: r.target_roles || "",
                      proud_project: r.proud_project || "",
                      notes: r.notes || "",
                      submitted: fmtDate(r.created_at),
                      remarks: r.remarks || ""
                    }))
                  )
                }
                className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                style={{
                  background: "#111",
                  border: "1px solid #333",
                  color: Y
                }}
              >
                ↓ csv
              </button>
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
                      "target roles",
                      "proud project",
                      "notes",
                      "submitted",
                      "remarks",
                      "report"
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
                        colSpan={9}
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

                      {/* TARGET ROLES */}
                      <td
                        className="px-4 py-3 text-xs"
                        style={{
                          color: "#aaa",
                          maxWidth: 200,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}
                        title={r.target_roles}
                      >
                        {r.target_roles || "—"}
                      </td>

                      {/* PROUD PROJECT */}
                      <td
                        className="px-4 py-3 text-xs"
                        style={{
                          color: "#aaa",
                          maxWidth: 250,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}
                        title={r.proud_project}
                      >
                        {r.proud_project || "—"}
                      </td>

                      {/* NOTES */}
                      <td
                        className="px-4 py-3 text-xs"
                        style={{
                          color: "#aaa",
                          maxWidth: 200,
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

                      {/* REMARKS */}
                      <td
                        className="px-4 py-3 text-xs"
                        style={{
                          color: "#aaa",
                          maxWidth: 220,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}
                        title={r.remarks}
                      >
                        {r.remarks || "—"}
                      </td>

                      {/* REPORT — upload + auto-send */}
                      <td className="px-4 py-3">
                        <ReviewUploadCell
                          review={r}
                          onDone={handleReportDone}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            MENTORSHIP PORTFOLIOS TAB
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "m-portfolios" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="search by name or email…"
                className="flex-1 max-w-sm px-4 py-2 rounded-lg text-sm outline-none"
                style={{ background: "#111", border: "1px solid #222", color: "#fff" }} />
              <span className="text-xs" style={{ color: "#555" }}>{mentorshipPortfolios.length} submissions</span>
            </div>
            <div className="rounded-xl border overflow-x-auto" style={{ borderColor: "#222" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "#111", borderBottom: "1px solid #222" }}>
                    {["name", "email", "version", "portfolio", "walkthrough", "notes", "submitted", "remarks", "report"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-semibold" style={{ color: "#555" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mentorshipPortfolios.filter(v => {
                    const q = search.toLowerCase();
                    return !q || (v.profiles?.name || "").toLowerCase().includes(q) || (v.profiles?.email || "").toLowerCase().includes(q);
                  }).map((v, i) => (
                    <tr key={v.id} style={{ borderBottom: "1px solid #1a1a1a", background: i % 2 === 0 ? "#0d0d0d" : "#0a0a0a" }}>
                      <td className="px-4 py-3 font-semibold text-white">{v.profiles?.name || "—"}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: "#888" }}>{v.profiles?.email || "—"}</td>
                      <td className="px-4 py-3 text-xs text-white font-bold">v{v.version_number}</td>
                      <td className="px-4 py-3 text-xs">
                        {v.portfolio_url ? <a href={v.portfolio_url} target="_blank" rel="noreferrer" className="text-yellow-400 underline">open link</a> : <span style={{ color: "#444" }}>—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {v.walkthrough_url ? <a href={v.walkthrough_url} target="_blank" rel="noreferrer" className="text-yellow-400 underline">walkthrough</a> : <span style={{ color: "#444" }}>—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: "#aaa", maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={v.notes}>{v.notes || "—"}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: "#666" }}>{fmtDate(v.created_at)}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: "#aaa", maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={v.review_remarks}>{v.review_remarks || "—"}</td>
                      <td className="px-4 py-3">
                        <MentorshipPortfolioUploadCell version={v} onDone={handleMentorshipReportDone} />
                      </td>
                    </tr>
                  ))}
                  {mentorshipPortfolios.length === 0 && (
                    <tr><td colSpan={9} className="px-4 py-8 text-center" style={{ color: "#444" }}>no portfolio submissions yet</td></tr>
                  )}
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
                <button
                  onClick={() =>
                    downloadCSV(
                      "profiles.csv",
                      filteredProfiles.map((p) => ({
                        name: p.name || p.username || "",
                        email: p.email || "",
                        phone: p.phone || "",
                        enrolled: enrolledIds.has(p.id) ? "yes" : "no",
                        joined: fmtDate(p.created_at)
                      }))
                    )
                  }
                  className="text-xs px-3 py-1.5 rounded-lg font-semibold ml-auto"
                  style={{
                    background: "#1a1a1a",
                    border: "1px solid #333",
                    color: Y
                  }}
                >
                  ↓ csv
                </button>
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
                            {p.avatar_url ? (
                              <img
                                src={p.avatar_url}
                                alt=""
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                style={{ background: "#2a2a2a", color: "#888" }}
                              >
                                {(p.name || p.username || "?")[0].toUpperCase()}
                              </div>
                            )}
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
                <button
                  onClick={() =>
                    downloadCSV(
                      "payments.csv",
                      filteredPayments.map((p) => ({
                        name: p.user_name || "",
                        plan: p.plan || "",
                        amount: p.amount || "",
                        batch: p.batch?.batch_number
                          ? `Batch ${p.batch.batch_number}`
                          : "",
                        status: p.status || "",
                        is_test: p.is_test ? "yes" : "no",
                        phone: p.phone || "",
                        date: fmtDate(p.created_at),
                        razorpay_ref:
                          p.razorpay_payment_id || p.razorpay_order_id || ""
                      }))
                    )
                  }
                  className="text-xs px-3 py-1.5 rounded-lg font-semibold ml-auto"
                  style={{
                    background: "#1a1a1a",
                    border: "1px solid #333",
                    color: Y
                  }}
                >
                  ↓ csv
                </button>
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
                <button
                  onClick={() =>
                    downloadCSV(
                      "batches.csv",
                      batches.map((b) => {
                        const enrolled = payments.filter(
                          (p) =>
                            p.status === "success" &&
                            !p.is_test &&
                            p.batch?.batch_number === b.batch_number
                        ).length;
                        return {
                          batch_number: b.batch_number,
                          start_date: fmtDate(b.start_date),
                          total_seats: b.total_seats,
                          enrolled,
                          spots_left: Math.max(0, b.total_seats - enrolled),
                          status: b.status || "",
                          created: fmtDate(b.created_at)
                        };
                      })
                    )
                  }
                  className="text-xs px-3 py-1.5 rounded-lg font-semibold ml-auto"
                  style={{
                    background: "#1a1a1a",
                    border: "1px solid #333",
                    color: Y
                  }}
                >
                  ↓ csv
                </button>
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
                <button
                  onClick={() =>
                    downloadCSV(
                      "waitlist.csv",
                      filteredWaitlist.map((w) => ({
                        name: w.user_name || "",
                        email: w.email || "",
                        phone: w.phone || "",
                        joined: fmtDate(w.created_at)
                      }))
                    )
                  }
                  className="text-xs px-3 py-1.5 rounded-lg font-semibold ml-auto"
                  style={{
                    background: "#1a1a1a",
                    border: "1px solid #333",
                    color: Y
                  }}
                >
                  ↓ csv
                </button>
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
                <button
                  onClick={() =>
                    downloadCSV(
                      "portfolio_reviews.csv",
                      filteredReviews.map((r) => ({
                        name: r.name || "",
                        email: r.email || "",
                        portfolio_link: r.portfolio_link || "",
                        portfolio_file: r.portfolio_file_url || "",
                        target_roles: r.target_roles || "",
                        proud_project: r.proud_project || "",
                        notes: r.notes || "",
                        submitted: fmtDate(r.created_at)
                      }))
                    )
                  }
                  className="text-xs px-3 py-1.5 rounded-lg font-semibold ml-auto"
                  style={{
                    background: "#1a1a1a",
                    border: "1px solid #333",
                    color: Y
                  }}
                >
                  ↓ csv
                </button>
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
                        "target roles",
                        "proud project",
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
                          colSpan={7}
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

                        {/* TARGET ROLES */}
                        <td
                          className="px-4 py-3 text-xs"
                          style={{
                            color: "#aaa",
                            maxWidth: 200,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}
                          title={r.target_roles}
                        >
                          {r.target_roles || "—"}
                        </td>

                        {/* PROUD PROJECT */}
                        <td
                          className="px-4 py-3 text-xs"
                          style={{
                            color: "#aaa",
                            maxWidth: 250,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}
                          title={r.proud_project}
                        >
                          {r.proud_project || "—"}
                        </td>

                        {/* NOTES */}
                        <td
                          className="px-4 py-3 text-xs"
                          style={{
                            color: "#aaa",
                            maxWidth: 200,
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
        {/* ══════════════════════════════════════════════════════════════
            MENTORSHIP PROFILES TAB
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "m-profiles" && (() => {
          // Build lookup maps from user_id → array of submissions
          const portfoliosByUser = mentorshipPortfolios.reduce((acc, p) => {
            const uid = p.user_id;
            if (!acc[uid]) acc[uid] = [];
            acc[uid].push(p);
            return acc;
          }, {});
          const resumesByUser = mentorshipResumes.reduce((acc, r) => {
            const uid = r.user_id;
            if (!acc[uid]) acc[uid] = [];
            acc[uid].push(r);
            return acc;
          }, {});

          const q = search.toLowerCase();
          const filtered = mentorshipProfilesData.filter(p =>
            !q ||
            (p.name || "").toLowerCase().includes(q) ||
            (p.email || "").toLowerCase().includes(q) ||
            (p.goal || "").toLowerCase().includes(q)
          );

          return (
            <div className="space-y-5">
              {/* header row */}
              <div className="flex items-center gap-3">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="search by name, email or goal…"
                  className="flex-1 max-w-sm px-4 py-2 rounded-lg text-sm outline-none"
                  style={{ background: "#111", border: "1px solid #222", color: "#fff" }}
                />
                <span className="text-xs" style={{ color: "#555" }}>
                  {filtered.length} profiles
                </span>
              </div>

              {filtered.length === 0 && (
                <div className="py-16 text-center" style={{ color: "#444" }}>
                  no mentorship profiles yet
                </div>
              )}

              <div className="flex flex-col gap-4">
                {filtered.map((p) => {
                  const portfolios = (portfoliosByUser[p.user_id] || []).sort((a, b) => a.version_number - b.version_number);
                  const resumes = (resumesByUser[p.user_id] || []).sort((a, b) => a.version_number - b.version_number);
                  const initial = (p.name || "?")[0].toUpperCase();
                  const batchNum = p.batch?.batch_number;

                  return (
                    <div
                      key={p.user_id}
                      className="rounded-2xl border overflow-hidden"
                      style={{ background: "#0d0d0d", borderColor: "#1e1e1e" }}
                    >
                      {/* ── Card header ── */}
                      <div className="flex items-start gap-4 p-5 border-b" style={{ borderColor: "#1a1a1a" }}>
                        {/* Avatar */}
                        <div
                          className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-base font-black"
                          style={{ background: "#FFD007", color: "#161618" }}
                        >
                          {initial}
                        </div>

                        {/* Name / email / meta */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-white font-bold text-base">{p.name || "—"}</span>
                            {batchNum && (
                              <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={{ background: "rgba(255,208,7,0.12)", color: "#FFD007" }}
                              >
                                batch {batchNum}
                              </span>
                            )}
                          </div>
                          <p className="text-xs mb-2" style={{ color: "#666" }}>{p.email || "—"}</p>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-[11px]" style={{ color: "#555" }}>
                              joined {fmtDate(p.created_at)}
                            </span>
                            {p.linkedin_url && (
                              <a
                                href={p.linkedin_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] font-semibold flex items-center gap-1"
                                style={{ color: "#0A66C2" }}
                              >
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                </svg>
                                LinkedIn
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* ── Goal ── */}
                      <div className="px-5 py-4 border-b" style={{ borderColor: "#1a1a1a" }}>
                        <p className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "#555" }}>goal</p>
                        <p className="text-sm leading-relaxed" style={{ color: "#ccc" }}>{p.goal || "—"}</p>
                      </div>

                      {/* ── Submissions ── */}
                      <div className="grid grid-cols-2 divide-x" style={{ borderColor: "#1a1a1a" }}>
                        {/* Portfolio versions */}
                        <div className="p-5">
                          <p className="text-[10px] uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: "#555" }}>
                            portfolio
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#1a1a1a", color: "#666" }}>
                              {portfolios.length}
                            </span>
                          </p>
                          {portfolios.length === 0 ? (
                            <p className="text-xs" style={{ color: "#333" }}>no uploads yet</p>
                          ) : (
                            <div className="flex flex-col gap-2.5">
                              {portfolios.map((pf) => (
                                <div key={pf.id} className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                      style={{ background: "#222", color: "#888" }}
                                    >
                                      {pf.version_number}
                                    </span>
                                    {pf.portfolio_url && (
                                      <a href={pf.portfolio_url} target="_blank" rel="noreferrer"
                                        className="text-[11px] font-semibold"
                                        style={{ color: "#FFD007" }}>
                                        portfolio ↗
                                      </a>
                                    )}
                                    {pf.walkthrough_url && (
                                      <a href={pf.walkthrough_url} target="_blank" rel="noreferrer"
                                        className="text-[11px] font-semibold"
                                        style={{ color: "#DF0586" }}>
                                        walkthrough ↗
                                      </a>
                                    )}
                                  </div>
                                  {pf.notes && (
                                    <p className="text-[11px] pl-7 leading-relaxed" style={{ color: "#555" }}>{pf.notes}</p>
                                  )}
                                  {pf.review_report_url && (
                                    <a href={pf.review_report_url} target="_blank" rel="noreferrer"
                                      className="text-[11px] pl-7 font-semibold flex items-center gap-1"
                                      style={{ color: GR }}>
                                      <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                                        <path d="M8 2v8M4 7l4 4 4-4M2 13h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                      report uploaded
                                    </a>
                                  )}
                                  {pf.review_remarks && (
                                    <p className="text-[11px] pl-7 italic" style={{ color: "#555" }}>{pf.review_remarks}</p>
                                  )}
                                  <p className="text-[10px] pl-7" style={{ color: "#444" }}>{fmtDate(pf.created_at)}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Resume versions */}
                        <div className="p-5" style={{ borderColor: "#1a1a1a" }}>
                          <p className="text-[10px] uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: "#555" }}>
                            resume
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#1a1a1a", color: "#666" }}>
                              {resumes.length}
                            </span>
                          </p>
                          {resumes.length === 0 ? (
                            <p className="text-xs" style={{ color: "#333" }}>no uploads yet</p>
                          ) : (
                            <div className="flex flex-col gap-2.5">
                              {resumes.map((r) => (
                                <div key={r.id} className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                      style={{ background: "#222", color: "#888" }}
                                    >
                                      {r.version_number}
                                    </span>
                                    {r.resume_url && (
                                      <a href={r.resume_url} target="_blank" rel="noreferrer"
                                        className="text-[11px] font-semibold"
                                        style={{ color: "#FFD007" }}>
                                        resume ↗
                                      </a>
                                    )}
                                  </div>
                                  {r.notes && (
                                    <p className="text-[11px] pl-7 leading-relaxed" style={{ color: "#555" }}>{r.notes}</p>
                                  )}
                                  <p className="text-[10px] pl-7" style={{ color: "#444" }}>{fmtDate(r.created_at)}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* ══════════════════════════════════════════════════════════════
            SESSIONS TAB
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "sessions" && (
          <SessionsTab
            batches={batches}
            sessions={sessions}
            onSessionsChange={setSessions}
          />
        )}

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SessionsTab — add / edit sessions per batch
═══════════════════════════════════════════════════════════════════════════ */
const SESSION_NAMES = ["discover", "analyse", "design", "build", "present"];

function SessionsTab({ batches, sessions, onSessionsChange }) {
  // editingKey: `${batchId}-${sessionNumber}` or null
  const [editingKey, setEditingKey] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", date: "", time: "21:30", meet_link: "", recording_path: "", summary: "", next_steps: "", transcript: "" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const sessionMap = {};
  sessions.forEach((s) => {
    sessionMap[`${s.batch_id}-${s.session_number}`] = s;
  });

  // Convert IST datetime string to UTC timestamptz for storage
  function istToUtc(dateStr, timeStr) {
    // dateStr: "YYYY-MM-DD", timeStr: "HH:MM" (IST)
    const [h, m] = timeStr.split(":").map(Number);
    const utcH = h - 5;
    const utcM = m - 30;
    const d = new Date(`${dateStr}T00:00:00Z`);
    d.setUTCHours(utcH, utcM, 0, 0);
    return d.toISOString();
  }

  // Convert stored UTC datetime back to IST for display in form
  function utcToIst(datetimeStr) {
    if (!datetimeStr) return { date: "", time: "21:30" };
    const d = new Date(datetimeStr);
    const istDate = new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
    const date = istDate.toISOString().slice(0, 10);
    const hh = String(istDate.getUTCHours()).padStart(2, "0");
    const mm = String(istDate.getUTCMinutes()).padStart(2, "0");
    return { date, time: `${hh}:${mm}` };
  }

  function openEdit(batchId, sessionNumber) {
    const key = `${batchId}-${sessionNumber}`;
    const existing = sessionMap[key];
    const ist = utcToIst(existing?.session_datetime);
    setForm({
      name:          existing?.name          || SESSION_NAMES[sessionNumber - 1] || "",
      description:   existing?.description   || "",
      date:          ist.date,
      time:          ist.time,
      meet_link:     existing?.meet_link     || "",
      recording_path: existing?.recording_path || "",
      summary:       existing?.summary       || "",
      next_steps:    existing?.next_steps    || "",
      transcript:    existing?.transcript    || ""
    });
    setEditingKey(key);
    setSaveError("");
  }

  async function handleSave(batchId, sessionNumber) {
    if (!form.name.trim() || !form.date || !form.time) {
      setSaveError("name, date and time are required");
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      const session_datetime = istToUtc(form.date, form.time);
      const payload = {
        batch_id:        batchId,
        session_number:  sessionNumber,
        name:            form.name.trim(),
        description:     form.description.trim()   || null,
        session_datetime,
        meet_link:       form.meet_link.trim()      || null,
        recording_path:   form.recording_path.trim()  || null,
        summary:         form.summary.trim()        || null,
        next_steps:      form.next_steps.trim()     || null,
        transcript:      form.transcript.trim()     || null
      };
      const key = `${batchId}-${sessionNumber}`;
      const existing = sessionMap[key];

      let result;
      if (existing) {
        result = await supabase
          .from("mentorship_sessions")
          .update({
            name: payload.name, description: payload.description,
            session_datetime, meet_link: payload.meet_link,
            recording_path: payload.recording_path, summary: payload.summary,
            next_steps: payload.next_steps, transcript: payload.transcript
          })
          .eq("id", existing.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from("mentorship_sessions")
          .insert(payload)
          .select()
          .single();
      }
      if (result.error) throw result.error;

      // update local state
      const updated = result.data;
      onSessionsChange((prev) => {
        const filtered = prev.filter(
          (s) => !(s.batch_id === batchId && s.session_number === sessionNumber)
        );
        return [...filtered, updated].sort((a, b) =>
          a.batch_id === b.batch_id ? a.session_number - b.session_number : 0
        );
      });
      setEditingKey(null);
    } catch (err) {
      setSaveError(err.message || "save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(batchId, sessionNumber) {
    const key = `${batchId}-${sessionNumber}`;
    const existing = sessionMap[key];
    if (!existing) return;
    if (!window.confirm(`Delete session ${sessionNumber} for this batch?`)) return;
    await supabase.from("mentorship_sessions").delete().eq("id", existing.id);
    onSessionsChange((prev) =>
      prev.filter((s) => !(s.batch_id === batchId && s.session_number === sessionNumber))
    );
    if (editingKey === key) setEditingKey(null);
  }

  if (batches.length === 0) {
    return <p style={{ color: "#444" }}>no batches found — create a batch first</p>;
  }

  return (
    <div className="space-y-6">
      {batches.map((batch) => (
        <div
          key={batch.id}
          className="rounded-xl border p-5 space-y-4"
          style={{ background: "#111", borderColor: "#222" }}
        >
          {/* batch header */}
          <div className="flex items-center gap-3">
            <h3 className="text-base font-black text-white">
              Batch {batch.batch_number}
            </h3>
            <span className="text-xs" style={{ color: "#555" }}>
              starts {fmtDate(batch.start_date)}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{
                background: batch.status === "open" ? "rgba(34,197,94,0.15)" : "#1a1a1a",
                color: batch.status === "open" ? GR : "#555"
              }}
            >
              {batch.status}
            </span>
          </div>

          {/* 5 session slots */}
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((num) => {
              const key = `${batch.id}-${num}`;
              const sess = sessionMap[key];
              const isEditing = editingKey === key;

              return (
                <div
                  key={num}
                  className="rounded-lg border"
                  style={{
                    background: "#0d0d0d",
                    borderColor: isEditing ? Y : "#1a1a1a"
                  }}
                >
                  {/* row header */}
                  <div className="flex items-center gap-3 px-4 py-3">
                    <span
                      className="text-xs font-black w-20 flex-shrink-0"
                      style={{ color: Y }}
                    >
                      session {num}
                    </span>

                    {sess ? (
                      <>
                        <span className="text-sm font-semibold text-white flex-1">{sess.name}</span>
                        <span className="text-xs flex-shrink-0" style={{ color: "#555" }}>
                          {(() => {
                            const d = new Date(sess.session_datetime);
                            return d.toLocaleString("en-IN", {
                              timeZone: "Asia/Kolkata",
                              day: "numeric", month: "short", year: "numeric",
                              hour: "numeric", minute: "2-digit", hour12: true
                            }) + " IST";
                          })()}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs flex-1" style={{ color: "#444" }}>
                        not added yet
                      </span>
                    )}

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => isEditing ? setEditingKey(null) : openEdit(batch.id, num)}
                        className="text-xs px-3 py-1 rounded-lg font-semibold transition-colors"
                        style={{
                          background: isEditing ? "#222" : "rgba(255,208,7,0.12)",
                          color: isEditing ? "#666" : Y
                        }}
                      >
                        {isEditing ? "cancel" : sess ? "edit" : "+ add"}
                      </button>
                      {sess && !isEditing && (
                        <button
                          onClick={() => handleDelete(batch.id, num)}
                          className="text-xs px-2 py-1 rounded-lg font-semibold"
                          style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}
                        >
                          del
                        </button>
                      )}
                    </div>
                  </div>

                  {/* inline edit form */}
                  {isEditing && (
                    <div
                      className="px-4 pb-4 space-y-3 border-t"
                      style={{ borderColor: "#1a1a1a" }}
                    >
                      <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* name */}
                        <div>
                          <label className="text-xs font-semibold mb-1 block" style={{ color: "#666" }}>
                            session name
                          </label>
                          <input
                            value={form.name}
                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            placeholder="e.g. discover"
                            className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
                            style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
                          />
                        </div>

                        {/* date */}
                        <div>
                          <label className="text-xs font-semibold mb-1 block" style={{ color: "#666" }}>
                            date (IST)
                          </label>
                          <input
                            type="date"
                            value={form.date}
                            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                            className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
                            style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", colorScheme: "dark" }}
                          />
                        </div>

                        {/* time */}
                        <div>
                          <label className="text-xs font-semibold mb-1 block" style={{ color: "#666" }}>
                            time IST (default 9:30 PM = 21:30)
                          </label>
                          <input
                            type="time"
                            value={form.time}
                            onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                            className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
                            style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", colorScheme: "dark" }}
                          />
                        </div>

                        {/* google meet link */}
                        <div className="md:col-span-2">
                          <label className="text-xs font-semibold mb-1 block" style={{ color: "#666" }}>
                            google meet link
                          </label>
                          <input
                            type="url"
                            value={form.meet_link}
                            onChange={(e) => setForm((f) => ({ ...f, meet_link: e.target.value }))}
                            placeholder="https://meet.google.com/xxx-xxxx-xxx"
                            className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
                            style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
                          />
                          <p className="text-[10px] mt-1" style={{ color: "#444" }}>
                            activates for users 30 min before the session
                          </p>
                        </div>

                        {/* recording URL */}
                        <div className="md:col-span-2">
                          <label className="text-xs font-semibold mb-1 block" style={{ color: "#666" }}>
                            recording URL (Bunny.net / Vimeo / YouTube embed)
                          </label>
                          <input
                            type="url"
                            value={form.recording_path}
                            onChange={(e) => setForm((f) => ({ ...f, recording_path: e.target.value }))}
                            placeholder="https://iframe.mediadelivery.net/embed/…"
                            className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
                            style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
                          />
                          <p className="text-[10px] mt-1" style={{ color: "#444" }}>
                            paste the embed URL — appears in "past sessions" for enrolled users
                          </p>
                        </div>
                      </div>

                      {/* description */}
                      <div>
                        <label className="text-xs font-semibold mb-1 block" style={{ color: "#666" }}>
                          description
                        </label>
                        <textarea
                          value={form.description}
                          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                          placeholder="what happens in this session?"
                          rows={3}
                          className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none resize-none"
                          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", fontFamily: "inherit" }}
                        />
                      </div>

                      {/* summary */}
                      <div>
                        <label className="text-xs font-semibold mb-1 block" style={{ color: "#666" }}>
                          session summary
                        </label>
                        <textarea
                          value={form.summary}
                          onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                          placeholder="brief summary of what was covered"
                          rows={3}
                          className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none resize-none"
                          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", fontFamily: "inherit" }}
                        />
                      </div>

                      {/* next steps */}
                      <div>
                        <label className="text-xs font-semibold mb-1 block" style={{ color: "#666" }}>
                          suggested next steps
                        </label>
                        <textarea
                          value={form.next_steps}
                          onChange={(e) => setForm((f) => ({ ...f, next_steps: e.target.value }))}
                          placeholder="action items for participants"
                          rows={3}
                          className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none resize-none"
                          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", fontFamily: "inherit" }}
                        />
                      </div>

                      {/* transcript */}
                      <div>
                        <label className="text-xs font-semibold mb-1 block" style={{ color: "#666" }}>
                          transcript
                        </label>
                        <textarea
                          value={form.transcript}
                          onChange={(e) => setForm((f) => ({ ...f, transcript: e.target.value }))}
                          placeholder="full session transcript (optional)"
                          rows={5}
                          className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none resize-none"
                          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", fontFamily: "inherit" }}
                        />
                      </div>

                      {saveError && (
                        <p className="text-xs" style={{ color: "#ef4444" }}>{saveError}</p>
                      )}

                      <button
                        onClick={() => handleSave(batch.id, num)}
                        disabled={saving}
                        className="px-5 py-2 rounded-lg text-sm font-black transition-opacity"
                        style={{
                          background: saving ? "#333" : Y,
                          color: saving ? "#666" : "#000",
                          opacity: saving ? 0.7 : 1
                        }}
                      >
                        {saving ? "saving…" : "save session"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
