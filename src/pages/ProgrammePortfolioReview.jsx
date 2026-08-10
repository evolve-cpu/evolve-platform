import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import PortfolioReviewProgramme from "../components/programmes/PortfolioReviewProgramme";

/**
 * Standalone route for the Portfolio Review programme — reached by anyone
 * arriving from a direct/shared link. The dashboard reaches the same
 * content a different way: PortfolioReviewProgramme dropped straight into
 * the profile page's own layout, sidebar and all, via `activeProgramme` in
 * PublicProfile — see that file's "explore programme" handling.
 */
export default function ProgrammePortfolioReview() {
  const { user, authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/signin", { state: { from: "/programmes/portfolio-review" } });
    }
  }, [authLoading, user, navigate]);

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#161618" }}>
      <div
        className="sticky top-0 z-40 flex items-center justify-between px-6 md:px-8 py-4 border-b border-white/10"
        style={{ backgroundColor: "#161618" }}
      >
        <Link
          to={`/profile/${user.username}`}
          className="flex items-center gap-1.5 text-evolve-yellow text-sm font-semibold"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="#FFD007" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          back to profile
        </Link>
        <span className="text-white font-extrabold text-sm">
          evolve<span className="text-evolve-lavender-indigo">.</span>
        </span>
      </div>

      <div className="max-w-3xl mx-auto px-6 md:px-8 py-10">
        <PortfolioReviewProgramme user={user} />
      </div>
    </div>
  );
}
