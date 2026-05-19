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
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import SEO from "../../components/SEO";
const Scene1 = lazy(() => import("./Scene1"));

// NEW SCENE - First scrollable scene
import SceneNew, {
  useSceneNewTimeline,
  getSceneNewStepLabels
} from "./SceneNew";

import Scene1_4, { useScene1_4Timeline } from "./Scene1_4";
import GrainTexture from "../../components/GrainTexture";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

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
  const snapPointsRef = useRef([]);

  const scene1EndScrollRef = useRef(null);
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

  const masterTimelineRef = useRef(null);

  useEffect(() => {
    if (isLoading) return;
    const timeoutId = setTimeout(() => {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(
          () => {
            setAnimationsReady(true);
          },
          { timeout: 500 }
        );
      } else {
        setAnimationsReady(true);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  useLayoutEffect(() => {
    document.body.style.overflow = introDone ? "auto" : "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [introDone]);

  useLayoutEffect(() => {
    if (setShowNavbar && !introDone) {
      setShowNavbar(false);
      hasShownNavbarRef.current = false;
    }
  }, [introDone, setShowNavbar]);

  const handleLogoClick = React.useCallback(() => {
    if (!introDone || !animationsReady) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const scrollTrigger = masterTimelineRef.current?.scrollTrigger;
    if (!scrollTrigger) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!snapPointsRef.current || snapPointsRef.current.length < 2) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const sceneNewFirstStepProgress = snapPointsRef.current[1] || 0.05;
    const targetScroll =
      scrollTrigger.start +
      (scrollTrigger.end - scrollTrigger.start) * sceneNewFirstStepProgress;

    gsap.killTweensOf(window);
    gsap.to(window, {
      duration: 1.2,
      scrollTo: { y: targetScroll, autoKill: false },
      ease: "power2.inOut",
      onStart: () => {
        logoClickedRef.current = true;
      }
    });
    if (setShowNavbar) {
      setShowNavbar(true);
      hasShownNavbarRef.current = true;
    }
  }, [setShowNavbar, introDone, animationsReady]);

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
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [forceLayout, deviceType]);

  useLayoutEffect(() => {
    if (isLoading || !introDone || !animationsReady) return;

    if (
      !scene1Refs.current.container ||
      !sceneNewRefs.current.container ||
      !scene1_4Refs.current.container
    ) {
      console.log("Waiting for refs to be ready");
      return;
    }

    console.log("Building master timeline...");

    const id = requestAnimationFrame(() => {
      gsap.set(sceneNewRefs.current.container, {
        opacity: 0,
        willChange: "transform, opacity"
      });

      gsap.set(scene1_4Refs.current.container, {
        y: "120%",
        rotation: 15,
        transformOrigin: "center center",
        opacity: 0,
        scale: 0.9,
        willChange: "transform, opacity"
      });

      const tlNew = useSceneNewTimeline(sceneNewRefs.current, isMobile);
      const tl4 = useScene1_4Timeline(scene1_4Refs.current, isMobile);

      if (masterTimelineRef.current) {
        masterTimelineRef.current.kill();
      }

      const SECTIONS = 3;
      const SCROLL_PER_SECTION = 8;
      const vh = Math.max(window.innerHeight, 400);
      const scrollLength = vh * SECTIONS * SCROLL_PER_SECTION;

      const master = gsap.timeline({ paused: true });
      masterTimelineRef.current = master;

      // ========== TRANSITION 1: Scene1 → SceneNew (CROSSFADE) ==========
      master
        .to(sceneNewRefs.current.container, {
          opacity: 1,
          duration: 0.1,
          ease: "power2.in",
          force3D: true
        })
        .to(
          scene1Refs.current.container,
          {
            scale: 1.5,
            opacity: 0,
            duration: 0.1,
            ease: "power2.inOut",
            force3D: true
          },
          "<"
        );

      // Add SceneNew timeline
      if (tlNew) master.add(tlNew);

      // ========== TRANSITION 2: SceneNew → Scene1_4 (ZOOM/FADE) ==========
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

      // Add Scene1_4 timeline
      if (tl4) master.add(tl4);

      // ====== BUILD STEP SNAP POINTS FROM CHILD TIMELINES ======
      const masterDur = master.duration();
      const stepProgresses = [];

      const addStepsFromTimeline = (tl, labels) => {
        if (!tl || !labels || !labels.length) return;
        const start = tl.startTime();
        labels.forEach((label) => {
          const localTime = tl.labels?.[label];
          if (typeof localTime !== "number") return;
          const globalTime = start + localTime;
          stepProgresses.push(globalTime / masterDur);
        });
      };

      stepProgresses.push(0);
      addStepsFromTimeline(tlNew, getSceneNewStepLabels(isMobile));
      addStepsFromTimeline(tl4, []);
      stepProgresses.push(1);

      const snapPoints = Array.from(new Set(stepProgresses)).sort(
        (a, b) => a - b
      );

      const SCENE_NEW_FIRST_STEP_PROGRESS = snapPoints[1] || 0.05;
      // Navbar shows as soon as SceneNew starts crossfading in (first scroll action)
      const SCENE_NEW_ENTRY_PROGRESS = 0.005;
      snapPointsRef.current = snapPoints;

      console.log("Snap points created:", snapPoints);
      console.log("First scene progress:", SCENE_NEW_FIRST_STEP_PROGRESS);

      let lastScrollTime = Date.now();
      let scrollVelocity = 0;

      const st = ScrollTrigger.create({
        trigger: "#scroll-container",
        start: "top top",
        end: `+=${scrollLength}`,
        pin: true,
        anticipatePin: 1,
        fastScrollEnd: true,
        invalidateOnRefresh: true,
        animation: master,
        scrub: 0.6,
        snap: {
          snapTo: snapPoints,
          duration: { min: 0.1, max: 3.0 },
          delay: 0,
          ease: "power2.out",
          onStart: () => {
            ScrollTrigger.clearScrollMemory();
          }
        },

        onScrubComplete: () => {
          const currentProgress = st.progress;
          const closest = snapPoints.reduce((prev, curr) =>
            Math.abs(curr - currentProgress) < Math.abs(prev - currentProgress)
              ? curr
              : prev
          );
          if (Math.abs(closest - currentProgress) > 0.001) {
            gsap.to(st, {
              progress: closest,
              duration: 0,
              ease: "power2.out",
              overwrite: true
            });
          }
        },

        onUpdate: (self) => {
          const now = Date.now();
          const timeDiff = now - lastScrollTime;
          const progressDiff = Math.abs(self.progress - self.previous);
          scrollVelocity = progressDiff / timeDiff;
          lastScrollTime = now;

          if (scrollVelocity < 0.0001 && !self.isActive) {
            const closest = snapPoints.reduce((prev, curr) =>
              Math.abs(curr - self.progress) < Math.abs(prev - self.progress)
                ? curr
                : prev
            );
            gsap.to(window, {
              scrollTo: { y: self.start + (self.end - self.start) * closest },
              duration: 0.2,
              ease: "power2.out"
            });
          }

          if (
            setShowNavbar &&
            !hasShownNavbarRef.current &&
            self.progress > SCENE_NEW_ENTRY_PROGRESS
          ) {
            setShowNavbar(true);
            hasShownNavbarRef.current = true;
          }

          if (
            setShowNavbar &&
            hasShownNavbarRef.current &&
            self.progress <= SCENE_NEW_ENTRY_PROGRESS &&
            !logoClickedRef.current
          ) {
            setShowNavbar(false);
            hasShownNavbarRef.current = false;
          }

          if (
            self.progress > SCENE_NEW_ENTRY_PROGRESS &&
            logoClickedRef.current
          ) {
            logoClickedRef.current = false;
          }

          if (
            !scene1EndScrollRef.current &&
            self.progress > SCENE_NEW_ENTRY_PROGRESS
          ) {
            scene1EndScrollRef.current = self.scroll();
          }
        }
      });

      master.scrollTrigger = st;
      masterTimelineRef.current = master;

      console.log("Master timeline created successfully");
    });

    const handleScrollToSceneNew = () => {
      const scrollTrigger = masterTimelineRef.current?.scrollTrigger;
      if (scrollTrigger && snapPointsRef.current.length > 0) {
        const targetProgress = snapPointsRef.current[1];
        const targetScroll =
          scrollTrigger.start +
          (scrollTrigger.end - scrollTrigger.start) * targetProgress;
        gsap.to(window, {
          duration: 0.1,
          scrollTo: { y: targetScroll, autoKill: false },
          ease: "power2.inOut"
        });
      }
    };
    window.addEventListener("scrollToSceneNew", handleScrollToSceneNew);

    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("scrollToSceneNew", handleScrollToSceneNew);
      try {
        if (masterTimelineRef.current) {
          const st = masterTimelineRef.current.scrollTrigger;
          if (st) st.kill();
          masterTimelineRef.current.kill();
          masterTimelineRef.current = null;
        }
        ScrollTrigger.getAll().forEach((trigger) => {
          try {
            trigger.kill();
          } catch (e) {
            /* ignore */
          }
        });
        gsap.set("#scroll-container", { clearProps: "all" });
      } catch (error) {
        console.warn("Cleanup error:", error);
      }
      if (setShowNavbar) setShowNavbar(true);
    };
  }, [isMobile, setShowNavbar, isLoading, introDone, animationsReady]);

  return (
    <>
      <SEO
        title="evolve — a design ecosystem built around your journey"
        description="Not just a course. Not just a community. evolve brings together learning, mentorship, sessions, and community, so you can pick what moves you forward, wherever you are in design."
        path="/"
      />
      <div
        id="scroll-container"
        className="relative w-full h-screen bg-black lowercase"
        style={{
          perspectiveOrigin: "50% 50%",
          overflow: "hidden",
          position: "relative"
        }}
      >
        {/* Grain texture */}
        {animationsReady && (
          <div
            style={{
              position: "fixed",
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

        {/* Scene 1 (intro) */}
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
                console.log("Intro complete! Enabling scroll...");
                setIntroDone(true);
                if (onIntroComplete) onIntroComplete();
              }}
            />
          </Suspense>
        </div>

        {/* SceneNew - First scrollable scene */}
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

        {/* Scene 1_4 */}
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
