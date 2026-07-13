const NBSP = " ";

// Glues the last three words of a string together with non-breaking spaces
// so text wrapping never leaves fewer than 3 words on the final line —
// works regardless of container width/breakpoint since it just removes the
// break points that would let them separate.
export const preventWidow = (text) => {
  if (typeof text !== "string") return text;
  const words = text.split(" ");
  if (words.length < 2) return text;
  const tailCount = Math.min(3, words.length);
  const head = words.slice(0, words.length - tailCount);
  const tail = words.slice(words.length - tailCount).join(NBSP);
  return [...head, tail].join(" ");
};
