import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../hooks/useAuth";
import GrowthMascot from "../components/GrowthMascot";

const ROLE_LABEL = { owner: "owner", admin: "admin", member: "member" };

// team-tab role context — colors match the team-management mockup's
// green/purple/yellow role dots exactly (evolve-inchworm / evolve-lavender-indigo / evolve-yellow)
const ROLE_META = {
  student: { word: "student", plural: "students", text: "text-evolve-inchworm", bg: "bg-evolve-inchworm/10", dot: "bg-evolve-inchworm" },
  faculty: { word: "faculty member", plural: "faculty", text: "text-evolve-lavender-indigo", bg: "bg-evolve-lavender-indigo/10", dot: "bg-evolve-lavender-indigo" },
  admin: { word: "admin", plural: "admins", text: "text-evolve-yellow", bg: "bg-evolve-yellow/10", dot: "bg-evolve-yellow" }
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseCSV(raw) {
  const lines = raw.trim().split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const nameIdx = headers.indexOf("name");
  const emailIdx = headers.indexOf("email");
  return lines.slice(1).map((line) => {
    const vals = line.split(",").map((v) => v.trim());
    return { name: nameIdx >= 0 ? vals[nameIdx] || "" : "", email: emailIdx >= 0 ? (vals[emailIdx] || "").toLowerCase() : "" };
  });
}

const PLATFORMS = ["instagram", "linkedin", "x / twitter", "facebook", "youtube"];

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, rgba(223,5,134,1), rgba(163,91,251,1))",
  "linear-gradient(135deg, rgba(194,253,92,1), rgba(1,241,217,1))",
  "linear-gradient(135deg, rgba(255,208,7,1), rgba(235,83,40,1))",
  "linear-gradient(135deg, rgba(49,57,255,1), rgba(163,91,251,1))"
];

function yearsSince(y) {
  const n = parseInt(y, 10);
  if (!n || Number.isNaN(n)) return null;
  const diff = new Date().getFullYear() - n;
  return diff >= 0 ? diff : null;
}

function initialsOf(name) {
  return (name || "?").trim()[0]?.toUpperCase() || "?";
}

/* ── small building blocks ────────────────────────────────────────────── */

function LogoBox({ org, size = 56 }) {
  return (
    <div
      className="rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size, minWidth: size }}
    >
      {org.logo_url ? (
        <img
          src={org.logo_url}
          alt=""
          className="w-full h-full object-contain"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <span style={{ fontSize: size * 0.4 }}>{org.org_type === "institute" ? "🎓" : "🏢"}</span>
      )}
    </div>
  );
}

function SetupTag() {
  return (
    <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wide font-bold text-evolve-inchworm bg-evolve-inchworm/10 px-2 py-0.5 rounded-full ml-2 normal-case align-middle">
      ✓ from setup
    </span>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-white/30 text-[10.5px] font-bold uppercase tracking-wide">{label}</label>
      {children}
      {hint && <p className="text-white/25 text-[10.5px] text-right">{hint}</p>}
    </div>
  );
}

const fieldInputCls =
  "w-full bg-white/[0.055] border border-white/10 focus:border-evolve-lavender-indigo/60 text-sm text-white placeholder-white/25 outline-none rounded-lg px-3 py-2.5 transition-colors";

function SectionCard({ icon, iconBg, title, desc, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-start gap-3 mb-5">
        <div
          className="w-9 h-9 min-w-9 rounded-lg flex items-center justify-center"
          style={{ background: iconBg }}
        >
          {icon}
        </div>
        <div>
          <p className="text-white font-extrabold text-[15px]">{title}</p>
          <p className="text-white/30 text-xs mt-0.5 leading-snug">{desc}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function SectionFooter({ dirty, saving, onSave }) {
  return (
    <div className="flex justify-end mt-4 pt-4 border-t border-white/10">
      <button
        onClick={onSave}
        disabled={!dirty || saving}
        className={`text-xs font-bold rounded-lg px-4 py-2 border transition-colors ${
          dirty && !saving
            ? "bg-evolve-lavender-indigo text-white border-transparent"
            : "bg-white/[0.04] text-white/25 border-white/10 cursor-not-allowed"
        }`}
      >
        {saving ? "saving…" : "save changes"}
      </button>
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
            primary
              ? "bg-evolve-lavender-indigo text-white"
              : "border border-white/15 text-white/60 hover:text-white"
          }`}
        >
          {cta}
        </button>
      )}
    </div>
  );
}

function ProgressBanner({ leftCount }) {
  const pct = Math.round(((4 - leftCount) / 4) * 100);
  return (
    <div className="rounded-2xl border border-evolve-lavender-indigo/35 bg-evolve-lavender-indigo/[0.08] p-5 flex items-center gap-4">
      <div className="w-9 h-9 min-w-9 rounded-lg bg-evolve-lavender-indigo flex items-center justify-center text-white text-base">
        ✨
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-extrabold text-sm">let's finish setting up your page</p>
        <p className="text-white/40 text-xs mt-0.5">
          we've carried over what you told us when you set up this space — logo, links, awards, and your team
          are still yours to add.
        </p>
      </div>
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <span className="text-evolve-lavender-indigo text-[11px] font-bold">{leftCount} things left to add</span>
        <div className="w-[110px] h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full bg-evolve-lavender-indigo rounded-full" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

function AvatarStack({ members }) {
  const shown = members.slice(0, 4);
  const extra = members.length - shown.length;
  return (
    <div className="flex items-center">
      {shown.map((m, i) => (
        <div
          key={m.id}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold border-[2.5px] flex-shrink-0 overflow-hidden"
          style={{
            background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length],
            borderColor: "#161618",
            marginLeft: i === 0 ? 0 : -10
          }}
        >
          {m.profiles?.avatar_url ? (
            <img src={m.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            initialsOf(m.profiles?.name || m.invited_email)
          )}
        </div>
      ))}
      {extra > 0 && (
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white/50 text-[10px] font-bold border-[2.5px] bg-white/10 flex-shrink-0"
          style={{ borderColor: "#161618", marginLeft: -10 }}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}

/* icon set — matches the overview mockup's line icons */
const Icon = {
  overview: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  team: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  programs: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  ),
  spotlight: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
  updates: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M18 8A6 6 0 106 8c0 7-3 9-3 9h18s-3-2-3-9z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
};

/* ── page ─────────────────────────────────────────────────────────────── */

export default function TeamSpace() {
  const { slug } = useParams();
  const location = useLocation();
  const { user } = useAuth();

  const [org, setOrg] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [section, setSection] = useState("overview");
  const [toast, setToast] = useState(null);

  // team tab (company org invite box — kept simple, non-institute only)
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteSent, setInviteSent] = useState("");
  const [error, setError] = useState("");

  // team management (institute) — role sub-tab + search/filter + 3 add modals
  const [teamRoleTab, setTeamRoleTab] = useState("student");
  const [teamSearch, setTeamSearch] = useState("");
  const [teamStatusFilter, setTeamStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(null); // null | "one" | "csv" | "find"

  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addSubmitting, setAddSubmitting] = useState(false);

  const [csvPhase, setCsvPhase] = useState("upload"); // upload | review
  const [csvFileName, setCsvFileName] = useState("");
  const [csvRows, setCsvRows] = useState([]);
  const [csvSubmitting, setCsvSubmitting] = useState(false);

  const [findQuery, setFindQuery] = useState("");
  const [findResults, setFindResults] = useState([]);
  const [findSelected, setFindSelected] = useState(new Set());
  const [findSearching, setFindSearching] = useState(false);
  const [findSubmitting, setFindSubmitting] = useState(false);

  // editable-section drafts
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [profileDirty, setProfileDirty] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  const [aboutShort, setAboutShort] = useState("");
  const [bio, setBio] = useState("");
  const [aboutDirty, setAboutDirty] = useState(false);
  const [aboutSaving, setAboutSaving] = useState(false);

  const [links, setLinks] = useState([]);
  const [linksDirty, setLinksDirty] = useState(false);
  const [linksSaving, setLinksSaving] = useState(false);

  const [awards, setAwards] = useState([]);
  const [awardsDirty, setAwardsDirty] = useState(false);
  const [awardsSaving, setAwardsSaving] = useState(false);

  const [programmeDraft, setProgrammeDraft] = useState("");
  const [programmeDirty, setProgrammeDirty] = useState(false);
  const [programmeSaving, setProgrammeSaving] = useState(false);

  const isOwner = org && user && org.owner_id === user.id;
  const isInstitute = org?.org_type === "institute";

  const load = useCallback(async () => {
    setLoading(true);
    setNotFound(false);

    const { data: orgData, error: orgErr } = await supabase
      .from("organizations")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (orgErr || !orgData) {
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
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  // seed the editable drafts from the org row once per org (not on every
  // reload — reloads happen after invites, and shouldn't clobber in-progress edits)
  useEffect(() => {
    if (!org) return;
    setName(org.name || "");
    setWebsite(org.website || "");
    setAboutShort(org.about_short || "");
    setBio(org.bio || "");
    setLinks(org.social_links || []);
    setAwards(org.awards || []);
    setProgrammeDraft(org.programme_details || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [org?.id]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }

  async function saveProfile() {
    setProfileSaving(true);
    const { error: saveErr } = await supabase.from("organizations").update({ name, website }).eq("id", org.id);
    setProfileSaving(false);
    if (saveErr) return showToast("couldn't save — try again");
    setOrg((o) => ({ ...o, name, website }));
    setProfileDirty(false);
    showToast(`${isInstitute ? "institute" : "space"} profile saved`);
  }

  async function saveAbout() {
    setAboutSaving(true);
    const { error: saveErr } = await supabase
      .from("organizations")
      .update({ about_short: aboutShort, bio })
      .eq("id", org.id);
    setAboutSaving(false);
    if (saveErr) return showToast("couldn't save — try again");
    setOrg((o) => ({ ...o, about_short: aboutShort, bio }));
    setAboutDirty(false);
    showToast(`${isInstitute ? "about institute" : "about your space"} saved`);
  }

  async function saveLinks() {
    setLinksSaving(true);
    const { error: saveErr } = await supabase.from("organizations").update({ social_links: links }).eq("id", org.id);
    setLinksSaving(false);
    if (saveErr) return showToast("couldn't save — try again");
    setOrg((o) => ({ ...o, social_links: links }));
    setLinksDirty(false);
    showToast("social links saved");
  }

  async function saveAwards() {
    setAwardsSaving(true);
    const { error: saveErr } = await supabase.from("organizations").update({ awards }).eq("id", org.id);
    setAwardsSaving(false);
    if (saveErr) return showToast("couldn't save — try again");
    setOrg((o) => ({ ...o, awards }));
    setAwardsDirty(false);
    showToast("awards & accreditation saved");
  }

  async function saveProgramme() {
    setProgrammeSaving(true);
    const { error: saveErr } = await supabase
      .from("organizations")
      .update({ programme_details: programmeDraft })
      .eq("id", org.id);
    setProgrammeSaving(false);
    if (saveErr) return showToast("couldn't save — try again");
    setOrg((o) => ({ ...o, programme_details: programmeDraft }));
    setProgrammeDirty(false);
    showToast(`${isInstitute ? "evolve programs" : "what we do"} saved`);
  }

  function addLinkRow() {
    setLinks((l) => [...l, { platform: PLATFORMS[0], url: "" }]);
    setLinksDirty(true);
  }
  function updateLinkRow(i, patch) {
    setLinks((l) => l.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
    setLinksDirty(true);
  }
  function removeLinkRow(i) {
    setLinks((l) => l.filter((_, idx) => idx !== i));
    setLinksDirty(true);
  }

  function addAwardRow() {
    setAwards((a) => [...a, { title: "", issuer: "" }]);
    setAwardsDirty(true);
  }
  function updateAwardRow(i, patch) {
    setAwards((a) => a.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
    setAwardsDirty(true);
  }
  function removeAwardRow(i) {
    setAwards((a) => a.filter((_, idx) => idx !== i));
    setAwardsDirty(true);
  }

  async function handleInvite() {
    const email = inviteEmail.trim().toLowerCase();
    if (!email || !org) return;
    setInviting(true);
    setError("");
    setInviteSent("");

    const memberType = isInstitute ? inviteRole : null;
    const memberRole = memberType === "admin" ? "admin" : "member";

    const { data: inserted, error: inviteErr } = await supabase
      .from("organization_members")
      .insert({
        org_id: org.id,
        invited_email: email,
        invited_by: user.id,
        role: memberRole,
        member_type: memberType,
        status: "pending"
      })
      .select("invite_token")
      .single();

    if (inviteErr || !inserted) {
      setInviting(false);
      setError("couldn't send that invite — they may already be a member.");
      return;
    }

    try {
      const res = await fetch("/api/send-org-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          orgName: org.name,
          orgLogoUrl: org.logo_url,
          role: memberType || "member",
          inviterName: user.name,
          inviteLink: `${window.location.origin}/invite/${inserted.invite_token}`
        })
      });
      if (!res.ok) throw new Error("email failed");
      setInviteSent(`invite sent to ${email}`);
    } catch {
      setError("invite saved, but the email couldn't be sent — try resending later.");
    }

    setInviting(false);
    setInviteEmail("");
    load();
  }

  /* ── team management (institute): add one / csv / find on evolve ──────── */

  const existingEmails = new Set(
    members.map((m) => m.invited_email?.toLowerCase()).filter(Boolean)
  );
  const existingUserIds = new Set(members.map((m) => m.user_id).filter(Boolean));

  function openTeamModal(type) {
    setModalOpen(type);
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
    setModalOpen(null);
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
    const memberRole = teamRoleTab === "admin" ? "admin" : "member";

    const { data: inserted, error: insErr } = await supabase
      .from("organization_members")
      .insert({
        org_id: org.id,
        invited_name: addName.trim() || null,
        invited_email: email,
        invited_by: user.id,
        role: memberRole,
        member_type: teamRoleTab,
        status: "pending"
      })
      .select("invite_token")
      .single();

    setAddSubmitting(false);
    if (insErr || !inserted) {
      showToast("couldn't add them — they may already be in this space");
      return;
    }

    await sendInviteEmail(email, teamRoleTab, inserted.invite_token);
    load();
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
        return {
          name: row.name,
          email,
          alreadyMember: existingEmails.has(email),
          duplicateInFile,
          skipped: false
        };
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

  const csvReadyRows = csvRows.filter(
    (r) => !r.skipped && !r.alreadyMember && !r.duplicateInFile && EMAIL_RE.test(r.email)
  );
  const csvErrorRows = csvRows
    .map((r, i) => ({ ...r, i }))
    .filter((r) => !r.skipped && (r.alreadyMember || r.duplicateInFile || !EMAIL_RE.test(r.email)));

  async function submitCsv() {
    if (!csvReadyRows.length) return;
    setCsvSubmitting(true);
    const memberRole = teamRoleTab === "admin" ? "admin" : "member";
    const payload = csvReadyRows.map((r) => ({
      org_id: org.id,
      invited_name: r.name || null,
      invited_email: r.email,
      invited_by: user.id,
      role: memberRole,
      member_type: teamRoleTab,
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

    await Promise.allSettled(
      inserted.map((row) => sendInviteEmail(row.invited_email, teamRoleTab, row.invite_token))
    );

    setCsvSubmitting(false);
    closeTeamModal();
    load();
    showToast(`invites sent to ${inserted.length} people`);
  }

  useEffect(() => {
    if (modalOpen !== "find" || !findQuery.trim()) {
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
      const filtered = (data || []).filter(
        (p) => p.id !== org.owner_id && !existingUserIds.has(p.id)
      );
      setFindResults(filtered);
      setFindSearching(false);
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [findQuery, modalOpen]);

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
    const memberRole = teamRoleTab === "admin" ? "admin" : "member";
    const payload = selected.map((p) => ({
      org_id: org.id,
      user_id: p.id,
      invited_by: user.id,
      role: memberRole,
      member_type: teamRoleTab,
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
      });
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
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-6"
        style={{ backgroundColor: "#161618" }}
      >
        <p className="text-white font-bold text-xl">no team space here yet.</p>
        <p className="text-white/40 text-sm">the space "{slug}" hasn't been created, or you don't have access.</p>
      </div>
    );
  }

  const profileLabel = isInstitute ? "institute profile" : "space profile";
  const aboutLabel = isInstitute ? "about institute" : "about your space";
  const programsLabel = isInstitute ? "evolve programs" : "what we do";

  const activeMembers = members.filter((m) => m.status === "active");
  const adminCount = activeMembers.filter((m) => m.role === "owner" || m.role === "admin").length;
  const facultyCount = activeMembers.filter((m) => m.member_type === "faculty").length;
  const studentCount = activeMembers.filter((m) => m.member_type === "student").length;

  const needsLogo = !org.logo_url || org.logo_url.includes("s2/favicons");
  const needsLinks = !(org.social_links || []).length;
  const needsAwards = !(org.awards || []).length;
  const needsTeam = activeMembers.length <= 1;
  const leftCount = [needsLogo, needsLinks, needsAwards, needsTeam].filter(Boolean).length;
  const showSetupChrome = leftCount > 0;

  const NAV_ITEMS = [
    { id: "overview", label: "overview", icon: Icon.overview },
    { id: "team", label: "team", icon: Icon.team, count: activeMembers.length },
    { id: "programs", label: programsLabel, icon: Icon.programs },
    { id: "spotlight", label: "spotlight", icon: Icon.spotlight },
    { id: "updates", label: "updates", icon: Icon.updates }
  ];
  const sectionLabel = NAV_ITEMS.find((n) => n.id === section)?.label || "overview";

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#161618" }}>
      {/* topbar */}
      <div
        className="h-14 flex-shrink-0 border-b border-white/10 flex items-center px-5 md:px-6 gap-4 sticky top-0 z-40"
        style={{ background: "rgba(22,22,22,0.92)", backdropFilter: "blur(14px)" }}
      >
        <Link to="/" className="font-extrabold text-base tracking-tight text-white flex-shrink-0">
          evolve<span className="text-evolve-lavender-indigo">.</span>
        </Link>
        <div className="hidden sm:flex items-center gap-2 text-[12.5px] text-white/40 min-w-0">
          <span className="truncate">my spaces</span>
          <span className="text-white/20">/</span>
          <span className="truncate">{org.name}</span>
          <span className="text-white/20">/</span>
          <span className="text-white font-semibold truncate">{sectionLabel}</span>
        </div>
        <div className="ml-auto flex items-center gap-3 flex-shrink-0">
          {user?.username && (
            <Link
              to={`/profile/${user.username}`}
              title="my profile"
              className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-bold flex-shrink-0 transition-transform hover:scale-105"
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

      <div className="flex flex-1 min-h-0">
        {/* sidebar */}
        <aside
          className="hidden md:flex flex-col gap-4 w-[240px] flex-shrink-0 border-r border-white/10 px-3 py-5 sticky self-start"
          style={{ top: 56, height: "calc(100vh - 56px)" }}
        >
          <div className="flex items-center gap-2.5 px-2 pb-3.5 border-b border-white/10">
            <LogoBox org={org} size={38} />
            <div className="min-w-0">
              <p className="text-white font-extrabold text-[13px] leading-tight truncate">{org.name}</p>
              <p className="text-white/30 text-[10.5px] mt-0.5 truncate">
                {[isInstitute ? "institute" : "company", org.location].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors text-left ${
                  section === item.id
                    ? "bg-evolve-lavender-indigo/15 text-evolve-lavender-indigo font-semibold"
                    : "text-white/50 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                {item.icon}
                {item.label}
                {typeof item.count === "number" && (
                  <span
                    className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      section === item.id ? "bg-evolve-lavender-indigo/25 text-evolve-lavender-indigo" : "bg-white/[0.05] text-white/40"
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* main */}
        <main className="flex-1 min-w-0 px-5 md:px-10 py-8 pb-20 max-w-3xl mx-auto w-full flex flex-col gap-5">
          {location.state?.justCreated && (
            <div className="rounded-xl bg-evolve-inchworm/10 border border-evolve-inchworm/25 text-evolve-inchworm text-xs font-bold px-4 py-3">
              🎉 your space is live — here's how it looks. you can keep customising anytime.
            </div>
          )}
          {location.state?.justJoined && (
            <div className="rounded-xl bg-evolve-inchworm/10 border border-evolve-inchworm/25 text-evolve-inchworm text-xs font-bold px-4 py-3">
              🎉 you're in — welcome to {org.name}.
            </div>
          )}
          {isOwner && user?.username && (
            <Link
              to={`/profile/${user.username}`}
              className="text-white/40 hover:text-white/70 text-xs font-semibold transition-colors w-fit md:hidden"
            >
              ← back to my profile
            </Link>
          )}

          <h1 className="text-white font-extrabold text-[26px] tracking-tight -mb-1 capitalize">{sectionLabel}</h1>

          {/* ============ overview ============ */}
          {section === "overview" && (
            <>
              {isOwner && showSetupChrome && <ProgressBanner leftCount={leftCount} />}

              {/* profile */}
              <SectionCard
                icon={
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                      stroke="rgba(163,91,251,1)"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <path d="M9 22V12h6v10" stroke="rgba(163,91,251,1)" strokeWidth="1.8" />
                  </svg>
                }
                iconBg="rgba(163,91,251,0.14)"
                title={profileLabel}
                desc="logo, name, and the URL people know you by."
              >
                <div className="flex gap-4 items-start">
                  <LogoBox org={org} size={72} />
                  <div className="flex-1 min-w-0 flex flex-col gap-3">
                    {isOwner ? (
                      <>
                        <Field label={<>{isInstitute ? "institute" : "space"} name{showSetupChrome && <SetupTag />}</>}>
                          <input
                            value={name}
                            onChange={(e) => {
                              setName(e.target.value);
                              setProfileDirty(true);
                            }}
                            className={fieldInputCls}
                          />
                        </Field>
                        <Field label={<>website url{showSetupChrome && <SetupTag />}</>}>
                          <input
                            value={website}
                            onChange={(e) => {
                              setWebsite(e.target.value);
                              setProfileDirty(true);
                            }}
                            placeholder="https://…"
                            className={fieldInputCls}
                          />
                        </Field>
                      </>
                    ) : (
                      <>
                        <p className="text-white font-bold text-sm">{org.name}</p>
                        {org.website && (
                          <a
                            href={org.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-evolve-lavender-indigo text-xs"
                          >
                            {org.website.replace(/^https?:\/\//, "")}
                          </a>
                        )}
                      </>
                    )}
                  </div>
                </div>
                {isOwner && <SectionFooter dirty={profileDirty} saving={profileSaving} onSave={saveProfile} />}
              </SectionCard>

              {/* about */}
              <SectionCard
                icon={
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="rgba(1,241,217,1)" strokeWidth="1.8" />
                    <path d="M12 16v-5M12 8h.01" stroke="rgba(1,241,217,1)" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                }
                iconBg="rgba(1,241,217,0.12)"
                title={aboutLabel}
                desc="a short line for cards and previews, plus the fuller story for your page."
              >
                {isOwner ? (
                  <div className="flex flex-col gap-3.5">
                    <Field
                      label={<>about (short){showSetupChrome && <SetupTag />}</>}
                      hint={`${aboutShort.length}/90`}
                    >
                      <input
                        maxLength={90}
                        value={aboutShort}
                        onChange={(e) => {
                          setAboutShort(e.target.value);
                          setAboutDirty(true);
                        }}
                        placeholder="one line that shows up on cards and previews"
                        className={fieldInputCls}
                      />
                    </Field>
                    <Field label={<>description{showSetupChrome && <SetupTag />}</>}>
                      <textarea
                        rows={3}
                        value={bio}
                        onChange={(e) => {
                          setBio(e.target.value);
                          setAboutDirty(true);
                        }}
                        placeholder="the fuller story for your page"
                        className={`${fieldInputCls} resize-y`}
                      />
                    </Field>
                  </div>
                ) : (
                  <p className="text-white/60 text-sm leading-relaxed">{org.bio || "no description yet."}</p>
                )}
                {isOwner && <SectionFooter dirty={aboutDirty} saving={aboutSaving} onSave={saveAbout} />}
              </SectionCard>

              {/* social links */}
              <SectionCard
                icon={
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-1.5 1.5M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l1.5-1.5"
                      stroke="rgba(223,5,134,1)"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                }
                iconBg="rgba(223,5,134,0.12)"
                title="social links"
                desc="where people can find you beyond the website."
              >
                {links.length === 0 ? (
                  isOwner ? (
                    <EmptyBlock
                      text="no links added yet"
                      sub="add instagram, linkedin, or your own site"
                      cta="add your first link"
                      onCta={addLinkRow}
                    />
                  ) : (
                    <p className="text-white/25 text-sm italic">no links added yet.</p>
                  )
                ) : (
                  <div className="flex flex-col gap-2 mb-3">
                    {links.map((l, i) =>
                      isOwner ? (
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
                          <input
                            value={l.url}
                            onChange={(e) => updateLinkRow(i, { url: e.target.value })}
                            placeholder="paste link…"
                            className={`${fieldInputCls} flex-1`}
                          />
                          <button
                            onClick={() => removeLinkRow(i)}
                            className="text-white/30 hover:text-evolve-red w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg hover:bg-white/[0.04]"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <a
                          key={i}
                          href={/^https?:\/\//.test(l.url) ? l.url : `https://${l.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-evolve-lavender-indigo text-sm"
                        >
                          {l.platform}: {l.url}
                        </a>
                      )
                    )}
                  </div>
                )}
                {isOwner && links.length > 0 && (
                  <button onClick={addLinkRow} className="text-evolve-lavender-indigo text-xs font-semibold">
                    + add link
                  </button>
                )}
                {isOwner && <SectionFooter dirty={linksDirty} saving={linksSaving} onSave={saveLinks} />}
              </SectionCard>

              {/* awards */}
              <SectionCard
                icon={
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="6" stroke="rgba(255,208,7,1)" strokeWidth="1.8" />
                    <path d="M8.5 13.5L7 22l5-3 5 3-1.5-8.5" stroke="rgba(255,208,7,1)" strokeWidth="1.8" strokeLinejoin="round" />
                  </svg>
                }
                iconBg="rgba(255,208,7,0.12)"
                title="awards & accreditation"
                desc="recognition that builds trust with students and parents."
              >
                {awards.length === 0 ? (
                  isOwner ? (
                    <EmptyBlock
                      text="no awards added yet"
                      sub="accreditation and recognition build trust with students"
                      cta="add an award"
                      onCta={addAwardRow}
                    />
                  ) : (
                    <p className="text-white/25 text-sm italic">no awards added yet.</p>
                  )
                ) : (
                  <div className="flex flex-col gap-2 mb-3">
                    {awards.map((a, i) =>
                      isOwner ? (
                        <div key={i} className="flex items-start gap-2 bg-white/[0.03] border border-white/10 rounded-xl p-2.5">
                          <div className="flex-1 grid grid-cols-[1.4fr_1fr] gap-2">
                            <input
                              value={a.title}
                              onChange={(e) => updateAwardRow(i, { title: e.target.value })}
                              placeholder="award or accreditation title"
                              className={fieldInputCls}
                            />
                            <input
                              value={a.issuer}
                              onChange={(e) => updateAwardRow(i, { issuer: e.target.value })}
                              placeholder="issued by · year"
                              className={fieldInputCls}
                            />
                          </div>
                          <button
                            onClick={() => removeAwardRow(i)}
                            className="text-white/30 hover:text-evolve-red w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg hover:bg-white/[0.04]"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-white/5 last:border-b-0">
                          <span className="text-white font-medium">{a.title}</span>
                          <span className="text-white/30 text-xs">{a.issuer}</span>
                        </div>
                      )
                    )}
                  </div>
                )}
                {isOwner && awards.length > 0 && (
                  <button onClick={addAwardRow} className="text-evolve-lavender-indigo text-xs font-semibold">
                    + add award
                  </button>
                )}
                {isOwner && <SectionFooter dirty={awardsDirty} saving={awardsSaving} onSave={saveAwards} />}
              </SectionCard>

              {/* faculty / team summary */}
              <SectionCard
                icon={
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                      stroke="rgba(194,253,92,1)"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <circle cx="9" cy="7" r="4" stroke="rgba(194,253,92,1)" strokeWidth="1.8" />
                  </svg>
                }
                iconBg="rgba(194,253,92,0.11)"
                title={isInstitute ? "faculty & team" : "team"}
                desc="who shows up on your page as faculty and team."
              >
                {activeMembers.length <= 1 ? (
                  isOwner ? (
                    <EmptyBlock
                      text="no one added yet"
                      sub={`invites happen from the team tab${
                        org.expected_members ? ` — you told us to expect ${org.expected_members} people` : ""
                      }`}
                      cta="go to team"
                      primary
                      onCta={() => setSection("team")}
                    />
                  ) : (
                    <p className="text-white/25 text-sm italic">no team members yet.</p>
                  )
                ) : (
                  <div className="flex items-center gap-4 flex-wrap">
                    <AvatarStack members={activeMembers} />
                    <div className="flex-1 min-w-[160px]">
                      <p className="text-white font-extrabold text-[15px]">{activeMembers.length} members</p>
                      <p className="text-white/40 text-xs mt-0.5">
                        {[
                          adminCount ? `${adminCount} admin` : null,
                          facultyCount ? `${facultyCount} faculty` : null,
                          studentCount ? `${studentCount} students` : null
                        ]
                          .filter(Boolean)
                          .join(" · ") || "no role breakdown yet"}
                      </p>
                    </div>
                    <button
                      onClick={() => setSection("team")}
                      className="text-xs font-bold border border-white/15 text-white/60 hover:text-white rounded-lg px-4 py-2 transition-colors"
                    >
                      manage team →
                    </button>
                  </div>
                )}
              </SectionCard>
            </>
          )}

          {/* ============ team ============ */}
          {section === "team" && !isInstitute && (
            <div className="flex flex-col gap-4">
              {isOwner && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col gap-3">
                  <p className="text-white/30 text-[10px] font-bold uppercase tracking-wide">invite a member</p>
                  <div className="flex gap-2">
                    <input
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                      placeholder="their@email.com"
                      className="flex-1 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none border border-white/10 focus:border-evolve-yellow/50"
                      style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                    />
                    <button
                      onClick={handleInvite}
                      disabled={inviting || !inviteEmail.trim()}
                      className="bg-evolve-yellow text-evolve-black font-bold text-sm rounded-xl px-5 disabled:opacity-30"
                    >
                      {inviting ? "sending…" : "invite"}
                    </button>
                  </div>
                  {error && <p className="text-evolve-red text-xs">{error}</p>}
                  {!error && inviteSent && <p className="text-evolve-inchworm text-xs">{inviteSent}</p>}
                </div>
              )}

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col gap-1">
                <p className="text-white/30 text-[10px] font-bold uppercase tracking-wide mb-3">team</p>
                {members.length === 0 && (
                  <p className="text-white/25 text-sm italic">
                    no members yet — invite your team to fill this space with activity, spotlight, and updates.
                  </p>
                )}
                {members.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-b-0">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden">
                      {m.profiles?.avatar_url ? (
                        <img src={m.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        initialsOf(m.profiles?.name || m.invited_name || m.invited_email)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{m.profiles?.name || m.invited_name || m.invited_email}</p>
                      <p className="text-white/30 text-[11px]">
                        {[m.title || m.member_type, ROLE_LABEL[m.role], m.status].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============ team (institute) — role sub-tabs + add-one/csv/find ============ */}
          {section === "team" && isInstitute && (
            <div className="flex flex-col gap-4">
              <div className="flex gap-1 border-b border-white/10">
                {["student", "faculty", "admin"].map((r) => {
                  const count = r === "admin" ? adminCount : r === "faculty" ? facultyCount : studentCount;
                  return (
                    <button
                      key={r}
                      onClick={() => setTeamRoleTab(r)}
                      className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                        teamRoleTab === r
                          ? "text-evolve-lavender-indigo border-evolve-lavender-indigo"
                          : "text-white/40 border-transparent hover:text-white/70"
                      }`}
                    >
                      {ROLE_META[r].plural} <span className="text-white/25 text-xs ml-1">{count}</span>
                    </button>
                  );
                })}
              </div>

              {(() => {
                const tabMembers = members.filter((m) =>
                  teamRoleTab === "admin" ? m.role === "owner" || m.role === "admin" : m.member_type === teamRoleTab
                );
                const filtered = tabMembers.filter((m) => {
                  if (teamStatusFilter !== "all" && m.status !== teamStatusFilter) return false;
                  if (teamSearch.trim()) {
                    const q = teamSearch.trim().toLowerCase();
                    const hay = `${m.profiles?.name || m.invited_name || ""} ${m.invited_email || ""}`.toLowerCase();
                    if (!hay.includes(q)) return false;
                  }
                  return true;
                });

                if (tabMembers.length === 0) {
                  if (!isOwner) {
                    return <p className="text-white/25 text-sm italic">no {ROLE_META[teamRoleTab].plural} yet.</p>;
                  }
                  return (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 flex flex-col items-center text-center gap-2.5">
                      <p className="text-white font-bold text-[15px]">no {ROLE_META[teamRoleTab].plural} yet</p>
                      <p className="text-white/35 text-xs max-w-sm">
                        add {ROLE_META[teamRoleTab].plural} one by one, upload a csv, or find them if they're
                        already on evolve.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl mt-3">
                        <button
                          onClick={() => openTeamModal("one")}
                          className="text-left rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] hover:border-white/20 p-4 flex flex-col gap-2.5 transition-colors"
                        >
                          <div className="w-7 h-7 rounded-lg bg-evolve-lavender-indigo/15 text-evolve-lavender-indigo flex items-center justify-center text-sm font-bold">
                            +
                          </div>
                          <div>
                            <p className="text-white text-xs font-bold">add one by one</p>
                            <p className="text-white/35 text-[11px] mt-0.5">name, email — role is set for you</p>
                          </div>
                        </button>
                        <button
                          onClick={() => openTeamModal("csv")}
                          className="text-left rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] hover:border-white/20 p-4 flex flex-col gap-2.5 transition-colors"
                        >
                          <div className="w-7 h-7 rounded-lg bg-evolve-inchworm/15 text-evolve-inchworm flex items-center justify-center text-sm">
                            ⇧
                          </div>
                          <div>
                            <p className="text-white text-xs font-bold">upload a csv</p>
                            <p className="text-white/35 text-[11px] mt-0.5">for the whole batch</p>
                          </div>
                        </button>
                        <button
                          onClick={() => openTeamModal("find")}
                          className="text-left rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] hover:border-white/20 p-4 flex flex-col gap-2.5 transition-colors"
                        >
                          <div className="w-7 h-7 rounded-lg bg-evolve-yellow/15 text-evolve-yellow flex items-center justify-center text-sm">
                            ⌕
                          </div>
                          <div>
                            <p className="text-white text-xs font-bold">find on evolve</p>
                            <p className="text-white/35 text-[11px] mt-0.5">if they already have an account</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <>
                    {isOwner && (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => openTeamModal("one")}
                          className="text-xs font-semibold text-white/60 hover:text-white border border-white/15 rounded-lg px-3 py-2 transition-colors"
                        >
                          + add one
                        </button>
                        <button
                          onClick={() => openTeamModal("csv")}
                          className="text-xs font-semibold text-white/60 hover:text-white border border-white/15 rounded-lg px-3 py-2 transition-colors"
                        >
                          ⇧ upload csv
                        </button>
                        <button
                          onClick={() => openTeamModal("find")}
                          className="text-xs font-semibold text-white/60 hover:text-white border border-white/15 rounded-lg px-3 py-2 transition-colors"
                        >
                          ⌕ find on evolve
                        </button>
                        <input
                          value={teamSearch}
                          onChange={(e) => setTeamSearch(e.target.value)}
                          placeholder="search by name or email…"
                          className="ml-auto w-full sm:w-[220px] bg-white/[0.04] border border-white/10 text-xs text-white placeholder-white/25 rounded-lg px-3 py-2 outline-none focus:border-evolve-lavender-indigo/50"
                        />
                        <select
                          value={teamStatusFilter}
                          onChange={(e) => setTeamStatusFilter(e.target.value)}
                          className="bg-white/[0.04] border border-white/10 text-xs text-white/60 rounded-lg px-2.5 py-2 outline-none"
                        >
                          <option value="all" style={{ backgroundColor: "#1f1f22", color: "#fff" }}>
                            all statuses
                          </option>
                          <option value="active" style={{ backgroundColor: "#1f1f22", color: "#fff" }}>
                            active
                          </option>
                          <option value="pending" style={{ backgroundColor: "#1f1f22", color: "#fff" }}>
                            invited
                          </option>
                        </select>
                      </div>
                    )}

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
                      {filtered.length === 0 ? (
                        <p className="text-white/25 text-sm italic p-6">no matches.</p>
                      ) : (
                        <div className="divide-y divide-white/5">
                          {filtered.map((m, i) => (
                            <div key={m.id} className="flex items-center gap-3 px-5 py-3">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden"
                                style={{ background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length] }}
                              >
                                {m.profiles?.avatar_url ? (
                                  <img src={m.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  initialsOf(m.profiles?.name || m.invited_name || m.invited_email)
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-semibold truncate">
                                  {m.profiles?.name || m.invited_name || m.invited_email}
                                  {m.user_id === user.id && (
                                    <span className="ml-2 text-[9px] font-bold text-evolve-yellow bg-evolve-yellow/10 px-2 py-0.5 rounded-full uppercase align-middle">
                                      you
                                    </span>
                                  )}
                                </p>
                                {m.invited_email && (
                                  <p className="text-white/30 text-[11px] truncate">{m.invited_email}</p>
                                )}
                              </div>
                              <span className="text-white/40 text-xs flex-shrink-0 hidden sm:block">
                                {m.role === "owner" ? "space owner" : ROLE_META[teamRoleTab].word}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
                                  m.status === "active"
                                    ? "bg-evolve-inchworm/10 text-evolve-inchworm"
                                    : "bg-evolve-yellow/10 text-evolve-yellow"
                                }`}
                              >
                                {m.status === "active" ? "active" : "invited"}
                              </span>
                              {isOwner && m.user_id !== user.id && (
                                <button
                                  onClick={() => removeMember(m.id)}
                                  className="text-white/25 hover:text-evolve-red w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/[0.04] flex-shrink-0"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* ============ evolve programs / what we do ============ */}
          {section === "programs" && (
            <SectionCard
              icon={
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6z" stroke="rgba(255,208,7,1)" strokeWidth="1.8" strokeLinejoin="round" />
                </svg>
              }
              iconBg="rgba(255,208,7,0.12)"
              title={programsLabel}
              desc={isInstitute ? "programmes running through evolve at your institute." : "what your team is building."}
            >
              {isOwner ? (
                <>
                  <textarea
                    rows={4}
                    value={programmeDraft}
                    onChange={(e) => {
                      setProgrammeDraft(e.target.value);
                      setProgrammeDirty(true);
                    }}
                    placeholder={isInstitute ? "programmes, tracks, or what students can expect" : "what your team does"}
                    className={`${fieldInputCls} resize-y`}
                  />
                  <SectionFooter dirty={programmeDirty} saving={programmeSaving} onSave={saveProgramme} />
                </>
              ) : (
                <p className="text-white/60 text-sm leading-relaxed">
                  {org.programme_details || (isInstitute ? "no programme details added yet." : "no details added yet.")}
                </p>
              )}
              <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-5 text-center mt-4">
                <p className="text-white/40 text-sm">portfolio review for your team — coming soon.</p>
              </div>
            </SectionCard>
          )}

          {/* ============ spotlight / updates ============ */}
          {(section === "spotlight" || section === "updates") && (
            <SectionCard
              icon={Icon[section]}
              iconBg="rgba(255,255,255,0.06)"
              title={section}
              desc={section === "spotlight" ? "standout work from your community." : "news and announcements."}
            >
              <EmptyBlock text="coming soon" sub={`${section} isn't wired up yet — check back soon.`} />
            </SectionCard>
          )}
        </main>
      </div>

      {/* ============ modal: add one ============ */}
      {modalOpen === "one" && (
        <div
          className="fixed inset-0 z-[200] bg-black/65 backdrop-blur-sm flex items-start justify-center px-5 py-[8vh] overflow-y-auto"
          onClick={(e) => e.target === e.currentTarget && closeTeamModal()}
        >
          <div className="w-full max-w-[440px] rounded-2xl border border-white/15" style={{ background: "#1c1c1e" }}>
            <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4">
              <div>
                <p className="text-white font-extrabold text-lg">add a {ROLE_META[teamRoleTab].word}</p>
                <p className="text-white/40 text-xs mt-1">they'll get an email invite to join your space.</p>
              </div>
              <button
                onClick={closeTeamModal}
                className="text-white/40 hover:text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/[0.06] flex-shrink-0"
              >
                ×
              </button>
            </div>
            <div className="px-6 pb-2 flex flex-col gap-4">
              <span
                className={`inline-flex items-center gap-2 w-fit text-xs font-bold px-3 py-1.5 rounded-lg ${ROLE_META[teamRoleTab].bg} ${ROLE_META[teamRoleTab].text}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${ROLE_META[teamRoleTab].dot}`} /> adding as{" "}
                {ROLE_META[teamRoleTab].word}
              </span>
              <Field label="full name">
                <input
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="e.g. ananya sharma"
                  className={fieldInputCls}
                />
              </Field>
              <Field label="email">
                <input
                  type="email"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="name@institute.edu"
                  className={fieldInputCls}
                />
              </Field>
              {teamRoleTab === "admin" && (
                <div className="rounded-xl border border-evolve-yellow/30 bg-evolve-yellow/[0.06] p-3 flex gap-2.5">
                  <span className="text-evolve-yellow flex-shrink-0">⚠</span>
                  <p className="text-white/70 text-xs leading-relaxed">
                    <strong className="text-evolve-yellow">admins have the same rights as you</strong> — including
                    managing members and deleting this space.
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2.5 px-6 py-4 border-t border-white/10 mt-2">
              <button
                onClick={() => submitAddOne(true)}
                disabled={addSubmitting || !EMAIL_RE.test(addEmail.trim())}
                className="text-evolve-lavender-indigo text-xs font-semibold disabled:opacity-30"
              >
                + save &amp; add another
              </button>
              <span className="flex-1" />
              <button
                onClick={closeTeamModal}
                className="text-xs font-semibold text-white/50 border border-white/15 rounded-lg px-4 py-2 hover:text-white"
              >
                cancel
              </button>
              <button
                onClick={() => submitAddOne(false)}
                disabled={addSubmitting || !EMAIL_RE.test(addEmail.trim())}
                className="text-xs font-bold bg-evolve-lavender-indigo text-white rounded-lg px-4 py-2 disabled:opacity-40"
              >
                {addSubmitting ? "sending…" : "send invite"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ modal: csv upload ============ */}
      {modalOpen === "csv" && (
        <div
          className="fixed inset-0 z-[200] bg-black/65 backdrop-blur-sm flex items-start justify-center px-5 py-[8vh] overflow-y-auto"
          onClick={(e) => e.target === e.currentTarget && closeTeamModal()}
        >
          <div className="w-full max-w-[580px] rounded-2xl border border-white/15" style={{ background: "#1c1c1e" }}>
            <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4">
              <div>
                <p className="text-white font-extrabold text-lg">upload a csv · {ROLE_META[teamRoleTab].plural}</p>
                <p className="text-white/40 text-xs mt-1">
                  {csvPhase === "upload" ? "columns: name, email" : `${csvFileName} · ${csvRows.length} rows parsed`}
                </p>
              </div>
              <button
                onClick={closeTeamModal}
                className="text-white/40 hover:text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/[0.06] flex-shrink-0"
              >
                ×
              </button>
            </div>

            {csvPhase === "upload" ? (
              <div className="px-6 pb-6 flex flex-col gap-3">
                <span
                  className={`inline-flex items-center gap-2 w-fit text-xs font-bold px-3 py-1.5 rounded-lg ${ROLE_META[teamRoleTab].bg} ${ROLE_META[teamRoleTab].text}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${ROLE_META[teamRoleTab].dot}`} /> every row will be
                  added as {teamRoleTab === "admin" ? "an admin" : `a ${ROLE_META[teamRoleTab].word}`}
                </span>
                <label className="border-[1.5px] border-dashed border-white/15 hover:border-evolve-lavender-indigo/50 hover:bg-evolve-lavender-indigo/[0.04] rounded-xl py-9 px-5 text-center cursor-pointer transition-colors relative flex flex-col items-center gap-2">
                  <input type="file" accept=".csv" onChange={handleCsvFile} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <div className="w-10 h-10 rounded-xl bg-evolve-inchworm/10 text-evolve-inchworm flex items-center justify-center text-lg">
                    ⇧
                  </div>
                  <p className="text-white font-bold text-sm">drop your file here</p>
                  <p className="text-white/40 text-xs">or click to browse — accepts .csv</p>
                </label>
              </div>
            ) : (
              <div className="px-6 pb-4 flex flex-col gap-3">
                <div className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-xl p-3">
                  <div className="w-8 h-8 rounded-lg bg-evolve-inchworm/10 text-evolve-inchworm flex items-center justify-center flex-shrink-0">
                    ▤
                  </div>
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
                      <div
                        key={r.i}
                        className="bg-evolve-red/[0.06] border border-evolve-red/25 rounded-lg px-3 py-2 flex items-center gap-2.5"
                      >
                        <span className="text-white/25 text-[10px] font-bold flex-shrink-0">#{r.i + 1}</span>
                        {r.alreadyMember || r.duplicateInFile ? (
                          <>
                            <span className="text-white text-xs font-semibold truncate">{r.name || r.email}</span>
                            <span className="text-evolve-red text-[11px] flex-shrink-0">
                              {r.alreadyMember ? "already in your space" : "duplicate row"}
                            </span>
                          </>
                        ) : (
                          <input
                            value={r.email}
                            onChange={(e) => updateCsvRow(r.i, { email: e.target.value.toLowerCase() })}
                            placeholder="fix email"
                            className="flex-1 min-w-0 bg-black/25 border border-evolve-red/30 rounded-md text-xs text-white px-2 py-1.5 outline-none"
                          />
                        )}
                        <button
                          onClick={() => skipCsvRow(r.i)}
                          className="text-white/30 hover:text-white text-[11px] font-semibold flex-shrink-0 ml-auto"
                        >
                          skip
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2.5 px-6 py-4 border-t border-white/10">
              {csvPhase === "review" && (
                <span className="text-white/25 text-[11px]">fixed rows are included automatically</span>
              )}
              <span className="flex-1" />
              <button
                onClick={closeTeamModal}
                className="text-xs font-semibold text-white/50 border border-white/15 rounded-lg px-4 py-2 hover:text-white"
              >
                cancel
              </button>
              {csvPhase === "review" && (
                <button
                  onClick={submitCsv}
                  disabled={csvSubmitting || !csvReadyRows.length}
                  className="text-xs font-bold bg-evolve-lavender-indigo text-white rounded-lg px-4 py-2 disabled:opacity-40"
                >
                  {csvSubmitting ? "sending…" : `send ${csvReadyRows.length} invites`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============ modal: find on evolve ============ */}
      {modalOpen === "find" && (
        <div
          className="fixed inset-0 z-[200] bg-black/65 backdrop-blur-sm flex items-start justify-center px-5 py-[8vh] overflow-y-auto"
          onClick={(e) => e.target === e.currentTarget && closeTeamModal()}
        >
          <div className="w-full max-w-[560px] rounded-2xl border border-white/15" style={{ background: "#1c1c1e" }}>
            <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4">
              <div>
                <p className="text-white font-extrabold text-lg">find {ROLE_META[teamRoleTab].plural} on evolve</p>
                <p className="text-white/40 text-xs mt-1">
                  invite people who already have an evolve account — they accept in-app.
                </p>
              </div>
              <button
                onClick={closeTeamModal}
                className="text-white/40 hover:text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/[0.06] flex-shrink-0"
              >
                ×
              </button>
            </div>
            <div className="px-6 pb-2 flex flex-col gap-3">
              <span
                className={`inline-flex items-center gap-2 w-fit text-xs font-bold px-3 py-1.5 rounded-lg ${ROLE_META[teamRoleTab].bg} ${ROLE_META[teamRoleTab].text}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${ROLE_META[teamRoleTab].dot}`} /> selected people will
                be added as {teamRoleTab === "admin" ? "admins" : ROLE_META[teamRoleTab].plural}
              </span>
              <input
                value={findQuery}
                onChange={(e) => setFindQuery(e.target.value)}
                placeholder="search by name…"
                className={fieldInputCls}
              />

              <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto">
                {findSearching && <p className="text-white/30 text-xs text-center py-4">searching…</p>}
                {!findSearching && findQuery.trim() && findResults.length === 0 && (
                  <p className="text-white/25 text-xs text-center py-4 italic">no matches.</p>
                )}
                {findResults.map((p, i) => {
                  const sel = findSelected.has(p.id);
                  return (
                    <div
                      key={p.id}
                      onClick={() => toggleFindSelect(p.id)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                        sel
                          ? "border-evolve-lavender-indigo bg-evolve-lavender-indigo/[0.08]"
                          : "border-white/10 bg-white/[0.03] hover:border-white/20"
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
                        {p.avatar_url ? (
                          <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          initialsOf(p.name)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">
                          {p.name}{" "}
                          {p.username && <span className="text-white/30 text-[11px] font-normal">@{p.username}</span>}
                        </p>
                        {(p.persona || p.level) && (
                          <p className="text-white/35 text-[11px] mt-0.5 truncate">
                            {[p.persona, p.level].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </div>
                      <span
                        className={`text-[10.5px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${ROLE_META[teamRoleTab].bg} ${ROLE_META[teamRoleTab].text}`}
                      >
                        {teamRoleTab}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-2.5 px-6 py-4 border-t border-white/10 mt-2">
              <span className="text-white/25 text-[11px]">{findSelected.size} selected</span>
              <span className="flex-1" />
              <button
                onClick={closeTeamModal}
                className="text-xs font-semibold text-white/50 border border-white/15 rounded-lg px-4 py-2 hover:text-white"
              >
                cancel
              </button>
              <button
                onClick={submitFind}
                disabled={findSubmitting || findSelected.size === 0}
                className="text-xs font-bold bg-evolve-lavender-indigo text-white rounded-lg px-4 py-2 disabled:opacity-40"
              >
                {findSubmitting ? "adding…" : "send invites"}
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
