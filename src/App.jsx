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

// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
// import { useEffect, useState } from "react";
// import { AnimatePresence } from "framer-motion";

// import Home from "./pages/Home/Home";
// import AboutUs from "./pages/AboutUs";
// import Webinars from "./pages/Webinars.jsx";
// import Quiz from "./pages/Quiz";
// import Community from "./pages/Community.jsx";
// import Course from "./pages/Course";
// import NotFound from "./pages/NotFound";
// import Navigation from "./components/Navigation";
// import WhatIsDesign from "./pages/WhatIsDesign";
// import Footer from "./components/Footer";
// import LoadingScreen from "./components/LoadingScreen";
// import TabletOrientationOverlay from "./components/TabletOrientationOverlay";
// import ContactModal from "./components/ContactModal"; // Import the new modal component

// // Import all your images
// import * as images from "./assets/images/Home";

// import { supabase } from "./supabaseClient";

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
//   const [isContactModalOpen, setIsContactModalOpen] = useState(false); // Add state for contact modal
//   const location = useLocation();
//   const [isHomeIntroActive, setIsHomeIntroActive] = useState(false);

//   // const hideFooterRoutes = ["/webinars"]; // Removed "/contact" since it's now a modal
//   const hideFooterRoutes = []; // Removed "/contact" since it's now a modal
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

//   // Listen for custom event to open contact modal
//   useEffect(() => {
//     const handleOpenContactModal = () => {
//       setIsContactModalOpen(true);
//     };

//     window.addEventListener("openContactModal", handleOpenContactModal);
//     return () =>
//       window.removeEventListener("openContactModal", handleOpenContactModal);
//   }, []);

//   useEffect(() => {
//     const script = document.createElement("script");
//     script.src = "https://accounts.google.com/gsi/client";
//     script.async = true;
//     script.defer = true;
//     document.body.appendChild(script);

//     script.onload = () => {
//       if (!window.google) return;

//       window.google.accounts.id.initialize({
//         client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
//         callback: async (response) => {
//           await supabase.auth.signInWithIdToken({
//             provider: "google",
//             token: response.credential
//           });
//         }
//       });

//       // 🔥 THIS IS WHERE ONE TAP SHOULD BE CALLED
//       // window.google.accounts.id.prompt();
//     };
//   }, []);

//   const promptGoogleOneTap = () => {
//     if (!window.google?.accounts?.id) return;

//     window.google.accounts.id.prompt((notification) => {
//       if (notification.isNotDisplayed()) {
//         console.log(
//           "One Tap not displayed:",
//           notification.getNotDisplayedReason()
//         );
//       }
//       if (notification.isSkippedMoment()) {
//         console.log("One Tap skipped:", notification.getSkippedReason());
//       }
//     });
//   };

//   useEffect(() => {
//     if (showNavbar) {
//       promptGoogleOneTap();
//     }
//   }, [showNavbar]);

//   return (
//     <>
//       {/* Loading Screen */}
//       <AnimatePresence mode="wait">
//         {isLoading && <LoadingScreen progress={loadingProgress} />}
//       </AnimatePresence>

//       {/* Tablet Orientation Warning */}
//       {showOrientationWarning && <TabletOrientationOverlay />}

//       {/* Contact Modal */}
//       <ContactModal
//         isOpen={isContactModalOpen}
//         onClose={() => setIsContactModalOpen(false)}
//       />

//       {/* Main Content with Tablet Scaling */}
//       <div
//         className="min-h-screen bg-evolve-black lowercase"
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
//           onContactClick={() => setIsContactModalOpen(true)} // Pass handler to Navigation
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
//           {/* Remove the /contact route since it's now a modal */}
//           <Route path="*" element={<NotFound />} />
//         </Routes>

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
//       {/* <TooltipProvider> */}
//       {/* <Toaster /> */}
//       {/* <Sonner /> */}
//       <BrowserRouter>
//         <AppLayout />
//       </BrowserRouter>
//       {/* </TooltipProvider> */}
//     </QueryClientProvider>
//   );
// };

// export default App;

// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
// import { useEffect, useState, lazy, Suspense } from "react";
// import { AnimatePresence } from "framer-motion";

// // Eager load only Home page (critical)
// import Home from "./pages/Home/Home";
// import Navigation from "./components/Navigation";
// import LoadingScreen from "./components/LoadingScreen";
// import TabletOrientationOverlay from "./components/TabletOrientationOverlay";
// import ContactModal from "./components/ContactModal";

// // Lazy load non-critical routes
// const AboutUs = lazy(() => import("./pages/AboutUs"));
// const Webinars = lazy(() => import("./pages/Webinars.jsx"));
// const Quiz = lazy(() => import("./pages/Quiz"));
// const Community = lazy(() => import("./pages/Community.jsx"));
// const Course = lazy(() => import("./pages/Course"));
// const NotFound = lazy(() => import("./pages/NotFound"));
// const WhatIsDesign = lazy(() => import("./pages/WhatIsDesign"));
// const Footer = lazy(() => import("./components/Footer"));

// // Import only critical home images
// import * as images from "./assets/images/Home";
// import { supabase } from "./supabaseClient";

// const queryClient = new QueryClient();

// /* ------------------------------ Device Detection Helper ------------------------------ */
// const getDeviceType = () => {
//   const width = window.innerWidth;
//   if (width <= 768) return "mobile";
//   if (width > 768 && width <= 1024) return "tablet";
//   return "desktop";
// };

// const isLandscape = () => window.innerWidth > window.innerHeight;

// /* ------------------------------ Inner Layout ------------------------------ */
// const AppLayout = () => {
//   const [showNavbar, setShowNavbar] = useState(true);
//   const [isLoading, setIsLoading] = useState(true);
//   const [loadingProgress, setLoadingProgress] = useState(0);
//   const [deviceType, setDeviceType] = useState(getDeviceType());
//   const [showOrientationWarning, setShowOrientationWarning] = useState(false);
//   const [isContactModalOpen, setIsContactModalOpen] = useState(false);
//   const location = useLocation();
//   const [isHomeIntroActive, setIsHomeIntroActive] = useState(false);
//   const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);

//   const hideFooterRoutes = [];
//   const shouldShowFooter = !hideFooterRoutes.includes(location.pathname);

//   // Check orientation for tablets
//   useEffect(() => {
//     const checkOrientation = () => {
//       const currentDeviceType = getDeviceType();
//       setDeviceType(currentDeviceType);

//       if (currentDeviceType === "tablet" && !isLandscape()) {
//         setShowOrientationWarning(true);
//       } else {
//         setShowOrientationWarning(false);
//       }
//     };

//     checkOrientation();
//     const handleResize = () => requestAnimationFrame(checkOrientation);

//     window.addEventListener("resize", handleResize);
//     window.addEventListener("orientationchange", checkOrientation);

//     return () => {
//       window.removeEventListener("resize", handleResize);
//       window.removeEventListener("orientationchange", checkOrientation);
//     };
//   }, []);

//   const getTabletScale = () => {
//     if (deviceType !== "tablet") return 1;
//     const targetWidth = 1280;
//     const currentWidth = window.innerWidth;
//     return Math.max(currentWidth / targetWidth, 0.7);
//   };

//   // Prevent native scroll restore
//   useEffect(() => {
//     if ("scrollRestoration" in window.history) {
//       window.history.scrollRestoration = "manual";
//     }
//   }, []);

//   // Set navbar visibility based on route
//   useEffect(() => {
//     if (location.pathname === "/") {
//       setShowNavbar(false);
//       setIsHomeIntroActive(true);
//     } else {
//       setShowNavbar(true);
//       setIsHomeIntroActive(false);
//     }
//   }, [location.pathname]);

//   // Reset scroll on route change (optimized)
//   useEffect(() => {
//     requestAnimationFrame(() => {
//       window.scrollTo(0, 0);
//     });
//   }, [location.pathname]);

//   // Preload images with working progress
//   useEffect(() => {
//     const preloadImages = async () => {
//       const imageUrls = Object.values(images).filter(
//         (img) =>
//           typeof img === "string" &&
//           (img.startsWith("/") || img.startsWith("http"))
//       );

//       // Separate critical and non-critical images
//       const criticalCount = Math.min(5, imageUrls.length);
//       const criticalImages = imageUrls.slice(0, criticalCount);
//       const deferredImages = imageUrls.slice(criticalCount);

//       if (imageUrls.length === 0) {
//         setTimeout(() => {
//           setLoadingProgress(100);
//           setTimeout(() => setIsLoading(false), 300);
//         }, 800);
//         return;
//       }

//       let loadedCount = 0;
//       const totalCritical = criticalImages.length;

//       const loadImage = (src) => {
//         return new Promise((resolve) => {
//           const img = new Image();
//           img.fetchPriority = "high";

//           const onLoad = () => {
//             loadedCount++;
//             // Update progress based on critical images only
//             const progress = Math.min((loadedCount / totalCritical) * 100, 100);
//             setLoadingProgress(progress);
//             resolve();
//           };

//           img.onload = onLoad;
//           img.onerror = onLoad; // Don't block on errors
//           img.src = src;
//         });
//       };

//       try {
//         // Load critical images first (these update the progress bar)
//         await Promise.all(criticalImages.map(loadImage));

//         // Ensure minimum loading time for smooth UX
//         const minLoadTime = 800;
//         await new Promise((resolve) => setTimeout(resolve, minLoadTime));

//         // Hide loading screen
//         setLoadingProgress(100);
//         setIsLoading(false);

//         // Load remaining images in background (after site is visible)
//         if (deferredImages.length > 0) {
//           if ("requestIdleCallback" in window) {
//             requestIdleCallback(
//               () => {
//                 deferredImages.forEach((src) => {
//                   const img = new Image();
//                   img.src = src;
//                 });
//               },
//               { timeout: 2000 }
//             );
//           } else {
//             setTimeout(() => {
//               deferredImages.forEach((src) => {
//                 const img = new Image();
//                 img.src = src;
//               });
//             }, 1000);
//           }
//         }
//       } catch (error) {
//         console.error("Error loading images:", error);
//         setLoadingProgress(100);
//         setIsLoading(false);
//       }
//     };

//     preloadImages();
//   }, []);

//   // Set vh unit (with debouncing)
//   useEffect(() => {
//     let timeoutId;
//     const setVhUnit = () => {
//       clearTimeout(timeoutId);
//       timeoutId = setTimeout(() => {
//         document.documentElement.style.setProperty(
//           "--vh-unit",
//           `${window.innerHeight * 0.01}px`
//         );
//       }, 100);
//     };

//     setVhUnit();
//     window.addEventListener("resize", setVhUnit);
//     return () => {
//       window.removeEventListener("resize", setVhUnit);
//       clearTimeout(timeoutId);
//     };
//   }, []);

//   // Listen for contact modal event
//   useEffect(() => {
//     const handleOpenContactModal = () => setIsContactModalOpen(true);
//     window.addEventListener("openContactModal", handleOpenContactModal);
//     return () =>
//       window.removeEventListener("openContactModal", handleOpenContactModal);
//   }, []);

//   // Load Google Sign-In script ONLY when needed (deferred)
//   useEffect(() => {
//     if (googleScriptLoaded || isLoading) return;

//     const loadGoogleScript = () => {
//       const script = document.createElement("script");
//       script.src = "https://accounts.google.com/gsi/client";
//       script.async = true;
//       script.defer = true;

//       script.onload = () => {
//         setGoogleScriptLoaded(true);

//         if (!window.google) return;

//         window.google.accounts.id.initialize({
//           client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
//           callback: async (response) => {
//             await supabase.auth.signInWithIdToken({
//               provider: "google",
//               token: response.credential
//             });
//           }
//         });
//       };

//       document.body.appendChild(script);
//     };

//     // Delay Google script load until after critical content
//     if ("requestIdleCallback" in window) {
//       requestIdleCallback(loadGoogleScript, { timeout: 3000 });
//     } else {
//       setTimeout(loadGoogleScript, 3000);
//     }
//   }, [isLoading, googleScriptLoaded]);

//   // Prompt Google One Tap (only when navbar is shown)
//   useEffect(() => {
//     if (!showNavbar || !googleScriptLoaded) return;

//     const promptGoogleOneTap = () => {
//       if (!window.google?.accounts?.id) return;

//       window.google.accounts.id.prompt((notification) => {
//         if (notification.isNotDisplayed()) {
//           console.log(
//             "One Tap not displayed:",
//             notification.getNotDisplayedReason()
//           );
//         }
//         if (notification.isSkippedMoment()) {
//           console.log("One Tap skipped:", notification.getSkippedReason());
//         }
//       });
//     };

//     // Delay One Tap prompt
//     const timeoutId = setTimeout(promptGoogleOneTap, 1000);
//     return () => clearTimeout(timeoutId);
//   }, [showNavbar, googleScriptLoaded]);

//   return (
//     <>
//       {/* Loading Screen */}
//       <AnimatePresence mode="wait">
//         {isLoading && <LoadingScreen progress={loadingProgress} />}
//       </AnimatePresence>

//       {/* Tablet Orientation Warning */}
//       {showOrientationWarning && <TabletOrientationOverlay />}

//       {/* Contact Modal */}
//       <ContactModal
//         isOpen={isContactModalOpen}
//         onClose={() => setIsContactModalOpen(false)}
//       />

//       {/* Main Content with Tablet Scaling */}
//       <div
//         className="min-h-screen bg-evolve-black lowercase"
//         style={{
//           visibility: isLoading ? "hidden" : "visible",
//           opacity: isLoading ? 0 : 1,
//           transition: "opacity 0.5s ease-in-out",
//           transform:
//             deviceType === "tablet" ? `scale(${getTabletScale()})` : "none",
//           transformOrigin: "top center",
//           width: deviceType === "tablet" ? "128%" : "100%",
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
//           onContactClick={() => setIsContactModalOpen(true)}
//         />

//         <Suspense fallback={<LoadingScreen progress={50} />}>
//           <Routes>
//             <Route
//               path="/"
//               element={
//                 <Home
//                   setShowNavbar={setShowNavbar}
//                   isLoading={isLoading}
//                   deviceType={deviceType}
//                   onIntroComplete={() => setIsHomeIntroActive(false)}
//                 />
//               }
//             />
//             <Route path="/about" element={<AboutUs />} />
//             <Route path="/webinars" element={<Webinars />} />
//             <Route path="/quiz" element={<Quiz />} />
//             <Route path="/community" element={<Community />} />
//             <Route path="/course" element={<Course />} />
//             <Route path="/what-is-design" element={<WhatIsDesign />} />
//             <Route path="*" element={<NotFound />} />
//           </Routes>
//         </Suspense>

//         {shouldShowFooter &&
//           !(location.pathname === "/" && isHomeIntroActive) && (
//             <Suspense fallback={null}>
//               <Footer />
//             </Suspense>
//           )}
//       </div>
//     </>
//   );
// };

// /* ------------------------------- Main App ------------------------------- */
// const App = () => {
//   return (
//     <QueryClientProvider client={queryClient}>
//       {/* <TooltipProvider> */}
//       {/* <Toaster /> */}
//       {/* <Sonner /> */}
//       <BrowserRouter>
//         <AppLayout />
//       </BrowserRouter>
//       {/* </TooltipProvider> */}
//     </QueryClientProvider>
//   );
// };

// export default App;

// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState, lazy, Suspense } from "react";
import { AnimatePresence } from "framer-motion";
import { Analytics } from "@vercel/analytics/react";
// Eager load only Home page (critical)
import Home from "./pages/Home/Home";
import Navigation from "./components/Navigation";
import LoadingScreen from "./components/LoadingScreen";
import TabletOrientationOverlay from "./components/TabletOrientationOverlay";
import ContactModal from "./components/ContactModal";
import WelcomeOverlay from "./components/WelcomeOverlay";

// Lazy load non-critical routes
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Webinars = lazy(() => import("./pages/Webinars.jsx"));
const Quiz = lazy(() => import("./pages/Quiz"));
const Community = lazy(() => import("./pages/Community.jsx"));
const PortfolioReview = lazy(() => import("./pages/PortfolioReview.jsx"));
const PortfolioReviewForm = lazy(
  () => import("./pages/PortfolioReviewForm.jsx")
);
const Course = lazy(() => import("./pages/Course"));
const NotFound = lazy(() => import("./pages/NotFound"));
const WhatIsDesign = lazy(() => import("./pages/WhatIsDesign"));
const Footer = lazy(() => import("./components/Footer"));

// Import only critical home images
import * as images from "./assets/images/Home";
import { supabase } from "./supabaseClient";
import CollegeActivation from "./pages/College_Activity_Page/CollegeActivation.jsx";
import CollegeActivities from "./pages/College_Activity_Page/CollegeActivities.jsx";
import CollegeSelfReflection from "./pages/College_Activity_Page/CollegeSelfReflection.jsx";
import CollegeRealityCheck from "./pages/College_Activity_Page/CollegeRealityCheck.jsx";
import CollegeActivationVerify from "./pages/College_Activity_Page/CollegeActivationVerify.jsx";
import AdminLogin from "./pages/admn/AdminLogin.jsx";
import AdminDashboard from "./pages/admn/AdminDashboard.jsx";
import AdminGuard from "./routes/AdminGuard.jsx";
import MentorshipGuard from "./routes/MentorshipGuard.jsx";
import Mentorship from "./pages/Mentorship.jsx";
const SignIn = lazy(() => import("./pages/SignIn.jsx"));
const Payment = lazy(() => import("./pages/Payment.jsx"));
const MentorshipSession = lazy(() => import("./pages/MentorshipSession.jsx"));
const Terms = lazy(() => import("./pages/Terms.jsx"));
const Privacy = lazy(() => import("./pages/Privacy.jsx"));

const queryClient = new QueryClient();

/* ------------------------------ Device Detection Helper ------------------------------ */
const getDeviceType = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  if (width <= 768) return "mobile";
  if (width <= 1024) {
    // tablet portrait → mobile layout; tablet landscape → desktop-like layout
    if (height > width) return "mobile";
    return "tablet";
  }
  return "desktop";
};

const isLandscape = () => window.innerWidth > window.innerHeight;

/* ------------------------------ Inner Layout ------------------------------ */
const AppLayout = () => {
  const [showNavbar, setShowNavbar] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [deviceType, setDeviceType] = useState(getDeviceType());
  const [showOrientationWarning, setShowOrientationWarning] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const location = useLocation();
  const [isHomeIntroActive, setIsHomeIntroActive] = useState(false);
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);

  // GA4: track page views on route change (SPA navigation doesn't auto-fire page_view)
  useEffect(() => {
    if (typeof window.gtag === "function") {
      window.gtag("event", "page_view", {
        page_path: location.pathname,
        page_location: window.location.href
      });
    }
  }, [location.pathname]);

  const hideFooterRoutes = [
    "/evolve-in-person",
    "/evolve-in-person/",
    "/evolve-in-person/activities",
    "/evolve-in-person/self-reflection",
    "/evolve-in-person/reality-check",
    "/signin",
    "/payment",
    "/mentorship-session",
    "/admin",
    "/admin/dashboard",
    "/community/portfolio-review/form"
  ];
  const shouldShowFooter = !hideFooterRoutes.includes(location.pathname);

  // Check orientation for tablets
  useEffect(() => {
    const checkOrientation = () => {
      const currentDeviceType = getDeviceType();
      setDeviceType(currentDeviceType);

      if (currentDeviceType === "tablet" && !isLandscape()) {
        setShowOrientationWarning(true);
      } else {
        setShowOrientationWarning(false);
      }
    };

    checkOrientation();
    const handleResize = () => requestAnimationFrame(checkOrientation);

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", checkOrientation);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);

  const getTabletScale = () => {
    if (deviceType !== "tablet") return 1;
    const targetWidth = 1280;
    const currentWidth = window.innerWidth;
    return Math.max(currentWidth / targetWidth, 0.7);
  };

  // Prevent native scroll restore
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // Set navbar visibility based on route
  useEffect(() => {
    if (location.pathname === "/") {
      setShowNavbar(false);
      setIsHomeIntroActive(true);
    } else if (
      location.pathname === "/signin" ||
      location.pathname === "/payment" ||
      location.pathname === "/mentorship-session" ||
      location.pathname === "/admin" ||
      location.pathname === "/admin/dashboard"
    ) {
      setShowNavbar(false);
      setIsHomeIntroActive(false);
    } else {
      setShowNavbar(true);
      setIsHomeIntroActive(false);
    }
  }, [location.pathname]);

  // Reset scroll on route change (optimized)
  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
  }, [location.pathname]);

  // Preload images with working progress
  useEffect(() => {
    const preloadImages = async () => {
      const imageUrls = Object.values(images).filter(
        (img) =>
          typeof img === "string" &&
          (img.startsWith("/") || img.startsWith("http"))
      );

      // Separate critical and non-critical images
      const criticalCount = Math.min(5, imageUrls.length);
      const criticalImages = imageUrls.slice(0, criticalCount);
      const deferredImages = imageUrls.slice(criticalCount);

      if (imageUrls.length === 0) {
        setTimeout(() => {
          setLoadingProgress(100);
          setTimeout(() => setIsLoading(false), 300);
        }, 800);
        return;
      }

      let loadedCount = 0;
      const totalCritical = criticalImages.length;

      const loadImage = (src) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.fetchPriority = "high";

          const onLoad = () => {
            loadedCount++;
            // Update progress based on critical images only
            const progress = Math.min((loadedCount / totalCritical) * 100, 100);
            setLoadingProgress(progress);
            resolve();
          };

          img.onload = onLoad;
          img.onerror = onLoad; // Don't block on errors
          img.src = src;
        });
      };

      try {
        // Load critical images first (these update the progress bar)
        await Promise.all(criticalImages.map(loadImage));

        // Ensure minimum loading time for smooth UX
        const minLoadTime = 800;
        await new Promise((resolve) => setTimeout(resolve, minLoadTime));

        // Hide loading screen
        setLoadingProgress(100);
        setIsLoading(false);

        // Load remaining images in background (after site is visible)
        if (deferredImages.length > 0) {
          if ("requestIdleCallback" in window) {
            requestIdleCallback(
              () => {
                deferredImages.forEach((src) => {
                  const img = new Image();
                  img.src = src;
                });
              },
              { timeout: 2000 }
            );
          } else {
            setTimeout(() => {
              deferredImages.forEach((src) => {
                const img = new Image();
                img.src = src;
              });
            }, 1000);
          }
        }
      } catch (error) {
        console.error("Error loading images:", error);
        setLoadingProgress(100);
        setIsLoading(false);
      }
    };

    preloadImages();
  }, []);

  // Set vh unit (with debouncing)
  useEffect(() => {
    let timeoutId;
    const setVhUnit = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        document.documentElement.style.setProperty(
          "--vh-unit",
          `${window.innerHeight * 0.01}px`
        );
      }, 100);
    };

    setVhUnit();
    window.addEventListener("resize", setVhUnit);
    return () => {
      window.removeEventListener("resize", setVhUnit);
      clearTimeout(timeoutId);
    };
  }, []);

  // Listen for contact modal event
  useEffect(() => {
    const handleOpenContactModal = () => setIsContactModalOpen(true);
    window.addEventListener("openContactModal", handleOpenContactModal);
    return () =>
      window.removeEventListener("openContactModal", handleOpenContactModal);
  }, []);

  // Load Google Sign-In script ONLY when needed (deferred)
  useEffect(() => {
    if (googleScriptLoaded || isLoading) return;

    const loadGoogleScript = () => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;

      script.onload = async () => {
        if (!window.google) {
          setGoogleScriptLoaded(true);
          return;
        }

        // Generate nonce: raw for signInWithIdToken, hashed for Google initialize
        const rawNonce = btoa(
          String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))
        );
        const hashBuffer = await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(rawNonce)
        );
        const hashedNonce = Array.from(new Uint8Array(hashBuffer))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          nonce: hashedNonce,
          cancel_on_tap_outside: false,
          callback: async (response) => {
            const { error } = await supabase.auth.signInWithIdToken({
              provider: "google",
              token: response.credential,
              nonce: rawNonce
            });
            if (error) console.error("One Tap sign-in error:", error);
          }
        });

        setGoogleScriptLoaded(true);
      };

      document.body.appendChild(script);
    };

    // Delay Google script load until after critical content
    if ("requestIdleCallback" in window) {
      requestIdleCallback(loadGoogleScript, { timeout: 3000 });
    } else {
      setTimeout(loadGoogleScript, 3000);
    }
  }, [isLoading, googleScriptLoaded]);

  // Prompt Google One Tap (only when navbar is shown and user not logged in)
  useEffect(() => {
    if (!showNavbar || !googleScriptLoaded) return;

    const promptGoogleOneTap = async () => {
      if (!window.google?.accounts?.id) return;

      // Don't show if user is already signed in
      const { data } = await supabase.auth.getSession();
      if (data?.session) return;

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

    // Cancel One Tap as soon as user signs in (any method)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) window.google?.accounts?.id?.cancel();
      }
    );

    const timeoutId = setTimeout(promptGoogleOneTap, 1000);
    return () => {
      clearTimeout(timeoutId);
      authListener.subscription.unsubscribe();
    };
  }, [showNavbar, googleScriptLoaded]);

  // useEffect(() => {
  //   const isDevEnv = window.location.hostname.includes(
  //     "dev.evolvedesign.academy"
  //   );
  //   const isAllowed = window.location.search.includes("dev=1");

  //   if (isDevEnv && !isAllowed) {
  //     window.location.href = "https://www.evolvedesign.academy";
  //   }
  // }, []);

  // useEffect(() => {
  //   const hostname = window.location.hostname;
  //   const isDevEnv = hostname === "dev.evolvedesign.academy";
  //   const isAllowed = new URLSearchParams(window.location.search).has("dev");

  //   if (isDevEnv && !isAllowed) {
  //     window.location.href = "https://www.evolvedesign.academy";
  //   }
  // }, []);

  useEffect(() => {
    const hostname = window.location.hostname;
    const params = new URLSearchParams(window.location.search);

    const isDevEnv = hostname === "dev.evolvedesign.academy";
    const isAllowed = params.get("dev") === "1";

    if (isDevEnv && !isAllowed) {
      const path =
        window.location.pathname +
        window.location.search +
        window.location.hash;

      window.location.href = `https://www.evolvedesign.academy${path}`;
    }
  }, []);

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
        className="min-h-screen bg-evolve-black lowercase"
        style={{
          visibility: isLoading ? "hidden" : "visible",
          opacity: isLoading ? 0 : 1,
          transition: "opacity 0.5s ease-in-out",
          transform:
            deviceType === "tablet" ? `scale(${getTabletScale()})` : "none",
          transformOrigin: "top center",
          width: deviceType === "tablet" ? "128%" : "100%",
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
          onContactClick={() => setIsContactModalOpen(true)}
        />

        <Suspense fallback={<LoadingScreen progress={50} />}>
          <Routes>
            <Route path="/admin" element={<AdminLogin />} />

            <Route
              path="/admin/dashboard"
              element={
                <AdminGuard>
                  <AdminDashboard />
                </AdminGuard>
              }
            />

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
            <Route path="/evolve-in-person" element={<CollegeActivation />} />
            <Route
              path="/evolve-in-person/verify"
              element={<CollegeActivationVerify />}
            />

            <Route
              path="/evolve-in-person/activities"
              element={<CollegeActivities />}
            />
            <Route
              path="/evolve-in-person/self-reflection"
              element={<CollegeSelfReflection />}
            />
            <Route
              path="/evolve-in-person/reality-check"
              element={<CollegeRealityCheck />}
            />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/webinars" element={<Webinars />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/community" element={<Community />} />
            <Route
              path="/community/portfolio-review"
              element={<PortfolioReview />}
            />
            <Route
              path="/community/portfolio-review/form"
              element={<PortfolioReviewForm />}
            />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/payment" element={<Payment />} />
            <Route
              path="/mentorship-session"
              element={
                <MentorshipGuard>
                  <MentorshipSession />
                </MentorshipGuard>
              }
            />
            <Route path="/mentorship" element={<Mentorship />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/course" element={<Course />} />
            <Route path="/what-is-design" element={<WhatIsDesign />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>

        {shouldShowFooter &&
          !(location.pathname === "/" && isHomeIntroActive) && (
            <Suspense fallback={null}>
              <Footer onContactClick={() => setIsContactModalOpen(true)} />
            </Suspense>
          )}
      </div>

      <WelcomeOverlay />
    </>
  );
};

/* ------------------------------- Main App ------------------------------- */
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      {/* <TooltipProvider> */}
      {/* <Toaster /> */}
      {/* <Sonner /> */}
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
      {navigator.userAgent !== "ReactSnap" && <Analytics />}
      {/* </TooltipProvider> */}
    </QueryClientProvider>
  );
};

export default App;
