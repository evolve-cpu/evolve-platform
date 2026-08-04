import { useState } from "react";
import SEO from "../components/SEO";
import AudienceNav from "../components/AudienceNav";
import AudienceFooter from "../components/AudienceFooter";
import InstituteContactModal from "../components/InstituteContactModal";
import {
  ProgrammeHero,
  ProgrammeOutcomes,
  ProgrammeReviewers,
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
  "Stronger, industry-ready portfolios",
  "Honest feedback from working professionals",
  "Clear direction before internships and placements",
  "Greater confidence for interviews and applications"
];

const FOR_INSTITUTIONS = [
  "Stronger placement readiness",
  "Industry insights into student progress",
  "A valuable extension to the curriculum",
  "A credible industry partnership"
];

// TODO: replace image / linkedinUrl / instagramUrl placeholders with the real links.
const REVIEWERS = [
  {
    name: "Yagnesh Ahir",
    years: "18",
    role: [
      "Founder & Design Director, Paperclip Design. Design Coach, by Stadium."
    ],
    image:
      "https://res.cloudinary.com/diuswhkzn/image/upload/v1785740530/Yagnesh_Ahir_Profile_2025_2_ckdmsn.png",
    linkedinUrl: "https://www.linkedin.com/in/yagnesh-ahir-24676516/",
    instagramUrl: ""
  },
  {
    name: "Sakshi Patki",
    years: "3",
    role: [
      "Senior Creative Graphic Designer, Paperclip Design. Visual Lead, evolve"
      // "Visual Lead, evolve."
    ],
    image:
      "https://res.cloudinary.com/diuswhkzn/image/upload/v1785832940/Frame_1801288229_ryj65z.png",
    linkedinUrl: "https://www.linkedin.com/in/sakshi-patki-97473b200/",
    instagramUrl: ""
  },
  {
    name: "Sonam Gandhi",
    years: "5",
    role: ["Product Designer", "Paperclip Design.", "Mentor, evolve"],
    mobileRole: ["Product Designer, Paperclip Design.", "Mentor, evolve"],
    image:
      "https://res.cloudinary.com/diuswhkzn/image/upload/v1785740530/Group_1801288230_xsbbar.png",
    linkedinUrl: "https://www.linkedin.com/in/gandhisonam/",
    instagramUrl: ""
  },
  {
    name: "Paramdeep Singh Dayani",
    years: "8",
    role: [
      "Architect, Production Designer. Founder: Antispace.in. Teaching Associate at CEPT"
    ],
    image:
      "https://res.cloudinary.com/diuswhkzn/image/upload/v1785740530/param_1_bgprl1.png",
    linkedinUrl: "",
    instagramUrl: "https://www.instagram.com/antispace.in"
  },
  {
    name: "Anuj Sharma",
    years: "25",
    role: [
      "Fashion Designer, Founder, Button Masala. Visiting faculty at top design colleges."
    ],
    image:
      "https://res.cloudinary.com/diuswhkzn/image/upload/v1785833013/Frame_1801288246_iykxnq.png",
    linkedinUrl: "https://www.linkedin.com/in/anuj-sharma-34005b11/",
    instagramUrl: "https://www.instagram.com/anujsharmanid/"
  }
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
    <div className="w-full">
      <SEO
        title="Portfolio Review Programme — Industry feedback for institutions"
        description="Industry-led portfolio reviews that help students build stronger portfolios for internships, placements, and opportunities with leading companies and design studios."
        path="/for-institutes/portfolio-review-programme"
      />
      <AudienceNav audience="institutions" />

      <ProgrammeHero
        heading={
          <>
            Portfolio review
            <br />
            programme
          </>
        }
        subheading="Industry feedback to build stronger portfolios."
        description="Industry-led portfolio reviews that help students build stronger portfolios for internships, placements, and opportunities with leading companies and design studios."
        onGetInTouch={() => openModal("contact", "hero")}
        onDownloadHandbook={() => openModal("handbook", "hero_handbook")}
      />

      <ProgrammeOutcomes
        forStudents={FOR_STUDENTS}
        forInstitutions={FOR_INSTITUTIONS}
      />

      <ProgrammeReviewers reviewers={REVIEWERS} />

      <ProgrammeHowItWorks steps={STEPS} />

      <AudienceFooter
        audience="institutions"
        heading={
          <>
            Bring the programme
            <br />
            to your institution
          </>
        }
        description="Help students gain the clarity, feedback, and direction they need before entering the industry."
      />

      <InstituteContactModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        programme="Portfolio Review"
        whatsappUrl={GET_IN_TOUCH_URL}
        intent={modalIntent}
        handbookUrl={HANDBOOK_URL}
        onTrack={(label) => trackPortfolioReviewCta(`modal_${label}`)}
      />
    </div>
  );
};

export default PortfolioReviewForInstitutions;
