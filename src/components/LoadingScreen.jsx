import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { evolve_cube } from "../assets/images/Home";
import { isAnant } from "../tenants";
import { anant_logo } from "../assets/images/Community";

const ANIMATION_CONFIG = {
  exit: { opacity: 0, duration: 0.5 },
  progress: {
    type: "spring",
    stiffness: 100,
    damping: 20,
    mass: 0.5
  },
  pulse: {
    y: [0, -8, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const LoadingScreen = ({ progress = 0 }) => {
  const roundedProgress = Math.round(progress);

  useEffect(() => {
    // Prevent scrolling while loading screen is visible
    const scrollY = window.scrollY;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    // Reset scroll position to top
    window.scrollTo(0, 0);

    return () => {
      // Restore scrolling when component unmounts
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      // Ensure page starts from top
      window.scrollTo(0, 0);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: ANIMATION_CONFIG.exit.duration }}
      className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center will-change-opacity"
      role="status"
      aria-live="polite"
      aria-label={`Loading ${roundedProgress} percent complete`}
    >
      {isAnant ? (
        <motion.img
          src={anant_logo}
          alt="Anant National University"
          className="h-12 w-auto mb-8 mx-auto"
          animate={ANIMATION_CONFIG.pulse}
        />
      ) : (
        <motion.img
          src={evolve_cube}
          alt="Evolve cube"
          className="w-32 h-auto mb-8 mx-auto"
          animate={ANIMATION_CONFIG.pulse}
        />
      )}

      {/* Progress Bar */}
      <div
        className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden mx-auto"
        aria-hidden="true"
      >
        <motion.div
          className={`h-full will-change-transform ${isAnant ? "" : "bg-evolve-yellow"}`}
          style={isAnant ? { background: "#2563eb" } : {}}
          style={{ transform: "translateZ(0)" }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={ANIMATION_CONFIG.progress}
        />
      </div>

      {/* Progress Percentage */}
      <motion.p
        className={`mt-4 text-sm font-medium text-center ${isAnant ? "" : "text-evolve-yellow"}`}
        style={isAnant ? { color: "#93c5fd" } : {}}
        key={roundedProgress}
        initial={{ opacity: 0.7 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
      >
        {roundedProgress}%
      </motion.p>
    </motion.div>
  );
};

export default LoadingScreen;
