// Decorative header art for the "evolve programmes" cards on the profile
// dashboard — ported straight from the design reference (wavy ribbons with
// yellow-ringed waypoints for Portfolio Review; converging lines into a star
// for Mentorship) instead of a plain gradient + emoji.
export function PortfolioReviewArt() {
  return (
    <svg viewBox="0 0 500 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true" className="w-full h-full">
      <rect width="500" height="150" fill="#0e0e11" />
      <path
        d="M-20 120 C 70 20,150 20,210 95 S 340 165,420 80 S 520 10,560 90"
        fill="none"
        stroke="#8b5cf6"
        strokeWidth="22"
      />
      <path
        d="M-20 96 C 70 6,150 6,210 78 S 340 148,420 64 S 520 -6,560 74"
        fill="none"
        stroke="#e0218a"
        strokeWidth="12"
      />
      <circle cx="210" cy="90" r="12" fill="#0e0e11" stroke="#FFD007" strokeWidth="4" />
      <circle cx="210" cy="90" r="3.5" fill="#FFD007" />
      <circle cx="420" cy="74" r="12" fill="#0e0e11" stroke="#FFD007" strokeWidth="4" />
      <circle cx="420" cy="74" r="3.5" fill="#FFD007" />
    </svg>
  );
}

export function MentorshipArt() {
  return (
    <svg viewBox="0 0 500 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true" className="w-full h-full">
      <rect width="500" height="150" fill="#0e0e11" />
      <path
        d="M40 150 C 120 60,150 40,180 30 M460 150 C 380 60,350 40,320 30"
        fill="none"
        stroke="#8b5cf6"
        strokeWidth="10"
      />
      <path
        d="M20 150 C 110 70,140 50,175 40 M480 150 C 390 70,360 50,325 40"
        fill="none"
        stroke="#e0218a"
        strokeWidth="8"
      />
      <g transform="translate(250 62)">
        <polygon
          points="0,-34 9,-11 33,-11 13,4 20,28 0,14 -20,28 -13,4 -33,-11 -9,-11"
          fill="#FFD007"
        />
        <circle cx="0" cy="-3" r="9" fill="#0e0e11" />
        <circle cx="0" cy="-3" r="4" fill="#8b5cf6" />
      </g>
    </svg>
  );
}
