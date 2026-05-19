/**
 * evolve — analytics helper
 *
 * All GA4 (gtag) calls live here.
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
}

/* ══════════════════════════════════════════════════════════════════════════
   CTA clicks
══════════════════════════════════════════════════════════════════════════ */
export function trackCtaClick(ctaName, location = "") {
  ga4("cta_click", { cta_name: ctaName, cta_location: location });
}

/* ══════════════════════════════════════════════════════════════════════════
   Mentorship conversion funnel
══════════════════════════════════════════════════════════════════════════ */
export function trackPlanSelected(plan) {
  ga4("select_item", {
    item_list_id: "mentorship_plans",
    item_list_name: "Mentorship Plans",
    items: [planItem(plan)]
  });
}

export function trackLoginRequired(plan) {
  ga4("login_required", { redirect_from: "mentorship_apply", plan });
}

export function trackBeginCheckout(plan) {
  const value = PLAN_VALUE[plan] ?? 0;
  ga4("begin_checkout", { currency: "INR", value, items: [planItem(plan)] });
}

export function trackPaymentInitiated(plan) {
  ga4("payment_initiated", {
    currency: "INR",
    value: PLAN_VALUE[plan] ?? 0,
    plan
  });
}

export function trackPurchase(plan, transactionId = "") {
  const value = PLAN_VALUE[plan] ?? 0;
  ga4("purchase", {
    transaction_id: transactionId || `evolve_${plan}_${Date.now()}`,
    currency: "INR",
    value,
    items: [planItem(plan)]
  });
}

export function trackPaymentDismissed(plan) {
  ga4("payment_dismissed", { plan, currency: "INR", value: PLAN_VALUE[plan] ?? 0 });
}

export function trackPaymentFailed(plan) {
  ga4("payment_failed", { plan, currency: "INR", value: PLAN_VALUE[plan] ?? 0 });
}

export function trackWaitlistJoin() {
  ga4("waitlist_join", { item_category: "mentorship" });
}
