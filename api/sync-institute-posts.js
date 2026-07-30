// Recurring re-sync: pulls any NEW posts/announcements from an institute's
// own website (re-running the same Gemini extraction used at onboarding,
// see _instituteExtract.js) and adds them straight to that org's evolve
// feed. Triggered on a schedule by Vercel Cron (see vercel.json) — never
// called from the browser.
//
// Dedup is title-based (case-insensitive, trimmed) against that org's
// existing org_updates — good enough to avoid reposting the same
// announcement every run without needing a stable per-post id from the
// source site (most institute sites don't have one worth relying on).
// Each post still gets a source_url (the specific link Gemini found for
// it, falling back to the site's homepage) so it's always traceable back
// to where it came from.
//
// Runs orgs sequentially against a wall-clock budget so one slow or
// unreachable site can't eat the whole run and take everyone else down
// with it — anything left over just gets picked up on the next scheduled
// run instead of failing the request.

import { createClient } from "@supabase/supabase-js";
import { extractInstituteDetails } from "./_instituteExtract.js";

const MAX_ORGS_PER_RUN = 25;
const TIME_BUDGET_MS = 50000; // headroom under a 60s function timeout

function normalizeTitle(t) {
  return (t || "").trim().toLowerCase().replace(/\s+/g, " ");
}

export default async function handler(req, res) {
  // Vercel Cron sends `Authorization: Bearer $CRON_SECRET` on every
  // scheduled invocation when a CRON_SECRET env var is configured — reject
  // anything else so this can't be triggered by just knowing the url. If
  // CRON_SECRET isn't set yet, this check is skipped (fail-open) so the
  // job still works out of the box; set CRON_SECRET in Vercel to lock it
  // down properly.
  if (process.env.CRON_SECRET) {
    const authHeader = req.headers.authorization || "";
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ error: "unauthorized" });
    }
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error("sync-institute-posts: missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
    return res.status(200).json({ ok: false, reason: "not configured" });
  }
  const supabase = createClient(supabaseUrl, serviceKey);

  const { data: orgs, error: orgsErr } = await supabase
    .from("organizations")
    .select("id, name, website, owner_id")
    .eq("org_type", "institute")
    .is("deleted_at", null)
    .not("website", "is", null)
    .limit(MAX_ORGS_PER_RUN);

  if (orgsErr) {
    console.error("sync-institute-posts: couldn't load organizations:", orgsErr.message);
    return res.status(200).json({ ok: false, reason: "couldn't load organizations" });
  }

  const startedAt = Date.now();
  let orgsProcessed = 0;
  let postsAdded = 0;
  const errors = [];

  for (const org of orgs || []) {
    if (Date.now() - startedAt > TIME_BUDGET_MS) break;
    if (!org.website) continue;

    orgsProcessed++;
    const extracted = await extractInstituteDetails(org.website);
    if (!extracted.ok) {
      errors.push({ org: org.name, reason: extracted.reason });
      continue;
    }
    if (!extracted.posts?.length) continue;

    const { data: existing, error: existingErr } = await supabase
      .from("org_updates")
      .select("title")
      .eq("org_id", org.id);
    if (existingErr) {
      errors.push({ org: org.name, reason: existingErr.message });
      continue;
    }
    const existingTitles = new Set((existing || []).map((u) => normalizeTitle(u.title)));

    const toInsert = extracted.posts
      .filter((p) => p.title && !existingTitles.has(normalizeTitle(p.title)))
      .map((p) => ({
        org_id: org.id,
        author_id: org.owner_id,
        title: p.title,
        description: p.description || null,
        source_url: p.url || extracted.website,
        status: "live",
        published_at: new Date().toISOString()
      }));

    if (toInsert.length) {
      const { error: insErr } = await supabase.from("org_updates").insert(toInsert);
      if (insErr) {
        errors.push({ org: org.name, reason: insErr.message });
      } else {
        postsAdded += toInsert.length;
      }
    }
  }

  return res.status(200).json({ ok: true, orgsProcessed, postsAdded, errors });
}
