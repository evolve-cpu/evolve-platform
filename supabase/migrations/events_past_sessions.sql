-- ============================================================
-- events_past_sessions migration
-- Run this in Supabase SQL Editor (or via supabase db push)
--
-- Fields for the "add past event" form in the admin Events tab
-- (src/pages/admn/EventsTab.jsx → PastEventForm) and the past-event
-- layout on the event page (src/pages/EventDetail.jsx → PastEventView).
--
-- attendee_count: the headline number shown under the title ("204
--   registered"). Entered by hand because most past sessions ran on
--   Luma / Zoom before registrations lived in event_registrations.
-- speakers: one entry per speaker for the "About the speakers" section —
--   [{name, role, bio, linkedin, photo_url}]. The older single-speaker
--   columns (speaker_name, speaker_bio, ...) are left as they are;
--   speaker_name doubles as the "by Abhinav & Nandini" byline.
-- ============================================================

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS attendee_count INTEGER CHECK (attendee_count >= 0),
  ADD COLUMN IF NOT EXISTS speakers JSONB NOT NULL DEFAULT '[]'::jsonb;
