import { useState } from "react";
import { supabase } from "../../../supabaseClient";

function SkillDots({ value = 0, onChange }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n === value ? 0 : n)}
          aria-label={`rate ${n}`}
          className={`w-4 h-4 rounded-full border transition-colors ${
            n <= value
              ? "bg-evolve-yellow border-evolve-yellow"
              : "border-white/25 hover:border-white/50"
          }`}
        />
      ))}
    </div>
  );
}

/**
 * A skill-tracker self-assessment form — full-width, replaces the center
 * pane while open. Generic over which tracker it is: Session 1's
 * "Foundation skill tracker" (mentorship_skill_tracker, skillTrackerTaxonomy
 * .js) and Session 2's "Stream skill tracker" (mentorship_stream_skill_
 * tracker, streamSkillTrackerTaxonomy.js) both render through this same
 * component, just with different `table`/`title`/`subtitle`/`categories`
 * props — see MentorshipWorkspaceShell.jsx for how each is opened.
 * `submitted_at` on the target table is what gates that session's "Join
 * session" button / marks the tracker as done in "Your skill trackers".
 */
export default function MentorshipSkillTracker({
  user,
  table,
  title,
  subtitle,
  categories,
  initialRatings,
  onCancel,
  onSaved
}) {
  const [ratings, setRatings] = useState(initialRatings || {});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function setRating(skillId, field, value) {
    setRatings((prev) => ({
      ...prev,
      [skillId]: { ...prev[skillId], [field]: value }
    }));
  }

  async function handleSave() {
    if (!user?.id) return;
    setSaving(true);
    setError("");
    const submittedAt = new Date().toISOString();
    const { data, error: saveError } = await supabase
      .from(table)
      .upsert(
        { user_id: user.id, ratings, submitted_at: submittedAt },
        { onConflict: "user_id" }
      )
      .select()
      .single();
    setSaving(false);
    if (saveError) {
      setError("Couldn't save that — please try again.");
      return;
    }
    onSaved(data);
  }

  return (
    <div className="flex-1 flex flex-col gap-6">
      <button
        onClick={onCancel}
        className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm font-semibold w-fit transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <path
            d="M12.5 15L7.5 10L12.5 5"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back
      </button>

      <div>
        <h1
          className="text-white font-bold font-bricolage"
          style={{ fontSize: "clamp(22px,3.5vw,28px)", letterSpacing: "-0.02em" }}
        >
          {title}
        </h1>
        <p className="text-white/50 text-sm mt-2 max-w-xl">{subtitle}</p>
      </div>

      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <div className="hidden md:grid grid-cols-[1fr_140px_140px] gap-4 px-5 py-3 bg-white/[0.03] text-white/40 text-[10px] font-bold uppercase tracking-wide">
          <span>skill</span>
          <span>current level</span>
          <span>goal level</span>
        </div>
        {categories.map((cat) => (
          <div key={cat.heading}>
            <p className="bg-evolve-yellow/10 text-evolve-yellow text-xs font-bold uppercase tracking-wide px-5 py-2.5">
              {cat.heading}
            </p>
            {cat.skills.map((skill) => (
              <div
                key={skill.id}
                className="grid grid-cols-1 md:grid-cols-[1fr_140px_140px] gap-2 md:gap-4 px-5 py-3 border-t border-white/5 md:items-center"
              >
                <span className="text-white/70 text-sm">{skill.label}</span>
                <div className="flex md:block items-center gap-2">
                  <span className="md:hidden text-white/30 text-[10px] uppercase tracking-wide w-16 flex-shrink-0">
                    current
                  </span>
                  <SkillDots
                    value={ratings[skill.id]?.current || 0}
                    onChange={(v) => setRating(skill.id, "current", v)}
                  />
                </div>
                <div className="flex md:block items-center gap-2">
                  <span className="md:hidden text-white/30 text-[10px] uppercase tracking-wide w-16 flex-shrink-0">
                    goal
                  </span>
                  <SkillDots
                    value={ratings[skill.id]?.goal || 0}
                    onChange={(v) => setRating(skill.id, "goal", v)}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="sticky bottom-0 -mx-6 md:-mx-8 border-t border-white/10 bg-[#161618]/95 backdrop-blur px-6 md:px-8 py-4 flex items-center justify-end gap-3">
        <button
          onClick={onCancel}
          className="border border-white/20 text-white font-bold text-sm rounded-2xl px-6 py-3 active:opacity-80 transition-opacity"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl px-6 py-3 disabled:opacity-40 active:opacity-80 transition-opacity"
        >
          {saving ? "Saving…" : "Save skill tracker"}
        </button>
      </div>
    </div>
  );
}
