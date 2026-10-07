import { isTrialActive, trialDaysLeft } from "./trial";

// After-trial membership model (mirrors evolve_mobile_after_trial.html).
// Display copy only — the server (api/_membership.js) decides what's
// actually charged, and the DB (membership_plans.sql) enforces access.
//
//   trial (30 days)  → everything open
//   ended, no plan   → "pay as you go": verified badge + public profile
//                      lock, events/webinars/past sessions are pay-per-item
//   ended, on a plan → everything open again; annual adds 1 free review
//
// Always free, in every state: daily news, microlearning, quizzes, AI assistant.

export const PLAN_PRICES = {
  student: { monthly: 150, annual: 1440 },
  pro: { monthly: 220, annual: 2112 }
};

export const ITEM_PRICES = {
  COMMUNITY: 20,
  WEBINAR: 150,
  RECORDING: 30,
  REVIEW: 2400,
  MENTOR_MIN: 10000,
  MENTOR_MAX: 15000
};

export function inr(n) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

export function tierFor(user) {
  const isPro =
    user?.role === "professional" ||
    (!user?.role && !!user?.designation && !user?.school_name);
  return isPro ? "pro" : "student";
}

export function planPrice(user, plan) {
  return PLAN_PRICES[tierFor(user)][plan === "annual" ? "annual" : "monthly"];
}

export function isPlanActive(user) {
  return !!user?.plan_expires_at && new Date(user.plan_expires_at).getTime() > Date.now();
}

// phase: "trial" | "ended"; mode: "sub" | "payg"
export function accessState(user) {
  const onTrial = isTrialActive(user?.trial_ends_at);
  const onPlan = isPlanActive(user);
  return {
    phase: onTrial ? "trial" : "ended",
    mode: onPlan ? "sub" : "payg",
    plan: onPlan ? user.plan : null,
    full: onTrial || onPlan,
    daysLeft: trialDaysLeft(user?.trial_ends_at),
    reviewCredits: onPlan ? user?.review_credits || 0 : 0
  };
}

export function eventPrice(ev) {
  if (ev?.price_inr != null) return ev.price_inr;
  return ["Webinar", "Workshop"].includes(ev?.event_type)
    ? ITEM_PRICES.WEBINAR
    : ITEM_PRICES.COMMUNITY;
}

export function recordingPrice(ev) {
  return ev?.recording_price_inr ?? ITEM_PRICES.RECORDING;
}

export function eventKindLabel(ev) {
  return ["Webinar", "Workshop"].includes(ev?.event_type)
    ? "Webinar registration"
    : "Community event registration";
}
