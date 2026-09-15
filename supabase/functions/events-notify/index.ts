import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Evolve Events — Phase 3: Google Calendar sync + confirmation email +
 * admin-initiated invites, all in one Edge Function (not a Vercel one) so
 * it doesn't count against Vercel's serverless function cap — same reason
 * append-reviewer-sheet lives here instead of in api/. The Google Calendar
 * access pattern (service-account JWT-bearer, hand-rolled RS256 via Web
 * Crypto) is copied from append-reviewer-sheet's Sheets integration,
 * pointed at the Calendar API instead.
 *
 * Secrets (set via `supabase secrets set NAME=value`):
 *   GOOGLE_CALENDAR_CLIENT_EMAIL — service account email (can reuse the
 *     same service account as GOOGLE_SHEETS_CLIENT_EMAIL)
 *   GOOGLE_CALENDAR_PRIVATE_KEY  — service account private key, PEM format
 *   GOOGLE_CALENDAR_ID           — target calendar's ID (Settings ->
 *     "Integrate calendar" -> Calendar ID); must be shared with the
 *     service account above, "Make changes to events" permission
 *   BREVO_API_KEY — same value as the Vercel env var of the same name;
 *     duplicated here since Edge Functions can't read Vercel's env
 *
 * SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are auto-provided by Supabase,
 * no `secrets set` needed (same as get-recording-url).
 *
 * Request body: { mode: "sync_calendar", event_id }
 *             | { mode: "notify", registration_id }
 *             | { mode: "invite", event_id, email, name }
 */

const CLIENT_EMAIL = Deno.env.get("GOOGLE_CALENDAR_CLIENT_EMAIL") ?? "";
const PRIVATE_KEY_PEM = (Deno.env.get("GOOGLE_CALENDAR_PRIVATE_KEY") ?? "").replace(/\\n/g, "\n");
const CALENDAR_ID = Deno.env.get("GOOGLE_CALENDAR_ID") ?? "";
const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

/* ── Google service-account auth (copied from append-reviewer-sheet) ───── */
function base64url(input: ArrayBuffer | string) {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function pemToArrayBuffer(pem: string) {
  const clean = pem.replace(/-----BEGIN PRIVATE KEY-----/, "").replace(/-----END PRIVATE KEY-----/, "").replace(/\s/g, "");
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function getAccessToken() {
  if (!CLIENT_EMAIL || !PRIVATE_KEY_PEM) {
    throw new Error("Google Calendar service account not configured");
  }
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: CLIENT_EMAIL,
    scope: "https://www.googleapis.com/auth/calendar",
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
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(unsigned));
  const jwt = `${unsigned}.${base64url(signature)}`;

  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt })
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error_description || "failed to get Google access token");
  return data.access_token as string;
}

/* ── Calendar ─────────────────────────────────────────────────────────── */
async function ensureCalendarEvent(event: any) {
  if (event.google_calendar_event_id) {
    await patchCalendarEvent(event, event.google_calendar_event_id);
    return event.google_calendar_event_id as string;
  }

  const accessToken = await getAccessToken();
  const body = calendarEventBody(event);
  const r = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?sendUpdates=all`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }
  );
  const data = await r.json();
  if (!r.ok) throw new Error(data.error?.message || "failed to create calendar event");

  await admin.from("events").update({ google_calendar_event_id: data.id }).eq("id", event.id);
  return data.id as string;
}

async function patchCalendarEvent(event: any, calendarEventId: string) {
  const accessToken = await getAccessToken();
  const r = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events/${calendarEventId}?sendUpdates=all`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(calendarEventBody(event))
    }
  );
  if (!r.ok) {
    const err = await r.json();
    throw new Error(err.error?.message || "failed to update calendar event");
  }
}

function calendarEventBody(event: any) {
  return {
    summary: event.title,
    description: [event.description, event.join_link ? `Join link: ${event.join_link}` : ""].filter(Boolean).join("\n\n"),
    start: { dateTime: event.start_time, timeZone: "Asia/Kolkata" },
    end: { dateTime: event.end_time || event.start_time, timeZone: "Asia/Kolkata" }
  };
}

async function addAttendee(calendarEventId: string, email: string) {
  const accessToken = await getAccessToken();
  const getR = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events/${calendarEventId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const current = await getR.json();
  if (!getR.ok) throw new Error(current.error?.message || "failed to fetch calendar event");

  const attendees = Array.isArray(current.attendees) ? current.attendees : [];
  if (attendees.some((a: any) => a.email?.toLowerCase() === email.toLowerCase())) return;
  attendees.push({ email });

  const patchR = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events/${calendarEventId}?sendUpdates=all`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ attendees })
    }
  );
  if (!patchR.ok) {
    const err = await patchR.json();
    throw new Error(err.error?.message || "failed to add attendee");
  }
}

/* ── Email ────────────────────────────────────────────────────────────── */
async function sendConfirmationEmail(toEmail: string, toName: string, event: any) {
  if (!BREVO_API_KEY) return;
  const when = new Date(event.start_time).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
  const html = `
    <p>Hi ${toName || "there"},</p>
    <p>You're registered for <strong>${event.title}</strong>.</p>
    <p>${when} IST</p>
    ${event.speaker_name ? `<p>Hosted by ${event.speaker_name}${event.speaker_title ? `, ${event.speaker_title}` : ""}</p>` : ""}
    <p>This event has been added to your calendar — check your inbox for the calendar invite.</p>
    <p>See you there!<br/>Team evolve</p>
  `;
  const r = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": BREVO_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: { name: "evolve", email: "noreply@evolvedesign.academy" },
      to: [{ email: toEmail, name: toName || undefined }],
      subject: `You're registered: ${event.title}`,
      htmlContent: html
    })
  });
  if (!r.ok) {
    const err = await r.text();
    throw new Error(`Brevo error: ${err}`);
  }
}

/* ── modes ────────────────────────────────────────────────────────────── */
async function handleSyncCalendar(event_id: string) {
  const { data: event, error } = await admin.from("events").select("*").eq("id", event_id).single();
  if (error || !event) throw new Error("event not found");
  const calendarEventId = await ensureCalendarEvent(event);
  return { ok: true, google_calendar_event_id: calendarEventId };
}

async function notifyRegistration(registration: any, event: any) {
  const calendarEventId = await ensureCalendarEvent(event);

  let email = registration.invitee_email as string | null;
  let name = registration.invitee_name as string | null;
  if (registration.user_id) {
    const { data: profile } = await admin.from("profiles").select("name, email").eq("id", registration.user_id).maybeSingle();
    email = profile?.email ?? email;
    name = profile?.name ?? name;
  }
  if (!email) throw new Error("registration has no email to notify");

  await addAttendee(calendarEventId, email);
  await sendConfirmationEmail(email, name || "", event);
  await admin.from("event_registrations").update({ calendar_synced: true }).eq("id", registration.id);
}

async function handleNotify(registration_id: string) {
  const { data: registration, error } = await admin
    .from("event_registrations")
    .select("*")
    .eq("id", registration_id)
    .single();
  if (error || !registration) throw new Error("registration not found");

  const { data: event, error: eventErr } = await admin.from("events").select("*").eq("id", registration.event_id).single();
  if (eventErr || !event) throw new Error("event not found");

  await notifyRegistration(registration, event);
  return { ok: true };
}

async function handleInvite(event_id: string, email: string, name: string) {
  const { data: event, error: eventErr } = await admin.from("events").select("*").eq("id", event_id).single();
  if (eventErr || !event) throw new Error("event not found");

  const { data: existingProfile } = await admin.from("profiles").select("id").eq("email", email).maybeSingle();

  // check-then-insert rather than upsert — the invitee_email uniqueness
  // constraint is a partial index (WHERE invitee_email IS NOT NULL), which
  // PostgREST can't reliably infer as an upsert conflict target, so this
  // avoids relying on that inference entirely. Re-inviting someone already
  // registered just re-sends the notification instead of erroring.
  let registration;
  const existingQuery = existingProfile
    ? admin.from("event_registrations").select("*").eq("event_id", event_id).eq("user_id", existingProfile.id)
    : admin.from("event_registrations").select("*").eq("event_id", event_id).eq("invitee_email", email);
  const { data: existingRegistration } = await existingQuery.maybeSingle();

  if (existingRegistration) {
    registration = existingRegistration;
  } else {
    const { data, error } = await admin
      .from("event_registrations")
      .insert({
        event_id,
        user_id: existingProfile?.id ?? null,
        invitee_email: existingProfile ? null : email,
        invitee_name: existingProfile ? null : name || null,
        source: "admin_invite"
      })
      .select()
      .single();
    if (error || !data) throw new Error(error?.message || "failed to create invite");
    registration = data;
  }

  await notifyRegistration(registration, event);
  return { ok: true, registration };
}

/* ── entrypoint ───────────────────────────────────────────────────────── */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    let result;
    if (body.mode === "sync_calendar") result = await handleSyncCalendar(body.event_id);
    else if (body.mode === "notify") result = await handleNotify(body.registration_id);
    else if (body.mode === "invite") result = await handleInvite(body.event_id, body.email, body.name);
    else throw new Error("unknown mode");

    return new Response(JSON.stringify(result), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
