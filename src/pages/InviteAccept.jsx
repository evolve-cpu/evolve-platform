import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../hooks/useAuth";
import { findFreeSlug } from "../lib/slug";
import AuthModal from "../components/AuthModal";
import GrowthMascot from "../components/GrowthMascot";

const ROLE_COPY = {
  student: { pill: "🎓 student", title: "you're invited as a student." },
  faculty: { pill: "📚 faculty", title: "you're invited as faculty." },
  admin: { pill: "🛠️ admin", title: "you're invited as an admin." },
  member: { pill: "👋 team member", title: "you're invited to join the team." }
};

// Short, role-specific questions — a scoped-down version of the phased
// chat Q&A: fewer steps, same idea (institution-verified info stays
// locked, personal context is collected and stays editable on review).
const INTAKE_FIELDS = {
  student: [
    { key: "program", label: "program / course", placeholder: "e.g. B.Des Communication Design" },
    { key: "yearLevel", label: "year / level", placeholder: "e.g. 3rd year" },
    { key: "interests", label: "interests", placeholder: "e.g. branding, motion, UX (comma separated)" }
  ],
  faculty: [
    { key: "department", label: "department", placeholder: "e.g. Design" },
    { key: "subjects", label: "subjects you teach", placeholder: "e.g. Visual Communication, Typography" },
    { key: "expertise", label: "areas of expertise", placeholder: "e.g. branding, UX research" }
  ],
  admin: [
    { key: "department", label: "department", placeholder: "e.g. Administration" },
    { key: "responsibilities", label: "your responsibilities", placeholder: "e.g. placements, student records" }
  ]
};

const inputCls =
  "w-full border rounded-2xl px-5 py-4 text-white placeholder-white/30 text-base outline-none focus:border-evolve-yellow/60 border-white/15 transition-colors";
const inputStyle = { backgroundColor: "rgba(255,255,255,0.06)" };

function Screen({ children }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
      style={{ backgroundColor: "#161618" }}
    >
      <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-6 text-center">{children}</div>
    </div>
  );
}

export default function InviteAccept() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [phase, setPhase] = useState("loading"); // loading | notFound | landing | intake | review | submitting
  const [invite, setInvite] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setPhase("loading");
    const { data, error: rpcErr } = await supabase
      .rpc("get_invite_by_token", { p_token: token })
      .maybeSingle();
    if (rpcErr || !data) {
      setPhase("notFound");
      return;
    }
    setInvite(data);
    setPhase("landing");
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const roleKey = invite?.member_type || (invite?.role === "admin" ? "admin" : "member");
  const copy = ROLE_COPY[roleKey] || ROLE_COPY.member;
  const fields = INTAKE_FIELDS[roleKey] || null;

  const emailMatches =
    user && invite?.invited_email
      ? user.email?.toLowerCase() === invite.invited_email.toLowerCase()
      : !!user;

  function handleAcceptClick() {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    if (!emailMatches) return;
    if (fields) {
      setPhase("intake");
    } else {
      submitAccept(null);
    }
  }

  function handleIntakeContinue() {
    setPhase("review");
  }

  async function submitAccept(intake) {
    setPhase("submitting");
    setError("");
    const { data, error: acceptErr } = await supabase
      .rpc("accept_org_invite", { p_token: token, p_intake: intake })
      .maybeSingle();
    if (acceptErr || !data?.org_slug) {
      setError(acceptErr?.message || "couldn't accept this invite. try again.");
      setPhase(fields ? "review" : "landing");
      return;
    }

    // Invited members skip the usual individual chat onboarding entirely —
    // so unless they already had a profile from before, they've never been
    // given a username or been marked onboarded. Finish that here so they
    // land on a real profile page instead of a dead /profile/undefined link.
    let username = user.username;
    if (!username) {
      username = await findFreeSlug(supabase, "profile_cards", "username", user.name || user.email);
      await supabase
        .from("profiles")
        .update({
          username,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          growth_stage: user.growth_stage || 25
        })
        .eq("id", user.id);
      await refreshUser();
    }

    navigate(`/profile/${username}`, { replace: true, state: { justJoinedOrg: invite.org_name } });
  }

  if (phase === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#161618" }}>
        <GrowthMascot progress={10} size={56} />
      </div>
    );
  }

  if (phase === "notFound") {
    return (
      <Screen>
        <p className="text-white font-bold text-xl">this invite link isn't valid.</p>
        <p className="text-white/40 text-sm">it may have expired, or already been used.</p>
      </Screen>
    );
  }

  if (invite.status === "active") {
    return (
      <Screen>
        <p className="text-white font-bold text-xl">this invite has already been accepted.</p>
        <button
          onClick={() => navigate(`/institute/${invite.org_slug}`)}
          className="bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl px-6 py-3.5 active:scale-[0.98] transition-transform"
        >
          go to {invite.org_name} →
        </button>
      </Screen>
    );
  }

  if (phase === "landing") {
    return (
      <>
        <Screen>
          <div
            className="rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0"
            style={{ width: 64, height: 64 }}
          >
            {invite.org_logo_url ? (
              <img src={invite.org_logo_url} alt="" className="w-full h-full object-contain" />
            ) : (
              <span className="text-3xl">{invite.org_type === "institute" ? "🎓" : "🏢"}</span>
            )}
          </div>

          <p className="text-evolve-yellow text-xs font-bold tracking-widest uppercase">{copy.pill}</p>
          <h1 className="text-white font-bold text-3xl md:text-4xl leading-tight">{copy.title}</h1>
          <p className="text-white/50 text-sm max-w-sm">
            <span className="text-white font-semibold">{invite.org_name}</span> has invited you to join their
            space on evolve.
          </p>

          {invite.inviter_name && (
            <div className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left">
              <p className="text-white/30 text-[10px] font-bold uppercase tracking-wide">invited by</p>
              <p className="text-white text-sm font-semibold mt-0.5">{invite.inviter_name}</p>
            </div>
          )}

          <div className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 text-left flex flex-col gap-2">
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-wide">
              from {invite.org_name} — verified, locked
            </p>
            {[
              ["space", invite.org_name],
              ["location", invite.org_location],
              ["type", invite.org_type]
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between text-sm">
                <span className="text-white/40">{k}</span>
                <span className="text-white font-medium">{v || "—"}</span>
              </div>
            ))}
            <a
              href="mailto:contact@evolvedesign.academy"
              className="text-white/25 text-[11px] hover:text-white/50 transition-colors mt-1"
            >
              doesn't look right? flag it
            </a>
          </div>

          {user && !emailMatches && (
            <p className="text-evolve-red text-xs">
              you're signed in as {user.email}, but this invite was sent to {invite.invited_email}. sign in with
              that email to accept.
            </p>
          )}

          <button
            onClick={handleAcceptClick}
            disabled={user && !emailMatches}
            className="w-full bg-evolve-yellow text-evolve-black font-bold text-base rounded-2xl py-4 transition-opacity active:scale-[0.98] disabled:opacity-40"
          >
            {user ? "accept & continue →" : "sign in to accept →"}
          </button>
        </Screen>
        <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} user={user} />
      </>
    );
  }

  if (phase === "intake" && fields) {
    return (
      <Screen>
        <p className="text-evolve-yellow text-xs font-bold tracking-widest uppercase">{copy.pill} · a few quick questions</p>
        <h1 className="text-white font-bold text-2xl md:text-3xl leading-tight">tell {invite.org_name} about you.</h1>
        <div className="w-full flex flex-col gap-4 mt-2 text-left">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="text-white/40 text-xs font-semibold uppercase tracking-wide mb-2 block">
                {f.label}
              </label>
              <input
                value={answers[f.key] || ""}
                onChange={(e) => setAnswers((a) => ({ ...a, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className={inputCls}
                style={inputStyle}
              />
            </div>
          ))}
        </div>
        <div className="w-full flex gap-3 mt-2">
          <button
            onClick={() => setPhase("landing")}
            className="flex-1 border border-white/20 text-white font-semibold text-sm rounded-2xl py-4 active:opacity-80"
          >
            back
          </button>
          <button
            onClick={handleIntakeContinue}
            className="flex-[2] bg-evolve-yellow text-evolve-black font-bold text-base rounded-2xl py-4 transition-opacity active:scale-[0.98]"
          >
            continue →
          </button>
        </div>
      </Screen>
    );
  }

  if (phase === "review" || phase === "submitting") {
    return (
      <Screen>
        <p className="text-evolve-yellow text-xs font-bold tracking-widest uppercase">review · almost there</p>
        <h1 className="text-white font-bold text-2xl md:text-3xl leading-tight">looks good?</h1>

        <div className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 text-left flex flex-col gap-2">
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-wide">
            from {invite.org_name} — locked
          </p>
          {[
            ["space", invite.org_name],
            ["role", roleKey]
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between text-sm">
              <span className="text-white/40">{k}</span>
              <span className="text-white font-medium capitalize">{v || "—"}</span>
            </div>
          ))}
        </div>

        {fields && (
          <div className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 text-left flex flex-col gap-2">
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-wide">your answers</p>
            {fields.map((f) => (
              <div key={f.key} className="flex items-center justify-between text-sm gap-4">
                <span className="text-white/40 flex-shrink-0">{f.label}</span>
                <span className="text-white font-medium text-right truncate">{answers[f.key] || "—"}</span>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-evolve-red text-xs">{error}</p>}

        <div className="w-full flex gap-3 mt-2">
          <button
            onClick={() => setPhase(fields ? "intake" : "landing")}
            className="flex-1 border border-white/20 text-white font-semibold text-sm rounded-2xl py-4 active:opacity-80"
          >
            back
          </button>
          <button
            onClick={() => submitAccept(fields ? answers : null)}
            disabled={phase === "submitting"}
            className="flex-[2] bg-evolve-yellow text-evolve-black font-bold text-base rounded-2xl py-4 transition-opacity active:scale-[0.98] disabled:opacity-60"
          >
            {phase === "submitting" ? "joining…" : "confirm & enter my space →"}
          </button>
        </div>
      </Screen>
    );
  }

  return null;
}
