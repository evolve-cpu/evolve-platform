export const SCENE1_1_STEP_LABELS = [
  "s1_1_step0_intro",
  // "s1_1_step1_text0",
  "s1_1_step3_textFullElementsDown",
  "s1_1_step4_text2ToStop",
  "s1_1_step5_eyeElementsVisible",
  "s1_1_step6_withEvolveText",
  "s1_1_step7_threeTextsComplete", // Desktop - keeps working
  "s1_1_step7_realDesignVisible", // Mobile only
  "s1_1_step8_realPortfolioVisible", // Mobile only
  "s1_1_step9_realCareerVisible", // Mobile only
  "s1_1_step8_ctaVisible" // Final step - Timeline ends here
];

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
  pink_bigger_orbit,
  pink_bigger_orbit_mobile,
  left_stairs_mini,
  right_stairs_mini,
  stairs_mini_mobile,
  stairs_mod_mobile,
  stairs_left,
  stairs_right,
  stairs_mod1_mobile,
  stairs_mod2_mobile,
  left_stairs_mod3_mobile,
  right_stairs_mod3_mobile,
  curvey_circle_inner_part,
  curvey_circle_inner_logo_part,
  curvey_circle_without_inner_part,
  left_stairs_mod4_mobile,
  right_stairs_mod4_mobile,
  left_stairs_mod5_mobile,
  right_stairs_mod5_mobile,
  left_stairs_mod6_mobile,
  right_stairs_mod6_mobile,
  oval_mini_1,
  oval_mini_2,
  oval_mini_3,
  oval_1,
  oval_2,
  oval_3,
  stairs_left_1,
  stairs_right_1,
  stairs_left_2,
  stairs_right_2,
  stairs_left_new,
  stairs_right_new,
  stairs1_mobile,
  stairs2_mobile,
  stairs4_mobile,
  stairsfull_right_mobile,
  join_us_button,
  join_us_button_hover,
  oval_3_1
} from "../../assets/images/Home";

export const setCompletedState = (refs, isMobile) => {
  if (!refs) return;

  gsap.set(refs.bg, {
    opacity: 1
  });

  gsap.set([refs.rightCloud, refs.leftCloud], {
    opacity: 1
  });

  gsap.set(refs.floor, {
    opacity: 1
  });

  gsap.set([refs.leftElement, refs.rightElement], {
    opacity: 1,
    scale: 1
  });

  // gsap.set([refs.text0, refs.text], {
  //   opacity: 1
  // });
  gsap.set([refs.text], {
    opacity: 1
  });

  // if (refs.text0) {
  //   const spans0 = Array.from(refs.text0.querySelectorAll("span[data-text0]"));
  //   gsap.set(spans0, {
  //     opacity: 1,
  //     color: "rgb(0, 0, 0)"
  //   });
  // }

  if (refs.text) {
    const spans = Array.from(refs.text.querySelectorAll("span[data-text]"));
    gsap.set(spans, {
      opacity: 1,
      color: "rgb(0, 0, 0)"
    });
  }

  gsap.set(refs.ellipse, {
    opacity: 1,
    scale: 1,
    y: 0
  });

  gsap.set(refs.biggerOrbit, {
    opacity: 0.3,
    scale: isMobile ? 2.3 : 1
  });

  gsap.set([refs.object1, refs.object2, refs.object3], {
    opacity: 0
  });

  gsap.set(refs.objectsContainer, {
    opacity: 0
  });

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
      pointerEvents: "none"
    }
  );

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

const getScreenMultipliers = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  if (
    (width >= 700 && width <= 1368 && height >= 900 && height <= 1300) ||
    (height >= 700 && height <= 1180 && width >= 900 && width <= 1400)
  ) {
    return { orbit: 1.345, stairs: 0.35 };
  }

  if (width <= 1440) {
    return { orbit: 1, stairs: 0.9 };
  } else if (width <= 1920 && height <= 1200) {
    return { orbit: 0.7, stairs: 0.85 };
  } else {
    return { orbit: 0.5, stairs: 0.7 };
  }
};

// const getElementSlideMultipliers = () => {
//   const width = window.innerWidth;
//   const height = window.innerHeight;

//   if (
//     (width >= 700 && width <= 1368 && height >= 900 && height <= 1300) ||
//     (height >= 700 && height <= 1180 && width >= 900 && width <= 1400)
//   ) {
//     return { downwardY: 0.7 };
//   }

//   if (width <= 1440) {
//     return { downwardY: 1.2 };
//   } else if (width <= 1680 && height <= 1050) {
//     return { downwardY: 1 };
//   } else if (width <= 1920 && height <= 1200) {
//     return { downwardY: -0.5 };
//   } else if (width <= 2560) {
//     return { downwardY: 0.5 };
//   } else {
//     return { downwardY: 0.4 };
//   }
// };

const getElementSlideMultipliers = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  if (
    (width >= 700 && width <= 1368 && height >= 900 && height <= 1300) ||
    (height >= 700 && height <= 1180 && width >= 900 && width <= 1400)
  ) {
    return { downwardY: 0.7 };
  }

  if (width <= 1440) {
    return { downwardY: 1.2 };
  } else if (width <= 1680 && height <= 1050) {
    return { downwardY: 1 };
    // ✅ ADD THIS BLOCK — catches 1727x995 before the 1920 rule
  } else if (width <= 1730 && height <= 1000) {
    return { downwardY: 1.4 }; // 👈 tweak this value to taste
  } else if (width <= 1920 && height <= 1200) {
    return { downwardY: -0.5 };
  } else if (width <= 2560) {
    return { downwardY: 0.5 };
  } else {
    return { downwardY: 0.4 };
  }
};

const getOrbitVerticalMultipliers = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  if (
    (width >= 700 && width <= 1368 && height >= 900 && height <= 1300) ||
    (height >= 700 && height <= 1180 && width >= 900 && width <= 1400)
  ) {
    return { upward: 1.4, downward: 0.9 };
  }

  if (width <= 1368) {
    return { upward: 0.7, downward: 1.3 };
  }

  if (width <= 1440) {
    return { upward: 1.2, downward: 0.7 };
  }

  if (width <= 1680 && height <= 1050) {
    return { upward: 0.9, downward: 1.1 };
  }

  if (width <= 1920 && height <= 1200) {
    return { upward: 1.1, downward: 1.0 };
  }

  if (width <= 2560) {
    return { upward: 1.6, downward: 0.6 };
  }

  return { upward: 1.8, downward: 0.5 };
};

const isTabletLandscape = (() => {
  const w = window.innerWidth;
  const h = window.innerHeight;

  return w >= 900 && w <= 1400 && h >= 600 && h <= 1100;
})();

export const useScene1_1Timeline = (refs, isMobile) => {
  const tl = gsap.timeline();

  const multipliers = getScreenMultipliers();
  const elementMultipliers = getElementSlideMultipliers();
  const orbitVerticalMultipliers = getOrbitVerticalMultipliers();

  const objectSize = isMobile ? 44 : 70;
  const mobileObjGap = isMobile ? 8 : 24;

  tl.set(refs.rightCloud, {
    opacity: 1,
    y: 0,
    willChange: "transform, opacity"
  })
    .set(refs.leftCloud, {
      opacity: 1,
      y: 0,
      willChange: "transform, opacity"
    })
    .set(refs.floor, { opacity: 1, y: 0, willChange: "transform, opacity" })
    .set(refs.leftElement, {
      opacity: 1,
      x: 0,
      willChange: "transform, opacity"
    })
    .set(refs.rightElement, {
      opacity: 1,
      x: 0,
      willChange: "transform, opacity"
    })
    // .set(refs.text0, { opacity: 0, y: 10, willChange: "transform, opacity" })
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

  tl.addLabel("s1_1_step0_intro", 0);

  tl.to(refs.rightCloud, {
    opacity: 1,
    y: 0,
    duration: 0.4,
    ease: "power2.out"
  })
    .to(refs.leftCloud, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" })
    .to(
      refs.floor,
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
      "-=0.6"
    )
    .to(
      refs.leftElement,
      { opacity: 1, x: 0, duration: 0.8, ease: "back.out(1.7)" },
      1.2
    )
    .to(
      refs.rightElement,
      { opacity: 1, x: 0, duration: 0.8, ease: "back.out(1.7)" },
      1.2
    );

  // tl.addLabel("s1_1_step1_text0", 4.2);

  // tl.to(
  //   refs.text0,
  //   { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
  //   1.5
  // );

  // if (refs.text0) {
  //   const spans0 = Array.from(refs.text0.querySelectorAll("span[data-text0]"));

  //   spans0.forEach((span) => {
  //     gsap.set(span, {
  //       opacity: 0.1,
  //       color: "rgb(0, 0, 0)",
  //       willChange: "opacity"
  //     });
  //   });

  //   spans0.forEach((span, idx) => {
  //     tl.to(
  //       span,
  //       {
  //         opacity: 1,
  //         duration: 0.4,
  //         ease: "power2.out"
  //       },
  //       1.5 + idx * 0.35
  //     );
  //   });
  // }

  // tl.to(
  //   refs.text0,
  //   {
  //     opacity: 0,
  //     duration: 0.6,
  //     ease: "power2.out"
  //   },
  //   4.8
  // );

  tl.to(
    refs.text,
    { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
    5.2
  );

  tl.to(refs.biggerOrbit, { opacity: 0.5, duration: 0.4 }, 5.6);

  tl.to(refs.objectsContainer, { opacity: 1, duration: 0.8 }, 7.3);

  const fallDuration = 4.5;
  const fallStart = 6.7;

  if (refs.text) {
    const spans = Array.from(refs.text.querySelectorAll("span[data-text]"));

    spans.forEach((span) => {
      gsap.set(span, {
        opacity: 0.1,
        color: "rgb(0, 0, 0)",
        willChange: "opacity"
      });
    });

    let misfitsIndex = -1;
    spans.forEach((span, idx) => {
      if (span.textContent.includes("misfits")) {
        misfitsIndex = idx;
      }
    });

    const firstPhaseEnd = misfitsIndex >= 0 ? misfitsIndex : 4;

    spans.forEach((span, idx) => {
      if (idx <= firstPhaseEnd) {
        tl.to(
          span,
          {
            opacity: 1,
            duration: 0.4,
            ease: "power2.out"
          },
          4.5 + idx * 0.4
        );
      }
    });

    tl.to(
      refs.text,
      {
        y: -10,
        duration: 0.8,
        ease: "power2.out"
      },
      4.5
    );
  }

  const calculateFallDistance = () => {
    const MOBILE_FALLBACK = 200;
    const DESKTOP_FALLBACK = 350;

    if (!refs.objectsContainer)
      return isMobile ? MOBILE_FALLBACK : DESKTOP_FALLBACK;

    try {
      const objectsRect = refs.objectsContainer.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const ellipseHeight = isMobile ? 300 * 0.4 : 560 * 0.3;
      const ellipseBottom = isMobile
        ? viewportHeight * 0.09
        : viewportHeight * 0.05;

      const ellipseCenter = viewportHeight - ellipseBottom - ellipseHeight / 2;

      const objectsCenterY = isMobile
        ? objectsRect.bottom - objectSize / 2
        : objectsRect.top + objectsRect.height / 2;

      let distance = ellipseCenter - objectsCenterY;

      if (isMobile) {
        distance *= 0.5;
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

  if (isMobile) {
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

  tl.to(refs.ellipse, { opacity: 1, duration: 1 }, 6.0);

  const shrinkStart = fallStart + fallDuration - 1.0;

  tl.addLabel(
    "s1_1_step3_textFullElementsDown",
    shrinkStart + (isMobile ? 2.0 : 1.5) + 1.2
  );

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
        duration: 1.2,
        ease: "power2.in",
        stagger: 0.1
      },
      shrinkStart
    );
  }

  tl.to(
    refs.ellipse,
    {
      scale: 1.08,
      duration: 0.5,
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

  const transitionStart = shrinkStart + (isMobile ? 2.0 : 1.5);

  tl.to(
    refs.ellipse,
    {
      y: 300,
      opacity: 0,
      duration: 1,
      ease: "power2.inOut"
    },
    transitionStart
  );

  tl.to(
    refs.floor,
    {
      y: 300,
      opacity: 0,
      duration: 1,
      ease: "power2.inOut"
    },
    transitionStart
  );

  const orbitBeforeCenterY = isMobile ? -50 : -80;
  const orbitScale = isMobile ? 2 : 1;

  tl.to(
    refs.biggerOrbit,
    {
      scale: orbitScale,
      y: orbitBeforeCenterY,
      opacity: 0.5,
      duration: 1.2,
      ease: "power2.out"
    },
    transitionStart + 1.0
  );

  if (refs.text) {
    const spans = Array.from(refs.text.querySelectorAll("span[data-text]"));

    let misfitsIndex = -1;
    spans.forEach((span, idx) => {
      if (span.textContent.includes("misfits")) {
        misfitsIndex = idx;
      }
    });

    const firstPhaseEnd = misfitsIndex >= 0 ? misfitsIndex : 4;

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

    const textFadeOutStart = transitionStart + 2.5;
    tl.to(
      refs.text,
      {
        opacity: 0,
        duration: 0.3,
        ease: "power2.out"
      },
      textFadeOutStart
    );
  }

  const newTextStart = transitionStart + 3.2;

  if (refs.text2) {
    tl.set(refs.text2, { opacity: 1, y: 0 }, newTextStart);

    const spans2 = Array.from(refs.text2.querySelectorAll("span[data-text2]"));

    spans2.forEach((span) => {
      gsap.set(span, {
        opacity: 0.1,
        color: "rgb(0, 0, 0)",
        willChange: "opacity"
      });
    });

    let stopIndex = -1;
    spans2.forEach((span, idx) => {
      if (span.textContent.includes("stop")) {
        stopIndex = idx;
      }
    });

    const firstPhaseEnd2 = stopIndex >= 0 ? stopIndex : 7;

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

    const stopAnimationEnd = newTextStart + firstPhaseEnd2 * 0.35 + 0.4;
    tl.addLabel("s1_1_step4_text2ToStop", stopAnimationEnd + 0.4);

    tl.set(
      refs.leftElementEye,
      {
        opacity: 0,
        scale: 1,
        x: 0,
        y: 0,
        willChange: "transform, opacity"
      },
      stopAnimationEnd
    );

    tl.set(
      refs.rightElementEye,
      {
        opacity: 0,
        scale: 1,
        x: 0,
        y: 0,
        willChange: "transform, opacity"
      },
      stopAnimationEnd
    );

    if (isMobile) {
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
      const baseDownwardMovement = 25;
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
          y: adjustedY,
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
          y: adjustedY,
          right: "-2.5%",
          scale: 1.2,
          duration: 1.2,
          ease: "power2.in"
        },
        stopAnimationEnd
      );
    }

    const eyesOpenStart = stopAnimationEnd + 1.2;
    tl.addLabel("s1_1_step5_eyeElementsVisible", eyesOpenStart + 1.256789);

    tl.to(
      [refs.leftElementEye, refs.rightElementEye],
      {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out"
      },
      eyesOpenStart
    );

    tl.set(
      refs.pinkBiggerOrbit,
      {
        opacity: 0,
        scale: isMobile ? 2 : 1,
        y: isMobile ? -50 : -80,
        willChange: "transform, opacity"
      },
      eyesOpenStart
    );

    tl.to(
      refs.biggerOrbit,
      {
        opacity: 0,
        duration: 0.8,
        ease: "power2.out"
      },
      eyesOpenStart
    );

    tl.to(
      refs.pinkBiggerOrbit,
      {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out"
      },
      eyesOpenStart
    );

    tl.to(
      refs.pinkOrbitInner,
      {
        opacity: 0.3,
        duration: 0.8,
        ease: "power2.out"
      },
      eyesOpenStart
    );

    const elementsDisappearStart = eyesOpenStart + 1.0;

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

    tl.to(
      refs.text2,
      {
        opacity: 0,
        duration: 0.6,
        ease: "power2.inOut"
      },
      elementsDisappearStart
    );

    const orbitMoveUpStart = elementsDisappearStart + 0.8;

    if (isMobile) {
      tl.to(
        refs.pinkBiggerOrbit,
        {
          x: "-50vw",
          duration: 1.2,
          ease: "power2.out"
        },
        orbitMoveUpStart
      );
    } else {
      tl.to(
        refs.pinkBiggerOrbit,
        {
          y: `${-35 * orbitVerticalMultipliers.upward}%`,
          duration: 1.2,
          ease: "power2.out"
        },
        orbitMoveUpStart
      );
    }

    const text3AppearStart = orbitMoveUpStart + 1.2;
    tl.addLabel("s1_1_step6_withEvolveText", text3AppearStart + 0.5);

    tl.set(
      refs.text3,
      {
        opacity: 1,
        y: 0,
        willChange: "opacity"
      },
      text3AppearStart
    );

    const stairsAnimateStart = text3AppearStart;
    const nextPhaseStart = stairsAnimateStart + 1.5;

    if (isMobile) {
      const mobileStairsStart = text3AppearStart + 0.5;

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

      if (refs.rightStairsMod3Mobile) {
        tl.set(
          refs.rightStairsMod3Mobile,
          {
            clipPath: "inset(90% 0 0 0)",
            WebkitClipPath: "inset(90% 0 0 0)",
            WebkitMaskImage:
              "linear-gradient(to top, black 0%, black 5%, transparent 10%)",
            maskImage:
              "linear-gradient(to top, black 0%, black 5%, transparent 10%)"
          },
          mobileStairsStart
        );
      }

      const stairs20Start = mobileStairsStart + 1.5;

      if (refs.rightStairsMod3Mobile) {
        tl.to(
          refs.rightStairsMod3Mobile,
          {
            clipPath: "inset(80% 0 0 0)",
            WebkitClipPath: "inset(80% 0 0 0)",
            WebkitMaskImage:
              "linear-gradient(to top, black 0%, black 15%, transparent 20%)",
            maskImage:
              "linear-gradient(to top, black 0%, black 15%, transparent 20%)",
            duration: 0.8,
            ease: "power2.out"
          },
          stairs20Start
        );
      }

      const stairs30Start = stairs20Start + 1.5;

      tl.to(
        refs.pinkBiggerOrbit,
        {
          y: "-=15vh",
          duration: 1.2,
          ease: "power2.out"
        },
        stairs30Start
      );

      if (refs.rightStairsMod3Mobile) {
        tl.to(
          refs.rightStairsMod3Mobile,
          {
            clipPath: "inset(70% 0 0 0)",
            WebkitClipPath: "inset(70% 0 0 0)",
            WebkitMaskImage:
              "linear-gradient(to top, black 0%, black 25%, transparent 30%)",
            maskImage:
              "linear-gradient(to top, black 0%, black 25%, transparent 30%)",
            duration: 0.8,
            ease: "power2.out"
          },
          stairs30Start
        );
      }

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
          duration: 1,
          ease: "power2.out"
        },
        stairs30Start + 0.8
      );

      tl.addLabel("s1_1_step7_realDesignVisible", stairs30Start + 1.8);

      const portfolioStart = stairs30Start + 2.0;

      tl.to(
        refs.pinkBiggerOrbit,
        {
          x: "+=10vw",
          duration: 1.2,
          ease: "power2.out"
        },
        portfolioStart
      );

      if (refs.rightStairsMod3Mobile) {
        tl.to(
          refs.rightStairsMod3Mobile,
          {
            clipPath: "inset(60% 0 0 0)",
            WebkitClipPath: "inset(60% 0 0 0)",
            WebkitMaskImage: "linear-gradient(to top, black 75%, black 20%)",
            maskImage: "linear-gradient(to top, black 25%, black 60%)",
            duration: 0.8,
            ease: "power2.out"
          },
          portfolioStart
        );
      }

      tl.to(
        refs.text5,
        {
          opacity: 0,
          duration: 0.9,
          ease: "power2.out"
        },
        portfolioStart
      );

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
          duration: 0.9,
          ease: "power2.out"
        },
        portfolioStart + 0.8
      );

      tl.addLabel("s1_1_step8_realPortfolioVisible", portfolioStart + 1.8);

      const careerStart = portfolioStart + 2.0;

      tl.to(
        refs.pinkBiggerOrbit,
        {
          x: "+=15vw",
          y: "+=10vh",
          duration: 1.2,
          ease: "power2.out"
        },
        careerStart
      );

      tl.to(
        refs.rightStairsMod3Mobile,
        {
          x: "+=12vw",
          left: "auto",
          bottom: "-2%",
          duration: 1.4,
          ease: "power2.inOut"
        },
        careerStart
      );

      if (refs.rightStairsMod3Mobile) {
        tl.to(
          refs.rightStairsMod3Mobile,
          {
            clipPath: "inset(38% 0 0 0)",
            WebkitClipPath: "inset(38% 0 0 0)",
            WebkitMaskImage: "linear-gradient(to top, black 40%, black 63%)",
            maskImage: "linear-gradient(to top, black 40%, black 63%)",
            duration: 0.8,
            ease: "power2.out"
          },
          careerStart
        );
      }

      tl.to(
        refs.text6,
        {
          opacity: 0,
          duration: 0.4,
          ease: "power2.out"
        },
        careerStart
      );

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
          duration: 0.9,
          ease: "power2.out"
        },
        careerStart + 0.8
      );

      tl.addLabel("s1_1_step9_realCareerVisible", careerStart + 1.8);

      const centerCircleStart = careerStart + 2.0;

      tl.to(
        [refs.text3, refs.text7],
        {
          opacity: 0,
          duration: 0.4,
          ease: "power2.out"
        },
        centerCircleStart
      );

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

      tl.to(
        refs.rightStairsMod3Mobile,
        {
          right: "-36%",
          bottom: "-21%",
          clipPath: "inset(0% 0 0 0)",
          WebkitClipPath: "inset(0% 0 0 0)",
          WebkitMaskImage: "none",
          maskImage: "none",
          duration: 1.2,
          ease: "power2.out"
        },
        centerCircleStart
      );

      tl.set(
        refs.leftStairsMod6Mobile,
        {
          opacity: 1,
          left: "-2%",
          right: "auto",
          bottom: "-9%",
          width: "32.5%",
          transform: "scaleX(1) rotate(1.5deg)",
          transform: "scaleX(1)",
          clipPath: "inset(0% 0 0 0)",
          WebkitClipPath: "inset(0% 0 0 0)",
          willChange: "transform"
        },
        centerCircleStart + "1.0"
      );

      tl.set(
        refs.combinedCircleContainer,
        {
          opacity: 1
        },
        centerCircleStart
      );

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
            duration: 0.9,
            ease: "power2.out"
          },
          centerCircleStart + 0.8
        );
      }

      const zoomStart = centerCircleStart + 3.0;

      tl.to(
        refs.pinkBiggerOrbit,
        {
          scale: "+=0.5",
          duration: 1.5,
          ease: "power2.inOut"
        },
        zoomStart
      );

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

      const step8Start = zoomStart + 2.5;

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

      tl.addLabel("s1_1_step8_ctaVisible", step8Start + 1.8);

      // MOBILE: Timeline ends here - no toolkit section
    } else {
      // DESKTOP STARTS HERE

      tl.set(
        [refs.stairsLeft, refs.stairsRight],
        {
          opacity: 1,
          scale: 1,
          y: "40vh"
        },
        stairsAnimateStart
      );

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

      tl.to(
        [refs.stairsLeft, refs.stairsRight],
        {
          y: 0,
          duration: 1.4,
          ease: "power2.out"
        },
        stairsAnimateStart
      );

      tl.to(
        refs.pinkBiggerOrbit,
        {
          y: `+=${6 * multipliers.orbit}%`,
          duration: 1.8,
          ease: "power2.out"
        },
        nextPhaseStart
      );

      tl.to(
        [refs.stairsLeft, refs.stairsRight],
        {
          y: `+=${7 * multipliers.stairs}vh`,
          duration: 1.4,
          ease: "power2.out"
        },
        nextPhaseStart
      );

      tl.set(
        refs.text4,
        {
          opacity: 1,
          willChange: "opacity"
        },
        nextPhaseStart
      );

      tl.addLabel("s1_1_step7_threeTextsComplete", nextPhaseStart + 0.5);

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
              duration: 1.4,
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
            duration: 0.9,
            ease: "power1.out"
          },
          nextPhaseStart + 0.1
        );
      }

      const step2Start = nextPhaseStart + 2.0;
      const step3Start = step2Start + 2.0;

      tl.to(
        refs.pinkBiggerOrbit,
        {
          y: `+=${8 * multipliers.orbit}%`,
          duration: 5.8,
          ease: "power1.inOut"
        },
        step3Start
      );

      tl.to(
        [refs.stairsLeft, refs.stairsRight],
        {
          y: `+=${10 * multipliers.stairs}vh`,
          duration: 3.4,
          ease: "power1.inOut"
        },
        step3Start
      );

      if (refs.combinedCircle?.outer) {
        tl.to(
          refs.combinedCircle.outer,
          {
            scale: 0.4,
            duration: 3.4,
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
            duration: 1.9,
            ease: "power1.out"
          },
          step3Start + 0.3
        );
      }

      const step4Start = step3Start + 2.0;

      tl.to(
        refs.pinkBiggerOrbit,
        {
          scale: "+=0.4",
          duration: 2.8,
          ease: "power1.inOut"
        },
        step4Start
      );

      tl.to(
        [refs.stairsLeft, refs.stairsRight],
        {
          y: `+=${40 * multipliers.stairs}vh`,
          scale: 1.3,
          duration: 2.4,
          ease: "power1.inOut"
        },
        step4Start
      );

      if (refs.combinedCircle?.outer) {
        tl.to(
          refs.combinedCircle.outer,
          {
            scale: 0.8,
            duration: 2.2,
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
            duration: 2.2,
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
            duration: 1.8,
            ease: "power2.in"
          },
          step4Start + 0.6
        );

        tl.to(
          refs.combinedCircle.inner,
          {
            opacity: 1,
            duration: 1.8,
            ease: "power2.inOut"
          },
          step4Start + 0.6
        );
      }

      tl.to(
        [refs.text4, refs.text3],
        {
          opacity: 0,
          duration: 1.8,
          ease: "power1.out"
        },
        step4Start
      );

      if (refs.stairsLeft && refs.stairsRight) {
        const leftImg = refs.stairsLeft.querySelector("img");
        const rightImg = refs.stairsRight.querySelector("img");

        if (leftImg && rightImg) {
          tl.to(
            [leftImg, rightImg],
            {
              maskImage:
                "linear-gradient(to bottom, black 100%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, black 100%, transparent 100%)",
              duration: 1.4,
              ease: "power2.inOut"
            },
            step4Start
          );
        }
      }

      const step5Start = step4Start + 2.0;

      tl.to(
        refs.pinkBiggerOrbit,
        {
          scale: "-=0.15",
          y: `-=${3 * multipliers.orbit}%`,
          duration: 2.8,
          ease: "power2.inOut"
        },
        step5Start
      );

      if (refs.combinedCircle?.outer) {
        tl.to(
          refs.combinedCircle.outer,
          {
            scale: "-=0.1",
            y: `-=${3 * multipliers.orbit}%`,
            duration: 1.8,
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
            y: `-=${3 * multipliers.orbit}%`,
            duration: 1.8,
            ease: "power2.inOut"
          },
          step5Start
        );
      }

      tl.to(
        [refs.stairsLeft, refs.stairsRight],
        {
          scale: "+=0.05",
          y: "-=1vh",
          duration: 2.4,
          ease: "power2.inOut"
        },
        step5Start
      );

      const step6Start = step5Start + 1.2;

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

      tl.addLabel("s1_1_step8_ctaVisible", step6Start + 1.0);

      // DESKTOP: Timeline ends here - no toolkit section
    }

    if (isMobile) {
      tl.to(
        refs.leftElement,
        {
          y: "8vh",
          left: "-5%",
          scale: 1,
          duration: 1.2,
          ease: "power2.in"
        },
        newTextStart
      );

      tl.to(
        refs.rightElement,
        {
          y: "15vh",
          right: "-5%",
          scale: 1.5,
          duration: 1.2,
          ease: "power2.in"
        },
        newTextStart
      );
    } else {
      const baseDownwardMovement = 25;
      const adjustedY = `${
        baseDownwardMovement * elementMultipliers.downwardY
      }vh`;

      tl.to(
        refs.leftElement,
        {
          y: adjustedY,
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
          y: adjustedY,
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
        scale: isMobile ? 2.3 : 1,
        duration: 1.0,
        ease: "power2.out"
      },
      orbitToCenterStart
    );

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

  tl.to(
    refs.biggerOrbit,
    {
      rotation: -720,
      duration: tl.duration(),
      ease: "none"
    },
    0
  );

  tl.to(
    refs.pinkOrbitInner,
    {
      rotation: -720,
      duration: tl.duration(),
      ease: "none"
    },
    0
  );

  tl.to(
    refs.combinedCircle?.outer,
    {
      rotation: -720,
      duration: tl.duration(),
      ease: "none"
    },
    0
  );

  return tl;
};

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
      <img
        ref={outerRef}
        src={curvey_circle_without_inner_part}
        alt="outer circle"
        className="absolute inset-0 w-full h-full antialiased"
        style={{}}
      />
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

const WaitlistButton = React.forwardRef(
  ({ onClick, style, className }, ref) => {
    const handleClick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      console.log("Waitlist button clicked!");
      window.open("https://discord.gg/wKRYG7cSWt", "_blank");
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

const Scene1_1 = React.forwardRef((props, ref) => {
  const { isMobile } = props;

  const containerRef = useRef(null);
  const bgRef = useRef(null);
  const rightCloudRef = useRef(null);
  const leftCloudRef = useRef(null);
  const floorRef = useRef(null);
  const leftElementRef = useRef(null);
  const rightElementRef = useRef(null);

  // const text0Ref = useRef(null);
  const textRef = useRef(null);
  const text2Ref = useRef(null);
  const text3Ref = useRef(null);
  const object1Ref = useRef(null);
  const object2Ref = useRef(null);
  const object3Ref = useRef(null);
  const leftElementEyeRef = useRef(null);
  const rightElementEyeRef = useRef(null);
  const ellipseRef = useRef(null);
  const objectsContainerRef = useRef(null);
  const biggerOrbitRef = useRef(null);
  const pinkBiggerOrbitRef = useRef(null);
  const pinkOrbitInnerRef = useRef(null);
  const stairsLeftRef = useRef(null);
  const stairsRightRef = useRef(null);
  const stairsMod1MobileRef = useRef(null);
  const stairsMod2MobileRef = useRef(null);
  const text4Ref = useRef(null);
  const text5Ref = useRef(null);
  const text6Ref = useRef(null);
  const leftStairsMod3MobileRef = useRef(null);
  const rightStairsMod3MobileRef = useRef(null);
  const text7Ref = useRef(null);
  const combinedCircleRef = useRef(null);
  const combinedCircleContainerRef = useRef(null);
  const leftStairsMod4MobileRef = useRef(null);
  const rightStairsMod4MobileRef = useRef(null);
  const leftStairsMod5MobileRef = useRef(null);
  const rightStairsMod5MobileRef = useRef(null);
  const waitlistButtonRef = useRef(null);
  const leftStairsMod6MobileRef = useRef(null);
  const rightStairsMod6MobileRef = useRef(null);
  const text8Ref = useRef(null);
  const ovalMini1Ref = useRef(null);
  const ovalMini2Ref = useRef(null);
  const ovalMini3Ref = useRef(null);
  const oval1Ref = useRef(null);
  const oval2Ref = useRef(null);
  const oval3Ref = useRef(null);

  React.useImperativeHandle(ref, () => ({
    container: containerRef.current,
    bg: bgRef.current,
    rightCloud: rightCloudRef.current,
    leftCloud: leftCloudRef.current,
    floor: floorRef.current,
    leftElement: leftElementRef.current,
    rightElement: rightElementRef.current,
    leftElementEye: leftElementEyeRef.current,
    rightElementEye: rightElementEyeRef.current,
    // text0: text0Ref.current,
    text: textRef.current,
    text2: text2Ref.current,
    text3: text3Ref.current,
    stairsRight: stairsRightRef.current,
    stairsLeft: stairsLeftRef.current,
    objectsContainer: objectsContainerRef.current,
    object1: object1Ref.current,
    object2: object2Ref.current,
    object3: object3Ref.current,
    ellipse: ellipseRef.current,
    biggerOrbit: biggerOrbitRef.current,
    pinkBiggerOrbit: pinkBiggerOrbitRef.current,
    pinkOrbitInner: pinkOrbitInnerRef.current,
    stairsMod1Mobile: stairsMod1MobileRef.current,
    stairsMod2Mobile: stairsMod2MobileRef.current,
    text4: text4Ref.current,
    text5: text5Ref.current,
    text6: text6Ref.current,
    leftStairsMod3Mobile: leftStairsMod3MobileRef.current,
    rightStairsMod3Mobile: rightStairsMod3MobileRef.current,
    text7: text7Ref.current,
    combinedCircle: combinedCircleRef.current,
    combinedCircleContainer: combinedCircleContainerRef.current,
    leftStairsMod4Mobile: leftStairsMod4MobileRef.current,
    rightStairsMod4Mobile: rightStairsMod4MobileRef.current,
    leftStairsMod5Mobile: leftStairsMod5MobileRef.current,
    rightStairsMod5Mobile: rightStairsMod5MobileRef.current,
    waitlistButton: waitlistButtonRef.current,
    leftStairsMod6Mobile: leftStairsMod6MobileRef.current,
    rightStairsMod6Mobile: rightStairsMod6MobileRef.current,
    text8: text8Ref.current,
    ovalMini1: ovalMini1Ref.current,
    ovalMini2: ovalMini2Ref.current,
    ovalMini3: ovalMini3Ref.current,
    oval1: oval1Ref.current,
    oval2: oval2Ref.current,
    oval3: oval3Ref.current
  }));

  const objectSize = isMobile ? 44 : 70;
  const mobileObjGap = isMobile ? 8 : 24;

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden"
      style={{ pointerEvents: "none" }}
    >
      <img
        ref={bgRef}
        src={isMobile ? yellow_bg_mobile : yellow_bg}
        alt="yellow background"
        className="absolute inset-0 w-full h-full object-cover z-[1]"
      />
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
      <img
        ref={biggerOrbitRef}
        src={isMobile ? bigger_orbit_mobile : bigger_orbit}
        alt="bigger orbit"
        className="absolute left-1/2 -translate-x-1/2 z-[9] pointer-events-none"
        style={{
          bottom: isMobile ? "-2vh" : isTabletLandscape ? "-40vh" : "-60vh",
          width: isMobile ? "100%" : "80vw",
          height: "auto",
          opacity: 0,
          transformOrigin: "center center"
        }}
      />
      <div
        ref={pinkBiggerOrbitRef}
        className="absolute left-1/2 -translate-x-1/2 z-[9] pointer-events-none"
        style={{
          bottom: isMobile ? "-2vh" : isTabletLandscape ? "-40vh" : "-60vh",
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
        <div
          ref={combinedCircleContainerRef}
          className="absolute z-[15] pointer-events-none"
          style={{
            width: isMobile ? "60vw" : "30vw",
            height: isMobile ? "60vw" : "30vw",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            opacity: 0
          }}
        >
          <CombinedCircle ref={combinedCircleRef} isMobile={isMobile} />
        </div>
      </div>
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
      {/* <div
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
      </div> */}
      <div
        ref={textRef}
        className={[
          "absolute left-1/2 -translate-x-1/2 z-[20] text-center font-extrabold",
          "text-[32px] leading-[1.2] letterSpacing-[-0.03em]",
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
      <div
        ref={text2Ref}
        className={[
          "absolute left-1/2 -translate-x-1/2 z-[20] text-center font-extrabold",
          "text-[32px] leading-[1.2]",
          "[@media(min-height:812px)]:text-[40px]",
          "[@media(min-height:812px)]:leading-[1.2]",
          "md:text-[48px] md:leading-[1.2]",
          "[@media(min-width:1024px)]:[@media(min-height:900px)]:text-[64px]"
        ].join(" ")}
        style={{
          top: isMobile ? "24%" : "26%",
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
        className={[
          "absolute left-1/2 -translate-x-1/2 z-[20] text-center font-extrabold",
          "text-[24px] leading-[1.2] letterSpacing-[0.03em]",
          "[@media(min-height:812px)]:text-[32px]",
          "[@media(min-height:812px)]:leading-[1.2]",
          "md:text-[32px] md:leading-[1.2]",
          "@media (min-width:1024px) and (min-height:768px):text-[32px]",
          "@media (min-width:1024px) and (min-height:1080px):text-[56px]",
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
      {!isMobile && (
        <div
          ref={text4Ref}
          className={[
            "absolute left-1/2 -translate-x-1/2 z-[20] text-center font-extrabold",
            "md:text-[48px] md:leading-[48px]",
            "[@media(min-width:1024px)]:[@media(min-height:900px)]:text-[64px]",
            "[@media(min-width:1024px)]:[@media(min-height:900px)]:leading-[64px]"
          ].join(" ")}
          style={{
            top: "70%",
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
      {!isMobile && (
        <>
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
        </>
      )}
      {isMobile && (
        <>
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
        </>
      )}
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
            // className="hover:opacity-80 transition-opacity duration-300"
            onMouseEnter={(e) => (e.currentTarget.src = join_us_button_hover)}
            onMouseLeave={(e) => (e.currentTarget.src = join_us_button)}
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
