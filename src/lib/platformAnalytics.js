// First-party numbers for the admin "platform report" tab — tables and
// write functions in supabase/migrations/platform_analytics.sql, report in
// api/_platformReport.js. GA4/Clarity calls stay in src/utils/analytics.js
// and src/lib/clarity.js; this is the part we can count exactly.
//
//   trackVisit()            once per browser session, from main.jsx — before
//                           AuthContext strips the URL, so UTM tags survive
//   trackSignupCta(cta, at) "sign_in" / "start_for_free" clicks; the last one
//                           is also credited to the sign-up that follows
//   markSignupMethod(m)     right before a sign-in starts (survives the OAuth
//                           redirect), read back by trackSignup()
//   trackSignup(authUser)   new profile created (AuthContext)
//   pingActive(area)        signed-in heartbeat → DAU/MAU, and the platform
//                           area opened (profile/grow/events/community/
//                           portfolio_review/mentorship)
//   trackStep(path)         every route change (App.jsx), in order → journeys
//                           (supabase/migrations/platform_journeys.sql); plus a
//                           "leave" step when the tab is closed
//
// Skipped on local dev, on the Anant tenant, and on browsers flagged as the
// evolve team (src/lib/clarity.js). Without cookie consent the visitor id
// only lives for the session, so visits are still counted but not linked.
// Never throws — analytics must not break the page.

import { supabase } from "../supabaseClient";
import { isEvolve } from "../tenants/index.js";
import { CONSENT_KEY } from "./clarity";

const VISITOR_KEY = "evolve_visitor_id";
const VISIT_LOGGED_KEY = "evolve_visit_logged";
const LAST_CTA_KEY = "evolve_last_signup_cta";
const METHOD_KEY = "evolve_signup_method";
const PING_KEY = "evolve_active_ping";
const SESSION_KEY = "evolve_session";
const PENDING_MS = 60 * 60000; // a CTA / method older than an hour doesn't count
const SESSION_IDLE_MS = 30 * 60000; // a new session after 30 minutes idle

function store(kind) {
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

function enabled() {
  if (import.meta.env.DEV || typeof window === "undefined" || !isEvolve) return false;
  return store("local")?.getItem("evolve_no_track") !== "1";
}

function randomId() {
  return crypto.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function visitorId() {
  const consented = store("local")?.getItem(CONSENT_KEY) === "accepted";
  const s = store(consented ? "local" : "session");
  let id = s?.getItem(VISITOR_KEY);
  if (!id) {
    id = randomId();
    s?.setItem(VISITOR_KEY, id);
  }
  return id;
}

// one session per tab, renewed after 30 minutes without a step
function sessionId() {
  const s = store("session");
  let cur = null;
  try {
    cur = JSON.parse(s?.getItem(SESSION_KEY) || "null");
  } catch {
    // start a new one
  }
  if (!cur || Date.now() - cur.at > SESSION_IDLE_MS) cur = { id: randomId(), at: Date.now(), last: null };
  cur.at = Date.now();
  s?.setItem(SESSION_KEY, JSON.stringify(cur));
  return cur;
}

function saveSession(cur) {
  store("session")?.setItem(SESSION_KEY, JSON.stringify(cur));
}

function putPending(key, value) {
  store("local")?.setItem(key, JSON.stringify({ value, at: Date.now() }));
}

function takePending(key) {
  const s = store("local");
  const raw = s?.getItem(key);
  if (!raw) return null;
  s.removeItem(key);
  try {
    const { value, at } = JSON.parse(raw);
    return Date.now() - at < PENDING_MS ? value : null;
  } catch {
    return null;
  }
}

function rpc(name, args) {
  supabase.rpc(name, args).then(
    ({ error }) => error && console.warn(`${name}:`, error.message),
    () => {}
  );
}

export function trackVisit() {
  try {
    if (!enabled()) return;
    // closing the tab / leaving the site ends the journey (every page load,
    // reloads included). A plain fetch with keepalive outlives the page;
    // supabase.rpc can't promise that.
    window.addEventListener("pagehide", trackLeave);
    const session = store("session");
    if (session?.getItem(VISIT_LOGGED_KEY)) return;
    session?.setItem(VISIT_LOGGED_KEY, "1");

    const q = new URLSearchParams(window.location.search);
    const utm = {};
    for (const k of ["source", "medium", "campaign", "content", "term"]) {
      const v = q.get(`utm_${k}`);
      if (v) utm[k] = v;
    }
    // referrers from our own site are internal navigation, not a source
    const ref = document.referrer && !document.referrer.startsWith(window.location.origin) ? document.referrer : "";
    rpc("analytics_track_visit", {
      p_visitor: visitorId(),
      p_path: window.location.pathname,
      p_referrer: ref,
      p_utm: utm,
      p_session: sessionId().id
    });
  } catch {
    // ignore
  }
}

export function trackSignupCta(cta, location = "") {
  try {
    if (!enabled()) return;
    putPending(LAST_CTA_KEY, { cta, location });
    rpc("analytics_track_event", {
      p_visitor: visitorId(),
      p_event: "cta_click",
      p_props: { cta, location },
      p_path: window.location.pathname,
      p_session: sessionId().id
    });
  } catch {
    // ignore
  }
}

// google_one_tap | google | linkedin | email | discord
export function markSignupMethod(method) {
  try {
    putPending(METHOD_KEY, method);
  } catch {
    // ignore
  }
}

function methodFromProvider(provider) {
  if (provider === "linkedin_oidc") return "linkedin";
  return provider || "email";
}

/** Returns the method so AuthContext can store it on the new profile. */
export function trackSignup(authUser) {
  let method = methodFromProvider(authUser?.app_metadata?.provider);
  try {
    const marked = takePending(METHOD_KEY);
    // only trust the browser's mark when it agrees with the provider
    // (One Tap vs. Google redirect is the split auth can't tell us)
    if (marked && (marked === method || (method === "google" && marked === "google_one_tap"))) method = marked;
    const lastCta = takePending(LAST_CTA_KEY);
    if (enabled()) {
      rpc("analytics_track_event", {
        p_visitor: visitorId(),
        p_event: "signup",
        p_props: { method, cta: lastCta?.cta || null, cta_location: lastCta?.location || null },
        p_path: window.location.pathname,
        p_session: sessionId().id
      });
    }
  } catch {
    // ignore
  }
  return method;
}

// Daily heartbeat once per user per day; areas once per user per session.
export function pingActive(userId, area = null) {
  try {
    if (!enabled() || !userId) return;
    const day = new Date(Date.now() + 5.5 * 3600000).toISOString().slice(0, 10);
    const key = area ? `${PING_KEY}:${userId}:${area}` : `${PING_KEY}:${userId}`;
    const s = store(area ? "session" : "local");
    if (s?.getItem(key) === (area ? "1" : day)) return;
    s?.setItem(key, area ? "1" : day);
    rpc("analytics_ping", { p_area: area });
  } catch {
    // ignore
  }
}

export function trackStep(path) {
  try {
    if (!enabled() || path.startsWith("/admin")) return;
    const cur = sessionId();
    if (cur.last === path) return; // re-render / replace to the same page
    cur.last = path;
    saveSession(cur);
    rpc("analytics_track_step", { p_visitor: visitorId(), p_session: cur.id, p_kind: "page", p_path: path });
  } catch {
    // ignore
  }
}

function trackLeave() {
  try {
    if (!enabled()) return;
    const raw = store("session")?.getItem(SESSION_KEY);
    const cur = raw && JSON.parse(raw);
    if (!cur) return;
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !key) return;
    fetch(`${url}/rest/v1/rpc/analytics_track_step`, {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        p_visitor: visitorId(),
        p_session: cur.id,
        p_kind: "leave",
        p_path: window.location.pathname
      })
    }).catch(() => {});
    // coming back to this tab (bfcache) continues the session as a new page
    cur.last = null;
    saveSession(cur);
  } catch {
    // ignore
  }
}
