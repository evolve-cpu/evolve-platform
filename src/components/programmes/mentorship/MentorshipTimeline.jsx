import { useState } from "react";

// Steps shared by both plans (up to Session 5). Beyond that, the
// application_support plan (₹15,000) adds 3 job-application groups, each
// with two calls — the core plan (₹10,000) stops at Session 5. "Add-on
// calls" sits outside the step count on both plans since it isn't a
// sequential stage — it's a standing option to book extra paid calls.
const CORE_STEPS = [
  "Before we begin",
  "Book a slot",
  "Session 1 · Discover",
  "Session 2 · Analyse",
  "Session 3 · Identify & build",
  "Session 4 · Feedback",
  "Session 5 · Apply"
];

const JOB_APPLICATION_GROUPS = [1, 2, 3].map((n) => ({
  heading: `Job application ${n}`,
  steps: ["Call 1", "Call 2"]
}));

// Builds the flat row list a timeline renders — "step" rows count toward
// the total, "group" rows are just section labels (like the growth map's
// "seed" heading), never clickable/counted.
export function buildTimeline(isApplicationSupport) {
  const rows = CORE_STEPS.map((label, i) => ({ type: "step", label, index: i }));
  let stepCount = CORE_STEPS.length;
  if (isApplicationSupport) {
    JOB_APPLICATION_GROUPS.forEach((group) => {
      rows.push({ type: "group", label: group.heading });
      group.steps.forEach((label) => {
        rows.push({ type: "step", label, index: stepCount });
        stepCount += 1;
      });
    });
  }
  return { rows, totalSteps: stepCount };
}

function AddOnRow() {
  return (
    <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-white/50 font-semibold">
      <span className="w-3.5 flex-shrink-0 text-center leading-none">+</span>
      Add-on calls
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 20 20" fill="none" className="flex-shrink-0">
      <rect x="4" y="9" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6.5 9V6.5a3.5 3.5 0 017 0V9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function TimelineRows({ rows, currentIndex, onSelectStep }) {
  return (
    <div className="flex flex-col gap-0.5">
      {rows.map((row) => {
        if (row.type === "group") {
          return (
            <p
              key={row.label}
              className="text-white/25 text-[10px] font-bold uppercase tracking-wide px-3 pt-3 pb-1"
            >
              {row.label}
            </p>
          );
        }
        const isCurrent = row.index === currentIndex;
        const reached = row.index <= currentIndex;
        const Tag = reached && !isCurrent && onSelectStep ? "button" : "div";
        return (
          <Tag
            key={row.label}
            type={Tag === "button" ? "button" : undefined}
            onClick={Tag === "button" ? () => onSelectStep(row.index) : undefined}
            className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-left ${
              isCurrent
                ? "bg-evolve-yellow/10 text-evolve-yellow font-bold"
                : reached
                  ? "text-white/60 font-semibold hover:bg-white/[0.04] hover:text-white transition-colors"
                  : "text-white/35 font-semibold"
            }`}
          >
            {isCurrent ? (
              <span className="w-3.5 flex justify-center flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-evolve-yellow flex-shrink-0" />
              </span>
            ) : reached ? (
              <span className="w-3.5 flex justify-center flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 flex-shrink-0" />
              </span>
            ) : (
              <span className="w-3.5 flex justify-center flex-shrink-0">
                <LockIcon />
              </span>
            )}
            {row.label}
          </Tag>
        );
      })}
      <AddOnRow />
    </div>
  );
}

/**
 * Desktop "YOUR MENTORSHIP" column — always expanded, no accordion. Sticky
 * (parent row controls the top offset it sits below) with its own
 * max-height/scroll so a long step list (application_support's job-
 * application calls) scrolls independently of the page.
 */
export function MentorshipTimelineDesktop({ plan, currentIndex = 0, onSelectStep }) {
  const { rows } = buildTimeline(plan === "application_support");
  return (
    <div className="hidden lg:flex lg:w-[240px] flex-shrink-0 flex-col gap-1 py-1 lg:sticky lg:top-32 lg:self-start lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto slim-scrollbar">
      <p className="text-white/25 text-[10px] font-bold uppercase tracking-wide px-3 pb-2">
        your mentorship
      </p>
      <TimelineRows rows={rows} currentIndex={currentIndex} onSelectStep={onSelectStep} />
    </div>
  );
}

/**
 * Mobile "Step N of M" accordion — meant to live inside the same sticky
 * header block as the "back to programmes" button (see
 * MentorshipWorkspaceShell) so both stay pinned together while the form
 * scrolls underneath.
 */
export function MentorshipTimelineMobile({ plan, currentIndex = 0, onSelectStep }) {
  const { rows, totalSteps } = buildTimeline(plan === "application_support");
  const currentLabel = rows.find((r) => r.type === "step" && r.index === currentIndex)?.label || "";
  const percent = totalSteps ? Math.round((currentIndex / totalSteps) * 100) : 0;
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setMobileOpen((v) => !v)}
        className="w-full flex flex-col gap-2 py-2 text-left"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-white/25 text-[10px] font-bold uppercase tracking-wide">
              your mentorship
            </p>
            <p className="text-white text-sm font-bold mt-0.5">
              Step {currentIndex} of {totalSteps} · {currentLabel}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-evolve-yellow text-xs font-bold">{percent}%</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 20 20"
              fill="none"
              className={`text-white/40 transition-transform ${mobileOpen ? "rotate-180" : ""}`}
            >
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <div className="h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-evolve-yellow rounded-full transition-[width]"
            style={{ width: `${percent}%` }}
          />
        </div>
      </button>
      {mobileOpen && (
        <div className="pb-4 max-h-[50vh] overflow-y-auto slim-scrollbar">
          <TimelineRows
            rows={rows}
            currentIndex={currentIndex}
            onSelectStep={(i) => {
              setMobileOpen(false);
              onSelectStep?.(i);
            }}
          />
        </div>
      )}
    </div>
  );
}
