// Shared sections for the institute programme pages
// (/for-institutes/portfolio-review-programme, /for-institutes/find-your-niche-programme).
// Both pages share the same hero / outcomes / how-it-works shape and only
// swap copy, so the layout lives here once.
import { useId } from "react";
import { right_arrow_icon } from "../assets/images/Nav";
import { preventWidow } from "../utils/preventWidow";

export const ProgrammeHero = ({
  heading,
  subheading,
  description,
  onGetInTouch,
  onDownloadHandbook
}) => (
  <section
    className="w-full flex flex-col"
    style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #161616 0%, #000000 100%)",
      padding:
        "clamp(96px,16vh,150px) clamp(24px,6vw,96px) clamp(56px,8vh,96px)"
    }}
  >
    <div className="flex-1 flex flex-col md:flex-row justify-between md:items-stretch gap-10">
      {/* left — heading, pinned toward the top */}
      <div className="md:self-start md:mt-[6vh]">
        <h1
          className="font-extrabold text-evolve-yellow"
          style={{
            fontSize: "clamp(44px,5vw,64px)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em"
          }}
        >
          {heading}
        </h1>
        <p
          className="text-white mt-4"
          style={{ fontSize: "clamp(20px,1.5vw,24px)" }}
        >
          {subheading}
        </p>
      </div>

      {/* right — description + CTAs, anchored to the bottom */}
      <div className="md:flex-1 md:flex md:flex-col md:justify-end md:items-start md:max-w-[480px] md:ml-auto md:mb-[6vh]">
        <p
          className="text-white/90"
          style={{ fontSize: "clamp(17px,1.3vw,20px)", lineHeight: 1.5 }}
        >
          {preventWidow(description)}
        </p>

        <div className="mt-8 flex items-center gap-6 flex-wrap">
          <button
            onClick={onGetInTouch}
            className="inline-flex items-center justify-center gap-2 bg-evolve-yellow text-evolve-black font-extrabold px-7 py-3.5 text-[16px] hover:opacity-90 transition-opacity"
            style={{ borderRadius: 16, boxShadow: "4px 4px 0 0 #806804" }}
          >
            Get in touch{" "}
            <span>
              <img src={right_arrow_icon} alt="" className="w-6 h-6" />
            </span>
          </button>

          {onDownloadHandbook && (
            <button
              onClick={onDownloadHandbook}
              className="font-bold text-evolve-yellow text-[16px]"
              style={{
                textDecoration: "underline",
                textDecorationColor: "currentColor",
                textDecorationThickness: "1px"
              }}
            >
              Download handbook
            </button>
          )}
        </div>
      </div>
    </div>
  </section>
);

// Short centered dash — the divider glyph used between desktop outcome items.
const Dash = () => (
  <div className="hidden md:flex justify-center my-3">
    <div style={{ width: 28, height: 1, background: "rgba(0,0,0,0.4)" }} />
  </div>
);

const OutcomeColumn = ({ label, items, className = "" }) => (
  <div className={className}>
    <h3
      className="font-extrabold text-evolve-black text-left md:text-center"
      style={{ fontSize: "clamp(18px,1.3vw,20px)" }}
    >
      {label}
    </h3>
    {/* full-width underline under the heading — mobile only */}
    <div className="mt-2 h-px bg-black/25 md:hidden" />
    {/* short centered dash under the heading — desktop only */}
    <Dash />

    <ul className="mt-4 space-y-3 md:space-y-0 md:mt-4">
      {items.map((item, i) => (
        <li key={item}>
          <div
            className="flex items-start gap-2 text-left md:block md:text-center text-evolve-black"
            style={{ fontSize: "clamp(15px,1.05vw,16px)", lineHeight: 1.4 }}
          >
            <span className="md:hidden">•</span>
            <span>{preventWidow(item)}</span>
          </div>
          {i !== items.length - 1 && <Dash />}
        </li>
      ))}
    </ul>
  </div>
);

export const ProgrammeOutcomes = ({ forStudents, forInstitutions }) => (
  <>
    <section
      className="w-full bg-evolve-yellow flex flex-col justify-center"
      style={{
        minHeight: "92vh",
        padding: "clamp(56px,8vh,96px) clamp(24px,6vw,96px)"
      }}
    >
      <h2
        className="font-extrabold text-evolve-black text-left md:text-center"
        style={{ fontSize: "clamp(32px,3.4vw,44px)" }}
      >
        Outcomes
      </h2>

      <div
        className="mt-10 md:mx-auto md:w-full flex flex-col justify-center"
        style={{
          background: "rgba(255,229,110,1)",
          padding: "clamp(28px,4vw,64px)",
          maxWidth: "min(100%, 1040px)",
          minHeight: "clamp(320px, 46vh, 520px)",
          borderRadius: 0
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-0 md:divide-x md:divide-black/20">
          <OutcomeColumn
            label="For students"
            items={forStudents}
            className="md:pr-8"
          />
          <OutcomeColumn
            label="For institutions"
            items={forInstitutions}
            className="md:pl-8"
          />
        </div>
      </div>
    </section>

    {/* light divider marking the end of the outcomes section */}
    <div
      classname="bg-[#806804] w-full"
      style={{
        height: "0.5px"
        // width: "100%"
        // background: "rgba(128,104,4,0.5)"
      }}
    />
  </>
);

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

const ReviewerCard = ({ reviewer }) => (
  <div className="flex flex-col items-start h-full">
    <div
      style={{
        position: "relative",
        width: 28,
        height: 28,
        marginTop: -14,
        marginBottom: "clamp(16px, 2.5vh, 24px)"
      }}
    >
      {/* Outer faded circle */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "rgba(245,197,24,0.53)"
        }}
      />

      {/* Inner solid circle */}
      <div
        style={{
          position: "absolute",
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: "#F5C518",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)"
        }}
      />
    </div>
    <h3
      className="font-extrabold text-evolve-yellow"
      style={{ fontSize: "clamp(17px, 1.3vw, 20px)" }}
    >
      {reviewer.name}
    </h3>
    <p
      className="text-white mt-1"
      style={{ fontSize: "clamp(13px, 0.9vw, 14px)" }}
    >
      (years of experience: {reviewer.years}+)
    </p>
    <p
      className="text-white mt-2 max-w-[90%]"
      style={{ fontSize: "clamp(14px, 1vw, 16px)", lineHeight: 1.4 }}
    >
      {reviewer.role.map((line, i) => (
        <span key={i}>
          {line}
          {i !== reviewer.role.length - 1 && <br />}
        </span>
      ))}
    </p>
    <div className="mt-auto">
      <ReviewerSocials
        name={reviewer.name}
        linkedinUrl={reviewer.linkedinUrl}
        instagramUrl={reviewer.instagramUrl}
      />
    </div>
  </div>
);

export const ProgrammeReviewers = ({
  heading = "Industry experts across multiple disciplines",
  reviewers
}) => (
  <section
    className="w-full"
    style={{
      background: " #161616",
      padding: "clamp(64px,8vh,96px) clamp(24px,6vw,96px)"
    }}
  >
    <h2
      className="font-extrabold text-evolve-yellow text-center"
      style={{ fontSize: "clamp(28px,3.2vw,40px)" }}
    >
      {heading}
    </h2>

    {/* Desktop */}
    <div
      className="hidden md:block"
      style={{ marginTop: "clamp(56px,8vh,88px)" }}
    >
      <div className="grid grid-cols-5 gap-x-6 items-end">
        {reviewers.map((reviewer) => (
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
            height: 1,
            background: "rgba(245,197,24,0.4)"
          }}
        />
        {reviewers.map((reviewer) => (
          <ReviewerCard key={reviewer.name} reviewer={reviewer} />
        ))}
      </div>
    </div>

    {/* Mobile */}
    <div
      className="block md:hidden"
      style={{ marginTop: "clamp(40px,10vw,56px)" }}
    >
      {reviewers.map((reviewer) => (
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
          <div style={{ position: "relative" }}>
            <div
              style={{
                height: 1,
                width: "100%",
                background: "rgba(245,197,24,0.4)"
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 0,
                top: -14,
                width: 28,
                height: 28
              }}
            >
              {/* Outer faded circle */}
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "rgba(245,197,24,0.53)",
                  position: "absolute",
                  top: 0,
                  left: 0
                }}
              />

              {/* Inner solid circle */}
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: "#F5C518",
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)"
                }}
              />
            </div>
          </div>
          <div style={{ paddingTop: "clamp(16px,4vw,24px)" }}>
            <h3
              className="font-extrabold text-evolve-yellow"
              style={{ fontSize: "clamp(19px,5vw,22px)" }}
            >
              {reviewer.name}
            </h3>
            <p
              className="text-white/70 mt-1"
              style={{ fontSize: "clamp(13px,3.6vw,15px)" }}
            >
              (years of experience: {reviewer.years}+)
            </p>
            <p
              className="text-white mt-2"
              style={{ fontSize: "clamp(15px,4vw,17px)", lineHeight: 1.4 }}
            >
              {(reviewer.mobileRole ?? reviewer.role).map((line, i, arr) => (
                <span key={i}>
                  {line}
                  {i !== arr.length - 1 && <br />}
                </span>
              ))}
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
);

export const ProgrammeHowItWorks = ({ steps }) => (
  <>
    {/* Desktop */}
    <section className="hidden md:flex bg-evolve-yellow min-h-screen">
      <div
        className="flex-shrink-0 flex flex-col"
        style={{
          width: "45%",
          paddingTop: "clamp(80px, 10vh, 140px)",
          paddingLeft: "clamp(40px, 5vw, 80px)",
          paddingRight: "clamp(24px, 2vw, 40px)"
        }}
      >
        <h2
          className="font-extrabold text-black"
          style={{
            fontSize: "clamp(64px, 7vw, 96px)",
            lineHeight: 1.05,
            letterSpacing: "-0.53px"
          }}
        >
          how it
          <br />
          works.
        </h2>
      </div>

      {/* paddingTop matches the heading column so the first step lines up
          with "how it works." instead of being vertically centered. */}
      <div
        className="flex-1"
        style={{
          paddingRight: "clamp(40px, 5vw, 80px)",
          paddingTop: "clamp(80px, 10vh, 140px)",
          paddingBottom: "clamp(48px, 6vh, 80px)"
        }}
      >
        <div className="w-[90%]">
          {steps.map((item, i) => (
            <div key={i}>
              <div
                className="flex items-start justify-between"
                style={{
                  paddingTop: i === 0 ? 0 : "clamp(20px, 4vh, 32px)",
                  paddingBottom: "clamp(12px, 2vh, 20px)"
                }}
              >
                <span
                  className="font-semibold text-black"
                  style={{
                    fontSize: "26px",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2
                  }}
                >
                  {preventWidow(item.q)}
                </span>
              </div>
              <p
                className="font-normal text-black"
                style={{
                  fontSize: "18px",
                  lineHeight: 1.4,
                  letterSpacing: "-0.02em",
                  paddingBottom: "clamp(20px, 2.5vh, 32px)"
                }}
              >
                {preventWidow(item.a)}
              </p>
              {i !== steps.length - 1 && (
                <div
                  style={{
                    height: "1px",
                    backgroundColor: "#806804",
                    width: "100%"
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Mobile */}
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
          lineHeight: 1.05,
          letterSpacing: "-0.53px",
          marginBottom: "clamp(28px, 7vw, 40px)"
        }}
      >
        how it
        <br />
        works.
      </h2>
      <div className="w-full">
        {steps.map((item, i) => (
          <div key={i}>
            <div
              className="flex items-start justify-between"
              style={{ paddingTop: 20, paddingBottom: 10 }}
            >
              <span
                className="font-semibold text-black"
                style={{
                  fontSize: "clamp(17px, 5vw, 22px)",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2
                }}
              >
                {preventWidow(item.q)}
              </span>
            </div>
            <p
              className="font-normal text-black"
              style={{
                fontSize: "clamp(15px, 4.5vw, 19px)",
                lineHeight: 1.4,
                letterSpacing: "-0.02em",
                paddingBottom: 20
              }}
            >
              {preventWidow(item.a)}
            </p>
            {i !== steps.length - 1 && (
              <div
                style={{
                  height: "1px",
                  backgroundColor: "#806804",
                  width: "100%"
                }}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  </>
);
