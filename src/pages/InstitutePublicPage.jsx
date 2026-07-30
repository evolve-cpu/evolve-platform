import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../hooks/useAuth";
import GrowthMascot from "../components/GrowthMascot";
import OrgLogoBox from "../components/OrgLogoBox";
import InstituteInfoPanel from "../components/InstituteInfoPanel";
import InstituteSettingsPanel from "../components/InstituteSettingsPanel";
import {
  ROLE_META,
  EVOLVE_PROGRAMS,
  AVATAR_GRADIENTS,
  TYPE_META,
  initialsOf,
  timeAgo
} from "../lib/orgShared";

// This page used to be split in two: /institute/:slug (public, read-only)
// and /space/:slug (a separate admin-only console, TeamSpace.jsx). They're
// now one page — the public URL is the single source of truth, and it's
// editable inline for admins, the same way a GitHub repo page is both the
// thing you share and the thing you manage. Permission model:
//   - admins (owner or role === "admin"): can edit everything on this page
//   - faculty (non-admin): can only create a post (still goes to review)
//   - everyone else (students, logged-out visitors): read-only
//
// Two things shown in early design references aren't wired up here on
// purpose: an "affiliations / exchange network" list and configurable
// "more info" stat tiles — neither has a backing column on `organizations`
// yet, so instead of faking data, "more info" reuses the two real columns
// that already exist (year_founded, expected_members) and affiliations is
// left out entirely until there's a real field to edit.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PLATFORMS = ["instagram", "linkedin", "x / twitter", "facebook", "youtube"];

function parseCSV(raw) {
  const lines = raw.trim().split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const nameIdx = headers.indexOf("name");
  const emailIdx = headers.indexOf("email");
  return lines.slice(1).map((line) => {
    const vals = line.split(",").map((v) => v.trim());
    return {
      name: nameIdx >= 0 ? vals[nameIdx] || "" : "",
      email: emailIdx >= 0 ? (vals[emailIdx] || "").toLowerCase() : ""
    };
  });
}

const fieldInputCls =
  "w-full bg-white/[0.055] border border-white/10 focus:border-evolve-lavender-indigo/60 text-sm text-white placeholder-white/25 outline-none rounded-lg px-3 py-2.5 transition-colors";

function Field({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-white/30 text-[10.5px] font-bold uppercase tracking-wide">{label}</label>
      {children}
      {hint && <p className="text-white/25 text-[10.5px] text-right">{hint}</p>}
    </div>
  );
}

function EmptyBlock({ text, sub, cta, onCta, primary }) {
  return (
    <div className="flex flex-col items-center text-center gap-2.5 py-7 px-5 rounded-xl border border-dashed border-white/15 bg-white/[0.02]">
      <p className="text-white/50 text-xs font-bold">{text}</p>
      {sub && <p className="text-white/25 text-[11px] max-w-xs">{sub}</p>}
      {cta && (
        <button
          onClick={onCta}
          className={`mt-1 text-xs font-bold rounded-lg px-4 py-2 transition-colors ${
            primary ? "bg-evolve-lavender-indigo text-white" : "border border-white/15 text-white/60 hover:text-white"
          }`}
        >
          {cta}
        </button>
      )}
    </div>
  );
}

function EventRow({ ev, muted }) {
  const d = new Date(`${ev.event_date}T00:00:00`);
  const day = String(d.getDate()).padStart(2, "0");
  const mon = d.toLocaleString("en-US", { month: "short" }).toLowerCase();
  const tm = TYPE_META[ev.type];
  return (
    <div className={`flex items-start gap-2.5 py-3 ${muted ? "opacity-60" : ""}`}>
      <div className="w-10 min-w-10 rounded-lg border border-white/10 bg-white/[0.03] flex flex-col items-center justify-center py-1.5 flex-shrink-0">
        <p className="text-white font-extrabold text-[13px] leading-none">{day}</p>
        <p className="text-white/30 text-[8px] font-bold uppercase mt-0.5">{mon}</p>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full ${tm.bg} ${tm.text}`}>{tm.label}</span>
          <span className="text-white text-xs font-bold">{ev.title}</span>
          {ev.audience === "open" && (
            <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-evolve-bright-turquoise/15 text-evolve-bright-turquoise">open to all</span>
          )}
          {ev.audience === "internal" && (
            <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-white/10 text-white/40">team only</span>
          )}
        </div>
        {ev.meta && <p className="text-white/25 text-[10.5px] mt-0.5">{ev.meta}</p>}
      </div>
    </div>
  );
}

// hand-drawn header art for the ongoing-programs cards, instead of a plain
// emoji-on-color block — a stack of report pages + a review "eye" for
// portfolio review, a dotted path to a flag for find your niche.
function ProgramArt({ id }) {
  if (id === "portfolio-review") {
    return (
      <svg viewBox="0 0 300 130" preserveAspectRatio="xMidYMid slice" className="w-full h-full block">
        <rect width="300" height="130" fill="#1a1030" />
        <circle cx="240" cy="20" r="70" fill="#A35BFB" opacity=".25" />
        <circle cx="240" cy="20" r="45" fill="#A35BFB" opacity=".35" />
        <rect x="40" y="30" width="70" height="90" rx="6" fill="#2a1d4a" />
        <rect x="52" y="44" width="46" height="5" rx="2.5" fill="#A35BFB" />
        <rect x="52" y="56" width="34" height="4" rx="2" fill="#5a4680" />
        <rect x="52" y="65" width="40" height="4" rx="2" fill="#5a4680" />
        <rect x="52" y="74" width="28" height="4" rx="2" fill="#5a4680" />
        <rect x="60" y="20" width="70" height="90" rx="6" fill="#332258" opacity=".9" />
        <rect x="72" y="34" width="46" height="5" rx="2.5" fill="#C264FF" />
        <rect x="72" y="46" width="34" height="4" rx="2" fill="#6a5490" />
        <rect x="72" y="55" width="40" height="4" rx="2" fill="#6a5490" />
        <ellipse cx="215" cy="80" rx="42" ry="24" fill="#FFD007" />
        <circle cx="215" cy="80" r="14" fill="#131313" />
        <circle cx="220" cy="76" r="5" fill="#FFD007" />
        <path d="M173 80 Q215 46 257 80" fill="none" stroke="#DF0586" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 300 130" preserveAspectRatio="xMidYMid slice" className="w-full h-full block">
      <rect width="300" height="130" fill="#0f1f14" />
      <circle cx="50" cy="115" r="70" fill="#C2FD5C" opacity=".18" />
      <path d="M20 110 Q90 100 120 70 T230 40 L272 28" fill="none" stroke="#C2FD5C" strokeWidth="5" strokeLinecap="round" strokeDasharray="1 14" />
      <circle cx="60" cy="103" r="9" fill="#1d3a26" />
      <circle cx="60" cy="103" r="4" fill="#C2FD5C" />
      <circle cx="135" cy="62" r="9" fill="#1d3a26" />
      <circle cx="135" cy="62" r="4" fill="#01F1D9" />
      <circle cx="210" cy="42" r="9" fill="#1d3a26" />
      <circle cx="210" cy="42" r="4" fill="#FFD007" />
      <line x1="268" y1="28" x2="268" y2="72" stroke="#C2FD5C" strokeWidth="4" strokeLinecap="round" />
      <path d="M268 28 L296 38 L268 48 Z" fill="#DF0586" />
      <path d="M40 30 l4 8 9 1-6.5 6 1.5 9-8-4.5-8 4.5 1.5-9-6.5-6 9-1z" fill="#FFD007" opacity=".9" />
    </svg>
  );
}

// the institute-info panel — the desktop sidebar and the mobile "space
// info" sheet show identical content, just inside different containers
const EDIT_PANELS = [
  {
    id: "basics",
    label: "basics",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9 21v-4h6v4M9 8h.01M9 12h.01M15 8h.01M15 12h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: "description",
    label: "description",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <line x1="4" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="4" y1="12" x2="15" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="4" y1="18" x2="18" y2="18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: "links",
    label: "links",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <path d="M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-1.5 1.5M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l1.5-1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: "awards",
    label: "awards",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="6" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8.5 13.5L7 22l5-3 5 3-1.5-8.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    id: "more",
    label: "more info",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <line x1="6" y1="20" x2="6" y2="11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="12" y1="20" x2="12" y2="4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="18" y1="20" x2="18" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  }
];

export default function InstitutePublicPage() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [org, setOrg] = useState(null);
  const [members, setMembers] = useState([]); // active only — safe to load for anyone
  const [allMembers, setAllMembers] = useState([]); // admin-only: all statuses, for team management
  const [allMembersLoaded, setAllMembersLoaded] = useState(false);
  const [updates, setUpdates] = useState([]); // live only — safe to load for anyone
  const [pendingUpdates, setPendingUpdates] = useState([]); // admin-only
  const [pendingLoaded, setPendingLoaded] = useState(false);
  const [events, setEvents] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [toast, setToast] = useState(null);
  const [welcomeBannerDismissed, setWelcomeBannerDismissed] = useState(false);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileInfoOpen, setMobileInfoOpen] = useState(false);
  const [tab, setTab] = useState(location.state?.openTab || "feed");
  const [teamRoleFilter, setTeamRoleFilter] = useState("all");
  const [teamSearch, setTeamSearch] = useState("");
  const [inviteDdOpen, setInviteDdOpen] = useState(false);
  const [feedView, setFeedView] = useState("posts"); // posts | pending (admin only)
  const [showPastEvents, setShowPastEvents] = useState(false);

  const [postModalOpen, setPostModalOpen] = useState(false);
  const [editingUpdateId, setEditingUpdateId] = useState(null);
  const [shareTitle, setShareTitle] = useState("");
  const [shareDesc, setShareDesc] = useState("");
  const [shareSourceUrl, setShareSourceUrl] = useState("");
  const [shareImageFile, setShareImageFile] = useState(null);
  const [shareImagePreview, setShareImagePreview] = useState(null);
  const [shareExistingImageUrl, setShareExistingImageUrl] = useState(null);
  const [shareSubmitting, setShareSubmitting] = useState(false);
  const [postMenuOpenId, setPostMenuOpenId] = useState(null);

  // testimonials — admins bulk-manage every quote; any non-admin member can
  // add their own (add-only, matching org_testimonials' RLS)
  const [testimonialsModalOpen, setTestimonialsModalOpen] = useState(false);
  const [testimonialDraft, setTestimonialDraft] = useState([]);
  const [testimonialDeletedIds, setTestimonialDeletedIds] = useState([]);
  const [testimonialSaving, setTestimonialSaving] = useState(false);
  const [testimonialSearchKey, setTestimonialSearchKey] = useState(null);
  const [testimonialSearchQuery, setTestimonialSearchQuery] = useState("");
  const [testimonialSearchResults, setTestimonialSearchResults] = useState([]);
  const [testimonialSearching, setTestimonialSearching] = useState(false);

  // edit institute info (admin only) — a two-pane modal: name/location/
  // description/links/awards/more-info, all saved together in one go.
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editModalPanel, setEditModalPanel] = useState("basics");
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [orgLocation, setOrgLocation] = useState("");
  const [aboutShort, setAboutShort] = useState("");
  const [bio, setBio] = useState("");
  const [links, setLinks] = useState([]);
  const [awards, setAwards] = useState([]);
  const [yearFounded, setYearFounded] = useState("");
  const [expectedMembers, setExpectedMembers] = useState("");
  const [bannerSaving, setBannerSaving] = useState(false);

  // "what we do" (company spaces only)
  const [programmeEditOpen, setProgrammeEditOpen] = useState(false);
  const [programmeDraft, setProgrammeDraft] = useState("");
  const [programmeSaving, setProgrammeSaving] = useState(false);

  // "request a program" (institute admins)
  const [programModalOpen, setProgramModalOpen] = useState(false);
  const [reqMessage, setReqMessage] = useState("");
  const [reqBatchSize, setReqBatchSize] = useState("");
  const [reqTimeline, setReqTimeline] = useState("");
  const [reqSubmitting, setReqSubmitting] = useState(false);

  // team management (institute admins): add one / csv / find on evolve
  const [teamModalOpen, setTeamModalOpen] = useState(null); // null | "one" | "csv" | "find"
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [csvPhase, setCsvPhase] = useState("upload");
  const [csvFileName, setCsvFileName] = useState("");
  const [csvRows, setCsvRows] = useState([]);
  const [csvSubmitting, setCsvSubmitting] = useState(false);
  const [findQuery, setFindQuery] = useState("");
  const [findResults, setFindResults] = useState([]);
  const [findSelected, setFindSelected] = useState(new Set());
  const [findSearching, setFindSearching] = useState(false);
  const [findSubmitting, setFindSubmitting] = useState(false);

  // simple single-email invite (company spaces only)
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteSent, setInviteSent] = useState("");
  const [inviteError, setInviteError] = useState("");

  // edit calendar (admin only) — one modal, every event inline-editable at
  // once, saved together (mirrors the two-pane "edit institute info" modal)
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [calendarDraft, setCalendarDraft] = useState([]);
  const [calendarDeletedIds, setCalendarDeletedIds] = useState([]);
  const [calendarSaving, setCalendarSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setNotFound(false);

    const { data: orgData } = await supabase
      .from("organizations")
      .select("*")
      .eq("slug", slug)
      .is("deleted_at", null)
      .maybeSingle();
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

  // the "your space is live" / "you're in" banner is only useful for the
  // first few seconds after landing — fade it out on its own so it doesn't
  // permanently squat at the top of the page, but still let people close it
  // early if they don't want to wait.
  useEffect(() => {
    if (!(location.state?.justCreated || location.state?.justJoined)) return;
    const t = setTimeout(() => setWelcomeBannerDismissed(true), 6000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isOwner = !!(org && user && org.owner_id === user.id);

  // settings is owner-only — bounce anyone else back to the feed (covers a
  // direct link to the old /settings route, and ownership changing out from
  // under someone mid-session via a transfer elsewhere)
  useEffect(() => {
    if (tab === "settings" && org && !isOwner) setTab("feed");
  }, [tab, org, isOwner]);
  const myMembership = members.find((m) => m.user_id === user?.id);
  const isAdmin = isOwner || myMembership?.role === "admin";
  const isFacultyOnly = !isAdmin && myMembership?.member_type === "faculty";
  const canSubmitUpdate = isAdmin || isFacultyOnly;
  const canAddTestimonial = !isAdmin && !!myMembership;
  const isInstitute = org?.org_type === "institute";

  // admin-only data — only fetched once we know the viewer can actually use
  // it, so pending invites/posts never reach a non-admin client.
  const loadAdminTeam = useCallback(async () => {
    if (!org) return;
    const { data } = await supabase
      .from("organization_members")
      .select("*, profiles:user_id(name, avatar_url)")
      .eq("org_id", org.id);
    setAllMembers(data || []);
    setAllMembersLoaded(true);
  }, [org]);

  const loadPending = useCallback(async () => {
    if (!org) return;
    const { data } = await supabase
      .from("org_updates")
      .select("*, profiles:author_id(name, avatar_url)")
      .eq("org_id", org.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    setPendingUpdates(data || []);
    setPendingLoaded(true);
  }, [org]);

  useEffect(() => {
    if (isAdmin && org) loadAdminTeam();
    if ((isAdmin || isFacultyOnly) && org) loadPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, isFacultyOnly, org?.id]);

  // keep the feed live — anyone with this space open sees a new post,
  // edit, approval, or removal appear automatically instead of needing to
  // reload the page.
  useEffect(() => {
    if (!org?.id) return;
    const channel = supabase
      .channel(`org_updates:${org.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "org_updates", filter: `org_id=eq.${org.id}` },
        () => {
          load();
          if (isAdmin || isFacultyOnly) loadPending();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [org?.id, isAdmin, isFacultyOnly]);

  // seed editable drafts from the org row once per org load
  useEffect(() => {
    if (!org) return;
    setName(org.name || "");
    setWebsite(org.website || "");
    setOrgLocation(org.location || "");
    setAboutShort(org.about_short || "");
    setBio(org.bio || "");
    setLinks(org.social_links || []);
    setAwards(org.awards || []);
    setYearFounded(org.year_founded || "");
    setExpectedMembers(org.expected_members || "");
    setProgrammeDraft(org.programme_details || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [org?.id]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }

  /* ── edit institute info (name / location / about / links / awards) ──── */

  function openEditModal() {
    setName(org.name || "");
    setWebsite(org.website || "");
    setOrgLocation(org.location || "");
    setAboutShort(org.about_short || "");
    setBio(org.bio || "");
    setLinks(org.social_links || []);
    setAwards(org.awards || []);
    setYearFounded(org.year_founded || "");
    setExpectedMembers(org.expected_members || "");
    setEditModalPanel("basics");
    setEditModalOpen(true);
  }

  async function saveBanner() {
    setBannerSaving(true);
    const patch = {
      name,
      website,
      location: orgLocation,
      about_short: aboutShort,
      bio,
      social_links: links,
      awards,
      year_founded: yearFounded || null,
      expected_members: expectedMembers ? Number(expectedMembers) : null
    };
    const { error: err } = await supabase.from("organizations").update(patch).eq("id", org.id);
    setBannerSaving(false);
    if (err) return showToast("couldn't save — try again");
    setOrg((o) => ({ ...o, ...patch }));
    setEditModalOpen(false);
    showToast("saved");
  }

  function addLinkRow() {
    setLinks((l) => [...l, { platform: PLATFORMS[0], url: "" }]);
  }
  function updateLinkRow(i, patch) {
    setLinks((l) => l.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  }
  function removeLinkRow(i) {
    setLinks((l) => l.filter((_, idx) => idx !== i));
  }
  function addAwardRow() {
    setAwards((a) => [...a, { title: "", issuer: "" }]);
  }
  function updateAwardRow(i, patch) {
    setAwards((a) => a.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  }
  function removeAwardRow(i) {
    setAwards((a) => a.filter((_, idx) => idx !== i));
  }

  async function saveProgramme() {
    setProgrammeSaving(true);
    const { error: err } = await supabase
      .from("organizations")
      .update({ programme_details: programmeDraft })
      .eq("id", org.id);
    setProgrammeSaving(false);
    if (err) return showToast("couldn't save — try again");
    setOrg((o) => ({ ...o, programme_details: programmeDraft }));
    setProgrammeEditOpen(false);
    showToast("saved");
  }

  /* ── highlights feed ───────────────────────────────────────────────── */

  function openPostModal(updateToEdit) {
    setEditingUpdateId(updateToEdit?.id || null);
    setShareTitle(updateToEdit?.title || "");
    setShareDesc(updateToEdit?.description || "");
    setShareSourceUrl(updateToEdit?.source_url || "");
    clearShareImage();
    setShareExistingImageUrl(updateToEdit?.image_url || null);
    setPostModalOpen(true);
  }

  function pickShareImage(file) {
    if (!file || !file.type.startsWith("image/")) return;
    clearShareImage();
    setShareImageFile(file);
    setShareImagePreview(URL.createObjectURL(file));
  }
  function clearShareImage() {
    if (shareImagePreview) URL.revokeObjectURL(shareImagePreview);
    setShareImageFile(null);
    setShareImagePreview(null);
    setShareExistingImageUrl(null);
  }

  async function submitShareUpdate() {
    if (!shareTitle.trim() || !user) return;
    setShareSubmitting(true);

    const trimmedSource = shareSourceUrl.trim();
    const sourceUrl = trimmedSource ? (/^https?:\/\//i.test(trimmedSource) ? trimmedSource : `https://${trimmedSource}`) : null;

    let imageUrl = shareExistingImageUrl;
    if (shareImageFile) {
      const path = `${org.id}/${crypto.randomUUID()}-${shareImageFile.name}`;
      const { error: upErr } = await supabase.storage.from("org-update-images").upload(path, shareImageFile);
      if (upErr) {
        setShareSubmitting(false);
        showToast("couldn't upload that image — try again");
        return;
      }
      imageUrl = supabase.storage.from("org-update-images").getPublicUrl(path).data.publicUrl;
    }

    const { error: saveErr } = editingUpdateId
      ? await supabase
          .from("org_updates")
          .update({
            title: shareTitle.trim(),
            description: shareDesc.trim() || null,
            image_url: imageUrl,
            source_url: sourceUrl
          })
          .eq("id", editingUpdateId)
      : await supabase.from("org_updates").insert({
          org_id: org.id,
          author_id: user.id,
          title: shareTitle.trim(),
          description: shareDesc.trim() || null,
          image_url: imageUrl,
          source_url: sourceUrl,
          status: isAdmin ? "live" : "pending",
          published_at: isAdmin ? new Date().toISOString() : null
        });
    setShareSubmitting(false);
    if (saveErr) {
      showToast(editingUpdateId ? "couldn't save changes — try again" : "couldn't share that — try again");
      return;
    }
    const wasEditing = !!editingUpdateId;
    setPostModalOpen(false);
    setEditingUpdateId(null);
    setShareTitle("");
    setShareDesc("");
    setShareSourceUrl("");
    clearShareImage();
    load();
    if (isAdmin) loadPending();
    showToast(wasEditing ? "post updated" : isAdmin ? "posted to the public feed" : "submitted for review");
  }

  async function approveUpdate(id) {
    const { error: err } = await supabase
      .from("org_updates")
      .update({ status: "live", published_at: new Date().toISOString() })
      .eq("id", id);
    if (err) return showToast("couldn't publish — try again");
    load();
    loadPending();
    showToast("post published to your public feed");
  }

  async function removeUpdate(id, wasLive) {
    const { error: err } = await supabase.from("org_updates").delete().eq("id", id);
    if (err) return showToast("couldn't remove — try again");
    load();
    loadPending();
    showToast(wasLive ? "removed from public feed" : "post removed");
  }

  /* ── testimonials — admins bulk-manage, other members add their own ── */

  function openTestimonialsModal() {
    if (isAdmin) {
      setTestimonialDraft(
        testimonials.map((t) => ({
          _key: t.id,
          id: t.id,
          user_id: t.user_id || null,
          name: t.name,
          avatar_url: t.avatar_url || null,
          role: t.role || "",
          quote: t.quote
        }))
      );
    } else {
      setTestimonialDraft([
        { _key: "self", id: null, user_id: user.id, name: user.name, avatar_url: user.avatar_url || null, role: "", quote: "" }
      ]);
    }
    setTestimonialDeletedIds([]);
    setTestimonialSearchKey(null);
    setTestimonialSearchQuery("");
    setTestimonialSearchResults([]);
    setTestimonialsModalOpen(true);
  }
  function addTestimonialDraftRow() {
    setTestimonialDraft((rows) => [
      { _key: `new-${Date.now()}-${Math.random()}`, id: null, user_id: null, name: "", avatar_url: null, role: "", quote: "" },
      ...rows
    ]);
  }
  function updateTestimonialDraftRow(key, patch) {
    setTestimonialDraft((rows) => rows.map((r) => (r._key === key ? { ...r, ...patch } : r)));
  }
  function removeTestimonialDraftRow(key, id) {
    if (id) setTestimonialDeletedIds((ids) => [...ids, id]);
    setTestimonialDraft((rows) => rows.filter((r) => r._key !== key));
  }
  function pickTestimonialPerson(key, p) {
    updateTestimonialDraftRow(key, { user_id: p.id, name: p.name, avatar_url: p.avatar_url || null });
    setTestimonialSearchKey(null);
    setTestimonialSearchQuery("");
    setTestimonialSearchResults([]);
  }

  useEffect(() => {
    if (!testimonialSearchKey || !testimonialSearchQuery.trim()) {
      setTestimonialSearchResults([]);
      return;
    }
    let cancelled = false;
    setTestimonialSearching(true);
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from("profile_cards")
        .select("id, username, name, avatar_url")
        .ilike("name", `%${testimonialSearchQuery.trim()}%`)
        .limit(6);
      if (cancelled) return;
      setTestimonialSearchResults(data || []);
      setTestimonialSearching(false);
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [testimonialSearchQuery, testimonialSearchKey]);

  async function saveTestimonials() {
    setTestimonialSaving(true);
    const validRows = testimonialDraft.filter((r) => r.name.trim() && r.quote.trim());

    const toInsert = validRows
      .filter((r) => !r.id)
      .map((r) => ({
        org_id: org.id,
        user_id: r.user_id || null,
        name: r.name.trim(),
        avatar_url: r.avatar_url || null,
        role: r.role.trim() || null,
        quote: r.quote.trim()
      }));
    const toUpdate = isAdmin ? validRows.filter((r) => r.id) : [];

    const ops = [];
    if (toInsert.length) ops.push(supabase.from("org_testimonials").insert(toInsert));
    for (const r of toUpdate) {
      ops.push(
        supabase
          .from("org_testimonials")
          .update({ user_id: r.user_id || null, name: r.name.trim(), avatar_url: r.avatar_url || null, role: r.role.trim() || null, quote: r.quote.trim() })
          .eq("id", r.id)
      );
    }
    if (isAdmin && testimonialDeletedIds.length) ops.push(supabase.from("org_testimonials").delete().in("id", testimonialDeletedIds));

    const results = ops.length ? await Promise.all(ops) : [];
    setTestimonialSaving(false);
    if (results.some((r) => r.error)) {
      showToast("some changes couldn't be saved — try again");
      return;
    }
    setTestimonialsModalOpen(false);
    load();
    showToast(isAdmin ? "testimonials updated" : "thanks — your testimonial was added");
  }

  /* ── calendar — admin ─────────────────────────────────────────────── */

  function blankCalendarDraft() {
    return {
      _key: `new-${Date.now()}-${Math.random()}`,
      id: null,
      title: "",
      event_date: new Date().toISOString().slice(0, 10),
      end_date: null,
      is_multi_day: false,
      format: "offline",
      description: "",
      meta: "",
      type: "event",
      audience: "none"
    };
  }

  function openCalendarModal() {
    setCalendarDraft(
      events.map((ev) => ({
        _key: ev.id,
        id: ev.id,
        title: ev.title,
        event_date: ev.event_date,
        end_date: ev.end_date || null,
        is_multi_day: !!ev.is_multi_day,
        format: ev.format || "offline",
        description: ev.description || "",
        meta: ev.meta || "",
        type: ev.type,
        audience: ev.audience || "none"
      }))
    );
    setCalendarDeletedIds([]);
    setCalendarModalOpen(true);
  }
  function addCalendarDraftRow() {
    setCalendarDraft((rows) => [blankCalendarDraft(), ...rows]);
  }
  function updateCalendarDraftRow(key, patch) {
    setCalendarDraft((rows) => rows.map((r) => (r._key === key ? { ...r, ...patch } : r)));
  }
  function removeCalendarDraftRow(key, id) {
    if (id) setCalendarDeletedIds((ids) => [...ids, id]);
    setCalendarDraft((rows) => rows.filter((r) => r._key !== key));
  }

  async function saveCalendarChanges() {
    setCalendarSaving(true);
    const validRows = calendarDraft.filter((r) => r.title.trim() && r.event_date);

    const toInsert = validRows
      .filter((r) => !r.id)
      .map((r) => ({
        org_id: org.id,
        title: r.title.trim(),
        event_date: r.event_date,
        end_date: r.is_multi_day ? r.end_date || null : null,
        is_multi_day: r.is_multi_day,
        format: r.format,
        description: r.description.trim() || null,
        meta: r.meta.trim() || null,
        type: r.type,
        audience: r.audience
      }));
    const toUpdate = validRows.filter((r) => r.id);

    const ops = [];
    if (toInsert.length) ops.push(supabase.from("org_events").insert(toInsert));
    for (const r of toUpdate) {
      ops.push(
        supabase
          .from("org_events")
          .update({
            title: r.title.trim(),
            event_date: r.event_date,
            end_date: r.is_multi_day ? r.end_date || null : null,
            is_multi_day: r.is_multi_day,
            format: r.format,
            description: r.description.trim() || null,
            meta: r.meta.trim() || null,
            type: r.type,
            audience: r.audience
          })
          .eq("id", r.id)
      );
    }
    if (calendarDeletedIds.length) ops.push(supabase.from("org_events").delete().in("id", calendarDeletedIds));

    const results = await Promise.all(ops);
    setCalendarSaving(false);
    if (results.some((r) => r.error)) {
      showToast("some changes couldn't be saved — try again");
      return;
    }
    setCalendarModalOpen(false);
    load();
    showToast("calendar updated");
  }

  /* ── team management (institute admins) ───────────────────────────── */

  const existingEmails = new Set(allMembers.map((m) => m.invited_email?.toLowerCase()).filter(Boolean));
  const existingUserIds = new Set(allMembers.map((m) => m.user_id).filter(Boolean));

  function openTeamModal(type) {
    setInviteDdOpen(false);
    setTeamModalOpen(type);
    if (type === "one") {
      setAddName("");
      setAddEmail("");
    } else if (type === "csv") {
      setCsvPhase("upload");
      setCsvFileName("");
      setCsvRows([]);
    } else if (type === "find") {
      setFindQuery("");
      setFindResults([]);
      setFindSelected(new Set());
    }
  }
  function closeTeamModal() {
    setTeamModalOpen(null);
  }

  async function sendInviteEmail(email, role, token) {
    try {
      await fetch("/api/send-org-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          orgName: org.name,
          orgLogoUrl: org.logo_url,
          role,
          inviterName: user.name,
          inviteLink: `${window.location.origin}/invite/${token}`
        })
      });
    } catch {
      // best-effort — the invite row exists either way, they can be resent later
    }
  }

  async function submitAddOne(keepOpen) {
    const email = addEmail.trim().toLowerCase();
    if (!email || !EMAIL_RE.test(email)) return;
    setAddSubmitting(true);
    const memberRole = teamRoleFilter === "admin" ? "admin" : "member";

    const { data: inserted, error: insErr } = await supabase
      .from("organization_members")
      .insert({
        org_id: org.id,
        invited_name: addName.trim() || null,
        invited_email: email,
        invited_by: user.id,
        role: memberRole,
        member_type: teamRoleFilter,
        status: "pending"
      })
      .select("invite_token")
      .single();

    setAddSubmitting(false);
    if (insErr || !inserted) {
      showToast("couldn't add them — they may already be in this space");
      return;
    }

    await sendInviteEmail(email, teamRoleFilter, inserted.invite_token);
    load();
    loadAdminTeam();
    showToast(`invite sent to ${email}`);
    if (keepOpen) {
      setAddName("");
      setAddEmail("");
    } else {
      closeTeamModal();
    }
  }

  function handleCsvFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const parsed = parseCSV(ev.target.result);
      const seen = new Set();
      const rows = parsed.map((row) => {
        const email = row.email.toLowerCase();
        const duplicateInFile = seen.has(email);
        seen.add(email);
        return { name: row.name, email, alreadyMember: existingEmails.has(email), duplicateInFile, skipped: false };
      });
      setCsvRows(rows);
      setCsvPhase("review");
    };
    reader.readAsText(file);
    e.target.value = "";
  }
  function updateCsvRow(i, patch) {
    setCsvRows((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function skipCsvRow(i) {
    updateCsvRow(i, { skipped: true });
  }

  const csvReadyRows = csvRows.filter((r) => !r.skipped && !r.alreadyMember && !r.duplicateInFile && EMAIL_RE.test(r.email));
  const csvErrorRows = csvRows
    .map((r, i) => ({ ...r, i }))
    .filter((r) => !r.skipped && (r.alreadyMember || r.duplicateInFile || !EMAIL_RE.test(r.email)));

  async function submitCsv() {
    if (!csvReadyRows.length) return;
    setCsvSubmitting(true);
    const memberRole = teamRoleFilter === "admin" ? "admin" : "member";
    const payload = csvReadyRows.map((r) => ({
      org_id: org.id,
      invited_name: r.name || null,
      invited_email: r.email,
      invited_by: user.id,
      role: memberRole,
      member_type: teamRoleFilter,
      status: "pending"
    }));

    const { data: inserted, error: insErr } = await supabase
      .from("organization_members")
      .insert(payload)
      .select("invite_token, invited_email");

    if (insErr || !inserted) {
      setCsvSubmitting(false);
      showToast("couldn't import that file — try again");
      return;
    }

    await Promise.allSettled(inserted.map((row) => sendInviteEmail(row.invited_email, teamRoleFilter, row.invite_token)));

    setCsvSubmitting(false);
    closeTeamModal();
    load();
    loadAdminTeam();
    showToast(`invites sent to ${inserted.length} people`);
  }

  useEffect(() => {
    if (teamModalOpen !== "find" || !findQuery.trim()) {
      setFindResults([]);
      return;
    }
    let cancelled = false;
    setFindSearching(true);
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from("profile_cards")
        .select("id, username, name, avatar_url, persona, level")
        .ilike("name", `%${findQuery.trim()}%`)
        .limit(8);
      if (cancelled) return;
      const filtered = (data || []).filter((p) => p.id !== org.owner_id && !existingUserIds.has(p.id));
      setFindResults(filtered);
      setFindSearching(false);
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [findQuery, teamModalOpen]);

  function toggleFindSelect(id) {
    setFindSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function submitFind() {
    const selected = findResults.filter((p) => findSelected.has(p.id));
    if (!selected.length) return;
    setFindSubmitting(true);
    const memberRole = teamRoleFilter === "admin" ? "admin" : "member";
    const payload = selected.map((p) => ({
      org_id: org.id,
      user_id: p.id,
      invited_by: user.id,
      role: memberRole,
      member_type: teamRoleFilter,
      status: "pending"
    }));

    const { error: insErr } = await supabase.from("organization_members").insert(payload);
    setFindSubmitting(false);
    if (insErr) {
      showToast("couldn't add them — try again");
      return;
    }
    closeTeamModal();
    load();
    loadAdminTeam();
    showToast(`added ${selected.length} ${selected.length === 1 ? "person" : "people"} — they'll see it to accept`);
  }

  function removeMember(id) {
    supabase
      .from("organization_members")
      .delete()
      .eq("id", id)
      .then(({ error: delErr }) => {
        if (delErr) return showToast("couldn't remove them — try again");
        load();
        loadAdminTeam();
      });
  }

  async function handleSimpleInvite() {
    const email = inviteEmail.trim().toLowerCase();
    if (!email || !org) return;
    setInviting(true);
    setInviteError("");
    setInviteSent("");

    const { data: inserted, error: err } = await supabase
      .from("organization_members")
      .insert({ org_id: org.id, invited_email: email, invited_by: user.id, role: "member", status: "pending" })
      .select("invite_token")
      .single();

    if (err || !inserted) {
      setInviting(false);
      setInviteError("couldn't send that invite — they may already be a member.");
      return;
    }

    await sendInviteEmail(email, "member", inserted.invite_token);
    setInviting(false);
    setInviteEmail("");
    setInviteSent(`invite sent to ${email}`);
    load();
  }

  /* ── request a program (institute admins) ─────────────────────────── */

  async function submitProgramRequest() {
    if (!reqMessage.trim()) return;
    setReqSubmitting(true);
    try {
      const res = await fetch("/api/request-program", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgName: org.name,
          requesterName: user.name,
          requesterEmail: user.email,
          message: reqMessage.trim(),
          batchSize: reqBatchSize.trim(),
          timeline: reqTimeline.trim()
        })
      });
      if (!res.ok) throw new Error();
      setProgramModalOpen(false);
      setReqMessage("");
      setReqBatchSize("");
      setReqTimeline("");
      showToast("request sent — we'll get back within 2 working days");
    } catch {
      showToast("couldn't send that — try again");
    } finally {
      setReqSubmitting(false);
    }
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-6" style={{ backgroundColor: "#131313" }}>
        <p className="text-white font-bold text-xl">this page isn't available.</p>
        <p className="text-white/40 text-sm max-w-sm">"{slug}" may not exist, or the owner has kept this space private.</p>
        <Link to="/" className="text-evolve-lavender-indigo text-sm font-semibold mt-2">
          back to evolve
        </Link>
      </div>
    );
  }

  const TABS = [
    { id: "feed", label: "feed" },
    // calendar lives inside the feed tab's sidebar on desktop already — this
    // tab only exists so mobile (where that sidebar column stacks below a
    // potentially long post list) has a direct way to jump to it, so it's
    // hidden on desktop via mobileOnly.
    { id: "calendar", label: "calendar", mobileOnly: true },
    ...(isInstitute || org.org_type === "company"
      ? [{ id: "programs", label: isInstitute ? "ongoing programs" : "programs" }]
      : []),
    { id: "team", label: "team", count: members.length }
  ];

  const teamRoles = isInstitute ? ["all", "admin", "faculty", "student"] : ["all", "admin", "member"];
  const teamSource = isAdmin && allMembersLoaded ? allMembers : members;
  const filteredMembers = teamSource.filter((m) => {
    if (teamRoleFilter !== "all") {
      const roleOk =
        teamRoleFilter === "admin" ? m.role === "owner" || m.role === "admin" : isInstitute ? m.member_type === teamRoleFilter : m.role === "member";
      if (!roleOk) return false;
    }
    if (isAdmin && teamSearch.trim()) {
      const q = teamSearch.trim().toLowerCase();
      const hay = `${m.profiles?.name || m.invited_name || ""} ${m.invited_email || ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  // when a role tab is genuinely empty, the empty-state cards below already
  // offer add-one/csv/find-on-evolve up front — a search bar and a second
  // "+ invite" entry point above them would have nothing to search and
  // would just duplicate those same three options
  const teamEmptyStateShowing = isInstitute && isAdmin && teamRoleFilter !== "all" && filteredMembers.length <= 1;

  const todayStr = new Date().toISOString().slice(0, 10);
  const upcomingEvents = events.filter((e) => e.event_date >= todayStr);
  const pastEvents = events.filter((e) => e.event_date < todayStr);

  const sidebarStats = [
    { num: org.year_founded || "—", label: "est. year" },
    { num: org.expected_members || members.length, label: isInstitute ? "faculty & students" : "team size" },
    { num: updates.length, label: "highlights posted" }
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#131313" }}>
      {/* global topbar */}
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
          {isOwner && (
            <button
              onClick={() => setTab("settings")}
              title="space settings"
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] flex-shrink-0 transition-colors"
            >
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
            </button>
          )}
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

      {(location.state?.justCreated || location.state?.justJoined) && !welcomeBannerDismissed && (
        <div className="px-5 md:px-6 pt-4">
          <div className="rounded-xl bg-evolve-inchworm/10 border border-evolve-inchworm/25 text-evolve-inchworm text-xs font-bold px-4 py-3 flex items-center gap-3">
            <span className="flex-1">
              {location.state?.justCreated
                ? "🎉 your space is live — here's how it looks. admins can edit anything on this page anytime."
                : `🎉 you're in — welcome to ${org.name}.`}
            </span>
            <button
              onClick={() => setWelcomeBannerDismissed(true)}
              title="dismiss"
              className="text-evolve-inchworm/70 hover:text-evolve-inchworm w-5 h-5 flex items-center justify-center flex-shrink-0"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        {/* institute info sidebar — desktop only, collapsible */}
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
                <InstituteInfoPanel org={org} isAdmin={isAdmin} sidebarStats={sidebarStats} onEditInfo={openEditModal} />
              </div>
            )}
          </div>
        </aside>

        {/* main column */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* mobile-only compact institute header (sidebar is desktop-only) */}
          <div className="md:hidden flex items-center gap-3 px-5 py-4 border-b border-white/10">
            <OrgLogoBox org={org} size={40} rounded="rounded-xl" />
            <div className="min-w-0 flex items-center gap-1.5">
              <div className="min-w-0">
                <p className="text-white font-extrabold text-sm truncate">{org.name}</p>
                {org.location && <p className="text-white/30 text-[10.5px] truncate">{org.location}</p>}
              </div>
              <button onClick={() => setMobileInfoOpen(true)} title="space info" className="w-6 h-6 min-w-6 rounded-md text-white/40 hover:text-white flex items-center justify-center flex-shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* tabs */}
          <div className="sticky z-40 border-b border-white/10" style={{ top: 52, background: "rgba(19,19,19,.97)", backdropFilter: "blur(14px)" }}>
            <div className="max-w-[1080px] mx-auto flex gap-1 px-5 md:px-8 overflow-x-auto">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-1 py-3.5 mr-6 text-[13px] font-semibold border-b-2 transition-colors flex items-center gap-1.5 flex-shrink-0 ${
                    t.mobileOnly ? "md:hidden" : ""
                  } ${tab === t.id ? "text-white border-evolve-lavender-indigo" : "text-white/40 border-transparent hover:text-white/70"}`}
                >
                  {t.label}
                  {t.count != null && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === t.id ? "bg-evolve-lavender-indigo/25 text-evolve-lavender-indigo" : "bg-white/[0.06] text-white/40"}`}>
                      {t.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="max-w-[1080px] mx-auto w-full px-5 md:px-8 py-6 pb-24">
            {/* ============ feed ============ */}
            {tab === "feed" && (
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">
                <div className="flex flex-col gap-4">
                  {(isAdmin || isFacultyOnly) && (
                    <div className="inline-flex bg-white/[0.04] border border-white/10 rounded-xl p-1 gap-1 w-fit">
                      {[
                        { id: "posts", label: "posts", count: updates.length },
                        { id: "pending", label: "pending review", count: pendingUpdates.length }
                      ].map((v) => (
                        <button
                          key={v.id}
                          onClick={() => setFeedView(v.id)}
                          className={`flex items-center gap-2 text-[13px] font-bold px-4 py-2.5 rounded-lg transition-colors ${
                            feedView === v.id ? "bg-white/[0.08] text-white" : "text-white/40 hover:text-white/70"
                          }`}
                        >
                          {v.label}
                          <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${feedView === v.id ? "bg-evolve-yellow/20 text-evolve-yellow" : "bg-white/[0.06] text-white/30"}`}>{v.count}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <p className="text-white font-extrabold text-base">institute highlights</p>
                      {canSubmitUpdate && feedView !== "pending" && (
                        <button onClick={() => openPostModal()} className="text-xs font-bold text-evolve-lavender-indigo flex-shrink-0">
                          + post
                        </button>
                      )}
                    </div>

                    {(isAdmin || isFacultyOnly) && feedView === "pending" ? (
                      !pendingLoaded ? (
                        <p className="text-white/25 text-xs italic py-6 text-center">loading…</p>
                      ) : pendingUpdates.length === 0 ? (
                        <EmptyBlock text="you're all caught up" sub="nothing waiting on review right now." />
                      ) : (
                        <div className="flex flex-col gap-4">
                          {pendingUpdates.map((u) => {
                            const authorMembership = allMembers.find((m) => m.user_id === u.author_id);
                            const roleBadge = authorMembership?.role === "admin" ? "admin" : authorMembership?.member_type === "faculty" ? "faculty" : authorMembership?.member_type === "student" ? "student" : null;
                            return (
                              <div key={u.id} className="rounded-xl border border-evolve-yellow/25 bg-white/[0.02] overflow-hidden">
                                <div className="flex items-center gap-2 px-4 pt-4">
                                  <span className="text-evolve-yellow text-sm">⚠</span>
                                  <p className="text-white font-bold text-[13px]">awaiting your review</p>
                                </div>
                                {u.image_url && (
                                  <div className="mx-4 mt-3 rounded-lg overflow-hidden bg-white/5 aspect-[16/9]">
                                    <img src={u.image_url} alt="" className="w-full h-full object-cover" />
                                  </div>
                                )}
                                <div className="p-4">
                                  <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full bg-evolve-yellow/10 text-evolve-yellow mb-2.5 uppercase">
                                    pending review
                                  </span>
                                  <p className="text-white text-[13px] font-bold mb-1">{u.title}</p>
                                  {u.description && <p className="text-white/40 text-xs leading-relaxed">{u.description}</p>}
                                  {u.source_url && (
                                    <a
                                      href={u.source_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-block text-evolve-lavender-indigo/80 hover:text-evolve-lavender-indigo text-[11px] font-semibold mt-1.5 no-underline hover:underline"
                                    >
                                      view source ↗
                                    </a>
                                  )}
                                  <p className="text-white/30 text-[11px] mt-2.5">
                                    submitted by {u.profiles?.name || "someone"}
                                    {roleBadge ? ` (${roleBadge})` : ""} · {timeAgo(u.created_at)}
                                  </p>
                                  {isAdmin ? (
                                    <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-white/10">
                                      <button onClick={() => removeUpdate(u.id, false)} className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white/60 border border-white/15 rounded-lg px-3 py-1.5 hover:text-white">
                                        ✕ reject
                                      </button>
                                      <button onClick={() => approveUpdate(u.id)} className="inline-flex items-center gap-1.5 text-[11px] font-bold text-evolve-black bg-evolve-inchworm rounded-lg px-3 py-1.5">
                                        ✓ approve
                                      </button>
                                    </div>
                                  ) : (
                                    <p className="text-white/25 text-[11px] italic mt-3 pt-3 border-t border-white/10">waiting on an admin to review</p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )
                    ) : updates.length === 0 ? (
                      <p className="text-white/25 text-sm italic py-6 text-center">nothing posted yet.</p>
                    ) : (
                      <div className="flex flex-col">
                        {updates.map((u) => (
                          <div key={u.id} className="py-4 border-b border-white/5 last:border-b-0 first:pt-0">
                            {u.image_url && (
                              <div className="rounded-lg overflow-hidden bg-white/5 aspect-[16/9] mb-3">
                                <img src={u.image_url} alt="" className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="flex items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-bold text-sm mb-1">{u.title}</p>
                                {u.description && <p className="text-white/45 text-[12.5px] leading-relaxed">{u.description}</p>}
                                <p className="text-white/25 text-[11px] mt-2.5 flex items-center gap-1.5 flex-wrap">
                                  <span>
                                    posted {timeAgo(u.published_at || u.created_at)}
                                    {u.profiles?.name ? ` · by ${u.profiles.name}` : ""}
                                  </span>
                                  {u.source_url && (
                                    <>
                                      <span>·</span>
                                      <a
                                        href={u.source_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-evolve-lavender-indigo/80 hover:text-evolve-lavender-indigo font-semibold no-underline hover:underline"
                                      >
                                        view source ↗
                                      </a>
                                    </>
                                  )}
                                </p>
                              </div>
                              {isAdmin && (
                                <div className="relative flex-shrink-0">
                                  <button
                                    onClick={() => setPostMenuOpenId((v) => (v === u.id ? null : u.id))}
                                    title="post options"
                                    className="text-white/25 hover:text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/[0.04]"
                                  >
                                    ⋮
                                  </button>
                                  {postMenuOpenId === u.id && (
                                    <>
                                      <div className="fixed inset-0 z-40" onClick={() => setPostMenuOpenId(null)} />
                                      <div
                                        className="absolute right-0 top-8 z-50 w-36 rounded-xl border border-white/10 bg-[#1c1c1e] shadow-xl overflow-hidden py-1"
                                      >
                                        <button
                                          onClick={() => {
                                            setPostMenuOpenId(null);
                                            openPostModal(u);
                                          }}
                                          className="w-full text-left px-3.5 py-2.5 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/[0.06]"
                                        >
                                          edit post
                                        </button>
                                        <button
                                          onClick={() => {
                                            setPostMenuOpenId(null);
                                            removeUpdate(u.id, true);
                                          }}
                                          className="w-full text-left px-3.5 py-2.5 text-xs font-semibold text-evolve-red hover:bg-white/[0.06]"
                                        >
                                          remove from feed
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {/* calendar — hidden on mobile here, it has its own tab there instead */}
                  <div className="hidden lg:block rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <p className="text-white font-extrabold text-sm flex-1">mark your calendar</p>
                      {isAdmin && (
                        <button onClick={openCalendarModal} title="edit calendar" className="text-white/40 hover:text-evolve-lavender-indigo w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/[0.06] flex-shrink-0 transition-colors">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M12 20h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                            <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                          </svg>
                        </button>
                      )}
                    </div>
                    {upcomingEvents.length === 0 ? (
                      <p className="text-white/25 text-xs italic py-3 text-center">no upcoming events.</p>
                    ) : (
                      <div className="flex flex-col divide-y divide-white/5">
                        {upcomingEvents.map((ev) => (
                          <EventRow key={ev.id} ev={ev} />
                        ))}
                      </div>
                    )}
                    {pastEvents.length > 0 && (
                      <>
                        <button
                          onClick={() => setShowPastEvents((v) => !v)}
                          className="flex items-center gap-1.5 text-white/30 hover:text-white/50 text-[11px] font-semibold pt-3 mt-3 border-t border-white/10 w-full transition-colors"
                        >
                          <span className="inline-block transition-transform" style={{ transform: showPastEvents ? "rotate(180deg)" : "none" }}>
                            ▾
                          </span>
                          past events ({pastEvents.length})
                        </button>
                        {showPastEvents && (
                          <div className="flex flex-col divide-y divide-white/5 mt-1">
                            {pastEvents.map((ev) => (
                              <EventRow key={ev.id} ev={ev} muted />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* testimonials */}
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <p className="text-white font-extrabold text-sm flex-1">testimonials</p>
                      {(isAdmin || canAddTestimonial) && (
                        <button
                          onClick={openTestimonialsModal}
                          title={isAdmin ? "edit testimonials" : "add a testimonial"}
                          className="text-white/40 hover:text-evolve-lavender-indigo w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/[0.06] flex-shrink-0 transition-colors"
                        >
                          {isAdmin ? (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                              <path d="M12 20h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                              <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                            </svg>
                          ) : (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                    {testimonials.length === 0 && <p className="text-white/25 text-xs italic py-3 text-center">no testimonials yet.</p>}
                    {testimonials.length > 0 && (
                      <div className="flex flex-col divide-y divide-white/5">
                        {testimonials.map((t, i) => (
                          <div key={t.id} className="py-3.5 first:pt-0 last:pb-0">
                            <p className="text-white text-[12.5px] italic leading-relaxed mb-2.5">"{t.quote}"</p>
                            <div className="flex items-center gap-2.5">
                              <div
                                className="rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 overflow-hidden"
                                style={{ background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length], width: 26, height: 26 }}
                              >
                                {t.avatar_url ? <img src={t.avatar_url} alt="" className="w-full h-full object-cover" /> : initialsOf(t.name)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-white text-[11.5px] font-semibold truncate">{t.name}</p>
                                {t.role && <p className="text-white/30 text-[10px] truncate">{t.role}</p>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ============ calendar (mobile only — desktop shows this inside the feed tab's sidebar) ============ */}
            {tab === "calendar" && (
              <div className="lg:hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-white font-extrabold text-sm flex-1">mark your calendar</p>
                  {isAdmin && (
                    <button onClick={openCalendarModal} title="edit calendar" className="text-white/40 hover:text-evolve-lavender-indigo w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/[0.06] flex-shrink-0 transition-colors">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M12 20h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                      </svg>
                    </button>
                  )}
                </div>
                {upcomingEvents.length === 0 ? (
                  <p className="text-white/25 text-xs italic py-3 text-center">no upcoming events.</p>
                ) : (
                  <div className="flex flex-col divide-y divide-white/5">
                    {upcomingEvents.map((ev) => (
                      <EventRow key={ev.id} ev={ev} />
                    ))}
                  </div>
                )}
                {pastEvents.length > 0 && (
                  <>
                    <button
                      onClick={() => setShowPastEvents((v) => !v)}
                      className="flex items-center gap-1.5 text-white/30 hover:text-white/50 text-[11px] font-semibold pt-3 mt-3 border-t border-white/10 w-full transition-colors"
                    >
                      <span className="inline-block transition-transform" style={{ transform: showPastEvents ? "rotate(180deg)" : "none" }}>
                        ▾
                      </span>
                      past events ({pastEvents.length})
                    </button>
                    {showPastEvents && (
                      <div className="flex flex-col divide-y divide-white/5 mt-1">
                        {pastEvents.map((ev) => (
                          <EventRow key={ev.id} ev={ev} muted />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ============ ongoing programs (institute) / programs (company) ============ */}
            {tab === "programs" && (
              <div className="flex flex-col gap-4">
                <p className="text-white/40 text-xs max-w-xl">
                  {isInstitute ? "structured, industry-led programmes this institute runs through evolve." : org.programme_details || "no details added yet."}
                </p>
                {!isInstitute && isAdmin && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    {programmeEditOpen ? (
                      <>
                        <textarea rows={4} value={programmeDraft} onChange={(e) => setProgrammeDraft(e.target.value)} placeholder="what your team does" className={`${fieldInputCls} resize-y`} />
                        <div className="flex justify-end gap-2.5 mt-3">
                          <button
                            onClick={() => {
                              setProgrammeDraft(org.programme_details || "");
                              setProgrammeEditOpen(false);
                            }}
                            className="text-xs font-semibold text-white/50 border border-white/15 rounded-lg px-4 py-2 hover:text-white"
                          >
                            cancel
                          </button>
                          <button onClick={saveProgramme} disabled={programmeSaving} className="text-xs font-bold bg-evolve-lavender-indigo text-white rounded-lg px-4 py-2 disabled:opacity-40">
                            {programmeSaving ? "saving…" : "save changes"}
                          </button>
                        </div>
                      </>
                    ) : (
                      <button onClick={() => setProgrammeEditOpen(true)} className="text-evolve-lavender-indigo text-xs font-bold">
                        edit "what we do" →
                      </button>
                    )}
                  </div>
                )}
                {isInstitute && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {EVOLVE_PROGRAMS.map((p) => (
                      <div key={p.id} className="rounded-2xl border border-white/10 bg-white/[0.03] hover:border-white/20 overflow-hidden flex flex-col transition-colors">
                        <div className="h-24 overflow-hidden">
                          <ProgramArt id={p.id} />
                        </div>
                        <div className="p-4 flex flex-col gap-2.5 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-white font-extrabold text-[15px]">{p.name}</p>
                            <span className="inline-flex items-center gap-1 text-[9.5px] font-bold uppercase text-evolve-inchworm bg-evolve-inchworm/10 px-2 py-1 rounded-full flex-shrink-0">
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" />
                              </svg>
                              unlocked
                            </span>
                          </div>
                          <p className="text-white/40 text-xs leading-relaxed flex-1">{p.desc}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {p.meta.map((m) => (
                              <span key={m} className="text-[10px] font-semibold text-white/40 bg-white/[0.04] border border-white/10 px-2 py-1 rounded-full">
                                {m}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center justify-between gap-2 pt-3 mt-1 border-t border-white/10">
                            <a
                              href={p.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-[12px] font-bold rounded-lg px-3.5 py-2 bg-evolve-inchworm text-evolve-black hover:brightness-105 transition-all"
                            >
                              explore program
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                                <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                                <polyline points="12 5 19 12 12 19" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setReqMessage("");
                          setProgramModalOpen(true);
                        }}
                        className="rounded-2xl border border-dashed border-white/15 hover:border-evolve-lavender-indigo/40 p-5 flex flex-col items-start gap-2.5 text-left transition-colors"
                      >
                        <div className="w-9 h-9 rounded-lg bg-evolve-lavender-indigo/15 text-evolve-lavender-indigo flex items-center justify-center text-base">✎</div>
                        <p className="text-white font-extrabold text-sm">need something tailored?</p>
                        <p className="text-white/35 text-xs leading-relaxed">timeline, format, and disciplines shaped around your batch. tell us what you need.</p>
                        <span className="mt-1 text-xs font-bold bg-evolve-lavender-indigo text-white rounded-lg px-3.5 py-2">request a program</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ============ team ============ */}
            {tab === "team" && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-6 border-b border-white/10 overflow-x-auto">
                  {teamRoles.map((r) => {
                    const count = r === "all" ? teamSource.length : filteredMembersCountForRole(teamSource, r, isInstitute);
                    return (
                      <button
                        key={r}
                        onClick={() => {
                          setTeamRoleFilter(r);
                          setInviteDdOpen(false);
                        }}
                        className={`flex items-center gap-1.5 py-2.5 text-[13px] font-semibold border-b-2 flex-shrink-0 transition-colors ${
                          teamRoleFilter === r ? "text-white border-evolve-lavender-indigo" : "text-white/40 border-transparent hover:text-white/70"
                        }`}
                      >
                        {r === "all" ? "all" : r === "admin" ? "admin" : ROLE_META[r]?.plural || r}
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${teamRoleFilter === r ? "bg-evolve-lavender-indigo/25 text-evolve-lavender-indigo" : "bg-white/[0.06] text-white/40"}`}>{count}</span>
                      </button>
                    );
                  })}
                </div>

                {!isInstitute && isAdmin && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col gap-3">
                    <p className="text-white/30 text-[10px] font-bold uppercase tracking-wide">invite a member</p>
                    <div className="flex gap-2">
                      <input
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSimpleInvite()}
                        placeholder="their@email.com"
                        className="flex-1 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none border border-white/10 focus:border-evolve-yellow/50"
                        style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                      />
                      <button onClick={handleSimpleInvite} disabled={inviting || !inviteEmail.trim()} className="bg-evolve-yellow text-evolve-black font-bold text-sm rounded-xl px-5 disabled:opacity-30">
                        {inviting ? "sending…" : "invite"}
                      </button>
                    </div>
                    {inviteError && <p className="text-evolve-red text-xs">{inviteError}</p>}
                    {!inviteError && inviteSent && <p className="text-evolve-inchworm text-xs">{inviteSent}</p>}
                  </div>
                )}

                {isAdmin && !teamEmptyStateShowing && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none">
                        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
                        <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                      <input
                        value={teamSearch}
                        onChange={(e) => setTeamSearch(e.target.value)}
                        placeholder="search team members…"
                        className="w-full bg-white/[0.04] border border-white/10 text-[12.5px] text-white placeholder-white/25 rounded-lg pl-9 pr-3 py-2.5 outline-none focus:border-evolve-lavender-indigo/50"
                      />
                    </div>
                    {isInstitute && teamRoleFilter !== "all" && (
                      <div className="relative flex-shrink-0">
                        <button
                          onClick={() => setInviteDdOpen((v) => !v)}
                          className="flex items-center gap-1.5 text-[12.5px] font-semibold text-white/70 hover:text-white border border-white/15 rounded-lg px-3.5 py-2.5 transition-colors"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                          </svg>
                          invite {teamRoleFilter === "admin" ? "admin" : ROLE_META[teamRoleFilter]?.word}
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" style={{ transform: inviteDdOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }}>
                            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        {inviteDdOpen && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setInviteDdOpen(false)} />
                            <div className="absolute top-[calc(100%+8px)] right-0 w-[250px] bg-[#232325] border border-white/15 rounded-xl shadow-2xl p-1.5 z-20">
                              <button onClick={() => openTeamModal("one")} className="w-full flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-white/[0.06] text-left">
                                <div className="w-[30px] h-[30px] min-w-[30px] rounded-lg bg-evolve-lavender-indigo/15 text-evolve-lavender-indigo flex items-center justify-center">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
                                    <path d="M19 8v6M22 11h-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-white text-[12.5px] font-bold">add one by one</p>
                                  <p className="text-white/40 text-[10.5px] mt-0.5">name + email</p>
                                </div>
                              </button>
                              <button onClick={() => openTeamModal("csv")} className="w-full flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-white/[0.06] text-left">
                                <div className="w-[30px] h-[30px] min-w-[30px] rounded-lg bg-evolve-inchworm/15 text-evolve-inchworm flex items-center justify-center">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-white text-[12.5px] font-bold">upload a csv</p>
                                  <p className="text-white/40 text-[10.5px] mt-0.5">for a whole batch</p>
                                </div>
                              </button>
                              <button onClick={() => openTeamModal("find")} className="w-full flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-white/[0.06] text-left">
                                <div className="w-[30px] h-[30px] min-w-[30px] rounded-lg bg-evolve-yellow/15 text-evolve-yellow flex items-center justify-center">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
                                    <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-white text-[12.5px] font-bold">find on evolve</p>
                                  <p className="text-white/40 text-[10.5px] mt-0.5">if they're already a member</p>
                                </div>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {(() => {
                  const memberGrid = (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filteredMembers.map((m, i) => {
                        const roleBadge = m.role === "owner" || m.role === "admin" ? "admin" : m.member_type || (isInstitute ? null : "member");
                        const discipline = m.title || m.intake?.department || m.intake?.program || m.intake?.subjects || null;
                        return (
                          <div key={m.id} className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 group">
                            {isAdmin && m.user_id !== user?.id && (
                              <button
                                onClick={() => removeMember(m.id)}
                                className="absolute top-3 right-3 w-6.5 h-6.5 rounded-md text-white/25 opacity-0 group-hover:opacity-100 hover:text-evolve-red hover:bg-evolve-red/10 flex items-center justify-center transition-all"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                  <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                  <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </button>
                            )}
                            <div className="flex items-start gap-2.5">
                              <div
                                className="w-[34px] h-[34px] min-w-[34px] rounded-full flex items-center justify-center text-white text-[11.5px] font-bold flex-shrink-0 overflow-hidden"
                                style={{ background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length] }}
                              >
                                {m.profiles?.avatar_url ? (
                                  <img src={m.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  initialsOf(m.profiles?.name || m.invited_name || m.invited_email)
                                )}
                              </div>
                              <div className="min-w-0 pr-6">
                                <p className="text-white font-semibold text-[13px] truncate">{m.profiles?.name || m.invited_name || m.invited_email || "evolve member"}</p>
                                {discipline && <p className="text-white/40 text-xs mt-0.5 truncate">{discipline}</p>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2.5">
                              {roleBadge && (
                                <span
                                  className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full flex-shrink-0 ${
                                    roleBadge === "admin" ? "bg-evolve-yellow/10 text-evolve-yellow" : roleBadge === "faculty" ? "bg-evolve-lavender-indigo/10 text-evolve-lavender-indigo" : "bg-white/[0.06] text-white/40"
                                  }`}
                                >
                                  {roleBadge}
                                </span>
                              )}
                              {m.user_id === user?.id && <span className="text-[10.5px] text-white/30 font-semibold">you</span>}
                              {isAdmin && m.status && m.status !== "active" && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 bg-evolve-yellow/10 text-evolve-yellow">invited</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );

                  if (teamEmptyStateShowing) {
                    return (
                      <div className="flex flex-col gap-3">
                        {filteredMembers.length > 0 && memberGrid}
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 flex flex-col items-center text-center gap-2.5">
                          <p className="text-white font-bold text-[15px]">
                            {filteredMembers.length === 0 ? `no ${ROLE_META[teamRoleFilter]?.plural} yet` : `add more ${ROLE_META[teamRoleFilter]?.plural}`}
                          </p>
                          <p className="text-white/35 text-xs max-w-sm">add {ROLE_META[teamRoleFilter]?.plural} one by one, upload a csv, or find them if they're already on evolve.</p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl mt-3">
                            <button onClick={() => openTeamModal("one")} className="text-left rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] hover:border-white/20 p-4 flex flex-col gap-2.5 transition-colors">
                              <div className="w-7 h-7 rounded-lg bg-evolve-lavender-indigo/15 text-evolve-lavender-indigo flex items-center justify-center text-sm font-bold">+</div>
                              <div>
                                <p className="text-white text-xs font-bold">add one by one</p>
                                <p className="text-white/35 text-[11px] mt-0.5">name, email — role is set for you</p>
                              </div>
                            </button>
                            <button onClick={() => openTeamModal("csv")} className="text-left rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] hover:border-white/20 p-4 flex flex-col gap-2.5 transition-colors">
                              <div className="w-7 h-7 rounded-lg bg-evolve-inchworm/15 text-evolve-inchworm flex items-center justify-center text-sm">⇧</div>
                              <div>
                                <p className="text-white text-xs font-bold">upload a csv</p>
                                <p className="text-white/35 text-[11px] mt-0.5">for the whole batch</p>
                              </div>
                            </button>
                            <button onClick={() => openTeamModal("find")} className="text-left rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] hover:border-white/20 p-4 flex flex-col gap-2.5 transition-colors">
                              <div className="w-7 h-7 rounded-lg bg-evolve-yellow/15 text-evolve-yellow flex items-center justify-center text-sm">⌕</div>
                              <div>
                                <p className="text-white text-xs font-bold">find on evolve</p>
                                <p className="text-white/35 text-[11px] mt-0.5">if they already have an account</p>
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (filteredMembers.length === 0) return <p className="text-white/25 text-sm italic">no matches.</p>;
                  return memberGrid;
                })()}
              </div>
            )}

            {/* ============ settings (owner only) — same shell, this just swaps the main content ============ */}
            {tab === "settings" && isOwner && (
              <InstituteSettingsPanel
                org={org}
                members={allMembersLoaded ? allMembers : members}
                user={user}
                slug={slug}
                onBack={() => setTab("feed")}
                onNavigateTab={(t) => setTab(t)}
                reloadOrg={load}
                reloadMembers={loadAdminTeam}
              />
            )}
          </div>
        </div>
      </div>

      {/* ============ mobile-only: space info sheet ============ */}
      {mobileInfoOpen && (
        <div
          className="md:hidden fixed inset-0 z-[200] bg-black/65 backdrop-blur-sm flex items-end justify-center overflow-y-auto"
          onClick={(e) => e.target === e.currentTarget && setMobileInfoOpen(false)}
        >
          <div className="w-full rounded-t-3xl border border-white/15 flex flex-col" style={{ background: "#1c1c1e", maxHeight: "88vh" }}>
            <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-4 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <OrgLogoBox org={org} size={40} rounded="rounded-xl" />
                <p className="text-white font-extrabold text-base">space info</p>
              </div>
              <button onClick={() => setMobileInfoOpen(false)} className="text-white/40 hover:text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/[0.06] flex-shrink-0">
                ×
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-5">
              <InstituteInfoPanel
                org={org}
                isAdmin={isAdmin}
                sidebarStats={sidebarStats}
                onEditInfo={() => {
                  setMobileInfoOpen(false);
                  openEditModal();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ============ modal: post a highlight ============ */}
      {postModalOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/65 backdrop-blur-sm flex items-start justify-center px-5 py-[8vh] overflow-y-auto"
          onClick={(e) => e.target === e.currentTarget && setPostModalOpen(false)}
        >
          <div className="w-full max-w-[460px] rounded-2xl border border-white/15 p-6" style={{ background: "#1c1c1e" }}>
            <div className="flex items-start justify-between gap-4 mb-1">
              <div>
                <p className="text-white font-extrabold text-lg">{editingUpdateId ? "edit highlight" : "post a highlight"}</p>
                <p className="text-white/40 text-xs mt-1">
                  {editingUpdateId
                    ? "changes save straight to the live post."
                    : isAdmin
                      ? `visible to the ${org.name} team now · goes live immediately`
                      : `visible to the ${org.name} team now · goes live after admin review`}
                </p>
              </div>
              <button onClick={() => setPostModalOpen(false)} className="text-white/40 hover:text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/[0.06] flex-shrink-0">
                ×
              </button>
            </div>
            <div className="flex flex-col gap-4 mt-4">
              <div>
                <p className="text-white/30 text-[10.5px] font-bold uppercase tracking-wide mb-2">
                  image <span className="normal-case font-normal text-white/25">optional</span>
                </p>
                {shareImagePreview || shareExistingImageUrl ? (
                  <div className="relative rounded-xl overflow-hidden bg-white/5 aspect-[16/9]">
                    <img src={shareImagePreview || shareExistingImageUrl} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={clearShareImage}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <label
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      pickShareImage(e.dataTransfer.files?.[0]);
                    }}
                    className="flex flex-col items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-white/15 hover:border-evolve-lavender-indigo/50 hover:bg-evolve-lavender-indigo/[0.04] py-8 cursor-pointer transition-colors relative"
                  >
                    <input type="file" accept="image/*" onChange={(e) => pickShareImage(e.target.files?.[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white/30">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="text-white/40 text-xs font-semibold">click to upload, or drag and drop</p>
                  </label>
                )}
              </div>
              <Field label="title">
                <input value={shareTitle} onChange={(e) => setShareTitle(e.target.value)} maxLength={90} placeholder="e.g. NID students win 3 D&AD pencils this year" className={fieldInputCls} />
              </Field>
              <Field
                label="description"
                hint={`${shareDesc.trim() ? shareDesc.trim().split(/\s+/).length : 0} / 300 words`}
              >
                <textarea rows={3} value={shareDesc} onChange={(e) => setShareDesc(e.target.value)} placeholder="what happened, and why it matters — keep it factual and specific." className={`${fieldInputCls} resize-y`} />
              </Field>
              <Field label="source link" hint="optional — where this is from, so people can click through">
                <input
                  value={shareSourceUrl}
                  onChange={(e) => setShareSourceUrl(e.target.value)}
                  placeholder="https://…"
                  className={fieldInputCls}
                />
              </Field>
              <div className="flex gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <span className="text-white/30 flex-shrink-0">⚠</span>
                <p className="text-white/40 text-[11px] leading-relaxed">
                  {isAdmin
                    ? `this publishes straight to ${org.name}'s public feed.`
                    : `posts are reviewed by an ${org.name} admin before appearing on the public feed — this usually takes under 24 hours. only ${org.name} admins and faculty can post.`}
                </p>
              </div>
            </div>
            <button
              onClick={submitShareUpdate}
              disabled={shareSubmitting || !shareTitle.trim()}
              className="w-full mt-5 text-[13px] font-bold bg-evolve-lavender-indigo text-white rounded-lg py-3 disabled:opacity-40 transition-opacity"
            >
              {shareSubmitting ? "saving…" : editingUpdateId ? "save changes" : isAdmin ? "publish" : "submit for review"}
            </button>
          </div>
        </div>
      )}

      {/* ============ modal: edit institute info (two-pane) ============ */}
      {editModalOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/65 sm:backdrop-blur-sm flex items-stretch sm:items-start justify-center px-0 sm:px-5 py-0 sm:py-[8vh] overflow-y-auto"
          onClick={(e) => e.target === e.currentTarget && setEditModalOpen(false)}
        >
          <div className="w-full sm:max-w-[840px] rounded-none sm:rounded-2xl border-0 sm:border border-white/15 flex flex-col" style={{ background: "#1c1c1e", maxHeight: "100vh" }}>
            <div className="flex items-start justify-between gap-4 px-5 sm:px-6 pt-5 pb-4 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <button onClick={() => setEditModalOpen(false)} className="sm:hidden text-white/60 hover:text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/[0.06] flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div>
                  <p className="text-white font-extrabold text-lg">edit institute info</p>
                  <p className="text-white/40 text-xs mt-1 hidden sm:block">visible to everyone on the space — changes are instant</p>
                </div>
              </div>
              <button
                onClick={saveBanner}
                disabled={bannerSaving}
                className="sm:hidden text-xs font-bold bg-evolve-lavender-indigo text-white rounded-lg px-4 py-2 disabled:opacity-40 flex-shrink-0"
              >
                {bannerSaving ? "saving…" : "save"}
              </button>
              <button onClick={() => setEditModalOpen(false)} className="hidden sm:flex text-white/40 hover:text-white w-7 h-7 items-center justify-center rounded-lg hover:bg-white/[0.06] flex-shrink-0">
                ×
              </button>
            </div>

            <div className="flex flex-col sm:flex-row min-h-0 flex-1">
              <div className="w-full sm:w-[172px] sm:min-w-[172px] border-b sm:border-b-0 sm:border-r border-white/10 p-2 sm:p-3 flex flex-row sm:flex-col gap-1 overflow-x-auto sm:overflow-y-auto flex-shrink-0">
                {EDIT_PANELS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setEditModalPanel(p.id)}
                    className={`flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-[12.5px] font-semibold transition-colors text-left flex-shrink-0 ${
                      editModalPanel === p.id ? "bg-evolve-lavender-indigo/15 text-evolve-lavender-indigo" : "text-white/50 hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    <span className={editModalPanel === p.id ? "text-evolve-lavender-indigo" : "text-white/30"}>{p.icon}</span>
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 min-w-0 overflow-y-auto p-6">
                {editModalPanel === "basics" && (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <OrgLogoBox org={org} size={56} rounded="rounded-2xl" />
                      <p className="text-white/30 text-[11px] leading-relaxed">logo updates aren't supported here yet — reach out to us to change it.</p>
                    </div>
                    <Field label={isInstitute ? "institute name" : "space name"}>
                      <input value={name} onChange={(e) => setName(e.target.value)} className={fieldInputCls} />
                    </Field>
                    <Field label="location">
                      <input value={orgLocation} onChange={(e) => setOrgLocation(e.target.value)} placeholder="e.g. vadodara, gujarat" className={fieldInputCls} />
                    </Field>
                    <Field label="website url">
                      <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://…" className={fieldInputCls} />
                    </Field>
                  </div>
                )}

                {editModalPanel === "description" && (
                  <div className="flex flex-col gap-4">
                    <Field label="about (short)" hint={`${aboutShort.length}/90`}>
                      <input maxLength={90} value={aboutShort} onChange={(e) => setAboutShort(e.target.value)} placeholder="one line that shows up on cards and previews" className={fieldInputCls} />
                    </Field>
                    <Field label="description">
                      <textarea rows={7} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="the fuller story for your page" className={`${fieldInputCls} resize-y`} />
                    </Field>
                  </div>
                )}

                {editModalPanel === "links" && (
                  <div className="flex flex-col gap-3">
                    <p className="text-white/30 text-[10.5px] leading-relaxed">where people can find you beyond the website.</p>
                    <div className="flex flex-col gap-2">
                      {links.map((l, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <select
                            value={l.platform}
                            onChange={(e) => updateLinkRow(i, { platform: e.target.value })}
                            className="bg-white/[0.055] border border-white/10 text-white/70 text-xs font-semibold rounded-lg px-2.5 py-2.5 outline-none flex-shrink-0 w-[120px]"
                          >
                            {PLATFORMS.map((p) => (
                              <option key={p} value={p} style={{ backgroundColor: "#1f1f22", color: "#fff" }}>
                                {p}
                              </option>
                            ))}
                          </select>
                          <input value={l.url} onChange={(e) => updateLinkRow(i, { url: e.target.value })} placeholder="paste link…" className={`${fieldInputCls} flex-1`} />
                          <button onClick={() => removeLinkRow(i)} className="text-white/30 hover:text-evolve-red w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg hover:bg-white/[0.04]">
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <button onClick={addLinkRow} className="text-evolve-lavender-indigo text-xs font-semibold w-fit">
                      + add link
                    </button>
                  </div>
                )}

                {editModalPanel === "awards" && (
                  <div className="flex flex-col gap-3">
                    <p className="text-white/30 text-[10.5px] leading-relaxed">recognition that builds trust with students and parents.</p>
                    <div className="flex flex-col gap-2">
                      {awards.map((a, i) => (
                        <div key={i} className="flex items-start gap-2 bg-white/[0.03] border border-white/10 rounded-xl p-2.5">
                          <div className="flex-1 grid grid-cols-[1.4fr_1fr] gap-2">
                            <input value={a.title} onChange={(e) => updateAwardRow(i, { title: e.target.value })} placeholder="award or accreditation title" className={fieldInputCls} />
                            <input value={a.issuer} onChange={(e) => updateAwardRow(i, { issuer: e.target.value })} placeholder="issued by · year" className={fieldInputCls} />
                          </div>
                          <button onClick={() => removeAwardRow(i)} className="text-white/30 hover:text-evolve-red w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg hover:bg-white/[0.04]">
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <button onClick={addAwardRow} className="text-evolve-lavender-indigo text-xs font-semibold w-fit">
                      + add award
                    </button>
                  </div>
                )}

                {editModalPanel === "more" && (
                  <div className="flex flex-col gap-4">
                    <p className="text-white/30 text-[10.5px] leading-relaxed">shown in the sidebar stat row.</p>
                    <Field label="est. year">
                      <input value={yearFounded} onChange={(e) => setYearFounded(e.target.value)} placeholder="e.g. 2015" className={fieldInputCls} />
                    </Field>
                    <Field label={isInstitute ? "faculty & students" : "team size"} hint="shown if you haven't invited everyone yet">
                      <input value={expectedMembers} onChange={(e) => setExpectedMembers(e.target.value)} placeholder="e.g. 2200" className={fieldInputCls} />
                    </Field>
                  </div>
                )}
              </div>
            </div>

            <div className="hidden sm:block px-6 py-4 border-t border-white/10 flex-shrink-0">
              <button onClick={saveBanner} disabled={bannerSaving} className="w-full text-[13px] font-bold bg-evolve-lavender-indigo text-white rounded-lg py-3 disabled:opacity-40 transition-opacity">
                {bannerSaving ? "saving…" : "save changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ modal: add one team member ============ */}
      {teamModalOpen === "one" && (
        <div className="fixed inset-0 z-[200] bg-black/65 backdrop-blur-sm flex items-end sm:items-start justify-center px-0 sm:px-5 py-0 sm:py-[8vh] overflow-y-auto" onClick={(e) => e.target === e.currentTarget && closeTeamModal()}>
          <div className="w-full sm:max-w-[440px] rounded-t-3xl sm:rounded-2xl border border-white/15" style={{ background: "#1c1c1e" }}>
            <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4">
              <div>
                <p className="text-white font-extrabold text-lg">add a {ROLE_META[teamRoleFilter]?.word}</p>
                <p className="text-white/40 text-xs mt-1">they'll get an email invite to join your space.</p>
              </div>
              <button onClick={closeTeamModal} className="text-white/40 hover:text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/[0.06] flex-shrink-0">
                ×
              </button>
            </div>
            <div className="px-6 pb-2 flex flex-col gap-4">
              <span className={`inline-flex items-center gap-2 w-fit text-xs font-bold px-3 py-1.5 rounded-lg ${ROLE_META[teamRoleFilter]?.bg} ${ROLE_META[teamRoleFilter]?.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${ROLE_META[teamRoleFilter]?.dot}`} /> adding as {ROLE_META[teamRoleFilter]?.word}
              </span>
              <Field label="full name">
                <input value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="e.g. ananya sharma" className={fieldInputCls} />
              </Field>
              <Field label="email">
                <input type="email" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} placeholder="name@institute.edu" className={fieldInputCls} />
              </Field>
              {teamRoleFilter === "admin" && (
                <div className="rounded-xl border border-evolve-yellow/30 bg-evolve-yellow/[0.06] p-3 flex gap-2.5">
                  <span className="text-evolve-yellow flex-shrink-0">⚠</span>
                  <p className="text-white/70 text-xs leading-relaxed">
                    <strong className="text-evolve-yellow">admins have the same rights as you</strong> — including managing members and deleting this space.
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2.5 px-6 py-4 border-t border-white/10 mt-2">
              <button onClick={() => submitAddOne(true)} disabled={addSubmitting || !EMAIL_RE.test(addEmail.trim())} className="text-evolve-lavender-indigo text-xs font-semibold disabled:opacity-30">
                + save &amp; add another
              </button>
              <span className="flex-1" />
              <button onClick={closeTeamModal} className="text-xs font-semibold text-white/50 border border-white/15 rounded-lg px-4 py-2 hover:text-white">
                cancel
              </button>
              <button onClick={() => submitAddOne(false)} disabled={addSubmitting || !EMAIL_RE.test(addEmail.trim())} className="text-xs font-bold bg-evolve-lavender-indigo text-white rounded-lg px-4 py-2 disabled:opacity-40">
                {addSubmitting ? "sending…" : "send invite"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ modal: csv upload ============ */}
      {teamModalOpen === "csv" && (
        <div className="fixed inset-0 z-[200] bg-black/65 backdrop-blur-sm flex items-end sm:items-start justify-center px-0 sm:px-5 py-0 sm:py-[8vh] overflow-y-auto" onClick={(e) => e.target === e.currentTarget && closeTeamModal()}>
          <div className="w-full sm:max-w-[580px] rounded-t-3xl sm:rounded-2xl border border-white/15" style={{ background: "#1c1c1e" }}>
            <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4">
              <div>
                <p className="text-white font-extrabold text-lg">upload a csv · {ROLE_META[teamRoleFilter]?.plural}</p>
                <p className="text-white/40 text-xs mt-1">{csvPhase === "upload" ? "columns: name, email" : `${csvFileName} · ${csvRows.length} rows parsed`}</p>
              </div>
              <button onClick={closeTeamModal} className="text-white/40 hover:text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/[0.06] flex-shrink-0">
                ×
              </button>
            </div>

            {csvPhase === "upload" ? (
              <div className="px-6 pb-6 flex flex-col gap-3">
                <span className={`inline-flex items-center gap-2 w-fit text-xs font-bold px-3 py-1.5 rounded-lg ${ROLE_META[teamRoleFilter]?.bg} ${ROLE_META[teamRoleFilter]?.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${ROLE_META[teamRoleFilter]?.dot}`} /> every row will be added as{" "}
                  {teamRoleFilter === "admin" ? "an admin" : `a ${ROLE_META[teamRoleFilter]?.word}`}
                </span>
                <label className="border-[1.5px] border-dashed border-white/15 hover:border-evolve-lavender-indigo/50 hover:bg-evolve-lavender-indigo/[0.04] rounded-xl py-9 px-5 text-center cursor-pointer transition-colors relative flex flex-col items-center gap-2">
                  <input type="file" accept=".csv" onChange={handleCsvFile} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <div className="w-10 h-10 rounded-xl bg-evolve-inchworm/10 text-evolve-inchworm flex items-center justify-center text-lg">⇧</div>
                  <p className="text-white font-bold text-sm">drop your file here</p>
                  <p className="text-white/40 text-xs">or click to browse — accepts .csv</p>
                </label>
              </div>
            ) : (
              <div className="px-6 pb-4 flex flex-col gap-3">
                <div className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-xl p-3">
                  <div className="w-8 h-8 rounded-lg bg-evolve-inchworm/10 text-evolve-inchworm flex items-center justify-center flex-shrink-0">▤</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-xs font-semibold truncate">{csvFileName}</p>
                    <p className="text-white/30 text-[11px]">{csvRows.length} rows</p>
                  </div>
                  <button
                    onClick={() => {
                      setCsvPhase("upload");
                      setCsvRows([]);
                      setCsvFileName("");
                    }}
                    className="text-evolve-lavender-indigo text-xs font-semibold flex-shrink-0"
                  >
                    replace
                  </button>
                </div>

                <div className="flex gap-2.5">
                  <div className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5">
                    <p className="text-evolve-inchworm font-extrabold text-xl">{csvReadyRows.length}</p>
                    <p className="text-white/35 text-[11px]">ready to invite</p>
                  </div>
                  {csvErrorRows.length > 0 && (
                    <div className="flex-1 bg-evolve-red/[0.06] border border-evolve-red/30 rounded-xl px-3.5 py-2.5">
                      <p className="text-evolve-red font-extrabold text-xl">{csvErrorRows.length}</p>
                      <p className="text-white/35 text-[11px]">need fixing</p>
                    </div>
                  )}
                </div>

                {csvErrorRows.length > 0 && (
                  <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto">
                    {csvErrorRows.map((r) => (
                      <div key={r.i} className="bg-evolve-red/[0.06] border border-evolve-red/25 rounded-lg px-3 py-2 flex items-center gap-2.5">
                        <span className="text-white/25 text-[10px] font-bold flex-shrink-0">#{r.i + 1}</span>
                        {r.alreadyMember || r.duplicateInFile ? (
                          <>
                            <span className="text-white text-xs font-semibold truncate">{r.name || r.email}</span>
                            <span className="text-evolve-red text-[11px] flex-shrink-0">{r.alreadyMember ? "already in your space" : "duplicate row"}</span>
                          </>
                        ) : (
                          <input
                            value={r.email}
                            onChange={(e) => updateCsvRow(r.i, { email: e.target.value.toLowerCase() })}
                            placeholder="fix email"
                            className="flex-1 min-w-0 bg-black/25 border border-evolve-red/30 rounded-md text-xs text-white px-2 py-1.5 outline-none"
                          />
                        )}
                        <button onClick={() => skipCsvRow(r.i)} className="text-white/30 hover:text-white text-[11px] font-semibold flex-shrink-0 ml-auto">
                          skip
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2.5 px-6 py-4 border-t border-white/10">
              {csvPhase === "review" && <span className="text-white/25 text-[11px]">fixed rows are included automatically</span>}
              <span className="flex-1" />
              <button onClick={closeTeamModal} className="text-xs font-semibold text-white/50 border border-white/15 rounded-lg px-4 py-2 hover:text-white">
                cancel
              </button>
              {csvPhase === "review" && (
                <button onClick={submitCsv} disabled={csvSubmitting || !csvReadyRows.length} className="text-xs font-bold bg-evolve-lavender-indigo text-white rounded-lg px-4 py-2 disabled:opacity-40">
                  {csvSubmitting ? "sending…" : `send ${csvReadyRows.length} invites`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============ modal: find on evolve ============ */}
      {teamModalOpen === "find" && (
        <div className="fixed inset-0 z-[200] bg-black/65 backdrop-blur-sm flex items-end sm:items-start justify-center px-0 sm:px-5 py-0 sm:py-[8vh] overflow-y-auto" onClick={(e) => e.target === e.currentTarget && closeTeamModal()}>
          <div className="w-full sm:max-w-[560px] rounded-t-3xl sm:rounded-2xl border border-white/15" style={{ background: "#1c1c1e" }}>
            <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4">
              <div>
                <p className="text-white font-extrabold text-lg">find {ROLE_META[teamRoleFilter]?.plural} on evolve</p>
                <p className="text-white/40 text-xs mt-1">invite people who already have an evolve account — they accept in-app.</p>
              </div>
              <button onClick={closeTeamModal} className="text-white/40 hover:text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/[0.06] flex-shrink-0">
                ×
              </button>
            </div>
            <div className="px-6 pb-2 flex flex-col gap-3">
              <span className={`inline-flex items-center gap-2 w-fit text-xs font-bold px-3 py-1.5 rounded-lg ${ROLE_META[teamRoleFilter]?.bg} ${ROLE_META[teamRoleFilter]?.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${ROLE_META[teamRoleFilter]?.dot}`} /> selected people will be added as{" "}
                {teamRoleFilter === "admin" ? "admins" : ROLE_META[teamRoleFilter]?.plural}
              </span>
              <input value={findQuery} onChange={(e) => setFindQuery(e.target.value)} placeholder="search by name…" className={fieldInputCls} />

              <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto">
                {findSearching && <p className="text-white/30 text-xs text-center py-4">searching…</p>}
                {!findSearching && findQuery.trim() && findResults.length === 0 && <p className="text-white/25 text-xs text-center py-4 italic">no matches.</p>}
                {findResults.map((p, i) => {
                  const sel = findSelected.has(p.id);
                  return (
                    <div
                      key={p.id}
                      onClick={() => toggleFindSelect(p.id)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                        sel ? "border-evolve-lavender-indigo bg-evolve-lavender-indigo/[0.08]" : "border-white/10 bg-white/[0.03] hover:border-white/20"
                      }`}
                    >
                      <div
                        className={`w-[18px] h-[18px] rounded-[5px] border-[1.5px] flex-shrink-0 flex items-center justify-center ${
                          sel ? "bg-evolve-lavender-indigo border-evolve-lavender-indigo" : "border-white/20"
                        }`}
                      >
                        {sel && <span className="text-white text-[10px]">✓</span>}
                      </div>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 overflow-hidden"
                        style={{ background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length] }}
                      >
                        {p.avatar_url ? <img src={p.avatar_url} alt="" className="w-full h-full object-cover" /> : initialsOf(p.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">
                          {p.name} {p.username && <span className="text-white/30 text-[11px] font-normal">@{p.username}</span>}
                        </p>
                        {(p.persona || p.level) && <p className="text-white/35 text-[11px] mt-0.5 truncate">{[p.persona, p.level].filter(Boolean).join(" · ")}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-2.5 px-6 py-4 border-t border-white/10 mt-2">
              <span className="text-white/25 text-[11px]">{findSelected.size} selected</span>
              <span className="flex-1" />
              <button onClick={closeTeamModal} className="text-xs font-semibold text-white/50 border border-white/15 rounded-lg px-4 py-2 hover:text-white">
                cancel
              </button>
              <button onClick={submitFind} disabled={findSubmitting || findSelected.size === 0} className="text-xs font-bold bg-evolve-lavender-indigo text-white rounded-lg px-4 py-2 disabled:opacity-40">
                {findSubmitting ? "adding…" : "send invites"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ modal: request a program ============ */}
      {programModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/65 backdrop-blur-sm flex items-start justify-center px-5 py-[8vh] overflow-y-auto" onClick={(e) => e.target === e.currentTarget && setProgramModalOpen(false)}>
          <div className="w-full max-w-[460px] rounded-2xl border border-white/15" style={{ background: "#1c1c1e" }}>
            <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-3">
              <div>
                <p className="text-white font-extrabold text-lg">request a program</p>
                <p className="text-white/40 text-xs mt-1">tell us your batch size, semester, and what outcome you're chasing — we'll come back with a plan.</p>
              </div>
              <button onClick={() => setProgramModalOpen(false)} className="text-white/40 hover:text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/[0.06] flex-shrink-0">
                ×
              </button>
            </div>
            <div className="px-6 pb-2 flex flex-col gap-4">
              <Field label="what do you need?">
                <textarea
                  rows={3}
                  value={reqMessage}
                  onChange={(e) => setReqMessage(e.target.value)}
                  placeholder="e.g. a 2-day ux research bootcamp for our 3rd-year batch of 45, before placement season…"
                  className={`${fieldInputCls} resize-y`}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="batch size">
                  <input value={reqBatchSize} onChange={(e) => setReqBatchSize(e.target.value)} placeholder="e.g. 45" className={fieldInputCls} />
                </Field>
                <Field label="timeline">
                  <input value={reqTimeline} onChange={(e) => setReqTimeline(e.target.value)} placeholder="e.g. before nov" className={fieldInputCls} />
                </Field>
              </div>
            </div>
            <div className="flex items-center gap-2.5 px-6 py-4 border-t border-white/10 mt-2">
              <span className="flex-1" />
              <button onClick={() => setProgramModalOpen(false)} className="text-xs font-semibold text-white/50 border border-white/15 rounded-lg px-4 py-2 hover:text-white">
                cancel
              </button>
              <button onClick={submitProgramRequest} disabled={reqSubmitting || !reqMessage.trim()} className="text-xs font-bold bg-evolve-lavender-indigo text-white rounded-lg px-4 py-2 disabled:opacity-40">
                {reqSubmitting ? "sending…" : "send request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ modal: edit calendar ============ */}
      {calendarModalOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/65 backdrop-blur-sm flex items-start justify-center px-5 py-[8vh] overflow-y-auto"
          onClick={(e) => e.target === e.currentTarget && setCalendarModalOpen(false)}
        >
          <div className="w-full max-w-[620px] rounded-2xl border border-white/15 flex flex-col" style={{ background: "#1c1c1e", maxHeight: "84vh" }}>
            <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-evolve-lavender-indigo/15 text-evolve-lavender-indigo flex items-center justify-center flex-shrink-0">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
                    <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="1.8" />
                    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-extrabold text-lg">edit calendar</p>
                  <p className="text-white/40 text-xs mt-0.5">shown under "mark your calendar" on the feed</p>
                </div>
              </div>
              <button onClick={() => setCalendarModalOpen(false)} className="text-white/40 hover:text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/[0.06] flex-shrink-0">
                ×
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-5 flex flex-col gap-3">
              <button onClick={addCalendarDraftRow} className="w-full text-[13px] font-bold text-evolve-lavender-indigo bg-evolve-lavender-indigo/10 hover:bg-evolve-lavender-indigo/15 rounded-xl py-3 transition-colors">
                + add new event
              </button>

              {calendarDraft.length === 0 && <p className="text-white/25 text-xs italic text-center py-6">nothing on the calendar yet — add your first event above.</p>}

              {calendarDraft.map((r) => {
                const tm = TYPE_META[r.type];
                return (
                  <div key={r._key} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(TYPE_META).map(([key, meta]) => (
                          <button
                            key={key}
                            onClick={() => updateCalendarDraftRow(r._key, { type: key })}
                            className={`text-[10.5px] font-bold px-2.5 py-1.5 rounded-full border transition-colors ${
                              r.type === key ? `${meta.bg} ${meta.text} border-transparent` : "border-white/15 text-white/40 hover:text-white/70"
                            }`}
                          >
                            {meta.label}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => removeCalendarDraftRow(r._key, r.id)}
                        title="delete event"
                        className="text-white/30 hover:text-evolve-red w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg hover:bg-white/[0.06]"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                          <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>

                    <input
                      value={r.title}
                      onChange={(e) => updateCalendarDraftRow(r._key, { title: e.target.value })}
                      maxLength={70}
                      placeholder="event title"
                      className={`w-full bg-transparent border-0 border-b-[1.5px] border-dashed outline-none text-[15px] font-bold text-white placeholder-white/25 pb-2 transition-colors ${tm.text} focus:border-current`}
                      style={{ borderColor: "rgba(255,255,255,0.2)" }}
                    />

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white/30 text-[10.5px] font-bold uppercase tracking-wide">when</p>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <span className="text-white/40 text-[11px] font-semibold">multi-day</span>
                          <button
                            type="button"
                            onClick={() => updateCalendarDraftRow(r._key, { is_multi_day: !r.is_multi_day })}
                            className={`w-[34px] h-[19px] min-w-[34px] rounded-full relative transition-colors ${r.is_multi_day ? "bg-evolve-lavender-indigo" : "bg-white/10 border border-white/15"}`}
                          >
                            <span className="absolute top-0.5 w-[15px] h-[15px] rounded-full bg-white transition-all" style={{ left: r.is_multi_day ? 17 : 2 }} />
                          </button>
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        <Field label="starts">
                          <input type="date" value={r.event_date} onChange={(e) => updateCalendarDraftRow(r._key, { event_date: e.target.value })} className={fieldInputCls} />
                        </Field>
                        {r.is_multi_day && (
                          <Field label="ends">
                            <input type="date" value={r.end_date || ""} onChange={(e) => updateCalendarDraftRow(r._key, { end_date: e.target.value })} className={fieldInputCls} />
                          </Field>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-white/30 text-[10.5px] font-bold uppercase tracking-wide mb-2">format</p>
                      <div className="flex gap-2">
                        {["offline", "online", "hybrid"].map((f) => (
                          <button
                            key={f}
                            onClick={() => updateCalendarDraftRow(r._key, { format: f })}
                            className={`flex-1 text-xs font-bold px-3 py-2 rounded-lg border transition-colors ${
                              r.format === f ? "bg-evolve-lavender-indigo/15 border-evolve-lavender-indigo text-evolve-lavender-indigo" : "border-white/15 text-white/50 hover:text-white/80"
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Field label={<>description <span className="normal-case font-normal text-white/25">optional</span></>}>
                      <textarea
                        rows={2}
                        value={r.description}
                        onChange={(e) => updateCalendarDraftRow(r._key, { description: e.target.value })}
                        placeholder="a sentence or two of detail — shown when someone opens the event."
                        className={`${fieldInputCls} resize-y`}
                      />
                    </Field>

                    <Field label='meta line shown under the title, e.g. "all applicants"'>
                      <input value={r.meta} onChange={(e) => updateCalendarDraftRow(r._key, { meta: e.target.value })} placeholder="e.g. all applicants" className={fieldInputCls} />
                    </Field>

                    <div>
                      <p className="text-white/30 text-[10.5px] font-bold uppercase tracking-wide mb-2">who can see this</p>
                      <div className="flex gap-2">
                        {[
                          { value: "none", label: "no tag" },
                          { value: "open", label: "open to all" },
                          { value: "internal", label: "team only" }
                        ].map((a) => (
                          <button
                            key={a.value}
                            onClick={() => updateCalendarDraftRow(r._key, { audience: a.value })}
                            className={`flex-1 text-xs font-bold px-3 py-2 rounded-lg border transition-colors ${
                              r.audience === a.value ? "bg-evolve-lavender-indigo/15 border-evolve-lavender-indigo text-evolve-lavender-indigo" : "border-white/15 text-white/50 hover:text-white/80"
                            }`}
                          >
                            {a.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-6 py-4 border-t border-white/10 flex-shrink-0">
              <button onClick={saveCalendarChanges} disabled={calendarSaving} className="w-full text-[13px] font-bold bg-evolve-lavender-indigo text-white rounded-lg py-3 disabled:opacity-40 transition-opacity">
                {calendarSaving ? "saving…" : "save changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ modal: testimonials ============ */}
      {testimonialsModalOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/65 backdrop-blur-sm flex items-end sm:items-start justify-center px-0 sm:px-5 py-0 sm:py-[8vh] overflow-y-auto"
          onClick={(e) => e.target === e.currentTarget && setTestimonialsModalOpen(false)}
        >
          <div className="w-full sm:max-w-[560px] rounded-t-3xl sm:rounded-2xl border border-white/15 flex flex-col" style={{ background: "#1c1c1e", maxHeight: "88vh" }}>
            <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-evolve-lavender-indigo/15 text-evolve-lavender-indigo flex items-center justify-center flex-shrink-0">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M8 12l2.5 2.5L16 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-extrabold text-lg">{isAdmin ? "edit testimonials" : "add a testimonial"}</p>
                  <p className="text-white/40 text-xs mt-0.5">{isAdmin ? "quotes shown in the sidebar on the feed" : `share what ${org.name} meant to you`}</p>
                </div>
              </div>
              <button onClick={() => setTestimonialsModalOpen(false)} className="text-white/40 hover:text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/[0.06] flex-shrink-0">
                ×
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-5 flex flex-col gap-3">
              {isAdmin && (
                <button onClick={addTestimonialDraftRow} className="w-full text-[13px] font-bold text-evolve-lavender-indigo bg-evolve-lavender-indigo/10 hover:bg-evolve-lavender-indigo/15 rounded-xl py-3 transition-colors">
                  + add new testimonial
                </button>
              )}

              {testimonialDraft.map((r) => {
                const isSelf = r._key === "self";
                return (
                  <div key={r._key} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-3.5 relative">
                    {isAdmin && (
                      <button
                        onClick={() => removeTestimonialDraftRow(r._key, r.id)}
                        title="delete testimonial"
                        className="absolute top-3 right-3 text-white/30 hover:text-evolve-red w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/[0.06]"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                          <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                          <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    )}

                    {isAdmin && (
                      <div className="relative">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none">
                          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
                          <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                        <input
                          value={testimonialSearchKey === r._key ? testimonialSearchQuery : ""}
                          onFocus={() => setTestimonialSearchKey(r._key)}
                          onChange={(e) => {
                            setTestimonialSearchKey(r._key);
                            setTestimonialSearchQuery(e.target.value);
                          }}
                          placeholder="search a person on evolve to autofill…"
                          className="w-full bg-white/[0.05] border border-white/10 focus:border-evolve-lavender-indigo/60 text-xs text-white placeholder-white/30 outline-none rounded-lg pl-8 pr-3 py-2.5 transition-colors"
                        />
                        {testimonialSearchKey === r._key && testimonialSearchQuery.trim() && (
                          <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-10 bg-[#232325] border border-white/15 rounded-xl shadow-2xl p-1.5 max-h-[220px] overflow-y-auto">
                            {testimonialSearching && <p className="text-white/30 text-[11px] text-center py-2">searching…</p>}
                            {!testimonialSearching && testimonialSearchResults.length === 0 && <p className="text-white/25 text-[11px] text-center py-2 italic">no matches.</p>}
                            {testimonialSearchResults.map((p) => (
                              <button
                                key={p.id}
                                onClick={() => pickTestimonialPerson(r._key, p)}
                                className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.06] text-left"
                              >
                                <div className="w-7 h-7 rounded-full overflow-hidden bg-white/10 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                                  {p.avatar_url ? <img src={p.avatar_url} alt="" className="w-full h-full object-cover" /> : initialsOf(p.name)}
                                </div>
                                <span className="text-white text-xs font-semibold truncate">{p.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col items-center text-center gap-1">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center text-white text-base font-bold flex-shrink-0 overflow-hidden"
                        style={{ background: AVATAR_GRADIENTS[0] }}
                      >
                        {r.avatar_url ? <img src={r.avatar_url} alt="" className="w-full h-full object-cover" /> : initialsOf(r.name)}
                      </div>
                      {isSelf ? (
                        <p className="text-white font-bold text-sm mt-1">{r.name}</p>
                      ) : (
                        <input
                          value={r.name}
                          onChange={(e) => updateTestimonialDraftRow(r._key, { name: e.target.value })}
                          placeholder="name"
                          className="text-white font-bold text-sm text-center bg-transparent outline-none border-b border-transparent focus:border-white/20 mt-1 pb-0.5 w-full"
                        />
                      )}
                      <input
                        value={r.role}
                        onChange={(e) => updateTestimonialDraftRow(r._key, { role: e.target.value })}
                        placeholder="e.g. batch of '21 · senior designer, swiggy"
                        className="text-white/40 text-[11px] text-center bg-transparent outline-none border-b border-transparent focus:border-white/20 w-full"
                      />
                    </div>

                    <div className="pt-3 border-t border-white/10">
                      <p className="text-white/30 text-[10.5px] font-bold uppercase tracking-wide mb-2">what they said about {org.name}</p>
                      <textarea
                        rows={3}
                        value={r.quote}
                        onChange={(e) => updateTestimonialDraftRow(r._key, { quote: e.target.value })}
                        placeholder="what stood out about their time here…"
                        className={`${fieldInputCls} resize-y`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-6 py-4 border-t border-white/10 flex-shrink-0">
              <button onClick={saveTestimonials} disabled={testimonialSaving} className="w-full text-[13px] font-bold bg-evolve-lavender-indigo text-white rounded-lg py-3 disabled:opacity-40 transition-opacity">
                {testimonialSaving ? "saving…" : isAdmin ? "save changes" : "share testimonial"}
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
          <span className="w-5 h-5 rounded-full bg-evolve-inchworm/15 text-evolve-inchworm flex items-center justify-center text-xs">✓</span>
          {toast}
        </div>
      )}
    </div>
  );
}

function filteredMembersCountForRole(source, role, isInstitute) {
  return source.filter((m) => {
    if (role === "admin") return m.role === "owner" || m.role === "admin";
    return isInstitute ? m.member_type === role : m.role === "member";
  }).length;
}
