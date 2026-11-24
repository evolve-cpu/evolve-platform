// import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
// import SEO from "../components/SEO";
// import gsap from "gsap";
// import ScrollTrigger from "gsap/ScrollTrigger";

// import {
//   barfi_mobile,
//   rays_webinars_mobile,
//   left_elem_mobile,
//   right_elem_mobile,
//   hands_with_stairs_chat_full_mobile,
//   hands_with_webinars_card_full_mobile,
//   barfi,
//   hands_with_stairs_chat,
//   hands_with_stairs_chat_full,
//   left_elem,
//   rays_webinars,
//   right_elem,
//   hands_with_webinars_card_full,
//   visual_design,
//   interaction_design,
//   career_growth,
//   hobbies,
//   watch_playlist_button
// } from "../assets/images/Webinars";

// import { webinars as COPY } from "../content";
// import { renderWithBreaks } from "../utils/renderWithBreaks";
// import { trackWebinarPlaylist, ctaSlug } from "../utils/analytics";

// gsap.registerPlugin(ScrollTrigger);

// // Reusable Card Component
// // const WebinarCard = ({ svg, title, playlistUrl, isExpanded, onToggle }) => {
// const WebinarCard = ({ svg, title, playlistUrl, isExpanded, onToggle }) => {
//   const handleDesktopClick = () => {
//     if (window.innerWidth >= 768) {
//       window.open(playlistUrl, "_blank");
//     }
//   };
//   return (
//     // <div
//     //   className={`
//     //     rounded-[70px] overflow-hidden border-2 border-evolve-yellow
//     //     transition-all duration-500 ease-in-out
//     //     ${isExpanded ? "scale-y-110" : "scale-y-100"}
//     //   `}
//     //   onMouseEnter={() => !("ontouchstart" in window) && onToggle(true)}
//     //   onMouseLeave={() => !("ontouchstart" in window) && onToggle(false)}
//     //   onClick={() => "ontouchstart" in window && onToggle(!isExpanded)}
//     // >
//     <div
//       className={`
//         rounded-[70px] overflow-hidden border-2 border-evolve-yellow
//         transition-all duration-500 ease-in-out
//         ${isExpanded ? "scale-y-110" : "scale-y-100"}
//         cursor-pointer md:cursor-pointer
//       `}
//       onClick={handleDesktopClick}
//       onMouseEnter={() => !("ontouchstart" in window) && onToggle(true)}
//       onMouseLeave={() => !("ontouchstart" in window) && onToggle(false)}
//     >
//       {/* Top section */}
//       <div
//         className="// bg-black h-[60%] min-h-[240px] // relative overflow-hidden // flex justify-center //"
//       >
//         {/* <img
//           src={svg}
//           alt={title}
//           className={`
//       absolute bottom-0
//       w-full
//       object-contain
//       transition-transform duration-500 ease-in-out
//       origin-bottom
//       ${isExpanded ? "scale-y-[0.91]" : "scale-y-100"}
//     `}
//         /> */}
//         {/* <img
//           src={svg}
//           alt={title}
//           className={`
//               absolute bottom-0
//               object-contain
//               transition-transform duration-500 ease-in-out
//               origin-bottom
//               ${svg === hobbies ? "w-[80%]" : ""}
//               ${
//                 svg === interaction_design
//                   ? "w-[200%] -left-2 bottom-[-4rem] scale-x-[1.5] scale-y-[1.5]"
//                   : ""
//               }
//               ${svg === career_growth ? "-bottom-3" : ""}
//               ${svg === visual_design ? "-bottom-[0.4rem]" : ""}

//                   ${
//                     isExpanded && svg === interaction_design
//                       ? "scale-y-[1.39] scale-x-[1.2] bottom-[-2rem]"
//                       : "scale-y-100 scale-x-100"
//                   }
//                   ${
//                     isExpanded && svg !== interaction_design
//                       ? "scale-y-[0.91]"
//                       : "scale-y-100"
//                   }
//           `}
//         />
//          */}
//         <img
//           src={svg}
//           alt={title}
//           className={`
//     absolute bottom-0
//     object-contain
//     transition-transform duration-500 ease-in-out
//     origin-bottom

//     ${svg === hobbies ? "w-[80%]" : ""}
//     ${svg === career_growth ? "-bottom-3" : ""}
//     ${svg === visual_design ? "-bottom-[0.3rem]" : ""}

// ${svg === interaction_design ? "min-w-[150%] bottom-[-4rem]" : ""}

//     ${isExpanded ? "scale-y-[0.91]" : ""}
//     `}
//           // ${
//           //   isExpanded && svg === interaction_design
//           //     ? "scale-y-[1.25] scale-x-[1.25] bottom-[-2rem]"
//           //     : ""
//           // }
//         />
//       </div>

//       {/* Divider */}
//       <div className="h-0.5 bg-evolve-yellow" />
//       {/* Bottom section */}
//       <div
//         className={`
//           bg-evolve-pink h-[40%] min-h-[160px]
//           flex flex-col items-center justify-center
//           transition-all duration-500 ease-in-out
//           ${isExpanded ? "pt-6 pb-8" : "py-0"}
//           /* Tablet only */
//           // md:h-[42%] md:min-h-[110px]
//           lg:h-[40%] lg:min-h-[160px]
//           ${isExpanded ? "md:pt-3 md:pb-5 lg:pt-6 lg:pb-8" : ""}
//         `}
//       >
//         <h3
//           className={`
//             font-extrabold lowercase text-white text-center
//             transition-all duration-500 ease-in-out
//                         text-5xl leading-[40px]
//             md:text-2xl lg:text-4xl
//             ${
//               isExpanded
//                 ? "-translate-y-0 scale-y-90"
//                 : "translate-y-0 scale-y-100"
//             }
//           `}
//           style={{
//             // fontSize: "48px",
//             lineHeight: "40px",
//             letterSpacing: "0"
//           }}
//           dangerouslySetInnerHTML={{ __html: title }}
//         />
//         {/* <h3
//           className="// font-extrabold text-white text-center // transition-all duration-500 ease-in-out // text-5xl leading-[40px] // md:text-2xl lg:text-4xl //"
//           // style={{
//           //   lineHeight: "40px",
//           //   letterSpacing: "0"
//           // }}
//           dangerouslySetInnerHTML={{ __html: title }}
//         /> */}
//         {/* Button */}
//         <a
//           // href={playlistUrl}
//           onClick={() => { trackWebinarPlaylist(title); window.open(playlistUrl, "_blank"); }}
//           target="_blank"
//           rel="noopener noreferrer"
//           className={`
//     mt-6 transition-all duration-500 ease-in-out
//     ${
//       isExpanded
//         ? "opacity-100 translate-y-0"
//         : "opacity-0 -translate-y-4 pointer-events-none"
//     }
//     md:mt-3 lg:mt-6
//   `}
//         >
//           <img
//             src={watch_playlist_button}
//             alt="watch playlist"
//             className="// h-12 w-auto md:h-9 lg:h-12 // cursor-pointer // transition-all duration-300 ease-out // hover:-translate-y-1 // hover:scale-[1.04] // hover:drop-shadow-[0_10px_25px_rgba(0,0,0,0.35)] // active:translate-y-0 // active:scale-[0.98] //"
//           />
//         </a>
//       </div>
//     </div>
//   );
// };

// // Mobile Card Component
// const MobileWebinarCard = ({ svg, title, isVisible }) => {
//   return (
//     <div
//       className={`
//         rounded-[50px] overflow-hidden border-2 border-evolve-yellow
//         transition-all duration-700 ease-in-out w-full max-w-[85vw] mx-auto
//         ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
//       `}
//     >
//       {/* Top 60% - Black with SVG */}
//       <div className="bg-black h-[300px] flex items-center justify-center">
//         <img
//           src={svg}
//           alt={title}
//           className="max-w-[70%] max-h-[70%] object-contain"
//         />
//       </div>

//       {/* Divider line */}
//       <div className="h-0.5 bg-evolve-yellow"></div>

//       {/* Bottom 40% - Pink with text */}
//       <div className="bg-evolve-pink h-[200px] flex items-center justify-center px-6">
//         <h3
//           className="font-extrabold text-black text-center"
//           style={{
//             fontSize: "40px",
//             lineHeight: "36px",
//             letterSpacing: "0"
//           }}
//           dangerouslySetInnerHTML={{ __html: title }}
//         />
//       </div>
//     </div>
//   );
// };

// const MobilePinnedCards = ({ cards }) => {
//   const sectionRef = useRef(null);
//   const cardsRef = useRef([]);

//   useLayoutEffect(() => {
//     if (window.innerWidth >= 768) return;

//     const ctx = gsap.context(() => {
//       cardsRef.current.forEach((card) => {
//         gsap.fromTo(
//           card,
//           { opacity: 0, y: 80 },
//           {
//             opacity: 1,
//             y: 0,
//             ease: "none",
//             scrollTrigger: {
//               trigger: card,
//               start: "top 85%",
//               end: "top 55%",
//               scrub: true,
//               invalidateOnRefresh: true
//             }
//           }
//         );
//       });
//     }, sectionRef);

//     return () => ctx.revert();
//   }, []);

//   return (
//     <section ref={sectionRef} className="relative bg-evolve-yellow px-6 pb-32">
//       {/* STICKY TEXT (NO GSAP PIN) */}
//       <div className="sticky top-0 bg-evolve-yellow pt-16 pb-8 z-10">
//         <p
//           className="text-black font-semibold text-center mx-auto max-w-[85vw]"
//           style={{ fontSize: "20px" }}
//         >
//           {COPY.pastSection.description}
//         </p>
//       </div>

//       {/* CARDS */}
//       <div className="space-y-24 mt-8">
//         {cards.map((card, i) => (
//           <div
//             key={i}
//             ref={(el) => (cardsRef.current[i] = el)}
//             className="rounded-[50px] overflow-hidden border-2 border-evolve-yellow mx-auto max-h-[80vh] max-w-[100vw]"
//           >
//             <div className="bg-black h-[300px] flex items-center overflow-hidden justify-center">
//               <img
//                 src={card.svg}
//                 className="max-w-[110%] max-h-[110%] object-contain"
//                 alt=""
//               />
//             </div>
//             {/* Top 60% - Black with SVG */}
//             {/* <div className="bg-black h-[300px] flex items-center justify-center">
//               <img
//                 src={svg}
//                 alt={title}
//                 className="max-w-[70%] max-h-[70%] object-contain"
//               />
//             </div> */}

//             <div className="bg-evolve-pink h-[200px] flex flex-col items-center justify-center">
//               <h3
//                 className="font-extrabold text-white text-center"
//                 style={{ fontSize: "40px", lineHeight: "36px" }}
//                 dangerouslySetInnerHTML={{ __html: card.title }}
//               />
//               <img
//                 src={watch_playlist_button}
//                 onClick={() => { trackWebinarPlaylist(card.title); window.open(card.playlistUrl, "_blank"); }}
//                 className="mt-6 h-12"
//                 alt=""
//               />
//             </div>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// };

// const Webinars = () => {
//   const [expandedCard, setExpandedCard] = useState(null);
//   const [currentMobileCard, setCurrentMobileCard] = useState(0);

//   // SVGs are still imported here — content.js only holds the text/URLs
//   const svgMap = [visual_design, interaction_design, career_growth, hobbies];
//   const cards = COPY.cards.map((c, i) => ({ ...c, svg: svgMap[i] }));

//   const handleCardToggle = (index, expand) => {
//     setExpandedCard(expand ? index : null);
//   };

//   // Mobile scroll handler
//   React.useEffect(() => {
//     const handleScroll = () => {
//       if (window.innerWidth < 768) {
//         const scrollPosition = window.scrollY;
//         const cardHeight = 600; // Approximate height per card
//         const newIndex = Math.min(
//           Math.floor(scrollPosition / cardHeight) % cards.length,
//           cards.length - 1
//         );
//         setCurrentMobileCard(newIndex);
//       }
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   return (
//     <main className="bg-evolve-yellow">
//       <SEO
//         title={COPY.seo.title}
//         description={COPY.seo.description}
//         path="/webinars"
//       />
//       {/* Desktop/Tablet View */}
//       <div className="hidden md:block">
//         {/* Wrapper for the entire hero section */}
//         <div className="relative overflow-hidden">
//           {/* Rays webinar SVG - z-10 (lowest) */}
//           <img
//             src={rays_webinars}
//             alt="rays background"
//             className="absolute inset-x-0 -top-10 mx-auto object-contain z-10 pointer-events-none"
//           />

//           {/* Left element - starts at 10vh, stretches to bottom of grid */}
//           {/* <div className="absolute left-0 top-0 bottom-0 z-20 pointer-events-none pt-[10vh] h-[90%]"> */}
//           <div className="absolute left-0 top-0 bottom-0 z-20 pointer-events-none pt-[10vh]">
//             <img
//               src={left_elem}
//               alt="left element"
//               // className="h-full w-auto object-cover object-top"
//               className="w-auto object-cover object-top"
//             />
//           </div>

//           {/* Right element - starts at 10vh, stretches to bottom of grid */}
//           {/* <div className="absolute right-0 top-0 bottom-0 z-20 pointer-events-none pt-[10vh] h-[90%]"> */}
//           <div className="absolute right-0 top-0 bottom-0 z-20 pointer-events-none pt-[10vh]">
//             <img
//               src={right_elem}
//               alt="right element"
//               // className="h-full w-auto object-cover object-top"
//               className="w-auto object-cover object-top"
//             />
//           </div>

//           {/* Content sections */}
//           <section className="relative">
//             {/* First viewport content */}
//             <div className="relative min-h-screen">
//               {/* Barfi - z-20, centered and moved down */}
//               <div className="absolute inset-0 flex items-center justify-center z-20 pt-20">
//                 <div className="relative flex flex-col items-center text-center">
//                   <img src={barfi} alt="barfi" className="relative w-[85%]" />

//                   {/* Text inside Barfi - z-30 */}
//                   {/* <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-16"> */}
//                   <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-16 top-[-28%]">
//                     <h1
//                       className="text-evolve-pink font-extrabold"
//                       style={{
//                         fontSize: "clamp(64px, 8vw, 128px)",
//                         lineHeight: "clamp(48px, 7vw, 110px)",
//                         letterSpacing: "-0.03em"
//                       }}
//                     >
//                       {renderWithBreaks(COPY.hero.heading)}
//                     </h1>

//                     {/* <p
//                       className="mt-6 font-bold text-black"
//                       style={{ fontSize: "38px" }}
//                     >
//                       Free. Forever. Worth Your Time.
//                     </p> */}

//                     <p
//                       className="mt-4 font-medium text-black leading-tight"
//                       style={{ fontSize: "28px" }}
//                     >
//                       {renderWithBreaks(COPY.hero.subtextDesktop)}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* Hands with stairs - z-40, bottom of screen */}
//               <img
//                 src={hands_with_stairs_chat_full}
//                 alt="hands with stairs chat"
//                 className="absolute -bottom-0 inset-x-0 mx-auto z-30 pointer-events-none w-[100%]"
//               />
//             </div>

//             {/* Second part - below hands-with-stairs */}
//             {/* <div className="relative z-30 py-16"> */}
//             {/* "upcoming webinar" text */}
//             {/* <div className="flex justify-center mb-12">
//                 <h2
//                   className="font-extrabold text-black"
//                   style={{
//                     fontSize: "36px",
//                     lineHeight: "96px",
//                     // letterSpacing: "0",
//                     letterSpacing: "-0.03em"
//                   }}
//                 >
//                   upcoming webinar
//                 </h2>
//               </div> */}

//             {/* Webinar card SVG */}
//             {/* <div>
//                 <img
//                   src={hands_with_webinars_card_full}
//                   alt="webinar card"
//                   className="w-screen object-contain"
//                 />
//               </div> */}
//             {/* </div> */}
//           </section>
//         </div>

//         {/* Past Webinars Section - Desktop */}
//         <section className="relative bg-evolve-yellow px-16 py-20">
//           {/* Description text with max-width */}
//           <div className="flex justify-center mb-12">
//             <p
//               className="text-black font-semibold text-center leading-tight max-w-[80vw]"
//               style={{ fontSize: "32px" }}
//             >
//               {COPY.pastSection.description}
//             </p>
//           </div>

//           {/* Webinar cards grid - 4 horizontal boxes */}
//           <div className="grid grid-cols-4 gap-2 max-w-[85vw] h-[65vh] mx-auto">
//             {/* {cards.map((card, index) => (
//               <WebinarCard
//                 key={index}
//                 svg={card.svg}
//                 title={card.title}
//                 isExpanded={expandedCard === index}
//                 onToggle={(expand) => handleCardToggle(index, expand)}
//               />
//             ))} */}
//             {cards.map((card, index) => (
//               <WebinarCard
//                 key={index}
//                 svg={card.svg}
//                 title={card.title}
//                 playlistUrl={card.playlistUrl}
//                 isExpanded={expandedCard === index}
//                 onToggle={(expand) => handleCardToggle(index, expand)}
//               />
//             ))}
//           </div>
//         </section>
//       </div>

//       {/* Mobile View */}
//       {/* ================= MOBILE VIEW ================= */}
//       <div className="block md:hidden overflow-hidden bg-evolve-yellow">
//         {/* ---------- PAGE 1 : HERO (2 screens) ---------- */}
//         <section className="relative">
//           {/* <section className="relative min-h-screen"> */}
//           <div className="relative min-h-screen">
//             {/* <section className="relative min-h-screen overflow-hidden"> */}
//             {/* Rays */}
//             <img
//               src={rays_webinars_mobile}
//               className="absolute inset-0 w-full z-10 pointer-events-none"
//               alt=""
//             />

//             {/* Barfi */}
//             <div className="absolute top-0 inset-x-0 flex justify-center z-20">
//               <img src={barfi_mobile} className="w-[100%]" alt="" />
//             </div>

//             {/* Side elements */}
//             <div className="absolute left-0 top-0 bottom-0 z-20 pointer-events-none pt-[30vh] h-[70%]">
//               <img
//                 src={left_elem_mobile}
//                 // className="absolute left-0 top-[30%] z-20 w-auto"
//                 className="w-auto object-cover object-top"
//                 alt=""
//               />
//             </div>
//             <img
//               src={right_elem_mobile}
//               className="absolute right-0 top-[30%] z-20"
//               alt=""
//             />

//             {/* Texts inside barfi */}
//             <div className="absolute top-[10vh] md:top-[0vh] inset-x-0 z-30 flex justify-center">
//               <div className="w-[80%] text-center pt-16 px-6">
//                 <h1
//                   className="// text-evolve-pink font-extrabold"
//                   style={{
//                     fontSize: "clamp(64px, 8vw, 128px)",
//                     lineHeight: "clamp(48px, 7vw, 110px)",
//                     letterSpacing: "-0.03em"
//                   }}
//                 >
//                   {COPY.hero.heading}
//                 </h1>

//                 {/* <p
//                   className="// mt-4 font-bold text-black // text-[18px] // md:text-[clamp(18px,2vw,20px)] //"
//                 >
//                   Free. Forever. Worth Your Time.
//                 </p> */}

//                 <p
//                   className="// mt-3 font-normal text-center text-black mx-auto max-w-[70vw] // text-[18px] // md:text-[clamp(18px,1.8vw,20px)] //"
//                 >
//                   {COPY.hero.subtextMobile}
//                 </p>
//               </div>
//             </div>

//             {/* Hands chat (top layer) */}
//             <img
//               src={hands_with_stairs_chat_full_mobile}
//               className="absolute -bottom-10 inset-x-0 z-30 w-full mx-auto pointer-events-none"
//               alt=""
//             />
//           </div>
//           {/* </section> */}

//           {/* ---------- PAGE 1 : UPCOMING ---------- */}
//           {/* <section className="relative z-40 pt-32 pb-20 text-center"> */}
//           <div className="relative z-40 pt-32 pb-20 text-center">
//             {/* <h2
//               className="font-extrabold text-black"
//               style={{
//                 fontSize: "32px",
//                 lineHeight: "32px",
//                 letterSpacing: "-0.03em"
//               }}
//             >
//               upcoming
//               <br /> webinar
//             </h2>

//             <img
//               src={hands_with_webinars_card_full_mobile}
//               className="w-[95%] mx-auto mt-10"
//               alt=""
//             /> */}
//             {/* </section> */}

//             {/* ---------- PAGE 2 : PAST WEBINARS ---------- */}
//             <MobilePinnedCards cards={cards} />
//           </div>
//         </section>
//       </div>
//     </main>
//   );
// };

// export default Webinars;

import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import { supabase } from "../supabaseClient";
import { isEventOver, upcomingCutoffIso, collapseSeries } from "../lib/events";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

import {
  barfi_mobile,
  rays_webinars_mobile,
  left_elem_mobile,
  right_elem_mobile,
  hands_with_stairs_chat_full_mobile,
  hands_with_webinars_card_full_mobile,
  barfi,
  hands_with_stairs_chat,
  hands_with_stairs_chat_full,
  left_elem,
  rays_webinars,
  right_elem,
  hands_with_webinars_card_full,
  visual_design,
  interaction_design,
  career_growth,
  hobbies,
  watch_playlist_button,
  learn_to_learn,
  learn_to_learn_mobile,
  service_design_mobile,
  service_design,
  service_design_mobile_done,
  service_design_done
} from "../assets/images/Webinars";
import { right_arrow_icon } from "../assets/images/Nav";

import { webinars as COPY } from "../content";
import { renderWithBreaks } from "../utils/renderWithBreaks";
import { trackWebinarPlaylist } from "../utils/analytics";

gsap.registerPlugin(ScrollTrigger);

// Reusable Card Component
// const WebinarCard = ({ svg, title, playlistUrl, isExpanded, onToggle }) => {
const WebinarCard = ({ svg, title, playlistUrl, isExpanded, onToggle }) => {
  const handleDesktopClick = () => {
    if (window.innerWidth >= 768) {
      window.open(playlistUrl, "_blank");
    }
  };
  return (
    // <div
    //   className={`
    //     rounded-[70px] overflow-hidden border-2 border-evolve-yellow
    //     transition-all duration-500 ease-in-out
    //     ${isExpanded ? "scale-y-110" : "scale-y-100"}
    //   `}
    //   onMouseEnter={() => !("ontouchstart" in window) && onToggle(true)}
    //   onMouseLeave={() => !("ontouchstart" in window) && onToggle(false)}
    //   onClick={() => "ontouchstart" in window && onToggle(!isExpanded)}
    // >
    <div
      className={`
        rounded-[70px] overflow-hidden border-2 border-evolve-yellow
        transition-all duration-500 ease-in-out
        ${isExpanded ? "scale-y-110" : "scale-y-100"}
        cursor-pointer md:cursor-pointer
      `}
      onClick={handleDesktopClick}
      onMouseEnter={() => !("ontouchstart" in window) && onToggle(true)}
      onMouseLeave={() => !("ontouchstart" in window) && onToggle(false)}
    >
      {/* Top section */}
      <div className="bg-black h-[60%] min-h-[240px] relative overflow-hidden flex justify-center">
        {/* <img
          src={svg}
          alt={title}
          className={`
      absolute bottom-0
      w-full
      object-contain
      transition-transform duration-500 ease-in-out
      origin-bottom
      ${isExpanded ? "scale-y-[0.91]" : "scale-y-100"}
    `}
        /> */}
        {/* <img
          src={svg}
          alt={title}
          className={`
              absolute bottom-0
              object-contain
              transition-transform duration-500 ease-in-out
              origin-bottom
              ${svg === hobbies ? "w-[80%]" : ""}
              ${
                svg === interaction_design
                  ? "w-[200%] -left-2 bottom-[-4rem] scale-x-[1.5] scale-y-[1.5]"
                  : ""
              }
              ${svg === career_growth ? "-bottom-3" : ""}
              ${svg === visual_design ? "-bottom-[0.4rem]" : ""}

                  ${
                    isExpanded && svg === interaction_design
                      ? "scale-y-[1.39] scale-x-[1.2] bottom-[-2rem]"
                      : "scale-y-100 scale-x-100"
                  }
                  ${
                    isExpanded && svg !== interaction_design
                      ? "scale-y-[0.91]"
                      : "scale-y-100"
                  }
          `}
        />
         */}
        <img
          src={svg}
          alt={title}
          className={`
    absolute bottom-0
    object-contain
    transition-transform duration-500 ease-in-out
    origin-bottom

    ${svg === hobbies ? "w-[80%]" : ""}
    ${svg === career_growth ? "-bottom-3" : ""}
    ${svg === visual_design ? "-bottom-[0.3rem]" : ""}

${svg === interaction_design ? "min-w-[150%] bottom-[-4rem]" : ""}

    ${isExpanded ? "scale-y-[0.91]" : ""}
    `}
          // ${
          //   isExpanded && svg === interaction_design
          //     ? "scale-y-[1.25] scale-x-[1.25] bottom-[-2rem]"
          //     : ""
          // }
        />
      </div>

      {/* Divider */}
      <div className="h-0.5 bg-evolve-yellow" />
      {/* Bottom section */}
      <div
        className={`
          bg-evolve-pink h-[40%] min-h-[160px]
          flex flex-col items-center justify-center
          transition-all duration-500 ease-in-out
          ${isExpanded ? "pt-6 pb-8" : "py-0"}
          /* Tablet only */
          // md:h-[42%] md:min-h-[110px]
          lg:h-[40%] lg:min-h-[160px]
          ${isExpanded ? "md:pt-3 md:pb-5 lg:pt-6 lg:pb-8" : ""}
        `}
      >
        <h3
          className={`
            font-extrabold lowercase text-white text-center
            transition-all duration-500 ease-in-out
                        text-5xl leading-[40px]
            md:text-2xl lg:text-4xl
            ${
              isExpanded
                ? "-translate-y-0 scale-y-90"
                : "translate-y-0 scale-y-100"
            }
          `}
          style={{
            // fontSize: "48px",
            lineHeight: "40px",
            letterSpacing: "0"
          }}
          dangerouslySetInnerHTML={{ __html: title }}
        />
        {/* <h3
          className="font-extrabold text-white text-center transition-all duration-500 ease-in-out text-5xl leading-[40px] md:text-2xl lg:text-4xl"
          // style={{
          //   lineHeight: "40px",
          //   letterSpacing: "0"
          // }}
          dangerouslySetInnerHTML={{ __html: title }}
        /> */}
        {/* Button */}
        <a data-cta="web_events_watch_playlist"
          // href={playlistUrl}
          onClick={() => {
            trackWebinarPlaylist(title);
            window.open(playlistUrl, "_blank");
          }}
          target="_blank"
          rel="noopener noreferrer"
          className={`
    mt-6 transition-all duration-500 ease-in-out
    ${
      isExpanded
        ? "opacity-100 translate-y-0"
        : "opacity-0 -translate-y-4 pointer-events-none"
    }
    md:mt-3 lg:mt-6
  `}
        >
          <img
            src={watch_playlist_button}
            alt="watch playlist"
            className="h-12 w-auto md:h-9 lg:h-12 cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.04] hover:drop-shadow-[0_10px_25px_rgba(0,0,0,0.35)] active:translate-y-0 active:scale-[0.98]"
          />
        </a>
      </div>
    </div>
  );
};

// Mobile Card Component
const MobileWebinarCard = ({ svg, title, isVisible }) => {
  return (
    <div
      className={`
        rounded-[50px] overflow-hidden border-2 border-evolve-yellow
        transition-all duration-700 ease-in-out w-full max-w-[85vw] mx-auto
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
      `}
    >
      {/* Top 60% - Black with SVG */}
      <div className="bg-black h-[300px] flex items-center justify-center">
        <img
          src={svg}
          alt={title}
          className="max-w-[70%] max-h-[70%] object-contain"
        />
      </div>

      {/* Divider line */}
      <div className="h-0.5 bg-evolve-yellow"></div>

      {/* Bottom 40% - Pink with text */}
      <div className="bg-evolve-pink h-[200px] flex items-center justify-center px-6">
        <h3
          className="font-extrabold text-black text-center"
          style={{
            fontSize: "40px",
            lineHeight: "36px",
            letterSpacing: "0"
          }}
          dangerouslySetInnerHTML={{ __html: title }}
        />
      </div>
    </div>
  );
};

const MobilePinnedCards = ({ cards }) => {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  useLayoutEffect(() => {
    if (window.innerWidth >= 768) return;

    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 80 },
          {
            opacity: 1,
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              end: "top 55%",
              scrub: true,
              invalidateOnRefresh: true
            }
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-evolve-yellow px-6 pb-32">
      {/* STICKY TEXT (NO GSAP PIN) */}
      <div className="sticky top-0 bg-evolve-yellow pt-16 pb-8 z-10">
        <h2
          className="text-black font-extrabold text-center mb-3"
          style={{
            fontSize: "48px",
            lineHeight: "1",
            letterSpacing: "-0.03em"
          }}
        >
          {COPY.pastSection.heading}
        </h2>
        <p
          className="text-black font-semibold text-center mx-auto max-w-[85vw]"
          style={{ fontSize: "20px" }}
        >
          {COPY.pastSection.description}
        </p>
      </div>

      {/* CARDS */}
      <div className="space-y-24 mt-8">
        {cards.map((card, i) => (
          <div
            key={i}
            ref={(el) => (cardsRef.current[i] = el)}
            className="rounded-[50px] overflow-hidden border-2 border-evolve-yellow mx-auto max-h-[80vh] max-w-[100vw]"
          >
            <div className="bg-black h-[300px] flex items-center overflow-hidden justify-center">
              <img
                src={card.svg}
                className="max-w-[110%] max-h-[110%] object-contain"
                alt=""
              />
            </div>
            {/* Top 60% - Black with SVG */}
            {/* <div className="bg-black h-[300px] flex items-center justify-center">
              <img
                src={svg}
                alt={title}
                className="max-w-[70%] max-h-[70%] object-contain"
              />
            </div> */}

            <div className="bg-evolve-pink h-[200px] flex flex-col items-center justify-center">
              <h3
                className="font-extrabold text-white text-center"
                style={{ fontSize: "40px", lineHeight: "36px" }}
                dangerouslySetInnerHTML={{ __html: card.title }}
              />
              <img data-cta="web_events_watch_playlist_mobile"
                src={watch_playlist_button}
                onClick={() => {
                  trackWebinarPlaylist(card.title);
                  window.open(card.playlistUrl, "_blank");
                }}
                className="mt-6 h-12"
                alt=""
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

function fmtEventDate(dtStr) {
  const d = new Date(dtStr);
  return {
    day: d.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric"
    }),
    month: d.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      month: "short"
    }),
    year: d.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric"
    }),
    time: d.toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    })
  };
}

// Purple "stage" steps at the bottom of the events hero. Rows run top → bottom;
// rows with two widths are split around the centre (where the dots sit).
const STAGE_ROWS = [
  ["28%"],
  ["44%"],
  ["22%", "22%"],
  ["40%", "40%"],
  ["100%"]
];

function HeroArrow({ dir, onClick, disabled }) {
  return (
    <button data-cta={`web_events_hero_${dir}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "previous event" : "next event"}
      className="flex-shrink-0 flex items-center justify-center p-2 disabled:opacity-30"
    >
      <img
        src={right_arrow_icon}
        alt=""
        className={`h-6 w-6 md:h-8 md:w-8 ${dir === "prev" ? "rotate-180" : ""}`}
      />
    </button>
  );
}

// Hero shown on /events when at least one upcoming event exists. Replaces the
// default illustrated hero and the old separate "Upcoming Event" section.
function UpcomingEventsHero({ events }) {
  const [index, setIndex] = useState(0);
  const safeIndex = Math.min(index, events.length - 1);
  const event = events[safeIndex];
  const { day, month, year, time } = fmtEventDate(event.start_time);
  const photo = event.speaker_photo_url || event.cover_image_url;
  const many = events.length > 1;
  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(events.length - 1, i + 1));

  return (
    <section className="relative bg-evolve-yellow w-full min-h-screen overflow-hidden flex flex-col items-center pt-24 md:pt-28">
      <img
        src={rays_webinars}
        alt=""
        className="absolute inset-x-0 -top-10 mx-auto object-contain pointer-events-none hidden md:block"
      />
      <img
        src={rays_webinars_mobile}
        alt=""
        className="absolute inset-0 w-full pointer-events-none md:hidden"
      />

      <div className="relative z-10 text-center px-6">
        <h1
          className="text-evolve-pink font-extrabold leading-[0.8] md:leading-none"
          style={{
            fontSize: "clamp(48px, 5.5vw, 96px)",
            letterSpacing: "-0.03em"
          }}
        >
          {COPY.hero.heading}
        </h1>
        <p className="mt-2 text-black font-semibold text-lg md:text-2xl">
          Upcoming Event
        </p>
      </div>

      <div className="relative z-20 w-full max-w-[1600px] flex items-center gap-1 md:gap-4 px-2 md:px-6 mt-6 md:mt-8">
        <div className="hidden md:block">
          {many && <HeroArrow dir="prev" onClick={prev} disabled={safeIndex === 0} />}
        </div>

        <div className="relative flex-1 bg-evolve-yellow border-4 border-evolve-pink rounded-[48px] md:rounded-[96px] p-8 md:p-14 min-h-[480px] md:min-h-[440px] flex flex-col justify-center overflow-hidden">
          <div className="relative z-10 max-w-full md:max-w-[min(70%,calc(100%-24rem))] pb-56 md:pb-0 flex flex-col items-center text-center md:items-start md:text-left">
            <span className="inline-block bg-black text-white text-[11px] font-bold uppercase tracking-wide px-3 py-1 rounded-full mb-3">
              {event.event_type || "Webinar"}
            </span>
            <h2
              className="text-evolve-pink font-extrabold text-4xl md:text-6xl leading-[0.9]"
              style={{ letterSpacing: "-0.03em" }}
            >
              {event.title}
            </h2>
            {event.speaker_title && (
              <p className="text-black font-medium mt-3 text-base md:text-lg leading-tight">
                {event.speaker_title}
              </p>
            )}
            {event.speaker_name && (
              <p className="text-black font-extrabold mt-2 text-lg md:text-2xl leading-tight">
                by {event.speaker_name}
              </p>
            )}
            <div className="flex items-center gap-4 mt-4">
              <p className="text-evolve-pink font-extrabold text-lg md:text-xl leading-tight">
                {month} {day}
                <span className="block text-black font-normal text-xs">{year}</span>
              </p>
              <div className="w-px h-8 bg-black/20" />
              <p className="text-evolve-pink font-extrabold text-lg md:text-xl leading-tight">
                {time}
                <span className="block text-black font-normal text-xs">IST</span>
              </p>
            </div>
            <Link data-cta="web_events_upcoming_register_now"
              to={`/events/${event.slug}`}
              className="inline-flex items-center gap-2 mt-5 bg-black text-white font-bold text-sm px-8 py-3 rounded-xl shadow-[4px_4px_0px_#806804]"
            >
              Register now
              <img
                src={right_arrow_icon}
                alt=""
                className="h-4 w-4"
                style={{ filter: "invert(1)" }}
              />
            </Link>
          </div>
          {photo && (
            <img
              src={photo}
              alt={event.speaker_name || event.title}
              className="pointer-events-none select-none absolute bottom-0 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-10 w-56 h-56 md:w-[22rem] md:h-[22rem] rounded-t-[28px] object-cover"
            />
          )}
        </div>

        <div className="hidden md:block">
          {many && <HeroArrow dir="next" onClick={next} disabled={safeIndex === events.length - 1} />}
        </div>
      </div>

      {/* Stage steps + carousel controls */}
      <div className="relative z-10 w-full mt-auto pt-4">
        <div className="flex flex-col items-center">
          {STAGE_ROWS.map((row, r) => (
            <div
              key={r}
              className={`flex w-full h-6 md:h-8 ${row.length > 1 ? "justify-between" : "justify-center"}`}
              style={row.length > 1 ? { paddingInline: `calc((100% - ${row[0]} - ${row[1]} - 20%) / 2)` } : undefined}
            >
              {row.map((w, i) => (
                <div
                  key={i}
                  className="bg-evolve-lavender-indigo border border-black -mt-px h-full"
                  style={{ width: w }}
                />
              ))}
            </div>
          ))}
        </div>

        {many && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-12 md:bottom-16 flex items-center gap-3">
            <div className="md:hidden">
              <HeroArrow dir="prev" onClick={prev} disabled={safeIndex === 0} />
            </div>
            <div className="flex gap-2">
              {events.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`go to event ${i + 1}`}
                  className={`w-2.5 h-2.5 rounded-full ${i === safeIndex ? "bg-black" : "bg-black/30"}`}
                />
              ))}
            </div>
            <div className="md:hidden">
              <HeroArrow dir="next" onClick={next} disabled={safeIndex === events.length - 1} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

const PAST_PAGE = 6;

// Ended events, newest first. Each card opens the event page, which shows the
// recording for past events.
function PastEventsSection({ events }) {
  const [shown, setShown] = useState(PAST_PAGE);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  if (!events.length) return null;

  const categories = [
    ...new Set(events.map((e) => e.event_type || "Webinar"))
  ].sort();
  const q = query.trim().toLowerCase();
  const filtered = events.filter((e) => {
    if (category !== "all" && (e.event_type || "Webinar") !== category) return false;
    if (!q) return true;
    return [e.title, e.speaker_name, e.event_type]
      .filter(Boolean)
      .some((v) => v.toLowerCase().includes(q));
  });

  const pickCategory = (value) => {
    setCategory(value);
    setShown(PAST_PAGE);
    setFilterOpen(false);
  };

  return (
    <section className="bg-evolve-yellow px-4 md:px-16 py-16 md:py-24">
      <h2
        className="text-black text-center font-extrabold"
        style={{
          fontSize: "clamp(32px, 3.4vw, 56px)",
          lineHeight: 1,
          letterSpacing: "-0.03em"
        }}
      >
        {COPY.pastSection.heading}
      </h2>

      {/* Search + category filter */}
      <div className="relative mt-6 md:mt-8 mx-auto max-w-[720px] flex items-stretch gap-3 md:gap-0 md:rounded-xl md:bg-[#FFE57A] md:overflow-hidden">
        <div className="hidden md:flex items-center border-r border-black/10 pl-4 pr-3">
          <select
            value={category}
            onChange={(e) => pickCategory(e.target.value)}
            aria-label="filter by category"
            className="bg-transparent font-bold text-sm text-black outline-none cursor-pointer pr-1"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShown(PAST_PAGE);
          }}
          placeholder="Search event"
          className="flex-1 min-w-0 rounded-xl md:rounded-none bg-[#FFE57A] px-4 py-4 md:py-3 text-black text-base md:text-sm placeholder:text-black/70 outline-none"
        />
        <button data-cta="web_events_past_filter"
          type="button"
          onClick={() => setFilterOpen((o) => !o)}
          aria-label="filter by category"
          aria-expanded={filterOpen}
          className="md:hidden flex-shrink-0 w-14 rounded-xl bg-black flex items-center justify-center"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFD007" strokeWidth="2.2" strokeLinecap="round">
            <path d="M4 7h16M7 12h10M10 17h4" />
          </svg>
        </button>

        {filterOpen && (
          <div className="md:hidden absolute right-0 top-full mt-2 z-30 w-56 rounded-xl border border-black bg-[#FFE57A] py-2 shadow-[4px_4px_0px_#806804]">
            {[["all", "All categories"], ...categories.map((c) => [c, c])].map(([value, label]) => (
              <button data-cta={`web_events_past_filter_${ctaSlug(value)}`}
                key={value}
                type="button"
                onClick={() => pickCategory(value)}
                className={`block w-full text-left px-4 py-2 text-sm ${category === value ? "font-bold" : "font-medium"} text-black`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-10 md:mt-14 mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-x-16 lg:gap-x-24 gap-y-8 md:gap-y-14">
        {filtered.slice(0, shown).map((event) => {
          const photo = event.cover_image_url || event.speaker_photo_url;
          const type = event.event_type || "Webinar";
          return (
            <Link data-cta="web_events_past_event_card"
              key={event.id}
              to={`/events/${event.slug}`}
              className="group block"
            >
              <div className="aspect-video rounded-md md:rounded-xl border-2 border-black bg-black overflow-hidden">
                {photo && (
                  <img
                    src={photo}
                    alt={event.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                )}
              </div>
              {/* Desktop: one line. Mobile: title, then speaker | type */}
              <p className="mt-1.5 md:mt-4 text-black font-bold text-[15px] md:text-xl leading-snug">
                <span className="block md:inline">
                  {event.title}
                  <span className="hidden md:inline"> | </span>
                </span>
                {event.speaker_name && <> by {event.speaker_name} | </>}
                {type}
              </p>
            </Link>
          );
        })}
      </div>

      {!filtered.length && (
        <p className="mt-10 text-center text-black font-medium">
          No events match your search.
        </p>
      )}

      {filtered.length > shown && (
        <div className="mt-10 md:mt-14 flex justify-center">
          <button data-cta="web_events_past_show_more"
            type="button"
            onClick={() => setShown((n) => n + PAST_PAGE)}
            className="inline-flex items-center gap-2 rounded-[16px] bg-black text-evolve-yellow border border-evolve-yellow font-semibold px-8 py-4 text-[18px] leading-none shadow-[4px_4px_0px_#806804] transition-transform duration-150 hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none"
          >
            Show more
          </button>
        </div>
      )}
    </section>
  );
}

const Webinars = () => {
  const [expandedCard, setExpandedCard] = useState(null);
  const [currentMobileCard, setCurrentMobileCard] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [upcomingLoaded, setUpcomingLoaded] = useState(false);

  useEffect(() => {
    supabase
      .from("events")
      .select("*")
      .eq("status", "published")
      .gte("start_time", upcomingCutoffIso())
      .order("start_time", { ascending: true })
      .then(({ data }) => {
        setUpcomingEvents(collapseSeries((data || []).filter((e) => !isEventOver(e))));
        setUpcomingLoaded(true);
      });

    supabase
      .from("events")
      .select("*")
      .eq("status", "published")
      .lt("start_time", new Date().toISOString())
      .order("start_time", { ascending: false })
      .limit(60)
      .then(({ data }) => setPastEvents((data || []).filter((e) => isEventOver(e))));
  }, []);

  // SVGs are still imported here — content.js only holds the text/URLs
  const svgMap = [visual_design, interaction_design, career_growth, hobbies];
  const cards = COPY.cards.map((c, i) => ({ ...c, svg: svgMap[i] }));

  const handleCardToggle = (index, expand) => {
    setExpandedCard(expand ? index : null);
  };

  // Mobile scroll handler
  React.useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 768) {
        const scrollPosition = window.scrollY;
        const cardHeight = 600; // Approximate height per card
        const newIndex = Math.min(
          Math.floor(scrollPosition / cardHeight) % cards.length,
          cards.length - 1
        );
        setCurrentMobileCard(newIndex);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="bg-evolve-yellow">
      <SEO
        title={COPY.seo.title}
        description={COPY.seo.description}
        path="/events"
      />
      {!upcomingLoaded ? (
        // Hold the space until we know which hero to show (avoids a flash of the default hero)
        <div className="h-screen bg-evolve-yellow" />
      ) : upcomingEvents.length > 0 ? (
        <UpcomingEventsHero events={upcomingEvents} />
      ) : (
      <>
      {/* Desktop/Tablet View */}
      <div className="hidden md:block">
        {/* Wrapper for the entire hero section */}
        <div className="relative overflow-hidden h-screen">
          {/* Rays webinar SVG - z-10 (lowest) */}
          <img
            src={rays_webinars}
            alt="rays background"
            className="absolute inset-x-0 -top-10 mx-auto object-contain z-10 pointer-events-none"
          />

          {/* Left element - starts at 10vh, stretches to bottom of grid */}
          <div className="absolute -left-1 top-0 bottom-0 z-20 pointer-events-none pt-[10vh]">
            <img
              src={left_elem}
              alt="left element"
              className="w-auto object-cover object-top"
            />
          </div>

          {/* Right element - starts at 10vh, stretches to bottom of grid */}
          <div className="absolute right-0 top-0 bottom-0 z-20 pointer-events-none pt-[10vh]">
            <img
              src={right_elem}
              alt="right element"
              className="w-auto object-cover object-top"
            />
          </div>

          {/* Content sections */}
          <section className="relative h-full">
            {/* First viewport content */}
            <div className="relative h-full">
              {/* Barfi - z-20, anchored to top */}
              <div className="absolute inset-0 flex items-center justify-center z-20 -pt-36">
                <div className="relative flex flex-col items-center text-center">
                  <img src={barfi} alt="barfi" className="relative w-[85%]" />

                  {/* Text inside Barfi - z-30 */}
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-16 top-[-25%]">
                    <h1
                      className="text-evolve-pink font-extrabold"
                      style={{
                        fontSize: "clamp(64px, 8vw, 128px)",
                        lineHeight: "clamp(48px, 6vw, 110px)",
                        letterSpacing: "-0.03em"
                      }}
                    >
                      {renderWithBreaks(COPY.hero.heading)}
                    </h1>

                    {/* <p
                      className="mt-6 font-bold text-black"
                      style={{ fontSize: "38px" }}
                    >
                      Free. Forever. Worth Your Time.
                    </p> */}

                    <p
                      className="mt-4 font-medium text-black leading-tight"
                      style={{ fontSize: "28px" }}
                    >
                      {renderWithBreaks(COPY.hero.subtextDesktop)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Hands with stairs - z-40, above left/right elements */}
              <img
                src={hands_with_stairs_chat_full}
                alt="hands with stairs chat"
                className="absolute -bottom-4 inset-x-0 mx-auto z-40 pointer-events-none w-[100%]"
              />
            </div>
          </section>
        </div>

      </div>

      {/* Mobile View */}
      {/* ================= MOBILE VIEW ================= */}
      <div className="block md:hidden overflow-hidden bg-evolve-yellow">
        {/* ---------- PAGE 1 : HERO (2 screens) ---------- */}
        <section className="relative">
          {/* <section className="relative min-h-screen"> */}
          <div className="relative h-screen overflow-hidden">
            {/* <section className="relative min-h-screen overflow-hidden"> */}
            {/* Rays */}
            <img
              src={rays_webinars_mobile}
              className="absolute inset-0 w-full z-10 pointer-events-none"
              alt=""
            />

            {/* Barfi */}
            <div className="absolute top-0 inset-x-0 flex justify-center z-20">
              <img src={barfi_mobile} className="w-[100%]" alt="" />
            </div>

            {/* Side elements - clipped so they can't bleed into the next section */}
            <div className="absolute left-0 top-0 h-full z-20 pointer-events-none pt-[30vh] overflow-hidden">
              <img
                src={left_elem_mobile}
                className="w-auto object-cover object-top"
                alt=""
              />
            </div>
            <div className="absolute right-0 top-0 h-full z-20 pointer-events-none pt-[30vh] overflow-hidden">
              <img
                src={right_elem_mobile}
                className="w-auto object-cover object-top"
                alt=""
              />
            </div>

            {/* Texts inside barfi */}
            <div className="absolute top-[8vh] md:top-[0vh] inset-x-0 z-30 flex justify-center">
              <div className="w-[80%] text-center pt-16 px-6">
                <h1
                  className="text-evolve-pink font-extrabold"
                  style={{
                    fontSize: "clamp(64px, 8vw, 128px)",
                    lineHeight: "clamp(48px, 7vw, 110px)",
                    letterSpacing: "-0.03em"
                  }}
                >
                  {COPY.hero.heading}
                </h1>

                {/* <p
                  className="mt-4 font-bold text-black text-[18px] md:text-[clamp(18px,2vw,20px)]"
                >
                  Free. Forever. Worth Your Time.
                </p> */}

                <p className="mt-3 font-normal text-center text-black mx-auto max-w-[70vw] text-[18px] md:text-[clamp(18px,1.8vw,20px)]">
                  {COPY.hero.subtextMobile}
                </p>
              </div>
            </div>

            {/* Hands chat (top layer) */}
            <img
              src={hands_with_stairs_chat_full_mobile}
              className="absolute -bottom-10 inset-x-0 z-30 w-full mx-auto pointer-events-none"
              alt=""
            />
          </div>
          {/* </section> */}

          {/* ---------- PAST WEBINARS ---------- */}
          {/* <div className="relative z-40 pt-32">
            <MobilePinnedCards cards={cards} />
          </div> */}
        </section>
      </div>
      </>
      )}

      <PastEventsSection events={pastEvents} />
    </main>
  );
};

export default Webinars;

// {/* <section className="relative bg-evolve-yellow px-16 py-20">
//           {/* Past webinars heading */}
//           <div className="flex justify-center mb-6">
//             <h2
//               className="text-black font-extrabold"
//               style={{
//                 fontSize: "72px",
//                 lineHeight: "1",
//                 letterSpacing: "-0.03em"
//               }}
//             >
//               {COPY.pastSection.heading}
//             </h2>
//           </div>
//           {/* Description text with max-width */}
//           <div className="flex justify-center mb-12">
//             <p
//               className="text-black font-semibold text-center leading-tight max-w-[80vw]"
//               style={{ fontSize: "32px" }}
//             >
//               {COPY.pastSection.description}
//             </p>
//           </div>

//           {/* Webinar cards grid - 4 horizontal boxes */}
//           <div className="grid grid-cols-4 gap-2 max-w-[85vw] h-[65vh] mx-auto">
//             {/* {cards.map((card, index) => (
//               <WebinarCard
//                 key={index}
//                 svg={card.svg}
//                 title={card.title}
//                 isExpanded={expandedCard === index}
//                 onToggle={(expand) => handleCardToggle(index, expand)}
//               />
//             ))} */}
//             {cards.map((card, index) => (
//               <WebinarCard
//                 key={index}
//                 svg={card.svg}
//                 title={card.title}
//                 playlistUrl={card.playlistUrl}
//                 isExpanded={expandedCard === index}
//                 onToggle={(expand) => handleCardToggle(index, expand)}
//               />
//             ))}
//           </div>
//         </section> */}
