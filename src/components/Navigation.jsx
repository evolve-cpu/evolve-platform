import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import gsap from "gsap";
import {
  evolve_logo_nav as evolve_logo,
  three_wavy_lines,
  three_wavy_lines_pink
} from "../assets/images/Nav";

const Navigation = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const location = useLocation();

  const navbarRef = useRef(null);
  const menuBoxRef = useRef(null);
  const marqueeRef = useRef(null);

  const navItems = [
    { path: "/", label: "home" },
    { path: "/about", label: "about" },
    { path: "/course", label: "courses" },
    { path: "/webinars", label: "webinars" },
    { path: "/quiz", label: "quiz" },
    { path: "/community", label: "community" }
  ];

  const isActive = (path) => location.pathname === path;

  // === Navbar Hover Animation ===
  useEffect(() => {
    if (hovered) {
      gsap.to(navbarRef.current, {
        height: "5.5rem",
        duration: 0.5,
        ease: "power3.out"
      });
    } else {
      gsap.to(navbarRef.current, {
        height: "4rem",
        duration: 0.5,
        ease: "power2.inOut"
      });
    }
  }, [hovered]);

  // === Slide Menu Animation ===
  useEffect(() => {
    if (menuBoxRef.current) {
      if (menuOpen) {
        gsap.fromTo(
          menuBoxRef.current,
          { x: "-100%", opacity: 0 },
          { x: "0%", opacity: 1, duration: 0.7, ease: "power4.out" }
        );
      } else {
        gsap.to(menuBoxRef.current, {
          x: "-100%",
          opacity: 0,
          duration: 0.6,
          ease: "power2.in"
        });
      }
    }
  }, [menuOpen]);

  // === Marquee Animation ===
  useEffect(() => {
    if (menuOpen && marqueeRef.current) {
      const tl = gsap.timeline({ repeat: -1 });
      tl.to(marqueeRef.current, {
        xPercent: -100,
        duration: 8,
        ease: "linear"
      });
    }
  }, [menuOpen]);

  return (
    <nav
      ref={navbarRef}
      className="fixed top-0 left-0 w-full z-50 bg-transparent transition-all duration-500"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* === COLLAPSED BOX (default state) === */}
      {!hovered && (
        <div className="absolute left-1/2 -translate-x-1/2 bg-evolve-yellow border border-black px-8 py-2 rounded-b-2xl flex justify-center items-center">
          <img src={evolve_logo} alt="Evolve" className="h-8 w-auto" />
        </div>
      )}

      {/* === FULL NAVBAR (on hover) === */}
      {hovered && (
        <div className="bg-evolve-yellow border-b-2 border-black w-full flex justify-between items-center px-8 py-3">
          {/* Left: 3 wavy lines */}
          <button
            className="cursor-pointer transition-transform duration-300 hover:scale-105"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <img
              src={menuOpen ? three_wavy_lines_pink : three_wavy_lines}
              alt="menu"
              className="h-8 w-auto"
            />
          </button>

          {/* Center: Evolve Logo */}
          <div className="flex justify-center items-center">
            <img src={evolve_logo} alt="Evolve Logo" className="h-12 w-auto" />
          </div>

          {/* Right: Join Us text */}
          <div className="text-black font-extrabold text-[28px] leading-none tracking-wide">
            join us
          </div>
        </div>
      )}

      {/* === LEFT SLIDE MENU BOX === */}
      <div
        ref={menuBoxRef}
        className={`fixed top-0 left-0 h-screen w-[30%] bg-evolve-yellow border-r-2 border-black flex flex-col items-center transform ${
          menuOpen ? "block" : "hidden"
        }`}
      >
        {/* spacing gap on top */}
        <div className="flex-1" />

        {/* nav links in middle */}
        <div className="flex flex-col justify-center items-center space-y-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMenuOpen(false)}
              className={`text-[40px] font-extrabold transition-colors duration-300 text-center ${
                isActive(item.path)
                  ? "text-evolve-pink"
                  : "text-black hover:text-evolve-pink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* spacing gap below links */}
        <div className="flex-1" />

        {/* marquee footer */}
        <div className="w-full h-14 bg-evolve-purple overflow-hidden flex items-center border-t-2 border-black relative">
          <div
            ref={marqueeRef}
            className="absolute whitespace-nowrap text-[40px] font-extrabold text-white"
          >
            evolve&nbsp;&nbsp;evolve&nbsp;&nbsp;evolve&nbsp;&nbsp;evolve&nbsp;&nbsp;evolve
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
