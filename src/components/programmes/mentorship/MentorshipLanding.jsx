import { mentor_yagnesh } from "../../../assets/images/Mentorship";
import ProcessSteps from "../ProcessSteps";
import { PLANS, PLAN_ORDER } from "./plans";

const PROCESS = [
  {
    title: "Discover",
    body: "Meet your mentor, understand how the program works, and start mapping your design skills through a guided self-assessment sheet."
  },
  {
    title: "Analyse",
    body: "Unpack your strengths and gaps — where you're solid, where you freeze, and how you actually approach a brief today."
  },
  {
    title: "Identify & build",
    body: "Narrow the scope, then start building — a focused portfolio and resume, shaped with ongoing support."
  },
  {
    title: "Feedback",
    body: "Review applications and interviews together, sharpening your pitch and your portfolio side by side."
  },
  {
    title: "Apply",
    body: "Apply to real roles with a strategy behind every move — mock interviews, offer review, and someone in your corner."
  }
];

const TESTIMONIALS = [
  {
    quote:
      "I finally understood why my portfolio wasn't landing interviews — it was the story, not the work.",
    role: "Past mentee, UX design"
  },
  {
    quote:
      "Having someone actually review my resume line by line changed how I talk about my own work.",
    role: "Past mentee, graphic design"
  },
  {
    quote:
      "Five sessions doesn't sound like a lot. It was enough to completely shift my direction.",
    role: "Past mentee, product design"
  }
];

// Answer copy isn't part of the source design (only questions were shown,
// collapsed) — written fresh to match the site's tone; safe to tune later.
// Exported so the post-enrollment workspace's FAQ panel can reuse the same
// three questions instead of duplicating them.
export const FAQ = [
  [
    "How can I join the sessions?",
    "You'll get a calendar link to book each session as it opens up — sessions run over a live video call."
  ],
  [
    "Will I get the recording after each session?",
    "Yes — every session is recorded, and the recording plus notes land in your workspace shortly after each call."
  ],
  [
    "How do I reach my mentor between sessions?",
    "You can message your mentor directly between sessions for quick questions — it's part of the programme."
  ]
];

function Chip({ children }) {
  return (
    <span className="text-xs font-semibold px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-white/70">
      {children}
    </span>
  );
}

/**
 * The in-profile Mentorship programme's landing/pricing page — hero through
 * FAQ. Copy here is deliberately separate from src/content.js's `mentorship`
 * export (consumed by the public /mentorship marketing page, which stays on
 * the old batch-based starter/accelerator plans) since the mentor bio,
 * testimonials, FAQ and pricing all differ for this individual-mentorship
 * flow. No outer page chrome of its own — dropped into MentorshipProgramme's
 * pane, same pattern as PortfolioReviewProgramme.
 */
export default function MentorshipLanding({ onBack, onSelectPlan }) {
  return (
    <div className="flex flex-col gap-14">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm font-semibold w-fit transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path
              d="M12.5 15L7.5 10L12.5 5"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          back to programmes
        </button>
      )}

      {/* hero */}
      <div>
        <p className="text-white/30 text-[11px] font-bold uppercase tracking-[0.16em] mb-3">
          programme
        </p>
        <h1
          className="text-white font-bold font-bricolage"
          style={{ fontSize: "clamp(30px,5vw,44px)", letterSpacing: "-0.02em" }}
        >
          Mentorship
        </h1>
        <p className="text-white/50 text-[15px] leading-relaxed mt-4 max-w-xl">
          Personalised mentorship to define your design career — with a real
          resume, a portfolio built for you, and someone in your corner until
          you land.
        </p>
        <div className="flex flex-wrap gap-2 mt-5">
          <Chip>1:1 personalised</Chip>
          <Chip>5 sessions</Chip>
          <Chip>A dedicated team lead</Chip>
        </div>
        <button
          onClick={() =>
            document.getElementById("mt-pricing")?.scrollIntoView({ behavior: "smooth" })
          }
          className="mt-6 bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl px-6 py-3.5 active:opacity-80"
        >
          Explore plans
        </button>
      </div>

      {/* what this solves */}
      <div>
        <p className="text-white/30 text-[11px] font-bold uppercase tracking-[0.16em] mb-4">
          what this solves
        </p>
        <div
          className="rounded-2xl border border-white/10 px-6 py-5 flex flex-col gap-3"
          style={{
            background: "linear-gradient(90deg, rgba(255,208,7,0.05), transparent 60%)",
            borderLeft: "3px solid #FFD007"
          }}
        >
          <p className="text-white font-semibold text-sm leading-relaxed">
            Most designers don't know how to design — they're better knowing
            the amount of work or how to get a job than how to position
            themselves for it.
          </p>
          <p className="text-white/60 text-sm leading-relaxed">
            This program helps you get started and apply with clarity — five
            sessions, one mentor, and a plan you actually follow through on.
          </p>
        </div>
      </div>

      {/* the process */}
      <div>
        <p className="text-white/30 text-[11px] font-bold uppercase tracking-[0.16em] mb-2">
          the process
        </p>
        <h2 className="text-white font-bold font-bricolage text-xl mb-2">
          A structured mentorship
        </h2>
        <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-xl">
          Built around one idea: guidance from someone who actually makes
          hiring and design decisions, delivered one step at a time.
        </p>
        <ProcessSteps steps={PROCESS} prefix />
      </div>

      {/* mentor spotlight */}
      <div>
        <p className="text-white/30 text-[11px] font-bold uppercase tracking-[0.16em] mb-4">
          who's guiding you
        </p>
        <div className="rounded-2xl border border-white/10 overflow-hidden flex flex-col sm:flex-row">
          <div className="sm:w-[160px] flex-shrink-0 bg-white/[0.03]">
            <img
              src={mentor_yagnesh}
              alt="Yagnesh Ahir"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="p-6 flex flex-col gap-2.5">
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-wide">
              your mentor
            </p>
            <h3 className="text-evolve-yellow font-bold font-bricolage text-2xl">
              Yagnesh Ahir
            </h3>
            <p className="text-white/60 text-sm font-semibold">
              Founder, Paperclip Design · Founder, evolve · Design Coach,
              byStadium · Visiting Faculty, NID
            </p>
            <p className="text-white/40 text-sm leading-relaxed">
              With 18+ years of experience across more than 20 domains,
              Yagnesh builds intuitive, user-friendly experiences for SaaS
              companies. He runs Paperclip Design, a design studio in
              Ahmedabad — where he also sits on the other side of the table,
              hiring designers and building teams. He's mentored 100+
              designers so far.
            </p>
          </div>
        </div>
      </div>

      {/* testimonials */}
      <div>
        <p className="text-white/30 text-[11px] font-bold uppercase tracking-[0.16em] mb-4">
          what mentees said
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.role}
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-5 flex flex-col gap-3"
            >
              <p className="text-white/70 text-sm leading-relaxed">
                "{t.quote}"
              </p>
              <p className="text-evolve-yellow text-xs font-bold">
                — {t.role}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* pricing */}
      <div id="mt-pricing">
        <p className="text-white/30 text-[11px] font-bold uppercase tracking-[0.16em] mb-2">
          pricing
        </p>
        <h2 className="text-white font-bold font-bricolage text-xl mb-5">
          Pick the plan that fits where you are
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PLAN_ORDER.map((key) => {
            const p = PLANS[key];
            return (
              <div
                key={p.key}
                className="relative rounded-2xl border px-6 py-6 flex flex-col gap-3"
                style={
                  p.featured
                    ? {
                        borderColor: "#FFD007",
                        background:
                          "linear-gradient(180deg, rgba(255,208,7,0.06), transparent 55%)"
                      }
                    : { borderColor: "rgba(255,255,255,0.1)" }
                }
              >
                {p.badge && (
                  <span className="absolute top-5 right-5 text-[10px] font-bold uppercase tracking-wide text-evolve-yellow border border-evolve-yellow/50 rounded-full px-2.5 py-1">
                    {p.badge}
                  </span>
                )}
                <p className="text-white/40 text-xs uppercase tracking-wide font-semibold">
                  {p.label}
                </p>
                <span className="text-white font-bold text-3xl">
                  {p.price}
                </span>
                <p className="text-white/30 text-xs">{p.tagline}</p>
                <p className="text-white/50 text-sm">{p.desc}</p>
                <ul className="flex flex-col gap-1.5 mt-1">
                  {p.features.map((f) => (
                    <li
                      key={f}
                      className="text-white/50 text-xs flex items-center gap-2"
                    >
                      <span className="w-1 h-1 rounded-full bg-white/30 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => onSelectPlan(p.key)}
                  className={`mt-2 text-center font-bold text-sm rounded-2xl py-3.5 active:opacity-80 ${
                    p.featured
                      ? "bg-evolve-yellow text-evolve-black"
                      : "border border-white/20 text-white"
                  }`}
                >
                  Get started
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-white font-bold font-bricolage text-xl mb-4">
          Good to know
        </h2>
        <div className="rounded-2xl border border-white/10 divide-y divide-white/10 overflow-hidden">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group px-5 py-4">
              <summary className="text-white text-sm font-semibold cursor-pointer list-none flex items-center justify-between gap-4">
                {q}
                <span className="text-white/30 group-open:rotate-45 transition-transform text-lg leading-none">
                  +
                </span>
              </summary>
              <p className="text-white/40 text-sm mt-2.5 leading-relaxed">
                {a}
              </p>
            </details>
          ))}
        </div>
      </div>

      {/* sticky enrol bar */}
      <div className="sticky bottom-0 -mx-6 md:-mx-8 border-t border-white/10 bg-[#1c1c1f]/95 backdrop-blur px-6 md:px-8 py-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-white font-bold text-sm">Evolve mentorship</p>
          <p className="text-white/30 text-xs">
            Personalised 1:1 sessions tailored to your need
          </p>
        </div>
        <button
          onClick={() =>
            document.getElementById("mt-pricing")?.scrollIntoView({ behavior: "smooth" })
          }
          className="bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl px-6 py-3 active:opacity-80 flex-shrink-0"
        >
          Get started →
        </button>
      </div>
    </div>
  );
}
