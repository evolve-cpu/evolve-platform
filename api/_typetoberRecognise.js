// Typetober bulk upload: works out which letter (A–Z) each illustration
// shows. Shared by api/razorpay-create-order.js (production) and the Vite
// dev middleware in vite.config.ts (plain `npm run dev`). The leading
// underscore keeps Vercel from deploying this file as its own function.
//
// Input: small square JPEGs as base64 (no data: prefix), in order.
// Output: one entry per image, a letter index 0–25 or null when the model
// isn't sure. The client asks the user to map the nulls by hand.

export const RECOGNISE_MAX_IMAGES = 12;
const MAX_IMAGE_CHARS = 400000; // ~300 KB of JPEG per image

const PROMPT = `You are sorting entries for a typography illustration challenge.
Each image is someone's illustration of one letter of the Latin alphabet (A to Z).
The letter may be hand drawn, painted, built from objects, decorated or stylised.
For every image, in the order given, say which single letter it depicts.
If you cannot tell with reasonable confidence, answer null for that image.
Reply with only a JSON array with exactly one item per image, each an uppercase letter string or null.
Example for three images: ["A", null, "Q"]`;

export function validRecogniseImages(images) {
  return (
    Array.isArray(images) &&
    images.length > 0 &&
    images.length <= RECOGNISE_MAX_IMAGES &&
    images.every((b) => typeof b === "string" && b.length > 0 && b.length <= MAX_IMAGE_CHARS)
  );
}

export async function recogniseLetters(images, apiKey) {
  if (!apiKey) throw new Error("GEMINI_API_KEY missing");
  const parts = [{ text: PROMPT }];
  images.forEach((data, k) => {
    parts.push({ text: `Image ${k + 1}:` });
    parts.push({ inline_data: { mime_type: "image/jpeg", data } });
  });

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: { temperature: 0, responseMimeType: "application/json" }
      })
    }
  );
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(json?.error?.message || `recognition failed (${res.status})`);
  }

  let raw = json?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
  raw = raw.replace(/^```(?:json)?\s*|\s*```$/g, "");
  let arr;
  try {
    arr = JSON.parse(raw);
  } catch {
    arr = [];
  }
  if (!Array.isArray(arr)) arr = [];

  return images.map((_, k) => {
    const v = arr[k];
    if (typeof v !== "string") return null;
    const ch = v.trim().toUpperCase();
    return /^[A-Z]$/.test(ch) ? ch.charCodeAt(0) - 65 : null;
  });
}
