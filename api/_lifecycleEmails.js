// api/_lifecycleEmails.js
// Welcome (first sign-up) and goodbye (account deleted) emails, sent from
// api/admin.js (ops "welcome_email" / "delete_account"). Underscore prefix =
// not its own Vercel function.

import { sendEmail } from "./_sendEmail.js";

const FROM = "noreply@evolvedesign.academy";
const FROM_NAME = "Team Evolve";

export function firstNameOf(name, email) {
  const first = String(name || "").trim().split(/\s+/)[0];
  if (first && !first.includes("@")) return first[0].toUpperCase() + first.slice(1);
  return "there";
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// one dark card, Evolve yellow wordmark; preheader is the hidden inbox
// preview line
function layout({ preheader, paragraphs }) {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#0d0d0d">
<span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;padding:32px 16px">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#161618;border:1px solid #262626;border-radius:20px">
      <tr><td style="padding:36px 32px 32px;font-family:Inter,Helvetica,Arial,sans-serif;color:#ffffff">
        <p style="margin:0 0 28px;font-size:22px;font-weight:800;letter-spacing:-0.02em;color:#FFD007">evolve</p>
        ${paragraphs.map((p) => `<p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:rgba(255,255,255,0.82)">${p}</p>`).join("\n        ")}
        <p style="margin:28px 0 0;font-size:15px;font-weight:700;color:#ffffff">Team Evolve</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

export function sendWelcomeEmail({ to, firstName }) {
  return sendEmail({
    from: FROM,
    fromName: FROM_NAME,
    to,
    subject: "Welcome to Evolve 👋",
    html: layout({
      preheader: "Where your design journey grows.",
      paragraphs: [
        `Hi ${esc(firstName)},`,
        "Welcome to Evolve.<br>Evolve is a space to learn, explore, share, and grow with everything you need to keep moving forward.",
        "Glad to have you here.<br>Looking forward to seeing where you go."
      ]
    })
  });
}

export function sendGoodbyeEmail({ to, firstName }) {
  return sendEmail({
    from: FROM,
    fromName: FROM_NAME,
    to,
    subject: "Sorry to see you go",
    html: layout({
      preheader: "Until next time.",
      paragraphs: [
        `Hi ${esc(firstName)},`,
        "Sorry to see you go.<br>Your Evolve account has been deleted.<br>We’re glad you were here, even for a little while.",
        "Keep learning. Keep making.<br>And keep finding your way."
      ]
    })
  });
}
