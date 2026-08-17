// import { useCallback, useEffect, useState } from "react";
// import { supabase } from "../../supabaseClient";
// import { useAuth } from "../../hooks/useAuth";
// // import { sendPhoneOtp, verifyPhoneOtp } from "../../auth/signInLogic";
// import ProcessSteps from "./ProcessSteps";
// import PortfolioReviewFlow from "./PortfolioReviewFlow";
// import GrowthStageModal from "../GrowthStageModal";
// import { REVIEWERS } from "../../lib/reviewerRouting";
// import { right_arrow_icon } from "../../assets/images/Nav";
// import {
//   InputOTP,
//   InputOTPGroup,
//   InputOTPSeparator,
//   InputOTPSlot
// } from "../ui/input-otp";

// const RESEND_SECONDS = 30;

// function formatTimer(s) {
//   const m = Math.floor(s / 60);
//   const sec = s % 60;
//   return `${m}:${String(sec).padStart(2, "0")}`;
// }

// function GreenTick() {
//   return (
//     <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-400/15 flex-shrink-0">
//       <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
//         <path
//           d="M2.5 6.2l2.3 2.3L9.5 3.5"
//           stroke="#4ade80"
//           strokeWidth="1.8"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//         />
//       </svg>
//     </span>
//   );
// }

// // growth_stage (0-100) reached once a Portfolio Review payment unlocks the
// // workspace — see src/lib/growthStage.js for the seed→sprout mapping.
// const PAYMENT_GROWTH_STAGE = 20;

// const PROCESS_STEPS = [
//   {
//     title: "Pre-review questionnaire",
//     body: "You share your goals so feedback is tailored to where you want to go."
//   },
//   {
//     title: "Send your portfolio",
//     body: "A PDF or live link — Behance, Notion, your own site. A resume helps too."
//   },
//   {
//     title: "Matched reviewer",
//     body: "A working reviewer studies your work against your stated goals."
//   },
//   {
//     title: "Live 1:1 call",
//     body: "You go through the portfolio together, screen-shared. A conversation, not a presentation."
//   },
//   {
//     title: "Written report",
//     body: "Actionable fixes in writing, sent within 3 working days of the call."
//   }
// ];

// const FAQ = [
//   [
//     "What format should my portfolio be in?",
//     "A PDF or a live link (Behance, Notion, your own site) both work. If you have a resume, attach that too."
//   ],
//   [
//     "How long until I get my report?",
//     "Your written report is sent within 3 working days after your 1:1 call."
//   ],
//   [
//     "What happens on the 1:1 call?",
//     "You and your reviewer go through your portfolio together, screen-shared — a conversation, not a presentation."
//   ],
//   [
//     "Refund policy?",
//     "Cancel more than 48 hours before your scheduled call for a full refund. Within 48 hours, you can reschedule once at no extra cost."
//   ],
//   [
//     "When can I use my free follow-up call?",
//     "The follow-up call is yours to use once you've made revisions based on your first call. There's no hard deadline — take the time you need to rework your portfolio, then book it when you feel ready."
//   ],
//   [
//     "What if I need to reschedule my call?",
//     "No problem. You can reschedule up to 24 hours before your call without any issue — just use the link in your confirmation email to pick a new slot."
//   ]
// ];

// function loadRazorpayScript() {
//   return new Promise((resolve) => {
//     if (window.Razorpay) return resolve(true);
//     const s = document.createElement("script");
//     s.src = "https://checkout.razorpay.com/v1/checkout.js";
//     s.onload = () => resolve(true);
//     s.onerror = () => resolve(false);
//     document.body.appendChild(s);
//   });
// }

// function Chip({ children }) {
//   return (
//     <span className="text-xs font-semibold px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-white/70">
//       {children}
//     </span>
//   );
// }

// /* ── booking modal — collects only what onboarding doesn't already know ──── */
// function BookModal({ user, onClose, onSuccess }) {
//   const [phone, setPhone] = useState(user?.phone || "");
//   const [paying, setPaying] = useState(false);
//   const [error, setError] = useState("");
//   const [step, setStep] = useState("form"); // form | confirming | success | confirm_timeout | failed
//   const [confirmedRow, setConfirmedRow] = useState(null);
//   const [pendingPayload, setPendingPayload] = useState(null);

//   // otpStatus: idle (not requested yet) | sent (awaiting code) | verified
//   const [otpStatus, setOtpStatus] = useState("idle");
//   const [otp, setOtp] = useState("");
//   const [otpLoading, setOtpLoading] = useState(false);
//   const [otpError, setOtpError] = useState("");
//   const [resendIn, setResendIn] = useState(0);

//   useEffect(() => {
//     if (resendIn <= 0) return;
//     const id = setTimeout(() => setResendIn((s) => s - 1), 1000);
//     return () => clearTimeout(id);
//   }, [resendIn]);

//   function resetOtp() {
//     setOtpStatus("idle");
//     setOtp("");
//     setOtpError("");
//     setResendIn(0);
//   }

//   async function requestOtp() {
//     const cleaned = phone.trim().replace(/\s+/g, "");
//     if (cleaned.length < 10) {
//       setError("Please enter a valid mobile number");
//       return;
//     }
//     setError("");
//     setOtpError("");
//     setOtpLoading(true);
//     try {
//       await sendPhoneOtp(`+91${cleaned}`);
//       setOtp("");
//       setOtpStatus("sent");
//       setResendIn(RESEND_SECONDS);
//     } catch (err) {
//       setOtpError(err?.message || "Couldn't send the OTP. Try again.");
//     } finally {
//       setOtpLoading(false);
//     }
//   }

//   async function handleOtpComplete(value) {
//     const cleaned = phone.trim().replace(/\s+/g, "");
//     setOtpLoading(true);
//     setOtpError("");
//     try {
//       await verifyPhoneOtp(`+91${cleaned}`, value);
//       setOtpStatus("verified");
//     } catch (err) {
//       setOtpError(err?.message || "That code didn't match — try again.");
//       setOtp("");
//     } finally {
//       setOtpLoading(false);
//     }
//   }

//   // Verifies the payment (or dev-bypasses it) and unlocks the review
//   // workspace — synchronous and server-verified, no dependency on a
//   // Razorpay dashboard webhook ever firing.
//   async function confirmPayment(payload) {
//     setStep("confirming");
//     setPendingPayload(payload);
//     const res = await fetch("/api/razorpay-create-order-portfolio", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload)
//     }).catch(() => null);
//     const data = await res?.json().catch(() => null);
//     if (res?.ok && data?.review) {
//       setConfirmedRow(data.review);
//       setStep("success");
//     } else {
//       setStep("confirm_timeout");
//     }
//   }

//   async function handlePay() {
//     const cleaned = phone.trim().replace(/\s+/g, "");
//     if (cleaned.length < 10) {
//       setError("Please enter a valid mobile number");
//       return;
//     }
//     if (otpStatus !== "verified") {
//       setError("Please verify your mobile number first");
//       return;
//     }
//     setError("");
//     setPaying(true);
//     try {
//       const loaded = await loadRazorpayScript();
//       if (!loaded) {
//         setError("Razorpay failed to load. Check your internet.");
//         setPaying(false);
//         return;
//       }

//       const {
//         data: { session }
//       } = await supabase.auth.getSession();
//       if (!session?.access_token) {
//         setError("Your session expired — please sign in again.");
//         setPaying(false);
//         return;
//       }

//       if (import.meta.env.DEV) {
//         setPaying(false);
//         await confirmPayment({ token: session.access_token, devConfirm: true });
//         return;
//       }

//       const res = await fetch("/api/razorpay-create-order-portfolio", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ phone: cleaned, token: session.access_token })
//       });
//       if (!res.ok) throw new Error("Failed to create order");
//       const { order_id, amount, currency } = await res.json();

//       const rzp = new window.Razorpay({
//         key: import.meta.env.VITE_RAZORPAY_API_KEY,
//         amount: String(amount),
//         currency,
//         name: "evolve design",
//         description: "Portfolio Review — live 1:1 review",
//         order_id,
//         prefill: {
//           name: user?.name || "",
//           email: user?.email || "",
//           contact: cleaned
//         },
//         theme: { color: "#FFD600" },
//         handler: (response) => {
//           setPaying(false);
//           confirmPayment({
//             action: "verify",
//             token: session.access_token,
//             razorpay_order_id: response.razorpay_order_id,
//             razorpay_payment_id: response.razorpay_payment_id,
//             razorpay_signature: response.razorpay_signature
//           });
//         },
//         modal: { ondismiss: () => setPaying(false) }
//       });
//       rzp.on("payment.failed", () => {
//         setStep("failed");
//         setPaying(false);
//       });
//       rzp.open();
//     } catch (err) {
//       console.error("portfolio review payment error:", err);
//       setError("Something went wrong. Please try again.");
//       setPaying(false);
//     }
//   }

//   return (
//     <div className="fixed inset-0 z-[210] flex items-center justify-center md:px-6">
//       <div
//         className="absolute inset-0 bg-evolve-black/70 md:bg-evolve-black/85"
//         onClick={paying ? undefined : onClose}
//       />
//       <div
//         className="relative w-full h-full md:h-auto md:max-w-sm rounded-none md:rounded-3xl border-0 md:border md:border-white/10 px-6 py-7 flex flex-col gap-5 overflow-y-auto"
//         style={{ backgroundColor: "#1c1c1f" }}
//       >
//         {step === "form" && (
//           <>
//             <div>
//               <h3 className="text-white font-bold text-lg">
//                 Book your portfolio review
//               </h3>
//               <p className="text-white/40 text-xs mt-1">
//                 A live 1:1 review with a matched reviewer, a written report, and
//                 a free follow-up.
//               </p>
//             </div>

//             <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 flex flex-col gap-1.5">
//               <div className="flex items-center justify-between text-sm">
//                 <span className="text-white/50">{user?.name || "—"}</span>
//                 <span className="text-white/30 text-xs">
//                   {user?.email || ""}
//                 </span>
//               </div>
//               <div className="flex items-center justify-between text-sm pt-1.5 border-t border-white/10">
//                 <span className="text-white">Live review with a mentor</span>
//                 <span className="text-evolve-yellow font-bold">₹1,400</span>
//               </div>
//             </div>

//             <div className="flex flex-col gap-1.5">
//               <label className="text-white/40 text-xs">Mobile number</label>
//               <div className="flex gap-2">
//                 <div className="flex items-center justify-center px-3 rounded-xl border border-white/15 text-white text-sm font-semibold bg-white/[0.06] flex-shrink-0">
//                   +91
//                 </div>
//                 <input
//                   type="tel"
//                   inputMode="numeric"
//                   placeholder="98765 43210"
//                   value={phone}
//                   disabled={otpStatus === "verified"}
//                   onChange={(e) => {
//                     setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
//                     if (otpStatus !== "idle") resetOtp();
//                   }}
//                   className="flex-1 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 outline-none border border-white/15 focus:border-evolve-yellow/60 disabled:opacity-50 transition-colors"
//                   style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
//                 />
//               </div>
//             </div>

//             {otpStatus !== "idle" && (
//               <div className="flex flex-col gap-2">
//                 <div className="flex items-center gap-2">
//                   <label className="text-white/40 text-xs">
//                     Enter the code sent to +91 {phone}
//                   </label>
//                   {otpStatus === "verified" && <GreenTick />}
//                 </div>
//                 <InputOTP
//                   maxLength={6}
//                   value={otp}
//                   onChange={setOtp}
//                   onComplete={handleOtpComplete}
//                   disabled={otpStatus === "verified" || otpLoading}
//                   autoFocus
//                 >
//                   <InputOTPGroup>
//                     <InputOTPSlot index={0} />
//                     <InputOTPSlot index={1} />
//                     <InputOTPSlot index={2} />
//                   </InputOTPGroup>
//                   <InputOTPSeparator />
//                   <InputOTPGroup>
//                     <InputOTPSlot index={3} />
//                     <InputOTPSlot index={4} />
//                     <InputOTPSlot index={5} />
//                   </InputOTPGroup>
//                 </InputOTP>
//                 {otpError && <p className="text-red-400 text-xs">{otpError}</p>}
//                 {otpStatus === "sent" && (
//                   <div className="flex items-center justify-between text-xs mt-0.5">
//                     <button
//                       type="button"
//                       onClick={resetOtp}
//                       className="text-white/40 hover:text-white/60 transition-colors"
//                     >
//                       Change number
//                     </button>
//                     {resendIn > 0 ? (
//                       <span className="text-white/30">
//                         Resend in {formatTimer(resendIn)}
//                       </span>
//                     ) : (
//                       <button
//                         type="button"
//                         onClick={requestOtp}
//                         disabled={otpLoading}
//                         className="text-evolve-yellow font-semibold hover:opacity-80 disabled:opacity-40 transition-opacity"
//                       >
//                         Resend OTP
//                       </button>
//                     )}
//                   </div>
//                 )}
//               </div>
//             )}

//             {error && <p className="text-red-400 text-sm">{error}</p>}

//             {otpStatus === "verified" ? (
//               <button
//                 onClick={handlePay}
//                 disabled={paying}
//                 className="w-full inline-flex items-center justify-center gap-2 bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl py-3.5 disabled:opacity-40 active:opacity-80 transition-opacity"
//               >
//                 {paying ? "Processing…" : "Proceed to payment"}
//                 {!paying && (
//                   <img src={right_arrow_icon} alt="" className="w-4 h-4" />
//                 )}
//               </button>
//             ) : (
//               <button
//                 onClick={requestOtp}
//                 disabled={
//                   otpStatus === "sent" || otpLoading || phone.trim().length < 10
//                 }
//                 className="w-full inline-flex items-center justify-center gap-2 bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl py-3.5 disabled:opacity-40 active:opacity-80 transition-opacity"
//               >
//                 {otpStatus === "sent"
//                   ? otpLoading
//                     ? "Verifying…"
//                     : "Enter the code above"
//                   : otpLoading
//                     ? "Sending OTP…"
//                     : "Get OTP"}
//                 {otpStatus === "idle" && !otpLoading && (
//                   <img src={right_arrow_icon} alt="" className="w-4 h-4" />
//                 )}
//               </button>
//             )}
//             <button
//               onClick={onClose}
//               className="text-white/40 text-xs text-center hover:text-white/60"
//             >
//               Cancel
//             </button>
//           </>
//         )}

//         {step === "confirming" && (
//           <div className="flex flex-col items-center gap-4 text-center py-6">
//             <div className="w-10 h-10 border-2 border-evolve-yellow border-t-transparent rounded-full animate-spin" />
//             <div>
//               <h3 className="text-white font-bold text-lg">
//                 Confirming your payment…
//               </h3>
//               <p className="text-white/40 text-xs mt-1">
//                 This only takes a few seconds.
//               </p>
//             </div>
//           </div>
//         )}

//         {step === "confirm_timeout" && (
//           <div className="flex flex-col items-center gap-4 text-center py-2">
//             <div className="w-16 h-16 rounded-full border-4 border-evolve-yellow/60 flex items-center justify-center">
//               <span className="text-evolve-yellow text-2xl font-bold leading-none">
//                 ⏳
//               </span>
//             </div>
//             <div>
//               <h3 className="text-white font-bold text-lg">
//                 Couldn't confirm your payment
//               </h3>
//               <p className="text-white/40 text-xs mt-1">
//                 If you were charged, this is usually a network hiccup — try
//                 again. Nothing's lost.
//               </p>
//             </div>
//             <button
//               onClick={() => confirmPayment(pendingPayload)}
//               className="w-full bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl py-3.5 active:opacity-80"
//             >
//               Try again
//             </button>
//             <button
//               onClick={onClose}
//               className="text-white/40 text-xs text-center hover:text-white/60"
//             >
//               Close for now
//             </button>
//           </div>
//         )}

//         {step === "success" && (
//           <div className="flex flex-col items-center gap-4 text-center py-2">
//             <div className="w-16 h-16 rounded-full border-4 border-green-400 flex items-center justify-center">
//               <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
//                 <path
//                   d="M8 18l7 7 13-14"
//                   stroke="#4ade80"
//                   strokeWidth="3.5"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 />
//               </svg>
//             </div>
//             <div>
//               <h3 className="text-white font-bold text-lg">You're booked</h3>
//               <p className="text-white/40 text-xs mt-1">
//                 Let's get your pre-review questionnaire out of the way.
//               </p>
//             </div>
//             <button
//               onClick={() => onSuccess(confirmedRow)}
//               className="w-full bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl py-3.5 active:opacity-80"
//             >
//               Start your review →
//             </button>
//           </div>
//         )}

//         {step === "failed" && (
//           <div className="flex flex-col items-center gap-4 text-center py-2">
//             <div className="w-16 h-16 rounded-full border-4 border-red-400 flex items-center justify-center">
//               <span className="text-red-400 text-3xl font-bold leading-none">
//                 !
//               </span>
//             </div>
//             <div>
//               <h3 className="text-white font-bold text-lg">Payment failed</h3>
//               <p className="text-white/40 text-xs mt-1">
//                 Nothing was charged — try again when ready.
//               </p>
//             </div>
//             <button
//               onClick={() => setStep("form")}
//               className="w-full bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl py-3.5 active:opacity-80"
//             >
//               Retry
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// /**
//  * The full Portfolio Review programme page — hero through FAQ, plus the
//  * booking modal. Deliberately has no outer page chrome (no background, no
//  * top bar) of its own so it can be dropped straight into any layout: the
//  * standalone /programmes/portfolio-review route wraps it in a "back to
//  * profile" bar, and the profile dashboard drops it into the right-hand
//  * content pane, next to the persistent sidebar, via `onBack`.
//  */
// export default function PortfolioReviewProgramme({ user, onBack }) {
//   const { refreshUser } = useAuth();
//   const [bookOpen, setBookOpen] = useState(false);
//   // Every paid attempt gets its own row (see evolve_portfolio_reviews_cycles
//   // migration), oldest first, so `reviewRows.at(-1)` is always the cycle
//   // currently being worked on/reviewed. Rows before it are always finished
//   // (a new cycle only ever opens once the prior one has a report) — the
//   // workspace renders them as read-only "review 1", "review 2", … history.
//   const [reviewRows, setReviewRows] = useState([]);
//   const [checkingReview, setCheckingReview] = useState(true);
//   const [growthModal, setGrowthModal] = useState(null);

//   // Advances the growth mascot and surfaces a celebratory modal — but never
//   // regresses it (e.g. a repeat "apply again" cycle shouldn't re-show the
//   // stage-2 moment once the learner is already further along).
//   async function advanceGrowthStage(target, heading, message) {
//     if ((user.growth_stage ?? 0) >= target) return;
//     await supabase
//       .from("profiles")
//       .update({ growth_stage: target })
//       .eq("id", user.id);
//     await refreshUser();
//     setGrowthModal({ progress: target, heading, message });
//   }

//   function handleBookingSuccess(row) {
//     setBookOpen(false);
//     setReviewRows((prev) => [...prev, row]);
//     advanceGrowthStage(
//       PAYMENT_GROWTH_STAGE,
//       "You're one step closer 🌱",
//       "Your seed is sprouting — you've booked your portfolio review. Keep the momentum going."
//     );
//   }

//   const loadReviews = useCallback(async () => {
//     const { data } = await supabase
//       .from("evolve_portfolio_reviews")
//       .select("*")
//       .eq("user_id", user.id)
//       .order("attempt", { ascending: true });
//     setReviewRows(data || []);
//     setCheckingReview(false);
//   }, [user.id]);

//   useEffect(() => {
//     loadReviews();
//   }, [loadReviews]);

//   if (checkingReview) {
//     return (
//       <div className="flex items-center justify-center py-24">
//         <div className="w-8 h-8 border-2 border-evolve-yellow border-t-transparent rounded-full animate-spin" />
//       </div>
//     );
//   }

//   const activeRow = reviewRows.length
//     ? reviewRows[reviewRows.length - 1]
//     : null;
//   const history = reviewRows.slice(0, -1);

//   // Already paid (a row only ever exists once the webhook confirms
//   // payment) — skip the marketing page entirely and resume the workspace
//   // wherever they left off. `onApplyAgain` reuses the same payment modal to
//   // open a brand-new cycle once the current one's report is ready.
//   if (activeRow) {
//     return (
//       <>
//         <PortfolioReviewFlow
//           user={user}
//           onBack={onBack}
//           review={activeRow}
//           history={history}
//           onApplyAgain={() => setBookOpen(true)}
//         />
//         {bookOpen && (
//           <BookModal
//             user={user}
//             onClose={() => setBookOpen(false)}
//             onSuccess={handleBookingSuccess}
//           />
//         )}
//         {growthModal && (
//           <GrowthStageModal
//             {...growthModal}
//             onContinue={() => setGrowthModal(null)}
//           />
//         )}
//       </>
//     );
//   }

//   return (
//     <div className="flex flex-col gap-14">
//       {onBack && (
//         <button
//           onClick={onBack}
//           className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm font-semibold w-fit transition-colors"
//         >
//           <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
//             <path
//               d="M12.5 15L7.5 10L12.5 5"
//               stroke="currentColor"
//               strokeWidth="2.2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             />
//           </svg>
//           Back to programmes
//         </button>
//       )}

//       {/* hero */}
//       <div>
//         <p className="text-white/30 text-[11px] font-bold uppercase tracking-[0.16em] mb-3">
//           programme
//         </p>
//         <h1
//           className="text-white font-bold font-bricolage"
//           style={{ fontSize: "clamp(30px,5vw,44px)", letterSpacing: "-0.02em" }}
//         >
//           Portfolio Review
//         </h1>
//         <p className="text-white/50 text-[15px] leading-relaxed mt-4 max-w-xl">
//           Industry eyes on your portfolio — a review that goes beyond what's on
//           screen. Get a personalised report plus a live 1:1 discussion with a
//           working reviewer, so you build a stronger portfolio for internships,
//           placements, and beyond.
//         </p>
//         <div className="flex flex-wrap gap-2 mt-5">
//           <Chip>Live 1:1 review</Chip>
//           <Chip>Written report</Chip>
//           <Chip>1 free follow-up</Chip>
//         </div>
//         <button
//           onClick={() =>
//             document
//               .getElementById("pr-pricing")
//               ?.scrollIntoView({ behavior: "smooth" })
//           }
//           className="mt-6 bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl px-6 py-3.5 active:opacity-80"
//         >
//           See what's included
//         </button>
//       </div>

//       {/* what this solves */}
//       <div>
//         <p className="text-white/30 text-[11px] font-bold uppercase tracking-[0.16em] mb-3">
//           What this solves
//         </p>
//         <div
//           className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 flex flex-col gap-3"
//           style={{ borderLeft: "3px solid #FFD007" }}
//         >
//           <p className="text-white/70 text-sm leading-relaxed">
//             You can spend months building a portfolio and still never hear what
//             an industry reviewer actually thinks of it before you're in the
//             interview.
//           </p>
//           <p className="text-white/70 text-sm leading-relaxed">
//             This review closes that gap: honest, personalised feedback from
//             someone who makes real hiring and studio decisions — early enough to
//             change the outcome.
//           </p>
//         </div>
//       </div>

//       {/* the process */}
//       <div>
//         <p className="text-white/30 text-[11px] font-bold uppercase tracking-[0.16em] mb-2">
//           the process
//         </p>
//         <h2 className="text-white font-bold font-bricolage text-xl mb-3">
//           A structured 1:1 review
//         </h2>
//         <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-xl">
//           Built around one idea: feedback from the people who actually make
//           hiring and design decisions, delivered while you still have time to
//           act on it.
//         </p>
//         <ProcessSteps steps={PROCESS_STEPS} />
//       </div>

//       {/* the panel */}
//       <div>
//         <p className="text-white/30 text-[11px] font-bold uppercase tracking-[0.16em] mb-2">
//           the panel
//         </p>
//         <h2 className="text-white font-bold font-bricolage text-xl mb-3">
//           Industry experts across multiple disciplines
//         </h2>
//         <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-xl">
//           Reviews are conducted by practicing designers from leading product
//           companies, design studios, and startups — each following evolve's
//           structured review framework while bringing their own industry
//           perspective.
//         </p>
//         <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3.5">
//           {REVIEWERS.map((r) => (
//             <div key={r.name} className="flex flex-col gap-2">
//               <div className="aspect-square rounded-xl overflow-hidden bg-white/[0.03] border border-white/10">
//                 <img
//                   src={r.image}
//                   alt={r.name}
//                   className="w-full h-full object-cover"
//                   loading="lazy"
//                 />
//               </div>
//               <p className="text-white text-xs font-bold leading-snug">
//                 {r.name}
//               </p>
//               <p className="text-evolve-yellow text-[11px] font-semibold -mt-1.5">
//                 {r.years}+ yrs
//               </p>
//               <p className="text-white/35 text-[11px] leading-snug">{r.role}</p>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* pricing */}
//       <div id="pr-pricing">
//         <p className="text-white/30 text-[11px] font-bold uppercase tracking-[0.16em] mb-2 hidden md:block">
//           Pricing
//         </p>

//         {/* desktop: one box, split left/right by a divider — no gradient,
//             flat colour throughout */}
//         <div className="hidden md:flex rounded-2xl border border-evolve-yellow/60 bg-white/[0.03] overflow-hidden">
//           <div className="flex-1 px-6 py-6 flex flex-col gap-3">
//             <p className="text-white/40 text-xs uppercase tracking-wide font-semibold">
//               Live review with a mentor
//             </p>
//             <div className="flex items-baseline gap-2">
//               <span className="text-white font-bold text-3xl">₹1,400</span>
//               <span className="text-white/30 text-xs">one-time</span>
//             </div>
//             <p className="text-white/50 text-sm leading-relaxed">
//               A matched reviewer, a live 1:1 call, a written report with
//               actionable fixes, and a free follow-up once you've made your
//               revisions.
//             </p>
//             <button
//               onClick={() => setBookOpen(true)}
//               className="mt-2 bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl py-3.5 active:opacity-80 w-fit px-6"
//             >
//               Get started →
//             </button>
//           </div>
//           <div className="w-px bg-white/10 flex-shrink-0" />
//           <div className="flex-1 px-6 py-6">
//             <p className="text-white/40 text-xs uppercase tracking-wide font-semibold mb-3">
//               What's included
//             </p>
//             <ul className="flex flex-col gap-3">
//               {[
//                 "Pre-review questionnaire feedback tailored to your goals",
//                 "Live 1:1 call with your matched reviewer",
//                 "Written report with actionable fixes",
//                 "1 free follow-up call to check your revisions"
//               ].map((item) => (
//                 <li
//                   key={item}
//                   className="flex items-start gap-2.5 text-white/60 text-sm"
//                 >
//                   <span className="text-evolve-yellow text-sm font-bold flex-shrink-0 leading-tight">
//                     ✓
//                   </span>
//                   {item}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>

//         {/* mobile: single flat-price card, top/bottom split — no gradient,
//             flat colour throughout */}
//         <div className="md:hidden">
//           <p className="text-white/30 text-[11px] font-bold uppercase tracking-[0.16em] mb-2">
//             Pricing
//           </p>
//           <h2 className="text-white font-bold font-bricolage text-xl mb-2">
//             One flat price for a full 1:1 review.
//           </h2>
//           <p className="text-white/50 text-sm leading-relaxed mb-5 max-w-xl">
//             Go deeper with personalised guidance and dedicated reviewer support.
//           </p>
//           <div className="rounded-2xl border border-evolve-yellow/60 bg-white/[0.03] px-5 py-6 flex flex-col gap-4">
//             <p className="text-white/40 text-xs uppercase tracking-wide font-semibold">
//               Live review with a mentor
//             </p>
//             <div className="flex items-baseline gap-2">
//               <span className="text-white font-bold text-3xl">₹1,400</span>
//               <span className="text-white/30 text-xs">per review</span>
//             </div>
//             <p className="text-white/50 text-sm leading-relaxed">
//               A matched reviewer, a live 1:1 call, a written report with
//               actionable fixes, and a free follow-up call once you've made your
//               revisions. Everything is built around your goals.
//             </p>
//             <button
//               onClick={() => setBookOpen(true)}
//               className="bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl py-3.5 active:opacity-80"
//             >
//               Get started →
//             </button>

//             <div className="border-t border-white/10 pt-4">
//               <p className="text-white/40 text-xs uppercase tracking-wide font-semibold mb-3">
//                 What's included
//               </p>
//               <ul className="flex flex-col gap-3">
//                 {[
//                   "Pre-review questionnaire feedback tailored to your goals",
//                   "Live 1:1 call with your matched reviewer",
//                   "Written report with actionable fixes",
//                   "1 free follow-up call to check your revisions"
//                 ].map((item) => (
//                   <li
//                     key={item}
//                     className="flex items-start gap-2.5 text-white/60 text-sm"
//                   >
//                     <span className="text-evolve-yellow text-sm font-bold flex-shrink-0 leading-tight">
//                       ✓
//                     </span>
//                     {item}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* FAQ */}
//       <div>
//         <p className="text-white/30 text-[11px] font-bold uppercase tracking-[0.16em] mb-3">
//           Good to know
//         </p>
//         <div className="rounded-2xl border border-white/10 divide-y divide-white/10 overflow-hidden">
//           {FAQ.map(([q, a]) => (
//             <details key={q} className="group px-5 py-4">
//               <summary className="text-white text-sm font-semibold cursor-pointer list-none flex items-center justify-between gap-4">
//                 {q}
//                 <span className="text-white/30 group-open:rotate-45 transition-transform text-lg leading-none">
//                   +
//                 </span>
//               </summary>
//               <p className="text-white/40 text-sm mt-2.5 leading-relaxed">
//                 {a}
//               </p>
//             </details>
//           ))}
//         </div>
//       </div>

//       {/* sticky enrol bar */}
//       <div className="sticky bottom-0 -mx-6 md:-mx-8 border-t border-white/10 bg-[#1c1c1f]/95 backdrop-blur px-6 md:px-8 py-4 flex items-center justify-between gap-4">
//         <div>
//           <p className="text-white font-bold text-sm">Portfolio Review</p>
//           <p className="text-white/30 text-xs">
//             ₹1,400 · live 1:1 review + written report + free follow-up
//           </p>
//         </div>
//         <button
//           onClick={() => setBookOpen(true)}
//           className="bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl px-6 py-3 active:opacity-80 flex-shrink-0"
//         >
//           Get started →
//         </button>
//       </div>

//       {bookOpen && (
//         <BookModal
//           user={user}
//           onClose={() => setBookOpen(false)}
//           onSuccess={handleBookingSuccess}
//         />
//       )}
//       {growthModal && (
//         <GrowthStageModal
//           {...growthModal}
//           onContinue={() => setGrowthModal(null)}
//         />
//       )}
//     </div>
//   );
// }

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../hooks/useAuth";
import ProcessSteps from "./ProcessSteps";
import PortfolioReviewFlow from "./PortfolioReviewFlow";
import GrowthStageModal from "../GrowthStageModal";
import { REVIEWERS } from "../../lib/reviewerRouting";

// growth_stage (0-100) reached once a Portfolio Review payment unlocks the
// workspace — see src/lib/growthStage.js for the seed→sprout mapping.
const PAYMENT_GROWTH_STAGE = 20;

// Streams we currently have reviewers matched to. Anyone whose stream falls
// outside this list gets a "join waitlist" CTA instead of "pay" in the
// booking modal below, since we can't route them to a reviewer yet.
const SUPPORTED_STREAMS = [
  "Visual Communication",
  "Interaction Design",
  "Industrial Design",
  "Moving Images",
  "Space Design",
  "Architecture",
  "Textile and Fashion Design"
];

const PROCESS_STEPS = [
  {
    title: "Pre-review questionnaire",
    body: "You share your goals so feedback is tailored to where you want to go."
  },
  {
    title: "Send your portfolio",
    body: "A PDF or live link — Behance, Notion, your own site. A resume helps too."
  },
  {
    title: "Matched reviewer",
    body: "A working reviewer studies your work against your stated goals."
  },
  {
    title: "Live 1:1 call",
    body: "You go through the portfolio together, screen-shared. A conversation, not a presentation."
  },
  {
    title: "Written report",
    body: "Actionable fixes in writing, sent within 3 working days of the call."
  }
];

const FAQ = [
  [
    "What format should my portfolio be in?",
    "A PDF or a live link (Behance, Notion, your own site) both work. If you have a resume, attach that too."
  ],
  [
    "How long until I get my report?",
    "Your written report is sent within 3 working days after your 1:1 call."
  ],
  [
    "What happens on the 1:1 call?",
    "You and your reviewer go through your portfolio together, screen-shared — a conversation, not a presentation."
  ],
  [
    "Refund policy?",
    "Cancel more than 48 hours before your scheduled call for a full refund. Within 48 hours, you can reschedule once at no extra cost."
  ],
  [
    "When can I use my free follow-up call?",
    "The follow-up call is yours to use once you've made revisions based on your first call. There's no hard deadline — take the time you need to rework your portfolio, then book it when you feel ready."
  ],
  [
    "What if I need to reschedule my call?",
    "No problem. You can reschedule up to 24 hours before your call without any issue — just use the link in your confirmation email to pick a new slot."
  ]
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
  const [step, setStep] = useState("form"); // form | confirming | success | confirm_timeout | failed | waitlist_success
  const [confirmedRow, setConfirmedRow] = useState(null);
  const [pendingPayload, setPendingPayload] = useState(null);
  // Prefilled from onboarding — matched case-insensitively against the
  // supported list so an exact-but-differently-cased profile value (e.g.
  // "architecture") still lands on the right option instead of "Other".
  const [streamChoice, setStreamChoice] = useState(() => {
    const s = (user?.stream || "").trim();
    const match = SUPPORTED_STREAMS.find(
      (v) => v.toLowerCase() === s.toLowerCase()
    );
    return match || (s ? "Other" : "");
  });
  const isSupportedStream = SUPPORTED_STREAMS.includes(streamChoice);

  // Verifies the payment (or dev-bypasses it) and unlocks the review
  // workspace — synchronous and server-verified, no dependency on a
  // Razorpay dashboard webhook ever firing.
  async function confirmPayment(payload) {
    setStep("confirming");
    setPendingPayload(payload);
    const res = await fetch("/api/razorpay-create-order-portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (res?.ok && data?.review) {
      setConfirmedRow(data.review);
      setStep("success");
    } else {
      setStep("confirm_timeout");
    }
  }

  // Booking is the first moment we ever ask someone to confirm their
  // stream against the supported list — the profile's onboarding-time
  // value (possibly stale, mistyped, or never asked) may not match what
  // they just picked here, so reconcile it before charging or waitlisting.
  async function persistStreamIfChanged() {
    const next = streamChoice === "Other" ? "" : streamChoice;
    if (next && next !== (user?.stream || "")) {
      await supabase
        .from("profiles")
        .update({ stream: next })
        .eq("id", user.id);
    }
  }

  async function handleJoinWaitlist() {
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
      await supabase.from("portfolio_review_stream_waitlist").upsert(
        {
          user_id: user.id,
          email: user?.email || "",
          name: user?.name || "",
          phone: cleaned,
          stream: streamChoice === "Other" ? "Other / not listed" : streamChoice
        },
        { onConflict: "user_id" }
      );
      setStep("waitlist_success");
    } catch (err) {
      console.error("portfolio review waitlist error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setPaying(false);
    }
  }

  async function handlePay() {
    const cleaned = phone.trim().replace(/\s+/g, "");
    if (cleaned.length < 10) {
      setError("Please enter a valid mobile number");
      return;
    }
    if (!isSupportedStream) {
      setError("Please select your stream first");
      return;
    }
    setError("");
    setPaying(true);
    try {
      await persistStreamIfChanged();
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setError("Razorpay failed to load. Check your internet.");
        setPaying(false);
        return;
      }

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
        await confirmPayment({ token: session.access_token, devConfirm: true });
        return;
      }

      const res = await fetch("/api/razorpay-create-order-portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleaned, token: session.access_token })
      });
      if (!res.ok) throw new Error("Failed to create order");
      const { order_id, amount, currency } = await res.json();

      const rzp = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_API_KEY,
        amount: String(amount),
        currency,
        name: "evolve design",
        description: "Portfolio Review — live 1:1 review",
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
      console.error("portfolio review payment error:", err);
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
              <h3 className="text-white font-bold text-lg">
                Book your portfolio review
              </h3>
              <p className="text-white/40 text-xs mt-1">
                A live 1:1 review with a matched reviewer, a written report, and
                a free follow-up.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/50">{user?.name || "—"}</span>
                <span className="text-white/30 text-xs">
                  {user?.email || ""}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm pt-1.5 border-t border-white/10">
                <span className="text-white">Live review with a mentor</span>
                <span className="text-evolve-yellow font-bold">₹1,400</span>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm gap-3">
                <span className="text-white/50 flex-shrink-0">
                  College / school
                </span>
                <span className="text-white text-xs font-semibold text-right truncate">
                  {user?.school_name || "—"}
                </span>
              </div>
              <div className="flex flex-col gap-1.5 pt-2 border-t border-white/10">
                <label className="text-white/40 text-xs">
                  Confirm your stream
                </label>
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
                {streamChoice && !isSupportedStream && (
                  <p className="text-white/40 text-[11px] leading-relaxed">
                    join the waitlist and we'll notify you once it's covered.
                    You can switch to a listed stream above anytime.
                  </p>
                )}
              </div>
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

            {isSupportedStream ? (
              <button
                onClick={handlePay}
                disabled={paying || phone.trim().length < 10}
                className="w-full bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl py-3.5 disabled:opacity-40 active:opacity-80 transition-opacity"
              >
                {paying ? "Processing…" : "Proceed to payment →"}
              </button>
            ) : (
              <button
                onClick={handleJoinWaitlist}
                disabled={paying || phone.trim().length < 10 || !streamChoice}
                className="w-full bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl py-3.5 disabled:opacity-40 active:opacity-80 transition-opacity"
              >
                {paying ? "Adding you…" : "Join the waitlist →"}
              </button>
            )}
            <button
              onClick={onClose}
              className="text-white/40 text-xs text-center hover:text-white/60"
            >
              Cancel
            </button>
          </>
        )}

        {step === "waitlist_success" && (
          <div className="flex flex-col items-center gap-4 text-center py-2">
            <div className="w-16 h-16 rounded-full border-4 border-evolve-yellow/60 flex items-center justify-center">
              <span className="text-evolve-yellow text-2xl font-bold leading-none">
                ⏳
              </span>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">
                You're on the waitlist
              </h3>
              <p className="text-white/40 text-xs mt-1">
                We'll email you the moment reviewers for your stream are ready.
                Want to book now instead? Come back here and switch to a listed
                stream anytime.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl py-3.5 active:opacity-80"
            >
              Close
            </button>
            <button
              onClick={() => setStep("form")}
              className="text-white/40 text-xs text-center hover:text-white/60"
            >
              Back to form
            </button>
          </div>
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
              <h3 className="text-white font-bold text-lg">You're booked</h3>
              <p className="text-white/40 text-xs mt-1">
                Let's get your pre-review questionnaire out of the way.
              </p>
            </div>
            <button
              onClick={() => onSuccess(confirmedRow)}
              className="w-full bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl py-3.5 active:opacity-80"
            >
              Start your review →
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

/**
 * The full Portfolio Review programme page — hero through FAQ, plus the
 * booking modal. Deliberately has no outer page chrome (no background, no
 * top bar) of its own so it can be dropped straight into any layout: the
 * standalone /programmes/portfolio-review route wraps it in a "back to
 * profile" bar, and the profile dashboard drops it into the right-hand
 * content pane, next to the persistent sidebar, via `onBack`.
 */
export default function PortfolioReviewProgramme({ user, onBack }) {
  const { refreshUser } = useAuth();
  const [bookOpen, setBookOpen] = useState(false);
  // Every paid attempt gets its own row (see evolve_portfolio_reviews_cycles
  // migration), oldest first, so `reviewRows.at(-1)` is always the cycle
  // currently being worked on/reviewed. Rows before it are always finished
  // (a new cycle only ever opens once the prior one has a report) — the
  // workspace renders them as read-only "review 1", "review 2", … history.
  const [reviewRows, setReviewRows] = useState([]);
  const [checkingReview, setCheckingReview] = useState(true);
  const [growthModal, setGrowthModal] = useState(null);

  // Advances the growth mascot and surfaces a celebratory modal — but never
  // regresses it (e.g. a repeat "apply again" cycle shouldn't re-show the
  // stage-2 moment once the learner is already further along).
  async function advanceGrowthStage(target, heading, message) {
    if ((user.growth_stage ?? 0) >= target) return;
    await supabase
      .from("profiles")
      .update({ growth_stage: target })
      .eq("id", user.id);
    await refreshUser();
    setGrowthModal({ progress: target, heading, message });
  }

  function handleBookingSuccess(row) {
    setBookOpen(false);
    setReviewRows((prev) => [...prev, row]);
    advanceGrowthStage(
      PAYMENT_GROWTH_STAGE,
      "You're one step closer 🌱",
      "Your seed is sprouting, you've booked your portfolio review. Keep the momentum going."
    );
  }

  const loadReviews = useCallback(async () => {
    const { data } = await supabase
      .from("evolve_portfolio_reviews")
      .select("*")
      .eq("user_id", user.id)
      .order("attempt", { ascending: true });
    setReviewRows(data || []);
    setCheckingReview(false);
  }, [user.id]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  if (checkingReview) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-evolve-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeRow = reviewRows.length
    ? reviewRows[reviewRows.length - 1]
    : null;
  const history = reviewRows.slice(0, -1);

  // Already paid (a row only ever exists once the webhook confirms
  // payment) — skip the marketing page entirely and resume the workspace
  // wherever they left off. `onApplyAgain` reuses the same payment modal to
  // open a brand-new cycle once the current one's report is ready.
  if (activeRow) {
    return (
      <>
        <PortfolioReviewFlow
          user={user}
          onBack={onBack}
          review={activeRow}
          history={history}
          onApplyAgain={() => setBookOpen(true)}
        />
        {bookOpen && (
          <BookModal
            user={user}
            onClose={() => setBookOpen(false)}
            onSuccess={handleBookingSuccess}
          />
        )}
        {growthModal && (
          <GrowthStageModal
            {...growthModal}
            onContinue={() => setGrowthModal(null)}
          />
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-14">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm font-semibold w-fit transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path
              d="M12.5 15L7.5 10L12.5 5"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to programmes
        </button>
      )}

      {/* hero */}
      <div>
        <p className="text-white/30 text-[11px] font-bold uppercase tracking-[0.16em] mb-3">
          programme
        </p>
        <h1
          className="text-white font-bold font-bricolage"
          style={{ fontSize: "clamp(30px,5vw,44px)", letterSpacing: "-0.02em" }}
        >
          Portfolio Review
        </h1>
        <p className="text-white/50 text-[15px] leading-relaxed mt-4 max-w-xl">
          Industry eyes on your portfolio — a review that goes beyond what's on
          screen. Get a personalised report plus a live 1:1 discussion with a
          working reviewer, so you build a stronger portfolio for internships,
          placements, and beyond.
        </p>
        <div className="flex flex-wrap gap-2 mt-5">
          <Chip>Live 1:1 review</Chip>
          <Chip>Written report</Chip>
          <Chip>1 free follow-up</Chip>
        </div>
        <button
          onClick={() =>
            document
              .getElementById("pr-pricing")
              ?.scrollIntoView({ behavior: "smooth" })
          }
          className="mt-6 bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl px-6 py-3.5 active:opacity-80"
        >
          See what's included
        </button>
      </div>

      {/* what this solves */}
      <div>
        <p className="text-white/30 text-[11px] font-bold uppercase tracking-[0.16em] mb-3">
          What this solves
        </p>
        <div
          className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 flex flex-col gap-3"
          style={{ borderLeft: "3px solid #FFD007" }}
        >
          <p className="text-white/70 text-sm leading-relaxed">
            You can spend months building a portfolio and still never hear what
            an industry reviewer actually thinks of it before you're in the
            interview.
          </p>
          <p className="text-white/70 text-sm leading-relaxed">
            This review closes that gap: honest, personalised feedback from
            someone who makes real hiring and studio decisions — early enough to
            change the outcome.
          </p>
        </div>
      </div>

      {/* the process */}
      <div>
        <p className="text-white/30 text-[11px] font-bold uppercase tracking-[0.16em] mb-2">
          the process
        </p>
        <h2 className="text-white font-bold font-bricolage text-xl mb-3">
          A structured 1:1 review
        </h2>
        <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-xl">
          Built around one idea: feedback from the people who actually make
          hiring and design decisions, delivered while you still have time to
          act on it.
        </p>
        <ProcessSteps steps={PROCESS_STEPS} />
      </div>

      {/* the panel */}
      <div>
        <p className="text-white/30 text-[11px] font-bold uppercase tracking-[0.16em] mb-2">
          the panel
        </p>
        <h2 className="text-white font-bold font-bricolage text-xl mb-3">
          Industry experts across multiple disciplines
        </h2>
        <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-xl">
          Reviews are conducted by practicing designers from leading product
          companies, design studios, and startups — each following evolve's
          structured review framework while bringing their own industry
          perspective.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {REVIEWERS.map((r) => (
            <div key={r.name} className="flex flex-col gap-2">
              <div className="aspect-square rounded-xl overflow-hidden bg-white/[0.03] border border-white/10">
                <img
                  src={r.image}
                  alt={r.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <p className="text-white text-xs font-bold leading-snug">
                {r.name}
              </p>
              <p className="text-evolve-yellow text-[11px] font-semibold -mt-1.5">
                {r.years}+ yrs
              </p>
              <p className="text-white/35 text-[11px] leading-snug">{r.role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* pricing */}
      <div id="pr-pricing">
        <p className="text-white/30 text-[11px] font-bold uppercase tracking-[0.16em] mb-2 hidden md:block">
          Pricing
        </p>

        {/* desktop: one box, split left/right by a divider — no gradient,
            flat colour throughout */}
        <div className="hidden md:flex rounded-2xl border border-evolve-yellow/60 bg-white/[0.03] overflow-hidden">
          <div className="flex-1 px-6 py-6 flex flex-col gap-3">
            <p className="text-white/40 text-xs uppercase tracking-wide font-semibold">
              Live review with a mentor
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-white font-bold text-3xl">₹1,400</span>
              <span className="text-white/30 text-xs">one-time</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              A matched reviewer, a live 1:1 call, a written report with
              actionable fixes, and a free follow-up once you've made your
              revisions.
            </p>
            <button
              onClick={() => setBookOpen(true)}
              className="mt-2 bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl py-3.5 active:opacity-80 w-fit px-6"
            >
              Get started →
            </button>
          </div>
          <div className="w-px bg-white/10 flex-shrink-0" />
          <div className="flex-1 px-6 py-6">
            <p className="text-white/40 text-xs uppercase tracking-wide font-semibold mb-3">
              What's included
            </p>
            <ul className="flex flex-col gap-3">
              {[
                "Pre-review questionnaire feedback tailored to your goals",
                "Live 1:1 call with your matched reviewer",
                "Written report with actionable fixes",
                "1 free follow-up call to check your revisions"
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-white/60 text-sm"
                >
                  <span className="text-evolve-yellow text-sm font-bold flex-shrink-0 leading-tight">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* mobile: single flat-price card, top/bottom split — no gradient,
            flat colour throughout */}
        <div className="md:hidden">
          <p className="text-white/30 text-[11px] font-bold uppercase tracking-[0.16em] mb-2">
            Pricing
          </p>
          <h2 className="text-white font-bold font-bricolage text-xl mb-2">
            One flat price for a full 1:1 review.
          </h2>
          <p className="text-white/50 text-sm leading-relaxed mb-5 max-w-xl">
            Go deeper with personalised guidance and dedicated reviewer support.
          </p>
          <div className="rounded-2xl border border-evolve-yellow/60 bg-white/[0.03] px-5 py-6 flex flex-col gap-4">
            <p className="text-white/40 text-xs uppercase tracking-wide font-semibold">
              Live review with a mentor
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-white font-bold text-3xl">₹1,400</span>
              <span className="text-white/30 text-xs">per review</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              A matched reviewer, a live 1:1 call, a written report with
              actionable fixes, and a free follow-up call once you've made your
              revisions. Everything is built around your goals.
            </p>
            <button
              onClick={() => setBookOpen(true)}
              className="bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl py-3.5 active:opacity-80"
            >
              Get started →
            </button>

            <div className="border-t border-white/10 pt-4">
              <p className="text-white/40 text-xs uppercase tracking-wide font-semibold mb-3">
                What's included
              </p>
              <ul className="flex flex-col gap-3">
                {[
                  "Pre-review questionnaire feedback tailored to your goals",
                  "Live 1:1 call with your matched reviewer",
                  "Written report with actionable fixes",
                  "1 free follow-up call to check your revisions"
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-white/60 text-sm"
                  >
                    <span className="text-evolve-yellow text-sm font-bold flex-shrink-0 leading-tight">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div>
        <p className="text-white/30 text-[11px] font-bold uppercase tracking-[0.16em] mb-3">
          Good to know
        </p>
        <div className="rounded-2xl border border-white/10 divide-y divide-white/10 overflow-hidden">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group px-5 py-4">
              <summary className="text-white text-sm font-semibold cursor-pointer list-none flex items-center justify-between gap-4">
                {q}
                <span className="text-white/30 group-open:rotate-45 transition-transform text-lg leading-none">
                  +
                </span>
              </summary>
              <p className="text-white/40 text-sm mt-2.5 leading-relaxed">
                {a}
              </p>
            </details>
          ))}
        </div>
      </div>

      {/* sticky enrol bar */}
      <div className="sticky bottom-0 -mx-6 md:-mx-8 border-t border-white/10 bg-[#1c1c1f]/95 backdrop-blur px-6 md:px-8 py-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-white font-bold text-sm">Portfolio Review</p>
          <p className="text-white/30 text-xs">
            ₹1,400 · live 1:1 review + written report + free follow-up
          </p>
        </div>
        <button
          onClick={() => setBookOpen(true)}
          className="bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl px-6 py-3 active:opacity-80 flex-shrink-0"
        >
          Get started →
        </button>
      </div>

      {bookOpen && (
        <BookModal
          user={user}
          onClose={() => setBookOpen(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
      {growthModal && (
        <GrowthStageModal
          {...growthModal}
          onContinue={() => setGrowthModal(null)}
        />
      )}
    </div>
  );
}
