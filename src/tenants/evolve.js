const evolve = {
  id: "evolve",
  name: "evolve",
  displayName: "evolve",

  brevoInProgressTemplateId: Number(
    import.meta.env.VITE_BREVO_PORTFOLIO_IN_PROGRESS_TEMPLATE_ID
  ),
  brevoCompletionTemplateId: Number(
    import.meta.env.VITE_BREVO_PORTFOLIO_TEMPLATE_ID
  ),

  adminPinEnvKey: "VITE_ADMIN_PIN",

  formFields: {
    showCourse: false,
    showBatch: false,
  },

  portfolio: {
    successHeading: "you're in.",
    successBody:
      "your portfolio is with us. we'll review it and get back to you with personalised feedback within 5–7 working days — straight to your inbox.",
    pendingHeading: "already submitted.",
    pendingBody:
      "we already have your portfolio. sit tight — feedback is on its way within 5–7 working days.",
    doneHeading: "your review is in.",
    doneBody: "your personalised feedback report is ready.",
    backLabel: "back to community",
    backPath: "/community",
  },
};

export default evolve;
