import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../supabaseClient";
import BlackNav from "../components/BlackNav";
import {
  surprise_box,
  surprise_box_open,
  rays_payment
} from "../assets/images/Mentorship";

/* ─── plan config ─────────────────────────────────────────────────────────── */
const PLANS = {
  // test: {
  //   label: "test",
  //   price: "₹11",
  //   originalPrice: "₹11",
  //   paise: 1100 // ← 11 rupees in paise
  // },
  starter: {
    label: "starter",
    price: "₹15,000",
    originalPrice: "₹35,000",
    paise: 1500000
  },
  accelerator: {
    label: "accelerator",
    price: "₹35,000",
    originalPrice: "₹50,000",
    paise: 3500000
  }
};

/* ─── Razorpay script loader ──────────────────────────────────────────────── */
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

/* ─── helpers ─────────────────────────────────────────────────────────────── */
function ordinalDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDate();
  const suffix =
    ["th", "st", "nd", "rd"][
      ((day % 100) - 20 + 100) % 100 < 4
        ? ((day % 100) - 20 + 100) % 100
        : day % 10 < 4
          ? day % 10
          : 0
    ] || "th";
  return d
    .toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    .replace(/^/, `${day}${suffix} `);
}

/* ─── Profile mini-sheet ──────────────────────────────────────────────────── */
function ProfileSheet({ user, onClose }) {
  const avatarSrc =
    user?.avatar_url ||
    `https://api.dicebear.com/7.x/thumbs/svg?seed=${user?.id || "u"}`;
  const receiptRef = useRef(null);
  const [payment, setPayment] = useState(undefined); // undefined = loading

  useEffect(() => {
    if (!user) return;
    supabase
      .from("mentorship_payments")
      .select("*, batch:mentorship_batches(batch_number, start_date)")
      .eq("user_id", user.id)
      .eq("status", "success")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setPayment(data || null));
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onClose();
  };

  const downloadReceipt = async () => {
    if (!receiptRef.current || !payment) return;
    const canvas = await html2canvas(receiptRef.current, {
      scale: 2,
      useCORS: true
    });
    const imgData = canvas.toDataURL("image/png");
    const w = canvas.width / 2;
    const h = canvas.height / 2;
    const pdf = new jsPDF({ unit: "px", format: [w, h] });
    pdf.addImage(imgData, "PNG", 0, 0, w, h);
    pdf.save(`evolve-receipt-${payment.razorpay_payment_id || Date.now()}.pdf`);
  };

  const rows = payment
    ? [
        ["plan", payment.plan === "starter" ? "starter" : "accelerator"],
        ["amount", `₹${Number(payment.amount).toLocaleString("en-IN")}`],
        [
          "date",
          new Date(payment.created_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
          })
        ],
        ["batch", `batch ${payment.batch?.batch_number ?? "—"}`],
        [
          "starts on",
          payment.batch?.start_date
            ? ordinalDate(payment.batch.start_date)
            : "—"
        ],
        ["ref", payment.razorpay_payment_id || "—"]
      ]
    : [];

  return (
    <>
      <div className="fixed inset-0 z-[60]" onClick={onClose} />
      <div
        className="fixed top-16 right-4 z-[70] rounded-2xl border border-white/10 p-5 flex flex-col gap-4 w-72 max-h-[85vh] overflow-y-auto"
        style={{ background: "rgba(30,30,30,1)" }}
      >
        {/* user info */}
        <div className="flex items-center gap-3">
          <img
            src={avatarSrc}
            alt="avatar"
            className="w-11 h-11 rounded-full object-cover flex-shrink-0"
          />
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate">
              {user?.name || "—"}
            </p>
            <p className="text-white/40 text-xs truncate">
              {user?.email || ""}
            </p>
          </div>
        </div>

        <div className="h-px bg-white/10" />

        {/* receipt */}
        {payment === undefined && (
          <p className="text-white/30 text-xs">loading…</p>
        )}
        {payment === null && (
          <p className="text-white/30 text-xs">no payments yet</p>
        )}
        {payment && (
          <>
            <div
              ref={receiptRef}
              className="rounded-xl bg-white p-4 flex flex-col gap-1.5"
            >
              <p className="font-extrabold text-black text-[10px] uppercase tracking-widest mb-1 text-center">
                evolve mentorship · receipt
              </p>
              <div className="w-full h-px bg-black/10 mb-1" />
              {rows.map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between items-start gap-2"
                >
                  <span className="text-black/40 text-[11px] lowercase shrink-0">
                    {label}
                  </span>
                  <span className="text-black font-semibold text-[11px] text-right break-all">
                    {value}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={downloadReceipt}
              className="w-full bg-evolve-yellow text-evolve-black font-extrabold text-xs lowercase rounded-xl py-2.5 active:opacity-80"
            >
              download receipt ↓
            </button>
          </>
        )}

        <div className="h-px bg-white/10" />

        <button
          onClick={handleSignOut}
          className="text-left text-sm text-red-400 font-semibold hover:opacity-80 transition-opacity"
        >
          sign out
        </button>
      </div>
    </>
  );
}

/* ─── Avatar slot (right side of BlackNav) ───────────────────────────────── */
function AvatarSlot({ user }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const avatarSrc =
    user?.avatar_url ||
    `https://api.dicebear.com/7.x/thumbs/svg?seed=${user?.id || "u"}`;
  if (!user) return null;
  return (
    <div className="flex items-center gap-2 relative">
      <span className="hidden md:block text-white text-sm font-semibold">
        {user.name}
      </span>
      <button
        onClick={() => setProfileOpen((p) => !p)}
        className="focus:outline-none"
      >
        <img
          src={avatarSrc}
          alt="avatar"
          className="w-9 h-9 rounded-full object-cover"
        />
      </button>
      {profileOpen && (
        <ProfileSheet user={user} onClose={() => setProfileOpen(false)} />
      )}
    </div>
  );
}

/* ─── Back button ─────────────────────────────────────────────────────────── */
function BackBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-evolve-yellow w-fit"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M12.5 15L7.5 10L12.5 5"
          stroke="#FFD007"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-sm font-semibold">back</span>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   Payment page — steps: gift1 | gift2 | details | phone | success | failed
══════════════════════════════════════════════════════════════════════════════ */
export default function Payment() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { user, authLoading } = useAuth();

  const [plan, setPlan] = useState(params.get("plan") || "starter");
  const [step, setStep] = useState("gift1");
  const [batch, setBatch] = useState(null);
  const [phone, setPhone] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  /* ── sync plan to URL ────────────────────────────────────────────────────── */
  const handlePlanChange = (newPlan) => {
    setPlan(newPlan);
    setParams({ plan: newPlan }, { replace: true });
  };

  /* ── auth guard ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/signin", { state: { from: `/payment?plan=${plan}` } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  /* ── already paid → skip to session ─────────────────────────────────────── */
  useEffect(() => {
    if (!user) return;
    supabase
      .from("mentorship_payments")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "success")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) navigate("/mentorship-session", { replace: true });
      });
  }, [user]);

  /* ── pre-fill phone from profile ────────────────────────────────────────── */
  useEffect(() => {
    if (user?.phone) setPhone(user.phone);
  }, [user]);

  /* ── fetch open batch ───────────────────────────────────────────────────── */
  useEffect(() => {
    supabase
      .from("batch_spots")
      .select("*")
      .eq("status", "open")
      .then(({ data }) => {
        if (!data || data.length === 0) return;
        const available = data
          .filter((b) => b.spots_remaining > 0)
          .sort((a, b) => a.batch_number - b.batch_number);
        if (available.length > 0) setBatch(available[0]);
      });
  }, []);

  const cfg = PLANS[plan] || PLANS.starter;
  const spotsLeft = batch?.spots_remaining ?? 5;

  /* ── pay handler ────────────────────────────────────────────────────────── */
  async function handlePay() {
    const cleaned = phone.trim().replace(/\s+/g, "");
    if (cleaned.length < 10) {
      setError("please enter a valid phone number");
      return;
    }
    if (!agreed) {
      setError("please agree to the T&Cs to continue");
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

      const {
        data: { session }
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        navigate("/signin", { state: { from: `/payment?plan=${plan}` } });
        return;
      }

      // DEV bypass — skip real payment on localhost
      if (import.meta.env.DEV) {
        setStep("success");
        setPaying(false);
        return;
      }

      const res = await fetch("/api/razorpay-create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          phone: cleaned,
          token: session.access_token
        })
      });
      if (!res.ok) throw new Error("failed to create order");
      const { order_id, amount, currency } = await res.json();

      const rzp = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_API_KEY,
        amount: String(amount),
        currency,
        name: "Evolve Design",
        description: `Mentorship — ${cfg.label} Plan`,
        order_id,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: cleaned
        },
        theme: { color: "#FFD600" },
        handler: () => {
          setStep("success");
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
      console.error("payment error:", err);
      setError("something went wrong. please try again.");
      setPaying(false);
    }
  }

  function formatBatchDate(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  }

  if (authLoading) return null;

  /* ─── plan details card ─────────────────────────────────────────────────── */
  const PlanCard = () => (
    <div
      className="rounded-2xl border border-white/10 overflow-hidden"
      style={{ background: "rgba(255,255,255,0.06)" }}
    >
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <span className="text-white text-sm">{cfg.label} plan</span>
          <div className="text-right">
            <p className="text-white font-bold text-xl">{cfg.price}</p>
            <p className="text-white/35 text-xs line-through">
              {cfg.originalPrice}
            </p>
          </div>
        </div>
        <div className="flex items-start justify-between">
          <span className="text-evolve-yellow text-sm">AI-ready module</span>
          <div className="text-right">
            <p className="text-evolve-yellow font-bold text-xl">free</p>
            <p className="text-white/35 text-xs line-through">₹5,000</p>
          </div>
        </div>
        <div className="h-px bg-white/10" />
        <div className="flex items-start justify-between">
          <div>
            <span className="text-white/60 text-sm">total</span>
            <p className="text-white/30 text-xs">GST (18%) included</p>
          </div>
          <p className="text-evolve-yellow font-bold text-xl">{cfg.price}</p>
        </div>
      </div>
    </div>
  );

  /* ═════════════════════════════════════════════════════════════════════════
     RENDER
  ═════════════════════════════════════════════════════════════════════════ */

  /* ── gift screens — full viewport centered ───────────────────────────────── */
  // if (step === "gift1") {
  //   const viaApply = !!sessionStorage.getItem("signin_via_apply");
  //   if (viaApply) sessionStorage.removeItem("signin_via_apply");
  //   const firstName = user?.name?.split(" ")[0] || "";

  //   return (
  //     <div className="min-h-screen bg-evolve-black flex flex-col">
  //       <PayNav user={user} onLogoClick={() => navigate("/mentorship")} />
  //       <div className="flex-1 flex items-center justify-center px-6">
  //         <div className="flex flex-col items-center gap-6 w-full max-w-xs text-center">
  //           {viaApply && firstName && (
  //             <div className="flex flex-col gap-1">
  //               <p className="text-evolve-yellow font-extrabold leading-tight"
  //                 style={{ fontSize: "clamp(28px,7vw,40px)", letterSpacing: "-0.02em" }}>
  //                 welcome to<br />
  //                 <span style={{ color: "rgba(223,5,134,1)" }}>evolve {firstName}!</span>
  //               </p>
  //               <p className="text-white/60 text-sm">here is a gift for you!</p>
  //             </div>
  //           )}
  //           <img src={surprise_box} alt="gift" className="w-52 h-52 object-contain" />
  //           <button
  //             onClick={() => setStep("gift2")}
  //             className="w-full bg-evolve-yellow text-evolve-black font-extrabold lowercase text-base rounded-2xl py-4 active:opacity-80"
  //           >
  //             claim your gift!
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }
  if (step === "gift1" || step === "gift2") {
    const viaApply = !!sessionStorage.getItem("signin_via_apply");
    if (viaApply && step === "gift1")
      sessionStorage.removeItem("signin_via_apply");
    const firstName = user?.name?.split(" ")[0] || "";

    return (
      <div
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: "#161618" }}
      >
        <BlackNav
          onLogoClick={() => navigate("/mentorship")}
          right={<AvatarSlot user={user} />}
        />

        {/* gift1 base */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="flex flex-col items-center gap-6 w-full max-w-xs text-center">
            <div className="flex flex-col gap-1">
              <p
                className="text-evolve-yellow font-extrabold leading-tight"
                style={{
                  fontSize: "clamp(28px,7vw,40px)",
                  letterSpacing: "-0.02em"
                }}
              >
                welcome to evolve
                <span style={{ color: "rgba(223,5,134,1)" }}>
                  {firstName ? ` ${firstName}` : ""}!
                </span>
              </p>
              <p className="text-white/60 text-sm">here is a gift for you!</p>
            </div>
            <img
              src={surprise_box}
              alt="gift"
              className="w-52 h-52 object-contain"
            />
            <button
              onClick={() => setStep("gift2")}
              className="w-full bg-evolve-yellow text-evolve-black font-extrabold lowercase text-base rounded-2xl py-4 active:opacity-80"
            >
              claim your gift!
            </button>
          </div>
        </div>

        {/* gift2 overlay */}
        {step === "gift2" && (
          <div
            className="fixed inset-0 z-[80] flex items-center justify-center px-6 py-8"
            style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
          >
            <div
              className="relative w-full max-w-xs rounded-3xl overflow-hidden flex flex-col items-center py-10 px-6 gap-4"
              style={{ backgroundColor: "rgba(255,208,7,1)" }}
            >
              {/* <img
                src={rays_payment}
                alt=""
                className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
              /> */}
              <div className="relative z-10 flex flex-col items-center gap-3 text-center">
                <p
                  className="font-extrabold text-2xl leading-tight"
                  style={{ color: "rgba(223,5,134,1)" }}
                >
                  be AI ready!!
                </p>
                <p className="text-evolve-black/80 text-sm max-w-[26ch] leading-relaxed">
                  we'll also show you how to stay visible as ai increasingly
                  filters who gets seen
                </p>
                <p className="font-extrabold text-evolve-black text-4xl mt-1">
                  free!
                </p>
                <p className="text-evolve-black/45 text-sm line-through">
                  ₹ 5,000
                </p>
              </div>
              <img
                src={surprise_box_open}
                alt="open gift"
                className="relative z-10 w-36 object-contain"
              />
              <button
                onClick={() => setStep("details")}
                className="relative z-10 w-full bg-evolve-black text-evolve-yellow font-extrabold lowercase text-base rounded-2xl py-4 active:opacity-80 mt-2"
              >
                claim your gift!
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#161618" }}
    >
      <BlackNav
        onLogoClick={() => navigate("/mentorship")}
        right={<AvatarSlot user={user} />}
      />

      <div className="flex flex-col flex-1 px-6 pt-24 pb-12 md:items-center md:justify-center md:pt-0">
        <div className="w-full max-w-sm md:max-w-md mx-auto flex flex-col gap-6">
          {/* ── DETAILS ──────────────────────────────────────────────────────── */}
          {step === "details" && (
            <>
              <BackBtn onClick={() => navigate("/mentorship")} />

              <div>
                <h1
                  className="text-white font-bold leading-tight"
                  style={{ fontSize: 40, letterSpacing: "-0.16px" }}
                >
                  you're almost in
                </h1>
                <p className="text-white/50 text-sm mt-1">
                  {spotsLeft} seat{spotsLeft !== 1 ? "s" : ""} left for this
                  batch
                </p>
              </div>

              <p className="text-white/35 text-xs -mt-2">
                {/* pick batch &gt;{" "} */}
                <span className="text-evolve-yellow">choose plan</span>
              </p>

              {/* plan tabs */}
              <div className="flex gap-2">
                {["starter", "accelerator"].map((t) => (
                  <button
                    key={t}
                    onClick={() => handlePlanChange(t)}
                    className="flex-1 py-3 font-extrabold lowercase text-sm transition-colors"
                    style={{
                      backgroundColor:
                        plan === t ? "rgba(223,5,134,1)" : "#BF9C05",
                      color: plan === t ? "#fff" : "#000"
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <PlanCard />

              <button
                onClick={() => setStep("phone")}
                className="w-full flex items-center justify-center gap-2 bg-evolve-yellow text-evolve-black font-bold text-base rounded-2xl py-4 active:opacity-80"
              >
                continue
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M3.75 9h10.5M9.75 4.5 14.25 9l-4.5 4.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </>
          )}

          {/* ── PHONE ────────────────────────────────────────────────────────── */}
          {step === "phone" && (
            <>
              <BackBtn onClick={() => setStep("details")} />

              <h1
                className="text-white font-bold leading-tight"
                style={{ fontSize: 40, letterSpacing: "-0.16px" }}
              >
                enter your phone number
              </h1>

              <div className="flex gap-2">
                <div
                  className="flex items-center justify-center px-4 rounded-2xl border border-white/15 text-white font-semibold text-sm flex-shrink-0"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                >
                  +91
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 border border-white/15 rounded-2xl px-5 py-4 text-white placeholder-white/30 text-base outline-none focus:border-evolve-yellow/60 transition-colors"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                />
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-evolve-yellow flex-shrink-0"
                />
                <span className="text-white/55 text-sm leading-relaxed">
                  I agree to{" "}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-evolve-yellow underline underline-offset-2"
                  >
                    T&amp;Cs
                  </a>{" "}
                  and consent to session recording
                </span>
              </label>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                onClick={handlePay}
                disabled={paying || !agreed || !phone.trim()}
                className="w-full flex items-center justify-center gap-2 bg-evolve-yellow text-evolve-black font-bold text-base rounded-2xl py-4 disabled:opacity-30 active:opacity-80"
              >
                {paying ? (
                  "processing…"
                ) : (
                  <>
                    confirm and pay
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path
                        d="M3.75 9h10.5M9.75 4.5 14.25 9l-4.5 4.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </>
                )}
              </button>
            </>
          )}

          {/* ── SUCCESS ──────────────────────────────────────────────────────── */}
          {step === "success" && (
            <div className="flex flex-col items-center gap-6 text-center pt-4">
              <div className="w-20 h-20 rounded-full border-4 border-green-400 flex items-center justify-center">
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
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
                <h1
                  className="text-white font-bold"
                  style={{ fontSize: 40, letterSpacing: "-0.16px" }}
                >
                  you're in
                </h1>
                <p className="text-white/50 text-sm mt-1">
                  your spot in the batch is locked in
                </p>
              </div>
              <div
                className="w-full rounded-2xl border border-white/10 p-5 text-left space-y-2"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <p className="text-white/50 text-sm">
                  evolve mentorship program
                </p>
                <p className="text-white text-sm font-semibold">
                  {cfg.label} plan + AI-ready module
                </p>
                {batch && (
                  <p className="text-evolve-yellow text-sm font-semibold">
                    batch starts {formatBatchDate(batch.start_date)}, 9:30pm ist
                  </p>
                )}
                <p className="text-white/30 text-xs">
                  we'll be in touch before
                </p>
              </div>
              {user?.email && (
                <p className="text-white/40 text-xs">
                  receipt sent to {user.email}
                </p>
              )}
              <button
                onClick={() => navigate("/mentorship-session")}
                className="w-full flex items-center justify-center gap-2 bg-evolve-yellow text-evolve-black font-bold text-base rounded-2xl py-4 active:opacity-80"
              >
                see what's next
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M3.75 9h10.5M9.75 4.5 14.25 9l-4.5 4.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* ── FAILED ───────────────────────────────────────────────────────── */}
          {step === "failed" && (
            <div className="flex flex-col items-center gap-6 text-center pt-4">
              <div className="w-20 h-20 rounded-full border-4 border-red-400 flex items-center justify-center">
                <span className="text-red-400 text-4xl font-bold leading-none">
                  !
                </span>
              </div>
              <div>
                <h1
                  className="text-white font-bold"
                  style={{ fontSize: 40, letterSpacing: "-0.16px" }}
                >
                  payment failed
                </h1>
                <p className="text-white/50 text-sm mt-1">
                  your spot is still being held. try again to secure it
                </p>
              </div>
              <div
                className="w-full rounded-2xl border border-white/10 p-5 text-left space-y-2"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <p className="text-white/50 text-sm">
                  evolve mentorship program
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm font-semibold">
                    {cfg.label} plan + AI-ready module
                  </span>
                  <span className="text-evolve-yellow text-sm font-bold">
                    {cfg.price}
                  </span>
                </div>
                {batch && (
                  <p className="text-evolve-yellow text-sm">
                    batch starts {formatBatchDate(batch.start_date)}, 9:30pm ist
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setStep("phone");
                  setError("");
                }}
                className="w-full flex items-center justify-center gap-2 bg-evolve-yellow text-evolve-black font-bold text-base rounded-2xl py-4 active:opacity-80"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M14.25 9H3.75M8.25 4.5 3.75 9l4.5 4.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
