import React, {
  useLayoutEffect,
  useRef,
  useState,
  useEffect,
  lazy,
  Suspense
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SEO from "../../components/SEO";
const Scene1 = lazy(() => import("./Scene1"));

import SceneNew, {
  useSceneNewTimeline,
  getSceneNewStepLabels
} from "./SceneNew";

import Scene1_4, { useScene1_4Timeline } from "./Scene1_4";
import GrainTexture from "../../components/GrainTexture";

gsap.registerPlugin(ScrollTrigger);

const Home = ({
  forceLayout = "auto",
  setShowNavbar,
  isLoading,
  deviceType,
  onIntroComplete
}) => {
  const scene1Refs = useRef({});
  const sceneNewRefs = useRef({});
  const scene1_4Refs = useRef({});
  const containerRef = useRef(null);

  const snapPointsRef = useRef([]);
  const masterRef = useRef(null);
  const stRef = useRef(null);
  const hasShownNavbarRef = useRef(false);
  const logoClickedRef = useRef(false);

  const [introDone, setIntroDone] = useState(false);
  const [animationsReady, setAnimationsReady] = useState(false);

  const [isMobile, setIsMobile] = useState(() => {
    if (forceLayout === "mobile") return true;
    if (forceLayout === "desktop") return false;
    if (deviceType) return deviceType === "mobile";
    return window.innerWidth <= 768;
  });

  // Delay animations-ready slightly so refs are settled
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

  // Lock scroll + hide scrollbar only during Scene1; release after introDone
  useLayoutEffect(() => {
    if (introDone) {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.getElementById("home-no-scrollbar")?.remove();
    } else {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      if (!document.getElementById("home-no-scrollbar")) {
        const styleEl = document.createElement("style");
        styleEl.id = "home-no-scrollbar";
        styleEl.textContent =
          "html { scrollbar-width: none !important; } " +
          "html::-webkit-scrollbar { width: 0 !important; display: none !important; }";
        document.head.appendChild(styleEl);
      }
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.getElementById("home-no-scrollbar")?.remove();
    };
  }, [introDone]);

  useLayoutEffect(() => {
    if (setShowNavbar && !introDone) {
      setShowNavbar(false);
      hasShownNavbarRef.current = false;
    }
  }, [introDone, setShowNavbar]);

  const handleLogoClick = React.useCallback(() => {
    if (!introDone) return;
    logoClickedRef.current = true;
    if (stRef._goToSection) stRef._goToSection(1);
  }, [introDone]);

  useLayoutEffect(() => {
    window.handleLogoClick = handleLogoClick;
    window.isOnHomePage = true;
    return () => {
      delete window.handleLogoClick;
      delete window.isOnHomePage;
    };
  }, [handleLogoClick]);

  useLayoutEffect(() => {
    if (forceLayout !== "auto") {
      setIsMobile(forceLayout === "mobile");
      return;
    }
    if (deviceType) {
      setIsMobile(deviceType === "mobile");
      return;
    }
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [forceLayout, deviceType]);

  // ─── Main animation setup ────────────────────────────────────────────────
  useLayoutEffect(() => {
    if (isLoading || !introDone || !animationsReady) return;
    if (
      !scene1Refs.current.container ||
      !sceneNewRefs.current.container ||
      !scene1_4Refs.current.container ||
      !containerRef.current
    )
      return;

    let scrollEventCleanup = () => {};

    const rafId = requestAnimationFrame(() => {
      // ── Initial states ──────────────────────────────────────────────────
      gsap.set(sceneNewRefs.current.container, { opacity: 0 });
      gsap.set(scene1_4Refs.current.container, {
        y: "120%",
        rotation: 15,
        transformOrigin: "center center",
        opacity: 0,
        scale: 0.9
      });

      const tlNew = useSceneNewTimeline(sceneNewRefs.current, isMobile);
      const tl4 = useScene1_4Timeline(scene1_4Refs.current, isMobile);

      const master = gsap.timeline({ paused: true });
      masterRef.current = master;

      // ── Transition 1: Scene1 → SceneNew ─────────────────────────────────
      master
        .to(sceneNewRefs.current.container, {
          opacity: 1,
          duration: 0.1,
          ease: "power2.in"
        })
        .to(
          scene1Refs.current.container,
          { scale: 1.5, opacity: 0, duration: 0.1, ease: "power2.inOut" },
          "<"
        );

      if (tlNew) master.add(tlNew);

      // ── Transition 2: SceneNew → Scene1_4 ───────────────────────────────
      master
        .to(scene1_4Refs.current.container, {
          opacity: 1,
          duration: 0.3,
          ease: "none"
        })
        .to(
          scene1_4Refs.current.container,
          {
            y: "0%",
            rotation: 0,
            scale: 1,
            duration: 1.8,
            ease: "power2.inOut"
          },
          "<0.1"
        );

      if (tl4) master.add(tl4);

      // ── Build snap points (for non-linear scroll→animation mapping) ─────
      const masterDur = master.duration();
      const progresses = [0];

      const addSteps = (tl, labels) => {
        if (!tl || !labels?.length) return;
        const start = tl.startTime();
        labels.forEach((label) => {
          const t = tl.labels?.[label];
          if (typeof t === "number") progresses.push((start + t) / masterDur);
        });
      };

      addSteps(tlNew, getSceneNewStepLabels(isMobile));
      // scene1_4SnapAbsTime intentionally omitted — it duplicates snap3_cta
      progresses.push(1);

      const snapPoints = Array.from(new Set(progresses)).sort((a, b) => a - b);
      snapPointsRef.current = snapPoints;

      const N = snapPoints.length;
      const totalSections = N - 1;

      // ── ScrollTrigger: pin only — scroll position tracks section for footer ─
      const st = ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: `+=${totalSections * window.innerHeight}`,
        pin: true,
        anticipatePin: 1
      });

      stRef.current = st;

      // ── Direct master.progress() navigation — zero lag, zero chain ────────
      // We tween master.progress() directly with GSAP. Animation starts on
      // frame 1. window.scrollTo() is called once, instantly, just to keep
      // the ScrollTrigger pin/footer state in sync (not to drive animation).

      let currentSection = 0;
      let isAnimating = false;

      const goToSection = (idx) => {
        const section = Math.max(0, Math.min(totalSections, idx));
        const targetProg = snapPoints[section] ?? (section === 0 ? 0 : 1);
        const targetScrollY =
          st.start + (section / totalSections) * (st.end - st.start);

        currentSection = section;
        isAnimating = true;

        // Sync scroll position instantly so pin / footer behave correctly
        window.scrollTo(0, targetScrollY);

        // Animate master directly — no scroll middleman, instant start
        gsap.to(master, {
          progress: targetProg,
          // duration: 0.8,
          duration: 1.3,
          ease: "power3.out",
          overwrite: true,
          onComplete: () => {
            // absorb trackpad inertia tail before accepting next gesture
            setTimeout(() => {
              isAnimating = false;
            }, 200);
          }
        });

        // Navbar
        if (setShowNavbar) {
          if (section > 0 && !hasShownNavbarRef.current) {
            setShowNavbar(true);
            hasShownNavbarRef.current = true;
          } else if (
            section === 0 &&
            hasShownNavbarRef.current &&
            !logoClickedRef.current
          ) {
            setShowNavbar(false);
            hasShownNavbarRef.current = false;
          }
          if (section > 0) logoClickedRef.current = false;
        }
      };

      // Expose so handleLogoClick (defined outside) can use it
      stRef._goToSection = goToSection;

      // Wheel: one gesture = one section
      const handleWheel = (e) => {
        const activeSt = stRef.current;
        if (!activeSt) return;
        // Past pin end — native scroll to footer
        if (window.scrollY >= activeSt.end) return;
        // At last section scrolling down — release to footer
        if (currentSection >= totalSections && e.deltaY > 0) return;
        // Block native scroll inside pin zone
        e.preventDefault();
        if (isAnimating) return;
        if (Math.abs(e.deltaY) < 10) return; // ignore inertia residue
        goToSection(currentSection + (e.deltaY > 0 ? 1 : -1));
      };

      // Touch: swipe = one section
      let touchStartY = 0;
      const handleTouchStart = (e) => {
        touchStartY = e.touches[0].clientY;
      };
      const handleTouchEnd = (e) => {
        if (isAnimating || window.scrollY >= (stRef.current?.end ?? 0)) return;
        const dy = touchStartY - e.changedTouches[0].clientY;
        if (Math.abs(dy) < 40) return;
        if (currentSection >= totalSections && dy > 0) return;
        goToSection(currentSection + (dy > 0 ? 1 : -1));
      };

      window.addEventListener("wheel", handleWheel, { passive: false });
      window.addEventListener("touchstart", handleTouchStart, {
        passive: true
      });
      window.addEventListener("touchend", handleTouchEnd, { passive: true });

      // ── Keyboard: arrow keys / space / page keys navigate sections ──────────
      const handleKeyDown = (e) => {
        if (window.scrollY >= (stRef.current?.end ?? 0)) return;
        const forward = ["ArrowDown", "ArrowRight", "PageDown", " "].includes(e.key);
        const back    = ["ArrowUp",   "ArrowLeft",  "PageUp"       ].includes(e.key);
        if (!forward && !back) return;
        e.preventDefault();
        if (isAnimating) return;
        if (forward && currentSection >= totalSections) return;
        goToSection(currentSection + (forward ? 1 : -1));
      };
      window.addEventListener("keydown", handleKeyDown);

      // ── External trigger ──────────────────────────────────────────────────
      const handleScrollToSceneNew = () => goToSection(1);
      window.addEventListener("scrollToSceneNew", handleScrollToSceneNew);

      scrollEventCleanup = () => {
        gsap.killTweensOf(master);
        window.removeEventListener("wheel", handleWheel);
        window.removeEventListener("touchstart", handleTouchStart);
        window.removeEventListener("touchend", handleTouchEnd);
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("scrollToSceneNew", handleScrollToSceneNew);
      };
    });

    return () => {
      cancelAnimationFrame(rafId);
      scrollEventCleanup();
      try {
        if (masterRef.current) {
          gsap.killTweensOf(masterRef.current);
          masterRef.current.kill();
          masterRef.current = null;
        }
        if (stRef.current) {
          stRef.current.kill();
          stRef.current = null;
        }
        ScrollTrigger.getAll().forEach((t) => {
          try {
            t.kill();
          } catch (_) {}
        });
      } catch (err) {
        console.warn("Home cleanup error:", err);
      }
      if (setShowNavbar) setShowNavbar(true);
    };
  }, [isMobile, setShowNavbar, isLoading, introDone, animationsReady]);

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <>
      <SEO
        title="evolve — a design ecosystem built around your journey"
        description="Not just a course. Not just a community. evolve brings together learning, mentorship, sessions, and community, so you can pick what moves you forward, wherever you are in design."
        path="/"
      />
      <div
        ref={containerRef}
        id="scroll-container"
        className="w-full h-screen bg-black lowercase"
        style={{ overflow: "hidden", position: "relative", zIndex: 49 }}
      >
        {/* Grain texture */}
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

        {/* Scene 1 — intro */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            willChange: "transform, opacity",
            pointerEvents: introDone ? "none" : "auto",
            zIndex: introDone ? 1 : 10,
            opacity: 1
          }}
        >
          <Suspense fallback={null}>
            <Scene1
              ref={scene1Refs}
              isMobile={isMobile}
              onIntroComplete={() => {
                setIntroDone(true);
                if (onIntroComplete) onIntroComplete();
              }}
            />
          </Suspense>
        </div>

        {/* SceneNew */}
        <div
          ref={(el) => {
            if (sceneNewRefs.current) sceneNewRefs.current.container = el;
          }}
          className="absolute inset-0 w-full h-full"
          style={{
            opacity: 0,
            pointerEvents: introDone ? "auto" : "none",
            zIndex: 3
          }}
        >
          <SceneNew ref={sceneNewRefs} isMobile={isMobile} />
        </div>

        {/* Scene1_4 */}
        <div
          ref={(el) => {
            if (scene1_4Refs.current) scene1_4Refs.current.container = el;
          }}
          className="absolute inset-0 w-full h-full"
          style={{ zIndex: 5 }}
        >
          <Scene1_4 ref={scene1_4Refs} isMobile={isMobile} />
        </div>
      </div>
    </>
  );
};

export default Home;
