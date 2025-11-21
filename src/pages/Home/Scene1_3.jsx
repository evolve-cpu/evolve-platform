// import React, { useRef, useImperativeHandle } from "react";
// import { gsap } from "gsap";

// /* -------------------- timeline builder (no ScrollTrigger) -------------------- */

// const STEPS = [
//   {
//     key: "see",
//     // body: "hunt for the details <br/>everyone else misses.",
//     body: "notice what others miss.",
//     from: 1000,
//     to: 1048
//   },
//   {
//     key: "think",
//     body: "ask what others don’t.",
//     from: 1049,
//     to: 1097
//   },
//   {
//     key: "make",
//     body: "design like it matters.",
//     from: 1098,
//     to: 1146
//   },
//   {
//     key: "ship",
//     body: "send it to the real world.",
//     from: 1147,
//     to: 1195
//   },
//   {
//     key: "share",
//     // body: "tell the story so well <br/>they can't ignore it.",
//     body: "stories that stick.",
//     from: 1196,
//     to: 1241
//   }
// ];

// const pad = (n, w = 4) => String(n).padStart(w, "0");
// const srcFor = (i, basePath, prefix, ext) =>
//   `${basePath}/${prefix}${pad(i)}.${ext}`;

// export const useScene1_3Timeline = (refs, isMobile) => {
//   const tl = gsap.timeline({ defaults: { ease: "none" } });

//   // canvas setup
//   const canvas = refs.canvas;
//   const ctx = canvas?.getContext?.("2d");
//   const W = isMobile ? 720 : 1080;
//   const H = isMobile ? 720 : 1080;
//   if (canvas) {
//     canvas.width = W;
//     canvas.height = H;
//   }

//   // sequence config (served from /public)
//   const basePath = "/assets/seed_to_plant";
//   const prefix = "Seed ot plant_";
//   const ext = "png";
//   const TOTAL_START = 1000;
//   const TOTAL_END = 1241;

//   const cache = new Map();

//   const decodeFrame = async (idx) => {
//     if (!idx || idx < TOTAL_START || idx > TOTAL_END) return null;
//     if (cache.has(idx)) return cache.get(idx);

//     const img = new Image();
//     img.decoding = "async";
//     img.crossOrigin = "anonymous";
//     img.src = srcFor(idx, basePath, prefix, ext);

//     try {
//       await img.decode();
//       const bmp = window.createImageBitmap
//         ? await createImageBitmap(img).catch(() => img)
//         : img;
//       cache.set(idx, bmp);
//       return bmp;
//     } catch {
//       return null;
//     }
//   };

//   const draw = async (idx) => {
//     if (!ctx) return;
//     const bmp = await decodeFrame(idx);
//     if (!bmp) return;
//     ctx.clearRect(0, 0, W, H);
//     ctx.drawImage(bmp, 0, 0, W, H);
//   };

//   const warm = (from, count = 24) => {
//     const end = Math.min(TOTAL_END, from + count);
//     for (let i = from; i <= end; i++) {
//       window.requestIdleCallback
//         ? requestIdleCallback(() => decodeFrame(i), { timeout: 120 })
//         : setTimeout(() => decodeFrame(i), 0);
//     }
//   };

//   /* ---------- reversible text logic driven by frame.v (no tl.call swaps) ---------- */

//   let textSwapTimeline = null;

//   const swapText = (subEl, bodyEl, newSub, newBody, dir = 1) => {
//     if (!subEl || !bodyEl) return;

//     // if already showing correct text, ensure visible and placed
//     // if (subEl.textContent === newSub && bodyEl.textContent === newBody) {
//     if (subEl.textContent === newSub && bodyEl.innerHTML === newBody) {
//       gsap.to([subEl, bodyEl], {
//         y: 0,
//         opacity: 1,
//         duration: 0.2,
//         ease: "power2.out"
//       });
//       return;
//     }

//     if (textSwapTimeline) textSwapTimeline.kill();

//     const outY = dir > 0 ? -100 : 100; // forward scroll moves current text up; backward moves it down
//     const inY = dir > 0 ? 100 : -100;

//     textSwapTimeline = gsap.timeline();
//     textSwapTimeline
//       .to([subEl, bodyEl], {
//         y: outY,
//         opacity: 0,
//         duration: 0.22,
//         ease: "power2.in"
//       })
//       // .call(() => {
//       //   subEl.textContent = newSub;
//       //   bodyEl.textContent = newBody;
//       //   gsap.set([subEl, bodyEl], { y: inY, opacity: 0 });
//       // })
//       .call(() => {
//         subEl.textContent = newSub;
//         bodyEl.innerHTML = newBody; // Changed from textContent to innerHTML
//         gsap.set([subEl, bodyEl], { y: inY, opacity: 0 });
//       })
//       .to(
//         [subEl, bodyEl],
//         { y: 0, opacity: 1, duration: 0.24, ease: "power2.out" },
//         "+=0.02"
//       );
//   };

//   // shared frame object (drives both sequence and text)
//   const frame = { v: STEPS[0].from };

//   // preset first paint for texts to avoid flashes
//   // if (refs.sub && refs.body) {
//   //   refs.sub.textContent = STEPS[0].key;
//   //   refs.body.textContent = STEPS[0].body;
//   //   gsap.set([refs.sub, refs.body], { y: 0, opacity: 1 });
//   // }

//   if (refs.sub && refs.body) {
//     refs.sub.textContent = STEPS[0].key;
//     refs.body.innerHTML = STEPS[0].body; // Changed to innerHTML
//     gsap.set([refs.sub, refs.body], { y: 0, opacity: 1 });
//   }

//   // draw initial frame and warm cache
//   // ✅ Draw initial frame IMMEDIATELY (not in timeline)
//   if (ctx) {
//     (async () => {
//       await draw(STEPS[0].from);
//       warm(STEPS[0].from, 24);
//     })();
//   }

//   // Also add it to timeline at position 0 as backup
//   tl.call(
//     () => {
//       draw(STEPS[0].from);
//       warm(STEPS[0].from, 24);
//     },
//     null,
//     0
//   );

//   const stepDur = 2; // how much master time each step consumes

//   // build only the frame tweens (no text calls in here)
//   STEPS.forEach((s) => {
//     // warm at start of each segment
//     tl.call(() => warm(s.from, 24));
//     tl.to(frame, {
//       v: s.to,
//       duration: stepDur,
//       onUpdate: () => {
//         const i = Math.round(frame.v);
//         // Use RAF for smoother drawing
//         requestAnimationFrame(() => draw(i));

//         // light cache pruning
//         for (const k of cache.keys()) {
//           if (k < s.from - 30 || k > s.to + 60) cache.delete(k);
//         }
//       }
//     });
//   });

//   // optional settle
//   tl.to({}, { duration: 0.25 });

//   // global text updater that reverses correctly
//   let lastV = frame.v;

//   const indexFor = (v) => {
//     for (let i = 0; i < STEPS.length; i++) {
//       const s = STEPS[i];
//       if (v >= s.from && v <= s.to) return i;
//     }
//     // clamp outside bounds
//     if (v < STEPS[0].from) return 0;
//     if (v > STEPS[STEPS.length - 1].to) return STEPS.length - 1;
//     return 0;
//   };

//   // ensure initial text is correct and visible
//   // tl.call(
//   //   () => {
//   //     if (refs.sub && refs.body) {
//   //       refs.sub.textContent = STEPS[0].key;
//   //       refs.body.textContent = STEPS[0].body;
//   //       gsap.set([refs.sub, refs.body], { y: 0, opacity: 1 });
//   //     }
//   //   },
//   //   null,
//   //   0.001
//   // );

//   tl.call(
//     () => {
//       if (refs.sub && refs.body) {
//         refs.sub.textContent = STEPS[0].key;
//         refs.body.innerHTML = STEPS[0].body; // Changed to innerHTML
//         gsap.set([refs.sub, refs.body], { y: 0, opacity: 1 });
//       }
//     },
//     null,
//     0.001
//   );

//   let activeIndex = 0;

//   tl.eventCallback("onUpdate", () => {
//     const v = Math.round(frame.v);
//     const dir = v - lastV >= 0 ? 1 : -1;
//     const idx = indexFor(v);

//     if (idx !== activeIndex && refs.sub && refs.body) {
//       const s = STEPS[idx];
//       swapText(refs.sub, refs.body, s.key, s.body, dir);
//       activeIndex = idx;
//     }

//     lastV = v;
//   });

//   return tl;
// };

// /* ------------------------------- scene layout ------------------------------- */

// const Scene1_3 = React.forwardRef(({ isMobile = false }, ref) => {
//   const containerRef = useRef(null);
//   const initialSceneRef = useRef(null);
//   const continuationRef = useRef(null);

//   // left texts
//   const headingRef = useRef(null);
//   const subRef = useRef(null);
//   const bodyRef = useRef(null);

//   // right canvas
//   const canvasRef = useRef(null);

//   useImperativeHandle(ref, () => ({
//     container: containerRef.current,
//     initialScene: initialSceneRef.current,
//     continuation: continuationRef.current,
//     heading: headingRef.current,
//     sub: subRef.current,
//     body: bodyRef.current,
//     canvas: canvasRef.current
//   }));

//   return (
//     <section
//       ref={containerRef}
//       className="absolute inset-0 w-full h-full overflow-hidden"
//     >
//       {/* Initial scene wrapper */}
//       <div
//         ref={initialSceneRef}
//         className="absolute inset-0 w-full h-full"
//         style={{ willChange: "transform" }}
//       >
//         {/* desktop */}
//         {!isMobile && (
//           <div className="grid grid-cols-2 w-full h-full">
//             {/* left 50% */}
//             <div className="flex flex-col h-full">
//               {/* top 40% */}
//               <div className="relative" style={{ height: "40%" }}>
//                 <div className="absolute inset-0 bg-evolve-lavender-indigo" />
//                 <div className="absolute inset-0 flex items-end p-8">
//                   {/* <h2
//                     ref={headingRef}
//                     className="text-white lowercase font-extrabold leading-none text-8xl"
//                     style={{ lineHeight: "1.0" }}
//                   >
//                     how you
//                     <br /> will evolve
//                   </h2> */}
//                   <h2
//                     ref={headingRef}
//                     className={[
//                       "text-white lowercase font-extrabold leading-none",

//                       // default desktop-wide → 96px
//                       "text-[96px]",

//                       // desktop compact → 64px
//                       "[@media(min-width:1024px)]:[@media(min-height:768px)]:text-[64px]",

//                       // desktop base → 96px
//                       "[@media(min-width:1024px)]:[@media(min-height:900px)]:text-[96px]",

//                       // desktop tall → 96px
//                       "[@media(min-width:1024px)]:[@media(min-height:1080px)]:text-[96px]",

//                       // desktop wide → 96px
//                       "[@media(min-width:1700px)]:text-[96px]"
//                     ].join(" ")}
//                     style={{ lineHeight: "1.0" }}
//                   >
//                     how you
//                     <br /> will evolve
//                   </h2>
//                 </div>
//               </div>

//               {/* bottom 60% pink */}
//               <div className="relative" style={{ height: "60%" }}>
//                 <div className="absolute inset-0 bg-evolve-pink" />
//                 <div className="absolute inset-0 flex flex-col text-white lowercase p-10 overflow-hidden">
//                   <div className="mt-[10vh]" />
//                   <div className="overflow-hidden">
//                     <h3
//                       ref={subRef}
//                       className="font-extrabold text-6xl tracking-tight"
//                       style={{ opacity: 0, transform: "translateY(20px)" }}
//                     />
//                   </div>
//                   <div className="h-4" />
//                   <div className="overflow-hidden">
//                     <p
//                       ref={bodyRef}
//                       className={[
//                         "font-medium max-w-[42ch] leading-none",

//                         // default desktop → 36px
//                         "text-[36px]",

//                         // desktop compact → 24px
//                         "[@media(min-width:1024px)]:[@media(min-height:768px)]:text-[24px]",

//                         // desktop base → 36px
//                         "[@media(min-width:1024px)]:[@media(min-height:900px)]:text-[36px]",

//                         // desktop tall → 36px
//                         "[@media(min-width:1024px)]:[@media(min-height:1080px)]:text-[36px]",

//                         // desktop wide → 36px
//                         "[@media(min-width:1700px)]:text-[36px]"
//                       ].join(" ")}
//                       style={{
//                         opacity: 0,
//                         transform: "translateY(20px)",
//                         lineHeight: "100%"
//                       }}
//                     />
//                     {/* body content here */}
//                     {/* </p> */}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* right 50% sequence */}
//             <div className="relative h-full bg-black">
//               <canvas
//                 ref={canvasRef}
//                 className="w-full h-full block object-contain"
//               />
//             </div>
//           </div>
//         )}

//         {/* mobile */}
//         {/* mobile */}
//         {isMobile && (
//           <div className="grid grid-rows-[25%_50%_25%] w-full h-full">
//             <div className="relative">
//               <div className="absolute inset-0 bg-evolve-lavender-indigo" />
//               <div className="absolute inset-0 flex items-end justify-start p-4">
//                 <h2 className="text-white lowercase font-extrabold text-[3rem] leading-none text-left">
//                   how you <br />
//                   will evolve
//                 </h2>
//               </div>
//             </div>

//             <div className="relative bg-black">
//               <canvas
//                 ref={canvasRef}
//                 className="w-full h-full block object-contain"
//               />
//             </div>

//             <div className="relative">
//               <div className="absolute inset-0 bg-evolve-pink" />
//               <div className="absolute inset-0 flex flex-col items-start justify-center text-white lowercase p-6 overflow-hidden">
//                 <div className="overflow-hidden">
//                   <h3
//                     ref={subRef}
//                     className="font-extrabold text-[2rem] text-left"
//                     style={{ opacity: 0, transform: "translateY(20px)" }}
//                   />
//                 </div>
//                 <div className="h-2" />
//                 <div className="overflow-hidden">
//                   <p
//                     ref={bodyRef}
//                     className="font-medium text-[24px] max-w-[30ch] text-left"
//                     style={{
//                       opacity: 0,
//                       transform: "translateY(20px)",
//                       lineHeight: "100%"
//                     }}
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Continuation section - appears after slide up */}
//       {/* Continuation section - appears after slide up */}
//     </section>
//   );
// });

// Scene1_3.displayName = "Scene1_3";
// export default Scene1_3;

// import React, { useRef, useImperativeHandle } from "react";
// import { gsap } from "gsap";

// /* -------------------- timeline builder (no ScrollTrigger) -------------------- */

// const STEPS = [
//   {
//     key: "see",
//     body: "notice what others miss.",
//     from: 1000,
//     to: 1048
//   },
//   {
//     key: "think",
//     body: "ask what others don't.",
//     from: 1049,
//     to: 1097
//   },
//   {
//     key: "make",
//     body: "design like it matters.",
//     from: 1098,
//     to: 1146
//   },
//   {
//     key: "ship",
//     body: "send it to the real world.",
//     from: 1147,
//     to: 1195
//   },
//   {
//     key: "share",
//     body: "stories that stick.",
//     from: 1196,
//     to: 1241
//   }
// ];

// const pad = (n, w = 4) => String(n).padStart(w, "0");
// const srcFor = (i, basePath, prefix, ext) =>
//   `${basePath}/${prefix}${pad(i)}.${ext}`;

// export const useScene1_3Timeline = (refs, isMobile) => {
//   const tl = gsap.timeline({ defaults: { ease: "none" } });

//   // canvas setup
//   const canvas = refs.canvas;
//   const ctx = canvas?.getContext?.("2d");
//   const W = isMobile ? 720 : 1080;
//   const H = isMobile ? 720 : 1080;
//   if (canvas) {
//     canvas.width = W;
//     canvas.height = H;
//   }

//   // sequence config (served from /public)
//   const basePath = "/assets/seed_to_plant";
//   const prefix = "Seed ot plant_";
//   const ext = "png";
//   const TOTAL_START = 1000;
//   const TOTAL_END = 1241;

//   const cache = new Map();

//   const decodeFrame = async (idx) => {
//     if (!idx || idx < TOTAL_START || idx > TOTAL_END) return null;
//     if (cache.has(idx)) return cache.get(idx);

//     const img = new Image();
//     img.decoding = "async";
//     img.crossOrigin = "anonymous";
//     img.src = srcFor(idx, basePath, prefix, ext);

//     try {
//       await img.decode();
//       const bmp = window.createImageBitmap
//         ? await createImageBitmap(img).catch(() => img)
//         : img;
//       cache.set(idx, bmp);
//       return bmp;
//     } catch {
//       return null;
//     }
//   };

//   const draw = async (idx) => {
//     if (!ctx) return;
//     const bmp = await decodeFrame(idx);
//     if (!bmp) return;
//     ctx.clearRect(0, 0, W, H);
//     ctx.drawImage(bmp, 0, 0, W, H);
//   };

//   const warm = (from, count = 24) => {
//     const end = Math.min(TOTAL_END, from + count);
//     for (let i = from; i <= end; i++) {
//       window.requestIdleCallback
//         ? requestIdleCallback(() => decodeFrame(i), { timeout: 120 })
//         : setTimeout(() => decodeFrame(i), 0);
//     }
//   };

//   /* ---------- reversible text logic driven by frame.v (no tl.call swaps) ---------- */

//   let textSwapTimeline = null;

//   const swapText = (subEl, bodyEl, newSub, newBody, dir = 1) => {
//     if (!subEl || !bodyEl) return;

//     // if already showing correct text, ensure visible and placed
//     if (subEl.textContent === newSub && bodyEl.innerHTML === newBody) {
//       gsap.to([subEl, bodyEl], {
//         y: 0,
//         opacity: 1,
//         duration: 0.2,
//         ease: "power2.out"
//       });
//       return;
//     }

//     if (textSwapTimeline) textSwapTimeline.kill();

//     const outY = dir > 0 ? -100 : 100;
//     const inY = dir > 0 ? 100 : -100;

//     textSwapTimeline = gsap.timeline();
//     textSwapTimeline
//       .to([subEl, bodyEl], {
//         y: outY,
//         opacity: 0,
//         duration: 0.22,
//         ease: "power2.in"
//       })
//       .call(() => {
//         subEl.textContent = newSub;
//         bodyEl.innerHTML = newBody;
//         gsap.set([subEl, bodyEl], { y: inY, opacity: 0 });
//       })
//       .to(
//         [subEl, bodyEl],
//         { y: 0, opacity: 1, duration: 0.24, ease: "power2.out" },
//         "+=0.02"
//       );
//   };

//   // shared frame object (drives both sequence and text)
//   const frame = { v: STEPS[0].from };

//   // preset first paint for texts to avoid flashes
//   if (refs.sub && refs.body) {
//     refs.sub.textContent = STEPS[0].key;
//     refs.body.innerHTML = STEPS[0].body;
//     gsap.set([refs.sub, refs.body], { y: 0, opacity: 1 });
//   }

//   // draw initial frame and warm cache
//   if (ctx) {
//     (async () => {
//       await draw(STEPS[0].from);
//       warm(STEPS[0].from, 24);
//     })();
//   }

//   // Also add it to timeline at position 0 as backup
//   tl.call(
//     () => {
//       draw(STEPS[0].from);
//       warm(STEPS[0].from, 24);
//     },
//     null,
//     0
//   );

//   const stepDur = 2; // how much master time each step consumes

//   // animate text group upward as plant grows
//   const textGroup = refs.textGroup;
//   const initialY = 0;
//   const maxUpwardShift = isMobile ? -80 : -120; // how far text moves up

//   // build only the frame tweens (no text calls in here)
//   STEPS.forEach((s, idx) => {
//     // warm at start of each segment
//     tl.call(() => warm(s.from, 24));

//     // calculate progress through all steps for smooth upward movement
//     const progressStart = idx / STEPS.length;
//     const progressEnd = (idx + 1) / STEPS.length;
//     const yStart = initialY + maxUpwardShift * progressStart;
//     const yEnd = initialY + maxUpwardShift * progressEnd;

//     tl.to(
//       frame,
//       {
//         v: s.to,
//         duration: stepDur,
//         onUpdate: () => {
//           const i = Math.round(frame.v);
//           // Use RAF for smoother drawing
//           requestAnimationFrame(() => draw(i));

//           // light cache pruning
//           for (const k of cache.keys()) {
//             if (k < s.from - 30 || k > s.to + 60) cache.delete(k);
//           }
//         }
//       },
//       `>-${stepDur}`
//     );

//     // simultaneously move text group upward
//     if (textGroup) {
//       tl.to(
//         textGroup,
//         {
//           y: yEnd,
//           duration: stepDur,
//           ease: "none"
//         },
//         `<`
//       );
//     }
//   });

//   // optional settle
//   tl.to({}, { duration: 0.25 });

//   // global text updater that reverses correctly
//   let lastV = frame.v;

//   const indexFor = (v) => {
//     for (let i = 0; i < STEPS.length; i++) {
//       const s = STEPS[i];
//       if (v >= s.from && v <= s.to) return i;
//     }
//     // clamp outside bounds
//     if (v < STEPS[0].from) return 0;
//     if (v > STEPS[STEPS.length - 1].to) return STEPS.length - 1;
//     return 0;
//   };

//   // ensure initial text is correct and visible
//   tl.call(
//     () => {
//       if (refs.sub && refs.body) {
//         refs.sub.textContent = STEPS[0].key;
//         refs.body.innerHTML = STEPS[0].body;
//         gsap.set([refs.sub, refs.body], { y: 0, opacity: 1 });
//       }
//     },
//     null,
//     0.001
//   );

//   let activeIndex = 0;

//   tl.eventCallback("onUpdate", () => {
//     const v = Math.round(frame.v);
//     const dir = v - lastV >= 0 ? 1 : -1;
//     const idx = indexFor(v);

//     if (idx !== activeIndex && refs.sub && refs.body) {
//       const s = STEPS[idx];
//       swapText(refs.sub, refs.body, s.key, s.body, dir);
//       activeIndex = idx;
//     }

//     lastV = v;
//   });

//   return tl;
// };

// /* ------------------------------- scene layout ------------------------------- */

// const Scene1_3 = React.forwardRef(({ isMobile = false }, ref) => {
//   const containerRef = useRef(null);
//   const initialSceneRef = useRef(null);
//   const continuationRef = useRef(null);

//   // left texts
//   const headingRef = useRef(null);
//   const subRef = useRef(null);
//   const bodyRef = useRef(null);
//   const textGroupRef = useRef(null);

//   // right canvas
//   const canvasRef = useRef(null);

//   useImperativeHandle(ref, () => ({
//     container: containerRef.current,
//     initialScene: initialSceneRef.current,
//     continuation: continuationRef.current,
//     heading: headingRef.current,
//     sub: subRef.current,
//     body: bodyRef.current,
//     textGroup: textGroupRef.current,
//     canvas: canvasRef.current
//   }));

//   return (
//     <section
//       ref={containerRef}
//       className="absolute inset-0 w-full h-full overflow-hidden"
//     >
//       {/* Initial scene wrapper */}
//       <div
//         ref={initialSceneRef}
//         className="absolute inset-0 w-full h-full"
//         style={{ willChange: "transform" }}
//       >
//         {/* desktop */}
//         {!isMobile && (
//           <div className="grid grid-cols-2 w-full h-full">
//             {/* left 50% - single lavender background */}
//             <div className="relative h-full bg-evolve-lavender-indigo">
//               <div className="absolute inset-0 flex items-center justify-center p-8">
//                 <h2
//                   ref={headingRef}
//                   className={[
//                     "text-white lowercase font-extrabold leading-none",
//                     // default desktop-wide → 96px
//                     "text-[96px]",
//                     // desktop compact → 64px
//                     "[@media(min-width:1024px)]:[@media(min-height:768px)]:text-[64px]",
//                     // desktop base → 96px
//                     "[@media(min-width:1024px)]:[@media(min-height:900px)]:text-[96px]",
//                     // desktop tall → 96px
//                     "[@media(min-width:1024px)]:[@media(min-height:1080px)]:text-[96px]",
//                     // desktop wide → 96px
//                     "[@media(min-width:1700px)]:text-[96px]"
//                   ].join(" ")}
//                   style={{ lineHeight: "1.0" }}
//                 >
//                   how you
//                   <br /> will evolve
//                 </h2>
//               </div>
//             </div>

//             {/* right 50% - canvas at bottom, text above */}
//             <div className="relative h-full bg-black flex flex-col items-center justify-end">
//               {/* text group - horizontally centered above canvas */}
//               <div
//                 ref={textGroupRef}
//                 className="flex flex-col items-center text-white lowercase px-10 mb-8"
//                 style={{ willChange: "transform" }}
//               >
//                 <div className="overflow-hidden">
//                   <h3
//                     ref={subRef}
//                     className="font-extrabold text-6xl tracking-tight text-center"
//                     style={{ opacity: 0, transform: "translateY(20px)" }}
//                   />
//                 </div>
//                 <div className="h-4" />
//                 <div className="overflow-hidden">
//                   <p
//                     ref={bodyRef}
//                     className={[
//                       "font-medium max-w-[42ch] leading-none text-center",
//                       // default desktop → 36px
//                       "text-[36px]",
//                       // desktop compact → 24px
//                       "[@media(min-width:1024px)]:[@media(min-height:768px)]:text-[24px]",
//                       // desktop base → 36px
//                       "[@media(min-width:1024px)]:[@media(min-height:900px)]:text-[36px]",
//                       // desktop tall → 36px
//                       "[@media(min-width:1024px)]:[@media(min-height:1080px)]:text-[36px]",
//                       // desktop wide → 36px
//                       "[@media(min-width:1700px)]:text-[36px]"
//                     ].join(" ")}
//                     style={{
//                       opacity: 0,
//                       transform: "translateY(20px)",
//                       lineHeight: "100%"
//                     }}
//                   />
//                 </div>
//               </div>

//               {/* canvas at bottom */}
//               <canvas
//                 ref={canvasRef}
//                 className="w-full block object-contain"
//                 style={{ maxHeight: "70%" }}
//               />
//             </div>
//           </div>
//         )}

//         {/* mobile */}
//         {isMobile && (
//           <div className="grid grid-rows-[25%_75%] w-full h-full">
//             {/* top - lavender with heading */}
//             <div className="relative">
//               <div className="absolute inset-0 bg-evolve-lavender-indigo" />
//               <div className="absolute inset-0 flex items-end justify-center p-4">
//                 <h2 className="text-white lowercase font-extrabold text-[3rem] leading-none text-center">
//                   how you <br />
//                   will evolve
//                 </h2>
//               </div>
//             </div>

//             {/* bottom - black background with canvas and text */}
//             <div className="relative bg-black flex flex-col items-center justify-end">
//               {/* text group - horizontally centered above canvas */}
//               <div
//                 ref={textGroupRef}
//                 className="flex flex-col items-center text-white lowercase px-6 mb-6"
//                 style={{ willChange: "transform" }}
//               >
//                 <div className="overflow-hidden">
//                   <h3
//                     ref={subRef}
//                     className="font-extrabold text-[2rem] text-center"
//                     style={{ opacity: 0, transform: "translateY(20px)" }}
//                   />
//                 </div>
//                 <div className="h-2" />
//                 <div className="overflow-hidden">
//                   <p
//                     ref={bodyRef}
//                     className="font-medium text-[24px] max-w-[30ch] text-center"
//                     style={{
//                       opacity: 0,
//                       transform: "translateY(20px)",
//                       lineHeight: "100%"
//                     }}
//                   />
//                 </div>
//               </div>

//               {/* canvas at bottom */}
//               <canvas
//                 ref={canvasRef}
//                 className="w-full block object-contain"
//                 style={{ maxHeight: "60%" }}
//               />
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Continuation section - appears after slide up */}
//     </section>
//   );
// });

// Scene1_3.displayName = "Scene1_3";
// export default Scene1_3;

import React, { useRef, useImperativeHandle } from "react";
import { gsap } from "gsap";

/* -------------------- timeline builder (no ScrollTrigger) -------------------- */

// const STEPS = [
//   {
//     key: "see",
//     body: "notice what others miss.",
//     from: 1000,
//     to: 1048
//   },
//   {
//     key: "think",
//     body: "ask what others don't.",
//     from: 1049,
//     to: 1097
//   },
//   {
//     key: "make",
//     body: "design like it matters.",
//     from: 1098,
//     to: 1146
//   },
//   {
//     key: "ship",
//     body: "send it to the real world.",
//     from: 1147,
//     to: 1195
//   },
//   {
//     key: "share",
//     body: "stories that stick.",
//     from: 1196,
//     to: 1241
//   }
// ];

const STEPS = [
  {
    key: "see",
    body: "notice what others miss.",
    from: 18,
    to: 61 // 18 + 43
  },
  {
    key: "think",
    body: "ask what others don't.",
    from: 62,
    to: 105 // +44
  },
  {
    key: "make",
    body: "design like it matters.",
    from: 106,
    to: 149
  },
  {
    key: "ship",
    body: "send it to the real world.",
    from: 150,
    to: 193
  },
  {
    key: "share",
    body: "stories that stick.",
    from: 194,
    to: 239
  }
];

// const pad = (n, w = 4) => String(n).padStart(w, "0");
const pad = (n, w = 3) => String(n).padStart(w, "0");
const srcFor = (i, basePath, prefix, ext) =>
  `${basePath}/${prefix}${pad(i)}.${ext}`;

export const useScene1_3Timeline = (refs, isMobile) => {
  const tl = gsap.timeline({ defaults: { ease: "none" } });

  // canvas setup
  const canvas = refs.canvas;
  const ctx = canvas?.getContext?.("2d");
  const W = isMobile ? 720 : 1080;
  const H = isMobile ? 720 : 1080;
  if (canvas && ctx) {
    canvas.width = W;
    canvas.height = H;
    ctx.imageSmoothingEnabled = true;
  }

  const basePath = "/assets/seed_to_plant";
  const prefix = "seed to plant_alpha";
  const ext = "png";
  // const TOTAL_START = 1000;
  const TOTAL_START = 18;
  const TOTAL_END = 239;

  /** FRAME CACHE (ALL SYNC ON READ) */
  const cache = new Map();
  let currentFrame = null;

  const decodeFrame = (idx) => {
    if (!idx || idx < TOTAL_START || idx > TOTAL_END) return;
    if (cache.has(idx)) return;

    const img = new Image();
    img.decoding = "async";
    img.crossOrigin = "anonymous";
    img.src = srcFor(idx, basePath, prefix, ext);

    img.onload = async () => {
      let bmp = img;
      if (window.createImageBitmap) {
        try {
          bmp = await createImageBitmap(img);
        } catch {
          // fall back to the <img>
        }
      }
      cache.set(idx, bmp);

      // if.timeline already wants this frame, repaint once ready
      if (currentFrame === idx && ctx) {
        ctx.clearRect(0, 0, W, H);
        ctx.drawImage(bmp, 0, 0, W, H);
      }
    };

    img.onerror = () => {
      // optionally log error, but don't crash
    };
  };

  const draw = (idx) => {
    if (!ctx) return;
    currentFrame = idx;
    const bmp = cache.get(idx);

    if (!bmp) {
      // kick off decode in background, do NOT block scroll
      decodeFrame(idx);
      return;
    }

    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(bmp, 0, 0, W, H);
  };

  // pre-decode all frames in background to avoid jank during scroll
  for (let i = TOTAL_START; i <= TOTAL_END; i++) {
    decodeFrame(i);
  }

  /* ---------- text swap with simple control ---------- */

  let textSwapTimeline = null;

  const swapText = (subEl, bodyEl, newSub, newBody, dir = 1) => {
    if (!subEl || !bodyEl) return;

    // already correct → just snap visible
    if (subEl.textContent === newSub && bodyEl.innerHTML === newBody) {
      gsap.killTweensOf([subEl, bodyEl]);
      gsap.set([subEl, bodyEl], { y: 0, opacity: 1 });
      return;
    }

    if (textSwapTimeline) textSwapTimeline.kill();

    const outY = dir > 0 ? -80 : 80;
    const inY = dir > 0 ? 80 : -80;

    textSwapTimeline = gsap.timeline();

    textSwapTimeline
      .to([subEl, bodyEl], {
        y: outY,
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
        overwrite: true
      })
      .call(() => {
        subEl.textContent = newSub;
        bodyEl.innerHTML = newBody;
        gsap.set([subEl, bodyEl], { y: inY, opacity: 0 });
      })
      .to([subEl, bodyEl], {
        y: 0,
        opacity: 1,
        duration: 0.25,
        ease: "power2.out"
      });
  };

  // shared frame object animated by GSAP
  const frame = { v: STEPS[0].from };

  // initial text
  if (refs.sub && refs.body) {
    refs.sub.textContent = STEPS[0].key;
    refs.body.innerHTML = STEPS[0].body;
    gsap.set([refs.sub, refs.body], { y: 0, opacity: 1 });
  }

  // initial frame draw
  if (ctx) {
    draw(STEPS[0].from);
  }

  tl.call(
    () => {
      draw(STEPS[0].from);
    },
    null,
    0
  );

  // small delay before sequence (if you like)
  tl.to({}, { duration: 1.5 });

  const stepDur = 2.2;

  const textGroup = refs.textGroup;
  const initialY = 0;
  const maxUpwardShift = isMobile ? -60 : -80;

  // simple helper: which step does a frame belong to?
  const getStepIndexForFrame = (frameVal) => {
    const i = Math.round(frameVal);
    for (let idx = 0; idx < STEPS.length; idx++) {
      const s = STEPS[idx];
      if (i >= s.from && i <= s.to) return idx;
    }
    if (i < STEPS[0].from) return 0;
    if (i > STEPS[STEPS.length - 1].to) return STEPS.length - 1;
    return 0;
  };

  let lastFrameValue = STEPS[0].from;
  let currentStepIndex = 0;

  // build timeline
  STEPS.forEach((s, idx) => {
    const progressStart = idx / STEPS.length;
    const progressEnd = (idx + 1) / STEPS.length;
    const yEnd = initialY + maxUpwardShift * progressEnd;

    // main frame animation
    tl.to(
      frame,
      {
        v: s.to,
        duration: stepDur,
        ease: "none",
        onUpdate: () => {
          const val = frame.v;
          const i = Math.round(val);

          // draw frame (pure sync)
          if (i !== currentFrame) {
            draw(i);
          }

          // detect scroll direction
          const goingForward = i >= lastFrameValue;
          lastFrameValue = i;

          // detect which step we are in
          const newStepIndex = getStepIndexForFrame(val);

          // if step changed → update text
          if (newStepIndex !== currentStepIndex && refs.sub && refs.body) {
            const step = STEPS[newStepIndex];
            swapText(
              refs.sub,
              refs.body,
              step.key,
              step.body,
              goingForward ? 1 : -1
            );
            currentStepIndex = newStepIndex;
          }
        }
      },
      ">-0" // directly after previous
    );

    // move the text group upwards in sync
    if (textGroup) {
      tl.to(
        textGroup,
        {
          y: yEnd,
          duration: stepDur,
          ease: "none"
        },
        "<" // in parallel with frame animation
      );
    }
  });

  // small settle at end
  tl.to({}, { duration: 0.3 });

  // reset initial state once at start
  tl.call(
    () => {
      if (refs.sub && refs.body) {
        refs.sub.textContent = STEPS[0].key;
        refs.body.innerHTML = STEPS[0].body;
        gsap.set([refs.sub, refs.body], { y: 0, opacity: 1 });
      }
      currentStepIndex = 0;
      lastFrameValue = STEPS[0].from;
    },
    null,
    0.001
  );

  return tl;
};

/* ------------------------------- scene layout ------------------------------- */

const Scene1_3 = React.forwardRef(({ isMobile = false }, ref) => {
  const containerRef = useRef(null);
  const initialSceneRef = useRef(null);
  const continuationRef = useRef(null);

  // left texts
  const headingRef = useRef(null);
  const subRef = useRef(null);
  const bodyRef = useRef(null);
  const textGroupRef = useRef(null);

  // right canvas
  const canvasRef = useRef(null);

  useImperativeHandle(ref, () => ({
    container: containerRef.current,
    initialScene: initialSceneRef.current,
    continuation: continuationRef.current,
    heading: headingRef.current,
    sub: subRef.current,
    body: bodyRef.current,
    textGroup: textGroupRef.current,
    canvas: canvasRef.current
  }));

  return (
    <section
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden"
    >
      {/* Initial scene wrapper */}
      <div
        ref={initialSceneRef}
        className="absolute inset-0 w-full h-full"
        style={{ willChange: "transform" }}
      >
        {/* desktop */}
        {!isMobile && (
          <div className="grid grid-cols-2 w-full h-full">
            {/* left 50% - single lavender background - CENTERED */}
            <div className="relative h-full bg-evolve-lavender-indigo">
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <h2
                  ref={headingRef}
                  className={[
                    "text-white lowercase font-extrabold leading-none",
                    "text-[96px]",
                    "[@media(min-width:1024px)]:[@media(min-height:768px)]:text-[64px]",
                    "[@media(min-width:1024px)]:[@media(min-height:900px)]:text-[96px]",
                    "[@media(min-width:1024px)]:[@media(min-height:1080px)]:text-[96px]",
                    "[@media(min-width:1700px)]:text-[96px]"
                  ].join(" ")}
                  style={{ lineHeight: "1.0" }}
                >
                  how you
                  <br /> will evolve
                </h2>
              </div>
            </div>

            {/* right 50% - canvas at bottom, text above */}
            <div className="relative h-full bg-[#0a0a0a] flex flex-col gap-0 items-center justify-center">
              {/* text group - positioned for proper spacing */}
              <div
                ref={textGroupRef}
                className="flex flex-col items-center text-white lowercase px-10"
                style={{
                  willChange: "transform",
                  paddingTop: "20px"
                }}
              >
                <div className="overflow-hidden">
                  <h3
                    ref={subRef}
                    className="font-extrabold text-4xl tracking-tight text-center"
                    style={{ opacity: 0, transform: "translateY(20px)" }}
                  />
                </div>
                <div className="overflow-hidden mt-2">
                  <p
                    ref={bodyRef}
                    className={[
                      "font-medium max-w-[42ch] leading-none text-center",
                      "text-[32px]",
                      "[@media(min-width:1024px)]:[@media(min-height:768px)]:text-[24px]",
                      "[@media(min-width:1024px)]:[@media(min-height:900px)]:text-[32px]",
                      "[@media(min-width:1024px)]:[@media(min-height:1080px)]:text-[32px]",
                      "[@media(min-width:1700px)]:text-[32px]"
                    ].join(" ")}
                    style={{
                      opacity: 0,
                      transform: "translateY(0px)",
                      lineHeight: "100%"
                    }}
                  />
                </div>
              </div>

              {/* canvas at bottom */}
              <canvas
                ref={canvasRef}
                className="w-full bottom-0 block object-contain"
                style={{ maxHeight: "55%" }}
              />
            </div>
          </div>
        )}

        {/* mobile */}
        {isMobile && (
          <div className="grid grid-rows-[25%_75%] w-full h-full">
            {/* top - lavender with heading */}
            <div className="relative">
              <div className="absolute inset-0 bg-evolve-lavender-indigo" />
              <div className="absolute inset-0 flex items-end justify-center p-4">
                <h2 className="text-white lowercase font-extrabold text-[3rem] leading-none text-center">
                  how you <br />
                  will evolve
                </h2>
              </div>
            </div>

            {/* bottom - black background with canvas and text */}
            <div className="relative bg-[#0a0a0a] flex flex-col items-center justify-end pb-4">
              {/* text group */}
              <div
                ref={textGroupRef}
                className="flex flex-col items-center text-white lowercase px-6 mb-8"
                style={{ willChange: "transform" }}
              >
                <div className="overflow-hidden">
                  <h3
                    ref={subRef}
                    className="font-extrabold text-[2rem] text-center"
                    style={{ opacity: 0, transform: "translateY(20px)" }}
                  />
                </div>
                <div className="h-2" />
                <div className="overflow-hidden">
                  <p
                    ref={bodyRef}
                    className="font-medium text-[24px] max-w-[30ch] text-center"
                    style={{
                      opacity: 0,
                      transform: "translateY(20px)",
                      lineHeight: "100%"
                    }}
                  />
                </div>
              </div>

              {/* canvas at bottom */}
              <canvas
                ref={canvasRef}
                className="w-full block object-contain"
                style={{ maxHeight: "50%" }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
});

Scene1_3.displayName = "Scene1_3";
export default Scene1_3;
