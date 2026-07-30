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
    work_type: u.work_type || null
  };
}
import GrowthMascot from "../../components/GrowthMascot";
import SpaceTypeStep from "./SpaceTypeStep";
import OrgTypeStep from "./OrgTypeStep";
import InstituteAdminProfileStep from "./InstituteAdminProfileStep";
import InstituteSpaceStep from "./InstituteSpaceStep";
import ChatOnboarding from "./ChatOnboarding";
import TeamSetupStep from "./TeamSetupStep";
import ReviewStep from "./ReviewStep";

/**
 * Orchestrates the full post-signin onboarding. Three shapes branch off the
 * initial space-type choice:
 *   individual        → chat Q&A → review → persist → land on public profile
 *   team → company     → chat Q&A → team-setup (name) → review → persist → /institute/:slug
 *   team → institute    → admin profile → institute space (link-fetch) → persist → /institute/:slug
 *
 * The institute branch (Door 2 self-serve) skips the individual persona chat
 * entirely — "are you a high schooler or career shifter" doesn't fit an
 * institute admin — and instead collects their org-facing title directly.
 */
export default function Onboarding() {
  const { user, authLoading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // signed-out visitors have no business here — send them to sign in first,
  // bounce back to /onboarding once they do
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/signin", { replace: true, state: { from: "/onboarding" } });
    }
  }, [authLoading, user, navigate]);

  // "complete your profile" from an invited member's profile page — they
  // already have a space (joined via invite, skipping this chat entirely),
  // so jump straight to the persona chat instead of asking space-type again.
  const completingProfile = !!location.state?.completeProfile;
  // arriving via the "set up your space" CTA on the institutions marketing
  // page — that visitor is unambiguously setting up a team space, so the
  // "myself" vs "for my team" fork is pointless friction; drop them straight
  // on the team sub-choice (design institute vs company/studio).
  const fromInstitution = !!location.state?.fromInstitution;

  const [step, setStep] = useState(
    completingProfile ? "chat" : fromInstitution ? "org-type" : "space-type"
  );
  // space-type | org-type | inst-profile | inst-space | submitting-inst
  // | chat | team-setup | review | submitting
  const [spaceType, setSpaceType] = useState(fromInstitution ? "team" : "individual");
  const [orgType, setOrgType] = useState(null);
  const [chatProfile, setChatProfile] = useState(null);
  const [orgDraft, setOrgDraft] = useState(null);
  const [instProfile, setInstProfile] = useState(null);
  const [instSpaceDraft, setInstSpaceDraft] = useState(null);
  const [error, setError] = useState("");

  function handleSpaceType(value) {
    setSpaceType(value);
    setStep(value === "team" ? "org-type" : "chat");
  }

  function handleOrgType(value) {
    setOrgType(value);
    setStep(value === "institute" ? "inst-profile" : "chat");
  }

  function handleInstProfile(draft) {
    setInstProfile(draft);
    setStep("inst-space");
  }

  function handleChatComplete(profile) {
    setChatProfile(profile);
    setStep(spaceType === "team" ? "team-setup" : "review");
  }

  function handleTeamSetup(draft) {
    setOrgDraft(draft);
    setStep("review");
  }

  async function handleInstituteConfirm(spaceDraft) {
    if (!user || !instProfile) return;
    setInstSpaceDraft(spaceDraft);
    setStep("submitting-inst");
    setError("");
    try {
      const fullName = `${instProfile.firstName} ${instProfile.lastName}`.trim();
      const username =
        user.username ||
        (await findFreeSlug(supabase, "profile_cards", "username", fullName || user.name || user.email));

      const { error: profileErr } = await supabase
        .from("profiles")
        .update({
          username,
          name: fullName,
          portfolio_url: instProfile.portfolio || null,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          growth_stage: 25
        })
        .eq("id", user.id);
      if (profileErr) throw profileErr;

      const orgSlug = await findFreeSlug(supabase, "organizations", "slug", spaceDraft.spaceName);
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

      const { error: memberErr } = await supabase.from("organization_members").insert({
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
              type: ["exam", "event", "deadline", "result"].includes(e.type) ? e.type : "event",
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
              // spaceDraft.website always carries a protocol (sourceUrl is
              // the raw, possibly bare domain the admin typed) — use it so
              // the "view source" link on the post is a real clickable URL
              source_url: spaceDraft.website || null,
              status: "live",
              published_at: new Date().toISOString()
            }))
          );
        }
      } catch {
        // seed content is a nice-to-have, not worth failing onboarding over
      }

      await refreshUser();
      navigate(`/institute/${orgSlug}`, { replace: true, state: { justCreated: true } });
    } catch (e) {
      setError(e.message || "something went wrong setting up your space. please try again.");
      setStep("inst-space");
    }
  }

  async function handleConfirm(finalProfile) {
    if (!user) return;
    setStep("submitting");
    setError("");
    try {
      const username =
        user.username ||
        (await findFreeSlug(supabase, "profile_cards", "username", finalProfile.name || user.name || user.email));

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
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          growth_stage: 25
        })
        .eq("id", user.id);

      if (profileErr) throw profileErr;

      let orgSlug = null;
      if (spaceType === "team" && orgDraft) {
        orgSlug = await findFreeSlug(supabase, "organizations", "slug", orgDraft.name);
        const { data: org, error: orgErr } = await supabase
          .from("organizations")
          .insert({ owner_id: user.id, name: orgDraft.name, slug: orgSlug, org_type: orgDraft.org_type })
          .select()
          .single();
        if (orgErr) throw orgErr;

        const { error: memberErr } = await supabase
          .from("organization_members")
          .insert({ org_id: org.id, user_id: user.id, role: "owner", status: "active" });
        if (memberErr) throw memberErr;
      }

      await refreshUser();

      const redirectTo = sessionStorage.getItem("post_onboarding_redirect");
      sessionStorage.removeItem("post_onboarding_redirect");

      if (orgSlug) {
        navigate(`/institute/${orgSlug}`, { replace: true, state: { justCreated: true } });
      } else if (redirectTo) {
        navigate(redirectTo, { replace: true });
      } else {
        navigate(`/profile/${username}`, { replace: true });
      }
    } catch (e) {
      setError(e.message || "something went wrong saving your profile. please try again.");
      setStep("review");
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#161618" }}>
        <GrowthMascot progress={5} size={56} />
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
      style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)", pointerEvents: user.username ? "auto" : "none" }}
    >
      <div className="w-7 h-7 rounded-full overflow-hidden bg-white/10 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
        {user.avatar_url ? (
          <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
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

  if (step === "space-type") {
    content = <SpaceTypeStep onContinue={handleSpaceType} />;
  } else if (step === "org-type") {
    content = (
      <OrgTypeStep
        onBack={() => (fromInstitution ? navigate("/institutions") : setStep("space-type"))}
        onContinue={handleOrgType}
      />
    );
  } else if (step === "inst-profile") {
    content = (
      <InstituteAdminProfileStep
        initial={
          instProfile ||
          (user.name
            ? { firstName: user.name.split(" ")[0] || "", lastName: user.name.split(" ").slice(1).join(" ") || "" }
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
        initialProfile={completingProfile ? profileFromUser(user) : emptyProfile()}
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
  } else if (step === "review" || step === "submitting") {
    content = (
      <>
        <ReviewStep
          profile={chatProfile}
          onBack={() => setStep(spaceType === "team" ? "team-setup" : "chat")}
          onConfirm={handleConfirm}
          submitting={step === "submitting"}
        />
        {error && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-evolve-red text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg z-50">
            {error}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {profileChip}
      {content}
    </>
  );
}
