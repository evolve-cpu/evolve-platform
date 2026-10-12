import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { callAdminApi, fetchAdminRole } from "../../supabaseAdminClient";
import { anant_logo } from "../../assets/images/Community";

const NAV_BG = "#060c17";
const NAV_BORD = "#0d1f3c";
const ACCENT = "#2563eb";
const ANU_ORIGIN = "https://anu.evolvedesign.academy";

export default function AnantAdminLogin() {
  const navigate = useNavigate();
  // Faculty, uni admins and Evolve admins (admin_users) all sign in with an
  // emailed link; api/admin.js checks the address and sends it. (The old
  // ?ea=1 PIN mode is gone: the PIN shipped in the public JS bundle.)
  const mode = "email";
  const [step, setStep] = useState("input"); // input | sending | sent
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Already signed in as staff / an Evolve admin → straight to the dashboard
  // (a student's session stays here instead of bouncing off the guard)
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return;
      const who = await fetchAdminRole();
      if (who.role) navigate("/admin/dashboard", { replace: true });
    });
  }, [navigate]);

  /* ── email mode — sends a magic link ── */
  async function handleSend() {
    const addr = email.trim().toLowerCase();
    if (!addr) return;
    setError("");
    setStep("sending");

    // whitelist check + link generation + email, all server-side
    const res = await callAdminApi({ op: "anant_staff_login", email: addr });
    if (!res.ok) {
      setError(res.error?.message || res.error || "Could not send the sign-in link. Please try again.");
      setStep("input");
      return;
    }

    setStep("sent");
    startCountdown();
  }

  function startCountdown() {
    setCountdown(60);
    const iv = setInterval(
      () =>
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(iv);
            return 0;
          }
          return c - 1;
        }),
      1000
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#060c17" }}
    >
      {/* nav */}
      <header
        className="flex items-center px-6 border-b"
        style={{ height: "64px", borderColor: NAV_BORD, background: NAV_BG }}
      >
        <button onClick={() => navigate("/")} className="focus:outline-none">
          <img
            src={anant_logo}
            alt="Anant National University"
            className="h-10 w-auto object-contain"
          />
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
                    <h1
                      className="font-extrabold text-white"
                      style={{ fontSize: 32, letterSpacing: "-0.04em" }}
                    >
                      admin access
                    </h1>
                    <p
                      className="text-sm mt-1"
                      style={{ color: "rgba(255,255,255,0.45)" }}
                    >
                      enter your ANU email — we'll send you a sign-in link.
                    </p>
                  </div>
                  <input
                    type="email"
                    placeholder="yourname@anu.edu.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      email.trim() &&
                      step === "input" &&
                      handleSend()
                    }
                    className="w-full rounded-2xl px-5 py-4 text-white text-base outline-none border"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      borderColor: "rgba(255,255,255,0.12)"
                    }}
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
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{
                        background: "rgba(37,99,235,0.12)",
                        border: "1px solid rgba(37,99,235,0.25)"
                      }}
                    >
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <rect
                          x="2"
                          y="5"
                          width="20"
                          height="14"
                          rx="2"
                          stroke="#60a5fa"
                          strokeWidth="1.8"
                        />
                        <path
                          d="M2 7l10 7 10-7"
                          stroke="#60a5fa"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="text-center">
                    <h1
                      className="font-extrabold text-white"
                      style={{ fontSize: 26, letterSpacing: "-0.03em" }}
                    >
                      check your email
                    </h1>
                    <p
                      className="text-sm mt-2"
                      style={{ color: "rgba(255,255,255,0.45)" }}
                    >
                      sign-in link sent to
                    </p>
                    <p className="text-sm font-semibold mt-0.5 text-white">
                      {email}
                    </p>
                    <p
                      className="text-sm mt-3"
                      style={{ color: "rgba(255,255,255,0.35)" }}
                    >
                      click the link in the email — you'll land directly on the
                      dashboard.
                    </p>
                  </div>
                  <p className="text-center text-sm">
                    {countdown > 0 ? (
                      <span style={{ color: "rgba(255,255,255,0.25)" }}>
                        resend in {countdown}s
                      </span>
                    ) : (
                      <button
                        onClick={handleSend}
                        style={{ color: "#60a5fa" }}
                        className="underline underline-offset-2"
                      >
                        resend link
                      </button>
                    )}
                  </p>
                  <button
                    onClick={() => {
                      setStep("input");
                      setError("");
                    }}
                    className="text-xs text-center w-full"
                    style={{ color: "rgba(255,255,255,0.2)" }}
                  >
                    use a different email →
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
