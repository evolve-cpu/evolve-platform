import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../supabaseClient";
import {
  accessState,
  planPrice,
  tierFor,
  inr,
  ITEM_PRICES,
  PLAN_PRICES
} from "../../lib/membership";
import { startMembershipCheckout } from "../../lib/membershipCheckout";
import { fireConfetti } from "../../lib/confetti";
import DevMembershipPanel from "./DevMembershipPanel";
import "./membership.css";

/* ── After-trial layer: everything that happens once the 30-day trial is on
   or over, ported from evolve_mobile_after_trial.html:
     • VIP welcome sheet (30 days of VIP access) + confetti, once
     • trial-status sheet from the clock badge on the avatar
     • trial-ended pop-up: what's locked → how do you want to unlock
       (pay as you go / monthly / annual, priced by student vs pro)
     • pay sheet: pay for this only, or switch to a plan — with a savings
       nudge once pay-per-item spend this month passes a monthly plan
     • "you're evolve verified" sheet + confetti
   Any page calls useMembership() to open these. ───────────────────────── */

const MembershipContext = createContext(null);

// outside the provider (e.g. the Anant white-label tenant, which has no
// paid tier) everything behaves as fully unlocked and the openers no-op
const NO_MEMBERSHIP = {
  access: { phase: "trial", mode: "sub", plan: null, full: true, daysLeft: null, reviewCredits: 0 },
  openPlans: () => {},
  pay: () => {},
  gate: (_item, run) => run?.(),
  openTrialStatus: () => {},
  showWelcome: () => {},
  showVerified: () => {},
  showVerifyPrompt: () => {}
};

export function useMembership() {
  return useContext(MembershipContext) || NO_MEMBERSHIP;
}

const IC = {
  lock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L19 7" /></svg>
  ),
  cross: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M7 7l10 10M17 7L7 17" /></svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
  ),
  back: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
  ),
  spark: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /></svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.2 2" /></svg>
  ),
  globe: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" /></svg>
  )
};
export const MEMBERSHIP_ICONS = IC;

function Overlay({ onClose, children, z = 9100 }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return createPortal(
    <div
      className="at-ov"
      style={{ zIndex: z }}
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      {children}
    </div>,
    document.body
  );
}

function CloseX({ onClick }) {
  return (
    <button type="button" className="at-x" onClick={onClick} aria-label="Close">
      {IC.x}
    </button>
  );
}

/* ── trial ended: screen 1 (what's locked) → screen 2 (unlock options) ── */
function LockRow({ t, s }) {
  return (
    <div className="at-lk">
      <span className="lic">{IC.lock}</span>
      <div className="sp">
        <div className="tt">{t}</div>
        {s && <div className="ss">{s}</div>}
      </div>
    </div>
  );
}

/* ── student pricing: "are you a student?" → upload ID → student price ──
   Replaces the student/pro question onboarding used to ask. The price drops
   as soon as the ID is uploaded; verify-student-id reads it (and records
   student_id_path) and an admin reviews it later. ─────────────────────── */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const ID_ACCEPTED_TYPES = ".jpg,.jpeg,.png,.pdf";
const MAX_ID_MB = 10;

async function submitStudentId(user, file) {
  const ext = file.name.split(".").pop();
  const path = `${user.id}/id-${Date.now()}.${ext}`;
  const { error: uploadErr } = await supabase.storage
    .from("student-ids")
    .upload(path, file, { upsert: true });
  if (uploadErr) throw new Error(uploadErr.message);

  // best-effort OCR read — it sets verified / unclear itself
  let status = null;
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/verify-student-id`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ user_id: user.id, storage_path: path })
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) status = json.is_clear ? "verified" : "unclear";
  } catch {
    /* falls through to "submitted" */
  }
  if (!status) {
    status = "submitted";
    await supabase
      .from("profiles")
      .update({ student_id_verification_status: status, student_id_path: path })
      .eq("id", user.id);
  }
  return status;
}

function StudentPricing({ user, onStudentId }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (tierFor(user) === "student") {
    return (
      <p className="at-note" style={{ margin: "0 0 12px" }}>
        <span style={{ color: "var(--at-g)" }}>✓ </span>
        Student pricing applied
      </p>
    );
  }

  async function upload() {
    if (!file || busy) return;
    if (file.size > MAX_ID_MB * 1024 * 1024) {
      setError(`That file is over ${MAX_ID_MB} MB.`);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const status = await submitStudentId(user, file);
      onStudentId(status);
    } catch (e) {
      setError(e?.message || "Couldn't upload that. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const s = PLAN_PRICES.student;
  const p = PLAN_PRICES.pro;
  return (
    <div className="at-save" style={{ flexDirection: "column", alignItems: "stretch", margin: "0 0 14px" }}>
      <span>
        <b>Are you a student?</b> Upload your student ID and pay the student price —{" "}
        {inr(s.monthly)} a month instead of {inr(p.monthly)}.
      </span>
      {!open ? (
        <button
          type="button"
          className="at-btn ghost"
          style={{ alignSelf: "flex-start" }}
          onClick={() => setOpen(true)}
        >
          I’m a student
        </button>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          <input
            type="file"
            accept={ID_ACCEPTED_TYPES}
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              setError("");
            }}
            style={{ fontSize: 13, color: "var(--at-mute)" }}
          />
          <button
            type="button"
            className="at-btn"
            style={{ alignSelf: "flex-start" }}
            disabled={!file || busy}
            onClick={upload}
          >
            {busy ? "Uploading…" : "Upload ID and get student price"}
          </button>
          <span className="at-note" style={{ margin: 0 }}>
            JPG, PNG or PDF, up to {MAX_ID_MB} MB. We review it after you pay.
          </span>
          {error && <span className="at-err" style={{ textAlign: "left", margin: 0 }}>{error}</span>}
        </div>
      )}
    </div>
  );
}

function TrialEndedModal({ user, step, setStep, onClose, onSubscribe, onStudentId }) {
  const m = planPrice(user, "monthly");
  const a = planPrice(user, "annual");
  const [card, setCard] = useState(step === 2 ? 2 : 0);
  const carRef = useRef(null);

  // mobile carousel: start on the highlighted (annual) card when opened
  // straight to the options, and keep the dots in sync while swiping
  useEffect(() => {
    const car = carRef.current;
    if (!car || step !== 2) return;
    const cw = () => (car.children[0]?.getBoundingClientRect().width || 0) + 12;
    car.scrollLeft = card * cw();
    const onScroll = () => setCard(Math.round(car.scrollLeft / cw()));
    car.addEventListener("scroll", onScroll, { passive: true });
    return () => car.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  function goCard(i) {
    const car = carRef.current;
    if (!car) return;
    const w = (car.children[0]?.getBoundingClientRect().width || 0) + 12;
    car.scrollTo({ left: i * w, behavior: "smooth" });
  }

  const rows = [
    ["AI assistant", <span className="at-free">Free</span>],
    ["Daily news, microlearning, quizzes", <span className="at-free">Free</span>],
    ["Community event", inr(ITEM_PRICES.COMMUNITY)],
    ["Webinar", inr(ITEM_PRICES.WEBINAR)],
    ["Past session", inr(ITEM_PRICES.RECORDING)],
    ["Portfolio review", inr(ITEM_PRICES.REVIEW)],
    [
      <>Mentorship, per programme<em>No discount</em></>,
      `${inr(ITEM_PRICES.MENTOR_MIN)} to ${inr(ITEM_PRICES.MENTOR_MAX)}`
    ],
    ["Verified profile", <span className="at-mute">Plan only</span>]
  ];
  const base = [
    "Evolve verified profile and public page",
    "All events free, community and webinars",
    "All past sessions",
    "10% off mentorship"
  ];

  return (
    <Overlay onClose={onClose}>
      <div
        className="at-modal"
        style={{ maxWidth: step === 1 ? 600 : 980 }}
        role="dialog"
        aria-modal="true"
      >
        <div className="at-handle" />
        <CloseX onClick={onClose} />
        <div className="at-pad">
          {step === 1 ? (
            <>
              <span className="at-chip">Trial over</span>
              <h1>Your 30-day trial has ended</h1>
              <p className="at-s">
                Daily news, microlearning and quizzes stay free. These are now locked.
              </p>
              <div className="at-locks">
                <LockRow t="evolve verified badge" />
                <LockRow t="Public profile page" />
                <LockRow t="Community events" s={`${inr(ITEM_PRICES.COMMUNITY)} each`} />
                <LockRow t="Webinars" s={`${inr(ITEM_PRICES.WEBINAR)} each`} />
                <LockRow t="Past sessions" s={`${inr(ITEM_PRICES.RECORDING)} each`} />
              </div>
              <button type="button" className="at-btn block" onClick={() => setStep(2)}>
                Let’s unlock
              </button>
            </>
          ) : (
            <>
              <button type="button" className="at-back" onClick={() => setStep(1)}>
                {IC.back}Back
              </button>
              <h1 style={{ margin: "10px 0 14px" }}>How do you want to unlock?</h1>
              <StudentPricing user={user} onStudentId={onStudentId} />
              <div className="at-car" ref={carRef}>
                <div className="at-cc">
                  <h3>Pay as you go</h3>
                  <div className="at-cp">
                    ₹0 <small>to start</small>
                  </div>
                  <p className="at-s" style={{ marginBottom: 10 }}>
                    Pay per event. Verified profile stays locked.
                  </p>
                  <div className="at-plist">
                    {rows.map((r, i) => (
                      <div key={i}>
                        <span>{r[0]}</span>
                        <b>{r[1]}</b>
                      </div>
                    ))}
                  </div>
                  <button type="button" className="at-btn ghost block" style={{ marginTop: "auto" }} onClick={onClose}>
                    Continue
                  </button>
                </div>
                <div className="at-cc">
                  <h3>Monthly</h3>
                  <div className="at-cp">
                    {inr(m)} <small>/ month · cancel anytime</small>
                  </div>
                  <ul className="at-incl">
                    {base.map((b) => (
                      <li key={b}>{IC.check}{b}</li>
                    ))}
                    <li className="off">{IC.cross}1 free portfolio review</li>
                  </ul>
                  <button type="button" className="at-btn block" style={{ marginTop: "auto" }} onClick={() => onSubscribe("monthly")}>
                    Subscribe · {inr(m)} per month
                  </button>
                </div>
                <div className="at-cc hi">
                  <span className="at-tag2">20% off</span>
                  <h3>Annual</h3>
                  <div className="at-cp">
                    {inr(a)} <small>/ year · {inr(a / 12)} a month</small>
                  </div>
                  <ul className="at-incl">
                    {base.map((b) => (
                      <li key={b}>{IC.check}{b}</li>
                    ))}
                    <li>{IC.check}1 free portfolio review</li>
                  </ul>
                  <button type="button" className="at-btn block" style={{ marginTop: "auto" }} onClick={() => onSubscribe("annual")}>
                    Subscribe · {inr(a)} per year
                  </button>
                </div>
              </div>
              <div className="at-dots">
                {[0, 1, 2].map((i) => (
                  <button
                    key={i}
                    type="button"
                    className={card === i ? "on" : ""}
                    aria-label={`Option ${i + 1}`}
                    onClick={() => goCard(i)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Overlay>
  );
}

/* ── pay sheet: this one item, or switch to a plan ──────────────────────── */
function PaySheet({ user, access, pay, setPay, spent, onClose, onFulfilled, onStudentId }) {
  const { item } = pay;
  const isPlanItem = item.kind === "plan";
  const inSub = access.mode === "sub";
  const canSwitch = !inSub && !isPlanItem;
  const M = planPrice(user, "monthly");
  const subPrice = planPrice(user, pay.sub);
  const viaSub = pay.choice === "sub" && canSwitch;
  const due = viaSub ? subPrice : item.price;

  const running = useRef(false);
  async function go(forceItem) {
    if (running.current) return;
    running.current = true;
    const checkoutItem =
      forceItem ||
      (viaSub
        ? { kind: "plan", plan: pay.sub }
        : { kind: item.kind, event_id: item.event_id, plan: item.plan });
    setPay((p) => ({ ...p, step: "proc", error: "" }));
    try {
      await startMembershipCheckout(checkoutItem, user);
      const plan = checkoutItem.kind === "plan" ? checkoutItem.plan : null;
      let doneTitle, doneSub;
      if (isPlanItem) {
        doneTitle = `You’re on the ${plan} plan`;
        doneSub =
          "Your verified badge and public profile are back, and all events are free." +
          (plan === "annual" ? " Your free portfolio review is ready to book." : "");
      } else if (plan) {
        doneTitle = `You’re on the ${plan} plan`;
        doneSub = `Everything is unlocked, ${item.title} included. Verified badge and public profile are back.`;
      } else {
        doneTitle = "Payment done";
        doneSub = `${item.title} is yours.`;
      }
      setPay((p) => ({ ...p, step: "done", doneTitle, doneSub }));
      onFulfilled();
    } catch (err) {
      if (isPlanItem && err?.dismissed) {
        onClose();
      } else if (isPlanItem) {
        // a plan has no "pay for this only" screen to fall back to
        setPay((p) => ({
          ...p,
          step: "error",
          error: err?.message || "Something went wrong. Please try again."
        }));
      } else {
        setPay((p) => ({
          ...p,
          step: "choose",
          error: err?.dismissed ? "" : err?.message || "Something went wrong. Please try again."
        }));
      }
    } finally {
      running.current = false;
    }
  }

  // a plan bought from the pop-up skips the choice screen and goes
  // straight to checkout, same as the reference
  useEffect(() => {
    if (isPlanItem && pay.step === "proc" && !running.current) go({ kind: "plan", plan: item.plan });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let inner;
  if (pay.step === "error") {
    inner = (
      <>
        <span className="at-chip">Payment didn’t go through</span>
        <h1 style={{ fontSize: 22 }}>
          {item.plan === "annual" ? "Annual" : "Monthly"} plan · {inr(planPrice(user, item.plan))}
        </h1>
        <p className="at-err" style={{ textAlign: "left", marginBottom: 16 }}>
          {pay.error}
        </p>
        <button type="button" className="at-btn block" onClick={() => go({ kind: "plan", plan: item.plan })}>
          Try again
        </button>
        <button type="button" className="at-link" onClick={() => onClose(false)}>
          Not now
        </button>
      </>
    );
  } else if (pay.step === "proc") {
    inner = (
      <>
        <div className="at-spin" />
        <p className="at-t" style={{ textAlign: "center" }}>
          Processing payment…
        </p>
      </>
    );
  } else if (pay.step === "done") {
    inner = (
      <>
        <div className="at-okc">{IC.check}</div>
        <h1 style={{ fontSize: 22, textAlign: "center", margin: 0 }}>{pay.doneTitle}</h1>
        <p className="at-s" style={{ textAlign: "center", margin: "6px 0 18px" }}>
          {pay.doneSub}
        </p>
        <button type="button" className="at-btn block" onClick={() => onClose(true)}>
          Done
        </button>
      </>
    );
  } else {
    const nudge =
      canSwitch && spent >= M ? (
        <div className="at-save">
          {IC.spark}
          <span>
            You’ve already spent <b>{inr(spent)}</b> this month. A monthly plan is {inr(M)}, so you’d
            have saved <b>{inr(spent - M)}</b>.
          </span>
        </div>
      ) : null;

    inner = (
      <>
        <h1 style={{ fontSize: 22, margin: 0 }}>
          {item.kind === "recording" ? "Unlock this session" : "Unlock this"}
        </h1>
        <p className="at-s" style={{ margin: "4px 0 14px" }}>
          {item.sub || ""}
        </p>
        {nudge}
        <div style={{ display: "grid", gap: 12 }}>
          <button
            type="button"
            className={`at-opt ${pay.choice === "direct" ? "sel" : ""}`}
            onClick={() => setPay((p) => ({ ...p, choice: "direct" }))}
          >
            <div className="at-row">
              <div className="at-sp">
                <h3>Pay for this only</h3>
                <div className="at-s">{item.title}</div>
              </div>
              <div className="at-big">{inr(item.price)}</div>
            </div>
          </button>
          {canSwitch && (
            <div
              className={`at-opt ${pay.choice === "sub" ? "sel" : ""}`}
              onClick={() => setPay((p) => ({ ...p, choice: "sub" }))}
              style={{ cursor: "pointer" }}
            >
              <div className="at-row">
                <div className="at-sp">
                  <h3>Switch to a subscription</h3>
                  <div className="at-s">Unlock everything, including this</div>
                </div>
                <div className="at-big">{inr(subPrice)}</div>
              </div>
              <div style={{ marginTop: 12 }}>
                <div className="at-seg">
                  {["monthly", "annual"].map((pl) => (
                    <button
                      key={pl}
                      type="button"
                      className={pay.sub === pl ? "on" : ""}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPay((p) => ({ ...p, sub: pl, choice: "sub" }));
                      }}
                    >
                      {pl === "annual" ? (
                        <>
                          Annual<small>20% off</small>
                        </>
                      ) : (
                        "Monthly"
                      )}
                    </button>
                  ))}
                </div>
              </div>
              {pay.choice === "sub" && (
                <div style={{ marginTop: 12 }} onClick={(e) => e.stopPropagation()}>
                  <StudentPricing user={user} onStudentId={onStudentId} />
                </div>
              )}
              {pay.choice === "sub" && (
                <div className="at-sum">
                  <div className="g">
                    <span>{item.title}</span>
                    <span>Included</span>
                  </div>
                  <div>
                    <span>{pay.sub === "annual" ? "Annual" : "Monthly"} plan</span>
                    <span>{inr(subPrice)}</span>
                  </div>
                  <div className="tot">
                    <span>Today</span>
                    <span>{inr(subPrice)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <button type="button" className="at-btn block" style={{ marginTop: 16 }} onClick={() => go()}>
          {viaSub ? "Subscribe and pay " : "Pay "}
          {inr(due)}
        </button>
        {pay.error && <p className="at-err">{pay.error}</p>}
        <p className="at-note" style={{ textAlign: "center" }}>
          Secure checkout by Razorpay · UPI, cards and net banking
        </p>
      </>
    );
  }

  return (
    <Overlay onClose={pay.step === "proc" ? undefined : () => onClose(pay.step === "done")} z={9200}>
      <div className="at-modal" style={{ maxWidth: 520 }}>
        <div className="at-handle" />
        {pay.step !== "proc" && <CloseX onClick={() => onClose(pay.step === "done")} />}
        <div className="at-pad">{inner}</div>
      </div>
    </Overlay>
  );
}

const ArrowRight = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

/* ── welcome: 30 days of VIP access (reference #trialSheet) ─────────────── */
function VipWelcome({ onClose }) {
  useEffect(() => {
    const t = setTimeout(fireConfetti, 350);
    return () => clearTimeout(t);
  }, []);
  return (
    <Overlay onClose={onClose}>
      <div className="ev-sheet" role="dialog" aria-modal="true">
        <div className="ev-sheet-handle" />
        <div className="vip-gift">🎁</div>
        <div className="ev-sheet-title" style={{ textAlign: "center" }}>
          You’ve unlocked 30 days of VIP Access!
        </div>
        <p className="ev-sheet-hint" style={{ margin: "8px 0 16px", textAlign: "center" }}>
          Here’s your complete pass to everything inside:
        </p>
        <ul className="vip-list">
          <li><span className="vip-e">✨</span>Verified Profile &amp; Public Page</li>
          <li><span className="vip-e">⚡</span>Daily News, Microlearning &amp; Quizzes</li>
          <li><span className="vip-e">🎙️</span>Live Webinars &amp; Archived Recordings</li>
          <li><span className="vip-e">🔥</span>Exclusive AMAs &amp; Community Access</li>
          <li><span className="vip-e">🤖</span>AI Assistant</li>
        </ul>
        <button type="button" className="ev-btn" onClick={onClose}>
          Explore Your Access {ArrowRight}
        </button>
      </div>
    </Overlay>
  );
}

/* ── profile just built: prompt to verify (reference #verifyPromptSheet) ── */
function VerifyPrompt({ onStart, onClose }) {
  return (
    <Overlay onClose={onClose}>
      <div className="ev-sheet" role="dialog" aria-modal="true">
        <div className="ev-sheet-handle" />
        <span className="ev-sheet-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" /><path d="M9 12l2 2 4-4" /></svg>
        </span>
        <div className="ev-sheet-title">Your profile is ready. Get it verified</div>
        <p className="ev-sheet-hint">
          Verified profiles are the ones we put in front of hiring partners. Two quick questions and a
          short call. It’s <b style={{ color: "#FFD007", fontWeight: 600 }}>free during your trial</b>.
        </p>
        <button type="button" className="ev-btn" onClick={onStart}>
          Start verification {ArrowRight}
        </button>
        <button type="button" className="at-link" onClick={onClose}>
          Maybe later
        </button>
      </div>
    </Overlay>
  );
}

/* ── trial status, from the clock badge on the avatar ──────────────────── */
function fmtDay(iso) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function trialBannerCopy(user, access) {
  if (access.phase === "trial") {
    return {
      ending: false,
      text: `${access.daysLeft} ${access.daysLeft === 1 ? "day" : "days"} left in your free trial`,
      cta: "Upgrade"
    };
  }
  if (access.mode === "sub") {
    return {
      ending: false,
      text: `${access.plan === "annual" ? "Annual" : "Monthly"} plan · till ${fmtDay(user.plan_expires_at)}`,
      cta: "Manage"
    };
  }
  return { ending: true, text: "Profile is private. Events are pay per event.", cta: "See plans" };
}

function TrialStatus({ user, access, onClose, onCta }) {
  const c = trialBannerCopy(user, access);
  return (
    <Overlay onClose={onClose}>
      <div className="at-modal" style={{ maxWidth: 440 }}>
        <div className="at-handle" />
        <div style={{ padding: "14px 16px 22px" }}>
          <div className={`trial-banner ${c.ending ? "ending" : ""}`}>
            <span className="trial-banner-icon">{IC.clock}</span>
            <span className="trial-banner-text">{c.text}</span>
            <button type="button" className="trial-banner-cta" onClick={onCta}>
              {c.cta}
            </button>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

/* ── verification result: "you're evolve verified" + publish ─────────────── */
function VerifiedSheet({ access, onPublish, onClose }) {
  useEffect(() => {
    const t = setTimeout(fireConfetti, 250);
    return () => clearTimeout(t);
  }, []);
  return (
    <Overlay onClose={onClose}>
      <div className="at-modal" style={{ maxWidth: 460, textAlign: "center" }}>
        <div className="at-handle" />
        <div className="at-pad">
          <div className="ev-hero">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 1.5l2.6 1.5 3-.4 1.4 2.7 2.7 1.4-.4 3L22.5 12l-1.5 2.6.4 3-2.7 1.4-1.4 2.7-3-.4L12 22.5 9.4 21l-3 .4-1.4-2.7-2.7-1.4.4-3L1.5 12 3 9.4l-.4-3 2.7-1.4L6.7 2.3l3 .4z" />
              <path d="M8 12.3l2.8 2.8 5.2-5.4" fill="none" stroke="#2b2100" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 style={{ margin: "0 0 6px", fontSize: 22 }}>You’re evolve verified</h1>
          <p className="at-s">
            Your profile now carries the evolve verified badge, the one hiring partners look for.
          </p>
          <div className="ev-share-note">
            {IC.globe}
            <div>
              <b>You can now share your profile publicly</b>
              <span>
                {access.mode === "sub"
                  ? "Your plan keeps your public page live."
                  : "Public sharing is free during your trial. It locks when the trial ends, unless you upgrade."}
              </span>
            </div>
          </div>
          <button type="button" className="at-btn block" onClick={onPublish}>
            Publish &amp; share
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
          <button type="button" className="at-link" onClick={onClose}>
            Not now
          </button>
        </div>
      </div>
    </Overlay>
  );
}

/* ── provider ─────────────────────────────────────────────────────────── */
export function MembershipProvider({ children }) {
  const { user: authUser, setUser, refreshUser } = useAuth();

  // patched in place (not refreshUser(), which flips authLoading and would
  // remount the page behind the open sheet)
  const handleStudentId = useCallback(
    (status) =>
      setUser((u) => (u ? { ...u, student_id_verification_status: status } : u)),
    [setUser]
  );

  // dev-only overrides from the DEMO panel (DevMembershipPanel): student/pro
  // pricing and the "already spent this month" amount. Both are UI-only —
  // the trial/plan scenarios themselves are written to the DB for real.
  const [devRole, setDevRole] = useState(null); // null | "student" | "professional"
  const [devSpent, setDevSpent] = useState(null); // null | number
  const user = useMemo(
    () => (authUser && import.meta.env.DEV && devRole ? { ...authUser, role: devRole } : authUser),
    [authUser, devRole]
  );
  const access = useMemo(() => accessState(user), [user]);

  const [plansStep, setPlansStep] = useState(0); // 0 = closed
  const [pay, setPay] = useState(null);
  const [spent, setSpent] = useState(0);
  const [welcome, setWelcome] = useState(false);
  const [status, setStatus] = useState(false);
  const [verified, setVerified] = useState(null); // { onPublish }
  const [verifyPrompt, setVerifyPrompt] = useState(null); // { onStart }

  const openPlans = useCallback((step = 2) => setPlansStep(step), []);

  // what they've paid per-item since the 1st — drives the "you'd have
  // saved" nudge on the pay sheet
  const loadSpent = useCallback(async () => {
    if (!user?.id) return;
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    const { data } = await supabase
      .from("purchases")
      .select("amount")
      .eq("user_id", user.id)
      .eq("status", "success")
      .in("kind", ["event", "recording"])
      .gte("created_at", start.toISOString());
    setSpent((data || []).reduce((s, r) => s + (r.amount || 0), 0));
  }, [user?.id]);

  // item: { kind: "event"|"recording", event_id, title, sub, price }
  //     | { kind: "plan", plan }
  const payFor = useCallback(
    (item, after) => {
      loadSpent();
      setPay({
        item,
        after,
        choice: "direct",
        sub: "annual",
        step: item.kind === "plan" ? "proc" : "choose",
        error: ""
      });
    },
    [loadSpent]
  );

  // runs `run` straight away if they already have access, otherwise opens
  // the pay sheet and runs it once paid — the reference's AT.gate()
  const gate = useCallback(
    (item, run) => {
      if (access.full || item.owned || item.price === 0) run?.();
      else payFor(item, run);
    },
    [access.full, payFor]
  );

  const closePay = useCallback(
    (completed) => {
      const after = completed ? pay?.after : null;
      setPay(null);
      after?.();
    },
    [pay]
  );

  const value = useMemo(
    () => ({
      access,
      openPlans,
      pay: payFor,
      gate,
      openTrialStatus: () => setStatus(true),
      showWelcome: () => setWelcome(true),
      showVerified: (onPublish) => setVerified({ onPublish }),
      showVerifyPrompt: (onStart) => setVerifyPrompt({ onStart })
    }),
    [access, openPlans, payFor, gate]
  );

  return (
    <MembershipContext.Provider value={value}>
      {children}
      {user && plansStep > 0 && (
        <TrialEndedModal
          user={user}
          step={plansStep}
          setStep={setPlansStep}
          onClose={() => setPlansStep(0)}
          onSubscribe={(plan) => {
            setPlansStep(0);
            payFor({ kind: "plan", plan });
          }}
          onStudentId={handleStudentId}
        />
      )}
      {user && pay && (
        <PaySheet
          user={user}
          access={access}
          pay={pay}
          setPay={setPay}
          spent={devSpent ?? spent}
          onClose={closePay}
          onFulfilled={() => refreshUser?.()}
          onStudentId={handleStudentId}
        />
      )}
      {welcome && <VipWelcome onClose={() => setWelcome(false)} />}
      {user && status && (
        <TrialStatus
          user={user}
          access={access}
          onClose={() => setStatus(false)}
          onCta={() => {
            setStatus(false);
            setPlansStep(2);
          }}
        />
      )}
      {verifyPrompt && (
        <VerifyPrompt
          onClose={() => setVerifyPrompt(null)}
          onStart={() => {
            const fn = verifyPrompt.onStart;
            setVerifyPrompt(null);
            fn?.();
          }}
        />
      )}
      {verified && (
        <VerifiedSheet
          access={access}
          onClose={() => setVerified(null)}
          onPublish={() => {
            const fn = verified.onPublish;
            setVerified(null);
            fn?.();
          }}
        />
      )}
      {import.meta.env.DEV && authUser && (
        <DevMembershipPanel
          user={authUser}
          access={access}
          role={user?.role === "professional" ? "professional" : "student"}
          setRole={setDevRole}
          spent={devSpent}
          setSpent={setDevSpent}
          refreshUser={refreshUser}
          openPlans={openPlans}
          showWelcome={() => setWelcome(true)}
          showVerified={() => setVerified({})}
        />
      )}
    </MembershipContext.Provider>
  );
}
