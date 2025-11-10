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
      scale: 1.1,
      willChange: "transform, opacity"
    })
    .set(refs.doorCube, { opacity: 0, willChange: "transform" })
    .set(refs.evolveLogo, {
      opacity: 0,
      y: 0,
      willChange: "transform, opacity"
    })
    .set(refs.text, { opacity: 0, y: 0, willChange: "transform, opacity" })
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
    transformOrigin: "center 62%",
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

    // 🎬 AUTO-PLAY SECTION STARTS HERE (add extra duration for scroll buffer)
    .to({}, { duration: 0.5 }) // Buffer to ensure scroll completes

    // Cube bounce animation
    .to(refs.doorCube, {
      opacity: 1,
      y: isMobile ? -25 : -35,
      duration: 0.6,
      ease: "power2.out",
      force3D: true
    })
    .to(refs.doorCube, {
      y: 0,
      duration: 0.5,
      ease: "back.out(2)",
      force3D: true
    })
    .to(refs.doorCube, {
      y: isMobile ? -15 : -20,
      duration: 0.4,
      ease: "power2.out",
      force3D: true
    })
    .to(refs.doorCube, {
      y: 0,
      duration: 0.3,
      ease: "bounce.out",
      force3D: true
    })

    // Morph: cube fades out
    .to(refs.doorCube, {
      opacity: 0,
      scale: 0.9,
      duration: 0.3,
      ease: "power2.in",
      force3D: true
    })

    // 2D logo appears in center
    .to(
      refs.evolveLogo,
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.4,
        ease: "back.out(1.4)",
        force3D: true
      },
      "-=0.1"
    )

    // Logo moves UP to make space for text (using viewport units for consistency)
    .to(refs.evolveLogo, {
      y: isMobile ? "-12vh" : "-15vh",
      duration: 0.6,
      ease: "power2.out",
      force3D: true
    })

    // Text appears below the logo (using viewport units for consistency)
    .to(
      refs.text,
      {
        opacity: 1,
        y: isMobile ? "4vh" : "15vh",
        duration: 0.8,
        ease: "power2.out",
        force3D: true
      },
      "-=0.4"
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
      {/* <div className="absolute inset-0 z-[140] flex items-center justify-center pointer-events-none pt-[35vh]"> */}
      <div className="absolute inset-0 z-[140] flex items-center justify-center pointer-events-none">
        {/* Added pt-[35vh] to push text down and create gap below logo */}
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
