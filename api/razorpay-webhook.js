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

      // Fetch the updated payment row to get batch_id + user_id
      const { data: pmnt } = await supabase
        .from("mentorship_payments")
        .select("batch_id, user_id")
        .eq("razorpay_order_id", payment.order_id)
        .single();

      // Assign user to the batch in mentorship_batches (enroll)
      if (pmnt?.batch_id && pmnt?.user_id) {
        // Upsert into batch_members table so user is enrolled
        await supabase
          .from("batch_members")
          .upsert({ batch_id: pmnt.batch_id, user_id: pmnt.user_id }, { onConflict: "batch_id,user_id" });
      }

      // Check if batch is now full → close mentorship_batches row
      // batch_spots is a view — closing mentorship_batches is sufficient
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

      // Send Brevo confirmation email
      if (pmnt?.user_id) {
        const { data: fullPmnt } = await supabase
          .from("mentorship_payments")
          .select("*, batch:mentorship_batches(batch_number, start_date)")
          .eq("razorpay_order_id", payment.order_id)
          .single();

        const { data: { user: authUser } } = await supabase.auth.admin.getUserById(pmnt.user_id);

        if (authUser?.email && process.env.BREVO_API_KEY) {
          const firstName = (authUser.user_metadata?.full_name || authUser.user_metadata?.name || "").split(" ")[0] || "there";
          const startDate = fullPmnt?.batch?.start_date
            ? new Date(fullPmnt.batch.start_date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
            : "—";

          await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "api-key": process.env.BREVO_API_KEY
            },
            body: JSON.stringify({
              sender: { name: "evolve", email: "content@evolvedesign.academy" },
              to: [{ email: authUser.email, name: authUser.user_metadata?.full_name || authUser.email }],
              templateId: Number(process.env.BREVO_TEMPLATE_ID),
              params: {
                FIRSTNAME: firstName,
                PLAN: fullPmnt?.plan || "starter",
                AMOUNT: `Rs. ${Number(fullPmnt?.amount || 0).toLocaleString("en-IN")}`,
                BATCH: `Batch ${fullPmnt?.batch?.batch_number ?? "—"}`,
                START_DATE: startDate,
                REF: payment.id || "—"
              }
            })
          });
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
