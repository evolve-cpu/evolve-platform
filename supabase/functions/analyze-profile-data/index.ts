import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";

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

const MAX_IMAGES = 6;
const MAX_TEXT_CHARS = 20000;

/* ── Supabase REST helpers ───────────────────────────────────────────────── */

async function dbUpdate(userId: string, payload: Record<string, unknown>): Promise<void> {
  await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
    method: "PATCH",
    headers: { ...DB_HEADERS, "Prefer": "return=minimal" },
    body: JSON.stringify(payload),
  });
}

async function dbFetchExtracted(userId: string): Promise<Record<string, unknown> | null> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=extracted_profile`,
    { headers: DB_HEADERS }
  );
  if (!res.ok) return null;
  const rows = await res.json();
  return Array.isArray(rows) && rows.length > 0 ? rows[0]?.extracted_profile ?? null : null;
}

/* ── Gather raw text + screenshots already captured by extract-profile-data ── */

function buildRawText(extracted: Record<string, any>): string {
  const parts: string[] = [];
  for (const p of extracted?.portfolio?.pages ?? []) {
    if (p.text) parts.push(`--- Portfolio page: ${p.url} ---\n${p.text}`);
  }
  if (extracted?.portfolio?.note) parts.push(`Portfolio note: ${extracted.portfolio.note}`);
  if (extracted?.resume?.text) parts.push(`--- Resume ---\n${extracted.resume.text}`);
  if (extracted?.resume?.note) parts.push(`Resume note: ${extracted.resume.note}`);
  return parts.join("\n\n").slice(0, MAX_TEXT_CHARS);
}

function collectScreenshotUrls(extracted: Record<string, any>): string[] {
  const urls: string[] = [];
  for (const p of extracted?.portfolio?.pages ?? []) {
    for (const u of p.screenshot_urls ?? []) urls.push(u);
  }
  return urls.slice(0, MAX_IMAGES);
}

async function imageToInlineData(url: string): Promise<{ mimeType: string; data: string } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") || "image/png";
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return { mimeType: contentType, data: btoa(binary) };
  } catch {
    return null;
  }
}

/* ── The rubric — same framework as the parameter spec, so each field's
   "Logic" column becomes both a schema-level description (guides the shape
   of the answer) and part of the system framing (guides the reasoning). ─── */

const SYSTEM_PROMPT = `You are a senior design leader at Evolve — the kind of reviewer who has hired, mentored, and reviewed hundreds of designer portfolios — forming a structured, honest read of where this designer actually stands. This is an internal analysis, not feedback written for the candidate to read: your job is to reach an accurate judgment from the evidence, not to be encouraging or diplomatic.

Work in two disciplined passes:

1. FACTS FIRST. Before judging anything, privately inventory what's actually true and checkable: how many case studies, whether each states a problem / shows research or user insight / shows the solution / states a result / includes a reflection, whether any stated result is a specific number vs a vague description vs missing, how many industries/domains the work covers, whether about/contact/resume/LinkedIn links actually work, whether the portfolio and resume agree with each other (same title, same key projects, no identically copy-pasted text, consistent dates), total years of experience and any unexplained gaps, whether case studies name real clients vs are purely self-initiated/academic, and which tools are actually evidenced in the text (not just shown as a logo grid). No adjectives at this stage — just what's there.

2. JUDGMENT, disciplined and traceable. Every opinion you state — every strength, every gap, every rating — must be able to answer "how do you know that?" with a specific fact: a count, a yes/no, a quoted phrase, a named project. If you can't point to one, soften the language or drop the claim rather than stating it as settled. Never state a general impression ("good visual sense", "strong communicator") as a finding — always name the project or fact behind it.

Follow this exact reasoning order for the judgment fields:
- Step 1 (stage): Place the designer by stage using resume facts — years, titles, employment history. This changes what counts as a real gap: an early-stage gap is almost always a missing fundamental (problem framing, process); a senior gap is almost never that — it's usually about whether the portfolio makes the case for leadership, strategy, or scope. Judging a senior person on junior criteria, or a junior person on senior criteria, is the single easiest way to get this wrong.
- Step 2 (strengths): Find genuine strengths. Each must point to a specific project, decision, or fact — never a general impression.
- Step 3 (gaps): Find gaps, sorted into three areas — portfolio/case-study execution, thinking/process depth, and positioning/narrative. Diagnose what's wrong; do not propose fixes. Calibrate every gap to the stage from Step 1. Leave a category's array empty if there is genuinely nothing to flag there — don't invent a gap to fill it.
- Step 4 (dimension_ratings): Rate 3-4 dimensions that are actually the real question for THIS person, not a fixed list applied identically to everyone — pick whichever framing fits their stage (e.g. first impression, depth of thinking/process or case-study depth for someone senior, how well it's presented/curated, clarity of positioning or how senior it reads).
- Step 5 (key_gap): Before naming the single most important issue, state plainly what's already solid. Then isolate the ONE underlying problem actually holding this person back the most — never an equal-weight list of every issue found.

Ground every field in the actual evidence you were given (portfolio text, resume text, screenshots). Where the evidence is genuinely absent, say so plainly using the exact fallback language specified per field below — never guess or invent specifics like names, companies, or numbers that are not present in the material.

Write every "key_points"/"evidence" field as short, scannable fragments citing the specific thing you saw (a phrase, a project name, a metric) — not a generic restatement of the category.`;

const EVIDENCE_ITEM = {
  type: "OBJECT",
  properties: {
    finding: { type: "STRING", description: "The finding, stated plainly — one sentence." },
    evidence: { type: "STRING", description: "The specific fact/project/quote that backs it up." },
  },
  required: ["finding", "evidence"],
};

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    stage: {
      type: "OBJECT",
      description: "Step 1 — place the designer by career stage from resume facts (years, titles, history) before judging anything else, since what counts as a real gap changes completely by stage.",
      properties: {
        level: { type: "STRING", enum: ["Early", "Developing", "Mid-level", "Senior"] },
        reasoning: { type: "STRING", description: "One short sentence citing the specific fact (years, title, history) that places them at this stage." },
      },
      required: ["level", "reasoning"],
    },
    role: {
      type: "OBJECT",
      description: "Scan the headline, bio/about section, and every case-study title/subtitle for role-indicating language. Match against a fixed role taxonomy (UX/UI, Interaction Design, Visual Communication, Industrial Design, Architecture, Interior Design, Space Design, Moving Images, User Experience Design, etc). Pick the role repeated most often; if evenly split, report primary and secondary.",
      properties: {
        primary: { type: "STRING" },
        secondary: { type: "STRING", nullable: true },
      },
      required: ["primary"],
    },
    niche: {
      type: "STRING",
      description: "Within the identified role, a sub-specialization that recurs across 2+ projects or is explicitly self-described (e.g. Research, Motion Design). If no recurring niche, output 'Not specified'.",
    },
    domain: {
      type: "STRING",
      description: "Named industries/sectors of past work (e.g. Healthcare, Fintech, EdTech) aggregated across all case studies. Report the dominant domain(s), or 'Cross-domain' if none dominates.",
    },
    sector: {
      type: "STRING",
      description: "B2B / B2C / B2B2C / D2C, inferred from who the end-user is in each case study. Report the dominant pattern across the portfolio.",
    },
    work_experience: {
      type: "STRING",
      description: "Sum professional duration from the resume/experience section; if absent, infer from earliest dated project or explicit claims. Bucket into: Starting, <1, 1-2, 2-5, 5-10, 10-15, 15+, over 20.",
    },
    type_of_work_wanted: {
      type: "STRING",
      description: "Explicit 'target roles' / 'open to' language if present; otherwise infer from which project types are most recent, prominent, or polished.",
    },
    team_work_proficiency: {
      type: "OBJECT",
      description: "Scan case-study process sections for collaboration language ('worked closely with', 'led a team of X', 'solo project', 'cross-functional'). Tag each project Solo/Collaborative/Leadership.",
      properties: {
        mode: { type: "STRING", enum: ["Solo", "Collaborative", "Leadership", "Mixed"] },
        key_points: { type: "ARRAY", items: { type: "STRING" }, description: "1-3 short fragments citing the specific language/project found." },
      },
      required: ["mode", "key_points"],
    },
    understanding_of_business: {
      type: "OBJECT",
      description: "Whether case studies frame the problem in business terms (goals, KPIs, ROI) vs purely visual/UI framing.",
      properties: {
        score: { type: "STRING", enum: ["Strong", "Partial", "Absent"] },
        key_points: { type: "ARRAY", items: { type: "STRING" } },
      },
      required: ["score", "key_points"],
    },
    foundational_clarity: {
      type: "OBJECT",
      description: "Whether each case study follows a legible problem → process → solution structure with visible reasoning, not just polished screens.",
      properties: {
        score: { type: "STRING", enum: ["High", "Medium", "Low"] },
        key_points: { type: "ARRAY", items: { type: "STRING" } },
      },
      required: ["score", "key_points"],
    },
    learning: {
      type: "OBJECT",
      description: "Evidence of active skill development: courses/certifications, a learning-focused case study, workshops, or visible skill progression across dated work.",
      properties: {
        present: { type: "BOOLEAN" },
        key_points: { type: "ARRAY", items: { type: "STRING" } },
      },
      required: ["present", "key_points"],
    },
    contributing_back: {
      type: "OBJECT",
      description: "Community involvement: writing, mentoring, speaking, open-source, teaching.",
      properties: {
        present: { type: "BOOLEAN" },
        types: { type: "ARRAY", items: { type: "STRING" } },
      },
      required: ["present", "types"],
    },
    tool_proficiency: {
      type: "ARRAY",
      description: "Tools with actual textual evidence in project descriptions (e.g. 'prototyped in Figma') — not just a logo grid.",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          emphasis: {
            type: "INTEGER",
            description: "How central this tool is to their process, based on textual evidence: 3 = repeated across multiple projects/central to their workflow, 2 = used and mentioned meaningfully, 1 = mentioned once or lightly.",
          },
        },
        required: ["name", "emphasis"],
      },
    },
    ai_proficiency: {
      type: "OBJECT",
      description: "AI tools/workflow mentions (Midjourney, ChatGPT, Figma AI, prompt engineering, AI-assisted synthesis).",
      properties: {
        present: { type: "BOOLEAN" },
        mode: { type: "STRING", enum: ["generative", "analytical", "both", "none"] },
        tools: { type: "ARRAY", items: { type: "STRING" } },
      },
      required: ["present", "mode", "tools"],
    },
    real_work_validation: {
      type: "OBJECT",
      description: "Ratio of projects tied to named, verifiable clients/companies vs unlabeled personal/speculative projects.",
      properties: {
        validated_count: { type: "INTEGER" },
        unvalidated_count: { type: "INTEGER" },
        key_points: { type: "ARRAY", items: { type: "STRING" }, description: "Name the actual client/company names found, if any." },
      },
      required: ["validated_count", "unvalidated_count", "key_points"],
    },
    career_switching: {
      type: "OBJECT",
      description: "A prior, unrelated career mentioned in the bio ('previously worked in...', 'self-taught', 'transitioned from...').",
      properties: {
        detected: { type: "BOOLEAN" },
        journey: {
          type: "ARRAY",
          items: { type: "STRING" },
          description: "2-3 short stage labels in order, e.g. ['Marketing, 4 yrs', 'Self-taught UX, 2023', 'Product Designer']. Empty array if not detected.",
        },
      },
      required: ["detected", "journey"],
    },
    location: {
      type: "STRING",
      description: "From resume header, contact section, or about page. 'Not specified' if not explicitly stated — never guess from language/timezone cues.",
    },
    work_preference: {
      type: "STRING",
      description: "Stated preference language ('open to remote', 'based in X, open to relocate'). 'Not specified' if absent.",
    },
    salary_expectations: {
      type: "STRING",
      description: "Always output exactly: 'Not extractable from portfolio — requires direct input'. Never attempt to infer this.",
    },
    current_status: {
      type: "STRING",
      description: "Explicit status language ('currently at X', 'open to work', 'on notice period'). 'Not specified' if absent.",
    },
    summary: {
      type: "STRING",
      description: "3-4 sentences, written the way a senior design hiring lead would summarize this candidate to a hiring committee — direct, specific to the evidence, no generic praise.",
    },
    recruiter_highlights: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "3-5 short, specific, scannable bullets (5-12 words each) written for a recruiter skimming this profile in under a minute — the concrete reasons to shortlist this candidate. Cite specifics (a real project, a named client, a metric, a tool), never generic praise like 'strong communicator' or 'great eye for detail'. If the evidence is thin, say so plainly rather than padding — e.g. 'Limited portfolio depth — only 1 case study available'.",
    },
    strengths: {
      type: "ARRAY",
      description: "Step 2 — genuine strengths. Each must point to a specific project, decision, or fact — never a general impression.",
      items: EVIDENCE_ITEM,
    },
    gaps: {
      type: "OBJECT",
      description: "Step 3 — real gaps sorted into three areas, calibrated to the stage above. Diagnose only, don't propose fixes. Leave an array empty if that area genuinely has nothing to flag — don't invent a gap to fill it.",
      properties: {
        portfolio_execution: { type: "ARRAY", items: EVIDENCE_ITEM, description: "Problems with the portfolio/case studies themselves — execution, completeness, presentation." },
        thinking_process: { type: "ARRAY", items: EVIDENCE_ITEM, description: "Problems with the thinking or process behind the work — reasoning, problem-framing, depth." },
        positioning: { type: "ARRAY", items: EVIDENCE_ITEM, description: "Problems with how the person is positioning themselves — unclear direction/target role, narrative doesn't match the work." },
      },
      required: ["portfolio_execution", "thinking_process", "positioning"],
    },
    dimension_ratings: {
      type: "ARRAY",
      description: "Step 4 — rate 3-4 dimensions that are actually the real question for THIS person, not a fixed list applied identically to everyone. Typical: first impression, depth of thinking/process (or case study depth if senior), presentation/curation, clarity of positioning (or how senior it reads, if senior).",
      items: {
        type: "OBJECT",
        properties: {
          dimension: { type: "STRING" },
          score: { type: "STRING", enum: ["Strong", "Good", "Partial", "Developing", "Unclear", "Weak"] },
          evidence: { type: "STRING" },
        },
        required: ["dimension", "score", "evidence"],
      },
    },
    key_gap: {
      type: "OBJECT",
      description: "Step 5 — the one gap that matters most. First state plainly what's already solid, then isolate the single underlying issue actually holding this person back the most — never an equal-weight list of every issue found.",
      properties: {
        whats_solid: { type: "STRING", description: "1-2 sentences on what's already genuinely solid, before naming the issue." },
        issue: { type: "STRING", description: "The one underlying problem, stated plainly in 1 sentence." },
        evidence: { type: "STRING", description: "The specific fact that backs this up." },
      },
      required: ["whats_solid", "issue", "evidence"],
    },
  },
  required: [
    "stage", "role", "niche", "domain", "sector", "work_experience", "type_of_work_wanted",
    "team_work_proficiency", "understanding_of_business", "foundational_clarity",
    "learning", "contributing_back", "tool_proficiency", "ai_proficiency",
    "real_work_validation", "career_switching", "location", "work_preference",
    "salary_expectations", "current_status", "summary", "recruiter_highlights",
    "strengths", "gaps", "dimension_ratings", "key_gap",
  ],
};

/* ── Main handler ────────────────────────────────────────────────────────── */

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let user_id = "";

  try {
    const body = await req.json();
    user_id = body.user_id ?? "";

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "user_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await dbUpdate(user_id, { ai_profile_status: "pending" });

    const extracted = await dbFetchExtracted(user_id);
    if (!extracted) {
      await dbUpdate(user_id, { ai_profile_status: "failed" });
      return new Response(
        JSON.stringify({ error: "No extracted_profile found — run extract-profile-data first" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rawText = buildRawText(extracted);
    if (!rawText.trim()) {
      await dbUpdate(user_id, { ai_profile_status: "failed" });
      return new Response(
        JSON.stringify({ error: "extracted_profile has no usable text to analyze" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const screenshotUrls = collectScreenshotUrls(extracted);
    const images = (await Promise.all(screenshotUrls.map(imageToInlineData))).filter(Boolean) as Array<{ mimeType: string; data: string }>;

    const parts: unknown[] = [
      { text: `PORTFOLIO & RESUME CONTENT:\n\n${rawText}` },
      ...images.map((img) => ({ inlineData: img })),
      { text: "Analyze the above (text and any attached screenshots) and return the structured profile now." },
    ];

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 7000,
            responseMimeType: "application/json",
            responseSchema: RESPONSE_SCHEMA,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      await dbUpdate(user_id, { ai_profile_status: "failed" });
      return new Response(
        JSON.stringify({ error: "Gemini API error", status: geminiRes.status, details: errText.slice(0, 500) }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiData = await geminiRes.json();
    const rawOut: string = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    if (!rawOut) {
      await dbUpdate(user_id, { ai_profile_status: "failed" });
      return new Response(
        JSON.stringify({ error: "Empty response from Gemini", raw: JSON.stringify(geminiData).slice(0, 400) }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let profile: Record<string, unknown>;
    try {
      profile = JSON.parse(rawOut);
    } catch {
      await dbUpdate(user_id, { ai_profile_status: "failed" });
      return new Response(
        JSON.stringify({ error: "JSON parse failed", raw: rawOut.slice(0, 400) }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    profile.generated_at = new Date().toISOString();
    profile.images_analyzed = images.length;

    await dbUpdate(user_id, {
      ai_profile: profile,
      ai_profile_status: "done",
      ai_profile_updated_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ success: true, ai_profile: profile }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    const msg = (err as Error).message ?? "unknown error";
    if (user_id) {
      await dbUpdate(user_id, { ai_profile_status: "failed" }).catch(() => {});
    }
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
