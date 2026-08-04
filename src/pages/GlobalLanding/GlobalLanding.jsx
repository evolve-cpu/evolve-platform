import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SEO from "../../components/SEO";
import { arrow_yellow, arrow_black } from "../../assets/images/Nav";

const AUDIENCE_CARDS = [
  {
    id: "designers",
    title: "Designers",
    desc: "Self learners, design school students, career shifters. We make learning and growing in design accessible to all.",
    path: "/designers"
  },
  {
    id: "institutions",
    title: "Institutions",
    desc: "For design colleges, coaching institutes, co-hort looking to provide their students industry exposure & ready for the world.",
    path: "/institutions"
  },
  {
    id: "corporates",
    title: "Corporates",
    desc: "For organisations who believe in building strong design teams through constant learning, up skilling and finding the right kind of members to join them.",
    path: "/corporates"
  }
];

const getIsMobile = () => {
  if (typeof window === "undefined") return false;
  const w = window.innerWidth;
  const h = window.innerHeight;
  return w <= 768 || (w <= 1024 && h > w);
};

const ArrowButton = () => (
  <div
    className="relative flex items-center justify-center rounded-full bg-evolve-black group-hover:bg-white group-focus-visible:bg-white transition-colors duration-200 flex-shrink-0"
    style={{
      width: "clamp(44px, 3.6vw, 60px)",
      height: "clamp(44px, 3.6vw, 60px)"
    }}
  >
    <img
      src={arrow_yellow}
      alt=""
      className="absolute transition-opacity duration-200 group-hover:opacity-0 group-focus-visible:opacity-0"
      style={{ width: "clamp(18px, 1.6vw, 24px)", height: "auto" }}
    />
    <img
      src={arrow_black}
      alt=""
      className="absolute opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
      style={{ width: "clamp(18px, 1.6vw, 24px)", height: "auto" }}
    />
  </div>
);

const AudienceCard = ({ card, isMobile, onClick }) => (
  <button
    onClick={onClick}
    className="group text-left bg-evolve-yellow hover:bg-evolve-pink focus-visible:bg-evolve-pink transition-colors duration-200 flex-1 flex flex-col justify-between focus:outline-none"
    style={{
      padding: isMobile
        ? "32px 24px"
        : "clamp(28px,3.2vw,48px) clamp(24px,3vw,48px)",
      minHeight: isMobile ? "220px" : "clamp(280px, 24vw, 360px)"
    }}
  >
    <div>
      <h3
        className="font-extrabold text-evolve-black group-hover:text-white group-focus-visible:text-white transition-colors duration-200"
        style={{ fontSize: isMobile ? "22px" : "clamp(22px, 1.8vw, 28px)" }}
      >
        {card.title}
      </h3>

      <p
        className="text-evolve-black/90 group-hover:text-white/90 group-focus-visible:text-white/90 transition-colors duration-200 mt-2"
        style={{
          fontSize: isMobile ? "16px" : "clamp(16px, 1.5vw, 19px)",
          lineHeight: 1.28,
          maxWidth: isMobile ? "100%" : "88%"
        }}
      >
        {card.desc}
      </p>
    </div>

    <div className="mt-8 flex justify-end transition-transform duration-200 group-hover:translate-x-1">
      <ArrowButton />
    </div>
  </button>
);

const GlobalLanding = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(getIsMobile);

  useEffect(() => {
    const onResize = () => setIsMobile(getIsMobile());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="w-full">
      <SEO
        title="evolve — a design growth platform for designers, institutions & corporates"
        description="evolve is a design growth ecosystem — pick your path as a designer, an institution, or a corporate team, and get the tools built for you."
        path="/"
      />

      {/* ── Hero ── */}
      <section
        className={`w-full bg-evolve-black flex flex-col ${
          isMobile ? "items-start text-left" : "items-center text-center"
        }`}
        style={{
          padding: isMobile
            ? "80px 24px 48px"
            : "clamp(96px,12vh,160px) clamp(32px,6vw,96px) clamp(56px,7vh,96px)"
        }}
      >
        <h1
          className="font-extrabold text-evolve-yellow"
          style={{
            fontSize: isMobile ? "48px" : "clamp(56px, 6.5vw, 128px)",
            lineHeight: isMobile ? "1.02" : "0.95",
            letterSpacing: "-0.02em"
          }}
        >
          Welcome
          <br />
          to evolve
        </h1>
        <p
          className="text-white mt-4"
          style={{ fontSize: isMobile ? "20px" : "clamp(22px, 2vw, 36px)" }}
        >
          A design growth platform built for
        </p>
      </section>

      {/* ── Audience cards ── */}
      <section
        className={`w-full bg-evolve-black flex ${isMobile ? "flex-col" : "flex-row"}`}
        style={{
          gap: isMobile ? "16px" : "clamp(16px,2vw,28px)",
          paddingBottom: isMobile ? " 40px" : "clamp(48px,6vh,96px)"
        }}
      >
        {AUDIENCE_CARDS.map((card) => (
          <AudienceCard
            key={card.id}
            card={card}
            isMobile={isMobile}
            onClick={() => navigate(card.path)}
          />
        ))}
      </section>
    </div>
  );
};

export default GlobalLanding;
