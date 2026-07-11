import { Link, useNavigate, useLocation } from "react-router-dom";
import { evolve_yellow_with_name, evolve_yellow_logo } from "../assets/images/Nav";

/**
 * AudienceNav — shared header for the institutions & corporates pages.
 * Same "chrome" as BlackNav (fixed, rounded-bottom black bar) but flat:
 * no hamburger / slide-out menu, just the logo + inline nav links + sign in.
 */
const NAV_ITEMS = [
  { path: "/designers", label: "designers" },
  { path: "/institutions", label: "institutions" },
  { path: "/corporates", label: "corporates" }
];

const AudienceNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div
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
            style={{ height: "56px", background: "rgba(22,22,22,1)" }}
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

            {/* nav links + sign in — right */}
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
              <Link
                to="/signin"
                className="hidden md:inline text-evolve-yellow font-medium text-[17px] hover:text-white transition-colors duration-200"
              >
                sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AudienceNav;
