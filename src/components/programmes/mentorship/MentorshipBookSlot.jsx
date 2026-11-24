import { useState } from "react";
import { supabase } from "../../../supabaseClient";
import {
  DEFAULT_SLOT_CONFIG,
  SLOT_OVERRIDES,
  DAY_NAMES,
  getSlotConfig,
  weeklySessionTimes,
  fmtIstDate,
  fmtIstTime,
  slotRange
} from "./mentorshipSlotConfig";

const DAY_PLURAL = { Mon: "mondays", Tue: "tuesdays", Wed: "wednesdays", Thu: "thursdays", Fri: "fridays" };

function Dropdown({ label, value, onChange, placeholder, options }) {
  return (
    <div className="flex-1 min-w-0 flex flex-col gap-2">
      <label className="text-white font-bold text-sm">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none rounded-xl bg-transparent px-4 py-3 pr-10 text-sm font-bold outline-none transition-colors cursor-pointer ${
            value ? "border-2 border-evolve-yellow text-evolve-yellow" : "border border-white/15 text-white/70 hover:border-white/30"
          }`}
        >
          <option value="" disabled className="bg-[#161618] text-white/50">
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-[#161618] text-white">
              {o.label}
            </option>
          ))}
        </select>
        <svg
          width="14" height="14" viewBox="0 0 20 20" fill="none"
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/50"
        >
          <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

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
        className="relative w-full h-full md:h-auto md:max-w-xl md:max-h-[90vh] rounded-none md:rounded-3xl border-0 md:border md:border-white/10 px-8 py-10 md:px-12 md:py-12 flex flex-col items-center justify-center text-center gap-5 md:gap-6 overflow-y-auto"
        style={{ backgroundColor: "#161618" }}
      >
        <AllSetIcon />
        <div>
          <h3 className="text-white font-bold text-2xl md:text-4xl font-bricolage">You're all set!</h3>
          <p className="text-white/50 text-sm md:text-base mt-3 leading-relaxed max-w-[40ch] mx-auto">{body(day, time)}</p>
        </div>
        <button data-cta="app_mentorship_book_slot_continue"
          onClick={onContinue}
          className="w-full md:max-w-sm bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl py-3.5 active:opacity-80 mt-auto md:mt-2"
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
    <span className="text-white font-bold">{time}</span>. The calendar invite with the Google Meet link is
    on its way to your email.
  </>
);

/** The exact 5 dates the calendar series will be created for. */
function SessionSchedule({ day, time }) {
  const times = weeklySessionTimes(day, time);
  if (!times) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-4">
      <p className="text-white/50 text-xs font-bold uppercase tracking-wide">Your 5 sessions</p>
      <ol className="mt-3 flex flex-col gap-2">
        {times.map((t, i) => (
          <li key={i} className="flex items-center justify-between gap-4 text-sm">
            <span className="text-white/50">Session {i + 1}</span>
            <span className="text-white font-semibold text-right">
              {fmtIstDate(t, { weekday: "short", year: "numeric" })} · {fmtIstTime(t)} IST
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * A day/time picker — a plain center-pane page (like "Before we begin"),
 * not a popup. Confirming inserts a row and, for the weekly sessions, asks
 * the server to create the recurring Google Meet series and invite the
 * learner (events-notify's "mentorship_meet" mode), which fills mentorship_session_links 1-5 —
 * admins can still override those in MentorshipV2Tab.jsx. Job-application
 * calls are still scheduled by an admin. Then shows the responsive
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
  nextLabel = "Go to session 1 →",
  preview: previewProp = false
}) {
  // localhost only: "Preview as <learner>" swaps in their slot config; nothing is saved
  const [previewAs, setPreviewAs] = useState("");
  const preview = previewProp || !!previewAs;
  // per-learner availability applies to the weekly booking only
  const isWeekly = table === "mentorship_bookings";
  const config = isWeekly ? getSlotConfig(previewAs || user?.email) : DEFAULT_SLOT_CONFIG;
  const subtitle = config === DEFAULT_SLOT_CONFIG ? pageSubtitle : config.subtitle;
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(null); // { row, links } once saved

  async function handleConfirm() {
    if (!day || !time || !user?.id) return;
    if (preview) {
      setConfirmed({ row: { preferred_day: day, preferred_time: time }, links: null });
      return;
    }
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
    if (saveError) {
      setSaving(false);
      setError("Couldn't save that — please try again.");
      return;
    }
    // weekly sessions: create the recurring Meet + invite on the server. A
    // failure here doesn't undo the booking — an admin can still add links.
    const links = table === "mentorship_bookings" ? await createWeeklyMeet() : null;
    setSaving(false);
    setConfirmed({ row: data, links });
  }

  async function createWeeklyMeet() {
    try {
      const {
        data: { session }
      } = await supabase.auth.getSession();
      // same edge function (and Google setup) as the admin Events tab
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/events-notify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ mode: "mentorship_meet" })
      });
      const result = await res.json().catch(() => null);
      return res.ok ? result?.links || [] : null;
    } catch (err) {
      console.error("mentorship meet error:", err);
      return null;
    }
  }

  return (
    <div className="flex-1 flex flex-col gap-6">
      {import.meta.env.DEV && isWeekly && (
        <div className="flex flex-wrap gap-2 text-xs">
          {Object.keys(SLOT_OVERRIDES).map((email) => (
            <button
              key={email}
              type="button"
              onClick={() => {
                setPreviewAs(previewAs === email ? "" : email);
                setDay("");
                setTime("");
              }}
              className={`rounded-lg border border-dashed px-3 py-1.5 font-bold ${
                previewAs === email ? "border-evolve-yellow text-evolve-yellow" : "border-white/30 text-white/60"
              }`}
            >
              {previewAs === email ? `Previewing as ${email} — exit` : `Preview as ${email}`}
            </button>
          ))}
        </div>
      )}
      <div>
        <h1
          className="text-white font-bold font-bricolage"
          style={{ fontSize: "clamp(24px,4vw,32px)", letterSpacing: "-0.02em" }}
        >
          {pageHeading}
        </h1>
        <p className="text-white/50 text-sm mt-2">{subtitle}</p>
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

        {config.layout === "dropdown" ? (
          <div className="flex flex-col sm:flex-row gap-4">
            <Dropdown
              label="Day"
              value={day}
              onChange={setDay}
              placeholder="Select a day"
              options={config.days.map((d) => {
                // the date of the first session if this day is picked
                const first = weeklySessionTimes(d, time || config.times[0])?.[0];
                return { value: d, label: first ? `${DAY_NAMES[d]} · ${fmtIstDate(first)}` : DAY_NAMES[d] };
              })}
            />
            <Dropdown
              label="Time (IST)"
              value={time}
              onChange={setTime}
              placeholder="Select a time"
              options={config.times.map((t) => ({ value: t, label: slotRange(t) }))}
            />
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              <label className="text-white font-bold text-sm">Select day</label>
              <div className="flex gap-3">
                {config.days.map((d) => (
                  <Chip key={d} active={day === d} onClick={() => setDay(d)}>
                    {d}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-white font-bold text-sm">Time</label>
              <div className="flex flex-wrap gap-3">
                {config.times.map((t) => (
                  <Chip key={t} active={time === t} onClick={() => setTime(t)}>
                    {t}
                  </Chip>
                ))}
              </div>
            </div>
          </>
        )}

        {isWeekly && config.layout === "dropdown" && day && time && <SessionSchedule day={day} time={time} />}

        <p className="text-white/30 text-xs">
          Timings aren't working for you? Write to us at{" "}
          <a href="mailto:content@evolvedesign.academy" className="text-evolve-yellow font-semibold">
            content@evolvedesign.academy
          </a>
        </p>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button data-cta="app_mentorship_book_slot_confirm"
          onClick={handleConfirm}
          disabled={!day || !time || saving}
          className="w-full bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl py-3.5 disabled:opacity-40 active:opacity-80 transition-opacity"
        >
          {saving ? "Booking…" : preview ? "Confirm booking (preview — nothing is saved)" : "Confirm booking"}
        </button>
      </div>

      {confirmed && (
        <AllSetModal
          day={confirmed.row.preferred_day}
          time={confirmed.row.preferred_time}
          body={confirmedBody}
          nextLabel={nextLabel}
          onContinue={() => (preview ? setConfirmed(null) : onBooked(confirmed.row, confirmed.links))}
        />
      )}
    </div>
  );
}
