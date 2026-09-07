// api/razorpay-create-order.js
import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";

// TEMP: testing amount — ₹5 instead of real plan prices. Revert before going live.
const PLAN_AMOUNTS_PAISE = {
  starter: 500,      // TEST: ₹5 (real: 1500000 / ₹15,000)
  accelerator: 500   // TEST: ₹5 (real: 3500000 / ₹35,000)
};

// New individual (1:1, not batch/cohort) mentorship plans, launched from the
// profile page's Mentorship card — folded into this same file rather than a
// new api/ route to stay under Vercel Hobby's 12-function cap (see the same
// note in razorpay-create-order-portfolio.js). Entirely separate code path
// below: synchronous, server-verified (no webhook dependency), writes to
// mentorship_enrollments instead of mentorship_payments/the batch tables —
// never touches the starter/accelerator logic further down this file.
const INDIVIDUAL_PLAN_AMOUNTS_PAISE =
  process.env.VERCEL_ENV === "production"
    ? { core: 1000000, application_support: 1500000 } // ₹10,000 / ₹15,000
    : { core: 100, application_support: 100 };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" });
  }

  try {
    // verify env vars are present
    if (!process.env.RAZORPAY_KEY_ID) return res.status(500).json({ error: "RAZORPAY_KEY_ID missing" });
    if (!process.env.RAZORPAY_KEY_SECRET) return res.status(500).json({ error: "RAZORPAY_KEY_SECRET missing" });
    if (!process.env.SUPABASE_URL) return res.status(500).json({ error: "SUPABASE_URL missing" });
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return res.status(500).json({ error: "SUPABASE_SERVICE_ROLE_KEY missing" });

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const {
      plan,
      phone,
      token,
      batch_id,
      stream,
      devConfirm,
      action,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = body || {};

    // ── individual mentorship (core / application_support) ───────────────
    if (INDIVIDUAL_PLAN_AMOUNTS_PAISE[plan]) {
      if (!token) return res.status(401).json({ error: "unauthorized" });

      const supabaseIndividual = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      const {
        data: { user: individualUser },
        error: individualAuthError
      } = await supabaseIndividual.auth.getUser(token);
      if (individualAuthError || !individualUser) {
        return res.status(401).json({ error: "unauthorized" });
      }

      const amountPaise = INDIVIDUAL_PLAN_AMOUNTS_PAISE[plan];

      // Local-dev-only stand-in for a confirmed payment — the pricing modal
      // skips the real Razorpay checkout entirely in import.meta.env.DEV.
      if (devConfirm) {
        if (process.env.NODE_ENV === "production") {
          return res.status(403).json({ error: "not available in production" });
        }
        const { data: enrollment, error: insertErr } = await supabaseIndividual
          .from("mentorship_enrollments")
          .insert({
            user_id: individualUser.id,
            plan,
            amount: amountPaise / 100,
            currency: "INR",
            phone: phone || "",
            stream: stream || "",
            status: "success"
          })
          .select()
          .single();
        if (insertErr) {
          console.error("dev enrollment insert error:", insertErr);
          return res.status(500).json({ error: "server error" });
        }
        return res.status(200).json({ ok: true, enrollment });
      }

      // Synchronous, server-side payment verification — called by the
      // pricing modal's Razorpay checkout `handler` the instant it fires.
      if (action === "verify") {
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

        const { data: pending } = await supabaseIndividual
          .from("mentorship_enrollments")
          .select("id")
          .eq("razorpay_order_id", razorpay_order_id)
          .eq("user_id", individualUser.id)
          .maybeSingle();
        if (!pending) {
          return res.status(404).json({ error: "payment record not found" });
        }

        const { data: enrollment, error: updateErr } = await supabaseIndividual
          .from("mentorship_enrollments")
          .update({ razorpay_payment_id, razorpay_signature, status: "success" })
          .eq("id", pending.id)
          .select()
          .single();
        if (updateErr) {
          console.error("enrollment update error:", updateErr);
          return res.status(500).json({ error: "server error" });
        }
        return res.status(200).json({ ok: true, enrollment });
      }

      // default: create a new Razorpay order + pending enrollment row
      const individualAuth = Buffer.from(
        `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
      ).toString("base64");

      const orderRes = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: `Basic ${individualAuth}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: amountPaise,
          currency: "INR",
          receipt: `mt_${individualUser.id.slice(0, 8)}_${Date.now()}`
        })
      });
      if (!orderRes.ok) {
        console.error("Razorpay order error:", await orderRes.text());
        return res.status(500).json({ error: "failed to create order" });
      }
      const order = await orderRes.json();

      await supabaseIndividual.from("mentorship_enrollments").insert({
        user_id: individualUser.id,
        plan,
        amount: amountPaise / 100, // store in rupees
        currency: "INR",
        phone: phone || "",
        stream: stream || "",
        razorpay_order_id: order.id,
        status: "pending"
      });

      return res.status(200).json({
        order_id: order.id,
        amount: amountPaise, // paise — needed by Razorpay JS
        currency: "INR",
        key_id: process.env.RAZORPAY_KEY_ID
      });
    }

    // ── existing batch-based starter/accelerator flow (unchanged) ────────
    if (!["starter", "accelerator"].includes(plan)) {
      return res.status(400).json({ error: "invalid plan" });
    }
    if (!token) {
      return res.status(401).json({ error: "unauthorized" });
    }

    // Verify Supabase auth token
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: "unauthorized" });
    }

    const amount = PLAN_AMOUNTS_PAISE[plan];
    const auth = Buffer.from(
      `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
    ).toString("base64");

    // Create Razorpay order
    const orderRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount,
        currency: "INR",
        receipt: `rcpt_${user.id.slice(0, 8)}_${Date.now()}`
      })
    });

    if (!orderRes.ok) {
      console.error("Razorpay order error:", await orderRes.text());
      return res.status(500).json({ error: "failed to create order" });
    }
    const order = await orderRes.json();

    // Use user-chosen batch if provided, otherwise auto-pick lowest available
    let batch = null;
    if (batch_id) {
      const { data: chosen } = await supabase
        .from("batch_spots")
        .select("id, batch_number, spots_remaining")
        .eq("id", batch_id)
        .eq("status", "open")
        .single();
      if (chosen && chosen.spots_remaining > 0) batch = chosen;
    }
    if (!batch) {
      const { data: allBatches } = await supabase
        .from("batch_spots")
        .select("id, batch_number, spots_remaining")
        .eq("status", "open");
      batch = (allBatches || [])
        .filter((b) => b.spots_remaining > 0)
        .sort((a, b) => a.batch_number - b.batch_number)[0] || null;
    }

    // Insert pending payment row
    await supabase.from("mentorship_payments").insert({
      user_id: user.id,
      user_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email || "",
      plan,
      amount: amount / 100, // store in rupees (15000 / 35000)
      currency: "INR",
      phone: phone || "",
      razorpay_order_id: order.id,
      batch_id: batch?.id || null,
      status: "pending"
    });

    return res.status(200).json({
      order_id: order.id,
      amount,          // paise — needed by Razorpay JS
      currency: "INR",
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error("create-order error:", err);
    return res.status(500).json({ error: "server error" });
  }
}
