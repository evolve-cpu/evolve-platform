import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../supabaseClient";
import { findFreeSlug } from "../../lib/slug";
import { emptyProfile } from "./questions";
import SpaceTypeStep from "./SpaceTypeStep";
import ChatOnboarding from "./ChatOnboarding";
import TeamSetupStep from "./TeamSetupStep";
import ReviewStep from "./ReviewStep";

/**
 * Orchestrates the full post-signin onboarding: space-type choice → chat
 * Q&A → (team setup, if applicable) → review → persist to Supabase → land
 * on the user's public profile (or their new team space).
 */
export default function Onboarding() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState("space-type"); // space-type | chat | team-setup | review | submitting
  const [spaceType, setSpaceType] = useState("individual");
  const [chatProfile, setChatProfile] = useState(null);
  const [orgDraft, setOrgDraft] = useState(null);
  const [error, setError] = useState("");

  function handleSpaceType(value) {
    setSpaceType(value);
    setStep("chat");
  }

  function handleChatComplete(profile) {
    setChatProfile(profile);
    setStep(spaceType === "team" ? "team-setup" : "review");
  }

  function handleTeamSetup(draft) {
    setOrgDraft(draft);
    setStep("review");
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
        navigate(`/space/${orgSlug}`, { replace: true });
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

  if (step === "space-type") return <SpaceTypeStep onContinue={handleSpaceType} />;

  if (step === "chat") {
    return <ChatOnboarding initialProfile={emptyProfile()} onComplete={handleChatComplete} />;
  }

  if (step === "team-setup") {
    return <TeamSetupStep onBack={() => setStep("chat")} onContinue={handleTeamSetup} />;
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
