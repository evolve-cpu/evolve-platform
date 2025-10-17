// import React, { useEffect, useRef, useState } from "react";
// import { gsap } from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import {
//   floor,
//   left_wall,
//   purple_rainbow,
//   right_wall,
//   stairs_with_door,
//   evolve_cube,
//   down_arrow,
//   door_closeup,
//   evolve_2d,
//   // Mobile images
//   floor_mobile,
//   left_wall_mobile,
//   right_wall_mobile,
//   door_closeup_mobile
// } from "../../assets/images/Home";
// // import { useSceneTransition } from "./SceneManager";

// gsap.registerPlugin(ScrollTrigger);

// const Scene1 = () => {
//   const containerRef = useRef(null);
//   const innerRef = useRef(null);
//   const cubeRef = useRef(null);
//   const rainbowRef = useRef(null);
//   const arrowRef = useRef(null);
//   const doorCloseupRef = useRef(null);
//   const doorCubeRef = useRef(null);
//   const evolveLogoRef = useRef(null);
//   const welcomeTextRef = useRef(null);
//   const [imagesLoaded, setImagesLoaded] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);
//   // Inside Scene1 component, add this hook:
//   // const { currentScene } = useSceneTransition();
//   // const isActive = currentScene === 0;

//   // Detect mobile
//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth <= 768);
//     };

//     checkMobile();
//     window.addEventListener("resize", checkMobile);

//     return () => window.removeEventListener("resize", checkMobile);
//   }, []);

//   // Preload critical images
//   useEffect(() => {
//     const imagesToPreload = isMobile
//       ? [door_closeup_mobile, evolve_cube, evolve_2d, stairs_with_door]
//       : [door_closeup, evolve_cube, evolve_2d, stairs_with_door];

//     let loadedCount = 0;
//     const totalImages = imagesToPreload.length;

//     imagesToPreload.forEach((src) => {
//       const img = new Image();
//       img.onload = () => {
//         loadedCount++;
//         if (loadedCount === totalImages) {
//           setImagesLoaded(true);
//         }
//       };
//       img.src = src;
//     });
//   }, [isMobile]);

//   useEffect(() => {
//     // if (!isActive || !imagesLoaded) return;
//     if (!imagesLoaded) return;

//     const ctx = gsap.context(() => {
//       // 🎬 Initial states
//       gsap.set(rainbowRef.current, {
//         opacity: 1,
//         scale: 1,
//         filter: "brightness(1) saturate(1)",
//         transformOrigin: "center center"
//       });
//       gsap.set(doorCloseupRef.current, { opacity: 0, scale: 1.1 });
//       gsap.set(doorCubeRef.current, { opacity: 0, scaleX: 1, scaleY: 1, y: 0 });
//       gsap.set(evolveLogoRef.current, { opacity: 0, scale: 1, rotation: 0 });
//       gsap.set(welcomeTextRef.current, { opacity: 0, y: 30 });

//       // ✨ Idle floating (paused during scroll)
//       const idleRainbow = gsap.to(rainbowRef.current, {
//         scale: 1.03,
//         duration: 2.5,
//         repeat: -1,
//         yoyo: true,
//         ease: "sine.inOut"
//       });

//       const idleCube = gsap.to(cubeRef.current, {
//         y: -12,
//         duration: 2,
//         repeat: -1,
//         yoyo: true,
//         ease: "sine.inOut"
//       });

//       const idleArrow = gsap.to(arrowRef.current, {
//         y: -12,
//         duration: 1.8,
//         repeat: -1,
//         yoyo: true,
//         ease: "sine.inOut"
//       });

//       // 🎥 Main timeline
//       const tl = gsap.timeline({
//         scrollTrigger: {
//           trigger: containerRef.current,
//           start: "top top",
//           end: "bottom+=200% top",
//           scrub: 1.5,
//           pin: true,
//           anticipatePin: 1,
//           markers: false,
//           onEnter: () => idleRainbow.pause(), // 🛑 stop idle breathing when scroll starts
//           onLeaveBack: () => idleRainbow.resume(), // ✅ resume when scrolling back
//           onLeave: () => idleRainbow.resume(), // ✅ resume after scroll finishes
//           onUpdate: (self) => {
//             if (self.progress > 0.02) {
//               gsap.to(arrowRef.current, {
//                 opacity: 0,
//                 y: 20,
//                 duration: 0.6,
//                 ease: "power2.out"
//               });
//             }
//           }
//         }
//       });

//       // 🌀 Zoom + Rainbow expansion
//       tl.to(innerRef.current, {
//         scale: isMobile ? 3.5 : 2.8,
//         y: isMobile ? "30vh" : "27vh",
//         transformOrigin: "center center",
//         ease: "power2.inOut",
//         duration: 3,
//         force3D: true
//       })
//         // 🌈 Expand + glow rainbow during zoom
//         .to(
//           rainbowRef.current,
//           {
//             scale: isMobile ? 2.5 : 2.2,
//             opacity: 1,
//             filter: "brightness(1.3) saturate(1.3)",
//             ease: "power2.inOut",
//             duration: 3
//           },
//           "<"
//         )
//         // 🌈 Fade + over-expand before disappearing
//         .to(
//           rainbowRef.current,
//           {
//             scale: isMobile ? 3.5 : 3.0,
//             opacity: 0,
//             filter: "brightness(0.9) saturate(0.8)",
//             duration: 1.2,
//             ease: "power1.inOut"
//           },
//           "-=0.8"
//         )
//         // 🧱 Fade walls + floor
//         .to(
//           [".left", ".right", ".floor"],
//           { opacity: 0, duration: 1.2, ease: "power2.inOut" },
//           "-=1"
//         )
//         // 🚪 Fade out door + cube
//         .to(
//           [cubeRef.current, ".door"],
//           { opacity: 0, duration: 0.8, ease: "power1.inOut" },
//           "-=0.8"
//         )
//         // 🚪 Door close-up fade in
//         .to(
//           doorCloseupRef.current,
//           { opacity: 1, scale: 1, duration: 1.5, ease: "power2.out" },
//           "-=0.6"
//         )
//         // 🎲 Cube bounce
//         .to(
//           doorCubeRef.current,
//           {
//             opacity: 1,
//             y: isMobile ? -30 : -40,
//             duration: 0.8,
//             ease: "power2.out"
//           },
//           "-=1.2"
//         )
//         .to(doorCubeRef.current, { y: 0, duration: 0.6, ease: "power2.in" })
//         .to(doorCubeRef.current, {
//           y: isMobile ? -15 : -20,
//           duration: 0.6,
//           ease: "power2.out"
//         })
//         .to(doorCubeRef.current, { y: 0, duration: 0.25, ease: "power2.in" })
//         .to({}, { duration: 0.2 })
//         .to(doorCubeRef.current, {
//           y: isMobile ? -60 : -80,
//           duration: 0.6,
//           ease: "power2.out"
//         })
//         .to(doorCubeRef.current, { y: 0, duration: 0.8, ease: "power2.in" })
//         .to(doorCubeRef.current, {
//           scaleY: 0.4,
//           scaleX: 1.5,
//           duration: 0.6,
//           ease: "power2.out"
//         })
//         .to(doorCubeRef.current, {
//           scaleY: 1.6,
//           scaleX: 0.4,
//           duration: 0.15,
//           ease: "power2.out"
//         })
//         .to(doorCubeRef.current, {
//           scaleY: 1,
//           scaleX: 1,
//           duration: 0.1,
//           ease: "power1.out"
//         })
//         // ✨ Morph → evolve logo
//         .to(
//           doorCubeRef.current,
//           {
//             opacity: 0,
//             scaleX: 0.8,
//             scaleY: 0.8,
//             duration: 0.5,
//             ease: "power2.inOut"
//           },
//           "morph"
//         )
//         .to(
//           evolveLogoRef.current,
//           {
//             opacity: 1,
//             scale: 1.05,
//             duration: 0.5,
//             ease: "power2.inOut"
//           },
//           "morph"
//         )
//         .to(evolveLogoRef.current, {
//           scale: 1,
//           duration: 0.3,
//           ease: "power1.out"
//         })
//         .to(evolveLogoRef.current, {
//           y: isMobile ? -80 : -120,
//           duration: 0.6,
//           ease: "power2.out"
//         })
//         .to(
//           welcomeTextRef.current,
//           { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
//           "-=0.4"
//         );
//     }, containerRef);

//     return () => ctx.revert();
//     // }, [imagesLoaded, isMobile, isActive]);
//   }, [imagesLoaded, isMobile]);

//   return (
//     <section
//       ref={containerRef}
//       className="relative w-full h-screen overflow-hidden bg-black will-change-transform"
//       style={{
//         transform: "translateZ(0)",
//         backfaceVisibility: "hidden",
//         perspective: 1000
//       }}
//     >
//       {/* Loading state */}
//       {!imagesLoaded && (
//         <div className="absolute inset-0 flex items-center justify-center z-[200]">
//           <div className="text-white text-xl">Loading...</div>
//         </div>
//       )}

//       {/* Inner wrapper */}
//       <div
//         ref={innerRef}
//         className="absolute inset-0 overflow-hidden"
//         style={{ willChange: "transform" }}
//       >
//         {/* 🌈 Purple rainbow */}
//         <div
//           className={`absolute left-1/2 -translate-x-1/2 z-[2] ${
//             isMobile ? "bottom-[45%]" : "bottom-[38%]"
//           }`}
//         >
//           <img
//             ref={rainbowRef}
//             src={purple_rainbow}
//             alt="rainbow"
//             className={
//               isMobile
//                 ? "w-[45vw] min-w-[180px] max-w-[220px]"
//                 : "w-[22vw] min-w-[280px] max-w-[380px]"
//             }
//             loading="lazy"
//           />
//         </div>

//         {/* 🚪 Door + cube */}
//         <div
//           className={`absolute left-1/2 -translate-x-1/2 z-[5] ${
//             isMobile ? "bottom-[35%]" : "bottom-[25%]"
//           }`}
//         >
//           <img
//             src={stairs_with_door}
//             alt="door"
//             className={
//               isMobile
//                 ? "door w-[65vw] min-w-[200px] max-w-[260px] block"
//                 : "door w-[24vw] min-w-[280px] max-w-[400px] block"
//             }
//           />
//           <img
//             ref={cubeRef}
//             src={evolve_cube}
//             alt="evolve cube"
//             className={
//               isMobile
//                 ? "absolute bottom-[50%] left-1/2 -translate-x-1/2 w-[8vw] min-w-[45px] max-w-[55px] z-[10]"
//                 : "absolute bottom-[50%] left-1/2 -translate-x-1/2 w-[3vw] min-w-[60px] max-w-[80px] z-[10]"
//             }
//           />
//         </div>

//         {/* 🧱 Walls - MOBILE */}
//         {isMobile && (
//           <>
//             <img
//               src={left_wall_mobile}
//               alt="left wall"
//               className="left absolute left-0 bottom-2 h-full w-[12vw] object-cover object-right z-[20]"
//               loading="eager"
//             />
//             <img
//               src={right_wall_mobile}
//               alt="right wall"
//               className="right absolute right-0 bottom-0 h-full w-[14vw] object-cover object-left z-[20]"
//               loading="eager"
//             />
//           </>
//         )}

//         {/* 🧱 Walls - DESKTOP */}
//         {!isMobile && (
//           <>
//             <img
//               src={left_wall}
//               alt="left wall"
//               className="left absolute left-0 bottom-[-4px] h-[104vh] object-cover z-[20]"
//               loading="lazy"
//             />
//             <img
//               src={right_wall}
//               alt="right wall"
//               className="right absolute right-0 bottom-0 h-[103vh] object-cover z-[20]"
//               loading="lazy"
//             />
//           </>
//         )}

//         {/* 🪵 Floor */}
//         <img
//           src={isMobile ? floor_mobile : floor}
//           alt="floor"
//           className={
//             isMobile
//               ? "floor absolute bottom-0 left-1/2 -translate-x-1/2 w-full z-[15]"
//               : "floor absolute bottom-[-3px] left-1/2 -translate-x-1/2 w-[112%] z-[15]"
//           }
//           loading="eager"
//         />

//         {/* ⬇️ Arrow */}
//         <img
//           ref={arrowRef}
//           src={down_arrow}
//           alt="scroll down"
//           className={
//             isMobile
//               ? "absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[8vw] min-w-[32px] max-w-[42px] opacity-100 z-[50]"
//               : "absolute bottom-[8%] left-1/2 -translate-x-1/2 w-[2.8vw] min-w-[36px] max-w-[48px] opacity-100 z-[50]"
//           }
//         />
//       </div>

//       {/* 🚪 Door closeup */}
//       <div
//         ref={doorCloseupRef}
//         className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none"
//       >
//         <img
//           src={isMobile ? door_closeup_mobile : door_closeup}
//           alt="door closeup"
//           className="w-full h-full object-cover object-center"
//         />
//       </div>

//       {/* 🎲 Cube for bounce + morph (SAME size and position as logo) */}
//       <div className="absolute inset-0 z-[120] flex items-center justify-center pointer-events-none">
//         <img
//           ref={doorCubeRef}
//           src={evolve_cube}
//           alt="evolve cube morphing"
//           className={
//             isMobile
//               ? "w-[22vw] min-w-[90px] max-w-[140px]"
//               : "w-[12vw] min-w-[120px] max-w-[280px]"
//           }
//           style={{ willChange: "transform, opacity" }}
//         />
//       </div>

//       {/* 🌀 Evolve logo (SAME size and position as cube) */}
//       <div className="absolute inset-0 z-[130] flex items-center justify-center pointer-events-none">
//         <img
//           ref={evolveLogoRef}
//           src={evolve_2d}
//           alt="evolve logo"
//           className={
//             isMobile
//               ? "w-[22vw] min-w-[90px] max-w-[140px]"
//               : "w-[12vw] min-w-[120px] max-w-[280px]"
//           }
//           style={{ willChange: "transform, opacity" }}
//         />
//       </div>

//       {/* 📝 Welcome text */}
//       <div
//         className={`absolute inset-0 z-[140] flex items-center justify-center pointer-events-none ${
//           isMobile ? "pt-[20vh]" : "pt-[25vh]"
//         }`}
//       >
//         <h2
//           ref={welcomeTextRef}
//           className={
//             isMobile
//               ? "font-[800] text-[clamp(40px,12vw,70px)] leading-[0.95] text-center text-[#DF0586] font-[Bricolage_Grotesque]"
//               : "font-[800] text-[clamp(60px,8vw,140px)] leading-[0.95] text-center text-[#DF0586] font-[Bricolage_Grotesque]"
//           }
//           style={{ willChange: "transform, opacity" }}
//         >
//           welcome
//           <br />
//           to evolve
//         </h2>
//       </div>
//     </section>
//   );
// };

// export default Scene1;

// import React, { useEffect, useRef, useState } from "react";
// import { gsap } from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import {
//   floor_with_walls,
//   floor_with_walls_mobile,
//   stairs_with_door,
//   evolve_cube,
//   purple_rainbow,
//   down_arrow,
//   door_closeup,
//   door_closeup_mobile,
//   evolve_2d
// } from "../../assets/images/Home";

// gsap.registerPlugin(ScrollTrigger);

// const Scene1 = () => {
//   const containerRef = useRef(null);
//   const innerRef = useRef(null);
//   const cubeRef = useRef(null);
//   const rainbowRef = useRef(null);
//   const arrowRef = useRef(null);
//   const doorCloseupRef = useRef(null);
//   const doorCubeRef = useRef(null);
//   const evolveLogoRef = useRef(null);
//   const welcomeTextRef = useRef(null);

//   const [imagesLoaded, setImagesLoaded] = useState(false);
//   const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
//   const [screenWidth, setScreenWidth] = useState(window.innerWidth);

//   // responsive detection
//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobile(window.innerWidth <= 768);
//       setScreenWidth(window.innerWidth);
//     };
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   // preload
//   useEffect(() => {
//     const sources = [
//       isMobile ? floor_with_walls_mobile : floor_with_walls,
//       stairs_with_door,
//       evolve_cube,
//       purple_rainbow,
//       isMobile ? door_closeup_mobile : door_closeup,
//       evolve_2d
//     ];
//     let loaded = 0;
//     sources.forEach((src) => {
//       const img = new Image();
//       img.onload = () => {
//         loaded++;
//         if (loaded === sources.length) setImagesLoaded(true);
//       };
//       img.src = src;
//     });
//   }, [isMobile]);

//   // gsap
//   useEffect(() => {
//     if (!imagesLoaded) return;

//     const ctx = gsap.context(() => {
//       gsap.set(rainbowRef.current, {
//         opacity: 1,
//         scale: 1,
//         transformOrigin: "center center"
//       });
//       gsap.set(doorCloseupRef.current, { opacity: 0, scale: 1.1 });
//       gsap.set(doorCubeRef.current, { opacity: 0 });
//       gsap.set(evolveLogoRef.current, { opacity: 0 });
//       gsap.set(welcomeTextRef.current, { opacity: 0, y: 30 });

//       const idleRainbow = gsap.to(rainbowRef.current, {
//         scale: 1.03,
//         duration: 2.5,
//         repeat: -1,
//         yoyo: true,
//         ease: "sine.inOut"
//       });
//       const idleCube = gsap.to(cubeRef.current, {
//         y: -12,
//         duration: 2,
//         repeat: -1,
//         yoyo: true,
//         ease: "sine.inOut"
//       });
//       const idleArrow = gsap.to(arrowRef.current, {
//         y: -12,
//         duration: 1.8,
//         repeat: -1,
//         yoyo: true,
//         ease: "sine.inOut"
//       });

//       const tl = gsap.timeline({
//         scrollTrigger: {
//           trigger: containerRef.current,
//           start: "top top",
//           end: "bottom+=200% top",
//           scrub: 1.5,
//           pin: true,
//           anticipatePin: 1,
//           markers: false,
//           onEnter: () => idleRainbow.pause(),
//           onLeaveBack: () => idleRainbow.resume(),
//           onLeave: () => idleRainbow.resume()
//         }
//       });

//       tl.to(innerRef.current, {
//         scale: isMobile ? 3.5 : 2.8,
//         y: isMobile ? "30vh" : "27vh",
//         transformOrigin: "center center",
//         ease: "power2.inOut",
//         duration: 3
//       })
//         .to(
//           rainbowRef.current,
//           {
//             scale: isMobile ? 2.5 : 2.2,
//             filter: "brightness(1.3) saturate(1.3)",
//             ease: "power2.inOut",
//             duration: 3
//           },
//           "<"
//         )
//         .to(
//           rainbowRef.current,
//           {
//             scale: isMobile ? 3.5 : 3.0,
//             opacity: 0,
//             duration: 1.2,
//             ease: "power1.inOut"
//           },
//           "-=0.8"
//         )
//         .to([cubeRef.current, ".door"], {
//           opacity: 0,
//           duration: 0.8,
//           ease: "power1.inOut"
//         })
//         .to(
//           doorCloseupRef.current,
//           { opacity: 1, scale: 1, duration: 1.5, ease: "power2.out" },
//           "-=0.6"
//         )
//         // bounce + morph
//         .to(
//           doorCubeRef.current,
//           { opacity: 1, y: isMobile ? -30 : -40, duration: 0.8 },
//           "-=1.2"
//         )
//         .to(doorCubeRef.current, { y: 0, duration: 0.6 })
//         .to(doorCubeRef.current, {
//           y: isMobile ? -15 : -20,
//           duration: 0.6
//         })
//         .to(doorCubeRef.current, { y: 0, duration: 0.25 })
//         .to({}, { duration: 0.2 })
//         .to(doorCubeRef.current, {
//           y: isMobile ? -60 : -80,
//           duration: 0.6
//         })
//         .to(doorCubeRef.current, { y: 0, duration: 0.8 })
//         .to(doorCubeRef.current, {
//           scaleY: 0.4,
//           scaleX: 1.5,
//           duration: 0.6
//         })
//         .to(doorCubeRef.current, {
//           scaleY: 1.6,
//           scaleX: 0.4,
//           duration: 0.15
//         })
//         .to(doorCubeRef.current, {
//           scaleY: 1,
//           scaleX: 1,
//           duration: 0.1
//         })
//         .to(
//           doorCubeRef.current,
//           { opacity: 0, scale: 0.8, duration: 0.5, ease: "power2.inOut" },
//           "morph"
//         )
//         .to(
//           evolveLogoRef.current,
//           { opacity: 1, scale: 1.05, duration: 0.5, ease: "power2.inOut" },
//           "morph"
//         )
//         .to(evolveLogoRef.current, { scale: 1, duration: 0.3 })
//         .to(evolveLogoRef.current, {
//           y: isMobile ? -80 : -120,
//           duration: 0.6
//         })
//         .to(
//           welcomeTextRef.current,
//           { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
//           "-=0.4"
//         );
//     }, containerRef);

//     return () => ctx.revert();
//   }, [imagesLoaded, isMobile]);

//   // door vertical offset & scaling logic
//   const doorBottom = (() => {
//     if (isMobile) {
//       if (screenWidth <= 360) return "bottom-[33%]";
//       if (screenWidth <= 430) return "bottom-[39%]";
//       return "bottom-[42%]";
//     } else {
//       if (screenWidth <= 1024) return "bottom-[20%]";
//       if (screenWidth >= 2560) return "bottom-[22%] scale-[1.2]";
//       return "bottom-[25%]";
//     }
//   })();

//   return (
//     <section
//       ref={containerRef}
//       className="relative w-full h-screen overflow-hidden bg-black"
//     >
//       {!imagesLoaded && (
//         <div className="absolute inset-0 flex items-center justify-center z-50 text-white text-xl">
//           loading...
//         </div>
//       )}

//       <div ref={innerRef} className="absolute inset-0 overflow-hidden">
//         {/* 🌈 rainbow (behind all) */}
//         <div className="absolute left-1/2 -translate-x-1/2 bottom-[38%] z-[1]">
//           <img
//             ref={rainbowRef}
//             src={purple_rainbow}
//             alt="rainbow"
//             className={
//               isMobile
//                 ? "w-[45vw] min-w-[180px] max-w-[220px]"
//                 : "w-[22vw] min-w-[280px] max-w-[380px]"
//             }
//           />
//         </div>

//         {/* 🚪 door + cube (middle layer) */}
//         <div
//           className={`absolute left-1/2 -translate-x-1/2 ${doorBottom} z-[2] flex justify-center`}
//         >
//           <img
//             src={stairs_with_door}
//             alt="door"
//             className={
//               isMobile
//                 ? "door w-[65vw] min-w-[200px] max-w-[260px]"
//                 : "door w-[24vw] min-w-[280px] max-w-[400px]"
//             }
//           />
//           <img
//             ref={cubeRef}
//             src={evolve_cube}
//             alt="cube"
//             className={
//               isMobile
//                 ? "absolute bottom-[50%] left-1/2 -translate-x-1/2 w-[8vw] min-w-[45px] max-w-[55px]"
//                 : "absolute bottom-[50%] left-1/2 -translate-x-1/2 w-[3vw] min-w-[60px] max-w-[80px]"
//             }
//           />
//         </div>

//         {/* 🧱 floor_with_walls (topmost base) */}
//         <img
//           src={isMobile ? floor_with_walls_mobile : floor_with_walls}
//           alt="floor with walls"
//           className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-auto z-[3] object-cover"
//         />

//         {/* ⬇️ arrow */}
//         <img
//           ref={arrowRef}
//           src={down_arrow}
//           alt="arrow"
//           className={
//             isMobile
//               ? "absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[8vw] min-w-[32px] max-w-[42px] z-[50]"
//               : "absolute bottom-[8%] left-1/2 -translate-x-1/2 w-[2.8vw] min-w-[36px] max-w-[48px] z-[50]"
//           }
//         />
//       </div>

//       {/* door closeup & morph layers */}
//       <div
//         ref={doorCloseupRef}
//         className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none"
//       >
//         <img
//           src={isMobile ? door_closeup_mobile : door_closeup}
//           alt="door closeup"
//           className="w-full h-full object-cover"
//         />
//       </div>

//       <div className="absolute inset-0 z-[120] flex items-center justify-center pointer-events-none">
//         <img
//           ref={doorCubeRef}
//           src={evolve_cube}
//           alt="cube morph"
//           className={
//             isMobile
//               ? "w-[22vw] min-w-[90px] max-w-[140px]"
//               : "w-[12vw] min-w-[120px] max-w-[280px]"
//           }
//         />
//       </div>

//       <div className="absolute inset-0 z-[130] flex items-center justify-center pointer-events-none">
//         <img
//           ref={evolveLogoRef}
//           src={evolve_2d}
//           alt="evolve logo"
//           className={
//             isMobile
//               ? "w-[22vw] min-w-[90px] max-w-[140px]"
//               : "w-[12vw] min-w-[120px] max-w-[280px]"
//           }
//         />
//       </div>

//       {/* text */}
//       <div
//         className={`absolute inset-0 z-[140] flex items-center justify-center pointer-events-none ${
//           isMobile ? "pt-[20vh]" : "pt-[25vh]"
//         }`}
//       >
//         <h2
//           ref={welcomeTextRef}
//           className={
//             isMobile
//               ? "font-[800] text-[clamp(40px,12vw,70px)] leading-[0.95] text-center text-[#DF0586] font-[Bricolage_Grotesque]"
//               : "font-[800] text-[clamp(60px,8vw,140px)] leading-[0.95] text-center text-[#DF0586] font-[Bricolage_Grotesque]"
//           }
//         >
//           welcome
//           <br />
//           to evolve
//         </h2>
//       </div>
//     </section>
//   );
// };

// export default Scene1;

// import React, { useEffect, useRef, useState } from "react";
// import { gsap } from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import {
//   floor_with_walls,
//   floor_with_walls_mobile,
//   stairs_with_door,
//   evolve_cube,
//   purple_rainbow,
//   down_arrow,
//   door_closeup,
//   door_closeup_mobile,
//   evolve_2d
// } from "../../assets/images/Home";

// gsap.registerPlugin(ScrollTrigger);

// // Optimize GSAP performance
// gsap.config({ force3D: true, autoSleep: 60 });

// const Scene1 = () => {
//   const containerRef = useRef(null);
//   const innerRef = useRef(null);
//   const cubeRef = useRef(null);
//   const rainbowRef = useRef(null);
//   const arrowRef = useRef(null);
//   const doorCloseupRef = useRef(null);
//   const doorCubeRef = useRef(null);
//   const evolveLogoRef = useRef(null);
//   const welcomeTextRef = useRef(null);
//   const doorContainerRef = useRef(null);
//   const floorRef = useRef(null);

//   const [imagesLoaded, setImagesLoaded] = useState(false);
//   const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
//   const [screenWidth, setScreenWidth] = useState(window.innerWidth);
//   const [screenHeight, setScreenHeight] = useState(window.innerHeight);
//   const [doorBottomOffset, setDoorBottomOffset] = useState(0);

//   const calculateDoorPosition = (width, height) => {
//     if (width <= 768) {
//       if (width <= 360) return height * 0.28;
//       else if (width <= 430) return height * 0.3;
//       else if (width <= 540) return height * 0.3;
//       else return height * 0.3;
//     } else {
//       if (width <= 1024) return height * 0.2;
//       else if (width >= 2560) return height * 0.2;
//       else return height * 0.21;
//     }
//   };

//   useEffect(() => {
//     const handleResize = () => {
//       const newWidth = window.innerWidth;
//       const newHeight = window.innerHeight;

//       setIsMobile(newWidth <= 768);
//       setScreenWidth(newWidth);
//       setScreenHeight(newHeight);

//       const offset = calculateDoorPosition(newWidth, newHeight);
//       setDoorBottomOffset(offset);
//     };

//     handleResize();
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   useEffect(() => {
//     const sources = [
//       isMobile ? floor_with_walls_mobile : floor_with_walls,
//       stairs_with_door,
//       evolve_cube,
//       purple_rainbow,
//       isMobile ? door_closeup_mobile : door_closeup,
//       evolve_2d
//     ];
//     let loaded = 0;
//     sources.forEach((src) => {
//       const img = new Image();
//       img.onload = () => {
//         loaded++;
//         if (loaded === sources.length) setImagesLoaded(true);
//       };
//       img.src = src;
//     });
//   }, [isMobile]);

//   useEffect(() => {
//     if (!imagesLoaded) return;

//     const ctx = gsap.context(() => {
//       // Initial state - rainbow VISIBLE with initial ripple
//       gsap.set(rainbowRef.current, {
//         opacity: 1,
//         scale: 1,
//         transformOrigin: "center center",
//         filter: "brightness(1) saturate(1)"
//       });
//       gsap.set(doorCloseupRef.current, { opacity: 0, scale: 1.1 });
//       gsap.set(doorCubeRef.current, { opacity: 0 });
//       gsap.set(evolveLogoRef.current, { opacity: 0 });
//       gsap.set(welcomeTextRef.current, { opacity: 0, y: 30 });
//       gsap.set(innerRef.current, { scale: 1, y: 0 });

//       // Idle ripple effect on load
//       const idleRipple = gsap
//         .timeline({ repeat: -1 })
//         .to(rainbowRef.current, {
//           scale: isMobile ? 1.08 : 1.05,
//           filter: "brightness(1.15) saturate(1.1)",
//           ease: "sine.inOut",
//           duration: 2
//         })
//         .to(rainbowRef.current, {
//           scale: 1,
//           filter: "brightness(1) saturate(1)",
//           ease: "sine.inOut",
//           duration: 2
//         });

//       // Idle cube float
//       const idleCube = gsap.to(cubeRef.current, {
//         y: -12,
//         duration: 2,
//         repeat: -1,
//         yoyo: true,
//         ease: "sine.inOut"
//       });

//       // Idle arrow float
//       const idleArrow = gsap.to(arrowRef.current, {
//         y: -12,
//         duration: 1.8,
//         repeat: -1,
//         yoyo: true,
//         ease: "sine.inOut"
//       });

//       // Scroll-triggered main animation
//       const tl = gsap.timeline({
//         scrollTrigger: {
//           trigger: containerRef.current,
//           start: "top top",
//           end: "bottom+=200% top",
//           scrub: 0.6, // Slightly higher for smoothness
//           pin: true,
//           anticipatePin: 1,
//           markers: false,
//           onEnter: () => {
//             idleRipple.pause();
//           },
//           onLeaveBack: () => {
//             idleRipple.resume();
//           },
//           onLeave: () => {
//             idleRipple.resume();
//           }
//         }
//       });

//       // Smooth zoom with optimized values
//       tl.to(innerRef.current, {
//         scale: isMobile ? 3.2 : 2.6,
//         y: isMobile ? "28vh" : "25vh",
//         transformOrigin: "center center",
//         ease: "power2.inOut",
//         duration: 3
//       })
//         .to(
//           rainbowRef.current,
//           {
//             scale: isMobile ? 2.3 : 2,
//             filter: "brightness(1.25) saturate(1.25)",
//             ease: "power2.inOut",
//             duration: 3
//           },
//           "<"
//         )
//         .to(
//           rainbowRef.current,
//           {
//             scale: isMobile ? 3.2 : 2.8,
//             opacity: 0,
//             duration: 1,
//             ease: "power1.inOut"
//           },
//           "-=0.6"
//         )
//         .to(
//           [cubeRef.current, ".door"],
//           {
//             opacity: 0,
//             duration: 0.6,
//             ease: "power1.inOut"
//           },
//           "-=0.3"
//         )
//         .to(
//           doorCloseupRef.current,
//           { opacity: 1, scale: 1, duration: 1.2, ease: "power2.out" },
//           "-=0.4"
//         )
//         // Optimized bounce sequence
//         .to(
//           doorCubeRef.current,
//           { opacity: 1, y: isMobile ? -25 : -35, duration: 0.6 },
//           "-=0.9"
//         )
//         .to(doorCubeRef.current, { y: 0, duration: 0.5, ease: "back.out" })
//         .to(doorCubeRef.current, {
//           y: isMobile ? -12 : -16,
//           duration: 0.4,
//           ease: "back.out"
//         })
//         .to(doorCubeRef.current, { y: 0, duration: 0.2, ease: "back.out" })
//         .to({}, { duration: 0.15 })
//         .to(doorCubeRef.current, {
//           y: isMobile ? -50 : -70,
//           duration: 0.5,
//           ease: "power2.in"
//         })
//         .to(doorCubeRef.current, { y: 0, duration: 0.6, ease: "bounce.out" })
//         // Morph sequence
//         .to(
//           doorCubeRef.current,
//           {
//             scaleY: 0.4,
//             scaleX: 1.5,
//             duration: 0.5,
//             ease: "power2.inOut"
//           },
//           "-=0.2"
//         )
//         .to(doorCubeRef.current, {
//           scaleY: 1.6,
//           scaleX: 0.4,
//           duration: 0.12,
//           ease: "power3.inOut"
//         })
//         .to(doorCubeRef.current, {
//           scaleY: 1,
//           scaleX: 1,
//           duration: 0.08,
//           ease: "power3.out"
//         })
//         .to(
//           doorCubeRef.current,
//           { opacity: 0, scale: 0.8, duration: 0.4, ease: "power2.inOut" },
//           "morph"
//         )
//         .to(
//           evolveLogoRef.current,
//           { opacity: 1, scale: 1.03, duration: 0.4, ease: "power2.inOut" },
//           "morph"
//         )
//         .to(evolveLogoRef.current, {
//           scale: 1,
//           duration: 0.2,
//           ease: "power2.out"
//         })
//         .to(evolveLogoRef.current, {
//           y: isMobile ? -70 : -100,
//           duration: 0.5,
//           ease: "power2.inOut"
//         })
//         .to(
//           welcomeTextRef.current,
//           { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
//           "-=0.3"
//         );
//     }, containerRef);

//     return () => ctx.revert();
//   }, [imagesLoaded, isMobile]);

//   return (
//     <section
//       ref={containerRef}
//       className="relative w-full h-screen overflow-hidden bg-black"
//     >
//       {!imagesLoaded && (
//         <div className="absolute inset-0 flex items-center justify-center z-50 text-white text-xl">
//           loading...
//         </div>
//       )}

//       <div ref={innerRef} className="absolute inset-0 overflow-hidden">
//         {/* 🌈 rainbow (behind all) - NOW VISIBLE ON LOAD */}
//         <div className="absolute left-1/2 -translate-x-1/2 bottom-[38%] z-[1]">
//           <img
//             ref={rainbowRef}
//             src={purple_rainbow}
//             alt="rainbow"
//             className={
//               isMobile
//                 ? "w-[45vw] min-w-[180px] max-w-[220px]"
//                 : "w-[22vw] min-w-[280px] max-w-[380px]"
//             }
//             style={{ willChange: "transform, filter" }}
//           />
//         </div>

//         {/* 🚪 door + cube (middle layer) */}
//         <div
//           ref={doorContainerRef}
//           className="absolute left-1/2 -translate-x-1/2 z-[2] flex justify-center"
//           style={{ bottom: `${doorBottomOffset}px`, willChange: "transform" }}
//         >
//           <img
//             src={stairs_with_door}
//             alt="door"
//             className={
//               isMobile
//                 ? "door w-[65vw] min-w-[200px] max-w-[260px]"
//                 : "door w-[24vw] min-w-[280px] max-w-[400px]"
//             }
//             style={{ willChange: "opacity" }}
//           />
//           <img
//             ref={cubeRef}
//             src={evolve_cube}
//             alt="cube"
//             className={
//               isMobile
//                 ? "absolute bottom-[50%] left-1/2 -translate-x-1/2 w-[8vw] min-w-[45px] max-w-[55px]"
//                 : "absolute bottom-[50%] left-1/2 -translate-x-1/2 w-[3vw] min-w-[60px] max-w-[80px]"
//             }
//             style={{ willChange: "transform, opacity" }}
//           />
//         </div>

//         {/* 🧱 floor_with_walls (topmost base) */}
//         <img
//           ref={floorRef}
//           src={isMobile ? floor_with_walls_mobile : floor_with_walls}
//           alt="floor with walls"
//           className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-auto z-[3] object-cover"
//           style={{ willChange: "auto" }}
//         />

//         {/* ⬇️ arrow */}
//         <img
//           ref={arrowRef}
//           src={down_arrow}
//           alt="arrow"
//           className={
//             isMobile
//               ? "absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[8vw] min-w-[32px] max-w-[42px] z-[50]"
//               : "absolute bottom-[8%] left-1/2 -translate-x-1/2 w-[2.8vw] min-w-[36px] max-w-[48px] z-[50]"
//           }
//           style={{ willChange: "transform" }}
//         />
//       </div>

//       {/* door closeup & morph layers */}
//       <div
//         ref={doorCloseupRef}
//         className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none"
//         style={{ willChange: "opacity" }}
//       >
//         <img
//           src={isMobile ? door_closeup_mobile : door_closeup}
//           alt="door closeup"
//           className="w-full h-full object-cover"
//         />
//       </div>

//       <div
//         className="absolute inset-0 z-[120] flex items-center justify-center pointer-events-none"
//         style={{ willChange: "transform" }}
//       >
//         <img
//           ref={doorCubeRef}
//           src={evolve_cube}
//           alt="cube morph"
//           className={
//             isMobile
//               ? "w-[22vw] min-w-[90px] max-w-[140px]"
//               : "w-[12vw] min-w-[120px] max-w-[280px]"
//           }
//           style={{ willChange: "transform, opacity" }}
//         />
//       </div>

//       <div
//         className="absolute inset-0 z-[130] flex items-center justify-center pointer-events-none"
//         style={{ willChange: "transform" }}
//       >
//         <img
//           ref={evolveLogoRef}
//           src={evolve_2d}
//           alt="evolve logo"
//           className={
//             isMobile
//               ? "w-[22vw] min-w-[90px] max-w-[140px]"
//               : "w-[12vw] min-w-[120px] max-w-[280px]"
//           }
//           style={{ willChange: "transform, opacity" }}
//         />
//       </div>

//       {/* text */}
//       <div
//         className={`absolute inset-0 z-[140] flex items-center justify-center pointer-events-none ${
//           isMobile ? "pt-[20vh]" : "pt-[25vh]"
//         }`}
//       >
//         <h2
//           ref={welcomeTextRef}
//           className={
//             isMobile
//               ? "font-[800] text-[clamp(40px,12vw,70px)] leading-[0.95] text-center text-[#DF0586] font-[Bricolage_Grotesque]"
//               : "font-[800] text-[clamp(60px,8vw,140px)] leading-[0.95] text-center text-[#DF0586] font-[Bricolage_Grotesque]"
//           }
//           style={{ willChange: "transform, opacity" }}
//         >
//           welcome
//           <br />
//           to evolve
//         </h2>
//       </div>
//     </section>
//   );
// };

// export default Scene1;

// import React, { useRef } from "react";
// import { gsap } from "gsap";
// import {
//   floor_with_walls,
//   floor_with_walls_mobile,
//   stairs_with_door,
//   evolve_cube,
//   purple_rainbow,
//   down_arrow,
//   door_closeup,
//   door_closeup_mobile,
//   evolve_2d
// } from "../../assets/images/Home";

// // 🎥 1. Export a function that returns GSAP timeline
// export const useScene1Timeline = (refs, isMobile) => {
//   const tl = gsap.timeline();

//   // initial state
//   tl.set(refs.rainbow, {
//     opacity: 1,
//     scale: 1,
//     transformOrigin: "center center",
//     filter: "brightness(1) saturate(1)"
//   })
//     .set(refs.doorCloseup, { opacity: 0, scale: 1.1 })
//     .set(refs.doorCube, { opacity: 0 })
//     .set(refs.evolveLogo, { opacity: 0 })
//     .set(refs.text, { opacity: 0, y: 30 })
//     .set(refs.inner, { scale: 1, y: 0 });

//   // main animation sequence (identical to your original)
//   tl.to(refs.inner, {
//     scale: isMobile ? 3.2 : 2.6,
//     y: isMobile ? "28vh" : "25vh",
//     transformOrigin: "center center",
//     ease: "power2.inOut",
//     duration: 3
//   })
//     .to(
//       refs.rainbow,
//       {
//         scale: isMobile ? 2.3 : 2,
//         filter: "brightness(1.25) saturate(1.25)",
//         ease: "power2.inOut",
//         duration: 3
//       },
//       "<"
//     )
//     .to(
//       refs.rainbow,
//       {
//         scale: isMobile ? 3.2 : 2.8,
//         opacity: 0,
//         duration: 1,
//         ease: "power1.inOut"
//       },
//       "-=0.6"
//     )
//     .to(
//       [refs.cube, ".door"],
//       { opacity: 0, duration: 0.6, ease: "power1.inOut" },
//       "-=0.3"
//     )
//     .to(
//       refs.doorCloseup,
//       { opacity: 1, scale: 1, duration: 1.2, ease: "power2.out" },
//       "-=0.4"
//     )
//     // bounce
//     .to(
//       refs.doorCube,
//       { opacity: 1, y: isMobile ? -25 : -35, duration: 0.6 },
//       "-=0.9"
//     )
//     .to(refs.doorCube, { y: 0, duration: 0.5, ease: "back.out" })
//     .to(refs.doorCube, {
//       y: isMobile ? -12 : -16,
//       duration: 0.4,
//       ease: "back.out"
//     })
//     .to(refs.doorCube, { y: 0, duration: 0.2, ease: "back.out" })
//     .to({}, { duration: 0.15 })
//     .to(refs.doorCube, {
//       y: isMobile ? -50 : -70,
//       duration: 0.5,
//       ease: "power2.in"
//     })
//     .to(refs.doorCube, { y: 0, duration: 0.6, ease: "bounce.out" })
//     // morph
//     .to(
//       refs.doorCube,
//       { scaleY: 0.4, scaleX: 1.5, duration: 0.5, ease: "power2.inOut" },
//       "-=0.2"
//     )
//     .to(refs.doorCube, {
//       scaleY: 1.6,
//       scaleX: 0.4,
//       duration: 0.12,
//       ease: "power3.inOut"
//     })
//     .to(refs.doorCube, {
//       scaleY: 1,
//       scaleX: 1,
//       duration: 0.08,
//       ease: "power3.out"
//     })
//     .to(
//       refs.doorCube,
//       { opacity: 0, scale: 0.8, duration: 0.4, ease: "power2.inOut" },
//       "morph"
//     )
//     .to(
//       refs.evolveLogo,
//       { opacity: 1, scale: 1.03, duration: 0.4, ease: "power2.inOut" },
//       "morph"
//     )
//     .to(refs.evolveLogo, { scale: 1, duration: 0.2, ease: "power2.out" })
//     .to(refs.evolveLogo, {
//       y: isMobile ? -70 : -100,
//       duration: 0.5,
//       ease: "power2.inOut"
//     })
//     .to(
//       refs.text,
//       { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
//       "-=0.3"
//     );

//   return tl;
// };

// // 🎨 2. Scene visuals
// const Scene1 = React.forwardRef((props, ref) => {
//   const { isMobile } = props;
//   const containerRef = useRef(null);
//   const innerRef = useRef(null);
//   const cubeRef = useRef(null);
//   const rainbowRef = useRef(null);
//   const arrowRef = useRef(null);
//   const doorCloseupRef = useRef(null);
//   const doorCubeRef = useRef(null);
//   const evolveLogoRef = useRef(null);
//   const textRef = useRef(null);
//   const floorRef = useRef(null);

//   // expose refs to Home
//   React.useImperativeHandle(ref, () => ({
//     container: containerRef.current,
//     inner: innerRef.current,
//     cube: cubeRef.current,
//     rainbow: rainbowRef.current,
//     arrow: arrowRef.current,
//     doorCloseup: doorCloseupRef.current,
//     doorCube: doorCubeRef.current,
//     evolveLogo: evolveLogoRef.current,
//     text: textRef.current,
//     floor: floorRef.current
//   }));

//   return (
//     <section
//       ref={containerRef}
//       className="absolute inset-0 w-full h-full bg-black overflow-hidden"
//     >
//       <div ref={innerRef} className="absolute inset-0 overflow-hidden">
//         {/* 🌈 rainbow */}
//         <img
//           ref={rainbowRef}
//           src={purple_rainbow}
//           alt="rainbow"
//           className={
//             isMobile
//               ? "absolute left-1/2 -translate-x-1/2 bottom-[38%] w-[45vw]"
//               : "absolute left-1/2 -translate-x-1/2 bottom-[38%] w-[22vw]"
//           }
//         />
//         {/* 🚪 door + cube */}
//         <div className="absolute left-1/2 -translate-x-1/2 bottom-[20vh] z-[2] flex justify-center">
//           <img
//             src={stairs_with_door}
//             alt="door"
//             className={
//               isMobile
//                 ? "door w-[65vw] min-w-[200px] max-w-[260px]"
//                 : "door w-[24vw] min-w-[280px] max-w-[400px]"
//             }
//           />
//           <img
//             ref={cubeRef}
//             src={evolve_cube}
//             alt="cube"
//             className={
//               isMobile
//                 ? "absolute bottom-[50%] left-1/2 -translate-x-1/2 w-[8vw]"
//                 : "absolute bottom-[50%] left-1/2 -translate-x-1/2 w-[3vw]"
//             }
//           />
//         </div>
//         {/* 🧱 floor */}
//         <img
//           ref={floorRef}
//           src={isMobile ? floor_with_walls_mobile : floor_with_walls}
//           alt="floor"
//           className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full z-[3]"
//         />
//         {/* ⬇️ arrow */}
//         <img
//           ref={arrowRef}
//           src={down_arrow}
//           alt="arrow"
//           className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[3vw] z-[50]"
//         />
//       </div>

//       {/* door closeup */}
//       <div
//         ref={doorCloseupRef}
//         className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none"
//       >
//         <img
//           src={isMobile ? door_closeup_mobile : door_closeup}
//           alt="door closeup"
//           className="w-full h-full object-cover"
//         />
//       </div>

//       {/* evolve cube morph */}
//       <div className="absolute inset-0 z-[120] flex items-center justify-center pointer-events-none">
//         <img
//           ref={doorCubeRef}
//           src={evolve_cube}
//           alt="cube morph"
//           className={isMobile ? "w-[22vw]" : "w-[12vw]"}
//         />
//       </div>

//       {/* evolve logo */}
//       <div className="absolute inset-0 z-[130] flex items-center justify-center pointer-events-none">
//         <img
//           ref={evolveLogoRef}
//           src={evolve_2d}
//           alt="evolve logo"
//           className={isMobile ? "w-[22vw]" : "w-[12vw]"}
//         />
//       </div>

//       {/* text */}
//       <div className="absolute inset-0 z-[140] flex items-center justify-center pointer-events-none">
//         <h2
//           ref={textRef}
//           className={
//             isMobile
//               ? "font-[800] text-[clamp(40px,12vw,70px)] leading-[0.95] text-center text-[#DF0586]"
//               : "font-[800] text-[clamp(60px,8vw,140px)] leading-[0.95] text-center text-[#DF0586]"
//           }
//         >
//           welcome
//           <br />
//           to evolve
//         </h2>
//       </div>
//     </section>
//   );
// });

// export default Scene1;

import React, { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import {
  floor_with_walls,
  floor_with_walls_mobile,
  stairs_with_door,
  evolve_cube,
  purple_rainbow,
  down_arrow,
  door_closeup,
  door_closeup_mobile,
  evolve_2d
} from "../../assets/images/Home";

// 🎥 OPTIMIZED TIMELINE - GPU acceleration
export const useScene1Timeline = (refs, isMobile) => {
  const tl = gsap.timeline();

  // initial state
  tl.set(refs.rainbow, {
    opacity: 1,
    scale: 1,
    transformOrigin: "center center",
    // filter: "brightness(1) saturate(1)",
    willChange: "transform, opacity"
  })
    .set(refs.doorCloseup, {
      opacity: 0,
      scale: 1.1,
      willChange: "transform, opacity"
    })
    .set(refs.doorCube, { opacity: 0, willChange: "transform" })
    .set(refs.evolveLogo, { opacity: 0, willChange: "transform, opacity" })
    .set(refs.text, { opacity: 0, y: 30, willChange: "transform, opacity" })
    .set(refs.inner, {
      scale: 1,
      y: 0,
      willChange: "transform",
      force3D: true
    });

  // main animation sequence - use force3D for GPU rendering
  tl.to(refs.inner, {
    scale: isMobile ? 3.2 : 2.6,
    y: isMobile ? "28vh" : "25vh",
    transformOrigin: "center center",
    ease: "power2.inOut",
    duration: 3,
    force3D: true
  })
    .to(
      refs.rainbow,
      {
        scale: isMobile ? 2.3 : 2,
        // filter: "brightness(1.25) saturate(1.25)",
        ease: "power2.inOut",
        duration: 3,
        force3D: true
      },
      "<"
    )
    .to(
      refs.rainbow,
      {
        scale: isMobile ? 3.2 : 2.8,
        opacity: 0,
        duration: 1,
        ease: "power1.inOut",
        force3D: true
      },
      "-=0.6"
    )
    .to(
      [refs.cube, ".door"],
      { opacity: 0, duration: 0.6, ease: "power1.inOut" },
      "-=0.3"
    )
    // INSTANTLY REMOVE RAINBOW - no fade out
    .set(refs.rainbow, { opacity: 0, pointerEvents: "none" }, "-=0.4")
    .to(
      refs.doorCloseup,
      {
        opacity: 1,
        scale: 1,
        duration: 1.2,
        ease: "power2.out",
        force3D: true
      },
      "-=0.4"
    )
    // bounce
    .to(
      refs.doorCube,
      { opacity: 1, y: isMobile ? -25 : -35, duration: 0.6, force3D: true },
      "-=0.9"
    )
    .to(refs.doorCube, { y: 0, duration: 0.5, ease: "back.out", force3D: true })
    .to(refs.doorCube, {
      y: isMobile ? -12 : -16,
      duration: 0.4,
      ease: "back.out",
      force3D: true
    })
    .to(refs.doorCube, { y: 0, duration: 0.2, ease: "back.out", force3D: true })
    .to({}, { duration: 0.15 })
    .to(refs.doorCube, {
      y: isMobile ? -50 : -70,
      duration: 0.5,
      ease: "power2.in",
      force3D: true
    })
    .to(refs.doorCube, {
      y: 0,
      duration: 0.6,
      ease: "bounce.out",
      force3D: true
    })
    // morph
    .to(
      refs.doorCube,
      {
        scaleY: 0.4,
        scaleX: 1.5,
        duration: 0.5,
        ease: "power2.inOut",
        force3D: true
      },
      "-=0.2"
    )
    .to(refs.doorCube, {
      scaleY: 1.6,
      scaleX: 0.4,
      duration: 0.12,
      ease: "power3.inOut",
      force3D: true
    })
    .to(refs.doorCube, {
      scaleY: 1,
      scaleX: 1,
      duration: 0.08,
      ease: "power3.out",
      force3D: true
    })
    .to(
      refs.doorCube,
      {
        opacity: 0,
        scale: 0.8,
        duration: 0.4,
        ease: "power2.inOut",
        force3D: true
      },
      "morph"
    )
    .to(
      refs.evolveLogo,
      {
        opacity: 1,
        scale: 1.03,
        duration: 0.4,
        ease: "power2.inOut",
        force3D: true
      },
      "morph"
    )
    .to(refs.evolveLogo, {
      scale: 1,
      duration: 0.2,
      ease: "power2.out",
      force3D: true
    })
    .to(refs.evolveLogo, {
      y: isMobile ? -120 : -200,
      duration: 0.5,
      ease: "power2.inOut",
      force3D: true
    })
    .to(
      refs.text,
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", force3D: true },
      "-=0.2"
    );

  return tl;
};

// 🎨 Scene visuals
const Scene1 = React.forwardRef((props, ref) => {
  const { isMobile } = props;
  const containerRef = useRef(null);
  const innerRef = useRef(null);
  const cubeRef = useRef(null);
  const rainbowRef = useRef(null);
  const arrowRef = useRef(null);
  const doorCloseupRef = useRef(null);
  const doorCubeRef = useRef(null);
  const evolveLogoRef = useRef(null);
  const textRef = useRef(null);
  const doorContainerRef = useRef(null);
  const floorRef = useRef(null);

  const [doorBottomOffset, setDoorBottomOffset] = useState(0);

  // Calculate door position based on screen size
  const calculateDoorPosition = (width, height) => {
    if (width <= 768) {
      if (width <= 360) return height * 0.28;
      else if (width <= 430) return height * 0.3;
      else if (width <= 540) return height * 0.3;
      else return height * 0.3;
    } else {
      if (width <= 1024) return height * 0.2;
      else if (width >= 2560) return height * 0.2;
      else return height * 0.21;
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const offset = calculateDoorPosition(
        window.innerWidth,
        window.innerHeight
      );
      setDoorBottomOffset(offset);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Idle animations - only before scroll starts
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Subtle ripple effect on rainbow - NO opacity change, just scale and brightness
      const rippleTimeline = gsap.to(rainbowRef.current, {
        scale: isMobile ? 1.08 : 1.06,
        // filter: "brightness(1.15) saturate(1.12)",
        ease: "sine.inOut",
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        willChange: "transform"
      });

      // Subtle bouncy animation on cube
      gsap.to(cubeRef.current, {
        y: -10,
        ease: "sine.inOut",
        duration: 2,
        repeat: -1,
        yoyo: true,
        willChange: "transform"
      });

      // Return ripple timeline so parent can kill it on scroll
      return rippleTimeline;
    });

    return () => ctx.revert();
  }, [isMobile]);

  React.useImperativeHandle(ref, () => ({
    container: containerRef.current,
    inner: innerRef.current,
    cube: cubeRef.current,
    rainbow: rainbowRef.current,
    arrow: arrowRef.current,
    doorCloseup: doorCloseupRef.current,
    doorCube: doorCubeRef.current,
    evolveLogo: evolveLogoRef.current,
    text: textRef.current,
    floor: floorRef.current
  }));

  return (
    <section
      ref={containerRef}
      className="absolute inset-0 w-full h-full bg-black overflow-hidden"
      style={{ willChange: "transform" }}
    >
      <div
        ref={innerRef}
        className="absolute inset-0 overflow-hidden"
        style={{ willChange: "transform" }}
      >
        {/* 🌈 rainbow */}
        <img
          ref={rainbowRef}
          src={purple_rainbow}
          alt="rainbow"
          className={
            isMobile
              ? "absolute left-1/2 -translate-x-1/2 bottom-[38%] w-[45vw]"
              : "absolute left-1/2 -translate-x-1/2 bottom-[38%] w-[22vw]"
          }
          style={{ willChange: "transform, opacity" }}
        />
        {/* 🚪 door + cube */}
        <div
          ref={doorContainerRef}
          className="absolute left-1/2 -translate-x-1/2 z-[2] flex justify-center"
          style={{ bottom: `${doorBottomOffset}px`, willChange: "transform" }}
        >
          <img
            src={stairs_with_door}
            alt="door"
            className={
              isMobile
                ? "door w-[65vw] min-w-[200px] max-w-[260px]"
                : "door w-[24vw] min-w-[280px] max-w-[400px]"
            }
          />
          <img
            ref={cubeRef}
            src={evolve_cube}
            alt="cube"
            className={
              isMobile
                ? "absolute bottom-[50%] left-1/2 -translate-x-1/2 w-[8vw]"
                : "absolute bottom-[50%] left-1/2 -translate-x-1/2 w-[3vw]"
            }
          />
        </div>
        {/* 🧱 floor */}
        <img
          ref={floorRef}
          src={isMobile ? floor_with_walls_mobile : floor_with_walls}
          alt="floor"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full z-[3]"
        />
        {/* ⬇️ arrow */}
        <img
          ref={arrowRef}
          src={down_arrow}
          alt="arrow"
          className={
            isMobile
              ? "absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[6vw] z-[50]"
              : "absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[3vw] z-[50]"
          }
        />
      </div>

      {/* door closeup */}
      <div
        ref={doorCloseupRef}
        className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none"
        style={{ willChange: "transform, opacity" }}
      >
        <img
          src={isMobile ? door_closeup_mobile : door_closeup}
          alt="door closeup"
          className="w-full h-full object-cover"
        />
      </div>

      {/* evolve cube morph */}
      <div className="absolute inset-0 z-[120] flex items-center justify-center pointer-events-none">
        <img
          ref={doorCubeRef}
          src={evolve_cube}
          alt="cube morph"
          className={isMobile ? "w-[22vw]" : "w-[12vw]"}
          style={{ willChange: "transform, opacity" }}
        />
      </div>

      {/* evolve logo */}
      <div className="absolute inset-0 z-[130] flex items-center justify-center pointer-events-none">
        <img
          ref={evolveLogoRef}
          src={evolve_2d}
          alt="evolve logo"
          className={isMobile ? "w-[22vw]" : "w-[12vw]"}
          style={{ willChange: "transform, opacity" }}
        />
      </div>

      {/* text */}
      <div className="absolute inset-0 z-[140] flex items-center justify-center pointer-events-none">
        <h2
          ref={textRef}
          className={
            isMobile
              ? "font-[800] text-[clamp(40px,12vw,70px)] leading-[0.95] text-center text-[#DF0586]"
              : "font-[800] text-[clamp(60px,8vw,140px)] leading-[0.95] text-center text-[#DF0586]"
          }
          style={{ willChange: "transform, opacity" }}
        >
          welcome
          <br />
          to evolve
        </h2>
      </div>
    </section>
  );
});

export default Scene1;
