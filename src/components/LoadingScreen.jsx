// import React from "react";
// import { motion } from "framer-motion";
// import { evolve_2d } from "../assets/images/Home";
// import {
//   evolve_logo_mobile,
//   evolve_logo_nav,
//   evolve_logo_nav_white
// } from "../assets/images/Nav";

// const LoadingScreen = ({ progress }) => {
//   return (
//     <motion.div
//       initial={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       transition={{ duration: 0.5 }}
//       className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
//     >
//       <div className="text-center">
//         {/* Your Evolve Logo */}
//         <div className="mb-8">
//           <div className="text-4xl md:text-6xl font-bold font-bricolage lowercase text-evolve-lavender-indigo">
//             {/* EVOLVE */}
//             <img src={evolve_logo_nav_white} alt="" />
//           </div>
//         </div>

//         {/* Loading Bar */}
//         <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
//           <motion.div
//             className="h-full bg-evolve-yellow"
//             initial={{ width: 0 }}
//             animate={{ width: `${progress}%` }}
//             transition={{ duration: 0.3 }}
//           />
//         </div>

//         {/* Percentage */}
//         <p className="text-evolve-yellow mt-4 text-sm">
//           {Math.round(progress)}%
//         </p>
//       </div>
//     </motion.div>
//   );
// };

// export default LoadingScreen;

import React from "react";
import { motion } from "framer-motion";
import { evolve_logo_nav_white } from "../assets/images/Nav";

const ANIMATION_CONFIG = {
  exit: { opacity: 0, duration: 0.5 },
  progress: {
    type: "spring",
    stiffness: 100,
    damping: 20,
    mass: 0.5
  }
};

const LOGO_SIZES = {
  mobile: "220px",
  desktop: "300px"
};

const LoadingScreen = ({ progress = 0 }) => {
  const roundedProgress = Math.round(progress);

  const maskStyles = {
    maskImage: `url(${evolve_logo_nav_white})`,
    WebkitMaskImage: `url(${evolve_logo_nav_white})`,
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskPosition: "center",
    WebkitMaskPosition: "center",
    maskSize: "contain",
    WebkitMaskSize: "contain"
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: ANIMATION_CONFIG.exit.duration }}
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center will-change-opacity"
      role="status"
      aria-live="polite"
      aria-label={`Loading ${roundedProgress} percent complete`}
    >
      <div className="text-center flex flex-col items-center">
        {/* Logo Fill Animation */}
        <div className="relative w-[220px] md:w-[300px] aspect-[5/1] mb-8">
          {/* Animated fill overlay */}
          <motion.div
            className="absolute bottom-0 left-0 w-full bg-evolve-yellow will-change-transform"
            style={{
              height: `${progress}%`,
              ...maskStyles,
              transform: "translateZ(0)" // Force GPU acceleration
            }}
            transition={ANIMATION_CONFIG.progress}
            aria-hidden="true"
          />

          {/* Base logo outline */}
          <img
            src={evolve_logo_nav_white}
            alt="Evolve logo"
            className="relative w-full h-full object-contain opacity-30"
          />
        </div>

        {/* Progress Bar */}
        <div
          className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden"
          aria-hidden="true"
        >
          <motion.div
            className="h-full bg-evolve-yellow will-change-transform"
            style={{ transform: "translateZ(0)" }} // Force GPU acceleration
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={ANIMATION_CONFIG.progress}
          />
        </div>

        {/* Progress Percentage */}
        <motion.p
          className="text-evolve-yellow mt-4 text-sm font-medium"
          key={roundedProgress}
          initial={{ opacity: 0.7 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
        >
          {roundedProgress}%
        </motion.p>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
