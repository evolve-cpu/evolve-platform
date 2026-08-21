import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * Mirrors "become a reviewer" submissions into a Google Sheet, alongside the
 * Supabase insert. Runs as a Supabase Edge Function (not a Vercel function)
 * so it doesn't count against Vercel's serverless function limit.
 *
 * Secrets (set via `supabase secrets set NAME=value`):
 *   GOOGLE_SHEETS_CLIENT_EMAIL — service account email
 *   GOOGLE_SHEETS_PRIVATE_KEY  — service account private key, PEM format
 *   GOOGLE_SHEETS_SPREADSHEET_ID — optional, defaults to the evolve reviewers sheet
 *   GOOGLE_SHEETS_RANGE           — optional, defaults to "Sheet1!A:K"
 *
 * The target spreadsheet must be shared with GOOGLE_SHEETS_CLIENT_EMAIL
 * (as an Editor) for the append to succeed.
 */

const CLIENT_EMAIL = Deno.env.get("GOOGLE_SHEETS_CLIENT_EMAIL") ?? "";
const PRIVATE_KEY_PEM = (Deno.env.get("GOOGLE_SHEETS_PRIVATE_KEY") ?? "").replace(/\\n/g, "\n");
const SPREADSHEET_ID =
  Deno.env.get("GOOGLE_SHEETS_SPREADSHEET_ID") ?? "1VdCt5w_KWQ6nehzDmSqHLiM8TK1K-UZMGotBeqVF3o";
const RANGE = Deno.env.get("GOOGLE_SHEETS_RANGE") ?? "Sheet1!A:K";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

function base64url(input: ArrayBuffer | string) {
  const bytes =
    typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function pemToArrayBuffer(pem: string) {
  const clean = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function getAccessToken() {
  if (!CLIENT_EMAIL || !PRIVATE_KEY_PEM) {
    throw new Error("Google Sheets service account not configured");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: CLIENT_EMAIL,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600
  };

  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`;

  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(PRIVATE_KEY_PEM),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsigned)
  );
  const jwt = `${unsigned}.${base64url(signature)}`;

  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt
    })
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error_description || "failed to get Google access token");
  return data.access_token as string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      name,
      email,
      country_code,
      phone,
      linkedin_url,
      designation,
      workplace,
      experience,
      stream,
      hiring_experience
    } = await req.json();

    if (!name || !email) {
      return new Response(JSON.stringify({ error: "missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const accessToken = await getAccessToken();
    const row = [
      new Date().toISOString(),
      name,
      email,
      `${country_code || ""} ${phone || ""}`.trim(),
      linkedin_url || "",
      designation || "",
      workplace || "",
      experience || "",
      stream || "",
      hiring_experience || ""
    ];

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(
      RANGE
    )}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    const r = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ values: [row] })
    });

    if (!r.ok) {
      const err = await r.text();
      throw new Error(err);
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
