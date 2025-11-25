import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import {
  yellow_bg,
  yellow_bg_mobile,
  right_cloud,
  right_cloud_mobile,
  left_cloud,
  left_cloud_mobile,
  floor_2nd,
  floor_2nd_mobile,
  left_element,
  left_element_mobile,
  right_element,
  right_element_mobile,
  left_element_eye,
  left_element_eye_mobile,
  right_element_eye,
  right_element_eye_mobile,
  yellow_ellipse,
  yellow_ellipse_mobile,
  object_1,
  object_2,
  bigger_orbit,
  bigger_orbit_mobile,
  pink_bigger_orbit, // ADD THIS
  pink_bigger_orbit_mobile, // ADD THIS
  left_stairs_mini, // ADD THIS
  right_stairs_mini, // ADD THIS
  stairs_mini_mobile, // ADD THIS
  stairs_mod_mobile, // ADD THIS
  stairs_left, // ADD THIS
  stairs_right, // ADD THIS
  stairs_mod1_mobile, // ADD THIS
  stairs_mod2_mobile, // ADD THIS NEW LINE
  left_stairs_mod3_mobile, // ADD THIS
  right_stairs_mod3_mobile, // ADD THIS
  curvey_circle_inner_part,
  curvey_circle_inner_logo_part,
  curvey_circle_without_inner_part,
  left_stairs_mod4_mobile, // ADD THIS
  right_stairs_mod4_mobile, // ADD THIS
  left_stairs_mod5_mobile, // ADD THIS
  right_stairs_mod5_mobile, // ADD THIS
  left_stairs_mod6_mobile, // ADD THIS
  right_stairs_mod6_mobile, // ADD THIS
  oval_mini_1, // ADD THIS
  oval_mini_2, // ADD THIS
  oval_mini_3, // ADD THIS
  oval_1, // ADD THIS
  oval_2, // ADD THIS
  oval_3, // ADD THIS
  stairs_left_1,
  stairs_right_1,
  stairs_left_2,
  stairs_right_2,
  stairs_left_new,
  stairs_right_new,
  stairs1_mobile, // ADD THIS
  stairs2_mobile, // ADD THIS
  stairs4_mobile, // ADD THIS
  stairsfull_right_mobile, // ADD THIS
  join_us_button
} from "../../assets/images/Home";

// Add this helper function at the top of your Scene1_1 file
// Add this helper function at the top of your Scene1_1 file (EXPORT IT)
export const setCompletedState = (refs, isMobile) => {
  if (!refs) return;

  // Show background
  gsap.set(refs.bg, {
    opacity: 1
  });

  // Show main elements in their "resting" positions
  gsap.set([refs.rightCloud, refs.leftCloud], {
    opacity: 1
    // y: 0
  });

  gsap.set(refs.floor, {
    opacity: 1
    // y: 0
  });

  gsap.set([refs.leftElement, refs.rightElement], {
    opacity: 1,
    // x: 0,
    // y: 0,
    scale: 1
  });

  // // Show first text
  // gsap.set(refs.text, {
  //   opacity: 1
  //   // y: 0
  // });

  // // Show all text spans at full opacity
  // if (refs.text) {
  //   const spans = Array.from(refs.text.querySelectorAll("span[data-text]"));
  //   gsap.set(spans, {
  //     opacity: 1,
  //     color: "rgb(0, 0, 0)"
  //   });
  // }

  // Show all texts at full opacity in completed state
  gsap.set([refs.text0, refs.text], {
    // ADD refs.text0 here
    opacity: 1
  });

  // Show all text spans at full opacity
  if (refs.text0) {
    // ADD THIS BLOCK
    const spans0 = Array.from(refs.text0.querySelectorAll("span[data-text0]"));
    gsap.set(spans0, {
      opacity: 1,
      color: "rgb(0, 0, 0)"
    });
  }

  if (refs.text) {
    const spans = Array.from(refs.text.querySelectorAll("span[data-text]"));
    gsap.set(spans, {
      opacity: 1,
      color: "rgb(0, 0, 0)"
    });
  }

  // Show ellipse
  gsap.set(refs.ellipse, {
    opacity: 1,
    scale: 1,
    y: 0
  });

  // Show bigger orbit in centered position
  gsap.set(refs.biggerOrbit, {
    opacity: 0.5,
    scale: isMobile ? 2.3 : 1
    // y: isMobile ? -250 : -200
  });

  // Hide objects (they've already fallen)
  gsap.set([refs.object1, refs.object2, refs.object3], {
    opacity: 0
  });

  gsap.set(refs.objectsContainer, {
    opacity: 0
  });

  // Hide secondary elements
  gsap.set(
    [
      refs.text2,
      refs.text3,
      refs.text4,
      refs.text5,
      refs.text6,
      refs.text7,
      refs.text8,
      refs.leftElementEye,
      refs.rightElementEye,
      refs.pinkBiggerOrbit,
      refs.combinedCircleContainer,
      refs.waitlistButton
    ],
    {
      opacity: 0,
      pointerEvents: "none" // ✅ Add this
    }
  );

  // Hide ovals
  gsap.set(
    [
      refs.ovalMini1,
      refs.ovalMini2,
      refs.ovalMini3,
      refs.oval1,
      refs.oval2,
      refs.oval3
    ],
    {
      opacity: 0
    }
  );
};

// Helper function to get screen-size-specific multipliers
const getScreenMultipliers = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  // ============================
  // 📱 TABLETS (portrait & landscape)
  // ============================
  // iPad Mini: 768×1024
  // iPad Air: 820×1180
  // iPad Pro: 834×1194 / 1024×1368
  // Surface Pro: 912×1368
  if (
    (width >= 700 && width <= 1368 && height >= 900 && height <= 1300) ||
    (height >= 700 && height <= 1180 && width >= 900 && width <= 1400)
  ) {
    // tablets should go more UP and less DOWN
    return { orbit: 1.345, stairs: 0.35 };
  }

  // Detect screen categories
  if (width <= 1440) {
    // Small laptops (13-14 inch) - current behavior
    return { orbit: 1, stairs: 0.9 };
  } else if (width <= 1920 && height <= 1200) {
    // Medium laptops (15-16 inch) - reduce movement by 30%
    return { orbit: 0.7, stairs: 0.85 };
  } else {
    // Large screens (17+ inch, 4K) - reduce movement by 50%
    return { orbit: 0.5, stairs: 0.7 };
  }
};

// Helper function to get element slide-in adjustments based on screen size
const getElementSlideMultipliers = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  if (
    (width >= 700 && width <= 1368 && height >= 900 && height <= 1300) ||
    (height >= 700 && height <= 1180 && width >= 900 && width <= 1400)
  ) {
    // tablets should go more UP and less DOWN
    return { downwardY: 0.7 };
  }

  // Detect screen categories for element downward movement
  if (width <= 1440) {
    // Small laptops (13-14 inch) - full movement (current behavior)
    return { downwardY: 1.2 };
  } else if (width <= 1680 && height <= 1050) {
    // 15-inch laptops - reduce by 25%
    return { downwardY: 1 };
  } else if (width <= 1920 && height <= 1200) {
    // 16-inch laptops (like MacBook Pro 16) - reduce by 40%
    return { downwardY: -0.5 };
  } else if (width <= 2560) {
    // Large displays - reduce by 50%
    return { downwardY: 0.5 };
  } else {
    // 4K and above - reduce by 60%
    return { downwardY: 0.4 };
  }
};

// // Helper function to get orbit vertical movement multipliers
// const getOrbitVerticalMultipliers = () => {
//   const width = window.innerWidth;
//   const height = window.innerHeight;

//   // Detect screen categories for orbit vertical movement
//   if (width <= 1368) {
//     // Small screens (below 14-inch) - LESS upward, MORE downward
//     return { upward: 0.7, downward: 1.3 };
//   } else if (width <= 1440) {
//     // 14-inch laptops - baseline (current behavior)
//     return { upward: 1.2, downward: 0.7 };
//   } else if (width <= 1680 && height <= 1050) {
//     // 15-inch laptops - MORE upward, LESS downward
//     return { upward: 0.9, downward: 1.1 };
//   } else if (width <= 1920 && height <= 1200) {
//     // 16-inch laptops - even MORE upward, even LESS downward
//     return { upward: 1.1, downward: 1 };
//   } else if (width <= 2560) {
//     // Large displays - significant increase upward, decrease downward
//     return { upward: 1.6, downward: 0.6 };
//   } else {
//     // 4K and above - maximum upward, minimum downward
//     return { upward: 1.8, downward: 0.5 };
//   }
// };

// Helper function to get orbit vertical movement multipliers
const getOrbitVerticalMultipliers = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  // ============================
  // 📱 TABLETS (portrait & landscape)
  // ============================
  // iPad Mini: 768×1024
  // iPad Air: 820×1180
  // iPad Pro: 834×1194 / 1024×1368
  // Surface Pro: 912×1368
  if (
    (width >= 700 && width <= 1368 && height >= 900 && height <= 1300) ||
    (height >= 700 && height <= 1180 && width >= 900 && width <= 1400)
  ) {
    // tablets should go more UP and less DOWN
    return { upward: 1.4, downward: 0.9 };
  }

  // ============================
  // 💻 SMALL LAPTOPS (below 14”)
  // ============================
  if (width <= 1368) {
    return { upward: 0.7, downward: 1.3 };
  }

  // ============================
  // 💻 14-inch laptops
  // ============================
  if (width <= 1440) {
    return { upward: 1.2, downward: 0.7 };
  }

  // ============================
  // 💻 15-inch laptops
  // ============================
  if (width <= 1680 && height <= 1050) {
    return { upward: 0.9, downward: 1.1 };
  }

  // ============================
  // 💻 16-inch laptops
  // ============================
  if (width <= 1920 && height <= 1200) {
    return { upward: 1.1, downward: 1.0 };
  }

  // ============================
  // 🖥️ large displays (2K, ultrawide)
  // ============================
  if (width <= 2560) {
    return { upward: 1.6, downward: 0.6 };
  }

  // ============================
  // 🖥️ 4K & beyond
  // ============================
  return { upward: 1.8, downward: 0.5 };
};

const isTabletLandscape = (() => {
  const w = window.innerWidth;
  const h = window.innerHeight;

  // Example tablet-landscape breakpoints:
  // iPad 1024 × 768
  // iPad Air 1180 × 820
  // iPad Pro 1368 × 1024
  return (
    w >= 900 &&
    w <= 1400 && // width in tablet-landscape range
    h >= 600 &&
    h <= 1100 // height in landscape range
  );
})();

// Timeline hook for Scene1_1 animation - works with master timeline
export const useScene1_1Timeline = (refs, isMobile) => {
  const tl = gsap.timeline();

  // Get screen multipliers for responsive movement
  const multipliers = getScreenMultipliers();

  // Get element slide-in multipliers (ADD THIS)
  const elementMultipliers = getElementSlideMultipliers();

  // Get orbit vertical movement multipliers (ADD THIS)
  const orbitVerticalMultipliers = getOrbitVerticalMultipliers();

  // Get object size for calculations
  const objectSize = isMobile ? 44 : 70;
  const mobileObjGap = isMobile ? 8 : 24;

  // Set initial states with will-change for performance
  tl.set(refs.rightCloud, {
    opacity: 0,
    y: -50,
    willChange: "transform, opacity"
  })
    .set(refs.leftCloud, {
      opacity: 0,
      y: 80,
      willChange: "transform, opacity"
    })
    .set(refs.floor, { opacity: 0, y: 150, willChange: "transform, opacity" })
    .set(refs.leftElement, {
      opacity: 0,
      x: -200,
      willChange: "transform, opacity"
    })
    .set(refs.rightElement, {
      opacity: 0,
      x: 200,
      willChange: "transform, opacity"
    })
    .set(refs.text0, { opacity: 0, y: 10, willChange: "transform, opacity" }) // ADD THIS LINE
    .set(refs.text, { opacity: 0, y: 10, willChange: "transform, opacity" })
    .set(refs.text2, { opacity: 0, y: 0, willChange: "transform, opacity" })
    .set(refs.objectsContainer, {
      opacity: 0,
      y: 0,
      willChange: "transform, opacity"
    })
    .set(refs.ellipse, {
      opacity: 0,
      scale: 1,
      willChange: "transform, opacity"
    })
    .set(refs.biggerOrbit, {
      opacity: 0,
      scale: 0.5,
      y: 0,
      willChange: "transform, opacity"
    })
    .set(refs.waitlistButton, {
      // ✅ ADD THIS
      opacity: 0,
      scale: 0.9,
      pointerEvents: "none",
      willChange: "transform, opacity"
    })
    .set([refs.object1, refs.object2, refs.object3], {
      y: 0,
      opacity: 1,
      scale: 1,
      willChange: "transform, opacity"
    });

  // Entrance animations - clouds/floor/elements (0-3s)
  tl.to(refs.rightCloud, { opacity: 1, y: 0, duration: 1, ease: "power2.out" })
    .to(
      refs.leftCloud,
      { opacity: 1, y: 0, duration: 1, ease: "power2.out" },
      "-=0.6"
    )
    .to(
      refs.floor,
      { opacity: 1, y: 0, duration: 1.2, ease: "power2.out" },
      "-=0.6"
    )
    .to(
      refs.leftElement,
      { opacity: 1, x: 0, duration: 1, ease: "back.out(1.7)" },
      1.2
    )
    .to(
      refs.rightElement,
      { opacity: 1, x: 0, duration: 1, ease: "back.out(1.7)" },
      // "-=0.8"
      1.2
    );

  // // ===== TEXT APPEARS FIRST (1.5s) =====
  // tl.to(
  //   refs.text,
  //   { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
  //   1.5
  // );
  // ===== NEW TEXT0 APPEARS WITH ELEMENTS (1.5s) =====
  tl.to(
    refs.text0,
    { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
    1.5
  );

  // Animate text0 spans with stagger
  if (refs.text0) {
    const spans0 = Array.from(refs.text0.querySelectorAll("span[data-text0]"));

    spans0.forEach((span) => {
      gsap.set(span, {
        opacity: 0.1,
        color: "rgb(0, 0, 0)",
        willChange: "opacity"
      });
    });

    spans0.forEach((span, idx) => {
      tl.to(
        span,
        {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out"
        },
        1.5 + idx * 0.35
      );
    });
  }

  // Fade out text0 before showing main text
  tl.to(
    refs.text0,
    {
      opacity: 0,
      duration: 0.6,
      ease: "power2.out"
    },
    4.8 // Fades out right before main text appears
  );

  // ===== MAIN TEXT APPEARS (now at 3.5s instead of 1.5s) =====
  tl.to(
    refs.text,
    { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
    5.2 // Changed from 1.5 to 3.5
  );

  // ===== BIGGER ORBIT APPEARS (at 20% scale, half visible above floor) =====
  // tl.to(refs.biggerOrbit, { opacity: 0.5, duration: 0.6 }, 2.0);
  tl.to(refs.biggerOrbit, { opacity: 0.5, duration: 0.6 }, 5.6);

  // ===== THEN OBJECTS APPEAR (reduced time gap) =====
  // tl.to(refs.objectsContainer, { opacity: 1, duration: 0.6 }, 3.5);
  tl.to(refs.objectsContainer, { opacity: 1, duration: 0.6 }, 7.3);

  // ===== OBJECTS START FALLING (4.5s) =====
  const fallDuration = 2.5;
  // const fallStart = 4.5;
  const fallStart = 6.7;

  // ===== TEXT ANIMATION HAPPENS WHILE OBJECTS ARE FALLING =====
  // Text animates up to "misfits" (first 5 words) during fall
  if (refs.text) {
    const spans = Array.from(refs.text.querySelectorAll("span[data-text]"));

    // Set all spans to start at 0.3 opacity - but let them animate to full black
    spans.forEach((span) => {
      gsap.set(span, {
        opacity: 0.1,
        color: "rgb(0, 0, 0)",
        willChange: "opacity"
      });
    });

    // Find the index where "misfits" appears (word 5: Here, you'll, find, mentors, misfits)
    let misfitsIndex = -1;
    spans.forEach((span, idx) => {
      if (span.textContent.includes("misfits")) {
        misfitsIndex = idx;
      }
    });

    const firstPhaseEnd = misfitsIndex >= 0 ? misfitsIndex : 4; // Up to and including "misfits"

    // PHASE 1: Animate words up to "misfits" while objects fall
    spans.forEach((span, idx) => {
      if (idx <= firstPhaseEnd) {
        tl.to(
          span,
          {
            opacity: 1,
            duration: 0.4,
            ease: "power2.out"
          },
          4.5 + idx * 0.4 // Stagger during fall
        );
      }
    });

    // Slight upward movement of entire text block during first phase
    tl.to(
      refs.text,
      {
        y: -10,
        duration: 2.0,
        ease: "power2.out"
      },
      4.5
    );
  }

  // Calculate fall distance: objects should reach ellipse center and stop there
  // const calculateFallDistance = () => {
  //   if (!refs.objectsContainer) return isMobile ? 250 : 350;

  //   try {
  //     const objectsRect = refs.objectsContainer.getBoundingClientRect();
  //     const viewportHeight = window.innerHeight;

  //     // Ellipse dimensions
  //     const ellipseHeight = isMobile ? 300 * 0.4 : 560 * 0.3; // Approximate height (30% of width)
  //     const ellipseBottom = isMobile
  //       ? viewportHeight * 0.09
  //       : viewportHeight * 0.05;

  //     // Target is ellipse center (bottom + half height)
  //     const ellipseCenter = viewportHeight - ellipseBottom - ellipseHeight / 2;

  //     // Current object position
  //     const objectsCenterY = isMobile
  //       ? objectsRect.bottom - objectSize / 2 // Mobile: bottom object center
  //       : objectsRect.top + objectsRect.height / 2; // Desktop: container center

  //     const distance = ellipseCenter - objectsCenterY;

  //     console.log("Fall calculation:", {
  //       ellipseCenter,
  //       objectsCenterY,
  //       distance,
  //       isMobile
  //     });

  //     return distance > 0 ? distance : isMobile ? 250 : 350;
  //   } catch (error) {
  //     console.error("Error calculating fall distance:", error);
  //     return isMobile ? 250 : 350;
  //   }
  // };
  // Calculate fall distance: objects should reach ellipse center and stop there
  const calculateFallDistance = () => {
    // slightly smaller base distance for mobile
    const MOBILE_FALLBACK = 200;
    const DESKTOP_FALLBACK = 350;

    if (!refs.objectsContainer)
      return isMobile ? MOBILE_FALLBACK : DESKTOP_FALLBACK;

    try {
      const objectsRect = refs.objectsContainer.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Ellipse dimensions
      const ellipseHeight = isMobile ? 300 * 0.4 : 560 * 0.3; // Approx height
      const ellipseBottom = isMobile
        ? viewportHeight * 0.09
        : viewportHeight * 0.05;

      // Target is ellipse center (bottom + half height)
      const ellipseCenter = viewportHeight - ellipseBottom - ellipseHeight / 2;

      // Current object position
      const objectsCenterY = isMobile
        ? objectsRect.bottom - objectSize / 2 // Mobile: bottom object center
        : objectsRect.top + objectsRect.height / 2; // Desktop: container center

      let distance = ellipseCenter - objectsCenterY;

      // 🔽 make mobile fall "a bit" smaller
      if (isMobile) {
        distance *= 0.5; // tweak this (0.7 / 0.85) if you want more / less
      }

      console.log("Fall calculation:", {
        ellipseCenter,
        objectsCenterY,
        distance,
        isMobile
      });

      return distance > 0
        ? distance
        : isMobile
        ? MOBILE_FALLBACK
        : DESKTOP_FALLBACK;
    } catch (error) {
      console.error("Error calculating fall distance:", error);
      return isMobile ? MOBILE_FALLBACK : DESKTOP_FALLBACK;
    }
  };

  const fallDistance = calculateFallDistance();

  // Objects fall into ellipse with smooth easing
  if (isMobile) {
    // MOBILE: Objects stacked vertically - each disappears when it reaches ellipse center
    const baseDistance = fallDistance;
    const objectGap = objectSize + mobileObjGap;

    tl.to(
      refs.object3,
      {
        y: baseDistance,
        duration: fallDuration,
        ease: "power1.inOut"
      },
      fallStart
    );

    tl.to(
      refs.object2,
      {
        y: baseDistance + objectGap,
        duration: fallDuration,
        ease: "power1.inOut"
      },
      fallStart
    );

    tl.to(
      refs.object1,
      {
        y: baseDistance + objectGap * 2,
        duration: fallDuration,
        ease: "power1.inOut"
      },
      fallStart
    );
  } else {
    // DESKTOP: Objects side by side - all reach center together
    tl.to(
      [refs.object1, refs.object2, refs.object3],
      {
        y: fallDistance,
        duration: fallDuration,
        ease: "power1.inOut",
        stagger: 0.1
      },
      fallStart
    );
  }

  // ===== ELLIPSE APPEARS WHEN OBJECTS ARE FALLING (6s) =====
  tl.to(refs.ellipse, { opacity: 1, duration: 0.8 }, 6.0);

  // ===== OBJECTS SHRINK AND VANISH INSIDE ELLIPSE =====
  const shrinkStart = fallStart + fallDuration - 1.0;

  if (isMobile) {
    const shrinkDuration = 0.8;
    const staggerTime = 0.5;

    tl.to(
      refs.object3,
      {
        scale: 0,
        opacity: 0,
        duration: shrinkDuration,
        ease: "power2.in"
      },
      shrinkStart
    );

    tl.to(
      refs.object2,
      {
        scale: 0,
        opacity: 0,
        duration: shrinkDuration,
        ease: "power2.in"
      },
      shrinkStart + staggerTime
    );

    tl.to(
      refs.object1,
      {
        scale: 0,
        opacity: 0,
        duration: shrinkDuration,
        ease: "power2.in"
      },
      shrinkStart + staggerTime * 2
    );
  } else {
    tl.to(
      [refs.object1, refs.object2, refs.object3],
      {
        scale: 0,
        opacity: 0,
        duration: 1.5,
        ease: "power2.in",
        stagger: 0.1
      },
      shrinkStart
    );
  }

  // Ellipse pulse effect when objects enter - KEEP OPACITY AT 1
  tl.to(
    refs.ellipse,
    {
      scale: 1.08,
      duration: 0.6,
      ease: "power2.out"
    },
    shrinkStart
  ).to(
    refs.ellipse,
    {
      scale: 1,
      duration: 0.8,
      ease: "power2.inOut"
    },
    shrinkStart + 0.6
  );

  // ===== AFTER OBJECTS DISAPPEAR: TRANSITION PHASE =====
  const transitionStart = shrinkStart + (isMobile ? 2.0 : 1.5);

  // 1. Scale down ellipse to 0 (happens first)
  tl.to(
    refs.ellipse,
    {
      y: 300,
      opacity: 0,
      duration: 1.2,
      ease: "power2.inOut"
    },
    transitionStart
  );

  // 2. Floor goes down (happens after ellipse disappears)
  tl.to(
    refs.floor,
    {
      y: 300,
      opacity: 0,
      duration: 1.2,
      ease: "power2.inOut"
    },
    // transitionStart + 0.8
    transitionStart
  );

  // 3. Bigger orbit scales up but stays BEFORE center (happens after floor starts disappearing)
  const orbitBeforeCenterY = isMobile ? -50 : -80; // Not fully centered yet
  const orbitScale = isMobile ? 2 : 1; // Bigger for mobile

  tl.to(
    refs.biggerOrbit,
    {
      scale: orbitScale,
      y: orbitBeforeCenterY,
      opacity: 0.5,
      duration: 1.8,
      ease: "power2.out"
    },
    transitionStart + 1.0
  );

  // Start continuous rotation (anti-clockwise)
  // gsap.to(refs.biggerOrbit, {
  //   rotation: -360,
  //   duration: 20,
  //   ease: "none",
  //   repeat: -1
  // });

  // ===== PHASE 2: REMAINING TEXT ANIMATES AFTER OBJECTS VANISH =====
  if (refs.text) {
    const spans = Array.from(refs.text.querySelectorAll("span[data-text]"));

    let misfitsIndex = -1;
    spans.forEach((span, idx) => {
      if (span.textContent.includes("misfits")) {
        misfitsIndex = idx;
      }
    });

    const firstPhaseEnd = misfitsIndex >= 0 ? misfitsIndex : 4;

    // Animate remaining words ("and", "midnight", "breakthroughs")
    spans.forEach((span, idx) => {
      if (idx > firstPhaseEnd) {
        const relativeIdx = idx - firstPhaseEnd - 1;
        tl.to(
          span,
          {
            opacity: 1,
            duration: 0.4,
            ease: "power2.out"
          },
          8.5 + relativeIdx * 0.4
        );
      }
    });

    // Fade out first text completely
    const textFadeOutStart = transitionStart + 2.5;
    tl.to(
      refs.text,
      {
        opacity: 0,
        duration: 0.6,
        ease: "power2.out"
      },
      textFadeOutStart
    );
  }

  // ===== NEW TEXT APPEARS: "It's where you learn to make the world stop and notice your designs" =====
  const newTextStart = transitionStart + 3.2;

  if (refs.text2) {
    // Set initial state for new text
    tl.set(refs.text2, { opacity: 1, y: 0 }, newTextStart);

    const spans2 = Array.from(refs.text2.querySelectorAll("span[data-text2]"));

    // Set all spans to start at 0.3 opacity
    spans2.forEach((span) => {
      gsap.set(span, {
        opacity: 0.1,
        color: "rgb(0, 0, 0)",
        willChange: "opacity"
      });
    });

    // Find the index where "stop" appears
    let stopIndex = -1;
    spans2.forEach((span, idx) => {
      if (span.textContent.includes("stop")) {
        stopIndex = idx;
      }
    });

    const firstPhaseEnd2 = stopIndex >= 0 ? stopIndex : 7; // Up to and including "stop"

    // PHASE 1: Animate words up to "stop" (fade to full opacity)
    spans2.forEach((span, idx) => {
      if (idx <= firstPhaseEnd2) {
        tl.to(
          span,
          {
            opacity: 1,
            duration: 0.4,
            ease: "power2.out"
          },
          newTextStart + idx * 0.35
        );
      }
    });

    // Calculate when "stop" animation completes
    const stopAnimationEnd = newTextStart + firstPhaseEnd2 * 0.35 + 0.4;
    // Eyes follow the same position as their parent elements during slide-in
    // Set initial states to match parent elements
    // Eyes follow the same position as their parent elements during slide-in
    // Set initial states to match parent elements (they start off-screen like base elements)
    tl.set(
      refs.leftElementEye,
      {
        opacity: 0,
        scale: 1, // Start at normal scale
        x: 0, // No x offset initially
        y: 0, // No y offset initially
        willChange: "transform, opacity"
      },
      stopAnimationEnd
    );

    tl.set(
      refs.rightElementEye,
      {
        opacity: 0,
        scale: 1, // Start at normal scale
        x: 0, // No x offset initially
        y: 0, // No y offset initially
        willChange: "transform, opacity"
      },
      stopAnimationEnd
    );

    // Eyes slide in with same timing and position as base elements
    if (isMobile) {
      // Mobile: Left eye - use same transform as left element
      tl.fromTo(
        refs.leftElementEye,
        {
          x: 0,
          y: 0
        },
        {
          y: "8vh",
          left: "-5%",
          scale: 1,
          duration: 1.2,
          ease: "power2.in"
        },
        stopAnimationEnd
      );

      // Mobile: Right eye - use same transform as right element
      tl.fromTo(
        refs.rightElementEye,
        {
          x: 0,
          y: 0
        },
        {
          y: "15vh",
          right: "-5%",
          scale: 1.5,
          duration: 1.2,
          ease: "power2.in"
        },
        stopAnimationEnd
      );
      // } else {
      //   // Desktop: Both eyes same size and position
      //   tl.fromTo(
      //     refs.leftElementEye,
      //     {
      //       x: 0,
      //       y: 0
      //     },
      //     {
      //       y: "15vh",
      //       left: "-2.5%",
      //       scale: 1.2,
      //       duration: 1.2,
      //       ease: "power2.in"
      //     },
      //     stopAnimationEnd
      //   );

      //   tl.fromTo(
      //     refs.rightElementEye,
      //     {
      //       x: 0,
      //       y: 0
      //     },
      //     {
      //       y: "15vh",
      //       right: "-2.5%",
      //       scale: 1.2,
      //       duration: 1.2,
      //       ease: "power2.in"
      //     },
      //     stopAnimationEnd
      //   );
      // }
    } else {
      // Desktop: Both eyes same size and position - responsive to screen size
      const baseDownwardMovement = 15; // Base 15vh for small laptops
      const adjustedY = `${
        baseDownwardMovement * elementMultipliers.downwardY
      }vh`;

      tl.fromTo(
        refs.leftElementEye,
        {
          x: 0,
          y: 0
        },
        {
          y: adjustedY, // Adjusted downward movement
          left: "-2.5%",
          scale: 1.2,
          duration: 1.2,
          ease: "power2.in"
        },
        stopAnimationEnd
      );

      tl.fromTo(
        refs.rightElementEye,
        {
          x: 0,
          y: 0
        },
        {
          y: adjustedY, // Adjusted downward movement
          right: "-2.5%",
          scale: 1.2,
          duration: 1.2,
          ease: "power2.in"
        },
        stopAnimationEnd
      );
    }

    const eyesOpenStart = stopAnimationEnd + 1.2;

    tl.to(
      [refs.leftElementEye, refs.rightElementEye],
      {
        opacity: 1,
        duration: 0.6,
        ease: "power2.out"
      },
      eyesOpenStart
    );

    // Set initial state for pink orbit (same position as yellow orbit BEFORE it moved)
    tl.set(
      refs.pinkBiggerOrbit,
      {
        opacity: 0,
        scale: isMobile ? 2 : 1, // Same scale as yellow orbit currently has
        y: isMobile ? -50 : -80, // Same position where yellow orbit is NOW (orbitBeforeCenterY)
        willChange: "transform, opacity"
      },
      eyesOpenStart
    );

    // IMMEDIATELY crossfade yellow to pink (while eyes open)
    tl.to(
      refs.biggerOrbit,
      {
        opacity: 0,
        duration: 0.6,
        ease: "power2.out"
      },
      eyesOpenStart // Same timing as eyes
    );

    tl.to(
      refs.pinkBiggerOrbit,
      {
        // opacity: 0.5, // 50% opacity
        opacity: 1, // 50% opacity
        duration: 0.6,
        ease: "power2.out"
      },
      eyesOpenStart // Same timing as eyes and yellow fade
    );

    // Pink orbit IMAGE at 50% opacity
    tl.to(
      refs.pinkOrbitInner, // ✅ Only animate the INNER image
      {
        opacity: 0.5,
        duration: 0.6,
        ease: "power2.out"
      },
      eyesOpenStart
    );

    // THEN elements disappear
    const elementsDisappearStart = eyesOpenStart + 1.0;

    // Fade out both base elements and eye elements
    tl.to(
      [refs.leftElement, refs.leftElementEye],
      {
        opacity: 0,
        duration: 0.8,
        ease: "power2.inOut"
      },
      elementsDisappearStart
    );

    tl.to(
      [refs.rightElement, refs.rightElementEye],
      {
        opacity: 0,
        duration: 0.8,
        ease: "power2.inOut"
      },
      elementsDisappearStart
    );

    // Fade out second text along with elements (ADD THIS)
    tl.to(
      refs.text2,
      {
        opacity: 0,
        duration: 0.8,
        ease: "power2.inOut"
      },
      elementsDisappearStart
    );

    // Pink orbit moves up (desktop) or left (mobile)
    const orbitMoveUpStart = elementsDisappearStart + 0.8;

    if (isMobile) {
      tl.to(
        refs.pinkBiggerOrbit,
        {
          x: "-50vw", // Move towards left for mobile
          // y: "-20%",
          duration: 1.2,
          ease: "power2.out"
        },
        orbitMoveUpStart
      );
    } else {
      // tl.to(
      //   refs.pinkBiggerOrbit,
      //   {
      //     y: "-35%", // Move more upwards for desktop
      //     duration: 1.2,
      //     ease: "power2.out"
      //   },
      //   orbitMoveUpStart
      // );

      tl.to(
        refs.pinkBiggerOrbit,
        {
          y: `${-35 * orbitVerticalMultipliers.upward}%`, // Responsive upward movement
          duration: 1.2,
          ease: "power2.out"
        },
        orbitMoveUpStart
      );
    }

    // ===== THIRD TEXT APPEARS: "With Evolve, you get to build" =====
    const text3AppearStart = orbitMoveUpStart + 1.2;

    // Set initial state for text3
    tl.set(
      refs.text3,
      {
        opacity: 1, // Appears directly without fade
        y: 0,
        willChange: "opacity"
      },
      text3AppearStart
    );

    // ===== STAIRS ANIMATION =====
    const stairsAnimateStart = text3AppearStart;

    // ===== SIMULTANEOUS ANIMATIONS AFTER STAIRS =====
    const nextPhaseStart = stairsAnimateStart + 1.5;

    // MOBILE STAIRS ANIMATION - COMPLETE TIMELINE
    // if (isMobile) {
    //   const mobileStairsStart = text3AppearStart + 0.5;

    //   // Step 1: stairs1_mobile appears at bottom left
    //   tl.set(
    //     refs.stairsMod1Mobile,
    //     {
    //       opacity: 0,
    //       willChange: "transform, opacity"
    //     },
    //     mobileStairsStart
    //   );

    //   tl.to(
    //     refs.stairsMod1Mobile,
    //     {
    //       opacity: 1,
    //       duration: 0,
    //       ease: "power2.out"
    //     },
    //     mobileStairsStart
    //   );

    //   // Step 2: stairs2_mobile appears on top (duration 0, full opacity)
    //   const stairs2Start = mobileStairsStart + 1.5;

    //   tl.to(
    //     refs.stairsMod2Mobile,
    //     {
    //       opacity: 1,
    //       duration: 0,
    //       ease: "power2.out"
    //     },
    //     stairs2Start
    //   );

    //   // Step 3: Orbit goes up + "real design" text + stairs4_mobile appears
    //   const stairs4Start = stairs2Start + 1.5;

    //   // stairs4_mobile appears with full opacity on same position
    //   tl.to(
    //     refs.leftStairsMod3Mobile,
    //     {
    //       opacity: 1,
    //       duration: 0,
    //       ease: "power2.out"
    //     },
    //     stairs4Start
    //   );

    //   // Orbit moves upwards
    //   tl.to(
    //     refs.pinkBiggerOrbit,
    //     {
    //       y: "-=15vh",
    //       duration: 1.0,
    //       ease: "power2.out"
    //     },
    //     stairs4Start
    //   );

    //   // Text5 appears: "real design,"
    //   tl.set(
    //     refs.text5,
    //     {
    //       opacity: 0,
    //       willChange: "opacity"
    //     },
    //     stairs4Start
    //   );

    //   tl.to(
    //     refs.text5,
    //     {
    //       opacity: 1,
    //       duration: 0.6,
    //       ease: "power2.out"
    //     },
    //     stairs4Start + 0.8
    //   );

    //   // Step 4: "real portfolio" text + orbit moves right + stairsfull_right_mobile appears and slides
    //   const portfolioStart = stairs4Start + 2.0;

    //   // Orbit moves rightwards
    //   tl.to(
    //     refs.pinkBiggerOrbit,
    //     {
    //       x: "+=10vw",
    //       duration: 1.0,
    //       ease: "power2.out"
    //     },
    //     portfolioStart
    //   );

    //   tl.set(
    //     [
    //       refs.leftStairsMod3Mobile,
    //       refs.stairsMod1Mobile,
    //       refs.stairsMod2Mobile
    //     ],
    //     { opacity: 0 },
    //     portfolioStart
    //   );

    //   // stairsfull_right_mobile appears at left: 0 with full opacity
    //   tl.set(
    //     refs.rightStairsMod3Mobile,
    //     {
    //       opacity: 1,
    //       // scale: 0.8,
    //       width: "80%",
    //       duration: 0,
    //       ease: "power2.out"
    //     },
    //     portfolioStart
    //   );

    //   // Then slide it to right
    //   tl.to(
    //     refs.rightStairsMod3Mobile,
    //     {
    //       right: "-10%",
    //       left: "auto",
    //       duration: 1.5,
    //       ease: "power1.out"
    //     },
    //     portfolioStart + 0.2
    //   );

    //   // Text5 fades out
    //   tl.to(
    //     refs.text5,
    //     {
    //       opacity: 0,
    //       duration: 0.4,
    //       ease: "power2.out"
    //     },
    //     portfolioStart
    //   );

    //   // Text6 appears: "real portfolio,"
    //   tl.set(
    //     refs.text6,
    //     {
    //       opacity: 0,
    //       willChange: "opacity"
    //     },
    //     portfolioStart + 0.4
    //   );

    //   tl.to(
    //     refs.text6,
    //     {
    //       opacity: 1,
    //       duration: 0.6,
    //       ease: "power2.out"
    //     },
    //     portfolioStart + 0.8
    //   );

    //   // Step 5: "real career" text + orbit moves down + stairsfull_right_mobile scales down and pushes right+bottom
    //   const careerStart = portfolioStart + 2.0;

    //   // Orbit moves down and more right
    //   tl.to(
    //     refs.pinkBiggerOrbit,
    //     {
    //       x: "+=15vw",
    //       y: "+=10vh",
    //       duration: 1.0,
    //       ease: "power2.out"
    //     },
    //     careerStart
    //   );

    //   // stairsfull_right_mobile scales down and moves more right and bottom
    //   tl.to(
    //     refs.rightStairsMod3Mobile,
    //     {
    //       scale: 0.8,
    //       right: "-10%",
    //       bottom: "-10%",
    //       duration: 1.0,
    //       ease: "power2.out"
    //     },
    //     careerStart
    //   );

    //   // Text6 fades out
    //   tl.to(
    //     refs.text6,
    //     {
    //       opacity: 0,
    //       duration: 0.4,
    //       ease: "power2.out"
    //     },
    //     careerStart
    //   );

    //   // Text7 appears: "real career beginnings..."
    //   tl.set(
    //     refs.text7,
    //     {
    //       opacity: 0,
    //       willChange: "opacity"
    //     },
    //     careerStart + 0.4
    //   );

    //   tl.to(
    //     refs.text7,
    //     {
    //       opacity: 1,
    //       duration: 0.6,
    //       ease: "power2.out"
    //     },
    //     careerStart + 0.8
    //   );

    //   // Step 6: Orbit centers + stairsfull_right_mobile pushes more right + left_stairs_mod6_mobile slides in
    //   const centerCircleStart = careerStart + 2.0;

    //   // Remove all texts
    //   tl.to(
    //     [refs.text3, refs.text7],
    //     {
    //       opacity: 0,
    //       duration: 0.4,
    //       ease: "power2.out"
    //     },
    //     centerCircleStart
    //   );

    //   // Orbit moves to center (reset x to 0 and adjust y)
    //   tl.to(
    //     refs.pinkBiggerOrbit,
    //     {
    //       x: 0,
    //       y: "-25vh",
    //       duration: 1.2,
    //       ease: "power2.out"
    //     },
    //     centerCircleStart
    //   );

    //   // Push stairsfull_right_mobile even more right
    //   tl.to(
    //     refs.rightStairsMod3Mobile,
    //     {
    //       right: "-52%",
    //       bottom: "-12%",
    //       scale: 1.12,
    //       duration: 1.0,
    //       ease: "power2.out"
    //     },
    //     centerCircleStart
    //   );

    //   // left_stairs_mod6_mobile slides in from left (-100% to 0%)
    //   tl.fromTo(
    //     refs.leftStairsMod6Mobile,
    //     {
    //       opacity: 1,
    //       left: "-100%",
    //       width: "35%",
    //       bottom: 0
    //     },
    //     {
    //       left: "-8%",
    //       duration: 1.2,
    //       ease: "power2.out"
    //     },
    //     centerCircleStart + 0.3
    //   );

    //   // Combined circle container - position it at orbit center
    //   tl.set(
    //     refs.combinedCircleContainer,
    //     {
    //       opacity: 1
    //     },
    //     centerCircleStart
    //   );

    //   // Combined circle appears at center (very small scale) - OUTER PART ONLY
    //   if (refs.combinedCircle?.outer) {
    //     tl.set(
    //       refs.combinedCircle.outer,
    //       {
    //         opacity: 0,
    //         scale: 0.3,
    //         willChange: "transform, opacity"
    //       },
    //       centerCircleStart
    //     );

    //     tl.to(
    //       refs.combinedCircle.outer,
    //       {
    //         opacity: 1,
    //         duration: 0.6,
    //         ease: "power2.out"
    //       },
    //       centerCircleStart + 0.8
    //     );
    //   }

    //   // Continue with rest of the mobile animation (zoom effect, etc.)
    //   // Step 7: Zoom effect + inner circle reveals
    //   const zoomStart = centerCircleStart + 3.0;

    //   // Orbit scales up (zoom effect)
    //   tl.to(
    //     refs.pinkBiggerOrbit,
    //     {
    //       scale: "+=0.5",
    //       duration: 1.5,
    //       ease: "power2.inOut"
    //     },
    //     zoomStart
    //   );

    //   // Combined circle OUTER scales up
    //   if (refs.combinedCircle?.outer) {
    //     tl.to(
    //       refs.combinedCircle.outer,
    //       {
    //         scale: 0.7,
    //         duration: 1.5,
    //         ease: "power2.inOut"
    //       },
    //       zoomStart
    //     );
    //   }

    //   // Inner part becomes visible and scales up
    //   if (refs.combinedCircle?.inner) {
    //     tl.set(
    //       refs.combinedCircle.inner,
    //       {
    //         opacity: 0,
    //         scale: 0.3
    //       },
    //       zoomStart
    //     );

    //     tl.to(
    //       refs.combinedCircle.inner,
    //       {
    //         opacity: 1,
    //         scale: 0.7,
    //         duration: 1.2,
    //         ease: "power2.out"
    //       },
    //       zoomStart + 0.5
    //     );
    //   }

    //   // Remove old stairs
    //   tl.to(
    //     [
    //       refs.stairsMod1Mobile,
    //       refs.stairsMod2Mobile,
    //       refs.leftStairsMod3Mobile
    //       // refs.rightStairsMod3Mobile
    //     ],
    //     {
    //       opacity: 0,
    //       duration: 0.4,
    //       ease: "power2.out"
    //     },
    //     zoomStart
    //   );

    //   // Step 8: Orbit moves up + circle moves up + button appears
    //   const step8Start = zoomStart + 2.5;

    //   // Orbit and combined circle move up together
    //   tl.to(
    //     refs.pinkBiggerOrbit,
    //     {
    //       y: "-=10vh",
    //       duration: 1.2,
    //       ease: "power2.out"
    //     },
    //     step8Start
    //   );

    //   // Waitlist button appears
    //   tl.fromTo(
    //     refs.waitlistButton,
    //     {
    //       opacity: 0,
    //       y: 30,
    //       scale: 0.9,
    //       pointerEvents: "none"
    //     },
    //     {
    //       opacity: 1,
    //       y: 0,
    //       scale: 1,
    //       pointerEvents: "auto",
    //       duration: 1.0,
    //       ease: "back.out(1.5)"
    //     },
    //     step8Start + 0.8
    //   );

    //   // Step 9: Remove elements + orbit moves down + toolkit text + mini ovals appear
    //   const step9Start = step8Start + 2.5;

    //   // Remove waitlist button and CLOUDS
    //   tl.to(
    //     refs.waitlistButton,
    //     {
    //       opacity: 0,
    //       pointerEvents: "none",
    //       duration: 0.4,
    //       ease: "power2.out"
    //     },
    //     step9Start
    //   );

    //   tl.to(
    //     [refs.leftStairsMod6Mobile, refs.rightStairsMod3Mobile],
    //     {
    //       opacity: 0,
    //       duration: 0.4,
    //       ease: "power2.out"
    //     },
    //     step9Start
    //   );

    //   tl.to(
    //     [refs.rightCloud, refs.leftCloud],
    //     {
    //       opacity: 0,
    //       duration: 0.4,
    //       ease: "power2.out"
    //     },
    //     step9Start
    //   );

    //   // Hide combined circle
    //   tl.to(
    //     refs.combinedCircleContainer,
    //     {
    //       opacity: 0,
    //       duration: 0.4,
    //       ease: "power2.out"
    //     },
    //     step9Start
    //   );

    //   // Orbit moves down more
    //   tl.to(
    //     refs.pinkBiggerOrbit,
    //     {
    //       y: "35vh",
    //       x: 0,
    //       scale: 2,
    //       duration: 1.2,
    //       ease: "power2.out"
    //     },
    //     step9Start + 0.4
    //   );

    //   // "the evolve toolkit" text appears
    //   tl.set(
    //     refs.text8,
    //     {
    //       opacity: 0,
    //       willChange: "opacity"
    //     },
    //     step9Start + 0.4
    //   );

    //   tl.to(
    //     refs.text8,
    //     {
    //       opacity: 1,
    //       duration: 0.6,
    //       ease: "power2.out"
    //     },
    //     step9Start + 1.0
    //   );

    //   // Mini ovals appear
    //   tl.set(
    //     [refs.ovalMini3, refs.ovalMini2, refs.ovalMini1],
    //     {
    //       opacity: 0,
    //       scale: 1,
    //       willChange: "transform, opacity"
    //     },
    //     step9Start + 1.0
    //   );

    //   tl.to(
    //     refs.ovalMini3,
    //     {
    //       opacity: 1,
    //       duration: 0.4,
    //       ease: "power2.out"
    //     },
    //     step9Start + 1.2
    //   );

    //   tl.to(
    //     refs.ovalMini2,
    //     {
    //       opacity: 1,
    //       duration: 0.4,
    //       ease: "power2.out"
    //     },
    //     step9Start + 1.4
    //   );

    //   tl.to(
    //     refs.ovalMini1,
    //     {
    //       opacity: 1,
    //       duration: 0.4,
    //       ease: "power2.out"
    //     },
    //     step9Start + 1.6
    //   );

    //   // Step 10: oval_mini_1 expands and transforms into oval_1
    //   const step10Start = step9Start + 3.0;

    //   // First hide other mini ovals
    //   tl.to(
    //     [refs.ovalMini2, refs.ovalMini3],
    //     {
    //       opacity: 0,
    //       duration: 0.4,
    //       ease: "power2.out"
    //     },
    //     step10Start
    //   );

    //   // Mini oval moves UP to vertical center AND scales up simultaneously
    //   tl.to(
    //     refs.ovalMini1,
    //     {
    //       y: "-20vh",
    //       scale: 1.5,
    //       duration: 0.8,
    //       ease: "power2.out"
    //     },
    //     step10Start + 0.2
    //   );

    //   // Set initial position for oval_1 (same position as scaled mini)
    //   tl.set(
    //     refs.oval1,
    //     {
    //       opacity: 0,
    //       scale: 0.5,
    //       y: "0vh",
    //       willChange: "transform, opacity"
    //     },
    //     step10Start + 0.8
    //   );

    //   // Direct crossfade: mini oval fades out as full oval fades in
    //   tl.to(
    //     refs.ovalMini1,
    //     {
    //       opacity: 0,
    //       duration: 0,
    //       ease: "power2.inOut"
    //     },
    //     step10Start + 1.0
    //   );

    //   tl.to(
    //     refs.oval1,
    //     {
    //       opacity: 1,
    //       duration: 0,
    //       ease: "power2.inOut"
    //     },
    //     step10Start + 1.0
    //   );

    //   // Full oval scales up to final size at center
    //   tl.to(
    //     refs.oval1,
    //     {
    //       scale: 1,
    //       duration: 0.6,
    //       ease: "power2.out"
    //     },
    //     step10Start + 1.5
    //   );

    //   // Step 11: Vertical scroll transition - cards stack behavior
    //   const step11Start = step10Start + 4.0;

    //   const scrollContainerHeight = 85;

    //   // Set oval_1 to the same starting position as oval_2 and oval_3
    //   tl.set(
    //     refs.oval1,
    //     {
    //       opacity: 1,
    //       top: "15vh",
    //       scale: 1
    //     },
    //     step11Start
    //   );

    //   // Set oval_2 ABOVE the visible area
    //   tl.set(
    //     refs.oval2,
    //     {
    //       opacity: 1,
    //       top: `-100vh`,
    //       scale: 0.9
    //     },
    //     step11Start
    //   );

    //   // oval_1 scrolls DOWN - moves down and fades
    //   tl.to(
    //     refs.oval1,
    //     {
    //       top: `${scrollContainerHeight * 0.6}vh`,
    //       scale: 0.9,
    //       opacity: 0,
    //       duration: 1.8,
    //       ease: "power3.inOut"
    //     },
    //     step11Start
    //   );

    //   // oval_2 scrolls DOWN from top to center
    //   tl.to(
    //     refs.oval2,
    //     {
    //       top: "15vh",
    //       scale: 1,
    //       duration: 1.8,
    //       ease: "power3.inOut"
    //     },
    //     step11Start
    //   );

    //   // Step 12: Continue vertical scroll
    //   const step12Start = step11Start + 4.0;

    //   // Set oval_3 ABOVE the visible area
    //   tl.set(
    //     refs.oval3,
    //     {
    //       opacity: 1,
    //       top: `-100vh`,
    //       scale: 0.9
    //     },
    //     step12Start
    //   );

    //   // oval_2 scrolls DOWN and fades
    //   tl.to(
    //     refs.oval2,
    //     {
    //       top: `${scrollContainerHeight * 0.6}vh`,
    //       scale: 0.9,
    //       opacity: 0,
    //       duration: 1.8,
    //       ease: "power3.inOut"
    //     },
    //     step12Start
    //   );

    //   // oval_3 scrolls DOWN from top to center
    //   tl.to(
    //     refs.oval3,
    //     {
    //       top: "15vh",
    //       scale: 1,
    //       duration: 1.8,
    //       ease: "power3.inOut"
    //     },
    //     step12Start
    //   );

    //   // Step 13: Final card stays with subtle animation
    //   tl.to(
    //     refs.oval3,
    //     {
    //       scale: 1.03,
    //       duration: 0.5,
    //       ease: "sine.inOut",
    //       yoyo: true,
    //       repeat: 1
    //     },
    //     step12Start + 2.5
    //   );
    // }

    if (isMobile) {
      const mobileStairsStart = text3AppearStart + 0.5;

      // Step 1: rightStairsMod3Mobile appears at bottom left with 10% visibility
      tl.set(
        refs.rightStairsMod3Mobile,
        {
          opacity: 1,
          left: 0,
          bottom: 0,
          right: "auto",
          width: "80%",
          willChange: "transform, opacity"
        },
        mobileStairsStart
      );

      // Set initial mask with SOFT GRADIENT edges
      if (refs.rightStairsMod3Mobile) {
        // Create a softer mask using a gradient approach
        tl.set(
          refs.rightStairsMod3Mobile,
          {
            clipPath: "inset(80% 0 0 0)",
            WebkitClipPath: "inset(80% 0 0 0)",
            // Add a mask-image for soft edges
            WebkitMaskImage:
              "linear-gradient(to top, rgba(0,0,0,1) 20%, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 100%)",
            maskImage:
              "linear-gradient(to top, rgba(0,0,0,1) 90%, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 100%)"
          },
          mobileStairsStart
        );
      }

      // Step 2: Reveal to 20% (with scroll)
      const stairs20Start = mobileStairsStart + 1.5;

      if (refs.rightStairsMod3Mobile) {
        tl.to(
          refs.rightStairsMod3Mobile,
          {
            clipPath: "inset(80% 0 0 0)",
            WebkitClipPath: "inset(80% 0 0 0)",
            WebkitMaskImage:
              "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)",
            maskImage:
              "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)",
            duration: 0.8,
            ease: "power2.out"
          },
          stairs20Start
        );
      }

      // Step 3: Orbit goes up + "real design" text + reveal to 30%
      const stairs30Start = stairs20Start + 1.5;

      // Orbit moves upwards
      tl.to(
        refs.pinkBiggerOrbit,
        {
          y: "-=15vh",
          duration: 1.0,
          ease: "power2.out"
        },
        stairs30Start
      );

      // Reveal to 30%
      if (refs.rightStairsMod3Mobile) {
        tl.to(
          refs.rightStairsMod3Mobile,
          {
            clipPath: "inset(70% 0 0 0)",
            WebkitClipPath: "inset(70% 0 0 0)",
            WebkitMaskImage:
              "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)",
            maskImage:
              "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)",
            duration: 0.8,
            ease: "power2.out"
          },
          stairs30Start
        );
      }

      // Text5 appears: "real design,"
      tl.set(
        refs.text5,
        {
          opacity: 0,
          willChange: "opacity"
        },
        stairs30Start
      );

      tl.to(
        refs.text5,
        {
          opacity: 1,
          duration: 0.6,
          ease: "power2.out"
        },
        stairs30Start + 0.8
      );

      // Step 4: "real portfolio" text + orbit moves right + reveal to 40%
      const portfolioStart = stairs30Start + 2.0;

      // Orbit moves rightwards
      tl.to(
        refs.pinkBiggerOrbit,
        {
          x: "+=10vw",
          duration: 1.0,
          ease: "power2.out"
        },
        portfolioStart
      );

      // Reveal to 40%
      if (refs.rightStairsMod3Mobile) {
        tl.to(
          refs.rightStairsMod3Mobile,
          {
            clipPath: "inset(60% 0 0 0)",
            WebkitClipPath: "inset(60% 0 0 0)",
            WebkitMaskImage:
              "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)",
            maskImage:
              "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)",
            duration: 0.8,
            ease: "power2.out"
          },
          portfolioStart
        );
      }

      // Text5 fades out
      tl.to(
        refs.text5,
        {
          opacity: 0,
          duration: 0.4,
          ease: "power2.out"
        },
        portfolioStart
      );

      // Text6 appears: "real portfolio,"
      tl.set(
        refs.text6,
        {
          opacity: 0,
          willChange: "opacity"
        },
        portfolioStart + 0.4
      );

      tl.to(
        refs.text6,
        {
          opacity: 1,
          duration: 0.6,
          ease: "power2.out"
        },
        portfolioStart + 0.8
      );

      // Step 5: "real career" text + orbit moves down + stair moves to right-bottom + reveal to 50%
      const careerStart = portfolioStart + 2.0;

      // Orbit moves down and more right
      tl.to(
        refs.pinkBiggerOrbit,
        {
          x: "+=15vw",
          y: "+=10vh",
          duration: 1.0,
          ease: "power2.out"
        },
        careerStart
      );

      // IMPROVED: Stair moves to right with smoother easing and longer duration
      tl.to(
        refs.rightStairsMod3Mobile,
        {
          x: "+=12vw",
          left: "auto",
          bottom: "-2%",
          duration: 1.4, // Increased from 1.0
          ease: "power2.inOut" // Changed from power2.out for smoother motion
        },
        careerStart
      );

      if (refs.rightStairsMod3Mobile) {
        tl.fromTo(
          refs.rightStairsMod3Mobile,
          {
            WebkitMaskImage:
              "linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 60%, rgba(0,0,0,1) 100%)",
            maskImage:
              "linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 60%, rgba(0,0,0,1) 100%)"
          },
          {
            WebkitMaskImage:
              "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)",
            maskImage:
              "radial-gradient(circle at bottom, black 60%, transparent 100%)",

            duration: 0.8,
            ease: "power2.out"
          },
          careerStart
        );
      }

      // Text6 fades out
      tl.to(
        refs.text6,
        {
          opacity: 0,
          duration: 0.4,
          ease: "power2.out"
        },
        careerStart
      );

      // Text7 appears: "real career beginnings..."
      tl.set(
        refs.text7,
        {
          opacity: 0,
          willChange: "opacity"
        },
        careerStart + 0.4
      );

      tl.to(
        refs.text7,
        {
          opacity: 1,
          duration: 0.6,
          ease: "power2.out"
        },
        careerStart + 0.8
      );

      // Step 6: Orbit centers + curved outer circle appears + stairs slide to edges (10-20% visible)
      const centerCircleStart = careerStart + 2.0;

      // Remove all texts
      tl.to(
        [refs.text3, refs.text7],
        {
          opacity: 0,
          duration: 0.4,
          ease: "power2.out"
        },
        centerCircleStart
      );

      // Orbit moves to center (reset x to 0 and adjust y)
      tl.to(
        refs.pinkBiggerOrbit,
        {
          x: 0,
          y: "-25vh",
          duration: 1.2,
          ease: "power2.out"
        },
        centerCircleStart
      );

      // IMPROVED: Right stair slides OUT to the right with LOWER position
      tl.to(
        refs.rightStairsMod3Mobile,
        {
          right: "-36%", // Slide mostly out of screen
          bottom: "-20%", // CHANGED: More down (was 0%)
          clipPath: "inset(0% 0 0 0)", // Show full stair (but most is off-screen)
          WebkitClipPath: "inset(0% 0 0 0)",
          WebkitMaskImage: "none", // Remove gradient mask when sliding out
          maskImage: "none",
          duration: 1.2,
          ease: "power2.out"
        },
        centerCircleStart
      );

      // IMPROVED: Use proper left stairs image (refs.leftStairsMod6Mobile) - NO INVERSION
      tl.set(
        refs.leftStairsMod6Mobile,
        {
          opacity: 1,
          left: "-0%", // Start mostly off-screen
          right: "auto",
          bottom: "-10%", // CHANGED: Match right stair position
          width: "33.5%",
          transform: "scaleX(1)", // CHANGED: No inversion
          clipPath: "inset(0% 0 0 0)",
          WebkitClipPath: "inset(0% 0 0 0)",
          willChange: "transform"
        },
        centerCircleStart + "1.0"
      );

      // Both stairs stay at edges (no further movement, just appear)

      // Combined circle container - position it at orbit center
      tl.set(
        refs.combinedCircleContainer,
        {
          opacity: 1
        },
        centerCircleStart
      );

      // Combined circle appears at center (very small scale) - OUTER PART ONLY
      if (refs.combinedCircle?.outer) {
        tl.set(
          refs.combinedCircle.outer,
          {
            opacity: 0,
            scale: 0.3,
            willChange: "transform, opacity"
          },
          centerCircleStart
        );

        tl.to(
          refs.combinedCircle.outer,
          {
            opacity: 1,
            duration: 0.6,
            ease: "power2.out"
          },
          centerCircleStart + 0.8
        );
      }

      // Continue with rest of the mobile animation (zoom effect, etc.)
      // Step 7: Zoom effect + inner circle reveals
      const zoomStart = centerCircleStart + 3.0;

      // Orbit scales up (zoom effect)
      tl.to(
        refs.pinkBiggerOrbit,
        {
          scale: "+=0.5",
          duration: 1.5,
          ease: "power2.inOut"
        },
        zoomStart
      );

      // Combined circle OUTER scales up
      if (refs.combinedCircle?.outer) {
        tl.to(
          refs.combinedCircle.outer,
          {
            scale: 0.7,
            duration: 1.5,
            ease: "power2.inOut"
          },
          zoomStart
        );
      }

      // Inner part becomes visible and scales up
      if (refs.combinedCircle?.inner) {
        tl.set(
          refs.combinedCircle.inner,
          {
            opacity: 0,
            scale: 0.3
          },
          zoomStart
        );

        tl.to(
          refs.combinedCircle.inner,
          {
            opacity: 1,
            scale: 0.7,
            duration: 1.2,
            ease: "power2.out"
          },
          zoomStart + 0.5
        );
      }

      // Step 8: Orbit moves up + circle moves up + button appears (stairs still visible)
      const step8Start = zoomStart + 2.5;

      // Orbit and combined circle move up together
      tl.to(
        [
          refs.pinkBiggerOrbit,
          refs.leftStairsMod6Mobile,
          refs.rightStairsMod3Mobile
        ],
        {
          y: "-=10vh",
          duration: 1.2,
          ease: "power2.out"
        },
        step8Start
      );

      // Waitlist button appears
      tl.fromTo(
        refs.waitlistButton,
        {
          opacity: 0,
          y: 30,
          scale: 0.9,
          pointerEvents: "none"
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          pointerEvents: "auto",
          duration: 1.0,
          ease: "back.out(1.5)"
        },
        step8Start + 0.8
      );

      // Step 9: Remove elements (including BOTH stairs) + orbit moves down + toolkit text + mini ovals appear
      const step9Start = step8Start + 2.5;

      // Remove waitlist button and CLOUDS
      tl.to(
        refs.waitlistButton,
        {
          opacity: 0,
          pointerEvents: "none",
          duration: 0.4,
          ease: "power2.out"
        },
        step9Start
      );

      // Remove BOTH stairs
      tl.to(
        [refs.rightStairsMod3Mobile, refs.leftStairsMod6Mobile],
        {
          opacity: 0,
          duration: 0.4,
          ease: "power2.out"
        },
        step9Start
      );

      tl.to(
        [refs.rightCloud, refs.leftCloud],
        {
          opacity: 0,
          duration: 0.4,
          ease: "power2.out"
        },
        step9Start
      );

      // Hide combined circle
      tl.to(
        refs.combinedCircleContainer,
        {
          opacity: 0,
          duration: 0.4,
          ease: "power2.out"
        },
        step9Start
      );

      // Orbit moves down more
      tl.to(
        refs.pinkBiggerOrbit,
        {
          y: "35vh",
          x: 0,
          scale: 2,
          duration: 1.2,
          ease: "power2.out"
        },
        step9Start + 0.4
      );

      // "the evolve toolkit" text appears
      tl.set(
        refs.text8,
        {
          opacity: 0,
          willChange: "opacity"
        },
        step9Start + 0.4
      );

      tl.to(
        refs.text8,
        {
          opacity: 1,
          duration: 0.6,
          ease: "power2.out"
        },
        step9Start + 1.0
      );

      // Mini ovals appear
      tl.set(
        [refs.ovalMini3, refs.ovalMini2, refs.ovalMini1],
        {
          opacity: 0,
          scale: 1,
          willChange: "transform, opacity"
        },
        step9Start + 1.0
      );

      tl.to(
        refs.ovalMini3,
        {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out"
        },
        step9Start + 1.2
      );

      tl.to(
        refs.ovalMini2,
        {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out"
        },
        step9Start + 1.4
      );

      tl.to(
        refs.ovalMini1,
        {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out"
        },
        step9Start + 1.6
      );

      // Step 10: oval_mini_1 expands and transforms into oval_1
      const step10Start = step9Start + 3.0;

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
          duration: 0.6,
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
          duration: 1.8,
          ease: "power3.inOut"
        },
        step11Start
      );

      // oval_2 scrolls DOWN from top to center
      tl.to(
        refs.oval2,
        {
          top: "15vh",
          scale: 1,
          duration: 1.8,
          ease: "power3.inOut"
        },
        step11Start
      );

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
          duration: 1.8,
          ease: "power3.inOut"
        },
        step12Start
      );

      // oval_3 scrolls DOWN from top to center
      tl.to(
        refs.oval3,
        {
          top: "15vh",
          scale: 1,
          duration: 1.8,
          ease: "power3.inOut"
        },
        step12Start
      );

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
    } else {
      // Desktop: Stairs with progressive reveal
      // Step 1: Initial setup and fade in (30% visible)
      // Desktop: Stairs with progressive reveal
      // Step 1: Initial setup and fade in (20% visible from bottom)
      tl.set(
        [refs.stairsLeft, refs.stairsRight],
        {
          opacity: 1,
          scale: 1,
          y: "40vh" // Start position - mostly hidden below
        },
        stairsAnimateStart
      );

      // Set initial mask to show only 5% with soft gradient
      if (refs.stairsLeft && refs.stairsRight) {
        const leftImg = refs.stairsLeft.querySelector("img");
        const rightImg = refs.stairsRight.querySelector("img");

        if (leftImg && rightImg) {
          tl.set(
            [leftImg, rightImg],
            {
              maskImage:
                "linear-gradient(to top, black 32.89%, black 0%, transparent 32.89%)",
              WebkitMaskImage:
                "linear-gradient(to top, black 10%, black 0%, transparent 35%)"
            },
            stairsAnimateStart
          );
        }
      }

      // Stairs slide up from bottom (showing 5%)
      tl.to(
        [refs.stairsLeft, refs.stairsRight],
        {
          y: 0,
          duration: 1.0,
          ease: "power2.out"
        },
        stairsAnimateStart
      );

      // Step 2: Orbit moves down + stairs move down + reveal to 40%
      tl.to(
        refs.pinkBiggerOrbit,
        {
          y: `+=${6 * multipliers.orbit}%`,
          duration: 1.0,
          ease: "power2.out"
        },
        nextPhaseStart
      );

      // Stairs move down slightly (but stay at 5% visibility)
      tl.to(
        [refs.stairsLeft, refs.stairsRight],
        {
          y: `+=${7 * multipliers.stairs}vh`, // Move stairs down
          duration: 1.0,
          ease: "power2.out"
        },
        nextPhaseStart
      );

      // NO mask change - keep stairs at 5% visibility
      tl.set(
        refs.text4,
        {
          opacity: 1,
          willChange: "opacity"
        },
        nextPhaseStart
      );
      // if (refs.stairsLeft && refs.stairsRight) {
      //   const leftImg = refs.stairsLeft.querySelector("img");
      //   const rightImg = refs.stairsRight.querySelector("img");

      //   if (leftImg && rightImg) {
      //     tl.to(
      //       [leftImg, rightImg],
      //       {
      //         maskImage:
      //           "linear-gradient(to top, black 100%, black 90%, transparent 200%)",
      //         WebkitMaskImage:
      //           "linear-gradient(to top, black 100%, black 90%, transparent 200%)",
      //         duration: 1.2,
      //         ease: "power2.out"
      //       },
      //       nextPhaseStart
      //     );
      //   }
      // }

      // Reveal stairs from 5% to 100% with SMOOTH translucent gradient
      if (refs.stairsLeft && refs.stairsRight) {
        const leftImg = refs.stairsLeft.querySelector("img");
        const rightImg = refs.stairsRight.querySelector("img");

        if (leftImg && rightImg) {
          tl.to(
            [leftImg, rightImg],
            {
              maskImage:
                "linear-gradient(to top, black 100%, black 90%, transparent 200%)",
              WebkitMaskImage:
                "linear-gradient(to top, black 100%, black 90%, transparent 200%)",
              duration: 1.2,
              ease: "power2.out"
            },
            nextPhaseStart
          );
        }
      }

      tl.set(
        refs.combinedCircleContainer,
        {
          opacity: 1,
          willChange: "transform, opacity"
        },
        nextPhaseStart
      );

      if (refs.combinedCircle?.outer) {
        tl.set(
          refs.combinedCircle.outer,
          {
            opacity: 0,
            scale: 0.15,
            willChange: "transform, opacity"
          },
          nextPhaseStart
        );

        tl.to(
          refs.combinedCircle.outer,
          {
            opacity: 1,
            // scale: 0.4,
            duration: 0.4,
            ease: "power1.out"
          },
          nextPhaseStart + 0.1
        );
      }

      // Step 3: Show outer circle + reveal stairs fully (100%)
      // Step 3: Show outer circle + reveal stairs fully (100%)
      const step2Start = nextPhaseStart + 2.0;

      // tl.set(
      //   refs.combinedCircleContainer,
      //   {
      //     opacity: 1,
      //     willChange: "transform, opacity"
      //   },
      //   step2Start
      // );

      // if (refs.combinedCircle?.outer) {
      //   tl.set(
      //     refs.combinedCircle.outer,
      //     {
      //       opacity: 0,
      //       scale: 0.15,
      //       willChange: "transform, opacity"
      //     },
      //     step2Start
      //   );

      //   tl.to(
      //     refs.combinedCircle.outer,
      //     {
      //       opacity: 1,
      //       // scale: 0.4,
      //       duration: 0.4,
      //       ease: "power1.out"
      //     },
      //     step2Start + 0.1
      //   );
      // }

      // // Reveal stairs from 5% to 100% with SMOOTH translucent gradient
      // if (refs.stairsLeft && refs.stairsRight) {
      //   const leftImg = refs.stairsLeft.querySelector("img");
      //   const rightImg = refs.stairsRight.querySelector("img");

      //   if (leftImg && rightImg) {
      //     tl.to(
      //       [leftImg, rightImg],
      //       {
      //         maskImage:
      //           "linear-gradient(to top, black 100%, black 90%, transparent 200%)",
      //         WebkitMaskImage:
      //           "linear-gradient(to top, black 100%, black 90%, transparent 200%)",
      //         duration: 1.2,
      //         ease: "power2.out"
      //       },
      //       step2Start
      //     );
      //   }
      // }

      // Step 4: Move orbit and stairs down MORE, scale outer circle up
      const step3Start = step2Start + 2.0;

      tl.to(
        refs.pinkBiggerOrbit,
        {
          y: `+=${8 * multipliers.orbit}%`,
          duration: 1.0,
          ease: "power1.inOut"
        },
        step3Start
      );

      // Stairs move down MORE
      tl.to(
        [refs.stairsLeft, refs.stairsRight],
        {
          y: `+=${10 * multipliers.stairs}vh`, // More downward movement
          duration: 1.0,
          ease: "power1.inOut"
        },
        step3Start
      );

      if (refs.combinedCircle?.outer) {
        tl.to(
          refs.combinedCircle.outer,
          {
            scale: 0.4,
            duration: 1.0,
            ease: "power1.inOut"
          },
          step3Start
        );
      }

      if (refs.combinedCircle?.innerLogo) {
        tl.set(
          refs.combinedCircle.innerLogo,
          {
            opacity: 0,
            scale: 0.38,
            willChange: "transform, opacity"
          },
          step3Start
        );

        tl.to(
          refs.combinedCircle.innerLogo,
          {
            opacity: 1,
            scale: 0.38,
            duration: 0.8,
            ease: "power1.out"
          },
          step3Start + 0.3
        );
      }

      // Step 5: Zoom orbit and circle + stairs zoom in
      const step4Start = step3Start + 2.0;

      tl.to(
        refs.pinkBiggerOrbit,
        {
          scale: "+=0.4",
          duration: 1.2,
          ease: "power1.inOut"
        },
        step4Start
      );

      // Stairs move down to bottom corners - only 10% visible from top
      tl.to(
        [refs.stairsLeft, refs.stairsRight],
        {
          y: `+=${40 * multipliers.stairs}vh`, // Move much further down
          scale: 1.3,
          duration: 1.2,
          ease: "power1.inOut"
        },
        step4Start
      );

      if (refs.combinedCircle?.outer) {
        tl.to(
          refs.combinedCircle.outer,
          {
            scale: 0.8,
            duration: 1.2,
            ease: "power1.inOut"
          },
          step4Start
        );
      }

      if (refs.combinedCircle?.innerLogo) {
        tl.to(
          refs.combinedCircle.innerLogo,
          {
            scale: 0.8,
            duration: 1.2,
            ease: "power1.inOut"
          },
          step4Start
        );
      }

      if (refs.combinedCircle?.innerLogo && refs.combinedCircle?.inner) {
        tl.set(
          refs.combinedCircle.inner,
          {
            opacity: 0,
            scale: 0.7,
            willChange: "transform, opacity"
          },
          step4Start + 0.6
        );

        tl.to(
          refs.combinedCircle.innerLogo,
          {
            opacity: 0,
            duration: 0.3,
            ease: "power2.in"
          },
          step4Start + 0.6
        );

        tl.to(
          refs.combinedCircle.inner,
          {
            opacity: 1,
            duration: 0.5,
            ease: "power2.inOut"
          },
          step4Start + 0.6
        );
      }

      tl.to(
        [refs.text4, refs.text3],
        {
          opacity: 0,
          duration: 0.3,
          ease: "power1.out"
        },
        step4Start
      );

      // Update mask to show only top 10%
      if (refs.stairsLeft && refs.stairsRight) {
        const leftImg = refs.stairsLeft.querySelector("img");
        const rightImg = refs.stairsRight.querySelector("img");

        if (leftImg && rightImg) {
          tl.to(
            [leftImg, rightImg],
            {
              maskImage:
                "linear-gradient(to bottom, black 100%, transparent 100%)", // Changed to show top 10%
              WebkitMaskImage:
                "linear-gradient(to bottom, black 100%, transparent 100%)",
              duration: 1.2,
              ease: "power2.inOut"
            },
            step4Start
          );
        }
      }

      // tl.to(
      //   [refs.text4, refs.text3],
      //   {
      //     opacity: 0,
      //     duration: 0.3,
      //     ease: "power1.out"
      //   },
      //   step4Start
      // );

      // Add this code after the stairs_2 appear section in desktop (after step4Start)

      // Step 5: Waitlist button appears
      // Add this code after the stairs_2 appear section in desktop (after step4Start)

      // Step 5: Scale down orbit, combined circle, and stairs
      const step5Start = step4Start + 2.0;

      // Scale down orbit
      tl.to(
        refs.pinkBiggerOrbit,
        {
          scale: "-=0.15",
          duration: 0.8,
          ease: "power2.inOut"
        },
        step5Start
      );

      // Scale down combined circle elements
      if (refs.combinedCircle?.outer) {
        tl.to(
          refs.combinedCircle.outer,
          {
            scale: "-=0.1",
            duration: 0.8,
            ease: "power2.inOut"
          },
          step5Start
        );
      }

      if (refs.combinedCircle?.inner) {
        tl.to(
          refs.combinedCircle.inner,
          {
            scale: "-=0.1",
            duration: 0.8,
            ease: "power2.inOut"
          },
          step5Start
        );
      }

      // Scale down stairs
      tl.to(
        [refs.stairsLeft, refs.stairsRight],
        {
          scale: "-=0.15",
          duration: 0.8,
          ease: "power2.inOut"
        },
        step5Start
      );

      // Step 6: Waitlist button appears
      const step6Start = step5Start + 1.2;

      // Waitlist button appears
      tl.fromTo(
        refs.waitlistButton,
        {
          opacity: 0,
          y: 30,
          scale: 0.9,
          pointerEvents: "none"
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.0,
          ease: "back.out(1.5)",
          pointerEvents: "auto"
        },
        step6Start
      );

      // Step 7: Remove everything EXCEPT orbit, orbit moves down smoothly
      const step7Start = step6Start + 2.5;

      // Remove waitlist button, stairs, texts, combined circle, clouds (NOT orbit)
      tl.to(
        refs.waitlistButton,
        {
          opacity: 0,
          duration: 0.4,
          pointerEvents: "none",
          ease: "power2.out"
        },
        step7Start
      );

      // tl.to(
      //   [refs.leftStairs2, refs.rightStairs2],
      //   {
      //     opacity: 0,
      //     duration: 0.4,
      //     ease: "power2.out"
      //   },
      //   step6Start
      // );
      tl.to(
        [refs.stairsLeft, refs.stairsRight],
        {
          opacity: 0,
          duration: 0.4,
          ease: "power2.out"
        },
        step7Start
      );

      tl.to(
        [refs.text3, refs.text4],
        {
          opacity: 0,
          duration: 0.4,
          ease: "power2.out"
        },
        step7Start
      );

      // Remove clouds
      tl.to(
        [refs.rightCloud, refs.leftCloud],
        {
          opacity: 0,
          duration: 0.4,
          ease: "power2.out"
        },
        step7Start
      );

      // Hide combined circle
      tl.to(
        refs.combinedCircleContainer,
        {
          opacity: 0,
          duration: 0.4,
          ease: "power2.out"
        },
        step7Start
      );

      // Pink orbit moves down SMOOTHLY from its current position (stays centered)
      // tl.to(
      //   refs.pinkBiggerOrbit,
      //   {
      //     // y: "+=80vh", // Move down by 80vh from CURRENT position (relative movement)
      //     // x stays unchanged to keep it centered
      //     top: "90%",
      //     duration: 1.5,
      //     ease: "power2.inOut"
      //   },
      //   step6Start // Starts at same time as removals
      // );

      tl.to(
        refs.pinkBiggerOrbit,
        {
          top: `${90 * orbitVerticalMultipliers.downward}%`, // Responsive downward position
          duration: 1.5,
          ease: "power2.inOut"
        },
        step7Start
      );

      // Step 7: "the evolve toolkit" text appears AFTER orbit settles
      // const step7Start = step6Start + 1.8;
      // Step 8: "the evolve toolkit" text appears AFTER orbit settles
      const step8Start = step7Start + 1.8;

      tl.set(
        refs.text8,
        {
          opacity: 0,
          willChange: "opacity"
        },
        step8Start
      );

      tl.to(
        refs.text8,
        {
          opacity: 1,
          duration: 0.6,
          ease: "power2.out"
        },
        step8Start + 0.2
      );

      // Step 8: Mini ovals appear AFTER text
      const step9Start = step8Start + 1.0;

      // Set initial state for mini ovals
      tl.set(
        [refs.ovalMini3, refs.ovalMini2, refs.ovalMini1],
        {
          opacity: 0,
          scale: 1, // Start at full mini size
          willChange: "transform, opacity"
        },
        step9Start
      );

      // They appear with slight stagger
      tl.to(
        refs.ovalMini3,
        {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out"
        },
        step9Start + 0.2
      );

      tl.to(
        refs.ovalMini2,
        {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out"
        },
        step9Start + 0.4
      );

      tl.to(
        refs.ovalMini1,
        {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out"
        },
        step9Start + 0.6
      );

      // Step 9: Mini ovals SCALE UP and transform into full ovals
      const step10Start = step9Start + 2.0;

      // Set initial state for full ovals (hidden, at same position as mini ovals)
      tl.set(
        [refs.oval1, refs.oval2, refs.oval3],
        {
          opacity: 0,
          scale: 1,
          x: 0,
          willChange: "transform, opacity"
        },
        step10Start
      );

      // Mini ovals scale up AND move apart (spreading effect)
      tl.to(
        refs.ovalMini3, // Left card
        {
          scale: 1.45,
          x: "-110px", // Move left
          duration: 0.8,
          ease: "power2.inOut"
        },
        step10Start
      );

      tl.to(
        refs.ovalMini2, // Center card
        {
          scale: 1.45,
          x: 0, // Stay center
          duration: 0.8,
          ease: "power2.inOut"
        },
        step10Start
      );

      tl.to(
        refs.ovalMini1, // Right card
        {
          scale: 1.45,
          x: "110px", // Move right
          duration: 0.8,
          ease: "power2.inOut"
        },
        step10Start
      );

      // Set full ovals at same spread positions
      tl.set(
        refs.oval3,
        {
          // x: "-60px"
        },
        step10Start + 0.4
        // step9Start
      );

      tl.set(
        refs.oval2,
        {
          x: 0
        },
        step10Start + 0.4
      );

      tl.set(
        refs.oval1,
        {
          // x: "60px"
        },
        step10Start + 0.4
      );

      // Direct crossfade from mini to full (NO BLACK)
      tl.to(
        [refs.ovalMini1, refs.ovalMini2, refs.ovalMini3],
        {
          opacity: 0,
          duration: 0,
          ease: "power2.inOut"
        },
        step10Start + 0.4
      );

      tl.to(
        [refs.oval1, refs.oval2, refs.oval3],
        {
          opacity: 1,
          scale: 1, // Scale up slightly when appearing
          duration: 0,
          ease: "power2.inOut"
        },
        step10Start + 0.4
      );

      // Scale back to normal size before settling
      tl.to(
        [refs.oval1, refs.oval2, refs.oval3],
        {
          scale: 1.01,
          duration: 0.5,
          ease: "back.out(2)"
        },
        step10Start + 0.5
      );

      // Move full ovals back to original positions after crossfade
      tl.to(
        [refs.oval1, refs.oval2, refs.oval3],
        {
          x: 0,
          duration: 0,
          ease: "power2.out"
        },
        step10Start + 0.8
      );
      // Clear will-change at the end
      tl.set(
        [refs.oval1, refs.oval2, refs.oval3],
        { willChange: "auto" },
        step10Start + 1.5
      );

      // Clear will-change at the end
      tl.set(
        [refs.oval1, refs.oval2, refs.oval3],
        { willChange: "auto" },
        step9Start + 2.0
      );

      // Clear will-change at the end for performance
      tl.set(
        refs.combinedCircleContainer,
        { willChange: "auto" },
        step4Start + 2.0
      );

      if (refs.combinedCircle?.outer) {
        tl.set(
          refs.combinedCircle.outer,
          { willChange: "auto" },
          step4Start + 2.0
        );
      }

      if (refs.combinedCircle?.inner) {
        tl.set(
          refs.combinedCircle.inner,
          { willChange: "auto" },
          step4Start + 2.0
        );
      }

      // Clear will-change at the end
      tl.set(
        [refs.oval1, refs.oval2, refs.oval3],
        { willChange: "auto" },
        step10Start + 1.5
      );

      // Add floating pulse effect to all three ovals
      // Move full ovals back to original positions after crossfade
      tl.to(
        [refs.oval1, refs.oval2, refs.oval3],
        {
          x: 0,
          duration: 0.5,
          ease: "power2.out"
        },
        step10Start + 0.8
      );

      // Clear will-change at the end
      tl.set(
        [refs.oval1, refs.oval2, refs.oval3],
        { willChange: "auto" },
        step10Start + 1.5
      );

      // Add floating pulse effect AFTER ovals are fully visible and centered
      const pulseStart = step9Start + 1.8; // Start after transition completes

      // Use timeline.call() to start infinite animations after timeline completes
      tl.call(
        () => {
          // Oval 1 - slightly slower, larger movement
          gsap.to(refs.oval1, {
            y: "-=15",
            duration: 2.5,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true
          });

          // Oval 2 - medium speed
          gsap.to(refs.oval2, {
            y: "-=15",
            duration: 2.5,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay: 0.3 // Slight stagger for natural effect
          });

          // Oval 3 - faster, smaller movement
          gsap.to(refs.oval3, {
            y: "-=15",
            duration: 2.5,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay: 0.6 // More stagger
          });
        },
        null,
        null,
        pulseStart
      );
    }

    // ===== ORBIT MOVES TO CENTER AFTER ELEMENTS REACH POSITION =====

    // }
    if (isMobile) {
      // Mobile: Left element - minimal downward movement, 90% visible
      tl.to(
        refs.leftElement,
        {
          y: "8vh", // Reduced downward movement (was 15vh)
          left: "-5%", // Show 90% inside screen
          scale: 1, // Normal size
          duration: 1.2,
          ease: "power2.in"
        },
        // stopAnimationEnd
        newTextStart
      );

      // Mobile: Right element - moderate downward movement, bigger, 90% visible
      tl.to(
        refs.rightElement,
        {
          y: "15vh", // Reduced downward movement (was 35vh)
          right: "-5%", // Show 90% inside screen
          scale: 1.5, // Bigger than left
          duration: 1.2,
          ease: "power2.in"
        },
        // stopAnimationEnd
        newTextStart
      );
    } else {
      // Desktop: Responsive downward movement based on screen size
      const baseDownwardMovement = 15; // Base 15vh for small laptops
      const adjustedY = `${
        baseDownwardMovement * elementMultipliers.downwardY
      }vh`;

      tl.to(
        refs.leftElement,
        {
          y: adjustedY, // Adjusted downward movement
          left: "-2.5%",
          scale: 1.2,
          duration: 1.2,
          ease: "power2.in"
        },
        newTextStart
      );

      tl.to(
        refs.rightElement,
        {
          y: adjustedY, // Adjusted downward movement
          right: "-2.5%",
          scale: 1.2,
          duration: 1.2,
          ease: "power2.in"
        },
        newTextStart
      );
    }
    const orbitToCenterStart = stopAnimationEnd + 1.2;
    tl.to(
      refs.biggerOrbit,
      {
        // y: isMobile ? -250 : -200, // Move to center
        scale: isMobile ? 2.3 : 1, // Maintain bigger scale for mobile
        // scale: orbitScale, // Maintain bigger scale for mobile
        duration: 1.0,
        ease: "power2.out"
      },
      orbitToCenterStart
    );

    // PHASE 2: Animate remaining words after orbit reaches center
    spans2.forEach((span, idx) => {
      if (idx > firstPhaseEnd2) {
        const relativeIdx = idx - firstPhaseEnd2 - 1;
        tl.to(
          span,
          {
            opacity: 1,
            duration: 0.4,
            ease: "power2.out"
          },
          orbitToCenterStart + relativeIdx * 0.35
        );
      }
    });
  }

  // Clear will-change at the end for performance
  tl.set(
    [
      refs.rightCloud,
      refs.leftCloud,
      refs.floor,
      refs.leftElement,
      refs.rightElement
    ],
    { willChange: "auto" },
    "+=0.5"
  );
  tl.set(refs.text0, { willChange: "auto" }, "+=0");
  tl.set(refs.text, { willChange: "auto" }, "+=0");
  tl.set(refs.text2, { willChange: "auto" }, "+=0");
  tl.set(refs.objectsContainer, { willChange: "auto" }, "+=0");
  tl.set(
    [refs.object1, refs.object2, refs.object3],
    { willChange: "auto" },
    "+=0"
  );
  tl.set(refs.ellipse, { willChange: "auto" }, "+=0");
  tl.set(refs.biggerOrbit, { willChange: "auto" }, "+=0");

  return tl;
};

const CombinedCircle = React.forwardRef(({ isMobile }, ref) => {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const innerLogoRef = useRef(null); // ADD THIS

  React.useImperativeHandle(ref, () => ({
    outer: outerRef.current,
    inner: innerRef.current,
    innerLogo: innerLogoRef.current // ADD THIS
  }));

  return (
    <div className="relative w-full h-full">
      {/* Outer circle - will rotate */}
      <img
        ref={outerRef}
        src={curvey_circle_without_inner_part}
        alt="outer circle"
        className="absolute inset-0 w-full h-full antialiased"
        style={
          {
            // transformOrigin: "center center"
          }
        }
      />
      {/* Inner LOGO part - shows FIRST on desktop */}
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
      {/* Inner part - shows SECOND on desktop */}
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

// Create a reusable Waitlist Button Component (add this after CombinedCircle component)
const WaitlistButton = React.forwardRef(
  ({ onClick, style, className }, ref) => {
    const handleClick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      console.log("Waitlist button clicked!");
      // Open Discord link in new tab
      window.open(
        // "https://discord.com/channels/@me/1347086283985649749/1438414139365265479",
        "https://discord.gg/wKRYG7cSWt",
        "_blank"
      );
      if (onClick) onClick(e);
    };

    return (
      <button
        ref={ref}
        className={`font-extrabold ${className || ""}`}
        style={{
          backgroundColor: "#000000",
          borderRadius: "16px",
          padding: "1rem 1.02rem",
          fontSize: "1.5rem",
          color: "#ffffff",
          textTransform: "lowercase",
          boxShadow: "0 6px 0 rgba(128, 128, 128, 0.8)",
          cursor: "pointer",
          border: "none",
          width: "75vw",
          pointerEvents: "auto",
          position: "relative",
          zIndex: 999999,
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          ...style
        }}
        onClick={handleClick}
        onMouseDown={handleClick}
        onTouchStart={handleClick}
        onMouseEnter={(e) => {
          console.log("Mouse entered button");
          e.currentTarget.style.cursor = "pointer";
        }}
      >
        join us
      </button>
    );
  }
);

WaitlistButton.displayName = "WaitlistButton";

// Main Scene Component
const Scene1_1 = React.forwardRef((props, ref) => {
  const { isMobile } = props;

  // Main refs
  const containerRef = useRef(null);
  const bgRef = useRef(null);
  const rightCloudRef = useRef(null);
  const leftCloudRef = useRef(null);
  const floorRef = useRef(null);
  const leftElementRef = useRef(null);
  const rightElementRef = useRef(null);

  const text0Ref = useRef(null); // ADD THIS - for the first text "Home to fearless design..."
  // Text and animation refs
  const textRef = useRef(null);
  const text2Ref = useRef(null); // New text ref
  const text3Ref = useRef(null); // New text ref
  const object1Ref = useRef(null);
  const object2Ref = useRef(null);
  const object3Ref = useRef(null);
  const leftElementEyeRef = useRef(null); // ADD THIS
  const rightElementEyeRef = useRef(null); // ADD THIS
  const ellipseRef = useRef(null);
  const objectsContainerRef = useRef(null);
  const biggerOrbitRef = useRef(null);
  const pinkBiggerOrbitRef = useRef(null); // ADD THIS
  const pinkOrbitInnerRef = useRef(null); // ADD THIS
  // const leftStairsMiniRef = useRef(null); // ADD THIS
  // const rightStairsMiniRef = useRef(null); // ADD THIS
  // const stairsMiniMobileRef = useRef(null); // ADD THIS
  // const stairsMod1MobileRef = useRef(null); // ADD THIS
  const stairsLeftRef = useRef(null); // ADD THIS
  const stairsRightRef = useRef(null); // ADD THIS
  const stairsMod1MobileRef = useRef(null); // ADD THIS
  const stairsMod2MobileRef = useRef(null);
  const text4Ref = useRef(null); // ADD THIS (for desktop 3 texts)
  const text5Ref = useRef(null); // ADD THIS (for mobile 1 text)
  const text6Ref = useRef(null); // ADD THIS
  const leftStairsMod3MobileRef = useRef(null); // ADD THIS
  const rightStairsMod3MobileRef = useRef(null); // ADD THIS
  const text7Ref = useRef(null); // ADD THIS
  const combinedCircleRef = useRef(null); // ADD THIS
  const combinedCircleContainerRef = useRef(null); // ADD THIS NEW LINE
  const leftStairsMod4MobileRef = useRef(null); // ADD THIS
  const rightStairsMod4MobileRef = useRef(null); // ADD THIS
  const leftStairsMod5MobileRef = useRef(null); // ADD THIS
  const rightStairsMod5MobileRef = useRef(null); // ADD THIS
  const waitlistButtonRef = useRef(null); // ADD THIS
  const leftStairsMod6MobileRef = useRef(null); // ADD THIS
  const rightStairsMod6MobileRef = useRef(null); // ADD THIS
  const text8Ref = useRef(null); // "the evolve toolkit" text
  const ovalMini1Ref = useRef(null);
  const ovalMini2Ref = useRef(null);
  const ovalMini3Ref = useRef(null);
  const oval1Ref = useRef(null);
  const oval2Ref = useRef(null);
  const oval3Ref = useRef(null);
  // const leftStairs1Ref = useRef(null);
  // const rightStairs1Ref = useRef(null);
  // const leftStairs2Ref = useRef(null);
  // const rightStairs2Ref = useRef(null);

  // Expose refs to parent
  React.useImperativeHandle(ref, () => ({
    container: containerRef.current,
    bg: bgRef.current,
    rightCloud: rightCloudRef.current,
    leftCloud: leftCloudRef.current,
    floor: floorRef.current,
    leftElement: leftElementRef.current,
    rightElement: rightElementRef.current,
    leftElementEye: leftElementEyeRef.current, // ADD THIS
    rightElementEye: rightElementEyeRef.current, // ADD THIS
    text0: text0Ref.current, // ADD THIS LINE
    text: textRef.current,
    text2: text2Ref.current, // Expose new text ref
    text3: text3Ref.current, // ADD THIS
    // leftStairsMini: leftStairsMiniRef.current, // ADD THIS
    // rightStairsMini: rightStairsMiniRef.current, // ADD THIS
    // stairsMiniMobile: stairsMiniMobileRef.current, // ADD THIS
    // stairsModMobile: stairsModMobileRef.current,
    stairsRight: stairsRightRef.current, // ADD THIS
    stairsLeft: stairsLeftRef.current, // ADD THIS
    objectsContainer: objectsContainerRef.current,
    object1: object1Ref.current,
    object2: object2Ref.current,
    object3: object3Ref.current,
    ellipse: ellipseRef.current,
    biggerOrbit: biggerOrbitRef.current,
    pinkBiggerOrbit: pinkBiggerOrbitRef.current, // ADD THIS
    pinkOrbitInner: pinkOrbitInnerRef.current, // ADD THIS
    stairsMod1Mobile: stairsMod1MobileRef.current, // ADD THIS
    stairsMod2Mobile: stairsMod2MobileRef.current, // ADD THIS
    text4: text4Ref.current, // ADD THIS
    text5: text5Ref.current, // ADD THIS
    text6: text6Ref.current, // ADD THIS
    leftStairsMod3Mobile: leftStairsMod3MobileRef.current, // ADD THIS
    rightStairsMod3Mobile: rightStairsMod3MobileRef.current, // ADD THIS
    text7: text7Ref.current, // ADD THIS
    combinedCircle: combinedCircleRef.current, // ADD THIS
    combinedCircleContainer: combinedCircleContainerRef.current, // ADD THIS LINE
    leftStairsMod4Mobile: leftStairsMod4MobileRef.current, // ADD THIS
    rightStairsMod4Mobile: rightStairsMod4MobileRef.current, // ADD THIS
    leftStairsMod5Mobile: leftStairsMod5MobileRef.current, // ADD THIS
    rightStairsMod5Mobile: rightStairsMod5MobileRef.current, // ADD THIS
    waitlistButton: waitlistButtonRef.current, // ADD THIS
    leftStairsMod6Mobile: leftStairsMod6MobileRef.current, // ADD THIS
    rightStairsMod6Mobile: rightStairsMod6MobileRef.current, // ADD THIS
    text8: text8Ref.current, // ADD THIS
    ovalMini1: ovalMini1Ref.current, // ADD THIS
    ovalMini2: ovalMini2Ref.current, // ADD THIS
    ovalMini3: ovalMini3Ref.current, // ADD THIS
    oval1: oval1Ref.current, // ADD THIS
    oval2: oval2Ref.current, // ADD THIS
    oval3: oval3Ref.current // ADD THIS
    // leftStairs1: leftStairs1Ref.current,
    // rightStairs1: rightStairs1Ref.current,
    // leftStairs2: leftStairs2Ref.current,
    // rightStairs2: rightStairs2Ref.current
  }));

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const rotationAmount = scrollY * 0.1;

      // Rotate both orbits - use INNER refs for rotation
      if (biggerOrbitRef.current) {
        gsap.set(biggerOrbitRef.current, {
          rotation: -rotationAmount
        });
      }

      if (pinkOrbitInnerRef.current) {
        // Changed from pinkBiggerOrbitRef
        gsap.set(pinkOrbitInnerRef.current, {
          rotation: -rotationAmount
        });
      }
      // Rotate combined circle outer part (ADD THIS)
      if (combinedCircleRef.current?.outer) {
        gsap.set(combinedCircleRef.current.outer, {
          rotation: -rotationAmount
        });
      }

      // Rotate combined circle inner part independently (ADD THIS)
      // if (combinedCircleRef.current?.inner) {
      //   gsap.set(combinedCircleRef.current.inner, {
      //     rotation: rotationAmount * 0.5 // Rotate slower or in opposite direction
      //   });
      // }
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll);

    // Initial call to sync rotation
    handleScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const objectSize = isMobile ? 44 : 70;
  const mobileObjGap = isMobile ? 8 : 24;

  // return (
  //   <section
  //     ref={containerRef}
  //     className="relative w-full h-screen overflow-hidden"
  //   >
  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden"
      style={{ pointerEvents: "none" }}
    >
      {/* Background */}
      <img
        ref={bgRef}
        src={isMobile ? yellow_bg_mobile : yellow_bg}
        alt="yellow background"
        className="absolute inset-0 w-full h-full object-cover z-[1]"
      />
      {/* Right Cloud */}
      <img
        ref={rightCloudRef}
        src={isMobile ? right_cloud_mobile : right_cloud}
        alt="right cloud"
        className="absolute right-0 z-[10]"
        style={{
          top: isMobile ? "6vh" : "3vh",
          width: isMobile ? "38vw" : "20vw",
          height: "auto"
        }}
      />
      {/* Left Cloud */}
      <img
        ref={leftCloudRef}
        src={isMobile ? left_cloud_mobile : left_cloud}
        alt="left cloud"
        className="absolute left-0 z-[10]"
        style={{
          top: isMobile ? "12vh" : "5vh",
          width: isMobile ? "38vw" : "22vw",
          height: "auto"
        }}
      />
      {/* Floor */}
      <img
        ref={floorRef}
        src={isMobile ? floor_2nd_mobile : floor_2nd}
        alt="floor"
        className="absolute left-1/2 -translate-x-1/2 z-[10]"
        style={{
          bottom: 0,
          height: isMobile ? "20vh" : "28vh",
          width: "100%",
          objectFit: "cover"
        }}
      />
      {/* Left Element */}
      <img
        ref={leftElementRef}
        src={isMobile ? left_element_mobile : left_element}
        alt="left element"
        className="absolute z-[11] pointer-events-none"
        style={{
          top: isMobile ? "54%" : "45vh",
          left: isMobile ? "-40%" : "-30%",
          transform: "translateY(-50%)",
          width: isMobile ? "60vw" : "50vw",
          height: "auto"
        }}
      />
      {/* Right Element */}
      <img
        ref={rightElementRef}
        src={isMobile ? right_element_mobile : right_element}
        alt="right element"
        className="absolute z-[11] pointer-events-none"
        style={{
          top: isMobile ? "54%" : "45vh",
          right: isMobile ? "-40%" : "-30%",
          transform: "translateY(-50%)",
          width: isMobile ? "60vw" : "50vw",
          height: "auto"
        }}
      />
      {/* Left Element Eye - Same position as left element */}
      <img
        ref={leftElementEyeRef}
        src={isMobile ? left_element_eye_mobile : left_element_eye}
        alt="left element eye"
        className="absolute z-[12] pointer-events-none"
        style={{
          top: isMobile ? "54%" : "45vh",
          left: isMobile ? "-40%" : "-30%",
          transform: "translateY(-50%)",
          width: isMobile ? "60vw" : "50vw",
          height: "auto",
          opacity: 0
        }}
      />
      {/* Right Element Eye - Same position as right element */}
      <img
        ref={rightElementEyeRef}
        src={isMobile ? right_element_eye_mobile : right_element_eye}
        alt="right element eye"
        className="absolute z-[12] pointer-events-none"
        style={{
          top: isMobile ? "54%" : "45vh",
          right: isMobile ? "-40%" : "-30%",
          transform: "translateY(-50%)",
          width: isMobile ? "60vw" : "50vw",
          height: "auto",
          opacity: 0
        }}
      />
      {/* BIGGER ORBIT - Behind floor, starts at 20% scale, half visible
      <img
        ref={biggerOrbitRef}
        src={isMobile ? bigger_orbit_mobile : bigger_orbit}
        alt="bigger orbit"
        className="absolute left-1/2 -translate-x-1/2 z-[9] pointer-events-none"
        style={{
          bottom: isMobile ? "-2vh" : "-60vh",
          width: isMobile ? "100%" : "80vw",
          height: "auto",
          opacity: 0,
          transformOrigin: "center center"
        }}
      /> */}
      {/* BIGGER ORBIT - Behind floor, starts at 20% scale, half visible */}
      <img
        ref={biggerOrbitRef}
        src={isMobile ? bigger_orbit_mobile : bigger_orbit}
        alt="bigger orbit"
        className="absolute left-1/2 -translate-x-1/2 z-[9] pointer-events-none"
        style={{
          bottom: isMobile
            ? "-2vh"
            : isTabletLandscape
            ? "-40vh" // ⬅️ moved upward for tablet landscape
            : "-60vh", // desktop
          width: isMobile ? "100%" : "80vw",
          height: "auto",
          opacity: 0,
          transformOrigin: "center center"
        }}
      />
      {/* PINK BIGGER ORBIT - Wrapper for position */}
      <div
        ref={pinkBiggerOrbitRef}
        className="absolute left-1/2 -translate-x-1/2 z-[9] pointer-events-none"
        style={{
          // bottom: isMobile ? "-2vh" : "-60vh",
          bottom: isMobile
            ? "-2vh"
            : isTabletLandscape
            ? "-40vh" // ⬅️ moved upward for tablet landscape
            : "-60vh", // desktop
          width: isMobile ? "100%" : "80vw",
          height: "auto",
          opacity: 0
        }}
      >
        <img
          ref={pinkOrbitInnerRef}
          src={isMobile ? pink_bigger_orbit_mobile : pink_bigger_orbit}
          alt="pink bigger orbit"
          className="w-full h-auto"
          style={{
            transformOrigin: "center center"
            // opacity: 0.5
          }}
        />
        {/* Combined Circle - appears at center of PINK ORBIT */}
        {/* <div
          ref={combinedCircleContainerRef}
          className="absolute z-[15] pointer-events-none"
          style={{
            width: "30vw",
            height: "30vw",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            opacity: 0
          }}
        >
          <CombinedCircle ref={combinedCircleRef} isMobile={isMobile} />
        </div> */}
        {/* Combined Circle - appears at center of PINK ORBIT */}
        <div
          ref={combinedCircleContainerRef}
          className="absolute z-[15] pointer-events-none"
          style={{
            width: isMobile ? "60vw" : "30vw", // Responsive width
            height: isMobile ? "60vw" : "30vw", // Same as width for perfect circle
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)", // Perfect centering
            opacity: 0
          }}
        >
          <CombinedCircle ref={combinedCircleRef} isMobile={isMobile} />
        </div>
      </div>
      {/* YELLOW ELLIPSE - Lower z-index so objects are visible on top */}
      <img
        ref={ellipseRef}
        src={isMobile ? yellow_ellipse_mobile : yellow_ellipse}
        alt="yellow ellipse"
        className="absolute left-1/2 -translate-x-1/2 z-[14] pointer-events-none"
        style={{
          bottom: isMobile ? "9vh" : "5vh",
          width: isMobile ? "300px" : "560px",
          height: "auto",
          opacity: 0,
          transformOrigin: "center"
        }}
      />
      {/* FALLING OBJECTS CONTAINER - Higher z-index so they appear above ellipse */}
      <div
        ref={objectsContainerRef}
        className="absolute left-1/2 z-[15] pointer-events-none"
        style={{
          top: isMobile ? "65%" : "50%",
          transform: "translate(-50%, -50%)",
          opacity: 0
        }}
      >
        {isMobile ? (
          <div
            className="flex flex-col items-center justify-center"
            style={{ rowGap: mobileObjGap }}
          >
            <img
              ref={object1Ref}
              src={object_1}
              alt="object 1"
              style={{
                width: `${objectSize}px`,
                height: "auto"
              }}
            />
            <img
              ref={object2Ref}
              src={object_2}
              alt="object 2"
              style={{
                width: `${objectSize}px`,
                height: "auto"
              }}
            />
            <img
              ref={object3Ref}
              src={object_1}
              alt="object 3"
              style={{
                width: `${objectSize}px`,
                height: "auto"
              }}
            />
          </div>
        ) : (
          <div className="flex gap-24 items-center justify-center">
            <img
              ref={object1Ref}
              src={object_1}
              alt="object 1"
              style={{
                width: `${objectSize}px`,
                height: "auto"
              }}
            />
            <img
              ref={object2Ref}
              src={object_2}
              alt="object 2"
              style={{
                width: `${objectSize}px`,
                height: "auto"
              }}
            />
            <img
              ref={object3Ref}
              src={object_1}
              alt="object 3"
              style={{
                width: `${objectSize}px`,
                height: "auto"
              }}
            />
          </div>
        )}
      </div>
      {/* FIRST TEXT - "Home to fearless design..." */}
      <div
        ref={text0Ref}
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
          top: isMobile ? "24%" : "26%",
          maxWidth: isMobile ? "100%" : "80%",
          width: isMobile ? "92vw" : "80%",
          opacity: 0,
          color: "rgb(0, 0, 0)",
          willChange: "transform, opacity"
        }}
      >
        {isMobile ? (
          <>
            <div>
              <span data-text0 style={{ color: "rgb(0, 0, 0)" }}>
                Home{" "}
              </span>
              <span data-text0 style={{ color: "rgb(0, 0, 0)" }}>
                to{" "}
              </span>
              <span data-text0 style={{ color: "rgb(0, 0, 0)" }}>
                fearless
              </span>
            </div>
            <div>
              <span data-text0 style={{ color: "rgb(0, 0, 0)" }}>
                design{" "}
              </span>
              <span data-text0 style={{ color: "rgb(0, 0, 0)" }}>
                and{" "}
              </span>
              <span data-text0 style={{ color: "rgb(0, 0, 0)" }}>
                untamed
              </span>
            </div>
            <div>
              <span data-text0 style={{ color: "rgb(0, 0, 0)" }}>
                creativity.
              </span>
            </div>
          </>
        ) : (
          <>
            <div>
              <span data-text0 style={{ color: "rgb(0, 0, 0)" }}>
                Home{" "}
              </span>
              <span data-text0 style={{ color: "rgb(0, 0, 0)" }}>
                to{" "}
              </span>
              <span data-text0 style={{ color: "rgb(0, 0, 0)" }}>
                fearless{" "}
              </span>
              <span data-text0 style={{ color: "rgb(0, 0, 0)" }}>
                design{" "}
              </span>
              <span data-text0 style={{ color: "rgb(0, 0, 0)" }}>
                and
              </span>
            </div>
            <div>
              <span data-text0 style={{ color: "rgb(0, 0, 0)" }}>
                untamed{" "}
              </span>
              <span data-text0 style={{ color: "rgb(0, 0, 0)" }}>
                creativity.
              </span>
            </div>
          </>
        )}
      </div>
      <div
        ref={textRef}
        className={[
          "absolute left-1/2 -translate-x-1/2 z-[20] text-center font-extrabold",
          // =======================
          // MOBILE (<=767)
          // =======================
          "text-[32px] leading-[1.2] letterSpacing-[-0.03em]", // default mobile 667/736
          "[@media(min-height:812px)]:text-[40px]", // mobile 812+
          "[@media(min-height:812px)]:leading-[1.2]",
          // =======================
          // DESKTOP (>=1024)
          // =======================
          "md:text-[48px] md:leading-[1.2]", // desktop compact 768px height
          "[@media(min-width:1024px)]:[@media(min-height:900px)]:text-[64px]", // desktop 900+
          "[@media(min-width:1024px)]:[@media(min-height:900px)]:leading-[1.2]"
        ].join(" ")}
        style={{
          top: isMobile ? "24%" : "26%",
          maxWidth: isMobile ? "100%" : "80%",
          width: isMobile ? "92vw" : "80%",
          opacity: 0,
          color: "rgb(0, 0, 0)",
          willChange: "transform, opacity"
        }}
      >
        {isMobile ? (
          <>
            <div>
              <span data-text="first" style={{ color: "rgb(0, 0, 0)" }}>
                Here,{" "}
              </span>
              <span data-text="first" style={{ color: "rgb(0, 0, 0)" }}>
                you'll{" "}
              </span>
              <span data-text="first" style={{ color: "rgb(0, 0, 0)" }}>
                find{" "}
              </span>
              <span data-text="first" style={{ color: "rgb(0, 0, 0)" }}>
                mentors,{" "}
              </span>
              {/* </div>
            <div> */}
              <span data-text="first" style={{ color: "rgb(0, 0, 0)" }}>
                misfits,{" "}
              </span>
            </div>
            <div>
              <span data-text="last" style={{ color: "rgb(0, 0, 0)" }}>
                and{" "}
              </span>
              <span data-text="last" style={{ color: "rgb(0, 0, 0)" }}>
                midnight{" "}
              </span>
              <span data-text="last" style={{ color: "rgb(0, 0, 0)" }}>
                breakthroughs.
              </span>
            </div>
          </>
        ) : (
          <>
            <div>
              <span data-text="first" style={{ color: "rgb(0, 0, 0)" }}>
                Here,{" "}
              </span>
              <span data-text="first" style={{ color: "rgb(0, 0, 0)" }}>
                you'll{" "}
              </span>
              <span data-text="first" style={{ color: "rgb(0, 0, 0)" }}>
                find{" "}
              </span>
              <span data-text="first" style={{ color: "rgb(0, 0, 0)" }}>
                mentors,{" "}
              </span>
              <span data-text="first" style={{ color: "rgb(0, 0, 0)" }}>
                misfits,
              </span>
            </div>
            <div>
              <span data-text="last" style={{ color: "rgb(0, 0, 0)" }}>
                and{" "}
              </span>
              <span data-text="last" style={{ color: "rgb(0, 0, 0)" }}>
                midnight{" "}
              </span>
              <span data-text="last" style={{ color: "rgb(0, 0, 0)" }}>
                breakthroughs.
              </span>
            </div>
          </>
        )}
      </div>
      {/* SECOND TEXT */}
      <div
        ref={text2Ref}
        // className="absolute left-1/2 -translate-x-1/2 z-[20] text-center font-extrabold text-3xl md:text-6xl"
        className={[
          "absolute left-1/2 -translate-x-1/2 z-[20] text-center font-extrabold",
          // =======================
          // MOBILE (<=767)
          // =======================
          "text-[32px] leading-[1.2]", // default mobile 667/736
          "[@media(min-height:812px)]:text-[40px]", // mobile 812+
          "[@media(min-height:812px)]:leading-[1.2]",
          // =======================
          // DESKTOP (>=1024)
          // =======================
          "md:text-[48px] md:leading-[1.2]", // desktop compact 768px height
          "[@media(min-width:1024px)]:[@media(min-height:900px)]:text-[64px]" // desktop 900+
          // "[@media(min-width:1024px)]:[@media(min-height:900px)]:leading-[1.2]"
        ].join(" ")}
        style={{
          top: isMobile ? "24%" : "26%",
          // fontSize: isMobile ? "2rem" : "3rem",
          // fontSize: isMobile
          //   ? "clamp(1.1rem, 4.2vw, 2.2rem)"
          //   : "clamp(1.25rem, 2.6vw, 3rem)",
          // lineHeight: isMobile ? "36px" : "60px",
          maxWidth: isMobile ? "100%" : "100%",
          width: isMobile ? "92vw" : "80%",
          opacity: 0,
          color: "rgb(0, 0, 0)"
        }}
      >
        {isMobile ? (
          <>
            <div>
              <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
                It's{" "}
              </span>
              <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
                where{" "}
              </span>
              <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
                you
              </span>
            </div>
            <div>
              <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
                learn{" "}
              </span>
              <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
                to{" "}
              </span>
              <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
                make{" "}
              </span>
              {/* <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
                the
              </span> */}
            </div>
            <div>
              <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
                the{" "}
              </span>
              <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
                world{" "}
              </span>
              <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
                stop
              </span>
            </div>
            <div>
              <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
                and{" "}
              </span>
              <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
                notice{" "}
              </span>
              <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
                your
              </span>
            </div>
            <div>
              <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
                designs.
              </span>
            </div>
          </>
        ) : (
          <>
            <div>
              <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
                It's{" "}
              </span>
              <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
                where{" "}
              </span>
              <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
                you{" "}
              </span>
              <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
                learn{" "}
              </span>
              <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
                to{" "}
              </span>
              <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
                make{" "}
              </span>
              <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
                the{" "}
              </span>
              <br />
              <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
                world{" "}
              </span>
              <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
                stop{" "}
              </span>
              {/* </div> */}
              {/* <div> */}
              <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
                and{" "}
              </span>
              <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
                notice{" "}
              </span>
              <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
                your{" "}
              </span>
              <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
                designs.
              </span>
            </div>
          </>
        )}
      </div>
      <div
        ref={text3Ref}
        //       className={`
        //   absolute left-1/2 -translate-x-1/2 z-[20] text-center font-extrabold
        //   text-3xl md:text-5xl
        // `}
        className={[
          "absolute left-1/2 -translate-x-1/2 z-[20] text-center font-extrabold",
          // =======================
          // MOBILE (<=767)
          // =======================
          "text-[24px] leading-[1.2] letterSpacing-[0.03em]", // default mobile 667/736
          "[@media(min-height:812px)]:text-[32px]", // mobile 812+
          "[@media(min-height:812px)]:leading-[1.2]",
          // =======================
          // DESKTOP (>=1024)
          // =======================
          "md:text-[32px] md:leading-[1.2]",
          "@media (min-width:1024px) and (min-height:768px):text-[32px]", // desktop compact 768px height
          "@media (min-width:1024px) and (min-height:1080px):text-[56px]", // desktop 900+
          "[@media(min-width:1024px)]:[@media(min-height:900px)]:leading-[1.2]"
        ].join(" ")}
        style={{
          top: isMobile ? "30%" : "58%",
          lineHeight: isMobile ? "36px" : "84px",
          color: "rgb(0, 0, 0)",
          opacity: 0,
          width: isMobile ? "85vw" : "60%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        with evolve, you get to build
      </div>
      {/* FOURTH TEXT - Desktop: 3 stacked texts */}
      {!isMobile && (
        <div
          ref={text4Ref}
          // className="absolute left-1/2 -translate-x-1/2 z-[20] text-center font-extrabold text-6xl"
          className={[
            "absolute left-1/2 -translate-x-1/2 z-[20] text-center font-extrabold",
            "md:text-[48px] md:leading-[48px]", // desktop compact 768px height
            "[@media(min-width:1024px)]:[@media(min-height:900px)]:text-[64px]", // desktop 900+
            "[@media(min-width:1024px)]:[@media(min-height:900px)]:leading-[64px]"
          ].join(" ")}
          style={{
            top: "70%",
            // fontSize: "3.5rem",
            // fontSize: "clamp(1.75rem, 3.6vw, 3.5rem)",
            // lineHeight: "64px",
            letterSpacing: 0,
            color: "rgb(0, 0, 0)",
            opacity: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0rem"
          }}
        >
          <div>real design,</div>
          <div>real portfolio,</div>
          <div>real career beginnings...</div>
        </div>
      )}
      {/* STAIRS FOR DESKTOP */}
      {!isMobile && (
        <>
          {/* Left stairs with gradient mask */}
          <div
            ref={stairsLeftRef}
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

          {/* Right stairs with gradient mask */}
          <div
            ref={stairsRightRef}
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
          {/* Waitlist Button - Desktop - MOVE THIS OUTSIDE OF ANY POINTER-EVENTS-NONE CONTAINERS */}
          {/* Waitlist Button - Works for BOTH mobile and desktop */}
          {/* <div
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              bottom: isMobile ? "12%" : "10%",
              zIndex: 999999,
              pointerEvents: "auto",
              isolation: "isolate"
            }}
          >
            <WaitlistButton
              ref={waitlistButtonRef}
              style={{
                opacity: 0,
                width: isMobile ? "75vw" : "auto",
                padding: isMobile ? "16px 20px" : "20px 40px",
                fontSize: isMobile ? "1.5rem" : "1.75rem",
                position: "relative",
                zIndex: 999999,
                pointerEvents: "auto"
              }}
              onClick={() => console.log("Waitlist button clicked!")}
            />
          </div> */}
          {/* Text8: "the evolve toolkit" - Desktop */}
          <div
            ref={text8Ref}
            // className="absolute left-1/2 -translate-x-1/2 z-[20] text-center leading-tight font-extrabold text-6xl"
            className={[
              "absolute left-1/2 -translate-x-1/2 z-[20] text-center font-extrabold",
              "md:text-[48px] md:leading-[1.2]", // desktop compact 768px height
              "[@media(min-width:1024px)]:[@media(min-height:900px)]:text-[64px]", // desktop 900+
              "[@media(min-width:1024px)]:[@media(min-height:900px)]:leading-[1.2]"
            ].join(" ")}
            style={{
              bottom: "10%",
              // fontSize: "6rem",
              // fontSize: "clamp(2rem, 6.5vw, 6rem)",
              lineHeight: "84px",
              color: "rgb(0, 0, 0)",
              opacity: 0
            }}
          >
            the evolve toolkit
          </div>
          {/* Mini Ovals Container - Desktop (horizontal layout) */}
          <div
            className="absolute left-1/2 -translate-x-1/2 z-[15]"
            style={{
              bottom: "20%", // Start from above text
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
              ref={ovalMini3Ref}
              src={oval_mini_3}
              alt="oval mini 3"
              className="pointer-events-none"
              style={{
                width: "280px",
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
                width: "280px",
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
                width: "280px",
                height: "auto",
                opacity: 0
              }}
            />
          </div>
          {/* Full Ovals Container - Desktop (horizontal layout) */}
          <div
            className="absolute left-1/2 -translate-x-1/2 z-[16]"
            style={{
              bottom: "20%",
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
              className="pointer-events-none"
              style={{
                width: "380px",
                height: "auto",
                opacity: 0
              }}
            />
            <img
              ref={oval2Ref}
              src={oval_2}
              alt="oval 2"
              className="pointer-events-none"
              style={{
                width: "380px",
                height: "auto",
                opacity: 0
              }}
            />
            <img
              ref={oval1Ref}
              src={oval_1}
              alt="oval 1"
              className="pointer-events-none"
              style={{
                width: "380px",
                height: "auto",
                opacity: 0
              }}
            />
          </div>
          {/* Full Ovals Container - MOBILE - with clipping mask */}
          {/* Full Ovals Container - MOBILE - with proper masking */}
          {isMobile && (
            <div
              className="absolute z-[16]"
              style={{
                left: 0,
                right: 0,
                top: 0,
                bottom: "15vh", // Boundary stops here (above text8)
                overflow: "hidden", // This clips the content
                pointerEvents: "none"
              }}
            >
              {/* Inner positioned container - this is what moves */}
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "42.5vh", // Center in the visible area (85vh / 2)
                  transform: "translate(-50%, 0)",
                  width: "85vw",
                  maxWidth: "380px"
                }}
              >
                <img
                  ref={oval1Ref}
                  src={oval_1}
                  alt="oval 1"
                  className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
                  style={{
                    width: "100%",
                    height: "auto",
                    opacity: 0,
                    top: 0
                  }}
                />

                <img
                  ref={oval2Ref}
                  src={oval_2}
                  alt="oval 2"
                  className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
                  style={{
                    width: "100%",
                    height: "auto",
                    opacity: 0,
                    top: 0
                  }}
                />

                <img
                  ref={oval3Ref}
                  src={oval_3}
                  alt="oval 3"
                  className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
                  style={{
                    width: "100%",
                    height: "auto",
                    opacity: 0,
                    top: 0
                  }}
                />
              </div>
            </div>
          )}
        </>
      )}
      {/* STAIRS FOR MOBILE */}
      {/* STAIRS FOR MOBILE */}
      // STAIRS FOR MOBILE - UPDATED WITH CORRECT SVG NAMES // STAIRS FOR MOBILE
      - COMPLETE SECTION
      {isMobile && (
        <>
          {/* Step 1: stairs1_mobile appears at bottom left */}
          <img
            ref={stairsMod1MobileRef}
            src={stairs1_mobile}
            alt="stairs1 mobile"
            className="absolute z-[10] pointer-events-none"
            style={{
              bottom: 0,
              left: 0,
              width: "auto",
              height: "auto",
              opacity: 0
            }}
          />

          {/* Step 2: stairs2_mobile appears on top of stairs1 */}
          <img
            ref={stairsMod2MobileRef}
            src={stairs2_mobile}
            alt="stairs2 mobile"
            className="absolute z-[10] pointer-events-none"
            style={{
              bottom: 0,
              left: 0,
              width: "auto",
              height: "auto",
              opacity: 0
            }}
          />

          {/* Step 3: stairs4_mobile appears on top when orbit goes up and "real design" text comes */}
          <img
            ref={leftStairsMod3MobileRef}
            src={stairs4_mobile}
            alt="stairs4 mobile"
            className="absolute z-[10] pointer-events-none"
            style={{
              bottom: 0,
              left: 0,
              width: "auto",
              height: "auto",
              opacity: 0
            }}
          />

          {/* Step 4: stairsfull_right_mobile appears when "real portfolio" text comes */}
          <img
            ref={rightStairsMod3MobileRef}
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

          {/* Step 5: left_stairs_mod6_mobile - will slide in from left when orbit centers */}
          <img
            ref={leftStairsMod6MobileRef}
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

          {/* Text 5: "real design," */}
          <div
            ref={text5Ref}
            className="absolute left-1/2 -translate-x-1/2 z-[20] text-center font-extrabold "
            style={{
              top: "42%",
              fontSize: "2.5rem",
              width: "75vw",
              lineHeight: "32px",
              maxWidth: "100vw",
              color: "rgb(0, 0, 0)",
              opacity: 0
            }}
          >
            real design,
          </div>

          {/* Text 6: "real portfolio," */}
          <div
            ref={text6Ref}
            className="absolute left-1/2 -translate-x-1/2 z-[20] text-center font-extrabold text-6xl"
            style={{
              top: "42%",
              width: "75vw",
              fontSize: "2.5rem",
              lineHeight: "32px",
              color: "rgb(0, 0, 0)",
              opacity: 0
            }}
          >
            real portfolio,
          </div>

          {/* Text 7: "real career beginnings..." */}
          <div
            ref={text7Ref}
            className="absolute left-1/2 -translate-x-1/2 z-[20] leading-1 text-center font-extrabold text-6xl"
            style={{
              top: "42%",
              width: "75vw",
              fontSize: "2.5rem",
              lineHeight: "40px",
              color: "rgb(0, 0, 0)",
              opacity: 0
            }}
          >
            real career beginnings...
          </div>

          {/* Text8: "the evolve toolkit" */}
          <div
            ref={text8Ref}
            className={[
              "absolute left-1/2 -translate-x-1/2 z-[20] text-center font-extrabold leading-tight",
              "text-[40px] leading-[1]", // default mobile 667/736
              "[@media(max-width:767px)]:[@media(min-height:812px)]:text-[48px] leading-[1]",
              "[@media(max-width:767px)]:[@media(min-height:926px)]:text-[56px] leading-[1]"
            ].join(" ")}
            style={{
              bottom: "10%",
              width: "75vw",
              // lineHeight: "36px",
              color: "rgb(0, 0, 0)",
              opacity: 0
            }}
          >
            the evolve toolkit
          </div>

          {/* Mini Ovals Container */}
          <div
            className="absolute left-1/2 -translate-x-1/2 z-[15]"
            style={{
              bottom: "15%",
              top: 0,
              display: "flex",
              flexDirection: "column",
              gap: "16px",
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
                width: "80%",
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
                width: "80%",
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
                width: "80%",
                height: "auto",
                opacity: 0
              }}
            />
          </div>
          {/* Full Ovals Container - SAME position as mini ovals */}
          <div
            className="absolute left-1/2 -translate-x-1/2 z-[16]"
            style={{
              bottom: "15%", // Start from text position
              top: 0, // Extend to top
              display: "flex",
              alignItems: "center",
              justifyContent: "center", // Center in available space
              pointerEvents: "none"
            }}
          >
            <img
              ref={oval1Ref}
              src={oval_1}
              alt="oval 1"
              className="absolute pointer-events-none"
              style={{
                width: "85vw",
                maxWidth: "380px",
                height: "auto",
                opacity: 0,
                left: "50%",
                transform: "translateX(-50%)"
              }}
            />

            <img
              ref={oval2Ref}
              src={oval_2}
              alt="oval 2"
              className="absolute pointer-events-none"
              style={{
                width: "85vw",
                maxWidth: "380px",
                height: "auto",
                opacity: 0,
                left: "50%",
                transform: "translateX(-50%)"
              }}
            />

            <img
              ref={oval3Ref}
              src={oval_3}
              alt="oval 3"
              className="absolute pointer-events-none"
              style={{
                width: "85vw",
                maxWidth: "380px",
                height: "auto",
                opacity: 0,
                left: "50%",
                transform: "translateX(-50%)"
              }}
            />
          </div>
        </>
      )}
      {/* FLOATING BUTTON LAYER - Completely independent */}
      {/* <div
        style={{
          position: "fixed",
          left: "50%",
          bottom: isMobile ? "12%" : "10%",
          transform: "translateX(-50%)",
          zIndex: 9999999,
          pointerEvents: "auto"
        }}
      >
        <button
          ref={waitlistButtonRef}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            console.log("BUTTON CLICKED!");
            window.open(
              "https://discord.com/channels/@me/1347086283985649749/1438414139365265479",
              "_blank"
            );
          }}
          onMouseEnter={() => console.log("MOUSE ON BUTTON")}
          style={{
            backgroundColor: "#000000",
            borderRadius: "16px",
            padding: isMobile ? "16px 20px" : "20px 40px",
            fontSize: isMobile ? "1.5rem" : "1.75rem",
            color: "#ffffff",
            textTransform: "lowercase",
            fontWeight: 800,
            boxShadow: "0 6px 0 rgba(128, 128, 128, 0.8)",
            cursor: "pointer",
            border: "none",
            width: isMobile ? "75vw" : "auto",
            pointerEvents: "auto",
            opacity: 0
          }}
        >
          join the waitlist
        </button>
      </div> */}
      {/* WAITLIST BUTTON - Single Instance */}
      {/* WAITLIST BUTTON - Single Instance */}
      {/* WAITLIST BUTTON - Single Instance */}
      {/* WAITLIST BUTTON - Single Instance */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: isMobile ? "12%" : "10%",
          transform: "translateX(-50%)",
          zIndex: 20,
          pointerEvents: "none" // Wrapper is always "none"
        }}
      >
        <a
          ref={waitlistButtonRef}
          href="https://discord.gg/wKRYG7cSWt"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.stopPropagation();
            console.log("Waitlist button clicked!");
          }}
          style={{
            display: "inline-block",
            pointerEvents: "none", // Start as non-clickable
            opacity: 0,
            willChange: "transform, opacity, pointer-events",
            transition: "opacity 0.3s ease"
          }}
        >
          <img
            src={join_us_button}
            alt="join us"
            className="hover:opacity-80 transition-opacity duration-300"
            style={{
              width: "auto",
              height: isMobile ? "3rem" : "4rem",
              display: "block"
            }}
          />
        </a>
      </div>
    </section>
  );
});

Scene1_1.displayName = "Scene1_1";
export default Scene1_1;
