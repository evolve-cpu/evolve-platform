import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SEO from "../components/SEO";
import AudienceNav from "../components/AudienceNav";
import AudienceFooter from "../components/AudienceFooter";
import InstituteContactModal from "../components/InstituteContactModal";
import { AUDIENCE_INQUIRY_CONFIG } from "../lib/audienceInquiry";
import { preventWidow } from "../utils/preventWidow";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../supabaseClient";
import {
  arrow_yellow,
  download_icon,
  right_arrow_icon
} from "../assets/images/Nav";

const INQUIRY = AUDIENCE_INQUIRY_CONFIG.institutions;

const HANDBOOK_URL =
  "https://drive.google.com/uc?export=download&id=1VSgeQz4t6VpeY6HIRZ6JhByeZa078t9m";

const OFFERINGS = [
  {
    title: "Portfolio review programme",
    subtitle: "Industry feedback to build stronger portfolios.",
    body: "A structured review delivered by industry professional.  every student gets a comprehensive report, a live on-campus or online session once they've refined their work.",
    path: "/for-institutes/portfolio-review-programme"
  },
  {
    title: "Find your niche",
    subtitle: "Helping students discover where they belong in design.",
    body: 'A 4-day mentorship programme delivered by industry professionals, taking students from "who am i as a designer" to "where do i actually fit" ending with a portfolio and presence that reflects that clarity.',
    path: "/for-institutes/find-your-niche-programme"
  }
];

const ArrowButton = () => (
  <div
    className="flex items-center justify-center rounded-full bg-evolve-black flex-shrink-0"
    style={{
      width: "clamp(40px,3.2vw,52px)",
      height: "clamp(40px,3.2vw,52px)"
    }}
  >
    <img
      src={arrow_yellow}
      alt=""
      style={{ width: "clamp(16px,1.3vw,20px)", height: "auto" }}
    />
  </div>
);

const OfferingCard = ({ card }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(card.path)}
      className="group relative text-left flex-1 flex flex-col md:justify-end rounded-[24px] border border-black/10 hover:border-black/20 transition-colors duration-200 md:min-h-[440px]"
      style={{
        background: "rgba(255,229,110,1)",
        padding: "clamp(28px,3.2vw,44px)"
      }}
    >
      <div className="absolute top-5 right-5 md:top-6 md:right-6 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1">
        <ArrowButton />
      </div>

      <h3
        className="font-extrabold text-evolve-black pr-14"
        style={{ fontSize: "clamp(20px,1.7vw,27px)", lineHeight: 1.15 }}
      >
        {preventWidow(card.title)}
      </h3>
      <p
        className="font-semibold text-evolve-black mt-2 pr-14"
        style={{ fontSize: "clamp(14px,1.1vw,16px)" }}
      >
        {preventWidow(card.subtitle)}
      </p>
      <p
        className="text-evolve-black mt-4"
        style={{ fontSize: "clamp(13px,1vw,15px)", lineHeight: 1.55 }}
      >
        {preventWidow(card.body)}
      </p>
    </button>
  );
};

export default function Institutions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIntent, setModalIntent] = useState("contact");
  const [mySpaceSlug, setMySpaceSlug] = useState(null);

  useEffect(() => {
    if (!user) {
      setMySpaceSlug(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("organization_members")
        .select("organizations:org_id(slug, deleted_at)")
        .eq("user_id", user.id)
        .eq("status", "active");
      const firstActive = (data || []).find(
        (r) => r.organizations && !r.organizations.deleted_at
      );
      if (!cancelled) setMySpaceSlug(firstActive?.organizations?.slug || null);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const openModal = (intent) => {
    setModalIntent(intent);
    setModalOpen(true);
  };

  return (
    <div className="w-full">
      <SEO
        title="evolve for institutions — get your students industry ready"
        description="evolve for institutions gives design colleges and coaching institutes practitioner-led programmes — portfolio reviews and niche-finding mentorship — delivered on your own branded portal."
        path="/institutions"
      />
      <AudienceNav audience="institutions" />

      {/* ── Hero — full screen ── */}
      <section
        className="w-full flex flex-col"
        style={{
          minHeight: "100vh",
          background: "linear-gradient(180deg, #161616 0%, #000000 100%)",
          padding:
            "clamp(96px,16vh,150px) clamp(24px,6vw,96px) clamp(48px,7vh,88px)"
        }}
      >
        <div className="flex-1 flex flex-col md:flex-row md:items-stretch gap-10 md:gap-10">
          {/* left — heading, pinned toward the top */}
          <div className="md:self-start md:mt-[6vh]">
            <p
              className="text-white mt-4"
              style={{ fontSize: "clamp(24px,1.6vw,24px)" }}
            >
              Evolve for institutions
            </p>
            <h1
              className="font-extrabold text-evolve-yellow"
              style={{
                fontSize: "clamp(56px,5.5vw,68px)",
                lineHeight: 1.05,
                letterSpacing: "-0.02em"
              }}
            >
              Design students,
              <br /> made industry-ready
            </h1>
          </div>

          {/* right — bigger paragraph text + button, anchored to the bottom */}
          <div className="md:flex-1 md:flex md:flex-col md:justify-end md:items-start md:max-w-[520px] md:ml-auto md:mb-[6vh]">
            <p
              className="text-white/90"
              style={{ fontSize: "clamp(18px,1.4vw,22px)", lineHeight: 1.5 }}
            >
              {preventWidow(
                "Recruiters don't reject your design students for lack of skill. they reject unclear portfolios, wrong role targeting, and weak presentation."
              )}
            </p>
            <p
              className="text-white/90 mt-6"
              style={{ fontSize: "clamp(18px,1.4vw,22px)", lineHeight: 1.5 }}
            >
              {preventWidow(
                "Evolve fixes exactly that. industry professional led programmes which run on your own branded portal."
              )}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={() => openModal("contact")}
                className="inline-flex items-center justify-center gap-2 bg-evolve-yellow text-evolve-black font-extrabold px-7 py-3.5 text-[16px] hover:opacity-90 transition-opacity w-fit"
                style={{ borderRadius: 16, boxShadow: "4px 4px 0 0 #806804" }}
              >
                Get in touch{" "}
                <span>
                  <img src={right_arrow_icon} alt="" className="w-6 h-6" />
                </span>
              </button>
              <button
                onClick={() =>
                  mySpaceSlug
                    ? navigate(`/space/${mySpaceSlug}`)
                    : navigate("/onboarding", {
                        state: { fromInstitution: true }
                      })
                }
                className="inline-flex items-center justify-center gap-2 border border-evolve-yellow/70 text-evolve-yellow font-extrabold px-7 py-3.5 text-[16px] hover:bg-evolve-yellow/10 transition-colors w-fit"
                style={{ borderRadius: 16 }}
              >
                {mySpaceSlug
                  ? "Go to my space"
                  : user
                    ? "Set up your space"
                    : "Sign in & set up your space"}
              </button>
            </div>
            {/* <button
              onClick={() =>
                window.open(
                  "https://calendly.com/chesna-paperclip/new-meeting",
                  "_blank"
                )
              }
              className="mt-8 inline-flex items-center justify-center gap-2 bg-evolve-yellow text-evolve-black font-extrabold px-7 py-3.5 text-[16px] hover:opacity-90 transition-opacity w-fit"
              style={{ borderRadius: 16, boxShadow: "4px 4px 0 0 #806804" }}
            >
              book a 30-min call{" "}
              <span>
                <img src={right_arrow_icon} alt="" className="w-6 h-6" />
              </span>
            </button> */}
          </div>
        </div>
      </section>

      {/* ── Stat callout ── */}
      <section
        className="w-full flex flex-col items-start md:items-center justify-center"
        style={{
          background: "#161616",
          minHeight: "20vh",
          padding: "clamp(56px,10vh,96px) clamp(24px,6vw,96px)"
        }}
      >
        <h2
          className="font-extrabold text-evolve-yellow text-left md:text-center md:max-w-[680px]"
          style={{
            fontSize: "clamp(32px,3.4vw,44px)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em"
          }}
        >
          {/* 48% of grads feel unprepared
          <br className="hidden md:block" /> to apply for entry-level positions */}
          48% of grads feel unprepared to apply for entry-level positions
        </h2>
        <p
          className="text-white text-left md:text-center mt-6 md:max-w-[980px]"
          style={{ fontSize: "clamp(16px,1.2vw,19px)" }}
        >
          Cengage 2025 graduate employability report
        </p>
      </section>

      {/* ── Our offerings — full screen ── */}
      <section
        className="w-full bg-evolve-yellow flex flex-col justify-center"
        style={{
          minHeight: "100vh",
          padding:
            "clamp(48px,7vh,80px) clamp(24px,6vw,96px) clamp(56px,8vh,96px)"
        }}
      >
        <h2
          className="font-extrabold text-evolve-black"
          style={{ fontSize: "clamp(32px,3.4vw,44px)" }}
        >
          Our offerings
        </h2>
        <p
          className="text-evolve-black mt-3"
          style={{ fontSize: "clamp(16px,1.2vw,19px)" }}
        >
          Custom space for your institute &nbsp;•&nbsp; Personalised journey for
          your students &nbsp;•&nbsp;{" "}
          {preventWidow("100% delivered by industry professionals")}
        </p>

        <div className="mt-10 flex flex-col md:flex-row gap-6">
          {OFFERINGS.map((card) => (
            <OfferingCard key={card.path} card={card} />
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <button
            onClick={() => openModal("handbook")}
            className="inline-flex items-center justify-center gap-2 bg-evolve-black text-evolve-yellow font-extrabold px-7 py-3.5 text-[16px] hover:opacity-90 transition-opacity"
            style={{
              borderRadius: 16,
              border: "1px solid rgba(255,208,7,1)",
              boxShadow: "4px 4px 0 0 #806804"
            }}
          >
            Download handbook
            <img src={download_icon} alt="" className="w-5 h-5" />
          </button>
        </div>
      </section>

      <AudienceFooter audience="institutions" />

      <InstituteContactModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        programme={INQUIRY.programme}
        table={INQUIRY.table}
        orgLabel={INQUIRY.orgLabel}
        orgField={INQUIRY.orgField}
        whatsappUrl={INQUIRY.whatsappUrl}
        intent={modalIntent}
        handbookUrl={HANDBOOK_URL}
      />
    </div>
  );
}

// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import SEO from "../components/SEO";
// import AudienceNav from "../components/AudienceNav";
// import AudienceFooter from "../components/AudienceFooter";
// import InstituteContactModal from "../components/InstituteContactModal";
// import { AUDIENCE_INQUIRY_CONFIG } from "../lib/audienceInquiry";
// import { preventWidow } from "../utils/preventWidow";
// import {
//   arrow_yellow,
//   download_icon,
//   right_arrow_icon
// } from "../assets/images/Nav";

// const INQUIRY = AUDIENCE_INQUIRY_CONFIG.institutions;

// const HANDBOOK_URL =
//   "https://drive.google.com/uc?export=download&id=1VSgeQz4t6VpeY6HIRZ6JhByeZa078t9m";

// const OFFERINGS = [
//   {
//     title: "Portfolio review programme",
//     subtitle: "Industry feedback to build stronger portfolios.",
//     body: "A structured review delivered by industry professional.  every student gets a comprehensive report, a live on-campus or online session once they've refined their work.",
//     path: "/for-institutes/portfolio-review-programme"
//   },
//   {
//     title: "Find your niche",
//     subtitle: "Helping students discover where they belong in design.",
//     body: 'A 4-day mentorship programme delivered by industry professionals, taking students from "who am i as a designer" to "where do i actually fit" ending with a portfolio and presence that reflects that clarity.',
//     path: "/for-institutes/find-your-niche-programme"
//   }
// ];

// const ArrowButton = () => (
//   <div
//     className="flex items-center justify-center rounded-full bg-evolve-black flex-shrink-0"
//     style={{
//       width: "clamp(40px,3.2vw,52px)",
//       height: "clamp(40px,3.2vw,52px)"
//     }}
//   >
//     <img
//       src={arrow_yellow}
//       alt=""
//       style={{ width: "clamp(16px,1.3vw,20px)", height: "auto" }}
//     />
//   </div>
// );

// const OfferingCard = ({ card }) => {
//   const navigate = useNavigate();
//   return (
//     <button
//       onClick={() => navigate(card.path)}
//       className="group relative text-left flex-1 flex flex-col md:justify-end rounded-[24px] border border-black/10 hover:border-black/20 transition-colors duration-200 md:min-h-[440px]"
//       style={{
//         background: "rgba(255,229,110,1)",
//         padding: "clamp(28px,3.2vw,44px)"
//       }}
//     >
//       <div className="absolute top-5 right-5 md:top-6 md:right-6 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1">
//         <ArrowButton />
//       </div>

//       <h3
//         className="font-extrabold text-evolve-black pr-14"
//         style={{ fontSize: "clamp(20px,1.7vw,27px)", lineHeight: 1.15 }}
//       >
//         {preventWidow(card.title)}
//       </h3>
//       <p
//         className="font-semibold text-evolve-black mt-2 pr-14"
//         style={{ fontSize: "clamp(14px,1.1vw,16px)" }}
//       >
//         {preventWidow(card.subtitle)}
//       </p>
//       <p
//         className="text-evolve-black mt-4"
//         style={{ fontSize: "clamp(13px,1vw,15px)", lineHeight: 1.55 }}
//       >
//         {preventWidow(card.body)}
//       </p>
//     </button>
//   );
// };

// export default function Institutions() {
//   const navigate = useNavigate();
//   const [modalOpen, setModalOpen] = useState(false);
//   const [modalIntent, setModalIntent] = useState("contact");

//   const openModal = (intent) => {
//     setModalIntent(intent);
//     setModalOpen(true);
//   };

//   return (
//     <div className="w-full">
//       <SEO
//         title="evolve for institutions — get your students industry ready"
//         description="evolve for institutions gives design colleges and coaching institutes practitioner-led programmes — portfolio reviews and niche-finding mentorship — delivered on your own branded portal."
//         path="/institutions"
//       />
//       <AudienceNav audience="institutions" />

//       {/* ── Hero — full screen ── */}
//       <section
//         className="w-full flex flex-col"
//         style={{
//           minHeight: "100vh",
//           background: "linear-gradient(180deg, #161616 0%, #000000 100%)",
//           padding:
//             "clamp(96px,16vh,150px) clamp(24px,6vw,96px) clamp(48px,7vh,88px)"
//         }}
//       >
//         <div className="flex-1 flex flex-col md:flex-row md:items-stretch gap-10 md:gap-10">
//           {/* left — heading, pinned toward the top */}
//           <div className="md:self-start md:mt-[6vh]">
//             <p
//               className="text-white mt-4"
//               style={{ fontSize: "clamp(24px,1.6vw,24px)" }}
//             >
//               Evolve for institutions
//             </p>
//             <h1
//               className="font-extrabold text-evolve-yellow"
//               style={{
//                 fontSize: "clamp(56px,5.5vw,68px)",
//                 lineHeight: 1.05,
//                 letterSpacing: "-0.02em"
//               }}
//             >
//               Design students,
//               <br /> made industry-ready
//             </h1>
//           </div>

//           {/* right — bigger paragraph text + button, anchored to the bottom */}
//           <div className="md:flex-1 md:flex md:flex-col md:justify-end md:items-start md:max-w-[520px] md:ml-auto md:mb-[6vh]">
//             <p
//               className="text-white/90"
//               style={{ fontSize: "clamp(18px,1.4vw,22px)", lineHeight: 1.5 }}
//             >
//               {preventWidow(
//                 "Recruiters don't reject your design students for lack of skill. they reject unclear portfolios, wrong role targeting, and weak presentation."
//               )}
//             </p>
//             <p
//               className="text-white/90 mt-6"
//               style={{ fontSize: "clamp(18px,1.4vw,22px)", lineHeight: 1.5 }}
//             >
//               {preventWidow(
//                 "Evolve fixes exactly that. industry professional led programmes which run on your own branded portal."
//               )}
//             </p>

//             <div className="mt-8 flex flex-wrap items-center gap-4">
//               <button
//                 onClick={() => openModal("contact")}
//                 className="inline-flex items-center justify-center gap-2 bg-evolve-yellow text-evolve-black font-extrabold px-7 py-3.5 text-[16px] hover:opacity-90 transition-opacity w-fit"
//                 style={{ borderRadius: 16, boxShadow: "4px 4px 0 0 #806804" }}
//               >
//                 Get in touch{" "}
//                 <span>
//                   <img src={right_arrow_icon} alt="" className="w-6 h-6" />
//                 </span>
//               </button>
//               {/* self-serve institute space onboarding — disabled on this
//                   entry point for now, the flow isn't fully finished yet.
//                   Still reachable directly at /onboarding while it's built out. */}
//             </div>
//             {/* <button
//               onClick={() =>
//                 window.open(
//                   "https://calendly.com/chesna-paperclip/new-meeting",
//                   "_blank"
//                 )
//               }
//               className="mt-8 inline-flex items-center justify-center gap-2 bg-evolve-yellow text-evolve-black font-extrabold px-7 py-3.5 text-[16px] hover:opacity-90 transition-opacity w-fit"
//               style={{ borderRadius: 16, boxShadow: "4px 4px 0 0 #806804" }}
//             >
//               book a 30-min call{" "}
//               <span>
//                 <img src={right_arrow_icon} alt="" className="w-6 h-6" />
//               </span>
//             </button> */}
//           </div>
//         </div>
//       </section>

//       {/* ── Stat callout ── */}
//       <section
//         className="w-full flex flex-col items-start md:items-center justify-center"
//         style={{
//           background: "#161616",
//           minHeight: "20vh",
//           padding: "clamp(56px,10vh,96px) clamp(24px,6vw,96px)"
//         }}
//       >
//         <h2
//           className="font-extrabold text-evolve-yellow text-left md:text-center md:max-w-[680px]"
//           style={{
//             fontSize: "clamp(32px,3.4vw,44px)",
//             lineHeight: 1.1,
//             letterSpacing: "-0.02em"
//           }}
//         >
//           {/* 48% of grads feel unprepared
//           <br className="hidden md:block" /> to apply for entry-level positions */}
//           48% of grads feel unprepared to apply for entry-level positions
//         </h2>
//         <p
//           className="text-white text-left md:text-center mt-6 md:max-w-[980px]"
//           style={{ fontSize: "clamp(16px,1.2vw,19px)" }}
//         >
//           Cengage 2025 graduate employability report
//         </p>
//       </section>

//       {/* ── Our offerings — full screen ── */}
//       <section
//         className="w-full bg-evolve-yellow flex flex-col justify-center"
//         style={{
//           minHeight: "100vh",
//           padding:
//             "clamp(48px,7vh,80px) clamp(24px,6vw,96px) clamp(56px,8vh,96px)"
//         }}
//       >
//         <h2
//           className="font-extrabold text-evolve-black"
//           style={{ fontSize: "clamp(32px,3.4vw,44px)" }}
//         >
//           Our offerings
//         </h2>
//         <p
//           className="text-evolve-black mt-3"
//           style={{ fontSize: "clamp(16px,1.2vw,19px)" }}
//         >
//           Custom space for your institute &nbsp;•&nbsp; Personalised journey for
//           your students &nbsp;•&nbsp;{" "}
//           {preventWidow("100% delivered by industry professionals")}
//         </p>

//         <div className="mt-10 flex flex-col md:flex-row gap-6">
//           {OFFERINGS.map((card) => (
//             <OfferingCard key={card.path} card={card} />
//           ))}
//         </div>

//         <div className="mt-10 flex justify-center">
//           <button
//             onClick={() => openModal("handbook")}
//             className="inline-flex items-center justify-center gap-2 bg-evolve-black text-evolve-yellow font-extrabold px-7 py-3.5 text-[16px] hover:opacity-90 transition-opacity"
//             style={{
//               borderRadius: 16,
//               border: "1px solid rgba(255,208,7,1)",
//               boxShadow: "4px 4px 0 0 #806804"
//             }}
//           >
//             Download handbook
//             <img src={download_icon} alt="" className="w-5 h-5" />
//           </button>
//         </div>
//       </section>

//       <AudienceFooter audience="institutions" />

//       <InstituteContactModal
//         isOpen={modalOpen}
//         onClose={() => setModalOpen(false)}
//         programme={INQUIRY.programme}
//         table={INQUIRY.table}
//         orgLabel={INQUIRY.orgLabel}
//         orgField={INQUIRY.orgField}
//         whatsappUrl={INQUIRY.whatsappUrl}
//         intent={modalIntent}
//         handbookUrl={HANDBOOK_URL}
//       />
//     </div>
//   );
// }
