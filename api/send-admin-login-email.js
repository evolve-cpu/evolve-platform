export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { toEmail, magicLink, role } = body || {};

  if (!toEmail || !magicLink || !role) {
    return res.status(400).json({ error: "missing required fields" });
  }

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "server misconfigured" });
  }

  const isAdmin = role === "uni_admin";
  const roleLabel = isAdmin ? "admin" : "faculty";
  const ANU_ORIGIN = "https://anu.evolvedesign.academy";

  const htmlContent = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:40px 32px;background:#060c17;color:#fff;border-radius:16px">
      <img src="${ANU_ORIGIN}/images/anant-logo.png" alt="Anant National University" style="height:40px;margin:0 auto 32px 0;display:block" />
      <p style="color:rgba(255,255,255,0.5);font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 10px">Anant National University x evolve</p>
      <h1 style="font-size:24px;font-weight:800;letter-spacing:-0.02em;line-height:1.25;margin:0 0 16px">Your ${roleLabel} portal is ready</h1>
      <p style="font-size:15px;line-height:1.7;color:rgba(255,255,255,0.72);margin:0 0 32px">
        Click below to sign in to the Anant National University ${roleLabel} dashboard. No password needed.
      </p>
      <a href="${magicLink}" style="display:inline-block;background:#2563eb;color:#fff;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;text-decoration:none">
        Open my ${roleLabel} dashboard
      </a>
      <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:36px 0 20px" />
      <p style="font-size:12px;color:rgba(255,255,255,0.28);margin:0">This link is for ${toEmail}. If this wasn't you, ignore this email.</p>
    </div>`;

  const r = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: {
        name: "Anant National University x evolve",
        email: "noreply@evolvedesign.academy"
      },
      to: [{ email: toEmail }],
      subject: `Your ${roleLabel} portal access, Anant National University x Evolve`,
      htmlContent
    })
  });

  if (!r.ok) {
    const err = await r.text();
    console.error("brevo send-admin-login-email error:", err);
    return res.status(500).json({ error: "failed to send email" });
  }

  return res.status(200).json({ ok: true });
}
