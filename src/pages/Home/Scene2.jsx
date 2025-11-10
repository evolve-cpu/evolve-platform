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
