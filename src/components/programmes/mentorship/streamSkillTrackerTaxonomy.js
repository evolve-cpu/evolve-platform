// The "Stream skill tracker" taxonomy — filled before Session 2, rated
// after session 1 and tracked through session 5 (per the source design).
// Deliberately generic/stream-agnostic for now (no per-stream wording was
// provided) — same 4-category, 12-skill list for every stream until
// stream-specific copy exists. `id` is what ratings are keyed by in
// mentorship_stream_skill_tracker.ratings (JSONB) — never rename an
// existing id, only add new ones.
export const STREAM_SKILL_CATEGORIES = [
  {
    heading: "Craft Depth",
    skills: [
      { id: "core_technique_mastery", label: "Core Technique Mastery" },
      { id: "attention_to_detail", label: "Attention to Detail" },
      { id: "consistency_across_work", label: "Consistency Across Work" }
    ]
  },
  {
    heading: "Industry Tools",
    skills: [
      { id: "specialized_software_proficiency", label: "Specialized Software Proficiency" },
      { id: "workflow_efficiency", label: "Workflow Efficiency" },
      { id: "file_handoff_documentation", label: "File Handoff & Documentation" }
    ]
  },
  {
    heading: "Specialization Techniques",
    skills: [
      { id: "domain_specific_methods", label: "Domain-Specific Methods" },
      { id: "applied_problem_solving", label: "Applied Problem Solving" },
      { id: "stream_specific_constraints", label: "Working with Stream-Specific Constraints" }
    ]
  },
  {
    heading: "Portfolio for Your Stream",
    skills: [
      { id: "case_study_depth", label: "Case Study Depth" },
      { id: "process_documentation", label: "Process Documentation" },
      { id: "outcome_impact_storytelling", label: "Outcome & Impact Storytelling" }
    ]
  }
];
