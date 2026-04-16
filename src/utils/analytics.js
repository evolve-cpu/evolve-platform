/**
 * evolve — analytics helper
 *
 * All GA4 (gtag) + ContentSquare (_uxa) calls live here.
 * Import named functions; never call window.gtag or window._uxa directly
 * from page/component files.
 *
 * GA4 measurement ID: G-MSYRSW4MEH
 */

/* ── plan value map (INR) ───────────────────────────────────────────────── */
const PLAN_VALUE = {
  starter: 15000,
  accelerator: 35000
};

/* ── internal helpers ───────────────────────────────────────────────────── */
function ga4(eventName, params = {}) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }
}

function cs(category, action, label = "") {
  if (typeof window !== "undefined") {
    window._uxa = window._uxa || [];
    window._uxa.push(["trackEvent", category, action, label]);
  }
}

function planItem(plan) {
  return {
    item_id: `mentorship_${plan}`,
    item_name: `Mentorship — ${plan}`,
    item_category: "mentorship",
    price: PLAN_VALUE[plan] ?? 0,
    currency: "INR",
    quantity: 1
  };
}

/* ══════════════════════════════════════════════════════════════════════════
   Page views  (SPA navigation — GA4 doesn't auto-track route changes)
══════════════════════════════════════════════════════════════════════════ */
export function trackPageView(pathname) {
  ga4("page_view", {
    page_path: pathname,
    page_location: window.location.href
  });
  // ContentSquare
  window._uxa = window._uxa || [];
  window._uxa.push(["trackPageview", pathname]);
}

/* ══════════════════════════════════════════════════════════════════════════
   CTA clicks  (hero buttons, scroll anchors, etc.)
══════════════════════════════════════════════════════════════════════════ */
/**
 * @param {string} ctaName  — e.g. "explore_mentorship", "how_it_works"
 * @param {string} location — e.g. "hero", "section2"
 */
export function trackCtaClick(ctaName, location = "") {
  ga4("cta_click", { cta_name: ctaName, cta_location: location });
  cs("engagement", "cta_click", ctaName);
}

/* ══════════════════════════════════════════════════════════════════════════
   Mentorship conversion funnel
══════════════════════════════════════════════════════════════════════════ */

/**
 * User clicked "apply now" on a plan card.
 * Fire before navigating to /payment or /signin.
 */
export function trackPlanSelected(plan) {
  ga4("select_item", {
    item_list_id: "mentorship_plans",
    item_list_name: "Mentorship Plans",
    items: [planItem(plan)]
  });
  cs("conversion", "plan_selected", plan);
}

/**
 * User was redirected to /signin because they weren't logged in.
 * Lets you measure sign-in drop-off per plan.
 */
export function trackLoginRequired(plan) {
  ga4("login_required", { redirect_from: "mentorship_apply", plan });
  cs("conversion", "login_required", plan);
}

/**
 * User reached /payment with a valid plan — checkout has begun.
 * Mapped to GA4 recommended e-commerce event.
 */
export function trackBeginCheckout(plan) {
  const value = PLAN_VALUE[plan] ?? 0;
  ga4("begin_checkout", {
    currency: "INR",
    value,
    items: [planItem(plan)]
  });
  cs("conversion", "begin_checkout", plan);
}

/**
 * Razorpay modal was opened — user started entering payment details.
 */
export function trackPaymentInitiated(plan) {
  ga4("payment_initiated", {
    currency: "INR",
    value: PLAN_VALUE[plan] ?? 0,
    plan
  });
  cs("conversion", "payment_initiated", plan);
}

/**
 * Razorpay returned success.
 * Mapped to GA4 recommended `purchase` event — shows up in GA4 revenue reports.
 *
 * @param {string} plan            — "starter" | "accelerator"
 * @param {string} [transactionId] — razorpay_payment_id if available
 */
export function trackPurchase(plan, transactionId = "") {
  const value = PLAN_VALUE[plan] ?? 0;
  ga4("purchase", {
    transaction_id: transactionId || `evolve_${plan}_${Date.now()}`,
    currency: "INR",
    value,
    items: [planItem(plan)]
  });
  cs("conversion", "purchase", plan);
}

/**
 * User closed the Razorpay modal without completing payment.
 */
export function trackPaymentDismissed(plan) {
  ga4("payment_dismissed", { plan, currency: "INR", value: PLAN_VALUE[plan] ?? 0 });
  cs("conversion", "payment_dismissed", plan);
}

/**
 * Razorpay returned a payment.failed event.
 */
export function trackPaymentFailed(plan) {
  ga4("payment_failed", { plan, currency: "INR", value: PLAN_VALUE[plan] ?? 0 });
  cs("conversion", "payment_failed", plan);
}

/**
 * User joined the waitlist (all batches full flow).
 */
export function trackWaitlistJoin() {
  ga4("waitlist_join", { item_category: "mentorship" });
  cs("conversion", "waitlist_join", "mentorship");
}
