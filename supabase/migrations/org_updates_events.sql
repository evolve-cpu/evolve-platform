-- ============================================================
-- org_updates_events migration
-- Run this in Supabase SQL Editor (or via supabase db push)
--
-- Backs the "updates" tab: institute highlights (a moderated feed — admins
-- and faculty submit, owner/admin approve or remove) and a calendar of
-- exam/event/deadline/result dates.
-- ============================================================

-- ─────────────────────────────────────────────
-- org_updates — the moderated highlights feed
-- ─────────────────────────────────────────────
create table if not exists public.org_updates (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations(id) on delete cascade,
  author_id     uuid references public.profiles(id) on delete set null,
  title         text not null,
  description   text,
  status        text not null default 'pending' check (status in ('pending', 'live')),
  created_at    timestamptz not null default now(),
  published_at  timestamptz
);

create index if not exists org_updates_org_id_idx on public.org_updates (org_id);

alter table public.org_updates enable row level security;

drop policy if exists "org_updates: members can read live" on public.org_updates;
create policy "org_updates: members can read live"
  on public.org_updates for select
  using (
    status = 'live'
    and exists (
      select 1 from public.organization_members m
      where m.org_id = org_updates.org_id and m.user_id = auth.uid()
    )
  );

-- owner/admin can read, insert (any status), update, delete everything
drop policy if exists "org_updates: owner/admin manage" on public.org_updates;
create policy "org_updates: owner/admin manage"
  on public.org_updates for all
  using (
    exists (
      select 1 from public.organization_members m
      where m.org_id = org_updates.org_id and m.user_id = auth.uid() and m.role in ('owner', 'admin')
    )
  )
  with check (
    exists (
      select 1 from public.organization_members m
      where m.org_id = org_updates.org_id and m.user_id = auth.uid() and m.role in ('owner', 'admin')
    )
  );

-- any active member (e.g. faculty) can submit — always lands as pending
drop policy if exists "org_updates: members can submit" on public.org_updates;
create policy "org_updates: members can submit"
  on public.org_updates for insert
  with check (
    status = 'pending'
    and exists (
      select 1 from public.organization_members m
      where m.org_id = org_updates.org_id and m.user_id = auth.uid() and m.status = 'active'
    )
  );

-- ─────────────────────────────────────────────
-- org_events — the "mark your calendar" list
-- ─────────────────────────────────────────────
create table if not exists public.org_events (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  title       text not null,
  event_date  date not null,
  meta        text,
  type        text not null default 'event' check (type in ('exam', 'event', 'deadline', 'result')),
  audience    text not null default 'open' check (audience in ('open', 'internal')),
  created_at  timestamptz not null default now()
);

create index if not exists org_events_org_id_idx on public.org_events (org_id);

alter table public.org_events enable row level security;

drop policy if exists "org_events: members can read" on public.org_events;
create policy "org_events: members can read"
  on public.org_events for select
  using (
    exists (
      select 1 from public.organization_members m
      where m.org_id = org_events.org_id and m.user_id = auth.uid()
    )
  );

drop policy if exists "org_events: owner/admin manage" on public.org_events;
create policy "org_events: owner/admin manage"
  on public.org_events for all
  using (
    exists (
      select 1 from public.organization_members m
      where m.org_id = org_events.org_id and m.user_id = auth.uid() and m.role in ('owner', 'admin')
    )
  )
  with check (
    exists (
      select 1 from public.organization_members m
      where m.org_id = org_events.org_id and m.user_id = auth.uid() and m.role in ('owner', 'admin')
    )
  );
