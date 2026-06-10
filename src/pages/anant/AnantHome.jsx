import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { anant_logo } from "../../assets/images/community";
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
