import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";

import {
  left_thunder,
  right_thunder,
  left_thunder_mobile,
  right_thunder_mobile,
  curvey_circle_without_inner_part,
  curvey_circle_without_inner_part_1,
  curvey_circle_inner_part,
  vector_2nd_mobile,
  vector_2nd
} from "../../assets/images/Home";
import { rays_webinars } from "../../assets/images/Webinars";

// ─── CombinedCircle ──────────────────────────────────────────────────────────
const CombinedCircle = React.forwardRef(({ isMobile }, ref) => {
  const outerRef = useRef(null);
  const innerRef = useRef(null);

  React.useImperativeHandle(ref, () => ({
    outer: outerRef.current,
    inner: innerRef.current
  }));

  useEffect(() => {
    if (!outerRef.current) return;
    const tween = gsap.to(outerRef.current, {
      rotation: -360,
      duration: 5,
      ease: "none",
      repeat: -1
    });
    return () => tween.kill();
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div
        style={{
          position: "absolute",
          top: "18%",
          left: "18%",
          width: "65%",
          height: "65%",
          // filter: "drop-shadow(8px 10px 0px #873265)"
          filter: isMobile
            ? "drop-shadow(4px 6px 0px #873265)"
            : "drop-shadow(8px 10px 0px #873265)"
        }}
      >
        <img
          ref={outerRef}
          src={curvey_circle_without_inner_part_1}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            transformOrigin: "center center"
          }}
        />
      </div>
      <img
        ref={innerRef}
        src={curvey_circle_inner_part}
        alt=""
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: "70%",
          height: "70%",
          transformOrigin: "center center"
        }}
      />
    </div>
  );
});
CombinedCircle.displayName = "CombinedCircle";

// ─── Scene2_refined ───────────────────────────────────────────────────────────
const Scene2_refined = React.forwardRef(({ isMobile = false }, ref) => {
  const containerRef = useRef(null);
  const circleRef = useRef(null);

  React.useImperativeHandle(ref, () => ({
    container: containerRef.current
  }));

  return (
    <section
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        background: "rgb(255,208,7)",
        overflow: "hidden"
      }}
    >
      {/* Rays overlay */}
      <img
        src={rays_webinars}
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 2,
          pointerEvents: "none"
        }}
      />

      {/* vector2nd — the platform the circle rests on */}
      <img
        src={isMobile ? vector_2nd_mobile : vector_2nd}
        alt=""
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: "100%",
          height: "auto",
          zIndex: 3,
          pointerEvents: "none"
        }}
      />

      {/* Left thunder — pushed down to final state matching SceneNew snap1 */}
      <img
        src={isMobile ? left_thunder_mobile : left_thunder}
        alt=""
        style={{
          position: "absolute",
          bottom: isMobile ? "-5%" : "-3%",
          left: isMobile ? "-45%" : "-20%",
          width: isMobile ? "100vw" : "60vw",
          height: "auto",
          zIndex: 4,
          pointerEvents: "none",
          transform: isMobile ? "translateY(20vh)" : "translateY(10vh)"
        }}
      />

      {/* Right thunder — pushed down to final state matching SceneNew snap1 */}
      <img
        src={isMobile ? right_thunder_mobile : right_thunder}
        alt=""
        style={{
          position: "absolute",
          bottom: isMobile ? "-5%" : "-3%",
          right: isMobile ? "-45%" : "-20%",
          width: isMobile ? "100vw" : "60vw",
          height: "auto",
          zIndex: 4,
          pointerEvents: "none",
          transform: isMobile ? "translateY(20vh)" : "translateY(10vh)"
        }}
      />

      {/* Combined circle — matching SceneNew final landed state */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          bottom: isMobile ? "10%" : "-15%",
          width: isMobile ? "85vw" : "40vw",
          height: isMobile ? "85vw" : "40vw",
          zIndex: 15,
          pointerEvents: "none",
          opacity: 1
        }}
      >
        <CombinedCircle ref={circleRef} isMobile={isMobile} />
      </div>

      {/* Text */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 20,
          textAlign: "center",
          width: isMobile ? "95vw" : "80%",
          maxWidth: isMobile ? "90%" : "80%",
          fontWeight: 800,
          color: "rgb(0,0,0)",
          fontSize: (() => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            if (isMobile) return h >= 812 ? "32px" : "28px";
            if (w >= 1024 && h >= 900) return "64px";
            return "48px";
          })(),
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
          pointerEvents: "none"
        }}
      >
        {isMobile ? (
          <>
            <div>Here designers find</div>
            <div>their people, their niche,</div>
            <div>and their purpose.</div>
          </>
        ) : (
          <div>
            Here designers find their people,
            <br />
            their niche, and their purpose.
          </div>
        )}
      </div>
    </section>
  );
});

Scene2_refined.displayName = "Scene2_refined";
export default Scene2_refined;
