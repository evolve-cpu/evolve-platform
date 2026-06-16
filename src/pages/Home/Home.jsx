import React, {
  useLayoutEffect,
  useRef,
  useState,
  useEffect,
  useMemo,
  lazy,
  Suspense,
  useCallback
} from "react";
import { gsap } from "gsap";
import { useNavigationType, useLocation } from "react-router-dom";
import SEO from "../../components/SEO";
import { homeTicker as TICKER } from "../../content";
import GrainTexture from "../../components/GrainTexture";
import Scene2_refined from "./Scene2_refined";
import Scene3_refined from "./Scene3_refined";
import Scene4_refined from "./Scene4_refined";
import Scene1_4, { useScene1_4Timeline } from "./Scene1_4";

const Scene1 = lazy(() => import("./Scene1"));

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Sections after intro: 0=Scene2, 1=Scene3, 2=Scene4, 3=Scene1_4
const TOTAL_SECTIONS = 3;

// Generated fresh on every page load / reload (module re-executes).
// Used to distinguish "back-button within same session" from "reload".
const SESSION_ID = Math.random().toString(36).slice(2);

const Home = ({
  forceLayout = "auto",
  setShowNavbar,
  isLoading,
  deviceType,
  onIntroComplete
}) => {
  const containerRef = useRef(null);

  // Scene container refs
  const scene1ContainerRef = useRef(null);
  const scene2Ref = useRef(null);
  const scene3Ref = useRef(null);
  const scene4Ref = useRef(null);
  const scene1_4Refs = useRef({});

  // ── Session restoration ────────────────────────────────────────────────────
  const navigationType = useNavigationType();
  const location = useLocation();

  // Computed once on mount: which section to restore (–1 = play intro normally)
  const restoredSection = useMemo(() => {
    // Login redirect: navigate("/", { state: { homeSection: n } })
    if (location.state?.homeSection !== undefined) {
      const s = parseInt(location.state.homeSection, 10);
      if (!isNaN(s) && s >= 0 && s <= 3) return s;
    }
    // Back / forward button — session ID must match (rules out page reloads)
    // SESSION_ID is a module-level constant that regenerates on every page reload.
    // If the stored ID matches, we're in the same JS session → safe to restore.
    const storedSessionId = sessionStorage.getItem("evolve_home_session_id");
    if (storedSessionId !== SESSION_ID) return -1; // reload or first visit
    const stored = parseInt(sessionStorage.getItem("evolve_home_section"), 10);
    if (isNaN(stored) || stored < 0 || stored > 3) return -1;
    return navigationType === "POP" ? stored : -1;
  }, []); // eslint-disable-line — intentionally computed once on mount

  // True when we're skipping the intro and jumping straight to a saved section
  const introSkippedRef = useRef(restoredSection >= 0);

  // State
  const [introDone, setIntroDone] = useState(restoredSection >= 0);
  const [animationsReady, setAnimationsReady] = useState(false);
  const [activeSection, setActiveSection] = useState(
    restoredSection >= 0 ? restoredSection : -1
  );
  const [scrollProgress, setScrollProgress] = useState(
    restoredSection >= 0 ? restoredSection / 4 : 0
  );
  const scene1_4StartedRef = useRef(false);

  const [isMobile, setIsMobile] = useState(() => {
    if (forceLayout === "mobile") return true;
    if (forceLayout === "desktop") return false;
    if (deviceType) return deviceType === "mobile";
    const w = window.innerWidth;
    const h = window.innerHeight;
    return w <= 768 || (w <= 1024 && h > w);
  });

  // ── Responsive ──────────────────────────────────────────────────────────────
  useLayoutEffect(() => {
    if (forceLayout !== "auto") {
      setIsMobile(forceLayout === "mobile");
      return;
    }
    if (deviceType) {
      setIsMobile(deviceType === "mobile");
      return;
    }
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setIsMobile(w <= 768 || (w <= 1024 && h > w));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [forceLayout, deviceType]);

  // ── Delay animation ready ───────────────────────────────────────────────────
  useEffect(() => {
    if (isLoading) return;
    const id = setTimeout(() => {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(() => setAnimationsReady(true), { timeout: 500 });
      } else {
        setAnimationsReady(true);
      }
    }, 300);
    return () => clearTimeout(id);
  }, [isLoading]);

  // ── Hide scrollbar for entire home page lifetime ────────────────────────────
  useLayoutEffect(() => {
    if (!document.getElementById("home-no-scrollbar")) {
      const styleEl = document.createElement("style");
      styleEl.id = "home-no-scrollbar";
      styleEl.textContent =
        "html { scrollbar-width: none !important; } " +
        "html::-webkit-scrollbar { width: 0 !important; display: none !important; }";
      document.head.appendChild(styleEl);
    }
    return () => {
      document.getElementById("home-no-scrollbar")?.remove();
    };
  }, []);

  // ── Scroll lock during intro ────────────────────────────────────────────────
  useLayoutEffect(() => {
    if (introDone) {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    } else {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [introDone]);

  // ── Logo click handler ──────────────────────────────────────────────────────
  const handleLogoClick = useCallback(() => {
    if (!introDone) return;
    window.__homeGoToSection?.(0);
  }, [introDone]);

  useLayoutEffect(() => {
    window.handleLogoClick = handleLogoClick;
    window.isOnHomePage = true;
    return () => {
      delete window.handleLogoClick;
      delete window.isOnHomePage;
    };
  }, [handleLogoClick]);

  // ── Sync scrollbar progress with section + footer scroll ───────────────────
  useEffect(() => {
    if (activeSection >= 0) setScrollProgress(activeSection / 4);
  }, [activeSection]);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 10) setScrollProgress(1);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Persist section for back-button and login-redirect restoration ──────────
  useEffect(() => {
    if (introDone && activeSection >= 0) {
      // Store both the section and the session ID together.
      // The session ID is a module-level constant — it changes on every page
      // reload, so a mismatch on the next mount means "don't restore".
      sessionStorage.setItem("evolve_home_section", String(activeSection));
      sessionStorage.setItem("evolve_home_session_id", SESSION_ID);
    }
  }, [activeSection, introDone]);

  // ── Restore scene positions on mount when skipping the intro ───────────────
  useLayoutEffect(() => {
    if (!introSkippedRef.current) return;

    // Push Scene1 (intro) off-screen so it doesn't flash over the restored scene
    if (scene1ContainerRef.current) {
      gsap.set(scene1ContainerRef.current, { y: "-100vh" });
    }

    const s2 = scene2Ref.current;
    const s3 = scene3Ref.current;
    const s4 = scene4Ref.current;
    const s14 = scene1_4Refs.current?.container;

    // Position s2, s3, s4 relative to restored section
    [s2, s3, s4].forEach((el, i) => {
      if (!el) return;
      if (i === restoredSection) gsap.set(el, { y: 0 });
      else if (i < restoredSection) gsap.set(el, { y: "-100vh" });
      else gsap.set(el, { y: "100vh" });
    });

    // Scene1_4 (index 3)
    if (s14) {
      if (restoredSection === 3) {
        gsap.set(s14, {
          y: "0%",
          rotation: 0,
          scale: 1,
          opacity: 1,
          transformOrigin: "center center"
        });
        // s4 stays at y:0 as the layer underneath Scene1_4
        if (s4) gsap.set(s4, { y: 0 });
      } else {
        gsap.set(s14, {
          y: "120%",
          rotation: 15,
          scale: 0.9,
          opacity: 0,
          transformOrigin: "center center"
        });
      }
    }

    if (setShowNavbar) setShowNavbar(true);
    // Notify App that intro was skipped so footer can render
    if (onIntroComplete) onIntroComplete();
  }, []); // eslint-disable-line — runs once on mount, refs are ready by then

  // ── Main scroll/navigation setup ────────────────────────────────────────────
  useLayoutEffect(() => {
    if (!introDone || !animationsReady) return;

    const s2 = scene2Ref.current;
    const s3 = scene3Ref.current;
    const s4 = scene4Ref.current;
    const s14 = scene1_4Refs.current?.container;

    if (!s2 || !s3 || !s4 || !s14) return;

    if (!introSkippedRef.current) {
      // Fresh load — scenes 3/4/s14 haven't been touched by the intro transition yet
      gsap.set(s3, { y: "100vh" });
      gsap.set(s4, { y: "100vh" });
      gsap.set(s14, {
        y: "120%",
        rotation: 15,
        transformOrigin: "center center",
        opacity: 0,
        scale: 0.9
      });
    }
    // When restoring, the restore useLayoutEffect has already set correct positions

    let currentSection = introSkippedRef.current ? restoredSection : 0;
    // Block briefly on fresh load (intro slide takes ~1.1s); immediate on restore
    let isAnimating = !introSkippedRef.current;
    const unblockId = isAnimating
      ? setTimeout(() => {
          isAnimating = false;
        }, 1200)
      : null;

    // If restoring to Scene1_4, kick off its internal timeline
    if (
      introSkippedRef.current &&
      restoredSection === 3 &&
      !scene1_4StartedRef.current
    ) {
      scene1_4StartedRef.current = true;
      useScene1_4Timeline(scene1_4Refs.current, isMobile);
    }

    const scenes = [s2, s3, s4, s14];

    const goToSection = (idx) => {
      const to = Math.max(0, Math.min(TOTAL_SECTIONS, idx));
      if (to === currentSection || isAnimating) return;

      isAnimating = true;
      const prev = currentSection;
      currentSection = to;
      setActiveSection(to);
      const direction = to > prev ? 1 : -1;

      const outScene = scenes[prev];
      const inScene = scenes[to];

      if (prev === 3 && direction < 0) {
        // Scene1_4 exits mirroring its entry (rotation + scale + y)
        gsap.to(outScene, {
          y: "120%",
          rotation: 15,
          scale: 0.9,
          opacity: 0,
          duration: 1.2,
          ease: "power2.inOut",
          overwrite: true,
          onComplete: () => {
            scene1_4StartedRef.current = false;
            isAnimating = false;
          }
        });
        // Scene4_refined is already at y:0 underneath — no in animation needed
      } else if (to === 3 && direction > 0) {
        // Scene1_4 slides IN over Scene4_refined — do NOT move Scene4_refined out
        gsap.to(inScene, {
          y: "0%",
          rotation: 0,
          scale: 1,
          opacity: 1,
          duration: 1.8,
          ease: "power2.inOut",
          overwrite: true,
          onComplete: () => {
            isAnimating = false;
            if (!scene1_4StartedRef.current && scene1_4Refs.current) {
              scene1_4StartedRef.current = true;
              useScene1_4Timeline(scene1_4Refs.current, isMobile);
            }
          }
        });
      } else {
        // Normal slide transitions between all other scenes
        if (outScene) {
          gsap.to(outScene, {
            y: direction > 0 ? "-100vh" : "100vh",
            duration: 0.8,
            ease: "power2.inOut",
            overwrite: true
          });
        }
        if (inScene) {
          gsap.set(inScene, {
            y: direction > 0 ? "100vh" : "-100vh",
            overwrite: true
          });
          gsap.to(inScene, {
            y: 0,
            duration: 0.8,
            ease: "power2.inOut",
            overwrite: true,
            onComplete: () => {
              isAnimating = false;
            }
          });
        }
      }

      if (setShowNavbar) setShowNavbar(true);
    };

    // Expose for logo click
    window.__homeGoToSection = goToSection;

    // ── Wheel handler ───────────────────────────────────────────────────────
    const handleWheel = (e) => {
      // If footer is partially visible, let native scroll handle
      if (window.scrollY > 10) return;
      // At last section scrolling down → release to footer (only when not mid-animation)
      if (currentSection >= TOTAL_SECTIONS && e.deltaY > 0 && !isAnimating)
        return;
      e.preventDefault();
      if (isAnimating) return;
      if (Math.abs(e.deltaY) < 10) return;
      goToSection(currentSection + (e.deltaY > 0 ? 1 : -1));
    };

    // ── Touch handlers ──────────────────────────────────────────────────────
    let touchStartY = 0;
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e) => {
      if (window.scrollY > 10) return; // already in footer zone, native scroll handles it
      const fingerMovingDown = e.touches[0].clientY > touchStartY; // down = backward through sections
      // At last section AND finger moving up (toward footer) → release to native scroll
      if (currentSection >= TOTAL_SECTIONS && !isAnimating && !fingerMovingDown)
        return;
      // All other cases (including swiping down at last section) → block pull-to-refresh
      e.preventDefault();
    };
    const handleTouchEnd = (e) => {
      if (isAnimating || window.scrollY > 10) return;
      const dy = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(dy) < 20) return;
      if (currentSection >= TOTAL_SECTIONS && dy > 0 && !isAnimating) return;
      goToSection(currentSection + (dy > 0 ? 1 : -1));
    };

    // ── Keyboard handler ────────────────────────────────────────────────────
    const handleKeyDown = (e) => {
      if (window.scrollY > 10) return;
      const forward = ["ArrowDown", "ArrowRight", "PageDown", " "].includes(
        e.key
      );
      const back = ["ArrowUp", "ArrowLeft", "PageUp"].includes(e.key);
      if (!forward && !back) return;
      // At last section going forward and not animating → release to footer (no preventDefault)
      if (forward && currentSection >= TOTAL_SECTIONS && !isAnimating) return;
      e.preventDefault();
      if (isAnimating) return;
      goToSection(currentSection + (forward ? 1 : -1));
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      if (unblockId) clearTimeout(unblockId);
      delete window.__homeGoToSection;
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
      if (setShowNavbar) setShowNavbar(true);
    };
  }, [introDone, animationsReady, isMobile, setShowNavbar]);

  // ── Intro complete → transition Scene1 out, Scene2 in (skipped when restoring) ──
  useLayoutEffect(() => {
    if (!introDone || introSkippedRef.current) return;

    const s1 = scene1ContainerRef.current;
    const s2 = scene2Ref.current;
    if (!s1 || !s2) return;

    // Show navbar immediately after intro
    if (setShowNavbar) setShowNavbar(true);

    // Position scene2 below viewport, then slide both simultaneously
    gsap.set(s2, { y: "100vh" });
    gsap.to(s1, {
      y: "-100vh",
      duration: 0.8,
      delay: 0.3,
      ease: "power2.inOut"
    });
    gsap.to(s2, { y: 0, duration: 0.8, delay: 0.3, ease: "power2.inOut" });

    setActiveSection(0);
  }, [introDone, setShowNavbar]);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <SEO
        title="evolve — a design ecosystem built around your journey"
        description="Not just a course. Not just a community. evolve brings together learning, mentorship, sessions, and community, so you can pick what moves you forward, wherever you are in design."
        path="/"
      />

      {/* Outer scroll container — h-screen so footer appears naturally below */}
      <div
        ref={containerRef}
        id="scroll-container"
        className="w-full h-screen bg-black lowercase"
        style={{ overflow: "hidden", position: "relative", zIndex: 2 }}
      >
        {/* Grain texture overlay */}
        {animationsReady && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              zIndex: 9999,
              mixBlendMode: "overlay",
              opacity: 0.2,
              filter: "contrast(100%) brightness(90%)"
            }}
          >
            <GrainTexture />
          </div>
        )}

        {/* ── Scene1 (intro) wrapper ── */}
        <div
          ref={scene1ContainerRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: introDone ? 1 : 10,
            pointerEvents: introDone ? "none" : "auto"
          }}
        >
          <Suspense fallback={null}>
            <Scene1
              isMobile={isMobile}
              onIntroComplete={() => {
                setIntroDone(true);
                if (onIntroComplete) onIntroComplete();
              }}
            />
          </Suspense>
        </div>

        {/* ── Scene2_refined — "where designers find their…" ── */}
        <div
          ref={scene2Ref}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 5,
            transform: "translateY(100vh)"
          }}
        >
          <Scene2_refined isMobile={isMobile} />
        </div>

        {/* ── Scene3_refined — ecosystem cards ── */}
        <div
          ref={scene3Ref}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 5,
            transform: "translateY(100vh)"
          }}
        >
          <Scene3_refined isMobile={isMobile} isActive={activeSection === 1} />
        </div>

        {/* ── Scene4_refined — orbit CTA ── */}
        <div
          ref={scene4Ref}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 5,
            transform: "translateY(100vh)"
          }}
        >
          <Scene4_refined isMobile={isMobile} isActive={activeSection === 2} />
        </div>

        {/* ── Scene1_4 — overlays Scene4_refined with higher z-index ── */}
        <div
          ref={(el) => {
            if (scene1_4Refs.current) scene1_4Refs.current.container = el;
          }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 7,
            opacity: 0,
            transform: "translateY(120%) rotate(15deg) scale(0.9)"
          }}
        >
          <Scene1_4 ref={scene1_4Refs} isMobile={isMobile} />
        </div>
      </div>
      {/* Custom scrollbar — full-height track on right edge */}
      {introDone && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "8px",
            height: "100vh",
            zIndex: 9998,
            pointerEvents: "none",
            background: "rgba(0,0,0,0.08)"
          }}
        >
          <div
            style={{
              position: "absolute",
              right: 0,
              top: `${scrollProgress * 80}%`,
              width: "100%",
              height: "20%",
              background: "rgba(0,0,0,0.5)",
              borderRadius: "4px",
              transition: "top 0.35s ease"
            }}
          />
        </div>
      )}

      {/* Announcement ticker — slides in with the nav after intro */}
      {introDone && (
        // <div
        //   style={{
        //     position: "fixed",
        //     top: "45px",
        //     left: 0,
        //     right: 0,
        //     zIndex: 9999,
        //     backgroundColor: "#C2FD5C",
        //     overflow: "hidden",
        //     animation: "ticker-fadein 0.4s ease-out"
        //   }}
        // >
        //   {/* Desktop — static layout */}
        //   <div
        //     className="hidden md:flex items-center h-[6rem] mx-auto px-6 max-w-[80%] justify-center gap-3 lowercase"
        //     style={{ transform: "translateY(3px)" }}
        //   >
        //     <span className="text-black font-bold text-[28px] whitespace-nowrap">
        //       {TICKER.label}
        //     </span>

        //     <div className="flex-1 border-t border-black" />

        //     <span className="text-evolve-pink font-extrabold text-[32px] whitespace-nowrap">
        //       {TICKER.title}
        //     </span>

        //     <span className="text-black text-sm select-none">|</span>

        //     <span className="text-black text-[28px] font-bold whitespace-nowrap">
        //       {TICKER.by}
        //     </span>

        //     <span className="text-black text-sm select-none">|</span>

        //     <span className="text-black text-[18px] font-bold whitespace-nowrap">
        //       {TICKER.date}
        //     </span>

        //     <a
        //       href={TICKER.webinarUrl}
        //       target="_blank"
        //       rel="noopener noreferrer"
        //       className="ml-2 flex-shrink-0 w-[4rem] h-[2rem] rounded-md border border-black flex items-center justify-center text-black text-xl transition-colors duration-200 hover:bg-black hover:text-[#C2FD5C]"
        //     >
        //       →
        //     </a>
        //   </div>

        //   {/* Mobile — scrolling marquee */}
        //   <div
        //     className="flex md:hidden items-center h-[5rem] overflow-hidden"
        //     style={{ transform: "translateY(4px)" }}
        //   >
        //     <div
        //       className="flex whitespace-nowrap"
        //       style={{
        //         animation: "ticker-scroll 20s linear infinite"
        //       }}
        //     >
        //       {[0, 1].map((i) => (
        //         <span
        //           key={i}
        //           className="inline-flex items-center gap-3 px-8 lowercase"
        //         >
        //           {/* Label */}
        //           <span className="text-black font-bold text-[18px] whitespace-nowrap">
        //             {TICKER.label}
        //           </span>

        //           <span className="text-black font-bold">|</span>

        //           {/* Title */}
        //           <span className="text-evolve-pink font-extrabold text-[22px] whitespace-nowrap">
        //             {TICKER.title}
        //           </span>

        //           <span className="text-black font-bold">|</span>

        //           {/* Author */}
        //           <span className="text-black font-bold text-[18px] whitespace-nowrap">
        //             {TICKER.by}
        //           </span>

        //           <span className="text-black font-bold">|</span>

        //           {/* Date */}
        //           <span className="text-black font-bold text-[18px] whitespace-nowrap">
        //             {TICKER.date}
        //           </span>

        //           {/* CTA */}
        //           <a
        //             href={TICKER.webinarUrl}
        //             target="_blank"
        //             rel="noopener noreferrer"
        //             className="flex-shrink-0 w-7 h-7 rounded border border-black flex items-center justify-center text-black text-sm transition-colors duration-200 hover:bg-black hover:text-[#C2FD5C]"
        //           >
        //             →
        //           </a>

        //           <span className="text-black mx-2 font-bold">•</span>
        //         </span>
        //       ))}
        //     </div>
        //   </div>
        // </div>
        <a
          // href={TICKER.webinarUrl}
          href="https://luma.com/90alzvoc?utm_source=ewebsite"
          target="_blank"
          rel="noopener noreferrer"
          className="block cursor-pointer "
        >
          <div
            style={{
              position: "fixed",
              top: "45px",
              left: 0,
              right: 0,
              zIndex: 9999,
              backgroundColor: "#C2FD5C",
              overflow: "hidden",
              animation: "ticker-fadein 0.4s ease-out"
            }}
          >
            {/* Desktop — static layout */}
            <div
              className="hidden md:flex items-center h-[6rem] mx-auto px-6 max-w-[80%] justify-center gap-3 lowercase"
              style={{ transform: "translateY(5px)" }}
            >
              <span className="text-black font-bold text-[28px] whitespace-nowrap">
                {TICKER.label}
              </span>

              <div className="flex-1 border-t border-black" />

              <span className="text-evolve-pink font-extrabold text-[32px] whitespace-nowrap">
                {TICKER.title}
              </span>

              <span className="text-black text-sm select-none">|</span>

              <span className="text-black text-[28px] font-bold whitespace-nowrap">
                {TICKER.by}
              </span>

              <span className="text-black text-sm select-none">|</span>

              <span className="text-black text-[18px] font-bold whitespace-nowrap">
                {TICKER.date}
              </span>

              <span className="ml-2 flex-shrink-0 w-[4rem] h-[2rem] rounded-md border border-black flex items-center justify-center text-black text-xl transition-colors duration-200">
                →
              </span>
            </div>

            {/* Mobile — scrolling marquee */}
            <div
              className="flex md:hidden items-center h-[5rem] overflow-hidden"
              style={{ transform: "translateY(4px)" }}
            >
              <div
                className="flex whitespace-nowrap"
                style={{
                  animation: "ticker-scroll 20s linear infinite"
                }}
              >
                {[0, 1].map((i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-3 px-8 lowercase"
                  >
                    {/* Label */}
                    <span className="text-black font-bold text-[18px] whitespace-nowrap">
                      {TICKER.label}
                    </span>

                    <span className="text-black font-bold">|</span>

                    {/* Title */}
                    <span className="text-evolve-pink font-extrabold text-[22px] whitespace-nowrap">
                      {TICKER.title}
                    </span>

                    <span className="text-black font-bold">|</span>

                    {/* Author */}
                    <span className="text-black font-bold text-[18px] whitespace-nowrap">
                      {TICKER.by}
                    </span>

                    <span className="text-black font-bold">|</span>

                    {/* Date */}
                    <span className="text-black font-bold text-[18px] whitespace-nowrap">
                      {TICKER.date}
                    </span>

                    {/* CTA Arrow */}
                    <span className="flex-shrink-0 w-7 h-7 rounded border border-black flex items-center justify-center text-black text-md">
                      →
                    </span>

                    <span className="text-black mx-2 font-bold">•</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </a>
      )}
    </>
  );
};

export default Home;
