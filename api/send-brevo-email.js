import { sendEmail } from "./_sendEmail.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { to, sender, subject, htmlContent } = body || {};

  if (!to || !subject || !htmlContent) {
    return res.status(400).json({ error: "missing required fields" });
  }

  // Support both array of objects [{email, name}] and array of strings
  const toEmails = Array.isArray(to)
    ? to.map(t => (typeof t === "string" ? t : t.email))
    : [typeof to === "string" ? to : to.email];

  const from = sender?.email || "noreply@evolvedesign.academy";
  const fromName = sender?.name || "evolve";

  try {
    await sendEmail({ from, fromName, to: toEmails, subject, html: htmlContent });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("send-brevo-email error:", err.message);
    return res.status(500).json({ error: "failed to send email" });
  }
}
