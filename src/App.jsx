// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
// import { useEffect, useState } from "react";
// import { AnimatePresence } from "framer-motion";

// import Home from "./pages/Home/Home";
// import AboutUs from "./pages/AboutUs";
// import Webinars from "./pages/Webinars";
// import Quiz from "./pages/Quiz";
// import Community from "./pages/Community";
// import Course from "./pages/Course";
// import NotFound from "./pages/NotFound";
// import Navigation from "./components/Navigation";
// import WhatIsDesign from "./pages/WhatIsDesign";
// import Footer from "./components/Footer";
// import ContactUs from "./pages/ContactUs";
// import LoadingScreen from "./components/LoadingScreen";
// import TabletOrientationOverlay from "./components/TabletOrientationOverlay";

// // Import all your images
// import * as images from "./assets/images/Home";

// const queryClient = new QueryClient();

// /* ------------------------------ Device Detection Helper ------------------------------ */
// const getDeviceType = () => {
//   const width = window.innerWidth;
//   const height = window.innerHeight;

//   // Mobile: <= 768px
//   if (width <= 768) {
//     return "mobile";
//   }

//   // Tablet: 769px - 1024px
//   if (width > 768 && width <= 1024) {
//     return "tablet";
//   }

//   // Desktop: > 1024px
//   return "desktop";
// };

// const isLandscape = () => {
//   return window.innerWidth > window.innerHeight;
// };

// /* ------------------------------ Inner Layout ------------------------------ */
// const AppLayout = () => {
//   const [showNavbar, setShowNavbar] = useState(true);
//   const [isLoading, setIsLoading] = useState(true);
//   const [loadingProgress, setLoadingProgress] = useState(0);
//   const [deviceType, setDeviceType] = useState(getDeviceType());
//   const [showOrientationWarning, setShowOrientationWarning] = useState(false);
//   const location = useLocation();
//   const [isHomeIntroActive, setIsHomeIntroActive] = useState(false);

//   const hideFooterRoutes = ["/contact"];
//   const shouldShowFooter = !hideFooterRoutes.includes(location.pathname);

//   // Check orientation for tablets
//   useEffect(() => {
//     const checkOrientation = () => {
//       const currentDeviceType = getDeviceType();
//       setDeviceType(currentDeviceType);

//       // Show warning if tablet is in portrait mode
//       if (currentDeviceType === "tablet" && !isLandscape()) {
//         setShowOrientationWarning(true);
//       } else {
//         setShowOrientationWarning(false);
//       }
//     };

//     checkOrientation();
//     window.addEventListener("resize", checkOrientation);
//     window.addEventListener("orientationchange", checkOrientation);

//     return () => {
//       window.removeEventListener("resize", checkOrientation);
//       window.removeEventListener("orientationchange", checkOrientation);
//     };
//   }, []);

//   // Calculate scale for tablet
//   const getTabletScale = () => {
//     if (deviceType !== "tablet") return 1;

//     // Target small desktop width (e.g., 1280px)
//     const targetWidth = 1280;
//     const currentWidth = window.innerWidth;

//     // Scale down to fit, with a minimum scale
//     return Math.max(currentWidth / targetWidth, 0.7);
//   };

//   // prevent native scroll restore
//   useEffect(() => {
//     if ("scrollRestoration" in window.history) {
//       window.history.scrollRestoration = "manual";
//     }
//   }, []);

//   // // reset on full reload
//   // useEffect(() => {
//   //   const nav = performance.getEntriesByType("navigation")?.[0];
//   //   if (nav && (nav.type === "reload" || nav.type === "navigate")) {
//   //     window.scrollTo(0, 0);
//   //   }
//   // }, []);

//   // Set navbar visibility based on route
//   useEffect(() => {
//     if (location.pathname === "/") {
//       setShowNavbar(false);
//       setIsHomeIntroActive(true); // Intro is active on home load
//     } else {
//       setShowNavbar(true);
//       setIsHomeIntroActive(false);
//     }
//   }, [location.pathname]);

//   // reset on route change
//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, [location.pathname]);

//   // Set navbar visibility based on route
//   useEffect(() => {
//     if (location.pathname === "/") {
//       setShowNavbar(false);
//     } else {
//       setShowNavbar(true);
//     }
//   }, [location.pathname]);

//   useEffect(() => {
//     requestAnimationFrame(() => {
//       window.scrollTo(0, 0);
//     });
//   }, [location.pathname]);

//   useEffect(() => {
//     console.log("Route changed to:", location.pathname);
//     console.log("isLoading:", isLoading);
//     console.log("showNavbar:", showNavbar);
//     console.log("deviceType:", deviceType);
//   }, [location.pathname, isLoading, showNavbar, deviceType]);

//   // Preload all images
//   useEffect(() => {
//     const preloadImages = async () => {
//       const imageUrls = Object.values(images).filter(
//         (img) =>
//           typeof img === "string" &&
//           (img.startsWith("/") || img.startsWith("http"))
//       );

//       if (imageUrls.length === 0) {
//         setTimeout(() => {
//           setLoadingProgress(100);
//           setTimeout(() => setIsLoading(false), 300);
//         }, 800);
//         return;
//       }

//       let loadedCount = 0;
//       const totalImages = imageUrls.length;

//       const loadImage = (src) => {
//         return new Promise((resolve) => {
//           const img = new Image();

//           const onLoad = () => {
//             loadedCount++;
//             const progress = (loadedCount / totalImages) * 100;
//             setLoadingProgress(progress);
//             resolve();
//           };

//           img.onload = onLoad;
//           img.onerror = onLoad;
//           img.src = src;
//         });
//       };

//       try {
//         await Promise.all(imageUrls.map(loadImage));
//         const minLoadTime = 800;
//         await new Promise((resolve) => setTimeout(resolve, minLoadTime));
//         setIsLoading(false);
//       } catch (error) {
//         console.error("Error loading images:", error);
//         setIsLoading(false);
//       }
//     };

//     if (isLoading) {
//       preloadImages();
//     }
//   }, []);

//   useEffect(() => {
//     const setVhUnit = () => {
//       document.documentElement.style.setProperty(
//         "--vh-unit",
//         `${window.innerHeight * 0.01}px`
//       );
//     };
//     setVhUnit();
//     window.addEventListener("resize", setVhUnit);
//     return () => window.removeEventListener("resize", setVhUnit);
//   }, []);

//   return (
//     <>
//       {/* Loading Screen */}
//       <AnimatePresence mode="wait">
//         {isLoading && <LoadingScreen progress={loadingProgress} />}
//       </AnimatePresence>

//       {/* Tablet Orientation Warning */}
//       {showOrientationWarning && <TabletOrientationOverlay />}

//       {/* Main Content with Tablet Scaling */}
//       <div
//         className="min-h-screen bg-evolve-black"
//         style={{
//           visibility: isLoading ? "hidden" : "visible",
//           opacity: isLoading ? 0 : 1,
//           transition: "opacity 0.5s ease-in-out",
//           // Apply scaling for tablets
//           transform:
//             deviceType === "tablet" ? `scale(${getTabletScale()})` : "none",
//           transformOrigin: "top center",
//           width: deviceType === "tablet" ? "128%" : "100%", // Compensate for scale
//           minWidth: deviceType === "tablet" ? "1280px" : "auto"
//         }}
//       >
//         <Navigation
//           showNavbar={showNavbar}
//           onLogoClick={() => {
//             if (location.pathname === "/") {
//               window.dispatchEvent(new CustomEvent("scrollToScene1_1"));
//             }
//           }}
//         />

//         <Routes>
//           <Route
//             path="/"
//             element={
//               <Home
//                 setShowNavbar={setShowNavbar}
//                 isLoading={isLoading}
//                 deviceType={deviceType}
//                 onIntroComplete={() => setIsHomeIntroActive(false)}
//               />
//             }
//           />
//           <Route path="/about" element={<AboutUs />} />
//           <Route path="/webinars" element={<Webinars />} />
//           <Route path="/quiz" element={<Quiz />} />
//           <Route path="/community" element={<Community />} />
//           <Route path="/course" element={<Course />} />
//           <Route path="/what-is-design" element={<WhatIsDesign />} />
//           <Route path="/contact" element={<ContactUs />} />
//           <Route path="*" element={<NotFound />} />
//         </Routes>

//         {/* {shouldShowFooter && <Footer />} */}
//         {shouldShowFooter &&
//           !(location.pathname === "/" && isHomeIntroActive) && <Footer />}
//       </div>
//     </>
//   );
// };

// /* ------------------------------- Main App ------------------------------- */
// const App = () => {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <TooltipProvider>
//         <Toaster />
//         <Sonner />
//         <BrowserRouter>
//           <AppLayout />
//         </BrowserRouter>
//       </TooltipProvider>
//     </QueryClientProvider>
//   );
// };

// export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";

import Home from "./pages/Home/Home";
import AboutUs from "./pages/AboutUs";
import Webinars from "./pages/Webinars.jsx";
import Quiz from "./pages/Quiz";
import Community from "./pages/Community.jsx";
import Course from "./pages/Course";
import NotFound from "./pages/NotFound";
import Navigation from "./components/Navigation";
import WhatIsDesign from "./pages/WhatIsDesign";
import Footer from "./components/Footer";
import LoadingScreen from "./components/LoadingScreen";
import TabletOrientationOverlay from "./components/TabletOrientationOverlay";
import ContactModal from "./components/ContactModal"; // Import the new modal component

// Import all your images
import * as images from "./assets/images/Home";

import { supabase } from "./supabaseClient";

const queryClient = new QueryClient();

/* ------------------------------ Device Detection Helper ------------------------------ */
const getDeviceType = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  // Mobile: <= 768px
  if (width <= 768) {
    return "mobile";
  }

  // Tablet: 769px - 1024px
  if (width > 768 && width <= 1024) {
    return "tablet";
  }

  // Desktop: > 1024px
  return "desktop";
};

const isLandscape = () => {
  return window.innerWidth > window.innerHeight;
};

/* ------------------------------ Inner Layout ------------------------------ */
const AppLayout = () => {
  const [showNavbar, setShowNavbar] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [deviceType, setDeviceType] = useState(getDeviceType());
  const [showOrientationWarning, setShowOrientationWarning] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false); // Add state for contact modal
  const location = useLocation();
  const [isHomeIntroActive, setIsHomeIntroActive] = useState(false);

  // const hideFooterRoutes = ["/webinars"]; // Removed "/contact" since it's now a modal
  const hideFooterRoutes = []; // Removed "/contact" since it's now a modal
  const shouldShowFooter = !hideFooterRoutes.includes(location.pathname);

  // Check orientation for tablets
  useEffect(() => {
    const checkOrientation = () => {
      const currentDeviceType = getDeviceType();
      setDeviceType(currentDeviceType);

      // Show warning if tablet is in portrait mode
      if (currentDeviceType === "tablet" && !isLandscape()) {
        setShowOrientationWarning(true);
      } else {
        setShowOrientationWarning(false);
      }
    };

    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);

  // Calculate scale for tablet
  const getTabletScale = () => {
    if (deviceType !== "tablet") return 1;

    // Target small desktop width (e.g., 1280px)
    const targetWidth = 1280;
    const currentWidth = window.innerWidth;

    // Scale down to fit, with a minimum scale
    return Math.max(currentWidth / targetWidth, 0.7);
  };

  // prevent native scroll restore
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // Set navbar visibility based on route
  useEffect(() => {
    if (location.pathname === "/") {
      setShowNavbar(false);
      setIsHomeIntroActive(true); // Intro is active on home load
    } else {
      setShowNavbar(true);
      setIsHomeIntroActive(false);
    }
  }, [location.pathname]);

  // reset on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
  }, [location.pathname]);

  useEffect(() => {
    console.log("Route changed to:", location.pathname);
    console.log("isLoading:", isLoading);
    console.log("showNavbar:", showNavbar);
    console.log("deviceType:", deviceType);
  }, [location.pathname, isLoading, showNavbar, deviceType]);

  // Preload all images
  useEffect(() => {
    const preloadImages = async () => {
      const imageUrls = Object.values(images).filter(
        (img) =>
          typeof img === "string" &&
          (img.startsWith("/") || img.startsWith("http"))
      );

      if (imageUrls.length === 0) {
        setTimeout(() => {
          setLoadingProgress(100);
          setTimeout(() => setIsLoading(false), 300);
        }, 800);
        return;
      }

      let loadedCount = 0;
      const totalImages = imageUrls.length;

      const loadImage = (src) => {
        return new Promise((resolve) => {
          const img = new Image();

          const onLoad = () => {
            loadedCount++;
            const progress = (loadedCount / totalImages) * 100;
            setLoadingProgress(progress);
            resolve();
          };

          img.onload = onLoad;
          img.onerror = onLoad;
          img.src = src;
        });
      };

      try {
        await Promise.all(imageUrls.map(loadImage));
        const minLoadTime = 800;
        await new Promise((resolve) => setTimeout(resolve, minLoadTime));
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading images:", error);
        setIsLoading(false);
      }
    };

    if (isLoading) {
      preloadImages();
    }
  }, []);

  useEffect(() => {
    const setVhUnit = () => {
      document.documentElement.style.setProperty(
        "--vh-unit",
        `${window.innerHeight * 0.01}px`
      );
    };
    setVhUnit();
    window.addEventListener("resize", setVhUnit);
    return () => window.removeEventListener("resize", setVhUnit);
  }, []);

  // Listen for custom event to open contact modal
  useEffect(() => {
    const handleOpenContactModal = () => {
      setIsContactModalOpen(true);
    };

    window.addEventListener("openContactModal", handleOpenContactModal);
    return () =>
      window.removeEventListener("openContactModal", handleOpenContactModal);
  }, []);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (!window.google) return;

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: async (response) => {
          await supabase.auth.signInWithIdToken({
            provider: "google",
            token: response.credential
          });
        }
      });

      // 🔥 THIS IS WHERE ONE TAP SHOULD BE CALLED
      // window.google.accounts.id.prompt();
    };
  }, []);

  const promptGoogleOneTap = () => {
    if (!window.google?.accounts?.id) return;

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed()) {
        console.log(
          "One Tap not displayed:",
          notification.getNotDisplayedReason()
        );
      }
      if (notification.isSkippedMoment()) {
        console.log("One Tap skipped:", notification.getSkippedReason());
      }
    });
  };

  useEffect(() => {
    if (showNavbar) {
      promptGoogleOneTap();
    }
  }, [showNavbar]);

  return (
    <>
      {/* Loading Screen */}
      <AnimatePresence mode="wait">
        {isLoading && <LoadingScreen progress={loadingProgress} />}
      </AnimatePresence>

      {/* Tablet Orientation Warning */}
      {showOrientationWarning && <TabletOrientationOverlay />}

      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

      {/* Main Content with Tablet Scaling */}
      <div
        className="min-h-screen bg-evolve-black"
        style={{
          visibility: isLoading ? "hidden" : "visible",
          opacity: isLoading ? 0 : 1,
          transition: "opacity 0.5s ease-in-out",
          // Apply scaling for tablets
          transform:
            deviceType === "tablet" ? `scale(${getTabletScale()})` : "none",
          transformOrigin: "top center",
          width: deviceType === "tablet" ? "128%" : "100%", // Compensate for scale
          minWidth: deviceType === "tablet" ? "1280px" : "auto"
        }}
      >
        <Navigation
          showNavbar={showNavbar}
          onLogoClick={() => {
            if (location.pathname === "/") {
              window.dispatchEvent(new CustomEvent("scrollToScene1_1"));
            }
          }}
          onContactClick={() => setIsContactModalOpen(true)} // Pass handler to Navigation
        />

        <Routes>
          <Route
            path="/"
            element={
              <Home
                setShowNavbar={setShowNavbar}
                isLoading={isLoading}
                deviceType={deviceType}
                onIntroComplete={() => setIsHomeIntroActive(false)}
              />
            }
          />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/webinars" element={<Webinars />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/community" element={<Community />} />
          <Route path="/course" element={<Course />} />
          <Route path="/what-is-design" element={<WhatIsDesign />} />
          {/* Remove the /contact route since it's now a modal */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {shouldShowFooter &&
          !(location.pathname === "/" && isHomeIntroActive) && <Footer />}
      </div>
    </>
  );
};

/* ------------------------------- Main App ------------------------------- */
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
