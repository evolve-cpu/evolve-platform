// import React, { useLayoutEffect, useRef, useState } from "react";
// import { gsap } from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import Scene1 from "./Scene1";
// import Scene1_1, {
//   useScene1_1Timeline,
//   setCompletedState,
//   SCENE1_1_STEP_LABELS
// } from "./Scene1_1";

// import Scene1_2, {
//   useScene1_2Timeline,
//   SCENE1_2_STEP_LABELS
// } from "./Scene1_2";

// import Scene1_3, {
//   useScene1_3Timeline,
//   SCENE1_3_STEP_LABELS
// } from "./Scene1_3";

// import Scene1_4, { useScene1_4Timeline } from "./Scene1_4";
// import GrainTexture from "../../components/GrainTexture";

// gsap.registerPlugin(ScrollTrigger);

// const Home = ({
//   forceLayout = "auto",
//   setShowNavbar,
//   isLoading,
//   deviceType,
//   onIntroComplete
// }) => {
//   const scene1Refs = useRef({});
//   const scene1_1Refs = useRef({});
//   const scene1_2Refs = useRef({});
//   const scene1_3Refs = useRef({});
//   const scene1_4Refs = useRef({});
//   const snapPointsRef = useRef([]); // ADD THIS

//   const scene1EndScrollRef = useRef(null);
//   const hasShownNavbarRef = useRef(false);

//   // Intro completion flag
//   const [introDone, setIntroDone] = useState(false);

//   // Updated logic: treat tablets as desktop
//   const [isMobile, setIsMobile] = useState(() => {
//     if (forceLayout === "mobile") return true;
//     if (forceLayout === "desktop") return false;
//     if (deviceType) return deviceType === "mobile";
//     return window.innerWidth <= 768;
//   });

//   const masterTimelineRef = useRef(null);

//   // Lock body scroll until intro is done
//   useLayoutEffect(() => {
//     document.body.style.overflow = introDone ? "auto" : "hidden";
//     return () => {
//       document.body.style.overflow = "auto";
//     };
//   }, [introDone]);

//   // Hide navbar during intro
//   useLayoutEffect(() => {
//     if (setShowNavbar && !introDone) {
//       setShowNavbar(false);
//       hasShownNavbarRef.current = false;
//     }
//   }, [introDone, setShowNavbar]);

//   // ========== LOGO CLICK HANDLER ==========

//   const handleLogoClick = () => {
//     console.log("Logo clicked - returning to Scene1_1");

//     setTimeout(() => {
//       const scrollTrigger = masterTimelineRef.current?.scrollTrigger;
//       if (scrollTrigger) {
//         // Get the first Scene1_1 step position (index 1 in snapPoints)
//         const scene1_1FirstStepProgress = snapPointsRef.current[1] || 0.05;
//         const targetScroll =
//           scrollTrigger.start +
//           (scrollTrigger.end - scrollTrigger.start) * scene1_1FirstStepProgress;

//         window.scrollTo({
//           top: targetScroll,
//           behavior: "smooth"
//         });
//       }

//       // DELETE THESE LINES - they reset the timeline:
//       // if (masterTimelineRef.current) {
//       //   masterTimelineRef.current.seek(0);
//       //   masterTimelineRef.current.pause();
//       // }

//       if (scene1_1Refs.current) {
//         setCompletedState(scene1_1Refs.current, isMobile);
//       }

//       // DELETE THESE SCENE RESETS - they conflict with scroll position:
//       // if (scene1_1Refs.current.container) {
//       //   gsap.set(scene1_1Refs.current.container, { opacity: 1, y: 0 });
//       // }
//       // if (scene1Refs.current.container) {
//       //   gsap.set(scene1Refs.current.container, { opacity: 0, scale: 1.5 });
//       // }
//       // if (scene1_2Refs.current.container) {
//       //   gsap.set(scene1_2Refs.current.container, { y: "-100%" });
//       // }
//       // if (scene1_3Refs.current.container) {
//       //   gsap.set(scene1_3Refs.current.container, { x: "100%" });
//       // }
//       // if (scene1_4Refs.current.container) {
//       //   gsap.set(scene1_4Refs.current.container, { y: "-100%" });
//       // }

//       if (setShowNavbar) {
//         setShowNavbar(false);
//         hasShownNavbarRef.current = false;
//       }
//     }, 500);
//   };

//   useLayoutEffect(() => {
//     window.handleLogoClick = handleLogoClick;
//     return () => {
//       delete window.handleLogoClick;
//     };
//   }, [isMobile, setShowNavbar]);

//   // Update isMobile when deviceType changes
//   useLayoutEffect(() => {
//     if (forceLayout !== "auto") {
//       setIsMobile(forceLayout === "mobile");
//       return;
//     }

//     if (deviceType) {
//       setIsMobile(deviceType === "mobile");
//       return;
//     }

//     const handleResize = () => setIsMobile(window.innerWidth <= 768);
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, [forceLayout, deviceType]);

//   // ========== BUILD MASTER TIMELINE (only after intro is done) ==========
//   useLayoutEffect(() => {
//     if (isLoading || !introDone) return;

//     if (
//       !scene1Refs.current.container ||
//       !scene1_1Refs.current.container ||
//       !scene1_2Refs.current.container ||
//       !scene1_3Refs.current.container ||
//       !scene1_4Refs.current.container
//     ) {
//       return;
//     }

//     const id = requestAnimationFrame(() => {
//       // Initialize Scene1_1 to START state
//       gsap.set(scene1_1Refs.current.rightCloud, { opacity: 0, y: -50 });
//       gsap.set(scene1_1Refs.current.leftCloud, { opacity: 0, y: 80 });
//       gsap.set(scene1_1Refs.current.floor, { opacity: 0, y: 150 });
//       gsap.set(scene1_1Refs.current.leftElement, { opacity: 0, x: -200 });
//       gsap.set(scene1_1Refs.current.rightElement, { opacity: 0, x: 200 });
//       gsap.set(scene1_1Refs.current.text, { opacity: 0, y: 30 });
//       gsap.set(scene1_1Refs.current.objectsContainer, { opacity: 0 });
//       gsap.set(scene1_1Refs.current.ellipse, { opacity: 0 });

//       if (
//         scene1_1Refs.current.object1 &&
//         scene1_1Refs.current.object2 &&
//         scene1_1Refs.current.object3
//       ) {
//         gsap.set(
//           [
//             scene1_1Refs.current.object1,
//             scene1_1Refs.current.object2,
//             scene1_1Refs.current.object3
//           ],
//           { y: 0, opacity: 1, scale: 1 }
//         );
//       }
//       if (
//         scene1_1Refs.current.line1 &&
//         scene1_1Refs.current.line2 &&
//         scene1_1Refs.current.line3
//       ) {
//         gsap.set(
//           [
//             scene1_1Refs.current.line1,
//             scene1_1Refs.current.line2,
//             scene1_1Refs.current.line3
//           ],
//           { height: 0, opacity: 0 }
//         );
//       }

//       gsap.set(scene1_2Refs.current.container, { y: "-100%" });
//       gsap.set(scene1_3Refs.current.container, { x: "100%" });
//       gsap.set(scene1_4Refs.current.container, {
//         y: "120%",
//         rotation: 15,
//         transformOrigin: "center center",
//         opacity: 0,
//         scale: 0.9
//       });

//       const tl2 = useScene1_1Timeline(scene1_1Refs.current, isMobile);
//       const tl3 = useScene1_2Timeline(scene1_2Refs.current, isMobile);
//       const tl4 = useScene1_3Timeline(scene1_3Refs.current, isMobile);
//       const tl5 = useScene1_4Timeline(scene1_4Refs.current, isMobile);

//       if (scene1_3Refs.current.screen1) {
//         gsap.set(scene1_3Refs.current.screen1, {
//           yPercent: 0,
//           autoAlpha: 1,
//           zIndex: 2
//         });
//       }
//       if (scene1_3Refs.current.screen2) {
//         gsap.set(scene1_3Refs.current.screen2, {
//           yPercent: isMobile ? 100 : -100,
//           autoAlpha: 1,
//           zIndex: 1
//         });
//       }

//       if (masterTimelineRef.current) {
//         masterTimelineRef.current.kill();
//       }

//       const SECTIONS = 5;
//       // const SCROLL_PER_SECTION = 4;
//       const SCROLL_PER_SECTION = 8;
//       const vh = Math.max(window.innerHeight, 400);
//       const scrollLength = vh * SECTIONS * SCROLL_PER_SECTION;

//       const SCENE1_END_PROGRESS = 0.03;

//       // const master = gsap.timeline({ paused: true });
//       const master = gsap.timeline({ paused: true });

//       masterTimelineRef.current = master;

//       // Transition: fade Scene1 out, Scene1_1 in
//       master
//         .to(scene1_1Refs.current.container, {
//           opacity: 1,
//           duration: 0.1,
//           ease: "power2.in",
//           force3D: true
//         })
//         .to(
//           scene1Refs.current.container,
//           {
//             scale: 1.5,
//             opacity: 0,
//             duration: 0.1,
//             ease: "power2.inOut",
//             force3D: true
//           },
//           "<"
//         );

//       if (tl2) master.add(tl2);

//       master
//         .to(scene1_1Refs.current.container, {
//           y: "100%",
//           duration: 1.2,
//           ease: "power2.inOut",
//           force3D: true
//         })
//         .to(
//           scene1_2Refs.current.container,
//           {
//             y: "0%",
//             duration: 1.2,
//             ease: "power2.inOut",
//             force3D: true
//           },
//           "<"
//         );

//       if (tl3) master.add(tl3);

//       master
//         .to(scene1_2Refs.current.container, {
//           x: "-100%",
//           duration: 1.2,
//           ease: "power2.inOut",
//           force3D: true
//         })
//         .to(
//           scene1_3Refs.current.container,
//           {
//             x: "0%",
//             duration: 1.2,
//             ease: "power2.inOut",
//             force3D: true
//           },
//           "<"
//         );

//       if (tl4) master.add(tl4);

//       master
//         .to(scene1_4Refs.current.container, {
//           opacity: 1,
//           duration: 0.3,
//           ease: "none"
//         })
//         .to(
//           scene1_4Refs.current.container,
//           {
//             y: "0%",
//             rotation: 0,
//             scale: 1,
//             duration: 1.8,
//             ease: "power2.inOut"
//           },
//           "<0.1"
//         );

//       if (tl5) master.add(tl5);

//       // ====== BUILD STEP SNAP POINTS FROM CHILD TIMELINES ======
//       const masterDur = master.duration();
//       const stepProgresses = [];

//       // helper to add steps from a timeline based on its labels
//       const addStepsFromTimeline = (tl, labels) => {
//         if (!tl || !labels || !labels.length) return;
//         const start = tl.startTime();

//         labels.forEach((label) => {
//           const localTime = tl.labels?.[label];
//           if (typeof localTime !== "number") return;
//           const globalTime = start + localTime; // time on master
//           stepProgresses.push(globalTime / masterDur);
//         });
//       };

//       // always start at the very beginning
//       stepProgresses.push(0);

//       // scene1_1 internal beats
//       addStepsFromTimeline(tl2, SCENE1_1_STEP_LABELS || []);

//       // scene1_2 internal beats
//       addStepsFromTimeline(tl3, SCENE1_2_STEP_LABELS || []);

//       // scene1_3 internal beats
//       addStepsFromTimeline(tl4, SCENE1_3_STEP_LABELS || []);

//       // scene1_4 internal beats
//       addStepsFromTimeline(tl5, []);

//       // make sure we also have the very end as a step
//       stepProgresses.push(1);

//       // sort + dedupe
//       const snapPoints = Array.from(new Set(stepProgresses)).sort(
//         (a, b) => a - b
//       );

//       // ADD THIS: Calculate where Scene1_1 first step actually is
//       const SCENE1_1_FIRST_STEP_PROGRESS = snapPoints[0] || 0.05; // First step after 0

//       snapPointsRef.current = snapPoints; // ADD THIS

//       // ADD THIS: Track last update time for velocity detection
//       let lastScrollTime = Date.now();
//       let scrollVelocity = 0;

//       const st = ScrollTrigger.create({
//         trigger: "#scroll-container",
//         start: "top top",
//         end: `+=${scrollLength}`,
//         pin: true,
//         anticipatePin: 1,
//         fastScrollEnd: true,
//         invalidateOnRefresh: true,

//         animation: master,
//         scrub: 0.6,
//         snap: {
//           snapTo: snapPoints, // Simply pass the array directly
//           // duration: { min: 0.2, max: 0.8 }, // Adaptive duration
//           duration: 1.8, // Adaptive duration
//           delay: 0, // CHANGE THIS TO 0
//           // ease: "power1.inOut",
//           ease: "power2.out",
//           // inertia: false, // Disables momentum scrolling
//           onStart: () => {
//             // Optional: Force immediate snap start
//             ScrollTrigger.clearScrollMemory();
//           }
//         },

//         onScrubComplete: () => {
//           // CRITICAL: This triggers immediately when scroll stops
//           // Force snap to activate without waiting
//           const currentProgress = st.progress;
//           const closest = snapPoints.reduce((prev, curr) => {
//             return Math.abs(curr - currentProgress) <
//               Math.abs(prev - currentProgress)
//               ? curr
//               : prev;
//           });

//           if (Math.abs(closest - currentProgress) > 0.001) {
//             gsap.to(st, {
//               progress: closest,
//               duration: 0,
//               ease: "power2.out",
//               overwrite: true
//             });
//           }
//         },

//         onUpdate: (self) => {
//           // Calculate scroll velocity
//           const now = Date.now();
//           const timeDiff = now - lastScrollTime;
//           const progressDiff = Math.abs(self.progress - self.previous);
//           scrollVelocity = progressDiff / timeDiff;
//           lastScrollTime = now;

//           // If velocity drops below threshold, trigger snap immediately
//           if (scrollVelocity < 0.0001 && !self.isActive) {
//             const closest = snapPoints.reduce((prev, curr) => {
//               return Math.abs(curr - self.progress) <
//                 Math.abs(prev - self.progress)
//                 ? curr
//                 : prev;
//             });

//             gsap.to(window, {
//               scrollTo: {
//                 y: self.start + (self.end - self.start) * closest
//               },
//               duration: 0.2,
//               ease: "power2.out"
//             });
//           }

//           // REPLACE SCENE1_END_PROGRESS with SCENE1_1_FIRST_STEP_PROGRESS:
//           if (
//             setShowNavbar &&
//             !hasShownNavbarRef.current &&
//             self.progress > SCENE1_1_FIRST_STEP_PROGRESS
//           ) {
//             setShowNavbar(true);
//             hasShownNavbarRef.current = true;
//           }

//           if (
//             setShowNavbar &&
//             hasShownNavbarRef.current &&
//             self.progress <= SCENE1_1_FIRST_STEP_PROGRESS
//           ) {
//             setShowNavbar(false);
//             hasShownNavbarRef.current = false;
//           }

//           if (
//             !scene1EndScrollRef.current &&
//             self.progress > SCENE1_1_FIRST_STEP_PROGRESS
//           ) {
//             scene1EndScrollRef.current = self.scroll();
//           }
//         }
//       });

//       // store for cleanup
//       master.scrollTrigger = st;
//       masterTimelineRef.current = master;
//     });

//     const handleScrollToScene1_1 = () => {
//       const scrollTrigger = masterTimelineRef.current?.scrollTrigger;
//       if (scrollTrigger && snapPointsRef.current.length > 0) {
//         // Use first snap point (Scene1_1 first step)
//         const targetProgress = snapPointsRef.current[0];
//         const targetScroll =
//           scrollTrigger.start +
//           (scrollTrigger.end - scrollTrigger.start) * targetProgress;

//         window.scrollTo({
//           top: targetScroll,
//           behavior: "smooth"
//         });
//       }
//     };
//     window.addEventListener("scrollToScene1_1", handleScrollToScene1_1);

//     return () => {
//       cancelAnimationFrame(id);
//       window.removeEventListener("scrollToScene1_1", handleScrollToScene1_1);

//       try {
//         if (masterTimelineRef.current) {
//           const st = masterTimelineRef.current.scrollTrigger;
//           if (st) st.kill();
//           masterTimelineRef.current.kill();
//           masterTimelineRef.current = null;
//         }

//         ScrollTrigger.getAll().forEach((trigger) => {
//           try {
//             trigger.kill();
//           } catch (e) {
//             // ignore
//           }
//         });

//         gsap.set("#scroll-container", { clearProps: "all" });
//       } catch (error) {
//         console.warn("Cleanup error:", error);
//       }

//       if (setShowNavbar) {
//         setShowNavbar(true);
//       }
//     };
//   }, [isMobile, setShowNavbar, isLoading, introDone]);

//   return (
//     <div
//       id="scroll-container"
//       className="relative w-full h-screen bg-black lowercase"
//       style={{
//         perspectiveOrigin: "50% 50%",
//         overflow: "hidden",
//         position: "relative"
//       }}
//     >
//       <div
//         style={{
//           position: "fixed",
//           inset: 0,
//           pointerEvents: "none",
//           zIndex: 9999,
//           mixBlendMode: "overlay",
//           opacity: 0.2,
//           filter: "contrast(100%) brightness(90%)"
//         }}
//       >
//         <GrainTexture />
//       </div>

//       {/* Scene 1 (intro) - Only visible until intro completes */}
//       <div
//         className="absolute inset-0 w-full h-full"
//         style={{
//           willChange: "transform, opacity",
//           pointerEvents: introDone ? "none" : "auto",
//           zIndex: introDone ? 1 : 10,
//           // opacity: introDone ? 0 : 1
//           opacity: 1
//         }}
//       >
//         <Scene1
//           ref={scene1Refs}
//           isMobile={isMobile}
//           // onIntroComplete={() => {
//           //   console.log("Intro complete! Enabling scroll...");
//           //   setIntroDone(true);
//           // }}
//           onIntroComplete={() => {
//             console.log("Intro complete! Enabling scroll...");
//             setIntroDone(true);
//             if (onIntroComplete) onIntroComplete(); // Call parent callback
//           }}
//         />
//       </div>

//       {/* Scene 1_1 - Hidden until intro completes */}
//       <div
//         ref={(el) => {
//           if (scene1_1Refs.current) scene1_1Refs.current.container = el;
//         }}
//         className="absolute inset-0 w-full h-full"
//         style={{
//           opacity: 0,
//           pointerEvents: introDone ? "auto" : "none",
//           zIndex: 3
//         }}
//       >
//         <Scene1_1 ref={scene1_1Refs} isMobile={isMobile} />
//       </div>

//       {/* Scene 1_2 */}
//       <div
//         ref={(el) => {
//           if (scene1_2Refs.current) scene1_2Refs.current.container = el;
//         }}
//         className="absolute inset-0 w-full h-full"
//         style={{ y: "-100%", zIndex: 4 }}
//       >
//         <Scene1_2 ref={scene1_2Refs} isMobile={isMobile} />
//       </div>

//       {/* Scene 1_3 */}
//       <div
//         ref={(el) => {
//           if (scene1_3Refs.current) scene1_3Refs.current.container = el;
//         }}
//         className="absolute inset-0 w-full h-full"
//         style={{ x: "100%", zIndex: 4 }}
//       >
//         <Scene1_3 ref={scene1_3Refs} isMobile={isMobile} />
//       </div>

//       {/* Scene 1_4 */}
//       <div
//         ref={(el) => {
//           if (scene1_4Refs.current) scene1_4Refs.current.container = el;
//         }}
//         className="absolute inset-0 w-full h-full"
//         style={{ y: "100%", zIndex: 5 }}
//       >
//         <Scene1_4 ref={scene1_4Refs} isMobile={isMobile} />
//       </div>
//     </div>
//   );
// };

// export default Home;

import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Scene1 from "./Scene1";
import Scene1_1, {
  useScene1_1Timeline,
  setCompletedState,
  SCENE1_1_STEP_LABELS
} from "./Scene1_1";

import Scene1_2, {
  useScene1_2Timeline,
  SCENE1_2_STEP_LABELS
} from "./Scene1_2";

import Scene1_3, {
  useScene1_3Timeline,
  SCENE1_3_STEP_LABELS
} from "./Scene1_3";

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
  const scene1_1Refs = useRef({});
  const scene1_2Refs = useRef({});
  const scene1_3Refs = useRef({});
  const scene1_4Refs = useRef({});
  const snapPointsRef = useRef([]);

  const scene1EndScrollRef = useRef(null);
  const hasShownNavbarRef = useRef(false);

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

  // ========== LOGO CLICK HANDLER ==========
  const handleLogoClick = () => {
    console.log("Logo clicked - returning to Scene1_1");

    setTimeout(() => {
      const scrollTrigger = masterTimelineRef.current?.scrollTrigger;
      if (scrollTrigger) {
        const scene1_1FirstStepProgress = snapPointsRef.current[1] || 0.05;
        const targetScroll =
          scrollTrigger.start +
          (scrollTrigger.end - scrollTrigger.start) * scene1_1FirstStepProgress;

        window.scrollTo({
          top: targetScroll,
          behavior: "smooth"
        });
      }

      if (scene1_1Refs.current) {
        setCompletedState(scene1_1Refs.current, isMobile);
      }

      if (setShowNavbar) {
        setShowNavbar(false);
        hasShownNavbarRef.current = false;
      }
    }, 500);
  };

  useLayoutEffect(() => {
    window.handleLogoClick = handleLogoClick;
    return () => {
      delete window.handleLogoClick;
    };
  }, [isMobile, setShowNavbar]);

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
    if (isLoading || !introDone || !animationsReady) return;

    if (
      !scene1Refs.current.container ||
      !scene1_1Refs.current.container ||
      !scene1_2Refs.current.container ||
      !scene1_3Refs.current.container ||
      !scene1_4Refs.current.container
    ) {
      return;
    }

    const id = requestAnimationFrame(() => {
      // Initialize Scene1_1 to START state (use will-change for optimization)
      gsap.set(scene1_1Refs.current.rightCloud, {
        opacity: 0,
        y: -50,
        willChange: "transform, opacity"
      });
      gsap.set(scene1_1Refs.current.leftCloud, {
        opacity: 0,
        y: 80,
        willChange: "transform, opacity"
      });
      gsap.set(scene1_1Refs.current.floor, {
        opacity: 0,
        y: 150,
        willChange: "transform, opacity"
      });
      gsap.set(scene1_1Refs.current.leftElement, {
        opacity: 0,
        x: -200,
        willChange: "transform, opacity"
      });
      gsap.set(scene1_1Refs.current.rightElement, {
        opacity: 0,
        x: 200,
        willChange: "transform, opacity"
      });
      gsap.set(scene1_1Refs.current.text, {
        opacity: 0,
        y: 30,
        willChange: "transform, opacity"
      });
      gsap.set(scene1_1Refs.current.objectsContainer, {
        opacity: 0,
        willChange: "opacity"
      });
      gsap.set(scene1_1Refs.current.ellipse, {
        opacity: 0,
        willChange: "opacity"
      });

      if (
        scene1_1Refs.current.object1 &&
        scene1_1Refs.current.object2 &&
        scene1_1Refs.current.object3
      ) {
        gsap.set(
          [
            scene1_1Refs.current.object1,
            scene1_1Refs.current.object2,
            scene1_1Refs.current.object3
          ],
          { y: 0, opacity: 1, scale: 1, willChange: "transform, opacity" }
        );
      }
      if (
        scene1_1Refs.current.line1 &&
        scene1_1Refs.current.line2 &&
        scene1_1Refs.current.line3
      ) {
        gsap.set(
          [
            scene1_1Refs.current.line1,
            scene1_1Refs.current.line2,
            scene1_1Refs.current.line3
          ],
          { height: 0, opacity: 0, willChange: "height, opacity" }
        );
      }

      gsap.set(scene1_2Refs.current.container, {
        y: "-100%",
        willChange: "transform"
      });
      gsap.set(scene1_3Refs.current.container, {
        x: "100%",
        willChange: "transform"
      });
      gsap.set(scene1_4Refs.current.container, {
        y: "120%",
        rotation: 15,
        transformOrigin: "center center",
        opacity: 0,
        scale: 0.9,
        willChange: "transform, opacity"
      });

      const tl2 = useScene1_1Timeline(scene1_1Refs.current, isMobile);
      const tl3 = useScene1_2Timeline(scene1_2Refs.current, isMobile);
      const tl4 = useScene1_3Timeline(scene1_3Refs.current, isMobile);
      const tl5 = useScene1_4Timeline(scene1_4Refs.current, isMobile);

      if (scene1_3Refs.current.screen1) {
        gsap.set(scene1_3Refs.current.screen1, {
          yPercent: 0,
          autoAlpha: 1,
          zIndex: 2
        });
      }
      if (scene1_3Refs.current.screen2) {
        gsap.set(scene1_3Refs.current.screen2, {
          yPercent: isMobile ? 100 : -100,
          autoAlpha: 1,
          zIndex: 1
        });
      }

      if (masterTimelineRef.current) {
        masterTimelineRef.current.kill();
      }

      const SECTIONS = 5;
      const SCROLL_PER_SECTION = 8;
      const vh = Math.max(window.innerHeight, 400);
      const scrollLength = vh * SECTIONS * SCROLL_PER_SECTION;

      const master = gsap.timeline({ paused: true });
      masterTimelineRef.current = master;

      // Transition: fade Scene1 out, Scene1_1 in
      master
        .to(scene1_1Refs.current.container, {
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

      if (tl2) master.add(tl2);

      master
        .to(scene1_1Refs.current.container, {
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

      if (tl3) master.add(tl3);

      master
        .to(scene1_2Refs.current.container, {
          x: "-100%",
          duration: 1.2,
          ease: "power2.inOut",
          force3D: true
        })
        .to(
          scene1_3Refs.current.container,
          {
            x: "0%",
            duration: 1.2,
            ease: "power2.inOut",
            force3D: true
          },
          "<"
        );

      if (tl4) master.add(tl4);

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

      if (tl5) master.add(tl5);

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
      addStepsFromTimeline(tl2, SCENE1_1_STEP_LABELS || []);
      addStepsFromTimeline(tl3, SCENE1_2_STEP_LABELS || []);
      addStepsFromTimeline(tl4, SCENE1_3_STEP_LABELS || []);
      addStepsFromTimeline(tl5, []);
      stepProgresses.push(1);

      const snapPoints = Array.from(new Set(stepProgresses)).sort(
        (a, b) => a - b
      );

      const SCENE1_1_FIRST_STEP_PROGRESS = snapPoints[1] || 0.05;
      snapPointsRef.current = snapPoints;

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

          if (
            setShowNavbar &&
            !hasShownNavbarRef.current &&
            self.progress > SCENE1_1_FIRST_STEP_PROGRESS
          ) {
            setShowNavbar(true);
            hasShownNavbarRef.current = true;
          }

          if (
            setShowNavbar &&
            hasShownNavbarRef.current &&
            self.progress <= SCENE1_1_FIRST_STEP_PROGRESS
          ) {
            setShowNavbar(false);
            hasShownNavbarRef.current = false;
          }

          if (
            !scene1EndScrollRef.current &&
            self.progress > SCENE1_1_FIRST_STEP_PROGRESS
          ) {
            scene1EndScrollRef.current = self.scroll();
          }
        }
      });

      master.scrollTrigger = st;
      masterTimelineRef.current = master;
    });

    const handleScrollToScene1_1 = () => {
      const scrollTrigger = masterTimelineRef.current?.scrollTrigger;
      if (scrollTrigger && snapPointsRef.current.length > 0) {
        const targetProgress = snapPointsRef.current[1];
        const targetScroll =
          scrollTrigger.start +
          (scrollTrigger.end - scrollTrigger.start) * targetProgress;

        window.scrollTo({
          top: targetScroll,
          behavior: "smooth"
        });
      }
    };
    window.addEventListener("scrollToScene1_1", handleScrollToScene1_1);

    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("scrollToScene1_1", handleScrollToScene1_1);

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
        <Scene1
          ref={scene1Refs}
          isMobile={isMobile}
          onIntroComplete={() => {
            console.log("Intro complete! Enabling scroll...");
            setIntroDone(true);
            if (onIntroComplete) onIntroComplete();
          }}
        />
      </div>

      {/* Scene 1_1 - Hidden until intro completes */}
      <div
        ref={(el) => {
          if (scene1_1Refs.current) scene1_1Refs.current.container = el;
        }}
        className="absolute inset-0 w-full h-full"
        style={{
          opacity: 0,
          pointerEvents: introDone ? "auto" : "none",
          zIndex: 3
        }}
      >
        <Scene1_1 ref={scene1_1Refs} isMobile={isMobile} />
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

      {/* Scene 1_3 */}
      <div
        ref={(el) => {
          if (scene1_3Refs.current) scene1_3Refs.current.container = el;
        }}
        className="absolute inset-0 w-full h-full"
        style={{ x: "100%", zIndex: 4 }}
      >
        <Scene1_3 ref={scene1_3Refs} isMobile={isMobile} />
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
  );
};

export default Home;

// import React, { useLayoutEffect, useRef, useState } from "react";
// import { gsap } from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import Scene1 from "./Scene1";
// import Scene1_1, { useScene1_1Timeline, setCompletedState } from "./Scene1_1";
// import Scene1_2, { useScene1_2Timeline } from "./Scene1_2";
// import Scene1_3, { useScene1_3Timeline, SCENE1_3_STEP_COUNT } from "./Scene1_3";
// import Scene1_4, { useScene1_4Timeline } from "./Scene1_4";
// import GrainTexture from "../../components/GrainTexture";

// gsap.registerPlugin(ScrollTrigger);

// const Home = ({
//   forceLayout = "auto",
//   setShowNavbar,
//   isLoading,
//   deviceType,
//   onIntroComplete
// }) => {
//   const scene1Refs = useRef({});
//   const scene1_1Refs = useRef({});
//   const scene1_2Refs = useRef({});
//   const scene1_3Refs = useRef({});
//   const scene1_4Refs = useRef({});

//   const scene1EndScrollRef = useRef(null);
//   const hasShownNavbarRef = useRef(false);

//   // Intro completion flag
//   const [introDone, setIntroDone] = useState(false);

//   // Updated logic: treat tablets as desktop
//   const [isMobile, setIsMobile] = useState(() => {
//     if (forceLayout === "mobile") return true;
//     if (forceLayout === "desktop") return false;
//     if (deviceType) return deviceType === "mobile";
//     return window.innerWidth <= 768;
//   });

//   const masterTimelineRef = useRef(null);

//   // Lock body scroll until intro is done
//   useLayoutEffect(() => {
//     document.body.style.overflow = introDone ? "auto" : "hidden";
//     return () => {
//       document.body.style.overflow = "auto";
//     };
//   }, [introDone]);

//   // Hide navbar during intro
//   useLayoutEffect(() => {
//     if (setShowNavbar && !introDone) {
//       setShowNavbar(false);
//       hasShownNavbarRef.current = false;
//     }
//   }, [introDone, setShowNavbar]);

//   // ========== LOGO CLICK HANDLER ==========
//   const handleLogoClick = () => {
//     console.log("Logo clicked - returning to Scene1_1");

//     window.scrollTo({ top: 0, behavior: "smooth" });

//     setTimeout(() => {
//       if (scene1_1Refs.current) {
//         setCompletedState(scene1_1Refs.current, isMobile);
//       }

//       if (masterTimelineRef.current) {
//         masterTimelineRef.current.seek(0);
//         masterTimelineRef.current.pause();
//       }

//       // Reset all scenes
//       if (scene1_1Refs.current.container) {
//         gsap.set(scene1_1Refs.current.container, { opacity: 1, y: 0 });
//       }
//       if (scene1Refs.current.container) {
//         gsap.set(scene1Refs.current.container, { opacity: 0, scale: 1.5 });
//       }
//       if (scene1_2Refs.current.container) {
//         gsap.set(scene1_2Refs.current.container, { y: "-100%" });
//       }
//       if (scene1_3Refs.current.container) {
//         gsap.set(scene1_3Refs.current.container, { x: "100%" });
//       }
//       if (scene1_4Refs.current.container) {
//         gsap.set(scene1_4Refs.current.container, { y: "-100%" });
//       }

//       if (setShowNavbar) {
//         setShowNavbar(false);
//         hasShownNavbarRef.current = false;
//       }
//     }, 500);
//   };

//   useLayoutEffect(() => {
//     window.handleLogoClick = handleLogoClick;
//     return () => {
//       delete window.handleLogoClick;
//     };
//   }, [isMobile, setShowNavbar]);

//   // Update isMobile when deviceType changes
//   useLayoutEffect(() => {
//     if (forceLayout !== "auto") {
//       setIsMobile(forceLayout === "mobile");
//       return;
//     }

//     if (deviceType) {
//       setIsMobile(deviceType === "mobile");
//       return;
//     }

//     const handleResize = () => setIsMobile(window.innerWidth <= 768);
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, [forceLayout, deviceType]);

//   // ========== BUILD MASTER TIMELINE (only after intro is done) ==========
//   useLayoutEffect(() => {
//     if (isLoading || !introDone) return;

//     if (
//       !scene1Refs.current.container ||
//       !scene1_1Refs.current.container ||
//       !scene1_2Refs.current.container ||
//       !scene1_3Refs.current.container ||
//       !scene1_4Refs.current.container
//     ) {
//       return;
//     }

//     const id = requestAnimationFrame(() => {
//       // Initialize Scene1_1 to START state
//       gsap.set(scene1_1Refs.current.rightCloud, { opacity: 0, y: -50 });
//       gsap.set(scene1_1Refs.current.leftCloud, { opacity: 0, y: 80 });
//       gsap.set(scene1_1Refs.current.floor, { opacity: 0, y: 150 });
//       gsap.set(scene1_1Refs.current.leftElement, { opacity: 0, x: -200 });
//       gsap.set(scene1_1Refs.current.rightElement, { opacity: 0, x: 200 });
//       gsap.set(scene1_1Refs.current.text, { opacity: 0, y: 30 });
//       gsap.set(scene1_1Refs.current.objectsContainer, { opacity: 0 });
//       gsap.set(scene1_1Refs.current.ellipse, { opacity: 0 });

//       if (
//         scene1_1Refs.current.object1 &&
//         scene1_1Refs.current.object2 &&
//         scene1_1Refs.current.object3
//       ) {
//         gsap.set(
//           [
//             scene1_1Refs.current.object1,
//             scene1_1Refs.current.object2,
//             scene1_1Refs.current.object3
//           ],
//           { y: 0, opacity: 1, scale: 1 }
//         );
//       }
//       if (
//         scene1_1Refs.current.line1 &&
//         scene1_1Refs.current.line2 &&
//         scene1_1Refs.current.line3
//       ) {
//         gsap.set(
//           [
//             scene1_1Refs.current.line1,
//             scene1_1Refs.current.line2,
//             scene1_1Refs.current.line3
//           ],
//           { height: 0, opacity: 0 }
//         );
//       }

//       gsap.set(scene1_2Refs.current.container, { y: "-100%" });
//       gsap.set(scene1_3Refs.current.container, { x: "100%" });
//       gsap.set(scene1_4Refs.current.container, {
//         y: "120%",
//         rotation: 15,
//         transformOrigin: "center center",
//         opacity: 0,
//         scale: 0.9
//       });

//       const tl2 = useScene1_1Timeline(scene1_1Refs.current, isMobile);
//       const tl3 = useScene1_2Timeline(scene1_2Refs.current, isMobile);
//       const tl4 = useScene1_3Timeline(scene1_3Refs.current, isMobile);
//       const tl5 = useScene1_4Timeline(scene1_4Refs.current, isMobile);

//       if (scene1_3Refs.current.screen1) {
//         gsap.set(scene1_3Refs.current.screen1, {
//           yPercent: 0,
//           autoAlpha: 1,
//           zIndex: 2
//         });
//       }
//       if (scene1_3Refs.current.screen2) {
//         gsap.set(scene1_3Refs.current.screen2, {
//           yPercent: isMobile ? 100 : -100,
//           autoAlpha: 1,
//           zIndex: 1
//         });
//       }

//       if (masterTimelineRef.current) {
//         masterTimelineRef.current.kill();
//       }

//       const SECTIONS = 5;
//       const SCROLL_PER_SECTION = 4;
//       const vh = Math.max(window.innerHeight, 400);
//       const scrollLength = vh * SECTIONS * SCROLL_PER_SECTION;

//       const SCENE1_END_PROGRESS = 0.03;

//       const master = gsap.timeline({
//         // scrollTrigger: {
//         //   trigger: "#scroll-container",
//         //   start: "top top",
//         //   end: `+=${scrollLength}`,
//         //   scrub: 0.8,
//         //   pin: true,
//         //   fastScrollEnd: false,
//         //   anticipatePin: 1,
//         //   invalidateOnRefresh: true,
//         //   onUpdate: (self) => {
//         //     if (
//         //       setShowNavbar &&
//         //       !hasShownNavbarRef.current &&
//         //       self.progress > SCENE1_END_PROGRESS
//         //     ) {
//         //       setShowNavbar(true);
//         //       hasShownNavbarRef.current = true;
//         //     }
//         //     if (
//         //       setShowNavbar &&
//         //       hasShownNavbarRef.current &&
//         //       self.progress <= SCENE1_END_PROGRESS
//         //     ) {
//         //       setShowNavbar(false);
//         //       hasShownNavbarRef.current = false;
//         //     }
//         //     if (
//         //       !scene1EndScrollRef.current &&
//         //       self.progress > SCENE1_END_PROGRESS
//         //     ) {
//         //       scene1EndScrollRef.current = self.scroll();
//         //     }
//         //   }
//         // }
//       });

//       masterTimelineRef.current = master;

//       // Transition: fade Scene1 out, Scene1_1 in
//       master
//         .to(scene1_1Refs.current.container, {
//           opacity: 1,
//           duration: 0.4,
//           ease: "power2.in",
//           force3D: true
//         })
//         .to(
//           scene1Refs.current.container,
//           {
//             scale: 1.5,
//             opacity: 0,
//             duration: 0.8,
//             ease: "power2.inOut",
//             force3D: true
//           },
//           "<"
//         );

//       if (tl2) master.add(tl2);

//       master
//         .to(scene1_1Refs.current.container, {
//           y: "100%",
//           duration: 1.2,
//           ease: "power2.inOut",
//           force3D: true
//         })
//         .to(
//           scene1_2Refs.current.container,
//           {
//             y: "0%",
//             duration: 1.2,
//             ease: "power2.inOut",
//             force3D: true
//           },
//           "<"
//         );

//       if (tl3) master.add(tl3);

//       master
//         .to(scene1_2Refs.current.container, {
//           x: "-100%",
//           duration: 1.2,
//           ease: "power2.inOut",
//           force3D: true
//         })
//         .to(
//           scene1_3Refs.current.container,
//           {
//             x: "0%",
//             duration: 1.2,
//             ease: "power2.inOut",
//             force3D: true
//           },
//           "<"
//         );

//       if (tl4) master.add(tl4);

//       master
//         .to(scene1_4Refs.current.container, {
//           opacity: 1,
//           duration: 0.3,
//           ease: "none"
//         })
//         .to(
//           scene1_4Refs.current.container,
//           {
//             y: "0%",
//             rotation: 0,
//             scale: 1,
//             duration: 1.8,
//             ease: "power2.inOut"
//           },
//           "<0.1"
//         );

//       // // Transition: crossfade Scene1 out, Scene1_1 in
//       // master
//       //   .to({}, { duration: 0.3 }) // small buffer at start of scroll
//       //   .to(
//       //     scene1_1Refs.current.container,
//       //     {
//       //       opacity: 1,
//       //       duration: 0.8,
//       //       ease: "power2.inOut",
//       //       force3D: true
//       //     },
//       //     "<0.1"
//       //   )
//       //   .to(
//       //     scene1Refs.current.container,
//       //     {
//       //       opacity: 0,
//       //       duration: 0.8,
//       //       ease: "power2.inOut",
//       //       force3D: true
//       //     },
//       //     "<"
//       //   );

//       if (tl5) master.add(tl5);

//       // we want snapping only inside the scene1_3 segment
//       let lastProgress = 0;
//       let currentStepIndex = 0; // 0..SCENE1_3_STEP_COUNT-1

//       const maxIndex = (SCENE1_3_STEP_COUNT || 5) - 1;
//       const scene1_3Start = tl4 ? tl4.startTime() : 0;
//       const scene1_3End = tl4 ? tl4.startTime() + tl4.duration() : 0;
//       const masterDur = master.duration();

//       const st = ScrollTrigger.create({
//         animation: master,
//         trigger: "#scroll-container",
//         start: "top top",
//         end: `+=${scrollLength}`,
//         scrub: 0.8,
//         pin: true,
//         fastScrollEnd: false,
//         anticipatePin: 1,
//         invalidateOnRefresh: true,

//         snap: {
//           snapTo: (rawProgress) => {
//             if (!tl4 || !masterDur || !maxIndex >= 0) return rawProgress;

//             const t = rawProgress * masterDur;

//             // outside scene1_3 → don't interfere
//             if (t < scene1_3Start || t > scene1_3End) {
//               lastProgress = rawProgress;
//               return rawProgress;
//             }

//             // how much did we move this frame?
//             const delta = rawProgress - lastProgress;
//             lastProgress = rawProgress;

//             // small noise → stay on same step
//             if (Math.abs(delta) < 0.001) {
//               return progressForStep(currentStepIndex);
//             }

//             // decide direction
//             if (delta > 0) {
//               // scrolling down → next step (max +1)
//               currentStepIndex = Math.min(currentStepIndex + 1, maxIndex);
//             } else if (delta < 0) {
//               // scrolling up → previous step (max -1)
//               currentStepIndex = Math.max(currentStepIndex - 1, 0);
//             }

//             return progressForStep(currentStepIndex);
//           },
//           duration: 0, // instant jump, no auto tween
//           inertia: false // no momentum fighting this
//         },
//         onUpdate: (self) => {
//           // keep your existing navbar logic
//           if (
//             setShowNavbar &&
//             !hasShownNavbarRef.current &&
//             self.progress > SCENE1_END_PROGRESS
//           ) {
//             setShowNavbar(true);
//             hasShownNavbarRef.current = true;
//           }

//           if (
//             setShowNavbar &&
//             hasShownNavbarRef.current &&
//             self.progress <= SCENE1_END_PROGRESS
//           ) {
//             setShowNavbar(false);
//             hasShownNavbarRef.current = false;
//           }

//           if (
//             !scene1EndScrollRef.current &&
//             self.progress > SCENE1_END_PROGRESS
//           ) {
//             scene1EndScrollRef.current = self.scroll();
//           }
//         }
//         // onUpdate: (self) => {
//         //   // Get Scene1_1's current opacity
//         //   const scene1_1Opacity = gsap.getProperty(
//         //     scene1_1Refs.current.container,
//         //     "opacity"
//         //   );

//         //   if (
//         //     setShowNavbar &&
//         //     !hasShownNavbarRef.current &&
//         //     scene1_1Opacity >= 0.9 // Show navbar when Scene1_1 is almost fully visible
//         //   ) {
//         //     setShowNavbar(true);
//         //     hasShownNavbarRef.current = true;
//         //   }

//         //   if (
//         //     setShowNavbar &&
//         //     hasShownNavbarRef.current &&
//         //     scene1_1Opacity < 0.4 // Hide when going back
//         //   ) {
//         //     setShowNavbar(false);
//         //     hasShownNavbarRef.current = false;
//         //   }

//         //   // Keep your scroll reference logic
//         //   if (!scene1EndScrollRef.current && scene1_1Opacity >= 0.9) {
//         //     scene1EndScrollRef.current = self.scroll();
//         //   }
//         // }
//       });
//       // helper: convert step index → master progress
//       function progressForStep(stepIndex) {
//         const local = maxIndex === 0 ? 0 : stepIndex / maxIndex; // 0..1
//         const snappedTime =
//           scene1_3Start + local * (scene1_3End - scene1_3Start || 1);
//         return snappedTime / masterDur;
//       }

//       // store for cleanup (optional, but handy)
//       master.scrollTrigger = st;
//       masterTimelineRef.current = master;
//     });

//     const handleScrollToScene1_1 = () => {
//       if (scene1EndScrollRef.current) {
//         window.scrollTo({
//           top: scene1EndScrollRef.current,
//           behavior: "smooth"
//         });
//       } else {
//         const scrollTrigger = masterTimelineRef.current?.scrollTrigger;
//         if (scrollTrigger) {
//           const estimatedScroll =
//             scrollTrigger.start +
//             (scrollTrigger.end - scrollTrigger.start) * 0.06;
//           window.scrollTo({
//             top: estimatedScroll,
//             behavior: "smooth"
//           });
//         }
//       }
//     };
//     window.addEventListener("scrollToScene1_1", handleScrollToScene1_1);

//     return () => {
//       cancelAnimationFrame(id);
//       window.removeEventListener("scrollToScene1_1", handleScrollToScene1_1);

//       try {
//         if (masterTimelineRef.current) {
//           const st = masterTimelineRef.current.scrollTrigger;
//           if (st) st.kill();
//           masterTimelineRef.current.kill();
//           masterTimelineRef.current = null;
//         }

//         ScrollTrigger.getAll().forEach((trigger) => {
//           try {
//             trigger.kill();
//           } catch (e) {
//             // ignore
//           }
//         });

//         gsap.set("#scroll-container", { clearProps: "all" });
//       } catch (error) {
//         console.warn("Cleanup error:", error);
//       }

//       if (setShowNavbar) {
//         setShowNavbar(true);
//       }
//     };
//   }, [isMobile, setShowNavbar, isLoading, introDone]);

//   return (
//     <div
//       id="scroll-container"
//       className="relative w-full h-screen bg-black lowercase"
//       style={{
//         perspectiveOrigin: "50% 50%",
//         overflow: "hidden",
//         position: "relative"
//       }}
//     >
//       <div
//         style={{
//           position: "fixed",
//           inset: 0,
//           pointerEvents: "none",
//           zIndex: 9999,
//           mixBlendMode: "overlay",
//           opacity: 0.2,
//           filter: "contrast(100%) brightness(90%)"
//         }}
//       >
//         <GrainTexture />
//       </div>

//       {/* Scene 1 (intro) - Only visible until intro completes */}
//       <div
//         className="absolute inset-0 w-full h-full"
//         style={{
//           willChange: "transform, opacity",
//           pointerEvents: introDone ? "none" : "auto",
//           zIndex: introDone ? 1 : 10,
//           // opacity: introDone ? 0 : 1
//           opacity: 1
//         }}
//       >
//         <Scene1
//           ref={scene1Refs}
//           isMobile={isMobile}
//           // onIntroComplete={() => {
//           //   console.log("Intro complete! Enabling scroll...");
//           //   setIntroDone(true);
//           // }}
//           onIntroComplete={() => {
//             console.log("Intro complete! Enabling scroll...");
//             setIntroDone(true);
//             if (onIntroComplete) onIntroComplete(); // Call parent callback
//           }}
//         />
//       </div>

//       {/* Scene 1_1 - Hidden until intro completes */}
//       <div
//         ref={(el) => {
//           if (scene1_1Refs.current) scene1_1Refs.current.container = el;
//         }}
//         className="absolute inset-0 w-full h-full"
//         style={{
//           opacity: 0,
//           pointerEvents: introDone ? "auto" : "none",
//           zIndex: 3
//         }}
//       >
//         <Scene1_1 ref={scene1_1Refs} isMobile={isMobile} />
//       </div>

//       {/* Scene 1_2 */}
//       <div
//         ref={(el) => {
//           if (scene1_2Refs.current) scene1_2Refs.current.container = el;
//         }}
//         className="absolute inset-0 w-full h-full"
//         style={{ y: "-100%", zIndex: 4 }}
//       >
//         <Scene1_2 ref={scene1_2Refs} isMobile={isMobile} />
//       </div>

//       {/* Scene 1_3 */}
//       <div
//         ref={(el) => {
//           if (scene1_3Refs.current) scene1_3Refs.current.container = el;
//         }}
//         className="absolute inset-0 w-full h-full"
//         style={{ x: "100%", zIndex: 4 }}
//       >
//         <Scene1_3 ref={scene1_3Refs} isMobile={isMobile} />
//       </div>

//       {/* Scene 1_4 */}
//       <div
//         ref={(el) => {
//           if (scene1_4Refs.current) scene1_4Refs.current.container = el;
//         }}
//         className="absolute inset-0 w-full h-full"
//         style={{ y: "100%", zIndex: 5 }}
//       >
//         <Scene1_4 ref={scene1_4Refs} isMobile={isMobile} />
//       </div>
//     </div>
//   );
// };

// export default Home;
