-- ============================================================
-- onboarding_and_orgs migration
-- Run this in Supabase SQL Editor (or via supabase db push)
--
-- Adds: persona/tag onboarding fields on profiles, public-safe
-- profile_cards view for shareable profile pages, and a minimal
-- organizations/organization_members model for team/institute spaces.
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. PROFILES — onboarding fields
-- ─────────────────────────────────────────────
alter table public.profiles
  add column if not exists username                text unique,
  add column if not exists bio                      text,
  add column if not exists persona                  text,
  add column if not exists level                     text,
  add column if not exists level_confidence          text,
  add column if not exists country                   text,
  add column if not exists motivation                 text,
  add column if not exists learning_method            text,
  add column if not exists learning_modes             text[] not null default '{}',
  add column if not exists discipline                 text[] not null default '{}',
  add column if not exists intent                      text[] not null default '{}',
  add column if not exists work_type                   text,
  add column if not exists onboarding_completed        boolean not null default false,
  add column if not exists onboarding_completed_at     timestamptz,
  add column if not exists growth_stage                smallint not null default 0;

-- existing rows (pre-migration users) default onboarding_completed = false,
-- so their very next login is routed through onboarding same as a new signup.

create index if not exists profiles_username_idx on public.profiles (username);

-- ─────────────────────────────────────────────
-- 2. PUBLIC PROFILE_CARDS VIEW
--    exposes only public-safe columns (no email/phone) for the
--    shareable /u/:username page — anyone can read this, never
--    grant anon/authenticated direct SELECT on profiles.* itself
-- ─────────────────────────────────────────────
create or replace view public.profile_cards as
  select
    id, username, name, avatar_url, bio, persona, level, discipline, intent,
    work_type, learning_method, growth_stage, created_at
  from public.profiles
  where onboarding_completed = true and username is not null;

grant select on public.profile_cards to anon, authenticated;


-- ─────────────────────────────────────────────
-- 3. ORGANIZATIONS
--    one row per team/institute/company space, owned by a profile
-- ─────────────────────────────────────────────
create table if not exists public.organizations (
  id          uuid        primary key default gen_random_uuid(),
  owner_id    uuid        not null references public.profiles(id) on delete cascade,
  name        text        not null,
  slug        text        not null unique,
  org_type    text        not null check (org_type in ('institute', 'company')),
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

alter table public.organizations enable row level security;

drop policy if exists "organizations: owner full access" on public.organizations;
create policy "organizations: owner full access"
  on public.organizations for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- "organizations: members can read" policy is created further below, after
-- organization_members exists (this file runs top-to-bottom in one go).

drop trigger if exists organizations_updated_at on public.organizations;
create trigger organizations_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();


-- ─────────────────────────────────────────────
-- 4. ORGANIZATION_MEMBERS
--    membership + pending email invites
-- ─────────────────────────────────────────────
create table if not exists public.organization_members (
  id             uuid        primary key default gen_random_uuid(),
  org_id         uuid        not null references public.organizations(id) on delete cascade,
  user_id        uuid        references public.profiles(id) on delete cascade,
  invited_email  text,
  role           text        not null default 'member' check (role in ('owner', 'admin', 'member')),
  status         text        not null default 'active' check (status in ('pending', 'active')),
  created_at     timestamptz default now() not null,
  unique (org_id, user_id)
);

alter table public.organization_members enable row level security;

-- org owner manages membership (invite, remove, change role)
drop policy if exists "organization_members: owner manage" on public.organization_members;
create policy "organization_members: owner manage"
  on public.organization_members for all
  using (
    exists (
      select 1 from public.organizations o
      where o.id = organization_members.org_id and o.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.organizations o
      where o.id = organization_members.org_id and o.owner_id = auth.uid()
    )
  );

-- members can read the membership rows of orgs they belong to
drop policy if exists "organization_members: self read" on public.organization_members;
create policy "organization_members: self read"
  on public.organization_members for select
  using (auth.uid() = user_id);

-- now that organization_members exists, org members (not just the owner)
-- can read the parent organization row
drop policy if exists "organizations: members can read" on public.organizations;
create policy "organizations: members can read"
  on public.organizations for select
  using (
    exists (
      select 1 from public.organization_members m
      where m.org_id = organizations.id and m.user_id = auth.uid()
    )
  );
