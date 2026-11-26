// Voice review of an AI profile: the reviewer talks through what's wrong,
// Gemini transcribes it AND maps each point onto the profile's fields
// (verdict, should-be, gap type, severity, reasoning in the reviewer's own
// words, evidence). The admin review screen pre-fills its form from this and
// the reviewer checks/edits before submitting — nothing is saved here.
//
// Audio comes in as base64 in the request body (Vercel's ~4.5MB body cap →
// the client records at a low bitrate and caps each recording's length).
// Audio is never stored: only the transcript ends up in the review.

const VOICE_MODEL = process.env.GEMINI_VOICE_MODEL || "gemini-3.5-flash-lite";
const MAX_AUDIO_B64 = 4_000_000;
const AUDIO_TYPES = /^audio\/(webm|ogg|mp4|mpeg|wav|aac|x-m4a)(;.*)?$/i;

const GAP_TYPES = ["missed_info", "made_up", "overrated", "underrated", "wrong_interpretation", "bad_input", "wording"];
const SEVERITIES = ["minor", "major", "wrong"];

const SYSTEM_PROMPT = `You are assisting a senior design reviewer at Evolve, a design education platform. The reviewer is checking an AI-generated profile of a designer against the designer's real portfolio and resume, and is speaking their review out loud (often in English, Hindi or Hinglish, casually, jumping between points).

Your job:
1. Transcribe the recording faithfully (in English; translate Hindi/Hinglish into natural English, keep names/project names as spoken).
2. Turn every point the reviewer makes into a structured correction mapped to the profile FIELD LIST you are given.

Rules:
- Only use field_path values from the FIELD LIST. Pick the most specific one (e.g. "skills[2]" for a specific skill item, "stage" for career stage).
- verdict "disagree" = the reviewer says that field/item is wrong. verdict "missing" = the reviewer says something is absent from a list (use the list's base key as field_path, e.g. "skills", "dimension_ratings", "persona_traits"). verdict "agree" = the reviewer explicitly confirms a field is right.
- human_value: what the reviewer says it SHOULD be, written in the same style/format as the AI value (e.g. "Early", "Packaging Design (Practiced)", "3/5", "Partial"). Empty string if they didn't say.
- reasoning: WHY, in the reviewer's own words and with their evidence — keep their meaning, clean up filler words, 1-2 sentences. Never invent reasons the reviewer didn't give.
- evidence: where they say they saw it (project / case study / resume section). Empty string if not said.
- gap_type: missed_info (in the source but AI missed it), made_up (no evidence in source), overrated, underrated, wrong_interpretation (read evidence, wrong conclusion), bad_input (AI couldn't see the content: image-only pages, broken link, unreadable file), wording (right idea, badly phrased/wrong field). Pick the best fit.
- severity: minor (still the right picture), major (changes how the person comes across), wrong (would mislead). Infer from the reviewer's tone if not stated ("completely wrong" → wrong, "slightly" → minor).
- If one sentence covers several fields, produce one correction per field. If the reviewer repeats a point, merge it.
- overall_notes: general impressions or patterns the reviewer mentions that don't belong to a single field. Empty string if none.
- overall_accuracy: 1-5 only if the reviewer states an overall rating or it's unmistakable ("this profile is totally off" → 1); otherwise 0.
- Do not output corrections for things the reviewer didn't say.`;

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    transcript: { type: "STRING" },
    corrections: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          field_path: { type: "STRING" },
          verdict: { type: "STRING", enum: ["disagree", "missing", "agree"] },
          human_value: { type: "STRING" },
          gap_type: { type: "STRING", enum: GAP_TYPES },
          severity: { type: "STRING", enum: SEVERITIES },
          reasoning: { type: "STRING" },
          evidence: { type: "STRING" }
        },
        required: ["field_path", "verdict", "human_value", "gap_type", "severity", "reasoning", "evidence"]
      }
    },
    overall_notes: { type: "STRING" },
    overall_accuracy: { type: "INTEGER" }
  },
  required: ["transcript", "corrections", "overall_notes", "overall_accuracy"]
};

export async function voiceReview({ audio, mimeType, fields }, HttpError) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new HttpError(500, "GEMINI_API_KEY not set on the server");
  if (typeof audio !== "string" || !audio || audio.length > MAX_AUDIO_B64) {
    throw new HttpError(400, "recording missing or too long — keep each recording under ~10 minutes");
  }
  if (typeof mimeType !== "string" || !AUDIO_TYPES.test(mimeType)) throw new HttpError(400, "unsupported audio format");
  if (!Array.isArray(fields) || !fields.length || fields.length > 300) throw new HttpError(400, "bad field list");

  const allowed = new Map();
  const lines = [];
  for (const f of fields) {
    if (!f || typeof f.path !== "string") continue;
    allowed.set(f.path, !!f.isList);
    const value = String(f.display ?? "").slice(0, 400);
    lines.push(f.isList ? `- ${f.path} (LIST "${f.label}" — use for missing items)` : `- ${f.path} ("${f.label}"): ${value}`);
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${VOICE_MODEL}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [
          {
            role: "user",
            parts: [
              { text: `FIELD LIST (field_path ("label"): current AI value):\n${lines.join("\n")}` },
              { inlineData: { mimeType: mimeType.split(";")[0], data: audio } },
              { text: "Transcribe the reviewer's recording and return the structured corrections now." }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 8000,
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA
        }
      })
    }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new HttpError(502, `Gemini: ${data?.error?.message || res.status}`);
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  let out;
  try {
    out = JSON.parse(raw);
  } catch {
    throw new HttpError(502, "couldn't understand the AI's response — try recording again");
  }

  // keep only corrections that point at a real field, with a valid verdict for it
  const corrections = (Array.isArray(out.corrections) ? out.corrections : []).filter((c) => {
    if (!c || !allowed.has(c.field_path)) return false;
    if (c.verdict === "missing") return allowed.get(c.field_path);
    return !allowed.get(c.field_path) && ["disagree", "agree"].includes(c.verdict);
  });

  return {
    transcript: String(out.transcript || ""),
    corrections,
    overall_notes: String(out.overall_notes || ""),
    overall_accuracy: Number.isInteger(out.overall_accuracy) && out.overall_accuracy >= 1 && out.overall_accuracy <= 5 ? out.overall_accuracy : null
  };
}
