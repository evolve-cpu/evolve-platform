import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

const DAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const JOIN_WINDOW_MINUTES = 15;

// No admin-set session_datetime yet? Show a reasonable placeholder — the
// next occurrence of the booked day/time — so the page isn't empty while
// an admin hasn't attached the real Calendly-scheduled meeting yet.
function nextOccurrence(preferredDay, preferredTime) {
  const targetDow = DAY_INDEX[preferredDay];
  if (targetDow === undefined) return null;
  const [, hourStr, minStr, meridiem] = preferredTime.match(/(\d+):(\d+)\s*(AM|PM)/i) || [];
  if (!hourStr) return null;
  let hour = parseInt(hourStr, 10) % 12;
  if (/pm/i.test(meridiem)) hour += 12;

  const now = new Date();
  const result = new Date(now);
  result.setHours(hour, parseInt(minStr, 10), 0, 0);
  let dayDiff = (targetDow - now.getDay() + 7) % 7;
  if (dayDiff === 0 && result <= now) dayDiff = 7;
  result.setDate(result.getDate() + dayDiff);
  return result;
}

function fmtDateTime(d) {
  if (!d) return null;
  return {
    date: d.toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }),
    time: d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }) + " IST"
  };
}

function DocRow({ icon, label, value, onClick }) {
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
  { key: "skill-tracker", title: "Skill tracker sheet", desc: "Track where you stand, session by session", action: "skillTracker" },
  { key: "colour-theory", title: "Colour theory in movies", desc: "A quick watch on mood + palette" },
  { key: "ny-subway", title: "New York subway system", desc: "A case study in wayfinding design" },
  { key: "creative-confidence", title: "Creative confidence", desc: "The book worth the hype" }
];

/**
 * Session 1 · Discover — reads mentorship_session_links (admin-set real
 * meeting time/link, see MentorshipV2Tab.jsx) with a computed fallback date
 * until an admin attaches one. "Join session" is gated on the skill
 * tracker being submitted AND being within 15 minutes of the real start
 * time — re-checked on an interval so it flips live without a refresh.
 * "My docs" reads/edits the same mentorship_intake row "Before we begin"
 * already collected, not a separate submission.
 */
export default function MentorshipSession1({ user, intake, skillDone, sessionLink, booking, onOpenSkillTracker, onIntakeUpdated }) {
  const [now, setNow] = useState(() => Date.now());
  const [editingField, setEditingField] = useState(null); // "resume" | "walkthrough" | "portfolio" | null

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const realDatetime = sessionLink?.session_datetime ? new Date(sessionLink.session_datetime) : null;
  const displayDatetime = realDatetime || (booking ? nextOccurrence(booking.preferred_day, booking.preferred_time) : null);
  const fmt = fmtDateTime(displayDatetime);

  const withinWindow =
    realDatetime && now >= realDatetime.getTime() - JOIN_WINDOW_MINUTES * 60000 && now <= realDatetime.getTime() + 60 * 60000;
  const hasLink = !!sessionLink?.join_link;
  const joinEnabled = skillDone && hasLink && withinWindow;

  let gateCaption = "";
  if (!skillDone) gateCaption = "Complete the task above to unlock this session";
  else if (!hasLink) gateCaption = "Your mentor will share the join link closer to the session";
  else if (!withinWindow) gateCaption = "Button enables 15 mins before the session starts";

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
    <div className="flex-1 flex flex-col gap-6">
      <span className="w-fit bg-evolve-yellow/10 text-evolve-yellow text-[11px] font-bold uppercase tracking-wide rounded-full px-3 py-1.5">
        Upcoming session
      </span>

      <div>
        <h1
          className="text-white font-bold font-bricolage"
          style={{ fontSize: "clamp(24px,4vw,32px)", letterSpacing: "-0.02em" }}
        >
          Session 1 · Discover
        </h1>
        <p className="text-white/50 text-sm mt-2 max-w-xl leading-relaxed">
          Meet your mentor, understand how the program works, and start mapping your design skills through a
          guided self-assessment sheet.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-white font-bold text-sm">Before the call</p>
        <DocRow
          icon={
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <rect x="4" y="3" width="12" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
              <path d="M7 7h6M7 10.5h6M7 14h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          }
          label="Fill up the skill tracker"
          value={skillDone ? "Submitted" : ""}
          onClick={onOpenSkillTracker}
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-6 flex flex-col items-center text-center gap-4">
        <div>
          <p className="text-white/30 text-xs">Happening on</p>
          <p className="text-white font-bold text-lg mt-1">{fmt?.date || "To be scheduled"}</p>
          {fmt && <p className="text-evolve-yellow font-bold text-sm mt-1">{fmt.time}</p>}
        </div>
        <button
          disabled={!joinEnabled}
          onClick={() => joinEnabled && window.open(sessionLink.join_link, "_blank", "noopener,noreferrer")}
          className="w-full max-w-xs border border-white/20 text-white font-bold text-sm rounded-2xl py-3.5 flex items-center justify-center gap-2 disabled:opacity-40 active:opacity-80 transition-opacity"
        >
          Join session
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
            <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {gateCaption && <p className="text-white/30 text-xs">{gateCaption}</p>}
      </div>

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
            <button
              key={r.key}
              type="button"
              onClick={r.action === "skillTracker" ? onOpenSkillTracker : undefined}
              className={`flex items-center gap-3 py-3.5 text-left ${r.action ? "cursor-pointer" : "cursor-default"}`}
            >
              <span className="w-4 h-4 text-evolve-yellow flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <path d="M8 12l4-4M9 5l1-1a3 3 0 014 4l-1 1M11 15l-1 1a3 3 0 01-4-4l1-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </span>
              <span>
                <p className="text-white text-sm font-bold">{r.title}</p>
                <p className="text-white/35 text-xs mt-0.5">{r.desc}</p>
              </span>
            </button>
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
    </div>
  );
}
