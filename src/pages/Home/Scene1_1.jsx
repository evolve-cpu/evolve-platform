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
  stairs_right_2
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

  // Show first text
  gsap.set(refs.text, {
    opacity: 1
    // y: 0
  });

  // Show all text spans at full opacity
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
    opacity: 1,
    scale: isMobile ? 2.3 : 1,
    y: isMobile ? -250 : -200
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
      opacity: 0
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

  // Detect screen categories
  if (width <= 1440) {
    // Small laptops (13-14 inch) - current behavior
    return { orbit: 1, stairs: 1 };
  } else if (width <= 1920 && height <= 1200) {
    // Medium laptops (15-16 inch) - reduce movement by 30%
    return { orbit: 0.7, stairs: 0.85 };
  } else {
    // Large screens (17+ inch, 4K) - reduce movement by 50%
    return { orbit: 0.5, stairs: 0.7 };
  }
};
// Timeline hook for Scene1_1 animation - works with master timeline
export const useScene1_1Timeline = (refs, isMobile) => {
  const tl = gsap.timeline();

  // Get screen multipliers for responsive movement
  const multipliers = getScreenMultipliers();

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
      "-=0.8"
    );

  // ===== TEXT APPEARS FIRST (1.5s) =====
  tl.to(
    refs.text,
    { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
    1.5
  );

  // ===== BIGGER ORBIT APPEARS (at 20% scale, half visible above floor) =====
  tl.to(refs.biggerOrbit, { opacity: 1, duration: 0.6 }, 2.0);

  // ===== THEN OBJECTS APPEAR (reduced time gap) =====
  tl.to(refs.objectsContainer, { opacity: 1, duration: 0.6 }, 3.5);

  // ===== OBJECTS START FALLING (4.5s) =====
  const fallDuration = 2.5;
  const fallStart = 4.5;

  // ===== TEXT ANIMATION HAPPENS WHILE OBJECTS ARE FALLING =====
  // Text animates up to "misfits" (first 5 words) during fall
  if (refs.text) {
    const spans = Array.from(refs.text.querySelectorAll("span[data-text]"));

    // Set all spans to start at 0.3 opacity - but let them animate to full black
    spans.forEach((span) => {
      gsap.set(span, {
        opacity: 0.3,
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
  const calculateFallDistance = () => {
    if (!refs.objectsContainer) return isMobile ? 250 : 350;

    try {
      const objectsRect = refs.objectsContainer.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Ellipse dimensions
      const ellipseHeight = isMobile ? 300 * 0.4 : 560 * 0.3; // Approximate height (30% of width)
      const ellipseBottom = isMobile
        ? viewportHeight * 0.09
        : viewportHeight * 0.05;

      // Target is ellipse center (bottom + half height)
      const ellipseCenter = viewportHeight - ellipseBottom - ellipseHeight / 2;

      // Current object position
      const objectsCenterY = isMobile
        ? objectsRect.bottom - objectSize / 2 // Mobile: bottom object center
        : objectsRect.top + objectsRect.height / 2; // Desktop: container center

      const distance = ellipseCenter - objectsCenterY;

      console.log("Fall calculation:", {
        ellipseCenter,
        objectsCenterY,
        distance,
        isMobile
      });

      return distance > 0 ? distance : isMobile ? 250 : 350;
    } catch (error) {
      console.error("Error calculating fall distance:", error);
      return isMobile ? 250 : 350;
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
      opacity: 1,
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
        opacity: 0.3,
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
    } else {
      // Desktop: Both eyes same size and position
      tl.fromTo(
        refs.leftElementEye,
        {
          x: 0,
          y: 0
        },
        {
          y: "15vh",
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
          y: "15vh",
          right: "-2.5%",
          scale: 1.2,
          duration: 1.2,
          ease: "power2.in"
        },
        stopAnimationEnd
      );
    }

    // After elements reach position, eyes fade in (opening effect)
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

    // ADD THIS SECTION - Pink orbit transition
    // Set initial state for pink orbit (same as yellow orbit)
    tl.set(
      refs.pinkBiggerOrbit,
      {
        opacity: 0,
        scale: isMobile ? 2.3 : 1,
        y: isMobile ? -250 : -200,
        willChange: "transform, opacity"
      },
      eyesOpenStart
    );

    // Fade out yellow orbit and fade in pink orbit simultaneously
    const pinkOrbitTransitionStart = eyesOpenStart + 0.8;

    tl.to(
      refs.biggerOrbit,
      {
        opacity: 0,
        duration: 0.8,
        ease: "power2.inOut"
      },
      pinkOrbitTransitionStart
    );

    tl.to(
      refs.pinkBiggerOrbit,
      {
        opacity: 1,
        duration: 0.8,
        ease: "power2.inOut"
      },
      pinkOrbitTransitionStart
    );

    // ADD THIS SECTION - Elements disappear and orbit moves up
    const elementsDisappearStart = pinkOrbitTransitionStart + 1.0;

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
      tl.to(
        refs.pinkBiggerOrbit,
        {
          y: "-35%", // Move more upwards for desktop
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

    if (isMobile) {
      const mobileStairsStart = text3AppearStart + 0.5;

      // Step 1: stairs_mini_mobile appears
      tl.set(
        refs.stairsMiniMobile,
        {
          opacity: 0,
          willChange: "transform, opacity"
        },
        mobileStairsStart
      );

      tl.to(
        refs.stairsMiniMobile,
        {
          opacity: 1,
          duration: 0,
          ease: "power2.out"
        },
        mobileStairsStart
      );

      // Step 2: stairs_mod_mobile appears with fromTo animation (more stairs coming)
      const stairsModStart = mobileStairsStart + 1.5;

      tl.fromTo(
        refs.stairsModMobile,
        {
          opacity: 0,
          y: 50,
          scale: 0
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0,
          ease: "power2.out"
        },
        stairsModStart
      );

      // Step 3: stairs_mod1_mobile appears + orbit moves up + text5 appears
      const stairsMod1Start = stairsModStart + 1.5;

      tl.fromTo(
        refs.stairsMod1Mobile,
        {
          opacity: 0,
          y: 50,
          scale: 0
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0,
          ease: "power2.out"
        },
        stairsMod1Start
      );

      // Orbit moves upwards
      tl.to(
        refs.pinkBiggerOrbit,
        {
          y: "-=15vh", // Move up by 15vh from current position
          duration: 1.0,
          ease: "power2.out"
        },
        stairsMod1Start
      );

      // Text5 appears: "real design,"
      tl.set(
        refs.text5,
        {
          opacity: 0,
          willChange: "opacity"
        },
        stairsMod1Start
      );

      tl.to(
        refs.text5,
        {
          opacity: 1,
          duration: 0.6,
          ease: "power2.out"
        },
        stairsMod1Start + 0.8
      );

      // Step 4: Orbit moves right + all stairs removed + stairs_mod2_mobile appears + text changes
      const finalStairsStart = stairsMod1Start + 2.0;

      // Orbit moves rightwards
      tl.to(
        refs.pinkBiggerOrbit,
        {
          x: "+=10vw", // Move right by 10vw from current position
          duration: 1.0,
          ease: "power2.out"
        },
        finalStairsStart
      );

      // Remove all previous stairs
      tl.to(
        [refs.stairsMiniMobile, refs.stairsModMobile, refs.stairsMod1Mobile],
        {
          opacity: 0,
          duration: 0.4,
          ease: "power2.out"
        },
        finalStairsStart
      );

      // stairs_mod2_mobile appears at bottom-0 right-0
      tl.fromTo(
        refs.stairsMod2Mobile,
        {
          opacity: 0,
          y: 50,
          scale: 0.95
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power2.out"
        },
        finalStairsStart + 0.4
      );

      // Text5 fades out
      tl.to(
        refs.text5,
        {
          opacity: 0,
          duration: 0.4,
          ease: "power2.out"
        },
        finalStairsStart
      );

      // Text6 appears: "real portfolio,"
      tl.set(
        refs.text6,
        {
          opacity: 0,
          willChange: "opacity"
        },
        finalStairsStart + 0.4
      );

      tl.to(
        refs.text6,
        {
          opacity: 1,
          duration: 0.6,
          ease: "power2.out"
        },
        finalStairsStart + 0.8
      );

      // Step 5: Orbit moves more right + remove stairs_mod2 + show left & right stairs_mod3 + text changes
      const mod3StairsStart = finalStairsStart + 2.0;

      // Orbit moves more rightwards
      tl.to(
        refs.pinkBiggerOrbit,
        {
          x: "+=15vw",
          y: "+=10vh", // Move right by another 10vw from current position
          duration: 1.0,
          ease: "power2.out"
        },
        mod3StairsStart
      );

      // Remove stairs_mod2_mobile
      tl.to(
        refs.stairsMod2Mobile,
        {
          opacity: 0,
          duration: 0.4,
          ease: "power2.out"
        },
        mod3StairsStart
      );

      // left_stairs_mod3_mobile appears at bottom-0 left-0
      tl.fromTo(
        refs.leftStairsMod3Mobile,
        {
          opacity: 0,
          y: 50,
          scale: 0.95
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power2.out"
        },
        mod3StairsStart + 0.4
      );

      // right_stairs_mod3_mobile appears at bottom-0 right-0
      tl.fromTo(
        refs.rightStairsMod3Mobile,
        {
          opacity: 0,
          y: 50,
          scale: 0.95
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power2.out"
        },
        mod3StairsStart + 0.4
      );

      // Text6 fades out
      tl.to(
        refs.text6,
        {
          opacity: 0,
          duration: 0.4,
          ease: "power2.out"
        },
        mod3StairsStart
      );

      // Text7 appears: "real career beginnings..."
      tl.set(
        refs.text7,
        {
          opacity: 0,
          willChange: "opacity"
        },
        mod3StairsStart + 0.4
      );

      tl.to(
        refs.text7,
        {
          opacity: 1,
          duration: 0.6,
          ease: "power2.out"
        },
        mod3StairsStart + 0.8
      );
      // Step 6: Remove texts + orbit centers + combined circle appears + new stairs mod4
      const centerCircleStart = mod3StairsStart + 2.0;

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
          x: 0, // Center horizontally
          y: "-25vh", // Adjust vertical position
          duration: 1.2,
          ease: "power2.out"
        },
        centerCircleStart
      );

      // Remove old stairs (mod3)
      tl.to(
        [refs.leftStairsMod3Mobile, refs.rightStairsMod3Mobile],
        {
          opacity: 0,
          duration: 0.4,
          ease: "power2.out"
        },
        centerCircleStart
      );

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

      // New stairs mod4 appear
      tl.fromTo(
        refs.leftStairsMod4Mobile,
        {
          opacity: 0,
          y: 50,
          scale: 0.95
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power2.out"
        },
        centerCircleStart + 0.8
      );

      tl.fromTo(
        refs.rightStairsMod4Mobile,
        {
          opacity: 0,
          y: 50,
          scale: 0.95
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power2.out"
        },
        centerCircleStart + 0.8
      );

      // Step 7: Zoom effect + inner circle reveals + stairs mod5
      const zoomStart = centerCircleStart + 3.0;

      // Orbit scales up (zoom effect)
      tl.to(
        refs.pinkBiggerOrbit,
        {
          scale: "+=0.5", // Scale up from current scale
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
            scale: 1, // Scale to full size
            duration: 1.5,
            ease: "power2.inOut"
          },
          zoomStart
        );
      }

      // Inner part becomes visible and scales up when circle reaches certain size
      if (refs.combinedCircle?.inner) {
        // Set initial state
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
            scale: 1,
            duration: 1.2,
            ease: "power2.out"
          },
          zoomStart + 0.5
        );
      }

      // Remove stairs mod4
      tl.to(
        [refs.leftStairsMod4Mobile, refs.rightStairsMod4Mobile],
        {
          opacity: 0,
          duration: 0.4,
          ease: "power2.out"
        },
        zoomStart
      );

      // New stairs mod5 appear
      tl.fromTo(
        refs.leftStairsMod5Mobile,
        {
          opacity: 0,
          y: 50,
          scale: 0.95
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power2.out"
        },
        zoomStart + 0.4
      );

      tl.fromTo(
        refs.rightStairsMod5Mobile,
        {
          opacity: 0,
          y: 50,
          scale: 0.95
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power2.out"
        },
        zoomStart + 0.4
      );

      // Step 8: Orbit moves up + circle moves up + replace stairs + button appears
      const step8Start = zoomStart + 2.5;

      // Orbit and combined circle move up together
      tl.to(
        refs.pinkBiggerOrbit,
        {
          y: "-=10vh", // Move up by 10vh from current position
          duration: 1.2,
          ease: "power2.out"
        },
        step8Start
      );

      // Remove stairs mod5
      tl.to(
        [refs.leftStairsMod5Mobile, refs.rightStairsMod5Mobile],
        {
          opacity: 0,
          duration: 0.4,
          ease: "power2.out"
        },
        step8Start
      );

      // New stairs mod6 appear
      tl.fromTo(
        refs.leftStairsMod6Mobile,
        {
          opacity: 0,
          y: 50,
          scale: 0.95
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power2.out"
        },
        step8Start + 0.4
      );

      tl.fromTo(
        refs.rightStairsMod6Mobile,
        {
          opacity: 0,
          y: 50,
          scale: 0.95
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power2.out"
        },
        step8Start + 0.4
      );

      // Waitlist button appears
      tl.fromTo(
        refs.waitlistButton,
        {
          opacity: 0,
          y: 30,
          scale: 0.9
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.0,
          ease: "back.out(1.5)"
        },
        step8Start + 0.8
      );
      // Step 9: Remove elements + orbit moves down + toolkit text + mini ovals appear
      const step9Start = step8Start + 2.5;

      // Remove waitlist button, stairs, and CLOUDS
      tl.to(
        refs.waitlistButton,
        {
          opacity: 0,
          duration: 0.4,
          ease: "power2.out"
        },
        step9Start
      );

      tl.to(
        [refs.leftStairsMod6Mobile, refs.rightStairsMod6Mobile],
        {
          opacity: 0,
          duration: 0.4,
          ease: "power2.out"
        },
        step9Start
      );

      // Remove clouds (ADD THIS)
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

      // Orbit moves down more (to about 70% from top)
      tl.to(
        refs.pinkBiggerOrbit,
        {
          y: "35vh", // More downwards than before
          x: 0, // Center horizontally
          scale: 2, // Keep current scale
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

      // Mini ovals appear at center (between text and top)
      tl.set(
        [refs.ovalMini3, refs.ovalMini2, refs.ovalMini1],
        {
          opacity: 0,
          scale: 1,
          willChange: "transform, opacity"
        },
        step9Start + 1.0
      );

      // They appear with slight stagger
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
      // The parent container has flex centering, so y: 0 is the vertical center
      // But mini ovals are positioned below center, so we need to move them up
      tl.to(
        refs.ovalMini1,
        {
          y: "-20vh", // Move UP to reach vertical center (adjust this value based on actual position)
          scale: 1.5,
          duration: 0.8,
          ease: "power2.out"
        },
        step10Start + 0.2
      );

      // Set initial position for oval_1 (matches mini oval's NEW centered position)
      tl.set(
        refs.oval1,
        {
          opacity: 0,
          scale: 0.5, // Match mini oval size (120px / 380px ≈ 0.32)
          y: 0, // At vertical center where mini oval moved to
          willChange: "transform, opacity"
        },
        step10Start + 0
      );

      // Crossfade: mini oval fades out as full oval fades in
      tl.to(
        refs.ovalMini1,
        {
          opacity: 0,
          duration: 0.5,
          ease: "power2.inOut"
        },
        step10Start + 1.0
      );

      tl.to(
        refs.oval1,
        {
          opacity: 1,
          duration: 0.5,
          ease: "power2.inOut"
        },
        step10Start + 1.0
      );

      // Full oval scales up to final size at center
      tl.to(
        refs.oval1,
        {
          scale: 1,
          duration: 1.0,
          ease: "power2.out"
        },
        step10Start + 1.5
      );

      // Step 11: Vertical scroll transition - cards stack behavior (TOP TO BOTTOM)
      const step11Start = step10Start + 4.0;

      // Calculate the scroll container height (from top to text position)
      const scrollContainerHeight = 85; // 85vh (100vh - 15vh where text is)

      // Set oval_2 ABOVE the visible area (above screen top)
      tl.set(
        refs.oval2,
        {
          opacity: 1,
          y: `-${scrollContainerHeight}vh`, // Start above screen
          scale: 0.9
        },
        step11Start
      );

      // oval_1 scrolls DOWN and exits through BOTTOM
      tl.to(
        refs.oval1,
        {
          y: `${scrollContainerHeight}vh`, // Exit through bottom
          scale: 0.9,
          duration: 1.8,
          ease: "power3.inOut"
        },
        step11Start
      );

      // oval_2 scrolls DOWN from top to center
      tl.to(
        refs.oval2,
        {
          y: 0, // Move to center
          scale: 1,
          duration: 1.8,
          ease: "power3.inOut"
        },
        step11Start
      );

      // Fade out oval_1 as it exits bottom
      tl.to(
        refs.oval1,
        {
          opacity: 0,
          duration: 0.6,
          ease: "power2.in"
        },
        step11Start + 1.2
      );

      // Step 12: Continue vertical scroll (TOP TO BOTTOM)
      const step12Start = step11Start + 4.0;

      // Set oval_3 ABOVE the visible area (above screen top)
      tl.set(
        refs.oval3,
        {
          opacity: 1,
          y: `-${scrollContainerHeight}vh`, // Start above screen
          scale: 0.9
        },
        step12Start
      );

      // oval_2 scrolls DOWN and exits through BOTTOM
      tl.to(
        refs.oval2,
        {
          y: `${scrollContainerHeight}vh`, // Exit through bottom
          scale: 0.9,
          duration: 1.8,
          ease: "power3.inOut"
        },
        step12Start
      );

      // oval_3 scrolls DOWN from top to center
      tl.to(
        refs.oval3,
        {
          y: 0, // Move to center
          scale: 1,
          duration: 1.8,
          ease: "power3.inOut"
        },
        step12Start
      );

      // Fade out oval_2 as it exits bottom
      tl.to(
        refs.oval2,
        {
          opacity: 0,
          duration: 0.6,
          ease: "power2.in"
        },
        step12Start + 1.2
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

      // Step 13: oval_3 stays visible (final card)
    } else {
      // Desktop: Both stairs come from bottom corners
      tl.set(
        refs.leftStairsMini,
        {
          opacity: 0,
          y: 100,
          willChange: "transform, opacity"
        },
        stairsAnimateStart
      );

      tl.set(
        refs.rightStairsMini,
        {
          opacity: 0,
          y: 100,
          willChange: "transform, opacity"
        },
        stairsAnimateStart
      );

      // Left stairs animate up
      tl.to(
        refs.leftStairsMini,
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power2.out"
        },
        stairsAnimateStart
      );

      // Right stairs animate up (slightly staggered)
      tl.to(
        refs.rightStairsMini,
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power2.out"
        },
        stairsAnimateStart + 0.2
      );

      // ===== DESKTOP: OPTIMIZED SMOOTH ANIMATION =====

      // Step 1: Initial setup - orbit moves down, stairs MORPH from mini to full
      tl.to(
        refs.pinkBiggerOrbit,
        {
          y: `+=${7 * multipliers.orbit}%`,
          duration: 0.2,
          ease: "power2.out"
        },
        nextPhaseStart
      );

      // Set full stairs at same position as mini stairs initially
      tl.set(
        [refs.stairsLeft, refs.stairsRight],
        {
          opacity: 0,
          scale: 0, // Match mini stairs scale
          transformOrigin: "bottom left"
        },
        nextPhaseStart
      );

      tl.set(
        refs.stairsRight,
        {
          transformOrigin: "bottom right"
        },
        nextPhaseStart
      );

      // Mini stairs scale up and morph into full stairs
      tl.to(
        [refs.leftStairsMini, refs.rightStairsMini],
        {
          scale: 1,
          duration: 0.6,
          ease: "power2.out"
        },
        nextPhaseStart
      );

      // Crossfade: mini fades out as full fades in
      tl.to(
        [refs.leftStairsMini, refs.rightStairsMini],
        {
          opacity: 0,
          duration: 0.4,
          ease: "power2.inOut"
        },
        nextPhaseStart + 0.2
      );

      tl.to(
        [refs.stairsLeft, refs.stairsRight],
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: "power2.inOut"
        },
        nextPhaseStart + 0.2
      );

      tl.set(
        refs.text4,
        {
          opacity: 1,
          willChange: "opacity"
        },
        nextPhaseStart
      );

      // Step 2: Show outer circle at center, replace stairs with stairs_1
      // Step 2: Show outer circle at center, stairs MORPH from full to stairs_1
      const step2Start = nextPhaseStart + 2.0;

      // Combined circle container appears at orbit center
      tl.set(
        refs.combinedCircleContainer,
        {
          opacity: 1,
          willChange: "transform, opacity"
        },
        step2Start
      );

      // Outer circle appears - smaller initial scale
      if (refs.combinedCircle?.outer) {
        tl.set(
          refs.combinedCircle.outer,
          {
            opacity: 0,
            scale: 0.15,
            willChange: "transform, opacity"
          },
          step2Start
        );

        tl.to(
          refs.combinedCircle.outer,
          {
            opacity: 1,
            duration: 0.4,
            ease: "power1.out"
          },
          step2Start + 0.1
        );
      }

      // Set stairs_1 at same position/scale as current full stairs
      tl.set(
        [refs.leftStairs1, refs.rightStairs1],
        {
          opacity: 0,
          // scale: 1,
          y: 0
        },
        step2Start
      );

      // Current stairs morph by moving slightly
      tl.to(
        [refs.stairsLeft, refs.stairsRight],
        {
          y: 10,
          duration: 0.4,
          ease: "power2.inOut"
        },
        step2Start
      );

      // Crossfade to stairs_1
      tl.to(
        [refs.stairsLeft, refs.stairsRight],
        {
          opacity: 0,
          duration: 0.3,
          ease: "power2.inOut"
        },
        step2Start + 0.2
      );

      tl.to(
        [refs.leftStairs1, refs.rightStairs1],
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out"
        },
        step2Start + 0.2
      );

      // Step 3: Move orbit and stairs down, scale outer circle up (becomes combined)
      const step3Start = step2Start + 2.0;

      // Orbit moves down (with screen multiplier)
      tl.to(
        refs.pinkBiggerOrbit,
        {
          y: `+=${8 * multipliers.orbit}%`,
          duration: 1.0,
          ease: "power1.inOut"
        },
        step3Start
      );

      // Stairs move down (with screen multiplier)
      tl.to(
        [refs.leftStairs1, refs.rightStairs1],
        {
          y: `+=${12 * multipliers.stairs}vh`,
          duration: 1.0,
          ease: "power1.inOut"
        },
        step3Start
      );

      // Outer circle scales up to intermediate size (0.4 scale)
      if (refs.combinedCircle?.outer) {
        tl.to(
          refs.combinedCircle.outer,
          {
            scale: 0.4, // Intermediate scale - outer stays smaller
            duration: 1.0,
            ease: "power1.inOut"
          },
          step3Start
        );
      }

      // Inner circle reveals at bigger scale (95% of outer - MUCH BIGGER)
      if (refs.combinedCircle?.inner) {
        tl.set(
          refs.combinedCircle.inner,
          {
            opacity: 0,
            scale: 0.38, // Increased from 0.38 to 0.50 (about 125% bigger)
            willChange: "transform, opacity"
          },
          step3Start
        );

        tl.to(
          refs.combinedCircle.inner,
          {
            opacity: 1,
            scale: 0.38, // Keep proportional to outer
            duration: 0.8,
            ease: "power1.out"
          },
          step3Start + 0.3
        );
      }

      // Step 4: Zoom orbit and circle from center, stairs MORPH from stairs_1 to stairs_2
      const step4Start = step3Start + 2.0;

      // Orbit scales up from center
      tl.to(
        refs.pinkBiggerOrbit,
        {
          scale: "+=0.4",
          duration: 1.2,
          ease: "power1.inOut"
        },
        step4Start
      );

      // Combined circle outer scales up to final size
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

      // Inner circle scales proportionally
      if (refs.combinedCircle?.inner) {
        tl.to(
          refs.combinedCircle.inner,
          {
            scale: 0.7,
            duration: 1.2,
            ease: "power1.inOut"
          },
          step4Start
        );
      }

      // Set stairs_2 at same position as stairs_1
      tl.set(
        [refs.leftStairs2, refs.rightStairs2],
        {
          opacity: 0,
          y: `+=${12 * multipliers.stairs}vh`, // Match current stairs_1 position
          scale: 1
        },
        step4Start
      );

      // Stairs_1 move slightly and morph
      tl.to(
        [refs.leftStairs1, refs.rightStairs1],
        {
          y: `+=${10 * multipliers.stairs}vh`,
          duration: 0.4,
          ease: "power2.inOut"
        },
        step4Start
      );

      // Crossfade to stairs_2
      tl.to(
        [refs.leftStairs1, refs.rightStairs1],
        {
          opacity: 0,
          duration: 0.3,
          ease: "power2.inOut"
        },
        step4Start + 0.2
      );

      tl.to(
        [refs.leftStairs2, refs.rightStairs2],
        {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out"
        },
        step4Start + 0.2
      );

      tl.to(
        [refs.text4, refs.text3],
        {
          opacity: 0,
          duration: 0.3,
          ease: "power1.out"
        },
        step4Start
      );

      // Add this code after the stairs_2 appear section in desktop (after step4Start)

      // Step 5: Waitlist button appears
      const step5Start = step4Start + 2.0;

      // Waitlist button appears
      tl.fromTo(
        refs.waitlistButton,
        {
          opacity: 0,
          y: 30,
          scale: 0.9
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.0,
          ease: "back.out(1.5)"
        },
        step5Start
      );

      // Step 6: Remove everything EXCEPT orbit, orbit moves down smoothly
      const step6Start = step5Start + 2.5;

      // Remove waitlist button, stairs, texts, combined circle, clouds (NOT orbit)
      tl.to(
        refs.waitlistButton,
        {
          opacity: 0,
          duration: 0.4,
          ease: "power2.out"
        },
        step6Start
      );

      tl.to(
        [refs.leftStairs2, refs.rightStairs2],
        {
          opacity: 0,
          duration: 0.4,
          ease: "power2.out"
        },
        step6Start
      );

      tl.to(
        [refs.text3, refs.text4],
        {
          opacity: 0,
          duration: 0.4,
          ease: "power2.out"
        },
        step6Start
      );

      // Remove clouds
      tl.to(
        [refs.rightCloud, refs.leftCloud],
        {
          opacity: 0,
          duration: 0.4,
          ease: "power2.out"
        },
        step6Start
      );

      // Hide combined circle
      tl.to(
        refs.combinedCircleContainer,
        {
          opacity: 0,
          duration: 0.4,
          ease: "power2.out"
        },
        step6Start
      );

      // Pink orbit moves down SMOOTHLY from its current position (stays centered)
      tl.to(
        refs.pinkBiggerOrbit,
        {
          // y: "+=80vh", // Move down by 80vh from CURRENT position (relative movement)
          // x stays unchanged to keep it centered
          top: "90%",
          duration: 1.5,
          ease: "power2.inOut"
        },
        step6Start // Starts at same time as removals
      );

      // Step 7: "the evolve toolkit" text appears AFTER orbit settles
      const step7Start = step6Start + 1.8;

      tl.set(
        refs.text8,
        {
          opacity: 0,
          willChange: "opacity"
        },
        step7Start
      );

      tl.to(
        refs.text8,
        {
          opacity: 1,
          duration: 0.6,
          ease: "power2.out"
        },
        step7Start + 0.2
      );

      // Step 8: Mini ovals appear AFTER text
      const step8Start = step7Start + 1.0;

      // Set initial state for mini ovals
      tl.set(
        [refs.ovalMini3, refs.ovalMini2, refs.ovalMini1],
        {
          opacity: 0,
          scale: 1, // Start at full mini size
          willChange: "transform, opacity"
        },
        step8Start
      );

      // They appear with slight stagger
      tl.to(
        refs.ovalMini3,
        {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out"
        },
        step8Start + 0.2
      );

      tl.to(
        refs.ovalMini2,
        {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out"
        },
        step8Start + 0.4
      );

      tl.to(
        refs.ovalMini1,
        {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out"
        },
        step8Start + 0.6
      );

      // Step 9: Mini ovals SCALE UP and transform into full ovals
      const step9Start = step8Start + 2.0;

      // Set initial state for full ovals (hidden, at same position)
      tl.set(
        [refs.oval1, refs.oval2, refs.oval3],
        {
          opacity: 0,
          scale: 1, // Will be at full size when visible
          willChange: "transform, opacity"
        },
        step9Start
      );

      // Mini ovals scale up FIRST
      tl.to(
        [refs.ovalMini1, refs.ovalMini2, refs.ovalMini3],
        {
          scale: 1.35, // Scale up mini ovals (280px * 1.35 ≈ 380px)
          duration: 0.8,
          ease: "power2.inOut"
        },
        step9Start
      );

      // During the scale-up, crossfade from mini to full
      tl.to(
        [refs.ovalMini1, refs.ovalMini2, refs.ovalMini3],
        {
          opacity: 0,
          duration: 0.6,
          ease: "power2.inOut"
        },
        step9Start + 0.4 // Fade starts halfway through scale
      );

      tl.to(
        [refs.oval1, refs.oval2, refs.oval3],
        {
          opacity: 1,
          duration: 0.6,
          ease: "power2.inOut"
        },
        step9Start + 0.4 // Fade in at same time
      );

      // Clear will-change at the end
      tl.set(
        [refs.oval1, refs.oval2, refs.oval3],
        { willChange: "auto" },
        step9Start + 1.5
      );

      // Clear will-change at the end
      tl.set(
        [refs.oval1, refs.oval2, refs.oval3],
        { willChange: "auto" },
        step8Start + 2.0
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
        step9Start + 1.5
      );

      // Add floating pulse effect to all three ovals
      const floatingStart = step9Start + 1.5;

      // Oval 1 - slightly slower, larger movement
      gsap.to(refs.oval1, {
        y: "-=15",
        duration: 2.5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 0
      });

      // Oval 2 - medium speed
      gsap.to(refs.oval2, {
        y: "-=15",
        duration: 2.5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 0
      });

      // Oval 3 - faster, smaller movement
      gsap.to(refs.oval3, {
        y: "-=15",
        duration: 2.5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 0
      });
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
      // Desktop: More downward, closer together, 95% visible
      tl.to(
        refs.leftElement,
        {
          y: "15vh", // More downward movement
          left: "-2.5%", // Closer, show 95% inside screen
          scale: 1.2, // Bigger for desktop
          duration: 1.2,
          ease: "power2.in"
        },
        // stopAnimationEnd
        newTextStart
      );

      tl.to(
        refs.rightElement,
        {
          y: "15vh", // More downward movement
          right: "-2.5%", // Closer, show 95% inside screen
          scale: 1.2, // Bigger for desktop
          duration: 1.2,
          ease: "power2.in"
        },
        // stopAnimationEnd
        newTextStart
      );
    }
    const orbitToCenterStart = stopAnimationEnd + 1.2;
    tl.to(
      refs.biggerOrbit,
      {
        y: isMobile ? -250 : -200, // Move to center
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

// Combined Circular Component
const CombinedCircle = React.forwardRef(({ isMobile }, ref) => {
  const outerRef = useRef(null);
  const innerRef = useRef(null);

  React.useImperativeHandle(ref, () => ({
    outer: outerRef.current,
    inner: innerRef.current
  }));

  return (
    <div className="relative w-full h-full">
      {/* Outer circle - will rotate */}
      <img
        ref={outerRef}
        src={curvey_circle_without_inner_part}
        alt="outer circle"
        className="absolute inset-0 w-full h-full"
        style={{
          transformOrigin: "center center"
        }}
      />
      {/* Inner part - will rotate independently */}
      <img
        ref={innerRef}
        src={curvey_circle_inner_part}
        alt="inner circle"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "70%",
          height: "70%",
          transformOrigin: "center center",
          opacity: 0 // Start hidden
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
        "https://discord.com/channels/@me/1347086283985649749/1438414139365265479",
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
        join the waitlist
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
  const leftStairsMiniRef = useRef(null); // ADD THIS
  const rightStairsMiniRef = useRef(null); // ADD THIS
  const stairsMiniMobileRef = useRef(null); // ADD THIS
  const stairsModMobileRef = useRef(null); // ADD THIS
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
  const leftStairs1Ref = useRef(null);
  const rightStairs1Ref = useRef(null);
  const leftStairs2Ref = useRef(null);
  const rightStairs2Ref = useRef(null);

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
    text: textRef.current,
    text2: text2Ref.current, // Expose new text ref
    text3: text3Ref.current, // ADD THIS
    leftStairsMini: leftStairsMiniRef.current, // ADD THIS
    rightStairsMini: rightStairsMiniRef.current, // ADD THIS
    stairsMiniMobile: stairsMiniMobileRef.current, // ADD THIS
    stairsModMobile: stairsModMobileRef.current, // ADD THIS
    objectsContainer: objectsContainerRef.current,
    object1: object1Ref.current,
    object2: object2Ref.current,
    object3: object3Ref.current,
    ellipse: ellipseRef.current,
    biggerOrbit: biggerOrbitRef.current,
    pinkBiggerOrbit: pinkBiggerOrbitRef.current, // ADD THIS
    pinkOrbitInner: pinkOrbitInnerRef.current, // ADD THIS
    stairsLeft: stairsLeftRef.current, // ADD THIS
    stairsRight: stairsRightRef.current, // ADD THIS
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
    oval3: oval3Ref.current, // ADD THIS
    leftStairs1: leftStairs1Ref.current,
    rightStairs1: rightStairs1Ref.current,
    leftStairs2: leftStairs2Ref.current,
    rightStairs2: rightStairs2Ref.current
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

      {/* BIGGER ORBIT - Behind floor, starts at 20% scale, half visible */}
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
      />

      {/* PINK BIGGER ORBIT - Wrapper for position */}
      <div
        ref={pinkBiggerOrbitRef}
        className="absolute left-1/2 -translate-x-1/2 z-[9] pointer-events-none"
        style={{
          bottom: isMobile ? "-2vh" : "-60vh",
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
          }}
        />
        {/* Combined Circle - appears at center of PINK ORBIT */}
        <div
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

      {/* TEXT */}
      <div
        ref={textRef}
        className="absolute left-1/2 -translate-x-1/2 z-[20] text-center font-extrabold"
        style={{
          top: isMobile ? "24%" : "26%",
          fontSize: isMobile ? "2rem" : "3rem",
          // fontSize: isMobile
          //   ? "clamp(1.1rem, 4.2vw, 2.2rem)"
          //   : "clamp(1.25rem, 2.6vw, 3rem)",
          lineHeight: "1.2",
          maxWidth: isMobile ? "100%" : "80%",
          width: isMobile ? "92vw" : "80%",
          opacity: 0,
          color: "rgb(0, 0, 0)"
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
            </div>
            <div>
              <span data-text="first" style={{ color: "rgb(0, 0, 0)" }}>
                find{" "}
              </span>
              <span data-text="first" style={{ color: "rgb(0, 0, 0)" }}>
                mentors,
              </span>
            </div>
            <div>
              <span data-text="first" style={{ color: "rgb(0, 0, 0)" }}>
                misfits,{" "}
              </span>
              <span data-text="last" style={{ color: "rgb(0, 0, 0)" }}>
                and
              </span>
            </div>
            <div>
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
        className="absolute left-1/2 -translate-x-1/2 z-[20] text-center font-extrabold"
        style={{
          top: isMobile ? "24%" : "26%",
          fontSize: isMobile ? "2rem" : "3rem",
          // fontSize: isMobile
          //   ? "clamp(1.1rem, 4.2vw, 2.2rem)"
          //   : "clamp(1.25rem, 2.6vw, 3rem)",
          lineHeight: isMobile ? "36px" : "60px",
          maxWidth: isMobile ? "100%" : "80%",
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
                make
              </span>
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
        className="absolute left-1/2 -translate-x-1/2 z-[20] text-center font-extrabold"
        style={{
          top: isMobile ? "30%" : "55%",
          fontSize: isMobile ? "2rem" : "3rem",
          // fontSize: isMobile
          // ? "clamp(1.25rem, 4.5vw, 2rem)"
          // : "clamp(1.25rem, 2.6vw, 3rem)",
          lineHeight: isMobile ? "36px" : "84px",
          color: "rgb(0, 0, 0)",
          opacity: 0,
          width: isMobile ? "75vw" : "60%",
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
          className="absolute left-1/2 -translate-x-1/2 z-[20] text-center font-extrabold"
          style={{
            top: "70%",
            fontSize: "3.5rem",
            // fontSize: "clamp(1.75rem, 3.6vw, 3.5rem)",
            lineHeight: "54px",
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
          <img
            ref={leftStairsMiniRef}
            src={left_stairs_mini}
            alt="left stairs mini"
            className="absolute z-[10] pointer-events-none"
            style={{
              bottom: 0,
              left: 0,
              width: "auto",
              height: "auto",
              transform: "scale(0.6)",
              transformOrigin: "bottom left", // for left stairs
              // transformOrigin: "bottom right", // for right stairs
              // maxHeight: "50vh",
              // maxWidth: "40%",
              // objectFit: "contain",
              opacity: 0
            }}
          />
          <img
            ref={rightStairsMiniRef}
            src={right_stairs_mini}
            alt="right stairs mini"
            className="absolute z-[10] pointer-events-none"
            style={{
              bottom: 0,
              right: 0,
              width: "auto",
              height: "auto",
              transform: "scale(0.6)",
              // transformOrigin: "bottom left", // for left stairs
              transformOrigin: "bottom right", // for right stairs
              // maxHeight: "50vh",
              // maxWidth: "40%",
              // objectFit: "contain",
              opacity: 0
            }}
          />
          {/* Full stairs - replace mini stairs */}
          <img
            ref={stairsLeftRef}
            src={stairs_left}
            alt="left stairs full"
            className="absolute z-[10] pointer-events-none"
            style={{
              bottom: 0,
              left: 0,
              width: "40%",
              height: "auto",
              opacity: 0
            }}
          />
          <img
            ref={stairsRightRef}
            src={stairs_right}
            alt="right stairs full"
            className="absolute z-[10] pointer-events-none"
            style={{
              bottom: 0,
              right: 0,
              width: "40%",
              height: "auto",
              opacity: 0
            }}
          />
          <img
            ref={leftStairs1Ref}
            src={stairs_left_1}
            alt="left stairs 1"
            className="absolute z-[10] pointer-events-none"
            style={{
              bottom: 0,
              left: 0,
              width: "40%",
              height: "auto",
              opacity: 0
            }}
          />
          <img
            ref={rightStairs1Ref}
            src={stairs_right_1}
            alt="right stairs 1"
            className="absolute z-[10] pointer-events-none"
            style={{
              bottom: 0,
              right: 0,
              width: "40%",
              height: "auto",
              opacity: 0
            }}
          />

          {/* Stairs 2 - NEW */}
          <img
            ref={leftStairs2Ref}
            src={stairs_left_2}
            alt="left stairs 2"
            className="absolute z-[10] pointer-events-none"
            style={{
              bottom: 0,
              left: 0,
              width: "40%",
              height: "auto",
              opacity: 0
            }}
          />
          <img
            ref={rightStairs2Ref}
            src={stairs_right_2}
            alt="right stairs 2"
            className="absolute z-[10] pointer-events-none"
            style={{
              bottom: 0,
              right: 0,
              width: "40%",
              height: "auto",
              opacity: 0
            }}
          />
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
            className="absolute left-1/2 -translate-x-1/2 z-[20] text-center leading-tight font-extrabold"
            style={{
              bottom: "10%",
              fontSize: "6rem",
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
        </>
      )}

      {/* STAIRS FOR MOBILE */}
      {/* STAIRS FOR MOBILE */}
      {isMobile && (
        <>
          {/* Step 1: Initial mini stairs */}
          <img
            ref={stairsMiniMobileRef}
            src={stairs_mini_mobile}
            alt="stairs mini mobile"
            className="absolute z-[10] pointer-events-none"
            style={{
              bottom: 0,
              left: 0,
              width: "auto",
              height: "auto",
              // maxHeight: "40vh",
              opacity: 0
            }}
          />
          {/* Step 2: More stairs appearing */}
          <img
            ref={stairsModMobileRef}
            src={stairs_mod_mobile}
            alt="stairs mod mobile"
            className="absolute z-[10] pointer-events-none"
            style={{
              bottom: 0,
              left: 0,
              width: "auto",
              height: "auto",
              // maxHeight: "40vh",
              opacity: 0
            }}
          />
          {/* Step 3: Even more stairs */}
          <img
            ref={stairsMod1MobileRef}
            src={stairs_mod1_mobile}
            alt="stairs mod1 mobile"
            className="absolute z-[10] pointer-events-none"
            style={{
              bottom: 0,
              left: 0,
              width: "auto",
              height: "auto",
              // maxHeight: "40vh",
              opacity: 0
            }}
          />
          {/* Step 4: Final stairs on right */}
          <img
            ref={stairsMod2MobileRef}
            src={stairs_mod2_mobile}
            alt="stairs mod2 mobile"
            className="absolute z-[10] pointer-events-none"
            style={{
              bottom: 0,
              right: 0,
              width: "auto",
              height: "auto",
              // maxHeight: "40vh",
              opacity: 0
            }}
          />
          {/* Step 5: Left stairs mod3 */}
          <img
            ref={leftStairsMod3MobileRef}
            src={left_stairs_mod3_mobile}
            alt="left stairs mod3 mobile"
            className="absolute z-[10] pointer-events-none"
            style={{
              bottom: 0,
              left: 0,
              width: "auto",
              height: "auto",
              maxHeight: "40vh",
              opacity: 0
            }}
          />
          {/* Step 5: Right stairs mod3 */}
          <img
            ref={rightStairsMod3MobileRef}
            src={right_stairs_mod3_mobile}
            alt="right stairs mod3 mobile"
            className="absolute z-[10] pointer-events-none"
            style={{
              bottom: 0,
              right: 0,
              width: "auto",
              height: "auto",
              maxHeight: "40vh",
              opacity: 0
            }}
          />
          {/* Text 5: "real design," */}
          <div
            ref={text5Ref}
            className="absolute left-1/2 -translate-x-1/2 z-[20] text-center font-extrabold"
            style={{
              top: "42%",
              width: "75vw",
              fontSize: "2.5rem",
              // fontSize: "clamp(1.6rem, 5vw, 2.5rem)",
              lineHeight: "32px",
              color: "rgb(0, 0, 0)",
              opacity: 0
            }}
          >
            real design,
          </div>
          {/* Text 6: "real portfolio," */}
          <div
            ref={text6Ref}
            className="absolute left-1/2 -translate-x-1/2 z-[20] text-center font-extrabold"
            style={{
              top: "42%",
              width: "75vw",
              fontSize: "2.5rem",
              // fontSize: "clamp(1.6rem, 5vw, 2.5rem)",
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
            className="absolute left-1/2 -translate-x-1/2 z-[20] leading-1 text-center font-extrabold"
            style={{
              top: "42%",
              width: "75vw",
              fontSize: "2.5rem",
              // fontSize: "clamp(1.6rem, 5vw, 2.5rem)",
              lineHeight: "40px",
              color: "rgb(0, 0, 0)",
              opacity: 0
            }}
          >
            real career beginnings...
          </div>
          {/* Combined Circle - appears at center */}
          {/* <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[15] pointer-events-none"
            style={{
              width: "200px",
              height: "200px"
              // opacity: 0
            }}
          >
            <CombinedCircle ref={combinedCircleRef} isMobile={isMobile} />
          </div> */}
          {/* Stairs mod4 */}
          <img
            ref={leftStairsMod4MobileRef}
            src={left_stairs_mod4_mobile}
            alt="left stairs mod4 mobile"
            className="absolute z-[10] pointer-events-none"
            style={{
              bottom: 0,
              left: 0,
              width: "auto",
              height: "auto",
              maxHeight: "40vh",
              opacity: 0
            }}
          />
          <img
            ref={rightStairsMod4MobileRef}
            src={right_stairs_mod4_mobile}
            alt="right stairs mod4 mobile"
            className="absolute z-[10] pointer-events-none"
            style={{
              bottom: 0,
              right: 0,
              width: "auto",
              height: "auto",
              maxHeight: "40vh",
              opacity: 0
            }}
          />
          {/* Stairs mod5 */}
          <img
            ref={leftStairsMod5MobileRef}
            src={left_stairs_mod5_mobile}
            alt="left stairs mod5 mobile"
            className="absolute z-[10] pointer-events-none"
            style={{
              bottom: 0,
              left: 0,
              width: "auto",
              height: "auto",
              maxHeight: "40vh",
              opacity: 0
            }}
          />
          <img
            ref={rightStairsMod5MobileRef}
            src={right_stairs_mod5_mobile}
            alt="right stairs mod5 mobile"
            className="absolute z-[10] pointer-events-none"
            style={{
              bottom: 0,
              right: 0,
              width: "auto",
              height: "auto",
              maxHeight: "40vh",
              opacity: 0
            }}
          />
          {/* Stairs mod6 - NEW */}
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
              maxHeight: "40vh",
              opacity: 0
            }}
          />
          <img
            ref={rightStairsMod6MobileRef}
            src={right_stairs_mod6_mobile}
            alt="right stairs mod6 mobile"
            className="absolute z-[10] pointer-events-none"
            style={{
              bottom: 0,
              right: 0,
              width: "auto",
              height: "auto",
              maxHeight: "40vh",
              opacity: 0
            }}
          />
          {/* Waitlist Button - Works for BOTH mobile and desktop */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              bottom: isMobile ? "12%" : "10%",
              zIndex: 9999,
              pointerEvents: "auto"
            }}
          >
            <WaitlistButton
              ref={waitlistButtonRef}
              style={{
                opacity: 0,
                width: isMobile ? "75vw" : "auto",
                padding: isMobile ? "16px 20px" : "20px 40px",
                // fontSize: isMobile ? "24px" : "28px"
                fontSize: isMobile ? "1.5rem" : "1.75rem"
              }}
              onClick={() => console.log("Waitlist button clicked!")}
            />
          </div>
          <div
            ref={text8Ref}
            className="absolute left-1/2 -translate-x-1/2 z-[20] text-center leading-tight font-extrabold"
            style={{
              bottom: "10%",
              width: "75vw",
              // fontSize: "40px",
              fontSize: "2.5rem",
              lineHeight: "36px",
              color: "rgb(0, 0, 0)",
              opacity: 0
            }}
          >
            the evolve toolkit
          </div>

          {/* Mini Ovals Container - centered in space above text */}
          <div
            className="absolute left-1/2 -translate-x-1/2 z-[15]"
            style={{
              bottom: "15%", // Start from text position
              top: 0, // Extend to top
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              alignItems: "center",
              justifyContent: "center", // Center vertically in available space
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
      <div
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
      </div>
    </section>
  );
});

Scene1_1.displayName = "Scene1_1";
export default Scene1_1;
