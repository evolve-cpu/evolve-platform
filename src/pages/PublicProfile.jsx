import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../hooks/useAuth";
import GrowthMascot from "../components/GrowthMascot";
import Spinner from "../components/Spinner";
import { stageForProgress, stageLabel, STAGE_LABELS } from "../lib/growthStage";
import { getPortfolioReviewProgress } from "../lib/portfolioReviewProgress";
import PortfolioReviewProgramme from "../components/programmes/PortfolioReviewProgramme";
import MentorshipProgramme from "../components/programmes/MentorshipProgramme";
import {
  AccountMenuList,
  MyAccountPanel,
  InvoicePanel,
  UserIcon,
  InvoiceIcon,
  LogOutIcon,
  TrashIcon
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
  chips,
  href,
  onClick,
  progress,
  buttonLabel
}) {
  const Tag = onClick ? "button" : Link;
  const tagProps = onClick ? { type: "button", onClick } : { to: href };
  const reportReady = progress?.step === 5;
  return (
    <Tag
      {...tagProps}
      className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] hover:border-evolve-lavender-indigo/50 overflow-hidden transition-colors text-left w-full"
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
              {reportReady ? "report ready" : "under review"}
            </span>
          )}
        </div>
        <p className="text-white/40 text-sm md:text-[15px] leading-relaxed">
          {description}
        </p>
        {!!chips?.length && !progress && (
          <div className="flex flex-wrap gap-1.5 mt-auto">
            {chips.map((c) => (
              <span
                key={c}
                className="text-[11px] md:text-xs font-semibold px-2.5 py-1 rounded-full border border-white/10 text-white/50"
              >
                {c}
              </span>
            ))}
          </div>
        )}
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
                step {progress.step} of {progress.totalSteps} · {progress.label}
              </span>
              <span className="text-white/60">{progress.percent}%</span>
            </div>
          </div>
        )}
        <span
          className="mt-1 inline-flex items-center justify-center gap-2 bg-evolve-yellow text-evolve-black text-sm font-extrabold px-4 py-2.5 w-fit border-2 border-evolve-black hover:opacity-90 transition-opacity"
          style={{ borderRadius: 10, boxShadow: "4px 4px 0 0 #000000" }}
        >
          {buttonLabel || "explore program"}
          <img src={right_arrow_icon} alt="" className="w-4 h-4" />
        </span>
      </div>
    </Tag>
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
  // dashboard default.
  const [activeProgramme, setActiveProgramme] = useState(
    location.state?.activeProgramme || null
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // the desktop collapse/expand toggle only shows up while hovering the
  // sidebar rail (or the button itself, since it straddles the rail's edge).
  const [sidebarHovered, setSidebarHovered] = useState(false);

  // default collapsed on mobile (short summary) / expanded on desktop —
  // checked once on mount only, so it doesn't fight a user's own toggle
  // afterward as the window resizes.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (location.state?.activeProgramme) {
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

  // account menu — desktop gets a floating dropdown off the avatar; mobile
  // (no room for a dropdown) gets a dedicated menu panel in the main pane
  // instead, reusing the same activeProgramme swap the other panels use.
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
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

  async function handleLogOut() {
    setAccountMenuOpen(false);
    await supabase.auth.signOut();
    navigate("/");
  }

  async function handleDeleteAccount() {
    setAccountMenuOpen(false);
    setDeleteConfirmOpen(false);
    const { error } = await supabase.rpc("delete_own_account");
    if (error) {
      window.alert(
        "couldn't delete your account right now — please contact support."
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

  useEffect(() => {
    if (!activeProgramme) loadEvolveReview();
  }, [activeProgramme, loadEvolveReview]);

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
        <p className="text-white font-bold text-xl">no profile here yet.</p>
        <p className="text-white/40 text-sm">
          the username "{username}" hasn't been claimed.
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
            className="flex items-center gap-2 text-sm font-semibold text-white/70 border border-white/15 rounded-full pl-2 pr-4 py-2 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <WhatsAppIcon className="w-6 h-6 flex-shrink-0" />
            evolve community
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
              sign in
            </Link>
          )}
        </div>
      </div>

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
              delete your account?
            </h3>
            <p className="text-white/50 text-sm leading-relaxed">
              this permanently removes your profile and everything tied to it.
              this can't be undone.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="text-white font-bold text-xs rounded-2xl border border-[#373737] hover:bg-[#232325] px-5 py-2.5 transition-colors"
              >
                cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="bg-red-500 text-white font-bold text-xs rounded-2xl px-5 py-2.5 hover:opacity-90 transition-opacity"
              >
                delete my account
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
          className={`w-full ${sidebarCollapsed ? "md:w-[84px]" : "md:w-[300px]"} md:border-r border-white/10 flex-shrink-0 flex flex-col md:sticky md:top-16 md:self-start md:min-h-[calc(100vh-4rem)] transition-[width] duration-200`}
        >
          {/* ── mobile: compact summary bar (collapsed) / small collapse
              control above the full panel (expanded) ── */}
          {sidebarCollapsed ? (
            <button
              type="button"
              onClick={() => setSidebarCollapsed(false)}
              className="flex md:hidden items-center gap-3 px-6 py-4 w-full text-left border-b border-white/10"
            >
              <GrowthMascot progress={card.growth_stage ?? 0} size={32} />
              <p className="text-evolve-inchworm text-xs font-bold flex-1">
                stage {stageForProgress(card.growth_stage ?? 0)} ·{" "}
                <span className="capitalize">
                  {stageLabel(card.growth_stage ?? 0)}
                </span>
              </p>
              <svg
                width="14"
                height="14"
                viewBox="0 0 20 20"
                fill="none"
                className="flex-shrink-0 text-white/40"
              >
                <path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ) : (
            <div className="flex md:hidden items-center justify-between px-6 pt-5">
              <p className="text-white/30 text-[10px] font-bold uppercase tracking-wide">
                your profile
              </p>
              <button
                type="button"
                onClick={() => setSidebarCollapsed(true)}
                title="collapse panel"
                className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-colors flex-shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M5 12.5L10 7.5L15 12.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* ── desktop: collapsed icon rail — just the mascot near the top ── */}
          {sidebarCollapsed && (
            <div className="hidden md:flex flex-col items-center pt-6">
              <GrowthMascot progress={card.growth_stage ?? 0} size={40} />
            </div>
          )}

          {/* ── full panel (both breakpoints) — hidden entirely while
              collapsed instead of always showing on mobile ── */}
          {!sidebarCollapsed && (
            <div className="flex flex-col gap-5 px-6 py-8">
              <div className="flex flex-col items-center gap-3 text-center">
                <GrowthMascot progress={card.growth_stage ?? 0} size={140} />
                <div>
                  <h1 className="text-white font-bold text-lg">
                    {card.name || "evolve designer"}
                  </h1>
                  <p className="text-white/40 text-xs mt-0.5">@{username}</p>
                </div>
              </div>

              <div className="border-t border-white/10" />

              <div className="flex flex-col items-center text-center gap-1">
                <p className="text-evolve-inchworm text-sm font-bold capitalize">
                  stage {stageForProgress(card.growth_stage ?? 0)} ·{" "}
                  {stageLabel(card.growth_stage ?? 0)}
                </p>
                <p className="text-white/40 text-xs">
                  {GROWTH_ENCOURAGEMENT[stageLabel(card.growth_stage ?? 0)]}
                </p>
              </div>

              <div className="border-t border-white/10" />

              <div className="flex flex-col gap-1">
                <p className="text-white/25 text-[10px] md:text-xs font-bold uppercase tracking-wide px-2.5">
                  growth map
                </p>
                <div className="flex flex-col gap-4">
                  {(() => {
                    const currentStage = stageForProgress(
                      card.growth_stage ?? 0
                    );
                    const totalStages = STAGE_LABELS.length;
                    return (
                      <>
                        {/* every stage shipped so far (1-10) lives under one
                            "seed" heading — the line + fill track progress
                            only through this section. anything beyond stage
                            10 isn't built yet, so the list just fades out at
                            the bottom instead of listing locked stages. */}
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
                            {Array.from(
                              { length: totalStages },
                              (_, i) => i + 1
                            ).map((stageNum) => {
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
                                        stage {stageNum}
                                      </span>
                                      <span className="text-white/40 text-[11px] md:text-sm">
                                        you are here
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
                                    stage {stageNum}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    );
                  })()}
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

        {/* main content — flows in the same single page scroll as
            everything else; the sticky top bar and sidebar stay in place
            above/beside it. Bottom padding is dropped while the Portfolio
            Review programme is open since its own sticky enrol bar supplies
            that spacing itself (avoids a gap between the bar and the true
            bottom of the page). */}
        <main
          className={`flex-1 px-6 md:px-8 pt-8 flex flex-col gap-8 ${
            activeProgramme === "portfolio-review" ? "pb-0" : "pb-8"
          }`}
        >
          {activeProgramme === "portfolio-review" ? (
            <PortfolioReviewProgramme
              user={user}
              onBack={() => setActiveProgramme(null)}
            />
          ) : activeProgramme === "mentorship" ? (
            <MentorshipProgramme onBack={() => setActiveProgramme(null)} />
          ) : activeProgramme === "account-menu" ? (
            <AccountMenuList
              onBack={() => setActiveProgramme(null)}
              onSelect={(key) => setActiveProgramme(key)}
              onLogOut={handleLogOut}
              onDeleteAccount={() => setDeleteConfirmOpen(true)}
            />
          ) : activeProgramme === "account" ? (
            <MyAccountPanel
              onBack={() => setActiveProgramme("account-menu")}
              onSaved={handleAccountSaved}
            />
          ) : activeProgramme === "invoice" ? (
            <InvoicePanel onBack={() => setActiveProgramme("account-menu")} />
          ) : showOwnerTools ? (
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
                  description="a live 1:1 review of your portfolio with a working industry reviewer, plus a written report."
                  chips={["Live 1:1 review", "Written report"]}
                  onClick={() => openProgramme("portfolio-review")}
                  progress={getPortfolioReviewProgress(evolveReview)}
                  buttonLabel={
                    evolveReview
                      ? getPortfolioReviewProgress(evolveReview)?.step === 5
                        ? "apply again"
                        : "continue your review"
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
                  description="personalised 1:1 mentorship to define your design career — someone in your corner until you land."
                  chips={["1:1 personalised", "5 sessions"]}
                  onClick={() => openProgramme("mentorship")}
                />
              </div>
            </Section>
          ) : null}
        </main>
      </div>
    </div>
  );
}
