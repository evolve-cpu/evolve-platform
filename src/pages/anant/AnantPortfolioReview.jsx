import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { supabaseAdmin } from "../../supabaseAdminClient";
import { anant_logo } from "../../assets/images/Community";

const CALENDLY_URL = import.meta.env.VITE_CALENDLY_URL || "";

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
    question: "Anything else you're finding difficult that we should know about?",
    placeholder:
      "ex. I'm not sure how to present a particular project, or I struggle with writing about my design process...",
    short: "Anything else you're finding difficult..."
  }
];

/* ── Sidebar sub-components ─────────────────────────────────────────────────── */

function SideSection({ label, active, done, children }) {
  return (
    <div className="mb-5">
      <p
        className="px-5 mb-1.5"
        style={{
          fontSize: 12,
          color: active ? "#111827" : "#9ca3af",
          fontWeight: active ? 600 : 400
        }}
      >
        {label}
      </p>
      {children}
    </div>
  );
}

function SideItem({ label, done, active }) {
  return (
    <div className="flex items-start gap-2 px-5 py-0.5">
      {done || active ? (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: "#111827", marginTop: 5 }}
        />
      ) : (
        <span
          className="w-1.5 h-1.5 rounded-full border shrink-0"
          style={{ borderColor: "#9ca3af", marginTop: 5 }}
        />
      )}
      <span
        style={{
          fontSize: 11.5,
          lineHeight: 1.45,
          color: active ? "#374151" : done ? "#6b7280" : "#9ca3af"
        }}
      >
        {label}
      </span>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────────────── */

export default function AnantPortfolioReview({ session, studentData }) {
  const navigate = useNavigate();

  // phase: 'init' | 'questions' | 'share' | 'booking' | 'done' | 'report'
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

  const fileRef = useRef();
  const calendlyLoaded = useRef(false);

  const user = session?.user;
  const email = user?.email?.toLowerCase();
  const studentName = studentData
    ? `${studentData.first_name} ${studentData.last_name}`
    : email?.split("@")[0] || "";

  /* ── Load existing review on mount ───────────────────────────────────────── */
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

        // Notes field stores Q1 + Q4 separated by a delimiter
        const parts = (data.notes || "").split("\n\n---q4---\n");
        setAnswers({
          q1: parts[0] || "",
          q2: data.target_roles || "",
          q3: data.proud_project || "",
          q4: parts[1] || ""
        });
        setPortfolioLink(data.portfolio_link || "");
        setResumeUrl(data.portfolio_file_url || "");

        if (data.review_report_url) {
          setReportUrl(data.review_report_url);
          setPhase("report");
        } else if (data.review_status === "done" || data.review_status === "in_review") {
          setPhase("done");
        } else if (data.review_status === "pending") {
          setPhase("booking");
        } else {
          // draft or null status — they've answered questions, go to share
          setPhase("share");
        }
      });
  }, [email]);

  /* ── Calendly event: mark booking done ───────────────────────────────────── */
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

  /* ── Load Calendly script when needed ────────────────────────────────────── */
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

  /* ── DB persistence ──────────────────────────────────────────────────────── */
  async function persist(status) {
    const notesVal = answers.q4
      ? `${answers.q1}\n\n---q4---\n${answers.q4}`
      : answers.q1;

    const payload = {
      email,
      name: studentName,
      tenant_id: "anant",
      notes: notesVal || null,
      target_roles: answers.q2 || null,
      proud_project: answers.q3 || null,
      portfolio_link: portfolioLink || null,
      portfolio_file_url: resumeUrl || null,
      review_status: status,
      course: studentData?.program || null,
      batch: studentData?.year ? String(studentData.year) : null,
      user_id: user?.id || null
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

  /* ── Question navigation ─────────────────────────────────────────────────── */
  async function nextQ() {
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ((q) => q + 1);
      return;
    }
    // Last question answered — save draft and go to share
    setSaving(true);
    const err = await persist("draft");
    setSaving(false);
    if (err) { setError(err.message); return; }
    setPhase("share");
  }

  /* ── Resume upload ───────────────────────────────────────────────────────── */
  async function handleResumeFile(file) {
    if (!file) return;
    if (file.type !== "application/pdf") { setError("Please upload a PDF file."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("File must be under 5MB."); return; }

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

  /* ── Save for later ──────────────────────────────────────────────────────── */
  async function handleSaveForLater() {
    setSaving(true);
    await persist("draft");
    setSaving(false);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  }

  /* ── Final submit ────────────────────────────────────────────────────────── */
  async function handleSubmit() {
    if (!resumeUrl || !portfolioLink.trim()) return;
    setSubmitting(true);
    setError("");
    const err = await persist("pending");
    setSubmitting(false);
    if (err) { setError(err.message); return; }
    setPhase("booking");
  }

  /* ── Sidebar computed state ──────────────────────────────────────────────── */
  const qDone = phase !== "questions" ? QUESTIONS.length : currentQ;
  const shareDone = ["booking", "done", "report"].includes(phase);
  const bookDone = ["done", "report"].includes(phase);

  /* ── Loading ─────────────────────────────────────────────────────────────── */
  if (phase === "init") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: "#fff" }}
    >
      {/* ── Navbar ── */}
      <header
        className="shrink-0 flex items-center justify-between px-6 border-b"
        style={{ height: 56, background: "#060c17", borderColor: "#0d1f3c" }}
      >
        <button onClick={() => navigate("/")} className="focus:outline-none">
          <img src={anant_logo} alt="ANU" className="h-9 w-auto object-contain" />
        </button>
        <button
          onClick={() => navigate("/profile")}
          style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}
        >
          my profile
        </button>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ── */}
        <aside
          className="w-64 shrink-0 border-r overflow-y-auto"
          style={{ borderColor: "#e5e7eb", background: "#f9fafb", paddingTop: 28, paddingBottom: 28 }}
        >
          <p
            className="px-5 mb-5"
            style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9ca3af" }}
          >
            steps for portfolio review
          </p>

          <SideSection
            label="let's get to know you"
            active={phase === "questions"}
            done={phase !== "questions"}
          >
            {QUESTIONS.map((q, i) => (
              <SideItem
                key={q.key}
                label={q.short}
                done={i < qDone}
                active={phase === "questions" && i === currentQ}
              />
            ))}
          </SideSection>

          <SideSection label="share" active={phase === "share"} done={shareDone}>
            <SideItem
              label="upload your resume and portfolio with us"
              done={shareDone}
              active={phase === "share"}
            />
          </SideSection>

          <SideSection
            label="meet your reviewer"
            active={phase === "booking" || phase === "done"}
            done={bookDone}
          >
            <SideItem
              label="book a call"
              done={bookDone}
              active={phase === "booking"}
            />
            <SideItem
              label="meet your reviewer"
              done={phase === "report"}
              active={phase === "done"}
            />
          </SideSection>

          <SideSection label="view report" active={phase === "report"} done={false}>
            <SideItem
              label="check out your report!"
              done={false}
              active={phase === "report"}
            />
          </SideSection>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-8 py-12">

          {/* ── Questions ── */}
          {phase === "questions" && (() => {
            const q = QUESTIONS[currentQ];
            return (
              <div className="w-full max-w-xl">
                {currentQ === 0 && (
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "#9ca3af",
                      marginBottom: 20
                    }}
                  >
                    let's get to know you
                  </p>
                )}
                <h2
                  className="font-semibold mb-5"
                  style={{ fontSize: 19, color: "#111827", lineHeight: 1.35 }}
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
                    className="w-full rounded border px-4 py-3 text-sm resize-none outline-none"
                    style={{
                      borderColor: "#d1d5db",
                      color: "#111827",
                      background: "#fff",
                      lineHeight: 1.65,
                      fontFamily: "inherit"
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) nextQ();
                    }}
                  />
                  <button
                    onClick={nextQ}
                    disabled={!answers[q.key].trim() || saving}
                    className="absolute bottom-3 right-3 w-7 h-7 rounded flex items-center justify-center transition-opacity disabled:opacity-30"
                    style={{ background: "#e5e7eb" }}
                  >
                    {saving ? (
                      <div className="w-3 h-3 border border-gray-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M2.5 6H9.5M6.5 3L9.5 6L6.5 9"
                          stroke="#374151"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {error && (
                  <p className="mt-2 text-xs" style={{ color: "#ef4444" }}>{error}</p>
                )}
                <p className="mt-3 text-xs" style={{ color: "#9ca3af" }}>
                  Press ⌘ + Enter to continue
                </p>
              </div>
            );
          })()}

          {/* ── Share ── */}
          {phase === "share" && (
            <div className="w-full max-w-sm">
              <h2 className="text-2xl font-bold mb-1" style={{ color: "#111827" }}>
                Share your resume and portfolio
              </h2>
              <p className="text-sm mb-7" style={{ color: "#6b7280" }}>
                Make sure your portfolio link is accessible to anyone who has it.
              </p>

              {/* Resume upload */}
              <div className="mb-5">
                <label className="block text-sm font-semibold mb-2" style={{ color: "#374151" }}>
                  Upload resume (PDF, max 5MB)
                </label>

                {resumeUrl ? (
                  <div
                    className="flex items-center gap-3 rounded border px-3 py-2.5"
                    style={{ borderColor: "#d1d5db" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#ef4444" strokeWidth="1.8"/>
                      <polyline points="14 2 14 8 20 8" stroke="#ef4444" strokeWidth="1.8"/>
                    </svg>
                    <span className="text-sm flex-1 truncate" style={{ color: "#374151" }}>
                      {resumeFile?.name || "resume.pdf"}
                    </span>
                    <button
                      onClick={() => { setResumeUrl(""); setResumeFile(null); }}
                      className="text-xs"
                      style={{ color: "#9ca3af" }}
                    >
                      remove
                    </button>
                  </div>
                ) : (
                  <div
                    className="rounded border-2 border-dashed flex flex-col items-center justify-center cursor-pointer"
                    style={{
                      borderColor: dragOver ? "#2563eb" : "#d1d5db",
                      background: dragOver ? "rgba(37,99,235,0.03)" : "#f9fafb",
                      minHeight: 96,
                      padding: "20px 16px"
                    }}
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      handleResumeFile(e.dataTransfer.files?.[0]);
                    }}
                  >
                    {uploading ? (
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <p className="text-sm text-center" style={{ color: "#6b7280" }}>
                        Drag & drop file here, or click to browse
                      </p>
                    )}
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => handleResumeFile(e.target.files?.[0])}
                />
              </div>

              {/* Portfolio link */}
              <div className="mb-7">
                <label className="block text-sm font-semibold mb-2" style={{ color: "#374151" }}>
                  Portfolio link
                </label>
                <input
                  type="url"
                  value={portfolioLink}
                  onChange={(e) => setPortfolioLink(e.target.value)}
                  placeholder="https://your-portfolio-link.com"
                  className="w-full rounded border px-4 py-3 text-sm outline-none"
                  style={{ borderColor: "#d1d5db", color: "#111827", background: "#fff" }}
                />
              </div>

              {error && <p className="mb-3 text-xs" style={{ color: "#ef4444" }}>{error}</p>}

              <button
                onClick={handleSubmit}
                disabled={!resumeUrl || !portfolioLink.trim() || submitting}
                className="w-full py-3 rounded text-sm font-semibold transition-opacity disabled:opacity-35 mb-4"
                style={{ background: "#111827", color: "#fff" }}
              >
                {submitting ? "submitting…" : "submit"}
              </button>

              <p className="text-xs text-center" style={{ color: "#9ca3af" }}>
                {!resumeUrl && "Upload your resume to enable submit. "}
                <button
                  onClick={handleSaveForLater}
                  disabled={saving}
                  className="underline underline-offset-2"
                  style={{ color: "#6b7280" }}
                >
                  {savedMsg ? "saved ✓" : saving ? "saving…" : "save your answers and come back later"}
                </button>
              </p>
            </div>
          )}

          {/* ── Booking (Calendly) ── */}
          {phase === "booking" && (
            <div className="w-full max-w-2xl">
              <h2 className="text-2xl font-bold mb-1" style={{ color: "#111827" }}>
                Book a call
              </h2>
              <p className="text-sm mb-6" style={{ color: "#6b7280" }}>
                Choose a slot that works best for you. Slots open up from 3 working days from today.
              </p>

              {CALENDLY_URL ? (
                <div
                  className="calendly-inline-widget rounded border"
                  data-url={`${CALENDLY_URL}?hide_landing_page_details=1&hide_gdpr_banner=1`}
                  style={{ minWidth: 320, height: 700, borderColor: "#e5e7eb" }}
                />
              ) : (
                <div
                  className="rounded border p-10 text-center"
                  style={{ borderColor: "#e5e7eb" }}
                >
                  <p className="text-sm mb-1" style={{ color: "#374151" }}>
                    Calendly booking will appear here.
                  </p>
                  <p className="text-xs mb-6" style={{ color: "#9ca3af" }}>
                    Add <code>VITE_CALENDLY_URL</code> to your .env file.
                  </p>
                  <button
                    onClick={() => setPhase("done")}
                    className="px-4 py-2 rounded border text-xs"
                    style={{ borderColor: "#d1d5db", color: "#6b7280" }}
                  >
                    [Prototype] Simulate: call completed →
                  </button>
                </div>
              )}

              <p className="mt-4 text-xs" style={{ color: "#9ca3af" }}>
                Once booked, you'll get a confirmation email with the call details and a calendar invite.
              </p>
            </div>
          )}

          {/* ── Done (You're all set!) ── */}
          {phase === "done" && (
            <div className="w-full max-w-lg text-center">
              <div
                className="w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center mx-auto mb-6"
                style={{ borderColor: "#111827" }}
              >
                <p
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "#111827",
                    lineHeight: 1.2
                  }}
                >
                  {new Date().toLocaleString("en", { month: "short" })}
                </p>
                <p
                  style={{ fontSize: 18, fontWeight: 900, color: "#111827", lineHeight: 1.1 }}
                >
                  {new Date().getDate()}
                </p>
              </div>

              <h2 className="text-3xl font-bold mb-2" style={{ color: "#111827" }}>
                You're all set!
              </h2>
              <p className="text-sm mb-8" style={{ color: "#6b7280" }}>
                Your submission is confirmed. We'll review your portfolio and reach out with next steps.
              </p>

              <div
                className="rounded border p-5 text-left mb-6"
                style={{ borderColor: "#e5e7eb" }}
              >
                <p className="text-sm font-semibold mb-3" style={{ color: "#111827" }}>
                  What to expect on your call
                </p>
                <ul className="space-y-2">
                  {[
                    "A 30-minute live session with one of our industry reviewers",
                    "They'll go through your resume and portfolio in detail",
                    "You'll get real-time suggestions on layout, content and presentation",
                    "Come prepared with questions about your career goals"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "#374151" }}>
                      <span className="mt-0.5">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-xs mb-5" style={{ color: "#9ca3af" }}>
                Reviewer: to be assigned — an industry professional from evolve's expert network.
              </p>

              <div className="flex items-center justify-center gap-5">
                <button
                  className="text-xs underline underline-offset-2"
                  style={{ color: "#6b7280" }}
                  onClick={() => {
                    if (window.confirm("This will take you back to the booking page. Are you sure?")) {
                      setPhase("booking");
                    }
                  }}
                >
                  Need to reschedule?
                </button>
              </div>
            </div>
          )}

          {/* ── Report ── */}
          {phase === "report" && (
            <div className="w-full flex flex-col" style={{ minHeight: "70vh" }}>
              <div className="flex justify-end gap-3 mb-4">
                <a
                  href={reportUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="px-4 py-1.5 rounded border text-xs font-semibold"
                  style={{ borderColor: "#d1d5db", color: "#374151" }}
                >
                  download report
                </a>
                <a
                  href="mailto:portfolio@evolvedesign.academy?subject=Portfolio Review Feedback"
                  className="px-4 py-1.5 rounded border text-xs font-semibold"
                  style={{ borderColor: "#d1d5db", color: "#374151" }}
                >
                  give feedback
                </a>
              </div>
              <iframe
                src={reportUrl}
                title="Your portfolio review report"
                className="w-full flex-1 rounded border"
                style={{ minHeight: "70vh", borderColor: "#e5e7eb" }}
              />
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
