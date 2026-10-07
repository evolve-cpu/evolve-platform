import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import gsap from "gsap";
import { cross_line_pink } from "../../assets/images/Nav";

// Same destinations as the main site nav (src/components/Navigation.jsx) —
// this is the same menu, just recoloured dark-bg/yellow-text per the brief,
// instead of the usual yellow-bg/black-text panel.
const NAV_ITEMS = [
  { path: "/", label: "Home" },
  { path: "/community", label: "Community" },
  { path: "/portfolio-review", label: "Portfolio Review" },
  { path: "/mentorship", label: "Mentorship" },
  { path: "/events", label: "Events" },
  { path: "/contact", label: "Contact Us", isModal: true }
];

const isDesktop = () => window.matchMedia("(min-width: 768px)").matches;

export default function TypetoberNav({ user, onAvatarClick, onPrize, onGuide }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuUnderlayRef = useRef(null);
  const menuPanelRef = useRef(null);

  const firstName = (user?.name || "").trim().split(" ")[0];
  const avatarSrc =
    user?.avatar_url ||
    `https://api.dicebear.com/7.x/thumbs/svg?seed=${user?.id || "typetober"}`;

  useEffect(() => {
    const underlay = menuUnderlayRef.current;
    const panel = menuPanelRef.current;
    if (!underlay || !panel) return;

    const lock = () => {
      document.body.style.overflow = "hidden";
    };
    const unlock = () => {
      document.body.style.overflow = "";
    };

    if (menuOpen) {
      lock();
      if (isDesktop()) {
        gsap.set(underlay, { display: "block", opacity: 0 });
        gsap.set(panel, { xPercent: -100 });
        gsap.to(underlay, { opacity: 1, duration: 0.5, ease: "power3.out" });
        gsap.to(panel, { xPercent: 0, duration: 0.5, ease: "power3.out" });
      } else {
        gsap.set(underlay, { display: "block", yPercent: -100 });
        gsap.to(underlay, { yPercent: 0, duration: 0.5, ease: "power3.out" });
      }
    } else {
      unlock();
      if (isDesktop()) {
        gsap.to(panel, { xPercent: -100, duration: 0.4, ease: "power2.in" });
        gsap.to(underlay, {
          opacity: 0,
          duration: 0.4,
          ease: "power2.in",
          onComplete: () => gsap.set(underlay, { display: "none" })
        });
      } else {
        gsap.to(underlay, {
          yPercent: -100,
          duration: 0.4,
          ease: "power2.in",
          onComplete: () => gsap.set(underlay, { display: "none" })
        });
      }
    }
    return unlock;
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Floating icon buttons — no shared bar/logo, matches the reference design. */}
      <div className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-3 pt-3 md:px-6 md:pt-5 pointer-events-none">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="tt-ibtn pointer-events-auto"
          aria-label="open menu"
        >
          {menuOpen ? (
            <img src={cross_line_pink} alt="close" className="h-5 w-auto" />
          ) : (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#FFD007" strokeWidth="2" strokeLinecap="round">
              <path d="M4 8h16M4 16h16" />
            </svg>
          )}
        </button>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button onClick={onPrize} aria-label="Prizes" className="tt-ibtn">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#FFD007" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3" />
            </svg>
          </button>
          <button onClick={onGuide} aria-label="Guidelines" className="tt-ibtn">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#FFD007" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5M9 8h6M9 12h6" />
            </svg>
          </button>
          {user && (
            <button onClick={onAvatarClick} className="tt-ibtn tt-ibtn-wide" aria-label="your profile">
              <img src={avatarSrc} alt={firstName} className="w-7 h-7 rounded-full" />
              <span className="hidden md:inline text-[14px] font-bold text-white">{firstName}</span>
            </button>
          )}
        </div>
      </div>

      <div
        ref={menuUnderlayRef}
        className="fixed top-0 left-0 w-full h-[80vh] md:h-screen z-[99] hidden"
        style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.45)" }}
      >
        <div className="relative h-full w-full flex">
          <div className="hidden md:block absolute inset-0 bg-black/50" />

          <div
            ref={menuPanelRef}
            className="relative w-full md:w-[40%] bg-[#161616] border-b-2 border-r-2 border-white/10 overflow-hidden"
          >
            <div className="h-full flex flex-col pt-[80px]">
              <div className="flex-1 flex items-center">
                <div className="w-full flex justify-center px-6 md:px-8">
                  <div className="flex flex-col items-start space-y-2">
                    {NAV_ITEMS.map((item) =>
                      item.isModal ? (
                        <button
                          key={item.path}
                          onClick={() => {
                            setMenuOpen(false);
                            window.dispatchEvent(new CustomEvent("openContactModal"));
                            navigate("/");
                          }}
                          className="text-[30px] md:text-[38px] font-extrabold leading-[1.05] text-left transition-colors duration-300 text-evolve-yellow hover:text-evolve-pink"
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
                          className={`text-[30px] md:text-[38px] font-extrabold leading-[1.05] text-left transition-colors duration-300 ${
                            location.pathname === item.path
                              ? "text-evolve-pink"
                              : "text-evolve-yellow hover:text-evolve-pink"
                          }`}
                        >
                          {item.label}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="w-full flex justify-center mb-6">
                <a
                  href="https://discord.gg/MmfaqCPdF7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-[180px] h-[52px] rounded-[16px] bg-evolve-yellow text-black text-[18px] font-bold"
                >
                  Join Us
                </a>
              </div>
            </div>
          </div>

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
