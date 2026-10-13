import { useNavigate } from "react-router-dom";
import FeaturePage from "./FeaturePage";
import CtaButton from "../MainHome/CtaButton";
import { useAuth } from "../../hooks/useAuth";
import {
  competency_radar,
  skill_inventory,
  career_timeline
} from "../../assets/images/ecosystem";

const FEATURES = [
  {
    title: "Competency Radar",
    image: competency_radar,
    desc: "Visualise your strengths across design core, business literacy, and leadership."
  },
  {
    title: "Skill Inventory",
    image: skill_inventory,
    desc: "Highlight your tool proficiencies and domain specialties with concrete metrics."
  },
  {
    title: "Career Timeline",
    image: career_timeline,
    desc: "A chronological record of past work, client projects, and academic milestones."
  }
];

const ProfileCreation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <FeaturePage
      seo={{
        title: "Profile creation — your design career dashboard | evolve",
        description:
          "Map your design fundamentals, track skill development across core dimensions, and organize your work history into a visual, interactive timeline.",
        path: "/profile-creation"
      }}
      title="Your Personal Design Career Dashboard"
      intro="Map your design fundamentals, track skill development across core dimensions, and organize your work history into a visual, interactive timeline"
      features={FEATURES}
      action={
        <CtaButton onClick={() => navigate(user ? "/app/profile" : "/signin")}>
          Build Your Verified Profile
        </CtaButton>
      }
    />
  );
};

export default ProfileCreation;
