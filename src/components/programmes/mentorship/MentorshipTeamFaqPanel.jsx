import { mentor_yagnesh, chesna } from "../../../assets/images/Mentorship";
import { FAQ } from "./MentorshipLanding";

function MailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
      <rect x="2.5" y="4.5" width="15" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 5.5L10 11L17 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const TEAM = [
  { name: "Yagnesh Ahir", role: "Mentor", avatar: mentor_yagnesh },
  { name: "Chesna", role: "Support team lead", avatar: chesna }
];

/**
 * Right-hand column of the post-enrollment workspace — desktop sidebar /
 * bottom-stacked on mobile (its parent controls that via flex-col vs
 * flex-row). FAQ copy is the same 3 questions as the landing page's FAQ
 * (src/components/programmes/mentorship/MentorshipLanding.jsx) — reused,
 * not duplicated.
 */
export default function MentorshipTeamFaqPanel() {
  return (
    <div className="lg:w-[280px] flex-shrink-0 flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-5 flex flex-col gap-4">
        <p className="text-white/25 text-[10px] font-bold uppercase tracking-wide">
          evolve team
        </p>
        {TEAM.map((member) => (
          <div key={member.name} className="flex items-center gap-3">
            <img
              src={member.avatar}
              alt={member.name}
              className="w-9 h-9 rounded-full object-cover flex-shrink-0 bg-white/10"
            />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold truncate">{member.name}</p>
              <p className="text-white/40 text-xs">{member.role}</p>
            </div>
            <button
              type="button"
              className="w-7 h-7 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] flex-shrink-0 transition-colors"
              title={`email ${member.name}`}
            >
              <MailIcon />
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-5 flex flex-col gap-3">
        <p className="text-white/25 text-[10px] font-bold uppercase tracking-wide">faqs</p>
        <div className="flex flex-col divide-y divide-white/10">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group py-3 first:pt-0 last:pb-0">
              <summary className="text-white text-sm font-semibold cursor-pointer list-none flex items-center justify-between gap-3">
                {q}
                <span className="text-white/30 group-open:rotate-45 transition-transform text-base leading-none flex-shrink-0">
                  +
                </span>
              </summary>
              <p className="text-white/40 text-xs mt-2 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
        <p className="text-white/30 text-xs">
          Have more questions? <span className="text-evolve-yellow font-semibold">Contact us</span>
        </p>
      </div>
    </div>
  );
}
