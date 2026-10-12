import { useNavigate } from "react-router-dom";
import SEO from "../../components/SEO";
import { useAuth } from "../../hooks/useAuth";
import HeroSection from "./HeroSection";
import EcosystemSection from "./EcosystemSection";
import GuidanceSection from "./GuidanceSection";
import VideoTestimonialsSection from "./VideoTestimonialsSection";
import TextTestimonialsSection from "./TextTestimonialsSection";
import ClosingSection from "./ClosingSection";

const MainHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <>
      <SEO
        title="Evolve | Empowering designers to shape a better world"
        description="The all-in-one platform to learn, track and excel in your design journey."
        path="/"
      />
      <main className="w-full overflow-x-hidden">
        <HeroSection onStart={() => navigate(user ? "/app/profile" : "/signin")} />
        <EcosystemSection />
        <GuidanceSection />
        <VideoTestimonialsSection />
        <TextTestimonialsSection />
        <ClosingSection />
      </main>
    </>
  );
};

export default MainHome;
