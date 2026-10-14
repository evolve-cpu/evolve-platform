// api/_lifecycleEmails.js
// Welcome (first sign-up) and goodbye (account deleted) emails, sent from
// api/admin.js (ops "welcome_email" / "delete_account"). Underscore prefix =
// not its own Vercel function.

import { sendEmail } from "./_sendEmail.js";

const FROM = "noreply@evolvedesign.academy";
const FROM_NAME = "Team evolve";

export function firstNameOf(name, email) {
  const first = String(name || "")
    .trim()
    .split(/\s+/)[0];
  if (first && !first.includes("@"))
    return first[0].toUpperCase() + first.slice(1);
  return "there";
}

export const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]
  );

const SITE = "https://www.evolvedesign.academy";
const LOGO = `${SITE}/images/evolve-email-logo.png`;
const HEADING_FONT =
  "'Bricolage Grotesque','Arial Black',Helvetica,Arial,sans-serif";
const BODY_FONT = "Inter,Helvetica,Arial,sans-serif";

// Gmail and most Outlooks ignore web fonts, so titles go out as images
// drawn in Bricolage (public/images/email/, 3x for retina; width/height
// here are the display size). The alt text is styled as the fallback for
// clients that block images. A title without an image renders as text.
const HEADINGS = {
  "Welcome to evolve!": ["welcome.png", 250, 37],
  "Sorry to see you go": ["sorry.png", 247, 37],
  "You're in!": ["youre-in.png", 117, 37]
};

function heading(title) {
  const img = HEADINGS[title];
  const textStyle = `font-family:${HEADING_FONT};font-size:28px;line-height:1.15;font-weight:800;letter-spacing:-0.03em;color:#DF0586`;
  if (!img) return `<h1 style="margin:0;${textStyle}">${esc(title)}</h1>`;
  const [file, w, h] = img;
  return `<img src="${SITE}/images/email/${file}" width="${w}" height="${h}" alt="${esc(title)}" style="display:block;border:0;width:${w}px;height:${h}px;${textStyle}">`;
}

// Dark card with a yellow header band (pink title), body copy, a hairline
// and the evolve logo (also used by the sign-in link email in
// api/_manualGrant.js). Same look as the sign-in code email in
// supabase/templates/otp.html. Preheader is the hidden inbox preview line.
export function emailLayout({ title, preheader, paragraphs }) {
  return `<!doctype html>
<html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark light"><meta name="supported-color-schemes" content="dark light">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=Inter:wght@400;500&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#ffffff">
<span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:32px 16px">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:522px;background:#161616;border-radius:24px;overflow:hidden">
      <tr><td style="background:#FFD007;padding:40px 44px 38px;border-radius:24px 24px 0 0">
        ${heading(title)}
      </td></tr>
      <tr><td style="padding:36px 44px 32px;font-family:${BODY_FONT};color:#ffffff">
        ${paragraphs.map((p) => p.startsWith("<table") ? p : `<p style="margin:0 0 20px;font-size:15px;line-height:1.55;color:#ffffff">${p}</p>`).join("\n        ")}
        <p style="margin:36px 0 0;font-size:15px;line-height:1.55;color:#ffffff">Team evolve</p>
      </td></tr>
      <tr><td style="padding:0 30px"><div style="height:1px;line-height:1px;font-size:0;background:#4a4a4a">&nbsp;</div></td></tr>
      <tr><td style="padding:32px 44px 40px">
        <a href="${SITE}" style="text-decoration:none"><img src="${LOGO}" width="128" height="52" alt="evolve, be remarkable" style="display:block;border:0;width:128px;height:auto"></a>
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
    subject: "Welcome to evolve 👋",
    html: emailLayout({
      title: "Welcome to evolve!",
      preheader: "Where your design journey grows.",
      paragraphs: [
        `Hi ${esc(firstName)},`,
        "Welcome to evolve.",
        "evolve is a space to learn, explore, share, and grow with everything you need to keep moving forward.",
        "Glad to have you here. Looking forward to seeing where you go."
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
    html: emailLayout({
      title: "Sorry to see you go",
      preheader: "Until next time.",
      paragraphs: [
        `Hi ${esc(firstName)},`,
        "Sorry to see you go.",
        "Your evolve account has been deleted.<br>We’re glad you were here, even for a little while.",
        "Keep learning. Keep making.<br>And keep finding your way."
      ]
    })
  });
}
