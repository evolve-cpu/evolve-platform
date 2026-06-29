import { useState } from "react";
import { createPortal } from "react-dom";
import { supabaseAdmin } from "../../supabaseAdminClient";

const Y = "#FFD007";
const P = "#DF0586";

/* ── Tiny helpers ─────────────────────────────────────────────────────────── */

function Label({ children }) {
  return (
    <span
      className="text-[10px] font-black uppercase tracking-widest"
      style={{ color: "#555" }}
    >
      {children}
    </span>
  );
}

function Field({ label, value, onChange, multiline = false, rows = 3 }) {
  const style = {
    background: "#111",
    border: "1px solid #2a2a2a",
    color: "#fff",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 13,
    width: "100%",
    resize: multiline ? "vertical" : "none",
    outline: "none",
    fontFamily: "inherit",
  };
  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      {multiline ? (
        <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} style={style} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} style={style} />
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-3"
      style={{ background: "#0d0d0d", border: "1px solid #1e1e1e" }}
    >
      <p className="text-xs font-black uppercase tracking-widest" style={{ color: P }}>
        {title}
      </p>
      {children}
    </div>
  );
}

/* ── deep-clone safe setter helper ──────────────────────────────────────── */
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

/* ── AIReportModal ───────────────────────────────────────────────────────── */

export default function AIReportModal({ review, onClose, onSaved, onRegenerate }) {
  const [report, setReport] = useState(() =>
    review.ai_report ? JSON.parse(JSON.stringify(review.ai_report)) : {}
  );
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

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
      setTimeout(() => setSaveMsg(""), 2000);
    }
  };

  const m = report.metrics || {};
  const wy = report.where_you_are || {};
  const ww = report.working_well || [];
  const hb = report.holding_back || {};
  const fn = report.focus_next || [];

  const METRIC_KEYS = [
    { key: "first_impression", label: "first impression" },
    { key: "project_depth", label: "project depth" },
    { key: "stack_breadth", label: "stack breadth" },
    { key: "direction_clarity", label: "direction clarity" },
  ];

  const HB_SECTIONS = [
    { key: "portfolio_gaps", label: "portfolio & project gaps" },
    { key: "thinking_gaps", label: "thinking & process gaps" },
    { key: "positioning_gaps", label: "positioning & direction gaps" },
  ];

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
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: "1px solid #1a1a1a" }}
        >
          <div>
            <p className="text-white font-black text-base">
              AI report — {review.name}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#555" }}>
              {report.generated_at
                ? `generated ${new Date(report.generated_at).toLocaleString()}`
                : "draft"}
              {report.portfolio_scraped && (
                <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
                  portfolio scraped
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onRegenerate && (
              <button
                onClick={() => { onClose(); onRegenerate(review); }}
                className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                style={{ background: "#161616", border: "1px solid #333", color: "#888" }}
              >
                regenerate
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-xs px-4 py-1.5 rounded-lg font-black"
              style={{ background: Y, color: "#000" }}
            >
              {saving ? "saving…" : saveMsg === "saved" ? "saved ✓" : "save edits"}
            </button>
            {saveMsg && saveMsg !== "saved" && (
              <p className="text-xs" style={{ color: "#f87171" }}>{saveMsg}</p>
            )}
            <button
              onClick={onClose}
              className="text-xs px-3 py-1.5 rounded-lg"
              style={{ background: "#161616", border: "1px solid #222", color: "#666" }}
            >
              ✕ close
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-6 flex flex-col gap-5">

          {/* Student */}
          <Section title="student">
            <Field label="name" value={report.student?.name || ""} onChange={(v) => upd("student.name", v)} />
            <Field label="tagline" value={report.student?.tagline || ""} onChange={(v) => upd("student.tagline", v)} />
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
                <div key={key} className="flex flex-col gap-2 p-3 rounded-lg" style={{ background: "#111", border: "1px solid #1e1e1e" }}>
                  <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: Y }}>{label}</p>
                  <Field label="label (one word)" value={m[key]?.label || ""} onChange={(v) => upd(`metrics.${key}.label`, v)} />
                  <Field label="description (max 8 words)" value={m[key]?.description || ""} onChange={(v) => upd(`metrics.${key}.description`, v)} />
                </div>
              ))}
            </div>
          </Section>

          {/* Where you are */}
          <Section title="02 where you are right now">
            <Field label="stage" value={wy.stage || ""} onChange={(v) => upd("where_you_are.stage", v)} />
            <Field label="strength" value={wy.strength || ""} onChange={(v) => upd("where_you_are.strength", v)} />
            <Field label="role fit" value={wy.role_fit || ""} onChange={(v) => upd("where_you_are.role_fit", v)} />
            <Field label="summary" value={wy.summary || ""} onChange={(v) => upd("where_you_are.summary", v)} multiline rows={4} />
          </Section>

          {/* What is working well */}
          <Section title="03 what is working well">
            {(ww.length > 0 ? ww : [{}, {}, {}]).map((pt, i) => (
              <div key={i} className="flex flex-col gap-2 p-3 rounded-lg" style={{ background: "#111", border: "1px solid #1e1e1e" }}>
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#555" }}>point {i + 1}</p>
                <Field label="title" value={pt.title || ""} onChange={(v) => updArr("working_well", i, "title", v)} />
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
                      multiline
                      rows={2}
                    />
                  ))}
                </div>
              </div>
            ))}
          </Section>

          {/* Focus next */}
          <Section title="05 what you should focus on next">
            {(fn.length > 0 ? fn : [{}, {}, {}, {}]).map((pr, i) => (
              <div key={i} className="flex flex-col gap-2 p-3 rounded-lg" style={{ background: "#111", border: "1px solid #1e1e1e" }}>
                <div className="flex items-center gap-3">
                  <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#555" }}>priority {(pr.number || String(i + 1).padStart(2, "0"))}</p>
                  <select
                    value={pr.timing || "now"}
                    onChange={(e) => updArr("focus_next", i, "timing", e.target.value)}
                    style={{ background: "#1a1a1a", border: "1px solid #333", color: pr.timing === "now" ? Y : "#888", borderRadius: 6, padding: "2px 8px", fontSize: 11 }}
                  >
                    <option value="now">now</option>
                    <option value="soon">soon</option>
                  </select>
                </div>
                <Field label="action" value={pr.action || ""} onChange={(v) => updArr("focus_next", i, "action", v)} multiline rows={3} />
              </div>
            ))}
          </Section>

          {/* What this means + Where to go */}
          <Section title="06 what this means">
            <Field label="content" value={report.what_this_means || ""} onChange={(v) => upd("what_this_means", v)} multiline rows={4} />
          </Section>

          <Section title="07 where to go from here">
            <Field label="content" value={report.where_to_go || ""} onChange={(v) => upd("where_to_go", v)} multiline rows={4} />
          </Section>

          {/* Bottom save bar */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-lg font-black text-sm"
              style={{ background: Y, color: "#000" }}
            >
              {saving ? "saving…" : "save edits"}
            </button>
            {saveMsg && (
              <p className="text-sm self-center" style={{ color: saveMsg === "saved" ? "#22c55e" : "#f87171" }}>
                {saveMsg}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
