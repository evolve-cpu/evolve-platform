// Shared between InstitutePublicPage's sidebar/mobile sheet and
// InstituteSettingsPage's sidebar — one place for what an institute's
// identity block looks like, so the two pages can't drift apart.
export default function InstituteInfoPanel({ org, isAdmin, sidebarStats, onEditInfo }) {
  return (
    <div>
      <p className="text-white font-extrabold text-base leading-tight">{org.name}</p>
      {org.location && <p className="text-white/30 text-[11px] mt-1">{org.location}</p>}
      {org.bio && <p className="text-white/45 text-[12px] leading-relaxed mt-2">{org.bio}</p>}

      {(org.website || (org.social_links || []).length > 0) && (
        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
          {org.website && (
            <a href={org.website} target="_blank" rel="noopener noreferrer" title="website" className="w-7 h-7 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/50 hover:text-white flex-shrink-0">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                <path d="M3 12h18M12 3a15 15 0 010 18M12 3a15 15 0 000 18" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </a>
          )}
          {(org.social_links || []).map((l, i) => (
            <a
              key={i}
              href={/^https?:\/\//.test(l.url) ? l.url : `https://${l.url}`}
              target="_blank"
              rel="noopener noreferrer"
              title={l.platform}
              className="w-7 h-7 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/50 hover:text-white text-[10px] font-bold flex-shrink-0"
            >
              {l.platform[0].toUpperCase()}
            </a>
          ))}
        </div>
      )}

      {(org.awards || []).length > 0 && (
        <div className="flex items-center flex-wrap gap-x-1 gap-y-1 mt-3 pt-3 border-t border-white/10 text-[11px] text-white/50 font-semibold">
          {org.awards.map((a, i) => (
            <span key={i} className="inline-flex items-center gap-1">
              {i > 0 && <span className="text-white/25 mx-1">·</span>}
              🏅 {a.title}
            </span>
          ))}
        </div>
      )}

      <div className={`flex items-stretch ${(org.awards || []).length > 0 ? "mt-3.5" : "mt-3.5 pt-3.5 border-t border-white/10"}`}>
        {sidebarStats.map((s, i) => (
          <div key={s.label} className="flex items-stretch flex-1 min-w-0">
            {i > 0 && <div className="w-px bg-white/10 flex-shrink-0 mr-3" />}
            <div className="min-w-0">
              <p className="text-white font-extrabold text-[12.5px] leading-tight truncate">{s.num}</p>
              <p className="text-white/30 text-[9px] mt-0.5 leading-tight">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {isAdmin && (
        <button
          onClick={onEditInfo}
          className="inline-flex items-center gap-1.5 mt-3.5 pt-3.5 border-t border-white/10 w-full text-evolve-lavender-indigo text-xs font-semibold hover:underline underline-offset-2"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M12 20h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
          edit info
        </button>
      )}
    </div>
  );
}
