import { useState } from "react";
import SEO from "../components/SEO";
import AudienceNav from "../components/AudienceNav";
import AudienceFooter from "../components/AudienceFooter";
import InstituteContactModal from "../components/InstituteContactModal";
import {
  ProgrammeHero,
  ProgrammeOutcomes,
  ProgrammeHowItWorks
} from "../components/ProgrammeSections";
import { portfolioReview as COPY } from "../content";
import { trackPortfolioReviewCta } from "../utils/analytics";

const STEPS = COPY.howItWorks.steps;

const GET_IN_TOUCH_URL =
  "https://wa.me/919227123007?text=Hi%2C%20I%27m%20interested%20in%20the%20Portfolio%20Review%20Programme";

const HANDBOOK_URL =
  "https://drive.google.com/uc?export=download&id=1Yi9CQ28BJx3Q1Z1FhSt2quGgr1zXfCWW";

const FOR_STUDENTS = [
  "stronger, industry-ready portfolios",
  "honest feedback from working professionals",
  "clear direction before internships and placements",
  "greater confidence for interviews and applications"
];

const FOR_INSTITUTIONS = [
  "stronger placement readiness",
  "industry insights into student progress",
  "a valuable extension to the curriculum",
  "a credible industry partnership"
];

const PortfolioReviewForInstitutions = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIntent, setModalIntent] = useState("contact");

  const openModal = (intent, trackLabel) => {
    if (trackLabel) trackPortfolioReviewCta(trackLabel);
    setModalIntent(intent);
    setModalOpen(true);
  };

  return (
    <div className="w-full lowercase">
      <SEO
        title="Portfolio Review Programme — Industry feedback for institutions"
        description="Industry-led portfolio reviews that help students build stronger portfolios for internships, placements, and opportunities with leading companies and design studios."
        path="/for-institutes/portfolio-review-programme"
      />
      <AudienceNav audience="institutions" />

      <ProgrammeHero
        heading={
          <>
            portfolio review
            <br />
            programme
          </>
        }
        subheading="industry feedback to build stronger portfolios."
        description="industry-led portfolio reviews that help students build stronger portfolios for internships, placements, and opportunities with leading companies and design studios."
        onGetInTouch={() => openModal("contact", "hero")}
        onDownloadHandbook={() => openModal("handbook", "hero_handbook")}
      />

      <ProgrammeOutcomes forStudents={FOR_STUDENTS} forInstitutions={FOR_INSTITUTIONS} />

      <ProgrammeHowItWorks steps={STEPS} />

      <AudienceFooter
        audience="institutions"
        heading="bring the programme to your institution"
        description="help students gain the clarity, feedback, and direction they need before entering the industry."
      />

      <InstituteContactModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        programme="portfolio-review"
        whatsappUrl={GET_IN_TOUCH_URL}
        intent={modalIntent}
        handbookUrl={HANDBOOK_URL}
        onTrack={(label) => trackPortfolioReviewCta(`modal_${label}`)}
      />
    </div>
  );
};

export default PortfolioReviewForInstitutions;
