-- ============================================================
-- events_calendar_and_invites migration
-- Run this in Supabase SQL Editor (or via supabase db push)
--
-- Phase 3: backs the new supabase/functions/events-notify Edge Function.
-- events.google_calendar_event_id tracks the one real Google Calendar
-- event per row (created/updated by "sync_calendar" mode, idempotent).
-- event_registrations gains support for admin-invited people who may not
-- have an Evolve account yet (invitee_email/invitee_name, user_id now
-- nullable), a calendar_synced flag, and a source column distinguishing
-- self-registration from admin invites.
-- ============================================================

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS google_calendar_event_id TEXT;

ALTER TABLE public.event_registrations
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.event_registrations
  ADD COLUMN IF NOT EXISTS invitee_email    TEXT,
  ADD COLUMN IF NOT EXISTS invitee_name     TEXT,
  ADD COLUMN IF NOT EXISTS calendar_synced  BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS source           TEXT NOT NULL DEFAULT 'self';

ALTER TABLE public.event_registrations
  DROP CONSTRAINT IF EXISTS event_registrations_source_check;
ALTER TABLE public.event_registrations
  ADD CONSTRAINT event_registrations_source_check CHECK (source IN ('self', 'admin_invite'));

ALTER TABLE public.event_registrations
  DROP CONSTRAINT IF EXISTS event_registrations_has_identity_check;
ALTER TABLE public.event_registrations
  ADD CONSTRAINT event_registrations_has_identity_check
  CHECK (user_id IS NOT NULL OR invitee_email IS NOT NULL);

CREATE UNIQUE INDEX IF NOT EXISTS event_registrations_event_invitee_email_key
  ON public.event_registrations (event_id, invitee_email)
  WHERE invitee_email IS NOT NULL;
