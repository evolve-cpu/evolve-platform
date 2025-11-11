// // import React, {
// //   useEffect,
// //   useLayoutEffect,
// //   useMemo,
// //   useRef,
// //   useState
// // } from "react";
// // // import { ScrollTrigger } from "gsap/ScrollTrigger"; // if you use it, remember to register

// // // type Mode = "mobile-portrait" | "desktop-landscape" | "none";

// // const MOBILE_BASE = { w: 390, h: 844 }; // your mobile design size
// // const DESKTOP_BASE = { w: 1440, h: 900 }; // your desktop design size

// // function useScale(baseW, baseH, active) {
// //   const [scale, setScale] = useState(1);
// //   const [scaledHeight, setScaledHeight] = useState(baseH);

// //   useLayoutEffect(() => {
// //     if (!active) return;

// //     const set = () => {
// //       const vw = Math.max(
// //         document.documentElement.clientWidth,
// //         window.innerWidth || 0
// //       );
// //       const vh = Math.max(
// //         document.documentElement.clientHeight,
// //         window.innerHeight || 0
// //       );
// //       const s = Math.min(vw / baseW, vh / baseH);
// //       setScale(s);
// //       setScaledHeight(baseH * s);
// //       // if using ScrollTrigger:
// //       // ScrollTrigger.refresh();
// //     };

// //     set();
// //     window.addEventListener("resize", set);
// //     window.addEventListener("orientationchange", set);
// //     return () => {
// //       window.removeEventListener("resize", set);
// //       window.removeEventListener("orientationchange", set);
// //     };
// //   }, [baseW, baseH, active]);

// //   return { scale, scaledHeight };
// // }

// // export function TabletScaler({ children, enable = true }) {
// //   const getMode = () => {
// //     const w = Math.max(
// //       document.documentElement.clientWidth,
// //       window.innerWidth || 0
// //     );
// //     const h = Math.max(
// //       document.documentElement.clientHeight,
// //       window.innerHeight || 0
// //     );
// //     const isTabletWidth = w >= 600 && w <= 1180; // tune this to your breakpoints
// //     if (!isTabletWidth || !enable) return "none";
// //     const portrait = h >= w;
// //     return portrait ? "mobile-portrait" : "desktop-landscape";
// //   };

// //   const [mode, setMode] = useState < Mode > getMode();

// //   useEffect(() => {
// //     const onChange = () => setMode(getMode());
// //     window.addEventListener("resize", onChange);
// //     window.addEventListener("orientationchange", onChange);
// //     return () => {
// //       window.removeEventListener("resize", onChange);
// //       window.removeEventListener("orientationchange", onChange);
// //     };
// //   }, []);

// //   const base = useMemo(() => {
// //     if (mode === "mobile-portrait") return MOBILE_BASE;
// //     if (mode === "desktop-landscape") return DESKTOP_BASE;
// //     return null;
// //   }, [mode]);

// //   const { scale, scaledHeight } = useScale(
// //     base?.w || 1,
// //     base?.h || 1,
// //     mode !== "none"
// //   );

// //   if (mode === "none" || !base) {
// //     // normal render outside tablet range
// //     return <>{children}</>;
// //   }

// //   // wrapper keeps layout + scroll math correct for GSAP
// //   return (
// //     <div
// //       style={{
// //         position: "relative",
// //         width: "100%",
// //         height: `${scaledHeight}px`,
// //         overflow: "hidden",
// //         display: "flex",
// //         justifyContent: "center"
// //       }}
// //     >
// //       <div
// //         style={{
// //           width: `${base.w}px`,
// //           height: `${base.h}px`,
// //           transform: `scale(${scale})`,
// //           transformOrigin: "top left",
// //           // makes text/icons crisp when scaled
// //           WebkitFontSmoothing: "antialiased",
// //           MozOsxFontSmoothing: "grayscale"
// //         }}
// //       >
// //         {children}
// //       </div>
// //     </div>
// //   );
// // }

// import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";

// // base design sizes (change to your Figma frames)
// const MOBILE_BASE = { w: 390, h: 844 };
// const DESKTOP_BASE = { w: 1440, h: 900 };

// function useScale(baseW, baseH, active) {
//   const [scale, setScale] = useState(1);
//   const [scaledHeight, setScaledHeight] = useState(baseH);

//   useLayoutEffect(() => {
//     if (!active) return;

//     const update = () => {
//       const vw = Math.max(
//         document.documentElement.clientWidth,
//         window.innerWidth || 0
//       );
//       const vh = Math.max(
//         document.documentElement.clientHeight,
//         window.innerHeight || 0
//       );
//       const s = Math.min(vw / baseW, vh / baseH);
//       setScale(s);
//       setScaledHeight(baseH * s);
//       // if using ScrollTrigger, uncomment:
//       // ScrollTrigger.refresh();
//     };

//     update();
//     window.addEventListener("resize", update);
//     window.addEventListener("orientationchange", update);
//     return () => {
//       window.removeEventListener("resize", update);
//       window.removeEventListener("orientationchange", update);
//     };
//   }, [baseW, baseH, active]);

//   return { scale, scaledHeight };
// }

// export function TabletScaler({ children, enable = true }) {
//   const getMode = () => {
//     const w = Math.max(
//       document.documentElement.clientWidth,
//       window.innerWidth || 0
//     );
//     const h = Math.max(
//       document.documentElement.clientHeight,
//       window.innerHeight || 0
//     );
//     const isTabletWidth = w >= 600 && w <= 1180; // adjust to your breakpoints
//     if (!isTabletWidth || !enable) return "none";
//     const portrait = h >= w;
//     return portrait ? "mobile-portrait" : "desktop-landscape";
//   };

//   const [mode, setMode] = useState(getMode());

//   useEffect(() => {
//     const onChange = () => setMode(getMode());
//     window.addEventListener("resize", onChange);
//     window.addEventListener("orientationchange", onChange);
//     return () => {
//       window.removeEventListener("resize", onChange);
//       window.removeEventListener("orientationchange", onChange);
//     };
//   }, []);

//   const base = useMemo(() => {
//     if (mode === "mobile-portrait") return MOBILE_BASE;
//     if (mode === "desktop-landscape") return DESKTOP_BASE;
//     return null;
//   }, [mode]);

//   const { scale, scaledHeight } = useScale(
//     base ? base.w : 1,
//     base ? base.h : 1,
//     mode !== "none"
//   );

//   if (mode === "none" || !base) {
//     return <>{children}</>;
//   }

//   return (
//     <div
//       style={{
//         position: "relative",
//         width: "100%",
//         height: `${scaledHeight}px`,
//         overflow: "hidden",
//         display: "flex",
//         justifyContent: "center"
//       }}
//     >
//       <div
//         style={{
//           width: `${base.w}px`,
//           height: `${base.h}px`,
//           transform: `scale(${scale})`,
//           transformOrigin: "top left",
//           WebkitFontSmoothing: "antialiased",
//           MozOsxFontSmoothing: "grayscale"
//         }}
//       >
//         {children}
//       </div>
//     </div>
//   );
// }

// export default TabletScaler;

import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState
} from "react";

const MOBILE_BASE = { w: 390, h: 844 }; // your mobile design base
const DESKTOP_BASE = { w: 1440, h: 900 }; // your desktop design base

const TabletModeContext = createContext("none");
export const useTabletMode = () => useContext(TabletModeContext);

// ----------------------------
//  SCALE + CENTERING HOOK
// ----------------------------
function useScale(baseW, baseH, active) {
  const [state, setState] = useState({
    scale: 1,
    scaledHeight: baseH,
    offsetX: 0
  });

  useLayoutEffect(() => {
    if (!active) return;

    const update = () => {
      const vw = Math.max(
        document.documentElement.clientWidth,
        window.innerWidth || 0
      );
      const vh = Math.max(
        document.documentElement.clientHeight,
        window.innerHeight || 0
      );

      const scale = Math.min(vw / baseW, vh / baseH);
      const scaledHeight = baseH * scale;

      // ✅ horizontally center scaled design inside viewport
      const offsetX = Math.max(0, (vw - baseW * scale) / 2);

      setState({ scale, scaledHeight, offsetX });
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, [baseW, baseH, active]);

  return state; // { scale, scaledHeight, offsetX }
}

// ----------------------------
//  DETECT TABLET MODE
// ----------------------------
function getMode(enable = true) {
  const w = Math.max(
    document.documentElement.clientWidth,
    window.innerWidth || 0
  );
  const h = Math.max(
    document.documentElement.clientHeight,
    window.innerHeight || 0
  );
  const isTabletWidth = w >= 600 && w <= 1180; // tweak to match your breakpoints
  if (!isTabletWidth || !enable) return "none";
  const portrait = h >= w;
  return portrait ? "mobile-portrait" : "desktop-landscape";
}

// ----------------------------
//  MAIN COMPONENT
// ----------------------------
export function TabletScaler({ children, enable = true }) {
  const [mode, setMode] = useState(() => getMode(enable));

  useEffect(() => {
    const onChange = () => setMode(getMode(enable));
    window.addEventListener("resize", onChange);
    window.addEventListener("orientationchange", onChange);
    return () => {
      window.removeEventListener("resize", onChange);
      window.removeEventListener("orientationchange", onChange);
    };
  }, [enable]);

  const base = useMemo(() => {
    if (mode === "mobile-portrait") return MOBILE_BASE;
    if (mode === "desktop-landscape") return DESKTOP_BASE;
    return null;
  }, [mode]);

  const { scale, scaledHeight, offsetX } = useScale(
    base ? base.w : 1,
    base ? base.h : 1,
    mode !== "none"
  );

  const content = typeof children === "function" ? children(mode) : children;

  // normal (non-tablet) render
  if (mode === "none" || !base) {
    return (
      <TabletModeContext.Provider value={mode}>
        {content}
      </TabletModeContext.Provider>
    );
  }

  // ----------------------------
  //  TABLET-SCALED RENDER
  // ----------------------------
  return (
    <TabletModeContext.Provider value={mode}>
      <div
        style={{
          position: "relative",
          width: "100%",
          // use minHeight so ScrollTrigger / GSAP pin spacing works
          minHeight: `${scaledHeight}px`,
          overflow: "visible" // allow scroll + pinned elements
        }}
        data-simulated-mode={mode}
      >
        <div
          style={{
            width: `${base.w}px`,
            height: `${base.h}px`,
            transform: `translateX(${offsetX}px) scale(${scale})`,
            transformOrigin: "top left",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale"
          }}
        >
          {content}
        </div>
      </div>
    </TabletModeContext.Provider>
  );
}

export default TabletScaler;
