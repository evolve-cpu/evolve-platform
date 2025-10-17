// import React, { useEffect, useRef, useState } from "react";
// import { gsap } from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
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
//   right_element_mobile
// } from "../../assets/images/Home";

// gsap.registerPlugin(ScrollTrigger);
// gsap.config({ force3D: true, autoSleep: 60 });

// const Scene1_1 = () => {
//   const containerRef = useRef(null);
//   const bgRef = useRef(null);
//   const rightCloudRef = useRef(null);
//   const leftCloudRef = useRef(null);
//   const floorRef = useRef(null);
//   const leftElementRef = useRef(null);
//   const rightElementRef = useRef(null);

//   const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
//   const [imagesLoaded, setImagesLoaded] = useState(false);

//   // ✅ handle responsiveness
//   useEffect(() => {
//     const handleResize = () => setIsMobile(window.innerWidth <= 768);
//     handleResize();
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   // ✅ preload all assets
//   useEffect(() => {
//     const sources = [
//       isMobile ? yellow_bg_mobile : yellow_bg,
//       isMobile ? right_cloud_mobile : right_cloud,
//       isMobile ? left_cloud_mobile : left_cloud,
//       isMobile ? floor_2nd_mobile : floor_2nd,
//       isMobile ? left_element_mobile : left_element,
//       isMobile ? right_element_mobile : right_element
//     ];
//     let loaded = 0;
//     sources.forEach((src) => {
//       const img = new Image();
//       img.onload = () => {
//         loaded++;
//         if (loaded === sources.length) setImagesLoaded(true);
//       };
//       img.src = src;
//     });
//   }, [isMobile]);

//   // ✅ GSAP animations
//   useEffect(() => {
//     if (!imagesLoaded) return;

//     const ctx = gsap.context(() => {
//       gsap.set(rightCloudRef.current, { opacity: 0, y: -50 });
//       gsap.set(leftCloudRef.current, { opacity: 0, y: 80 });
//       gsap.set(floorRef.current, { opacity: 0, y: 150 });
//       gsap.set(leftElementRef.current, { opacity: 0, x: -200 });
//       gsap.set(rightElementRef.current, { opacity: 0, x: 200 });

//       const tl = gsap.timeline({
//         scrollTrigger: {
//           trigger: containerRef.current,
//           start: "top top",
//           end: "bottom+=100% top",
//           scrub: 0.8,
//           pin: true,
//           markers: false
//         }
//       });

//       // 🌥 cloud animations
//       tl.to(rightCloudRef.current, {
//         opacity: 1,
//         y: 0,
//         duration: 1.2,
//         ease: "power2.out"
//       })
//         .to(
//           leftCloudRef.current,
//           {
//             opacity: 1,
//             y: 0,
//             duration: 1.2,
//             ease: "power2.out"
//           },
//           "-=0.8"
//         )

//         // 🧱 floor slide-in
//         .to(
//           floorRef.current,
//           {
//             opacity: 1,
//             y: 0,
//             duration: 1.4,
//             ease: "power2.out"
//           },
//           "-=0.8"
//         )

//         // 🎭 side elements slide-in with overshoot
//         .to(
//           leftElementRef.current,
//           {
//             opacity: 1,
//             x: isMobile ? "5vw" : "10vw",
//             duration: 1.2,
//             ease: "back.out(1.7)"
//           },
//           "-=1"
//         )
//         .to(
//           rightElementRef.current,
//           {
//             opacity: 1,
//             x: isMobile ? "-5vw" : "-10vw",
//             duration: 1.2,
//             ease: "back.out(1.7)"
//           },
//           "-=1"
//         );
//     }, containerRef);

//     return () => ctx.revert();
//   }, [imagesLoaded, isMobile]);

//   return (
//     <section
//       ref={containerRef}
//       className="relative w-full h-screen overflow-hidden bg-black"
//     >
//       {!imagesLoaded && (
//         <div className="absolute inset-0 flex items-center justify-center text-white z-50 text-xl">
//           loading...
//         </div>
//       )}

//       {/* 🌕 background */}
//       <img
//         ref={bgRef}
//         src={isMobile ? yellow_bg_mobile : yellow_bg}
//         alt="yellow background"
//         className="absolute inset-0 w-full h-full object-cover z-[1]"
//       />

//       {/* ☁️ right cloud */}
//       <img
//         ref={rightCloudRef}
//         src={isMobile ? right_cloud_mobile : right_cloud}
//         alt="right cloud"
//         className="absolute right-0 z-[5]"
//         style={{
//           top: isMobile ? "4vh" : "6vh",
//           width: isMobile ? "40vw" : "28vw"
//         }}
//       />

//       {/* ☁️ left cloud */}
//       <img
//         ref={leftCloudRef}
//         src={isMobile ? left_cloud_mobile : left_cloud}
//         alt="left cloud"
//         className="absolute left-0 z-[5]"
//         style={{
//           top: isMobile ? "14vh" : "12vh",
//           width: isMobile ? "40vw" : "30vw"
//         }}
//       />

//       {/* 🧱 floor */}
//       <img
//         ref={floorRef}
//         src={isMobile ? floor_2nd_mobile : floor_2nd}
//         alt="floor"
//         className="absolute left-1/2 -translate-x-1/2 z-[10]"
//         style={{
//           bottom: 0,
//           height: isMobile ? "10vh" : "30vh",
//           width: "100%"
//         }}
//       />

//       {/* 🎭 side elements */}
//       <img
//         ref={leftElementRef}
//         src={isMobile ? left_element_mobile : left_element}
//         alt="left element"
//         className="absolute z-[8]"
//         style={{
//           top: isMobile ? "20vh" : "50vh",
//           left: 0,
//           transform: "translateY(-50%)"
//         }}
//       />

//       <img
//         ref={rightElementRef}
//         src={isMobile ? right_element_mobile : right_element}
//         alt="right element"
//         className="absolute z-[8]"
//         style={{
//           top: isMobile ? "20vh" : "50vh",
//           right: 0,
//           transform: "translateY(-50%)"
//         }}
//       />
//     </section>
//   );
// };

// export default Scene1_1;

// Scene1_1.jsx
import React, { useRef } from "react";
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
  right_element_mobile
} from "../../assets/images/Home";

// 🎥 exported timeline builder
export const useScene1_1Timeline = (refs, isMobile) => {
  const tl = gsap.timeline();

  tl.set(refs.rightCloud, { opacity: 0, y: -50 })
    .set(refs.leftCloud, { opacity: 0, y: 80 })
    .set(refs.floor, { opacity: 0, y: 150 })
    .set(refs.leftElement, { opacity: 0, x: -200 })
    .set(refs.rightElement, { opacity: 0, x: 200 });

  tl.to(refs.rightCloud, {
    opacity: 1,
    y: 0,
    duration: 1.2,
    ease: "power2.out"
  })
    .to(
      refs.leftCloud,
      { opacity: 1, y: 0, duration: 1.2, ease: "power2.out" },
      "-=0.8"
    )
    .to(
      refs.floor,
      { opacity: 1, y: 0, duration: 1.4, ease: "power2.out" },
      "-=0.8"
    )
    .to(
      refs.leftElement,
      {
        opacity: 1,
        x: 0,
        duration: 1.2,
        ease: "back.out(1.7)"
      },
      "-=1"
    )
    .to(
      refs.rightElement,
      {
        opacity: 1,
        x: 0,
        duration: 1.2,
        ease: "back.out(1.7)"
      },
      "-=1"
    );

  return tl;
};

// 🎨 scene visuals
const Scene1_1 = React.forwardRef((props, ref) => {
  const { isMobile } = props;

  // ✅ main container ref
  const containerRef = useRef(null);
  const bgRef = useRef(null);
  const rightCloudRef = useRef(null);
  const leftCloudRef = useRef(null);
  const floorRef = useRef(null);
  const leftElementRef = useRef(null);
  const rightElementRef = useRef(null);

  // ✅ expose refs to parent
  React.useImperativeHandle(ref, () => ({
    container: containerRef.current,
    bg: bgRef.current,
    rightCloud: rightCloudRef.current,
    leftCloud: leftCloudRef.current,
    floor: floorRef.current,
    leftElement: leftElementRef.current,
    rightElement: rightElementRef.current
  }));

  return (
    <section
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden bg-black"
    >
      {/* 🌕 background */}
      <img
        ref={bgRef}
        src={isMobile ? yellow_bg_mobile : yellow_bg}
        alt="yellow background"
        className="absolute inset-0 w-full h-full object-cover z-[1]"
      />

      {/* ☁️ right cloud */}
      <img
        ref={rightCloudRef}
        src={isMobile ? right_cloud_mobile : right_cloud}
        alt="right cloud"
        className="absolute right-0 z-[5]"
        style={{
          top: isMobile ? "8vh" : "8vh",
          width: isMobile ? "35vw" : "20vw",
          height: "auto"
        }}
      />

      {/* ☁️ left cloud */}
      <img
        ref={leftCloudRef}
        src={isMobile ? left_cloud_mobile : left_cloud}
        alt="left cloud"
        className="absolute left-0 z-[5]"
        style={{
          top: isMobile ? "16vh" : "18vh",
          width: isMobile ? "35vw" : "22vw",
          height: "auto"
        }}
      />

      {/* 🧱 floor - CENTERED */}
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

      {/* 🎭 left element - 10% VISIBLE FROM LEFT */}
      <img
        ref={leftElementRef}
        src={isMobile ? left_element_mobile : left_element}
        alt="left element"
        className="absolute z-[11]"
        style={{
          top: isMobile ? "50%" : "50%",
          left: isMobile ? "-40%" : "-30%",
          transform: "translateY(-50%)",
          width: isMobile ? "60vw" : "50vw",
          height: "auto"
        }}
      />

      {/* 🎭 right element - 10% VISIBLE FROM RIGHT */}
      <img
        ref={rightElementRef}
        src={isMobile ? right_element_mobile : right_element}
        alt="right element"
        className="absolute z-[11]"
        style={{
          top: isMobile ? "50%" : "50%",
          right: isMobile ? "-40%" : "-30%",
          transform: "translateY(-50%)",
          width: isMobile ? "60vw" : "50vw",
          height: "auto"
        }}
      />
    </section>
  );
});

export default Scene1_1;
