import React, { useRef, useState, useEffect } from "react";
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
  evolve_2d
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
    if (h >= 812) return "64px"; // mobile 812 & above
    if (h >= 736) return "56px"; // mobile 736
    if (h >= 667) return "56px"; // mobile 667
    return "48px"; // fallback small phones
  }

  // ------- DESKTOP -------
  if (w >= 1700) return "128px"; // desktop-wide
  if (h >= 1080) return "124px"; // desktop-tall
  if (h >= 900) return "110px"; // desktop-base
  if (h >= 768) return "96px"; // desktop-compact

  return "96px"; // fallback
};

const getHeadingLineHeight = () => {
  const w = window.innerWidth;
  const h = window.innerHeight;

  // ------- MOBILE -------
  if (w < 768) {
    if (h >= 812) return "56px"; // mobile 812+
    if (h >= 736) return "52px"; // mobile 736
    if (h >= 667) return "52px"; // mobile 667
    return "48px";
  }

  // ------- DESKTOP -------
  if (w >= 1700) return "128px"; // desktop-wide
  if (h >= 1080) return "128px"; // desktop-tall
  if (h >= 900) return "120px"; // desktop-base
  if (h >= 768) return "92px"; // desktop-compact

  return "92px"; // fallback
};

// 🎥 OPTIMIZED TIMELINE - GPU acceleration
// export const useScene1Timeline = (refs, isMobile) => {
//   const tl = gsap.timeline();

//   // initial state
//   tl.set(refs.rainbow, {
//     opacity: 1,
//     scale: 1,
//     transformOrigin: "center center",
//     willChange: "transform, opacity"
//   })
//     // .set(refs.doorCloseup, {
//     //   opacity: 0,
//     //   scale: 1.1,
//     //   willChange: "transform, opacity"
//     // })
//     .set(refs.doorCloseup, {
//       opacity: 0,
//       scale: 1.15, // Changed from 1.1
//       filter: "blur(8px)", // Add initial blur
//       willChange: "transform, opacity, filter"
//     })
//     .set(refs.doorCube, { opacity: 0, willChange: "transform" })
//     .set(refs.evolveLogo, {
//       opacity: 0,
//       y: 0,
//       willChange: "transform, opacity"
//     })
//     .set(refs.text, { opacity: 0, y: 0, willChange: "transform, opacity" })
//     .set(refs.inner, {
//       scale: 1,
//       y: 0,
//       willChange: "transform",
//       force3D: true
//     });

//   // main animation sequence - use force3D for GPU rendering
//   tl.to(refs.inner, {
//     scale: isMobile ? 3.2 : 5.5,
//     y: isMobile ? 0 : "25vh", // NO y translation for mobile
//     transformOrigin: isMobile ? "center 50%" : "center 45%", // Scale from bottom for mobile
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
//         scale: isMobile ? 1 : 1, // 1/3.2 = 0.3125 to counteract the 3.2x scale
//         ease: "power2.inOut",
//         duration: 3,
//         force3D: true
//       },
//       "<"
//     )
//     .to(
//       refs.rainbow,
//       {
//         scale: isMobile ? 3.8 : 4.5, // Much larger scale for desktop to hide walls
//         opacity: 0, // Rainbow fades out during zoom
//         duration: 0.5,
//         ease: "power2.in",
//         force3D: true
//       },
//       "-=0.4"
//     )
//     // Door and cube fade out at same time as rainbow
//     .to(
//       [refs.cube, ".door"],
//       {
//         opacity: 0,
//         // duration: 1.0, // Slightly longer fade
//         duration: 0, // Slightly longer fade
//         ease: "power1.in"
//       },
//       "<" // Start at same time as rainbow fade
//     )
//     // Door closeup starts fading in EARLY during the zoom
//     .fromTo(
//       refs.doorCloseup,
//       {
//         opacity: 0,
//         scale: 1, // Start slightly larger
//         filter: "blur(8px)" // Start blurred for depth effect
//       },
//       {
//         opacity: 1,
//         scale: 1,
//         filter: "blur(0px)",
//         // duration: 1,
//         duration: 0,
//         ease: "power2.out",
//         force3D: true
//       },
//       "-=1.1" // Start while zoom is happening - key for seamlessness
//     )
//     .set(refs.rainbow, { opacity: 0, pointerEvents: "none" })
//     // Cube appears after door is fully visible
//     .to(
//       refs.doorCube,
//       {
//         opacity: 1,
//         // duration: 0.5,
//         duration: 0.2,
//         ease: "power1.out",
//         force3D: true
//       },
//       "-=0.3"
//     )
//     // 🎬 AUTO-PLAY SECTION STARTS HERE (add extra duration for scroll buffer)
//     .to({}, { duration: 0.5 }) // Buffer to ensure scroll completes

//     // Cube bounce animation
//     .to(refs.doorCube, {
//       y: isMobile ? -25 : -35,
//       duration: 0.6,
//       ease: "power2.out",
//       force3D: true
//     })
//     .to(refs.doorCube, {
//       y: 0,
//       duration: 0.5,
//       ease: "back.out(2)",
//       force3D: true
//     })
//     .to(refs.doorCube, {
//       y: isMobile ? -15 : -20,
//       duration: 0.4,
//       ease: "power2.out",
//       force3D: true
//     })
//     .to(refs.doorCube, {
//       y: 0,
//       duration: 0.3,
//       ease: "bounce.out",
//       force3D: true
//     })

//     // Morph: cube fades out
//     .to(refs.doorCube, {
//       opacity: 0,
//       scale: 0.9,
//       duration: 0.3,
//       ease: "power2.in",
//       force3D: true
//     })

//     // 2D logo appears in center
//     .to(
//       refs.evolveLogo,
//       {
//         opacity: 1,
//         scale: 1,
//         y: 0,
//         duration: 0.4,
//         ease: "back.out(1.4)",
//         force3D: true
//       },
//       "-=0.1"
//     )

//     // Logo moves UP to make space for text
//     .to(refs.evolveLogo, {
//       y: isMobile ? "-12vh" : "-15vh",
//       duration: 0.6,
//       ease: "power2.out",
//       force3D: true
//     })

//     // Text appears below the logo - NO animation, just instant display
//     // .set(refs.text, {
//     //   opacity: 1,
//     //   y: isMobile ? "4vh" : "15vh"
//     // })

//     // Text appears below the logo with subtle slide up
//     .fromTo(
//       refs.text,
//       {
//         opacity: 0,
//         y: isMobile ? "8vh" : "20vh" // Start lower
//       },
//       {
//         opacity: 1,
//         y: isMobile ? "4vh" : "15vh", // End position
//         duration: 0.8,
//         ease: "power2.out",
//         force3D: true
//       },
//       "-=0.2" // Slight overlap with logo movement
//     )

//     // Hold for a moment
//     .to({}, { duration: 1 })

//     // Exit animation: Simply fade out text and logo - KEEP door_closeup visible
//     .to([refs.evolveLogo, refs.text], {
//       opacity: 0,
//       duration: 0.6,
//       ease: "power2.out",
//       force3D: true
//     });

//   return tl;
// };

// 🎥 OPTIMIZED TIMELINE - GPU acceleration
export const useScene1Timeline = (refs, isMobile) => {
  const tl = gsap.timeline();

  // initial state
  tl.set(refs.rainbow, {
    opacity: 1,
    scale: 1,
    transformOrigin: "center center",
    willChange: "transform, opacity"
  })
    .set(refs.doorCloseup, {
      opacity: 0,
      scale: 1.15,
      filter: "blur(8px)",
      willChange: "transform, opacity, filter"
    })
    // 🔁 lottie wrapper initial state
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
    });

  // main animation sequence
  tl.to(refs.inner, {
    scale: isMobile ? 3.2 : 5.5,
    y: isMobile ? 0 : "25vh",
    transformOrigin: isMobile ? "center 50%" : "center 45%",
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
      {
        scale: 1
      },
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
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
        force3D: true
      },
      "-=0.4"
    )
    .to(
      [refs.cube, ".door"],
      {
        opacity: 0,
        duration: 0,
        ease: "power1.in"
      },
      "<"
    )
    .fromTo(
      refs.doorCloseup,
      {
        opacity: 0,
        scale: 1,
        filter: "blur(8px)"
      },
      {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        duration: 0,
        ease: "power2.out",
        force3D: true
      },
      "-=1.1"
    )
    .set(refs.rainbow, { opacity: 0, pointerEvents: "none" });

  tl
    // 🎬 AUTO-PLAY SECTION STARTS HERE (add extra duration for scroll buffer)
    .to({}, { duration: 0.5 })

    // ⭐ show lottie and start animation once
    .to(refs.lottie, {
      opacity: 1,
      duration: 0.3,
      ease: "power1.out",
      force3D: true,
      onStart: () => {
        if (refs.playLottie) {
          refs.playLottie(); // 🔥 start lottie exactly now
        }
      }
    })

    // give lottie some time to play its morph (tweak this to match length)
    .to({}, { duration: 1.5 })

    // move lottie up to make space for text
    .to(refs.lottie, {
      y: isMobile ? "-12vh" : "-15vh",
      duration: 0.3,
      ease: "power2.out",
      force3D: true
    })

    .fromTo(
      refs.text,
      {
        opacity: 0,
        y: isMobile ? "12vh" : "14vh"
      },
      {
        opacity: 1,
        y: isMobile ? "4vh" : "20vh",
        duration: 0.8,
        ease: "power2.out",
        force3D: true
      },
      "-=0.2"
    )

    .to({}, { duration: 1 })

    .to([refs.lottie, refs.text], {
      opacity: 0,
      duration: 0.2,
      ease: "power2.out",
      force3D: true
    });

  return tl;
};

// 🎨 Scene visuals
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
//   const doorContainerRef = useRef(null);
//   const floorRef = useRef(null);

//   const [doorBottomOffset, setDoorBottomOffset] = useState(0);
//   const [isLocked, setIsLocked] = useState(false); // ADD THIS

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

//   // 🔁 new: lottie wrapper
//   const lottieRef = useRef(null);

//   const [doorBottomOffset, setDoorBottomOffset] = useState(0);
//   const [isLocked, setIsLocked] = useState(false);

const Scene1 = React.forwardRef((props, ref) => {
  const { isMobile } = props;
  const containerRef = useRef(null);
  const innerRef = useRef(null);
  const cubeRef = useRef(null);
  const rainbowRef = useRef(null);
  const arrowRef = useRef(null);
  const doorCloseupRef = useRef(null);
  const doorContainerRef = useRef(null);
  const floorRef = useRef(null);
  const textRef = useRef(null);

  // 🔁 lottie wrapper
  const lottieRef = useRef(null);

  // 🔁 function ref to trigger play later
  const lottiePlayRef = useRef(() => {});

  const [doorBottomOffset, setDoorBottomOffset] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  // // Calculate door position based on screen size
  // const calculateDoorPosition = (width, height) => {
  //   if (width <= 768) {
  //     if (width <= 360) return height * 0.28;
  //     else if (width <= 430) return height * 0.3;
  //     else if (width <= 540) return height * 0.3;
  //     else return height * 0.3;
  //   } else {
  //     if (width <= 1024) return height * 0.2;
  //     else if (width >= 2560) return height * 0.2;
  //     else return height * 0.21;
  //   }
  // };

  // useEffect(() => {
  //   const handleResize = () => {
  //     if (isLocked) return; // Don't recalculate if locked

  //     const offset = calculateDoorPosition(
  //       window.innerWidth,
  //       window.innerHeight
  //     );
  //     setDoorBottomOffset(offset);
  //   };

  //   handleResize();
  //   setIsLocked(true); // Lock after first calculation

  //   window.addEventListener("resize", handleResize);
  //   return () => window.removeEventListener("resize", handleResize);
  // }, [isLocked]);

  // Calculate door position based on screen size
  const calculateDoorPosition = (width, height) => {
    if (width <= 768) {
      // Mobile devices
      if (width <= 360)
        return height * 0.28; // Small phones (Galaxy Fold, iPhone SE)
      else if (width <= 375) return height * 0.29; // iPhone 13 Mini, iPhone SE
      else if (width <= 393)
        return height * 0.3; // iPhone 14 Pro, iPhone 15 Pro (Safari)
      else if (width <= 414)
        return height * 0.3; // iPhone 14 Plus, iPhone 15 Plus
      else if (width <= 430)
        return height * 0.3; // iPhone 14 Pro Max, iPhone 15 Pro Max
      else if (width <= 540) return height * 0.3; // Surface Duo
      else return height * 0.3; // Large phones/small tablets
    } else if (width <= 1024) {
      // Tablets
      if (width <= 768) return height * 0.2; // iPad Mini, iPad portrait
      else if (width <= 820) return height * 0.2; // iPad Air portrait
      else if (width <= 912) return height * 0.2; // Surface Pro portrait
      else return height * 0.2; // Tablet landscape
    } else {
      // Desktop
      if (width <= 1280) return height * 0.21; // Small laptops (1024-1280)
      else if (width <= 1440) return height * 0.21; // Standard laptops (HD+)
      else if (width <= 1920) return height * 0.21; // Full HD
      else if (width <= 2560) return height * 0.2; // 2K monitors
      else if (width <= 3440) return height * 0.2; // Ultrawide monitors
      else return height * 0.2; // 4K and above
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (isLocked) return; // Don't recalculate if locked

      const offset = calculateDoorPosition(
        window.innerWidth,
        window.innerHeight
      );
      setDoorBottomOffset(offset);
    };

    handleResize();
    setIsLocked(true); // Lock after first calculation

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isLocked]);

  // Idle animations - only before scroll starts
  // idle animation uses cubeRef as before, no change
  useEffect(() => {
    const ctx = gsap.context(() => {
      const rippleTimeline = gsap.to(rainbowRef.current, {
        scale: isMobile ? 1.08 : 1.06,
        ease: "sine.inOut",
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        willChange: "transform"
      });

      gsap.to(cubeRef.current, {
        y: -10,
        ease: "sine.inOut",
        duration: 2,
        repeat: -1,
        yoyo: true,
        willChange: "transform"
      });

      return rippleTimeline;
    });

    return () => ctx.revert();
  }, [isMobile]);

  // React.useImperativeHandle(ref, () => ({
  //   container: containerRef.current,
  //   inner: innerRef.current,
  //   cube: cubeRef.current,
  //   rainbow: rainbowRef.current,
  //   arrow: arrowRef.current,
  //   doorCloseup: doorCloseupRef.current,
  //   doorCube: doorCubeRef.current,
  //   evolveLogo: evolveLogoRef.current,
  //   text: textRef.current,
  //   floor: floorRef.current,
  //   doorContainer: doorContainerRef.current
  // }));
  React.useImperativeHandle(ref, () => ({
    container: containerRef.current,
    inner: innerRef.current,
    cube: cubeRef.current,
    rainbow: rainbowRef.current,
    arrow: arrowRef.current,
    doorCloseup: doorCloseupRef.current,
    floor: floorRef.current,
    doorContainer: doorContainerRef.current,
    text: textRef.current,
    lottie: lottieRef.current,
    // 👉 gsap will call this to start the animation
    playLottie: () => lottiePlayRef.current()
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
        {/* <img
          ref={rainbowRef}
          src={purple_rainbow}
          alt="rainbow"
          className={
            isMobile
              ? "absolute left-1/2 -translate-x-1/2 bottom-[38%] w-[45vw]"
              : "absolute left-1/2 -translate-x-1/2 bottom-[38%] w-[22vw]"
          }
          style={{ willChange: "transform, opacity" }}
        /> */}
        {/* <img
          ref={rainbowRef}
          src={purple_rainbow}
          alt="rainbow"
          className={
            isMobile
              ? "absolute left-1/2 -translate-x-1/2 bottom-[38%] w-[45vw]"
              : "absolute left-1/2 -translate-x-1/2 bottom-[38%] w-[22vw]"
          }
          style={{
            willChange: "transform, opacity",
            imageRendering: "-webkit-optimize-contrast",
            backfaceVisibility: "hidden"
            // transform: "translateZ(0)"
          }}
        /> */}
        {/* 🚪 door + cube */}
        {/* 🚪 door + cube */}
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
          {/* 🌈 rainbow behind door, centered relative to door */}
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

          {/* door on top of rainbow */}
          <img
            src={stairs_with_door}
            alt="door"
            className={
              isMobile
                ? "door w-[65vw] min-w-[200px] max-w-[260px] relative"
                : "door w-[24vw] min-w-[280px] max-w-[400px] relative"
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
        {/* 📜 scroll indicator - replaced down_arrow */}
        <img
          ref={arrowRef}
          src={scroll}
          alt="scroll"
          className={
            isMobile
              ? "absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[12vw] z-[50]"
              : "absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[6vw] z-[50]"
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
      {/* evolve cube → logo lottie */}
      {/* <div
        ref={lottieRef}
        className="absolute inset-0 z-[130] flex items-center justify-center pointer-events-none"
        style={{ willChange: "transform, opacity", opacity: 0 }}
      >
        <div className={isMobile ? "w-[48vw]" : "w-[48vw]"}>
          <DotLottieReact
            src="https://lottie.host/e6178cb6-f404-4ff2-a706-224dfb4904d1/sqmki3Tynt.lottie"
            loop
            autoplay
          />
        </div>
      </div> */}
      <div
        ref={lottieRef}
        className="absolute inset-0 z-[130] flex items-center justify-center pointer-events-none"
        style={{ willChange: "transform, opacity", opacity: 0 }}
      >
        <div className={isMobile ? "w-[200%]" : "w-[100vw]"}>
          <DotLottieReact
            src="https://lottie.host/e6178cb6-f404-4ff2-a706-224dfb4904d1/sqmki3Tynt.lottie"
            loop={false}
            autoplay={false}
            dotLottieRefCallback={(instance) => {
              // store a play function we can call from GSAP
              lottiePlayRef.current = () => instance?.play();
            }}
          />
        </div>
      </div>

      {/* text - updated with new typography specs */}
      <div className="absolute inset-0 z-[140] flex items-center justify-center pointer-events-none">
        <h2
          ref={textRef}
          className="font-[800] text-center text-[#DF0586]"
          style={{
            fontSize: getHeadingFontSize(), // auto from function
            lineHeight: getHeadingLineHeight(), // auto from function
            letterSpacing: "-0.03em",
            willChange: "transform, opacity"
          }}
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
