import { useEffect, useState } from "react";
import { PROCESS } from "./MentorshipLanding";
import MentorshipFeedbackModal from "./MentorshipFeedbackModal";
import MentorshipRecordingPlayer from "./MentorshipRecordingPlayer";
import MentorshipJoinCard from "./MentorshipJoinCard";
import { DocRow, MentorshipDocsAndResources } from "./MentorshipDocsResources";
import { nextOccurrence, fmtDateTime } from "./mentorshipDateUtils";

const JOIN_WINDOW_MINUTES = 15;
const SESSION_DURATION_MINUTES = 60;

/**
 * Session N · <title> — generic over sessionNumber (1-5). Two states:
 * "upcoming" (Happening on / Join card, gated on that session's pre-call
 * skill tracker + the 15-minute join window) and "completed" (once
 * mentorship_session_feedback_v2 has a row for this session — recording +
 * mentor notes, "Go to session N+1" / "Book job application 1 · call 1" /
 * "Finish programme" depending on session number and plan, decided by the
 * parent via `nextLabel`/`onGoToNext`). A feedback modal auto-surfaces once
 * the session's real start time + its duration has passed and no feedback
 * row exists yet.
 *
 * Only sessions 1 and 2 have a pre-call skill-tracker gate (Foundation,
 * then Stream) — 3-5 have none, but still show both trackers under "Your
 * skill trackers" for reference once submitted. Job-application calls use
 * the sibling MentorshipCallPage.jsx instead of this component — they need
 * their own ad-hoc booking step first, which sessions don't.
 */
export default function MentorshipSessionPage({
  user,
  sessionNumber,
  intake,
  booking,
  sessionLink,
  feedback,
  skillFoundation,
  skillStream,
  completionBanner,
  nextLabel,
  onOpenSkillTracker,
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

  const step = PROCESS[sessionNumber - 1];
  const completed = !!feedback;

  const realDatetime = sessionLink?.session_datetime ? new Date(sessionLink.session_datetime) : null;
  const displayDatetime =
    realDatetime || (booking ? nextOccurrence(booking.preferred_day, booking.preferred_time, sessionNumber - 1) : null);
  const fmt = fmtDateTime(displayDatetime);

  const withinWindow =
    realDatetime &&
    now >= realDatetime.getTime() - JOIN_WINDOW_MINUTES * 60000 &&
    now <= realDatetime.getTime() + SESSION_DURATION_MINUTES * 60000;
  const hasLink = !!sessionLink?.join_link;

  const skillGateDone = sessionNumber === 1 ? !!skillFoundation?.submitted_at : sessionNumber === 2 ? !!skillStream?.submitted_at : true;
  const joinEnabled = skillGateDone && hasLink && withinWindow;

  let gateCaption = "";
  if (!skillGateDone) gateCaption = "Complete the task above to unlock this session";
  else if (!hasLink) gateCaption = "Your mentor will share the join link closer to the session";
  else if (!withinWindow) gateCaption = "Button enables 15 mins before the session starts";

  const feedbackDue =
    !completed &&
    !feedbackDismissed &&
    realDatetime &&
    now >= realDatetime.getTime() + SESSION_DURATION_MINUTES * 60000;

  const trackerRows = [
    skillFoundation?.submitted_at && { key: "foundation", label: "Foundation skill tracker" },
    skillStream?.submitted_at && { key: "stream", label: "Stream skill tracker" }
  ].filter(Boolean);

  return (
    <div className="flex-1 flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span
          className={`w-fit text-[11px] font-bold uppercase tracking-wide rounded-full px-3 py-1.5 ${
            completed ? "bg-green-500/10 text-green-400" : "bg-evolve-yellow/10 text-evolve-yellow"
          }`}
        >
          {completed ? "Completed" : "Upcoming session"}
        </span>
      </div>

      <div>
        <h1
          className="text-white font-bold font-bricolage"
          style={{ fontSize: "clamp(24px,4vw,32px)", letterSpacing: "-0.02em" }}
        >
          Session {sessionNumber} · {step.title}
        </h1>
        {completed ? (
          fmt && <p className="text-white/40 text-sm mt-2">{fmt.date}</p>
        ) : (
          <p className="text-white/50 text-sm mt-2 max-w-xl leading-relaxed">{step.body}</p>
        )}
      </div>

      {!completed && (sessionNumber === 1 || sessionNumber === 2) && (
        <div className="flex flex-col gap-3">
          <p className="text-white font-bold text-sm">Before the call</p>
          <DocRow
            icon={
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <rect x="4" y="3" width="12" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                <path d="M7 7h6M7 10.5h6M7 14h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            }
            label={sessionNumber === 1 ? "Fill up the skill tracker" : "Fill up the stream-specific skill tracker"}
            value={skillGateDone ? "Submitted" : ""}
            onClick={() => onOpenSkillTracker(sessionNumber === 1 ? "foundation" : "stream")}
          />
        </div>
      )}

      {completed ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
            <p className="text-white text-sm font-bold">Session {sessionNumber} recording</p>
          </div>
          <MentorshipRecordingPlayer url={sessionLink?.recording_url} />
          {sessionLink?.session_notes && (
            <p className="text-white/50 text-sm px-5 py-4 border-t border-white/10 leading-relaxed">
              {sessionLink.session_notes}
            </p>
          )}
        </div>
      ) : (
        <MentorshipJoinCard
          fmt={fmt}
          joinEnabled={joinEnabled}
          gateCaption={gateCaption}
          joinLink={sessionLink?.join_link}
        />
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
          sessionNumber={sessionNumber}
          onClose={() => setFeedbackDismissed(true)}
          onSubmitted={onFeedbackSubmitted}
        />
      )}
    </div>
  );
}
