-- ============================================================
-- membership_plans migration
-- Run this in Supabase SQL Editor (or via supabase db push)
-- Run AFTER profile_trial_period.sql, profile_verification.sql,
-- events*.sql and profile_links_sharing.sql.
--
-- What happens after the free trial (see evolve_mobile_after_trial.html):
--   • trial is now 30 days (was 14) — "30 days of VIP access"
--   • once it ends, a person is either
--       - pay as you go  (no plan): verified badge + public profile lock,
--         community events ₹20, webinars ₹150, past sessions ₹30 each;
--         daily news / microlearning / quizzes / AI assistant stay free
--       - on a plan (monthly / annual, priced by role student vs pro):
--         everything above unlocked, annual also gets 1 free portfolio review
--   • every paid unlock is a row in public.purchases, written only by the
--     server (api/razorpay-create-order.js, product: "membership") after a
--     verified Razorpay payment.
--
-- Access is enforced here, not just hidden in the UI:
--   • event_registrations insert is refused for a paid event unless the
--     person has full access or bought that event
--   • event recordings live in a PRIVATE storage bucket; a signed URL can
--     only be minted by someone with access (storage RLS below)
--   • profile_cards (the public profile) only exposes the AI profile while
--     the owner has full access
-- ============================================================


-- ── 1. 30-day trial ─────────────────────────────────────────────────────
alter table public.profiles
  alter column trial_ends_at set default (now() + interval '30 days');

-- everyone who'd still be inside a 30-day window gets the extra 16 days —
-- including anyone whose old 14-day trial had *just* run out (the original
-- backfill gave every pre-existing profile the same end time, so a whole
-- batch can lapse minutes before this runs). Guarded by a marker so
-- re-running this file doesn't keep extending it.
alter table public.profiles
  add column if not exists trial_extended_to_30 boolean not null default false;

update public.profiles
set trial_ends_at = trial_ends_at + interval '16 days',
    trial_extended_to_30 = true
where trial_extended_to_30 = false
  and trial_ends_at + interval '16 days' > now();


-- ── 2. plan state on the profile ────────────────────────────────────────
alter table public.profiles
  add column if not exists plan             text check (plan in ('monthly', 'annual')),
  add column if not exists plan_expires_at  timestamptz,
  add column if not exists review_credits   integer not null default 0;

-- plan fields are server-only (service role) — same trust boundary as
-- verification_status in profile_verification.sql.
create or replace function public.protect_plan_fields()
returns trigger language plpgsql as $$
begin
  if auth.role() <> 'service_role' then
    new.plan                 := old.plan;
    new.plan_expires_at      := old.plan_expires_at;
    new.review_credits       := old.review_credits;
    new.trial_ends_at        := old.trial_ends_at;
    new.trial_extended_to_30 := old.trial_extended_to_30;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_plan on public.profiles;
create trigger profiles_protect_plan
  before update on public.profiles
  for each row execute function public.protect_plan_fields();

-- "full access" = still on the trial, or on an active plan
create or replace function public.has_full_access(uid uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select (p.trial_ends_at > now()) or (p.plan_expires_at > now())
     from public.profiles p where p.id = uid),
    false
  );
$$;

grant execute on function public.has_full_access(uuid) to authenticated;


-- ── 3. purchases (one row per Razorpay order) ───────────────────────────
create table if not exists public.purchases (
  id                   uuid        primary key default gen_random_uuid(),
  user_id              uuid        not null references public.profiles(id) on delete cascade,
  kind                 text        not null check (kind in ('plan', 'event', 'recording')),
  plan                 text        check (plan in ('monthly', 'annual')),
  event_id             uuid        references public.events(id) on delete set null,
  title                text        not null default '',
  amount               integer     not null,             -- rupees
  currency             text        not null default 'INR',
  razorpay_order_id    text        unique,
  razorpay_payment_id  text,
  razorpay_signature   text,
  status               text        not null default 'pending'
                         check (status in ('pending', 'success', 'failed', 'refunded')),
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

create index if not exists purchases_user_idx on public.purchases(user_id, status);

alter table public.purchases enable row level security;

drop policy if exists "purchases: own read" on public.purchases;
create policy "purchases: own read"
  on public.purchases for select
  using (auth.uid() = user_id);
-- no insert/update policy — written by the server with the service role

drop trigger if exists purchases_updated_at on public.purchases;
create trigger purchases_updated_at
  before update on public.purchases
  for each row execute function public.set_updated_at();


-- ── 4. events: per-event pricing + past-event CMS fields ────────────────
-- price_inr / recording_price_inr: null = use the default for the type
-- (see src/lib/membership.js — AMA/Panel ₹20, Webinar/Workshop ₹150,
-- recording ₹30). 0 = free for everyone.
alter table public.events
  add column if not exists price_inr                integer check (price_inr >= 0),
  add column if not exists recording_price_inr      integer check (recording_price_inr >= 0),
  add column if not exists recording_path           text,   -- object path in the private event-recordings bucket
  add column if not exists recording_url            text,   -- OR an external player URL (Bunny / VdoCipher / Vimeo embed)
  add column if not exists recording_thumbnail_url  text,
  add column if not exists recording_duration_min   integer,
  add column if not exists guests                   jsonb not null default '[]'::jsonb;  -- [{name, title, photo_url}]

create or replace function public.event_price(e public.events)
returns integer language sql immutable as $$
  select coalesce(
    e.price_inr,
    case when e.event_type in ('Webinar', 'Workshop') then 150 else 20 end
  );
$$;

create or replace function public.recording_price(e public.events)
returns integer language sql immutable as $$
  select coalesce(e.recording_price_inr, 30);
$$;

create or replace function public.has_event_access(uid uuid, eid uuid, what text)
returns boolean
language plpgsql stable security definer set search_path = public as $$
declare
  ev public.events;
  price integer;
begin
  select * into ev from public.events where id = eid;
  if not found then return false; end if;

  price := case when what = 'recording' then public.recording_price(ev) else public.event_price(ev) end;
  if price = 0 then return true; end if;
  if public.has_full_access(uid) then return true; end if;

  return exists (
    select 1 from public.purchases
    where user_id = uid and event_id = eid and kind = what and status = 'success'
  );
end;
$$;

grant execute on function public.has_event_access(uuid, uuid, text) to authenticated;

-- registering for a paid event needs access (trial / plan / bought it)
create or replace function public.guard_event_registration()
returns trigger language plpgsql as $$
begin
  if auth.role() = 'service_role' then return new; end if;
  if not public.has_event_access(new.user_id, new.event_id, 'event') then
    raise exception 'payment required for this event' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists event_registrations_guard on public.event_registrations;
create trigger event_registrations_guard
  before insert on public.event_registrations
  for each row execute function public.guard_event_registration();


-- ── 5. private recordings bucket ────────────────────────────────────────
-- Objects are stored as "<event_id>/<file>". Admin uploads go through the
-- service-role client (bypasses RLS). A viewer can only mint a signed URL
-- (createSignedUrl needs SELECT on the object) if they have access.
insert into storage.buckets (id, name, public)
values ('event-recordings', 'event-recordings', false)
on conflict (id) do update set public = false;

drop policy if exists "event-recordings: entitled can read" on storage.objects;
create policy "event-recordings: entitled can read"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'event-recordings'
    and public.has_event_access(
      auth.uid(),
      ((storage.foldername(name))[1])::uuid,
      'recording'
    )
  );


-- ── 6. public profile only while the owner has full access ──────────────
-- After the trial, a pay-as-you-go profile goes private (the reference's
-- "Profile is private · Unlock with a plan"). ai_profile_public itself is
-- left as-is so buying a plan brings the page straight back.
create or replace view public.profile_cards as
  select
    id, username, name, avatar_url, bio, persona, level, discipline, intent,
    work_type, learning_method, growth_stage, created_at,
    case when ai_profile_public and (trial_ends_at > now() or plan_expires_at > now()) then portfolio_link end      as portfolio_link,
    case when ai_profile_public and (trial_ends_at > now() or plan_expires_at > now()) then portfolio_file_url end  as portfolio_file_url,
    case when ai_profile_public and (trial_ends_at > now() or plan_expires_at > now()) then resume_link end         as resume_link,
    case when ai_profile_public and (trial_ends_at > now() or plan_expires_at > now()) then resume_file_url end     as resume_file_url,
    case when ai_profile_public and (trial_ends_at > now() or plan_expires_at > now()) then social_links else '[]'::jsonb end as social_links,
    case when ai_profile_public and (trial_ends_at > now() or plan_expires_at > now()) then ai_profile end          as ai_profile
  from public.profiles
  where onboarding_completed = true and username is not null;

grant select on public.profile_cards to anon, authenticated;
