// api/razorpay-create-order-portfolio.js
// Order creation for the paid 1:1 Portfolio Review programme (₹1,400 flat).
// Mirrors razorpay-create-order.js's mentorship flow, minus batch logic.
// Also handles `action: "verify"` (see below) — folded into this same file
// rather than a new api/ route to stay under Vercel Hobby's 12-function cap.
import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";

// const AMOUNT_PAISE = 140000; // ₹1,400
const AMOUNT_PAISE = 100; // ₹1

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

    // Grants access to the evolve Portfolio Review workspace by creating the
    // evolve_portfolio_reviews row — the only place this ever happens.
    // upsert + ignoreDuplicates keeps this idempotent no matter how many
    // times it's called for the same user.
    async function unlockReview() {
      await supabase.from("evolve_portfolio_reviews").upsert(
        {
          user_id: user.id,
          name: user.user_metadata?.full_name || user.user_metadata?.name || user.email || "",
          email: user.email || "",
          review_status: "draft"
        },
        { onConflict: "user_id", ignoreDuplicates: true }
      );
      const { data: review } = await supabase
        .from("evolve_portfolio_reviews")
        .select("*")
        .eq("user_id", user.id)
        .single();
      return review;
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
