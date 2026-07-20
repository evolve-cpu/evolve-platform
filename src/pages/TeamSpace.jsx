import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../hooks/useAuth";
import BlackNav from "../components/BlackNav";
import GrowthMascot from "../components/GrowthMascot";

const ROLE_LABEL = { owner: "owner", admin: "admin", member: "member" };

function yearsSince(y) {
  const n = parseInt(y, 10);
  if (!n || Number.isNaN(n)) return null;
  const diff = new Date().getFullYear() - n;
  return diff >= 0 ? diff : null;
}

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
        <span className="text-2xl">{org.org_type === "institute" ? "🎓" : "🏢"}</span>
      )}
    </div>
  );
}

function Chip({ children }) {
  return (
    <span className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-evolve-lavender-indigo/15 text-evolve-lavender-indigo">
      {children}
    </span>
  );
}

function StatTile({ value, label }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] py-3 px-2 text-center">
      <p className="text-white font-bold text-base">{value}</p>
      <p className="text-white/30 text-[9.5px] uppercase tracking-wide mt-1">{label}</p>
    </div>
  );
}

export default function TeamSpace() {
  const { slug } = useParams();
  const location = useLocation();
  const { user } = useAuth();

  const [org, setOrg] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [tab, setTab] = useState("about");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState("");

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

  async function handleInvite() {
    const email = inviteEmail.trim().toLowerCase();
    if (!email || !org) return;
    setInviting(true);
    setError("");
    const { error: inviteErr } = await supabase
      .from("organization_members")
      .insert({ org_id: org.id, invited_email: email, role: "member", status: "pending" });
    setInviting(false);
    if (inviteErr) {
      setError("couldn't send that invite — they may already be a member.");
      return;
    }
    setInviteEmail("");
    load();
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
        <p className="text-white/40 text-sm">the space "{slug}" hasn't been created.</p>
      </div>
    );
  }

  const communityLabel = isInstitute ? "faculty & students" : "team";
  const detailsLabel = isInstitute ? "programmes" : "what we do";
  const yrs = yearsSince(org.year_founded);

  const TABS = [
    { id: "about", label: "about" },
    { id: "community", label: communityLabel },
    { id: "details", label: detailsLabel }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#161618" }}>
      <BlackNav />

      <div className="max-w-2xl mx-auto px-6 pt-24 pb-16 flex flex-col gap-6">
        {location.state?.justCreated && (
          <div className="rounded-xl bg-evolve-inchworm/10 border border-evolve-inchworm/25 text-evolve-inchworm text-xs font-bold px-4 py-3">
            🎉 your space is live — here's how it looks. you can keep customising anytime.
          </div>
        )}

        {/* hero */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center gap-3 mb-3">
            <LogoBox org={org} />
            <div className="min-w-0">
              <h1 className="text-white font-bold text-lg truncate">{org.name}</h1>
              <p className="text-white/40 text-xs mt-0.5">
                {org.location || "location not set"}
                {org.website && (
                  <>
                    {" "}
                    ·{" "}
                    <a
                      href={org.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-evolve-lavender-indigo"
                    >
                      {org.website.replace(/^https?:\/\//, "")}
                    </a>
                  </>
                )}
              </p>
            </div>
          </div>
          {org.bio && <p className="text-white/60 text-sm leading-relaxed mb-3">{org.bio}</p>}
          <div className="flex flex-wrap gap-2">
            <Chip>{org.org_type} space</Chip>
            {org.setup_mode && <Chip>{org.setup_mode}</Chip>}
          </div>
        </div>

        {/* stats */}
        <div className="grid grid-cols-4 gap-2">
          <StatTile value={yrs !== null ? `${yrs} yrs` : "—"} label="established" />
          <StatTile value={org.expected_members || "—"} label="spots reserved" />
          <StatTile value={members.length} label={isInstitute ? "faculty" : "members"} />
          <StatTile value="0" label={isInstitute ? "programmes live" : "projects live"} />
        </div>

        {/* tabs */}
        <div className="flex gap-5 border-b border-white/10">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
                tab === t.id
                  ? "text-evolve-lavender-indigo border-evolve-lavender-indigo"
                  : "text-white/40 border-transparent hover:text-white/70"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* about */}
        {tab === "about" && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col gap-1">
            <p className="text-white/60 text-sm leading-relaxed mb-3">
              {org.bio || "no bio added yet."}
            </p>
            {[
              ["location", org.location],
              ["established", org.year_founded],
              [isInstitute ? "programme setup" : "company type", org.setup_mode],
              ["source link", org.source_url]
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-b-0">
                <span className="text-white/30 text-xs uppercase tracking-wide">{k}</span>
                <span className="text-white text-sm font-semibold truncate max-w-[60%] text-right">
                  {v || "—"}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* community */}
        {tab === "community" && (
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
                    invite
                  </button>
                </div>
                {error && <p className="text-evolve-red text-xs">{error}</p>}
              </div>
            )}

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col gap-1">
              <p className="text-white/30 text-[10px] font-bold uppercase tracking-wide mb-3">
                {communityLabel}
              </p>
              {members.length === 0 && (
                <p className="text-white/25 text-sm italic">
                  no members yet — invite {isInstitute ? "faculty & staff" : "your team"} to fill this space
                  with activity, spotlight, and updates.
                </p>
              )}
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-b-0">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden">
                    {m.profiles?.avatar_url ? (
                      <img src={m.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (m.profiles?.name || m.invited_email || "?")[0].toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{m.profiles?.name || m.invited_email}</p>
                    <p className="text-white/30 text-[11px]">
                      {[m.title, ROLE_LABEL[m.role], m.status].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* details */}
        {tab === "details" && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col gap-4">
            <p className="text-white/60 text-sm leading-relaxed">
              {org.programme_details ||
                (isInstitute ? "no programme details added yet." : "no details added yet.")}
            </p>
            <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-5 text-center">
              <p className="text-white/40 text-sm">portfolio review for your team — coming soon.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
