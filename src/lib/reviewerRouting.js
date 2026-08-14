// Routes a Portfolio Review booking to the right reviewer's Calendly link
// based on the learner's stream. `stream` isn't a closed enum — chips
// suggest DISCIPLINE_VALUES (see src/pages/Onboarding/questions.js) but the
// learner can type anything ("B.Des Interaction Design", "Spatial Design",
// ...), so routing matches on keywords/phrases rather than an exact list.
const CALENDLY_URL = "https://calendly.com/evolvedesignacademy/portfolioreview";
const CALENDLY_URL_ARCHITECTURE_SPACE =
  "https://calendly.com/evolveportfolioreview/30min";

// Every keyword here routes to CALENDLY_URL_ARCHITECTURE_SPACE; anything
// that doesn't match falls back to the default CALENDLY_URL (which already
// covers interaction/visual communication/product design and everything
// else not listed below).
const ARCHITECTURE_SPACE_KEYWORDS = [
  "architecture design",
  "architecture",
  "moving images",
  "space design"
];

function isArchitectureOrSpaceStream(stream) {
  const text = (stream || "").trim().toLowerCase();
  if (!text) return false;
  return ARCHITECTURE_SPACE_KEYWORDS.some((kw) => text.includes(kw));
}

export function getCalendlyUrlForStream(stream) {
  return isArchitectureOrSpaceStream(stream)
    ? CALENDLY_URL_ARCHITECTURE_SPACE
    : CALENDLY_URL;
}

// The shared reviewer roster shown on the Portfolio Review marketing page's
// "the panel" section — also the source for "who's my reviewer" on the
// booking-confirmed screen (see getReviewerForStream below), so the two
// never list different people.
export const REVIEWERS = [
  {
    name: "Yagnesh Ahir",
    years: "18",
    role: "Founder & Design Director, Paperclip Design · Design Coach, byStadium",
    image:
      "https://res.cloudinary.com/diuswhkzn/image/upload/v1785740530/Yagnesh_Ahir_Profile_2025_2_ckdmsn.png"
  },
  {
    name: "Sakshi Patki",
    years: "3",
    role: "Senior Creative Graphic Designer, Paperclip Design · Visual Lead, evolve",
    image:
      "https://res.cloudinary.com/diuswhkzn/image/upload/v1785832940/Frame_1801288229_ryj65z.png"
  },
  {
    name: "Sonam Gandhi",
    years: "5",
    role: "Product Designer, Paperclip Design · Mentor, evolve",
    image:
      "https://res.cloudinary.com/diuswhkzn/image/upload/v1785740530/Group_1801288230_xsbbar.png"
  },
  {
    name: "Paramdeep Singh Dayani",
    years: "8",
    role: "Architect & Production Designer · Founder, Antispace.in",
    image:
      "https://res.cloudinary.com/diuswhkzn/image/upload/v1785740530/param_1_bgprl1.png"
  },
  {
    name: "Anuj Sharma",
    years: "25",
    role: "Fashion Designer · Founder, Button Masala",
    image:
      "https://res.cloudinary.com/diuswhkzn/image/upload/v1785833013/Frame_1801288246_iykxnq.png"
  }
];

// Architecture/moving images/space design streams always go to Param — the
// only reviewer on the roster whose background actually fits. Every other
// stream shares the general design roster (Sonam, Yagnesh, Sakshi, Anuj);
// `seed` (e.g. the learner's user id) picks a stable one so the same person
// keeps showing up for the same booking instead of reshuffling on refresh.
const ARCHITECTURE_SPACE_REVIEWER = REVIEWERS.find(
  (r) => r.name === "Paramdeep Singh Dayani"
);
const GENERAL_REVIEWERS = REVIEWERS.filter(
  (r) => r.name !== "Paramdeep Singh Dayani"
);

function hashSeed(seed) {
  const str = String(seed || "");
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function getReviewerForStream(stream, seed) {
  if (isArchitectureOrSpaceStream(stream)) return ARCHITECTURE_SPACE_REVIEWER;
  const idx = hashSeed(seed) % GENERAL_REVIEWERS.length;
  return GENERAL_REVIEWERS[idx];
}

export { CALENDLY_URL, CALENDLY_URL_ARCHITECTURE_SPACE };
