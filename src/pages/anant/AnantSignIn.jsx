import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { supabaseAdmin } from "../../supabaseAdminClient";
import { anant_logo } from "../../assets/images/Community";

const NAV_BG   = "#060c17";
const NAV_BORD = "#0d1f3c";
const ACCENT   = "#2563eb";

export default function AnantSignIn() {
  const navigate   = useNavigate();
  const [step,    setStep]    = useState("email"); // email | otp | sending | verifying
  const [email,   setEmail]   = useState("");
  const [digits,  setDigits]  = useState(["","","","","",""]);
  const [error,   setError]   = useState("");
  const [countdown, setCountdown] = useState(0);

  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // redirect if already signed in
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user) navigate("/portfolio-review/form", { replace: true });
    });
    // stamp auth_user_id on sign-in event (invite accept)
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) {
        stampStudent(session.user);
        navigate("/portfolio-review/form", { replace: true });
      }
    });
    return () => sub.subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function stampStudent(authUser) {
    const { data } = await supabaseAdmin
      .from("anu_students")
      .select("id, auth_user_id")
      .eq("anu_email", authUser.email.toLowerCase())
      .maybeSingle();
    if (data && !data.auth_user_id) {
      await supabaseAdmin.from("anu_students").update({
        auth_user_id: authUser.id,
        invite_accepted_at: new Date().toISOString()
      }).eq("id", data.id);
    }
  }

  async function handleSendOtp() {
    const addr = email.trim().toLowerCase();
    if (!addr) return;
    setError(""); setStep("sending");

    // Whitelist check
    const { data: student } = await supabaseAdmin
      .from("anu_students")
      .select("id")
      .eq("anu_email", addr)
      .maybeSingle();

    if (!student) {
      setError("This email is not registered. Please use your ANU email address.");
      setStep("email"); return;
    }

    const { error: otpErr } = await supabase.auth.signInWithOtp({
      email: addr,
      options: { shouldCreateUser: true }
    });

    if (otpErr) { setError(otpErr.message); setStep("email"); return; }
    setStep("otp");
    startCountdown();
    setTimeout(() => refs[0].current?.focus(), 100);
  }

  async function handleVerify() {
    const token = digits.join("");
    if (token.length < 6) return;
    setError(""); setStep("verifying");
    const { error: vErr } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(), token, type: "email"
    });
    if (vErr) { setError(vErr.message || "Invalid code. Try again."); setStep("otp"); }
    // success → onAuthStateChange fires → redirect handled above
  }

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
    if (e.key === "Enter") handleVerify();
  }
  function handlePaste(e) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
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

          {/* back */}
          {(step === "otp" || step === "verifying") && (
            <button
              onClick={() => { setStep("email"); setDigits(["","","","","",""]); setError(""); }}
              className="flex items-center gap-1.5 text-sm font-semibold w-fit"
              style={{ color: "#60a5fa" }}
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="#60a5fa" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              back
            </button>
          )}

          {/* ── email step ── */}
          {(step === "email" || step === "sending") && (
            <>
              <h1 className="font-extrabold text-white" style={{ fontSize: 36, letterSpacing: "-0.04em" }}>
                sign in
              </h1>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                enter your ANU email address to receive a sign-in code.
              </p>
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

          {/* ── otp step ── */}
          {(step === "otp" || step === "verifying") && (
            <>
              <h1 className="font-extrabold text-white" style={{ fontSize: 36, letterSpacing: "-0.04em" }}>
                check your email.
              </h1>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                we sent a 6-digit code to{" "}
                <span className="text-white">{email}</span>
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
                onClick={handleVerify}
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

          <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
            only ANU students can sign in here
          </p>
        </div>
      </div>
    </div>
  );
}
