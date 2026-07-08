import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../hooks/useAuth";
import GrowthMascot from "../components/GrowthMascot";

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

function DrillCard({ label }) {
  return (
    <div
      title="coming soon"
      className="flex-1 min-w-[110px] rounded-xl border border-white/10 bg-white/[0.03] px-4 py-6 text-center text-white/50 text-xs font-semibold cursor-default"
    >
      {label}
    </div>
  );
}

function ProgramCard({ label, href }) {
  return (
    <Link
      to={href}
      className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] hover:border-evolve-lavender-indigo/50 px-5 py-8 text-center text-white text-sm font-semibold transition-colors"
    >
      {label}
    </Link>
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
        <GrowthMascot progress={10} size={56} />
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
        <Link to="/" className="text-white font-bold text-sm">evolve</Link>
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
          <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {card.avatar_url ? (
              <img src={card.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              (card.name || "?")[0].toUpperCase()
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* sidebar */}
        <aside className="w-full md:w-[300px] md:border-r border-white/10 px-6 py-8 flex flex-col gap-6 flex-shrink-0">
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

          {isOwner && user.email && <p className="text-white/30 text-xs">{user.email}</p>}

          <div className="flex items-center gap-2">
            <SocialIcon label="Be" />
            <SocialIcon label="Dr" />
            <SocialIcon label="Li" />
            <SocialIcon label="↗" />
          </div>

          <div className="w-fit text-[10px] font-bold uppercase tracking-wide text-evolve-inchworm border border-evolve-inchworm/30 rounded-full px-3 py-1.5">
            🌱 growing steadily
          </div>

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
        </aside>

        {/* main content */}
        <main className="flex-1 px-6 md:px-8 py-8 flex flex-col gap-8">
          {showOwnerTools && (
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

          {showOwnerTools && activeTab === "learnings" ? (
            <>
              <textarea
                disabled
                title="coming soon"
                rows={2}
                placeholder="got a question about design, your project? ask away…"
                className="w-full text-sm text-white/40 placeholder-white/30 outline-none border border-white/10 rounded-2xl px-5 py-4 resize-none cursor-default"
                style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
              />

              <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
                <Section title="daily drill">
                  <div className="flex flex-wrap gap-3">
                    <DrillCard label="quick learnings" />
                    <DrillCard label="news" />
                    <DrillCard label="quiz" />
                    <DrillCard label="practice" />
                  </div>
                </Section>

                <Section title="upcoming events on evolve">
                  <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-5 py-8 text-center">
                    <p className="text-white/30 text-xs">nothing scheduled yet — check back soon.</p>
                  </div>
                </Section>
              </div>

              <Section title="evolve programs">
                <div className="flex flex-col sm:flex-row gap-4">
                  <ProgramCard label="portfolio review" href="/community/portfolio-review" />
                  <ProgramCard label="mentorship" href="/mentorship" />
                  <ProgramCard label="courses" href="/course" />
                </div>
              </Section>
            </>
          ) : (
            <WorkTab discipline={card.discipline} />
          )}
        </main>
      </div>
    </div>
  );
}
