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
  door_closeup,
  door_closeup_mobile,
  dive_in,
  dive_in_hover,
  logo_main
} from "../../assets/images/Home";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const getHeadingFontSize = () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (w < 768) {
    if (h >= 812) return "64px";
    if (h >= 736) return "56px";
    if (h >= 667) return "56px";
    return "48px";
  }
  if (w >= 1700) return "128px";
  if (h >= 1080) return "124px";
  if (h >= 900) return "110px";
  if (h >= 768) return "96px";
  return "96px";
};

const getHeadingLineHeight = () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (w < 768) {
    if (h >= 812) return "56px";
    if (h >= 736) return "52px";
    if (h >= 667) return "52px";
    return "48px";
  }
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

const buildScene1Timeline = (refs, isMobile) => {
  const tl = gsap.timeline();

  tl.set(refs.rainbow, {
    opacity: 1,
    scale: 1,
    transformOrigin: "center center",
    willChange: "transform, opacity"
  })
    .set(refs.doorCloseup, {
      opacity: 0,
      scale: 1,
      filter: "blur(8px)",
      willChange: "transform, opacity, filter",
      visibility: "hidden"
    })
    // sharedWrapper holds both lottie + logo — controls position/size/opacity together
    .set(refs.sharedWrapper, {
      opacity: 0,
      y: 0,
      willChange: "transform, opacity"
    })
    .set(refs.lottieEl, { opacity: 1 }) // lottie visible inside wrapper first
    .set(refs.logoEl, { opacity: 0 }) // logo hidden inside wrapper
    .set(refs.text, { opacity: 0, y: 0, willChange: "transform, opacity" })
    .set(refs.inner, { scale: 1, y: 0, willChange: "transform", force3D: true })
    .set([refs.doorLeft, refs.doorRight], { autoAlpha: 0, x: 0 });

  // Zoom in
  tl.to(refs.inner, {
    scale: isMobile ? 8.2 : 12,
    y: isMobile ? 0 : "25vh",
    transformOrigin: isMobile
      ? "center 48.5%"
      : isTablet
        ? "center 62%"
        : "center 40%",
    ease: "power4.inOut",
    duration: 3,
    force3D: false
  })
    .to(
      refs.rainbow,
      {
        scale: isMobile ? 4 : 6,
        ease: "power2.inOut",
        duration: 4,
        force3D: true
      },
      "<"
    )
    .to(refs.cube, { autoAlpha: 0, duration: 0.8, ease: "power2.in" }, "<0.5")
    .to(
      refs.doorCloseup,
      {
        visibility: "visible",
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        duration: 1.5,
        ease: "power2.inOut",
        force3D: true
      },
      "<1.2"
    )
    .to(refs.rainbow, { opacity: 0, duration: 1.2, ease: "power2.out" }, "<0.8")
    .to(".door-full", { autoAlpha: 0, duration: 1, ease: "power2.out" }, "<0.5")
    .set(refs.rainbow, { opacity: 0, pointerEvents: "none" });

  tl.to({}, { duration: 0.8 });

  // Shared wrapper fades in — lottie plays immediately
  tl.to(refs.sharedWrapper, {
    opacity: 1,
    duration: 0.3,
    ease: "power1.out",
    force3D: true,
    onStart: () => {
      if (refs.playLottie) refs.playLottie();
    }
  });

  // Wait for lottie to animate (it ends ON the logo shape — 1.8s approx)
  tl.to({}, { duration: 1.8 });

  // ── INSTANT swap: lottie out → logo in with NO delay between them ─────────
  // duration: 0.15 is fast enough to feel instant but avoids a hard flash
  tl.to(refs.lottieEl, { opacity: 0, duration: 0.15, ease: "none" }).to(
    refs.logoEl,
    { opacity: 1, duration: 0.15, ease: "none" },
    "<"
  );

  // Logo is now showing. Lift it up — NO extra pause before this.
  tl.to(refs.sharedWrapper, {
    y: isMobile ? "-16vh" : "-20vh",
    duration: 0.35,
    ease: "power2.out",
    force3D: true
  });

  // Welcome text fades in as logo lifts
  tl.fromTo(
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
  );

  // Lock final states
  tl.add(() => {
    gsap.set(refs.doorCloseup, { opacity: 1, scale: 1, filter: "blur(0px)" });
    gsap.set(refs.lottieEl, { opacity: 0 });
    gsap.set(refs.logoEl, { opacity: 1 });
    gsap.set(refs.sharedWrapper, {
      opacity: 1,
      y: isMobile ? "-16vh" : "-20vh"
    });
    gsap.set(refs.text, { opacity: 1, y: isMobile ? "-2vh" : "10vh" });
    gsap.set([refs.doorLeft, refs.doorRight], { opacity: 0 });
    gsap.set(refs.rainbow, { opacity: 0 });
    gsap.set(refs.cube, { autoAlpha: 0 });
    if (refs.onIntroComplete) refs.onIntroComplete();
  });

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

  // ONE wrapper for both lottie and logo — they swap opacity inside it
  const sharedWrapperRef = useRef(null);
  const lottieElRef = useRef(null);
  const logoElRef = useRef(null);
  const lottiePlayRef = useRef(() => {});

  const doorLeftHalfRef = useRef(null);
  const doorRightHalfRef = useRef(null);

  const [doorBottomOffset, setDoorBottomOffset] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [hasStartedIntro, setHasStartedIntro] = useState(false);
  const [showScrollArrows, setShowScrollArrows] = useState(false);

  const downArrowsRef = useRef(null);
  const introTlRef = useRef(null);

  // Expose sharedWrapper to Home — this is the element that gets
  // carried into SceneNew and the badge blooms around it
  useImperativeHandle(ref, () => ({
    container: containerRef.current,
    sharedWrapper: sharedWrapperRef.current
  }));

  const calculateDoorPosition = (w, h) => {
    if (w <= 768) {
      if (w <= 360) return h * 0.28;
      if (w <= 375) return h * 0.29;
      if (w <= 393) return h * 0.3;
      if (w <= 414) return h * 0.29;
      if (w <= 430) return h * 0.3;
      if (w <= 540) return h * 0.3;
      return h * 0.3;
    }
    if (w <= 1368) {
      if (w <= 768) return h * 0.1;
      if (w <= 820) return h * 0.1;
      if (w <= 912) return h * 0.1;
      return h * 0.15;
    }
    if (w <= 1280) return h * 0.3;
    if (w <= 1440) return h * 0.23;
    if (w <= 1920) return h * 0.23;
    if (w <= 2560) return h * 0.23;
    if (w <= 3440) return h * 0.23;
    return h * 0.25;
  };

  useEffect(() => {
    const handleResize = () => {
      if (isLocked) return;
      setDoorBottomOffset(
        calculateDoorPosition(window.innerWidth, window.innerHeight)
      );
    };
    handleResize();
    setIsLocked(true);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isLocked]);

  useEffect(() => {
    if (hasStartedIntro) return;
    const ctx = gsap.context(() => {
      gsap.to(rainbowRef.current, {
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
    });
    return () => ctx.revert();
  }, [isMobile, hasStartedIntro]);

  useLayoutEffect(() => {
    if (!containerRef.current || introTlRef.current) return;

    const refs = {
      inner: innerRef.current,
      cube: cubeRef.current,
      rainbow: rainbowRef.current,
      doorCloseup: doorCloseupRef.current,
      doorContainer: doorContainerRef.current,
      floor: floorRef.current,
      text: textRef.current,
      sharedWrapper: sharedWrapperRef.current,
      lottieEl: lottieElRef.current,
      logoEl: logoElRef.current,
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
  };

  const showScrollButton = !hasStartedIntro && !showScrollArrows;

  // ── Logo size — must visually match where lottie animation ends ───────────
  // The lottie is 100vw wide but the logo inside it occupies ~12% of viewport.
  // We size the logo image to match that exact footprint.
  const logoImgSize = isMobile ? "28vw" : "12vw";

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
          <img
            ref={rainbowRef}
            src={purple_rainbow}
            alt="rainbow"
            className={
              isMobile
                ? "absolute left-[49%] -translate-x-1/2 bottom-[10%] w-[45vw] -z-10"
                : "absolute left-[49.2%] -translate-x-1/2 bottom-[10%] w-[22vw] -z-10"
            }
            style={{ transformOrigin: "center center" }}
          />
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
              style={{ transformOrigin: "center bottom" }}
            />
            <img
              ref={doorLeftHalfRef}
              src={stairs_with_door}
              alt="door left"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              style={{
                clipPath: "inset(0 50% 0 0)",
                willChange: "transform, opacity"
              }}
            />
            <img
              ref={doorRightHalfRef}
              src={stairs_with_door}
              alt="door right"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              style={{
                clipPath: "inset(0 0 0 50%)",
                willChange: "transform, opacity"
              }}
            />
          </div>
          <img
            ref={cubeRef}
            src={evolve_cube}
            alt="cube"
            className={
              isMobile
                ? "absolute bottom-[50%] left-1/2 -translate-x-1/2 w-[8vw]"
                : "absolute bottom-[50%] left-1/2 -translate-x-1/2 w-[3vw]"
            }
            style={{ transformOrigin: "center center" }}
          />
        </div>

        <img
          ref={floorRef}
          src={isMobile ? floor_with_walls_mobile : floor_with_walls}
          alt="floor"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full z-[3]"
        />

        {showScrollButton && (
          <img
            src={dive_in}
            alt="scroll button"
            onClick={handleScrollClick}
            onMouseEnter={(e) => (e.currentTarget.src = dive_in_hover)}
            onMouseLeave={(e) => (e.currentTarget.src = dive_in)}
            className={
              isMobile
                ? "absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[20vw] z-[50] cursor-pointer"
                : "absolute bottom-[7%] left-1/2 -translate-x-1/2 w-[8vw] z-[50] cursor-pointer"
            }
          />
        )}
      </div>

      <div
        ref={doorCloseupRef}
        className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none"
        style={{
          willChange: "transform, opacity",
          opacity: 0,
          visibility: "hidden"
        }}
      >
        <img
          src={isMobile ? door_closeup_mobile : door_closeup}
          alt="door closeup"
          className="w-full h-full object-cover"
        />
      </div>

      {/* ── SHARED WRAPPER — lottie + logo in exact same space ────────────── */}
      {/* This entire div is what Home uses as the "logo unit".               */}
      {/* It carries through to SceneNew where the badge blooms around it.   */}
      <div
        ref={sharedWrapperRef}
        className="absolute inset-0 z-[130] flex items-center justify-center pointer-events-none"
        style={{ willChange: "transform, opacity", opacity: 0 }}
      >
        {/* Lottie occupies full width to match its natural render size */}
        <div
          ref={lottieElRef}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            style={
              isMobile
                ? {
                    width: "100vw",
                    transform: "scale(1.6)",
                    transformOrigin: "center center"
                  }
                : { width: "100vw" }
            }
          >
            <DotLottieReact
              src="https://lottie.host/07d82781-37a6-41c7-9250-1adf1c42956f/xdEKCbGV3S.lottie"
              loop={false}
              autoplay={false}
              style={{ width: "100%", height: "auto", display: "block" }}
              dotLottieRefCallback={(instance) => {
                lottiePlayRef.current = () => instance?.play();
              }}
            />
          </div>
        </div>

        {/* Logo: same visual center as lottie end frame */}
        {/* opacity:0 initially — GSAP swaps it in when lottie ends          */}
        <div
          ref={logoElRef}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0
          }}
        >
          <img
            src={logo_main}
            alt="evolve logo"
            style={{ width: logoImgSize, height: "auto", display: "block" }}
          />
        </div>
      </div>

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

      {showScrollArrows && (
        <div
          ref={downArrowsRef}
          className="absolute left-1/2 -translate-x-1/2 z-[150] pointer-events-none"
          style={{ top: isMobile ? "66%" : "74%" }}
        >
          <svg
            width={isMobile ? "32" : "44"}
            height={isMobile ? "40" : "52"}
            viewBox="0 0 56 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16 12L28 24L40 12"
              stroke="#000000"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.3"
            />
            <path
              d="M16 28L28 40L40 28"
              stroke="#000000"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.6"
            />
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
