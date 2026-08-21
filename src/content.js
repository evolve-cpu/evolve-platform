// // ============================================================
// //  EVOLVE — SITE COPY
// //
// //  Non-devs: this is the only file you need to edit for text changes.
// //
// //  HOW TO EDIT ON GITHUB:
// //  1. Go to this file on github.com/your-org/your-repo
// //  2. Click the pencil ✏️ icon (top-right of file view)
// //  3. Change the text you want — only edit text inside quotes " "
// //  4. Click "Commit changes" at the bottom → Vercel deploys automatically
// //
// //  RULES — do not break these or the site will error:
// //  • Only change text between the quote marks  " "
// //  • Do NOT rename any keys (the word before the colon)
// //  • Do NOT remove commas, brackets [ ] , or braces { }
// //  • Use \n inside a string to add a line break
// //  • Apostrophes inside text must be escaped:  it\'s  or use "it's" (double quotes)
// // ============================================================

// // ─────────────────────────────────────────────
// //  /mentorship
// // ─────────────────────────────────────────────
// export const mentorship = {
//   seo: {
//     title: "Design mentorship — 1:1 guidance for aspiring designers",
//     description:
//       "Get paired with an industry designer for focused, personal guidance. evolve mentorship helps you find your niche, build your portfolio, and take the next step — on your terms."
//   },

//   hero: {
//     // Mobile headline — single line (no break)
//     headline: "Stop guessing your design career",
//     // Desktop headline — use \n where you want a line break
//     headlineDesktop: "Stop guessing your\ndesign career"
//   },

//   cta: {
//     // Body paragraph in Section 2 (below hero)
//     body: "Personalised mentorship to define your design career, with a real resume, a shortlist of roles built for you, and someone in your corner until you land."
//   },

//   limitedSeatsNote: "*limited seats",

//   mentor: {
//     sectionHeading: "Who's guiding you.",
//     name: "Yagnesh ahir",
//     role: "Founder, Paperclip Design · Founder, evolve · Design Coach, byStadium · Visiting Faculty, NID",
//     bio1: "8 years building products, improving UX for SaaS companies, and sitting on the other side of hiring decisions. He knows what gets designers noticed and what quietly eliminates them.",
//     bio2: "He's mentored 100+ designers. His approach: no noise, no fluff. Just clarity on who you are, where you fit, and exactly how to get there.",
//     linkedinLabel: "view linkedin",
//     linkedinUrl: "https://www.linkedin.com/in/yagnesh-ahir-24676516/"
//   },

//   testimonials: {
//     sectionHeading: "What mentees said!",
//     items: [
//       {
//         quote:
//           "Incredibly friendly from the get-go. He gave really clear and actionable points for me to move ahead in my design career.",
//         name: "Chinmay Zinjal",
//         role: "Chemical Engineering student, IIT Guwahati"
//       },
//       {
//         quote:
//           "Yagnesh gave me wonderful advice on how he approaches UX problems and runs a remote team. I walked away truly feeling inspired and enlightened.",
//         name: "Jon Hwang",
//         role: "Communication coach & UX research consultant"
//       },
//       {
//         quote:
//           "He helped me a lot in understanding my path. I would 10/10 recommend him.",
//         name: "Anish Kumar",
//         role: "Lead Product Designer, Smart Energy Waters"
//       },
//       {
//         quote:
//           "I'm thankful to Yagnesh for his invaluable perspectives. The practical advice he provided on navigating the job search process was truly valuable. His positive outlook on the design industry and his insights on how my background in creative direction can contribute to product design have significantly bolstered my confidence. I eagerly anticipate further sessions with him in the future.",
//         name: "Pradyumna K S",
//         role: "Product Designer, Kraverich"
//       }
//     ]
//   },

//   faqs: [
//     {
//       q: "Who is this for?",
//       a: "Created for anyone starting out in design, transitioning into the field, or building toward more advanced roles."
//     },
//     {
//       q: "How long does the mentorship run?",
//       a: "5 sessions of ~60 minutes each, spread across 2–3 months. The pace is deliberate — space between sessions matters."
//     },
//     {
//       q: "What do I walk away with?",
//       a: "A targeted resume, a structured portfolio, a shortlist of real companies and roles, and interview preparation specific to your goals."
//     },
//     {
//       q: "What happens after the sessions end?",
//       a: "Support doesn't stop. You'll have ongoing access as you apply. We stay in your corner until you land."
//     },
//     {
//       q: "Do I need prior design experience?",
//       a: "No. Freshers are preferred. if you're serious about a design career and willing to put in the work, that's enough to start."
//     }
//     // Commented out for now — may bring back later
//     // {
//     //   q: "how many people are in each batch?",
//     //   a: "maximum 5. this is intentional — small means you actually get attention, not a seat at the back of a room."
//     // }
//   ],

//   pricing: {
//     sectionHeading: "What it costs.",
//     starterCutPrice: "₹ 35,000",
//     starterPrice: "₹ 15,000",
//     starterTaglineDesktop:
//       "For those who wants to find \na niche and get started",
//     starterTaglineMobile: "For those who need a direction on where to start",
//     acceleratorCutPrice: "₹ 50,000",
//     acceleratorPrice: "₹ 35,000",
//     acceleratorTaglineDesktop:
//       "For those who wants to find a niche and accelerate the career",
//     acceleratorTaglineMobile:
//       "For those who have interviews lined up and need to crack it",
//     starterFeatures: [
//       "5 group sessions (~60 min each)",
//       "Personalised resume & portfolio review",
//       "Targeted company & role shortlist",
//       "+",
//       "Surprise gift on check out!"
//     ],
//     acceleratorFeatures: [
//       "Everything in basic",
//       "+",
//       "Mock interviews",
//       "Portfolio building",
//       "Assignment aid",
//       "+",
//       "Surprise gift on check out!"
//     ]
//   },

//   framework: {
//     sectionLabel: "Our framework",
//     // The "X stages / Y sessions" heading — spots count is dynamic (from DB), keep the rest here
//     stagesLine: "4 stages.",
//     sessionsLine: "5 sessions.",
//     sessionTime: "Every thursday 9.30pm IST",

//     // Desktop version — longer body copy
//     stagesDesktop: [
//       {
//         label: "Discover",
//         body: "Getting to know you, your interests, motivations, and how you currently approach design. You'll also gain a deeper understanding of yourself through this process."
//       },
//       {
//         label: "Analyse",
//         body: "Identify your strengths and gaps. Review how you've defined your past experiences and sharpen how you tell your story."
//       },
//       {
//         label: "Identify & Approach",
//         body: "Shortlist real companies and job roles that match who you are. Build a targeted strategy for how to approach and apply, not just where."
//       },
//       {
//         label: "Build & Apply",
//         body: "Create a targeted resume and portfolio for specific job posts. Prepare for interviews. Plus ongoing support as you apply, even after sessions end."
//       }
//     ],

//     // Mobile version — shorter body copy
//     stagesMobile: [
//       {
//         label: "Discover",
//         body: "Understand your interests, motivations, and design approach. Gain clarity on who you are."
//       },
//       {
//         label: "Analyse",
//         body: "Identify strengths and gaps. Refine how you tell your story."
//       },
//       {
//         label: "Identify & Approach",
//         body: "Find roles and companies that fit. Build a focused application strategy."
//       },
//       {
//         label: "Build & Apply",
//         body: "Create a targeted portfolio and resume. Prepare for interviews with ongoing support."
//       }
//     ]
//   },

//   whyWeBuiltThis: {
//     heading: "Why we built this",
//     subheading: "The gap isn't skill. It's direction",
//     body: "Most designers know how to design. What's harder is knowing which roles fit, how to position yourself, and where to even start. That's what this is for."
//   },

//   faqSection: {
//     // Use \n for a line break in the heading
//     heading: "Good\nto know.",
//     contactPrompt: "Have more questions?"
//   },

//   closingCta: {
//     // Use \n for line breaks
//     tagline:
//       "If you're serious about your design career,\nthis is where to start."
//   }
// };

// // ─────────────────────────────────────────────
// //  /webinars
// // ─────────────────────────────────────────────
// export const webinars = {
//   seo: {
//     title: "Design sessions — webinars, workshops & live events by evolve",
//     description:
//       "From live webinars to hands-on workshops and informal design meetups — evolve sessions are where learning gets real. Online and offline, for every stage of your design journey."
//   },

//   hero: {
//     heading: "Evolve\nwebinars"
//     // Desktop subtext (two lines)
//     // subtextDesktop:
//     //   "Learn from people who've been there,\ndone that, and have the work to prove it."
//     // Mobile subtext (single line)
//     // subtextMobile:
//     //   "Learn from people who've been there, done that, and have the work to prove it."
//   },

//   upcomingWebinar: {
//     // Replace "#" with the registration link when ready
//     registrationUrl: "#"
//   },

//   pastSection: {
//     heading: "Past webinars",
//     description:
//       "Real talk from working professionals. Practical takeaways you can use immediately. Every session is recorded, so you never miss out."
//   },

//   // Playlist cards — title uses <br/> for line breaks in the rendered card
//   cards: [
//     {
//       title: "Visual<br/>design",
//       playlistUrl:
//         "https://www.youtube.com/playlist?list=PLRu8x-n5hoiBk41nO_f8tpn0UfUFOEZkA"
//     },
//     {
//       title: "Interaction<br/>design",
//       playlistUrl:
//         "https://www.youtube.com/playlist?list=PLRu8x-n5hoiDuKT-UgO3rGP0260L-XAxX"
//     },
//     {
//       title: "Career<br/>growth",
//       playlistUrl:
//         "https://www.youtube.com/playlist?list=PLRu8x-n5hoiCaCGpLy_LIRDFSWTm2gA66"
//     },
//     {
//       title: "Hobbies",
//       playlistUrl:
//         "https://www.youtube.com/playlist?list=PLRu8x-n5hoiCNf6dl-Cs3RuhrEAFjaIm3"
//     }
//   ]
// };

// // ─────────────────────────────────────────────
// //  /community
// // ─────────────────────────────────────────────
// export const community = {
//   seo: {
//     title: "The evolve community — where the ecosystem comes alive",
//     description:
//       "A global space for designers at every stage — discussions, challenges, AMAs, book clubs, and more. The community is where everything you learn on evolve gets tested, shared, and built upon."
//   },

//   hero: {
//     heading: "Evolve \ncommunity",
//     subtext: "An inner circle built for creators.",
//     // WhatsApp / join link
//     joinUrl: "https://chat.whatsapp.com/GDRw3ZPmkxyGzn6yyzaUcI"
//   },

//   introText:
//     "It's your space to ask bold questions, trade war stories, learn from real people, and build the kind of skills that stick for life.",

//   // Scroll cards — each represents one community feature
//   cards: [
//     {
//       title: "Portfolio reviews",
//       subtitle: "Honest feedback. Real growth.",
//       descriptionMobile:
//         "Share work and get direct feedback on what works and what doesn't.",
//       descriptionDesktop:
//         "Share your work and get direct, no-sugarcoating feedback from experienced designers. Understand what works, what doesn't, and how to level up.",
//       ctaLink: "/community/portfolio-review"
//     },
//     {
//       title: "AMA sessions",
//       subtitle: "Ask what really matters.",
//       descriptionMobile:
//         "Ask anything in open sessions with professionals who've done it for real.",
//       descriptionDesktop:
//         "Ask anything in open sessions with working professionals. Get answers from people who've been there and know how it actually works."
//     },
//     {
//       title: "Challenges",
//       subtitle: "Learn by doing.",
//       descriptionMobile:
//         "Take short challenges, ship work, compare approaches, and learn new ways.",
//       descriptionDesktop:
//         "Jump into short, time-bound challenges designed to stretch your thinking. Ship your work, see how others approached the same brief, and pick up new ways of solving problems."
//     },
//     {
//       title: "Resource library",
//       subtitle: "The good stuff, curated.",
//       descriptionMobile:
//         "Access curated articles, tools, and reads to build strong design fundamentals.",
//       descriptionDesktop:
//         "Access hand-picked articles, tools, and reads,  written by evolve and sourced from the best out there. No fluff. Just solid resources to build strong fundamentals."
//     },
//     {
//       title: "Bookclub",
//       subtitle: "Read. Learn. Finish.",
//       descriptionMobile:
//         "Read design classics together in a weekly book club you actually finish.",
//       descriptionDesktop:
//         "Join the book club to read design classics and modern must-reads together. We break books into small chunks and meet weekly to talk ideas, opinions, and real takeaways, so you actually finish what you start."
//     }
//   ]
// };

// // ─────────────────────────────────────────────
// //  /community/portfolio-review
// // ─────────────────────────────────────────────
// export const portfolioReview = {
//   seo: {
//     title: "Portfolio review — industry eyes on your portfolio",
//     description:
//       "Find out if your portfolio is placement-ready. Get a personalised report with a live 1:1 discussion, helping you build a stronger portfolio for internships, placements, and beyond."
//   },

//   hero: {
//     // Two-line heading — \n marks the line break
//     heading: "Industry eyes\non your portfolio",
//     body: "Find out if your portfolio is placement-ready"
//   },

//   intro:
//     "Industry-led portfolio reviews that go beyond what's on screen. Get a personalised report with a live 1:1 discussion, helping you build a stronger portfolio for internships, placements, and beyond.",

//   pricing: {
//     price: "1,400",
//     heading: "Live review with a mentor",
//     description:
//       "Go deeper with personalised guidance and dedicated reviewer support.",
//     includesHeading: "What's Included",
//     includes: [
//       "pre-review questionnaire feedback tailored to your goals",
//       "live 1:1 call with your matched reviewer",
//       "written report with actionable fixes",
//       "1 free follow-up call to check your revisions",
//       "feedback that's built around your goals"
//     ]
//   },

//   testimonials: {
//     sectionHeading: "results that speak for themselves",
//     quote:
//       "incredibly friendly from the get-go, he gave really clear and actionable points for me to move ahead in my design career.",
//     name: "chinmay zinjal",
//     role: "chemical engineering student, iit guwahati"
//   },

//   faq: {
//     heading: "good\nto know.",
//     items: [
//       {
//         q: "What format should my portfolio be in?",
//         a: "A PDF or a live link (Behance, Notion, your own site) both work. If you have a resume, attach that too. The more context you give us, the more useful the feedback."
//       },
//       {
//         q: "How long until I get my report?",
//         a: "Your written report is sent within 3 working days after your 1:1 call, so the feedback from the conversation is captured in full."
//       },
//       {
//         q: "What happens on the 1:1 call?",
//         a: "You and your reviewer go through your portfolio together, screen-shared. They'll ask about your goals, walk through each piece, point out what's working and what isn't and you can ask questions, push back, or dig into anything that's unclear. It's a conversation, not a presentation."
//       },
//       {
//         q: "When can I use my free follow-up call?",
//         a: "The follow-up is yours to use once you've made revisions based on your first call. There's no hard deadline that takes the time you need to rework your portfolio, but book it when you feel ready, this so your effort doesn't go unreviewed."
//       },
//       {
//         q: "What if I need to reschedule my call?",
//         a: "No problem. You can reschedule up to 24 hours before your call without any issue. Just use the link in your confirmation email to pick a new slot."
//       },
//       {
//         q: "Refund policy?",
//         a: "If you cancel more than 48 hours before your scheduled call, you'll receive a full refund. Cancellations within 48 hours are not eligible for a refund, but you can reschedule once at no extra cost."
//       }
//     ]
//   },

//   whatYoullGet: {
//     heading: "What you'll get",
//     body: "Clarity on where you stand today, confidence in what to improve next, and a clear direction for where your portfolio can take you."
//   },

//   howItWorks: {
//     heading: "How it\nworks.",
//     steps: [
//       {
//         q: "Step 1: Orientation & Portfolio Submission",
//         a: "Students attend an orientation session, complete a self-assessment, and submit their portfolio along with their career aspirations."
//       },
//       {
//         q: "Step 2:  Industry Portfolio Review",
//         a: "Our reviewers evaluate each portfolio against the student's goals and current industry expectations."
//       },
//       {
//         q: "Step 3:  On-Campus/online Feedback Session",
//         a: "Our reviewers engage directly with students through live portfolio presentations and personalised feedback."
//       },
//       {
//         q: "Step 4:  Personalised Report",
//         a: "Every student receives a detailed report with strengths, recommendations, and a clear roadmap for improvement."
//       },
//       {
//         q: "Step 5:  Follow-Up Review",
//         a: "After refining their portfolio, students reconnect with their reviewer for a final round of feedback before applying."
//       }
//     ]
//   }
// };

// // ─────────────────────────────────────────────
// //  Home page announcement ticker
// // ─────────────────────────────────────────────
// export const homeTicker = {
//   label: "upcoming webinar",
//   title: "learn to 'learn'",
//   by: "by kishan parasu",
//   date: "25th june 2026 | 9:00 pm IST",
//   // Replace "#" with the webinar registration link when ready
//   webinarUrl: "#"
// };

// ============================================================
//  EVOLVE — SITE COPY
//
//  Non-devs: this is the only file you need to edit for text changes.
//
//  HOW TO EDIT ON GITHUB:
//  1. Go to this file on github.com/your-org/your-repo
//  2. Click the pencil ✏️ icon (top-right of file view)
//  3. Change the text you want — only edit text inside quotes " "
//  4. Click "Commit changes" at the bottom → Vercel deploys automatically
//
//  RULES — do not break these or the site will error:
//  • Only change text between the quote marks  " "
//  • Do NOT rename any keys (the word before the colon)
//  • Do NOT remove commas, brackets [ ] , or braces { }
//  • Use \n inside a string to add a line break
//  • Apostrophes inside text must be escaped:  it\'s  or use "it's" (double quotes)
// ============================================================

// ─────────────────────────────────────────────
//  /mentorship
// ─────────────────────────────────────────────
export const mentorship = {
  seo: {
    title: "Design mentorship — 1:1 guidance for aspiring designers",
    description:
      "Get paired with an industry designer for focused, personal guidance. evolve mentorship helps you find your niche, build your portfolio, and take the next step — on your terms."
  },

  hero: {
    // Mobile headline — single line (no break)
    headline: "Stop guessing your design career",
    // Desktop headline — use \n where you want a line break
    headlineDesktop: "Stop guessing your\ndesign career"
  },

  cta: {
    // Body paragraph in Section 2 (below hero)
    body: "Personalised mentorship to define your design career, with a real resume, a shortlist of roles built for you, and someone in your corner until you land."
  },

  limitedSeatsNote: "*limited seats",

  mentor: {
    sectionHeading: "Who's guiding you.",
    name: "Yagnesh ahir",
    role: "Founder, Paperclip Design · Founder, evolve · Design Coach, byStadium · Visiting Faculty, NID",
    bio1: "8 years building products, improving UX for SaaS companies, and sitting on the other side of hiring decisions. He knows what gets designers noticed and what quietly eliminates them.",
    bio2: "He's mentored 100+ designers. His approach: no noise, no fluff. Just clarity on who you are, where you fit, and exactly how to get there.",
    linkedinLabel: "view linkedin",
    linkedinUrl: "https://www.linkedin.com/in/yagnesh-ahir-24676516/"
  },

  testimonials: {
    sectionHeading: "What mentees said!",
    items: [
      {
        quote:
          "Incredibly friendly from the get-go. He gave really clear and actionable points for me to move ahead in my design career.",
        name: "Chinmay Zinjal",
        role: "Chemical Engineering student, IIT Guwahati"
      },
      {
        quote:
          "Yagnesh gave me wonderful advice on how he approaches UX problems and runs a remote team. I walked away truly feeling inspired and enlightened.",
        name: "Jon Hwang",
        role: "Communication coach & UX research consultant"
      },
      {
        quote:
          "He helped me a lot in understanding my path. I would 10/10 recommend him.",
        name: "Anish Kumar",
        role: "Lead Product Designer, Smart Energy Waters"
      },
      {
        quote:
          "I'm thankful to Yagnesh for his invaluable perspectives. The practical advice he provided on navigating the job search process was truly valuable. His positive outlook on the design industry and his insights on how my background in creative direction can contribute to product design have significantly bolstered my confidence. I eagerly anticipate further sessions with him in the future.",
        name: "Pradyumna K S",
        role: "Product Designer, Kraverich"
      }
    ]
  },

  faqs: [
    {
      q: "Who is this for?",
      a: "Created for anyone starting out in design, transitioning into the field, or building toward more advanced roles."
    },
    {
      q: "How long does the mentorship run?",
      a: "5 sessions of ~60 minutes each, spread across 2–3 months. The pace is deliberate — space between sessions matters."
    },
    {
      q: "What do I walk away with?",
      a: "A targeted resume, a structured portfolio, a shortlist of real companies and roles, and interview preparation specific to your goals."
    },
    {
      q: "What happens after the sessions end?",
      a: "Support doesn't stop. You'll have ongoing access as you apply. We stay in your corner until you land."
    },
    {
      q: "Do I need prior design experience?",
      a: "No. Freshers are preferred. if you're serious about a design career and willing to put in the work, that's enough to start."
    }
    // Commented out for now — may bring back later
    // {
    //   q: "how many people are in each batch?",
    //   a: "maximum 5. this is intentional — small means you actually get attention, not a seat at the back of a room."
    // }
  ],

  pricing: {
    sectionHeading: "What it costs.",
    starterCutPrice: "₹ 35,000",
    starterPrice: "₹ 15,000",
    starterTaglineDesktop:
      "For those who wants to find \na niche and get started",
    starterTaglineMobile: "For those who need a direction on where to start",
    acceleratorCutPrice: "₹ 50,000",
    acceleratorPrice: "₹ 35,000",
    acceleratorTaglineDesktop:
      "For those who wants to find a niche and accelerate the career",
    acceleratorTaglineMobile:
      "For those who have interviews lined up and need to crack it",
    starterFeatures: [
      "5 group sessions (~60 min each)",
      "Personalised resume & portfolio review",
      "Targeted company & role shortlist",
      "+",
      "Surprise gift on check out!"
    ],
    acceleratorFeatures: [
      "Everything in basic",
      "+",
      "Mock interviews",
      "Portfolio building",
      "Assignment aid",
      "+",
      "Surprise gift on check out!"
    ]
  },

  framework: {
    sectionLabel: "Our framework",
    // The "X stages / Y sessions" heading — spots count is dynamic (from DB), keep the rest here
    stagesLine: "4 stages.",
    sessionsLine: "5 sessions.",
    sessionTime: "Every thursday 9.30pm IST",

    // Desktop version — longer body copy
    stagesDesktop: [
      {
        label: "Discover",
        body: "Getting to know you, your interests, motivations, and how you currently approach design. You'll also gain a deeper understanding of yourself through this process."
      },
      {
        label: "Analyse",
        body: "Identify your strengths and gaps. Review how you've defined your past experiences and sharpen how you tell your story."
      },
      {
        label: "Identify & Approach",
        body: "Shortlist real companies and job roles that match who you are. Build a targeted strategy for how to approach and apply, not just where."
      },
      {
        label: "Build & Apply",
        body: "Create a targeted resume and portfolio for specific job posts. Prepare for interviews. Plus ongoing support as you apply, even after sessions end."
      }
    ],

    // Mobile version — shorter body copy
    stagesMobile: [
      {
        label: "Discover",
        body: "Understand your interests, motivations, and design approach. Gain clarity on who you are."
      },
      {
        label: "Analyse",
        body: "Identify strengths and gaps. Refine how you tell your story."
      },
      {
        label: "Identify & Approach",
        body: "Find roles and companies that fit. Build a focused application strategy."
      },
      {
        label: "Build & Apply",
        body: "Create a targeted portfolio and resume. Prepare for interviews with ongoing support."
      }
    ]
  },

  whyWeBuiltThis: {
    heading: "Why we built this",
    subheading: "The gap isn't skill. It's direction",
    body: "Most designers know how to design. What's harder is knowing which roles fit, how to position yourself, and where to even start. That's what this is for."
  },

  faqSection: {
    // Use \n for a line break in the heading
    heading: "Good\nto know.",
    contactPrompt: "Have more questions?"
  },

  closingCta: {
    // Use \n for line breaks
    tagline:
      "If you're serious about your design career,\nthis is where to start."
  }
};

// ─────────────────────────────────────────────
//  /webinars
// ─────────────────────────────────────────────
export const webinars = {
  seo: {
    title: "Design sessions — webinars, workshops & live events by evolve",
    description:
      "From live webinars to hands-on workshops and informal design meetups — evolve sessions are where learning gets real. Online and offline, for every stage of your design journey."
  },

  hero: {
    heading: "evolve\nwebinars"
    // Desktop subtext (two lines)
    // subtextDesktop:
    //   "Learn from people who've been there,\ndone that, and have the work to prove it."
    // Mobile subtext (single line)
    // subtextMobile:
    //   "Learn from people who've been there, done that, and have the work to prove it."
  },

  upcomingWebinar: {
    // Replace "#" with the registration link when ready
    registrationUrl: "#"
  },

  pastSection: {
    heading: "Past webinars",
    description:
      "Real talk from working professionals. Practical takeaways you can use immediately. Every session is recorded, so you never miss out."
  },

  // Playlist cards — title uses <br/> for line breaks in the rendered card
  cards: [
    {
      title: "Visual<br/>design",
      playlistUrl:
        "https://www.youtube.com/playlist?list=PLRu8x-n5hoiBk41nO_f8tpn0UfUFOEZkA"
    },
    {
      title: "Interaction<br/>design",
      playlistUrl:
        "https://www.youtube.com/playlist?list=PLRu8x-n5hoiDuKT-UgO3rGP0260L-XAxX"
    },
    {
      title: "Career<br/>growth",
      playlistUrl:
        "https://www.youtube.com/playlist?list=PLRu8x-n5hoiCaCGpLy_LIRDFSWTm2gA66"
    },
    {
      title: "Hobbies",
      playlistUrl:
        "https://www.youtube.com/playlist?list=PLRu8x-n5hoiCNf6dl-Cs3RuhrEAFjaIm3"
    }
  ]
};

// ─────────────────────────────────────────────
//  /community
// ─────────────────────────────────────────────
export const community = {
  seo: {
    title: "The evolve community — where the ecosystem comes alive",
    description:
      "A global space for designers at every stage — discussions, challenges, AMAs, book clubs, and more. The community is where everything you learn on evolve gets tested, shared, and built upon."
  },

  hero: {
    heading: "Evolve \ncommunity",
    subtext: "An inner circle built for creators.",
    // WhatsApp / join link
    joinUrl: "https://chat.whatsapp.com/GDRw3ZPmkxyGzn6yyzaUcI"
  },

  introText:
    "It's your space to ask bold questions, trade war stories, learn from real people, and build the kind of skills that stick for life.",

  // Scroll cards — each represents one community feature
  cards: [
    // {
    //   title: "Portfolio reviews",
    //   subtitle: "Honest feedback. Real growth.",
    //   descriptionMobile:
    //     "Share work and get direct feedback on what works and what doesn't.",
    //   descriptionDesktop:
    //     "Share your work and get direct, no-sugarcoating feedback from experienced designers. Understand what works, what doesn't, and how to level up.",
    //   ctaLink: "/community/portfolio-review"
    // },
    {
      title: "AMA sessions",
      subtitle: "Ask what really matters.",
      descriptionMobile:
        "Ask anything in open sessions with professionals who've done it for real.",
      descriptionDesktop:
        "Ask anything in open sessions with working professionals. Get answers from people who've been there and know how it actually works."
    },
    {
      title: "Challenges",
      subtitle: "Learn by doing.",
      descriptionMobile:
        "Take short challenges, ship work, compare approaches, and learn new ways.",
      descriptionDesktop:
        "Jump into short, time-bound challenges designed to stretch your thinking. Ship your work, see how others approached the same brief, and pick up new ways of solving problems."
    },
    // {
    //   title: "Resource library",
    //   subtitle: "The good stuff, curated.",
    //   descriptionMobile:
    //     "Access curated articles, tools, and reads to build strong design fundamentals.",
    //   descriptionDesktop:
    //     "Access hand-picked articles, tools, and reads,  written by evolve and sourced from the best out there. No fluff. Just solid resources to build strong fundamentals."
    // },
    {
      title: "Bookclub",
      subtitle: "Read. Learn. Finish.",
      descriptionMobile:
        "Read design classics together in a weekly book club you actually finish.",
      descriptionDesktop:
        "Join the book club to read design classics and modern must-reads together. We break books into small chunks and meet weekly to talk ideas, opinions, and real takeaways, so you actually finish what you start."
    }
  ]
};

// ─────────────────────────────────────────────
//  /portfolio-review
// ─────────────────────────────────────────────
export const portfolioReview = {
  seo: {
    title: "Portfolio review — industry eyes on your portfolio",
    description:
      "Find out if your portfolio is placement-ready. Get a personalised report with a live 1:1 discussion, helping you build a stronger portfolio for internships, placements, and beyond."
  },

  hero: {
    // Two-line heading — \n marks the line break
    heading: "Industry eyes\non your portfolio",
    body: "Find out if your portfolio is placement-ready",
    // Mobile-only variant with a manual break to avoid a "placement-ready" widow
    bodyMobile: "Find out if your portfolio is\nplacement-ready"
  },

  intro:
    "Industry-led portfolio reviews that go beyond what's on screen. Get a personalised report with a live 1:1 discussion, helping you build a stronger portfolio for internships, placements, and beyond.",

  pricing: {
    price: "2,500",
    heading: "Live review with a mentor",
    description:
      "Go deeper with personalised guidance and dedicated reviewer support.",
    includesHeading: "What's Included",
    includes: [
      "pre-review questionnaire feedback tailored to your goals",
      "live 1:1 call with your matched reviewer",
      "written report with actionable fixes",
      "1 free follow-up call to check your revisions",
      "feedback that's built around your goals"
    ],
    // Mobile-only variants with manual breaks (\n) to avoid widow words
    includesMobile: [
      "pre-review questionnaire feedback tailored\nto your goals",
      "live 1:1 call with your\nmatched reviewer",
      "written report with actionable fixes",
      "1 free follow-up call to check\nyour revisions",
      "feedback that's built around\nyour goals"
    ]
  },

  testimonials: {
    sectionHeading: "Results that speak for themselves",
    // TODO: add 2 more testimonials here ({ quote, name, role }) once received
    items: [
      {
        quote:
          "I realised I didn't need to apply everywhere, I needed to apply better. The review helped me refine my portfolio so it speaks directly to the kinds of companies I want to work with, and gave me a much more targeted approach.",
        name: "Umesh Bari",
        role: "Junior Product Designer"
      },
      {
        quote:
          "I just got my portfolio review in, the feedback is very on point and quite actionable. Thank you guys, you are doing a really nice thing here. Glad to be part of this community.",
        name: "Smriti Agarwal",
        role: "Senior Graphic Designer, Docsumo"
      },
      {
        quote:
          "The review completely changed how I position myself as a UX/UI designer. I reordered my portfolio to lead with my strongest case study and improved how I present my design decisions and thinking. The feedback gave me a much clearer direction.",
        name: "Venkatesh Angidi",
        role: "UI/UX Designer"
      }
    ]
  },

  faq: {
    heading: "Good\nTo Know.",
    items: [
      {
        q: "What format should my portfolio be in?",
        a: "A PDF or a live link (Behance, Notion, your own site) both work. If you have a resume, attach that too. The more context you give us, the more useful the feedback."
      },
      {
        q: "How long until I get my report?",
        a: "Your written report is sent within 3 working days after your 1:1 call, so the feedback from the conversation is captured in full."
      },
      {
        q: "What happens on the 1:1 call?",
        a: "You and your reviewer go through your portfolio together, screen-shared. They'll ask about your goals, walk through each piece, point out what's working and what isn't and you can ask questions, push back, or dig into anything that's unclear. It's a conversation, not a presentation."
      },
      {
        q: "When can I use my free follow-up call?",
        a: "The follow-up is yours to use once you've made revisions based on your first call. There's no hard deadline that takes the time you need to rework your portfolio, but book it when you feel ready, this so your effort doesn't go unreviewed."
      },
      {
        q: "What if I need to reschedule my call?",
        a: "No problem. You can reschedule up to 24 hours before your call without any issue. Just use the link in your confirmation email to pick a new slot."
      },
      {
        q: "Refund policy?",
        a: "If you cancel more than 48 hours before your scheduled call, you'll receive a full refund. Cancellations within 48 hours are not eligible for a refund, but you can reschedule once at no extra cost."
      }
    ]
  },

  whatYoullGet: {
    heading: "What you'll get",
    body: "Clarity on where you stand today, confidence in what to improve next, and a clear direction for where your portfolio can take you."
  },

  howItWorks: {
    heading: "How it\nworks.",
    steps: [
      {
        q: "Step 1: Orientation & Portfolio Submission",
        a: "Students attend an orientation session, complete a self-assessment, and submit their portfolio along with their career aspirations."
      },
      {
        q: "Step 2:  Industry Portfolio Review",
        a: "Our reviewers evaluate each portfolio against the student's goals and current industry expectations."
      },
      {
        q: "Step 3:  On-Campus/online Feedback Session",
        a: "Our reviewers engage directly with students through live portfolio presentations and personalised feedback."
      },
      {
        q: "Step 4:  Personalised Report",
        a: "Every student receives a detailed report with strengths, recommendations, and a clear roadmap for improvement."
      },
      {
        q: "Step 5:  Follow-Up Review",
        a: "After refining their portfolio, students reconnect with their reviewer for a final round of feedback before applying."
      }
    ]
  }
};

// ─────────────────────────────────────────────
//  Home page announcement ticker
// ─────────────────────────────────────────────
export const homeTicker = {
  label: "upcoming webinar",
  title: "learn to 'learn'",
  by: "by kishan parasu",
  date: "25th june 2026 | 9:00 pm IST",
  // Replace "#" with the webinar registration link when ready
  webinarUrl: "#"
};
