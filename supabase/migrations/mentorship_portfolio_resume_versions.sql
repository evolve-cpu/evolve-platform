-- ============================================================
-- Portfolio & Resume versioning for mentorship session users
-- ============================================================

create table if not exists public.mentorship_portfolio_versions (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null references public.profiles(id) on delete cascade,
  batch_id         uuid        references public.mentorship_batches(id),
  version_number   int         not null,
  portfolio_url    text,
  walkthrough_url  text,
  notes            text,
  review_report_url text,
  review_remarks   text,
  created_at       timestamptz default now() not null,
  unique(user_id, version_number)
);

alter table public.mentorship_portfolio_versions enable row level security;

create policy "users can read own portfolio versions"
  on public.mentorship_portfolio_versions for select
  to authenticated using (auth.uid() = user_id);

create policy "users can insert own portfolio versions"
  on public.mentorship_portfolio_versions for insert
  to authenticated with check (auth.uid() = user_id);

-- ============================================================

create table if not exists public.mentorship_resume_versions (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null references public.profiles(id) on delete cascade,
  batch_id       uuid        references public.mentorship_batches(id),
  version_number int         not null,
  resume_url     text,
  notes          text,
  created_at     timestamptz default now() not null,
  unique(user_id, version_number)
);

alter table public.mentorship_resume_versions enable row level security;

create policy "users can read own resume versions"
  on public.mentorship_resume_versions for select
  to authenticated using (auth.uid() = user_id);

create policy "users can insert own resume versions"
  on public.mentorship_resume_versions for insert
  to authenticated with check (auth.uid() = user_id);

-- ============================================================
-- Add google_sheet_url to mentorship_batches for per-batch task links
-- ============================================================

alter table public.mentorship_batches
  add column if not exists google_sheet_url text;
