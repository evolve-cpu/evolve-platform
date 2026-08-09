// Maps an evolve_portfolio_reviews row onto the 5 user-facing steps shown
// both on the profile page's Portfolio Review card and inside
// PortfolioReviewFlow's own sidebar, so the two never disagree:
//   1. answering intake questions
//   2. sharing your work (resume + portfolio)
//   3. booking a call
//   4. call confirmed
//   5. report ready
const TOTAL_STEPS = 5;

const QUESTION_KEYS = ["q1", "q2", "q3", "q4"];

export function getPortfolioReviewProgress(row) {
  if (!row) return null;

  if (row.review_report_url || row.meet_recording_url) {
    return { step: 5, totalSteps: TOTAL_STEPS, label: "report ready", percent: 100 };
  }

  if (row.review_status === "in_review") {
    return { step: 4, totalSteps: TOTAL_STEPS, label: "call confirmed", percent: 80 };
  }

  if (row.review_status === "pending") {
    return { step: 3, totalSteps: TOTAL_STEPS, label: "booking your call", percent: 60 };
  }

  const answered = QUESTION_KEYS.filter((k) => row[k]?.trim()).length;

  if (answered >= QUESTION_KEYS.length) {
    return { step: 2, totalSteps: TOTAL_STEPS, label: "sharing your work", percent: 40 };
  }

  return {
    step: 1,
    totalSteps: TOTAL_STEPS,
    label: "answering intake questions",
    percent: Math.round((answered / QUESTION_KEYS.length) * 20)
  };
}
