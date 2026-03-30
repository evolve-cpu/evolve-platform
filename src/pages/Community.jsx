// // ==============================================================================================
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
//   right_hand_community_mobile,
//   card_1st,
//   card_2nd,
//   card_3rd_right_thunder,
//   card_3rd_left_thunder,
//   card_4th_3,
//   card_4th_2,
//   card_4th_1,
//   card_5th_mobile,
//   card_5th_right,
//   card_5th_left
// } from "../assets/images/Community";
// import { join_us_button, join_us_button_hover } from "../assets/images/Home";

// gsap.registerPlugin(ScrollTrigger);

// const Community = () => {
//   const [hover, setHover] = useState(false);

//   const stackSectionRef = useRef(null);
//   const cardRefs = useRef([]);

//   const cards = [
//     {
// id: 0,
// title: "ama sessions",
// subtitle: "ask me anything.",
// description:
//   'from "how do i start?" to "am i doing this right?", get real answers from designers who\'ve lived it.',
//       // Add your decorative images here - you can add multiple per card
//       decorativeImages: [
//         // DESKTOP
//         {
//           src: card_1st,
//           className:
//             "hidden md:block absolute bottom-[0%] right-[15%]  w-[15%] rotate-[-12deg]"
//         },
//         {
//           src: card_1st,
//           className:
//             "hidden md:block absolute bottom-0 left-[14%] w-[12%] rotate-[28deg]"
//         },
//         {
//           src: card_1st,
//           className:
//             "hidden md:block absolute top-[-20%] left-[30%] w-28 rotate-[18deg]"
//         },
//         {
//           src: card_1st,
//           className:
//             "hidden md:block absolute top-[10%] right-[10%] w-20 rotate-[-20deg]"
//         },

//         // MOBILE
//         {
//           src: card_1st,
//           className:
//             "md:hidden absolute bottom-[-20%] left-[15%] w-20 rotate-[-12deg]"
//         },
//         {
//           src: card_1st,
//           className:
//             "md:hidden absolute bottom-[-5%] right-[20%] w-16 rotate-[10deg]"
//         },
//         {
//           src: card_1st,
//           className:
//             "md:hidden absolute bottom-[-55%] left-[40%] w-[42%] rotate-[36deg]"
//         }
//       ]
//     },
//     {
// id: 1,
// title: "portfolio reviews",
// subtitle: "feedback that stings (and sticks)",
// description:
//   "Drop your work in. Paperclip/Evolve’s designers will break it down with you 1:1, then share the lessons (with your nod) so the whole crew learns.",
//       decorativeImages: [
//         // DESKTOP
//         {
//           src: card_2nd,
//           className:
//             "hidden md:block absolute bottom-[0%] right-[15%]  w-[15%] rotate-[-12deg]"
//         },
//         {
//           src: card_2nd,
//           className:
//             "hidden md:block absolute bottom-0 left-[14%] w-[12%] rotate-[8deg]"
//         },
//         {
//           src: card_2nd,
//           className:
//             "hidden md:block absolute top-[-20%] left-[30%] w-28 rotate-[18deg]"
//         },
//         {
//           src: card_2nd,
//           className:
//             "hidden md:block absolute top-[10%] right-[10%] w-20 rotate-[-20deg]"
//         },

//         // MOBILE
//         {
//           src: card_2nd,
//           className:
//             "md:hidden absolute bottom-[-10%] left-[15%] w-[30%] rotate-[-12deg]"
//         },
//         {
//           src: card_2nd,
//           className:
//             "md:hidden absolute bottom-[-5%] right-[20%] w-16 rotate-[10deg]"
//         },
//         {
//           src: card_2nd,
//           className:
//             "md:hidden absolute bottom-[-25%] left-[40%] w-[42%] rotate-[6deg]"
//         }
//       ]
//     },
//     {
// id: 2,
// title: "challenges",
// subtitle: "push yourself in challenges.",
// description:
//   "Take part in lightning round or creative art jam. Test your skills, stretch your creativity, and see how others tackle the same brief.",
//       decorativeImages: [
//         // DESKTOP
//         {
//           src: card_3rd_left_thunder,
//           className:
//             "hidden md:block absolute bottom-[-15%] left-[0%] w-[30%] rotate-[-8deg]"
//         },
//         {
//           src: card_3rd_right_thunder,
//           className:
//             "hidden md:block absolute top-[-70%] right-[0%] w-[30%] rotate-[10deg]"
//         },

//         // MOBILE
//         {
//           src: card_3rd_left_thunder,
//           className:
//             "md:hidden absolute bottom-[-40%] left-[15%] w-32 rotate-[-10deg]"
//         },
//         {
//           src: card_3rd_right_thunder,
//           className:
//             "md:hidden absolute bottom-[-30%] right-[15%] w-32 rotate-[12deg]"
//         }
//       ]
//     },
//     {
// id: 3,
// title: "resource library",
// subtitle: "get the good stuff, hand-picked.",
// description:
//   "Access curated resources. the tools, articles, and recommendations that actually help you sharpen your craft.",
//       decorativeImages: [
//         // DESKTOP (positions of choice)
//         {
//           src: card_4th_1,
//           className:
//             "hidden md:block absolute top-[-35%] left-[20%] w-[6%] rotate-[-10deg]"
//         },
//         {
//           src: card_4th_2,
//           className:
//             "hidden md:block absolute top-[10%] right-[15%] w-32 rotate-[12deg]"
//         },
//         {
//           src: card_4th_3,
//           className:
//             "hidden md:block absolute bottom-[-10%] left-[15%] w-[10%] rotate-[18deg]"
//         },
//         {
//           src: card_4th_1,
//           className:
//             "hidden md:block absolute bottom-[-5%] right-[25%] w-16 rotate-[44deg]"
//         },

//         // MOBILE
//         {
//           src: card_4th_1,
//           className:
//             "md:hidden absolute bottom-[-25%] left-[15%] w-[20%] rotate-[-12deg]"
//         },
//         {
//           src: card_4th_2,
//           className:
//             "md:hidden absolute bottom-[-15%] right-[20%] w-12 rotate-[10deg]"
//         },
//         {
//           src: card_4th_3,
//           className:
//             "md:hidden absolute bottom-[-40%] left-[40%] w-[32%] rotate-[6deg]"
//         }
//       ]
//     },
//     {
// id: 4,
// title: "bookclub",
// subtitle: "read.learn.repeat.",
// description:
//   "Join the Book Club to dive into design classics and other must-reads. Weekly virtual meets keep it lively — expect spirited discussions, fresh takes, and a deeper grip on the ideas that shape design.",
//       decorativeImages: [
//         // DESKTOP
//         {
//           src: card_5th_left,
//           className: "hidden md:block absolute left-0 bottom-0 w-[30%]"
//         },
//         {
//           src: card_5th_right,
//           className: "hidden md:block absolute right-0 bottom-0 w-[30%]"
//         },

//         // MOBILE
//         {
//           src: card_5th_mobile,
//           className:
//             "md:hidden absolute bottom-[-40%] left-1/2 -translate-x-1/2 w-[100%]"
//         }
//       ]
//     }
//   ];

//   useEffect(() => {
//     const ctx = gsap.context(() => {
//       const cards = cardRefs.current;
//       const scrollPerCard = window.innerHeight * 1.2; // Reduced scroll needed

//       cards.forEach((card) => {
//         const content = card.querySelector(".card-content");
//         const stackTitle = card.querySelector(".card-stack-title");
//         const decorativeImgs = card.querySelectorAll(".card-decorative-img");

//         gsap.set(card, { height: 120 });
//         gsap.set(content, { opacity: 0 });
//         gsap.set(stackTitle, { opacity: 0.5 });
//         gsap.set(decorativeImgs, { opacity: 0, scale: 0.9 });
//       });

//       const tl = gsap.timeline({
//         scrollTrigger: {
//           trigger: stackSectionRef.current,
//           start: "top top",
//           end: `+=${cards.length * scrollPerCard}`,
//           scrub: 0.5, // Smooth but allows snap
//           pin: true,
//           anticipatePin: 1,
//           invalidateOnRefresh: true,
//           snap: {
//             snapTo: 1 / (cards.length * 4), // Creates snap points
//             duration: { min: 0.2, max: 0.4 },
//             ease: "power2.inOut"
//           }
//         }
//       });

//       cards.forEach((card, index) => {
//         const content = card.querySelector(".card-content");
//         const stackTitle = card.querySelector(".card-stack-title");
//         const decorativeImgs = card.querySelectorAll(".card-decorative-img");

//         // Expand card
//         tl.to(card, {
//           height: "60vh",
//           duration: 0.6,
//           ease: "power2.out"
//         });

//         // Hide stack title when expanding
//         tl.to(
//           stackTitle,
//           {
//             opacity: 0,
//             duration: 0.2,
//             ease: "none"
//           },
//           "<"
//         );

//         // Show content
//         tl.to(
//           content,
//           {
//             opacity: 1,
//             duration: 0.4,
//             ease: "none"
//           },
//           "<0.2"
//         );

//         // Show decorative images
//         tl.to(
//           decorativeImgs,
//           {
//             opacity: 1,
//             scale: 1,
//             duration: 0.5,
//             ease: "back.out(1.2)",
//             stagger: 0.1
//           },
//           "<0.1"
//         );

//         // Hold expanded state
//         tl.to({}, { duration: 0.6 });

//         // Collapse card (except for the last one)
//         if (index < cards.length - 1) {
//           // Hide decorative images first
//           tl.to(decorativeImgs, {
//             opacity: 0,
//             scale: 0.9,
//             duration: 0.3,
//             ease: "power2.in",
//             stagger: 0.05
//           });

//           tl.to(
//             content,
//             {
//               opacity: 0,
//               duration: 0.3,
//               ease: "none"
//             },
//             "<"
//           );

//           // Show stack title again when collapsing
//           tl.to(
//             stackTitle,
//             {
//               opacity: 0.5,
//               duration: 0.2,
//               ease: "none"
//             },
//             "<"
//           );

//           tl.to(
//             card,
//             {
//               height: 120,
//               duration: 0.6,
//               ease: "power2.in"
//             },
//             "<0.1"
//           );
//         }
//       });
//     }, stackSectionRef);

//     return () => ctx.revert();
//   }, []);

//   return (
//     <div className="bg-evolve-yellow">
//       {/* ================= HERO ================= */}
//       <section className="relative min-h-screen bg-evolve-yellow overflow-hidden">
//         {/* ---------------- Rays Background ---------------- */}
//         {/* Desktop */}
//         <img
//           src={rays_community}
//           alt="rays"
//           className="hidden md:block absolute inset-0 w-full h-full object-cover z-0"
//         />

//         {/* Mobile */}
//         <img
//           src={rays_community_mobile}
//           alt="rays mobile"
//           className="md:hidden absolute inset-0 w-full h-full object-cover z-0"
//         />

//         {/* ---------------- Doors Bottom Layer ---------------- */}
//         {/* Desktop */}
//         <img
//           src={doors_community}
//           alt="doors"
//           className="hidden md:block absolute bottom-0 w-full z-10
//                     object-contain"
//         />

//         {/* Mobile */}
//         <img
//           src={doors_community_mobile}
//           alt="doors mobile"
//           className="md:hidden absolute bottom-0 w-full z-10
//                   object-contain"
//         />

//         {/* ---------------- Hands (Above Doors) ---------------- */}
//         {/* Desktop */}
//         <img
//           src={left_hand_community}
//           alt="left hand"
//           className="hidden md:block absolute left-0 bottom-[0%] z-20
//                  max-w-[320px]"
//         />

//         <img
//           src={right_hand_community}
//           alt="right hand"
//           className="hidden md:block absolute right-0 bottom-[3%] z-20
//                    max-w-[320px]"
//         />

//         {/* Mobile */}
//         <img
//           src={left_hand_community_mobile}
//           alt="left hand mobile"
//           className="md:hidden absolute left-0 bottom-[0%] z-20
//                    max-w-[200px]"
//         />

//         <img
//           src={right_hand_community_mobile}
//           alt="right hand mobile"
//           className="md:hidden absolute right-0 bottom-[0%] z-20
//                    max-w-[200px]"
//         />

//         {/* ---------------- Center Content ---------------- */}
//         <div
//           className="absolute inset-x-0 z-30 flex flex-col items-center text-center px-4
//         top-[clamp(80px,10vh,160px)]
//         md:top-[clamp(100px,18vh,220px)]"
//         >
//           {/* Heading */}
//           <h1
//             className="font-extrabold lowercase text-evolve-pink"
//             style={{
//               fontSize: "clamp(64px, 8vw, 128px)",
//               lineHeight: "clamp(48px, 7vw, 110px)",
//               letterSpacing: "-0.03em"
//             }}
//           >
//             evolve <br /> community
//           </h1>

//           {/* Sub text */}
//           <p
//             className="mt-6 font-regular lowercase text-black max-w-[80vw]"
//             style={{
//               fontSize: "clamp(20px, 2.5vw, 32px)",
//               lineHeight: "clamp(28px, 3vw, 36px)"
//             }}
//           >
//             {/* not a forum. not a feed! <br /> */}
//             an inner circle built for creators.
//           </p>

//           {/* Button */}
//           <div
//             className="mt-8 cursor-pointer"
//             onMouseEnter={() => setHover(true)}
//             onMouseLeave={() => setHover(false)}
//           >
//             <img
//               src={hover ? join_us_button_hover : join_us_button}
//               alt="join us"
//               className="w-[200px] md:w-[240px]"
//             />
//           </div>
//         </div>
//       </section>

//       {/* ================= HEADING ================= */}
//       <section className="bg-evolve-yellow pt-28 text-center px-4">
//         {/* <section className="bg-evolve-yellow pt-28 pb-24 text-center px-4"> */}
//         {/* <h2 className="font-extrabold lowercase text-black text-[clamp(40px,5vw,80px)]">
//           inside the community circle
//         </h2> */}
//         <p className="mt-6 max-w-4xl mx-auto text-[24px] md:text-[36px] font-bold text-black leading-[36px]">
//           it’s YOUR space to ask bold questions, trade war stories, learn from
//           real people, and build the kind of skills that stick for life.
//         </p>
//       </section>

//       {/* ================= CONNECTED STACK ================= */}
//       <section ref={stackSectionRef} className="relative bg-evolve-yellow">
//         <div className="h-screen flex items-center justify-center">
//           <div className="relative w-full">
//             {cards.map((card, i) => (
//               <div
//                 key={card.id}
//                 ref={(el) => (cardRefs.current[i] = el)}
//                 className="bg-evolve-yellow border-t border-[#df0586]/50  overflow-hidden"
//                 style={{
//                   marginTop: i === 0 ? 0 : -30,
//                   zIndex: i + 1
//                 }}
//               >
//                 {/* Stack Title - Visible only when stacked (50% opacity) */}
//                 {/* <div className="card-stack-title px-6 py-4 text-center">
//                   <h3
//                     className="font-extrabold lowercase text-evolve-pink"
//                     style={{ fontSize: "clamp(28px,3.5vw,56px)" }}
//                   >
//                     {card.title}
//                   </h3>
//                 </div> */}
//                 <div className="card-stack-title px-6 pt-8 pb-0 text-center">
//                   <h3 className="font-extrabold lowercase text-evolve-pink/50 text-[clamp(38px,3.5vw,56px)] tracking-[-0.03em]">
//                     {card.title}
//                   </h3>
//                 </div>

//                 {/* Card Content - Hidden when stacked, centered when expanded */}
//                 <div className="card-content px-6 pb-8 relative">
//                   {/* Decorative images - positioned as you specify */}
//                   {card.decorativeImages &&
//                     card.decorativeImages.map((img, imgIndex) => (
//                       <img
//                         key={imgIndex}
//                         src={img.src}
//                         alt={`decorative ${imgIndex}`}
//                         className={`card-decorative-img ${img.className}`}
//                       />
//                     ))}

//                   {/* Text content group - centered vertically and horizontally */}
//                   {/* <div className="flex items-center justify-center min-h-[40vh]">
//                     <div className="text-center max-w-2xl"> */}
//                   {/* <div className="grid place-items-center h-full py-8">
//                     <div className="text-center w-full max-w-[640px] px-4"> */}
//                   <div className="grid place-items-center h-full overflow-hidden">
//                     <div className="text-center w-full max-w-[640px] px-4 overflow-hidden z-10 md:pt-[-20rem]">
//                       {/* Expanded Title - shown only when card is expanded */}
//                       <h3
//                         className="font-extrabold lowercase text-[#FF1493] mb-4 md:leading-none leading-[90%]"
//                         style={{ fontSize: "clamp(48px,6vw,64px)" }}
//                       >
//                         {card.title}
//                       </h3>

//                       <p className="text-xl md:text-3xl font-bold lowercase text-black mb-4">
//                         {card.subtitle}
//                       </p>

//                       <p className="text-base md:text-[16px] text-black/90 leading-relaxed">
//                         {card.description}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default Community;

// import React, { useEffect, useRef, useState } from "react";

// import {
//   rays_community,
//   rays_community_mobile,
//   doors_community,
//   doors_community_mobile,
//   left_hand_community,
//   right_hand_community,
//   left_hand_community_mobile,
//   right_hand_community_mobile,
//   card_1st,
//   card_2nd,
//   card_3rd_right_thunder,
//   card_3rd_left_thunder,
//   card_4th_3,
//   card_4th_2,
//   card_4th_1,
//   card_5th_right,
//   card_5th_left
// } from "../assets/images/Community";

// import { join_us_button, join_us_button_hover } from "../assets/images/Home";

// const CARDS = [
//   {
//     title: "ama sessions",
//     subtitle: "ask me anything.",
//     description:
//       'from "how do i start?" to "am i doing this right?", get real answers from designers who\'ve lived it.',
//     images: [card_1st]
//   },
//   {
//     title: "portfolio reviews",
//     subtitle: "feedback that stings (and sticks)",
//     description:
//       "Drop your work in. Paperclip/Evolve's designers will break it down with you 1:1, then share the lessons (with your nod) so the whole crew learns.",
//     images: [card_2nd]
//   },
//   {
//     title: "challenges",
//     subtitle: "push yourself in challenges.",
//     description:
//       "Take part in lightning round or creative art jam. Test your skills, stretch your creativity, and see how others tackle the same brief.",
//     images: [card_3rd_left_thunder, card_3rd_right_thunder]
//   },
//   {
//     title: "resource library",
//     subtitle: "get the good stuff, hand-picked.",
//     description:
//       "Access curated resources. the tools, articles, and recommendations that actually help you sharpen your craft.",
//     images: [card_4th_1, card_4th_2, card_4th_3]
//   },
//   {
//     title: "bookclub",
//     subtitle: "read.learn.repeat.",
//     description:
//       "Join the Book Club to dive into design classics and other must-reads. Weekly virtual meets keep it lively — expect spirited discussions, fresh takes, and a deeper grip on the ideas that shape design.",
//     images: [card_5th_left, card_5th_right]
//   }
// ];

// const Community = () => {
//   const [hover, setHover] = useState(false);
//   const cardRefs = useRef([]);
//   const contentRefs = useRef([]);
//   const headingRefs = useRef([]);
//   const sectionRef = useRef(null);

//   useEffect(() => {
//     const clamp01 = (val) => Math.max(0, Math.min(1, val));
//     const mapRange = (value, inMin, inMax, outMin, outMax) => {
//       return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
//     };

//     // Expansion timings
//     const fadeOutFast = (p) => clamp01(mapRange(p, 0, 0.25, 1, 0));
//     const fadeInAfter = (p) => clamp01(mapRange(p, 0.15, 1, 0, 1));

//     // Collapse timings with hold
//     const HOLD_PCT = 0.45;
//     const withHold = (p) => {
//       if (p <= HOLD_PCT) return 0;
//       return clamp01((p - HOLD_PCT) / (1 - HOLD_PCT));
//     };

//     const hideExpandedFirst = (p) => clamp01(mapRange(p, 0.0, 0.35, 0, 1));
//     const showHeadingLate = (p) => clamp01(mapRange(p, 0.55, 1.0, 0, 1));

//     const setExpandedState = (card, heading, content, images, p) => {
//       const headingA = fadeOutFast(p);
//       const contentA = fadeInAfter(p);
//       const targetHeight = window.innerHeight * 0.65;

//       card.style.height = `${140 + (targetHeight - 140) * p}px`;
//       heading.style.opacity = headingA;
//       heading.style.visibility = headingA > 0.01 ? "visible" : "hidden";

//       content.style.opacity = contentA;
//       content.style.visibility = contentA > 0.01 ? "visible" : "hidden";
//       content.style.transform = `translateY(${60 - 60 * contentA}px)`;

//       images.forEach((img) => {
//         img.style.opacity = contentA;
//         img.style.visibility = contentA > 0.01 ? "visible" : "hidden";
//       });
//     };

//     const setCollapsedState = (card, heading, content, images, p) => {
//       const cp = withHold(p);
//       const hideAmt = hideExpandedFirst(cp);
//       const showAmt = showHeadingLate(cp);
//       const targetHeight = window.innerHeight * 0.65;

//       card.style.height = `${targetHeight - (targetHeight - 140) * cp}px`;

//       content.style.opacity = 1 - hideAmt;
//       content.style.visibility = 1 - hideAmt > 0.01 ? "visible" : "hidden";
//       content.style.transform = `translateY(${60 * hideAmt}px)`;

//       images.forEach((img) => {
//         img.style.opacity = 1 - hideAmt;
//         img.style.visibility = 1 - hideAmt > 0.01 ? "visible" : "hidden";
//       });

//       heading.style.opacity = showAmt;
//       heading.style.visibility = showAmt > 0.01 ? "visible" : "hidden";
//     };

//     // Initialize all cards to collapsed state
//     cardRefs.current.forEach((card, index) => {
//       if (!card) return;
//       const content = contentRefs.current[index];
//       const heading = headingRefs.current[index];
//       const images = card.querySelectorAll(".card-image") || [];

//       card.style.height = "140px";
//       heading.style.opacity = "1";
//       heading.style.visibility = "visible";
//       content.style.opacity = "0";
//       content.style.visibility = "hidden";
//       content.style.transform = "translateY(60px)";
//       images.forEach((img) => {
//         img.style.opacity = "0";
//         img.style.visibility = "hidden";
//       });
//     });

//     // Scroll handler
//     let rafId = null;
//     const handleScroll = () => {
//       if (rafId) return;

//       rafId = requestAnimationFrame(() => {
//         const scrollY = window.scrollY;
//         const windowHeight = window.innerHeight;

//         cardRefs.current.forEach((card, index) => {
//           if (!card) return;

//           const content = contentRefs.current[index];
//           const heading = headingRefs.current[index];
//           const images = card.querySelectorAll(".card-image");

//           const rect = card.getBoundingClientRect();
//           const cardTop = scrollY + rect.top;

//           // Define scroll ranges for each card
//           const expandStart = cardTop - windowHeight * 0.45;
//           const expandEnd = cardTop - windowHeight * 0.45;
//           const collapseStart = cardTop - windowHeight * 0.45;
//           const collapseEnd = cardTop - windowHeight * 0.0;

//           // Calculate progress
//           let expandProgress = 0;
//           let collapseProgress = 0;

//           if (scrollY >= expandStart && scrollY <= expandEnd) {
//             expandProgress =
//               (scrollY - expandStart) / (expandEnd - expandStart);
//           } else if (scrollY > expandEnd && scrollY < collapseStart) {
//             expandProgress = 1;
//           }

//           if (scrollY >= collapseStart && scrollY <= collapseEnd) {
//             collapseProgress =
//               (scrollY - collapseStart) / (collapseEnd - collapseStart);
//           } else if (scrollY > collapseEnd) {
//             collapseProgress = 1;
//           }

//           // Apply states
//           if (collapseProgress > 0) {
//             setCollapsedState(card, heading, content, images, collapseProgress);
//           } else if (expandProgress > 0) {
//             setExpandedState(card, heading, content, images, expandProgress);
//           }
//         });

//         rafId = null;
//       });
//     };

//     window.addEventListener("scroll", handleScroll, { passive: true });
//     handleScroll(); // Initial call

//     return () => {
//       window.removeEventListener("scroll", handleScroll);
//       if (rafId) cancelAnimationFrame(rafId);
//     };
//   }, []);

//   return (
//     <div className="bg-evolve-yellow">
//       {/* ================= HERO ================= */}
//       <section className="relative min-h-screen bg-evolve-yellow overflow-hidden">
//         <img
//           src={rays_community}
//           alt="rays"
//           className="hidden md:block absolute inset-0 w-full h-full object-cover z-0"
//         />

//         <img
//           src={rays_community_mobile}
//           alt="rays mobile"
//           className="md:hidden absolute inset-0 w-full h-full object-cover z-0"
//         />

//         <img
//           src={doors_community}
//           alt="doors"
//           className="hidden md:block absolute bottom-0 w-full z-10 object-contain"
//         />

//         <img
//           src={doors_community_mobile}
//           alt="doors mobile"
//           className="md:hidden absolute bottom-0 w-full z-10 object-contain"
//         />

//         <img
//           src={left_hand_community}
//           alt="left hand"
//           className="hidden md:block absolute left-0 bottom-0 z-20 max-w-[320px]"
//         />

//         <img
//           src={right_hand_community}
//           alt="right hand"
//           className="hidden md:block absolute right-0 bottom-[3%] z-20 max-w-[320px]"
//         />

//         <img
//           src={left_hand_community_mobile}
//           alt="left hand mobile"
//           className="md:hidden absolute left-0 bottom-0 z-20 max-w-[200px]"
//         />

//         <img
//           src={right_hand_community_mobile}
//           alt="right hand mobile"
//           className="md:hidden absolute right-0 bottom-0 z-20 max-w-[200px]"
//         />

//         <div className="absolute inset-x-0 z-30 flex flex-col items-center text-center px-4 top-[clamp(80px,10vh,160px)] md:top-[clamp(100px,18vh,220px)]">
//           <h1
//             className="font-extrabold lowercase text-evolve-pink"
//             style={{
//               fontSize: "clamp(64px, 8vw, 128px)",
//               lineHeight: "clamp(48px, 7vw, 110px)",
//               letterSpacing: "-0.03em"
//             }}
//           >
//             evolve <br /> community
//           </h1>

//           <p
//             className="mt-6 lowercase text-black max-w-[80vw]"
//             style={{
//               fontSize: "clamp(20px, 2.5vw, 32px)",
//               lineHeight: "clamp(28px, 3vw, 36px)"
//             }}
//           >
//             an inner circle built for creators.
//           </p>

//           <div
//             className="mt-8 cursor-pointer"
//             onMouseEnter={() => setHover(true)}
//             onMouseLeave={() => setHover(false)}
//           >
//             <img
//               src={hover ? join_us_button_hover : join_us_button}
//               alt="join us"
//               className="w-[200px] md:w-[240px]"
//             />
//           </div>
//         </div>
//       </section>

//       {/* ================= INTRO TEXT ================= */}
//       <section className="bg-evolve-yellow pt-28 text-center px-4">
//         <p className="mt-6 max-w-4xl mx-auto text-[24px] md:text-[36px] font-bold text-black leading-[36px]">
//           it's YOUR space to ask bold questions, trade war stories, learn from
//           real people, and build the kind of skills that stick for life.
//         </p>
//       </section>

//       {/* ================= SCROLL CARDS ================= */}
//       <section ref={sectionRef} className="bg-evolve-yellow mt-32">
//         {CARDS.map((card, index) => (
//           <div
//             key={index}
//             ref={(el) => (cardRefs.current[index] = el)}
//             className="relative overflow-hidden bg-evolve-yellow w-full mb-0"
//             style={{ height: "140px" }}
//           >
//             {/* Collapsed Heading */}
//             <div
//               ref={(el) => (headingRefs.current[index] = el)}
//               className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
//             >
//               <h2
//                 className="font-extrabold lowercase text-evolve-pink text-center"
//                 style={{
//                   fontSize: "clamp(48px, 8vw, 96px)",
//                   letterSpacing: "-0.03em",
//                   lineHeight: "1"
//                 }}
//               >
//                 {card.title}
//               </h2>
//             </div>

//             {/* Border */}
//             <div className="absolute bottom-0 left-0 right-0 border-b border-evolve-pink z-5" />

//             {/* Expanded Content */}
//             <div
//               ref={(el) => (contentRefs.current[index] = el)}
//               className="absolute inset-0 z-20 flex flex-col items-center text-center px-6
//                          justify-start pt-[18vh]
//                          md:justify-center md:pt-0"
//             >
//               <h3 className="text-evolve-pink font-extrabold text-[32px] md:text-[48px] lowercase">
//                 {card.title}
//               </h3>
//               <p className="mt-3 font-semibold lowercase text-black">
//                 {card.subtitle}
//               </p>
//               <p className="mt-6 max-w-2xl text-black">{card.description}</p>
//             </div>

//             {/* Images */}
//             {card.images.map((img, i) => (
//               <img
//                 key={i}
//                 src={img}
//                 alt=""
//                 className="card-image absolute bottom-0 z-10 max-w-[180px] md:max-w-[260px]"
//                 style={{
//                   left: i === 0 ? "10%" : i === 1 ? "70%" : "45%"
//                 }}
//               />
//             ))}
//           </div>
//         ))}

//         {/* Extra space at bottom for last card collapse */}
//         {/* <div style={{ height: "100vh" }} /> */}
//       </section>
//     </div>
//   );
// };

// export default Community;

import React, { useEffect, useRef, useState } from "react";
import SEO from "../components/SEO";

import {
  rays_community,
  rays_community_mobile,
  doors_community,
  doors_community_mobile,
  left_hand_community,
  right_hand_community,
  left_hand_community_mobile,
  right_hand_community_mobile,
  ama_session,
  ama_session_mobile,
  portfolio_reviews,
  portfolio_reviews_mobile,
  challenges,
  challenges_mobile,
  resources,
  resources_mobile,
  card_5th_left,
  card_5th_right,
  card_5th_mobile
} from "../assets/images/Community";

import { join_us_button, join_us_button_hover } from "../assets/images/Home";

const CARDS = [
  {
    title: "ama sessions",
    subtitle: "ask what really matters.",
    descriptionMobile:
      "ask anything in open sessions with professionals who’ve done it for real.",
    descriptionDesktop:
      "ask anything in open sessions with working professionals. get answers from people who’ve been there and know how it actually works.",
    desktopImages: [{ src: ama_session, position: "center" }],
    mobileImage: ama_session_mobile
  },
  {
    title: "portfolio reviews",
    subtitle: "honest feedback. real growth.",
    descriptionMobile:
      "share work and get direct feedback on what works and what doesn’t.",
    descriptionDesktop:
      "share your work and get direct, no-sugarcoating feedback from experienced designers. understand what works, what doesn’t, and how to level up.",
    desktopImages: [{ src: portfolio_reviews, position: "center" }],
    mobileImage: portfolio_reviews_mobile
  },
  {
    title: "challenges",
    subtitle: "learn by doing.",
    descriptionMobile:
      "take short challenges, ship work, compare approaches, and learn new ways.",
    descriptionDesktop:
      "jump into short, time-bound challenges designed to stretch your thinking. ship your work, see how others approached the same brief, and pick up new ways of solving problems.",
    desktopImages: [{ src: challenges, position: "center" }],
    mobileImage: challenges_mobile
  },
  {
    title: "resource library",
    subtitle: "the good stuff, curated.",
    descriptionMobile:
      "access curated articles, tools, and reads to build strong design fundamentals.",
    descriptionDesktop:
      "access hand-picked articles, tools, and reads,  written by evolve and sourced from the best out there. no fluff. just solid resources to build strong fundamentals.",
    desktopImages: [{ src: resources, position: "center" }],
    mobileImage: resources_mobile
  },
  {
    title: "bookclub",
    subtitle: "read. learn. finish.",
    descriptionMobile:
      "read design classics together in a weekly book club you actually finish.",
    descriptionDesktop:
      "join the book club to read design classics and modern must-reads together. we break books into small chunks and meet weekly to talk ideas, opinions, and real takeaways, so you actually finish what you start.",
    desktopImages: [
      { src: card_5th_left, position: "left" },
      { src: card_5th_right, position: "right" }
    ],
    mobileImage: card_5th_mobile
  }
];

const Community = () => {
  const [hover, setHover] = useState(false);
  const cardRefs = useRef([]);
  const contentRefs = useRef([]);
  const headingRefs = useRef([]);
  const sectionRef = useRef(null);

  useEffect(() => {
    const clamp01 = (val) => Math.max(0, Math.min(1, val));
    const mapRange = (value, inMin, inMax, outMin, outMax) => {
      return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
    };

    // Expansion timings
    const fadeOutFast = (p) => clamp01(mapRange(p, 0, 0.2, 1, 0));
    const fadeInAfter = (p) => clamp01(mapRange(p, 0.15, 1, 0, 1));

    // Collapse timings - OVERLAPPING so heading appears before content disappears
    const HOLD_PCT = 0.45;
    const withHold = (p) => {
      if (p <= HOLD_PCT) return 0;
      return clamp01((p - HOLD_PCT) / (1 - HOLD_PCT));
    };

    // Overlap timings - heading appears while content is still fading
    const hideExpandedContent = (p) => clamp01(mapRange(p, 0.0, 0.5, 0, 1));
    const showCollapsedHeading = (p) => clamp01(mapRange(p, 0.45, 1.0, 0, 1));

    const setExpandedState = (card, heading, content, images, p) => {
      const headingA = fadeOutFast(p);
      const contentA = fadeInAfter(p);
      const targetHeight = window.innerHeight * 0.65;

      card.style.height = `${140 + (targetHeight - 140) * p}px`;
      heading.style.opacity = headingA;
      heading.style.visibility = headingA > 0.01 ? "visible" : "hidden";

      content.style.opacity = contentA;
      content.style.visibility = contentA > 0.01 ? "visible" : "hidden";
      content.style.transform = `translateY(${60 - 60 * contentA}px)`;

      images.forEach((img) => {
        img.style.opacity = contentA;
        img.style.visibility = contentA > 0.01 ? "visible" : "hidden";
      });
    };

    const setCollapsedState = (card, heading, content, images, p) => {
      const cp = withHold(p);
      const hideAmt = hideExpandedContent(cp);
      const showAmt = showCollapsedHeading(cp);
      const targetHeight = window.innerHeight * 0.65;

      card.style.height = `${targetHeight - (targetHeight - 140) * cp}px`;

      // Hide expanded content
      content.style.opacity = 1 - hideAmt;
      content.style.visibility = 1 - hideAmt > 0.01 ? "visible" : "hidden";
      content.style.transform = `translateY(${60 * hideAmt}px)`;

      images.forEach((img) => {
        img.style.opacity = 1 - hideAmt;
        img.style.visibility = 1 - hideAmt > 0.01 ? "visible" : "hidden";
      });

      // Show collapsed heading (overlaps with content fade)
      heading.style.opacity = showAmt;
      heading.style.visibility = showAmt > 0.01 ? "visible" : "hidden";
    };

    // Initialize all cards to collapsed state
    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      const content = contentRefs.current[index];
      const heading = headingRefs.current[index];
      const images = card.querySelectorAll(".card-image") || [];

      card.style.height = "140px";
      heading.style.opacity = "1";
      heading.style.visibility = "visible";
      content.style.opacity = "0";
      content.style.visibility = "hidden";
      content.style.transform = "translateY(60px)";
      images.forEach((img) => {
        img.style.opacity = "0";
        img.style.visibility = "hidden";
      });
    });

    // Scroll handler
    let rafId = null;
    const handleScroll = () => {
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;

        cardRefs.current.forEach((card, index) => {
          if (!card) return;

          const content = contentRefs.current[index];
          const heading = headingRefs.current[index];
          const images = card.querySelectorAll(".card-image");

          const rect = card.getBoundingClientRect();
          const cardTop = scrollY + rect.top;

          // Define scroll ranges for each card
          const expandStart = cardTop - windowHeight * 0.5;
          const expandEnd = cardTop - windowHeight * 0.35;
          const collapseStart = cardTop - windowHeight * 0.4;
          const collapseEnd = cardTop - windowHeight * 0.0;

          // Calculate progress
          let expandProgress = 0;
          let collapseProgress = 0;

          if (scrollY >= expandStart && scrollY <= expandEnd) {
            expandProgress =
              (scrollY - expandStart) / (expandEnd - expandStart);
          } else if (scrollY > expandEnd && scrollY < collapseStart) {
            expandProgress = 1;
          }

          if (scrollY >= collapseStart && scrollY <= collapseEnd) {
            collapseProgress =
              (scrollY - collapseStart) / (collapseEnd - collapseStart);
          } else if (scrollY > collapseEnd) {
            collapseProgress = 1;
          }

          // Special handling for first card - it should collapse when scrolling up
          if (index === 0) {
            if (scrollY < expandStart) {
              // Fully collapsed when scrolled above expand range
              card.style.height = "140px";
              heading.style.opacity = "1";
              heading.style.visibility = "visible";
              content.style.opacity = "0";
              content.style.visibility = "hidden";
              content.style.transform = "translateY(60px)";
              images.forEach((img) => {
                img.style.opacity = "0";
                img.style.visibility = "hidden";
              });
              rafId = null;
              return;
            }
          }

          // Apply states based on progress
          if (collapseProgress > 0 && collapseProgress < 1) {
            setCollapsedState(card, heading, content, images, collapseProgress);
          } else if (collapseProgress >= 1) {
            // Fully collapsed
            card.style.height = "140px";
            heading.style.opacity = "1";
            heading.style.visibility = "visible";
            content.style.opacity = "0";
            content.style.visibility = "hidden";
            content.style.transform = "translateY(60px)";
            images.forEach((img) => {
              img.style.opacity = "0";
              img.style.visibility = "hidden";
            });
          } else if (expandProgress > 0) {
            setExpandedState(card, heading, content, images, expandProgress);
          }
        });

        rafId = null;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="bg-evolve-yellow">
      <SEO
        title="The evolve community — where the ecosystem comes alive"
        description="A global space for designers at every stage — discussions, challenges, AMAs, book clubs, and more. The community is where everything you learn on evolve gets tested, shared, and built upon."
        path="/community"
      />
      {/* ================= HERO ================= */}
      <section className="relative min-h-screen bg-evolve-yellow overflow-hidden">
        <img
          src={rays_community}
          alt="rays"
          className="hidden md:block absolute inset-0 w-full h-full object-cover z-0"
        />

        <img
          src={rays_community_mobile}
          alt="rays mobile"
          className="md:hidden absolute inset-0 w-full h-full object-cover z-0"
        />

        <img
          src={doors_community}
          alt="doors"
          className="hidden md:block absolute bottom-0 w-full z-10 object-contain"
        />

        {/* <img
          src={doors_community_mobile}
          alt="doors mobile"
          className="md:hidden absolute bottom-0 w-full z-10 object-contain"
        /> */}
        <img
          src={doors_community_mobile}
          alt="doors mobile"
          className="
    md:hidden absolute bottom-0 w-full z-10 object-contain
    max-[375px]:scale-90
    origin-bottom
  "
        />

        <img
          src={left_hand_community}
          alt="left hand"
          className="hidden md:block absolute left-0 bottom-0 z-20 max-w-[320px]"
        />

        <img
          src={right_hand_community}
          alt="right hand"
          className="hidden md:block absolute right-0 bottom-[3%] z-20 max-w-[320px]"
        />

        <img
          src={left_hand_community_mobile}
          alt="left hand mobile"
          className="md:hidden absolute left-0 bottom-0 z-20 max-w-[200px]"
        />

        <img
          src={right_hand_community_mobile}
          alt="right hand mobile"
          className="md:hidden absolute right-0 bottom-0 z-20 max-w-[200px]"
        />

        <div className="absolute inset-x-0 z-30 flex flex-col items-center text-center px-4 top-[clamp(80px,10vh,160px)] md:top-[clamp(100px,18vh,220px)]">
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

          <p
            className="mt-6 lowercase text-black font-medium max-w-[80vw]"
            style={{
              fontSize: "clamp(20px, 2.5vw, 32px)",
              lineHeight: "clamp(28px, 3vw, 36px)"
            }}
          >
            an inner circle built for creators.
          </p>

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

      {/* ================= INTRO TEXT ================= */}
      <section className="bg-evolve-yellow pt-28 text-center px-4">
        <p className="mt-6 max-w-4xl mx-auto text-[24px] md:text-[36px] font-regular text-black leading-[36px]">
          it's YOUR space to ask bold questions, trade war stories, learn from
          real people, and build the kind of skills that stick for life.
        </p>
      </section>

      {/* ================= SCROLL CARDS ================= */}
      <section ref={sectionRef} className="bg-evolve-yellow mt-32">
        {CARDS.map((card, index) => (
          <div
            key={index}
            ref={(el) => (cardRefs.current[index] = el)}
            className="relative overflow-hidden bg-evolve-yellow w-full mb-0"
            style={{ height: "140px" }}
          >
            {/* Collapsed Heading */}
            {/* <div
              ref={(el) => (headingRefs.current[index] = el)}
              className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
            >
              <h2
                className="font-extrabold lowercase text-evolve-pink/50 text-center"
                style={{
                  fontSize: "clamp(48px, 8vw, 96px)",
                  letterSpacing: "-0.03em",
                  lineHeight: "1"
                }}
              >
                {card.title}
              </h2>
            </div> */}
            <div
              ref={(el) => (headingRefs.current[index] = el)}
              className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
            >
              <h2
                className="font-extrabold lowercase text-evolve-pink/50 text-center translate-y-[0rem] md:translate-y-[3rem]"
                style={{
                  fontSize: "clamp(48px, 8vw, 96px)",
                  letterSpacing: "-0.03em",
                  lineHeight: "1"
                }}
              >
                {card.title}
              </h2>
            </div>

            {/* Border */}
            <div className="absolute bottom-0 left-0 right-0 border-b border-evolve-pink z-5" />

            {/* Expanded Content */}
            <div
              ref={(el) => (contentRefs.current[index] = el)}
              className="absolute inset-0 z-20 flex flex-col items-center text-center px-6
                         justify-start pt-[5vh]
                         md:justify-center md:pt-0"
            >
              <h3
                className="text-evolve-pink font-extrabold lowercase text-center"
                style={{
                  fontSize: "clamp(48px, 8vw, 96px)",
                  letterSpacing: "-0.03em",
                  lineHeight: "1"
                }}
              >
                {card.title}
              </h3>
              <p className="mt-2 font-bold lowercase text-black text-[20px] md:text-[36px]">
                {card.subtitle}
              </p>
              {/* <p className="mt-3 max-w-2xl text-black font-normal md:font-normal text-[16px] md:text-[20px] leading-tight">
                {card.description}
              </p> */}
              {/* Mobile description */}
              <p className="mt-3 max-w-2xl text-black font-normal text-[16px] leading-tight md:hidden">
                {card.descriptionMobile}
              </p>

              {/* Desktop description */}
              <p className="mt-3 max-w-2xl text-black font-normal text-[20px] leading-tight hidden md:block">
                {card.descriptionDesktop}
              </p>
            </div>

            {/* Desktop Images */}
            {card.desktopImages.map((img, i) => (
              <img
                key={`desktop-${i}`}
                src={img.src}
                alt=""
                className="card-image hidden md:block absolute bottom-0 z-10"
                style={{
                  left:
                    img.position === "left"
                      ? "0"
                      : img.position === "right"
                        ? "auto"
                        : "50%",
                  right: img.position === "right" ? "0" : "auto",
                  transform:
                    img.position === "center" ? "translateX(-50%)" : "none"
                }}
              />
            ))}

            {/* Mobile Image */}
            <img
              src={card.mobileImage}
              alt=""
              className="card-image md:hidden absolute bottom-0 left-0 w-full z-10"
            />
          </div>
        ))}

        {/* Extra space at bottom for last card collapse */}
        {/* <div style={{ height: "100vh" }} /> */}
      </section>
    </div>
  );
};

export default Community;
