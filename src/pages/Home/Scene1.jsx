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
  door_closeup_mobile
} from "../../assets/images/Home";
import LottiePlayer from "../../components/LottiePlayer";

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
  if (w >= 1700) return "110px";
  if (h >= 1080) return "110px";
  if (h >= 900) return "100px";
  if (h >= 768) return "84px";

  return "84px";
};

const isTablet = (() => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  return w >= 700 && w <= 1380 && h >= 600 && h <= 1400;
})();

// build the intro timeline (play once, not scroll-based)
const buildScene1Timeline = (refs, isMobile) => {
  const tl = gsap.timeline();

  // ── Initial states ─────────────────────────────────────────
  tl.set(refs.rainbow, {
    opacity: 1,
    scale: 1,
    transformOrigin: "center center",
    willChange: "transform, opacity"
  })
    .set(refs.lottie, {
      opacity: 0,
      y: 0,
      scale: 1,
      willChange: "transform, opacity"
    })
    .set(refs.text, { opacity: 0, y: 0, willChange: "transform, opacity" })
    .set(refs.inner, { scale: 1, y: 0, willChange: "transform", force3D: true })
    .set([refs.doorLeft, refs.doorRight], {
      autoAlpha: 0,
      x: 0,
      willChange: "transform, opacity"
    });

  // ── PHASE 1: Cinematic zoom — room IS the destination ─────
  //
  // Absolute time map (seconds from tl start):
  //   0.0 – 3.0   room zooms in           (power3.inOut — smooth camera push)
  //   0.5 – 1.2   rainbow fades out EARLY — before it can scale big and bleed
  //                                         into the sides (this was the purple artifact)
  //   0.8 – 1.3   cube fades out          (visible naturally as we approach)
  //   1.9 – 2.5   door frame fades        (we "pass through" the doorway)
  //   3.0         zoom ends — room at peak scale IS the background for lottie/text

  tl.to(refs.inner, {
    // Scale 9 (desktop) / 7 (mobile) zooms deep enough into the door that
    // the visible slice is entirely within the door frame — no edges show.
    // Origin targets the door opening (~60% from top on desktop, ~65% mobile).
    scale: isMobile ? 15 : isTablet ? 15 : 18,
    y: 0,
    // transformOrigin: isMobile
    //   ? "center 65%"
    //   : isTablet
    //     ? "center 62%"
    //     : "center 60%",
    transformOrigin: isMobile
      ? "center 48.5%"
      : isTablet
        ? "center 62%"
        : // : "center 40%",
          "center 41%",
    ease: "power3.inOut",
    duration: 3.0,
    force3D: true
  })
    // Rainbow: fade out early before it gets large enough to bleed at the sides
    .to(refs.rainbow, { opacity: 0, duration: 0.7, ease: "power2.in" }, 0.5)
    // Cube + initial welcome text fade as we approach the door
    .to(
      [refs.cube, refs.welcomeInitialText],
      { autoAlpha: 0, duration: 0.5, ease: "power2.in" },
      0.8
    )
    // door-full stays visible — the zoomed door IS the background for lottie+text
    .set(refs.rainbow, { pointerEvents: "none" });

  // ── PHASE 3: Lottie plays + welcome text ──────────────────
  tl.to(refs.lottie, {
    opacity: 1,
    duration: 0.01,
    force3D: true,
    onStart: () => {
      if (refs.playLottie) refs.playLottie();
    }
  })
    .to({}, { duration: 1.5 })
    .to(refs.lottie, {
      y: isMobile ? "-16vh" : "-20vh",
      duration: 0.3,
      ease: "power2.out",
      force3D: true
    })
    .fromTo(
      refs.text,
      { opacity: 0, y: isMobile ? "6vh" : "10vh" },
      {
        opacity: 1,
        y: isMobile ? "-2vh" : "10vh",
        duration: 0.8,
        ease: "power2.out",
        force3D: true
      },
      "-=0.2"
    )
    .add(() => {
      gsap.set(refs.lottie, { opacity: 1, y: isMobile ? "-16vh" : "-20vh" });
      gsap.set(refs.text, { opacity: 1, y: isMobile ? "-2vh" : "10vh" });
      gsap.set([refs.doorLeft, refs.doorRight], { opacity: 0 });
      gsap.set(refs.rainbow, { opacity: 0 });
      gsap.set([refs.cube, refs.welcomeInitialText], { autoAlpha: 0 });
      if (refs.onIntroComplete) refs.onIntroComplete();
    });

  return tl;
};

const Scene1Inner = ({ isMobile, onIntroComplete }, ref) => {
  const isTabletPortrait = isMobile && window.innerWidth >= 600;

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
  const welcomeInitialTextRef = useRef(null);

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
      if (width >= 600) return height * 0.04; // tablet portrait (iPad, iPad Mini)
      if (width <= 360) return height * 0.28;
      else if (width <= 375) return height * 0.29;
      else if (width <= 393) return height * 0.3;
      else if (width <= 414) return height * 0.29;
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

  // build intro timeline (paused) - ONLY BUILD ONCE
  useLayoutEffect(() => {
    if (!containerRef.current || introTlRef.current) return;

    const refs = {
      inner: innerRef.current,
      cube: cubeRef.current,
      rainbow: rainbowRef.current,
      doorContainer: doorContainerRef.current,
      floor: floorRef.current,
      text: textRef.current,
      lottie: lottieRef.current,
      doorLeft: doorLeftHalfRef.current,
      doorRight: doorRightHalfRef.current,
      welcomeInitialText: welcomeInitialTextRef.current,
      playLottie: () => lottiePlayRef.current(),
      onIntroComplete: () => {
        setShowScrollArrows(true);
        if (onIntroComplete) onIntroComplete();
      }
    };

    const ctx = gsap.context(() => {
      const tl = buildScene1Timeline(refs, isMobile);
      tl.pause();

      introTlRef.current = tl;
    }, containerRef);

    return () => {
      if (introTlRef.current) {
        introTlRef.current.kill();
        introTlRef.current = null;
      }
      ctx.revert();
    };
  }, [isMobile]);

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
    setHasStartedIntro(true);
    if (onIntroComplete) onIntroComplete();
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
        style={{ willChange: "transform", backgroundColor: "#0d0a12" }}
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
              isTabletPortrait
                ? "absolute left-[49.2%] -translate-x-1/2 bottom-[10%] w-[32vw] -z-10"
                : isMobile
                  ? "absolute left-[49%] -translate-x-1/2 bottom-[10%] w-[45vw] -z-10"
                  : "absolute left-[49.2%] -translate-x-1/2 bottom-[10%] w-[22vw] -z-10"
            }
            style={{
              // willChange: "transform, opacity",
              // imageRendering: "-webkit-optimize-contrast",
              // backfaceVisibility: "hidden",
              transformOrigin: "center center"
            }}
          />

          {/* door wrapper */}
          <div
            className={
              isTabletPortrait
                ? "relative w-[32vw] min-w-[220px] max-w-[300px]"
                : isMobile
                  ? "relative w-[65vw] min-w-[200px] max-w-[260px]"
                  : "relative w-[24vw] min-w-[280px] max-w-[400px]"
            }
          >
            <img
              src={stairs_with_door}
              alt="door"
              className="door-full w-full h-auto relative"
              style={{
                // imageRendering: "crisp-edges",
                // backfaceVisibility: "hidden",
                // transform: "translateZ(0)"
                transformOrigin: "center bottom"
              }}
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
              isTabletPortrait
                ? "absolute bottom-[55%] left-1/2 -translate-x-1/2 w-[5vw]"
                : isMobile
                  ? "absolute bottom-[55%] left-1/2 -translate-x-1/2 w-[8vw]"
                  : "absolute bottom-[55%] left-1/2 -translate-x-1/2 w-[3vw]"
            }
            style={{
              transformOrigin: "center center"
            }}
          />

          {/* welcome text — visible in initial state, inside the yellow door, below the cube */}
          <div
            ref={welcomeInitialTextRef}
            className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none z-10"
            style={{
              bottom: isTabletPortrait ? "45%" : isMobile ? "48%" : "48%",
              willChange: "transform, opacity"
            }}
          >
            <p
              className="font-extrabold text-[#DF0586]"
              style={{
                fontSize: isTabletPortrait
                  ? "clamp(7px, 1.1vw, 13px)"
                  : isMobile
                    ? "clamp(8px, 3.2vw, 14px)"
                    : "clamp(12px, 3.5vw, 20px)",
                lineHeight: "0.8",
                letterSpacing: "-0.03em"
                // whiteSpace: "nowrap"
              }}
            >
              welcome
              <br />
              to evolve
            </p>
          </div>
        </div>

        {/* floor */}
        <img
          ref={floorRef}
          src={
            isMobile && !isTabletPortrait
              ? floor_with_walls_mobile
              : floor_with_walls
          }
          alt="floor"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full z-[3]"
        />

        {/* scroll button (only before intro starts) */}
        {showScrollButton && (
          <div
            className={
              isTabletPortrait
                ? "absolute bottom-[4%] left-1/2 -translate-x-1/2 z-[50]"
                : isMobile
                  ? "absolute bottom-[18%] left-1/2 -translate-x-1/2 z-[50]"
                  : "absolute bottom-[7%] left-1/2 -translate-x-1/2 z-[50]"
            }
          >
            <button
              onClick={handleScrollClick}
              className="rounded-full font-black text-[#161616] cursor-pointer select-none"
              style={{
                background: "#FFD007",
                border: "1.5px solid #161616",
                boxShadow: "4px 5px 0 0 #161616",
                padding: isMobile
                  ? "clamp(8px,3vw,12px) clamp(16px,5vw,24px)"
                  : "clamp(9px,0.9vw,14px) clamp(18px,2.2vw,32px)",
                fontSize: isMobile
                  ? "clamp(12px,4vw,16px)"
                  : "clamp(11px,1.05vw,16px)",
                letterSpacing: "-0.02em",
                transition:
                  "transform 0.08s, box-shadow 0.08s, background 0.08s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#FFDC47";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#FFD007";
                e.currentTarget.style.transform = "";
                e.currentTarget.style.boxShadow = "4px 5px 0 0 #161616";
              }}
              // onMouseDown={(e) => {
              //   // e.currentTarget.style.transform = "translate(4px, 5px)";
              //   e.currentTarget.style.boxShadow = "0 0 0 0 #161616";
              // }}
              // onMouseUp={(e) => {
              //   e.currentTarget.style.transform = "";
              //   e.currentTarget.style.boxShadow = "4px 5px 0 0 #161616";
              // }}
            >
              dive in
            </button>
          </div>
        )}
      </div>

      {/* evolve cube morph lottie */}
      {/* <div
        ref={lottieRef}
        className="absolute inset-0 z-[130] flex items-center justify-center pointer-events-none"
        style={{ willChange: "transform, opacity", opacity: 0 }}
      >
        <div className={isMobile ? "w-[300%]" : "w-[100vw]"}>
          <LottiePlayer
            src="https://lottie.host/07d82781-37a6-41c7-9250-1adf1c42956f/xdEKCbGV3S.lottie"
            loop={false}
            autoplay={false}
            dotLottieRefCallback={(instance) => {
              lottiePlayRef.current = () => instance?.play();
            }}
          />
        </div>
      </div> */}
      <div
        ref={lottieRef}
        className="absolute inset-0 z-[130] flex items-center justify-center pointer-events-none"
        style={{ willChange: "transform, opacity", opacity: 0 }}
      >
        <div
          className="w-[100vw]"
          style={
            isMobile
              ? {
                  transform: "scale(1.6)", // 🔥 make it visually bigger on mobile
                  transformOrigin: "center center"
                }
              : {}
          }
        >
          <LottiePlayer
            src="https://lottie.host/07d82781-37a6-41c7-9250-1adf1c42956f/xdEKCbGV3S.lottie"
            loop={false}
            autoplay={false}
            style={{
              width: "100%", // fill wrapper
              height: "auto",
              display: "block"
            }}
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
      {showScrollArrows && (
        <div
          ref={downArrowsRef}
          className="absolute left-1/2 -translate-x-1/2 z-[150] pointer-events-none"
          style={{
            top: isMobile ? "66%" : "74%"
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
