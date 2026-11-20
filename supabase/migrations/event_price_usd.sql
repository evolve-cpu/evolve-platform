-- International (USD) price for live events.
--
-- Buyers outside India (picked from the browser timezone, same as
-- Typetober) pay this in USD instead of price_inr. null = $1 default.
-- Only applies when the event is paid at all: price_inr = 0 (or a 0
-- default) still means free for everyone, and access checks
-- (has_event_access) are unchanged — a USD purchase row grants access the
-- same way an INR one does.
alter table public.events
  add column if not exists price_usd integer check (price_usd >= 1);

-- purchases.currency already exists (default 'INR'); USD rows store the
-- amount in whole dollars.
