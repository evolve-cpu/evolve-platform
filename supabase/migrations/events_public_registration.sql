-- ============================================================
-- events_public_registration migration
-- Run this in Supabase SQL Editor (or via supabase db push)
--
-- Phase 2 additions on top of events.sql: question_categories replaces the
-- flat `agenda` list in the admin UI (grouped "Question categories" shown
-- on the public event detail page, see src/pages/EventDetail.jsx), a public
-- read policy so the anon client can list/show published events, and the
-- optional question fields captured by the "You're almost in" registration
-- modal. `agenda` column is left in place, unused.
-- ============================================================

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS question_categories JSONB NOT NULL DEFAULT '[]'::jsonb;

DROP POLICY IF EXISTS "events: public can read published" ON public.events;
CREATE POLICY "events: public can read published"
  ON public.events FOR SELECT
  TO public
  USING (status = 'published');

ALTER TABLE public.event_registrations
  ADD COLUMN IF NOT EXISTS question_category  TEXT,
  ADD COLUMN IF NOT EXISTS question_text       TEXT,
  ADD COLUMN IF NOT EXISTS question_anonymous  BOOLEAN NOT NULL DEFAULT FALSE;
