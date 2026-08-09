import { useEffect, useRef, useState } from "react";
import { supabase } from "../../supabaseClient";
import { PortfolioReviewArt } from "./CardArt";
import { getPortfolioReviewProgress } from "../../lib/portfolioReviewProgress";

const CALENDLY_URL =
  import.meta.env.VITE_EVOLVE_CALENDLY_URL ||
  "https://calendly.com/evolvedesignacademy/portfolioreview";

const QUESTIONS = [
  {
    key: "q1",
    question: "What's been the hardest part about putting your portfolio together?",
    placeholder: "e.g. deciding which projects to include, writing case studies, structuring it, the overall layout."
  },
  {
    key: "q2",
    question: "What kind of work are you hoping to land?",
    placeholder: "e.g. UX design roles at product companies, graphic design internships, freelance branding work."
  },
  {
    key: "q3",
    question: "Is there anything specific you'd like your reviewer to look closely at?",
    placeholder: "e.g. case study structure, visual consistency, a particular project you're unsure about."
  },
  {
    key: "q4",
    question: "Anything else you're finding difficult that we should know about?",
    placeholder: "e.g. how to present a certain project, or writing about your process — totally optional.",
    optional: true
  }
];

function driveEmbedUrl(url) {
  if (!url) return url;
  const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return m ? `https://drive.google.com/file/d/${m[1]}/preview` : url;
}

function safeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

/* ── sidebar step nodes ────────────────────────────────────────────────── */
function StepSidebar({
  phase, currentQ, qDone, shareDone, bookDone, hasReport, hasRecording,
  onSelectQuestion, onNavigatePhase, className = ""
}) {
  const isSubmitted = ["booking", "confirmed", "results"].includes(phase);

  const sections = [
    {
      title: "let's get to know you",
      items: QUESTIONS.map((q, i) => ({
        label: q.question.length > 42 ? `Q${i + 1} — ${q.question.slice(0, 38)}…` : `Q${i + 1} — ${q.question}`,
        active: phase === "questions" && currentQ === i,
        done: i < qDone,
        navigable: isSubmitted || (phase === "questions" && i < qDone && i !== currentQ),
        onClick: () => onSelectQuestion(i)
      }))
    },
    {
      title: "share your work",
      items: [{
        label: "upload resume & portfolio",
        active: phase === "share",
        done: shareDone,
        navigable: false,
        onClick: () => {}
      }]
    },
    {
      title: "book a call",
      items: [{
        label: "pick a slot",
        active: phase === "booking",
        done: bookDone,
        navigable: false,
        onClick: () => {}
      }]
    },
    {
      title: "your review",
      items: [
        {
          label: "call confirmed",
          active: phase === "confirmed",
          done: phase === "results",
          navigable: false,
          onClick: () => {}
        },
        ...(hasReport
          ? [{
              label: "view report",
              active: phase === "results",
              done: false,
              navigable: phase === "results",
              onClick: () => onNavigatePhase("results")
            }]
          : []),
        ...(hasRecording
          ? [{
              label: "view session",
              active: false,
              done: false,
              navigable: phase === "results",
              onClick: () => onNavigatePhase("results")
            }]
          : [])
      ]
    }
  ];

  return (
    <div className={`flex flex-col gap-5 ${className}`}>
      {sections.map((section) => (
        <div key={section.title} className="flex flex-col gap-1">
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-wide mb-1.5">{section.title}</p>
          {section.items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.navigable ? item.onClick : undefined}
              disabled={!item.navigable}
              className={`flex items-center gap-2.5 text-left text-xs rounded-lg px-2.5 py-2 transition-colors ${
                item.active
                  ? "bg-evolve-yellow/10 text-evolve-yellow font-semibold"
                  : item.done
                  ? "text-white/60"
                  : "text-white/25"
              } ${item.navigable ? "hover:bg-white/[0.04] cursor-pointer" : "cursor-default"}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  item.active ? "bg-evolve-yellow" : item.done ? "bg-evolve-inchworm" : "bg-white/15"
                }`}
              />
              <span className="leading-snug">{item.label}</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── main flow ────────────────────────────────────────────────────────── */
export default function PortfolioReviewFlow({ user, onBack, review }) {
  const [loading, setLoading] = useState(!review);
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

  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  const calendlyLoaded = useRef(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data } = await supabase
        .from("evolve_portfolio_reviews")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled || !data) {
        setLoading(false);
        return;
      }
      setRow(data);
      setAnswers({ q1: data.q1 || "", q2: data.q2 || "", q3: data.q3 || "", q4: data.q4 || "" });

      if (data.resume_value) {
        setResumeMode(data.resume_mode || "upload");
        if ((data.resume_mode || "upload") === "upload") setResumeUrl(data.resume_value);
        else setResumeLink(data.resume_value);
      }
      if (data.portfolio_value) {
        setPortfolioMode(data.portfolio_mode || "link");
        if ((data.portfolio_mode || "link") === "upload") setPortfolioFileUrl(data.portfolio_value);
        else setPortfolioLink(data.portfolio_value);
      }
      if (data.feedback_rating) setFeedbackSent(true);

      if (data.review_report_url || data.meet_recording_url) {
        setPhase("results");
      } else if (data.review_status === "in_review") {
        setPhase("confirmed");
      } else if (data.review_status === "pending") {
        setPhase("booking");
      } else {
        const loaded = { q1: data.q1 || "", q2: data.q2 || "", q3: data.q3 || "", q4: data.q4 || "" };
        const allAnswered = QUESTIONS.every((q) => q.optional || loaded[q.key].trim());
        if (allAnswered) {
          setPhase("share");
        } else {
          const firstEmpty = QUESTIONS.findIndex((q) => !q.optional && !loaded[q.key].trim());
          setCurrentQ(firstEmpty >= 0 ? firstEmpty : 0);
          setPhase("questions");
        }
      }
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

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

  useEffect(() => {
    const onMsg = async (e) => {
      if (e.data?.event !== "calendly.event_scheduled" || !row?.id) return;
      await supabase.from("evolve_portfolio_reviews").update({ review_status: "in_review" }).eq("id", row.id);
      setPhase("confirmed");
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [row?.id]);

  async function persist(status) {
    if (!row?.id) return "no review row";
    const payload = {
      q1: answers.q1 || null,
      q2: answers.q2 || null,
      q3: answers.q3 || null,
      q4: answers.q4 || null,
      resume_mode: resumeMode,
      resume_value: (resumeMode === "upload" ? resumeUrl : resumeLink.trim()) || null,
      portfolio_mode: portfolioMode,
      portfolio_value: (portfolioMode === "link" ? portfolioLink.trim() : portfolioFileUrl) || null,
      review_status: status
    };
    const { error: err } = await supabase.from("evolve_portfolio_reviews").update(payload).eq("id", row.id);
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
    if (!answers[QUESTIONS[currentQ].key]?.trim() && !QUESTIONS[currentQ].optional) return;
    setSaving(true);
    const err = await persist("draft");
    setSaving(false);
    if (err) { setError(err); return; }
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

  async function handleSubmitShare() {
    const resumeOk = resumeMode === "upload" ? !!resumeUrl : !!resumeLink.trim();
    const portfolioOk = portfolioMode === "upload" ? !!portfolioFileUrl : !!portfolioLink.trim();
    if (!resumeOk || !portfolioOk) {
      setError("please add both your resume and portfolio before submitting.");
      return;
    }
    setError("");
    setSaving(true);
    const err = await persist("pending");
    setSaving(false);
    if (err) { setError(err); return; }
    setPhase("booking");
  }

  async function handleResumeFile(file) {
    if (!file) return;
    if (file.type !== "application/pdf") { setError("please upload a PDF file."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("file must be under 5MB."); return; }
    setError("");
    setResumeUploading(true);
    setResumeFile(file);
    const path = `${user.id}/resume/${Date.now()}_${safeFileName(file.name)}`;
    const { error: upErr } = await supabase.storage
      .from("evolve-portfolio-reviews")
      .upload(path, file, { upsert: true, contentType: "application/pdf" });
    if (upErr) { setResumeUploading(false); setResumeFile(null); setError(upErr.message); return; }
    const { data: urlData } = supabase.storage.from("evolve-portfolio-reviews").getPublicUrl(path);
    setResumeUrl(urlData?.publicUrl || "");
    setResumeUploading(false);
  }

  async function handlePortfolioFile(file) {
    if (!file) return;
    if (file.type !== "application/pdf") { setError("please upload a PDF file."); return; }
    if (file.size > 20 * 1024 * 1024) { setError("file must be under 20MB."); return; }
    setError("");
    setPortfolioUploading(true);
    setPortfolioFile(file);
    const path = `${user.id}/portfolio/${Date.now()}_${safeFileName(file.name)}`;
    const { error: upErr } = await supabase.storage
      .from("evolve-portfolio-reviews")
      .upload(path, file, { upsert: true, contentType: "application/pdf" });
    if (upErr) { setPortfolioUploading(false); setPortfolioFile(null); setError(upErr.message); return; }
    const { data: urlData } = supabase.storage.from("evolve-portfolio-reviews").getPublicUrl(path);
    setPortfolioFileUrl(urlData?.publicUrl || "");
    setPortfolioUploading(false);
  }

  async function submitFeedback() {
    if (!feedbackRating || !row?.id) return;
    await supabase
      .from("evolve_portfolio_reviews")
      .update({ feedback_rating: feedbackRating, feedback_text: feedbackText || null })
      .eq("id", row.id);
    setFeedbackSent(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-evolve-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!row) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="text-white/60 text-sm">we couldn't find your review — try refreshing the page.</p>
        {onBack && (
          <button onClick={onBack} className="text-evolve-yellow text-xs font-semibold">
            back to programmes
          </button>
        )}
      </div>
    );
  }

  const maxReachedQ = QUESTIONS.reduce((max, q, i) => (answers[q.key]?.trim() ? i : max), -1);
  const qDone = phase !== "questions" ? QUESTIONS.length : maxReachedQ + 1;
  const shareDone = ["booking", "confirmed", "results"].includes(phase);
  const bookDone = ["confirmed", "results"].includes(phase);
  const progress = getPortfolioReviewProgress({ ...row, ...answers, review_status: row.review_status });

  const sidebarProps = {
    phase, currentQ, qDone, shareDone, bookDone,
    hasReport: !!row.review_report_url,
    hasRecording: !!row.meet_recording_url,
    onSelectQuestion: (i) => { setCurrentQ(i); setPhase("questions"); },
    onNavigatePhase: (p) => setPhase(p)
  };

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={goBackToProgrammes}
        disabled={saving}
        className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm font-semibold w-fit transition-colors disabled:opacity-50"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {saving ? "saving draft…" : "back to programmes"}
      </button>

      <div className="h-[110px] rounded-2xl overflow-hidden border border-white/10">
        <PortfolioReviewArt />
      </div>

      {/* mobile progress summary + toggle */}
      <button
        type="button"
        onClick={() => setSidebarOpenMobile((v) => !v)}
        className="md:hidden flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
      >
        <span className="text-white text-xs font-semibold">
          step {progress?.step ?? 1} of {progress?.totalSteps ?? 5} · {progress?.label}
        </span>
        <span className="text-evolve-yellow text-xs font-bold">{progress?.percent ?? 0}%</span>
      </button>
      {sidebarOpenMobile && (
        <div className="md:hidden rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <StepSidebar {...sidebarProps} />
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        <StepSidebar {...sidebarProps} className="hidden md:flex md:w-56 flex-shrink-0" />

        <div className="flex-1 min-w-0 flex flex-col gap-5">
          {error && (
            <div className="rounded-xl border border-red-400/30 bg-red-400/[0.06] px-4 py-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          {phase === "questions" && (
            <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-white/30 text-[11px] font-bold uppercase tracking-wide">
                question {currentQ + 1} of {QUESTIONS.length}
              </p>
              <h2 className="text-white font-bold font-bricolage text-xl leading-snug">
                {QUESTIONS[currentQ].question}
                {QUESTIONS[currentQ].optional && <span className="text-white/30 font-normal text-sm ml-2">(optional)</span>}
              </h2>
              <textarea
                autoFocus
                rows={7}
                value={answers[QUESTIONS[currentQ].key]}
                onChange={(e) => setAnswers((a) => ({ ...a, [QUESTIONS[currentQ].key]: e.target.value }))}
                placeholder={QUESTIONS[currentQ].placeholder}
                className="w-full text-sm text-white placeholder-white/25 outline-none border border-white/15 focus:border-evolve-yellow/60 rounded-xl px-4 py-3.5 resize-none transition-colors"
                style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
              />
              <div className="flex items-center justify-between gap-3 mt-1">
                <button
                  onClick={handleBackQ}
                  disabled={currentQ === 0 || saving}
                  className="text-white/40 hover:text-white text-xs font-semibold disabled:opacity-30 transition-colors"
                >
                  ← previous
                </button>
                <div className="flex items-center gap-3">
                  {QUESTIONS[currentQ].optional && (
                    <button
                      onClick={() => setPhase("share")}
                      disabled={saving}
                      className="text-white/40 hover:text-white text-xs font-semibold"
                    >
                      skip
                    </button>
                  )}
                  <button
                    onClick={nextQ}
                    disabled={saving || (!answers[QUESTIONS[currentQ].key]?.trim() && !QUESTIONS[currentQ].optional)}
                    className="bg-evolve-yellow text-evolve-black font-bold text-xs rounded-full px-6 py-2.5 disabled:opacity-40 active:opacity-80 transition-opacity"
                  >
                    {saving ? "saving…" : currentQ < QUESTIONS.length - 1 ? "next →" : "continue →"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {phase === "share" && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-white font-bold font-bricolage text-lg">your resume</h2>
                  <div className="flex rounded-full border border-white/10 overflow-hidden text-[11px] font-semibold">
                    <button
                      onClick={() => setResumeMode("upload")}
                      className={`px-3 py-1.5 ${resumeMode === "upload" ? "bg-evolve-yellow text-evolve-black" : "text-white/40"}`}
                    >
                      upload
                    </button>
                    <button
                      onClick={() => setResumeMode("link")}
                      className={`px-3 py-1.5 ${resumeMode === "link" ? "bg-evolve-yellow text-evolve-black" : "text-white/40"}`}
                    >
                      link
                    </button>
                  </div>
                </div>
                {resumeMode === "upload" ? (
                  <label className="rounded-xl border border-dashed border-white/15 hover:border-evolve-yellow/40 bg-white/[0.02] px-4 py-6 flex flex-col items-center gap-1.5 text-center cursor-pointer transition-colors">
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => handleResumeFile(e.target.files?.[0])}
                    />
                    <span className="text-white/60 text-xs font-semibold">
                      {resumeUploading ? "uploading…" : resumeUrl ? "resume uploaded ✓ — tap to replace" : (resumeFile?.name || "tap to upload your resume (PDF, max 5MB)")}
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
                  <h2 className="text-white font-bold font-bricolage text-lg">your portfolio</h2>
                  <div className="flex rounded-full border border-white/10 overflow-hidden text-[11px] font-semibold">
                    <button
                      onClick={() => setPortfolioMode("link")}
                      className={`px-3 py-1.5 ${portfolioMode === "link" ? "bg-evolve-yellow text-evolve-black" : "text-white/40"}`}
                    >
                      link
                    </button>
                    <button
                      onClick={() => setPortfolioMode("upload")}
                      className={`px-3 py-1.5 ${portfolioMode === "upload" ? "bg-evolve-yellow text-evolve-black" : "text-white/40"}`}
                    >
                      upload
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
                      onChange={(e) => handlePortfolioFile(e.target.files?.[0])}
                    />
                    <span className="text-white/60 text-xs font-semibold">
                      {portfolioUploading ? "uploading…" : portfolioFileUrl ? "portfolio uploaded ✓ — tap to replace" : (portfolioFile?.name || "tap to upload your portfolio (PDF, max 20MB)")}
                    </span>
                  </label>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <button onClick={handleSaveForLater} disabled={saving} className="text-white/40 hover:text-white text-xs font-semibold transition-colors">
                  {savedMsg ? "saved ✓" : "save for later"}
                </button>
                <button
                  onClick={handleSubmitShare}
                  disabled={saving || resumeUploading || portfolioUploading}
                  className="bg-evolve-yellow text-evolve-black font-bold text-xs rounded-full px-6 py-2.5 disabled:opacity-40 active:opacity-80 transition-opacity"
                >
                  {saving ? "submitting…" : "submit & book a call →"}
                </button>
              </div>
            </div>
          )}

          {phase === "booking" && (
            <div className="flex flex-col gap-3">
              <h2 className="text-white font-bold font-bricolage text-lg">book your 1:1 call</h2>
              <p className="text-white/40 text-xs">pick a slot that works for you — we'll send a calendar invite.</p>
              <div
                className="calendly-inline-widget rounded-2xl overflow-hidden border border-white/10"
                data-url={`${CALENDLY_URL}?hide_landing_page_details=1&hide_gdpr_banner=1`}
                style={{ minWidth: 280, height: 700 }}
              />
            </div>
          )}

          {phase === "confirmed" && (
            <div className="flex flex-col items-center gap-4 text-center rounded-2xl border border-white/10 bg-white/[0.03] py-14 px-6">
              <div className="w-16 h-16 rounded-full border-4 border-evolve-inchworm flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
                  <path d="M8 18l7 7 13-14" stroke="#c2fd5c" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">you're all set</h3>
                <p className="text-white/40 text-xs mt-1 max-w-xs">
                  your call is booked — your reviewer will go through your portfolio with you live. your report lands here after.
                </p>
              </div>
              <button
                onClick={() => { if (window.confirm("reschedule your call?")) setPhase("booking"); }}
                className="text-evolve-yellow text-xs font-semibold"
              >
                need to reschedule?
              </button>
            </div>
          )}

          {phase === "results" && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-white font-bold font-bricolage text-lg">your review is ready</h2>
                {row.review_report_url && (
                  <a
                    href={row.review_report_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-evolve-yellow text-xs font-semibold"
                  >
                    open report in new tab ↗
                  </a>
                )}
              </div>

              {row.review_report_url && (
                <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ height: 640 }}>
                  <iframe title="report" src={row.review_report_url} className="w-full h-full" />
                </div>
              )}

              {row.meet_recording_url && (
                <div className="flex flex-col gap-2">
                  <p className="text-white/30 text-[11px] font-bold uppercase tracking-wide">session recording</p>
                  <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ height: 400 }}>
                    <iframe title="session recording" src={driveEmbedUrl(row.meet_recording_url)} className="w-full h-full" allow="autoplay" />
                  </div>
                </div>
              )}

              {!feedbackSent ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex flex-col gap-3">
                  <p className="text-white text-sm font-semibold">how was your review?</p>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => setFeedbackRating(n)} className="text-xl leading-none">
                        <span className={n <= feedbackRating ? "text-evolve-yellow" : "text-white/15"}>★</span>
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={2}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="anything you'd like to add? (optional)"
                    className="w-full text-sm text-white placeholder-white/25 outline-none border border-white/15 focus:border-evolve-yellow/60 rounded-xl px-3.5 py-2.5 resize-none transition-colors"
                    style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                  />
                  <button
                    onClick={submitFeedback}
                    disabled={!feedbackRating}
                    className="self-start bg-evolve-yellow text-evolve-black font-bold text-xs rounded-full px-5 py-2 disabled:opacity-40"
                  >
                    submit feedback
                  </button>
                </div>
              ) : (
                <p className="text-evolve-inchworm text-xs font-semibold">thanks for the feedback 🌱</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
