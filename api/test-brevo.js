// TEMP — delete after testing
export default async function handler(req, res) {
  const r = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY
    },
    body: JSON.stringify({
      sender: { name: "evolve", email: "content@evolvedesign.academy" },
      to: [{ email: "content@evolvedesign.academy", name: "Test User" }],
      templateId: Number(process.env.BREVO_TEMPLATE_ID),
      params: {
        FIRSTNAME: "Yagnesh",
        PLAN: "starter",
        AMOUNT: "Rs. 15,000",
        BATCH: "Batch 1",
        START_DATE: "16 April 2026",
        REF: "pay_TEST123"
      }
    })
  });
  const data = await r.json();
  return res.status(r.status).json(data);
}
