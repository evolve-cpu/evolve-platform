import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Only the designer funnel (/designers) nudges an incomplete signup back
// into /onboarding — landing on "/" (the general hub — individuals,
// institutions, corporates) or any other audience's pages shouldn't force
// a designer-specific onboarding step on someone who may not even be here
// as a designer.
const TRIGGER_PATHS = ["/designers"];

/**
 * Routes a signed-in-but-not-yet-onboarded designer through /onboarding
 * when they land on the designer funnel — brand-new or a pre-existing
 * account that predates this feature (their `onboarding_completed`
 * defaults to false too).
 */
export default function OnboardingGate() {
  const { user, authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading || !user) return;
    if (user.onboarding_completed) return;
    if (!TRIGGER_PATHS.some(p => location.pathname.startsWith(p))) return;

    navigate("/onboarding", { replace: true });
  }, [user, authLoading, location.pathname, navigate]);

  return null;
}
