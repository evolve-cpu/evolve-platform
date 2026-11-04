-- ============================================================
-- events_registration_controls migration
-- Run this in Supabase SQL Editor (or via supabase db push),
-- after membership_plans.sql.
--
-- Admin Events tab additions (src/pages/admn/EventsTab.jsx) and the
-- registration flow on src/pages/EventDetail.jsx:
--
--   requires_approval     registrations land as 'pending' until an admin
--                         approves them (then 'registered') or declines
--                         them ('rejected')
--   registration_open     admin switch to turn registration off
--   registration_closes_at  registration closes on its own at this time
--   about_sections        extra sections under "About the session":
--                         [{title, body}]
--   collect_speaker_question  show the AMA-style "question category /
--                         question / anonymous" fields when registering
--   registration_questions  custom questions asked when registering:
--                         [{id, type, label, required, ...}] — see
--                         QUESTION_TYPES in EventsTab.jsx
--   series_id, recurrence recurring sessions. Every occurrence is its own
--                         row (own slug, registrations, reminders, calendar
--                         event); rows sharing a series_id are one series.
--                         recurrence = {freq, interval, weekdays, ends:
--                         {type: never|on|after, date, count}}. Open-ended
--                         series are topped up by events-notify's
--                         send_due_reminders cron run.
--
-- event_registrations gains the custom answers, UTM tags + referrer the
-- person arrived with, attended (marked by an admin after the session),
-- and reviewed_at for approvals.
--
-- Status rules are enforced here, not in the client: a self-registration
-- can only ever start as 'registered' (or 'pending' on an approval event),
-- is refused once registration is closed or the event is full, and a
-- person can only change their own row to 'cancelled'.
-- ============================================================

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS requires_approval        BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS registration_open        BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS registration_closes_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS about_sections           JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS collect_speaker_question BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS registration_questions   JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS series_id                UUID,
  ADD COLUMN IF NOT EXISTS recurrence               JSONB;

CREATE INDEX IF NOT EXISTS events_series_id_idx ON public.events (series_id) WHERE series_id IS NOT NULL;

ALTER TABLE public.event_registrations
  ADD COLUMN IF NOT EXISTS answers       JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS utm_source    TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium    TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign  TEXT,
  ADD COLUMN IF NOT EXISTS utm_content   TEXT,
  ADD COLUMN IF NOT EXISTS utm_term      TEXT,
  ADD COLUMN IF NOT EXISTS referrer      TEXT,
  ADD COLUMN IF NOT EXISTS attended      BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS reviewed_at   TIMESTAMPTZ;

ALTER TABLE public.event_registrations
  DROP CONSTRAINT IF EXISTS event_registrations_status_check;
ALTER TABLE public.event_registrations
  ADD CONSTRAINT event_registrations_status_check
  CHECK (status IN ('registered', 'pending', 'rejected', 'cancelled'));

-- ── registration rules ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.event_registration_rules()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  ev public.events;
  going INTEGER;
BEGIN
  IF auth.role() = 'service_role' THEN RETURN NEW; END IF;

  IF TG_OP = 'UPDATE' THEN
    -- people may cancel their own registration, nothing else
    IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status <> 'cancelled' THEN
      RAISE EXCEPTION 'registration status can only be changed by the evolve team' USING errcode = 'P0001';
    END IF;
    NEW.attended := OLD.attended;
    NEW.reviewed_at := OLD.reviewed_at;
    RETURN NEW;
  END IF;

  SELECT * INTO ev FROM public.events WHERE id = NEW.event_id;
  IF NOT FOUND OR ev.status <> 'published' THEN
    RAISE EXCEPTION 'this event is not open for registration' USING errcode = 'P0001';
  END IF;

  IF NOT ev.registration_open
     OR (ev.registration_closes_at IS NOT NULL AND ev.registration_closes_at <= now())
     OR COALESCE(ev.end_time, ev.start_time + interval '1 hour') <= now() THEN
    RAISE EXCEPTION 'registrations are closed for this event' USING errcode = 'P0001';
  END IF;

  NEW.attended := FALSE;
  NEW.reviewed_at := NULL;
  NEW.source := 'self';

  IF ev.requires_approval THEN
    -- capacity is checked when an admin approves, not when requesting
    NEW.status := 'pending';
    RETURN NEW;
  END IF;

  IF ev.capacity IS NOT NULL THEN
    SELECT count(*) INTO going FROM public.event_registrations
    WHERE event_id = ev.id AND status = 'registered';
    IF going >= ev.capacity THEN
      RAISE EXCEPTION 'this event is full' USING errcode = 'P0001';
    END IF;
  END IF;

  NEW.status := 'registered';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS event_registrations_rules ON public.event_registrations;
CREATE TRIGGER event_registrations_rules
  BEFORE INSERT OR UPDATE ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION public.event_registration_rules();

-- ── public "N going" counts ────────────────────────────────────────────
-- event_registrations RLS only lets people read their own row, so a plain
-- count from the browser only ever saw 0 or 1. This returns the real
-- number of confirmed registrations for published events.
CREATE OR REPLACE FUNCTION public.event_going_counts(event_ids UUID[])
RETURNS TABLE (event_id UUID, going INTEGER)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.event_id, count(*)::int
  FROM public.event_registrations r
  JOIN public.events e ON e.id = r.event_id AND e.status = 'published'
  WHERE r.event_id = ANY(event_ids) AND r.status = 'registered'
  GROUP BY r.event_id;
$$;

GRANT EXECUTE ON FUNCTION public.event_going_counts(UUID[]) TO anon, authenticated;
