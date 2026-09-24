// Segmented step indicator shared by the role-choice → student-ID →
// academic-details sequence. `step` is 1-indexed (how many segments are
// filled), `total` is the segment count.
export default function OnboardingProgressBar({ step, total = 3 }) {
  return (
    <div className="flex gap-1.5 w-full">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-1 flex-1 rounded-full transition-colors"
          style={{ backgroundColor: i < step ? "#FFD007" : "rgba(255,255,255,0.1)" }}
        />
      ))}
    </div>
  );
}
