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

// import { useState, useRef } from "react";
// import SEO from "../components/SEO";
// import { portfolioReview as COPY } from "../content";
// import { renderWithBreaks } from "../utils/renderWithBreaks";
// import { trackPortfolioReviewCta } from "../utils/analytics";
// import {
//   right_eye_ribbon,
//   left_eye_ribbon,
//   right_eye_ribbon_mobile,
//   left_eye_ribbon_mobile,
//   mentorship_vector,
//   mentorship_vector_mobile,
//   how_button,
//   how_button_hover,
//   vector_portfolio,
//   vector_portfolio_mobile,
//   outcomes_portfolio,
//   outcomes_portfolio_mobile,
//   left_eye_ribbon_1,
//   right_eye_ribbon_1
// } from "../assets/images/Mentorship";
// import { rays_webinars, rays_webinars_mobile } from "../assets/images/Webinars";

// // Steps data lives in src/content.js
// const STEPS = COPY.howItWorks.steps;

// const GET_IN_TOUCH_URL =
//   "https://wa.me/919227123007?text=Hi%2C%20I%27m%20interested%20in%20the%20Portfolio%20Review%20Programme";

// /* ─────────────────────────────────────────────
//    PortfolioReviewForInstitutions
// ───────────────────────────────────────────── */
// const PortfolioReviewForInstitutions = () => {
//   const [howHover, setHowHover] = useState(false);
//   const howItWorksRef = useRef(null);

//   const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: "smooth" });

//   return (
//     <div>
//       <SEO
//         title="Portfolio Review Programme — Industry feedback for institutions"
//         description="Industry-led portfolio reviews that help students build stronger portfolios for internships, placements, and opportunities with leading companies and design studios."
//         path="/for-institutes/portfolio-review-programme"
//       />

//       {/* ================= SECTION 1 — HERO (Desktop) ================= */}
//       <section className="hidden md:flex relative min-h-[110vh] bg-evolve-yellow overflow-hidden flex-col items-center">
//         {/* Rays background — lowest layer */}
//         <img
//           src={rays_webinars}
//           alt=""
//           className="absolute inset-0 w-full h-full object-cover pointer-events-none"
//           style={{ zIndex: 0 }}
//         />

//         {/* Content — above everything */}
//         <div
//           className="relative flex flex-col items-center text-center"
//           style={{
//             zIndex: 30,
//             paddingTop: "clamp(64px, 16vh, 120px)",
//             paddingLeft: "clamp(32px, 6vw, 120px)",
//             paddingRight: "clamp(32px, 6vw, 120px)"
//           }}
//         >
//           {/* Heading */}
//           <h1
//             className="font-extrabold lowercase text-evolve-pink"
//             style={{
//               fontSize: "clamp(56px, 7vw, 96px)",
//               lineHeight: "0.9",
//               letterSpacing: "-0.03em"
//             }}
//           >
//             portfolio review
//             <br />
//             programme
//           </h1>

//           {/* Body text */}
//           <p
//             className="font-normal lowercase text-black mt-6"
//             style={{
//               fontSize: "clamp(18px, 2.2vw, 32px)",
//               lineHeight: "1.45",
//               letterSpacing: "-0.3px",
//               maxWidth: "60vw"
//             }}
//           >
//             industry feedback for stronger portfolios.
//           </p>

//           {/* CTA */}
//           <div className="mt-8 flex flex-col items-center gap-4">
//             <a
//               href={GET_IN_TOUCH_URL}
//               target="_blank"
//               rel="noopener noreferrer"
//               onClick={() => trackPortfolioReviewCta("hero_desktop")}
//               className="font-extrabold lowercase flex items-center gap-3 px-7 py-4 rounded-2xl transition-opacity duration-150 hover:opacity-90"
//               style={{
//                 backgroundColor: "#000",
//                 color: "var(--color-evolve-yellow, #FFD007)",
//                 border: "2px solid var(--color-evolve-yellow, #FFD007)",
//                 boxShadow: "4px 4px 0 0 #BF9C05",
//                 fontSize: "clamp(16px, 1.4vw, 22px)"
//               }}
//             >
//               <span>get in touch</span>
//               <span style={{ fontSize: "1.1em" }}>→</span>
//             </a>
//             <a
//               href="#"
//               className="font-bold lowercase text-black"
//               style={{
//                 fontSize: "clamp(16px, 1.4vw, 22px)",
//                 textDecoration: "underline",
//                 textDecorationColor: "#000",
//                 textDecorationThickness: "2px"
//               }}
//             >
//               download handbook
//             </a>
//           </div>
//         </div>

//         {/* vector_portfolio — above rays, below ribbons */}
//         <img
//           src={vector_portfolio}
//           alt=""
//           className="absolute bottom-[-15%] left-[-0.8%] w-full pointer-events-none"
//           style={{ zIndex: 5 }}
//         />

//         {/* Ribbons — bottom corners */}
//         <img
//           src={right_eye_ribbon_1}
//           alt=""
//           className="absolute bottom-[-12%] right-0 w-[50%]"
//           style={{ zIndex: 10 }}
//         />
//         <img
//           src={left_eye_ribbon_1}
//           alt=""
//           className="absolute bottom-[-12%] -left-[0.65rem] w-[50%]"
//           style={{ zIndex: 20 }}
//         />
//       </section>

//       {/* ================= SECTION 1 — HERO (Mobile) ================= */}
//       <section className="flex md:hidden relative bg-evolve-yellow overflow-hidden min-h-screen flex-col">
//         {/* Rays background — lowest layer */}
//         <img
//           src={rays_webinars_mobile}
//           alt=""
//           className="absolute inset-0 w-full h-full object-cover pointer-events-none"
//           style={{ zIndex: 0 }}
//         />

//         {/* Content — above everything */}
//         <div
//           className="relative flex flex-col items-center text-center px-5"
//           style={{
//             zIndex: 30,
//             paddingTop: "clamp(64px, 14vh, 100px)"
//           }}
//         >
//           {/* Heading */}
//           <h1
//             className="font-extrabold lowercase text-evolve-pink"
//             style={{
//               fontSize: "clamp(36px, 10vw, 52px)",
//               lineHeight: "1.05",
//               letterSpacing: "-0.03em"
//             }}
//           >
//             portfolio review programme
//           </h1>

//           {/* Body text */}
//           <p
//             className="font-normal lowercase text-black mt-4"
//             style={{
//               fontSize: "clamp(16px, 4.5vw, 22px)",
//               lineHeight: "1.5",
//               letterSpacing: "-0.2px",
//               maxWidth: "86vw"
//             }}
//           >
//             industry feedback for stronger portfolios.
//           </p>

//           {/* CTA */}
//           <div className="mt-6 flex flex-col items-center gap-4">
//             <a
//               href={GET_IN_TOUCH_URL}
//               target="_blank"
//               rel="noopener noreferrer"
//               onClick={() => trackPortfolioReviewCta("hero_mobile")}
//               className="font-extrabold lowercase flex items-center gap-3 px-7 py-4 rounded-2xl transition-opacity active:opacity-70"
//               style={{
//                 backgroundColor: "#000",
//                 color: "var(--color-evolve-yellow, #FFD007)",
//                 border: "2px solid var(--color-evolve-yellow, #FFD007)",
//                 boxShadow: "4px 4px 0 0 #BF9C05",
//                 fontSize: "18px"
//               }}
//             >
//               <span>get in touch</span>
//               <span style={{ fontSize: "1.1em" }}>→</span>
//             </a>
//             <a
//               href="#"
//               className="font-bold lowercase text-black"
//               style={{
//                 fontSize: "18px",
//                 textDecoration: "underline",
//                 textDecorationColor: "#000",
//                 textDecorationThickness: "2px"
//               }}
//             >
//               download handbook
//             </a>
//           </div>
//         </div>

//         {/* vector_portfolio_mobile — above rays, below ribbons */}
//         <img
//           src={vector_portfolio_mobile}
//           alt=""
//           className="absolute bottom-[0] left-0 w-full pointer-events-none"
//           style={{ zIndex: 5 }}
//         />

//         {/* Ribbons — bottom corners, mobile variants */}
//         <img
//           src={right_eye_ribbon_mobile}
//           alt=""
//           className="absolute bottom-0 right-0 w-full"
//           style={{ zIndex: 20 }}
//         />
//         <img
//           src={left_eye_ribbon_mobile}
//           alt=""
//           className="absolute bottom-0 left-0 w-auto"
//           style={{ zIndex: 10 }}
//         />
//       </section>

//       {/* ================= SECTION 2 — CTA (like mentorship section 2) ================= */}
//       <section className="relative min-h-screen bg-evolve-yellow overflow-hidden">
//         <div
//           className="absolute inset-x-0 z-30 flex flex-col items-center text-center px-6"
//           style={{ top: "20%" }}
//         >
//           <p
//             className="text-black font-normal lowercase"
//             style={{
//               fontSize: "clamp(22px, 3.2vw, 48px)",
//               lineHeight: "1.35",
//               maxWidth: "75%"
//             }}
//           >
//             industry-led portfolio reviews that help students build stronger
//             portfolios for internships, placements, and opportunities with
//             leading companies and design studios.
//           </p>
//           <div className="flex flex-col items-center mt-10 gap-6">
//             <img
//               src={howHover ? how_button_hover : how_button}
//               alt="see how it works"
//               onMouseEnter={() => setHowHover(true)}
//               onMouseLeave={() => setHowHover(false)}
//               onClick={() => scrollTo(howItWorksRef)}
//               className="cursor-pointer transition-opacity duration-150"
//               style={{ width: "clamp(180px, 22vw, 220px)" }}
//             />
//           </div>
//         </div>
//       </section>

//       {/* ================= SECTION 3 — OUTCOMES ================= */}
//       <div className="hidden md:block w-full">
//         <img
//           src={outcomes_portfolio}
//           alt="programme outcomes"
//           className="w-full h-auto block"
//         />
//       </div>
//       <div className="block md:hidden w-full">
//         <img
//           src={outcomes_portfolio_mobile}
//           alt="programme outcomes"
//           className="w-full h-auto block"
//         />
//       </div>

//       {/* scroll anchor for how it works */}
//       <div ref={howItWorksRef} />

//       {/* ================= SECTION 4 — HOW IT WORKS (Desktop) ================= */}
//       <section className="hidden md:flex bg-evolve-yellow min-h-screen">
//         {/* Left 35% — heading */}
//         <div
//           className="flex-shrink-0 flex flex-col"
//           style={{
//             width: "35%",
//             paddingTop: "clamp(80px, 10vh, 140px)",
//             paddingLeft: "clamp(40px, 5vw, 80px)",
//             paddingRight: "clamp(24px, 2vw, 40px)"
//           }}
//         >
//           <h2
//             className="font-extrabold lowercase text-black"
//             style={{
//               fontSize: "clamp(64px, 7vw, 96px)",
//               lineHeight: "1.05",
//               letterSpacing: "-0.53px"
//             }}
//           >
//             {renderWithBreaks(COPY.howItWorks.heading)}
//           </h2>
//         </div>

//         {/* Right 65% — steps */}
//         <div
//           className="flex-1 flex items-center"
//           style={{
//             paddingRight: "clamp(40px, 5vw, 80px)",
//             paddingTop: "clamp(48px, 6vh, 80px)",
//             paddingBottom: "clamp(48px, 6vh, 80px)"
//           }}
//         >
//           <div className="w-full">
//             {STEPS.map((item, i) => (
//               <div key={i}>
//                 <div
//                   className="flex items-start justify-between"
//                   style={{
//                     paddingTop: "clamp(20px, 4vh, 32px)",
//                     paddingBottom: "clamp(12px, 2vh, 20px)"
//                   }}
//                 >
//                   <span
//                     className="font-semibold lowercase text-black"
//                     style={{
//                       fontSize: "34px",
//                       letterSpacing: "-0.02em",
//                       lineHeight: "1.2"
//                     }}
//                   >
//                     {item.q}
//                   </span>
//                 </div>

//                 <p
//                   className="font-normal lowercase text-black"
//                   style={{
//                     fontSize: "29px",
//                     lineHeight: "1.4",
//                     letterSpacing: "-0.02em",
//                     paddingBottom: "clamp(20px, 2.5vh, 32px)",
//                     whiteSpace: "pre-line"
//                   }}
//                 >
//                   {item.a}
//                 </p>

//                 {i !== STEPS.length - 1 && (
//                   <div
//                     style={{
//                       height: "1px",
//                       backgroundColor: "#000000",
//                       width: "100%"
//                     }}
//                   />
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ================= SECTION 4 — HOW IT WORKS (Mobile) ================= */}
//       <section
//         className="block md:hidden bg-evolve-yellow"
//         style={{
//           padding: "clamp(40px, 10vw, 64px) 20px clamp(48px, 10vw, 72px)"
//         }}
//       >
//         <h2
//           className="font-extrabold lowercase text-black"
//           style={{
//             fontSize: "clamp(40px, 12vw, 56px)",
//             lineHeight: "1.05",
//             letterSpacing: "-0.53px",
//             marginBottom: "clamp(28px, 7vw, 40px)"
//           }}
//         >
//           how it
//           <br />
//           works.
//         </h2>
//         <div className="w-full">
//           {STEPS.map((item, i) => (
//             <div key={i}>
//               <div
//                 className="flex items-start justify-between"
//                 style={{ paddingTop: "20px", paddingBottom: "10px" }}
//               >
//                 <span
//                   className="font-semibold lowercase text-black"
//                   style={{
//                     fontSize: "clamp(17px, 5vw, 22px)",
//                     letterSpacing: "-0.02em",
//                     lineHeight: "1.2"
//                   }}
//                 >
//                   {item.q}
//                 </span>
//               </div>

//               <p
//                 className="font-normal lowercase text-black"
//                 style={{
//                   fontSize: "clamp(15px, 4.5vw, 19px)",
//                   lineHeight: "1.4",
//                   letterSpacing: "-0.02em",
//                   paddingBottom: "20px",
//                   whiteSpace: "pre-line"
//                 }}
//               >
//                 {item.a}
//               </p>

//               {i !== STEPS.length - 1 && (
//                 <div
//                   style={{
//                     height: "1px",
//                     backgroundColor: "#000000",
//                     width: "100%"
//                   }}
//                 />
//               )}
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* ================= SECTION 5 — BRING THE PROGRAMME (Desktop) ================= */}
//       <section className="hidden md:flex relative bg-evolve-lavender-indigo overflow-hidden flex-col items-center justify-center min-h-screen">
//         <div
//           className="relative z-10 flex flex-col items-center text-center max-w-[50%] px-8"
//           style={{ paddingBottom: "clamp(120px, 18vh, 200px)" }}
//         >
//           {/* Heading */}
//           <h2
//             className="font-extrabold lowercase text-evolve-yellow"
//             style={{
//               fontSize: "clamp(56px, 4.8vw, 96px)",
//               lineHeight: "1",
//               letterSpacing: "-0.03em"
//             }}
//           >
//             bring the programme
//             <br />
//             to your institution
//           </h2>

//           {/* Body */}
//           <p
//             className="font-normal lowercase text-white"
//             style={{
//               fontSize: "clamp(20px, 2vw, 32px)",
//               lineHeight: "1.2",
//               marginTop: "clamp(24px, 3vh, 40px)",
//               maxWidth: "60ch"
//             }}
//           >
//             help students gain the clarity, feedback, and direction they need
//             before entering the industry.
//           </p>

//           {/* CTA Button */}
//           <div className="mt-8">
//             <a
//               href={GET_IN_TOUCH_URL}
//               target="_blank"
//               rel="noopener noreferrer"
//               onClick={() => trackPortfolioReviewCta("closing_desktop")}
//               className="font-extrabold lowercase flex items-center gap-3 px-7 py-4 rounded-2xl transition-opacity duration-150 hover:opacity-90"
//               style={{
//                 backgroundColor: "#000",
//                 color: "var(--color-evolve-yellow, #FFD007)",
//                 border: "2px solid var(--color-evolve-yellow, #FFD007)",
//                 boxShadow: "4px 4px 0 0 #BF9C05",
//                 fontSize: "clamp(16px, 1.4vw, 22px)"
//               }}
//             >
//               <span>get in touch</span>
//               <span style={{ fontSize: "1.1em" }}>→</span>
//             </a>
//           </div>
//         </div>

//         {/* Bottom vector — full width */}
//         <img
//           src={mentorship_vector}
//           alt=""
//           className="absolute -bottom-[3rem] left-0 w-full z-0 block"
//         />
//       </section>

//       {/* ================= SECTION 5 — BRING THE PROGRAMME (Mobile) ================= */}
//       <section className="flex md:hidden relative bg-evolve-lavender-indigo overflow-hidden min-h-screen flex-col items-center justify-center">
//         <div
//           className="relative z-10 flex flex-col items-center text-center px-5"
//           style={{ paddingBottom: "clamp(100px, 32vw, 160px)" }}
//         >
//           {/* Heading */}
//           <h2
//             className="font-extrabold lowercase text-evolve-yellow"
//             style={{
//               fontSize: "clamp(36px, 8vw, 52px)",
//               lineHeight: "1.05",
//               letterSpacing: "-0.03em"
//             }}
//           >
//             bring the programme
//             <br />
//             to your institution
//           </h2>

//           {/* Body */}
//           <p
//             className="font-normal lowercase text-white"
//             style={{
//               fontSize: "clamp(16px, 4.5vw, 22px)",
//               lineHeight: "1.4",
//               marginTop: "clamp(16px, 5vw, 28px)",
//               maxWidth: "36ch"
//             }}
//           >
//             help students gain the clarity, feedback, and direction they need
//             before entering the industry.
//           </p>

//           {/* CTA Button */}
//           <div className="mt-6">
//             <a
//               href={GET_IN_TOUCH_URL}
//               target="_blank"
//               rel="noopener noreferrer"
//               onClick={() => trackPortfolioReviewCta("closing_mobile")}
//               className="font-extrabold lowercase flex items-center gap-3 px-7 py-4 rounded-2xl transition-opacity active:opacity-70"
//               style={{
//                 backgroundColor: "#000",
//                 color: "var(--color-evolve-yellow, #FFD007)",
//                 border: "2px solid var(--color-evolve-yellow, #FFD007)",
//                 boxShadow: "4px 4px 0 0 #BF9C05",
//                 fontSize: "18px"
//               }}
//             >
//               <span>get in touch</span>
//               <span style={{ fontSize: "1.1em" }}>→</span>
//             </a>
//           </div>
//         </div>

//         {/* Bottom vector — full width */}
//         <img
//           src={mentorship_vector_mobile}
//           alt=""
//           className="absolute bottom-0 left-0 w-full z-0 block"
//         />
//       </section>
//     </div>
//   );
// };

// export default PortfolioReviewForInstitutions;
