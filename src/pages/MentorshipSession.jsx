import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../supabaseClient";
import BlackNav from "../components/BlackNav";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import {
  mentorship_session_hero,
  mentorship_session_hero_mobile,
  mentorship_session_hero_mobile1,
  mentor_yagnesh,
  chesna,
  yash
} from "../assets/images/Mentorship";

/* ─── Session date/time helpers ───────────────────────────────────────────── */
function formatSessionDate(datetimeStr) {
  if (!datetimeStr) return {};
  const d = new Date(datetimeStr);
  const opts = { timeZone: "Asia/Kolkata" };
  const day = d.toLocaleString("en-IN", { ...opts, day: "numeric" });
  const month = d
    .toLocaleString("en-IN", { ...opts, month: "long" })
    .toLowerCase();
  const monthSh = d
    .toLocaleString("en-IN", { ...opts, month: "short" })
    .toLowerCase();
  const year = d.toLocaleString("en-IN", { ...opts, year: "numeric" });
  const weekday = d
    .toLocaleString("en-IN", { ...opts, weekday: "long" })
    .toLowerCase();
  const time = d
    .toLocaleString("en-IN", {
      ...opts,
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    })
    .toLowerCase()
    .replace(/ /g, "")
    .replace("am", "am")
    .replace("pm", "pm");
  return {
    banner: `${day} ${monthSh} ${year} · ${weekday}`,
    bannerTime: `at ${time} IST`,
    full: `${day} ${month}, ${weekday} at ${time} IST`
  };
}

function isPast(datetimeStr) {
  if (!datetimeStr) return false;
  return new Date(datetimeStr) < new Date();
}

/* ─── Ordinal date helper ─────────────────────────────────────────────────── */
function ordinalDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDate();
  const suffix =
    ["th", "st", "nd", "rd"][
      ((day % 100) - 20 + 100) % 100 < 4
        ? ((day % 100) - 20 + 100) % 100
        : day % 10 < 4
          ? day % 10
          : 0
    ] || "th";
  return d
    .toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    .replace(/^/, `${day}${suffix} `);
}

/* ─── ProfileSheet ────────────────────────────────────────────────────────── */
function ProfileSheet({ user, onClose }) {
  const avatarSrc =
    user?.avatar_url ||
    `https://api.dicebear.com/7.x/thumbs/svg?seed=${user?.id || "u"}`;
  const receiptRef = useRef(null);
  const [payment, setPayment] = useState(undefined);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("mentorship_payments")
      .select("*, batch:mentorship_batches(batch_number, start_date)")
      .eq("user_id", user.id)
      .eq("status", "success")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setPayment(data || null));
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onClose();
  };

  const downloadReceipt = async () => {
    if (!receiptRef.current || !payment) return;
    const canvas = await html2canvas(receiptRef.current, {
      scale: 2,
      useCORS: true
    });
    const imgData = canvas.toDataURL("image/png");
    const w = canvas.width / 2;
    const h = canvas.height / 2;
    const pdf = new jsPDF({ unit: "px", format: [w, h] });
    pdf.addImage(imgData, "PNG", 0, 0, w, h);
    pdf.save(`evolve-receipt-${payment.razorpay_payment_id || Date.now()}.pdf`);
  };

  const rows = payment
    ? [
        ["plan", payment.plan === "starter" ? "starter" : "accelerator"],
        ["amount", `₹${Number(payment.amount).toLocaleString("en-IN")}`],
        [
          "date",
          new Date(payment.created_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
          })
        ],
        ["batch", `batch ${payment.batch?.batch_number ?? "—"}`],
        [
          "starts on",
          payment.batch?.start_date
            ? ordinalDate(payment.batch.start_date)
            : "—"
        ],
        ["ref", payment.razorpay_payment_id || "—"]
      ]
    : [];

  return (
    <>
      <div className="fixed inset-0 z-[60]" onClick={onClose} />
      <div
        className="fixed top-16 right-4 z-[70] rounded-2xl border border-white/10 p-5 flex flex-col gap-4 w-72 max-h-[85vh] overflow-y-auto"
        style={{ background: "rgba(30,30,30,1)" }}
      >
        <div className="flex items-center gap-3">
          <img
            src={avatarSrc}
            alt="avatar"
            className="w-11 h-11 rounded-full object-cover flex-shrink-0"
          />
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate">
              {user?.name || "—"}
            </p>
            <p className="text-white/40 text-xs truncate">
              {user?.email || ""}
            </p>
          </div>
        </div>

        <div className="h-px bg-white/10" />

        {payment === undefined && (
          <p className="text-white/30 text-xs">loading…</p>
        )}
        {payment === null && (
          <p className="text-white/30 text-xs">no payments yet</p>
        )}
        {payment && (
          <>
            <div
              ref={receiptRef}
              className="rounded-xl bg-white p-4 flex flex-col gap-1.5"
            >
              <p className="font-extrabold text-black text-[10px] uppercase tracking-widest mb-1 text-center">
                evolve mentorship · receipt
              </p>
              <div className="w-full h-px bg-black/10 mb-1" />
              {rows.map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between items-start gap-2"
                >
                  <span className="text-black/40 text-[11px] lowercase shrink-0">
                    {label}
                  </span>
                  <span className="text-black font-semibold text-[11px] text-right break-all">
                    {value}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={downloadReceipt}
              className="w-full bg-evolve-yellow text-evolve-black font-extrabold text-xs lowercase rounded-xl py-2.5 active:opacity-80"
            >
              download receipt ↓
            </button>
          </>
        )}

        <div className="h-px bg-white/10" />

        <button
          onClick={handleSignOut}
          className="text-left text-sm text-red-400 font-semibold hover:opacity-80 transition-opacity"
        >
          sign out
        </button>
      </div>
    </>
  );
}

/* ─── AvatarSlot ──────────────────────────────────────────────────────────── */
function AvatarSlot({ user }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const avatarSrc =
    user?.avatar_url ||
    `https://api.dicebear.com/7.x/thumbs/svg?seed=${user?.id || "u"}`;
  if (!user) return null;
  return (
    <div className="flex items-center gap-2 relative">
      <span className="hidden md:block text-white text-sm font-semibold">
        {user.name}
      </span>
      <button
        onClick={() => setProfileOpen((p) => !p)}
        className="focus:outline-none"
      >
        <img
          src={avatarSrc}
          alt="avatar"
          className="w-9 h-9 rounded-full object-cover"
        />
      </button>
      {profileOpen && (
        <ProfileSheet user={user} onClose={() => setProfileOpen(false)} />
      )}
    </div>
  );
}

/* ─── BackButton — reusable across all screens ────────────────────────────── */
function BackButton({ onClick }) {
  return (
    <div className="absolute top-[5rem] left-5 z-20">
      <button
        onClick={onClick}
        className="flex items-center gap-1.5 text-evolve-yellow text-sm font-medium active:opacity-60"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M10 13L5 8l5-5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        back
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Screen 0 — Welcome
═══════════════════════════════════════════════════════════════════════════ */
function WelcomeScreen({ user, onGetStarted, onBack }) {
  const firstName = user?.name?.split(" ")[0]?.toLowerCase() || "there";
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ backgroundColor: "#161618" }}
    >
      <BackButton onClick={onBack} />

      {/* text content */}
      <div className="flex flex-col items-center text-center px-6 pt-[10rem] md:pt-36 z-10">
        <h1
          className="text-white font-bold mb-3"
          style={{
            fontSize: "clamp(32px, 7vw, 52px)",
            letterSpacing: "-0.02em",
            lineHeight: 1.1
          }}
        >
          hey {firstName}!
        </h1>
        <p
          className="text-white/55 mb-10"
          style={{ fontSize: "clamp(15px, 3vw, 20px)", lineHeight: 1.5 }}
        >
          welcome to evolve&apos;s
          <br />
          mentorship program
        </p>

        <button
          onClick={onGetStarted}
          className="flex items-center gap-2 font-bold rounded-2xl active:opacity-80 transition-opacity"
          style={{
            background: "#FFD007",
            color: "#161618",
            fontSize: "clamp(15px, 3vw, 18px)",
            padding: "14px 36px",
            letterSpacing: "-0.01em"
          }}
        >
          get started
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M3.75 9h10.5M9.75 4.5 14.25 9l-4.5 4.5"
              stroke="#161618"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* hero image — pinned to bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-0 flex justify-center">
        <img
          src={
            isMobile ? mentorship_session_hero_mobile1 : mentorship_session_hero
          }
          alt=""
          style={{
            width: isMobile ? "100%" : "100vw",
            height: "auto",
            display: "block",
            pointerEvents: "none"
          }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Screen 1 — Profile setup
═══════════════════════════════════════════════════════════════════════════ */
function ProfileSetupScreen({ user, onSubmitDone, onBack }) {
  const [goal, setGoal] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [linkedinExpanded, setLinkedinExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const canSubmit = goal.trim().length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      // 1. Fetch fresh auth user + profile for reliable name/email
      const [{ data: authData }, { data: profileData }] = await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from("profiles")
          .select("name, email")
          .eq("id", user.id)
          .maybeSingle()
      ]);
      const authUser = authData?.user;
      const nameToSave =
        profileData?.name ||
        authUser?.user_metadata?.full_name ||
        authUser?.user_metadata?.name ||
        user.name ||
        null;
      const emailToSave =
        authUser?.email || profileData?.email || user.email || null;

      // 2. Get user's active batch from payments
      const { data: payment } = await supabase
        .from("mentorship_payments")
        .select("batch_id")
        .eq("user_id", user.id)
        .eq("status", "success")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const batchId = payment?.batch_id || null;

      // 3. Save mentorship profile
      const { error: dbError } = await supabase
        .from("mentorship_profiles")
        .upsert(
          {
            user_id: user.id,
            name: nameToSave,
            email: emailToSave,
            batch_id: batchId,
            goal: goal.trim(),
            linkedin_url: linkedinUrl.trim() || null,
            updated_at: new Date().toISOString()
          },
          { onConflict: "user_id" }
        );
      if (dbError) throw dbError;

      // 3. Check if user has a completed portfolio review
      const { data: reviewData } = await supabase
        .from("portfolio_reviews")
        .select("id, review_status, review_report_url")
        .eq("user_id", user.id)
        .eq("review_status", "done")
        .not("review_report_url", "is", null)
        .maybeSingle();

      onSubmitDone({ portfolioReview: reviewData || null, batchId });
    } catch (err) {
      console.error(err);
      setError("something went wrong. please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#161618" }}
    >
      <BackButton onClick={onBack} />

      <div className="flex-1 flex flex-col justify-center px-6 pt-24 pb-16 md:max-w-xl md:mx-auto md:w-full">
        <h1
          className="text-white font-bold mb-3"
          style={{
            fontSize: "clamp(28px, 6vw, 44px)",
            letterSpacing: "-0.02em",
            lineHeight: 1.1
          }}
        >
          let&apos;s set your profile
        </h1>
        <p className="text-white/40 text-sm mb-8 leading-relaxed">
          what do you aim to achieve through this mentorship?
        </p>

        {/* goal textarea */}
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="your answer"
          rows={5}
          className="w-full rounded-2xl text-white text-sm leading-relaxed resize-none outline-none placeholder:text-white/25 mb-4"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.10)",
            padding: "16px 18px",
            fontFamily: "inherit"
          }}
        />

        {/* connect linkedin */}
        <div
          className="rounded-2xl mb-6 overflow-hidden"
          style={{
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.04)"
          }}
        >
          <button
            onClick={() => setLinkedinExpanded((p) => !p)}
            className="w-full flex items-center gap-3 px-5 py-4 active:opacity-70"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="4" fill="#0A66C2" />
              <path
                d="M7.5 9.5h-2v8h2v-8ZM6.5 8.5a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5ZM17.5 17.5h-2v-3.75c0-1-.375-1.625-1.25-1.625-.75 0-1.125.5-1.25.875-.062.125-.062.375-.062.5v4h-2v-8h2v1.125c.375-.5 1-.875 1.75-.875 1.375 0 2.812 1 2.812 3.125v4.625Z"
                fill="white"
              />
            </svg>
            <span className="text-white text-sm font-medium">
              connect your linkedin
            </span>
            <svg
              className="ml-auto transition-transform"
              style={{
                transform: linkedinExpanded ? "rotate(180deg)" : "rotate(0deg)"
              }}
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M4 6l4 4 4-4"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {linkedinExpanded && (
            <div className="px-5 pb-4">
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
                className="w-full rounded-xl text-white text-sm outline-none placeholder:text-white/25"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  padding: "12px 14px",
                  fontFamily: "inherit"
                }}
              />
            </div>
          )}
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {/* submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full flex items-center justify-center gap-2 font-bold rounded-2xl transition-opacity"
          style={{
            background: canSubmit ? "#FFD007" : "rgba(255,208,7,0.25)",
            color: canSubmit ? "#161618" : "rgba(22,22,24,0.5)",
            fontSize: "clamp(15px, 3vw, 17px)",
            padding: "15px 0",
            letterSpacing: "-0.01em",
            cursor: canSubmit ? "pointer" : "not-allowed"
          }}
        >
          {submitting ? "submitting…" : "submit"}
          {!submitting && (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M3.75 9h10.5M9.75 4.5 14.25 9l-4.5 4.5"
                stroke={canSubmit ? "#161618" : "rgba(22,22,24,0.5)"}
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FeedbackPopup — appears over screen 2 after a session has passed
═══════════════════════════════════════════════════════════════════════════ */
function FeedbackPopup({ session, user, onClose }) {
  const [rating, setRating]         = useState(0);
  const [comment, setComment]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]             = useState(false);

  const handleSubmit = async () => {
    if (rating === 0 || submitting) return;
    setSubmitting(true);
    await supabase
      .from("mentorship_session_feedback")
      .upsert(
        {
          session_id:     session.id,
          user_id:        user.id,
          user_name:      user.name || null,
          session_name:   session.name || null,
          session_number: session.session_number || null,
          rating,
          comment: comment.trim() || null
        },
        { onConflict: "session_id,user_id" }
      );
    setDone(true);
    setTimeout(onClose, 1200);
  };

  return (
    <>
      {/* backdrop */}
      <div className="fixed inset-0 z-[80]" style={{ background: "rgba(0,0,0,0.7)" }} />

      {/* sheet */}
      <div
        className="fixed left-0 right-0 bottom-0 z-[90] rounded-t-3xl md:rounded-3xl md:left-1/2 md:top-1/2 md:bottom-auto md:-translate-x-1/2 md:-translate-y-1/2 md:w-[420px]"
        style={{ background: "#1D1D1F", padding: "32px 24px 40px" }}
      >
        {done ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <span className="text-4xl">💛</span>
            <p className="text-white font-bold text-lg text-center">thanks for your feedback!</p>
          </div>
        ) : (
          <>
            <h2
              className="text-white font-bold text-center mb-6"
              style={{ fontSize: "clamp(22px, 5vw, 28px)", letterSpacing: "-0.02em" }}
            >
              how was your session?
            </h2>

            {/* Heart rating */}
            <div className="flex justify-center gap-3 mb-6">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  className="transition-transform active:scale-90"
                  style={{ fontSize: "clamp(28px, 8vw, 36px)", lineHeight: 1 }}
                >
                  {n <= rating ? "💛" : "🩶"}
                </button>
              ))}
            </div>

            {/* Comment */}
            <p className="text-white/40 text-xs mb-2">
              how was your experience with session {session.session_number}?
            </p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="your answer"
              rows={4}
              className="w-full rounded-2xl text-white text-sm leading-relaxed resize-none outline-none placeholder:text-white/20 mb-5"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.10)",
                padding: "14px 16px",
                fontFamily: "inherit"
              }}
            />

            <button
              onClick={handleSubmit}
              disabled={rating === 0 || submitting}
              className="w-full flex items-center justify-center gap-2 font-bold rounded-2xl transition-opacity"
              style={{
                background: rating > 0 ? "#FFD007" : "rgba(255,208,7,0.25)",
                color: rating > 0 ? "#161618" : "rgba(22,22,24,0.4)",
                fontSize: "clamp(15px, 3vw, 17px)",
                padding: "14px 0",
                cursor: rating > 0 ? "pointer" : "not-allowed"
              }}
            >
              {submitting ? "submitting…" : "submit"}
              {!submitting && (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3.75 9h10.5M9.75 4.5 14.25 9l-4.5 4.5"
                    stroke={rating > 0 ? "#161618" : "rgba(22,22,24,0.4)"}
                    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </>
        )}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Screen 2 — Onboarding complete
═══════════════════════════════════════════════════════════════════════════ */
function OnboardingCompleteScreen({
  user,
  batchId,
  portfolioReview,
  onViewSessions,
  onBack
}) {
  const [sessions, setSessions]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [feedbackSession, setFeedbackSession] = useState(null); // session to show popup for
  const firstName = user?.name?.split(" ")[0]?.toLowerCase() || "there";

  useEffect(() => {
    if (!batchId) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data: sessionData } = await supabase
        .from("mentorship_sessions")
        .select("*")
        .eq("batch_id", batchId)
        .order("session_number", { ascending: true });

      const loadedSessions = sessionData || [];
      setSessions(loadedSessions);
      setLoading(false);

      // Find the most recently ended session that this user hasn't reviewed yet
      const now = new Date();
      const pastSessions = loadedSessions.filter(s => new Date(s.session_datetime) < now);
      if (pastSessions.length === 0) return;

      // Check which ones already have feedback from this user
      const { data: feedbackData } = await supabase
        .from("mentorship_session_feedback")
        .select("session_id")
        .eq("user_id", user.id)
        .in("session_id", pastSessions.map(s => s.id));

      const reviewedIds = new Set((feedbackData || []).map(f => f.session_id));
      // Show popup for the most recent past session not yet reviewed
      const unreviewed = pastSessions.filter(s => !reviewedIds.has(s.id));
      if (unreviewed.length > 0) {
        setFeedbackSession(unreviewed[unreviewed.length - 1]);
      }
    })();
  }, [batchId]);

  const now = new Date();
  const upcomingSession =
    sessions.find((s) => new Date(s.session_datetime) >= now) ||
    sessions[sessions.length - 1];
  const fmt = formatSessionDate(upcomingSession?.session_datetime);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#161618" }}
    >
      {feedbackSession && (
        <FeedbackPopup
          session={feedbackSession}
          user={user}
          onClose={() => setFeedbackSession(null)}
        />
      )}
      <BackButton onClick={onBack} />

      <div className="flex-1 flex flex-col justify-center px-5 pt-24 pb-16 md:max-w-6xl md:mx-auto md:px-8 md:w-full">
        <div className="md:grid md:grid-cols-2 md:gap-10">
          {/* ── Left column ── */}
          <div>
            <p
              className="text-white font-bold mb-5"
              style={{
                fontSize: "clamp(18px, 3.5vw, 26px)",
                letterSpacing: "-0.01em"
              }}
            >
              you&apos;re all set {firstName}!
            </p>

            {/* Upcoming session banner */}
            {loading && (
              <div
                className="w-full rounded-2xl p-5 mb-6 animate-pulse"
                style={{
                  background: "rgba(255,208,7,0.15)",
                  minHeight: "120px"
                }}
              />
            )}
            {!loading && !upcomingSession && (
              <div
                className="w-full rounded-2xl p-5 mb-6"
                style={{
                  background: "rgba(255,208,7,0.08)",
                  border: "1px solid rgba(255,208,7,0.2)"
                }}
              >
                <p
                  className="text-xs font-semibold mb-1"
                  style={{
                    color: "rgba(255,208,7,0.5)",
                    letterSpacing: "0.05em"
                  }}
                >
                  · upcoming session ·
                </p>
                <p className="text-white/40 text-sm">
                  session details coming soon
                </p>
              </div>
            )}
            {!loading && upcomingSession && (
              <button
                className="w-full text-left rounded-2xl p-5 mb-6"
                style={{ background: "#FFD007" }}
                onClick={() =>
                  onViewSessions(upcomingSession.session_number - 1)
                }
              >
                <p
                  className="text-xs font-bold mb-2 text-black"
                  // style={{ color: "rgba(0,0,0,0.5)",
                  style={{ letterSpacing: "0.05em" }}
                >
                  · upcoming session ·
                </p>
                <p
                  className="font-extrabold leading-tight mb-4"
                  style={{
                    fontSize: "clamp(22px, 5vw, 30px)",
                    color: "#DF0586",
                    letterSpacing: "-0.02em"
                  }}
                >
                  session {upcomingSession.session_number}:{" "}
                  {upcomingSession.name}
                </p>
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p
                      className="text-sm font-medium text-black"
                      // style={{ color: "rgba(0,0,0,0.65)" }}
                    >
                      {fmt.banner}
                    </p>
                    <p
                      className="text-sm font-medium text-black"
                      // style={{ color: "rgba(0,0,0,0.65)" }}
                    >
                      {fmt.bannerTime}
                    </p>
                  </div>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "#161618" }}
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path
                        d="M3.75 9h10.5M9.75 4.5 14.25 9l-4.5 4.5"
                        stroke="#FFD007"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </button>
            )}

            {/* My documents */}
            <p className="text-white/35 text-sm mb-3">my documents</p>
            <div className="flex flex-col gap-2">
              {/* My submissions — placeholder */}
              <button
                className="w-full flex items-center justify-between px-5 py-4 rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)"
                }}
              >
                <div className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle
                      cx="10"
                      cy="7"
                      r="3"
                      stroke="rgba(255,255,255,0.55)"
                      strokeWidth="1.3"
                    />
                    <path
                      d="M3 17c0-3.866 3.134-7 7-7s7 3.134 7 7"
                      stroke="rgba(255,255,255,0.55)"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="text-white text-sm font-medium">
                    my submissions
                  </span>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M6 4l4 4-4 4"
                    stroke="rgba(255,255,255,0.35)"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Portfolio report — only if review is done */}
              {portfolioReview?.review_report_url && (
                <a
                  href={portfolioReview.review_report_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between px-5 py-4 rounded-2xl active:opacity-75"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)"
                  }}
                >
                  <div className="flex items-center gap-3">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect
                        x="3"
                        y="2"
                        width="14"
                        height="16"
                        rx="2"
                        stroke="rgba(255,255,255,0.55)"
                        strokeWidth="1.3"
                      />
                      <path
                        d="M6 7h8M6 10h8M6 13h5"
                        stroke="rgba(255,255,255,0.55)"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="text-white text-sm font-medium">
                      portfolio report
                    </span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M6 4l4 4-4 4"
                      stroke="rgba(255,255,255,0.35)"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="mt-10 md:mt-0">
            <p className="text-white/35 text-xs uppercase tracking-widest mb-4">
              while you wait, here are some resources
            </p>
            <div
              className="rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                minHeight: "200px"
              }}
            >
              {/* Resources — to be added */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Screen 3 — Session detail
═══════════════════════════════════════════════════════════════════════════ */
// Add chesna/yash photos to src/assets/images/Mentorship/ and reference them here
const EVOLVE_TEAM = [
  { name: "yagnesh", role: "mentor", photo: mentor_yagnesh },
  { name: "chesna", role: "support team lead", photo: chesna },
  { name: "yash", role: "community manager", photo: yash }
];

const SESSION_FAQS = [
  {
    q: "how can i join the sessions?",
    a: "session links are shared in the WhatsApp group 24 hours before each session. they're also in the calendar invite sent to your email."
  },
  {
    q: "can i attend if i miss a session?",
    a: "yes all sessions are recorded and shared with enrolled students. but these are only available to enrolled students and are not shared publicly."
  },
  {
    q: "will i get the recording after each session?",
    a: "recordings are shared within 24 hours of each session via the WhatsApp group and your email."
  },
  {
    q: "how do i reach my mentor between sessions?",
    a: "drop a message in the WhatsApp group — your mentor checks it regularly."
  }
];

function SessionDetailScreen({ batchId, defaultSessionIndex = 0, onBack }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(defaultSessionIndex);
  const [openFAQ, setOpenFAQ] = useState(null);

  useEffect(() => {
    if (!batchId) {
      setLoading(false);
      return;
    }
    supabase
      .from("mentorship_sessions")
      .select("*")
      .eq("batch_id", batchId)
      .order("session_number", { ascending: true })
      .then(({ data }) => {
        setSessions(data || []);
        setLoading(false);
      });
  }, [batchId]);

  // clamp active tab if sessions loaded
  useEffect(() => {
    if (sessions.length > 0 && activeTab >= sessions.length) {
      setActiveTab(sessions.length - 1);
    }
  }, [sessions, activeTab]);

  const session = sessions[activeTab];
  const fmt = formatSessionDate(session?.session_datetime);
  const past = session ? isPast(session.session_datetime) : false;

  // Placeholder tabs if sessions not loaded yet
  const tabCount = sessions.length > 0 ? sessions.length : 5;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#161618" }}
    >
      <BackButton onClick={onBack} />

      <div className="flex-1 flex flex-col justify-center pt-[7rem] pb-16">
        {/* ── Tab card: tabs row + session content ── */}
        <div
          className="mx-4 md:w-full md:max-w-3xl md:mx-auto rounded-3xl overflow-hidden mb-10"
          style={{ background: "#1D1D1F" }}
        >
          {/* Tabs row */}
          {/* <div className="flex gap-1.5 p-3"> */}
          <div className="flex gap-1.5 p-3 w-full">
            {Array.from({ length: tabCount }, (_, i) => {
              const s = sessions[i];
              const isActive = activeTab === i;
              return (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className="flex-1 min-w-0 py-2 rounded-xl text-[11px] font-semibold transition-colors text-center"
                  style={{
                    background: isActive ? "#FFD007" : "rgba(255,255,255,0.07)",
                    color: isActive ? "#161618" : "rgba(255,255,255,0.45)"
                  }}
                >
                  session {s?.session_number ?? i + 1}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div
            style={{ height: "1px", background: "rgba(255,255,255,0.07)" }}
          />

          {/* Session content */}
          <div className="px-5 py-6 md:min-h-[280px]">
            {loading ? (
              <div className="flex flex-col gap-3 animate-pulse">
                <div
                  className="h-4 w-24 rounded-full"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                />
                <div
                  className="h-10 w-3/4 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                />
                <div
                  className="h-16 w-full rounded-xl mt-2"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                />
              </div>
            ) : session ? (
              <>
                {/* Session label + name */}
                <p className="text-white/40 text-sm mb-1">
                  session {session.session_number}
                </p>
                <h1
                  className="font-extrabold mb-4"
                  style={{
                    fontSize: "clamp(36px, 8vw, 56px)",
                    color: "#FFD007",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.0
                  }}
                >
                  {session.name}
                </h1>

                {session.description && (
                  <p className="text-white/65 text-sm leading-relaxed mb-6">
                    {session.description}
                  </p>
                )}

                {/* Happening on */}
                <div
                  className="rounded-2xl p-5"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)"
                  }}
                >
                  <p className="text-white/35 text-xs mb-2">happening on</p>
                  <p
                    className="font-semibold text-base"
                    style={{
                      color: past ? "rgba(255,255,255,0.65)" : "#FFD007"
                    }}
                  >
                    {fmt.full}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-white/30 text-sm">no session data found.</p>
            )}
          </div>
        </div>

        {/* ── Team + FAQs (outside the tab card) ── */}
        <div className="px-5 md:max-w-3xl md:mx-auto">
          {/* Evolve team */}
          <h2
            className="text-white font-bold mb-5"
            style={{
              fontSize: "clamp(20px, 4vw, 28px)",
              letterSpacing: "-0.01em"
            }}
          >
            evolve team
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
            {EVOLVE_TEAM.map((member) => (
              <div key={member.name} className="flex flex-col">
                <div
                  className="w-full rounded-2xl mb-3 overflow-hidden"
                  style={{
                    aspectRatio: "3 / 4",
                    background: "rgba(255,255,255,0.06)"
                  }}
                >
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      style={{ filter: "grayscale(30%)" }}
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ background: "rgba(255,208,7,0.07)" }}
                    >
                      <span
                        className="font-bold text-4xl"
                        style={{ color: "rgba(255,208,7,0.25)" }}
                      >
                        {member.name[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-white font-semibold text-sm">
                  {member.name}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  {member.role}
                </p>
              </div>
            ))}
          </div>

          {/* FAQs */}
          <h2
            className="text-white font-bold mb-1"
            style={{
              fontSize: "clamp(20px, 4vw, 28px)",
              letterSpacing: "-0.01em"
            }}
          >
            FAQs
          </h2>
          <p className="text-white/40 text-sm mb-5">
            everything you need to know
          </p>
          <div className="flex flex-col mb-8">
            {SESSION_FAQS.map((faq, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                  className="w-full flex items-start justify-between gap-4 py-4 text-left"
                >
                  <span className="text-white font-medium text-sm">
                    {faq.q}
                  </span>
                  <span className="text-white/40 text-xl flex-shrink-0 leading-none mt-0.5">
                    {openFAQ === i ? "−" : "+"}
                  </span>
                </button>
                {openFAQ === i && (
                  <p className="text-white/50 text-sm pb-4 leading-relaxed">
                    {faq.a}
                  </p>
                )}
                {i < SESSION_FAQS.length - 1 && (
                  <hr className="border-white/10" />
                )}
              </div>
            ))}
          </div>

          {/* Contact */}
          <p className="text-white/40 text-sm">
            have more questions?{" "}
            <button
              onClick={() =>
                window.dispatchEvent(new CustomEvent("openContactModal"))
              }
              className="text-evolve-yellow font-semibold"
            >
              contact us
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MentorshipSession — main shell
═══════════════════════════════════════════════════════════════════════════ */
export default function MentorshipSession() {
  const navigate = useNavigate();
  const { user, authLoading } = useAuth();

  // screen: 0=welcome, 1=profile setup, 2=onboarding complete, 3=session detail
  const [screen, setScreen] = useState(null); // null = still checking
  const [portfolioReview, setPortfolioReview] = useState(null);
  const [batchId, setBatchId] = useState(null);
  // which session tab to open by default when navigating to screen 3
  const [defaultSessionIndex, setDefaultSessionIndex] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/signin", { state: { from: "/mentorship-session" } });
      return;
    }

    // Check if user already has a mentorship profile (already submitted goal/linkedin)
    (async () => {
      const { data: profile } = await supabase
        .from("mentorship_profiles")
        .select("batch_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile) {
        // Already submitted — skip welcome + profile setup, go straight to screen 2
        const bid = profile.batch_id || null;
        setBatchId(bid);

        // Also fetch portfolio review so screen 2 can show the report button if applicable
        const { data: reviewData } = await supabase
          .from("portfolio_reviews")
          .select("id, review_status, review_report_url")
          .eq("user_id", user.id)
          .eq("review_status", "done")
          .not("review_report_url", "is", null)
          .maybeSingle();

        setPortfolioReview(reviewData || null);
        setScreen(2);
      } else {
        setScreen(0);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  // Show nothing while auth is loading or we're checking the profile
  if (authLoading || screen === null) return null;

  const goToSessions = (sessionIndex = 0) => {
    setDefaultSessionIndex(sessionIndex);
    setScreen(3);
  };

  // Called when user taps "get started" on welcome screen.
  // Re-checks the DB so that users who already submitted don't land on profile setup.
  const handleGetStarted = async () => {
    const { data: profile } = await supabase
      .from("mentorship_profiles")
      .select("batch_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profile) {
      const bid = profile.batch_id || null;
      setBatchId(bid);
      const { data: reviewData } = await supabase
        .from("portfolio_reviews")
        .select("id, review_status, review_report_url")
        .eq("user_id", user.id)
        .eq("review_status", "done")
        .not("review_report_url", "is", null)
        .maybeSingle();
      setPortfolioReview(reviewData || null);
      setScreen(2);
    } else {
      setScreen(1);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <BlackNav
        onLogoClick={() => navigate("/mentorship")}
        right={<AvatarSlot user={user} />}
        style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50 }}
      />

      {screen === 0 && (
        <WelcomeScreen
          user={user}
          onGetStarted={handleGetStarted}
          onBack={() => navigate(-1)}
        />
      )}

      {screen === 1 && (
        <ProfileSetupScreen
          user={user}
          onSubmitDone={({ portfolioReview: pr, batchId: bid }) => {
            setPortfolioReview(pr);
            setBatchId(bid);
            setScreen(2);
          }}
          onBack={() => setScreen(0)}
        />
      )}

      {screen === 2 && (
        <OnboardingCompleteScreen
          user={user}
          batchId={batchId}
          portfolioReview={portfolioReview}
          onViewSessions={goToSessions}
          onBack={() => setScreen(0)}
        />
      )}

      {screen === 3 && (
        <SessionDetailScreen
          batchId={batchId}
          defaultSessionIndex={defaultSessionIndex}
          onBack={() => setScreen(2)}
        />
      )}
    </div>
  );
}
