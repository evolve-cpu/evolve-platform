import { PROCESS } from "./MentorshipLanding";
import { DocRow, MentorshipDocsAndResources } from "./MentorshipDocsResources";

function PlayThumb({ title, subtitle, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden flex flex-col text-left hover:border-white/20 transition-colors"
    >
      <div className="aspect-video flex items-center justify-center bg-black/30">
        <span className="w-11 h-11 rounded-full bg-evolve-yellow flex items-center justify-center flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path d="M6 4l10 6-10 6V4z" fill="#161618" />
          </svg>
        </span>
      </div>
      <div className="px-4 py-3">
        <p className="text-white text-sm font-bold">{title}</p>
        <p className="text-white/35 text-xs mt-0.5">{subtitle}</p>
      </div>
    </button>
  );
}

/**
 * "Your mentorship" — every session's (and, for application_support, every
 * job-application call's) recording in one grid, once at least one exists.
 * Reachable from the timeline's "All recordings" row (see
 * MentorshipTimeline.jsx) any time after the booking phase starts, not
 * gated on finishing everything — recordings just accumulate as sessions/
 * calls complete. Clicking a card jumps back to that slot's own page (via
 * `onOpenSlot`, same mechanism as the timeline's revisit rows).
 */
export default function MentorshipAllRecordings({
  user,
  plan,
  intake,
  sessionLinks,
  feedbacks,
  skillFoundation,
  skillStream,
  onOpenSlot,
  onOpenSkillTracker,
  onIntakeUpdated
}) {
  const cards = [];
  for (let n = 1; n <= 5; n++) {
    if (!feedbacks[n]) continue;
    const fmt = sessionLinks[n]?.session_datetime
      ? new Date(sessionLinks[n].session_datetime).toLocaleDateString("en-IN", {
          weekday: "long",
          day: "2-digit",
          month: "short",
          year: "numeric"
        })
      : "";
    cards.push({ slot: n, title: `Session ${n} · ${PROCESS[n - 1].title}`, subtitle: fmt });
  }
  if (plan === "application_support") {
    for (let ja = 1; ja <= 3; ja++) {
      for (let call = 1; call <= 2; call++) {
        const slot = 5 + (ja - 1) * 2 + call;
        if (!feedbacks[slot]) continue;
        cards.push({ slot, title: `Job application ${ja} · Call ${call}`, subtitle: "" });
      }
    }
  }

  const trackerRows = [
    skillFoundation?.submitted_at && { key: "foundation", label: "Foundation skill tracker" },
    skillStream?.submitted_at && { key: "stream", label: "Stream skill tracker" }
  ].filter(Boolean);

  return (
    <div className="flex-1 flex flex-col gap-6">
      <div>
        <h1
          className="text-white font-bold font-bricolage"
          style={{ fontSize: "clamp(24px,4vw,32px)", letterSpacing: "-0.02em" }}
        >
          Your mentorship
        </h1>
        <p className="text-white/50 text-sm mt-2 max-w-xl leading-relaxed">
          {plan === "application_support"
            ? "That's every session and every job application call, wrapped. All your recordings are right here whenever you need them."
            : "All your session recordings are right here whenever you need them."}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-white font-bold text-sm">All recordings</p>
        {cards.length === 0 ? (
          <p className="text-white/35 text-sm">Nothing recorded yet — check back after your first session.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cards.map((c) => (
              <PlayThumb key={c.slot} title={c.title} subtitle={c.subtitle} onClick={() => onOpenSlot(c.slot)} />
            ))}
          </div>
        )}
      </div>

      {trackerRows.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-white font-bold text-sm">Your skill trackers</p>
          {trackerRows.map((t) => (
            <DocRow
              key={t.key}
              icon={
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <rect x="4" y="3" width="12" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M7 7h6M7 10.5h6M7 14h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              }
              label={t.label}
              value="Submitted"
              onClick={() => onOpenSkillTracker(t.key)}
            />
          ))}
        </div>
      )}

      <MentorshipDocsAndResources user={user} intake={intake} onIntakeUpdated={onIntakeUpdated} />
    </div>
  );
}
