import { supabase } from "../supabaseClient";

// Razorpay checkout for the membership product (plans / pay-per-event /
// recordings) — create order → Razorpay modal (UPI, card, net banking) →
// synchronous server verify. Same flow as MentorshipPricingModal, pulled
// out so the pay sheet, event page and recording lock can all share it.

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

async function post(body) {
  const res = await fetch("/api/razorpay-create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product: "membership", ...body })
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Something went wrong. Please try again.");
  return json;
}

async function accessToken() {
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Please sign in again.");
  return session.access_token;
}

/**
 * item: { kind: "plan", plan: "monthly"|"annual" }
 *     | { kind: "event"|"recording", event_id }
 * Resolves with the fulfilled purchase row; rejects with { dismissed: true }
 * if the person closes the Razorpay window.
 */
export async function startMembershipCheckout(item, user) {
  const token = await accessToken();

  if (import.meta.env.DEV) {
    const { purchase } = await post({ ...item, token, devConfirm: true });
    return purchase;
  }

  const loaded = await loadRazorpayScript();
  if (!loaded) throw new Error("Razorpay failed to load. Check your internet.");

  const order = await post({ ...item, token });

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: import.meta.env.VITE_RAZORPAY_API_KEY,
      amount: String(order.amount),
      currency: order.currency,
      name: "evolve design",
      description: order.title,
      order_id: order.order_id,
      prefill: { name: user?.name || "", email: user?.email || "", contact: user?.phone || "" },
      theme: { color: "#FFD007" },
      handler: async (response) => {
        try {
          const { purchase } = await post({
            action: "verify",
            token,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });
          resolve(purchase);
        } catch (err) {
          reject(err);
        }
      },
      modal: { ondismiss: () => reject({ dismissed: true }) }
    });
    rzp.on("payment.failed", () => reject(new Error("Payment failed. No money was taken.")));
    rzp.open();
  });
}

export async function redeemFreeReview() {
  const token = await accessToken();
  return post({ action: "redeem_review", token });
}

// does this signed-in person own this event / recording?
export async function fetchOwnedEventIds(userId) {
  if (!userId) return { event: new Set(), recording: new Set() };
  const { data } = await supabase
    .from("purchases")
    .select("kind, event_id")
    .eq("user_id", userId)
    .eq("status", "success")
    .in("kind", ["event", "recording"]);
  const out = { event: new Set(), recording: new Set() };
  (data || []).forEach((p) => out[p.kind]?.add(p.event_id));
  return out;
}
