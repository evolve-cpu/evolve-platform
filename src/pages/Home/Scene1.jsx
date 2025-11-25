// import React, { useRef, useState, useEffect } from "react";
// import { gsap } from "gsap";
// import {
//   floor_with_walls,
//   floor_with_walls_mobile,
//   stairs_with_door,
//   evolve_cube,
//   purple_rainbow,
//   scroll,
//   door_closeup,
//   door_closeup_mobile,
//   evolve_2d
// } from "../../assets/images/Home";
// import { DotLottieReact } from "@lottiefiles/dotlottie-react";

// // =========================
// // FONT SIZE LOGIC (H2)
// // =========================
// const getHeadingFontSize = () => {
//   const w = window.innerWidth;
//   const h = window.innerHeight;

//   // ------- MOBILE -------
//   if (w < 768) {
//     if (h >= 812) return "64px"; // mobile 812 & above
//     if (h >= 736) return "56px"; // mobile 736
//     if (h >= 667) return "56px"; // mobile 667
//     return "48px"; // fallback small phones
//   }

//   // ------- DESKTOP -------
//   if (w >= 1700) return "128px"; // desktop-wide
//   if (h >= 1080) return "124px"; // desktop-tall
//   if (h >= 900) return "110px"; // desktop-base
//   if (h >= 768) return "96px"; // desktop-compact

//   return "96px"; // fallback
// };

// const getHeadingLineHeight = () => {
//   const w = window.innerWidth;
//   const h = window.innerHeight;

//   // ------- MOBILE -------
//   if (w < 768) {
//     if (h >= 812) return "56px"; // mobile 812+
//     if (h >= 736) return "52px"; // mobile 736
//     if (h >= 667) return "52px"; // mobile 667
//     return "48px";
//   }

//   // ------- DESKTOP -------
//   if (w >= 1700) return "128px"; // desktop-wide
//   if (h >= 1080) return "128px"; // desktop-tall
//   if (h >= 900) return "120px"; // desktop-base
//   if (h >= 768) return "92px"; // desktop-compact

//   return "92px"; // fallback
// };

// const isTablet = (() => {
//   const w = window.innerWidth;
//   const h = window.innerHeight;

//   // common tablet ranges (portrait + landscape)
//   return w >= 700 && w <= 1380 && h >= 600 && h <= 1400;
// })();

// // 🎥 OPTIMIZED TIMELINE - GPU acceleration
// export const useScene1Timeline = (refs, isMobile) => {
//   const tl = gsap.timeline();

//   // initial state
//   tl.set(refs.rainbow, {
//     opacity: 1,
//     scale: 1,
//     transformOrigin: "center center",
//     willChange: "transform, opacity"
//   })
//     .set(refs.doorCloseup, {
//       opacity: 0,
//       scale: 1.15,
//       filter: "blur(8px)",
//       willChange: "transform, opacity, filter"
//     })
//     // 🔁 lottie wrapper initial state
//     .set(refs.lottie, {
//       opacity: 0,
//       y: 0,
//       scale: 1,
//       willChange: "transform, opacity"
//     })
//     .set(refs.text, { opacity: 0, y: 0, willChange: "transform, opacity" })
//     .set(refs.inner, {
//       scale: 1,
//       y: 0,
//       willChange: "transform",
//       force3D: true
//     });

//   // main animation sequence
//   tl.to(refs.inner, {
//     scale: isMobile ? 3.2 : 5.5,
//     y: isMobile ? 0 : "25vh",
//     // transformOrigin: isMobile ? "center 50%" : "center 45%",
//     transformOrigin: isMobile
//       ? "center 50%"
//       : isTablet
//       ? "center 62%" // ⬅️ tablets get 50%
//       : "center 45%", // desktops stay the same

//     ease: "power2.inOut",
//     duration: 3,
//     force3D: true
//   })
//     .to(
//       refs.rainbow,
//       {
//         scale: isMobile ? 2.3 : 2,
//         ease: "power2.inOut",
//         duration: 3,
//         force3D: true
//       },
//       "<"
//     )
//     .fromTo(
//       refs.doorContainer,
//       {
//         scale: 1
//       },
//       {
//         scale: isMobile ? 1 : 1,
//         ease: "power2.inOut",
//         duration: 3,
//         force3D: true
//       },
//       "<"
//     )
//     .to(
//       refs.rainbow,
//       {
//         scale: isMobile ? 3.8 : 4.5,
//         opacity: 0,
//         duration: 0.5,
//         ease: "power2.in",
//         force3D: true
//       },
//       "-=0.4"
//     )
//     .to(
//       [refs.cube, ".door"],
//       {
//         opacity: 0,
//         duration: 0,
//         ease: "power1.in"
//       },
//       "<"
//     )
//     .fromTo(
//       refs.doorCloseup,
//       {
//         opacity: 0,
//         scale: 1,
//         filter: "blur(8px)"
//       },
//       {
//         opacity: 1,
//         scale: 1,
//         filter: "blur(0px)",
//         duration: 0,
//         ease: "power2.out",
//         force3D: true
//       },
//       "-=1.1"
//     )
//     .set(refs.rainbow, { opacity: 0, pointerEvents: "none" });

//   tl
//     // 🎬 AUTO-PLAY SECTION STARTS HERE (add extra duration for scroll buffer)
//     .to({}, { duration: 0.5 })

//     // ⭐ show lottie and start animation once
//     .to(refs.lottie, {
//       opacity: 1,
//       duration: 0.3,
//       ease: "power1.out",
//       force3D: true,
//       onStart: () => {
//         if (refs.playLottie) {
//           refs.playLottie(); // 🔥 start lottie exactly now
//         }
//       }
//     })

//     // give lottie some time to play its morph (tweak this to match length)
//     .to({}, { duration: 1.5 })

//     // move lottie up to make space for text
//     .to(refs.lottie, {
//       y: isMobile ? "-12vh" : "-15vh",
//       duration: 0.3,
//       ease: "power2.out",
//       force3D: true
//     })

//     .fromTo(
//       refs.text,
//       {
//         opacity: 0,
//         y: isMobile ? "12vh" : "14vh"
//       },
//       {
//         opacity: 1,
//         y: isMobile ? "4vh" : "20vh",
//         duration: 0.8,
//         ease: "power2.out",
//         force3D: true
//       },
//       "-=0.2"
//     )

//     .to({}, { duration: 1 })

//     .to([refs.lottie, refs.text], {
//       opacity: 0,
//       duration: 0.2,
//       ease: "power2.out",
//       force3D: true
//     });

//   return tl;
// };

// const Scene1 = React.forwardRef((props, ref) => {
//   const { isMobile } = props;
//   const containerRef = useRef(null);
//   const innerRef = useRef(null);
//   const cubeRef = useRef(null);
//   const rainbowRef = useRef(null);
//   const arrowRef = useRef(null);
//   const doorCloseupRef = useRef(null);
//   const doorContainerRef = useRef(null);
//   const floorRef = useRef(null);
//   const textRef = useRef(null);

//   // 🔁 lottie wrapper
//   const lottieRef = useRef(null);

//   // 🔁 function ref to trigger play later
//   const lottiePlayRef = useRef(() => {});

//   const [doorBottomOffset, setDoorBottomOffset] = useState(0);
//   const [isLocked, setIsLocked] = useState(false);

//   // Calculate door position based on screen size
//   const calculateDoorPosition = (width, height) => {
//     if (width <= 768) {
//       // Mobile devices
//       if (width <= 360)
//         return height * 0.28; // Small phones (Galaxy Fold, iPhone SE)
//       else if (width <= 375) return height * 0.29; // iPhone 13 Mini, iPhone SE
//       else if (width <= 393)
//         return height * 0.3; // iPhone 14 Pro, iPhone 15 Pro (Safari)
//       else if (width <= 414)
//         return height * 0.3; // iPhone 14 Plus, iPhone 15 Plus
//       else if (width <= 430)
//         return height * 0.3; // iPhone 14 Pro Max, iPhone 15 Pro Max
//       else if (width <= 540) return height * 0.3; // Surface Duo
//       else return height * 0.3; // Large phones/small tablets
//     } else if (width <= 1368) {
//       // Tablets
//       if (width <= 768) return height * 0.1; // iPad Mini, iPad portrait
//       else if (width <= 820) return height * 0.1; // iPad Air portrait
//       else if (width <= 912) return height * 0.1; // Surface Pro portrait
//       else return height * 0.15; // Tablet landscape
//     } else {
//       // Desktop
//       if (width <= 1280) return height * 0.2; // Small laptops (1024-1280)
//       else if (width <= 1440) return height * 0.21; // Standard laptops (HD+)
//       else if (width <= 1920) return height * 0.21; // Full HD
//       else if (width <= 2560) return height * 0.2; // 2K monitors
//       else if (width <= 3440) return height * 0.2; // Ultrawide monitors
//       else return height * 0.2; // 4K and above
//     }
//   };

//   useEffect(() => {
//     const handleResize = () => {
//       if (isLocked) return; // Don't recalculate if locked

//       const offset = calculateDoorPosition(
//         window.innerWidth,
//         window.innerHeight
//       );
//       setDoorBottomOffset(offset);
//     };

//     handleResize();
//     setIsLocked(true); // Lock after first calculation

//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, [isLocked]);

//   // Idle animations - only before scroll starts
//   // idle animation uses cubeRef as before, no change
//   useEffect(() => {
//     const ctx = gsap.context(() => {
//       const rippleTimeline = gsap.to(rainbowRef.current, {
//         scale: isMobile ? 1.08 : 1.06,
//         ease: "sine.inOut",
//         duration: 2.5,
//         repeat: -1,
//         yoyo: true,
//         willChange: "transform"
//       });

//       gsap.to(cubeRef.current, {
//         y: -10,
//         ease: "sine.inOut",
//         duration: 2,
//         repeat: -1,
//         yoyo: true,
//         willChange: "transform"
//       });

//       return rippleTimeline;
//     });

//     return () => ctx.revert();
//   }, [isMobile]);

//   React.useImperativeHandle(ref, () => ({
//     container: containerRef.current,
//     inner: innerRef.current,
//     cube: cubeRef.current,
//     rainbow: rainbowRef.current,
//     arrow: arrowRef.current,
//     doorCloseup: doorCloseupRef.current,
//     floor: floorRef.current,
//     doorContainer: doorContainerRef.current,
//     text: textRef.current,
//     lottie: lottieRef.current,
//     // 👉 gsap will call this to start the animation
//     playLottie: () => lottiePlayRef.current()
//   }));

//   return (
//     <section
//       ref={containerRef}
//       className="absolute inset-0 w-full h-full bg-black overflow-hidden"
//       style={{ willChange: "transform" }}
//     >
//       <div
//         ref={innerRef}
//         className="absolute inset-0 overflow-hidden"
//         style={{ willChange: "transform" }}
//       >
//         {/* 🚪 door + cube */}
//         <div
//           ref={doorContainerRef}
//           className="absolute left-1/2 -translate-x-1/2 z-[2] flex justify-center"
//           style={{
//             bottom: `${doorBottomOffset}px`,
//             willChange: "transform",
//             transformOrigin: "center bottom",
//             position: "absolute"
//           }}
//         >
//           {/* 🌈 rainbow behind door, centered relative to door */}
//           <img
//             ref={rainbowRef}
//             src={purple_rainbow}
//             alt="rainbow"
//             className={
//               isMobile
//                 ? "absolute left-[49%] -translate-x-1/2 bottom-[10%] w-[45vw] -z-10"
//                 : "absolute left-[49.2%] -translate-x-1/2 bottom-[10%] w-[22vw] -z-10"
//             }
//             style={{
//               willChange: "transform, opacity",
//               imageRendering: "-webkit-optimize-contrast",
//               backfaceVisibility: "hidden"
//             }}
//           />

//           {/* door on top of rainbow */}
//           <img
//             src={stairs_with_door}
//             alt="door"
//             className={
//               isMobile
//                 ? "door w-[65vw] min-w-[200px] max-w-[260px] relative"
//                 : "door w-[24vw] min-w-[280px] max-w-[400px] relative"
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
//         {/* 📜 scroll indicator - replaced down_arrow */}
//         <img
//           ref={arrowRef}
//           src={scroll}
//           alt="scroll"
//           className={
//             isMobile
//               ? "absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[12vw] z-[50]"
//               : "absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[6vw] z-[50]"
//           }
//         />
//       </div>

//       {/* door closeup */}
//       <div
//         ref={doorCloseupRef}
//         className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none"
//         style={{ willChange: "transform, opacity" }}
//       >
//         <img
//           src={isMobile ? door_closeup_mobile : door_closeup}
//           alt="door closeup"
//           className="w-full h-full object-cover"
//         />
//       </div>

//       {/* evolve cube morph */}

//       <div
//         ref={lottieRef}
//         className="absolute inset-0 z-[130] flex items-center justify-center pointer-events-none"
//         style={{ willChange: "transform, opacity", opacity: 0 }}
//       >
//         <div className={isMobile ? "w-[200%]" : "w-[100vw]"}>
//           <DotLottieReact
//             src="https://lottie.host/07d82781-37a6-41c7-9250-1adf1c42956f/xdEKCbGV3S.lottie"
//             loop={false}
//             autoplay={false}
//             dotLottieRefCallback={(instance) => {
//               // store a play function we can call from GSAP
//               lottiePlayRef.current = () => instance?.play();
//             }}
//           />
//         </div>
//       </div>

//       {/* text - updated with new typography specs */}
//       <div className="absolute inset-0 z-[140] flex items-center justify-center pointer-events-none">
//         <h2
//           ref={textRef}
//           className="font-[800] text-center text-[#DF0586]"
//           style={{
//             fontSize: getHeadingFontSize(), // auto from function
//             lineHeight: getHeadingLineHeight(), // auto from function
//             letterSpacing: "-0.03em",
//             willChange: "transform, opacity"
//           }}
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

// import React, { useRef, useState, useEffect } from "react";
// import { gsap } from "gsap";
// import {
//   floor_with_walls,
//   floor_with_walls_mobile,
//   stairs_with_door,
//   evolve_cube,
//   purple_rainbow,
//   scroll,
//   door_closeup,
//   door_closeup_mobile,
//   evolve_2d
// } from "../../assets/images/Home";
// import { DotLottieReact } from "@lottiefiles/dotlottie-react";

// // =========================
// // FONT SIZE LOGIC (H2)
// // =========================
// const getHeadingFontSize = () => {
//   const w = window.innerWidth;
//   const h = window.innerHeight;

//   // ------- MOBILE -------
//   if (w < 768) {
//     if (h >= 812) return "64px"; // mobile 812 & above
//     if (h >= 736) return "56px"; // mobile 736
//     if (h >= 667) return "56px"; // mobile 667
//     return "48px"; // fallback small phones
//   }

//   // ------- DESKTOP -------
//   if (w >= 1700) return "128px"; // desktop-wide
//   if (h >= 1080) return "124px"; // desktop-tall
//   if (h >= 900) return "110px"; // desktop-base
//   if (h >= 768) return "96px"; // desktop-compact

//   return "96px"; // fallback
// };

// const getHeadingLineHeight = () => {
//   const w = window.innerWidth;
//   const h = window.innerHeight;

//   // ------- MOBILE -------
//   if (w < 768) {
//     if (h >= 812) return "56px"; // mobile 812+
//     if (h >= 736) return "52px"; // mobile 736
//     if (h >= 667) return "52px"; // mobile 667
//     return "48px";
//   }

//   // ------- DESKTOP -------
//   if (w >= 1700) return "128px"; // desktop-wide
//   if (h >= 1080) return "128px"; // desktop-tall
//   if (h >= 900) return "120px"; // desktop-base
//   if (h >= 768) return "92px"; // desktop-compact

//   return "92px"; // fallback
// };

// const isTablet = (() => {
//   const w = window.innerWidth;
//   const h = window.innerHeight;

//   // common tablet ranges (portrait + landscape)
//   return w >= 700 && w <= 1380 && h >= 600 && h <= 1400;
// })();

// // 🎥 OPTIMIZED TIMELINE - GPU acceleration
// export const useScene1Timeline = (refs, isMobile) => {
//   const tl = gsap.timeline();

//   // initial state
//   tl.set(refs.rainbow, {
//     opacity: 1,
//     scale: 1,
//     transformOrigin: "center center",
//     willChange: "transform, opacity"
//   })
//     .set(refs.doorCloseup, {
//       opacity: 0,
//       scale: 1.15,
//       filter: "blur(8px)",
//       willChange: "transform, opacity, filter"
//     })
//     // 🔁 lottie wrapper initial state
//     .set(refs.lottie, {
//       opacity: 0,
//       y: 0,
//       scale: 1,
//       willChange: "transform, opacity"
//     })
//     .set(refs.text, { opacity: 0, y: 0, willChange: "transform, opacity" })
//     .set(refs.inner, {
//       scale: 1,
//       y: 0,
//       willChange: "transform",
//       force3D: true
//     })
//     // 👇 NEW: door halves hidden at start
//     .set([refs.doorLeft, refs.doorRight], {
//       autoAlpha: 0,
//       x: 0,
//       willChange: "transform, opacity"
//     });

//   // main animation sequence
//   tl.to(refs.inner, {
//     scale: isMobile ? 3.2 : 5.5,
//     y: isMobile ? 0 : "25vh",
//     // transformOrigin: isMobile ? "center 50%" : "center 45%",
//     transformOrigin: isMobile
//       ? "center 50%"
//       : isTablet
//       ? "center 62%" // ⬅️ tablets get 50%
//       : "center 45%", // desktops stay the same

//     ease: "power2.inOut",
//     duration: 3,
//     force3D: true
//   })
//     .to(
//       refs.rainbow,
//       {
//         scale: isMobile ? 2.3 : 2,
//         ease: "power2.inOut",
//         duration: 3,
//         force3D: true
//       },
//       "<"
//     )
//     .fromTo(
//       refs.doorContainer,
//       {
//         scale: 1
//       },
//       {
//         scale: isMobile ? 1 : 1,
//         ease: "power2.inOut",
//         duration: 3,
//         force3D: true
//       },
//       "<"
//     )
//     // finish zoom: rainbow grows a bit more but we do not kill opacity here
//     .to(
//       refs.rainbow,
//       {
//         scale: isMobile ? 3.8 : 4.5,
//         duration: 0.5,
//         ease: "power2.in",
//         force3D: true
//       },
//       "-=0.4"
//     )

//     // hide cube, prepare for split
//     .to(
//       refs.cube,
//       {
//         autoAlpha: 0,
//         duration: 0.6,
//         ease: "power1.in"
//       },
//       "<"
//     )

//     // show halves FIRST with guaranteed full opacity
//     .set(
//       [refs.doorLeft, refs.doorRight],
//       {
//         opacity: 1,
//         autoAlpha: 1,
//         x: 0
//       },
//       "<"
//     )

//     // hide full door (slightly delayed)
//     .to(
//       ".door-full",
//       {
//         autoAlpha: 0,
//         duration: 0.01
//       },
//       "<0.02"
//     )

//     // at the exact moment the split begins:
//     // 1) clear purple rainbow
//     // 2) start crossfade of door closeup from "behind"
//     .to(
//       refs.rainbow,
//       {
//         opacity: 0,
//         duration: 0.3,
//         ease: "power1.out"
//       }
//       // "<" // same moment as split start
//     )

//     // door closeup fade in while halves slide out
//     // door closeup fade in while halves slide out
//     .fromTo(
//       refs.doorCloseup,
//       {
//         opacity: 0,
//         scale: 1.1,
//         filter: "blur(0px)"
//       },
//       {
//         opacity: 1,
//         scale: 1,
//         filter: "blur(0px)",
//         duration: 0.2,
//         ease: "power2.out",
//         force3D: true
//       }
//       // "<" // starts exactly with rainbow fade
//     )

//     // split animation: left & right slide out
//     // split animation: left & right slide out - STAY VISIBLE
//     .to(
//       refs.doorLeft,
//       {
//         x: isMobile ? "-40vw" : "-25vw",
//         duration: 1,
//         opacity: 1, // stays fully visible
//         ease: "power2.out"
//       },
//       "<" // together with closeup fade
//     )
//     .to(
//       refs.doorRight,
//       {
//         x: isMobile ? "40vw" : "25vw",
//         duration: 1,
//         opacity: 1, // stays fully visible
//         ease: "power2.out"
//       },
//       "<"
//     )

//     // fade out door halves AFTER they've moved
//     .to(
//       [refs.doorLeft, refs.doorRight],
//       {
//         opacity: 0,
//         duration: 0.3,
//         ease: "power1.out"
//       },
//       "-=0.2"
//     )

//     // safety: rainbow fully gone and non interactive
//     .set(refs.rainbow, { opacity: 0, pointerEvents: "none" });

//   tl
//     // 🎬 AUTO-PLAY SECTION STARTS HERE (add extra duration for scroll buffer)
//     .to({}, { duration: 0.5 })

//     // ⭐ show lottie and start animation once
//     .to(refs.lottie, {
//       opacity: 1,
//       duration: 0.3,
//       ease: "power1.out",
//       force3D: true,
//       onStart: () => {
//         if (refs.playLottie) {
//           refs.playLottie(); // 🔥 start lottie exactly now
//         }
//       }
//     })

//     // give lottie some time to play its morph (tweak this to match length)
//     .to({}, { duration: 1.5 })

//     // move lottie up to make space for text
//     .to(refs.lottie, {
//       y: isMobile ? "-12vh" : "-15vh",
//       duration: 0.3,
//       ease: "power2.out",
//       force3D: true
//     })

//     .fromTo(
//       refs.text,
//       {
//         opacity: 0,
//         y: isMobile ? "12vh" : "14vh"
//       },
//       {
//         opacity: 1,
//         y: isMobile ? "4vh" : "20vh",
//         duration: 0.8,
//         ease: "power2.out",
//         force3D: true
//       },
//       "-=0.2"
//     )

//     .to({}, { duration: 1 })

//     .to([refs.lottie, refs.text], {
//       opacity: 0,
//       duration: 0.2,
//       ease: "power2.out",
//       force3D: true
//     });

//   return tl;
// };

// const Scene1 = React.forwardRef((props, ref) => {
//   const { isMobile } = props;
//   const containerRef = useRef(null);
//   const innerRef = useRef(null);
//   const cubeRef = useRef(null);
//   const rainbowRef = useRef(null);
//   const arrowRef = useRef(null);
//   const doorCloseupRef = useRef(null);
//   const doorContainerRef = useRef(null);
//   const floorRef = useRef(null);
//   const textRef = useRef(null);

//   // 🔁 lottie wrapper
//   const lottieRef = useRef(null);

//   // 🔁 function ref to trigger play later
//   const lottiePlayRef = useRef(() => {});

//   const [doorBottomOffset, setDoorBottomOffset] = useState(0);
//   const [isLocked, setIsLocked] = useState(false);
//   const doorLeftHalfRef = useRef(null);
//   const doorRightHalfRef = useRef(null);

//   // Calculate door position based on screen size
//   const calculateDoorPosition = (width, height) => {
//     if (width <= 768) {
//       // Mobile devices
//       if (width <= 360)
//         return height * 0.28; // Small phones (Galaxy Fold, iPhone SE)
//       else if (width <= 375) return height * 0.29; // iPhone 13 Mini, iPhone SE
//       else if (width <= 393)
//         return height * 0.3; // iPhone 14 Pro, iPhone 15 Pro (Safari)
//       else if (width <= 414)
//         return height * 0.3; // iPhone 14 Plus, iPhone 15 Plus
//       else if (width <= 430)
//         return height * 0.3; // iPhone 14 Pro Max, iPhone 15 Pro Max
//       else if (width <= 540) return height * 0.3; // Surface Duo
//       else return height * 0.3; // Large phones/small tablets
//     } else if (width <= 1368) {
//       // Tablets
//       if (width <= 768) return height * 0.1; // iPad Mini, iPad portrait
//       else if (width <= 820) return height * 0.1; // iPad Air portrait
//       else if (width <= 912) return height * 0.1; // Surface Pro portrait
//       else return height * 0.15; // Tablet landscape
//     } else {
//       // Desktop
//       if (width <= 1280) return height * 0.2; // Small laptops (1024-1280)
//       else if (width <= 1440) return height * 0.21; // Standard laptops (HD+)
//       else if (width <= 1920) return height * 0.21; // Full HD
//       else if (width <= 2560) return height * 0.2; // 2K monitors
//       else if (width <= 3440) return height * 0.2; // Ultrawide monitors
//       else return height * 0.2; // 4K and above
//     }
//   };

//   useEffect(() => {
//     const handleResize = () => {
//       if (isLocked) return; // Don't recalculate if locked

//       const offset = calculateDoorPosition(
//         window.innerWidth,
//         window.innerHeight
//       );
//       setDoorBottomOffset(offset);
//     };

//     handleResize();
//     setIsLocked(true); // Lock after first calculation

//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, [isLocked]);

//   // Idle animations - only before scroll starts
//   // idle animation uses cubeRef as before, no change
//   useEffect(() => {
//     const ctx = gsap.context(() => {
//       const rippleTimeline = gsap.to(rainbowRef.current, {
//         scale: isMobile ? 1.08 : 1.06,
//         ease: "sine.inOut",
//         duration: 2.5,
//         repeat: -1,
//         yoyo: true,
//         willChange: "transform"
//       });

//       gsap.to(cubeRef.current, {
//         y: -10,
//         ease: "sine.inOut",
//         duration: 2,
//         repeat: -1,
//         yoyo: true,
//         willChange: "transform"
//       });

//       return rippleTimeline;
//     });

//     return () => ctx.revert();
//   }, [isMobile]);

//   React.useImperativeHandle(ref, () => ({
//     container: containerRef.current,
//     inner: innerRef.current,
//     cube: cubeRef.current,
//     rainbow: rainbowRef.current,
//     arrow: arrowRef.current,
//     doorCloseup: doorCloseupRef.current,
//     floor: floorRef.current,
//     doorContainer: doorContainerRef.current,
//     text: textRef.current,
//     lottie: lottieRef.current,
//     doorLeft: doorLeftHalfRef.current, // 👈 new
//     doorRight: doorRightHalfRef.current, // 👈 new
//     // 👉 gsap will call this to start the animation
//     playLottie: () => lottiePlayRef.current()
//   }));

//   return (
//     <section
//       ref={containerRef}
//       className="absolute inset-0 w-full h-full bg-black overflow-hidden"
//       style={{ willChange: "transform" }}
//     >
//       <div
//         ref={innerRef}
//         className="absolute inset-0 overflow-hidden"
//         style={{ willChange: "transform" }}
//       >
//         {/* 🚪 door + cube */}
//         <div
//           ref={doorContainerRef}
//           className="absolute left-1/2 -translate-x-1/2 z-[2] flex justify-center"
//           style={{
//             bottom: `${doorBottomOffset}px`,
//             willChange: "transform",
//             transformOrigin: "center bottom",
//             position: "absolute"
//           }}
//         >
//           {/* 🌈 rainbow behind door, centered relative to door */}
//           <img
//             ref={rainbowRef}
//             src={purple_rainbow}
//             alt="rainbow"
//             className={
//               isMobile
//                 ? "absolute left-[49%] -translate-x-1/2 bottom-[10%] w-[45vw] -z-10"
//                 : "absolute left-[49.2%] -translate-x-1/2 bottom-[10%] w-[22vw] -z-10"
//             }
//             style={{
//               willChange: "transform, opacity",
//               imageRendering: "-webkit-optimize-contrast",
//               backfaceVisibility: "hidden"
//             }}
//           />

//           {/* wrapper so all door layers share same box */}
//           <div
//             className={
//               isMobile
//                 ? "relative w-[65vw] min-w-[200px] max-w-[260px]"
//                 : "relative w-[24vw] min-w-[280px] max-w-[400px]"
//             }
//           >
//             {/* full door (used for zoom in, then hidden before split) */}
//             <img
//               src={stairs_with_door}
//               alt="door"
//               className="door-full w-full h-auto relative"
//             />

//             {/* left half of door */}
//             <img
//               ref={doorLeftHalfRef}
//               src={stairs_with_door}
//               alt="door left half"
//               className="absolute inset-0 w-full h-full object-cover pointer-events-none"
//               style={{
//                 clipPath: "inset(0 50% 0 0)", // left half
//                 willChange: "transform, opacity"
//               }}
//             />

//             {/* right half of door */}
//             <img
//               ref={doorRightHalfRef}
//               src={stairs_with_door}
//               alt="door right half"
//               className="absolute inset-0 w-full h-full object-cover pointer-events-none"
//               style={{
//                 clipPath: "inset(0 0 0 50%)", // right half
//                 willChange: "transform, opacity"
//               }}
//             />
//           </div>

//           {/* cube stays same on top */}
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
//         {/* 📜 scroll indicator - replaced down_arrow */}
//         <img
//           ref={arrowRef}
//           src={scroll}
//           alt="scroll"
//           className={
//             isMobile
//               ? "absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[12vw] z-[50]"
//               : "absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[6vw] z-[50]"
//           }
//         />
//       </div>

//       {/* door closeup */}
//       <div
//         ref={doorCloseupRef}
//         className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none"
//         style={{ willChange: "transform, opacity" }}
//       >
//         <img
//           src={isMobile ? door_closeup_mobile : door_closeup}
//           alt="door closeup"
//           className="w-full h-full object-cover"
//         />
//       </div>

//       {/* evolve cube morph */}

//       <div
//         ref={lottieRef}
//         className="absolute inset-0 z-[130] flex items-center justify-center pointer-events-none"
//         style={{ willChange: "transform, opacity", opacity: 0 }}
//       >
//         <div className={isMobile ? "w-[200%]" : "w-[100vw]"}>
//           <DotLottieReact
//             src="https://lottie.host/07d82781-37a6-41c7-9250-1adf1c42956f/xdEKCbGV3S.lottie"
//             loop={false}
//             autoplay={false}
//             dotLottieRefCallback={(instance) => {
//               // store a play function we can call from GSAP
//               lottiePlayRef.current = () => instance?.play();
//             }}
//           />
//         </div>
//       </div>

//       {/* text - updated with new typography specs */}
//       <div className="absolute inset-0 z-[140] flex items-center justify-center pointer-events-none">
//         <h2
//           ref={textRef}
//           className="font-[800] text-center text-[#DF0586]"
//           style={{
//             fontSize: getHeadingFontSize(), // auto from function
//             lineHeight: getHeadingLineHeight(), // auto from function
//             letterSpacing: "-0.03em",
//             willChange: "transform, opacity"
//           }}
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

import React, {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  forwardRef,
  useImperativeHandle
} from "react";
import { gsap } from "gsap";
import {
  floor_with_walls,
  floor_with_walls_mobile,
  stairs_with_door,
  evolve_cube,
  purple_rainbow,
  scroll,
  door_closeup,
  door_closeup_mobile,
  dive_in
} from "../../assets/images/Home";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

// =========================
// FONT SIZE LOGIC (H2)
// =========================
const getHeadingFontSize = () => {
  const w = window.innerWidth;
  const h = window.innerHeight;

  // ------- MOBILE -------
  if (w < 768) {
    if (h >= 812) return "64px";
    if (h >= 736) return "56px";
    if (h >= 667) return "56px";
    return "48px";
  }

  // ------- DESKTOP -------
  if (w >= 1700) return "128px";
  if (h >= 1080) return "124px";
  if (h >= 900) return "110px";
  if (h >= 768) return "96px";

  return "96px";
};

const getHeadingLineHeight = () => {
  const w = window.innerWidth;
  const h = window.innerHeight;

  // ------- MOBILE -------
  if (w < 768) {
    if (h >= 812) return "56px";
    if (h >= 736) return "52px";
    if (h >= 667) return "52px";
    return "48px";
  }

  // ------- DESKTOP ------- (UPDATED: reduced all values)
  if (w >= 1700) return "110px"; // was 128px
  if (h >= 1080) return "110px"; // was 128px
  if (h >= 900) return "100px"; // was 120px
  if (h >= 768) return "84px"; // was 92px

  return "84px"; // was 92px
};

const isTablet = (() => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  return w >= 700 && w <= 1380 && h >= 600 && h <= 1400;
})();

// build the intro timeline (play once, not scroll-based)
const buildScene1Timeline = (refs, isMobile) => {
  const tl = gsap.timeline();

  // tl.set(refs.rainbow, {
  //   opacity: 1,
  //   scale: 1,
  //   transformOrigin: "center center",
  //   willChange: "transform, opacity"
  // })
  //   .set(refs.doorCloseup, {
  //     opacity: 0,
  //     scale: 1.15,
  //     filter: "blur(8px)",
  //     willChange: "transform, opacity, filter"
  //   })
  tl.set(refs.rainbow, {
    opacity: 1,
    scale: 1,
    transformOrigin: "center center",
    willChange: "transform, opacity"
  })
    .set(refs.doorCloseup, {
      opacity: 0, // START HIDDEN
      scale: 1, // CHANGED from 1.15 to 1
      filter: "blur(0px)", // CHANGED from blur(8px) to blur(0px)
      willChange: "transform, opacity, filter"
    })
    .set(refs.lottie, {
      opacity: 0,
      y: 0,
      scale: 1,
      willChange: "transform, opacity"
    })
    .set(refs.text, { opacity: 0, y: 0, willChange: "transform, opacity" })
    .set(refs.inner, {
      scale: 1,
      y: 0,
      willChange: "transform",
      force3D: true
    })
    .set([refs.doorLeft, refs.doorRight], {
      autoAlpha: 0,
      x: 0,
      willChange: "transform, opacity"
    });

  tl.to(refs.inner, {
    scale: isMobile ? 4.0 : 5.5,
    y: isMobile ? 0 : "25vh",
    transformOrigin: isMobile
      ? "center 50%"
      : isTablet
      ? "center 62%"
      : "center 45%",
    ease: "power2.inOut",
    duration: 3,
    force3D: true
  })
    .to(
      refs.rainbow,
      {
        scale: isMobile ? 2.3 : 2,
        ease: "power2.inOut",
        duration: 3,
        force3D: true
      },
      "<"
    )
    .fromTo(
      refs.doorContainer,
      { scale: 1 },
      {
        scale: isMobile ? 1 : 1,
        ease: "power2.inOut",
        duration: 3,
        force3D: true
      },
      "<"
    )
    .to(
      refs.rainbow,
      {
        scale: isMobile ? 3.8 : 4.5,
        duration: 0.5,
        ease: "power2.in",
        force3D: true
      },
      "-=0.4"
    )
    .to(
      refs.cube,
      {
        autoAlpha: 0,
        duration: 0.6,
        ease: "power1.in"
      },
      "<"
    )
    .set(
      [refs.doorLeft, refs.doorRight],
      {
        opacity: 1,
        autoAlpha: 1,
        x: 0
      },
      "<"
    )
    .to(
      ".door-full",
      {
        autoAlpha: 0,
        duration: 0.01
      },
      "<0.02"
    )
    .to(refs.rainbow, {
      opacity: 0,
      duration: 0.3,
      ease: "power1.out"
    })
    // Fade in door closeup as rainbow fades out
    .fromTo(
      refs.doorCloseup,
      {
        opacity: 0,
        scale: 1,
        filter: "blur(0px)"
      },
      {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.6,
        ease: "power2.out",
        force3D: true
      },
      "-=0.2"
    )
    .to(
      refs.doorLeft,
      {
        x: isMobile ? "-40vw" : "-25vw",
        duration: 1,
        opacity: 1,
        ease: "power2.out"
      },
      "-=0.4" // start door split while closeup is still fading in
    )
    .to(
      refs.doorRight,
      {
        x: isMobile ? "40vw" : "25vw",
        duration: 1,
        opacity: 1,
        ease: "power2.out"
      },
      "<"
    )
    .to(
      [refs.doorLeft, refs.doorRight],
      {
        opacity: 0,
        duration: 0.3,
        ease: "power1.out"
      },
      "-=0.2"
    )
    .set(refs.rainbow, { opacity: 0, pointerEvents: "none" });

  // tl.to({}, { duration: 0.5 })
  //   .to(refs.lottie, {
  //     opacity: 1,
  //     duration: 0.3,
  //     ease: "power1.out",
  //     force3D: true,
  //     onStart: () => {
  //       if (refs.playLottie) refs.playLottie();
  //     }
  //   })
  //   .to({}, { duration: 1.5 })
  //   .to(refs.lottie, {
  //     y: isMobile ? "-12vh" : "-15vh",
  //     duration: 0.3,
  //     ease: "power2.out",
  //     force3D: true
  //   })
  //   .fromTo(
  //     refs.text,
  //     {
  //       opacity: 0,
  //       y: isMobile ? "12vh" : "14vh"
  //     },
  //     {
  //       opacity: 1,
  //       y: isMobile ? "4vh" : "20vh",
  //       duration: 0.8,
  //       ease: "power2.out",
  //       force3D: true,
  //       onComplete: () => {
  //         // End the intro here when text is fully visible
  //         if (refs.onIntroComplete) {
  //           refs.onIntroComplete();
  //         }
  //       }
  //     },
  //     "-=0.2"
  //   );

  tl.to({}, { duration: 0.5 })
    .to(refs.lottie, {
      opacity: 1,
      duration: 0.3,
      ease: "power1.out",
      force3D: true,
      onStart: () => {
        if (refs.playLottie) refs.playLottie();
      }
    })
    .to({}, { duration: 1.5 })
    .to(refs.lottie, {
      y: isMobile ? "-16vh" : "-20vh", // move lottie higher
      duration: 0.3,
      ease: "power2.out",
      force3D: true
    })
    .fromTo(
      refs.text,
      {
        opacity: 0,
        y: isMobile ? "6vh" : "10vh" // start text closer
      },
      {
        opacity: 1,
        y: isMobile ? "-2vh" : "10vh", // final position closer to lottie
        duration: 0.8,
        ease: "power2.out",
        force3D: true
      },
      "-=0.2"
    )
    .add(() => {
      // Lock all elements in their final positions
      gsap.set(refs.doorCloseup, { opacity: 1, scale: 1, filter: "blur(0px)" });
      gsap.set(refs.lottie, { opacity: 1, y: isMobile ? "-16vh" : "-20vh" }); // UPDATED
      gsap.set(refs.text, { opacity: 1, y: isMobile ? "-2vh" : "10vh" }); // UPDATED
      gsap.set([refs.doorLeft, refs.doorRight], { opacity: 0 });
      gsap.set(refs.rainbow, { opacity: 0 });
      gsap.set(refs.cube, { autoAlpha: 0 });

      if (refs.onIntroComplete) {
        refs.onIntroComplete();
      }
    });
  // .to({}, { duration: 0.5 })
  // .set([refs.lottie, refs.text], {
  //   // Keep these elements visible and in place
  //   // The master timeline will handle fading out the entire Scene1
  // })
  // .call(() => {
  //   if (refs.onIntroComplete) {
  //     refs.onIntroComplete();
  //   }
  // });

  // REMOVED: The fade out animations that were causing the black screen
  // .to({}, { duration: 1 })
  // .to([refs.lottie, refs.text], {
  //   opacity: 0,
  //   duration: 0.2,
  //   ease: "power2.out",
  //   force3D: true
  // });

  return tl;
};

const Scene1Inner = ({ isMobile, onIntroComplete }, ref) => {
  const containerRef = useRef(null);
  const innerRef = useRef(null);
  const cubeRef = useRef(null);
  const rainbowRef = useRef(null);
  const doorCloseupRef = useRef(null);
  const doorContainerRef = useRef(null);
  const floorRef = useRef(null);
  const textRef = useRef(null);
  const lottieRef = useRef(null);
  const lottiePlayRef = useRef(() => {});
  const doorLeftHalfRef = useRef(null);
  const doorRightHalfRef = useRef(null);

  const [doorBottomOffset, setDoorBottomOffset] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [hasStartedIntro, setHasStartedIntro] = useState(false);
  const [showScrollArrows, setShowScrollArrows] = useState(false);

  const downArrowsRef = useRef(null);
  const introTlRef = useRef(null);

  // expose container to Home for fade-out transition
  useImperativeHandle(ref, () => ({
    container: containerRef.current
  }));

  const calculateDoorPosition = (width, height) => {
    if (width <= 768) {
      if (width <= 360) return height * 0.28;
      else if (width <= 375) return height * 0.29;
      else if (width <= 393) return height * 0.3;
      else if (width <= 414) return height * 0.3;
      else if (width <= 430) return height * 0.3;
      else if (width <= 540) return height * 0.3;
      else return height * 0.3;
    } else if (width <= 1368) {
      if (width <= 768) return height * 0.1;
      else if (width <= 820) return height * 0.1;
      else if (width <= 912) return height * 0.1;
      else return height * 0.15;
    } else {
      if (width <= 1280) return height * 0.3;
      else if (width <= 1440) return height * 0.23;
      else if (width <= 1920) return height * 0.23;
      else if (width <= 2560) return height * 0.23;
      else if (width <= 3440) return height * 0.23;
      else return height * 0.25;
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (isLocked) return;
      const offset = calculateDoorPosition(
        window.innerWidth,
        window.innerHeight
      );
      setDoorBottomOffset(offset);
    };

    handleResize();
    setIsLocked(true);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isLocked]);

  // idle rainbow + cube before intro starts
  useEffect(() => {
    if (hasStartedIntro) return;

    const ctx = gsap.context(() => {
      const rippleTimeline = gsap.to(rainbowRef.current, {
        scale: isMobile ? 1.08 : 1.06,
        ease: "sine.inOut",
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        willChange: "transform"
      });

      const floatCube = gsap.to(cubeRef.current, {
        y: -10,
        ease: "sine.inOut",
        duration: 2,
        repeat: -1,
        yoyo: true,
        willChange: "transform"
      });

      return () => {
        rippleTimeline.kill();
        floatCube.kill();
      };
    });

    return () => ctx.revert();
  }, [isMobile, hasStartedIntro]);

  // build intro timeline (paused)
  // build intro timeline (paused) - ONLY BUILD ONCE
  useLayoutEffect(() => {
    if (!containerRef.current || introTlRef.current) return; // Don't rebuild if already exists

    const refs = {
      inner: innerRef.current,
      cube: cubeRef.current,
      rainbow: rainbowRef.current,
      doorCloseup: doorCloseupRef.current,
      doorContainer: doorContainerRef.current,
      floor: floorRef.current,
      text: textRef.current,
      lottie: lottieRef.current,
      doorLeft: doorLeftHalfRef.current,
      doorRight: doorRightHalfRef.current,
      playLottie: () => lottiePlayRef.current(),
      onIntroComplete: () => {
        setShowScrollArrows(true);
        if (onIntroComplete) onIntroComplete();
      }
    };

    const ctx = gsap.context(() => {
      const tl = buildScene1Timeline(refs, isMobile);
      tl.pause(); // Don't force to position 0

      introTlRef.current = tl;
    }, containerRef);

    return () => {
      if (introTlRef.current) {
        introTlRef.current.kill();
        introTlRef.current = null;
      }
      ctx.revert();
    };
  }, [isMobile]); // Remove onIntroComplete from dependencies

  // pulsing 3 arrows after intro
  useEffect(() => {
    if (!showScrollArrows || !downArrowsRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        downArrowsRef.current,
        { y: 0, opacity: 0.7 },
        {
          y: 10,
          opacity: 1,
          repeat: -1,
          yoyo: true,
          duration: 0.6,
          ease: "sine.inOut"
        }
      );
    }, downArrowsRef);

    return () => ctx.revert();
  }, [showScrollArrows]);

  const handleScrollClick = () => {
    if (!introTlRef.current) return;
    setHasStartedIntro(true);
    introTlRef.current.restart();
    // introTlRef.current.play();
  };

  const showScrollButton = !hasStartedIntro && !showScrollArrows;

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
        {/* door + cube */}
        <div
          ref={doorContainerRef}
          className="absolute left-1/2 -translate-x-1/2 z-[2] flex justify-center"
          style={{
            bottom: `${doorBottomOffset}px`,
            willChange: "transform",
            transformOrigin: "center bottom",
            position: "absolute"
          }}
        >
          {/* rainbow behind door */}
          <img
            ref={rainbowRef}
            src={purple_rainbow}
            alt="rainbow"
            className={
              isMobile
                ? "absolute left-[49%] -translate-x-1/2 bottom-[10%] w-[45vw] -z-10"
                : "absolute left-[49.2%] -translate-x-1/2 bottom-[10%] w-[22vw] -z-10"
            }
            style={{
              willChange: "transform, opacity",
              imageRendering: "-webkit-optimize-contrast",
              backfaceVisibility: "hidden"
            }}
          />

          {/* door wrapper */}
          <div
            className={
              isMobile
                ? "relative w-[65vw] min-w-[200px] max-w-[260px]"
                : "relative w-[24vw] min-w-[280px] max-w-[400px]"
            }
          >
            <img
              src={stairs_with_door}
              alt="door"
              className="door-full w-full h-auto relative"
            />

            <img
              ref={doorLeftHalfRef}
              src={stairs_with_door}
              alt="door left half"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              style={{
                clipPath: "inset(0 50% 0 0)",
                willChange: "transform, opacity"
              }}
            />

            <img
              ref={doorRightHalfRef}
              src={stairs_with_door}
              alt="door right half"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              style={{
                clipPath: "inset(0 0 0 50%)",
                willChange: "transform, opacity"
              }}
            />
          </div>

          {/* cube */}
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

        {/* floor */}
        <img
          ref={floorRef}
          src={isMobile ? floor_with_walls_mobile : floor_with_walls}
          alt="floor"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full z-[3]"
        />

        {/* scroll button (only before intro starts) */}
        {showScrollButton && (
          <img
            src={dive_in}
            alt="scroll button"
            onClick={handleScrollClick}
            className={
              isMobile
                ? "absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[20vw] z-[50] cursor-pointer"
                : "absolute bottom-[7%] left-1/2 -translate-x-1/2 w-[8vw] z-[50] cursor-pointer"
            }
          />
        )}
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
      {/* evolve cube morph lottie */}
      <div
        ref={lottieRef}
        className="absolute inset-0 z-[130] flex items-center justify-center pointer-events-none"
        style={{ willChange: "transform, opacity", opacity: 0 }}
      >
        <div className={isMobile ? "w-[300%]" : "w-[100vw]"}>
          <DotLottieReact
            src="https://lottie.host/07d82781-37a6-41c7-9250-1adf1c42956f/xdEKCbGV3S.lottie"
            loop={false}
            autoplay={false}
            dotLottieRefCallback={(instance) => {
              lottiePlayRef.current = () => instance?.play();
            }}
          />
        </div>
      </div>
      {/* welcome text */}
      <div className="absolute inset-0 z-[140] flex items-center justify-center pointer-events-none">
        <h2
          ref={textRef}
          className="font-[800] text-center text-[#DF0586]"
          style={{
            fontSize: getHeadingFontSize(),
            lineHeight: getHeadingLineHeight(),
            letterSpacing: "-0.03em",
            willChange: "transform, opacity"
          }}
        >
          welcome
          <br />
          to evolve
        </h2>
      </div>
      {/* 3 pulsing arrows (after intro) */}

      {/* 3 pulsing arrows (after intro) - positioned under text */}
      {showScrollArrows && (
        <div
          ref={downArrowsRef}
          className="absolute left-1/2 -translate-x-1/2 z-[150] pointer-events-none"
          style={{
            top: isMobile ? "66%" : "74%" // position relative to text
          }}
        >
          <svg
            width={isMobile ? "32" : "44"}
            height={isMobile ? "40" : "52"}
            viewBox="0 0 56 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Top chevron - most transparent */}
            <path
              d="M16 12L28 24L40 12"
              stroke="#000000"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.3"
            />

            {/* Middle chevron - medium transparency */}
            <path
              d="M16 28L28 40L40 28"
              stroke="#000000"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.6"
            />

            {/* Bottom chevron - most visible */}
            <path
              d="M16 44L28 56L40 44"
              stroke="#000000"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="1"
            />
          </svg>
        </div>
      )}
    </section>
  );
};

const Scene1 = forwardRef(Scene1Inner);
export default Scene1;
