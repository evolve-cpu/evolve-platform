import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { anant_logo } from "../../assets/images/Community";
import { useAnantTheme } from "../../context/AnantThemeContext";

export default function AnantHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { dark, toggleDark } = useAnantTheme();

  const FORM_PATH = "/portfolio-review/form";

  const handleCTA = () => {
    if (user) {
      navigate(FORM_PATH);
    } else {
      localStorage.setItem("signin_from", FORM_PATH);
      sessionStorage.setItem("signin_from", FORM_PATH);
      sessionStorage.setItem("post_signin_redirect", FORM_PATH);
      navigate("/signin");
    }
  };

  /* ── page theme ── */
  const bg       = dark ? "#060c17"  : "#ffffff";
  const bg2      = dark ? "#040810"  : "#f8fafc";
  const border   = dark ? "#0d1f3c"  : "#e2e8f0";
  const text     = dark ? "#ffffff"  : "#0f172a";
  const textSub  = dark ? "rgba(255,255,255,0.6)" : "#4b5563";
  const textMut  = dark ? "#475569"  : "#6b7280";
  const accent   = "#2563eb";
  const cardBg   = dark ? "rgba(37,99,235,0.06)" : "#f0f4ff";
  const cardBord = dark ? "#0d1f3c" : "#bfdbfe";
  const pillBg   = dark ? "rgba(37,99,235,0.08)" : "#eff6ff";
  const pillBord = dark ? "#1e3a8a"  : "#bfdbfe";
  const pillText = dark ? "#93c5fd"  : "#1e40af";
  const footerText = dark ? "#334155" : "#6b7280";
  const cardText = dark ? "rgba(255,255,255,0.78)" : "#334155";
  const softAccent = dark ? "#60a5fa" : "#1d4ed8";

  const reviewFocus = [
    {
      title: "clarity",
      body: "is your portfolio easy to scan, follow, and understand in the first few minutes?"
    },
    {
      title: "story",
      body: "does each project show your role, process, decisions, and design judgement?"
    },
    {
      title: "readiness",
      body: "what should be improved before you share it with studios, recruiters, or mentors?"
    }
  ];

  const usefulFor = [
    "internship applications",
    "studio and placement prep",
    "capstone or graduation portfolio polish",
    "figuring out what to keep, cut, or explain better"
  ];

  return (
    <>
      <Helmet>
        <title>Anant National University × evolve — Portfolio Review</title>
        <meta name="description" content="Submit your design portfolio for a personalised, expert review — a collaboration between Anant National University and evolve. Feedback within 5–7 working days." />
        <meta property="og:title" content="Anant National University × evolve — Portfolio Review" />
        <meta property="og:description" content="Submit your design portfolio for a personalised, expert review — a collaboration between Anant National University and evolve." />
      </Helmet>

      <div className="min-h-screen flex flex-col font-bricolage" style={{ backgroundColor: bg, color: text }}>

        {/* ── Nav — always dark, 64px, logo only ── */}
        <header
          className="sticky top-0 z-50 border-b flex items-center justify-between px-5 md:px-8"
          style={{ height: "64px", backgroundColor: "#060c17", borderColor: "#0d1f3c" }}
        >
          <button onClick={() => navigate("/")} className="flex items-center gap-3 focus:outline-none">
            <img src={anant_logo} alt="Anant National University" className="h-10 w-auto object-contain" />
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium hidden md:block" style={{ color: "rgba(255,255,255,0.3)" }}>
              powered by evolve
            </span>

            {/* theme toggle */}
            <button
              onClick={toggleDark}
              className="w-8 h-8 rounded-full flex items-center justify-center border transition-colors"
              style={{ borderColor: "#0d1f3c", backgroundColor: "#0a1628" }}
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="4" stroke="#93c5fd" strokeWidth="1.8"/>
                  <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="#93c5fd" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" stroke="#93c5fd" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>

            {user ? (
              <>
                <span className="text-sm hidden md:block" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {user.name || user.email}
                </span>
                <button
                  onClick={() => navigate(FORM_PATH)}
                  className="text-sm font-bold px-4 py-2 rounded-xl transition-opacity hover:opacity-90"
                  style={{ backgroundColor: accent, color: "#fff" }}
                >
                  my review
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate("/signin")}
                className="text-sm font-semibold px-4 py-2 rounded-xl border transition-colors"
                style={{ borderColor: "#1e3a8a", color: "#93c5fd" }}
              >
                sign in
              </button>
            )}
          </div>
        </header>

        {/* ── Hero ── */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-8"
            style={{ borderColor: pillBord, backgroundColor: pillBg }}
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
            <p className="text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: pillText }}>
              Anant National University × evolve
            </p>
          </div>

          <h1
            className="font-extrabold leading-none mb-6"
            style={{ fontSize: "clamp(36px, 8vw, 80px)", letterSpacing: "-0.03em", maxWidth: "14ch", color: text }}
          >
            get your portfolio reviewed
          </h1>

          <p
            className="font-normal leading-relaxed mb-10"
            style={{ fontSize: "clamp(15px, 2vw, 20px)", color: textSub, maxWidth: "46ch" }}
          >
            real, personalised feedback on your design portfolio — from working
            designers. honest, actionable notes to help you move forward.
          </p>

          <button
            onClick={handleCTA}
            className="font-bold px-8 py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: accent, color: "#fff", fontSize: "clamp(15px, 1.8vw, 17px)", boxShadow: "0 0 32px rgba(37,99,235,0.3)" }}
          >
            submit your portfolio →
          </button>

          <p className="mt-4 text-xs" style={{ color: textMut }}>
            feedback within 5–7 working days · free for Anant students
          </p>
        </main>

        {/* ── What we look at ── */}
        <section className="px-6 py-16 border-t" style={{ borderColor: border, backgroundColor: bg }}>
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] mb-4" style={{ color: textMut }}>
                  made for Anant students
                </p>
                <h2
                  className="font-extrabold leading-tight"
                  style={{ fontSize: "clamp(30px, 5vw, 56px)", letterSpacing: "-0.02em", color: text }}
                >
                  a sharper second pair of eyes before you send your work out.
                </h2>
                <p className="mt-5 text-sm md:text-base leading-relaxed" style={{ color: textSub }}>
                  You submit your current portfolio, tell us what roles you are
                  aiming for, and get focused notes on how to make the work read
                  stronger. No generic checklist, just practical feedback for
                  your next version.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {reviewFocus.map(({ title, body }) => (
                  <div
                    key={title}
                    className="border rounded-lg p-5"
                    style={{ borderColor: cardBord, backgroundColor: cardBg }}
                  >
                    <p className="text-sm font-extrabold uppercase tracking-[0.12em]" style={{ color: softAccent }}>
                      {title}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed" style={{ color: cardText }}>
                      {body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-16 border-t" style={{ borderColor: border, backgroundColor: bg2 }}>
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-[0.15em] mb-8 text-center" style={{ color: textMut }}>
              what you'll get feedback on
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "portfolio structure & flow",
                "how you're positioning yourself",
                "what's working in your work",
                "what to fix before you send it out",
              ].map((label) => (
                <div
                  key={label}
                  className="flex items-center gap-3 px-5 py-4 rounded-2xl border"
                  style={{ borderColor: cardBord, backgroundColor: cardBg }}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
                  <span className="text-sm font-semibold" style={{ color: dark ? "rgba(255,255,255,0.75)" : "#374151" }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="px-6 py-16 border-t" style={{ borderColor: border, backgroundColor: bg }}>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-[0.8fr_1.2fr] gap-8 items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] mb-3" style={{ color: textMut }}>
                useful when you are preparing for
              </p>
              <h2
                className="font-extrabold leading-tight"
                style={{ fontSize: "clamp(28px, 4vw, 44px)", color: text }}
              >
                the moments where your portfolio has to speak clearly.
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {usefulFor.map((item) => (
                <div
                  key={item}
                  className="border rounded-lg px-4 py-4 flex items-start gap-3"
                  style={{ borderColor: cardBord, backgroundColor: cardBg }}
                >
                  <span className="mt-1 w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
                  <span className="text-sm font-semibold leading-snug" style={{ color: cardText }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-16" style={{ backgroundColor: bg }}>
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-[0.15em] mb-8 text-center" style={{ color: textMut }}>
              how it works
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { step: "01", label: "sign in with your account" },
                { step: "02", label: "share your portfolio link or file" },
                { step: "03", label: "answer a few quick questions" },
                { step: "04", label: "get your report in 5–7 days" },
              ].map(({ step, label }) => (
                <div key={step} className="flex flex-col gap-2">
                  <span className="font-extrabold text-2xl" style={{ color: accent }}>{step}</span>
                  <span className="text-sm leading-snug" style={{ color: textSub }}>{label}</span>
                </div>
              ))}
            </div>
            <div
              className="mt-10 border rounded-lg px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              style={{ borderColor: cardBord, backgroundColor: cardBg }}
            >
              <p className="text-sm leading-relaxed" style={{ color: cardText }}>
                Keep your link or file ready, and add a short note about what
                you want feedback on. The more context you give, the sharper the
                review can be.
              </p>
              <button
                onClick={handleCTA}
                className="font-bold px-5 py-3 rounded-lg transition-opacity hover:opacity-90 md:flex-shrink-0"
                style={{ backgroundColor: accent, color: "#fff" }}
              >
                start review
              </button>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer
          className="px-6 py-5 flex items-center justify-between border-t text-xs"
          style={{ borderColor: border, color: footerText }}
        >
          <span>Anant National University × evolve</span>
          <span>powered by evolvedesign.academy</span>
        </footer>
      </div>
    </>
  );
}
