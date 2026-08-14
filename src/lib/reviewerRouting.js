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

export function getCalendlyUrlForStream(stream) {
  const text = (stream || "").trim().toLowerCase();
  if (!text) return CALENDLY_URL;
  const isArchitectureOrSpace = ARCHITECTURE_SPACE_KEYWORDS.some((kw) =>
    text.includes(kw)
  );
  return isArchitectureOrSpace ? CALENDLY_URL_ARCHITECTURE_SPACE : CALENDLY_URL;
}

export { CALENDLY_URL, CALENDLY_URL_ARCHITECTURE_SPACE };
