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
 *     "Integrate calendar" -> Calendar ID)
 *   GOOGLE_WORKSPACE_IMPERSONATE_EMAIL — a real Workspace user the service
 *     account impersonates via domain-wide delegation (Google flatly
 *     refuses to let a bare service account invite attendees, regardless
 *     of calendar-sharing permissions — this is the only way around that;
 *     see setup notes below). Usually the same user who owns
 *     GOOGLE_CALENDAR_ID.
 *   BREVO_API_KEY — same value as the Vercel env var of the same name;
 *     duplicated here since Edge Functions can't read Vercel's env
 *
 * SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are auto-provided by Supabase,
 * no `secrets set` needed (same as get-recording-url).
 *
 * Domain-wide delegation one-time setup (required for attendee invites):
 *   1. Cloud Console -> service account -> Details -> Advanced settings ->
 *      enable "Domain-wide delegation" -> note the numeric Client ID shown.
 *   2. admin.google.com (super admin) -> Security -> Access and data
 *      control -> API controls -> Domain-wide delegation -> Add new ->
 *      paste that Client ID, scope "https://www.googleapis.com/auth/calendar"
 *      -> Authorize.
 *   3. Set GOOGLE_WORKSPACE_IMPERSONATE_EMAIL to the Workspace user to
 *      impersonate. The explicit calendar-sharing entry for the service
 *      account (from before this was added) is no longer needed once
 *      impersonating that calendar's own owner, but leaving it doesn't hurt.
 *
 * Request body: { mode: "sync_calendar", event_id }
 *             | { mode: "notify", registration_id }
 *             | { mode: "invite", event_id, email, name }
 *             | { mode: "send_reminder", registration_id }
 *             | { mode: "send_due_reminders" }
 *
 * "send_due_reminders" is the cron-invoked mode (see
 * supabase/migrations/event_reminder_scheduling.sql for the Supabase
 * Cron job that calls it every 15 minutes): it finds every published
 * event starting within the next 9 hours and emails the reminder to
 * any registration that doesn't have one yet, tracked via
 * event_registrations.reminder_sent_at. Re-running it is always safe —
 * it only ever sends to registrations where that column is still null.
 */

const CLIENT_EMAIL = Deno.env.get("GOOGLE_CALENDAR_CLIENT_EMAIL") ?? "";
const PRIVATE_KEY_PEM = (Deno.env.get("GOOGLE_CALENDAR_PRIVATE_KEY") ?? "").replace(/\\n/g, "\n");
const CALENDAR_ID = Deno.env.get("GOOGLE_CALENDAR_ID") ?? "";
const IMPERSONATE_EMAIL = Deno.env.get("GOOGLE_WORKSPACE_IMPERSONATE_EMAIL") ?? "";
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
  const claims: Record<string, unknown> = {
    iss: CLIENT_EMAIL,
    scope: "https://www.googleapis.com/auth/calendar",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600
  };
  // domain-wide delegation: impersonate a real Workspace user, since Google
  // refuses to let a bare service account invite attendees to an event
  if (IMPERSONATE_EMAIL) claims.sub = IMPERSONATE_EMAIL;
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
function formatEventDateTime(startTimeIso: string) {
  const d = new Date(startTimeIso);
  const dateLine = d.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    day: "numeric",
    month: "long"
  });
  const time = d
    .toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit", hour12: true })
    .replace(/(am|pm)/i, (m) => m.toUpperCase());
  const hourIST = Number(d.toLocaleString("en-US", { timeZone: "Asia/Kolkata", hour: "numeric", hour12: false }));
  return { dateLine, time, hourIST };
}

// Admin uploads the cover image as 1:1 (see EventsTab.jsx) — rendered square here too.
function coverImageHtml(event: any) {
  if (!event.cover_image_url) return "";
  // return `<img src="${event.cover_image_url}" width="480" height="480" alt="" style="width:100%;max-width:480px;height:auto;display:block;border-radius:12px;margin-bottom:24px;" />`;
    return `<img src="${event.cover_image_url}" width="320" height="320" alt="" style="width:100%;max-width:320px;height:auto;display:block;border-radius:12px;margin-bottom:20px;" />`;
}

function speakerLineHtml(event: any) {
  if (!event.speaker_name) return "";
  return `<p>Join ${event.speaker_name} for a conversation on ${event.description || event.title}.</p>`;
}

async function sendConfirmationEmail(toEmail: string, toName: string, event: any) {
  if (!BREVO_API_KEY) return;
  const { dateLine, time } = formatEventDateTime(event.start_time);
  const html = `
    ${coverImageHtml(event)}
    <p>Hi ${toName || "there"},</p>
    <p>You've successfully registered for <strong>${event.title}</strong>. We're looking forward to having you with us!</p>
    <p>${dateLine} · ${time} IST</p>
    ${speakerLineHtml(event)}
    <p>We've also added the event to your calendar, so you're all set. You'll find the calendar invite in your inbox.</p>
    <p>See you there!<br/>Team evolve</p>
  `;
  const r = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": BREVO_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: { name: "evolve", email: "noreply@evolvedesign.academy" },
      to: [{ email: toEmail, name: toName || undefined }],
      subject: `You've successfully registered for ${event.title}`,
      htmlContent: html
    })
  });
  if (!r.ok) {
    const err = await r.text();
    throw new Error(`Brevo error: ${err}`);
  }
}

// Same-day nudge — sent close to start_time by whatever calls mode "send_reminder"
// (a cron job or admin action; not scheduled by this function itself).
async function sendReminderEmail(toEmail: string, toName: string, event: any) {
  if (!BREVO_API_KEY) return;
  const { time, hourIST } = formatEventDateTime(event.start_time);
  const timeWord = hourIST >= 17 || hourIST < 4 ? "tonight" : "today";
  const html = `
    ${coverImageHtml(event)}
    <p>Hi ${toName || "there"},</p>
    <p>A quick reminder - <strong>${event.title}</strong> is happening today!</p>
    <p>Today · ${time} IST</p>
    ${speakerLineHtml(event)}
    <p>Your calendar invite has all the details you'll need to join.</p>
    <p>Looking forward to seeing you ${timeWord}!<br/>Team evolve</p>
  `;
  const r = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": BREVO_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: { name: "evolve", email: "noreply@evolvedesign.academy" },
      to: [{ email: toEmail, name: toName || undefined }],
      subject: `See you ${timeWord}: ${event.title}`,
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

async function handleSendReminder(registration_id: string) {
  const { data: registration, error } = await admin
    .from("event_registrations")
    .select("*")
    .eq("id", registration_id)
    .single();
  if (error || !registration) throw new Error("registration not found");

  const { data: event, error: eventErr } = await admin.from("events").select("*").eq("id", registration.event_id).single();
  if (eventErr || !event) throw new Error("event not found");

  let email = registration.invitee_email as string | null;
  let name = registration.invitee_name as string | null;
  if (registration.user_id) {
    const { data: profile } = await admin.from("profiles").select("name, email").eq("id", registration.user_id).maybeSingle();
    email = profile?.email ?? email;
    name = profile?.name ?? name;
  }
  if (!email) throw new Error("registration has no email to notify");

  await sendReminderEmail(email, name || "", event);
  await admin.from("event_registrations").update({ reminder_sent_at: new Date().toISOString() }).eq("id", registration.id);
  return { ok: true };
}

// Cron-invoked (see file header) — catches up any registration that's
// within 9h of its event's start and hasn't been reminded yet, rather
// than requiring the cron tick to land exactly on the 9h mark. That
// also covers someone registering after the 9h mark has already passed.
async function handleSendDueReminders() {
  const nineHoursOut = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString();

  const { data: events, error } = await admin
    .from("events")
    .select("*")
    .eq("status", "published")
    .gt("start_time", new Date().toISOString())
    .lte("start_time", nineHoursOut);
  if (error) throw new Error(error.message);
  if (!events?.length) return { ok: true, remindersSent: 0 };

  let remindersSent = 0;
  for (const event of events) {
    const { data: registrations, error: regErr } = await admin
      .from("event_registrations")
      .select("*")
      .eq("event_id", event.id)
      .eq("status", "registered")
      .is("reminder_sent_at", null);
    if (regErr || !registrations?.length) continue;

    for (const registration of registrations) {
      let email = registration.invitee_email as string | null;
      let name = registration.invitee_name as string | null;
      if (registration.user_id) {
        const { data: profile } = await admin.from("profiles").select("name, email").eq("id", registration.user_id).maybeSingle();
        email = profile?.email ?? email;
        name = profile?.name ?? name;
      }
      if (!email) continue;

      try {
        await sendReminderEmail(email, name || "", event);
        await admin.from("event_registrations").update({ reminder_sent_at: new Date().toISOString() }).eq("id", registration.id);
        remindersSent++;
      } catch (err) {
        console.error(`send_due_reminders: failed for registration ${registration.id}:`, err.message);
      }
    }
  }
  return { ok: true, remindersSent };
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
    else if (body.mode === "send_reminder") result = await handleSendReminder(body.registration_id);
    else if (body.mode === "send_due_reminders") result = await handleSendDueReminders();
    else throw new Error("unknown mode");

    return new Response(JSON.stringify(result), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
