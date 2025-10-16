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

// v2
import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  floor,
  left_wall,
  purple_rainbow,
  right_wall,
  stairs_with_door,
  evolve_cube,
  down_arrow,
  door_closeup,
  evolve_2d,
  floor_mobile,
  left_wall_mobile,
  right_wall_mobile,
  door_closeup_mobile
} from "../../assets/images/Home";

gsap.registerPlugin(ScrollTrigger);

const Scene1 = () => {
  const containerRef = useRef(null);
  const innerRef = useRef(null);
  const cubeRef = useRef(null);
  const rainbowRef = useRef(null);
  const arrowRef = useRef(null);
  const doorCloseupRef = useRef(null);
  const doorCubeRef = useRef(null);
  const evolveLogoRef = useRef(null);
  const welcomeTextRef = useRef(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // ✅ Fix viewport height issue
  useEffect(() => {
    const setVhUnit = () => {
      document.documentElement.style.setProperty(
        "--vh-unit",
        `${window.innerHeight * 0.01}px`
      );
      ScrollTrigger.refresh(); // refresh triggers on resize
    };
    setVhUnit();
    window.addEventListener("resize", setVhUnit);
    window.addEventListener("orientationchange", setVhUnit);
    return () => {
      window.removeEventListener("resize", setVhUnit);
      window.removeEventListener("orientationchange", setVhUnit);
    };
  }, []);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Preload critical images
  useEffect(() => {
    const imagesToPreload = isMobile
      ? [door_closeup_mobile, evolve_cube, evolve_2d, stairs_with_door]
      : [door_closeup, evolve_cube, evolve_2d, stairs_with_door];
    let loadedCount = 0;
    const total = imagesToPreload.length;
    imagesToPreload.forEach((src) => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount === total) setImagesLoaded(true);
      };
      img.src = src;
    });
  }, [isMobile]);

  useEffect(() => {
    if (!imagesLoaded) return;

    const ctx = gsap.context(() => {
      // Initial GSAP setup
      gsap.set(rainbowRef.current, { opacity: 1, scale: 1 });
      gsap.set(doorCloseupRef.current, { opacity: 0, scale: 1.1 });
      gsap.set(doorCubeRef.current, { opacity: 0 });
      gsap.set(evolveLogoRef.current, { opacity: 0 });
      gsap.set(welcomeTextRef.current, { opacity: 0, y: 30 });

      // Idle animations
      const idleRainbow = gsap.to(rainbowRef.current, {
        scale: 1.03,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      const idleCube = gsap.to(cubeRef.current, {
        y: -12,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      const idleArrow = gsap.to(arrowRef.current, {
        y: -12,
        duration: 1.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      // Get container dimensions
      const container = containerRef.current;
      const { width, height } = container.getBoundingClientRect();

      // Main scroll timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom+=200% top",
          scrub: 1.5,
          pin: true,
          anticipatePin: 1,
          markers: false,
          onEnter: () => idleRainbow.pause(),
          onLeaveBack: () => idleRainbow.resume(),
          onLeave: () => idleRainbow.resume(),
          onUpdate: (self) => {
            if (self.progress > 0.02) {
              gsap.to(arrowRef.current, {
                opacity: 0,
                y: height * 0.02,
                duration: 0.6,
                ease: "power2.out"
              });
            }
          }
        }
      });

      // Use container-relative values for scaling/movement
      tl.to(innerRef.current, {
        scale: isMobile ? width / 450 : width / 700,
        y: isMobile ? height * 0.3 : height * 0.27,
        transformOrigin: "center center",
        ease: "power2.inOut",
        duration: 3
      })
        .to(
          rainbowRef.current,
          {
            scale: isMobile ? width / 280 : width / 450,
            opacity: 1,
            duration: 3,
            ease: "power2.inOut"
          },
          "<"
        )
        .to(
          rainbowRef.current,
          {
            scale: isMobile ? width / 180 : width / 320,
            opacity: 0,
            duration: 1.2,
            ease: "power1.inOut"
          },
          "-=0.8"
        )
        .to([".left", ".right", ".floor"], {
          opacity: 0,
          duration: 1.2,
          ease: "power2.inOut"
        })
        .to([cubeRef.current, ".door"], {
          opacity: 0,
          duration: 0.8,
          ease: "power1.inOut"
        })
        .to(
          doorCloseupRef.current,
          { opacity: 1, scale: 1, duration: 1.5, ease: "power2.out" },
          "-=0.6"
        )
        .to(
          doorCubeRef.current,
          {
            opacity: 1,
            y: isMobile ? -height * 0.04 : -height * 0.05,
            duration: 0.8,
            ease: "power2.out"
          },
          "-=1.2"
        )
        .to(doorCubeRef.current, { y: 0, duration: 0.6, ease: "power2.in" })
        .to(doorCubeRef.current, {
          y: isMobile ? -height * 0.02 : -height * 0.03,
          duration: 0.6,
          ease: "power2.out"
        })
        .to(doorCubeRef.current, { y: 0, duration: 0.25, ease: "power2.in" })
        .to({}, { duration: 0.2 })
        .to(doorCubeRef.current, {
          y: isMobile ? -height * 0.08 : -height * 0.1,
          duration: 0.6,
          ease: "power2.out"
        })
        .to(doorCubeRef.current, { y: 0, duration: 0.8, ease: "power2.in" })
        .to(doorCubeRef.current, {
          scaleY: 0.4,
          scaleX: 1.5,
          duration: 0.6,
          ease: "power2.out"
        })
        .to(doorCubeRef.current, {
          scaleY: 1.6,
          scaleX: 0.4,
          duration: 0.15,
          ease: "power2.out"
        })
        .to(doorCubeRef.current, {
          scaleY: 1,
          scaleX: 1,
          duration: 0.1,
          ease: "power1.out"
        })
        .to(doorCubeRef.current, { opacity: 0, duration: 0.5 }, "morph")
        .to(
          evolveLogoRef.current,
          { opacity: 1, scale: 1.05, duration: 0.5, ease: "power2.inOut" },
          "morph"
        )
        .to(evolveLogoRef.current, {
          scale: 1,
          duration: 0.3,
          ease: "power1.out"
        })
        .to(evolveLogoRef.current, {
          y: isMobile ? -height * 0.08 : -height * 0.12,
          duration: 0.6,
          ease: "power2.out"
        })
        .to(
          welcomeTextRef.current,
          { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
          "-=0.4"
        );
    }, containerRef);

    return () => ctx.revert();
  }, [imagesLoaded, isMobile]);

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden bg-black will-change-transform"
      style={{
        height: "calc(100 * var(--vh-unit))",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        perspective: 1000
      }}
    >
      {!imagesLoaded && (
        <div className="absolute inset-0 flex items-center justify-center z-[200]">
          <div className="text-white text-xl">Loading...</div>
        </div>
      )}

      <div ref={innerRef} className="absolute inset-0 overflow-hidden">
        {/* 🌈 Rainbow */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 z-[2] ${
            isMobile
              ? "bottom-[calc(45*var(--vh-unit))]"
              : "bottom-[calc(38*var(--vh-unit))]"
          }`}
        >
          <img
            ref={rainbowRef}
            src={purple_rainbow}
            alt="rainbow"
            className={
              isMobile
                ? "w-[45vw] min-w-[180px] max-w-[220px] h-auto object-contain"
                : "w-[22vw] min-w-[280px] max-w-[380px] h-auto object-contain"
            }
          />
        </div>

        {/* 🚪 Door + cube */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 z-[5] ${
            isMobile
              ? "bottom-[calc(35*var(--vh-unit))]"
              : "bottom-[calc(25*var(--vh-unit))]"
          }`}
        >
          <img
            src={stairs_with_door}
            alt="door"
            className={
              isMobile
                ? "door w-[65vw] min-w-[200px] max-w-[260px] h-auto"
                : "door w-[24vw] min-w-[280px] max-w-[400px] h-auto"
            }
          />
          <img
            ref={cubeRef}
            src={evolve_cube}
            alt="evolve cube"
            className={
              isMobile
                ? "absolute bottom-1/2 left-1/2 -translate-x-1/2 w-[8vw] min-w-[45px] h-auto"
                : "absolute bottom-1/2 left-1/2 -translate-x-1/2 w-[3vw] min-w-[60px] h-auto"
            }
          />
        </div>

        {/* Walls */}
        {isMobile ? (
          <>
            <img
              src={left_wall_mobile}
              alt="left wall"
              className="left absolute left-0 bottom-2 h-full w-[12vw] object-cover object-right z-[20]"
            />
            <img
              src={right_wall_mobile}
              alt="right wall"
              className="right absolute right-0 bottom-0 h-full w-[14vw] object-cover object-left z-[20]"
            />
          </>
        ) : (
          <>
            <img
              src={left_wall}
              alt="left wall"
              className="left absolute left-0 bottom-[-4px] h-[104%] object-cover z-[20]"
            />
            <img
              src={right_wall}
              alt="right wall"
              className="right absolute right-0 bottom-0 h-[103%] object-cover z-[20]"
            />
          </>
        )}

        {/* Floor */}
        <img
          src={isMobile ? floor_mobile : floor}
          alt="floor"
          className={
            isMobile
              ? "floor absolute bottom-0 left-1/2 -translate-x-1/2 w-full z-[15]"
              : "floor absolute bottom-[-3px] left-1/2 -translate-x-1/2 w-[112%] z-[15]"
          }
        />

        {/* ⬇️ Arrow */}
        <img
          ref={arrowRef}
          src={down_arrow}
          alt="scroll down"
          className={`absolute left-1/2 -translate-x-1/2 opacity-100 z-[50] ${
            isMobile
              ? "bottom-[calc(10*var(--vh-unit))] w-[8vw]"
              : "bottom-[calc(8*var(--vh-unit))] w-[2.8vw]"
          }`}
        />
      </div>

      {/* Door Closeup */}
      <div
        ref={doorCloseupRef}
        className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none"
      >
        <img
          src={isMobile ? door_closeup_mobile : door_closeup}
          alt="door closeup"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Cube Morph */}
      <div className="absolute inset-0 z-[120] flex items-center justify-center pointer-events-none">
        <img
          ref={doorCubeRef}
          src={evolve_cube}
          alt="cube morph"
          className={
            isMobile
              ? "w-[22vw] min-w-[90px] max-w-[140px] h-auto"
              : "w-[12vw] min-w-[120px] max-w-[280px] h-auto"
          }
        />
      </div>

      {/* Evolve Logo */}
      <div className="absolute inset-0 z-[130] flex items-center justify-center pointer-events-none">
        <img
          ref={evolveLogoRef}
          src={evolve_2d}
          alt="evolve logo"
          className={
            isMobile
              ? "w-[22vw] min-w-[90px] max-w-[140px] h-auto"
              : "w-[12vw] min-w-[120px] max-w-[280px] h-auto"
          }
        />
      </div>

      {/* Welcome Text */}
      <div
        className={`absolute inset-0 z-[140] flex items-center justify-center pointer-events-none ${
          isMobile
            ? "pt-[calc(20*var(--vh-unit))]"
            : "pt-[calc(25*var(--vh-unit))]"
        }`}
      >
        <h2
          ref={welcomeTextRef}
          className={
            isMobile
              ? "font-[800] text-[clamp(40px,12vw,70px)] leading-[0.95] text-center text-[#DF0586] font-[Bricolage_Grotesque]"
              : "font-[800] text-[clamp(60px,8vw,140px)] leading-[0.95] text-center text-[#DF0586] font-[Bricolage_Grotesque]"
          }
        >
          welcome
          <br />
          to evolve
        </h2>
      </div>
    </section>
  );
};

export default Scene1;
