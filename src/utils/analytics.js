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

function clarityEvent(eventName) {
  if (typeof window !== "undefined" && typeof window.clarity === "function") {
    window.clarity("event", eventName);
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

   Every CTA carries a data-cta attribute, e.g.
     <button data-cta="web_home_hero_start_free">…</button>
   and one delegated listener (initCtaTracking, called from main.jsx) turns a
   click on it into a GA4 "cta_click" event:

     cta_name      the data-cta value — "web_…" on the public website,
                   "app_…" inside the signed-in platform
     cta_platform  "web" | "app"
     cta_text      the visible label (first 100 chars)
     cta_url       the link target, for <a> CTAs
     page_path     the page the click happened on

   The full list of names lives in docs/analytics/cta-tracking.md. In GA4,
   register cta_name / cta_platform as event-scoped custom dimensions.
   A CTA is also selectable in GTM as  [data-cta="web_…"].
══════════════════════════════════════════════════════════════════════════ */
// "Mentorship Programme" -> "mentorship_programme", for CTAs rendered from a list
export function ctaSlug(label = "") {
  return String(label).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

// "app" inside the signed-in platform, "web" everywhere else — for components
// that render on both (event page, Typetober, community feed, profile)
const APP_PATHS = ["/app", "/onboarding", "/payment", "/mentorship-session"];
export function ctaArea() {
  if (typeof window === "undefined") return "web";
  const p = window.location.pathname;
  return APP_PATHS.some((a) => p === a || p.startsWith(`${a}/`)) ? "app" : "web";
}

let ctaTrackingOn = false;

export function initCtaTracking() {
  if (ctaTrackingOn || typeof document === "undefined") return;
  ctaTrackingOn = true;
  document.addEventListener(
    "click",
    (e) => {
      try {
        const el = e.target?.closest?.("[data-cta]");
        if (!el || el.disabled || el.getAttribute("aria-disabled") === "true") return;
        const name = el.getAttribute("data-cta");
        if (!name) return;
        const href = el.tagName === "A" ? el.getAttribute("href") || "" : "";
        ga4("cta_click", {
          cta_name: name,
          cta_platform: name.startsWith("app_") ? "app" : "web",
          cta_text: (el.innerText || el.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim().slice(0, 100),
          cta_url: href,
          page_path: window.location.pathname
        });
        clarityEvent(name);
      } catch {
        // analytics must never break a click
      }
    },
    true
  );
}

// Older helpers — the GA4 event now comes from the element's data-cta, so
// these only keep their Clarity events (sending cta_click here too would
// count the same click twice under a different name).
export function trackCtaClick(ctaName, location = "") {
  clarityEvent(`cta_${ctaName}${location ? `_${location}` : ""}`);
}

export function trackCommunityJoin() {
  clarityEvent("community_join");
}

export function trackPortfolioReviewCta(location = "") {
  clarityEvent(`portfolio_review_cta_${location}`);
}

export function trackWebinarPlaylist(rawTitle = "") {
  const category = rawTitle.replace(/<[^>]*>/g, " ").trim().replace(/\s+/g, "_").toLowerCase();
  clarityEvent(`webinar_playlist_${category}`);
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
  clarityEvent(`mentorship_plan_selected_${plan}`);
}

export function trackLoginRequired(plan) {
  ga4("login_required", { redirect_from: "mentorship_apply", plan });
  clarityEvent(`mentorship_login_required_${plan}`);
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
