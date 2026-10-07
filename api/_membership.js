// api/_membership.js
// Shared server logic for the after-trial membership model (see
// supabase/migrations/membership_plans.sql). Used by the "membership"
// product branch of razorpay-create-order.js and by razorpay-webhook.js as
// a fallback if the browser never makes it back to verify. Underscore
// prefix = not deployed as its own Vercel function (Hobby 12-function cap).
//
// Prices mirror src/lib/membership.js — the server is the source of truth
// for what's actually charged; the client copy is display only.

export const PLAN_PRICES = {
  student: { monthly: 150, annual: 1440 },
  pro: { monthly: 220, annual: 2112 }
};
const DEFAULT_RECORDING_PRICE = 30;

// ₹1 everywhere except production (same convention as the other order
// endpoints), so a merge from development can never charge test prices live.
const IS_PROD = process.env.VERCEL_ENV === "production";
const chargePaise = (rupees) => (IS_PROD ? rupees * 100 : 100);

export function tierFor(profile) {
  const isPro =
    profile?.role === "professional" ||
    (!profile?.role && !!profile?.designation && !profile?.school_name);
  return isPro ? "pro" : "student";
}

export function eventPrice(ev) {
  if (ev.price_inr != null) return ev.price_inr;
  return ["Webinar", "Workshop"].includes(ev.event_type) ? 150 : 20;
}

export function recordingPrice(ev) {
  return ev.recording_price_inr ?? DEFAULT_RECORDING_PRICE;
}

export function hasFullAccess(profile) {
  const now = Date.now();
  return (
    (profile?.trial_ends_at && new Date(profile.trial_ends_at).getTime() > now) ||
    (profile?.plan_expires_at && new Date(profile.plan_expires_at).getTime() > now)
  );
}

// Works out what an order is for and what it costs, entirely from the DB —
// never from a client-sent amount.
export async function priceItem(supabase, userId, { kind, plan, eventId }) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, designation, school_name, trial_ends_at, plan_expires_at")
    .eq("id", userId)
    .single();
  if (!profile) return { error: "profile not found" };

  if (kind === "plan") {
    if (!["monthly", "annual"].includes(plan)) return { error: "invalid plan" };
    const rupees = PLAN_PRICES[tierFor(profile)][plan];
    return {
      rupees,
      title: `${plan === "annual" ? "Annual" : "Monthly"} plan`,
      row: { kind, plan, event_id: null }
    };
  }

  if (kind === "event" || kind === "recording") {
    if (!eventId) return { error: "missing event" };
    const { data: ev } = await supabase
      .from("events")
      .select("id, title, event_type, price_inr, recording_price_inr, status")
      .eq("id", eventId)
      .eq("status", "published")
      .maybeSingle();
    if (!ev) return { error: "event not found" };
    if (hasFullAccess(profile)) return { error: "already included in your access" };
    const rupees = kind === "recording" ? recordingPrice(ev) : eventPrice(ev);
    if (rupees === 0) return { error: "this one is free" };
    return {
      rupees,
      title: ev.title,
      row: { kind, plan: null, event_id: ev.id }
    };
  }

  return { error: "invalid item" };
}

// Flips a pending purchase to success and grants what it bought. The
// conditional update (status = 'pending') makes this safe to call from both
// the browser verify step and a webhook retry — only the first one wins.
export async function fulfilPurchase(supabase, orderId, payment = {}) {
  const { data: rows, error } = await supabase
    .from("purchases")
    .update({
      status: "success",
      razorpay_payment_id: payment.razorpay_payment_id ?? null,
      razorpay_signature: payment.razorpay_signature ?? null
    })
    .eq("razorpay_order_id", orderId)
    .eq("status", "pending")
    .select();
  if (error) throw error;

  const purchase = rows?.[0];
  if (!purchase) {
    const { data: existing } = await supabase
      .from("purchases")
      .select("*")
      .eq("razorpay_order_id", orderId)
      .maybeSingle();
    return existing;
  }

  if (purchase.kind === "plan") await grantPlan(supabase, purchase.user_id, purchase.plan);
  return purchase;
}

export async function grantPlan(supabase, userId, plan) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan_expires_at, review_credits, trial_ends_at")
    .eq("id", userId)
    .single();

  // a plan starts once whatever's already covered runs out — upgrading
  // mid-trial, or renewing early, never eats into days already granted
  const ts = (v) => (v ? new Date(v).getTime() : 0);
  const base = new Date(
    Math.max(Date.now(), ts(profile?.plan_expires_at), ts(profile?.trial_ends_at))
  );
  if (plan === "annual") base.setFullYear(base.getFullYear() + 1);
  else base.setMonth(base.getMonth() + 1);

  await supabase
    .from("profiles")
    .update({
      plan,
      plan_expires_at: base.toISOString(),
      review_credits: (profile?.review_credits || 0) + (plan === "annual" ? 1 : 0)
    })
    .eq("id", userId);
}

// Annual plan's free portfolio review: spend one credit and open a review
// cycle — same "reuse an open cycle, else start the next attempt" rule as
// unlockReview() in razorpay-create-order-portfolio.js.
export async function redeemReviewCredit(supabase, user) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("review_credits, plan_expires_at")
    .eq("id", user.id)
    .single();
  if (!profile || profile.review_credits < 1) return { error: "no free review left" };
  if (!profile.plan_expires_at || new Date(profile.plan_expires_at).getTime() < Date.now()) {
    return { error: "your plan has ended" };
  }

  const { data: latest } = await supabase
    .from("evolve_portfolio_reviews")
    .select("*")
    .eq("user_id", user.id)
    .order("attempt", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (latest && !latest.review_report_url) return { review: latest };

  const { data: spent } = await supabase
    .from("profiles")
    .update({ review_credits: profile.review_credits - 1 })
    .eq("id", user.id)
    .eq("review_credits", profile.review_credits)
    .select("id");
  if (!spent?.length) return { error: "please try again" };

  const { data: review, error } = await supabase
    .from("evolve_portfolio_reviews")
    .insert({
      user_id: user.id,
      name: user.user_metadata?.full_name || user.user_metadata?.name || user.email || "",
      email: user.email || "",
      review_status: "draft",
      attempt: (latest?.attempt || 0) + 1
    })
    .select()
    .single();
  if (error) {
    console.error("free review cycle insert failed:", error);
    return { error: "server error" };
  }
  return { review };
}

export { chargePaise };
