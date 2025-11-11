import React, { useRef, useImperativeHandle } from "react";
import { gsap } from "gsap";
import {
  evolve_text,
  marquee_vector_1,
  marquee_vector_2
} from "../../assets/images/Nav";

/* -------------------- timeline builder (no ScrollTrigger) -------------------- */

const STEPS = [
  {
    key: "see",
    body: "hunt for the details everyone else misses.",
    from: 1000,
    to: 1048
  },
  {
    key: "think",
    body: "ask the questions no one's asking.",
    from: 1049,
    to: 1097
  },
  { key: "make", body: "design like it matters.", from: 1098, to: 1146 },
  { key: "ship", body: "send it to the real world", from: 1147, to: 1195 },
  {
    key: "share",
    body: "tell the story so well they can't ignore it.",
    from: 1196,
    to: 1241
  }
];

const pad = (n, w = 4) => String(n).padStart(w, "0");
const srcFor = (i, basePath, prefix, ext) =>
  `${basePath}/${prefix}${pad(i)}.${ext}`;

export const useScene1_3Timeline = (refs, isMobile) => {
  const tl = gsap.timeline({ defaults: { ease: "none" } });

  // canvas setup
  const canvas = refs.canvas;
  const ctx = canvas?.getContext?.("2d");
  const W = isMobile ? 720 : 1080;
  const H = isMobile ? 720 : 1080;
  if (canvas) {
    canvas.width = W;
    canvas.height = H;
  }

  // sequence config (served from /public)
  const basePath = "/assets/seed_to_plant";
  const prefix = "Seed ot plant_";
  const ext = "png";
  const TOTAL_START = 1000;
  const TOTAL_END = 1241;

  const cache = new Map();

  const decodeFrame = async (idx) => {
    if (!idx || idx < TOTAL_START || idx > TOTAL_END) return null;
    if (cache.has(idx)) return cache.get(idx);

    const img = new Image();
    img.decoding = "async";
    img.crossOrigin = "anonymous";
    img.src = srcFor(idx, basePath, prefix, ext);

    try {
      await img.decode();
      const bmp = window.createImageBitmap
        ? await createImageBitmap(img).catch(() => img)
        : img;
      cache.set(idx, bmp);
      return bmp;
    } catch {
      return null;
    }
  };

  const draw = async (idx) => {
    if (!ctx) return;
    const bmp = await decodeFrame(idx);
    if (!bmp) return;
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(bmp, 0, 0, W, H);
  };

  const warm = (from, count = 24) => {
    const end = Math.min(TOTAL_END, from + count);
    for (let i = from; i <= end; i++) {
      window.requestIdleCallback
        ? requestIdleCallback(() => decodeFrame(i), { timeout: 120 })
        : setTimeout(() => decodeFrame(i), 0);
    }
  };

  /* ---------- reversible text logic driven by frame.v (no tl.call swaps) ---------- */

  let textSwapTimeline = null;

  const swapText = (subEl, bodyEl, newSub, newBody, dir = 1) => {
    if (!subEl || !bodyEl) return;

    // if already showing correct text, ensure visible and placed
    if (subEl.textContent === newSub && bodyEl.textContent === newBody) {
      gsap.to([subEl, bodyEl], {
        y: 0,
        opacity: 1,
        duration: 0.2,
        ease: "power2.out"
      });
      return;
    }

    if (textSwapTimeline) textSwapTimeline.kill();

    const outY = dir > 0 ? -100 : 100; // forward scroll moves current text up; backward moves it down
    const inY = dir > 0 ? 100 : -100;

    textSwapTimeline = gsap.timeline();
    textSwapTimeline
      .to([subEl, bodyEl], {
        y: outY,
        opacity: 0,
        duration: 0.22,
        ease: "power2.in"
      })
      .call(() => {
        subEl.textContent = newSub;
        bodyEl.textContent = newBody;
        gsap.set([subEl, bodyEl], { y: inY, opacity: 0 });
      })
      .to(
        [subEl, bodyEl],
        { y: 0, opacity: 1, duration: 0.24, ease: "power2.out" },
        "+=0.02"
      );
  };

  // shared frame object (drives both sequence and text)
  const frame = { v: STEPS[0].from };

  // preset first paint for texts to avoid flashes
  if (refs.sub && refs.body) {
    refs.sub.textContent = STEPS[0].key;
    refs.body.textContent = STEPS[0].body;
    gsap.set([refs.sub, refs.body], { y: 0, opacity: 1 });
  }

  // draw initial frame and warm cache
  tl.call(
    () => {
      draw(STEPS[0].from);
      warm(STEPS[0].from, 24);
    },
    null,
    0
  );

  const stepDur = 2; // how much master time each step consumes

  // build only the frame tweens (no text calls in here)
  STEPS.forEach((s) => {
    // warm at start of each segment
    tl.call(() => warm(s.from, 24));
    tl.to(frame, {
      v: s.to,
      duration: stepDur,
      onUpdate: () => {
        const i = Math.round(frame.v);
        // Use RAF for smoother drawing
        requestAnimationFrame(() => draw(i));

        // light cache pruning
        for (const k of cache.keys()) {
          if (k < s.from - 30 || k > s.to + 60) cache.delete(k);
        }
      }
    });
  });

  // optional settle
  tl.to({}, { duration: 0.25 });

  // global text updater that reverses correctly
  let lastV = frame.v;

  const indexFor = (v) => {
    for (let i = 0; i < STEPS.length; i++) {
      const s = STEPS[i];
      if (v >= s.from && v <= s.to) return i;
    }
    // clamp outside bounds
    if (v < STEPS[0].from) return 0;
    if (v > STEPS[STEPS.length - 1].to) return STEPS.length - 1;
    return 0;
  };

  // ensure initial text is correct and visible
  tl.call(
    () => {
      if (refs.sub && refs.body) {
        refs.sub.textContent = STEPS[0].key;
        refs.body.textContent = STEPS[0].body;
        gsap.set([refs.sub, refs.body], { y: 0, opacity: 1 });
      }
    },
    null,
    0.001
  );

  let activeIndex = 0;

  tl.eventCallback("onUpdate", () => {
    const v = Math.round(frame.v);
    const dir = v - lastV >= 0 ? 1 : -1;
    const idx = indexFor(v);

    if (idx !== activeIndex && refs.sub && refs.body) {
      const s = STEPS[idx];
      swapText(refs.sub, refs.body, s.key, s.body, dir);
      activeIndex = idx;
    }

    lastV = v;
  });

  // At the end of useScene1_3Timeline function, before return tl:

  // Add continuation section - slide up scene and show marquee
  // Set initial position for continuation section (below viewport)
  tl.set(refs.continuation, { y: "100vh" }, 0);

  // After animation completes, slide initial scene up and continuation in
  tl.to(
    refs.initialScene,
    {
      y: "-100vh",
      duration: 1,
      ease: "power2.inOut"
    },
    "+=0.5"
  );

  tl.to(
    refs.continuation,
    {
      y: 0,
      duration: 1,
      ease: "power2.inOut"
    },
    "<"
  ); // "<" means start at the same time as previous

  // Animate marquee in
  tl.fromTo(
    refs.marquee,
    { opacity: 0 },
    { opacity: 1, duration: 0.5, ease: "power2.out" },
    "-=0.3"
  );

  // Animate marquee in
  tl.fromTo(
    refs.marquee,
    { y: 100, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
    "-=0.4"
  );

  // Start infinite marquee scroll
  // Start infinite marquee scroll with seamless loop
  tl.call(() => {
    if (refs.marqueeTrack && refs.marqueeGroup) {
      const group = refs.marqueeGroup;
      const groupWidth = group.offsetWidth;

      // Clone the group for seamless infinite scroll
      const clone = group.cloneNode(true);
      refs.marqueeTrack.appendChild(clone);

      gsap.to(refs.marqueeTrack, {
        x: -groupWidth,
        duration: 20,
        ease: "none",
        repeat: -1,
        modifiers: {
          x: (x) => `${parseFloat(x) % groupWidth}px`
        }
      });
    }
  });

  // Text 1 appears
  tl.fromTo(
    refs.text1,
    { y: 60, opacity: 0 },
    { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
    "+=0.8"
  );

  // Text 2 appears
  tl.fromTo(
    refs.text2,
    { y: 60, opacity: 0 },
    { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
    "+=0.6"
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
  const marqueeRef = useRef(null);
  const marqueeTrackRef = useRef(null);
  const marqueeGroupRef = useRef(null);
  const text1Ref = useRef(null);
  const text2Ref = useRef(null);

  // right canvas
  const canvasRef = useRef(null);

  useImperativeHandle(ref, () => ({
    container: containerRef.current,
    initialScene: initialSceneRef.current,
    continuation: continuationRef.current,
    heading: headingRef.current,
    sub: subRef.current,
    body: bodyRef.current,
    canvas: canvasRef.current,
    marquee: marqueeRef.current,
    marqueeTrack: marqueeTrackRef.current,
    marqueeGroup: marqueeGroupRef.current,
    text1: text1Ref.current,
    text2: text2Ref.current
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
            {/* left 50% */}
            <div className="flex flex-col h-full">
              {/* top 40% */}
              <div className="relative" style={{ height: "40%" }}>
                <div className="absolute inset-0 bg-evolve-lavender-indigo" />
                <div className="absolute inset-0 flex items-end p-8">
                  <h2
                    ref={headingRef}
                    className="text-white lowercase font-extrabold leading-none text-8xl"
                    style={{ lineHeight: "1.0" }}
                  >
                    how you
                    <br /> will evolve
                  </h2>
                </div>
              </div>

              {/* bottom 60% pink */}
              <div className="relative" style={{ height: "60%" }}>
                <div className="absolute inset-0 bg-evolve-pink" />
                <div className="absolute inset-0 flex flex-col text-white lowercase p-10 overflow-hidden">
                  <div className="mt-[10vh]" />
                  <div className="overflow-hidden">
                    <h3
                      ref={subRef}
                      className="font-extrabold text-6xl tracking-tight"
                      style={{ opacity: 0, transform: "translateY(20px)" }}
                    />
                  </div>
                  <div className="h-4" />
                  <div className="overflow-hidden">
                    <p
                      ref={bodyRef}
                      className="font-medium text-4xl max-w-[42ch]"
                      style={{ opacity: 0, transform: "translateY(20px)" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* right 50% sequence */}
            <div className="relative h-full bg-black">
              <canvas
                ref={canvasRef}
                className="w-full h-full block object-contain"
              />
            </div>
          </div>
        )}

        {/* mobile */}
        {isMobile && (
          <div className="grid grid-rows-[25%_50%_25%] w-full h-full">
            <div className="relative">
              <div className="absolute inset-0 bg-evolve-lavender-indigo" />
              <div className="absolute inset-0 flex items-end justify-center p-4">
                <h2 className="text-white  lowercase font-extrabold text-[3rem] leading-none text-center">
                  how you <br />
                  will evolve
                </h2>
              </div>
            </div>

            <div className="relative bg-black">
              <canvas
                ref={canvasRef}
                className="w-full h-full block object-contain"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-evolve-pink" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white lowercase p-6 text-center overflow-hidden">
                <div className="overflow-hidden">
                  <h3
                    ref={subRef}
                    className="font-extrabold text-[2rem]"
                    style={{ opacity: 0, transform: "translateY(20px)" }}
                  />
                </div>
                <div className="h-2" />
                <div className="overflow-hidden">
                  <p
                    ref={bodyRef}
                    className="font-medium text-[24px] max-w-[30ch]"
                    style={{ opacity: 0, transform: "translateY(20px)" }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Continuation section - appears after slide up */}
      {/* Continuation section - appears after slide up */}
      <div
        ref={continuationRef}
        className="absolute inset-0 w-full min-h-screen bg-evolve-lavender-indigo"
        style={{ willChange: "transform" }}
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
                maxWidth: "62.5rem",
                willChange: "transform, opacity",
                opacity: 0
              }}
            >
              we're not here to hand out certificates.
            </p>

            <p
              ref={text2Ref}
              className="text-white lowercase font-extrabold text-center"
              style={{
                fontSize: "4rem",
                lineHeight: "4.5rem",
                maxWidth: "62.5rem",
                willChange: "transform, opacity",
                opacity: 0
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
                maxWidth: "90vw",
                willChange: "transform, opacity",
                opacity: 0
              }}
            >
              we're not here to hand out certificates.
            </p>

            <p
              ref={text2Ref}
              className="text-white lowercase font-extrabold text-center"
              style={{
                fontSize: "2.5rem",
                lineHeight: "2.25rem",
                maxWidth: "90vw",
                willChange: "transform, opacity",
                opacity: 0
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
          style={{ opacity: 0 }}
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
                src={evolve_text}
                alt="evolve text"
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
                src={evolve_text}
                alt="evolve text"
                className={`w-auto flex-none ${isMobile ? "h-8" : "h-[4rem]"}`}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

Scene1_3.displayName = "Scene1_3";
export default Scene1_3;
