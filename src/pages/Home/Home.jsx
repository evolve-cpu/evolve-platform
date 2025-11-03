// import React, { useLayoutEffect, useRef, useState } from "react";
// import { gsap } from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import Scene1, { useScene1Timeline } from "./Scene1";
// import Scene1_1, { useScene1_1Timeline } from "./Scene1_1";
// import Scene1_2, { useScene1_2Timeline } from "./Scene1_2";
// import { grain_texture } from "../../assets/images/Home";

// gsap.registerPlugin(ScrollTrigger);

// const Home = () => {
//   const scene1Refs = useRef({});
//   const scene1_1Refs = useRef({});
//   const scene1_2Refs = useRef({});
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
//       !scene1_2Refs.current.container
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

//       // ✅ Initialize Scene1_2 to START state
//       gsap.set(scene1_2Refs.current.vector, { opacity: 0, y: 50 });

//       // ✅ Build scene timelines (NOW that refs are ready)
//       const tl1 = useScene1Timeline(scene1Refs.current, isMobile);
//       const tl2 = useScene1_1Timeline(scene1_1Refs.current, isMobile);
//       const tl3 = useScene1_2Timeline(scene1_2Refs.current, isMobile);

//       // ✅ FREEZE rainbow state before scroll
//       if (scene1Refs.current.rainbow) {
//         gsap.set(scene1Refs.current.rainbow, {
//           scale: isMobile ? 1.08 : 1.06,
//           overwrite: "auto"
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
//           end: "+=55000", // Increased for Scene1_2
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

//       // 🎬 TRANSITION: Scene1_1 goes down, Scene1_2 appears
//       master
//         .to(scene1_1Refs.current.container, {
//           y: "100%", // Scene1_1 slides down
//           duration: 1.5,
//           ease: "power2.inOut"
//         })
//         .to(
//           scene1_2Refs.current.container,
//           {
//             opacity: 1,
//             duration: 1.2,
//             ease: "power2.inOut"
//           },
//           "<0.3" // Scene1_2 appears slightly after Scene1_1 starts moving
//         );

//       // Play Scene 1_2 animations
//       if (tl3) {
//         master.add(tl3);
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
//       <div
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
//       />

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
//       <div
//         ref={(el) => (scene1_2Refs.current.container = el)}
//         className="absolute inset-0 w-full h-full"
//         style={{ opacity: 0 }} // Important: start hidden
//       >
//         <Scene1_2 ref={scene1_2Refs} isMobile={isMobile} />
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
// import Scene1_2, { useScene1_2Timeline } from "./Scene1_2"; // ❌ Hidden for now
import { grain_texture } from "../../assets/images/Home";

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const scene1Refs = useRef({});
  const scene1_1Refs = useRef({});
  const scene1_2Refs = useRef({});
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const idleAnimsRef = useRef(null);
  const masterTimelineRef = useRef(null);

  useLayoutEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useLayoutEffect(() => {
    if (!scene1Refs.current.container || !scene1_1Refs.current.container) {
      return;
    }

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
      // Initialize Scene1_1 start state
      gsap.set(scene1_1Refs.current.rightCloud, { opacity: 0, y: -50 });
      gsap.set(scene1_1Refs.current.leftCloud, { opacity: 0, y: 80 });
      gsap.set(scene1_1Refs.current.floor, { opacity: 0, y: 150 });
      gsap.set(scene1_1Refs.current.leftElement, { opacity: 0, x: -200 });
      gsap.set(scene1_1Refs.current.rightElement, { opacity: 0, x: 200 });
      gsap.set(scene1_1Refs.current.text, { opacity: 0, y: 30 });
      gsap.set(scene1_1Refs.current.objectsContainer, { opacity: 0 });
      gsap.set(scene1_1Refs.current.ellipse, { opacity: 0 });

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

      // Build only Scene1 + Scene1_1
      const tl1 = useScene1Timeline(scene1Refs.current, isMobile);
      const tl2 = useScene1_1Timeline(scene1_1Refs.current, isMobile);
      // const tl3 = useScene1_2Timeline(scene1_2Refs.current, isMobile); // ❌ Hidden

      if (scene1Refs.current.rainbow) {
        gsap.set(scene1Refs.current.rainbow, {
          scale: isMobile ? 1.08 : 1.06,
          overwrite: "auto"
        });
      }

      if (masterTimelineRef.current) {
        masterTimelineRef.current.kill();
      }

      const master = gsap.timeline({
        scrollTrigger: {
          trigger: "#scroll-container",
          start: "top top",
          end: "+=25000", // Shortened since Scene1_2 is hidden
          scrub: 0.5,
          pin: true,
          fastScrollEnd: true,
          onStart: () => {
            if (idleAnimsRef.current) {
              idleAnimsRef.current.revert();
              idleAnimsRef.current = null;
            }
            if (scene1Refs.current.rainbow) {
              gsap.set(scene1Refs.current.rainbow, { overwrite: "auto" });
            }
          }
        }
      });

      if (tl1) master.add(tl1);

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

      if (tl2) master.add(tl2);

      // ❌ Scene1_2 transition removed

      masterTimelineRef.current = master;
    });

    return () => {
      cancelAnimationFrame(id);
      if (masterTimelineRef.current) masterTimelineRef.current.kill();
      if (idleAnimsRef.current) idleAnimsRef.current.revert();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [isMobile]);

  return (
    <div
      id="scroll-container"
      className="relative w-full h-screen overflow-hidden bg-black"
      style={{ perspective: "1200px" }}
    >
      {/* grain overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 9999,
          mixBlendMode: "overlay",
          opacity: 0.2,
          backgroundImage: `url(${grain_texture})`,
          backgroundRepeat: "repeat",
          backgroundSize: "90px 90px",
          filter: "contrast(150%) brightness(110%)"
        }}
      />

      {/* Scene 1 */}
      <div
        className="absolute inset-0 z-[2]"
        style={{ willChange: "transform, opacity" }}
      >
        <Scene1 ref={scene1Refs} isMobile={isMobile} />
      </div>

      {/* Scene 1_1 */}
      <div
        ref={(el) => (scene1_1Refs.current.container = el)}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0 }}
      >
        <Scene1_1 ref={scene1_1Refs} isMobile={isMobile} />
      </div>

      {/* ❌ Scene1_2 hidden for now */}
      {/* <div
        ref={(el) => (scene1_2Refs.current.container = el)}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0 }}
      >
        <Scene1_2 ref={scene1_2Refs} isMobile={isMobile} />
      </div> */}
    </div>
  );
};

export default Home;
