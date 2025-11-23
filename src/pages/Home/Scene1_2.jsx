import React, { useRef, lazy, Suspense } from "react";
import { gsap } from "gsap";
import {
  vector,
  vector_mobile,
  vector_lavender,
  vector_lavender_mobile,
  rays,
  left_hand_orange,
  left_hand_orange_mobile,
  right_hand_orange,
  right_hand_orange_mobile,
  rays_mobile,
  thunder,
  purple_hand_left,
  purple_hand_right,
  saturn_left,
  saturn_right,
  purple_hand_left_mobile,
  purple_hand_right_mobile,
  saturn_left_mobile,
  saturn_right_mobile,
  pink_lightening_left,
  pink_lightening_right,
  pink_lightening_left_mobile,
  pink_lightening_right_mobile,
  bird_left,
  bird_right,
  bird_left_mobile,
  bird_right_mobile,
  semi_circle_left,
  semi_circle_right,
  semi_circle_right1,
  semi_circle_right_mobile,
  semi_circle_left_mobile,
  left_thunder,
  right_thunder
} from "../../assets/images/Home";

import ThreeDoorsWithRibbon from "../../components/ThreeDoorsWithRibbon";
import ThreeDoorsWithRibbonDiamondMountains from "../../components/ThreeDoorsWithRibbonDiamondMountains";
import ThreeDoorsWithRibbonMountainsEye from "../../components/ThreeDoorsWithRibbonMountainsEye";
import LeftRightDoorHands from "../../components/LeftRightDoorHands";
import LeftRightDoorHandsMobile from "../../components/LeftRightDoorHandsMobile";
// Timeline hook for Scene1_2 animation - works with master timeline

// Add this function before or after useScene1_2Timeline
const startSaturnCompassAnimation = (saturnLeft, saturnRight) => {
  if (!saturnLeft || !saturnRight) return;

  // Create subtle, natural oscillation using random variation
  const compassTL = gsap.timeline({ repeat: -1, yoyo: true });

  // Base rotation values for natural sway
  const leftAngles = [-20, 10, -12, 6, 0];
  const rightAngles = [15, -18, 12, -8, 0];

  // Helper to randomize duration slightly for realism
  const rand = (min, max) => gsap.utils.random(min, max, 0.1, true);

  leftAngles.forEach((angle, i) => {
    compassTL.to(
      saturnLeft,
      {
        rotation: angle,
        duration: rand(1.8, 2.8),
        ease: "sine.inOut",
        transformOrigin: "center center"
      },
      i === 0 ? 0 : ">"
    );
  });

  rightAngles.forEach((angle, i) => {
    compassTL.to(
      saturnRight,
      {
        rotation: angle,
        duration: rand(1.8, 2.8),
        ease: "sine.inOut",
        transformOrigin: "center center"
      },
      i === 0 ? 0 : ">"
    );
  });

  // Add slight scale/pulse for extra realism
  gsap.to([saturnLeft, saturnRight], {
    // scale: 1.02,
    duration: 2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  gsap.to(saturnLeft, {
    y: "+=8",
    duration: 3,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });
  gsap.to(saturnRight, {
    y: "+=8",
    duration: 3.2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });
};

const isTablet = (() => {
  const w = window.innerWidth;
  const h = window.innerHeight;

  // Covers:
  // iPad Mini 768×1024
  // iPad Air 820×1180
  // iPad Pro 834×1194 / 1024×1368
  // Surface 912×1368
  return (
    w >= 700 &&
    w <= 1370 && // width within tablet range
    h >= 600 &&
    h <= 1400 // height within tablet range
  );
})();

export const useScene1_2Timeline = (refs, isMobile) => {
  const tl = gsap.timeline();

  // Move doorHands component down - with responsive behavior
  const doorHandsY = gsap.matchMedia();

  doorHandsY.add(
    "(min-width: 768px) and (max-width: 1365px) and (min-height: 600px) and (max-height: 1400px)",
    () => {
      tl.to(
        refs.doorHands,
        { y: "-60vh", duration: 0.8, ease: "power2.inOut" },
        "sixthScroll"
      );
    }
  );

  // doorHandsY.add(
  //   "(min-width: 1181px)",
  //   () => {
  //     tl.to(refs.doorHands, { y: "15vh", duration: 0.8, ease: "power2.inOut" }, "sixthScroll");
  //   }
  // );

  // Set initial states
  const elementsToSet = [
    refs.vector,
    refs.vectorLavender,
    refs.topText,
    refs.mainText,
    refs.noShortcutsText,
    refs.mentorsText,
    refs.finalTopText,
    refs.finalBottomText,
    refs.waitlistButton,
    refs.doorsWithRibbon,
    refs.doorsComplete,
    refs.doorsFinal,
    refs.rays,
    refs.leftHand,
    refs.rightHand,
    refs.doorHands,
    refs.ageText,
    refs.timeText,
    refs.purpleHandLeft, // Add this
    refs.purpleHandRight, // Add this
    refs.saturnLeft, // Add this
    refs.saturnRight, // Add this
    refs.pinkLighteningLeft,
    refs.pinkLighteningRight,
    refs.birdLeft,
    refs.birdRight,
    refs.nerveText,
    refs.freedomText,
    refs.semiCircleLeft, // ADD THIS
    refs.semiCircleRight // ADD THIS
  ];

  if (!isMobile) {
    elementsToSet.push(refs.thunder);
  }

  // ADD THIS NEW CODE HERE:
  if (!isMobile) {
    elementsToSet.push(refs.transitionSemiCircleLeft);
    elementsToSet.push(refs.transitionBg); // ADD THIS
  } else {
    elementsToSet.push(refs.mobileTransitionView);
  }

  tl.set(elementsToSet, {
    opacity: 0,
    willChange: "transform, opacity"
  });

  // Initial appearance - Vector and doors appear together
  tl.to([refs.vector, refs.doorsWithRibbon], {
    opacity: 1,
    duration: 0
    // ease: "power2.out"
  });

  // Then texts appear
  tl.to(
    refs.topText,
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out"
    },
    0.3
  );

  tl.to(
    refs.mainText,
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out"
    },
    0.5
  );

  // Initial appearance - Texts appear
  tl.to(
    refs.topText,
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out"
    },
    0
  );

  tl.to(
    refs.mainText,
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out"
    },
    0.2
  );

  // Show ThreeDoorsWithRibbon at bottom
  // tl.to(
  //   refs.doorsWithRibbon,
  //   {
  //     opacity: 1
  //     // duration: 0
  //     // ease: "power2.out"
  //   },
  //   0.4
  // );

  // SECOND SCROLL: Text change and doors swap
  tl.add("secondScroll", "+=0.5");

  tl.to(
    refs.mainText,
    {
      opacity: 0,
      duration: 0.4,
      ease: "power2.inOut"
    },
    "secondScroll"
  );

  tl.to(
    refs.noShortcutsText,
    {
      opacity: 1,
      duration: 0.4,
      ease: "power2.inOut"
    },
    "secondScroll+=0.4"
  );

  tl.set(refs.doorsWithRibbon, { opacity: 0 }, "secondScroll+=0.4");
  tl.set(refs.doorsComplete, { opacity: 1 }, "secondScroll+=0.4");

  // example: after the doors component becomes visible
  tl.add(
    refs.doorsDM.buildMountainsRise({ yStart: 100, duration: 0.9 }),
    "secondScroll+=0.46"
  );

  // THIRD SCROLL: Text change and final doors swap
  tl.add("thirdScroll", "+=0.5");

  tl.to(
    refs.noShortcutsText,
    {
      opacity: 0,
      duration: 0.4,
      ease: "power2.inOut"
    },
    "thirdScroll"
  );

  tl.to(
    refs.mentorsText,
    {
      opacity: 1,
      duration: 0.4,
      ease: "power2.inOut"
    },
    "thirdScroll+=0.4"
  );

  // 🔽 run the diamond outro (lift a bit) right before swapping
  if (refs.doorsDM?.buildOutroToEye) {
    const outro = refs.doorsDM.buildOutroToEye({
      y: -70,
      scale: 1,
      duration: 1.5
    });
    tl.add(outro, "thirdScroll+=0.35");
  }

  tl.set(refs.doorsComplete, { opacity: 0 }, "thirdScroll+=0.4");
  tl.set(refs.doorsFinal, { opacity: 1 }, "thirdScroll+=0.4");

  // FOURTH SCROLL: Background change, vector change, and final scene
  tl.add("fourthScroll", "+=0.5");

  // Change background color - use set instead of to for instant change
  tl.set(
    refs.divcontainer,
    {
      backgroundColor: "#ffd007" // This is evolve-inchworm from your tailwind config
    },
    "fourthScroll+=0.5"
  );

  // Fade out old texts
  tl.to(
    [refs.topText, refs.mentorsText],
    {
      opacity: 0,
      duration: 0.4,
      ease: "power2.inOut"
    },
    "fourthScroll"
  );

  // Swap vectors
  tl.set(refs.vector, { opacity: 0 }, "fourthScroll+=0.3");
  tl.set(refs.vectorLavender, { opacity: 1 }, "fourthScroll+=0.3");

  // Show rays behind
  tl.to(
    refs.rays,
    {
      opacity: 1,
      duration: 0.8,
      ease: "power2.out"
    },
    "fourthScroll+=0.3"
  );

  // Move doors and vector down
  tl.to(
    [refs.doorsFinal, refs.vectorLavender],
    {
      y: isMobile ? 100 : 150,
      duration: 1,
      ease: "power2.out"
    },
    "fourthScroll+=0.4"
  );

  // Show hands
  tl.to(
    [refs.leftHand, refs.rightHand],
    {
      opacity: 1,
      duration: 0.8,
      ease: "power2.out"
    },
    "fourthScroll+=0.5"
  );

  // Show final texts
  tl.to(
    refs.finalTopText,
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out"
    },
    "fourthScroll+=0.6"
  );

  tl.to(
    refs.finalBottomText,
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out"
    },
    "fourthScroll+=0.7"
  );

  // Show waitlist button
  // tl.to(
  //   refs.waitlistButton,
  //   {
  //     opacity: 1,
  //     scale: 1,
  //     duration: 0.6,
  //     ease: "back.out(1.7)"
  //   },
  //   "fourthScroll+=0.9"
  // );
  // Show waitlist button
  tl.to(
    refs.waitlistButton,
    {
      opacity: 1,
      scale: 1,
      pointerEvents: "auto", // ✅ Add this - make clickable when visible
      duration: 0.6,
      ease: "back.out(1.7)"
    },
    "fourthScroll+=1"
  );

  // FIFTH SCROLL: Move scene down and show new elements
  tl.add("fifthScroll", "+=0.5");

  // Move entire scene downwards and fade out
  // Move entire scene downwards and fade out
  tl.to(
    [
      refs.finalTopText,
      refs.finalBottomText,
      refs.waitlistButton,
      refs.doorsFinal,
      refs.vectorLavender,
      refs.leftHand,
      refs.rightHand
    ],
    {
      y: isMobile ? 200 : 300,
      opacity: 0,
      pointerEvents: "none", // ✅ Add this - make non-clickable when hidden
      duration: 0,
      ease: "power2.inOut"
    },
    "fifthScroll"
  );

  // Move rays down to show only 20% from bottom (desktop) or 10% (mobile)
  // Move rays down to show only top 10% from bottom
  // tl.to(
  //   refs.rays,
  //   {
  //     top: "auto",
  //     bottom: "0",
  //     y: "95%", // Move 90% of its height down, showing only 10% from bottom
  //     zIndex: 15, // Update z-index here
  //     duration: 1,
  //     ease: "power2.inOut"
  //   },
  //   "fifthScroll"
  // );
  tl.to(
    refs.rays,
    {
      y: isMobile ? "110vh" : "168vh", // Move down 90%, leaving 10% visible
      zIndex: 15,
      duration: 0.2,
      ease: "power2.inOut"
    },
    "fifthScroll"
  );

  // Show door hands component (behind rays)
  tl.to(
    refs.doorHands,
    {
      opacity: 1,
      duration: 0,
      ease: "power2.out"
    },
    "fifthScroll+=0.3"
  );

  // Show thunder at bottom (over rays) - Desktop only
  if (!isMobile) {
    tl.to(
      refs.thunder,
      {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out"
      },
      "fifthScroll+=0.5"
    );
  }

  // Show age text
  tl.to(
    refs.ageText,
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out"
    },
    "fifthScroll+=0.6"
  );
  // In useScene1_2Timeline, replace the purple hands and saturns animation section:

  // SIXTH SCROLL section - Replace the entire section around line 340-400:

  tl.add("sixthScroll", "+=0.5");

  // Add Semi-Circle animations (Desktop only)
  if (!isMobile) {
    // Set initial positions off-screen
    tl.set(
      refs.semiCircleLeft,
      {
        x: "-100%",
        opacity: 1
      },
      "sixthScroll"
    );

    tl.set(
      refs.semiCircleRight,
      {
        x: "100%",
        opacity: 1
      },
      "sixthScroll"
    );

    // Slide in from sides
    tl.to(
      refs.semiCircleLeft,
      {
        x: -110,
        duration: 1.2,
        ease: "power2.out"
      },
      "sixthScroll+=0.3"
    );

    tl.to(
      refs.semiCircleRight,
      {
        x: 110,
        duration: 1.2,
        ease: "power2.out"
      },
      "sixthScroll+=0.3"
    );
  }
  // Move rays down completely (desktop only)
  if (!isMobile) {
    tl.to(
      refs.rays,
      {
        y: "200vh",
        duration: 1,
        ease: "power2.inOut"
      },
      "sixthScroll"
    );

    // Move age text container to 50vh and keep it there
    tl.to(
      refs.ageTextContainer,
      {
        top: "45vh",
        duration: 0.8,
        ease: "power2.inOut"
      },
      "sixthScroll"
    );

    // Move thunder down a bit
    tl.to(
      refs.thunder,
      {
        bottom: "-25vh",
        duration: 0.8,
        ease: "power2.out"
      },
      "sixthScroll"
    );

    // Move doorHands component down
    // tl.to(
    //   refs.doorHands,
    //   {
    //     y: "15vh",
    //     duration: 0.8,
    //     ease: "power2.inOut"
    //   },
    //   "sixthScroll"
    // );
    // Move doorHands component down
    // Move doorHands component down
    // Move doorHands component down
    tl.to(
      refs.doorHands,
      {
        y: () => {
          const w = window.innerWidth;
          const h = window.innerHeight;
          // Tablet landscape check
          const isTabletLandscape =
            w >= 768 && w <= 1365 && h >= 600 && h <= 1400;

          console.log(
            "DoorHands animation - Width:",
            w,
            "Height:",
            h,
            "isTablet:",
            isTabletLandscape
          );

          return isTabletLandscape ? "-35vh" : "15vh";
        },
        duration: 0.8,
        ease: "power2.inOut"
      },
      "sixthScroll"
    );
  }

  // Set initial position for hands (below their final position)
  tl.set(
    [refs.purpleHandLeft, refs.purpleHandRight],
    { opacity: 0 },

    "sixthScroll+=0.6"
  );

  // Animate purple hands sliding in from bottom
  tl.to(
    [refs.purpleHandLeft, refs.purpleHandRight],
    {
      opacity: 1,
      // y: 0,
      duration: 0.4,
      ease: "power2.out"
    },
    "sixthScroll+=0.8"
  );

  // Animate saturns appearing after hands
  tl.to(
    [refs.saturnLeft, refs.saturnRight],
    {
      opacity: 1,
      duration: 0.8,
      ease: "power2.out",
      onComplete: () => {
        // Start compass animation after saturns appear
        startSaturnCompassAnimation(refs.saturnLeft, refs.saturnRight);
      }
    },
    "sixthScroll+=1.5"
  );

  // Show time text
  tl.to(
    refs.timeText,
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out"
    },
    "sixthScroll+=0.9"
  );

  // // 5. ADD SEVENTH SCROLL ANIMATION (add after the sixthScroll section, around line 440)
  // SEVENTH SCROLL: Saturn slides out, Pink Lightening slides in, Time text changes to Nerve
  tl.add("seventhScroll", "+=0.5");

  // Fade out "time" text
  tl.to(
    refs.timeText,
    {
      opacity: 0,
      duration: 0.4,
      ease: "power2.inOut"
    },
    "seventhScroll"
  );

  // Fade in "nerve" text
  tl.to(
    refs.nerveText,
    {
      opacity: 1,
      duration: 0.4,
      ease: "power2.inOut"
    },
    "seventhScroll+=0.4"
  );

  // Slide saturns out to their respective sides and fade
  tl.to(
    refs.saturnLeft,
    {
      x: isMobile ? "-50vw" : "-36px",
      opacity: 0,
      duration: 0.5,
      ease: "power2.inOut"
    },
    "seventhScroll"
  );

  tl.to(
    refs.saturnRight,
    {
      x: isMobile ? "50vw" : "36px",
      opacity: 0,
      duration: 0.5,
      ease: "power2.inOut"
    },
    "seventhScroll"
  );

  // Set initial position for pink lightening (off-screen)
  tl.set(
    refs.pinkLighteningLeft,
    {
      opacity: 1
    },
    "seventhScroll+=0.5"
  );

  tl.set(
    refs.pinkLighteningRight,
    {
      opacity: 1
    },
    "seventhScroll+=0.5"
  );

  // Slide pink lightening in from sides
  tl.to(
    refs.pinkLighteningLeft,
    {
      duration: 1,
      ease: "power2.out"
    },
    "seventhScroll+=0.6"
  );

  tl.to(
    refs.pinkLighteningRight,
    {
      duration: 1,
      ease: "power2.out"
    },
    "seventhScroll+=0.6"
  );

  // EIGHTH SCROLL: Lightening and hands slide out, Birds slide in
  // EIGHTH SCROLL: Lightening and hands slide out, Birds slide in, Nerve changes to Freedom
  tl.add("eighthScroll", "+=0.5");

  // Fade out "nerve" text
  tl.to(
    refs.nerveText,
    {
      opacity: 0,
      duration: 0.4,
      ease: "power2.inOut"
    },
    "eighthScroll"
  );

  // Fade in "freedom to experiment" text
  tl.to(
    refs.freedomText,
    {
      opacity: 1,
      duration: 0.4,
      ease: "power2.inOut"
    },
    "eighthScroll+=0.4"
  );

  // Slide out pink lightening and purple hands together
  tl.to(
    [
      refs.pinkLighteningLeft,
      refs.pinkLighteningRight,
      refs.purpleHandLeft,
      refs.purpleHandRight
    ],
    {
      opacity: 0,
      duration: 1,
      ease: "power2.inOut"
    },
    "eighthScroll"
  );

  // Set initial position for birds (below screen)
  tl.set(
    [refs.birdLeft, refs.birdRight],
    {
      opacity: 1
    },
    "eighthScroll+=0.5"
  );

  // Slide birds in from bottom
  tl.to(
    [refs.birdLeft, refs.birdRight],
    {
      duration: 1,
      ease: "power2.out"
    },
    "eighthScroll+=0.6"
  );

  // NINTH SCROLL: Horizontal slide transition to Scene1_3
  // NINTH SCROLL: Horizontal slide transition to Scene1_3
  // NINTH SCROLL: Horizontal slide transition to Scene1_3
  tl.add("ninthScroll", "+=0.5");

  // Desktop horizontal scroll
  if (!isMobile) {
    // Show transition background and semi-circle
    tl.set(
      [refs.transitionSemiCircleLeft, refs.transitionBg],
      { opacity: 1 },
      "ninthScroll"
    );

    // Slide the main container left
    tl.to(
      refs.divcontainer,
      {
        x: "-19vw", // Slide left by one viewport
        duration: 1.2,
        ease: "power2.inOut"
      },
      "ninthScroll"
    );

    // Slide the transition background along with it
    tl.to(
      refs.transitionBg,
      {
        x: "-19vw", // Slide left by one viewport
        duration: 1.2,
        ease: "power2.inOut"
      },
      "ninthScroll"
    );
  }

  // Mobile horizontal scroll
  if (isMobile) {
    // Slide current container left
    tl.to(
      refs.divcontainer,
      {
        x: "-50vw",
        duration: 1.2,
        ease: "power2.inOut"
      },
      "ninthScroll"
    );

    // Show and slide in the transition view
    tl.set(refs.mobileTransitionView, { opacity: 1 }, "ninthScroll");

    tl.to(
      refs.mobileTransitionView,
      {
        x: "-50vw",
        duration: 1.2,
        ease: "power2.inOut"
      },
      "ninthScroll"
    );
  }

  // Clear will-change
  const elementsToClean = [
    refs.container,
    refs.divcontainer,
    refs.vector,
    refs.vectorLavender,
    refs.topText,
    refs.mainText,
    refs.noShortcutsText,
    refs.mentorsText,
    refs.finalTopText,
    refs.finalBottomText,
    refs.waitlistButton,
    refs.doorsWithRibbon,
    refs.doorsComplete,
    refs.doorsFinal,
    refs.rays,
    refs.leftHand,
    refs.rightHand,
    refs.doorHands,
    refs.ageText,
    refs.timeText,
    refs.purpleHandLeft, // Add this
    refs.purpleHandRight, // Add this
    refs.saturnLeft, // Add this
    refs.saturnRight, // Add this
    refs.pinkLighteningLeft,
    refs.pinkLighteningRight,
    refs.birdLeft,
    refs.birdRight,
    refs.nerveText,
    refs.freedomText,
    refs.semiCircleLeft, // ADD THIS
    refs.semiCircleRight
  ];

  if (!isMobile) {
    elementsToClean.push(refs.thunder);
  }

  // ADD THIS NEW CODE HERE:
  if (!isMobile) {
    elementsToClean.push(refs.transitionSemiCircleLeft);
    elementsToClean.push(refs.transitionBg); // ADD THIS
  } else {
    elementsToClean.push(refs.mobileTransitionView);
  }

  tl.set(
    elementsToClean,
    {
      willChange: "auto"
    },
    "+=0.5"
  );

  return tl;
};

// Main Scene Component
const Scene1_2 = React.forwardRef((props, ref) => {
  const { isMobile } = props;

  // Main refs
  const containerRef = useRef(null);
  const divcontainerRef = useRef(null);
  const vectorRef = useRef(null);
  const vectorLavenderRef = useRef(null);
  const topTextRef = useRef(null);
  const mainTextRef = useRef(null);
  const noShortcutsTextRef = useRef(null);
  const mentorsTextRef = useRef(null);
  const finalTopTextRef = useRef(null);
  const finalBottomTextRef = useRef(null);
  const waitlistButtonRef = useRef(null);
  const doorsWithRibbonRef = useRef(null);
  const doorsCompleteRef = useRef(null);
  const doorsFinalRef = useRef(null);
  const raysRef = useRef(null);
  const leftHandRef = useRef(null);
  const rightHandRef = useRef(null);
  const doorsDMComponentRef = React.useRef(null);
  const thunderRef = useRef([]);
  const doorHandsRef = useRef(null);
  const ageTextRef = useRef(null);
  const ageTextContainerRef = useRef(null);
  const timeTextRef = useRef(null);
  const purpleHandLeftRef = useRef(null);
  const purpleHandRightRef = useRef(null);
  const saturnLeftRef = useRef(null);
  const saturnRightRef = useRef(null);
  const pinkLighteningLeftRef = useRef(null);
  const pinkLighteningRightRef = useRef(null);
  const birdLeftRef = useRef(null);
  const birdRightRef = useRef(null);
  const nerveTextRef = useRef(null);
  const freedomTextRef = useRef(null);
  const semiCircleLeftRef = useRef(null);
  const semiCircleRightRef = useRef(null);
  const transitionSemiCircleLeftRef = useRef(null); // ADD THIS
  const mobileTransitionViewRef = useRef(null); // ADD THIS
  const transitionBgRef = useRef(null); // ADD THIS

  // Expose refs to parent
  React.useImperativeHandle(ref, () => ({
    container: containerRef.current,
    divcontainer: divcontainerRef.current,
    vector: vectorRef.current,
    vectorLavender: vectorLavenderRef.current,
    topText: topTextRef.current,
    mainText: mainTextRef.current,
    noShortcutsText: noShortcutsTextRef.current,
    mentorsText: mentorsTextRef.current,
    finalTopText: finalTopTextRef.current,
    finalBottomText: finalBottomTextRef.current,
    waitlistButton: waitlistButtonRef.current,
    doorsWithRibbon: doorsWithRibbonRef.current,
    doorsComplete: doorsCompleteRef.current,
    doorsFinal: doorsFinalRef.current,
    rays: raysRef.current,
    leftHand: leftHandRef.current,
    rightHand: rightHandRef.current,
    doorsDM: doorsDMComponentRef.current,
    thunder: thunderRef.current,
    doorHands: doorHandsRef.current,
    ageText: ageTextRef.current,
    ageTextContainer: ageTextContainerRef.current,
    timeText: timeTextRef.current,
    purpleHandLeft: purpleHandLeftRef.current, // Add this
    purpleHandRight: purpleHandRightRef.current, // Add this
    saturnLeft: saturnLeftRef.current, // Add this
    saturnRight: saturnRightRef.current, // Add this
    pinkLighteningLeft: pinkLighteningLeftRef.current,
    pinkLighteningRight: pinkLighteningRightRef.current,
    birdLeft: birdLeftRef.current,
    birdRight: birdRightRef.current,
    nerveText: nerveTextRef.current,
    freedomText: freedomTextRef.current,
    semiCircleLeft: semiCircleLeftRef.current,
    semiCircleRight: semiCircleRightRef.current,
    transitionSemiCircleLeft: transitionSemiCircleLeftRef.current, // ADD THIS
    mobileTransitionView: mobileTransitionViewRef.current, // ADD THIS
    transitionBg: transitionBgRef.current // ADD THIS
  }));

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-evolve-lavender-indigo"
    >
      {/* <div ref={divcontainerRef} className="bg-evolve-lavender-indigo"> */}
      <div
        ref={divcontainerRef}
        className="absolute inset-0 w-full h-full bg-evolve-lavender-indigo transition-colors"
      >
        {/* Transition background - appears during slide (Desktop only) */}
        {!isMobile && (
          <div
            className="absolute h-full pointer-events-none"
            style={{
              left: "100vw", // Start at right edge
              width: "100vw", // One viewport width
              top: 0,
              backgroundColor: "#ffd007", // Yellow background
              opacity: 0,
              zIndex: 1
            }}
            ref={(el) => {
              // We'll animate this in the timeline
              if (el) {
                transitionBgRef.current = el;
              }
            }}
          />
        )}
        {/* Semi-Circle Left - Desktop Only (lowest z-index) */}
        {!isMobile && (
          <img
            ref={semiCircleLeftRef}
            src={semi_circle_left}
            alt="semi circle left"
            className="absolute pointer-events-none"
            style={{
              left: 0,
              bottom: "-5vh",
              width: "auto",
              height: "80vh",
              opacity: 0,
              zIndex: 2
            }}
          />
        )}
        {/* Semi-Circle Right - Desktop Only (lowest z-index) */}
        {!isMobile && (
          <img
            ref={semiCircleRightRef}
            src={semi_circle_right}
            alt="semi circle right"
            className="absolute pointer-events-none"
            style={{
              right: 0,
              bottom: "-5vh",
              width: "auto",
              height: "80vh",
              opacity: 0,
              zIndex: 2
            }}
          />
        )}
        {/* Transition Semi-Circle Left - Desktop Only (appears during slide) */}
        {!isMobile && (
          <img
            ref={transitionSemiCircleLeftRef}
            src={semi_circle_left}
            alt="transition semi circle left"
            className="absolute pointer-events-none"
            style={{
              left: "107%", // Position it right after the viewport edge
              bottom: "-5vh",
              width: "auto",
              height: "80vh",
              opacity: 0,
              zIndex: 2
            }}
          />
        )}
        {/* Mobile Transition View - Semi Circles */}
        {/* Mobile Transition View - Semi Circles */}
        {isMobile && (
          <div
            ref={mobileTransitionViewRef}
            className="absolute inset-0 w-full h-full bg-evolve-yellow"
            style={{
              left: "100vw", // Start off-screen right
              opacity: 0,
              zIndex: 25 // Above everything else
            }}
          >
            {/* Semi-Circle Right - takes left half */}
            <img
              src={semi_circle_right}
              alt="transition semi circle right"
              className="absolute pointer-events-none"
              style={{
                left: 0,
                bottom: "-5vh",
                width: "50%"
                // height: "70vh"
                // width: "90vw"
              }}
            />

            {/* Semi-Circle Left - takes right half */}
            <img
              src={semi_circle_left}
              alt="transition semi circle left"
              className="absolute pointer-events-none"
              style={{
                right: 0,
                bottom: "-5vh",
                width: "50%"
                // height: "70vh"
              }}
            />
          </div>
        )}
        {/* Rays background - half visible */}
        {/* <img
          // loading="lazy"
          ref={raysRef}
          src={rays}
          alt="rays"
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            top: isMobile ? "0" : "-80vh", // Center vertically
            transform: isMobile
              ? "translate(-50%) scale(2)"
              : "translate(-50%)", // Center both horizontally and vertically
            width: isMobile ? "200%" : "300%",
            height: "auto",
            opacity: 0,
            zIndex: 1
          }}
        /> */}
        <img
          ref={raysRef}
          src={rays}
          alt="rays"
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            top: isMobile
              ? "0"
              : // : isTablet
                // ? "-60vh" // ⬅️ tablet screens get -60
                "-80vh", // ⬅️ desktop screens remain -80
            transform: isMobile
              ? "translate(-50%) scale(2)"
              : "translate(-50%)",
            width: isMobile ? "200%" : isTablet ? "400%" : "300%",
            height: "auto",
            opacity: 0,
            zIndex: 1
          }}
        />

        {/* LeftRightDoorHands Component - centered behind rays */}
        {/* <div
          ref={doorHandsRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-5"
          style={{ opacity: 0 }}
        >
          {isMobile ? <LeftRightDoorHandsMobile /> : <LeftRightDoorHands />}
        </div> */}
        {/* LeftRightDoorHands Component with Purple Hands and Saturns - centered behind rays */}
        {/* LeftRightDoorHands Component with Purple Hands and Saturns - centered behind rays */}
        <div
          ref={doorHandsRef}
          style={{
            opacity: 0,
            top: isMobile ? "60vh" : "",
            width: isMobile ? "100vw" : "90vw",
            height: "auto"
          }}
          className="absolute left-1/2 lg:top-1/2 -translate-x-1/2 -translate-y-1/2 z-5"
        >
          {isMobile ? (
            <LeftRightDoorHandsMobile className="" />
          ) : (
            <LeftRightDoorHands className="" />
          )}

          {/* Purple Hand Left - Desktop */}
          {!isMobile && (
            <img
              ref={purpleHandLeftRef}
              src={purple_hand_left}
              alt="purple hand left"
              className="absolute pointer-events-none 
    [top:40%] 
    [@media(min-height:768px)]:top-[39%] 
    [@media(min-height:900px)]:top-[38%]
    [@media(min-height:1080px)]:top-[38%]
    [@media(min-height:1200px)]:top-[33%]
    [@media(min-width:1700px)]:top-[42%] 
    [@media(min-width:1700px)]:left-[30px]
    [left:26px]
    [@media(min-width:768px)_and_(max-width:1366px)_and_(min-height:600px)_and_(max-height:1024px)]:top-[40%]
    [@media(min-width:768px)_and_(max-width:1366px)_and_(min-height:600px)_and_(max-height:1024px)]:left-[22px]
[@media(min-width:768px)_and_(max-width:1366px)_and_(min-height:600px)_and_(max-height:1024px)]:scale-30
          [w-auto]
          [@media(min-width:768px)_and_(max-width:1366px)_and_(min-height:600px)_and_(max-height:1024px)]:w-[30%]"
              style={{
                // left: "26px",
                // width: "auto",
                height: "auto",
                opacity: 0,
                transform: "translateY(-50%)",
                zIndex: 15 // Add this
              }}
            />
          )}

          {/* Purple Hand Right - Desktop */}
          {!isMobile && (
            <img
              ref={purpleHandRightRef}
              src={purple_hand_right}
              alt="purple hand right"
              className="absolute pointer-events-none 
    [top:40%] 
    [@media(min-height:768px)]:top-[39%] 
    [@media(min-height:900px)]:top-[38%]
    [@media(min-height:1080px)]:top-[38%]
    [@media(min-height:1200px)]:top-[33%]
        [@media(min-width:1700px)]:top-[42%]
        [right:20px]
            [@media(min-width:768px)_and_(max-width:1366px)_and_(min-height:600px)_and_(max-height:1024px)]:top-[39.5%]
              [@media(min-width:768px)_and_(max-width:1366px)_and_(min-height:600px)_and_(max-height:1024px)]:right-[18px]
              [w-auto]
              [@media(min-width:768px)_and_(max-width:1366px)_and_(min-height:600px)_and_(max-height:1024px)]:w-[30%]"
              style={{
                // right: "20px",
                // width: "auto",
                height: "auto",
                opacity: 0,
                transform: "translateY(-50%)",
                zIndex: 15 // Add this
              }}
            />
          )}

          {/* Saturn Left - Desktop */}
          {!isMobile && (
            <img
              ref={saturnLeftRef}
              src={saturn_left}
              alt="saturn left"
              className="absolute pointer-events-none 
          [top:20%] 
          [@media(min-height:768px)]:top-[18%] 
          [@media(min-height:900px)]:top-[14%]
          [@media(min-height:1080px)]:top-[10%]
          [@media(min-width:1700px)]:top-[20%]
          [@media(min-width:1700px)]:scale-100"
              style={{
                left: "40px",
                width: "auto",
                height: "auto",
                opacity: 0,
                transform: "translateY(-50%) scale(0.8)",
                transformOrigin: "center center" // Add this for rotation
              }}
            />
          )}

          {/* Saturn Right - Desktop */}
          {!isMobile && (
            <img
              ref={saturnRightRef}
              src={saturn_right}
              alt="saturn right"
              className="absolute pointer-events-none 
          [top:20%] 
          [@media(min-height:768px)]:top-[18%] 
          [@media(min-height:900px)]:top-[14%]
          [@media(min-height:1080px)]:top-[10%]
          [@media(min-width:1700px)]:top-[20%]
          [@media(min-width:1700px)]:scale-100"
              style={{
                right: "37.98px",
                width: "auto",
                height: "auto",
                opacity: 0,
                transform: "translateY(-50%) scale(0.8)",
                transformOrigin: "center center" // Add this for rotation
              }}
            />
          )}

          {/* Purple Hand Left - Mobile */}
          {isMobile && (
            <img
              ref={purpleHandLeftRef}
              src={purple_hand_left_mobile}
              alt="purple hand left"
              className="absolute pointer-events-none
          [top:44.5%]
          [@media(min-height:667px)]:top-[43.5%]
          [@media(min-height:736px)]:top-[42.5%]
          [@media(min-height:812px)]:top-[43%]
          [@media(min-height:844px)]:top-[44.5%]
          [@media(min-height:896px)]:top-[45.5%]
          [@media(min-height:926px)]:top-[46%]"
              style={{
                left: "0",
                width: "auto",
                height: "auto",
                opacity: 0,
                transform: "translateY(-50%)",
                zIndex: 15 // Add this
              }}
            />
          )}

          {/* Purple Hand Right - Mobile */}
          {isMobile && (
            <img
              ref={purpleHandRightRef}
              src={purple_hand_right_mobile}
              alt="purple hand right"
              className="absolute pointer-events-none
          [top:44.5%]
          [@media(min-height:667px)]:top-[43.5%]
          [@media(min-height:736px)]:top-[42.5%]
          [@media(min-height:812px)]:top-[43%]
          [@media(min-height:844px)]:top-[44.5%]
          [@media(min-height:896px)]:top-[45.5%]
          [@media(min-height:926px)]:top-[46%]"
              style={{
                right: "0",
                width: "auto",
                height: "auto",
                opacity: 0,
                transform: "translateY(-50%)",
                zIndex: 15 // Add this
              }}
            />
          )}

          {/* Saturn Left - Mobile */}
          {isMobile && (
            <img
              ref={saturnLeftRef}
              src={saturn_left_mobile}
              alt="saturn left"
              className="absolute pointer-events-none 
          [top:25%]
          [@media(min-height:667px)]:top-[19%]
          [@media(min-height:736px)]:top-[18%]
          [@media(min-height:812px)]:top-[17%]
          [@media(min-height:844px)]:top-[16%]
          [@media(min-height:896px)]:top-[15%]
          [@media(min-height:926px)]:top-[14%]"
              style={{
                left: "0",
                width: "auto",
                height: "auto",
                opacity: 0,
                transform: "translateY(-50%)",
                transformOrigin: "center center" // Add this for rotation
              }}
            />
          )}

          {/* Saturn Right - Mobile */}
          {isMobile && (
            <img
              ref={saturnRightRef}
              src={saturn_right_mobile}
              alt="saturn right"
              className="absolute pointer-events-none 
          [top:25%]
          [@media(min-height:667px)]:top-[21%]
          [@media(min-height:736px)]:top-[22%]
          [@media(min-height:812px)]:top-[20%]
          [@media(min-height:844px)]:top-[19%]
          [@media(min-height:896px)]:top-[18%]
          [@media(min-height:926px)]:top-[17%]"
              style={{
                right: "0",
                width: "auto",
                height: "auto",
                opacity: 0,
                transform: "translateY(-50%)",
                transformOrigin: "center center" // Add this for rotation
              }}
            />
          )}
          {/* Pink Lightening Left - Desktop */}
          {!isMobile && (
            <img
              ref={pinkLighteningLeftRef}
              src={pink_lightening_left}
              alt="pink lightening left"
              className="absolute pointer-events-none 
    [top:20%] 
    [@media(min-height:768px)]:top-[18%] 
    [@media(min-height:900px)]:top-[14%]
    [@media(min-height:1080px)]:top-[10%]
    [@media(min-width:1700px)]:top-[22%]
          [left:24px]
          [@media(min-width:1700px)]:left-[30px]"
              style={{
                // left: "24px",
                width: "auto",
                height: "auto",
                opacity: 0,
                transform: "translateY(-50%)"
              }}
            />
          )}

          {/* Pink Lightening Right - Desktop */}
          {!isMobile && (
            <img
              ref={pinkLighteningRightRef}
              src={pink_lightening_right}
              alt="pink lightening right"
              className="absolute pointer-events-none 
[top:20%]
[@media(min-height:768px)]:top-[18%]
[@media(min-height:900px)]:top-[14%]
[@media(min-height:1080px)]:top-[10%]
[@media(min-height:1200px)]:top-[8%]
    [@media(min-width:1700px)]:top-[22%]
          [right:20px]
          [@media(min-width:1700px)]:right-[25px]"
              style={{
                // right: "20px",
                // width: "full",
                // height: "full",
                opacity: 0,
                transform: "translateY(-50%)"
              }}
            />
          )}

          {/* Pink Lightening Left - Mobile */}
          {isMobile && (
            <img
              ref={pinkLighteningLeftRef}
              src={pink_lightening_left_mobile}
              alt="pink lightening left"
              className="absolute pointer-events-none 
    [top:25%]
    [@media(min-height:667px)]:top-[21%]
    [@media(min-height:736px)]:top-[22%]
    [@media(min-height:812px)]:top-[20%]
    [@media(min-height:844px)]:top-[19%]
    [@media(min-height:896px)]:top-[18%]
    [@media(min-height:926px)]:top-[17%]"
              style={{
                left: "0",
                width: "auto",
                height: "auto",
                opacity: 0,
                transform: "translateY(-50%)"
              }}
            />
          )}

          {/* Pink Lightening Right - Mobile */}
          {isMobile && (
            <img
              ref={pinkLighteningRightRef}
              src={pink_lightening_right_mobile}
              alt="pink lightening right"
              className="absolute pointer-events-none 
    [top:25%]
    [@media(min-height:667px)]:top-[21%]
    [@media(min-height:736px)]:top-[22%]
    [@media(min-height:812px)]:top-[20%]
    [@media(min-height:844px)]:top-[19%]
    [@media(min-height:896px)]:top-[18%]
    [@media(min-height:926px)]:top-[17%]"
              style={{
                right: "0",
                width: "auto",
                height: "auto",
                opacity: 0,
                transform: "translateY(-50%)"
              }}
            />
          )}

          {/* Bird Left - Desktop */}
          {!isMobile && (
            <img
              ref={birdLeftRef}
              src={bird_left}
              alt="bird left"
              className="absolute pointer-events-none 
    [top:32%] 
    [@media(min-height:768px)]:top-[26%] 
    [@media(min-height:900px)]:top-[38%]
    [@media(min-height:1080px)]:top-[35%]
    [@media(min-width:1700px)]:top-[28%]
          [left:24px]
          [@media(min-width:1700px)]:left-[30px]"
              style={{
                // left: "24px",
                width: "28%",
                // height: "auto",
                opacity: 0,
                transform: "translateY(-50%)"
              }}
            />
          )}

          {/* Bird Right - Desktop */}
          {!isMobile && (
            <img
              ref={birdRightRef}
              src={bird_right}
              alt="bird right"
              className="absolute pointer-events-none 
    [top:32%] 
    [@media(min-height:768px)]:top-[26%] 
    [@media(min-height:900px)]:top-[38%]
    [@media(min-height:1080px)]:top-[35%]
    [@media(min-width:1700px)]:top-[28%]
          [right:20px]
          [@media(min-width:1700px)]:right-[22px]"
              style={{
                // right: "20px",
                width: "28%",
                // height: "auto",
                opacity: 0,
                transform: "translateY(-50%)"
              }}
            />
          )}

          {/* Bird Left - Mobile */}
          {isMobile && (
            <img
              ref={birdLeftRef}
              src={bird_left_mobile}
              alt="bird left"
              className="absolute pointer-events-none
    [top:45.5%]
    [@media(min-height:667px)]:top-[43.5%]
    [@media(min-height:736px)]:top-[42.5%]
    [@media(min-height:812px)]:top-[43%]
    [@media(min-height:844px)]:top-[44.5%]
    [@media(min-height:896px)]:top-[45.5%]
    [@media(min-height:926px)]:top-[46%]"
              style={{
                left: "0",
                width: "50%",
                height: "auto",
                opacity: 0,
                transform: "translateY(-50%)"
              }}
            />
          )}

          {/* Bird Right - Mobile */}
          {isMobile && (
            <img
              ref={birdRightRef}
              src={bird_right_mobile}
              alt="bird right"
              className="absolute pointer-events-none
    [top:45.5%]
    [@media(min-height:667px)]:top-[43.5%]
    [@media(min-height:736px)]:top-[42.5%]
    [@media(min-height:812px)]:top-[43%]
    [@media(min-height:844px)]:top-[44.5%]
    [@media(min-height:896px)]:top-[45.5%]
    [@media(min-height:926px)]:top-[46%]"
              style={{
                right: "0",
                width: "50%",
                height: "auto",
                opacity: 0,
                transform: "translateY(-50%)"
              }}
            />
          )}
          {/* </div> */}
        </div>
        {/* {!isMobile && (
          <img
            // loading="lazy"
            ref={thunderRef}
            src={thunder}
            alt="thunder"
            className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
            style={{
              bottom: "-15vh",
              width: "auto",
              height: "auto",
              opacity: 0,
              zIndex: 20,
              scale: 1.2
            }}
          />
        )} */}

        {/* LEFT THUNDER */}
        {!isMobile && (
          <img
            ref={(el) => (thunderRef.current[0] = el)}
            src={left_thunder}
            alt="left thunder"
            className="absolute pointer-events-none"
            style={{
              left: "-10vw",
              bottom: "-5vh",
              width: "40%",
              height: "auto",
              opacity: 0,
              zIndex: 20,
              scale: 1.2
            }}
          />
        )}

        {/* RIGHT THUNDER */}
        {!isMobile && (
          <img
            ref={(el) => (thunderRef.current[1] = el)}
            src={right_thunder}
            alt="right thunder"
            className="absolute pointer-events-none"
            style={{
              right: "-10vw",
              bottom: "-5vh",
              width: "40%",
              height: "auto",
              opacity: 0,
              zIndex: 20,
              scale: 1.2
            }}
          />
        )}

        {/* Age Text */}
        {/* Age Text */}
        <div
          ref={ageTextContainerRef}
          className="absolute left-0 right-0 text-center z-20"
          style={{ top: isMobile ? "12%" : "15%" }}
        >
          <div
            className="mx-auto px-4"
            style={{ maxWidth: isMobile ? "95%" : "45%" }}
          >
            <p
              ref={ageTextRef}
              className={[
                "text-black font-extrabold leading-tight",

                // ============================
                // 📱 MOBILE BASE — 24px
                // ============================
                "text-[24px]",

                // mobile min-height:736 → 20px
                "[@media(max-width:767px)]:[@media(min-height:736px)]:text-[20px]",

                // mobile min-height:667 → 20px
                "[@media(max-width:767px)]:[@media(min-height:667px)]:text-[20px]",

                // mobile min-height:896 → 28px (comes last so it overrides 20px)
                "[@media(max-width:767px)]:[@media(min-height:896px)]:text-[28px]",

                // ============================
                // 💻 DESKTOP (>=1024px)
                // ============================
                "md:text-[24px]", // base desktop compact (min-height 768px)

                // desktop min-height >= 900px → 36px
                "[@media(min-width:1024px)]:[@media(min-height:900px)]:text-[36px]",

                // desktop tall >=1080px → 36px
                "[@media(min-width:1024px)]:[@media(min-height:1080px)]:text-[36px]",

                // desktop wide >=1700px → 36px
                "[@media(min-width:1700px)]:text-[36px]"
              ].join(" ")}
              style={{
                lineHeight: isMobile ? "23px" : "34px",
                opacity: 0,
                transform: "translateY(-10px)"
              }}
            >
              If you're between 16 and 22, you've got something most people
              lose:
            </p>
          </div>
        </div>
        {/* Time Text */}
        {/* Time Text */}
        <div
          className="absolute left-0 right-0 text-center z-20"
          style={{ top: isMobile ? "24vh" : "60vh" }} // Increased from 100px/120px
        >
          <h2
            ref={timeTextRef}
            className={[
              "text-black font-extrabold px-4 lowercase leading-none",

              // ==============================
              // 📱 MOBILE BASE — 48px
              // ==============================
              "text-[48px]",

              // mobile >=667px → 40px
              "[@media(max-width:767px)]:[@media(min-height:667px)]:text-[40px]",

              // mobile >=736px → 40px
              "[@media(max-width:767px)]:[@media(min-height:736px)]:text-[40px]",

              // mobile >=812px → 48px (override back to 48)
              "[@media(max-width:767px)]:[@media(min-height:812px)]:text-[48px]",

              // mobile >=844px → 48px
              "[@media(max-width:767px)]:[@media(min-height:844px)]:text-[48px]",

              // mobile >=926px → 56px (highest mobile)
              "[@media(max-width:767px)]:[@media(min-height:926px)]:text-[56px]",

              // ==============================
              // 💻 DESKTOP BASE (>=1024px)
              // ==============================
              "md:text-[64px]", // default desktop @768 high

              // desktop >=900px → 96px
              "[@media(min-width:1024px)]:[@media(min-height:900px)]:text-[96px]",

              // desktop >=1080px → 96px
              "[@media(min-width:1024px)]:[@media(min-height:1080px)]:text-[96px]",

              // desktop wide >=1700px → 96px
              "[@media(min-width:1700px)]:text-[96px]"
            ].join(" ")}
            style={{
              opacity: 0,
              lineHeight: 1,
              transform: "translateY(-10px)"
            }}
          >
            time
          </h2>
        </div>
        {/* Nerve Text */}
        <div
          className="absolute left-0 right-0 text-center z-20"
          style={{ top: isMobile ? "24vh" : "60vh" }}
        >
          <h2
            ref={nerveTextRef}
            className={[
              "text-black font-extrabold px-4 lowercase leading-none",

              // ==============================
              // 📱 MOBILE BASE — 48px
              // ==============================
              "text-[48px]",

              // mobile >=667px → 40px
              "[@media(max-width:767px)]:[@media(min-height:667px)]:text-[40px]",

              // mobile >=736px → 40px
              "[@media(max-width:767px)]:[@media(min-height:736px)]:text-[40px]",

              // mobile >=812px → 48px (override back to 48)
              "[@media(max-width:767px)]:[@media(min-height:812px)]:text-[48px]",

              // mobile >=844px → 48px
              "[@media(max-width:767px)]:[@media(min-height:844px)]:text-[48px]",

              // mobile >=926px → 56px (highest mobile)
              "[@media(max-width:767px)]:[@media(min-height:926px)]:text-[56px]",

              // ==============================
              // 💻 DESKTOP BASE (>=1024px)
              // ==============================
              "md:text-[64px]", // default desktop @768 high

              // desktop >=900px → 96px
              "[@media(min-width:1024px)]:[@media(min-height:900px)]:text-[96px]",

              // desktop >=1080px → 96px
              "[@media(min-width:1024px)]:[@media(min-height:1080px)]:text-[96px]",

              // desktop wide >=1700px → 96px
              "[@media(min-width:1700px)]:text-[96px]"
            ].join(" ")}
            style={{
              opacity: 0,
              lineHeight: 1,
              transform: "translateY(-10px)"
            }}
          >
            nerve
          </h2>
        </div>
        {/* Freedom Text */}
        <div
          className="absolute left-0 right-0 text-center z-20"
          style={{ top: isMobile ? "24vh" : "60vh" }}
        >
          <h2
            ref={freedomTextRef}
            className={[
              "text-black font-extrabold px-4 lowercase leading-none",

              // ==============================
              // 📱 MOBILE BASE — 48px
              // ==============================
              "text-[48px]",

              // mobile >=667px → 40px
              "[@media(max-width:767px)]:[@media(min-height:667px)]:text-[40px]",

              // mobile >=736px → 40px
              "[@media(max-width:767px)]:[@media(min-height:736px)]:text-[40px]",

              // mobile >=812px → 48px (override back to 48)
              "[@media(max-width:767px)]:[@media(min-height:812px)]:text-[48px]",

              // mobile >=844px → 48px
              "[@media(max-width:767px)]:[@media(min-height:844px)]:text-[48px]",

              // mobile >=926px → 56px (highest mobile)
              "[@media(max-width:767px)]:[@media(min-height:926px)]:text-[56px]",

              // ==============================
              // 💻 DESKTOP BASE (>=1024px)
              // ==============================
              "md:text-[64px]", // default desktop @768 high

              // desktop >=900px → 96px
              "[@media(min-width:1024px)]:[@media(min-height:900px)]:text-[96px]",

              // desktop >=1080px → 96px
              "[@media(min-width:1024px)]:[@media(min-height:1080px)]:text-[96px]",

              // desktop wide >=1700px → 96px
              "[@media(min-width:1700px)]:text-[96px]"
            ].join(" ")}
            style={{
              opacity: 0,
              lineHeight: "80%",
              transform: "translateY(-10px)"
            }}
          >
            freedom to
            <br />
            experiment
          </h2>
        </div>
        {/* Top Text Section - Initial state */}
        {/* Top Text Section - Initial state */}
        <div
          className="absolute left-0 right-0 text-center z-20"
          style={{ top: "15%" }}
        >
          <p
            ref={topTextRef}
            className="text-white font-extrabold mb-4 px-4 lowercase"
            style={{
              fontSize: isMobile ? "24px" : "32px",
              opacity: 0,
              lineHeight: 1
            }}
          >
            {/* the toolkit gets you started. the course is where it gets serious: */}
          </p>

          {/* Container for overlapping text elements */}
          <div
            className="relative"
            style={{ height: isMobile ? "3rem" : "6rem" }}
          >
            {/* "learn design" text - CHANGED */}
            <h2
              ref={mainTextRef}
              className="text-white font-extrabold px-4 lowercase absolute left-0 right-0"
              style={{
                fontSize: isMobile ? "3rem" : "6rem",
                letterSpacing: 0,
                opacity: 0,
                top: 0,
                lineHeight: 1
              }}
            >
              {/* learn design */}
            </h2>

            {/* "get mentored" text - CHANGED */}
            <h2
              ref={noShortcutsTextRef}
              className="text-white font-extrabold px-4 lowercase absolute left-0 right-0 text-5xl md:text-8xl"
              style={{
                // fontSize: isMobile ? "3rem" : "6rem",
                letterSpacing: 0,
                opacity: 0,
                top: 0,
                lineHeight: 1
              }}
            >
              learn design
            </h2>

            {/* "earn a paid internship" text - CHANGED */}
            <h2
              ref={mentorsTextRef}
              className="text-white font-extrabold px-4 lowercase absolute left-0 right-0 text-5xl md:text-8xl"
              style={{
                // fontSize: isMobile ? "3rem" : "6rem",
                letterSpacing: 0,
                opacity: 0,
                top: 0,
                lineHeight: 1
              }}
            >
              get mentored
            </h2>
          </div>
        </div>
        {/* Final Text Section - New state */}
        <div
          className="absolute left-0 right-0 text-center z-20"
          style={{ top: "17%" }}
        >
          <p
            ref={finalTopTextRef}
            className="text-black font-extrabold mb-4 px-4 lowercase"
            style={{
              fontSize: isMobile ? "24px" : "32px",
              opacity: 0,
              lineHeight: 1
            }}
          >
            {/* The toolkit gets you started. */}
          </p>

          <h2
            ref={finalBottomTextRef}
            className="text-black font-extrabold px-4 lowercase mb-8 text-5xl md:text-8xl"
            style={{
              // fontSize: isMobile ? "48px" : "96px",
              opacity: 0,
              lineHeight: 0.8
            }}
          >
            earn a paid internship
          </h2>

          {/* Waitlist Button */}
          {/* Waitlist Button */}
          <button
            ref={waitlistButtonRef}
            className="px-8 py-4 bg-black text-white font-bold text-lg rounded-[16px] lowercase"
            style={{
              opacity: 0,
              transform: "scale(0.8)",
              pointerEvents: "none", // ✅ Add this - start non-clickable
              boxShadow: "0 6px 0 rgba(128, 128, 128, 0.8)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease"
            }}
            onClick={() => {
              window.open(
                "https://discord.com/channels/@me/1347086283985649749/1438414139365265479",
                "_blank"
              );
            }}
          >
            join us
          </button>
        </div>
        {/* Left Hand */}
        <img
          // loading="lazy"
          ref={leftHandRef}
          src={isMobile ? left_hand_orange_mobile : left_hand_orange}
          alt="left hand"
          className="absolute pointer-events-none z-15"
          style={{
            bottom: isMobile ? "10%" : "5%",
            left: 0,
            //   right: isMobile ? 0 : "auto",
            width: isMobile ? "40%" : "auto",
            height: "auto",
            opacity: 0
          }}
        />
        {/* Right Hand */}
        <img
          // loading="lazy"
          ref={rightHandRef}
          src={isMobile ? right_hand_orange_mobile : right_hand_orange}
          alt="right hand"
          className="absolute pointer-events-none z-15"
          style={{
            bottom: isMobile ? "10%" : "5%",
            right: 0,
            width: isMobile ? "40%" : "auto",
            height: "auto",
            opacity: 0
          }}
        />
        {/* ThreeDoorsWithRibbon - First state */}
        <div
          ref={doorsWithRibbonRef}
          className="absolute left-1/2 z-10"
          style={{
            bottom: 0,
            opacity: 1,
            width: "full",
            transform: isMobile
              ? "translateX(-50%) scale(2.5)"
              : "translateX(-50%) ",
            transformOrigin: "bottom center"
          }}
        >
          {/* <Suspense fallback={null}> */}
          <ThreeDoorsWithRibbon />
          {/* </Suspense> */}
        </div>
        {/* ThreeDoorsWithRibbonDiamondMountains - Second state */}
        <div
          ref={doorsCompleteRef}
          className="absolute left-1/2 z-11"
          style={{
            bottom: 0,
            opacity: 0,
            transform: isMobile
              ? "translateX(-50%) scale(2.5)"
              : "translateX(-50%)",
            transformOrigin: "bottom center"
          }}
        >
          {/* <Suspense fallback={null}> */}
          <ThreeDoorsWithRibbonDiamondMountains ref={doorsDMComponentRef} />
          {/* </Suspense> */}
        </div>
        {/* ThreeDoorsWithRibbonMountainsEye - Third state (final) */}
        <div
          ref={doorsFinalRef}
          className="absolute left-1/2 z-12"
          style={{
            bottom: 0,
            opacity: 0,
            transform: isMobile
              ? "translateX(-50%) scale(2.5)"
              : "translateX(-50%)",
            transformOrigin: "bottom center"
          }}
        >
          {/* <Suspense fallback={null}> */}
          <ThreeDoorsWithRibbonMountainsEye />
          {/* </Suspense> */}
        </div>
        {/* Initial Vector at bottom */}
        <img
          // loading="lazy"
          ref={vectorRef}
          src={isMobile ? vector_mobile : vector}
          alt="vector"
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            bottom: 0,
            width: "100%",
            height: "auto",
            opacity: 1,
            zIndex: 9
          }}
        />
        {/* Lavender Vector - appears later */}
        <img
          // loading="lazy"
          ref={vectorLavenderRef}
          src={isMobile ? vector_lavender_mobile : vector_lavender}
          alt="vector lavender"
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            bottom: 0,
            width: "100%",
            height: "auto",
            opacity: 0,
            zIndex: 9
          }}
        />
      </div>
    </section>
  );
});

Scene1_2.displayName = "Scene1_2";
export default Scene1_2;
