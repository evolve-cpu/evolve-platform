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
    body: "personalised mentorship to define your design career, with a real resume, a shortlist of roles built for you, and someone in your corner until you land."
  },

  limitedSeatsNote: "*limited seats",

  mentor: {
    sectionHeading: "who's guiding you.",
    name: "Yagnesh ahir",
    role: "Founder, Paperclip Design · Founder, evolve · Design Coach, byStadium · Visiting Faculty, NID",
    bio1: "8 years building products, improving UX for SaaS companies, and sitting on the other side of hiring decisions. He knows what gets designers noticed and what quietly eliminates them.",
    bio2: "He's mentored 100+ designers. His approach: no noise, no fluff. Just clarity on who you are, where you fit, and exactly how to get there.",
    linkedinLabel: "view linkedin",
    linkedinUrl: "https://www.linkedin.com/in/yagnesh-ahir-24676516/"
  },

  testimonials: {
    sectionHeading: "what mentees said!",
    items: [
      {
        quote:
          "incredibly friendly from the get-go. he gave really clear and actionable points for me to move ahead in my design career.",
        name: "chinmay zinjal",
        role: "chemical engineering student, IIT Guwahati"
      },
      {
        quote:
          "yagnesh gave me wonderful advice on how he approaches UX problems and runs a remote team. i walked away truly feeling inspired and enlightened.",
        name: "jon hwang",
        role: "communication coach & UX research consultant"
      },
      {
        quote:
          "he helped me a lot in understanding my path. i would 10/10 recommend him.",
        name: "anish kumar",
        role: "lead product designer, smart energy waters"
      },
      {
        quote:
          "i'm thankful to yagnesh for his invaluable perspectives. the practical advice he provided on navigating the job search process was truly valuable. his positive outlook on the design industry and his insights on how my background in creative direction can contribute to product design have significantly bolstered my confidence. i eagerly anticipate further sessions with him in the future.",
        name: "Pradyumna K S",
        role: "Product Designer, Kraverich"
      }
    ]
  },

  faqs: [
    {
      q: "who is this for?",
      a: "created for anyone starting out in design, transitioning into the field, or building toward more advanced roles."
    },
    {
      q: "how long does the mentorship run?",
      a: "5 sessions of ~60 minutes each, spread across 2–3 months. the pace is deliberate — space between sessions matters."
    },
    {
      q: "what do i walk away with?",
      a: "a targeted resume, a structured portfolio, a shortlist of real companies and roles, and interview preparation specific to your goals."
    },
    {
      q: "what happens after the sessions end?",
      a: "support doesn't stop. you'll have ongoing access as you apply. we stay in your corner until you land."
    },
    {
      q: "do i need prior design experience?",
      a: "no. freshers are preferred. if you're serious about a design career and willing to put in the work, that's enough to start."
    }
    // Commented out for now — may bring back later
    // {
    //   q: "how many people are in each batch?",
    //   a: "maximum 5. this is intentional — small means you actually get attention, not a seat at the back of a room."
    // }
  ],

  pricing: {
    sectionHeading: "what it costs.",
    starterCutPrice: "₹ 35,000",
    starterPrice: "₹ 15,000",
    starterTaglineDesktop:
      "for those who wants to find \na niche and get started",
    starterTaglineMobile: "for those who need a direction on where to start",
    acceleratorCutPrice: "₹ 50,000",
    acceleratorPrice: "₹ 35,000",
    acceleratorTaglineDesktop:
      "for those who wants to find a niche and accelerate the career",
    acceleratorTaglineMobile:
      "for those who have interviews lined up and need to crack it",
    starterFeatures: [
      "5 group sessions (~60 min each)",
      "personalised resume & portfolio review",
      "targeted company & role shortlist",
      "+",
      "surprise gift on check out!"
    ],
    acceleratorFeatures: [
      "everything in basic",
      "+",
      "mock interviews",
      "portfolio building",
      "assignment aid",
      "+",
      "surprise gift on check out!"
    ]
  },

  framework: {
    sectionLabel: "our framework",
    // The "X stages / Y sessions" heading — spots count is dynamic (from DB), keep the rest here
    stagesLine: "4 stages.",
    sessionsLine: "5 sessions.",
    sessionTime: "every thursday 9.30pm IST",

    // Desktop version — longer body copy
    stagesDesktop: [
      {
        label: "discover",
        body: "Getting to know you, your interests, motivations, and how you currently approach design. You'll also gain a deeper understanding of yourself through this process."
      },
      {
        label: "analyse",
        body: "Identify your strengths and gaps. Review how you've defined your past experiences and sharpen how you tell your story."
      },
      {
        label: "identify & approach",
        body: "Shortlist real companies and job roles that match who you are. Build a targeted strategy for how to approach and apply, not just where."
      },
      {
        label: "build & apply",
        body: "Create a targeted resume and portfolio for specific job posts. Prepare for interviews. Plus ongoing support as you apply, even after sessions end."
      }
    ],

    // Mobile version — shorter body copy
    stagesMobile: [
      {
        label: "discover",
        body: "understand your interests, motivations, and design approach. gain clarity on who you are."
      },
      {
        label: "analyse",
        body: "identify strengths and gaps. refine how you tell your story."
      },
      {
        label: "identify & approach",
        body: "find roles and companies that fit. build a focused application strategy."
      },
      {
        label: "build & apply",
        body: "create a targeted portfolio and resume. prep for interviews with ongoing support."
      }
    ]
  },

  whyWeBuiltThis: {
    heading: "why we built this",
    subheading: "the gap isn't skill. it's direction",
    body: "Most designers know how to design. What's harder is knowing which roles fit, how to position yourself, and where to even start. That's what this is for."
  },

  faqSection: {
    // Use \n for a line break in the heading
    heading: "good\nto know.",
    contactPrompt: "have more questions?"
  },

  closingCta: {
    // Use \n for line breaks
    tagline:
      "if you're serious about your design career,\nthis is where to start."
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
    heading: "past webinars",
    description:
      "Real talk from working professionals. Practical takeaways you can use immediately. Every session is recorded, so you never miss out."
  },

  // Playlist cards — title uses <br/> for line breaks in the rendered card
  cards: [
    {
      title: "visual<br/>design",
      playlistUrl:
        "https://www.youtube.com/playlist?list=PLRu8x-n5hoiBk41nO_f8tpn0UfUFOEZkA"
    },
    {
      title: "interaction<br/>design",
      playlistUrl:
        "https://www.youtube.com/playlist?list=PLRu8x-n5hoiDuKT-UgO3rGP0260L-XAxX"
    },
    {
      title: "career<br/>growth",
      playlistUrl:
        "https://www.youtube.com/playlist?list=PLRu8x-n5hoiCaCGpLy_LIRDFSWTm2gA66"
    },
    {
      title: "hobbies",
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
    heading: "evolve \ncommunity",
    subtext: "an inner circle built for creators.",
    // WhatsApp / join link
    joinUrl: "https://chat.whatsapp.com/GDRw3ZPmkxyGzn6yyzaUcI"
  },

  introText:
    "it's YOUR space to ask bold questions, trade war stories, learn from real people, and build the kind of skills that stick for life.",

  // Scroll cards — each represents one community feature
  cards: [
    {
      title: "portfolio reviews",
      subtitle: "honest feedback. real growth.",
      descriptionMobile:
        "share work and get direct feedback on what works and what doesn't.",
      descriptionDesktop:
        "share your work and get direct, no-sugarcoating feedback from experienced designers. understand what works, what doesn't, and how to level up.",
      ctaLink: "/community/portfolio-review"
    },
    {
      title: "ama sessions",
      subtitle: "ask what really matters.",
      descriptionMobile:
        "ask anything in open sessions with professionals who've done it for real.",
      descriptionDesktop:
        "ask anything in open sessions with working professionals. get answers from people who've been there and know how it actually works."
    },
    {
      title: "challenges",
      subtitle: "learn by doing.",
      descriptionMobile:
        "take short challenges, ship work, compare approaches, and learn new ways.",
      descriptionDesktop:
        "jump into short, time-bound challenges designed to stretch your thinking. ship your work, see how others approached the same brief, and pick up new ways of solving problems."
    },
    {
      title: "resource library",
      subtitle: "the good stuff, curated.",
      descriptionMobile:
        "access curated articles, tools, and reads to build strong design fundamentals.",
      descriptionDesktop:
        "access hand-picked articles, tools, and reads,  written by evolve and sourced from the best out there. no fluff. just solid resources to build strong fundamentals."
    },
    {
      title: "bookclub",
      subtitle: "read. learn. finish.",
      descriptionMobile:
        "read design classics together in a weekly book club you actually finish.",
      descriptionDesktop:
        "join the book club to read design classics and modern must-reads together. we break books into small chunks and meet weekly to talk ideas, opinions, and real takeaways, so you actually finish what you start."
    }
  ]
};

// ─────────────────────────────────────────────
//  /community/portfolio-review
// ─────────────────────────────────────────────
export const portfolioReview = {
  seo: {
    title: "Portfolio review — honest feedback. real growth.",
    description:
      "Share your work and get a personalised, no-sugarcoating review from experienced designers. Understand what works, what doesn't, and how to level up."
  },

  hero: {
    // Two-line heading — \n marks the line break
    heading: "honest feedback.\nreal growth.",
    body: "getting a review isn't just about what's on screen. it's about how you think, present, and what you're actually going for. that's what we look at."
  },

  howItWorks: {
    heading: "how it\nworks.",
    steps: [
      {
        q: "step 1: Orientation & Portfolio Submission",
        a: "students attend an orientation session, complete a self-assessment, and submit their portfolio along with their career aspirations."
      },
      {
        q: "step 2:  Industry Portfolio Review",
        a: "our reviewers evaluate each portfolio against the student's goals and current industry expectations."
      },
      {
        q: "step 3:  On-Campus/online Feedback Session",
        a: "our reviewers engage directly with students through live portfolio presentations and personalised feedback."
      },
      {
        q: "step 4:  Personalised Report",
        a: "every student receives a detailed report with strengths, recommendations, and a clear roadmap for improvement."
      },
      {
        q: "step 5:  Follow-Up Review",
        a: "after refining their portfolio, students reconnect with their reviewer for a final round of feedback before applying."
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
