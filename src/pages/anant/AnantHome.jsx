import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function AnantHome() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCTA = () => {
    if (user) {
      navigate("/community/portfolio-review/form");
    } else {
      sessionStorage.setItem("post_signin_redirect", "/community/portfolio-review/form");
      navigate("/signin");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col font-bricolage"
      style={{ backgroundColor: "#0a0a0a", color: "#fff" }}
    >
      {/* ── Nav ── */}
      <header
        className="flex items-center justify-between px-6 py-5 border-b"
        style={{ borderColor: "#1a1a1a" }}
      >
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-lg tracking-tight" style={{ color: "#FFD007" }}>
            anant
          </span>
          <span className="text-white/20">×</span>
          <span className="font-extrabold text-lg tracking-tight text-white">
            evolve
          </span>
        </div>

        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/50">{user.name || user.email}</span>
            <button
              onClick={() => navigate("/community/portfolio-review/form")}
              className="text-sm font-bold px-4 py-2 rounded-xl"
              style={{ backgroundColor: "#FFD007", color: "#000" }}
            >
              my review
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate("/signin")}
            className="text-sm font-bold px-4 py-2 rounded-xl border"
            style={{ borderColor: "#333", color: "#fff" }}
          >
            sign in
          </button>
        )}
      </header>

      {/* ── Hero ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <p
          className="text-xs font-bold uppercase tracking-[0.2em] mb-6"
          style={{ color: "#FFD007" }}
        >
          anant national university × evolve
        </p>

        <h1
          className="font-extrabold lowercase leading-none mb-6"
          style={{
            fontSize: "clamp(40px, 8vw, 88px)",
            letterSpacing: "-0.03em",
            maxWidth: "14ch"
          }}
        >
          get your portfolio reviewed
        </h1>

        <p
          className="font-normal leading-relaxed mb-10"
          style={{
            fontSize: "clamp(16px, 2.2vw, 22px)",
            color: "rgba(255,255,255,0.55)",
            maxWidth: "48ch"
          }}
        >
          real, personalised feedback on your design portfolio — from working
          designers. no fluff, no generic tips. just honest, actionable notes
          to help you move forward.
        </p>

        <button
          onClick={handleCTA}
          className="font-extrabold lowercase px-8 py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            backgroundColor: "#FFD007",
            color: "#000",
            fontSize: "clamp(15px, 1.8vw, 18px)",
            boxShadow: "4px 4px 0 0 rgba(255,208,7,0.3)"
          }}
        >
          submit your portfolio →
        </button>

        <p className="mt-4 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
          feedback within 5–7 working days · free for anant students
        </p>
      </main>

      {/* ── What we look at ── */}
      <section
        className="px-6 py-16 border-t"
        style={{ borderColor: "#1a1a1a", backgroundColor: "#0d0d0d" }}
      >
        <div className="max-w-3xl mx-auto">
          <p
            className="text-xs font-bold uppercase tracking-[0.15em] mb-8 text-center"
            style={{ color: "#555" }}
          >
            what you'll get feedback on
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "portfolio structure & flow", color: "#FFD007" },
              { label: "how you're positioning yourself", color: "#DF0586" },
              { label: "what's working in your work", color: "#22c55e" },
              { label: "what to fix before you send it out", color: "#A35BFB" },
            ].map(({ label, color }) => (
              <div
                key={label}
                className="flex items-center gap-3 px-5 py-4 rounded-2xl border"
                style={{ borderColor: "#1a1a1a", backgroundColor: "#111" }}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm font-semibold lowercase text-white/70">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="px-6 py-16" style={{ backgroundColor: "#0a0a0a" }}>
        <div className="max-w-3xl mx-auto">
          <p
            className="text-xs font-bold uppercase tracking-[0.15em] mb-8 text-center"
            style={{ color: "#555" }}
          >
            how it works
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: "01", label: "sign in with your account" },
              { step: "02", label: "share your portfolio link or file" },
              { step: "03", label: "answer a few quick questions" },
              { step: "04", label: "get your report in 5–7 days" },
            ].map(({ step, label }) => (
              <div key={step} className="flex flex-col gap-2">
                <span
                  className="font-extrabold text-2xl"
                  style={{ color: "#FFD007" }}
                >
                  {step}
                </span>
                <span className="text-sm text-white/50 lowercase leading-snug">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="px-6 py-6 flex items-center justify-between border-t text-xs"
        style={{ borderColor: "#1a1a1a", color: "#333" }}
      >
        <span>anant × evolve portfolio review</span>
        <span>powered by evolvedesign.academy</span>
      </footer>
    </div>
  );
}
