import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { callAdminApi, fetchMyAnuStudent } from "../../supabaseAdminClient";
import { anant_logo } from "../../assets/images/Community";

const NAV_BG    = "#060c17";
const NAV_BORD  = "#0d1f3c";
const ACCENT    = "#2563eb";
const ANU_ORIGIN = "https://anu.evolvedesign.academy";
const REDIRECT  = `${ANU_ORIGIN}/portfolio-review/form`;
async function sendSignInEmail(toEmail) {
  await fetch("/api/send-person-invite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: toEmail, role: "student" })
  });
}

export default function AnantSignIn() {
  const navigate = useNavigate();
  const [step,      setStep]     = useState("email"); // email | sending | sent
  const [email,     setEmail]    = useState("");
  const [error,     setError]    = useState("");
  const [countdown, setCountdown] = useState(0);

  // Redirect if already signed in — also stamps student on return via magic link
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        stampAndRedirect(session.user);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) stampAndRedirect(session.user);
    });
    return () => sub.subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function stampAndRedirect(authUser) {
    if (!authUser.email) return;
    // also stamps auth_user_id + invite_accepted_at on first arrival
    const data = await fetchMyAnuStudent();
    if (!data) return; // not a student — don't redirect to student form
    sessionStorage.setItem("anu_student_cache", JSON.stringify(data));
    navigate("/portfolio-review/form", { replace: true });
  }

  async function handleSend() {
    const addr = email.trim().toLowerCase();
    if (!addr) return;
    setError(""); setStep("sending");

    // Whitelist check (the student's details are cached after sign-in)
    const check = await callAdminApi({ op: "anu_student_check", email: addr });

    if (check.error) {
      console.error("anu_student_check error:", check.error);
      setError(`Something went wrong: ${check.error.message}`);
      setStep("email"); return;
    }

    if (!check.exists) {
      setError("This email is not registered. Please use your ANU email address.");
      setStep("email"); return;
    }

    await sendSignInEmail(addr);
    setStep("sent");
    startCountdown();
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

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 gap-10">
        {/* large centred heading — always visible regardless of step */}
        <h1
          className="font-extrabold text-white text-center w-full"
          style={{ fontSize: "clamp(32px, 8vw, 64px)", letterSpacing: "-0.03em", lineHeight: 1.1 }}
        >
          portfolio review portal
        </h1>

        <div className="w-full max-w-sm flex flex-col gap-5">

          {/* ── email step ── */}
          {(step === "email" || step === "sending") && (
            <>
              <div>
                <p className="font-extrabold text-white" style={{ fontSize: 28, letterSpacing: "-0.04em" }}>
                  sign in
                </p>
                <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                  enter your ANU email — we'll send you a sign-in link.
                </p>
              </div>
              <input
                type="email"
                placeholder="yourname@anu.edu.in"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && email.trim() && step === "email" && handleSend()}
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
              <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
                only ANU students can sign in here
              </p>
            </>
          )}

          {/* ── sent step ── */}
          {step === "sent" && (
            <>
              {/* envelope icon */}
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
                <h1 className="font-extrabold text-white" style={{ fontSize: 28, letterSpacing: "-0.03em" }}>
                  check your email
                </h1>
                <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                  we sent a sign-in link to
                </p>
                <p className="text-sm font-semibold mt-0.5 text-white">{email}</p>
                <p className="text-sm mt-3" style={{ color: "rgba(255,255,255,0.4)" }}>
                  click the link in the email to sign in — you'll land straight on your portfolio review page.
                </p>
              </div>
              <p className="text-center text-sm">
                {countdown > 0
                  ? <span style={{ color: "rgba(255,255,255,0.25)" }}>resend in {countdown}s</span>
                  : <button onClick={handleSend} style={{ color: "#60a5fa" }} className="underline underline-offset-2">resend link</button>
                }
              </p>
              <button
                onClick={() => { setStep("email"); setError(""); }}
                className="text-xs text-center w-full"
                style={{ color: "rgba(255,255,255,0.2)" }}
              >
                use a different email →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
