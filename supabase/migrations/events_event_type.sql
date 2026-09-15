-- ============================================================
-- events_event_type migration
-- Run this in Supabase SQL Editor (or via supabase db push)
--
-- Adds the event type set from the admin "New event" form (see
-- src/pages/admn/EventsTab.jsx) — shown as a badge on the public webinars
-- page (src/pages/Webinars.jsx). Defaults existing rows to "Webinar" since
-- that's all that existed before this column was introduced.
-- ============================================================

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS event_type TEXT NOT NULL DEFAULT 'Webinar'
    CHECK (event_type IN ('AMA', 'Webinar', 'Workshop', 'Panel Discussion'));
