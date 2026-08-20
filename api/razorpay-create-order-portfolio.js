// api/razorpay-create-order-portfolio.js
// Order creation for the paid 1:1 Portfolio Review programme (₹1,400 flat).
// Mirrors razorpay-create-order.js's mentorship flow, minus batch logic.
// Also handles `action: "verify"` (see below) — folded into this same file
// rather than a new api/ route to stay under Vercel Hobby's 12-function cap.
import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";

// ₹2,500 in production (main), ₹1 everywhere else (dev/preview deployments)
// so a merge from development can never silently push the test price live.
const AMOUNT_PAISE = process.env.VERCEL_ENV === "production" ? 250000 : 100;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" });
  }

  try {
    if (!process.env.RAZORPAY_KEY_ID)
      return res.status(500).json({ error: "RAZORPAY_KEY_ID missing" });
    if (!process.env.RAZORPAY_KEY_SECRET)
      return res.status(500).json({ error: "RAZORPAY_KEY_SECRET missing" });
    if (!process.env.SUPABASE_URL)
      return res.status(500).json({ error: "SUPABASE_URL missing" });
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY)
      return res
        .status(500)
        .json({ error: "SUPABASE_SERVICE_ROLE_KEY missing" });

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { phone, token, devConfirm, action } = body || {};

    if (!token) {
      return res.status(401).json({ error: "unauthorized" });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: "unauthorized" });
    }

    // Grants access to the evolve Portfolio Review workspace by creating an
    // evolve_portfolio_reviews row. A user can go through this workspace
    // more than once — once a cycle's report is uploaded
    // (review_report_url set), paying again starts a fresh cycle ("review
    // 2", "review 3", …) rather than reusing the finished one. If an OPEN
    // cycle already exists (not yet reported), reuse it instead of
    // inserting a duplicate — keeps this idempotent against webhook
    // retries / double taps on "pay", and lines up with the partial unique
    // index (one open cycle per user) added in
    // evolve_portfolio_reviews_cycles.sql.
    async function unlockReview() {
      const { data: latest } = await supabase
        .from("evolve_portfolio_reviews")
        .select("*")
        .eq("user_id", user.id)
        .order("attempt", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latest && !latest.review_report_url) return latest;

      const { data: created, error: insertErr } = await supabase
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

      if (insertErr) {
        console.error("failed to open a new review cycle:", insertErr);
        // most likely lost a race against the partial unique index —
        // whatever open cycle now exists is the one to hand back
        const { data: fallback } = await supabase
          .from("evolve_portfolio_reviews")
          .select("*")
          .eq("user_id", user.id)
          .order("attempt", { ascending: false })
          .limit(1)
          .maybeSingle();
        return fallback;
      }
      return created;
    }

    // Local-dev-only stand-in for a confirmed payment — BookModal skips the
    // real Razorpay checkout entirely in import.meta.env.DEV. Refuses to run
    // once deployed (NODE_ENV === "production").
    if (devConfirm) {
      if (process.env.NODE_ENV === "production") {
        return res.status(403).json({ error: "not available in production" });
      }
      const review = await unlockReview();
      return res.status(200).json({ ok: true, review });
    }

    // Synchronous, server-side payment verification — called by BookModal's
    // Razorpay checkout `handler` the instant it fires. Verifies the
    // standard Razorpay order-payment signature (HMAC-SHA256 of
    // "order_id|payment_id" using the account's key secret — NOT the
    // separate webhook secret) so the workspace unlock doesn't depend on a
    // webhook being configured in the Razorpay dashboard at all.
    if (action === "verify") {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ error: "missing payment verification fields" });
      }

      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");
      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ error: "payment verification failed" });
      }

      const { data: pmnt } = await supabase
        .from("portfolio_review_payments")
        .select("id")
        .eq("razorpay_order_id", razorpay_order_id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!pmnt) {
        return res.status(404).json({ error: "payment record not found" });
      }

      await supabase
        .from("portfolio_review_payments")
        .update({ razorpay_payment_id, razorpay_signature, status: "success" })
        .eq("id", pmnt.id);

      const review = await unlockReview();
      return res.status(200).json({ ok: true, review });
    }

    const auth = Buffer.from(
      `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
    ).toString("base64");

    const orderRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: AMOUNT_PAISE,
        currency: "INR",
        receipt: `pr_${user.id.slice(0, 8)}_${Date.now()}`
      })
    });

    if (!orderRes.ok) {
      console.error("Razorpay order error:", await orderRes.text());
      return res.status(500).json({ error: "failed to create order" });
    }
    const order = await orderRes.json();

    await supabase.from("portfolio_review_payments").insert({
      user_id: user.id,
      name:
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email ||
        "",
      email: user.email || "",
      amount: AMOUNT_PAISE / 100, // store in rupees (1400)
      currency: "INR",
      phone: phone || "",
      razorpay_order_id: order.id,
      status: "pending"
    });

    return res.status(200).json({
      order_id: order.id,
      amount: AMOUNT_PAISE, // paise — needed by Razorpay JS
      currency: "INR",
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error("create-order-portfolio error:", err);
    return res.status(500).json({ error: "server error" });
  }
}
