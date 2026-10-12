-- ============================================================
-- events_recording_links migration
-- Run this in Supabase SQL Editor (or via supabase db push),
-- after membership_plans.sql.
--
-- Past-event recording links (Unlisted YouTube, Bunny, Vimeo...) used to
-- sit in events.recording_url, which every visitor reads with
-- select("*"), so anyone could pull an Unlisted YouTube link out of the
-- page and watch it on youtube.com without paying. They now live in their
-- own table that RLS only lets entitled viewers read, using the same
-- has_event_access() check as the private recordings bucket.
--
-- events.has_recording_link stays public so lists can still say
-- "Recorded" and the page knows to show the player / unlock card.
-- Admin writes go through the service-role client (bypasses RLS).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.event_recording_links (
  event_id   UUID PRIMARY KEY REFERENCES public.events(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.event_recording_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "event_recording_links: entitled can read" ON public.event_recording_links;
CREATE POLICY "event_recording_links: entitled can read"
  ON public.event_recording_links FOR SELECT
  TO authenticated
  USING (public.has_event_access(auth.uid(), event_id, 'recording'));

GRANT SELECT ON public.event_recording_links TO authenticated;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS has_recording_link BOOLEAN NOT NULL DEFAULT false;

-- move existing links off the public row
INSERT INTO public.event_recording_links (event_id, url)
SELECT id, recording_url FROM public.events WHERE recording_url IS NOT NULL
ON CONFLICT (event_id) DO UPDATE SET url = EXCLUDED.url, updated_at = now();

UPDATE public.events
SET has_recording_link = true, recording_url = NULL
WHERE recording_url IS NOT NULL;
