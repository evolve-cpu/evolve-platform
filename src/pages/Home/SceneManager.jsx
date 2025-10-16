import React, { useRef, useState, useCallback, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ============================================
// SCENE CONTEXT & PROVIDER
// ============================================
const SceneContext = React.createContext();

export const SceneProvider = ({ children }) => {
  const [currentScene, setCurrentScene] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const sceneRefsRef = useRef({});
  const transitionTimelineRef = useRef(null);
  const currentSceneRef = useRef(0);
  const isTransitioningRef = useRef(false);

  const transitionToScene = useCallback((targetScene, direction = "down") => {
    console.log(
      `🔄 Attempting transition: ${currentSceneRef.current} → ${targetScene}, isTransitioning: ${isTransitioningRef.current}`
    );

    if (isTransitioningRef.current) {
      console.log("⏸️ Already transitioning, ignoring");
      return;
    }

    if (currentSceneRef.current === targetScene) {
      console.log("⏸️ Already on this scene, ignoring");
      return;
    }

    console.log(`✅ Starting transition to scene ${targetScene}`);
    isTransitioningRef.current = true;
    setIsTransitioning(true);

    // Kill previous timeline if exists
    if (transitionTimelineRef.current) {
      transitionTimelineRef.current.kill();
    }

    // Get scene elements
    const fromSceneEl = sceneRefsRef.current[currentSceneRef.current];
    const toSceneEl = sceneRefsRef.current[targetScene];

    if (!toSceneEl) {
      console.error(`❌ Scene ${targetScene} element not found`);
      isTransitioningRef.current = false;
      setIsTransitioning(false);
      return;
    }

    console.log(
      `📍 Scene elements found. From:`,
      fromSceneEl,
      "To:",
      toSceneEl
    );

    // Disable scroll during transition
    document.body.style.overflow = "hidden";
    ScrollTrigger.disable();

    const tl = gsap.timeline({
      onComplete: () => {
        console.log(
          `✨ Transition animation complete, updating state to scene ${targetScene}`
        );

        // Update refs and state
        currentSceneRef.current = targetScene;
        isTransitioningRef.current = false;
        setCurrentScene(targetScene);
        setIsTransitioning(false);

        // Re-enable scroll
        document.body.style.overflow = "auto";
        ScrollTrigger.enable();
        ScrollTrigger.refresh();

        // Reset scroll
        window.scrollTo(0, 0);

        console.log(`🎉 Transition complete! Now on scene ${targetScene}`);
      }
    });

    transitionTimelineRef.current = tl;

    // Animate entrance
    if (direction === "down") {
      console.log("⬇️ Direction: DOWN (slide up from bottom)");
      tl.fromTo(
        toSceneEl,
        { y: "100%", opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: "power3.inOut" },
        0
      );
    } else {
      console.log("⬆️ Direction: UP (slide down from top)");
      tl.fromTo(
        toSceneEl,
        { y: "-100%", opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: "power3.inOut" },
        0
      );
    }
  }, []);

  const registerSceneRef = useCallback((sceneIndex, ref) => {
    console.log(`📌 Registering Scene ${sceneIndex}`, ref);
    sceneRefsRef.current[sceneIndex] = ref;
  }, []);

  // Keep refs in sync with state
  useEffect(() => {
    currentSceneRef.current = currentScene;
    console.log(`📊 Current scene updated to: ${currentScene}`);
  }, [currentScene]);

  useEffect(() => {
    isTransitioningRef.current = isTransitioning;
  }, [isTransitioning]);

  return (
    <SceneContext.Provider
      value={{
        currentScene,
        isTransitioning,
        transitionToScene,
        registerSceneRef
      }}
    >
      {children}
    </SceneContext.Provider>
  );
};

export const useSceneTransition = () => {
  const context = React.useContext(SceneContext);
  if (!context) {
    throw new Error("useSceneTransition must be used within SceneProvider");
  }
  return context;
};

// ============================================
// SCENE WRAPPER
// ============================================
export const SceneWrapper = ({ sceneIndex, children, className = "" }) => {
  const { currentScene, registerSceneRef } = useSceneTransition();
  const sceneRef = useRef(null);

  useEffect(() => {
    if (sceneRef.current) {
      registerSceneRef(sceneIndex, sceneRef.current);
    }
  }, [sceneIndex, registerSceneRef]);

  const isVisible = currentScene >= sceneIndex;

  useEffect(() => {
    console.log(
      `👀 Scene ${sceneIndex}: isVisible=${isVisible}, currentScene=${currentScene}`
    );
  }, [isVisible, sceneIndex, currentScene]);

  return (
    <div
      ref={sceneRef}
      data-scene={sceneIndex}
      className={className}
      style={{
        position: currentScene === sceneIndex ? "relative" : "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        minHeight: "100vh",
        zIndex: currentScene === sceneIndex ? "auto" : 50 + sceneIndex,
        display: "block", // Always display so GSAP can animate
        visibility: isVisible ? "visible" : "hidden",
        overflow: "hidden"
      }}
    >
      {children}
    </div>
  );
};

// ============================================
// SCENE NAVIGATION BUTTON
// ============================================
export const SceneNavButton = ({
  label,
  targetScene,
  direction = "down",
  className = ""
}) => {
  const { transitionToScene, isTransitioning } = useSceneTransition();

  return (
    <button
      onClick={() => {
        console.log(`🔘 Button clicked: ${label}`);
        transitionToScene(targetScene, direction);
      }}
      disabled={isTransitioning}
      className={`px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg ${className}`}
    >
      {label}
    </button>
  );
};
