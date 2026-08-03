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

// TODO: replace image / linkedinUrl / instagramUrl placeholders with the real links.
const REVIEWERS = [
  {
    name: "Yagnesh Ahir",
    years: "18",
    role: ["Founder & Design Director, Paperclip Design.", "Mentor, ADPList."],
    image:
      "https://res.cloudinary.com/diuswhkzn/image/upload/v1785740530/Yagnesh_Ahir_Profile_2025_2_ckdmsn.png",
    linkedinUrl: "https://www.linkedin.com/in/yagnesh-ahir-24676516/",
    instagramUrl: ""
  },
  {
    name: "Sakshi Patki",
    years: "3",
    role: [
      "Senior Creative Graphic Designer, Paperclip Design.",
      "Visual Lead, evolve."
    ],
    image:
      "https://res.cloudinary.com/diuswhkzn/image/upload/v1785740530/Group_1801288229_wt4r9u.png",
    linkedinUrl: "https://www.linkedin.com/in/sakshi-patki-97473b200/",
    instagramUrl: ""
  },
  {
    name: "Sonam Gandhi",
    years: "5",
    role: ["Product Designer, Paperclip Design.", "Mentor, evolve."],
    image:
      "https://res.cloudinary.com/diuswhkzn/image/upload/v1785740530/Group_1801288230_xsbbar.png",
    linkedinUrl: "https://www.linkedin.com/in/gandhisonam/",
    instagramUrl: ""
  },
  {
    name: "Paramdeep Singh Dayani",
    years: "8",
    role: [
      "Architect, Production Designer, Photographer.",
      "Founder: Antispace.in.",
      "Teaching Associate at CEPT University."
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
      "Fashion Designer, Founder, Button Masala.",
      "Visiting faculty at top design colleges."
    ],
    image:
      "https://res.cloudinary.com/diuswhkzn/image/upload/v1785740530/image_1_sopzy9.png",
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
            bring the programme
            <br />
            to your institution
          </>
        }
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
