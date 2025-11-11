// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
// import { useEffect, useState } from "react";

// import Home from "./pages/Home/Home";
// import AboutUs from "./pages/AboutUs";
// import Webinars from "./pages/Webinars";
// import Quiz from "./pages/Quiz";
// import Community from "./pages/Community";
// import Course from "./pages/Course";
// import NotFound from "./pages/NotFound";
// import Navigation from "./components/Navigation";
// import ContactModal from "./components/ContactModal";
// import WhatIsDesign from "./pages/WhatIsDesign";
// import { TabletScaler } from "./lib/TabletScaler";
// import Footer from "./components/Footer";
// import ContactUs from "./pages/ContactUs";

// const queryClient = new QueryClient();

// /* ------------------------------ Inner Layout ------------------------------ */
// const AppLayout = () => {
//   const [isContactModalOpen, setIsContactModalOpen] = useState(false);
//   const [showNavbar, setShowNavbar] = useState(true); // CHANGE: Start with true for other pages
//   const location = useLocation();

//   const hideFooterRoutes = ["/contact"];
//   const shouldShowFooter = !hideFooterRoutes.includes(location.pathname);

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

//   // Set navbar visibility based on route
//   useEffect(() => {
//     if (location.pathname === "/") {
//       setShowNavbar(false); // HIDE on home initially
//     } else {
//       setShowNavbar(true); // SHOW on other pages
//     }
//   }, [location.pathname]);

//   return (
//     <div className="min-h-screen bg-evolve-black">
//       <Navigation
//         onContactClick={() => setIsContactModalOpen(true)}
//         showNavbar={showNavbar}
//         onLogoClick={() => {
//           if (location.pathname === "/") {
//             window.dispatchEvent(new CustomEvent("scrollToScene1_1"));
//           }
//         }}
//       />

//       <Routes>
//         <Route path="/" element={<Home setShowNavbar={setShowNavbar} />} />
//         <Route path="/about" element={<AboutUs />} />
//         <Route path="/webinars" element={<Webinars />} />
//         <Route path="/quiz" element={<Quiz />} />
//         <Route path="/community" element={<Community />} />
//         <Route path="/course" element={<Course />} />
//         <Route path="/what-is-design" element={<WhatIsDesign />} />
//         <Route path="/contact" element={<ContactUs />} />
//         <Route path="*" element={<NotFound />} />
//       </Routes>

//       {shouldShowFooter && <Footer />}
//       <ContactModal
//         isOpen={isContactModalOpen}
//         onClose={() => setIsContactModalOpen(false)}
//       />
//     </div>
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
import Webinars from "./pages/Webinars";
import Quiz from "./pages/Quiz";
import Community from "./pages/Community";
import Course from "./pages/Course";
import NotFound from "./pages/NotFound";
import Navigation from "./components/Navigation";
import ContactModal from "./components/ContactModal";
import WhatIsDesign from "./pages/WhatIsDesign";
import Footer from "./components/Footer";
import ContactUs from "./pages/ContactUs";
import LoadingScreen from "./components/LoadingScreen";

// Import all your images
import * as images from "./assets/images/Home"; // Adjust path to your images folder

const queryClient = new QueryClient();

/* ------------------------------ Inner Layout ------------------------------ */
const AppLayout = () => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const location = useLocation();

  const hideFooterRoutes = ["/contact"];
  const shouldShowFooter = !hideFooterRoutes.includes(location.pathname);

  // Set navbar visibility based on route
  useEffect(() => {
    if (location.pathname === "/") {
      setShowNavbar(false);
    } else {
      setShowNavbar(true);
    }
  }, [location.pathname]);

  // Preload all images
  useEffect(() => {
    const preloadImages = async () => {
      // Get all image URLs from your imports
      const imageUrls = Object.values(images).filter(
        (img) =>
          typeof img === "string" &&
          (img.startsWith("/") || img.startsWith("http"))
      );

      if (imageUrls.length === 0) {
        // No images found, just add a minimal delay
        setTimeout(() => {
          setLoadingProgress(100);
          setTimeout(() => setIsLoading(false), 300);
        }, 800); // Minimum 800ms loading
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
          img.onerror = onLoad; // Still count as loaded to prevent hanging
          img.src = src;
        });
      };

      try {
        await Promise.all(imageUrls.map(loadImage));
        // Ensure minimum loading time for smooth experience
        const minLoadTime = 800; // 800ms minimum
        await new Promise((resolve) => setTimeout(resolve, minLoadTime));
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading images:", error);
        setIsLoading(false);
      }
    };

    // Only preload on initial mount
    if (isLoading) {
      preloadImages();
    }
  }, []); // Run only once on mount

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

  return (
    <>
      {/* Loading Screen */}
      <AnimatePresence mode="wait">
        {isLoading && <LoadingScreen progress={loadingProgress} />}
      </AnimatePresence>

      {/* Main Content */}
      <div
        className="min-h-screen bg-evolve-black"
        style={{
          visibility: isLoading ? "hidden" : "visible",
          opacity: isLoading ? 0 : 1,
          transition: "opacity 0.5s ease-in-out"
        }}
      >
        <Navigation
          onContactClick={() => setIsContactModalOpen(true)}
          showNavbar={showNavbar}
          onLogoClick={() => {
            if (location.pathname === "/") {
              window.dispatchEvent(new CustomEvent("scrollToScene1_1"));
            }
          }}
        />

        <Routes>
          <Route
            path="/"
            element={
              <Home setShowNavbar={setShowNavbar} isLoading={isLoading} />
            }
          />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/webinars" element={<Webinars />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/community" element={<Community />} />
          <Route path="/course" element={<Course />} />
          <Route path="/what-is-design" element={<WhatIsDesign />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        {shouldShowFooter && <Footer />}

        <ContactModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
        />
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
