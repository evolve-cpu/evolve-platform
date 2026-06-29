import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";

// Support both legacy and new JWT signing keys format
const SERVICE_ROLE_KEY = (() => {
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (legacy) return legacy;
  const newKeys = Deno.env.get("SUPABASE_SECRET_KEYS") ?? "";
  if (newKeys) {
    try {
      const parsed = JSON.parse(newKeys);
      return parsed?.service_role ?? parsed?.v1?.service_role ?? "";
    } catch { return ""; }
  }
  return "";
})();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DB_HEADERS = {
  "apikey": SERVICE_ROLE_KEY,
  "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
};

/* ── Supabase REST helpers ───────────────────────────────────────────────── */

async function dbUpdate(id: string, payload: Record<string, unknown>): Promise<void> {
  await fetch(
    `${SUPABASE_URL}/rest/v1/portfolio_reviews?id=eq.${id}`,
    {
      method: "PATCH",
      headers: { ...DB_HEADERS, "Prefer": "return=minimal" },
      body: JSON.stringify(payload),
    }
  );
}

async function dbFetch(id: string): Promise<Record<string, unknown> | null> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/portfolio_reviews?id=eq.${id}&select=*`,
    { headers: DB_HEADERS }
  );
  if (!res.ok) return null;
  const rows = await res.json();
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

/* ── Link scraper ────────────────────────────────────────────────────────── */

async function scrapeUrl(url: string): Promise<string> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; evolve-bot/1.0)" },
      signal: controller.signal,
    });
    clearTimeout(t);
    if (!res.ok) return "";
    const html = await res.text();
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 5000);
  } catch {
    clearTimeout(t);
    return "";
  }
}

/* ── Prompt builder ──────────────────────────────────────────────────────── */

function buildPrompt(review: Record<string, unknown>, portfolioContent: string): string {
  return `You are an expert portfolio reviewer at evolve, a design education platform in India. You review design student portfolios and provide honest, constructive, specific feedback.

STUDENT SUBMISSION:
Name: ${review.name}
Target Roles: ${review.target_roles}
Proud Project: ${review.proud_project}
Notes: ${review.notes || "none"}
Portfolio URL: ${review.portfolio_link || "not provided (file uploaded)"}
${portfolioContent ? `\nPORTFOLIO CONTENT (scraped):\n${portfolioContent}\n` : ""}

Generate a portfolio review. Write in lowercase, direct and honest — no fluff. Be specific to their actual submission.

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):

{
  "student": {
    "name": "their full name",
    "tagline": "1-line role description from their target roles",
    "tags": ["skill1", "skill2", "skill3"]
  },
  "metrics": {
    "first_impression": { "label": "one word (e.g. developing, strong, surface-level)", "description": "max 8 words" },
    "project_depth": { "label": "one word", "description": "max 8 words" },
    "stack_breadth": { "label": "one word", "description": "max 8 words" },
    "direction_clarity": { "label": "one word", "description": "max 8 words" }
  },
  "where_you_are": {
    "stage": "one sentence on their career stage",
    "strength": "one sentence on their key strength",
    "role_fit": "specific roles they fit now",
    "summary": "2-3 sentences on their portfolio state, specific to their work"
  },
  "working_well": [
    { "title": "short lowercase title", "description": "2-3 sentences specific to their projects" },
    { "title": "short lowercase title", "description": "2-3 sentences specific to their projects" },
    { "title": "short lowercase title", "description": "2-3 sentences specific to their projects" }
  ],
  "holding_back": {
    "portfolio_gaps": ["gap as full sentence", "gap as full sentence", "gap as full sentence"],
    "thinking_gaps": ["gap as full sentence", "gap as full sentence"],
    "positioning_gaps": ["gap as full sentence", "gap as full sentence"]
  },
  "focus_next": [
    { "number": "01", "action": "specific advice 2-3 sentences", "timing": "now" },
    { "number": "02", "action": "specific advice 2-3 sentences", "timing": "now" },
    { "number": "03", "action": "specific advice 2-3 sentences", "timing": "soon" },
    { "number": "04", "action": "specific advice 2-3 sentences", "timing": "soon" }
  ],
  "what_this_means": "2-3 sentences on where they need to grow",
  "where_to_go": "2-3 sentences of closing direction and encouragement"
}`;
}

/* ── Main handler ────────────────────────────────────────────────────────── */

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let review_id = "";

  try {
    const body = await req.json();
    review_id = body.review_id ?? "";

    if (!review_id) {
      return new Response(
        JSON.stringify({ error: "review_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark generating
    await dbUpdate(review_id, { ai_report_status: "generating", ai_report_error: null });

    // Fetch review row
    const review = await dbFetch(review_id);
    if (!review) {
      await dbUpdate(review_id, { ai_report_status: "failed", ai_report_error: "Review row not found" });
      return new Response(
        JSON.stringify({ error: "Review not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Scrape portfolio link if present
    const portfolioContent = review.portfolio_link
      ? await scrapeUrl(review.portfolio_link as string)
      : "";

    const prompt = buildPrompt(review, portfolioContent);

    // Call Gemini 1.5 Flash
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.65, maxOutputTokens: 3000 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      await dbUpdate(review_id, {
        ai_report_status: "failed",
        ai_report_error: `Gemini ${geminiRes.status}: ${errText.slice(0, 400)}`,
      });
      return new Response(
        JSON.stringify({ error: "Gemini API error", status: geminiRes.status, details: errText.slice(0, 400) }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiData = await geminiRes.json();
    const rawText: string = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (!rawText) {
      await dbUpdate(review_id, { ai_report_status: "failed", ai_report_error: "Empty response from Gemini" });
      return new Response(
        JSON.stringify({ error: "Empty Gemini response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Strip any accidental markdown fences
    const cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let aiReport: Record<string, unknown>;
    try {
      aiReport = JSON.parse(cleaned);
    } catch {
      // Try to extract the JSON object
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (!match) {
        await dbUpdate(review_id, {
          ai_report_status: "failed",
          ai_report_error: `JSON parse failed. Raw: ${cleaned.slice(0, 200)}`,
        });
        return new Response(
          JSON.stringify({ error: "JSON parse failed", raw: cleaned.slice(0, 300) }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      aiReport = JSON.parse(match[0]);
    }

    aiReport.generated_at = new Date().toISOString();
    aiReport.version = 1;
    aiReport.portfolio_scraped = portfolioContent.length > 0;

    await dbUpdate(review_id, {
      ai_report: aiReport,
      ai_report_status: "ready",
      ai_report_error: null,
    });

    return new Response(
      JSON.stringify({ success: true, review_id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    const msg = (err as Error).message ?? "unknown error";
    if (review_id) {
      await dbUpdate(review_id, { ai_report_status: "failed", ai_report_error: msg.slice(0, 400) }).catch(() => {});
    }
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
