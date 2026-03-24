// import { useState, useEffect, useRef } from "react";
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
// import { join_us_button, join_us_button_hover } from "../assets/images/Home";
// import { useAuth } from "../hooks/useAuth";
// import { handleSignIn } from "../auth/signInLogic";

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

//   // const { user, setUser } = useAuth();
//   const { user, setUser, authLoading, setAuthLoading } = useAuth();

//   // const navItems = [
//   //   { path: "/", label: "home" },
//   //   { path: "/contact", label: "contact us" },
//   //   {
//   //     path: "https://tally.so/r/ob6WVV?formEventsForwarding=1",
//   //     label: "rate this website",
//   //     external: true
//   //   }
//   // ];

//   const navItems = [
//     { path: "/", label: "home" },
//     { path: "/community", label: "community" },
//     { path: "/webinars", label: "webinars" },
//     { path: "/college-activation", label: "offline activity" },
//     { path: "/contact", label: "contact us", isModal: true }, // Add isModal flag
//     {
//       path: "https://tally.so/r/ob6WVV?formEventsForwarding=1",
//       label: "rate this website",
//       external: true
//     }
//   ];

//   const isActive = (p) => {
//     if (p === "/" && location.pathname === "/") return true;
//     if (p !== "/" && location.pathname === p) return true;
//     return false;
//   };

//   const isDesktop = () => window.matchMedia("(min-width: 768px)").matches;

//   const handleLogoClick = () => {
//     if (location.pathname !== "/") {
//       navigate("/");
//     }
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

//   // Navbar slide-in animation on mount
//   const hasAnimatedRef = useRef(false);

//   // navbar slide in / out based on showNavbar
//   useEffect(() => {
//     if (!outerRef.current) return;
//     const el = outerRef.current;

//     // 🔹 first render: just set position, no animation
//     if (!hasAnimatedRef.current) {
//       gsap.set(el, { y: showNavbar ? 0 : -100 });
//       el.style.pointerEvents = showNavbar ? "auto" : "none";
//       hasAnimatedRef.current = true;
//       return;
//     }

//     // 🔹 subsequent changes: animate
//     if (showNavbar) {
//       gsap.to(el, {
//         y: 0,
//         duration: 0.6,
//         ease: "power3.out",
//         onStart: () => {
//           el.style.pointerEvents = "auto";
//         }
//       });
//     } else {
//       gsap.to(el, {
//         y: -100,
//         duration: 0.4,
//         ease: "power2.in",
//         onComplete: () => {
//           el.style.pointerEvents = "none";
//         }
//       });
//     }
//   }, [showNavbar]);

//   // open/close animations - FIXED + prevent scroll
//   useEffect(() => {
//     const underlay = menuUnderlayRef.current;
//     const panel = menuPanelRef.current;
//     if (!underlay || !panel) return;

//     if (menuOpen) {
//       // Prevent body scroll
//       document.body.style.overflow = "hidden";

//       if (isDesktop()) {
//         gsap.set(underlay, { display: "block", opacity: 0 });
//         gsap.set(panel, { xPercent: -100 });
//         gsap.to(underlay, { opacity: 1, duration: 0.55, ease: "power3.out" });
//         gsap.to(panel, { xPercent: 0, duration: 0.55, ease: "power3.out" });
//       } else {
//         gsap.set(underlay, { display: "block", yPercent: -100 });
//         gsap.to(underlay, { yPercent: 0, duration: 0.55, ease: "power3.out" });
//       }
//     } else {
//       // Restore body scroll
//       document.body.style.overflow = "";

//       if (isDesktop()) {
//         gsap.to(panel, { xPercent: -100, duration: 0.45, ease: "power2.in" });
//         gsap.to(underlay, {
//           opacity: 0,
//           duration: 0.45,
//           ease: "power2.in",
//           onComplete: () => gsap.set(underlay, { display: "none" })
//         });
//       } else {
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
//       {/* <nav
//         className={`fixed top-0 left-0 right-0 z-50 transition-opacity duration-500 ${
//           showNavbar ? "opacity-100" : "opacity-0 pointer-events-none"
//         }`}
//       > */}
//       <nav className="fixed top-0 left-0 right-0 z-50">
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

//               {/* <a
//                 href="https://discord.gg/wKRYG7cSWt"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-black font-extrabold leading-none tracking-normal text-[16px] md:text-[20px] flex-shrink-0 cursor-pointer"
//               >
//                 join us
//               </a> */}
//               <button
//                 disabled={authLoading}
//                 onClick={() => handleSignIn(setUser, setAuthLoading)}
//                 className="text-black font-extrabold text-[16px] md:text-[20px] flex items-center gap-2"
//               >
//                 {authLoading ? (
//                   <>
//                     <span className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" />
//                     <span>signing in…</span>
//                   </>
//                 ) : user ? (
//                   <>
//                     <img
//                       src={user.avatar_url}
//                       className="h-6 w-6 rounded-full"
//                     />
//                     <span>{user.username}</span>
//                   </>
//                 ) : (
//                   "sign in"
//                 )}
//               </button>
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
//               {/* middle area: nav items */}
//               <div className="flex-1 flex items-center">
//                 <div className="w-full flex justify-center px-6 md:px-8">
//                   <div className="flex flex-col items-start space-y-2 tracking-normal">
//                     {/* {navItems.map((item) =>
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
//                     )} */}

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
//                       ) : item.isModal ? (
//                         <button
//                           key={item.path}
//                           onClick={() => {
//                             setMenuOpen(false);
//                             if (onContactClick) {
//                               onContactClick();
//                             }
//                           }}
//                           className={`text-[32px] md:text-[40px] font-extrabold leading-[1.05] text-left tracking-normal transition-colors duration-300 ${
//                             location.pathname === item.path
//                               ? "text-evolve-pink"
//                               : "text-black hover:text-evolve-pink"
//                           }`}
//                         >
//                           {item.label}
//                         </button>
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

//               {/* JOIN US BUTTON (full menu) */}
//               <div className="w-full flex justify-center mb-5 md:mb-6">
//                 <a
//                   href="https://discord.gg/wKRYG7cSWt"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="cursor-pointer "
//                 >
//                   <img
//                     src={join_us_button}
//                     onMouseEnter={(e) =>
//                       (e.currentTarget.src = join_us_button_hover)
//                     }
//                     onMouseLeave={(e) => (e.currentTarget.src = join_us_button)}
//                     alt="join evolve community"
//                     className="w-auto h-12 md:h-16"
//                   />
//                 </a>
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

// import { useState, useEffect, useRef } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import gsap from "gsap";

// import {
//   evolve_logo_nav as evolve_logo,
//   evolve_logo_mobile,
//   three_wavy_lines,
//   marquee_vector_1,
//   evolve_text,
//   marquee_vector_2,
//   cross_line_pink
// } from "../assets/images/Nav";

// import { join_us_button, join_us_button_hover } from "../assets/images/Home";
// import { useAuth } from "../hooks/useAuth";
// import { handleSignIn } from "../auth/signInLogic";
// import { supabase } from "../supabaseClient";

// const MIXED_BL = 16;
// const MIXED_BR = 16;

// const Navigation = ({ onContactClick, showNavbar = true, onLogoClick }) => {
//   const [menuOpen, setMenuOpen] = useState(false);

//   // ✅ account modal state
//   const [accountOpen, setAccountOpen] = useState(false);
//   const accountRef = useRef(null);

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

//   const { user, setUser, authLoading, setAuthLoading } = useAuth();

//   const navItems = [
//     { path: "/", label: "home" },
//     { path: "/community", label: "community" },
//     { path: "/webinars", label: "webinars" },
//     { path: "/college-activation", label: "offline activity" },
//     { path: "/contact", label: "contact us", isModal: true },
//     {
//       path: "https://tally.so/r/ob6WVV?formEventsForwarding=1",
//       label: "rate this website",
//       external: true
//     }
//   ];

//   const isActive = (p) => {
//     if (p === "/" && location.pathname === "/") return true;
//     if (p !== "/" && location.pathname === p) return true;
//     return false;
//   };

//   const isDesktop = () => window.matchMedia("(min-width: 768px)").matches;

//   const handleLogoClick = () => {
//     if (location.pathname !== "/") {
//       navigate("/");
//     }
//     if (onLogoClick) {
//       onLogoClick();
//     }
//   };

//   // ✅ logout
//   const handleLogout = async () => {
//     try {
//       setAuthLoading(true);
//       setAccountOpen(false);

//       await supabase.auth.signOut();

//       setUser(null);

//       // ✅ redirect after logout
//       navigate("/college-activation");
//     } catch (err) {
//       console.log("logout error:", err.message);
//     } finally {
//       setAuthLoading(false);
//     }
//   };

//   // ✅ close account modal on outside click + esc
//   useEffect(() => {
//     if (!accountOpen) return;

//     const handleOutside = (e) => {
//       if (!accountRef.current) return;
//       if (!accountRef.current.contains(e.target)) setAccountOpen(false);
//     };

//     const handleEsc = (e) => {
//       if (e.key === "Escape") setAccountOpen(false);
//     };

//     document.addEventListener("mousedown", handleOutside);
//     window.addEventListener("keydown", handleEsc);

//     return () => {
//       document.removeEventListener("mousedown", handleOutside);
//       window.removeEventListener("keydown", handleEsc);
//     };
//   }, [accountOpen]);

//   // ✅ measure navbar height → push menu content below it
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

//   // Navbar slide-in animation on mount
//   const hasAnimatedRef = useRef(false);

//   // navbar slide in / out based on showNavbar
//   useEffect(() => {
//     if (!outerRef.current) return;
//     const el = outerRef.current;

//     // first render: no animation
//     if (!hasAnimatedRef.current) {
//       gsap.set(el, { y: showNavbar ? 0 : -100 });
//       el.style.pointerEvents = showNavbar ? "auto" : "none";
//       hasAnimatedRef.current = true;
//       return;
//     }

//     // animate
//     if (showNavbar) {
//       gsap.to(el, {
//         y: 0,
//         duration: 0.6,
//         ease: "power3.out",
//         onStart: () => {
//           el.style.pointerEvents = "auto";
//         }
//       });
//     } else {
//       gsap.to(el, {
//         y: -100,
//         duration: 0.4,
//         ease: "power2.in",
//         onComplete: () => {
//           el.style.pointerEvents = "none";
//         }
//       });
//     }
//   }, [showNavbar]);

//   // open/close animations - FIXED + prevent scroll
//   useEffect(() => {
//     const underlay = menuUnderlayRef.current;
//     const panel = menuPanelRef.current;
//     if (!underlay || !panel) return;

//     if (menuOpen) {
//       document.body.style.overflow = "hidden";

//       if (isDesktop()) {
//         gsap.set(underlay, { display: "block", opacity: 0 });
//         gsap.set(panel, { xPercent: -100 });
//         gsap.to(underlay, { opacity: 1, duration: 0.55, ease: "power3.out" });
//         gsap.to(panel, { xPercent: 0, duration: 0.55, ease: "power3.out" });
//       } else {
//         gsap.set(underlay, { display: "block", yPercent: -100 });
//         gsap.to(underlay, { yPercent: 0, duration: 0.55, ease: "power3.out" });
//       }
//     } else {
//       document.body.style.overflow = "";

//       if (isDesktop()) {
//         gsap.to(panel, { xPercent: -100, duration: 0.45, ease: "power2.in" });
//         gsap.to(underlay, {
//           opacity: 0,
//           duration: 0.45,
//           ease: "power2.in",
//           onComplete: () => gsap.set(underlay, { display: "none" })
//         });
//       } else {
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
//   useEffect(() => {
//     setMenuOpen(false);
//     setAccountOpen(false);
//   }, [location.pathname]);

//   // esc to close menu overlay too
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
//       {/* ✅ NAVBAR */}
//       <nav className="fixed top-0 left-0 right-0 z-50">
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
//             // className="w-full overflow-visible"
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
//               {/* MENU */}
//               <button
//                 className="cursor-pointer transition-transform duration-300 hover:scale-105 flex-shrink-0"
//                 onClick={() => {
//                   setMenuOpen((v) => !v);
//                   setAccountOpen(false);
//                 }}
//                 aria-label="open menu"
//                 style={{ width: "72px" }}
//               >
//                 <img
//                   src={menuOpen ? cross_line_pink : three_wavy_lines}
//                   alt="menu"
//                   className="h-5 w-auto md:h-6"
//                 />
//               </button>

//               {/* LOGO */}
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

//               {/* ✅ RIGHT USER AREA */}
//               <div className="relative" ref={accountRef}>
//                 <button
//                   disabled={authLoading}
//                   onClick={() => {
//                     // ✅ full account → open modal
//                     if (user && !user.is_guest) {
//                       setMenuOpen(false);
//                       setAccountOpen((p) => !p);
//                       return;
//                     }

//                     // ✅ guest / not logged in → existing sign in flow
//                     handleSignIn(setUser, setAuthLoading);
//                   }}
//                   className="text-black font-extrabold text-[16px] md:text-[20px] flex items-center gap-2"
//                 >
//                   {authLoading ? (
//                     <>
//                       <span className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" />
//                       <span>signing in…</span>
//                     </>
//                   ) : user ? (
//                     <>
//                       <img
//                         src={user.avatar_url}
//                         className="h-6 w-6 rounded-full"
//                         alt="avatar"
//                       />
//                       <span>{user.username}</span>
//                     </>
//                   ) : (
//                     "sign in"
//                   )}
//                 </button>

//                 {/* ✅ DESKTOP ACCOUNT DROPDOWN */}
//                 {user && !user.is_guest && accountOpen && (
//                   // <div
//                   //   className="
//                   //     hidden md:block
//                   //     absolute right-0 top-[calc(100%+12px)]
//                   //     w-[340px]
//                   //     rounded-[20px]
//                   //     border-[2px] border-black
//                   //     bg-evolve-yellow
//                   //     shadow-[8px_8px_0px_rgba(0,0,0,0.25)]
//                   //     p-6
//                   //     z-[999]
//                   //   "
//                   // >
//                   <div
//                     className="
//     hidden md:block
//     absolute right-0 top-[calc(100%+10px)]
//     w-[340px]
//     rounded-[20px]
//     border-[2px] border-black
//     bg-evolve-yellow
//     shadow-[8px_8px_0px_rgba(0,0,0,0.25)]
//     p-6
//     z-[9999]
//   "
//                   >
//                     <button
//                       onClick={() => setAccountOpen(false)}
//                       className="absolute top-4 right-4 text-black text-[26px] font-extrabold"
//                       aria-label="close account"
//                     >
//                       ✕
//                     </button>

//                     <div className="flex flex-col items-center text-center">
//                       <img
//                         src={user.avatar_url}
//                         alt="avatar"
//                         className="w-16 h-16 rounded-full mb-4"
//                       />

//                       <p className="text-black font-extrabold text-[22px] tracking-[-0.04em]">
//                         {user.username}
//                       </p>

//                       <p className="text-black/80 font-normal text-[16px] mt-1">
//                         {user.email}
//                       </p>

//                       <button
//                         onClick={handleLogout}
//                         className="mt-5 text-black font-extrabold underline flex items-center gap-2"
//                       >
//                         log out
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* ✅ MOBILE ACCOUNT MODAL */}
//       {user && !user.is_guest && accountOpen && (
//         <div className="md:hidden fixed inset-0 z-[999] flex items-center justify-center">
//           {/* overlay */}
//           <button
//             className="absolute inset-0 bg-black/40"
//             onClick={() => setAccountOpen(false)}
//             aria-label="close overlay"
//           />

//           {/* modal */}
//           <div
//             className="
//               relative w-[88%] max-w-[360px]
//               rounded-[20px]
//               border-[2px] border-black
//               bg-evolve-yellow
//               shadow-[8px_8px_0px_rgba(0,0,0,0.25)]
//               p-6
//             "
//           >
//             <button
//               onClick={() => setAccountOpen(false)}
//               className="absolute top-4 right-4 text-black text-[28px] font-extrabold"
//               aria-label="close"
//             >
//               ✕
//             </button>

//             <div className="flex flex-col items-center text-center">
//               <img
//                 src={user.avatar_url}
//                 alt="avatar"
//                 className="w-20 h-20 rounded-full mb-4"
//               />

//               <p className="text-black font-extrabold text-[22px] tracking-[-0.04em]">
//                 {user.username}
//               </p>

//               <p className="text-black/80 font-normal text-[16px] mt-1">
//                 {user.email}
//               </p>

//               <button
//                 onClick={handleLogout}
//                 className="mt-5 text-black font-extrabold underline flex items-center gap-2"
//               >
//                 log out
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ✅ UNDERLAY MENU */}
//       <div
//         ref={menuUnderlayRef}
//         className="fixed top-0 left-0 w-full h-[80vh] md:h-screen z-40 hidden"
//         style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.25)" }}
//       >
//         <div className="relative h-full w-full flex">
//           {/* DESKTOP OVERLAY */}
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
//               {/* NAV LINKS */}
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
//                       ) : item.isModal ? (
//                         <button
//                           key={item.path}
//                           onClick={() => {
//                             setMenuOpen(false);
//                             if (onContactClick) onContactClick();
//                           }}
//                           className={`text-[32px] md:text-[40px] font-extrabold leading-[1.05] text-left tracking-normal transition-colors duration-300 ${
//                             location.pathname === item.path
//                               ? "text-evolve-pink"
//                               : "text-black hover:text-evolve-pink"
//                           }`}
//                         >
//                           {item.label}
//                         </button>
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

//               {/* JOIN US BUTTON */}
//               <div className="w-full flex justify-center mb-5 md:mb-6">
//                 <a
//                   href="https://discord.gg/wKRYG7cSWt"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="cursor-pointer "
//                 >
//                   <img
//                     src={join_us_button}
//                     onMouseEnter={(e) =>
//                       (e.currentTarget.src = join_us_button_hover)
//                     }
//                     onMouseLeave={(e) => (e.currentTarget.src = join_us_button)}
//                     alt="join evolve community"
//                     className="w-auto h-12 md:h-16"
//                   />
//                 </a>
//               </div>

//               {/* MARQUEE */}
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

//           {/* RIGHT CLICK-TO-CLOSE AREA */}
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

// import { useState, useEffect, useRef, useMemo } from "react";
// import ReactDOM from "react-dom";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import gsap from "gsap";

// import {
//   evolve_logo_nav as evolve_logo,
//   evolve_logo_mobile,
//   three_wavy_lines,
//   marquee_vector_1,
//   evolve_text,
//   marquee_vector_2,
//   cross_line_pink,
//   evolve_be_remarkable
// } from "../assets/images/Nav";

// import { join_us_button, join_us_button_hover } from "../assets/images/Home";
// import { useAuth } from "../hooks/useAuth";
// import { handleSignIn } from "../auth/signInLogic";
// import { supabase } from "../supabaseClient";

// const MIXED_BL = 16;
// const MIXED_BR = 16;

// const Navigation = ({ onContactClick, showNavbar = true, onLogoClick }) => {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [accountOpen, setAccountOpen] = useState(false);

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

//   const { user, setUser, authLoading, setAuthLoading } = useAuth();
//   const avatarSrc =
//     user?.avatar_url ||
//     `https://api.dicebear.com/7.x/thumbs/svg?seed=${user?.id || "user"}`;

//   const fullName = user?.username || "";

//   const firstName = useMemo(() => {
//     if (!fullName) return "";
//     return fullName.trim().split(" ")[0]; // ✅ first word only
//   }, [fullName]);

//   // const avatarSrc =
//   // user?.avatar_url || `https://api.multiavatar.com/${user?.id || "user"}.png`;
//   // user?.avatar_url || `https://robohash.org/${user?.id || "user"}?set=set3`;

//   // ✅ account dropdown anchor (desktop)
//   const accountBtnRef = useRef(null);
//   const [accountPos, setAccountPos] = useState({ top: 0, left: 0 });

//   const navItems = [
//     { path: "/", label: "home" },
//     { path: "/community", label: "community" },
//     { path: "/webinars", label: "webinars" },
//     { path: "/evolve-in-person", label: "evolve in-person" },
//     { path: "/contact", label: "contact us", isModal: true },
//     {
//       path: "https://tally.so/r/ob6WVV?formEventsForwarding=1",
//       label: "rate this website",
//       external: true
//     }
//   ];

//   const isActive = (p) => {
//     if (p === "/" && location.pathname === "/") return true;
//     if (p !== "/" && location.pathname === p) return true;
//     return false;
//   };

//   const hideAuthButton = ["/evolve-in-person", "/evolve-in-person/"].includes(
//     location.pathname
//   );
//   // const hideAuthButton = location.pathname === "/evolve-in-person/";

//   const isDesktop = () => window.matchMedia("(min-width: 768px)").matches;

//   const isCollegeProtectedRoute = (pathname) => {
//     return (
//       pathname === "/evolve-in-person/activities" ||
//       pathname === "/evolve-in-person/self-reflection" ||
//       pathname === "/evolve-in-person/reality-check"
//     );
//   };

//   const handleLogoClick = () => {
//     if (location.pathname !== "/") {
//       navigate("/");
//     }
//     if (onLogoClick) onLogoClick();
//   };

//   // ✅ open desktop account modal (calculate position)
//   // const openAccountModal = () => {
//   //   if (!accountBtnRef.current) return;

//   //   const rect = accountBtnRef.current.getBoundingClientRect();

//   //   setAccountPos({
//   //     top: rect.bottom + 10 + window.scrollY,
//   //     left: rect.right - 340 + window.scrollX
//   //   });

//   //   setAccountOpen(true);
//   // };
//   const openAccountModal = () => {
//     if (!accountBtnRef.current) return;

//     const rect = accountBtnRef.current.getBoundingClientRect();

//     const modalWidth = 315;
//     const gap = 10;

//     let left = rect.right - modalWidth;
//     if (left < gap) left = gap; // ✅ keep inside screen
//     if (left + modalWidth > window.innerWidth - gap) {
//       left = window.innerWidth - modalWidth - gap;
//     }

//     setAccountPos({
//       top: rect.bottom + gap,
//       left
//     });

//     setAccountOpen(true);
//   };

//   const handleLogout = async () => {
//     try {
//       setAuthLoading(true);
//       setAccountOpen(false);

//       await supabase.auth.signOut();
//       setUser(null);

//       // ✅ redirect only for specific college routes
//       if (isCollegeProtectedRoute(location.pathname)) {
//         navigate("/evolve-in-person");
//       }
//     } catch (err) {
//       console.log("logout error:", err.message);
//     } finally {
//       setAuthLoading(false);
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

//   // navbar slide in / out based on showNavbar
//   const hasAnimatedRef = useRef(false);

//   useEffect(() => {
//     if (!outerRef.current) return;
//     const el = outerRef.current;

//     if (!hasAnimatedRef.current) {
//       gsap.set(el, { y: showNavbar ? 0 : -100 });
//       el.style.pointerEvents = showNavbar ? "auto" : "none";
//       hasAnimatedRef.current = true;
//       return;
//     }

//     if (showNavbar) {
//       gsap.to(el, {
//         y: 0,
//         duration: 0.6,
//         ease: "power3.out",
//         onStart: () => {
//           el.style.pointerEvents = "auto";
//         }
//       });
//     } else {
//       gsap.to(el, {
//         y: -100,
//         duration: 0.4,
//         ease: "power2.in",
//         onComplete: () => {
//           el.style.pointerEvents = "none";
//         }
//       });
//     }
//   }, [showNavbar]);

//   // open/close animations - prevent scroll
//   useEffect(() => {
//     const underlay = menuUnderlayRef.current;
//     const panel = menuPanelRef.current;
//     if (!underlay || !panel) return;

//     if (menuOpen) {
//       document.body.style.overflow = "hidden";

//       if (isDesktop()) {
//         gsap.set(underlay, { display: "block", opacity: 0 });
//         gsap.set(panel, { xPercent: -100 });
//         gsap.to(underlay, { opacity: 1, duration: 0.55, ease: "power3.out" });
//         gsap.to(panel, { xPercent: 0, duration: 0.55, ease: "power3.out" });
//       } else {
//         gsap.set(underlay, { display: "block", yPercent: -100 });
//         gsap.to(underlay, { yPercent: 0, duration: 0.55, ease: "power3.out" });
//       }
//     } else {
//       document.body.style.overflow = "";

//       if (isDesktop()) {
//         gsap.to(panel, { xPercent: -100, duration: 0.45, ease: "power2.in" });
//         gsap.to(underlay, {
//           opacity: 0,
//           duration: 0.45,
//           ease: "power2.in",
//           onComplete: () => gsap.set(underlay, { display: "none" })
//         });
//       } else {
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
//   useEffect(() => {
//     setMenuOpen(false);
//     setAccountOpen(false);
//   }, [location.pathname]);

//   // esc to close menu + account
//   useEffect(() => {
//     const onKey = (e) => {
//       if (e.key === "Escape") {
//         setMenuOpen(false);
//         setAccountOpen(false);
//       }
//     };
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
//       <nav className="fixed top-0 left-0 right-0 z-50">
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
//                   inset 6px 6px 0 rgba(0, 0, 0, 0.15),
//                   inset 6px 6px 0 rgba(0, 0, 0, 0.15)
//                 `
//               }}
//             >
//               {/* MENU BUTTON */}
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

//               {/* LOGO */}
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

//               {/* AUTH BUTTON / ACCOUNT */}
//               {/* AUTH BUTTON / ACCOUNT */}
//               {!hideAuthButton && (
//                 <button
//                   ref={accountBtnRef}
//                   disabled={authLoading}
//                   onClick={() => {
//                     // not logged in → guest signin
//                     if (!user) return handleSignIn(setUser, setAuthLoading);

//                     // guest user → ignore for now
//                     if (user?.is_guest) return;

//                     // full user → open modal
//                     if (!accountOpen) openAccountModal();
//                     else setAccountOpen(false);
//                   }}
//                   className="text-black font-extrabold text-[16px] md:text-[20px] flex items-center gap-2"
//                 >
//                   {authLoading ? (
//                     <>
//                       <span className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" />
//                       <span>loading…</span>
//                     </>
//                   ) : user ? (
//                     <>
//                       <img
//                         src={avatarSrc}
//                         alt="avatar"
//                         className="h-10 w-10 rounded-full"
//                       />
//                       <span className="hidden md:inline">{fullName}</span>
//                       {/* <span className="md:hidden">{firstName}</span> */}
//                     </>
//                   ) : (
//                     "sign in"
//                   )}
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* ✅ DESKTOP ACCOUNT MODAL (Portal, no overflow issues) */}
//       {accountOpen &&
//         user &&
//         !user.is_guest &&
//         ReactDOM.createPortal(
//           <>
//             {/* click outside */}
//             <div
//               className="hidden md:block fixed inset-0 z-[9998]"
//               onClick={() => setAccountOpen(false)}
//             />

//             <div
//               className="
//                 hidden md:block
//                 fixed z-[9999]
//                 w-[340px]
//                 rounded-[20px]
//                 border-[2px] border-black
//                 bg-evolve-yellow
//                 shadow-[8px_8px_0px_rgba(0,0,0,0.25)]
//                 pl-6 pr-6 pt-0 pb-6
//               "
//               style={{
//                 top: accountPos.top,
//                 left: accountPos.left
//               }}
//             >
//               <div className="flex justify-end">
//                 <button
//                   onClick={() => setAccountOpen(false)}
//                   className="text-black text-[28px] font-extrabold mt-2"
//                 >
//                   ×
//                 </button>
//               </div>

//               <div className="flex flex-col items-center text-center">
//                 <img
//                   // src={user.avatar_url}
//                   src={avatarSrc}
//                   alt="avatar"
//                   className="w-[5.5rem] h-[5.5rem] rounded-full"
//                 />

//                 <p className="text-black font-extrabold text-[20px] mt-4">
//                   {user.username}
//                 </p>

//                 <p className="text-black font-normal text-[14px] mt-1">
//                   {user.email}
//                 </p>

//                 <button
//                   onClick={handleLogout}
//                   className="mt-5 text-black font-extrabold underline flex items-center gap-2"
//                 >
//                   log out
//                 </button>
//               </div>
//             </div>
//           </>,
//           document.body
//         )}

//       {/* ✅ MOBILE ACCOUNT MODAL */}
//       {accountOpen && user && !user.is_guest && (
//         <div className="md:hidden fixed inset-0 z-[9999] flex items-center justify-center">
//           <div
//             className="absolute inset-0 bg-black/40"
//             onClick={() => setAccountOpen(false)}
//           />

//           <div
//             className="
//               relative z-10
//               w-[85vw] max-w-[360px]
//               bg-evolve-yellow
//               border-[2px] border-black
//               rounded-[18px]
//               shadow-[8px_8px_0px_rgba(0,0,0,0.25)]
//               px-6 py-8
//               flex flex-col items-center text-center
//             "
//           >
//             <button
//               onClick={() => setAccountOpen(false)}
//               className="absolute top-4 right-4 text-black text-[26px] font-extrabold"
//             >
//               ×
//             </button>

//             <img
//               // src={user.avatar_url}
//               src={avatarSrc}
//               alt="avatar"
//               className="w-16 h-16 rounded-full"
//             />

//             <p className="text-black font-extrabold text-[18px] mt-4">
//               {user.username}
//             </p>

//             <p className="text-black font-normal text-[14px] mt-1">
//               {user.email}
//             </p>

//             <button
//               onClick={handleLogout}
//               className="mt-5 text-black font-extrabold underline"
//             >
//               log out
//             </button>
//           </div>
//         </div>
//       )}

//       {/* UNDERLAY (MENU) */}
//       <div
//         ref={menuUnderlayRef}
//         className="fixed top-0 left-0 w-full h-[80vh] md:h-screen z-40 hidden"
//         style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.25)" }}
//       >
//         <div className="relative h-full w-full flex">
//           {/* DESKTOP OVERLAY */}
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
//                       ) : item.isModal ? (
//                         <button
//                           key={item.path}
//                           onClick={() => {
//                             setMenuOpen(false);
//                             if (onContactClick) onContactClick();
//                           }}
//                           className={`text-[32px] md:text-[40px] font-extrabold leading-[1.05] text-left tracking-normal transition-colors duration-300 ${
//                             location.pathname === item.path
//                               ? "text-evolve-pink"
//                               : "text-black hover:text-evolve-pink"
//                           }`}
//                         >
//                           {item.label}
//                         </button>
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

//               {/* JOIN US BUTTON */}
//               <div className="w-full flex justify-center mb-5 md:mb-6">
//                 <a
//                   href="https://discord.gg/wKRYG7cSWt"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="cursor-pointer "
//                 >
//                   <img
//                     src={join_us_button}
//                     onMouseEnter={(e) =>
//                       (e.currentTarget.src = join_us_button_hover)
//                     }
//                     onMouseLeave={(e) => (e.currentTarget.src = join_us_button)}
//                     alt="join evolve community"
//                     className="w-auto h-12 md:h-16"
//                   />
//                 </a>
//               </div>

//               {/* MARQUEE */}
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
//                       src={evolve_be_remarkable}
//                       alt="vector 2"
//                       className="h-8 md:h-10 w-auto flex-none"
//                     />
//                     <img
//                       src={marquee_vector_1}
//                       alt="vector 2"
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
//                       src={evolve_be_remarkable}
//                       alt="vector 2"
//                       className="h-8 md:h-10 w-auto flex-none"
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* RIGHT CLICK-TO-CLOSE (desktop) */}
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

// import { useState, useEffect, useRef, useMemo } from "react";
// import ReactDOM from "react-dom";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import gsap from "gsap";

// import {
//   evolve_logo_nav as evolve_logo,
//   evolve_logo_mobile,
//   three_wavy_lines,
//   marquee_vector_1,
//   evolve_text,
//   marquee_vector_2,
//   cross_line_pink,
//   evolve_be_remarkable
// } from "../assets/images/Nav";

// import { join_us_button, join_us_button_hover } from "../assets/images/Home";
// import { useAuth } from "../hooks/useAuth";
// import { handleSignIn } from "../auth/signInLogic";
// import { supabase } from "../supabaseClient";

// const MIXED_BL = 16;
// const MIXED_BR = 16;

// const Navigation = ({ onContactClick, showNavbar = true, onLogoClick }) => {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [accountOpen, setAccountOpen] = useState(false);

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

//   const { user, setUser, authLoading, setAuthLoading } = useAuth();
//   const avatarSrc =
//     user?.avatar_url ||
//     `https://api.dicebear.com/7.x/thumbs/svg?seed=${user?.id || "user"}`;

//   const fullName = user?.username || "";

//   const firstName = useMemo(() => {
//     if (!fullName) return "";
//     return fullName.trim().split(" ")[0]; // ✅ first word only
//   }, [fullName]);

//   // const avatarSrc =
//   // user?.avatar_url || `https://api.multiavatar.com/${user?.id || "user"}.png`;
//   // user?.avatar_url || `https://robohash.org/${user?.id || "user"}?set=set3`;

//   // ✅ account dropdown anchor (desktop)
//   const accountBtnRef = useRef(null);
//   const [accountPos, setAccountPos] = useState({ top: 0, left: 0 });

//   const navItems = [
//     { path: "/", label: "home" },
//     { path: "/community", label: "community" },
//     { path: "/webinars", label: "webinars" },
//     { path: "/evolve-in-person", label: "evolve in-person" },
//     { path: "/contact", label: "contact us", isModal: true },
//     {
//       path: "https://tally.so/r/ob6WVV?formEventsForwarding=1",
//       label: "rate this website",
//       external: true
//     }
//   ];

//   const isActive = (p) => {
//     if (p === "/" && location.pathname === "/") return true;
//     if (p !== "/" && location.pathname === p) return true;
//     return false;
//   };

//   const hideAuthButton = ["/evolve-in-person", "/evolve-in-person/"].includes(
//     location.pathname
//   );
//   // const hideAuthButton = location.pathname === "/evolve-in-person/";

//   const isDesktop = () => window.matchMedia("(min-width: 768px)").matches;

//   const isCollegeProtectedRoute = (pathname) => {
//     return (
//       pathname === "/evolve-in-person/activities" ||
//       pathname === "/evolve-in-person/self-reflection" ||
//       pathname === "/evolve-in-person/reality-check"
//     );
//   };

//   // ========== FIXED LOGO CLICK HANDLER ==========
//   const handleLogoClick = () => {
//     const isOnHomePage =
//       location.pathname === "/" || location.pathname === "/home";

//     console.log("=== NAVBAR LOGO CLICKED ===");
//     console.log("Current path:", location.pathname);
//     console.log("Is on home page:", isOnHomePage);
//     console.log(
//       "window.handleLogoClick exists:",
//       typeof window.handleLogoClick === "function"
//     );
//     console.log("window.isOnHomePage:", window.isOnHomePage);

//     // If we're on home page and the scroll handler exists, use it
//     if (isOnHomePage && typeof window.handleLogoClick === "function") {
//       console.log("Calling window.handleLogoClick() to scroll to first scene");
//       window.handleLogoClick();
//       return; // Important: don't navigate
//     }

//     // Otherwise navigate to home
//     console.log("Navigating to home page");
//     navigate("/");

//     // Call the prop callback if provided
//     if (onLogoClick) onLogoClick();
//   };

//   // ✅ open desktop account modal (calculate position)
//   // const openAccountModal = () => {
//   //   if (!accountBtnRef.current) return;

//   //   const rect = accountBtnRef.current.getBoundingClientRect();

//   //   setAccountPos({
//   //     top: rect.bottom + 10 + window.scrollY,
//   //     left: rect.right - 340 + window.scrollX
//   //   });

//   //   setAccountOpen(true);
//   // };
//   const openAccountModal = () => {
//     if (!accountBtnRef.current) return;

//     const rect = accountBtnRef.current.getBoundingClientRect();

//     const modalWidth = 315;
//     const gap = 10;

//     let left = rect.right - modalWidth;
//     if (left < gap) left = gap; // ✅ keep inside screen
//     if (left + modalWidth > window.innerWidth - gap) {
//       left = window.innerWidth - modalWidth - gap;
//     }

//     setAccountPos({
//       top: rect.bottom + gap,
//       left
//     });

//     setAccountOpen(true);
//   };

//   const handleLogout = async () => {
//     try {
//       setAuthLoading(true);
//       setAccountOpen(false);

//       await supabase.auth.signOut();
//       setUser(null);

//       // ✅ redirect only for specific college routes
//       if (isCollegeProtectedRoute(location.pathname)) {
//         navigate("/evolve-in-person");
//       }
//     } catch (err) {
//       console.log("logout error:", err.message);
//     } finally {
//       setAuthLoading(false);
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

//   // navbar slide in / out based on showNavbar
//   const hasAnimatedRef = useRef(false);

//   useEffect(() => {
//     if (!outerRef.current) return;
//     const el = outerRef.current;

//     if (!hasAnimatedRef.current) {
//       gsap.set(el, { y: showNavbar ? 0 : -100 });
//       el.style.pointerEvents = showNavbar ? "auto" : "none";
//       hasAnimatedRef.current = true;
//       return;
//     }

//     if (showNavbar) {
//       gsap.to(el, {
//         y: 0,
//         duration: 0.6,
//         ease: "power3.out",
//         onStart: () => {
//           el.style.pointerEvents = "auto";
//         }
//       });
//     } else {
//       gsap.to(el, {
//         y: -100,
//         duration: 0.4,
//         ease: "power2.in",
//         onComplete: () => {
//           el.style.pointerEvents = "none";
//         }
//       });
//     }
//   }, [showNavbar]);

//   // open/close animations - prevent scroll
//   useEffect(() => {
//     const underlay = menuUnderlayRef.current;
//     const panel = menuPanelRef.current;
//     if (!underlay || !panel) return;

//     if (menuOpen) {
//       document.body.style.overflow = "hidden";

//       if (isDesktop()) {
//         gsap.set(underlay, { display: "block", opacity: 0 });
//         gsap.set(panel, { xPercent: -100 });
//         gsap.to(underlay, { opacity: 1, duration: 0.55, ease: "power3.out" });
//         gsap.to(panel, { xPercent: 0, duration: 0.55, ease: "power3.out" });
//       } else {
//         gsap.set(underlay, { display: "block", yPercent: -100 });
//         gsap.to(underlay, { yPercent: 0, duration: 0.55, ease: "power3.out" });
//       }
//     } else {
//       document.body.style.overflow = "";

//       if (isDesktop()) {
//         gsap.to(panel, { xPercent: -100, duration: 0.45, ease: "power2.in" });
//         gsap.to(underlay, {
//           opacity: 0,
//           duration: 0.45,
//           ease: "power2.in",
//           onComplete: () => gsap.set(underlay, { display: "none" })
//         });
//       } else {
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
//   useEffect(() => {
//     setMenuOpen(false);
//     setAccountOpen(false);
//   }, [location.pathname]);

//   // esc to close menu + account
//   useEffect(() => {
//     const onKey = (e) => {
//       if (e.key === "Escape") {
//         setMenuOpen(false);
//         setAccountOpen(false);
//       }
//     };
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
//       <nav className="fixed top-0 left-0 right-0 z-50">
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
//                   inset 6px 6px 0 rgba(0, 0, 0, 0.15),
//                   inset 6px 6px 0 rgba(0, 0, 0, 0.15)
//                 `
//               }}
//             >
//               {/* MENU BUTTON */}
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

//               {/* LOGO */}
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

//               {/* AUTH BUTTON / ACCOUNT */}
//               {/* AUTH BUTTON / ACCOUNT */}
//               {!hideAuthButton && (
//                 <button
//                   ref={accountBtnRef}
//                   disabled={authLoading}
//                   onClick={() => {
//                     // not logged in → guest signin
//                     if (!user) return handleSignIn(setUser, setAuthLoading);

//                     // guest user → ignore for now
//                     if (user?.is_guest) return;

//                     // full user → open modal
//                     if (!accountOpen) openAccountModal();
//                     else setAccountOpen(false);
//                   }}
//                   className="text-black font-extrabold text-[16px] md:text-[20px] flex items-center gap-2"
//                 >
//                   {authLoading ? (
//                     <>
//                       <span className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" />
//                       <span>loading…</span>
//                     </>
//                   ) : user ? (
//                     <>
//                       <img
//                         src={avatarSrc}
//                         alt="avatar"
//                         className="h-10 w-10 rounded-full"
//                       />
//                       <span className="hidden md:inline">{fullName}</span>
//                       {/* <span className="md:hidden">{firstName}</span> */}
//                     </>
//                   ) : (
//                     "sign in"
//                   )}
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* ✅ DESKTOP ACCOUNT MODAL (Portal, no overflow issues) */}
//       {accountOpen &&
//         user &&
//         !user.is_guest &&
//         ReactDOM.createPortal(
//           <>
//             {/* click outside */}
//             <div
//               className="hidden md:block fixed inset-0 z-[9998]"
//               onClick={() => setAccountOpen(false)}
//             />

//             <div
//               className="
//                 hidden md:block
//                 fixed z-[9999]
//                 w-[340px]
//                 rounded-[20px]
//                 border-[2px] border-black
//                 bg-evolve-yellow
//                 shadow-[8px_8px_0px_rgba(0,0,0,0.25)]
//                 pl-6 pr-6 pt-0 pb-6
//               "
//               style={{
//                 top: accountPos.top,
//                 left: accountPos.left
//               }}
//             >
//               <div className="flex justify-end">
//                 <button
//                   onClick={() => setAccountOpen(false)}
//                   className="text-black text-[28px] font-extrabold mt-2"
//                 >
//                   ×
//                 </button>
//               </div>

//               <div className="flex flex-col items-center text-center">
//                 <img
//                   // src={user.avatar_url}
//                   src={avatarSrc}
//                   alt="avatar"
//                   className="w-[5.5rem] h-[5.5rem] rounded-full"
//                 />

//                 <p className="text-black font-extrabold text-[20px] mt-4">
//                   {user.username}
//                 </p>

//                 <p className="text-black font-normal text-[14px] mt-1">
//                   {user.email}
//                 </p>

//                 <button
//                   onClick={handleLogout}
//                   className="mt-5 text-black font-extrabold underline flex items-center gap-2"
//                 >
//                   log out
//                 </button>
//               </div>
//             </div>
//           </>,
//           document.body
//         )}

//       {/* ✅ MOBILE ACCOUNT MODAL */}
//       {accountOpen && user && !user.is_guest && (
//         <div className="md:hidden fixed inset-0 z-[9999] flex items-center justify-center">
//           <div
//             className="absolute inset-0 bg-black/40"
//             onClick={() => setAccountOpen(false)}
//           />

//           <div
//             className="
//               relative z-10
//               w-[85vw] max-w-[360px]
//               bg-evolve-yellow
//               border-[2px] border-black
//               rounded-[18px]
//               shadow-[8px_8px_0px_rgba(0,0,0,0.25)]
//               px-6 py-8
//               flex flex-col items-center text-center
//             "
//           >
//             <button
//               onClick={() => setAccountOpen(false)}
//               className="absolute top-4 right-4 text-black text-[26px] font-extrabold"
//             >
//               ×
//             </button>

//             <img
//               // src={user.avatar_url}
//               src={avatarSrc}
//               alt="avatar"
//               className="w-16 h-16 rounded-full"
//             />

//             <p className="text-black font-extrabold text-[18px] mt-4">
//               {user.username}
//             </p>

//             <p className="text-black font-normal text-[14px] mt-1">
//               {user.email}
//             </p>

//             <button
//               onClick={handleLogout}
//               className="mt-5 text-black font-extrabold underline"
//             >
//               log out
//             </button>
//           </div>
//         </div>
//       )}

//       {/* UNDERLAY (MENU) */}
//       <div
//         ref={menuUnderlayRef}
//         className="fixed top-0 left-0 w-full h-[80vh] md:h-screen z-40 hidden"
//         style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.25)" }}
//       >
//         <div className="relative h-full w-full flex">
//           {/* DESKTOP OVERLAY */}
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
//                       ) : item.isModal ? (
//                         <button
//                           key={item.path}
//                           onClick={() => {
//                             setMenuOpen(false);
//                             if (onContactClick) onContactClick();
//                           }}
//                           className={`text-[32px] md:text-[40px] font-extrabold leading-[1.05] text-left tracking-normal transition-colors duration-300 ${
//                             location.pathname === item.path
//                               ? "text-evolve-pink"
//                               : "text-black hover:text-evolve-pink"
//                           }`}
//                         >
//                           {item.label}
//                         </button>
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

//               {/* JOIN US BUTTON */}
//               <div className="w-full flex justify-center mb-5 md:mb-6">
//                 <a
//                   href="https://discord.gg/wKRYG7cSWt"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="cursor-pointer "
//                 >
//                   <img
//                     src={join_us_button}
//                     onMouseEnter={(e) =>
//                       (e.currentTarget.src = join_us_button_hover)
//                     }
//                     onMouseLeave={(e) => (e.currentTarget.src = join_us_button)}
//                     alt="join evolve community"
//                     className="w-auto h-12 md:h-16"
//                   />
//                 </a>
//               </div>

//               {/* MARQUEE */}
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
//                       src={evolve_be_remarkable}
//                       alt="vector 2"
//                       className="h-8 md:h-10 w-auto flex-none"
//                     />
//                     <img
//                       src={marquee_vector_1}
//                       alt="vector 2"
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
//                       src={evolve_be_remarkable}
//                       alt="vector 2"
//                       className="h-8 md:h-10 w-auto flex-none"
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* RIGHT CLICK-TO-CLOSE (desktop) */}
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

import { useState, useEffect, useRef, useMemo } from "react";
import ReactDOM from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";

import {
  evolve_logo_nav as evolve_logo,
  evolve_logo_mobile,
  three_wavy_lines,
  marquee_vector_1,
  evolve_text,
  marquee_vector_2,
  cross_line_pink,
  evolve_be_remarkable
} from "../assets/images/Nav";

import { join_us_button, join_us_button_hover } from "../assets/images/Home";
import { useAuth } from "../hooks/useAuth";
// import { handleSignIn } from "../auth/signInLogic"; // old guest sign-in — replaced by AuthModal
import { supabase } from "../supabaseClient";
import AuthModal from "./AuthModal";

const MIXED_BL = 16;
const MIXED_BR = 16;

const Navigation = ({ onContactClick, showNavbar = true, onLogoClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

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

  const { user, setUser, authLoading, setAuthLoading } = useAuth();
  const avatarSrc =
    user?.avatar_url ||
    `https://api.dicebear.com/7.x/thumbs/svg?seed=${user?.id || "user"}`;

  const fullName = user?.name || "";

  const firstName = useMemo(() => {
    if (!fullName) return "";
    return fullName.trim().split(" ")[0]; // ✅ first word only
  }, [fullName]);

  // const avatarSrc =
  // user?.avatar_url || `https://api.multiavatar.com/${user?.id || "user"}.png`;
  // user?.avatar_url || `https://robohash.org/${user?.id || "user"}?set=set3`;

  // ✅ account dropdown anchor (desktop)
  const accountBtnRef = useRef(null);
  const [accountPos, setAccountPos] = useState({ top: 0, left: 0 });

  const navItems = [
    { path: "/", label: "home" },
    { path: "/community", label: "community" },
    { path: "/webinars", label: "webinars" },
    { path: "/evolve-in-person", label: "evolve in-person" },
    { path: "/contact", label: "contact us", isModal: true },
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

  const hideAuthButton = ["/evolve-in-person", "/evolve-in-person/"].includes(
    location.pathname
  );
  // const hideAuthButton = location.pathname === "/evolve-in-person/";

  const isDesktop = () => window.matchMedia("(min-width: 768px)").matches;

  const isCollegeProtectedRoute = (pathname) => {
    return (
      pathname === "/evolve-in-person/activities" ||
      pathname === "/evolve-in-person/self-reflection" ||
      pathname === "/evolve-in-person/reality-check"
    );
  };

  // ========== FIXED LOGO CLICK HANDLER ==========
  const handleLogoClick = () => {
    const isOnHomePage =
      location.pathname === "/" || location.pathname === "/home";

    console.log("=== NAVBAR LOGO CLICKED ===");
    console.log("Current path:", location.pathname);
    console.log("Is on home page:", isOnHomePage);
    console.log(
      "window.handleLogoClick exists:",
      typeof window.handleLogoClick === "function"
    );
    console.log("window.isOnHomePage:", window.isOnHomePage);

    // If we're on home page and the scroll handler exists, use it
    if (isOnHomePage && typeof window.handleLogoClick === "function") {
      console.log("Calling window.handleLogoClick() to scroll to first scene");
      window.handleLogoClick();
      return; // Important: don't navigate
    }

    // Otherwise navigate to home
    console.log("Navigating to home page");
    navigate("/");

    // Call the prop callback if provided
    if (onLogoClick) onLogoClick();
  };

  // ✅ open desktop account modal (calculate position)
  // const openAccountModal = () => {
  //   if (!accountBtnRef.current) return;

  //   const rect = accountBtnRef.current.getBoundingClientRect();

  //   setAccountPos({
  //     top: rect.bottom + 10 + window.scrollY,
  //     left: rect.right - 340 + window.scrollX
  //   });

  //   setAccountOpen(true);
  // };
  const openAccountModal = () => {
    if (!accountBtnRef.current) return;

    const rect = accountBtnRef.current.getBoundingClientRect();

    const modalWidth = 315;
    const gap = 10;

    let left = rect.right - modalWidth;
    if (left < gap) left = gap; // ✅ keep inside screen
    if (left + modalWidth > window.innerWidth - gap) {
      left = window.innerWidth - modalWidth - gap;
    }

    setAccountPos({
      top: rect.bottom + gap,
      left
    });

    setAccountOpen(true);
  };

  const handleLogout = async () => {
    try {
      setAuthLoading(true);
      setAccountOpen(false);

      await supabase.auth.signOut();
      setUser(null);

      // ✅ redirect only for specific college routes
      if (isCollegeProtectedRoute(location.pathname)) {
        navigate("/evolve-in-person");
      }
    } catch (err) {
      console.log("logout error:", err.message);
    } finally {
      setAuthLoading(false);
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

  // navbar slide in / out based on showNavbar
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (!outerRef.current) return;
    const el = outerRef.current;

    if (!hasAnimatedRef.current) {
      gsap.set(el, { y: showNavbar ? 0 : -100 });
      el.style.pointerEvents = showNavbar ? "auto" : "none";
      hasAnimatedRef.current = true;
      return;
    }

    if (showNavbar) {
      gsap.to(el, {
        y: 0,
        duration: 0.6,
        ease: "power3.out",
        onStart: () => {
          el.style.pointerEvents = "auto";
        }
      });
    } else {
      gsap.to(el, {
        y: -100,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => {
          el.style.pointerEvents = "none";
        }
      });
    }
  }, [showNavbar]);

  // open/close animations - prevent scroll
  useEffect(() => {
    const underlay = menuUnderlayRef.current;
    const panel = menuPanelRef.current;
    if (!underlay || !panel) return;

    if (menuOpen) {
      document.body.style.overflow = "hidden";

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
      document.body.style.overflow = "";

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
  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  // esc to close menu + account
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setAccountOpen(false);
      }
    };
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
      <nav className="fixed top-0 left-0 right-0 z-50">
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
              {/* MENU BUTTON */}
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

              {/* LOGO */}
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

              {/* AUTH BUTTON / ACCOUNT */}
              {/* AUTH BUTTON / ACCOUNT */}
              {!hideAuthButton && (
                <button
                  ref={accountBtnRef}
                  disabled={authLoading}
                  onClick={() => {
                    // not logged in → open sign-in modal
                    if (!user) return setAuthModalOpen(true);

                    // logged-in user → open account dropdown
                    if (!accountOpen) openAccountModal();
                    else setAccountOpen(false);
                  }}
                  className="text-black font-extrabold text-[16px] md:text-[20px] flex items-center gap-2"
                >
                  {authLoading ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" />
                      <span>loading…</span>
                    </>
                  ) : user ? (
                    <>
                      <img
                        src={avatarSrc}
                        alt="avatar"
                        className="h-10 w-10 rounded-full"
                      />
                      <span className="hidden md:inline">{fullName}</span>
                      {/* <span className="md:hidden">{firstName}</span> */}
                    </>
                  ) : (
                    "sign in"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ✅ DESKTOP ACCOUNT MODAL (Portal, no overflow issues) */}
      {accountOpen &&
        user &&
        ReactDOM.createPortal(
          <>
            {/* click outside */}
            <div
              className="hidden md:block fixed inset-0 z-[9998]"
              onClick={() => setAccountOpen(false)}
            />

            <div
              className="
                hidden md:block
                fixed z-[9999]
                w-[340px]
                rounded-[20px]
                border-[2px] border-black
                bg-evolve-yellow
                shadow-[8px_8px_0px_rgba(0,0,0,0.25)]
                pl-6 pr-6 pt-0 pb-6
              "
              style={{
                top: accountPos.top,
                left: accountPos.left
              }}
            >
              <div className="flex justify-end">
                <button
                  onClick={() => setAccountOpen(false)}
                  className="text-black text-[28px] font-extrabold mt-2"
                >
                  ×
                </button>
              </div>

              <div className="flex flex-col items-center text-center">
                <img
                  // src={user.avatar_url}
                  src={avatarSrc}
                  alt="avatar"
                  className="w-[5.5rem] h-[5.5rem] rounded-full"
                />

                <p className="text-black font-extrabold text-[20px] mt-4">
                  {user.name}
                </p>

                <p className="text-black font-normal text-[14px] mt-1">
                  {user.email}
                </p>

                <button
                  onClick={handleLogout}
                  className="mt-5 text-black font-extrabold underline flex items-center gap-2"
                >
                  log out
                </button>
              </div>
            </div>
          </>,
          document.body
        )}

      {/* ✅ MOBILE ACCOUNT MODAL */}
      {accountOpen && user && (
        <div className="md:hidden fixed inset-0 z-[9999] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setAccountOpen(false)}
          />

          <div
            className="
              relative z-10
              w-[85vw] max-w-[360px]
              bg-evolve-yellow
              border-[2px] border-black
              rounded-[18px]
              shadow-[8px_8px_0px_rgba(0,0,0,0.25)]
              px-6 py-8
              flex flex-col items-center text-center
            "
          >
            <button
              onClick={() => setAccountOpen(false)}
              className="absolute top-4 right-4 text-black text-[26px] font-extrabold"
            >
              ×
            </button>

            <img
              // src={user.avatar_url}
              src={avatarSrc}
              alt="avatar"
              className="w-16 h-16 rounded-full"
            />

            <p className="text-black font-extrabold text-[18px] mt-4">
              {user.name}
            </p>

            <p className="text-black font-normal text-[14px] mt-1">
              {user.email}
            </p>

            <button
              onClick={handleLogout}
              className="mt-5 text-black font-extrabold underline"
            >
              log out
            </button>
          </div>
        </div>
      )}

      {/* UNDERLAY (MENU) */}
      <div
        ref={menuUnderlayRef}
        className="fixed top-0 left-0 w-full h-[80vh] md:h-screen z-40 hidden"
        style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.25)" }}
      >
        <div className="relative h-full w-full flex">
          {/* DESKTOP OVERLAY */}
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
                      ) : item.isModal ? (
                        <button
                          key={item.path}
                          onClick={() => {
                            setMenuOpen(false);
                            if (onContactClick) onContactClick();
                          }}
                          className={`text-[32px] md:text-[40px] font-extrabold leading-[1.05] text-left tracking-normal transition-colors duration-300 ${
                            location.pathname === item.path
                              ? "text-evolve-pink"
                              : "text-black hover:text-evolve-pink"
                          }`}
                        >
                          {item.label}
                        </button>
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

              {/* JOIN US BUTTON */}
              <div className="w-full flex justify-center mb-5 md:mb-6">
                <a
                  href="https://discord.gg/wKRYG7cSWt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer "
                >
                  <img
                    src={join_us_button}
                    onMouseEnter={(e) =>
                      (e.currentTarget.src = join_us_button_hover)
                    }
                    onMouseLeave={(e) => (e.currentTarget.src = join_us_button)}
                    alt="join evolve community"
                    className="w-auto h-12 md:h-16"
                  />
                </a>
              </div>

              {/* MARQUEE */}
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
                      src={evolve_be_remarkable}
                      alt="vector 2"
                      className="h-8 md:h-10 w-auto flex-none"
                    />
                    <img
                      src={marquee_vector_1}
                      alt="vector 2"
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
                      src={evolve_be_remarkable}
                      alt="vector 2"
                      className="h-8 md:h-10 w-auto flex-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT CLICK-TO-CLOSE (desktop) */}
          <button
            className="hidden md:block flex-1 h-full bg-transparent relative z-10"
            onClick={() => setMenuOpen(false)}
            aria-label="close menu overlay"
          />
        </div>
      </div>

      {/* AUTH MODAL */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        user={user}
      />
    </>
  );
};

export default Navigation;
