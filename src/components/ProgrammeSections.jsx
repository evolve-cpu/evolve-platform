// Shared sections for the institute programme pages
// (/for-institutes/portfolio-review-programme, /for-institutes/find-your-niche-programme).
// Both pages share the same hero / outcomes / how-it-works shape and only
// swap copy, so the layout lives here once.

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
          {description}
        </p>

        <div className="mt-8 flex items-center gap-6 flex-wrap">
          <button
            onClick={onGetInTouch}
            className="inline-flex items-center justify-center gap-2 bg-evolve-yellow text-evolve-black font-extrabold px-7 py-3.5 text-[16px] hover:opacity-90 transition-opacity"
            style={{ borderRadius: 16, boxShadow: "4px 4px 0 0 #806804" }}
          >
            get in touch <span>→</span>
          </button>

          {onDownloadHandbook && (
            <button
              onClick={onDownloadHandbook}
              className="font-bold text-evolve-yellow text-[16px]"
              style={{
                textDecoration: "underline",
                textDecorationColor: "currentColor",
                textDecorationThickness: "2px"
              }}
            >
              download handbook
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
            <span>{item}</span>
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
        outcomes
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
            label="for students"
            items={forStudents}
            className="md:pr-8"
          />
          <OutcomeColumn
            label="for institutions"
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
                  {item.q}
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
                {item.a}
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
                {item.q}
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
              {item.a}
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
