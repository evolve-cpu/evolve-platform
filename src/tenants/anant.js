const anant = {
  id: "anant",
  name: "Anant National University",
  displayName: "anant × evolve",

  brevoInProgressTemplateId: Number(
    import.meta.env.VITE_ANANT_BREVO_IN_PROGRESS_TEMPLATE_ID ||
      import.meta.env.VITE_BREVO_PORTFOLIO_IN_PROGRESS_TEMPLATE_ID
  ),
  brevoCompletionTemplateId: Number(
    import.meta.env.VITE_ANANT_BREVO_PORTFOLIO_TEMPLATE_ID ||
      import.meta.env.VITE_BREVO_PORTFOLIO_TEMPLATE_ID
  ),

  adminPinEnvKey: "VITE_ANANT_ADMIN_PIN",

  formFields: {
    showCourse: true,
    showBatch: true,
  },

  portfolio: {
    successHeading: "submitted!",
    successBody:
      "your portfolio is with the evolve team. we'll review it and get back to you with personalised feedback within 5–7 working days — straight to your inbox.",
    pendingHeading: "already submitted.",
    pendingBody:
      "we have your portfolio. sit tight — feedback is on its way within 5–7 working days.",
    doneHeading: "your review is ready.",
    doneBody: "your personalised feedback report is available below.",
    backLabel: "back to home",
    backPath: "/",
  },
};

export default anant;
