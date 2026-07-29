-- ============================================================
-- org_updates_events_v2 migration
-- Run this in Supabase SQL Editor (or via supabase db push)
--
-- Extends org_updates_events.sql to back the redesigned "post a highlight"
-- and "edit calendar" modals on /institute/:slug:
--   - org_updates gets an optional image, uploaded to a new public bucket
--   - org_events gets description/format/multi-day fields, and a third
--     "no tag" audience state (no badge shown) alongside open/internal
-- ============================================================

-- ─────────────────────────────────────────────
-- org_updates — optional image on a highlight post
-- ─────────────────────────────────────────────
alter table public.org_updates
  add column if not exists image_url text;

insert into storage.buckets (id, name, public)
values ('org-update-images', 'org-update-images', true)
on conflict (id) do nothing;

drop policy if exists "org update images: public read" on storage.objects;
create policy "org update images: public read"
  on storage.objects for select
  to public
  using (bucket_id = 'org-update-images');

-- uploads are namespaced by org id (first path segment) — any active member
-- who's allowed to submit a highlight (admins + faculty, per org_updates'
-- own insert policy) can upload into their org's folder
drop policy if exists "org update images: members upload" on storage.objects;
create policy "org update images: members upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'org-update-images'
    and exists (
      select 1 from public.organization_members m
      where m.user_id = auth.uid()
        and m.status = 'active'
        and m.org_id::text = (storage.foldername(name))[1]
    )
  );

drop policy if exists "org update images: owner/admin delete" on storage.objects;
create policy "org update images: owner/admin delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'org-update-images'
    and exists (
      select 1 from public.organization_members m
      where m.user_id = auth.uid()
        and m.role in ('owner', 'admin')
        and m.org_id::text = (storage.foldername(name))[1]
    )
  );

-- ─────────────────────────────────────────────
-- org_events — description, format, multi-day, and a "no tag" audience
-- ─────────────────────────────────────────────
alter table public.org_events
  add column if not exists description text,
  add column if not exists format text check (format in ('offline', 'online', 'hybrid')) default 'offline',
  add column if not exists is_multi_day boolean not null default false,
  add column if not exists end_date date;

alter table public.org_events
  drop constraint if exists org_events_audience_check;
alter table public.org_events
  add constraint org_events_audience_check check (audience in ('open', 'internal', 'none'));
alter table public.org_events
  alter column audience set default 'none';

-- ─────────────────────────────────────────────
-- org_updates — faculty can see the pending-review queue too (not just
-- admins), so the "pending review" feed tab works for them. They still
-- can't approve/reject — that stays admin/owner-only via the existing
-- "org_updates: owner/admin manage" policy.
-- ─────────────────────────────────────────────
drop policy if exists "org_updates: faculty can read pending" on public.org_updates;
create policy "org_updates: faculty can read pending"
  on public.org_updates for select
  using (
    status = 'pending'
    and exists (
      select 1 from public.organization_members m
      where m.org_id = org_updates.org_id
        and m.user_id = auth.uid()
        and m.status = 'active'
        and m.member_type = 'faculty'
    )
  );

-- ─────────────────────────────────────────────
-- org_testimonials — link to a real evolve profile (optional), so admins
-- can search-and-autofill a person, and any non-admin member can add their
-- own testimonial (add-only — editing/removing stays owner/admin-only via
-- the existing "org_testimonials: owner/admin manage" policy)
-- ─────────────────────────────────────────────
alter table public.org_testimonials
  add column if not exists user_id uuid references public.profiles(id) on delete set null,
  add column if not exists avatar_url text;

drop policy if exists "org_testimonials: members can add their own" on public.org_testimonials;
create policy "org_testimonials: members can add their own"
  on public.org_testimonials for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.organization_members m
      where m.org_id = org_testimonials.org_id and m.user_id = auth.uid() and m.status = 'active'
    )
  );

-- ─────────────────────────────────────────────
-- organizations — who deleted a space, for the "scheduled for deletion"
-- recovery view on the new settings page. The owner can already read and
-- update their own org row regardless of deleted_at (see "organizations:
-- owner full access" in onboarding_and_orgs.sql, which isn't gated on
-- deleted_at) — so no RLS change is needed here, just the column.
--
-- Note: nothing in this codebase yet actually hard-deletes a space once
-- deleted_at is 14 days old — that requires a scheduled job (e.g. a
-- pg_cron task or edge function) which is out of scope for this
-- migration. Until that's added, a deleted space just stays soft-deleted
-- (restorable) indefinitely rather than being purged after 14 days.
-- ─────────────────────────────────────────────
alter table public.organizations
  add column if not exists deleted_by uuid references public.profiles(id) on delete set null;

-- ─────────────────────────────────────────────
-- organizations — split "owner full access" into per-command policies so
-- UPDATE can allow reassigning owner_id itself (transfer ownership),
-- without loosening INSERT (which must still stay owner_id = auth.uid(),
-- or anyone could insert a row claiming someone else as owner).
-- USING still requires the CURRENT owner to be the one making the change;
-- only the resulting row (checked by WITH CHECK) is unrestricted for
-- UPDATE, since USING already gatekept who can get this far.
-- ─────────────────────────────────────────────
drop policy if exists "organizations: owner full access" on public.organizations;

drop policy if exists "organizations: owner can select" on public.organizations;
create policy "organizations: owner can select"
  on public.organizations for select
  using (auth.uid() = owner_id);

drop policy if exists "organizations: owner can insert" on public.organizations;
create policy "organizations: owner can insert"
  on public.organizations for insert
  with check (auth.uid() = owner_id);

drop policy if exists "organizations: owner can update" on public.organizations;
create policy "organizations: owner can update"
  on public.organizations for update
  using (auth.uid() = owner_id)
  with check (true);

drop policy if exists "organizations: owner can delete" on public.organizations;
create policy "organizations: owner can delete"
  on public.organizations for delete
  using (auth.uid() = owner_id);
