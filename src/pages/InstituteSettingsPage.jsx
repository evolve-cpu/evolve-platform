import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../hooks/useAuth";
import GrowthMascot from "../components/GrowthMascot";
import OrgLogoBox from "../components/OrgLogoBox";
import InstituteInfoPanel from "../components/InstituteInfoPanel";
import { initialsOf } from "../lib/orgShared";

// A dedicated page rather than a modal — settings here covers real
// account-level actions (transfer ownership, delete/restore) that deserve
// their own URL and back-navigation, not something you'd want buried in an
// overlay. Owner-only: this whole page redirects anyone else back to the
// public /institute/:slug page.
//
// "space id" below shows the organization's real database id (truncated,
// full value on copy) rather than a made-up "spc_xxxxx" format — there's no
// separate pretty-id column in the schema, and inventing display text that
// doesn't map to anything real isn't worth the resemblance to the mockup.
//
// "program billing" is a permanent empty state — there's no payments/billing
// data model for orgs anywhere in this codebase yet, so there's nothing real
// to show beyond "you don't have any paid programs".
//
// Deleting a space sets deleted_at/deleted_by and stops there — nothing in
// this codebase currently hard-deletes a space 14 days later. That needs a
// scheduled job (cron/edge function) that doesn't exist yet, so today a
// deleted space just stays soft-deleted (restorable) indefinitely.

const fieldInputCls =
  "w-full bg-white/[0.055] border border-white/10 focus:border-evolve-lavender-indigo/60 text-sm text-white placeholder-white/25 outline-none rounded-lg px-3 py-2.5 transition-colors";

function SectionCard({ icon, iconBg, iconColor, title, subtitle, titleClass, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      <div className="flex items-start gap-3 mb-5">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg} ${iconColor}`}>{icon}</div>
        <div>
          <p className={`font-extrabold text-[15px] ${titleClass || "text-white"}`}>{title}</p>
          <p className="text-white/40 text-xs mt-0.5">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-white/30 text-[10px] font-bold uppercase tracking-wide mb-1">{label}</p>
      <div className="text-white text-[13px] font-semibold">{value}</div>
    </div>
  );
}

export default function InstituteSettingsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, authLoading } = useAuth();

  const [org, setOrg] = useState(null);
  const [members, setMembers] = useState([]);
  const [deletedByName, setDeletedByName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [toast, setToast] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const [visibilityDraft, setVisibilityDraft] = useState("public");
  const [visibilityDirty, setVisibilityDirty] = useState(false);
  const [visibilitySaving, setVisibilitySaving] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState({
    new_post_pending: true,
    new_member: true,
    weekly_analytics: false,
    product_updates: false
  });

  const [transferSheetOpen, setTransferSheetOpen] = useState(false);
  const [transferStep, setTransferStep] = useState("pick"); // pick | confirm
  const [transferPickId, setTransferPickId] = useState(null);
  const [transferConfirmText, setTransferConfirmText] = useState("");
  const [transferSubmitting, setTransferSubmitting] = useState(false);

  const [deleteSheetOpen, setDeleteSheetOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [restoring, setRestoring] = useState(false);

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

    const { data: memberRows } = await supabase
      .from("organization_members")
      .select("*, profiles:user_id(name, avatar_url)")
      .eq("org_id", orgData.id);
    setMembers(memberRows || []);

    if (orgData.deleted_by) {
      const { data: deleter } = await supabase.from("profiles").select("name").eq("id", orgData.deleted_by).maybeSingle();
      setDeletedByName(deleter?.name || null);
    } else {
      setDeletedByName(null);
    }

    setVisibilityDraft(orgData.visibility || "public");
    setVisibilityDirty(false);
    setNotifPrefs({
      new_post_pending: true,
      new_member: true,
      weekly_analytics: false,
      product_updates: false,
      ...(orgData.notification_prefs || {})
    });

    setLoading(false);
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const isOwner = !!(org && user && org.owner_id === user.id);

  // owner-only page — bounce everyone else back to the public page
  useEffect(() => {
    if (loading || authLoading || !org) return;
    if (!user || !isOwner) navigate(`/institute/${slug}`, { replace: true });
  }, [loading, authLoading, org, user, isOwner, slug, navigate]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }

  async function saveVisibility() {
    setVisibilitySaving(true);
    const { error: err } = await supabase.from("organizations").update({ visibility: visibilityDraft }).eq("id", org.id);
    setVisibilitySaving(false);
    if (err) return showToast("couldn't save — try again");
    setOrg((o) => ({ ...o, visibility: visibilityDraft }));
    setVisibilityDirty(false);
    showToast("privacy setting saved");
  }

  async function toggleNotifPref(key) {
    const next = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(next);
    const { error: err } = await supabase.from("organizations").update({ notification_prefs: next }).eq("id", org.id);
    if (err) {
      setNotifPrefs(notifPrefs);
      showToast("couldn't save — try again");
      return;
    }
    setOrg((o) => ({ ...o, notification_prefs: next }));
  }

  function copySpaceId() {
    navigator.clipboard?.writeText(org.id).catch(() => {});
    showToast("space id copied");
  }

  /* ── transfer ownership ───────────────────────────────────────────── */

  const transferCandidates = members.filter((m) => m.role === "admin" && m.status === "active" && m.user_id && m.user_id !== org?.owner_id);

  function openTransferSheet() {
    setTransferStep("pick");
    setTransferPickId(null);
    setTransferConfirmText("");
    setTransferSheetOpen(true);
  }

  async function submitTransfer() {
    const newOwnerMembership = members.find((m) => m.user_id === transferPickId);
    const oldOwnerMembership = members.find((m) => m.user_id === org.owner_id);
    if (!newOwnerMembership) return;
    setTransferSubmitting(true);

    // order matters for RLS: swap member roles *before* reassigning
    // owner_id, while the acting user still satisfies "is the org owner"
    const { error: newRoleErr } = await supabase.from("organization_members").update({ role: "owner" }).eq("id", newOwnerMembership.id);
    const { error: oldRoleErr } = oldOwnerMembership
      ? await supabase.from("organization_members").update({ role: "admin" }).eq("id", oldOwnerMembership.id)
      : { error: null };
    const { error: orgErr } = await supabase.from("organizations").update({ owner_id: newOwnerMembership.user_id }).eq("id", org.id);

    setTransferSubmitting(false);
    if (newRoleErr || oldRoleErr || orgErr) {
      showToast("couldn't complete the transfer — try again");
      return;
    }
    setTransferSheetOpen(false);
    navigate(`/institute/${slug}`, { replace: true, state: { justJoined: false } });
  }

  /* ── delete / restore ─────────────────────────────────────────────── */

  async function confirmDeleteSpace() {
    setDeleteSubmitting(true);
    const { error: err } = await supabase
      .from("organizations")
      .update({ deleted_at: new Date().toISOString(), deleted_by: user.id })
      .eq("id", org.id);
    setDeleteSubmitting(false);
    if (err) {
      showToast("couldn't delete — try again");
      return;
    }
    setDeleteSheetOpen(false);
    setDeleteConfirmText("");
    load();
  }

  async function restoreSpace() {
    setRestoring(true);
    const { error: err } = await supabase.from("organizations").update({ deleted_at: null, deleted_by: null }).eq("id", org.id);
    setRestoring(false);
    if (err) {
      showToast("couldn't restore — try again");
      return;
    }
    load();
    showToast("space restored");
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#131313" }}>
        <GrowthMascot progress={10} size={56} />
      </div>
    );
  }

  if (notFound || !org || !isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#131313" }}>
        <GrowthMascot progress={10} size={56} />
      </div>
    );
  }

  const activeMemberCount = members.filter((m) => m.status === "active").length;
  const isDeleted = !!org.deleted_at;
  const deletedAtMs = isDeleted ? new Date(org.deleted_at).getTime() : null;
  const permanentAtMs = isDeleted ? deletedAtMs + 14 * 86400000 : null;
  const daysLeft = isDeleted ? Math.max(0, Math.ceil((permanentAtMs - Date.now()) / 86400000)) : null;
  const progressPct = isDeleted ? Math.min(100, Math.max(2, ((14 - daysLeft) / 14) * 100)) : 0;
  const fmtDate = (ms) => new Date(ms).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const sidebarStats = [
    { num: org.year_founded || "—", label: "est. year" },
    { num: org.expected_members || activeMemberCount, label: org.org_type === "institute" ? "faculty & students" : "team size" }
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#131313" }}>
      {/* global topbar — same shell as the space page, so settings doesn't feel like a separate app */}
      <div className="h-[52px] border-b border-white/10 flex items-center px-5 md:px-6 gap-6 sticky top-0 z-[70] flex-shrink-0" style={{ background: "rgba(19,19,19,.94)", backdropFilter: "blur(14px)" }}>
        <Link to="/" className="font-extrabold text-[17px] text-white tracking-tight flex-shrink-0">
          evolve<span className="text-evolve-lavender-indigo">.</span>
        </Link>
        <div className="hidden md:flex items-center gap-5 ml-auto">
          <span title="coming soon" className="text-white/35 text-xs font-semibold cursor-default">
            explore spaces
          </span>
          <span title="coming soon" className="text-white/35 text-xs font-semibold cursor-default">
            explore people
          </span>
          <Link to="/community" className="text-white/50 hover:text-white text-xs font-semibold transition-colors">
            evolve community
          </Link>
        </div>
        <div className="flex items-center gap-1.5 ml-auto md:ml-0 flex-shrink-0">
          <button title="notifications" className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] flex-shrink-0 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 8A6 6 0 106 8c0 7-3 9-3 9h18s-3-2-3-9z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <div title="space settings" className="w-8 h-8 rounded-full flex items-center justify-center bg-evolve-lavender-indigo/15 text-evolve-lavender-indigo flex-shrink-0">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
              <path
                d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          {user?.username && (
            <Link
              to={`/profile/${user.username}`}
              className="w-[30px] h-[30px] rounded-full overflow-hidden flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 ml-1"
              style={{ background: "linear-gradient(135deg, rgba(163,91,251,1), #c264ff)" }}
            >
              {user.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> : initialsOf(user.name)}
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* institute info sidebar — collapsed by default here since settings is the focus, but expandable */}
        <aside
          className="hidden md:flex flex-col flex-shrink-0 border-r border-white/10 sticky self-start transition-[width] duration-200"
          style={{ width: sidebarCollapsed ? 78 : 320, top: 52, height: "calc(100vh - 52px)", background: "rgba(19,19,19,.97)" }}
        >
          <div className={`flex-1 min-h-0 overflow-y-auto ${sidebarCollapsed ? "px-3 py-5 flex flex-col items-center" : "px-5 py-5"}`}>
            <div className={`flex ${sidebarCollapsed ? "flex-col items-center gap-2.5" : "items-start justify-between gap-2"}`}>
              <OrgLogoBox org={org} size={sidebarCollapsed ? 36 : 48} rounded="rounded-2xl" />
              <button
                onClick={() => setSidebarCollapsed((v) => !v)}
                title={sidebarCollapsed ? "expand panel" : "collapse panel"}
                className="w-[26px] h-[26px] min-w-[26px] rounded-lg border border-white/10 text-white/35 hover:text-white flex items-center justify-center flex-shrink-0 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ transform: sidebarCollapsed ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
                  <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            {!sidebarCollapsed && (
              <div className="mt-3.5">
                <InstituteInfoPanel org={org} isAdmin={isOwner} sidebarStats={sidebarStats} onEditInfo={() => navigate(`/institute/${slug}`)} />
              </div>
            )}
          </div>
        </aside>

        <div className="flex-1 min-w-0 flex flex-col overflow-y-auto">
          <div className="max-w-[860px] w-full mx-auto px-5 md:px-6 py-8 pb-24 flex flex-col gap-5">
            <div>
              <Link to={`/institute/${slug}`} className="inline-flex items-center gap-1 text-evolve-lavender-indigo hover:underline text-xs font-bold mb-3">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                back
              </Link>
              <h1 className="text-white font-extrabold text-3xl">settings</h1>
              <p className="text-white/40 text-sm mt-1.5">manage how this space works, who owns it, and what people can see.</p>
            </div>

            {isDeleted ? (
          <>
            <div className="rounded-2xl border border-evolve-red/30 p-5 sm:p-6" style={{ background: "linear-gradient(180deg, rgba(223,5,134,.08), #1c1c1e)" }}>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-evolve-red/15 text-evolve-red flex items-center justify-center flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-extrabold text-[15px]">this space is scheduled for deletion</p>
                  <p className="text-white/50 text-xs mt-1 leading-relaxed">
                    the public page is offline and team access is disabled. restore until <strong className="text-white">{fmtDate(permanentAtMs)}</strong> — after that, deletion is
                    permanent.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10.5px] text-white/30 mb-1.5">
                <span>deleted {fmtDate(deletedAtMs)}</span>
                <span className="text-evolve-red font-bold">{daysLeft} days left</span>
              </div>
              <div className="h-[5px] rounded-full bg-white/10 overflow-hidden mb-4">
                <div className="h-full rounded-full bg-evolve-red" style={{ width: `${progressPct}%` }} />
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={restoreSpace}
                  disabled={restoring}
                  className="flex items-center justify-center gap-2 bg-white text-evolve-black font-bold text-[13px] rounded-xl py-3 disabled:opacity-50"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M3 12a9 9 0 1 1 3 6.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <polyline points="3 8 3 12 7 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {restoring ? "restoring…" : "restore this space"}
                </button>
                <a
                  href="mailto:contact@evolvedesign.academy"
                  className="text-center border border-white/15 text-white/60 hover:text-white font-bold text-[13px] rounded-xl py-3 transition-colors"
                >
                  contact support
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <InfoRow label="deleted by" value={deletedByName || "—"} />
              <InfoRow label="team affected" value={`${activeMemberCount} member${activeMemberCount === 1 ? "" : "s"}`} />
              <InfoRow label="permanent on" value={fmtDate(permanentAtMs)} />
              <InfoRow label="space name" value={org.name} />
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center gap-2 mb-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="text-evolve-bright-turquoise flex-shrink-0">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M12 16v-5M12 8h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <p className="text-white text-[13px] font-bold">what's paused right now</p>
              </div>
              <p className="text-white/45 text-xs leading-relaxed">
                the public page shows "not found" to visitors, and team members can't sign in to this space. restoring before <strong className="text-white">{fmtDate(permanentAtMs)}</strong>{" "}
                brings everything back exactly as it was.
              </p>
            </div>
          </>
        ) : (
          <>
            {/* general */}
            <SectionCard
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
              iconBg="bg-evolve-lavender-indigo/15"
              iconColor="text-evolve-lavender-indigo"
              title="general"
              subtitle="the basics — who owns this space and where it lives."
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <InfoRow label="space name" value={org.name} />
                <InfoRow
                  label="owner"
                  value={
                    <>
                      {members.find((m) => m.user_id === org.owner_id)?.profiles?.name || "you"}
                      <span className="ml-1.5 text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-evolve-yellow/15 text-evolve-yellow align-middle">owner</span>
                    </>
                  }
                />
                <InfoRow
                  label="space id"
                  value={
                    <span className="inline-flex items-center gap-1.5">
                      {org.id.slice(0, 13)}…
                      <button onClick={copySpaceId} title="copy full id" className="text-white/30 hover:text-white">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <rect x="9" y="9" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
                          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.8" />
                        </svg>
                      </button>
                    </span>
                  }
                />
                <InfoRow label="created on" value={fmtDate(new Date(org.created_at).getTime())} />
              </div>
            </SectionCard>

            {/* privacy & visibility */}
            <SectionCard
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              }
              iconBg="bg-evolve-bright-turquoise/15"
              iconColor="text-evolve-bright-turquoise"
              title="privacy & visibility"
              subtitle="who can see this space's page."
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { value: "public", title: "public", desc: "anyone on evolve can find and view this page." },
                  { value: "private", title: "team only", desc: "only invited team members can view this page." }
                ].map((v) => (
                  <button
                    key={v.value}
                    onClick={() => {
                      setVisibilityDraft(v.value);
                      setVisibilityDirty(v.value !== (org.visibility || "public"));
                    }}
                    className={`text-left rounded-xl border-[1.5px] p-3.5 transition-colors relative ${
                      visibilityDraft === v.value ? "border-evolve-lavender-indigo bg-evolve-lavender-indigo/10" : "border-white/10 bg-white/[0.03] hover:border-white/20"
                    }`}
                  >
                    <p className="text-white text-[13px] font-bold mb-1">{v.title}</p>
                    <p className="text-white/35 text-[11.5px] leading-relaxed">{v.desc}</p>
                    {visibilityDraft === v.value && (
                      <span className="absolute top-3 right-3 w-4 h-4 rounded-full bg-evolve-lavender-indigo text-white flex items-center justify-center">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                          <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between mt-3">
                <p className="text-white/30 text-[11px]">{visibilityDraft === "public" ? "public · discoverable across evolve." : "team only · visible only to your invited team members."}</p>
                <button
                  onClick={saveVisibility}
                  disabled={!visibilityDirty || visibilitySaving}
                  className="text-xs font-bold bg-evolve-lavender-indigo text-white rounded-lg px-4 py-2 disabled:opacity-30 flex-shrink-0"
                >
                  {visibilitySaving ? "saving…" : "save changes"}
                </button>
              </div>
            </SectionCard>

            {/* notifications */}
            <SectionCard
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M18 8A6 6 0 106 8c0 7-3 9-3 9h18s-3-2-3-9z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              }
              iconBg="bg-evolve-yellow/15"
              iconColor="text-evolve-yellow"
              title="notifications"
              subtitle="what this space emails you about."
            >
              <div className="flex flex-col">
                {[
                  { key: "new_post_pending", label: "new post submitted for review", desc: "when a team member posts a highlight for approval." },
                  { key: "new_member", label: "new team member joins", desc: "when someone joins via an invite." },
                  { key: "weekly_analytics", label: "weekly page analytics", desc: "a summary of views and engagement." },
                  { key: "product_updates", label: "product updates", desc: "occasional news about new evolve features." }
                ].map((row, i, arr) => (
                  <div key={row.key} className={`flex items-center justify-between gap-5 py-3 ${i < arr.length - 1 ? "border-b border-white/10" : ""} ${i === 0 ? "pt-0" : ""}`}>
                    <div>
                      <p className="text-white text-[13px] font-semibold">{row.label}</p>
                      <p className="text-white/30 text-[11px] mt-0.5 leading-relaxed">{row.desc}</p>
                    </div>
                    <button
                      onClick={() => toggleNotifPref(row.key)}
                      className={`w-[42px] h-6 min-w-[42px] rounded-full relative transition-colors flex-shrink-0 ${
                        notifPrefs[row.key] ? "bg-evolve-lavender-indigo" : "bg-white/10 border border-white/15"
                      }`}
                    >
                      <span className="absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white transition-all" style={{ left: notifPrefs[row.key] ? 20 : 2 }} />
                    </button>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* program billing */}
            <SectionCard
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="5" width="20" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M2 10h20" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              }
              iconBg="bg-evolve-inchworm/15"
              iconColor="text-evolve-inchworm"
              title="program billing"
              subtitle="paid programs you've unlocked for your team to participate in."
            >
              <div className="flex flex-col items-center text-center gap-2.5 py-8 px-5 rounded-xl border border-dashed border-white/15 bg-white/[0.02]">
                <div className="w-9 h-9 rounded-lg bg-white/[0.05] text-white/30 flex items-center justify-center mb-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="5" width="20" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M2 10h20" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                </div>
                <p className="text-white font-bold text-sm">no paid programs yet</p>
                <p className="text-white/35 text-xs max-w-sm leading-relaxed">once you unlock a paid program for your team, its billing and payment history will show up here.</p>
                <button onClick={() => navigate(`/institute/${slug}`, { state: { openTab: "programs" } })} className="mt-1 text-xs font-bold text-evolve-lavender-indigo">
                  browse ongoing programs →
                </button>
              </div>
            </SectionCard>

            {/* account management */}
            <SectionCard
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              }
              iconBg="bg-evolve-red/15"
              iconColor="text-evolve-red"
              titleClass="text-evolve-red"
              title="account management"
              subtitle="ownership transfer and space deletion — these actions are difficult or impossible to undo."
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <div>
                    <p className="text-white text-[13px] font-bold">transfer ownership</p>
                    <p className="text-white/35 text-[11.5px] mt-0.5 leading-relaxed max-w-md">hand over admin control to another admin. you'll be moved to an admin role.</p>
                  </div>
                  <button
                    onClick={openTransferSheet}
                    disabled={transferCandidates.length === 0}
                    title={transferCandidates.length === 0 ? "add another admin first" : undefined}
                    className="text-xs font-bold border border-white/15 text-white/70 hover:text-white rounded-lg px-4 py-2 flex-shrink-0 disabled:opacity-30 transition-colors"
                  >
                    transfer
                  </button>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <div>
                    <p className="text-white text-[13px] font-bold">delete this space</p>
                    <p className="text-white/35 text-[11.5px] mt-0.5 leading-relaxed max-w-md">deactivates the page and removes team access. 14 days to undo before it's permanent.</p>
                  </div>
                  <button
                    onClick={() => {
                      setDeleteConfirmText("");
                      setDeleteSheetOpen(true);
                    }}
                    className="text-xs font-bold border border-evolve-red/40 text-evolve-red bg-evolve-red/[0.06] hover:bg-evolve-red/[0.14] rounded-lg px-4 py-2 flex-shrink-0 transition-colors"
                  >
                    delete space
                  </button>
                </div>
              </div>
            </SectionCard>
          </>
        )}
          </div>
        </div>
      </div>

      {/* ============ sheet: transfer ownership ============ */}
      {transferSheetOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/65 backdrop-blur-sm flex items-end sm:items-start justify-center px-0 sm:px-5 py-0 sm:py-[8vh] overflow-y-auto"
          onClick={(e) => e.target === e.currentTarget && setTransferSheetOpen(false)}
        >
          <div className="w-full sm:max-w-[460px] rounded-t-3xl sm:rounded-2xl border border-white/15" style={{ background: "#1c1c1e" }}>
            <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-evolve-lavender-indigo/15 text-evolve-lavender-indigo flex items-center justify-center flex-shrink-0">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-extrabold text-lg">{transferStep === "pick" ? "transfer ownership" : "confirm the transfer"}</p>
                  <p className="text-white/40 text-xs mt-0.5">hand over control to another admin</p>
                </div>
              </div>
              <button onClick={() => setTransferSheetOpen(false)} className="text-white/40 hover:text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/[0.06] flex-shrink-0">
                ×
              </button>
            </div>

            {transferStep === "pick" ? (
              <div className="p-6 flex flex-col gap-2">
                {transferCandidates.map((m, i) => {
                  const selected = transferPickId === m.user_id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setTransferPickId(m.user_id)}
                      className={`flex items-center gap-3 rounded-xl border-[1.5px] p-3 text-left transition-colors ${
                        selected ? "border-evolve-lavender-indigo bg-evolve-lavender-indigo/10" : "border-white/10 bg-white/[0.03] hover:border-white/20"
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: "linear-gradient(135deg, #3139FF, #A35BFB)" }}>
                        {m.profiles?.avatar_url ? <img src={m.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : initialsOf(m.profiles?.name || m.invited_name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-[13px] font-bold truncate">{m.profiles?.name || m.invited_name || "member"}</p>
                        <p className="text-white/35 text-[11px] mt-0.5">admin{m.title ? ` · ${m.title}` : ""}</p>
                      </div>
                      <span
                        className={`w-[17px] h-[17px] rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 ${
                          selected ? "bg-evolve-lavender-indigo border-evolve-lavender-indigo text-white" : "border-white/25 text-transparent"
                        }`}
                      >
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                          <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </button>
                  );
                })}
                <button
                  onClick={() => setTransferStep("confirm")}
                  disabled={!transferPickId}
                  className="w-full text-[13px] font-bold bg-evolve-lavender-indigo text-white rounded-lg py-3 disabled:opacity-40 mt-2 transition-opacity"
                >
                  continue
                </button>
              </div>
            ) : (
              <div className="p-6 flex flex-col gap-1">
                {(() => {
                  const newOwner = members.find((m) => m.user_id === transferPickId);
                  const oldOwnerName = user?.name || "you";
                  return (
                    <div className="flex items-center justify-center gap-3 py-3">
                      <div className="flex flex-col items-center text-center gap-1.5 flex-1">
                        <div className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center text-white text-sm font-bold" style={{ background: "linear-gradient(135deg, #DF0586, #A35BFB)" }}>
                          {user?.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> : initialsOf(oldOwnerName)}
                        </div>
                        <p className="text-white text-xs font-bold">{oldOwnerName}</p>
                        <p className="text-white/30 text-[10px]">owner</p>
                        <p className="text-white/30 text-[10px]">→ becomes admin</p>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/25 flex-shrink-0">
                        <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <polyline points="12 5 19 12 12 19" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex flex-col items-center text-center gap-1.5 flex-1">
                        <div className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center text-white text-sm font-bold" style={{ background: "linear-gradient(135deg, #3139FF, #A35BFB)" }}>
                          {newOwner?.profiles?.avatar_url ? <img src={newOwner.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : initialsOf(newOwner?.profiles?.name)}
                        </div>
                        <p className="text-white text-xs font-bold">{newOwner?.profiles?.name || newOwner?.invited_name}</p>
                        <p className="text-white/30 text-[10px]">admin</p>
                        <p className="text-evolve-lavender-indigo text-[10px] font-semibold">→ becomes owner</p>
                      </div>
                    </div>
                  );
                })()}
                <div className="flex gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] p-3 mt-2">
                  <span className="text-white/30 flex-shrink-0">⚠</span>
                  <p className="text-white/45 text-[11px] leading-relaxed">
                    you'll still manage team, content, and programs as an admin — but billing, deletion, and future transfers will only be available to{" "}
                    {(members.find((m) => m.user_id === transferPickId)?.profiles?.name || "them").split(" ")[0]}.
                  </p>
                </div>
                <p className="text-white/30 text-[10.5px] font-bold uppercase tracking-wide mt-4 mb-1.5">type "transfer" to confirm</p>
                <input value={transferConfirmText} onChange={(e) => setTransferConfirmText(e.target.value)} placeholder="transfer" className={fieldInputCls} />
                <div className="flex gap-2.5 mt-4">
                  <button onClick={() => setTransferStep("pick")} className="flex-1 text-xs font-semibold text-white/50 border border-white/15 rounded-lg px-4 py-2.5 hover:text-white">
                    back
                  </button>
                  <button
                    onClick={submitTransfer}
                    disabled={transferSubmitting || transferConfirmText.trim().toLowerCase() !== "transfer"}
                    className="flex-[2] text-xs font-bold bg-evolve-lavender-indigo text-white rounded-lg px-4 py-2.5 disabled:opacity-40"
                  >
                    {transferSubmitting ? "transferring…" : "transfer"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============ sheet: delete space ============ */}
      {deleteSheetOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/65 backdrop-blur-sm flex items-end sm:items-start justify-center px-0 sm:px-5 py-0 sm:py-[8vh] overflow-y-auto"
          onClick={(e) => e.target === e.currentTarget && setDeleteSheetOpen(false)}
        >
          <div className="w-full sm:max-w-[460px] rounded-t-3xl sm:rounded-2xl border border-white/15" style={{ background: "#1c1c1e" }}>
            <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-evolve-red/15 text-evolve-red flex items-center justify-center flex-shrink-0">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                    <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-extrabold text-lg">delete this space?</p>
                  <p className="text-white/40 text-xs mt-0.5">this takes effect immediately</p>
                </div>
              </div>
              <button onClick={() => setDeleteSheetOpen(false)} className="text-white/40 hover:text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/[0.06] flex-shrink-0">
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="flex gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <span className="text-evolve-red flex-shrink-0">⚠</span>
                <p className="text-white/60 text-[11.5px] leading-relaxed">
                  this deactivates the space and team access for all <strong className="text-white">{activeMemberCount} members</strong> right away. you'll have{" "}
                  <strong className="text-white">14 days to undo</strong> before the space and its data are permanently deleted.
                </p>
              </div>
              <p className="text-white/30 text-[10.5px] font-bold uppercase tracking-wide mt-4 mb-1.5">type the space name to confirm</p>
              <input value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder={org.name} className={fieldInputCls} />
              <button
                onClick={confirmDeleteSpace}
                disabled={deleteSubmitting || deleteConfirmText.trim().toLowerCase() !== org.name.trim().toLowerCase()}
                className="w-full mt-4 text-[13px] font-bold bg-evolve-red text-white rounded-lg py-3 disabled:opacity-30"
              >
                {deleteSubmitting ? "deleting…" : "delete space"}
              </button>
              <button onClick={() => setDeleteSheetOpen(false)} className="w-full mt-2 text-xs font-semibold text-white/50 border border-white/15 rounded-lg py-2.5 hover:text-white">
                cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-xl flex items-center gap-2.5"
          style={{ background: "#232325", border: "1px solid rgba(255,255,255,0.16)", color: "#fff" }}
        >
          <span className="w-5 h-5 rounded-full bg-evolve-inchworm/15 text-evolve-inchworm flex items-center justify-center text-xs">✓</span>
          {toast}
        </div>
      )}
    </div>
  );
}
