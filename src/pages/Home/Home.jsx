// import React, { useLayoutEffect, useRef, useState } from "react";
// import { gsap } from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import Scene1, { useScene1Timeline } from "./Scene1";
// import Scene1_1, { useScene1_1Timeline } from "./Scene1_1";
// import Scene1_2, { useScene1_2Timeline } from "./Scene1_2";
// import Scene1_3, { useScene1_3Timeline } from "./Scene1_3";
// import GrainTexture from "../../components/GrainTexture";

// gsap.registerPlugin(ScrollTrigger);

// const Home = () => {
//   const scene1Refs = useRef({});
//   const scene1_1Refs = useRef({});
//   const scene1_2Refs = useRef({});
//   const scene1_3Refs = useRef({}); // ADD THIS
//   const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
//   const idleAnimsRef = useRef(null);
//   const masterTimelineRef = useRef(null);

//   useLayoutEffect(() => {
//     const handleResize = () => setIsMobile(window.innerWidth <= 768);
//     window.addEventListener("resize", handleResize);

//     return () => {
//       window.removeEventListener("resize", handleResize);
//     };
//   }, []);

//   useLayoutEffect(() => {
//     // Wait for refs to be populated
//     if (
//       !scene1Refs.current.container ||
//       !scene1_1Refs.current.container ||
//       !scene1_2Refs.current.container ||
//       !scene1_3Refs.current.container // ADD THIS
//     ) {
//       return;
//     }

//     // Create idle animations BEFORE scroll
//     if (scene1Refs.current.rainbow && scene1Refs.current.cube) {
//       idleAnimsRef.current = gsap.context(() => {
//         gsap.to(scene1Refs.current.rainbow, {
//           scale: isMobile ? 1.08 : 1.06,
//           ease: "sine.inOut",
//           duration: 2.5,
//           repeat: -1,
//           yoyo: true,
//           willChange: "transform"
//         });

//         gsap.to(scene1Refs.current.cube, {
//           y: -10,
//           ease: "sine.inOut",
//           duration: 2,
//           repeat: -1,
//           yoyo: true,
//           willChange: "transform"
//         });
//       });
//     }

//     const id = requestAnimationFrame(() => {
//       // ✅ Initialize Scene1_1 to START state - CRITICAL: This prevents flash
//       gsap.set(scene1_1Refs.current.rightCloud, { opacity: 0, y: -50 });
//       gsap.set(scene1_1Refs.current.leftCloud, { opacity: 0, y: 80 });
//       gsap.set(scene1_1Refs.current.floor, { opacity: 0, y: 150 });
//       gsap.set(scene1_1Refs.current.leftElement, { opacity: 0, x: -200 });
//       gsap.set(scene1_1Refs.current.rightElement, { opacity: 0, x: 200 });
//       gsap.set(scene1_1Refs.current.text, { opacity: 0, y: 30 });
//       gsap.set(scene1_1Refs.current.objectsContainer, { opacity: 0 });
//       gsap.set(scene1_1Refs.current.ellipse, { opacity: 0 });

//       // Initialize all objects, lines to start state
//       if (
//         scene1_1Refs.current.object1 &&
//         scene1_1Refs.current.object2 &&
//         scene1_1Refs.current.object3
//       ) {
//         gsap.set(
//           [
//             scene1_1Refs.current.object1,
//             scene1_1Refs.current.object2,
//             scene1_1Refs.current.object3
//           ],
//           { y: 0, opacity: 1, scale: 1 }
//         );
//       }
//       if (
//         scene1_1Refs.current.line1 &&
//         scene1_1Refs.current.line2 &&
//         scene1_1Refs.current.line3
//       ) {
//         gsap.set(
//           [
//             scene1_1Refs.current.line1,
//             scene1_1Refs.current.line2,
//             scene1_1Refs.current.line3
//           ],
//           { height: 0, opacity: 0 }
//         );
//       }

//       // ✅ Initialize Scene1_2 to START state (positioned above viewport)
//       gsap.set(scene1_2Refs.current.container, { y: "-100%" });
//       gsap.set(scene1_2Refs.current.vector, { opacity: 0, y: 50 });

//       // ✅ Initialize Scene1_3 to START state (positioned to the right)
//       gsap.set(scene1_3Refs.current.container, { x: "100%" }); // ADD THIS

//       // ✅ Build scene timelines (NOW that refs are ready)
//       const tl1 = useScene1Timeline(scene1Refs.current, isMobile);
//       const tl2 = useScene1_1Timeline(scene1_1Refs.current, isMobile);
//       const tl3 = useScene1_2Timeline(scene1_2Refs.current, isMobile);
//       const tl4 = useScene1_3Timeline(scene1_3Refs.current, isMobile); // ADD THIS

//       // ✅ FREEZE rainbow state before scroll
//       if (scene1Refs.current.rainbow) {
//         gsap.set(scene1Refs.current.rainbow, {
//           scale: isMobile ? 1.08 : 1.06,
//           overwrite: "auto"
//         });
//       }

//       // Set screen1 to be visible at start, screen2 positioned but hidden
//       if (scene1_3Refs.current.screen1) {
//         gsap.set(scene1_3Refs.current.screen1, {
//           yPercent: 0,
//           autoAlpha: 1,
//           zIndex: 2
//         });
//       }
//       if (scene1_3Refs.current.screen2) {
//         gsap.set(scene1_3Refs.current.screen2, {
//           yPercent: isMobile ? 100 : -100, // Positioned connected to screen1
//           autoAlpha: 1, // Visible but off-screen
//           zIndex: 1
//         });
//       }

//       // Kill existing timeline
//       if (masterTimelineRef.current) {
//         masterTimelineRef.current.kill();
//       }

//       // ✅ Master timeline with camera zoom transition
//       const master = gsap.timeline({
//         scrollTrigger: {
//           trigger: "#scroll-container",
//           start: "top top",
//           end: "+=150000", // Increased for Scene1_3
//           scrub: 0.5,
//           pin: true,
//           fastScrollEnd: true,
//           onStart: () => {
//             // KILL idle animations permanently on scroll start
//             if (idleAnimsRef.current) {
//               idleAnimsRef.current.revert();
//               idleAnimsRef.current = null;
//             }
//             // Force overwrite to prevent ripple from restarting
//             if (scene1Refs.current.rainbow) {
//               gsap.set(scene1Refs.current.rainbow, { overwrite: "auto" });
//             }
//           }
//         }
//       });

//       // Only add timelines if they exist
//       if (tl1) {
//         master.add(tl1);
//       }

//       // 🚪 ENTER THROUGH DOOR: Scene1 zooms in, Scene1_1 replaces it
//       master
//         .to(scene1Refs.current.container, {
//           scale: 1.5,
//           opacity: 0,
//           duration: 1.2,
//           ease: "power1.inOut"
//         })
//         .to(
//           scene1_1Refs.current.container,
//           {
//             opacity: 1,
//             duration: 1.2,
//             ease: "power1.inOut"
//           },
//           ">-0.4" // starts slightly before Scene1 fully disappears
//         );

//       // Play Scene 1_1 animations after zoom completes
//       if (tl2) {
//         master.add(tl2);
//       }

//       // 🎬 TRANSITION: Scene1_1 and Scene1_2 slide down together (like connected pages)
//       master
//         .to(scene1_1Refs.current.container, {
//           y: "100%", // Scene1_1 slides down
//           duration: 1.5,
//           ease: "power2.inOut"
//         })
//         .to(
//           scene1_2Refs.current.container,
//           {
//             y: "0%", // Scene1_2 slides down from -100% to 0%
//             duration: 1.5,
//             ease: "power2.inOut"
//           },
//           "<" // starts at the same time as Scene1_1
//         );

//       // Play Scene 1_2 animations
//       if (tl3) {
//         master.add(tl3);
//       }

//       // 🎬 HORIZONTAL TRANSITION: Scene1_2 and Scene1_3 slide left together
//       master
//         .to(scene1_2Refs.current.container, {
//           x: "-100%", // Scene1_2 slides left
//           duration: 1.5,
//           ease: "power2.inOut"
//         })
//         .to(
//           scene1_3Refs.current.container,
//           {
//             x: "0%", // Scene1_3 slides left from 100% to 0%
//             duration: 1.5,
//             ease: "power2.inOut"
//           },
//           "<" // starts at the same time as Scene1_2
//         );

//       // Play Scene 1_3 animations
//       if (tl4) {
//         master.add(tl4);
//       }

//       masterTimelineRef.current = master;
//     });

//     return () => {
//       cancelAnimationFrame(id);
//       if (masterTimelineRef.current) {
//         masterTimelineRef.current.kill();
//       }
//       if (idleAnimsRef.current) {
//         idleAnimsRef.current.revert();
//       }
//       ScrollTrigger.getAll().forEach((st) => st.kill());
//     };
//   }, [isMobile]);

//   return (
//     <div
//       id="scroll-container"
//       className="relative w-full h-screen overflow-hidden bg-black"
//       style={{ perspective: "1200px" }}
//     >
//       {/* grain overlay */}
//       {/* <div
//         style={{
//           position: "fixed",
//           inset: 0,
//           pointerEvents: "none",
//           zIndex: 9999,
//           mixBlendMode: "overlay",
//           opacity: 0.2,
//           backgroundImage: `url(${grain_texture})`,
//           backgroundRepeat: "repeat",
//           backgroundSize: "90px 90px",
//           filter: "contrast(150%) brightness(110%)"
//         }}
//       /> */}
//       {/* <div
//         style={{
//           position: "fixed",
//           inset: 0,
//           pointerEvents: "none",
//           zIndex: 9999,
//           mixBlendMode: "multiply",
//           opacity: 1,
//           backgroundImage: `url(${noisy_background})`,
//           backgroundRepeat: "repeat",
//           backgroundSize: "80px 80px",
//           filter: "contrast(250%) brightness(90%)"
//         }}
//       /> */}
//       <div
//         style={{
//           position: "fixed",
//           inset: 0,
//           pointerEvents: "none",
//           zIndex: 9999,
//           mixBlendMode: "overlay",
//           opacity: 0.2,
//           filter: "contrast(100%) brightness(90%)"
//         }}
//       >
//         <GrainTexture />
//       </div>

//       {/* <div
//         style={{
//           position: "fixed",
//           inset: 0,
//           pointerEvents: "none",
//           zIndex: 9998,
//           mixBlendMode: "overlay",
//           opacity: 0.15,
//           backgroundImage: `url(${noisy_background})`,
//           backgroundRepeat: "repeat",
//           backgroundSize: "60px 60px",
//           // transform: "rotate(10deg)",
//           filter: "contrast(180%) brightness(110%)"
//         }}
//       /> */}

//       {/* Scene 1 */}
//       <div
//         className="absolute inset-0 z-[2]"
//         style={{ willChange: "transform, opacity" }}
//       >
//         <Scene1 ref={scene1Refs} isMobile={isMobile} />
//       </div>

//       {/* Scene 1_1 */}
//       <div
//         ref={(el) => (scene1_1Refs.current.container = el)}
//         className="absolute inset-0 w-full h-full"
//         style={{ opacity: 0 }} // Important: start hidden
//       >
//         <Scene1_1 ref={scene1_1Refs} isMobile={isMobile} />
//       </div>

//       {/* Scene 1_2 */}
//       {/* Scene 1_2 */}
//       {/* Scene 1_2 */}
//       <div
//         ref={(el) => (scene1_2Refs.current.container = el)}
//         className="absolute inset-0 w-full h-full"
//         style={{ y: "-100%" }}
//       >
//         <Scene1_2 ref={scene1_2Refs} isMobile={isMobile} />
//       </div>

//       {/* Scene 1_3 */}
//       <div
//         ref={(el) => (scene1_3Refs.current.container = el)}
//         className="absolute inset-0 w-full h-full"
//         style={{ x: "100%" }} // Important: start to the right
//       >
//         <Scene1_3 ref={scene1_3Refs} isMobile={isMobile} />
//       </div>
//     </div>
//   );
// };

// export default Home;

import React, { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Scene1, { useScene1Timeline } from "./Scene1";
import Scene1_1, { useScene1_1Timeline } from "./Scene1_1";
import Scene1_2, { useScene1_2Timeline } from "./Scene1_2";
import Scene1_3, { useScene1_3Timeline } from "./Scene1_3";
// import Scene1_4, { useScene1_4Timeline } from "./Scene1_4"; // ADD THIS
import GrainTexture from "../../components/GrainTexture";
import Scene1_4, { useScene1_4Timeline } from "./Scene1_4";

gsap.registerPlugin(ScrollTrigger);

const Home = ({ forceLayout = "auto" }) => {
  const scene1Refs = useRef({});
  const scene1_1Refs = useRef({});
  const scene1_2Refs = useRef({});
  const scene1_3Refs = useRef({});
  const scene1_4Refs = useRef({}); // ADD THIS
  // const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isMobile, setIsMobile] = useState(() => {
    if (forceLayout === "mobile") return true;
    if (forceLayout === "desktop") return false;
    return window.innerWidth <= 768;
  });
  const idleAnimsRef = useRef(null);
  const masterTimelineRef = useRef(null);

  useLayoutEffect(() => {
    if (forceLayout !== "auto") {
      // lock the layout when forced
      setIsMobile(forceLayout === "mobile");
      return;
    }
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [forceLayout]);

  useLayoutEffect(() => {
    // Wait for refs to be populated
    if (
      !scene1Refs.current.container ||
      !scene1_1Refs.current.container ||
      !scene1_2Refs.current.container ||
      !scene1_3Refs.current.container ||
      !scene1_4Refs.current.container // ADD THIS
    ) {
      return;
    }

    // Create idle animations BEFORE scroll
    if (scene1Refs.current.rainbow && scene1Refs.current.cube) {
      idleAnimsRef.current = gsap.context(() => {
        gsap.to(scene1Refs.current.rainbow, {
          scale: isMobile ? 1.08 : 1.06,
          ease: "sine.inOut",
          duration: 2.5,
          repeat: -1,
          yoyo: true,
          willChange: "transform"
        });

        gsap.to(scene1Refs.current.cube, {
          y: -10,
          ease: "sine.inOut",
          duration: 2,
          repeat: -1,
          yoyo: true,
          willChange: "transform"
        });
      });
    }

    const id = requestAnimationFrame(() => {
      // ✅ Initialize Scene1_1 to START state - CRITICAL: This prevents flash
      gsap.set(scene1_1Refs.current.rightCloud, { opacity: 0, y: -50 });
      gsap.set(scene1_1Refs.current.leftCloud, { opacity: 0, y: 80 });
      gsap.set(scene1_1Refs.current.floor, { opacity: 0, y: 150 });
      gsap.set(scene1_1Refs.current.leftElement, { opacity: 0, x: -200 });
      gsap.set(scene1_1Refs.current.rightElement, { opacity: 0, x: 200 });
      gsap.set(scene1_1Refs.current.text, { opacity: 0, y: 30 });
      gsap.set(scene1_1Refs.current.objectsContainer, { opacity: 0 });
      gsap.set(scene1_1Refs.current.ellipse, { opacity: 0 });

      // Initialize all objects, lines to start state
      if (
        scene1_1Refs.current.object1 &&
        scene1_1Refs.current.object2 &&
        scene1_1Refs.current.object3
      ) {
        gsap.set(
          [
            scene1_1Refs.current.object1,
            scene1_1Refs.current.object2,
            scene1_1Refs.current.object3
          ],
          { y: 0, opacity: 1, scale: 1 }
        );
      }
      if (
        scene1_1Refs.current.line1 &&
        scene1_1Refs.current.line2 &&
        scene1_1Refs.current.line3
      ) {
        gsap.set(
          [
            scene1_1Refs.current.line1,
            scene1_1Refs.current.line2,
            scene1_1Refs.current.line3
          ],
          { height: 0, opacity: 0 }
        );
      }

      // ✅ Initialize Scene1_2 to START state (positioned above viewport)
      gsap.set(scene1_2Refs.current.container, { y: "-100%" });
      gsap.set(scene1_2Refs.current.vector, { opacity: 0, y: 50 });

      // ✅ Initialize Scene1_3 to START state (positioned to the right)
      gsap.set(scene1_3Refs.current.container, { x: "100%" });

      // ✅ Initialize Scene1_4 to START state (positioned based on mobile/desktop)
      gsap.set(scene1_4Refs.current.container, {
        y: isMobile ? "-100%" : "100%" // Above viewport on mobile, below on desktop
      }); // ADD THIS
      gsap.set([scene1_4Refs.current.text1, scene1_4Refs.current.text2], {
        opacity: 0,
        y: 24
      });

      // ✅ Build scene timelines (NOW that refs are ready)
      const tl1 = useScene1Timeline(scene1Refs.current, isMobile);
      const tl2 = useScene1_1Timeline(scene1_1Refs.current, isMobile);
      const tl3 = useScene1_2Timeline(scene1_2Refs.current, isMobile);
      const tl4 = useScene1_3Timeline(scene1_3Refs.current, isMobile);
      const tl5 = useScene1_4Timeline(scene1_4Refs.current, isMobile); // ADD THIS

      // ✅ FREEZE rainbow state before scroll
      if (scene1Refs.current.rainbow) {
        gsap.set(scene1Refs.current.rainbow, {
          scale: isMobile ? 1.08 : 1.06,
          overwrite: "auto"
        });
      }

      // Set screen1 to be visible at start, screen2 positioned but hidden
      if (scene1_3Refs.current.screen1) {
        gsap.set(scene1_3Refs.current.screen1, {
          yPercent: 0,
          autoAlpha: 1,
          zIndex: 2
        });
      }
      if (scene1_3Refs.current.screen2) {
        gsap.set(scene1_3Refs.current.screen2, {
          yPercent: isMobile ? 100 : -100,
          autoAlpha: 1,
          zIndex: 1
        });
      }

      // Kill existing timeline
      if (masterTimelineRef.current) {
        masterTimelineRef.current.kill();
      }

      // ✅ Master timeline with camera zoom transition
      const master = gsap.timeline({
        scrollTrigger: {
          trigger: "#scroll-container",
          start: "top top",
          end: "+=400000", // Increased for Scene1_4
          scrub: 0.5,
          pin: true,
          fastScrollEnd: true,
          onStart: () => {
            // KILL idle animations permanently on scroll start
            if (idleAnimsRef.current) {
              idleAnimsRef.current.revert();
              idleAnimsRef.current = null;
            }
            // Force overwrite to prevent ripple from restarting
            if (scene1Refs.current.rainbow) {
              gsap.set(scene1Refs.current.rainbow, { overwrite: "auto" });
            }
          }
        }
      });

      // Only add timelines if they exist
      if (tl1) {
        master.add(tl1);
      }

      // 🚪 ENTER THROUGH DOOR: Scene1 zooms in, Scene1_1 replaces it
      master
        .to(scene1Refs.current.container, {
          scale: 1.5,
          opacity: 0,
          duration: 1.2,
          ease: "power1.inOut"
        })
        .to(
          scene1_1Refs.current.container,
          {
            opacity: 1,
            duration: 1.2,
            ease: "power1.inOut"
          },
          ">-0.4"
        );

      // Play Scene 1_1 animations after zoom completes
      if (tl2) {
        master.add(tl2);
      }

      // 🎬 TRANSITION: Scene1_1 and Scene1_2 slide down together
      master
        .to(scene1_1Refs.current.container, {
          y: "100%",
          duration: 1.5,
          ease: "power2.inOut"
        })
        .to(
          scene1_2Refs.current.container,
          {
            y: "0%",
            duration: 1.5,
            ease: "power2.inOut"
          },
          "<"
        );

      // Play Scene 1_2 animations
      if (tl3) {
        master.add(tl3);
      }

      // 🎬 HORIZONTAL TRANSITION: Scene1_2 and Scene1_3 slide left together
      master
        .to(scene1_2Refs.current.container, {
          x: "-100%",
          duration: 1.5,
          ease: "power2.inOut"
        })
        .to(
          scene1_3Refs.current.container,
          {
            x: "0%",
            duration: 1.5,
            ease: "power2.inOut"
          },
          "<"
        );

      // Play Scene 1_3 animations
      if (tl4) {
        master.add(tl4);
      }

      // 🎬 VERTICAL TRANSITION: Scene1_3 and Scene1_4 slide vertically (direction depends on device)
      master
        .to(scene1_3Refs.current.container, {
          y: isMobile ? "100%" : "-100%", // Mobile: down, Desktop: up
          duration: 1.5,
          ease: "power2.inOut"
        })
        .to(
          scene1_4Refs.current.container,
          {
            y: "0%", // Scene1_4 slides to center from below (desktop) or above (mobile)
            duration: 1.5,
            ease: "power2.inOut"
          },
          "<" // starts at the same time as Scene1_3
        );

      // Play Scene 1_4 animations
      if (tl5) {
        master.add(tl5);
      }

      masterTimelineRef.current = master;
    });

    return () => {
      cancelAnimationFrame(id);
      if (masterTimelineRef.current) {
        masterTimelineRef.current.kill();
      }
      if (idleAnimsRef.current) {
        idleAnimsRef.current.revert();
      }
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [isMobile]);

  return (
    <div
      id="scroll-container"
      className="relative w-full h-screen overflow-hidden bg-black"
      style={{ perspective: "1200px" }}
    >
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 9999,
          mixBlendMode: "overlay",
          opacity: 0.2,
          filter: "contrast(100%) brightness(90%)"
        }}
      >
        <GrainTexture />
      </div>

      {/* Scene 1 */}
      <div
        className="absolute inset-0 z-[2]"
        style={{ willChange: "transform, opacity" }}
      >
        <Scene1 ref={scene1Refs} isMobile={isMobile} />
      </div>

      {/* Scene 1_1 */}
      <div
        ref={(el) => {
          if (scene1_1Refs.current) scene1_1Refs.current.container = el;
        }}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0 }}
      >
        <Scene1_1 ref={scene1_1Refs} isMobile={isMobile} />
      </div>

      {/* Scene 1_2 */}
      <div
        ref={(el) => {
          if (scene1_2Refs.current) scene1_2Refs.current.container = el;
        }}
        className="absolute inset-0 w-full h-full"
        style={{ y: "-100%" }}
      >
        <Scene1_2 ref={scene1_2Refs} isMobile={isMobile} />
      </div>

      {/* Scene 1_3 */}
      <div
        ref={(el) => {
          if (scene1_3Refs.current) scene1_3Refs.current.container = el;
        }}
        className="absolute inset-0 w-full h-full"
        style={{ x: "100%" }}
      >
        <Scene1_3 ref={scene1_3Refs} isMobile={isMobile} />
      </div>

      {/* Scene 1_4 */}
      <div
        ref={(el) => {
          if (scene1_4Refs.current) scene1_4Refs.current.container = el;
        }}
        className="absolute inset-0 w-full h-full"
        style={{ y: isMobile ? "-100%" : "100%" }} // Positioned above on mobile, below on desktop
      >
        <Scene1_4 ref={scene1_4Refs} isMobile={isMobile} />
      </div>
    </div>
  );
};

export default Home;
