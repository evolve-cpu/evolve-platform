// import React, { useLayoutEffect, useRef, useState } from "react";
// import { gsap } from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import Scene1, { useScene1Timeline } from "./Scene1";
// import Scene1_1, { useScene1_1Timeline, setCompletedState } from "./Scene1_1";
// import Scene1_2, { useScene1_2Timeline } from "./Scene1_2";
// import Scene1_3, { useScene1_3Timeline } from "./Scene1_3";
// import Scene1_4, { useScene1_4Timeline } from "./Scene1_4";
// import GrainTexture from "../../components/GrainTexture";

// gsap.registerPlugin(ScrollTrigger);

// const Home = ({
//   forceLayout = "auto",
//   setShowNavbar,
//   isLoading,
//   deviceType
// }) => {
//   const scene1Refs = useRef({});
//   const scene1_1Refs = useRef({});
//   const scene1_2Refs = useRef({});
//   const scene1_3Refs = useRef({});
//   const scene1_4Refs = useRef({});

//   const scene1EndScrollRef = useRef(null);
//   const hasShownNavbarRef = useRef(false);

//   // Updated logic: treat tablets as desktop
//   const [isMobile, setIsMobile] = useState(() => {
//     if (forceLayout === "mobile") return true;
//     if (forceLayout === "desktop") return false;

//     // If deviceType is provided, use it
//     if (deviceType) {
//       return deviceType === "mobile"; // tablet and desktop return false
//     }

//     // Fallback
//     return window.innerWidth <= 768;
//   });

//   const idleAnimsRef = useRef(null);
//   const masterTimelineRef = useRef(null);

//   // ========== LOGO CLICK HANDLER ==========
//   const handleLogoClick = () => {
//     console.log("Logo clicked - returning to Scene1_1");

//     window.scrollTo({
//       top: 0,
//       behavior: "smooth"
//     });

//     setTimeout(() => {
//       if (scene1_1Refs.current) {
//         console.log("Setting completed state for Scene1_1");
//         setCompletedState(scene1_1Refs.current, isMobile);
//       }

//       if (masterTimelineRef.current) {
//         masterTimelineRef.current.seek(0);
//         masterTimelineRef.current.pause();
//         console.log("Master timeline reset and paused");
//       }

//       if (scene1_1Refs.current.container) {
//         gsap.set(scene1_1Refs.current.container, {
//           opacity: 1,
//           y: 0
//         });
//       }

//       if (scene1Refs.current.container) {
//         gsap.set(scene1Refs.current.container, {
//           opacity: 0,
//           scale: 1.5
//         });
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

//       const tl1 = useScene1Timeline(scene1Refs.current, isMobile);
//       const tl2 = useScene1_1Timeline(scene1_1Refs.current, isMobile);
//       const tl3 = useScene1_2Timeline(scene1_2Refs.current, isMobile);
//       const tl4 = useScene1_3Timeline(scene1_3Refs.current, isMobile);
//       const tl5 = useScene1_4Timeline(scene1_4Refs.current, isMobile);

//       if (scene1Refs.current.rainbow) {
//         gsap.set(scene1Refs.current.rainbow, {
//           scale: isMobile ? 1.08 : 1.06,
//           overwrite: "auto"
//         });
//       }

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

//       const master = gsap.timeline({
//         scrollTrigger: {
//           trigger: "#scroll-container",
//           start: "top top",
//           end: `+=${scrollLength}`,
//           scrub: 0.8,
//           pin: true,
//           fastScrollEnd: false,
//           anticipatePin: 1,
//           invalidateOnRefresh: true,

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

//       if (tl2) {
//         master.add(tl2);
//       }

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

//       if (tl3) {
//         master.add(tl3);
//       }

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

//       if (tl4) {
//         master.add(tl4);
//       }

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
//         className="absolute inset-0 w-full h-full z-[4]"
//         style={{ x: "100%" }}
//       >
//         <Scene1_3 ref={scene1_3Refs} isMobile={isMobile} />
//       </div>

//       {/* Scene 1_4 */}
//       <div
//         ref={(el) => {
//           if (scene1_4Refs.current) scene1_4Refs.current.container = el;
//         }}
//         className="absolute inset-0 w-full h-full z-[5]"
//         style={{
//           y: "100%"
//         }}
//       >
//         <Scene1_4 ref={scene1_4Refs} isMobile={isMobile} />
//       </div>
//     </div>
//   );
// };

// export default Home;

// import React, { useLayoutEffect, useRef, useState } from "react";
// import { gsap } from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import Scene1 from "./Scene1"; // ⬅️ no useScene1Timeline now
// import Scene1_1, { useScene1_1Timeline, setCompletedState } from "./Scene1_1";
// import Scene1_2, { useScene1_2Timeline } from "./Scene1_2";
// import Scene1_3, { useScene1_3Timeline } from "./Scene1_3";
// import Scene1_4, { useScene1_4Timeline } from "./Scene1_4";
// import GrainTexture from "../../components/GrainTexture";

// gsap.registerPlugin(ScrollTrigger);

// const Home = ({
//   forceLayout = "auto",
//   setShowNavbar,
//   isLoading,
//   deviceType
// }) => {
//   const scene1Refs = useRef({});
//   const scene1_1Refs = useRef({});
//   const scene1_2Refs = useRef({});
//   const scene1_3Refs = useRef({});
//   const scene1_4Refs = useRef({});

//   const scene1EndScrollRef = useRef(null);
//   const hasShownNavbarRef = useRef(false);
//   const masterTimelineRef = useRef(null);

//   // NEW: intro done flag (Scene1 tells us when it's finished)
//   const [introDone, setIntroDone] = useState(false);

//   // treat tablets as desktop
//   const [isMobile, setIsMobile] = useState(() => {
//     if (forceLayout === "mobile") return true;
//     if (forceLayout === "desktop") return false;

//     if (deviceType) {
//       return deviceType === "mobile"; // tablet and desktop = false
//     }

//     return window.innerWidth <= 768;
//   });

//   // 🔒 lock/unlock body scroll based on intro state
//   useLayoutEffect(() => {
//     if (!introDone) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "auto";
//     }

//     return () => {
//       document.body.style.overflow = "auto";
//     };
//   }, [introDone]);

//   // always hide navbar on home while intro is running
//   useLayoutEffect(() => {
//     if (setShowNavbar) {
//       if (!introDone) {
//         setShowNavbar(false);
//         hasShownNavbarRef.current = false;
//       }
//     }
//   }, [introDone, setShowNavbar]);

//   // ========== LOGO CLICK HANDLER ==========
//   const handleLogoClick = () => {
//     console.log("Logo clicked - returning to Scene1_1");

//     window.scrollTo({
//       top: 0,
//       behavior: "smooth"
//     });

//     setTimeout(() => {
//       if (scene1_1Refs.current) {
//         console.log("Setting completed state for Scene1_1");
//         setCompletedState(scene1_1Refs.current, isMobile);
//       }

//       if (masterTimelineRef.current) {
//         masterTimelineRef.current.seek(0);
//         masterTimelineRef.current.pause();
//         console.log("Master timeline reset and paused");
//       }

//       if (scene1_1Refs.current.container) {
//         gsap.set(scene1_1Refs.current.container, {
//           opacity: 1,
//           y: 0
//         });
//       }

//       if (scene1Refs.current.container) {
//         gsap.set(scene1Refs.current.container, {
//           opacity: 0,
//           scale: 1.5
//         });
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

//   // ========== MASTER SCROLL TIMELINE (ONLY AFTER INTRO) ==========
//   useLayoutEffect(() => {
//     if (isLoading || !introDone) return; // ⬅️ important

//     if (setShowNavbar) {
//       setShowNavbar(false);
//       hasShownNavbarRef.current = false;
//     }

//     // all scene containers must exist
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
//       // --- initial states for Scene1_1 ---
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

//       // --- initial states for other scenes ---
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

//       const SCENE1_END_PROGRESS = 0.06; // progress threshold to show navbar

//       const master = gsap.timeline({
//         scrollTrigger: {
//           trigger: "#scroll-container",
//           start: "top top",
//           end: `+=${scrollLength}`,
//           scrub: 0.8,
//           pin: true,
//           fastScrollEnd: false,
//           anticipatePin: 1,
//           invalidateOnRefresh: true,
//           onUpdate: (self) => {
//             if (
//               setShowNavbar &&
//               !hasShownNavbarRef.current &&
//               self.progress > SCENE1_END_PROGRESS
//             ) {
//               setShowNavbar(true);
//               hasShownNavbarRef.current = true;
//             }

//             if (
//               setShowNavbar &&
//               hasShownNavbarRef.current &&
//               self.progress <= SCENE1_END_PROGRESS
//             ) {
//               setShowNavbar(false);
//               hasShownNavbarRef.current = false;
//             }

//             if (
//               !scene1EndScrollRef.current &&
//               self.progress > SCENE1_END_PROGRESS
//             ) {
//               scene1EndScrollRef.current = self.scroll();
//             }
//           }
//         }
//       });

//       masterTimelineRef.current = master;

//       // fade-from Scene1 (intro) to Scene1_1 when U start scrolling
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

//       if (tl2) {
//         master.add(tl2);
//       }

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

//       if (tl3) {
//         master.add(tl3);
//       }

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

//       if (tl4) {
//         master.add(tl4);
//       }

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
//       {/* grain overlay */}
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

//       {/* Scene 1 (intro) – always rendered */}
//       <div
//         className="absolute inset-0 w-full h-full z-[2]"
//         style={{
//           willChange: "transform, opacity",
//           pointerEvents: "auto"
//         }}
//       >
//         <Scene1
//           ref={scene1Refs}
//           isMobile={isMobile}
//           onIntroComplete={() => setIntroDone(true)}
//         />
//       </div>

//       {/* other scenes only exist AFTER intro is done */}
//       {introDone && (
//         <>
//           {/* Scene 1_1 */}
//           <div
//             ref={(el) => {
//               if (scene1_1Refs.current) scene1_1Refs.current.container = el;
//             }}
//             className="absolute inset-0 w-full h-full z-[3]"
//             style={{ opacity: 0, pointerEvents: "auto" }}
//           >
//             <Scene1_1 ref={scene1_1Refs} isMobile={isMobile} />
//           </div>

//           {/* Scene 1_2 */}
//           <div
//             ref={(el) => {
//               if (scene1_2Refs.current) scene1_2Refs.current.container = el;
//             }}
//             className="absolute inset-0 w-full h-full z-[4]"
//           >
//             <Scene1_2 ref={scene1_2Refs} isMobile={isMobile} />
//           </div>

//           {/* Scene 1_3 */}
//           <div
//             ref={(el) => {
//               if (scene1_3Refs.current) scene1_3Refs.current.container = el;
//             }}
//             className="absolute inset-0 w-full h-full z-[4]"
//           >
//             <Scene1_3 ref={scene1_3Refs} isMobile={isMobile} />
//           </div>

//           {/* Scene 1_4 */}
//           <div
//             ref={(el) => {
//               if (scene1_4Refs.current) scene1_4Refs.current.container = el;
//             }}
//             className="absolute inset-0 w-full h-full z-[5]"
//           >
//             <Scene1_4 ref={scene1_4Refs} isMobile={isMobile} />
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default Home;

import React, { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Scene1 from "./Scene1";
import Scene1_1, { useScene1_1Timeline, setCompletedState } from "./Scene1_1";
import Scene1_2, { useScene1_2Timeline } from "./Scene1_2";
import Scene1_3, { useScene1_3Timeline, SCENE1_3_STEP_COUNT } from "./Scene1_3";
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

  const scene1EndScrollRef = useRef(null);
  const hasShownNavbarRef = useRef(false);

  // Intro completion flag
  const [introDone, setIntroDone] = useState(false);

  // Updated logic: treat tablets as desktop
  const [isMobile, setIsMobile] = useState(() => {
    if (forceLayout === "mobile") return true;
    if (forceLayout === "desktop") return false;
    if (deviceType) return deviceType === "mobile";
    return window.innerWidth <= 768;
  });

  const masterTimelineRef = useRef(null);

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

    window.scrollTo({ top: 0, behavior: "smooth" });

    setTimeout(() => {
      if (scene1_1Refs.current) {
        setCompletedState(scene1_1Refs.current, isMobile);
      }

      if (masterTimelineRef.current) {
        masterTimelineRef.current.seek(0);
        masterTimelineRef.current.pause();
      }

      // Reset all scenes
      if (scene1_1Refs.current.container) {
        gsap.set(scene1_1Refs.current.container, { opacity: 1, y: 0 });
      }
      if (scene1Refs.current.container) {
        gsap.set(scene1Refs.current.container, { opacity: 0, scale: 1.5 });
      }
      if (scene1_2Refs.current.container) {
        gsap.set(scene1_2Refs.current.container, { y: "-100%" });
      }
      if (scene1_3Refs.current.container) {
        gsap.set(scene1_3Refs.current.container, { x: "100%" });
      }
      if (scene1_4Refs.current.container) {
        gsap.set(scene1_4Refs.current.container, { y: "-100%" });
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

  // ========== BUILD MASTER TIMELINE (only after intro is done) ==========
  useLayoutEffect(() => {
    if (isLoading || !introDone) return;

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
      // Initialize Scene1_1 to START state
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

      gsap.set(scene1_2Refs.current.container, { y: "-100%" });
      gsap.set(scene1_3Refs.current.container, { x: "100%" });
      gsap.set(scene1_4Refs.current.container, {
        y: "120%",
        rotation: 15,
        transformOrigin: "center center",
        opacity: 0,
        scale: 0.9
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
      const SCROLL_PER_SECTION = 4;
      const vh = Math.max(window.innerHeight, 400);
      const scrollLength = vh * SECTIONS * SCROLL_PER_SECTION;

      const SCENE1_END_PROGRESS = 0.03;

      const master = gsap.timeline({
        // scrollTrigger: {
        //   trigger: "#scroll-container",
        //   start: "top top",
        //   end: `+=${scrollLength}`,
        //   scrub: 0.8,
        //   pin: true,
        //   fastScrollEnd: false,
        //   anticipatePin: 1,
        //   invalidateOnRefresh: true,
        //   onUpdate: (self) => {
        //     if (
        //       setShowNavbar &&
        //       !hasShownNavbarRef.current &&
        //       self.progress > SCENE1_END_PROGRESS
        //     ) {
        //       setShowNavbar(true);
        //       hasShownNavbarRef.current = true;
        //     }
        //     if (
        //       setShowNavbar &&
        //       hasShownNavbarRef.current &&
        //       self.progress <= SCENE1_END_PROGRESS
        //     ) {
        //       setShowNavbar(false);
        //       hasShownNavbarRef.current = false;
        //     }
        //     if (
        //       !scene1EndScrollRef.current &&
        //       self.progress > SCENE1_END_PROGRESS
        //     ) {
        //       scene1EndScrollRef.current = self.scroll();
        //     }
        //   }
        // }
      });

      masterTimelineRef.current = master;

      // Transition: fade Scene1 out, Scene1_1 in
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

      // // Transition: crossfade Scene1 out, Scene1_1 in
      // master
      //   .to({}, { duration: 0.3 }) // small buffer at start of scroll
      //   .to(
      //     scene1_1Refs.current.container,
      //     {
      //       opacity: 1,
      //       duration: 0.8,
      //       ease: "power2.inOut",
      //       force3D: true
      //     },
      //     "<0.1"
      //   )
      //   .to(
      //     scene1Refs.current.container,
      //     {
      //       opacity: 0,
      //       duration: 0.8,
      //       ease: "power2.inOut",
      //       force3D: true
      //     },
      //     "<"
      //   );

      if (tl5) master.add(tl5);

      // we want snapping only inside the scene1_3 segment
      let lastProgress = 0;
      let currentStepIndex = 0; // 0..SCENE1_3_STEP_COUNT-1

      const maxIndex = (SCENE1_3_STEP_COUNT || 5) - 1;
      const scene1_3Start = tl4 ? tl4.startTime() : 0;
      const scene1_3End = tl4 ? tl4.startTime() + tl4.duration() : 0;
      const masterDur = master.duration();

      const st = ScrollTrigger.create({
        animation: master,
        trigger: "#scroll-container",
        start: "top top",
        end: `+=${scrollLength}`,
        scrub: 0.8,
        pin: true,
        fastScrollEnd: false,
        anticipatePin: 1,
        invalidateOnRefresh: true,

        snap: {
          snapTo: (rawProgress) => {
            if (!tl4 || !masterDur || !maxIndex >= 0) return rawProgress;

            const t = rawProgress * masterDur;

            // outside scene1_3 → don't interfere
            if (t < scene1_3Start || t > scene1_3End) {
              lastProgress = rawProgress;
              return rawProgress;
            }

            // how much did we move this frame?
            const delta = rawProgress - lastProgress;
            lastProgress = rawProgress;

            // small noise → stay on same step
            if (Math.abs(delta) < 0.001) {
              return progressForStep(currentStepIndex);
            }

            // decide direction
            if (delta > 0) {
              // scrolling down → next step (max +1)
              currentStepIndex = Math.min(currentStepIndex + 1, maxIndex);
            } else if (delta < 0) {
              // scrolling up → previous step (max -1)
              currentStepIndex = Math.max(currentStepIndex - 1, 0);
            }

            return progressForStep(currentStepIndex);
          },
          duration: 0, // instant jump, no auto tween
          inertia: false // no momentum fighting this
        },
        onUpdate: (self) => {
          // keep your existing navbar logic
          if (
            setShowNavbar &&
            !hasShownNavbarRef.current &&
            self.progress > SCENE1_END_PROGRESS
          ) {
            setShowNavbar(true);
            hasShownNavbarRef.current = true;
          }

          if (
            setShowNavbar &&
            hasShownNavbarRef.current &&
            self.progress <= SCENE1_END_PROGRESS
          ) {
            setShowNavbar(false);
            hasShownNavbarRef.current = false;
          }

          if (
            !scene1EndScrollRef.current &&
            self.progress > SCENE1_END_PROGRESS
          ) {
            scene1EndScrollRef.current = self.scroll();
          }
        }
        // onUpdate: (self) => {
        //   // Get Scene1_1's current opacity
        //   const scene1_1Opacity = gsap.getProperty(
        //     scene1_1Refs.current.container,
        //     "opacity"
        //   );

        //   if (
        //     setShowNavbar &&
        //     !hasShownNavbarRef.current &&
        //     scene1_1Opacity >= 0.9 // Show navbar when Scene1_1 is almost fully visible
        //   ) {
        //     setShowNavbar(true);
        //     hasShownNavbarRef.current = true;
        //   }

        //   if (
        //     setShowNavbar &&
        //     hasShownNavbarRef.current &&
        //     scene1_1Opacity < 0.4 // Hide when going back
        //   ) {
        //     setShowNavbar(false);
        //     hasShownNavbarRef.current = false;
        //   }

        //   // Keep your scroll reference logic
        //   if (!scene1EndScrollRef.current && scene1_1Opacity >= 0.9) {
        //     scene1EndScrollRef.current = self.scroll();
        //   }
        // }
      });
      // helper: convert step index → master progress
      function progressForStep(stepIndex) {
        const local = maxIndex === 0 ? 0 : stepIndex / maxIndex; // 0..1
        const snappedTime =
          scene1_3Start + local * (scene1_3End - scene1_3Start || 1);
        return snappedTime / masterDur;
      }

      // store for cleanup (optional, but handy)
      master.scrollTrigger = st;
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
  }, [isMobile, setShowNavbar, isLoading, introDone]);

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

      {/* Scene 1 (intro) - Only visible until intro completes */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          willChange: "transform, opacity",
          pointerEvents: introDone ? "none" : "auto",
          zIndex: introDone ? 1 : 10,
          // opacity: introDone ? 0 : 1
          opacity: 1
        }}
      >
        <Scene1
          ref={scene1Refs}
          isMobile={isMobile}
          // onIntroComplete={() => {
          //   console.log("Intro complete! Enabling scroll...");
          //   setIntroDone(true);
          // }}
          onIntroComplete={() => {
            console.log("Intro complete! Enabling scroll...");
            setIntroDone(true);
            if (onIntroComplete) onIntroComplete(); // Call parent callback
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
