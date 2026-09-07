// The fixed "Foundation skill tracker" taxonomy — 8 categories, 46 skills,
// each rated 1-5 on both "current level" and "goal level". Transcribed
// verbatim from the source design. `id` is what ratings are keyed by in
// mentorship_skill_tracker.ratings (JSONB) — never rename an existing id,
// only add new ones, or past submissions become orphaned.
export const SKILL_CATEGORIES = [
  {
    heading: "Design Fundamentals",
    skills: [
      { id: "elements_principles", label: "Elements & Principles of Design" },
      { id: "color_theory", label: "Color Theory" },
      { id: "typography_basics", label: "Typography Basics" },
      { id: "composition_layout", label: "Composition & Layout" },
      { id: "visual_hierarchy", label: "Visual Hierarchy" },
      { id: "freehand_sketching", label: "Freehand Sketching & Drawing" }
    ]
  },
  {
    heading: "Design Thinking & Process",
    skills: [
      {
        id: "design_thinking_framework",
        label: "Design Thinking Framework (Empathize–Define–Ideate–Prototype–Test)"
      },
      { id: "problem_framing", label: "Problem Framing & Reframing" },
      { id: "problem_solving", label: "Problem-Solving & Critical Thinking" },
      { id: "ideation_techniques", label: "Ideation Techniques" },
      { id: "sketching_to_think", label: "Sketching to Think" },
      { id: "prototyping_mindset", label: "Prototyping Mindset" },
      { id: "iteration_testing_mindset", label: "Iteration & Testing Mindset" }
    ]
  },
  {
    heading: "Research & Analysis Basics",
    skills: [
      { id: "observation_skills", label: "Observation Skills" },
      { id: "empathy_audience_understanding", label: "Empathy & Audience Understanding" },
      { id: "basic_user_research", label: "Basic User / Audience Research" },
      { id: "competitive_market_awareness", label: "Competitive & Market Awareness" },
      { id: "synthesizing_information", label: "Synthesizing Information" },
      { id: "asking_good_questions", label: "Asking Good Questions" }
    ]
  },
  {
    heading: "Communication & Storytelling",
    skills: [
      { id: "visual_storytelling", label: "Visual Storytelling" },
      { id: "presenting_ideas_clearly", label: "Presenting Ideas Clearly" },
      { id: "written_communication", label: "Written Communication" },
      { id: "sketchnoting_visual_notes", label: "Sketchnoting / Visual Notes" },
      { id: "giving_receiving_feedback", label: "Giving & Receiving Feedback" }
    ]
  },
  {
    heading: "Collaboration & Professionalism",
    skills: [
      { id: "cross_functional_collaboration", label: "Cross-functional Collaboration" },
      { id: "client_stakeholder_communication", label: "Client / Stakeholder Communication" },
      { id: "time_project_management", label: "Time & Project Management" },
      { id: "working_within_constraints", label: "Working within Constraints & Briefs" },
      { id: "professional_ethics", label: "Professional Ethics" }
    ]
  },
  {
    heading: "Tools & Technical Literacy",
    skills: [
      { id: "core_software_proficiency", label: "Core Software Proficiency (domain-relevant)" },
      { id: "file_organization_version_control", label: "File Organization & Version Control" },
      { id: "basic_digital_literacy", label: "Basic Digital Literacy" },
      { id: "portfolio_presentation_tools", label: "Portfolio Presentation Tools" }
    ]
  },
  {
    heading: "Design Awareness & Culture",
    skills: [
      { id: "design_history_awareness", label: "Design History Awareness" },
      { id: "cultural_contextual_sensitivity", label: "Cultural & Contextual Sensitivity" },
      { id: "sustainability_ethical_design", label: "Sustainability & Ethical Design" },
      { id: "trend_awareness", label: "Trend Awareness" }
    ]
  },
  {
    heading: "Continuous Learning",
    skills: [
      { id: "seeking_feedback_mentorship", label: "Seeking Feedback & Mentorship" },
      { id: "self_reflection", label: "Self-reflection" },
      { id: "networking_design_community", label: "Networking within the Design Community" },
      { id: "staying_updated_industry", label: "Staying Updated with Industry Developments" },
      { id: "building_learning_habit", label: "Building a Learning Habit" },
      { id: "portfolio_building_curation", label: "Portfolio Building & Curation" }
    ]
  }
];

export const SKILL_IDS = SKILL_CATEGORIES.flatMap((c) => c.skills.map((s) => s.id));
