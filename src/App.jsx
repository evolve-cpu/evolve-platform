import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import AboutUs from "./pages/AboutUs";
import Webinars from "./pages/Webinars";
import Quiz from "./pages/Quiz";
import Community from "./pages/Community";
import Course from "./pages/Course";
import NotFound from "./pages/NotFound";
import Navigation from "./components/Navigation";
import ContactModal from "./components/ContactModal";
import { useEffect, useState } from "react";
import WhatIsDesign from "./pages/WhatIsDesign";

const queryClient = new QueryClient();

const App = () => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-evolve-black">
            {/* <Navigation onContactClick={() => setIsContactModalOpen(true)} /> */}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/webinars" element={<Webinars />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/community" element={<Community />} />
              <Route path="/course" element={<Course />} />
              <Route path="/what-is-design" element={<WhatIsDesign />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <ContactModal
              isOpen={isContactModalOpen}
              onClose={() => setIsContactModalOpen(false)}
            />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
