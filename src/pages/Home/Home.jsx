// import React, { useLayoutEffect, useRef, useState } from "react";
// import { gsap } from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import Scene1, { useScene1Timeline } from "./Scene1";
// import Scene1_1, { useScene1_1Timeline, setCompletedState } from "./Scene1_1"; // ⬅️ Import setCompletedState
// import Scene1_2, { useScene1_2Timeline } from "./Scene1_2";
// import Scene1_3, { useScene1_3Timeline } from "./Scene1_3";
// import Scene1_4, { useScene1_4Timeline } from "./Scene1_4";
// import GrainTexture from "../../components/GrainTexture";

// gsap.registerPlugin(ScrollTrigger);

// const Home = ({ forceLayout = "auto", setShowNavbar, isLoading }) => {
//   const scene1Refs = useRef({});
//   const scene1_1Refs = useRef({});
//   const scene1_2Refs = useRef({});
//   const scene1_3Refs = useRef({});
//   const scene1_4Refs = useRef({});

//   const scene1EndScrollRef = useRef(null);
//   const hasShownNavbarRef = useRef(false);

//   const [isMobile, setIsMobile] = useState(() => {
//     if (forceLayout === "mobile") return true;
//     if (forceLayout === "desktop") return false;
//     return window.innerWidth <= 768;
//   });
//   const idleAnimsRef = useRef(null);
//   const masterTimelineRef = useRef(null);

//   // ========== SOLUTION 2: LOGO CLICK HANDLER ==========
//   const handleLogoClick = () => {
//     console.log("Logo clicked - returning to Scene1_1");

//     // Smooth scroll to top
//     window.scrollTo({
//       top: 0,
//       behavior: "smooth"
//     });

//     // Wait for smooth scroll to complete, then set completed state
//     setTimeout(() => {
//       if (scene1_1Refs.current) {
//         console.log("Setting completed state for Scene1_1");
//         setCompletedState(scene1_1Refs.current, isMobile);
//       }

//       // Reset master timeline to beginning but keep it paused
//       if (masterTimelineRef.current) {
//         masterTimelineRef.current.seek(0);
//         masterTimelineRef.current.pause();
//         console.log("Master timeline reset and paused");
//       }

//       // Show Scene1_1 container
//       if (scene1_1Refs.current.container) {
//         gsap.set(scene1_1Refs.current.container, {
//           opacity: 1,
//           y: 0
//         });
//       }

//       // Hide Scene1 container
//       if (scene1Refs.current.container) {
//         gsap.set(scene1Refs.current.container, {
//           opacity: 0,
//           scale: 1.5
//         });
//       }

//       // Hide other scenes
//       if (scene1_2Refs.current.container) {
//         gsap.set(scene1_2Refs.current.container, { y: "-100%" });
//       }
//       if (scene1_3Refs.current.container) {
//         gsap.set(scene1_3Refs.current.container, { x: "100%" });
//       }
//       if (scene1_4Refs.current.container) {
//         gsap.set(scene1_4Refs.current.container, { y: "-100%" });
//       }

//       // Hide navbar temporarily since we're at Scene1_1
//       if (setShowNavbar) {
//         setShowNavbar(false);
//         hasShownNavbarRef.current = false;
//       }
//     }, 500); // Wait for scroll animation
//   };

//   // Expose handleLogoClick to window for Navigation component
//   useLayoutEffect(() => {
//     window.handleLogoClick = handleLogoClick;
//     return () => {
//       delete window.handleLogoClick;
//     };
//   }, [isMobile, setShowNavbar]); // Add dependencies

//   useLayoutEffect(() => {
//     if (forceLayout !== "auto") {
//       setIsMobile(forceLayout === "mobile");
//       return;
//     }
//     const handleResize = () => setIsMobile(window.innerWidth <= 768);
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, [forceLayout]);

//   useLayoutEffect(() => {
//     if (isLoading) return;

//     if (setShowNavbar) {
//       setShowNavbar(false);
//       hasShownNavbarRef.current = false;
//     }

//     if (
//       !scene1Refs.current.container ||
//       !scene1_1Refs.current.container ||
//       !scene1_2Refs.current.container ||
//       !scene1_3Refs.current.container ||
//       !scene1_4Refs.current.container
//     ) {
//       return;
//     }

//     // Create idle animations BEFORE scroll
//     if (scene1Refs.current.rainbow && scene1Refs.current.cube) {
//       idleAnimsRef.current = gsap.context(() => {
//         gsap.to(scene1Refs.current.rainbow, {
//           scale: isMobile ? 1.08 : 1.06,
//           ease: "sine.inOut",
//           duration: 2.5,
//           repeat: -1,
//           yoyo: true,
//           willChange: "transform"
//         });

//         gsap.to(scene1Refs.current.cube, {
//           y: -10,
//           ease: "sine.inOut",
//           duration: 2,
//           repeat: -1,
//           yoyo: true,
//           willChange: "transform"
//         });
//       });
//     }

//     const id = requestAnimationFrame(() => {
//       // ✅ Initialize Scene1_1 to START state
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

//       // ✅ Initialize Scene1_2 to START state - MAKE CONTENT VISIBLE from the start
//       gsap.set(scene1_2Refs.current.container, { y: "-100%" });

//       // ✅ Initialize Scene1_3 to START state - MAKE CONTENT VISIBLE from the start
//       gsap.set(scene1_3Refs.current.container, { x: "100%" });

//       // ✅ Initialize Scene1_4 to START state
//       gsap.set(scene1_4Refs.current.container, { y: "-100%" });

//       const tl1 = useScene1Timeline(scene1Refs.current, isMobile);
//       const tl2 = useScene1_1Timeline(scene1_1Refs.current, isMobile);
//       const tl3 = useScene1_2Timeline(scene1_2Refs.current, isMobile);
//       const tl4 = useScene1_3Timeline(scene1_3Refs.current, isMobile);
//       const tl5 = useScene1_4Timeline(scene1_4Refs.current, isMobile);

//       // ✅ FREEZE rainbow state before scroll
//       if (scene1Refs.current.rainbow) {
//         gsap.set(scene1Refs.current.rainbow, {
//           scale: isMobile ? 1.08 : 1.06,
//           overwrite: "auto"
//         });
//       }

//       // Set screen1 to be visible at start, screen2 positioned but hidden
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

//       // if (masterTimelineRef.current) {
//       //   masterTimelineRef.current.kill();
//       // }

//       // const master = gsap.timeline({
//       //   // scrollTrigger: {
//       //   //   trigger: "#scroll-container",
//       //   //   start: "top top",
//       //   //   end: isMobile ? "+=80000" : "+=80000",
//       //   //   scrub: isMobile ? 0.05 : 0.05,
//       //   //   pin: true,
//       //   //   fastScrollEnd: true,
//       //   //   anticipatePin: 1,
//       //   // const master = gsap.timeline({
//       //   scrollTrigger: {
//       //     trigger: "#scroll-container",
//       //     start: "top top",
//       //     end: isMobile ? "+=40000" : "+=50000", // ✅ REDUCED from 80000 - makes scroll faster
//       //     scrub: 2, // ✅ INCREASED from 0.05 - creates discrete "snappy" transitions
//       //     pin: true,
//       //     fastScrollEnd: true,
//       //     anticipatePin: 1,
//       //     snap: {
//       //       snapTo: "labelsDirectional", // ✅ NEW - snaps to timeline labels
//       //       duration: { min: 0.2, max: 0.5 }, // ✅ NEW - smooth snap duration
//       //       ease: "power2.inOut"
//       //     },
//       //     onStart: () => {
//       //       if (idleAnimsRef.current) {
//       //         idleAnimsRef.current.revert();
//       //         idleAnimsRef.current = null;
//       //       }
//       //       if (scene1Refs.current.rainbow) {
//       //         gsap.set(scene1Refs.current.rainbow, { overwrite: "auto" });
//       //       }
//       //     },
//       //     onUpdate: (self) => {
//       //       const totalDuration = master.duration();
//       //       let scene1Duration = 0.6 + 0.6 - 0.3;
//       //       if (master.getChildren()[0]) {
//       //         scene1Duration += master.getChildren()[0].duration();
//       //       }

//       //       const scene1EndProgress = scene1Duration / totalDuration;

//       //       if (
//       //         setShowNavbar &&
//       //         !hasShownNavbarRef.current &&
//       //         self.progress > scene1EndProgress
//       //       ) {
//       //         setShowNavbar(true);
//       //         hasShownNavbarRef.current = true;
//       //       }

//       //       if (
//       //         setShowNavbar &&
//       //         hasShownNavbarRef.current &&
//       //         self.progress <= scene1EndProgress
//       //       ) {
//       //         setShowNavbar(false);
//       //         hasShownNavbarRef.current = false;
//       //       }

//       //       if (
//       //         !scene1EndScrollRef.current &&
//       //         self.progress > scene1EndProgress
//       //       ) {
//       //         scene1EndScrollRef.current = self.scroll();
//       //       }
//       //     }
//       //   }
//       // });
//       if (masterTimelineRef.current) {
//         masterTimelineRef.current.kill();
//       }

//       const SECTIONS = 5; // scene1, 1_1, 1_2, 1_3, 1_4
//       const SCROLL_PER_SECTION = 4; // same for mobile/desktop

//       // guard for weird cases where innerHeight is tiny
//       const vh = Math.max(window.innerHeight, 400);
//       const scrollLength = vh * SECTIONS * SCROLL_PER_SECTION;

//       const master = gsap.timeline({
//         scrollTrigger: {
//           trigger: "#scroll-container",
//           start: "top top",
//           end: `+=${scrollLength}`,
//           scrub: 0.8,
//           pin: true,
//           fastScrollEnd: false,
//           anticipatePin: 1,
//           invalidateOnRefresh: true, // ✅ recompute on resize

//           // // ✅ SNAP TO LABELS - this makes Scene1_3 snap to each step
//           // snap: {
//           //   snapTo: "labels", // Snaps to timeline labels
//           //   duration: { min: 0.3, max: 0.6 },
//           //   delay: 0.1,
//           //   ease: "power2.out"
//           // },
//           onStart: () => {
//             if (idleAnimsRef.current) {
//               idleAnimsRef.current.revert();
//               idleAnimsRef.current = null;
//             }
//             if (scene1Refs.current.rainbow) {
//               gsap.set(scene1Refs.current.rainbow, { overwrite: "auto" });
//             }
//           },

//           onUpdate: (self) => {
//             const totalDuration = master.duration();
//             let scene1Duration = 0.6 + 0.6 - 0.3;
//             if (master.getChildren()[0]) {
//               scene1Duration += master.getChildren()[0].duration();
//             }

//             const scene1EndProgress = scene1Duration / totalDuration;

//             if (
//               setShowNavbar &&
//               !hasShownNavbarRef.current &&
//               self.progress > scene1EndProgress
//             ) {
//               setShowNavbar(true);
//               hasShownNavbarRef.current = true;
//             }

//             if (
//               setShowNavbar &&
//               hasShownNavbarRef.current &&
//               self.progress <= scene1EndProgress
//             ) {
//               setShowNavbar(false);
//               hasShownNavbarRef.current = false;
//             }

//             if (
//               !scene1EndScrollRef.current &&
//               self.progress > scene1EndProgress
//             ) {
//               scene1EndScrollRef.current = self.scroll();
//             }
//           }
//         }
//       });

//       masterTimelineRef.current = master;

//       if (tl1) {
//         master.add(tl1);
//       }

//       // 🚪 SEAMLESS TRANSITION: Scene1 → Scene1_1 (no black, direct crossfade)
//       master
//         .to(scene1_1Refs.current.container, {
//           opacity: 1,
//           duration: 0.4,
//           ease: "power2.in"
//         })
//         .to(
//           scene1Refs.current.container,
//           {
//             scale: 1.5,
//             opacity: 0,
//             duration: 0.8,
//             ease: "power2.inOut"
//           },
//           "<"
//         );

//       if (tl2) {
//         master.add(tl2);
//       }

//       // 🎬 SEAMLESS SLIDE: Scene1_1 → Scene1_2
//       master
//         .to(scene1_1Refs.current.container, {
//           y: "100%",
//           duration: 1.2,
//           ease: "power2.inOut"
//         })
//         .to(
//           scene1_2Refs.current.container,
//           {
//             y: "0%",
//             duration: 1.2,
//             ease: "power2.inOut"
//           },
//           "<"
//         );

//       if (tl3) {
//         master.add(tl3);
//       }

//       // 🎬 SEAMLESS HORIZONTAL SLIDE: Scene1_2 → Scene1_3
//       master
//         .to(scene1_2Refs.current.container, {
//           x: "-100%",
//           duration: 1.2,
//           ease: "power2.inOut"
//         })
//         .to(
//           scene1_3Refs.current.container,
//           {
//             x: "0%",
//             duration: 1.2,
//             ease: "power2.inOut"
//           },
//           "<"
//         );

//       if (tl4) {
//         master.add(tl4);
//       }

//       // 🎬 SEAMLESS VERTICAL SLIDE: Scene1_3 → Scene1_4
//       master
//         .to(scene1_3Refs.current.container, {
//           y: "100%",
//           duration: 1.2,
//           ease: "power2.inOut"
//         })
//         .to(
//           scene1_4Refs.current.container,
//           {
//             y: "0%",
//             duration: 1.2,
//             ease: "power2.inOut"
//           },
//           "<"
//         );

//       if (tl5) {
//         master.add(tl5);
//       }

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
//         if (idleAnimsRef.current) {
//           idleAnimsRef.current.kill();
//           idleAnimsRef.current = null;
//         }

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
//             // Ignore errors during cleanup
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
//   }, [isMobile, setShowNavbar, isLoading]);

//   return (
//     <div
//       id="scroll-container"
//       className="relative w-full h-screen overflow-hidden bg-black lowercase"
//       style={{ perspective: "1200px" }}
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

//       {/* Scene 1 */}
//       <div
//         className="absolute inset-0 w-full h-full z-[2]"
//         style={{
//           willChange: "transform, opacity",
//           pointerEvents: "auto"
//         }}
//       >
//         <Scene1 ref={scene1Refs} isMobile={isMobile} />
//       </div>

//       {/* Scene 1_1 */}
//       <div
//         ref={(el) => {
//           if (scene1_1Refs.current) scene1_1Refs.current.container = el;
//         }}
//         className="absolute inset-0 w-full h-full z-[3]"
//         style={{ opacity: 0, pointerEvents: "auto" }}
//       >
//         <Scene1_1 ref={scene1_1Refs} isMobile={isMobile} />
//       </div>

//       {/* Scene 1_2 */}
//       <div
//         ref={(el) => {
//           if (scene1_2Refs.current) scene1_2Refs.current.container = el;
//         }}
//         className="absolute inset-0 w-full h-full z-[4]"
//         style={{ y: "-100%" }}
//       >
//         <Scene1_2 ref={scene1_2Refs} isMobile={isMobile} />
//       </div>

//       {/* Scene 1_3 */}
//       <div
//         ref={(el) => {
//           if (scene1_3Refs.current) scene1_3Refs.current.container = el;
//         }}
//         className="absolute inset-0 w-full h-full"
//         style={{ x: "100%" }}
//       >
//         <Scene1_3 ref={scene1_3Refs} isMobile={isMobile} />
//       </div>

//       {/* Scene 1_4 */}
//       <div
//         ref={(el) => {
//           if (scene1_4Refs.current) scene1_4Refs.current.container = el;
//         }}
//         className="absolute inset-0 w-full h-full"
//         style={{ y: "-100%" }}
//       >
//         <Scene1_4 ref={scene1_4Refs} isMobile={isMobile} />
//       </div>
//     </div>
//   );
// };

// export default Home;

import React, { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Scene1, { useScene1Timeline } from "./Scene1";
import Scene1_1, { useScene1_1Timeline, setCompletedState } from "./Scene1_1"; // ⬅️ Import setCompletedState
import Scene1_2, { useScene1_2Timeline } from "./Scene1_2";
import Scene1_3, { useScene1_3Timeline } from "./Scene1_3";
import Scene1_4, { useScene1_4Timeline } from "./Scene1_4";
import GrainTexture from "../../components/GrainTexture";

gsap.registerPlugin(ScrollTrigger);

const Home = ({ forceLayout = "auto", setShowNavbar, isLoading }) => {
  const scene1Refs = useRef({});
  const scene1_1Refs = useRef({});
  const scene1_2Refs = useRef({});
  const scene1_3Refs = useRef({});
  const scene1_4Refs = useRef({});

  const scene1EndScrollRef = useRef(null);
  const hasShownNavbarRef = useRef(false);

  const [isMobile, setIsMobile] = useState(() => {
    if (forceLayout === "mobile") return true;
    if (forceLayout === "desktop") return false;
    return window.innerWidth <= 768;
  });
  const idleAnimsRef = useRef(null);
  const masterTimelineRef = useRef(null);

  // ========== SOLUTION 2: LOGO CLICK HANDLER ==========
  const handleLogoClick = () => {
    console.log("Logo clicked - returning to Scene1_1");

    // Smooth scroll to top
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    // Wait for smooth scroll to complete, then set completed state
    setTimeout(() => {
      if (scene1_1Refs.current) {
        console.log("Setting completed state for Scene1_1");
        setCompletedState(scene1_1Refs.current, isMobile);
      }

      // Reset master timeline to beginning but keep it paused
      if (masterTimelineRef.current) {
        masterTimelineRef.current.seek(0);
        masterTimelineRef.current.pause();
        console.log("Master timeline reset and paused");
      }

      // Show Scene1_1 container
      if (scene1_1Refs.current.container) {
        gsap.set(scene1_1Refs.current.container, {
          opacity: 1,
          y: 0
        });
      }

      // Hide Scene1 container
      if (scene1Refs.current.container) {
        gsap.set(scene1Refs.current.container, {
          opacity: 0,
          scale: 1.5
        });
      }

      // Hide other scenes
      if (scene1_2Refs.current.container) {
        gsap.set(scene1_2Refs.current.container, { y: "-100%" });
      }
      if (scene1_3Refs.current.container) {
        gsap.set(scene1_3Refs.current.container, { x: "100%" });
      }
      if (scene1_4Refs.current.container) {
        gsap.set(scene1_4Refs.current.container, { y: "-100%" });
      }

      // Hide navbar temporarily since we're at Scene1_1
      if (setShowNavbar) {
        setShowNavbar(false);
        hasShownNavbarRef.current = false;
      }
    }, 500); // Wait for scroll animation
  };

  // Expose handleLogoClick to window for Navigation component
  useLayoutEffect(() => {
    window.handleLogoClick = handleLogoClick;
    return () => {
      delete window.handleLogoClick;
    };
  }, [isMobile, setShowNavbar]); // Add dependencies

  useLayoutEffect(() => {
    if (forceLayout !== "auto") {
      setIsMobile(forceLayout === "mobile");
      return;
    }
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [forceLayout]);

  useLayoutEffect(() => {
    if (isLoading) return;

    if (setShowNavbar) {
      setShowNavbar(false);
      hasShownNavbarRef.current = false;
    }

    if (
      !scene1Refs.current.container ||
      !scene1_1Refs.current.container ||
      !scene1_2Refs.current.container ||
      !scene1_3Refs.current.container ||
      !scene1_4Refs.current.container
    ) {
      return;
    }

    // Create idle animations BEFORE scroll
    if (scene1Refs.current.rainbow && scene1Refs.current.cube) {
      idleAnimsRef.current = gsap.context(() => {
        gsap.to(scene1Refs.current.rainbow, {
          scale: isMobile ? 1.08 : 1.06,
          ease: "sine.inOut",
          duration: 2.5,
          repeat: -1,
          yoyo: true,
          willChange: "transform"
        });

        gsap.to(scene1Refs.current.cube, {
          y: -10,
          ease: "sine.inOut",
          duration: 2,
          repeat: -1,
          yoyo: true,
          willChange: "transform"
        });
      });
    }

    const id = requestAnimationFrame(() => {
      // ✅ Initialize Scene1_1 to START state
      gsap.set(scene1_1Refs.current.rightCloud, { opacity: 0, y: -50 });
      gsap.set(scene1_1Refs.current.leftCloud, { opacity: 0, y: 80 });
      gsap.set(scene1_1Refs.current.floor, { opacity: 0, y: 150 });
      gsap.set(scene1_1Refs.current.leftElement, { opacity: 0, x: -200 });
      gsap.set(scene1_1Refs.current.rightElement, { opacity: 0, x: 200 });
      gsap.set(scene1_1Refs.current.text, { opacity: 0, y: 30 });
      gsap.set(scene1_1Refs.current.objectsContainer, { opacity: 0 });
      gsap.set(scene1_1Refs.current.ellipse, { opacity: 0 });

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
          { y: 0, opacity: 1, scale: 1 }
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
          { height: 0, opacity: 0 }
        );
      }

      // ✅ Initialize Scene1_2 to START state - MAKE CONTENT VISIBLE from the start
      gsap.set(scene1_2Refs.current.container, { y: "-100%" });

      // ✅ Initialize Scene1_3 to START state - MAKE CONTENT VISIBLE from the start
      gsap.set(scene1_3Refs.current.container, { x: "100%" });

      // ✅ Initialize Scene1_4 to START state with CLOCKWISE tilt (hidden below)
      gsap.set(scene1_4Refs.current.container, {
        y: "120%", // Push further down to be completely hidden
        rotation: 15, // Clockwise tilt (like / shape)
        transformOrigin: "center center",
        opacity: 0, // Start completely invisible
        scale: 0.9
      });

      const tl1 = useScene1Timeline(scene1Refs.current, isMobile);
      const tl2 = useScene1_1Timeline(scene1_1Refs.current, isMobile);
      const tl3 = useScene1_2Timeline(scene1_2Refs.current, isMobile);
      const tl4 = useScene1_3Timeline(scene1_3Refs.current, isMobile);
      const tl5 = useScene1_4Timeline(scene1_4Refs.current, isMobile);

      // ✅ FREEZE rainbow state before scroll
      if (scene1Refs.current.rainbow) {
        gsap.set(scene1Refs.current.rainbow, {
          scale: isMobile ? 1.08 : 1.06,
          overwrite: "auto"
        });
      }

      // Set screen1 to be visible at start, screen2 positioned but hidden
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

      // if (masterTimelineRef.current) {
      //   masterTimelineRef.current.kill();
      // }

      // const master = gsap.timeline({
      //   // scrollTrigger: {
      //   //   trigger: "#scroll-container",
      //   //   start: "top top",
      //   //   end: isMobile ? "+=80000" : "+=80000",
      //   //   scrub: isMobile ? 0.05 : 0.05,
      //   //   pin: true,
      //   //   fastScrollEnd: true,
      //   //   anticipatePin: 1,
      //   // const master = gsap.timeline({
      //   scrollTrigger: {
      //     trigger: "#scroll-container",
      //     start: "top top",
      //     end: isMobile ? "+=40000" : "+=50000", // ✅ REDUCED from 80000 - makes scroll faster
      //     scrub: 2, // ✅ INCREASED from 0.05 - creates discrete "snappy" transitions
      //     pin: true,
      //     fastScrollEnd: true,
      //     anticipatePin: 1,
      //     snap: {
      //       snapTo: "labelsDirectional", // ✅ NEW - snaps to timeline labels
      //       duration: { min: 0.2, max: 0.5 }, // ✅ NEW - smooth snap duration
      //       ease: "power2.inOut"
      //     },
      //     onStart: () => {
      //       if (idleAnimsRef.current) {
      //         idleAnimsRef.current.revert();
      //         idleAnimsRef.current = null;
      //       }
      //       if (scene1Refs.current.rainbow) {
      //         gsap.set(scene1Refs.current.rainbow, { overwrite: "auto" });
      //       }
      //     },
      //     onUpdate: (self) => {
      //       const totalDuration = master.duration();
      //       let scene1Duration = 0.6 + 0.6 - 0.3;
      //       if (master.getChildren()[0]) {
      //         scene1Duration += master.getChildren()[0].duration();
      //       }

      //       const scene1EndProgress = scene1Duration / totalDuration;

      //       if (
      //         setShowNavbar &&
      //         !hasShownNavbarRef.current &&
      //         self.progress > scene1EndProgress
      //       ) {
      //         setShowNavbar(true);
      //         hasShownNavbarRef.current = true;
      //       }

      //       if (
      //         setShowNavbar &&
      //         hasShownNavbarRef.current &&
      //         self.progress <= scene1EndProgress
      //       ) {
      //         setShowNavbar(false);
      //         hasShownNavbarRef.current = false;
      //       }

      //       if (
      //         !scene1EndScrollRef.current &&
      //         self.progress > scene1EndProgress
      //       ) {
      //         scene1EndScrollRef.current = self.scroll();
      //       }
      //     }
      //   }
      // });
      if (masterTimelineRef.current) {
        masterTimelineRef.current.kill();
      }

      const SECTIONS = 5; // scene1, 1_1, 1_2, 1_3, 1_4
      const SCROLL_PER_SECTION = 4; // same for mobile/desktop

      // guard for weird cases where innerHeight is tiny
      const vh = Math.max(window.innerHeight, 400);
      const scrollLength = vh * SECTIONS * SCROLL_PER_SECTION;

      const master = gsap.timeline({
        scrollTrigger: {
          trigger: "#scroll-container",
          start: "top top",
          end: `+=${scrollLength}`,
          scrub: 0.8,
          pin: true,
          fastScrollEnd: false,
          anticipatePin: 1,
          invalidateOnRefresh: true, // ✅ recompute on resize

          // // ✅ SNAP TO LABELS - this makes Scene1_3 snap to each step
          // snap: {
          //   snapTo: "labels", // Snaps to timeline labels
          //   duration: { min: 0.3, max: 0.6 },
          //   delay: 0.1,
          //   ease: "power2.out"
          // },
          onStart: () => {
            if (idleAnimsRef.current) {
              idleAnimsRef.current.revert();
              idleAnimsRef.current = null;
            }
            if (scene1Refs.current.rainbow) {
              gsap.set(scene1Refs.current.rainbow, { overwrite: "auto" });
            }
          },

          onUpdate: (self) => {
            const totalDuration = master.duration();
            let scene1Duration = 0.6 + 0.6 - 0.3;
            if (master.getChildren()[0]) {
              scene1Duration += master.getChildren()[0].duration();
            }

            const scene1EndProgress = scene1Duration / totalDuration;

            if (
              setShowNavbar &&
              !hasShownNavbarRef.current &&
              self.progress > scene1EndProgress
            ) {
              setShowNavbar(true);
              hasShownNavbarRef.current = true;
            }

            if (
              setShowNavbar &&
              hasShownNavbarRef.current &&
              self.progress <= scene1EndProgress
            ) {
              setShowNavbar(false);
              hasShownNavbarRef.current = false;
            }

            if (
              !scene1EndScrollRef.current &&
              self.progress > scene1EndProgress
            ) {
              scene1EndScrollRef.current = self.scroll();
            }
          }
        }
      });

      masterTimelineRef.current = master;

      if (tl1) {
        master.add(tl1);
      }

      // 🚪 SEAMLESS TRANSITION: Scene1 → Scene1_1 (no black, direct crossfade)
      master
        .to(scene1_1Refs.current.container, {
          opacity: 1,
          duration: 0.4,
          ease: "power2.in",
          force3D: true
        })
        .to(
          scene1Refs.current.container,
          {
            scale: 1.5,
            opacity: 0,
            duration: 0.8,
            ease: "power2.inOut",
            force3D: true
          },
          "<"
        );

      if (tl2) {
        master.add(tl2);
      }

      // 🎬 SEAMLESS SLIDE: Scene1_1 → Scene1_2
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

      if (tl3) {
        master.add(tl3);
      }

      // 🎬 SEAMLESS HORIZONTAL SLIDE: Scene1_2 → Scene1_3
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

      if (tl4) {
        master.add(tl4);
      }

      // 🎬 CLOCKWISE ROTATION OVERLAY: Scene1_4 comes over Scene1_3
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
            rotation: 0, // Rotates counter-clockwise to straighten (/ → —)
            scale: 1, // Scales to full size
            duration: 1.8,
            ease: "power2.inOut"
          },
          "<0.1"
        );
      if (tl5) {
        master.add(tl5);
      }

      masterTimelineRef.current = master;
    });

    const handleScrollToScene1_1 = () => {
      if (scene1EndScrollRef.current) {
        window.scrollTo({
          top: scene1EndScrollRef.current,
          behavior: "smooth"
        });
      } else {
        const scrollTrigger = masterTimelineRef.current?.scrollTrigger;
        if (scrollTrigger) {
          const estimatedScroll =
            scrollTrigger.start +
            (scrollTrigger.end - scrollTrigger.start) * 0.06;
          window.scrollTo({
            top: estimatedScroll,
            behavior: "smooth"
          });
        }
      }
    };
    window.addEventListener("scrollToScene1_1", handleScrollToScene1_1);

    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("scrollToScene1_1", handleScrollToScene1_1);

      try {
        if (idleAnimsRef.current) {
          idleAnimsRef.current.kill();
          idleAnimsRef.current = null;
        }

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
            // Ignore errors during cleanup
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
  }, [isMobile, setShowNavbar, isLoading]);

  return (
    <div
      id="scroll-container"
      className="relative w-full h-screen bg-black lowercase"
      style={{
        // perspective: "1500px",
        perspectiveOrigin: "50% 50%",
        overflow: "hidden",
        position: "relative"
      }}
    >
      {/* Clipping wrapper to hide scenes outside viewport */}
      {/* <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          zIndex: 1
        }}
      /> */}

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

      {/* Scene 1 */}
      <div
        className="absolute inset-0 w-full h-full z-[2]"
        style={{
          willChange: "transform, opacity",
          pointerEvents: "auto"
        }}
      >
        <Scene1 ref={scene1Refs} isMobile={isMobile} />
      </div>

      {/* Scene 1_1 */}
      <div
        ref={(el) => {
          if (scene1_1Refs.current) scene1_1Refs.current.container = el;
        }}
        className="absolute inset-0 w-full h-full z-[3]"
        style={{ opacity: 0, pointerEvents: "auto" }}
      >
        <Scene1_1 ref={scene1_1Refs} isMobile={isMobile} />
      </div>

      {/* Scene 1_2 */}
      <div
        ref={(el) => {
          if (scene1_2Refs.current) scene1_2Refs.current.container = el;
        }}
        className="absolute inset-0 w-full h-full z-[4]"
        style={{ y: "-100%" }}
      >
        <Scene1_2 ref={scene1_2Refs} isMobile={isMobile} />
      </div>

      {/* Scene 1_3 */}
      {/* Scene 1_3 */}
      <div
        ref={(el) => {
          if (scene1_3Refs.current) scene1_3Refs.current.container = el;
        }}
        className="absolute inset-0 w-full h-full z-[4]"
        style={{ x: "100%" }}
      >
        <Scene1_3 ref={scene1_3Refs} isMobile={isMobile} />
      </div>

      {/* Scene 1_4 - With Clockwise Rotation */}
      <div
        ref={(el) => {
          if (scene1_4Refs.current) scene1_4Refs.current.container = el;
        }}
        className="absolute inset-0 w-full h-full z-[5]"
        style={{
          y: "100%"
        }}
      >
        <Scene1_4 ref={scene1_4Refs} isMobile={isMobile} />
      </div>
    </div>
  );
};

export default Home;
