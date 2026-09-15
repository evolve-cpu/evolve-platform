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
// import { trackWebinarPlaylist } from "../utils/analytics";

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
        <a
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
              <img
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

function UpcomingEventsSection({ events }) {
  const [index, setIndex] = useState(0);
  if (!events.length) return null;
  const event = events[Math.min(index, events.length - 1)];
  const { day, month, time } = fmtEventDate(event.start_time);

  const photo = event.speaker_photo_url || event.cover_image_url;

  return (
    <section className="relative bg-evolve-pink w-full h-screen overflow-hidden flex flex-col items-center justify-center px-6 md:px-16 py-10">
      <h2 className="text-white text-center font-extrabold text-4xl md:text-6xl leading-none mb-8">
        Upcoming Event
      </h2>

      <div className="relative w-full max-w-7xl flex items-center gap-3 md:gap-6">
        {events.length > 1 && (
          <button
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            aria-label="previous event"
            className="hidden md:flex flex-shrink-0 items-center justify-center disabled:opacity-30"
          >
            <img
              src={right_arrow_icon}
              alt=""
              className="h-8 w-8 rotate-180"
              style={{ filter: "invert(1)" }}
            />
          </button>
        )}

        <div className="relative flex-1 bg-evolve-yellow rounded-[100px] md:rounded-[100px] p-8 md:p-14 min-h-[460px] md:min-h-[490px] flex flex-col justify-center overflow-hidden">
          <div className="relative z-10 max-w-full md:max-w-[65%] pb-52 md:pb-0 flex flex-col items-center text-center md:items-start md:text-left">
            <span className="inline-block bg-black text-white text-[11px] font-bold uppercase tracking-wide px-3 py-1 rounded-full mb-3">
              {event.event_type || "Webinar"}
            </span>
            <h3
              className="text-evolve-pink font-extrabold text-4xl md:text-6xl md:leading-[0.9] leading-[0.9]"
              style={{ letterSpacing: "-0.03em" }}
            >
              {event.title}
            </h3>
            {event.speaker_title && (
              <p className="text-black font-medium mt-3 text-base md:text-lg leading-tight">
                {event.speaker_title}
              </p>
            )}
            {event.speaker_name && (
              <p className="text-black font-extrabold mt-1 text-base md:text-xl leading-tight">
                by {event.speaker_name}
              </p>
            )}
            <div className="flex items-center gap-4 mt-4">
              <p className="text-evolve-pink font-extrabold text-lg md:text-xl leading-tight">
                {month} {day}
                <span className="block text-black font-normal text-xs">
                  {new Date(event.start_time).getFullYear()}
                </span>
              </p>
              <div className="w-px h-8 bg-black/20" />
              <p className="text-evolve-pink font-extrabold text-lg md:text-xl leading-tight">
                {time}
                <span className="block text-black font-normal text-xs">
                  IST
                </span>
              </p>
            </div>
            <Link
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
              className="pointer-events-none select-none absolute bottom-0 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-4 w-56 h-56 md:w-[22rem] md:h-[22rem] rounded-t-[28px] object-cover"
            />
          )}
        </div>

        {events.length > 1 && (
          <button
            onClick={() => setIndex((i) => Math.min(events.length - 1, i + 1))}
            disabled={index === events.length - 1}
            aria-label="next event"
            className="hidden md:flex flex-shrink-0 items-center justify-center disabled:opacity-30"
          >
            <img
              src={right_arrow_icon}
              alt=""
              className="h-8 w-8"
              style={{ filter: "invert(1)" }}
            />
          </button>
        )}
      </div>

      {events.length > 1 && (
        <div className="hidden md:flex justify-center gap-2 mt-6">
          {events.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`go to event ${i + 1}`}
              className={`w-2 h-2 rounded-full ${i === index ? "bg-white" : "bg-white/40"}`}
            />
          ))}
        </div>
      )}

      {events.length > 1 && (
        <div className="w-full max-w-6xl flex md:hidden items-center justify-between mt-6">
          <button
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            aria-label="previous event"
            className="flex-shrink-0 disabled:opacity-30"
          >
            <img
              src={right_arrow_icon}
              alt=""
              className="h-6 w-6 rotate-180"
              style={{ filter: "invert(1)" }}
            />
          </button>
          <div className="flex gap-2">
            {events.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`go to event ${i + 1}`}
                className={`w-2 h-2 rounded-full ${i === index ? "bg-white" : "bg-white/40"}`}
              />
            ))}
          </div>
          <button
            onClick={() => setIndex((i) => Math.min(events.length - 1, i + 1))}
            disabled={index === events.length - 1}
            aria-label="next event"
            className="flex-shrink-0 disabled:opacity-30"
          >
            <img
              src={right_arrow_icon}
              alt=""
              className="h-6 w-6"
              style={{ filter: "invert(1)" }}
            />
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

  useEffect(() => {
    supabase
      .from("events")
      .select("*")
      .eq("status", "published")
      .gte("start_time", new Date().toISOString())
      .order("start_time", { ascending: true })
      .then(({ data }) => setUpcomingEvents(data || []));
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

        <UpcomingEventsSection events={upcomingEvents} />

        {/* Past Webinars Section - Desktop */}
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

          <UpcomingEventsSection events={upcomingEvents} />

          {/* ---------- PAST WEBINARS ---------- */}
          {/* <div className="relative z-40 pt-32">
            <MobilePinnedCards cards={cards} />
          </div> */}
        </section>
      </div>
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
