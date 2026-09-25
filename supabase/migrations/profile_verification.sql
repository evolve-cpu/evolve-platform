-- ============================================================
-- "Get evolve verified" flow: 2 short questions + a 1:1 call booking,
-- reviewed by an admin, who pastes a Meet link and later marks the
-- profile verified / needs-attention. Publishing (ai_profile_public)
-- is only allowed once verification_status = 'verified' — enforced by
-- a trigger, not just the UI, so a user can't flip it themselves.
-- Run in Supabase SQL Editor (or via supabase db push).
-- ============================================================

-- ── available call slots — admin-created (via supabaseAdmin, bypasses
--    RLS), user "claims" one with a conditional UPDATE (is_booked=false
--    → true) so two people can't win the same slot. ─────────────────────
create table if not exists public.verification_slots (
  id          uuid        primary key default gen_random_uuid(),
  starts_at   timestamptz not null,
  is_booked   boolean     not null default false,
  booked_by   uuid        references public.profiles(id) on delete set null,
  created_at  timestamptz default now()
);

alter table public.verification_slots enable row level security;

-- open slots are visible to anyone signed in (to pick from); a booked
-- slot is only visible to the person who booked it — never to other users.
create policy "verification_slots: read open or own"
  on public.verification_slots for select
  using (is_booked = false or booked_by = auth.uid());

-- claim an open slot for yourself — the USING clause means this can only
-- ever match a currently-open row, so a concurrent double-claim fails
-- (0 rows updated) instead of silently overwriting someone else's booking.
create policy "verification_slots: claim open slot"
  on public.verification_slots for update
  using (is_booked = false)
  with check (booked_by = auth.uid() and is_booked = true);

-- release your own booking (used by "Reschedule") — separate policy since
-- the claim policy's USING clause can never match an already-booked row.
create policy "verification_slots: release own slot"
  on public.verification_slots for update
  using (booked_by = auth.uid())
  with check (is_booked = false and booked_by is null);

-- no insert/delete policy for anon/authenticated — slots are admin-only
-- (created/removed via supabaseAdmin, same convention as EventsTab etc.)


-- ── verification state on the profile itself ────────────────────────────
alter table public.profiles
  add column if not exists verification_status       text
    check (verification_status in ('booked', 'verifying', 'verified', 'needs_attention'))
    default null,
  add column if not exists verification_answers       jsonb,
  add column if not exists verification_slot_id       uuid references public.verification_slots(id) on delete set null,
  add column if not exists verification_meet_link     text,
  add column if not exists verification_notes         text,
  add column if not exists verification_verified_at   timestamptz;

-- ── guardrails ────────────────────────────────────────────────────────
-- 1. Only two transitions are a *user's* to make: starting verification
--    (null → 'booked', done by the 3-step flow) and reapplying after a
--    rejection ('needs_attention' → null, the "re-upload & reapply"
--    button). Every other status value, plus the meet link / admin notes
--    / verified_at, are admin-only — set via supabaseAdmin (service role)
--    in the admin dashboard, same trust boundary as mentorship_payments.status.
-- 2. A profile can only go public once it's actually verified — this is
--    enforced here, not just hidden in the UI, so publishing can't be
--    forced by calling supabase.from('profiles').update() directly.
create or replace function public.protect_verification_fields()
returns trigger language plpgsql as $$
declare
  is_service_role boolean := auth.role() = 'service_role';
  user_allowed_transition boolean :=
    (old.verification_status is null and new.verification_status = 'booked')
    or (old.verification_status = 'needs_attention' and new.verification_status is null)
    or (new.verification_status is not distinct from old.verification_status);
begin
  if not is_service_role then
    if not user_allowed_transition then
      new.verification_status := old.verification_status;
    end if;

    new.verification_meet_link   := old.verification_meet_link;
    new.verification_notes       := old.verification_notes;
    new.verification_verified_at := old.verification_verified_at;

    -- reapplying clears the previous round's admin-set fields so a stale
    -- meet link / rejection note doesn't linger into the next attempt.
    if new.verification_status is null and old.verification_status is not null then
      new.verification_meet_link := null;
      new.verification_notes := null;
      new.verification_slot_id := null;
    end if;
  end if;

  if new.ai_profile_public = true and coalesce(new.verification_status, '') <> 'verified' then
    new.ai_profile_public := false;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_protect_verification on public.profiles;
create trigger profiles_protect_verification
  before update on public.profiles
  for each row execute function public.protect_verification_fields();
