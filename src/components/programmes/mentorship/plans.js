// Shared plan definitions for the in-profile individual mentorship flow —
// used by both the landing page's pricing cards and the pricing modal, so
// price/label/feature copy only ever lives in one place. Distinct from the
// old batch-based starter/accelerator plans still used by the public
// /mentorship marketing page + Payment.jsx (untouched, separate flow).
export const PLANS = {
  core: {
    key: "core",
    label: "Core mentorship",
    price: "₹10,000",
    tagline: "One-time · full 5-session programme",
    desc: "The full 5-session programme with Yagnesh, plus the option to book extra 1:1 calls whenever you need more time.",
    features: [
      "5 live 1:1 sessions with Yagnesh",
      "Session recordings + notes after every call",
      "Resource shelf tailored to your goals",
      "Book a call anytime — paid top-ups if required"
    ]
  },
  application_support: {
    key: "application_support",
    label: "Mentorship + application support",
    price: "₹15,000",
    tagline: "One-time · 5 sessions + 6 application calls",
    desc: "Everything in core mentorship, plus 6 extra calls — 2 per job application — so you're not applying alone.",
    features: [
      "5 live 1:1 sessions with Yagnesh",
      "6 calls · 2 calls per job application",
      "Session recordings + notes after every call",
      "Resource shelf tailored to your goals",
      "Book a call anytime — paid top-ups if required"
    ],
    featured: true,
    badge: "Most support"
  }
};

export const PLAN_ORDER = ["core", "application_support"];
