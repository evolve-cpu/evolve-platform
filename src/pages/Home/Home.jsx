// import React from "react";
// import ScrollController from "./ScrollController";
// import Scene1 from "./Scene1";
// import { grain_texture } from "../../assets/images/Home";
// import Scene2 from "./Scene2";

// const Home = () => {
//   return (
//     <div className="">
//       <ScrollController>
//         <div
//           // ref={grainRef}
//           style={{
//             position: "absolute",
//             top: 0,
//             left: 0,
//             width: "100%",
//             height: "100%",
//             pointerEvents: "none",
//             zIndex: 999,
//             mixBlendMode: "overlay", // try 'multiply' or 'overlay'
//             opacity: 0.2, // increase for stronger grain
//             backgroundImage: `url(${grain_texture})`,
//             backgroundRepeat: "repeat",
//             backgroundSize: "90px 90px", // smaller = denser noise
//             filter: "contrast(150%) brightness(110%)"
//           }}
//         />
//         <Scene1 />
//         <Scene2 />
//         {/* </div> */}
//       </ScrollController>
//     </div>
//   );
// };

// export default Home;

// import React from "react";
// import ScrollController from "./ScrollController";
// import Scene1 from "./Scene1";
// import Scene2 from "./Scene2";
// import { grain_texture } from "../../assets/images/Home";

// const Home = () => {
//   return (
//     <div className="relative overflow-hidden">
//       {/* ✨ GRAIN TEXTURE - Fixed overlay across all scenes */}
//       <div
//         style={{
//           position: "fixed",
//           top: 0,
//           left: 0,
//           width: "100%",
//           height: "100%",
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

//       {/* Normal scroll container - NO transforms */}
//       {/* <ScrollController> */}
//       <Scene1 />
//       <Scene2 />
//       {/* Add more scenes here */}
//       {/* </ScrollController> */}
//     </div>
//   );
// };

// export default Home;

// ============================================
// 📄 Home.js - SIMPLE VERSION
// ============================================
// import React from "react";
// import { SceneProvider, SceneWrapper } from "./SceneManager";
// import Scene1 from "./Scene1";
// import Scene2 from "./Scene2";
// import { grain_texture } from "../../assets/images/Home";
// import Scene1_1 from "./Scene1_1";
// import ScrollController from "./ScrollController";

// const Home = () => {
//   return (
//     <ScrollController>
//       {/* ✨ GRAIN TEXTURE - Fixed overlay across all scenes */}
//       <div
//         style={{
//           position: "fixed",
//           top: 0,
//           left: 0,
//           width: "100%",
//           height: "100%",
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

//       {/* Scene 1 - Base */}
//       {/* <SceneWrapper sceneIndex={0} className="bg-black w-full"> */}
//       <Scene1 />
//       {/* </SceneWrapper> */}

//       {/* Scene 2 - Overlays Scene 1 */}
//       {/* <SceneWrapper
//         sceneIndex={1}
//         className="bg-gradient-to-br from-slate-900 to-black w-full"
//       > */}
//       {/* <Scene1_1 /> */}
//       {/* </SceneWrapper> */}
//     </ScrollController>
//   );
// };

// export default Home;

// import React, { useLayoutEffect, useRef, useState } from "react";
// import { gsap } from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import Scene1, { useScene1Timeline } from "./Scene1";
// import Scene1_1, { useScene1_1Timeline } from "./Scene1_1";
// import { grain_texture } from "../../assets/images/Home";

// gsap.registerPlugin(ScrollTrigger);

// const Home = () => {
//   const scene1Refs = useRef({});
//   const scene1_1Refs = useRef({});
//   const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

//   useLayoutEffect(() => {
//     const handleResize = () => setIsMobile(window.innerWidth <= 768);
//     window.addEventListener("resize", handleResize);

//     const id = requestAnimationFrame(() => {
//       if (!scene1Refs.current.container || !scene1_1Refs.current.container)
//         return;

//       // ✅ Initialize Scene1_1 to START state
//       gsap.set(scene1_1Refs.current.rightCloud, { opacity: 0, y: -50 });
//       gsap.set(scene1_1Refs.current.leftCloud, { opacity: 0, y: 80 });
//       gsap.set(scene1_1Refs.current.floor, { opacity: 0, y: 150 });
//       gsap.set(scene1_1Refs.current.leftElement, { opacity: 0, x: -200 });
//       gsap.set(scene1_1Refs.current.rightElement, { opacity: 0, x: 200 });

//       // ✅ Build scene timelines
//       const tl1 = useScene1Timeline(scene1Refs.current, isMobile);
//       const tl2 = useScene1_1Timeline(scene1_1Refs.current, isMobile);

//       // ✅ Master timeline with camera zoom transition
//       const master = gsap.timeline({
//         scrollTrigger: {
//           trigger: "#scroll-container",
//           start: "top top",
//           end: "+=9000",
//           scrub: 0.5,
//           pin: true,
//           fastScrollEnd: true
//         }
//       });

//       master
//         // Play Scene 1
//         .add(tl1)
//         // 🚪 ENTER THROUGH DOOR: Scene1 zooms in (camera going through door), Scene1_1 replaces it
//         .to(
//           scene1Refs.current.container,
//           {
//             scale: 1.5,
//             opacity: 0,
//             duration: 1.2,
//             ease: "power1.inOut"
//           },
//           "doorTransition"
//         )
//         .to(
//           scene1_1Refs.current.container,
//           {
//             opacity: 1,
//             duration: 1.2,
//             ease: "power1.inOut"
//           },
//           "doorTransition"
//         )
//         // Play Scene 1_1 animations after zoom completes
//         .add(tl2);
//     });

//     return () => {
//       cancelAnimationFrame(id);
//       ScrollTrigger.getAll().forEach((st) => st.kill());
//       window.removeEventListener("resize", handleResize);
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
//       <div className="absolute inset-0 z-[2]">
//         <Scene1 ref={scene1Refs} isMobile={isMobile} />
//       </div>

//       {/* Scene 1_1 */}
//       <div className="absolute inset-0 z-[1]">
//         <Scene1_1 ref={scene1_1Refs} isMobile={isMobile} />
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
import { grain_texture } from "../../assets/images/Home";

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const scene1Refs = useRef({});
  const scene1_1Refs = useRef({});
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const idleAnimsRef = useRef(null); // Track idle animations

  useLayoutEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);

    // First, create idle animations (ripple & bounce) BEFORE scroll starts
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
      if (!scene1Refs.current.container || !scene1_1Refs.current.container)
        return;

      // ✅ Initialize Scene1_1 to START state
      gsap.set(scene1_1Refs.current.rightCloud, { opacity: 0, y: -50 });
      gsap.set(scene1_1Refs.current.leftCloud, { opacity: 0, y: 80 });
      gsap.set(scene1_1Refs.current.floor, { opacity: 0, y: 150 });
      gsap.set(scene1_1Refs.current.leftElement, { opacity: 0, x: -200 });
      gsap.set(scene1_1Refs.current.rightElement, { opacity: 0, x: 200 });

      // ✅ Build scene timelines
      const tl1 = useScene1Timeline(scene1Refs.current, isMobile);
      const tl2 = useScene1_1Timeline(scene1_1Refs.current, isMobile);

      // ✅ FREEZE rainbow state before scroll (set it to exact current state)
      gsap.set(scene1Refs.current.rainbow, {
        scale: isMobile ? 1.08 : 1.06,
        overwrite: "auto"
      });

      // ✅ Master timeline with camera zoom transition
      const master = gsap.timeline({
        scrollTrigger: {
          trigger: "#scroll-container",
          start: "top top",
          end: "+=9000",
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
            gsap.set(scene1Refs.current.rainbow, { overwrite: "auto" });
          }
        }
      });

      master
        // Play Scene 1
        .add(tl1)
        // 🚪 ENTER THROUGH DOOR: Scene1 zooms in (camera going through door), Scene1_1 replaces it
        .to(
          scene1Refs.current.container,
          {
            scale: 1.5,
            opacity: 0,
            duration: 1.2,
            ease: "power1.inOut"
          },
          "doorTransition"
        )
        .to(
          scene1_1Refs.current.container,
          {
            opacity: 1,
            duration: 1.2,
            ease: "power1.inOut"
          },
          "doorTransition"
        )
        // Play Scene 1_1 animations after zoom completes
        .add(tl2);
    });

    return () => {
      cancelAnimationFrame(id);
      if (idleAnimsRef.current) {
        idleAnimsRef.current.revert();
      }
      ScrollTrigger.getAll().forEach((st) => st.kill());
      window.removeEventListener("resize", handleResize);
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
        className="absolute inset-0 z-[1]"
        style={{ willChange: "transform, opacity" }}
      >
        <Scene1_1 ref={scene1_1Refs} isMobile={isMobile} />
      </div>
    </div>
  );
};

export default Home;
