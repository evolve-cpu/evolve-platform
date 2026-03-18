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

// import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
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
//   const snapPointsRef = useRef([]);

//   const scene1EndScrollRef = useRef(null);
//   const hasShownNavbarRef = useRef(false);

//   // Intro completion flag
//   const [introDone, setIntroDone] = useState(false);

//   // CRITICAL: Track if animations should be enabled
//   const [animationsReady, setAnimationsReady] = useState(false);

//   // Updated logic: treat tablets as desktop
//   const [isMobile, setIsMobile] = useState(() => {
//     if (forceLayout === "mobile") return true;
//     if (forceLayout === "desktop") return false;
//     if (deviceType) return deviceType === "mobile";
//     return window.innerWidth <= 768;
//   });

//   const masterTimelineRef = useRef(null);

//   // DEFER ANIMATIONS: Wait for images to load before enabling heavy animations
//   useEffect(() => {
//     if (isLoading) return;

//     // Small delay after loading completes to ensure DOM is ready
//     const timeoutId = setTimeout(() => {
//       if ("requestIdleCallback" in window) {
//         requestIdleCallback(
//           () => {
//             setAnimationsReady(true);
//           },
//           { timeout: 500 }
//         );
//       } else {
//         setAnimationsReady(true);
//       }
//     }, 300);

//     return () => clearTimeout(timeoutId);
//   }, [isLoading]);

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
//         const scene1_1FirstStepProgress = snapPointsRef.current[1] || 0.05;
//         const targetScroll =
//           scrollTrigger.start +
//           (scrollTrigger.end - scrollTrigger.start) * scene1_1FirstStepProgress;

//         window.scrollTo({
//           top: targetScroll,
//           behavior: "smooth"
//         });
//       }

//       if (scene1_1Refs.current) {
//         setCompletedState(scene1_1Refs.current, isMobile);
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

//   // ========== BUILD MASTER TIMELINE (only after intro AND animations are ready) ==========
//   useLayoutEffect(() => {
//     // CRITICAL: Don't build timeline until animations are ready
//     if (isLoading || !introDone || !animationsReady) return;

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
//       // Initialize Scene1_1 to START state (use will-change for optimization)
//       gsap.set(scene1_1Refs.current.rightCloud, {
//         opacity: 0,
//         y: -50,
//         willChange: "transform, opacity"
//       });
//       gsap.set(scene1_1Refs.current.leftCloud, {
//         opacity: 0,
//         y: 80,
//         willChange: "transform, opacity"
//       });
//       gsap.set(scene1_1Refs.current.floor, {
//         opacity: 0,
//         y: 150,
//         willChange: "transform, opacity"
//       });
//       gsap.set(scene1_1Refs.current.leftElement, {
//         opacity: 0,
//         x: -200,
//         willChange: "transform, opacity"
//       });
//       gsap.set(scene1_1Refs.current.rightElement, {
//         opacity: 0,
//         x: 200,
//         willChange: "transform, opacity"
//       });
//       gsap.set(scene1_1Refs.current.text, {
//         opacity: 0,
//         y: 30,
//         willChange: "transform, opacity"
//       });
//       gsap.set(scene1_1Refs.current.objectsContainer, {
//         opacity: 0,
//         willChange: "opacity"
//       });
//       gsap.set(scene1_1Refs.current.ellipse, {
//         opacity: 0,
//         willChange: "opacity"
//       });

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
//           { y: 0, opacity: 1, scale: 1, willChange: "transform, opacity" }
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
//           { height: 0, opacity: 0, willChange: "height, opacity" }
//         );
//       }

//       gsap.set(scene1_2Refs.current.container, {
//         y: "-100%",
//         willChange: "transform"
//       });
//       gsap.set(scene1_3Refs.current.container, {
//         x: "100%",
//         willChange: "transform"
//       });
//       gsap.set(scene1_4Refs.current.container, {
//         y: "120%",
//         rotation: 15,
//         transformOrigin: "center center",
//         opacity: 0,
//         scale: 0.9,
//         willChange: "transform, opacity"
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
//       const SCROLL_PER_SECTION = 8;
//       const vh = Math.max(window.innerHeight, 400);
//       const scrollLength = vh * SECTIONS * SCROLL_PER_SECTION;

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

//       const addStepsFromTimeline = (tl, labels) => {
//         if (!tl || !labels || !labels.length) return;
//         const start = tl.startTime();

//         labels.forEach((label) => {
//           const localTime = tl.labels?.[label];
//           if (typeof localTime !== "number") return;
//           const globalTime = start + localTime;
//           stepProgresses.push(globalTime / masterDur);
//         });
//       };

//       stepProgresses.push(0);
//       addStepsFromTimeline(tl2, SCENE1_1_STEP_LABELS || []);
//       addStepsFromTimeline(tl3, SCENE1_2_STEP_LABELS || []);
//       addStepsFromTimeline(tl4, SCENE1_3_STEP_LABELS || []);
//       addStepsFromTimeline(tl5, []);
//       stepProgresses.push(1);

//       const snapPoints = Array.from(new Set(stepProgresses)).sort(
//         (a, b) => a - b
//       );

//       const SCENE1_1_FIRST_STEP_PROGRESS = snapPoints[1] || 0.05;
//       snapPointsRef.current = snapPoints;

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
//           snapTo: snapPoints,
//           duration: 1.8,
//           delay: 0,
//           ease: "power2.out",
//           onStart: () => {
//             ScrollTrigger.clearScrollMemory();
//           }
//         },

//         onScrubComplete: () => {
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
//           const now = Date.now();
//           const timeDiff = now - lastScrollTime;
//           const progressDiff = Math.abs(self.progress - self.previous);
//           scrollVelocity = progressDiff / timeDiff;
//           lastScrollTime = now;

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

//       master.scrollTrigger = st;
//       masterTimelineRef.current = master;
//     });

//     const handleScrollToScene1_1 = () => {
//       const scrollTrigger = masterTimelineRef.current?.scrollTrigger;
//       if (scrollTrigger && snapPointsRef.current.length > 0) {
//         const targetProgress = snapPointsRef.current[1];
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
//   }, [isMobile, setShowNavbar, isLoading, introDone, animationsReady]);

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
//       {/* Grain texture - load last for better perceived performance */}
//       {animationsReady && (
//         <div
//           style={{
//             position: "fixed",
//             inset: 0,
//             pointerEvents: "none",
//             zIndex: 9999,
//             mixBlendMode: "overlay",
//             opacity: 0.2,
//             filter: "contrast(100%) brightness(90%)"
//           }}
//         >
//           <GrainTexture />
//         </div>
//       )}

//       {/* Scene 1 (intro) - Only visible until intro completes */}
//       <div
//         className="absolute inset-0 w-full h-full"
//         style={{
//           willChange: "transform, opacity",
//           pointerEvents: introDone ? "none" : "auto",
//           zIndex: introDone ? 1 : 10,
//           opacity: 1
//         }}
//       >
//         <Scene1
//           ref={scene1Refs}
//           isMobile={isMobile}
//           onIntroComplete={() => {
//             console.log("Intro complete! Enabling scroll...");
//             setIntroDone(true);
//             if (onIntroComplete) onIntroComplete();
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

// import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
// import { gsap } from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import Scene1 from "./Scene1";

// // NEW SCENE - First scrollable scene
// import SceneNew, {
//   useSceneNewTimeline,
//   SCENE_NEW_STEP_LABELS
// } from "./SceneNew";

// // Existing scenes in new order
// import Scene1_1, {
//   useScene1_1Timeline,
//   setCompletedState,
//   SCENE1_1_STEP_LABELS
// } from "./Scene1_1";

// import Scene1_2, {
//   useScene1_2Timeline,
//   SCENE1_2_STEP_LABELS
// } from "./Scene1_2";

// // Scene1_3 REMOVED

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
//   const sceneNewRefs = useRef({}); // NEW SCENE REFS
//   const scene1_1Refs = useRef({});
//   const scene1_2Refs = useRef({});
//   // scene1_3Refs REMOVED
//   const scene1_4Refs = useRef({});
//   const snapPointsRef = useRef([]);

//   const scene1EndScrollRef = useRef(null);
//   const hasShownNavbarRef = useRef(false);

//   // Intro completion flag
//   const [introDone, setIntroDone] = useState(false);

//   // CRITICAL: Track if animations should be enabled
//   const [animationsReady, setAnimationsReady] = useState(false);

//   // Updated logic: treat tablets as desktop
//   const [isMobile, setIsMobile] = useState(() => {
//     if (forceLayout === "mobile") return true;
//     if (forceLayout === "desktop") return false;
//     if (deviceType) return deviceType === "mobile";
//     return window.innerWidth <= 768;
//   });

//   const masterTimelineRef = useRef(null);

//   // DEFER ANIMATIONS: Wait for images to load before enabling heavy animations
//   useEffect(() => {
//     if (isLoading) return;

//     // Small delay after loading completes to ensure DOM is ready
//     const timeoutId = setTimeout(() => {
//       if ("requestIdleCallback" in window) {
//         requestIdleCallback(
//           () => {
//             setAnimationsReady(true);
//           },
//           { timeout: 500 }
//         );
//       } else {
//         setAnimationsReady(true);
//       }
//     }, 300);

//     return () => clearTimeout(timeoutId);
//   }, [isLoading]);

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
//   // NOW TARGETS NEW SCENE (first scrollable scene)
//   const handleLogoClick = () => {
//     console.log("Logo clicked - returning to SceneNew (first scene)");

//     setTimeout(() => {
//       const scrollTrigger = masterTimelineRef.current?.scrollTrigger;
//       if (scrollTrigger) {
//         const sceneNewFirstStepProgress = snapPointsRef.current[1] || 0.05;
//         const targetScroll =
//           scrollTrigger.start +
//           (scrollTrigger.end - scrollTrigger.start) * sceneNewFirstStepProgress;

//         window.scrollTo({
//           top: targetScroll,
//           behavior: "smooth"
//         });
//       }

//       // Reset navbar state
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

//   // ========== BUILD MASTER TIMELINE (only after intro AND animations are ready) ==========
//   useLayoutEffect(() => {
//     // CRITICAL: Don't build timeline until animations are ready
//     if (isLoading || !introDone || !animationsReady) return;

//     if (
//       !scene1Refs.current.container ||
//       !sceneNewRefs.current.container || // NEW SCENE CHECK
//       !scene1_1Refs.current.container ||
//       !scene1_2Refs.current.container ||
//       // scene1_3Refs.current.container REMOVED
//       !scene1_4Refs.current.container
//     ) {
//       return;
//     }

//     const id = requestAnimationFrame(() => {
//       // Initialize SceneNew to START state (NEW SCENE - inherits Scene1_1's initial logic)
//       // You can add specific initial states for SceneNew here if needed
//       gsap.set(sceneNewRefs.current.container, {
//         opacity: 0,
//         willChange: "transform, opacity"
//       });

//       // Initialize Scene1_2 to START state
//       gsap.set(scene1_2Refs.current.container, {
//         y: "-100%",
//         willChange: "transform"
//       });

//       // Initialize Scene1_1 to START state (moved to middle position)
//       gsap.set(scene1_1Refs.current.container, {
//         x: "100%", // Slides in from right (like old Scene1_3)
//         willChange: "transform"
//       });

//       // Initialize Scene1_4 to START state
//       gsap.set(scene1_4Refs.current.container, {
//         y: "120%",
//         rotation: 15,
//         transformOrigin: "center center",
//         opacity: 0,
//         scale: 0.9,
//         willChange: "transform, opacity"
//       });

//       // Get timelines for each scene
//       const tlNew = useSceneNewTimeline(sceneNewRefs.current, isMobile); // NEW SCENE TIMELINE
//       const tl2 = useScene1_2Timeline(scene1_2Refs.current, isMobile);
//       const tl3 = useScene1_1Timeline(scene1_1Refs.current, isMobile); // Scene1_1 is now 3rd
//       const tl4 = useScene1_4Timeline(scene1_4Refs.current, isMobile);

//       if (masterTimelineRef.current) {
//         masterTimelineRef.current.kill();
//       }

//       const SECTIONS = 5; // Still 5 sections (Scene1, SceneNew, Scene1_2, Scene1_1, Scene1_4)
//       const SCROLL_PER_SECTION = 8;
//       const vh = Math.max(window.innerHeight, 400);
//       const scrollLength = vh * SECTIONS * SCROLL_PER_SECTION;

//       const master = gsap.timeline({ paused: true });
//       masterTimelineRef.current = master;

//       // ========== TRANSITION 1: Scene1 → SceneNew (CROSSFADE) ==========
//       master
//         .to(sceneNewRefs.current.container, {
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

//       // Add SceneNew timeline
//       if (tlNew) master.add(tlNew);

//       // ========== TRANSITION 2: SceneNew → Scene1_2 (VERTICAL SLIDE) ==========
//       master
//         .to(sceneNewRefs.current.container, {
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

//       // Add Scene1_2 timeline
//       if (tl2) master.add(tl2);

//       // ========== TRANSITION 3: Scene1_2 → Scene1_1 (HORIZONTAL SLIDE - like old Scene1_2 → Scene1_3) ==========
//       master
//         .to(scene1_2Refs.current.container, {
//           x: "-100%",
//           duration: 1.2,
//           ease: "power2.inOut",
//           force3D: true
//         })
//         .to(
//           scene1_1Refs.current.container,
//           {
//             x: "0%",
//             duration: 1.2,
//             ease: "power2.inOut",
//             force3D: true
//           },
//           "<"
//         );

//       // Add Scene1_1 timeline
//       if (tl3) master.add(tl3);

//       // ========== TRANSITION 4: Scene1_1 → Scene1_4 (ZOOM/FADE - like old Scene1_3 → Scene1_4) ==========
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

//       // Add Scene1_4 timeline
//       if (tl4) master.add(tl4);

//       // ====== BUILD STEP SNAP POINTS FROM CHILD TIMELINES ======
//       const masterDur = master.duration();
//       const stepProgresses = [];

//       const addStepsFromTimeline = (tl, labels) => {
//         if (!tl || !labels || !labels.length) return;
//         const start = tl.startTime();

//         labels.forEach((label) => {
//           const localTime = tl.labels?.[label];
//           if (typeof localTime !== "number") return;
//           const globalTime = start + localTime;
//           stepProgresses.push(globalTime / masterDur);
//         });
//       };

//       stepProgresses.push(0);
//       addStepsFromTimeline(tlNew, SCENE_NEW_STEP_LABELS || []); // NEW SCENE STEPS
//       addStepsFromTimeline(tl2, SCENE1_2_STEP_LABELS || []);
//       addStepsFromTimeline(tl3, SCENE1_1_STEP_LABELS || []);
//       addStepsFromTimeline(tl4, []);
//       stepProgresses.push(1);

//       const snapPoints = Array.from(new Set(stepProgresses)).sort(
//         (a, b) => a - b
//       );

//       const SCENE_NEW_FIRST_STEP_PROGRESS = snapPoints[1] || 0.05; // NEW SCENE first checkpoint
//       snapPointsRef.current = snapPoints;

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
//           snapTo: snapPoints,
//           duration: 1.8,
//           delay: 0,
//           ease: "power2.out",
//           onStart: () => {
//             ScrollTrigger.clearScrollMemory();
//           }
//         },

//         onScrubComplete: () => {
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
//           const now = Date.now();
//           const timeDiff = now - lastScrollTime;
//           const progressDiff = Math.abs(self.progress - self.previous);
//           scrollVelocity = progressDiff / timeDiff;
//           lastScrollTime = now;

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

//           // NAVBAR CONTROL - Now based on NEW SCENE first step
//           if (
//             setShowNavbar &&
//             !hasShownNavbarRef.current &&
//             self.progress > SCENE_NEW_FIRST_STEP_PROGRESS
//           ) {
//             setShowNavbar(true);
//             hasShownNavbarRef.current = true;
//           }

//           if (
//             setShowNavbar &&
//             hasShownNavbarRef.current &&
//             self.progress <= SCENE_NEW_FIRST_STEP_PROGRESS
//           ) {
//             setShowNavbar(false);
//             hasShownNavbarRef.current = false;
//           }

//           if (
//             !scene1EndScrollRef.current &&
//             self.progress > SCENE_NEW_FIRST_STEP_PROGRESS
//           ) {
//             scene1EndScrollRef.current = self.scroll();
//           }
//         }
//       });

//       master.scrollTrigger = st;
//       masterTimelineRef.current = master;
//     });

//     // Custom event listener for scrolling to first scene
//     const handleScrollToSceneNew = () => {
//       const scrollTrigger = masterTimelineRef.current?.scrollTrigger;
//       if (scrollTrigger && snapPointsRef.current.length > 0) {
//         const targetProgress = snapPointsRef.current[1];
//         const targetScroll =
//           scrollTrigger.start +
//           (scrollTrigger.end - scrollTrigger.start) * targetProgress;

//         window.scrollTo({
//           top: targetScroll,
//           behavior: "smooth"
//         });
//       }
//     };
//     window.addEventListener("scrollToSceneNew", handleScrollToSceneNew);

//     return () => {
//       cancelAnimationFrame(id);
//       window.removeEventListener("scrollToSceneNew", handleScrollToSceneNew);

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
//   }, [isMobile, setShowNavbar, isLoading, introDone, animationsReady]);

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
//       {/* Grain texture - load last for better perceived performance */}
//       {animationsReady && (
//         <div
//           style={{
//             position: "fixed",
//             inset: 0,
//             pointerEvents: "none",
//             zIndex: 9999,
//             mixBlendMode: "overlay",
//             opacity: 0.2,
//             filter: "contrast(100%) brightness(90%)"
//           }}
//         >
//           <GrainTexture />
//         </div>
//       )}

//       {/* Scene 1 (intro) - Only visible until intro completes */}
//       <div
//         className="absolute inset-0 w-full h-full"
//         style={{
//           willChange: "transform, opacity",
//           pointerEvents: introDone ? "none" : "auto",
//           zIndex: introDone ? 1 : 10,
//           opacity: 1
//         }}
//       >
//         <Scene1
//           ref={scene1Refs}
//           isMobile={isMobile}
//           onIntroComplete={() => {
//             console.log("Intro complete! Enabling scroll...");
//             setIntroDone(true);
//             if (onIntroComplete) onIntroComplete();
//           }}
//         />
//       </div>

//       {/* NEW SCENE - First scrollable scene (takes over Scene1_1's role) */}
//       <div
//         ref={(el) => {
//           if (sceneNewRefs.current) sceneNewRefs.current.container = el;
//         }}
//         className="absolute inset-0 w-full h-full"
//         style={{
//           opacity: 0,
//           pointerEvents: introDone ? "auto" : "none",
//           zIndex: 3
//         }}
//       >
//         <SceneNew ref={sceneNewRefs} isMobile={isMobile} />
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

//       {/* Scene 1_1 - Now in 3rd position, slides in from RIGHT */}
//       <div
//         ref={(el) => {
//           if (scene1_1Refs.current) scene1_1Refs.current.container = el;
//         }}
//         className="absolute inset-0 w-full h-full"
//         style={{ x: "100%", zIndex: 4 }}
//       >
//         <Scene1_1 ref={scene1_1Refs} isMobile={isMobile} />
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

// import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
// import { gsap } from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import Scene1 from "./Scene1";

// // NEW SCENE - First scrollable scene
// import SceneNew, {
//   useSceneNewTimeline,
//   SCENE_NEW_STEP_LABELS
// } from "./SceneNew";

// // Existing scenes in new order
// import Scene1_1, {
//   useScene1_1Timeline,
//   setCompletedState,
//   SCENE1_1_STEP_LABELS
// } from "./Scene1_1";

// import Scene1_2, {
//   useScene1_2Timeline,
//   SCENE1_2_STEP_LABELS
// } from "./Scene1_2";

// // Scene1_3 REMOVED

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
//   const sceneNewRefs = useRef({}); // NEW SCENE REFS
//   const scene1_1Refs = useRef({});
//   const scene1_2Refs = useRef({});
//   // scene1_3Refs REMOVED
//   const scene1_4Refs = useRef({});
//   const snapPointsRef = useRef([]);

//   const scene1EndScrollRef = useRef(null);
//   const hasShownNavbarRef = useRef(false);

//   // Intro completion flag
//   const [introDone, setIntroDone] = useState(false);

//   // CRITICAL: Track if animations should be enabled
//   const [animationsReady, setAnimationsReady] = useState(false);

//   // Updated logic: treat tablets as desktop
//   const [isMobile, setIsMobile] = useState(() => {
//     if (forceLayout === "mobile") return true;
//     if (forceLayout === "desktop") return false;
//     if (deviceType) return deviceType === "mobile";
//     return window.innerWidth <= 768;
//   });

//   const masterTimelineRef = useRef(null);

//   // DEFER ANIMATIONS: Wait for images to load before enabling heavy animations
//   useEffect(() => {
//     if (isLoading) return;

//     // Small delay after loading completes to ensure DOM is ready
//     const timeoutId = setTimeout(() => {
//       if ("requestIdleCallback" in window) {
//         requestIdleCallback(
//           () => {
//             setAnimationsReady(true);
//           },
//           { timeout: 500 }
//         );
//       } else {
//         setAnimationsReady(true);
//       }
//     }, 300);

//     return () => clearTimeout(timeoutId);
//   }, [isLoading]);

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
//   // NOW TARGETS NEW SCENE (first scrollable scene)
//   // ========== LOGO CLICK HANDLER ==========
//   // NOW TARGETS NEW SCENE (first scrollable scene)
//   const handleLogoClick = React.useCallback(() => {
//     console.log("Logo clicked - returning to SceneNew (first scene)");

//     const scrollTrigger = masterTimelineRef.current?.scrollTrigger;
//     if (!scrollTrigger || !snapPointsRef.current.length) {
//       console.warn("ScrollTrigger or snap points not ready");
//       // Fallback: scroll to top
//       window.scrollTo({
//         top: 0,
//         behavior: "smooth"
//       });
//       return;
//     }

//     // Get the first scene's progress (index 1, since 0 is Scene1 intro)
//     const sceneNewFirstStepProgress = snapPointsRef.current[1] || 0.05;
//     const targetScroll =
//       scrollTrigger.start +
//       (scrollTrigger.end - scrollTrigger.start) * sceneNewFirstStepProgress;

//     console.log(
//       "Scrolling to:",
//       targetScroll,
//       "Progress:",
//       sceneNewFirstStepProgress,
//       "Current scroll:",
//       window.pageYOffset
//     );

//     // Use gsap for smoother scrolling
//     gsap.to(window, {
//       scrollTo: {
//         y: targetScroll,
//         autoKill: true
//       },
//       duration: 1,
//       ease: "power2.inOut"
//     });

//     // Reset navbar state
//     if (setShowNavbar) {
//       setShowNavbar(false);
//       hasShownNavbarRef.current = false;
//     }
//   }, [setShowNavbar]);

//   useLayoutEffect(() => {
//     window.handleLogoClick = handleLogoClick;
//     console.log("Logo click handler attached to window");

//     return () => {
//       delete window.handleLogoClick;
//       console.log("Logo click handler removed from window");
//     };
//   }, [handleLogoClick]);

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

//   // ========== BUILD MASTER TIMELINE (only after intro AND animations are ready) ==========
//   useLayoutEffect(() => {
//     // CRITICAL: Don't build timeline until animations are ready
//     if (isLoading || !introDone || !animationsReady) return;

//     if (
//       !scene1Refs.current.container ||
//       !sceneNewRefs.current.container || // NEW SCENE CHECK
//       !scene1_1Refs.current.container ||
//       !scene1_2Refs.current.container ||
//       // scene1_3Refs.current.container REMOVED
//       !scene1_4Refs.current.container
//     ) {
//       return;
//     }

//     const id = requestAnimationFrame(() => {
//       // Initialize SceneNew to START state (NEW SCENE - inherits Scene1_1's initial logic)
//       // You can add specific initial states for SceneNew here if needed
//       gsap.set(sceneNewRefs.current.container, {
//         opacity: 0,
//         willChange: "transform, opacity"
//       });

//       // Initialize Scene1_2 to START state
//       gsap.set(scene1_2Refs.current.container, {
//         y: "-100%",
//         willChange: "transform"
//       });

//       // Initialize Scene1_1 to START state (moved to middle position)
//       gsap.set(scene1_1Refs.current.container, {
//         x: "100%", // Slides in from right (like old Scene1_3)
//         willChange: "transform"
//       });

//       // Initialize Scene1_4 to START state
//       gsap.set(scene1_4Refs.current.container, {
//         y: "120%",
//         rotation: 15,
//         transformOrigin: "center center",
//         opacity: 0,
//         scale: 0.9,
//         willChange: "transform, opacity"
//       });

//       // Get timelines for each scene
//       const tlNew = useSceneNewTimeline(sceneNewRefs.current, isMobile); // NEW SCENE TIMELINE
//       const tl2 = useScene1_2Timeline(scene1_2Refs.current, isMobile);
//       const tl3 = useScene1_1Timeline(scene1_1Refs.current, isMobile); // Scene1_1 is now 3rd
//       const tl4 = useScene1_4Timeline(scene1_4Refs.current, isMobile);

//       if (masterTimelineRef.current) {
//         masterTimelineRef.current.kill();
//       }

//       const SECTIONS = 5; // Still 5 sections (Scene1, SceneNew, Scene1_2, Scene1_1, Scene1_4)
//       const SCROLL_PER_SECTION = 8;
//       const vh = Math.max(window.innerHeight, 400);
//       const scrollLength = vh * SECTIONS * SCROLL_PER_SECTION;

//       const master = gsap.timeline({ paused: true });
//       masterTimelineRef.current = master;

//       // ========== TRANSITION 1: Scene1 → SceneNew (CROSSFADE) ==========
//       master
//         .to(sceneNewRefs.current.container, {
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

//       // Add SceneNew timeline
//       if (tlNew) master.add(tlNew);

//       // ========== TRANSITION 2: SceneNew → Scene1_2 (VERTICAL SLIDE) ==========
//       master
//         .to(sceneNewRefs.current.container, {
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

//       // Add Scene1_2 timeline
//       if (tl2) master.add(tl2);

//       // ========== TRANSITION 3: Scene1_2 → Scene1_1 (HORIZONTAL SLIDE - like old Scene1_2 → Scene1_3) ==========
//       master
//         .to(scene1_2Refs.current.container, {
//           x: "-100%",
//           duration: 1.2,
//           ease: "power2.inOut",
//           force3D: true
//         })
//         .to(
//           scene1_1Refs.current.container,
//           {
//             x: "0%",
//             duration: 1.2,
//             ease: "power2.inOut",
//             force3D: true
//           },
//           "<"
//         );

//       // Add Scene1_1 timeline
//       if (tl3) master.add(tl3);

//       // ========== TRANSITION 4: Scene1_1 → Scene1_4 (ZOOM/FADE - like old Scene1_3 → Scene1_4) ==========
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

//       // Add Scene1_4 timeline
//       if (tl4) master.add(tl4);

//       // ====== BUILD STEP SNAP POINTS FROM CHILD TIMELINES ======
//       const masterDur = master.duration();
//       const stepProgresses = [];

//       const addStepsFromTimeline = (tl, labels) => {
//         if (!tl || !labels || !labels.length) return;
//         const start = tl.startTime();

//         labels.forEach((label) => {
//           const localTime = tl.labels?.[label];
//           if (typeof localTime !== "number") return;
//           const globalTime = start + localTime;
//           stepProgresses.push(globalTime / masterDur);
//         });
//       };

//       stepProgresses.push(0);
//       addStepsFromTimeline(tlNew, SCENE_NEW_STEP_LABELS || []); // NEW SCENE STEPS
//       addStepsFromTimeline(tl2, SCENE1_2_STEP_LABELS || []);
//       addStepsFromTimeline(tl3, SCENE1_1_STEP_LABELS || []);
//       addStepsFromTimeline(tl4, []);
//       stepProgresses.push(1);

//       const snapPoints = Array.from(new Set(stepProgresses)).sort(
//         (a, b) => a - b
//       );

//       const SCENE_NEW_FIRST_STEP_PROGRESS = snapPoints[1] || 0.05; // NEW SCENE first checkpoint
//       snapPointsRef.current = snapPoints;

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
//           snapTo: snapPoints,
//           duration: 1.8,
//           delay: 0,
//           ease: "power2.out",
//           onStart: () => {
//             ScrollTrigger.clearScrollMemory();
//           }
//         },

//         onScrubComplete: () => {
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
//           const now = Date.now();
//           const timeDiff = now - lastScrollTime;
//           const progressDiff = Math.abs(self.progress - self.previous);
//           scrollVelocity = progressDiff / timeDiff;
//           lastScrollTime = now;

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

//           // NAVBAR CONTROL - Now based on NEW SCENE first step
//           if (
//             setShowNavbar &&
//             !hasShownNavbarRef.current &&
//             self.progress > SCENE_NEW_FIRST_STEP_PROGRESS
//           ) {
//             setShowNavbar(true);
//             hasShownNavbarRef.current = true;
//           }

//           if (
//             setShowNavbar &&
//             hasShownNavbarRef.current &&
//             self.progress <= SCENE_NEW_FIRST_STEP_PROGRESS
//           ) {
//             setShowNavbar(false);
//             hasShownNavbarRef.current = false;
//           }

//           if (
//             !scene1EndScrollRef.current &&
//             self.progress > SCENE_NEW_FIRST_STEP_PROGRESS
//           ) {
//             scene1EndScrollRef.current = self.scroll();
//           }
//         }
//       });

//       master.scrollTrigger = st;
//       masterTimelineRef.current = master;
//     });

//     // Custom event listener for scrolling to first scene
//     const handleScrollToSceneNew = () => {
//       const scrollTrigger = masterTimelineRef.current?.scrollTrigger;
//       if (scrollTrigger && snapPointsRef.current.length > 0) {
//         const targetProgress = snapPointsRef.current[1];
//         const targetScroll =
//           scrollTrigger.start +
//           (scrollTrigger.end - scrollTrigger.start) * targetProgress;

//         window.scrollTo({
//           top: targetScroll,
//           behavior: "smooth"
//         });
//       }
//     };
//     window.addEventListener("scrollToSceneNew", handleScrollToSceneNew);

//     return () => {
//       cancelAnimationFrame(id);
//       window.removeEventListener("scrollToSceneNew", handleScrollToSceneNew);

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
//   }, [isMobile, setShowNavbar, isLoading, introDone, animationsReady]);

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
//       {/* Grain texture - load last for better perceived performance */}
//       {animationsReady && (
//         <div
//           style={{
//             position: "fixed",
//             inset: 0,
//             pointerEvents: "none",
//             zIndex: 9999,
//             mixBlendMode: "overlay",
//             opacity: 0.2,
//             filter: "contrast(100%) brightness(90%)"
//           }}
//         >
//           <GrainTexture />
//         </div>
//       )}

//       {/* Scene 1 (intro) - Only visible until intro completes */}
//       <div
//         className="absolute inset-0 w-full h-full"
//         style={{
//           willChange: "transform, opacity",
//           pointerEvents: introDone ? "none" : "auto",
//           zIndex: introDone ? 1 : 10,
//           opacity: 1
//         }}
//       >
//         <Scene1
//           ref={scene1Refs}
//           isMobile={isMobile}
//           onIntroComplete={() => {
//             console.log("Intro complete! Enabling scroll...");
//             setIntroDone(true);
//             if (onIntroComplete) onIntroComplete();
//           }}
//         />
//       </div>

//       {/* NEW SCENE - First scrollable scene (takes over Scene1_1's role) */}
//       <div
//         ref={(el) => {
//           if (sceneNewRefs.current) sceneNewRefs.current.container = el;
//         }}
//         className="absolute inset-0 w-full h-full"
//         style={{
//           opacity: 0,
//           pointerEvents: introDone ? "auto" : "none",
//           zIndex: 3
//         }}
//       >
//         <SceneNew ref={sceneNewRefs} isMobile={isMobile} />
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

//       {/* Scene 1_1 - Now in 3rd position, slides in from RIGHT */}
//       <div
//         ref={(el) => {
//           if (scene1_1Refs.current) scene1_1Refs.current.container = el;
//         }}
//         className="absolute inset-0 w-full h-full"
//         style={{ x: "100%", zIndex: 4 }}
//       >
//         <Scene1_1 ref={scene1_1Refs} isMobile={isMobile} />
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

// import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
// import { gsap } from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import { ScrollToPlugin } from "gsap/ScrollToPlugin";
// import Scene1 from "./Scene1";

// // NEW SCENE - First scrollable scene
// import SceneNew, {
//   useSceneNewTimeline,
//   SCENE_NEW_STEP_LABELS
// } from "./SceneNew";

// // Existing scenes in new order
// import Scene1_1, {
//   useScene1_1Timeline,
//   setCompletedState,
//   SCENE1_1_STEP_LABELS
// } from "./Scene1_1";

// import Scene1_2, {
//   useScene1_2Timeline,
//   SCENE1_2_STEP_LABELS
// } from "./Scene1_2";

// // Scene1_3 REMOVED

// import Scene1_4, { useScene1_4Timeline } from "./Scene1_4";
// import GrainTexture from "../../components/GrainTexture";

// gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// const Home = ({
//   forceLayout = "auto",
//   setShowNavbar,
//   isLoading,
//   deviceType,
//   onIntroComplete
// }) => {
//   const scene1Refs = useRef({});
//   const sceneNewRefs = useRef({}); // NEW SCENE REFS
//   const scene1_1Refs = useRef({});
//   const scene1_2Refs = useRef({});
//   // scene1_3Refs REMOVED
//   const scene1_4Refs = useRef({});
//   const snapPointsRef = useRef([]);

//   const scene1EndScrollRef = useRef(null);
//   const hasShownNavbarRef = useRef(false);

//   // Intro completion flag
//   const [introDone, setIntroDone] = useState(false);

//   // CRITICAL: Track if animations should be enabled
//   const [animationsReady, setAnimationsReady] = useState(false);

//   // Updated logic: treat tablets as desktop
//   const [isMobile, setIsMobile] = useState(() => {
//     if (forceLayout === "mobile") return true;
//     if (forceLayout === "desktop") return false;
//     if (deviceType) return deviceType === "mobile";
//     return window.innerWidth <= 768;
//   });

//   const masterTimelineRef = useRef(null);

//   // DEFER ANIMATIONS: Wait for images to load before enabling heavy animations
//   useEffect(() => {
//     if (isLoading) return;

//     // Small delay after loading completes to ensure DOM is ready
//     const timeoutId = setTimeout(() => {
//       if ("requestIdleCallback" in window) {
//         requestIdleCallback(
//           () => {
//             setAnimationsReady(true);
//           },
//           { timeout: 500 }
//         );
//       } else {
//         setAnimationsReady(true);
//       }
//     }, 300);

//     return () => clearTimeout(timeoutId);
//   }, [isLoading]);

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

//   // ========== LOGO CLICK HANDLER - IMPROVED ==========
//   const handleLogoClick = React.useCallback(() => {
//     console.log("=== LOGO CLICKED ===");
//     console.log("introDone:", introDone);
//     console.log("animationsReady:", animationsReady);
//     console.log("masterTimelineRef.current:", masterTimelineRef.current);
//     console.log("snapPointsRef.current:", snapPointsRef.current);

//     // If intro not done yet, just scroll to top
//     if (!introDone || !animationsReady) {
//       console.log("Intro not done or animations not ready - scrolling to top");
//       window.scrollTo({
//         top: 0,
//         behavior: "smooth"
//       });
//       return;
//     }

//     const scrollTrigger = masterTimelineRef.current?.scrollTrigger;

//     if (!scrollTrigger) {
//       console.warn("ScrollTrigger not available - scrolling to top");
//       window.scrollTo({
//         top: 0,
//         behavior: "smooth"
//       });
//       return;
//     }

//     if (!snapPointsRef.current || snapPointsRef.current.length < 2) {
//       console.warn("Snap points not ready - scrolling to top");
//       window.scrollTo({
//         top: 0,
//         behavior: "smooth"
//       });
//       return;
//     }

//     // Get the first scene's progress (index 1, since 0 is Scene1 intro)
//     const sceneNewFirstStepProgress = snapPointsRef.current[1] || 0.05;
//     const targetScroll =
//       scrollTrigger.start +
//       (scrollTrigger.end - scrollTrigger.start) * sceneNewFirstStepProgress;

//     console.log("ScrollTrigger details:", {
//       start: scrollTrigger.start,
//       end: scrollTrigger.end,
//       currentScroll: window.pageYOffset,
//       targetScroll: targetScroll,
//       targetProgress: sceneNewFirstStepProgress,
//       currentProgress: scrollTrigger.progress
//     });

//     // Kill any existing scroll animations
//     gsap.killTweensOf(window);

//     // Use gsap ScrollToPlugin for reliable scrolling
//     gsap.to(window, {
//       duration: 1.2,
//       scrollTo: {
//         y: targetScroll,
//         autoKill: false
//       },
//       ease: "power2.inOut",
//       onStart: () => {
//         console.log("Scroll animation started");
//       },
//       onComplete: () => {
//         console.log("Scroll animation completed");
//       }
//     });

//     // Reset navbar state
//     if (setShowNavbar) {
//       setShowNavbar(false);
//       hasShownNavbarRef.current = false;
//     }
//   }, [setShowNavbar, introDone, animationsReady]);

//   // Attach to window with dependencies
//   useLayoutEffect(() => {
//     console.log("Attaching handleLogoClick to window");
//     window.handleLogoClick = handleLogoClick;

//     // Also create a global flag to indicate we're on the home page
//     window.isOnHomePage = true;

//     return () => {
//       console.log("Removing handleLogoClick from window");
//       delete window.handleLogoClick;
//       delete window.isOnHomePage;
//     };
//   }, [handleLogoClick]);

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

//   // ========== BUILD MASTER TIMELINE (only after intro AND animations are ready) ==========
//   useLayoutEffect(() => {
//     // CRITICAL: Don't build timeline until animations are ready
//     if (isLoading || !introDone || !animationsReady) {
//       console.log("Waiting for conditions:", {
//         isLoading,
//         introDone,
//         animationsReady
//       });
//       return;
//     }

//     if (
//       !scene1Refs.current.container ||
//       !sceneNewRefs.current.container || // NEW SCENE CHECK
//       !scene1_1Refs.current.container ||
//       !scene1_2Refs.current.container ||
//       // scene1_3Refs.current.container REMOVED
//       !scene1_4Refs.current.container
//     ) {
//       console.log("Waiting for refs to be ready");
//       return;
//     }

//     console.log("Building master timeline...");

//     const id = requestAnimationFrame(() => {
//       // Initialize SceneNew to START state (NEW SCENE - inherits Scene1_1's initial logic)
//       // You can add specific initial states for SceneNew here if needed
//       gsap.set(sceneNewRefs.current.container, {
//         opacity: 0,
//         willChange: "transform, opacity"
//       });

//       // Initialize Scene1_2 to START state
//       gsap.set(scene1_2Refs.current.container, {
//         y: "-100%",
//         willChange: "transform"
//       });

//       // Initialize Scene1_1 to START state (moved to middle position)
//       gsap.set(scene1_1Refs.current.container, {
//         x: "100%", // Slides in from right (like old Scene1_3)
//         willChange: "transform"
//       });

//       // Initialize Scene1_4 to START state
//       gsap.set(scene1_4Refs.current.container, {
//         y: "120%",
//         rotation: 15,
//         transformOrigin: "center center",
//         opacity: 0,
//         scale: 0.9,
//         willChange: "transform, opacity"
//       });

//       // Get timelines for each scene
//       const tlNew = useSceneNewTimeline(sceneNewRefs.current, isMobile); // NEW SCENE TIMELINE
//       const tl2 = useScene1_2Timeline(scene1_2Refs.current, isMobile);
//       const tl3 = useScene1_1Timeline(scene1_1Refs.current, isMobile); // Scene1_1 is now 3rd
//       const tl4 = useScene1_4Timeline(scene1_4Refs.current, isMobile);

//       if (masterTimelineRef.current) {
//         masterTimelineRef.current.kill();
//       }

//       const SECTIONS = 5; // Still 5 sections (Scene1, SceneNew, Scene1_2, Scene1_1, Scene1_4)
//       const SCROLL_PER_SECTION = 8;
//       const vh = Math.max(window.innerHeight, 400);
//       const scrollLength = vh * SECTIONS * SCROLL_PER_SECTION;

//       const master = gsap.timeline({ paused: true });
//       masterTimelineRef.current = master;

//       // ========== TRANSITION 1: Scene1 → SceneNew (CROSSFADE) ==========
//       master
//         .to(sceneNewRefs.current.container, {
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

//       // Add SceneNew timeline
//       if (tlNew) master.add(tlNew);

//       // ========== TRANSITION 2: SceneNew → Scene1_2 (VERTICAL SLIDE) ==========
//       master
//         .to(sceneNewRefs.current.container, {
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

//       // Add Scene1_2 timeline
//       if (tl2) master.add(tl2);

//       // ========== TRANSITION 3: Scene1_2 → Scene1_1 (HORIZONTAL SLIDE - like old Scene1_2 → Scene1_3) ==========
//       master
//         .to(scene1_2Refs.current.container, {
//           x: "-100%",
//           duration: 1.2,
//           ease: "power2.inOut",
//           force3D: true
//         })
//         .to(
//           scene1_1Refs.current.container,
//           {
//             x: "0%",
//             duration: 1.2,
//             ease: "power2.inOut",
//             force3D: true
//           },
//           "<"
//         );

//       // Add Scene1_1 timeline
//       if (tl3) master.add(tl3);

//       // ========== TRANSITION 4: Scene1_1 → Scene1_4 (ZOOM/FADE - like old Scene1_3 → Scene1_4) ==========
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

//       // Add Scene1_4 timeline
//       if (tl4) master.add(tl4);

//       // ====== BUILD STEP SNAP POINTS FROM CHILD TIMELINES ======
//       const masterDur = master.duration();
//       const stepProgresses = [];

//       const addStepsFromTimeline = (tl, labels) => {
//         if (!tl || !labels || !labels.length) return;
//         const start = tl.startTime();

//         labels.forEach((label) => {
//           const localTime = tl.labels?.[label];
//           if (typeof localTime !== "number") return;
//           const globalTime = start + localTime;
//           stepProgresses.push(globalTime / masterDur);
//         });
//       };

//       stepProgresses.push(0);
//       addStepsFromTimeline(tlNew, SCENE_NEW_STEP_LABELS || []); // NEW SCENE STEPS
//       addStepsFromTimeline(tl2, SCENE1_2_STEP_LABELS || []);
//       addStepsFromTimeline(tl3, SCENE1_1_STEP_LABELS || []);
//       addStepsFromTimeline(tl4, []);
//       stepProgresses.push(1);

//       const snapPoints = Array.from(new Set(stepProgresses)).sort(
//         (a, b) => a - b
//       );

//       const SCENE_NEW_FIRST_STEP_PROGRESS = snapPoints[1] || 0.05; // NEW SCENE first checkpoint
//       snapPointsRef.current = snapPoints;

//       console.log("Snap points created:", snapPoints);
//       console.log("First scene progress:", SCENE_NEW_FIRST_STEP_PROGRESS);

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
//           snapTo: snapPoints,
//           duration: 1.8,
//           delay: 0,
//           ease: "power2.out",
//           onStart: () => {
//             ScrollTrigger.clearScrollMemory();
//           }
//         },

//         onScrubComplete: () => {
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
//           const now = Date.now();
//           const timeDiff = now - lastScrollTime;
//           const progressDiff = Math.abs(self.progress - self.previous);
//           scrollVelocity = progressDiff / timeDiff;
//           lastScrollTime = now;

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

//           // NAVBAR CONTROL - Now based on NEW SCENE first step
//           if (
//             setShowNavbar &&
//             !hasShownNavbarRef.current &&
//             self.progress > SCENE_NEW_FIRST_STEP_PROGRESS
//           ) {
//             setShowNavbar(true);
//             hasShownNavbarRef.current = true;
//           }

//           if (
//             setShowNavbar &&
//             hasShownNavbarRef.current &&
//             self.progress <= SCENE_NEW_FIRST_STEP_PROGRESS
//           ) {
//             setShowNavbar(false);
//             hasShownNavbarRef.current = false;
//           }

//           if (
//             !scene1EndScrollRef.current &&
//             self.progress > SCENE_NEW_FIRST_STEP_PROGRESS
//           ) {
//             scene1EndScrollRef.current = self.scroll();
//           }
//         }
//       });

//       master.scrollTrigger = st;
//       masterTimelineRef.current = master;

//       console.log("Master timeline created successfully");
//       console.log("ScrollTrigger start:", st.start, "end:", st.end);
//     });

//     // Custom event listener for scrolling to first scene
//     const handleScrollToSceneNew = () => {
//       console.log("handleScrollToSceneNew event triggered");
//       const scrollTrigger = masterTimelineRef.current?.scrollTrigger;
//       if (scrollTrigger && snapPointsRef.current.length > 0) {
//         const targetProgress = snapPointsRef.current[1];
//         const targetScroll =
//           scrollTrigger.start +
//           (scrollTrigger.end - scrollTrigger.start) * targetProgress;

//         gsap.to(window, {
//           duration: 1.2,
//           scrollTo: {
//             y: targetScroll,
//             autoKill: false
//           },
//           ease: "power2.inOut"
//         });
//       }
//     };
//     window.addEventListener("scrollToSceneNew", handleScrollToSceneNew);

//     return () => {
//       cancelAnimationFrame(id);
//       window.removeEventListener("scrollToSceneNew", handleScrollToSceneNew);

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
//   }, [isMobile, setShowNavbar, isLoading, introDone, animationsReady]);

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
//       {/* Grain texture - load last for better perceived performance */}
//       {animationsReady && (
//         <div
//           style={{
//             position: "fixed",
//             inset: 0,
//             pointerEvents: "none",
//             zIndex: 9999,
//             mixBlendMode: "overlay",
//             opacity: 0.2,
//             filter: "contrast(100%) brightness(90%)"
//           }}
//         >
//           <GrainTexture />
//         </div>
//       )}

//       {/* Scene 1 (intro) - Only visible until intro completes */}
//       <div
//         className="absolute inset-0 w-full h-full"
//         style={{
//           willChange: "transform, opacity",
//           pointerEvents: introDone ? "none" : "auto",
//           zIndex: introDone ? 1 : 10,
//           opacity: 1
//         }}
//       >
//         <Scene1
//           ref={scene1Refs}
//           isMobile={isMobile}
//           onIntroComplete={() => {
//             console.log("Intro complete! Enabling scroll...");
//             setIntroDone(true);
//             if (onIntroComplete) onIntroComplete();
//           }}
//         />
//       </div>

//       {/* NEW SCENE - First scrollable scene (takes over Scene1_1's role) */}
//       <div
//         ref={(el) => {
//           if (sceneNewRefs.current) sceneNewRefs.current.container = el;
//         }}
//         className="absolute inset-0 w-full h-full"
//         style={{
//           opacity: 0,
//           pointerEvents: introDone ? "auto" : "none",
//           zIndex: 3
//         }}
//       >
//         <SceneNew ref={sceneNewRefs} isMobile={isMobile} />
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

//       {/* Scene 1_1 - Now in 3rd position, slides in from RIGHT */}
//       <div
//         ref={(el) => {
//           if (scene1_1Refs.current) scene1_1Refs.current.container = el;
//         }}
//         className="absolute inset-0 w-full h-full"
//         style={{ x: "100%", zIndex: 4 }}
//       >
//         <Scene1_1 ref={scene1_1Refs} isMobile={isMobile} />
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

// import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
// import { gsap } from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import { ScrollToPlugin } from "gsap/ScrollToPlugin";
// import Scene1 from "./Scene1";

// // NEW SCENE - First scrollable scene
// import SceneNew, {
//   useSceneNewTimeline,
//   SCENE_NEW_STEP_LABELS
// } from "./SceneNew";

// // Existing scenes in new order
// import Scene1_1, {
//   useScene1_1Timeline,
//   setCompletedState,
//   SCENE1_1_STEP_LABELS
// } from "./Scene1_1";

// import Scene1_2, {
//   useScene1_2Timeline,
//   SCENE1_2_STEP_LABELS
// } from "./Scene1_2";

// // Scene1_3 REMOVED

// import Scene1_4, { useScene1_4Timeline } from "./Scene1_4";
// import GrainTexture from "../../components/GrainTexture";

// gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// const Home = ({
//   forceLayout = "auto",
//   setShowNavbar,
//   isLoading,
//   deviceType,
//   onIntroComplete
// }) => {
//   const scene1Refs = useRef({});
//   const sceneNewRefs = useRef({}); // NEW SCENE REFS
//   const scene1_1Refs = useRef({});
//   const scene1_2Refs = useRef({});
//   // scene1_3Refs REMOVED
//   const scene1_4Refs = useRef({});
//   const snapPointsRef = useRef([]);

//   const scene1EndScrollRef = useRef(null);
//   const hasShownNavbarRef = useRef(false);

//   // Intro completion flag
//   const [introDone, setIntroDone] = useState(false);

//   // CRITICAL: Track if animations should be enabled
//   const [animationsReady, setAnimationsReady] = useState(false);

//   // Updated logic: treat tablets as desktop
//   const [isMobile, setIsMobile] = useState(() => {
//     if (forceLayout === "mobile") return true;
//     if (forceLayout === "desktop") return false;
//     if (deviceType) return deviceType === "mobile";
//     return window.innerWidth <= 768;
//   });

//   const masterTimelineRef = useRef(null);

//   // DEFER ANIMATIONS: Wait for images to load before enabling heavy animations
//   useEffect(() => {
//     if (isLoading) return;

//     // Small delay after loading completes to ensure DOM is ready
//     const timeoutId = setTimeout(() => {
//       if ("requestIdleCallback" in window) {
//         requestIdleCallback(
//           () => {
//             setAnimationsReady(true);
//           },
//           { timeout: 500 }
//         );
//       } else {
//         setAnimationsReady(true);
//       }
//     }, 300);

//     return () => clearTimeout(timeoutId);
//   }, [isLoading]);

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

//   // ========== LOGO CLICK HANDLER - IMPROVED ==========
//   const handleLogoClick = React.useCallback(() => {
//     console.log("=== LOGO CLICKED ===");
//     console.log("introDone:", introDone);
//     console.log("animationsReady:", animationsReady);
//     console.log("masterTimelineRef.current:", masterTimelineRef.current);
//     console.log("snapPointsRef.current:", snapPointsRef.current);

//     // If intro not done yet, just scroll to top
//     if (!introDone || !animationsReady) {
//       console.log("Intro not done or animations not ready - scrolling to top");
//       window.scrollTo({
//         top: 0,
//         behavior: "smooth"
//       });
//       return;
//     }

//     const scrollTrigger = masterTimelineRef.current?.scrollTrigger;

//     if (!scrollTrigger) {
//       console.warn("ScrollTrigger not available - scrolling to top");
//       window.scrollTo({
//         top: 0,
//         behavior: "smooth"
//       });
//       return;
//     }

//     if (!snapPointsRef.current || snapPointsRef.current.length < 2) {
//       console.warn("Snap points not ready - scrolling to top");
//       window.scrollTo({
//         top: 0,
//         behavior: "smooth"
//       });
//       return;
//     }

//     // Get the first scene's progress (index 1, since 0 is Scene1 intro)
//     const sceneNewFirstStepProgress = snapPointsRef.current[1] || 0.05;
//     const targetScroll =
//       scrollTrigger.start +
//       (scrollTrigger.end - scrollTrigger.start) * sceneNewFirstStepProgress;

//     console.log("ScrollTrigger details:", {
//       start: scrollTrigger.start,
//       end: scrollTrigger.end,
//       currentScroll: window.pageYOffset,
//       targetScroll: targetScroll,
//       targetProgress: sceneNewFirstStepProgress,
//       currentProgress: scrollTrigger.progress
//     });

//     // Kill any existing scroll animations
//     gsap.killTweensOf(window);

//     // Use gsap ScrollToPlugin for reliable scrolling
//     gsap.to(window, {
//       duration: 1.2,
//       scrollTo: {
//         y: targetScroll,
//         autoKill: false
//       },
//       ease: "power2.inOut",
//       onStart: () => {
//         console.log("Scroll animation started");
//       },
//       onComplete: () => {
//         console.log("Scroll animation completed");
//       }
//     });

//     // Reset navbar state
//     if (setShowNavbar) {
//       setShowNavbar(false);
//       hasShownNavbarRef.current = false;
//     }
//   }, [setShowNavbar, introDone, animationsReady]);

//   // Attach to window with dependencies
//   useLayoutEffect(() => {
//     console.log("Attaching handleLogoClick to window");
//     window.handleLogoClick = handleLogoClick;

//     // Also create a global flag to indicate we're on the home page
//     window.isOnHomePage = true;

//     return () => {
//       console.log("Removing handleLogoClick from window");
//       delete window.handleLogoClick;
//       delete window.isOnHomePage;
//     };
//   }, [handleLogoClick]);

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

//   // ========== BUILD MASTER TIMELINE (only after intro AND animations are ready) ==========
//   useLayoutEffect(() => {
//     // CRITICAL: Don't build timeline until animations are ready
//     if (isLoading || !introDone || !animationsReady) {
//       console.log("Waiting for conditions:", {
//         isLoading,
//         introDone,
//         animationsReady
//       });
//       return;
//     }

//     if (
//       !scene1Refs.current.container ||
//       !sceneNewRefs.current.container || // NEW SCENE CHECK
//       !scene1_1Refs.current.container ||
//       !scene1_2Refs.current.container ||
//       // scene1_3Refs.current.container REMOVED
//       !scene1_4Refs.current.container
//     ) {
//       console.log("Waiting for refs to be ready");
//       return;
//     }

//     console.log("Building master timeline...");

//     const id = requestAnimationFrame(() => {
//       // Initialize SceneNew to START state (NEW SCENE - inherits Scene1_1's initial logic)
//       // You can add specific initial states for SceneNew here if needed
//       gsap.set(sceneNewRefs.current.container, {
//         opacity: 0,
//         willChange: "transform, opacity"
//       });

//       // Initialize Scene1_2 to START state
//       gsap.set(scene1_2Refs.current.container, {
//         y: "-100%",
//         willChange: "transform"
//       });

//       // Initialize Scene1_1 to START state (moved to middle position)
//       gsap.set(scene1_1Refs.current.container, {
//         x: "100%", // Slides in from right (like old Scene1_3)
//         willChange: "transform"
//       });

//       // Initialize Scene1_4 to START state
//       gsap.set(scene1_4Refs.current.container, {
//         y: "120%",
//         rotation: 15,
//         transformOrigin: "center center",
//         opacity: 0,
//         scale: 0.9,
//         willChange: "transform, opacity"
//       });

//       // Get timelines for each scene
//       const tlNew = useSceneNewTimeline(sceneNewRefs.current, isMobile); // NEW SCENE TIMELINE
//       const tl2 = useScene1_2Timeline(scene1_2Refs.current, isMobile);
//       const tl3 = useScene1_1Timeline(scene1_1Refs.current, isMobile); // Scene1_1 is now 3rd
//       const tl4 = useScene1_4Timeline(scene1_4Refs.current, isMobile);

//       if (masterTimelineRef.current) {
//         masterTimelineRef.current.kill();
//       }

//       const SECTIONS = 5; // Still 5 sections (Scene1, SceneNew, Scene1_2, Scene1_1, Scene1_4)
//       const SCROLL_PER_SECTION = 8;
//       const vh = Math.max(window.innerHeight, 400);
//       const scrollLength = vh * SECTIONS * SCROLL_PER_SECTION;

//       const master = gsap.timeline({ paused: true });
//       masterTimelineRef.current = master;

//       // ========== TRANSITION 1: Scene1 → SceneNew (CROSSFADE) ==========
//       master
//         .to(sceneNewRefs.current.container, {
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

//       // Add SceneNew timeline
//       if (tlNew) master.add(tlNew);

//       // ========== TRANSITION 2: SceneNew → Scene1_2 (VERTICAL SLIDE) ==========
//       master
//         .to(sceneNewRefs.current.container, {
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

//       // Add Scene1_2 timeline
//       if (tl2) master.add(tl2);

//       // ========== TRANSITION 3: Scene1_2 → Scene1_1 (HORIZONTAL SLIDE - like old Scene1_2 → Scene1_3) ==========
//       master
//         .to(scene1_2Refs.current.container, {
//           x: "-100%",
//           duration: 1.2,
//           ease: "power2.inOut",
//           force3D: true
//         })
//         .to(
//           scene1_1Refs.current.container,
//           {
//             x: "0%",
//             duration: 1.2,
//             ease: "power2.inOut",
//             force3D: true
//           },
//           "<"
//         );

//       // Add Scene1_1 timeline
//       if (tl3) master.add(tl3);

//       // ========== TRANSITION 4: Scene1_1 → Scene1_4 (ZOOM/FADE - like old Scene1_3 → Scene1_4) ==========
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

//       // Add Scene1_4 timeline
//       if (tl4) master.add(tl4);

//       // ====== BUILD STEP SNAP POINTS FROM CHILD TIMELINES ======
//       const masterDur = master.duration();
//       const stepProgresses = [];

//       const addStepsFromTimeline = (tl, labels) => {
//         if (!tl || !labels || !labels.length) return;
//         const start = tl.startTime();

//         labels.forEach((label) => {
//           const localTime = tl.labels?.[label];
//           if (typeof localTime !== "number") return;
//           const globalTime = start + localTime;
//           stepProgresses.push(globalTime / masterDur);
//         });
//       };

//       stepProgresses.push(0);
//       addStepsFromTimeline(tlNew, SCENE_NEW_STEP_LABELS || []); // NEW SCENE STEPS
//       addStepsFromTimeline(tl2, SCENE1_2_STEP_LABELS || []);
//       addStepsFromTimeline(tl3, SCENE1_1_STEP_LABELS || []);
//       addStepsFromTimeline(tl4, []);
//       stepProgresses.push(1);

//       const snapPoints = Array.from(new Set(stepProgresses)).sort(
//         (a, b) => a - b
//       );

//       const SCENE_NEW_FIRST_STEP_PROGRESS = snapPoints[1] || 0.05; // NEW SCENE first checkpoint
//       snapPointsRef.current = snapPoints;

//       console.log("Snap points created:", snapPoints);
//       console.log("First scene progress:", SCENE_NEW_FIRST_STEP_PROGRESS);

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
//           snapTo: snapPoints,
//           duration: 1.8,
//           delay: 0,
//           ease: "power2.out",
//           onStart: () => {
//             ScrollTrigger.clearScrollMemory();
//           }
//         },

//         onScrubComplete: () => {
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
//           const now = Date.now();
//           const timeDiff = now - lastScrollTime;
//           const progressDiff = Math.abs(self.progress - self.previous);
//           scrollVelocity = progressDiff / timeDiff;
//           lastScrollTime = now;

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

//           // NAVBAR CONTROL - Now based on NEW SCENE first step
//           if (
//             setShowNavbar &&
//             !hasShownNavbarRef.current &&
//             self.progress > SCENE_NEW_FIRST_STEP_PROGRESS
//           ) {
//             setShowNavbar(true);
//             hasShownNavbarRef.current = true;
//           }

//           if (
//             setShowNavbar &&
//             hasShownNavbarRef.current &&
//             self.progress <= SCENE_NEW_FIRST_STEP_PROGRESS
//           ) {
//             setShowNavbar(false);
//             hasShownNavbarRef.current = false;
//           }

//           if (
//             !scene1EndScrollRef.current &&
//             self.progress > SCENE_NEW_FIRST_STEP_PROGRESS
//           ) {
//             scene1EndScrollRef.current = self.scroll();
//           }
//         }
//       });

//       master.scrollTrigger = st;
//       masterTimelineRef.current = master;

//       console.log("Master timeline created successfully");
//       console.log("ScrollTrigger start:", st.start, "end:", st.end);
//     });

//     // Custom event listener for scrolling to first scene
//     const handleScrollToSceneNew = () => {
//       console.log("handleScrollToSceneNew event triggered");
//       const scrollTrigger = masterTimelineRef.current?.scrollTrigger;
//       if (scrollTrigger && snapPointsRef.current.length > 0) {
//         const targetProgress = snapPointsRef.current[1];
//         const targetScroll =
//           scrollTrigger.start +
//           (scrollTrigger.end - scrollTrigger.start) * targetProgress;

//         gsap.to(window, {
//           duration: 1.2,
//           scrollTo: {
//             y: targetScroll,
//             autoKill: false
//           },
//           ease: "power2.inOut"
//         });
//       }
//     };
//     window.addEventListener("scrollToSceneNew", handleScrollToSceneNew);

//     return () => {
//       cancelAnimationFrame(id);
//       window.removeEventListener("scrollToSceneNew", handleScrollToSceneNew);

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
//   }, [isMobile, setShowNavbar, isLoading, introDone, animationsReady]);

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
//       {/* Grain texture - load last for better perceived performance */}
//       {animationsReady && (
//         <div
//           style={{
//             position: "fixed",
//             inset: 0,
//             pointerEvents: "none",
//             zIndex: 9999,
//             mixBlendMode: "overlay",
//             opacity: 0.2,
//             filter: "contrast(100%) brightness(90%)"
//           }}
//         >
//           <GrainTexture />
//         </div>
//       )}

//       {/* Scene 1 (intro) - Only visible until intro completes */}
//       <div
//         className="absolute inset-0 w-full h-full"
//         style={{
//           willChange: "transform, opacity",
//           pointerEvents: introDone ? "none" : "auto",
//           zIndex: introDone ? 1 : 10,
//           opacity: 1
//         }}
//       >
//         <Scene1
//           ref={scene1Refs}
//           isMobile={isMobile}
//           onIntroComplete={() => {
//             console.log("Intro complete! Enabling scroll...");
//             setIntroDone(true);
//             if (onIntroComplete) onIntroComplete();
//           }}
//         />
//       </div>

//       {/* NEW SCENE - First scrollable scene (takes over Scene1_1's role) */}
//       <div
//         ref={(el) => {
//           if (sceneNewRefs.current) sceneNewRefs.current.container = el;
//         }}
//         className="absolute inset-0 w-full h-full"
//         style={{
//           opacity: 0,
//           pointerEvents: introDone ? "auto" : "none",
//           zIndex: 3
//         }}
//       >
//         <SceneNew ref={sceneNewRefs} isMobile={isMobile} />
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

//       {/* Scene 1_1 - Now in 3rd position, slides in from RIGHT */}
//       <div
//         ref={(el) => {
//           if (scene1_1Refs.current) scene1_1Refs.current.container = el;
//         }}
//         className="absolute inset-0 w-full h-full"
//         style={{ x: "100%", zIndex: 4 }}
//       >
//         <Scene1_1 ref={scene1_1Refs} isMobile={isMobile} />
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
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import Scene1 from "./Scene1";

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
      const vh = Math.max(Math.min(window.innerHeight, 1080), 400);
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
  );
};

export default Home;
