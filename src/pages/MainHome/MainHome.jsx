import { useNavigate } from "react-router-dom";
import SEO from "../../components/SEO";
import { useAuth } from "../../hooks/useAuth";
import HeroSection from "./HeroSection";
import EcosystemSection from "./EcosystemSection";
import GuidanceSection from "./GuidanceSection";
import VideoTestimonialsSection from "./VideoTestimonialsSection";
import TextTestimonialsSection from "./TextTestimonialsSection";
import ClosingSection from "./ClosingSection";
import { trackSignupCta } from "../../lib/platformAnalytics";

const MainHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const handleStart = (location) => {
    if (!user) trackSignupCta("start_for_free", location);
    navigate(user ? "/app/profile" : "/signin");
  };

  return (
    <>
      <SEO
        title="Evolve | Empowering designers to shape a better world"
        description="The all-in-one platform to learn, track and excel in your design journey."
        path="/"
      />
      <main className="w-full overflow-x-hidden">
        <HeroSection onStart={() => handleStart("home_hero")} />
        <EcosystemSection />
        <GuidanceSection />
        <VideoTestimonialsSection />
        <TextTestimonialsSection />
        <ClosingSection onStart={() => handleStart("home_closing")} />
      </main>
    </>
  );
};

export default MainHome;
