-- ============================================================
-- portfolio_reviews table
-- Run this in Supabase SQL Editor (or via supabase db push)
-- ============================================================

create table if not exists portfolio_reviews (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references profiles(id) on delete cascade not null,
  name                text not null,
  email               text not null,
  portfolio_link      text,          -- behance / figma / notion / personal site
  portfolio_file_url  text,          -- public URL from Supabase Storage (if file uploaded)
  walkthrough_link    text not null, -- loom or drive link
  notes               text,          -- optional "anything we should know?"
  created_at          timestamptz default now() not null
);

-- Only one of portfolio_link / portfolio_file_url must be filled
alter table portfolio_reviews
  add constraint portfolio_reviews_source_check
  check (
    (portfolio_link is not null and portfolio_file_url is null) or
    (portfolio_link is null and portfolio_file_url is not null)
  );

-- RLS
alter table portfolio_reviews enable row level security;

-- Users can insert their own submissions
create policy "users can insert own review"
  on portfolio_reviews for insert
  with check (auth.uid() = user_id);

-- Users can read their own submissions
create policy "users can read own review"
  on portfolio_reviews for select
  using (auth.uid() = user_id);

-- Service role (admin) can read all
-- (create a separate admin policy via Supabase dashboard if needed)

-- ============================================================
-- Storage bucket for portfolio file uploads
-- Run this ONCE in Supabase SQL Editor
-- ============================================================

insert into storage.buckets (id, name, public)
values ('portfolio-files', 'portfolio-files', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload to their own folder
create policy "auth users can upload portfolio files"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'portfolio-files' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Public read (since bucket is public)
create policy "portfolio files are publicly readable"
  on storage.objects for select
  using (bucket_id = 'portfolio-files');
