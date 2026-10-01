// api/razorpay-create-order.js
import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";
import { recogniseLetters, validRecogniseImages } from "./_typetoberRecognise.js";

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
    // Supabase is needed by every branch (auth + reads/writes); Razorpay
    // itself is only needed once we actually talk to their API — checked
    // right before each of those calls below instead of blanket-here, so
    // the devConfirm (local-dev, no real payment) branches keep working
    // without real Razorpay keys configured.
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
      razorpay_signature,
      product,
      letterIndex,
      imagePath,
      items: ttItemsRaw,
      images: ttImages,
      currency: requestedCurrency
    } = body || {};

    // ── Typetober (₹10 per submission, any number of submissions per letter) ─
    // Folded into this same file rather than a new api/ route to stay under
    // Vercel Hobby's 12-function cap (see the identical note above for the
    // individual-mentorship branch). Fully separate table
    // (typetober_submissions) and code path — never touches mentorship or
    // portfolio-review logic below.
    if (product === "typetober") {
      if (!token) return res.status(401).json({ error: "unauthorized" });

      const supabaseTT = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      const {
        data: { user: ttUser },
        error: ttAuthError
      } = await supabaseTT.auth.getUser(token);
      if (ttAuthError || !ttUser) {
        return res.status(401).json({ error: "unauthorized" });
      }

      // Bulk upload helper: which letter does each image show?
      if (action === "recognise") {
        if (!validRecogniseImages(ttImages)) {
          return res.status(400).json({ error: "send 1-12 images" });
        }
        try {
          const letters = await recogniseLetters(
            ttImages,
            process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY
          );
          return res.status(200).json({ letters });
        } catch (err) {
          console.error("typetober recognise error:", err);
          return res.status(502).json({ error: "couldn't read the images" });
        }
      }

      // Checkout closed without paying: mark that order's rows failed so
      // they never count or show anywhere. Never touches paid rows.
      if (action === "cancel") {
        if (!razorpay_order_id) return res.status(400).json({ error: "missing order" });
        const { error: cancelErr } = await supabaseTT
          .from("typetober_submissions")
          .update({ status: "failed" })
          .eq("razorpay_order_id", razorpay_order_id)
          .eq("user_id", ttUser.id)
          .eq("status", "pending");
        if (cancelErr) {
          console.error("typetober cancel error:", cancelErr);
          return res.status(500).json({ error: "server error" });
        }
        return res.status(200).json({ ok: true });
      }

      // ₹10 in India, $1 for international cards (smallest currency unit),
      // per image. Priced here, never trusted from the client.
      const TYPETOBER_PRICES = { INR: 1000, USD: 100 };
      const ttCurrency = requestedCurrency === "USD" ? "USD" : "INR";
      const TYPETOBER_UNIT = TYPETOBER_PRICES[ttCurrency];

      // Synchronous, server-side payment verification. A bulk order has one
      // row per image, all sharing the order id; every one becomes paid.
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

        const { data: submissions, error: updateErr } = await supabaseTT
          .from("typetober_submissions")
          .update({ razorpay_payment_id, razorpay_signature, status: "success" })
          .eq("razorpay_order_id", razorpay_order_id)
          .eq("user_id", ttUser.id)
          .select();
        if (updateErr) {
          console.error("typetober submission update error:", updateErr);
          return res.status(500).json({ error: "server error" });
        }
        if (!submissions?.length) {
          return res.status(404).json({ error: "submission record not found" });
        }
        return res.status(200).json({ ok: true, submissions, submission: submissions[0] });
      }

      // One image ({letterIndex, imagePath}) or a bulk list ({items: [...]}).
      const ttItems = Array.isArray(ttItemsRaw)
        ? ttItemsRaw
        : [{ letterIndex, imagePath }];
      const ttValid =
        ttItems.length > 0 &&
        ttItems.length <= 60 &&
        ttItems.every(
          (it) =>
            it &&
            Number.isInteger(it.letterIndex) &&
            it.letterIndex >= 0 &&
            it.letterIndex <= 25 &&
            typeof it.imagePath === "string" &&
            it.imagePath.startsWith(`${ttUser.id}/`)
        );
      if (!ttValid) {
        return res.status(400).json({ error: "missing letter or image" });
      }
      const ttRows = (extra) =>
        ttItems.map((it) => ({
          user_id: ttUser.id,
          letter_index: it.letterIndex,
          image_path: it.imagePath,
          amount: TYPETOBER_UNIT / 100,
          currency: ttCurrency,
          ...extra
        }));

      // Local-dev-only stand-in for a confirmed payment.
      if (devConfirm) {
        if (process.env.NODE_ENV === "production") {
          return res.status(403).json({ error: "not available in production" });
        }
        const { data: submissions, error: insertErr } = await supabaseTT
          .from("typetober_submissions")
          .insert(ttRows({ status: "success" }))
          .select();
        if (insertErr) {
          console.error("dev typetober insert error:", insertErr);
          return res.status(500).json({ error: "server error" });
        }
        return res.status(200).json({ ok: true, submissions, submission: submissions[0] });
      }

      if (!process.env.RAZORPAY_KEY_ID) return res.status(500).json({ error: "RAZORPAY_KEY_ID missing" });
      if (!process.env.RAZORPAY_KEY_SECRET) return res.status(500).json({ error: "RAZORPAY_KEY_SECRET missing" });

      const ttAuth = Buffer.from(
        `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
      ).toString("base64");
      const ttTotal = TYPETOBER_UNIT * ttItems.length;

      const orderRes = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: `Basic ${ttAuth}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: ttTotal,
          currency: ttCurrency,
          receipt: `tt_${ttUser.id.slice(0, 8)}_${ttItems.length}_${Date.now()}`,
          notes: { product: "typetober", images: String(ttItems.length) }
        })
      });
      if (!orderRes.ok) {
        console.error("Razorpay order error:", await orderRes.text());
        return res.status(500).json({ error: "failed to create order" });
      }
      const order = await orderRes.json();

      const { error: insertErr } = await supabaseTT
        .from("typetober_submissions")
        .insert(ttRows({ razorpay_order_id: order.id, status: "pending" }));
      if (insertErr) {
        console.error("typetober pending insert error:", insertErr);
        return res.status(500).json({ error: "server error" });
      }

      return res.status(200).json({
        order_id: order.id,
        amount: ttTotal,
        currency: ttCurrency,
        count: ttItems.length,
        key_id: process.env.RAZORPAY_KEY_ID
      });
    }

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
      if (!process.env.RAZORPAY_KEY_ID) return res.status(500).json({ error: "RAZORPAY_KEY_ID missing" });
      if (!process.env.RAZORPAY_KEY_SECRET) return res.status(500).json({ error: "RAZORPAY_KEY_SECRET missing" });

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
    if (!process.env.RAZORPAY_KEY_ID) return res.status(500).json({ error: "RAZORPAY_KEY_ID missing" });
    if (!process.env.RAZORPAY_KEY_SECRET) return res.status(500).json({ error: "RAZORPAY_KEY_SECRET missing" });

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
