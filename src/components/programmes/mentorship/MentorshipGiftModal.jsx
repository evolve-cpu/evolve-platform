import { useState } from "react";
import { surprise_box, surprise_box_open } from "../../../assets/images/Mentorship";

/**
 * Two-step "claim your gift" celebration modal shown right after a
 * successful mentorship payment. Content/design copied from the pre-payment
 * gift1/gift2 steps in src/pages/Payment.jsx (the existing mentorship
 * checkout flow) — same copy, same reveal, just run as an overlay here
 * (instead of Payment.jsx's full-page step) and placed after payment
 * instead of before it.
 */
export default function MentorshipGiftModal({ user, onContinue }) {
  const [step, setStep] = useState("gift1"); // gift1 | gift2
  const firstName = user?.name?.split(" ")[0] || "";

  return (
    <div
      className="fixed inset-0 z-[220] flex items-center justify-center px-6"
      style={{ backgroundColor: "#161618" }}
    >
      {/* gift1 base */}
      <div className="flex flex-col items-center gap-6 w-full max-w-xs text-center">
        <div className="flex flex-col gap-1">
          <p
            className="text-evolve-yellow font-extrabold leading-tight"
            style={{ fontSize: "clamp(28px,7vw,40px)", letterSpacing: "-0.02em" }}
          >
            welcome to evolve
            <span style={{ color: "rgba(223,5,134,1)" }}>
              {firstName ? ` ${firstName}` : ""}!
            </span>
          </p>
          <p className="text-white/60 text-sm">here is a gift for you!</p>
        </div>
        <img src={surprise_box} alt="gift" className="w-52 h-52 object-contain" />
        <button
          onClick={() => setStep("gift2")}
          className="w-full bg-evolve-yellow text-evolve-black font-extrabold text-base rounded-2xl py-4 active:opacity-80"
        >
          claim your gift!
        </button>
      </div>

      {/* gift2 overlay */}
      {step === "gift2" && (
        <div
          className="fixed inset-0 z-[230] flex items-center justify-center px-6 py-8"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
        >
          <div
            className="relative w-full max-w-xs rounded-3xl overflow-hidden flex flex-col items-center py-10 px-6 gap-4"
            style={{ backgroundColor: "rgba(255,208,7,1)" }}
          >
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
              onClick={onContinue}
              className="relative z-10 w-full bg-evolve-black text-evolve-yellow font-extrabold text-base rounded-2xl py-4 active:opacity-80 mt-2"
            >
              claim your gift!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
