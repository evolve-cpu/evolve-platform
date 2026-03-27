import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";

import {
  vector,
  vector_mobile,
  left_thunder,
  right_thunder,
  left_thunder_mobile,
  right_thunder_mobile,
  vector_1st_mobile,
  vector_2nd_mobile,
  curvey_circle_without_inner_part,
  curvey_circle_inner_logo_part,
  curvey_circle_inner_part,
  vector_1st,
  vector_2nd,
  oval_mini_1,
  oval_mini_2,
  oval_mini_3,
  oval_1,
  oval_2,
  oval_3,
  oval_3_1
} from "../../assets/images/Home";
import { rays_webinars } from "../../assets/images/Webinars";

// Step labels for this scene - UPDATED for mobile card scrolling
export const SCENE_NEW_STEP_LABELS = [
  "scene_new_step0_intro", // Initial state - all elements visible
  "scene_new_step1_text_appears", // Text fades in
  "scene_new_step2_circle_appears", // Vector moves down, circle appears
  "scene_new_step5_outer_rotating", // Outer circle rotates
  "scene_new_step6_elements_exit", // All current elements exit
  "scene_new_step7_toolkit_cards_appear", // Cards appear directly (combined step 7+8+9)
  "scene_new_step8_card1_center", // Card 1 in center (mobile)
  "scene_new_step9_card2_center", // Card 2 in center (mobile)
  "scene_new_step10_card3_center", // Card 3 in center (mobile)
  "scene_new_step11_cards_interactive" // Final interactive state
];

// CombinedCircle Component
const CombinedCircle = React.forwardRef(({ isMobile }, ref) => {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const innerLogoRef = useRef(null);

  React.useImperativeHandle(ref, () => ({
    outer: outerRef.current,
    inner: innerRef.current,
    innerLogo: innerLogoRef.current
  }));

  return (
    <div className="relative w-full h-full">
      {/* Outer circle - will rotate */}
      <img
        ref={outerRef}
        src={curvey_circle_without_inner_part}
        alt="outer circle"
        className="absolute inset-0 w-full h-full antialiased"
        style={{
          transformOrigin: "center center"
        }}
      />
      {/* Inner LOGO part - shows FIRST */}
      <img
        ref={innerLogoRef}
        src={curvey_circle_inner_logo_part}
        alt="inner logo circle"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "25%",
          height: "25%",
          transformOrigin: "center center",
          opacity: 0
        }}
      />
      {/* Inner part - shows SECOND */}
      <img
        ref={innerRef}
        src={curvey_circle_inner_part}
        alt="inner circle"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "70%",
          height: "70%",
          transformOrigin: "center center",
          opacity: 0
        }}
      />
    </div>
  );
});

CombinedCircle.displayName = "CombinedCircle";

// Timeline hook for SceneNew animation
export const useSceneNewTimeline = (refs, isMobile) => {
  const tl = gsap.timeline();

  // ========== STEP 0: Initial Setup (everything visible) ==========
  tl.addLabel("scene_new_step0_intro", 0);

  // Set initial states
  tl.set(refs.bg, {
    opacity: 1
  })
    .set(refs.rays, {
      opacity: 1
    })
    .set(refs.vector1st, {
      opacity: 1,
      y: 0
    })
    .set(refs.vector2nd, {
      opacity: 0,
      y: 0
    })
    .set([refs.leftThunder, refs.rightThunder], {
      opacity: 1,
      y: 0
    })
    .set(refs.text, {
      opacity: 0,
      y: 30,
      willChange: "transform, opacity"
    })
    .set(refs.combinedCircleContainer, {
      opacity: 0,
      scale: 0.3,
      willChange: "transform, opacity"
    })
    .set(refs.text8, {
      opacity: 0,
      y: 20
    })
    .set([refs.ovalMini1, refs.ovalMini2, refs.ovalMini3], {
      opacity: 0,
      scale: 1
    })
    .set([refs.oval1, refs.oval2, refs.oval3], {
      opacity: 0,
      scale: 1,
      x: 0,
      y: 0
    });

  // Disable pointer events on desktop cards initially
  if (!isMobile && refs.fullOvalsContainer) {
    tl.set(refs.fullOvalsContainer, {
      pointerEvents: "none"
    });
  }

  // Initial pause to show the scene
  tl.to({}, { duration: 1.0 });

  // ========== STEP 1: Text Appears ==========
  tl.addLabel("scene_new_step1_text_appears", 1.0);

  tl.to(
    refs.text,
    {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: "power2.out"
    },
    1.0
  );

  // Pause for text to be read
  tl.to({}, { duration: 1.5 });

  // ========== STEP 2: Thunders Move Down & Vector Crossfade ==========
  tl.addLabel("scene_new_step2_circle_appears", 3.7);

  // Move thunders down
  tl.to(
    [refs.leftThunder, refs.rightThunder],
    {
      y: isMobile ? "20vh" : "10vh",
      duration: 1.5,
      ease: "power2.inOut"
    },
    3.7
  );

  // Crossfade vectors: vector_1st fades out, vector (vector_2nd) fades in
  tl.to(
    refs.vector1st,
    {
      opacity: 0,
      duration: 1.0,
      ease: "power2.inOut"
    },
    3.7
  );

  tl.to(
    refs.vector2nd,
    {
      opacity: 1,
      duration: 1.0,
      ease: "power2.inOut"
    },
    3.7
  );

  // Container scale - appears after crossfade at intersection
  // UPDATED MOBILE: Bigger scale and positioned at V intersection
  tl.to(
    refs.combinedCircleContainer,
    {
      opacity: 1,
      scale: isMobile ? 0.9 : 0.8, // CHANGED: 0.8 instead of 0.5 for mobile
      duration: 0.8,
      ease: "back.out(1.5)"
    },
    4.7
  );

  // SHOW INNER PARTS AT SAME TIME
  if (refs.combinedCircle?.innerLogo && refs.combinedCircle?.inner) {
    tl.to(
      [refs.combinedCircle.innerLogo, refs.combinedCircle.inner],
      {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out"
      },
      4.8
    );
  }

  // ========== STEP 5: Outer Circle Starts Rotating ==========
  tl.addLabel("scene_new_step5_outer_rotating", 0);

  // Add rotation animation for outer circle throughout timeline
  if (refs.combinedCircle?.outer) {
    tl.to(
      refs.combinedCircle.outer,
      {
        rotation: -360,
        duration: 10.0,
        ease: "none",
        repeat: 0
      },
      0
    );
  }

  // Pause before transition
  tl.to({}, { duration: 2.0 });

  // ========== STEP 6: ALL CURRENT ELEMENTS EXIT ==========
  const exitStart = tl.duration();
  tl.addLabel("scene_new_step6_elements_exit", exitStart);

  // Text fades and moves up
  tl.to(
    refs.text,
    {
      opacity: 0,
      y: -50,
      duration: 0.8,
      ease: "power2.in"
    },
    exitStart
  );

  // Combined circle outer part exits WITH ROTATION
  if (refs.combinedCircle?.outer) {
    tl.to(
      refs.combinedCircle.outer,
      {
        y: "50vh",
        opacity: 0,
        rotation: "-=360",
        duration: 1.0,
        ease: "power2.in"
      },
      exitStart
    );
  }

  // Inner parts exit
  if (refs.combinedCircle?.innerLogo && refs.combinedCircle?.inner) {
    tl.to(
      [refs.combinedCircle.innerLogo, refs.combinedCircle.inner],
      {
        y: "50vh",
        opacity: 0,
        duration: 1.0,
        ease: "power2.in"
      },
      exitStart
    );
  }

  // Thunders move down out of view
  tl.to(
    [refs.leftThunder, refs.rightThunder],
    {
      y: "100vh",
      opacity: 0,
      duration: 1.0,
      ease: "power2.in"
    },
    exitStart
  );

  // Vector moves down out of view
  tl.to(
    refs.vector2nd,
    {
      y: "50vh",
      opacity: 0,
      duration: 1.0,
      ease: "power2.in"
    },
    exitStart
  );

  // Rays fade out
  tl.to(
    refs.rays,
    {
      opacity: 0,
      duration: 0.6,
      ease: "power2.in"
    },
    exitStart + 0.2
  );

  // ========== STEP 7: TOOLKIT CARDS APPEAR ==========
  const toolkitStart = exitStart + 1.2;
  tl.addLabel("scene_new_step7_toolkit_cards_appear", toolkitStart + 1.2);

  // Text appears
  tl.to(
    refs.text8,
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out"
    },
    toolkitStart
  );

  // Mini ovals appear with slight stagger
  tl.to(
    refs.ovalMini3,
    {
      opacity: 1,
      duration: 0.4,
      ease: "power2.out"
    },
    toolkitStart + 0.2
  );

  tl.to(
    refs.ovalMini2,
    {
      opacity: 1,
      duration: 0.4,
      ease: "power2.out"
    },
    toolkitStart + 0.3
  );

  tl.to(
    refs.ovalMini1,
    {
      opacity: 1,
      duration: 0.4,
      ease: "power2.out"
    },
    toolkitStart + 0.4
  );

  // Transform to full ovals
  const transformStart = toolkitStart + 1.2;

  if (isMobile) {
    // ========== MOBILE: REPLICATED FROM SCENE1_1 ==========

    // Step 10: oval_mini_1 expands and transforms into oval_1
    const step10Start = transformStart + 1.5;

    // First hide other mini ovals
    tl.to(
      [refs.ovalMini2, refs.ovalMini3],
      {
        opacity: 0,
        duration: 0.4,
        ease: "power2.out"
      },
      step10Start
    );

    // Mini oval moves UP to vertical center AND scales up simultaneously
    tl.to(
      refs.ovalMini1,
      {
        y: "-20vh",
        scale: 1.5,
        duration: 0.8,
        ease: "power2.out"
      },
      step10Start + 0.2
    );

    // Set initial position for oval_1 (same position as scaled mini)
    tl.set(
      refs.oval1,
      {
        opacity: 0,
        scale: 0.5,
        y: "0vh",
        willChange: "transform, opacity"
      },
      step10Start + 0.8
    );

    tl.addLabel("scene_new_step8_card1_center", step10Start + 2.1);

    // Direct crossfade: mini oval fades out as full oval fades in
    tl.to(
      refs.ovalMini1,
      {
        opacity: 0,
        duration: 0,
        ease: "power2.inOut"
      },
      step10Start + 1.0
    );

    tl.to(
      refs.oval1,
      {
        opacity: 1,
        duration: 0,
        ease: "power2.inOut"
      },
      step10Start + 1.0
    );

    // Full oval scales up to final size at center
    tl.to(
      refs.oval1,
      {
        scale: 1,
        duration: 1,
        ease: "power2.out"
      },
      step10Start + 1.5
    );

    // Step 11: Vertical scroll transition - cards stack behavior
    const step11Start = step10Start + 4.0;

    const scrollContainerHeight = 85;

    // Set oval_1 to the same starting position as oval_2 and oval_3
    tl.set(
      refs.oval1,
      {
        opacity: 1,
        top: "15vh",
        scale: 1
      },
      step11Start
    );

    // Set oval_2 ABOVE the visible area
    tl.set(
      refs.oval2,
      {
        opacity: 1,
        top: `-100vh`,
        scale: 0.9
      },
      step11Start
    );

    // oval_1 scrolls DOWN - moves down and fades
    tl.to(
      refs.oval1,
      {
        top: `${scrollContainerHeight * 0.6}vh`,
        scale: 0.9,
        opacity: 0,
        duration: 2.8,
        ease: "power3.inOut"
      },
      step11Start
    );

    // oval_2 scrolls DOWN from top to center
    tl.to(
      refs.oval2,
      {
        top: "2vh",
        scale: 1,
        duration: 2.8,
        ease: "power3.inOut"
      },
      step11Start
    );

    tl.addLabel("scene_new_step9_card2_center", step11Start + 2.8);

    // Step 12: Continue vertical scroll
    const step12Start = step11Start + 4.0;

    // Set oval_3 ABOVE the visible area
    tl.set(
      refs.oval3,
      {
        opacity: 1,
        top: `-100vh`,
        scale: 0.9
      },
      step12Start
    );

    // oval_2 scrolls DOWN and fades
    tl.to(
      refs.oval2,
      {
        top: `${scrollContainerHeight * 0.6}vh`,
        scale: 0.9,
        opacity: 0,
        duration: 2.8,
        ease: "power3.inOut"
      },
      step12Start
    );

    // oval_3 scrolls DOWN from top to center
    tl.to(
      refs.oval3,
      {
        top: "2vh",
        scale: 1,
        duration: 2.8,
        ease: "power3.inOut"
      },
      step12Start
    );

    tl.addLabel("scene_new_step10_card3_center", step12Start + 2.8);

    // Step 13: Final card stays with subtle animation
    tl.to(
      refs.oval3,
      {
        scale: 1.03,
        duration: 0.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: 1
      },
      step12Start + 2.5
    );

    // Enable pointer events for mobile cards after animations complete
    const mobileInteractiveStart = step12Start + 3.5;
    tl.call(
      () => {
        // Make sure all visible cards are interactive
        if (refs.oval3) {
          refs.oval3.style.pointerEvents = "auto";
        }
      },
      null,
      null,
      mobileInteractiveStart
    );
  } else {
    // ========== DESKTOP: ORIGINAL ANIMATION ==========

    // Desktop: Spread and transform
    tl.to(
      refs.ovalMini3,
      {
        scale: 1.2,
        x: "-90px",
        duration: 0.6,
        ease: "power2.inOut"
      },
      transformStart
    );

    tl.to(
      refs.ovalMini2,
      {
        scale: 1.2,
        x: 0,
        duration: 0.6,
        ease: "power2.inOut"
      },
      transformStart
    );

    tl.to(
      refs.ovalMini1,
      {
        scale: 1.2,
        x: "90px",
        duration: 0.6,
        ease: "power2.inOut"
      },
      transformStart
    );

    // Crossfade
    tl.to(
      [refs.ovalMini1, refs.ovalMini2, refs.ovalMini3],
      {
        opacity: 0,
        duration: 0,
        ease: "power2.inOut"
      },
      transformStart + 0.6
    );

    tl.to(
      [refs.oval1, refs.oval2, refs.oval3],
      {
        opacity: 1,
        scale: 0.92,
        duration: 0,
        ease: "power2.inOut"
      },
      transformStart + 0.6
    );

    // Move back to center
    tl.to(
      [refs.oval1, refs.oval2, refs.oval3],
      {
        x: 0,
        duration: 0,
        ease: "power2.out"
      },
      transformStart + 0.9
    );
  }

  // ========== FINAL STEP: CARDS BECOME INTERACTIVE ==========
  const interactiveStart = tl.duration();
  tl.addLabel("scene_new_step11_cards_interactive", interactiveStart);

  // ENABLE POINTER EVENTS for desktop cards
  if (!isMobile) {
    tl.set(
      refs.fullOvalsContainer,
      {
        pointerEvents: "auto"
      },
      interactiveStart
    );
  }

  // Subtle floating animation for cards (desktop only)
  if (!isMobile) {
    tl.call(
      () => {
        gsap.to(refs.oval1, {
          y: "-=15",
          duration: 2.5,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true
        });

        gsap.to(refs.oval2, {
          y: "-=15",
          duration: 2.5,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: 0.3
        });

        gsap.to(refs.oval3, {
          y: "-=15",
          duration: 2.5,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: 0.6
        });
      },
      null,
      null,
      interactiveStart
    );
  }

  // Clear will-change at the end for performance
  tl.set(refs.text, { willChange: "auto" });
  tl.set(refs.combinedCircleContainer, { willChange: "auto" });

  return tl;
};

// Main Scene Component
const SceneNew = React.forwardRef((props, ref) => {
  const { isMobile } = props;
  const navigate = useNavigate();

  // Main refs
  const containerRef = useRef(null);
  const bgRef = useRef(null);
  const raysRef = useRef(null);
  const vector1stRef = useRef(null);
  const vector2ndRef = useRef(null);
  const leftThunderRef = useRef(null);
  const rightThunderRef = useRef(null);
  const textRef = useRef(null);
  const combinedCircleContainerRef = useRef(null);
  const combinedCircleRef = useRef(null);

  // Toolkit section refs
  const text8Ref = useRef(null);
  const ovalMini1Ref = useRef(null);
  const ovalMini2Ref = useRef(null);
  const ovalMini3Ref = useRef(null);
  const oval1Ref = useRef(null);
  const oval2Ref = useRef(null);
  const oval3Ref = useRef(null);
  const fullOvalsContainerRef = useRef(null);

  // Expose refs to parent
  React.useImperativeHandle(ref, () => ({
    container: containerRef.current,
    bg: bgRef.current,
    rays: raysRef.current,
    vector1st: vector1stRef.current,
    vector2nd: vector2ndRef.current,
    leftThunder: leftThunderRef.current,
    rightThunder: rightThunderRef.current,
    text: textRef.current,
    combinedCircleContainer: combinedCircleContainerRef.current,
    combinedCircle: combinedCircleRef.current,
    text8: text8Ref.current,
    ovalMini1: ovalMini1Ref.current,
    ovalMini2: ovalMini2Ref.current,
    ovalMini3: ovalMini3Ref.current,
    oval1: oval1Ref.current,
    oval2: oval2Ref.current,
    oval3: oval3Ref.current,
    fullOvalsContainer: fullOvalsContainerRef.current
  }));

  // Card URLs - Update these to your actual routes
  const cardLinks = {
    1: "/community",
    2: "/mentorship",
    3: "/webinars"
  };

  // Card click handlers
  const handleCardClick = (cardNumber) => {
    const url = cardLinks[cardNumber];
    if (url) {
      navigate(url);
    }
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden"
    >
      {/* Background - evolve-yellow */}
      <div
        ref={bgRef}
        className="absolute inset-0 w-full h-full z-[1] bg-evolve-yellow"
      />

      {/* Rays Webinars SVG */}
      <img
        ref={raysRef}
        src={rays_webinars}
        alt="rays webinars"
        className="absolute inset-0 w-full h-full object-cover z-[2]"
      />

      {/* Vector 1st (initial vector - will fade out) */}
      <img
        ref={vector1stRef}
        src={isMobile ? vector_1st_mobile : vector_1st}
        alt="vector first"
        className="absolute left-0 w-full z-[3]"
        style={{
          bottom: 0,
          height: "auto"
        }}
      />

      {/* Vector 2nd (second vector - will fade in, combined circle appears on this) */}
      <img
        ref={vector2ndRef}
        src={isMobile ? vector_2nd_mobile : vector_2nd}
        alt="vector second"
        className="absolute left-0 w-full z-[3]"
        style={{
          bottom: 0,
          height: "auto",
          opacity: 0
        }}
      />

      {/* Left Thunder */}
      <img
        ref={leftThunderRef}
        src={isMobile ? left_thunder_mobile : left_thunder}
        alt="left thunder"
        className="absolute z-[4]"
        style={{
          bottom: isMobile ? "-5%" : "-3%",
          left: isMobile ? "-45%" : "-20%",
          width: isMobile ? "100vw" : "60vw",
          height: "auto"
        }}
      />

      {/* Right Thunder */}
      <img
        ref={rightThunderRef}
        src={isMobile ? right_thunder_mobile : right_thunder}
        alt="right thunder"
        className="absolute z-[4]"
        style={{
          bottom: isMobile ? "-5%" : "-3%",
          right: isMobile ? "-45%" : "-20%",
          width: isMobile ? "100vw" : "60vw",
          height: "auto"
        }}
      />

      {/* Text: "Home to fearless design and untamed creativity" */}
      <div
        ref={textRef}
        className={[
          "absolute left-1/2 -translate-x-1/2 z-[20] text-center font-extrabold",
          "text-[32px] leading-[1.2]",
          "[@media(min-height:812px)]:text-[40px]",
          "[@media(min-height:812px)]:leading-[1.2]",
          "md:text-[48px] md:leading-[1.2]",
          "[@media(min-width:1024px)]:[@media(min-height:900px)]:text-[64px]",
          "[@media(min-width:1024px)]:[@media(min-height:900px)]:leading-[1.2]"
        ].join(" ")}
        style={{
          top: "20%",
          maxWidth: isMobile ? "90%" : "80%",
          width: isMobile ? "90vw" : "80%",
          opacity: 0,
          color: "rgb(0, 0, 0)"
        }}
      >
        {isMobile ? (
          <>
            <div>Home to fearless</div>
            <div>design and untamed</div>
            <div>creativity.</div>
          </>
        ) : (
          <>
            <div>Home to fearless design and</div>
            <div>untamed creativity.</div>
          </>
        )}
      </div>

      {/* Combined Circle Container - UPDATED MOBILE POSITIONING */}
      <div
        ref={combinedCircleContainerRef}
        className="absolute left-1/2 -translate-x-1/2 z-[15] pointer-events-none"
        style={{
          width: isMobile ? "85vw" : "40vw", // CHANGED: 85vw for bigger size
          height: isMobile ? "85vw" : "40vw", // CHANGED: 85vw for bigger size
          bottom: isMobile ? "15%" : "-15%", // CHANGED: 15% for proper V intersection
          opacity: 0
        }}
      >
        <CombinedCircle ref={combinedCircleRef} isMobile={isMobile} />
      </div>

      {/* ========== TOOLKIT SECTION ========== */}
      {/* Text: "the evolve toolkit" */}
      <div
        ref={text8Ref}
        className={[
          "absolute left-1/2 -translate-x-1/2 z-[20] text-center font-extrabold",
          isMobile
            ? "text-[40px] leading-[1]"
            : "md:text-[48px] md:leading-[1.2]",
          isMobile
            ? "[@media(max-width:767px)]:[@media(min-height:812px)]:text-[48px]"
            : "",
          !isMobile
            ? "[@media(min-width:1024px)]:[@media(min-height:900px)]:text-[64px]"
            : ""
        ].join(" ")}
        style={{
          bottom: isMobile ? "5%" : "10%",
          width: isMobile ? "75vw" : "auto",
          color: "rgb(0, 0, 0)",
          opacity: 0
        }}
      >
        the evolve ecosystem
      </div>

      {/* Mini Ovals Container */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-[15]"
        style={{
          bottom: isMobile ? "15%" : "20%",
          top: 0,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? "16px" : "32px",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none"
        }}
      >
        <img
          ref={ovalMini3Ref}
          src={oval_mini_3}
          alt="oval mini 3"
          className="pointer-events-none"
          style={{
            width: isMobile ? "60%" : "280px",
            height: "auto",
            opacity: 0
          }}
        />
        <img
          ref={ovalMini2Ref}
          src={oval_mini_2}
          alt="oval mini 2"
          className="pointer-events-none"
          style={{
            width: isMobile ? "60%" : "280px",
            height: "auto",
            opacity: 0
          }}
        />
        <img
          ref={ovalMini1Ref}
          src={oval_mini_1}
          alt="oval mini 1"
          className="pointer-events-none"
          style={{
            width: isMobile ? "60%" : "280px",
            height: "auto",
            opacity: 0
          }}
        />
      </div>

      {/* Full Ovals Container - Interactive Cards */}
      {!isMobile && (
        <div
          ref={fullOvalsContainerRef}
          className="absolute left-1/2 -translate-x-1/2 z-[16]"
          style={{
            bottom: "10%",
            top: 0,
            display: "flex",
            flexDirection: "row",
            gap: "32px",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none"
          }}
        >
          <img
            ref={oval3Ref}
            src={oval_3}
            alt="oval 3"
            className="cursor-pointer transition-transform duration-300 hover:scale-110"
            onClick={() => handleCardClick(3)}
            style={{
              width: "380px",
              height: "auto",
              opacity: 0,
              pointerEvents: "auto"
            }}
          />
          <img
            ref={oval2Ref}
            src={oval_2}
            alt="oval 2"
            className="cursor-pointer transition-transform duration-300 hover:scale-105"
            onClick={() => handleCardClick(2)}
            style={{
              width: "380px",
              height: "auto",
              opacity: 0,
              pointerEvents: "auto"
            }}
          />
          <img
            ref={oval1Ref}
            src={oval_1}
            alt="oval 1"
            className="cursor-pointer transition-transform duration-300 hover:scale-105"
            onClick={() => handleCardClick(1)}
            style={{
              width: "380px",
              height: "auto",
              opacity: 0,
              pointerEvents: "auto"
            }}
          />
        </div>
      )}

      {/* Full Ovals Container - MOBILE - with clipping mask (REPLICATED FROM SCENE1_1) */}
      {isMobile && (
        <div
          className="absolute z-[16]"
          style={{
            left: 0,
            right: 0,
            top: 0,
            bottom: "20vh", // Boundary stops here (above text8)
            overflow: "hidden", // This clips the content
            pointerEvents: "auto"
          }}
        >
          {/* Inner positioned container - this is what moves */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "18vh", // Center in the visible area (85vh / 2)
              transform: "translate(-50%, 0)",
              width: "80vw",
              maxWidth: "380px"
            }}
          >
            <img
              ref={oval1Ref}
              src={oval_1}
              alt="oval 1"
              className="absolute left-1/2 -translate-x-1/2 cursor-pointer"
              onClick={() => handleCardClick(3)}
              style={{
                width: "100%",
                height: "auto",
                opacity: 0,
                top: 0,
                pointerEvents: "auto"
              }}
            />

            <img
              ref={oval2Ref}
              src={oval_2}
              alt="oval 2"
              className="absolute left-1/2 -translate-x-1/2 cursor-pointer"
              onClick={() => handleCardClick(2)}
              style={{
                width: "100%",
                height: "auto",
                opacity: 0,
                top: 0,
                pointerEvents: "auto"
              }}
            />

            <img
              ref={oval3Ref}
              src={oval_3}
              alt="oval 3"
              className="absolute left-1/2 -translate-x-1/2 cursor-pointer"
              onClick={() => handleCardClick(1)}
              style={{
                width: "100%",
                height: "auto",
                opacity: 0,
                top: 0,
                pointerEvents: "auto"
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
});

SceneNew.displayName = "SceneNew";
export default SceneNew;
