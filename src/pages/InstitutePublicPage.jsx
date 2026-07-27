import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../hooks/useAuth";
import GrowthMascot from "../components/GrowthMascot";
import OrgLogoBox from "../components/OrgLogoBox";
import { ROLE_META, EVOLVE_PROGRAMS, AVATAR_GRADIENTS, TYPE_META, initialsOf, timeAgo } from "../lib/orgShared";

const fieldInputCls =
  "w-full bg-white/[0.055] border border-white/10 focus:border-evolve-lavender-indigo/60 text-sm text-white placeholder-white/25 outline-none rounded-lg px-3 py-2.5 transition-colors";

function StatBlock({ value, label }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5">
      <p className="text-white font-extrabold text-[15px] leading-tight truncate">{value}</p>
      <p className="text-white/30 text-[10px] mt-1">{label}</p>
    </div>
  );
}

export default function InstitutePublicPage() {
  const { slug } = useParams();
  const { user } = useAuth();

  const [org, setOrg] = useState(null);
  const [members, setMembers] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [events, setEvents] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [toast, setToast] = useState(null);

  const [tab, setTab] = useState("feed");
  const [teamRoleFilter, setTeamRoleFilter] = useState("all");

  const [postModalOpen, setPostModalOpen] = useState(false);
  const [shareTitle, setShareTitle] = useState("");
  const [shareDesc, setShareDesc] = useState("");
  const [shareSubmitting, setShareSubmitting] = useState(false);

  const [testQuote, setTestQuote] = useState("");
  const [testName, setTestName] = useState("");
  const [testRole, setTestRole] = useState("");
  const [testSubmitting, setTestSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setNotFound(false);

    const { data: orgData } = await supabase.from("organizations").select("*").eq("slug", slug).maybeSingle();
    if (!orgData) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setOrg(orgData);

    const [{ data: memberRows }, { data: updateRows }, { data: eventRows }, { data: testimonialRows }] =
      await Promise.all([
        supabase
          .from("organization_members")
          .select("*, profiles:user_id(name, avatar_url)")
          .eq("org_id", orgData.id)
          .eq("status", "active"),
        supabase
          .from("org_updates")
          .select("*, profiles:author_id(name, avatar_url)")
          .eq("org_id", orgData.id)
          .eq("status", "live")
          .order("published_at", { ascending: false }),
        supabase.from("org_events").select("*").eq("org_id", orgData.id).order("event_date", { ascending: true }),
        supabase.from("org_testimonials").select("*").eq("org_id", orgData.id).order("created_at", { ascending: false })
      ]);

    setMembers(memberRows || []);
    setUpdates(updateRows || []);
    setEvents(eventRows || []);
    setTestimonials(testimonialRows || []);
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const isOwner = !!(org && user && org.owner_id === user.id);
  const myMembership = members.find((m) => m.user_id === user?.id);
  const canModerate = isOwner || myMembership?.role === "admin";
  const canSubmitUpdate = isOwner || myMembership?.role === "admin" || myMembership?.member_type === "faculty";
  const isInstitute = org?.org_type === "institute";

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }

  async function submitShareUpdate() {
    if (!shareTitle.trim() || !user) return;
    setShareSubmitting(true);
    const publishDirectly = canSubmitUpdate && canModerate;
    const { error: insErr } = await supabase.from("org_updates").insert({
      org_id: org.id,
      author_id: user.id,
      title: shareTitle.trim(),
      description: shareDesc.trim() || null,
      status: publishDirectly ? "live" : "pending",
      published_at: publishDirectly ? new Date().toISOString() : null
    });
    setShareSubmitting(false);
    if (insErr) {
      showToast("couldn't share that — try again");
      return;
    }
    setPostModalOpen(false);
    setShareTitle("");
    setShareDesc("");
    load();
    showToast(publishDirectly ? "posted to the public feed" : "submitted for review");
  }

  async function submitTestimonial() {
    if (!testQuote.trim() || !testName.trim()) return;
    setTestSubmitting(true);
    const { error: insErr } = await supabase.from("org_testimonials").insert({
      org_id: org.id,
      quote: testQuote.trim(),
      name: testName.trim(),
      role: testRole.trim() || null
    });
    setTestSubmitting(false);
    if (insErr) {
      showToast("couldn't add that — try again");
      return;
    }
    setTestQuote("");
    setTestName("");
    setTestRole("");
    load();
    showToast("testimonial added");
  }

  async function removeTestimonial(id) {
    const { error: delErr } = await supabase.from("org_testimonials").delete().eq("id", id);
    if (delErr) return showToast("couldn't remove — try again");
    load();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#131313" }}>
        <GrowthMascot progress={10} size={56} />
      </div>
    );
  }

  if (notFound) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-6"
        style={{ backgroundColor: "#131313" }}
      >
        <p className="text-white font-bold text-xl">this page isn't available.</p>
        <p className="text-white/40 text-sm max-w-sm">
          "{slug}" may not exist, or the owner has kept this space private.
        </p>
        <Link to="/" className="text-evolve-lavender-indigo text-sm font-semibold mt-2">
          back to evolve
        </Link>
      </div>
    );
  }

  const TABS = [
    { id: "feed", label: "feed" },
    ...(isInstitute || org.org_type === "company" ? [{ id: "programs", label: isInstitute ? "evolve programs" : "programs" }] : []),
    { id: "team", label: "team", count: members.length }
  ];

  const teamRoles = isInstitute ? ["all", "admin", "faculty", "student"] : ["all", "admin", "member"];
  const filteredMembers = members.filter((m) => {
    if (teamRoleFilter === "all") return true;
    if (teamRoleFilter === "admin") return m.role === "owner" || m.role === "admin";
    if (!isInstitute) return m.role === "member";
    return m.member_type === teamRoleFilter;
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#131313" }}>
      {/* global topbar */}
      <div
        className="h-[52px] border-b border-white/10 flex items-center px-6 gap-6 sticky top-0 z-[70]"
        style={{ background: "#131313" }}
      >
        <Link to="/" className="font-extrabold text-[17px] text-white tracking-tight flex-shrink-0">
          evolve<span className="text-evolve-lavender-indigo">.</span>
        </Link>
        <div className="hidden md:flex items-center gap-5 ml-auto">
          <span title="coming soon" className="text-white/35 text-xs font-semibold cursor-default">
            explore spaces
          </span>
          <Link to="/community" className="text-white/50 hover:text-white text-xs font-semibold transition-colors">
            evolve community
          </Link>
          <span title="coming soon" className="text-white/35 text-xs font-semibold cursor-default">
            search designers
          </span>
        </div>
        <div className="flex items-center gap-3 ml-auto md:ml-0 flex-shrink-0">
          {user?.username && (
            <Link
              to={`/profile/${user.username}`}
              className="w-[30px] h-[30px] rounded-full overflow-hidden flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
              style={{ background: "linear-gradient(135deg, rgba(163,91,251,1), #c264ff)" }}
            >
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                initialsOf(user.name)
              )}
            </Link>
          )}
        </div>
      </div>

      {/* institute banner — part of the normal page flow (not sticky). It
          used to pin itself below the topbar and collapse on scroll, but
          stacking two sticky+blurred layers while the rest of the page kept
          scrolling underneath caused visible tearing/flicker. Letting it
          scroll away with everything else is both simpler and smoother. */}
      <div className="border-b border-white/10" style={{ background: "#181818" }}>
        <div className="max-w-[1080px] mx-auto px-6 md:px-12 pt-6 md:pt-8 pb-2">
          <div className="flex items-start gap-5">
            <OrgLogoBox org={org} size={64} rounded="rounded-2xl" />
            <div className="flex-1 min-w-0">
              <p className="text-white font-extrabold text-xl md:text-2xl tracking-tight">{org.name}</p>
              {org.location && <p className="text-white/30 text-xs mt-1.5">{org.location}</p>}
              {org.bio && (
                <p className="text-white/50 text-[13px] md:text-sm leading-relaxed mt-2.5 max-w-3xl">{org.bio}</p>
              )}

              <div className="flex items-center gap-2 mt-3.5 flex-wrap">
                {org.website && (
                  <a
                    href={org.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-evolve-lavender-indigo text-xs font-semibold bg-white/[0.04] border border-white/10 rounded-full px-3 py-1.5"
                  >
                    🔗 {org.website.replace(/^https?:\/\//, "")}
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

              {(org.awards || []).length > 0 && (
                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                  {org.awards.map((a, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/50 bg-white/[0.04] border border-white/10 rounded-full px-2.5 py-1"
                    >
                      🏆 {a.title}
                      {a.issuer ? ` · ${a.issuer}` : ""}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 mt-5 max-w-xl">
            <StatBlock value={org.year_founded || "—"} label="est. year" />
            <StatBlock
              value={org.expected_members || members.length}
              label={isInstitute ? "faculty & students" : "team size"}
            />
            <StatBlock value={updates.length} label="highlights posted" />
          </div>

          {/* tabs — normal flow, not sticky. Only the slim global topbar
              above stays fixed, so the whole page scrolls as one piece
              instead of splitting into independently-scrolling regions. */}
          <div className="flex gap-1 mt-5 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-1 py-3 mr-6 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 flex-shrink-0 ${
                  tab === t.id ? "text-white border-evolve-lavender-indigo" : "text-white/30 border-transparent hover:text-white/60"
                }`}
              >
                {t.label}
                {t.count != null && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      tab === t.id ? "bg-evolve-lavender-indigo/25 text-evolve-lavender-indigo" : "bg-white/[0.06] text-white/30"
                    }`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* main content */}
      <div className="max-w-[1080px] mx-auto px-6 md:px-12 py-7 pb-24">
        {/* ============ feed ============ */}
        {tab === "feed" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <p className="text-white font-extrabold text-base">institute highlights</p>
                  {canSubmitUpdate && (
                    <button
                      onClick={() => setPostModalOpen(true)}
                      className="text-xs font-bold text-evolve-lavender-indigo flex-shrink-0"
                    >
                      + post
                    </button>
                  )}
                </div>

                {updates.length === 0 ? (
                  <p className="text-white/25 text-sm italic py-6 text-center">nothing posted yet.</p>
                ) : (
                  <div className="flex flex-col">
                    {updates.map((u) => (
                      <div key={u.id} className="py-4 border-b border-white/5 last:border-b-0 first:pt-0">
                        <p className="text-white font-bold text-sm mb-1">{u.title}</p>
                        {u.description && <p className="text-white/45 text-[12.5px] leading-relaxed">{u.description}</p>}
                        <p className="text-white/25 text-[11px] mt-2.5">
                          posted {timeAgo(u.published_at || u.created_at)}
                          {u.profiles?.name ? ` · by ${u.profiles.name}` : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {/* calendar */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-white font-extrabold text-sm mb-3">mark your calendar</p>
                {events.length === 0 ? (
                  <p className="text-white/25 text-xs italic py-3 text-center">no upcoming events.</p>
                ) : (
                  <div className="flex flex-col divide-y divide-white/5">
                    {events.map((ev) => {
                      const d = new Date(`${ev.event_date}T00:00:00`);
                      const day = String(d.getDate()).padStart(2, "0");
                      const mon = d.toLocaleString("en-US", { month: "short" }).toLowerCase();
                      const tm = TYPE_META[ev.type];
                      return (
                        <div key={ev.id} className="flex items-start gap-2.5 py-3 first:pt-0 last:pb-0">
                          <div className="w-10 min-w-10 rounded-lg border border-white/10 bg-white/[0.03] flex flex-col items-center justify-center py-1.5 flex-shrink-0">
                            <p className="text-white font-extrabold text-[13px] leading-none">{day}</p>
                            <p className="text-white/30 text-[8px] font-bold uppercase mt-0.5">{mon}</p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full ${tm.bg} ${tm.text}`}>
                                {tm.label}
                              </span>
                              <span className="text-white text-xs font-bold">{ev.title}</span>
                              {ev.audience === "internal" && (
                                <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-white/10 text-white/40">
                                  team only
                                </span>
                              )}
                            </div>
                            {ev.meta && <p className="text-white/25 text-[10.5px] mt-0.5">{ev.meta}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* testimonials */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-white font-extrabold text-sm mb-3">testimonials</p>
                {testimonials.length === 0 && !isOwner && (
                  <p className="text-white/25 text-xs italic py-3 text-center">no testimonials yet.</p>
                )}
                {testimonials.length > 0 && (
                  <div className="flex flex-col divide-y divide-white/5 mb-1">
                    {testimonials.map((t, i) => (
                      <div key={t.id} className="py-3.5 first:pt-0 last:pb-0">
                        <p className="text-white text-[12.5px] italic leading-relaxed mb-2.5">"{t.quote}"</p>
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-6.5 h-6.5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 overflow-hidden"
                            style={{ background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length], width: 26, height: 26 }}
                          >
                            {initialsOf(t.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-white text-[11.5px] font-semibold truncate">{t.name}</p>
                            {t.role && <p className="text-white/30 text-[10px] truncate">{t.role}</p>}
                          </div>
                          {isOwner && (
                            <button
                              onClick={() => removeTestimonial(t.id)}
                              className="text-white/20 hover:text-evolve-red text-xs flex-shrink-0"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {isOwner && (
                  <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-white/10">
                    <textarea
                      rows={2}
                      value={testQuote}
                      onChange={(e) => setTestQuote(e.target.value)}
                      placeholder="add a testimonial quote…"
                      className={`${fieldInputCls} resize-y`}
                    />
                    <div className="flex gap-2">
                      <input
                        value={testName}
                        onChange={(e) => setTestName(e.target.value)}
                        placeholder="name"
                        className={fieldInputCls}
                      />
                      <input
                        value={testRole}
                        onChange={(e) => setTestRole(e.target.value)}
                        placeholder="role (optional)"
                        className={fieldInputCls}
                      />
                    </div>
                    <button
                      onClick={submitTestimonial}
                      disabled={testSubmitting || !testQuote.trim() || !testName.trim()}
                      className="text-xs font-bold bg-evolve-lavender-indigo text-white rounded-lg px-4 py-2 disabled:opacity-40 self-end"
                    >
                      {testSubmitting ? "adding…" : "+ add testimonial"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============ evolve programs ============ */}
        {tab === "programs" && (
          <div className="flex flex-col gap-4">
            <p className="text-white/40 text-xs max-w-xl">
              {isInstitute
                ? "structured, industry-led programmes this institute runs through evolve."
                : org.programme_details || "no details added yet."}
            </p>
            {isInstitute && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {EVOLVE_PROGRAMS.map((p) => (
                  <a
                    key={p.id}
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-2xl border border-white/10 bg-white/[0.03] hover:border-white/20 overflow-hidden flex flex-col transition-colors"
                  >
                    <div
                      className={`h-24 flex items-center justify-center text-3xl ${
                        p.accent === "purple" ? "bg-evolve-lavender-indigo/15" : "bg-evolve-inchworm/15"
                      }`}
                    >
                      {p.emoji}
                    </div>
                    <div className="p-4 flex flex-col gap-2.5">
                      <p className="text-white font-extrabold text-[15px]">{p.name}</p>
                      <p className="text-white/40 text-xs leading-relaxed">{p.desc}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {p.meta.map((m) => (
                          <span
                            key={m}
                            className="text-[10px] font-semibold text-white/40 bg-white/[0.04] border border-white/10 px-2 py-1 rounded-full"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                      <span
                        className={`text-xs font-bold pt-2 mt-1 border-t border-white/10 ${
                          p.accent === "purple" ? "text-evolve-lavender-indigo" : "text-evolve-inchworm"
                        }`}
                      >
                        learn more →
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============ team ============ */}
        {tab === "team" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <p className="text-white font-bold text-sm">{members.length} members</p>
              <div className="inline-flex bg-white/[0.04] border border-white/10 rounded-lg p-1 gap-1">
                {teamRoles.map((r) => (
                  <button
                    key={r}
                    onClick={() => setTeamRoleFilter(r)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${
                      teamRoleFilter === r ? "bg-white/[0.08] text-white" : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    {r === "all" ? "all" : r === "admin" ? "admin" : ROLE_META[r]?.plural || r}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
              {filteredMembers.length === 0 ? (
                <p className="text-white/25 text-sm italic p-6">no matches.</p>
              ) : (
                <div className="divide-y divide-white/5">
                  {filteredMembers.map((m, i) => {
                    const roleBadge =
                      m.role === "owner" || m.role === "admin" ? "admin" : m.member_type || (isInstitute ? null : "member");
                    const discipline = m.title || m.intake?.department || m.intake?.program || m.intake?.subjects || null;
                    return (
                      <div key={m.id} className="flex items-center gap-3 px-5 py-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden"
                          style={{ background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length] }}
                        >
                          {m.profiles?.avatar_url ? (
                            <img src={m.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            initialsOf(m.profiles?.name)
                          )}
                        </div>
                        <p className="text-white text-sm font-semibold flex-1 min-w-0 truncate">
                          {m.profiles?.name || "evolve member"}
                        </p>
                        {roleBadge && (
                          <span
                            className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full flex-shrink-0 ${
                              roleBadge === "admin"
                                ? "bg-evolve-yellow/10 text-evolve-yellow"
                                : roleBadge === "faculty"
                                  ? "bg-evolve-lavender-indigo/10 text-evolve-lavender-indigo"
                                  : "bg-white/[0.06] text-white/40"
                            }`}
                          >
                            {roleBadge}
                          </span>
                        )}
                        {discipline && (
                          <span className="text-white/30 text-xs flex-shrink-0 hidden sm:block max-w-[160px] truncate">
                            {discipline}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ============ modal: post a highlight ============ */}
      {postModalOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/65 backdrop-blur-sm flex items-start justify-center px-5 py-[8vh] overflow-y-auto"
          onClick={(e) => e.target === e.currentTarget && setPostModalOpen(false)}
        >
          <div className="w-full max-w-[460px] rounded-2xl border border-white/15 p-6" style={{ background: "#1c1c1e" }}>
            <div className="flex items-start justify-between gap-4 mb-1">
              <div>
                <p className="text-white font-extrabold text-lg">post a highlight</p>
                <p className="text-white/40 text-xs mt-1">
                  {canModerate
                    ? "this goes live on the public feed immediately."
                    : "an owner or admin will review this before it goes live."}
                </p>
              </div>
              <button
                onClick={() => setPostModalOpen(false)}
                className="text-white/40 hover:text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/[0.06] flex-shrink-0"
              >
                ×
              </button>
            </div>
            <div className="flex flex-col gap-4 mt-4">
              <div>
                <label className="text-white/30 text-[10.5px] font-bold uppercase tracking-wide mb-1.5 block">title</label>
                <input
                  value={shareTitle}
                  onChange={(e) => setShareTitle(e.target.value)}
                  maxLength={90}
                  placeholder="e.g. NID students win 3 D&AD pencils this year"
                  className={fieldInputCls}
                />
              </div>
              <div>
                <label className="text-white/30 text-[10.5px] font-bold uppercase tracking-wide mb-1.5 block">
                  description
                </label>
                <textarea
                  rows={3}
                  value={shareDesc}
                  onChange={(e) => setShareDesc(e.target.value)}
                  placeholder="what happened, and why it matters"
                  className={`${fieldInputCls} resize-y`}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2.5 mt-5">
              <button
                onClick={() => setPostModalOpen(false)}
                className="text-xs font-semibold text-white/50 border border-white/15 rounded-lg px-4 py-2 hover:text-white"
              >
                cancel
              </button>
              <button
                onClick={submitShareUpdate}
                disabled={shareSubmitting || !shareTitle.trim()}
                className="text-xs font-bold bg-evolve-lavender-indigo text-white rounded-lg px-4 py-2 disabled:opacity-40"
              >
                {shareSubmitting ? "sharing…" : canModerate ? "publish" : "submit for review"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* toast */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-xl flex items-center gap-2.5"
          style={{ background: "#232325", border: "1px solid rgba(255,255,255,0.16)", color: "#fff" }}
        >
          <span className="w-5 h-5 rounded-full bg-evolve-inchworm/15 text-evolve-inchworm flex items-center justify-center text-xs">
            ✓
          </span>
          {toast}
        </div>
      )}
    </div>
  );
}
