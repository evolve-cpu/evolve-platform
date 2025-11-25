// import { useState, useEffect, useRef } from "react";
// // import { Link, useLocation } from "react-router-dom";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import gsap from "gsap";

// import {
//   evolve_logo_nav as evolve_logo,
//   evolve_logo_mobile,
//   three_wavy_lines,
//   three_wavy_lines_pink,
//   marquee_vector_1,
//   evolve_text,
//   marquee_vector_2,
//   cross_line_pink
// } from "../assets/images/Nav";

// const MIXED_BL = 16;
// const MIXED_BR = 16;

// const Navigation = ({ onContactClick, showNavbar = true, onLogoClick }) => {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const location = useLocation();
//   const navigate = useNavigate();

//   const outerRef = useRef(null);
//   const navbarRef = useRef(null);

//   const menuUnderlayRef = useRef(null);
//   const menuPanelRef = useRef(null);
//   const menuContentRef = useRef(null);

//   const marqueeTrackRef = useRef(null);
//   const marqueeGroupRef = useRef(null);
//   const marqueeTLRef = useRef(null);

//   const navHeightRef = useRef(0);

//   const navItems = [
//     { path: "/", label: "home" },
//     // { path: "/about", label: "about" },
//     // { path: "/course", label: "courses" },
//     // { path: "/webinars", label: "webinars" },
//     // { path: "/quiz", label: "quiz" },
//     // { path: "/community", label: "community" },
//     // { path: "/investor", label: "investor page" },
//     { path: "/contact", label: "contact us" },
//     {
//       path: "https://tally.so/r/ob6WVV?formEventsForwarding=1",
//       label: "rate this website",
//       external: true
//     }
//   ];

//   const isActive = (p) => {
//     // Exact match for home page
//     if (p === "/" && location.pathname === "/") return true;
//     // For other pages, check if pathname starts with the path (but not home)
//     if (p !== "/" && location.pathname === p) return true;
//     return false;
//   };
//   const isDesktop = () => window.matchMedia("(min-width: 768px)").matches;

//   const handleLogoClick = () => {
//     // If not on home page, navigate to home
//     if (location.pathname !== "/") {
//       navigate("/");
//     }
//     // If there's an onLogoClick prop, call it
//     if (onLogoClick) {
//       onLogoClick();
//     }
//   };

//   // measure navbar height → push menu content below it
//   useEffect(() => {
//     const measure = () => {
//       if (!outerRef.current) return;
//       navHeightRef.current = outerRef.current.offsetHeight || 0;
//       if (menuContentRef.current) {
//         menuContentRef.current.style.paddingTop = `${navHeightRef.current}px`;
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

//   // open/close animations - FIXED
//   useEffect(() => {
//     const underlay = menuUnderlayRef.current;
//     const panel = menuPanelRef.current;
//     if (!underlay || !panel) return;

//     if (menuOpen) {
//       if (isDesktop()) {
//         // desktop open: show overlay, slide panel from left
//         gsap.set(underlay, { display: "block", opacity: 0 });
//         gsap.set(panel, { xPercent: -100 });
//         gsap.to(underlay, { opacity: 1, duration: 0.55, ease: "power3.out" });
//         gsap.to(panel, { xPercent: 0, duration: 0.55, ease: "power3.out" });
//       } else {
//         // mobile open: slide underlay down from top
//         gsap.set(underlay, { display: "block", yPercent: -100 });
//         gsap.to(underlay, { yPercent: 0, duration: 0.55, ease: "power3.out" });
//       }
//     } else {
//       if (isDesktop()) {
//         // desktop close: slide panel left, fade overlay
//         gsap.to(panel, { xPercent: -100, duration: 0.45, ease: "power2.in" });
//         gsap.to(underlay, {
//           opacity: 0,
//           duration: 0.45,
//           ease: "power2.in",
//           onComplete: () => gsap.set(underlay, { display: "none" })
//         });
//       } else {
//         // mobile close: slide underlay up
//         gsap.to(underlay, {
//           yPercent: -100,
//           duration: 0.45,
//           ease: "power2.in",
//           onComplete: () => gsap.set(underlay, { display: "none" })
//         });
//       }
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

//   // marquee (clone once for seamless)
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

//     while (track.children.length > 1) track.removeChild(track.lastChild);
//     const clone = group.cloneNode(true);
//     track.appendChild(clone);

//     const groupWidth = group.getBoundingClientRect().width;
//     const tl = gsap.timeline({ repeat: -1 });
//     tl.to(track, { x: -groupWidth, duration: 14, ease: "linear" });
//     marqueeTLRef.current = tl;

//     return () => {
//       if (marqueeTLRef.current) marqueeTLRef.current.kill();
//       marqueeTLRef.current = null;
//     };
//   }, [menuOpen]);

//   return (
//     <>
//       {/* NAVBAR */}
//       <nav
//         className={`fixed top-0 left-0 right-0 z-50 transition-opacity duration-500 ${
//           showNavbar ? "opacity-100" : "opacity-0 pointer-events-none"
//         }`}
//       >
//         <div
//           ref={outerRef}
//           className="w-full border-2 border-black bg-transparent"
//           style={{
//             borderBottomLeftRadius: MIXED_BL,
//             borderBottomRightRadius: MIXED_BR
//           }}
//         >
//           <div
//             ref={navbarRef}
//             className="w-full overflow-hidden"
//             style={{
//               borderBottomLeftRadius: MIXED_BL,
//               borderBottomRightRadius: MIXED_BR
//             }}
//           >
//             <div
//               className="bg-evolve-yellow w-full flex items-center justify-between px-4 md:px-8"
//               style={{
//                 height: "56px",
//                 boxShadow: `
//                 inset 6px 6px 0 rgba(0, 0, 0, 0.15),
//                 inset 6px 6px 0 rgba(0, 0, 0, 0.15)
//               `
//               }}
//             >
//               <button
//                 className="cursor-pointer transition-transform duration-300 hover:scale-105 flex-shrink-0"
//                 onClick={() => setMenuOpen((v) => !v)}
//                 aria-label="open menu"
//                 style={{ width: "72px" }}
//               >
//                 <img
//                   src={menuOpen ? cross_line_pink : three_wavy_lines}
//                   alt="menu"
//                   className="h-5 w-auto md:h-6"
//                 />
//               </button>

//               <div
//                 onClick={handleLogoClick}
//                 className="absolute left-1/2 cursor-pointer -translate-x-1/2 flex justify-center items-center"
//               >
//                 <img
//                   src={evolve_logo_mobile}
//                   alt="evolve logo"
//                   className="h-7 w-auto md:hidden"
//                 />
//                 <img
//                   src={evolve_logo}
//                   alt="evolve logo"
//                   className="hidden md:block h-7 w-auto"
//                 />
//               </div>

//               <a
//                 // href="https://discord.com/channels/@me/1347086283985649749/1438414139365265479"
//                 href="https://discord.gg/wKRYG7cSWt"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-black font-extrabold leading-none tracking-normal text-[16px] md:text-[20px] flex-shrink-0 cursor-pointer"
//               >
//                 join us
//               </a>
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* UNDERLAY (behind navbar) */}
//       <div
//         ref={menuUnderlayRef}
//         className="fixed top-0 left-0 w-full h-[80vh] md:h-screen z-40 hidden"
//         style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.25)" }}
//       >
//         <div className="relative h-full w-full flex">
//           {/* DESKTOP OVERLAY (shadow/backdrop) */}
//           <div className="hidden md:block absolute inset-0 bg-black/30" />

//           {/* LEFT PANEL */}
//           <div
//             ref={menuPanelRef}
//             className="relative w-full md:w-[40%] bg-evolve-yellow border-b-2 border-r-2 border-black overflow-hidden"
//             style={{
//               boxShadow: "0 24px 48px rgba(0,0,0,0.28)"
//             }}
//           >
//             <div ref={menuContentRef} className="h-full flex flex-col">
//               {/* middle area takes all space between navbar (paddingTop) and marquee */}
//               <div className="flex-1 flex items-center">
//                 <div className="w-full flex justify-center px-6 md:px-8">
//                   <div className="flex flex-col items-start space-y-2 tracking-normal">
//                     {navItems.map((item) =>
//                       item.external ? (
//                         <a
//                           key={item.path}
//                           href={item.path}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           onClick={() => setMenuOpen(false)}
//                           className="text-[32px] md:text-[40px] font-extrabold leading-[1.05] text-left tracking-normal transition-colors duration-300 text-black hover:text-evolve-pink"
//                         >
//                           {item.label}
//                         </a>
//                       ) : (
//                         <Link
//                           key={item.path}
//                           to={item.path}
//                           onClick={() => setMenuOpen(false)}
//                           className={`text-[32px] md:text-[40px] font-extrabold leading-[1.05] text-left tracking-normal transition-colors duration-300 ${
//                             isActive(item.path)
//                               ? "text-evolve-pink"
//                               : "text-black hover:text-evolve-pink"
//                           }`}
//                         >
//                           {item.label}
//                         </Link>
//                       )
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* marquee: smaller on mobile, bigger on desktop */}
//               <div className="w-full h-16 md:h-28 border-t-2 border-black bg-evolve-lavender-indigo overflow-hidden relative">
//                 <div
//                   ref={marqueeTrackRef}
//                   className="absolute top-1/2 -translate-y-1/2 left-0 flex"
//                   style={{ willChange: "transform" }}
//                 >
//                   <div
//                     ref={marqueeGroupRef}
//                     className="flex items-center gap-8 md:gap-14 pr-8 md:pr-14 flex-none"
//                   >
//                     <img
//                       src={marquee_vector_1}
//                       alt="vector 1"
//                       className="h-10 md:h-14 w-auto flex-none"
//                     />
//                     <img
//                       src={evolve_text}
//                       alt="evolve text"
//                       className="h-8 md:h-10 w-auto flex-none"
//                     />
//                     <img
//                       src={marquee_vector_2}
//                       alt="vector 2"
//                       className="h-10 md:h-14 w-auto flex-none"
//                     />
//                     <img
//                       src={evolve_text}
//                       alt="evolve text"
//                       className="h-8 md:h-10 w-auto flex-none"
//                     />
//                     <img
//                       src={marquee_vector_1}
//                       alt="vector 1"
//                       className="h-10 md:h-14 w-auto flex-none"
//                     />
//                     <img
//                       src={evolve_text}
//                       alt="evolve text"
//                       className="h-8 md:h-10 w-auto flex-none"
//                     />
//                     <img
//                       src={marquee_vector_2}
//                       alt="vector 2"
//                       className="h-10 md:h-14 w-auto flex-none"
//                     />
//                     <img
//                       src={evolve_text}
//                       alt="evolve text"
//                       className="h-8 md:h-10 w-auto flex-none"
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* RIGHT CLICK-TO-CLOSE AREA (desktop only) */}
//           <button
//             className="hidden md:block flex-1 h-full bg-transparent relative z-10"
//             onClick={() => setMenuOpen(false)}
//             aria-label="close menu overlay"
//           />
//         </div>
//       </div>
//     </>
//   );
// };

// export default Navigation;

import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  // ⬅️ make sure this exists in your Nav assets
} from "../assets/images/Nav";
import { join_us_button } from "../assets/images/Home";

const MIXED_BL = 16;
const MIXED_BR = 16;

const Navigation = ({ onContactClick, showNavbar = true, onLogoClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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
    { path: "/contact", label: "contact us" },
    {
      path: "https://tally.so/r/ob6WVV?formEventsForwarding=1",
      label: "rate this website",
      external: true
    }
  ];

  const isActive = (p) => {
    if (p === "/" && location.pathname === "/") return true;
    if (p !== "/" && location.pathname === p) return true;
    return false;
  };

  const isDesktop = () => window.matchMedia("(min-width: 768px)").matches;

  const handleLogoClick = () => {
    if (location.pathname !== "/") {
      navigate("/");
    }
    if (onLogoClick) {
      onLogoClick();
    }
  };

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
        gsap.set(underlay, { display: "block", opacity: 0 });
        gsap.set(panel, { xPercent: -100 });
        gsap.to(underlay, { opacity: 1, duration: 0.55, ease: "power3.out" });
        gsap.to(panel, { xPercent: 0, duration: 0.55, ease: "power3.out" });
      } else {
        gsap.set(underlay, { display: "block", yPercent: -100 });
        gsap.to(underlay, { yPercent: 0, duration: 0.55, ease: "power3.out" });
      }
    } else {
      if (isDesktop()) {
        gsap.to(panel, { xPercent: -100, duration: 0.45, ease: "power2.in" });
        gsap.to(underlay, {
          opacity: 0,
          duration: 0.45,
          ease: "power2.in",
          onComplete: () => gsap.set(underlay, { display: "none" })
        });
      } else {
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
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-opacity duration-500 ${
          showNavbar ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
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
            }}
          >
            <div
              className="bg-evolve-yellow w-full flex items-center justify-between px-4 md:px-8"
              style={{
                height: "56px",
                boxShadow: `
                inset 6px 6px 0 rgba(0, 0, 0, 0.15),
                inset 6px 6px 0 rgba(0, 0, 0, 0.15)
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

              <div
                onClick={handleLogoClick}
                className="absolute left-1/2 cursor-pointer -translate-x-1/2 flex justify-center items-center"
              >
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

              <a
                href="https://discord.gg/wKRYG7cSWt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black font-extrabold leading-none tracking-normal text-[16px] md:text-[20px] flex-shrink-0 cursor-pointer"
              >
                join us
              </a>
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
              {/* middle area: nav items */}
              <div className="flex-1 flex items-center">
                <div className="w-full flex justify-center px-6 md:px-8">
                  <div className="flex flex-col items-start space-y-2 tracking-normal">
                    {navItems.map((item) =>
                      item.external ? (
                        <a
                          key={item.path}
                          href={item.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setMenuOpen(false)}
                          className="text-[32px] md:text-[40px] font-extrabold leading-[1.05] text-left tracking-normal transition-colors duration-300 text-black hover:text-evolve-pink"
                        >
                          {item.label}
                        </a>
                      ) : (
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
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* JOIN US BUTTON (full menu) */}
              <div className="w-full flex justify-center mb-5 md:mb-6">
                <a
                  href="https://discord.gg/wKRYG7cSWt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer hover:opacity-80 transition-opacity duration-300"
                >
                  <img
                    src={join_us_button}
                    alt="join evolve community"
                    className="w-auto h-12 md:h-16"
                  />
                </a>
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
