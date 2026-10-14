-- ============================================================
-- community_sync_lease migration
-- Run this in Supabase SQL Editor (after community_posts.sql)
--
-- api/_discordCommunity.js now marks a Discord sync as "running" while it
-- works and only stamps last_synced_at once it finishes. A sync that gets
-- cut off frees the slot after a minute instead of blocking new posts.
-- The reset below makes the next visit to the Community tab sync straight
-- away.
-- ============================================================

ALTER TABLE public.community_sync_state
  ADD COLUMN IF NOT EXISTS sync_started_at TIMESTAMPTZ;

UPDATE public.community_sync_state
SET last_synced_at = NULL, sync_started_at = NULL
WHERE id = 1;
