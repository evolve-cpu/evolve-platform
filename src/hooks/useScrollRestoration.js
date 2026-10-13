import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// Per-history-entry scroll restoration for the SPA.
//
// Native scroll restoration is switched off (history.scrollRestoration =
// "manual") because the browser restores before our lazy routes / images have
// rendered, so it lands in the wrong place. Instead:
//   - every history entry (location.key) remembers its last window.scrollY
//   - a fresh navigation (PUSH / REPLACE to a new path) starts at the top
//   - Back / Forward (POP) puts the visitor back where they were — e.g. click
//     "Know more" halfway down the home page → sign-in → Back lands on that
//     same section instead of the hero.
//
// Positions live in sessionStorage too, so they survive a reload in between.

const STORAGE_KEY = "evolve_scroll_positions";
const MAX_ENTRIES = 50;
// Keep re-applying the target while the page is still growing (lazy chunks,
// images, framer-motion layout). Stop once it has held still for SETTLE_MS,
// or after RESTORE_TIMEOUT_MS no matter what.
const RESTORE_TIMEOUT_MS = 2500;
const SETTLE_MS = 400;

const readPositions = () => {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
};

const writePositions = (positions) => {
  try {
    const keys = Object.keys(positions);
    if (keys.length > MAX_ENTRIES) {
      keys
        .slice(0, keys.length - MAX_ENTRIES)
        .forEach((k) => delete positions[k]);
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  } catch {
    // storage full / blocked — in-memory positions still work this session
  }
};

// The nav menu and LoadingScreen lock the page with body{position:fixed},
// which drops window.scrollY to 0 — that's not a real scroll position.
const isScrollLocked = () => document.body.style.position === "fixed";

const scrollToY = (y) =>
  // "instant" — the site sets scroll-behavior: smooth, which would otherwise
  // animate from the top down to the restored spot
  window.scrollTo({ top: y, left: 0, behavior: "instant" });

export default function useScrollRestoration({ skipPaths = [] } = {}) {
  const location = useLocation();
  const navigationType = useNavigationType();

  const positionsRef = useRef(null);
  if (positionsRef.current === null) positionsRef.current = readPositions();
  const currentKeyRef = useRef(location.key);
  const prevPathRef = useRef(location.pathname);
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // Record the current entry's scroll position as the visitor scrolls.
  useEffect(() => {
    let frame = 0;
    let persistTimer = 0;

    const persist = () => {
      clearTimeout(persistTimer);
      writePositions(positionsRef.current);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (isScrollLocked()) return;
        // re-insert so the most recently used entries survive pruning
        delete positionsRef.current[currentKeyRef.current];
        positionsRef.current[currentKeyRef.current] = window.scrollY;
        clearTimeout(persistTimer);
        persistTimer = setTimeout(persist, 250);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", persist);
    return () => {
      cancelAnimationFrame(frame);
      persist();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", persist);
    };
  }, []);

  // On navigation: restore (POP) or reset to top (new path).
  useLayoutEffect(() => {
    const pathChanged = prevPathRef.current !== location.pathname;
    prevPathRef.current = location.pathname;
    currentKeyRef.current = location.key;

    // Initial page load: leave it to the page (and LoadingScreen) as before.
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    // Pages that manage their own position (e.g. the /designers scene pager)
    if (skipPaths.includes(location.pathname)) return;

    // Read the target now, before the new page's own scroll events can
    // overwrite this entry's saved value.
    const target =
      navigationType === "POP" ? positionsRef.current[location.key] : undefined;

    if (target === undefined) {
      if (!pathChanged) return; // query/hash-only change — don't jump
      const frame = requestAnimationFrame(() => scrollToY(0));
      return () => cancelAnimationFrame(frame);
    }

    // Restore, retrying while the page is still laying out. Bail out as soon
    // as the visitor scrolls themselves so we never fight them.
    let frame = 0;
    let cancelled = false;
    const start = performance.now();
    let settledSince = 0;

    const stop = () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("keydown", stop);
    };

    const tick = () => {
      if (cancelled) return;
      const now = performance.now();
      if (!isScrollLocked() && Math.abs(window.scrollY - target) > 1) {
        scrollToY(target);
        settledSince = 0;
      } else if (!settledSince) {
        settledSince = now;
      }
      const settled = settledSince && now - settledSince >= SETTLE_MS;
      if (settled || now - start >= RESTORE_TIMEOUT_MS) return stop();
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    window.addEventListener("keydown", stop);
    frame = requestAnimationFrame(tick);
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);
}
