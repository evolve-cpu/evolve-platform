// Onboarding persona/tag vocabulary + question engine.
// Ported from the chat-driven onboarding reference mockups — logic kept as
// close to the original as possible since it already matches the MVP
// namespace set (persona / learning_method / learning_modes / discipline /
// level / intent) that backend content-tagging will key off of.

export function toTitleCase(str) {
  return str
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}
export function truncate(str, n) {
  return str.length > n ? str.slice(0, n - 1).trim() + "…" : str;
}
export function firstNameOf(name) {
  return (name || "").trim().split(/\s+/)[0] || "there";
}
function matchTags(text, dict) {
  const t = text.toLowerCase();
  const found = [];
  for (const [kw, tag] of Object.entries(dict)) {
    if (t.includes(kw) && !found.includes(tag)) found.push(tag);
  }
  return found;
}
const VAGUE_RE =
  /^(idk|i ?dont ?know|i ?don't ?know|not ?sure|dunno|no ?idea|nothing|maybe|hmm+|not ?really|everything|anything|all ?of ?it|not ?sure ?yet|whatever)[.!?]*$/i;
export function isGenericVague(text) {
  const t = text.trim();
  if (t.length < 2) return true;
  if (VAGUE_RE.test(t)) return true;
  if (t.split(/\s+/).length === 1 && t.length < 5) return true;
  return false;
}

export const PERSONA_DICT = {
  "high schooler": "High schooler",
  "high school": "High schooler",
  "grade 9": "High schooler",
  "grade 10": "High schooler",
  "grade 11": "High schooler",
  "grade 12": "High schooler",
  "10th": "High schooler",
  "11th": "High schooler",
  "12th": "High schooler",
  teen: "High schooler",
  "design school student": "Design school student",
  "design student": "Design school student",
  "design school": "Design school student",
  college: "Design school student",
  university: "Design school student",
  bdes: "Design school student",
  undergrad: "Design school student",
  "studying design": "Design school student",
  "career shifter": "Career shifter",
  switch: "Career shifter",
  shift: "Career shifter",
  transition: "Career shifter",
  "career change": "Career shifter",
  pivot: "Career shifter",
  "recent grad": "Recent grad",
  graduat: "Recent grad",
  "just finished": "Recent grad",
  "recently completed": "Recent grad",
  "working designer": "Working designer",
  "working as": "Working designer",
  employed: "Working designer",
  "currently a designer": "Working designer",
  "design role": "Working designer",
  "years of experience": "Working designer"
};
export const PERSONA_VALUES = [
  "High schooler",
  "Design school student",
  "Career shifter",
  "Recent grad",
  "Working designer"
];

const DEFAULT_LEVEL_MAP = {
  "Zero — brand new": "zero",
  Beginner: "beginner",
  Intermediate: "intermediate",
  Advanced: "advanced"
};
const LEVEL_BY_PERSONA = {
  "High schooler": {
    ask: "Have you explored design before — workshops, a bit of practice, or nothing yet?",
    chips: ["Nothing yet", "A little exploring", "Quite a bit already"],
    map: {
      "Nothing yet": "zero",
      "A little exploring": "beginner",
      "Quite a bit already": "intermediate"
    }
  },
  // "Design school student" doesn't get a custom entry here — their year is
  // already captured by the "standard" question right after persona, so
  // this falls back to DEFAULT_LEVEL_MAP instead of asking "which year"
  // twice.
  "Career shifter": {
    ask: "How far along are you in learning design so far?",
    chips: [
      "Just starting",
      "Learning casually",
      "Already building real projects"
    ],
    map: {
      "Just starting": "zero",
      "Learning casually": "beginner",
      "Already building real projects": "intermediate"
    }
  },
  "Recent grad": {
    ask: "How would you rate where you’re at with design right now?",
    chips: ["Beginner", "Intermediate", "Advanced"],
    map: {
      Beginner: "beginner",
      Intermediate: "intermediate",
      Advanced: "advanced"
    }
  },
  "Working designer": {
    ask: "How many years have you been working as a designer?",
    chips: ["0–1 yr", "2–4 yrs", "5+ yrs"],
    map: {
      "0–1 yr": "intermediate",
      "2–4 yrs": "intermediate",
      "5+ yrs": "advanced"
    }
  }
};

export const COUNTRY_DICT = [
  "india",
  "united states",
  "usa",
  "u.s.",
  "united kingdom",
  "uk",
  "canada",
  "australia",
  "germany",
  "france",
  "singapore",
  "uae",
  "united arab emirates",
  "italy",
  "spain",
  "netherlands",
  "brazil",
  "mexico",
  "japan",
  "south korea",
  "china",
  "ireland",
  "new zealand",
  "south africa",
  "nigeria",
  "pakistan",
  "bangladesh",
  "sri lanka",
  "nepal",
  "indonesia",
  "philippines",
  "malaysia",
  "vietnam",
  "thailand",
  "sweden",
  "norway",
  "denmark",
  "switzerland",
  "austria",
  "poland",
  "turkey",
  "egypt",
  "kenya",
  "ghana",
  "saudi arabia",
  "qatar"
];
const COUNTRY_DISPLAY = {
  usa: "United States",
  "u.s.": "United States",
  uk: "United Kingdom",
  uae: "UAE"
};

export const DISCIPLINE_VALUES = [
  "UX",
  "UI",
  "Product Design",
  "Fashion Design",
  "Textile Design",
  "Film & Animation",
  "Visual Communication Design",
  "Graphic Design",
  "Architecture",
  "Interior Design",
  "Ceramic Design",
  "Photography Design"
];
export const LEARNING_MODES_VALUES = [
  "Bootcamp or short course",
  "Paid online course",
  "Free resources",
  "Mentor-led"
];
export const INTENT_VALUES = [
  "Learn",
  "Foundation",
  "Upskill",
  "Tool",
  "Guidance",
  "Mentorship",
  "Job",
  "Internship",
  "Network",
  "Community"
];

const WORKTYPE_DICT = {
  "full-time": "Full-time role",
  "full time": "Full-time role",
  "in-house": "In-house team",
  freelance: "Freelance work",
  independent: "Freelance work",
  "own studio": "Start my own studio",
  "my own": "Start my own studio",
  startup: "Startup",
  agency: "Agency",
  studio: "Design studio",
  "product company": "Product company",
  corporate: "Corporate team"
};

function matchMulti(text, values) {
  const parts = text
    .split(/,| and |&/)
    .map((s) => s.trim())
    .filter(Boolean);
  const matched = [];
  parts.forEach((part) => {
    const hit = values.find(
      (v) =>
        v.toLowerCase() === part.toLowerCase() ||
        part.toLowerCase().includes(v.toLowerCase())
    );
    if (hit && !matched.includes(hit)) matched.push(hit);
  });
  return matched;
}

export const PHASES = ["about", "interests", "future"];
export const PHASE_LABEL = {
  about: "About You",
  interests: "Your Interest",
  future: "Future"
};

export const QUESTIONS = [
  {
    id: "name",
    phase: "about",
    cardLabel: "name",
    ask: () => "Hey! Let's start simple — what's your name?",
    chips: [],
    isVague: (text) => text.trim().length < 2,
    followUp: () => "Sorry, didn't quite catch that — what should I call you?",
    parse: (text) => {
      const m = text.match(
        /(?:i'?m|i am|my name is|this is)\s+([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)?)/i
      );
      return { name: m ? toTitleCase(m[1]) : toTitleCase(text.trim()) };
    },
    ack: (p) => `Nice to meet you, ${firstNameOf(p.name)}.`
  },
  {
    id: "country",
    phase: "about",
    cardLabel: "country",
    ask: () => "Which country are you based in?",
    chips: ["India", "United States", "United Kingdom", "Canada", "Remote"],
    isVague: isGenericVague,
    followUp: () =>
      "Just the country's fine — like India, the US, or wherever you're based.",
    parse: (text) => {
      const found = COUNTRY_DICT.find((c) => text.toLowerCase().includes(c));
      return {
        country: found
          ? COUNTRY_DISPLAY[found] || toTitleCase(found)
          : toTitleCase(text.trim())
      };
    },
    ack: (p) => `Got it — ${p.country}.`
  },
  {
    id: "persona",
    phase: "about",
    cardLabel: "persona",
    ask: () => "And where are you right now in your design journey?",
    chips: PERSONA_VALUES,
    options: [
      {
        emoji: "🎒",
        title: "High schooler",
        sub: "exploring, pre-decision",
        fill: "I'm a high schooler."
      },
      {
        emoji: "🎓",
        title: "Design school student",
        sub: "formally studying design",
        fill: "I'm a design school student."
      },
      {
        emoji: "🔀",
        title: "Career shifter",
        sub: "pivoting from another field",
        fill: "I'm shifting into design from another career."
      },
      {
        emoji: "🎯",
        title: "Recent grad",
        sub: "just finished, entering the market",
        fill: "I'm a recent grad."
      },
      {
        emoji: "💼",
        title: "Working designer",
        sub: "already employed as a designer",
        fill: "I'm a working designer."
      }
    ],
    isVague: isGenericVague,
    parse: (text) => {
      const tags = matchTags(text, PERSONA_DICT);
      return { persona: tags[0] || null };
    },
    ack: () => "Good to know."
  },
  // Design school students get three extra questions right here — school
  // name, standard/year, and stream — so that portfolio-review bookings can
  // later be routed to the right Calendly link based on stream/topic.
  {
    id: "school_name",
    phase: "about",
    cardLabel: "school / college",
    condition: (p) => p.persona === "Design school student",
    ask: () =>
      "Which design school or college are you studying at? (Please share the full name, not a short form)",
    chips: [],
    isVague: isGenericVague,
    followUp: () =>
      "No worries — just the full name of your school or college is fine, no short forms.",
    parse: (text) => ({
      school_name: truncate(toTitleCase(text.trim()).replace(/\.$/, ""), 80)
    }),
    ack: (p) => `Nice — ${p.school_name}.`
  },
  {
    id: "standard",
    phase: "about",
    cardLabel: "year / standard",
    condition: (p) => p.persona === "Design school student",
    ask: () => "And which year or standard are you currently in?",
    chips: ["1st year", "2nd year", "3rd year", "4th year", "5th year"],
    isVague: isGenericVague,
    followUp: () =>
      "Just the year's fine — like 1st year, 3rd year, or final year.",
    parse: (text) => ({ standard: truncate(toTitleCase(text.trim()), 40) }),
    ack: (p) => `Got it — ${p.standard}.`
  },
  {
    id: "stream",
    phase: "about",
    cardLabel: "stream",
    condition: (p) => p.persona === "Design school student",
    ask: () =>
      "What stream or specialization are you pursuing — like UX, Fashion Design, Graphic Design, or something else?",
    chips: DISCIPLINE_VALUES,
    isVague: isGenericVague,
    followUp: () =>
      "No worries — what's the closest fit? Like UX, Product Design, Fashion Design, and so on.",
    parse: (text) => {
      const matched = matchMulti(text, DISCIPLINE_VALUES);
      return {
        stream: matched.length
          ? matched.join(", ")
          : truncate(toTitleCase(text.trim()), 60)
      };
    },
    ack: (p) => `Noted — ${p.stream}.`
  },
  {
    id: "level",
    phase: "about",
    cardLabel: "level",
    ask: (p) =>
      (LEVEL_BY_PERSONA[p.persona] || {}).ask ||
      "How would you describe where you're at with design right now?",
    chips: (p) =>
      (LEVEL_BY_PERSONA[p.persona] || {}).chips ||
      Object.keys(DEFAULT_LEVEL_MAP),
    options: (p) => {
      const chips =
        (LEVEL_BY_PERSONA[p.persona] || {}).chips ||
        Object.keys(DEFAULT_LEVEL_MAP);
      return chips.map((c) => ({ emoji: "📈", title: c, sub: "", fill: c }));
    },
    isVague: isGenericVague,
    parse: (text, p) => {
      const cfg = LEVEL_BY_PERSONA[p.persona];
      const map = cfg ? cfg.map : DEFAULT_LEVEL_MAP;
      const matchedLabel = Object.keys(map).find((k) =>
        text.toLowerCase().includes(k.toLowerCase())
      );
      if (matchedLabel)
        return { level: map[matchedLabel], level_confidence: "declared" };
      return { level: "beginner", level_confidence: "inferred_weak" };
    },
    ack: () => "Noted."
  },
  {
    id: "motivation",
    phase: "interests",
    cardLabel: "why design",
    ask: () =>
      "Let's talk design — what got you interested in it in the first place?",
    chips: [],
    isVague: isGenericVague,
    followUp: () =>
      "No worries — even roughly, was it a project, a person, or just something you always gravitated to?",
    parse: (text) => ({
      motivation: truncate(toTitleCase(text.trim()).replace(/\.$/, ""), 70)
    }),
    ack: () => "That's a great starting point."
  },
  {
    id: "learning_method",
    phase: "interests",
    cardLabel: "learning method",
    ask: () =>
      "Are you mostly self-taught, or learning through formal design education?",
    chips: ["Self-taught", "Formal education (design school)"],
    options: [
      {
        emoji: "🧭",
        title: "Self-taught",
        sub: "independent, on my own path",
        fill: "I'm mostly self-taught."
      },
      {
        emoji: "🏫",
        title: "Formal education",
        sub: "in a design school or program",
        fill: "I'm learning through formal design education."
      }
    ],
    isVague: isGenericVague,
    parse: (text, p) => {
      const t = text.toLowerCase();
      if (t.includes("self") || t.includes("own") || t.includes("independent"))
        return { learning_method: "Self-taught" };
      if (
        t.includes("formal") ||
        t.includes("school") ||
        t.includes("college") ||
        t.includes("university")
      )
        return { learning_method: "Formal education (design school)" };
      return {
        learning_method:
          p.persona === "Design school student"
            ? "Formal education (design school)"
            : "Self-taught"
      };
    },
    ack: () => "Good to know."
  },
  {
    id: "learning_modes",
    phase: "interests",
    cardLabel: "learning modes",
    ask: () =>
      'And are any of these part of the mix? Tap as many as apply, then send — or type "none":',
    chips: [...LEARNING_MODES_VALUES, "None of these"],
    isVague: isGenericVague,
    parse: (text) => {
      if (/none/i.test(text.trim())) return { learning_modes: [] };
      const matched = matchMulti(text, LEARNING_MODES_VALUES);
      return { learning_modes: matched.length ? matched : [] };
    },
    ack: (p, parsed) =>
      parsed.learning_modes && parsed.learning_modes.length
        ? `Got it — ${parsed.learning_modes.join(", ")}.`
        : "No worries, noted."
  },
  {
    id: "discipline",
    phase: "interests",
    cardLabel: "discipline",
    ask: () =>
      "Which areas of design are you most drawn to? Tap as many as fit, then send:",
    chips: DISCIPLINE_VALUES,
    isVague: isGenericVague,
    followUp: () =>
      "Totally fine not to have it pinned down — what kind of design work makes you stop and look twice when you're scrolling around?",
    parse: (text) => {
      let matched = matchMulti(text, DISCIPLINE_VALUES);
      if (!matched.length) {
        matched = text
          .split(/,| and |&/)
          .map((s) => s.trim())
          .filter((s) => s.length > 2 && s.length < 28)
          .slice(0, 3)
          .map((s) => truncate(toTitleCase(s), 24));
      }
      return { discipline: matched.slice(0, 6) };
    },
    ack: (p, parsed) =>
      `Nice — ${(parsed.discipline || []).slice(0, 3).join(", ") || "noted"}.`
  },
  {
    id: "intent",
    phase: "future",
    cardLabel: "what would help",
    ask: () =>
      "Almost there — what would help you most right now? Tap everything that applies, then send:",
    chips: INTENT_VALUES,
    options: [
      {
        emoji: "🧭",
        title: "Foundation",
        sub: "the basics, done right",
        fill: "I think building a solid foundation would help me most."
      },
      {
        emoji: "🧑‍🏫",
        title: "Mentorship",
        sub: "guidance from someone experienced",
        fill: "I think mentorship would help me the most."
      },
      {
        emoji: "🤝",
        title: "Community",
        sub: "people to learn alongside",
        fill: "I think being part of a community would help."
      }
    ],
    isVague: isGenericVague,
    parse: (text) => {
      let matched = matchMulti(text, INTENT_VALUES);
      if (!matched.length) matched = [truncate(toTitleCase(text.trim()), 40)];
      return { intent: matched.slice(0, 6) };
    },
    ack: (p, parsed) =>
      `Noted — ${(parsed.intent || []).slice(0, 3).join(", ") || "got it"}.`
  },
  {
    id: "work_type",
    phase: "future",
    cardLabel: "kind of work",
    ask: () =>
      "Last one — could you share a bit about the kind of work you'd like to do in design? Could be a role, an industry, freelance vs. studio, whatever's on your mind.",
    chips: [
      "Full-time role",
      "Freelance",
      "Startup",
      "Agency",
      "My own studio",
      "Not sure yet"
    ],
    options: [
      {
        emoji: "💼",
        title: "A full-time studio role",
        sub: "join a design team somewhere",
        fill: "I'd like to work full-time at a product company or design studio."
      },
      {
        emoji: "🧑‍💻",
        title: "Freelance / independent",
        sub: "work on my own projects",
        fill: "I'm leaning toward freelance work, taking on my own clients and projects."
      },
      {
        emoji: "🚀",
        title: "Start something of my own",
        sub: "a studio, brand, or venture",
        fill: "Eventually I'd like to start my own design studio or venture."
      }
    ],
    isVague: isGenericVague,
    parse: (text) => {
      const tags = matchTags(text, WORKTYPE_DICT);
      return {
        work_type: tags.length
          ? tags.join(", ")
          : truncate(toTitleCase(text.trim()).replace(/\.$/, ""), 90)
      };
    },
    ack: () => "Perfect."
  }
];

export function emptyProfile() {
  return {
    name: null,
    country: null,
    persona: null,
    level: null,
    level_confidence: null,
    motivation: null,
    learning_method: null,
    learning_modes: [],
    discipline: [],
    intent: [],
    work_type: null,
    school_name: null,
    standard: null,
    stream: null
  };
}

// A question can declare `condition(profile)` to only apply for some
// answers so far (e.g. the school/standard/stream questions only apply to
// design school students) — these helpers walk the flat QUESTIONS array
// while skipping over any question whose condition isn't met yet.
export function isActiveQuestion(q, profile) {
  return !q.condition || q.condition(profile);
}

export function nextQuestionIndex(fromIndex, profile) {
  let i = fromIndex;
  while (i < QUESTIONS.length && !isActiveQuestion(QUESTIONS[i], profile)) {
    i++;
  }
  return i;
}
