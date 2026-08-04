import { useState } from "react";
import SEO from "../components/SEO";
import { portfolioReview as COPY } from "../content";
import { renderWithBreaks } from "../utils/renderWithBreaks";
import ShareYourWorkButton from "../components/ShareYourWorkButton";
import { trackPortfolioReviewCta } from "../utils/analytics";
import {
  right_eye_ribbon,
  left_eye_ribbon,
  right_eye_ribbon_mobile,
  left_eye_ribbon_mobile,
  mentorship_vector,
  mentorship_vector_mobile
} from "../assets/images/Mentorship";

// Community portfolio review steps (institution page steps live in content.js)
const STEPS = [
  {
    q: "step 1: create your account",
    a: "we need the basics to reach you with your feedback. name, email, that's it. no lengthy forms."
  },
  {
    q: "step 2: share your portfolio",
    a: "drop a link or upload your work. behance, figma, notion, your own site. whatever you've got, we'll take it."
  },
  {
    q: "step 3: tell us more",
    a: "share the kind of design roles you're leaning towards. \nand one project you're really proud of - what it was, what you worked on, and how you thought through it. \nwe know putting this into words can feel like a task. \nbut this is honestly the best way for us to understand your work and how you think. No need to over-prepare, just be yourself and keep it real."
  },
  {
    q: "step 4: submit",
    a: "that's it. once you submit, we take it from here."
  }
];

/* ─────────────────────────────────────────────
   PortfolioReview
───────────────────────────────────────────── */
const PortfolioReview = () => {
  const [openStep, setOpenStep] = useState(null);

  return (
    <div>
      <SEO
        title={COPY.seo.title}
        description={COPY.seo.description}
        path="/community/portfolio-review"
      />

      {/* ================= SECTION 1 — HERO (Desktop) ================= */}
      <section className="hidden md:flex relative min-h-[120vh] bg-evolve-yellow overflow flex-col items-center">
        {/* Content — centered top */}
        <div
          className="relative z-10 flex flex-col items-center text-center"
          style={{
            paddingTop: "clamp(64px, 16vh, 120px)",
            paddingLeft: "clamp(32px, 6vw, 120px)",
            paddingRight: "clamp(32px, 6vw, 120px)"
          }}
        >
          {/* Heading */}
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

          {/* Body text */}
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

          {/* CTA — ShareYourWorkButton not needed for now, changed to text
          <div className="mt-8">
            <ShareYourWorkButton
              to="/community/portfolio-review/form"
              onClick={() => trackPortfolioReviewCta("hero_desktop")}
            />
          </div> */}
          <p
            className="font-extrabold text-black mt-8"
            style={{
              fontSize: "clamp(18px, 2vw, 28px)",
              letterSpacing: "-0.02em"
            }}
          >
            coming soon
            {/* → */}
          </p>
        </div>

        {/* Ribbons — bottom corners */}
        <img
          src={right_eye_ribbon}
          alt=""
          className="absolute bottom-[0rem] right-0 z-10 w-[55%]"
        />
        <img
          src={left_eye_ribbon}
          alt=""
          className="absolute bottom-[0rem] -left-[0.65rem] z-20 w-[53%]"
        />
      </section>

      {/* ================= SECTION 1 — HERO (Mobile) ================= */}
      <section className="flex md:hidden relative bg-evolve-yellow overflow-hidden min-h-screen flex-col">
        {/* Content */}
        <div
          className="relative z-30 flex flex-col items-center text-center px-5"
          style={{ paddingTop: "clamp(64px, 14vh, 100px)" }}
        >
          {/* Heading */}
          <h1
            className="font-extrabold text-evolve-pink"
            style={{
              fontSize: "clamp(36px, 10vw, 52px)",
              lineHeight: "1.05",
              letterSpacing: "-0.03em"
            }}
          >
            {renderWithBreaks(COPY.hero.heading)}
          </h1>

          {/* Body text */}
          <p
            className="font-normal text-black mt-4"
            style={{
              fontSize: "clamp(16px, 4.5vw, 22px)",
              lineHeight: "1.5",
              letterSpacing: "-0.2px",
              maxWidth: "86vw"
            }}
          >
            {COPY.hero.body}
          </p>

          {/* CTA — ShareYourWorkButton not needed for now, changed to text
          <div className="mt-6">
            <ShareYourWorkButton
              to="/community/portfolio-review/form"
              onClick={() => trackPortfolioReviewCta("hero_mobile")}
            />
          </div> */}
          <p
            className="font-extrabold text-black mt-6"
            style={{ fontSize: "18px", letterSpacing: "-0.02em" }}
          >
            coming soon
            {/* → */}
          </p>
        </div>

        {/* Ribbons — bottom corners, mobile variants */}
        <img
          src={right_eye_ribbon_mobile}
          alt=""
          className="absolute bottom-[0rem] right-0 z-20 w-full"
        />
        <img
          src={left_eye_ribbon_mobile}
          alt=""
          className="absolute bottom-[0rem] left-0 z-10 w-auto"
        />
      </section>

      {/* ================= SECTION 2 — HOW IT WORKS (Desktop) ================= */}
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
            className="font-extrabold text-black"
            style={{
              fontSize: "clamp(64px, 7vw, 96px)",
              lineHeight: "1.05",
              letterSpacing: "-0.53px"
            }}
          >
            {renderWithBreaks(COPY.howItWorks.heading)}
          </h2>
        </div>

        {/* Right 65% — accordion */}
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
                    className="font-semibold text-black"
                    style={{
                      fontSize: "34px",
                      letterSpacing: "-0.02em",
                      lineHeight: "1.2"
                    }}
                  >
                    {item.q}
                  </span>
                </div>

                {/* Always visible */}
                <p
                  className="font-normal text-black"
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

      {/* ================= SECTION 2 — HOW IT WORKS (Mobile) ================= */}
      <section
        className="block md:hidden bg-evolve-yellow"
        style={{
          padding: "clamp(40px, 10vw, 64px) 20px clamp(48px, 10vw, 72px)"
        }}
      >
        <h2
          className="font-extrabold text-black"
          style={{
            fontSize: "clamp(40px, 12vw, 56px)",
            lineHeight: "1.05",
            letterSpacing: "-0.53px",
            marginBottom: "clamp(28px, 7vw, 40px)"
          }}
        >
          How it
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
                  className="font-semibold text-black"
                  style={{
                    fontSize: "clamp(17px, 5vw, 22px)",
                    letterSpacing: "-0.02em",
                    lineHeight: "1.2"
                  }}
                >
                  {item.q}
                </span>
              </div>

              {/* Always visible */}
              <p
                className="font-normal text-black"
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

      {/* ================= SECTION 3 — WHAT YOU'LL GET (Desktop) ================= */}
      <section className="hidden md:flex relative bg-evolve-lavender-indigo overflow-hidden flex-col items-center justify-center min-h-screen">
        <div
          className="relative z-10 flex flex-col items-center text-center max-w-[50%] px-8"
          style={{ paddingBottom: "clamp(120px, 18vh, 200px)" }}
        >
          {/* Heading */}
          <h2
            className="font-extrabold text-evolve-yellow"
            style={{
              fontSize: "clamp(72px, 6vw, 128px)",
              lineHeight: "0.9",
              letterSpacing: "-0.03em"
            }}
          >
            What you'll get
          </h2>

          {/* Body */}
          <p
            className="font-normal text-white"
            style={{
              fontSize: "clamp(20px, 2vw, 32px)",
              lineHeight: "1.2",
              marginTop: "clamp(24px, 3vh, 40px)",
              maxWidth: "60ch"
            }}
          >
            A personalised review within 5–7 working days. we'll cover what's
            working, what isn't, how you're positioning yourself, and what to
            fix before you send this to a studio or client.
          </p>

          {/* CTA — ShareYourWorkButton not needed for now, changed to text
          <div className="mt-8">
            <ShareYourWorkButton
              to="/community/portfolio-review/form"
              onClick={() => trackPortfolioReviewCta("benefits_desktop")}
            />
          </div> */}
          <p
            className="font-extrabold text-evolve-yellow mt-8"
            style={{
              fontSize: "clamp(18px, 2vw, 28px)",
              letterSpacing: "-0.02em"
            }}
          >
            coming soon
            {/* → */}
          </p>
        </div>

        {/* Bottom vector — full width */}
        <img
          src={mentorship_vector}
          alt=""
          className="absolute -bottom-[3rem] left-0 w-full z-0 block"
        />
      </section>

      {/* ================= SECTION 3 — WHAT YOU'LL GET (Mobile) ================= */}
      <section className="flex md:hidden relative bg-evolve-lavender-indigo overflow-hidden min-h-screen flex-col items-center justify-center">
        <div
          className="relative z-10 flex flex-col items-center text-center px-5"
          style={{ paddingBottom: "clamp(100px, 32vw, 160px)" }}
        >
          {/* Heading */}
          <h2
            className="font-extrabold text-evolve-yellow"
            style={{
              fontSize: "clamp(44px, 12vw, 64px)",
              lineHeight: "1.05",
              letterSpacing: "-0.03em"
            }}
          >
            what you'll get
          </h2>

          {/* Body */}
          <p
            className="font-normal text-white"
            style={{
              fontSize: "clamp(16px, 4.5vw, 22px)",
              lineHeight: "1.4",
              marginTop: "clamp(16px, 5vw, 28px)",
              maxWidth: "36ch"
            }}
          >
            a personalised review within 5–7 working days. we'll cover what's
            working, what isn't, how you're positioning yourself, and what to
            fix before you send this to a studio or client.
          </p>

          {/* CTA — ShareYourWorkButton not needed for now, changed to text
          <div className="mt-6">
            <ShareYourWorkButton
              to="/community/portfolio-review/form"
              onClick={() => trackPortfolioReviewCta("benefits_mobile")}
            />
          </div> */}
          <p
            className="font-extrabold text-evolve-yellow mt-6"
            style={{ fontSize: "18px", letterSpacing: "-0.02em" }}
          >
            coming soon
            {/* → */}
          </p>
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

export default PortfolioReview;
