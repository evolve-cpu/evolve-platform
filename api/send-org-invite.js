import { sendEmail } from "./_sendEmail.js";

const EVOLVE_ORIGIN_URL = "https://www.evolvedesign.academy";
const EVOLVE_YELLOW = "#FFD007";

const ROLE_COPY = {
  student: {
    headline: "you're invited — as a student",
    body: (org) => `${org} has invited you to join their space on evolve as a student. accept below to set up your student profile — no password needed.`
  },
  faculty: {
    headline: "you're invited — as faculty",
    body: (org) => `${org} has invited you to join their space on evolve as faculty. accept below to set up your profile — no password needed.`
  },
  admin: {
    headline: "you're invited — as an admin",
    body: (org) => `${org} has invited you to help manage their space on evolve as an admin. accept below to get started — no password needed.`
  },
  member: {
    headline: "you're invited — join the team",
    body: (org) => `${org} has invited you to join their team space on evolve. accept below to get started — no password needed.`
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { email, orgName, orgLogoUrl, role, inviterName, inviteLink } = body || {};

  if (!email || !orgName || !role || !inviteLink) {
    return res.status(400).json({ error: "missing required fields" });
  }

  const copy = ROLE_COPY[role] || ROLE_COPY.student;
  const inviterLine = inviterName
    ? `<p style="font-size:13px;color:rgba(255,255,255,0.4);margin:0 0 24px">invited by ${inviterName}</p>`
    : "";
  const orgLogoBlock = orgLogoUrl
    ? `<img src="${orgLogoUrl}" alt="" style="height:28px;max-width:120px;object-fit:contain;margin:0 0 20px;display:block" />`
    : "";

  const html = `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:40px 32px;background:#000000;color:#fff;border-radius:16px">
    <img src="${EVOLVE_ORIGIN_URL}/images/evolve-logo.svg" alt="evolve" style="height:26px;margin:0 0 32px 0;display:block" />
    ${orgLogoBlock}
    <p style="color:rgba(255,255,255,0.5);font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 10px">${orgName} × evolve</p>
    <h1 style="font-size:24px;font-weight:800;letter-spacing:-0.02em;line-height:1.25;margin:0 0 16px">${copy.headline}</h1>
    <p style="font-size:15px;line-height:1.7;color:rgba(255,255,255,0.72);margin:0 0 20px">${copy.body(orgName)}</p>
    ${inviterLine}
    <a href="${inviteLink}" style="display:inline-block;background:${EVOLVE_YELLOW};color:#000;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;text-decoration:none">accept invite</a>
    <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:36px 0 20px" />
    <p style="font-size:12px;color:rgba(255,255,255,0.28);margin:0">This link is for ${email}. If this wasn't you, ignore this email.</p>
  </div>`;

  try {
    await sendEmail({
      from: "noreply@evolvedesign.academy",
      fromName: `${orgName} × evolve`,
      to: email,
      subject: `you're invited to ${orgName} on evolve`,
      html
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("send-org-invite error:", err.message);
    return res.status(500).json({ error: "failed to send email" });
  }
}
