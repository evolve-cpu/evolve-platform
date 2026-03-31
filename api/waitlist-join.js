// api/waitlist-join.js
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" });
  }

  try {
    if (!process.env.SUPABASE_URL) return res.status(500).json({ error: "SUPABASE_URL missing" });
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return res.status(500).json({ error: "SUPABASE_SERVICE_ROLE_KEY missing" });

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { phone, token } = body || {};

    if (!token) return res.status(401).json({ error: "unauthorized" });

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return res.status(401).json({ error: "unauthorized" });

    // Upsert into waitlist table (one entry per user)
    await supabase
      .from("mentorship_waitlist")
      .upsert(
        {
          user_id: user.id,
          email: user.email || "",
          user_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email || "",
          phone: phone || ""
        },
        { onConflict: "user_id" }
      );

    // Send Brevo confirmation email
    if (user.email && process.env.BREVO_API_KEY && process.env.BREVO_WAITLIST_TEMPLATE_ID) {
      const firstName =
        (user.user_metadata?.full_name || user.user_metadata?.name || "")
          .split(" ")[0] || "there";

      await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.BREVO_API_KEY
        },
        body: JSON.stringify({
          sender: { name: "evolve", email: "content@evolvedesign.academy" },
          to: [{ email: user.email, name: user.user_metadata?.full_name || user.email }],
          templateId: Number(process.env.BREVO_WAITLIST_TEMPLATE_ID),
          params: { FIRSTNAME: firstName }
        })
      });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("waitlist-join error:", err);
    return res.status(500).json({ error: "server error" });
  }
}
