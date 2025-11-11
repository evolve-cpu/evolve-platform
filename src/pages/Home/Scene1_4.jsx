// // src/scenes/Scene1_4.jsx
// import React, {
//   useRef,
//   useImperativeHandle,
//   forwardRef,
//   useLayoutEffect
// } from "react";
// import { gsap } from "gsap";
// import {
//   evolve_text,
//   marquee_vector_1,
//   marquee_vector_2
// } from "../../assets/images/Nav";

// // -----------------------------
// // timeline hook (for master TL)
// // -----------------------------
// export const useScene1_4Timeline = (refs, isMobile) => {
//   const tl = gsap.timeline({ paused: true });

//   // helper: resolve on-demand from either direct ref or via data-el inside container
//   const pick = (key) => {
//     if (refs?.[key]) return refs[key];
//     if (refs?.container)
//       return refs.container.querySelector(`[data-el="${key}"]`);
//     return null;
//   };

//   // Add a small delay, then animate texts
//   tl.to({}, { duration: 0.5 });

//   // first line -> visible
//   tl.addLabel("line1")
//     .to(() => pick("text1"), {
//       opacity: 1,
//       y: 0,
//       duration: 0.9,
//       ease: "power2.out"
//     })
//     .to({}, { duration: 0.8 });

//   // second line -> visible
//   tl.addLabel("line2")
//     .to(() => pick("text2"), {
//       opacity: 1,
//       y: 0,
//       duration: 0.9,
//       ease: "power2.out"
//     })
//     .to({}, { duration: 1 });

//   return tl;
// };

// // -----------------------------
// // component
// // -----------------------------
// const Scene1_4 = forwardRef(function Scene1_4(props, ref) {
//   const { isMobile } = props;

//   // element refs
//   const containerRef = useRef(null);
//   const text1Ref = useRef(null);
//   const text2Ref = useRef(null);
//   const marqueeRef = useRef(null);
//   const marqueeTrackRef = useRef(null);
//   const marqueeGroupRef = useRef(null);

//   // expose to parent (master TL expects these keys)
//   useImperativeHandle(ref, () => ({
//     container: containerRef.current,
//     text1: text1Ref.current,
//     text2: text2Ref.current,
//     marquee: marqueeRef.current
//   }));

//   // self-running marquee (independent of master TL)
//   useLayoutEffect(() => {
//     const group = marqueeGroupRef.current;
//     const track = marqueeTrackRef.current;
//     if (!group || !track) return;

//     // clone once for seamless scroll
//     const clone = group.cloneNode(true);
//     track.appendChild(clone);

//     let cleanupAnim = null;

//     const start = () => {
//       const groupWidth = group.getBoundingClientRect().width;
//       if (!groupWidth) return;

//       gsap.set(track, { x: 0 });

//       const anim = gsap.to(track, {
//         x: -groupWidth,
//         duration: 20,
//         ease: "none",
//         repeat: -1,
//         modifiers: {
//           x: gsap.utils.unitize((x) => {
//             const v = parseFloat(x);
//             return (v % -groupWidth) + 0 || 0;
//           })
//         }
//       });

//       cleanupAnim = () => anim.kill();
//     };

//     // wait for images to load so width is correct
//     const imgs = track.querySelectorAll("img");
//     const allLoaded = Array.from(imgs).every((im) => im.complete);
//     let loadedCount = 0;

//     const onImg = () => {
//       loadedCount += 1;
//       if (loadedCount >= imgs.length) start();
//     };

//     if (allLoaded) {
//       start();
//     } else {
//       imgs.forEach((im) => {
//         im.addEventListener("load", onImg, { once: true });
//         im.addEventListener("error", onImg, { once: true });
//       });
//     }

//     // handle resizes to keep it seamless
//     const ro = new ResizeObserver(() => {
//       if (cleanupAnim) cleanupAnim();
//       requestAnimationFrame(start);
//     });
//     ro.observe(group);

//     return () => {
//       if (cleanupAnim) cleanupAnim();
//       ro.disconnect();
//     };
//   }, []);

//   return (
//     <section
//       ref={containerRef}
//       className="absolute inset-0 w-full h-full overflow-hidden bg-evolve-lavender-indigo flex flex-col"
//     >
//       {/* top text block */}
//       <div className="flex-1 flex items-center justify-center px-8 md:px-16">
//         <div className="max-w-6xl w-full flex flex-col items-center">
//           <p
//             ref={text1Ref}
//             data-el="text1"
//             className="text-white lowercase mb-4 md:mb-8 text-center"
//             style={{
//               fontSize: isMobile ? "24px" : "40px",
//               fontWeight: isMobile ? 500 : 400,
//               lineHeight: isMobile ? "28px" : "48px",
//               maxWidth: isMobile ? "90vw" : "1000px",
//               willChange: "transform, opacity"
//             }}
//           >
//             we're not here to hand out certificates.
//           </p>

//           <p
//             ref={text2Ref}
//             data-el="text2"
//             className="text-white lowercase font-extrabold text-center"
//             style={{
//               fontSize: isMobile ? "40px" : "64px",
//               lineHeight: isMobile ? "36px" : "72px",
//               maxWidth: isMobile ? "90vw" : "1000px",
//               willChange: "transform, opacity"
//             }}
//           >
//             we're here to empower you to see new perspectives.
//           </p>
//         </div>
//       </div>

//       {/* marquee bar */}
//       <div
//         ref={marqueeRef}
//         data-el="marquee"
//         className="w-full h-16 md:h-[9rem] border-t-2 border-evolve-yellow bg-evolve-lavender-indigo overflow-hidden relative"
//       >
//         <div
//           ref={marqueeTrackRef}
//           className="absolute top-1/2 -translate-y-1/2 left-0 flex whitespace-nowrap"
//           style={{ willChange: "transform" }}
//         >
//           <div
//             ref={marqueeGroupRef}
//             className="flex items-center gap-8 md:gap-14 pr-8 md:pr-14 flex-none"
//           >
//             <img
//               src={marquee_vector_1}
//               alt="vector 1"
//               className="h-10 md:h-[5rem] w-auto flex-none"
//             />
//             <img
//               src={evolve_text}
//               alt="evolve text"
//               className="h-8 md:h-[4rem] w-auto flex-none"
//             />
//             <img
//               src={marquee_vector_2}
//               alt="vector 2"
//               className="h-10 md:h-[5rem] w-auto flex-none"
//             />
//             <img
//               src={evolve_text}
//               alt="evolve text"
//               className="h-8 md:h-[4rem] w-auto flex-none"
//             />
//             <img
//               src={marquee_vector_1}
//               alt="vector 1"
//               className="h-10 md:h-[5rem] w-auto flex-none"
//             />
//             <img
//               src={evolve_text}
//               alt="evolve text"
//               className="h-8 md:h-[4rem] w-auto flex-none"
//             />
//             <img
//               src={marquee_vector_2}
//               alt="vector 2"
//               className="h-10 md:h-[5rem] w-auto flex-none"
//             />
//             <img
//               src={evolve_text}
//               alt="evolve text"
//               className="h-8 md:h-[4rem] w-auto flex-none"
//             />
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// });

// Scene1_4.displayName = "Scene1_4";
// export default Scene1_4;
