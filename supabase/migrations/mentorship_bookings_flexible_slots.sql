-- ============================================================
-- mentorship_bookings_flexible_slots migration
-- Run this in Supabase SQL Editor (or via supabase db push)
--
-- Some learners get custom availability on "Book a slot" (see
-- src/components/programmes/mentorship/mentorshipSlotConfig.js), e.g.
-- Mon–Fri, any hour 10 PM–10 AM IST. The original CHECKs only allowed
-- Mon–Thu and 9/10/11 PM, so widen them to Mon–Fri and any "H:MM AM/PM"
-- (the format events-notify's weeklySessionTimes parses).
-- ============================================================

ALTER TABLE public.mentorship_bookings
  DROP CONSTRAINT IF EXISTS mentorship_bookings_preferred_day_check,
  DROP CONSTRAINT IF EXISTS mentorship_bookings_preferred_time_check;

ALTER TABLE public.mentorship_bookings
  ADD CONSTRAINT mentorship_bookings_preferred_day_check
    CHECK (preferred_day IN ('Mon', 'Tue', 'Wed', 'Thu', 'Fri')),
  ADD CONSTRAINT mentorship_bookings_preferred_time_check
    CHECK (preferred_time ~ '^(1[0-2]|[1-9]):[0-5][0-9] (AM|PM)$');
