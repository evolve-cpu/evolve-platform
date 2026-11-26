-- ============================================================
-- AI profile reviews — voice input + one review per profile build.
-- Run after ai_profile_reviews.sql (Supabase SQL Editor).
-- ============================================================

-- what the reviewer said (all recordings for this review, in order).
-- Audio itself is never stored — only this transcript.
alter table public.ai_profile_reviews
  add column if not exists voice_transcript text;

-- was this correction pre-filled from voice (then checked by the reviewer)
-- or entered by hand? Lets us compare the two later.
alter table public.ai_profile_review_items
  add column if not exists from_voice boolean not null default false;

-- A given AI profile build is reviewed once. Regenerating the profile
-- (new generated_at) opens it up for a fresh review. Enforced here so two
-- reviewers submitting at the same time can't both land.
create unique index if not exists ai_profile_reviews_one_per_build
  on public.ai_profile_reviews (user_id, profile_generated_at)
  where profile_generated_at is not null;
