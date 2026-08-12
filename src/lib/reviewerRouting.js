// Routes a Portfolio Review booking to the right reviewer's Calendly link
// based on the learner's stream (see src/pages/Onboarding/questions.js for
// where `stream` is captured — DISCIPLINE_VALUES).
//
// TODO: no per-reviewer Calendly links exist yet — every stream points at
// the same shared link below. Once real reviewers are assigned per stream,
// swap the individual values here; call sites already key off `stream` so
// no other code needs to change.
const CALENDLY_URL = "https://calendly.com/evolvedesignacademy/portfolioreview";

export const CALENDLY_URL_BY_STREAM = {
  "UX": CALENDLY_URL,
  "UI": CALENDLY_URL,
  "Product Design": CALENDLY_URL,
  "Fashion Design": CALENDLY_URL,
  "Textile Design": CALENDLY_URL,
  "Film & Animation": CALENDLY_URL,
  "Visual Communication Design": CALENDLY_URL,
  "Graphic Design": CALENDLY_URL,
  "Architecture": CALENDLY_URL,
  "Interior Design": CALENDLY_URL,
  "Ceramic Design": CALENDLY_URL,
  "Photography Design": CALENDLY_URL
};

export function getCalendlyUrlForStream(stream) {
  return CALENDLY_URL_BY_STREAM[stream] || CALENDLY_URL;
}

export { CALENDLY_URL };
