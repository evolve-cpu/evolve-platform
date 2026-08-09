// api/dev-confirm-portfolio-review.js
// Local-dev-only stand-in for razorpay-webhook.js's row-creation step.
// BookModal skips the real Razorpay checkout entirely in import.meta.env.DEV
// (see PortfolioReviewProgramme.jsx), so there's no webhook to grant access
// to the review workspace — this mimics that grant so the flow is testable
// locally. Refuses to run once deployed (NODE_ENV === "production").
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ error: "not available in production" });
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" });
  }

  try {
    if (!process.env.SUPABASE_URL) return res.status(500).json({ error: "SUPABASE_URL missing" });
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return res.status(500).json({ error: "SUPABASE_SERVICE_ROLE_KEY missing" });

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { token } = body || {};
    if (!token) return res.status(401).json({ error: "unauthorized" });

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return res.status(401).json({ error: "unauthorized" });

    await supabase.from("evolve_portfolio_reviews").upsert(
      {
        user_id: user.id,
        name: user.user_metadata?.full_name || user.user_metadata?.name || user.email || "",
        email: user.email || "",
        review_status: "draft"
      },
      { onConflict: "user_id", ignoreDuplicates: true }
    );

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("dev-confirm-portfolio-review error:", err);
    return res.status(500).json({ error: "server error" });
  }
}
