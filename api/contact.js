// api/contact.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const { email, message } = body || {};

    if (!email || !message) {
      return res.status(400).json({ error: "missing email or message" });
    }

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      console.error("BREVO_API_KEY is missing");
      return res.status(500).json({ error: "server misconfigured" });
    }

    const headers = {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": apiKey
    };

    // ---------------------------------------------
    // 1) email sent TO YOUR TEAM
    // ---------------------------------------------
    const payloadToTeam = {
      sender: {
        email: "evolve@paperclip.design", // VERIFIED SENDER
        name: "evolve"
      },
      to: [
        {
          email: "sonam@evolvedesign.academy" // YOUR INBOX
        }
      ],
      subject: "new contact message from evolve website",
      htmlContent: `
        <h3>new contact form submission</h3>
        <p><strong>from:</strong> ${email}</p>
        <p><strong>message:</strong></p>
        <p>${String(message).replace(/\n/g, "<br />")}</p>
      `
    };

    // ---------------------------------------------
    // 2) AUTO-REPLY EMAIL TO USER
    // ---------------------------------------------
    const payloadToUser = {
      sender: {
        email: "evolve@paperclip.design", // VERIFIED SENDER
        name: "evolve"
      },
      to: [
        {
          email // user’s email
        }
      ],
      subject: "we got your message at evolve",
      htmlContent: `
        <p>hey ${email},</p>
        <p>thanks for writing to us — we’ve received your message and someone from our team will reach out soon.</p>
        <p>– team evolve</p>
      `
    };

    const [resTeam, resUser] = await Promise.all([
      fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers,
        body: JSON.stringify(payloadToTeam)
      }),
      fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers,
        body: JSON.stringify(payloadToUser)
      })
    ]);

    if (!resTeam.ok || !resUser.ok) {
      console.error("brevo team error:", await resTeam.text());
      console.error("brevo user error:", await resUser.text());
      return res.status(500).json({ error: "failed to send email" });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("api /contact error", err);
    return res.status(500).json({ error: "server error" });
  }
}
