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

const STEPS = [
  {
    q: "step 1: self-discovery & profile mapping",
    a: "students complete a guided self-assessment to understand their skills, interests, and working style."
  },
  {
    q: "step 2: understanding the industry",
    a: "learn how different design roles, companies, and work environments differ from product to agency, B2B to B2C, specialist to generalist."
  },
  {
    q: "step 3: finding the right niche",
    a: "industry mentors help students connect their strengths to suitable career paths and company types."
  },
  {
    q: "step 4: portfolio & career readiness",
    a: "students receive guidance on their resume, portfolio, and professional profile, with personalised feedback to prepare for applications."
  }
];

const GET_IN_TOUCH_URL =
  "https://wa.me/919227123007?text=Hi%2C%20I%27m%20interested%20in%20the%20Find%20Your%20Niche%20Programme";

const HANDBOOK_URL =
  "https://drive.google.com/uc?export=download&id=1pWk85g4nHB0-GhjhIZKuehmMqk31CJw7";

const FOR_STUDENTS = [
  "greater career clarity and confidence",
  "better understanding of roles and companies",
  "stronger portfolio and application direction"
];

const FOR_INSTITUTIONS = [
  "improved student career readiness",
  "industry-led mentorship and insights",
  "better visibility into student progress and aspirations"
];

const BuiltAroundSection = () => (
  <section
    className="w-full"
    style={{
      background: "linear-gradient(180deg, #161616 0%, #000000 100%)",
      padding: "clamp(64px,10vh,120px) clamp(24px,6vw,96px)"
    }}
  >
    <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-16">
      <h2
        className="font-extrabold text-evolve-yellow md:w-[40%]"
        style={{
          fontSize: "clamp(32px,3.6vw,48px)",
          lineHeight: 1.1,
          letterSpacing: "-0.02em"
        }}
      >
        built around
        <br />
        real industry
        <br /> experience
      </h2>
      <p
        className="text-white/90 md:flex-1"
        style={{ fontSize: "clamp(18px,1.8vw,20px)", lineHeight: 1.6 }}
      >
        every cohort is mentored by industry experts who actively hire, build
        products, and work with clients, not just teach design. through evolve's
        dedicated portal, every student receives a structured, personalised
        journey from self-discovery to career readiness.
      </p>
    </div>
  </section>
);

const MentorshipForInstitutions = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIntent, setModalIntent] = useState("contact");

  const openModal = (intent) => {
    setModalIntent(intent);
    setModalOpen(true);
  };

  return (
    <div className="w-full lowercase">
      <SEO
        title="Find Your Niche Programme — Mentorship for design institutions"
        description="A structured 4-day mentorship programme that helps students understand their strengths, identify the right design roles and companies, and build the clarity needed before internships and placements."
        path="/for-institutes/find-your-niche-programme"
      />
      <AudienceNav audience="institutions" />

      <ProgrammeHero
        heading="find your niche"
        subheading="helping students discover where they belong in design."
        description="a structured 4-day mentorship programme that helps students understand their strengths, identify the right design roles and companies, and build the clarity needed before internships, placements, and their first job."
        onGetInTouch={() => openModal("contact")}
        onDownloadHandbook={() => openModal("handbook")}
      />

      <ProgrammeOutcomes
        forStudents={FOR_STUDENTS}
        forInstitutions={FOR_INSTITUTIONS}
      />

      <BuiltAroundSection />

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
        description="help students discover the design path that's right for them before they begin applying for internships and placements."
      />

      <InstituteContactModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        programme="find-your-niche"
        whatsappUrl={GET_IN_TOUCH_URL}
        intent={modalIntent}
        handbookUrl={HANDBOOK_URL}
      />
    </div>
  );
};

export default MentorshipForInstitutions;
