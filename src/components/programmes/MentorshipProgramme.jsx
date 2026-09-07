import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../hooks/useAuth";
import { stageForProgress } from "../../lib/growthStage";
import GrowthStageModal from "../GrowthStageModal";
import Spinner from "../Spinner";
import MentorshipLanding from "./mentorship/MentorshipLanding";
import MentorshipPricingModal from "./mentorship/MentorshipPricingModal";
import MentorshipGiftModal from "./mentorship/MentorshipGiftModal";
import MentorshipWorkspaceShell from "./mentorship/MentorshipWorkspaceShell";

/**
 * The in-profile individual-mentorship programme — a thin orchestrator.
 * Real content/logic lives under ./mentorship/: MentorshipLanding (pricing
 * page), MentorshipPricingModal (stream + phone + payment, patterned on
 * PortfolioReviewProgramme's BookModal), MentorshipGiftModal (post-payment
 * "claim your gift", copied from Payment.jsx's gift1/gift2), and
 * MentorshipWorkspaceShell (post-flow landing, shell only for now).
 *
 * Entirely separate from the old batch-based mentorship flow (public
 * /mentorship page, Payment.jsx, mentorship_payments) — this one reads/
 * writes the new isolated mentorship_enrollments table via
 * /api/razorpay-create-order-mentorship.
 */
export default function MentorshipProgramme({ user, onBack }) {
  const { refreshUser } = useAuth();
  const [loadingEnrollment, setLoadingEnrollment] = useState(true);
  const [enrollment, setEnrollment] = useState(null);
  const [pricingPlan, setPricingPlan] = useState(null); // "core" | "application_support" | null
  const [giftOpen, setGiftOpen] = useState(false);
  const [growthModal, setGrowthModal] = useState(null);

  useEffect(() => {
    if (!user?.id) {
      setLoadingEnrollment(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("mentorship_enrollments")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "success")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!cancelled) {
        setEnrollment(data || null);
        setLoadingEnrollment(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  async function advanceGrowthStageByOne() {
    const current = user?.growth_stage ?? 0;
    const currentStage = stageForProgress(current);
    const nextStage = Math.min(10, currentStage + 1);
    const nextProgress = nextStage * 10;
    if (nextProgress > current) {
      await supabase
        .from("profiles")
        .update({ growth_stage: nextProgress })
        .eq("id", user.id);
      await refreshUser();
    }
    setGrowthModal({
      progress: nextProgress,
      heading: "You're one step closer 🌱",
      message:
        "Your mentorship is booked — one more stage down on your growth journey."
    });
  }

  function handlePaymentSuccess(row) {
    setEnrollment(row);
    setPricingPlan(null);
    setGiftOpen(true);
  }

  function handleGiftContinue() {
    setGiftOpen(false);
    advanceGrowthStageByOne();
  }

  if (loadingEnrollment) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <>
      {enrollment ? (
        <MentorshipWorkspaceShell user={user} enrollment={enrollment} onBack={onBack} />
      ) : (
        <MentorshipLanding onBack={onBack} onSelectPlan={setPricingPlan} />
      )}

      {pricingPlan && (
        <MentorshipPricingModal
          user={user}
          plan={pricingPlan}
          onClose={() => setPricingPlan(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {giftOpen && (
        <MentorshipGiftModal user={user} onContinue={handleGiftContinue} />
      )}

      {growthModal && (
        <GrowthStageModal
          {...growthModal}
          onContinue={() => setGrowthModal(null)}
        />
      )}
    </>
  );
}
