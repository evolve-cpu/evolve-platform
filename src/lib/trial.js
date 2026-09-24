// Free-trial helpers, driven by profiles.trial_ends_at (see
// supabase/migrations/profile_trial_period.sql). No subscription/payment
// tier exists yet — this only answers "are they still inside the 14-day
// window", nothing about what should be locked once it ends.

export function trialDaysLeft(trialEndsAt) {
  if (!trialEndsAt) return null;
  const ms = new Date(trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export function isTrialActive(trialEndsAt) {
  if (!trialEndsAt) return false;
  return new Date(trialEndsAt).getTime() > Date.now();
}
