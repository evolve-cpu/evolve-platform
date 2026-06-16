import { Helmet } from "react-helmet-async";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { supabaseAdmin } from "../../supabaseAdminClient";
import { anant_logo } from "../../assets/images/Community";
import { useAnantTheme } from "../../context/AnantThemeContext";
import {
  anu_student_hero_img_1,
  evolve_branding_logo
} from "../../assets/anant";

const FORM_PATH = "/portfolio-review/form";

const STEPS = [
  {
    n: "1",
    title: "Create your account",
    body: "Sign up with your university email address."
  },
  {
    n: "2",
    title: "Answer a few questions",
    body: "Help your reviewer understand your goals and where you're finding it hardest to make progress."
  },
  {
    n: "3",
    title: "Book your 1:1 call",
    body: "Book a time to meet your reviewer."
  },
  {
    n: "4",
    title: "Meet your reviewer",
    body: "Discuss your work directly with your reviewer, then receive a detailed report with next steps."
  },
  {
    n: "5",
    title: "Get your report",
    body: "Receive a written report with clear next steps to improve."
  }
];

const FAQS = [
  {
    q: "How long does the entire process take?",
    a: "From sign-up to receiving your report usually takes 5 to 7 working days. The exact time depends on when you book your 1:1 call."
  },
  {
    q: "What should my portfolio include before I submit?",
    a: "A working link to your portfolio (Behance, Drive, or personal website) and an updated resume. It doesn't need to be perfect, since that's what the review is for."
  },
  {
    q: "Can I reschedule my 1:1 call?",
    a: "Yes. You can reschedule from your confirmation email or from the waiting screen, up to 24 hours before your slot."
  },
  {
    q: "Is this review free for Anant National University students?",
    a: "Yes — this programme is offered to Anant National University students as part of the university's partnership with Evolve."
  },
  {
    q: "What do I get at the end?",
    a: "A detailed report covering portfolio structure, case study quality, presentation and role readiness, plus the option to get in touch with us for further guidance."
  }
];

/* ── FAQ item ── */
function FaqItem({ q, a, border }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b" style={{ borderColor: border }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left"
      >
        <span className="font-semibold text-sm" style={{ color: "#0f172a" }}>
          {q}
        </span>
        <span
          className="text-lg leading-none shrink-0"
          style={{ color: "#64748b" }}
        >
          {open ? "×" : "+"}
        </span>
      </button>
      {open && (
        <p
          className="pb-5 text-sm leading-relaxed"
          style={{ color: "#475569" }}
        >
          {a}
        </p>
      )}
    </div>
  );
}

/* ── Main component ── */
export default function AnantHome() {
  const navigate = useNavigate();
  const { dark, toggleDark } = useAnantTheme();
  const [authUser, setAuthUser] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [reviewStatus, setReviewStatus] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setShowMenu(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    async function load(session) {
      const u = session?.user;
      setAuthUser(u || null);
      if (!u) {
        setStudentData(null);
        setReviewStatus(null);
        return;
      }
      const email = u.email?.toLowerCase();
      try {
        const cached = sessionStorage.getItem("anu_student_cache");
        if (cached) {
          const p = JSON.parse(cached);
          if (p.anu_email === email) {
            setStudentData(p);
          }
        }
      } catch {}
      const { data } = await supabaseAdmin
        .from("anu_students")
        .select("first_name, last_name, program, stream, year, anu_email")
        .eq("anu_email", email)
        .maybeSingle();
      if (data)
        sessionStorage.setItem("anu_student_cache", JSON.stringify(data));
      setStudentData(data || null);

      // Fetch review status for dynamic CTA
      const { data: review } = await supabase
        .from("portfolio_reviews")
        .select("review_status, review_report_url")
        .eq("email", email)
        .eq("tenant_id", "anant")
        .maybeSingle();
      if (review?.review_report_url) setReviewStatus("report");
      else if (review?.review_status) setReviewStatus(review.review_status);
      else setReviewStatus("none");
    }
    supabase.auth.getSession().then(({ data: { session } }) => load(session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      load(session)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    sessionStorage.removeItem("anu_student_cache");
    await supabase.auth.signOut();
    setAuthUser(null);
    setStudentData(null);
    setShowMenu(false);
  }

  const handleCTA = () => navigate(authUser ? FORM_PATH : "/signin");

  const ctaLabel = (() => {
    if (!authUser) return "Start your review";
    if (reviewStatus === "report") return "View your report";
    if (["pending", "in_review", "done", "share"].includes(reviewStatus)) return "Continue your review";
    return "Start your review";
  })();
  const displayName = studentData
    ? `${studentData.first_name} ${studentData.last_name}`
    : authUser?.email?.split("@")[0] || "";

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  /* theme */
  const bg = dark ? "#060c17" : "#ffffff";
  const bg2 = dark ? "#04080f" : "#f8fafc";
  const bord = dark ? "#0d1f3c" : "#e2e8f0";
  const text = dark ? "#f0f4ff" : "#0f172a";
  const sub = dark ? "rgba(255,255,255,0.6)" : "#475569";
  const muted = dark ? "rgba(255,255,255,0.3)" : "#94a3b8";
  const cardBg = dark ? "#071022" : "#ffffff";
  const cardBrd = dark ? "#0d1f3c" : "#e2e8f0";

  return (
    <>
      <Helmet>
        <title>Anant National University × evolve — Portfolio Review</title>
        <meta
          name="description"
          content="An exclusive portfolio review experience for Anant National University students. Get expert feedback from design professionals from Evolve's network."
        />
      </Helmet>

      <div
        className="min-h-screen flex flex-col"
        style={{ background: bg, color: text }}
      >
        {/* ── Navbar ── */}
        <header
          className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 border-b"
          style={{ height: 64, background: "#060c17", borderColor: "#0d1f3c" }}
        >
          <button
            onClick={() => navigate("/")}
            className="focus:outline-none shrink-0"
          >
            <img
              src={anant_logo}
              alt="Anant National University"
              className="h-10 w-auto object-contain"
            />
          </button>

          {/* Center nav links */}
          <nav className="hidden md:flex items-center gap-6">
            {[
              { label: "how it works", id: "how-it-works" },
              { label: "reviewers", id: "reviewers" },
              { label: "FAQs", id: "faqs" }
            ].map(({ label, id }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="text-sm"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* theme toggle */}
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

            {authUser ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu((v) => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border"
                  style={{
                    borderColor: "#1e3a8a",
                    background: showMenu
                      ? "rgba(37,99,235,0.15)"
                      : "transparent"
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: "#1e3a8a", color: "#93c5fd" }}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span
                    className="text-sm font-semibold hidden md:block"
                    style={{ color: "rgba(255,255,255,0.75)" }}
                  >
                    {displayName}
                  </span>
                </button>
                {showMenu && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl border shadow-2xl overflow-hidden z-50"
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
                        onClick={() => {
                          navigate(FORM_PATH);
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-white/5"
                        style={{ color: "rgba(255,255,255,0.7)" }}
                      >
                        portfolio review
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
            ) : (
              <button
                onClick={handleCTA}
                className="text-sm font-semibold px-4 py-2 rounded-xl border"
                style={{ borderColor: "rgba(255,255,255,0.25)", color: "#fff" }}
              >
                get started
              </button>
            )}
          </div>
        </header>

        {/* ── Hero ── */}
        <section
          className="px-6 md:px-10 py-16 md:py-24 border-b"
          style={{ borderColor: bord }}
        >
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span
                className="inline-block text-[11px] font-bold  tracking-widest px-3 py-1.5 rounded border mb-6"
                style={{ borderColor: bord, color: muted }}
              >
                Anant National University × evolve
              </span>
              <h1
                className="font-extrabold leading-tight mb-5"
                style={{
                  fontSize: "clamp(28px, 5vw, 52px)",
                  letterSpacing: "-0.025em",
                  color: text
                }}
              >
                Get expert feedback on your design portfolio
              </h1>
              <p
                className="text-base leading-relaxed mb-8"
                style={{ color: sub, maxWidth: "44ch" }}
              >
                An exclusive portfolio review experience for Anant National
                University students. See how recruiters read your work, and
                learn exactly what to fix before you start applying.
              </p>
              <button
                onClick={handleCTA}
                className="font-bold px-7 py-3.5 rounded-xl text-sm"
                style={{ background: text, color: bg }}
              >
                {ctaLabel}
              </button>
            </div>

            {/* Hero image placeholder */}
            <div
              className="rounded-2xl border flex items-center justify-center"
              style={
                {
                  // minHeight: 280
                  // borderColor: bord,
                  // background: dark
                  // ? "repeating-linear-gradient(135deg, #071022 0px, #071022 8px, #04080f 8px, #04080f 16px)"
                  // : "repeating-linear-gradient(135deg, #f8fafc 0px, #f8fafc 8px, #f1f5f9 8px, #f1f5f9 16px)"
                }
              }
            >
              <span className="text-sm" style={{ color: muted }}>
                <img
                  src={anu_student_hero_img_1}
                  alt="Hero"
                  className="w-full h-full object-cover rounded-2xl"
                />
              </span>
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section
          id="how-it-works"
          className="px-6 md:px-10 py-16 border-b"
          style={{ borderColor: bord, background: bg }}
        >
          <div className="max-w-6xl mx-auto">
            <h2
              className="font-bold mb-1"
              style={{ fontSize: "clamp(20px, 3vw, 28px)", color: text }}
            >
              How it works
            </h2>
            <p className="mb-10 text-sm" style={{ color: sub }}>
              Five steps from sign-up to your final report
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {STEPS.map(({ n, title, body }) => (
                <div
                  key={n}
                  className="rounded-2xl border p-6"
                  style={{ borderColor: cardBrd, background: cardBg }}
                >
                  <div
                    className="w-9 h-9 rounded-full border flex items-center justify-center text-sm font-bold mb-4"
                    style={{
                      borderColor: bord,
                      color: muted,
                      background: "transparent"
                    }}
                  >
                    {n}
                  </div>
                  <p
                    className="font-bold text-sm mb-1.5"
                    style={{ color: text }}
                  >
                    {title}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: sub }}>
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Who's reviewing ── */}
        <section
          id="reviewers"
          className="px-6 md:px-10 py-16 border-b"
          style={{ borderColor: bord, background: bg2 }}
        >
          <div className="max-w-6xl mx-auto">
            <h2
              className="font-bold mb-3"
              style={{ fontSize: "clamp(20px, 3vw, 28px)", color: text }}
            >
              Who's reviewing your work?
            </h2>
            <p
              className="text-sm leading-relaxed mb-8"
              style={{ color: sub, maxWidth: "56ch" }}
            >
              Your portfolio is reviewed by design professionals from evolve's
              hiring and mentor network. These are people who've sat on the
              other side of the interview table and know exactly what recruiters
              look for.
            </p>

            {/* Reviewers image placeholder */}
            <div
              className="rounded-2xl border flex items-center justify-center bg-evolve-yellow"
              style={{
                minHeight: 220,
                borderColor: bord
              }}
            >
              <img
                src={evolve_branding_logo}
                alt="Evolve Branding Logo"
                className="max-w-[180px] h-auto object-contain"
              />
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section
          id="faqs"
          className="px-6 md:px-10 py-16 border-b"
          style={{ borderColor: bord, background: bg }}
        >
          <div className="max-w-3xl mx-auto">
            <h2
              className="font-bold mb-8"
              style={{ fontSize: "clamp(20px, 3vw, 28px)", color: text }}
            >
              Frequently asked questions
            </h2>
            <div>
              {FAQS.map(({ q, a }) => (
                <FaqItem key={q} q={q} a={a} border={bord} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer
          className="px-6 md:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          style={{ color: muted, borderTop: `1px solid ${bord}` }}
        >
          <span>evolve team</span>
          {/* <span>support@evolvedesign.academy</span> */}
          <span>Anant National University, Ahmedabad</span>
          <button
            onClick={() => navigate("/admin")}
            className="underline underline-offset-2"
            style={{ color: muted }}
          >
            Faculty &amp; Career Cell login →
          </button>
        </footer>
      </div>
    </>
  );
}
