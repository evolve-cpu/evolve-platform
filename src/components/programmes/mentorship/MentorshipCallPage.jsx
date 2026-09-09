import { useEffect, useState } from "react";
import MentorshipBookSlot from "./MentorshipBookSlot";
import MentorshipFeedbackModal from "./MentorshipFeedbackModal";
import MentorshipRecordingPlayer from "./MentorshipRecordingPlayer";
import MentorshipJoinCard from "./MentorshipJoinCard";
import { DocRow, MentorshipDocsAndResources } from "./MentorshipDocsResources";
import { nextOccurrence, fmtDateTime } from "./mentorshipDateUtils";

const JOIN_WINDOW_MINUTES = 15;
const CALL_DURATION_MINUTES = 30;

const CONFIRMED_BODY = (day, time) => (
  <>
    Your call is booked for <span className="text-white font-bold">{day}</span> ·{" "}
    <span className="text-white font-bold">{time}</span>. We'll send a reminder before it starts.
  </>
);

/**
 * A single job-application call (application_support plan only) — slots
 * 6-11 in mentorship_session_links/mentorship_session_feedback_v2 (JA1
 * Call1=6, Call2=7, JA2 Call1=8, Call2=9, JA3 Call1=10, Call2=11 — see
 * MentorshipTimeline.jsx). Unlike sessions 1-5 (all pre-scheduled via the
 * one initial "Book a slot"), each call needs its own ad-hoc day/time
 * booking first (mentorship_call_bookings, one row per user per slot) —
 * that's the extra "needsBooking" state sessions don't have. Once booked,
 * behaves like MentorshipSessionPage: Happening-on/Join card gated on the
 * 15-minute window (no skill-tracker gate here), feedback modal once the
 * time's passed, then the recording view with a "next" button.
 */
export default function MentorshipCallPage({
  user,
  jobApplicationNumber,
  callNumber,
  slotNumber,
  intake,
  callBooking,
  sessionLink,
  feedback,
  skillFoundation,
  skillStream,
  completionBanner,
  nextLabel,
  onOpenSkillTracker,
  onBooked,
  onIntakeUpdated,
  onFeedbackSubmitted,
  onGoToNext
}) {
  const [now, setNow] = useState(() => Date.now());
  const [feedbackDismissed, setFeedbackDismissed] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const title = `Job application ${jobApplicationNumber} · Call ${callNumber}`;
  const completed = !!feedback;

  if (!callBooking) {
    return (
      <MentorshipBookSlot
        user={user}
        table="mentorship_call_bookings"
        slotNumber={slotNumber}
        pageHeading={title}
        pageSubtitle="Pick a time to meet Yagnesh Ahir again — bring whatever you're working on."
        meetingTitle="Add-on 1:1 with Yagnesh Ahir"
        meetingMeta="30 min · video call"
        confirmedBody={CONFIRMED_BODY}
        nextLabel="Continue →"
        onBooked={onBooked}
      />
    );
  }

  const realDatetime = sessionLink?.session_datetime ? new Date(sessionLink.session_datetime) : null;
  const displayDatetime = realDatetime || nextOccurrence(callBooking.preferred_day, callBooking.preferred_time);
  const fmt = fmtDateTime(displayDatetime);

  const withinWindow =
    realDatetime &&
    now >= realDatetime.getTime() - JOIN_WINDOW_MINUTES * 60000 &&
    now <= realDatetime.getTime() + CALL_DURATION_MINUTES * 60000;
  const hasLink = !!sessionLink?.join_link;
  const joinEnabled = hasLink && withinWindow;

  let gateCaption = "";
  if (!hasLink) gateCaption = "Your mentor will share the join link closer to the call";
  else if (!withinWindow) gateCaption = "Button enables 15 mins before the call starts";

  const feedbackDue =
    !completed &&
    !feedbackDismissed &&
    realDatetime &&
    now >= realDatetime.getTime() + CALL_DURATION_MINUTES * 60000;

  const trackerRows = [
    skillFoundation?.submitted_at && { key: "foundation", label: "Foundation skill tracker" },
    skillStream?.submitted_at && { key: "stream", label: "Stream skill tracker" }
  ].filter(Boolean);

  return (
    <div className="flex-1 flex flex-col gap-6">
      <span
        className={`w-fit text-[11px] font-bold uppercase tracking-wide rounded-full px-3 py-1.5 ${
          completed ? "bg-green-500/10 text-green-400" : "bg-evolve-yellow/10 text-evolve-yellow"
        }`}
      >
        {completed ? "Completed" : "Upcoming call"}
      </span>

      <div>
        <h1
          className="text-white font-bold font-bricolage"
          style={{ fontSize: "clamp(24px,4vw,32px)", letterSpacing: "-0.02em" }}
        >
          {title}
        </h1>
        {completed ? (
          fmt && <p className="text-white/40 text-sm mt-2">{fmt.date}</p>
        ) : (
          <p className="text-white/50 text-sm mt-2 max-w-xl leading-relaxed">
            A focused follow-up with Yagnesh Ahir — bring whatever you're working on.
          </p>
        )}
      </div>

      {completed ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
            <p className="text-white text-sm font-bold">{title} recording</p>
          </div>
          <MentorshipRecordingPlayer url={sessionLink?.recording_url} />
          {sessionLink?.session_notes && (
            <p className="text-white/50 text-sm px-5 py-4 border-t border-white/10 leading-relaxed">
              {sessionLink.session_notes}
            </p>
          )}
        </div>
      ) : (
        <MentorshipJoinCard fmt={fmt} joinEnabled={joinEnabled} gateCaption={gateCaption} joinLink={sessionLink?.join_link} />
      )}

      {completed && completionBanner && (
        <div className="rounded-2xl border border-green-500/20 bg-green-500/5 px-6 py-5 flex flex-col gap-1">
          <p className="text-white font-bold text-sm">{completionBanner.heading}</p>
          <p className="text-white/50 text-sm">{completionBanner.body}</p>
        </div>
      )}

      {completed && nextLabel && (
        <button
          onClick={onGoToNext}
          className="w-full bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl py-3.5 flex items-center justify-center gap-2 active:opacity-80"
        >
          {nextLabel}
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
            <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {trackerRows.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-white font-bold text-sm">Your skill trackers</p>
          {trackerRows.map((t) => (
            <DocRow
              key={t.key}
              icon={
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <rect x="4" y="3" width="12" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M7 7h6M7 10.5h6M7 14h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              }
              label={t.label}
              value="Submitted"
              onClick={() => onOpenSkillTracker(t.key)}
            />
          ))}
        </div>
      )}

      <MentorshipDocsAndResources user={user} intake={intake} onIntakeUpdated={onIntakeUpdated} />

      {feedbackDue && (
        <MentorshipFeedbackModal
          user={user}
          sessionNumber={slotNumber}
          onClose={() => setFeedbackDismissed(true)}
          onSubmitted={onFeedbackSubmitted}
        />
      )}
    </div>
  );
}
