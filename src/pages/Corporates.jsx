import { useState } from "react";
import SEO from "../components/SEO";
import AudienceNav from "../components/AudienceNav";
import AudienceFooter from "../components/AudienceFooter";
import InstituteContactModal from "../components/InstituteContactModal";
import { AUDIENCE_INQUIRY_CONFIG } from "../lib/audienceInquiry";
import { preventWidow } from "../utils/preventWidow";
import { download_icon, right_arrow_icon } from "../assets/images/Nav";

const INQUIRY = AUDIENCE_INQUIRY_CONFIG.corporates;

const OFFERINGS = [
  {
    title: "Team upskilling",
    subtitle: "Structured learning for every designer.",
    body: "Give every team member their own learning journey with industry-led courses, webinars, progress tracking, and visible skill growth, so learning becomes continuous, not occasional."
  },
  {
    title: "Team workshops",
    subtitle: "Solve real business problems together.",
    body: "Collaborative workshops and design sprints that bring cross-functional teams together to align, innovate, and turn ideas into actionable outcomes."
  },
  {
    title: "Hire industry-ready designers",
    subtitle: "Access vetted design talent.",
    body: "Skip the guesswork with a curated pipeline of designers who've already been mentored, reviewed, and benchmarked for real-world readiness."
  }
];

const HANDBOOK_URL =
  "https://drive.google.com/uc?export=download&id=1kAec9-UKMj_Hp2X-R20K1nXHYq8-fdd2";

const OfferingCard = ({ card }) => (
  <div
    className="flex-1 flex flex-col justify-between rounded-[24px] border border-black/10 md:min-h-[440px]"
    style={{
      background: "rgba(255,229,110,1)",
      padding: "clamp(28px,3.2vw,44px)"
    }}
  >
    <div>
      <h3
        className="font-extrabold text-evolve-black"
        style={{ fontSize: "clamp(20px,1.7vw,27px)", lineHeight: 1.15 }}
      >
        {preventWidow(card.title)}
      </h3>
      <p
        className="font-semibold text-evolve-black mt-2"
        style={{ fontSize: "clamp(14px,1.1vw,16px)" }}
      >
        {preventWidow(card.subtitle)}
      </p>
    </div>

    <p
      className="text-evolve-black"
      style={{ fontSize: "clamp(13px,1vw,15px)", lineHeight: 1.55 }}
    >
      {preventWidow(card.body)}
    </p>
  </div>
);

export default function Corporates() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIntent, setModalIntent] = useState("contact");

  const openModal = (intent) => {
    setModalIntent(intent);
    setModalOpen(true);
  };

  return (
    <div className="w-full">
      <SEO
        title="evolve for corporates — make your design team remarkable"
        description="evolve for corporates helps organizations build strong design teams through continuous upskilling, team workshops, and access to industry-ready design talent."
        path="/corporates"
      />
      <AudienceNav audience="corporates" />

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
              Evolve for corporates
            </p>
            <h1
              className="font-extrabold text-evolve-yellow"
              style={{
                fontSize: "clamp(56px,5.5vw,68px)",
                lineHeight: 1.05,
                letterSpacing: "-0.02em"
              }}
            >
              Make your design
              <br />
              team remarkable
            </h1>
          </div>

          {/* right — bigger paragraph text + button, anchored to the bottom */}
          <div className="md:flex-1 md:flex md:flex-col md:justify-end md:items-start md:max-w-[520px] md:ml-auto md:mb-[6vh]">
            <p
              className="text-white/90"
              style={{ fontSize: "clamp(18px,1.4vw,22px)", lineHeight: 1.5 }}
            >
              {preventWidow(
                "Key to becoming a strong design team is to constantly upskill, work better as team and getting to pick who makes up this team."
              )}
            </p>
            <p
              className="text-white/90 mt-6"
              style={{ fontSize: "clamp(18px,1.4vw,22px)", lineHeight: 1.5 }}
            >
              {preventWidow(
                "Will evolve platform, you'd be able to nurture and grow a team which delivers real impact."
              )}
            </p>

            <button
              onClick={() => openModal("contact")}
              className="mt-8 inline-flex items-center justify-center gap-2 bg-evolve-yellow text-evolve-black font-extrabold px-7 py-3.5 text-[16px] hover:opacity-90 transition-opacity w-fit"
              style={{ borderRadius: 16, boxShadow: "4px 4px 0 0 #806804" }}
            >
              Get in touch{" "}
              <span>
                <img src={right_arrow_icon} alt="" className="w-6 h-6" />
              </span>
            </button>
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

      {/* ── Our offerings — full screen ── */}
      <section
        className="w-full bg-evolve-yellow flex flex-col justify-center items-center"
        style={{
          minHeight: "100vh",
          padding:
            "clamp(48px,7vh,80px) clamp(24px,6vw,96px) clamp(56px,8vh,96px)"
        }}
      >
        <div className="w-full">
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
            {preventWidow(
              "practical design programmes built for individuals, teams, and organisations looking to grow with industry-led learning."
            )}
          </p>

          <div className="mt-10 flex flex-col md:flex-row gap-6">
            {OFFERINGS.map((card) => (
              <OfferingCard key={card.title} card={card} />
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
        </div>
      </section>

      <AudienceFooter audience="corporates" />

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
