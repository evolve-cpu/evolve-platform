// One-time batch job: pre-generate AI profiles (profiles.ai_profile) for the
// ~111 users already captured in `portfolio_reviews` (the legacy portfolio
// review submissions), so their profile is instantly available on next
// login instead of being generated on demand during onboarding.
//
// Also useful to eyeball how close the AI-generated profile lands to the
// existing human review (ai_report / notes) for the same user — see the
// results log it writes to scripts/output/.
//
// Notes on the source data (see AskUserQuestion decisions this was built from):
// - `portfolio_reviews` has no dedicated "reviewed" status column, so every
//   row is treated as in-scope.
// - It also has no resume column. portfolio_link/portfolio_file_url are fed
//   in as portfolio only — never guessed as a resume, even where a filename
//   looks like one.
// - Some rows have user_id = null (submitter wasn't a linked account at
//   submission time); those are resolved by matching profiles.email instead.
//
// Usage:
//   node scripts/pregenerate-ai-profiles.mjs [--dry-run] [--force] [--limit=N] [--delay=ms]
//
// --dry-run  list who would be processed, make no writes / no AI calls
// --force    reprocess users whose ai_profile_status is already "done"
// --limit=N  only process the first N eligible users (for a test run)
// --delay=ms pause between users, default 3000 (be gentle on the scrape/Gemini step)

import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadEnvFile(fileURLToPath(new URL("../.env", import.meta.url)));

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const FORCE = args.includes("--force");
const LIMIT = Number(args.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? Infinity);
const DELAY_MS = Number(args.find((a) => a.startsWith("--delay="))?.split("=")[1] ?? 3000);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !ANON_KEY) {
  console.error("Missing VITE_SUPABASE_URL / VITE_SUPABASE_SERVICE_ROLE_KEY / VITE_SUPABASE_ANON_KEY in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function callEdgeFunctionOnce(name, user_id) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ANON_KEY}`,
      apikey: ANON_KEY,
    },
    body: JSON.stringify({ user_id }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = [json?.error, json?.status, json?.details].filter(Boolean).join(" | ");
    const err = new Error(detail || `${name} failed with HTTP ${res.status}`);
    err.httpStatus = res.status;
    throw err;
  }
  return json;
}

// Gemini regularly returns transient 503 UNAVAILABLE under load — worth a
// couple of retries. A 4xx (bad data, e.g. no extractable text) never is.
async function callEdgeFunction(name, user_id, { retries = 2, backoffMs = 8000 } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await callEdgeFunctionOnce(name, user_id);
    } catch (err) {
      const retryable = err.httpStatus >= 500;
      if (!retryable || attempt >= retries) throw err;
      console.log(`  transient error (${err.message.slice(0, 60)}...), retrying in ${backoffMs}ms`);
      await sleep(backoffMs);
    }
  }
}

async function main() {
  console.log(`Pre-generate AI profiles — ${DRY_RUN ? "DRY RUN" : "LIVE"}${FORCE ? " (force reprocess)" : ""}`);

  const { data: submissions, error: submissionsErr } = await supabase
    .from("portfolio_reviews")
    .select("id, user_id, name, email, portfolio_link, portfolio_file_url, notes, ai_report_status");

  if (submissionsErr) {
    console.error("Failed to load portfolio_reviews:", submissionsErr.message);
    process.exit(1);
  }

  console.log(`Found ${submissions.length} portfolio_reviews submissions.`);

  // Resolve user_id for every submission first (bulk), instead of one
  // network round trip per row inside the main loop — 111 unthrottled
  // sequential lookups was hitting transient errors that got misreported
  // as "no matching profiles row" for otherwise-real rows.
  const emailToId = new Map();
  for (const sub of submissions) {
    if (sub.user_id || !sub.email) continue;
    const { data, error } = await supabase.from("profiles").select("id").ilike("email", sub.email).maybeSingle();
    if (error) console.log(`  email lookup failed for ${sub.email}: ${error.message}`);
    if (data?.id) emailToId.set(sub.email, data.id);
    await sleep(300);
  }

  const resolvedUserIds = [
    ...new Set(
      submissions.map((sub) => sub.user_id || emailToId.get(sub.email)).filter(Boolean)
    ),
  ];

  const profileById = new Map();
  for (let i = 0; i < resolvedUserIds.length; i += 100) {
    const chunk = resolvedUserIds.slice(i, i + 100);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, portfolio_link, portfolio_file_url, resume_link, resume_file_url, ai_profile_status")
      .in("id", chunk);
    if (error) {
      console.error("Failed to bulk-fetch profiles:", error.message);
      process.exit(1);
    }
    for (const p of data) profileById.set(p.id, p);
  }
  console.log(`Resolved ${resolvedUserIds.length} linked user ids, fetched ${profileById.size} matching profiles rows.`);

  const results = [];
  let processed = 0;

  for (const sub of submissions) {
    if (processed >= LIMIT) break;

    const userId = sub.user_id || emailToId.get(sub.email) || null;

    if (!userId) {
      results.push({ submission_id: sub.id, email: sub.email, status: "skipped", reason: "no linked profiles account (not found by user_id or email)" });
      continue;
    }

    const profile = profileById.get(userId);

    if (!profile) {
      results.push({ submission_id: sub.id, user_id: userId, email: sub.email, status: "skipped", reason: "no matching profiles row" });
      continue;
    }

    if (!FORCE && profile.ai_profile_status === "done") {
      results.push({ submission_id: sub.id, user_id: userId, email: sub.email, status: "skipped", reason: "ai_profile already done" });
      continue;
    }

    // Portfolio only — portfolio_reviews has no resume field, and we never
    // guess a portfolio_file_url is actually a resume even if it looks like one.
    const patch = {};
    if (!profile.portfolio_link && !profile.portfolio_file_url) {
      if (sub.portfolio_link) patch.portfolio_link = sub.portfolio_link;
      else if (sub.portfolio_file_url) patch.portfolio_file_url = sub.portfolio_file_url;
    }

    const hasPortfolio = profile.portfolio_link || profile.portfolio_file_url || patch.portfolio_link || patch.portfolio_file_url;
    const hasResume = profile.resume_link || profile.resume_file_url;

    if (!hasPortfolio && !hasResume) {
      results.push({ submission_id: sub.id, user_id: userId, email: sub.email, status: "skipped", reason: "no portfolio/resume value in submission or profile" });
      continue;
    }

    processed += 1;

    if (DRY_RUN) {
      console.log(`[dry-run] would process ${sub.email || userId} — patch: ${JSON.stringify(patch)}`);
      results.push({ submission_id: sub.id, user_id: userId, email: sub.email, status: "would_process", patch });
      continue;
    }

    console.log(`Processing ${sub.email || userId} (${processed}/${Math.min(LIMIT, submissions.length)})...`);

    try {
      if (Object.keys(patch).length > 0) {
        const { error: patchErr } = await supabase.from("profiles").update(patch).eq("id", userId);
        if (patchErr) throw new Error(`profiles patch failed: ${patchErr.message}`);
      }

      await callEdgeFunction("extract-profile-data", userId);
      const analyzed = await callEdgeFunction("analyze-profile-data", userId);

      results.push({
        submission_id: sub.id,
        user_id: userId,
        email: sub.email,
        status: "done",
        existing_ai_report_status: sub.ai_report_status,
        existing_review_notes: sub.notes,
        ai_profile_summary: analyzed?.ai_profile?.summary ?? null,
        ai_profile_name: analyzed?.ai_profile?.name ?? null,
      });
      console.log(`  done.`);
    } catch (err) {
      results.push({ submission_id: sub.id, user_id: userId, email: sub.email, status: "failed", error: err.message });
      console.log(`  failed: ${err.message}`);
    }

    await sleep(DELAY_MS);
  }

  const outDir = fileURLToPath(new URL("./output/", import.meta.url));
  mkdirSync(outDir, { recursive: true });
  const logPath = fileURLToPath(new URL(`./output/pregenerate-results-${Date.now()}.json`, import.meta.url));
  writeFileSync(logPath, JSON.stringify(results, null, 2));

  const counts = results.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});
  console.log("\nSummary:", counts);
  console.log(`Full results (incl. existing review notes next to each ai_profile summary, for comparison): ${logPath}`);
}

main();
