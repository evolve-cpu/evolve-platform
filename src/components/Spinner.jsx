// Plain loading spinner — growth-stage mascots represent actual progress,
// not a generic "please wait" state, so this is used instead of GrowthMascot
// wherever the page is just waiting on data.
export default function Spinner({ size = 40 }) {
  return (
    <div
      className="rounded-full animate-spin"
      style={{
        width: size,
        height: size,
        border: `${Math.max(2, Math.round(size / 12))}px solid rgba(163,91,251,0.2)`,
        borderTopColor: "rgba(163,91,251,1)"
      }}
    />
  );
}
