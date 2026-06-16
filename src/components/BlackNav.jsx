/**
 * BlackNav — dark-themed navbar used on /signin, /payment, /mentorship-session.
 * Identical GSAP menu animation and panel design as the main Navigation component.
 *
 * Props:
 *   onLogoClick  — called when the centred logo is clicked (defaults to navigate("/"))
 *   right        — optional JSX rendered in the right slot (avatar/profile area)
 */
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import gsap from "gsap";
import {
  evolve_logo_nav_yellow,
  three_wavy_lines_yellow,
  cross_line_pink,
  marquee_vector_1,
  marquee_vector_2,
  evolve_text,
  evolve_be_remarkable
} from "../assets/images/Nav";
import { join_us_button, join_us_button_hover } from "../assets/images/Home";

const NAV_ITEMS = [
  { path: "/", label: "home" },
  { path: "/community", label: "community" },
  { path: "/mentorship", label: "mentorship" },
  { path: "/webinars", label: "webinars" },
  { path: "/contact", label: "contact us", isModal: true }
];

const isDesktop = () => window.matchMedia("(min-width: 768px)").matches;

export default function BlackNav({ onLogoClick, right }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const outerRef = useRef(null);
  const bodyScrollRef = useRef(0);
  const menuUnderlayRef = useRef(null);
  const menuPanelRef = useRef(null);
  const menuContentRef = useRef(null);
  const marqueeTrackRef = useRef(null);
  const marqueeGroupRef = useRef(null);
  const marqueeTLRef = useRef(null);

  /* ── measure navbar height → pad menu content below it ─────────────────── */
  useEffect(() => {
    const measure = () => {
      if (!outerRef.current) return;
      const h = outerRef.current.offsetHeight || 0;
      if (menuContentRef.current) {
        menuContentRef.current.style.paddingTop = `${h}px`;
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (outerRef.current) ro.observe(outerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  /* ── GSAP open / close ──────────────────────────────────────────────────── */
  useEffect(() => {
    const underlay = menuUnderlayRef.current;
    const panel = menuPanelRef.current;
    if (!underlay || !panel) return;

    const lockScroll = () => {
      bodyScrollRef.current = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${bodyScrollRef.current}px`;
      document.body.style.width = "100%";
      document.documentElement.style.overflow = "hidden";
    };

    const unlockScroll = () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.documentElement.style.overflow = "";
      window.scrollTo(0, bodyScrollRef.current);
    };

    if (menuOpen) {
      lockScroll();
      if (isDesktop()) {
        gsap.set(underlay, { display: "block", opacity: 0 });
        gsap.set(panel, { xPercent: -100 });
        gsap.to(underlay, { opacity: 1, duration: 0.55, ease: "power3.out" });
        gsap.to(panel, { xPercent: 0, duration: 0.55, ease: "power3.out" });
      } else {
        gsap.set(underlay, { display: "block", yPercent: -100 });
        gsap.to(underlay, { yPercent: 0, duration: 0.55, ease: "power3.out" });
      }
    } else {
      unlockScroll();
      if (isDesktop()) {
        gsap.to(panel, { xPercent: -100, duration: 0.45, ease: "power2.in" });
        gsap.to(underlay, {
          opacity: 0,
          duration: 0.45,
          ease: "power2.in",
          onComplete: () => gsap.set(underlay, { display: "none" })
        });
      } else {
        gsap.to(underlay, {
          yPercent: -100,
          duration: 0.45,
          ease: "power2.in",
          onComplete: () => gsap.set(underlay, { display: "none" })
        });
      }
    }

    return () => {
      unlockScroll();
    };
  }, [menuOpen]);

  /* ── close on route change ──────────────────────────────────────────────── */
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  /* ── Escape key ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ── marquee animation ──────────────────────────────────────────────────── */
  useEffect(() => {
    if (!menuOpen) {
      marqueeTLRef.current?.kill();
      marqueeTLRef.current = null;
      return;
    }
    const track = marqueeTrackRef.current;
    const group = marqueeGroupRef.current;
    if (!track || !group) return;

    marqueeTLRef.current?.kill();
    gsap.set(track, { x: 0 });
    while (track.children.length > 1) track.removeChild(track.lastChild);
    const clone = group.cloneNode(true);
    track.appendChild(clone);
    const groupWidth = group.getBoundingClientRect().width;
    const tl = gsap.timeline({ repeat: -1 });
    tl.to(track, { x: -groupWidth, duration: 14, ease: "linear" });
    marqueeTLRef.current = tl;
    return () => {
      marqueeTLRef.current?.kill();
      marqueeTLRef.current = null;
    };
  }, [menuOpen]);

  /* ── render ─────────────────────────────────────────────────────────────── */
  return (
    <>
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div
          ref={outerRef}
          className="w-full"
          style={{
            border: "2px solid #0E0E0E",
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16
          }}
        >
          <div
            className="w-full overflow-hidden"
            style={{ borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}
          >
            <div
              className="flex items-center justify-between px-4 md:px-8"
              style={{
                height: "56px",
                background: "rgba(22,22,22,1)",
                boxShadow:
                  "inset 6px 6px 0 rgba(14,14,14,0.6), inset -6px 6px 0 rgba(14,14,14,0.6)"
              }}
            >
              {/* menu button — left */}
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="cursor-pointer transition-transform duration-300 hover:scale-105 flex-shrink-0"
                style={{ width: 44 }}
                aria-label="open menu"
              >
                <img
                  src={menuOpen ? cross_line_pink : three_wavy_lines_yellow}
                  alt="menu"
                  className="h-5 w-auto md:h-6"
                />
              </button>

              {/* logo — centre */}
              <div className="absolute left-1/2 -translate-x-1/2 flex justify-center items-center">
                <button
                  onClick={onLogoClick ?? (() => navigate("/"))}
                  className="focus:outline-none cursor-pointer"
                >
                  <img
                    src={evolve_logo_nav_yellow}
                    alt="evolve"
                    className="h-6 md:h-7 w-auto"
                  />
                </button>
              </div>

              {/* right slot (avatar, etc.) — fixed width to balance the left button */}
              <div style={{ minWidth: 44 }} className="flex justify-end">
                {right ?? null}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* MENU UNDERLAY */}
      <div
        ref={menuUnderlayRef}
        className="fixed top-0 left-0 w-full h-[80vh] md:h-screen z-40 hidden"
        style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.25)" }}
      >
        <div className="relative h-full w-full flex">
          {/* desktop backdrop */}
          <div className="hidden md:block absolute inset-0 bg-black/30" />

          {/* left panel */}
          <div
            ref={menuPanelRef}
            className="relative w-full md:w-[40%] bg-evolve-yellow border-b-2 border-r-2 border-black overflow-hidden"
            style={{ boxShadow: "0 24px 48px rgba(0,0,0,0.28)" }}
          >
            <div ref={menuContentRef} className="h-full flex flex-col">
              {/* nav links */}
              <div className="flex-1 flex items-center">
                <div className="w-full flex justify-center px-6 md:px-8">
                  <div className="flex flex-col items-start space-y-2 tracking-normal">
                    {NAV_ITEMS.map((item) =>
                      item.isModal ? (
                        <button
                          key={item.path}
                          onClick={() => {
                            setMenuOpen(false);
                            window.dispatchEvent(
                              new CustomEvent("openContactModal")
                            );
                          }}
                          className="text-[32px] md:text-[40px] font-extrabold leading-[1.05] text-left tracking-normal transition-colors duration-300 text-black hover:text-evolve-pink"
                        >
                          {item.label}
                        </button>
                      ) : (
                        <button
                          key={item.path}
                          onClick={() => {
                            setMenuOpen(false);
                            navigate(item.path);
                          }}
                          className={`text-[32px] md:text-[40px] font-extrabold leading-[1.05] text-left tracking-normal transition-colors duration-300 ${
                            location.pathname === item.path
                              ? "text-evolve-pink"
                              : "text-black hover:text-evolve-pink"
                          }`}
                        >
                          {item.label}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* join us */}
              <div className="w-full flex justify-center mb-5 md:mb-6">
                <a
                  href="https://chat.whatsapp.com/DsLtzxlHPQXC4Gaee76qz4?s=cl&p=a&ilr=4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer"
                >
                  <img
                    src={join_us_button}
                    onMouseEnter={(e) =>
                      (e.currentTarget.src = join_us_button_hover)
                    }
                    onMouseLeave={(e) => (e.currentTarget.src = join_us_button)}
                    alt="join evolve community"
                    className="w-auto h-12 md:h-16"
                  />
                </a>
              </div>

              {/* marquee */}
              <div className="w-full h-16 md:h-28 border-t-2 border-black bg-evolve-lavender-indigo overflow-hidden relative">
                <div
                  ref={marqueeTrackRef}
                  className="absolute top-1/2 -translate-y-1/2 left-0 flex"
                  style={{ willChange: "transform" }}
                >
                  <div
                    ref={marqueeGroupRef}
                    className="flex items-center gap-8 md:gap-14 pr-8 md:pr-14 flex-none"
                  >
                    <img
                      src={marquee_vector_1}
                      alt=""
                      className="h-10 md:h-14 w-auto flex-none"
                    />
                    <img
                      src={evolve_text}
                      alt=""
                      className="h-8  md:h-10 w-auto flex-none"
                    />
                    <img
                      src={marquee_vector_2}
                      alt=""
                      className="h-10 md:h-14 w-auto flex-none"
                    />
                    <img
                      src={evolve_be_remarkable}
                      alt=""
                      className="h-8  md:h-10 w-auto flex-none"
                    />
                    <img
                      src={marquee_vector_1}
                      alt=""
                      className="h-10 md:h-14 w-auto flex-none"
                    />
                    <img
                      src={evolve_text}
                      alt=""
                      className="h-8  md:h-10 w-auto flex-none"
                    />
                    <img
                      src={marquee_vector_2}
                      alt=""
                      className="h-10 md:h-14 w-auto flex-none"
                    />
                    <img
                      src={evolve_be_remarkable}
                      alt=""
                      className="h-8  md:h-10 w-auto flex-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* right click-to-close (desktop only) */}
          <button
            className="hidden md:block flex-1 h-full bg-transparent relative z-10"
            onClick={() => setMenuOpen(false)}
            aria-label="close menu overlay"
          />
        </div>
      </div>
    </>
  );
}
