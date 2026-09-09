import { useState } from "react";
import { supabase } from "../../../supabaseClient";

export function DocRow({ icon, label, value, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4 text-left hover:bg-white/[0.04] transition-colors"
    >
      <span className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center text-white/50 flex-shrink-0">
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <p className="text-white text-sm font-bold">{label}</p>
        <p className="text-white/35 text-xs mt-0.5 truncate">{value || "Not added yet"}</p>
      </span>
      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="text-white/30 flex-shrink-0">
        <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function DocEditModal({ title, placeholder, value, onSave, onClose }) {
  const [val, setVal] = useState(value || "");
  const [saving, setSaving] = useState(false);
  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-evolve-black/70" onClick={onClose} />
      <div
        className="relative w-full max-w-sm rounded-3xl border border-white/10 px-6 py-6 flex flex-col gap-4"
        style={{ backgroundColor: "#1c1c1f" }}
      >
        <h3 className="text-white font-bold text-lg">{title}</h3>
        <input
          type="text"
          value={val}
          placeholder={placeholder}
          onChange={(e) => setVal(e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 outline-none border border-white/15 focus:border-evolve-yellow/60 transition-colors"
          style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
        />
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-white/20 text-white font-bold text-sm rounded-2xl py-3 active:opacity-80"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              setSaving(true);
              await onSave(val.trim());
              setSaving(false);
            }}
            disabled={saving}
            className="flex-1 bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl py-3 disabled:opacity-40 active:opacity-80"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

const RESOURCES = [
  { key: "colour-theory", title: "Colour theory in movies", desc: "A quick watch on mood + palette" },
  { key: "ny-subway", title: "New York subway system", desc: "A case study in wayfinding design" },
  { key: "creative-confidence", title: "Creative confidence", desc: "The book worth the hype" }
];

/**
 * "My docs" (portfolio/resume/walkthrough, editable inline against the
 * shared mentorship_intake row) + the static resources list — shared by
 * every per-slot page (MentorshipSessionPage.jsx, MentorshipCallPage.jsx,
 * MentorshipAllRecordings.jsx) so this ~150-line block isn't duplicated
 * three times.
 */
export function MentorshipDocsAndResources({ user, intake, onIntakeUpdated }) {
  const [editingField, setEditingField] = useState(null);

  async function saveIntakeField(field, value) {
    const { data, error } = await supabase
      .from("mentorship_intake")
      .update({ [field]: value })
      .eq("user_id", user.id)
      .select()
      .single();
    setEditingField(null);
    if (!error) onIntakeUpdated(data);
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        <p className="text-white font-bold text-sm">My docs</p>
        <DocRow
          icon={
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M6 2.5h6l4 4V17a1 1 0 01-1 1H6a1 1 0 01-1-1V3.5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          }
          label="Portfolio"
          value={intake?.portfolio_value}
          onClick={() => intake?.portfolio_mode === "link" && setEditingField("portfolio_value")}
        />
        <DocRow
          icon={
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M6 9a3 3 0 016 0v4a3 3 0 01-6 0V6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          }
          label="Resume"
          value={intake?.resume_link}
          onClick={() => setEditingField("resume_link")}
        />
        <DocRow
          icon={
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <rect x="2.5" y="5.5" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
              <path d="M12.5 8.5L17 6v8l-4.5-2.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
          }
          label="Walkthrough recording"
          value={intake?.walkthrough_link}
          onClick={() => setEditingField("walkthrough_link")}
        />
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-white font-bold text-sm mb-2">While you wait, here are some resources</p>
        <div className="flex flex-col divide-y divide-white/5">
          {RESOURCES.map((r) => (
            <div key={r.key} className="flex items-center gap-3 py-3.5">
              <span className="w-4 h-4 text-evolve-yellow flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M8 12l4-4M9 5l1-1a3 3 0 014 4l-1 1M11 15l-1 1a3 3 0 01-4-4l1-1"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span>
                <p className="text-white text-sm font-bold">{r.title}</p>
                <p className="text-white/35 text-xs mt-0.5">{r.desc}</p>
              </span>
            </div>
          ))}
        </div>
      </div>

      {editingField === "resume_link" && (
        <DocEditModal
          title="Resume link"
          placeholder="https://drive.google.com/..."
          value={intake?.resume_link}
          onClose={() => setEditingField(null)}
          onSave={(v) => saveIntakeField("resume_link", v)}
        />
      )}
      {editingField === "walkthrough_link" && (
        <DocEditModal
          title="Walkthrough recording"
          placeholder="https://loom.com/share.."
          value={intake?.walkthrough_link}
          onClose={() => setEditingField(null)}
          onSave={(v) => saveIntakeField("walkthrough_link", v)}
        />
      )}
      {editingField === "portfolio_value" && (
        <DocEditModal
          title="Portfolio link"
          placeholder="https://..."
          value={intake?.portfolio_value}
          onClose={() => setEditingField(null)}
          onSave={(v) => saveIntakeField("portfolio_value", v)}
        />
      )}
    </>
  );
}
