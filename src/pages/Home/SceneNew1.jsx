import React, { useRef, useImperativeHandle } from "react";
import { gsap } from "gsap";
import {
  left_thunder,
  right_thunder,
  left_thunder_mobile,
  right_thunder_mobile,
  curvey_circle_with_text,
  vector_1_scenenew
} from "../../assets/images/Home";

export const SCENE_NEW_STEP_LABELS = [
  "scene_new_step0_intro",
  "scene_new_step1_badge_done"
];

// refs received:
//   container, bg, vector, leftThunder, rightThunder
//   badgeRing     — the curvey_circle_with_text img element
//   logoUnit      — the sharedWrapper from Scene1, passed by Home
//                   badge blooms AROUND this element
export const useSceneNewTimeline = (refs, isMobile) => {
  const tl = gsap.timeline();

  tl.addLabel("scene_new_step0_intro", 0);

  // ── Initial states ─────────────────────────────────────────────────────
  tl.set(refs.bg, { opacity: 1 })
    .set(refs.vector, { opacity: 1 })
    .set(refs.leftThunder, { opacity: 1, x: 0, y: 0 })
    .set(refs.rightThunder, { opacity: 1, x: 0, y: 0 })
    // Badge ring: hidden, scaled to 0, centered on the logo
    .set(refs.badgeRing, {
      opacity: 0,
      scale: 0,
      transformOrigin: "center center",
      willChange: "transform, opacity"
    });

  // ── Short pause for SceneNew to settle ─────────────────────────────────
  tl.to({}, { duration: 0.3 });

  // ── Step 1: Logo shrinks slightly as badge prepares to bloom ───────────
  // This makes it feel like the logo is "becoming" the center of the badge
  if (refs.logoUnit) {
    tl.to(refs.logoUnit, {
      scale: 0.75,
      duration: 0.5,
      ease: "power2.out",
      transformOrigin: "center center"
    });
  }

  // ── Step 2: Badge ring blooms outward around the logo ─────────────────
  // Both happen simultaneously: badge grows in, logo stays small inside it
  tl.to(
    refs.badgeRing,
    {
      opacity: 1,
      scale: 1,
      duration: 0.8,
      ease: "back.out(1.4)"
    },
    "<0.1"
  ); // slight overlap with logo shrink

  tl.addLabel("scene_new_step1_badge_done", tl.duration());

  // ── Step 3: Continuous badge spin ─────────────────────────────────────
  // Badge spins around logo — they feel like ONE unit now
  tl.call(() => {
    if (refs.badgeRing) {
      gsap.to(refs.badgeRing, {
        rotation: 360,
        duration: 18,
        ease: "none",
        repeat: -1,
        transformOrigin: "center center"
      });
    }
  });

  // ── Hold so user can read the badge ────────────────────────────────────
  tl.to({}, { duration: 2.0 });

  return tl;
};

// ─── Component ────────────────────────────────────────────────────────────────
const SceneNew = React.forwardRef((props, ref) => {
  const { isMobile } = props;

  const containerRef = useRef(null);
  const bgRef = useRef(null);
  const vectorRef = useRef(null);
  const leftThunderRef = useRef(null);
  const rightThunderRef = useRef(null);
  const badgeRingRef = useRef(null);

  useImperativeHandle(ref, () => ({
    container: containerRef.current,
    bg: bgRef.current,
    vector: vectorRef.current,
    leftThunder: leftThunderRef.current,
    rightThunder: rightThunderRef.current,
    badgeRing: badgeRingRef.current
  }));

  // ── Z-index stack ─────────────────────────────────────────────────────
  // z-[1]  bg yellow
  // z-[2]  vector (bottom-0)
  // z-[3]  thunders (bottom corners)
  // z-[4]  badge ring (curvey_circle_with_text)
  // z-[20] logoUnit from Home — sits ON TOP of badge ring
  //        This is the sharedWrapper from Scene1, rendered at Home level
  //        with z-[20]. Since it's outside this component, it naturally
  //        floats above everything here.

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden"
    >
      {/* Yellow background */}
      <div
        ref={bgRef}
        className="absolute inset-0 w-full h-full z-[1] bg-evolve-yellow"
      />

      {/* vector_1_scenenew — wavy bottom shape */}
      <img
        ref={vectorRef}
        src={vector_1_scenenew}
        alt="vector"
        className="absolute left-0 bottom-0 w-full z-[2]"
        style={{ height: "auto", display: "block" }}
      />

      {/* Left thunder */}
      <img
        ref={leftThunderRef}
        src={isMobile ? left_thunder_mobile : left_thunder}
        alt="left thunder"
        className="absolute z-[3]"
        style={{
          bottom: isMobile ? "-5%" : "-3%",
          left: isMobile ? "-45%" : "-20%",
          width: isMobile ? "100vw" : "60vw",
          height: "auto"
        }}
      />

      {/* Right thunder */}
      <img
        ref={rightThunderRef}
        src={isMobile ? right_thunder_mobile : right_thunder}
        alt="right thunder"
        className="absolute z-[3]"
        style={{
          bottom: isMobile ? "-5%" : "-3%",
          right: isMobile ? "-45%" : "-20%",
          width: isMobile ? "100vw" : "60vw",
          height: "auto"
        }}
      />

      {/* Badge ring — blooms AROUND the logoUnit from Home               */}
      {/* Must be centered at the same position as where Home renders the  */}
      {/* logoUnit (which is centered in the viewport, shifted up by -20vh)*/}
      {/* We use absolute centering + the same translateY offset.          */}
      <div
        className="absolute left-1/2 z-[4] pointer-events-none"
        style={{
          // Match the logoUnit's vertical position: centered then shifted up
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${isMobile ? "-16vh" : "-20vh"}))`,
          width: isMobile ? "72vw" : "30vw",
          height: isMobile ? "72vw" : "30vw"
        }}
      >
        <img
          ref={badgeRingRef}
          src={curvey_circle_with_text}
          alt="be remarkable badge"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            transformOrigin: "center center",
            opacity: 0,
            willChange: "transform, opacity"
          }}
        />
      </div>
    </section>
  );
});

SceneNew.displayName = "SceneNew";
export default SceneNew;
