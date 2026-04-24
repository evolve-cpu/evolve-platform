-- ============================================================
-- mentorship_profiles table
-- Run this in Supabase SQL Editor (or via supabase db push)
-- ============================================================

create table if not exists public.mentorship_profiles (
  user_id      uuid primary key references public.profiles(id) on delete cascade,
  name         text,
  email        text,
  batch_id     uuid references public.mentorship_batches(id) on delete set null,
  goal         text not null,
  linkedin_url text,
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null
);

-- RLS
alter table public.mentorship_profiles enable row level security;

create policy "users can insert own mentorship profile"
  on public.mentorship_profiles for insert
  with check (auth.uid() = user_id);

create policy "users can update own mentorship profile"
  on public.mentorship_profiles for update
  using (auth.uid() = user_id);

create policy "users can read own mentorship profile"
  on public.mentorship_profiles for select
  using (auth.uid() = user_id);

-- auto-update updated_at on upsert
create trigger mentorship_profiles_updated_at
  before update on public.mentorship_profiles
  for each row execute function public.set_updated_at();
