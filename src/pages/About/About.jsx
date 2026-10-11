import SEO from "../../components/SEO";
import HeroSection from "./HeroSection";
import IntroSection from "./IntroSection";
import TeamSection from "./TeamSection";
import CollaboratorsSection from "./CollaboratorsSection";
import BuildersSection from "./BuildersSection";
import EvolveMarquee from "./EvolveMarquee";

const About = () => (
  <>
    <SEO
      title="About evolve — a design growth ecosystem"
      description="evolve brings designers together on one platform - creating a space to learn, connect, share, and grow."
      path="/about"
    />
    <main className="w-full overflow-x-hidden">
      <HeroSection />
      <IntroSection />
      <TeamSection />
      <CollaboratorsSection />
      <BuildersSection />
      <EvolveMarquee />
    </main>
  </>
);

export default About;
