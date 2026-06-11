import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { supabaseAdmin } from "../../supabaseAdminClient";
import { anant_logo } from "../../assets/images/Community";

const NAV_BG   = "#060c17";
const NAV_BORD = "#0d1f3c";
const ACCENT   = "#2563eb";
const REDIRECT = `${window.location.origin}/admin/dashboard`;

export default function AnantAdminLogin() {
  const navigate = useNavigate();

  // mode: "email" (faculty/uni-admin OTP) or "pin" (evolve super-admin)
  const [mode,    setMode]    = useState("email");
  const [step,    setStep]    = useState("input"); // input | sending | sent
  const [email,   setEmail]   = useState("");
  const [pin,     setPin]     = useState("");
  const [error,   setError]   = useState("");
  const [countdown, setCountdown] = useState(0);

  const evolvePin = import.meta.env.VITE_ADMIN_PIN;
  const anantPin  = import.meta.env.VITE_ANANT_ADMIN_PIN;

  // If PIN session or Supabase session already valid, skip login
  useEffect(() => {
    if (sessionStorage.getItem("admin_access") === "true") {
      navigate("/admin/dashboard", { replace: true }); return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) navigate("/admin/dashboard", { replace: true });
    });
  }, [navigate]);

  /* ── email mode — sends a magic link ── */
  async function handleSend() {
    const addr = email.trim().toLowerCase();
    if (!addr) return;
    setError(""); setStep("sending");

    // Whitelist check
    const [{ data: faculty }, { data: admin }] = await Promise.all([
      supabaseAdmin.from("anu_faculty").select("id").eq("anu_email", addr).maybeSingle(),
      supabaseAdmin.from("anu_admins").select("id").eq("anu_email", addr).maybeSingle()
    ]);

    if (!faculty && !admin) {
      setError("This email is not registered as faculty or admin.");
      setStep("input"); return;
    }

    const { error: otpErr } = await supabase.auth.signInWithOtp({
      email: addr,
      options: { shouldCreateUser: true, emailRedirectTo: REDIRECT }
    });

    if (otpErr) { setError(otpErr.message); setStep("input"); return; }
    setStep("sent");
    startCountdown();
  }

  /* ── PIN mode ── */
  function handlePinSubmit(e) {
    e.preventDefault();
    const entered = pin.trim();
    if ((evolvePin && entered === String(evolvePin)) ||
        (anantPin  && entered === String(anantPin))) {
      sessionStorage.setItem("admin_access", "true");
      sessionStorage.setItem("admin_tenant", "anant");
      sessionStorage.removeItem("anu_role");
      navigate("/admin/dashboard"); return;
    }
    setError("Wrong PIN.");
  }

  function startCountdown() {
    setCountdown(60);
    const iv = setInterval(() =>
      setCountdown(c => { if (c <= 1) { clearInterval(iv); return 0; } return c - 1; }), 1000);
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#060c17" }}>
      {/* nav */}
      <header className="flex items-center px-6 border-b" style={{ height: "64px", borderColor: NAV_BORD, background: NAV_BG }}>
        <button onClick={() => navigate("/")} className="focus:outline-none">
          <img src={anant_logo} alt="Anant National University" className="h-10 w-auto object-contain" />
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm flex flex-col gap-5">

          {/* ══ EMAIL MODE ══ */}
          {mode === "email" && (
            <>
              {/* input step */}
              {(step === "input" || step === "sending") && (
                <>
                  <div>
                    <h1 className="font-extrabold text-white" style={{ fontSize: 32, letterSpacing: "-0.04em" }}>
                      faculty access
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
                      enter your ANU email — we'll send you a sign-in link.
                    </p>
                  </div>
                  <input
                    type="email"
                    placeholder="yourname@anu.edu.in"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && email.trim() && step === "input" && handleSend()}
                    className="w-full rounded-2xl px-5 py-4 text-white text-base outline-none border"
                    style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.12)" }}
                    autoFocus
                  />
                  {error && <p className="text-red-400 text-sm">{error}</p>}
                  <button
                    onClick={handleSend}
                    disabled={!email.trim() || step === "sending"}
                    className="w-full font-bold text-base rounded-2xl py-4 transition-opacity disabled:opacity-40"
                    style={{ background: ACCENT, color: "#fff" }}
                  >
                    {step === "sending" ? "checking…" : "send sign-in link"}
                  </button>
                </>
              )}

              {/* sent step */}
              {step === "sent" && (
                <>
                  <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.25)" }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                        <rect x="2" y="5" width="20" height="14" rx="2" stroke="#60a5fa" strokeWidth="1.8"/>
                        <path d="M2 7l10 7 10-7" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                    </div>
                  </div>
                  <div className="text-center">
                    <h1 className="font-extrabold text-white" style={{ fontSize: 26, letterSpacing: "-0.03em" }}>
                      check your email
                    </h1>
                    <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.45)" }}>
                      sign-in link sent to
                    </p>
                    <p className="text-sm font-semibold mt-0.5 text-white">{email}</p>
                    <p className="text-sm mt-3" style={{ color: "rgba(255,255,255,0.35)" }}>
                      click the link in the email — you'll land directly on the dashboard.
                    </p>
                  </div>
                  <p className="text-center text-sm">
                    {countdown > 0
                      ? <span style={{ color: "rgba(255,255,255,0.25)" }}>resend in {countdown}s</span>
                      : <button onClick={handleSend} style={{ color: "#60a5fa" }} className="underline underline-offset-2">resend link</button>
                    }
                  </p>
                  <button
                    onClick={() => { setStep("input"); setError(""); }}
                    className="text-xs text-center w-full"
                    style={{ color: "rgba(255,255,255,0.2)" }}
                  >
                    use a different email →
                  </button>
                </>
              )}

              {/* switch to PIN */}
              <div className="pt-2 border-t" style={{ borderColor: "#0d1f3c" }}>
                <button
                  onClick={() => { setMode("pin"); setError(""); }}
                  className="text-xs w-full text-center"
                  style={{ color: "rgba(255,255,255,0.2)" }}
                >
                  evolve admin access →
                </button>
              </div>
            </>
          )}

          {/* ══ PIN MODE ══ */}
          {mode === "pin" && (
            <>
              <button
                onClick={() => { setMode("email"); setPin(""); setError(""); }}
                className="flex items-center gap-1.5 text-sm font-semibold w-fit"
                style={{ color: "#60a5fa" }}
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M12.5 15L7.5 10L12.5 5" stroke="#60a5fa" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                back
              </button>
              <h1 className="font-extrabold text-white" style={{ fontSize: 32, letterSpacing: "-0.04em" }}>
                admin PIN
              </h1>
              <form onSubmit={handlePinSubmit} className="flex flex-col gap-4">
                <input
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  inputMode="numeric"
                  placeholder="••••"
                  className="w-full rounded-2xl px-5 py-4 text-white text-center text-2xl tracking-[0.3em] font-bold outline-none border"
                  style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.12)" }}
                  autoFocus
                />
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={pin.length < 4}
                  className="w-full font-bold text-base rounded-2xl py-4 transition-opacity disabled:opacity-40"
                  style={{ background: ACCENT, color: "#fff" }}
                >
                  continue
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
