import { useEffect, useState } from "react";
import { supabaseAdmin } from "../../supabaseAdminClient";
import {
  isEventOver,
  isEventLive,
  seriesOccurrences,
  describeRecurrence,
  registrationClosedReason,
  WEEKDAYS
} from "../../lib/events";
import { toEmbedUrl } from "../../components/events/PastEventRecording";

const Y = "#FFD007";
const inputStyle = { backgroundColor: "#0d0d0d", border: "1px solid #262626" };
const labelStyle = { color: "#666" };
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function callEventsNotify(body) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/events-notify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY
    },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "request failed");
  return data;
}

// The recording link lives in event_recording_links, readable only by
// people entitled to the recording (events_recording_links.sql), never on
// the public events row. Empty link = remove it.
async function saveRecordingLink(eventId, url) {
  const { error } = url
    ? await supabaseAdmin
        .from("event_recording_links")
        .upsert({ event_id: eventId, url, updated_at: new Date().toISOString() })
    : await supabaseAdmin.from("event_recording_links").delete().eq("event_id", eventId);
  if (error) alert(`Event saved, but the recording link wasn't: ${error.message}`);
}

// best-effort — publishing shouldn't fail if the calendar sync hiccups
function syncCalendar(eventId) {
  callEventsNotify({ mode: "sync_calendar", event_id: eventId }).catch(() => {});
}

const STATUS_COLOR = {
  draft: "#888",
  published: Y,
  cancelled: "#ef4444",
  completed: "#22c55e"
};

const EVENT_TYPES = ["AMA", "Webinar", "Workshop", "Panel Discussion"];
// the "add past event" form only offers these two
const PAST_EVENT_TYPES = ["Webinar", "AMA"];

const EMPTY_SPEAKER = { name: "", role: "", bio: "", linkedin: "", photo_url: "" };

// Custom registration questions (events.registration_questions), answered
// in the registration modal on EventDetail.jsx and stored per registration
// in event_registrations.answers, keyed by question id.
const QUESTION_TYPES = [
  { type: "text", name: "Text", placeholder: "What would you like to get out of this session?" },
  { type: "options", name: "Options", placeholder: "What best describes your role?" },
  { type: "social", name: "Social Profile", placeholder: "Your LinkedIn profile" },
  { type: "company", name: "Company", placeholder: "Where do you work / study?" },
  { type: "checkbox", name: "Checkbox", placeholder: "I'll keep my camera on during the session" },
  { type: "terms", name: "Terms", placeholder: "Terms and Conditions" },
  { type: "phone", name: "Phone", placeholder: "Phone number" },
  { type: "website", name: "Website", placeholder: "Portfolio / website" }
];
const questionTypeName = (type) => QUESTION_TYPES.find((t) => t.type === type)?.name || type;

function questionSubtitle(q) {
  if (q.type === "options") {
    const opts = (q.options || []).filter(Boolean);
    return `${opts.length} option${opts.length === 1 ? "" : "s"}: ${opts.join(", ")}`;
  }
  if (q.type === "terms") return q.terms_url || q.terms_text || "";
  return "";
}

function questionKind(q) {
  if (q.type === "text") return q.long ? "Long Text" : "Short Text";
  if (q.type === "options") return q.multi ? "Multi Select" : "Single Select";
  return questionTypeName(q.type);
}

const EMPTY_RECURRENCE = { freq: "", interval: "1", weekdays: [], endsType: "never", endsDate: "", endsCount: "8" };

const EMPTY_FORM = {
  title: "",
  slug: "",
  event_type: EVENT_TYPES[0],
  description: "",
  questionCategories: [{ name: "", questions: [""] }],
  date: "",
  time: "19:00",
  durationMinutes: "60",
  speaker_name: "",
  speaker_title: "",
  speaker_bio: "",
  speaker_photo_url: "",
  speaker_socials: [""],
  cover_image_url: "",
  join_link: "",
  capacity: "",
  // pricing after the trial (blank = default for the type, see
  // src/lib/membership.js) + the past-event CMS: recording, its thumbnail
  // and the guests who were on the session
  price_inr: "",
  recording_price_inr: "",
  recording_path: "",
  recording_url: "",
  recording_thumbnail_url: "",
  recording_duration_min: "",
  guests: [{ name: "", title: "", photo_url: "" }],
  // past-event page (events_past_sessions.sql): headline count + the
  // "About the speakers" section
  attendee_count: "",
  speakers: [{ ...EMPTY_SPEAKER }],
  // registration controls (events_registration_controls.sql)
  about_sections: [],
  requires_approval: false,
  registration_open: true,
  closes_date: "",
  closes_time: "",
  collect_speaker_question: true,
  registration_questions: [],
  recurrence: EMPTY_RECURRENCE,
  series_id: null,
  applyToSeries: false
};

// new events get their id up front so a recording can be uploaded into
// that event's folder before the row is first saved
const newEventForm = () => ({ ...EMPTY_FORM, _id: crypto.randomUUID() });
const newPastEventForm = () => ({ ...newEventForm(), event_type: PAST_EVENT_TYPES[0] });

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Same IST<->UTC convention already used elsewhere in AdminDashboard.jsx /
// MentorshipV2Tab.jsx.
function istToUtc(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCHours(h - 5, m - 30, 0, 0);
  return d.toISOString();
}
function utcToIst(dtStr) {
  if (!dtStr) return { date: "", time: "19:00" };
  const d = new Date(dtStr);
  const ist = new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
  return {
    date: ist.toISOString().slice(0, 10),
    time: `${String(ist.getUTCHours()).padStart(2, "0")}:${String(ist.getUTCMinutes()).padStart(2, "0")}`
  };
}
function fmtDt(dtStr) {
  if (!dtStr) return "not set";
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

function downloadCSV(filename, rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(","))
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function Field({ label, ...rest }) {
  return (
    <div>
      <label className="text-xs font-semibold mb-1 block" style={labelStyle}>
        {label}
      </label>
      <input className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none" style={inputStyle} {...rest} />
    </div>
  );
}

function SelectField({ label, options, ...rest }) {
  return (
    <div>
      <label className="text-xs font-semibold mb-1 block" style={labelStyle}>
        {label}
      </label>
      <select className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none" style={inputStyle} {...rest}>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextAreaField({ label, ...rest }) {
  return (
    <div>
      <label className="text-xs font-semibold mb-1 block" style={labelStyle}>
        {label}
      </label>
      <textarea className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none resize-y" style={inputStyle} {...rest} />
    </div>
  );
}

function ImageField({ label, value, onUploaded, pathPrefix }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file) {
    if (!file) return;
    setUploading(true);
    setError("");
    const path = `${pathPrefix}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    const { error: upErr } = await supabaseAdmin.storage.from("event-images").upload(path, file);
    if (upErr) {
      setError(upErr.message);
      setUploading(false);
      return;
    }
    const { data } = supabaseAdmin.storage.from("event-images").getPublicUrl(path);
    onUploaded(data.publicUrl);
    setUploading(false);
  }

  return (
    <div>
      <label className="text-xs font-semibold mb-1 block" style={labelStyle}>
        {label}
      </label>
      <div className="flex items-center gap-3">
        {value && (
          <img src={value} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" style={{ border: "1px solid #262626" }} />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFile(e.target.files?.[0])}
          className="text-xs text-white"
          disabled={uploading}
        />
        {uploading && <span className="text-xs" style={{ color: "#888" }}>uploading…</span>}
      </div>
      {error && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{error}</p>}
    </div>
  );
}

// Past-event recording upload — goes to the PRIVATE event-recordings bucket
// under "<event id>/…" (that folder name is what the storage policy in
// membership_plans.sql checks access against), so viewers only ever get a
// short-lived signed URL, never a public link.
function RecordingField({ eventId, value, onUploaded, onRemove }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file) {
    if (!file || !eventId) return;
    setUploading(true);
    setError("");
    const path = `${eventId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    const { error: upErr } = await supabaseAdmin.storage
      .from("event-recordings")
      .upload(path, file, { contentType: file.type || "video/mp4" });
    if (upErr) {
      setError(
        /size|exceed|too large/i.test(upErr.message)
          ? `${upErr.message} — raise the upload limit in Supabase (Storage → Settings) or paste a hosted player URL instead.`
          : upErr.message
      );
      setUploading(false);
      return;
    }
    onUploaded(path);
    setUploading(false);
  }

  return (
    <div>
      <label className="text-xs font-semibold mb-1 block" style={labelStyle}>
        recording video (private — only people with access can stream it)
      </label>
      {value ? (
        <div className="flex items-center gap-3">
          <span className="text-xs text-white truncate">{value.split("/").pop()}</span>
          <button
            type="button"
            onClick={onRemove}
            className="text-xs font-bold px-3 py-1 rounded-lg"
            style={{ border: "1px solid #333", color: "#aaa" }}
          >
            remove
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={(e) => handleFile(e.target.files?.[0])}
            className="text-xs text-white"
            disabled={uploading}
          />
          {uploading && (
            <span className="text-xs" style={{ color: "#888" }}>
              uploading… large files take a while, keep this tab open
            </span>
          )}
        </div>
      )}
      {error && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{error}</p>}
    </div>
  );
}

function ToggleField({ label, hint, checked, onChange }) {
  return (
    <label className="flex items-start gap-3 rounded-lg p-3 cursor-pointer" style={{ backgroundColor: "#0d0d0d", border: "1px solid #1a1a1a" }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5" style={{ accentColor: Y }} />
      <span>
        <span className="text-xs font-bold text-white block">{label}</span>
        {hint && <span className="text-[11px] block mt-0.5" style={{ color: "#888" }}>{hint}</span>}
      </span>
    </label>
  );
}

const smallBtn = { border: "1px solid #333", color: "#aaa" };

// Google-Meet style "repeat" picker. Only used when an event isn't part of
// a series yet — saving generates the later occurrences (see saveSeries).
function RecurrenceField({ value, onChange, startDate }) {
  const set = (patch) => onChange({ ...value, ...patch });
  const startWeekday = startDate ? new Date(`${startDate}T12:00:00+05:30`).getUTCDay() : null;
  function toggleDay(d) {
    const days = value.weekdays.includes(d) ? value.weekdays.filter((x) => x !== d) : [...value.weekdays, d];
    set({ weekdays: days });
  }
  return (
    <div className="rounded-lg p-3 space-y-3" style={{ backgroundColor: "#0d0d0d", border: "1px solid #1a1a1a" }}>
      <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: "#aaa" }}>
        <span>Repeat</span>
        <select
          className="rounded-lg px-3 py-2 text-sm text-white outline-none"
          style={inputStyle}
          value={value.freq}
          onChange={(e) =>
            set({
              freq: e.target.value,
              weekdays: e.target.value === "weekly" && !value.weekdays.length && startWeekday != null ? [startWeekday] : value.weekdays
            })
          }
        >
          <option value="">does not repeat</option>
          <option value="daily">daily</option>
          <option value="weekly">weekly</option>
          <option value="monthly">monthly (same date)</option>
        </select>
        {value.freq && (
          <>
            <span>every</span>
            <input
              type="number"
              min="1"
              className="w-16 rounded-lg px-3 py-2 text-sm text-white outline-none"
              style={inputStyle}
              value={value.interval}
              onChange={(e) => set({ interval: e.target.value })}
            />
            <span>{{ daily: "day(s)", weekly: "week(s)", monthly: "month(s)" }[value.freq]}</span>
          </>
        )}
      </div>

      {value.freq === "weekly" && (
        <div className="flex flex-wrap gap-1">
          {WEEKDAYS.map((d, i) => (
            <button
              key={d}
              type="button"
              onClick={() => toggleDay(i)}
              className="text-xs font-bold w-11 py-1.5 rounded-md"
              style={value.weekdays.includes(i) ? { background: Y, color: "#111" } : smallBtn}
            >
              {d}
            </button>
          ))}
        </div>
      )}

      {value.freq && (
        <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: "#aaa" }}>
          <span>Ends</span>
          {[
            ["never", "never"],
            ["on", "on date"],
            ["after", "after"]
          ].map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => set({ endsType: k })}
              className="text-xs font-bold px-3 py-1.5 rounded-md"
              style={value.endsType === k ? { background: Y, color: "#111" } : smallBtn}
            >
              {label}
            </button>
          ))}
          {value.endsType === "on" && (
            <input
              type="date"
              className="rounded-lg px-3 py-1.5 text-sm text-white outline-none"
              style={inputStyle}
              value={value.endsDate}
              onChange={(e) => set({ endsDate: e.target.value })}
            />
          )}
          {value.endsType === "after" && (
            <>
              <input
                type="number"
                min="2"
                max="60"
                className="w-16 rounded-lg px-3 py-1.5 text-sm text-white outline-none"
                style={inputStyle}
                value={value.endsCount}
                onChange={(e) => set({ endsCount: e.target.value })}
              />
              <span>sessions</span>
            </>
          )}
        </div>
      )}
      {value.freq && (
        <p className="text-[11px]" style={{ color: "#888" }}>
          Each session gets its own page, registrations and reminders. Public lists show only the next
          one. {value.endsType === "never" && "Sessions are created 4 weeks ahead and topped up automatically."}
        </p>
      )}
    </div>
  );
}

function AboutSectionsField({ sections, onChange }) {
  const update = (i, key, v) => onChange(sections.map((s, idx) => (idx === i ? { ...s, [key]: v } : s)));
  return (
    <div className="space-y-2">
      {sections.map((s, i) => (
        <div key={i} className="rounded-lg p-3 space-y-2" style={{ backgroundColor: "#0d0d0d", border: "1px solid #1a1a1a" }}>
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-lg px-3 py-2 text-sm font-bold text-white outline-none"
              style={inputStyle}
              value={s.title}
              placeholder='Section title (e.g. "Who is this for", "What you will take away")'
              onChange={(e) => update(i, "title", e.target.value)}
            />
            <button
              type="button"
              onClick={() => onChange(sections.filter((_, idx) => idx !== i))}
              className="text-xs font-bold px-3 rounded-lg"
              style={smallBtn}
            >
              remove
            </button>
          </div>
          <textarea
            className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none resize-y"
            style={inputStyle}
            rows={4}
            value={s.body}
            placeholder="Line breaks are kept as typed"
            onChange={(e) => update(i, "body", e.target.value)}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...sections, { title: "", body: "" }])}
        className="text-xs font-bold px-3 py-1.5 rounded-lg"
        style={{ border: `1px solid ${Y}`, color: Y }}
      >
        + add section
      </button>
    </div>
  );
}

function QuestionEditor({ q, onChange, onDone }) {
  const set = (patch) => onChange({ ...q, ...patch });
  const options = q.options?.length ? q.options : [""];
  return (
    <div className="space-y-2 pt-2">
      <input
        className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
        style={inputStyle}
        value={q.label}
        placeholder={QUESTION_TYPES.find((t) => t.type === q.type)?.placeholder}
        onChange={(e) => set({ label: e.target.value })}
        autoFocus
      />
      {q.type === "text" && (
        <div className="flex gap-1">
          {[
            [false, "short answer"],
            [true, "long answer"]
          ].map(([long, label]) => (
            <button
              key={label}
              type="button"
              onClick={() => set({ long })}
              className="text-xs font-bold px-3 py-1.5 rounded-md"
              style={!!q.long === long ? { background: Y, color: "#111" } : smallBtn}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {q.type === "options" && (
        <>
          <div className="flex gap-1">
            {[
              [false, "single select"],
              [true, "multi select"]
            ].map(([multi, label]) => (
              <button
                key={label}
                type="button"
                onClick={() => set({ multi })}
                className="text-xs font-bold px-3 py-1.5 rounded-md"
                style={!!q.multi === multi ? { background: Y, color: "#111" } : smallBtn}
              >
                {label}
              </button>
            ))}
          </div>
          {options.map((opt, oi) => (
            <div key={oi} className="flex gap-2">
              <input
                className="flex-1 rounded-lg px-3 py-2 text-sm text-white outline-none"
                style={inputStyle}
                value={opt}
                placeholder={`Option ${oi + 1}`}
                onChange={(e) => set({ options: options.map((o, idx) => (idx === oi ? e.target.value : o)) })}
              />
              <button
                type="button"
                onClick={() => set({ options: options.filter((_, idx) => idx !== oi) })}
                className="text-xs font-bold px-3 rounded-lg"
                style={smallBtn}
              >
                remove
              </button>
            </div>
          ))}
          <button type="button" onClick={() => set({ options: [...options, ""] })} className="text-xs font-bold px-3 py-1.5 rounded-lg" style={smallBtn}>
            + add option
          </button>
        </>
      )}
      {q.type === "terms" && (
        <>
          <input
            className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
            style={inputStyle}
            value={q.terms_url || ""}
            placeholder="Link to the terms (optional)"
            onChange={(e) => set({ terms_url: e.target.value })}
          />
          <textarea
            className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none resize-y"
            style={inputStyle}
            rows={3}
            value={q.terms_text || ""}
            placeholder="…or the terms themselves, shown in the form"
            onChange={(e) => set({ terms_text: e.target.value })}
          />
        </>
      )}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs" style={{ color: "#aaa" }}>
          <input type="checkbox" checked={!!q.required} onChange={(e) => set({ required: e.target.checked })} style={{ accentColor: Y }} />
          required
        </label>
        <button type="button" onClick={onDone} className="text-xs font-black px-3 py-1.5 rounded-lg" style={{ background: Y, color: "#111" }}>
          done
        </button>
      </div>
    </div>
  );
}

function QuestionsBuilder({ questions, onChange }) {
  const [editingId, setEditingId] = useState(null);
  const [picking, setPicking] = useState(false);
  const hasTerms = questions.some((q) => q.type === "terms");

  function add(type) {
    const q = { id: crypto.randomUUID().slice(0, 8), type, label: "", required: type === "terms", options: type === "options" ? ["", ""] : [] };
    onChange([...questions, q]);
    setEditingId(q.id);
    setPicking(false);
  }
  function move(i, dir) {
    const j = i + dir;
    if (j < 0 || j >= questions.length) return;
    const next = [...questions];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div className="space-y-2">
      {questions.map((q, i) => (
        <div key={q.id} className="rounded-lg p-3" style={{ backgroundColor: "#0d0d0d", border: "1px solid #1a1a1a" }}>
          <div className="flex items-start gap-3">
            <div className="flex flex-col">
              <button type="button" onClick={() => move(i, -1)} className="text-[10px] leading-none px-1" style={{ color: "#666" }} aria-label="move up">
                ▲
              </button>
              <button type="button" onClick={() => move(i, 1)} className="text-[10px] leading-none px-1 mt-1" style={{ color: "#666" }} aria-label="move down">
                ▼
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">{q.label || <span style={{ color: "#666" }}>Untitled question</span>}</p>
              {questionSubtitle(q) && (
                <p className="text-xs truncate" style={{ color: "#888" }}>{questionSubtitle(q)}</p>
              )}
              <p className="text-[11px] mt-0.5" style={{ color: "#666" }}>
                {questionKind(q)}
                {q.required ? " · Required" : ""}
              </p>
            </div>
            <button type="button" onClick={() => setEditingId(editingId === q.id ? null : q.id)} className="text-xs font-bold px-3 py-1 rounded-lg" style={smallBtn}>
              edit
            </button>
            <button type="button" onClick={() => onChange(questions.filter((x) => x.id !== q.id))} className="text-xs font-bold px-3 py-1 rounded-lg" style={smallBtn}>
              remove
            </button>
          </div>
          {editingId === q.id && (
            <QuestionEditor
              q={q}
              onChange={(nq) => onChange(questions.map((x) => (x.id === q.id ? nq : x)))}
              onDone={() => setEditingId(null)}
            />
          )}
        </div>
      ))}

      {picking ? (
        <div className="rounded-lg p-3" style={{ backgroundColor: "#0d0d0d", border: `1px solid ${Y}55` }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-white">Add question</p>
            <button type="button" onClick={() => setPicking(false)} className="text-xs" style={{ color: "#888" }}>
              cancel
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {QUESTION_TYPES.map((t) => {
              const disabled = t.type === "terms" && hasTerms;
              return (
                <button
                  key={t.type}
                  type="button"
                  disabled={disabled}
                  onClick={() => add(t.type)}
                  className="text-sm font-bold text-left px-3 py-2.5 rounded-lg disabled:opacity-40"
                  style={{ backgroundColor: "#1a1a1a", color: "#ddd" }}
                >
                  {t.name}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setPicking(true)}
          className="text-xs font-bold px-3 py-1.5 rounded-lg"
          style={{ border: `1px solid ${Y}`, color: Y }}
        >
          + add question
        </button>
      )}
    </div>
  );
}

function EventForm({ form, setForm, onSave, onCancel, saving }) {
  function updateCategoryName(ci, name) {
    setForm((f) => ({
      ...f,
      questionCategories: f.questionCategories.map((c, idx) => (idx === ci ? { ...c, name } : c))
    }));
  }
  function addCategory() {
    setForm((f) => ({ ...f, questionCategories: [...f.questionCategories, { name: "", questions: [""] }] }));
  }
  function removeCategory(ci) {
    setForm((f) => ({ ...f, questionCategories: f.questionCategories.filter((_, idx) => idx !== ci) }));
  }
  function updateQuestion(ci, qi, value) {
    setForm((f) => ({
      ...f,
      questionCategories: f.questionCategories.map((c, idx) =>
        idx === ci ? { ...c, questions: c.questions.map((q, qidx) => (qidx === qi ? value : q)) } : c
      )
    }));
  }
  function addQuestion(ci) {
    setForm((f) => ({
      ...f,
      questionCategories: f.questionCategories.map((c, idx) => (idx === ci ? { ...c, questions: [...c.questions, ""] } : c))
    }));
  }
  function removeQuestion(ci, qi) {
    setForm((f) => ({
      ...f,
      questionCategories: f.questionCategories.map((c, idx) =>
        idx === ci ? { ...c, questions: c.questions.filter((_, qidx) => qidx !== qi) } : c
      )
    }));
  }

  function updateSocial(i, value) {
    setForm((f) => ({ ...f, speaker_socials: f.speaker_socials.map((s, idx) => (idx === i ? value : s)) }));
  }
  function addSocial() {
    setForm((f) => ({ ...f, speaker_socials: [...f.speaker_socials, ""] }));
  }
  function removeSocial(i) {
    setForm((f) => ({ ...f, speaker_socials: f.speaker_socials.filter((_, idx) => idx !== i) }));
  }

  function updateGuest(i, key, value) {
    setForm((f) => ({ ...f, guests: f.guests.map((g, idx) => (idx === i ? { ...g, [key]: value } : g)) }));
  }
  function addGuest() {
    setForm((f) => ({ ...f, guests: [...f.guests, { name: "", title: "", photo_url: "" }] }));
  }
  function removeGuest(i) {
    setForm((f) => ({ ...f, guests: f.guests.filter((_, idx) => idx !== i) }));
  }

  return (
    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
      <Field
        label="title"
        value={form.title}
        onChange={(e) => {
          const title = e.target.value;
          setForm((f) => ({ ...f, title, slug: f._slugTouched ? f.slug : slugify(title) }));
        }}
      />
      <Field
        label="slug (public URL: /events/...)"
        value={form.slug}
        onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value), _slugTouched: true }))}
      />

      <SelectField
        label="event type"
        options={EVENT_TYPES}
        value={form.event_type}
        onChange={(e) => setForm((f) => ({ ...f, event_type: e.target.value }))}
      />

      <div className="md:col-span-2">
        <TextAreaField
          label="about the session (line breaks are kept as typed)"
          rows={6}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
      </div>

      <div className="md:col-span-2">
        <label className="text-xs font-semibold mb-1 block" style={labelStyle}>
          more sections (shown under "about the session")
        </label>
        <AboutSectionsField
          sections={form.about_sections}
          onChange={(about_sections) => setForm((f) => ({ ...f, about_sections }))}
        />
      </div>

      <div className="md:col-span-2">
        <label className="text-xs font-semibold mb-1 block" style={labelStyle}>
          question categories / what will be covered
        </label>
        <div className="space-y-3">
          {form.questionCategories.map((cat, ci) => (
            <div key={ci} className="rounded-lg p-3 space-y-2" style={{ backgroundColor: "#0d0d0d", border: "1px solid #1a1a1a" }}>
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-lg px-3 py-2 text-sm font-bold text-white outline-none"
                  style={inputStyle}
                  value={cat.name}
                  placeholder={`Category ${ci + 1} (e.g. "Decoding feedback & surviving stakeholders")`}
                  onChange={(e) => updateCategoryName(ci, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeCategory(ci)}
                  className="text-xs font-bold px-3 rounded-lg"
                  style={{ border: "1px solid #333", color: "#aaa" }}
                >
                  remove category
                </button>
              </div>
              <div className="pl-3 space-y-2">
                {cat.questions.map((q, qi) => (
                  <div key={qi} className="flex gap-2">
                    <input
                      className="flex-1 rounded-lg px-3 py-2 text-sm text-white outline-none"
                      style={inputStyle}
                      value={q}
                      placeholder={`Sample question ${qi + 1}`}
                      onChange={(e) => updateQuestion(ci, qi, e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeQuestion(ci, qi)}
                      className="text-xs font-bold px-3 rounded-lg"
                      style={{ border: "1px solid #333", color: "#aaa" }}
                    >
                      remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addQuestion(ci)}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg"
                  style={{ border: "1px solid #333", color: "#aaa" }}
                >
                  + add question
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addCategory}
            className="text-xs font-bold px-3 py-1.5 rounded-lg"
            style={{ border: `1px solid ${Y}`, color: Y }}
          >
            + add category
          </button>
        </div>
      </div>

      <Field type="date" label="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
      <Field type="time" label="time (IST)" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} />
      <Field
        type="number"
        label="duration (minutes)"
        value={form.durationMinutes}
        onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))}
      />
      <Field
        type="number"
        label="capacity (blank = unlimited)"
        value={form.capacity}
        onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
      />

      <div className="md:col-span-2">
        {form.series_id ? (
          <ToggleField
            label={`Part of a recurring series · ${describeRecurrence(form._recurrenceRaw) || "repeats"}`}
            hint="Tick to also copy these changes (everything except date, time and slug) to every upcoming session in the series."
            checked={form.applyToSeries}
            onChange={(applyToSeries) => setForm((f) => ({ ...f, applyToSeries }))}
          />
        ) : (
          <RecurrenceField
            value={form.recurrence}
            startDate={form.date}
            onChange={(recurrence) => setForm((f) => ({ ...f, recurrence }))}
          />
        )}
      </div>

      <div className="md:col-span-2 pt-2">
        <p className="text-xs font-black uppercase tracking-wide" style={{ color: Y }}>
          registration
        </p>
      </div>
      <ToggleField
        label="Registration open"
        hint="Turn off to stop new sign-ups. The page shows “Registrations closed”."
        checked={form.registration_open}
        onChange={(registration_open) => setForm((f) => ({ ...f, registration_open }))}
      />
      <ToggleField
        label="Require approval"
        hint="People request a spot; you approve or decline them under Registrants. Calendar invite goes out on approval."
        checked={form.requires_approval}
        onChange={(requires_approval) => setForm((f) => ({ ...f, requires_approval }))}
      />
      <Field
        type="date"
        label="close registrations on (optional)"
        value={form.closes_date}
        onChange={(e) => setForm((f) => ({ ...f, closes_date: e.target.value }))}
      />
      <Field
        type="time"
        label="at (IST)"
        value={form.closes_time}
        onChange={(e) => setForm((f) => ({ ...f, closes_time: e.target.value }))}
      />
      <div className="md:col-span-2">
        <ToggleField
          label="Ask for a question for the speaker"
          hint="The AMA-style fields: question category, question, and the anonymous option. Turn off for sessions that don't need them."
          checked={form.collect_speaker_question}
          onChange={(collect_speaker_question) => setForm((f) => ({ ...f, collect_speaker_question }))}
        />
      </div>
      <div className="md:col-span-2">
        <label className="text-xs font-semibold mb-1 block" style={labelStyle}>
          custom questions (asked when someone registers)
        </label>
        <QuestionsBuilder
          questions={form.registration_questions}
          onChange={(registration_questions) => setForm((f) => ({ ...f, registration_questions }))}
        />
      </div>

      <Field
        label="speaker / host name"
        value={form.speaker_name}
        onChange={(e) => setForm((f) => ({ ...f, speaker_name: e.target.value }))}
      />
      <Field
        label="speaker title / role"
        value={form.speaker_title}
        placeholder="Senior Product Designer at ..."
        onChange={(e) => setForm((f) => ({ ...f, speaker_title: e.target.value }))}
      />
      <div className="md:col-span-2">
        <TextAreaField
          label="speaker bio"
          rows={2}
          value={form.speaker_bio}
          onChange={(e) => setForm((f) => ({ ...f, speaker_bio: e.target.value }))}
        />
      </div>

      <ImageField
        label="speaker photo"
        value={form.speaker_photo_url}
        pathPrefix="speakers"
        onUploaded={(url) => setForm((f) => ({ ...f, speaker_photo_url: url }))}
      />
      <ImageField
        label="cover image"
        value={form.cover_image_url}
        pathPrefix="covers"
        onUploaded={(url) => setForm((f) => ({ ...f, cover_image_url: url }))}
      />

      <div className="md:col-span-2">
        <label className="text-xs font-semibold mb-1 block" style={labelStyle}>
          speaker social links (linkedin, instagram, etc. — platform is auto-detected)
        </label>
        <div className="space-y-2">
          {form.speaker_socials.map((url, i) => (
            <div key={i} className="flex gap-2">
              <input
                className="flex-1 rounded-lg px-3 py-2 text-sm text-white outline-none"
                style={inputStyle}
                value={url}
                placeholder="https://linkedin.com/in/..."
                onChange={(e) => updateSocial(i, e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeSocial(i)}
                className="text-xs font-bold px-3 rounded-lg"
                style={{ border: "1px solid #333", color: "#aaa" }}
              >
                remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSocial}
            className="text-xs font-bold px-3 py-1.5 rounded-lg"
            style={{ border: `1px solid ${Y}`, color: Y }}
          >
            + add social link
          </button>
        </div>
      </div>

      <div className="md:col-span-2">
        <Field
          label="join link (Zoom / Google Meet)"
          value={form.join_link}
          placeholder="https://meet.google.com/..."
          onChange={(e) => setForm((f) => ({ ...f, join_link: e.target.value }))}
        />
      </div>

      <div className="md:col-span-2 pt-2">
        <p className="text-xs font-black uppercase tracking-wide" style={{ color: Y }}>
          pricing after the free trial
        </p>
        <p className="text-[11px] mt-1" style={{ color: "#888" }}>
          Free during the 30-day trial and for anyone on a plan. Blank = default (AMA / Panel ₹20,
          Webinar / Workshop ₹150, recording ₹30). 0 = free for everyone.
        </p>
      </div>
      <Field
        type="number"
        min="0"
        label="live session price (₹)"
        value={form.price_inr}
        placeholder={["Webinar", "Workshop"].includes(form.event_type) ? "150" : "20"}
        onChange={(e) => setForm((f) => ({ ...f, price_inr: e.target.value }))}
      />
      <Field
        type="number"
        min="0"
        label="recording price (₹)"
        value={form.recording_price_inr}
        placeholder="30"
        onChange={(e) => setForm((f) => ({ ...f, recording_price_inr: e.target.value }))}
      />

      <div className="md:col-span-2 pt-2">
        <p className="text-xs font-black uppercase tracking-wide" style={{ color: Y }}>
          past event — recording &amp; guests
        </p>
        <p className="text-[11px] mt-1" style={{ color: "#888" }}>
          Shows on the event page once the session is over. "About the session" above is reused as
          its about section.
        </p>
      </div>
      <div className="md:col-span-2">
        <RecordingField
          eventId={form._id}
          value={form.recording_path}
          onUploaded={(path) => setForm((f) => ({ ...f, recording_path: path }))}
          onRemove={() => setForm((f) => ({ ...f, recording_path: "" }))}
        />
      </div>
      <div className="md:col-span-2">
        <Field
          label="…or a video link — Unlisted YouTube (free), or a VdoCipher / Bunny Stream / Vimeo embed. Used when no video is uploaded"
          value={form.recording_url}
          placeholder="https://youtu.be/... or https://www.youtube.com/watch?v=..."
          onChange={(e) => setForm((f) => ({ ...f, recording_url: e.target.value }))}
        />
      </div>
      <ImageField
        label="recording thumbnail (falls back to the cover image)"
        value={form.recording_thumbnail_url}
        pathPrefix="recording-thumbs"
        onUploaded={(url) => setForm((f) => ({ ...f, recording_thumbnail_url: url }))}
      />
      <Field
        type="number"
        min="0"
        label="recording length (minutes)"
        value={form.recording_duration_min}
        onChange={(e) => setForm((f) => ({ ...f, recording_duration_min: e.target.value }))}
      />

      <div className="md:col-span-2">
        <label className="text-xs font-semibold mb-1 block" style={labelStyle}>
          guests on the session
        </label>
        <div className="space-y-2">
          {form.guests.map((g, i) => (
            <div
              key={i}
              className="rounded-lg p-3 grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2 items-center"
              style={{ backgroundColor: "#0d0d0d", border: "1px solid #1a1a1a" }}
            >
              <input
                className="rounded-lg px-3 py-2 text-sm text-white outline-none"
                style={inputStyle}
                value={g.name}
                placeholder="Guest name"
                onChange={(e) => updateGuest(i, "name", e.target.value)}
              />
              <input
                className="rounded-lg px-3 py-2 text-sm text-white outline-none"
                style={inputStyle}
                value={g.title}
                placeholder="Role / company"
                onChange={(e) => updateGuest(i, "title", e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeGuest(i)}
                className="text-xs font-bold px-3 py-2 rounded-lg"
                style={{ border: "1px solid #333", color: "#aaa" }}
              >
                remove
              </button>
              <div className="md:col-span-3">
                <ImageField
                  label="guest photo"
                  value={g.photo_url}
                  pathPrefix="guests"
                  onUploaded={(url) => updateGuest(i, "photo_url", url)}
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addGuest}
            className="text-xs font-bold px-3 py-1.5 rounded-lg"
            style={{ border: `1px solid ${Y}`, color: Y }}
          >
            + add guest
          </button>
        </div>
      </div>

      <div className="md:col-span-2 flex gap-2 pt-1">
        <button
          onClick={() => onSave("draft")}
          disabled={saving}
          className="text-xs font-bold px-4 py-2 rounded-lg"
          style={{ border: "1px solid #333", color: "#aaa" }}
        >
          {saving ? "saving…" : "save as draft"}
        </button>
        <button
          onClick={() => onSave("published")}
          disabled={saving}
          className="text-xs font-black px-4 py-2 rounded-lg"
          style={{ background: Y, color: "#111" }}
        >
          {saving ? "saving…" : "publish"}
        </button>
        <button
          onClick={onCancel}
          className="text-xs font-bold px-4 py-2 rounded-lg"
          style={{ border: "1px solid #333", color: "#aaa" }}
        >
          cancel
        </button>
      </div>
    </div>
  );
}

// Past events are added after the fact, from what's already on Luma /
// YouTube: type, title, byline, date, the YouTube link, a thumbnail, the
// registered count, "About the session" and one card per speaker. Same
// form state as EventForm, so saving goes through formToPayload and any
// field this form doesn't show is kept as it was.
function PastEventForm({ form, setForm, onSave, onCancel, saving, onShowAllFields }) {
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function updateSpeaker(i, key, value) {
    setForm((f) => ({ ...f, speakers: f.speakers.map((sp, idx) => (idx === i ? { ...sp, [key]: value } : sp)) }));
  }
  function addSpeaker() {
    setForm((f) => ({ ...f, speakers: [...f.speakers, { ...EMPTY_SPEAKER }] }));
  }
  function removeSpeaker(i) {
    setForm((f) => ({ ...f, speakers: f.speakers.filter((_, idx) => idx !== i) }));
  }

  const link = form.recording_url.trim();
  const isYouTube = !!link && toEmbedUrl(link) !== link;
  const inFuture = form.date && new Date(`${form.date}T23:59:59+05:30`) > new Date();

  return (
    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="md:col-span-2">
        <label className="text-xs font-semibold mb-1 block" style={labelStyle}>
          type
        </label>
        <div className="inline-flex rounded-lg p-1 gap-1" style={inputStyle}>
          {PAST_EVENT_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setForm((f) => ({ ...f, event_type: t }))}
              className="text-xs font-bold px-4 py-1.5 rounded-md"
              style={form.event_type === t ? { background: Y, color: "#111" } : { color: "#aaa" }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="md:col-span-2">
        <Field
          label="title"
          value={form.title}
          placeholder="Service Design 101: Designing the Intangible"
          onChange={(e) => {
            const title = e.target.value;
            setForm((f) => ({ ...f, title, slug: f._slugTouched ? f.slug : slugify(title) }));
          }}
        />
      </div>
      <Field
        label="speakers (shown as “by …” under the title)"
        value={form.speaker_name}
        placeholder="Abhinav & Nandini"
        onChange={set("speaker_name")}
      />
      <Field
        label="slug (public URL: /events/...)"
        value={form.slug}
        onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value), _slugTouched: true }))}
      />

      <div>
        <Field type="date" label="date it happened" value={form.date} onChange={set("date")} />
        {inFuture && (
          <p className="text-[11px] mt-1" style={{ color: "#f59e0b" }}>
            This date is in the future, so it will show under upcoming, not past.
          </p>
        )}
      </div>
      <Field
        type="number"
        min="0"
        label="registered"
        value={form.attendee_count}
        placeholder="204"
        onChange={set("attendee_count")}
      />

      <div className="md:col-span-2">
        <Field
          label="YouTube recording link"
          value={form.recording_url}
          placeholder="https://youtu.be/..."
          onChange={set("recording_url")}
        />
        <p className="text-[11px] mt-1" style={{ color: link && !isYouTube ? "#f59e0b" : "#888" }}>
          {link && !isYouTube
            ? "Not a YouTube link. It will be embedded as-is, so it must be an embeddable player URL."
            : "Set the video to Unlisted on YouTube (not Private, which won't play on the site). Any YouTube link format works."}
        </p>
      </div>

      <ImageField
        label="thumbnail (16:9, shown before play and in event lists)"
        value={form.cover_image_url}
        pathPrefix="covers"
        onUploaded={(url) => setForm((f) => ({ ...f, cover_image_url: url }))}
      />
      <Field
        type="number"
        min="0"
        label="recording length in minutes (optional)"
        value={form.recording_duration_min}
        onChange={set("recording_duration_min")}
      />

      <div className="md:col-span-2">
        <TextAreaField
          label="about the session (line breaks and emoji are kept as typed)"
          rows={10}
          value={form.description}
          onChange={set("description")}
        />
      </div>

      <div className="md:col-span-2">
        <label className="text-xs font-semibold mb-1 block" style={labelStyle}>
          about the speakers
        </label>
        <div className="space-y-3">
          {form.speakers.map((sp, i) => (
            <div
              key={i}
              className="rounded-lg p-3 grid grid-cols-1 md:grid-cols-2 gap-2"
              style={{ backgroundColor: "#0d0d0d", border: "1px solid #1a1a1a" }}
            >
              <input
                className="rounded-lg px-3 py-2 text-sm font-bold text-white outline-none"
                style={inputStyle}
                value={sp.name}
                placeholder="Full name (e.g. Nandini Kulkarni)"
                onChange={(e) => updateSpeaker(i, "name", e.target.value)}
              />
              <input
                className="rounded-lg px-3 py-2 text-sm text-white outline-none"
                style={inputStyle}
                value={sp.role}
                placeholder="Role, company (e.g. CEO, Idiom Circular Services)"
                onChange={(e) => updateSpeaker(i, "role", e.target.value)}
              />
              <textarea
                className="md:col-span-2 rounded-lg px-3 py-2 text-sm text-white outline-none resize-y"
                style={inputStyle}
                rows={5}
                value={sp.bio}
                placeholder="Bio"
                onChange={(e) => updateSpeaker(i, "bio", e.target.value)}
              />
              <input
                className="rounded-lg px-3 py-2 text-sm text-white outline-none"
                style={inputStyle}
                value={sp.linkedin}
                placeholder="LinkedIn URL"
                onChange={(e) => updateSpeaker(i, "linkedin", e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeSpeaker(i)}
                className="text-xs font-bold px-3 py-2 rounded-lg md:justify-self-end"
                style={{ border: "1px solid #333", color: "#aaa" }}
              >
                remove speaker
              </button>
              <div className="md:col-span-2">
                <ImageField
                  label="photo (optional, initials are shown otherwise)"
                  value={sp.photo_url}
                  pathPrefix="speakers"
                  onUploaded={(url) => updateSpeaker(i, "photo_url", url)}
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addSpeaker}
            className="text-xs font-bold px-3 py-1.5 rounded-lg"
            style={{ border: `1px solid ${Y}`, color: Y }}
          >
            + add speaker
          </button>
        </div>
      </div>

      <Field
        type="number"
        min="0"
        label="recording price after the trial (₹, blank = ₹30, 0 = free)"
        value={form.recording_price_inr}
        placeholder="30"
        onChange={set("recording_price_inr")}
      />

      <div className="md:col-span-2 flex flex-wrap items-center gap-2 pt-1">
        <button
          onClick={() => onSave("draft")}
          disabled={saving}
          className="text-xs font-bold px-4 py-2 rounded-lg"
          style={{ border: "1px solid #333", color: "#aaa" }}
        >
          {saving ? "saving…" : "save as draft"}
        </button>
        <button
          onClick={() => onSave("published")}
          disabled={saving}
          className="text-xs font-black px-4 py-2 rounded-lg"
          style={{ background: Y, color: "#111" }}
        >
          {saving ? "saving…" : "publish"}
        </button>
        <button
          onClick={onCancel}
          className="text-xs font-bold px-4 py-2 rounded-lg"
          style={{ border: "1px solid #333", color: "#aaa" }}
        >
          cancel
        </button>
        {onShowAllFields && (
          <button type="button" onClick={onShowAllFields} className="text-xs underline ml-auto" style={{ color: "#888" }}>
            show all fields
          </button>
        )}
      </div>
    </div>
  );
}

const REG_STATUS_COLOR = { registered: "#22c55e", pending: "#f59e0b", rejected: "#ef4444", cancelled: "#666" };
const REG_STATUS_LABEL = { registered: "going", pending: "pending", rejected: "declined", cancelled: "cancelled" };

function formatAnswer(v) {
  if (Array.isArray(v)) return v.join(", ");
  if (v === true) return "yes";
  if (v === false || v == null) return "";
  return String(v);
}

function referrerHost(ref) {
  try {
    return ref ? new URL(ref).hostname.replace(/^www\./, "") : "";
  } catch {
    return "";
  }
}

const UTM_PRESETS = ["instagram", "linkedin", "whatsapp", "discord", "email", "newsletter"];

function UtmLinkBuilder({ event }) {
  const [utm, setUtm] = useState({ source: "", medium: "social", campaign: event.slug });
  const [copied, setCopied] = useState(false);
  const params = new URLSearchParams();
  if (utm.source) params.set("utm_source", utm.source);
  if (utm.medium) params.set("utm_medium", utm.medium);
  if (utm.campaign) params.set("utm_campaign", utm.campaign);
  const url = `${window.location.origin}/events/${event.slug}${utm.source ? `?${params}` : ""}`;

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-white">Tracked link (UTM)</p>
      <div className="flex flex-wrap gap-1">
        {UTM_PRESETS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setUtm((u) => ({ ...u, source: s, medium: s === "email" || s === "newsletter" ? "email" : "social" }))}
            className="text-[11px] font-bold px-2.5 py-1 rounded-md"
            style={utm.source === s ? { background: Y, color: "#111" } : smallBtn}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {["source", "medium", "campaign"].map((k) => (
          <input
            key={k}
            className="rounded-lg px-3 py-2 text-xs text-white outline-none"
            style={inputStyle}
            placeholder={`utm_${k}`}
            value={utm[k]}
            onChange={(e) => setUtm((u) => ({ ...u, [k]: e.target.value.trim().toLowerCase().replace(/\s+/g, "-") }))}
          />
        ))}
      </div>
      <div className="flex gap-2 items-center">
        <code className="flex-1 text-[11px] truncate px-3 py-2 rounded-lg" style={{ ...inputStyle, color: "#aaa" }}>
          {url}
        </code>
        <button
          type="button"
          disabled={!utm.source}
          onClick={() => {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="text-xs font-bold px-3 py-2 rounded-lg disabled:opacity-40"
          style={{ border: `1px solid ${Y}`, color: Y }}
        >
          {copied ? "copied!" : "copy"}
        </button>
      </div>
    </div>
  );
}

function RegistrantsPanel({ event, registrants, onReview, onAttended }) {
  const [filter, setFilter] = useState(event.requires_approval ? "pending" : "all");
  const count = (s) => registrants.filter((r) => r.status === s).length;
  const going = count("registered");
  const pending = count("pending");
  const attended = registrants.filter((r) => r.attended).length;
  const questions = event.registration_questions || [];

  const bySource = {};
  registrants
    .filter((r) => r.status !== "cancelled")
    .forEach((r) => {
      const key = r.utm_source || (r.source === "admin_invite" ? "admin invite" : referrerHost(r.referrer) || "direct");
      bySource[key] = (bySource[key] || 0) + 1;
    });
  const sources = Object.entries(bySource).sort((a, b) => b[1] - a[1]);

  const shown = filter === "all" ? registrants : registrants.filter((r) => r.status === filter);

  function exportCsv() {
    downloadCSV(
      `${event.slug}-registrants.csv`,
      registrants.map((r) => ({
        name: r.profile?.name || r.invitee_name || "",
        username: r.profile?.username || "",
        email: r.profile?.email || r.invitee_email || "",
        registered_at: r.registered_at,
        status: REG_STATUS_LABEL[r.status] || r.status,
        attended: r.attended ? "yes" : "",
        source: r.source,
        utm_source: r.utm_source || "",
        utm_medium: r.utm_medium || "",
        utm_campaign: r.utm_campaign || "",
        referrer: r.referrer || "",
        question_category: r.question_category || "",
        question_text: r.question_text || "",
        question_anonymous: r.question_anonymous,
        ...Object.fromEntries(questions.map((q) => [q.label, formatAnswer(r.answers?.[q.id])]))
      }))
    );
  }

  return (
    <div className="border-t pt-3 space-y-3" style={{ borderColor: "#1f1f1f" }}>
      <div className="flex flex-wrap gap-2">
        {[
          ["going", going, REG_STATUS_COLOR.registered],
          ...(event.capacity != null ? [["spots left", Math.max(0, event.capacity - going), "#aaa"]] : []),
          ["pending", pending, REG_STATUS_COLOR.pending],
          ["declined", count("rejected"), REG_STATUS_COLOR.rejected],
          ["cancelled", count("cancelled"), "#666"],
          ["attended", attended, Y]
        ].map(([label, n, color]) => (
          <div key={label} className="rounded-lg px-3 py-2 min-w-[80px]" style={{ backgroundColor: "#0d0d0d", border: "1px solid #1a1a1a" }}>
            <p className="text-lg font-black" style={{ color }}>{n}</p>
            <p className="text-[10px] uppercase tracking-wide" style={{ color: "#666" }}>{label}</p>
          </div>
        ))}
      </div>

      {sources.length > 0 && (
        <div>
          <p className="text-xs font-bold text-white mb-1">Where registrations came from</p>
          <div className="flex flex-wrap gap-1.5 text-[11px]">
            {sources.map(([src, n]) => (
              <span key={src} className="px-2.5 py-1 rounded-md" style={{ backgroundColor: "#1a1a1a", color: "#ccc" }}>
                {src} <span style={{ color: Y }}>{n}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {[
            ["all", `all (${registrants.length})`],
            ["registered", `going (${going})`],
            ["pending", `pending (${pending})`],
            ["rejected", `declined (${count("rejected")})`]
          ].map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className="text-xs font-bold px-3 py-1.5 rounded-md"
              style={filter === k ? { background: Y, color: "#111" } : smallBtn}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {pending > 0 && (
            <button
              type="button"
              onClick={() => {
                if (!confirm(`Approve all ${pending} pending requests?`)) return;
                registrants.filter((r) => r.status === "pending").forEach((r) => onReview(r, "registered"));
              }}
              className="text-xs font-bold px-3 py-1.5 rounded-lg"
              style={{ border: "1px solid #22c55e55", color: "#22c55e" }}
            >
              approve all pending
            </button>
          )}
          <button
            onClick={exportCsv}
            disabled={registrants.length === 0}
            className="text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-40"
            style={smallBtn}
          >
            export CSV
          </button>
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="text-xs" style={{ color: "#555" }}>Nobody here yet.</p>
      ) : (
        <div className="space-y-2 text-xs" style={{ color: "#aaa" }}>
          {shown.map((r) => (
            <div key={r.id} className="rounded-lg p-3" style={{ backgroundColor: "#0d0d0d", border: "1px solid #1a1a1a" }}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="min-w-0">
                  <span className="text-white font-bold">{r.profile?.name || r.invitee_name || "—"}</span> ·{" "}
                  {r.profile?.email || r.invitee_email || "—"} · {fmtDt(r.registered_at)}
                  <span className="ml-2 text-[10px] font-bold uppercase tracking-wide" style={{ color: REG_STATUS_COLOR[r.status] }}>
                    {REG_STATUS_LABEL[r.status] || r.status}
                  </span>
                  {r.source === "admin_invite" && (
                    <span className="ml-2 text-[10px] font-bold uppercase tracking-wide" style={{ color: Y }}>
                      invited
                    </span>
                  )}
                  {r.utm_source && (
                    <span className="ml-2 text-[10px]" style={{ color: "#888" }}>
                      via {r.utm_source}
                      {r.utm_campaign ? ` / ${r.utm_campaign}` : ""}
                    </span>
                  )}
                  {r.status === "registered" && !r.calendar_synced && (
                    <span className="ml-2 text-[10px]" style={{ color: "#666" }}>
                      (calendar/email pending)
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-2">
                  {r.status === "pending" && (
                    <>
                      <button
                        type="button"
                        onClick={() => onReview(r, "registered")}
                        className="text-xs font-bold px-3 py-1 rounded-lg"
                        style={{ background: "#22c55e", color: "#111" }}
                      >
                        approve
                      </button>
                      <button
                        type="button"
                        onClick={() => onReview(r, "rejected")}
                        className="text-xs font-bold px-3 py-1 rounded-lg"
                        style={{ border: "1px solid #ef444455", color: "#ef4444" }}
                      >
                        decline
                      </button>
                    </>
                  )}
                  {r.status === "rejected" && (
                    <button type="button" onClick={() => onReview(r, "registered")} className="text-xs font-bold px-3 py-1 rounded-lg" style={smallBtn}>
                      approve instead
                    </button>
                  )}
                  {r.status === "registered" && (
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={!!r.attended} onChange={(e) => onAttended(r, e.target.checked)} style={{ accentColor: Y }} />
                      attended
                    </label>
                  )}
                </div>
              </div>
              {r.question_text && (
                <p className="mt-1" style={{ color: "#888" }}>
                  {r.question_anonymous ? "anonymous" : "asked"}
                  {r.question_category ? ` · ${r.question_category}` : ""}: "{r.question_text}"
                </p>
              )}
              {questions.some((q) => formatAnswer(r.answers?.[q.id])) && (
                <div className="mt-1 space-y-0.5">
                  {questions.map((q) =>
                    formatAnswer(r.answers?.[q.id]) ? (
                      <p key={q.id}>
                        <span style={{ color: "#666" }}>{q.label}:</span> {formatAnswer(r.answers[q.id])}
                      </p>
                    ) : null
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function eventToForm(event) {
  const { date, time } = utcToIst(event.start_time);
  const durationMinutes =
    event.start_time && event.end_time
      ? Math.round((new Date(event.end_time) - new Date(event.start_time)) / 60000)
      : 60;
  return {
    _id: event.id,
    title: event.title || "",
    slug: event.slug || "",
    _slugTouched: true,
    event_type: EVENT_TYPES.includes(event.event_type) ? event.event_type : EVENT_TYPES[0],
    description: event.description || "",
    questionCategories: event.question_categories?.length
      ? event.question_categories.map((c) => ({ name: c.name || "", questions: c.questions?.length ? c.questions : [""] }))
      : [{ name: "", questions: [""] }],
    date,
    time,
    durationMinutes: String(durationMinutes),
    speaker_name: event.speaker_name || "",
    speaker_title: event.speaker_title || "",
    speaker_bio: event.speaker_bio || "",
    speaker_photo_url: event.speaker_photo_url || "",
    speaker_socials: event.speaker_socials?.length ? event.speaker_socials : [""],
    cover_image_url: event.cover_image_url || "",
    join_link: event.join_link || "",
    capacity: event.capacity ?? "",
    price_inr: event.price_inr ?? "",
    recording_price_inr: event.recording_price_inr ?? "",
    recording_path: event.recording_path || "",
    recording_url: event._recording_link || event.recording_url || "",
    recording_thumbnail_url: event.recording_thumbnail_url || "",
    recording_duration_min: event.recording_duration_min ?? "",
    guests: event.guests?.length ? event.guests : [{ name: "", title: "", photo_url: "" }],
    attendee_count: event.attendee_count ?? "",
    speakers: event.speakers?.length
      ? event.speakers.map((sp) => ({ ...EMPTY_SPEAKER, ...sp }))
      : [{ ...EMPTY_SPEAKER }],
    about_sections: event.about_sections || [],
    requires_approval: !!event.requires_approval,
    registration_open: event.registration_open !== false,
    closes_date: event.registration_closes_at ? utcToIst(event.registration_closes_at).date : "",
    closes_time: event.registration_closes_at ? utcToIst(event.registration_closes_at).time : "",
    collect_speaker_question: event.collect_speaker_question !== false,
    registration_questions: event.registration_questions || [],
    recurrence: EMPTY_RECURRENCE,
    series_id: event.series_id || null,
    _recurrenceRaw: event.recurrence || null,
    applyToSeries: false
  };
}

const cleanQuestions = (questions) =>
  questions
    .map((q) => ({ ...q, label: q.label.trim(), options: (q.options || []).map((o) => o.trim()).filter(Boolean) }))
    .filter((q) => q.label && (q.type !== "options" || q.options.length));

function recurrenceFromForm(r) {
  if (!r.freq) return null;
  return {
    freq: r.freq,
    interval: Math.max(1, parseInt(r.interval, 10) || 1),
    weekdays: r.freq === "weekly" ? r.weekdays : [],
    ends:
      r.endsType === "on" && r.endsDate
        ? { type: "on", date: r.endsDate }
        : r.endsType === "after"
          ? { type: "after", count: Math.min(60, Math.max(2, parseInt(r.endsCount, 10) || 2)) }
          : { type: "never" }
  };
}

// fields a series shares — "apply to all upcoming sessions" copies these
const SERIES_SKIP_FIELDS = ["id", "slug", "start_time", "end_time", "status", "recording_path", "recording_url", "has_recording_link", "attendee_count", "recurrence", "series_id"];

// a series' close time is "this long before the session starts", so each
// occurrence gets its own
function shiftedCloseTime(template, startMs) {
  if (!template.registration_closes_at) return null;
  const before = new Date(template.start_time) - new Date(template.registration_closes_at);
  return new Date(startMs - before).toISOString();
}

// Turns a just-saved event into the first session of a series: tags it
// with series_id + recurrence and inserts the later occurrences, each
// named "<slug>-YYYY-MM-DD". Open-ended series are topped up later by the
// events-notify cron.
async function saveSeries(saved, recurrence) {
  const seriesId = crypto.randomUUID();
  const rec = { ...recurrence, slug: saved.slug };
  const lengthMs = saved.end_time ? new Date(saved.end_time) - new Date(saved.start_time) : 3600000;
  const times = seriesOccurrences(saved.start_time, rec).slice(1);
  const base = Object.fromEntries(Object.entries(saved).filter(([k]) => !["id", "created_at", "updated_at", "google_calendar_event_id"].includes(k)));
  const rows = times.map((t) => ({
    ...base,
    slug: `${saved.slug}-${new Date(t + 5.5 * 3600000).toISOString().slice(0, 10)}`,
    start_time: new Date(t).toISOString(),
    end_time: new Date(t + lengthMs).toISOString(),
    registration_closes_at: shiftedCloseTime(saved, t),
    series_id: seriesId,
    recurrence: rec
  }));
  const { data: first, error: e1 } = await supabaseAdmin
    .from("events")
    .update({ series_id: seriesId, recurrence: rec })
    .eq("id", saved.id)
    .select()
    .single();
  if (e1) throw e1;
  const { data: more, error: e2 } = rows.length ? await supabaseAdmin.from("events").insert(rows).select() : { data: [] };
  if (e2) throw e2;
  return [first, ...(more || [])];
}

const intOrNull = (v) => (v === "" || v == null ? null : parseInt(v, 10));

function formToPayload(form, status) {
  const start_time = istToUtc(form.date, form.time);
  const durationMinutes = parseInt(form.durationMinutes, 10) || 0;
  const end_time = start_time ? new Date(new Date(start_time).getTime() + durationMinutes * 60000).toISOString() : null;
  return {
    id: form._id,
    title: form.title.trim(),
    slug: slugify(form.slug || form.title),
    event_type: form.event_type || EVENT_TYPES[0],
    description: form.description.trim() || null,
    question_categories: form.questionCategories
      .map((c) => ({ name: c.name.trim(), questions: c.questions.map((q) => q.trim()).filter(Boolean) }))
      .filter((c) => c.name),
    start_time,
    end_time,
    speaker_name: form.speaker_name.trim() || null,
    speaker_title: form.speaker_title.trim() || null,
    speaker_bio: form.speaker_bio.trim() || null,
    speaker_photo_url: form.speaker_photo_url || null,
    speaker_socials: form.speaker_socials.map((s) => s.trim()).filter(Boolean),
    cover_image_url: form.cover_image_url || null,
    join_link: form.join_link.trim() || null,
    capacity: form.capacity === "" ? null : parseInt(form.capacity, 10),
    price_inr: intOrNull(form.price_inr),
    recording_price_inr: intOrNull(form.recording_price_inr),
    recording_path: form.recording_path || null,
    // the link itself is saved to event_recording_links (saveRecordingLink)
    recording_url: null,
    has_recording_link: !!form.recording_url.trim(),
    recording_thumbnail_url: form.recording_thumbnail_url || null,
    recording_duration_min: intOrNull(form.recording_duration_min),
    guests: form.guests
      .map((g) => ({ name: g.name.trim(), title: g.title.trim(), photo_url: g.photo_url || "" }))
      .filter((g) => g.name),
    attendee_count: intOrNull(form.attendee_count),
    speakers: form.speakers
      .map((sp) => ({
        name: sp.name.trim(),
        role: sp.role.trim(),
        bio: sp.bio.trim(),
        linkedin: sp.linkedin.trim(),
        photo_url: sp.photo_url || ""
      }))
      .filter((sp) => sp.name),
    about_sections: (form.about_sections || [])
      .map((s) => ({ title: s.title.trim(), body: s.body.trim() }))
      .filter((s) => s.title || s.body),
    requires_approval: !!form.requires_approval,
    registration_open: form.registration_open !== false,
    registration_closes_at: form.closes_date ? istToUtc(form.closes_date, form.closes_time || "23:59") : null,
    collect_speaker_question: form.collect_speaker_question !== false,
    registration_questions: cleanQuestions(form.registration_questions || []),
    status
  };
}

export default function EventsTab() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [registrantsByEvent, setRegistrantsByEvent] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [creating, setCreating] = useState(null); // null | "upcoming" | "past"
  const [createForm, setCreateForm] = useState(newEventForm);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [inviteForm, setInviteForm] = useState({ email: "", name: "" });
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [listFilter, setListFilter] = useState("upcoming");

  // upcoming soonest-first, past most-recent-first
  const visibleEvents =
    listFilter === "upcoming"
      ? events.filter((e) => !isEventOver(e)).sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
      : listFilter === "past"
        ? events.filter((e) => isEventOver(e))
        : events;

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data: eventRows } = await supabaseAdmin.from("events").select("*").order("start_time", { ascending: false });
    const eventIds = (eventRows || []).map((e) => e.id);

    const { data: registrations } = eventIds.length
      ? await supabaseAdmin.from("event_registrations").select("*").in("event_id", eventIds)
      : { data: [] };

    const { data: links } = eventIds.length
      ? await supabaseAdmin.from("event_recording_links").select("event_id, url").in("event_id", eventIds)
      : { data: [] };
    const linkByEvent = Object.fromEntries((links || []).map((l) => [l.event_id, l.url]));

    const userIds = [...new Set((registrations || []).map((r) => r.user_id).filter(Boolean))];
    const { data: profiles } = userIds.length
      ? await supabaseAdmin.from("profiles").select("id, name, username, email").in("id", userIds)
      : { data: [] };
    const profileById = Object.fromEntries((profiles || []).map((p) => [p.id, p]));

    const byEvent = {};
    (registrations || []).forEach((r) => {
      byEvent[r.event_id] = byEvent[r.event_id] || [];
      byEvent[r.event_id].push({ ...r, profile: profileById[r.user_id] });
    });

    setEvents((eventRows || []).map((e) => ({ ...e, _recording_link: linkByEvent[e.id] || "" })));
    setRegistrantsByEvent(byEvent);
    setLoading(false);
  }

  async function handleCreate(status) {
    if (!createForm.title.trim() || !createForm.date) return;
    setSaving(true);
    const payload = formToPayload(createForm, status);
    const { data, error } = await supabaseAdmin.from("events").insert(payload).select().single();
    if (error) {
      setSaving(false);
      alert(error.message);
      return;
    }
    const link = createForm.recording_url.trim();
    await saveRecordingLink(data.id, link);
    let rows = [data];
    const recurrence = creating === "upcoming" ? recurrenceFromForm(createForm.recurrence) : null;
    if (recurrence) {
      try {
        rows = await saveSeries(data, recurrence);
      } catch (err) {
        alert(`Event saved, but the repeating sessions weren't: ${err.message}`);
      }
    }
    setSaving(false);
    setEvents((prev) =>
      [...rows.map((r) => ({ ...r, _recording_link: r.id === data.id ? link : "" })), ...prev].sort(
        (a, b) => new Date(b.start_time) - new Date(a.start_time)
      )
    );
    setCreating(null);
    setCreateForm(newEventForm());
    if (data.status === "published") syncCalendar(data.id);
  }

  function openEdit(event) {
    setEditForm(eventToForm(event));
    setExpandedId(event.id);
  }

  async function handleUpdate(event, status) {
    if (!editForm.title.trim() || !editForm.date) return;
    setSaving(true);
    const payload = formToPayload(editForm, status);
    const { data, error } = await supabaseAdmin.from("events").update(payload).eq("id", event.id).select().single();
    if (error) {
      setSaving(false);
      alert(error.message);
      return;
    }
    const link = editForm.recording_url.trim();
    await saveRecordingLink(event.id, link);

    const recurrence = !event.series_id ? recurrenceFromForm(editForm.recurrence) : null;
    try {
      if (recurrence) {
        await saveSeries(data, recurrence);
      } else if (event.series_id && editForm.applyToSeries) {
        const shared = Object.fromEntries(Object.entries(payload).filter(([k]) => !SERIES_SKIP_FIELDS.includes(k)));
        const { data: upcoming } = await supabaseAdmin
          .from("events")
          .select("id, start_time")
          .eq("series_id", event.series_id)
          .neq("id", event.id)
          .gt("start_time", new Date().toISOString());
        for (const occ of upcoming || []) {
          const { error: e } = await supabaseAdmin
            .from("events")
            .update({ ...shared, registration_closes_at: shiftedCloseTime(data, new Date(occ.start_time).getTime()) })
            .eq("id", occ.id);
          if (e) throw e;
        }
      }
    } catch (err) {
      alert(`This session saved, but the rest of the series didn't update: ${err.message}`);
    }
    setSaving(false);
    setEditForm(null);
    if (recurrence || editForm.applyToSeries) await fetchData();
    else setEvents((prev) => prev.map((e) => (e.id === event.id ? { ...data, _recording_link: link } : e)));
    if (data.status === "published") syncCalendar(data.id);
  }

  async function patchEvent(event, patch) {
    const { data, error } = await supabaseAdmin.from("events").update(patch).eq("id", event.id).select().single();
    if (error) {
      alert(error.message);
      return;
    }
    setEvents((prev) => prev.map((e) => (e.id === event.id ? { ...data, _recording_link: e._recording_link } : e)));
  }

  // a live session that's wrapped up early — moves it to Past right away
  function endSessionNow(event) {
    if (!confirm(`End "${event.title}" now? It moves to past events.`)) return;
    patchEvent(event, { end_time: new Date().toISOString(), registration_open: false });
  }

  // Stops a series after this session: later sessions nobody has registered
  // for are deleted, the rest stay (cancel those by hand), and the series no
  // longer tops itself up.
  async function endSeriesAfter(event) {
    if (!confirm(`Stop "${event.title}" repeating after this session?`)) return;
    const { data: later } = await supabaseAdmin
      .from("events")
      .select("id")
      .eq("series_id", event.series_id)
      .gt("start_time", event.start_time);
    const laterIds = (later || []).map((e) => e.id);
    const keep = laterIds.filter((id) => (registrantsByEvent[id] || []).length > 0);
    const drop = laterIds.filter((id) => !keep.includes(id));
    if (drop.length) {
      const { error } = await supabaseAdmin.from("events").delete().in("id", drop);
      if (error) {
        alert(error.message);
        return;
      }
    }
    const endDate = utcToIst(event.start_time).date;
    const rec = { ...(event.recurrence || {}), ends: { type: "on", date: endDate } };
    await supabaseAdmin.from("events").update({ recurrence: rec }).eq("series_id", event.series_id);
    if (keep.length) alert(`${keep.length} later session(s) already have registrations, so they were kept. Cancel them individually if needed.`);
    await fetchData();
  }

  async function reviewRegistration(reg, status) {
    const { error } = await supabaseAdmin
      .from("event_registrations")
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq("id", reg.id);
    if (error) {
      alert(error.message);
      return;
    }
    // approved → calendar invite + confirmation; declined → a short note
    callEventsNotify({ mode: "notify", registration_id: reg.id }).catch((err) =>
      alert(`Saved, but the email/calendar step failed: ${err.message}`)
    );
    setRegistrantsByEvent((prev) => ({
      ...prev,
      [reg.event_id]: prev[reg.event_id].map((r) => (r.id === reg.id ? { ...r, status, reviewed_at: new Date().toISOString() } : r))
    }));
  }

  async function setAttended(reg, attended) {
    const { error } = await supabaseAdmin.from("event_registrations").update({ attended }).eq("id", reg.id);
    if (error) {
      alert(error.message);
      return;
    }
    setRegistrantsByEvent((prev) => ({
      ...prev,
      [reg.event_id]: prev[reg.event_id].map((r) => (r.id === reg.id ? { ...r, attended } : r))
    }));
  }

  async function handleCancelEvent(event) {
    if (!confirm(`Cancel "${event.title}"? Registrants will remain recorded.`)) return;
    const { data, error } = await supabaseAdmin
      .from("events")
      .update({ status: "cancelled" })
      .eq("id", event.id)
      .select()
      .single();
    if (error) {
      alert(error.message);
      return;
    }
    setEvents((prev) => prev.map((e) => (e.id === event.id ? { ...data, _recording_link: e._recording_link } : e)));
  }

  async function handleInvite(event) {
    if (!inviteForm.email.trim()) return;
    setInviting(true);
    setInviteError("");
    setInviteSuccess("");
    try {
      await callEventsNotify({ mode: "invite", event_id: event.id, email: inviteForm.email.trim(), name: inviteForm.name.trim() });
      setInviteSuccess(`Invited ${inviteForm.email.trim()}`);
      setInviteForm({ email: "", name: "" });
      await fetchData();
    } catch (err) {
      setInviteError(err.message);
    } finally {
      setInviting(false);
    }
  }

  function copyLink(event) {
    const url = `${window.location.origin}/events/${event.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(event.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  if (loading) {
    return <p className="text-sm" style={{ color: "#888" }}>loading…</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs font-black uppercase tracking-wide" style={{ color: Y }}>
            events ({visibleEvents.length})
          </p>
          <div className="flex gap-1">
            {["upcoming", "past", "all"].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setListFilter(k)}
                className="text-xs font-bold px-3 py-1 rounded-md"
                style={listFilter === k ? { background: Y, color: "#111" } : smallBtn}
              >
                {k}
              </button>
            ))}
          </div>
        </div>
        {!creating && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setCreateForm(newPastEventForm());
                setCreating("past");
                setExpandedId(null);
              }}
              className="text-xs font-bold px-4 py-2 rounded-lg"
              style={{ border: `1px solid ${Y}`, color: Y }}
            >
              + add past event
            </button>
            <button
              onClick={() => {
                setCreateForm(newEventForm());
                setCreating("upcoming");
                setExpandedId(null);
              }}
              className="text-xs font-black px-4 py-2 rounded-lg"
              style={{ background: Y, color: "#111" }}
            >
              + new event
            </button>
          </div>
        )}
      </div>

      {creating && (
        <div className="rounded-xl p-4" style={{ backgroundColor: "#111", border: `1px solid ${Y}55` }}>
          {creating === "past" ? (
            <>
              <p className="text-xs font-bold text-white mb-1">Add a past event</p>
              <PastEventForm form={createForm} setForm={setCreateForm} onSave={handleCreate} onCancel={() => setCreating(null)} saving={saving} />
            </>
          ) : (
            <>
              <p className="text-xs font-bold text-white mb-1">New event</p>
              <EventForm form={createForm} setForm={setCreateForm} onSave={handleCreate} onCancel={() => setCreating(null)} saving={saving} />
            </>
          )}
        </div>
      )}

      {events.length === 0 && !creating && (
        <p className="text-sm" style={{ color: "#666" }}>No events yet.</p>
      )}

      {visibleEvents.map((event) => {
        const isExpanded = expandedId === event.id;
        const isEditing = isExpanded && editForm;
        const registrants = registrantsByEvent[event.id] || [];
        const pendingCount = registrants.filter((r) => r.status === "pending").length;
        const attendedCount = registrants.filter((r) => r.attended).length;
        const closedReason = registrationClosedReason(event, registrants.filter((r) => r.status === "registered").length);
        return (
          <div key={event.id} className="rounded-xl overflow-hidden" style={{ backgroundColor: "#111", border: "1px solid #1f1f1f" }}>
            <button
              type="button"
              onClick={() => {
                if (isExpanded) {
                  setExpandedId(null);
                  setEditForm(null);
                } else {
                  setExpandedId(event.id);
                  setEditForm(null);
                }
                setCreating(null);
              }}
              className="w-full flex flex-wrap items-center justify-between gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="flex-shrink-0 transition-transform"
                  style={{ color: "#666", transform: isExpanded ? "rotate(90deg)" : "none" }}
                >
                  <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{event.title}</p>
                  <p className="text-xs truncate" style={{ color: "#888" }}>
                    {event.event_type} · {fmtDt(event.start_time)} ·{" "}
                    {event.attendee_count ?? registrants.filter((r) => r.status === "registered").length} going
                    {event.capacity != null ? ` / ${event.capacity}` : ""}
                    {pendingCount > 0 && <span style={{ color: REG_STATUS_COLOR.pending }}> · {pendingCount} pending</span>}
                    {attendedCount > 0 && ` · ${attendedCount} attended`}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {event.series_id && (
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ color: "#a78bfa", border: "1px solid #a78bfa55" }} title={describeRecurrence(event.recurrence)}>
                    ↻ recurring
                  </span>
                )}
                {event.requires_approval && (
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ color: "#f59e0b", border: "1px solid #f59e0b55" }}>
                    approval
                  </span>
                )}
                {event.status === "published" && closedReason && closedReason !== "ended" && (
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ color: "#aaa", border: "1px solid #33333399" }}>
                    {closedReason === "full" ? "full" : "registration closed"}
                  </span>
                )}
              <span
                className="text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full flex-shrink-0"
                style={{ color: STATUS_COLOR[event.status], border: `1px solid ${STATUS_COLOR[event.status]}55` }}
              >
                {event.status}
              </span>
              </div>
            </button>

            {isExpanded && (
              <div className="p-4 pt-0 space-y-3">
                {isEditing ? (
                  isEventOver(event) && !editForm._allFields ? (
                    <PastEventForm
                      form={editForm}
                      setForm={setEditForm}
                      onSave={(status) => handleUpdate(event, status)}
                      onCancel={() => setEditForm(null)}
                      saving={saving}
                      onShowAllFields={() => setEditForm((f) => ({ ...f, _allFields: true }))}
                    />
                  ) : (
                    <EventForm
                      form={editForm}
                      setForm={setEditForm}
                      onSave={(status) => handleUpdate(event, status)}
                      onCancel={() => setEditForm(null)}
                      saving={saving}
                    />
                  )
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => openEdit(event)}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg"
                        style={{ border: `1px solid ${Y}`, color: Y }}
                      >
                        edit
                      </button>
                      {event.status === "published" && (
                        <button
                          onClick={() => copyLink(event)}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg"
                          style={{ border: "1px solid #333", color: "#aaa" }}
                        >
                          {copiedId === event.id ? "copied!" : "copy public link"}
                        </button>
                      )}
                      {event.status === "published" && !isEventOver(event) && (
                        <button
                          onClick={() => patchEvent(event, { registration_open: event.registration_open === false })}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg"
                          style={{ border: "1px solid #333", color: "#aaa" }}
                        >
                          {event.registration_open === false ? "reopen registrations" : "close registrations"}
                        </button>
                      )}
                      {isEventLive(event) && (
                        <button
                          onClick={() => endSessionNow(event)}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg"
                          style={{ border: "1px solid #333", color: "#aaa" }}
                        >
                          end session now
                        </button>
                      )}
                      {event.series_id && event.recurrence?.ends?.type !== "on" && (
                        <button
                          onClick={() => endSeriesAfter(event)}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg"
                          style={{ border: "1px solid #333", color: "#aaa" }}
                        >
                          stop repeating after this
                        </button>
                      )}
                      {event.status !== "cancelled" && (
                        <button
                          onClick={() => handleCancelEvent(event)}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg"
                          style={{ border: "1px solid #ef444455", color: "#ef4444" }}
                        >
                          cancel event
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs" style={{ color: "#aaa" }}>
                      <div>
                        <p className="font-bold text-white mb-1">Session</p>
                        <p className="whitespace-pre-line">{event.description || "no description"}</p>
                        {event.about_sections?.map((s, i) => (
                          <div key={i} className="mt-2">
                            <p className="font-bold text-white">{s.title}</p>
                            <p className="whitespace-pre-line">{s.body}</p>
                          </div>
                        ))}
                        {event.question_categories?.length > 0 && (
                          <div className="mt-1 space-y-1">
                            {event.question_categories.map((cat, i) => (
                              <div key={i}>
                                <p className="font-bold" style={{ color: Y }}>{cat.name}</p>
                                <ul className="list-disc list-inside">
                                  {cat.questions?.map((q, qi) => (
                                    <li key={qi}>{q}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-white mb-1">Speaker / host</p>
                        <p>{event.speaker_name || "—"} {event.speaker_title ? `· ${event.speaker_title}` : ""}</p>
                        <p style={{ color: "#888" }}>{event.speaker_bio || ""}</p>
                        <p className="mt-1">join link: {event.join_link || "not set"}</p>
                        <p>capacity: {event.capacity ?? "unlimited"}</p>
                        <p>
                          registration: {event.requires_approval ? "needs approval" : "open to all"}
                          {event.registration_closes_at ? ` · closes ${fmtDt(event.registration_closes_at)}` : ""}
                        </p>
                        {event.series_id && <p>repeats: {describeRecurrence(event.recurrence)}</p>}
                        {event.registration_questions?.length > 0 && (
                          <p>custom questions: {event.registration_questions.map((q) => q.label).join(" · ")}</p>
                        )}
                      </div>
                    </div>

                    <div className="border-t pt-3 space-y-2" style={{ borderColor: "#1f1f1f" }}>
                      <p className="text-xs font-bold text-white">Invite someone directly</p>
                      <div className="flex flex-wrap gap-2">
                        <input
                          className="rounded-lg px-3 py-2 text-sm text-white outline-none flex-1 min-w-[160px]"
                          style={inputStyle}
                          placeholder="email"
                          value={inviteForm.email}
                          onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
                        />
                        <input
                          className="rounded-lg px-3 py-2 text-sm text-white outline-none flex-1 min-w-[140px]"
                          style={inputStyle}
                          placeholder="name (optional)"
                          value={inviteForm.name}
                          onChange={(e) => setInviteForm((f) => ({ ...f, name: e.target.value }))}
                        />
                        <button
                          onClick={() => handleInvite(event)}
                          disabled={inviting}
                          className="text-xs font-bold px-4 py-2 rounded-lg"
                          style={{ background: Y, color: "#111" }}
                        >
                          {inviting ? "inviting…" : "invite"}
                        </button>
                      </div>
                      {inviteError && <p className="text-xs" style={{ color: "#ef4444" }}>{inviteError}</p>}
                      {inviteSuccess && <p className="text-xs" style={{ color: "#22c55e" }}>{inviteSuccess}</p>}
                    </div>

                    {event.status === "published" && (
                      <div className="border-t pt-3" style={{ borderColor: "#1f1f1f" }}>
                        <UtmLinkBuilder event={event} />
                      </div>
                    )}

                    <RegistrantsPanel event={event} registrants={registrants} onReview={reviewRegistration} onAttended={setAttended} />
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
