export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { to, sender, subject, htmlContent } = body || {};

  if (!to || !subject || !htmlContent) {
    return res.status(400).json({ error: "missing required fields" });
  }

  const brevoKey = process.env.BREVO_API_KEY;
  if (!brevoKey) {
    return res.status(500).json({ error: "server misconfigured: missing BREVO_API_KEY" });
  }

  const r = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": brevoKey, "Content-Type": "application/json" },
    body: JSON.stringify({ sender, to, subject, htmlContent })
  });

  if (!r.ok) {
    const err = await r.text();
    console.error("brevo send-brevo-email error:", err);
    return res.status(500).json({ error: "failed to send email" });
  }

  return res.status(200).json({ ok: true });
}
