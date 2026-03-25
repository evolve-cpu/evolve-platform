// api/razorpay-create-order.js
import { createClient } from "@supabase/supabase-js";

const PLAN_AMOUNTS_PAISE = {
  starter: 1500000,     // ₹15,000
  accelerator: 3500000  // ₹35,000
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { plan, phone, token } = body || {};

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

    // Get currently open batch
    const { data: batch } = await supabase
      .from("mentorship_batches")
      .select("id")
      .eq("status", "open")
      .single();

    // Insert pending payment row
    await supabase.from("mentorship_payments").insert({
      user_id: user.id,
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
