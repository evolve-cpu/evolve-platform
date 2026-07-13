import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SEO from "../components/SEO";
import AudienceNav from "../components/AudienceNav";
import AudienceFooter from "../components/AudienceFooter";
import InstituteContactModal from "../components/InstituteContactModal";
import { AUDIENCE_INQUIRY_CONFIG } from "../lib/audienceInquiry";

const INQUIRY = AUDIENCE_INQUIRY_CONFIG.institutions;

const HANDBOOK_URL =
  "https://drive.google.com/uc?export=download&id=1VSgeQz4t6VpeY6HIRZ6JhByeZa078t9m";

const OFFERINGS = [
  {
    title: "portfolio review programme",
    subtitle: "industry feedback to build stronger portfolios.",
    body: "a structured review delivered by industry professional.  every student gets a comprehensive report, a live on-campus or online session once they've refined their work.",
    path: "/for-institutes/portfolio-review-programme"
  },
  {
    title: "find your niche",
    subtitle: "helping students discover where they belong in design.",
    body: 'a 4-day mentorship programme delivered by industry professionals, taking students from "who am i as a designer" to "where do i actually fit" ending with a portfolio and presence that reflects that clarity.',
    path: "/for-institutes/find-your-niche-programme"
  }
];

const ArrowButton = () => (
  <div
    className="flex items-center justify-center rounded-full bg-evolve-black flex-shrink-0"
    style={{ width: "clamp(40px,3.2vw,52px)", height: "clamp(40px,3.2vw,52px)" }}
  >
    <span
      className="text-evolve-yellow"
      style={{ fontSize: "clamp(18px,1.5vw,24px)", lineHeight: 1 }}
    >
      ↗
    </span>
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
        {card.title}
      </h3>
      <p
        className="font-semibold text-evolve-black mt-2 pr-14"
        style={{ fontSize: "clamp(14px,1.1vw,16px)" }}
      >
        {card.subtitle}
      </p>
      <p
        className="text-evolve-black mt-4"
        style={{ fontSize: "clamp(13px,1vw,15px)", lineHeight: 1.55 }}
      >
        {card.body}
      </p>
    </button>
  );
};

export default function Institutions() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIntent, setModalIntent] = useState("contact");

  const openModal = (intent) => {
    setModalIntent(intent);
    setModalOpen(true);
  };

  return (
    <div className="w-full lowercase">
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
          padding: "clamp(96px,16vh,150px) clamp(24px,6vw,96px) clamp(48px,7vh,88px)"
        }}
      >
        <div className="flex-1 flex flex-col md:flex-row md:items-stretch gap-10 md:gap-10">
          {/* left — heading, pinned toward the top */}
          <div className="md:self-start md:mt-[6vh]">
            <h1
              className="font-extrabold text-evolve-yellow"
              style={{
                fontSize: "clamp(56px,5.5vw,68px)",
                lineHeight: 1.05,
                letterSpacing: "-0.02em"
              }}
            >
              get your students
              <br />
              industry ready
            </h1>
            <p
              className="text-white mt-4"
              style={{ fontSize: "clamp(24px,1.6vw,24px)" }}
            >
              with evolve
            </p>
          </div>

          {/* right — bigger paragraph text + button, anchored to the bottom */}
          <div className="md:flex-1 md:flex md:flex-col md:justify-end md:items-start md:max-w-[520px] md:ml-auto md:mb-[6vh]">
            <p
              className="text-white/90"
              style={{ fontSize: "clamp(18px,1.4vw,22px)", lineHeight: 1.5 }}
            >
              the biggest gap for design students isn't skill. it is clarity.
              they struggle to define their design path, target the right
              roles, and present themselves effectively.
            </p>
            <p
              className="text-white/90 mt-6"
              style={{ fontSize: "clamp(18px,1.4vw,22px)", lineHeight: 1.5 }}
            >
              evolve closes this gap through practitioner-led programmes
              delivered on your own branded portal
            </p>

            <button
              onClick={() => openModal("contact")}
              className="mt-8 inline-flex items-center justify-center gap-2 bg-evolve-yellow text-evolve-black font-extrabold px-7 py-3.5 text-[16px] hover:opacity-90 transition-opacity w-fit"
              style={{ borderRadius: 16, boxShadow: "4px 4px 0 0 #806804" }}
            >
              get in touch <span>→</span>
            </button>
          </div>
        </div>
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
          our offerings
        </h2>
        <p
          className="text-evolve-black mt-3"
          style={{ fontSize: "clamp(16px,1.2vw,19px)" }}
        >
          custom space for your institute &nbsp;•&nbsp; personalised journey
          for your students &nbsp;•&nbsp; 100% delivered by industry
          professionals
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
              border: "2px solid rgba(255,208,7,1)",
              boxShadow: "4px 4px 0 0 #806804"
            }}
          >
            download handbook <span>↓</span>
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
