-- ============================================================
-- Storage bucket for "record" answers in the verification 3-step flow.
-- Private — these are personal voice notes, not portfolio work — same
-- shape as student-ids: owner can upload/read/replace their own files
-- under their own uid folder; admin review reads via the service-role
-- key (createSignedUrl), which bypasses RLS entirely.
-- Run in Supabase SQL Editor.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('verification-audio', 'verification-audio', false)
on conflict (id) do nothing;

drop policy if exists "verification audio: users upload to own folder" on storage.objects;
create policy "verification audio: users upload to own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'verification-audio'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "verification audio: users read own files" on storage.objects;
create policy "verification audio: users read own files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'verification-audio'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "verification audio: users update own files" on storage.objects;
create policy "verification audio: users update own files"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'verification-audio'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
