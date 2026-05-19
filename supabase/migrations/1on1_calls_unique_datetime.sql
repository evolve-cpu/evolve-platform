-- Prevent duplicate call rows for the same bonus + time slot.
-- Required for the Calendly webhook upsert (onConflict: "bonus_id,call_datetime").
ALTER TABLE public.mentorship_1on1_calls
  ADD CONSTRAINT mentorship_1on1_calls_bonus_datetime_unique
  UNIQUE (bonus_id, call_datetime);
