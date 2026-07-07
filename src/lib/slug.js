export function slugify(text) {
  return (text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "user";
}

/**
 * Finds a free slug by checking `table.column` for collisions, appending
 * -2, -3, … until one is free. Used for both profile usernames and org slugs.
 */
export async function findFreeSlug(supabase, table, column, base) {
  const root = slugify(base);
  let candidate = root;
  let suffix = 1;

  for (;;) {
    const { data } = await supabase.from(table).select(column).eq(column, candidate).maybeSingle();
    if (!data) return candidate;
    suffix += 1;
    candidate = `${root}-${suffix}`;
  }
}
