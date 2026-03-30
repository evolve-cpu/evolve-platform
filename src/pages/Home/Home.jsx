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
  SCENE_NEW_STEP_LABELS
} from "./SceneNew";

// Existing scenes in new order
import Scene1_1, {
  useScene1_1Timeline,
  setCompletedState,
  SCENE1_1_STEP_LABELS
} from "./Scene1_1";

import Scene1_2, {
  useScene1_2Timeline,
  SCENE1_2_STEP_LABELS
} from "./Scene1_2";

// Scene1_3 REMOVED

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
  const sceneNewRefs = useRef({}); // NEW SCENE REFS
  const scene1_1Refs = useRef({});
  const scene1_2Refs = useRef({});
  // scene1_3Refs REMOVED
  const scene1_4Refs = useRef({});
  const snapPointsRef = useRef([]);

  const scene1EndScrollRef = useRef(null);
  const hasShownNavbarRef = useRef(false);
  const logoClickedRef = useRef(false); // Track if logo was clicked to prevent auto-hide

  // Intro completion flag
  const [introDone, setIntroDone] = useState(false);

  // CRITICAL: Track if animations should be enabled
  const [animationsReady, setAnimationsReady] = useState(false);

  // Updated logic: treat tablets as desktop
  const [isMobile, setIsMobile] = useState(() => {
    if (forceLayout === "mobile") return true;
    if (forceLayout === "desktop") return false;
    if (deviceType) return deviceType === "mobile";
    return window.innerWidth <= 768;
  });

  const masterTimelineRef = useRef(null);

  // DEFER ANIMATIONS: Wait for images to load before enabling heavy animations
  useEffect(() => {
    if (isLoading) return;

    // Small delay after loading completes to ensure DOM is ready
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

  // Lock body scroll until intro is done
  useLayoutEffect(() => {
    document.body.style.overflow = introDone ? "auto" : "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [introDone]);

  // Hide navbar during intro
  useLayoutEffect(() => {
    if (setShowNavbar && !introDone) {
      setShowNavbar(false);
      hasShownNavbarRef.current = false;
    }
  }, [introDone, setShowNavbar]);

  // ========== LOGO CLICK HANDLER - IMPROVED ==========
  const handleLogoClick = React.useCallback(() => {
    console.log("=== LOGO CLICKED ===");
    console.log("introDone:", introDone);
    console.log("animationsReady:", animationsReady);
    console.log("masterTimelineRef.current:", masterTimelineRef.current);
    console.log("snapPointsRef.current:", snapPointsRef.current);

    // If intro not done yet, just scroll to top
    if (!introDone || !animationsReady) {
      console.log("Intro not done or animations not ready - scrolling to top");
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
      return;
    }

    const scrollTrigger = masterTimelineRef.current?.scrollTrigger;

    if (!scrollTrigger) {
      console.warn("ScrollTrigger not available - scrolling to top");
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
      return;
    }

    if (!snapPointsRef.current || snapPointsRef.current.length < 2) {
      console.warn("Snap points not ready - scrolling to top");
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
      return;
    }

    // Get the first scene's progress (index 1, since 0 is Scene1 intro)
    const sceneNewFirstStepProgress = snapPointsRef.current[1] || 0.05;
    const targetScroll =
      scrollTrigger.start +
      (scrollTrigger.end - scrollTrigger.start) * sceneNewFirstStepProgress;

    console.log("ScrollTrigger details:", {
      start: scrollTrigger.start,
      end: scrollTrigger.end,
      currentScroll: window.pageYOffset,
      targetScroll: targetScroll,
      targetProgress: sceneNewFirstStepProgress,
      currentProgress: scrollTrigger.progress
    });

    // Kill any existing scroll animations
    gsap.killTweensOf(window);

    // Use gsap ScrollToPlugin for reliable scrolling
    gsap.to(window, {
      duration: 1.2,
      scrollTo: {
        y: targetScroll,
        autoKill: false
      },
      ease: "power2.inOut",
      onStart: () => {
        console.log("Scroll animation started");
        // Mark that logo was clicked - navbar should stay visible
        logoClickedRef.current = true;
      },
      onComplete: () => {
        console.log("Scroll animation completed");
      }
    });

    // Keep navbar visible when user clicks logo
    if (setShowNavbar) {
      setShowNavbar(true);
      hasShownNavbarRef.current = true;
    }
  }, [setShowNavbar, introDone, animationsReady]);

  // Attach to window with dependencies
  useLayoutEffect(() => {
    console.log("Attaching handleLogoClick to window");
    window.handleLogoClick = handleLogoClick;

    // Also create a global flag to indicate we're on the home page
    window.isOnHomePage = true;

    return () => {
      console.log("Removing handleLogoClick from window");
      delete window.handleLogoClick;
      delete window.isOnHomePage;
    };
  }, [handleLogoClick]);

  // Update isMobile when deviceType changes
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

  // ========== BUILD MASTER TIMELINE (only after intro AND animations are ready) ==========
  useLayoutEffect(() => {
    // CRITICAL: Don't build timeline until animations are ready
    if (isLoading || !introDone || !animationsReady) {
      console.log("Waiting for conditions:", {
        isLoading,
        introDone,
        animationsReady
      });
      return;
    }

    if (
      !scene1Refs.current.container ||
      !sceneNewRefs.current.container || // NEW SCENE CHECK
      !scene1_1Refs.current.container ||
      !scene1_2Refs.current.container ||
      // scene1_3Refs.current.container REMOVED
      !scene1_4Refs.current.container
    ) {
      console.log("Waiting for refs to be ready");
      return;
    }

    console.log("Building master timeline...");

    const id = requestAnimationFrame(() => {
      // Initialize SceneNew to START state (NEW SCENE - inherits Scene1_1's initial logic)
      // You can add specific initial states for SceneNew here if needed
      gsap.set(sceneNewRefs.current.container, {
        opacity: 0,
        willChange: "transform, opacity"
      });

      // Initialize Scene1_2 to START state
      gsap.set(scene1_2Refs.current.container, {
        y: "-100%",
        willChange: "transform"
      });

      // Initialize Scene1_1 to START state (moved to middle position)
      gsap.set(scene1_1Refs.current.container, {
        x: "100%", // Slides in from right (like old Scene1_3)
        willChange: "transform"
      });

      // Initialize Scene1_4 to START state
      gsap.set(scene1_4Refs.current.container, {
        y: "120%",
        rotation: 15,
        transformOrigin: "center center",
        opacity: 0,
        scale: 0.9,
        willChange: "transform, opacity"
      });

      // Get timelines for each scene
      const tlNew = useSceneNewTimeline(sceneNewRefs.current, isMobile); // NEW SCENE TIMELINE
      const tl2 = useScene1_2Timeline(scene1_2Refs.current, isMobile);
      const tl3 = useScene1_1Timeline(scene1_1Refs.current, isMobile); // Scene1_1 is now 3rd
      const tl4 = useScene1_4Timeline(scene1_4Refs.current, isMobile);

      if (masterTimelineRef.current) {
        masterTimelineRef.current.kill();
      }

      const SECTIONS = 5; // Still 5 sections (Scene1, SceneNew, Scene1_2, Scene1_1, Scene1_4)
      const SCROLL_PER_SECTION = 8;
      // Cap viewport height to 1080 to prevent excessive scrolling on large screens like MacBook 16
      // const vh = Math.max(Math.min(window.innerHeight, 1080), 400);
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

      // ========== TRANSITION 2: SceneNew → Scene1_2 (VERTICAL SLIDE) ==========
      master
        .to(sceneNewRefs.current.container, {
          y: "100%",
          duration: 1.2,
          ease: "power2.inOut",
          force3D: true
        })
        .to(
          scene1_2Refs.current.container,
          {
            y: "0%",
            duration: 1.2,
            ease: "power2.inOut",
            force3D: true
          },
          "<"
        );

      // Add Scene1_2 timeline
      if (tl2) master.add(tl2);

      // ========== TRANSITION 3: Scene1_2 → Scene1_1 (HORIZONTAL SLIDE - like old Scene1_2 → Scene1_3) ==========
      master
        .to(scene1_2Refs.current.container, {
          x: "-100%",
          duration: 1.2,
          ease: "power2.inOut",
          force3D: true
        })
        .to(
          scene1_1Refs.current.container,
          {
            x: "0%",
            duration: 1.2,
            ease: "power2.inOut",
            force3D: true
          },
          "<"
        );

      // Add Scene1_1 timeline
      if (tl3) master.add(tl3);

      // ========== TRANSITION 4: Scene1_1 → Scene1_4 (ZOOM/FADE - like old Scene1_3 → Scene1_4) ==========
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
      addStepsFromTimeline(tlNew, SCENE_NEW_STEP_LABELS || []); // NEW SCENE STEPS
      addStepsFromTimeline(tl2, SCENE1_2_STEP_LABELS || []);
      addStepsFromTimeline(tl3, SCENE1_1_STEP_LABELS || []);
      addStepsFromTimeline(tl4, []);
      stepProgresses.push(1);

      const snapPoints = Array.from(new Set(stepProgresses)).sort(
        (a, b) => a - b
      );

      const SCENE_NEW_FIRST_STEP_PROGRESS = snapPoints[1] || 0.05; // NEW SCENE first checkpoint
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
          duration: 1.8,
          delay: 0,
          ease: "power2.out",
          onStart: () => {
            ScrollTrigger.clearScrollMemory();
          }
        },

        onScrubComplete: () => {
          const currentProgress = st.progress;
          const closest = snapPoints.reduce((prev, curr) => {
            return Math.abs(curr - currentProgress) <
              Math.abs(prev - currentProgress)
              ? curr
              : prev;
          });

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
            const closest = snapPoints.reduce((prev, curr) => {
              return Math.abs(curr - self.progress) <
                Math.abs(prev - self.progress)
                ? curr
                : prev;
            });

            gsap.to(window, {
              scrollTo: {
                y: self.start + (self.end - self.start) * closest
              },
              duration: 0.2,
              ease: "power2.out"
            });
          }

          // NAVBAR CONTROL - Now based on NEW SCENE first step
          if (
            setShowNavbar &&
            !hasShownNavbarRef.current &&
            self.progress > SCENE_NEW_FIRST_STEP_PROGRESS
          ) {
            setShowNavbar(true);
            hasShownNavbarRef.current = true;
          }

          // Only hide navbar if user scrolled naturally (not via logo click)
          if (
            setShowNavbar &&
            hasShownNavbarRef.current &&
            self.progress <= SCENE_NEW_FIRST_STEP_PROGRESS &&
            !logoClickedRef.current // Don't hide if logo was clicked
          ) {
            setShowNavbar(false);
            hasShownNavbarRef.current = false;
          }

          // Reset logoClicked flag when scrolling forward again
          if (
            self.progress > SCENE_NEW_FIRST_STEP_PROGRESS &&
            logoClickedRef.current
          ) {
            logoClickedRef.current = false;
          }

          if (
            !scene1EndScrollRef.current &&
            self.progress > SCENE_NEW_FIRST_STEP_PROGRESS
          ) {
            scene1EndScrollRef.current = self.scroll();
          }
        }
      });

      master.scrollTrigger = st;
      masterTimelineRef.current = master;

      console.log("Master timeline created successfully");
      console.log("ScrollTrigger start:", st.start, "end:", st.end);
    });

    // Custom event listener for scrolling to first scene
    const handleScrollToSceneNew = () => {
      console.log("handleScrollToSceneNew event triggered");
      const scrollTrigger = masterTimelineRef.current?.scrollTrigger;
      if (scrollTrigger && snapPointsRef.current.length > 0) {
        const targetProgress = snapPointsRef.current[1];
        const targetScroll =
          scrollTrigger.start +
          (scrollTrigger.end - scrollTrigger.start) * targetProgress;

        gsap.to(window, {
          duration: 1.2,
          scrollTo: {
            y: targetScroll,
            autoKill: false
          },
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
            // ignore
          }
        });

        gsap.set("#scroll-container", { clearProps: "all" });
      } catch (error) {
        console.warn("Cleanup error:", error);
      }

      if (setShowNavbar) {
        setShowNavbar(true);
      }
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
        {/* Grain texture - load last for better perceived performance */}
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

        {/* Scene 1 (intro) - Only visible until intro completes */}
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

        {/* NEW SCENE - First scrollable scene (takes over Scene1_1's role) */}
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

        {/* Scene 1_2 */}
        <div
          ref={(el) => {
            if (scene1_2Refs.current) scene1_2Refs.current.container = el;
          }}
          className="absolute inset-0 w-full h-full"
          style={{ y: "-100%", zIndex: 4 }}
        >
          <Scene1_2 ref={scene1_2Refs} isMobile={isMobile} />
        </div>

        {/* Scene 1_1 - Now in 3rd position, slides in from RIGHT */}
        <div
          ref={(el) => {
            if (scene1_1Refs.current) scene1_1Refs.current.container = el;
          }}
          className="absolute inset-0 w-full h-full"
          style={{ x: "100%", zIndex: 4 }}
        >
          <Scene1_1 ref={scene1_1Refs} isMobile={isMobile} />
        </div>

        {/* Scene 1_4 */}
        <div
          ref={(el) => {
            if (scene1_4Refs.current) scene1_4Refs.current.container = el;
          }}
          className="absolute inset-0 w-full h-full"
          style={{ y: "100%", zIndex: 5 }}
        >
          <Scene1_4 ref={scene1_4Refs} isMobile={isMobile} />
        </div>
      </div>
    </>
  );
};

export default Home;
