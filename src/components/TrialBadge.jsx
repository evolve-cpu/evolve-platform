// Small clock badge overlaid on a corner of the user's avatar — yellow while
// the 30-day trial (or a plan) is running, red once the trial has ended on
// pay-as-you-go (see src/lib/membership.js). Tapping it opens the trial
// status sheet when `onClick` is passed. Meant to sit inside a
// `position: relative` wrapper around the avatar, positioned with an
// absolute className passed in by the caller.
export function TrialClockBadge({ size = 14, className = "", ending = false, onClick }) {
  const Tag = onClick ? "button" : "span";
  return (
    <Tag
      {...(onClick
        ? {
            type: "button",
            "aria-label": "Trial status",
            onClick: (e) => {
              e.stopPropagation();
              onClick();
            }
          }
        : { title: "free trial" })}
      className={`flex items-center justify-center rounded-full flex-shrink-0 p-0 active:scale-[0.92] transition-transform ${className}`}
      style={{
        width: size,
        height: size,
        border: "2px solid #161618",
        backgroundColor: ending ? "#FF355B" : "#FFD007",
        color: ending ? "#FFFFFF" : "#161618"
      }}
    >
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.4" />
        <path
          d="M12 7v5l3.2 2"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Tag>
  );
}
