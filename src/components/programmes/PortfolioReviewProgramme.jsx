import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import ProcessSteps from "./ProcessSteps";
import PortfolioReviewFlow from "./PortfolioReviewFlow";

/* TODO: replace image placeholders with the real reviewer links once available. */
const REVIEWERS = [
  {
    name: "Yagnesh Ahir",
    years: "18",
    role: "Founder & Design Director, Paperclip Design · Design Coach, byStadium",
    image:
      "https://res.cloudinary.com/diuswhkzn/image/upload/v1785740530/Yagnesh_Ahir_Profile_2025_2_ckdmsn.png"
  },
  {
    name: "Sakshi Patki",
    years: "3",
    role: "Senior Creative Graphic Designer, Paperclip Design · Visual Lead, evolve",
    image:
      "https://res.cloudinary.com/diuswhkzn/image/upload/v1785832940/Frame_1801288229_ryj65z.png"
  },
  {
    name: "Sonam Gandhi",
    years: "5",
    role: "Product Designer, Paperclip Design · Mentor, evolve",
    image:
      "https://res.cloudinary.com/diuswhkzn/image/upload/v1785740530/Group_1801288230_xsbbar.png"
  },
  {
    name: "Paramdeep Singh Dayani",
    years: "8",
    role: "Architect & Production Designer · Founder, Antispace.in",
    image:
      "https://res.cloudinary.com/diuswhkzn/image/upload/v1785740530/param_1_bgprl1.png"
  },
  {
    name: "Anuj Sharma",
    years: "25",
    role: "Fashion Designer · Founder, Button Masala",
    image:
      "https://res.cloudinary.com/diuswhkzn/image/upload/v1785833013/Frame_1801288246_iykxnq.png"
  }
];

const PROCESS_STEPS = [
  { title: "Pre-review questionnaire", body: "You share your goals so feedback is tailored to where you want to go." },
  { title: "Send your portfolio", body: "A PDF or live link — Behance, Notion, your own site. A resume helps too." },
  { title: "Matched reviewer", body: "A working reviewer studies your work against your stated goals." },
  { title: "Live 1:1 call", body: "You go through the portfolio together, screen-shared. A conversation, not a presentation." },
  { title: "Written report", body: "Actionable fixes in writing, sent within 3 working days of the call." }
];

const FAQ = [
  ["What format should my portfolio be in?", "A PDF or a live link (Behance, Notion, your own site) both work. If you have a resume, attach that too."],
  ["How long until I get my report?", "Your written report is sent within 3 working days after your 1:1 call."],
  ["What happens on the 1:1 call?", "You and your reviewer go through your portfolio together, screen-shared — a conversation, not a presentation."],
  ["Refund policy?", "Cancel more than 48 hours before your scheduled call for a full refund. Within 48 hours, you can reschedule once at no extra cost."]
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

function Chip({ children }) {
  return (
    <span className="text-xs font-semibold px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-white/70">
      {children}
    </span>
  );
}

/* ── booking modal — collects only what onboarding doesn't already know ──── */
function BookModal({ user, onClose, onSuccess }) {
  const [phone, setPhone] = useState(user?.phone || "");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("form"); // form | confirming | success | confirm_timeout | failed
  const [confirmedRow, setConfirmedRow] = useState(null);

  // Row creation happens server-side (webhook, or the dev bypass below) —
  // poll for it to appear instead of assuming the client's optimistic
  // Razorpay `handler` callback means the workspace is actually unlocked.
  useEffect(() => {
    if (step !== "confirming") return;
    let cancelled = false;
    let attempts = 0;
    async function poll() {
      attempts += 1;
      const { data } = await supabase
        .from("evolve_portfolio_reviews")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (data) {
        setConfirmedRow(data);
        setStep("success");
        return;
      }
      if (attempts >= 10) {
        setStep("confirm_timeout");
        return;
      }
      setTimeout(poll, 1500);
    }
    poll();
    return () => { cancelled = true; };
  }, [step, user.id]);

  async function handlePay() {
    const cleaned = phone.trim().replace(/\s+/g, "");
    if (cleaned.length < 10) {
      setError("please enter a valid mobile number");
      return;
    }
    setError("");
    setPaying(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setError("razorpay failed to load. check your internet.");
        setPaying(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError("your session expired — please sign in again.");
        setPaying(false);
        return;
      }

      if (import.meta.env.DEV) {
        await fetch("/api/dev-confirm-portfolio-review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: session.access_token })
        }).catch(() => {});
        setStep("confirming");
        setPaying(false);
        return;
      }

      const res = await fetch("/api/razorpay-create-order-portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleaned, token: session.access_token })
      });
      if (!res.ok) throw new Error("failed to create order");
      const { order_id, amount, currency } = await res.json();

      const rzp = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_API_KEY,
        amount: String(amount),
        currency,
        name: "Evolve Design",
        description: "Portfolio Review — live 1:1 review",
        order_id,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: cleaned
        },
        theme: { color: "#FFD600" },
        handler: () => {
          setStep("confirming");
          setPaying(false);
        },
        modal: { ondismiss: () => setPaying(false) }
      });
      rzp.on("payment.failed", () => {
        setStep("failed");
        setPaying(false);
      });
      rzp.open();
    } catch (err) {
      console.error("portfolio review payment error:", err);
      setError("something went wrong. please try again.");
      setPaying(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-evolve-black/70" onClick={paying ? undefined : onClose} />
      <div
        className="relative w-full max-w-sm rounded-3xl border border-white/10 px-6 py-7 flex flex-col gap-5"
        style={{ backgroundColor: "#1c1c1f" }}
      >
        {step === "form" && (
          <>
            <div>
              <h3 className="text-white font-bold text-lg">Book your portfolio review</h3>
              <p className="text-white/40 text-xs mt-1">
                A live 1:1 review with a matched reviewer, a written report, and a free follow-up.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/50">{user?.name || "—"}</span>
                <span className="text-white/30 text-xs">{user?.email || ""}</span>
              </div>
              <div className="flex items-center justify-between text-sm pt-1.5 border-t border-white/10">
                <span className="text-white">Live review with a mentor</span>
                <span className="text-evolve-yellow font-bold">₹1,400</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-white/40 text-xs">mobile number</label>
              <div className="flex gap-2">
                <div className="flex items-center justify-center px-3 rounded-xl border border-white/15 text-white text-sm font-semibold bg-white/[0.06] flex-shrink-0">
                  +91
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
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
              {paying ? "processing…" : "proceed to payment →"}
            </button>
            <button onClick={onClose} className="text-white/40 text-xs text-center hover:text-white/60">
              cancel
            </button>
          </>
        )}

        {step === "confirming" && (
          <div className="flex flex-col items-center gap-4 text-center py-6">
            <div className="w-10 h-10 border-2 border-evolve-yellow border-t-transparent rounded-full animate-spin" />
            <div>
              <h3 className="text-white font-bold text-lg">confirming your payment…</h3>
              <p className="text-white/40 text-xs mt-1">this only takes a few seconds.</p>
            </div>
          </div>
        )}

        {step === "confirm_timeout" && (
          <div className="flex flex-col items-center gap-4 text-center py-2">
            <div className="w-16 h-16 rounded-full border-4 border-evolve-yellow/60 flex items-center justify-center">
              <span className="text-evolve-yellow text-2xl font-bold leading-none">⏳</span>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">still confirming…</h3>
              <p className="text-white/40 text-xs mt-1">
                your payment is being verified — this can take a minute. check again in a bit.
              </p>
            </div>
            <button
              onClick={() => setStep("confirming")}
              className="w-full bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl py-3.5 active:opacity-80"
            >
              check again
            </button>
            <button onClick={onClose} className="text-white/40 text-xs text-center hover:text-white/60">
              close for now
            </button>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center gap-4 text-center py-2">
            <div className="w-16 h-16 rounded-full border-4 border-green-400 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
                <path d="M8 18l7 7 13-14" stroke="#4ade80" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">you're booked</h3>
              <p className="text-white/40 text-xs mt-1">
                let's get your pre-review questionnaire out of the way.
              </p>
            </div>
            <button
              onClick={() => onSuccess(confirmedRow)}
              className="w-full bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl py-3.5 active:opacity-80"
            >
              start your review →
            </button>
          </div>
        )}

        {step === "failed" && (
          <div className="flex flex-col items-center gap-4 text-center py-2">
            <div className="w-16 h-16 rounded-full border-4 border-red-400 flex items-center justify-center">
              <span className="text-red-400 text-3xl font-bold leading-none">!</span>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">payment failed</h3>
              <p className="text-white/40 text-xs mt-1">nothing was charged — try again when ready.</p>
            </div>
            <button
              onClick={() => setStep("form")}
              className="w-full bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl py-3.5 active:opacity-80"
            >
              retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * The full Portfolio Review programme page — hero through FAQ, plus the
 * booking modal. Deliberately has no outer page chrome (no background, no
 * top bar) of its own so it can be dropped straight into any layout: the
 * standalone /programmes/portfolio-review route wraps it in a "back to
 * profile" bar, and the profile dashboard drops it into the right-hand
 * content pane, next to the persistent sidebar, via `onBack`.
 */
export default function PortfolioReviewProgramme({ user, onBack }) {
  const [bookOpen, setBookOpen] = useState(false);
  const [reviewRow, setReviewRow] = useState(null);
  const [checkingReview, setCheckingReview] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("evolve_portfolio_reviews")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setReviewRow(data || null);
        setCheckingReview(false);
      });
    return () => { cancelled = true; };
  }, [user.id]);

  if (checkingReview) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-evolve-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Already paid (a row only ever exists once the webhook confirms
  // payment) — skip the marketing page entirely and resume the workspace
  // wherever they left off.
  if (reviewRow) {
    return <PortfolioReviewFlow user={user} onBack={onBack} review={reviewRow} />;
  }

  return (
    <div className="flex flex-col gap-14">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm font-semibold w-fit transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          back to programmes
        </button>
      )}

      {/* hero */}
      <div>
        <p className="text-white/30 text-[11px] font-bold uppercase tracking-[0.16em] mb-3">programme</p>
        <h1 className="text-white font-bold font-bricolage" style={{ fontSize: "clamp(30px,5vw,44px)", letterSpacing: "-0.02em" }}>
          Portfolio Review
        </h1>
        <p className="text-white/50 text-[15px] leading-relaxed mt-4 max-w-xl">
          Industry eyes on your portfolio — a review that goes beyond what's on screen. Get a personalised
          report plus a live 1:1 discussion with a working reviewer, so you build a stronger portfolio for
          internships, placements, and beyond.
        </p>
        <div className="flex flex-wrap gap-2 mt-5">
          <Chip>Live 1:1 review</Chip>
          <Chip>Written report</Chip>
          <Chip>1 free follow-up</Chip>
        </div>
        <button
          onClick={() => document.getElementById("pr-pricing")?.scrollIntoView({ behavior: "smooth" })}
          className="mt-6 bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl px-6 py-3.5 active:opacity-80"
        >
          see what's included
        </button>
      </div>

      {/* what this solves */}
      <div>
        <h2 className="text-white font-bold font-bricolage text-xl mb-4">what this solves</h2>
        <div
          className="rounded-2xl border border-white/10 px-6 py-5 flex flex-col gap-3"
          style={{ background: "linear-gradient(90deg, rgba(255,208,7,0.05), transparent 60%)", borderLeft: "3px solid #FFD007" }}
        >
          <p className="text-white/70 text-sm leading-relaxed">
            You can spend months building a portfolio and still never hear what an industry reviewer actually
            thinks of it before you're in the interview.
          </p>
          <p className="text-white/70 text-sm leading-relaxed">
            This review closes that gap: honest, personalised feedback from someone who makes real hiring and
            studio decisions — early enough to change the outcome.
          </p>
        </div>
      </div>

      {/* the process */}
      <div>
        <h2 className="text-white font-bold font-bricolage text-xl mb-8">the process</h2>
        <ProcessSteps steps={PROCESS_STEPS} />
      </div>

      {/* the panel */}
      <div>
        <p className="text-white/30 text-[11px] font-bold uppercase tracking-[0.16em] mb-2">the panel</p>
        <h2 className="text-white font-bold font-bricolage text-xl mb-4">industry experts across multiple disciplines</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {REVIEWERS.map((r) => (
            <div key={r.name} className="flex flex-col gap-2">
              <div className="aspect-square rounded-xl overflow-hidden bg-white/[0.03] border border-white/10">
                <img src={r.image} alt={r.name} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <p className="text-white text-xs font-bold leading-snug">{r.name}</p>
              <p className="text-evolve-yellow text-[11px] font-semibold -mt-1.5">{r.years}+ yrs</p>
              <p className="text-white/35 text-[11px] leading-snug">{r.role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* pricing */}
      <div id="pr-pricing">
        <h2 className="text-white font-bold font-bricolage text-xl mb-4">pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className="rounded-2xl border border-evolve-yellow/60 px-6 py-6 flex flex-col gap-3"
            style={{ background: "linear-gradient(180deg, rgba(255,208,7,0.06), transparent 55%)" }}
          >
            <p className="text-white/40 text-xs uppercase tracking-wide font-semibold">live review with a mentor</p>
            <div className="flex items-baseline gap-2">
              <span className="text-white font-bold text-3xl">₹1,400</span>
              <span className="text-white/30 text-xs">one-time</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              A matched reviewer, a live 1:1 call, a written report with actionable fixes, and a free
              follow-up once you've made your revisions.
            </p>
            <button
              onClick={() => setBookOpen(true)}
              className="mt-2 bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl py-3.5 active:opacity-80"
            >
              get started →
            </button>
          </div>
          <div className="rounded-2xl border border-white/10 px-6 py-6">
            <p className="text-white/40 text-xs uppercase tracking-wide font-semibold mb-3">what's included</p>
            <ul className="flex flex-col gap-3">
              {[
                "Pre-review questionnaire feedback tailored to your goals",
                "Live 1:1 call with your matched reviewer",
                "Written report with actionable fixes",
                "1 free follow-up call to check your revisions"
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-white/60 text-sm">
                  <span className="w-4 h-4 rounded-full bg-evolve-inchworm/15 text-evolve-inchworm text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-white font-bold font-bricolage text-xl mb-4">good to know</h2>
        <div className="rounded-2xl border border-white/10 divide-y divide-white/10 overflow-hidden">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group px-5 py-4">
              <summary className="text-white text-sm font-semibold cursor-pointer list-none flex items-center justify-between gap-4">
                {q}
                <span className="text-white/30 group-open:rotate-45 transition-transform text-lg leading-none">+</span>
              </summary>
              <p className="text-white/40 text-sm mt-2.5 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* sticky enrol bar */}
      <div className="sticky bottom-0 -mx-6 md:-mx-8 border-t border-white/10 bg-[#1c1c1f]/95 backdrop-blur px-6 md:px-8 py-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-white font-bold text-sm">Portfolio Review</p>
          <p className="text-white/30 text-xs">₹1,400 · live 1:1 review + written report + free follow-up</p>
        </div>
        <button
          onClick={() => setBookOpen(true)}
          className="bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl px-6 py-3 active:opacity-80 flex-shrink-0"
        >
          get started →
        </button>
      </div>

      {bookOpen && (
        <BookModal
          user={user}
          onClose={() => setBookOpen(false)}
          onSuccess={(row) => {
            setBookOpen(false);
            setReviewRow(row);
          }}
        />
      )}
    </div>
  );
}
