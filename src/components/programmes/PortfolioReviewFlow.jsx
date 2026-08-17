import { useEffect, useRef, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../hooks/useAuth";
import { getPortfolioReviewProgress } from "../../lib/portfolioReviewProgress";
import {
  getCalendlyUrlForStream,
  getReviewerForStream
} from "../../lib/reviewerRouting";
import { DISCIPLINE_VALUES } from "../../pages/Onboarding/questions";
import GrowthStageModal from "../GrowthStageModal";
import { right_arrow_icon } from "../../assets/images/Nav";

// year options mirror the "standard" onboarding question exactly (see
// src/pages/Onboarding/questions.js) so a design-school student's prefilled
// value always matches one of these.
const YEAR_VALUES = [
  "1st year",
  "2nd year",
  "3rd year",
  "4th year",
  "5th year"
];

// growth_stage (0-100) reached once the intake questions + resume/portfolio
// are submitted — see src/lib/growthStage.js for the seed→sprout mapping.
// 30 → stage 3 (onboarding=10→stage1, payment=20→stage2, this=30→stage3).
const SUBMIT_GROWTH_STAGE = 30;

const QUESTIONS = [
  {
    key: "q1",
    question:
      "What's been the hardest part about putting your portfolio together?",
    placeholder:
      "e.g. deciding which projects to include, writing case studies, structuring it, the overall layout."
  },
  {
    key: "q2",
    question: "What kind of work are you hoping to land?",
    placeholder:
      "e.g. UX design roles at product companies, graphic design internships, freelance branding work."
  },
  {
    key: "q3",
    question:
      "Is there anything specific you'd like your reviewer to look closely at?",
    placeholder:
      "e.g. case study structure, visual consistency, a particular project you're unsure about."
  },
  {
    key: "q4",
    question:
      "Anything else you're finding difficult that we should know about?",
    placeholder:
      "e.g. how to present a certain project, or writing about your process — totally optional.",
    optional: true
  }
];

function driveEmbedUrl(url) {
  if (!url) return url;
  const m =
    url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return m ? `https://drive.google.com/file/d/${m[1]}/preview` : url;
}

function safeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

/* ── sidebar step nodes ────────────────────────────────────────────────── */
function StepSidebar({
  phase,
  currentQ,
  qDone,
  shareDone,
  bookDone,
  hasReport,
  hasRecording,
  resultsTab,
  onSelectQuestion,
  onSelectResultsTab,
  className = ""
}) {
  const isSubmitted = ["booking", "confirmed", "results"].includes(phase);

  const sections = [
    {
      title: "Let's get to know you",
      items: QUESTIONS.map((q, i) => ({
        label: `Q${i + 1} — ${q.question}`,
        active: phase === "questions" && currentQ === i,
        done: i < qDone,
        navigable:
          isSubmitted || (phase === "questions" && i < qDone && i !== currentQ),
        onClick: () => onSelectQuestion(i)
      }))
    },
    {
      title: "Share your work",
      items: [
        {
          label: "Upload resume & portfolio",
          active: phase === "share",
          done: shareDone,
          navigable: false,
          onClick: () => {}
        }
      ]
    },
    {
      title: "Book a call",
      items: [
        {
          label: "Pick a slot",
          active: phase === "booking",
          done: bookDone,
          navigable: false,
          onClick: () => {}
        }
      ]
    },
    {
      title: "Your review",
      items: [
        {
          label: "Call confirmed",
          active: phase === "confirmed",
          done: phase === "results",
          navigable: false,
          onClick: () => {}
        },
        // always listed, even before the backend has actually uploaded
        // them — otherwise the sidebar just stops after "call confirmed"
        // and gives no sense of what's still coming.
        {
          label: "View report",
          active: phase === "results" && resultsTab === "report",
          done: false,
          navigable: hasReport && phase === "results",
          pending: !hasReport,
          onClick: () => onSelectResultsTab("report")
        },
        {
          label: "View session",
          active: phase === "results" && resultsTab === "session",
          done: false,
          navigable: hasRecording && phase === "results",
          pending: !hasRecording,
          onClick: () => onSelectResultsTab("session")
        },
        {
          label: "Book a follow-up call",
          active: resultsTab === "followup",
          done: false,
          navigable: phase === "results",
          pending: phase !== "results",
          onClick: () => onSelectResultsTab("followup")
        }
      ]
    }
  ];

  return (
    <div className={`relative flex flex-col gap-5 ${className}`}>
      <div className="absolute left-[18px] top-2 bottom-2 w-px bg-white/10" />
      {sections.map((section) => {
        const sectionActive = section.items.some((i) => i.active);
        return (
          <div key={section.title} className="flex flex-col gap-1">
            <p
              className={`flex items-center gap-2 px-2.5 text-[10px] font-bold uppercase tracking-wide mb-1.5 ${
                sectionActive ? "text-white/70" : "text-white/25"
              }`}
            >
              <span className="w-4 flex justify-center flex-shrink-0">
                <span
                  className={`w-2.5 h-2.5 rounded-full border-2 bg-[#161618] ${
                    sectionActive ? "border-evolve-yellow" : "border-white/15"
                  }`}
                />
              </span>
              {section.title}
            </p>
            {section.items.map((item) => {
              const filled = item.active || item.done;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.navigable ? item.onClick : undefined}
                  disabled={!item.navigable}
                  className={`flex items-center gap-2 text-left text-xs rounded-lg px-2.5 py-2 transition-colors ${
                    item.active
                      ? "text-white font-bold"
                      : item.done
                        ? "text-white/70"
                        : "text-white/25"
                  } ${item.navigable ? "hover:bg-white/[0.04] cursor-pointer" : "cursor-default"}`}
                >
                  <span className="w-4 flex justify-center flex-shrink-0">
                    {filled ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-evolve-yellow" />
                    ) : (
                      <span className="w-2 h-2 rounded-full border border-white/15 bg-[#161618]" />
                    )}
                  </span>
                  <span className="leading-snug">{item.label}</span>
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/* ── read-only step list for a finished review cycle ─────────────────── */
function ReadOnlyStepList({ row }) {
  const items = [
    "Let's get to know you",
    "Share your work",
    "Book a call",
    "Call confirmed",
    ...(row.review_report_url ? ["View report"] : []),
    ...(row.meet_recording_url ? ["View session"] : [])
  ];
  return (
    <div className="flex flex-col gap-1">
      {items.map((label) => (
        <div
          key={label}
          className="flex items-center gap-2.5 text-xs text-white/50 px-2.5 py-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-evolve-inchworm flex-shrink-0" />
          <span className="leading-snug">{label}</span>
        </div>
      ))}
    </div>
  );
}

function CyclePill({ done }) {
  return (
    <span
      className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0 ${
        done
          ? "bg-evolve-inchworm/15 text-evolve-inchworm"
          : "bg-evolve-yellow/15 text-evolve-yellow"
      }`}
    >
      {done ? "Completed" : "In progress"}
    </span>
  );
}

/* ── one collapsible "review N" group in the cycles sidebar ─────────────── */
function ReviewCycleGroup({
  title,
  done,
  expanded,
  onToggle,
  toggleable = true,
  children
}) {
  const Header = toggleable ? "button" : "div";
  return (
    <div>
      <Header
        type={toggleable ? "button" : undefined}
        onClick={toggleable ? onToggle : undefined}
        className={`w-full flex items-center gap-2 py-1.5 text-left ${
          toggleable ? "cursor-pointer" : "cursor-default"
        }`}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 20 20"
          fill="none"
          className={`text-white/30 transition-transform flex-shrink-0 ${toggleable && expanded ? "rotate-180" : ""}`}
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-white text-xs font-bold uppercase tracking-wide">
          {title}
        </span>
        <CyclePill done={done} />
      </Header>
      {expanded && <div className="pt-1">{children}</div>}
    </div>
  );
}

/* ── full "review 1 / review 2 / …" grouped sidebar ──────────────────────
   past, completed cycles are read-only and collapsible; the current cycle
   is always expanded and holds the live, navigable StepSidebar. */
function ReviewCyclesSidebar({
  history,
  activeRow,
  activeSidebarProps,
  viewingCycleId,
  onViewCycle,
  onViewActive,
  onApplyAgain,
  className = ""
}) {
  const [openHistoryId, setOpenHistoryId] = useState(null);
  const activeCompleted = !!activeRow?.review_report_url;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {history.map((h) => (
        <ReviewCycleGroup
          key={h.id}
          title={`Review ${h.attempt ?? "—"}`}
          done
          expanded={openHistoryId === h.id}
          onToggle={() => setOpenHistoryId((id) => (id === h.id ? null : h.id))}
        >
          <button
            type="button"
            onClick={() => onViewCycle(h)}
            className={`w-full text-left rounded-lg px-2.5 py-1.5 mb-1 text-[11px] font-semibold transition-colors ${
              viewingCycleId === h.id
                ? "text-evolve-yellow"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            View this review →
          </button>
          <ReadOnlyStepList row={h} />
        </ReviewCycleGroup>
      ))}

      <ReviewCycleGroup
        title={`Review ${activeRow?.attempt ?? history.length + 1}`}
        done={activeCompleted}
        expanded
        toggleable={false}
      >
        {viewingCycleId ? (
          <button
            type="button"
            onClick={onViewActive}
            className="w-full text-left rounded-lg px-2.5 py-1.5 mb-2 text-[11px] font-semibold text-evolve-yellow"
          >
            ← Back to this review
          </button>
        ) : (
          <StepSidebar {...activeSidebarProps} />
        )}
      </ReviewCycleGroup>

      {activeCompleted && onApplyAgain && (
        <button
          type="button"
          onClick={onApplyAgain}
          className="rounded-xl border border-evolve-yellow/40 bg-evolve-yellow/[0.08] text-evolve-yellow text-xs font-bold px-3.5 py-3 hover:bg-evolve-yellow/[0.14] transition-colors"
        >
          Apply again →
        </button>
      )}
    </div>
  );
}

/* ── read-only report/recording view for a past, finished cycle ─────────── */
function PastCycleView({ row, onBack }) {
  return (
    <div className="flex flex-col gap-5">
      <button
        type="button"
        onClick={onBack}
        className="text-evolve-yellow text-xs font-semibold w-fit"
      >
        ← Back to your current review
      </button>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-white font-bold font-bricolage text-lg">
          Review {row.attempt} — report
        </h2>
        {row.review_report_url && (
          <a
            href={row.review_report_url}
            target="_blank"
            rel="noreferrer"
            className="text-evolve-yellow text-xs font-semibold"
          >
            Open report in new tab ↗
          </a>
        )}
      </div>

      {row.review_report_url ? (
        <div
          className="rounded-2xl border border-white/10 overflow-hidden"
          style={{ height: "calc(100vh - 240px)", minHeight: 480 }}
        >
          <iframe
            title="report"
            src={row.review_report_url}
            className="w-full h-full"
          />
        </div>
      ) : (
        <p className="text-white/40 text-sm">
          No report was uploaded for this cycle.
        </p>
      )}

      {row.meet_recording_url && (
        <div className="flex flex-col gap-2">
          <p className="text-white/30 text-[11px] font-bold uppercase tracking-wide">
            Session recording
          </p>
          <div
            className="rounded-2xl border border-white/10 overflow-hidden"
            style={{ height: 400 }}
          >
            <iframe
              title="session recording"
              src={driveEmbedUrl(row.meet_recording_url)}
              className="w-full h-full"
              allow="autoplay"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ── main flow ────────────────────────────────────────────────────────── */
export default function PortfolioReviewFlow({
  user,
  onBack,
  review,
  history = [],
  onApplyAgain
}) {
  const [row, setRow] = useState(review || null);
  const [phase, setPhase] = useState("questions");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({ q1: "", q2: "", q3: "", q4: "" });

  const [resumeMode, setResumeMode] = useState("upload");
  const [resumeLink, setResumeLink] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUploading, setResumeUploading] = useState(false);

  const [portfolioMode, setPortfolioMode] = useState("link");
  const [portfolioLink, setPortfolioLink] = useState("");
  const [portfolioFileUrl, setPortfolioFileUrl] = useState("");
  const [portfolioFile, setPortfolioFile] = useState(null);
  const [portfolioUploading, setPortfolioUploading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);
  const [viewingCycle, setViewingCycle] = useState(null);
  const [growthModal, setGrowthModal] = useState(null);

  const { user: authUser, refreshUser } = useAuth();

  // reviewer-matching details — only design school students get asked for
  // these (see src/pages/Onboarding/questions.js), prefilled from what they
  // already gave at onboarding but editable here.
  const isDesignSchoolStudent = authUser?.persona === "Design school student";
  const [reviewerSchool, setReviewerSchool] = useState(
    authUser?.school_name || ""
  );
  const [reviewerYear, setReviewerYear] = useState(authUser?.standard || "");
  const [reviewerStream, setReviewerStream] = useState(authUser?.stream || "");

  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  const [resultsTab, setResultsTab] = useState("report");
  const [bookingFollowup, setBookingFollowup] = useState(false);

  const calendlyLoaded = useRef(false);

  // `review` is the caller's latest cycle for this user (see
  // PortfolioReviewProgramme) — re-sync local state whenever it changes id,
  // i.e. on first mount and whenever a fresh cycle is opened via "apply again".
  useEffect(() => {
    if (!review) return;
    setRow(review);
    setViewingCycle(null);
    setAnswers({
      q1: review.q1 || "",
      q2: review.q2 || "",
      q3: review.q3 || "",
      q4: review.q4 || ""
    });

    setResumeMode(review.resume_mode || "upload");
    setResumeUrl(
      (review.resume_mode || "upload") === "upload"
        ? review.resume_value || ""
        : ""
    );
    setResumeLink(
      (review.resume_mode || "upload") === "link"
        ? review.resume_value || ""
        : ""
    );
    setPortfolioMode(review.portfolio_mode || "link");
    setPortfolioFileUrl(
      (review.portfolio_mode || "link") === "upload"
        ? review.portfolio_value || ""
        : ""
    );
    setPortfolioLink(
      (review.portfolio_mode || "link") === "link"
        ? review.portfolio_value || ""
        : ""
    );

    setFeedbackSent(!!review.feedback_rating);
    setFeedbackRating(review.feedback_rating || 0);
    setFeedbackText(review.feedback_text || "");
    setResultsTab("report");
    setBookingFollowup(false);

    if (review.review_report_url || review.meet_recording_url) {
      setPhase("results");
    } else if (review.review_status === "in_review") {
      setPhase("confirmed");
    } else if (review.review_status === "pending") {
      setPhase("booking");
    } else {
      const loaded = {
        q1: review.q1 || "",
        q2: review.q2 || "",
        q3: review.q3 || "",
        q4: review.q4 || ""
      };
      const allAnswered = QUESTIONS.every(
        (q) => q.optional || loaded[q.key].trim()
      );
      if (allAnswered) {
        setPhase("share");
      } else {
        const firstEmpty = QUESTIONS.findIndex(
          (q) => !q.optional && !loaded[q.key].trim()
        );
        setCurrentQ(firstEmpty >= 0 ? firstEmpty : 0);
        setPhase("questions");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [review?.id]);

  useEffect(() => {
    if ((phase !== "booking" && !bookingFollowup) || calendlyLoaded.current)
      return;
    if (!document.getElementById("calendly-script")) {
      const s = document.createElement("script");
      s.id = "calendly-script";
      s.src = "https://assets.calendly.com/assets/external/widget.js";
      s.async = true;
      document.head.appendChild(s);
    }
    calendlyLoaded.current = true;
  }, [phase, bookingFollowup]);

  useEffect(() => {
    const onMsg = async (e) => {
      if (e.data?.event !== "calendly.event_scheduled" || !row?.id) return;
      if (bookingFollowup) {
        await supabase
          .from("evolve_portfolio_reviews")
          .update({ followup_status: "booked" })
          .eq("id", row.id);
        setRow((r) => (r ? { ...r, followup_status: "booked" } : r));
        setBookingFollowup(false);
        return;
      }
      await supabase
        .from("evolve_portfolio_reviews")
        .update({ review_status: "in_review" })
        .eq("id", row.id);
      setPhase("confirmed");
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [row?.id, bookingFollowup]);

  async function persist(status) {
    if (!row?.id) return "no review row";
    const payload = {
      q1: answers.q1 || null,
      q2: answers.q2 || null,
      q3: answers.q3 || null,
      q4: answers.q4 || null,
      resume_mode: resumeMode,
      resume_value:
        (resumeMode === "upload" ? resumeUrl : resumeLink.trim()) || null,
      portfolio_mode: portfolioMode,
      portfolio_value:
        (portfolioMode === "link" ? portfolioLink.trim() : portfolioFileUrl) ||
        null,
      review_status: status
    };
    const { error: err } = await supabase
      .from("evolve_portfolio_reviews")
      .update(payload)
      .eq("id", row.id);
    return err?.message || null;
  }

  async function goBackToProgrammes() {
    if (phase === "questions" || phase === "share") {
      setSaving(true);
      await persist("draft");
      setSaving(false);
    }
    onBack?.();
  }

  async function nextQ() {
    if (
      !answers[QUESTIONS[currentQ].key]?.trim() &&
      !QUESTIONS[currentQ].optional
    )
      return;
    setSaving(true);
    const err = await persist("draft");
    setSaving(false);
    if (err) {
      setError(err);
      return;
    }
    if (currentQ < QUESTIONS.length - 1) setCurrentQ((q) => q + 1);
    else setPhase("share");
  }

  async function handleBackQ() {
    if (currentQ === 0) return;
    setSaving(true);
    await persist("draft");
    setSaving(false);
    setCurrentQ((q) => q - 1);
  }

  async function handleSaveForLater() {
    setSaving(true);
    const err = await persist("draft");
    setSaving(false);
    if (!err) {
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2200);
    }
  }

  // Advances the growth mascot and surfaces a celebratory modal — but never
  // regresses it (e.g. re-answering after "apply again" shouldn't re-show a
  // stage the learner already passed on an earlier cycle).
  async function advanceGrowthStage(target, heading, message) {
    if (!authUser || (authUser.growth_stage ?? 0) >= target) return;
    await supabase
      .from("profiles")
      .update({ growth_stage: target })
      .eq("id", authUser.id);
    await refreshUser();
    setGrowthModal({ progress: target, heading, message });
  }

  async function handleSubmitShare() {
    const resumeOk =
      resumeMode === "upload" ? !!resumeUrl : !!resumeLink.trim();
    const portfolioOk =
      portfolioMode === "upload" ? !!portfolioFileUrl : !!portfolioLink.trim();
    if (!resumeOk || !portfolioOk) {
      setError("please add both your resume and portfolio before submitting.");
      return;
    }
    setError("");
    setSaving(true);

    if (isDesignSchoolStudent) {
      const patch = {};
      if (reviewerSchool.trim() !== (authUser?.school_name || ""))
        patch.school_name = reviewerSchool.trim() || null;
      if (reviewerYear !== (authUser?.standard || ""))
        patch.standard = reviewerYear || null;
      if (reviewerStream !== (authUser?.stream || ""))
        patch.stream = reviewerStream || null;
      if (Object.keys(patch).length) {
        await supabase.from("profiles").update(patch).eq("id", authUser.id);
        await refreshUser();
      }
    }

    const err = await persist("pending");
    setSaving(false);
    if (err) {
      setError(err);
      return;
    }
    setPhase("booking");
    advanceGrowthStage(
      SUBMIT_GROWTH_STAGE,
      "Your portfolio is growing 🌿",
      "You've shared your work, almost time for your live 1:1 review."
    );
  }

  async function handleResumeFile(file) {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("please upload a PDF file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("file must be under 5MB.");
      return;
    }
    setError("");
    setResumeUploading(true);
    setResumeFile(file);
    const path = `${user.id}/resume/${Date.now()}_${safeFileName(file.name)}`;
    const { error: upErr } = await supabase.storage
      .from("evolve-portfolio-reviews")
      .upload(path, file, { upsert: true, contentType: "application/pdf" });
    if (upErr) {
      setResumeUploading(false);
      setResumeFile(null);
      setError(upErr.message);
      return;
    }
    const { data: urlData } = supabase.storage
      .from("evolve-portfolio-reviews")
      .getPublicUrl(path);
    setResumeUrl(urlData?.publicUrl || "");
    setResumeUploading(false);
  }

  async function handlePortfolioFile(file) {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("please upload a PDF file.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("file must be under 20MB.");
      return;
    }
    setError("");
    setPortfolioUploading(true);
    setPortfolioFile(file);
    const path = `${user.id}/portfolio/${Date.now()}_${safeFileName(file.name)}`;
    const { error: upErr } = await supabase.storage
      .from("evolve-portfolio-reviews")
      .upload(path, file, { upsert: true, contentType: "application/pdf" });
    if (upErr) {
      setPortfolioUploading(false);
      setPortfolioFile(null);
      setError(upErr.message);
      return;
    }
    const { data: urlData } = supabase.storage
      .from("evolve-portfolio-reviews")
      .getPublicUrl(path);
    setPortfolioFileUrl(urlData?.publicUrl || "");
    setPortfolioUploading(false);
  }

  async function submitFeedback() {
    if (!feedbackRating || !row?.id) return;
    await supabase
      .from("evolve_portfolio_reviews")
      .update({
        feedback_rating: feedbackRating,
        feedback_text: feedbackText || null
      })
      .eq("id", row.id);
    setFeedbackSent(true);
  }

  if (!row) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="text-white/60 text-sm">
          We couldn't find your review — try refreshing the page.
        </p>
        {onBack && (
          <button
            onClick={onBack}
            className="text-evolve-yellow text-xs font-semibold"
          >
            Back to programmes
          </button>
        )}
      </div>
    );
  }

  const maxReachedQ = QUESTIONS.reduce(
    (max, q, i) => (answers[q.key]?.trim() ? i : max),
    -1
  );
  const qDone = phase !== "questions" ? QUESTIONS.length : maxReachedQ + 1;
  const shareDone = ["booking", "confirmed", "results"].includes(phase);
  const bookDone = ["confirmed", "results"].includes(phase);
  const progress = getPortfolioReviewProgress({
    ...row,
    ...answers,
    review_status: row.review_status
  });

  const sidebarProps = {
    phase,
    currentQ,
    qDone,
    shareDone,
    bookDone,
    hasReport: !!row.review_report_url,
    hasRecording: !!row.meet_recording_url,
    resultsTab,
    onSelectQuestion: (i) => {
      setCurrentQ(i);
      setPhase("questions");
    },
    onSelectResultsTab: (tab) => setResultsTab(tab)
  };

  const cyclesSidebarProps = {
    history,
    activeRow: row,
    activeSidebarProps: sidebarProps,
    viewingCycleId: viewingCycle?.id,
    onViewCycle: setViewingCycle,
    onViewActive: () => setViewingCycle(null),
    onApplyAgain
  };

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={goBackToProgrammes}
        disabled={saving}
        className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm font-semibold w-fit transition-colors disabled:opacity-50"
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
        {saving ? "Saving draft…" : "Back to programmes"}
      </button>

      <div className="flex flex-col gap-2 pb-5 border-b border-white/10">
        <h1 className="text-white font-bold font-bricolage text-2xl md:text-[28px] leading-tight">
          Your portfolio review
        </h1>
        <p className="text-white/40 text-sm">
          Follow the steps below — answer a few questions, share your work, then
          book your 1:1 call.
        </p>
      </div>

      {/* mobile progress summary + toggle */}
      <button
        type="button"
        onClick={() => setSidebarOpenMobile((v) => !v)}
        className="md:hidden flex items-center justify-between gap-3 py-1"
      >
        <span className="text-white text-xs font-semibold">
          {viewingCycle
            ? `Viewing review ${viewingCycle.attempt}`
            : `Step ${progress?.step ?? 1} of ${progress?.totalSteps ?? 5} · ${progress?.label}`}
        </span>
        <span className="flex items-center gap-2 flex-shrink-0">
          <span className="text-evolve-yellow text-xs font-bold">
            {viewingCycle ? "Past" : `${progress?.percent ?? 0}%`}
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 20 20"
            fill="none"
            className={`text-white/40 transition-transform ${sidebarOpenMobile ? "rotate-180" : ""}`}
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
      {!viewingCycle && (
        <div className="md:hidden h-1.5 rounded-full bg-white/10 overflow-hidden -mt-2">
          <div
            className="h-full bg-evolve-yellow rounded-full transition-[width]"
            style={{ width: `${progress?.percent ?? 0}%` }}
          />
        </div>
      )}
      {sidebarOpenMobile && (
        <div className="md:hidden">
          <ReviewCyclesSidebar
            {...cyclesSidebarProps}
            onViewCycle={(h) => {
              setViewingCycle(h);
              setSidebarOpenMobile(false);
            }}
          />
        </div>
      )}

      <div className="flex flex-col md:flex-row">
        <div className="hidden md:block md:w-64 flex-shrink-0 md:sticky md:top-16 md:self-start md:pr-8 md:border-r md:border-white/10">
          <ReviewCyclesSidebar {...cyclesSidebarProps} />
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-5 md:pl-8">
          {error && (
            <div className="rounded-xl border border-red-400/30 bg-red-400/[0.06] px-4 py-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          {viewingCycle ? (
            <PastCycleView
              row={viewingCycle}
              onBack={() => setViewingCycle(null)}
            />
          ) : (
            <>
              {phase === "questions" && (
                <div className="flex flex-col gap-3 max-w-2xl">
                  <p className="text-white/30 text-[11px] font-bold uppercase tracking-wide">
                    Let's get to know you ({currentQ + 1}/{QUESTIONS.length})
                    {QUESTIONS[currentQ].optional && " · optional"}
                  </p>
                  <h2 className="text-white font-bold font-bricolage text-xl leading-snug">
                    {QUESTIONS[currentQ].question}
                  </h2>
                  <textarea
                    autoFocus
                    rows={7}
                    value={answers[QUESTIONS[currentQ].key]}
                    onChange={(e) =>
                      setAnswers((a) => ({
                        ...a,
                        [QUESTIONS[currentQ].key]: e.target.value
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        nextQ();
                      }
                    }}
                    placeholder={QUESTIONS[currentQ].placeholder}
                    className="w-full text-sm text-white placeholder-white/25 outline-none border border-white/15 focus:border-white/25 rounded-xl px-4 py-3.5 resize-none transition-colors"
                    style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                  />
                  <p className="text-white/20 text-[10px]">
                    Shift + enter for a new line
                  </p>
                  <div className="flex items-center justify-end gap-3">
                    {QUESTIONS[currentQ].optional && (
                      <button
                        onClick={() => setPhase("share")}
                        disabled={saving}
                        className="text-white/60 hover:text-white text-xs font-bold rounded-2xl border border-[#373737] hover:bg-[#232325] px-5 py-2.5 mr-auto disabled:opacity-30 transition-colors"
                      >
                        Skip
                      </button>
                    )}
                    {currentQ > 0 && (
                      <button
                        onClick={handleBackQ}
                        disabled={saving}
                        className="inline-flex items-center gap-2 text-white font-bold text-sm rounded-2xl border border-[#373737] hover:bg-[#232325] px-7 py-3.5 disabled:opacity-30 transition-colors"
                      >
                        <img
                          src={right_arrow_icon}
                          alt=""
                          className="w-4 h-4"
                          style={{
                            transform: "scaleX(-1)",
                            filter: "invert(1)"
                          }}
                        />
                        Back
                      </button>
                    )}
                    <button
                      onClick={nextQ}
                      disabled={
                        saving ||
                        (!answers[QUESTIONS[currentQ].key]?.trim() &&
                          !QUESTIONS[currentQ].optional)
                      }
                      className="inline-flex items-center gap-2 bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl px-7 py-3.5 disabled:opacity-40 active:opacity-80 transition-opacity"
                    >
                      {saving ? "Saving…" : "Continue"}
                      {!saving && (
                        <img
                          src={right_arrow_icon}
                          alt=""
                          className="w-4 h-4"
                        />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {phase === "share" && (
                <div className="flex flex-col gap-6">
                  <p className="text-white/30 text-[11px] font-bold uppercase tracking-wide">
                    Share your work
                  </p>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-white font-bold font-bricolage text-lg">
                        Your resume
                      </h2>
                      <div className="flex items-center gap-2 text-[11px] font-semibold">
                        <button
                          onClick={() => setResumeMode("upload")}
                          className={`rounded-full px-4 py-1.5 border transition-colors ${resumeMode === "upload" ? "border-white text-white" : "border-[#373737] text-white/40 hover:bg-[#232325]"}`}
                        >
                          Upload
                        </button>
                        <button
                          onClick={() => setResumeMode("link")}
                          className={`rounded-full px-4 py-1.5 border transition-colors ${resumeMode === "link" ? "border-white text-white" : "border-[#373737] text-white/40 hover:bg-[#232325]"}`}
                        >
                          Link
                        </button>
                      </div>
                    </div>
                    {resumeMode === "upload" ? (
                      <label className="rounded-xl border border-dashed border-white/15 hover:border-evolve-yellow/40 bg-white/[0.02] px-4 py-6 flex flex-col items-center gap-1.5 text-center cursor-pointer transition-colors">
                        <input
                          type="file"
                          accept="application/pdf"
                          className="hidden"
                          onChange={(e) =>
                            handleResumeFile(e.target.files?.[0])
                          }
                        />
                        <span className="text-white/60 text-xs font-semibold">
                          {resumeUploading
                            ? "Uploading…"
                            : resumeUrl
                              ? "Resume uploaded ✓ — tap to replace"
                              : resumeFile?.name ||
                                "Tap to upload your resume (PDF, max 5MB)"}
                        </span>
                      </label>
                    ) : (
                      <input
                        type="url"
                        value={resumeLink}
                        onChange={(e) => setResumeLink(e.target.value)}
                        placeholder="https://drive.google.com/…"
                        className="w-full text-sm text-white placeholder-white/25 outline-none border border-white/15 focus:border-evolve-yellow/60 rounded-xl px-4 py-3 transition-colors"
                        style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                      />
                    )}
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-white font-bold font-bricolage text-lg">
                        Your portfolio
                      </h2>
                      <div className="flex items-center gap-2 text-[11px] font-semibold">
                        <button
                          onClick={() => setPortfolioMode("link")}
                          className={`rounded-full px-4 py-1.5 border transition-colors ${portfolioMode === "link" ? "border-white text-white" : "border-[#373737] text-white/40 hover:bg-[#232325]"}`}
                        >
                          Link
                        </button>
                        <button
                          onClick={() => setPortfolioMode("upload")}
                          className={`rounded-full px-4 py-1.5 border transition-colors ${portfolioMode === "upload" ? "border-white text-white" : "border-[#373737] text-white/40 hover:bg-[#232325]"}`}
                        >
                          Upload
                        </button>
                      </div>
                    </div>
                    {portfolioMode === "link" ? (
                      <input
                        type="url"
                        value={portfolioLink}
                        onChange={(e) => setPortfolioLink(e.target.value)}
                        placeholder="https://behance.net/… or your own site"
                        className="w-full text-sm text-white placeholder-white/25 outline-none border border-white/15 focus:border-evolve-yellow/60 rounded-xl px-4 py-3 transition-colors"
                        style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                      />
                    ) : (
                      <label className="rounded-xl border border-dashed border-white/15 hover:border-evolve-yellow/40 bg-white/[0.02] px-4 py-6 flex flex-col items-center gap-1.5 text-center cursor-pointer transition-colors">
                        <input
                          type="file"
                          accept="application/pdf"
                          className="hidden"
                          onChange={(e) =>
                            handlePortfolioFile(e.target.files?.[0])
                          }
                        />
                        <span className="text-white/60 text-xs font-semibold">
                          {portfolioUploading
                            ? "Uploading…"
                            : portfolioFileUrl
                              ? "Portfolio uploaded ✓ — tap to replace"
                              : portfolioFile?.name ||
                                "Tap to upload your portfolio (PDF, max 20MB)"}
                        </span>
                      </label>
                    )}
                  </div>

                  {isDesignSchoolStudent && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="text-white font-bold font-bricolage text-lg">
                          Reviewer details
                        </h2>
                        <span className="text-white/30 text-[10px] font-semibold text-right">
                          Prefilled from your profile — edit if needed
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-white/40 text-[10px] font-semibold uppercase tracking-wide">
                            institute / school
                          </label>
                          <input
                            type="text"
                            value={reviewerSchool}
                            onChange={(e) => setReviewerSchool(e.target.value)}
                            placeholder="Your design school or college"
                            className="w-full text-sm text-white placeholder-white/25 outline-none border border-white/15 focus:border-evolve-yellow/60 rounded-xl px-4 py-3 transition-colors"
                            style={{
                              backgroundColor: "rgba(255,255,255,0.06)"
                            }}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-white/40 text-[10px] font-semibold uppercase tracking-wide">
                            year
                          </label>
                          <select
                            value={reviewerYear}
                            onChange={(e) => setReviewerYear(e.target.value)}
                            className="w-full text-sm text-white outline-none border border-white/15 focus:border-evolve-yellow/60 rounded-xl px-4 py-3 transition-colors"
                            style={{
                              backgroundColor: "rgba(255,255,255,0.06)"
                            }}
                          >
                            <option value="" className="bg-[#161618]">
                              Select year
                            </option>
                            {YEAR_VALUES.map((y) => (
                              <option
                                key={y}
                                value={y}
                                className="bg-[#161618]"
                              >
                                {y}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-white/40 text-[10px] font-semibold uppercase tracking-wide">
                            program / stream
                          </label>
                          <select
                            value={reviewerStream}
                            onChange={(e) => setReviewerStream(e.target.value)}
                            className="w-full text-sm text-white outline-none border border-white/15 focus:border-evolve-yellow/60 rounded-xl px-4 py-3 transition-colors"
                            style={{
                              backgroundColor: "rgba(255,255,255,0.06)"
                            }}
                          >
                            <option value="" className="bg-[#161618]">
                              Select stream
                            </option>
                            {DISCIPLINE_VALUES.map((d) => (
                              <option
                                key={d}
                                value={d}
                                className="bg-[#161618]"
                              >
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <p className="text-white/25 text-[10px] leading-relaxed">
                        We'll use this to match you with the right reviewer for
                        your program.
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <button
                      onClick={handleSaveForLater}
                      disabled={saving}
                      className="text-white/40 hover:text-white text-xs font-semibold transition-colors"
                    >
                      {savedMsg ? "Saved ✓" : "Save for later"}
                    </button>
                    <button
                      onClick={handleSubmitShare}
                      disabled={saving || resumeUploading || portfolioUploading}
                      className="inline-flex items-center gap-2 bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl px-7 py-3.5 disabled:opacity-40 active:opacity-80 transition-opacity"
                    >
                      {saving ? "Submitting…" : "Submit & book a call"}
                      {!saving && (
                        <img
                          src={right_arrow_icon}
                          alt=""
                          className="w-4 h-4"
                        />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {phase === "booking" && (
                <div className="flex flex-col gap-3">
                  <p className="text-white/30 text-[11px] font-bold uppercase tracking-wide">
                    Book a call
                  </p>
                  <h2 className="text-white font-bold font-bricolage text-lg">
                    Book your 1:1 call
                  </h2>
                  <p className="text-white/40 text-xs">
                    Pick a slot that works for you — we'll send a calendar
                    invite.
                  </p>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 text-white/50 text-[11px] font-semibold">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="9"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />
                        <path
                          d="M12 7v5l3 2"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      ~30 min · Live 1:1 video call
                    </div>
                    <div
                      className="calendly-inline-widget"
                      data-url={`${getCalendlyUrlForStream(reviewerStream || authUser?.stream)}?hide_landing_page_details=1&hide_gdpr_banner=1`}
                      style={{ minWidth: 280, height: 700 }}
                    />
                  </div>
                </div>
              )}

              {phase === "confirmed" && (
                <div className="flex flex-col items-center gap-4 text-center rounded-2xl border border-white/10 bg-white/[0.03] py-14 px-6">
                  <div className="w-16 h-16 rounded-full border-4 border-evolve-inchworm flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
                      <path
                        d="M8 18l7 7 13-14"
                        stroke="#c2fd5c"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">
                      You're all set
                    </h3>
                    <p className="text-white/40 text-xs mt-1 max-w-xs">
                      Your call is booked — your reviewer will go through your
                      portfolio with you live. Your report lands here after.
                    </p>
                  </div>
                  <div className="w-full max-w-xs flex flex-col gap-2 text-left mt-2">
                    {[
                      "You'll get a calendar invite with the video call link",
                      "Your reviewer goes through your portfolio live with you",
                      "A written report lands here right after your call"
                    ].map((line) => (
                      <div key={line} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-evolve-inchworm mt-1.5 flex-shrink-0" />
                        <p className="text-white/40 text-xs leading-relaxed">
                          {line}
                        </p>
                      </div>
                    ))}
                  </div>
                  {(() => {
                    const reviewer = getReviewerForStream(
                      reviewerStream || authUser?.stream,
                      authUser?.id
                    );
                    return (
                      <div className="w-full max-w-xs flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-left mt-1">
                        <img
                          src={reviewer.image}
                          alt={reviewer.name}
                          className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-white/30 text-[10px] font-bold uppercase tracking-wide">
                            Your reviewer
                          </p>
                          <p className="text-white text-sm font-bold truncate">
                            {reviewer.name}
                          </p>
                          <p className="text-white/40 text-[11px] leading-snug truncate">
                            {reviewer.role}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                  <button
                    onClick={() => {
                      if (window.confirm("Reschedule your call?"))
                        setPhase("booking");
                    }}
                    className="text-evolve-yellow text-xs font-semibold underline decoration-evolve-yellow underline-offset-2"
                  >
                    Need to reschedule?
                  </button>
                </div>
              )}

              {phase === "results" && (
                <div className="flex flex-col gap-5">
                  <p className="text-white/30 text-[11px] font-bold uppercase tracking-wide">
                    Your review
                  </p>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h2 className="text-white font-bold font-bricolage text-lg">
                      Your review is ready
                    </h2>
                    {row.review_report_url && (
                      <a
                        href={row.review_report_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-evolve-yellow text-xs font-semibold"
                      >
                        Open report in new tab ↗
                      </a>
                    )}
                  </div>

                  {resultsTab === "report" &&
                    (row.review_report_url ? (
                      <div
                        className="rounded-2xl overflow-hidden"
                        style={{
                          height: "calc(100vh - 240px)",
                          minHeight: 480
                        }}
                      >
                        <iframe
                          title="report"
                          src={row.review_report_url}
                          className="w-full h-full"
                        />
                      </div>
                    ) : (
                      <p className="text-white/40 text-sm">
                        Report not uploaded yet.
                      </p>
                    ))}

                  {resultsTab === "session" && (
                    <div className="flex flex-col gap-5">
                      {row.meet_recording_url ? (
                        <div className="flex flex-col gap-2">
                          <p className="text-white/30 text-[11px] font-bold uppercase tracking-wide">
                            Session recording
                          </p>
                          <div
                            className="rounded-2xl overflow-hidden"
                            style={{ height: 400 }}
                          >
                            <iframe
                              title="session recording"
                              src={driveEmbedUrl(row.meet_recording_url)}
                              className="w-full h-full"
                              allow="autoplay"
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-white/40 text-sm">
                          Recording not uploaded yet.
                        </p>
                      )}

                      {!feedbackSent ? (
                        <div className="rounded-2xl bg-white/[0.03] p-5 flex flex-col gap-3">
                          <p className="text-white text-sm font-semibold">
                            How was your review?
                          </p>
                          <div className="flex gap-1.5">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button
                                key={n}
                                onClick={() => setFeedbackRating(n)}
                                className="text-xl leading-none"
                              >
                                <span
                                  className={
                                    n <= feedbackRating
                                      ? "text-evolve-yellow"
                                      : "text-white/15"
                                  }
                                >
                                  ★
                                </span>
                              </button>
                            ))}
                          </div>
                          <textarea
                            rows={2}
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            placeholder="Anything you'd like to add? (optional)"
                            className="w-full text-sm text-white placeholder-white/25 outline-none border border-white/15 focus:border-evolve-yellow/60 rounded-xl px-3.5 py-2.5 resize-none transition-colors"
                            style={{
                              backgroundColor: "rgba(255,255,255,0.06)"
                            }}
                          />
                          <button
                            onClick={submitFeedback}
                            disabled={!feedbackRating}
                            className="self-start bg-evolve-yellow text-evolve-black font-bold text-xs rounded-full px-5 py-2 disabled:opacity-40"
                          >
                            Submit feedback
                          </button>
                        </div>
                      ) : (
                        <p className="flex items-center gap-2 text-white text-xs font-semibold">
                          <span className="text-evolve-yellow font-bold">
                            ✓
                          </span>
                          Thanks for the feedback 🌱
                        </p>
                      )}
                    </div>
                  )}

                  {resultsTab === "followup" &&
                    (row.followup_recording_url ? (
                      <div className="flex flex-col gap-2">
                        <p className="text-white/30 text-[11px] font-bold uppercase tracking-wide">
                          Follow-up session recording
                        </p>
                        <div
                          className="rounded-2xl overflow-hidden"
                          style={{ height: 400 }}
                        >
                          <iframe
                            title="follow-up session recording"
                            src={driveEmbedUrl(row.followup_recording_url)}
                            className="w-full h-full"
                            allow="autoplay"
                          />
                        </div>
                      </div>
                    ) : row.followup_status === "booked" ? (
                      <p className="text-white/40 text-sm">
                        Your follow-up call is booked — the recording will
                        appear here after your session.
                      </p>
                    ) : bookingFollowup ? (
                      <div className="flex flex-col gap-3">
                        <p className="text-white/30 text-[11px] font-bold uppercase tracking-wide">
                          Book a follow-up call
                        </p>
                        <div
                          className="calendly-inline-widget rounded-2xl overflow-hidden border border-white/10"
                          data-url={`${getCalendlyUrlForStream(reviewerStream || authUser?.stream)}?hide_landing_page_details=1&hide_gdpr_banner=1`}
                          style={{ minWidth: 280, height: 700 }}
                        />
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-evolve-inchworm/30 bg-evolve-inchworm/[0.05] p-5 flex items-center justify-between flex-wrap gap-3">
                        <div>
                          <p className="text-white text-sm font-semibold">
                            Want to talk it through?
                          </p>
                          <p className="text-white/40 text-xs mt-0.5">
                            Book a free follow-up call with your reviewer.
                          </p>
                        </div>
                        <button
                          onClick={() => setBookingFollowup(true)}
                          className="bg-evolve-inchworm text-evolve-black font-bold text-xs rounded-full px-5 py-2.5 active:opacity-80 transition-opacity flex-shrink-0"
                        >
                          Book a follow-up call →
                        </button>
                      </div>
                    ))}

                  {row.review_report_url && onApplyAgain && (
                    <div className="rounded-2xl border border-evolve-yellow/30 bg-evolve-yellow/[0.05] p-5 flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <p className="text-white text-sm font-semibold">
                          Want another round?
                        </p>
                        <p className="text-white/40 text-xs mt-0.5">
                          Start a brand new portfolio review cycle whenever
                          you're ready.
                        </p>
                      </div>
                      <button
                        onClick={onApplyAgain}
                        className="bg-evolve-yellow text-evolve-black font-bold text-xs rounded-full px-5 py-2.5 active:opacity-80 transition-opacity flex-shrink-0"
                      >
                        Apply again →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {growthModal && (
        <GrowthStageModal
          {...growthModal}
          onContinue={() => setGrowthModal(null)}
        />
      )}
    </div>
  );
}
