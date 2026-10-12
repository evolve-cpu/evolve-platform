// Microsoft Clarity custom events (the Clarity tag itself is in index.html).
// Events show up in Clarity under Filters → Custom events and can be used
// as Funnel steps; tags (clarity "set") filter recordings by stage.
// Skipped during local dev so testing doesn't pollute the data, and a
// no-op if Clarity is blocked (ad blockers).

const enabled = () => !import.meta.env.DEV && typeof window !== "undefined" && typeof window.clarity === "function";

export function track(event, tags) {
  if (!enabled()) return;
  try {
    window.clarity("event", event);
    if (tags) for (const [k, v] of Object.entries(tags)) window.clarity("set", k, String(v));
  } catch {
    // analytics must never break the page
  }
}

// keep this session's recording even if Clarity would otherwise sample it out
export function keepRecording(reason) {
  if (!enabled()) return;
  try {
    window.clarity("upgrade", reason);
  } catch {
    // ignore
  }
}
