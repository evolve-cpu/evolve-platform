import { useState, useEffect, useRef, useMemo } from "react";
import ReactDOM from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";

import {
  evolve_logo_nav as evolve_logo,
  evolve_logo_mobile,
  three_wavy_lines,
  marquee_vector_1,
  evolve_text,
  marquee_vector_2,
  cross_line_pink,
  evolve_be_remarkable
} from "../assets/images/Nav";

import { join_us_button, join_us_button_hover } from "../assets/images/Home";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../supabaseClient";
import AuthModal from "./AuthModal";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

function ordinalDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDate();
  const sfx =
    day >= 11 && day <= 13
      ? "th"
      : { 1: "st", 2: "nd", 3: "rd" }[day % 10] || "th";
  return `${day}${sfx} ${d.toLocaleString("en-US", { month: "long" }).toLowerCase()}`;
}

const MIXED_BL = 16;
const MIXED_BR = 16;

// ── Feature flag: set false to disable hide-on-scroll-down behaviour ─────────
const NAVBAR_SCROLL_HIDE = true;
// ─────────────────────────────────────────────────────────────────────────────

const Navigation = ({ onContactClick, showNavbar = true, onLogoClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [payment, setPayment] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const receiptDesktopRef = useRef(null);
  const receiptMobileRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  const outerRef = useRef(null);
  const navbarRef = useRef(null);

  const menuUnderlayRef = useRef(null);
  const menuPanelRef = useRef(null);
  const menuContentRef = useRef(null);

  const marqueeTrackRef = useRef(null);
  const marqueeGroupRef = useRef(null);
  const marqueeTLRef = useRef(null);

  const navHeightRef = useRef(0);
  const bodyScrollRef = useRef(0);

  // ── Scroll-direction detection (controlled by NAVBAR_SCROLL_HIDE flag) ──────
  const [navHiddenByScroll, setNavHiddenByScroll] = useState(false);
  const lastScrollYRef = useRef(0);
  const scrollTickingRef = useRef(false);

  useEffect(() => {
    if (!NAVBAR_SCROLL_HIDE) return;
    const handleScroll = () => {
      if (scrollTickingRef.current) return;
      scrollTickingRef.current = true;
      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const delta = currentY - lastScrollYRef.current;
        if (Math.abs(delta) > 5) {
          setNavHiddenByScroll(delta > 0 && currentY > 80);
        }
        lastScrollYRef.current = currentY;
        scrollTickingRef.current = false;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  // ── End scroll-direction detection ─────────────────────────────────────────

  const { user, setUser, authLoading, setAuthLoading } = useAuth();
  const avatarSrc =
    user?.avatar_url ||
    `https://api.dicebear.com/7.x/thumbs/svg?seed=${user?.id || "user"}`;

  const fullName = user?.name || "";

  const firstName = useMemo(() => {
    if (!fullName) return "";
    return fullName.trim().split(" ")[0];
  }, [fullName]);

  const accountBtnRef = useRef(null);
  const [accountPos, setAccountPos] = useState({ top: 0, left: 0 });

  const navItems = [
    { path: "/", label: "home" },
    { path: "/community", label: "community" },
    {
      path: "/community/portfolio-review",
      label: "- portfolio review",
      sub: true
    },
    { path: "/mentorship", label: "mentorship" },
    { path: "/webinars", label: "webinars" },
    { path: "/contact", label: "contact us", isModal: true }
  ];

  const isActive = (p) => {
    if (p === "/" && location.pathname === "/") return true;
    if (p !== "/" && location.pathname === p) return true;
    return false;
  };

  const hideAuthButton = ["/evolve-in-person", "/evolve-in-person/"].includes(
    location.pathname
  );

  const isDesktop = () => window.matchMedia("(min-width: 768px)").matches;

  const isCollegeProtectedRoute = (pathname) => {
    return (
      pathname === "/evolve-in-person/activities" ||
      pathname === "/evolve-in-person/self-reflection" ||
      pathname === "/evolve-in-person/reality-check"
    );
  };

  const handleLogoClick = () => {
    const isOnHomePage =
      location.pathname === "/designers" || location.pathname === "/home";

    if (isOnHomePage && typeof window.handleLogoClick === "function") {
      window.handleLogoClick();
      return;
    }

    navigate("/");
    if (onLogoClick) onLogoClick();
  };

  const openAccountModal = () => {
    if (!accountBtnRef.current) return;

    const rect = accountBtnRef.current.getBoundingClientRect();
    const modalWidth = 315;
    const gap = 10;

    let left = rect.right - modalWidth;
    if (left < gap) left = gap;
    if (left + modalWidth > window.innerWidth - gap) {
      left = window.innerWidth - modalWidth - gap;
    }

    setAccountPos({ top: rect.bottom + gap, left });
    setAccountOpen(true);
  };

  const handleLogout = async () => {
    try {
      setAuthLoading(true);
      setAccountOpen(false);
      await supabase.auth.signOut();
      setUser(null);
      if (isCollegeProtectedRoute(location.pathname)) {
        navigate("/evolve-in-person");
      }
    } catch (err) {
      console.log("logout error:", err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    if (!accountOpen || !user) return;
    setPaymentLoading(true);
    supabase
      .from("mentorship_payments")
      .select("*, batch:mentorship_batches(batch_number, start_date)")
      .eq("user_id", user.id)
      .eq("status", "success")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        setPayment(data || null);
        setPaymentLoading(false);
      });
  }, [accountOpen, user]);

  const downloadReceipt = async () => {
    const ref = window.innerWidth >= 768 ? receiptDesktopRef : receiptMobileRef;
    if (!ref.current || !payment) return;
    const canvas = await html2canvas(ref.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const w = canvas.width / 2;
    const h = canvas.height / 2;
    const pdf = new jsPDF({ unit: "px", format: [w, h] });
    pdf.addImage(imgData, "PNG", 0, 0, w, h);
    pdf.save(`evolve-receipt-${payment.razorpay_payment_id || Date.now()}.pdf`);
  };

  useEffect(() => {
    const measure = () => {
      if (!outerRef.current) return;
      navHeightRef.current = outerRef.current.offsetHeight || 0;
      if (menuContentRef.current) {
        menuContentRef.current.style.paddingTop = `${navHeightRef.current}px`;
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

  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (!outerRef.current) return;
    const el = outerRef.current;
    const visible = showNavbar && !(NAVBAR_SCROLL_HIDE && navHiddenByScroll);

    if (!hasAnimatedRef.current) {
      gsap.set(el, { y: visible ? 0 : -100 });
      el.style.pointerEvents = visible ? "auto" : "none";
      hasAnimatedRef.current = true;
      return;
    }

    if (visible) {
      gsap.to(el, {
        y: 0,
        duration: 0.6,
        ease: "power3.out",
        onStart: () => {
          el.style.pointerEvents = "auto";
        }
      });
    } else {
      gsap.to(el, {
        y: -100,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => {
          el.style.pointerEvents = "none";
        }
      });
    }
  }, [showNavbar, navHiddenByScroll]);

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

  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setAccountOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      if (marqueeTLRef.current) {
        marqueeTLRef.current.kill();
        marqueeTLRef.current = null;
      }
      return;
    }
    const track = marqueeTrackRef.current;
    const group = marqueeGroupRef.current;
    if (!track || !group) return;

    if (marqueeTLRef.current) marqueeTLRef.current.kill();
    gsap.set(track, { x: 0 });

    while (track.children.length > 1) track.removeChild(track.lastChild);
    const clone = group.cloneNode(true);
    track.appendChild(clone);

    const groupWidth = group.getBoundingClientRect().width;
    const tl = gsap.timeline({ repeat: -1 });
    tl.to(track, { x: -groupWidth, duration: 14, ease: "linear" });
    marqueeTLRef.current = tl;

    return () => {
      if (marqueeTLRef.current) marqueeTLRef.current.kill();
      marqueeTLRef.current = null;
    };
  }, [menuOpen]);

  /* ── receipt rows helper ── */
  const receiptRows = payment
    ? [
        ["plan", payment.plan === "starter" ? "starter" : "accelerator"],
        ["amount paid", `₹${Number(payment.amount).toLocaleString("en-IN")}`],
        [
          "date",
          new Date(payment.created_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric"
          })
        ],
        ["batch", `batch ${payment.batch?.batch_number ?? "—"}`],
        [
          "starts on",
          payment.batch?.start_date
            ? ordinalDate(payment.batch.start_date)
            : "—"
        ],
        ["ref", payment.razorpay_payment_id || "—"]
      ]
    : [];

  const navVisible = showNavbar && !(NAVBAR_SCROLL_HIDE && navHiddenByScroll);

  return (
    <>
      {/* NAVBAR */}
      <nav
        className="fixed top-0 left-0 right-0 z-[10000]"
        style={{ pointerEvents: navVisible ? "auto" : "none" }}
      >
        <div
          ref={outerRef}
          className="w-full border-2 border-black bg-transparent"
          style={{
            borderBottomLeftRadius: MIXED_BL,
            borderBottomRightRadius: MIXED_BR
          }}
        >
          <div
            ref={navbarRef}
            className="w-full overflow-hidden"
            style={{
              borderBottomLeftRadius: MIXED_BL,
              borderBottomRightRadius: MIXED_BR
            }}
          >
            <div
              className="bg-evolve-yellow w-full flex items-center justify-between px-4 md:px-8"
              style={{
                height: "56px",
                boxShadow: `inset 6px 6px 0 rgba(0,0,0,0.15), inset 6px 6px 0 rgba(0,0,0,0.15)`
              }}
            >
              {/* MENU BUTTON */}
              <button
                className="cursor-pointer transition-transform duration-300 hover:scale-105 flex-shrink-0"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="open menu"
                style={{ width: "72px" }}
              >
                <img
                  src={menuOpen ? cross_line_pink : three_wavy_lines}
                  alt="menu"
                  className="h-5 w-auto md:h-6"
                />
              </button>

              {/* LOGO */}
              <div
                onClick={handleLogoClick}
                className="absolute left-1/2 cursor-pointer -translate-x-1/2 flex justify-center items-center"
              >
                <img
                  src={evolve_logo_mobile}
                  alt="evolve logo"
                  className="h-7 w-auto md:hidden"
                />
                <img
                  src={evolve_logo}
                  alt="evolve logo"
                  className="hidden md:block h-7 w-auto"
                />
              </div>

              {/* AUTH BUTTON */}
              {!hideAuthButton && (
                <button
                  ref={accountBtnRef}
                  disabled={authLoading}
                  onClick={() => {
                    if (!user) {
                      localStorage.setItem("signin_from", location.pathname);
                      return navigate("/signin", {
                        state: { from: location.pathname }
                      });
                    }
                    if (!accountOpen) openAccountModal();
                    else setAccountOpen(false);
                  }}
                  className="text-black font-extrabold text-[16px] md:text-[20px] flex items-center gap-2"
                >
                  {authLoading ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" />
                      <span>loading…</span>
                    </>
                  ) : user ? (
                    <>
                      <img
                        src={avatarSrc}
                        alt="avatar"
                        className="h-10 w-10 rounded-full"
                      />
                      <span className="hidden md:inline">{fullName}</span>
                    </>
                  ) : (
                    "sign in"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* DESKTOP ACCOUNT MODAL */}
      {accountOpen &&
        user &&
        ReactDOM.createPortal(
          <>
            <div
              className="hidden md:block fixed inset-0 z-[10008]"
              onClick={() => setAccountOpen(false)}
            />
            <div
              className="hidden md:block fixed z-[10009] w-[340px] max-h-[90vh] overflow-y-auto rounded-[20px] border-[2px] border-black bg-evolve-yellow shadow-[8px_8px_0px_rgba(0,0,0,0.25)] pl-6 pr-6 pt-0 pb-6"
              style={{ top: accountPos.top, left: accountPos.left }}
            >
              <div className="flex justify-end">
                <button
                  onClick={() => setAccountOpen(false)}
                  className="text-black text-[28px] font-extrabold mt-2"
                >
                  ×
                </button>
              </div>
              <div className="flex flex-col items-center text-center">
                <img
                  src={avatarSrc}
                  alt="avatar"
                  className="w-[5.5rem] h-[5.5rem] rounded-full"
                />
                <p className="text-black font-extrabold text-[20px] mt-4">
                  {user.name}
                </p>
                <p className="text-black font-normal text-[14px] mt-1">
                  {user.email}
                </p>
                {user.onboarding_completed && user.username && (
                  <button
                    onClick={() => {
                      setAccountOpen(false);
                      navigate(`/profile/${user.username}`);
                    }}
                    className="mt-5 w-full bg-black text-evolve-yellow font-extrabold py-2.5 rounded-xl text-[13px] lowercase tracking-wide"
                  >
                    my profile page
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="mt-3 text-black font-extrabold underline flex items-center gap-2"
                >
                  log out
                </button>
                {paymentLoading ? (
                  <p className="mt-5 text-black/40 text-[13px]">
                    loading payment…
                  </p>
                ) : payment ? (
                  <>
                    <div
                      ref={receiptDesktopRef}
                      className="mt-5 w-full bg-white rounded-xl border border-black/15 p-4 text-left"
                    >
                      <p className="font-extrabold text-black text-[10px] uppercase tracking-widest mb-3 text-center">
                        evolve mentorship · receipt
                      </p>
                      <div className="w-full h-px bg-black/10 mb-3" />
                      {receiptRows.map(([label, value]) => (
                        <div
                          key={label}
                          className="flex justify-between items-start gap-3 mb-2"
                        >
                          <span className="text-black/40 text-[11px] font-normal lowercase shrink-0">
                            {label}
                          </span>
                          <span className="text-black font-semibold text-[11px] text-right break-all">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={downloadReceipt}
                      className="mt-3 w-full bg-black text-evolve-yellow font-extrabold py-2.5 rounded-xl text-[12px] lowercase tracking-wide"
                    >
                      download receipt ↓
                    </button>
                  </>
                ) : (
                  <p className="mt-5 text-black/40 text-[13px]">
                    no payments yet
                  </p>
                )}
              </div>
            </div>
          </>,
          document.body
        )}

      {/* MOBILE ACCOUNT MODAL */}
      {accountOpen && user && (
        <div className="md:hidden fixed inset-0 z-[10009] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setAccountOpen(false)}
          />
          <div className="relative z-10 w-[85vw] max-w-[360px] bg-evolve-yellow border-[2px] border-black rounded-[18px] shadow-[8px_8px_0px_rgba(0,0,0,0.25)] px-6 py-8 flex flex-col items-center text-center">
            <button
              onClick={() => setAccountOpen(false)}
              className="absolute top-4 right-4 text-black text-[26px] font-extrabold"
            >
              ×
            </button>
            <img
              src={avatarSrc}
              alt="avatar"
              className="w-16 h-16 rounded-full"
            />
            <p className="text-black font-extrabold text-[18px] mt-4">
              {user.name}
            </p>
            <p className="text-black font-normal text-[14px] mt-1">
              {user.email}
            </p>
            {user.onboarding_completed && user.username && (
              <button
                onClick={() => {
                  setAccountOpen(false);
                  navigate(`/profile/${user.username}`);
                }}
                className="mt-5 w-full bg-black text-evolve-yellow font-extrabold py-2.5 rounded-xl text-[13px] lowercase tracking-wide"
              >
                my profile page
              </button>
            )}
            <button
              onClick={handleLogout}
              className="mt-3 text-black font-extrabold underline"
            >
              log out
            </button>
            {paymentLoading ? (
              <p className="mt-5 text-black/40 text-[13px]">loading payment…</p>
            ) : payment ? (
              <>
                <div
                  ref={receiptMobileRef}
                  className="mt-5 w-full bg-white rounded-xl border border-black/15 p-4 text-left"
                >
                  <p className="font-extrabold text-black text-[10px] uppercase tracking-widest mb-3 text-center">
                    evolve mentorship · receipt
                  </p>
                  <div className="w-full h-px bg-black/10 mb-3" />
                  {receiptRows.map(([label, value]) => (
                    <div
                      key={label}
                      className="flex justify-between items-start gap-3 mb-2"
                    >
                      <span className="text-black/40 text-[11px] font-normal lowercase shrink-0">
                        {label}
                      </span>
                      <span className="text-black font-semibold text-[11px] text-right break-all">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={downloadReceipt}
                  className="mt-3 w-full bg-black text-evolve-yellow font-extrabold py-2.5 rounded-xl text-[12px] lowercase tracking-wide"
                >
                  download receipt ↓
                </button>
              </>
            ) : (
              <p className="mt-5 text-black/40 text-[13px]">no payments yet</p>
            )}
          </div>
        </div>
      )}

      {/* MENU UNDERLAY */}
      <div
        ref={menuUnderlayRef}
        className="fixed top-0 left-0 w-full h-[80vh] md:h-screen z-[9990] hidden"
        style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.25)" }}
      >
        <div className="relative h-full w-full flex">
          <div className="hidden md:block absolute inset-0 bg-black/30" />

          {/* LEFT PANEL */}
          <div
            ref={menuPanelRef}
            className="relative w-full md:w-[40%] bg-evolve-yellow border-b-2 border-r-2 border-black overflow-hidden"
            style={{ boxShadow: "0 24px 48px rgba(0,0,0,0.28)" }}
          >
            <div ref={menuContentRef} className="h-full flex flex-col">
              <div className="flex-1 flex items-center">
                <div className="w-full flex justify-center px-6 md:px-8">
                  <div className="flex flex-col items-start space-y-2 tracking-normal">
                    {navItems.map((item) => {
                      /* sub-item styling */
                      const subClass = item.sub
                        ? "text-[14px] md:text-[18px] text-black/50 pl-5 md:pl-6"
                        : "text-[24px] md:text-[30px]";

                      if (item.isHeader) {
                        return (
                          <span
                            key={item.label}
                            className="text-[24px] md:text-[30px] font-extrabold leading-[1.05] text-black"
                          >
                            {item.label}
                          </span>
                        );
                      }

                      if (item.external) {
                        return (
                          <a
                            key={item.path}
                            href={item.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setMenuOpen(false)}
                            className={`${subClass} font-extrabold leading-[1.05] text-left tracking-normal transition-colors duration-300 text-black hover:text-evolve-pink`}
                          >
                            {item.label}
                          </a>
                        );
                      }

                      if (item.isModal) {
                        return (
                          <button
                            key={item.path}
                            onClick={() => {
                              setMenuOpen(false);
                              if (onContactClick) onContactClick();
                            }}
                            className={`${subClass} font-extrabold leading-[1.05] text-left tracking-normal transition-colors duration-300 ${
                              location.pathname === item.path
                                ? "text-evolve-pink"
                                : "text-black hover:text-evolve-pink"
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      }

                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setMenuOpen(false)}
                          className={`${subClass} font-extrabold leading-[1.05] text-left tracking-normal transition-colors duration-300 ${
                            isActive(item.path)
                              ? "text-evolve-pink"
                              : "text-black hover:text-evolve-pink"
                          }`}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* JOIN US */}
              <div className="w-full flex justify-center mb-5 md:mb-6">
                <a
                  href="https://chat.whatsapp.com/DsLtzxlHPQXC4Gaee76qz4?s=cl&p=a&ilr=4"
                  target="_blank"
                  rel="noopener noreferrer"
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

              {/* MARQUEE */}
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
                      alt="vector 1"
                      className="h-10 md:h-14 w-auto flex-none"
                    />
                    <img
                      src={evolve_text}
                      alt="evolve text"
                      className="h-8 md:h-10 w-auto flex-none"
                    />
                    <img
                      src={marquee_vector_2}
                      alt="vector 2"
                      className="h-10 md:h-14 w-auto flex-none"
                    />
                    <img
                      src={evolve_be_remarkable}
                      alt="be remarkable"
                      className="h-8 md:h-10 w-auto flex-none"
                    />
                    <img
                      src={marquee_vector_1}
                      alt="vector 1"
                      className="h-10 md:h-14 w-auto flex-none"
                    />
                    <img
                      src={evolve_text}
                      alt="evolve text"
                      className="h-8 md:h-10 w-auto flex-none"
                    />
                    <img
                      src={marquee_vector_2}
                      alt="vector 2"
                      className="h-10 md:h-14 w-auto flex-none"
                    />
                    <img
                      src={evolve_be_remarkable}
                      alt="be remarkable"
                      className="h-8 md:h-10 w-auto flex-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT CLICK-TO-CLOSE (desktop) */}
          <button
            className="hidden md:block flex-1 h-full bg-transparent relative z-10"
            onClick={() => setMenuOpen(false)}
            aria-label="close menu overlay"
          />
        </div>
      </div>

      {/* AUTH MODAL */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        user={user}
      />
    </>
  );
};

export default Navigation;
