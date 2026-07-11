import { useNavigate } from "react-router-dom";
import SEO from "../components/SEO";
import AudienceNav from "../components/AudienceNav";
import AudienceFooter from "../components/AudienceFooter";

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
      className="group relative text-left flex-1 rounded-[24px] border border-black/10 hover:border-black/20 transition-colors duration-200"
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
        className="text-evolve-black/70 mt-4"
        style={{ fontSize: "clamp(13px,1vw,15px)", lineHeight: 1.55 }}
      >
        {card.body}
      </p>
    </button>
  );
};

export default function Institutions() {
  const navigate = useNavigate();

  return (
    <div className="w-full lowercase">
      <SEO
        title="evolve for institutions — get your students industry ready"
        description="evolve for institutions gives design colleges and coaching institutes practitioner-led programmes — portfolio reviews and niche-finding mentorship — delivered on your own branded portal."
        path="/institutions"
      />
      <AudienceNav />

      {/* ── Hero ── */}
      <section
        className="w-full bg-evolve-black"
        style={{
          padding:
            "clamp(96px,16vh,150px) clamp(24px,6vw,96px) clamp(48px,7vh,88px)"
        }}
      >
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8 md:gap-10">
          <div>
            <h1
              className="font-extrabold text-evolve-yellow"
              style={{
                fontSize: "clamp(40px,5.5vw,68px)",
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
              style={{ fontSize: "clamp(18px,1.6vw,24px)" }}
            >
              with evolve
            </p>
          </div>

          <div className="md:max-w-[420px] md:mt-16">
            <p
              className="text-white/90"
              style={{ fontSize: "clamp(15px,1.15vw,18px)", lineHeight: 1.5 }}
            >
              the biggest gap for design students isn't skill. it is clarity.
              they struggle to define their design path, target the right
              roles, and present themselves effectively.
            </p>
            <p
              className="text-white/90 mt-6"
              style={{ fontSize: "clamp(15px,1.15vw,18px)", lineHeight: 1.5 }}
            >
              evolve closes this gap through practitioner-led programmes
              delivered on your own branded portal
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/signin")}
          className="mt-10 inline-flex items-center justify-center bg-evolve-yellow text-evolve-black font-extrabold rounded-2xl px-7 py-3.5 text-[16px] hover:opacity-90 transition-opacity"
        >
          sign in
        </button>
      </section>

      {/* ── Our offerings ── */}
      <section
        className="w-full bg-evolve-yellow"
        style={{
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
          className="text-evolve-black/80 mt-3"
          style={{ fontSize: "clamp(13px,1vw,15px)" }}
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
      </section>

      <AudienceFooter programme="institutions" />
    </div>
  );
}
