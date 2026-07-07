import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const EXEMPT_PATHS = ["/onboarding", "/admin"];

/**
 * Routes every signed-in user — brand-new or a pre-existing account that
 * predates this feature (their `onboarding_completed` defaults to false too)
 * — through /onboarding before they can reach the rest of the app.
 */
export default function OnboardingGate() {
  const { user, authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading || !user) return;
    if (user.onboarding_completed) return;
    if (EXEMPT_PATHS.some(p => location.pathname.startsWith(p))) return;

    navigate("/onboarding", { replace: true });
  }, [user, authLoading, location.pathname, navigate]);

  return null;
}
