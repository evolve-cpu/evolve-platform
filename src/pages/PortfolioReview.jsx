import { useState, useRef, useEffect, useId } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import SEO from "../components/SEO";
import { useAuth } from "../hooks/useAuth";
import { portfolioReview as COPY } from "../content";
import { renderWithBreaks } from "../utils/renderWithBreaks";
import { trackPortfolioReviewCta } from "../utils/analytics";
import {
  right_eye_ribbon_1,
  left_eye_ribbon_1,
  right_eye_ribbon_mobile,
  left_eye_ribbon_mobile,
  vector_portfolio,
  vector_portfolio_mobile,
  mentorship_vector,
  mentorship_vector_mobile
} from "../assets/images/Mentorship";
import {
  rays_webinars,
  rays_webinars_mobile,
  whats_included_bg,
  whats_included_bg_mobile
} from "../assets/images/Webinars";
import { marquee_vector_2 } from "../assets/images/Nav";

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

const TESTIMONIALS_LIST = COPY.testimonials.items;

/* ─────────────────────────────────────────────
   GetStartedButton — shared black CTA. Always lands on the visitor's own
   profile — if they're signed in but haven't onboarded yet (no profile to
   land on), it detours through /onboarding first; if they're not signed in
   at all, /onboarding's own guard bounces them through /signin and back.
───────────────────────────────────────────── */
const GetStartedButton = ({ trackLabel, mobile = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  return (
    <button
      onClick={() => {
        trackPortfolioReviewCta(trackLabel);
        if (user?.onboarding_completed && user?.username) {
          navigate(`/profile/${user.username}`);
        } else {
          navigate("/onboarding");
        }
      }}
      className="font-extrabold cursor-pointer flex items-center gap-3 rounded-2xl transition-opacity duration-150 hover:opacity-90"
      style={{
        backgroundColor: "#000",
        color: "var(--color-evolve-yellow, #FFD007)",
        boxShadow: "4px 4px 0 0 #BF9C05",
        padding: mobile ? "14px 22px" : "16px 28px",
        fontSize: mobile ? "16px" : "clamp(16px, 1.2vw, 20px)"
      }}
    >
      <span>Get Started</span>
      <span style={{ fontSize: "1.1em" }}>→</span>
    </button>
  );
};

/* ─────────────────────────────────────────────
   StarEyeBadge — spiky star with an eye, used to
   crown the pricing card
───────────────────────────────────────────── */
const StarEyeBadge = ({ size = 96 }) => (
  <div className="relative" style={{ width: size, height: size }}>
    <img src={marquee_vector_2} alt="" className="w-full h-full" />
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className="rounded-full bg-white flex items-center justify-center"
        style={{ width: "48%", height: "32%" }}
      >
        <div
          className="rounded-full bg-evolve-lavender-indigo flex items-center justify-center"
          style={{ width: "58%", height: "88%" }}
        >
          <div
            className="rounded-full bg-black"
            style={{ width: "42%", height: "42%" }}
          />
        </div>
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   Marquee — self-contained scrolling strip
───────────────────────────────────────────── */
const Marquee = ({ isMobile, label }) => {
  const trackRef = useRef(null);
  const groupRef = useRef(null);

  useEffect(() => {
    const group = groupRef.current;
    const track = trackRef.current;
    if (!group || !track) return;

    const clone = group.cloneNode(true);
    track.appendChild(clone);
    let cleanupAnim = null;

    const start = () => {
      const groupWidth = group.getBoundingClientRect().width;
      if (!groupWidth) return;
      gsap.set(track, { x: 0 });
      const anim = gsap.to(track, {
        x: -groupWidth,
        duration: 20,
        ease: "none",
        repeat: -1,
        modifiers: {
          x: gsap.utils.unitize((x) => {
            const v = parseFloat(x);
            return (v % -groupWidth) + 0 || 0;
          })
        }
      });
      cleanupAnim = () => anim.kill();
    };

    const imgs = track.querySelectorAll("img");
    const allLoaded = Array.from(imgs).every((im) => im.complete);
    if (allLoaded || imgs.length === 0) {
      start();
    } else {
      let loadedCount = 0;
      imgs.forEach((im) => {
        const done = () => {
          loadedCount += 1;
          if (loadedCount >= imgs.length) start();
        };
        im.addEventListener("load", done, { once: true });
        im.addEventListener("error", done, { once: true });
      });
    }

    return () => {
      cleanupAnim?.();
      track.removeChild(clone);
    };
  }, []);

  return (
    <div
      className={`relative w-full border-t-2 border-b-2 border-evolve-yellow bg-evolve-lavender-indigo overflow-hidden ${
        isMobile ? "h-24" : "h-[7rem]"
      }`}
    >
      <div
        ref={trackRef}
        className="absolute top-1/2 -translate-y-1/2 left-0 flex whitespace-nowrap"
        style={{ willChange: "transform" }}
      >
        <div
          ref={groupRef}
          className={`flex items-center flex-none ${
            isMobile ? "gap-8 pr-8" : "gap-14 pr-14"
          }`}
        >
          {[0, 1, 2, 3].map((i) => (
            <>
              <img
                key={`icon-${i}`}
                src={marquee_vector_2}
                alt=""
                className={`w-auto flex-none ${isMobile ? "h-10" : "h-[5rem]"}`}
              />
              <span
                key={`label-${i}`}
                className={`flex-none font-paralucent lowercase text-evolve-yellow ${
                  isMobile ? "text-4xl" : "text-5xl"
                }`}
              >
                {label}
              </span>
            </>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Social badges — LinkedIn / Instagram
───────────────────────────────────────────── */
const LinkedInBadge = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="16" height="16" rx="3.5" fill="#0076B2" />
    <path
      d="M2.629 6.091h2.264v7.284H2.629V6.09Zm1.133-3.625a1.313 1.313 0 1 1 0 2.626 1.313 1.313 0 0 1 0-2.626ZM6.313 6.09h2.17v.996h.03c.302-.573 1.04-1.176 2.141-1.176 2.293 0 2.718 1.509 2.718 3.466v3.998h-2.264V9.831c0-.844-.015-1.93-1.177-1.93-1.161 0-1.359.92-1.359 1.875v4h-2.26V6.091Z"
      fill="white"
    />
  </svg>
);

const InstagramBadge = () => {
  const gradientId = `ig-grad-${useId()}`;
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="16" x2="16" y2="0">
          <stop offset="0%" stopColor="#FEDA75" />
          <stop offset="30%" stopColor="#D62976" />
          <stop offset="65%" stopColor="#962FBF" />
          <stop offset="100%" stopColor="#4F5BD5" />
        </linearGradient>
      </defs>
      <rect width="16" height="16" rx="3.5" fill={`url(#${gradientId})`} />
      <g transform="translate(2.5 2.5) scale(0.6875)">
        <path
          d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.719-.891.923-1.417.198-.509.333-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.174-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.033 1.024-.043 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"
          fill="white"
        />
      </g>
    </svg>
  );
};

const ReviewerSocials = ({ name, linkedinUrl, instagramUrl }) => {
  if (!linkedinUrl && !instagramUrl) return null;
  return (
    <div className="flex items-center gap-2 mt-3">
      {linkedinUrl && (
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${name} on LinkedIn`}
        >
          <LinkedInBadge />
        </a>
      )}
      {instagramUrl && (
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${name} on Instagram`}
        >
          <InstagramBadge />
        </a>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   ReviewerCard — desktop
───────────────────────────────────────────── */
const ReviewerCard = ({ reviewer }) => (
  <div className="flex flex-col items-start h-full">
    <h3
      className="font-extrabold text-evolve-pink"
      style={{ fontSize: "clamp(17px, 1.3vw, 20px)" }}
    >
      {reviewer.name}
    </h3>
    <p
      className="text-black mt-1"
      style={{ fontSize: "clamp(13px, 0.9vw, 14px)" }}
    >
      (years of experience: {reviewer.years}+)
    </p>
    <p
      className="text-black mt-2 max-w-[90%]"
      style={{ fontSize: "clamp(14px, 1vw, 16px)", lineHeight: 1.4 }}
    >
      {reviewer.role.map((line, i) => (
        <span key={i}>
          {line}
          {i !== reviewer.role.length - 1 && <br />}
        </span>
      ))}
    </p>
    <ReviewerSocials
      name={reviewer.name}
      linkedinUrl={reviewer.linkedinUrl}
      instagramUrl={reviewer.instagramUrl}
    />
  </div>
);

/* ─────────────────────────────────────────────
   TestimonialsMobileStack — one card at a time,
   with dot pagination + side arrows
───────────────────────────────────────────── */
const TestimonialsMobileStack = () => {
  const [current, setCurrent] = useState(0);
  const cardRef = useRef(null);

  const goTo = (index) => {
    const el = cardRef.current;
    if (el) {
      gsap.fromTo(
        el,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );
    }
    setCurrent(index);
  };

  const prev = () =>
    goTo((current - 1 + TESTIMONIALS_LIST.length) % TESTIMONIALS_LIST.length);
  const next = () => goTo((current + 1) % TESTIMONIALS_LIST.length);

  const t = TESTIMONIALS_LIST[current];

  return (
    <section className="block md:hidden relative bg-evolve-pink overflow-hidden py-10 px-5">
      <h2
        className="text-white font-extrabold lowercase text-center w-full mb-6"
        style={{ fontSize: "clamp(32px, 9vw, 44px)", lineHeight: "1" }}
      >
        {COPY.testimonials.sectionHeading}
      </h2>
      <div
        className="relative flex items-center justify-center"
        style={{ height: "380px" }}
      >
        <div
          ref={cardRef}
          className="rounded-2xl border-2 bg-evolve-yellow flex flex-col justify-center px-6 py-7"
          style={{
            width: "100vw",
            maxWidth: "340px",
            height: "380px",
            borderColor: "var(--color-evolve-pink, #EC008B)"
          }}
        >
          <span
            className="text-evolve-pink font-extrabold leading-none"
            style={{
              fontSize: "64px",
              lineHeight: "0.7",
              fontStyle: "italic"
            }}
          >
            "
          </span>
          <p
            className="font-bold text-black lowercase -mt-4"
            style={{ fontSize: "15px", lineHeight: "1.45" }}
          >
            {t.quote}
          </p>
          <div className="mt-5">
            <p
              className="font-bold text-black lowercase"
              style={{ fontSize: "15px" }}
            >
              {t.name}
            </p>
            <p
              className="font-normal text-black lowercase"
              style={{ fontSize: "13px", lineHeight: "1.3" }}
            >
              {t.role}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-5 mt-6">
        <button
          onClick={prev}
          className="text-white font-normal text-2xl leading-none hover:opacity-70 transition-opacity"
          aria-label="previous"
        >
          &lt;
        </button>
        <div className="flex items-center gap-2">
          {TESTIMONIALS_LIST.map((_, i) => (
            <span
              key={i}
              className="rounded-full"
              style={{
                width: 8,
                height: 8,
                backgroundColor:
                  i === current ? "#fff" : "rgba(255,255,255,0.4)"
              }}
            />
          ))}
        </div>
        <button
          onClick={next}
          className="text-white font-normal text-2xl leading-none hover:opacity-70 transition-opacity"
          aria-label="next"
        >
          &gt;
        </button>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────
   PortfolioReview
───────────────────────────────────────────── */
const PortfolioReview = () => {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div>
      <SEO
        title={COPY.seo.title}
        description={COPY.seo.description}
        path="/community/portfolio-review"
      />

      {/* ================= SECTION 1 — HERO (Desktop) ================= */}
      <section className="hidden md:flex relative min-h-[110vh] bg-evolve-yellow overflow-visible flex-col items-center">
        <img
          src={rays_webinars}
          alt=""
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ zIndex: 0 }}
        />

        <div
          className="relative flex flex-col items-center text-center"
          style={{
            zIndex: 30,
            paddingTop: "clamp(64px, 16vh, 120px)",
            paddingLeft: "clamp(32px, 6vw, 120px)",
            paddingRight: "clamp(32px, 6vw, 120px)"
          }}
        >
          <p
            className="font-bold text-black"
            style={{
              fontSize: "clamp(16px, 1.2vw, 20px)",
              letterSpacing: "0.02em",
              marginBottom: "clamp(12px, 1.6vh, 20px)"
            }}
          >
            Portfolio Review
          </p>

          <h1
            className="font-extrabold text-evolve-pink"
            style={{
              fontSize: "clamp(56px, 7vw, 96px)",
              lineHeight: "0.9",
              letterSpacing: "-0.03em"
            }}
          >
            {renderWithBreaks(COPY.hero.heading)}
          </h1>

          <p
            className="font-normal text-black mt-6"
            style={{
              fontSize: "clamp(18px, 2.2vw, 32px)",
              lineHeight: "1.45",
              letterSpacing: "-0.3px",
              maxWidth: "60vw"
            }}
          >
            {COPY.hero.body}
          </p>

          <div className="mt-8">
            <GetStartedButton trackLabel="hero_desktop" />
          </div>
        </div>

        <img
          src={vector_portfolio}
          alt=""
          className="absolute bottom-[-15%] left-[-0.8%] w-full pointer-events-none"
          style={{ zIndex: 5 }}
        />

        <img
          src={right_eye_ribbon_1}
          alt=""
          className="absolute bottom-[-12%] right-0 w-[50%]"
          style={{ zIndex: 10 }}
        />
        <img
          src={left_eye_ribbon_1}
          alt=""
          className="absolute bottom-[-12%] -left-[0.65rem] w-[50%]"
          style={{ zIndex: 20 }}
        />
      </section>

      {/* ================= SECTION 1 — HERO (Mobile) ================= */}
      <section className="flex md:hidden relative bg-evolve-yellow overflow-hidden min-h-screen flex-col">
        <img
          src={rays_webinars_mobile}
          alt=""
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ zIndex: 0 }}
        />

        <div
          className="relative flex flex-col items-center text-center px-5"
          style={{
            zIndex: 30,
            paddingTop: "clamp(64px, 14vh, 100px)"
          }}
        >
          <p
            className="font-bold text-black"
            style={{
              fontSize: "15px",
              letterSpacing: "0.02em",
              marginBottom: "10px"
            }}
          >
            Portfolio Review
          </p>

          <h1
            className="font-extrabold text-evolve-pink"
            style={{
              fontSize: "clamp(40px, 13vw, 62px)",
              lineHeight: "1",
              letterSpacing: "-0.03em"
            }}
          >
            {renderWithBreaks(COPY.hero.heading)}
          </h1>

          <p
            className="font-normal text-black mt-4"
            style={{
              fontSize: "clamp(16px, 4.5vw, 22px)",
              lineHeight: "1.5",
              letterSpacing: "-0.2px",
              maxWidth: "86vw"
            }}
          >
            {renderWithBreaks(COPY.hero.bodyMobile)}
          </p>

          <div className="mt-6">
            <GetStartedButton trackLabel="hero_mobile" mobile />
          </div>
        </div>

        <img
          src={vector_portfolio_mobile}
          alt=""
          className="absolute bottom-0 left-0 w-full pointer-events-none"
          style={{ zIndex: 5 }}
        />
        <img
          src={right_eye_ribbon_mobile}
          alt=""
          className="absolute bottom-0 right-0 w-full"
          style={{ zIndex: 20 }}
        />
        <img
          src={left_eye_ribbon_mobile}
          alt=""
          className="absolute bottom-0 left-0 w-auto"
          style={{ zIndex: 10 }}
        />
      </section>

      {/* ================= SECTION 2 — INTRO PARAGRAPH ================= */}
      <section
        className="w-full md:min-h-[80vh] bg-evolve-yellow flex flex-col items-center justify-center text-center"
        style={{
          paddingTop: "clamp(96px, 18vh, 200px)",
          paddingBottom: "clamp(96px, 16vh, 180px)",
          paddingLeft: "clamp(24px, 6vw, 120px)",
          paddingRight: "clamp(24px, 6vw, 120px)"
          // minHeight: "80vh"
        }}
      >
        <p
          className="font-normal text-black"
          style={{
            fontSize: "clamp(20px, 2.6vw, 36px)",
            lineHeight: 1.4,
            maxWidth: "56ch"
          }}
        >
          {COPY.intro.split(/(?=Get a )/).map((part, i) => (
            <span key={i}>
              {i > 0 && <br className="hidden md:inline" />}
              {part}
            </span>
          ))}
        </p>
      </section>

      {/* ================= SECTION 3 — MARQUEE ================= */}
      <div className="hidden md:block">
        <Marquee isMobile={false} label="110+ portfolios reviewed" />
      </div>
      <div className="block md:hidden">
        <Marquee isMobile label="110+ portfolios reviewed" />
      </div>

      {/* ================= SECTION 4 — PRICING (Desktop) ================= */}
      <section
        className="hidden md:flex relative items-center justify-center overflow-hidden"
        style={{
          backgroundColor: "#DF0586",
          backgroundImage: `url(${whats_included_bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "clamp(110px, 28vh, 180px) "
        }}
      >
        <div
          className="relative flex flex-col items-center"
          style={{ maxWidth: 1270, width: "100%" }}
        >
          {/* <div className="relative z-10" style={{ marginBottom: "-34px" }}>
            <StarEyeBadge size={96} />
          </div> */}
          <div
            className="relative z-0 bg-evolve-yellow w-full grid grid-cols-2"
            style={{
              paddingLeft: "clamp(40px, 4.5vw, 64px)",
              paddingRight: "clamp(40px, 4.5vw, 64px)"
            }}
          >
            <div
              className="flex flex-col justify-center"
              style={{
                paddingTop: "clamp(48px, 5vw, 72px)",
                paddingBottom: "clamp(48px, 5vw, 72px)",
                paddingRight: "clamp(32px, 3.5vw, 48px)",
                borderRight: "3px solid var(--color-evolve-pink, #EC008B)"
              }}
            >
              <h2
                className="font-extrabold text-black"
                style={{
                  fontSize: "clamp(26px, 2.4vw, 34px)",
                  lineHeight: 1.15
                }}
              >
                {COPY.pricing.heading}
              </h2>
              <p
                className="text-black mt-3"
                style={{
                  fontSize: "clamp(15px, 1.1vw, 18px)",
                  lineHeight: 1.45,
                  maxWidth: "34ch"
                }}
              >
                {COPY.pricing.description}
              </p>
              <p
                className="font-extrabold text-black"
                style={{
                  fontSize: "clamp(40px, 4vw, 56px)",
                  marginTop: "clamp(20px, 2.6vh, 32px)"
                }}
              >
                ₹ {COPY.pricing.price}
              </p>
              <div className="mt-6">
                <GetStartedButton trackLabel="pricing_desktop" />
              </div>
            </div>

            <div
              className="flex flex-col justify-center"
              style={{
                paddingTop: "clamp(48px, 5vw, 72px)",
                paddingBottom: "clamp(48px, 5vw, 72px)",
                paddingLeft: "clamp(32px, 3.5vw, 48px)"
              }}
            >
              <h3
                className="font-extrabold text-black"
                style={{ fontSize: "clamp(18px, 1.5vw, 22px)" }}
              >
                {COPY.pricing.includesHeading}
              </h3>
              <ul className="mt-4 space-y-3">
                {COPY.pricing.includes.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-black"
                    style={{
                      fontSize: "clamp(14px, 1.05vw, 17px)",
                      lineHeight: 1.4
                    }}
                  >
                    <span>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 4 — PRICING (Mobile) ================= */}
      <section
        className="flex md:hidden relative flex-col items-center overflow-hidden"
        style={{
          backgroundColor: "#DF0586",
          backgroundImage: `url(${whats_included_bg_mobile})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          paddingTop: "clamp(200px, 8vw, 10px)",
          paddingBottom: "clamp(100px, 8vw, 10px)",
          paddingLeft: "13px",
          paddingRight: "13px"
        }}
      >
        <div className="relative flex flex-col items-center w-full">
          {/* <div className="relative z-10" style={{ marginBottom: "-28px" }}> */}
          {/* <StarEyeBadge size={64} /> */}
          {/* </div> */}
          <div
            className="relative z-0 bg-evolve-yellow w-full flex flex-col"
            style={{ paddingTop: "36px", paddingBottom: "36px" }}
          >
            <div
              className="flex flex-col items-start"
              style={{
                paddingLeft: "24px",
                paddingRight: "24px",
                paddingBottom: "28px",
                borderBottom: "3px solid var(--color-evolve-pink, #EC008B)"
              }}
            >
              <h2
                className="font-extrabold text-black"
                style={{
                  fontSize: "clamp(26px, 9vw, 38px)",
                  lineHeight: "1",
                  letterSpacing: "-0.53px"
                }}
              >
                {COPY.pricing.heading}
              </h2>
              <p
                className="text-black mt-3"
                style={{ fontSize: "18px", lineHeight: 1.25 }}
              >
                {COPY.pricing.description}
              </p>
              <p
                className="font-extrabold text-black"
                style={{ fontSize: "40px", marginTop: "20px" }}
              >
                ₹ {COPY.pricing.price}
              </p>
              <div className="mt-6">
                <GetStartedButton trackLabel="pricing_mobile" mobile />
              </div>
            </div>

            <div
              className="flex flex-col items-start"
              style={{
                paddingLeft: "24px",
                paddingRight: "24px",
                paddingTop: "28px"
              }}
            >
              <h3
                className="font-extrabold text-black"
                style={{ fontSize: "24px" }}
              >
                {COPY.pricing.includesHeading}
              </h3>
              <ul className="mt-4 space-y-3">
                {COPY.pricing.includesMobile.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-black"
                    style={{ fontSize: "18px", lineHeight: 1.4 }}
                  >
                    <span>•</span>
                    <span>{renderWithBreaks(item)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 5 — REVIEWERS ================= */}
      <section
        className="w-full bg-evolve-yellow"
        style={{ padding: "clamp(64px,8vh,96px) clamp(24px,6vw,96px)" }}
      >
        <h2
          className="hidden md:block font-extrabold text-evolve-pink text-center"
          // style={{ fontSize: "clamp(28px,3.2vw,40px)" }}
          style={{
            fontSize: "clamp(30px, 11vw, 46px)",
            lineHeight: "1",
            letterSpacing: "-0.53px"
          }}
        >
          Industry experts across multiple disciplines
        </h2>
        <h2
          className="block md:hidden font-extrabold text-evolve-pink text-center"
          style={{ fontSize: "clamp(32px, 9vw, 44px)", lineHeight: "1" }}
        >
          Industry experts across multiple disciplines
        </h2>

        {/* Desktop */}
        <div
          className="hidden md:block"
          style={{ marginTop: "clamp(56px,8vh,88px)" }}
        >
          <div className="grid grid-cols-5 gap-x-6 items-end">
            {REVIEWERS.map((reviewer) => (
              <img
                key={reviewer.name}
                src={reviewer.image}
                alt={reviewer.name}
                className="w-full object-cover grayscale"
                style={{
                  height: "clamp(170px,16vw,230px)",
                  objectPosition: "top center"
                }}
              />
            ))}
          </div>
          <div className="grid grid-cols-5 gap-x-6 relative">
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                background: "var(--color-evolve-pink, #EC008B)"
              }}
            />
            {REVIEWERS.map((reviewer) => (
              <div
                key={reviewer.name}
                style={{ paddingTop: "clamp(16px,2.5vh,24px)" }}
              >
                <ReviewerCard reviewer={reviewer} />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile */}
        <div
          className="block md:hidden"
          style={{ marginTop: "clamp(40px,10vw,56px)" }}
        >
          {REVIEWERS.map((reviewer) => (
            <div
              key={reviewer.name}
              style={{ marginBottom: "clamp(40px,10vw,56px)" }}
            >
              <img
                src={reviewer.image}
                alt={reviewer.name}
                className="w-full object-cover grayscale"
                style={{
                  height: "clamp(280px,80vw,380px)",
                  objectPosition: "top center"
                }}
              />
              <div
                style={{
                  height: 2,
                  width: "100%",
                  background: "var(--color-evolve-pink, #EC008B)"
                }}
              />
              <div style={{ paddingTop: "clamp(16px,4vw,24px)" }}>
                <h3
                  className="font-extrabold text-evolve-pink"
                  style={{ fontSize: "clamp(19px,5vw,22px)" }}
                >
                  {reviewer.name}
                </h3>
                <p
                  className="text-black mt-1"
                  style={{ fontSize: "clamp(13px,3.6vw,15px)" }}
                >
                  (years of experience: {reviewer.years}+)
                </p>
                <p
                  className="text-black mt-2"
                  style={{ fontSize: "clamp(15px,4vw,17px)", lineHeight: 1.4 }}
                >
                  {(reviewer.mobileRole ?? reviewer.role).map(
                    (line, i, arr) => (
                      <span key={i}>
                        {line}
                        {i !== arr.length - 1 && <br />}
                      </span>
                    )
                  )}
                </p>
                <ReviewerSocials
                  name={reviewer.name}
                  linkedinUrl={reviewer.linkedinUrl}
                  instagramUrl={reviewer.instagramUrl}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= SECTION 6 — TESTIMONIALS (Desktop) ================= */}
      <section
        className="hidden md:block w-full bg-evolve-pink"
        style={{ padding: "clamp(56px,8vh,96px) clamp(24px,6vw,96px)" }}
      >
        <h2
          className="font-extrabold lowercase text-white text-center"
          style={{
            fontSize: "clamp(28px,3.2vw,40px)",
            marginBottom: "clamp(40px,6vh,64px)"
          }}
        >
          {COPY.testimonials.sectionHeading}
        </h2>
        <div
          className="grid grid-cols-3 gap-6"
          style={{ maxWidth: 1100, margin: "0 auto" }}
        >
          {TESTIMONIALS_LIST.map((t, i) => (
            <div
              key={i}
              className="rounded-2xl border-2 bg-evolve-yellow flex flex-col justify-center"
              style={{
                borderColor: "var(--color-evolve-pink, #EC008B)",
                padding: "clamp(28px,3vw,40px)",
                minHeight: "clamp(360px, 34vw, 460px)"
              }}
            >
              <span
                className="text-evolve-pink font-extrabold"
                style={{
                  fontSize: "clamp(48px,4vw,64px)",
                  lineHeight: "0.7",
                  fontStyle: "italic"
                }}
              >
                "
              </span>
              <p
                className="font-bold text-black lowercase mt-2"
                style={{ fontSize: "clamp(15px,1.2vw,17px)", lineHeight: 1.5 }}
              >
                {t.quote}
              </p>
              <div className="mt-6">
                <p
                  className="font-bold text-black lowercase"
                  style={{ fontSize: "15px" }}
                >
                  {t.name}
                </p>
                <p
                  className="font-normal text-black lowercase"
                  style={{ fontSize: "13px" }}
                >
                  {t.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= SECTION 6 — TESTIMONIALS (Mobile) ================= */}
      <TestimonialsMobileStack />

      {/* ================= SECTION 7 — FAQ (Desktop) ================= */}
      <section className="hidden md:flex bg-evolve-yellow min-h-screen">
        <div
          className="flex-shrink-0 flex flex-col"
          style={{
            width: "35%",
            paddingTop: "clamp(80px, 10vh, 140px)",
            paddingLeft: "clamp(40px, 5vw, 80px)",
            paddingRight: "clamp(24px, 2vw, 40px)"
          }}
        >
          <h2
            className="font-extrabold text-black"
            style={{
              fontSize: "clamp(30px, 11vw, 46px)",
              lineHeight: "1",
              letterSpacing: "-0.53px"
            }}
          >
            {renderWithBreaks(COPY.faq.heading)}
          </h2>
        </div>

        <div
          className="flex-1 flex items-center"
          style={{
            paddingRight: "clamp(40px, 5vw, 80px)",
            paddingTop: "clamp(48px, 6vh, 80px)",
            paddingBottom: "clamp(48px, 6vh, 80px)"
          }}
        >
          <div className="w-full">
            {COPY.faq.items.map((item, i) => (
              <div key={item.q}>
                <div
                  className="flex items-center justify-between cursor-pointer"
                  style={{
                    paddingTop: "clamp(20px, 4vh, 32px)",
                    paddingBottom: "clamp(20px, 4vh, 32px)"
                  }}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span
                    className="font-semibold text-black"
                    style={{
                      fontSize: "34px",
                      letterSpacing: "-0.02em",
                      lineHeight: "1.2"
                    }}
                  >
                    {item.q}
                  </span>
                  <span className="ml-4 flex-shrink-0">
                    <svg
                      width="34"
                      height="34"
                      viewBox="0 0 32 32"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{
                        transform:
                          openFaq === i ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.25s ease"
                      }}
                    >
                      <path
                        d="M8 12L16 20L24 12"
                        stroke="black"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
                {openFaq === i && (
                  <p
                    className="font-normal text-black"
                    style={{
                      fontSize: "22px",
                      lineHeight: "1.4",
                      letterSpacing: "-0.02em",
                      paddingBottom: "clamp(20px, 2.5vh, 32px)"
                    }}
                  >
                    {item.a}
                  </p>
                )}
                {i !== COPY.faq.items.length - 1 && (
                  <div
                    style={{
                      height: "1px",
                      backgroundColor: "#000000",
                      width: "100%"
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SECTION 7 — FAQ (Mobile) ================= */}
      <section
        className="block md:hidden bg-evolve-yellow"
        style={{
          padding: "clamp(40px, 10vw, 64px) 20px clamp(48px, 10vw, 72px)"
        }}
      >
        <h2
          className="font-extrabold text-black"
          style={{
            fontSize: "clamp(26px, 9vw, 38px)",
            lineHeight: "1",
            letterSpacing: "-0.53px",
            marginBottom: "clamp(20px, 5vw, 28px)"
          }}
        >
          {renderWithBreaks(COPY.faq.heading)}
        </h2>
        <div className="w-full">
          {COPY.faq.items.map((item, i) => (
            <div key={item.q}>
              <div
                className="flex items-center justify-between cursor-pointer"
                style={{ paddingTop: "20px", paddingBottom: "20px" }}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span
                  className="font-semibold text-black"
                  style={{
                    fontSize: "clamp(17px, 5vw, 22px)",
                    letterSpacing: "-0.02em",
                    lineHeight: "1.2"
                  }}
                >
                  {item.q}
                </span>
                <span className="ml-3 flex-shrink-0">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      transform:
                        openFaq === i ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.25s ease"
                    }}
                  >
                    <path
                      d="M8 12L16 20L24 12"
                      stroke="black"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
              {openFaq === i && (
                <p
                  className="font-normal text-black"
                  style={{
                    fontSize: "clamp(15px, 4.5vw, 19px)",
                    lineHeight: "1.4",
                    letterSpacing: "-0.02em",
                    paddingBottom: "20px"
                  }}
                >
                  {item.a}
                </p>
              )}
              {i !== COPY.faq.items.length - 1 && (
                <div
                  style={{
                    height: "1px",
                    backgroundColor: "#000000",
                    width: "100%"
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ================= SECTION 8 — WHAT YOU'LL GET (Desktop) ================= */}
      <section className="hidden md:flex relative bg-evolve-lavender-indigo overflow-hidden flex-col items-center justify-center min-h-screen">
        <div
          className="relative z-10 flex flex-col items-center text-center max-w-[50%] px-8"
          style={{ paddingBottom: "clamp(120px, 18vh, 200px)" }}
        >
          <h2
            className="font-extrabold text-evolve-yellow"
            style={{
              fontSize: "clamp(72px, 6vw, 128px)",
              lineHeight: "0.9",
              letterSpacing: "-0.03em"
            }}
          >
            {COPY.whatYoullGet.heading}
          </h2>

          <p
            className="font-normal text-white"
            style={{
              fontSize: "clamp(20px, 2vw, 32px)",
              lineHeight: "1.2",
              marginTop: "clamp(24px, 3vh, 40px)",
              maxWidth: "60ch"
            }}
          >
            {COPY.whatYoullGet.body.split(/(?=where your)/).map((part, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {part}
              </span>
            ))}
          </p>

          <div className="mt-8">
            <GetStartedButton trackLabel="benefits_desktop" />
          </div>
        </div>

        <img
          src={mentorship_vector}
          alt=""
          className="absolute -bottom-[3rem] left-0 w-full z-0 block"
        />
      </section>

      {/* ================= SECTION 8 — WHAT YOU'LL GET (Mobile) ================= */}
      <section className="flex md:hidden relative bg-evolve-lavender-indigo overflow-hidden min-h-screen flex-col items-center justify-center">
        <div
          className="relative z-10 flex flex-col items-center text-center px-5"
          style={{ paddingBottom: "clamp(100px, 32vw, 160px)" }}
        >
          <h2
            className="font-extrabold text-evolve-yellow"
            style={{
              fontSize: "clamp(40px, 12vw, 56px)",
              lineHeight: "1.05",
              letterSpacing: "-0.03em"
            }}
          >
            {COPY.whatYoullGet.heading}
          </h2>

          <p
            className="font-normal text-white"
            style={{
              fontSize: "clamp(16px, 4.5vw, 22px)",
              lineHeight: "1.4",
              marginTop: "clamp(16px, 5vw, 28px)",
              maxWidth: "36ch"
            }}
          >
            {COPY.whatYoullGet.body}
          </p>

          <div className="mt-6">
            <GetStartedButton trackLabel="benefits_mobile" mobile />
          </div>
        </div>

        <img
          src={mentorship_vector_mobile}
          alt=""
          className="absolute bottom-0 left-0 w-full z-0 block"
        />
      </section>
    </div>
  );
};

export default PortfolioReview;
