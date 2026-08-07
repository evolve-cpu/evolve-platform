import { Link } from "react-router-dom";
import { mentor_yagnesh } from "../../assets/images/Mentorship";
import ProcessSteps from "./ProcessSteps";

const FRAMEWORK = [
  { title: "Discover", body: "Getting to know you, your interests, motivations, and how you currently approach design." },
  { title: "Analyse", body: "Identifying your strengths and gaps, and mapping where you want to take things." },
  { title: "Identify & approach", body: "Shortlisting the companies and roles that fit you, with a strategy to approach and apply." },
  { title: "Build & apply", body: "Building a targeted portfolio and resume, prepping for interviews, and applying — with ongoing support." }
];

const PLANS = [
  {
    key: "starter",
    label: "Starter",
    price: "₹15,000",
    original: "₹35,000",
    desc: "For those who want to find a niche and get started.",
    features: ["5 personalised 1:1 sessions", "A resume & portfolio review", "Targeted company & role shortlist", "Plus a surprise gift"]
  },
  {
    key: "accelerator",
    label: "Accelerator",
    price: "₹35,000",
    original: "₹50,000",
    desc: "For those who want to find a niche and accelerate the outcome.",
    features: ["Everything in Starter", "Mock 1:1 interviews", "Hands-on portfolio building", "Dedicated assignment support"],
    featured: true
  }
];

const FAQ = [
  ["Who is this for?", "Design majors, recent grads, career switchers, and mid-level designers — anyone feeling unsure about finding clarity in their design career."],
  ["How long does the mentorship run?", "The programme runs across 5 personalised 1:1 sessions, typically weekly, though the pace can flex since it's individual."],
  ["Is this a batch or a cohort?", "No. This is a fully individual, 1:1 personalised mentorship — everything is built around you, not a group."]
];

function Chip({ children }) {
  return (
    <span className="text-xs font-semibold px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-white/70">
      {children}
    </span>
  );
}

/**
 * The full Mentorship programme page — hero through FAQ. Deliberately has no
 * outer page chrome of its own so it can be dropped into any layout: the
 * standalone /programmes/mentorship route wraps it in a "back to profile"
 * bar, and the profile dashboard drops it into the right-hand content pane,
 * next to the persistent sidebar, via `onBack` — same pattern as
 * PortfolioReviewProgramme.
 */
export default function MentorshipProgramme({ onBack }) {
  return (
    <div className="flex flex-col gap-14">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm font-semibold w-fit transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          back to programmes
        </button>
      )}

      {/* hero */}
      <div>
        <p className="text-white/30 text-[11px] font-bold uppercase tracking-[0.16em] mb-3">programme</p>
        <h1 className="text-white font-bold" style={{ fontSize: "clamp(30px,5vw,44px)", letterSpacing: "-0.02em" }}>
          Mentorship
        </h1>
        <p className="text-white/50 text-[15px] leading-relaxed mt-4 max-w-xl">
          Stop guessing your design career. Personalised 1:1 mentorship to define it — with a real resume, a
          shortlist of roles built for you, and someone in your corner until you land.
        </p>
        <div className="flex flex-wrap gap-2 mt-5">
          <Chip>1:1 personalised</Chip>
          <Chip>4 stages</Chip>
          <Chip>5 sessions</Chip>
        </div>
        <button
          onClick={() => document.getElementById("mt-pricing")?.scrollIntoView({ behavior: "smooth" })}
          className="mt-6 bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl px-6 py-3.5 active:opacity-80"
        >
          see what it costs
        </button>
      </div>

      {/* why we built this */}
      <div>
        <h2 className="text-white font-bold text-xl mb-4">why we built this</h2>
        <div
          className="rounded-2xl border border-white/10 px-6 py-5 flex flex-col gap-3"
          style={{ background: "linear-gradient(90deg, rgba(255,208,7,0.05), transparent 60%)", borderLeft: "3px solid #FFD007" }}
        >
          <p className="text-white/70 text-sm leading-relaxed">
            Most designers know how to design — what's harder is knowing which roles fit, how to position
            yourself, and where to even start.
          </p>
          <p className="text-white/70 text-sm leading-relaxed">
            This is 1:1 direction: the gap isn't skill, it's direction. We build the plan around you, not a
            batch.
          </p>
        </div>
      </div>

      {/* mentor spotlight */}
      <div>
        <p className="text-white/30 text-[11px] font-bold uppercase tracking-[0.16em] mb-4">who's guiding you</p>
        <div className="rounded-2xl border border-white/10 overflow-hidden flex flex-col sm:flex-row">
          <div className="sm:w-[160px] flex-shrink-0 bg-white/[0.03]">
            <img src={mentor_yagnesh} alt="Yagnesh Ahir" className="w-full h-full object-cover object-top" />
          </div>
          <div className="p-6 flex flex-col gap-2.5">
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-wide">your mentor</p>
            <h3 className="text-evolve-yellow font-bold text-2xl">Yagnesh Ahir</h3>
            <p className="text-white/60 text-sm font-semibold">
              Founder, Paperclip Design · Founder, evolve · Design Coach, byStadium
            </p>
            <p className="text-white/40 text-sm leading-relaxed">
              Years spent building products, improving UX, and sitting on the other side of hiring decisions
              — he knows what gets designers noticed and what quietly eliminates them. No noise, no fluff.
              Just clarity on who you are, where you fit, and exactly how to get there.
            </p>
          </div>
        </div>
      </div>

      {/* framework */}
      <div>
        <h2 className="text-white font-bold text-xl mb-2">our framework</h2>
        <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-xl">
          Four stages across five 1:1 sessions — moving you from <b className="text-white">who am I as a
          designer</b> to <b className="text-white">where do I fit</b> to <b className="text-white">a plan
          you're already acting on</b>.
        </p>
        <ProcessSteps steps={FRAMEWORK} />
      </div>

      {/* pricing */}
      <div id="mt-pricing">
        <h2 className="text-white font-bold text-xl mb-2">pricing</h2>
        <p className="text-white/40 text-sm mb-5">
          Two ways in, both fully 1:1 and personalised to you. Pick where you want to start.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PLANS.map((p) => (
            <div
              key={p.key}
              className="relative rounded-2xl border px-6 py-6 flex flex-col gap-3"
              style={
                p.featured
                  ? { borderColor: "#FFD007", background: "linear-gradient(180deg, rgba(255,208,7,0.06), transparent 55%)" }
                  : { borderColor: "rgba(255,255,255,0.1)" }
              }
            >
              {p.featured && (
                <span className="absolute top-5 right-5 text-[10px] font-bold uppercase tracking-wide text-evolve-yellow border border-evolve-yellow/50 rounded-full px-2.5 py-1">
                  most support
                </span>
              )}
              <p className="text-white/40 text-xs uppercase tracking-wide font-semibold">{p.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-white font-bold text-3xl">{p.price}</span>
                <span className="text-white/30 text-xs line-through">{p.original}</span>
              </div>
              <p className="text-white/50 text-sm">{p.desc}</p>
              <ul className="flex flex-col gap-1.5 mt-1">
                {p.features.map((f) => (
                  <li key={f} className="text-white/50 text-xs flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-white/30 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to={`/payment?plan=${p.key}`}
                className={`mt-2 text-center font-bold text-sm rounded-2xl py-3.5 active:opacity-80 ${
                  p.featured ? "bg-evolve-yellow text-evolve-black" : "border border-white/20 text-white"
                }`}
              >
                choose {p.label} →
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-white font-bold text-xl mb-4">good to know</h2>
        <div className="rounded-2xl border border-white/10 divide-y divide-white/10 overflow-hidden">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group px-5 py-4">
              <summary className="text-white text-sm font-semibold cursor-pointer list-none flex items-center justify-between gap-4">
                {q}
                <span className="text-white/30 group-open:rotate-45 transition-transform text-lg leading-none">+</span>
              </summary>
              <p className="text-white/40 text-sm mt-2.5 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* sticky enrol bar */}
      <div className="sticky bottom-0 -mx-6 md:-mx-8 border-t border-white/10 bg-[#1c1c1f]/95 backdrop-blur px-6 md:px-8 py-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-white font-bold text-sm">Mentorship</p>
          <p className="text-white/30 text-xs">from ₹15,000 · 1:1 personalised · 5 sessions</p>
        </div>
        <Link
          to="/payment?plan=starter"
          className="bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl px-6 py-3 active:opacity-80 flex-shrink-0"
        >
          get started →
        </Link>
      </div>
    </div>
  );
}
