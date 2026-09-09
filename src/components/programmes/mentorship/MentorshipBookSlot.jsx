import { useState } from "react";
import { supabase } from "../../../supabaseClient";

const DAYS = ["Mon", "Tue", "Wed", "Thu"];
const TIMES = ["9:00 PM", "10:00 PM", "11:00 PM"];
const DAY_PLURAL = { Mon: "mondays", Tue: "tuesdays", Wed: "wednesdays", Thu: "thursdays" };

function Chip({ active, children, ...props }) {
  return (
    <button
      type="button"
      {...props}
      className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold text-center transition-colors ${
        active
          ? "border-2 border-evolve-yellow text-evolve-yellow"
          : "border border-white/15 text-white/70 hover:border-white/30"
      }`}
    >
      {children}
    </button>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="flex-shrink-0">
      <rect x="3" y="4.5" width="14" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 8h14M7 2.5v3M13 2.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="flex-shrink-0">
      <rect x="2.5" y="5.5" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12.5 8.5L17 6v8l-4.5-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/** Sun-burst + calendar — the "you're all set" celebratory icon. */
function AllSetIcon() {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
      <path
        d="M48 4l7 20 18-11-8 20 21 3-18 12 18 12-21 3 8 20-18-11-7 20-7-20-18 11 8-20-21-3 18-12L4 46l21-3-8-20 18 11 7-20z"
        fill="#FFD007"
      />
      <circle cx="48" cy="48" r="20" fill="#161618" />
      <rect x="40" y="42" width="16" height="13" rx="1.5" stroke="#FFD007" strokeWidth="1.8" />
      <path d="M40 46h16" stroke="#FFD007" strokeWidth="1.8" />
    </svg>
  );
}

function AllSetModal({ day, time, body, nextLabel, onContinue }) {
  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center md:px-6">
      <div className="absolute inset-0 bg-evolve-black/70 md:bg-evolve-black/85" />
      <div
        className="relative w-full h-full md:h-auto md:max-w-sm rounded-none md:rounded-3xl border-0 md:border md:border-white/10 px-8 py-10 flex flex-col items-center text-center gap-5"
        style={{ backgroundColor: "#161618" }}
      >
        <AllSetIcon />
        <div>
          <h3 className="text-white font-bold text-2xl font-bricolage">You're all set!</h3>
          <p className="text-white/50 text-sm mt-3 leading-relaxed">{body(day, time)}</p>
        </div>
        <button
          onClick={onContinue}
          className="w-full bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl py-3.5 active:opacity-80 mt-auto"
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}

const WEEKLY_CONFIRMED_BODY = (day, time) => (
  <>
    All 5 sessions are booked for <span className="text-white font-bold">{DAY_PLURAL[day]}</span> ·{" "}
    <span className="text-white font-bold">{time}</span>, starting this week. We'll send reminders before
    each one.
  </>
);

/**
 * A day/time preference picker — a plain center-pane page (like "Before we
 * begin"), not a popup. Not a live calendar booking — the real meeting is
 * scheduled manually by an admin afterward (see mentorship_session_links /
 * MentorshipV2Tab.jsx). Confirming inserts a row and shows the responsive
 * "You're all set!" confirmation (modal on desktop, full-screen on mobile).
 *
 * Serves two cases via props: the initial 5-session weekly booking
 * (defaults below, writes to mentorship_bookings, one row per user) and a
 * single job-application call's ad-hoc booking (MentorshipCallPage passes
 * `table="mentorship_call_bookings"` + `slotNumber`, one row per user per
 * call — see mentorship_call_bookings.sql).
 */
export default function MentorshipBookSlot({
  user,
  onBooked,
  table = "mentorship_bookings",
  slotNumber,
  pageHeading = "Book a slot",
  pageSubtitle = "You'll be meeting Yagnesh Ahir for 5 consecutive sessions during your selected day and time.",
  meetingTitle = "Weekly 1:1 with Yagnesh Ahir",
  meetingMeta = "60 min · weekly · 5 sessions",
  confirmedBody = WEEKLY_CONFIRMED_BODY,
  nextLabel = "Go to session 1 →"
}) {
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(null); // { day, time } once saved

  async function handleConfirm() {
    if (!day || !time || !user?.id) return;
    setSaving(true);
    setError("");
    const payload =
      table === "mentorship_bookings"
        ? { user_id: user.id, preferred_day: day, preferred_time: time }
        : { user_id: user.id, session_number: slotNumber, preferred_day: day, preferred_time: time };
    const { data, error: saveError } = await supabase
      .from(table)
      .upsert(payload, { onConflict: table === "mentorship_bookings" ? "user_id" : "user_id,session_number" })
      .select()
      .single();
    setSaving(false);
    if (saveError) {
      setError("Couldn't save that — please try again.");
      return;
    }
    setConfirmed(data);
  }

  return (
    <div className="flex-1 flex flex-col gap-6">
      <div>
        <h1
          className="text-white font-bold font-bricolage"
          style={{ fontSize: "clamp(24px,4vw,32px)", letterSpacing: "-0.02em" }}
        >
          {pageHeading}
        </h1>
        <p className="text-white/50 text-sm mt-2">{pageSubtitle}</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-6 flex flex-col gap-6">
        <div>
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-wide">evolve mentorship</p>
          <h3 className="text-white font-bold text-xl mt-1">{meetingTitle}</h3>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 text-white/50 text-sm">
            <span className="flex items-center gap-2">
              <CalendarIcon />
              {meetingMeta}
            </span>
            <span className="flex items-center gap-2">
              <VideoIcon />
              Video call — link shared after booking
            </span>
          </div>
        </div>

        <div className="border-t border-white/10" />

        <div className="flex flex-col gap-3">
          <label className="text-white font-bold text-sm">Select day</label>
          <div className="flex gap-3">
            {DAYS.map((d) => (
              <Chip key={d} active={day === d} onClick={() => setDay(d)}>
                {d}
              </Chip>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-white font-bold text-sm">Time</label>
          <div className="flex flex-wrap gap-3">
            {TIMES.map((t) => (
              <Chip key={t} active={time === t} onClick={() => setTime(t)}>
                {t}
              </Chip>
            ))}
          </div>
        </div>

        <p className="text-white/30 text-xs">
          Timings aren't working for you? Write to us at{" "}
          <a href="mailto:content@evolvedesign.academy" className="text-evolve-yellow font-semibold">
            content@evolvedesign.academy
          </a>
        </p>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={handleConfirm}
          disabled={!day || !time || saving}
          className="w-full bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl py-3.5 disabled:opacity-40 active:opacity-80 transition-opacity"
        >
          {saving ? "Booking…" : "Confirm booking"}
        </button>
      </div>

      {confirmed && (
        <AllSetModal
          day={confirmed.preferred_day}
          time={confirmed.preferred_time}
          body={confirmedBody}
          nextLabel={nextLabel}
          onContinue={() => onBooked(confirmed)}
        />
      )}
    </div>
  );
}
