-- ============================================================
-- trial_rejoin_ledger migration
-- Run this in Supabase SQL Editor (or via supabase db push)
-- Run AFTER platform_entry_trial.sql.
--
-- Closes the "delete account, sign up again, get a fresh 30-day trial"
-- loophole. When a profile is deleted (avatar menu → Delete account, via
-- api/admin.js op delete_account or public.delete_own_account()), the time
-- left on its trial is written to public.trial_ledger, keyed by the
-- normalised email. When someone with that email enters the platform again,
-- public.start_trial() resumes the trial from where it stopped instead of
-- starting a new 30 days — a trial that had already run out stays over.
--
-- profiles.trial_resumed_at marks a resumed trial so the platform can tell
-- the person on arrival how many days they have left (PublicProfile.jsx →
-- the "welcome back" sheet in MembershipProvider.jsx).
-- ============================================================


-- ── 1. email normalisation ─────────────────────────────────────────────
-- lower-case, drop any +tag, and for Gmail drop the dots too — so
-- Jane.Doe+2@gmail.com and janedoe@gmail.com count as the same person.
create or replace function public.normalize_email(e text)
returns text language sql immutable as $$
  select case
    when e is null or position('@' in e) = 0 then lower(trim(e))
    else (
      with parts as (
        select split_part(lower(trim(e)), '@', 1) as local_part,
               split_part(lower(trim(e)), '@', 2) as domain
      )
      select
        case when domain in ('gmail.com', 'googlemail.com')
          then replace(split_part(local_part, '+', 1), '.', '')
          else split_part(local_part, '+', 1)
        end || '@' ||
        case when domain = 'googlemail.com' then 'gmail.com' else domain end
      from parts
    )
  end;
$$;


-- ── 2. the ledger ──────────────────────────────────────────────────────
-- No RLS policies on purpose: only the security-definer functions below
-- (and the service role) ever touch it.
create table if not exists public.trial_ledger (
  email            text        primary key,   -- normalize_email()
  trial_remaining  interval    not null,      -- what was left at deletion
  trial_ends_at    timestamptz,               -- for reference / support
  deleted_at       timestamptz not null default now()
);

alter table public.trial_ledger enable row level security;


-- ── 3. record the remaining trial when a profile is deleted ────────────
create or replace function public.record_trial_on_delete()
returns trigger
language plpgsql security definer set search_path = public, auth as $$
declare
  em text;
begin
  -- never entered the platform → no trial was used; leave any earlier
  -- ledger row (from a previous account) exactly as it is
  if old.trial_started_at is null then
    return old;
  end if;

  em := coalesce(old.email, (select u.email from auth.users u where u.id = old.id));
  if em is null then
    return old;
  end if;

  insert into public.trial_ledger (email, trial_remaining, trial_ends_at, deleted_at)
  values (
    public.normalize_email(em),
    greatest(coalesce(old.trial_ends_at, now()) - now(), interval '0'),
    old.trial_ends_at,
    now()
  )
  on conflict (email) do update
    set trial_remaining = least(public.trial_ledger.trial_remaining, excluded.trial_remaining),
        trial_ends_at   = excluded.trial_ends_at,
        deleted_at      = excluded.deleted_at;

  return old;
end;
$$;

drop trigger if exists profiles_record_trial_on_delete on public.profiles;
create trigger profiles_record_trial_on_delete
  before delete on public.profiles
  for each row execute function public.record_trial_on_delete();


-- ── 4. resumed-trial marker ────────────────────────────────────────────
alter table public.profiles
  add column if not exists trial_resumed_at timestamptz;

-- same guard as platform_entry_trial.sql, plus trial_resumed_at
create or replace function public.protect_plan_fields()
returns trigger language plpgsql as $$
begin
  if auth.role() <> 'service_role' then
    new.plan                 := old.plan;
    new.plan_expires_at      := old.plan_expires_at;
    new.review_credits       := old.review_credits;
    new.trial_extended_to_30 := old.trial_extended_to_30;
    if coalesce(current_setting('evolve.starting_trial', true), '') <> '1' then
      new.trial_ends_at    := old.trial_ends_at;
      new.trial_started_at := old.trial_started_at;
      new.trial_resumed_at := old.trial_resumed_at;
    end if;
  end if;
  return new;
end;
$$;


-- ── 5. start_trial() — resumes a previous account's trial if there was one
-- Same signature/return as before (PlatformApp.jsx reads the timestamptz).
create or replace function public.start_trial()
returns timestamptz
language plpgsql security definer set search_path = public, auth as $$
declare
  ends      timestamptz;
  em        text;
  remaining interval;
begin
  if auth.uid() is null then
    return null;
  end if;

  select u.email into em from auth.users u where u.id = auth.uid();
  if em is not null then
    select l.trial_remaining into remaining
    from public.trial_ledger l
    where l.email = public.normalize_email(em);
  end if;

  perform set_config('evolve.starting_trial', '1', true);

  update public.profiles
  set trial_started_at = now(),
      trial_ends_at    = now() + coalesce(remaining, interval '30 days'),
      trial_resumed_at = case when remaining is not null then now() else null end
  where id = auth.uid()
    and trial_started_at is null;

  perform set_config('evolve.starting_trial', '', true);

  select trial_ends_at into ends from public.profiles where id = auth.uid();
  return ends;
end;
$$;

grant execute on function public.start_trial() to authenticated;
