// Joins the last two words with a non-breaking space so a paragraph never ends
// on a single orphaned word. Fallback for browsers without `text-wrap: pretty`
// (older iOS Safari); harmless where that CSS already applies.
export const noWidow = (text) =>
  typeof text === "string" ? text.replace(/\s+(\S+)\s*$/, "\u00A0$1") : text;
