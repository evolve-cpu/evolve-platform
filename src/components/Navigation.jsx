// import { useState, useEffect, useRef } from "react";
// import { Link, useLocation } from "react-router-dom";
// import gsap from "gsap";
// // import { ModifiersPlugin } from "gsap/ModifiersPlugin"; gsap.registerPlugin(ModifiersPlugin);

// import {
//   evolve_logo_nav as evolve_logo,
//   evolve_logo_mobile,
//   three_wavy_lines,
//   three_wavy_lines_pink,
//   marquee_vector_1,
//   evolve_text,
//   marquee_vector_2
// } from "../assets/images/Nav";

// // updated: make both corners similar
// const MIXED_BL = 16;
// const MIXED_BR = 16;

// const Navigation = () => {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const location = useLocation();

//   const outerRef = useRef(null);
//   const navbarRef = useRef(null);
//   const barRowRef = useRef(null);
//   const menuBoxRef = useRef(null);
//   const marqueeTrackRef = useRef(null);
//   const marqueeGroupRef = useRef(null);
//   const navHeightRef = useRef(0);
//   const marqueeTLRef = useRef(null);

//   const navItems = [
//     { path: "/", label: "home" },
//     { path: "/about", label: "about" },
//     { path: "/course", label: "courses" },
//     { path: "/webinars", label: "webinars" },
//     { path: "/quiz", label: "quiz" },
//     { path: "/community", label: "community" },
//     { path: "/investor", label: "investor page" },
//     { path: "/contact", label: "contact us" }
//   ];

//   const isActive = (p) => location.pathname === p;

//   // measure navbar height so the panel starts exactly under it
//   useEffect(() => {
//     const measure = () => {
//       if (!outerRef.current) return;
//       navHeightRef.current = outerRef.current.offsetHeight || 0;
//       if (menuBoxRef.current) {
//         menuBoxRef.current.style.top = `${navHeightRef.current}px`;
//         menuBoxRef.current.style.height = `calc(100vh - ${navHeightRef.current}px)`;
//       }
//     };
//     measure();
//     const ro = new ResizeObserver(measure);
//     if (outerRef.current) ro.observe(outerRef.current);
//     window.addEventListener("resize", measure);
//     return () => {
//       ro.disconnect();
//       window.removeEventListener("resize", measure);
//     };
//   }, []);

//   // slide DOWN menu from under the navbar
//   useEffect(() => {
//     if (!menuBoxRef.current) return;
//     if (menuOpen) {
//       gsap.fromTo(
//         menuBoxRef.current,
//         { yPercent: -100, opacity: 0 },
//         { yPercent: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
//       );
//     } else {
//       gsap.to(menuBoxRef.current, {
//         yPercent: -100,
//         opacity: 0,
//         duration: 0.45,
//         ease: "power2.in"
//       });
//     }
//   }, [menuOpen]);

//   // close on route change
//   useEffect(() => setMenuOpen(false), [location.pathname]);

//   // esc to close
//   useEffect(() => {
//     const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, []);

//   // marquee builder: single JSX group cloned in JS for seamless loop
//   useEffect(() => {
//     if (!menuOpen) {
//       if (marqueeTLRef.current) {
//         marqueeTLRef.current.kill();
//         marqueeTLRef.current = null;
//       }
//       return;
//     }
//     const track = marqueeTrackRef.current;
//     const group = marqueeGroupRef.current;
//     if (!track || !group) return;

//     if (marqueeTLRef.current) marqueeTLRef.current.kill();
//     gsap.set(track, { x: 0 });

//     // strip old clones
//     while (track.children.length > 1) track.removeChild(track.lastChild);

//     // clone once
//     const clone = group.cloneNode(true);
//     track.appendChild(clone);

//     // measure one group width
//     const groupWidth = group.getBoundingClientRect().width;

//     const tl = gsap.timeline({ repeat: -1 });
//     tl.to(track, { x: -groupWidth, duration: 12, ease: "linear" });
//     marqueeTLRef.current = tl;

//     return () => {
//       if (marqueeTLRef.current) marqueeTLRef.current.kill();
//       marqueeTLRef.current = null;
//     };
//   }, [menuOpen]);

//   return (
//     // removed horizontal padding so the bar spans true full width edge to edge
//     <nav className="fixed top-0 left-0 w-full z-50">
//       {/* full width outer border */}
//       <div
//         ref={outerRef}
//         className="w-full border-2 border-black bg-transparent"
//         style={{
//           borderBottomLeftRadius: MIXED_BL,
//           borderBottomRightRadius: MIXED_BR
//         }}
//       >
//         {/* background clipped to rounded border */}
//         <div
//           ref={navbarRef}
//           className="w-full overflow-hidden"
//           style={{
//             borderBottomLeftRadius: MIXED_BL,
//             borderBottomRightRadius: MIXED_BR,
//             boxShadow:
//               "inset 0 18px 32px rgba(0,0,0,0.32), inset 18px 0 32px rgba(0,0,0,0.32)"
//           }}
//         >
//           {/* top bar */}
//           <div
//             ref={barRowRef}
//             className="bg-evolve-yellow w-full flex items-center justify-between px-4 md:px-8"
//             style={{ height: "64px" }}
//           >
//             {/* left: hamburger (smaller) */}
//             <button
//               className="cursor-pointer transition-transform duration-300 hover:scale-105"
//               onClick={() => setMenuOpen((v) => !v)}
//               aria-label="open menu"
//             >
//               <img
//                 src={menuOpen ? three_wavy_lines_pink : three_wavy_lines}
//                 alt="menu"
//                 className="h-5 w-auto md:h-6"
//               />
//             </button>

//             {/* center: logo (slightly smaller) */}
//             <div className="flex justify-center items-center">
//               <img
//                 src={evolve_logo}
//                 alt="evolve logo"
//                 className="h-8 w-auto md:h-9"
//               />
//             </div>

//             {/* right: join us */}
//             <div className="text-black font-extrabold leading-none tracking-wide text-[20px] md:text-[28px]">
//               join us
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* slide-down menu */}
//       <div
//         ref={menuBoxRef}
//         className={`fixed left-0 w-full md:w-[40%] bg-evolve-yellow border-x-2 border-b-2 border-black ${
//           menuOpen ? "block" : "hidden"
//         }`}
//         style={{
//           borderBottomLeftRadius: MIXED_BL,
//           borderBottomRightRadius: MIXED_BR,
//           overflow: "hidden"
//         }}
//       >
//         <div className="h-full flex flex-col">
//           {/* equal top/bottom to vertically center block */}
//           <div className="flex-1" />
//           {/* updated: left aligned, tighter spacing, padding to pull text off the edge */}
//           <div className="flex flex-col justify-center items-start space-y-2 px-6 md:px-8">
//             {navItems.map((item) => (
//               <Link
//                 key={item.path}
//                 to={item.path}
//                 onClick={() => setMenuOpen(false)}
//                 className={`text-[40px] font-extrabold leading-[1.05] w-full text-left transition-colors duration-300 ${
//                   isActive(item.path)
//                     ? "text-evolve-pink"
//                     : "text-black hover:text-evolve-pink"
//                 }`}
//               >
//                 {item.label}
//               </Link>
//             ))}
//           </div>
//           <div className="flex-1" />

//           {/* marquee */}
//           <div className="w-full h-20 border-t-2 border-black bg-evolve-lavender-indigo overflow-hidden relative">
//             <div
//               ref={marqueeTrackRef}
//               className="absolute top-1/2 -translate-y-1/2 left-0 flex"
//               style={{ willChange: "transform" }}
//             >
//               {/* define once; cloned in JS */}
//               <div
//                 ref={marqueeGroupRef}
//                 className="flex items-center gap-10 pr-10 flex-none"
//               >
//                 <img
//                   src={marquee_vector_1}
//                   alt="vector 1"
//                   className="h-10 w-auto flex-none"
//                 />
//                 <img
//                   src={evolve_text}
//                   alt="evolve text"
//                   className="h-6 w-auto flex-none"
//                 />
//                 <img
//                   src={marquee_vector_2}
//                   alt="vector 2"
//                   className="h-10 w-auto flex-none"
//                 />
//                 <img
//                   src={evolve_text}
//                   alt="evolve text"
//                   className="h-6 w-auto flex-none"
//                 />
//                 <img
//                   src={marquee_vector_1}
//                   alt="vector 1"
//                   className="h-10 w-auto flex-none"
//                 />
//                 <img
//                   src={evolve_text}
//                   alt="evolve text"
//                   className="h-6 w-auto flex-none"
//                 />
//                 <img
//                   src={marquee_vector_2}
//                   alt="vector 2"
//                   className="h-10 w-auto flex-none"
//                 />
//                 <img
//                   src={evolve_text}
//                   alt="evolve text"
//                   className="h-6 w-auto flex-none"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navigation;

import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import gsap from "gsap";

import {
  evolve_logo_nav as evolve_logo,
  evolve_logo_mobile,
  three_wavy_lines,
  three_wavy_lines_pink,
  marquee_vector_1,
  evolve_text,
  marquee_vector_2,
  cross_line_pink
} from "../assets/images/Nav";

const MIXED_BL = 16;
const MIXED_BR = 16;

const Navigation = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const outerRef = useRef(null);
  const navbarRef = useRef(null);

  const menuUnderlayRef = useRef(null);
  const menuPanelRef = useRef(null);
  const menuContentRef = useRef(null);

  const marqueeTrackRef = useRef(null);
  const marqueeGroupRef = useRef(null);
  const marqueeTLRef = useRef(null);

  const navHeightRef = useRef(0);

  const navItems = [
    { path: "/", label: "home" },
    { path: "/about", label: "about" },
    { path: "/course", label: "courses" },
    { path: "/webinars", label: "webinars" },
    { path: "/quiz", label: "quiz" },
    { path: "/community", label: "community" },
    { path: "/investor", label: "investor page" },
    { path: "/contact", label: "contact us" }
  ];

  const isActive = (p) => {
    // Exact match for home page
    if (p === "/" && location.pathname === "/") return true;
    // For other pages, check if pathname starts with the path (but not home)
    if (p !== "/" && location.pathname === p) return true;
    return false;
  };
  const isDesktop = () => window.matchMedia("(min-width: 768px)").matches;

  // measure navbar height → push menu content below it
  useEffect(() => {
    const measure = () => {
      if (!outerRef.current) return;
      navHeightRef.current = outerRef.current.offsetHeight || 0;
      if (menuContentRef.current) {
        menuContentRef.current.style.paddingTop = `${navHeightRef.current}px`;
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (outerRef.current) ro.observe(outerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // open/close animations - FIXED
  useEffect(() => {
    const underlay = menuUnderlayRef.current;
    const panel = menuPanelRef.current;
    if (!underlay || !panel) return;

    if (menuOpen) {
      if (isDesktop()) {
        // desktop open: show overlay, slide panel from left
        gsap.set(underlay, { display: "block", opacity: 0 });
        gsap.set(panel, { xPercent: -100 });
        gsap.to(underlay, { opacity: 1, duration: 0.55, ease: "power3.out" });
        gsap.to(panel, { xPercent: 0, duration: 0.55, ease: "power3.out" });
      } else {
        // mobile open: slide underlay down from top
        gsap.set(underlay, { display: "block", yPercent: -100 });
        gsap.to(underlay, { yPercent: 0, duration: 0.55, ease: "power3.out" });
      }
    } else {
      if (isDesktop()) {
        // desktop close: slide panel left, fade overlay
        gsap.to(panel, { xPercent: -100, duration: 0.45, ease: "power2.in" });
        gsap.to(underlay, {
          opacity: 0,
          duration: 0.45,
          ease: "power2.in",
          onComplete: () => gsap.set(underlay, { display: "none" })
        });
      } else {
        // mobile close: slide underlay up
        gsap.to(underlay, {
          yPercent: -100,
          duration: 0.45,
          ease: "power2.in",
          onComplete: () => gsap.set(underlay, { display: "none" })
        });
      }
    }
  }, [menuOpen]);

  // close on route change
  useEffect(() => setMenuOpen(false), [location.pathname]);

  // esc to close
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // marquee (clone once for seamless)
  useEffect(() => {
    if (!menuOpen) {
      if (marqueeTLRef.current) {
        marqueeTLRef.current.kill();
        marqueeTLRef.current = null;
      }
      return;
    }
    const track = marqueeTrackRef.current;
    const group = marqueeGroupRef.current;
    if (!track || !group) return;

    if (marqueeTLRef.current) marqueeTLRef.current.kill();
    gsap.set(track, { x: 0 });

    while (track.children.length > 1) track.removeChild(track.lastChild);
    const clone = group.cloneNode(true);
    track.appendChild(clone);

    const groupWidth = group.getBoundingClientRect().width;
    const tl = gsap.timeline({ repeat: -1 });
    tl.to(track, { x: -groupWidth, duration: 14, ease: "linear" });
    marqueeTLRef.current = tl;

    return () => {
      if (marqueeTLRef.current) marqueeTLRef.current.kill();
      marqueeTLRef.current = null;
    };
  }, [menuOpen]);

  return (
    <>
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full z-50">
        <div
          ref={outerRef}
          className="w-full border-2 border-black bg-transparent"
          style={{
            borderBottomLeftRadius: MIXED_BL,
            borderBottomRightRadius: MIXED_BR
          }}
        >
          <div
            ref={navbarRef}
            className="w-full overflow-hidden"
            style={{
              borderBottomLeftRadius: MIXED_BL,
              borderBottomRightRadius: MIXED_BR
              // boxShadow: `
              //   inset 6px 6px 0 rgba(0, 0, 0, 0.35),
              //   inset 6px 6px 0 rgba(0, 0, 0, 0.35)
              // `
            }}
          >
            <div
              className="bg-evolve-yellow w-full flex items-center justify-between px-4 md:px-8"
              style={{
                height: "56px",
                boxShadow: `
                inset 6px 6px 0 rgba(0, 0, 0, 0.2),
                inset 6px 6px 0 rgba(0, 0, 0, 0.2)
              `
              }}
            >
              <button
                className="cursor-pointer transition-transform duration-300 hover:scale-105 flex-shrink-0"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="open menu"
                style={{ width: "72px" }}
              >
                <img
                  src={menuOpen ? cross_line_pink : three_wavy_lines}
                  alt="menu"
                  className="h-5 w-auto md:h-6"
                />
              </button>

              <div className="absolute left-1/2 -translate-x-1/2 flex justify-center items-center">
                <img
                  src={evolve_logo_mobile}
                  alt="evolve logo"
                  className="h-7 w-auto md:hidden"
                />
                <img
                  src={evolve_logo}
                  alt="evolve logo"
                  className="hidden md:block h-7 w-auto"
                />
              </div>

              <div className="text-black font-extrabold leading-none tracking-normal text-[16px] md:text-[20px] flex-shrink-0">
                join us
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* UNDERLAY (behind navbar) */}
      <div
        ref={menuUnderlayRef}
        className="fixed top-0 left-0 w-full h-[80vh] md:h-screen z-40 hidden"
        style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.25)" }}
      >
        <div className="relative h-full w-full flex">
          {/* DESKTOP OVERLAY (shadow/backdrop) */}
          <div className="hidden md:block absolute inset-0 bg-black/30" />

          {/* LEFT PANEL */}
          <div
            ref={menuPanelRef}
            className="relative w-full md:w-[40%] bg-evolve-yellow border-b-2 border-r-2 border-black overflow-hidden"
            style={{
              boxShadow: "0 24px 48px rgba(0,0,0,0.28)"
            }}
          >
            <div ref={menuContentRef} className="h-full flex flex-col">
              {/* middle area takes all space between navbar (paddingTop) and marquee */}
              <div className="flex-1 flex items-center">
                <div className="w-full flex justify-center px-6 md:px-8">
                  <div className="flex flex-col items-start space-y-2 tracking-normal">
                    {navItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMenuOpen(false)}
                        className={`text-[32px] md:text-[40px] font-extrabold leading-[1.05] text-left tracking-normal transition-colors duration-300 ${
                          isActive(item.path)
                            ? "text-evolve-pink"
                            : "text-black hover:text-evolve-pink"
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* marquee: smaller on mobile, bigger on desktop */}
              <div className="w-full h-16 md:h-28 border-t-2 border-black bg-evolve-lavender-indigo overflow-hidden relative">
                <div
                  ref={marqueeTrackRef}
                  className="absolute top-1/2 -translate-y-1/2 left-0 flex"
                  style={{ willChange: "transform" }}
                >
                  <div
                    ref={marqueeGroupRef}
                    className="flex items-center gap-8 md:gap-14 pr-8 md:pr-14 flex-none"
                  >
                    <img
                      src={marquee_vector_1}
                      alt="vector 1"
                      className="h-10 md:h-14 w-auto flex-none"
                    />
                    <img
                      src={evolve_text}
                      alt="evolve text"
                      className="h-8 md:h-10 w-auto flex-none"
                    />
                    <img
                      src={marquee_vector_2}
                      alt="vector 2"
                      className="h-10 md:h-14 w-auto flex-none"
                    />
                    <img
                      src={evolve_text}
                      alt="evolve text"
                      className="h-8 md:h-10 w-auto flex-none"
                    />
                    <img
                      src={marquee_vector_1}
                      alt="vector 1"
                      className="h-10 md:h-14 w-auto flex-none"
                    />
                    <img
                      src={evolve_text}
                      alt="evolve text"
                      className="h-8 md:h-10 w-auto flex-none"
                    />
                    <img
                      src={marquee_vector_2}
                      alt="vector 2"
                      className="h-10 md:h-14 w-auto flex-none"
                    />
                    <img
                      src={evolve_text}
                      alt="evolve text"
                      className="h-8 md:h-10 w-auto flex-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT CLICK-TO-CLOSE AREA (desktop only) */}
          <button
            className="hidden md:block flex-1 h-full bg-transparent relative z-10"
            onClick={() => setMenuOpen(false)}
            aria-label="close menu overlay"
          />
        </div>
      </div>
    </>
  );
};

export default Navigation;
