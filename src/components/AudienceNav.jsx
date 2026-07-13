import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  evolve_yellow_with_name,
  evolve_yellow_logo
} from "../assets/images/Nav";
import InstituteContactModal from "./InstituteContactModal";

/**
 * AudienceNav — shared header for the institutions & corporates pages.
 * Same "chrome" as BlackNav (fixed, rounded-bottom black bar) but flat:
 * no hamburger / slide-out menu, just the logo + inline nav links + get in touch.
 */
const NAV_ITEMS = [
  { path: "/designers", label: "designers" },
  { path: "/institutions", label: "institutions" },
  { path: "/corporates", label: "corporates" }
];

const AudienceNav = ({ programme = "general" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div
        className="w-full"
        style={{
          border: "2px solid #0E0E0E",
          borderBottomLeftRadius: 18,
          borderBottomRightRadius: 18
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
            {/* logo — left */}
            <button
              onClick={() => navigate("/")}
              className="focus:outline-none cursor-pointer flex-shrink-0"
              aria-label="evolve home"
            >
              <img
                src={evolve_yellow_logo}
                alt="evolve"
                className="h-6 w-auto md:hidden"
              />
              <img
                src={evolve_yellow_with_name}
                alt="evolve"
                className="hidden md:block h-6 w-auto"
              />
            </button>

            {/* nav links + get in touch — right */}
            <div className="flex items-center gap-4 md:gap-8">
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`text-evolve-yellow transition-colors duration-200 hover:text-white text-[13px] md:text-[17px] ${
                      isActive ? "font-extrabold" : "font-medium"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={() => setModalOpen(true)}
                className="hidden md:inline text-evolve-yellow font-medium text-[17px] hover:text-white transition-colors duration-200"
              >
                get in touch
              </button>
            </div>
          </div>
        </div>
      </div>

      <InstituteContactModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        programme={programme}
        intent="contact"
      />
    </nav>
  );
};

export default AudienceNav;
