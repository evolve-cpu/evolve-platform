import { useEffect, useState } from "react";
import { supabaseAdmin } from "../../supabaseAdminClient";
import { ViewModal, SourceLink } from "./AIProfilesTab";

const Y = "#FFD007";
const inputStyle = { backgroundColor: "#0d0d0d", border: "1px solid #262626" };
const labelStyle = { color: "#666" };
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const STATUS_COLOR = {
  booked: Y,
  verifying: "#60a5fa",
  verified: "#22c55e",
  needs_attention: "#ef4444"
};
const STATUS_LABEL = {
  booked: "call booked",
  verifying: "in review",
  verified: "verified",
  needs_attention: "needs attention"
};

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

// same IST<->UTC convention as EventsTab.jsx/MentorshipV2Tab.jsx
function istToUtc(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCHours(h - 5, m - 30, 0, 0);
  return d.toISOString();
}

async function sendMeetLinkEmail(to_email, to_name, meetLink) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/send-review-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY
    },
    body: JSON.stringify({
      to_email,
      to_name,
      email_subject: "Your evolve verification call link",
      html_content: `
        <p>Hi ${to_name ? to_name.split(" ")[0] : "there"},</p>
        <p>Here's the link for your evolve verification call:</p>
        <p><a href="${meetLink}">${meetLink}</a></p>
        <p>See you there — the evolve team</p>
      `
    })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "email failed");
  return data;
}

function AnswerBlock({ label, answer }) {
  const [signedUrl, setSignedUrl] = useState(null);
  useEffect(() => {
    if (answer?.mode !== "record" || !answer?.audioPath) return;
    let cancelled = false;
    supabaseAdmin.storage
      .from("verification-audio")
      .createSignedUrl(answer.audioPath, 3600)
      .then(({ data }) => {
        if (!cancelled) setSignedUrl(data?.signedUrl || null);
      });
    return () => {
      cancelled = true;
    };
  }, [answer]);

  if (!answer) return null;
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={labelStyle}>
        {label}
      </p>
      {answer.mode === "type" ? (
        <p className="text-xs text-white/80 whitespace-pre-wrap">{answer.text}</p>
      ) : signedUrl ? (
        <audio src={signedUrl} controls className="w-full h-8" />
      ) : (
        <p className="text-xs" style={labelStyle}>
          loading recording…
        </p>
      )}
    </div>
  );
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_START = 8 * 60; // first chip in the time grid, minutes since midnight IST
const DAY_END = 22 * 60; // grid runs up to (not including) this

function toMins(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function toTimeStr(mins) {
  return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
}

function fmtTime(timeStr) {
  const mins = toMins(timeStr);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h % 12 || 12}${m ? `:${String(m).padStart(2, "0")}` : ""} ${h < 12 ? "am" : "pm"}`;
}

// every YYYY-MM-DD from..to inclusive whose weekday is in `days`
function datesInRange(from, to, days) {
  if (!from) return [];
  const end = new Date(`${to || from}T00:00:00Z`);
  const out = [];
  for (let d = new Date(`${from}T00:00:00Z`); d <= end && out.length < 366; d.setUTCDate(d.getUTCDate() + 1)) {
    if (days.includes(d.getUTCDay())) out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function istDateKey(dtStr) {
  return new Date(dtStr).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

function SlotsPanel({ slots, onChange }) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [days, setDays] = useState([0, 1, 2, 3, 4, 5, 6]);
  const [step, setStep] = useState(30);
  const [times, setTimes] = useState([]);
  const [rangeFrom, setRangeFrom] = useState("10:00");
  const [rangeTo, setRangeTo] = useState("13:00");
  const [lastClicked, setLastClicked] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const isRange = !!toDate && toDate !== fromDate;
  const chips = [];
  for (let m = DAY_START; m < DAY_END; m += step) chips.push(toTimeStr(m));

  // what "add" would insert: every chosen date x every chosen time, minus
  // past times and slots that already exist
  const existing = new Set(slots.map((s) => new Date(s.starts_at).getTime()));
  const now = Date.now();
  const dates = datesInRange(fromDate, toDate, isRange ? days : [0, 1, 2, 3, 4, 5, 6]);
  const candidates = dates.flatMap((d) => times.map((t) => istToUtc(d, t)));
  const toInsert = candidates.filter((iso) => {
    const ts = new Date(iso).getTime();
    return ts > now && !existing.has(ts);
  });
  const skipped = candidates.length - toInsert.length;

  function changeStep(next) {
    setStep(next);
    // drop picked times that don't sit on the new grid
    setTimes((prev) => prev.filter((t) => (toMins(t) - DAY_START) % next === 0));
    setLastClicked(null);
  }

  // shift-click selects everything between the last clicked chip and this one
  function toggleTime(t, shiftKey) {
    if (shiftKey && lastClicked) {
      const [a, b] = [toMins(lastClicked), toMins(t)].sort((x, y) => x - y);
      const span = chips.filter((c) => toMins(c) >= a && toMins(c) <= b);
      setTimes((prev) => [...new Set([...prev, ...span])].sort());
    } else {
      setTimes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t].sort()));
    }
    setLastClicked(t);
  }

  function selectRange() {
    const a = toMins(rangeFrom);
    const b = toMins(rangeTo);
    // range end is exclusive: 10:00–13:00 at 60 min gives 10, 11, 12
    const span = chips.filter((c) => toMins(c) >= a && toMins(c) < b);
    setTimes((prev) => [...new Set([...prev, ...span])].sort());
  }

  async function addSlots() {
    if (toInsert.length === 0) return;
    setSaving(true);
    setMsg("");
    const { error } = await supabaseAdmin
      .from("verification_slots")
      .insert(toInsert.map((starts_at) => ({ starts_at })));
    setSaving(false);
    if (error) {
      setMsg(`failed: ${error.message}`);
      return;
    }
    setMsg(`added ${toInsert.length} slot${toInsert.length === 1 ? "" : "s"} ✓`);
    setTimes([]);
    onChange();
  }

  async function removeSlot(id) {
    await supabaseAdmin.from("verification_slots").delete().eq("id", id);
    onChange();
  }

  async function removeDay(ids) {
    if (!window.confirm(`Remove all ${ids.length} open slots on this day?`)) return;
    await supabaseAdmin.from("verification_slots").delete().in("id", ids);
    onChange();
  }

  const open = slots.filter((s) => !s.is_booked);
  const booked = slots.filter((s) => s.is_booked);
  const openByDay = open.reduce((acc, s) => {
    const key = istDateKey(s.starts_at);
    (acc[key] ||= []).push(s);
    return acc;
  }, {});

  const chipBtn = (active) => ({
    background: active ? Y : "#1a1a1a",
    color: active ? "#000" : "#aaa",
    border: `1px solid ${active ? Y : "#262626"}`
  });

  return (
    <div className="rounded-xl p-4" style={inputStyle}>
      <p className="text-sm font-bold text-white mb-3">Available call slots</p>

      {/* 1. dates */}
      <div className="flex flex-wrap items-end gap-2 mb-3">
        <div>
          <label className="text-xs font-semibold mb-1 block" style={labelStyle}>
            From date
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="text-sm text-white rounded-lg px-3 py-2 outline-none"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="text-xs font-semibold mb-1 block" style={labelStyle}>
            To date (optional)
          </label>
          <input
            type="date"
            value={toDate}
            min={fromDate || undefined}
            onChange={(e) => setToDate(e.target.value)}
            className="text-sm text-white rounded-lg px-3 py-2 outline-none"
            style={inputStyle}
          />
        </div>
        {toDate && (
          <button
            type="button"
            onClick={() => setToDate("")}
            className="text-[11px] py-2"
            style={labelStyle}
          >
            single day
          </button>
        )}
      </div>
      {isRange && (
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span className="text-xs mr-1" style={labelStyle}>
            on
          </span>
          {WEEKDAYS.map((w, i) => (
            <button
              key={w}
              type="button"
              onClick={() =>
                setDays((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]))
              }
              className="text-[11px] font-bold rounded-md px-2 py-1"
              style={chipBtn(days.includes(i))}
            >
              {w}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setDays([1, 2, 3, 4, 5])}
            className="text-[11px] ml-1"
            style={labelStyle}
          >
            weekdays
          </button>
          <button
            type="button"
            onClick={() => setDays([0, 1, 2, 3, 4, 5, 6])}
            className="text-[11px]"
            style={labelStyle}
          >
            all
          </button>
        </div>
      )}

      {/* 2. times */}
      <div className="flex flex-wrap items-end gap-2 mb-2 border-t pt-3" style={{ borderColor: "#262626" }}>
        <div>
          <label className="text-xs font-semibold mb-1 block" style={labelStyle}>
            Slot every
          </label>
          <select
            value={step}
            onChange={(e) => changeStep(Number(e.target.value))}
            className="text-sm text-white rounded-lg px-3 py-2 outline-none"
            style={inputStyle}
          >
            {[15, 30, 45, 60].map((n) => (
              <option key={n} value={n}>
                {n} min
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold mb-1 block" style={labelStyle}>
            From (IST)
          </label>
          <input
            type="time"
            value={rangeFrom}
            onChange={(e) => setRangeFrom(e.target.value)}
            className="text-sm text-white rounded-lg px-3 py-2 outline-none"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="text-xs font-semibold mb-1 block" style={labelStyle}>
            To (IST)
          </label>
          <input
            type="time"
            value={rangeTo}
            onChange={(e) => setRangeTo(e.target.value)}
            className="text-sm text-white rounded-lg px-3 py-2 outline-none"
            style={inputStyle}
          />
        </div>
        <button
          type="button"
          onClick={selectRange}
          className="text-xs font-bold rounded-lg px-3 py-2"
          style={{ background: `${Y}22`, color: Y }}
        >
          select range
        </button>
        {times.length > 0 && (
          <button
            type="button"
            onClick={() => setTimes([])}
            className="text-[11px] py-2"
            style={labelStyle}
          >
            clear times
          </button>
        )}
      </div>
      <p className="text-[10px] mb-2" style={labelStyle}>
        click to toggle a time · shift-click to select everything in between
      </p>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {chips.map((t) => (
          <button
            key={t}
            type="button"
            onClick={(e) => toggleTime(t, e.shiftKey)}
            className="text-[11px] font-semibold rounded-md px-2 py-1 select-none"
            style={chipBtn(times.includes(t))}
          >
            {fmtTime(t)}
          </button>
        ))}
      </div>

      {/* 3. confirm */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button
          type="button"
          onClick={addSlots}
          disabled={toInsert.length === 0 || saving}
          className="text-xs font-bold rounded-lg px-4 py-2 disabled:opacity-40"
          style={{ background: Y, color: "#000" }}
        >
          {saving
            ? "adding…"
            : `add ${toInsert.length} slot${toInsert.length === 1 ? "" : "s"}`}
        </button>
        <span className="text-[11px]" style={labelStyle}>
          {dates.length} day{dates.length === 1 ? "" : "s"} × {times.length} time
          {times.length === 1 ? "" : "s"}
          {skipped > 0 && ` · ${skipped} skipped (already exist or in the past)`}
        </span>
        {msg && <span className="text-[11px] text-white/50">{msg}</span>}
      </div>

      {/* existing open slots, grouped by day */}
      <div className="flex flex-col gap-3 border-t pt-3" style={{ borderColor: "#262626" }}>
        {open.length === 0 && (
          <p className="text-xs" style={labelStyle}>
            no open slots
          </p>
        )}
        {Object.entries(openByDay).map(([day, daySlots]) => (
          <div key={day}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-white/80">
                {new Date(`${day}T00:00:00Z`).toLocaleDateString("en-IN", {
                  timeZone: "UTC",
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                })}
              </span>
              <button
                type="button"
                onClick={() => removeDay(daySlots.map((s) => s.id))}
                className="text-[11px] text-red-400 hover:text-red-300"
              >
                remove day
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {daySlots.map((s) => (
                <span
                  key={s.id}
                  className="flex items-center gap-1.5 text-[11px] rounded-md px-2 py-1 text-white/70"
                  style={{ background: "#1a1a1a", border: "1px solid #262626" }}
                >
                  {new Date(s.starts_at).toLocaleTimeString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true
                  })}
                  <button
                    type="button"
                    onClick={() => removeSlot(s.id)}
                    className="text-red-400 hover:text-red-300"
                    aria-label="remove slot"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        ))}
        {booked.length > 0 && (
          <p className="text-[10px]" style={labelStyle}>
            {booked.length} slot{booked.length === 1 ? "" : "s"} currently booked
          </p>
        )}
      </div>
    </div>
  );
}

function BookingRow({ row, onChange }) {
  const [meetLink, setMeetLink] = useState(row.verification_meet_link || "");
  const [notes, setNotes] = useState(row.verification_notes || "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [viewing, setViewing] = useState(false);

  async function saveMeetLinkAndEmail() {
    if (!meetLink.trim()) return;
    setBusy(true);
    setMsg("");
    await supabaseAdmin
      .from("profiles")
      .update({ verification_meet_link: meetLink.trim() })
      .eq("id", row.id);
    try {
      await sendMeetLinkEmail(row.email, row.name, meetLink.trim());
      setMsg("saved + emailed ✓");
    } catch (err) {
      setMsg(`saved, email failed: ${err.message}`);
    }
    setBusy(false);
    onChange();
  }

  async function setStatus(status, extra = {}) {
    setBusy(true);
    await supabaseAdmin
      .from("profiles")
      .update({
        verification_status: status,
        verification_verified_at: status === "verified" ? new Date().toISOString() : null,
        ...extra
      })
      .eq("id", row.id);
    setBusy(false);
    onChange();
  }

  const color = STATUS_COLOR[row.verification_status] || "#94a3b8";

  return (
    <div className="rounded-xl p-4 flex flex-col gap-3" style={inputStyle}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-white">{row.name || "—"}</p>
          <p className="text-xs" style={labelStyle}>
            {row.email}
          </p>
          <p className="text-xs mt-1 text-white/60">
            call:{" "}
            {row.verification_slots?.starts_at
              ? fmtDt(row.verification_slots.starts_at)
              : row.verification_booking_url
                ? "booked on Calendly"
                : fmtDt(null)}
          </p>
        </div>
        <span
          className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full flex-shrink-0"
          style={{ color, background: `${color}22` }}
        >
          {STATUS_LABEL[row.verification_status] || row.verification_status}
        </span>
      </div>

      {/* what they built their profile from + the AI profile itself, to
          look over before the call */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t pt-3 text-xs" style={{ borderColor: "#262626" }}>
        <span style={labelStyle}>
          portfolio: <SourceLink link={row.portfolio_link} fileUrl={row.portfolio_file_url} />
        </span>
        <span style={labelStyle}>
          resume: <SourceLink link={row.resume_link} fileUrl={row.resume_file_url} />
        </span>
        {row.ai_profile ? (
          <button
            type="button"
            onClick={() => setViewing(true)}
            className="ml-auto text-xs font-bold rounded-lg px-3 py-1.5"
            style={{ background: `${Y}22`, color: Y }}
          >
            view AI profile
          </button>
        ) : (
          <span className="ml-auto" style={labelStyle}>
            no AI profile yet
          </span>
        )}
      </div>
      {viewing && (
        <ViewModal
          row={{
            name: row.name,
            email: row.email,
            portfolioLink: row.portfolio_link,
            portfolioFileUrl: row.portfolio_file_url,
            resumeLink: row.resume_link,
            resumeFileUrl: row.resume_file_url,
            socialLinks: row.social_links,
            aiProfile: row.ai_profile,
            aiProfileUpdatedAt: row.ai_profile_updated_at
          }}
          onClose={() => setViewing(false)}
        />
      )}

      <div className="grid sm:grid-cols-2 gap-3 border-t pt-3" style={{ borderColor: "#262626" }}>
        <AnswerBlock label="Tell us about yourself" answer={row.verification_answers?.about} />
        <AnswerBlock label="Career goals" answer={row.verification_answers?.goals} />
      </div>

      <div className="flex flex-col gap-2 border-t pt-3" style={{ borderColor: "#262626" }}>
        <label className="text-xs font-semibold" style={labelStyle}>
          Meet link
        </label>
        <div className="flex gap-2">
          <input
            value={meetLink}
            onChange={(e) => setMeetLink(e.target.value)}
            placeholder="https://meet.google.com/..."
            className="flex-1 text-xs text-white rounded-lg px-3 py-2 outline-none"
            style={inputStyle}
          />
          <button
            type="button"
            onClick={saveMeetLinkAndEmail}
            disabled={busy || !meetLink.trim()}
            className="text-xs font-bold rounded-lg px-3 py-2 disabled:opacity-40 flex-shrink-0"
            style={{ background: Y, color: "#000" }}
          >
            save &amp; email
          </button>
        </div>
        {msg && <p className="text-[11px] text-white/50">{msg}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t pt-3" style={{ borderColor: "#262626" }}>
        {row.verification_status === "booked" && (
          <button
            type="button"
            onClick={() => setStatus("verifying")}
            disabled={busy}
            className="text-xs font-bold rounded-lg px-3 py-2"
            style={{ background: "#60a5fa22", color: "#60a5fa" }}
          >
            mark in review
          </button>
        )}
        {row.verification_status !== "verified" && (
          <button
            type="button"
            onClick={() => setStatus("verified")}
            disabled={busy}
            className="text-xs font-bold rounded-lg px-3 py-2"
            style={{ background: "#22c55e22", color: "#22c55e" }}
          >
            mark verified
          </button>
        )}
        {row.verification_status !== "needs_attention" && (
          <button
            type="button"
            onClick={() => setStatus("needs_attention", { verification_notes: notes.trim() || null })}
            disabled={busy}
            className="text-xs font-bold rounded-lg px-3 py-2"
            style={{ background: "#ef444422", color: "#ef4444" }}
          >
            needs attention
          </button>
        )}
      </div>
      <div>
        <label className="text-xs font-semibold mb-1 block" style={labelStyle}>
          Note shown to user if flagged "needs attention"
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full text-xs text-white rounded-lg px-3 py-2 outline-none resize-none"
          style={inputStyle}
        />
      </div>
    </div>
  );
}

export default function VerificationTab() {
  const [rows, setRows] = useState(null);
  const [slots, setSlots] = useState([]);

  async function loadRows() {
    const { data } = await supabaseAdmin
      .from("profiles")
      .select(
        "id, name, email, portfolio_link, portfolio_file_url, resume_link, resume_file_url, social_links, ai_profile, ai_profile_updated_at, verification_status, verification_answers, verification_meet_link, verification_notes, verification_booking_url, verification_slots!profiles_verification_slot_id_fkey(starts_at)"
      )
      .not("verification_status", "is", null)
      .order("verification_status", { ascending: true });
    setRows(data || []);
  }

  async function loadSlots() {
    const { data } = await supabaseAdmin
      .from("verification_slots")
      .select("id, starts_at, is_booked")
      .order("starts_at", { ascending: true });
    setSlots(data || []);
  }

  useEffect(() => {
    loadRows();
    loadSlots();
  }, []);

  const active = (rows || []).filter((r) =>
    ["booked", "verifying"].includes(r.verification_status)
  );
  const decided = (rows || []).filter((r) =>
    ["verified", "needs_attention"].includes(r.verification_status)
  );

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <SlotsPanel slots={slots} onChange={loadSlots} />

      <div>
        <p className="text-sm font-bold text-white mb-3">
          Needs review ({active.length})
        </p>
        <div className="flex flex-col gap-3">
          {rows === null && (
            <p className="text-xs" style={labelStyle}>
              loading…
            </p>
          )}
          {rows !== null && active.length === 0 && (
            <p className="text-xs" style={labelStyle}>
              nothing pending
            </p>
          )}
          {active.map((r) => (
            <BookingRow key={r.id} row={r} onChange={loadRows} />
          ))}
        </div>
      </div>

      {decided.length > 0 && (
        <div>
          <p className="text-sm font-bold text-white mb-3">
            Decided ({decided.length})
          </p>
          <div className="flex flex-col gap-3">
            {decided.map((r) => (
              <BookingRow key={r.id} row={r} onChange={loadRows} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
