import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../hooks/useAuth";
// import GrowthMascot from "../components/GrowthMascot"; // growth feature disabled
import Spinner from "../components/Spinner";
import { stageForProgress, stageLabel, STAGE_LABELS } from "../lib/growthStage";
import { getPortfolioReviewProgress } from "../lib/portfolioReviewProgress";
import { isTrialActive } from "../lib/trial";
import {
  isEventOver,
  isEventLive,
  isTypetoberLive,
  TYPETOBER_EVENT
} from "../lib/events";
import { TrialClockBadge } from "../components/TrialBadge";
import {
  useMembership,
  trialBannerCopy
} from "../components/membership/MembershipProvider";
import PortfolioReviewProgramme from "../components/programmes/PortfolioReviewProgramme";
import MentorshipProgramme from "../components/programmes/MentorshipProgramme";
import AppTabNav from "../components/AppTabNav";
import EventDetail from "./EventDetail";
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
function DiscordIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="12" fill="#5865F2" />
      <path
        d="M16.94 7.88a11.4 11.4 0 00-2.86-.88l-.36.73a10.6 10.6 0 00-3.44 0l-.36-.73c-1 .17-1.96.47-2.86.88C5.25 10.6 4.76 13.25 5 15.86a11.5 11.5 0 003.5 1.77l.75-1.22c-.41-.15-.8-.34-1.17-.56l.29-.22a8.2 8.2 0 007.26 0l.29.22c-.37.22-.76.41-1.17.56l.75 1.22a11.5 11.5 0 003.5-1.77c.29-3.03-.49-5.65-2.06-7.98zM9.68 14.25c-.69 0-1.26-.64-1.26-1.42s.55-1.42 1.26-1.42c.7 0 1.27.64 1.26 1.42 0 .78-.56 1.42-1.26 1.42zm4.64 0c-.69 0-1.26-.64-1.26-1.42s.55-1.42 1.26-1.42c.7 0 1.27.64 1.26 1.42 0 .78-.55 1.42-1.26 1.42z"
        fill="white"
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

// Persistent trial / plan banner — desktop only (mobile gets the same copy
// from the clock badge on the avatar). Separate from the one-time VIP
// welcome sheet; this stays put for the rest of the trial and after it.
function TrialBar({ user }) {
  const { access, openPlans } = useMembership();
  const c = trialBannerCopy(user, access);
  return (
    <div
      className="hidden md:flex items-center justify-between gap-4 px-8 py-3 border-b border-white/10"
      style={{ backgroundColor: c.ending ? "rgba(255,53,91,0.06)" : "rgba(255,208,7,0.05)" }}
    >
      <div className="flex items-center gap-2.5">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          className="flex-shrink-0"
          style={{ color: c.ending ? "#FF355B" : "#FFD007" }}
        >
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-white/80 text-xs font-semibold">{c.text}</p>
      </div>
      <button
        type="button"
        onClick={() => openPlans(2)}
        className="flex-shrink-0 bg-evolve-yellow text-evolve-black text-xs font-bold rounded-full px-4 py-1.5 hover:opacity-90 transition-opacity"
      >
        {c.cta}
      </button>
    </div>
  );
}

const EVENTS_RAIL_COLORS = ["#A35BFB", "#DF0586", "#01F1D9", "#FFB14F"];

// Desktop-only right rail — replaces the sidebar's old spot with upcoming
// events instead of identity (identity moved into ProfileTabPane's header).
// Collapsible via the chevron pinned to its left edge, same interaction
// pattern the old sidebar's collapse toggle used.
// shared bits for the in-platform event lists (events tab + desktop rail)
function fmtEventDay(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}

function fmtEventTime(iso) {
  return new Date(iso).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit"
  });
}

function LiveDot() {
  return (
    <span className="relative flex w-1.5 h-1.5 flex-shrink-0">
      <span className="absolute inset-0 rounded-full bg-evolve-pink animate-ping opacity-75" />
      <span className="relative w-1.5 h-1.5 rounded-full bg-evolve-pink" />
    </span>
  );
}

// "Thu, Aug 20 · Recorded" / "● Live now" / "Fri, Oct 9 · 7:00 pm"
function EventWhen({ event }) {
  if (isEventLive(event)) {
    return (
      <span className="flex items-center gap-1.5 text-evolve-pink">
        <LiveDot />
        Live now
      </span>
    );
  }
  if (isEventOver(event)) {
    const recorded = event.recording_path || event.recording_url;
    return (
      <span>
        {fmtEventDay(event.start_time)}
        {recorded ? " · Recorded" : " · Ended"}
      </span>
    );
  }
  return (
    <span>
      {fmtEventDay(event.start_time)} · {fmtEventTime(event.start_time)}
    </span>
  );
}

function EventThumb({ src, index = 0, className = "" }) {
  return (
    <span
      className={`block rounded-[14px] overflow-hidden flex-shrink-0 ${className}`}
      style={src ? undefined : { backgroundColor: EVENTS_RAIL_COLORS[index % EVENTS_RAIL_COLORS.length] }}
    >
      {src && <img src={src} alt="" className="w-full h-full object-cover" />}
    </span>
  );
}

// one event: a row on mobile (64px 1:1 thumb beside the text), a card on
// desktop (full-width 1:1 image on top) so the grid fills the pane
function EventRow({ to, thumb, index, title, when, description }) {
  return (
    <Link
      to={to}
      className="group flex gap-3.5 py-4 transition-colors hover:opacity-80 md:hover:opacity-100 md:flex-col md:gap-0 md:py-0 md:rounded-2xl md:overflow-hidden md:border md:border-white/10 md:bg-white/[0.03] md:hover:border-white/25"
    >
      <span className="block flex-shrink-0 w-16 h-16 rounded-[14px] overflow-hidden md:w-full md:h-auto md:aspect-square md:rounded-none">
        <EventThumb
          src={thumb}
          index={index}
          className="w-full h-full !rounded-none md:transition-transform md:duration-300 md:group-hover:scale-[1.03]"
        />
      </span>
      <span className="min-w-0 flex-1 pt-px md:p-3.5 md:pt-3">
        <span className="block text-white/40 text-[11.5px] md:text-xs font-semibold mb-1">
          {when}
        </span>
        <span className="block text-white font-bold text-[14.5px] md:text-[15px] leading-snug mb-1.5">
          {title}
        </span>
        {description && (
          <span className="text-white/55 text-[12.5px] md:text-[13px] leading-normal line-clamp-2">
            {description}
          </span>
        )}
      </span>
    </Link>
  );
}

function TypetoberLiveLabel() {
  return (
    <span className="flex items-center gap-1.5 flex-wrap">
      <span className="flex items-center gap-1.5 text-evolve-pink">
        <LiveDot />
        Live now
      </span>
      <span>· Oct 1 – 31 · Challenge</span>
    </span>
  );
}

// Typetober pinned on top of Upcoming while it runs — a highlighted row on
// mobile, a wide featured banner across the grid on desktop
function TypetoberFeature() {
  return (
    <Link
      to={TYPETOBER_EVENT.path}
      className="group flex items-center gap-3.5 md:gap-7 rounded-2xl border border-evolve-yellow/30 bg-evolve-yellow/[0.06] hover:bg-evolve-yellow/[0.1] transition-colors p-3 md:p-5 mb-2 md:mb-6"
    >
      <span className="block flex-shrink-0 w-16 h-16 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-[14px] md:rounded-xl overflow-hidden">
        <img
          src={TYPETOBER_EVENT.thumb}
          alt=""
          className="w-full h-full object-cover md:transition-transform md:duration-300 md:group-hover:scale-[1.03]"
        />
      </span>
      <span className="min-w-0 flex-1 flex flex-col">
        <span className="block text-white/40 text-[11.5px] md:text-sm font-semibold mb-1 md:mb-2">
          <TypetoberLiveLabel />
        </span>
        <span className="block text-white font-bold text-[14.5px] md:font-bricolage md:font-extrabold md:text-3xl leading-snug mb-1 md:mb-2">
          {TYPETOBER_EVENT.title}
        </span>
        <span className="text-white/55 text-[12.5px] md:text-base leading-normal line-clamp-2 md:max-w-xl">
          {TYPETOBER_EVENT.description}
        </span>
        <span className="hidden md:inline-flex self-start items-center gap-2 mt-5 bg-evolve-yellow text-evolve-black font-bold text-sm rounded-full px-5 py-2.5">
          Join the challenge
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </span>
      </span>
    </Link>
  );
}

// The Events tab pane — browsing published events from inside the platform
// itself instead of sending the owner out to the marketing site's /events
// page. Each event opens at /app/events/:slug (EventDetail.jsx, embedded),
// where booking happens. Typetober is pinned on top of Upcoming while it's
// running (October).
function EventsTabPane() {
  const navigate = useNavigate();
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

  function goBack() {
    // in-app history entry to step back to, else the profile tab
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate("/app/profile");
  }

  const q = search.trim().toLowerCase();
  // events move to "past" by themselves once they've ended (src/lib/events.js);
  // live ones sort first within upcoming
  const filtered = events
    .filter((e) => (filter === "upcoming" ? !isEventOver(e) : isEventOver(e)))
    .filter((e) => !q || e.title?.toLowerCase().includes(q))
    .sort((a, b) =>
      filter === "upcoming"
        ? Number(isEventLive(b)) - Number(isEventLive(a)) ||
          new Date(a.start_time) - new Date(b.start_time)
        : new Date(b.start_time) - new Date(a.start_time)
    );
  const showTypetober =
    filter === "upcoming" &&
    isTypetoberLive() &&
    (!q || TYPETOBER_EVENT.title.toLowerCase().includes(q));

  return (
    <div className="flex flex-col w-full">
      <button
        type="button"
        onClick={goBack}
        aria-label="back"
        className="hidden md:flex w-9 h-9 rounded-full border border-white/10 items-center justify-center text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors mb-5"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M11 6l-6 6 6 6" />
        </svg>
      </button>

      <div className="md:hidden mb-[18px]">
        <h1 className="font-bricolage font-extrabold text-[26px] text-white mb-1.5">Events</h1>
        <p className="text-[13.5px] leading-normal text-white/50 max-w-[300px]">
          Webinars, AMAs, and live sessions from the evolve community.
        </p>
      </div>

      {/* tabs, then search — side by side on desktop */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3.5 md:gap-4 mb-3.5 md:mb-6">
        <div className="inline-flex self-start md:self-auto rounded-full border border-white/10 bg-[#1c1c1e] p-1 gap-0.5">
          {["upcoming", "past"].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`text-[13px] font-bold capitalize rounded-full px-[18px] py-2 transition-colors ${
                filter === f ? "bg-[#2c2c2e] text-white" : "text-white/50 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <label className="flex items-center md:w-80 rounded-xl border border-white/10 bg-[#1c1c1e] focus-within:border-evolve-yellow/60 transition-colors">
          <svg className="ml-3 text-white/35 flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events"
            className="flex-1 min-w-0 bg-transparent outline-none text-[13.5px] text-white placeholder:text-white/35 py-[11px] pl-2 pr-3"
          />
        </label>
      </div>

      {showTypetober && <TypetoberFeature />}

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner size={28} />
        </div>
      ) : filtered.length === 0 ? (
        !showTypetober && (
          <p className="text-white/40 text-[13px] py-9 text-center">
            {q
              ? "No events match that search."
              : filter === "upcoming"
                ? "No upcoming events right now — check back soon."
                : "No past events yet."}
          </p>
        )
      ) : (
        <div className="flex flex-col divide-y divide-white/[0.08] md:divide-y-0 md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-4">
          {filtered.map((event, i) => (
            <EventRow
              key={event.id}
              to={`/app/events/${event.slug}`}
              thumb={event.cover_image_url}
              index={i}
              title={event.title}
              when={<EventWhen event={event} />}
              description={event.description}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// one rail entry — live ones get a tinted pink card so they stand out
function RailRow({ to, thumb, index, title, when, live }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3.5 transition-colors ${
        live
          ? "rounded-2xl border border-evolve-pink/30 bg-evolve-pink/[0.08] hover:bg-evolve-pink/[0.13] p-2.5"
          : "rounded-2xl p-2.5 -mx-2.5 hover:bg-white/[0.04]"
      }`}
    >
      <EventThumb src={thumb} index={index} className="w-[72px] h-[72px] !rounded-xl" />
      <span className="min-w-0 flex-1">
        <span className="block text-white text-[15px] font-bold leading-snug line-clamp-2">{title}</span>
        <span className="block text-white/45 text-xs font-semibold mt-1">{when}</span>
      </span>
      <svg className="flex-shrink-0 text-white/30" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 6l6 6-6 6" />
      </svg>
    </Link>
  );
}

function RailSection({ label, live, children }) {
  return (
    <div className="flex flex-col gap-2">
      <p
        className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wide ${
          live ? "text-evolve-pink" : "text-white/45"
        }`}
      >
        {live && <LiveDot />}
        {label}
      </p>
      {children}
    </div>
  );
}

// Desktop right rail on the profile / grow tabs: what's live right now
// (Typetober included while it runs), then what's coming up, then what's
// just happened — the next live/upcoming session gets the big card.
function EventsRailPanel({ collapsed, onToggleCollapsed, onGoToEvents }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [goingCount, setGoingCount] = useState(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("events")
      .select("*")
      .eq("status", "published")
      .order("start_time", { ascending: true })
      .then(({ data }) => {
        if (cancelled) return;
        setEvents(data || []);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const live = events.filter((e) => isEventLive(e));
  const upcoming = events.filter((e) => !isEventOver(e) && !isEventLive(e));
  const past = events
    .filter((e) => isEventOver(e))
    .sort((a, b) => new Date(b.start_time) - new Date(a.start_time))
    .slice(0, 3);
  const featured = live[0] || upcoming[0] || null;
  const liveRest = live.filter((e) => e !== featured);
  const upcomingRest = upcoming.filter((e) => e !== featured).slice(0, 4);
  const typetoberLive = isTypetoberLive();

  const featuredId = featured?.id;
  useEffect(() => {
    if (!featuredId) return;
    let cancelled = false;
    supabase
      .from("event_registrations")
      .select("id", { count: "exact", head: true })
      .eq("event_id", featuredId)
      .eq("status", "registered")
      .then(({ count }) => {
        if (!cancelled) setGoingCount(count ?? 0);
      });
    return () => {
      cancelled = true;
    };
  }, [featuredId]);

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

  const nothing = !featured && !typetoberLive && past.length === 0;

  return (
    <div className="hidden md:flex md:w-[360px] flex-shrink-0 flex-col gap-6 border-l border-white/10 px-6 py-8 relative">
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

      <div className="flex items-center justify-between">
        <p className="text-white/40 text-xs font-bold uppercase tracking-wide">Events</p>
        <button
          type="button"
          onClick={onGoToEvents}
          className="text-evolve-yellow text-[11px] font-bold uppercase tracking-wide hover:opacity-80"
        >
          View all
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner size={22} />
        </div>
      ) : nothing ? (
        <p className="text-white/40 text-xs">No events right now.</p>
      ) : (
        <>
          {featured && (
            <div className="flex flex-col gap-3">
              <Link
                to={`/app/events/${featured.slug}`}
                className="rounded-2xl overflow-hidden border border-white/10 relative hover:border-white/20 transition-colors"
              >
                <div className="aspect-square">
                  {featured.cover_image_url ? (
                    <img src={featured.cover_image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-evolve-yellow" />
                  )}
                </div>
                <span className="absolute top-3 left-3 flex items-center gap-1.5">
                  {isEventLive(featured) && (
                    <span className="flex items-center gap-1.5 bg-evolve-pink text-white text-[10px] font-bold uppercase px-2 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      Live
                    </span>
                  )}
                  {featured.event_type && (
                    <span className="bg-white text-black text-[10px] font-bold uppercase px-2 py-1 rounded-full">
                      {featured.event_type}
                    </span>
                  )}
                </span>
              </Link>
              <div className="flex flex-col gap-1">
                <p className="text-white font-bold text-sm leading-snug">{featured.title}</p>
                {featured.speaker_name && (
                  <p className="text-white/40 text-xs">
                    {featured.speaker_name}
                    {featured.speaker_title ? ` · ${featured.speaker_title}` : ""}
                  </p>
                )}
                <p className="text-white/50 text-xs mt-1">
                  <EventWhen event={featured} />
                </p>
              </div>
              <div className="flex items-center justify-between gap-3">
                {goingCount !== null && (
                  <span className="text-white/40 text-xs">{goingCount} going</span>
                )}
                <Link
                  to={`/app/events/${featured.slug}`}
                  className="ml-auto bg-evolve-yellow text-evolve-black font-bold text-xs rounded-full px-4 py-2 hover:opacity-90 transition-opacity"
                >
                  View Event
                </Link>
              </div>
            </div>
          )}

          {(typetoberLive || liveRest.length > 0) && (
            <RailSection label="Live now" live>
              {typetoberLive && (
                <RailRow
                  live
                  to={TYPETOBER_EVENT.path}
                  thumb={TYPETOBER_EVENT.thumb}
                  title={TYPETOBER_EVENT.title}
                  when="Oct 1 – 31 · Challenge"
                />
              )}
              {liveRest.map((e, i) => (
                <RailRow
                  live
                  key={e.id}
                  to={`/app/events/${e.slug}`}
                  thumb={e.cover_image_url}
                  index={i}
                  title={e.title}
                  when={e.event_type || "Live session"}
                />
              ))}
            </RailSection>
          )}

          {upcomingRest.length > 0 && (
            <RailSection label="Upcoming">
              {upcomingRest.map((e, i) => (
                <RailRow
                  key={e.id}
                  to={`/app/events/${e.slug}`}
                  thumb={e.cover_image_url}
                  index={i + 1}
                  title={e.title}
                  when={<EventWhen event={e} />}
                />
              ))}
            </RailSection>
          )}

          {past.length > 0 && (
            <RailSection label="Past">
              {past.map((e, i) => (
                <RailRow
                  key={e.id}
                  to={`/app/events/${e.slug}`}
                  thumb={e.cover_image_url}
                  index={i + 2}
                  title={e.title}
                  when={<EventWhen event={e} />}
                />
              ))}
            </RailSection>
          )}
        </>
      )}
    </div>
  );
}

// Grow → Upskill: daily news, microlearning and quizzes (always free, in
// every plan state). Placeholders until those surfaces ship — styled like
// the reference's .upskill-card row.
const UPSKILL = [
  {
    key: "news",
    label: "Daily News",
    color: "#DF0586",
    bg: "rgba(223,5,134,0.16)",
    icon: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 8h10M7 12h10M7 16h6" /></>
  },
  {
    key: "micro",
    label: "Microlearning",
    color: "#A35BFB",
    bg: "rgba(163,91,251,0.16)",
    icon: <><path d="M3 8l9-4 9 4-9 4-9-4z" /><path d="M7 10v5c0 1.4 2.2 3 5 3s5-1.6 5-3v-5" /></>
  },
  {
    key: "quiz",
    label: "Quiz",
    color: "#FFD007",
    bg: "rgba(255,208,7,0.16)",
    icon: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 015 0c0 1.7-2.5 2-2.5 4" /><path d="M12 17h.01" /></>
  }
];

function UpskillRow() {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.08em] mb-2.5 ml-0.5" style={{ color: "#6f6f72" }}>
        Upskill
      </p>
      <div className="flex gap-2.5 md:max-w-xl">
        {UPSKILL.map((u) => (
          <div
            key={u.key}
            aria-disabled="true"
            title="Coming soon"
            className="flex-1 flex flex-col items-center gap-2 rounded-2xl pt-3.5 pb-3 px-1.5 cursor-default"
            style={{ background: "#232325", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <span className="w-[34px] h-[34px] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: u.bg }}>
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke={u.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {u.icon}
              </svg>
            </span>
            <span className="text-[11.5px] font-semibold text-white text-center leading-tight">{u.label}</span>
            <span className="text-[9.5px] font-bold uppercase tracking-wide" style={{ color: "#6f6f72" }}>
              Coming soon
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── platform URLs (/app/*) ─────────────────────────────────────────────── */
// programme pane id ↔ its URL under /app — see PlatformApp.jsx for the map
const PROGRAMME_PATHS = {
  "portfolio-review": "grow/portfolio-review",
  mentorship: "grow/mentorship",
  "account-menu": "account",
  account: "account/details",
  invoice: "account/invoice"
};
const APP_TABS = ["profile", "grow", "events", "community"];

function appPathFor(tab, programme) {
  if (programme && PROGRAMME_PATHS[programme])
    return `/app/${PROGRAMME_PATHS[programme]}`;
  return `/app/${APP_TABS.includes(tab) ? tab : "profile"}`;
}

function parseAppPath(pathname) {
  const rest = pathname.replace(/^\/app\/?/, "").replace(/\/+$/, "");
  const programme = Object.keys(PROGRAMME_PATHS).find(
    (k) => PROGRAMME_PATHS[k] === rest
  );
  if (programme) {
    return {
      tab: PROGRAMME_PATHS[programme].startsWith("grow") ? "grow" : "profile",
      programme,
      eventSlug: null
    };
  }
  const [tab, slug] = rest.split("/");
  if (tab === "events" && slug) {
    return { tab: "events", programme: null, eventSlug: decodeURIComponent(slug) };
  }
  return {
    tab: APP_TABS.includes(tab) ? tab : "profile",
    programme: null,
    eventSlug: null
  };
}

/* ─── page ───────────────────────────────────────────────────────────────── */
// `platform` = rendered by PlatformApp at /app/* — the owner's own platform,
// where the open tab / programme / event comes from the URL (see
// parseAppPath). Without it this is the public /profile/:username page that
// other people see; the owner landing there is sent to /app instead.
export default function PublicProfile({ platform = false }) {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const username = platform ? user?.username : params.username;
  const isOwner = !!user?.username && user.username === username;
  const appView = platform ? parseAppPath(location.pathname) : null;

  useEffect(() => {
    if (platform || !isOwner) return;
    const programme = location.state?.activeProgramme;
    navigate(programme ? appPathFor("profile", programme) : "/app/profile", {
      replace: true
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform, isOwner]);

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
  const [localProgramme, setLocalProgramme] = useState(
    location.state?.activeProgramme ||
      (hadMentorshipRedirectFlag ? "mentorship" : null)
  );
  const activeProgramme = appView ? appView.programme : localProgramme;
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
  const [localTab, setLocalTab] = useState("profile");
  const activeTab = appView ? appView.tab : localTab;

  // on the platform these push a new URL (so the browser back button steps
  // back through tabs/panels); on the public page they're plain state
  function setActiveProgramme(programme) {
    if (appView) navigate(appPathFor(appView.tab, programme));
    else setLocalProgramme(programme);
  }

  function handleTabChange(tab) {
    if (appView) {
      navigate(appPathFor(tab, null));
      return;
    }
    setLocalProgramme(null);
    setLocalTab(tab);
  }

  // the /mentorship marketing CTA's flag (above) on the platform → its URL
  useEffect(() => {
    if (appView && hadMentorshipRedirectFlag && appView.programme !== "mentorship") {
      navigate(appPathFor("grow", "mentorship"), { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // After-trial layer (src/components/membership): the 30-days-of-VIP
  // welcome shows once on the owner's first landing during the trial, and
  // the "your trial has ended" pop-up shows once the first time they land
  // after it's over on pay-as-you-go. "Seen" lives in localStorage (per
  // user) rather than a DB write — losing it just replays the sheet once,
  // which is harmless.
  const membership = useMembership();
  const { access } = membership;
  useEffect(() => {
    if (!isOwner || !user?.id || typeof window === "undefined") return;
    const seen = (k) => {
      try {
        return localStorage.getItem(k);
      } catch {
        return "1";
      }
    };
    const mark = (k) => {
      try {
        localStorage.setItem(k, "1");
      } catch {
        /* private mode — fine, it just shows again */
      }
    };
    if (access.phase === "trial") {
      const key = `evolve_trial_sheet_seen_${user.id}`;
      if (!seen(key)) {
        mark(key);
        membership.showWelcome();
      }
    } else if (access.mode === "payg") {
      const key = `evolve_trial_ended_seen_${user.id}`;
      if (!seen(key)) {
        mark(key);
        membership.openPlans(1);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOwner, user?.id, access.phase, access.mode]);
  const trialBadgeEnding = access.phase === "ended" && access.mode === "payg";

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
    // the platform URL isn't keyed off the username — nothing to fix up
    if (platform) return;
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
            href="https://discord.gg/MmfaqCPdF7"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 text-sm font-semibold text-white/70 border border-white/15 rounded-full pl-2 pr-4 py-2 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <DiscordIcon className="w-6 h-6 flex-shrink-0" />
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
              {isOwner && (
                <TrialClockBadge
                  size={16}
                  ending={trialBadgeEnding}
                  onClick={membership.openTrialStatus}
                  className="absolute -bottom-1 -right-1"
                />
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

      {isOwner && !activeProgramme && <TrialBar user={user} />}

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
          {!activeProgramme && !(isOwner && activeTab === "profile") && (
            <div className="md:hidden flex flex-col">
              <div className="flex items-center gap-3 px-5 py-4 w-full text-left">
                <div className="relative w-12 h-12 flex-shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 flex items-center justify-center text-white text-sm font-bold">
                    {card.avatar_url ? (
                      <img src={card.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (card.name || "?")[0].toUpperCase()
                    )}
                  </div>
                  {isOwner && (
                    <TrialClockBadge
                      size={16}
                      ending={trialBadgeEnding}
                      onClick={membership.openTrialStatus}
                      className="absolute -bottom-0.5 -right-0.5"
                    />
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
          {/* the events tab has its own back arrow instead (EventsTabPane) */}
          {isOwner && !activeProgramme && activeTab !== "events" && (
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
                <ProfileTabPane user={user} />
              ) : (
                card?.ai_profile && (
                  <AIProfileReveal
                    profile={card.ai_profile}
                    portfolioLink={card.portfolio_link}
                    portfolioFileUrl={card.portfolio_file_url}
                    resumeLink={card.resume_link}
                    resumeFileUrl={card.resume_file_url}
                    socialLinks={card.social_links}
                  />
                )
              )}
            </div>

            {showOwnerTools && (
              <div className={activeTab === "grow" ? "contents" : "hidden"}>
                <UpskillRow />
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
                    href="https://discord.gg/MmfaqCPdF7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="md:hidden flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors"
                  >
                    <DiscordIcon className="w-6 h-6 flex-shrink-0" />
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
                {appView?.eventSlug ? (
                  <EventDetail embedded slug={appView.eventSlug} />
                ) : (
                  <EventsTabPane />
                )}
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
