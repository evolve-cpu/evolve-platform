-- ============================================================
-- events_speaker_socials migration
-- Run this in Supabase SQL Editor (or via supabase db push)
--
-- Speaker social links for the public event detail page (see
-- src/pages/EventDetail.jsx). Stored as a plain array of URL strings —
-- the platform (LinkedIn, Instagram, ...) is detected from the URL itself
-- at render time, so there's nothing else to keep in sync here.
-- ============================================================

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS speaker_socials JSONB NOT NULL DEFAULT '[]'::jsonb;
