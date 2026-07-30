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
//
// The actual fetch+Gemini pipeline lives in _instituteExtract.js, shared
// with sync-institute-posts.js (the recurring job that re-runs this same
// extraction to pick up new posts from an institute's site automatically).

import { extractInstituteDetails } from "./_instituteExtract.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const rawUrl = (body?.url || "").trim();
  if (!rawUrl) {
    return res.status(400).json({ error: "missing url" });
  }

  const result = await extractInstituteDetails(rawUrl);
  return res.status(200).json(result);
}
