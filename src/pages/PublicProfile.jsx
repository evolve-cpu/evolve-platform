import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../hooks/useAuth";
import GrowthMascot from "../components/GrowthMascot";
import Spinner from "../components/Spinner";
import { stageForProgress, stageLabel } from "../lib/growthStage";
import { getPortfolioReviewProgress } from "../lib/portfolioReviewProgress";
import PortfolioReviewProgramme from "../components/programmes/PortfolioReviewProgramme";
import MentorshipProgramme from "../components/programmes/MentorshipProgramme";
import { PortfolioReviewArt, MentorshipArt } from "../components/programmes/CardArt";

/* ─── small building blocks ──────────────────────────────────────────────── */
function Stat({ value, label }) {
  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-white font-bold text-lg">{value}</p>
      <p className="text-white/30 text-[9px] font-semibold uppercase tracking-wide mt-0.5">{label}</p>
    </div>
  );
}

function SocialIcon({ label }) {
  return (
    <span
      title="coming soon"
      className="w-8 h-8 rounded-full border border-white/15 bg-white/[0.03] flex items-center justify-center text-white/40 text-[10px] font-bold cursor-default"
    >
      {label}
    </span>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="text-xs font-semibold px-3.5 py-2 rounded-full transition-colors"
      style={
        active
          ? { background: "rgba(194,253,92,0.12)", color: "rgba(194,253,92,1)" }
          : { color: "rgba(255,255,255,0.4)" }
      }
    >
      {children}
    </button>
  );
}

function Section({ title, action, children }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-white/30 text-[10px] font-bold uppercase tracking-wide">{title}</p>
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
function ProgramCard({ art, label, description, chips, href, onClick, progress, buttonLabel }) {
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
          <span className="text-white text-sm font-bold font-bricolage capitalize">{label}</span>
          {progress && (
            <span
              className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide ${
                reportReady ? "text-evolve-inchworm" : "text-evolve-yellow"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${reportReady ? "bg-evolve-inchworm" : "bg-evolve-yellow"}`} />
              {reportReady ? "report ready" : "under review"}
            </span>
          )}
        </div>
        <p className="text-white/40 text-xs leading-relaxed">{description}</p>
        {!!chips?.length && !progress && (
          <div className="flex flex-wrap gap-1.5 mt-auto">
            {chips.map((c) => (
              <span
                key={c}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full border border-white/10 text-white/50"
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
            <div className="flex items-center justify-between text-[10px] font-semibold text-white/40">
              <span>step {progress.step} of {progress.totalSteps} · {progress.label}</span>
              <span className="text-white/60">{progress.percent}%</span>
            </div>
          </div>
        )}
        <span className="mt-1 inline-flex items-center justify-center gap-1.5 bg-evolve-yellow text-evolve-black text-xs font-bold rounded-full px-4 py-2.5 w-fit">
          {buttonLabel || "explore program →"}
        </span>
      </div>
    </Tag>
  );
}

function WorkTab({ discipline }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-14 flex flex-col items-center text-center gap-2">
      <p className="text-white/50 text-sm font-semibold">no work uploaded yet</p>
      <p className="text-white/25 text-xs max-w-xs">projects and case studies shared here will show up on this page.</p>
      {!!discipline?.length && (
        <div className="flex flex-wrap gap-2 justify-center mt-3">
          {discipline.map(d => (
            <span key={d} className="text-[11px] font-semibold px-3 py-1 rounded-full bg-evolve-lavender-indigo/15 text-evolve-lavender-indigo">
              {d}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── page ───────────────────────────────────────────────────────────────── */
export default function PublicProfile() {
  const { username } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const isOwner = user?.username === username;

  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bioDraft, setBioDraft] = useState("");
  const [editingBio, setEditingBio] = useState(false);
  const [activeTab, setActiveTab] = useState("learnings");
  const [viewingPublic, setViewingPublic] = useState(false);
  // which programme (if any) is open in the right-hand pane — replaces the
  // "evolve programmes" grid in place instead of navigating to a new route,
  // so the sidebar stays put. `sidebarCollapsed` lets the owner tuck that
  // sidebar away for more room while they're deep in a programme (e.g. mid
  // payment) — independent of which programme is open.
  const [activeProgramme, setActiveProgramme] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [evolveReview, setEvolveReview] = useState(null);
  const [orgSpaces, setOrgSpaces] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [respondingId, setRespondingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setNotFound(false);

    if (isOwner) {
      setCard(user);
      setBioDraft(user.bio || "");
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

  useEffect(() => { load(); }, [load]);

  // owner's org space(s) — lets them hop back and forth between their
  // profile and the space(s) they own/belong to
  const loadOrgSpaces = useCallback(async () => {
    if (!isOwner || !user) {
      setOrgSpaces([]);
      return;
    }
    const { data } = await supabase
      .from("organization_members")
      .select("role, organizations:org_id(name, slug, logo_url, org_type, deleted_at)")
      .eq("user_id", user.id)
      .eq("status", "active");
    setOrgSpaces((data || []).filter((r) => r.organizations && !r.organizations.deleted_at));
  }, [isOwner, user]);

  useEffect(() => {
    loadOrgSpaces();
  }, [loadOrgSpaces]);

  // drives the Portfolio Review card's progress pill/bar — re-checked
  // whenever the owner steps back out of a programme pane (e.g. after
  // saving a draft and returning), so the card reflects the latest state
  const loadEvolveReview = useCallback(async () => {
    if (!isOwner || !user) {
      setEvolveReview(null);
      return;
    }
    const { data } = await supabase
      .from("evolve_portfolio_reviews")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    setEvolveReview(data || null);
  }, [isOwner, user]);

  useEffect(() => {
    if (!activeProgramme) loadEvolveReview();
  }, [activeProgramme, loadEvolveReview]);

  // pending "find on evolve" additions — someone already on evolve was added
  // directly (no email/token), so they accept it right here, in-app
  const loadPendingInvites = useCallback(async () => {
    if (!isOwner || !user) {
      setPendingInvites([]);
      return;
    }
    const { data } = await supabase
      .from("organization_members")
      .select("id, role, member_type, organizations:org_id(name, slug, logo_url), inviter:profiles!invited_by(name)")
      .eq("user_id", user.id)
      .eq("status", "pending");
    setPendingInvites((data || []).filter((r) => r.organizations));
  }, [isOwner, user]);

  useEffect(() => {
    loadPendingInvites();
  }, [loadPendingInvites]);

  async function respondToInvite(id, accept) {
    setRespondingId(id);
    const { error } = await supabase.rpc("respond_to_org_invite", { p_member_id: id, p_accept: accept });
    setRespondingId(null);
    if (error) return;
    loadPendingInvites();
    if (accept) loadOrgSpaces();
  }

  async function saveBio() {
    setEditingBio(false);
    if (!isOwner) return;
    await supabase.from("profiles").update({ bio: bioDraft }).eq("id", user.id);
    await refreshUser();
    setCard(prev => ({ ...prev, bio: bioDraft }));
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#161618" }}>
        <Spinner size={40} />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-6" style={{ backgroundColor: "#161618" }}>
        <p className="text-white font-bold text-xl">no profile here yet.</p>
        <p className="text-white/40 text-sm">the username "{username}" hasn't been claimed.</p>
      </div>
    );
  }

  const showOwnerTools = isOwner && !viewingPublic;
  const subtitle = [card.persona, card.country].filter(Boolean).join(" · ");

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#161618" }}>
      {/* top bar */}
      <div className="flex items-center justify-between px-6 md:px-8 py-4 border-b border-white/10 flex-shrink-0">
        <Link to="/" className="text-white font-extrabold text-base tracking-tight">
          evolve<span className="text-evolve-lavender-indigo">.</span>
        </Link>
        <div className="flex items-center gap-2.5">
          <button
            title="coming soon"
            className="text-[11px] font-semibold text-white/35 border border-white/10 rounded-full px-4 py-2 cursor-default"
          >
            explore spaces
          </button>
          <Link
            to="/community"
            className="text-[11px] font-semibold text-white/70 border border-white/15 rounded-full px-4 py-2 hover:border-white/30 transition-colors"
          >
            evolve community
          </Link>
          {isOwner && orgSpaces[0] ? (
            <Link
              to={`/institute/${orgSpaces[0].organizations.slug}`}
              title="go to my space"
              className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 transition-transform hover:scale-105"
            >
              {card.avatar_url ? (
                <img src={card.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                (card.name || "?")[0].toUpperCase()
              )}
            </Link>
          ) : (
            <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {card.avatar_url ? (
                <img src={card.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                (card.name || "?")[0].toUpperCase()
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* sidebar — collapsible on desktop into a slim rail (avatar + growth
            stage still visible) so a programme (or its payment flow) in the
            right pane can claim more width without losing the person's
            context entirely. Mobile always gets the full panel. */}
        <aside
          className={`w-full ${sidebarCollapsed ? "md:w-[84px]" : "md:w-[300px]"} md:border-r border-white/10 flex-shrink-0 relative flex flex-col transition-[width] duration-200`}
        >
          <button
            type="button"
            onClick={() => setSidebarCollapsed((v) => !v)}
            title={sidebarCollapsed ? "expand panel" : "collapse panel"}
            className={`hidden md:flex w-7 h-7 rounded-full border border-white/10 items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-colors flex-shrink-0 ${
              sidebarCollapsed ? "self-center mt-5" : "absolute top-3 right-3"
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" style={{ transform: sidebarCollapsed ? "scaleX(-1)" : "none" }}>
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {sidebarCollapsed && (
            <div className="hidden md:flex flex-col items-center gap-4 px-2 pb-6 mt-4">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 flex items-center justify-center flex-shrink-0">
                {card.avatar_url ? (
                  <img src={card.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-sm">{(card.name || "?")[0].toUpperCase()}</span>
                )}
              </div>
              <div className="flex flex-col items-center gap-1 rounded-xl border border-evolve-inchworm/20 bg-evolve-inchworm/[0.05] px-1.5 py-2">
                <GrowthMascot progress={card.growth_stage ?? 0} size={28} />
                <span className="text-evolve-inchworm text-[9px] font-bold">
                  s{stageForProgress(card.growth_stage ?? 0)}
                </span>
              </div>
            </div>
          )}

          <div className={sidebarCollapsed ? "flex md:hidden flex-col gap-6 px-6 py-8" : "flex flex-col gap-6 px-6 py-8"}>
          <div className="flex justify-center">
            <div className="w-[110px] h-[110px] rounded-full overflow-hidden bg-white/10 flex items-center justify-center flex-shrink-0">
              {card.avatar_url ? (
                <img src={card.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-4xl">{(card.name || "?")[0].toUpperCase()}</span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-around">
            <Stat value={0} label="resources consumed" />
            <Stat value={0} label="certificates earned" />
            <Stat value="—" label="avg quiz score" />
          </div>

          <div>
            <h1 className="text-white font-bold text-lg">{card.name || "evolve designer"}</h1>
            <p className="text-white/40 text-xs">@{username}</p>
            {subtitle && <p className="text-white/50 text-xs mt-2 leading-relaxed">{subtitle}</p>}
          </div>

          {isOwner && editingBio ? (
            <textarea
              autoFocus
              value={bioDraft}
              onChange={e => setBioDraft(e.target.value)}
              onBlur={saveBio}
              rows={3}
              placeholder="add a short headline about yourself…"
              className="w-full text-sm text-white placeholder-white/30 outline-none border border-white/15 rounded-xl px-4 py-3"
              style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
            />
          ) : (
            <button
              onClick={() => isOwner && setEditingBio(true)}
              className={`text-xs text-left leading-relaxed ${card.bio ? "text-white/50" : "text-white/25 italic"}`}
            >
              {card.bio || (isOwner ? "add a short headline about yourself…" : "")}
            </button>
          )}

          {isOwner && !user.persona && (
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

          {isOwner && user.email && <p className="text-white/30 text-xs">{user.email}</p>}

          <div className="flex items-center gap-2">
            <SocialIcon label="Be" />
            <SocialIcon label="Dr" />
            <SocialIcon label="Li" />
            <SocialIcon label="↗" />
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-evolve-inchworm/20 bg-evolve-inchworm/[0.05] px-3 py-2.5">
            <GrowthMascot progress={card.growth_stage ?? 0} size={40} />
            <div className="min-w-0">
              <p className="text-evolve-inchworm text-xs font-bold">
                stage {stageForProgress(card.growth_stage ?? 0)}
              </p>
              <p className="text-white/40 text-[10px] capitalize">
                {stageLabel(card.growth_stage ?? 0)}
              </p>
            </div>
          </div>

          {isOwner && pendingInvites.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-white/30 text-[10px] font-bold uppercase tracking-wide">pending invites</p>
              {pendingInvites.map((inv) => (
                <div
                  key={inv.id}
                  className="rounded-xl border border-evolve-yellow/25 bg-evolve-yellow/[0.06] px-3 py-2.5 flex flex-col gap-2"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center flex-shrink-0">
                      {inv.organizations.logo_url ? (
                        <img src={inv.organizations.logo_url} alt="" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-sm">🏫</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-xs font-semibold truncate">{inv.organizations.name}</p>
                      <p className="text-white/40 text-[10px] truncate">
                        as {inv.member_type || inv.role}
                        {inv.inviter?.name ? ` · invited by ${inv.inviter.name}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => respondToInvite(inv.id, true)}
                      disabled={respondingId === inv.id}
                      className="flex-1 bg-evolve-yellow text-evolve-black text-[11px] font-bold rounded-lg py-1.5 disabled:opacity-50"
                    >
                      accept
                    </button>
                    <button
                      onClick={() => respondToInvite(inv.id, false)}
                      disabled={respondingId === inv.id}
                      className="flex-1 border border-white/15 text-white/50 hover:text-white text-[11px] font-semibold rounded-lg py-1.5 disabled:opacity-50"
                    >
                      decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isOwner && orgSpaces.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-white/30 text-[10px] font-bold uppercase tracking-wide">your spaces</p>
              {orgSpaces.map(({ role, organizations: org }) => (
                <Link
                  key={org.slug}
                  to={`/institute/${org.slug}`}
                  className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] hover:border-evolve-lavender-indigo/40 px-3 py-2.5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center flex-shrink-0">
                    {org.logo_url ? (
                      <img src={org.logo_url} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-sm">{org.org_type === "institute" ? "🎓" : "🏢"}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-xs font-semibold truncate">{org.name}</p>
                    <p className="text-white/30 text-[10px] capitalize">{role}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-auto pt-2">
            {isOwner ? (
              <button
                onClick={() => setViewingPublic(v => !v)}
                className="w-full text-xs font-semibold border border-white/15 text-white/70 hover:border-white/30 rounded-full px-4 py-2.5 transition-colors"
              >
                {viewingPublic ? "back to my dashboard" : "view my page"}
              </button>
            ) : (
              <button
                onClick={copyLink}
                className="w-full text-xs font-semibold text-evolve-black bg-evolve-yellow rounded-full px-4 py-2.5 active:opacity-80"
              >
                {copied ? "copied!" : "share this profile"}
              </button>
            )}
          </div>
          </div>
        </aside>

        {/* main content */}
        <main className="flex-1 px-6 md:px-8 py-8 flex flex-col gap-8">
          {isOwner && location.state?.justJoinedOrg && (
            <div className="rounded-xl bg-evolve-inchworm/10 border border-evolve-inchworm/25 text-evolve-inchworm text-xs font-bold px-4 py-3">
              🎉 you're in — {location.state.justJoinedOrg} is now listed under "your spaces" in the sidebar.
            </div>
          )}
          {showOwnerTools && !activeProgramme && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <TabButton active={activeTab === "learnings"} onClick={() => setActiveTab("learnings")}>
                  🌿 learnings
                </TabButton>
                <TabButton active={activeTab === "my-work"} onClick={() => setActiveTab("my-work")}>
                  🗂️ my work
                </TabButton>
              </div>
              <button
                onClick={() => setViewingPublic(true)}
                className="text-xs font-semibold border border-white/15 text-white/60 hover:border-white/30 rounded-full px-4 py-2 transition-colors"
              >
                view my page
              </button>
            </div>
          )}

          {activeProgramme === "portfolio-review" ? (
            <PortfolioReviewProgramme user={user} onBack={() => setActiveProgramme(null)} />
          ) : activeProgramme === "mentorship" ? (
            <MentorshipProgramme onBack={() => setActiveProgramme(null)} />
          ) : showOwnerTools && activeTab === "learnings" ? (
            <Section title="evolve programmes">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProgramCard
                  art={<PortfolioReviewArt />}
                  label="portfolio review"
                  description="a live 1:1 review of your portfolio with a working industry reviewer, plus a written report."
                  chips={["Live 1:1 review", "Written report"]}
                  onClick={() => setActiveProgramme("portfolio-review")}
                  progress={getPortfolioReviewProgress(evolveReview)}
                  buttonLabel={
                    evolveReview
                      ? getPortfolioReviewProgress(evolveReview)?.step === 5
                        ? "view report →"
                        : "continue your review →"
                      : undefined
                  }
                />
                <ProgramCard
                  art={<MentorshipArt />}
                  label="mentorship"
                  description="personalised 1:1 mentorship to define your design career — someone in your corner until you land."
                  chips={["1:1 personalised", "5 sessions"]}
                  onClick={() => setActiveProgramme("mentorship")}
                />
              </div>
            </Section>
          ) : (
            <WorkTab discipline={card.discipline} />
          )}
        </main>
      </div>
    </div>
  );
}
