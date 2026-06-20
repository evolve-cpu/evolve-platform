import { useEffect, useRef, useState, Fragment } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { supabaseAdmin } from "../../supabaseAdminClient";
import { anant_logo } from "../../assets/images/Community";
import { useAnantTheme } from "../../context/AnantThemeContext";

const CALENDLY_URL =
  import.meta.env.VITE_CALENDLY_URL ||
  "https://calendly.com/content-evolvedesign/30min";

const ANU_ORIGIN = "https://anu.evolvedesign.academy";
// const ANU_ORIGIN = "http://localhost:8080"; // for local dev
const BREVO_URL = "https://api.brevo.com/v3/smtp/email";
const BREVO_KEY = import.meta.env.VITE_BREVO_API_KEY;

// Convert Google Drive share link → embeddable preview URL
function driveEmbedUrl(url) {
  if (!url) return null;
  const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return `https://drive.google.com/file/d/${m[1]}/preview`;
  const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m2) return `https://drive.google.com/file/d/${m2[1]}/preview`;
  return url;
}

async function sendSubmissionConfirmation(toEmail, toName, calendlyUrl) {
  if (!BREVO_KEY) return;
  const firstName = (toName || "").split(" ")[0] || "there";
  const htmlContent = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:40px 32px;background:#060c17;color:#fff;border-radius:16px">
      <img src="${ANU_ORIGIN}/images/anant-logo.png" alt="Anant National University" style="height:40px;margin:0 auto 32px 0;display:block" />
      <p style="color:rgba(255,255,255,0.5);font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 10px">Anant National University x evolve</p>
      <h1 style="font-size:24px;font-weight:800;letter-spacing:-0.02em;line-height:1.25;margin:0 0 16px">We've received your portfolio, ${firstName}!</h1>
      <p style="font-size:15px;line-height:1.7;color:rgba(255,255,255,0.72);margin:0 0 28px">
        Your portfolio, resume and answers have been received. Your reviewer will look these over before your call. The next step is to book your 1:1 review call — choose a slot that works for you.
      </p>
      <a href="${calendlyUrl}" style="display:inline-block;background:#2563eb;color:#fff;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;text-decoration:none">
        Book your review call →
      </a>
      <p style="font-size:13px;color:rgba(255,255,255,0.35);margin:20px 0 0">If you've already booked your call, you can ignore the button above.</p>
      <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:28px 0 20px" />
      <p style="font-size:12px;color:rgba(255,255,255,0.28);margin:0">This email is for ${toEmail}. If this wasn't you, please ignore it.</p>
    </div>`;
  await fetch(BREVO_URL, {
    method: "POST",
    headers: { "api-key": BREVO_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: { name: "Anant National University x evolve", email: "noreply@evolvedesign.academy" },
      to: [{ email: toEmail, name: toName || "" }],
      subject: "We've received your portfolio — book your review call",
      htmlContent
    })
  });
}

const QUESTIONS = [
  {
    key: "q1",
    question: "The hardest part about putting your portfolio together?",
    placeholder:
      "ex. deciding which projects to include, writing case studies, structuring it, design and layout.",
    short: "The hardest part about putting..."
  },
  {
    key: "q2",
    question: "What kind of work are you hoping to land?",
    placeholder:
      "ex. UX design roles at product companies, graphic design internships, architectural projects...",
    short: "What kind of work are you hoping..."
  },
  {
    key: "q3",
    question: "Is there anything specific you'd like us to review closely?",
    placeholder:
      "ex. case study structure, visual consistency, overall first impression, a specific project...",
    short: "Is there anything specific you'd like us..."
  },
  {
    key: "q4",
    question:
      "Anything else you're finding difficult that we should know about?",
    placeholder:
      "ex. I'm not sure how to present a particular project, or I struggle with writing about my design process...",
    short: "Anything else you're finding difficult..."
  }
];

/* ── Feedback Modal ─────────────────────────────────────────────────────────── */
function FeedbackModal({ dark, reviewId, onClose }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const modalBg = dark ? "#0a1628" : "#ffffff";
  const borderCol = dark ? "#0d1f3c" : "#e2e8f0";
  const textCol = dark ? "#f0f4ff" : "#0f172a";
  const subCol = dark ? "rgba(255,255,255,0.55)" : "#475569";
  const inputBg = dark ? "#060c17" : "#f8fafc";
  const inputBorder = dark ? "#1e3a5f" : "#e2e8f0";

  async function submit() {
    if (!rating) return;
    setSubmitting(true);
    await supabaseAdmin
      .from("portfolio_reviews")
      .update({ feedback_rating: rating, feedback_text: text || null })
      .eq("id", reviewId);
    setSubmitting(false);
    setDone(true);
    setTimeout(onClose, 1400);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border p-7 shadow-2xl"
        style={{ background: modalBg, borderColor: borderCol }}
      >
        {done ? (
          <div className="text-center py-4">
            <p className="text-3xl mb-3">✓</p>
            <p className="font-semibold text-base" style={{ color: textCol }}>
              Thanks for your feedback!
            </p>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold mb-1" style={{ color: textCol }}>
              How was your experience?
            </h3>
            <p className="text-sm mb-5" style={{ color: subCol }}>
              Your feedback helps us improve this programme for future students.
            </p>
            <div className="flex gap-1.5 mb-5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="text-3xl transition-transform hover:scale-110"
                  style={{
                    color:
                      star <= (hovered || rating)
                        ? "#f59e0b"
                        : dark
                          ? "#334155"
                          : "#d1d5db"
                  }}
                >
                  ★
                </button>
              ))}
            </div>
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: subCol }}
            >
              Tell us more (optional)
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share your thoughts..."
              rows={3}
              className="w-full rounded-lg border px-3 py-2.5 text-sm resize-none outline-none mb-5"
              style={{
                borderColor: inputBorder,
                background: inputBg,
                color: textCol,
                fontFamily: "inherit"
              }}
            />
            <div className="flex items-center gap-3">
              <button
                onClick={submit}
                disabled={!rating || submitting}
                className="flex-1 py-2.5 rounded-lg text-sm font-bold disabled:opacity-40"
                style={{
                  background: dark ? "#e2e8f0" : "#0f172a",
                  color: dark ? "#0f172a" : "#fff"
                }}
              >
                {submitting ? "submitting…" : "Submit feedback"}
              </button>
              <button
                onClick={onClose}
                className="text-sm"
                style={{ color: subCol }}
              >
                Skip
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Sidebar progress with animated segmented connecting line ───────────────── */
function ProgressSidebar({
  phase,
  currentQ,
  qDone,
  shareDone,
  bookDone,
  dark,
  onSelectQuestion,
  onNavigate,
  isSubmitted,
  recordingUrl
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // sidebar is always dark (#060c17) regardless of theme
  const activeBg = "#2563eb";
  const doneBg = "rgba(255,255,255,0.28)";
  const emptyBdr = "rgba(255,255,255,0.1)";
  const lineFilled = "rgba(37,99,235,0.6)";
  const lineEmpty = "rgba(255,255,255,0.07)";

  const nodes = [
    {
      type: "section",
      label: "let's get to know you",
      active: phase === "questions" || phase === "share",
      done: phase !== "questions" && phase !== "share"
    },
    ...QUESTIONS.map((q, i) => ({
      type: "item",
      label: q.short,
      active: phase === "questions" && i === currentQ && !isSubmitted,
      done: i < qDone,
      questionIndex: i
    })),
    {
      type: "item",
      label: "upload resume & portfolio",
      active: phase === "share",
      done: shareDone
    },
    {
      type: "section",
      label: "meet your reviewer",
      active: phase === "booking" || phase === "done",
      done: bookDone
    },
    {
      type: "item",
      label: "book a call",
      active: phase === "booking",
      done: bookDone
    },
    {
      type: "item",
      label: "meet your reviewer",
      active: phase === "done",
      done: phase === "recording" || phase === "report"
    },
    ...(recordingUrl ? [
      {
        type: "section",
        label: "session recording",
        active: phase === "recording",
        done: phase === "report"
      },
      {
        type: "item",
        label: "watch your session",
        active: phase === "recording",
        done: phase === "report",
        navigateTo: "recording"
      }
    ] : []),
    {
      type: "section",
      label: "view report",
      active: phase === "report",
      done: false
    },
    {
      type: "item",
      label: "check out your report!",
      active: phase === "report",
      done: false,
      navigateTo: "report"
    }
  ];

  return (
    <div style={{ paddingLeft: 20, paddingRight: 20 }}>
      {nodes.map((node, i) => {
        const isLast = i === nodes.length - 1;
        const nextNode = nodes[i + 1];
        const segFilled = !isLast && (nextNode.done || nextNode.active);
        const gap = isLast ? 0 : nextNode.type === "section" ? 14 : 7;
        const dotSize = node.type === "section" ? 12 : 8;

        // Questions: navigable during form-fill OR post-submission (to view read-only)
        const isQuestionNavigable =
          node.type === "item" &&
          node.questionIndex !== undefined &&
          (isSubmitted || ((phase === "questions" || phase === "share") && node.done && !node.active));
        // Phase items: navigable when report/recording available
        const isPhaseNavigable =
          node.navigateTo &&
          node.navigateTo !== phase &&
          (node.navigateTo === "recording" ? !!recordingUrl : true) &&
          (phase === "recording" || phase === "report");
        const isNavigable = isQuestionNavigable || isPhaseNavigable;
        const isHovered = hoveredIdx === i;

        const dotStyle =
          node.active || node.done
            ? {
                background: node.active ? activeBg : doneBg,
                borderColor: node.active ? activeBg : doneBg
              }
            : { background: "transparent", borderColor: emptyBdr };

        const textColor = node.active
          ? node.type === "section"
            ? "#e2e8ff"
            : "#93c5fd"
          : node.done
            ? isHovered && isNavigable
              ? "#c7d2fe"
              : "rgba(255,255,255,0.5)"
            : "rgba(255,255,255,0.18)";

        return (
          <Fragment key={i}>
            {/* Node row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: isNavigable ? "pointer" : "default",
                borderRadius: 7,
                padding: "3px 8px 3px 4px",
                background:
                  isNavigable && isHovered
                    ? "rgba(37,99,235,0.2)"
                    : "transparent",
                transition: "background 0.15s"
              }}
              onClick={() => {
                if (!isNavigable) return;
                if (isQuestionNavigable) onSelectQuestion?.(node.questionIndex);
                else if (isPhaseNavigable) onNavigate?.(node.navigateTo);
              }}
              onMouseEnter={() => isNavigable && setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div
                style={{
                  width: 14,
                  display: "flex",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                <div
                  style={{
                    width: dotSize,
                    height: dotSize,
                    borderRadius: "50%",
                    border: "2px solid",
                    flexShrink: 0,
                    ...dotStyle
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: node.type === "section" ? 12.5 : 12,
                  fontWeight:
                    node.type === "section" ? (node.active ? 700 : 500) : 400,
                  lineHeight: 1.45,
                  color: textColor,
                  transition: "color 0.15s"
                }}
              >
                {node.label}
              </span>
            </div>

            {/* Animated connector segment to next node */}
            {!isLast && (
              <div style={{ display: "flex", gap: 10 }}>
                <div
                  style={{
                    width: 14,
                    display: "flex",
                    justifyContent: "center",
                    flexShrink: 0
                  }}
                >
                  <div
                    style={{
                      width: 1,
                      height: gap,
                      background: segFilled ? lineFilled : lineEmpty,
                      transition: "background 0.35s ease"
                    }}
                  />
                </div>
              </div>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

/* ── Mobile step accordion ──────────────────────────────────────────────────── */
function MobileStepAccordion({
  phase,
  currentQ,
  qDone,
  shareDone,
  bookDone,
  dark,
  sidebarBg,
  sidebarBdr,
  mutedCol,
  onSelectQuestion,
  onNavigate,
  isSubmitted,
  recordingUrl
}) {
  const [expanded, setExpanded] = useState(false);

  const stepMap = {
    questions: { num: 1, label: "Let's get to know you" },
    share: { num: 1, label: "Let's get to know you" },
    booking: { num: 2, label: "Meet your reviewer" },
    done: { num: 2, label: "Meet your reviewer" },
    recording: { num: 3, label: "Session recording" },
    report: { num: recordingUrl ? 4 : 3, label: "View report" }
  };
  const current = stepMap[phase] || { num: 1, label: "Let's get to know you" };

  // sidebar is always dark (#060c17)
  const activeBg = "#2563eb";
  const doneBg = "rgba(255,255,255,0.28)";
  const emptyBorder = "rgba(255,255,255,0.1)";
  const textActive = "#e2e8ff";
  const textDone = "rgba(255,255,255,0.5)";
  const textInactive = "rgba(255,255,255,0.2)";
  const itemActive = "#93c5fd";
  const itemDone = "rgba(255,255,255,0.42)";
  const itemInactive = "rgba(255,255,255,0.15)";

  const sections = [
    {
      label: "Let's get to know you",
      secActive: phase === "questions" || phase === "share",
      secDone: phase !== "questions" && phase !== "share",
      items: [
        ...QUESTIONS.map((q, i) => ({
          label: q.short,
          done: i < qDone,
          active: phase === "questions" && i === currentQ,
          questionIndex: i
        })),
        {
          label: "Upload resume & portfolio",
          done: shareDone,
          active: phase === "share"
        }
      ]
    },
    {
      label: "Meet your reviewer",
      secActive: phase === "booking" || phase === "done",
      secDone: bookDone,
      items: [
        { label: "Book a call", done: bookDone, active: phase === "booking" },
        {
          label: "Meet your reviewer",
          done: phase === "report",
          active: phase === "done"
        }
      ]
    },
    ...(recordingUrl ? [{
      label: "Session recording",
      secActive: phase === "recording",
      secDone: phase === "report",
      items: [{ label: "Watch your session", done: phase === "report", active: phase === "recording", navigateTo: "recording" }]
    }] : []),
    {
      label: "View report",
      secActive: phase === "report",
      secDone: false,
      items: [{ label: "Check out your report!", done: false, active: phase === "report", navigateTo: "report" }]
    }
  ];

  return (
    <div
      className="md:hidden border-b"
      style={{ borderColor: sidebarBdr, background: sidebarBg }}
    >
      <button
        className="w-full flex items-center justify-between px-5 py-3.5 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="text-xs font-semibold" style={{ color: mutedCol }}>
          Step {current.num} of 3 · {current.label}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          style={{
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
            color: mutedCol,
            flexShrink: 0
          }}
        >
          <path
            d="M2.5 5L7 9.5L11.5 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {expanded && (
        <div className="px-5 pb-5 pt-1">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-4"
            style={{ color: mutedCol }}
          >
            Steps for portfolio review
          </p>
          {sections.map((sec, si) => (
            <div key={si} className="mb-4">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full border-2 shrink-0"
                  style={{
                    background:
                      sec.secActive || sec.secDone
                        ? sec.secActive
                          ? activeBg
                          : doneBg
                        : "transparent",
                    borderColor:
                      sec.secActive || sec.secDone
                        ? sec.secActive
                          ? activeBg
                          : doneBg
                        : emptyBorder
                  }}
                />
                <span
                  className="text-[12.5px] font-semibold"
                  style={{
                    color: sec.secActive
                      ? textActive
                      : sec.secDone
                        ? textDone
                        : textInactive
                  }}
                >
                  {sec.label}
                </span>
              </div>
              {sec.items.map((item, ii) => {
                const canNavQ =
                  item.questionIndex !== undefined &&
                  (isSubmitted || (item.done && !item.active && (phase === "questions" || phase === "share")));
                const canNavPhase =
                  item.navigateTo &&
                  item.navigateTo !== phase &&
                  (item.navigateTo === "recording" ? !!recordingUrl : true) &&
                  (phase === "recording" || phase === "report");
                const canNav = canNavQ || canNavPhase;
                return (
                  <div
                    key={ii}
                    className="flex items-start gap-2.5 pl-5 py-0.5 rounded-md"
                    style={{
                      cursor: canNav ? "pointer" : "default",
                      padding: "3px 4px 3px 20px"
                    }}
                    onClick={() => {
                      if (!canNav) return;
                      if (canNavQ) { onSelectQuestion?.(item.questionIndex); setExpanded(false); }
                      else if (canNavPhase) { onNavigate?.(item.navigateTo); setExpanded(false); }
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full border shrink-0 mt-1"
                      style={{
                        background:
                          item.active || item.done
                            ? item.active
                              ? activeBg
                              : doneBg
                            : "transparent",
                        borderColor:
                          item.active || item.done
                            ? item.active
                              ? activeBg
                              : doneBg
                            : emptyBorder
                      }}
                    />
                    <span
                      className="text-[11.5px] leading-relaxed"
                      style={{
                        color: item.active
                          ? itemActive
                          : item.done
                            ? itemDone
                            : itemInactive,
                        textDecoration: canNav ? "underline" : "none",
                        textDecorationColor: "rgba(147,197,253,0.3)"
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────────────── */
export default function AnantPortfolioReview({ session, studentData }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { dark, toggleDark } = useAnantTheme();

  const [phase, setPhase] = useState("init");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({ q1: "", q2: "", q3: "", q4: "" });
  const [portfolioLink, setPortfolioLink] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUrl, setResumeUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [reviewId, setReviewId] = useState(null);
  const [reportUrl, setReportUrl] = useState(null);
  const [recordingUrl, setRecordingUrl] = useState(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  // Resume: "upload" (file) | "link" (URL)
  const [resumeMode, setResumeMode] = useState("upload");
  const [resumeLink, setResumeLink] = useState("");
  // Portfolio: "link" (URL) | "upload" (file)
  const [portfolioMode, setPortfolioMode] = useState("link");
  const [portfolioFileUrl, setPortfolioFileUrl] = useState("");
  const [portfolioFile, setPortfolioFile] = useState(null);
  const [portfolioUploading, setPortfolioUploading] = useState(false);
  const [portfolioDragOver, setPortfolioDragOver] = useState(false);
  // Post-submission: view submitted answers read-only
  const [viewAnswers, setViewAnswers] = useState(false);
  const savedPhaseRef = useRef(null);

  const fileRef = useRef();
  const portfolioFileRef = useRef();
  const calendlyLoaded = useRef(false);
  const feedbackTimer = useRef(null);
  const menuRef = useRef(null);
  const [showMenu, setShowMenu] = useState(false);

  const user = session?.user;
  const email = user?.email?.toLowerCase();
  const studentName = studentData
    ? `${studentData.first_name} ${studentData.last_name}`
    : email?.split("@")[0] || "";
  const studentInitial = studentName.charAt(0).toUpperCase();

  // ── Theme tokens ────────────────────────────────────────────────────────────
  const bg = dark ? "#060c17" : "#ffffff";
  const sidebarBg = "#060c17";
  const sidebarBdr = "#0d1f3c";
  const border = dark ? "#0d1f3c" : "#cbd5e1";
  const textCol = dark ? "#f0f4ff" : "#0f172a";
  const subCol = dark ? "rgba(255,255,255,0.65)" : "#1e293b";
  const mutedCol = dark ? "rgba(255,255,255,0.32)" : "#64748b";
  const cardBg = dark ? "#071022" : "#f1f5f9";
  const inputBg = dark ? "#050e1e" : "#ffffff";
  const inputBorder = dark ? "#1e3a5f" : "#cbd5e1";
  const btnBg = dark ? "#f0f4ff" : "#0f172a";
  const btnText = dark ? "#0f172a" : "#ffffff";

  // ── Load existing review ────────────────────────────────────────────────────
  useEffect(() => {
    if (!email) return;
    supabase
      .from("portfolio_reviews")
      .select("*")
      .eq("email", email)
      .eq("tenant_id", "anant")
      .maybeSingle()
      .then(({ data }) => {
        if (!data) {
          setPhase("questions");
          return;
        }
        setReviewId(data.id);
        const parts = (data.notes || "").split("\n\n---q4---\n");
        setAnswers({
          q1: parts[0] || "",
          q2: data.target_roles || "",
          q3: data.proud_project || "",
          q4: parts[1] || ""
        });
        // Portfolio: stored in portfolio_link
        setPortfolioLink(data.portfolio_link || "");
        // Resume: stored in portfolio_file_url — detect if it's a file upload or a pasted link
        const storedResume = data.portfolio_file_url || "";
        if (storedResume) {
          if (storedResume.includes("supabase") || storedResume.includes("/storage/")) {
            setResumeUrl(storedResume);
            setResumeMode("upload");
          } else {
            setResumeLink(storedResume);
            setResumeMode("link");
          }
        }
        if (data.feedback_rating) setFeedbackGiven(true);
        if (data.meet_recording_url) setRecordingUrl(data.meet_recording_url);

        if (data.review_report_url) {
          setReportUrl(data.review_report_url);
          // If recording exists, start there; otherwise go straight to report
          setPhase(data.meet_recording_url ? "recording" : "report");
        } else if (
          data.review_status === "done" ||
          data.review_status === "in_review"
        ) {
          setPhase("done");
        } else if (data.review_status === "pending") {
          setPhase("booking");
        } else if (data.review_status === "draft") {
          const loaded = {
            q1: parts[0] || "",
            q2: data.target_roles || "",
            q3: data.proud_project || "",
            q4: parts[1] || ""
          };
          const allAnswered = QUESTIONS.every((q) => loaded[q.key].trim());
          if (allAnswered) {
            setPhase("share");
          } else {
            const firstEmpty = QUESTIONS.findIndex((q) => !loaded[q.key].trim());
            setCurrentQ(firstEmpty >= 0 ? firstEmpty : 0);
            setPhase("questions");
          }
        } else {
          setPhase("share");
        }

        // If navigated from profile "view form" button, open read-only view
        if (location.state?.viewAnswers) {
          setViewAnswers(true);
          setCurrentQ(0);
        }
      });
  }, [email]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto feedback modal ──────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "report" || feedbackGiven) return;
    feedbackTimer.current = setTimeout(() => setFeedbackOpen(true), 90000);
    return () => clearTimeout(feedbackTimer.current);
  }, [phase, feedbackGiven]);

  // ── Calendly postMessage ─────────────────────────────────────────────────────
  useEffect(() => {
    const onMsg = async (e) => {
      if (e.data?.event !== "calendly.event_scheduled") return;
      if (reviewId) {
        await supabaseAdmin
          .from("portfolio_reviews")
          .update({ review_status: "in_review" })
          .eq("id", reviewId);
      }
      setPhase("done");
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [reviewId]);

  // ── Load Calendly embed script once ─────────────────────────────────────────
  useEffect(() => {
    if (phase !== "booking" || calendlyLoaded.current) return;
    if (!document.getElementById("calendly-script")) {
      const s = document.createElement("script");
      s.id = "calendly-script";
      s.src = "https://assets.calendly.com/assets/external/widget.js";
      s.async = true;
      document.head.appendChild(s);
    }
    calendlyLoaded.current = true;
  }, [phase]);

  // ── Profile menu click-outside ───────────────────────────────────────────────
  useEffect(() => {
    if (!showMenu) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/");
  }

  // ── DB helpers ───────────────────────────────────────────────────────────────
  async function persist(status) {
    const notesVal = answers.q4
      ? `${answers.q1}\n\n---q4---\n${answers.q4}`
      : answers.q1;
    // Resolve active resume and portfolio values based on selected mode
    const activeResumeVal = resumeMode === "upload" ? resumeUrl : resumeLink.trim();
    const activePortfolioVal = portfolioMode === "link" ? portfolioLink.trim() : portfolioFileUrl;
    const payload = {
      email,
      name: studentName,
      tenant_id: "anant",
      user_id: null,
      notes: notesVal || null,
      target_roles: answers.q2 || null,
      proud_project: answers.q3 || null,
      portfolio_link: activePortfolioVal || null,
      portfolio_file_url: activeResumeVal || null,
      review_status: status,
      course: studentData?.program || null,
      batch: studentData?.year ? String(studentData.year) : null
    };
    if (reviewId) {
      const { error } = await supabaseAdmin
        .from("portfolio_reviews")
        .update(payload)
        .eq("id", reviewId);
      return error;
    }
    const { data, error } = await supabaseAdmin
      .from("portfolio_reviews")
      .insert(payload)
      .select("id")
      .single();
    if (data?.id) setReviewId(data.id);
    return error;
  }

  async function nextQ() {
    setSaving(true);
    const err = await persist("draft");
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ((q) => q + 1);
    } else {
      setPhase("share");
    }
  }

  async function handleBackQ() {
    if (currentQ === 0) return;
    setSaving(true);
    await persist("draft");
    setSaving(false);
    setCurrentQ((q) => q - 1);
  }

  async function handleSaveEdit() {
    setSaving(true);
    await persist("draft");
    setSaving(false);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  }

  function goBackToQuestions() {
    setPhase("questions");
    setCurrentQ(QUESTIONS.length - 1);
  }

  async function skipQ4() {
    setSaving(true);
    await persist("draft");
    setSaving(false);
    setPhase("share");
  }

  async function handleResumeFile(file) {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File must be under 5MB.");
      return;
    }
    setError("");
    setUploading(true);
    setResumeFile(file);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `resumes/${user.id}/${Date.now()}_${safeName}`;
    const { error: upErr } = await supabaseAdmin.storage
      .from("review-reports")
      .upload(path, file, { upsert: true, contentType: "application/pdf" });
    if (upErr) {
      setUploading(false);
      setResumeFile(null);
      setError(upErr.message);
      return;
    }
    const { data: urlData } = supabaseAdmin.storage
      .from("review-reports")
      .getPublicUrl(path);
    setResumeUrl(urlData?.publicUrl || "");
    setUploading(false);
  }

  async function handlePortfolioFile(file) {
    if (!file) return;
    if (file.type !== "application/pdf") { setError("Please upload a PDF file."); return; }
    if (file.size > 20 * 1024 * 1024) { setError("File must be under 20MB."); return; }
    setError("");
    setPortfolioUploading(true);
    setPortfolioFile(file);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `portfolios/${user.id}/${Date.now()}_${safeName}`;
    const { error: upErr } = await supabaseAdmin.storage
      .from("review-reports")
      .upload(path, file, { upsert: true, contentType: "application/pdf" });
    if (upErr) { setPortfolioUploading(false); setPortfolioFile(null); setError(upErr.message); return; }
    const { data: urlData } = supabaseAdmin.storage.from("review-reports").getPublicUrl(path);
    setPortfolioFileUrl(urlData?.publicUrl || "");
    setPortfolioUploading(false);
  }

  async function handleSaveForLater() {
    setSaving(true);
    await persist("draft");
    setSaving(false);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  }

  async function handleSubmit() {
    const hasResume = resumeMode === "upload" ? !!resumeUrl : !!resumeLink.trim();
    const hasPortfolio = portfolioMode === "link" ? !!portfolioLink.trim() : !!portfolioFileUrl;
    if (!hasResume || !hasPortfolio) return;
    setSubmitting(true);
    setError("");
    const err = await persist("pending");
    setSubmitting(false);
    if (err) { setError(err.message); return; }
    sendSubmissionConfirmation(email, studentName, CALENDLY_URL).catch(() => {});
    setPhase("booking");
  }

  // ── Sidebar / progress state ─────────────────────────────────────────────────
  const isSubmitted = ["booking", "done", "recording", "report"].includes(phase);

  function handleSelectQuestion(idx) {
    setCurrentQ(idx);
    if (isSubmitted) {
      savedPhaseRef.current = phase;
      setViewAnswers(true);
    } else {
      setPhase("questions");
    }
  }

  function handleNavigatePhase(p) {
    setViewAnswers(false);
    setPhase(p);
  }

  const maxReachedQ = QUESTIONS.reduce(
    (max, q, i) => (answers[q.key]?.trim() ? i : max),
    -1
  );
  const qDone = (phase !== "questions" || isSubmitted) ? QUESTIONS.length : maxReachedQ + 1;
  const shareDone = ["booking", "done", "recording", "report"].includes(phase);
  const bookDone = ["done", "recording", "report"].includes(phase);

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (phase === "init") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: bg }}
      >
        <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        background: bg
      }}
    >
      {/* Feedback modal */}
      {feedbackOpen && reviewId && (
        <FeedbackModal
          dark={dark}
          reviewId={reviewId}
          onClose={() => {
            setFeedbackOpen(false);
            setFeedbackGiven(true);
          }}
        />
      )}

      {/* ── NAV ── */}
      <header
        className="shrink-0 flex items-center justify-between px-5 md:px-8 border-b"
        style={{ height: 64, background: "#060c17", borderColor: "#0d1f3c" }}
      >
        <button onClick={() => navigate("/")} className="focus:outline-none">
          <img
            src={anant_logo}
            alt="Anant National University"
            className="h-10 w-auto object-contain"
          />
        </button>

        <div className="flex items-center gap-3">
          <span
            className="text-xs hidden md:block"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            powered by evolve
          </span>

          {/* Theme toggle */}
          <button
            onClick={toggleDark}
            className="w-8 h-8 rounded-full flex items-center justify-center border"
            style={{ borderColor: "#0d1f3c", backgroundColor: "#0a1628" }}
            aria-label="toggle theme"
          >
            {dark ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="4"
                  stroke="#93c5fd"
                  strokeWidth="1.8"
                />
                <path
                  d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                  stroke="#93c5fd"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"
                  stroke="#93c5fd"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>

          {/* Home icon */}
          <button
            onClick={() => navigate("/")}
            className="w-8 h-8 rounded-full flex items-center justify-center border"
            style={{ borderColor: "#0d1f3c", backgroundColor: "#0a1628" }}
            aria-label="Go to home"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9.5z"
                stroke="#93c5fd"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 21V13h6v8"
                stroke="#93c5fd"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Avatar + name — clickable dropdown, matches home page */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu((v) => !v)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border"
              style={{
                borderColor: "#1e3a8a",
                background: showMenu ? "rgba(37,99,235,0.15)" : "transparent"
              }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: "#1e3a8a", color: "#93c5fd" }}
              >
                {studentInitial}
              </div>
              <span
                className="text-sm font-semibold hidden md:block"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                {studentName}
              </span>
            </button>
            {showMenu && (
              <div
                className="absolute right-0 mt-2 w-48 rounded-2xl border shadow-2xl overflow-hidden z-50"
                style={{ background: "#071022", borderColor: "#0d1f3c" }}
              >
                <div className="p-2 flex flex-col gap-0.5">
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold hover:bg-white/5"
                    style={{ color: "#93c5fd" }}
                  >
                    my profile
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-red-500/10"
                    style={{ color: "#f87171" }}
                  >
                    sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── MOBILE step accordion ── */}
      <MobileStepAccordion
        phase={phase}
        currentQ={currentQ}
        qDone={qDone}
        shareDone={shareDone}
        bookDone={bookDone}
        dark={dark}
        sidebarBg={sidebarBg}
        sidebarBdr={sidebarBdr}
        mutedCol="rgba(255,255,255,0.32)"
        onSelectQuestion={handleSelectQuestion}
        onNavigate={handleNavigatePhase}
        isSubmitted={isSubmitted}
        recordingUrl={recordingUrl}
      />

      {/* ── BODY ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── SIDEBAR desktop only ── */}
        <aside
          className="hidden md:flex w-80 shrink-0 flex-col border-r overflow-y-auto"
          style={{
            borderColor: sidebarBdr,
            background: sidebarBg,
            paddingTop: 36,
            paddingBottom: 36
          }}
        >
          <p
            className="px-7 mb-7"
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.28)"
            }}
          >
            steps for portfolio review
          </p>
          <ProgressSidebar
            phase={phase}
            currentQ={currentQ}
            qDone={qDone}
            shareDone={shareDone}
            bookDone={bookDone}
            dark={dark}
            onSelectQuestion={handleSelectQuestion}
            onNavigate={handleNavigatePhase}
            isSubmitted={isSubmitted}
            recordingUrl={recordingUrl}
          />
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main
          className={`flex-1 overflow-y-auto flex flex-col ${(phase === "report" || phase === "recording") && !viewAnswers ? "" : "items-center justify-center px-5 md:px-14 py-10 md:py-16"}`}
          style={{ background: bg }}
        >
          {/* ── VIEW ANSWERS (read-only, post-submission) ── */}
          {viewAnswers && (() => {
            const q = QUESTIONS[currentQ];
            return (
              <div className="w-full max-w-xl">
                <div className="mb-5 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setViewAnswers(false);
                      if (savedPhaseRef.current) setPhase(savedPhaseRef.current);
                    }}
                    className="text-sm font-semibold flex items-center gap-1.5"
                    style={{ color: mutedCol }}
                  >
                    ← back
                  </button>
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: mutedCol }}>
                    viewing submitted answers
                  </span>
                </div>
                <div className="mb-4 flex gap-2 flex-wrap">
                  {QUESTIONS.map((qItem, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentQ(i)}
                      className="text-xs px-3 py-1.5 rounded-lg font-semibold border transition-colors"
                      style={{
                        borderColor: i === currentQ ? "#2563eb" : inputBorder,
                        background: i === currentQ ? "rgba(37,99,235,0.1)" : inputBg,
                        color: i === currentQ ? "#2563eb" : mutedCol
                      }}
                    >
                      Q{i + 1}
                    </button>
                  ))}
                </div>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: mutedCol }}>
                  {q.question}
                </p>
                <div
                  className="w-full rounded-xl border px-4 py-4 text-sm leading-relaxed whitespace-pre-wrap min-h-[140px]"
                  style={{ borderColor: inputBorder, background: inputBg, color: answers[q.key] ? textCol : mutedCol, fontFamily: "inherit" }}
                >
                  {answers[q.key] || "No answer provided."}
                </div>
              </div>
            );
          })()}

          {/* ── QUESTIONS ── */}
          {!viewAnswers && phase === "questions" &&
            (() => {
              const q = QUESTIONS[currentQ];
              return (
                <div className="w-full max-w-xl">
                  {/* YOUR PORTFOLIO REVIEW header — uses question heading style */}
                  <div className="mb-6">
                    <h1
                      style={{
                        fontSize: "clamp(20px, 3.2vw, 26px)",
                        fontWeight: 800,
                        color: textCol,
                        lineHeight: 1.3,
                        letterSpacing: "-0.02em",
                        marginBottom: 8
                      }}
                    >
                      Your portfolio review
                    </h1>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: mutedCol }}
                    >
                      Follow the steps to complete your review, from sharing a
                      bit about yourself through to getting your final report.
                    </p>
                    <hr className="mt-4" style={{ borderColor: border }} />
                  </div>

                  {/* Section label + counter */}
                  <p
                    className="mb-5"
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: mutedCol
                    }}
                  >
                    let's get to know you <span>({currentQ + 1}/4)</span>
                    {currentQ === QUESTIONS.length - 1 && (
                      <span
                        className="ml-2 normal-case font-normal"
                        style={{ color: mutedCol, opacity: 0.7 }}
                      >
                        · optional
                      </span>
                    )}
                  </p>

                  <h2
                    className="font-bold mb-6"
                    style={{
                      fontSize: "clamp(20px, 3.2vw, 26px)",
                      color: textCol,
                      lineHeight: 1.3
                    }}
                  >
                    {q.question}
                  </h2>

                  <textarea
                    key={q.key}
                    value={answers[q.key]}
                    onChange={(e) =>
                      setAnswers((a) => ({ ...a, [q.key]: e.target.value }))
                    }
                    placeholder={q.placeholder}
                    rows={7}
                    autoFocus
                    className="w-full rounded-xl border px-4 py-4 resize-none outline-none"
                    style={{
                      borderColor: inputBorder,
                      color: textCol,
                      background: inputBg,
                      lineHeight: 1.7,
                      fontFamily: "inherit",
                      fontSize: 15
                    }}
                  />

                  {error && (
                    <p className="mt-2 text-sm" style={{ color: "#f87171" }}>
                      {error}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-5">
                    {currentQ > 0 && (
                      <button
                        onClick={handleBackQ}
                        disabled={saving}
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold border disabled:opacity-40"
                        style={{
                          borderColor: inputBorder,
                          background: inputBg,
                          color: textCol
                        }}
                      >
                        ← back
                      </button>
                    )}
                    {currentQ < maxReachedQ && (
                      <button
                        onClick={handleSaveEdit}
                        disabled={saving}
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold border disabled:opacity-40"
                        style={{
                          borderColor: inputBorder,
                          background: inputBg,
                          color: mutedCol
                        }}
                      >
                        {savedMsg ? "saved ✓" : saving ? "saving…" : "save"}
                      </button>
                    )}
                    {currentQ === QUESTIONS.length - 1 && (
                      <button
                        onClick={skipQ4}
                        disabled={saving}
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold border disabled:opacity-40"
                        style={{
                          borderColor: inputBorder,
                          background: inputBg,
                          color: mutedCol
                        }}
                      >
                        skip
                      </button>
                    )}
                    <button
                      onClick={nextQ}
                      disabled={!answers[q.key].trim() || saving}
                      className="px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-35"
                      style={{ background: btnBg, color: btnText }}
                    >
                      {saving && currentQ >= maxReachedQ ? "saving…" : "next →"}
                    </button>
                  </div>
                </div>
              );
            })()}

          {/* ── SHARE ── */}
          {!viewAnswers && phase === "share" && (() => {
            const hasResume = resumeMode === "upload" ? !!resumeUrl : !!resumeLink.trim();
            const hasPortfolio = portfolioMode === "link" ? !!portfolioLink.trim() : !!portfolioFileUrl;
            const tabStyle = (active) => ({
              padding: "6px 14px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              border: `1px solid ${active ? "#2563eb" : inputBorder}`,
              background: active ? "rgba(37,99,235,0.1)" : inputBg,
              color: active ? "#2563eb" : mutedCol
            });
            return (
              <div className="w-full max-w-md">
                <button onClick={goBackToQuestions} className="text-sm font-semibold mb-6 flex items-center gap-1" style={{ color: mutedCol }}>
                  ← back to questions
                </button>
                <h2 className="font-bold mb-2" style={{ fontSize: "clamp(22px, 4vw, 30px)", color: textCol }}>
                  Share your resume and portfolio
                </h2>
                <p className="text-sm mb-8" style={{ color: subCol }}>
                  Make sure any links you share are accessible to anyone who has them.
                </p>

                {/* ── Resume field ── */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold" style={{ color: subCol }}>Resume</label>
                    <div className="flex gap-1.5">
                      <button style={tabStyle(resumeMode === "upload")} onClick={() => setResumeMode("upload")}>upload file</button>
                      <button style={tabStyle(resumeMode === "link")} onClick={() => setResumeMode("link")}>paste link</button>
                    </div>
                  </div>
                  {resumeMode === "upload" ? (
                    resumeUrl ? (
                      <div className="flex items-center gap-3 rounded-xl border px-4 py-3" style={{ borderColor: inputBorder, background: cardBg }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#ef4444" strokeWidth="1.8"/>
                          <polyline points="14 2 14 8 20 8" stroke="#ef4444" strokeWidth="1.8"/>
                        </svg>
                        <span className="text-sm flex-1 truncate" style={{ color: textCol }}>{resumeFile?.name || "resume.pdf"}</span>
                        <button onClick={() => { setResumeUrl(""); setResumeFile(null); }} className="text-xs" style={{ color: mutedCol }}>remove</button>
                      </div>
                    ) : (
                      <div
                        className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer"
                        style={{ borderColor: dragOver ? "#2563eb" : inputBorder, background: dragOver ? "rgba(37,99,235,0.05)" : cardBg, minHeight: 100, padding: "22px 16px" }}
                        onClick={() => fileRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleResumeFile(e.dataTransfer.files?.[0]); }}
                      >
                        {uploading ? <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" /> : <p className="text-sm text-center" style={{ color: mutedCol }}>Drag & drop PDF here, or click to browse</p>}
                      </div>
                    )
                  ) : (
                    <input
                      type="url"
                      value={resumeLink}
                      onChange={(e) => setResumeLink(e.target.value)}
                      placeholder="https://drive.google.com/... or any link to your resume"
                      className="w-full rounded-xl border px-4 py-3.5 outline-none"
                      style={{ borderColor: inputBorder, color: textCol, background: inputBg, fontFamily: "inherit", fontSize: 15 }}
                    />
                  )}
                  <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => handleResumeFile(e.target.files?.[0])} />
                </div>

                {/* ── Portfolio field ── */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold" style={{ color: subCol }}>Portfolio</label>
                    <div className="flex gap-1.5">
                      <button style={tabStyle(portfolioMode === "link")} onClick={() => setPortfolioMode("link")}>paste link</button>
                      <button style={tabStyle(portfolioMode === "upload")} onClick={() => setPortfolioMode("upload")}>upload file</button>
                    </div>
                  </div>
                  {portfolioMode === "link" ? (
                    <input
                      type="url"
                      value={portfolioLink}
                      onChange={(e) => setPortfolioLink(e.target.value)}
                      placeholder="https://your-portfolio-link.com"
                      className="w-full rounded-xl border px-4 py-3.5 outline-none"
                      style={{ borderColor: inputBorder, color: textCol, background: inputBg, fontFamily: "inherit", fontSize: 15 }}
                    />
                  ) : portfolioFileUrl ? (
                    <div className="flex items-center gap-3 rounded-xl border px-4 py-3" style={{ borderColor: inputBorder, background: cardBg }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#ef4444" strokeWidth="1.8"/>
                        <polyline points="14 2 14 8 20 8" stroke="#ef4444" strokeWidth="1.8"/>
                      </svg>
                      <span className="text-sm flex-1 truncate" style={{ color: textCol }}>{portfolioFile?.name || "portfolio.pdf"}</span>
                      <button onClick={() => { setPortfolioFileUrl(""); setPortfolioFile(null); }} className="text-xs" style={{ color: mutedCol }}>remove</button>
                    </div>
                  ) : (
                    <div
                      className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer"
                      style={{ borderColor: portfolioDragOver ? "#2563eb" : inputBorder, background: portfolioDragOver ? "rgba(37,99,235,0.05)" : cardBg, minHeight: 100, padding: "22px 16px" }}
                      onClick={() => portfolioFileRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setPortfolioDragOver(true); }}
                      onDragLeave={() => setPortfolioDragOver(false)}
                      onDrop={(e) => { e.preventDefault(); setPortfolioDragOver(false); handlePortfolioFile(e.dataTransfer.files?.[0]); }}
                    >
                      {portfolioUploading ? <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" /> : <p className="text-sm text-center" style={{ color: mutedCol }}>Drag & drop PDF here, or click to browse</p>}
                    </div>
                  )}
                  <input ref={portfolioFileRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => handlePortfolioFile(e.target.files?.[0])} />
                </div>

                {error && <p className="mb-3 text-sm" style={{ color: "#f87171" }}>{error}</p>}

                <button
                  onClick={handleSubmit}
                  disabled={!hasResume || !hasPortfolio || submitting}
                  className="w-full py-4 rounded-xl text-base font-bold transition-opacity disabled:opacity-35 mb-5"
                  style={{ background: btnBg, color: btnText }}
                >
                  {submitting ? "submitting…" : "submit"}
                </button>

                <p className="text-sm text-center" style={{ color: mutedCol }}>
                  {(!hasResume || !hasPortfolio) && "Add your resume and portfolio to submit. "}
                  <button onClick={handleSaveForLater} disabled={saving} className="underline underline-offset-2" style={{ color: subCol }}>
                    {savedMsg ? "saved ✓" : saving ? "saving…" : "save and come back later"}
                  </button>
                </p>
              </div>
            );
          })()}

          {/* ── BOOKING ── */}
          {!viewAnswers && phase === "booking" && (
            <div className="w-full max-w-2xl">
              <h2
                className="font-bold mb-2"
                style={{ fontSize: "clamp(22px, 4vw, 30px)", color: textCol }}
              >
                Book a call
              </h2>
              <p className="text-sm mb-6" style={{ color: subCol }}>
                Choose a slot that works best for you.
              </p>

              <div
                className="calendly-inline-widget rounded-xl border"
                data-url={`${CALENDLY_URL}?hide_landing_page_details=1&hide_gdpr_banner=1`}
                style={{ minWidth: 320, height: 700, borderColor: border }}
              />
            </div>
          )}

          {/* ── DONE ── */}
          {!viewAnswers && phase === "done" && (
            <div className="w-full max-w-lg text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{
                  background: dark
                    ? "rgba(129,140,248,0.12)"
                    : "rgba(51,65,85,0.07)"
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="4"
                    width="18"
                    height="18"
                    rx="2"
                    stroke={textCol}
                    strokeWidth="1.5"
                  />
                  <path d="M3 9h18" stroke={textCol} strokeWidth="1.5" />
                  <path
                    d="M8 2v4M16 2v4"
                    stroke={textCol}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M8 14l2.5 2.5L16 11"
                    stroke={textCol}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h2
                className="font-bold mb-2"
                style={{ fontSize: "clamp(26px, 5vw, 38px)", color: textCol }}
              >
                You're all set!
              </h2>
              <p className="text-sm mb-8" style={{ color: subCol }}>
                Your submission is confirmed. We'll review your portfolio and
                reach out with next steps.
              </p>

              <div
                className="rounded-xl border p-6 text-left mb-6"
                style={{ borderColor: border, background: cardBg }}
              >
                <p
                  className="text-sm font-bold mb-4"
                  style={{ color: textCol }}
                >
                  What to expect on your call
                </p>
                <ul className="space-y-2.5">
                  {[
                    "A 45-minute live session with one of our industry reviewers",
                    "They'll go through your resume and portfolio in detail",
                    "You'll get real-time suggestions on layout, content and presentation",
                    "Come prepared with questions about your career goals"
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-sm"
                      style={{ color: subCol }}
                    >
                      <span className="mt-0.5">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-xs mb-4" style={{ color: mutedCol }}>
                Reviewer: to be assigned — an industry professional from
                evolve's expert network.
              </p>
              <button
                className="text-xs underline underline-offset-2"
                style={{ color: mutedCol }}
                onClick={() => {
                  if (window.confirm("Go back to booking page?"))
                    setPhase("booking");
                }}
              >
                Need to reschedule?
              </button>
            </div>
          )}

          {/* ── RECORDING ── */}
          {!viewAnswers && phase === "recording" && recordingUrl && (() => {
            const embedUrl = driveEmbedUrl(recordingUrl);
            return (
              <div className="flex flex-col flex-1 min-h-0">
                <div
                  className="shrink-0 flex items-center justify-between px-5 md:px-8 py-4 border-b"
                  style={{ borderColor: border, background: dark ? "#060c17" : "#f8fafc" }}
                >
                  <div>
                    <h2 className="font-bold text-base" style={{ color: textCol }}>Your session recording</h2>
                    <p className="text-xs mt-0.5" style={{ color: mutedCol }}>Your 1:1 review session — watch it back anytime</p>
                  </div>
                  <button
                    onClick={() => setPhase("report")}
                    className="text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
                    style={{ background: "rgba(37,99,235,0.12)", color: "#60a5fa", border: "1px solid rgba(37,99,235,0.25)" }}
                  >
                    view report →
                  </button>
                </div>
                <div className="flex-1 min-h-0 relative">
                  <iframe
                    src={embedUrl}
                    title="Session recording"
                    allow="autoplay"
                    className="absolute inset-0 w-full h-full"
                    style={{ border: "none" }}
                  />
                </div>
              </div>
            );
          })()}

          {/* ── REPORT ── */}
          {!viewAnswers && phase === "report" && (() => {
            return (
              <div className="flex flex-col flex-1 min-h-0">
                {/* header strip with back-to-recording button if recording exists */}
                {recordingUrl && (
                  <div
                    className="shrink-0 flex items-center justify-between px-5 md:px-8 py-3 border-b"
                    style={{ borderColor: border, background: dark ? "#060c17" : "#f8fafc" }}
                  >
                    <button
                      onClick={() => setPhase("recording")}
                      className="text-xs font-semibold flex items-center gap-1.5"
                      style={{ color: mutedCol }}
                    >
                      ← session recording
                    </button>
                    <a
                      href={reportUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                      style={{ background: "rgba(37,99,235,0.1)", color: "#60a5fa", border: "1px solid rgba(37,99,235,0.2)" }}
                    >
                      open in new tab ↗
                    </a>
                  </div>
                )}
                {/* Mobile: show a button to open PDF in new tab + fallback iframe */}
                <div className="flex-1 min-h-0 relative">
                  {/* Visible on mobile as fallback */}
                  <div className="md:hidden flex flex-col items-center justify-center h-full gap-5 px-6 text-center" style={{ minHeight: 300 }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={mutedCol} strokeWidth="1.5"/>
                      <polyline points="14 2 14 8 20 8" stroke={mutedCol} strokeWidth="1.5"/>
                      <path d="M9 13h6M9 17h4" stroke={mutedCol} strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <div>
                      <p className="font-bold text-base mb-1" style={{ color: textCol }}>Your report is ready</p>
                      <p className="text-sm" style={{ color: mutedCol }}>Tap below to open your portfolio review report.</p>
                    </div>
                    <a
                      href={reportUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-6 py-3 rounded-xl font-bold text-sm"
                      style={{ background: btnBg, color: btnText }}
                    >
                      open report →
                    </a>
                    {!feedbackGiven && (
                      <button onClick={() => setFeedbackOpen(true)} className="text-xs underline underline-offset-2" style={{ color: mutedCol }}>
                        share feedback
                      </button>
                    )}
                  </div>
                  {/* Desktop: iframe */}
                  <iframe
                    src={reportUrl}
                    title="Your portfolio review report"
                    className="hidden md:block absolute inset-0 w-full h-full"
                    style={{ border: "none" }}
                  />
                </div>
              </div>
            );
          })()}
        </main>
      </div>
    </div>
  );
}
