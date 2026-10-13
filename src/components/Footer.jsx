import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// assets
import {
  marquee_vector_1,
  evolve_text,
  marquee_vector_2,
  evolve_be_remarkable
} from "../assets/images/Nav";
import {
  hand_with_thunder,
  hand_with_thunder_mobile
} from "../assets/images/Home";
import { right_arrow_yellow } from "../assets/images/Home_images";

const useIsMobile = (bp = 768) => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < bp : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < bp);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [bp]);
  return isMobile;
};

const Footer = ({ onContactClick }) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isActive = (path) => {
    if (!path) return false;
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname === path) return true;
    return false;
  };

  const marqueeRef = useRef(null);
  const marqueeTrackRef = useRef(null);
  const marqueeGroupRef = useRef(null);
  const marqueeTL = useRef(null);

  const navigationLinks = [
    { path: "/", label: "Home" },
    { path: "/profile-creation", label: "Profile creation" },
    { path: "/grow", label: "Grow" },
    { path: "/events", label: "Events" },
    { path: "/mentorship", label: "Mentorship" },
    { path: "/portfolio-review", label: "Portfolio review" },
    { path: "/community", label: "Community" },
    { path: "/pricing", label: "Pricing" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact us", isModal: true }
  ];

  const socialLinks = [
    { label: "Instagram", url: "https://www.instagram.com/evolvebypaperclip/" },
    { label: "Youtube", url: "https://www.youtube.com/@evolvebypaperclip" },
    {
      label: "Linkedin",
      url: "https://www.linkedin.com/company/evolvedesignacademy/"
    },
    { label: "Discord", url: "https://discord.gg/wKRYG7cSWt" }
  ];

  const audienceLinks = [
    { path: "/institutions", label: "Institutions" },
    { path: "/corporates", label: "Corporates" }
  ];

  const linkClass = (active) =>
    `leading-tight transition-colors duration-300 hover:text-evolve-pink ${
      active ? "text-evolve-pink" : "text-black"
    }`;

  const renderNavLink = (item, sizeClass) =>
    item.isModal ? (
      <button
        onClick={() => onContactClick && onContactClick()}
        className={`${sizeClass} ${linkClass(false)}`}
      >
        {item.label}
      </button>
    ) : (
      <Link
        to={item.path}
        className={`${sizeClass} ${linkClass(isActive(item.path))}`}
      >
        {item.label}
      </Link>
    );

  // same CTA (and destination) as the home hero's "Start for free"
  const startButton = (
    <button
      type="button"
      onClick={() => navigate(user ? "/app/profile" : "/signin")}
      className="inline-flex items-center gap-3 rounded-[16px] bg-black text-evolve-yellow border border-evolve-yellow font-semibold px-8 py-4 text-[18px] md:text-[20px] leading-none shadow-[4px_4px_0px_#806804] transition-transform duration-150 hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none select-none"
    >
      Start for free
      <img src={right_arrow_yellow} alt="" className="w-5 h-5 md:w-6 md:h-6" />
    </button>
  );

  const legal = (sizeClass) => (
    <div className={`${sizeClass} text-black`}>
      <Link to="/privacy" className="hover:text-evolve-pink transition-colors">
        Privacy Policy
      </Link>{" "}
      and{" "}
      <Link to="/terms" className="hover:text-evolve-pink transition-colors">
        Terms &amp; Conditions
      </Link>
    </div>
  );

  useLayoutEffect(() => {
    const container = marqueeRef.current;
    const track = marqueeTrackRef.current;
    const group = marqueeGroupRef.current;
    if (!container || !track || !group) return;

    // reset previous state
    marqueeTL.current?.kill();
    marqueeTL.current = null;
    [...track.querySelectorAll("[data-marquee-clone='1']")].forEach((n) =>
      n.remove()
    );
    gsap.set(track, { x: 0 });

    // clone to fill width
    const groupWidth = group.getBoundingClientRect().width || 1;
    const containerWidth = container.getBoundingClientRect().width || 1;
    const needed = Math.max(2, Math.ceil(containerWidth / groupWidth) + 1);

    for (let i = 0; i < needed; i++) {
      const clone = group.cloneNode(true);
      clone.setAttribute("data-marquee-clone", "1");
      track.appendChild(clone);
    }

    container.style.opacity = "1";

    marqueeTL.current = gsap.timeline({ repeat: -1 });
    marqueeTL.current.to(track, {
      x: -groupWidth,
      duration: 8,
      ease: "none",
      onRepeat: () => gsap.set(track, { x: 0 })
    });

    return () => marqueeTL.current?.kill();
  }, [isMobile]);

  return (
    <footer className="relative w-full bg-evolve-yellow text-black overflow-hidden min-h-screen md:min-h-screen md:min-h-[100dvh] isolate">
      {/* =================== DESKTOP (md+) =================== */}
      <div className="hidden md:block relative min-h-screen md:min-h-[100dvh]">
        <div className="max-w-[1600px] mx-auto px-[8vw] pt-[clamp(64px,9vw,180px)] pb-[16rem] relative min-h-screen md:min-h-[100dvh]">
          {/* text/content layer */}
          <div className="relative z-30 w-[46%] h-full">
            <h2
              className="font-extrabold text-evolve-black leading-[1.05] whitespace-nowrap"
              style={{
                fontSize: "clamp(40px, 3.4vw, 64px)",
                letterSpacing: "-0.04em"
              }}
            >
              Ready to Be Remarkable?
            </h2>

            <div className="mt-8">{startButton}</div>

            <div className="h-px bg-black/70 my-10" />

            <div className="grid grid-cols-2 gap-12">
              <div>
                <div className="text-[1.1rem] leading-none mb-5">
                  Navigation
                </div>
                <ul className="space-y-1">
                  {navigationLinks.map((item) => (
                    <li key={item.label}>
                      {renderNavLink(item, "text-[2rem]")}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-[1.1rem] leading-none mb-5">Socials</div>
                <ul className="space-y-1">
                  {socialLinks.map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[2rem] leading-tight hover:text-evolve-pink transition-colors duration-300"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>

                <div className="text-[1.1rem] leading-none mt-14 mb-3">
                  evolve for
                </div>
                <ul className="space-y-1">
                  {audienceLinks.map((item) => (
                    <li key={item.label}>
                      {renderNavLink(item, "text-[2rem]")}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-10">{legal("text-[1.4rem]")}</div>

            <div className="mt-6 text-[0.95rem] text-black">
              @2026 evolve. All rights reserved
            </div>
          </div>

          {/* decorative image */}
          <img
            src={hand_with_thunder}
            alt="hand with thunder"
            className="pointer-events-none select-none absolute right-[-40vh] md:bottom-[-23vh] max-w-[90%] z-10"
            style={{ transform: "translateY(-10%)" }}
          />
        </div>
      </div>

      {/* =================== MOBILE (base–md) =================== */}
      <div className="md:hidden relative px-5 pt-8 pb-28">
        <div className="relative z-30">
          <h2
            className="font-extrabold text-[2.25rem] leading-[1.05]"
            style={{ letterSpacing: "-0.04em" }}
          >
            Ready to Be Remarkable?
          </h2>

          <div className="mt-6">{startButton}</div>

          <div className="h-px bg-black/70 my-8" />

          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-[0.9rem] leading-none mb-3">Navigation</div>
              <ul className="space-y-1">
                {navigationLinks.map((item) => (
                  <li key={item.label}>
                    {renderNavLink(item, "text-[1.25rem]")}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-[0.9rem] leading-none mb-3">Socials</div>
              <ul className="space-y-1">
                {socialLinks.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[1.25rem] leading-tight hover:text-evolve-pink transition-colors duration-300"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="text-[0.9rem] leading-none mt-8 mb-3">
                evolve for
              </div>
              <ul className="space-y-1">
                {audienceLinks.map((item) => (
                  <li key={item.label}>
                    {renderNavLink(item, "text-[1.25rem]")}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8">{legal("text-[1rem]")}</div>

          <div className="mt-3 text-[0.85rem] text-black">
            @2026 evolve. All rights reserved
          </div>
        </div>
      </div>

      {/* mobile hand — anchored to the footer (like the marquee), not the
          text block, so it always sits right on top of the marquee */}
      <img
        src={hand_with_thunder_mobile}
        alt="hand with thunder"
        className="md:hidden pointer-events-none select-none absolute right-0 bottom-0 w-[90%] z-10"
      />

      {/* ======= shared slanted marquee ======= */}
      <div className="pointer-events-none absolute left-[-20vw] right-[-18vw] bottom-0 origin-bottom rotate-[-9deg] z-20">
        <div
          ref={marqueeRef}
          className={`relative left-1/2 -translate-x-1/2 w-[112vw] border-t-2 border-b-2 border-evolve-yellow bg-evolve-lavender-indigo overflow-hidden ${
            isMobile ? "-bottom-[3vh] h-24" : "bottom-[-16vh] h-[11rem]"
          }`}
          style={{ opacity: 0 }}
        >
          <div
            ref={marqueeTrackRef}
            className="absolute top-1/2 -translate-y-1/2 left-0 flex whitespace-nowrap"
            style={{ willChange: "transform" }}
          >
            <div
              ref={marqueeGroupRef}
              className={`flex items-center flex-none ${
                isMobile ? "gap-8 pr-8" : "gap-14 pr-14"
              }`}
            >
              <img
                src={marquee_vector_1}
                alt="vector 1"
                className={`w-auto flex-none ${isMobile ? "h-14" : "h-[6rem]"}`}
              />
              <img
                src={evolve_text}
                alt="evolve text"
                className={`w-auto flex-none ${isMobile ? "h-12" : "h-[5rem]"}`}
              />
              <img
                src={marquee_vector_2}
                alt="vector 2"
                className={`w-auto flex-none ${isMobile ? "h-14" : "h-[6rem]"}`}
              />
              <img
                src={evolve_be_remarkable}
                alt="evolve be remarkable"
                className={`w-auto flex-none ${isMobile ? "h-12" : "h-[5rem]"}`}
              />
              <img
                src={marquee_vector_1}
                alt="vector 1"
                className={`w-auto flex-none ${isMobile ? "h-14" : "h-[6rem]"}`}
              />
              <img
                src={evolve_text}
                alt="evolve text"
                className={`w-auto flex-none ${isMobile ? "h-12" : "h-[5rem]"}`}
              />
              <img
                src={marquee_vector_2}
                alt="vector 2"
                className={`w-auto flex-none ${isMobile ? "h-14" : "h-[6rem]"}`}
              />
              <img
                src={evolve_be_remarkable}
                alt="evolve text"
                className={`w-auto flex-none ${isMobile ? "h-12" : "h-[5rem]"}`}
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
