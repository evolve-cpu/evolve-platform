// import React, { useRef, useEffect, useState } from "react";
// import { gsap } from "gsap";
// import {
//   yellow_bg,
//   yellow_bg_mobile,
//   right_cloud,
//   right_cloud_mobile,
//   left_cloud,
//   left_cloud_mobile,
//   floor_2nd,
//   floor_2nd_mobile,
//   left_element,
//   left_element_mobile,
//   right_element,
//   right_element_mobile,
//   left_element_eye, // ADD THIS
//   left_element_eye_mobile, // ADD THIS
//   right_element_eye, // ADD THIS
//   right_element_eye_mobile, // ADD THIS
//   yellow_ellipse,
//   yellow_ellipse_mobile,
//   object_1,
//   object_2,
//   bigger_orbit,
//   bigger_orbit_mobile
// } from "../../assets/images/Home";

// // Timeline hook for Scene1_1 animation - works with master timeline
// export const useScene1_1Timeline = (refs, isMobile) => {
//   const tl = gsap.timeline();

//   // Get object size for calculations
//   const objectSize = isMobile ? 44 : 70;
//   const mobileObjGap = isMobile ? 8 : 24;

//   // Set initial states with will-change for performance
//   tl.set(refs.rightCloud, {
//     opacity: 0,
//     y: -50,
//     willChange: "transform, opacity"
//   })
//     .set(refs.leftCloud, {
//       opacity: 0,
//       y: 80,
//       willChange: "transform, opacity"
//     })
//     .set(refs.floor, { opacity: 0, y: 150, willChange: "transform, opacity" })
//     .set(refs.leftElement, {
//       opacity: 0,
//       x: -200,
//       willChange: "transform, opacity"
//     })
//     .set(refs.rightElement, {
//       opacity: 0,
//       x: 200,
//       willChange: "transform, opacity"
//     })
//     .set(refs.text, { opacity: 0, y: 10, willChange: "transform, opacity" })
//     .set(refs.text2, { opacity: 0, y: 0, willChange: "transform, opacity" })
//     .set(refs.objectsContainer, {
//       opacity: 0,
//       y: 0,
//       willChange: "transform, opacity"
//     })
//     .set(refs.ellipse, {
//       opacity: 0,
//       scale: 1,
//       willChange: "transform, opacity"
//     })
//     .set(refs.biggerOrbit, {
//       opacity: 0,
//       scale: 0.5,
//       y: 0,
//       willChange: "transform, opacity"
//     })
//     .set([refs.object1, refs.object2, refs.object3], {
//       y: 0,
//       opacity: 1,
//       scale: 1,
//       willChange: "transform, opacity"
//     });

//   // Entrance animations - clouds/floor/elements (0-3s)
//   tl.to(refs.rightCloud, { opacity: 1, y: 0, duration: 1, ease: "power2.out" })
//     .to(
//       refs.leftCloud,
//       { opacity: 1, y: 0, duration: 1, ease: "power2.out" },
//       "-=0.6"
//     )
//     .to(
//       refs.floor,
//       { opacity: 1, y: 0, duration: 1.2, ease: "power2.out" },
//       "-=0.6"
//     )
//     .to(
//       refs.leftElement,
//       { opacity: 1, x: 0, duration: 1, ease: "back.out(1.7)" },
//       1.2
//     )
//     .to(
//       refs.rightElement,
//       { opacity: 1, x: 0, duration: 1, ease: "back.out(1.7)" },
//       "-=0.8"
//     );

//   // ===== TEXT APPEARS FIRST (1.5s) =====
//   tl.to(
//     refs.text,
//     { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
//     1.5
//   );

//   // ===== BIGGER ORBIT APPEARS (at 20% scale, half visible above floor) =====
//   tl.to(refs.biggerOrbit, { opacity: 1, duration: 0.6 }, 2.0);

//   // ===== THEN OBJECTS APPEAR (reduced time gap) =====
//   tl.to(refs.objectsContainer, { opacity: 1, duration: 0.6 }, 3.5);

//   // ===== OBJECTS START FALLING (4.5s) =====
//   const fallDuration = 2.5;
//   const fallStart = 4.5;

//   // ===== TEXT ANIMATION HAPPENS WHILE OBJECTS ARE FALLING =====
//   // Text animates up to "misfits" (first 5 words) during fall
//   if (refs.text) {
//     const spans = Array.from(refs.text.querySelectorAll("span[data-text]"));

//     // Set all spans to start at 0.3 opacity - but let them animate to full black
//     spans.forEach((span) => {
//       gsap.set(span, {
//         opacity: 0.3,
//         color: "rgb(0, 0, 0)",
//         willChange: "opacity"
//       });
//     });

//     // Find the index where "misfits" appears (word 5: Here, you'll, find, mentors, misfits)
//     let misfitsIndex = -1;
//     spans.forEach((span, idx) => {
//       if (span.textContent.includes("misfits")) {
//         misfitsIndex = idx;
//       }
//     });

//     const firstPhaseEnd = misfitsIndex >= 0 ? misfitsIndex : 4; // Up to and including "misfits"

//     // PHASE 1: Animate words up to "misfits" while objects fall
//     spans.forEach((span, idx) => {
//       if (idx <= firstPhaseEnd) {
//         tl.to(
//           span,
//           {
//             opacity: 1,
//             duration: 0.4,
//             ease: "power2.out"
//           },
//           4.5 + idx * 0.4 // Stagger during fall
//         );
//       }
//     });

//     // Slight upward movement of entire text block during first phase
//     tl.to(
//       refs.text,
//       {
//         y: -10,
//         duration: 2.0,
//         ease: "power2.out"
//       },
//       4.5
//     );
//   }

//   // Calculate fall distance: objects should reach ellipse center and stop there
//   const calculateFallDistance = () => {
//     if (!refs.objectsContainer) return isMobile ? 250 : 350;

//     try {
//       const objectsRect = refs.objectsContainer.getBoundingClientRect();
//       const viewportHeight = window.innerHeight;

//       // Ellipse dimensions
//       const ellipseHeight = isMobile ? 300 * 0.4 : 560 * 0.3; // Approximate height (30% of width)
//       const ellipseBottom = isMobile
//         ? viewportHeight * 0.09
//         : viewportHeight * 0.05;

//       // Target is ellipse center (bottom + half height)
//       const ellipseCenter = viewportHeight - ellipseBottom - ellipseHeight / 2;

//       // Current object position
//       const objectsCenterY = isMobile
//         ? objectsRect.bottom - objectSize / 2 // Mobile: bottom object center
//         : objectsRect.top + objectsRect.height / 2; // Desktop: container center

//       const distance = ellipseCenter - objectsCenterY;

//       console.log("Fall calculation:", {
//         ellipseCenter,
//         objectsCenterY,
//         distance,
//         isMobile
//       });

//       return distance > 0 ? distance : isMobile ? 250 : 350;
//     } catch (error) {
//       console.error("Error calculating fall distance:", error);
//       return isMobile ? 250 : 350;
//     }
//   };

//   const fallDistance = calculateFallDistance();

//   // Objects fall into ellipse with smooth easing
//   if (isMobile) {
//     // MOBILE: Objects stacked vertically - each disappears when it reaches ellipse center
//     const baseDistance = fallDistance;
//     const objectGap = objectSize + mobileObjGap;

//     tl.to(
//       refs.object3,
//       {
//         y: baseDistance,
//         duration: fallDuration,
//         ease: "power1.inOut"
//       },
//       fallStart
//     );

//     tl.to(
//       refs.object2,
//       {
//         y: baseDistance + objectGap,
//         duration: fallDuration,
//         ease: "power1.inOut"
//       },
//       fallStart
//     );

//     tl.to(
//       refs.object1,
//       {
//         y: baseDistance + objectGap * 2,
//         duration: fallDuration,
//         ease: "power1.inOut"
//       },
//       fallStart
//     );
//   } else {
//     // DESKTOP: Objects side by side - all reach center together
//     tl.to(
//       [refs.object1, refs.object2, refs.object3],
//       {
//         y: fallDistance,
//         duration: fallDuration,
//         ease: "power1.inOut",
//         stagger: 0.1
//       },
//       fallStart
//     );
//   }

//   // ===== ELLIPSE APPEARS WHEN OBJECTS ARE FALLING (6s) =====
//   tl.to(refs.ellipse, { opacity: 1, duration: 0.8 }, 6.0);

//   // ===== OBJECTS SHRINK AND VANISH INSIDE ELLIPSE =====
//   const shrinkStart = fallStart + fallDuration - 1.0;

//   if (isMobile) {
//     const shrinkDuration = 0.8;
//     const staggerTime = 0.5;

//     tl.to(
//       refs.object3,
//       {
//         scale: 0,
//         opacity: 0,
//         duration: shrinkDuration,
//         ease: "power2.in"
//       },
//       shrinkStart
//     );

//     tl.to(
//       refs.object2,
//       {
//         scale: 0,
//         opacity: 0,
//         duration: shrinkDuration,
//         ease: "power2.in"
//       },
//       shrinkStart + staggerTime
//     );

//     tl.to(
//       refs.object1,
//       {
//         scale: 0,
//         opacity: 0,
//         duration: shrinkDuration,
//         ease: "power2.in"
//       },
//       shrinkStart + staggerTime * 2
//     );
//   } else {
//     tl.to(
//       [refs.object1, refs.object2, refs.object3],
//       {
//         scale: 0,
//         opacity: 0,
//         duration: 1.5,
//         ease: "power2.in",
//         stagger: 0.1
//       },
//       shrinkStart
//     );
//   }

//   // Ellipse pulse effect when objects enter - KEEP OPACITY AT 1
//   tl.to(
//     refs.ellipse,
//     {
//       scale: 1.08,
//       duration: 0.6,
//       ease: "power2.out"
//     },
//     shrinkStart
//   ).to(
//     refs.ellipse,
//     {
//       scale: 1,
//       duration: 0.8,
//       ease: "power2.inOut"
//     },
//     shrinkStart + 0.6
//   );

//   // ===== AFTER OBJECTS DISAPPEAR: TRANSITION PHASE =====
//   const transitionStart = shrinkStart + (isMobile ? 2.0 : 1.5);

//   // 1. Scale down ellipse to 0 (happens first)
//   tl.to(
//     refs.ellipse,
//     {
//       scale: 0,
//       opacity: 0,
//       duration: 0.8,
//       ease: "power2.in"
//     },
//     transitionStart
//   );

//   // 2. Floor goes down (happens after ellipse disappears)
//   tl.to(
//     refs.floor,
//     {
//       y: 300,
//       opacity: 0,
//       duration: 1.2,
//       ease: "power2.inOut"
//     },
//     transitionStart + 0.8
//   );

//   // 3. Bigger orbit scales up but stays BEFORE center (happens after floor starts disappearing)
//   // const orbitBeforeCenterY = isMobile ? -50 : -80; // Not fully centered yet
//   // tl.to(
//   //   refs.biggerOrbit,
//   //   {
//   //     scale: 1,
//   //     y: orbitBeforeCenterY,
//   //     opacity: 1,
//   //     duration: 1.8,
//   //     ease: "power2.out"
//   //   },
//   //   transitionStart + 1.0
//   // );

//   // 3. Bigger orbit scales up but stays BEFORE center (happens after floor starts disappearing)
//   const orbitBeforeCenterY = isMobile ? -50 : -80; // Not fully centered yet
//   const orbitScale = isMobile ? 2 : 1; // Bigger for mobile

//   tl.to(
//     refs.biggerOrbit,
//     {
//       scale: orbitScale,
//       y: orbitBeforeCenterY,
//       opacity: 1,
//       duration: 1.8,
//       ease: "power2.out"
//     },
//     transitionStart + 1.0
//   );

//   // Start continuous rotation (anti-clockwise)
//   // gsap.to(refs.biggerOrbit, {
//   //   rotation: -360,
//   //   duration: 20,
//   //   ease: "none",
//   //   repeat: -1
//   // });

//   // ===== PHASE 2: REMAINING TEXT ANIMATES AFTER OBJECTS VANISH =====
//   if (refs.text) {
//     const spans = Array.from(refs.text.querySelectorAll("span[data-text]"));

//     let misfitsIndex = -1;
//     spans.forEach((span, idx) => {
//       if (span.textContent.includes("misfits")) {
//         misfitsIndex = idx;
//       }
//     });

//     const firstPhaseEnd = misfitsIndex >= 0 ? misfitsIndex : 4;

//     // Animate remaining words ("and", "midnight", "breakthroughs")
//     spans.forEach((span, idx) => {
//       if (idx > firstPhaseEnd) {
//         const relativeIdx = idx - firstPhaseEnd - 1;
//         tl.to(
//           span,
//           {
//             opacity: 1,
//             duration: 0.4,
//             ease: "power2.out"
//           },
//           8.5 + relativeIdx * 0.4
//         );
//       }
//     });

//     // Fade out first text completely
//     const textFadeOutStart = transitionStart + 2.5;
//     tl.to(
//       refs.text,
//       {
//         opacity: 0,
//         duration: 0.6,
//         ease: "power2.out"
//       },
//       textFadeOutStart
//     );
//   }

//   // ===== NEW TEXT APPEARS: "It's where you learn to make the world stop and notice your designs" =====
//   const newTextStart = transitionStart + 3.2;

//   if (refs.text2) {
//     // Set initial state for new text
//     tl.set(refs.text2, { opacity: 1, y: 0 }, newTextStart);

//     const spans2 = Array.from(refs.text2.querySelectorAll("span[data-text2]"));

//     // Set all spans to start at 0.3 opacity
//     spans2.forEach((span) => {
//       gsap.set(span, {
//         opacity: 0.3,
//         color: "rgb(0, 0, 0)",
//         willChange: "opacity"
//       });
//     });

//     // Find the index where "stop" appears
//     let stopIndex = -1;
//     spans2.forEach((span, idx) => {
//       if (span.textContent.includes("stop")) {
//         stopIndex = idx;
//       }
//     });

//     const firstPhaseEnd2 = stopIndex >= 0 ? stopIndex : 7; // Up to and including "stop"

//     // PHASE 1: Animate words up to "stop" (fade to full opacity)
//     spans2.forEach((span, idx) => {
//       if (idx <= firstPhaseEnd2) {
//         tl.to(
//           span,
//           {
//             opacity: 1,
//             duration: 0.4,
//             ease: "power2.out"
//           },
//           newTextStart + idx * 0.35
//         );
//       }
//     });

//     // Calculate when "stop" animation completes
//     const stopAnimationEnd = newTextStart + firstPhaseEnd2 * 0.35 + 0.4;
//     // Eyes follow the same position as their parent elements during slide-in
//     // Set initial states to match parent elements
//     // Eyes follow the same position as their parent elements during slide-in
//     // Set initial states to match parent elements (they start off-screen like base elements)
//     tl.set(
//       refs.leftElementEye,
//       {
//         opacity: 0,
//         scale: 1, // Start at normal scale
//         x: 0, // No x offset initially
//         y: 0, // No y offset initially
//         willChange: "transform, opacity"
//       },
//       stopAnimationEnd
//     );

//     tl.set(
//       refs.rightElementEye,
//       {
//         opacity: 0,
//         scale: 1, // Start at normal scale
//         x: 0, // No x offset initially
//         y: 0, // No y offset initially
//         willChange: "transform, opacity"
//       },
//       stopAnimationEnd
//     );

//     // Eyes slide in with same timing and position as base elements
//     if (isMobile) {
//       // Mobile: Left eye - animate to same position as left element
//       tl.to(
//         refs.leftElementEye,
//         {
//           y: "8vh",
//           left: "-5%",
//           scale: 1, // Normal size for mobile left
//           duration: 1.2,
//           ease: "power2.in"
//         },
//         stopAnimationEnd
//       );

//       // Mobile: Right eye - animate to same position as right element (bigger)
//       tl.to(
//         refs.rightElementEye,
//         {
//           y: "15vh",
//           right: "-5%",
//           scale: 1.5, // Bigger than left
//           duration: 1.2,
//           ease: "power2.in"
//         },
//         stopAnimationEnd
//       );
//     } else {
//       // Desktop: Both eyes same size and position
//       tl.to(
//         refs.leftElementEye,
//         {
//           y: "20vh",
//           left: "-2.5%",
//           scale: 1.2,
//           duration: 1.2,
//           ease: "power2.in"
//         },
//         stopAnimationEnd
//       );

//       tl.to(
//         refs.rightElementEye,
//         {
//           y: "20vh",
//           right: "-2.5%",
//           scale: 1.2,
//           duration: 1.2,
//           ease: "power2.in"
//         },
//         stopAnimationEnd
//       );
//     }

//     // After elements reach position, eyes fade in (opening effect)
//     const eyesOpenStart = stopAnimationEnd + 1.2;

//     tl.to(
//       [refs.leftElementEye, refs.rightElementEye],
//       {
//         opacity: 1,
//         duration: 0.6,
//         ease: "power2.out"
//       },
//       eyesOpenStart
//     );

//     // ===== LEFT AND RIGHT ELEMENTS SLIDE DOWN =====
//     // Elements slide down with ease in motion
//     // tl.to(
//     //   refs.leftElement,
//     //   {
//     //     y: "50vh", // Move down
//     //     left: 0, // Place at left edge
//     //     duration: 1.2,
//     //     ease: "power2.in"
//     //   },
//     //   stopAnimationEnd
//     // );

//     // tl.to(
//     //   refs.rightElement,
//     //   {
//     //     y: "50vh", // Move down
//     //     right: 0, // Place at right edge
//     //     duration: 1.2,
//     //     ease: "power2.in"
//     //   },
//     //   stopAnimationEnd
//     // );

//     // ===== LEFT AND RIGHT ELEMENTS SLIDE DOWN =====
//     // Elements slide down with ease in motion
//     // if (isMobile) {
//     //   // Mobile: Left element - less downward movement, 90% visible
//     //   tl.to(
//     //     refs.leftElement,
//     //     {
//     //       y: "15vh", // Less downward movement
//     //       left: "-5%", // Show 90% inside screen
//     //       scale: 1, // Normal size
//     //       duration: 1.2,
//     //       ease: "power2.in"
//     //     },
//     //     stopAnimationEnd
//     //   );

//     //   // Mobile: Right element - more downward movement, bigger, 90% visible
//     //   tl.to(
//     //     refs.rightElement,
//     //     {
//     //       y: "35vh", // More downward movement
//     //       right: "-5%", // Show 90% inside screen
//     //       scale: 1.15, // Bigger than left
//     //       duration: 1.2,
//     //       ease: "power2.in"
//     //     },
//     //     stopAnimationEnd
//     //   );
//     // } else {
//     //   // Desktop: Less downward movement, bigger size, 90% visible
//     //   tl.to(
//     //     refs.leftElement,
//     //     {
//     //       y: "10vh", // Less downward movement
//     //       left: "-5%", // Show 90% inside screen
//     //       scale: 1.2, // Bigger for desktop
//     //       duration: 1.2,
//     //       ease: "power2.in"
//     //     },
//     //     stopAnimationEnd
//     //   );

//     //   tl.to(
//     //     refs.rightElement,
//     //     {
//     //       y: "10vh", // Less downward movement
//     //       right: "-5%", // Show 90% inside screen
//     //       scale: 1.2, // Bigger for desktop
//     //       duration: 1.2,
//     //       ease: "power2.in"
//     //     },
//     //     stopAnimationEnd
//     //   );
//     // }

//     // ===== ORBIT MOVES TO CENTER AFTER ELEMENTS REACH POSITION =====
//     // const orbitToCenterStart = stopAnimationEnd + 1.2;
//     // tl.to(
//     //   refs.biggerOrbit,
//     //   {
//     //     y: isMobile ? -100 : -150, // Move to center
//     //     duration: 1.0,
//     //     ease: "power2.out"
//     //   },
//     //   orbitToCenterStart
//     // );

//     // ===== ORBIT MOVES TO CENTER AFTER ELEMENTS REACH POSITION =====

//     // }
//     if (isMobile) {
//       // Mobile: Left element - minimal downward movement, 90% visible
//       tl.to(
//         refs.leftElement,
//         {
//           y: "8vh", // Reduced downward movement (was 15vh)
//           left: "-5%", // Show 90% inside screen
//           scale: 1, // Normal size
//           duration: 1.2,
//           ease: "power2.in"
//         },
//         stopAnimationEnd
//       );

//       // Mobile: Right element - moderate downward movement, bigger, 90% visible
//       tl.to(
//         refs.rightElement,
//         {
//           y: "15vh", // Reduced downward movement (was 35vh)
//           right: "-5%", // Show 90% inside screen
//           scale: 1.5, // Bigger than left
//           duration: 1.2,
//           ease: "power2.in"
//         },
//         stopAnimationEnd
//       );
//     } else {
//       // Desktop: More downward, closer together, 95% visible
//       tl.to(
//         refs.leftElement,
//         {
//           y: "20vh", // More downward movement
//           left: "-2.5%", // Closer, show 95% inside screen
//           scale: 1.2, // Bigger for desktop
//           duration: 1.2,
//           ease: "power2.in"
//         },
//         stopAnimationEnd
//       );

//       tl.to(
//         refs.rightElement,
//         {
//           y: "20vh", // More downward movement
//           right: "-2.5%", // Closer, show 95% inside screen
//           scale: 1.2, // Bigger for desktop
//           duration: 1.2,
//           ease: "power2.in"
//         },
//         stopAnimationEnd
//       );
//     }
//     const orbitToCenterStart = stopAnimationEnd + 1.2;
//     tl.to(
//       refs.biggerOrbit,
//       {
//         y: isMobile ? -100 : -150, // Move to center
//         scale: isMobile ? 2.3 : 1, // Maintain bigger scale for mobile
//         // scale: orbitScale, // Maintain bigger scale for mobile
//         duration: 1.0,
//         ease: "power2.out"
//       },
//       orbitToCenterStart
//     );

//     // PHASE 2: Animate remaining words after orbit reaches center
//     spans2.forEach((span, idx) => {
//       if (idx > firstPhaseEnd2) {
//         const relativeIdx = idx - firstPhaseEnd2 - 1;
//         tl.to(
//           span,
//           {
//             opacity: 1,
//             duration: 0.4,
//             ease: "power2.out"
//           },
//           orbitToCenterStart + relativeIdx * 0.35
//         );
//       }
//     });
//   }

//   // Clear will-change at the end for performance
//   tl.set(
//     [
//       refs.rightCloud,
//       refs.leftCloud,
//       refs.floor,
//       refs.leftElement,
//       refs.rightElement
//     ],
//     { willChange: "auto" },
//     "+=0.5"
//   );
//   tl.set(refs.text, { willChange: "auto" }, "+=0");
//   tl.set(refs.text2, { willChange: "auto" }, "+=0");
//   tl.set(refs.objectsContainer, { willChange: "auto" }, "+=0");
//   tl.set(
//     [refs.object1, refs.object2, refs.object3],
//     { willChange: "auto" },
//     "+=0"
//   );
//   tl.set(refs.ellipse, { willChange: "auto" }, "+=0");
//   tl.set(refs.biggerOrbit, { willChange: "auto" }, "+=0");

//   return tl;
// };

// // Main Scene Component
// const Scene1_1 = React.forwardRef((props, ref) => {
//   const { isMobile } = props;

//   // Main refs
//   const containerRef = useRef(null);
//   const bgRef = useRef(null);
//   const rightCloudRef = useRef(null);
//   const leftCloudRef = useRef(null);
//   const floorRef = useRef(null);
//   const leftElementRef = useRef(null);
//   const rightElementRef = useRef(null);

//   // Text and animation refs
//   const textRef = useRef(null);
//   const text2Ref = useRef(null); // New text ref
//   const object1Ref = useRef(null);
//   const object2Ref = useRef(null);
//   const object3Ref = useRef(null);
//   const leftElementEyeRef = useRef(null); // ADD THIS
//   const rightElementEyeRef = useRef(null); // ADD THIS
//   const ellipseRef = useRef(null);
//   const objectsContainerRef = useRef(null);
//   const biggerOrbitRef = useRef(null);

//   // Expose refs to parent
//   React.useImperativeHandle(ref, () => ({
//     container: containerRef.current,
//     bg: bgRef.current,
//     rightCloud: rightCloudRef.current,
//     leftCloud: leftCloudRef.current,
//     floor: floorRef.current,
//     leftElement: leftElementRef.current,
//     rightElement: rightElementRef.current,
//     leftElementEye: leftElementEyeRef.current, // ADD THIS
//     rightElementEye: rightElementEyeRef.current, // ADD THIS
//     text: textRef.current,
//     text2: text2Ref.current, // Expose new text ref
//     objectsContainer: objectsContainerRef.current,
//     object1: object1Ref.current,
//     object2: object2Ref.current,
//     object3: object3Ref.current,
//     ellipse: ellipseRef.current,
//     biggerOrbit: biggerOrbitRef.current
//   }));

//   useEffect(() => {
//     const handleScroll = () => {
//       if (biggerOrbitRef.current) {
//         const scrollY = window.scrollY;
//         const rotationAmount = scrollY * 0.1; // Adjust multiplier for rotation speed

//         gsap.to(biggerOrbitRef.current, {
//           rotation: -rotationAmount,
//           duration: 0.1,
//           ease: "none"
//         });
//       }
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const objectSize = isMobile ? 44 : 70;
//   const mobileObjGap = isMobile ? 8 : 24;

//   return (
//     <section
//       ref={containerRef}
//       className="relative w-full h-screen overflow-hidden"
//     >
//       {/* Background */}
//       <img
//         ref={bgRef}
//         src={isMobile ? yellow_bg_mobile : yellow_bg}
//         alt="yellow background"
//         className="absolute inset-0 w-full h-full object-cover z-[1]"
//       />

//       {/* Right Cloud */}
//       <img
//         ref={rightCloudRef}
//         src={isMobile ? right_cloud_mobile : right_cloud}
//         alt="right cloud"
//         className="absolute right-0 z-[15]"
//         style={{
//           top: isMobile ? "6vh" : "3vh",
//           width: isMobile ? "38vw" : "20vw",
//           height: "auto"
//         }}
//       />

//       {/* Left Cloud */}
//       <img
//         ref={leftCloudRef}
//         src={isMobile ? left_cloud_mobile : left_cloud}
//         alt="left cloud"
//         className="absolute left-0 z-[15]"
//         style={{
//           top: isMobile ? "12vh" : "5vh",
//           width: isMobile ? "38vw" : "22vw",
//           height: "auto"
//         }}
//       />

//       {/* Floor */}
//       <img
//         ref={floorRef}
//         src={isMobile ? floor_2nd_mobile : floor_2nd}
//         alt="floor"
//         className="absolute left-1/2 -translate-x-1/2 z-[10]"
//         style={{
//           bottom: 0,
//           height: isMobile ? "20vh" : "28vh",
//           width: "100%",
//           objectFit: "cover"
//         }}
//       />

//       {/* Left Element */}
//       <img
//         ref={leftElementRef}
//         src={isMobile ? left_element_mobile : left_element}
//         alt="left element"
//         className="absolute z-[11] pointer-events-none"
//         style={{
//           top: isMobile ? "54%" : "52%",
//           left: isMobile ? "-40%" : "-30%",
//           transform: "translateY(-50%)",
//           width: isMobile ? "60vw" : "50vw",
//           height: "auto"
//         }}
//       />

//       {/* Right Element */}
//       <img
//         ref={rightElementRef}
//         src={isMobile ? right_element_mobile : right_element}
//         alt="right element"
//         className="absolute z-[11] pointer-events-none"
//         style={{
//           top: isMobile ? "54%" : "52%",
//           right: isMobile ? "-40%" : "-30%",
//           transform: "translateY(-50%)",
//           width: isMobile ? "60vw" : "50vw",
//           height: "auto"
//         }}
//       />

//       {/* Left Element Eye - Same position as left element */}
//       <img
//         ref={leftElementEyeRef}
//         src={isMobile ? left_element_eye_mobile : left_element_eye}
//         alt="left element eye"
//         className="absolute z-[12] pointer-events-none"
//         style={{
//           top: isMobile ? "54%" : "52%",
//           left: isMobile ? "-40%" : "-30%",
//           transform: "translateY(-50%)",
//           width: isMobile ? "60vw" : "50vw",
//           height: "auto",
//           opacity: 0
//         }}
//       />

//       {/* Right Element Eye - Same position as right element */}
//       <img
//         ref={rightElementEyeRef}
//         src={isMobile ? right_element_eye_mobile : right_element_eye}
//         alt="right element eye"
//         className="absolute z-[12] pointer-events-none"
//         style={{
//           top: isMobile ? "54%" : "52%",
//           right: isMobile ? "-40%" : "-30%",
//           transform: "translateY(-50%)",
//           width: isMobile ? "60vw" : "50vw",
//           height: "auto",
//           opacity: 0
//         }}
//       />

//       {/* BIGGER ORBIT - Behind floor, starts at 20% scale, half visible */}
//       <img
//         ref={biggerOrbitRef}
//         src={isMobile ? bigger_orbit_mobile : bigger_orbit}
//         alt="bigger orbit"
//         className="absolute left-1/2 -translate-x-1/2 z-[9] pointer-events-none"
//         style={{
//           bottom: isMobile ? "-2vh" : "-60vh",
//           width: isMobile ? "100%" : "80vw",
//           height: "auto",
//           opacity: 0,
//           transformOrigin: "center center"
//         }}
//       />

//       {/* YELLOW ELLIPSE - Lower z-index so objects are visible on top */}
//       <img
//         ref={ellipseRef}
//         src={isMobile ? yellow_ellipse_mobile : yellow_ellipse}
//         alt="yellow ellipse"
//         className="absolute left-1/2 -translate-x-1/2 z-[14] pointer-events-none"
//         style={{
//           bottom: isMobile ? "9vh" : "5vh",
//           width: isMobile ? "300px" : "560px",
//           height: "auto",
//           opacity: 0,
//           transformOrigin: "center"
//         }}
//       />

//       {/* FALLING OBJECTS CONTAINER - Higher z-index so they appear above ellipse */}
//       <div
//         ref={objectsContainerRef}
//         className="absolute left-1/2 z-[15] pointer-events-none"
//         style={{
//           top: isMobile ? "65%" : "50%",
//           transform: "translate(-50%, -50%)",
//           opacity: 0
//         }}
//       >
//         {isMobile ? (
//           <div
//             className="flex flex-col items-center justify-center"
//             style={{ rowGap: mobileObjGap }}
//           >
//             <img
//               ref={object1Ref}
//               src={object_1}
//               alt="object 1"
//               style={{
//                 width: `${objectSize}px`,
//                 height: "auto"
//               }}
//             />
//             <img
//               ref={object2Ref}
//               src={object_2}
//               alt="object 2"
//               style={{
//                 width: `${objectSize}px`,
//                 height: "auto"
//               }}
//             />
//             <img
//               ref={object3Ref}
//               src={object_1}
//               alt="object 3"
//               style={{
//                 width: `${objectSize}px`,
//                 height: "auto"
//               }}
//             />
//           </div>
//         ) : (
//           <div className="flex gap-24 items-center justify-center">
//             <img
//               ref={object1Ref}
//               src={object_1}
//               alt="object 1"
//               style={{
//                 width: `${objectSize}px`,
//                 height: "auto"
//               }}
//             />
//             <img
//               ref={object2Ref}
//               src={object_2}
//               alt="object 2"
//               style={{
//                 width: `${objectSize}px`,
//                 height: "auto"
//               }}
//             />
//             <img
//               ref={object3Ref}
//               src={object_1}
//               alt="object 3"
//               style={{
//                 width: `${objectSize}px`,
//                 height: "auto"
//               }}
//             />
//           </div>
//         )}
//       </div>

//       {/* TEXT */}
//       <div
//         ref={textRef}
//         className="absolute left-1/2 -translate-x-1/2 z-[20] text-center font-extrabold"
//         style={{
//           top: isMobile ? "24%" : "26%",
//           fontSize: isMobile ? "2.2rem" : "48px",
//           lineHeight: "1.2",
//           maxWidth: isMobile ? "100%" : "80%",
//           width: isMobile ? "92vw" : "80%",
//           opacity: 0,
//           color: "rgb(0, 0, 0)"
//         }}
//       >
//         {isMobile ? (
//           <>
//             <div>
//               <span data-text="first" style={{ color: "rgb(0, 0, 0)" }}>
//                 Here,{" "}
//               </span>
//               <span data-text="first" style={{ color: "rgb(0, 0, 0)" }}>
//                 you'll{" "}
//               </span>
//             </div>
//             <div>
//               <span data-text="first" style={{ color: "rgb(0, 0, 0)" }}>
//                 find{" "}
//               </span>
//               <span data-text="first" style={{ color: "rgb(0, 0, 0)" }}>
//                 mentors,
//               </span>
//             </div>
//             <div>
//               <span data-text="first" style={{ color: "rgb(0, 0, 0)" }}>
//                 misfits,{" "}
//               </span>
//               <span data-text="last" style={{ color: "rgb(0, 0, 0)" }}>
//                 and
//               </span>
//             </div>
//             <div>
//               <span data-text="last" style={{ color: "rgb(0, 0, 0)" }}>
//                 midnight{" "}
//               </span>
//               <span data-text="last" style={{ color: "rgb(0, 0, 0)" }}>
//                 breakthroughs.
//               </span>
//             </div>
//           </>
//         ) : (
//           <>
//             <div>
//               <span data-text="first" style={{ color: "rgb(0, 0, 0)" }}>
//                 Here,{" "}
//               </span>
//               <span data-text="first" style={{ color: "rgb(0, 0, 0)" }}>
//                 you'll{" "}
//               </span>
//               <span data-text="first" style={{ color: "rgb(0, 0, 0)" }}>
//                 find{" "}
//               </span>
//               <span data-text="first" style={{ color: "rgb(0, 0, 0)" }}>
//                 mentors,{" "}
//               </span>
//               <span data-text="first" style={{ color: "rgb(0, 0, 0)" }}>
//                 misfits,
//               </span>
//             </div>
//             <div>
//               <span data-text="last" style={{ color: "rgb(0, 0, 0)" }}>
//                 and{" "}
//               </span>
//               <span data-text="last" style={{ color: "rgb(0, 0, 0)" }}>
//                 midnight{" "}
//               </span>
//               <span data-text="last" style={{ color: "rgb(0, 0, 0)" }}>
//                 breakthroughs.
//               </span>
//             </div>
//           </>
//         )}
//       </div>

//       {/* SECOND TEXT */}
//       <div
//         ref={text2Ref}
//         className="absolute left-1/2 -translate-x-1/2 z-[20] text-center font-extrabold"
//         style={{
//           top: isMobile ? "24%" : "26%",
//           fontSize: isMobile ? "2.2rem" : "48px",
//           lineHeight: "1.2",
//           maxWidth: isMobile ? "100%" : "80%",
//           width: isMobile ? "92vw" : "80%",
//           opacity: 0,
//           color: "rgb(0, 0, 0)"
//         }}
//       >
//         {isMobile ? (
//           <>
//             <div>
//               <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
//                 It's{" "}
//               </span>
//               <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
//                 where{" "}
//               </span>
//               <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
//                 you
//               </span>
//             </div>
//             <div>
//               <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
//                 learn{" "}
//               </span>
//               <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
//                 to{" "}
//               </span>
//               <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
//                 make
//               </span>
//             </div>
//             <div>
//               <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
//                 the{" "}
//               </span>
//               <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
//                 world{" "}
//               </span>
//               <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
//                 stop
//               </span>
//             </div>
//             <div>
//               <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
//                 and{" "}
//               </span>
//               <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
//                 notice{" "}
//               </span>
//               <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
//                 your
//               </span>
//             </div>
//             <div>
//               <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
//                 designs.
//               </span>
//             </div>
//           </>
//         ) : (
//           <>
//             <div>
//               <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
//                 It's{" "}
//               </span>
//               <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
//                 where{" "}
//               </span>
//               <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
//                 you{" "}
//               </span>
//               <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
//                 learn{" "}
//               </span>
//               <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
//                 to{" "}
//               </span>
//               <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
//                 make{" "}
//               </span>
//               <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
//                 the{" "}
//               </span>
//               <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
//                 world{" "}
//               </span>
//               <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
//                 stop
//               </span>
//             </div>
//             <div>
//               <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
//                 and{" "}
//               </span>
//               <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
//                 notice{" "}
//               </span>
//               <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
//                 your{" "}
//               </span>
//               <span data-text2 style={{ color: "rgb(0, 0, 0)" }}>
//                 designs.
//               </span>
//             </div>
//           </>
//         )}
//       </div>
//     </section>
//   );
// });

// Scene1_1.displayName = "Scene1_1";
// export default Scene1_1;

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
  pink_bigger_orbit_mobile // ADD THIS
} from "../../assets/images/Home";

// Timeline hook for Scene1_1 animation - works with master timeline
export const useScene1_1Timeline = (refs, isMobile) => {
  const tl = gsap.timeline();

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
      scale: 0,
      opacity: 0,
      duration: 0.8,
      ease: "power2.in"
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
    transitionStart + 0.8
  );

  // 3. Bigger orbit scales up but stays BEFORE center (happens after floor starts disappearing)
  // const orbitBeforeCenterY = isMobile ? -50 : -80; // Not fully centered yet
  // tl.to(
  //   refs.biggerOrbit,
  //   {
  //     scale: 1,
  //     y: orbitBeforeCenterY,
  //     opacity: 1,
  //     duration: 1.8,
  //     ease: "power2.out"
  //   },
  //   transitionStart + 1.0
  // );

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
      // Mobile: Left eye - animate to same position as left element
      tl.to(
        refs.leftElementEye,
        {
          y: "8vh",
          left: "-5%",
          scale: 1, // Normal size for mobile left
          duration: 1.2,
          ease: "power2.in"
        },
        stopAnimationEnd
      );

      // Mobile: Right eye - animate to same position as right element (bigger)
      tl.to(
        refs.rightElementEye,
        {
          y: "15vh",
          right: "-5%",
          scale: 1.5, // Bigger than left
          duration: 1.2,
          ease: "power2.in"
        },
        stopAnimationEnd
      );
    } else {
      // Desktop: Both eyes same size and position
      tl.to(
        refs.leftElementEye,
        {
          y: "20vh",
          left: "-2.5%",
          scale: 1.2,
          duration: 1.2,
          ease: "power2.in"
        },
        stopAnimationEnd
      );

      tl.to(
        refs.rightElementEye,
        {
          y: "20vh",
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
        y: isMobile ? -100 : -150,
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

    // // ADD THIS SECTION - Elements disappear and orbit moves up
    // const elementsDisappearStart = pinkOrbitTransitionStart + 1.0;

    // // Fade out both base elements and eye elements
    // tl.to(
    //   [refs.leftElement, refs.leftElementEye],
    //   {
    //     opacity: 0,
    //     duration: 0.8,
    //     ease: "power2.inOut"
    //   },
    //   elementsDisappearStart
    // );

    // tl.to(
    //   [refs.rightElement, refs.rightElementEye],
    //   {
    //     opacity: 0,
    //     duration: 0.8,
    //     ease: "power2.inOut"
    //   },
    //   elementsDisappearStart
    // );

    // // Fade out second text along with elements (ADD THIS)
    // tl.to(
    //   refs.text2,
    //   {
    //     opacity: 0,
    //     duration: 0.8,
    //     ease: "power2.inOut"
    //   },
    //   elementsDisappearStart
    // );

    // // Pink orbit moves up a bit
    // const orbitMoveUpStart = elementsDisappearStart + 0.8;
    // tl.to(
    //   refs.pinkBiggerOrbit,
    //   {
    //     y: isMobile ? -150 : -200, // Move up more (was -100/-150)
    //     duration: 1.2,
    //     ease: "power2.out"
    //   },
    //   orbitMoveUpStart
    // );

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
        stopAnimationEnd
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
        stopAnimationEnd
      );
    } else {
      // Desktop: More downward, closer together, 95% visible
      tl.to(
        refs.leftElement,
        {
          y: "20vh", // More downward movement
          left: "-2.5%", // Closer, show 95% inside screen
          scale: 1.2, // Bigger for desktop
          duration: 1.2,
          ease: "power2.in"
        },
        stopAnimationEnd
      );

      tl.to(
        refs.rightElement,
        {
          y: "20vh", // More downward movement
          right: "-2.5%", // Closer, show 95% inside screen
          scale: 1.2, // Bigger for desktop
          duration: 1.2,
          ease: "power2.in"
        },
        stopAnimationEnd
      );
    }
    const orbitToCenterStart = stopAnimationEnd + 1.2;
    tl.to(
      refs.biggerOrbit,
      {
        y: isMobile ? -100 : -150, // Move to center
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
  const object1Ref = useRef(null);
  const object2Ref = useRef(null);
  const object3Ref = useRef(null);
  const leftElementEyeRef = useRef(null); // ADD THIS
  const rightElementEyeRef = useRef(null); // ADD THIS
  const ellipseRef = useRef(null);
  const objectsContainerRef = useRef(null);
  const biggerOrbitRef = useRef(null);
  const pinkBiggerOrbitRef = useRef(null); // ADD THIS

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
    objectsContainer: objectsContainerRef.current,
    object1: object1Ref.current,
    object2: object2Ref.current,
    object3: object3Ref.current,
    ellipse: ellipseRef.current,
    biggerOrbit: biggerOrbitRef.current,
    pinkBiggerOrbit: pinkBiggerOrbitRef.current // ADD THIS
  }));

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const rotationAmount = scrollY * 0.1;

      // Rotate both orbits with the same rotation value
      if (biggerOrbitRef.current) {
        gsap.set(biggerOrbitRef.current, {
          rotation: -rotationAmount
        });
      }

      if (pinkBiggerOrbitRef.current) {
        gsap.set(pinkBiggerOrbitRef.current, {
          rotation: -rotationAmount
        });
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Initial call to sync rotation
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const objectSize = isMobile ? 44 : 70;
  const mobileObjGap = isMobile ? 8 : 24;

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden"
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
          top: isMobile ? "54%" : "52%",
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
          top: isMobile ? "54%" : "52%",
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
          top: isMobile ? "54%" : "52%",
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
          top: isMobile ? "54%" : "52%",
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

      {/* PINK BIGGER ORBIT - Same position as yellow orbit */}
      <img
        ref={pinkBiggerOrbitRef}
        src={isMobile ? pink_bigger_orbit_mobile : pink_bigger_orbit}
        alt="pink bigger orbit"
        className="absolute left-1/2 -translate-x-1/2 z-[9] pointer-events-none"
        style={{
          bottom: isMobile ? "-2vh" : "-60vh",
          width: isMobile ? "100%" : "80vw",
          height: "auto",
          opacity: 0,
          transformOrigin: "center center"
        }}
      />

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
          fontSize: isMobile ? "2.2rem" : "48px",
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
          fontSize: isMobile ? "2.2rem" : "48px",
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
    </section>
  );
});

Scene1_1.displayName = "Scene1_1";
export default Scene1_1;
