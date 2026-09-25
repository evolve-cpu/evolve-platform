import { useEffect, useState } from "react";
import { supabaseAdmin } from "../../supabaseAdminClient";

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

function SlotsPanel({ slots, onChange }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("11:00");
  const [saving, setSaving] = useState(false);

  async function addSlot() {
    const starts_at = istToUtc(date, time);
    if (!starts_at) return;
    setSaving(true);
    await supabaseAdmin.from("verification_slots").insert({ starts_at });
    setSaving(false);
    setDate("");
    onChange();
  }

  async function removeSlot(id) {
    await supabaseAdmin.from("verification_slots").delete().eq("id", id);
    onChange();
  }

  const open = slots.filter((s) => !s.is_booked);
  const booked = slots.filter((s) => s.is_booked);

  return (
    <div className="rounded-xl p-4" style={inputStyle}>
      <p className="text-sm font-bold text-white mb-3">Available call slots</p>
      <div className="flex flex-wrap items-end gap-2 mb-4">
        <div>
          <label className="text-xs font-semibold mb-1 block" style={labelStyle}>
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="text-sm text-white rounded-lg px-3 py-2 outline-none"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="text-xs font-semibold mb-1 block" style={labelStyle}>
            Time (IST)
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="text-sm text-white rounded-lg px-3 py-2 outline-none"
            style={inputStyle}
          />
        </div>
        <button
          type="button"
          onClick={addSlot}
          disabled={!date || saving}
          className="text-xs font-bold rounded-lg px-4 py-2 disabled:opacity-40"
          style={{ background: Y, color: "#000" }}
        >
          {saving ? "adding…" : "add slot"}
        </button>
      </div>
      <div className="flex flex-col gap-1.5">
        {open.length === 0 && (
          <p className="text-xs" style={labelStyle}>
            no open slots
          </p>
        )}
        {open.map((s) => (
          <div key={s.id} className="flex items-center justify-between text-xs">
            <span className="text-white/70">{fmtDt(s.starts_at)}</span>
            <button
              type="button"
              onClick={() => removeSlot(s.id)}
              className="text-red-400 hover:text-red-300"
            >
              remove
            </button>
          </div>
        ))}
        {booked.length > 0 && (
          <p className="text-[10px] mt-2" style={labelStyle}>
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
            call: {fmtDt(row.verification_slots?.starts_at)}
          </p>
        </div>
        <span
          className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full flex-shrink-0"
          style={{ color, background: `${color}22` }}
        >
          {STATUS_LABEL[row.verification_status] || row.verification_status}
        </span>
      </div>

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
        "id, name, email, verification_status, verification_answers, verification_meet_link, verification_notes, verification_slots!profiles_verification_slot_id_fkey(starts_at)"
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
