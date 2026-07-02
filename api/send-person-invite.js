import { createClient } from "@supabase/supabase-js";

const ANU_ORIGIN_URL = "https://anu.evolvedesign.academy";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { email, role } = body || {};

  if (!email || !role) {
    return res.status(400).json({ error: "missing email or role" });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  const brevoKey = process.env.BREVO_API_KEY;

  if (!brevoKey) {
    return res.status(500).json({ error: "server misconfigured: missing BREVO_API_KEY" });
  }

  // Generate magic link if Supabase admin is available
  let magicLink = null;
  if (supabaseUrl && serviceRoleKey) {
    try {
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });
      const redirectTo =
        role === "student"
          ? `${ANU_ORIGIN_URL}/portfolio-review/form`
          : `${ANU_ORIGIN_URL}/admin/dashboard`;
      const { data } = await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: { redirectTo, expiresIn: 86400 }
      });
      if (data?.properties?.action_link) magicLink = data.properties.action_link;
    } catch {}
  }

  const isStudent = role === "student";
  const headline = isStudent
    ? "Your portal is ready"
    : role === "uni_admin"
      ? "Your admin portal is ready"
      : "Your faculty portal is ready";
  const bodyText = isStudent
    ? "Click below to sign in and submit your portfolio for expert feedback. No password needed."
    : "You've been invited to the Anant National University x evolve admin panel. No password needed.";
  const cta = isStudent ? "Go to portal" : "Access my dashboard";
  const link = magicLink || (isStudent ? `${ANU_ORIGIN_URL}/signin` : `${ANU_ORIGIN_URL}/admin`);
  const subject = isStudent
    ? "Your portal is ready, Anant National University x Evolve"
    : "Your admin portal access, Anant National University x Evolve";

  const htmlContent = `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:40px 32px;background:#060c17;color:#fff;border-radius:16px"><img src="${ANU_ORIGIN_URL}/images/anant-logo.png" alt="Anant National University" style="height:40px;margin:0 auto 32px 0;display:block" /><p style="color:rgba(255,255,255,0.5);font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 10px">Anant National University x evolve</p><h1 style="font-size:24px;font-weight:800;letter-spacing:-0.02em;line-height:1.25;margin:0 0 16px">${headline}</h1><p style="font-size:15px;line-height:1.7;color:rgba(255,255,255,0.72);margin:0 0 32px">${bodyText}</p><a href="${link}" style="display:inline-block;background:#2563eb;color:#fff;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;text-decoration:none">${cta}</a><hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:36px 0 20px" /><p style="font-size:12px;color:rgba(255,255,255,0.28);margin:0">This link is for ${email}. If this wasn't you, ignore this email.</p></div>`;

  const r = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": brevoKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: { name: "Anant × evolve", email: "noreply@evolvedesign.academy" },
      to: [{ email }],
      subject,
      htmlContent
    })
  });

  if (!r.ok) {
    const err = await r.text();
    console.error("brevo send-person-invite error:", err);
    return res.status(500).json({ error: "failed to send email" });
  }

  return res.status(200).json({ ok: true });
}
