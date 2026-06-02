import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { sendOtp, verifyOtp, signInWithGoogle, signInWithLinkedIn } from "../auth/signInLogic";
import { useAuth } from "../hooks/useAuth";
import BlackNav from "../components/BlackNav";
import { evolve_cube } from "../assets/images/Home";

/* ─── Google icon ─────────────────────────────────────────────────────────── */
const GOOGLE_ICON = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M19.6 10.23c0-.68-.06-1.36-.18-2H10v3.79h5.4a4.62 4.62 0 0 1-2 3.03v2.52h3.23C18.4 16 19.6 13.32 19.6 10.23Z" fill="#4285F4"/>
    <path d="M10 20c2.7 0 4.97-.9 6.63-2.43l-3.23-2.52c-.9.6-2.04.96-3.4.96-2.61 0-4.82-1.76-5.61-4.13H1.07v2.6A10 10 0 0 0 10 20Z" fill="#34A853"/>
    <path d="M4.39 11.88A6.01 6.01 0 0 1 4.07 10c0-.65.11-1.28.31-1.88V5.52H1.07A10 10 0 0 0 0 10c0 1.61.38 3.13 1.07 4.48l3.32-2.6Z" fill="#FBBC05"/>
    <path d="M10 3.96c1.47 0 2.8.5 3.84 1.5l2.87-2.87A9.94 9.94 0 0 0 10 0 10 10 0 0 0 1.07 5.52l3.32 2.6C5.18 5.72 7.39 3.96 10 3.96Z" fill="#EA4335"/>
  </svg>
);

/* ─── Back button ─────────────────────────────────────────────────────────── */
function BackBtn({ onBack }) {
  return (
    <button onClick={onBack} className="flex items-center gap-1.5 text-evolve-yellow w-fit">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M12.5 15L7.5 10L12.5 5" stroke="#FFD007" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span className="text-sm font-semibold">back</span>
    </button>
  );
}

/* ─── Floating cube ───────────────────────────────────────────────────────── */
function FloatCube() {
  return (
    <motion.img
      src={evolve_cube}
      alt=""
      className="w-16 h-16 md:w-20 md:h-20"
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

/* ─── Loading layout ──────────────────────────────────────────────────────── */
function LoadingStep({ label, sub, progress }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-8 px-6">
      <FloatCube />
      <div className="w-full max-w-xs space-y-4 text-center">
        <p className="text-evolve-yellow font-semibold text-base md:text-lg">{label}</p>
        <p className="text-white text-sm md:text-base">{sub}</p>
        <div className="w-full h-1 rounded-full bg-white/20 overflow-hidden">
          <div className="h-full rounded-full bg-evolve-yellow transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   Helpers
══════════════════════════════════════════════════════════════════════════════ */
function goToFrom(navigate, from) {
  // Payment page shows its own welcome in the gift screen — skip the overlay
  // Portfolio review form handles its own post-signin flow — skip the overlay
  const skipOverlay =
    from.startsWith("/payment") ||
    from.startsWith("/community/portfolio-review");
  if (!skipOverlay) {
    sessionStorage.setItem("show_welcome_overlay", "1");
  }
  localStorage.removeItem("signin_from");
  sessionStorage.removeItem("signin_from");
  navigate(from, { replace: true });
}

/* ══════════════════════════════════════════════════════════════════════════════
   SignIn page
══════════════════════════════════════════════════════════════════════════════ */
export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();

  const from = localStorage.getItem("signin_from") || sessionStorage.getItem("signin_from") || location.state?.from || "/";

  const { user, authLoading } = useAuth();

  const [step,      setStep]      = useState("options");
  const [name,      setName]      = useState("");
  const [email,     setEmail]     = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [error,     setError]     = useState("");
  const [progress,  setProgress]  = useState(0);
  const [countdown, setCountdown] = useState(30);

  const otp0 = useRef(); const otp1 = useRef(); const otp2 = useRef();
  const otp3 = useRef(); const otp4 = useRef(); const otp5 = useRef();
  const otpRefs = [otp0, otp1, otp2, otp3, otp4, otp5];

  /* ── user loaded → handle Google OAuth return OR already-logged-in ──────── */
  useEffect(() => {
    if (authLoading || !user) return;

    // Already signed in before reaching /signin → just redirect, no welcome
    if (step === "options" || step === "email-form") {
      localStorage.removeItem("signin_from");
      sessionStorage.removeItem("signin_from");
      navigate(from, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  /* ── email OTP verified → navigate to `from` (overlay shown by App) ─────── */
  useEffect(() => {
    if (user && (step === "verifying" || step === "sending")) {
      setProgress(100);
      setTimeout(() => goToFrom(navigate, from), 400);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /* ── progress bar ───────────────────────────────────────────────────────── */
  useEffect(() => {
    if (step !== "sending" && step !== "verifying") return;
    setProgress(0);
    const iv = setInterval(() => {
      setProgress(p => { if (p >= 85) { clearInterval(iv); return p; } return p + 3; });
    }, 80);
    return () => clearInterval(iv);
  }, [step]);

  /* ── resend countdown ───────────────────────────────────────────────────── */
  useEffect(() => {
    if (step !== "otp") return;
    setCountdown(30);
    const iv = setInterval(() => {
      setCountdown(c => { if (c <= 1) { clearInterval(iv); return 0; } return c - 1; });
    }, 1000);
    return () => clearInterval(iv);
  }, [step]);

  /* ── focus first OTP box ────────────────────────────────────────────────── */
  useEffect(() => {
    if (step === "otp") setTimeout(() => otp0.current?.focus(), 100);
  }, [step]);

  /* ─── handlers ──────────────────────────────────────────────────────────── */
  async function handleSendOtp() {
    setError("");
    setStep("sending");
    try {
      await sendOtp(name.trim(), email.trim().toLowerCase());
      setStep("otp");
    } catch (e) {
      setError(e.message || "Failed to send code. Try again.");
      setStep("email-form");
    }
  }

  async function handleVerifyOtp() {
    const token = otpDigits.join("");
    if (token.length < 6) return;
    setError("");
    setStep("verifying");
    try {
      await verifyOtp(email.trim().toLowerCase(), token);
    } catch (e) {
      setError(e.message || "Invalid code. Please try again.");
      setStep("otp");
    }
  }

  async function handleLinkedInSignIn() {
    const skipOverlay =
      from.startsWith("/payment") ||
      from.startsWith("/community/portfolio-review");
    if (!skipOverlay) {
      localStorage.setItem("show_welcome_overlay", "1");
    }
    localStorage.removeItem("signin_from");
    sessionStorage.removeItem("signin_from");
    try {
      await signInWithLinkedIn(from);
    } catch (e) {
      localStorage.removeItem("show_welcome_overlay");
      setError(e.message || "LinkedIn sign-in failed.");
    }
  }

  async function handleGoogleSignIn() {
    // Redirect directly to `from` — avoids double-redirect that breaks OAuth state on mobile
    const skipOverlay =
      from.startsWith("/payment") ||
      from.startsWith("/community/portfolio-review");
    if (!skipOverlay) {
      localStorage.setItem("show_welcome_overlay", "1");
    }
    localStorage.removeItem("signin_from");
    sessionStorage.removeItem("signin_from");
    try {
      await signInWithGoogle(from);
    } catch (e) {
      localStorage.removeItem("show_welcome_overlay");
      setError(e.message || "Google sign-in failed.");
    }
  }

  function handleOtpInput(idx, val) {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next  = [...otpDigits];
    next[idx]   = digit;
    setOtpDigits(next);
    if (digit && idx < 5) otpRefs[idx + 1].current?.focus();
  }

  function handleOtpKey(idx, e) {
    if (e.key === "Backspace" && !otpDigits[idx] && idx > 0) otpRefs[idx - 1].current?.focus();
    if (e.key === "Enter") handleVerifyOtp();
  }

  function handleOtpPaste(e) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const next = [...otpDigits];
    text.split("").forEach((d, i) => { next[i] = d; });
    setOtpDigits(next);
    otpRefs[Math.min(text.length, 5)].current?.focus();
  }

  async function handleResend() {
    if (countdown > 0) return;
    setError("");
    try {
      await sendOtp(name.trim(), email.trim().toLowerCase());
      setOtpDigits(["", "", "", "", "", ""]);
      setCountdown(30);
      const iv = setInterval(() => {
        setCountdown(c => { if (c <= 1) { clearInterval(iv); return 0; } return c - 1; });
      }, 1000);
      otp0.current?.focus();
    } catch (e) { setError(e.message || "Failed to resend."); }
  }

  function goBack() {
    if (step === "options")    return navigate(-1);
    if (step === "email-form") return setStep("options");
    if (step === "otp")        return setStep("email-form");
  }

  const showBack = ["options", "email-form", "otp"].includes(step);

  const inputCls   = "w-full border border-white/15 rounded-2xl px-5 py-4 text-white placeholder-white/30 text-base outline-none focus:border-evolve-yellow/60 transition-colors";
  const inputStyle = { backgroundColor: "rgba(255,255,255,0.06)" };

  /* ═══════════════════════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#161618" }}>
      <BlackNav onLogoClick={() => navigate("/")} />

      {/* OPTIONS */}
      {step === "options" && (
        <div className="flex flex-col flex-1 px-6 pt-24 pb-10 md:items-center md:justify-center md:pt-0">
          <div className="w-full max-w-sm md:max-w-md mx-auto flex flex-col gap-5">
            {showBack && <BackBtn onBack={goBack} />}
            <h1 className="text-white font-bold leading-tight" style={{ fontSize: 40, letterSpacing: "-0.16px" }}>
              let's sign you in.
            </h1>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold text-base rounded-2xl py-4 active:opacity-80"
              >
                {GOOGLE_ICON}
                continue with google
              </button>
              <button
                onClick={handleLinkedInSignIn}
                className="w-full flex items-center justify-center gap-3 bg-[#0A66C2] text-white font-semibold text-base rounded-2xl py-4 active:opacity-80"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M16.667 1.667H3.333A1.667 1.667 0 0 0 1.667 3.333v13.334A1.667 1.667 0 0 0 3.333 18.333h13.334A1.667 1.667 0 0 0 18.333 16.667V3.333A1.667 1.667 0 0 0 16.667 1.667ZM6.667 15H4.167V7.917h2.5V15ZM5.417 6.875a1.458 1.458 0 1 1 0-2.917 1.458 1.458 0 0 1 0 2.917ZM15.833 15h-2.5v-3.542c0-.833-.015-1.916-1.166-1.916-1.167 0-1.334.908-1.334 1.85V15H8.333V7.917h2.4v.983h.034c.333-.633 1.15-1.3 2.366-1.3 2.534 0 3 1.667 3 3.834V15Z"/>
                </svg>
                continue with linkedin
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/20" />
              <span className="text-white/40 text-sm whitespace-nowrap">or sign in with your email</span>
              <div className="flex-1 h-px bg-white/20" />
            </div>
            <button
              onClick={() => setStep("email-form")}
              className="w-full flex items-center justify-center gap-2 border border-white/20 text-white font-semibold text-base rounded-2xl py-4 active:opacity-80"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M1.5 4.5A1.5 1.5 0 0 1 3 3h12a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 15 15H3A1.5 1.5 0 0 1 1.5 13.5v-9Z" stroke="white" strokeWidth="1.3"/>
                <path d="M1.5 4.5 9 9.75 16.5 4.5" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              sign in with email
            </button>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <p className="text-white/25 text-xs text-center">
              by signing in, you agree to our terms of service and privacy policy.
            </p>
          </div>
        </div>
      )}

      {/* EMAIL FORM */}
      {step === "email-form" && (
        <div className="flex flex-col flex-1 px-6 pt-24 pb-10 md:items-center md:justify-center md:pt-0">
          <div className="w-full max-w-sm md:max-w-md mx-auto flex flex-col gap-5">
            {showBack && <BackBtn onBack={goBack} />}
            <h1 className="text-white font-bold leading-tight" style={{ fontSize: 40, letterSpacing: "-0.16px" }}>
              what's your name &amp; email?
            </h1>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="your name"
                value={name}
                onChange={e => setName(e.target.value)}
                className={inputCls}
                style={inputStyle}
              />
              <input
                type="email"
                placeholder="your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && name.trim() && email.trim() && handleSendOtp()}
                className={inputCls}
                style={inputStyle}
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              onClick={handleSendOtp}
              disabled={!name.trim() || !email.trim()}
              className="w-full flex items-center justify-center gap-2 bg-evolve-yellow text-evolve-black font-bold text-base rounded-2xl py-4 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity active:scale-[0.98]"
            >
              send code
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3.75 9h10.5M9.75 4.5 14.25 9l-4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <p className="text-white/30 text-xs text-center">we'll send a 6-digit code to your email.</p>
          </div>
        </div>
      )}

      {/* SENDING */}
      {step === "sending" && <LoadingStep label="sending your code..." sub={email} progress={progress} />}

      {/* OTP */}
      {step === "otp" && (
        <div className="flex flex-col flex-1 px-6 pt-24 pb-10 md:items-center md:justify-center md:pt-0">
          <div className="w-full max-w-sm md:max-w-md mx-auto flex flex-col gap-5">
            {showBack && <BackBtn onBack={goBack} />}
            <div>
              <h1 className="text-white font-bold leading-tight" style={{ fontSize: 40, letterSpacing: "-0.16px" }}>
                check your email.
              </h1>
              <p className="text-white/50 text-sm mt-2">
                we sent a 6-digit code to <span className="text-white">{email}</span>
              </p>
            </div>
            <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
              {otpDigits.map((d, i) => (
                <input
                  key={i}
                  ref={otpRefs[i]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => handleOtpInput(i, e.target.value)}
                  onKeyDown={e => handleOtpKey(i, e)}
                  className="flex-1 aspect-square text-center text-white text-2xl font-bold rounded-xl border outline-none transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    borderColor: d ? "rgba(255,208,7,0.8)" : "rgba(255,255,255,0.15)",
                    maxWidth: 52
                  }}
                />
              ))}
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              onClick={handleVerifyOtp}
              disabled={otpDigits.join("").length < 6}
              className="w-full flex items-center justify-center gap-2 bg-evolve-yellow text-evolve-black font-bold text-base rounded-2xl py-4 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity active:scale-[0.98]"
            >
              confirm
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3.75 9h10.5M9.75 4.5 14.25 9l-4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <p className="text-center text-sm">
              {countdown > 0 ? (
                <span className="text-white/30">resend in {countdown}s</span>
              ) : (
                <button onClick={handleResend} className="text-evolve-yellow underline underline-offset-2">
                  resend code
                </button>
              )}
            </p>
          </div>
        </div>
      )}

      {/* VERIFYING */}
      {step === "verifying" && <LoadingStep label="verifying your code..." sub={email} progress={progress} />}
    </div>
  );
}
