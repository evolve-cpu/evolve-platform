-- ============================================================
-- verification_booking_url migration
-- Run this in Supabase SQL Editor (or via supabase db push)
-- Run AFTER profile_verification.sql and review_invite.sql.
--
-- Some cohorts (e.g. the invited MIT students, see review_invite.sql)
-- book their "Get evolve verified" 1:1 call on Calendly instead of
-- picking one of the admin-created verification_slots. The link is set
-- per profile by the backend (api/_manualGrant.js markReviewInvite) —
-- when it's present, the Verify flow's last step embeds that Calendly
-- page instead of the slot picker (src/components/profile/VerifyFlow.jsx).
-- ============================================================

alter table public.profiles
  add column if not exists verification_booking_url text;

-- admin-only, like verification_meet_link — a user can't point their own
-- verification call at some other link.
create or replace function public.protect_verification_booking_url()
returns trigger language plpgsql as $$
begin
  if auth.role() <> 'service_role' then
    new.verification_booking_url := old.verification_booking_url;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_verification_booking_url on public.profiles;
create trigger profiles_protect_verification_booking_url
  before update on public.profiles
  for each row execute function public.protect_verification_booking_url();

-- students already invited before this ran
update public.profiles
  set verification_booking_url = 'https://calendly.com/evolvedesignacademy/portfolioreview'
  where review_invite_at is not null
    and verification_booking_url is null;
