import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { supabaseAdmin } from "../../supabaseAdminClient";
import { anant_logo } from "../../assets/images/Community";
import { useAnantTheme } from "../../context/AnantThemeContext";

const CALENDLY_URL = import.meta.env.VITE_CALENDLY_URL || "";

const QUESTIONS = [
  {
    key: "q1",
    question: "The hardest part about putting your portfolio together?",
    placeholder: "ex. deciding which projects to include, writing case studies, structuring it, design and layout.",
    short: "The hardest part about putting..."
  },
  {
    key: "q2",
    question: "What kind of work are you hoping to land?",
    placeholder: "ex. UX design roles at product companies, graphic design internships, architectural projects...",
    short: "What kind of work are you hoping..."
  },
  {
    key: "q3",
    question: "Is there anything specific you'd like us to review closely?",
    placeholder: "ex. case study structure, visual consistency, overall first impression, a specific project...",
    short: "Is there anything specific you'd like us..."
  },
  {
    key: "q4",
    question: "Anything else you're finding difficult that we should know about?",
    placeholder: "ex. I'm not sure how to present a particular project, or I struggle with writing about my design process...",
    short: "Anything else you're finding difficult..."
  }
];

const PHASES = ["questions", "share", "booking", "done", "report"];
const PHASE_LABELS = {
  questions: "Questions",
  share: "Share",
  booking: "Book call",
  done: "All set",
  report: "Report"
};

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
                  style={{ color: star <= (hovered || rating) ? "#f59e0b" : (dark ? "#334155" : "#d1d5db") }}
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
                style={{ background: dark ? "#e2e8f0" : "#0f172a", color: dark ? "#0f172a" : "#fff" }}
              >
                {submitting ? "submitting…" : "Submit feedback"}
              </button>
              <button onClick={onClose} className="text-sm" style={{ color: subCol }}>
                Skip
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Sidebar section + item ─────────────────────────────────────────────────── */
function SideSection({ label, active, done: sectionDone, children, dark }) {
  const col = active
    ? (dark ? "#e2e8ff" : "#0f172a")
    : sectionDone
    ? (dark ? "rgba(255,255,255,0.42)" : "#64748b")
    : (dark ? "rgba(255,255,255,0.22)" : "#94a3b8");
  return (
    <div className="mb-6">
      <p className="px-7 mb-2" style={{ fontSize: 12.5, color: col, fontWeight: active ? 700 : 400 }}>
        {label}
      </p>
      {children}
    </div>
  );
}

function SideItem({ label, done, active, dark }) {
  const col = active
    ? (dark ? "#c7d2fe" : "#1e293b")
    : done
    ? (dark ? "rgba(255,255,255,0.42)" : "#64748b")
    : (dark ? "rgba(255,255,255,0.2)" : "#94a3b8");
  const dotBg = active
    ? (dark ? "#818cf8" : "#334155")
    : done
    ? (dark ? "rgba(255,255,255,0.38)" : "#94a3b8")
    : "transparent";
  return (
    <div className="flex items-start gap-3 px-7 py-1">
      {done || active ? (
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dotBg, marginTop: 6 }} />
      ) : (
        <span
          className="w-1.5 h-1.5 rounded-full border shrink-0"
          style={{ borderColor: dark ? "rgba(255,255,255,0.18)" : "#cbd5e1", marginTop: 6 }}
        />
      )}
      <span style={{ fontSize: 12.5, lineHeight: 1.5, color: col }}>{label}</span>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────────────── */
export default function AnantPortfolioReview({ session, studentData }) {
  const navigate = useNavigate();
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
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  const fileRef = useRef();
  const calendlyLoaded = useRef(false);
  const feedbackTimer = useRef(null);

  const user = session?.user;
  const email = user?.email?.toLowerCase();
  const studentName = studentData
    ? `${studentData.first_name} ${studentData.last_name}`
    : email?.split("@")[0] || "";

  // ── Theme tokens ────────────────────────────────────────────────────────────
  const bg          = dark ? "#060c17" : "#ffffff";
  const sidebarBg   = dark ? "#040d1a" : "#dde3ea";
  const sidebarBdr  = dark ? "#0d1f3c" : "#b8c4d0";
  const border      = dark ? "#0d1f3c" : "#cbd5e1";
  const textCol     = dark ? "#f0f4ff" : "#0f172a";
  const subCol      = dark ? "rgba(255,255,255,0.65)" : "#1e293b";
  const mutedCol    = dark ? "rgba(255,255,255,0.32)" : "#64748b";
  const cardBg      = dark ? "#071022" : "#f1f5f9";
  const inputBg     = dark ? "#050e1e" : "#ffffff";
  const inputBorder = dark ? "#1e3a5f" : "#cbd5e1";
  const btnBg       = dark ? "#f0f4ff" : "#0f172a";
  const btnText     = dark ? "#0f172a" : "#ffffff";

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
        if (!data) { setPhase("questions"); return; }
        setReviewId(data.id);
        const parts = (data.notes || "").split("\n\n---q4---\n");
        setAnswers({
          q1: parts[0] || "",
          q2: data.target_roles || "",
          q3: data.proud_project || "",
          q4: parts[1] || ""
        });
        setPortfolioLink(data.portfolio_link || "");
        setResumeUrl(data.portfolio_file_url || "");
        if (data.feedback_rating) setFeedbackGiven(true);

        if (data.review_report_url) {
          setReportUrl(data.review_report_url);
          setPhase("report");
        } else if (data.review_status === "done" || data.review_status === "in_review") {
          setPhase("done");
        } else if (data.review_status === "pending") {
          setPhase("booking");
        } else {
          setPhase("share");
        }
      });
  }, [email]);

  // ── Auto feedback modal: 90s after entering report phase ────────────────────
  useEffect(() => {
    if (phase !== "report" || feedbackGiven) return;
    feedbackTimer.current = setTimeout(() => setFeedbackOpen(true), 90000);
    return () => clearTimeout(feedbackTimer.current);
  }, [phase, feedbackGiven]);

  // ── Calendly postMessage — works on ALL plans, no webhook needed ────────────
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

  // ── Load Calendly embed script ──────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "booking" || calendlyLoaded.current || !CALENDLY_URL) return;
    if (!document.getElementById("calendly-script")) {
      const s = document.createElement("script");
      s.id = "calendly-script";
      s.src = "https://assets.calendly.com/assets/external/widget.js";
      s.async = true;
      document.head.appendChild(s);
    }
    calendlyLoaded.current = true;
  }, [phase]);

  // ── DB helpers ──────────────────────────────────────────────────────────────
  async function persist(status) {
    const notesVal = answers.q4
      ? `${answers.q1}\n\n---q4---\n${answers.q4}`
      : answers.q1;
    const payload = {
      email,
      name: studentName,
      tenant_id: "anant",
      user_id: null,
      notes: notesVal || null,
      target_roles: answers.q2 || null,
      proud_project: answers.q3 || null,
      portfolio_link: portfolioLink || null,
      portfolio_file_url: resumeUrl || null,
      review_status: status,
      course: studentData?.program || null,
      batch: studentData?.year ? String(studentData.year) : null
    };
    if (reviewId) {
      const { error } = await supabaseAdmin
        .from("portfolio_reviews").update(payload).eq("id", reviewId);
      return error;
    }
    const { data, error } = await supabaseAdmin
      .from("portfolio_reviews").insert(payload).select("id").single();
    if (data?.id) setReviewId(data.id);
    return error;
  }

  async function nextQ() {
    if (currentQ < QUESTIONS.length - 1) { setCurrentQ((q) => q + 1); return; }
    setSaving(true);
    const err = await persist("draft");
    setSaving(false);
    if (err) { setError(err.message); return; }
    setPhase("share");
  }

  async function handleResumeFile(file) {
    if (!file) return;
    if (file.type !== "application/pdf") { setError("Please upload a PDF file."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("File must be under 5MB."); return; }
    setError(""); setUploading(true); setResumeFile(file);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `resumes/${user.id}/${Date.now()}_${safeName}`;
    const { error: upErr } = await supabaseAdmin.storage
      .from("review-reports").upload(path, file, { upsert: true, contentType: "application/pdf" });
    if (upErr) { setUploading(false); setResumeFile(null); setError(upErr.message); return; }
    const { data: urlData } = supabaseAdmin.storage.from("review-reports").getPublicUrl(path);
    setResumeUrl(urlData?.publicUrl || "");
    setUploading(false);
  }

  async function handleSaveForLater() {
    setSaving(true);
    await persist("draft");
    setSaving(false);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  }

  async function handleSubmit() {
    if (!resumeUrl || !portfolioLink.trim()) return;
    setSubmitting(true); setError("");
    const err = await persist("pending");
    setSubmitting(false);
    if (err) { setError(err.message); return; }
    setPhase("booking");
  }

  async function handleManualBooked() {
    if (reviewId) {
      await supabaseAdmin
        .from("portfolio_reviews").update({ review_status: "in_review" }).eq("id", reviewId);
    }
    setPhase("done");
  }

  // ── Sidebar / progress state ────────────────────────────────────────────────
  const qDone    = phase !== "questions" ? QUESTIONS.length : currentQ;
  const shareDone = ["booking", "done", "report"].includes(phase);
  const bookDone  = ["done", "report"].includes(phase);
  const phaseIdx  = PHASES.indexOf(phase === "init" ? "questions" : phase);

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (phase === "init") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: bg }}>
        <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: bg }}
    >
      {/* Feedback modal */}
      {feedbackOpen && reviewId && (
        <FeedbackModal
          dark={dark}
          reviewId={reviewId}
          onClose={() => { setFeedbackOpen(false); setFeedbackGiven(true); }}
        />
      )}

      {/* ── NAV — always dark, matching all Anant pages ── */}
      <header
        className="shrink-0 flex items-center justify-between px-5 md:px-8 border-b"
        style={{ height: 64, background: "#060c17", borderColor: "#0d1f3c" }}
      >
        <button onClick={() => navigate("/")} className="focus:outline-none">
          <img src={anant_logo} alt="Anant National University" className="h-10 w-auto object-contain" />
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs hidden md:block" style={{ color: "rgba(255,255,255,0.3)" }}>
            powered by evolve
          </span>
          <button
            onClick={toggleDark}
            className="w-8 h-8 rounded-full flex items-center justify-center border"
            style={{ borderColor: "#0d1f3c", backgroundColor: "#0a1628" }}
            aria-label="toggle theme"
          >
            {dark ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="4" stroke="#93c5fd" strokeWidth="1.8" />
                <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                  stroke="#93c5fd" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"
                  stroke="#93c5fd" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="text-xs px-3 py-1.5 rounded-lg border"
            style={{ borderColor: "#1e3a8a", color: "#60a5fa" }}
          >
            my profile
          </button>
        </div>
      </header>

      {/* ── MOBILE step progress ── */}
      <div
        className="md:hidden border-b px-5 py-3"
        style={{ borderColor: sidebarBdr, background: sidebarBg }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: mutedCol }}>
            {PHASE_LABELS[phase] || ""}
          </span>
          <span className="text-xs" style={{ color: mutedCol }}>
            {phaseIdx + 1} / {PHASES.length}
          </span>
        </div>
        <div className="flex gap-1.5">
          {PHASES.map((p, i) => (
            <div
              key={p}
              className="flex-1 h-1 rounded-full"
              style={{
                background: i <= phaseIdx
                  ? (dark ? "#818cf8" : "#334155")
                  : (dark ? "#1e3a5f" : "#cbd5e1")
              }}
            />
          ))}
        </div>
        {phase === "questions" && (
          <p className="mt-1.5 text-xs" style={{ color: mutedCol }}>
            Question {currentQ + 1} of {QUESTIONS.length}
          </p>
        )}
      </div>

      {/* ── BODY ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── SIDEBAR desktop only, wider at w-80 ── */}
        <aside
          className="hidden md:flex w-80 shrink-0 flex-col border-r overflow-y-auto"
          style={{ borderColor: sidebarBdr, background: sidebarBg, paddingTop: 36, paddingBottom: 36 }}
        >
          <p
            className="px-7 mb-7"
            style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: mutedCol }}
          >
            steps for portfolio review
          </p>

          <SideSection label="let's get to know you" active={phase === "questions"} done={phase !== "questions"} dark={dark}>
            {QUESTIONS.map((q, i) => (
              <SideItem key={q.key} label={q.short} done={i < qDone} active={phase === "questions" && i === currentQ} dark={dark} />
            ))}
          </SideSection>

          <SideSection label="share" active={phase === "share"} done={shareDone} dark={dark}>
            <SideItem label="upload your resume and portfolio with us" done={shareDone} active={phase === "share"} dark={dark} />
          </SideSection>

          <SideSection label="meet your reviewer" active={phase === "booking" || phase === "done"} done={bookDone} dark={dark}>
            <SideItem label="book a call" done={bookDone} active={phase === "booking"} dark={dark} />
            <SideItem label="meet your reviewer" done={phase === "report"} active={phase === "done"} dark={dark} />
          </SideSection>

          <SideSection label="view report" active={phase === "report"} done={false} dark={dark}>
            <SideItem label="check out your report!" done={false} active={phase === "report"} dark={dark} />
          </SideSection>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main
          className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-5 md:px-14 py-10 md:py-16"
          style={{ background: bg }}
        >

          {/* ── QUESTIONS ── */}
          {phase === "questions" && (() => {
            const q = QUESTIONS[currentQ];
            return (
              <div className="w-full max-w-xl">
                <p
                  className="mb-4 hidden md:block"
                  style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: mutedCol }}
                >
                  let's get to know you
                </p>
                <h2
                  className="font-bold mb-6"
                  style={{ fontSize: "clamp(22px, 3.5vw, 28px)", color: textCol, lineHeight: 1.3 }}
                >
                  {q.question}
                </h2>
                <div className="relative">
                  <textarea
                    key={q.key}
                    value={answers[q.key]}
                    onChange={(e) => setAnswers((a) => ({ ...a, [q.key]: e.target.value }))}
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
                    onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) nextQ(); }}
                  />
                  <button
                    onClick={nextQ}
                    disabled={!answers[q.key].trim() || saving}
                    className="absolute bottom-3.5 right-3.5 w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30"
                    style={{ background: dark ? "#1e3a5f" : "#e2e8f0" }}
                  >
                    {saving ? (
                      <div
                        className="w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin"
                        style={{ borderColor: dark ? "#93c5fd" : "#374151" }}
                      />
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6H9.5M6.5 3L9.5 6L6.5 9" stroke={dark ? "#93c5fd" : "#374151"}
                          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                </div>
                {error && <p className="mt-2 text-sm" style={{ color: "#f87171" }}>{error}</p>}
                <p className="mt-3 text-xs" style={{ color: mutedCol }}>Press ⌘ + Enter to continue</p>
              </div>
            );
          })()}

          {/* ── SHARE ── */}
          {phase === "share" && (
            <div className="w-full max-w-md">
              <h2
                className="font-bold mb-2"
                style={{ fontSize: "clamp(22px, 4vw, 30px)", color: textCol }}
              >
                Share your resume and portfolio
              </h2>
              <p className="text-sm mb-8" style={{ color: subCol }}>
                Make sure your portfolio link is accessible to anyone who has it.
              </p>

              <div className="mb-5">
                <label className="block text-sm font-semibold mb-2" style={{ color: subCol }}>
                  Upload resume (PDF, max 5MB)
                </label>
                {resumeUrl ? (
                  <div
                    className="flex items-center gap-3 rounded-xl border px-4 py-3"
                    style={{ borderColor: inputBorder, background: cardBg }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#ef4444" strokeWidth="1.8" />
                      <polyline points="14 2 14 8 20 8" stroke="#ef4444" strokeWidth="1.8" />
                    </svg>
                    <span className="text-sm flex-1 truncate" style={{ color: textCol }}>
                      {resumeFile?.name || "resume.pdf"}
                    </span>
                    <button
                      onClick={() => { setResumeUrl(""); setResumeFile(null); }}
                      className="text-xs"
                      style={{ color: mutedCol }}
                    >
                      remove
                    </button>
                  </div>
                ) : (
                  <div
                    className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer"
                    style={{
                      borderColor: dragOver ? "#2563eb" : inputBorder,
                      background: dragOver ? "rgba(37,99,235,0.05)" : cardBg,
                      minHeight: 100,
                      padding: "22px 16px"
                    }}
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault(); setDragOver(false);
                      handleResumeFile(e.dataTransfer.files?.[0]);
                    }}
                  >
                    {uploading ? (
                      <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <p className="text-sm text-center" style={{ color: mutedCol }}>
                        Drag & drop file here, or click to browse
                      </p>
                    )}
                  </div>
                )}
                <input ref={fileRef} type="file" accept="application/pdf" className="hidden"
                  onChange={(e) => handleResumeFile(e.target.files?.[0])} />
              </div>

              <div className="mb-8">
                <label className="block text-sm font-semibold mb-2" style={{ color: subCol }}>
                  Portfolio link
                </label>
                <input
                  type="url"
                  value={portfolioLink}
                  onChange={(e) => setPortfolioLink(e.target.value)}
                  placeholder="https://your-portfolio-link.com"
                  className="w-full rounded-xl border px-4 py-3.5 outline-none"
                  style={{ borderColor: inputBorder, color: textCol, background: inputBg, fontFamily: "inherit", fontSize: 15 }}
                />
              </div>

              {error && <p className="mb-3 text-sm" style={{ color: "#f87171" }}>{error}</p>}

              <button
                onClick={handleSubmit}
                disabled={!resumeUrl || !portfolioLink.trim() || submitting}
                className="w-full py-4 rounded-xl text-base font-bold transition-opacity disabled:opacity-35 mb-5"
                style={{ background: btnBg, color: btnText }}
              >
                {submitting ? "submitting…" : "submit"}
              </button>

              <p className="text-sm text-center" style={{ color: mutedCol }}>
                {!resumeUrl && "Upload your resume to enable submit. "}
                <button
                  onClick={handleSaveForLater}
                  disabled={saving}
                  className="underline underline-offset-2"
                  style={{ color: subCol }}
                >
                  {savedMsg ? "saved ✓" : saving ? "saving…" : "save your answers and come back later"}
                </button>
              </p>
            </div>
          )}

          {/* ── BOOKING ── */}
          {phase === "booking" && (
            <div className="w-full max-w-2xl">
              <h2
                className="font-bold mb-2"
                style={{ fontSize: "clamp(22px, 4vw, 30px)", color: textCol }}
              >
                Book a call
              </h2>
              <p className="text-sm mb-6" style={{ color: subCol }}>
                Choose a slot that works best for you. Slots open from 3 working days from today.
              </p>

              {CALENDLY_URL ? (
                <>
                  <div
                    className="calendly-inline-widget rounded-xl border"
                    data-url={`${CALENDLY_URL}?hide_landing_page_details=1&hide_gdpr_banner=1`}
                    style={{ minWidth: 320, height: 700, borderColor: border }}
                  />
                  <p className="mt-4 text-sm" style={{ color: mutedCol }}>
                    Booked? If the page doesn't auto-advance:{" "}
                    <button
                      onClick={handleManualBooked}
                      className="underline underline-offset-2 font-semibold"
                      style={{ color: subCol }}
                    >
                      confirm my booking →
                    </button>
                  </p>
                  <p className="mt-2 text-xs" style={{ color: mutedCol }}>
                    The embed detects bookings automatically — no paid Calendly plan or webhook required.
                  </p>
                </>
              ) : (
                <div
                  className="rounded-xl border p-10 text-center"
                  style={{ borderColor: border, background: cardBg }}
                >
                  <p className="font-semibold mb-1" style={{ color: textCol }}>
                    Calendly booking will appear here
                  </p>
                  <p className="text-sm mb-6" style={{ color: mutedCol }}>
                    Add <code>VITE_CALENDLY_URL</code> to your .env file.
                  </p>
                  <button
                    onClick={handleManualBooked}
                    className="px-5 py-2.5 rounded-lg border text-sm font-semibold"
                    style={{ borderColor: border, color: subCol, background: "transparent" }}
                  >
                    [Prototype] Simulate: call booked →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── DONE ── */}
          {phase === "done" && (
            <div className="w-full max-w-lg text-center">
              <div
                className="w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center mx-auto mb-6"
                style={{ borderColor: textCol }}
              >
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: textCol, lineHeight: 1.2 }}>
                  {new Date().toLocaleString("en", { month: "short" })}
                </p>
                <p style={{ fontSize: 20, fontWeight: 900, color: textCol, lineHeight: 1.1 }}>
                  {new Date().getDate()}
                </p>
              </div>

              <h2 className="font-bold mb-2" style={{ fontSize: "clamp(26px, 5vw, 38px)", color: textCol }}>
                You're all set!
              </h2>
              <p className="text-sm mb-8" style={{ color: subCol }}>
                Your submission is confirmed. We'll review your portfolio and reach out with next steps.
              </p>

              <div
                className="rounded-xl border p-6 text-left mb-6"
                style={{ borderColor: border, background: cardBg }}
              >
                <p className="text-sm font-bold mb-4" style={{ color: textCol }}>
                  What to expect on your call
                </p>
                <ul className="space-y-2.5">
                  {[
                    "A 30-minute live session with one of our industry reviewers",
                    "They'll go through your resume and portfolio in detail",
                    "You'll get real-time suggestions on layout, content and presentation",
                    "Come prepared with questions about your career goals"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: subCol }}>
                      <span className="mt-0.5">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-xs mb-4" style={{ color: mutedCol }}>
                Reviewer: to be assigned — an industry professional from evolve's expert network.
              </p>
              <button
                className="text-xs underline underline-offset-2"
                style={{ color: mutedCol }}
                onClick={() => {
                  if (window.confirm("Go back to booking page?")) setPhase("booking");
                }}
              >
                Need to reschedule?
              </button>
            </div>
          )}

          {/* ── REPORT ── */}
          {phase === "report" && (
            <div className="w-full flex flex-col" style={{ minHeight: "70vh" }}>
              <div className="flex justify-end gap-3 mb-4">
                <a
                  href={reportUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="px-4 py-2 rounded-lg border text-sm font-semibold"
                  style={{ borderColor: border, color: subCol, background: cardBg }}
                  onClick={() => {
                    // Re-arm feedback: 30s after they click download (they're now looking at it)
                    clearTimeout(feedbackTimer.current);
                    if (!feedbackGiven) {
                      feedbackTimer.current = setTimeout(() => setFeedbackOpen(true), 30000);
                    }
                  }}
                >
                  download report
                </a>
                {!feedbackGiven ? (
                  <button
                    onClick={() => setFeedbackOpen(true)}
                    className="px-4 py-2 rounded-lg border text-sm font-semibold"
                    style={{ borderColor: border, color: subCol, background: cardBg }}
                  >
                    give feedback
                  </button>
                ) : (
                  <span className="px-4 py-2 text-sm" style={{ color: mutedCol }}>
                    feedback submitted ✓
                  </span>
                )}
              </div>
              <iframe
                src={reportUrl}
                title="Your portfolio review report"
                className="w-full flex-1 rounded-xl border"
                style={{ minHeight: "70vh", borderColor: border }}
              />
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
