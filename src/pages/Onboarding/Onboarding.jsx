import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../supabaseClient";
import { findFreeSlug } from "../../lib/slug";
import { emptyProfile } from "./questions";
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
 *   team → company     → chat Q&A → team-setup (name) → review → persist → /space/:slug
 *   team → institute    → admin profile → institute space (link-fetch) → persist → /space/:slug
 *
 * The institute branch (Door 2 self-serve) skips the individual persona chat
 * entirely — "are you a high schooler or career shifter" doesn't fit an
 * institute admin — and instead collects their org-facing title directly.
 */
export default function Onboarding() {
  const { user, authLoading, refreshUser } = useAuth();
  const navigate = useNavigate();

  // signed-out visitors have no business here — send them to sign in first,
  // bounce back to /onboarding once they do
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/signin", { replace: true, state: { from: "/onboarding" } });
    }
  }, [authLoading, user, navigate]);

  const [step, setStep] = useState("space-type");
  // space-type | org-type | inst-profile | inst-space | submitting-inst
  // | chat | team-setup | review | submitting
  const [spaceType, setSpaceType] = useState("individual");
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
      const username = await findFreeSlug(
        supabase,
        "profile_cards",
        "username",
        fullName || user.name || user.email
      );

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
          source_url: spaceDraft.sourceUrl || null
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

      await refreshUser();
      navigate(`/space/${orgSlug}`, { replace: true, state: { justCreated: true } });
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
      const username = await findFreeSlug(
        supabase,
        "profile_cards",
        "username",
        finalProfile.name || user.name || user.email
      );

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
        navigate(`/space/${orgSlug}`, { replace: true, state: { justCreated: true } });
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

  if (step === "space-type") return <SpaceTypeStep onContinue={handleSpaceType} />;

  if (step === "org-type") {
    return <OrgTypeStep onBack={() => setStep("space-type")} onContinue={handleOrgType} />;
  }

  if (step === "inst-profile") {
    return (
      <InstituteAdminProfileStep
        initial={instProfile}
        onBack={() => setStep("org-type")}
        onContinue={handleInstProfile}
      />
    );
  }

  if (step === "inst-space" || step === "submitting-inst") {
    return (
      <InstituteSpaceStep
        initial={instSpaceDraft}
        onBack={() => setStep("inst-profile")}
        onSubmit={handleInstituteConfirm}
        submitting={step === "submitting-inst"}
        error={error}
      />
    );
  }

  if (step === "chat") {
    return <ChatOnboarding initialProfile={emptyProfile()} onComplete={handleChatComplete} />;
  }

  if (step === "team-setup") {
    return (
      <TeamSetupStep
        onBack={() => setStep("chat")}
        onContinue={handleTeamSetup}
        presetOrgType={orgType || "company"}
      />
    );
  }

  if (step === "review" || step === "submitting") {
    return (
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

  return null;
}
