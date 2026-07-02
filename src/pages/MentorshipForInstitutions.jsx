import { useState, useRef } from "react";
import SEO from "../components/SEO";
import {
  right_eye_ribbon,
  left_eye_ribbon,
  right_eye_ribbon_1,
  left_eye_ribbon_1,
  right_eye_ribbon_mobile,
  left_eye_ribbon_mobile,
  hero_mentorship,
  hero_mentorship_mobile,
  how_button,
  how_button_hover,
  vector_portfolio,
  vector_portfolio_mobile,
  outcomes_mentorship_ins,
  outcomes_mentorship_ins_mobile,
  mentorship_vector,
  mentorship_vector_mobile
} from "../assets/images/Mentorship";
import { rays_webinars, rays_webinars_mobile } from "../assets/images/Webinars";

const STEPS = [
  {
    q: "step 1: Self-Discovery & Profile Mapping",
    a: "students complete a guided self-assessment to understand their skills, interests, and working style."
  },
  {
    q: "step 2:  Understanding the Industry",
    a: "learn how different design roles, companies, and work environments differ from product to agency, B2B to B2C, specialist to generalist."
  },
  {
    q: "step 3:  Finding the Right Niche",
    a: "industry mentors help students connect their strengths to suitable career paths and company types."
  },
  {
    q: "step 4:  Portfolio & Career Readiness",
    a: "Students receive guidance on their resume, portfolio, and professional profile, with personalised feedback to prepare for applications."
  }
];

const GET_IN_TOUCH_URL =
  "https://wa.me/919227123007?text=Hi%2C%20I%27m%20interested%20in%20the%20Find%20Your%20Niche%20Programme";

/* ─────────────────────────────────────────────
   MentorshipForInstitutions
───────────────────────────────────────────── */
const MentorshipForInstitutions = () => {
  const [howHover, setHowHover] = useState(false);
  const howItWorksRef = useRef(null);

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div>
      <SEO
        title="Find Your Niche Programme — Mentorship for design institutions"
        description="A structured 4-day mentorship programme that helps students understand their strengths, identify the right design roles and companies, and build the clarity needed before internships and placements."
        path="/for-institutes/find-your-niche-programme"
      />

      {/* ================= SECTION 1 — HERO (Desktop) ================= */}
      <section className="hidden md:flex relative min-h-[125vh] bg-evolve-yellow overflow-hidden flex-col items-center">
        {/* Rays background — lowest layer */}
        <img
          src={rays_webinars}
          alt=""
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ zIndex: 0 }}
        />

        {/* Content — above everything */}
        <div
          className="relative flex flex-col items-center text-center"
          style={{
            zIndex: 30,
            paddingTop: "clamp(64px, 16vh, 120px)",
            paddingLeft: "clamp(32px, 6vw, 120px)",
            paddingRight: "clamp(32px, 6vw, 120px)"
          }}
        >
          {/* Heading */}
          <h1
            className="font-extrabold lowercase text-evolve-pink"
            style={{
              fontSize: "clamp(56px, 7vw, 96px)",
              lineHeight: "0.9",
              letterSpacing: "-0.03em"
            }}
          >
            find your niche
            <br />
            programme
          </h1>

          {/* Body text */}
          <p
            className="font-normal lowercase text-black mt-6"
            style={{
              fontSize: "clamp(18px, 2.2vw, 32px)",
              lineHeight: "1.45",
              letterSpacing: "-0.3px",
              maxWidth: "60vw"
            }}
          >
            helping students discover where they belong in design.
          </p>

          {/* CTA */}
          <div className="mt-8 flex flex-col items-center gap-4">
            <a
              href={GET_IN_TOUCH_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-extrabold lowercase flex items-center gap-3 px-8 py-4 rounded-2xl transition-opacity duration-150 hover:opacity-90"
              style={{
                backgroundColor: "#000",
                color: "var(--color-evolve-yellow, #FFD007)",
                border: "2px solid var(--color-evolve-yellow, #FFD007)",
                boxShadow: "4px 4px 0 0 #BF9C05",
                fontSize: "clamp(16px, 1vw, 22px)"
              }}
            >
              <span>get in touch</span>
              <span style={{ fontSize: "1.1em" }}>→</span>
            </a>
          </div>
        </div>

        {/* vector_portfolio — above rays, below hero_mentorship */}
        <img
          src={vector_portfolio}
          alt=""
          className="absolute bottom-0 left-0 w-full pointer-events-none"
          style={{ zIndex: 5 }}
        />

        {/* hero_mentorship — above vector, below ribbons */}
        <img
          src={hero_mentorship}
          alt=""
          className="absolute bottom-0 left-0 w-full pointer-events-none"
          style={{ zIndex: 8 }}
        />

        {/* Ribbons — bottom corners */}
        {/* <img
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
        /> */}
      </section>

      {/* ================= SECTION 1 — HERO (Mobile) ================= */}
      <section className="flex md:hidden relative bg-evolve-yellow overflow-hidden min-h-screen flex-col">
        {/* Rays background — lowest layer */}
        <img
          src={rays_webinars_mobile}
          alt=""
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ zIndex: 0 }}
        />

        {/* Content — above everything */}
        <div
          className="relative flex flex-col items-center text-center px-5"
          style={{
            zIndex: 30,
            paddingTop: "clamp(64px, 14vh, 100px)"
          }}
        >
          {/* Heading */}
          <h1
            className="font-extrabold lowercase text-evolve-pink"
            style={{
              fontSize: "clamp(36px, 10vw, 52px)",
              lineHeight: "1.05",
              letterSpacing: "-0.03em"
            }}
          >
            find your niche programme
          </h1>

          {/* Body text */}
          <p
            className="font-normal lowercase text-black mt-4"
            style={{
              fontSize: "clamp(16px, 4.5vw, 22px)",
              lineHeight: "1.5",
              letterSpacing: "-0.2px",
              maxWidth: "86vw"
            }}
          >
            helping students discover where they belong in design.
          </p>

          {/* CTA */}
          <div className="mt-6 flex flex-col items-center gap-4">
            <a
              href={GET_IN_TOUCH_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-extrabold lowercase flex items-center gap-3 px-7 py-4 rounded-2xl transition-opacity active:opacity-70"
              style={{
                backgroundColor: "#000",
                color: "var(--color-evolve-yellow, #FFD007)",
                border: "2px solid var(--color-evolve-yellow, #FFD007)",
                boxShadow: "4px 4px 0 0 #BF9C05",
                fontSize: "18px"
              }}
            >
              <span>get in touch</span>
              <span style={{ fontSize: "1.1em" }}>→</span>
            </a>
          </div>
        </div>

        {/* vector_portfolio_mobile — above rays, below hero */}
        <img
          src={vector_portfolio_mobile}
          alt=""
          className="absolute bottom-0 left-0 w-full pointer-events-none"
          style={{ zIndex: 5 }}
        />

        {/* hero_mentorship_mobile — above vector, below ribbons */}
        <img
          src={hero_mentorship_mobile}
          alt=""
          className="absolute bottom-0 left-0 w-full pointer-events-none"
          style={{ zIndex: 8 }}
        />

        {/* Ribbons */}
        {/* <img
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
        /> */}
      </section>

      {/* ================= SECTION 2 — CTA (like mentorship section 2) ================= */}
      <section className="relative min-h-screen bg-evolve-yellow overflow-hidden">
        <div
          className="absolute inset-x-0 z-30 flex flex-col items-center text-center px-6"
          style={{ top: "20%" }}
        >
          <p
            className="text-black font-normal lowercase"
            style={{
              fontSize: "clamp(22px, 3.2vw, 48px)",
              lineHeight: "1.35",
              maxWidth: "75%"
            }}
          >
            a structured 4-day mentorship programme that helps students
            understand their strengths, identify the right design roles and
            companies, and build the clarity needed before internships,
            placements, and their first job.
          </p>
          <div className="flex flex-col items-center mt-10 gap-6">
            <img
              src={howHover ? how_button_hover : how_button}
              alt="see how it works"
              onMouseEnter={() => setHowHover(true)}
              onMouseLeave={() => setHowHover(false)}
              onClick={() => scrollTo(howItWorksRef)}
              className="cursor-pointer transition-opacity duration-150"
              style={{ width: "clamp(180px, 22vw, 220px)" }}
            />
          </div>
        </div>
      </section>

      {/* ================= SECTION 3 — OUTCOMES ================= */}
      <div className="hidden md:block w-full">
        <img
          src={outcomes_mentorship_ins}
          alt="programme outcomes"
          className="w-full h-auto block"
        />
      </div>
      <div className="block md:hidden w-full">
        <img
          src={outcomes_mentorship_ins_mobile}
          alt="programme outcomes"
          className="w-full h-auto block"
        />
      </div>

      {/* ================= SECTION 4 — BUILT AROUND REAL INDUSTRY EXPERIENCE (Desktop) ================= */}
      {/* Like section 8 of Mentorship, no marquee, no CTA */}
      <section className="hidden md:flex relative min-h-screen bg-evolve-yellow overflow-hidden flex-col items-center">
        {/* Content — centered top */}
        <div
          className="relative z-10 flex flex-col items-center text-center"
          style={{
            paddingTop: "clamp(64px, 8vh, 120px)",
            paddingLeft: "clamp(32px, 6vw, 120px)",
            paddingRight: "clamp(32px, 6vw, 120px)",
            paddingBottom: "clamp(120px, 18vh, 200px)"
          }}
        >
          {/* Heading */}
          <h2
            className="font-extrabold lowercase text-evolve-pink"
            style={{
              fontSize: "clamp(40px, 5.5vw, 80px)",
              lineHeight: "1",
              letterSpacing: "-0.03em"
            }}
          >
            built around
            <br />
            real industry experience
          </h2>

          {/* Body text */}
          <p
            className="font-normal lowercase text-black mt-6"
            style={{
              fontSize: "clamp(18px, 2.2vw, 32px)",
              lineHeight: "1.45",
              letterSpacing: "-0.3px",
              maxWidth: "70vw"
            }}
          >
            every cohort is mentored by working designers who actively hire,
            build products, and work with clients, not just teach design.
            through evolve&apos;s dedicated portal, every student receives a
            structured, personalised journey from self-discovery to career
            readiness.
          </p>
        </div>

        {/* Ribbons — bottom corners */}
        <img
          src={right_eye_ribbon}
          alt=""
          className="absolute bottom-0 right-0 z-10 w-[45%]"
        />
        <img
          src={left_eye_ribbon}
          alt=""
          className="absolute bottom-0 left-0 z-20 w-[45%]"
        />
      </section>

      {/* ================= SECTION 4 — BUILT AROUND REAL INDUSTRY EXPERIENCE (Mobile) ================= */}
      <section className="block md:hidden relative bg-evolve-yellow overflow-hidden min-h-screen">
        {/* Content */}
        <div
          className="relative z-30 flex flex-col items-center text-center px-5"
          style={{
            paddingTop: "clamp(48px, 10vh, 80px)",
            paddingBottom: "clamp(120px, 32vw, 200px)"
          }}
        >
          {/* Heading */}
          <h2
            className="font-extrabold lowercase text-evolve-pink"
            style={{
              fontSize: "clamp(36px, 10vw, 52px)",
              lineHeight: "1.05",
              letterSpacing: "-0.03em"
            }}
          >
            built around real industry experience
          </h2>

          {/* Body text */}
          <p
            className="font-normal lowercase text-black mt-4"
            style={{
              fontSize: "clamp(16px, 4.5vw, 22px)",
              lineHeight: "1.5",
              letterSpacing: "-0.2px",
              maxWidth: "86vw"
            }}
          >
            every cohort is mentored by working designers who actively hire,
            build products, and work with clients, not just teach design.
            through evolve&apos;s dedicated portal, every student receives a
            structured, personalised journey from self-discovery to career
            readiness.
          </p>
        </div>

        {/* Ribbons */}
        <img
          src={right_eye_ribbon_mobile}
          alt=""
          className="absolute bottom-0 right-0 z-20 w-full"
        />
        <img
          src={left_eye_ribbon_mobile}
          alt=""
          className="absolute bottom-0 left-0 z-10 w-auto"
        />
      </section>

      {/* scroll anchor for how it works */}
      <div ref={howItWorksRef} />

      {/* ================= SECTION 5 — HOW IT WORKS (Desktop) ================= */}
      <section className="hidden md:flex bg-evolve-yellow min-h-screen">
        {/* Left 35% — heading */}
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
            className="font-extrabold lowercase text-black"
            style={{
              fontSize: "clamp(64px, 7vw, 96px)",
              lineHeight: "1.05",
              letterSpacing: "-0.53px"
            }}
          >
            how it
            <br />
            works.
          </h2>
        </div>

        {/* Right 65% — steps */}
        <div
          className="flex-1 flex items-center"
          style={{
            paddingRight: "clamp(40px, 5vw, 80px)",
            paddingTop: "clamp(48px, 6vh, 80px)",
            paddingBottom: "clamp(48px, 6vh, 80px)"
          }}
        >
          <div className="w-full">
            {STEPS.map((item, i) => (
              <div key={i}>
                <div
                  className="flex items-start justify-between"
                  style={{
                    paddingTop: "clamp(20px, 4vh, 32px)",
                    paddingBottom: "clamp(12px, 2vh, 20px)"
                  }}
                >
                  <span
                    className="font-semibold lowercase text-black"
                    style={{
                      fontSize: "34px",
                      letterSpacing: "-0.02em",
                      lineHeight: "1.2"
                    }}
                  >
                    {item.q}
                  </span>
                </div>

                <p
                  className="font-normal lowercase text-black"
                  style={{
                    fontSize: "29px",
                    lineHeight: "1.4",
                    letterSpacing: "-0.02em",
                    paddingBottom: "clamp(20px, 2.5vh, 32px)",
                    whiteSpace: "pre-line"
                  }}
                >
                  {item.a}
                </p>

                {i !== STEPS.length - 1 && (
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

      {/* ================= SECTION 5 — HOW IT WORKS (Mobile) ================= */}
      <section
        className="block md:hidden bg-evolve-yellow"
        style={{
          padding: "clamp(40px, 10vw, 64px) 20px clamp(48px, 10vw, 72px)"
        }}
      >
        <h2
          className="font-extrabold lowercase text-black"
          style={{
            fontSize: "clamp(40px, 12vw, 56px)",
            lineHeight: "1.05",
            letterSpacing: "-0.53px",
            marginBottom: "clamp(28px, 7vw, 40px)"
          }}
        >
          how it
          <br />
          works.
        </h2>
        <div className="w-full">
          {STEPS.map((item, i) => (
            <div key={i}>
              <div
                className="flex items-start justify-between"
                style={{ paddingTop: "20px", paddingBottom: "10px" }}
              >
                <span
                  className="font-semibold lowercase text-black"
                  style={{
                    fontSize: "clamp(17px, 5vw, 22px)",
                    letterSpacing: "-0.02em",
                    lineHeight: "1.2"
                  }}
                >
                  {item.q}
                </span>
              </div>

              <p
                className="font-normal lowercase text-black"
                style={{
                  fontSize: "clamp(15px, 4.5vw, 19px)",
                  lineHeight: "1.4",
                  letterSpacing: "-0.02em",
                  paddingBottom: "20px",
                  whiteSpace: "pre-line"
                }}
              >
                {item.a}
              </p>

              {i !== STEPS.length - 1 && (
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

      {/* ================= SECTION 6 — BRING THE PROGRAMME (Desktop) ================= */}
      <section className="hidden md:flex relative bg-evolve-lavender-indigo overflow-hidden flex-col items-center justify-center min-h-screen">
        <div
          className="relative z-10 flex flex-col items-center text-center max-w-[50%] px-8"
          style={{ paddingBottom: "clamp(120px, 18vh, 200px)" }}
        >
          {/* Heading */}
          <h2
            className="font-extrabold lowercase text-evolve-yellow"
            style={{
              fontSize: "clamp(56px, 4.8vw, 96px)",
              lineHeight: "1",
              letterSpacing: "-0.03em"
            }}
          >
            bring the programme
            <br />
            to your institution
          </h2>

          {/* Body */}
          <p
            className="font-normal lowercase text-white"
            style={{
              fontSize: "clamp(20px, 2vw, 32px)",
              lineHeight: "1.2",
              marginTop: "clamp(24px, 3vh, 40px)",
              maxWidth: "60ch"
            }}
          >
            help students discover the design path that&apos;s right for them
            before they begin applying for internships and placements.
          </p>

          {/* CTA Button */}
          <div className="mt-8">
            <a
              href={GET_IN_TOUCH_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-extrabold lowercase flex items-center gap-3 px-7 py-4 rounded-2xl transition-opacity duration-150 hover:opacity-90"
              style={{
                backgroundColor: "#000",
                color: "var(--color-evolve-yellow, #FFD007)",
                border: "2px solid var(--color-evolve-yellow, #FFD007)",
                boxShadow: "4px 4px 0 0 #BF9C05",
                fontSize: "clamp(16px, 1.4vw, 22px)"
              }}
            >
              <span>get in touch</span>
              <span style={{ fontSize: "1.1em" }}>→</span>
            </a>
          </div>
        </div>

        {/* Bottom vector — full width */}
        <img
          src={mentorship_vector}
          alt=""
          className="absolute -bottom-[3rem] left-0 w-full z-0 block"
        />
      </section>

      {/* ================= SECTION 6 — BRING THE PROGRAMME (Mobile) ================= */}
      <section className="flex md:hidden relative bg-evolve-lavender-indigo overflow-hidden min-h-screen flex-col items-center justify-center">
        <div
          className="relative z-10 flex flex-col items-center text-center px-5"
          style={{ paddingBottom: "clamp(100px, 32vw, 160px)" }}
        >
          {/* Heading */}
          <h2
            className="font-extrabold lowercase text-evolve-yellow"
            style={{
              fontSize: "clamp(36px, 8vw, 52px)",
              lineHeight: "1.05",
              letterSpacing: "-0.03em"
            }}
          >
            bring the programme
            <br />
            to your institution
          </h2>

          {/* Body */}
          <p
            className="font-normal lowercase text-white"
            style={{
              fontSize: "clamp(16px, 4.5vw, 22px)",
              lineHeight: "1.4",
              marginTop: "clamp(16px, 5vw, 28px)",
              maxWidth: "36ch"
            }}
          >
            help students discover the design path that&apos;s right for them
            before they begin applying for internships and placements.
          </p>

          {/* CTA Button */}
          <div className="mt-6">
            <a
              href={GET_IN_TOUCH_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-extrabold lowercase flex items-center gap-3 px-7 py-4 rounded-2xl transition-opacity active:opacity-70"
              style={{
                backgroundColor: "#000",
                color: "var(--color-evolve-yellow, #FFD007)",
                border: "2px solid var(--color-evolve-yellow, #FFD007)",
                boxShadow: "4px 4px 0 0 #BF9C05",
                fontSize: "18px"
              }}
            >
              <span>get in touch</span>
              <span style={{ fontSize: "1.1em" }}>→</span>
            </a>
          </div>
        </div>

        {/* Bottom vector — full width */}
        <img
          src={mentorship_vector_mobile}
          alt=""
          className="absolute bottom-0 left-0 w-full z-0 block"
        />
      </section>
    </div>
  );
};

export default MentorshipForInstitutions;
