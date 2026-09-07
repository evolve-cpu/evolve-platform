import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import Spinner from "../../Spinner";
import { MentorshipTimelineDesktop, MentorshipTimelineMobile } from "./MentorshipTimeline";
import MentorshipIntakeForm from "./MentorshipIntakeForm";
import MentorshipBookSlot from "./MentorshipBookSlot";
import MentorshipSession1 from "./MentorshipSession1";
import MentorshipSkillTracker from "./MentorshipSkillTracker";
import MentorshipTeamFaqPanel from "./MentorshipTeamFaqPanel";

// Matches CORE_STEPS's index in MentorshipTimeline.jsx — kept as a named
// constant here since Session 1 is the "everything ≥ here" landing spot
// (sessions 2-5 aren't built yet, but currentIndex still has to point
// somewhere sane once a booking exists).
const SESSION_1_INDEX = 2;

/**
 * Post-enrollment workspace — the orchestrator. Loads every step's data
 * once (mentorship_intake, mentorship_bookings, mentorship_skill_tracker,
 * mentorship_session_links for session 1), derives which step is "current"
 * from what exists (no stored step counter — see the mentorship_enrollments
 * migration's comment on why), and routes the center pane accordingly.
 * Already-reached timeline rows are clickable (via `onSelectStep`) to jump
 * back and revisit; the derived step still governs what's actually current
 * once you navigate away and back.
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
export default function MentorshipWorkspaceShell({ user, enrollment, onBack }) {
  const [loading, setLoading] = useState(true);
  const [intake, setIntake] = useState(null);
  const [booking, setBooking] = useState(null);
  const [skillTracker, setSkillTracker] = useState(null);
  const [sessionLink, setSessionLink] = useState(null);
  // null = follow the derived current step automatically; set once the
  // learner clicks a reached row or opens the skill tracker, so navigating
  // around doesn't get overridden by the derived value on every render.
  const [manualView, setManualView] = useState(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const [{ data: intakeRow }, { data: bookingRow }, { data: skillRow }, { data: linkRow }] =
        await Promise.all([
          supabase.from("mentorship_intake").select("*").eq("user_id", user.id).maybeSingle(),
          supabase.from("mentorship_bookings").select("*").eq("user_id", user.id).maybeSingle(),
          supabase.from("mentorship_skill_tracker").select("*").eq("user_id", user.id).maybeSingle(),
          supabase
            .from("mentorship_session_links")
            .select("*")
            .eq("user_id", user.id)
            .eq("session_number", 1)
            .maybeSingle()
        ]);
      if (cancelled) return;
      setIntake(intakeRow || null);
      setBooking(bookingRow || null);
      setSkillTracker(skillRow || null);
      setSessionLink(linkRow || null);
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

  const currentIndex = booking ? SESSION_1_INDEX : intake ? 1 : 0;
  const view =
    manualView ||
    (currentIndex === 0 ? "intake" : currentIndex === 1 ? "bookSlot" : "session1");

  function handleSelectStep(index) {
    setManualView(index === 0 ? "intake" : index === 1 ? "bookSlot" : "session1");
  }

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
          onSelectStep={handleSelectStep}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-0 lg:items-start">
        <MentorshipTimelineDesktop
          plan={enrollment?.plan}
          currentIndex={currentIndex}
          onSelectStep={handleSelectStep}
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
        {view === "session1" && (
          <MentorshipSession1
            user={user}
            intake={intake}
            booking={booking}
            sessionLink={sessionLink}
            skillDone={!!skillTracker?.submitted_at}
            onOpenSkillTracker={() => setManualView("skillTracker")}
            onIntakeUpdated={setIntake}
          />
        )}
        {view === "skillTracker" && (
          <MentorshipSkillTracker
            user={user}
            initialRatings={skillTracker?.ratings}
            onCancel={() => setManualView("session1")}
            onSaved={(row) => {
              setSkillTracker(row);
              setManualView("session1");
            }}
          />
        )}

        <div className="hidden lg:block w-px self-stretch bg-white/10 mx-6 flex-shrink-0" />
        <MentorshipTeamFaqPanel />
      </div>
    </div>
  );
}
