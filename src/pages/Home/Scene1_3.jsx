// import React, { useRef, useImperativeHandle } from "react";
// import { gsap } from "gsap";

// /* -------------------- timeline builder (no ScrollTrigger) -------------------- */

// const STEPS = [
//   {
//     key: "see",
//     body: "notice what others miss.",
//     from: 18,
//     to: 61 // 18 + 43
//   },
//   {
//     key: "think",
//     body: "ask what others don't.",
//     from: 62,
//     to: 105 // +44
//   },
//   {
//     key: "make",
//     body: "design like it matters.",
//     from: 106,
//     to: 149
//   },
//   {
//     key: "ship",
//     body: "send it to the real world.",
//     from: 150,
//     to: 193
//   },
//   {
//     key: "share",
//     body: "stories that stick.",
//     from: 194,
//     to: 239
//   }
// ];

// // const pad = (n, w = 4) => String(n).padStart(w, "0");
// const pad = (n, w = 3) => String(n).padStart(w, "0");
// const srcFor = (i, basePath, prefix, ext) =>
//   `${basePath}/${prefix}${pad(i)}.${ext}`;

// export const useScene1_3Timeline = (refs, isMobile) => {
//   const tl = gsap.timeline({ defaults: { ease: "none" } });

//   // canvas setup
//   const canvas = refs.canvas;
//   const ctx = canvas?.getContext?.("2d");
//   const W = isMobile ? 720 : 1080;
//   const H = isMobile ? 720 : 1080;
//   if (canvas && ctx) {
//     canvas.width = W;
//     canvas.height = H;
//     ctx.imageSmoothingEnabled = true;
//   }

//   const basePath = "/assets/seed_to_plant";
//   const prefix = "seed to plant_alpha";
//   const ext = "png";
//   // const TOTAL_START = 1000;
//   const TOTAL_START = 18;
//   const TOTAL_END = 239;

//   /** FRAME CACHE (ALL SYNC ON READ) */
//   const cache = new Map();
//   let currentFrame = null;

//   const decodeFrame = (idx) => {
//     if (!idx || idx < TOTAL_START || idx > TOTAL_END) return;
//     if (cache.has(idx)) return;

//     const img = new Image();
//     img.decoding = "async";
//     img.crossOrigin = "anonymous";
//     img.src = srcFor(idx, basePath, prefix, ext);

//     img.onload = async () => {
//       let bmp = img;
//       if (window.createImageBitmap) {
//         try {
//           bmp = await createImageBitmap(img);
//         } catch {
//           // fall back to the <img>
//         }
//       }
//       cache.set(idx, bmp);

//       // if.timeline already wants this frame, repaint once ready
//       if (currentFrame === idx && ctx) {
//         ctx.clearRect(0, 0, W, H);
//         ctx.drawImage(bmp, 0, 0, W, H);
//       }
//     };

//     img.onerror = () => {
//       // optionally log error, but don't crash
//     };
//   };

//   const draw = (idx) => {
//     if (!ctx) return;
//     currentFrame = idx;
//     const bmp = cache.get(idx);

//     if (!bmp) {
//       // kick off decode in background, do NOT block scroll
//       decodeFrame(idx);
//       return;
//     }

//     ctx.clearRect(0, 0, W, H);
//     ctx.drawImage(bmp, 0, 0, W, H);
//   };

//   // pre-decode all frames in background to avoid jank during scroll
//   for (let i = TOTAL_START; i <= TOTAL_END; i++) {
//     decodeFrame(i);
//   }

//   /* ---------- text swap with simple control ---------- */

//   let textSwapTimeline = null;

//   const swapText = (subEl, bodyEl, newSub, newBody, dir = 1) => {
//     if (!subEl || !bodyEl) return;

//     // already correct → just snap visible
//     if (subEl.textContent === newSub && bodyEl.innerHTML === newBody) {
//       gsap.killTweensOf([subEl, bodyEl]);
//       gsap.set([subEl, bodyEl], { y: 0, opacity: 1 });
//       return;
//     }

//     if (textSwapTimeline) textSwapTimeline.kill();

//     const outY = dir > 0 ? -80 : 80;
//     const inY = dir > 0 ? 80 : -80;

//     textSwapTimeline = gsap.timeline();

//     textSwapTimeline
//       .to([subEl, bodyEl], {
//         y: outY,
//         opacity: 0,
//         duration: 0.2,
//         ease: "power2.in",
//         overwrite: true
//       })
//       .call(() => {
//         subEl.textContent = newSub;
//         bodyEl.innerHTML = newBody;
//         gsap.set([subEl, bodyEl], { y: inY, opacity: 0 });
//       })
//       .to([subEl, bodyEl], {
//         y: 0,
//         opacity: 1,
//         duration: 0.25,
//         ease: "power2.out"
//       });
//   };

//   // shared frame object animated by GSAP
//   const frame = { v: STEPS[0].from };

//   // initial text
//   if (refs.sub && refs.body) {
//     refs.sub.textContent = STEPS[0].key;
//     refs.body.innerHTML = STEPS[0].body;
//     gsap.set([refs.sub, refs.body], { y: 0, opacity: 1 });
//   }

//   // initial frame draw
//   if (ctx) {
//     draw(STEPS[0].from);
//   }

//   tl.call(
//     () => {
//       draw(STEPS[0].from);
//     },
//     null,
//     0
//   );

//   // small delay before sequence (if you like)
//   tl.to({}, { duration: 1.5 });

//   const stepDur = 2.2;

//   const textGroup = refs.textGroup;
//   const initialY = 0;
//   const maxUpwardShift = isMobile ? -60 : -80;

//   // simple helper: which step does a frame belong to?
//   const getStepIndexForFrame = (frameVal) => {
//     const i = Math.round(frameVal);
//     for (let idx = 0; idx < STEPS.length; idx++) {
//       const s = STEPS[idx];
//       if (i >= s.from && i <= s.to) return idx;
//     }
//     if (i < STEPS[0].from) return 0;
//     if (i > STEPS[STEPS.length - 1].to) return STEPS.length - 1;
//     return 0;
//   };

//   let lastFrameValue = STEPS[0].from;
//   let currentStepIndex = 0;

//   // build timeline
//   STEPS.forEach((s, idx) => {
//     const progressStart = idx / STEPS.length;
//     const progressEnd = (idx + 1) / STEPS.length;
//     const yEnd = initialY + maxUpwardShift * progressEnd;

//     // main frame animation
//     tl.to(
//       frame,
//       {
//         v: s.to,
//         duration: stepDur,
//         ease: "none",
//         onUpdate: () => {
//           const val = frame.v;
//           const i = Math.round(val);

//           // draw frame (pure sync)
//           if (i !== currentFrame) {
//             draw(i);
//           }

//           // detect scroll direction
//           const goingForward = i >= lastFrameValue;
//           lastFrameValue = i;

//           // detect which step we are in
//           const newStepIndex = getStepIndexForFrame(val);

//           // if step changed → update text
//           if (newStepIndex !== currentStepIndex && refs.sub && refs.body) {
//             const step = STEPS[newStepIndex];
//             swapText(
//               refs.sub,
//               refs.body,
//               step.key,
//               step.body,
//               goingForward ? 1 : -1
//             );
//             currentStepIndex = newStepIndex;
//           }
//         }
//       },
//       ">-0" // directly after previous
//     );

//     // move the text group upwards in sync
//     if (textGroup) {
//       tl.to(
//         textGroup,
//         {
//           y: yEnd,
//           duration: stepDur,
//           ease: "none"
//         },
//         "<" // in parallel with frame animation
//       );
//     }
//   });

//   // small settle at end
//   tl.to({}, { duration: 0.3 });

//   // reset initial state once at start
//   tl.call(
//     () => {
//       if (refs.sub && refs.body) {
//         refs.sub.textContent = STEPS[0].key;
//         refs.body.innerHTML = STEPS[0].body;
//         gsap.set([refs.sub, refs.body], { y: 0, opacity: 1 });
//       }
//       currentStepIndex = 0;
//       lastFrameValue = STEPS[0].from;
//     },
//     null,
//     0.001
//   );

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
//             {/* left 50% - single lavender background - CENTERED */}
//             <div className="relative h-full bg-evolve-lavender-indigo">
//               <div className="absolute inset-0 flex items-center justify-center p-8">
//                 <h2
//                   ref={headingRef}
//                   className={[
//                     "text-white lowercase font-extrabold leading-none",
//                     "text-[96px]",
//                     "[@media(min-width:1024px)]:[@media(min-height:768px)]:text-[64px]",
//                     "[@media(min-width:1024px)]:[@media(min-height:900px)]:text-[96px]",
//                     "[@media(min-width:1024px)]:[@media(min-height:1080px)]:text-[96px]",
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
//             <div className="relative h-full bg-[#0a0a0a] flex flex-col gap-0 items-center justify-center">
//               {/* text group - positioned for proper spacing */}
//               <div
//                 ref={textGroupRef}
//                 className="flex flex-col items-center text-white lowercase px-10"
//                 style={{
//                   willChange: "transform",
//                   paddingTop: "20px"
//                 }}
//               >
//                 <div className="overflow-hidden">
//                   <h3
//                     ref={subRef}
//                     className="font-extrabold text-4xl tracking-tight text-center"
//                     style={{ opacity: 0, transform: "translateY(20px)" }}
//                   />
//                 </div>
//                 <div className="overflow-hidden mt-2">
//                   <p
//                     ref={bodyRef}
//                     className={[
//                       "font-medium max-w-[42ch] leading-none text-center",
//                       "text-[32px]",
//                       "[@media(min-width:1024px)]:[@media(min-height:768px)]:text-[24px]",
//                       "[@media(min-width:1024px)]:[@media(min-height:900px)]:text-[32px]",
//                       "[@media(min-width:1024px)]:[@media(min-height:1080px)]:text-[32px]",
//                       "[@media(min-width:1700px)]:text-[32px]"
//                     ].join(" ")}
//                     style={{
//                       opacity: 0,
//                       transform: "translateY(0px)",
//                       lineHeight: "100%"
//                     }}
//                   />
//                 </div>
//               </div>

//               {/* canvas at bottom */}
//               <canvas
//                 ref={canvasRef}
//                 className="w-full bottom-0 block object-contain"
//                 style={{ maxHeight: "65%" }}
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
//             <div className="relative bg-[#0a0a0a] flex flex-col items-center justify-end pb-4">
//               {/* text group */}
//               <div
//                 ref={textGroupRef}
//                 className="flex flex-col items-center text-white lowercase px-6 mb-8"
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
//                 style={{ maxHeight: "50%" }}
//               />
//             </div>
//           </div>
//         )}
//       </div>
//     </section>
//   );
// });

// Scene1_3.displayName = "Scene1_3";
// export default Scene1_3;

import React, { useRef, useImperativeHandle } from "react";
import { gsap } from "gsap";

/* -------------------- timeline builder (no ScrollTrigger) -------------------- */

const STEPS = [
  {
    key: "see",
    body: "notice what others miss.",
    from: 18,
    to: 61
  },
  {
    key: "think",
    body: "ask what others don't.",
    from: 62,
    to: 105
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

export const SCENE1_3_STEP_COUNT = STEPS.length;

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
  const TOTAL_START = 18;
  const TOTAL_END = 239;

  /** FRAME CACHE */
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
          // fallback
        }
      }
      cache.set(idx, bmp);

      if (currentFrame === idx && ctx) {
        ctx.clearRect(0, 0, W, H);
        ctx.drawImage(bmp, 0, 0, W, H);
      }
    };

    img.onerror = () => {
      // ignore
    };
  };

  const draw = (idx) => {
    if (!ctx) return;
    currentFrame = idx;
    const bmp = cache.get(idx);

    if (!bmp) {
      decodeFrame(idx);
      return;
    }

    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(bmp, 0, 0, W, H);
  };

  // pre-decode
  for (let i = TOTAL_START; i <= TOTAL_END; i++) {
    decodeFrame(i);
  }

  /* ---------- text swap ---------- */

  let textSwapTimeline = null;

  const swapText = (subEl, bodyEl, newSub, newBody, dir = 1) => {
    if (!subEl || !bodyEl) return;

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

  const frame = { v: STEPS[0].from };

  // initial text
  if (refs.sub && refs.body) {
    refs.sub.textContent = STEPS[0].key;
    refs.body.innerHTML = STEPS[0].body;
    gsap.set([refs.sub, refs.body], { y: 0, opacity: 1 });
  }

  // initial frame
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

  // small delay
  tl.to({}, { duration: 1.0 });

  const stepDur = 1.0;

  const textGroup = refs.textGroup;

  // bigger, clearly visible step offsets
  // index 0 = seed, 1..3 = growing, 4 = settled
  const TEXT_Y_POSITIONS = isMobile
    ? [200, 120, 40, -20, -35] // mobile
    : [280, 190, 100, 20, 0]; // desktop

  if (textGroup) {
    gsap.set(textGroup, { y: TEXT_Y_POSITIONS[0] });
  }

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

  STEPS.forEach((s, idx) => {
    // label for snapping
    tl.addLabel(`step-${idx}`);

    tl.to(
      frame,
      {
        v: s.to,
        duration: stepDur,
        ease: "none",
        onUpdate: () => {
          const val = frame.v;
          const i = Math.round(val);

          // draw frame
          if (i !== currentFrame) {
            draw(i);
          }

          const goingForward = i >= lastFrameValue;
          lastFrameValue = i;

          const newStepIndex = getStepIndexForFrame(val);

          if (newStepIndex !== currentStepIndex && refs.sub && refs.body) {
            const step = STEPS[newStepIndex];

            // text change
            swapText(
              refs.sub,
              refs.body,
              step.key,
              step.body,
              goingForward ? 1 : -1
            );

            // **instant snap of text group to the new height**
            if (textGroup) {
              gsap.set(textGroup, {
                y: TEXT_Y_POSITIONS[newStepIndex]
              });
            }

            currentStepIndex = newStepIndex;
          }
        }
      },
      ">-0"
    );
  });

  tl.to({}, { duration: 0.3 });

  tl.call(
    () => {
      if (refs.sub && refs.body) {
        refs.sub.textContent = STEPS[0].key;
        refs.body.innerHTML = STEPS[0].body;
        gsap.set([refs.sub, refs.body], { y: 0, opacity: 1 });
      }
      if (textGroup) {
        gsap.set(textGroup, { y: TEXT_Y_POSITIONS[0] });
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
      <div
        ref={initialSceneRef}
        className="absolute inset-0 w-full h-full"
        style={{ willChange: "transform" }}
      >
        {/* desktop */}
        {!isMobile && (
          <div className="grid grid-cols-2 w-full h-full">
            {/* left - lavender */}
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

            {/* right - black, text just above canvas, both slightly up from bottom */}
            <div className="relative h-full bg-[#0a0a0a]">
              {/* bottom-anchored group for text + canvas */}
              <div
                className="absolute inset-x-0 flex flex-col items-center text-white lowercase px-10"
                style={{ bottom: "6vh" }} // a bit up from very bottom for all desktops
              >
                {/* text group that moves per step */}
                <div
                  ref={textGroupRef}
                  className="flex flex-col items-center"
                  style={{
                    willChange: "transform",
                    marginBottom: "2vh" // sits just above seed/plant
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

                {/* canvas slightly above bottom, below text */}
                <canvas
                  ref={canvasRef}
                  className="w-full block object-contain"
                  style={{
                    maxHeight: "66vh",
                    transform: "scale(1.05)", // increase by 5%
                    transformOrigin: "center bottom"
                  }}
                />
              </div>
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

            {/* bottom - black area */}
            <div className="relative bg-[#0a0a0a] h-full">
              {/* bottom anchored text + canvas */}
              <div
                className="absolute inset-x-0 flex flex-col items-center text-white lowercase px-6"
                style={{ bottom: "4vh" }} // a bit up from bottom for all mobiles
              >
                {/* text group that moves per step */}
                <div
                  ref={textGroupRef}
                  className="flex flex-col items-center mb-[1.5vh]"
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

                {/* canvas below text, slightly above bottom */}
                <canvas
                  ref={canvasRef}
                  className="w-full block object-contain"
                  style={{
                    maxHeight: "70vh",
                    transform: "scale(1.35)",
                    transformOrigin: "center bottom"
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
});

Scene1_3.displayName = "Scene1_3";
export default Scene1_3;
