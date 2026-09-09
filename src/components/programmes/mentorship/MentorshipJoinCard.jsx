/**
 * The "Happening on / Join session" card — shared by MentorshipSessionPage
 * (sessions 1-5) and MentorshipCallPage (job-application calls), since
 * both need the identical left-aligned date/time + full-width join button
 * treatment (yellow + black bottom-right shadow once enabled, per the
 * source design).
 */
export default function MentorshipJoinCard({ fmt, joinEnabled, gateCaption, joinLink }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-6 flex flex-col items-start text-left gap-4">
      <div>
        <p className="text-white/30 text-xs">Happening on</p>
        <p className="text-white font-bold text-lg mt-1">{fmt?.date || "To be scheduled"}</p>
        {fmt && <p className="text-evolve-yellow font-bold text-sm mt-1">{fmt.time}</p>}
      </div>
      <button
        disabled={!joinEnabled}
        onClick={() => joinEnabled && window.open(joinLink, "_blank", "noopener,noreferrer")}
        className={`w-full font-bold text-sm rounded-2xl py-3.5 flex items-center justify-center gap-2 active:opacity-80 transition-opacity ${
          joinEnabled
            ? "bg-evolve-yellow text-evolve-black border-2 border-evolve-black"
            : "border border-white/20 text-white disabled:opacity-40"
        }`}
        style={joinEnabled ? { boxShadow: "4px 4px 0 0 #000000" } : undefined}
      >
        Join session
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
          <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {gateCaption && <p className="text-white/30 text-xs">{gateCaption}</p>}
    </div>
  );
}
