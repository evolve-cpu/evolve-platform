// api/razorpay-create-order-portfolio.js
// Order creation for the paid 1:1 Portfolio Review programme (₹1,400 flat).
// Mirrors razorpay-create-order.js's mentorship flow, minus batch logic.
import { createClient } from "@supabase/supabase-js";

const AMOUNT_PAISE = 140000; // ₹1,400

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" });
  }

  try {
    if (!process.env.RAZORPAY_KEY_ID) return res.status(500).json({ error: "RAZORPAY_KEY_ID missing" });
    if (!process.env.RAZORPAY_KEY_SECRET) return res.status(500).json({ error: "RAZORPAY_KEY_SECRET missing" });
    if (!process.env.SUPABASE_URL) return res.status(500).json({ error: "SUPABASE_URL missing" });
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return res.status(500).json({ error: "SUPABASE_SERVICE_ROLE_KEY missing" });

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { phone, token } = body || {};

    if (!token) {
      return res.status(401).json({ error: "unauthorized" });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: "unauthorized" });
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
