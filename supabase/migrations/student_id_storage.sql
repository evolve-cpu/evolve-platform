-- ============================================================
-- Storage bucket + RLS policies for student-ids
-- Run this in Supabase SQL Editor
--
-- Private bucket for student ID card uploads (image or PDF) captured during
-- onboarding. Unlike portfolio-files/evolve-portfolio-reviews, this bucket
-- is NOT public — ID cards are more sensitive PII than portfolio work.
-- Owners can read their own file (e.g. via createSignedUrl for preview);
-- the verify-student-id edge function reads via the service-role key,
-- which bypasses RLS entirely.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('student-ids', 'student-ids', false)
on conflict (id) do nothing;

drop policy if exists "student ids: users upload to own folder" on storage.objects;
create policy "student ids: users upload to own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'student-ids'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "student ids: users read own files" on storage.objects;
create policy "student ids: users read own files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'student-ids'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "student ids: users update own files" on storage.objects;
create policy "student ids: users update own files"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'student-ids'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "student ids: users delete own files" on storage.objects;
create policy "student ids: users delete own files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'student-ids'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
