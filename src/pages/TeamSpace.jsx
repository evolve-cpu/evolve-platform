import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../hooks/useAuth";
import BlackNav from "../components/BlackNav";
import GrowthMascot from "../components/GrowthMascot";

const ROLE_LABEL = { owner: "owner", admin: "admin", member: "member" };

export default function TeamSpace() {
  const { slug } = useParams();
  const { user } = useAuth();

  const [org, setOrg] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState("");

  const isOwner = org && user && org.owner_id === user.id;

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

  useEffect(() => { load(); }, [load]);

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
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-6" style={{ backgroundColor: "#161618" }}>
        <p className="text-white font-bold text-xl">no team space here yet.</p>
        <p className="text-white/40 text-sm">the space "{slug}" hasn't been created.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#161618" }}>
      <BlackNav />

      <div className="max-w-2xl mx-auto px-6 py-16 flex flex-col gap-8">
        <div className="flex flex-col items-center text-center gap-3">
          <span className="text-3xl">{org.org_type === "institute" ? "🎓" : "🏢"}</span>
          <h1 className="text-white font-bold text-2xl">{org.name}</h1>
          <p className="text-white/40 text-xs uppercase tracking-wide font-semibold">{org.org_type} space</p>
        </div>

        {isOwner && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col gap-3">
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-wide">invite a member</p>
            <div className="flex gap-2">
              <input
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleInvite()}
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
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-wide mb-3">members</p>
          {members.length === 0 && <p className="text-white/25 text-sm italic">no members yet.</p>}
          {members.map(m => (
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
                <p className="text-white/30 text-[11px]">{ROLE_LABEL[m.role]} · {m.status}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-6 text-center">
          <p className="text-white/40 text-sm">portfolio review for your team — coming soon.</p>
        </div>
      </div>
    </div>
  );
}
