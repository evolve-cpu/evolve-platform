// Shared Gemini-based extraction of an institute's homepage. Used both by
// the one-time onboarding fetch (fetch-institute-details.js) and the
// recurring re-sync that pulls new posts from an institute's own website
// into their evolve feed (sync-institute-posts.js) — kept in one place so
// both stay in sync instead of drifting apart.

const UA =
  "Mozilla/5.0 (compatible; evolve-bot/1.0; +https://evolvedesign.academy)";

export async function fetchHtml(url) {
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

export function extractLogoCandidate(html, baseUrl) {
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

// Strips HTML down to plain text for the prompt, but first rewrites every
// <a href="…">label</a> into "label (https://…)" so link targets survive
// as visible text — raw <a> tags get stripped along with everything else,
// so without this Gemini has no way to tell us which URL a given
// post/announcement actually links to.
function stripToText(html, baseUrl) {
  const withInlineLinks = html.replace(
    /<a\b[^>]*?\bhref\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
    (match, href, label) => {
      const text = label
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (!text) return "";
      if (/^(#|javascript:|mailto:|tel:)/i.test(href.trim())) return text;
      try {
        return `${text} (${new URL(href, baseUrl).href})`;
      } catch {
        return text;
      }
    }
  );
  return withInlineLinks
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
) => `You're helping set up an institute's profile page on a design-education platform called evolve, using the text scraped from their website's homepage below. Every link on the page has been inlined right after its text as "(https://...)" — use that to fill in "url" fields, copying it verbatim. Extract only what's actually present in that text — never invent facts, numbers, dates, or urls.

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
  "posts": [{"title": "a real recent news/announcement headline found on the page", "description": "a 1-2 sentence summary, or null", "url": "the exact (https://...) link that appeared right after this item's text in the source below, or null if none appeared right after it"}]
}

Rules:
- Every array can be empty — do not pad with invented entries just to fill the shape.
- Only include an event, testimonial, or post if the source text clearly contains it — do not infer or fabricate one.
- "about" must be a neutral factual summary of what's in the text, not marketing copy you generate yourself.
- a post's "url" must be copied verbatim from a "(https://...)" immediately following that post's text — never construct, guess, or reuse a url from elsewhere on the page.

Website text:
"""
${text}
"""`;

function resolveUrl(u, baseUrl) {
  if (!u) return null;
  try {
    return new URL(u, baseUrl).href;
  } catch {
    return null;
  }
}

// Fetches an institute's homepage and asks Gemini to extract a profile
// draft from it. Returns { ok: false, reason } on any failure — network,
// missing key, or a Gemini/parse error — never throws.
export async function extractInstituteDetails(rawUrl) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error(
      "extractInstituteDetails: no GEMINI_API_KEY or VITE_GEMINI_API_KEY configured"
    );
    return { ok: false, reason: "extraction isn't configured yet" };
  }

  let target;
  try {
    target = new URL(
      /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`
    );
  } catch {
    return { ok: false, reason: "that doesn't look like a valid url" };
  }

  const html = await fetchHtml(target.href);
  if (!html) return { ok: false, reason: "couldn't reach that site" };

  const logoUrl = extractLogoCandidate(html, target.href);
  const text = stripToText(html, target.href);

  try {
    const geminiRes = await fetch(
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
    if (!geminiRes.ok) {
      console.error(
        "extractInstituteDetails: gemini responded",
        geminiRes.status,
        geminiData?.error?.message || geminiData
      );
      return { ok: false, reason: "couldn't extract details from that site" };
    }

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

    return {
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
      posts: Array.isArray(extracted.posts)
        ? extracted.posts.slice(0, 5).map((p) => ({
            title: p.title || null,
            description: p.description || null,
            url: resolveUrl(p.url, target.href)
          }))
        : []
    };
  } catch (err) {
    console.error("extractInstituteDetails error:", err.message);
    return { ok: false, reason: "couldn't extract details from that site" };
  }
}
