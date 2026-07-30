// Pulls a starting point for an institute's evolve space from their own
// website, so an admin isn't handed a blank form for something they're
// paying for. Runs server-side because a browser can't fetch an arbitrary
// external site (CORS) — this fetches the homepage HTML, then asks Gemini
// to extract only what's actually stated there (never invents facts).
//
// This is single-page (homepage only) extraction, not a site crawl — an
// institute whose "about us" or "news" lives on a separate page will get
// thinner results. Everything returned is still just a draft: the client
// shows it as removable/editable before anything is saved, and the admin
// can fully edit it again later from the space's own settings.

const UA =
  "Mozilla/5.0 (compatible; evolve-bot/1.0; +https://evolvedesign.academy)";

async function fetchHtml(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA },
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

function extractLogoCandidate(html, baseUrl) {
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<link[^>]+rel=["'](?:apple-touch-icon|icon)["'][^>]+href=["']([^"']+)["']/i,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:apple-touch-icon|icon)["']/i
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) {
      try {
        return new URL(m[1], baseUrl).href;
      } catch {
        // not a valid/resolvable url — try the next pattern
      }
    }
  }
  return null;
}

function stripToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 9000);
}

const EXTRACTION_PROMPT = (
  text
) => `You're helping set up an institute's profile page on a design-education platform called evolve, using the text scraped from their website's homepage below. Extract only what's actually present in that text — never invent facts, numbers, or dates.

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "name": "institute name or null",
  "about": "a neutral 2-4 sentence description built only from the text below, or null",
  "location": "city, state/country or null",
  "yearFounded": "year as a string or null",
  "socialLinks": [{"platform": "instagram|linkedin|x / twitter|facebook|youtube", "url": "full url"}],
  "awards": [{"title": "award, accreditation, or ranking name", "issuer": "issuing body and/or year, or null"}],
  "events": [{"title": "event/deadline/exam name", "date": "YYYY-MM-DD or null if no exact date is stated", "meta": "short context or null", "type": "exam|event|deadline|result"}],
  "testimonials": [{"quote": "a real quoted testimonial found on the page", "name": "the person's name", "role": "their role/batch if stated, or null"}],
  "posts": [{"title": "a real recent news/announcement headline found on the page", "description": "a 1-2 sentence summary, or null"}]
}

Rules:
- Every array can be empty — do not pad with invented entries just to fill the shape.
- Only include an event, testimonial, or post if the source text clearly contains it — do not infer or fabricate one.
- "about" must be a neutral factual summary of what's in the text, not marketing copy you generate yourself.

Website text:
"""
${text}
"""`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" });
  }

  // Vercel exposes every configured env var to process.env regardless of a
  // VITE_ prefix — that prefix only controls what Vite inlines into the
  // client bundle at build time. So this reads either name: a plain
  // GEMINI_API_KEY if one's been added, otherwise the VITE_ one that's
  // already set for the client-side Gemini usage elsewhere in the app.
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error(
      "fetch-institute-details error: no GEMINI_API_KEY or VITE_GEMINI_API_KEY configured"
    );
    return res
      .status(200)
      .json({ ok: false, reason: "extraction isn't configured yet" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const rawUrl = (body?.url || "").trim();
  if (!rawUrl) {
    return res.status(400).json({ error: "missing url" });
  }

  let target;
  try {
    target = new URL(
      /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`
    );
  } catch {
    return res
      .status(400)
      .json({ error: "that doesn't look like a valid url" });
  }

  const html = await fetchHtml(target.href);
  if (!html) {
    return res
      .status(200)
      .json({ ok: false, reason: "couldn't reach that site" });
  }

  const logoUrl = extractLogoCandidate(html, target.href);
  const text = stripToText(html);

  try {
    const geminiRes = await fetch(
      // `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      // `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: EXTRACTION_PROMPT(text) }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 2000 }
        })
      }
    );
    const geminiData = await geminiRes.json();
    let raw = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    raw = raw
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let extracted;
    try {
      extracted = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      extracted = match ? JSON.parse(match[0]) : null;
    }
    if (!extracted) throw new Error("couldn't parse extraction result");

    return res.status(200).json({
      ok: true,
      website: target.href,
      logoUrl,
      name: extracted.name || null,
      about: extracted.about || null,
      location: extracted.location || null,
      yearFounded: extracted.yearFounded || null,
      socialLinks: Array.isArray(extracted.socialLinks)
        ? extracted.socialLinks.slice(0, 6)
        : [],
      awards: Array.isArray(extracted.awards)
        ? extracted.awards.slice(0, 8)
        : [],
      events: Array.isArray(extracted.events)
        ? extracted.events.slice(0, 8)
        : [],
      testimonials: Array.isArray(extracted.testimonials)
        ? extracted.testimonials.slice(0, 5)
        : [],
      posts: Array.isArray(extracted.posts) ? extracted.posts.slice(0, 5) : []
    });
  } catch (err) {
    console.error("fetch-institute-details error:", err.message);
    return res
      .status(200)
      .json({ ok: false, reason: "couldn't extract details from that site" });
  }
}
