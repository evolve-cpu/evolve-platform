// api/razorpay-webhook.js
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";

// Tell Vercel NOT to parse the body — we need raw bytes for signature check
export const config = { api: { bodyParser: false } };

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", chunk => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const rawBody = await getRawBody(req);
    const signature = req.headers["x-razorpay-signature"];

    // Verify Razorpay HMAC signature
    const expectedSig = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    if (expectedSig !== signature) {
      return res.status(400).json({ error: "invalid signature" });
    }

    const payload = JSON.parse(rawBody.toString());
    const event = payload.event;
    const payment = payload.payload?.payment?.entity;

    if (!payment) return res.status(200).json({ ok: true });

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    if (event === "payment.captured") {
      // Mark payment as success
      await supabase
        .from("mentorship_payments")
        .update({
          razorpay_payment_id: payment.id,
          razorpay_signature: signature,
          status: "success"
        })
        .eq("razorpay_order_id", payment.order_id);

      // Check if batch is now full → close it
      const { data: pmnt } = await supabase
        .from("mentorship_payments")
        .select("batch_id")
        .eq("razorpay_order_id", payment.order_id)
        .single();

      if (pmnt?.batch_id) {
        const { data: batch } = await supabase
          .from("mentorship_batches")
          .select("total_seats")
          .eq("id", pmnt.batch_id)
          .single();

        const { count } = await supabase
          .from("mentorship_payments")
          .select("id", { count: "exact", head: true })
          .eq("batch_id", pmnt.batch_id)
          .eq("status", "success");

        if (batch && count >= batch.total_seats) {
          await supabase
            .from("mentorship_batches")
            .update({ status: "closed" })
            .eq("id", pmnt.batch_id);
        }
      }
    } else if (event === "payment.failed") {
      await supabase
        .from("mentorship_payments")
        .update({ status: "failed" })
        .eq("razorpay_order_id", payment.order_id);
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("webhook error:", err);
    return res.status(500).json({ error: "server error" });
  }
}
