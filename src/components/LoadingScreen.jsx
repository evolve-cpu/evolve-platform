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

// import React from "react";
// import { motion } from "framer-motion";
// import { evolve_cube } from "../assets/images/Home"; // ✅ evolve_cube svg

// const ANIMATION_CONFIG = {
//   exit: { opacity: 0, duration: 0.5 },
//   progress: {
//     type: "spring",
//     stiffness: 100,
//     damping: 20,
//     mass: 0.5
//   }
// };

// const LoadingScreen = ({ progress = 0 }) => {
//   const roundedProgress = Math.round(progress);

//   return (
//     <motion.div
//       initial={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       transition={{ duration: ANIMATION_CONFIG.exit.duration }}
//       className="fixed inset-0 z-[9999] bg-black flex flex-col h-screen overflow-hidden items-center justify-center will-change-opacity"
//       role="status"
//       aria-live="polite"
//       aria-label={`Loading ${roundedProgress} percent complete`}
//     >
//       {/* evolve cube logo */}
//       <img
//         src={evolve_cube}
//         alt="Evolve cube"
//         className="w-32 h-auto mb-8 mx-auto"
//       />

//       {/* Progress Bar */}
//       <div
//         className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden mx-auto"
//         aria-hidden="true"
//       >
//         <motion.div
//           className="h-full bg-evolve-yellow will-change-transform"
//           style={{ transform: "translateZ(0)" }}
//           initial={{ width: 0 }}
//           animate={{ width: `${progress}%` }}
//           transition={ANIMATION_CONFIG.progress}
//         />
//       </div>

//       {/* Progress Percentage */}
//       <motion.p
//         className="text-evolve-yellow mt-4 text-sm font-medium text-center"
//         key={roundedProgress}
//         initial={{ opacity: 0.7 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 0.15 }}
//       >
//         {roundedProgress}%
//       </motion.p>
//     </motion.div>
//   );
// };

// export default LoadingScreen;

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { evolve_cube } from "../assets/images/Home"; // ✅ evolve_cube svg

const ANIMATION_CONFIG = {
  exit: { opacity: 0, duration: 0.5 },
  progress: {
    type: "spring",
    stiffness: 100,
    damping: 20,
    mass: 0.5
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
      {/* evolve cube logo */}
      <img
        src={evolve_cube}
        alt="Evolve cube"
        className="w-32 h-auto mb-8 mx-auto"
      />

      {/* Progress Bar */}
      <div
        className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden mx-auto"
        aria-hidden="true"
      >
        <motion.div
          className="h-full bg-evolve-yellow will-change-transform"
          style={{ transform: "translateZ(0)" }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={ANIMATION_CONFIG.progress}
        />
      </div>

      {/* Progress Percentage */}
      <motion.p
        className="text-evolve-yellow mt-4 text-sm font-medium text-center"
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
