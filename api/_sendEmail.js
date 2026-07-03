/**
 * Shared transactional email helper.
 * Tries Resend first (RESEND_API_KEY), falls back to Brevo (BREVO_API_KEY).
 * Returns { ok: true } or throws an Error.
 */
export async function sendEmail({ from, fromName, to, subject, html }) {
  const resendKey = process.env.RESEND_API_KEY;
  const brevoKey  = process.env.BREVO_API_KEY;

  if (!resendKey && !brevoKey) {
    throw new Error("No email provider configured (set RESEND_API_KEY or BREVO_API_KEY)");
  }

  if (resendKey) {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: `${fromName} <${from}>`,
        to: Array.isArray(to) ? to : [to],
        subject,
        html
      })
    });
    if (!r.ok) {
      const err = await r.text();
      throw new Error(`Resend error: ${err}`);
    }
    return { ok: true };
  }

  // Brevo fallback
  const r = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": brevoKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: { name: fromName, email: from },
      to: Array.isArray(to) ? to.map(e => (typeof e === "string" ? { email: e } : e)) : [{ email: to }],
      subject,
      htmlContent: html
    })
  });
  if (!r.ok) {
    const err = await r.text();
    throw new Error(`Brevo error: ${err}`);
  }
  return { ok: true };
}
