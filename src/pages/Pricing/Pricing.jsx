import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MotionConfig, motion } from "framer-motion";
import SEO from "../../components/SEO";
import { right_arrow_yellow } from "../../assets/images/Home_images";
import { useAuth } from "../../hooks/useAuth";
import { useMembership } from "../../components/membership/MembershipProvider";
import { ITEM_PRICES, PLAN_PRICES, inr, tierFor } from "../../lib/membership";

const CARD_BG = "#FFDC47";

// ids match the tiers in lib/membership.js (PLAN_PRICES / tierFor)
const TIERS = [
  { id: "student", title: "Students" },
  { id: "pro", title: "Professionals" }
];

const PLAN_FEATURES = [
  "evolve verified profile & public page",
  "All events, community and webinars",
  "All past sessions",
  "10% off mentorship"
];

// Free-membership item prices are the same for every tier.
const FREE_PLAN = {
  title: "Free Membership",
  price: inr(0),
  suffix: "to start",
  note: "Start with a 30-day free trial, then choose the plan that works for you.",
  items: [
    { label: "Daily news, microlearning & quizzes", value: "Free", free: true },
    { label: "Community events", value: inr(ITEM_PRICES.COMMUNITY) },
    { label: "Webinars", value: inr(ITEM_PRICES.WEBINAR) },
    { label: "Past sessions", value: inr(ITEM_PRICES.RECORDING) },
    { label: "Portfolio review", value: inr(ITEM_PRICES.REVIEW) },
    {
      label: "Mentorship programme",
      value: inr(ITEM_PRICES.MENTOR_MIN),
      sub: "onwards"
    },
    { label: "Verified profile", value: "Plan only" }
  ]
};

// `id` is the plan name the checkout API expects ("monthly" | "annual").
const BILLING = [
  { id: "monthly", label: "Monthly" },
  { id: "annual", label: "Annually" }
];

function planDetails(tier, plan) {
  const { monthly, annual } = PLAN_PRICES[tier];
  const isAnnual = plan === "annual";
  return {
    price: inr(isAnnual ? annual : monthly),
    suffix: isAnnual
      ? `/ year · ${inr(annual / 12)} a month`
      : "/ month · cancel anytime",
    badge: isAnnual ? "20% Off" : null,
    features: [
      ...PLAN_FEATURES.map((label) => ({ label, included: true })),
      isAnnual
        ? { label: "1 free portfolio review", included: true }
        : {
            label: "1 free portfolio review",
            sub: "(free for annual plan)",
            included: false
          }
    ]
  };
}

const EASE = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } }
};

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 flex-none" aria-hidden="true">
    <circle cx="12" cy="12" r="12" fill="#159A2E" />
    <path
      d="M7 12.5l3.2 3.2L17 9"
      fill="none"
      stroke="#fff"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CrossIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 flex-none" aria-hidden="true">
    <circle cx="12" cy="12" r="12" fill="#E8577A" />
    <path
      d="M8.5 8.5l7 7M15.5 8.5l-7 7"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const PlanButton = ({ label, mobileLabel, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full inline-flex items-center justify-center gap-2 rounded-[10px] bg-evolve-black text-evolve-yellow font-bold py-3 md:py-[clamp(10px,0.9vw,16px)] shadow-[4px_4px_0px_#806804] transition-transform duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#806804] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
    style={{ fontSize: "clamp(16px, 1.05vw, 20px)" }}
  >
    <span className="md:hidden">{mobileLabel}</span>
    <span className="hidden md:inline">{label}</span>
    <img src={right_arrow_yellow} alt="" className="w-4 h-4" />
  </button>
);

// Title + price block. The note slot keeps a fixed height on desktop so the
// dividers line up across all three cards.
const CardHeader = ({ title, price, suffix, note, toggle }) => (
  <div>
    <h2
      className="font-bold text-evolve-black"
      style={{
        fontSize: "clamp(28px, 2.1vw, 40px)",
        lineHeight: 1.1,
        letterSpacing: "-0.01em"
      }}
    >
      {title}
    </h2>
    {toggle}
    <div
      className={`${toggle ? "mt-8 md:mt-[clamp(24px,2.4vw,48px)]" : "mt-14 md:mt-[clamp(48px,4.6vw,88px)]"} flex items-end flex-wrap gap-x-3 gap-y-1`}
    >
      <span
        className="font-extrabold text-evolve-black"
        style={{
          fontSize: "clamp(56px, 4.4vw, 84px)",
          lineHeight: 0.9,
          letterSpacing: "-0.04em"
        }}
      >
        {price}
      </span>
      <span
        className="text-evolve-black pb-1"
        style={{ fontSize: "clamp(14px, 1.05vw, 20px)" }}
      >
        {suffix}
      </span>
    </div>
    <p
      className={`text-evolve-black ${note ? "mt-6 md:mt-[clamp(20px,1.8vw,32px)]" : "hidden md:block md:mt-[clamp(20px,1.8vw,32px)]"} md:min-h-[1.5em]`}
      style={{ fontSize: "clamp(14px, 1.05vw, 20px)", lineHeight: 1.5 }}
    >
      {note}
    </p>
  </div>
);

const Card = ({ badge, children }) => (
  <motion.article
    variants={fadeUp}
    className="relative flex flex-col border border-black rounded-[16px] md:rounded-[clamp(14px,1vw,20px)] px-6 pt-10 pb-12 md:px-[clamp(24px,2.4vw,48px)] md:pt-[clamp(32px,2.6vw,52px)] md:pb-[clamp(40px,3.6vw,72px)]"
    style={{ backgroundColor: CARD_BG }}
  >
    {badge && (
      <span
        className="absolute -top-4 right-6 md:right-[clamp(24px,2vw,40px)] rounded-[10px] bg-evolve-pink text-evolve-yellow font-extrabold px-4 py-1 border border-evolve-yellow"
        style={{ fontSize: "clamp(18px, 1.35vw, 26px)", lineHeight: 1.2 }}
      >
        {badge}
      </span>
    )}
    {children}
  </motion.article>
);

const Divider = () => (
  <hr className="my-8 md:my-[clamp(24px,2vw,40px)] border-0 border-t border-black/20" />
);

const listTextStyle = {
  fontSize: "clamp(15px, 1.05vw, 20px)",
  lineHeight: 1.3
};

const FreeCard = ({ plan, cta, onSelect }) => (
  <Card>
    <CardHeader {...plan} />
    <Divider />
    <ul className="flex flex-col gap-6 md:gap-[clamp(16px,1.4vw,28px)]">
      {plan.items.map((item) => (
        <li key={item.label} className="flex items-start justify-between gap-4">
          <span
            className="font-semibold text-evolve-black max-w-[60%] md:max-w-[clamp(140px,10vw,200px)]"
            style={listTextStyle}
          >
            {item.label}
          </span>
          <span
            className={`font-bold text-right ${item.free ? "text-[#159A2E]" : "text-evolve-pink"}`}
            style={listTextStyle}
          >
            {item.value}
            {item.sub && (
              <span className="block font-semibold text-[0.7em] leading-none">
                {item.sub}
              </span>
            )}
          </span>
        </li>
      ))}
    </ul>
    <div className="mt-12 md:mt-auto md:pt-[clamp(32px,3vw,60px)]">
      <PlanButton
        label={cta.label}
        mobileLabel={cta.mobileLabel}
        onClick={onSelect}
      />
    </div>
  </Card>
);

const BillingToggle = ({ id, value, onChange }) => (
  <div
    role="tablist"
    aria-label="Billing period"
    className="mt-6 md:mt-[clamp(20px,1.8vw,36px)] grid grid-cols-2 rounded-[10px] md:rounded-[clamp(10px,0.7vw,14px)] bg-evolve-yellow p-1.5 md:p-[clamp(4px,0.4vw,8px)] w-full max-w-[260px] md:max-w-[clamp(240px,19vw,380px)]"
  >
    {BILLING.map((b) => {
      const active = value === b.id;
      return (
        <button
          key={b.id}
          type="button"
          role="tab"
          aria-selected={active}
          onClick={() => onChange(b.id)}
          className={`relative rounded-[8px] md:rounded-[clamp(8px,0.55vw,12px)] py-2 md:py-[clamp(6px,0.55vw,10px)] font-medium transition-colors duration-200 ${active ? "text-white" : "text-[#806804] hover:text-evolve-black"}`}
          style={{ fontSize: "clamp(14px, 1.05vw, 20px)" }}
        >
          {active && (
            <motion.span
              layoutId={`billing-pill-${id}`}
              className="absolute inset-0 rounded-[inherit] bg-evolve-pink"
              transition={{ duration: 0.3, ease: EASE }}
            />
          )}
          <span className="relative">{b.label}</span>
        </button>
      );
    })}
  </div>
);

const TierCard = ({ tier, plan, onPlanChange, cta, onSelect }) => {
  const details = planDetails(tier.id, plan);

  return (
    <Card badge={details.badge}>
      <CardHeader
        title={tier.title}
        price={details.price}
        suffix={details.suffix}
        toggle={
          <BillingToggle id={tier.id} value={plan} onChange={onPlanChange} />
        }
      />
      <Divider />
      <ul className="flex flex-col gap-7 md:gap-[clamp(18px,1.6vw,32px)]">
        {details.features.map((feature) => (
          <li key={feature.label} className="flex items-start gap-5">
            {feature.included ? <CheckIcon /> : <CrossIcon />}
            <span
              className="font-semibold text-evolve-black max-w-[220px] md:max-w-[clamp(180px,11.5vw,230px)]"
              style={listTextStyle}
            >
              {feature.label}
              {feature.sub && (
                <span className="block mt-1 font-normal text-[0.7em]">
                  {feature.sub}
                </span>
              )}
              <span className="sr-only">
                {feature.included ? " (included)" : " (not included)"}
              </span>
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-24 md:mt-auto md:pt-[clamp(32px,3vw,60px)]">
        <PlanButton
          label={cta.label}
          mobileLabel={cta.mobileLabel}
          onClick={onSelect}
        />
      </div>
    </Card>
  );
};

const PLAN_IDS = ["monthly", "annual"];
const TIER_IDS = TIERS.map((t) => t.id);

const Pricing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, authLoading } = useAuth();
  const { access, pay, openPlans } = useMembership();
  const userTier = user ? tierFor(user) : null;

  // ?tier=&plan= is set when a signed-out visitor picks a plan; they come
  // back here after sign-in and checkout picks up where they left off
  const params = new URLSearchParams(location.search);
  const resumeTier = TIER_IDS.includes(params.get("tier"))
    ? params.get("tier")
    : null;
  const resumePlan = PLAN_IDS.includes(params.get("plan"))
    ? params.get("plan")
    : null;

  // billing period picked on each tier card
  const [plans, setPlans] = useState(() => ({
    student: "annual",
    pro: "annual",
    ...(resumeTier && resumePlan ? { [resumeTier]: resumePlan } : {})
  }));

  // Same checkout as inside the app (MembershipProvider). The server prices
  // a plan by tierFor(user), so the student price needs a student ID first —
  // the in-app plans sheet handles that upload before subscribing.
  const subscribe = (tier, plan) => {
    if (!user) {
      const from = `/pricing?tier=${tier}&plan=${plan}`;
      sessionStorage.setItem("signin_from", from);
      navigate("/signin", { state: { from } });
      return;
    }
    if (tier === "student" && userTier !== "student") openPlans(2);
    else pay({ kind: "plan", plan });
  };

  const resumed = useRef(false);
  useEffect(() => {
    if (authLoading || !user || !resumeTier || !resumePlan || resumed.current)
      return;
    resumed.current = true;
    navigate("/pricing", { replace: true });
    subscribe(resumeTier, resumePlan);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, resumeTier, resumePlan]);

  const freeCta = { label: "Continue", mobileLabel: "Continue" };
  const planCta = (plan) =>
    access.mode === "sub" && access.plan === plan
      ? { label: "Extend plan", mobileLabel: "Extend plan" }
      : { label: "Subscribe", mobileLabel: "Get Started" };

  return (
    <MotionConfig reducedMotion="user">
      <SEO
        title="Pricing | Evolve"
        description="Pick your plan and continue evolving. Start with a free membership, or subscribe monthly or annually for full access to evolve."
        path="/pricing"
      />
      <main className="w-full overflow-x-hidden bg-evolve-yellow">
        <section className="px-4 md:px-[3.2vw] pt-28 pb-20 md:pt-[clamp(140px,11vw,220px)] md:pb-[clamp(80px,8vw,160px)]">
          <motion.div
            className="max-w-[1800px] mx-auto"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.h1
              variants={fadeUp}
              className="text-center font-extrabold text-evolve-pink"
              style={{
                fontSize: "clamp(56px, 6.2vw, 120px)",
                lineHeight: 1,
                letterSpacing: "-0.05em"
              }}
            >
              Pricing
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-3 md:mt-[clamp(16px,1.4vw,28px)] mx-auto max-w-[280px] md:max-w-none text-center font-medium text-evolve-black"
              style={{ fontSize: "clamp(22px, 1.6vw, 30px)", lineHeight: 1.3 }}
            >
              Start with a 30-day free trial, then choose the plan that works
              for you.
            </motion.p>

            <motion.div
              variants={{ show: { transition: { staggerChildren: 0.1 } } }}
              className="mt-12 md:mt-[clamp(56px,5.6vw,108px)] grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-[clamp(20px,2.2vw,44px)]"
            >
              <FreeCard
                plan={FREE_PLAN}
                cta={freeCta}
                onSelect={() => navigate(user ? "/app/profile" : "/signin")}
              />
              {TIERS.map((tier) => (
                <TierCard
                  key={tier.id}
                  tier={tier}
                  plan={plans[tier.id]}
                  onPlanChange={(plan) =>
                    setPlans((prev) => ({ ...prev, [tier.id]: plan }))
                  }
                  cta={planCta(plans[tier.id])}
                  onSelect={() => subscribe(tier.id, plans[tier.id])}
                />
              ))}
            </motion.div>
          </motion.div>
        </section>
      </main>
    </MotionConfig>
  );
};

export default Pricing;
