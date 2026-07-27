-- ============================================================
-- org_public_page migration
-- Run this in Supabase SQL Editor (or via supabase db push)
--
-- Backs the public-facing institute page (separate from the owner/admin
-- dashboard at /space/:slug) — reachable at /institute/:slug by anyone,
-- member or not, as long as the org's visibility is 'public' (set in
-- settings > privacy & visibility). Adds:
--   - organizations: a "public can read" policy (previously only the
--     owner and existing members could read a row at all)
--   - organization_members: public orgs' active roster becomes readable
--     by anyone (needed for the public team directory tab)
--   - org_updates / org_events: public live/open-audience items readable
--   - org_testimonials: a new table for the public page's testimonials
--     card, owner/admin managed
-- ============================================================

-- organizations: public visibility opens read access to everyone
drop policy if exists "organizations: public can read" on public.organizations;
create policy "organizations: public can read"
  on public.organizations for select
  using (visibility = 'public' and deleted_at is null);

-- organization_members: the active roster of a public org is readable by anyone
drop policy if exists "organization_members: public org roster readable" on public.organization_members;
create policy "organization_members: public org roster readable"
  on public.organization_members for select
  using (
    status = 'active'
    and exists (
      select 1 from public.organizations o
      where o.id = organization_members.org_id and o.visibility = 'public' and o.deleted_at is null
    )
  );

-- org_updates: live posts from a public org are readable by anyone
drop policy if exists "org_updates: public can read live" on public.org_updates;
create policy "org_updates: public can read live"
  on public.org_updates for select
  using (
    status = 'live'
    and exists (
      select 1 from public.organizations o
      where o.id = org_updates.org_id and o.visibility = 'public' and o.deleted_at is null
    )
  );

-- org_events: open-audience events from a public org are readable by anyone
-- (audience = 'internal' stays visible only to members, via the existing policy)
drop policy if exists "org_events: public can read open" on public.org_events;
create policy "org_events: public can read open"
  on public.org_events for select
  using (
    audience = 'open'
    and exists (
      select 1 from public.organizations o
      where o.id = org_events.org_id and o.visibility = 'public' and o.deleted_at is null
    )
  );

-- ─────────────────────────────────────────────
-- org_testimonials — quotes shown on the public page
-- ─────────────────────────────────────────────
create table if not exists public.org_testimonials (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  quote       text not null,
  name        text not null,
  role        text,
  created_at  timestamptz not null default now()
);

create index if not exists org_testimonials_org_id_idx on public.org_testimonials (org_id);

alter table public.org_testimonials enable row level security;

drop policy if exists "org_testimonials: public can read" on public.org_testimonials;
create policy "org_testimonials: public can read"
  on public.org_testimonials for select
  using (
    exists (
      select 1 from public.organizations o
      where o.id = org_testimonials.org_id and o.visibility = 'public' and o.deleted_at is null
    )
  );

drop policy if exists "org_testimonials: members can read" on public.org_testimonials;
create policy "org_testimonials: members can read"
  on public.org_testimonials for select
  using (public.is_org_member(org_id));

drop policy if exists "org_testimonials: owner/admin manage" on public.org_testimonials;
create policy "org_testimonials: owner/admin manage"
  on public.org_testimonials for all
  using (
    exists (
      select 1 from public.organization_members m
      where m.org_id = org_testimonials.org_id and m.user_id = auth.uid() and m.role in ('owner', 'admin')
    )
  )
  with check (
    exists (
      select 1 from public.organization_members m
      where m.org_id = org_testimonials.org_id and m.user_id = auth.uid() and m.role in ('owner', 'admin')
    )
  );
