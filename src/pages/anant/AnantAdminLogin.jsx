import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { supabaseAdmin } from "../../supabaseAdminClient";
import { anant_logo } from "../../assets/images/Community";

const NAV_BG   = "#060c17";
const NAV_BORD = "#0d1f3c";
const ACCENT   = "#2563eb";

export default function AnantAdminLogin() {
  const navigate = useNavigate();

  // mode: "email" (faculty/uni-admin) or "pin" (evolve super-admin)
  const [mode,      setMode]      = useState("email");
  const [step,      setStep]      = useState("input"); // input | otp | sending | verifying
  const [email,     setEmail]     = useState("");
  const [digits,    setDigits]    = useState(["","","","","",""]);
  const [pin,       setPin]       = useState("");
  const [error,     setError]     = useState("");
  const [countdown, setCountdown] = useState(0);

  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const evolvePin  = import.meta.env.VITE_ADMIN_PIN;
  const anantPin   = import.meta.env.VITE_ANANT_ADMIN_PIN;

  // If PIN session already valid, go straight to dashboard
  useEffect(() => {
    if (sessionStorage.getItem("admin_access") === "true") {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  /* ── email mode ── */
  async function handleSendOtp() {
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

    const redirectTo = `${window.location.origin}/admin/dashboard`;
    const { error: otpErr } = await supabase.auth.signInWithOtp({
      email: addr,
      options: { shouldCreateUser: true, emailRedirectTo: redirectTo }
    });

    if (otpErr) { setError(otpErr.message); setStep("input"); return; }
    setStep("otp");
    startCountdown();
    setTimeout(() => refs[0].current?.focus(), 100);
  }

  async function handleVerifyOtp() {
    const token = digits.join("");
    if (token.length < 6) return;
    setError(""); setStep("verifying");
    const { error: vErr } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(), token, type: "email"
    });
    if (vErr) { setError(vErr.message || "Invalid code."); setStep("otp"); return; }
    // AnantAdminGuard will verify role on /admin/dashboard
    navigate("/admin/dashboard", { replace: true });
  }

  /* ── PIN mode ── */
  function handlePinSubmit(e) {
    e.preventDefault();
    const entered = pin.trim();
    if (evolvePin && entered === String(evolvePin)) {
      sessionStorage.setItem("admin_access", "true");
      sessionStorage.setItem("admin_tenant", "anant");
      sessionStorage.removeItem("anu_role");
      navigate("/admin/dashboard"); return;
    }
    if (anantPin && entered === String(anantPin)) {
      sessionStorage.setItem("admin_access", "true");
      sessionStorage.setItem("admin_tenant", "anant");
      sessionStorage.removeItem("anu_role");
      navigate("/admin/dashboard"); return;
    }
    setError("Wrong PIN.");
  }

  /* ── helpers ── */
  function startCountdown() {
    setCountdown(30);
    const iv = setInterval(() => setCountdown(c => { if (c <= 1) { clearInterval(iv); return 0; } return c - 1; }), 1000);
  }
  function handleDigit(i, val) {
    const d = val.replace(/\D/g, "").slice(-1);
    const next = [...digits]; next[i] = d; setDigits(next);
    if (d && i < 5) refs[i + 1].current?.focus();
  }
  function handleKey(i, e) {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs[i - 1].current?.focus();
    if (e.key === "Enter") handleVerifyOtp();
  }
  function handlePaste(e) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return; e.preventDefault();
    const next = [...digits];
    text.split("").forEach((d, i) => { next[i] = d; });
    setDigits(next);
    refs[Math.min(text.length, 5)].current?.focus();
  }

  const loading = step === "sending" || step === "verifying";

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
              {/* back button for OTP step */}
              {(step === "otp" || step === "verifying") && (
                <button
                  onClick={() => { setStep("input"); setDigits(["","","","","",""]); setError(""); }}
                  className="flex items-center gap-1.5 text-sm font-semibold w-fit"
                  style={{ color: "#60a5fa" }}
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <path d="M12.5 15L7.5 10L12.5 5" stroke="#60a5fa" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  back
                </button>
              )}

              {/* input step */}
              {(step === "input" || step === "sending") && (
                <>
                  <div>
                    <h1 className="font-extrabold text-white" style={{ fontSize: 32, letterSpacing: "-0.04em" }}>
                      faculty access
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
                      enter your ANU email to receive a sign-in link.
                    </p>
                  </div>
                  <input
                    type="email"
                    placeholder="yourname@anu.edu.in"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && email.trim() && !loading && handleSendOtp()}
                    className="w-full rounded-2xl px-5 py-4 text-white text-base outline-none border"
                    style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.12)" }}
                    autoFocus
                  />
                  {error && <p className="text-red-400 text-sm">{error}</p>}
                  <button
                    onClick={handleSendOtp}
                    disabled={!email.trim() || loading}
                    className="w-full font-bold text-base rounded-2xl py-4 transition-opacity disabled:opacity-40"
                    style={{ background: ACCENT, color: "#fff" }}
                  >
                    {loading ? "checking…" : "send code"}
                  </button>
                </>
              )}

              {/* otp step */}
              {(step === "otp" || step === "verifying") && (
                <>
                  <h1 className="font-extrabold text-white" style={{ fontSize: 32, letterSpacing: "-0.04em" }}>
                    check your email.
                  </h1>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
                    code sent to <span className="text-white">{email}</span>
                  </p>
                  <div className="flex gap-2 justify-between" onPaste={handlePaste}>
                    {digits.map((d, i) => (
                      <input
                        key={i} ref={refs[i]}
                        type="text" inputMode="numeric" maxLength={1} value={d}
                        onChange={e => handleDigit(i, e.target.value)}
                        onKeyDown={e => handleKey(i, e)}
                        className="flex-1 aspect-square text-center text-white text-2xl font-bold rounded-xl border outline-none"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          borderColor: d ? "rgba(37,99,235,0.8)" : "rgba(255,255,255,0.15)",
                          maxWidth: 52
                        }}
                      />
                    ))}
                  </div>
                  {error && <p className="text-red-400 text-sm">{error}</p>}
                  <button
                    onClick={handleVerifyOtp}
                    disabled={digits.join("").length < 6 || step === "verifying"}
                    className="w-full font-bold text-base rounded-2xl py-4 transition-opacity disabled:opacity-40"
                    style={{ background: ACCENT, color: "#fff" }}
                  >
                    {step === "verifying" ? "verifying…" : "confirm"}
                  </button>
                  <p className="text-center text-sm">
                    {countdown > 0
                      ? <span style={{ color: "rgba(255,255,255,0.3)" }}>resend in {countdown}s</span>
                      : <button onClick={handleSendOtp} style={{ color: "#60a5fa" }} className="underline underline-offset-2">resend code</button>
                    }
                  </p>
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
