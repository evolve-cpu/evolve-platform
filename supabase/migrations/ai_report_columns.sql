-- Add AI report columns to portfolio_reviews
-- Run in Supabase SQL Editor or via: supabase db push

alter table portfolio_reviews
  add column if not exists ai_report        jsonb,
  add column if not exists ai_report_status text check (
    ai_report_status in ('generating', 'ready', 'failed')
  ),
  add column if not exists ai_report_error  text;
