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

import React, { useRef, useImperativeHandle } from "react";
import { gsap } from "gsap";
import {
  evolve_be_remarkable,
  evolve_text,
  marquee_vector_1,
  marquee_vector_2
} from "../../assets/images/Nav";

export const useScene1_4Timeline = (refs, isMobile) => {
  const tl = gsap.timeline();

  // start state
  // tl.set([refs.text1, refs.text2, refs.marquee], { opacity: 0 }, 0);

  // // marquee in
  // tl.fromTo(
  //   refs.marquee,
  //   { y: 100, opacity: 0 },
  //   { y: 0, opacity: 1, duration: 0, ease: "power2.out" },
  //   0
  // );

  // tl.fromTo(
  //   refs.text1,
  //   { y: 60, opacity: 0 },
  //   { y: 0, opacity: 1, duration: 0, ease: "power3.out" },
  //   0
  // );
  // start state
  // start state – visible immediately, no entrance animation
  tl.set([refs.text1, refs.text2, refs.marquee], { opacity: 1, y: 0 }, 0);

  // tl.set([refs.text1, refs.text2, refs.marquee], { opacity: 0 }, 0);

  // // marquee in – give it a small duration
  // tl.fromTo(
  //   refs.marquee,
  //   { y: 40, opacity: 0 },
  //   { y: 0, opacity: 1, duration: 0, ease: "power1.out" },
  //   0
  // );

  // // text1 + text2 together (staggered a bit)
  // tl.fromTo(
  //   [refs.text1, refs.text2],
  //   { y: 40, opacity: 0 },
  //   {
  //     y: 0,
  //     opacity: 1,
  //     duration: 0,
  //     ease: "power1.out",
  //     stagger: 0.08
  //   },
  //   0
  // );

  // kick off infinite marquee (idempotent + reversible)
  tl.add(() => {
    // let the browser paint once, then do the heavy stuff
    requestAnimationFrame(() => {
      if (!refs.marqueeTrack || !refs.marqueeGroup) return;

      const track = refs.marqueeTrack;
      const group = refs.marqueeGroup;

      // already running? skip
      if (track.dataset.playing === "1") return;
      track.dataset.playing = "1";

      // duplicate content once
      if (!track.dataset.duplicated) {
        const clone = group.cloneNode(true);
        track.appendChild(clone);
        track.dataset.duplicated = "1";
      }

      const baseWidth = group.scrollWidth;

      // reset + gpu hint
      gsap.set(track, {
        x: 0,
        willChange: "transform",
        force3D: true
      });

      const tween = gsap.to(track, {
        x: -baseWidth,
        duration: 20,
        ease: "none",
        repeat: -1,
        force3D: true,
        modifiers: {
          x: (x) => `${parseFloat(x) % baseWidth}px`
        }
      });

      refs.marqueeTween = tween;

      // resize handler
      refs._resizeHandler = () => {
        const w = group.scrollWidth;
        const p = tween.progress();
        tween.kill();

        const t2 = gsap.to(track, {
          x: -w,
          duration: 20,
          ease: "none",
          repeat: -1,
          force3D: true,
          modifiers: {
            x: (x) => `${parseFloat(x) % w}px`
          }
        });
        t2.progress(p);
        refs.marqueeTween = t2;
      };

      window.addEventListener("resize", refs._resizeHandler, { passive: true });
    });
  });

  // text reveals
  // tl.fromTo(
  //   refs.text1,
  //   { y: 60, opacity: 0 },
  //   { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
  //   "+=0.8"
  // );
  // tl.fromTo(
  //   refs.text2,
  //   { y: 60, opacity: 0 },
  //   { y: 0, opacity: 1, duration: 0, ease: "power3.out" },
  //   0
  // );

  // cleanup when the master timeline rewinds past this scene
  tl.eventCallback("onReverseComplete", () => {
    if (refs.marqueeTween) {
      refs.marqueeTween.kill();
      refs.marqueeTween = null;
    }
    if (refs._resizeHandler) {
      window.removeEventListener("resize", refs._resizeHandler);
      refs._resizeHandler = null;
    }
    if (refs.marqueeTrack) {
      gsap.set(refs.marqueeTrack, { x: 0 });
      refs.marqueeTrack.dataset.playing = "0";
    }
  });

  return tl;
};

const Scene1_4 = React.forwardRef(({ isMobile = false }, ref) => {
  const containerRef = useRef(null);
  const marqueeRef = useRef(null);
  const marqueeTrackRef = useRef(null);
  const marqueeGroupRef = useRef(null);
  const text1Ref = useRef(null);
  const text2Ref = useRef(null);

  // useImperativeHandle(ref, () => ({
  //   container: containerRef.current,
  //   marquee: marqueeRef.current,
  //   marqueeTrack: marqueeTrackRef.current,
  //   marqueeGroup: marqueeGroupRef.current,
  //   text1: text1Ref.current,
  //   text2: text2Ref.current
  // }));
  useImperativeHandle(ref, () => ({
    container: containerRef.current,
    marquee: marqueeRef.current,
    marqueeTrack: marqueeTrackRef.current,
    marqueeGroup: marqueeGroupRef.current,
    text1: text1Ref.current,
    text2: text2Ref.current,
    // holders for runtime objects (the hook will set these)
    marqueeTween: null,
    _resizeHandler: null
  }));

  return (
    <section
      ref={containerRef}
      className="absolute inset-0 w-full h-full border-2 border-evolve-yellow bg-evolve-lavender-indigo overflow-hidden"
    >
      {/* Text container - desktop */}
      {!isMobile && (
        <div className="flex flex-col items-center pt-[30vh] px-8">
          <p
            ref={text1Ref}
            className="text-white lowercase mb-8 text-center"
            style={{
              fontSize: "2.5rem",
              fontWeight: 400,
              lineHeight: "3rem",
              maxWidth: "62.5rem"
              // opacity: 0
            }}
          >
            we're not here to hand out just certificates.
          </p>

          <p
            ref={text2Ref}
            className="text-white lowercase font-extrabold text-center"
            style={{
              fontSize: "4rem",
              lineHeight: "4.5rem",
              maxWidth: "62.5rem"
              // opacity: 0
            }}
          >
            we're here to empower you to see new perspectives.
          </p>
        </div>
      )}

      {/* Text container - mobile */}
      {isMobile && (
        <div className="flex flex-col items-center pt-[30vh] px-6">
          <p
            ref={text1Ref}
            className="text-white lowercase mb-4 text-center"
            style={{
              fontSize: "1.5rem",
              fontWeight: 500,
              lineHeight: "1.75rem",
              maxWidth: "90vw"
              // opacity: 0
            }}
          >
            we're not here to hand out just certificates.
          </p>

          <p
            ref={text2Ref}
            className="text-white lowercase font-extrabold text-center"
            style={{
              fontSize: "2.5rem",
              lineHeight: "2.25rem",
              maxWidth: "90vw"
              // opacity: 0
            }}
          >
            we're here to empower you to see new perspectives.
          </p>
        </div>
      )}

      {/* Marquee - positioned at bottom */}
      <div
        ref={marqueeRef}
        className={`absolute left-0 w-full border-t-2 border-b-2 border-evolve-yellow bg-evolve-lavender-indigo overflow-hidden ${
          isMobile ? "bottom-[10%] h-16" : "bottom-0 h-[9rem]"
        }`}
        // style={{ opacity: 0 }}
      >
        <div
          ref={marqueeTrackRef}
          className="absolute top-1/2 -translate-y-1/2 left-0 flex whitespace-nowrap"
          style={{ willChange: "transform" }}
        >
          <div
            ref={marqueeGroupRef}
            className={`flex items-center flex-none ${
              isMobile ? "gap-8 pr-8" : "gap-14 pr-14"
            }`}
          >
            <img
              src={marquee_vector_1}
              alt="vector 1"
              className={`w-auto flex-none ${isMobile ? "h-10" : "h-[5rem]"}`}
            />
            <img
              src={evolve_text}
              alt="evolve text"
              className={`w-auto flex-none ${isMobile ? "h-8" : "h-[4rem]"}`}
            />
            <img
              src={marquee_vector_2}
              alt="vector 2"
              className={`w-auto flex-none ${isMobile ? "h-10" : "h-[5rem]"}`}
            />
            <img
              src={evolve_be_remarkable}
              alt="evolve be remarkable"
              className={`w-auto flex-none ${isMobile ? "h-8" : "h-[4rem]"}`}
            />
            <img
              src={marquee_vector_1}
              alt="vector 1"
              className={`w-auto flex-none ${isMobile ? "h-10" : "h-[5rem]"}`}
            />
            <img
              src={evolve_text}
              alt="evolve text"
              className={`w-auto flex-none ${isMobile ? "h-8" : "h-[4rem]"}`}
            />
            <img
              src={marquee_vector_2}
              alt="vector 2"
              className={`w-auto flex-none ${isMobile ? "h-10" : "h-[5rem]"}`}
            />
            <img
              src={evolve_be_remarkable}
              alt="evolve be remarkable"
              className={`w-auto flex-none ${isMobile ? "h-8" : "h-[4rem]"}`}
            />
          </div>
        </div>
      </div>
    </section>
  );
});

Scene1_4.displayName = "Scene1_4";
export default Scene1_4;
