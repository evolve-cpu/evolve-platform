import * as React from "react";
import { useRef, forwardRef, useImperativeHandle } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

const ThreeDoorsWithRibbonDiamondMountains = forwardRef(function TDwRDM(
  props,
  ref
) {
  const starRef = useRef(null);
  // renamed: peaksGroupRef -> diamondRef
  const diamondRef = useRef(null);
  // add under existing refs
  const leftMountainsRef = useRef(null);
  const rightMountainsRef = useRef(null);

  useImperativeHandle(ref, () => ({
    // call this from the parent timeline right before you swap to the eye svg
    buildOutroToEye: ({ y = -70, scale = 1, duration = 1.5 } = {}) => {
      const tl = gsap.timeline();
      if (diamondRef.current && starRef.current) {
        tl.to([diamondRef.current, starRef.current], {
          y,
          scale,
          transformOrigin: "50% 50%",
          ease: "power2.out",
          duration,
          // force3D helps avoid shimmer on scrub
          force3D: true
        });
      }
      return tl;
    },
    buildMountainsRise: ({ yStart = 140, duration = 0.9 } = {}) => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      const left = leftMountainsRef.current;
      const right = rightMountainsRef.current;

      // animate both together (slight stagger) from their pre-set start to final
      tl.fromTo(
        [left, right],
        { y: yStart, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration,
          stagger: 0.08,
          immediateRender: false,
          lazy: false
        }
      )
        // optional settle bounce
        .to(
          [left, right],
          { y: -6, duration: 0.18, ease: "sine.out" },
          ">-0.08"
        )
        .to(
          [left, right],
          { y: 0, duration: 0.22, ease: "sine.inOut" },
          ">-0.06"
        );

      return tl;
    }
  }));

  useGSAP(() => {
    // keep the star twinkle
    if (starRef.current) {
      gsap.to(starRef.current, {
        opacity: 0,
        scale: 1.2,
        duration: 0.5,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
        transformOrigin: "center center"
      });
    }

    // OPTIONAL idle breathing on the diamond so the scene feels alive
    if (diamondRef.current) {
      gsap.to(diamondRef.current, {
        scale: 1.01,
        duration: 1.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        transformOrigin: "50% 50%"
      });
    }
  }, []);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      // width="1920"
      // height="515"
      // fill="none"
      viewBox="0 0 1920 515"
      fill="none"
      width="100vw"
      height="auto"
      preserveAspectRatio="xMidYMid slice"
      style={{
        width: "100vw", // full viewport width
        height: "auto",
        display: "block",
        position: "relative"
      }}
    >
      {/* Clipped background circle - pink/magenta circle with black stroke */}
      <g clipPath="url(#clip0_2980_1692)">
        <circle
          cx="961"
          cy="573"
          r="572"
          fill="#DF0586" // Pink/magenta fill
          stroke="#000" // Black outline
          strokeWidth="2"
        ></circle>
      </g>

      {/* Three crown/arch shapes with yellow stroke - main structural elements */}
      <path
        fill="#161616" // Dark gray/black fill
        stroke="#FFD007" // Yellow/gold stroke
        strokeMiterlimit="10"
        strokeWidth="16"
        d="M808.859 527.1V202.5c0-88.5 67.773-160.5 151.14-160.5 83.371 0 151.141 72 151.141 160.5v324.6H808.859ZM1154.72 527.1V202.5c0-88.5 67.78-160.5 151.14-160.5 83.37 0 151.14 72 151.14 160.5v324.6h-302.28000000000003ZM463 527V191.092C463 99.508 530.683 25 613.939 25s150.94 74.508 150.94 166.092V527H463Z"
      ></path>

      {/* Left section - Purple decorative elements (possibly flames or feathers) */}
      <g
        ref={leftMountainsRef}
        style={{
          opacity: 0,
          transform: "translateY(140px)",
          transformBox: "fill-box",
          transformOrigin: "50% 100%"
        }}
      >
        <path
          fill="#7A44BC" // Dark purple
          d="m516.056 518.826-45.087-1.261 22.01-88.623 23.077-87.266 22.98 87.266 22.108 88.623zM658.525 517.61l-45.087-1.648 22.01-121.979 23.077-120.233 22.98 120.233 22.107 121.979z"
        ></path>

        {/* Left section - Light purple decorative elements */}
        <path
          fill="#A35BFB" // Light purple
          d="m590.815 517.235-53.62-1.067 26.18-72.528 27.44-71.558 27.441 71.558 26.277 72.528zM711.818 517.858l-45.088-1.164 22.011-88.623 23.077-87.266 22.98 87.266 22.107 88.623z"
        ></path>
      </g>

      {/* Left wing - Dark magenta/maroon */}
      <path
        fill="#A30462" // Dark magenta
        d="M221.422 410.808c12.871 8.826 25.849 17.547 38.72 26.374 19.466 16.271 36.485 27.225 49.994 34.776.851.532 1.702.957 2.872 1.595 6.064 3.191 26.274 13.507 52.335 18.718 13.297 2.658 56.59 10.635 104.776-10.21 58.824-25.523 83.077-75.827 87.332-84.973 25.954-56.258 12.445-107.412 8.616-120.28-16.382-54.982-55.314-84.122-67.014-92.204-9.255-5.212-18.509-10.529-27.657-15.74 0 12.655-.213 25.311-.319 37.966 9.573 6.169 19.147 12.337 28.614 18.505 9.254 7.126 24.784 21.164 35.102 43.709 16.169 35.308 9.148 68.064 5.745 82.846-3.617 15.527-14.786 52.324-49.57 80.294-44.995 36.265-104.563 37.434-143.176 22.12-8.51-3.403-24.359-11.379-41.06-22.865-10.85-7.444-16.806-12.017-45.314-33.925-10.105-7.764-20.211-15.314-30.316-23.078C210.04 358.271 145.898 310.095-11 193.324c.425 17.335.957 34.564 1.383 51.898 77.013 55.195 154.026 110.39 230.933 165.692z"
      ></path>

      {/* Left wing - Pink layer */}
      <path
        fill="#DE0686" // Bright pink
        d="M470.647 207.153c0 11.273-.212 22.546-.212 33.819 7.233 3.403 18.721 9.997 28.826 22.227 14.254 17.335 17.126 35.839 18.828 47.006 3.511 23.184-1.063 41.157-2.34 45.73-1.702 6.062-6.595 21.695-19.253 37.754-16.594 21.057-36.273 29.99-45.527 34.138-21.062 9.359-39.252 10.635-46.272 10.847-8.829.319-29.89.107-52.973-9.89-9.148-3.935-15.743-8.189-25.955-14.889-16.7-10.847-28.082-20.419-30.422-22.439-19.253-16.059-138.39-109.54-305.713-240.455 0 14.144 0 28.395-.106 42.539C86.326 266.07 183.125 338.6 280.03 411.13a266 266 0 0 0 34.571 25.417c14.999 9.359 27.657 17.229 45.634 22.334 25.529 7.231 46.803 4.679 57.547 3.297 11.275-1.489 39.038-5.424 67.546-25.205 9.467-6.594 47.016-34.457 57.653-83.484 4.574-21.163 2.66-39.03 1.702-46.368-1.17-9.784-3.616-29.14-14.785-49.027-18.403-32.543-47.974-46.581-59.037-51.154z"
      ></path>

      {/* Right section - Purple decorative elements (mirror of left) */}
      <g
        ref={rightMountainsRef}
        style={{
          opacity: 0,
          transform: "translateY(140px)",
          transformBox: "fill-box",
          transformOrigin: "50% 100%"
        }}
      >
        <path
          fill="#7A44BC" // Dark purple
          d="m1405.8 523.501 46.2-1.291-22.55-90.769-23.65-89.379-23.55 89.379-22.65 90.769zM1259.81 522.263l46.21-1.688-22.56-124.931-23.65-123.144-23.54 123.144-22.66 124.931z"
        ></path>

        {/* Right section - Light purple decorative elements */}
        <path
          fill="#A35BFB" // Light purple
          d="m1329.2 521.869 54.95-1.092-26.83-74.284-28.12-73.29-28.12 73.29-26.92 74.284zM1205.2 522.511l46.21-1.192-22.56-90.769-23.65-89.378-23.54 89.378-22.66 90.769z"
        ></path>
      </g>

      {/* Center top - Gold/bronze triangular shape (left side of crown peak) - WITH FLIP ANIMATION */}
      {/* <path
        ref={leftPeakRef}
        fill="#BF9C05"
        d="m890.423 171.659 64.068-85.115.798 118.346z"
      ></path> */}

      {/* GROUP: Both crown peaks together for synchronized flipping */}
      <g ref={diamondRef}>
        {/* Center top - Gold/bronze triangular shape */}
        <path
          fill="#BF9C05"
          d="m890.423 171.659 64.068-85.115.798 118.346z"
        ></path>

        {/* Center top - Yellow triangular shape */}
        <path
          fill="#FFD007"
          d="m1019.7 170.785-65.208-84.243.799 118.346z"
        ></path>
      </g>

      {/* Star/sparkle element - OUTSIDE the group so it keeps shining */}
      <path
        ref={starRef}
        fill="#fff"
        d="m924.137 105.861-.186.674a24.34 24.34 0 0 1-13.767 15.554l.718.286a27.47 27.47 0 0 1 14.822 14.557l.561 1.304.186-.674a24.34 24.34 0 0 1 13.767-15.553l-.717-.286a27.48 27.48 0 0 1-14.823-14.557z"
      ></path>

      {/* Center bottom - Dark magenta triangular/chevron shape (outer layer) */}
      <path
        fill="#A30462" // Dark magenta
        d="m955.5 287-139 175.5L815 421l140.5-173.5 147 173.5v41.5z"
      ></path>

      {/* Center bottom - Pink triangular/chevron shape (inner layer) */}
      <path
        fill="#DF0586" // Pink
        d="M955.744 326.551 816.503 504.5 815 462.421 955.744 286.5 1103 462.421V504.5z"
      ></path>

      {/* Right wing - Dark magenta (mirror of left wing) */}
      <path
        fill="#A30462" // Dark magenta
        d="M1698.58 410.808c-12.87 8.826-25.85 17.547-38.72 26.374-19.47 16.271-36.49 27.225-50 34.776-.85.532-1.7.957-2.87 1.595-6.06 3.191-26.27 13.507-52.33 18.718-13.3 2.658-56.59 10.635-104.78-10.21-58.82-25.523-83.08-75.827-87.33-84.973-25.96-56.258-12.45-107.412-8.62-120.28 16.38-54.982 55.32-84.122 67.02-92.204 9.25-5.212 18.51-10.529 27.65-15.74 0 12.655.22 25.311.32 37.966-9.57 6.169-19.14 12.337-28.61 18.505-9.26 7.126-24.79 21.164-35.1 43.709-16.17 35.308-9.15 68.064-5.75 82.846 3.62 15.527 14.79 52.324 49.57 80.294 45 36.265 104.57 37.434 143.18 22.12 8.51-3.403 24.36-11.379 41.06-22.865 10.85-7.444 16.8-12.017 45.31-33.925 10.11-7.764 20.21-15.314 30.32-23.078 21.06-16.165 85.2-64.341 242.1-181.112-.43 17.335-.96 34.564-1.38 51.898-77.02 55.195-154.03 110.39-230.94 165.692z"
      ></path>

      {/* Right wing - Pink layer (mirror of left wing) */}
      <path
        fill="#DE0686" // Bright pink
        d="M1449.35 207.153c0 11.273.22 22.546.22 33.819-7.24 3.403-18.73 9.997-28.83 22.227-14.26 17.335-17.13 35.839-18.83 47.006-3.51 23.184 1.06 41.157 2.34 45.73 1.7 6.062 6.6 21.695 19.25 37.754 16.6 21.057 36.28 29.99 45.53 34.138 21.06 9.359 39.25 10.635 46.27 10.847 8.83.319 29.89.107 52.98-9.89 9.14-3.935 15.74-8.189 25.95-14.889 16.7-10.847 28.08-20.419 30.42-22.439 19.26-16.059 138.39-109.54 305.72-240.455 0 14.144 0 28.395.1 42.539-96.8 72.53-193.59 145.06-290.5 217.59-7.98 6.913-19.57 16.165-34.57 25.417-15 9.359-27.66 17.229-45.63 22.334-25.53 7.231-46.81 4.679-57.55 3.297-11.28-1.489-39.04-5.424-67.55-25.205-9.46-6.594-47.01-34.457-57.65-83.484-4.57-21.163-2.66-39.03-1.7-46.368 1.17-9.784 3.61-29.14 14.78-49.027 18.41-32.543 47.98-46.581 59.04-51.154z"
      ></path>

      {/* Clip path definition for the background circle */}
      <defs>
        <clipPath id="clip0_2980_1692">
          <path fill="#fff" d="M487 0h945v1146H487z"></path>
        </clipPath>
      </defs>
    </svg>
  );
});

export default React.memo(ThreeDoorsWithRibbonDiamondMountains);
