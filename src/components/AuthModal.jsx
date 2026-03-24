import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { sendOtp, verifyOtp, signInWithGoogle } from "../auth/signInLogic";

/**
 * AuthModal
 * ─────────
 * Two-step sign-in modal:
 *   Step 1 → name + email → "get otp" button + "continue with google"
 *   Step 2 → 6-digit OTP entry
 *
 * Props:
 *   isOpen   — boolean
 *   onClose  — called when user closes or successfully signs in
 *   user     — current user (so we can auto-close when login succeeds)
 */
const AuthModal = ({ isOpen, onClose, user }) => {
  const [step, setStep]       = useState(1); // 1 = form, 2 = otp
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [otp, setOtp]         = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  // auto-close when user logs in successfully
  useEffect(() => {
    if (user && isOpen) onClose();
  }, [user, isOpen]);

  // reset state every time modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setName("");
      setEmail("");
      setOtp("");
      setError("");
      setLoading(false);
    }
  }, [isOpen]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim())  return setError("please enter your name.");
    if (!email.trim()) return setError("please enter your email.");

    setLoading(true);
    try {
      await sendOtp(name.trim(), email.trim().toLowerCase());
      setStep(2);
    } catch (err) {
      setError(err.message || "couldn't send otp. try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (otp.trim().length < 6) return setError("enter the 6-digit code.");

    setLoading(true);
    try {
      await verifyOtp(email.trim().toLowerCase(), otp.trim());
      // onAuthStateChange in useAuth fires → user gets set → useEffect above closes modal
    } catch (err) {
      setError(err.message || "invalid or expired code. try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle(); // redirects — modal will unmount naturally
    } catch (err) {
      setError(err.message || "google sign-in failed. try again.");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const modal = (
    <>
      {/* overlay */}
      <div
        className="fixed inset-0 z-[9990] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* card */}
      <div
        className="
          fixed z-[9991]
          top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[92vw] max-w-[460px]
          bg-evolve-yellow
          border-2 border-black
          rounded-2xl
          px-7 py-8
          shadow-[8px_8px_0px_rgba(0,0,0,0.25)]
        "
      >
        {/* close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-5 text-black text-2xl font-extrabold leading-none"
          aria-label="close"
        >
          ×
        </button>

        {step === 1 ? (
          <>
            {/* ─── STEP 1: name + email ─── */}
            <h2
              className="text-black font-extrabold lowercase"
              style={{ fontSize: "clamp(24px, 5vw, 32px)", lineHeight: 1 }}
            >
              join evolve.
            </h2>
            <p
              className="text-black font-normal lowercase mt-2"
              style={{ fontSize: "15px", lineHeight: 1.45 }}
            >
              sign in to save your progress and apply for mentorship.
            </p>

            <form onSubmit={handleSendOtp} className="mt-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-black text-[13px] font-semibold lowercase">
                  your name
                </label>
                <input
                  type="text"
                  placeholder="e.g. priya sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="
                    w-full border-2 border-black rounded-lg
                    bg-white text-black lowercase
                    px-4 py-3 text-[16px]
                    outline-none focus:ring-2 focus:ring-black
                    placeholder:text-gray-400
                  "
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-black text-[13px] font-semibold lowercase">
                  email address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="
                    w-full border-2 border-black rounded-lg
                    bg-white text-black
                    px-4 py-3 text-[16px]
                    outline-none focus:ring-2 focus:ring-black
                    placeholder:text-gray-400
                  "
                />
              </div>

              {error && (
                <p className="text-red-600 text-[13px] font-normal lowercase">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="
                  w-full bg-black text-evolve-yellow
                  font-extrabold lowercase text-[18px]
                  rounded-lg py-3
                  flex items-center justify-center gap-2
                  transition-opacity duration-150
                  disabled:opacity-50
                "
              >
                {loading ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-evolve-yellow border-t-transparent rounded-full" />
                    sending…
                  </>
                ) : (
                  "get otp →"
                )}
              </button>
            </form>

            {/* divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-[1px] bg-black/30" />
              <span className="text-black/50 text-[13px] lowercase">or</span>
              <div className="flex-1 h-[1px] bg-black/30" />
            </div>

            {/* Google button */}
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="
                w-full bg-white text-black
                border-2 border-black
                font-semibold lowercase text-[16px]
                rounded-lg py-3
                flex items-center justify-center gap-3
                transition-opacity duration-150
                disabled:opacity-50
              "
            >
              {/* Google "G" logo */}
              <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              continue with google
            </button>
          </>
        ) : (
          <>
            {/* ─── STEP 2: OTP ─── */}
            <button
              onClick={() => { setStep(1); setError(""); setOtp(""); }}
              className="flex items-center gap-1 text-black/60 text-[13px] font-normal lowercase mb-5 hover:text-black transition-colors"
            >
              ← back
            </button>

            <h2
              className="text-black font-extrabold lowercase"
              style={{ fontSize: "clamp(22px, 5vw, 28px)", lineHeight: 1.1 }}
            >
              check your inbox.
            </h2>
            <p
              className="text-black font-normal lowercase mt-2"
              style={{ fontSize: "15px", lineHeight: 1.45 }}
            >
              we sent a 6-digit code to{" "}
              <span className="font-semibold">{email}</span>.
            </p>

            <form onSubmit={handleVerifyOtp} className="mt-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-black text-[13px] font-semibold lowercase">
                  one-time code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  autoFocus
                  className="
                    w-full border-2 border-black rounded-lg
                    bg-white text-black text-center
                    px-4 py-4 text-[28px] font-extrabold tracking-[0.4em]
                    outline-none focus:ring-2 focus:ring-black
                    placeholder:text-gray-300 placeholder:tracking-normal placeholder:text-[18px] placeholder:font-normal
                  "
                />
              </div>

              {error && (
                <p className="text-red-600 text-[13px] font-normal lowercase">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="
                  w-full bg-black text-evolve-yellow
                  font-extrabold lowercase text-[18px]
                  rounded-lg py-3
                  flex items-center justify-center gap-2
                  transition-opacity duration-150
                  disabled:opacity-50
                "
              >
                {loading ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-evolve-yellow border-t-transparent rounded-full" />
                    verifying…
                  </>
                ) : (
                  "verify →"
                )}
              </button>

              <p className="text-black/50 text-[13px] lowercase text-center">
                didn't get it?{" "}
                <button
                  type="button"
                  onClick={() => { setError(""); sendOtp(name, email).catch(() => {}); }}
                  className="underline text-black hover:opacity-60 transition-opacity"
                >
                  resend code
                </button>
              </p>
            </form>
          </>
        )}
      </div>
    </>
  );

  return ReactDOM.createPortal(modal, document.body);
};

export default AuthModal;
