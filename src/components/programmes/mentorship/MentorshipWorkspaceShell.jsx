import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import Spinner from "../../Spinner";
import {
  MentorshipTimelineDesktop,
  MentorshipTimelineMobile,
  FIRST_REVISITABLE_INDEX,
  slotToStepIndex
} from "./MentorshipTimeline";
import MentorshipIntakeForm from "./MentorshipIntakeForm";
import MentorshipBookSlot from "./MentorshipBookSlot";
import MentorshipSessionPage from "./MentorshipSessionPage";
import MentorshipCallPage from "./MentorshipCallPage";
import MentorshipAllRecordings from "./MentorshipAllRecordings";
import MentorshipSkillTracker from "./MentorshipSkillTracker";
import MentorshipTeamFaqPanel from "./MentorshipTeamFaqPanel";
import { SKILL_CATEGORIES } from "./skillTrackerTaxonomy";
import { STREAM_SKILL_CATEGORIES } from "./streamSkillTrackerTaxonomy";

// Session 1 is both the first revisitable step and where the timeline's
// per-session rows start — index of "slot N" = SESSION_1_INDEX + N - 1
// (equivalently slotToStepIndex(N), see MentorshipTimeline.jsx).
const SESSION_1_INDEX = FIRST_REVISITABLE_INDEX;

function jobApplicationLabel(slot) {
  const idx = slot - 6; // 0..5
  return { ja: Math.floor(idx / 2) + 1, call: (idx % 2) + 1 };
}

/**
 * Post-enrollment workspace — the orchestrator. Loads every step's data
 * once (mentorship_intake, mentorship_bookings, both skill trackers, all
 * mentorship_session_links/mentorship_session_feedback_v2 rows [slots 1-5
 * = sessions, 6-11 = application_support's job-application calls], and
 * mentorship_call_bookings for those calls' own ad-hoc scheduling), derives
 * which step is "current" from what exists (no stored step counter — see
 * the mentorship_enrollments migration's comment on why), and routes the
 * center pane accordingly.
 *
 * The timeline's highlighted row follows whatever's on screen
 * (`activeIndex`), not true progress (`currentIndex`) — revisiting an
 * earlier completed session/call must not silently snap the highlight back
 * to current progress. Only currentIndex governs which rows are unlocked/
 * revisitable.
 *
 * Finishing the plan's last slot (5 for core, 11 for application_support)
 * fires `onProgrammeComplete` (the growth-stage-advance modal, owned by
 * MentorshipProgramme.jsx) the moment its feedback is submitted — there's
 * no separate "finish" button, since core's slot 5 has no further slot to
 * navigate to at all (see the completion banner instead).
 *
 * Three columns on desktop — timeline (small, always expanded) / center
 * pane (big) / evolve team + FAQ (sidebar) — collapsing to a single mobile
 * column where the timeline becomes a "Step N of M" accordion up top and
 * the team/FAQ panel drops to the bottom, purely via flex-col's natural DOM
 * order. Sits inside PublicProfile's own content pane, to the right of its
 * persistent profile sidebar — see MentorshipProgramme.jsx.
 *
 * Column boundaries are plain divider lines (not boxes) — on lg, the
 * timeline and team+FAQ columns are sticky so only the center pane scrolls
 * with the page; the timeline additionally caps its own height and scrolls
 * internally since the application_support plan's step list can run long.
 *
 * "back to programmes" + (on mobile only) the step accordion share one
 * sticky header so both stay pinned together while the center pane scrolls
 * beneath — on desktop the back button sticks on its own here, and the
 * timeline column handles its own separate sticky/scroll region.
 */
export default function MentorshipWorkspaceShell({ user, enrollment, onBack, onProgrammeComplete }) {
  const [loading, setLoading] = useState(true);
  const [intake, setIntake] = useState(null);
  const [booking, setBooking] = useState(null);
  const [skillFoundation, setSkillFoundation] = useState(null);
  const [skillStream, setSkillStream] = useState(null);
  const [sessionLinks, setSessionLinks] = useState({}); // { [slot]: row }
  const [feedbacks, setFeedbacks] = useState({}); // { [slot]: row }
  const [callBookings, setCallBookings] = useState({}); // { [slot 6-11]: row }
  // null = follow the derived current step automatically; set once the
  // learner clicks a reached row or opens a skill tracker/all-recordings,
  // so navigating around doesn't get overridden by the derived value on
  // every render.
  const [manualView, setManualView] = useState(null);
  // where to return to once a skill tracker / all-recordings view is
  // closed — captured at the moment it's opened, from whatever `view` was
  // showing then.
  const [returnView, setReturnView] = useState(null);

  const isAppSupport = enrollment?.plan === "application_support";
  const finalSlot = isAppSupport ? 11 : 5;

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const [
        { data: intakeRow },
        { data: bookingRow },
        { data: foundationRow },
        { data: streamRow },
        { data: linkRows },
        { data: feedbackRows },
        { data: callBookingRows }
      ] = await Promise.all([
        supabase.from("mentorship_intake").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("mentorship_bookings").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("mentorship_skill_tracker").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("mentorship_stream_skill_tracker").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("mentorship_session_links").select("*").eq("user_id", user.id),
        supabase.from("mentorship_session_feedback_v2").select("*").eq("user_id", user.id),
        supabase.from("mentorship_call_bookings").select("*").eq("user_id", user.id)
      ]);
      if (cancelled) return;
      setIntake(intakeRow || null);
      setBooking(bookingRow || null);
      setSkillFoundation(foundationRow || null);
      setSkillStream(streamRow || null);
      setSessionLinks(Object.fromEntries((linkRows || []).map((r) => [r.session_number, r])));
      setFeedbacks(Object.fromEntries((feedbackRows || []).map((r) => [r.session_number, r])));
      setCallBookings(Object.fromEntries((callBookingRows || []).map((r) => [r.session_number, r])));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size={32} />
      </div>
    );
  }

  // one past the highest slot with feedback submitted, capped at finalSlot
  let currentSlot = 1;
  while (currentSlot < finalSlot && feedbacks[currentSlot]) currentSlot += 1;

  const currentIndex = booking ? slotToStepIndex(currentSlot) : intake ? 1 : 0;
  const defaultView = currentIndex === 0 ? "intake" : currentIndex === 1 ? "bookSlot" : `${currentSlot <= 5 ? "session" : "call"}:${currentSlot}`;
  const view = manualView || defaultView;

  const activeIndex =
    view.startsWith("session:") || view.startsWith("call:")
      ? slotToStepIndex(Number(view.split(":")[1]))
      : view === "allRecordings"
        ? -1 // no step row should highlight while "All recordings" itself is the active row
        : currentIndex;

  function handleSelectStep(index) {
    const slot = index - 1; // inverse of slotToStepIndex
    setManualView(`${slot <= 5 ? "session" : "call"}:${slot}`);
  }

  function openSkillTracker(which) {
    setReturnView(view);
    setManualView(`skillTracker:${which}`);
  }
  function closeSkillTracker() {
    setManualView(returnView || null);
    setReturnView(null);
  }
  function openAllRecordings() {
    setReturnView(view);
    setManualView("allRecordings");
  }

  function nextLabelFor(slot) {
    if (slot >= finalSlot) return null;
    const next = slot + 1;
    if (next <= 5) return `Go to session ${next}`;
    const { ja, call } = jobApplicationLabel(next);
    return `Book job application ${ja} · call ${call}`;
  }

  function completionBannerFor(slot) {
    if (slot === 5) {
      return {
        heading: "You've completed the mentorship sessions!",
        body: "Need more time with Yagnesh? Book an add-on call any time from the sidebar."
      };
    }
    if (slot === 11) {
      return {
        heading: "You've completed the mentorship program!",
        body: "Head to All recordings to revisit everything, or book an add-on call any time from the sidebar."
      };
    }
    return null;
  }

  function handleGoToNext(fromSlot) {
    const next = fromSlot + 1;
    setManualView(`${next <= 5 ? "session" : "call"}:${next}`);
  }

  function handleFeedbackSubmitted(slot, row) {
    setFeedbacks((prev) => ({ ...prev, [slot]: row }));
    setManualView(`${slot <= 5 ? "session" : "call"}:${slot}`);
    if (slot === finalSlot) onProgrammeComplete?.();
  }

  const openSlot = view.startsWith("session:") || view.startsWith("call:") ? Number(view.split(":")[1]) : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="sticky top-16 z-20 -mx-6 md:-mx-8 px-6 md:px-8 py-3 lg:py-2.5 flex flex-col gap-1 bg-[#161618]/95 backdrop-blur border-b border-white/10 lg:border-b-0">
        {onBack && (
          <button
            onClick={onBack}
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
            back to programmes
          </button>
        )}
        <MentorshipTimelineMobile
          plan={enrollment?.plan}
          currentIndex={currentIndex}
          activeIndex={activeIndex}
          onSelectStep={handleSelectStep}
          showAllRecordings={!!booking}
          allRecordingsActive={view === "allRecordings"}
          onOpenAllRecordings={openAllRecordings}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-0 lg:items-start">
        <MentorshipTimelineDesktop
          plan={enrollment?.plan}
          currentIndex={currentIndex}
          activeIndex={activeIndex}
          onSelectStep={handleSelectStep}
          showAllRecordings={!!booking}
          allRecordingsActive={view === "allRecordings"}
          onOpenAllRecordings={openAllRecordings}
        />
        <div className="hidden lg:block w-px self-stretch bg-white/10 mx-6 flex-shrink-0" />

        {view === "intake" && (
          <MentorshipIntakeForm
            user={user}
            enrollmentId={enrollment?.id}
            initialIntake={intake}
            onSaved={(row) => {
              setIntake(row);
              setManualView(null);
            }}
          />
        )}
        {view === "bookSlot" && (
          <MentorshipBookSlot
            user={user}
            onBooked={(row) => {
              setBooking(row);
              setManualView(null);
            }}
          />
        )}
        {view.startsWith("session:") && (
          <MentorshipSessionPage
            user={user}
            sessionNumber={openSlot}
            intake={intake}
            booking={booking}
            sessionLink={sessionLinks[openSlot]}
            feedback={feedbacks[openSlot]}
            skillFoundation={skillFoundation}
            skillStream={skillStream}
            completionBanner={completionBannerFor(openSlot)}
            nextLabel={nextLabelFor(openSlot)}
            onOpenSkillTracker={openSkillTracker}
            onIntakeUpdated={setIntake}
            onFeedbackSubmitted={(row) => handleFeedbackSubmitted(openSlot, row)}
            onGoToNext={() => handleGoToNext(openSlot)}
          />
        )}
        {view.startsWith("call:") &&
          (() => {
            const { ja, call } = jobApplicationLabel(openSlot);
            return (
              <MentorshipCallPage
                user={user}
                jobApplicationNumber={ja}
                callNumber={call}
                slotNumber={openSlot}
                intake={intake}
                callBooking={callBookings[openSlot]}
                sessionLink={sessionLinks[openSlot]}
                feedback={feedbacks[openSlot]}
                skillFoundation={skillFoundation}
                skillStream={skillStream}
                completionBanner={completionBannerFor(openSlot)}
                nextLabel={nextLabelFor(openSlot)}
                onOpenSkillTracker={openSkillTracker}
                onBooked={(row) => setCallBookings((prev) => ({ ...prev, [openSlot]: row }))}
                onIntakeUpdated={setIntake}
                onFeedbackSubmitted={(row) => handleFeedbackSubmitted(openSlot, row)}
                onGoToNext={() => handleGoToNext(openSlot)}
              />
            );
          })()}
        {view === "allRecordings" && (
          <MentorshipAllRecordings
            user={user}
            plan={enrollment?.plan}
            intake={intake}
            sessionLinks={sessionLinks}
            feedbacks={feedbacks}
            skillFoundation={skillFoundation}
            skillStream={skillStream}
            onOpenSlot={(slot) => setManualView(`${slot <= 5 ? "session" : "call"}:${slot}`)}
            onOpenSkillTracker={openSkillTracker}
            onIntakeUpdated={setIntake}
          />
        )}
        {view === "skillTracker:foundation" && (
          <MentorshipSkillTracker
            user={user}
            table="mentorship_skill_tracker"
            title="Foundation skill tracker"
            subtitle="Rate yourself honestly across the fundamentals — this helps your mentor tailor session 1 to where you actually stand."
            categories={SKILL_CATEGORIES}
            initialRatings={skillFoundation?.ratings}
            onCancel={closeSkillTracker}
            onSaved={(row) => {
              setSkillFoundation(row);
              closeSkillTracker();
            }}
          />
        )}
        {view === "skillTracker:stream" && (
          <MentorshipSkillTracker
            user={user}
            table="mentorship_stream_skill_tracker"
            title="Stream skill tracker"
            subtitle="Stream-specific skills for your stream — rate after session 1, track progress through session 5."
            categories={STREAM_SKILL_CATEGORIES}
            initialRatings={skillStream?.ratings}
            onCancel={closeSkillTracker}
            onSaved={(row) => {
              setSkillStream(row);
              closeSkillTracker();
            }}
          />
        )}

        <div className="hidden lg:block w-px self-stretch bg-white/10 mx-6 flex-shrink-0" />
        <MentorshipTeamFaqPanel />
      </div>
    </div>
  );
}
