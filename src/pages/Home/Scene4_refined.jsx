import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";

import {
  pink_bigger_orbit,
  pink_bigger_orbit_mobile,
  stairs_left_new,
  stairs_right_new,
  stairsfull_right_mobile,
  left_stairs_mod6_mobile
} from "../../assets/images/Home";

// Match SceneNew's screen multipliers exactly
const getOrbitScreenMultipliers = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  if (
    (width >= 700 && width <= 1368 && height >= 900 && height <= 1300) ||
    (height >= 700 && height <= 1180 && width >= 900 && width <= 1400)
  )
    return { orbit: 1.345, stairs: 0.35 };
  if (width <= 1440) return { orbit: 1, stairs: 0.9 };
  if (width <= 1920 && height <= 1200) return { orbit: 0.7, stairs: 0.85 };
  return { orbit: 0.5, stairs: 0.7 };
};

const isTabletLandscape = (() => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  return w >= 900 && w <= 1400 && h >= 600 && h <= 1100;
})();

const Scene4_refined = React.forwardRef(({ isMobile = false, isActive = false }, ref) => {
  const containerRef = useRef(null);
  const orbitInnerRef = useRef(null);
  const stairsLeftRef = useRef(null);
  const stairsRightRef = useRef(null);
  const mobileRightStairsRef = useRef(null);
  const mobileLeftStairsRef = useRef(null);

  React.useImperativeHandle(ref, () => ({
    container: containerRef.current
  }));

  // Continuous orbit rotation (matches SceneNew pinkOrbitInner)
  useEffect(() => {
    if (!orbitInnerRef.current) return;
    const tween = gsap.to(orbitInnerRef.current, {
      rotation: -360,
      duration: 20,
      ease: "none",
      repeat: -1,
      transformOrigin: "center center"
    });
    return () => tween.kill();
  }, []);

  // Set desktop stairs to their SceneNew snap3_cta final position on mount
  useEffect(() => {
    if (isMobile) return;
    const multipliers = getOrbitScreenMultipliers();
    const totalY = (7 + 10 + 40 - 1) * multipliers.stairs;
    const stairs = [stairsLeftRef.current, stairsRightRef.current].filter(Boolean);
    gsap.set(stairs, {
      y: `${totalY}vh`,
      scale: 1.35,
      transformOrigin: "bottom center",
      opacity: 1
    });
    stairs.forEach((el) => {
      const img = el?.querySelector("img");
      if (img) {
        img.style.maskImage = "none";
        img.style.WebkitMaskImage = "none";
      }
    });
  }, [isMobile]);

  // Orbit bottom position matching SceneNew snap3_cta effective visual position:
  // desktop: bottom -60vh + translateY(-20vh) = visual -40vh below screen
  // tabletLandscape: bottom -40vh + translateY(-20vh) = visual -20vh below screen
  // mobile: bottom -2vh + translateY(-10vh) = visual 8vh inside screen from bottom
  const orbitBottom = isMobile ? "0vh" : isTabletLandscape ? "-20vh" : "-40vh";
  const orbitWidth = isMobile ? "130%" : "80vw";

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
      {/* Pink orbit — matches SceneNew orbitPanel final CTA position */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          bottom: orbitBottom,
          width: orbitWidth,
          height: "auto",
          pointerEvents: "none",
          zIndex: 9
        }}
      >
        <img
          ref={orbitInnerRef}
          src={isMobile ? pink_bigger_orbit_mobile : pink_bigger_orbit}
          alt="orbit"
          style={{ width: "100%", height: "auto", transformOrigin: "center center", opacity: 0.5 }}
        />
      </div>

      {/* Desktop stairs — left (GSAP sets final position on mount) */}
      {!isMobile && (
        <div
          ref={stairsLeftRef}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "40%",
            zIndex: 10,
            pointerEvents: "none",
            transformOrigin: "bottom center"
          }}
        >
          <img
            src={stairs_left_new}
            alt="left stairs"
            style={{ width: "100%", height: "auto" }}
          />
        </div>
      )}

      {/* Desktop stairs — right (GSAP sets final position on mount) */}
      {!isMobile && (
        <div
          ref={stairsRightRef}
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: "40%",
            zIndex: 10,
            pointerEvents: "none",
            transformOrigin: "bottom center"
          }}
        >
          <img
            src={stairs_right_new}
            alt="right stairs"
            style={{ width: "100%", height: "auto" }}
          />
        </div>
      )}

      {/* Mobile stairs — right (matches SceneNew ctaStart final position) */}
      {isMobile && (
        <img
          ref={mobileRightStairsRef}
          src={stairsfull_right_mobile}
          alt="stairs right"
          style={{
            position: "absolute",
            bottom: "-21%",
            right: "-36%",
            width: "80%",
            height: "auto",
            zIndex: 10,
            pointerEvents: "none"
          }}
        />
      )}

      {/* Mobile stairs — left (matches SceneNew ctaStart+1 final position) */}
      {isMobile && (
        <img
          ref={mobileLeftStairsRef}
          src={left_stairs_mod6_mobile}
          alt="stairs left"
          style={{
            position: "absolute",
            bottom: "-9%",
            left: "-2%",
            width: "32.5%",
            height: "auto",
            zIndex: 10,
            pointerEvents: "none"
          }}
        />
      )}

      {/* Text block — matches SceneNew orbitPanel text layout */}
      <div
        style={{
          position: "absolute",
          top: isMobile ? "25%" : "15%",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          zIndex: 20,
          width: isMobile ? "88vw" : "45%",
          pointerEvents: "none"
        }}
      >
        <div
          style={{
            fontWeight: 800,
            fontSize: isMobile ? "2.2rem" : "3.5rem",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            color: "rgb(0,0,0)"
          }}
        >
          Your design growth,
          <br />
          in your pocket.
        </div>

        <div
          style={{
            marginTop: isMobile ? "0.9rem" : "1.2rem",
            fontWeight: 400,
            fontSize: isMobile ? "1rem" : "1.2rem",
            lineHeight: 1.5,
            color: "black",
            textAlign: "center"
          }}
        >
          The Evolve app is coming. a personal space to learn at your own pace,
          track how far you've come, and stay curious about design every single
          day.
        </div>
      </div>

      {/* CTA button */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: isMobile ? "12%" : "10%",
          transform: "translateX(-50%)",
          zIndex: 20
        }}
      >
        <a
          href="https://chat.whatsapp.com/GDRw3ZPmkxyGzn6yyzaUcI"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{
            display: "inline-block",
            background: "rgb(20,20,20)",
            color: "#ffffff",
            padding: isMobile ? "13px 26px" : "15px 32px",
            borderRadius: "20px",
            fontSize: isMobile ? "1rem" : "1.1rem",
            fontWeight: 700,
            letterSpacing: "-0.01em",
            textDecoration: "none",
            cursor: "pointer",
            whiteSpace: "nowrap"
          }}
        >
          Be the first to know
        </a>
      </div>
    </section>
  );
});

Scene4_refined.displayName = "Scene4_refined";
export default Scene4_refined;
