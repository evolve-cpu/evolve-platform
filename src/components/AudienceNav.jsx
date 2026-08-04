import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  evolve_yellow_with_name,
  evolve_yellow_logo
} from "../assets/images/Nav";
import InstituteContactModal from "./InstituteContactModal";
import { AUDIENCE_INQUIRY_CONFIG } from "../lib/audienceInquiry";

/**
 * AudienceNav — shared header for the institutions & corporates pages.
 * Same "chrome" as BlackNav (fixed, rounded-bottom black bar) but flat:
 * no hamburger / slide-out menu, just the logo + inline nav links + get in touch.
 */
const NAV_ITEMS = [
  { path: "/designers", label: "Designers" },
  { path: "/institutions", label: "Institutions" },
  { path: "/corporates", label: "Corporates" }
];

const AudienceNav = ({ audience = "institutions" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [modalOpen, setModalOpen] = useState(false);
  const inquiry = AUDIENCE_INQUIRY_CONFIG[audience];

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
                // Programme sub-pages (e.g. /for-institutes/...) don't match
                // any NAV_ITEMS path exactly, so fall back to the `audience`
                // prop the page was rendered with to decide what's active.
                const isActive =
                  location.pathname === item.path ||
                  item.path === AUDIENCE_INQUIRY_CONFIG[audience]?.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`transition-colors duration-200 hover:text-[#FFE470] text-[13px] md:text-[17px] ${
                      isActive
                        ? "text-evolve-yellow font-black "
                        : "text-[#BF9C05] font-regular letterspacing-[-3%]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={() => setModalOpen(true)}
                className="hidden md:inline text-[#BF9C05] font-medium text-[17px] hover:text-white transition-colors duration-200"
              >
                Get in Touch
              </button>
            </div>
          </div>
        </div>
      </div>

      <InstituteContactModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        programme={inquiry.programme}
        table={inquiry.table}
        orgLabel={inquiry.orgLabel}
        orgField={inquiry.orgField}
        whatsappUrl={inquiry.whatsappUrl}
        intent="contact"
      />
    </nav>
  );
};

export default AudienceNav;
