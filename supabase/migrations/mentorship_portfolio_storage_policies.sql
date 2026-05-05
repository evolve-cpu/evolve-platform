-- ============================================================
-- Storage RLS policies for mentorship-portfolios bucket
-- Run this in Supabase SQL Editor
-- ============================================================

-- Allow authenticated users to upload files into their own subfolder
create policy "users can upload to own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'mentorship-portfolios'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow public read (bucket is public)
create policy "public can read mentorship portfolios"
  on storage.objects for select
  to public
  using (bucket_id = 'mentorship-portfolios');

-- Allow users to replace/update their own files
create policy "users can update own files"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'mentorship-portfolios'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own files
create policy "users can delete own files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'mentorship-portfolios'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
