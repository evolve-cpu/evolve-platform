// import React, { useEffect, useRef } from "react";
// import { gsap } from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";

// gsap.registerPlugin(ScrollTrigger);

// const Scene2 = () => {
//   const containerRef = useRef(null);
//   const contentRef = useRef(null);

//   useEffect(() => {
//     const ctx = gsap.context(() => {
//       // initial state: hidden + slightly zoomed out
//       gsap.set(containerRef.current, { opacity: 0, scale: 1.2 });

//       const tl = gsap.timeline({
//         scrollTrigger: {
//           trigger: containerRef.current,
//           start: "top center", // starts while Scene1 still pinned
//           end: "bottom top",
//           scrub: 1,
//           pin: true,
//           pinSpacing: false, // removes blank gap
//           anticipatePin: 1,
//           markers: false,
//           // ensures it layers above Scene1
//           onEnter: () => gsap.set(containerRef.current, { zIndex: 300 }),
//           onLeaveBack: () => gsap.set(containerRef.current, { zIndex: 0 })
//         }
//       });

//       // zoom + fade in Scene2 over Scene1
//       tl.to(containerRef.current, {
//         opacity: 1,
//         scale: 1,
//         duration: 2,
//         ease: "power2.out"
//       });
//     }, containerRef);

//     return () => ctx.revert();
//   }, []);

//   return (
//     <section
//       ref={containerRef}
//       className="w-full h-screen flex items-center justify-center bg-[#0f0f0f]"
//       style={{
//         position: "absolute", // overlays Scene1
//         top: 0,
//         left: 0,
//         zIndex: 0
//       }}
//     >
//       <div ref={contentRef} className="text-center">
//         <h1 className="text-[clamp(40px,7vw,120px)] text-[#FFD007] font-bold mb-4">
//           scene 2
//         </h1>
//         <p className="text-gray-300 text-[clamp(16px,2vw,24px)] max-w-[600px] mx-auto">
//           zoom-in transition over scene 1 — no blank scroll.
//         </p>
//       </div>
//     </section>
//   );
// };

// export default Scene2;

// import React, { useEffect, useRef, useState } from "react";
// import { gsap } from "gsap";
// import { useSceneTransition, SceneNavButton } from "./SceneManager";

// const Scene2 = () => {
//   const containerRef = useRef(null);
//   const titleRef = useRef(null);
//   const contentBoxRef = useRef(null);
//   const cardsRef = useRef([]);
//   const ctaButtonRef = useRef(null);
//   const { currentScene, isTransitioning } = useSceneTransition();

//   const isActive = currentScene === 1; // Scene2 is index 1

//   // 🎬 Scene2 animations - Only run when active
//   useEffect(() => {
//     if (!isActive || isTransitioning) return;

//     const ctx = gsap.context(() => {
//       // 🛑 Reset initial states
//       gsap.set(titleRef.current, { opacity: 0, y: 50 });
//       gsap.set(contentBoxRef.current, { opacity: 0, scale: 0.95 });
//       gsap.set(cardsRef.current, { opacity: 0, y: 100 });
//       gsap.set(ctaButtonRef.current, { opacity: 0, y: 20 });

//       // 🎥 Main Scene2 timeline
//       const tl = gsap.timeline();

//       // ✨ Staggered entrance animations
//       tl.to(titleRef.current, {
//         opacity: 1,
//         y: 0,
//         duration: 0.8,
//         ease: "power3.out"
//       })
//         .to(
//           contentBoxRef.current,
//           {
//             opacity: 1,
//             scale: 1,
//             duration: 1,
//             ease: "back.out(1.7)"
//           },
//           "-=0.4"
//         )
//         .to(
//           cardsRef.current,
//           {
//             opacity: 1,
//             y: 0,
//             duration: 0.8,
//             ease: "power3.out",
//             stagger: 0.15
//           },
//           "-=0.6"
//         )
//         .to(
//           ctaButtonRef.current,
//           {
//             opacity: 1,
//             y: 0,
//             duration: 0.6,
//             ease: "power2.out"
//           },
//           "-=0.4"
//         );

//       // 🔄 Floating animation for cards (continuous)
//       cardsRef.current.forEach((card, index) => {
//         gsap.to(card, {
//           y: -10,
//           duration: 3 + index * 0.3,
//           repeat: -1,
//           yoyo: true,
//           ease: "sine.inOut"
//         });
//       });

//       // 🎯 Button hover effect
//       if (ctaButtonRef.current) {
//         ctaButtonRef.current.addEventListener("mouseenter", () => {
//           gsap.to(ctaButtonRef.current, {
//             scale: 1.05,
//             duration: 0.3,
//             ease: "power2.out"
//           });
//         });

//         ctaButtonRef.current.addEventListener("mouseleave", () => {
//           gsap.to(ctaButtonRef.current, {
//             scale: 1,
//             duration: 0.3,
//             ease: "power2.out"
//           });
//         });
//       }
//     }, containerRef);

//     return () => ctx.revert();
//   }, [isActive, isTransitioning]);

//   return (
//     <div
//       ref={containerRef}
//       className="w-full min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center py-20"
//     >
//       {/* Background gradient glow */}
//       <div className="absolute inset-0 pointer-events-none">
//         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-10" />
//         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-10" />
//       </div>

//       {/* Content */}
//       <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
//         {/* Title */}
//         <h2
//           ref={titleRef}
//           className="text-6xl md:text-7xl font-[800] text-white mb-8 font-[Bricolage_Grotesque] leading-tight"
//         >
//           Discover
//           <br />
//           <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
//             Amazing Features
//           </span>
//         </h2>

//         {/* Description Box */}
//         <div
//           ref={contentBoxRef}
//           className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-12"
//         >
//           <p className="text-white/80 text-lg leading-relaxed">
//             Experience cutting-edge animations with our powerful GSAP timeline
//             system. Each scene has its own isolated animations with smooth
//             transitions between them.
//           </p>
//         </div>

//         {/* Feature Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
//           {[
//             { icon: "⚡", title: "Fast", desc: "Optimized animations" },
//             { icon: "🎨", title: "Beautiful", desc: "Smooth transitions" },
//             { icon: "🔧", title: "Flexible", desc: "Easy to customize" }
//           ].map((feature, idx) => (
//             <div
//               key={idx}
//               ref={(el) => (cardsRef.current[idx] = el)}
//               className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 rounded-xl p-6 hover:border-blue-400/30 transition-colors"
//             >
//               <div className="text-4xl mb-4">{feature.icon}</div>
//               <h3 className="text-white font-bold text-lg mb-2">
//                 {feature.title}
//               </h3>
//               <p className="text-white/60 text-sm">{feature.desc}</p>
//             </div>
//           ))}
//         </div>

//         {/* Navigation Buttons */}
//         <div className="flex flex-col sm:flex-row gap-4 justify-center">
//           <SceneNavButton
//             label="← Back to Scene 1"
//             targetScene={0}
//             direction="up"
//           />
//           <SceneNavButton
//             label="Next Scene →"
//             targetScene={2}
//             direction="down"
//             className="opacity-50 cursor-not-allowed"
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Scene2;

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useSceneTransition, SceneNavButton } from "./SceneManager";

const Scene2 = () => {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const { currentScene } = useSceneTransition();

  console.log("🎬 Scene2 rendered. CurrentScene:", currentScene);

  // Simple animations when Scene2 becomes active
  useEffect(() => {
    if (currentScene !== 1) {
      console.log("❌ Scene2 not active, skipping animations");
      return;
    }

    console.log("✅ Scene2 is ACTIVE! Running animations...");

    const ctx = gsap.context(() => {
      gsap.set(titleRef.current, { opacity: 0, y: 50 });

      gsap.to(titleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out"
      });
    }, containerRef);

    return () => ctx.revert();
  }, [currentScene]);

  return (
    <div
      ref={containerRef}
      className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black flex flex-col items-center justify-center p-6"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-10" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-10" />
      </div>

      <div className="relative z-10 max-w-4xl text-center">
        <h1
          ref={titleRef}
          className="text-6xl md:text-7xl font-[800] text-white mb-8 font-[Bricolage_Grotesque]"
        >
          🎉
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            Scene 2 is HERE!
          </span>
        </h1>

        <p className="text-white/80 text-xl mb-12 leading-relaxed">
          If you're seeing this, the transition worked! 🚀
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <SceneNavButton
            label="← Back to Scene 1"
            targetScene={0}
            direction="up"
          />
        </div>
      </div>
    </div>
  );
};

export default Scene2;
