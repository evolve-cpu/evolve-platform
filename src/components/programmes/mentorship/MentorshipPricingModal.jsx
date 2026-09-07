import { useState } from "react";
import { supabase } from "../../../supabaseClient";
import { PLANS } from "./plans";

// Same list used by the Portfolio Review booking modal — duplicated locally
// rather than imported (that one's a private const) to keep this flow fully
// self-contained. Mentorship isn't reviewer-matched like Portfolio Review,
// so there's no waitlist branch here — stream is just collected, not gated.
const SUPPORTED_STREAMS = [
  "Visual Communication",
  "Interaction Design",
  "Industrial Design",
  "Moving Images",
  "Space Design",
  "Architecture",
  "Textile and Fashion Design"
];

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

/**
 * Stream + phone + payment modal for the individual mentorship flow — same
 * visual shell and step machine as PortfolioReviewProgramme's BookModal
 * (src/components/programmes/PortfolioReviewProgramme.jsx), pointed at the
 * new isolated mentorship_enrollments table via api/razorpay-create-order.js
 * (its "individual mentorship" branch, separate from its old batch logic).
 */
export default function MentorshipPricingModal({ user, plan, onClose, onSuccess }) {
  const planInfo = PLANS[plan];
  const [phone, setPhone] = useState(user?.phone || "");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("form"); // form | confirming | success | confirm_timeout | failed
  const [confirmedRow, setConfirmedRow] = useState(null);
  const [pendingPayload, setPendingPayload] = useState(null);
  const [streamChoice, setStreamChoice] = useState(() => {
    const s = (user?.stream || "").trim();
    const match = SUPPORTED_STREAMS.find(
      (v) => v.toLowerCase() === s.toLowerCase()
    );
    return match || (s ? "Other" : "");
  });

  async function persistStreamIfChanged() {
    const next = streamChoice === "Other" ? "" : streamChoice;
    if (next && next !== (user?.stream || "")) {
      await supabase.from("profiles").update({ stream: next }).eq("id", user.id);
    }
  }

  // Verifies the payment (or dev-bypasses it) and confirms the enrollment —
  // synchronous and server-verified, no dependency on a Razorpay webhook.
  async function confirmPayment(payload) {
    setStep("confirming");
    setPendingPayload(payload);
    const res = await fetch("/api/razorpay-create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (res?.ok && data?.enrollment) {
      setConfirmedRow(data.enrollment);
      setStep("success");
    } else {
      setStep("confirm_timeout");
    }
  }

  async function handlePay() {
    const cleaned = phone.trim().replace(/\s+/g, "");
    if (cleaned.length < 10) {
      setError("Please enter a valid mobile number");
      return;
    }
    if (!streamChoice) {
      setError("Please select your stream first");
      return;
    }
    setError("");
    setPaying(true);
    try {
      await persistStreamIfChanged();
      const streamValue = streamChoice === "Other" ? "Other / not listed" : streamChoice;

      const {
        data: { session }
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError("Your session expired — please sign in again.");
        setPaying(false);
        return;
      }

      if (import.meta.env.DEV) {
        setPaying(false);
        await confirmPayment({
          token: session.access_token,
          devConfirm: true,
          plan,
          phone: cleaned,
          stream: streamValue
        });
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setError("Razorpay failed to load. Check your internet.");
        setPaying(false);
        return;
      }

      const res = await fetch("/api/razorpay-create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          phone: cleaned,
          stream: streamValue,
          token: session.access_token
        })
      });
      if (!res.ok) throw new Error("Failed to create order");
      const { order_id, amount, currency } = await res.json();

      const rzp = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_API_KEY,
        amount: String(amount),
        currency,
        name: "evolve design",
        description: `Mentorship — ${planInfo.label}`,
        order_id,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: cleaned
        },
        theme: { color: "#FFD600" },
        handler: (response) => {
          setPaying(false);
          confirmPayment({
            action: "verify",
            token: session.access_token,
            plan,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });
        },
        modal: { ondismiss: () => setPaying(false) }
      });
      rzp.on("payment.failed", () => {
        setStep("failed");
        setPaying(false);
      });
      rzp.open();
    } catch (err) {
      console.error("mentorship payment error:", err);
      setError("Something went wrong. Please try again.");
      setPaying(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center md:px-6">
      <div
        className="absolute inset-0 bg-evolve-black/70 md:bg-evolve-black/85"
        onClick={paying ? undefined : onClose}
      />
      <div
        className="relative w-full h-full md:h-auto md:max-w-sm rounded-none md:rounded-3xl border-0 md:border md:border-white/10 px-6 py-7 flex flex-col gap-5 overflow-y-auto"
        style={{ backgroundColor: "#1c1c1f" }}
      >
        {step === "form" && (
          <>
            <div>
              <h3 className="text-white font-bold text-lg">{planInfo.label}</h3>
              <p className="text-white/40 text-xs mt-1">{planInfo.desc}</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/50">{user?.name || "—"}</span>
                <span className="text-white/30 text-xs">{user?.email || ""}</span>
              </div>
              <div className="flex items-center justify-between text-sm pt-1.5 border-t border-white/10">
                <span className="text-white">{planInfo.label}</span>
                <span className="text-evolve-yellow font-bold">{planInfo.price}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-white/40 text-xs">Confirm your stream</label>
              <select
                value={streamChoice}
                onChange={(e) => setStreamChoice(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-white text-sm outline-none border border-white/15 focus:border-evolve-yellow/60 transition-colors"
                style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
              >
                <option value="" className="bg-[#161618]">
                  Select stream
                </option>
                {SUPPORTED_STREAMS.map((s) => (
                  <option key={s} value={s} className="bg-[#161618]">
                    {s}
                  </option>
                ))}
                <option value="Other" className="bg-[#161618]">
                  Other / not listed
                </option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-white/40 text-xs">Mobile number</label>
              <div className="flex gap-2">
                <div className="flex items-center justify-center px-3 rounded-xl border border-white/15 text-white text-sm font-semibold bg-white/[0.06] flex-shrink-0">
                  +91
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  className="flex-1 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 outline-none border border-white/15 focus:border-evolve-yellow/60 transition-colors"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                />
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              onClick={handlePay}
              disabled={paying || phone.trim().length < 10}
              className="w-full bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl py-3.5 disabled:opacity-40 active:opacity-80 transition-opacity"
            >
              {paying ? "Processing…" : "Proceed to payment →"}
            </button>
            <button
              onClick={onClose}
              className="text-white/40 text-xs text-center hover:text-white/60"
            >
              Cancel
            </button>
          </>
        )}

        {step === "confirming" && (
          <div className="flex flex-col items-center gap-4 text-center py-6">
            <div className="w-10 h-10 border-2 border-evolve-yellow border-t-transparent rounded-full animate-spin" />
            <div>
              <h3 className="text-white font-bold text-lg">
                Confirming your payment…
              </h3>
              <p className="text-white/40 text-xs mt-1">
                This only takes a few seconds.
              </p>
            </div>
          </div>
        )}

        {step === "confirm_timeout" && (
          <div className="flex flex-col items-center gap-4 text-center py-2">
            <div className="w-16 h-16 rounded-full border-4 border-evolve-yellow/60 flex items-center justify-center">
              <span className="text-evolve-yellow text-2xl font-bold leading-none">
                ⏳
              </span>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">
                Couldn't confirm your payment
              </h3>
              <p className="text-white/40 text-xs mt-1">
                If you were charged, this is usually a network hiccup — try
                again. Nothing's lost.
              </p>
            </div>
            <button
              onClick={() => confirmPayment(pendingPayload)}
              className="w-full bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl py-3.5 active:opacity-80"
            >
              Try again
            </button>
            <button
              onClick={onClose}
              className="text-white/40 text-xs text-center hover:text-white/60"
            >
              Close for now
            </button>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center gap-4 text-center py-2">
            <div className="w-16 h-16 rounded-full border-4 border-green-400 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
                <path
                  d="M8 18l7 7 13-14"
                  stroke="#4ade80"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">You're in!</h3>
              <p className="text-white/40 text-xs mt-1">
                Just a quick gift before we get you set up.
              </p>
            </div>
            <button
              onClick={() => onSuccess(confirmedRow)}
              className="w-full bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl py-3.5 active:opacity-80"
            >
              Continue →
            </button>
          </div>
        )}

        {step === "failed" && (
          <div className="flex flex-col items-center gap-4 text-center py-2">
            <div className="w-16 h-16 rounded-full border-4 border-red-400 flex items-center justify-center">
              <span className="text-red-400 text-3xl font-bold leading-none">
                !
              </span>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Payment failed</h3>
              <p className="text-white/40 text-xs mt-1">
                Nothing was charged — try again when ready.
              </p>
            </div>
            <button
              onClick={() => setStep("form")}
              className="w-full bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl py-3.5 active:opacity-80"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
