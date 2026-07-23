import { sendEmail } from "./_sendEmail.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { orgName, requesterName, requesterEmail, message, batchSize, timeline } = body || {};

  if (!orgName || !message) {
    return res.status(400).json({ error: "missing required fields" });
  }

  const html = `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#000000;color:#fff;border-radius:16px">
    <p style="color:rgba(255,255,255,0.5);font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 10px">program request</p>
    <h1 style="font-size:20px;font-weight:800;margin:0 0 16px">${orgName}</h1>
    <p style="font-size:14px;line-height:1.6;color:rgba(255,255,255,0.8);margin:0 0 8px"><strong>from:</strong> ${requesterName || "—"} (${requesterEmail || "—"})</p>
    ${batchSize ? `<p style="font-size:14px;color:rgba(255,255,255,0.8);margin:0 0 8px"><strong>batch size:</strong> ${batchSize}</p>` : ""}
    ${timeline ? `<p style="font-size:14px;color:rgba(255,255,255,0.8);margin:0 0 8px"><strong>timeline:</strong> ${timeline}</p>` : ""}
    <p style="font-size:14px;line-height:1.7;color:rgba(255,255,255,0.8);margin:16px 0 0;white-space:pre-wrap">${message}</p>
  </div>`;

  try {
    await sendEmail({
      from: "noreply@evolvedesign.academy",
      fromName: `${orgName} × evolve`,
      to: "content@evolvedesign.academy",
      subject: `program request from ${orgName}`,
      html
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("request-program error:", err.message);
    return res.status(500).json({ error: "failed to send email" });
  }
}
