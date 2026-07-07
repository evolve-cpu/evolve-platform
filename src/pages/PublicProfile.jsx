import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../hooks/useAuth";
import GrowthMascot from "../components/GrowthMascot";
import BlackNav from "../components/BlackNav";

function Chip({ children }) {
  return (
    <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-evolve-lavender-indigo/15 text-evolve-lavender-indigo">
      {children}
    </span>
  );
}

function ChipRow({ label, values }) {
  if (!values || !values.length) return null;
  return (
    <div className="flex flex-col gap-2">
      <p className="text-white/30 text-[10px] font-bold uppercase tracking-wide">{label}</p>
      <div className="flex flex-wrap gap-2">
        {values.map(v => <Chip key={v}>{v}</Chip>)}
      </div>
    </div>
  );
}

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

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#161618" }}>
      <BlackNav />

      <div className="max-w-2xl mx-auto px-6 py-16 flex flex-col gap-8">
        <div className="flex flex-col items-center text-center gap-4">
          <GrowthMascot progress={card.growth_stage ?? 0} size={96} />
          <div>
            <h1 className="text-white font-bold text-2xl">{card.name || "evolve designer"}</h1>
            <p className="text-white/40 text-sm">@{username}</p>
          </div>

          {isOwner && editingBio ? (
            <textarea
              autoFocus
              value={bioDraft}
              onChange={e => setBioDraft(e.target.value)}
              onBlur={saveBio}
              rows={2}
              placeholder="add a short headline about yourself…"
              className="w-full max-w-md text-center text-sm text-white placeholder-white/30 outline-none border border-white/15 rounded-xl px-4 py-3"
              style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
            />
          ) : (
            <button
              onClick={() => isOwner && setEditingBio(true)}
              className={`text-sm max-w-md ${card.bio ? "text-white/60" : "text-white/25 italic"}`}
            >
              {card.bio || (isOwner ? "add a short headline about yourself…" : "")}
            </button>
          )}

          <button
            onClick={copyLink}
            className="text-xs font-semibold text-evolve-black bg-evolve-yellow rounded-full px-4 py-2 active:opacity-80"
          >
            {copied ? "copied!" : "share your profile"}
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-white/30 text-[10px] font-bold uppercase tracking-wide mb-1">persona</p>
              <p className="text-white text-sm">{card.persona || "—"}</p>
            </div>
            <div>
              <p className="text-white/30 text-[10px] font-bold uppercase tracking-wide mb-1">level</p>
              <p className="text-white text-sm capitalize">{card.level || "—"}</p>
            </div>
            <div>
              <p className="text-white/30 text-[10px] font-bold uppercase tracking-wide mb-1">learning method</p>
              <p className="text-white text-sm">{card.learning_method || "—"}</p>
            </div>
            <div>
              <p className="text-white/30 text-[10px] font-bold uppercase tracking-wide mb-1">kind of work</p>
              <p className="text-white text-sm">{card.work_type || "—"}</p>
            </div>
          </div>

          <ChipRow label="discipline" values={card.discipline} />
          <ChipRow label="intent" values={card.intent} />
        </div>
      </div>
    </div>
  );
}
