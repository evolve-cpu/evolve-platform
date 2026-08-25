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

type ExtractedProfile = {
  portfolio?: {
    pages?: Array<{
      text?: string;
      url?: string;
      screenshot_urls?: string[];
    }>;
    note?: string;
  };
  resume?: {
    source_url?: string;
    text?: string;
    note?: string;
  };
};

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

function buildRawText(extracted: ExtractedProfile): string {
  const parts: string[] = [];
  for (const p of extracted?.portfolio?.pages ?? []) {
    if (p.text) parts.push(`--- Portfolio page: ${p.url} ---\n${p.text}`);
  }
  if (extracted?.portfolio?.note) parts.push(`Portfolio note: ${extracted.portfolio.note}`);
  if (extracted?.resume?.text) parts.push(`--- Resume ---\n${extracted.resume.text}`);
  if (extracted?.resume?.note) parts.push(`Resume note: ${extracted.resume.note}`);
  return parts.join("\n\n").slice(0, MAX_TEXT_CHARS);
}

function collectScreenshotUrls(extracted: ExtractedProfile): string[] {
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

const SYSTEM_PROMPT = `You are a senior design leader at Evolve, building this designer's PROFILE — not writing a review of their portfolio, and not writing anyone's opinion of them. Nobody reading your output should come away needing to open the original portfolio/resume to check your work; the whole point is that they never have to. A review is a document of someone's opinions about another document — readers who hit an opinion instinctively want to go verify it against the source, which defeats the entire purpose. A profile is different in kind: it states, as data, who this person is and what they can do — the same way a recruiter's own mental model of a strong candidate is a set of tags, scores, and a clear read, not a paragraph of critique to be fact-checked. You have hired, mentored, and reviewed hundreds of designer portfolios, and you're using that judgment here for exactly one purpose: to convert dense, one-off portfolio prose into compact, structured, decisive signal — skill tags, trait scores, a strong-zones/growth-zones map — that stands on its own forever, independent of the portfolio that produced it and never phrased as "this reviewer thinks." This is internal analysis, not feedback written for the candidate to read: reach an accurate read from the evidence, don't be encouraging or diplomatic — but nothing you output should read as a critique, a take, or something-to-verify. It should read as fact about the candidate.

The single biggest failure mode to avoid: a dense sentence that quietly encodes several distinct facts, left as one sentence instead of being pulled apart into structured fields. Example — "logo design showcases focus on visual deliverables without showing research or design iterations" is not one finding, it's at least three: (1) this person does logo design — a skill nobody had tagged, (2) their execution/production craft is strong, (3) their research/process depth is weak. Filed correctly: (1) becomes a skills entry, (2) and (3) become a persona_traits placement, and the strong/weak read of (2)/(3) also shows up as where "Execution Craft" and "Research Depth" land in dimension_ratings. Nowhere does this stay a sentence for someone to read and second-guess. Do this decomposition for every substantive observation before you finalize any field — there is no field in this schema for a standalone opinion sentence, so if you find yourself forming one, route it into skills, persona_traits, or dimension_ratings instead.

Work in two disciplined passes:

1. FACTS FIRST. Before judging anything, privately inventory what's actually true and checkable: how many case studies, whether each states a problem / shows research or user insight / shows the solution / states a result / includes a reflection, whether any stated result is a specific number vs a vague description vs missing, how many industries/domains the work covers, whether about/contact/resume/LinkedIn links actually work, whether the portfolio and resume agree with each other (same title, same key projects, no identically copy-pasted text, consistent dates), total years of experience and any unexplained gaps, whether case studies name real clients vs are purely self-initiated/academic, which tools are actually evidenced in the text (not just shown as a logo grid), the COMPLETE list of every contact/social/profile URL that appears literally anywhere in the text — resume header, portfolio footer, about/contact section — not just the first one or two you notice (the portfolio pages you're given were rendered to markdown, so real hyperlink URLs are present in the source, not just link labels — read them all out rather than inferring or truncating the list), and which specific case studies have their own specific link (a live site, a case-study permalink, a Behance/Dribbble shot) versus none. No adjectives at this stage — just what's there.

2. JUDGMENT, disciplined and traceable, but always landed as a placed score or tag, never as a sentence of commentary. Every skill tag, every trait placement, every dimension score must be able to answer "how do you know that?" with a specific fact: a count, a yes/no, a quoted phrase, a named project — held privately as your reasoning, distilled down to the tag/score itself in the output. If you can't point to a specific fact, don't include the tag or soften the score toward the uncertain middle rather than asserting it. Never let a general impression ("good visual sense", "strong communicator") stand in for a real skill or dimension.

Follow this exact reasoning order:
- Step 1 (stage): Place the designer by stage using resume facts — years, titles, employment history. This changes what counts as a real strength or a real growth area: for an early-stage person a missing fundamental (problem framing, process) is a genuine growth area; for a senior person it almost never is — the real question is whether the portfolio makes the case for leadership, strategy, or scope. Judging a senior person on junior criteria, or a junior person on senior criteria, is the single easiest way to get this wrong.
- Step 2 (skills): List every distinct design craft/deliverable type actually evidenced by the work itself — not software (that's tool_proficiency) but what kinds of things they've designed: logo/brand identity, illustration, packaging, editorial, motion, UI screens, design systems, UX research, service design, art direction, etc. A skill only counts if you can point to a project that demonstrates it. In a separate dedicated pass, also inventory software/tools from resume skills sections, project process text, captions, screenshots, and visible UI/prototype references; do not leave tool_proficiency empty when any actual tool name appears anywhere in the source.
- Step 3 (persona_traits): Pick the 3-4 spectrum tensions that most usefully describe how this person works, and place them on each — e.g. execution/production craft vs. research/process depth, visual craft vs. strategic/business framing, fast-and-prolific vs. deep-and-iterative, solo maker vs. systems/team thinking. These are exactly the kind of thing a dense review sentence usually smuggles in ("focuses on visual deliverables without showing research") — surface it here as a placed, evidenced score instead of leaving it buried in a sentence.
- Step 4 (dimension_ratings): This is the strong-zones/growth-zones map, and now the ONLY place a strength or a growth area gets stated — there is no separate strengths/gaps prose anywhere else in this schema. Rate 4-6 dimensions that are actually the real question for THIS person, not a fixed list applied identically to everyone — pick whichever framing fits their stage and their work (e.g. execution craft, research/process depth, business framing, presentation/curation, clarity of positioning, systems thinking, leadership scope for someone senior). Spread the scores honestly across the real range (Strong down to Weak) so the set actually reads as a map of strong vs. growing areas, not a wall of "Good."

Ground every field in the actual evidence you were given (portfolio text, resume text, screenshots). Where the evidence is genuinely absent, say so plainly using the exact fallback language specified per field below — never guess or invent specifics like names, companies, or numbers that are not present in the material.

URLs are a hard case of this rule: only output a URL (a social/profile link, a project link) if it appears verbatim in the text you were given. Never construct one from a handle, name, or platform guess (e.g. never turn "Jane on Dribbble" into a dribbble.com URL unless that exact URL is in the text). If no URL is present for something, output null/empty rather than a best guess.

Every "key_points"/"evidence" field is a short, scannable fragment citing the specific thing you saw (a phrase, a project name, a metric) — never a generic restatement of the category, and never more than 8 words. Treat the UI as an infographic: labels, counts, tags, scores, bars, and project blocks do the work. Avoid prose unless a field explicitly asks for a compact read.`;

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    stage: {
      type: "OBJECT",
      description: "Step 1 — place the designer by career stage from resume facts (years, titles, history) before judging anything else, since what counts as a real gap changes completely by stage.",
      properties: {
        level: { type: "STRING", enum: ["Early", "Developing", "Mid-level", "Senior"] },
        reasoning: { type: "STRING", description: "One compact fragment citing the specific fact (years, title, history) that places them at this stage. 8 words max." },
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
    skills: {
      type: "ARRAY",
      description: "Step 2 — every distinct design craft/deliverable type actually evidenced by the work itself (logo/brand identity, illustration, packaging, editorial, motion, UI screens, design systems, UX research, service design, art direction, etc.) — not software/tools, and not the same list as `role`/`niche`. This is what fixes a skill like 'logo design' being visible in the case studies but never surfaced anywhere else in the profile. 4-10 items, most-evidenced first.",
      items: {
        type: "OBJECT",
        properties: {
          skill: { type: "STRING", description: "The craft/deliverable type, in plain language (e.g. 'Logo & Brand Identity', 'UX Research', 'Motion Design')." },
          level: { type: "STRING", enum: ["Core", "Practiced", "Exposure"], description: "Core = central to multiple projects; Practiced = clearly done well at least once; Exposure = touched on but thin evidence." },
          evidence: { type: "STRING", description: "The specific project/phrase this skill is drawn from. 8 words max." },
        },
        required: ["skill", "level", "evidence"],
      },
    },
    persona_traits: {
      type: "ARRAY",
      description: "Step 3 — 3-4 spectrum tensions that most usefully describe how this person works, each placed with an evidenced score rather than left buried in a sentence (e.g. a case study that's all polished visuals with no visible process reads as execution-heavy/research-light — that placement belongs here, not just as a gap sentence). Pick whichever tensions are most revealing for this person; typical ones: execution/production craft vs. research/process depth, visual craft vs. strategic/business framing, fast-and-prolific vs. deep-and-iterative, solo maker vs. systems/team thinking.",
      items: {
        type: "OBJECT",
        properties: {
          left_label: { type: "STRING", description: "The pole at score 1, e.g. 'Execution-led'." },
          right_label: { type: "STRING", description: "The pole at score 5, e.g. 'Research-led'." },
          score: { type: "INTEGER", description: "1-5 placement on the spectrum between left_label (1) and right_label (5). Use 3 only if the evidence genuinely shows both, not as a default when unsure." },
          evidence: { type: "STRING", description: "The specific project/phrase that places them here. 8 words max." },
        },
        required: ["left_label", "right_label", "score", "evidence"],
      },
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
        key_points: { type: "ARRAY", items: { type: "STRING" }, description: "1-3 compact chips citing the specific language/project found. 8 words max each." },
      },
      required: ["mode", "key_points"],
    },
    understanding_of_business: {
      type: "OBJECT",
      description: "Whether case studies frame the problem in business terms (goals, KPIs, ROI) vs purely visual/UI framing.",
      properties: {
        score: { type: "STRING", enum: ["Strong", "Partial", "Absent"] },
        key_points: { type: "ARRAY", items: { type: "STRING" }, description: "1-3 compact evidence chips. 8 words max each." },
      },
      required: ["score", "key_points"],
    },
    foundational_clarity: {
      type: "OBJECT",
      description: "Whether each case study follows a legible problem → process → solution structure with visible reasoning, not just polished screens.",
      properties: {
        score: { type: "STRING", enum: ["High", "Medium", "Low"] },
        key_points: { type: "ARRAY", items: { type: "STRING" }, description: "1-3 compact evidence chips. 8 words max each." },
      },
      required: ["score", "key_points"],
    },
    learning: {
      type: "OBJECT",
      description: "Evidence of active skill development: courses/certifications, a learning-focused case study, workshops, or visible skill progression across dated work.",
      properties: {
        present: { type: "BOOLEAN" },
        key_points: { type: "ARRAY", items: { type: "STRING" }, description: "1-3 compact evidence chips. 8 words max each." },
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
      description: "Software/tools used to create the work. Search the entire source: resume skills, project process, project captions, portfolio UI text, screenshots, and AI-tool mentions. Include tool names from a tools/logo grid only when the tool name is readable or clearly stated; otherwise use project/process evidence. Do not leave empty if any real tool name appears anywhere.",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          emphasis: {
            type: "INTEGER",
            description: "How central this tool is to their process: 3 = repeated across multiple projects/central workflow, 2 = used meaningfully in project/resume evidence, 1 = appears once, in a readable tool list, or in screenshot evidence.",
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
        key_points: { type: "ARRAY", items: { type: "STRING" }, description: "Name actual client/company/project names found. 8 words max each." },
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
    links: {
      type: "OBJECT",
      description: "Contact/profile/social URLs found verbatim in the portfolio or resume text — so a viewer can reach this person's real profiles without the designer having to type them in separately. Before filling this in, do one dedicated full pass over the ENTIRE source text (resume header/contact block, portfolio footer, about/contact page, any social-icon row) purely to inventory every URL and handle mentioned — do not stop after finding the first one or two, resumes and portfolio footers routinely list four or more (LinkedIn, GitHub/Behance/Dribbble, a personal site, and often a YouTube/Twitter/Instagram handle too). Only fill a field if that exact URL is present in the source text; leave it null otherwise. Never construct a URL from a handle or platform name.",
      properties: {
        linkedin: { type: "STRING", nullable: true },
        github: { type: "STRING", nullable: true },
        behance: { type: "STRING", nullable: true },
        dribbble: { type: "STRING", nullable: true },
        personal_website: { type: "STRING", nullable: true, description: "A personal/portfolio domain distinct from the main portfolio_link already on file, if a different one is mentioned in the text (e.g. a blog or a separate case-study site)." },
        email: { type: "STRING", nullable: true },
        other: {
          type: "ARRAY",
          description: "Every other named platform link found (X/Twitter, Instagram, YouTube, Medium, Notion, Threads, TikTok, etc.) that doesn't fit the named fields above — this is a catch-all, not an afterthought, so include ALL of them, not just the first one found.",
          items: {
            type: "OBJECT",
            properties: {
              platform: { type: "STRING" },
              url: { type: "STRING" },
            },
            required: ["platform", "url"],
          },
        },
      },
      required: ["linkedin", "github", "behance", "dribbble", "personal_website", "email", "other"],
    },
    summary: {
      type: "STRING",
      description: "One compact hiring read, 12-18 words max. It will be displayed as a visual callout, not a paragraph.",
    },
    recruiter_highlights: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "3-5 chip-sized shortlist signals, 3-8 words each. Cite specifics (project, client, metric, tool), never generic praise. If evidence is thin, say it plainly.",
    },
    notable_works: {
      type: "ARRAY",
      description: "3-6 of the strongest, most representative case studies/projects found in the portfolio or resume, picked so a recruiter can click straight into the best evidence instead of hunting for it. Only include a project you can point to a specific name/title for in the source text. Only set `link` when a specific URL for that individual project (a case-study permalink, live site, or Behance/Dribbble shot) appears in the text — leave it null rather than pointing everything at the general portfolio_link. Empty array if the source has no individually-identifiable projects.",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING", description: "The project/case-study name or title, exactly as named in the source." },
          link: { type: "STRING", nullable: true, description: "The specific URL for this project, only if one appears in the text; null otherwise." },
          client: { type: "STRING", nullable: true, description: "Named client/company, only if stated; null if self-initiated, academic, or unnamed." },
          summary: { type: "STRING", description: "A project-block caption, 6-10 words max, drawn from the actual case-study text." },
        },
        required: ["title", "link", "client", "summary"],
      },
    },
    dimension_ratings: {
      type: "ARRAY",
      description: "Step 4 — the strong-zones/growth-zones map, and the only place a strength or a growth area gets stated anywhere in this profile. Rate 4-6 dimensions that are actually the real question for THIS person, not a fixed list applied identically to everyone — pick whichever framing fits their stage and work (e.g. execution craft, research/process depth, business framing, presentation/curation, clarity of positioning, systems thinking, leadership scope for someone senior). Spread scores honestly across the real range so the set reads as a genuine map of strong vs. growing areas, not a wall of one score.",
      items: {
        type: "OBJECT",
        properties: {
          dimension: { type: "STRING" },
          score: { type: "STRING", enum: ["Strong", "Good", "Partial", "Developing", "Unclear", "Weak"] },
          evidence: { type: "STRING", description: "One compact evidence chip: phrase, project name, or fact. 8 words max." },
        },
        required: ["dimension", "score", "evidence"],
      },
    },
  },
  required: [
    "stage", "role", "skills", "persona_traits", "niche", "domain", "sector", "work_experience",
    "type_of_work_wanted", "team_work_proficiency", "understanding_of_business", "foundational_clarity",
    "learning", "contributing_back", "tool_proficiency", "ai_proficiency",
    "real_work_validation", "career_switching", "location", "work_preference",
    "salary_expectations", "current_status", "links", "summary", "recruiter_highlights",
    "notable_works", "dimension_ratings",
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
            maxOutputTokens: 8000,
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
