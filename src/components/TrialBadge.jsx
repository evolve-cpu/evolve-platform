// Small clock badge overlaid on a corner of the user's avatar to indicate
// they're on the free trial (no paid tier exists yet — see src/lib/trial.js).
// Meant to sit inside a `position: relative` wrapper around the avatar,
// positioned with an absolute className passed in by the caller.
export function TrialClockBadge({ size = 14, className = "" }) {
  return (
    <span
      title="free trial"
      className={`flex items-center justify-center rounded-full bg-evolve-yellow flex-shrink-0 ${className}`}
      style={{ width: size, height: size, border: "2px solid #161618" }}
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle cx="12" cy="12" r="9" stroke="#161618" strokeWidth="2.4" />
        <path
          d="M12 7v5l3.5 2"
          stroke="#161618"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
