// Shared constants/helpers between the org admin dashboard (TeamSpace.jsx)
// and the public institute page (InstitutePublicPage.jsx) — kept in one
// place so role colors, program listings, and date formatting stay in sync
// across both.

export const ROLE_LABEL = { owner: "owner", admin: "admin", member: "member" };

// role-tag colors match evolve's palette exactly (evolve-inchworm /
// evolve-lavender-indigo / evolve-yellow)
export const ROLE_META = {
  student: {
    word: "student",
    plural: "students",
    text: "text-evolve-inchworm",
    bg: "bg-evolve-inchworm/10",
    dot: "bg-evolve-inchworm"
  },
  faculty: {
    word: "faculty member",
    plural: "faculty",
    text: "text-evolve-lavender-indigo",
    bg: "bg-evolve-lavender-indigo/10",
    dot: "bg-evolve-lavender-indigo"
  },
  admin: {
    word: "admin",
    plural: "admins",
    text: "text-evolve-yellow",
    bg: "bg-evolve-yellow/10",
    dot: "bg-evolve-yellow"
  }
};

export const EVOLVE_PROGRAMS = [
  {
    id: "portfolio-review",
    name: "portfolio review",
    emoji: "📋",
    accent: "purple",
    desc: "every student gets a personalised report from a working reviewer, plus a live 1:1 session.",
    meta: ["2–3 weeks", "on-campus", "best for yr 2–3"],
    href: "/for-institutes/portfolio-review-programme"
  },
  {
    id: "find-your-niche",
    name: "find your niche",
    emoji: "🧭",
    accent: "green",
    desc: 'a 4-day mentorship that takes students from "who am i as a designer" to "where do i fit."',
    meta: ["4 days", "hybrid", "2 industry pros"],
    href: "/for-institutes/find-your-niche-programme"
  }
];

export const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, rgba(223,5,134,1), rgba(163,91,251,1))",
  "linear-gradient(135deg, rgba(194,253,92,1), rgba(1,241,217,1))",
  "linear-gradient(135deg, rgba(255,208,7,1), rgba(235,83,40,1))",
  "linear-gradient(135deg, rgba(49,57,255,1), rgba(163,91,251,1))"
];

export const TYPE_META = {
  exam: { label: "entrance exam", text: "text-evolve-lavender-indigo", bg: "bg-evolve-lavender-indigo/10" },
  event: { label: "event", text: "text-evolve-pink", bg: "bg-evolve-pink/10" },
  deadline: { label: "deadline", text: "text-evolve-yellow", bg: "bg-evolve-yellow/10" },
  result: { label: "results", text: "text-evolve-inchworm", bg: "bg-evolve-inchworm/10" }
};

export function yearsSince(y) {
  const n = parseInt(y, 10);
  if (!n || Number.isNaN(n)) return null;
  const diff = new Date().getFullYear() - n;
  return diff >= 0 ? diff : null;
}

export function initialsOf(name) {
  return (name || "?").trim()[0]?.toUpperCase() || "?";
}

export function timeAgo(iso) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}
