import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function scrapeUrl(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; evolve-portfolio-bot/1.0)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return "";
    const html = await res.text();
    // Strip scripts, styles, then all tags; collapse whitespace
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return text.slice(0, 6000);
  } catch {
    return "";
  }
}

function buildPrompt(review: Record<string, unknown>, portfolioContent: string): string {
  return `You are an expert portfolio reviewer at evolve, a design education platform in India. You review design and tech student portfolios and provide honest, constructive, specific feedback.

Review the following portfolio submission and generate a comprehensive review report.

STUDENT INFORMATION:
Name: ${review.name}
Target Roles: ${review.target_roles}
Proud Project: ${review.proud_project}
Notes: ${review.notes || "none"}
Portfolio URL: ${review.portfolio_link || "not provided (file uploaded)"}
${portfolioContent ? `
PORTFOLIO CONTENT (scraped from their link):
${portfolioContent}
` : ""}

Generate a portfolio review in this exact JSON format. Write in lowercase, like the evolve brand voice — direct, honest, without fluff. Be specific to what they shared. Do NOT be generic. Avoid placeholder phrases. Every sentence should be grounded in their actual submission.

{
  "student": {
    "name": "their full name",
    "tagline": "1-line role description based on their target roles (e.g. aspiring UI/UX designer · product and interaction)",
    "tags": ["tag1", "tag2", "tag3"]
  },
  "metrics": {
    "first_impression": {
      "label": "one word assessment (e.g. developing, strong, promising, surface-level, early)",
      "description": "short phrase, max 8 words"
    },
    "project_depth": {
      "label": "one word",
      "description": "short phrase, max 8 words"
    },
    "stack_breadth": {
      "label": "one word",
      "description": "short phrase, max 8 words"
    },
    "direction_clarity": {
      "label": "one word",
      "description": "short phrase, max 8 words"
    }
  },
  "where_you_are": {
    "stage": "one sentence describing where they are in their career journey",
    "strength": "one sentence on their key strength from their submission",
    "role_fit": "specific roles they would fit into right now",
    "summary": "2-3 sentences summarising their current portfolio state, specific to their actual work"
  },
  "working_well": [
    {
      "title": "short lowercase title",
      "description": "2-3 sentences, specific to their projects or experience"
    },
    {
      "title": "short lowercase title",
      "description": "2-3 sentences, specific to their projects or experience"
    },
    {
      "title": "short lowercase title",
      "description": "2-3 sentences, specific to their projects or experience"
    }
  ],
  "holding_back": {
    "portfolio_gaps": [
      "specific gap as a full sentence",
      "specific gap as a full sentence",
      "specific gap as a full sentence"
    ],
    "thinking_gaps": [
      "specific gap as a full sentence",
      "specific gap as a full sentence"
    ],
    "positioning_gaps": [
      "specific gap as a full sentence",
      "specific gap as a full sentence"
    ]
  },
  "focus_next": [
    {
      "number": "01",
      "action": "specific actionable advice in 2-3 sentences",
      "timing": "now"
    },
    {
      "number": "02",
      "action": "specific actionable advice in 2-3 sentences",
      "timing": "now"
    },
    {
      "number": "03",
      "action": "specific actionable advice in 2-3 sentences",
      "timing": "soon"
    },
    {
      "number": "04",
      "action": "specific actionable advice in 2-3 sentences",
      "timing": "soon"
    }
  ],
  "what_this_means": "2-3 sentences summarising the core insight about where they need to grow",
  "where_to_go": "2-3 sentences of closing direction and encouragement, specific to this person"
}

Return ONLY valid JSON. No markdown code fences, no explanation text, nothing before or after the JSON object.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { review_id } = await req.json();
    if (!review_id) {
      return new Response(
        JSON.stringify({ error: "review_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Mark as generating immediately
    await supabase
      .from("portfolio_reviews")
      .update({ ai_report_status: "generating", ai_report_error: null })
      .eq("id", review_id);

    // Fetch the review row
    const { data: review, error: fetchErr } = await supabase
      .from("portfolio_reviews")
      .select("*")
      .eq("id", review_id)
      .single();

    if (fetchErr || !review) {
      await supabase
        .from("portfolio_reviews")
        .update({ ai_report_status: "failed", ai_report_error: "Review not found" })
        .eq("id", review_id);
      return new Response(
        JSON.stringify({ error: "Review not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Scrape portfolio link if present
    let portfolioContent = "";
    if (review.portfolio_link) {
      portfolioContent = await scrapeUrl(review.portfolio_link);
    }

    const prompt = buildPrompt(review, portfolioContent);

    // Call Gemini 2.0 Flash
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.65,
            maxOutputTokens: 3000,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      await supabase
        .from("portfolio_reviews")
        .update({ ai_report_status: "failed", ai_report_error: `Gemini error: ${errText.slice(0, 500)}` })
        .eq("id", review_id);
      return new Response(
        JSON.stringify({ error: "Gemini API error", details: errText.slice(0, 500) }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiData = await geminiRes.json();
    const rawText: string = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Parse the JSON — strip any accidental code fences
    const cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let aiReport: Record<string, unknown>;
    try {
      aiReport = JSON.parse(cleaned);
    } catch {
      // Last attempt: find first { ... }
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (!match) {
        await supabase
          .from("portfolio_reviews")
          .update({ ai_report_status: "failed", ai_report_error: "Could not parse JSON from Gemini response" })
          .eq("id", review_id);
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

    await supabase
      .from("portfolio_reviews")
      .update({ ai_report: aiReport, ai_report_status: "ready", ai_report_error: null })
      .eq("id", review_id);

    return new Response(
      JSON.stringify({ success: true, review_id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
