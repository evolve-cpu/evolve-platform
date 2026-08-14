import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../supabaseClient";
import { findFreeSlug } from "../../lib/slug";
import { emptyProfile } from "./questions";

// Seeds the chat with whatever's already on the profile — used when an
// invited member (who skipped this chat entirely to join their space) comes
// back later to fill in the rest, so they aren't asked to redo fields they
// already answered.
// checking the commit
function profileFromUser(u) {
  return {
    name: u.name || null,
    country: u.country || null,
    persona: u.persona || null,
    level: u.level || null,
    level_confidence: u.level_confidence || null,
    motivation: u.motivation || null,
    learning_method: u.learning_method || null,
    learning_modes: u.learning_modes || [],
    discipline: u.discipline || [],
    intent: u.intent || [],
    work_type: u.work_type || null,
    school_name: u.school_name || null,
    standard: u.standard || null,
    stream: u.stream || null
  };
}
import Spinner from "../../components/Spinner";
import OrgTypeStep from "./OrgTypeStep";
import InstituteAdminProfileStep from "./InstituteAdminProfileStep";
import InstituteSpaceStep from "./InstituteSpaceStep";
import ChatOnboarding from "./ChatOnboarding";
import TeamSetupStep from "./TeamSetupStep";
import SeedPlantedModal from "./SeedPlantedModal";

// Shown while handleConfirm's writes are in flight, right after the chat
// (or team-setup) finishes — between that and the seed-planted screen.
function PlantingLoader() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-8"
      style={{ backgroundColor: "#161618" }}
    >
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-evolve-yellow animate-pulse"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <div className="w-full max-w-xs mx-4 rounded-3xl border border-white/10 bg-white/[0.04] px-8 py-10 flex flex-col items-center gap-4 text-center">
        <div
          className="w-11 h-11 rounded-full animate-spin"
          style={{
            border: "4px solid rgba(255,208,7,0.2)",
            borderTopColor: "rgba(255,208,7,1)"
          }}
        />
        <p className="text-white font-bold text-base">Planting your seed…</p>
        <p className="text-white/40 text-sm">Setting up your design space</p>
      </div>
    </div>
  );
}

/**
 * Orchestrates the full post-signin onboarding. Every visitor is onboarded as
 * an individual ("myself") by default — chat Q&A → persist → seed-planted →
 * land on public profile. There's no "myself vs my team" fork to click
 * through: the only door into a team space is arriving with `fromInstitution`
 * (from the institutions marketing page's "set up your space" CTA), which
 * drops straight into the institute-vs-company choice instead:
 *   individual                        → chat Q&A → persist → seed-planted → /profile/:username
 *   fromInstitution → company/studio  → chat Q&A → team-setup (name) → persist → seed-planted → /institute/:slug
 *   fromInstitution → design institute → admin profile → institute space (link-fetch) → persist → /institute/:slug
 *
 * The institute branch (Door 2 self-serve) skips the individual persona chat
 * entirely — "are you a high schooler or career shifter" doesn't fit an
 * institute admin — and instead collects their org-facing title directly.
 */
export default function Onboarding() {
  const { user, authLoading, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // sign-in and onboarding are coupled — every fresh sign-in lands here. A
  // visitor who just wanted to browse and signed in by mistake needs a way
  // out that isn't "close the tab and never come back", so this is reachable
  // from every step (including the chat, which hides profileChip).
  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  // signed-out visitors have no business here — send them to sign in first,
  // bounce back to /onboarding once they do
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/signin", { replace: true, state: { from: "/onboarding" } });
    }
  }, [authLoading, user, navigate]);

  // "complete your profile" from an invited member's profile page — they
  // already have a space (joined via invite, skipping this chat entirely),
  // so jump straight to the persona chat.
  const completingProfile = !!location.state?.completeProfile;
  // arriving via the "set up your space" CTA on the institutions marketing
  // page — the only door into a team space. Everyone else, regardless of
  // where they came from (portfolio review, the designers funnel, the nav
  // "complete your profile" CTA, ...), is onboarded as an individual by
  // default — there's no "myself vs for my team" choice to click through.
  const fromInstitution = !!location.state?.fromInstitution;

  const [step, setStep] = useState(fromInstitution ? "org-type" : "chat");
  // org-type | inst-profile | inst-space | submitting-inst
  // | chat | team-setup | submitting | planted | submit-error
  const [spaceType, setSpaceType] = useState(
    fromInstitution ? "team" : "individual"
  );
  const [orgType, setOrgType] = useState(null);
  const [chatProfile, setChatProfile] = useState(null);
  const [plantedNav, setPlantedNav] = useState(null);
  const [orgDraft, setOrgDraft] = useState(null);
  const [instProfile, setInstProfile] = useState(null);
  const [instSpaceDraft, setInstSpaceDraft] = useState(null);
  const [error, setError] = useState("");

  function handleOrgType(value) {
    setOrgType(value);
    setStep(value === "institute" ? "inst-profile" : "chat");
  }

  function handleInstProfile(draft) {
    setInstProfile(draft);
    setStep("inst-space");
  }

  // The chat is the last thing the person actually fills in — there's no
  // separate "review your answers" screen to click through afterward, so an
  // individual profile saves immediately and a team space moves on to naming
  // the space before it saves.
  function handleChatComplete(profile) {
    setChatProfile(profile);
    if (spaceType === "team") {
      setStep("team-setup");
    } else {
      handleConfirm(profile);
    }
  }

  function handleTeamSetup(draft) {
    setOrgDraft(draft);
    handleConfirm(chatProfile, draft);
  }

  async function handleInstituteConfirm(spaceDraft) {
    if (!user || !instProfile) return;
    setInstSpaceDraft(spaceDraft);
    setStep("submitting-inst");
    setError("");
    try {
      const fullName =
        `${instProfile.firstName} ${instProfile.lastName}`.trim();
      const username =
        user.username ||
        (await findFreeSlug(
          supabase,
          "profile_cards",
          "username",
          fullName || user.name || user.email
        ));

      const { error: profileErr } = await supabase
        .from("profiles")
        .update({
          username,
          name: fullName,
          portfolio_url: instProfile.portfolio || null,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          growth_stage: 10
        })
        .eq("id", user.id);
      if (profileErr) throw profileErr;

      const orgSlug = await findFreeSlug(
        supabase,
        "organizations",
        "slug",
        spaceDraft.spaceName
      );
      const { data: org, error: orgErr } = await supabase
        .from("organizations")
        .insert({
          owner_id: user.id,
          name: spaceDraft.spaceName,
          slug: orgSlug,
          org_type: "institute",
          website: spaceDraft.website || null,
          logo_url: spaceDraft.logoUrl || null,
          bio: spaceDraft.bio || null,
          location: spaceDraft.location || null,
          year_founded: spaceDraft.yearFounded || null,
          setup_mode: spaceDraft.mode || null,
          expected_members: spaceDraft.members || null,
          programme_details: spaceDraft.programmeDetails || null,
          source_url: spaceDraft.sourceUrl || null,
          social_links: spaceDraft.socialLinks || [],
          awards: spaceDraft.awards || []
        })
        .select()
        .single();
      if (orgErr) throw orgErr;

      const { error: memberErr } = await supabase
        .from("organization_members")
        .insert({
          org_id: org.id,
          user_id: user.id,
          role: "owner",
          status: "active",
          title: instProfile.roleLabel || null
        });
      if (memberErr) throw memberErr;

      // seed content pulled from the institute's own site during step 2 —
      // best-effort: the space itself is already live at this point, so a
      // failure here shouldn't block onboarding, just leave the space with
      // less to look at on day one
      try {
        if (spaceDraft.seedEvents?.length) {
          await supabase.from("org_events").insert(
            spaceDraft.seedEvents.map((e) => ({
              org_id: org.id,
              title: e.title,
              event_date: e.date,
              meta: e.meta || null,
              type: ["exam", "event", "deadline", "result"].includes(e.type)
                ? e.type
                : "event",
              audience: "open"
            }))
          );
        }
        if (spaceDraft.seedTestimonials?.length) {
          await supabase.from("org_testimonials").insert(
            spaceDraft.seedTestimonials.map((t) => ({
              org_id: org.id,
              quote: t.quote,
              name: t.name,
              role: t.role || null
            }))
          );
        }
        if (spaceDraft.seedPosts?.length) {
          await supabase.from("org_updates").insert(
            spaceDraft.seedPosts.map((p) => ({
              org_id: org.id,
              author_id: user.id,
              title: p.title,
              description: p.description || null,
              // prefer the specific link Gemini found for this post (points
              // straight at the actual article/announcement); fall back to
              // the institute's homepage — spaceDraft.website always carries
              // a protocol (sourceUrl is the raw, possibly bare domain the
              // admin typed), so it's a real clickable URL either way
              source_url: p.url || spaceDraft.website || null,
              status: "live",
              published_at: new Date().toISOString()
            }))
          );
        }
      } catch {
        // seed content is a nice-to-have, not worth failing onboarding over
      }

      await refreshUser();
      setPlantedNav({
        path: `/institute/${orgSlug}`,
        state: { justCreated: true }
      });
      setStep("planted");
    } catch (e) {
      setError(
        e.message ||
          "something went wrong setting up your space. please try again."
      );
      setStep("inst-space");
    }
  }

  // `orgDraftParam` lets the team flow hand off its just-picked draft
  // directly, since calling this straight out of handleTeamSetup means the
  // `orgDraft` state set a moment earlier hasn't necessarily flushed yet.
  async function handleConfirm(finalProfile, orgDraftParam) {
    if (!user) return;
    const draft = orgDraftParam || orgDraft;
    setStep("submitting");
    setError("");
    try {
      const username =
        user.username ||
        (await findFreeSlug(
          supabase,
          "profile_cards",
          "username",
          finalProfile.name || user.name || user.email
        ));

      const { error: profileErr } = await supabase
        .from("profiles")
        .update({
          username,
          name: finalProfile.name,
          country: finalProfile.country,
          persona: finalProfile.persona,
          level: finalProfile.level,
          level_confidence: finalProfile.level_confidence,
          motivation: finalProfile.motivation,
          learning_method: finalProfile.learning_method,
          learning_modes: finalProfile.learning_modes || [],
          discipline: finalProfile.discipline || [],
          intent: finalProfile.intent || [],
          work_type: finalProfile.work_type,
          school_name: finalProfile.school_name,
          standard: finalProfile.standard,
          stream: finalProfile.stream,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          growth_stage: 10
        })
        .eq("id", user.id);

      if (profileErr) throw profileErr;

      let orgSlug = null;
      if (spaceType === "team" && draft) {
        orgSlug = await findFreeSlug(
          supabase,
          "organizations",
          "slug",
          draft.name
        );
        const { data: org, error: orgErr } = await supabase
          .from("organizations")
          .insert({
            owner_id: user.id,
            name: draft.name,
            slug: orgSlug,
            org_type: draft.org_type
          })
          .select()
          .single();
        if (orgErr) throw orgErr;

        const { error: memberErr } = await supabase
          .from("organization_members")
          .insert({
            org_id: org.id,
            user_id: user.id,
            role: "owner",
            status: "active"
          });
        if (memberErr) throw memberErr;
      }

      await refreshUser();

      // always land on the profile page (or the new org space) once
      // onboarding finishes — never back on whatever page they signed in from
      if (orgSlug) {
        setPlantedNav({
          path: `/institute/${orgSlug}`,
          state: { justCreated: true }
        });
      } else {
        setPlantedNav({ path: `/profile/${username}` });
      }
      setStep("planted");
    } catch (e) {
      setError(
        e.message ||
          "something went wrong saving your profile. please try again."
      );
      setStep("submit-error");
    }
  }

  function handlePlantedContinue() {
    if (!plantedNav) return;
    navigate(plantedNav.path, { replace: true, state: plantedNav.state });
  }

  if (authLoading || !user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#161618" }}
      >
        <Spinner size={40} />
      </div>
    );
  }

  // once signed in, a small "who you're signed in as" chip sits top-left
  // through every step of onboarding — it's not a link until a profile
  // page actually exists for them (username is set on final confirm)
  const profileChip = (
    <Link
      to={user.username ? `/profile/${user.username}` : "#"}
      className="fixed top-5 left-5 z-50 flex items-center gap-2 rounded-full pl-1.5 pr-4 py-1.5 border border-white/10 transition-colors hover:border-white/25"
      style={{
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(10px)",
        pointerEvents: user.username ? "auto" : "none"
      }}
    >
      <div className="w-7 h-7 rounded-full overflow-hidden bg-white/10 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          (user.name || user.email || "?")[0].toUpperCase()
        )}
      </div>
      <span className="text-white/70 text-xs font-semibold truncate max-w-[160px]">
        {user.name || user.email}
      </span>
    </Link>
  );

  let content = null;

  if (step === "org-type") {
    // org-type is only ever reached via the institutions page's "set up
    // your space" CTA, so backing out of it goes back there.
    content = (
      <OrgTypeStep
        onBack={() => navigate("/institutions")}
        onContinue={handleOrgType}
      />
    );
  } else if (step === "inst-profile") {
    content = (
      <InstituteAdminProfileStep
        initial={
          instProfile ||
          (user.name
            ? {
                firstName: user.name.split(" ")[0] || "",
                lastName: user.name.split(" ").slice(1).join(" ") || ""
              }
            : null)
        }
        onBack={() => setStep("org-type")}
        onContinue={handleInstProfile}
      />
    );
  } else if (step === "inst-space" || step === "submitting-inst") {
    content = (
      <InstituteSpaceStep
        initial={instSpaceDraft}
        onBack={() => setStep("inst-profile")}
        onSubmit={handleInstituteConfirm}
        submitting={step === "submitting-inst"}
        error={error}
      />
    );
  } else if (step === "chat") {
    content = (
      <ChatOnboarding
        initialProfile={
          completingProfile
            ? profileFromUser(user)
            : { ...emptyProfile(), name: user.name || null }
        }
        onComplete={handleChatComplete}
      />
    );
  } else if (step === "team-setup") {
    content = (
      <TeamSetupStep
        onBack={() => setStep("chat")}
        onContinue={handleTeamSetup}
        presetOrgType={orgType || "company"}
      />
    );
  } else if (step === "submitting") {
    content = <PlantingLoader />;
  } else if (step === "planted") {
    content = (
      <SeedPlantedModal
        onContinue={handlePlantedContinue}
        spaceName={orgDraft?.name}
      />
    );
  } else if (step === "submit-error") {
    content = (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-5 px-6 text-center"
        style={{ backgroundColor: "#161618" }}
      >
        <p className="text-white font-bold text-lg">Something went wrong</p>
        <p className="text-white/50 text-sm max-w-xs">{error}</p>
        <button
          onClick={() => handleConfirm(chatProfile, orgDraft)}
          className="bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl px-6 py-3.5 active:opacity-80 transition-opacity"
        >
          Try again →
        </button>
      </div>
    );
  }

  return (
    <>
      {/* hidden during the chat step — the name/avatar pill is redundant
          clutter while the chat itself is asking for that same info */}
      {step !== "chat" && profileChip}
      {/* always visible, every step — the "wrong account / just browsing"
          escape hatch out of onboarding */}
      <button
        onClick={handleLogout}
        className="fixed top-5 right-5 z-50 flex items-center gap-1.5 rounded-full px-4 py-1.5 border border-white/10 text-white/60 text-xs font-semibold transition-colors hover:border-white/25 hover:text-white/90"
        style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)" }}
      >
        Log out
      </button>
      {content}
    </>
  );
}
