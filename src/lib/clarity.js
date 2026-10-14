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

// ── internal team ──────────────────────────────────────────────────────────
// The evolve team's own browsing was polluting Clarity. Anyone signed in
// with an @evolvedesign.academy address gets this browser flagged (and the
// current recording stopped); index.html then skips loading Clarity on it
// from the next page load on. Team members on a personal email can flag a
// browser by opening any page with ?notrack=1.
const NO_TRACK_KEY = "evolve_no_track";
const TEAM_DOMAIN = "@evolvedesign.academy";

export function isTeamEmail(email) {
  return typeof email === "string" && email.trim().toLowerCase().endsWith(TEAM_DOMAIN);
}

export function excludeIfTeam(email) {
  if (!isTeamEmail(email) || typeof window === "undefined") return;
  try {
    localStorage.setItem(NO_TRACK_KEY, "1");
  } catch {
    // private mode — this session still gets stopped below
  }
  try {
    if (typeof window.clarity === "function") window.clarity("stop");
  } catch {
    // ignore
  }
}

// ── cookie consent (src/components/CookieConsent.jsx) ─────────────────────
export const CONSENT_KEY = "evolve_cookie_consent";

export function applyConsent(accepted) {
  if (typeof window === "undefined") return;
  const v = accepted ? "granted" : "denied";
  try {
    if (typeof window.clarity === "function")
      window.clarity("consentv2", { ad_Storage: "denied", analytics_Storage: v });
  } catch {
    // ignore
  }
  try {
    if (typeof window.gtag === "function")
      window.gtag("consent", "update", { analytics_storage: v, ad_storage: "denied" });
  } catch {
    // ignore
  }
}
