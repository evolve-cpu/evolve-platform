import { useState } from "react";
import { createPortal } from "react-dom";
import { supabaseAdmin } from "../../supabaseAdminClient";

const SUPABASE_URL              = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY         = import.meta.env.VITE_SUPABASE_ANON_KEY;
const BREVO_PORTFOLIO_TEMPLATE_ID = import.meta.env.VITE_BREVO_PORTFOLIO_TEMPLATE_ID;

const Y = "#FFD007";
const P = "#DF0586";

/* ── PDF generation via @react-pdf/renderer ─────────────────────────────
   No DOM, no html2canvas — uses its own PDF layout engine.
   Returns a Blob (application/pdf).                                        */

async function generatePDFBlob(report, review) {
  const [{ pdf }, { default: Template }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("./PortfolioReviewPDFTemplate"),
  ]);
  return pdf(<Template report={report} review={review} />).toBlob();
}

/* ── Tiny UI helpers ─────────────────────────────────────────────────────── */

function Label({ children }) {
  return (
    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#555" }}>
      {children}
    </span>
  );
}

function Field({ label, value, onChange, multiline = false, rows = 3 }) {
  const style = {
    background: "#111", border: "1px solid #2a2a2a", color: "#fff",
    borderRadius: 8, padding: "8px 12px", fontSize: 13, width: "100%",
    resize: multiline ? "vertical" : "none", outline: "none", fontFamily: "inherit",
  };
  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      {multiline
        ? <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} style={style} />
        : <input type="text" value={value} onChange={(e) => onChange(e.target.value)} style={style} />
      }
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: "#0d0d0d", border: "1px solid #1e1e1e" }}>
      <p className="text-xs font-black uppercase tracking-widest" style={{ color: P }}>{title}</p>
      {children}
    </div>
  );
}

function set(obj, path, value) {
  const keys = path.split(".");
  const clone = JSON.parse(JSON.stringify(obj));
  let cur = clone;
  for (let i = 0; i < keys.length - 1; i++) {
    if (cur[keys[i]] === undefined) cur[keys[i]] = {};
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = value;
  return clone;
}

/* ── PDF status label ────────────────────────────────────────────────────── */
const PDF_LABELS = {
  idle:       null,
  generating: "generating pdf…",
  uploading:  "uploading…",
  sending:    "sending email…",
  done:       "sent ✓",
  error:      null,
};

/* ── Main modal component ────────────────────────────────────────────────── */

export default function AIReportModal({ review, onClose, onSaved, onRegenerate, onReportSent }) {
  const [report, setReport] = useState(() =>
    review.ai_report ? JSON.parse(JSON.stringify(review.ai_report)) : {}
  );
  const [saving,   setSaving]   = useState(false);
  const [saveMsg,  setSaveMsg]  = useState("");
  const [pdfState, setPdfState] = useState("idle");
  const [pdfMsg,   setPdfMsg]   = useState("");

  /* ── state helpers ── */
  const upd = (path, value) => setReport((prev) => set(prev, path, value));

  const updArr = (key, index, field, value) => {
    setReport((prev) => {
      const clone = JSON.parse(JSON.stringify(prev));
      if (!Array.isArray(clone[key])) clone[key] = [];
      if (!clone[key][index]) clone[key][index] = {};
      clone[key][index][field] = value;
      return clone;
    });
  };

  const updHoldingBack = (section, index, value) => {
    setReport((prev) => {
      const clone = JSON.parse(JSON.stringify(prev));
      if (!clone.holding_back) clone.holding_back = {};
      if (!Array.isArray(clone.holding_back[section])) clone.holding_back[section] = [];
      clone.holding_back[section][index] = value;
      return clone;
    });
  };

  /* ── save edits ── */
  const handleSave = async () => {
    setSaving(true);
    setSaveMsg("");
    const { error } = await supabaseAdmin
      .from("portfolio_reviews")
      .update({ ai_report: report })
      .eq("id", review.id);
    setSaving(false);
    if (error) {
      setSaveMsg("save failed: " + error.message);
    } else {
      setSaveMsg("saved");
      onSaved?.({ ...review, ai_report: report });
      setTimeout(() => setSaveMsg(""), 2500);
    }
  };

  /* ── download PDF only ── */
  const handleDownloadPDF = async () => {
    setPdfState("generating");
    setPdfMsg("");
    try {
      const blob = await generatePDFBlob(report, review);
      const slug = (review.name || "report").toLowerCase().replace(/\s+/g, "-");
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `portfolio-review-${slug}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setPdfState("idle");
    } catch (err) {
      setPdfState("error");
      setPdfMsg(err.message || "PDF generation failed");
    }
  };

  /* ── generate → upload → send ── */
  const handleGenerateAndSend = async () => {
    setPdfState("generating");
    setPdfMsg("");
    try {
      // 1. Generate PDF blob
      const pdfBlob = await generatePDFBlob(report, review);
      const pdfFile = new File([pdfBlob], `${review.id}.pdf`, { type: "application/pdf" });

      // 2. Upload to Supabase Storage
      setPdfState("uploading");
      const path = `${review.user_id}/${review.id}.pdf`;
      const { error: upErr } = await supabaseAdmin.storage
        .from("review-reports")
        .upload(path, pdfFile, { upsert: true, contentType: "application/pdf" });
      if (upErr) throw new Error(upErr.message);

      const { data: urlData } = supabaseAdmin.storage
        .from("review-reports")
        .getPublicUrl(path);
      const reportUrl = urlData?.publicUrl;

      // 3. Update portfolio_reviews row
      const { error: dbErr } = await supabaseAdmin
        .from("portfolio_reviews")
        .update({ review_report_url: reportUrl, review_status: "done" })
        .eq("id", review.id);
      if (dbErr) throw new Error(dbErr.message);

      // 4. Send email via edge function (with PDF attachment)
      setPdfState("sending");
      const res = await fetch(`${SUPABASE_URL}/functions/v1/send-review-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          "apikey": SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          to_email: review.email,
          to_name:  review.name,
          report_url: reportUrl,
          template_id: BREVO_PORTFOLIO_TEMPLATE_ID,
          remarks: "",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.message || `email failed (${res.status})`);
      }

      setPdfState("done");
      setPdfMsg("sent ✓");
      onReportSent?.({ ...review, review_report_url: reportUrl, review_status: "done" });
    } catch (err) {
      setPdfState("error");
      setPdfMsg(err.message || "failed");
    }
  };

  const pdfBusy = ["generating", "uploading", "sending"].includes(pdfState);

  /* ── local shortcuts ── */
  const m  = report.metrics          || {};
  const wy = report.where_you_are    || {};
  const ww = report.working_well     || [];
  const hb = report.holding_back     || {};
  const fn = report.focus_next       || [];

  const METRIC_KEYS = [
    { key: "first_impression",  label: "first impression"  },
    { key: "project_depth",     label: "project depth"     },
    { key: "stack_breadth",     label: "stack breadth"     },
    { key: "direction_clarity", label: "direction clarity" },
  ];

  const HB_SECTIONS = [
    { key: "portfolio_gaps",    label: "portfolio & project gaps"     },
    { key: "thinking_gaps",     label: "thinking & process gaps"      },
    { key: "positioning_gaps",  label: "positioning & direction gaps" },
  ];

  /* ── render ── */
  const modal = (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative flex flex-col w-full max-w-3xl max-h-[92vh] rounded-2xl overflow-hidden"
        style={{ background: "#0a0a0a", border: "1px solid #222" }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0 gap-3 flex-wrap"
          style={{ borderBottom: "1px solid #1a1a1a" }}
        >
          {/* Left: name + meta */}
          <div className="min-w-0">
            <p className="text-white font-black text-base truncate">AI report — {review.name}</p>
            <p className="text-xs mt-0.5 flex items-center gap-2 flex-wrap" style={{ color: "#555" }}>
              {report.generated_at
                ? `generated ${new Date(report.generated_at).toLocaleString()}`
                : "draft"}
              {report.portfolio_scraped && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
                  portfolio scraped
                </span>
              )}
              {pdfState === "done" && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                  style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e" }}>
                  {pdfMsg}
                </span>
              )}
              {pdfState === "error" && pdfMsg && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                  style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}>
                  {pdfMsg}
                </span>
              )}
            </p>
          </div>

          {/* Right: action buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* Regenerate */}
            {onRegenerate && (
              <button
                onClick={() => { onClose(); onRegenerate(review); }}
                className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                style={{ background: "#161616", border: "1px solid #333", color: "#888" }}
              >
                regenerate
              </button>
            )}

            {/* Save edits */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-xs px-4 py-1.5 rounded-lg font-black"
              style={{ background: "#1a1a1a", border: `1px solid ${Y}`, color: Y }}
            >
              {saving ? "saving…" : saveMsg === "saved" ? "saved ✓" : "save edits"}
            </button>
            {saveMsg && saveMsg !== "saved" && (
              <p className="text-xs" style={{ color: "#f87171" }}>{saveMsg}</p>
            )}

            {/* Download PDF */}
            <button
              onClick={handleDownloadPDF}
              disabled={pdfBusy}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold"
              style={{ background: "#161616", border: "1px solid #333", color: pdfBusy ? "#444" : "#aaa" }}
            >
              {pdfState === "generating" ? "generating…" : "↓ pdf"}
            </button>

            {/* Generate & Send */}
            <button
              onClick={handleGenerateAndSend}
              disabled={pdfBusy || pdfState === "done"}
              className="text-xs px-4 py-1.5 rounded-lg font-black"
              style={{
                background: pdfBusy ? "#333" : pdfState === "done" ? "rgba(34,197,94,0.15)" : P,
                color: pdfBusy ? "#666" : pdfState === "done" ? "#22c55e" : "#fff",
                opacity: pdfBusy ? 0.7 : 1,
              }}
            >
              {pdfBusy
                ? (PDF_LABELS[pdfState] ?? "working…")
                : pdfState === "done"
                  ? "sent ✓"
                  : "generate & send"}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="text-xs px-3 py-1.5 rounded-lg"
              style={{ background: "#161616", border: "1px solid #222", color: "#666" }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1 p-6 flex flex-col gap-5">

          {/* Student */}
          <Section title="student">
            <Field label="name"     value={report.student?.name    || ""} onChange={(v) => upd("student.name",    v)} />
            <Field label="tagline"  value={report.student?.tagline || ""} onChange={(v) => upd("student.tagline", v)} />
            <Field
              label="tags (comma separated)"
              value={Array.isArray(report.student?.tags) ? report.student.tags.join(", ") : ""}
              onChange={(v) => upd("student.tags", v.split(",").map((t) => t.trim()).filter(Boolean))}
            />
          </Section>

          {/* Metrics */}
          <Section title="01 metrics">
            <div className="grid grid-cols-2 gap-3">
              {METRIC_KEYS.map(({ key, label }) => (
                <div key={key} className="flex flex-col gap-2 p-3 rounded-lg"
                  style={{ background: "#111", border: "1px solid #1e1e1e" }}>
                  <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: Y }}>{label}</p>
                  <Field label="label (one word)"        value={m[key]?.label       || ""} onChange={(v) => upd(`metrics.${key}.label`,       v)} />
                  <Field label="description (max 8 words)" value={m[key]?.description || ""} onChange={(v) => upd(`metrics.${key}.description`, v)} />
                </div>
              ))}
            </div>
          </Section>

          {/* Where you are */}
          <Section title="02 where you are right now">
            <Field label="stage"    value={wy.stage    || ""} onChange={(v) => upd("where_you_are.stage",    v)} />
            <Field label="strength" value={wy.strength || ""} onChange={(v) => upd("where_you_are.strength", v)} />
            <Field label="role fit" value={wy.role_fit || ""} onChange={(v) => upd("where_you_are.role_fit", v)} />
            <Field label="summary"  value={wy.summary  || ""} onChange={(v) => upd("where_you_are.summary",  v)} multiline rows={4} />
          </Section>

          {/* What is working well */}
          <Section title="03 what is working well">
            {(ww.length > 0 ? ww : [{}, {}, {}]).map((pt, i) => (
              <div key={i} className="flex flex-col gap-2 p-3 rounded-lg"
                style={{ background: "#111", border: "1px solid #1e1e1e" }}>
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#555" }}>point {i + 1}</p>
                <Field label="title"       value={pt.title       || ""} onChange={(v) => updArr("working_well", i, "title",       v)} />
                <Field label="description" value={pt.description || ""} onChange={(v) => updArr("working_well", i, "description", v)} multiline rows={3} />
              </div>
            ))}
          </Section>

          {/* Holding back */}
          <Section title="04 what is holding you back">
            {HB_SECTIONS.map(({ key, label }) => (
              <div key={key}>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "#555" }}>{label}</p>
                <div className="flex flex-col gap-2">
                  {((hb[key] || []).length > 0 ? hb[key] : ["", "", ""]).map((item, i) => (
                    <Field
                      key={i}
                      label={`gap ${i + 1}`}
                      value={item}
                      onChange={(v) => updHoldingBack(key, i, v)}
                      multiline rows={2}
                    />
                  ))}
                </div>
              </div>
            ))}
          </Section>

          {/* Focus next */}
          <Section title="05 what you should focus on next">
            {(fn.length > 0 ? fn : [{}, {}, {}, {}]).map((pr, i) => (
              <div key={i} className="flex flex-col gap-2 p-3 rounded-lg"
                style={{ background: "#111", border: "1px solid #1e1e1e" }}>
                <div className="flex items-center gap-3">
                  <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#555" }}>
                    priority {pr.number || String(i + 1).padStart(2, "0")}
                  </p>
                  <select
                    value={pr.timing || "now"}
                    onChange={(e) => updArr("focus_next", i, "timing", e.target.value)}
                    style={{ background: "#1a1a1a", border: "1px solid #333",
                      color: pr.timing === "now" ? Y : "#888", borderRadius: 6, padding: "2px 8px", fontSize: 11 }}
                  >
                    <option value="now">now</option>
                    <option value="soon">soon</option>
                  </select>
                </div>
                <Field label="action" value={pr.action || ""} onChange={(v) => updArr("focus_next", i, "action", v)} multiline rows={3} />
              </div>
            ))}
          </Section>

          {/* What this means */}
          <Section title="06 what this means">
            <Field label="content" value={report.what_this_means || ""} onChange={(v) => upd("what_this_means", v)} multiline rows={4} />
          </Section>

          {/* Where to go */}
          <Section title="07 where to go from here">
            <Field label="content" value={report.where_to_go || ""} onChange={(v) => upd("where_to_go", v)} multiline rows={4} />
          </Section>

          {/* Bottom action bar */}
          <div className="flex items-center justify-between gap-3 pt-2 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadPDF}
                disabled={pdfBusy}
                className="px-4 py-2 rounded-lg font-semibold text-sm"
                style={{ background: "#161616", border: "1px solid #333", color: pdfBusy ? "#444" : "#aaa" }}
              >
                {pdfState === "generating" ? "generating…" : "↓ download pdf"}
              </button>

              {pdfState === "error" && pdfMsg && (
                <p className="text-xs" style={{ color: "#f87171" }}>{pdfMsg}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 rounded-lg font-black text-sm"
                style={{ background: "#1a1a1a", border: `1px solid ${Y}`, color: Y }}
              >
                {saving ? "saving…" : "save edits"}
              </button>

              <button
                onClick={handleGenerateAndSend}
                disabled={pdfBusy || pdfState === "done"}
                className="px-5 py-2 rounded-lg font-black text-sm"
                style={{
                  background: pdfBusy ? "#333" : pdfState === "done" ? "rgba(34,197,94,0.15)" : P,
                  color: pdfBusy ? "#666" : pdfState === "done" ? "#22c55e" : "#fff",
                  opacity: pdfBusy ? 0.7 : 1,
                }}
              >
                {pdfBusy
                  ? (PDF_LABELS[pdfState] ?? "working…")
                  : pdfState === "done"
                    ? "sent ✓"
                    : "generate & send"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
