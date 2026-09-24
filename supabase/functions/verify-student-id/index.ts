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

/* ── Supabase REST + Storage helpers ─────────────────────────────────────── */

async function dbUpdate(userId: string, payload: Record<string, unknown>): Promise<void> {
  await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
    method: "PATCH",
    headers: { ...DB_HEADERS, "Prefer": "return=minimal" },
    body: JSON.stringify(payload),
  });
}

async function downloadAsInlineData(storagePath: string): Promise<{ mimeType: string; data: string } | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/student-ids/${storagePath}`, {
      headers: { "apikey": SERVICE_ROLE_KEY, "Authorization": `Bearer ${SERVICE_ROLE_KEY}` },
    });
    if (!res.ok) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") || "image/jpeg";
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return { mimeType: contentType, data: btoa(binary) };
  } catch {
    return null;
  }
}

/* ── Gemini structured extraction ────────────────────────────────────────── */

const SYSTEM_PROMPT = `You are reading a photo or scan of a student's college/university ID card to help pre-fill their profile. Extract only what is actually printed/visible on the card — never guess or invent a value. If the card is too blurry, cropped, glared-out, or otherwise illegible to confidently read a field, leave that field null rather than guessing, and if the card as a whole isn't legible enough to be useful, set is_clear to false.

Field notes:
- college_name: the institution's full name as printed (college/university/institute name), not a department or program.
- year: the student's current year of study if printed or inferable from a batch/admission year plus a validity range (e.g. "2022-2026" 4-year program in its second year → "2nd"). Output exactly one of "1st", "2nd", "3rd", "4th", "5th", or null if not determinable.
- program: the degree/course name if printed (e.g. "B.Des", "Bachelor of Design", "B.Tech").
- stream: the specialization/branch/major if printed (e.g. "Communication Design", "Interaction Design"), separate from program.
- student_name: the cardholder's name as printed, or null.
- is_clear: true only if you were able to confidently read enough of the card to extract at least the college name; false if the image is too illegible/irrelevant to be useful.`;

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    college_name: { type: "STRING", nullable: true },
    year: { type: "STRING", nullable: true, enum: ["1st", "2nd", "3rd", "4th", "5th"] },
    program: { type: "STRING", nullable: true },
    stream: { type: "STRING", nullable: true },
    student_name: { type: "STRING", nullable: true },
    is_clear: { type: "BOOLEAN" },
  },
  required: ["college_name", "year", "program", "stream", "student_name", "is_clear"],
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
    const storage_path = body.storage_path ?? "";

    if (!user_id || !storage_path) {
      return new Response(
        JSON.stringify({ error: "user_id and storage_path are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const image = await downloadAsInlineData(storage_path);
    if (!image) {
      await dbUpdate(user_id, {
        student_id_path: storage_path,
        student_id_verification_status: "unclear",
      });
      return new Response(
        JSON.stringify({ error: "Could not read uploaded file from storage", is_clear: false }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{
            role: "user",
            parts: [
              { inlineData: image },
              { text: "Read this student ID card and return the structured fields now." },
            ],
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1024,
            responseMimeType: "application/json",
            responseSchema: RESPONSE_SCHEMA,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      await dbUpdate(user_id, {
        student_id_path: storage_path,
        student_id_verification_status: "unclear",
      });
      return new Response(
        JSON.stringify({ error: "Gemini API error", status: geminiRes.status, details: errText.slice(0, 500) }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiData = await geminiRes.json();
    const rawOut: string = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    let extracted: Record<string, unknown> | null = null;
    try {
      extracted = rawOut ? JSON.parse(rawOut) : null;
    } catch {
      extracted = null;
    }

    const isClear = !!extracted?.is_clear && !!extracted?.college_name;
    const verificationStatus = isClear ? "verified" : "unclear";

    await dbUpdate(user_id, {
      student_id_path: storage_path,
      student_id_extracted: extracted,
      student_id_verification_status: verificationStatus,
      student_id_verified_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        is_clear: isClear,
        college_name: extracted?.college_name ?? null,
        year: extracted?.year ?? null,
        program: extracted?.program ?? null,
        stream: extracted?.stream ?? null,
        student_name: extracted?.student_name ?? null,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    const msg = (err as Error).message ?? "unknown error";
    if (user_id) {
      await dbUpdate(user_id, { student_id_verification_status: "unclear" }).catch(() => {});
    }
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
