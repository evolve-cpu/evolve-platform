import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../hooks/useAuth";
// import GrowthMascot from "../components/GrowthMascot"; // growth feature disabled
import Spinner from "../components/Spinner";
import { stageForProgress, stageLabel, STAGE_LABELS } from "../lib/growthStage";
import { getPortfolioReviewProgress } from "../lib/portfolioReviewProgress";
import { isTrialActive, trialDaysLeft } from "../lib/trial";
import TrialSheet from "../components/TrialSheet";
import { TrialClockBadge } from "../components/TrialBadge";
import PortfolioReviewProgramme from "../components/programmes/PortfolioReviewProgramme";
import MentorshipProgramme from "../components/programmes/MentorshipProgramme";
import AppTabNav from "../components/AppTabNav";
import {
  AccountMenuList,
  MyAccountPanel,
  InvoicePanel,
  UserIcon,
  InvoiceIcon,
  LogOutIcon,
  TrashIcon,
  AIProfileReveal,
  ProfileTabPane
} from "../components/AccountPanel";
import {
  evolve_yellow_logo,
  evolve_yellow_with_name,
  right_arrow_icon
} from "../assets/images/Nav";

// short encouragement line shown under the stage badge in the growth rail,
// one per unique label in STAGE_LABELS (src/lib/growthStage.js).
const GROWTH_ENCOURAGEMENT = {
  seed: "you're just getting started — keep going.",
  sprouting: "growing steadily — keep showing up.",
  budding: "your work is starting to bloom.",
  growing: "real momentum now — don't stop.",
  blooming: "you're in full bloom — almost there."
};

/* ─── small building blocks ──────────────────────────────────────────────── */
function WhatsAppIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="12" fill="#25D366" />
      <path
        d="M12 6.5c-3.04 0-5.5 2.46-5.5 5.5 0 1.02.28 1.97.76 2.79L6.5 17.5l2.83-.74a5.47 5.47 0 002.67.69c3.04 0 5.5-2.46 5.5-5.5s-2.46-5.5-5.5-5.5z"
        fill="white"
      />
      <path
        d="M9.8 9.4c.13-.29.27-.3.39-.3h.33c.1 0 .25-.04.39.3.14.33.47 1.15.51 1.23.04.09.07.19.01.3-.06.11-.09.18-.17.28l-.25.29c-.08.08-.17.17-.07.34.1.17.43.7.92 1.14.63.56 1.16.74 1.33.82.17.08.27.07.36-.04.1-.11.41-.48.52-.65.11-.16.22-.14.37-.08.15.05.96.45 1.13.54.16.08.27.12.31.19.04.07.04.4-.1.79-.14.39-.8.74-1.11.79-.29.04-.65.06-1.04-.07-.24-.08-.55-.18-.94-.35-1.66-.72-2.74-2.4-2.83-2.5-.08-.11-.68-.9-.68-1.72s.43-1.22.58-1.38z"
        fill="#25D366"
      />
    </svg>
  );
}

function Section({ title, action, children }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-white/30 text-[10px] font-bold uppercase tracking-wide">
          {title}
        </p>
        {action}
      </div>
      {children}
    </div>
  );
}

// Cards either route away (href, via Link) or open the programme right in
// the dashboard's own content pane (onClick) — Portfolio Review and
// Mentorship both do the latter so the sidebar stays put instead of the
// whole page navigating.
function ProgramCard({
  art,
  label,
  description,
  href,
  onClick,
  progress,
  buttonLabel,
  disabled
}) {
  const Tag = disabled ? "div" : onClick ? "button" : Link;
  const tagProps = disabled
    ? {}
    : onClick
      ? { type: "button", onClick }
      : { to: href };
  const reportReady = progress?.step === 5;
  return (
    <Tag
      {...tagProps}
      className={`flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden transition-colors text-left w-full ${
        disabled ? "" : "hover:border-evolve-lavender-indigo/50"
      }`}
    >
      <div className="h-[150px] flex-shrink-0 overflow-hidden">{art}</div>
      <div className="flex flex-col gap-3 px-5 py-5 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-white text-base md:text-lg font-bold font-bricolage capitalize">
            {label}
          </span>
          {progress && (
            <span
              className={`flex items-center gap-1.5 text-[11px] md:text-xs font-bold uppercase tracking-wide ${
                reportReady ? "text-evolve-inchworm" : "text-evolve-yellow"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${reportReady ? "bg-evolve-inchworm" : "bg-evolve-yellow"}`}
              />
              {reportReady ? "Report ready" : "Under review"}
            </span>
          )}
        </div>
        <p className="text-white/40 text-sm md:text-[15px] leading-relaxed">
          {description}
        </p>
        {progress && (
          <div className="flex flex-col gap-1.5 mt-auto">
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-evolve-yellow rounded-full transition-[width]"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] md:text-xs font-semibold text-white/40">
              <span>
                Step {progress.step} of {progress.totalSteps} · {progress.label}
              </span>
              <span className="text-white/60">{progress.percent}%</span>
            </div>
          </div>
        )}
        {disabled ? (
          <span className="mt-1 inline-flex items-center justify-center gap-2 bg-white/[0.03] text-white/40 text-sm font-bold px-4 py-2.5 w-fit rounded-[10px] border border-white/10 opacity-50">
            Coming soon
          </span>
        ) : (
          <span
            className="mt-1 inline-flex items-center justify-center gap-2 bg-evolve-yellow text-evolve-black text-sm font-extrabold px-4 py-2.5 w-fit border-2 border-evolve-black hover:opacity-90 transition-opacity"
            style={{ borderRadius: 10, boxShadow: "4px 4px 0 0 #000000" }}
          >
            {buttonLabel || "Explore program"}
            <img src={right_arrow_icon} alt="" className="w-4 h-4" />
          </span>
        )}
      </div>
    </Tag>
  );
}

// The Events tab pane — browsing published events from inside the platform
// itself instead of sending the owner out to the marketing site's /events
// page. Booking/tickets stay on the existing /events/:slug (EventDetail.jsx)
// flow rather than duplicating that logic here; this is just the in-platform
// entry point into it.
function EventsTabPane() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("upcoming");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("events")
      .select("*")
      .eq("status", "published")
      .order("start_time", { ascending: true })
      .then(({ data }) => {
        if (!cancelled) {
          setEvents(data || []);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const now = Date.now();
  const q = search.trim().toLowerCase();
  const filtered = events
    .filter((e) =>
      filter === "upcoming"
        ? new Date(e.start_time).getTime() >= now
        : new Date(e.start_time).getTime() < now
    )
    .filter((e) => !q || e.title?.toLowerCase().includes(q))
    .sort((a, b) =>
      filter === "upcoming"
        ? new Date(a.start_time) - new Date(b.start_time)
        : new Date(b.start_time) - new Date(a.start_time)
    );

  return (
    <Section
      title="events"
      action={
        <div className="flex items-center gap-1 rounded-full border border-white/10 p-0.5">
          {["upcoming", "past"].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`text-[11px] font-semibold capitalize rounded-full px-3 py-1 transition-colors ${
                filter === f
                  ? "bg-evolve-yellow text-evolve-black"
                  : "text-white/50 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      }
    >
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="search events…"
        className="w-full text-sm text-white outline-none border border-[#373737] rounded-xl px-4 py-2.5 transition-colors focus:border-evolve-yellow/60"
        style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
      />

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner size={28} />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-white/40 text-sm py-10 text-center">
          {filter === "upcoming"
            ? "No upcoming events right now — check back soon."
            : "No past events yet."}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((event) => (
            <Link
              key={event.id}
              to={`/events/${event.slug}`}
              className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden hover:border-white/20 transition-colors flex flex-col"
            >
              {event.cover_image_url && (
                <img
                  src={event.cover_image_url}
                  alt=""
                  className="w-full h-32 object-cover"
                />
              )}
              <div className="p-3.5 flex flex-col gap-1">
                <span className="text-evolve-yellow text-[10px] font-bold uppercase tracking-wide">
                  {event.event_type || "event"}
                </span>
                <p className="text-white text-sm font-bold leading-snug">
                  {event.title}
                </p>
                <p className="text-white/40 text-xs">
                  {new Date(event.start_time).toLocaleDateString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Section>
  );
}

// Desktop-only "my profile" / "grow" switcher — replaces AppTabNav's pill
// row in the header on this page; mobile keeps the bottom AppTabNav as its
// only tab switcher, so this never renders below the md breakpoint.
function DesktopProfileTabs({ activeTab, onTabChange }) {
  const tabs = [
    { key: "profile", label: "my profile" },
    { key: "grow", label: "grow" }
  ];
  return (
    <div className="hidden md:flex items-center gap-6 border-b border-white/10 mb-2">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onTabChange(t.key)}
          className={`pb-3 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${
            activeTab === t.key
              ? "text-white border-evolve-yellow"
              : "text-white/40 border-transparent hover:text-white/70"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// Persistent "N days left" banner — desktop only. Separate from TrialSheet
// (the one-time "trial started" modal): that fires once on first visit, this
// stays put as a page banner for the rest of the trial. No billing/upgrade
// flow exists yet, so "Upgrade" just surfaces a short inline notice instead
// of linking anywhere real.
function TrialBar({ daysLeft }) {
  const [noticeOpen, setNoticeOpen] = useState(false);
  return (
    <div
      className="hidden md:flex items-center justify-between gap-4 px-8 py-3 border-b border-white/10"
      style={{ backgroundColor: "rgba(255,208,7,0.05)" }}
    >
      <div className="flex items-center gap-2.5">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-evolve-yellow flex-shrink-0">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-white/70 text-xs">
          <span className="font-bold text-white">{daysLeft ?? 14} days left</span> in your
          free trial — my profile and grow are on the house for now.
        </p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {noticeOpen && (
          <span className="text-white/40 text-[11px]">upgrade plans are launching soon</span>
        )}
        <button
          type="button"
          onClick={() => setNoticeOpen(true)}
          className="border border-evolve-yellow/50 text-evolve-yellow text-xs font-bold rounded-full px-4 py-1.5 hover:bg-evolve-yellow/10 transition-colors"
        >
          Upgrade
        </button>
      </div>
    </div>
  );
}

const EVENTS_RAIL_COLORS = ["#A35BFB", "#DF0586", "#01F1D9", "#FFB14F"];

// Desktop-only right rail — replaces the sidebar's old spot with upcoming
// events instead of identity (identity moved into ProfileTabPane's header).
// Collapsible via the chevron pinned to its left edge, same interaction
// pattern the old sidebar's collapse toggle used.
function EventsRailPanel({ collapsed, onToggleCollapsed, onGoToEvents }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [goingCount, setGoingCount] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("status", "published")
        .gte("start_time", new Date().toISOString())
        .order("start_time", { ascending: true })
        .limit(5);
      if (cancelled) return;
      setEvents(data || []);
      setLoading(false);
      if (data?.[0]) {
        const { count } = await supabase
          .from("event_registrations")
          .select("id", { count: "exact", head: true })
          .eq("event_id", data[0].id)
          .eq("status", "registered");
        if (!cancelled) setGoingCount(count ?? 0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function fmtDate(iso) {
    return new Date(iso).toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }
  function fmtTime(iso) {
    return new Date(iso).toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      minute: "2-digit"
    });
  }

  if (collapsed) {
    return (
      <div className="hidden md:flex flex-col items-center pt-8 px-3 flex-shrink-0">
        <button
          type="button"
          onClick={onToggleCollapsed}
          title="show events"
          className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 20 20" fill="none" style={{ transform: "scaleX(-1)" }}>
            <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    );
  }

  const [featured, ...rest] = events;

  return (
    <div className="hidden md:flex md:w-[340px] flex-shrink-0 flex-col gap-4 border-l border-white/10 px-6 py-8 relative">
      <button
        type="button"
        onClick={onToggleCollapsed}
        title="hide events"
        className="absolute -left-3.5 top-8 w-7 h-7 rounded-full bg-evolve-black border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
          <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <p className="text-white/40 text-xs font-bold uppercase tracking-wide">Events</p>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner size={22} />
        </div>
      ) : !featured ? (
        <p className="text-white/40 text-xs">No upcoming events right now.</p>
      ) : (
        <>
          <Link
            to={`/events/${featured.slug}`}
            className="rounded-2xl overflow-hidden border border-white/10 relative hover:border-white/20 transition-colors"
          >
            <div className="aspect-[4/3]">
              {featured.cover_image_url ? (
                <img src={featured.cover_image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-evolve-yellow" />
              )}
            </div>
            {featured.event_type && (
              <span className="absolute top-3 left-3 bg-white text-black text-[10px] font-bold uppercase px-2 py-1 rounded-full">
                {featured.event_type}
              </span>
            )}
          </Link>
          <div className="flex flex-col gap-1 -mt-1">
            <p className="text-white font-bold text-sm leading-snug">{featured.title}</p>
            {featured.speaker_name && (
              <p className="text-white/40 text-xs">
                {featured.speaker_name}
                {featured.speaker_title ? ` · ${featured.speaker_title}` : ""}
              </p>
            )}
            <p className="text-white/50 text-xs mt-1">
              {fmtDate(featured.start_time)} · {fmtTime(featured.start_time)}
            </p>
          </div>
          <div className="flex items-center justify-between gap-3">
            {goingCount !== null && (
              <span className="text-white/40 text-xs">{goingCount} going</span>
            )}
            <Link
              to={`/events/${featured.slug}`}
              className="bg-evolve-yellow text-evolve-black font-bold text-xs rounded-full px-4 py-2 hover:opacity-90 transition-opacity"
            >
              View Event
            </Link>
          </div>

          {rest.length > 0 && (
            <div className="flex flex-col mt-2">
              {rest.map((event, i) => (
                <Link
                  key={event.id}
                  to={`/events/${event.slug}`}
                  className="flex items-start gap-3 py-3 border-t border-white/10 hover:opacity-80 transition-opacity"
                >
                  <span
                    className="w-9 h-9 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: EVENTS_RAIL_COLORS[i % EVENTS_RAIL_COLORS.length] }}
                  />
                  <div className="min-w-0">
                    <p className="text-white text-xs font-bold truncate">{event.title}</p>
                    <p className="text-white/40 text-[11px] mt-0.5">
                      {fmtDate(event.start_time)} · {fmtTime(event.start_time)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={onGoToEvents}
            className="text-evolve-yellow text-[11px] font-bold uppercase tracking-wide self-start mt-1 hover:opacity-80"
          >
            View all
          </button>
        </>
      )}
    </div>
  );
}

/* ─── page ───────────────────────────────────────────────────────────────── */
export default function PublicProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isOwner = user?.username === username;

  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  // which programme (if any) is open in the right-hand pane — replaces the
  // "evolve programmes" grid in place instead of navigating to a new route,
  // so the sidebar stays put. `sidebarCollapsed` lets the owner tuck that
  // panel away for more room — on desktop it's a slim icon rail, on mobile
  // it's a compact "stage N" summary bar instead of the full profile panel.
  // Initialized from router state so a redirect after a username change
  // (see handleAccountSaved) can land back on the same panel instead of the
  // dashboard default. Falls back to the "open_mentorship_card" sessionStorage
  // flag — set by the /mentorship marketing page's "get started" CTA before
  // it sends the visitor through sign-in/onboarding, which always land back
  // on a plain /profile/:username with no router state (see Onboarding.jsx),
  // so the flag is what lets us still open the mentorship pane once they land.
  const hadMentorshipRedirectFlag =
    typeof window !== "undefined" &&
    sessionStorage.getItem("open_mentorship_card") === "1";
  const [activeProgramme, setActiveProgramme] = useState(
    location.state?.activeProgramme ||
      (hadMentorshipRedirectFlag ? "mentorship" : null)
  );
  // once a pane has been opened, keep it mounted (just hidden via CSS)
  // instead of unmounting it on every switch — so reopening a programme (or
  // hopping back to it after visiting another tab) doesn't reset its
  // internal state or re-trigger its data fetch from scratch.
  const [visitedProgrammes, setVisitedProgrammes] = useState(() =>
    new Set(
      location.state?.activeProgramme
        ? [location.state.activeProgramme]
        : hadMentorshipRedirectFlag
          ? ["mentorship"]
          : []
    )
  );
  useEffect(() => {
    if (activeProgramme && !visitedProgrammes.has(activeProgramme)) {
      setVisitedProgrammes((prev) => new Set(prev).add(activeProgramme));
    }
  }, [activeProgramme, visitedProgrammes]);
  // which top-level section of the dashboard is showing when no programme
  // pane is open — independent of `activeProgramme` above, which still
  // handles portfolio-review/mentorship/account/etc. exactly as before.
  const [activeTab, setActiveTab] = useState("profile");

  function handleTabChange(tab) {
    setActiveProgramme(null);
    setActiveTab(tab);
  }

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // desktop-only right rail (upcoming events) — replaces the identity
  // sidebar's spot for the owner's own dashboard, see EventsRailPanel.
  const [eventsRailCollapsed, setEventsRailCollapsed] = useState(false);
  // the desktop collapse/expand toggle only shows up while hovering the
  // sidebar rail (or the button itself, since it straddles the rail's edge).
  const [sidebarHovered, setSidebarHovered] = useState(false);
  // mobile-only growth-stage card (dashboard view only, see the aside below)
  // — its stage list expands in place via this accordion instead of
  // reusing the desktop "expand the whole panel" toggle.
  const [mobileGrowthOpen, setMobileGrowthOpen] = useState(false);

  // consume the redirect flag once — it should only open the pane for the
  // page load it was set for, not linger across future visits.
  useEffect(() => {
    if (hadMentorshipRedirectFlag) {
      sessionStorage.removeItem("open_mentorship_card");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 14-day free trial: shown once, the first time the owner lands on their
  // own platform page with an active trial. "Seen" is tracked in
  // localStorage (per user) rather than a DB write — losing that flag (new
  // device, cleared storage) just means the sheet shows again, which is a
  // harmless replay, not a bug worth a round trip for.
  const [showTrialSheet, setShowTrialSheet] = useState(false);
  useEffect(() => {
    if (!isOwner || !user?.id) return;
    if (!isTrialActive(user.trial_ends_at)) return;
    const key = `evolve_trial_sheet_seen_${user.id}`;
    if (typeof window !== "undefined" && !localStorage.getItem(key)) {
      setShowTrialSheet(true);
    }
  }, [isOwner, user?.id, user?.trial_ends_at]);

  function dismissTrialSheet() {
    setShowTrialSheet(false);
    if (user?.id) {
      localStorage.setItem(`evolve_trial_sheet_seen_${user.id}`, "1");
    }
  }

  // default collapsed on mobile (short summary) / expanded on desktop —
  // checked once on mount only, so it doesn't fight a user's own toggle
  // afterward as the window resizes.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (location.state?.activeProgramme || hadMentorshipRedirectFlag) {
      setSidebarCollapsed(true);
    } else {
      setSidebarCollapsed(!window.matchMedia("(min-width: 768px)").matches);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openProgramme(id) {
    setActiveProgramme(id);
    setSidebarCollapsed(true);
  }

  // the stage-by-stage list (1-10, fading out past the current stage) —
  // shared between the desktop sidebar panel and the mobile dashboard-only
  // growth card's accordion, so the two never drift apart.
  function renderGrowthMap() {
    const currentStage = stageForProgress(card.growth_stage ?? 0);
    const totalStages = STAGE_LABELS.length;
    return (
      <div className="flex flex-col gap-1">
        <p className="text-white/25 text-[10px] md:text-xs font-bold uppercase tracking-wide px-2.5">
          growth map
        </p>
        <div className="flex flex-col gap-4">
          {/* every stage shipped so far (1-10) lives under one "seed"
              heading — the line + fill track progress only through this
              section. anything beyond stage 10 isn't built yet, so the
              list just fades out at the bottom instead of listing locked
              stages. */}
          <div
            className="relative flex flex-col gap-1 pb-2"
            style={{
              WebkitMaskImage:
                "linear-gradient(to bottom, black, black calc(100% - 34px), transparent 100%)",
              maskImage:
                "linear-gradient(to bottom, black, black calc(100% - 34px), transparent 100%)"
            }}
          >
            <div className="absolute left-[18px] top-1 bottom-1 w-px bg-white/10" />
            <div
              className="absolute left-[18px] top-1 w-px bg-evolve-inchworm transition-[height]"
              style={{
                height: `${(currentStage / totalStages) * 100}%`
              }}
            />
            <p className="flex items-center gap-2 px-2.5 text-[11px] md:text-sm font-bold uppercase tracking-wide text-evolve-inchworm">
              <span className="w-4 flex-shrink-0" />
              seed
            </p>
            <div className="flex flex-col gap-0.5">
              {Array.from({ length: totalStages }, (_, i) => i + 1).map(
                (stageNum) => {
                  const current = stageNum === currentStage;
                  const reached = stageNum <= currentStage;
                  if (current) {
                    return (
                      <div
                        key={stageNum}
                        className="flex items-center gap-2 rounded-lg bg-evolve-inchworm/10 px-2.5 py-1.5"
                      >
                        <span className="w-4 flex justify-center flex-shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-evolve-inchworm flex-shrink-0" />
                        </span>
                        <span className="flex flex-col">
                          <span className="text-evolve-inchworm text-xs md:text-sm font-bold">
                            Stage {stageNum}
                          </span>
                          <span className="text-white/40 text-[11px] md:text-sm">
                            You are here
                          </span>
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={stageNum}
                      className="flex items-center gap-2 px-2.5 py-1.5"
                    >
                      <span className="w-4 flex justify-center flex-shrink-0">
                        <span
                          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${reached ? "bg-evolve-inchworm" : "bg-white/15"}`}
                        />
                      </span>
                      <span
                        className={`text-xs md:text-base font-semibold ${reached ? "text-white/50" : "text-white/25"}`}
                      >
                        Stage {stageNum}
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // account menu — desktop gets a floating dropdown off the avatar; mobile
  // (no room for a dropdown) gets a dedicated menu panel in the main pane
  // instead, reusing the same activeProgramme swap the other panels use.
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const accountMenuRef = useRef(null);

  useEffect(() => {
    if (!accountMenuOpen) return;
    function onClickOutside(e) {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(e.target)
      ) {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [accountMenuOpen]);

  function handleAvatarClick() {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 768px)").matches
    ) {
      setAccountMenuOpen((v) => !v);
    } else {
      openProgramme("account-menu");
    }
  }

  // the URL is keyed off the username (/profile/:username) — if the owner
  // just renamed it from this same "account" panel, the current URL now
  // points at a username that no longer exists, so hop over to the new one
  // (replacing history, not pushing) and hand the redirect the panel state
  // it's already sitting on so it doesn't get bounced back to the dashboard.
  function handleAccountSaved(newUsername) {
    navigate(`/profile/${newUsername}`, {
      replace: true,
      state: { activeProgramme: "account" }
    });
  }

  function handleLogOut() {
    setAccountMenuOpen(false);
    setLogoutConfirmOpen(true);
  }

  async function confirmLogOut() {
    setLogoutConfirmOpen(false);
    await supabase.auth.signOut();
    navigate("/");
  }

  async function handleDeleteAccount() {
    setAccountMenuOpen(false);
    setDeleteConfirmOpen(false);
    const { error } = await supabase.rpc("delete_own_account");
    if (error) {
      window.alert(
        "Couldn't delete your account right now — please contact support."
      );
      return;
    }
    await supabase.auth.signOut();
    navigate("/");
  }

  const accountActive =
    accountMenuOpen ||
    ["account-menu", "account", "invoice"].includes(activeProgramme);
  const [evolveReview, setEvolveReview] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setNotFound(false);

    if (isOwner) {
      setCard(user);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profile_cards")
      .select("*")
      .eq("username", username)
      .maybeSingle();

    if (error || !data) {
      setNotFound(true);
    } else {
      setCard(data);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, isOwner]);

  useEffect(() => {
    load();
  }, [load]);

  // when viewing your own profile, `card` starts as a snapshot of `user`
  // (see `load` above) — re-sync it whenever `user` changes (e.g. after
  // `refreshUser()` bumps growth_stage inline, without a remount) so the
  // growth-stage badge updates immediately instead of only after a reload.
  useEffect(() => {
    if (isOwner && user) setCard(user);
  }, [isOwner, user]);

  // drives the Portfolio Review card's progress pill/bar — re-checked
  // whenever the owner steps back out of a programme pane (e.g. after
  // saving a draft and returning), so the card reflects the latest state.
  // A user can go through more than one review cycle (see
  // evolve_portfolio_reviews_cycles migration), so this pulls the most
  // recent one — that's the cycle the card's progress should reflect.
  const loadEvolveReview = useCallback(async () => {
    if (!isOwner || !user) {
      setEvolveReview(null);
      return;
    }
    const { data } = await supabase
      .from("evolve_portfolio_reviews")
      .select("*")
      .eq("user_id", user.id)
      .order("attempt", { ascending: false })
      .limit(1)
      .maybeSingle();
    setEvolveReview(data || null);
  }, [isOwner, user]);

  // drives the Mentorship card's "Continue program" vs "Explore program"
  // label — same re-check-on-return pattern as loadEvolveReview above.
  const [mentorshipEnrollment, setMentorshipEnrollment] = useState(null);
  const loadMentorshipEnrollment = useCallback(async () => {
    if (!isOwner || !user) {
      setMentorshipEnrollment(null);
      return;
    }
    const { data } = await supabase
      .from("mentorship_enrollments")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "success")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setMentorshipEnrollment(data || null);
  }, [isOwner, user]);

  useEffect(() => {
    if (!activeProgramme) {
      loadEvolveReview();
      loadMentorshipEnrollment();
    }
  }, [activeProgramme, loadEvolveReview, loadMentorshipEnrollment]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#161618" }}
      >
        <Spinner size={40} />
      </div>
    );
  }

  if (notFound) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-6"
        style={{ backgroundColor: "#161618" }}
      >
        <p className="text-white font-bold text-xl">No profile here yet.</p>
        <p className="text-white/40 text-sm">
          The username "{username}" hasn't been claimed.
        </p>
      </div>
    );
  }

  const showOwnerTools = isOwner;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#161618" }}
    >
      {/* top bar — sticky: stays put while the page scrolls beneath it.
          The whole page (sidebar + main) shares a single scrollbar — no
          independently-scrolling panes, so only one scrollbar ever shows. */}
      <div
        className="sticky top-0 z-40 flex items-center justify-between px-6 md:px-8 py-4 border-b border-white/10 flex-shrink-0"
        style={{ backgroundColor: "#161618" }}
      >
        <Link to="/">
          <img
            src={evolve_yellow_logo}
            alt="evolve"
            className="h-6 w-auto md:hidden"
          />
          <img
            src={evolve_yellow_with_name}
            alt="evolve"
            className="hidden md:block h-6 w-auto"
          />
        </Link>
        <div className="flex items-center gap-2.5">
          <a
            href="https://chat.whatsapp.com/DsLtzxlHPQXC4Gaee76qz4?s=cl&p=a&ilr=4"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 text-sm font-semibold text-white/70 border border-white/15 rounded-full pl-2 pr-4 py-2 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <WhatsAppIcon className="w-6 h-6 flex-shrink-0" />
            Evolve community
          </a>
          <button
            title="notifications"
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] flex-shrink-0 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 8A6 6 0 106 8c0 7-3 9-3 9h18s-3-2-3-9z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path
                d="M13.73 21a2 2 0 01-3.46 0"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
          {user ? (
            <div className="relative" ref={accountMenuRef}>
              <button
                type="button"
                onClick={handleAvatarClick}
                className={`w-8 h-8 rounded-full overflow-hidden bg-white/10 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 transition-colors ${
                  accountActive
                    ? "border-2 border-[#373737]"
                    : "border-2 border-transparent"
                }`}
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (user.name || "?")[0].toUpperCase()
                )}
              </button>
              {isOwner && isTrialActive(user.trial_ends_at) && (
                <TrialClockBadge size={14} className="absolute -bottom-0.5 -right-0.5" />
              )}

              {accountMenuOpen && (
                <div className="hidden md:flex flex-col gap-1 absolute right-0 top-11 w-56 rounded-2xl bg-[#1c1c1f] border border-[#373737] p-1.5 z-50">
                  <button
                    type="button"
                    onClick={() => {
                      setAccountMenuOpen(false);
                      openProgramme("account");
                    }}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-white text-sm font-semibold hover:bg-[#232325] transition-colors"
                  >
                    <UserIcon className="text-white/50 flex-shrink-0" />
                    My Account
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAccountMenuOpen(false);
                      openProgramme("invoice");
                    }}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-white text-sm font-semibold hover:bg-[#232325] transition-colors"
                  >
                    <InvoiceIcon className="text-white/50 flex-shrink-0" />
                    Invoice
                  </button>
                  <button
                    type="button"
                    onClick={handleLogOut}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-white text-sm font-semibold hover:bg-[#232325] transition-colors text-left"
                  >
                    <LogOutIcon className="text-white/50 flex-shrink-0" />
                    Log Out
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAccountMenuOpen(false);
                      setDeleteConfirmOpen(true);
                    }}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-red-400 text-sm font-semibold hover:bg-[#232325] transition-colors text-left"
                  >
                    <TrashIcon className="text-red-400 flex-shrink-0" />
                    Delete Account
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/signin"
              className="text-xs font-semibold text-evolve-black bg-evolve-yellow rounded-full px-4 py-2"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>

      {isOwner && !activeProgramme && isTrialActive(user.trial_ends_at) && (
        <TrialBar daysLeft={trialDaysLeft(user.trial_ends_at)} />
      )}

      {showTrialSheet && (
        <TrialSheet
          daysLeft={trialDaysLeft(user.trial_ends_at)}
          onClose={dismissTrialSheet}
        />
      )}

      {deleteConfirmOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center px-6"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-[#373737] p-6 flex flex-col gap-4"
            style={{ backgroundColor: "#1c1c1f" }}
          >
            <h3 className="text-white font-bold text-lg">
              Delete your account?
            </h3>
            <p className="text-white/50 text-sm leading-relaxed">
              This permanently removes your profile and everything tied to it.
              This can't be undone.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="text-white font-bold text-xs rounded-2xl border border-[#373737] hover:bg-[#232325] px-5 py-2.5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="bg-red-500 text-white font-bold text-xs rounded-2xl px-5 py-2.5 hover:opacity-90 transition-opacity"
              >
                Delete my account
              </button>
            </div>
          </div>
        </div>
      )}

      {logoutConfirmOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center px-6"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-[#373737] p-6 flex flex-col gap-4"
            style={{ backgroundColor: "#1c1c1f" }}
          >
            <h3 className="text-white font-bold text-lg">Log out?</h3>
            <p className="text-white/50 text-sm leading-relaxed">
              You'll need to sign in again to get back to your profile and
              programmes.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                type="button"
                onClick={() => setLogoutConfirmOpen(false)}
                className="text-white font-bold text-xs rounded-2xl border border-[#373737] hover:bg-[#232325] px-5 py-2.5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLogOut}
                className="bg-red-500 text-white font-bold text-xs rounded-2xl px-5 py-2.5 hover:opacity-90 transition-opacity"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row">
        {/* sidebar — collapsible into a compact summary on both desktop
            (slim icon rail) and mobile (short "stage N" bar at the top),
            so a programme (or its payment flow) in the main pane can claim
            more width/height without losing the person's context entirely.
            Sticky (not independently scrolling) so the whole page shares a
            single scrollbar with <main> instead of each pane scrolling on
            its own. */}
        <aside
          onMouseEnter={() => setSidebarHovered(true)}
          onMouseLeave={() => setSidebarHovered(false)}
          className={`w-full ${
            isOwner
              ? "md:hidden"
              : `${sidebarCollapsed ? "md:w-[84px]" : "md:w-[300px]"} md:border-r border-white/10 md:sticky md:top-16 md:self-start md:min-h-[calc(100vh-4rem)]`
          } flex-shrink-0 flex flex-col transition-[width] duration-200`}
        >
          {/* ── mobile: compact growth-stage card, dashboard view only —
              on every other pane (account, invoice, an opened programme,
              ...) this whole thing is absent on mobile, so main content
              starts right under the top nav instead. Its own accordion
              reveals the stage list in place; it doesn't reuse the
              desktop "expand the whole panel" toggle. ── */}
          {/* growth feature (mascot / stage badge / growth map) disabled —
              see renderGrowthMap() above and GrowthMascot import; kept in
              code, not deleted, per product decision to drop it for now.
              Identity (name/username) still shows here on mobile — desktop's
              copy of this now lives in ProfileTabPane's own header instead
              (see the block below, which is visitor-view only). */}
          {!activeProgramme && (
            <div className="md:hidden flex flex-col border-b border-white/10">
              <div className="flex items-center gap-3 px-5 py-4 w-full text-left">
                <div className="relative w-12 h-12 flex-shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 flex items-center justify-center text-white text-sm font-bold">
                    {card.avatar_url ? (
                      <img src={card.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (card.name || "?")[0].toUpperCase()
                    )}
                  </div>
                  {isOwner && isTrialActive(card.trial_ends_at) && (
                    <TrialClockBadge size={16} className="absolute -bottom-0.5 -right-0.5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">
                    {card.name || "evolve designer"}
                  </p>
                  <p className="text-white/40 text-xs mt-0.5">@{username}</p>
                </div>
              </div>
            </div>
          )}

          {/* ── desktop: full panel — owner-only page uses the new
              no-sidebar layout instead (identity moved into ProfileTabPane's
              header), so this only ever renders for a visitor viewing
              someone else's profile. Hidden entirely while collapsed. ── */}
          {!isOwner && !sidebarCollapsed && (
            <div className="hidden md:flex md:flex-col gap-5 px-6 py-8">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-white/10 flex items-center justify-center text-white text-2xl font-bold">
                    {card.avatar_url ? (
                      <img src={card.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (card.name || "?")[0].toUpperCase()
                    )}
                  </div>
                  {isOwner && isTrialActive(card.trial_ends_at) && (
                    <TrialClockBadge size={22} className="absolute bottom-0 right-0" />
                  )}
                </div>
                <div>
                  <h1 className="text-white font-bold text-lg">
                    {card.name || "evolve designer"}
                  </h1>
                  <p className="text-white/40 text-xs mt-0.5">@{username}</p>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* desktop-only collapse toggle — a small square button pinned to
            the bottom-right corner of the rail, straddling its edge. Fixed
            to the viewport (not absolute within the aside) so it stays put
            at a consistent spot on screen no matter how tall the page is or
            how far the user has scrolled — an aside that's merely `sticky`
            only spans its own box height, so an absolutely-positioned
            button anchored to its bottom edge scrolls out of view on long
            pages instead of tracking the viewport. */}
        {!isOwner && (
          <button
            type="button"
            onClick={() => setSidebarCollapsed((v) => !v)}
            onMouseEnter={() => setSidebarHovered(true)}
            onMouseLeave={() => setSidebarHovered(false)}
            title={sidebarCollapsed ? "expand panel" : "collapse panel"}
            className={`hidden md:flex w-8 h-8 rounded-lg bg-evolve-black border border-white/10 items-center justify-center text-white fixed bottom-5 z-50 transition-opacity duration-150 ${
              sidebarHovered ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            style={{ left: sidebarCollapsed ? 68 : 284 }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 20 20"
              fill="none"
              style={{ transform: sidebarCollapsed ? "none" : "scaleX(-1)" }}
            >
              <path
                d="M7.5 5L12.5 10L7.5 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        {/* main content — flows in the same single page scroll as
            everything else; the sticky top bar and sidebar stay in place
            above/beside it. Bottom padding is dropped while the Portfolio
            Review programme is open since its own sticky enrol bar supplies
            that spacing itself (avoids a gap between the bar and the true
            bottom of the page). */}
        <main
          className={`flex-1 px-6 md:px-8 pt-8 flex flex-col gap-8 ${
            activeProgramme === "portfolio-review" ? "pb-0" : "pb-8"
          } ${!activeProgramme && isOwner ? "pb-24 md:pb-8" : ""}`}
        >
          {isOwner && !activeProgramme && (
            <DesktopProfileTabs activeTab={activeTab} onTabChange={handleTabChange} />
          )}

          {/* dashboard grid — the base pane, always mounted (not gated by
              `visitedProgrammes`); hidden via CSS instead of unmounted
              whenever another pane is open, same "keep it mounted" approach
              as every pane below, so nothing here has to reload either.
              Split into activeTab sections: "profile" (identity/growth/AI
              profile), "grow" (the programmes grid), "community" (coming
              soon) — independent of the activeProgramme pane swap above. */}
          <div className={activeProgramme ? "hidden" : "contents"}>
            <div className={activeTab === "profile" ? "contents" : "hidden"}>
              {isOwner && !user.onboarding_completed && (
                <button
                  onClick={() => navigate("/onboarding", { state: { completeProfile: true } })}
                  className="w-full text-left rounded-xl border border-evolve-yellow/25 bg-evolve-yellow/[0.06] px-4 py-3 flex flex-col gap-0.5 hover:bg-evolve-yellow/[0.1] transition-colors"
                >
                  <span className="text-evolve-yellow text-xs font-bold">complete your profile →</span>
                  <span className="text-white/40 text-[11px] leading-relaxed">
                    a few quick questions to personalise your evolve experience.
                  </span>
                </button>
              )}

              {isOwner ? (
                <ProfileTabPane
                  user={user}
                  onGoToEvents={() => handleTabChange("events")}
                />
              ) : (
                card?.ai_profile && (
                  <Section title="AI-built profile">
                    <AIProfileReveal
                      profile={card.ai_profile}
                      portfolioLink={card.portfolio_link}
                      portfolioFileUrl={card.portfolio_file_url}
                      resumeLink={card.resume_link}
                      resumeFileUrl={card.resume_file_url}
                      socialLinks={card.social_links}
                    />
                  </Section>
                )
              )}
            </div>

            {showOwnerTools && (
              <div className={activeTab === "grow" ? "contents" : "hidden"}>
                <Section title="evolve programmes">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ProgramCard
                      art={
                        <img
                          src="https://res.cloudinary.com/diuswhkzn/image/upload/v1786435747/Portfolio_review_ci4ula.png"
                          alt="Portfolio Review"
                          className="w-full h-full object-cover"
                        />
                      }
                      label="portfolio review"
                      description="A live 1:1 review of your portfolio with a working industry reviewer, plus a written report."
                      onClick={() => openProgramme("portfolio-review")}
                      progress={getPortfolioReviewProgress(evolveReview)}
                      buttonLabel={
                        evolveReview
                          ? getPortfolioReviewProgress(evolveReview)?.step === 5
                            ? "Apply again"
                            : "Continue your review"
                          : undefined
                      }
                    />
                    <ProgramCard
                      art={
                        <img
                          src="https://res.cloudinary.com/diuswhkzn/image/upload/v1786435747/Mentorship_pawdce.png"
                          alt="Mentorship"
                          className="w-full h-full object-cover"
                        />
                      }
                      label="mentorship"
                      description="Personalised 1:1 mentorship to define your design career — someone in your corner until you land."
                      onClick={() => openProgramme("mentorship")}
                      buttonLabel={mentorshipEnrollment ? "Continue program" : undefined}
                    />
                  </div>
                  {/* mobile-only stand-in for the "evolve community" link
                      that's hidden from the top nav on small screens —
                      same destination, just living down here instead. */}
                  <a
                    href="https://chat.whatsapp.com/DsLtzxlHPQXC4Gaee76qz4?s=cl&p=a&ilr=4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="md:hidden flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors"
                  >
                    <WhatsAppIcon className="w-6 h-6 flex-shrink-0" />
                    Evolve community
                    <img
                      src={right_arrow_icon}
                      alt=""
                      className="w-3.5 h-3.5 ml-auto flex-shrink-0"
                    />
                  </a>
                </Section>
              </div>
            )}

            {activeTab === "events" && (
              <div className="contents">
                <EventsTabPane />
              </div>
            )}

            {activeTab === "community" && (
              <div className="flex flex-col items-center justify-center text-center gap-2 py-20">
                <p className="text-white font-bold text-lg">Community is coming soon</p>
                <p className="text-white/40 text-sm max-w-xs">
                  We're building a space to connect with other designers on evolve. Check back soon.
                </p>
              </div>
            )}
          </div>

          {/* every other pane: mounted once first opened, then kept mounted
              (just hidden) for the rest of the session — see
              `visitedProgrammes` above. */}
          {visitedProgrammes.has("portfolio-review") && (
            <div className={activeProgramme === "portfolio-review" ? "contents" : "hidden"}>
              <PortfolioReviewProgramme
                user={user}
                onBack={() => setActiveProgramme(null)}
              />
            </div>
          )}
          {visitedProgrammes.has("mentorship") && (
            <div className={activeProgramme === "mentorship" ? "contents" : "hidden"}>
              <MentorshipProgramme
                user={user}
                onBack={() => setActiveProgramme(null)}
              />
            </div>
          )}
          {visitedProgrammes.has("account-menu") && (
            <div className={activeProgramme === "account-menu" ? "contents" : "hidden"}>
              <AccountMenuList
                onBack={() => setActiveProgramme(null)}
                onSelect={(key) => setActiveProgramme(key)}
                onLogOut={handleLogOut}
                onDeleteAccount={() => setDeleteConfirmOpen(true)}
              />
            </div>
          )}
          {visitedProgrammes.has("account") && (
            <div className={activeProgramme === "account" ? "contents" : "hidden"}>
              <MyAccountPanel
                onBack={() => setActiveProgramme("account-menu")}
                onSaved={handleAccountSaved}
              />
            </div>
          )}
          {visitedProgrammes.has("invoice") && (
            <div className={activeProgramme === "invoice" ? "contents" : "hidden"}>
              <InvoicePanel onBack={() => setActiveProgramme("account-menu")} />
            </div>
          )}
        </main>

        {isOwner &&
          !activeProgramme &&
          (activeTab === "profile" || activeTab === "grow") && (
            <EventsRailPanel
              collapsed={eventsRailCollapsed}
              onToggleCollapsed={() => setEventsRailCollapsed((v) => !v)}
              onGoToEvents={() => handleTabChange("events")}
            />
          )}
      </div>

      {isOwner && !activeProgramme && (
        <AppTabNav variant="mobile" activeTab={activeTab} onTabChange={handleTabChange} />
      )}
    </div>
  );
}
