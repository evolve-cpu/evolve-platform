import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";

import {
  left_thunder,
  right_thunder,
  left_thunder_mobile,
  right_thunder_mobile,
  vector_2nd_mobile,
  curvey_circle_without_inner_part,
  curvey_circle_inner_logo_part,
  curvey_circle_inner_part,
  vector_2nd,
  vector1_1,
  vector1_1_mobile,
  community_logo,
  mentorship_logo,
  webinar_logo,
  pink_bigger_orbit,
  pink_bigger_orbit_mobile,
  stairs_left_new,
  stairs_right_new,
  stairsfull_right_mobile,
  left_stairs_mod6_mobile
} from "../../assets/images/Home";
import { rays_webinars } from "../../assets/images/Webinars";

// Step labels for this scene
export const SCENE_NEW_STEP_LABELS = [
  "scene_new_step0_intro",
  "scene_new_step1_text_appears",
  "scene_new_step2_circle_appears",
  "scene_new_step5_outer_rotating",
  "scene_new_step6_elements_exit",
  "scene_new_step7_toolkit_cards_appear",
  "scene_new_step8_card1_center",
  "scene_new_step9_card2_center",
  "scene_new_step10_card3_center",
  "scene_new_step11_cards_interactive",
  "scene_new_step12_orbit_peek",
  "scene_new_step13_orbit_comes_in",
  "scene_new_step14_orbit_with_text",
  "scene_new_step14b_orbit_subtext",
  "scene_new_step15_orbit_cta",
  "scene_new_step16_cta_hold"
];

// Screen multipliers for orbit/stairs scaling (same logic as Scene1_1)
const getOrbitScreenMultipliers = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  if (
    (width >= 700 && width <= 1368 && height >= 900 && height <= 1300) ||
    (height >= 700 && height <= 1180 && width >= 900 && width <= 1400)
  )
    return { orbit: 1.345, stairs: 0.35 };
  if (width <= 1440) return { orbit: 1, stairs: 0.9 };
  if (width <= 1920 && height <= 1200) return { orbit: 0.7, stairs: 0.85 };
  return { orbit: 0.5, stairs: 0.7 };
};

const getOrbitVerticalMultipliers = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  if (
    (width >= 700 && width <= 1368 && height >= 900 && height <= 1300) ||
    (height >= 700 && height <= 1180 && width >= 900 && width <= 1400)
  )
    return { upward: 1.4, downward: 0.9 };
  if (width <= 1368) return { upward: 0.7, downward: 1.3 };
  if (width <= 1440) return { upward: 1.2, downward: 0.7 };
  if (width <= 1680 && height <= 1050) return { upward: 0.9, downward: 1.1 };
  if (width <= 1920 && height <= 1200) return { upward: 1.1, downward: 1.0 };
  if (width <= 2560) return { upward: 1.6, downward: 0.6 };
  return { upward: 1.8, downward: 0.5 };
};

const isTabletLandscape = (() => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  return w >= 900 && w <= 1400 && h >= 600 && h <= 1100;
})();

// â"€â"€â"€ Oval Mini Card â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
// Small pill card: lavender bg, yellow dashed inner border, logo centred
const OvalMiniCard = React.forwardRef(({ logo, style }, ref) => (
  <div ref={ref} style={{ display: "block", flexShrink: 0, ...style }}>
    <div
      style={{
        background: "rgba(163,91,251,1)",
        borderRadius: "180px",
        width: "100%",
        aspectRatio: "0.65 / 1",
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box"
      }}
    >
      {/* concentric dashed yellow border */}
      <div
        style={{
          position: "absolute",
          inset: "8%",
          borderRadius: "150px",
          border: "1.5px dashed rgba(255,208,7,0.85)",
          pointerEvents: "none"
        }}
      />
      <img
        src={logo}
        alt=""
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: "62%",
          height: "auto",
          pointerEvents: "none"
        }}
      />
    </div>
  </div>
));
OvalMiniCard.displayName = "OvalMiniCard";

// â"€â"€â"€ Oval Full Card â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
// Full card: lavender â†' pink on hover, logo + title + desc + arrow
const CARD_DATA = {
  community: {
    title: "community",
    desc: "a safe, active space to connect, share, and grow.",
    logo: community_logo
  },
  mentorship: {
    title: "mentorship",
    desc: "1:1 support. learn from experienced designers.",
    logo: mentorship_logo
  },
  webinar: {
    title: "webinar",
    desc: "expert-led sessions. learn, engage, and grow.",
    logo: webinar_logo
  }
};

const OvalFullCard = React.forwardRef(({ card, onClick, style }, ref) => {
  const innerRef = useRef(null);
  const { title, desc, logo } = CARD_DATA[card];

  const handleInteraction = (e) => {
    e.stopPropagation();
    if (onClick) onClick(e);
  };

  return (
    <div
      ref={ref}
      onClick={handleInteraction}
      onTouchEnd={handleInteraction}
      onMouseEnter={() => {
        if (innerRef.current)
          innerRef.current.style.background = "rgba(223,5,134,1)";
      }}
      onMouseLeave={() => {
        if (innerRef.current)
          innerRef.current.style.background = "rgba(163,91,251,1)";
      }}
      style={{
        display: "block",
        flexShrink: 0,
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
        ...style
      }}
    >
      <div
        ref={innerRef}
        style={{
          background: "rgba(163,91,251,1)",
          transition: "background 0.22s ease",
          borderRadius: "180px",
          width: "100%",
          aspectRatio: "0.65 / 1",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16% 12% 12%",
          boxSizing: "border-box",
          gap: "4%"
        }}
      >
        {/* concentric dashed yellow border â€" enough gap from edge */}
        <div
          style={{
            position: "absolute",
            inset: "5%",
            borderRadius: "150px",
            // border: "1.5px dashed rgba(255,208,7,0.8)",
            border: "1.5px solid rgba(255,208,7,0.8)",
            pointerEvents: "none"
          }}
        />
        {/* logo */}
        <img
          src={logo}
          alt={title}
          style={{
            width: "70%",
            height: "auto",
            flexShrink: 0,
            position: "relative",
            zIndex: 1
          }}
        />
        {/* text */}
        <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <p
            style={{
              color: "#fff",
              fontWeight: 800,
              fontSize: "1.4rem",
              margin: 0,
              marginBottom: "0.3rem",
              fontFamily: "inherit",
              letterSpacing: "-0.02em"
            }}
          >
            {title}
          </p>
          <p
            style={{
              color: "rgba(255,255,255,0.88)",
              fontSize: "0.92rem",
              margin: 0,
              lineHeight: 1.45
            }}
          >
            {desc}
          </p>
        </div>
        {/* arrow */}
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "rgba(20,20,20,0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            zIndex: 1,
            flexShrink: 0
          }}
        >
          <span style={{ color: "#fff", fontSize: "1rem", lineHeight: 1 }}>
            {"→"}
          </span>
        </div>
      </div>
    </div>
  );
});
OvalFullCard.displayName = "OvalFullCard";

// CombinedCircle Component
const CombinedCircle = React.forwardRef(({ isMobile }, ref) => {
  const outerRef = useRef(null);
  const innerRef = useRef(null);

  React.useImperativeHandle(ref, () => ({
    outer: outerRef.current,
    inner: innerRef.current,
    innerLogo: null // kept for API compatibility — logo is part of inner SVG
  }));

  return (
    <div className="relative w-full h-full">
      {/* Outer wavy circle — rotates */}
      <img
        ref={outerRef}
        src={curvey_circle_without_inner_part}
        alt="outer circle"
        className="absolute inset-0 w-full h-full antialiased"
        style={{ transformOrigin: "center center" }}
      />
      {/* Inner part — contains the text ring, yellow circle, AND the e-logo.
          curvey_circle_inner_logo_part was removed because the logo is already
          embedded in curvey_circle_inner_part, causing a double-render overlap. */}
      <img
        ref={innerRef}
        src={curvey_circle_inner_part}
        alt="inner circle"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "70%",
          height: "70%",
          transformOrigin: "center center",
          opacity: 1
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
    .set(refs.step2Panel, {
      y: 0
    })
    .set(refs.toolkitPanel, {
      y: "100vh"
    })
    // Toolkit background: separate div, slides in with toolkit panel
    .set(refs.toolkitBg, {
      y: "100vh"
    })
    // Orbit panel: starts completely below screen
    .set(refs.orbitPanel, {
      y: "100vh"
    })
    // Pink orbit initial state (visible inside the panel)
    .set(refs.pinkOrbit, {
      // opacity: 1,
      opacity: 0,
      scale: isMobile ? 2 : 1,
      y: isMobile ? -50 : -80
    })
    .set(refs.pinkOrbitInner, {
      opacity: 0.3
    });

  // Orbit stairs initial states (guarded — desktop/mobile only)
  const orbitDesktopStairs = [
    refs.orbitStairsLeft,
    refs.orbitStairsRight
  ].filter(Boolean);
  if (orbitDesktopStairs.length > 0)
    tl.set(orbitDesktopStairs, { opacity: 0, y: "40vh" });
  if (refs.orbitRightStairsMod3Mobile)
    tl.set(refs.orbitRightStairsMod3Mobile, { opacity: 0 });
  if (refs.orbitLeftStairsMod6Mobile)
    tl.set(refs.orbitLeftStairsMod6Mobile, { opacity: 0 });

  // Orbit text initial states
  tl.set(refs.orbitText3, { opacity: 0, y: 20 });
  tl.set(refs.orbitSubtext1, { opacity: 0, y: 10 });
  tl.set(refs.orbitSubtext2, { opacity: 0, display: "none" });

  tl.set(refs.orbitWaitlistButton, {
    opacity: 0,
    y: 30,
    scale: 0.9,
    pointerEvents: "none"
  })
    .set(refs.rays, {
      opacity: 1
    })
    // vector1_1 is the opening shape â€" visible from the start
    .set(refs.vector1_1, {
      opacity: 1
    })
    // vector_1st is the intermediate shape â€" hidden initially, revealed as circle falls
    // .set(refs.vector1st, {
    //   opacity: 0,
    //   y: 0
    // })
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
    // Circle starts visible at the apex/top of vector1_1
    .set(refs.combinedCircleContainer, {
      opacity: 1,
      scale: isMobile ? 0.9 : 0.8,
      y: isMobile ? "-20vh" : "-44vh",
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
  // tl.to({}, { duration: 1.0 });

  // ========== STEP 1: (no text here â€" text comes at step2 after circle lands) ==========
  tl.addLabel("scene_new_step1_text_appears", 0.5);

  // Pause before circle falls
  // tl.to({}, { duration: 2.7 });

  // ========== STEP 2: Circle falls, vector1_1 â†' vector_1st â†' vector_2nd ==========
  tl.addLabel("scene_new_step2_circle_appears", 1);

  // Thunders move down
  tl.to(
    [refs.leftThunder, refs.rightThunder],
    {
      y: isMobile ? "20vh" : "10vh",
      duration: 1.5,
      ease: "power2.inOut"
    },
    3.7
  );

  // Circle FALLS DOWN â€" gravity/weight feel
  tl.to(
    refs.combinedCircleContainer,
    {
      y: 0,
      duration: 1.1,
      ease: "power3.in"
    },
    3
  );

  // vector1_1 fades out as circle descends (weight pressing it down)
  tl.to(
    refs.vector1_1,
    {
      opacity: 0,
      duration: 0.7,
      ease: "power2.in"
    },
    3
  );

  // vector_1st fades in â€" the "pressed down" shape appears under the weight
  // tl.to(
  //   refs.vector1st,
  //   {
  //     opacity: 1,
  //     duration: 0.5,
  //     ease: "power2.out"
  //   },
  //   4.2
  // );

  // Short pause on vector_1st, then crossfade to vector_2nd
  // tl.to(
  //   refs.vector1st,
  //   {
  //     opacity: 0,
  //     duration: 0.8,
  //     ease: "power2.inOut"
  //   },
  //   5.0
  // );

  tl.to(
    refs.vector2nd,
    {
      opacity: 1,
      duration: 0.8,
      ease: "power2.inOut"
    },
    3
  );

  // Text appears at step2, after circle has landed and vector2nd is visible
  tl.to(
    refs.text,
    {
      opacity: 1,
      y: 0,
      duration: 1.0,
      ease: "power2.out"
    },
    4
  );

  // ========== STEP 5: Outer Circle Rotates â€" starts from t=0 since circle is visible immediately ==========
  tl.addLabel("scene_new_step5_outer_rotating", 0);

  if (refs.combinedCircle?.outer) {
    tl.to(
      refs.combinedCircle.outer,
      {
        rotation: -360,
        duration: 12.0,
        ease: "none",
        repeat: 0
      },
      0
    );
  }

  // Pause before transition
  // tl.to({}, { duration: 2.0 });

  // ========== STEP 6: PANEL SLIDE â€" step2 slides up, toolkit slides up from below ==========
  const exitStart = tl.duration();
  tl.addLabel("scene_new_step6_elements_exit", exitStart);

  // Step2 panel slides up off screen
  tl.to(
    refs.step2Panel,
    {
      y: "-100vh",
      duration: 0.8,
      ease: "power2.inOut"
    },
    exitStart
  );

  // Toolkit panel + bg slide up from below simultaneously
  tl.to(
    refs.toolkitPanel,
    {
      y: "0",
      duration: 0.8,
      ease: "power2.inOut"
    },
    exitStart
  );
  tl.to(
    refs.toolkitBg,
    {
      y: "0",
      duration: 0.8,
      ease: "power2.inOut"
    },
    exitStart
  );

  // ========== STEP 7: TOOLKIT CARDS APPEAR ==========
  // Panel slide takes 0.8s, so content appears shortly after it lands
  const toolkitStart = exitStart;
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
        y: "-15vh",
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

    // Enable pointer events on mobile container as soon as first card appears
    tl.set(
      refs.mobileOvalsContainer,
      { pointerEvents: "auto" },
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

    // pointer events already enabled in oval1's onStart above
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

    // Enable pointer events on desktop container when cards appear (set is scrub-safe)
    tl.set(
      refs.fullOvalsContainer,
      { pointerEvents: "auto" },
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

  // ========== STEP 12: ORBIT PEEK â€" 7% of orbit panel peeks from below toolkit ==========
  // Peek triggers AFTER toolkit cards are fully interactive, while toolkit panel is at y=0
  // const peekStart = interactiveStart + 2.0;
  const peekStart = interactiveStart;
  tl.addLabel("scene_new_step12_orbit_peek", peekStart);

  tl.to(
    refs.orbitPanel,
    { y: "93vh", duration: 0.8, ease: "power2.out" },
    peekStart
  );

  // ========== STEP 13: ORBIT COMES IN â€" toolkit slides up, orbit slides up ==========
  // const orbitInStart = peekStart + 2.5;
  const orbitInStart = peekStart + 2.0;
  tl.addLabel("scene_new_step13_orbit_comes_in", orbitInStart);

  tl.to(
    refs.toolkitPanel,
    { y: "-100vh", duration: 0.9, ease: "power2.inOut" },
    orbitInStart
  );
  tl.to(
    refs.toolkitBg,
    { y: "-100vh", duration: 0.9, ease: "power2.inOut" },
    orbitInStart
  );
  tl.to(
    refs.orbitPanel,
    { y: "0", duration: 0.9, ease: "power2.inOut" },
    orbitInStart
  );
  // âœ… ADD THIS â€" reveal pink orbit as panel slides in
  tl.to(
    refs.pinkOrbit,
    { opacity: 1, duration: 0.4, ease: "power2.out" },
    orbitInStart + 0.3
  );

  // ========== ORBIT SEQUENCE — stairs + orbit animate, headline, subtext, CTA ==========
  const multipliers = getOrbitScreenMultipliers();

  // Define all timing anchors
  const orbitMoveUpStart = orbitInStart + 1.0;
  const orbitText3Start = orbitMoveUpStart + 1.0;
  const orbitSubtextStart = orbitText3Start + 2.0;
  const ctaStart = orbitSubtextStart + 2.5;

  // Orbit slides up into position as panel arrives
  tl.to(
    refs.pinkOrbit,
    {
      y: isMobile ? "-=15vh" : "-=25vh",
      duration: 1.4,
      ease: "power2.out"
    },
    orbitMoveUpStart
  );

  // ---- DESKTOP STAIR ANIMATIONS ----
  if (!isMobile) {
    const desktopStairs = [refs.orbitStairsLeft, refs.orbitStairsRight].filter(
      Boolean
    );
    if (desktopStairs.length > 0) {
      // Stairs enter from below as orbit panel arrives
      tl.set(desktopStairs, { opacity: 1, scale: 1, y: "40vh" }, orbitInStart);
      desktopStairs.forEach((stairDiv) => {
        const img = stairDiv.querySelector("img");
        if (img)
          tl.set(
            img,
            {
              maskImage:
                "linear-gradient(to top, black 32.89%, black 0%, transparent 32.89%)",
              WebkitMaskImage:
                "linear-gradient(to top, black 10%, black 0%, transparent 35%)"
            },
            orbitInStart
          );
      });
      tl.to(
        desktopStairs,
        { y: 0, duration: 1.4, ease: "power2.out" },
        orbitInStart
      );

      // Stairs move up + mask fully reveals
      tl.to(
        desktopStairs,
        {
          y: `+=${7 * multipliers.stairs}vh`,
          duration: 1.4,
          ease: "power2.out"
        },
        orbitMoveUpStart
      );
      desktopStairs.forEach((stairDiv) => {
        const img = stairDiv.querySelector("img");
        if (img)
          tl.to(
            img,
            {
              maskImage:
                "linear-gradient(to top, black 100%, black 90%, transparent 200%)",
              WebkitMaskImage:
                "linear-gradient(to top, black 100%, black 90%, transparent 200%)",
              duration: 1.4,
              ease: "power2.out"
            },
            orbitMoveUpStart
          );
      });

      // Continue moving at headline step
      tl.to(
        desktopStairs,
        {
          y: `+=${10 * multipliers.stairs}vh`,
          duration: 3.4,
          ease: "power1.inOut"
        },
        orbitText3Start
      );

      // Scale up and exit at CTA
      tl.to(
        desktopStairs,
        {
          y: `+=${40 * multipliers.stairs}vh`,
          scale: 1.3,
          duration: 2.4,
          ease: "power1.inOut"
        },
        ctaStart
      );
      desktopStairs.forEach((stairDiv) => {
        const img = stairDiv.querySelector("img");
        if (img)
          tl.to(
            img,
            {
              maskImage:
                "linear-gradient(to bottom, black 100%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, black 100%, transparent 100%)",
              duration: 1.4,
              ease: "power2.inOut"
            },
            ctaStart
          );
      });
      tl.to(
        desktopStairs,
        {
          scale: "+=0.05",
          y: "-=1vh",
          duration: 2.4,
          ease: "power2.inOut"
        },
        ctaStart + 2.0
      );
    }
  }

  // ---- MOBILE STAIR ANIMATIONS ----
  if (isMobile && refs.orbitRightStairsMod3Mobile) {
    const mobileStairsStart = orbitInStart + 0.3;
    tl.set(
      refs.orbitRightStairsMod3Mobile,
      {
        opacity: 1,
        left: 0,
        bottom: 0,
        right: "auto",
        width: "80%",
        willChange: "transform, opacity",
        clipPath: "inset(90% 0 0 0)",
        WebkitClipPath: "inset(90% 0 0 0)",
        maskImage:
          "linear-gradient(to top, black 0%, black 5%, transparent 10%)",
        WebkitMaskImage:
          "linear-gradient(to top, black 0%, black 5%, transparent 10%)"
      },
      mobileStairsStart
    );

    tl.to(
      refs.orbitRightStairsMod3Mobile,
      {
        clipPath: "inset(80% 0 0 0)",
        WebkitClipPath: "inset(80% 0 0 0)",
        maskImage:
          "linear-gradient(to top, black 0%, black 15%, transparent 20%)",
        WebkitMaskImage:
          "linear-gradient(to top, black 0%, black 15%, transparent 20%)",
        duration: 0.8,
        ease: "power2.out"
      },
      orbitMoveUpStart
    );

    tl.to(
      refs.orbitRightStairsMod3Mobile,
      {
        clipPath: "inset(70% 0 0 0)",
        WebkitClipPath: "inset(70% 0 0 0)",
        maskImage:
          "linear-gradient(to top, black 0%, black 25%, transparent 30%)",
        WebkitMaskImage:
          "linear-gradient(to top, black 0%, black 25%, transparent 30%)",
        duration: 0.8,
        ease: "power2.out"
      },
      orbitText3Start
    );

    tl.to(
      refs.orbitRightStairsMod3Mobile,
      {
        clipPath: "inset(60% 0 0 0)",
        WebkitClipPath: "inset(60% 0 0 0)",
        maskImage: "linear-gradient(to top, black 75%, black 20%)",
        WebkitMaskImage: "linear-gradient(to top, black 25%, black 60%)",
        duration: 0.8,
        ease: "power2.out"
      },
      orbitSubtextStart
    );

    tl.to(
      refs.orbitRightStairsMod3Mobile,
      {
        x: "+=12vw",
        left: "auto",
        bottom: "-2%",
        duration: 1.4,
        ease: "power2.inOut"
      },
      ctaStart - 1.0
    );
    tl.to(
      refs.orbitRightStairsMod3Mobile,
      {
        clipPath: "inset(38% 0 0 0)",
        WebkitClipPath: "inset(38% 0 0 0)",
        duration: 0.8,
        ease: "power2.out"
      },
      ctaStart - 1.0
    );

    tl.to(
      refs.orbitRightStairsMod3Mobile,
      {
        clipPath: "inset(0% 0 0 0)",
        WebkitClipPath: "inset(0% 0 0 0)",
        right: "-36%",
        bottom: "-21%",
        maskImage: "none",
        WebkitMaskImage: "none",
        duration: 1.2,
        ease: "power2.out"
      },
      ctaStart
    );
  }

  if (isMobile && refs.orbitLeftStairsMod6Mobile) {
    tl.set(
      refs.orbitLeftStairsMod6Mobile,
      {
        opacity: 1,
        left: "-2%",
        right: "auto",
        bottom: "-9%",
        width: "32.5%",
        clipPath: "inset(0% 0 0 0)",
        WebkitClipPath: "inset(0% 0 0 0)",
        willChange: "transform"
      },
      ctaStart + 1.0
    );
  }

  // Move mobile stairs + orbit up together at end
  if (isMobile) {
    const mobileEndStart = ctaStart + 2.5;
    const mobileEndTargets = [
      refs.pinkOrbit,
      refs.orbitRightStairsMod3Mobile,
      refs.orbitLeftStairsMod6Mobile
    ].filter(Boolean);
    if (mobileEndTargets.length > 0) {
      tl.to(
        mobileEndTargets,
        { y: "-=10vh", duration: 1.2, ease: "power2.out" },
        mobileEndStart
      );
    }
  }

  // Headline: "Your design growth, in your pocket."
  tl.addLabel("scene_new_step14_orbit_with_text", orbitText3Start);
  tl.to(
    refs.orbitText3,
    { opacity: 1, y: 0, duration: 1.0, ease: "power2.out" },
    orbitText3Start
  );

  // Partial subtext appears below headline
  tl.addLabel("scene_new_step14b_orbit_subtext", orbitSubtextStart);
  tl.to(
    refs.orbitSubtext1,
    { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
    orbitSubtextStart
  );

  // CTA: continuation text fades in after partial subtext (subtext1 stays visible)
  tl.addLabel("scene_new_step15_orbit_cta", ctaStart);
  // Switch display:none → inline so span joins the sentence flow before fading in
  tl.set(refs.orbitSubtext2, { display: "inline" }, ctaStart + 0.25);
  tl.to(
    refs.orbitSubtext2,
    { opacity: 1, duration: 0.7, ease: "power2.out" },
    ctaStart + 0.3
  );
  tl.to(
    refs.pinkOrbit,
    { y: "+=5vh", duration: 1.2, ease: "power2.inOut" },
    ctaStart
  );
  tl.fromTo(
    refs.orbitWaitlistButton,
    { opacity: 0, y: 25, scale: 0.92, pointerEvents: "none" },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      pointerEvents: "auto",
      duration: 0.9,
      ease: "back.out(1.4)"
    },
    ctaStart + 0.8
  );

  // Hold step — CTA fully visible, user rests here before moving to next section
  tl.addLabel("scene_new_step16_cta_hold", ctaStart + 2.5);

  // Continuous rotation for pink orbit inner
  if (refs.pinkOrbitInner) {
    tl.to(
      refs.pinkOrbitInner,
      { rotation: -720, duration: tl.duration(), ease: "none" },
      0
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
  const step2PanelRef = useRef(null);
  const toolkitPanelRef = useRef(null);
  const raysRef = useRef(null);
  const vector1_1Ref = useRef(null);
  // const vector1stRef = useRef(null);
  const vector2ndRef = useRef(null);
  const leftThunderRef = useRef(null);
  const rightThunderRef = useRef(null);
  const textRef = useRef(null);
  const combinedCircleContainerRef = useRef(null);
  const combinedCircleRef = useRef(null);

  // Toolkit section refs
  const toolkitBgRef = useRef(null);
  const text8Ref = useRef(null);
  const ovalMini1Ref = useRef(null);
  const ovalMini2Ref = useRef(null);
  const ovalMini3Ref = useRef(null);
  const oval1Ref = useRef(null);
  const oval2Ref = useRef(null);
  const oval3Ref = useRef(null);
  const fullOvalsContainerRef = useRef(null);
  const mobileOvalsContainerRef = useRef(null);

  // Orbit panel refs
  const orbitPanelRef = useRef(null);
  const pinkOrbitRef = useRef(null);
  const pinkOrbitInnerRef = useRef(null);
  const orbitStairsLeftRef = useRef(null);
  const orbitStairsRightRef = useRef(null);
  const orbitRightStairsMod3MobileRef = useRef(null);
  const orbitLeftStairsMod6MobileRef = useRef(null);
  const orbitText3Ref = useRef(null);
  const orbitSubtext1Ref = useRef(null);
  const orbitSubtext2Ref = useRef(null);
  const orbitWaitlistButtonRef = useRef(null);

  // Expose refs to parent
  React.useImperativeHandle(ref, () => ({
    container: containerRef.current,
    bg: bgRef.current,
    step2Panel: step2PanelRef.current,
    toolkitPanel: toolkitPanelRef.current,
    rays: raysRef.current,
    vector1_1: vector1_1Ref.current,
    // vector1st: vector1stRef.current,
    vector2nd: vector2ndRef.current,
    leftThunder: leftThunderRef.current,
    rightThunder: rightThunderRef.current,
    text: textRef.current,
    combinedCircleContainer: combinedCircleContainerRef.current,
    combinedCircle: combinedCircleRef.current,
    toolkitBg: toolkitBgRef.current,
    text8: text8Ref.current,
    ovalMini1: ovalMini1Ref.current,
    ovalMini2: ovalMini2Ref.current,
    ovalMini3: ovalMini3Ref.current,
    oval1: oval1Ref.current,
    oval2: oval2Ref.current,
    oval3: oval3Ref.current,
    fullOvalsContainer: fullOvalsContainerRef.current,
    mobileOvalsContainer: mobileOvalsContainerRef.current,
    // Orbit panel
    orbitPanel: orbitPanelRef.current,
    pinkOrbit: pinkOrbitRef.current,
    pinkOrbitInner: pinkOrbitInnerRef.current,
    orbitStairsLeft: orbitStairsLeftRef.current,
    orbitStairsRight: orbitStairsRightRef.current,
    orbitRightStairsMod3Mobile: orbitRightStairsMod3MobileRef.current,
    orbitLeftStairsMod6Mobile: orbitLeftStairsMod6MobileRef.current,
    orbitText3: orbitText3Ref.current,
    orbitSubtext1: orbitSubtext1Ref.current,
    orbitSubtext2: orbitSubtext2Ref.current,
    orbitWaitlistButton: orbitWaitlistButtonRef.current
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

      {/* ========== STEP 2 PANEL â€" slides up on exit ========== */}
      <div
        ref={step2PanelRef}
        style={{ position: "absolute", inset: 0, zIndex: 2 }}
      >
        {/* Rays Webinars SVG */}
        <img
          ref={raysRef}
          src={rays_webinars}
          alt="rays webinars"
          className="absolute inset-0 w-full h-full object-cover z-[2]"
        />

        {/* Vector 1_1 (opening shape â€" visible on entry, fades out as circle falls) */}
        <img
          ref={vector1_1Ref}
          src={isMobile ? vector1_1_mobile : vector1_1}
          alt="vector opening"
          className="absolute left-0 w-full z-[3]"
          style={{ bottom: 0, height: "auto" }}
        />

        {/* Vector 1st (intermediate shape â€" revealed by circle's weight pressing down) */}
        {/* <img
        ref={vector1stRef}
        src={isMobile ? vector_1st_mobile : vector_1st}
        alt="vector first"
        className="absolute left-0 w-full z-[3]"
        style={{
          bottom: 0,
          height: "auto",
          opacity: 0
        }}
      /> */}

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
            "text-[28px] leading-[1.2]", // ðŸ'ˆ reduced for mobile
            "[@media(min-height:812px)]:text-[32px]",
            "[@media(min-height:812px)]:leading-[1.2]",
            "md:text-[48px] md:leading-[1.2]",
            "[@media(min-width:1024px)]:[@media(min-height:900px)]:text-[64px]",
            "[@media(min-width:1024px)]:[@media(min-height:900px)]:leading-[1.2]"
          ].join(" ")}
          style={{
            top: "20%",
            maxWidth: isMobile ? "90%" : "80%",
            width: isMobile ? "95vw" : "80%",
            opacity: 0,
            color: "rgb(0, 0, 0)"
          }}
        >
          {isMobile ? (
            <>
              {/* <div>Home to fearless</div>
            <div>design and untamed</div>
            <div>creativity.</div> */}
              <div>where designers find</div>
              <div>their people, their niche,</div>
              <div>and their purpose.</div>
            </>
          ) : (
            <>
              <div>
                where designers find their people,
                <br />
                their niche, and their purpose.
              </div>
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
            bottom: isMobile ? "10%" : "-15%", // mobile: circle lands above vector1_1_mobile apex
            opacity: 0
          }}
        >
          <CombinedCircle ref={combinedCircleRef} isMobile={isMobile} />
        </div>

        {/* END step2Panel */}
      </div>

      {/* ========== TOOLKIT BACKGROUND â€" slides in with toolkit panel, behind orbit peek ========== */}
      <div
        ref={toolkitBgRef}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 3,
          background: "rgb(255,208,7)"
        }}
      />

      {/* ========== TOOLKIT PANEL â€" slides up from below, no background (bg is toolkitBg) ========== */}
      <div
        ref={toolkitPanelRef}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 5
        }}
      >
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
            bottom: isMobile ? "20%" : "20%",
            top: 0,
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? "8px" : "32px",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none"
          }}
        >
          <OvalMiniCard
            ref={ovalMini3Ref}
            logo={webinar_logo}
            style={{
              width: isMobile ? "21vw" : "200px",
              opacity: 0,
              pointerEvents: "none"
            }}
          />
          <OvalMiniCard
            ref={ovalMini2Ref}
            logo={mentorship_logo}
            style={{
              width: isMobile ? "21vw" : "200px",
              opacity: 0,
              pointerEvents: "none"
            }}
          />
          <OvalMiniCard
            ref={ovalMini1Ref}
            logo={community_logo}
            style={{
              width: isMobile ? "21vw" : "200px",
              opacity: 0,
              pointerEvents: "none"
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
            <OvalFullCard
              ref={oval1Ref}
              card="community"
              onClick={() => handleCardClick(1)}
              style={{ width: "330px", opacity: 0 }}
            />
            <OvalFullCard
              ref={oval2Ref}
              card="mentorship"
              onClick={() => handleCardClick(2)}
              style={{ width: "330px", opacity: 0 }}
            />
            <OvalFullCard
              ref={oval3Ref}
              card="webinar"
              onClick={() => handleCardClick(3)}
              style={{ width: "330px", opacity: 0 }}
            />
          </div>
        )}

        {/* Full Ovals Container - MOBILE - with clipping mask (REPLICATED FROM SCENE1_1) */}
        {isMobile && (
          <div
            ref={mobileOvalsContainerRef}
            className="absolute z-[16]"
            style={{
              left: 0,
              right: 0,
              top: 0,
              bottom: "20vh", // Boundary stops here (above text8)
              overflow: "hidden", // This clips the content
              pointerEvents: "none"
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
              <OvalFullCard
                ref={oval1Ref}
                card="community"
                onClick={() => handleCardClick(1)}
                style={{
                  position: "absolute",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "100%",
                  opacity: 0,
                  top: 0
                }}
              />

              <OvalFullCard
                ref={oval2Ref}
                card="mentorship"
                onClick={() => handleCardClick(2)}
                style={{
                  position: "absolute",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "100%",
                  opacity: 0,
                  top: 0
                }}
              />

              <OvalFullCard
                ref={oval3Ref}
                card="webinar"
                onClick={() => handleCardClick(3)}
                style={{
                  position: "absolute",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "100%",
                  opacity: 0,
                  top: 0
                }}
              />
            </div>
          </div>
        )}

        {/* END toolkitPanel */}
      </div>

      {/* ========== ORBIT PANEL — peeks 7% above toolkit bg, below toolkit cards ========== */}
      <div
        ref={orbitPanelRef}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 4,
          background: "rgb(255,208,7)",
          transform: "translateY(100vh)"
        }}
      >
        {/* Pink orbit — decorative ring, no circle inside */}
        <div
          ref={pinkOrbitRef}
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            bottom: isMobile ? "-2vh" : isTabletLandscape ? "-40vh" : "-60vh",
            width: isMobile ? "100%" : "80vw",
            height: "auto",
            opacity: 0,
            zIndex: 9
          }}
        >
          <img
            ref={pinkOrbitInnerRef}
            src={isMobile ? pink_bigger_orbit_mobile : pink_bigger_orbit}
            alt="pink orbit"
            className="w-full h-auto"
            style={{ transformOrigin: "center center" }}
          />
        </div>

        {/* Desktop stairs — left and right */}
        {!isMobile && (
          <>
            <div
              ref={orbitStairsLeftRef}
              className="absolute z-[10] pointer-events-none"
              style={{
                bottom: 0,
                left: 0,
                width: "40%",
                height: "auto",
                opacity: 0,
                transformOrigin: "bottom center"
              }}
            >
              <img
                src={stairs_left_new}
                alt="left stairs"
                style={{
                  width: "100%",
                  height: "auto",
                  maskImage:
                    "linear-gradient(to top, black 30%, transparent 70%)",
                  WebkitMaskImage:
                    "linear-gradient(to top, black 30%, transparent 70%)"
                }}
              />
            </div>
            <div
              ref={orbitStairsRightRef}
              className="absolute z-[10] pointer-events-none"
              style={{
                bottom: 0,
                right: 0,
                width: "40%",
                height: "auto",
                opacity: 0,
                transformOrigin: "bottom center"
              }}
            >
              <img
                src={stairs_right_new}
                alt="right stairs"
                style={{
                  width: "100%",
                  height: "auto",
                  maskImage:
                    "linear-gradient(to top, black 30%, transparent 70%)",
                  WebkitMaskImage:
                    "linear-gradient(to top, black 30%, transparent 70%)"
                }}
              />
            </div>
          </>
        )}

        {/* Mobile stairs */}
        {isMobile && (
          <>
            <img
              ref={orbitRightStairsMod3MobileRef}
              src={stairsfull_right_mobile}
              alt="stairsfull right mobile"
              className="absolute z-[10] pointer-events-none"
              style={{
                bottom: 0,
                left: 0,
                width: "auto",
                height: "auto",
                opacity: 0
              }}
            />
            <img
              ref={orbitLeftStairsMod6MobileRef}
              src={left_stairs_mod6_mobile}
              alt="left stairs mod6 mobile"
              className="absolute z-[10] pointer-events-none"
              style={{
                bottom: 0,
                left: 0,
                width: "auto",
                height: "auto",
                opacity: 0
              }}
            />
          </>
        )}

        {/* Text block — headline + subtexts stacked */}
        <div
          style={{
            position: "absolute",
            top: isMobile ? "25%" : "15%",
            left: "50%",
            transform: "translateX(-50%)",
            textAlign: "center",
            zIndex: 20,
            width: isMobile ? "88vw" : "60%",
            pointerEvents: "none"
          }}
        >
          {/* Headline */}
          <div
            ref={orbitText3Ref}
            style={{
              fontWeight: 800,
              fontSize: isMobile ? "2.2rem" : "3.5rem",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              color: "rgb(0,0,0)",
              opacity: 0
            }}
          >
            Your design growth,
            <br />
            in your pocket.
          </div>

          {/* Orbit subtext — one continuous sentence revealed in two parts */}
          <div
            style={{
              marginTop: isMobile ? "0.9rem" : "1.2rem",
              fontWeight: 400,
              fontSize: isMobile ? "1rem" : "1.2rem",
              lineHeight: 1.5,
              color: "black",
              textAlign: "center"
            }}
          >
            <span ref={orbitSubtext1Ref} style={{ opacity: 0 }}>
              {"The Evolve app is coming. a personal space to learn at your own pace, "}
            </span>
            {/* display:none removes it from layout until GSAP sets display:inline before fade-in */}
            <span ref={orbitSubtext2Ref} style={{ opacity: 0, display: "none" }}>
              {"track how far you've come, and stay curious about design every single day."}
            </span>
          </div>
        </div>

        {/* CTA button */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: isMobile ? "12%" : "10%",
            transform: "translateX(-50%)",
            zIndex: 20,
            pointerEvents: "none"
          }}
        >
          <a
            ref={orbitWaitlistButtonRef}
            // href="https://discord.gg/wKRYG7cSWt"
            href="https://chat.whatsapp.com/GDRw3ZPmkxyGzn6yyzaUcI"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              display: "inline-block",
              background: "rgb(20,20,20)",
              color: "#ffffff",
              padding: isMobile ? "13px 26px" : "15px 32px",
              borderRadius: "20px",
              fontSize: isMobile ? "1rem" : "1.1rem",
              fontWeight: 700,
              letterSpacing: "-0.01em",
              textDecoration: "none",
              cursor: "pointer",
              pointerEvents: "none",
              opacity: 0,
              willChange: "transform, opacity",
              whiteSpace: "nowrap"
            }}
          >
            Be the first to know
          </a>
        </div>
      </div>
    </section>
  );
});

SceneNew.displayName = "SceneNew";
export default SceneNew;
