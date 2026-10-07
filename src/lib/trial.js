// Free-trial helpers, driven by profiles.trial_ends_at (see
// supabase/migrations/profile_trial_period.sql, extended to 30 days in
// membership_plans.sql). What's locked once it ends — and what a plan
// unlocks — lives in src/lib/membership.js.

export const TRIAL_DAYS = 30;

export function trialDaysLeft(trialEndsAt) {
  if (!trialEndsAt) return null;
  const ms = new Date(trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export function isTrialActive(trialEndsAt) {
  if (!trialEndsAt) return false;
  return new Date(trialEndsAt).getTime() > Date.now();
}
