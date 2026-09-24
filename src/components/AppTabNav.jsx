// Minimal line icons, kept intentionally simple so they read clearly at the
// small 20px size both the mobile bar and desktop tab row use.
function ProfileIcon({ className }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4.5 20c1.2-3.8 4.3-6 7.5-6s6.3 2.2 7.5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function GrowIcon({ className }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 21V10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 10c0-4 3-7 7-7 0 4-3 7-7 7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 14c0-3-2.5-5.5-5.5-5.5 0 3 2.5 5.5 5.5 5.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function EventsIcon({ className }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="4" y="5.5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 9.5h16" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 3.5v3M16 3.5v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CommunityIcon({ className }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="8.5" cy="9" r="2.75" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="16" cy="10.5" r="2.25" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 19c.7-2.7 2.9-4.5 5.5-4.5S13.3 16.3 14 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M14.5 15.3c2.1.2 3.8 1.7 4.5 3.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

const TABS = [
  { key: "profile", label: "My Profile", Icon: ProfileIcon },
  { key: "grow", label: "Grow", Icon: GrowIcon },
  { key: "events", label: "Events", Icon: EventsIcon },
  { key: "community", label: "Community", Icon: CommunityIcon }
];

/**
 * The tab nav for the signed-in profile/dashboard experience — fixed bottom
 * bar on mobile, an equivalent inline tab row on desktop. Only ever mounted
 * from within PublicProfile.jsx, so it's automatically absent everywhere
 * else (including the Anant white-label tenant, which never renders that
 * page). "Events" drives activeTab like every other tab, rendering
 * EventsTabPane in place — it no longer routes out to the standalone
 * /events marketing page.
 */
export default function AppTabNav({ activeTab, onTabChange, variant = "mobile" }) {
  function renderTab({ key, label, Icon }) {
    const active = activeTab === key;
    const content = (
      <>
        <Icon className={active ? "text-evolve-yellow" : "text-white/50"} />
        <span
          className={`${variant === "mobile" ? "text-[10px]" : "text-xs"} font-semibold ${
            active ? "text-evolve-yellow" : "text-white/50"
          }`}
        >
          {label}
        </span>
      </>
    );
    const sharedClass =
      variant === "mobile"
        ? "flex flex-col items-center justify-center gap-1 flex-1 py-2"
        : "flex items-center gap-2 rounded-full px-4 py-2 transition-colors hover:bg-white/[0.06]";

    return (
      <button key={key} type="button" onClick={() => onTabChange(key)} className={sharedClass}>
        {content}
      </button>
    );
  }

  if (variant === "desktop") {
    return (
      <div className="hidden md:flex items-center gap-1">
        {TABS.map(renderTab)}
      </div>
    );
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 flex items-stretch border-t border-white/10"
      style={{ backgroundColor: "#161618" }}
    >
      {TABS.map(renderTab)}
    </nav>
  );
}
