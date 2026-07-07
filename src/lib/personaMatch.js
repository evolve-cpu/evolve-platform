// Reusable matching primitive between a user's onboarding-derived persona
// tags and a content item's tags. No content/CMS tables exist yet — this is
// the extension point for whenever backend content gets tagged with the same
// persona/discipline/intent/level vocabulary captured during onboarding.

function overlaps(a = [], b = []) {
  if (!a.length || !b.length) return false;
  const set = new Set(a.map(v => String(v).toLowerCase()));
  return b.some(v => set.has(String(v).toLowerCase()));
}

/**
 * @param {object} profile - a user profile with persona/level/discipline/intent
 * @param {string[]} contentTags - tags attached to a piece of content
 * @returns {boolean} true if the content should be surfaced to this profile
 */
export function matchesAudience(profile, contentTags = []) {
  if (!profile || !contentTags?.length) return false;

  const profileTags = [
    profile.persona,
    profile.level,
    ...(profile.discipline || []),
    ...(profile.intent || [])
  ].filter(Boolean);

  return overlaps(profileTags, contentTags);
}
