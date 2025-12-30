// import React from "react";
// import {
//   barfi,
//   hands_with_stairs_chat,
//   left_elem,
//   rays_webinars,
//   right_elem,
//   hands_with_webinars_card_full
// } from "../assets/images/Webinars";

// const Webinars = () => {
//   return (
//     <main className="bg-evolve-yellow">
//       {/* Wrapper for the entire hero section */}
//       <div className="relative overflow-hidden">
//         {/* Rays webinar SVG - z-10 (lowest) */}
//         <img
//           src={rays_webinars}
//           alt="rays background"
//           className="absolute inset-x-0 top-0 mx-auto object-contain z-10 pointer-events-none"
//         />

//         {/* Left element - starts at 10vh, stretches to bottom of grid */}
//         <div className="absolute left-0 top-0 bottom-0 z-20 pointer-events-none pt-[10vh] h-[90%]">
//           {/* <div className="absolute left-0 top-0 bottom-0 z-20 pointer-events-none pt-[10vh]"> */}
//           <img
//             src={left_elem}
//             alt="left element"
//             className="h-full w-auto object-cover object-top"
//             // className="h-full w-auto object-cover object-top"
//           />
//         </div>

//         {/* Right element - starts at 10vh, stretches to bottom of grid */}
//         <div className="absolute right-0 top-0 bottom-0 z-20 pointer-events-none pt-[10vh] h-[90%]">
//           {/* <div className="absolute right-0 top-0 bottom-0 z-20 pointer-events-none pt-[10vh]"> */}
//           <img
//             src={right_elem}
//             alt="right element"
//             className="h-full w-auto object-cover object-top"
//             // className="w-auto object-cover object-top"
//           />
//         </div>

//         {/* Content sections */}
//         <section className="relative">
//           {/* First viewport content */}
//           <div className="relative min-h-screen">
//             {/* Barfi - z-20, centered and moved down */}
//             <div className="absolute inset-0 flex items-center justify-center z-20 pt-20">
//               <div className="relative flex flex-col items-center text-center">
//                 <img src={barfi} alt="barfi" className="relative w-[90%]" />

//                 {/* Text inside Barfi - z-30 */}
//                 <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-16">
//                   <h1
//                     className="text-evolve-pink font-extrabold lowercase"
//                     style={{
//                       fontSize: "128px",
//                       lineHeight: "110px",
//                       letterSpacing: "-0.03em"
//                     }}
//                   >
//                     evolve <br /> webinars
//                   </h1>

//                   <p
//                     className="mt-6 font-bold lowercase text-black"
//                     style={{ fontSize: "40px" }}
//                   >
//                     Free. Forever. Worth Your Time.
//                   </p>

//                   <p
//                     className="mt-4 font-normal lowercase text-black leading-tight"
//                     style={{ fontSize: "32px" }}
//                   >
//                     Learn from people who've been there,
//                     <br />
//                     done that, and have the work to prove it.
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Hands with stairs - z-40, bottom of screen */}
//             <img
//               src={hands_with_stairs_chat}
//               alt="hands with stairs chat"
//               className="absolute bottom-0 inset-x-0 mx-auto z-40 w-full pointer-events-none"
//             />
//           </div>

//           {/* Second part - below hands-with-stairs */}
//           <div className="relative z-30 py-16">
//             {/* "upcoming webinar" text */}
//             <div className="flex justify-center mb-12">
//               <h2
//                 className="lowercase font-extrabold text-black"
//                 style={{
//                   fontSize: "96px",
//                   lineHeight: "96px",
//                   letterSpacing: "0"
//                 }}
//               >
//                 upcoming webinar
//               </h2>
//             </div>

//             {/* Webinar card SVG */}
//             <div>
//               <img
//                 src={hands_with_webinars_card_full}
//                 alt="webinar card"
//                 className="w-screen object-contain"
//               />
//             </div>
//           </div>
//         </section>
//       </div>
//       {/* Left/right arches end here because the wrapper div ends here */}

//       {/* Past Webinars Section */}
//       <section className="relative bg-evolve-yellow px-16 py-20">
//         {/* Description text */}
//         <p
//           className="text-black font-semibold text-center mb-16 leading-tight max-w-[90vw]"
//           style={{ fontSize: "32px" }}
//         >
//           Real talk from working professionals. Practical takeaways you can use
//           immediately. Every session is recorded, so you never miss out.
//         </p>

//         {/* Webinar cards grid - 4 horizontal boxes */}
//         <div className="grid grid-cols-4 gap-2 max-w-[95vw] mx-auto">
//           {/* Card 1 */}
//           <div className="rounded-[70px] overflow-hidden border-2 border-evolve-yellow">
//             {/* Top 60% - Black */}
//             <div className="bg-black h-[60%] min-h-[240px]"></div>
//             {/* Divider line */}
//             <div className="h-0.5 bg-evolve-yellow"></div>
//             {/* Bottom 40% - Pink */}
//             <div className="bg-evolve-pink h-[40%] min-h-[160px]"></div>
//           </div>

//           {/* Card 2 */}
//           <div className="rounded-[70px] overflow-hidden border-2 border-evolve-yellow">
//             {/* Top 60% - Black */}
//             <div className="bg-black h-[60%] min-h-[240px]"></div>
//             {/* Divider line */}
//             <div className="h-0.5 bg-evolve-yellow"></div>
//             {/* Bottom 40% - Pink */}
//             <div className="bg-evolve-pink h-[40%] min-h-[160px]"></div>
//           </div>

//           {/* Card 3 */}
//           <div className="rounded-[70px] overflow-hidden border-2 border-evolve-yellow">
//             {/* Top 60% - Black */}
//             <div className="bg-black h-[60%] min-h-[240px]"></div>
//             {/* Divider line */}
//             <div className="h-0.5 bg-evolve-yellow"></div>
//             {/* Bottom 40% - Pink */}
//             <div className="bg-evolve-pink h-[40%] min-h-[160px]"></div>
//           </div>

//           {/* Card 4 */}
//           <div className="rounded-[70px] overflow-hidden border-2 border-evolve-yellow">
//             {/* Top 60% - Black */}
//             <div className="bg-black h-[60%] min-h-[240px]"></div>
//             {/* Divider line */}
//             <div className="h-0.5 bg-evolve-yellow"></div>
//             {/* Bottom 40% - Pink */}
//             <div className="bg-evolve-pink h-[40%] min-h-[160px]"></div>
//           </div>
//         </div>
//       </section>
//     </main>
//   );
// };

// export default Webinars;

// import React, { useState } from "react";
// import {
// barfi,
// hands_with_stairs_chat,
// hands_with_stairs_chat_full,
// left_elem,
// rays_webinars,
// right_elem,
// hands_with_webinars_card_full,
// visual_design,
// interaction_design,
// career_growth,
// hobbies,
// watch_playlist_button
// } from "../assets/images/Webinars";

import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
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
  watch_playlist_button
} from "../assets/images/Webinars";

gsap.registerPlugin(ScrollTrigger);

// Reusable Card Component
const WebinarCard = ({ svg, title, isExpanded, onToggle }) => {
  return (
    <div
      className={`
        rounded-[70px] overflow-hidden border-2 border-evolve-yellow 
        transition-all duration-500 ease-in-out cursor-pointer
        ${isExpanded ? "scale-y-110" : "scale-y-100"}
      `}
      onMouseEnter={() => !("ontouchstart" in window) && onToggle(true)}
      onMouseLeave={() => !("ontouchstart" in window) && onToggle(false)}
      onClick={() => "ontouchstart" in window && onToggle(!isExpanded)}
    >
      {/* Top 60% - Black with SVG */}
      <div className="bg-black h-[60%] min-h-[240px] flex items-center justify-center">
        <img src={svg} alt={title} className="w-full h-full object-cover" />
      </div>

      {/* Divider line */}
      <div className="h-0.5 bg-evolve-yellow"></div>

      {/* Bottom 40% - Pink with text and button */}
      <div
        className={`
        bg-evolve-pink h-[40%] min-h-[160px] flex flex-col items-center justify-center
        transition-all duration-500 ease-in-out
        ${isExpanded ? "pt-6 pb-8" : "py-0"}
      `}
      >
        <h3
          className={`
            font-extrabold lowercase text-white text-center
            transition-all duration-500 ease-in-out text-5xl
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

        {/* Button - appears on expand */}
        <div
          className={`
          mt-6 transition-all duration-500 ease-in-out
          ${
            isExpanded
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-4 pointer-events-none"
          }
        `}
        >
          <img
            src={watch_playlist_button}
            alt="watch playlist"
            className="h-12 w-auto"
          />
        </div>
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
          className="font-extrabold lowercase text-black text-center"
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
        <p
          className="text-black font-semibold text-center mx-auto max-w-[85vw]"
          style={{ fontSize: "20px" }}
        >
          Real talk from working professionals. Practical takeaways you can use
          immediately. Every session is recorded, so you never miss out.
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
                className="font-extrabold lowercase text-white text-center"
                style={{ fontSize: "40px", lineHeight: "36px" }}
                dangerouslySetInnerHTML={{ __html: card.title }}
              />
              <img src={watch_playlist_button} className="mt-6 h-12" alt="" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const Webinars = () => {
  const [expandedCard, setExpandedCard] = useState(null);
  const [currentMobileCard, setCurrentMobileCard] = useState(0);

  const cards = [
    { svg: visual_design, title: "visual<br/>design" },
    { svg: interaction_design, title: "interaction<br/>design" },
    { svg: career_growth, title: "career<br/>growth" },
    { svg: hobbies, title: "hobbies" }
  ];

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
      {/* Desktop/Tablet View */}
      <div className="hidden md:block">
        {/* Wrapper for the entire hero section */}
        <div className="relative overflow-hidden">
          {/* Rays webinar SVG - z-10 (lowest) */}
          <img
            src={rays_webinars}
            alt="rays background"
            className="absolute inset-x-0 top-0 mx-auto object-contain z-10 pointer-events-none"
          />

          {/* Left element - starts at 10vh, stretches to bottom of grid */}
          <div className="absolute left-0 top-0 bottom-0 z-20 pointer-events-none pt-[10vh] h-[90%]">
            {/* <div className="absolute right-0 top-0 bottom-0 z-20 pointer-events-none pt-[10vh]"> */}
            <img
              src={left_elem}
              alt="left element"
              className="h-full w-auto object-cover object-top"
              // className="w-auto object-cover object-top"
            />
          </div>

          {/* Right element - starts at 10vh, stretches to bottom of grid */}
          <div className="absolute right-0 top-0 bottom-0 z-20 pointer-events-none pt-[10vh] h-[90%]">
            {/* <div className="absolute right-0 top-0 bottom-0 z-20 pointer-events-none pt-[10vh]"> */}
            <img
              src={right_elem}
              alt="right element"
              className="h-full w-auto object-cover object-top"
              // className="w-auto object-cover object-top"
            />
          </div>

          {/* Content sections */}
          <section className="relative">
            {/* First viewport content */}
            <div className="relative min-h-screen">
              {/* Barfi - z-20, centered and moved down */}
              <div className="absolute inset-0 flex items-center justify-center z-20 pt-20">
                <div className="relative flex flex-col items-center text-center">
                  <img src={barfi} alt="barfi" className="relative w-[85%]" />

                  {/* Text inside Barfi - z-30 */}
                  {/* <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-16"> */}
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-16 top-[-15%]">
                    <h1
                      className="text-evolve-pink font-extrabold lowercase"
                      style={{
                        fontSize: "108px",
                        lineHeight: "100px",
                        letterSpacing: "-0.03em"
                      }}
                    >
                      evolve <br /> webinars
                    </h1>

                    <p
                      className="mt-6 font-bold lowercase text-black"
                      style={{ fontSize: "38px" }}
                    >
                      Free. Forever. Worth Your Time.
                    </p>

                    <p
                      className="mt-4 font-normal lowercase text-black leading-tight"
                      style={{ fontSize: "28px" }}
                    >
                      Learn from people who've been there,
                      <br />
                      done that, and have the work to prove it.
                    </p>
                  </div>
                </div>
              </div>

              {/* Hands with stairs - z-40, bottom of screen */}
              <img
                src={hands_with_stairs_chat_full}
                alt="hands with stairs chat"
                className="absolute -bottom-0 inset-x-0 mx-auto z-40 pointer-events-none w-[100%]"
              />
            </div>

            {/* Second part - below hands-with-stairs */}
            <div className="relative z-30 py-16">
              {/* "upcoming webinar" text */}
              <div className="flex justify-center mb-12">
                <h2
                  className="lowercase font-extrabold text-black"
                  style={{
                    fontSize: "96px",
                    lineHeight: "96px",
                    letterSpacing: "0"
                  }}
                >
                  upcoming webinar
                </h2>
              </div>

              {/* Webinar card SVG */}
              <div>
                <img
                  src={hands_with_webinars_card_full}
                  alt="webinar card"
                  className="w-screen object-contain"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Past Webinars Section - Desktop */}
        <section className="relative bg-evolve-yellow px-16 py-20">
          {/* Description text with max-width */}
          <div className="flex justify-center mb-12">
            <p
              className="text-black font-semibold text-center leading-tight max-w-[80vw]"
              style={{ fontSize: "32px" }}
            >
              Real talk from working professionals. Practical takeaways you can
              use immediately. Every session is recorded, so you never miss out.
            </p>
          </div>

          {/* Webinar cards grid - 4 horizontal boxes */}
          <div className="grid grid-cols-4 gap-2 max-w-[85vw] h-[65vh] mx-auto">
            {cards.map((card, index) => (
              <WebinarCard
                key={index}
                svg={card.svg}
                title={card.title}
                isExpanded={expandedCard === index}
                onToggle={(expand) => handleCardToggle(index, expand)}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Mobile View */}
      {/* ================= MOBILE VIEW ================= */}
      <div className="block md:hidden overflow-hidden bg-evolve-yellow">
        {/* ---------- PAGE 1 : HERO (2 screens) ---------- */}
        <section className="relative min-h-screen">
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

          {/* Side elements */}
          <img
            src={left_elem_mobile}
            className="absolute left-0 top-[30%] z-30 w-auto"
            alt=""
          />
          <img
            src={right_elem_mobile}
            className="absolute right-0 top-[30%] z-30"
            alt=""
          />

          {/* Texts inside barfi */}
          <div className="absolute top-[10vh] inset-x-0 z-40 flex justify-center">
            <div className="w-[90%] text-center pt-16 px-6">
              <h1
                className="text-evolve-pink font-extrabold lowercase"
                style={{
                  fontSize: "64px",
                  lineHeight: "58px",
                  letterSpacing: "-0.03em"
                }}
              >
                evolve <br /> webinars
              </h1>

              <p
                className="mt-4 font-bold text-black"
                style={{ fontSize: "20px" }}
              >
                Free. Forever. Worth Your Time.
              </p>

              <p
                className="mt-3 font-normal text-center text-black mx-auto max-w-[70vw]"
                style={{ fontSize: "20px" }}
              >
                Learn from people who've been there, done that, and have the
                work to prove it.
              </p>
            </div>
          </div>

          {/* Hands chat (top layer) */}
          <img
            src={hands_with_stairs_chat_full_mobile}
            className="absolute -bottom-10 inset-x-0 z-30 w-full"
            alt=""
          />
        </section>

        {/* ---------- PAGE 1 : UPCOMING ---------- */}
        <section className="relative z-40 pt-32 pb-20 text-center">
          <h2
            className="font-extrabold lowercase text-black"
            style={{
              fontSize: "32px",
              lineHeight: "32px"
            }}
          >
            upcoming
            <br /> webinar
          </h2>

          <img
            src={hands_with_webinars_card_full_mobile}
            className="w-full mt-10"
            alt=""
          />
        </section>

        {/* ---------- PAGE 2 : PAST WEBINARS ---------- */}
        <MobilePinnedCards cards={cards} />
      </div>
    </main>
  );
};

export default Webinars;
