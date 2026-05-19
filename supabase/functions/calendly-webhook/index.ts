// Calendly webhook handler — auto-creates / cancels mentorship_1on1_calls
// when an accelerator plan user books or cancels a 1:1 call on Calendly.
//
// Deploy:  supabase functions deploy calendly-webhook --no-verify-jwt
// Env var: CALENDLY_WEBHOOK_SIGNING_KEY  (from Calendly → Webhooks → Signing key)
//
// In Calendly → Webhooks add:
//   URL:    https://<your-project>.supabase.co/functions/v1/calendly-webhook
//   Events: invitee.created, invitee.canceled

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// ── Calendly webhook signature verification ───────────────────────────────
// Header format:  Calendly-Webhook-Signature: t=<ts>,v1=<hex-hmac>
async function verifySignature(req: Request, rawBody: string): Promise<boolean> {
  const signingKey = Deno.env.get("CALENDLY_WEBHOOK_SIGNING_KEY");
  if (!signingKey) return true; // skip verification if key not configured

  const header = req.headers.get("Calendly-Webhook-Signature") ?? "";
  const parts = Object.fromEntries(
    header.split(",").map((p) => p.split("=") as [string, string])
  );
  const ts = parts["t"];
  const signature = parts["v1"];
  if (!ts || !signature) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(signingKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const expected = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${ts}.${rawBody}`)
  );
  const expectedHex = Array.from(new Uint8Array(expected))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return expectedHex === signature;
}

// ── Main handler ──────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const rawBody = await req.text();

  const valid = await verifySignature(req, rawBody);
  if (!valid) {
    return new Response("Invalid signature", { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const eventType = body.event as string;
  const payload = body.payload as Record<string, unknown>;

  // ── invitee.created — user just booked a call ─────────────────────────
  if (eventType === "invitee.created") {
    const email = (payload.email as string)?.toLowerCase()?.trim();
    const rescheduled = payload.rescheduled as boolean;
    const scheduledEvent = payload.scheduled_event as Record<string, unknown>;

    const startTime = scheduledEvent?.start_time as string;
    const endTime = scheduledEvent?.end_time as string;
    const location = scheduledEvent?.location as Record<string, unknown> | null;
    const joinUrl = (location?.join_url as string) ?? null;
    const locType = (location?.type as string) ?? "google meet";
    const platform = locType === "google_conference" ? "google meet" : locType;

    // Derive duration in minutes from start/end
    const durationMinutes =
      startTime && endTime
        ? Math.round(
            (new Date(endTime).getTime() - new Date(startTime).getTime()) /
              60000
          )
        : 30;

    if (!email || !startTime) {
      return new Response("OK - missing email or start_time", { status: 200 });
    }

    // Find the platform user by email
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .ilike("email", email)
      .maybeSingle();

    if (!profile) {
      console.log(`calendly-webhook: no profile for email ${email}`);
      return new Response("OK - no matching user", { status: 200 });
    }

    // Find their active accelerator bonus (valid_until still in the future)
    const { data: bonus } = await supabase
      .from("mentorship_accelerator_bonus")
      .select("*")
      .eq("user_id", profile.id)
      .gt("valid_until", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!bonus) {
      console.log(`calendly-webhook: no active bonus for user ${profile.id}`);
      return new Response("OK - no active bonus", { status: 200 });
    }

    // If this is a reschedule, cancel the previous scheduled call for this
    // user (the old invitee.canceled fires first, but handle it here too
    // as a safety net — only cancel calls that don't match the new time).
    if (rescheduled) {
      await supabase
        .from("mentorship_1on1_calls")
        .update({ status: "cancelled" })
        .eq("user_id", profile.id)
        .eq("bonus_id", bonus.id)
        .eq("status", "scheduled")
        .neq("call_datetime", startTime);
    }

    // Upsert: if a call with the same bonus + datetime already exists (e.g.
    // double-fire), update rather than duplicate.
    const { error } = await supabase
      .from("mentorship_1on1_calls")
      .upsert(
        {
          bonus_id: bonus.id,
          user_id: profile.id,
          batch_id: bonus.batch_id,
          call_datetime: startTime,
          duration_minutes: durationMinutes,
          meeting_link: joinUrl,
          platform,
          status: "scheduled",
          notes: `booked via calendly · ${payload.name ?? email}`,
        },
        { onConflict: "bonus_id,call_datetime" }
      );

    if (error) {
      console.error("calendly-webhook insert error:", error);
      return new Response("DB error", { status: 500 });
    }

    console.log(`calendly-webhook: call created for ${email} at ${startTime}`);
  }

  // ── invitee.canceled — user cancelled their booking ───────────────────
  if (eventType === "invitee.canceled") {
    const email = (payload.email as string)?.toLowerCase()?.trim();
    const scheduledEvent = payload.scheduled_event as Record<string, unknown>;
    const startTime = scheduledEvent?.start_time as string;

    if (!email || !startTime) {
      return new Response("OK", { status: 200 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .ilike("email", email)
      .maybeSingle();

    if (profile) {
      await supabase
        .from("mentorship_1on1_calls")
        .update({ status: "cancelled" })
        .eq("user_id", profile.id)
        .eq("call_datetime", startTime)
        .eq("status", "scheduled");

      console.log(`calendly-webhook: call cancelled for ${email} at ${startTime}`);
    }
  }

  return new Response("OK", { status: 200 });
});
