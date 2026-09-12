-- ============================================================
-- events + event_registrations migration
-- Run this in Supabase SQL Editor (or via supabase db push)
--
-- In-house replacement for Luma-managed webinars. Phase 1 (admin
-- creation/publish flow, see src/pages/admn/EventsTab.jsx) only reads and
-- writes via the service-role admin client, so `events` has no public
-- SELECT policy yet — that lands in Phase 2 alongside the public
-- /events/:slug page. `event_registrations` RLS is already shaped for
-- Phase 2 (auth.uid() = user_id) so registration can be wired up later
-- without another migration.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.events (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              TEXT        NOT NULL UNIQUE,
  title             TEXT        NOT NULL,
  description       TEXT,
  agenda            JSONB       NOT NULL DEFAULT '[]'::jsonb,
  speaker_name      TEXT,
  speaker_title     TEXT,
  speaker_bio       TEXT,
  speaker_photo_url TEXT,
  cover_image_url   TEXT,
  start_time        TIMESTAMPTZ NOT NULL,
  end_time          TIMESTAMPTZ,
  join_link         TEXT,
  capacity          INT,
  status            TEXT        NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS events_updated_at ON public.events;
CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.event_registrations (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id       UUID        NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id        UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  registered_at  TIMESTAMPTZ DEFAULT NOW(),
  status         TEXT        NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'cancelled')),
  UNIQUE (event_id, user_id)
);

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "event_registrations: own read" ON public.event_registrations;
CREATE POLICY "event_registrations: own read"
  ON public.event_registrations FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "event_registrations: own insert" ON public.event_registrations;
CREATE POLICY "event_registrations: own insert"
  ON public.event_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "event_registrations: own update" ON public.event_registrations;
CREATE POLICY "event_registrations: own update"
  ON public.event_registrations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- Storage bucket for cover images + speaker photos
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- Uploads happen from the admin panel via the service-role client, which
-- bypasses RLS, so only a public-read policy is needed here.
DROP POLICY IF EXISTS "event-images: public can read" ON storage.objects;
CREATE POLICY "event-images: public can read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'event-images');
