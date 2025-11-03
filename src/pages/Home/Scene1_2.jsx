// import React, { useRef, useEffect } from "react";
// import { gsap } from "gsap";
// import {
//   vector,
//   vector_mobile,
//   left_mountains,
//   right_mountains,
//   left_ribbon,
//   middle_ribbon,
//   right_ribbon,
//   shine,
//   diamond
// } from "../../assets/images/Home";
// import ThreeDoors from "../../components/Threedoors";

// // Timeline hook for Scene1_2 animation - works with master timeline
// export const useScene1_2Timeline = (refs, isMobile) => {
//   const tl = gsap.timeline();

//   // Set initial states with will-change for performance
//   tl.set(refs.vector, {
//     opacity: 0,
//     y: 50,
//     willChange: "transform, opacity"
//   });

//   // Vector appears from bottom
//   tl.to(
//     refs.vector,
//     {
//       opacity: 1,
//       y: 0,
//       duration: 1.2,
//       ease: "power2.out"
//     },
//     0
//   );

//   // TODO: Add more animations here as you build the scene

//   // Clear will-change at the end for performance
//   tl.set(refs.vector, { willChange: "auto" }, "+=0.5");

//   return tl;
// };

// // Main Scene Component
// const Scene1_2 = React.forwardRef((props, ref) => {
//   const { isMobile } = props;

//   // Main refs
//   const containerRef = useRef(null);
//   const vectorRef = useRef(null);

//   // TODO: Add more refs as needed:
//   // const element1Ref = useRef(null);
//   // const textRef = useRef(null);

//   // Expose refs to parent
//   React.useImperativeHandle(ref, () => ({
//     container: containerRef.current,
//     vector: vectorRef.current
//     // TODO: Add all your refs here as you create them
//     // element1: element1Ref.current,
//     // text: textRef.current,
//   }));

//   return (
//     <section
//       ref={containerRef}
//       className="relative w-full h-screen overflow-hidden bg-evolve-lavender-indigo"
//     >
//       {/* Vector at bottom */}
//       <img
//         ref={vectorRef}
//         src={isMobile ? vector_mobile : vector}
//         alt="vector"
//         className="absolute left-1/2 -translate-x-1/2 z-[10] pointer-events-none"
//         style={{
//           bottom: 0,
//           width: isMobile ? "100%" : "100%",
//           height: "auto",
//           opacity: 0
//         }}
//       />

//       {/* TODO: Add your scene elements here */}

//       {/* Mobile-specific elements */}
//       {isMobile && <>{/* Add mobile-only elements here */}</>}

//       {/* Desktop-specific elements */}
//       {!isMobile && <>{/* Add desktop-only elements here */}</>}
//     </section>
//   );
// });

// Scene1_2.displayName = "Scene1_2";
// export default Scene1_2;

import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import {
  vector,
  vector_mobile,
  left_mountains,
  right_mountains,
  left_ribbon,
  middle_ribbon,
  right_ribbon,
  shine,
  diamond
} from "../../assets/images/Home";
import ThreeDoors from "../../components/Threedoors";

// Timeline hook for Scene1_2 animation - works with master timeline
export const useScene1_2Timeline = (refs, isMobile) => {
  const tl = gsap.timeline();

  if (isMobile) {
    // Mobile animations - TODO
    tl.set(refs.vector, {
      opacity: 0,
      y: 50,
      willChange: "transform, opacity"
    });

    tl.to(
      refs.vector,
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power2.out"
      },
      0
    );

    tl.set(refs.vector, { willChange: "auto" }, "+=0.5");
  } else {
    // DESKTOP ANIMATIONS

    // Set initial states
    tl.set(refs.vector, {
      opacity: 0,
      y: 50,
      willChange: "transform, opacity"
    })
      .set(refs.text1, {
        opacity: 0,
        y: 30,
        willChange: "transform, opacity"
      })
      .set(refs.text2, {
        opacity: 0,
        y: 30,
        willChange: "transform, opacity"
      })
      .set(refs.threeDoors, {
        opacity: 0,
        scale: 0.9,
        willChange: "transform, opacity"
      })
      .set(refs.leftRibbon, {
        opacity: 0,
        x: -200,
        willChange: "transform, opacity"
      })
      .set(refs.middleRibbon, {
        opacity: 0,
        y: 50,
        willChange: "transform, opacity"
      })
      .set(refs.rightRibbon, {
        opacity: 0,
        x: 200,
        willChange: "transform, opacity"
      })
      .set(refs.diamond, {
        opacity: 0,
        rotateY: -180,
        scale: 0.8,
        willChange: "transform, opacity"
      })
      .set([refs.leftMountains, refs.rightMountains], {
        opacity: 0,
        scale: 0.8,
        willChange: "transform, opacity"
      });

    // PHASE 1: Vector and Text1 appear
    tl.to(
      refs.vector,
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power2.out"
      },
      0
    ).to(
      refs.text1,
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out"
      },
      0.5
    );

    // PHASE 2: "three levels" text appears
    tl.to(
      refs.text2,
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out"
      },
      "+=0.5"
    );

    // PHASE 3: Three doors appear
    tl.to(
      refs.threeDoors,
      {
        opacity: 1,
        scale: 1,
        duration: 1.0,
        ease: "back.out(1.2)"
      },
      "+=0.3"
    );

    // PHASE 4: Ribbons appear - left comes from left screen, middle from bottom, right goes to right screen
    tl.to(
      refs.leftRibbon,
      {
        opacity: 1,
        x: 0,
        duration: 1.0,
        ease: "power2.out"
      },
      "+=0.3"
    )
      .to(
        refs.middleRibbon,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out"
        },
        "-=0.5"
      )
      .to(
        refs.rightRibbon,
        {
          opacity: 1,
          x: 0,
          duration: 1.0,
          ease: "power2.out"
        },
        "-=0.8"
      );

    // PHASE 5: Scroll transition - Text changes to "no shortcuts"
    const textChangeStart = "+=2.0";

    // Fade out "three levels"
    tl.to(
      refs.text2,
      {
        opacity: 0,
        y: -20,
        duration: 0.6,
        ease: "power2.in"
      },
      textChangeStart
    );

    // Change text2 content and fade in "no shortcuts"
    tl.call(
      () => {
        if (refs.text2) {
          refs.text2.textContent = "no shortcuts";
        }
      },
      null,
      textChangeStart + 0.6
    );

    tl.to(
      refs.text2,
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out"
      },
      textChangeStart + 0.8
    );

    // PHASE 6: Mountains appear inside doors
    tl.to(
      refs.leftMountains,
      {
        opacity: 1,
        scale: 1,
        duration: 1.0,
        ease: "power2.out"
      },
      "+=0.5"
    ).to(
      refs.rightMountains,
      {
        opacity: 1,
        scale: 1,
        duration: 1.0,
        ease: "power2.out"
      },
      "-=0.8"
    );

    // PHASE 7: Diamond appears with flip animation
    tl.to(
      refs.diamond,
      {
        opacity: 1,
        rotateY: 0,
        scale: 1,
        duration: 1.2,
        ease: "back.out(1.5)"
      },
      "+=0.5"
    );

    // PHASE 8: Shine animation (continuous blink)
    tl.to(
      refs.shine,
      {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out"
      },
      "-=0.3"
    );

    // Create continuous shine blink after initial animations
    tl.call(() => {
      if (refs.shine) {
        gsap.to(refs.shine, {
          opacity: 0.3,
          duration: 0.8,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true
        });
      }
    });

    // Clear will-change at the end for performance
    tl.set(
      [
        refs.vector,
        refs.text1,
        refs.text2,
        refs.threeDoors,
        refs.leftRibbon,
        refs.middleRibbon,
        refs.rightRibbon,
        refs.diamond,
        refs.leftMountains,
        refs.rightMountains
      ],
      { willChange: "auto" },
      "+=0.5"
    );
  }

  return tl;
};

// Main Scene Component
const Scene1_2 = React.forwardRef((props, ref) => {
  const { isMobile } = props;

  // Main refs
  const containerRef = useRef(null);
  const vectorRef = useRef(null);
  const text1Ref = useRef(null);
  const text2Ref = useRef(null);
  const threeDoorsRef = useRef(null);
  const leftDoorRef = useRef(null);
  const middleDoorRef = useRef(null);
  const rightDoorRef = useRef(null);
  const leftRibbonRef = useRef(null);
  const middleRibbonRef = useRef(null);
  const rightRibbonRef = useRef(null);
  const leftMountainsRef = useRef(null);
  const rightMountainsRef = useRef(null);
  const diamondContainerRef = useRef(null);
  const diamondRef = useRef(null);
  const shineRef = useRef(null);

  // Expose refs to parent
  React.useImperativeHandle(ref, () => ({
    container: containerRef.current,
    vector: vectorRef.current,
    text1: text1Ref.current,
    text2: text2Ref.current,
    threeDoors: threeDoorsRef.current,
    leftDoor: leftDoorRef.current,
    middleDoor: middleDoorRef.current,
    rightDoor: rightDoorRef.current,
    leftRibbon: leftRibbonRef.current,
    middleRibbon: middleRibbonRef.current,
    rightRibbon: rightRibbonRef.current,
    leftMountains: leftMountainsRef.current,
    rightMountains: rightMountainsRef.current,
    diamondContainer: diamondContainerRef.current,
    diamond: diamondRef.current,
    shine: shineRef.current
  }));

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-evolve-lavender-indigo"
    >
      {/* Vector at bottom */}
      <img
        ref={vectorRef}
        src={isMobile ? vector_mobile : vector}
        alt="vector"
        className="absolute left-1/2 -translate-x-1/2 z-[10] pointer-events-none"
        style={{
          bottom: 0,
          width: isMobile ? "100%" : "100%",
          height: "auto",
          opacity: 0
        }}
      />

      {/* Mobile-specific elements */}
      {isMobile && <>{/* Add mobile-only elements here */}</>}

      {/* Desktop-specific elements */}
      {!isMobile && (
        <>
          {/* Text 1: "The toolkit gets you started..." */}
          <div
            ref={text1Ref}
            className="absolute left-1/2 -translate-x-1/2 z-[20] text-center font-extrabold text-white"
            style={{
              top: "15%",
              fontSize: "32px",
              lineHeight: "1.2",
              maxWidth: "90%",
              opacity: 0
            }}
          >
            The toolkit gets you started. The course is where it gets serious:
          </div>

          {/* Text 2: "three levels" (will change to "no shortcuts") */}
          <div
            ref={text2Ref}
            className="absolute left-1/2 -translate-x-1/2 z-[20] text-center font-extrabold text-white"
            style={{
              top: "25%",
              fontSize: "96px",
              lineHeight: "1.2",
              opacity: 0
            }}
          >
            three levels
          </div>

          {/* Three Doors Container */}
          <div
            className="absolute left-1/2 -translate-x-1/2 z-[15]"
            style={{
              bottom: 0,
              width: "auto",
              height: "50vh"
            }}
          >
            <ThreeDoors
              ref={threeDoorsRef}
              leftRef={leftDoorRef}
              middleRef={middleDoorRef}
              rightRef={rightDoorRef}
            />
          </div>

          {/* Ribbons - positioned at bottom-0 */}
          <div className="absolute bottom-0 left-0 w-full h-full z-[16] pointer-events-none">
            {/* Left Ribbon - comes from left screen into left door */}
            <img
              ref={leftRibbonRef}
              src={left_ribbon}
              alt="left ribbon"
              className="absolute"
              style={{
                bottom: 0,
                left: "15%",
                width: "clamp(80px, 8vw, 120px)",
                height: "auto",
                opacity: 0
              }}
            />
            {/* Middle Ribbon - in middle door */}
            <img
              ref={middleRibbonRef}
              src={middle_ribbon}
              alt="middle ribbon"
              className="absolute"
              style={{
                bottom: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: "clamp(80px, 8vw, 120px)",
                height: "auto",
                opacity: 0
              }}
            />
            {/* Right Ribbon - goes from right door to right screen */}
            <img
              ref={rightRibbonRef}
              src={right_ribbon}
              alt="right ribbon"
              className="absolute"
              style={{
                bottom: 0,
                right: "15%",
                width: "clamp(80px, 8vw, 120px)",
                height: "auto",
                opacity: 0
              }}
            />
          </div>

          {/* Left Mountains - inside left door */}
          <img
            ref={leftMountainsRef}
            src={left_mountains}
            alt="left mountains"
            className="absolute z-[14] pointer-events-none"
            style={{
              bottom: 0,
              left: "17%",
              width: "clamp(120px, 12vw, 200px)",
              height: "auto",
              opacity: 0
            }}
          />

          {/* Right Mountains - inside right door */}
          <img
            ref={rightMountainsRef}
            src={right_mountains}
            alt="right mountains"
            className="absolute z-[14] pointer-events-none"
            style={{
              bottom: 0,
              right: "17%",
              width: "clamp(120px, 12vw, 200px)",
              height: "auto",
              opacity: 0
            }}
          />

          {/* Diamond Container - positioned at top of middle door */}
          <div
            ref={diamondContainerRef}
            className="absolute left-1/2 -translate-x-1/2 z-[25]"
            style={{
              top: "35%",
              width: "clamp(120px, 10vw, 180px)",
              height: "auto",
              perspective: "1000px"
            }}
          >
            {/* Diamond with flip animation */}
            <div
              ref={diamondRef}
              className="relative w-full h-full"
              style={{
                transformStyle: "preserve-3d",
                opacity: 0
              }}
            >
              <img src={diamond} alt="diamond" className="w-full h-auto" />

              {/* Shine effect inside diamond */}
              <img
                ref={shineRef}
                src={shine}
                alt="shine"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  width: "60%",
                  height: "auto",
                  opacity: 0
                }}
              />
            </div>
          </div>
        </>
      )}
    </section>
  );
});

Scene1_2.displayName = "Scene1_2";
export default Scene1_2;
