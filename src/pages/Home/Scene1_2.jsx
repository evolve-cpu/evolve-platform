// import React, { useRef } from "react";
// import { gsap } from "gsap";
// import { vector, vector_mobile } from "../../assets/images/Home";
// import ThreeDoorsWithRibbon from "../../components/ThreeDoorsWithRibbon";
// import ThreeDoorsWithRibbonDiamondMountains from "../../components/ThreeDoorsWithRibbonDiamondMountains";
// import ThreeDoorsWithRibbonMountainsEye from "../../components/ThreeDoorsWithRibbonMountainsEye";

// // Timeline hook for Scene1_2 animation - works with master timeline
// export const useScene1_2Timeline = (refs, isMobile) => {
//   const tl = gsap.timeline();

//   // Set initial states
//   tl.set(
//     [
//       refs.vector,
//       refs.topText,
//       refs.mainText,
//       refs.noShortcutsText,
//       refs.mentorsText,
//       refs.doorsWithRibbon,
//       refs.doorsComplete,
//       refs.doorsFinal
//     ],
//     {
//       opacity: 0,
//       willChange: "transform, opacity"
//     }
//   );

//   // Make vector visible immediately
//   tl.set(refs.vector, { opacity: 1 }, 0);

//   tl.set(refs.topText, { y: -20 });
//   tl.set(refs.mainText, { y: 20 });

//   // Initial appearance - Texts appear
//   tl.to(
//     refs.topText,
//     {
//       opacity: 1,
//       y: 0,
//       duration: 0.8,
//       ease: "power2.out"
//     },
//     0
//   );

//   tl.to(
//     refs.mainText,
//     {
//       opacity: 1,
//       y: 0,
//       duration: 0.8,
//       ease: "power2.out"
//     },
//     0.2
//   );

//   // Show ThreeDoorsWithRibbon at bottom
//   tl.to(
//     refs.doorsWithRibbon,
//     {
//       opacity: 1,
//       duration: 0.8,
//       ease: "power2.out"
//     },
//     0.4
//   );

//   // SECOND SCROLL: Text change and doors swap
//   tl.add("secondScroll", "+=0.5");

//   // Fade out "three levels"
//   tl.to(
//     refs.mainText,
//     {
//       opacity: 0,
//       duration: 0.4,
//       ease: "power2.inOut"
//     },
//     "secondScroll"
//   );

//   // Fade in "no shortcuts"
//   tl.to(
//     refs.noShortcutsText,
//     {
//       opacity: 1,
//       duration: 0.4,
//       ease: "power2.inOut"
//     },
//     "secondScroll+=0.4"
//   );

//   // Instantly swap doors (0 duration)
//   tl.set(refs.doorsWithRibbon, { opacity: 0 }, "secondScroll+=0.4");
//   tl.set(refs.doorsComplete, { opacity: 1 }, "secondScroll+=0.4");

//   // THIRD SCROLL: Text change and final doors swap
//   tl.add("thirdScroll", "+=0.5");

//   // Fade out "no shortcuts"
//   tl.to(
//     refs.noShortcutsText,
//     {
//       opacity: 0,
//       duration: 0.4,
//       ease: "power2.inOut"
//     },
//     "thirdScroll"
//   );

//   // Fade in "mentors who push your limits"
//   tl.to(
//     refs.mentorsText,
//     {
//       opacity: 1,
//       duration: 0.4,
//       ease: "power2.inOut"
//     },
//     "thirdScroll+=0.4"
//   );

//   // Instantly swap doors to final state
//   tl.set(refs.doorsComplete, { opacity: 0 }, "thirdScroll+=0.4");
//   tl.set(refs.doorsFinal, { opacity: 1 }, "thirdScroll+=0.4");

//   // Clear will-change
//   tl.set(
//     [
//       refs.topText,
//       refs.mainText,
//       refs.noShortcutsText,
//       refs.mentorsText,
//       refs.doorsWithRibbon,
//       refs.doorsComplete,
//       refs.doorsFinal
//     ],
//     {
//       willChange: "auto"
//     },
//     "+=0.5"
//   );

//   return tl;
// };

// // Main Scene Component
// const Scene1_2 = React.forwardRef((props, ref) => {
//   const { isMobile } = props;

//   // Main refs
//   const containerRef = useRef(null);
//   const vectorRef = useRef(null);
//   const topTextRef = useRef(null);
//   const mainTextRef = useRef(null);
//   const noShortcutsTextRef = useRef(null);
//   const mentorsTextRef = useRef(null);
//   const doorsWithRibbonRef = useRef(null);
//   const doorsCompleteRef = useRef(null);
//   const doorsFinalRef = useRef(null);

//   // Expose refs to parent
//   React.useImperativeHandle(ref, () => ({
//     container: containerRef.current,
//     vector: vectorRef.current,
//     topText: topTextRef.current,
//     mainText: mainTextRef.current,
//     noShortcutsText: noShortcutsTextRef.current,
//     mentorsText: mentorsTextRef.current,
//     doorsWithRibbon: doorsWithRibbonRef.current,
//     doorsComplete: doorsCompleteRef.current,
//     doorsFinal: doorsFinalRef.current
//   }));

//   return (
//     <section
//       ref={containerRef}
//       className="relative w-full h-screen overflow-hidden bg-evolve-lavender-indigo"
//     >
//       {/* Top Text Section */}
//       <div
//         className="absolute left-0 right-0 text-center z-20"
//         style={{ top: "10%" }}
//       >
//         <p
//           ref={topTextRef}
//           className="text-white font-extrabold mb-4 px-4 lowercase"
//           style={{
//             fontSize: isMobile ? "24px" : "32px",
//             opacity: 0,
//             lineHeight: 1
//           }}
//         >
//           the toolkit gets you started. the course is where it gets serious:
//         </p>

//         {/* Container for overlapping text elements */}
//         <div
//           className="relative"
//           style={{ height: isMobile ? "48px" : "96px" }}
//         >
//           {/* "three levels" text */}
//           <h2
//             ref={mainTextRef}
//             className="text-white font-extrabold px-4 lowercase absolute left-0 right-0"
//             style={{
//               fontSize: isMobile ? "48px" : "96px",
//               opacity: 0,
//               top: 0,
//               lineHeight: 1
//             }}
//           >
//             three levels
//           </h2>

//           {/* "no shortcuts" text */}
//           <h2
//             ref={noShortcutsTextRef}
//             className="text-white font-extrabold px-4 lowercase absolute left-0 right-0"
//             style={{
//               fontSize: isMobile ? "48px" : "96px",
//               opacity: 0,
//               top: 0,
//               lineHeight: 1
//             }}
//           >
//             no shortcuts
//           </h2>

//           {/* "mentors who push your limits" text */}
//           <h2
//             ref={mentorsTextRef}
//             className="text-white font-extrabold px-4 lowercase absolute left-0 right-0"
//             style={{
//               fontSize: isMobile ? "48px" : "96px",
//               opacity: 0,
//               top: 0,
//               lineHeight: 1
//             }}
//           >
//             mentors who push your limits
//           </h2>
//         </div>
//       </div>

//       {/* ThreeDoorsWithRibbon - First state */}
//       <div
//         ref={doorsWithRibbonRef}
//         className="absolute left-1/2 z-10"
//         style={{
//           bottom: 0,
//           opacity: 0,
//           transform: isMobile
//             ? "translateX(-50%) scale(0.6)"
//             : "translateX(-50%) scale(0.8)",
//           transformOrigin: "bottom center"
//         }}
//       >
//         <ThreeDoorsWithRibbon />
//       </div>

//       {/* ThreeDoorsWithRibbonDiamondMountains - Second state */}
//       <div
//         ref={doorsCompleteRef}
//         className="absolute left-1/2 z-11"
//         style={{
//           bottom: 0,
//           opacity: 0,
//           transform: isMobile
//             ? "translateX(-50%) scale(0.6)"
//             : "translateX(-50%) scale(0.8)",
//           transformOrigin: "bottom center"
//         }}
//       >
//         <ThreeDoorsWithRibbonDiamondMountains />
//       </div>

//       {/* ThreeDoorsWithRibbonMountainsEye - Third state (final) */}
//       <div
//         ref={doorsFinalRef}
//         className="absolute left-1/2 z-12"
//         style={{
//           bottom: 0,
//           opacity: 0,
//           transform: isMobile
//             ? "translateX(-50%) scale(0.6)"
//             : "translateX(-50%) scale(0.8)",
//           transformOrigin: "bottom center"
//         }}
//       >
//         <ThreeDoorsWithRibbonMountainsEye />
//       </div>

//       {/* Vector at bottom */}
//       <img
//         ref={vectorRef}
//         src={isMobile ? vector_mobile : vector}
//         alt="vector"
//         className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
//         style={{
//           bottom: 0,
//           width: "100%",
//           height: "auto",
//           opacity: 1,
//           zIndex: 9
//         }}
//       />
//     </section>
//   );
// });

// Scene1_2.displayName = "Scene1_2";
// export default Scene1_2;

import React, { useRef } from "react";
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
  rays_mobile
} from "../../assets/images/Home";
import ThreeDoorsWithRibbon from "../../components/ThreeDoorsWithRibbon";
import ThreeDoorsWithRibbonDiamondMountains from "../../components/ThreeDoorsWithRibbonDiamondMountains";
import ThreeDoorsWithRibbonMountainsEye from "../../components/ThreeDoorsWithRibbonMountainsEye";

// Timeline hook for Scene1_2 animation - works with master timeline
export const useScene1_2Timeline = (refs, isMobile) => {
  const tl = gsap.timeline();

  // Set initial states
  tl.set(
    [
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
      refs.rightHand
    ],
    {
      opacity: 0,
      willChange: "transform, opacity"
    }
  );

  // Make initial vector visible
  tl.set(refs.vector, { opacity: 1 }, 0);
  tl.set(refs.topText, { y: -20 });
  tl.set(refs.mainText, { y: 20 });

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
  tl.to(
    refs.doorsWithRibbon,
    {
      opacity: 1,
      duration: 0.8,
      ease: "power2.out"
    },
    0.4
  );

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
  tl.to(
    refs.waitlistButton,
    {
      opacity: 1,
      scale: 1,
      duration: 0.6,
      ease: "back.out(1.7)"
    },
    "fourthScroll+=0.9"
  );

  // Clear will-change
  tl.set(
    [
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
      refs.rightHand
    ],
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
    rightHand: rightHandRef.current
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
        {/* Rays background - half visible */}
        <img
          ref={raysRef}
          src={isMobile ? rays_mobile : rays}
          alt="rays"
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            top: 0,
            transform: isMobile
              ? "translate(-50%, 0%)"
              : "translate(-50%, -50%)",
            width: isMobile ? "200%" : "300%",
            //   width: "auto",
            height: "auto",
            opacity: 0,
            zIndex: 1
          }}
        />

        {/* Top Text Section - Initial state */}
        <div
          className="absolute left-0 right-0 text-center z-20"
          style={{ top: "10%" }}
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
            the toolkit gets you started. the course is where it gets serious:
          </p>

          {/* Container for overlapping text elements */}
          <div
            className="relative"
            style={{ height: isMobile ? "48px" : "96px" }}
          >
            {/* "three levels" text */}
            <h2
              ref={mainTextRef}
              className="text-white font-extrabold px-4 lowercase absolute left-0 right-0"
              style={{
                fontSize: isMobile ? "48px" : "96px",
                opacity: 0,
                top: 0,
                lineHeight: 1
              }}
            >
              three levels
            </h2>

            {/* "no shortcuts" text */}
            <h2
              ref={noShortcutsTextRef}
              className="text-white font-extrabold px-4 lowercase absolute left-0 right-0"
              style={{
                fontSize: isMobile ? "48px" : "96px",
                opacity: 0,
                top: 0,
                lineHeight: 1
              }}
            >
              no shortcuts
            </h2>

            {/* "mentors who push your limits" text */}
            <h2
              ref={mentorsTextRef}
              className="text-white font-extrabold px-4 lowercase absolute left-0 right-0"
              style={{
                fontSize: isMobile ? "48px" : "96px",
                opacity: 0,
                top: 0,
                lineHeight: 1
              }}
            >
              mentors who push your limits
            </h2>
          </div>
        </div>

        {/* Final Text Section - New state */}
        <div
          className="absolute left-0 right-0 text-center z-20"
          style={{ top: "15%" }}
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
            The toolkit gets you started.
          </p>

          <h2
            ref={finalBottomTextRef}
            className="text-black font-extrabold px-4 lowercase mb-8"
            style={{
              fontSize: isMobile ? "48px" : "96px",
              opacity: 0,
              lineHeight: 0.8
            }}
          >
            and a paid internship that proves you belong.
          </h2>

          {/* Waitlist Button */}
          <button
            ref={waitlistButtonRef}
            className="px-8 py-4 bg-black text-white font-bold text-lg rounded-[16px] lowercase"
            style={{
              opacity: 0,
              transform: "scale(0.8)",
              // boxShadow: "0 8px 16px rgba(0, 0, 0, 0.3)",
              boxShadow: "0 6px 0 rgba(128, 128, 128, 0.8)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease"
            }}
          >
            join the waitlist
          </button>
        </div>

        {/* Left Hand */}
        <img
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
            opacity: 0,
            transform: isMobile
              ? "translateX(-50%) scale(0.6)"
              : "translateX(-50%) scale(0.8)",
            transformOrigin: "bottom center"
          }}
        >
          <ThreeDoorsWithRibbon />
        </div>

        {/* ThreeDoorsWithRibbonDiamondMountains - Second state */}
        <div
          ref={doorsCompleteRef}
          className="absolute left-1/2 z-11"
          style={{
            bottom: 0,
            opacity: 0,
            transform: isMobile
              ? "translateX(-50%) scale(0.6)"
              : "translateX(-50%) scale(0.8)",
            transformOrigin: "bottom center"
          }}
        >
          <ThreeDoorsWithRibbonDiamondMountains />
        </div>

        {/* ThreeDoorsWithRibbonMountainsEye - Third state (final) */}
        <div
          ref={doorsFinalRef}
          className="absolute left-1/2 z-12"
          style={{
            bottom: 0,
            opacity: 0,
            transform: isMobile
              ? "translateX(-50%) scale(0.6)"
              : "translateX(-50%) scale(0.8)",
            transformOrigin: "bottom center"
          }}
        >
          <ThreeDoorsWithRibbonMountainsEye />
        </div>

        {/* Initial Vector at bottom */}
        <img
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
