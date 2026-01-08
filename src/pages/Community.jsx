// import React, { useState } from "react";

// import {
//   rays_community,
//   rays_community_mobile,
//   doors_community,
//   doors_community_mobile,
//   left_hand_community,
//   right_hand_community,
//   left_hand_community_mobile,
//   right_hand_community_mobile
// } from "../assets/images/Community";

// import { join_us_button, join_us_button_hover } from "../assets/images/Home";

// const Community = () => {
//   const [hover, setHover] = useState(false);

//   return (
// <section className="relative min-h-screen bg-evolve-yellow overflow-hidden">
//   {/* ---------------- Rays Background ---------------- */}
//   {/* Desktop */}
//   <img
//     src={rays_community}
//     alt="rays"
//     className="hidden md:block absolute inset-0 w-full h-full object-cover z-0"
//   />

//   {/* Mobile */}
//   <img
//     src={rays_community_mobile}
//     alt="rays mobile"
//     className="md:hidden absolute inset-0 w-full h-full object-cover z-0"
//   />

//   {/* ---------------- Doors Bottom Layer ---------------- */}
//   {/* Desktop */}
//   <img
//     src={doors_community}
//     alt="doors"
//     className="hidden md:block absolute bottom-0 w-full z-10
//                 object-contain"
//   />

//   {/* Mobile */}
//   <img
//     src={doors_community_mobile}
//     alt="doors mobile"
//     className="md:hidden absolute bottom-0 w-full z-10
//               object-contain"
//   />

//   {/* ---------------- Hands (Above Doors) ---------------- */}
//   {/* Desktop */}
//   <img
//     src={left_hand_community}
//     alt="left hand"
//     className="hidden md:block absolute left-0 bottom-[0%] z-20
//              max-w-[320px]"
//   />

//   <img
//     src={right_hand_community}
//     alt="right hand"
//     className="hidden md:block absolute right-0 bottom-[3%] z-20
//                max-w-[320px]"
//   />

//   {/* Mobile */}
//   <img
//     src={left_hand_community_mobile}
//     alt="left hand mobile"
//     className="md:hidden absolute left-0 bottom-[0%] z-20
//                max-w-[200px]"
//   />

//   <img
//     src={right_hand_community_mobile}
//     alt="right hand mobile"
//     className="md:hidden absolute right-0 bottom-[0%] z-20
//                max-w-[200px]"
//   />

//   {/* ---------------- Center Content ---------------- */}
//   <div
//     className="absolute inset-x-0 z-30 flex flex-col items-center text-center px-4
//     top-[clamp(80px,10vh,160px)]
//     md:top-[clamp(100px,18vh,220px)]"
//   >
//     {/* Heading */}
//     <h1
//       className="font-extrabold lowercase text-evolve-pink"
//       style={{
//         fontSize: "clamp(64px, 8vw, 128px)",
//         lineHeight: "clamp(48px, 7vw, 110px)",
//         letterSpacing: "-0.03em"
//       }}
//     >
//       evolve <br /> community
//     </h1>

//     {/* Sub text */}
//     <p
//       className="mt-6 font-bold lowercase text-black max-w-[80vw]"
//       style={{
//         fontSize: "clamp(20px, 2.5vw, 32px)",
//         lineHeight: "clamp(28px, 3vw, 36px)"
//       }}
//     >
//       not a forum. not a feed! <br />
//       an inner circle built for creators.
//     </p>

//     {/* Button */}
//     <div
//       className="mt-8 cursor-pointer"
//       onMouseEnter={() => setHover(true)}
//       onMouseLeave={() => setHover(false)}
//     >
//       <img
//         src={hover ? join_us_button_hover : join_us_button}
//         alt="join us"
//         className="w-[200px] md:w-[240px]"
//       />
//     </div>
//   </div>
// </section>
//   );
// };

// export default Community;

// import React, { useState, useRef, useEffect } from "react";
// import {
//   rays_community,
//   rays_community_mobile,
//   doors_community,
//   doors_community_mobile,
//   left_hand_community,
//   right_hand_community,
//   left_hand_community_mobile,
//   right_hand_community_mobile
// } from "../assets/images/Community";
// import { join_us_button, join_us_button_hover } from "../assets/images/Home";
// const Community = () => {
//   const [hover, setHover] = useState(false);
//   const [scrollProgress, setScrollProgress] = useState(0);
//   const containerRef = useRef(null);
//   const cards = [
//     {
//       id: 0,
//       title: "ama sessions",
//       subtitle: "ask me anything.",
//       description:
//         'from "how do i start?" to "am i doing this right?", get real answers from designers who\'ve lived it.'
//     },
//     {
//       id: 1,
//       title: "portfolio reviews",
//       subtitle: "get honest feedback.",
//       description:
//         "submit your work and get constructive critique from experienced designers who know what works."
//     },
//     {
//       id: 2,
//       title: "challenges",
//       subtitle: "skill-building projects.",
//       description:
//         "weekly design challenges to push your creativity and build portfolio-worthy work."
//     },
//     {
//       id: 3,
//       title: "skill workshops",
//       subtitle: "level up together.",
//       description:
//         "hands-on workshops covering everything from UI patterns to design systems."
//     },
//     {
//       id: 4,
//       title: "resource library",
//       subtitle: "curated knowledge.",
//       description:
//         "access templates, guides, and tools handpicked by the community."
//     }
//   ];

//   const [vh, setVh] = useState(
//     typeof window !== "undefined" ? window.innerHeight : 800
//   );

//   useEffect(() => {
//     const onResize = () => setVh(window.innerHeight);
//     window.addEventListener("resize", onResize);
//     return () => window.removeEventListener("resize", onResize);
//   }, []);

//   useEffect(() => {
//     const handleScroll = () => {
//       if (containerRef.current) {
//         const container = containerRef.current;
//         const rect = container.getBoundingClientRect();
//         const scrollHeight = container.scrollHeight - window.innerHeight;
//         const scrolled = -rect.top;
//         const progress = Math.max(0, Math.min(scrolled / scrollHeight, 1));
//         setScrollProgress(progress);
//       }
//     };

//     window.addEventListener("scroll", handleScroll);
//     handleScroll();
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   // Calculate which card is being pulled
//   const totalCards = cards.length;
//   const cardProgress = scrollProgress * totalCards;
//   const currentCardIndex = Math.min(Math.floor(cardProgress), totalCards - 1);
//   const pullProgress = cardProgress - currentCardIndex;

//   return (
//     <>
//       {/* ================= HERO ================= */}
//       <section className="relative min-h-screen bg-evolve-yellow overflow-hidden">
//         <img
//           src={rays_community}
//           className="hidden md:block absolute inset-0 w-full h-full object-cover"
//           alt=""
//         />
//         <img
//           src={rays_community_mobile}
//           className="md:hidden absolute inset-0 w-full h-full object-cover"
//           alt=""
//         />
//         <img
//           src={doors_community}
//           className="hidden md:block absolute bottom-0 w-full z-10"
//           alt=""
//         />
//         <img
//           src={doors_community_mobile}
//           className="md:hidden absolute bottom-0 w-full z-10"
//           alt=""
//         />

//         <img
//           src={left_hand_community}
//           className="hidden md:block absolute left-0 bottom-0 z-20 max-w-[320px]"
//           alt=""
//         />
//         <img
//           src={right_hand_community}
//           className="hidden md:block absolute right-0 bottom-[3%] z-20 max-w-[320px]"
//           alt=""
//         />

//         <img
//           src={left_hand_community_mobile}
//           className="md:hidden absolute left-0 bottom-0 z-20 max-w-[200px]"
//           alt=""
//         />
//         <img
//           src={right_hand_community_mobile}
//           className="md:hidden absolute right-0 bottom-0 z-20 max-w-[200px]"
//           alt=""
//         />

//         <div className="absolute inset-x-0 top-[18vh] z-30 text-center px-4">
//           <h1
//             className="font-extrabold lowercase text-evolve-pink"
//             style={{
//               fontSize: "clamp(64px, 8vw, 128px)",
//               lineHeight: "0.9",
//               letterSpacing: "-0.03em"
//             }}
//           >
//             evolve <br /> community
//           </h1>

//           <p className="mt-6 font-bold lowercase text-black max-w-[80vw] mx-auto text-[clamp(20px,2.5vw,32px)]">
//             not a forum. not a feed. <br />
//             an inner circle built for creators.
//           </p>

//           <div
//             className="mt-8 inline-block cursor-pointer"
//             onMouseEnter={() => setHover(true)}
//             onMouseLeave={() => setHover(false)}
//           >
//             <img
//               src={hover ? join_us_button_hover : join_us_button}
//               alt=""
//               className="w-[220px]"
//             />
//           </div>
//         </div>
//       </section>

//       {/* ================= STACK ================= */}
//       <section
//         ref={containerRef}
//         className="relative bg-evolve-yellow"
//         style={{ height: `${(totalCards + 1) * 100}vh` }}
//       >
//         <div className="sticky top-0 h-screen overflow-hidden">
//           {/* HEADER */}
//           <div
//             className="pt-14 text-center px-4 relative"
//             style={{ zIndex: 5 }}
//           >
//             <h2 className="font-extrabold lowercase text-black text-[clamp(40px,5vw,80px)] leading-tight">
//               inside the community circle
//             </h2>
//             <p className="mt-4 max-w-4xl mx-auto text-lg md:text-xl text-black">
//               the 'evolve' community is not a place where ideas sit pretty. it's
//               your space to ask bold questions, trade war stories, learn from
//               real people, and build skills that stick for life.
//             </p>
//           </div>

//           {/* ALL CARDS */}
//           <div
//             className="absolute left-0 right-0 -bottom-5"
//             // style={{ bottom: "0px" }}
//           >
//             <div
//               className="relative w-full"
//               style={{ height: "calc(100vh - 40px)" }}
//             >
//               {cards.map((card, cardIndex) => {
//                 const STACK_SIZE = 4;
//                 const GAP = 100;
//                 const CARD_HEIGHT = 160;

//                 const leadIndex = currentCardIndex;
//                 const followIndex = currentCardIndex - 1;

//                 // Determine if this card has been pulled yet
//                 // const hasBeenPulled = cardIndex < currentCardIndex;
//                 // const isBeingPulled = cardIndex === currentCardIndex;
//                 const isBeingPulled =
//                   cardIndex === currentCardIndex && pullProgress > 0;

//                 const isInStack = cardIndex > currentCardIndex;

//                 // Calculate stack position (0 = front of stack)
//                 const stackPosition = cardIndex - currentCardIndex;
//                 const isVisibleInStack =
//                   stackPosition >= 0 && stackPosition < STACK_SIZE;

//                 let style = {};

//                 if (cardIndex === followIndex && pullProgress < 1) {
//                   // FOLLOWING CARD (connected)
//                   style = {
//                     bottom: `${pullProgress * vh}px`,
//                     opacity: 1,
//                     zIndex: 25,
//                     pointerEvents: "none"
//                   };
//                 } else if (cardIndex === leadIndex) {
//                   // LEADING CARD
//                   const startYOffset = (STACK_SIZE - 1) * GAP;

//                   style = {
//                     bottom: `${startYOffset + pullProgress * vh}px`,
//                     opacity: 1,
//                     zIndex: 30,
//                     pointerEvents: pullProgress > 0.3 ? "auto" : "none"
//                   };
//                 } else if (cardIndex > leadIndex && isVisibleInStack) {
//                   // STACKED CARDS
//                   const reverseStackPosition = STACK_SIZE - 1 - stackPosition;
//                   const yOffset = reverseStackPosition * GAP;

//                   style = {
//                     bottom: `${yOffset}px`,
//                     opacity: 1,
//                     zIndex: 10 + stackPosition,
//                     pointerEvents: "none"
//                   };
//                 } else {
//                   // FULLY GONE (only when TWO cards have progressed)
//                   style = {
//                     bottom: `${vh + 200}px`,
//                     opacity: 0,
//                     zIndex: 1,
//                     pointerEvents: "none"
//                   };
//                 }

//                 // Show full card content when being pulled, otherwise show header only
//                 const showFullContent = isBeingPulled && pullProgress > 0.2;

//                 return (
//                   <div
//                     key={card.id}
//                     className="absolute left-0 right-0 bg-evolve-yellow border-t border-evolve-pink rounded-t-lg transition-all border-opacity-10 duration-500"
//                     style={{
//                       ...style,
//                       height: showFullContent ? "auto" : `${CARD_HEIGHT}px`,
//                       maxHeight: showFullContent ? "80vh" : `${CARD_HEIGHT}px`,
//                       overflow: "hidden",
//                       boxShadow: "0 -2px 12px rgba(0,0,0,0.15)"
//                     }}
//                   >
//                     {showFullContent ? (
//                       <div className="p-8 md:p-12 text-center">
//                         <h3
//                           className="font-extrabold lowercase mb-3"
//                           style={{
//                             fontSize: "clamp(48px, 6vw, 96px)",
//                             lineHeight: "0.95",
//                             color: "#EC4899"
//                           }}
//                         >
//                           {card.title}
//                         </h3>
//                         <p className="text-2xl md:text-3xl font-bold lowercase text-black mb-4">
//                           {card.subtitle}
//                         </p>
//                         <p className="text-lg md:text-xl text-black max-w-3xl mx-auto">
//                           {card.description}
//                         </p>
//                       </div>
//                     ) : (
//                       <div className="px-4 md:px-12 pt-8 text-center">
//                         <h4
//                           className="font-extrabold lowercase"
//                           style={{
//                             color: "#EC4899",
//                             opacity: 0.7,
//                             fontSize: "clamp(32px, 4vw, 64px)",
//                             lineHeight: "1.1"
//                           }}
//                         >
//                           {card.title}
//                         </h4>
//                       </div>
//                     )}
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       </section>
//     </>
//   );
// };
// export default Community;

// import React, { useState, useRef, useEffect } from "react";
// import {
//   rays_community,
//   rays_community_mobile,
//   doors_community,
//   doors_community_mobile,
//   left_hand_community,
//   right_hand_community,
//   left_hand_community_mobile,
//   right_hand_community_mobile
// } from "../assets/images/Community";
// import { join_us_button, join_us_button_hover } from "../assets/images/Home";
// const Community = () => {
//   const [hover, setHover] = useState(false);
//   const [scrollProgress, setScrollProgress] = useState(0);
//   const containerRef = useRef(null);
//   const cards = [
//     {
//       id: 0,
//       title: "ama sessions",
//       subtitle: "ask me anything.",
//       description:
//         'from "how do i start?" to "am i doing this right?", get real answers from designers who\'ve lived it.'
//     },
//     {
//       id: 1,
//       title: "portfolio reviews",
//       subtitle: "get honest feedback.",
//       description:
//         "submit your work and get constructive critique from experienced designers who know what works."
//     },
//     {
//       id: 2,
//       title: "challenges",
//       subtitle: "skill-building projects.",
//       description:
//         "weekly design challenges to push your creativity and build portfolio-worthy work."
//     },
//     {
//       id: 3,
//       title: "skill workshops",
//       subtitle: "level up together.",
//       description:
//         "hands-on workshops covering everything from UI patterns to design systems."
//     },
//     {
//       id: 4,
//       title: "resource library",
//       subtitle: "curated knowledge.",
//       description:
//         "access templates, guides, and tools handpicked by the community."
//     }
//   ];

//   const [vh, setVh] = useState(
//     typeof window !== "undefined" ? window.innerHeight : 800
//   );

//   useEffect(() => {
//     const onResize = () => setVh(window.innerHeight);
//     window.addEventListener("resize", onResize);
//     return () => window.removeEventListener("resize", onResize);
//   }, []);

//   useEffect(() => {
//     const handleScroll = () => {
//       if (containerRef.current) {
//         const container = containerRef.current;
//         const rect = container.getBoundingClientRect();
//         const scrollHeight = container.scrollHeight - window.innerHeight;
//         const scrolled = -rect.top;
//         const progress = Math.max(0, Math.min(scrolled / scrollHeight, 1));
//         setScrollProgress(progress);
//       }
//     };

//     window.addEventListener("scroll", handleScroll);
//     handleScroll();
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   // Calculate which card is being pulled
//   const totalCards = cards.length;
//   const cardProgress = scrollProgress * totalCards;
//   const currentCardIndex = Math.min(Math.floor(cardProgress), totalCards - 1);
//   const pullProgress = cardProgress - currentCardIndex;

//   return (
//     <>
//       {/* ================= HERO ================= */}
//       <section className="relative min-h-screen bg-evolve-yellow overflow-hidden">
//         <img
//           src={rays_community}
//           className="hidden md:block absolute inset-0 w-full h-full object-cover"
//           alt=""
//         />
//         <img
//           src={rays_community_mobile}
//           className="md:hidden absolute inset-0 w-full h-full object-cover"
//           alt=""
//         />
//         <img
//           src={doors_community}
//           className="hidden md:block absolute bottom-0 w-full z-10"
//           alt=""
//         />
//         <img
//           src={doors_community_mobile}
//           className="md:hidden absolute bottom-0 w-full z-10"
//           alt=""
//         />

//         <img
//           src={left_hand_community}
//           className="hidden md:block absolute left-0 bottom-0 z-20 max-w-[320px]"
//           alt=""
//         />
//         <img
//           src={right_hand_community}
//           className="hidden md:block absolute right-0 bottom-[3%] z-20 max-w-[320px]"
//           alt=""
//         />

//         <img
//           src={left_hand_community_mobile}
//           className="md:hidden absolute left-0 bottom-0 z-20 max-w-[200px]"
//           alt=""
//         />
//         <img
//           src={right_hand_community_mobile}
//           className="md:hidden absolute right-0 bottom-0 z-20 max-w-[200px]"
//           alt=""
//         />

//         <div className="absolute inset-x-0 top-[18vh] z-30 text-center px-4">
//           <h1
//             className="font-extrabold lowercase text-evolve-pink"
//             style={{
//               fontSize: "clamp(64px, 8vw, 128px)",
//               lineHeight: "0.9",
//               letterSpacing: "-0.03em"
//             }}
//           >
//             evolve <br /> community
//           </h1>

//           <p className="mt-6 font-bold lowercase text-black max-w-[80vw] mx-auto text-[clamp(20px,2.5vw,32px)]">
//             not a forum. not a feed. <br />
//             an inner circle built for creators.
//           </p>

//           <div
//             className="mt-8 inline-block cursor-pointer"
//             onMouseEnter={() => setHover(true)}
//             onMouseLeave={() => setHover(false)}
//           >
//             <img
//               src={hover ? join_us_button_hover : join_us_button}
//               alt=""
//               className="w-[220px]"
//             />
//           </div>
//         </div>
//       </section>

//       {/* ================= STACK ================= */}
//       <section
//         ref={containerRef}
//         className="relative bg-evolve-yellow"
//         style={{ height: `${(totalCards + 1) * 100}vh` }}
//       >
//         <div className="sticky top-0 h-screen overflow-hidden">
//           {/* HEADER */}
//           <div
//             className="pt-14 text-center px-4 relative"
//             style={{ zIndex: 5 }}
//           >
//             <h2 className="font-extrabold lowercase text-black text-[clamp(40px,5vw,80px)] leading-tight">
//               inside the community circle
//             </h2>
//             <p className="mt-4 max-w-4xl mx-auto text-lg md:text-xl text-black">
//               the 'evolve' community is not a place where ideas sit pretty. it's
//               your space to ask bold questions, trade war stories, learn from
//               real people, and build skills that stick for life.
//             </p>
//           </div>

//           {/* ALL CARDS */}
//           <div
//             className="absolute left-0 right-0 -bottom-20"
//             // style={{ bottom: "0px" }}
//           >
//             <div
//               className="relative w-full"
//               style={{ height: "calc(100vh - 40px)" }}
//             >
//               {cards.map((card, cardIndex) => {
//                 const STACK_SIZE = 4;
//                 const GAP = 100;
//                 const CARD_HEIGHT = 200;

//                 // Determine if this card has been pulled yet
//                 const hasBeenPulled = cardIndex < currentCardIndex;
//                 // const isBeingPulled = cardIndex === currentCardIndex;
//                 const isBeingPulled =
//                   cardIndex === currentCardIndex && pullProgress > 0;

//                 const isInStack = cardIndex > currentCardIndex;

//                 // Calculate stack position (0 = front of stack)
//                 const stackPosition = cardIndex - currentCardIndex;
//                 const isVisibleInStack =
//                   stackPosition >= 0 && stackPosition < STACK_SIZE;

//                 let style = {};

//                 if (hasBeenPulled) {
//                   // Cards that have been pulled are hidden/off-screen
//                   style = {
//                     bottom: `calc(50vh + ${CARD_HEIGHT}px)`,
//                     opacity: 0,
//                     zIndex: 1,
//                     pointerEvents: "none"
//                   };
//                   // } else if (isBeingPulled) {
//                   //   // Card currently being pulled up
//                   //   const pullDistance =
//                   //     typeof window !== "undefined"
//                   //       ? window.innerHeight * 0.6
//                   //       : 600;
//                   //   const currentPull = pullProgress * pullDistance;

//                   //   style = {
//                   //     bottom: `${0 + currentPull}px`,
//                   //     opacity: 1,
//                   //     zIndex: 30,
//                   //     pointerEvents: pullProgress > 0.3 ? "auto" : "none"
//                   //   };
//                 } else if (isBeingPulled) {
//                   // Card currently being pulled up
//                   const pullDistance =
//                     typeof window !== "undefined"
//                       ? window.innerHeight * 0.6
//                       : 600;
//                   const currentPull = pullProgress * pullDistance;

//                   // Start from the back of the stack
//                   const startYOffset = (STACK_SIZE - 1) * GAP;

//                   style = {
//                     bottom: `${startYOffset + currentPull}px`,
//                     opacity: 1,
//                     zIndex: 30,
//                     pointerEvents: pullProgress > 0.3 ? "auto" : "none"
//                   };
//                   // } else if (isVisibleInStack) {
//                   //   // Cards in the visible stack
//                   //   const yOffset = stackPosition * GAP;

//                   //   style = {
//                   //     bottom: `${yOffset}px`,
//                   //     opacity: 1,
//                   //     zIndex: 20 - stackPosition,
//                   //     pointerEvents: "none"
//                   //   };
//                   // } else if (isVisibleInStack) {
//                   //   // Cards in the visible stack (reversed order)
//                   //   const reverseStackPosition = STACK_SIZE - 1 - stackPosition;
//                   //   const yOffset = reverseStackPosition * GAP;

//                   //   style = {
//                   //     bottom: `${yOffset}px`,
//                   //     opacity: 1,
//                   //     zIndex: 10 + stackPosition,
//                   //     pointerEvents: "none"
//                   //   };
//                 } else if (isVisibleInStack) {
//                   // Cards in the visible stack (reversed order)
//                   const reverseStackPosition = STACK_SIZE - 1 - stackPosition;
//                   const yOffset = reverseStackPosition * GAP;

//                   style = {
//                     bottom: `${yOffset}px`,
//                     opacity: 1,
//                     zIndex: 20 - reverseStackPosition,
//                     pointerEvents: "none"
//                   };
//                 } else {
//                   // Cards beyond visible stack
//                   style = {
//                     bottom: `${(STACK_SIZE - 1) * GAP}px`,
//                     opacity: 0,
//                     zIndex: 1,
//                     pointerEvents: "none"
//                   };
//                 }

//                 // Show full card content when being pulled, otherwise show header only
//                 const showFullContent = isBeingPulled && pullProgress > 0.2;

//                 return (
//                   <div
//                     key={card.id}
//                     className="absolute left-0 right-0 bg-evolve-yellow border-t border-evolve-pink rounded-t-lg transition-all duration-500"
//                     style={{
//                       ...style,
//                       height: showFullContent ? "auto" : `${CARD_HEIGHT}px`,
//                       maxHeight: showFullContent ? "80vh" : `${CARD_HEIGHT}px`,
//                       overflow: "hidden"
//                       // boxShadow: "0 -2px 12px rgba(0,0,0,0.15)"
//                     }}
//                   >
//                     {showFullContent ? (
//                       <div className="p-8 md:p-12 text-center">
//                         <h3
//                           className="font-extrabold lowercase mb-3"
//                           style={{
//                             fontSize: "clamp(48px, 6vw, 96px)",
//                             lineHeight: "0.95",
//                             color: "#EC4899"
//                           }}
//                         >
//                           {card.title}
//                         </h3>
//                         <p className="text-2xl md:text-3xl font-bold lowercase text-black mb-4">
//                           {card.subtitle}
//                         </p>
//                         <p className="text-lg md:text-xl text-black max-w-3xl mx-auto">
//                           {card.description}
//                         </p>
//                       </div>
//                     ) : (
//                       <div className="px-4 md:px-12 pt-8 text-center">
//                         <h4
//                           className="font-extrabold lowercase"
//                           style={{
//                             color: "#EC4899",
//                             opacity: 0.7,
//                             fontSize: "clamp(32px, 4vw, 64px)",
//                             lineHeight: "1.1"
//                           }}
//                         >
//                           {card.title}
//                         </h4>
//                       </div>
//                     )}
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       </section>
//     </>
//   );
// };
// export default Community;
// ============================================================================================
// import React, { useEffect, useRef, useState } from "react";
// import gsap from "gsap";
// import ScrollTrigger from "gsap/ScrollTrigger";

// import {
//   rays_community,
//   rays_community_mobile,
//   doors_community,
//   doors_community_mobile,
//   left_hand_community,
//   right_hand_community,
//   left_hand_community_mobile,
//   right_hand_community_mobile
// } from "../assets/images/Community";
// import { join_us_button, join_us_button_hover } from "../assets/images/Home";

// gsap.registerPlugin(ScrollTrigger);

// const Community = () => {
//   const [hover, setHover] = useState(false);

//   const stackSectionRef = useRef(null);
//   const cardRefs = useRef([]);

//   const cards = [
//     {
//       id: 0,
//       title: "ama sessions",
//       subtitle: "ask me anything.",
//       description:
//         'from "how do i start?" to "am i doing this right?", get real answers from designers who’ve lived it.'
//     },
//     {
//       id: 1,
//       title: "portfolio reviews",
//       subtitle: "get honest feedback.",
//       description:
//         "submit your work and get constructive critique from experienced designers who know what works."
//     },
//     {
//       id: 2,
//       title: "challenges",
//       subtitle: "skill-building projects.",
//       description:
//         "weekly design challenges to push your creativity and build portfolio-worthy work."
//     },
//     {
//       id: 3,
//       title: "skill workshops",
//       subtitle: "level up together.",
//       description:
//         "hands-on workshops covering everything from UI patterns to design systems."
//     },
//     {
//       id: 4,
//       title: "resource library",
//       subtitle: "curated knowledge.",
//       description:
//         "access templates, guides, and tools handpicked by the community."
//     }
//   ];

//   useEffect(() => {
//     const ctx = gsap.context(() => {
//       const cards = cardRefs.current;
//       const scrollPerCard = window.innerHeight * 2;

//       cards.forEach((card) => {
//         const content = card.querySelector(".card-content");
//         gsap.set(card, { height: 180 });
//         gsap.set(content, { opacity: 0 });
//       });

//       const tl = gsap.timeline({
//         scrollTrigger: {
//           trigger: stackSectionRef.current,
//           start: "top top",
//           end: `+=${cards.length * scrollPerCard}`,
//           scrub: true,
//           pin: true,
//           anticipatePin: 1,
//           invalidateOnRefresh: true
//         }
//       });

//       cards.forEach((card, index) => {
//         const content = card.querySelector(".card-content");

//         // Expand card
//         tl.to(card, {
//           height: "50vh",
//           duration: 1,
//           ease: "none"
//         });

//         // Show content
//         tl.to(
//           content,
//           {
//             opacity: 1,
//             duration: 0.5,
//             ease: "none"
//           },
//           "<0.3"
//         );

//         // Hold expanded state
//         tl.to({}, { duration: 1 });

//         // Collapse card (except for the last one)
//         if (index < cards.length - 1) {
//           tl.to(content, {
//             opacity: 0,
//             duration: 0.3,
//             ease: "none"
//           });

//           tl.to(
//             card,
//             {
//               height: 180,
//               duration: 0.8,
//               ease: "none"
//             },
//             "<"
//           );
//         }
//       });
//     }, stackSectionRef);

//     return () => ctx.revert();
//   }, []);

//   return (
//     <>
//       {/* ================= HERO (UNCHANGED) ================= */}
//       <section className="relative min-h-screen bg-evolve-yellow overflow-hidden">
//         <img
//           src={rays_community}
//           className="hidden md:block absolute inset-0 w-full h-full object-cover"
//         />
//         <img
//           src={rays_community_mobile}
//           className="md:hidden absolute inset-0 w-full h-full object-cover"
//         />

//         <img
//           src={doors_community}
//           className="hidden md:block absolute bottom-0 w-full z-10"
//         />
//         <img
//           src={doors_community_mobile}
//           className="md:hidden absolute bottom-0 w-full z-10"
//         />

//         <img
//           src={left_hand_community}
//           className="hidden md:block absolute left-0 bottom-0 z-20 max-w-[320px]"
//         />
//         <img
//           src={right_hand_community}
//           className="hidden md:block absolute right-0 bottom-[3%] z-20 max-w-[320px]"
//         />

//         <img
//           src={left_hand_community_mobile}
//           className="md:hidden absolute left-0 bottom-0 z-20 max-w-[200px]"
//         />
//         <img
//           src={right_hand_community_mobile}
//           className="md:hidden absolute right-0 bottom-0 z-20 max-w-[200px]"
//         />

//         <div className="absolute inset-x-0 top-[18vh] z-30 text-center px-4">
//           <h1
//             className="font-extrabold lowercase text-evolve-pink"
//             style={{
//               fontSize: "clamp(64px, 8vw, 128px)",
//               lineHeight: "0.9",
//               letterSpacing: "-0.03em"
//             }}
//           >
//             evolve <br /> community
//           </h1>

//           <p className="mt-6 font-bold lowercase text-black max-w-[80vw] mx-auto text-[clamp(20px,2.5vw,32px)]">
//             not a forum. not a feed. <br />
//             an inner circle built for creators.
//           </p>

//           <div
//             className="mt-8 inline-block cursor-pointer"
//             onMouseEnter={() => setHover(true)}
//             onMouseLeave={() => setHover(false)}
//           >
//             <img
//               src={hover ? join_us_button_hover : join_us_button}
//               className="w-[220px]"
//             />
//           </div>
//         </div>
//       </section>

//       {/* ================= HEADING (NORMAL SCROLL) ================= */}
//       <section className="bg-evolve-yellow pt-28 pb-24 text-center px-4">
//         <h2 className="font-extrabold lowercase text-black text-[clamp(40px,5vw,80px)]">
//           inside the community circle
//         </h2>
//         <p className="mt-6 max-w-4xl mx-auto text-lg md:text-xl text-black">
//           the evolve community is not a place where ideas sit pretty. it’s your
//           space to ask bold questions, trade war stories, and build skills that
//           stick for life.
//         </p>
//       </section>

//       {/* ================= CONNECTED STACK ================= */}
//       <section
//         ref={stackSectionRef}
//         className="relative bg-evolve-yellow"
//         // style={{ height: `${cards.length * 100}vh` }}
//       >
//         {/* <div className="sticky top-0 h-screen flex items-start justify-center pt-10"> */}
//         <div className="h-screen flex items-start justify-center pt-10">
//           <div className="relative w-full">
//             {cards.map((card, i) => (
//               <div
//                 key={card.id}
//                 ref={(el) => (cardRefs.current[i] = el)}
//                 className="bg-evolve-yellow border-t border-evolve-pink rounded-t-xl overflow-hidden"
//                 // className="absolute left-0 top-0 w-full bg-evolve-yellow border-t border-evolve-pink rounded-t-xl overflow-hidden"
//                 style={{
//                   marginTop: i === 0 ? 0 : -90, // 🔥 reduced gap
//                   zIndex: cards.length - i
//                 }}
//               >
//                 <div className="px-8 pt-6 text-center">
//                   <h3
//                     className="font-extrabold lowercase text-evolve-pink"
//                     style={{ fontSize: "clamp(32px,4vw,64px)" }}
//                   >
//                     {card.title}
//                   </h3>
//                 </div>

//                 <div className="card-content px-8 pb-12 text-center">
//                   <p className="text-2xl font-bold lowercase text-black">
//                     {card.subtitle}
//                   </p>
//                   <p className="mt-4 text-lg md:text-xl text-black max-w-3xl mx-auto">
//                     {card.description}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>
//     </>
//   );
// };

// export default Community;

// ==============================================================================================
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

import {
  rays_community,
  rays_community_mobile,
  doors_community,
  doors_community_mobile,
  left_hand_community,
  right_hand_community,
  left_hand_community_mobile,
  right_hand_community_mobile,
  card_1st,
  card_2nd,
  card_3rd_right_thunder,
  card_3rd_left_thunder,
  card_4th_3,
  card_4th_2,
  card_4th_1,
  card_5th_mobile,
  card_5th_right,
  card_5th_left
} from "../assets/images/Community";
import { join_us_button, join_us_button_hover } from "../assets/images/Home";

gsap.registerPlugin(ScrollTrigger);

const Community = () => {
  const [hover, setHover] = useState(false);

  const stackSectionRef = useRef(null);
  const cardRefs = useRef([]);

  const cards = [
    {
      id: 0,
      title: "ama sessions",
      subtitle: "ask me anything.",
      description:
        'from "how do i start?" to "am i doing this right?", get real answers from designers who\'ve lived it.',
      // Add your decorative images here - you can add multiple per card
      decorativeImages: [
        // DESKTOP
        {
          src: card_1st,
          className:
            "hidden md:block absolute bottom-[0%] right-[15%]  w-[15%] rotate-[-12deg]"
        },
        {
          src: card_1st,
          className:
            "hidden md:block absolute bottom-0 left-[14%] w-[12%] rotate-[28deg]"
        },
        {
          src: card_1st,
          className:
            "hidden md:block absolute top-[-20%] left-[30%] w-28 rotate-[18deg]"
        },
        {
          src: card_1st,
          className:
            "hidden md:block absolute top-[10%] right-[10%] w-20 rotate-[-20deg]"
        },

        // MOBILE
        {
          src: card_1st,
          className:
            "md:hidden absolute bottom-[-20%] left-[15%] w-20 rotate-[-12deg]"
        },
        {
          src: card_1st,
          className:
            "md:hidden absolute bottom-[-5%] right-[20%] w-16 rotate-[10deg]"
        },
        {
          src: card_1st,
          className:
            "md:hidden absolute bottom-[-55%] left-[40%] w-[42%] rotate-[36deg]"
        }
      ]
    },
    {
      id: 1,
      title: "portfolio reviews",
      subtitle: "feedback that stings (and sticks)",
      description:
        "Drop your work in. Paperclip/Evolve’s designers will break it down with you 1:1, then share the lessons (with your nod) so the whole crew learns.",
      decorativeImages: [
        // DESKTOP
        {
          src: card_2nd,
          className:
            "hidden md:block absolute bottom-[0%] right-[15%]  w-[15%] rotate-[-12deg]"
        },
        {
          src: card_2nd,
          className:
            "hidden md:block absolute bottom-0 left-[14%] w-[12%] rotate-[8deg]"
        },
        {
          src: card_2nd,
          className:
            "hidden md:block absolute top-[-20%] left-[30%] w-28 rotate-[18deg]"
        },
        {
          src: card_2nd,
          className:
            "hidden md:block absolute top-[10%] right-[10%] w-20 rotate-[-20deg]"
        },

        // MOBILE
        {
          src: card_2nd,
          className:
            "md:hidden absolute bottom-[-10%] left-[15%] w-[30%] rotate-[-12deg]"
        },
        {
          src: card_2nd,
          className:
            "md:hidden absolute bottom-[-5%] right-[20%] w-16 rotate-[10deg]"
        },
        {
          src: card_2nd,
          className:
            "md:hidden absolute bottom-[-25%] left-[40%] w-[42%] rotate-[6deg]"
        }
      ]
    },
    {
      id: 2,
      title: "challenges",
      subtitle: "push yourself in challenges.",
      description:
        "Take part in lightning round or creative art jam. Test your skills, stretch your creativity, and see how others tackle the same brief.",
      decorativeImages: [
        // DESKTOP
        {
          src: card_3rd_left_thunder,
          className:
            "hidden md:block absolute bottom-[-15%] left-[0%] w-[30%] rotate-[-8deg]"
        },
        {
          src: card_3rd_right_thunder,
          className:
            "hidden md:block absolute top-[-70%] right-[0%] w-[30%] rotate-[10deg]"
        },

        // MOBILE
        {
          src: card_3rd_left_thunder,
          className:
            "md:hidden absolute bottom-[-40%] left-[15%] w-32 rotate-[-10deg]"
        },
        {
          src: card_3rd_right_thunder,
          className:
            "md:hidden absolute bottom-[-30%] right-[15%] w-32 rotate-[12deg]"
        }
      ]
    },
    {
      id: 3,
      title: "resource library",
      subtitle: "get the good stuff, hand-picked.",
      description:
        "Access curated resources. the tools, articles, and recommendations that actually help you sharpen your craft.",
      decorativeImages: [
        // DESKTOP (positions of choice)
        {
          src: card_4th_1,
          className:
            "hidden md:block absolute top-[-35%] left-[20%] w-[6%] rotate-[-10deg]"
        },
        {
          src: card_4th_2,
          className:
            "hidden md:block absolute top-[10%] right-[15%] w-32 rotate-[12deg]"
        },
        {
          src: card_4th_3,
          className:
            "hidden md:block absolute bottom-[-10%] left-[15%] w-[10%] rotate-[18deg]"
        },
        {
          src: card_4th_1,
          className:
            "hidden md:block absolute bottom-[-5%] right-[25%] w-16 rotate-[44deg]"
        },

        // MOBILE
        {
          src: card_4th_1,
          className:
            "md:hidden absolute bottom-[-25%] left-[15%] w-[20%] rotate-[-12deg]"
        },
        {
          src: card_4th_2,
          className:
            "md:hidden absolute bottom-[-15%] right-[20%] w-12 rotate-[10deg]"
        },
        {
          src: card_4th_3,
          className:
            "md:hidden absolute bottom-[-40%] left-[40%] w-[32%] rotate-[6deg]"
        }
      ]
    },
    {
      id: 4,
      title: "bookclub",
      subtitle: "read.learn.repeat.",
      description:
        "Join the Book Club to dive into design classics and other must-reads. Weekly virtual meets keep it lively — expect spirited discussions, fresh takes, and a deeper grip on the ideas that shape design.",
      decorativeImages: [
        // DESKTOP
        {
          src: card_5th_left,
          className: "hidden md:block absolute left-0 bottom-0 w-[30%]"
        },
        {
          src: card_5th_right,
          className: "hidden md:block absolute right-0 bottom-0 w-[30%]"
        },

        // MOBILE
        {
          src: card_5th_mobile,
          className:
            "md:hidden absolute bottom-[-40%] left-1/2 -translate-x-1/2 w-[100%]"
        }
      ]
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = cardRefs.current;
      const scrollPerCard = window.innerHeight * 1.2; // Reduced scroll needed

      cards.forEach((card) => {
        const content = card.querySelector(".card-content");
        const stackTitle = card.querySelector(".card-stack-title");
        const decorativeImgs = card.querySelectorAll(".card-decorative-img");

        gsap.set(card, { height: 120 });
        gsap.set(content, { opacity: 0 });
        gsap.set(stackTitle, { opacity: 0.5 });
        gsap.set(decorativeImgs, { opacity: 0, scale: 0.9 });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stackSectionRef.current,
          start: "top top",
          end: `+=${cards.length * scrollPerCard}`,
          scrub: 0.5, // Smooth but allows snap
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          snap: {
            snapTo: 1 / (cards.length * 4), // Creates snap points
            duration: { min: 0.2, max: 0.4 },
            ease: "power2.inOut"
          }
        }
      });

      cards.forEach((card, index) => {
        const content = card.querySelector(".card-content");
        const stackTitle = card.querySelector(".card-stack-title");
        const decorativeImgs = card.querySelectorAll(".card-decorative-img");

        // Expand card
        tl.to(card, {
          height: "60vh",
          duration: 0.6,
          ease: "power2.out"
        });

        // Hide stack title when expanding
        tl.to(
          stackTitle,
          {
            opacity: 0,
            duration: 0.2,
            ease: "none"
          },
          "<"
        );

        // Show content
        tl.to(
          content,
          {
            opacity: 1,
            duration: 0.4,
            ease: "none"
          },
          "<0.2"
        );

        // Show decorative images
        tl.to(
          decorativeImgs,
          {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: "back.out(1.2)",
            stagger: 0.1
          },
          "<0.1"
        );

        // Hold expanded state
        tl.to({}, { duration: 0.6 });

        // Collapse card (except for the last one)
        if (index < cards.length - 1) {
          // Hide decorative images first
          tl.to(decorativeImgs, {
            opacity: 0,
            scale: 0.9,
            duration: 0.3,
            ease: "power2.in",
            stagger: 0.05
          });

          tl.to(
            content,
            {
              opacity: 0,
              duration: 0.3,
              ease: "none"
            },
            "<"
          );

          // Show stack title again when collapsing
          tl.to(
            stackTitle,
            {
              opacity: 0.5,
              duration: 0.2,
              ease: "none"
            },
            "<"
          );

          tl.to(
            card,
            {
              height: 120,
              duration: 0.6,
              ease: "power2.in"
            },
            "<0.1"
          );
        }
      });
    }, stackSectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="bg-evolve-yellow">
      {/* ================= HERO ================= */}
      <section className="relative min-h-screen bg-evolve-yellow overflow-hidden">
        {/* ---------------- Rays Background ---------------- */}
        {/* Desktop */}
        <img
          src={rays_community}
          alt="rays"
          className="hidden md:block absolute inset-0 w-full h-full object-cover z-0"
        />

        {/* Mobile */}
        <img
          src={rays_community_mobile}
          alt="rays mobile"
          className="md:hidden absolute inset-0 w-full h-full object-cover z-0"
        />

        {/* ---------------- Doors Bottom Layer ---------------- */}
        {/* Desktop */}
        <img
          src={doors_community}
          alt="doors"
          className="hidden md:block absolute bottom-0 w-full z-10
                    object-contain"
        />

        {/* Mobile */}
        <img
          src={doors_community_mobile}
          alt="doors mobile"
          className="md:hidden absolute bottom-0 w-full z-10
                  object-contain"
        />

        {/* ---------------- Hands (Above Doors) ---------------- */}
        {/* Desktop */}
        <img
          src={left_hand_community}
          alt="left hand"
          className="hidden md:block absolute left-0 bottom-[0%] z-20
                 max-w-[320px]"
        />

        <img
          src={right_hand_community}
          alt="right hand"
          className="hidden md:block absolute right-0 bottom-[3%] z-20
                   max-w-[320px]"
        />

        {/* Mobile */}
        <img
          src={left_hand_community_mobile}
          alt="left hand mobile"
          className="md:hidden absolute left-0 bottom-[0%] z-20
                   max-w-[200px]"
        />

        <img
          src={right_hand_community_mobile}
          alt="right hand mobile"
          className="md:hidden absolute right-0 bottom-[0%] z-20
                   max-w-[200px]"
        />

        {/* ---------------- Center Content ---------------- */}
        <div
          className="absolute inset-x-0 z-30 flex flex-col items-center text-center px-4
        top-[clamp(80px,10vh,160px)]
        md:top-[clamp(100px,18vh,220px)]"
        >
          {/* Heading */}
          <h1
            className="font-extrabold lowercase text-evolve-pink"
            style={{
              fontSize: "clamp(64px, 8vw, 128px)",
              lineHeight: "clamp(48px, 7vw, 110px)",
              letterSpacing: "-0.03em"
            }}
          >
            evolve <br /> community
          </h1>

          {/* Sub text */}
          <p
            className="mt-6 font-regular lowercase text-black max-w-[80vw]"
            style={{
              fontSize: "clamp(20px, 2.5vw, 32px)",
              lineHeight: "clamp(28px, 3vw, 36px)"
            }}
          >
            {/* not a forum. not a feed! <br /> */}
            an inner circle built for creators.
          </p>

          {/* Button */}
          <div
            className="mt-8 cursor-pointer"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            <img
              src={hover ? join_us_button_hover : join_us_button}
              alt="join us"
              className="w-[200px] md:w-[240px]"
            />
          </div>
        </div>
      </section>

      {/* ================= HEADING ================= */}
      <section className="bg-evolve-yellow pt-28 text-center px-4">
        {/* <section className="bg-evolve-yellow pt-28 pb-24 text-center px-4"> */}
        <h2 className="font-extrabold lowercase text-black text-[clamp(40px,5vw,80px)]">
          inside the community circle
        </h2>
        <p className="mt-6 max-w-4xl mx-auto text-lg md:text-xl text-black">
          the evolve community is not a place where ideas sit pretty. it's your
          space to ask bold questions, trade war stories, and build skills that
          stick for life.
        </p>
      </section>

      {/* ================= CONNECTED STACK ================= */}
      <section ref={stackSectionRef} className="relative bg-evolve-yellow">
        <div className="h-screen flex items-center justify-center">
          <div className="relative w-full">
            {cards.map((card, i) => (
              <div
                key={card.id}
                ref={(el) => (cardRefs.current[i] = el)}
                className="bg-evolve-yellow border-t border-[#df0586]/50  overflow-hidden"
                style={{
                  marginTop: i === 0 ? 0 : -30,
                  zIndex: i + 1
                }}
              >
                {/* Stack Title - Visible only when stacked (50% opacity) */}
                {/* <div className="card-stack-title px-6 py-4 text-center">
                  <h3
                    className="font-extrabold lowercase text-evolve-pink"
                    style={{ fontSize: "clamp(28px,3.5vw,56px)" }}
                  >
                    {card.title}
                  </h3>
                </div> */}
                <div className="card-stack-title px-6 pt-8 pb-0 text-center">
                  <h3 className="font-extrabold lowercase text-evolve-pink/50 text-[clamp(38px,3.5vw,56px)] tracking-[-0.03em]">
                    {card.title}
                  </h3>
                </div>

                {/* Card Content - Hidden when stacked, centered when expanded */}
                <div className="card-content px-6 pb-8 relative">
                  {/* Decorative images - positioned as you specify */}
                  {card.decorativeImages &&
                    card.decorativeImages.map((img, imgIndex) => (
                      <img
                        key={imgIndex}
                        src={img.src}
                        alt={`decorative ${imgIndex}`}
                        className={`card-decorative-img ${img.className}`}
                      />
                    ))}

                  {/* Text content group - centered vertically and horizontally */}
                  {/* <div className="flex items-center justify-center min-h-[40vh]">
                    <div className="text-center max-w-2xl"> */}
                  {/* <div className="grid place-items-center h-full py-8">
                    <div className="text-center w-full max-w-[640px] px-4"> */}
                  <div className="grid place-items-center h-full overflow-hidden">
                    <div className="text-center w-full max-w-[640px] px-4 overflow-hidden z-10 md:pt-[-20rem]">
                      {/* Expanded Title - shown only when card is expanded */}
                      <h3
                        className="font-extrabold lowercase text-[#FF1493] mb-4 md:leading-none leading-[90%]"
                        style={{ fontSize: "clamp(48px,6vw,64px)" }}
                      >
                        {card.title}
                      </h3>

                      <p className="text-xl md:text-3xl font-bold lowercase text-black mb-4">
                        {card.subtitle}
                      </p>

                      <p className="text-base md:text-[16px] text-black/90 leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Community;
