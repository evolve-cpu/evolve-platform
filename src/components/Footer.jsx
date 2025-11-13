// import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
// import { gsap } from "gsap";

// // assets
// import {
//   marquee_vector_1,
//   evolve_text,
//   marquee_vector_2
// } from "../assets/images/Nav";
// import {
//   hand_with_thunder,
//   hand_with_thunder_mobile
// } from "../assets/images/Home";

// const useIsMobile = (bp = 768) => {
//   const [isMobile, setIsMobile] = useState(
//     typeof window !== "undefined" ? window.innerWidth < bp : false
//   );
//   useEffect(() => {
//     const onResize = () => setIsMobile(window.innerWidth < bp);
//     window.addEventListener("resize", onResize);
//     return () => window.removeEventListener("resize", onResize);
//   }, [bp]);
//   return isMobile;
// };

// const Footer = () => {
//   const isMobile = useIsMobile();

//   const marqueeRef = useRef(null);
//   const marqueeTrackRef = useRef(null);
//   const marqueeGroupRef = useRef(null);
//   const marqueeTL = useRef(null);

//   useLayoutEffect(() => {
//     const container = marqueeRef.current;
//     const track = marqueeTrackRef.current;
//     const group = marqueeGroupRef.current;
//     if (!container || !track || !group) return;

//     // reset
//     marqueeTL.current?.kill();
//     marqueeTL.current = null;
//     [...track.querySelectorAll("[data-marquee-clone='1']")].forEach((n) =>
//       n.remove()
//     );

//     // clone to fill width
//     const groupWidth = group.getBoundingClientRect().width || 1;
//     const containerWidth = container.getBoundingClientRect().width || 1;
//     const needed = Math.max(2, Math.ceil(containerWidth / groupWidth) + 1);

//     for (let i = 0; i < needed; i++) {
//       const clone = group.cloneNode(true);
//       clone.setAttribute("data-marquee-clone", "1");
//       track.appendChild(clone);
//     }

//     container.style.opacity = "1";

//     marqueeTL.current = gsap.timeline({ repeat: -1 });
//     marqueeTL.current.to(track, {
//       x: -groupWidth,
//       duration: 8,
//       ease: "none",
//       onRepeat: () => gsap.set(track, { x: 0 })
//     });

//     return () => marqueeTL.current?.kill();
//   }, [isMobile]);

//   return (
//     <footer className="relative w-full bg-evolve-yellow text-black overflow-hidden">
//       {/* =================== DESKTOP (md+) =================== */}
//       <div className="hidden md:block relative">
//         <div className="max-w-[1200px] mx-auto px-8 py-16 relative">
//           {/* text/content layer above svg */}
//           <div className="relative z-30 w-2/3">
//             <h2 className="font-extrabold lowercase text-[4rem] leading-[1.1]">
//               ready to be remarkable?
//             </h2>

//             <div className="mt-6">
//               <button
//                 className="bg-black text-white font-extrabold px-6 py-3 rounded-xl text-[1.5rem] leading-none"
//                 aria-label="join us"
//               >
//                 join us
//               </button>
//             </div>

//             <div className="h-px bg-black my-8" />

//             <div className="grid grid-cols-2 gap-12">
//               <div>
//                 <div className="text-[1.25rem] leading-none mb-4">
//                   navigation
//                 </div>
//                 <ul className="space-y-2 cursor-pointer">
//                   {[
//                     "home",
//                     "about us",
//                     "course",
//                     "webinar",
//                     "quiz",
//                     "community",
//                     "investors page"
//                   ].map((label) => (
//                     <li key={label} className="text-[2rem] leading-tight">
//                       {label}
//                     </li>
//                   ))}
//                 </ul>
//               </div>

//               <div>
//                 <div className="text-[1.25rem] leading-none mb-4">socials</div>
//                 <ul className="space-y-2 cursor-pointer">
//                   {[
//                     "instagram",
//                     "facebook",
//                     "youtube",
//                     "medium",
//                     "linkedin",
//                     "discord",
//                     "reddit"
//                   ].map((label) => (
//                     <li key={label} className="text-[2rem] leading-tight">
//                       {label}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </div>
//           </div>

//           {/* svg decoration below text but above background */}
//           <img
//             src={hand_with_thunder}
//             alt="hand with thunder"
//             className="pointer-events-none select-none absolute right-[-30vh] bottom-6 md:bottom-[-35vh] max-w-[90%] z-10"
//             style={{ transform: "translateY(-10%)" }}
//           />
//         </div>
//       </div>

//       {/* =================== MOBILE (base–md) =================== */}
//       <div className="md:hidden relative px-5 pt-8 pb-28">
//         <div className="relative z-30">
//           <h2 className="font-extrabold lowercase text-[2rem] leading-tight">
//             ready to be remarkable?
//           </h2>

//           <div className="mt-4">
//             <button className="bg-black text-white font-extrabold px-5 py-3 rounded-xl text-[1.5rem] leading-none">
//               join us
//             </button>
//           </div>

//           <div className="h-px bg-black my-6" />

//           <div>
//             {/* <div className="text-[1.25rem] leading-none mb-3">socials</div> */}
//             <ul className="space-y-1">
//               {[
//                 "instagram",
//                 "facebook",
//                 "youtube",
//                 "medium",
//                 "linkedin",
//                 "discord",
//                 "reddit"
//               ].map((label) => (
//                 <li key={label} className="text-[1.25rem] leading-[1.75rem]">
//                   {label}
//                 </li>
//               ))}
//             </ul>
//           </div>

//           <div className="h-px bg-black my-6" />

//           <div>
//             {/* <div className="text-[1.25rem] leading-none mb-3">navigation</div> */}
//             <ul className="space-y-1">
//               {[
//                 "home",
//                 "about us",
//                 "course",
//                 "webinar",
//                 "quiz",
//                 "community",
//                 "investors page"
//               ].map((label) => (
//                 <li key={label} className="text-[1.25rem] leading-[1.75rem]">
//                   {label}
//                 </li>
//               ))}
//             </ul>
//           </div>

//           <div className="h-px bg-black my-6" />

//           <div className="text-[0.9375rem] leading-6">
//             @2025 evolve. all rights reserved
//           </div>
//         </div>

//         {/* mobile svg below text */}
//         <img
//           src={hand_with_thunder_mobile}
//           alt="hand with thunder"
//           className="pointer-events-none select-none absolute right-2 bottom-2 w-[90%] z-10"
//         />
//       </div>

//       {/* ======= ONE shared slanted marquee for all breakpoints (middle layer) ======= */}
//       {/* <div className="pointer-events-none absolute left-0 right-0 bottom-0 origin-bottom rotate-[-3deg] z-20"> */}
//       <div className="pointer-events-none absolute left-[-6vw] right-[-6vw] bottom-0 origin-bottom rotate-[-3deg] z-20">
//         <div
//           ref={marqueeRef}
//           className={`relative left-1/2 -translate-x-1/2 w-[112vw] border-t-2 border-b-2 border-evolve-yellow bg-evolve-lavender-indigo overflow-hidden ${
//             isMobile ? "bottom-[10%] h-16" : "bottom-[-16vh] h-[10rem]"
//           }`}
//           style={{ opacity: 0 }}
//         >
//           <div
//             ref={marqueeTrackRef}
//             className="absolute top-1/2 -translate-y-1/2 left-0 flex whitespace-nowrap"
//             style={{ willChange: "transform" }}
//           >
//             <div
//               ref={marqueeGroupRef}
//               className={`flex items-center flex-none ${
//                 isMobile ? "gap-8 pr-8" : "gap-14 pr-14"
//               }`}
//             >
//               <img
//                 src={marquee_vector_1}
//                 alt="vector 1"
//                 className={`w-auto flex-none ${isMobile ? "h-10" : "h-[5rem]"}`}
//               />
//               <img
//                 src={evolve_text}
//                 alt="evolve text"
//                 className={`w-auto flex-none ${isMobile ? "h-8" : "h-[4rem]"}`}
//               />
//               <img
//                 src={marquee_vector_2}
//                 alt="vector 2"
//                 className={`w-auto flex-none ${isMobile ? "h-10" : "h-[5rem]"}`}
//               />
//               <img
//                 src={evolve_text}
//                 alt="evolve text"
//                 className={`w-auto flex-none ${isMobile ? "h-8" : "h-[4rem]"}`}
//               />
//               <img
//                 src={marquee_vector_1}
//                 alt="vector 1"
//                 className={`w-auto flex-none ${isMobile ? "h-10" : "h-[5rem]"}`}
//               />
//               <img
//                 src={evolve_text}
//                 alt="evolve text"
//                 className={`w-auto flex-none ${isMobile ? "h-8" : "h-[4rem]"}`}
//               />
//               <img
//                 src={marquee_vector_2}
//                 alt="vector 2"
//                 className={`w-auto flex-none ${isMobile ? "h-10" : "h-[5rem]"}`}
//               />
//               <img
//                 src={evolve_text}
//                 alt="evolve text"
//                 className={`w-auto flex-none ${isMobile ? "h-8" : "h-[4rem]"}`}
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;

// import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
// import { gsap } from "gsap";

// // assets
// import {
//   marquee_vector_1,
//   evolve_text,
//   marquee_vector_2
// } from "../assets/images/Nav";
// import {
//   hand_with_thunder,
//   hand_with_thunder_mobile
// } from "../assets/images/Home";

// const useIsMobile = (bp = 768) => {
//   const [isMobile, setIsMobile] = useState(
//     typeof window !== "undefined" ? window.innerWidth < bp : false
//   );
//   useEffect(() => {
//     const onResize = () => setIsMobile(window.innerWidth < bp);
//     window.addEventListener("resize", onResize);
//     return () => window.removeEventListener("resize", onResize);
//   }, [bp]);
//   return isMobile;
// };

// const Footer = () => {
//   const isMobile = useIsMobile();

//   const marqueeRef = useRef(null);
//   const marqueeTrackRef = useRef(null);
//   const marqueeGroupRef = useRef(null);
//   const marqueeTL = useRef(null);

//   useLayoutEffect(() => {
//     const container = marqueeRef.current;
//     const track = marqueeTrackRef.current;
//     const group = marqueeGroupRef.current;
//     if (!container || !track || !group) return;

//     // reset previous state
//     marqueeTL.current?.kill();
//     marqueeTL.current = null;
//     [...track.querySelectorAll("[data-marquee-clone='1']")].forEach((n) =>
//       n.remove()
//     );
//     gsap.set(track, { x: 0 });

//     // clone to fill width
//     const groupWidth = group.getBoundingClientRect().width || 1;
//     const containerWidth = container.getBoundingClientRect().width || 1;
//     const needed = Math.max(2, Math.ceil(containerWidth / groupWidth) + 1);

//     for (let i = 0; i < needed; i++) {
//       const clone = group.cloneNode(true);
//       clone.setAttribute("data-marquee-clone", "1");
//       track.appendChild(clone);
//     }

//     container.style.opacity = "1";

//     marqueeTL.current = gsap.timeline({ repeat: -1 });
//     marqueeTL.current.to(track, {
//       x: -groupWidth,
//       duration: 8,
//       ease: "none",
//       onRepeat: () => gsap.set(track, { x: 0 })
//     });

//     return () => marqueeTL.current?.kill();
//   }, [isMobile]);

//   return (
//     <footer className="relative w-full bg-evolve-yellow text-black overflow-hidden min-h-screen md:min-h-screen md:min-h-[100dvh] isolate">
//       {/* =================== DESKTOP (md+) =================== */}
//       <div className="hidden md:block relative min-h-screen md:min-h-[100dvh]">
//         <div className="max-w-[1200px] mx-auto px-8 pt-16 pb-[14rem] relative min-h-screen md:min-h-[100dvh]">
//           {/* text/content layer */}
//           <div className="relative z-30 w-2/3 h-full">
//             <h2 className="font-extrabold lowercase text-[4rem] leading-[1.1]">
//               ready to be remarkable?
//             </h2>

//             <div className="mt-6">
//               <button
//                 className="bg-black text-white font-extrabold px-6 py-3 rounded-xl text-[1.5rem] leading-none"
//                 aria-label="join us"
//               >
//                 join us
//               </button>
//             </div>

//             <div className="h-px bg-black my-8" />

//             <div className="grid grid-cols-2 gap-12">
//               <div>
//                 <div className="text-[1.25rem] leading-none mb-4">
//                   navigation
//                 </div>
//                 <ul className="space-y-2 cursor-pointer">
//                   {[
//                     "home",
//                     // "about us",
//                     // "course",
//                     // "webinar",
//                     // "quiz",
//                     // "community",
//                     // "investors page"
//                     "contact us"
//                   ].map((label) => (
//                     <li key={label} className="text-[2rem] leading-tight">
//                       {label}
//                     </li>
//                   ))}
//                 </ul>
//               </div>

//               <div>
//                 <div className="text-[1.25rem] leading-none mb-4">socials</div>
//                 <ul className="space-y-2 cursor-pointer">
//                   {[
//                     "instagram",
//                     "facebook",
//                     "youtube",
//                     "medium",
//                     "linkedin",
//                     "discord"
//                     // "reddit"
//                   ].map((label) => (
//                     <li key={label} className="text-[2rem] leading-tight">
//                       {label}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </div>
//           </div>

//           {/* decorative image */}
//           <img
//             src={hand_with_thunder}
//             alt="hand with thunder"
//             className="pointer-events-none select-none absolute right-[-30vh] bottom-6 md:bottom-[-35vh] max-w-[90%] z-10"
//             style={{ transform: "translateY(-10%)" }}
//           />
//         </div>
//       </div>

//       {/* =================== MOBILE (base–md) =================== */}
//       <div className="md:hidden relative px-5 pt-8 pb-28">
//         <div className="relative z-30">
//           <h2 className="font-extrabold lowercase text-[2rem] leading-tight">
//             ready to be remarkable?
//           </h2>

//           <div className="mt-4">
//             <button className="bg-black text-white font-extrabold px-5 py-3 rounded-xl text-[1.5rem] leading-none">
//               join us
//             </button>
//           </div>

//           <div className="h-px bg-black my-6" />

//           <div>
//             <ul className="space-y-1">
//               {[
//                 "instagram",
//                 "facebook",
//                 "youtube",
//                 "medium",
//                 "linkedin",
//                 "discord"
//                 // "reddit"
//               ].map((label) => (
//                 <li key={label} className="text-[1.25rem] leading-[1.75rem]">
//                   {label}
//                 </li>
//               ))}
//             </ul>
//           </div>

//           <div className="h-px bg-black my-6" />

//           <div>
//             <ul className="space-y-1">
//               {[
//                 "home",
//                 // "about us",
//                 // "course",
//                 // "webinar",
//                 // "quiz",
//                 // "community",
//                 // "investors page",
//                 "contact us"
//               ].map((label) => (
//                 <li key={label} className="text-[1.25rem] leading-[1.75rem]">
//                   {label}
//                 </li>
//               ))}
//             </ul>
//           </div>

//           <div className="h-px bg-black my-6" />

//           <div className="text-[0.9375rem] leading-6">
//             @2025 evolve. all rights reserved
//           </div>
//         </div>

//         {/* mobile svg below text */}
//         <img
//           src={hand_with_thunder_mobile}
//           alt="hand with thunder"
//           className="pointer-events-none select-none absolute right-2 bottom-2 w-[90%] z-10"
//         />
//       </div>

//       {/* ======= shared slanted marquee ======= */}
//       <div className="pointer-events-none absolute left-[-6vw] right-[-6vw] bottom-0 origin-bottom rotate-[-3deg] z-20">
//         <div
//           ref={marqueeRef}
//           className={`relative left-1/2 -translate-x-1/2 w-[112vw] border-t-2 border-b-2 border-evolve-yellow bg-evolve-lavender-indigo overflow-hidden ${
//             isMobile ? "bottom-[10%] h-16" : "bottom-[-16vh] h-[10rem]"
//           }`}
//           style={{ opacity: 0 }}
//         >
//           <div
//             ref={marqueeTrackRef}
//             className="absolute top-1/2 -translate-y-1/2 left-0 flex whitespace-nowrap"
//             style={{ willChange: "transform" }}
//           >
//             <div
//               ref={marqueeGroupRef}
//               className={`flex items-center flex-none ${
//                 isMobile ? "gap-8 pr-8" : "gap-14 pr-14"
//               }`}
//             >
//               <img
//                 src={marquee_vector_1}
//                 alt="vector 1"
//                 className={`w-auto flex-none ${isMobile ? "h-10" : "h-[5rem]"}`}
//               />
//               <img
//                 src={evolve_text}
//                 alt="evolve text"
//                 className={`w-auto flex-none ${isMobile ? "h-8" : "h-[4rem]"}`}
//               />
//               <img
//                 src={marquee_vector_2}
//                 alt="vector 2"
//                 className={`w-auto flex-none ${isMobile ? "h-10" : "h-[5rem]"}`}
//               />
//               <img
//                 src={evolve_text}
//                 alt="evolve text"
//                 className={`w-auto flex-none ${isMobile ? "h-8" : "h-[4rem]"}`}
//               />
//               <img
//                 src={marquee_vector_1}
//                 alt="vector 1"
//                 className={`w-auto flex-none ${isMobile ? "h-10" : "h-[5rem]"}`}
//               />
//               <img
//                 src={evolve_text}
//                 alt="evolve text"
//                 className={`w-auto flex-none ${isMobile ? "h-8" : "h-[4rem]"}`}
//               />
//               <img
//                 src={marquee_vector_2}
//                 alt="vector 2"
//                 className={`w-auto flex-none ${isMobile ? "h-10" : "h-[5rem]"}`}
//               />
//               <img
//                 src={evolve_text}
//                 alt="evolve text"
//                 className={`w-auto flex-none ${isMobile ? "h-8" : "h-[4rem]"}`}
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Link } from "react-router-dom";

// assets
import {
  marquee_vector_1,
  evolve_text,
  marquee_vector_2
} from "../assets/images/Nav";
import {
  hand_with_thunder,
  hand_with_thunder_mobile
} from "../assets/images/Home";

const useIsMobile = (bp = 768) => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < bp : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < bp);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [bp]);
  return isMobile;
};

const Footer = () => {
  const isMobile = useIsMobile();

  const marqueeRef = useRef(null);
  const marqueeTrackRef = useRef(null);
  const marqueeGroupRef = useRef(null);
  const marqueeTL = useRef(null);

  const navigationLinks = [
    { label: "home", path: "/" },
    { label: "contact us", path: "/contact" }
  ];

  const socialLinks = [
    { label: "instagram", url: "https://www.instagram.com/evolvebypaperclip/" },
    { label: "facebook", url: "#" },
    { label: "youtube", url: "https://www.youtube.com/@evolvebypaperclip" },
    { label: "medium", url: "#" },
    { label: "linkedin", url: "#" },
    {
      label: "discord",
      url: "https://discord.com/channels/@me/1347086283985649749/1438414139365265479"
    }
  ];

  useLayoutEffect(() => {
    const container = marqueeRef.current;
    const track = marqueeTrackRef.current;
    const group = marqueeGroupRef.current;
    if (!container || !track || !group) return;

    // reset previous state
    marqueeTL.current?.kill();
    marqueeTL.current = null;
    [...track.querySelectorAll("[data-marquee-clone='1']")].forEach((n) =>
      n.remove()
    );
    gsap.set(track, { x: 0 });

    // clone to fill width
    const groupWidth = group.getBoundingClientRect().width || 1;
    const containerWidth = container.getBoundingClientRect().width || 1;
    const needed = Math.max(2, Math.ceil(containerWidth / groupWidth) + 1);

    for (let i = 0; i < needed; i++) {
      const clone = group.cloneNode(true);
      clone.setAttribute("data-marquee-clone", "1");
      track.appendChild(clone);
    }

    container.style.opacity = "1";

    marqueeTL.current = gsap.timeline({ repeat: -1 });
    marqueeTL.current.to(track, {
      x: -groupWidth,
      duration: 8,
      ease: "none",
      onRepeat: () => gsap.set(track, { x: 0 })
    });

    return () => marqueeTL.current?.kill();
  }, [isMobile]);

  return (
    <footer className="relative w-full bg-evolve-yellow text-black overflow-hidden min-h-screen md:min-h-screen md:min-h-[100dvh] isolate">
      {/* =================== DESKTOP (md+) =================== */}
      <div className="hidden md:block relative min-h-screen md:min-h-[100dvh]">
        <div className="max-w-[1200px] mx-auto px-8 pt-16 pb-[14rem] relative min-h-screen md:min-h-[100dvh]">
          {/* text/content layer */}
          <div className="relative z-30 w-2/3 h-full">
            <h2 className="font-extrabold lowercase text-[4rem] leading-[1.1]">
              ready to be remarkable?
            </h2>

            <div className="mt-6">
              {/* <button
                className="bg-black text-white font-extrabold px-6 py-3 rounded-xl text-[1.5rem] leading-none"
                aria-label="join us"
              >
                join us
              </button> */}
              <a
                href="https://discord.com/channels/@me/1347086283985649749/1438414139365265479"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-black text-white font-extrabold px-5 py-3 rounded-xl text-[1.5rem] leading-none"
              >
                join us
              </a>
            </div>

            <div className="h-px bg-black my-8" />

            <div className="grid grid-cols-2 gap-12">
              <div>
                <div className="text-[1.25rem] leading-none mb-4">
                  navigation
                </div>
                <ul className="space-y-2">
                  {navigationLinks.map((item) => (
                    <li key={item.label}>
                      <Link
                        to={item.path}
                        className="text-[2rem] leading-tight hover:text-evolve-pink transition-colors duration-300"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-[1.25rem] leading-none mb-4">socials</div>
                <ul className="space-y-2">
                  {socialLinks.map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[2rem] leading-tight hover:text-evolve-pink transition-colors duration-300"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* decorative image */}
          <img
            src={hand_with_thunder}
            alt="hand with thunder"
            className="pointer-events-none select-none absolute right-[-30vh] bottom-6 md:bottom-[-35vh] max-w-[90%] z-10"
            style={{ transform: "translateY(-10%)" }}
          />
        </div>
      </div>

      {/* =================== MOBILE (base–md) =================== */}
      <div className="md:hidden relative px-5 pt-8 pb-28">
        <div className="relative z-30">
          <h2 className="font-extrabold lowercase text-[2rem] leading-tight">
            ready to be remarkable?
          </h2>

          <div className="mt-4">
            <button className="bg-black text-white font-extrabold px-5 py-3 rounded-xl text-[1.5rem] leading-none">
              join us
            </button>
          </div>

          <div className="h-px bg-black my-6" />

          <div>
            <ul className="space-y-1">
              {socialLinks.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[1.25rem] leading-[1.75rem] hover:text-evolve-pink transition-colors duration-300"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="h-px bg-black my-6" />

          <div>
            <ul className="space-y-1">
              {navigationLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    className="text-[1.25rem] leading-[1.75rem] hover:text-evolve-pink transition-colors duration-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="h-px bg-black my-6" />

          <div className="text-[0.9375rem] leading-6">
            @2025 evolve. all rights reserved
          </div>
        </div>

        {/* mobile svg below text */}
        <img
          src={hand_with_thunder_mobile}
          alt="hand with thunder"
          className="pointer-events-none select-none absolute right-2 bottom-2 w-[90%] z-10"
        />
      </div>

      {/* ======= shared slanted marquee ======= */}
      <div className="pointer-events-none absolute left-[-6vw] right-[-6vw] bottom-0 origin-bottom rotate-[-3deg] z-20">
        <div
          ref={marqueeRef}
          className={`relative left-1/2 -translate-x-1/2 w-[112vw] border-t-2 border-b-2 border-evolve-yellow bg-evolve-lavender-indigo overflow-hidden ${
            isMobile ? "bottom-[10%] h-16" : "bottom-[-16vh] h-[10rem]"
          }`}
          style={{ opacity: 0 }}
        >
          <div
            ref={marqueeTrackRef}
            className="absolute top-1/2 -translate-y-1/2 left-0 flex whitespace-nowrap"
            style={{ willChange: "transform" }}
          >
            <div
              ref={marqueeGroupRef}
              className={`flex items-center flex-none ${
                isMobile ? "gap-8 pr-8" : "gap-14 pr-14"
              }`}
            >
              <img
                src={marquee_vector_1}
                alt="vector 1"
                className={`w-auto flex-none ${isMobile ? "h-10" : "h-[5rem]"}`}
              />
              <img
                src={evolve_text}
                alt="evolve text"
                className={`w-auto flex-none ${isMobile ? "h-8" : "h-[4rem]"}`}
              />
              <img
                src={marquee_vector_2}
                alt="vector 2"
                className={`w-auto flex-none ${isMobile ? "h-10" : "h-[5rem]"}`}
              />
              <img
                src={evolve_text}
                alt="evolve text"
                className={`w-auto flex-none ${isMobile ? "h-8" : "h-[4rem]"}`}
              />
              <img
                src={marquee_vector_1}
                alt="vector 1"
                className={`w-auto flex-none ${isMobile ? "h-10" : "h-[5rem]"}`}
              />
              <img
                src={evolve_text}
                alt="evolve text"
                className={`w-auto flex-none ${isMobile ? "h-8" : "h-[4rem]"}`}
              />
              <img
                src={marquee_vector_2}
                alt="vector 2"
                className={`w-auto flex-none ${isMobile ? "h-10" : "h-[5rem]"}`}
              />
              <img
                src={evolve_text}
                alt="evolve text"
                className={`w-auto flex-none ${isMobile ? "h-8" : "h-[4rem]"}`}
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
