-- ============================================================
-- Event reminder scheduling
--
-- Adds reminder_sent_at to event_registrations (guards against a
-- registration getting the "9 hours before" reminder more than once,
-- whether it's sent by the cron job below or by an admin manually
-- resending one from EventsTab.jsx) and schedules a Supabase Cron
-- (pg_cron + pg_net) job that calls the events-notify edge function's
-- `send_due_reminders` mode every 15 minutes. That mode finds every
-- published event starting within the next 9 hours and sends the
-- reminder to any registration that doesn't have one yet — so it also
-- catches someone who registers *after* the 9-hour mark has already
-- passed, not just events crossing the mark exactly on a cron tick.
--
-- ONE-TIME MANUAL SETUP — run this in the Supabase SQL Editor yourself
-- BEFORE (or after) applying this migration; it's deliberately not part
-- of the migration so the real key value never gets committed to git:
--
--   select vault.create_secret('https://<project-ref>.supabase.co/functions/v1/events-notify', 'events_notify_url');
--   select vault.create_secret('<the project anon key, i.e. VITE_SUPABASE_ANON_KEY>', 'events_notify_anon_key');
--
-- (the anon key is already public — it ships in the client bundle as
-- VITE_SUPABASE_ANON_KEY, see src/pages/admn/EventsTab.jsx — Vault here
-- is just a tidy place to keep it out of migration files, not a
-- secrecy requirement)
--
-- Also requires the `pg_cron` and `pg_net` extensions enabled for the
-- project — Dashboard -> Database -> Extensions if the CREATE EXTENSION
-- statements below aren't permitted to run directly on your plan.
-- ============================================================

ALTER TABLE public.event_registrations
  ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'send-event-reminders') THEN
    PERFORM cron.unschedule('send-event-reminders');
  END IF;
END $$;

SELECT cron.schedule(
  'send-event-reminders',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'events_notify_url'),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'events_notify_anon_key'),
      'apikey', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'events_notify_anon_key')
    ),
    body := jsonb_build_object('mode', 'send_due_reminders')
  ) AS request_id;
  $$
);
