-- ============================================================
-- Storage bucket + RLS policies for evolve-portfolio-reviews
-- Run this in Supabase SQL Editor
--
-- Dedicated bucket for the evolve Portfolio Review workspace
-- (resumes/portfolios uploaded by students, report PDFs uploaded by
-- admins). Modeled on mentorship_portfolio_storage_policies.sql.
-- Paths: {user_id}/resume/..., {user_id}/portfolio/..., and
-- {user_id}/report/{review_id}.pdf (admin-uploaded, via service role).
-- ============================================================

insert into storage.buckets (id, name, public)
values ('evolve-portfolio-reviews', 'evolve-portfolio-reviews', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload files into their own subfolder
drop policy if exists "evolve reviews: users upload to own folder" on storage.objects;
create policy "evolve reviews: users upload to own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'evolve-portfolio-reviews'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow public read (bucket is public — same as mentorship-portfolios / review-reports)
drop policy if exists "evolve reviews: public can read" on storage.objects;
create policy "evolve reviews: public can read"
  on storage.objects for select
  to public
  using (bucket_id = 'evolve-portfolio-reviews');

-- Allow users to replace/update their own files
drop policy if exists "evolve reviews: users update own files" on storage.objects;
create policy "evolve reviews: users update own files"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'evolve-portfolio-reviews'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own files
drop policy if exists "evolve reviews: users delete own files" on storage.objects;
create policy "evolve reviews: users delete own files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'evolve-portfolio-reviews'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
