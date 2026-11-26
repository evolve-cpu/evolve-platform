// Payments: the admin "payments" tab (op "payments_report" in api/admin.js).
// Every paid service on the platform in one list. The old batch mentorship
// (mentorship_payments) is left out on purpose.
//
//   service             table                       amount stored as
//   ─────────────────   ─────────────────────────   ─────────────────────────
//   membership plan     purchases (kind=plan)       whole rupees
//   live event          purchases (kind=event)      whole rupees OR dollars
//                                                   (currency = INR / USD)
//   event recording     purchases (kind=recording)  whole rupees
//   portfolio review    portfolio_review_payments   rupees from Razorpay,
//                                                   PAISE from manual grants
//                                                   (_manualGrant.js) — fixed
//                                                   up below
//   1:1 mentorship      mentorship_enrollments      whole rupees
//   typetober           typetober_submissions       ₹10 / $1 PER IMAGE — one
//                                                   row per illustration, a
//                                                   bulk checkout shares one
//                                                   order id, so rows are
//                                                   grouped into one payment
//                                                   per order below
//
// Every row comes back normalised to the same shape so the tab can group,
// filter and total it however it likes. `source` says where a row came from:
//   razorpay  real checkout (order id from Razorpay)
//   manual    admin "grant access" (order id manual_…) — paid off-platform
//             or given free
//   test      local dev confirm (order id dev_… / no order id)
// The leading underscore keeps Vercel from deploying this as a function.

import { fetchAll, soft } from "./_platformReport.js";

const sourceOf = (orderId) => {
  if (!orderId || orderId.startsWith("dev_")) return "test";
  if (orderId.startsWith("manual_")) return "manual";
  return "razorpay";
};

const PLAN_LABEL = {
  monthly: "Monthly plan",
  annual: "Annual plan",
  core: "Core",
  application_support: "Application support"
};
const letterOf = (i) => String.fromCharCode(65 + Number(i));

async function profilesById(db, ids) {
  const out = new Map();
  const list = [...new Set(ids.filter(Boolean))];
  for (let i = 0; i < list.length; i += 200) {
    const { data, error } = await db.from("profiles").select("id, name, email, username").in("id", list.slice(i, i + 200));
    if (error) throw new Error(`profiles: ${error.message}`);
    for (const p of data || []) out.set(p.id, p);
  }
  return out;
}

export async function buildPaymentsReport(db) {
  const warnings = [];
  const [purchases, reviews, enrollments, typetober, events] = await Promise.all([
    soft(
      fetchAll(db, "purchases", "id,user_id,kind,plan,event_id,title,amount,currency,razorpay_order_id,razorpay_payment_id,status,created_at"),
      "purchases",
      warnings
    ),
    soft(
      fetchAll(db, "portfolio_review_payments", "id,user_id,name,email,phone,amount,currency,razorpay_order_id,razorpay_payment_id,status,created_at"),
      "portfolio_review_payments",
      warnings
    ),
    soft(
      fetchAll(db, "mentorship_enrollments", "id,user_id,plan,amount,currency,phone,stream,razorpay_order_id,razorpay_payment_id,status,created_at"),
      "mentorship_enrollments",
      warnings
    ),
    soft(
      fetchAll(db, "typetober_submissions", "id,user_id,letter_index,amount,currency,razorpay_order_id,razorpay_payment_id,status,created_at"),
      "typetober_submissions",
      warnings
    ),
    soft(
      fetchAll(db, "events", "id,title,slug,event_type,start_time,status,price_inr,price_usd,recording_price_inr"),
      "events",
      warnings
    )
  ]);

  const people = await profilesById(db, [
    ...purchases.map((r) => r.user_id),
    ...reviews.map((r) => r.user_id),
    ...enrollments.map((r) => r.user_id),
    ...typetober.map((r) => r.user_id)
  ]).catch((err) => {
    warnings.push(err.message);
    return new Map();
  });
  const eventById = new Map(events.map((e) => [e.id, e]));

  const base = (r, table) => {
    const p = people.get(r.user_id) || {};
    return {
      id: r.id,
      table,
      user_id: r.user_id || null,
      name: p.name || r.name || "",
      email: p.email || r.email || "",
      username: p.username || "",
      phone: r.phone || "",
      status: r.status || "pending",
      currency: (r.currency || "INR").toUpperCase(),
      order_id: r.razorpay_order_id || "",
      // manual grants keep "manual: <reference> · <note>" here
      payment_ref: r.razorpay_payment_id || "",
      created_at: r.created_at
    };
  };

  const rows = [];

  for (const r of purchases) {
    const service = r.kind === "plan" ? "plan" : r.kind === "recording" ? "recording" : "event";
    const ev = r.event_id ? eventById.get(r.event_id) : null;
    rows.push({
      ...base(r, "purchases"),
      service,
      item: service === "plan" ? PLAN_LABEL[r.plan] || r.title || "Plan" : ev?.title || r.title || "Event",
      item_id: service === "plan" ? r.plan || "plan" : r.event_id || r.title,
      event_id: r.event_id || null,
      amount: Number(r.amount) || 0,
      source: sourceOf(r.razorpay_order_id)
    });
  }

  for (const r of reviews) {
    const source = sourceOf(r.razorpay_order_id);
    rows.push({
      ...base(r, "portfolio_review_payments"),
      service: "portfolio_review",
      item: "Portfolio review",
      item_id: "portfolio_review",
      event_id: null,
      // manual grants store paise in this table, checkouts store rupees
      amount: source === "manual" ? Math.round((Number(r.amount) || 0) / 100) : Number(r.amount) || 0,
      source
    });
  }

  for (const r of enrollments) {
    rows.push({
      ...base(r, "mentorship_enrollments"),
      service: "mentorship",
      item: `1:1 mentorship · ${PLAN_LABEL[r.plan] || r.plan}`,
      item_id: r.plan,
      event_id: null,
      stream: r.stream || "",
      amount: Number(r.amount) || 0,
      source: sourceOf(r.razorpay_order_id)
    });
  }

  // one payment per Razorpay order; dev-confirm rows (no order id) stand alone
  const ttOrders = new Map();
  for (const r of typetober) {
    const key = r.razorpay_order_id || `row:${r.id}`;
    if (!ttOrders.has(key)) ttOrders.set(key, []);
    ttOrders.get(key).push(r);
  }
  for (const group of ttOrders.values()) {
    const first = group[0];
    const letters = [...new Set(group.map((r) => letterOf(r.letter_index)))].sort();
    const n = group.length;
    rows.push({
      ...base(first, "typetober_submissions"),
      // a whole order flips together, so any paid row means the order is paid
      status: group.some((r) => r.status === "success") ? "success" : first.status || "pending",
      service: "typetober",
      item: `Typetober · ${n} illustration${n === 1 ? "" : "s"} (${letters.join(", ")})`,
      item_id: "typetober",
      event_id: null,
      images: n,
      amount: Math.round(group.reduce((s, r) => s + (Number(r.amount) || 0), 0) * 100) / 100,
      source: sourceOf(first.razorpay_order_id)
    });
  }

  rows.sort((a, b) => Date.parse(b.created_at || 0) - Date.parse(a.created_at || 0));

  return {
    rows,
    events: events.map((e) => ({
      id: e.id,
      title: e.title,
      slug: e.slug,
      event_type: e.event_type,
      start_time: e.start_time,
      status: e.status,
      price_inr: e.price_inr,
      price_usd: e.price_usd,
      recording_price_inr: e.recording_price_inr
    })),
    warnings,
    generated_at: new Date().toISOString()
  };
}
