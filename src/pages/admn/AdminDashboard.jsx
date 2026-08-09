import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../../supabaseClient";
import AIReportModal from "./AIReportModal";
import EvolveReviewsPanel from "./EvolveReviewsPanel";
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
import { anant_logo } from "../../assets/images/Community";
import { useAnantTheme } from "../../context/AnantThemeContext";

/* ─── brand ──────────────────────────────────────────────────────────────── */
const Y = "#FFD007";
const P = "#DF0586";
const GR = "#22c55e";
const PLAN_COLORS = { starter: Y, accelerator: P };
const ANANT_BLUE = "#2563eb";

const ANU_PROGRAMS = ["BDes", "BArch"];
const ANU_STREAMS = {
  BDes: [
    "Communication Design",
    "Moving Image",
    "Space Design",
    "Product Design",
    "Interaction Design",
    "Sustainable Fashion and Textile Design"
  ],
  BArch: ["Architecture"]
};
const ANU_YEARS = { BDes: ["3", "4"], BArch: ["3", "4", "5"] };
const ANU_YEARS_ALL = ["3", "4", "5"];
const ANU_ORIGIN_URL = "https://anu.evolvedesign.academy";

// Parses the `stream` DB column which may be a JSON array string OR a legacy plain string
function parseStreams(val) {
  if (!val) return [];
  try {
    const p = JSON.parse(val);
    return Array.isArray(p) ? p : [String(p)];
  } catch {
    return [val];
  }
}
// const ANU_ORIGIN_URL = "http://localhost:8080";

async function sendANUPersonInvite(email, role) {
  await fetch("/api/send-person-invite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, role })
  });
}

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
const ANU_LOGO = `${ANU_ORIGIN_URL}/images/anant-logo.png`;

async function sendReportNotifications(review, reportUrl) {

  // 1. Fetch student record to get their stream, program, year
  const { data: student } = await supabaseAdmin
    .from("anu_students")
    .select("stream, first_name, last_name, program, year")
    .eq("anu_email", review.email)
    .maybeSingle();

  const stream = student?.stream || null;
  const studentName = review.name ||
    [student?.first_name, student?.last_name].filter(Boolean).join(" ") || review.email;
  const program = student?.program || "—";
  const year = student?.year ? `Year ${student.year}` : "—";

  // 2. Fetch all invited faculty + all uni admins
  const [{ data: allFaculty }, { data: admins }] = await Promise.all([
    supabaseAdmin.from("anu_faculty").select("anu_email, first_name, last_name, stream")
      .not("invite_sent_at", "is", null),
    supabaseAdmin.from("anu_admins").select("anu_email, first_name, last_name")
      .not("invite_sent_at", "is", null)
  ]);

  // Filter faculty whose streams include the student's stream (supports multi-stream JSON array)
  const faculty = stream
    ? (allFaculty || []).filter(f => parseStreams(f.stream).includes(stream))
    : [];

  const recipients = [...(faculty || []), ...(admins || [])];
  if (!recipients.length) return;

  // 3. Send email to each recipient
  await Promise.all(recipients.map((r) => {
    const rName = [r.first_name, r.last_name].filter(Boolean).join(" ") || "there";
    const htmlContent = `
      <div style="font-family:sans-serif;max-width:540px;margin:0 auto;padding:40px 32px;background:#060c17;color:#fff;border-radius:16px">
        <img src="${ANU_LOGO}" alt="Anant National University" style="height:40px;margin:0 auto 28px 0;display:block" />
        <p style="color:rgba(255,255,255,0.45);font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 8px">Anant National University × evolve</p>
        <h1 style="font-size:22px;font-weight:800;letter-spacing:-0.02em;line-height:1.3;margin:0 0 20px">Portfolio review report ready</h1>
        <p style="font-size:15px;line-height:1.7;color:rgba(255,255,255,0.7);margin:0 0 24px">
          Hi ${rName}, the portfolio review report for <strong style="color:#fff">${studentName}</strong> is now ready.
        </p>
        <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:20px 24px;margin:0 0 28px">
          <table style="width:100%;border-collapse:collapse">
            <tr>
              <td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;width:90px">Name</td>
              <td style="padding:6px 0;color:#fff;font-size:14px;font-weight:600">${studentName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em">Email</td>
              <td style="padding:6px 0;color:rgba(255,255,255,0.75);font-size:14px">${review.email}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em">Program</td>
              <td style="padding:6px 0;color:rgba(255,255,255,0.75);font-size:14px">${program}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em">Stream</td>
              <td style="padding:6px 0;color:rgba(255,255,255,0.75);font-size:14px">${stream || "—"}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em">Year</td>
              <td style="padding:6px 0;color:rgba(255,255,255,0.75);font-size:14px">${year}</td>
            </tr>
          </table>
        </div>
        <a href="${reportUrl}" style="display:inline-block;background:#2563eb;color:#fff;font-weight:700;font-size:14px;padding:13px 26px;border-radius:10px;text-decoration:none">
          View report →
        </a>
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:32px 0 18px" />
        <p style="font-size:12px;color:rgba(255,255,255,0.25);margin:0">
          This notification was sent to you as part of the Anant National University × evolve portfolio review programme.
        </p>
      </div>`;
    return fetch("/api/send-brevo-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: { name: "Anant National University × evolve", email: "noreply@evolvedesign.academy" },
        to: [{ email: r.anu_email, name: rName }],
        subject: `Report ready — ${studentName} | ANU × evolve`,
        htmlContent
      })
    });
  }));
}

function ReviewUploadCell({ review, onDone }) {
  const [state, setState] = useState("idle"); // idle | preview | ready | uploading | sending | done | error
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
      .update({
        review_report_url: reportUrl,
        review_status: "done",
        remarks: remarks.trim()
      })
      .eq("id", review.id);

    if (dbErr) {
      setState("error");
      setMsg(dbErr.message);
      return;
    }

    // 3. Send report-ready email
    setState("sending");
    const isAnuReview = review.tenant_id === "anant";

    if (isAnuReview) {
      // Anant reviews: send directly via Brevo (same pattern as all other Anant emails)
      const htmlContent = `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:40px 32px;background:#060c17;color:#fff;border-radius:16px">
          <img src="https://anu.evolvedesign.academy/images/anant-logo.png" alt="Anant National University" style="height:40px;margin:0 auto 32px 0;display:block" />
          <p style="color:rgba(255,255,255,0.5);font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 10px">Anant National University x evolve</p>
          <h1 style="font-size:24px;font-weight:800;letter-spacing:-0.02em;line-height:1.25;margin:0 0 16px">Your portfolio review report is ready</h1>
          <p style="font-size:15px;line-height:1.7;color:rgba(255,255,255,0.72);margin:0 0 32px">Great news, your personalised portfolio review report is ready to view.</p>
          <a href="${ANU_ORIGIN_URL}/portfolio-review/form" style="display:inline-block;background:#2563eb;color:#fff;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;text-decoration:none">View your report →</a>
          <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:36px 0 20px" />
          <p style="font-size:12px;color:rgba(255,255,255,0.28);margin:0">We'd love to hear what you thought of the experience. There's a quick feedback form on the report page.</p>
        </div>`;
      const brevoRes = await fetch("/api/send-brevo-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: {
            name: "Anant National University x evolve",
            email: "noreply@evolvedesign.academy"
          },
          to: [{ email: review.email, name: review.name || "" }],
          subject: "Your portfolio review report is ready",
          htmlContent
        })
      });
      if (!brevoRes.ok) {
        const err = await brevoRes.json().catch(() => ({}));
        setState("error");
        setMsg(err.message || `email failed (${brevoRes.status})`);
        return;
      }

      // Send report-ready notification to matching faculty + all uni admins (fire-and-forget)
      sendReportNotifications(review, reportUrl).catch(() => {});
    } else {
      // Non-Anant reviews: use edge function with Brevo template + PDF attachment
      const fnUrl = `${SUPABASE_URL}/functions/v1/send-review-email`;
      const res = await fetch(fnUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_ANON_KEY
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
    return createPortal(
      <>
        {/* iframe fills the whole screen — pointer-events none so it never swallows clicks */}
        <div className="fixed inset-0" style={{ zIndex: 9990 }}>
          <iframe
            src={previewUrl}
            title="preview report"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              display: "block"
            }}
          />
        </div>

        {/* Action bar pinned to the bottom — completely separate DOM element so the PDF viewer can never block it */}
        <div
          className="fixed bottom-0 left-0 right-0 flex items-center justify-between px-6 py-4"
          style={{
            zIndex: 9999,
            background: "#0a0a0a",
            borderTop: "1px solid rgba(255,255,255,0.15)"
          }}
        >
          <div>
            <p className="text-white font-bold text-sm">
              {review.name} — {pendingFile?.name}
            </p>
            {remarks.trim() && (
              <p className="text-xs mt-1" style={{ color: "#aaa" }}>
                remarks: {remarks.trim()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={cancelPreview}
              className="text-xs px-5 py-2.5 rounded-lg font-semibold"
              style={{
                background: "#222",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#fff",
                cursor: "pointer"
              }}
            >
              ✕ cancel
            </button>
            <button
              onClick={() => { if (previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(null); setState("ready"); }}
              className="text-xs px-5 py-2.5 rounded-lg font-bold"
              style={{ background: GR, color: "#000", cursor: "pointer" }}
            >
              ✓ looks good
            </button>
          </div>
        </div>
      </>,
      document.body
    );
  }

  // Ready state: file chosen & confirmed, waiting for explicit "send" or "delete"
  if (state === "ready" && pendingFile) {
    return (
      <div className="flex flex-col gap-1.5" style={{ minWidth: 180 }}>
        <p className="text-xs truncate max-w-[160px]" style={{ color: "#aaa" }}>
          {pendingFile.name}
        </p>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handle(pendingFile)}
            className="text-xs px-3 py-1.5 rounded-lg font-bold whitespace-nowrap"
            style={{ background: GR, color: "#000" }}
          >
            send report →
          </button>
          <button
            onClick={cancelPreview}
            className="text-xs px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap"
            style={{ background: "#222", border: "1px solid #444", color: "#f87171" }}
          >
            delete
          </button>
        </div>
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
        style={{
          background: "#1a1a1a",
          border: "1px solid #333",
          color: "#ccc",
          width: "100%"
        }}
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
    const path = `mentorship/${version.user_id}/${version.id}.pdf`;
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
    const { error: dbErr } = await supabaseAdmin
      .from("mentorship_portfolio_versions")
      .update({ review_report_url: reportUrl, review_remarks: remarks.trim() })
      .eq("id", version.id);
    if (dbErr) {
      setState("error");
      setMsg(dbErr.message);
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setState("done");
    setMsg("saved ✓");
    onDone(version.id, reportUrl, remarks.trim());
  };

  if (state === "done")
    return (
      <span className="text-xs font-bold" style={{ color: "#22c55e" }}>
        saved ✓
      </span>
    );

  if (version.review_report_url) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold" style={{ color: "#22c55e" }}>
          done
        </span>
        <a
          href={version.review_report_url}
          target="_blank"
          rel="noreferrer"
          className="text-xs underline"
          style={{ color: "#888" }}
        >
          view
        </a>
      </div>
    );
  }

  if (state === "preview") {
    return (
      <div className="flex flex-col gap-1.5">
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="remarks (optional)"
          rows={2}
          className="text-xs px-2 py-1 rounded outline-none resize-none"
          style={{
            background: "#1a1a1a",
            border: "1px solid #333",
            color: "#ddd",
            width: 180
          }}
        />
        <a
          href={previewUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs underline"
          style={{ color: Y }}
        >
          preview pdf
        </a>
        <div className="flex gap-2">
          <button
            onClick={() => handle(pendingFile)}
            className="text-xs px-2 py-1 rounded font-semibold"
            style={{ background: Y, color: "#000" }}
          >
            send
          </button>
          <button
            onClick={cancelPreview}
            className="text-xs px-2 py-1 rounded"
            style={{ background: "#222", color: "#888" }}
          >
            cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <textarea
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
        placeholder="remarks (optional)"
        rows={2}
        className="text-xs px-2 py-1 rounded outline-none resize-none"
        style={{
          background: "#1a1a1a",
          border: "1px solid #333",
          color: "#ddd",
          width: 180
        }}
      />
      {state === "error" && (
        <span className="text-xs" style={{ color: "#f87171" }}>
          {msg}
        </span>
      )}
      <label
        className="cursor-pointer text-xs px-3 py-1.5 rounded-lg font-semibold inline-block"
        style={{ background: "#111", border: "1px solid #333", color: Y }}
      >
        {state === "uploading" ? "uploading…" : "↑ upload pdf"}
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => onFileChosen(e.target.files?.[0])}
        />
      </label>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const navigate = useNavigate();

  // Determine which tenant this admin session belongs to
  const adminTenant = sessionStorage.getItem("admin_tenant") ?? "evolve";
  const isAnantAdmin = adminTenant === "anant";
  const anuRole = sessionStorage.getItem("anu_role"); // "faculty" | "uni_admin" | null
  const anuStream = sessionStorage.getItem("anu_stream") || "";
  const isFaculty = anuRole === "faculty";
  const isEvolveAdmin = !isAnantAdmin || anuRole === null; // PIN-based super admin

  const { dark, toggleDark } = useAnantTheme();

  const [payments, setPayments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [portfolioReviews, setPortfolioReviews] = useState([]);
  const [aiReportReview, setAiReportReview] = useState(null); // review row currently open in AIReportModal
  const [regeneratingIds, setRegeneratingIds] = useState(new Set());
  const [anuStudents, setAnuStudents] = useState([]);
  const [anuFacultyData, setAnuFacultyData] = useState(null);
  const [anuAdminsData, setAnuAdminsData] = useState(null);
  const [mentorshipPortfolios, setMentorshipPortfolios] = useState([]);
  const [mentorshipProfilesData, setMentorshipProfilesData] = useState([]);
  const [mentorshipResumes, setMentorshipResumes] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [streamEmails, setStreamEmails] = useState(null); // null = not yet fetched, Set when loaded
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Anant admins land on students tab
  const [activeTab, setActiveTab] = useState(
    isAnantAdmin ? "students" : "overview"
  );
  const [search, setSearch] = useState("");
  const [payFilter, setPayFilter] = useState("all");
  const [studentFilter, setStudentFilter] = useState("all");

  const [adminDisplayName, setAdminDisplayName] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [filterProgram, setFilterProgram] = useState("all");
  const [filterStream, setFilterStream] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [addModal, setAddModal] = useState(null); // "student"|"faculty"|"admin"|null — now drives INLINE form, not a modal overlay
  const [addForm, setAddForm] = useState({});
  const [addLoading, setAddLoading] = useState(false);
  const [addMsg, setAddMsg] = useState("");
  const [editEntry, setEditEntry] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [panelRemarks, setPanelRemarks] = useState("");
  const [panelRemarksSaving, setPanelRemarksSaving] = useState(false);
  const [meetRecInput, setMeetRecInput] = useState("");
  const [showMeetRecInput, setShowMeetRecInput] = useState(false);

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

  /* close profile dropdown on outside click */
  useEffect(() => {
    if (!showProfileMenu) return;
    function handleClick(e) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target)
      ) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showProfileMenu]);

  useEffect(() => {
    if (selectedStudent?.review) {
      setPanelRemarks(selectedStudent.review.remarks || "");
      setMeetRecInput(selectedStudent.review.meet_recording_url || "");
    }
    setShowMeetRecInput(false);
  }, [selectedStudent?.id]);

  const handleLogout = async () => {
    sessionStorage.removeItem("admin_access");
    sessionStorage.removeItem("admin_tenant");
    sessionStorage.removeItem("anu_role");
    sessionStorage.removeItem("anu_stream");
    sessionStorage.removeItem("anu_program");
    if (isAnantAdmin) await supabase.auth.signOut();
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

        (() => {
          // Use supabaseAdmin so RLS doesn't block faculty/uni_admin (user_id is null on ANU rows)
          let q = supabaseAdmin.from("portfolio_reviews").select("*");
          if (isAnantAdmin) q = q.eq("tenant_id", "anant");
          return q.order("created_at", { ascending: false });
        })(),

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

      // Faculty stream filtering: load emails for faculty's assigned streams (multi-stream support)
      if (isFaculty && anuStream) {
        const facultyStreams = parseStreams(anuStream);
        const { data: sData } = await supabaseAdmin
          .from("anu_students")
          .select("anu_email")
          .in("stream", facultyStreams.length ? facultyStreams : ["__none__"]);
        setStreamEmails(
          new Set((sData || []).map((s) => s.anu_email.toLowerCase()))
        );
      }

      // Load all students for the merged students tab (all Anant admins, including faculty)
      if (isAnantAdmin) {
        const { data: stuData } = await supabaseAdmin
          .from("anu_students")
          .select("*")
          .order("created_at", { ascending: false });
        setAnuStudents(stuData || []);
      }
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

  // Fetch the signed-in admin's display name from DB (faculty or admin table)
  useEffect(() => {
    if (!isAnantAdmin || isEvolveAdmin) {
      setAdminDisplayName(isEvolveAdmin ? "Evolve Admin" : "");
      return;
    }
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user?.email) return;
      const email = session.user.email;
      const [{ data: fac }, { data: adm }] = await Promise.all([
        supabaseAdmin
          .from("anu_faculty")
          .select("first_name, last_name")
          .eq("anu_email", email)
          .maybeSingle(),
        supabaseAdmin
          .from("anu_admins")
          .select("first_name, last_name")
          .eq("anu_email", email)
          .maybeSingle()
      ]);
      const person = fac || adm;
      if (person)
        setAdminDisplayName(
          [person.first_name, person.last_name].filter(Boolean).join(" ")
        );
      else setAdminDisplayName(email);
    });
  }, [isAnantAdmin, isEvolveAdmin]);

  // Lazy-load faculty / college-admin data when those tabs are opened
  useEffect(() => {
    if (!isAnantAdmin) return;
    if (activeTab === "faculty" && anuFacultyData === null) {
      supabaseAdmin
        .from("anu_faculty")
        .select("*")
        .order("created_at", { ascending: false })
        .then(({ data }) => setAnuFacultyData(data || []));
    }
    if (activeTab === "college admin" && anuAdminsData === null) {
      supabaseAdmin
        .from("anu_admins")
        .select("*")
        .order("created_at", { ascending: false })
        .then(({ data }) => setAnuAdminsData(data || []));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Auto-refresh portfolio reviews every 15 seconds
  useEffect(() => {
    const iv = setInterval(async () => {
      let q = supabaseAdmin.from("portfolio_reviews").select("*");
      if (isAnantAdmin) q = q.eq("tenant_id", "anant");
      const { data } = await q.order("created_at", { ascending: false });
      if (data) setPortfolioReviews(data);
    }, 15000);
    return () => clearInterval(iv);
  }, [isAnantAdmin]);

  /* ── optimistic update after report upload ──────────────────────────── */
  const handleReportDone = (reviewId, reportUrl, remarks) => {
    setPortfolioReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              review_report_url: reportUrl,
              review_status: "done",
              remarks
            }
          : r
      )
    );
  };

  const handleAiRegenerate = async (review) => {
    setRegeneratingIds((prev) => new Set([...prev, review.id]));
    setPortfolioReviews((prev) =>
      prev.map((r) => r.id === review.id ? { ...r, ai_report_status: "generating" } : r)
    );
    try {
      await fetch(`${SUPABASE_URL}/functions/v1/generate-ai-review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          "apikey": SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ review_id: review.id })
      });
    } catch {
      // silent — status will be updated by the edge function
    } finally {
      setRegeneratingIds((prev) => { const s = new Set(prev); s.delete(review.id); return s; });
    }
  };

  const handleMentorshipReportDone = (versionId, reportUrl, remarks) => {
    setMentorshipPortfolios((prev) =>
      prev.map((v) =>
        v.id === versionId
          ? { ...v, review_report_url: reportUrl, review_remarks: remarks }
          : v
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
    let list = portfolioReviews;
    // Faculty: only see their stream's students
    if (isFaculty && streamEmails) {
      list = list.filter((r) =>
        streamEmails.has((r.email || "").toLowerCase())
      );
    }
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (r) =>
        (r.name || "").toLowerCase().includes(q) ||
        (r.email || "").toLowerCase().includes(q)
    );
  }, [portfolioReviews, search, isFaculty, streamEmails]);

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

  /* ── ANU add/edit/delete/invite helpers ────────────────────────────── */
  async function handleAddSubmit() {
    if (!addModal || !addForm.anu_email) return;
    setAddLoading(true);
    setAddMsg("");
    const table =
      addModal === "student"
        ? "anu_students"
        : addModal === "faculty"
          ? "anu_faculty"
          : "anu_admins";
    // Serialize stream array to JSON string for faculty
    const formData = { ...addForm };
    if (addModal === "faculty" && Array.isArray(formData.stream)) {
      formData.stream = formData.stream.length ? JSON.stringify(formData.stream) : null;
    }
    const { error } = await supabaseAdmin.from(table).insert(formData);
    if (error) {
      setAddMsg(error.message);
      setAddLoading(false);
      return;
    }
    await fetchAll(true);
    setAddModal(null);
    setAddForm({});
    setAddLoading(false);
  }

  async function handleEditSave() {
    if (!editEntry) return;
    const { type, id, ...fields } = editEntry;
    const table =
      type === "student"
        ? "anu_students"
        : type === "faculty"
          ? "anu_faculty"
          : "anu_admins";
    // Serialize stream array to JSON string for faculty
    if (type === "faculty" && Array.isArray(fields.stream)) {
      fields.stream = fields.stream.length ? JSON.stringify(fields.stream) : null;
    }
    await supabaseAdmin.from(table).update(fields).eq("id", id);
    if (type === "student")
      setAnuStudents((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...fields } : s))
      );
    else if (type === "faculty")
      setAnuFacultyData((prev) =>
        prev ? prev.map((f) => (f.id === id ? { ...f, ...fields } : f)) : prev
      );
    else
      setAnuAdminsData((prev) =>
        prev ? prev.map((a) => (a.id === id ? { ...a, ...fields } : a)) : prev
      );
    setEditEntry(null);
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    const { type, entry } = deleteConfirm;
    const table =
      type === "student"
        ? "anu_students"
        : type === "faculty"
          ? "anu_faculty"
          : "anu_admins";
    await supabaseAdmin.from(table).delete().eq("id", entry.id);
    if (type === "student") {
      setAnuStudents((prev) => prev.filter((s) => s.id !== entry.id));
      if (selectedStudent?.id === entry.id) setSelectedStudent(null);
    } else if (type === "faculty")
      setAnuFacultyData((prev) =>
        prev ? prev.filter((f) => f.id !== entry.id) : prev
      );
    else
      setAnuAdminsData((prev) =>
        prev ? prev.filter((a) => a.id !== entry.id) : prev
      );
    setDeleteConfirm(null);
  }

  async function savePanelRemarks() {
    if (!selectedStudent?.review) return;
    setPanelRemarksSaving(true);
    await supabaseAdmin
      .from("portfolio_reviews")
      .update({ remarks: panelRemarks })
      .eq("id", selectedStudent.review.id);
    setPortfolioReviews((prev) =>
      prev.map((r) =>
        r.id === selectedStudent.review.id ? { ...r, remarks: panelRemarks } : r
      )
    );
    setPanelRemarksSaving(false);
  }

  async function saveMeetRecording() {
    if (!selectedStudent?.review) return;
    const { error } = await supabaseAdmin
      .from("portfolio_reviews")
      .update({ meet_recording_url: meetRecInput })
      .eq("id", selectedStudent.review.id);
    if (error) {
      console.error("saveMeetRecording:", error.message);
      return;
    }
    setPortfolioReviews((prev) =>
      prev.map((r) =>
        r.id === selectedStudent.review.id
          ? { ...r, meet_recording_url: meetRecInput }
          : r
      )
    );
    setSelectedStudent((prev) =>
      prev
        ? {
            ...prev,
            review: { ...prev.review, meet_recording_url: meetRecInput }
          }
        : null
    );
    setShowMeetRecInput(false);
  }

  async function sendSingleInvite(type, entry) {
    const role =
      type === "student"
        ? "student"
        : type === "faculty"
          ? "faculty"
          : "uni_admin";
    const table =
      type === "student"
        ? "anu_students"
        : type === "faculty"
          ? "anu_faculty"
          : "anu_admins";
    await sendANUPersonInvite(entry.anu_email, role);
    await supabaseAdmin
      .from(table)
      .update({ invite_sent_at: new Date().toISOString() })
      .eq("id", entry.id);
    if (type === "student")
      setAnuStudents((prev) =>
        prev.map((s) =>
          s.id === entry.id
            ? { ...s, invite_sent_at: new Date().toISOString() }
            : s
        )
      );
    else if (type === "faculty")
      setAnuFacultyData((prev) =>
        prev
          ? prev.map((f) =>
              f.id === entry.id
                ? { ...f, invite_sent_at: new Date().toISOString() }
                : f
            )
          : prev
      );
    else
      setAnuAdminsData((prev) =>
        prev
          ? prev.map((a) =>
              a.id === entry.id
                ? { ...a, invite_sent_at: new Date().toISOString() }
                : a
            )
          : prev
      );
  }

  function handleEntityCSVUpload(e, entityType) {
    const file = e.target.files?.[0];
    if (!file) return;
    const table =
      entityType === "faculty"
        ? "anu_faculty"
        : entityType === "admin"
          ? "anu_admins"
          : "anu_students";
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const raw = ev.target.result;
      const lines = raw.trim().split(/\r?\n/).filter(Boolean);
      if (!lines.length) return;
      const headers = lines[0]
        .split(",")
        .map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
      const rows = lines.slice(1).map((line) => {
        const vals = line.split(",").map((v) => v.trim());
        const row = {};
        headers.forEach((h, i) => {
          row[h] = vals[i] ?? "";
        });
        return row;
      });
      await supabaseAdmin.from(table).upsert(rows, { onConflict: "anu_email" });
      await fetchAll(true);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  /* ─────────────────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────────────────── */
  const loadBg = isAnantAdmin ? (dark ? "#060c17" : "#f8fafc") : "#0a0a0a";
  const loadText = isAnantAdmin
    ? dark
      ? "rgba(255,255,255,0.5)"
      : "#64748b"
    : "#555";

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: loadBg }}
      >
        <div className="text-center">
          {isAnantAdmin ? (
            <img
              src={anant_logo}
              alt=""
              className="w-14 h-14 object-contain mx-auto mb-4 opacity-70"
            />
          ) : (
            <div
              className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
              style={{ borderColor: Y, borderTopColor: "transparent" }}
            />
          )}
          <p style={{ color: loadText }}>
            {isAnantAdmin ? "loading…" : "loading mentorship data…"}
          </p>
        </div>
      </div>
    );
  }

  const ALL_TABS = [
    { id: "overview", label: "overview" },
    { id: "tables", label: "all tables" },
    { id: "payments", label: `payments (${payments.length})` },
    { id: "batches", label: `batches (${batches.length})` },
    { id: "waitlist", label: `waitlist (${stats.waitlistCount})` },
    { id: "profiles", label: `profiles (${profiles.length})` },
    { id: "reviews", label: `reviews (${portfolioReviews.length})` },
    { id: "evolve-reviews", label: "evolve portfolio reviews" },
    {
      id: "m-portfolios",
      label: `m-portfolios (${mentorshipPortfolios.length})`
    },
    {
      id: "m-profiles",
      label: `m-profiles (${mentorshipProfilesData.length})`
    },
    { id: "sessions", label: "sessions" },
    { id: "accelerator", label: "accelerator 1:1" }
  ];

  // Anant tabs: faculty → students; uni_admin / evolve admin → students + faculty + college admin
  const ANANT_TABS = isFaculty
    ? [{ id: "students", label: "students" }]
    : [
        { id: "students", label: "students" },
        { id: "faculty", label: "faculty" },
        { id: "college admin", label: "college admin" }
      ];
  const TABS = isAnantAdmin ? ANANT_TABS : ALL_TABS;

  /* ── anant admin theme helpers ── */
  const aBg = dark ? "#060c17" : "#f8fafc";
  const aColor = dark ? "#ffffff" : "#0f172a";
  const aHdrBg = "#060c17"; // always dark — matches all Anant pages
  const aHdrBord = "#0d1f3c"; // always dark border
  const aSub = dark ? "rgba(255,255,255,0.45)" : "#64748b";
  const aDiv = dark ? "rgba(255,255,255,0.15)" : "#cbd5e1";
  const aBtnBord = dark ? "#1e3a8a" : "#1e3a8a";
  const aBtnClr = dark ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.6)";
  const aTabBord = dark ? "#0d1f3c" : "#e2e8f0";
  /* ── anant reviews table theme ── */
  const aTblBorder = dark ? "#0d1f3c" : "#dbeafe";
  const aTblHdrBg = dark ? "#071022" : "#eff6ff";
  const aTblHdrTxt = dark ? "#475569" : "#64748b";
  const aTblRowEven = dark ? "#060c17" : "#ffffff";
  const aTblRowOdd = dark ? "#04080f" : "#f8fafc";
  const aTblRowBrd = dark ? "#0d1f3c" : "#dbeafe";
  const aTblText = dark ? "#ffffff" : "#0f172a";
  const aTblMuted = dark ? "#94a3b8" : "#475569";
  const aTblDim = dark ? "#475569" : "#94a3b8";
  const aInpBg = dark ? "#071022" : "#f1f5f9";
  const aInpBord = dark ? "#1e3a5f" : "#bfdbfe";
  const aInpText = dark ? "#ffffff" : "#0f172a";
  const aCsvBg = dark ? "#111827" : "#0f172a";
  const aCsvText = Y;
  /* ── management button style (light = blue, dark = subtle) ── */
  const aMgmtBg = dark ? aInpBg : "rgba(37,99,235,0.07)";
  const aMgmtBord = dark ? aTblBorder : "rgba(37,99,235,0.25)";
  const aMgmtClr = dark ? aTblMuted : "#2563eb";
  /* ── table row hover ── */
  const aRowHover = dark ? "rgba(255,255,255,0.03)" : "#eff6ff";

  return (
    <div
      className="min-h-screen"
      style={{
        background: isAnantAdmin ? aBg : "#0a0a0a",
        color: isAnantAdmin ? aColor : "#fff",
        fontFamily: "system-ui, sans-serif"
      }}
    >
      {/* ── header — always dark for anant, 64px ── */}
      <div
        className="sticky top-0 z-30 border-b px-6 flex items-center justify-between"
        style={{
          height: "64px",
          background: isAnantAdmin ? aHdrBg : "#0a0a0a",
          borderColor: isAnantAdmin ? aHdrBord : "#1a1a1a"
        }}
      >
        <div className="flex items-center gap-3">
          {isAnantAdmin ? (
            <>
              <img
                src={anant_logo}
                alt="Anant"
                className="h-10 w-auto object-contain"
              />
              <span style={{ color: "rgba(255,255,255,0.2)" }}>/</span>
              <span
                className="text-sm font-semibold"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                {anuRole === "faculty" ? "portfolio reviews" : "admin"}
              </span>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                style={{ background: "rgba(37,99,235,0.25)", color: "#93c5fd" }}
              >
                {anuRole === "faculty"
                  ? "faculty"
                  : anuRole === "uni_admin"
                    ? "uni admin"
                    : "evolve admin"}
              </span>
            </>
          ) : (
            <>
              <span className="text-xl font-black" style={{ color: Y }}>
                evolve
              </span>
              <span style={{ color: "#333" }}>/</span>
              <span className="text-sm font-semibold" style={{ color: "#888" }}>
                mentorship analytics
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {error && <span className="text-xs text-red-400">{error}</span>}
          {/* theme toggle — anant only */}
          {isAnantAdmin && (
            <button
              onClick={toggleDark}
              className="w-7 h-7 rounded-full flex items-center justify-center border transition-colors"
              style={{ borderColor: "#1e3a5f", backgroundColor: "#0a1628" }}
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="4"
                    stroke="#93c5fd"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                    stroke="#93c5fd"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"
                    stroke="#93c5fd"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          )}
          <button
            onClick={() => fetchAll(true)}
            disabled={refreshing}
            className="text-xs px-3 py-1.5 rounded-lg border font-semibold transition-opacity disabled:opacity-40"
            style={{
              borderColor: isAnantAdmin ? aBtnBord : "#333",
              color: isAnantAdmin ? aBtnClr : "#888"
            }}
          >
            {refreshing ? "refreshing…" : "↻ refresh"}
          </button>

          {isAnantAdmin ? (
            <>
              {/* Home icon → admin landing page */}
              <button
                onClick={() => navigate("/admin")}
                className="w-8 h-8 rounded-lg flex items-center justify-center border"
                style={{
                  borderColor: "#1e3a5f",
                  color: "rgba(255,255,255,0.4)"
                }}
                aria-label="Admin landing page"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 12L12 3L21 12"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5 10V20H9.5V15H14.5V20H19V10"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {/* Profile card with dropdown */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu((v) => !v)}
                  className="flex items-center gap-2 px-2 py-1 rounded-lg border"
                  style={{ borderColor: "#1e3a5f" }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{
                      background: "rgba(37,99,235,0.3)",
                      color: "#93c5fd"
                    }}
                  >
                    {(
                      adminDisplayName?.[0] ||
                      (anuRole === "faculty" ? "F" : "A")
                    ).toUpperCase()}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-semibold text-white leading-tight">
                      {adminDisplayName || "loading…"}
                    </div>
                    <div
                      className="text-[10px] leading-tight"
                      style={{ color: "rgba(255,255,255,0.35)" }}
                    >
                      {anuRole === "faculty"
                        ? "faculty"
                        : anuRole === "uni_admin"
                          ? "uni admin"
                          : "evolve admin"}
                    </div>
                  </div>
                </button>
                {showProfileMenu && (
                  <div
                    className="absolute right-0 top-full mt-2 rounded-xl border overflow-hidden z-50"
                    style={{
                      background: "#0d1b2e",
                      borderColor: "#1e3a5f",
                      minWidth: 160
                    }}
                  >
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate("/admin");
                      }}
                      className="w-full text-left text-xs px-4 py-3 font-medium transition-colors hover:bg-white/5"
                      style={{ color: "rgba(255,255,255,0.65)" }}
                    >
                      admin home
                    </button>
                    <div style={{ height: 1, background: "#1e3a5f" }} />
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        handleLogout();
                      }}
                      className="w-full text-left text-xs px-4 py-3 font-medium transition-colors hover:bg-white/5"
                      style={{ color: "rgba(255,255,255,0.45)" }}
                    >
                      sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold"
              style={{ background: "#1a1a1a", color: "#888" }}
            >
              logout
            </button>
          )}
        </div>
      </div>

      {/* ── tabs ── */}
      <div
        className="px-6 pt-4 flex gap-1 flex-wrap border-b"
        style={{ borderColor: isAnantAdmin ? aTabBord : "#1a1a1a" }}
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
              background:
                activeTab === t.id
                  ? isAnantAdmin
                    ? dark
                      ? "rgba(37,99,235,0.15)"
                      : "#f0f4ff"
                    : "#111"
                  : "transparent",
              color:
                activeTab === t.id
                  ? isAnantAdmin
                    ? dark
                      ? "#60a5fa"
                      : ANANT_BLUE
                    : Y
                  : isAnantAdmin
                    ? dark
                      ? "rgba(255,255,255,0.35)"
                      : "#94a3b8"
                    : "#555",
              borderBottom:
                activeTab === t.id
                  ? `2px solid ${isAnantAdmin ? (dark ? "#60a5fa" : ANANT_BLUE) : Y}`
                  : "2px solid transparent"
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

        {/* ══════════════════════════════════════════════════════════════
            EVOLVE PORTFOLIO REVIEWS TAB — separate table/bucket from the
            legacy `portfolio_reviews` tab above (Anant + old form). Fully
            self-contained: EvolveReviewsPanel owns its own fetch/poll and
            list/detail state.
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "evolve-reviews" && !isAnantAdmin && <EvolveReviewsPanel />}

        {/* ══════════════════════════════════════════════════════════════
            REVIEWS TAB (evolve non-Anant admin only)
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "reviews" &&
          !isAnantAdmin &&
          (() => {
            const parseNotes = (notes) => {
              const parts = (notes || "").split("\n\n---q4---\n");
              return { q1: parts[0] || "", q4: parts[1] || "" };
            };
            const reviewHeaders = [
              "name",
              "email",
              "portfolio",
              "tenant",
              "target roles",
              "proud project",
              "notes",
              "submitted",
              "ai report",
              "remarks",
              "report"
            ];
            return (
              <div className="space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
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
                    onClick={() => {
                      const rows = filteredReviews.map((r) => ({
                        name: r.name || "",
                        email: r.email || "",
                        portfolio_link: r.portfolio_link || "",
                        portfolio_file: r.portfolio_file_url || "",
                        target_roles: r.target_roles || "",
                        proud_project: r.proud_project || "",
                        notes: r.notes || "",
                        submitted: fmtDate(r.created_at),
                        remarks: r.remarks || ""
                      }));
                      downloadCSV("portfolio_reviews.csv", rows);
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                    style={{
                      background: "#111",
                      border: "1px solid #333",
                      color: aCsvText
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
                        {reviewHeaders.map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left font-semibold"
                            style={{ color: "#555", whiteSpace: "nowrap" }}
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
                            colSpan={reviewHeaders.length}
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
                          <td className="px-4 py-3 font-semibold text-white">
                            {r.name || "—"}
                          </td>
                          <td
                            className="px-4 py-3 text-xs"
                            style={{ color: "#888" }}
                          >
                            {r.email || "—"}
                          </td>
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
                              <span style={{ color: "#555" }}>—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                              style={{
                                background:
                                  r.tenant_id === "anant"
                                    ? "rgba(163,91,251,0.15)"
                                    : "rgba(255,208,7,0.1)",
                                color:
                                  r.tenant_id === "anant"
                                    ? "#A35BFB"
                                    : "#FFD007"
                              }}
                            >
                              {r.tenant_id || "evolve"}
                            </span>
                          </td>
                          <td
                            className="px-4 py-3 text-xs"
                            style={{
                              color: "#888",
                              maxWidth: 180,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }}
                            title={r.target_roles}
                          >
                            {r.target_roles || "—"}
                          </td>
                          <td
                            className="px-4 py-3 text-xs"
                            style={{
                              color: "#888",
                              maxWidth: 200,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }}
                            title={r.proud_project}
                          >
                            {r.proud_project || "—"}
                          </td>
                          <td
                            className="px-4 py-3 text-xs"
                            style={{
                              color: "#888",
                              maxWidth: 200,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }}
                            title={r.notes}
                          >
                            {r.notes || "—"}
                          </td>
                          <td
                            className="px-4 py-3 text-xs"
                            style={{ color: "#555" }}
                          >
                            {fmtDate(r.created_at)}
                          </td>
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
                          {/* AI REPORT STATUS */}
                          <td className="px-4 py-3">
                            {r.tenant_id !== "anant" && (() => {
                              const st = r.ai_report_status;
                              const isRegen = regeneratingIds.has(r.id);
                              if (st === "ready") {
                                return (
                                  <button
                                    onClick={() => setAiReportReview(r)}
                                    className="text-xs px-3 py-1 rounded-full font-black"
                                    style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.25)" }}
                                  >
                                    view report
                                  </button>
                                );
                              }
                              if (st === "generating" || isRegen) {
                                return (
                                  <span className="text-xs" style={{ color: "#FFD007" }}>
                                    generating…
                                  </span>
                                );
                              }
                              if (st === "failed") {
                                return (
                                  <button
                                    onClick={() => handleAiRegenerate(r)}
                                    className="text-xs px-2 py-1 rounded-full font-semibold"
                                    style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}
                                  >
                                    retry
                                  </button>
                                );
                              }
                              return (
                                <button
                                  onClick={() => handleAiRegenerate(r)}
                                  className="text-xs px-2 py-1 rounded-full font-semibold"
                                  style={{ background: "#1a1a1a", color: "#555", border: "1px solid #2a2a2a" }}
                                >
                                  generate
                                </button>
                              );
                            })()}
                          </td>
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
            );
          })()}

        {/* ══════════════════════════════════════════════════════════════
            STUDENTS TAB (anant — all roles)
            Merged view: all students + their submitted review details
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "students" &&
          isAnantAdmin &&
          (() => {
            const parseNotes = (notes) => {
              const parts = (notes || "").split("\n\n---q4---\n");
              return { q1: parts[0] || "", q4: parts[1] || "" };
            };

            const srch = search.toLowerCase();
            const studentBase =
              isFaculty && streamEmails
                ? anuStudents.filter((s) =>
                    streamEmails.has((s.anu_email || "").toLowerCase())
                  )
                : anuStudents;

            let mergedRows = studentBase
              .map((s) => {
                const review =
                  portfolioReviews.find(
                    (r) =>
                      (r.email || "").toLowerCase() ===
                        (s.anu_email || "").toLowerCase() &&
                      r.review_status !== "draft"
                  ) || null;
                const { q1, q4 } = parseNotes(review?.notes);
                return {
                  ...s,
                  fullName: [s.first_name, s.last_name]
                    .filter(Boolean)
                    .join(" "),
                  review,
                  q1,
                  q4
                };
              })
              .filter((s) => {
                if (
                  srch &&
                  !s.fullName.toLowerCase().includes(srch) &&
                  !(s.anu_email || "").toLowerCase().includes(srch)
                )
                  return false;
                if (filterProgram !== "all" && s.program !== filterProgram)
                  return false;
                if (filterStream !== "all" && s.stream !== filterStream)
                  return false;
                if (filterYear !== "all" && String(s.year) !== filterYear)
                  return false;
                if (studentFilter === "submitted") return !!s.review;
                if (studentFilter === "not submitted") return !s.review;
                return true;
              });

            if (sortField === "name") {
              mergedRows = [...mergedRows].sort((a, b) =>
                sortDir === "asc"
                  ? a.fullName.localeCompare(b.fullName)
                  : b.fullName.localeCompare(a.fullName)
              );
            } else if (sortField === "year") {
              mergedRows = [...mergedRows].sort((a, b) =>
                sortDir === "asc"
                  ? (Number(a.year) || 0) - (Number(b.year) || 0)
                  : (Number(b.year) || 0) - (Number(a.year) || 0)
              );
            }

            function toggleSort(field) {
              if (sortField === field)
                setSortDir((d) => (d === "asc" ? "desc" : "asc"));
              else {
                setSortField(field);
                setSortDir("asc");
              }
            }

            function SortBtn({ field }) {
              const active = sortField === field;
              return (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSort(field);
                  }}
                  className="ml-1.5 text-xs leading-none font-bold"
                  style={{
                    color: active ? "#2563eb" : dark ? "#475569" : "#94a3b8",
                    opacity: active ? 1 : 0.7
                  }}
                >
                  {active && sortDir === "desc" ? "↓" : "↑"}
                </button>
              );
            }

            function statusBadge(s) {
              if (!s.invite_sent_at)
                return {
                  label: "not invited",
                  clr: dark ? "rgba(255,255,255,0.05)" : "#f1f5f9",
                  txt: "#94a3b8"
                };
              if (!s.auth_user_id)
                return {
                  label: "invited",
                  clr: "rgba(251,191,36,0.12)",
                  txt: "#f59e0b"
                };
              const st = s.review?.review_status;
              if (!s.review || st === "draft")
                return {
                  label: "onboarding",
                  clr: "rgba(167,139,250,0.12)",
                  txt: "#a78bfa"
                };
              if (st === "pending")
                return {
                  label: "portfolio submitted",
                  clr: "rgba(96,165,250,0.12)",
                  txt: "#60a5fa"
                };
              if (st === "share")
                return {
                  label: "call booked",
                  clr: "rgba(52,211,153,0.1)",
                  txt: "#34d399"
                };
              // check report URL FIRST so "done" with report_url shows "report ready", not "review in progress"
              if (s.review?.review_report_url || st === "report")
                return {
                  label: "report ready",
                  clr: "rgba(52,211,153,0.15)",
                  txt: "#34d399"
                };
              if (st === "in_review" || st === "done")
                return {
                  label: "review in progress",
                  clr: "rgba(251,146,60,0.12)",
                  txt: "#fb923c"
                };
              return {
                label: st || "—",
                clr: dark ? "rgba(255,255,255,0.05)" : "#f1f5f9",
                txt: "#94a3b8"
              };
            }

            const uninvitedCount = mergedRows.filter(
              (s) => !s.invite_sent_at
            ).length;
            const sel = selectedStudent;

            async function bulkSendInvites() {
              const uninvited = mergedRows.filter((s) => !s.invite_sent_at);
              for (const s of uninvited) await sendSingleInvite("student", s);
            }

            function handleCSVUpload(e) {
              handleEntityCSVUpload(e, "student");
            }

            const QA_QUESTIONS = [
              {
                key: "q1",
                label: "The hardest part about putting your portfolio together?"
              },
              {
                key: "target_roles",
                label: "What kind of work are you hoping to land?"
              },
              {
                key: "proud_project",
                label:
                  "Is there anything specific you'd like us to review closely?"
              },
              {
                key: "q4",
                label: "Anything else you're finding difficult? (optional)"
              }
            ];

            return (
              <div className="flex flex-col gap-4">
                {/* ── Management buttons (evolve + uni admin, not faculty) ── */}
                {!isFaculty && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        setAddModal(addModal === "student" ? null : "student");
                        setAddForm({});
                        setAddMsg("");
                      }}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border flex items-center gap-1.5"
                      style={{
                        borderColor:
                          addModal === "student" ? "#2563eb" : aMgmtBord,
                        color:
                          addModal === "student"
                            ? dark
                              ? "#60a5fa"
                              : "#1d4ed8"
                            : aMgmtClr,
                        background: aMgmtBg
                      }}
                    >
                      {addModal === "student" ? "× cancel" : "+ add one"}
                    </button>
                    <label
                      className="cursor-pointer text-xs font-semibold px-3 py-1.5 rounded-lg border flex items-center gap-1.5"
                      style={{
                        borderColor: aMgmtBord,
                        color: aMgmtClr,
                        background: aMgmtBg
                      }}
                    >
                      ↑ upload CSV
                      <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={handleCSVUpload}
                      />
                    </label>
                    {!isFaculty && uninvitedCount > 0 && (
                      <button
                        onClick={bulkSendInvites}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                        style={{
                          background: dark
                            ? "rgba(37,99,235,0.15)"
                            : "rgba(37,99,235,0.1)",
                          color: dark ? "#60a5fa" : "#1d4ed8",
                          border: `1px solid ${dark ? "rgba(37,99,235,0.3)" : "rgba(37,99,235,0.25)"}`
                        }}
                      >
                        → send invites to all pending ({uninvitedCount})
                      </button>
                    )}
                  </div>
                )}

                {/* ── Inline add student form ── */}
                {addModal === "student" && !isFaculty && (
                  <div
                    className="rounded-xl border p-5 flex flex-col gap-4"
                    style={{
                      borderColor: aTblBorder,
                      background: dark ? "#04080f" : "#ffffff"
                    }}
                  >
                    <p
                      className="font-semibold text-sm"
                      style={{ color: aTblText }}
                    >
                      add student
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label
                          className="text-[11px] font-semibold uppercase tracking-wide"
                          style={{ color: aTblDim }}
                        >
                          first name
                        </label>
                        <input
                          value={addForm.first_name || ""}
                          onChange={(e) =>
                            setAddForm((f) => ({
                              ...f,
                              first_name: e.target.value
                            }))
                          }
                          className="px-3 py-2 rounded-lg text-sm outline-none border"
                          style={{
                            background: aInpBg,
                            borderColor: aInpBord,
                            color: aInpText
                          }}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label
                          className="text-[11px] font-semibold uppercase tracking-wide"
                          style={{ color: aTblDim }}
                        >
                          last name
                        </label>
                        <input
                          value={addForm.last_name || ""}
                          onChange={(e) =>
                            setAddForm((f) => ({
                              ...f,
                              last_name: e.target.value
                            }))
                          }
                          className="px-3 py-2 rounded-lg text-sm outline-none border"
                          style={{
                            background: aInpBg,
                            borderColor: aInpBord,
                            color: aInpText
                          }}
                        />
                      </div>
                      <div className="col-span-2 flex flex-col gap-1">
                        <label
                          className="text-[11px] font-semibold uppercase tracking-wide"
                          style={{ color: aTblDim }}
                        >
                          anu email *
                        </label>
                        <input
                          type="email"
                          value={addForm.anu_email || ""}
                          onChange={(e) =>
                            setAddForm((f) => ({
                              ...f,
                              anu_email: e.target.value
                            }))
                          }
                          placeholder="student@anu.edu.in"
                          className="px-3 py-2 rounded-lg text-sm outline-none border"
                          style={{
                            background: aInpBg,
                            borderColor: aInpBord,
                            color: aInpText
                          }}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label
                          className="text-[11px] font-semibold uppercase tracking-wide"
                          style={{ color: aTblDim }}
                        >
                          program
                        </label>
                        <select
                          value={addForm.program || ""}
                          onChange={(e) =>
                            setAddForm((f) => ({
                              ...f,
                              program: e.target.value,
                              stream:
                                e.target.value === "BArch" ? "Architecture" : ""
                            }))
                          }
                          className="px-3 py-2 rounded-lg text-sm outline-none border"
                          style={{
                            background: aInpBg,
                            borderColor: aInpBord,
                            color: aInpText
                          }}
                        >
                          <option value="">select program</option>
                          <option value="BDes">BDes</option>
                          <option value="BArch">BArch</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label
                          className="text-[11px] font-semibold uppercase tracking-wide"
                          style={{ color: aTblDim }}
                        >
                          stream
                        </label>
                        {addForm.program === "BArch" ? (
                          <input
                            value="Architecture"
                            disabled
                            className="px-3 py-2 rounded-lg text-sm outline-none border opacity-60"
                            style={{
                              background: aInpBg,
                              borderColor: aInpBord,
                              color: aInpText
                            }}
                          />
                        ) : (
                          <select
                            value={addForm.stream || ""}
                            onChange={(e) =>
                              setAddForm((f) => ({
                                ...f,
                                stream: e.target.value
                              }))
                            }
                            className="px-3 py-2 rounded-lg text-sm outline-none border"
                            style={{
                              background: aInpBg,
                              borderColor: aInpBord,
                              color: aInpText
                            }}
                          >
                            <option value="">select stream</option>
                            {(ANU_STREAMS[addForm.program] || []).map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <label
                          className="text-[11px] font-semibold uppercase tracking-wide"
                          style={{ color: aTblDim }}
                        >
                          year
                        </label>
                        <select
                          value={String(addForm.year || "")}
                          onChange={(e) =>
                            setAddForm((f) => ({ ...f, year: e.target.value }))
                          }
                          className="px-3 py-2 rounded-lg text-sm outline-none border"
                          style={{
                            background: aInpBg,
                            borderColor: aInpBord,
                            color: aInpText
                          }}
                        >
                          <option value="">select year</option>
                          {(ANU_YEARS[addForm.program] || ANU_YEARS_ALL).map((y) => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {addMsg && <p className="text-red-400 text-xs">{addMsg}</p>}
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setAddModal(null);
                          setAddForm({});
                          setAddMsg("");
                        }}
                        className="text-sm px-4 py-2 rounded-lg"
                        style={{ color: aTblDim }}
                      >
                        cancel
                      </button>
                      <button
                        onClick={handleAddSubmit}
                        disabled={addLoading || !addForm.anu_email}
                        className="text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-40"
                        style={{ background: "#2563eb", color: "#fff" }}
                      >
                        {addLoading ? "saving…" : "add & invite"}
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Filters row ── */}
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="search by name or email…"
                    className="flex-1 min-w-[180px] px-3 py-2 rounded-lg text-sm outline-none"
                    style={{
                      background: aInpBg,
                      border: `1px solid ${aInpBord}`,
                      color: aInpText
                    }}
                  />
                  <select
                    value={filterProgram}
                    onChange={(e) => {
                      setFilterProgram(e.target.value);
                      setFilterStream("all");
                    }}
                    className="px-3 py-2 rounded-lg text-sm outline-none"
                    style={{
                      background: aInpBg,
                      border: `1px solid ${aInpBord}`,
                      color: aInpText
                    }}
                  >
                    <option value="all">all programs</option>
                    {ANU_PROGRAMS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  {filterProgram !== "all" && (
                    <select
                      value={filterStream}
                      onChange={(e) => setFilterStream(e.target.value)}
                      className="px-3 py-2 rounded-lg text-sm outline-none"
                      style={{
                        background: aInpBg,
                        border: `1px solid ${aInpBord}`,
                        color: aInpText
                      }}
                    >
                      <option value="all">all streams</option>
                      {(ANU_STREAMS[filterProgram] || []).map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  )}
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="px-3 py-2 rounded-lg text-sm outline-none"
                    style={{
                      background: aInpBg,
                      border: `1px solid ${aInpBord}`,
                      color: aInpText
                    }}
                  >
                    <option value="all">all years</option>
                    {ANU_YEARS_ALL.map((y) => (
                      <option key={y} value={y}>
                        year {y}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs" style={{ color: aTblDim }}>
                    {mergedRows.length} students
                  </span>
                  <button
                    onClick={() =>
                      downloadCSV(
                        "anu_students.csv",
                        mergedRows.map((s) => ({
                          name: s.fullName,
                          email: s.anu_email,
                          program: s.program,
                          year: s.year,
                          status: statusBadge(s).label,
                          report: s.review?.review_report_url || ""
                        }))
                      )
                    }
                    className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                    style={{ background: aCsvBg, color: aCsvText }}
                  >
                    ↓ csv
                  </button>
                </div>

                {/* ── Table + split panel ── */}
                <div className="flex flex-col md:flex-row gap-3 min-h-0">
                  {/* Table */}
                  <div
                    className={`flex flex-col min-w-0 ${sel ? "md:w-[52%]" : "w-full"}`}
                  >
                    <div
                      className="rounded-xl border overflow-x-auto"
                      style={{ borderColor: aTblBorder }}
                    >
                      <table className="w-full text-sm">
                        <thead>
                          <tr
                            style={{
                              background: aTblHdrBg,
                              borderBottom: `1px solid ${aTblBorder}`
                            }}
                          >
                            <th
                              className="px-4 py-3 text-left font-semibold"
                              style={{
                                color: aTblHdrTxt,
                                whiteSpace: "nowrap"
                              }}
                            >
                              name <SortBtn field="name" />
                            </th>
                            <th
                              className="px-4 py-3 text-left font-semibold"
                              style={{
                                color: aTblHdrTxt,
                                whiteSpace: "nowrap"
                              }}
                            >
                              email
                            </th>
                            <th
                              className="px-4 py-3 text-left font-semibold"
                              style={{
                                color: aTblHdrTxt,
                                whiteSpace: "nowrap"
                              }}
                            >
                              program
                            </th>
                            <th
                              className="px-4 py-3 text-left font-semibold"
                              style={{
                                color: aTblHdrTxt,
                                whiteSpace: "nowrap"
                              }}
                            >
                              stream
                            </th>
                            <th
                              className="px-4 py-3 text-left font-semibold"
                              style={{
                                color: aTblHdrTxt,
                                whiteSpace: "nowrap"
                              }}
                            >
                              year <SortBtn field="year" />
                            </th>
                            <th
                              className="px-4 py-3 text-left font-semibold"
                              style={{
                                color: aTblHdrTxt,
                                whiteSpace: "nowrap"
                              }}
                            >
                              status
                            </th>
                            {!isFaculty && (
                              <th
                                className="px-4 py-3 text-left font-semibold text-[11px]"
                                style={{
                                  color: aTblHdrTxt,
                                  whiteSpace: "nowrap"
                                }}
                              >
                                actions
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {mergedRows.length === 0 && (
                            <tr>
                              <td
                                colSpan={!isFaculty ? 7 : 6}
                                className="px-4 py-8 text-center"
                                style={{ color: aTblDim }}
                              >
                                no students found
                              </td>
                            </tr>
                          )}
                          {mergedRows.map((s) => {
                            const { label, clr, txt } = statusBadge(s);
                            const isSelected = sel?.id === s.id;
                            return (
                              <tr
                                key={s.id}
                                onClick={() =>
                                  setSelectedStudent(isSelected ? null : s)
                                }
                                className="cursor-pointer transition-colors"
                                style={{
                                  borderBottom: `1px solid ${aTblRowBrd}`,
                                  background: isSelected
                                    ? dark
                                      ? "rgba(37,99,235,0.12)"
                                      : "#dbeafe"
                                    : undefined
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSelected)
                                    e.currentTarget.style.background =
                                      aRowHover;
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSelected)
                                    e.currentTarget.style.background = "";
                                }}
                              >
                                <td
                                  className="px-4 py-3 font-semibold"
                                  style={{ color: aTblText }}
                                >
                                  {s.fullName || "—"}
                                </td>
                                <td
                                  className="px-4 py-3 text-xs"
                                  style={{ color: aTblMuted }}
                                >
                                  {s.anu_email || "—"}
                                </td>
                                <td
                                  className="px-4 py-3 text-xs"
                                  style={{ color: aTblMuted }}
                                >
                                  {s.program || "—"}
                                </td>
                                <td
                                  className="px-4 py-3 text-xs"
                                  style={{ color: aTblMuted }}
                                >
                                  {s.stream || "—"}
                                </td>
                                <td
                                  className="px-4 py-3 text-xs"
                                  style={{ color: aTblMuted }}
                                >
                                  {s.year || "—"}
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className="px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap"
                                    style={{ background: clr, color: txt }}
                                  >
                                    {label}
                                  </span>
                                </td>
                                {!isFaculty && (
                                  <td
                                    className="px-2 py-3"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="flex items-center gap-1.5">
                                      {!s.invite_sent_at && (
                                        <button
                                          onClick={() => sendSingleInvite("student", s)}
                                          className="text-[10px] px-2 py-0.5 rounded-md font-semibold"
                                          style={{ background: "rgba(37,99,235,0.15)", color: "#60a5fa" }}
                                        >
                                          invite
                                        </button>
                                      )}
                                      {isEvolveAdmin && (
                                        <>
                                          <button
                                            onClick={() => setEditEntry({ type: "student", id: s.id, first_name: s.first_name || "", last_name: s.last_name || "", program: s.program || "", stream: s.stream || "", year: String(s.year || "") })}
                                            className="w-7 h-7 flex items-center justify-center rounded-lg"
                                            style={{ color: aTblDim, background: dark ? "rgba(255,255,255,0.05)" : "#f1f5f9" }}
                                            title="edit"
                                          >
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                            </svg>
                                          </button>
                                          <button
                                            onClick={() => setDeleteConfirm({ type: "student", entry: s })}
                                            className="w-7 h-7 flex items-center justify-center rounded-lg"
                                            style={{ color: "#f87171", background: "rgba(248,113,113,0.08)" }}
                                            title="delete"
                                          >
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <polyline points="3,6 5,6 21,6" />
                                              <path d="M19,6l-1,14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5,6" />
                                              <path d="M10,11v6" /><path d="M14,11v6" />
                                              <path d="M9,6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                            </svg>
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* ── Split panel ── */}
                  {sel && (
                    <div
                      className="flex flex-col md:w-[48%] rounded-xl border overflow-hidden"
                      style={{
                        borderColor: aTblBorder,
                        background: dark ? "#04080f" : "#ffffff",
                        maxHeight: "calc(100vh - 220px)"
                      }}
                    >
                      {/* Panel header */}
                      <div
                        className="sticky top-0 z-10 flex items-start justify-between gap-3 px-5 py-4 border-b shrink-0"
                        style={{
                          background: dark ? "#060c17" : "#eff6ff",
                          borderColor: aTblBorder
                        }}
                      >
                        <div className="min-w-0">
                          <div
                            className="font-bold text-sm"
                            style={{ color: aTblText }}
                          >
                            {sel.fullName || "—"}
                          </div>
                          <div
                            className="text-xs mt-0.5"
                            style={{ color: aTblMuted }}
                          >
                            {sel.anu_email}
                          </div>
                          {(sel.program || sel.stream || sel.year) && (
                            <div
                              className="text-xs mt-0.5"
                              style={{ color: aTblDim }}
                            >
                              {[sel.program, sel.stream, sel.year]
                                .filter(Boolean)
                                .join(" · ")}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => setSelectedStudent(null)}
                          className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-lg font-light"
                          style={{
                            color: aTblDim,
                            background: dark
                              ? "rgba(255,255,255,0.05)"
                              : "#e2e8f0"
                          }}
                        >
                          ×
                        </button>
                      </div>

                      {/* Panel body */}
                      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
                        {!sel.review ? (
                          <div className="flex flex-col items-center justify-center py-12 gap-2">
                            <p className="text-sm" style={{ color: aTblDim }}>
                              Form not submitted yet.
                            </p>
                          </div>
                        ) : (
                          <>
                            {/* Links row — left: portfolio/resume/recording · right: view report button */}
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 flex-wrap">
                                {sel.review.portfolio_link && (
                                  <a
                                    href={sel.review.portfolio_link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs font-semibold underline underline-offset-2"
                                    style={{ color: "#60a5fa" }}
                                  >
                                    portfolio
                                  </a>
                                )}
                                {sel.review.portfolio_file_url && (
                                  <a
                                    href={sel.review.portfolio_file_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs font-semibold underline underline-offset-2"
                                    style={{ color: "#60a5fa" }}
                                  >
                                    resume
                                  </a>
                                )}
                                {sel.review.meet_recording_url ? (
                                  <div className="flex items-center gap-2">
                                    <a
                                      href={sel.review.meet_recording_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-xs font-semibold underline underline-offset-2"
                                      style={{ color: "#60a5fa" }}
                                    >
                                      meet recording
                                    </a>
                                    {isEvolveAdmin && (
                                      <button
                                        onClick={() =>
                                          setShowMeetRecInput((v) => !v)
                                        }
                                        className="text-xs font-semibold"
                                        style={{ color: aTblDim }}
                                      >
                                        {showMeetRecInput ? "cancel" : "edit"}
                                      </button>
                                    )}
                                  </div>
                                ) : isEvolveAdmin ? (
                                  <button
                                    onClick={() =>
                                      setShowMeetRecInput((v) => !v)
                                    }
                                    className="text-xs font-semibold"
                                    style={{ color: aTblDim }}
                                  >
                                    + add recording
                                  </button>
                                ) : null}
                              </div>
                              {sel.review.review_report_url && (
                                <a
                                  href={sel.review.review_report_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg"
                                  style={{
                                    background: "rgba(37,99,235,0.15)",
                                    color: "#60a5fa",
                                    border: "1px solid rgba(37,99,235,0.25)"
                                  }}
                                >
                                  view report ↗
                                </a>
                              )}
                            </div>

                            {/* Recording input (evolve admin) */}
                            {isEvolveAdmin && showMeetRecInput && (
                              <div className="flex items-center gap-2">
                                <input
                                  value={meetRecInput}
                                  onChange={(e) =>
                                    setMeetRecInput(e.target.value)
                                  }
                                  placeholder="paste recording URL…"
                                  className="flex-1 px-3 py-1.5 rounded-lg text-xs outline-none border"
                                  style={{
                                    background: aInpBg,
                                    borderColor: aInpBord,
                                    color: aInpText
                                  }}
                                />
                                <button
                                  onClick={saveMeetRecording}
                                  className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                                  style={{
                                    background: "rgba(37,99,235,0.15)",
                                    color: "#60a5fa"
                                  }}
                                >
                                  save
                                </button>
                              </div>
                            )}

                            {/* Q&A */}
                            {QA_QUESTIONS.map(({ key, label }) => {
                              const answer =
                                key === "q1"
                                  ? sel.q1
                                  : key === "q4"
                                    ? sel.q4
                                    : sel.review?.[key];
                              if (!answer) return null;
                              return (
                                <div
                                  key={key}
                                  className="flex flex-col gap-1.5"
                                >
                                  <p
                                    className="text-[10px] font-bold uppercase tracking-widest"
                                    style={{ color: aTblDim }}
                                  >
                                    {label}
                                  </p>
                                  <p
                                    className="text-sm leading-relaxed whitespace-pre-wrap"
                                    style={{ color: aTblText }}
                                  >
                                    {answer}
                                  </p>
                                </div>
                              );
                            })}

                            {/* Submitted date */}
                            {sel.review.created_at && (
                              <p className="text-xs" style={{ color: aTblDim }}>
                                Submitted {fmtDate(sel.review.created_at)}
                              </p>
                            )}

                            {/* Remarks — editable for evolve admin, read-only for faculty/uni admin */}
                            {isEvolveAdmin ? (
                              <div className="flex flex-col gap-2">
                                <p
                                  className="text-[10px] font-bold uppercase tracking-widest"
                                  style={{ color: aTblDim }}
                                >
                                  remark for faculty
                                </p>
                                <textarea
                                  value={panelRemarks}
                                  onChange={(e) =>
                                    setPanelRemarks(e.target.value)
                                  }
                                  placeholder="what would you like to tell the faculty about this student?"
                                  rows={3}
                                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border resize-none"
                                  style={{
                                    background: aInpBg,
                                    borderColor: aInpBord,
                                    color: aInpText
                                  }}
                                />
                                <div className="flex justify-end">
                                  <button
                                    onClick={savePanelRemarks}
                                    disabled={panelRemarksSaving}
                                    className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-opacity disabled:opacity-50"
                                    style={{
                                      background: "rgba(37,99,235,0.15)",
                                      color: "#60a5fa"
                                    }}
                                  >
                                    {panelRemarksSaving
                                      ? "saving…"
                                      : "save remark"}
                                  </button>
                                </div>
                              </div>
                            ) : sel.review?.remarks ? (
                              <div className="flex flex-col gap-1.5">
                                <p
                                  className="text-[10px] font-bold uppercase tracking-widest"
                                  style={{ color: aTblDim }}
                                >
                                  evolve remark
                                </p>
                                <p
                                  className="text-sm leading-relaxed whitespace-pre-wrap"
                                  style={{ color: aTblText }}
                                >
                                  {sel.review.remarks}
                                </p>
                              </div>
                            ) : null}
                          </>
                        )}

                        {/* Report upload (evolve admin) */}
                        {isEvolveAdmin && sel.review && (
                          <div
                            className="border-t pt-4 mt-1"
                            style={{ borderColor: aTblBorder }}
                          >
                            {sel.review.review_report_url ? (
                              <div className="flex items-center gap-3">
                                <span
                                  className="text-xs font-bold"
                                  style={{ color: "#34d399" }}
                                >
                                  report uploaded
                                </span>
                                <a
                                  href={sel.review.review_report_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs underline"
                                  style={{ color: "#60a5fa" }}
                                >
                                  view pdf
                                </a>
                              </div>
                            ) : !sel.review.meet_recording_url ? (
                              <p
                                className="text-xs italic"
                                style={{ color: aTblDim }}
                              >
                                add the session recording link before uploading the report
                              </p>
                            ) : (
                              <ReviewUploadCell
                                review={sel.review}
                                onDone={(id, url, rm) => {
                                  handleReportDone(id, url, rm);
                                  setSelectedStudent((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          review: {
                                            ...prev.review,
                                            review_report_url: url,
                                            remarks: rm
                                          }
                                        }
                                      : null
                                  );
                                }}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

        {/* ══════════════════════════════════════════════════════════════
            FACULTY TAB (anant — uni_admin / evolve admin)
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "faculty" &&
          isAnantAdmin &&
          (() => {
            if (anuFacultyData === null) {
              return (
                <div className="flex items-center justify-center py-16">
                  <div
                    className="w-6 h-6 rounded-full animate-spin"
                    style={{
                      border: `2px solid ${dark ? "#818cf8" : "#334155"}`,
                      borderTopColor: "transparent"
                    }}
                  />
                </div>
              );
            }
            const srch = search.toLowerCase();
            const filtered = anuFacultyData.filter((f) => {
              if (!srch) return true;
              return (
                `${f.first_name || ""} ${f.last_name || ""}`
                  .toLowerCase()
                  .includes(srch) ||
                (f.anu_email || "").toLowerCase().includes(srch)
              );
            });
            return (
              <div className="flex flex-col gap-4">
                {!isFaculty && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        setAddModal(addModal === "faculty" ? null : "faculty");
                        setAddForm({});
                        setAddMsg("");
                      }}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border flex items-center gap-1.5"
                      style={{
                        borderColor:
                          addModal === "faculty" ? "#2563eb" : aMgmtBord,
                        color:
                          addModal === "faculty"
                            ? dark
                              ? "#60a5fa"
                              : "#1d4ed8"
                            : aMgmtClr,
                        background: aMgmtBg
                      }}
                    >
                      {addModal === "faculty" ? "× cancel" : "+ add faculty"}
                    </button>
                    <label
                      className="cursor-pointer text-xs font-semibold px-3 py-1.5 rounded-lg border flex items-center gap-1.5"
                      style={{
                        borderColor: aMgmtBord,
                        color: aMgmtClr,
                        background: aMgmtBg
                      }}
                    >
                      ↑ upload CSV
                      <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={(e) => handleEntityCSVUpload(e, "faculty")}
                      />
                    </label>
                  </div>
                )}

                {/* ── Inline add faculty form ── */}
                {addModal === "faculty" && !isFaculty && (
                  <div
                    className="rounded-xl border p-5 flex flex-col gap-4"
                    style={{
                      borderColor: aTblBorder,
                      background: dark ? "#04080f" : "#ffffff"
                    }}
                  >
                    <p
                      className="font-semibold text-sm"
                      style={{ color: aTblText }}
                    >
                      add faculty member
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label
                          className="text-[11px] font-semibold uppercase tracking-wide"
                          style={{ color: aTblDim }}
                        >
                          first name
                        </label>
                        <input
                          value={addForm.first_name || ""}
                          onChange={(e) =>
                            setAddForm((f) => ({
                              ...f,
                              first_name: e.target.value
                            }))
                          }
                          className="px-3 py-2 rounded-lg text-sm outline-none border"
                          style={{
                            background: aInpBg,
                            borderColor: aInpBord,
                            color: aInpText
                          }}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label
                          className="text-[11px] font-semibold uppercase tracking-wide"
                          style={{ color: aTblDim }}
                        >
                          last name
                        </label>
                        <input
                          value={addForm.last_name || ""}
                          onChange={(e) =>
                            setAddForm((f) => ({
                              ...f,
                              last_name: e.target.value
                            }))
                          }
                          className="px-3 py-2 rounded-lg text-sm outline-none border"
                          style={{
                            background: aInpBg,
                            borderColor: aInpBord,
                            color: aInpText
                          }}
                        />
                      </div>
                      <div className="col-span-2 flex flex-col gap-1">
                        <label
                          className="text-[11px] font-semibold uppercase tracking-wide"
                          style={{ color: aTblDim }}
                        >
                          anu email *
                        </label>
                        <input
                          type="email"
                          value={addForm.anu_email || ""}
                          onChange={(e) =>
                            setAddForm((f) => ({
                              ...f,
                              anu_email: e.target.value
                            }))
                          }
                          placeholder="faculty@anu.edu.in"
                          className="px-3 py-2 rounded-lg text-sm outline-none border"
                          style={{
                            background: aInpBg,
                            borderColor: aInpBord,
                            color: aInpText
                          }}
                        />
                      </div>
                      <div className="col-span-2 flex flex-col gap-1">
                        <label
                          className="text-[11px] font-semibold uppercase tracking-wide"
                          style={{ color: aTblDim }}
                        >
                          designation
                        </label>
                        <input
                          value={addForm.designation || ""}
                          onChange={(e) =>
                            setAddForm((f) => ({
                              ...f,
                              designation: e.target.value
                            }))
                          }
                          className="px-3 py-2 rounded-lg text-sm outline-none border"
                          style={{
                            background: aInpBg,
                            borderColor: aInpBord,
                            color: aInpText
                          }}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label
                          className="text-[11px] font-semibold uppercase tracking-wide"
                          style={{ color: aTblDim }}
                        >
                          program
                        </label>
                        <select
                          value={addForm.program || ""}
                          onChange={(e) => {
                            const prog = e.target.value;
                            setAddForm((f) => ({
                              ...f,
                              program: prog,
                              stream: prog === "BArch" ? ["Architecture"] : []
                            }));
                          }}
                          className="px-3 py-2 rounded-lg text-sm outline-none border"
                          style={{ background: aInpBg, borderColor: aInpBord, color: aInpText }}
                        >
                          <option value="">select program</option>
                          <option value="BDes">BDes</option>
                          <option value="BArch">BArch</option>
                        </select>
                      </div>
                      <div className="col-span-2 flex flex-col gap-1">
                        <label
                          className="text-[11px] font-semibold uppercase tracking-wide"
                          style={{ color: aTblDim }}
                        >
                          streams <span className="normal-case font-normal">(you can select multiple)</span>
                        </label>
                        {addForm.program === "BArch" ? (
                          <div className="px-3 py-2 rounded-lg border text-sm opacity-60" style={{ background: aInpBg, borderColor: aInpBord, color: aInpText }}>
                            Architecture
                          </div>
                        ) : addForm.program ? (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {(ANU_STREAMS[addForm.program] || []).map((s) => {
                              const sel = Array.isArray(addForm.stream) ? addForm.stream.includes(s) : false;
                              return (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => setAddForm((f) => {
                                    const cur = Array.isArray(f.stream) ? f.stream : [];
                                    return { ...f, stream: sel ? cur.filter(x => x !== s) : [...cur, s] };
                                  })}
                                  className="text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors"
                                  style={{
                                    background: sel ? "#2563eb" : aInpBg,
                                    borderColor: sel ? "#2563eb" : aInpBord,
                                    color: sel ? "#fff" : aInpText
                                  }}
                                >
                                  {s}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs py-1" style={{ color: aTblDim }}>select a program first</p>
                        )}
                      </div>
                    </div>
                    {addMsg && <p className="text-red-400 text-xs">{addMsg}</p>}
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setAddModal(null);
                          setAddForm({});
                          setAddMsg("");
                        }}
                        className="text-sm px-4 py-2 rounded-lg"
                        style={{ color: aTblDim }}
                      >
                        cancel
                      </button>
                      <button
                        onClick={handleAddSubmit}
                        disabled={addLoading || !addForm.anu_email || !Array.isArray(addForm.stream) || addForm.stream.length === 0}
                        className="text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-40"
                        style={{ background: "#2563eb", color: "#fff" }}
                      >
                        {addLoading ? "saving…" : "add & invite"}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="search faculty…"
                    className="flex-1 max-w-sm px-3 py-2 rounded-lg text-sm outline-none"
                    style={{
                      background: aInpBg,
                      border: `1px solid ${aInpBord}`,
                      color: aInpText
                    }}
                  />
                  <span className="text-xs" style={{ color: aTblDim }}>
                    {filtered.length} faculty
                  </span>
                </div>
                <div
                  className="rounded-xl border overflow-x-auto"
                  style={{ borderColor: aTblBorder }}
                >
                  <table className="w-full text-sm">
                    <thead>
                      <tr
                        style={{
                          background: aTblHdrBg,
                          borderBottom: `1px solid ${aTblBorder}`
                        }}
                      >
                        {[
                          "name",
                          "email",
                          "designation",
                          "program",
                          "stream",
                          "invited",
                          ...(!isFaculty ? ["actions"] : [])
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left font-semibold text-[11px]"
                            style={{ color: aTblHdrTxt, whiteSpace: "nowrap" }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 && (
                        <tr>
                          <td
                            colSpan={isEvolveAdmin ? 7 : 6}
                            className="px-4 py-8 text-center"
                            style={{ color: aTblDim }}
                          >
                            no faculty found
                          </td>
                        </tr>
                      )}
                      {filtered.map((f) => (
                        <tr
                          key={f.id}
                          className="transition-colors"
                          style={{ borderBottom: `1px solid ${aTblRowBrd}` }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = aRowHover;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "";
                          }}
                        >
                          <td
                            className="px-4 py-3 font-semibold"
                            style={{ color: aTblText }}
                          >
                            {[f.first_name, f.last_name]
                              .filter(Boolean)
                              .join(" ") || "—"}
                          </td>
                          <td
                            className="px-4 py-3 text-xs"
                            style={{ color: aTblMuted }}
                          >
                            {f.anu_email || "—"}
                          </td>
                          <td
                            className="px-4 py-3 text-xs"
                            style={{ color: aTblMuted }}
                          >
                            {f.designation || "—"}
                          </td>
                          <td
                            className="px-4 py-3 text-xs"
                            style={{ color: aTblMuted }}
                          >
                            {f.program || "—"}
                          </td>
                          <td
                            className="px-4 py-3 text-xs"
                            style={{ color: aTblMuted }}
                          >
                            {parseStreams(f.stream).join(", ") || "—"}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            {f.invite_sent_at ? (
                              <span style={{ color: "#34d399" }}>yes</span>
                            ) : (
                              <span style={{ color: aTblDim }}>—</span>
                            )}
                          </td>
                          {!isFaculty && (
                            <td className="px-2 py-3">
                              <div className="flex items-center gap-1.5">
                                {!f.invite_sent_at && (
                                  <button
                                    onClick={() => sendSingleInvite("faculty", f)}
                                    className="text-[10px] px-2 py-0.5 rounded-md font-semibold"
                                    style={{ background: "rgba(37,99,235,0.15)", color: "#60a5fa" }}
                                  >
                                    invite
                                  </button>
                                )}
                                {isEvolveAdmin && (
                                  <>
                                    <button
                                      onClick={() => setEditEntry({ type: "faculty", id: f.id, first_name: f.first_name || "", last_name: f.last_name || "", designation: f.designation || "", program: f.program || "", stream: parseStreams(f.stream) })}
                                      className="w-7 h-7 flex items-center justify-center rounded-lg"
                                      style={{ color: aTblDim, background: dark ? "rgba(255,255,255,0.05)" : "#f1f5f9" }}
                                      title="edit"
                                    >
                                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirm({ type: "faculty", entry: f })}
                                      className="w-7 h-7 flex items-center justify-center rounded-lg"
                                      style={{ color: "#f87171", background: "rgba(248,113,113,0.08)" }}
                                      title="delete"
                                    >
                                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3,6 5,6 21,6" />
                                        <path d="M19,6l-1,14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5,6" />
                                        <path d="M10,11v6" /><path d="M14,11v6" />
                                        <path d="M9,6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                      </svg>
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

        {/* ══════════════════════════════════════════════════════════════
            COLLEGE ADMIN TAB (anant — uni_admin / evolve admin)
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "college admin" &&
          isAnantAdmin &&
          (() => {
            if (anuAdminsData === null) {
              return (
                <div className="flex items-center justify-center py-16">
                  <div
                    className="w-6 h-6 rounded-full animate-spin"
                    style={{
                      border: `2px solid ${dark ? "#818cf8" : "#334155"}`,
                      borderTopColor: "transparent"
                    }}
                  />
                </div>
              );
            }
            const srch = search.toLowerCase();
            const filtered = anuAdminsData.filter((a) => {
              if (!srch) return true;
              return (
                `${a.first_name || ""} ${a.last_name || ""}`
                  .toLowerCase()
                  .includes(srch) ||
                (a.anu_email || "").toLowerCase().includes(srch)
              );
            });
            return (
              <div className="flex flex-col gap-4">
                {!isFaculty && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        setAddModal(addModal === "admin" ? null : "admin");
                        setAddForm({});
                        setAddMsg("");
                      }}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border flex items-center gap-1.5"
                      style={{
                        borderColor:
                          addModal === "admin" ? "#2563eb" : aMgmtBord,
                        color:
                          addModal === "admin"
                            ? dark
                              ? "#60a5fa"
                              : "#1d4ed8"
                            : aMgmtClr,
                        background: aMgmtBg
                      }}
                    >
                      {addModal === "admin"
                        ? "× cancel"
                        : "+ add university admin"}
                    </button>
                    <label
                      className="cursor-pointer text-xs font-semibold px-3 py-1.5 rounded-lg border flex items-center gap-1.5"
                      style={{
                        borderColor: aMgmtBord,
                        color: aMgmtClr,
                        background: aMgmtBg
                      }}
                    >
                      ↑ upload CSV
                      <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={(e) => handleEntityCSVUpload(e, "admin")}
                      />
                    </label>
                  </div>
                )}

                {/* ── Inline add university admin form ── */}
                {addModal === "admin" && !isFaculty && (
                  <div
                    className="rounded-xl border p-5 flex flex-col gap-4"
                    style={{
                      borderColor: aTblBorder,
                      background: dark ? "#04080f" : "#ffffff"
                    }}
                  >
                    <p
                      className="font-semibold text-sm"
                      style={{ color: aTblText }}
                    >
                      add university admin
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label
                          className="text-[11px] font-semibold uppercase tracking-wide"
                          style={{ color: aTblDim }}
                        >
                          first name
                        </label>
                        <input
                          value={addForm.first_name || ""}
                          onChange={(e) =>
                            setAddForm((f) => ({
                              ...f,
                              first_name: e.target.value
                            }))
                          }
                          className="px-3 py-2 rounded-lg text-sm outline-none border"
                          style={{
                            background: aInpBg,
                            borderColor: aInpBord,
                            color: aInpText
                          }}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label
                          className="text-[11px] font-semibold uppercase tracking-wide"
                          style={{ color: aTblDim }}
                        >
                          last name
                        </label>
                        <input
                          value={addForm.last_name || ""}
                          onChange={(e) =>
                            setAddForm((f) => ({
                              ...f,
                              last_name: e.target.value
                            }))
                          }
                          className="px-3 py-2 rounded-lg text-sm outline-none border"
                          style={{
                            background: aInpBg,
                            borderColor: aInpBord,
                            color: aInpText
                          }}
                        />
                      </div>
                      <div className="col-span-2 flex flex-col gap-1">
                        <label
                          className="text-[11px] font-semibold uppercase tracking-wide"
                          style={{ color: aTblDim }}
                        >
                          anu email *
                        </label>
                        <input
                          type="email"
                          value={addForm.anu_email || ""}
                          onChange={(e) =>
                            setAddForm((f) => ({
                              ...f,
                              anu_email: e.target.value
                            }))
                          }
                          placeholder="admin@anu.edu.in"
                          className="px-3 py-2 rounded-lg text-sm outline-none border"
                          style={{
                            background: aInpBg,
                            borderColor: aInpBord,
                            color: aInpText
                          }}
                        />
                      </div>
                      <div className="col-span-2 flex flex-col gap-1">
                        <label
                          className="text-[11px] font-semibold uppercase tracking-wide"
                          style={{ color: aTblDim }}
                        >
                          designation
                        </label>
                        <input
                          value={addForm.designation || ""}
                          onChange={(e) =>
                            setAddForm((f) => ({
                              ...f,
                              designation: e.target.value
                            }))
                          }
                          className="px-3 py-2 rounded-lg text-sm outline-none border"
                          style={{
                            background: aInpBg,
                            borderColor: aInpBord,
                            color: aInpText
                          }}
                        />
                      </div>
                    </div>
                    {addMsg && <p className="text-red-400 text-xs">{addMsg}</p>}
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setAddModal(null);
                          setAddForm({});
                          setAddMsg("");
                        }}
                        className="text-sm px-4 py-2 rounded-lg"
                        style={{ color: aTblDim }}
                      >
                        cancel
                      </button>
                      <button
                        onClick={handleAddSubmit}
                        disabled={addLoading || !addForm.anu_email}
                        className="text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-40"
                        style={{ background: "#2563eb", color: "#fff" }}
                      >
                        {addLoading ? "saving…" : "add & invite"}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="search admins…"
                    className="flex-1 max-w-sm px-3 py-2 rounded-lg text-sm outline-none"
                    style={{
                      background: aInpBg,
                      border: `1px solid ${aInpBord}`,
                      color: aInpText
                    }}
                  />
                  <span className="text-xs" style={{ color: aTblDim }}>
                    {filtered.length} admins
                  </span>
                </div>
                <div
                  className="rounded-xl border overflow-x-auto"
                  style={{ borderColor: aTblBorder }}
                >
                  <table className="w-full text-sm">
                    <thead>
                      <tr
                        style={{
                          background: aTblHdrBg,
                          borderBottom: `1px solid ${aTblBorder}`
                        }}
                      >
                        {[
                          "name",
                          "email",
                          "designation",
                          "invited",
                          ...(!isFaculty ? ["actions"] : [])
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left font-semibold text-[11px]"
                            style={{ color: aTblHdrTxt, whiteSpace: "nowrap" }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 && (
                        <tr>
                          <td
                            colSpan={!isFaculty ? 5 : 4}
                            className="px-4 py-8 text-center"
                            style={{ color: aTblDim }}
                          >
                            no admins found
                          </td>
                        </tr>
                      )}
                      {filtered.map((a) => (
                        <tr
                          key={a.id}
                          className="transition-colors"
                          style={{ borderBottom: `1px solid ${aTblRowBrd}` }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = aRowHover;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "";
                          }}
                        >
                          <td
                            className="px-4 py-3 font-semibold"
                            style={{ color: aTblText }}
                          >
                            {[a.first_name, a.last_name]
                              .filter(Boolean)
                              .join(" ") || "—"}
                          </td>
                          <td
                            className="px-4 py-3 text-xs"
                            style={{ color: aTblMuted }}
                          >
                            {a.anu_email || "—"}
                          </td>
                          <td
                            className="px-4 py-3 text-xs"
                            style={{ color: aTblMuted }}
                          >
                            {a.designation || "—"}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            {a.invite_sent_at ? (
                              <span style={{ color: "#34d399" }}>yes</span>
                            ) : (
                              <span style={{ color: aTblDim }}>—</span>
                            )}
                          </td>
                          {!isFaculty && (
                            <td className="px-2 py-3">
                              <div className="flex items-center gap-1.5">
                                {!a.invite_sent_at && (
                                  <button
                                    onClick={() => sendSingleInvite("admin", a)}
                                    className="text-[10px] px-2 py-0.5 rounded-md font-semibold"
                                    style={{ background: "rgba(37,99,235,0.15)", color: "#60a5fa" }}
                                  >
                                    invite
                                  </button>
                                )}
                                {isEvolveAdmin && (
                                  <>
                                    <button
                                      onClick={() => setEditEntry({ type: "admin", id: a.id, first_name: a.first_name || "", last_name: a.last_name || "", designation: a.designation || "" })}
                                      className="w-7 h-7 flex items-center justify-center rounded-lg"
                                      style={{ color: aTblDim, background: dark ? "rgba(255,255,255,0.05)" : "#f1f5f9" }}
                                      title="edit"
                                    >
                                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirm({ type: "admin", entry: a })}
                                      className="w-7 h-7 flex items-center justify-center rounded-lg"
                                      style={{ color: "#f87171", background: "rgba(248,113,113,0.08)" }}
                                      title="delete"
                                    >
                                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3,6 5,6 21,6" />
                                        <path d="M19,6l-1,14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5,6" />
                                        <path d="M10,11v6" /><path d="M14,11v6" />
                                        <path d="M9,6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                      </svg>
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

        {/* ══════════════════════════════════════════════════════════════
            MENTORSHIP PORTFOLIOS TAB
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "m-portfolios" && (
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
                {mentorshipPortfolios.length} submissions
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
                      "version",
                      "portfolio",
                      "walkthrough",
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
                  {mentorshipPortfolios
                    .filter((v) => {
                      const q = search.toLowerCase();
                      return (
                        !q ||
                        (v.profiles?.name || "").toLowerCase().includes(q) ||
                        (v.profiles?.email || "").toLowerCase().includes(q)
                      );
                    })
                    .map((v, i) => (
                      <tr
                        key={v.id}
                        style={{
                          borderBottom: "1px solid #1a1a1a",
                          background: i % 2 === 0 ? "#0d0d0d" : "#0a0a0a"
                        }}
                      >
                        <td className="px-4 py-3 font-semibold text-white">
                          {v.profiles?.name || "—"}
                        </td>
                        <td
                          className="px-4 py-3 text-xs"
                          style={{ color: "#888" }}
                        >
                          {v.profiles?.email || "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-white font-bold">
                          v{v.version_number}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {v.portfolio_url ? (
                            <a
                              href={v.portfolio_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-yellow-400 underline"
                            >
                              open link
                            </a>
                          ) : (
                            <span style={{ color: "#444" }}>—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {v.walkthrough_url ? (
                            <a
                              href={v.walkthrough_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-yellow-400 underline"
                            >
                              walkthrough
                            </a>
                          ) : (
                            <span style={{ color: "#444" }}>—</span>
                          )}
                        </td>
                        <td
                          className="px-4 py-3 text-xs"
                          style={{
                            color: "#aaa",
                            maxWidth: 200,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}
                          title={v.notes}
                        >
                          {v.notes || "—"}
                        </td>
                        <td
                          className="px-4 py-3 text-xs"
                          style={{ color: "#666" }}
                        >
                          {fmtDate(v.created_at)}
                        </td>
                        <td
                          className="px-4 py-3 text-xs"
                          style={{
                            color: "#aaa",
                            maxWidth: 200,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}
                          title={v.review_remarks}
                        >
                          {v.review_remarks || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <MentorshipPortfolioUploadCell
                            version={v}
                            onDone={handleMentorshipReportDone}
                          />
                        </td>
                      </tr>
                    ))}
                  {mentorshipPortfolios.length === 0 && (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-8 text-center"
                        style={{ color: "#444" }}
                      >
                        no portfolio submissions yet
                      </td>
                    </tr>
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
        {activeTab === "m-profiles" &&
          (() => {
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
            const filtered = mentorshipProfilesData.filter(
              (p) =>
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
                    style={{
                      background: "#111",
                      border: "1px solid #222",
                      color: "#fff"
                    }}
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
                    const portfolios = (portfoliosByUser[p.user_id] || []).sort(
                      (a, b) => a.version_number - b.version_number
                    );
                    const resumes = (resumesByUser[p.user_id] || []).sort(
                      (a, b) => a.version_number - b.version_number
                    );
                    const initial = (p.name || "?")[0].toUpperCase();
                    const batchNum = p.batch?.batch_number;

                    return (
                      <div
                        key={p.user_id}
                        className="rounded-2xl border overflow-hidden"
                        style={{
                          background: "#0d0d0d",
                          borderColor: "#1e1e1e"
                        }}
                      >
                        {/* ── Card header ── */}
                        <div
                          className="flex items-start gap-4 p-5 border-b"
                          style={{ borderColor: "#1a1a1a" }}
                        >
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
                              <span className="text-white font-bold text-base">
                                {p.name || "—"}
                              </span>
                              {batchNum && (
                                <span
                                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                  style={{
                                    background: "rgba(255,208,7,0.12)",
                                    color: "#FFD007"
                                  }}
                                >
                                  batch {batchNum}
                                </span>
                              )}
                            </div>
                            <p
                              className="text-xs mb-2"
                              style={{ color: "#666" }}
                            >
                              {p.email || "—"}
                            </p>
                            <div className="flex flex-wrap items-center gap-3">
                              <span
                                className="text-[11px]"
                                style={{ color: "#555" }}
                              >
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
                                  <svg
                                    width="11"
                                    height="11"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                  >
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                  </svg>
                                  LinkedIn
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* ── Goal ── */}
                        <div
                          className="px-5 py-4 border-b"
                          style={{ borderColor: "#1a1a1a" }}
                        >
                          <p
                            className="text-[10px] uppercase tracking-widest mb-1.5"
                            style={{ color: "#555" }}
                          >
                            goal
                          </p>
                          <p
                            className="text-sm leading-relaxed"
                            style={{ color: "#ccc" }}
                          >
                            {p.goal || "—"}
                          </p>
                        </div>

                        {/* ── Submissions ── */}
                        <div
                          className="grid grid-cols-2 divide-x"
                          style={{ borderColor: "#1a1a1a" }}
                        >
                          {/* Portfolio versions */}
                          <div className="p-5">
                            <p
                              className="text-[10px] uppercase tracking-widest mb-3 flex items-center gap-2"
                              style={{ color: "#555" }}
                            >
                              portfolio
                              <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                style={{ background: "#1a1a1a", color: "#666" }}
                              >
                                {portfolios.length}
                              </span>
                            </p>
                            {portfolios.length === 0 ? (
                              <p className="text-xs" style={{ color: "#333" }}>
                                no uploads yet
                              </p>
                            ) : (
                              <div className="flex flex-col gap-2.5">
                                {portfolios.map((pf) => (
                                  <div
                                    key={pf.id}
                                    className="flex flex-col gap-1"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span
                                        className="text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                        style={{
                                          background: "#222",
                                          color: "#888"
                                        }}
                                      >
                                        {pf.version_number}
                                      </span>
                                      {pf.portfolio_url && (
                                        <a
                                          href={pf.portfolio_url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-[11px] font-semibold"
                                          style={{ color: "#FFD007" }}
                                        >
                                          portfolio ↗
                                        </a>
                                      )}
                                      {pf.walkthrough_url && (
                                        <a
                                          href={pf.walkthrough_url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-[11px] font-semibold"
                                          style={{ color: "#DF0586" }}
                                        >
                                          walkthrough ↗
                                        </a>
                                      )}
                                    </div>
                                    {pf.notes && (
                                      <p
                                        className="text-[11px] pl-7 leading-relaxed"
                                        style={{ color: "#555" }}
                                      >
                                        {pf.notes}
                                      </p>
                                    )}
                                    {pf.review_report_url && (
                                      <a
                                        href={pf.review_report_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[11px] pl-7 font-semibold flex items-center gap-1"
                                        style={{ color: GR }}
                                      >
                                        <svg
                                          width="10"
                                          height="10"
                                          viewBox="0 0 16 16"
                                          fill="none"
                                        >
                                          <path
                                            d="M8 2v8M4 7l4 4 4-4M2 13h12"
                                            stroke="currentColor"
                                            strokeWidth="1.6"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          />
                                        </svg>
                                        report uploaded
                                      </a>
                                    )}
                                    {pf.review_remarks && (
                                      <p
                                        className="text-[11px] pl-7 italic"
                                        style={{ color: "#555" }}
                                      >
                                        {pf.review_remarks}
                                      </p>
                                    )}
                                    <p
                                      className="text-[10px] pl-7"
                                      style={{ color: "#444" }}
                                    >
                                      {fmtDate(pf.created_at)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Resume versions */}
                          <div
                            className="p-5"
                            style={{ borderColor: "#1a1a1a" }}
                          >
                            <p
                              className="text-[10px] uppercase tracking-widest mb-3 flex items-center gap-2"
                              style={{ color: "#555" }}
                            >
                              resume
                              <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                style={{ background: "#1a1a1a", color: "#666" }}
                              >
                                {resumes.length}
                              </span>
                            </p>
                            {resumes.length === 0 ? (
                              <p className="text-xs" style={{ color: "#333" }}>
                                no uploads yet
                              </p>
                            ) : (
                              <div className="flex flex-col gap-2.5">
                                {resumes.map((r) => (
                                  <div
                                    key={r.id}
                                    className="flex flex-col gap-1"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span
                                        className="text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                        style={{
                                          background: "#222",
                                          color: "#888"
                                        }}
                                      >
                                        {r.version_number}
                                      </span>
                                      {r.resume_url && (
                                        <a
                                          href={r.resume_url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-[11px] font-semibold"
                                          style={{ color: "#FFD007" }}
                                        >
                                          resume ↗
                                        </a>
                                      )}
                                    </div>
                                    {r.notes && (
                                      <p
                                        className="text-[11px] pl-7 leading-relaxed"
                                        style={{ color: "#555" }}
                                      >
                                        {r.notes}
                                      </p>
                                    )}
                                    <p
                                      className="text-[10px] pl-7"
                                      style={{ color: "#444" }}
                                    >
                                      {fmtDate(r.created_at)}
                                    </p>
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

        {activeTab === "accelerator" && (
          <AcceleratorTab
            batches={batches}
            payments={payments}
            profiles={profiles}
          />
        )}
      </div>

      {/* ── Edit modal ── */}
      {editEntry && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)" }}
          onClick={() => setEditEntry(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border p-6 flex flex-col gap-4"
            style={{
              background: dark ? "#060c17" : "#fff",
              borderColor: "#1e3a5f"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2
                className="font-bold text-base"
                style={{ color: dark ? "#fff" : "#0f172a" }}
              >
                edit entry
              </h2>
              <button
                onClick={() => setEditEntry(null)}
                style={{ color: "#64748b" }}
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {Object.entries(editEntry)
                .filter(([k]) => !["type", "id"].includes(k))
                .map(([key, val]) => {
                  const inpStyle = {
                    background: dark ? "rgba(255,255,255,0.05)" : "#f1f5f9",
                    borderColor: dark ? "#1e3a5f" : "#cbd5e1",
                    color: dark ? "#fff" : "#0f172a"
                  };
                  const labelStyle = {
                    color: dark ? "rgba(255,255,255,0.5)" : "#64748b"
                  };
                  if (key === "program") {
                    return (
                      <div key={key} className="flex flex-col gap-1">
                        <label className="text-xs font-semibold" style={labelStyle}>program</label>
                        <select
                          value={val}
                          onChange={(e) => {
                            const prog = e.target.value;
                            setEditEntry((prev) => ({
                              ...prev,
                              program: prog,
                              stream: editEntry.type === "faculty"
                                ? (prog === "BArch" ? ["Architecture"] : [])
                                : (prog === "BArch" ? "Architecture" : prev.stream || "")
                            }));
                          }}
                          className="px-3 py-2 rounded-lg text-sm outline-none border"
                          style={inpStyle}
                        >
                          <option value="">select</option>
                          <option value="BDes">BDes</option>
                          <option value="BArch">BArch</option>
                        </select>
                      </div>
                    );
                  }
                  if (key === "stream") {
                    // Only faculty entries have multi-stream editing
                    if (editEntry.type === "faculty") {
                      const selectedStreams = Array.isArray(val) ? val : parseStreams(val);
                      return (
                        <div key={key} className="flex flex-col gap-1">
                          <label className="text-xs font-semibold" style={labelStyle}>streams</label>
                          {editEntry.program === "BArch" ? (
                            <div className="px-3 py-2 rounded-lg border text-sm opacity-60" style={inpStyle}>Architecture</div>
                          ) : editEntry.program ? (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {(ANU_STREAMS[editEntry.program] || []).map((s) => {
                                const sel = selectedStreams.includes(s);
                                return (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => setEditEntry((prev) => {
                                      const cur = Array.isArray(prev.stream) ? prev.stream : parseStreams(prev.stream);
                                      return { ...prev, stream: sel ? cur.filter(x => x !== s) : [...cur, s] };
                                    })}
                                    className="text-xs px-2.5 py-1 rounded-lg border font-medium"
                                    style={{ background: sel ? "#2563eb" : inpStyle.background, borderColor: sel ? "#2563eb" : inpStyle.borderColor, color: sel ? "#fff" : inpStyle.color }}
                                  >
                                    {s}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-xs" style={{ color: "#64748b" }}>select a program first</p>
                          )}
                        </div>
                      );
                    }
                    // Student stream: single select
                    return (
                      <div key={key} className="flex flex-col gap-1">
                        <label className="text-xs font-semibold" style={labelStyle}>stream</label>
                        <select
                          value={typeof val === "string" ? val : ""}
                          onChange={(e) => setEditEntry((prev) => ({ ...prev, stream: e.target.value }))}
                          className="px-3 py-2 rounded-lg text-sm outline-none border"
                          style={inpStyle}
                        >
                          <option value="">select stream</option>
                          {(ANU_STREAMS[editEntry.program] || []).map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    );
                  }
                  if (key === "year") {
                    return (
                      <div key={key} className="flex flex-col gap-1">
                        <label
                          className="text-xs font-semibold"
                          style={labelStyle}
                        >
                          year
                        </label>
                        <select
                          value={String(val)}
                          onChange={(e) =>
                            setEditEntry((prev) => ({
                              ...prev,
                              year: e.target.value
                            }))
                          }
                          className="px-3 py-2 rounded-lg text-sm outline-none border"
                          style={inpStyle}
                        >
                          <option value="">select</option>
                          {(ANU_YEARS[editEntry.program] || ANU_YEARS_ALL).map((y) => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    );
                  }
                  return (
                    <div key={key} className="flex flex-col gap-1">
                      <label
                        className="text-xs font-semibold"
                        style={labelStyle}
                      >
                        {key.replace(/_/g, " ")}
                      </label>
                      <input
                        value={val}
                        onChange={(e) =>
                          setEditEntry((prev) => ({
                            ...prev,
                            [key]: e.target.value
                          }))
                        }
                        className="px-3 py-2 rounded-lg text-sm outline-none border"
                        style={inpStyle}
                      />
                    </div>
                  );
                })}
            </div>
            <div className="flex justify-end gap-2 mt-1">
              <button
                onClick={() => setEditEntry(null)}
                className="text-sm px-4 py-2 rounded-lg"
                style={{ color: "#64748b" }}
              >
                cancel
              </button>
              <button
                onClick={handleEditSave}
                className="text-sm font-semibold px-4 py-2 rounded-lg"
                style={{ background: "#2563eb", color: "#fff" }}
              >
                save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm ── */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border p-6 flex flex-col gap-4"
            style={{
              background: dark ? "#060c17" : "#fff",
              borderColor: "#1e3a5f"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              className="font-bold text-base"
              style={{ color: dark ? "#fff" : "#0f172a" }}
            >
              Delete entry?
            </h2>
            <p
              className="text-sm"
              style={{ color: dark ? "rgba(255,255,255,0.6)" : "#64748b" }}
            >
              This will permanently remove{" "}
              <strong>
                {[deleteConfirm.entry.first_name, deleteConfirm.entry.last_name]
                  .filter(Boolean)
                  .join(" ") || deleteConfirm.entry.anu_email}
              </strong>{" "}
              from the database.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="text-sm px-4 py-2 rounded-lg"
                style={{ color: "#64748b" }}
              >
                cancel
              </button>
              <button
                onClick={handleDelete}
                className="text-sm font-semibold px-4 py-2 rounded-lg"
                style={{ background: "#ef4444", color: "#fff" }}
              >
                delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Report Modal — evolve reviews only */}
      {aiReportReview && (
        <AIReportModal
          review={aiReportReview}
          onClose={() => setAiReportReview(null)}
          onSaved={(updated) => {
            setPortfolioReviews((prev) =>
              prev.map((r) => r.id === updated.id ? updated : r)
            );
            setAiReportReview(updated);
          }}
          onRegenerate={(review) => {
            setAiReportReview(null);
            handleAiRegenerate(review);
          }}
          onReportSent={(updated) => {
            setPortfolioReviews((prev) =>
              prev.map((r) => r.id === updated.id ? { ...r, ...updated } : r)
            );
            setAiReportReview(null);
          }}
        />
      )}
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
  const [form, setForm] = useState({
    name: "",
    description: "",
    date: "",
    time: "21:30",
    meet_link: "",
    recording_path: "",
    summary: "",
    next_steps: "",
    transcript: ""
  });
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
      name: existing?.name || SESSION_NAMES[sessionNumber - 1] || "",
      description: existing?.description || "",
      date: ist.date,
      time: ist.time,
      meet_link: existing?.meet_link || "",
      recording_path: existing?.recording_path || "",
      summary: existing?.summary || "",
      next_steps: existing?.next_steps || "",
      transcript: existing?.transcript || ""
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
        batch_id: batchId,
        session_number: sessionNumber,
        name: form.name.trim(),
        description: form.description.trim() || null,
        session_datetime,
        meet_link: form.meet_link.trim() || null,
        recording_path: form.recording_path.trim() || null,
        summary: form.summary.trim() || null,
        next_steps: form.next_steps.trim() || null,
        transcript: form.transcript.trim() || null
      };
      const key = `${batchId}-${sessionNumber}`;
      const existing = sessionMap[key];

      let result;
      if (existing) {
        result = await supabase
          .from("mentorship_sessions")
          .update({
            name: payload.name,
            description: payload.description,
            session_datetime,
            meet_link: payload.meet_link,
            recording_path: payload.recording_path,
            summary: payload.summary,
            next_steps: payload.next_steps,
            transcript: payload.transcript
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
    if (!window.confirm(`Delete session ${sessionNumber} for this batch?`))
      return;
    await supabase.from("mentorship_sessions").delete().eq("id", existing.id);
    onSessionsChange((prev) =>
      prev.filter(
        (s) => !(s.batch_id === batchId && s.session_number === sessionNumber)
      )
    );
    if (editingKey === key) setEditingKey(null);
  }

  if (batches.length === 0) {
    return (
      <p style={{ color: "#444" }}>no batches found — create a batch first</p>
    );
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
                background:
                  batch.status === "open" ? "rgba(34,197,94,0.15)" : "#1a1a1a",
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
                        <span className="text-sm font-semibold text-white flex-1">
                          {sess.name}
                        </span>
                        <span
                          className="text-xs flex-shrink-0"
                          style={{ color: "#555" }}
                        >
                          {(() => {
                            const d = new Date(sess.session_datetime);
                            return (
                              d.toLocaleString("en-IN", {
                                timeZone: "Asia/Kolkata",
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true
                              }) + " IST"
                            );
                          })()}
                        </span>
                      </>
                    ) : (
                      <span
                        className="text-xs flex-1"
                        style={{ color: "#444" }}
                      >
                        not added yet
                      </span>
                    )}

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() =>
                          isEditing
                            ? setEditingKey(null)
                            : openEdit(batch.id, num)
                        }
                        className="text-xs px-3 py-1 rounded-lg font-semibold transition-colors"
                        style={{
                          background: isEditing
                            ? "#222"
                            : "rgba(255,208,7,0.12)",
                          color: isEditing ? "#666" : Y
                        }}
                      >
                        {isEditing ? "cancel" : sess ? "edit" : "+ add"}
                      </button>
                      {sess && !isEditing && (
                        <button
                          onClick={() => handleDelete(batch.id, num)}
                          className="text-xs px-2 py-1 rounded-lg font-semibold"
                          style={{
                            background: "rgba(239,68,68,0.1)",
                            color: "#ef4444"
                          }}
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
                          <label
                            className="text-xs font-semibold mb-1 block"
                            style={{ color: "#666" }}
                          >
                            session name
                          </label>
                          <input
                            value={form.name}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, name: e.target.value }))
                            }
                            placeholder="e.g. discover"
                            className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
                            style={{
                              background: "#1a1a1a",
                              border: "1px solid #2a2a2a"
                            }}
                          />
                        </div>

                        {/* date */}
                        <div>
                          <label
                            className="text-xs font-semibold mb-1 block"
                            style={{ color: "#666" }}
                          >
                            date (IST)
                          </label>
                          <input
                            type="date"
                            value={form.date}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, date: e.target.value }))
                            }
                            className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
                            style={{
                              background: "#1a1a1a",
                              border: "1px solid #2a2a2a",
                              colorScheme: "dark"
                            }}
                          />
                        </div>

                        {/* time */}
                        <div>
                          <label
                            className="text-xs font-semibold mb-1 block"
                            style={{ color: "#666" }}
                          >
                            time IST (default 9:30 PM = 21:30)
                          </label>
                          <input
                            type="time"
                            value={form.time}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, time: e.target.value }))
                            }
                            className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
                            style={{
                              background: "#1a1a1a",
                              border: "1px solid #2a2a2a",
                              colorScheme: "dark"
                            }}
                          />
                        </div>

                        {/* google meet link */}
                        <div className="md:col-span-2">
                          <label
                            className="text-xs font-semibold mb-1 block"
                            style={{ color: "#666" }}
                          >
                            google meet link
                          </label>
                          <input
                            type="url"
                            value={form.meet_link}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                meet_link: e.target.value
                              }))
                            }
                            placeholder="https://meet.google.com/xxx-xxxx-xxx"
                            className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
                            style={{
                              background: "#1a1a1a",
                              border: "1px solid #2a2a2a"
                            }}
                          />
                          <p
                            className="text-[10px] mt-1"
                            style={{ color: "#444" }}
                          >
                            activates for users 30 min before the session
                          </p>
                        </div>

                        {/* recording URL */}
                        <div className="md:col-span-2">
                          <label
                            className="text-xs font-semibold mb-1 block"
                            style={{ color: "#666" }}
                          >
                            recording URL (Bunny.net / Vimeo / YouTube embed)
                          </label>
                          <input
                            type="url"
                            value={form.recording_path}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                recording_path: e.target.value
                              }))
                            }
                            placeholder="https://iframe.mediadelivery.net/embed/…"
                            className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
                            style={{
                              background: "#1a1a1a",
                              border: "1px solid #2a2a2a"
                            }}
                          />
                          <p
                            className="text-[10px] mt-1"
                            style={{ color: "#444" }}
                          >
                            paste the embed URL — appears in "past sessions" for
                            enrolled users
                          </p>
                        </div>
                      </div>

                      {/* description */}
                      <div>
                        <label
                          className="text-xs font-semibold mb-1 block"
                          style={{ color: "#666" }}
                        >
                          description
                        </label>
                        <textarea
                          value={form.description}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              description: e.target.value
                            }))
                          }
                          placeholder="what happens in this session?"
                          rows={3}
                          className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none resize-none"
                          style={{
                            background: "#1a1a1a",
                            border: "1px solid #2a2a2a",
                            fontFamily: "inherit"
                          }}
                        />
                      </div>

                      {/* summary */}
                      <div>
                        <label
                          className="text-xs font-semibold mb-1 block"
                          style={{ color: "#666" }}
                        >
                          session summary
                        </label>
                        <textarea
                          value={form.summary}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, summary: e.target.value }))
                          }
                          placeholder="brief summary of what was covered"
                          rows={3}
                          className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none resize-none"
                          style={{
                            background: "#1a1a1a",
                            border: "1px solid #2a2a2a",
                            fontFamily: "inherit"
                          }}
                        />
                      </div>

                      {/* next steps */}
                      <div>
                        <label
                          className="text-xs font-semibold mb-1 block"
                          style={{ color: "#666" }}
                        >
                          suggested next steps
                        </label>
                        <textarea
                          value={form.next_steps}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              next_steps: e.target.value
                            }))
                          }
                          placeholder="action items for participants"
                          rows={3}
                          className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none resize-none"
                          style={{
                            background: "#1a1a1a",
                            border: "1px solid #2a2a2a",
                            fontFamily: "inherit"
                          }}
                        />
                      </div>

                      {/* transcript */}
                      <div>
                        <label
                          className="text-xs font-semibold mb-1 block"
                          style={{ color: "#666" }}
                        >
                          transcript
                        </label>
                        <textarea
                          value={form.transcript}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              transcript: e.target.value
                            }))
                          }
                          placeholder="full session transcript (optional)"
                          rows={5}
                          className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none resize-none"
                          style={{
                            background: "#1a1a1a",
                            border: "1px solid #2a2a2a",
                            fontFamily: "inherit"
                          }}
                        />
                      </div>

                      {saveError && (
                        <p className="text-xs" style={{ color: "#ef4444" }}>
                          {saveError}
                        </p>
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

/* ═══════════════════════════════════════════════════════════════════════════
   AcceleratorTab — manage 1:1 bonus calls for accelerator plan users
═══════════════════════════════════════════════════════════════════════════ */
function AcceleratorTab({ batches, payments, profiles }) {
  const [bonuses, setBonuses] = useState([]);
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  // bonus editing: key = `${userId}-${batchId}`
  const [editingBonus, setEditingBonus] = useState(null);
  const [bonusForm, setBonusForm] = useState({
    booking_link: "",
    valid_until: "",
    total_calls: "4"
  });
  const [savingBonus, setSavingBonus] = useState(false);
  const [bonusError, setBonusError] = useState("");

  // call editing: callId (for existing) or `new-${bonusId}` (for new)
  const [editingCall, setEditingCall] = useState(null);
  const [callForm, setCallForm] = useState({
    date: "",
    time: "21:30",
    duration_minutes: "30",
    meeting_link: "",
    platform: "google meet",
    mentor_name: "",
    status: "scheduled"
  });
  const [savingCall, setSavingCall] = useState(false);
  const [callError, setCallError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [{ data: bData }, { data: cData }] = await Promise.all([
      supabaseAdmin.from("mentorship_accelerator_bonus").select("*"),
      supabaseAdmin
        .from("mentorship_1on1_calls")
        .select("*")
        .order("call_datetime", { ascending: true })
    ]);
    setBonuses(bData || []);
    setCalls(cData || []);
    setLoading(false);
  }

  // IST <-> UTC helpers (same as SessionsTab)
  function istToUtc(dateStr, timeStr) {
    const [h, m] = timeStr.split(":").map(Number);
    const d = new Date(`${dateStr}T00:00:00Z`);
    d.setUTCHours(h - 5, m - 30, 0, 0);
    return d.toISOString();
  }
  function utcToIst(dtStr) {
    if (!dtStr) return { date: "", time: "21:30" };
    const d = new Date(dtStr);
    const ist = new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
    const date = ist.toISOString().slice(0, 10);
    const hh = String(ist.getUTCHours()).padStart(2, "0");
    const mm = String(ist.getUTCMinutes()).padStart(2, "0");
    return { date, time: `${hh}:${mm}` };
  }
  function fmtCallDt(dtStr) {
    if (!dtStr) return "—";
    return (
      new Date(dtStr).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      }) + " IST"
    );
  }

  // ── Bonus actions ──────────────────────────────────────────────────────
  function openBonusEdit(userId, batchId) {
    const key = `${userId}-${batchId}`;
    const existing = bonuses.find(
      (b) => b.user_id === userId && b.batch_id === batchId
    );
    setBonusForm({
      booking_link: existing?.booking_link || "",
      valid_until: existing?.valid_until
        ? existing.valid_until.slice(0, 10)
        : "",
      total_calls: String(existing?.total_calls ?? 4)
    });
    setEditingBonus(key);
    setBonusError("");
    setEditingCall(null);
  }

  async function handleSaveBonus(userId, batchId) {
    if (!bonusForm.valid_until) {
      setBonusError("valid until date is required");
      return;
    }
    setSavingBonus(true);
    setBonusError("");
    const key = `${userId}-${batchId}`;
    const existing = bonuses.find(
      (b) => b.user_id === userId && b.batch_id === batchId
    );
    const payload = {
      user_id: userId,
      batch_id: batchId,
      booking_link: bonusForm.booking_link.trim() || null,
      valid_until: new Date(
        bonusForm.valid_until + "T23:59:59+05:30"
      ).toISOString(),
      total_calls: parseInt(bonusForm.total_calls, 10) || 4
    };
    try {
      let result;
      if (existing) {
        result = await supabaseAdmin
          .from("mentorship_accelerator_bonus")
          .update({
            booking_link: payload.booking_link,
            valid_until: payload.valid_until,
            total_calls: payload.total_calls
          })
          .eq("id", existing.id)
          .select()
          .single();
      } else {
        result = await supabaseAdmin
          .from("mentorship_accelerator_bonus")
          .insert(payload)
          .select()
          .single();
      }
      if (result.error) throw result.error;
      setBonuses((prev) => {
        const filtered = prev.filter(
          (b) => !(b.user_id === userId && b.batch_id === batchId)
        );
        return [...filtered, result.data];
      });
      setEditingBonus(null);
    } catch (err) {
      setBonusError(err.message || "save failed");
    } finally {
      setSavingBonus(false);
    }
  }

  async function handleDeleteBonus(bonusId) {
    if (
      !window.confirm(
        "Delete this bonus? All associated calls will also be deleted."
      )
    )
      return;
    await supabaseAdmin
      .from("mentorship_accelerator_bonus")
      .delete()
      .eq("id", bonusId);
    setBonuses((prev) => prev.filter((b) => b.id !== bonusId));
    setCalls((prev) => prev.filter((c) => c.bonus_id !== bonusId));
  }

  // ── Call actions ───────────────────────────────────────────────────────
  function openNewCall(bonusId) {
    const key = `new-${bonusId}`;
    setCallForm({
      date: "",
      time: "21:30",
      duration_minutes: "30",
      meeting_link: "",
      platform: "google meet",
      mentor_name: "",
      status: "scheduled"
    });
    setEditingCall(key);
    setCallError("");
    setEditingBonus(null);
  }

  function openEditCall(call) {
    const ist = utcToIst(call.call_datetime);
    setCallForm({
      date: ist.date,
      time: ist.time,
      duration_minutes: String(call.duration_minutes || 30),
      meeting_link: call.meeting_link || "",
      platform: call.platform || "google meet",
      mentor_name: call.mentor_name || "",
      status: call.status || "scheduled"
    });
    setEditingCall(call.id);
    setCallError("");
    setEditingBonus(null);
  }

  async function handleSaveCall(bonus) {
    if (!callForm.date || !callForm.time) {
      setCallError("date and time are required");
      return;
    }
    setSavingCall(true);
    setCallError("");
    const call_datetime = istToUtc(callForm.date, callForm.time);
    const payload = {
      bonus_id: bonus.id,
      user_id: bonus.user_id,
      batch_id: bonus.batch_id,
      call_datetime,
      duration_minutes: parseInt(callForm.duration_minutes, 10) || 30,
      meeting_link: callForm.meeting_link.trim() || null,
      platform: callForm.platform.trim() || "google meet",
      mentor_name: callForm.mentor_name.trim() || null,
      status: callForm.status
    };
    try {
      let result;
      const isNew = editingCall?.startsWith("new-");
      if (isNew) {
        result = await supabaseAdmin
          .from("mentorship_1on1_calls")
          .insert(payload)
          .select()
          .single();
      } else {
        result = await supabaseAdmin
          .from("mentorship_1on1_calls")
          .update({
            call_datetime,
            duration_minutes: payload.duration_minutes,
            meeting_link: payload.meeting_link,
            platform: payload.platform,
            mentor_name: payload.mentor_name,
            status: payload.status
          })
          .eq("id", editingCall)
          .select()
          .single();
      }
      if (result.error) throw result.error;
      setCalls((prev) => {
        const filtered = isNew
          ? prev
          : prev.filter((c) => c.id !== editingCall);
        return [...filtered, result.data].sort(
          (a, b) => new Date(a.call_datetime) - new Date(b.call_datetime)
        );
      });
      setEditingCall(null);
    } catch (err) {
      setCallError(err.message || "save failed");
    } finally {
      setSavingCall(false);
    }
  }

  async function handleDeleteCall(callId) {
    if (!window.confirm("Delete this 1:1 call?")) return;
    await supabaseAdmin.from("mentorship_1on1_calls").delete().eq("id", callId);
    setCalls((prev) => prev.filter((c) => c.id !== callId));
    if (editingCall === callId) setEditingCall(null);
  }

  // ── Helpers ────────────────────────────────────────────────────────────
  const accelPayments = payments.filter(
    (p) => p.plan === "accelerator" && p.status === "success"
  );

  const inputStyle = {
    background: "#1a1a1a",
    border: "1px solid #2a2a2a",
    colorScheme: "dark"
  };
  const labelStyle = { color: "#666" };
  const Input = ({
    label,
    type = "text",
    value,
    onChange,
    placeholder,
    ...rest
  }) => (
    <div>
      <label className="text-xs font-semibold mb-1 block" style={labelStyle}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
        style={inputStyle}
        {...rest}
      />
    </div>
  );

  if (loading)
    return (
      <div className="flex items-center gap-3 py-10" style={{ color: "#444" }}>
        <div
          className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: Y, borderTopColor: "transparent" }}
        />
        loading accelerator data…
      </div>
    );

  const batchesWithAccel = batches.filter((b) =>
    accelPayments.some((p) => p.batch_id === b.id)
  );

  if (batchesWithAccel.length === 0) {
    return (
      <p style={{ color: "#444" }}>
        no accelerator plan users found across any batch
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {batchesWithAccel.map((batch) => {
        const batchUsers = accelPayments.filter((p) => p.batch_id === batch.id);
        return (
          <div
            key={batch.id}
            className="rounded-xl border p-5 space-y-5"
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
                style={{ background: "rgba(223,5,134,0.15)", color: P }}
              >
                {batchUsers.length} accelerator{" "}
                {batchUsers.length === 1 ? "user" : "users"}
              </span>
            </div>

            {/* per-user cards */}
            <div className="space-y-4">
              {batchUsers.map((payment) => {
                const profile = profiles.find((p) => p.id === payment.user_id);
                const name = profile?.name || payment.user_id.slice(0, 8);
                const email = profile?.email || "—";
                const bonus = bonuses.find(
                  (b) =>
                    b.user_id === payment.user_id && b.batch_id === batch.id
                );
                const userCalls = bonus
                  ? calls.filter((c) => c.bonus_id === bonus.id)
                  : [];
                const activeCalls = userCalls.filter(
                  (c) => c.status !== "cancelled"
                );
                const bonusKey = `${payment.user_id}-${batch.id}`;
                const isEditingBonus = editingBonus === bonusKey;

                return (
                  <div
                    key={payment.user_id}
                    className="rounded-lg border"
                    style={{
                      background: "#0d0d0d",
                      borderColor: isEditingBonus ? P : "#1a1a1a"
                    }}
                  >
                    {/* user header row */}
                    <div className="flex items-center gap-3 px-4 py-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white">
                          {name}
                        </p>
                        <p className="text-xs" style={{ color: "#555" }}>
                          {email}
                        </p>
                      </div>
                      {bonus ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{
                              background: "rgba(34,197,94,0.12)",
                              color: "#22c55e"
                            }}
                          >
                            bonus set · {activeCalls.length}/{bonus.total_calls}{" "}
                            calls
                          </span>
                          <button
                            onClick={() =>
                              isEditingBonus
                                ? setEditingBonus(null)
                                : openBonusEdit(payment.user_id, batch.id)
                            }
                            className="text-xs px-3 py-1 rounded-lg font-semibold"
                            style={{
                              background: isEditingBonus
                                ? "#222"
                                : "rgba(223,5,134,0.12)",
                              color: isEditingBonus ? "#666" : P
                            }}
                          >
                            {isEditingBonus ? "cancel" : "edit bonus"}
                          </button>
                          <button
                            onClick={() => handleDeleteBonus(bonus.id)}
                            className="text-xs px-2 py-1 rounded-lg font-semibold"
                            style={{
                              background: "rgba(239,68,68,0.1)",
                              color: "#ef4444"
                            }}
                          >
                            del
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            openBonusEdit(payment.user_id, batch.id)
                          }
                          className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                          style={{
                            background: isEditingBonus
                              ? "#222"
                              : `rgba(255,208,7,0.12)`,
                            color: isEditingBonus ? "#666" : Y
                          }}
                        >
                          {isEditingBonus ? "cancel" : "+ set up bonus"}
                        </button>
                      )}
                    </div>

                    {/* bonus summary (when set, not editing) */}
                    {bonus && !isEditingBonus && (
                      <div
                        className="px-4 pb-3 flex flex-wrap gap-4 border-t"
                        style={{ borderColor: "#1a1a1a" }}
                      >
                        <div className="pt-2">
                          <p
                            className="text-[10px] uppercase tracking-wider mb-0.5"
                            style={{ color: "#555" }}
                          >
                            booking link
                          </p>
                          {bonus.booking_link ? (
                            <a
                              href={bonus.booking_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs"
                              style={{ color: Y }}
                            >
                              {bonus.booking_link.length > 50
                                ? bonus.booking_link.slice(0, 50) + "…"
                                : bonus.booking_link}
                            </a>
                          ) : (
                            <span className="text-xs" style={{ color: "#444" }}>
                              not set
                            </span>
                          )}
                        </div>
                        <div className="pt-2">
                          <p
                            className="text-[10px] uppercase tracking-wider mb-0.5"
                            style={{ color: "#555" }}
                          >
                            valid until
                          </p>
                          <p className="text-xs text-white">
                            {fmtDate(bonus.valid_until)}
                          </p>
                        </div>
                        <div className="pt-2">
                          <p
                            className="text-[10px] uppercase tracking-wider mb-0.5"
                            style={{ color: "#555" }}
                          >
                            calls
                          </p>
                          <p className="text-xs text-white">
                            {activeCalls.length} of {bonus.total_calls} booked
                          </p>
                        </div>
                      </div>
                    )}

                    {/* inline bonus edit form */}
                    {isEditingBonus && (
                      <div
                        className="px-4 pb-4 pt-3 border-t space-y-3"
                        style={{ borderColor: "#1a1a1a" }}
                      >
                        <p className="text-xs font-black" style={{ color: P }}>
                          accelerator bonus setup
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="md:col-span-2">
                            <Input
                              label="calendly / booking link"
                              value={bonusForm.booking_link}
                              onChange={(e) =>
                                setBonusForm((f) => ({
                                  ...f,
                                  booking_link: e.target.value
                                }))
                              }
                              placeholder="https://calendly.com/your-link"
                            />
                          </div>
                          <Input
                            label="valid until (date)"
                            type="date"
                            value={bonusForm.valid_until}
                            onChange={(e) =>
                              setBonusForm((f) => ({
                                ...f,
                                valid_until: e.target.value
                              }))
                            }
                          />
                          <Input
                            label="total calls"
                            type="number"
                            value={bonusForm.total_calls}
                            onChange={(e) =>
                              setBonusForm((f) => ({
                                ...f,
                                total_calls: e.target.value
                              }))
                            }
                            placeholder="4"
                          />
                        </div>
                        {bonusError && (
                          <p className="text-xs" style={{ color: "#ef4444" }}>
                            {bonusError}
                          </p>
                        )}
                        <button
                          onClick={() =>
                            handleSaveBonus(payment.user_id, batch.id)
                          }
                          disabled={savingBonus}
                          className="px-5 py-2 rounded-lg text-sm font-black"
                          style={{
                            background: savingBonus ? "#333" : P,
                            color: savingBonus ? "#666" : "#fff",
                            opacity: savingBonus ? 0.7 : 1
                          }}
                        >
                          {savingBonus
                            ? "saving…"
                            : bonus
                              ? "update bonus"
                              : "create bonus"}
                        </button>
                      </div>
                    )}

                    {/* calls section — only if bonus exists */}
                    {bonus && !isEditingBonus && (
                      <div
                        className="px-4 pb-4 border-t space-y-2"
                        style={{ borderColor: "#1a1a1a" }}
                      >
                        <div className="flex items-center justify-between pt-3">
                          <p
                            className="text-xs font-semibold"
                            style={{ color: "#888" }}
                          >
                            1:1 calls
                          </p>
                          <button
                            onClick={() =>
                              editingCall === `new-${bonus.id}`
                                ? setEditingCall(null)
                                : openNewCall(bonus.id)
                            }
                            className="text-xs px-3 py-1 rounded-lg font-semibold"
                            style={{
                              background:
                                editingCall === `new-${bonus.id}`
                                  ? "#222"
                                  : "rgba(255,208,7,0.12)",
                              color:
                                editingCall === `new-${bonus.id}` ? "#666" : Y
                            }}
                          >
                            {editingCall === `new-${bonus.id}`
                              ? "cancel"
                              : "+ add call"}
                          </button>
                        </div>

                        {/* existing calls */}
                        {userCalls.length === 0 &&
                          editingCall !== `new-${bonus.id}` && (
                            <p
                              className="text-xs py-2"
                              style={{ color: "#444" }}
                            >
                              no calls booked yet
                            </p>
                          )}
                        {userCalls.map((call) => (
                          <div
                            key={call.id}
                            className="rounded-lg border"
                            style={{
                              background: "#111",
                              borderColor: editingCall === call.id ? Y : "#222"
                            }}
                          >
                            <div className="flex items-center gap-3 px-3 py-2.5 flex-wrap">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-white">
                                  {fmtCallDt(call.call_datetime)}
                                </p>
                                <p
                                  className="text-[10px]"
                                  style={{ color: "#555" }}
                                >
                                  {call.duration_minutes}min · {call.platform}
                                  {call.mentor_name
                                    ? ` · ${call.mentor_name}`
                                    : ""}
                                </p>
                              </div>
                              <span
                                className="text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                                style={{
                                  background:
                                    call.status === "completed"
                                      ? "rgba(34,197,94,0.12)"
                                      : call.status === "cancelled"
                                        ? "rgba(239,68,68,0.1)"
                                        : "rgba(255,208,7,0.1)",
                                  color:
                                    call.status === "completed"
                                      ? "#22c55e"
                                      : call.status === "cancelled"
                                        ? "#ef4444"
                                        : Y
                                }}
                              >
                                {call.status}
                              </span>
                              <div className="flex gap-1.5 flex-shrink-0">
                                <button
                                  onClick={() =>
                                    editingCall === call.id
                                      ? setEditingCall(null)
                                      : openEditCall(call)
                                  }
                                  className="text-[10px] px-2.5 py-1 rounded-md font-semibold"
                                  style={{
                                    background:
                                      editingCall === call.id
                                        ? "#222"
                                        : "rgba(255,208,7,0.1)",
                                    color: editingCall === call.id ? "#666" : Y
                                  }}
                                >
                                  {editingCall === call.id ? "cancel" : "edit"}
                                </button>
                                <button
                                  onClick={() => handleDeleteCall(call.id)}
                                  className="text-[10px] px-2 py-1 rounded-md font-semibold"
                                  style={{
                                    background: "rgba(239,68,68,0.1)",
                                    color: "#ef4444"
                                  }}
                                >
                                  del
                                </button>
                              </div>
                            </div>
                            {/* inline call edit */}
                            {editingCall === call.id && (
                              <CallForm
                                form={callForm}
                                setForm={setCallForm}
                                onSave={() => handleSaveCall(bonus)}
                                saving={savingCall}
                                error={callError}
                                label="update call"
                                inputStyle={inputStyle}
                                labelStyle={labelStyle}
                              />
                            )}
                          </div>
                        ))}

                        {/* new call form */}
                        {editingCall === `new-${bonus.id}` && (
                          <div
                            className="rounded-lg border"
                            style={{ background: "#111", borderColor: Y }}
                          >
                            <CallForm
                              form={callForm}
                              setForm={setCallForm}
                              onSave={() => handleSaveCall(bonus)}
                              saving={savingCall}
                              error={callError}
                              label="add call"
                              inputStyle={inputStyle}
                              labelStyle={labelStyle}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CallForm({
  form,
  setForm,
  onSave,
  saving,
  error,
  label,
  inputStyle,
  labelStyle
}) {
  return (
    <div
      className="px-3 pb-3 pt-2 border-t space-y-3"
      style={{ borderColor: "#1a1a1a" }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label
            className="text-xs font-semibold mb-1 block"
            style={labelStyle}
          >
            date (IST)
          </label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
            style={inputStyle}
          />
        </div>
        <div>
          <label
            className="text-xs font-semibold mb-1 block"
            style={labelStyle}
          >
            time IST
          </label>
          <input
            type="time"
            value={form.time}
            onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
            className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
            style={inputStyle}
          />
        </div>
        <div>
          <label
            className="text-xs font-semibold mb-1 block"
            style={labelStyle}
          >
            duration (minutes)
          </label>
          <input
            type="number"
            value={form.duration_minutes}
            onChange={(e) =>
              setForm((f) => ({ ...f, duration_minutes: e.target.value }))
            }
            placeholder="30"
            className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
            style={inputStyle}
          />
        </div>
        <div>
          <label
            className="text-xs font-semibold mb-1 block"
            style={labelStyle}
          >
            platform
          </label>
          <input
            value={form.platform}
            onChange={(e) =>
              setForm((f) => ({ ...f, platform: e.target.value }))
            }
            placeholder="google meet"
            className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
            style={inputStyle}
          />
        </div>
        <div className="md:col-span-2">
          <label
            className="text-xs font-semibold mb-1 block"
            style={labelStyle}
          >
            meeting link
          </label>
          <input
            type="url"
            value={form.meeting_link}
            onChange={(e) =>
              setForm((f) => ({ ...f, meeting_link: e.target.value }))
            }
            placeholder="https://meet.google.com/xxx-xxxx-xxx"
            className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
            style={inputStyle}
          />
        </div>
        <div>
          <label
            className="text-xs font-semibold mb-1 block"
            style={labelStyle}
          >
            mentor name
          </label>
          <input
            value={form.mentor_name}
            onChange={(e) =>
              setForm((f) => ({ ...f, mentor_name: e.target.value }))
            }
            placeholder="e.g. Yagnesh"
            className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
            style={inputStyle}
          />
        </div>
        <div>
          <label
            className="text-xs font-semibold mb-1 block"
            style={labelStyle}
          >
            status
          </label>
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
            style={inputStyle}
          >
            <option value="scheduled">scheduled</option>
            <option value="completed">completed</option>
            <option value="cancelled">cancelled</option>
          </select>
        </div>
      </div>
      {error && (
        <p className="text-xs" styloke={{ color: "#ef4444" }}>
          {error}
        </p>
      )}
      <button
        onClick={onSave}
        disabled={saving}
        className="px-5 py-2 rounded-lg text-sm font-black"
        style={{
          background: saving ? "#333" : Y,
          color: saving ? "#666" : "#000",
          opacity: saving ? 0.7 : 1
        }}
      >
        {saving ? "saving…" : label}
      </button>
    </div>
  );
}
