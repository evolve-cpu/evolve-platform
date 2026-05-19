import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../supabaseClient";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorkerSrc from "pdfjs-dist/build/pdf.worker.mjs?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerSrc;
import BlackNav from "../components/BlackNav";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import {
  mentorship_session_hero,
  mentorship_session_hero_mobile,
  mentorship_session_hero_mobile1,
  mentor_yagnesh,
  chesna,
  chesna1,
  yash,
  banner_arrow,
  portfolio_report_icon,
  yash1,
  linkedin_logo,
  upload_sheet,
  upload_portfolio,
  upload_resume
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
    .replace(/\s*ist\s*/g, "")
    .replace(/ /g, "")
    .replace("am", "am")
    .replace("pm", "pm");
  return {
    banner: `${weekday}, ${day} ${month} ${year}`,
    bannerTime: `${time} IST`,
    full: `${weekday}, ${day} ${month} ${year} at ${time} IST`
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

/* ─── Version label helper ────────────────────────────────────────────────── */
function getVersionLabel(url) {
  if (!url) return "—";
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1] || "";
    // Supabase storage file: extract original filename, strip timestamp prefix
    if (
      u.hostname.includes("supabase") &&
      u.pathname.includes("/object/public/")
    ) {
      const filename = decodeURIComponent(last)
        .replace(/^\d+_/, "")
        .replace(/_/g, " ");
      return filename.length > 24 ? filename.substring(0, 22) + "…" : filename;
    }
    // Regular link: domain + first path segment
    const domain = u.hostname.replace(/^www\./, "");
    const pathStart = parts.length > 0 ? "/" + parts[0] : "";
    const combined = domain + pathStart;
    return combined.length > 24 ? combined.substring(0, 22) + "…" : combined;
  } catch {
    return url.length > 24 ? url.substring(0, 22) + "…" : url;
  }
}

/* ─── Video thumbnail helper (YouTube + Cloudinary) ──────────────────────── */
function getVideoThumbnail(url) {
  if (!url) return null;
  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
  // Cloudinary — swap extension to .jpg with so_auto (best frame)
  if (url.includes("res.cloudinary.com")) {
    return url
      .replace(/\/upload\//, "/upload/so_auto/")
      .replace(/\.[a-z0-9]+(\?.*)?$/i, ".jpg");
  }
  return null;
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
      {/* <BackButton onClick={onBack} /> */}

      {/* text content */}
      <div
        className="flex flex-col items-center text-center px-6 z-10"
        style={{ paddingTop: "clamp(9rem, 20vh, 18rem)" }}
      >
        <h1
          className="text-white font-bold mb-6"
          style={{
            fontSize: "clamp(36px, 7vw, 52px)",
            letterSpacing: "-0.02em",
            lineHeight: 1.1
          }}
        >
          hey {firstName}!
        </h1>
        <p
          className="text-white mb-10 font-regular"
          style={{
            fontSize: "clamp(20px, 3.8vw, 32px)",
            // fontWeight: 400,
            lineHeight: "clamp(24px, 5vw, 38px)",
            letterSpacing: "0.16px"
          }}
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
          {/* let&apos;s set your profile */}
          before we begin..
        </h1>
        <p
          className="text-white mb-8"
          style={{
            fontSize: "clamp(20px, 4vw, 32px)",
            fontWeight: 400,
            lineHeight: 1.4,
            letterSpacing: "0.1px"
          }}
        >
          tell us your expectations from this mentorship, this helps us
          personalise your experience.
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
        {/* <div
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
        </div> */}

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
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const canSubmit = comment.trim().length > 0 && !submitting;

  const markLocalDone = () => {
    try {
      const key = `fb_ok_${user.id}`;
      const list = JSON.parse(localStorage.getItem(key) || "[]");
      if (!list.includes(session.id)) {
        localStorage.setItem(key, JSON.stringify([...list, session.id]));
      }
    } catch {}
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    await supabase.from("mentorship_session_feedback").upsert(
      {
        session_id: session.id,
        user_id: user.id,
        user_name: user.name || null,
        session_name: session.name || null,
        session_number: session.session_number || null,
        rating,
        comment: comment.trim() || null
      },
      { onConflict: "session_id,user_id" }
    );
    markLocalDone();
    setDone(true);
    setTimeout(onClose, 1200);
  };

  const handleDidNotAttend = async () => {
    if (submitting) return;
    setSubmitting(true);
    // Mark locally first so the popup never re-shows even if the DB call
    // fails (e.g. connectivity issue).
    markLocalDone();
    const { error: dbErr } = await supabase
      .from("mentorship_session_feedback")
      .upsert(
        {
          session_id: session.id,
          user_id: user.id,
          user_name: user?.name || null,
          session_name: session?.name || null,
          session_number: session?.session_number || null,
          rating: 0,
          comment: null
        },
        { onConflict: "session_id,user_id" }
      );
    if (dbErr) console.error("did_not_attend save failed:", dbErr);
    setDone(true);
    setTimeout(onClose, 1200);
  };

  return (
    <>
      {/* backdrop */}
      <div
        className="fixed inset-0 z-[80]"
        style={{ background: "rgba(0,0,0,0.7)" }}
      />

      {/* sheet */}
      <div
        className="fixed left-0 right-0 bottom-0 z-[90] rounded-t-3xl md:rounded-3xl md:left-1/2 md:top-1/2 md:bottom-auto md:-translate-x-1/2 md:-translate-y-1/2 md:w-[680px] md:min-h-[520px] md:flex md:flex-col md:border-2 md:border-black md:[box-shadow:8px_8px_0_0_#000000]"
        style={{ background: "#1D1D1F", padding: "32px 24px 40px" }}
      >
        {done ? (
          <div className="flex flex-col items-center justify-center gap-3 py-8 md:flex-1">
            <span className="text-4xl">💛</span>
            <p className="text-white font-bold text-lg text-center">
              thanks for your feedback!
            </p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-1">
            {/* Center content */}
            <div className="flex-1 flex flex-col justify-center">
              <h2
                className="text-white font-bold text-center mb-6"
                style={{
                  fontSize: "clamp(22px, 5vw, 28px)",
                  letterSpacing: "-0.02em"
                }}
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
                    style={{
                      fontSize: "clamp(28px, 8vw, 36px)",
                      lineHeight: 1
                    }}
                  >
                    {n <= rating ? "💛" : "🩶"}
                  </button>
                ))}
              </div>

              {/* Comment */}
              <p className="text-white/40 text-xs mb-2">
                tell us more about your experience...
              </p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="your answer here..."
                rows={4}
                className="w-full rounded-2xl text-white text-sm leading-relaxed resize-none outline-none placeholder:text-white/20"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  padding: "14px 16px",
                  fontFamily: "inherit"
                }}
              />
            </div>

            {/* Buttons pinned to bottom */}
            <div className="mt-5">
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full flex items-center justify-center gap-2 font-bold rounded-2xl transition-opacity mb-4"
                style={{
                  background: canSubmit ? "#FFD007" : "rgba(255,208,7,0.25)",
                  color: canSubmit ? "#161618" : "rgba(22,22,24,0.4)",
                  fontSize: "clamp(15px, 3vw, 17px)",
                  padding: "14px 0",
                  cursor: canSubmit ? "pointer" : "not-allowed"
                }}
              >
                {submitting ? "submitting…" : "submit"}
                {!submitting && (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path
                      d="M3.75 9h10.5M9.75 4.5 14.25 9l-4.5 4.5"
                      stroke={canSubmit ? "#161618" : "rgba(22,22,24,0.4)"}
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
              <button
                onClick={handleDidNotAttend}
                disabled={submitting}
                className="w-full text-center text-sm font-medium underline underline-offset-2"
                style={{ color: "#FFD007" }}
              >
                I did not attend the session
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PortfolioModal
═══════════════════════════════════════════════════════════════════════════ */
function PortfolioModal({
  user,
  batchId,
  portfolioReview,
  versions,
  sessions,
  onClose,
  onSaved
}) {
  const isUser1 = !!portfolioReview;
  const [reviewPortfolio, setReviewPortfolio] = useState(null);
  const [view, setView] = useState(
    versions.length > 0 || !!portfolioReview ? "versions" : "form"
  );
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [walkthroughUrl, setWalkthroughUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [urlLocked, setUrlLocked] = useState(false);
  const urlInputRef = useRef(null);

  useEffect(() => {
    if (!portfolioReview?.id) return;
    supabase
      .from("portfolio_reviews")
      .select("portfolio_link, portfolio_file_url, created_at")
      .eq("id", portfolioReview.id)
      .maybeSingle()
      .then(({ data }) => setReviewPortfolio(data));
  }, [portfolioReview?.id]);

  const isValidUrl = (s) => {
    try {
      new URL(s);
      return true;
    } catch {
      return false;
    }
  };

  const allDisplayVersions = [
    ...(isUser1 && reviewPortfolio
      ? [
          {
            displayVersion: 1,
            date: reviewPortfolio.created_at,
            url:
              reviewPortfolio.portfolio_link ||
              reviewPortfolio.portfolio_file_url,
            walkthrough: null,
            isReview: true
          }
        ]
      : []),
    ...versions.map((v, i) => ({
      displayVersion: i + 1 + (isUser1 ? 1 : 0),
      date: v.created_at,
      url: v.portfolio_url,
      walkthrough: v.walkthrough_url,
      isReview: false
    }))
  ];

  const totalDisplay = allDisplayVersions.length;
  const _now = new Date();
  const _pastSessions = (sessions || []).filter(
    (s) =>
      new Date(s.session_datetime).getTime() + 2 * 60 * 60 * 1000 <
      _now.getTime()
  );
  const _nextSession = (sessions || []).find(
    (s) =>
      new Date(s.session_datetime).getTime() + 2 * 60 * 60 * 1000 >=
      _now.getTime()
  );
  // Session 5+ means all upload windows are closed
  const _uploadsLocked = (_nextSession?.session_number ?? 999) >= 5;
  const latestVersion = allDisplayVersions[totalDisplay - 1];
  const _lastPastSession = _pastSessions[_pastSessions.length - 1];
  // 4-day window that opens when a session ends (session_datetime + 2h + 4 days)
  const _uploadWindowEnd =
    !_uploadsLocked && _lastPastSession
      ? new Date(
          new Date(_lastPastSession.session_datetime).getTime() +
            98 * 60 * 60 * 1000
        )
      : null;
  const canUploadMore =
    !!_uploadWindowEnd && _now.getTime() < _uploadWindowEnd.getTime();
  const _msLeft =
    canUploadMore && _uploadWindowEnd
      ? Math.max(0, _uploadWindowEnd.getTime() - _now.getTime())
      : 0;
  const daysLeft = canUploadMore
    ? Math.max(0, Math.ceil(_msLeft / (1000 * 60 * 60 * 24)))
    : null;
  const hoursLeft =
    canUploadMore && _msLeft > 0 && _msLeft < 24 * 60 * 60 * 1000
      ? Math.max(1, Math.ceil(_msLeft / (1000 * 60 * 60)))
      : null;
  const timerColor =
    hoursLeft !== null
      ? "#FF4500"
      : daysLeft !== null && daysLeft <= 1
        ? "#FF8C00"
        : "rgba(255,208,7,0.7)";
  const timerLabel = canUploadMore
    ? hoursLeft !== null
      ? `⏱ ${hoursLeft} hour${hoursLeft !== 1 ? "s" : ""} left`
      : `⏱ ${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`
    : null;

  const handleSubmit = async () => {
    setError("");
    if (!canUploadMore) {
      setError("the upload window for this session has closed");
      return;
    }
    if (!portfolioUrl.trim()) {
      setError("please add your portfolio link");
      return;
    }
    if (!isValidUrl(portfolioUrl.trim())) {
      setError("please enter a valid url");
      return;
    }
    if (walkthroughUrl && !isValidUrl(walkthroughUrl.trim())) {
      setError("please enter a valid walkthrough url");
      return;
    }
    if (walkthroughUrl && portfolioUrl.trim() === walkthroughUrl.trim()) {
      setError("portfolio and walkthrough links can't be the same");
      return;
    }
    setSubmitting(true);
    const { error: dbErr } = await supabase
      .from("mentorship_portfolio_versions")
      .insert({
        user_id: user.id,
        batch_id: batchId,
        version_number: versions.length + 1,
        portfolio_url: portfolioUrl.trim(),
        walkthrough_url: walkthroughUrl.trim() || null,
        notes: notes.trim() || null
      });
    setSubmitting(false);
    if (dbErr) {
      setError(dbErr.message);
      return;
    }
    await onSaved();
    setView("versions");
  };

  const DocRow = ({ item }) => (
    <a
      href={item.url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-4 py-3.5 rounded-2xl active:opacity-75"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)"
      }}
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{
          background:
            item.displayVersion === totalDisplay
              ? "#FFD007"
              : "rgba(255,255,255,0.1)",
          color:
            item.displayVersion === totalDisplay
              ? "#161618"
              : "rgba(255,255,255,0.6)"
        }}
      >
        {item.displayVersion}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">
          {getVersionLabel(item.url)}
        </p>
        <p className="text-white/35 text-xs">
          last updated{" "}
          {new Date(item.date)
            .toLocaleDateString("en-IN", { day: "numeric", month: "long" })
            .toLowerCase()}
          ,{" "}
          {new Date(item.date).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
          })}
        </p>
        {item.walkthrough && (
          <a
            href={item.walkthrough}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs underline"
            style={{ color: "#FFD007" }}
            onClick={(e) => e.stopPropagation()}
          >
            your portfolio walkthrough
          </a>
        )}
      </div>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M6 4l4 4-4 4"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  );

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end md:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.75)" }}
    >
      <div
        className="w-full md:w-[680px] rounded-t-3xl md:rounded-3xl px-6 pt-6 pb-10 relative md:flex md:flex-col md:min-h-[520px] md:border-2 md:border-black md:[box-shadow:8px_8px_0_0_#000000]"
        style={{ background: "#1D1D1F", maxHeight: "90vh", overflowY: "auto" }}
      >
        <div
          className="w-10 h-1 rounded-full mx-auto mb-5 md:hidden"
          style={{ background: "rgba(255,255,255,0.15)" }}
        />
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M2 2l10 10M12 2 2 12"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {view === "form" ? (
          <div className="flex flex-col md:flex-1">
            {/* Growing content area */}
            <div className="flex-1">
              <h2
                className="text-white font-extrabold text-xl mb-1"
                style={{ letterSpacing: "-0.02em" }}
              >
                {totalDisplay === 0
                  ? "ready to submit your portfolio?"
                  : "ready to submit your next version?"}
              </h2>
              {timerLabel ? (
                <p className="text-[14px] mb-4" style={{ color: timerColor }}>
                  {timerLabel} to submit
                </p>
              ) : (
                <div className="mb-4" />
              )}
              <div className="relative mb-4">
                <input
                  ref={urlInputRef}
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  readOnly={urlLocked}
                  placeholder="your site, behance, figma, notion — any link works"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid ${urlLocked ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.1)"}`,
                    color: urlLocked ? "rgba(255,255,255,0.45)" : "white",
                    paddingRight: urlLocked ? "44px" : "16px"
                  }}
                />
                {urlLocked && (
                  <button
                    onClick={() => {
                      setUrlLocked(false);
                      setTimeout(() => urlInputRef.current?.focus(), 50);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg"
                    style={{ background: "rgba(255,255,255,0.1)" }}
                    title="edit link"
                  >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path
                        d="M9 1.5l2.5 2.5M1.5 11.5l.6-2.8L9 1.5l2.5 2.5-6.9 6.7-2.8.6-.3-.7z"
                        stroke="rgba(255,255,255,0.7)"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                )}
              </div>
              {totalDisplay === 0 && (
                <>
                  <p className="text-white text-sm font-semibold mb-1">
                    your walkthrough recording
                  </p>
                  <p className="text-white/40 text-xs mb-2">
                    no face cam needed. just walk us through your work. record
                    with{" "}
                    <a
                      href="https://loom.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                      style={{ color: "#FFD007" }}
                    >
                      loom
                    </a>
                  </p>
                  <input
                    value={walkthroughUrl}
                    onChange={(e) => setWalkthroughUrl(e.target.value)}
                    placeholder="https://loom.com/share…"
                    className="w-full px-4 py-3 rounded-xl text-sm text-white mb-4 outline-none"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)"
                    }}
                  />
                </>
              )}
              <p className="text-white text-sm font-semibold mb-1">
                {totalDisplay === 0 ? (
                  <>
                    anything we should know?{" "}
                    <span className="text-white/30 font-normal">
                      (optional)
                    </span>
                  </>
                ) : (
                  "what did you update in this version?"
                )}
              </p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  totalDisplay === 0
                    ? "anything we should consider while reviewing?"
                    : "describe what changed or improved in this version…"
                }
                rows={3}
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none resize-none"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)"
                }}
              />
            </div>

            {/* Error + button pinned to bottom */}
            <div className="mt-4">
              {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
              {(() => {
                const pCanSubmit =
                  portfolioUrl.trim().length > 0 &&
                  (totalDisplay === 0 || notes.trim().length > 0) &&
                  canUploadMore &&
                  !submitting;
                return (
                  <button
                    onClick={handleSubmit}
                    disabled={!pCanSubmit}
                    className="w-full flex items-center justify-center gap-2 py-3.5 font-bold"
                    style={{
                      background: "#161618",
                      color: pCanSubmit ? "#FFD007" : "rgba(255,208,7,0.35)",
                      border: `1.5px solid ${pCanSubmit ? "#FFD007" : "rgba(255,208,7,0.35)"}`,
                      borderRadius: "16px",
                      boxShadow: pCanSubmit ? "4px 4px 0 #806804" : "none",
                      fontSize: "15px",
                      letterSpacing: "-0.01em",
                      cursor: pCanSubmit ? "pointer" : "not-allowed"
                    }}
                  >
                    {submitting
                      ? "saving…"
                      : totalDisplay === 0
                        ? "upload portfolio"
                        : "save"}
                    {!submitting && (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                      >
                        <path
                          d="M3.75 9h10.5M9.75 4.5 14.25 9l-4.5 4.5"
                          stroke={
                            pCanSubmit ? "#FFD007" : "rgba(255,208,7,0.35)"
                          }
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                );
              })()}
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-1">
            {/* Header */}
            <h2
              className="text-white font-extrabold text-4xl text-center mt-4 mb-1"
              style={{ letterSpacing: "-0.04em" }}
            >
              portfolio
            </h2>
            {latestVersion && (
              <div className="text-center mb-4">
                <p className="text-white/35 text-sm">
                  version {totalDisplay} · last updated{" "}
                  {new Date(latestVersion.date)
                    .toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long"
                    })
                    .toLowerCase()}
                </p>
                {canUploadMore && timerLabel && (
                  <p className="text-[14px] mt-1" style={{ color: timerColor }}>
                    {timerLabel} to update
                  </p>
                )}
              </div>
            )}

            {/* Version rows — grow to fill space, centered vertically on desktop */}
            {(() => {
              const reversed = [...allDisplayVersions].reverse();
              const current = reversed[0];
              const past = reversed.slice(1);
              return (
                <div className="flex flex-col gap-2 py-2 md:flex-1 md:justify-center">
                  {current && <DocRow item={current} />}
                  {past.length > 0 && (
                    <>
                      <p
                        className="text-sm font-semibold mt-3 mb-1"
                        style={{ color: "rgba(255,255,255,0.45)" }}
                      >
                        past uploads
                      </p>
                      {past.map((v) => (
                        <DocRow key={v.displayVersion} item={v} />
                      ))}
                    </>
                  )}
                </div>
              );
            })()}

            {/* Button pinned to bottom */}
            {!_uploadsLocked && canUploadMore ? (
              <button
                onClick={() => {
                  setPortfolioUrl(latestVersion?.url ?? "");
                  setWalkthroughUrl("");
                  setNotes("");
                  setError("");
                  setUrlLocked(!!latestVersion?.url);
                  setView("form");
                }}
                className="w-full mt-6 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                style={{
                  border: "1.5px solid #FFD007",
                  color: "#FFD007",
                  background: "transparent"
                }}
              >
                update portfolio
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M3.75 9h10.5M9.75 4.5 14.25 9l-4.5 4.5"
                    stroke="#FFD007"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ResumeModal
═══════════════════════════════════════════════════════════════════════════ */
function ResumeModal({ user, batchId, versions, sessions, onClose, onSaved }) {
  const [view, setView] = useState(versions.length === 0 ? "form" : "versions");
  const [urlMode, setUrlMode] = useState("file");
  const [resumeUrl, setResumeUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null); // { name, url, size, type, previewUrl }
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileError, setFileError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileInputRef = useRef(null);

  const generatePreview = async (file, ext) => {
    // Images — FileReader gives a base64 data URL, works everywhere
    if (
      file.type.startsWith("image/") ||
      ["png", "jpg", "jpeg", "gif", "webp"].includes(ext)
    ) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result ?? null);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    }
    // PDFs — render page 1 to canvas via PDF.js
    if (file.type === "application/pdf" || ext === "pdf") {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1 });
        const scale = 56 / Math.min(viewport.width, viewport.height);
        const scaled = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = scaled.width;
        canvas.height = scaled.height;
        await page.render({
          canvasContext: canvas.getContext("2d"),
          viewport: scaled
        }).promise;
        return canvas.toDataURL("image/jpeg", 0.8);
      } catch {
        return null;
      }
    }
    return null;
  };

  const handleFileSelect = async (file) => {
    if (!file) return;
    const allowed = [
      "application/pdf",
      "application/zip",
      "image/png",
      "image/jpeg",
      "image/jpg"
    ];
    const maxSize = 25 * 1024 * 1024;
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (
      !allowed.includes(file.type) &&
      !["pdf", "zip", "png", "jpg", "jpeg"].includes(ext)
    ) {
      setFileError("only pdf, zip, png, jpg files are accepted");
      return;
    }
    if (file.size > maxSize) {
      setFileError("file must be under 25mb");
      return;
    }
    setFileError("");
    setUploadingFile(true);
    // Generate preview in parallel with upload
    const [previewUrl, uploadResult] = await Promise.all([
      generatePreview(file, ext),
      supabase.storage
        .from("mentorship-portfolios")
        .upload(
          `${user.id}/${Date.now()}_${file.name.replace(/\s+/g, "_")}`,
          file,
          { upsert: true }
        )
    ]);
    setUploadingFile(false);
    if (uploadResult.error) {
      setFileError(uploadResult.error.message);
      return;
    }
    const { data: urlData } = supabase.storage
      .from("mentorship-portfolios")
      .getPublicUrl(uploadResult.data.path);
    setUploadedFile({
      name: file.name,
      url: urlData.publicUrl,
      size: file.size,
      type: file.type,
      ext,
      previewUrl
    });
    setResumeUrl(urlData.publicUrl);
  };

  const isValidUrl = (s) => {
    try {
      new URL(s);
      return true;
    } catch {
      return false;
    }
  };
  const latestVersion = versions[versions.length - 1];
  const _rNow = new Date();
  const _rPastSessions = (sessions || []).filter(
    (s) =>
      new Date(s.session_datetime).getTime() + 2 * 60 * 60 * 1000 <
      _rNow.getTime()
  );
  const _rNextSession = (sessions || []).find(
    (s) =>
      new Date(s.session_datetime).getTime() + 2 * 60 * 60 * 1000 >=
      _rNow.getTime()
  );
  const _rUploadsLocked = (_rNextSession?.session_number ?? 999) >= 5;
  const _rLastPastSession = _rPastSessions[_rPastSessions.length - 1];
  const _rUploadWindowEnd =
    !_rUploadsLocked && _rLastPastSession
      ? new Date(
          new Date(_rLastPastSession.session_datetime).getTime() +
            98 * 60 * 60 * 1000
        )
      : null;
  const canUploadMore =
    !!_rUploadWindowEnd && _rNow.getTime() < _rUploadWindowEnd.getTime();
  const _rMsLeft =
    canUploadMore && _rUploadWindowEnd
      ? Math.max(0, _rUploadWindowEnd.getTime() - _rNow.getTime())
      : 0;
  const rDaysLeft = canUploadMore
    ? Math.max(0, Math.ceil(_rMsLeft / (1000 * 60 * 60 * 24)))
    : null;
  const rHoursLeft =
    canUploadMore && _rMsLeft > 0 && _rMsLeft < 24 * 60 * 60 * 1000
      ? Math.max(1, Math.ceil(_rMsLeft / (1000 * 60 * 60)))
      : null;
  const rTimerColor =
    rHoursLeft !== null
      ? "#FF4500"
      : rDaysLeft !== null && rDaysLeft <= 1
        ? "#FF8C00"
        : "rgba(255,208,7,0.7)";
  const rTimerLabel = canUploadMore
    ? rHoursLeft !== null
      ? `⏱ ${rHoursLeft} hour${rHoursLeft !== 1 ? "s" : ""} left`
      : `⏱ ${rDaysLeft} day${rDaysLeft !== 1 ? "s" : ""} left`
    : null;

  const handleSubmit = async () => {
    setError("");
    if (!canUploadMore) {
      setError("the upload window for this session has closed");
      return;
    }
    if (!resumeUrl.trim()) {
      setError("please add your resume link");
      return;
    }
    if (!isValidUrl(resumeUrl.trim())) {
      setError("please enter a valid url");
      return;
    }
    setSubmitting(true);
    const { error: dbErr } = await supabase
      .from("mentorship_resume_versions")
      .insert({
        user_id: user.id,
        batch_id: batchId,
        version_number: versions.length + 1,
        resume_url: resumeUrl.trim(),
        notes: notes.trim() || null
      });
    setSubmitting(false);
    if (dbErr) {
      setError(dbErr.message);
      return;
    }
    await onSaved();
    setView("versions");
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end md:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.75)" }}
    >
      <div
        className="w-full md:w-[680px] rounded-t-3xl md:rounded-3xl px-6 pt-6 pb-10 relative md:flex md:flex-col md:min-h-[520px] md:border-2 md:border-black md:[box-shadow:8px_8px_0_0_#000000]"
        style={{ background: "#1D1D1F", maxHeight: "90vh", overflowY: "auto" }}
      >
        <div
          className="w-10 h-1 rounded-full mx-auto mb-5 md:hidden"
          style={{ background: "rgba(255,255,255,0.15)" }}
        />
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M2 2l10 10M12 2 2 12"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {view === "form" ? (
          <div className="flex flex-col md:flex-1">
            <h2
              className="text-white font-extrabold text-xl mb-1"
              style={{ letterSpacing: "-0.02em" }}
            >
              {versions.length === 0
                ? "ready to submit your resume?"
                : "ready to update your resume?"}
            </h2>
            {rTimerLabel ? (
              <p className="text-[14px] mb-4" style={{ color: rTimerColor }}>
                {rTimerLabel} to submit
              </p>
            ) : (
              <div className="mb-4" />
            )}

            {/* Mode toggle */}
            <div
              className="flex rounded-xl p-1 mb-4"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              {[
                ["upload a file", "file"],
                ["paste a link", "link"]
              ].map(([label, mode]) => (
                <button
                  key={mode}
                  onClick={() => {
                    setUrlMode(mode);
                    if (mode === "link") {
                      setUploadedFile(null);
                    } else {
                      setResumeUrl("");
                    }
                    setFileError("");
                  }}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold transition-colors"
                  style={{
                    background: urlMode === mode ? "#FFD007" : "transparent",
                    color:
                      urlMode === mode ? "#161618" : "rgba(255,255,255,0.4)"
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.zip,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
            />

            {/* Fixed-height input area — prevents layout shift when switching tabs */}
            <div style={{ minHeight: "128px" }} className="mb-4">
              {urlMode === "link" ? (
                <>
                  <p className="text-white/40 text-xs mb-2">
                    google drive, notion, any public link works
                  </p>
                  <input
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    placeholder="https://drive.google.com/…"
                    className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)"
                    }}
                  />
                </>
              ) : uploadedFile ? (
                <div
                  className="w-full rounded-2xl overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)"
                  }}
                >
                  {confirmDelete ? (
                    <div className="flex flex-col items-center justify-center gap-3 px-4 py-5">
                      <p className="text-white text-sm font-semibold text-center">
                        remove this file?
                      </p>
                      <div className="flex gap-3 w-full">
                        <button
                          onClick={() => setConfirmDelete(false)}
                          className="flex-1 py-2 rounded-xl text-sm font-semibold"
                          style={{
                            background: "rgba(255,255,255,0.08)",
                            color: "rgba(255,255,255,0.7)"
                          }}
                        >
                          keep it
                        </button>
                        <button
                          onClick={() => {
                            setUploadedFile(null);
                            setResumeUrl("");
                            setConfirmDelete(false);
                          }}
                          className="flex-1 py-2 rounded-xl text-sm font-semibold"
                          style={{ background: "#FF4444", color: "white" }}
                        >
                          yes, remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-3">
                      {/* Thumbnail */}
                      <div
                        className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden flex-shrink-0"
                        style={
                          uploadedFile.previewUrl
                            ? {
                                backgroundImage: `url(${uploadedFile.previewUrl})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center"
                              }
                            : { background: "rgba(255,255,255,0.08)" }
                        }
                      >
                        {!uploadedFile.previewUrl && (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <svg
                              width="22"
                              height="26"
                              viewBox="0 0 22 26"
                              fill="none"
                            >
                              <rect
                                x="1"
                                y="1"
                                width="15"
                                height="20"
                                rx="2.5"
                                fill="rgba(255,255,255,0.07)"
                                stroke="rgba(255,255,255,0.2)"
                                strokeWidth="1.2"
                              />
                              <path
                                d="M4 7h8M4 10.5h8M4 14h5"
                                stroke="rgba(255,255,255,0.35)"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                              />
                              <rect
                                x="8"
                                y="13"
                                width="13"
                                height="12"
                                rx="2"
                                fill="#2A2A2C"
                                stroke="rgba(255,208,7,0.6)"
                                strokeWidth="1"
                              />
                              <text
                                x="14.5"
                                y="21.5"
                                textAnchor="middle"
                                fill="#FFD007"
                                fontSize="5.5"
                                fontWeight="800"
                                fontFamily="system-ui,sans-serif"
                                style={{
                                  textTransform: "uppercase",
                                  letterSpacing: "0.02em"
                                }}
                              >
                                {(uploadedFile.ext || "file").toUpperCase()}
                              </text>
                            </svg>
                          </div>
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate leading-tight">
                          {uploadedFile.name}
                        </p>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "rgba(255,255,255,0.35)" }}
                        >
                          {uploadedFile.ext} ·{" "}
                          {uploadedFile.size >= 1024 * 1024
                            ? `${(uploadedFile.size / (1024 * 1024)).toFixed(1)}mb`
                            : `${Math.round(uploadedFile.size / 1024)}kb`}{" "}
                          · just now
                        </p>
                      </div>
                      {/* Actions */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-8 h-8 flex items-center justify-center rounded-xl flex-shrink-0 active:opacity-60"
                        style={{ background: "rgba(255,255,255,0.08)" }}
                        title="replace file"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                        >
                          <path
                            d="M9 1.5l2.5 2.5M1.5 11.5l.6-2.8L9 1.5l2.5 2.5-6.9 6.7-2.8.6-.3-.7z"
                            stroke="rgba(255,255,255,0.65)"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => setConfirmDelete(true)}
                        className="w-8 h-8 flex items-center justify-center rounded-xl flex-shrink-0 active:opacity-60"
                        style={{ background: "rgba(255,255,255,0.08)" }}
                        title="remove file"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                        >
                          <path
                            d="M2 3.5h10M5.5 3.5V2.5h3v1M3 3.5l.7 8h6.6l.7-8"
                            stroke="rgba(255,255,255,0.65)"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    handleFileSelect(e.dataTransfer.files?.[0]);
                  }}
                  onClick={() =>
                    !uploadingFile && fileInputRef.current?.click()
                  }
                  className="w-full h-full px-4 py-5 rounded-xl flex flex-col items-center justify-center gap-2"
                  style={{
                    background: dragOver
                      ? "rgba(255,208,7,0.06)"
                      : "rgba(255,255,255,0.04)",
                    border: `1px dashed ${dragOver ? "#FFD007" : "rgba(255,255,255,0.15)"}`,
                    cursor: uploadingFile ? "default" : "pointer",
                    transition: "border-color 0.15s, background 0.15s",
                    minHeight: "120px"
                  }}
                >
                  {uploadingFile ? (
                    <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white/70 animate-spin" />
                  ) : (
                    <>
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M12 16V8M12 8l-3 3M12 8l3 3"
                          stroke="rgba(255,255,255,0.5)"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M20 16.5A4 4 0 0 0 18 9h-.8A7 7 0 1 0 5 15.9"
                          stroke="rgba(255,255,255,0.3)"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                      </svg>
                      <p
                        className="text-sm"
                        style={{ color: "rgba(255,255,255,0.55)" }}
                      >
                        drop your file here or{" "}
                        <span style={{ color: "#FFD007" }}>browse</span>
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "rgba(255,255,255,0.25)" }}
                      >
                        pdf · zip · png · jpg &nbsp; max 25mb
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
            {fileError && (
              <p className="text-red-400 text-xs mb-3 -mt-2">{fileError}</p>
            )}

            {/* Button pinned to bottom */}
            <div className="mt-auto pt-5">
              {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
              {(() => {
                const rCanSubmit =
                  (urlMode === "link"
                    ? resumeUrl.trim().length > 0
                    : !!uploadedFile) &&
                  canUploadMore &&
                  !submitting;
                return (
                  <button
                    onClick={handleSubmit}
                    disabled={!rCanSubmit}
                    className="w-full flex items-center justify-center gap-2 py-3.5 font-bold"
                    style={{
                      background: "#161618",
                      color: rCanSubmit ? "#FFD007" : "rgba(255,208,7,0.35)",
                      border: `1.5px solid ${rCanSubmit ? "#FFD007" : "rgba(255,208,7,0.35)"}`,
                      borderRadius: "16px",
                      boxShadow: rCanSubmit ? "4px 4px 0 #806804" : "none",
                      fontSize: "15px",
                      letterSpacing: "-0.01em",
                      cursor: rCanSubmit ? "pointer" : "not-allowed"
                    }}
                  >
                    {submitting
                      ? "saving…"
                      : versions.length === 0
                        ? "upload resume"
                        : "save"}
                    {!submitting && (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                      >
                        <path
                          d="M3.75 9h10.5M9.75 4.5 14.25 9l-4.5 4.5"
                          stroke={
                            rCanSubmit ? "#FFD007" : "rgba(255,208,7,0.35)"
                          }
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                );
              })()}
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-1">
            {/* Header */}
            <h2
              className="text-white font-extrabold text-4xl text-center mt-4 mb-1"
              style={{ letterSpacing: "-0.04em" }}
            >
              resume
            </h2>
            {latestVersion && (
              <div className="text-center mb-4">
                <p className="text-white/35 text-[18px]">
                  version {versions.length} · last updated{" "}
                  {new Date(latestVersion.created_at)
                    .toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long"
                    })
                    .toLowerCase()}
                </p>
                {canUploadMore && rTimerLabel && (
                  <p
                    className="text-[14px] mt-1"
                    style={{ color: rTimerColor }}
                  >
                    {rTimerLabel} to update
                  </p>
                )}
              </div>
            )}

            {/* Version rows — centered vertically on desktop */}
            {(() => {
              const reversed = [...versions].reverse();
              const current = reversed[0];
              const past = reversed.slice(1);
              const ResumeRow = ({ v }) => (
                <a
                  key={v.id}
                  href={v.resume_url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3.5 rounded-2xl active:opacity-75"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)"
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background:
                        v.version_number === versions.length
                          ? "#FFD007"
                          : "rgba(255,255,255,0.1)",
                      color:
                        v.version_number === versions.length
                          ? "#161618"
                          : "rgba(255,255,255,0.6)"
                    }}
                  >
                    {v.version_number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {getVersionLabel(v.resume_url)}
                    </p>
                    <p className="text-white/35 text-xs">
                      last updated{" "}
                      {new Date(v.created_at)
                        .toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long"
                        })
                        .toLowerCase()}
                      ,{" "}
                      {new Date(v.created_at).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false
                      })}
                    </p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M6 4l4 4-4 4"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              );
              return (
                <div className="flex flex-col gap-2 py-2 md:flex-1 md:justify-center">
                  {current && <ResumeRow v={current} />}
                  {past.length > 0 && (
                    <>
                      <p
                        className="text-sm font-semibold mt-3 mb-1"
                        style={{ color: "rgba(255,255,255,0.45)" }}
                      >
                        past uploads
                      </p>
                      {past.map((v) => (
                        <ResumeRow key={v.id} v={v} />
                      ))}
                    </>
                  )}
                </div>
              );
            })()}
            {!_rUploadsLocked && canUploadMore ? (
              <button
                onClick={() => {
                  setResumeUrl("");
                  setNotes("");
                  setError("");
                  setUploadedFile(null);
                  setUrlMode("file");
                  setView("form");
                }}
                className="w-full mt-6 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                style={{
                  border: "1.5px solid #FFD007",
                  color: "#FFD007",
                  background: "transparent"
                }}
              >
                update resume
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M3.75 9h10.5M9.75 4.5 14.25 9l-4.5 4.5"
                    stroke="#FFD007"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
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
  onViewPastSessions,
  onBack,
  userPlan,
  acceleratorBonus: _acceleratorBonusProp,
  acceleratorCalls: _acceleratorCallsProp = []
}) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackSession, setFeedbackSession] = useState(null);
  const [portfolioVersions, setPortfolioVersions] = useState([]);
  const [resumeVersions, setResumeVersions] = useState([]);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [googleSheetUrl, setGoogleSheetUrl] = useState(null);
  const [now, setNow] = useState(new Date());

  // Local accelerator state — fetched fresh on mount so stale parent state
  // (e.g. bonus created by admin after page load) doesn't prevent the
  // booking link from working.
  const [localBonus, setLocalBonus] = useState(_acceleratorBonusProp);
  const [localCalls, setLocalCalls] = useState(_acceleratorCallsProp);

  const firstName = user?.name?.split(" ")[0]?.toLowerCase() || "there";

  // Tick every 30 s so canJoin auto-enables at the 15-min mark without a refresh
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Sync if parent prop changes (e.g. parent re-fetched after page reload)
  useEffect(() => { setLocalBonus(_acceleratorBonusProp); }, [_acceleratorBonusProp]);
  useEffect(() => { setLocalCalls(_acceleratorCallsProp); }, [_acceleratorCallsProp]);

  // Always fetch bonus + calls directly — parent prop may be stale if bonus
  // was created after the initial page load.
  useEffect(() => {
    if (!user?.id || !batchId || userPlan !== "accelerator") return;
    supabase
      .from("mentorship_accelerator_bonus")
      .select("*")
      .eq("user_id", user.id)
      .eq("batch_id", batchId)
      .maybeSingle()
      .then(({ data: bonus }) => {
        setLocalBonus(bonus || null);
        if (bonus?.id) {
          supabase
            .from("mentorship_1on1_calls")
            .select("*")
            .eq("bonus_id", bonus.id)
            .order("call_datetime", { ascending: true })
            .then(({ data: calls }) => setLocalCalls(calls || []));
        }
      });
  }, [user?.id, batchId, userPlan]);

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

      // Portfolio / resume versions + batch google sheet URL
      if (user?.id) {
        supabase
          .from("mentorship_portfolio_versions")
          .select("*")
          .eq("user_id", user.id)
          .order("version_number", { ascending: true })
          .then(({ data }) => setPortfolioVersions(data || []));
        supabase
          .from("mentorship_resume_versions")
          .select("*")
          .eq("user_id", user.id)
          .order("version_number", { ascending: true })
          .then(({ data }) => setResumeVersions(data || []));
      }
      if (batchId) {
        supabase
          .from("mentorship_batches")
          .select("google_sheet_url")
          .eq("id", batchId)
          .maybeSingle()
          .then(({ data }) =>
            setGoogleSheetUrl(data?.google_sheet_url || null)
          );
      }

      // Find sessions that ended 45+ min ago (enough time has passed to give feedback)
      const now = new Date();
      const pastSessions = loadedSessions.filter(
        (s) =>
          new Date(s.session_datetime).getTime() + 45 * 60 * 1000 <
          now.getTime()
      );
      if (pastSessions.length === 0) return;

      // Check which ones already have feedback from this user
      const { data: feedbackData } = await supabase
        .from("mentorship_session_feedback")
        .select("session_id")
        .eq("user_id", user.id)
        .in(
          "session_id",
          pastSessions.map((s) => s.id)
        );

      const reviewedIds = new Set(
        (feedbackData || []).map((f) => f.session_id)
      );
      // Also check localStorage for sessions dismissed locally (handles DB save failures)
      let localDismissed = [];
      try {
        localDismissed = JSON.parse(
          localStorage.getItem(`fb_ok_${user.id}`) || "[]"
        );
      } catch {}
      // Show popup for the most recent past session not yet reviewed
      const unreviewed = pastSessions.filter(
        (s) => !reviewedIds.has(s.id) && !localDismissed.includes(s.id)
      );
      if (unreviewed.length > 0) {
        setFeedbackSession(unreviewed[unreviewed.length - 1]);
      }
    })();
  }, [batchId]);

  const upcomingSession =
    sessions.find((s) => new Date(s.session_datetime) >= now) ||
    sessions[sessions.length - 1];
  const fmt = formatSessionDate(upcomingSession?.session_datetime);
  const hasPastRecordings = sessions.some(
    (s) => s.recording_path && new Date(s.session_datetime) < now
  );
  const hasPastSession = sessions.some(
    (s) => new Date(s.session_datetime) < now
  );
  const mentorshipReportUrl = [...portfolioVersions]
    .reverse()
    .find((v) => v.review_report_url)?.review_report_url;
  const reportUrl = portfolioReview?.review_report_url || mentorshipReportUrl;

  // ── Accelerator bonus detection ──────────────────────────────────────────
  const allSessionsDone =
    !loading &&
    sessions.length >= 5 &&
    sessions.every(
      (s) =>
        new Date(s.session_datetime).getTime() + 2 * 60 * 60 * 1000 <
        now.getTime()
    );
  const showAcceleratorUI = userPlan === "accelerator" && allSessionsDone;

  if (showAcceleratorUI) {
    const totalCalls = localBonus?.total_calls ?? 4;
    const activeCalls = localCalls.filter(
      (c) => c.status !== "cancelled"
    );
    const callsUsed = activeCalls.length;
    const callsRemaining = totalCalls - callsUsed;
    const allCallsUsed = callsRemaining <= 0;

    const upcomingCall =
      activeCalls.find(
        (c) =>
          c.status === "scheduled" &&
          new Date(c.call_datetime).getTime() > now.getTime()
      ) || null;

    const canJoinCall =
      upcomingCall &&
      now.getTime() >=
        new Date(upcomingCall.call_datetime).getTime() - 15 * 60 * 1000;

    // Format call datetime: "tue, 24 jun · 7:00 pm IST"
    const fmtCall = upcomingCall
      ? (() => {
          const d = new Date(upcomingCall.call_datetime);
          const o = { timeZone: "Asia/Kolkata" };
          const wd = d
            .toLocaleString("en-IN", { ...o, weekday: "short" })
            .toLowerCase();
          const day = d.toLocaleString("en-IN", { ...o, day: "numeric" });
          const mon = d
            .toLocaleString("en-IN", { ...o, month: "short" })
            .toLowerCase();
          const t = d
            .toLocaleString("en-IN", {
              ...o,
              hour: "numeric",
              minute: "2-digit",
              hour12: true
            })
            .toLowerCase()
            .replace(/\s*ist\s*/gi, "")
            .replace(/ /g, "");
          return { date: `${wd}, ${day} ${mon}`, time: t };
        })()
      : null;

    // Format valid_until: "sat, 30 nov"
    const validUntilStr = localBonus?.valid_until
      ? (() => {
          const d = new Date(localBonus.valid_until);
          const o = { timeZone: "Asia/Kolkata" };
          const wd = d
            .toLocaleString("en-IN", { ...o, weekday: "short" })
            .toLowerCase();
          const day = d.toLocaleString("en-IN", { ...o, day: "numeric" });
          const mon = d
            .toLocaleString("en-IN", { ...o, month: "short" })
            .toLowerCase();
          return `${wd}, ${day} ${mon}`;
        })()
      : null;

    const firstName = user?.name?.split(" ")[0]?.toLowerCase() || "there";

    // Shared document rows
    const accelDocRow = (icon, label, onClick, active = true) => (
      <button
        key={label}
        onClick={onClick}
        disabled={!active}
        className="w-full flex items-center justify-between px-5 py-4 rounded-2xl active:opacity-75"
        style={{
          background: active
            ? "rgba(255,255,255,0.05)"
            : "rgba(255,255,255,0.03)",
          border: `1px solid ${active ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.06)"}`,
          cursor: active ? "pointer" : "default"
        }}
      >
        <div className="flex items-center gap-3">
          <img
            src={icon}
            alt=""
            className="w-5 h-5"
            style={{ opacity: active ? 1 : 0.3 }}
          />
          <span
            className="text-sm font-medium"
            style={{ color: active ? "white" : "rgba(255,255,255,0.3)" }}
          >
            {label}
          </span>
        </div>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M6 4l4 4-4 4"
            stroke={active ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.15)"}
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    );

    const arrowSvg = (color = "#161618") => (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d="M3.75 9h10.5M9.75 4.5 14.25 9l-4.5 4.5"
          stroke={color}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );

    // ── State 3: all calls used ────────────────────────────────
    if (allCallsUsed) {
      return (
        <div
          className="min-h-screen flex flex-col"
          style={{ backgroundColor: "#161618" }}
        >
          {showPortfolioModal && (
            <PortfolioModal
              user={user}
              batchId={batchId}
              portfolioReview={portfolioReview}
              versions={portfolioVersions}
              sessions={sessions}
              onClose={() => setShowPortfolioModal(false)}
              onSaved={async () => {
                const { data } = await supabase
                  .from("mentorship_portfolio_versions")
                  .select("*")
                  .eq("user_id", user.id)
                  .order("version_number", { ascending: true });
                setPortfolioVersions(data || []);
              }}
            />
          )}
          {showResumeModal && (
            <ResumeModal
              user={user}
              batchId={batchId}
              versions={resumeVersions}
              sessions={sessions}
              onClose={() => setShowResumeModal(false)}
              onSaved={async () => {
                const { data } = await supabase
                  .from("mentorship_resume_versions")
                  .select("*")
                  .eq("user_id", user.id)
                  .order("version_number", { ascending: true });
                setResumeVersions(data || []);
              }}
            />
          )}
          <BackButton onClick={onBack} />
          <div className="flex-1 flex flex-col px-5 pt-28 pb-16 w-full mx-auto md:max-w-[75vw]">
            <h1
              className="text-white font-extrabold mb-8"
              style={{
                fontSize: "clamp(34px, 8vw, 52px)",
                letterSpacing: "-0.03em",
                lineHeight: 1.1
              }}
            >
              all sessions
              <br />
              completed.
            </h1>

            <p className="text-white/35 text-sm mb-3">my documents</p>
            <div className="flex flex-col gap-2 mb-10">
              {accelDocRow(upload_portfolio, "portfolio", () =>
                setShowPortfolioModal(true)
              )}
              {reportUrl &&
                accelDocRow(portfolio_report_icon, "portfolio review", () =>
                  window.open(reportUrl, "_blank")
                )}
              {accelDocRow(upload_resume, "resume", () =>
                setShowResumeModal(true)
              )}
              {googleSheetUrl
                ? accelDocRow(upload_sheet, "google sheet", () =>
                    window.open(googleSheetUrl, "_blank")
                  )
                : accelDocRow(upload_sheet, "google sheet", null, false)}
            </div>

            <button
              onClick={onViewPastSessions}
              className="w-full flex items-center justify-center gap-2 font-bold rounded-2xl py-4"
              style={{
                background: "#FFD007",
                color: "#161618",
                fontSize: "clamp(15px, 3vw, 17px)",
                letterSpacing: "-0.01em"
              }}
            >
              view past sessions & recordings
              {arrowSvg()}
            </button>
          </div>
        </div>
      );
    }

    // ── State 1 / 2: bonus calls available ────────────────────
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: "#161618" }}
      >
        {showPortfolioModal && (
          <PortfolioModal
            user={user}
            batchId={batchId}
            portfolioReview={portfolioReview}
            versions={portfolioVersions}
            sessions={sessions}
            onClose={() => setShowPortfolioModal(false)}
            onSaved={async () => {
              const { data } = await supabase
                .from("mentorship_portfolio_versions")
                .select("*")
                .eq("user_id", user.id)
                .order("version_number", { ascending: true });
              setPortfolioVersions(data || []);
            }}
          />
        )}
        {showResumeModal && (
          <ResumeModal
            user={user}
            batchId={batchId}
            versions={resumeVersions}
            sessions={sessions}
            onClose={() => setShowResumeModal(false)}
            onSaved={async () => {
              const { data } = await supabase
                .from("mentorship_resume_versions")
                .select("*")
                .eq("user_id", user.id)
                .order("version_number", { ascending: true });
              setResumeVersions(data || []);
            }}
          />
        )}
        <BackButton onClick={onBack} />

        <div className="flex-1 flex flex-col px-5 pt-28 pb-16 w-full mx-auto md:max-w-[75vw]">
          {/* Plan badge */}
          <span
            className="inline-flex items-center self-start mb-5 rounded-full px-3 py-1.5 text-xs font-bold"
            style={{
              background: "rgba(255,208,7,0.15)",
              color: "#FFD007",
              letterSpacing: "0.02em"
            }}
          >
            · accelerator plan ·
          </span>

          {/* Heading */}
          <h1
            className="text-white font-extrabold mb-2"
            style={{
              fontSize: "clamp(34px, 8vw, 52px)",
              letterSpacing: "-0.03em",
              lineHeight: 1.1
            }}
          >
            you've made it,
            <br />
            {firstName}.
          </h1>
          <p
            className="mb-7"
            style={{
              color: "rgba(255,255,255,0.45)",
              fontSize: "clamp(14px, 2.5vw, 17px)",
              letterSpacing: "-0.01em"
            }}
          >
            all 5 sessions wrapped up. but before you leave, here's something
            special for you..
          </p>

          {/* Yellow bonus card */}
          <div
            className="rounded-3xl p-6 mb-8"
            style={{ background: "#FFD007" }}
          >
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold mb-5"
              style={{ background: "rgba(255,255,255,0.45)", color: "#161618" }}
            >
              · your accelerator bonus ·
            </span>

            <h2
              className="font-black mb-2"
              style={{
                color: "#C2185B",
                fontSize: "clamp(26px, 6vw, 34px)",
                letterSpacing: "-0.03em",
                lineHeight: 1.1
              }}
            >
              4 more 1:1 calls
              <br />
              with mentor
            </h2>
            <p
              className="text-sm mb-5 leading-relaxed"
              style={{ color: "rgba(0,0,0,0.6)" }}
            >
              book whenever something needs a second pair of eyes – interviews,
              projects, decisions.
            </p>

            {/* Progress tracker */}
            <div
              className="rounded-xl px-4 py-3 mb-5"
              style={{ background: "rgba(0,0,0,0.1)" }}
            >
              <div
                className="flex justify-between items-center text-sm font-semibold mb-2.5"
                style={{ color: "rgba(0,0,0,0.6)" }}
              >
                <span>calls remaining</span>
                <span>
                  {callsRemaining} of {totalCalls}
                </span>
              </div>
              <div className="flex gap-1.5">
                {Array.from({ length: totalCalls }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-1.5 rounded-full"
                    style={{
                      background:
                        i < callsUsed ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.15)"
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Book button */}
            <a
              href={localBonus?.booking_link || "#"}
              target={localBonus?.booking_link ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold mb-3"
              style={{
                background: "#161618",
                color: "#FFD007",
                fontSize: "clamp(15px, 3vw, 17px)",
                letterSpacing: "-0.01em",
                textDecoration: "none"
              }}
            >
              book a call
              {arrowSvg("#FFD007")}
            </a>

            {/* Validity */}
            {validUntilStr && (
              <p
                className="text-xs text-center"
                style={{ color: "rgba(0,0,0,0.45)" }}
              >
                valid for the next 6 months · expires {validUntilStr}
              </p>
            )}
          </div>

          {/* Scheduled calls */}
          <h2
            className="text-white font-bold mb-4"
            style={{
              fontSize: "clamp(18px, 4vw, 22px)",
              letterSpacing: "-0.02em"
            }}
          >
            scheduled calls
          </h2>

          {upcomingCall && fmtCall ? (
            <div
              className="rounded-2xl p-5 mb-8"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)"
              }}
            >
              <span
                className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold mb-4"
                style={{
                  background: "rgba(101,78,0,0.55)",
                  color: "#FFD007",
                  letterSpacing: "0.02em"
                }}
              >
                · upcoming ·
              </span>
              <p
                className="text-white font-extrabold mb-1 leading-tight"
                style={{
                  fontSize: "clamp(20px, 5vw, 28px)",
                  letterSpacing: "-0.025em"
                }}
              >
                {fmtCall.date} · {fmtCall.time}{" "}
                <span style={{ textTransform: "uppercase" }}>IST</span>
              </p>
              <p
                className="text-sm mb-5"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                1:1 with {upcomingCall.mentor_name || "mentor"} ·{" "}
                {upcomingCall.duration_minutes || 30} mins ·{" "}
                {upcomingCall.platform || "google meet"}
              </p>
              <a
                href={canJoinCall ? upcomingCall.meeting_link || "#" : "#"}
                onClick={!canJoinCall ? (e) => e.preventDefault() : undefined}
                target={
                  canJoinCall && upcomingCall.meeting_link
                    ? "_blank"
                    : undefined
                }
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold"
                style={{
                  background: canJoinCall
                    ? "rgba(255,208,7,0.9)"
                    : "rgba(255,208,7,0.2)",
                  color: canJoinCall ? "#161618" : "rgba(255,208,7,0.45)",
                  fontSize: "clamp(15px, 3vw, 17px)",
                  letterSpacing: "-0.01em",
                  cursor: canJoinCall ? "pointer" : "not-allowed",
                  textDecoration: "none"
                }}
              >
                join the call
                {arrowSvg(canJoinCall ? "#161618" : "rgba(255,208,7,0.45)")}
              </a>
              <p
                className="text-center text-xs mt-2.5"
                style={{ color: "rgba(255,255,255,0.2)" }}
              >
                button enables 15 mins before the session starts
              </p>
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center py-10 rounded-2xl mb-8"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)"
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                className="mb-3"
              >
                <rect
                  x="4"
                  y="6"
                  width="24"
                  height="22"
                  rx="3"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1.5"
                />
                <path
                  d="M4 13h24M11 3v6M21 3v6"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <p
                className="text-sm font-medium"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                nothing booked yet
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: "rgba(255,255,255,0.2)" }}
              >
                your first call will show up here once scheduled
              </p>
            </div>
          )}

          {/* Documents */}
          <p className="text-white/35 text-sm mb-3">my documents</p>
          <div className="flex flex-col gap-2 mb-8">
            {accelDocRow(upload_portfolio, "portfolio", () =>
              setShowPortfolioModal(true)
            )}
            {reportUrl &&
              accelDocRow(portfolio_report_icon, "portfolio review", () =>
                window.open(reportUrl, "_blank")
              )}
            {accelDocRow(upload_resume, "resume", () =>
              setShowResumeModal(true)
            )}
            {googleSheetUrl
              ? accelDocRow(upload_sheet, "google sheet", () =>
                  window.open(googleSheetUrl, "_blank")
                )
              : accelDocRow(upload_sheet, "google sheet", null, false)}
          </div>

          {/* View past sessions */}
          <button
            onClick={onViewPastSessions}
            className="w-full flex items-center justify-center gap-2 font-bold rounded-2xl py-4"
            style={{
              background: "#FFD007",
              color: "#161618",
              fontSize: "clamp(15px, 3vw, 17px)",
              letterSpacing: "-0.01em"
            }}
          >
            {hasPastRecordings
              ? "view past sessions & recordings"
              : "view past sessions"}
            {arrowSvg()}
          </button>
        </div>
      </div>
    );
  }

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
      {showPortfolioModal && (
        <PortfolioModal
          user={user}
          batchId={batchId}
          portfolioReview={portfolioReview}
          versions={portfolioVersions}
          sessions={sessions}
          onClose={() => setShowPortfolioModal(false)}
          onSaved={async () => {
            const { data } = await supabase
              .from("mentorship_portfolio_versions")
              .select("*")
              .eq("user_id", user.id)
              .order("version_number", { ascending: true });
            setPortfolioVersions(data || []);
          }}
        />
      )}
      {showResumeModal && (
        <ResumeModal
          user={user}
          batchId={batchId}
          versions={resumeVersions}
          sessions={sessions}
          onClose={() => setShowResumeModal(false)}
          onSaved={async () => {
            const { data } = await supabase
              .from("mentorship_resume_versions")
              .select("*")
              .eq("user_id", user.id)
              .order("version_number", { ascending: true });
            setResumeVersions(data || []);
          }}
        />
      )}
      <BackButton onClick={onBack} />

      <div className="flex-1 flex flex-col justify-center px-5 pt-28 pb-16 w-full mx-auto md:max-w-[75vw]">
        <div>
          {/* ── Content ── */}
          <div>
            <p
              className="text-white font-medium mb-2"
              style={{
                fontSize: "clamp(14px, 2.4vw, 20px)",
                letterSpacing: "-0.01em"
              }}
            >
              {/* you&apos;re all set {firstName}! */}
              hi {firstName}, explore your mentorship program...
            </p>

            {/* Upcoming session banner */}
            {loading && (
              <div className="mb-6">
                <div
                  className="w-full rounded-2xl overflow-hidden"
                  style={{ background: "#FFD007" }}
                >
                  <div className="p-5">
                    <div
                      className="h-6 w-36 rounded-full mb-4 animate-pulse"
                      style={{ background: "rgba(0,0,0,0.1)" }}
                    />
                    <div
                      className="h-7 w-3/4 rounded-xl mb-2 animate-pulse"
                      style={{ background: "rgba(0,0,0,0.1)" }}
                    />
                    <div
                      className="h-4 w-1/2 rounded-lg animate-pulse"
                      style={{ background: "rgba(0,0,0,0.08)" }}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <div
                    className="h-12 w-full rounded-2xl animate-pulse mb-2"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  />
                  <div
                    className="h-3 w-48 rounded animate-pulse"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  />
                </div>
              </div>
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
                  • upcoming session •
                </p>
                <p className="text-white/40 text-sm">
                  session details coming soon
                </p>
              </div>
            )}
            {!loading &&
              upcomingSession &&
              (() => {
                const sessionTime = new Date(upcomingSession.session_datetime);
                const joinFromTime = new Date(
                  sessionTime.getTime() - 15 * 60 * 1000
                );
                const sessionEndEst = new Date(
                  sessionTime.getTime() + 2 * 60 * 60 * 1000
                );
                const canJoin =
                  now >= joinFromTime &&
                  now <= sessionEndEst &&
                  !!upcomingSession.meet_link;
                return (
                  <div className="mb-6">
                    {/* ── Yellow banner card ── */}
                    <div
                      className="w-full rounded-2xl overflow-hidden"
                      style={{ background: "#FFD007" }}
                    >
                      <div className="p-5">
                        {/* pill label */}
                        <div
                          className="inline-flex items-center gap-1 rounded-full px-3 py-1 mb-3"
                          style={{ background: "rgba(0,0,0,0.08)" }}
                        >
                          <span className="text-[11px] font-bold text-black">
                            • upcoming session •
                          </span>
                        </div>

                        <div className="flex items-end justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p
                              className="font-extrabold leading-tight mb-2"
                              style={{
                                fontSize: "clamp(20px, 5vw, 28px)",
                                color: "#DF0586",
                                letterSpacing: "-0.02em"
                              }}
                            >
                              session {upcomingSession.session_number}:{" "}
                              {upcomingSession.name}
                            </p>
                            <p className="text-sm font-medium text-black">
                              {fmt.banner}
                            </p>
                            <p className="text-sm font-medium text-black">
                              {fmt.bannerTime.replace(" IST", "")}{" "}
                              <span style={{ textTransform: "uppercase" }}>
                                IST
                              </span>
                            </p>
                          </div>
                          {/* arrow → session detail */}
                          <button
                            onClick={() =>
                              onViewSessions(upcomingSession.session_number - 1)
                            }
                            className="flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center active:translate-y-[1px] transition-all"
                            style={{
                              background: "#FFD007",
                              border: "2px solid #000",
                              boxShadow: "4px 4px 0px #000"
                            }}
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 18 18"
                              fill="none"
                            >
                              <path
                                d="M3.75 9h10.5M9.75 4.5 14.25 9l-4.5 4.5"
                                stroke="#000"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* ── Join button — outside the card ── */}
                    <div className="mt-3">
                      {canJoin ? (
                        <a
                          href={upcomingSession.meet_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full md:w-[30%] flex items-center justify-center gap-2 font-bold py-3.5"
                          style={{
                            background: "#161618",
                            color: "#FFD007",
                            border: "1.5px solid #FFD007",
                            borderRadius: "16px",
                            boxShadow: "4px 4px 0 #806804",
                            fontSize: "15px",
                            letterSpacing: "-0.01em"
                          }}
                        >
                          join session
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                          >
                            <path
                              d="M3.75 9h10.5M9.75 4.5 14.25 9l-4.5 4.5"
                              stroke="#FFD007"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </a>
                      ) : (
                        <div
                          className="w-full md:w-[30%] flex items-center justify-center gap-2 font-bold py-3.5 cursor-not-allowed"
                          style={{
                            background: "#161618",
                            color: "#FFD007",
                            border: "1.5px solid #FFD007",
                            borderRadius: "16px",
                            boxShadow: "4px 4px 0 #806804",
                            fontSize: "15px",
                            letterSpacing: "-0.01em",
                            opacity: 0.4
                          }}
                        >
                          join session
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                          >
                            <path
                              d="M3.75 9h10.5M9.75 4.5 14.25 9l-4.5 4.5"
                              stroke="#FFD007"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}
                      <p
                        className="text-[11px] mt-2"
                        style={{ color: "rgba(255,255,255,0.35)" }}
                      >
                        {canJoin
                          ? "session is live — good luck!"
                          : "button enables 15 mins before the session starts"}
                      </p>
                    </div>
                  </div>
                );
              })()}

            {/* Portfolio review — shown any time a report is ready, even before session 1 */}
            {!loading && reportUrl && !hasPastSession && (
              <>
                <p className="text-white/35 text-sm mb-3 mt-1">my documents</p>
                <div className="flex flex-col gap-2 mb-5">
                  <a
                    href={reportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-between px-5 py-4 rounded-2xl active:opacity-75"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)"
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={portfolio_report_icon}
                        alt=""
                        className="w-5 h-5"
                      />
                      <span className="text-white text-sm font-medium">
                        portfolio review report
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
                </div>
              </>
            )}

            {/* Tasks + documents — layout varies by upcoming session number */}
            {hasPastSession &&
              !loading &&
              (() => {
                const upNum = upcomingSession?.session_number ?? 999;
                const hasPortfolioUploads =
                  portfolioVersions.length > 0 || !!portfolioReview;
                const hasResumeUploads = resumeVersions.length > 0;
                const chevron = (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M6 4l4 4-4 4"
                      stroke="rgba(255,255,255,0.35)"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                );
                const sheetRow = (label, showNew) =>
                  googleSheetUrl ? (
                    <a
                      key="sheet"
                      href={googleSheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-between px-5 py-4 rounded-2xl active:opacity-75"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)"
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <rect
                            x="3"
                            y="2"
                            width="14"
                            height="16"
                            rx="2"
                            stroke="rgba(255,255,255,0.5)"
                            strokeWidth="1.3"
                          />
                          <path
                            d="M6 7h8M6 10h8M6 13h5"
                            stroke="rgba(255,255,255,0.5)"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="text-white text-sm font-medium">
                          {label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {showNew && (
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: "#FFD007", color: "#161618" }}
                          >
                            new
                          </span>
                        )}
                        {chevron}
                      </div>
                    </a>
                  ) : (
                    <div
                      key="sheet"
                      className="w-full flex items-center justify-between px-5 py-4 rounded-2xl"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)"
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={upload_sheet}
                          alt=""
                          className="w-5 h-5 opacity-30"
                        />
                        <span
                          className="text-sm font-medium"
                          style={{ color: "rgba(255,255,255,0.3)" }}
                        >
                          {label}
                        </span>
                      </div>
                      {chevron}
                    </div>
                  );
                const portfolioRow = (label) => (
                  <button
                    key="portfolio"
                    onClick={() => setShowPortfolioModal(true)}
                    className="w-full flex items-center justify-between px-5 py-4 rounded-2xl active:opacity-75"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)"
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <img src={upload_portfolio} alt="" className="w-5 h-5" />
                      <span className="text-white text-sm font-medium">
                        {label}
                      </span>
                    </div>
                    {chevron}
                  </button>
                );
                const resumeRow = (label) => (
                  <button
                    key="resume"
                    onClick={() => setShowResumeModal(true)}
                    className="w-full flex items-center justify-between px-5 py-4 rounded-2xl active:opacity-75"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)"
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <img src={upload_resume} alt="" className="w-5 h-5" />
                      <span className="text-white text-sm font-medium">
                        {label}
                      </span>
                    </div>
                    {chevron}
                  </button>
                );
                const reviewRow = reportUrl ? (
                  <a
                    key="review"
                    href={reportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-between px-5 py-4 rounded-2xl active:opacity-75"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)"
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={portfolio_report_icon}
                        alt=""
                        className="w-5 h-5"
                      />
                      <span className="text-white text-sm font-medium">
                        portfolio review report
                      </span>
                    </div>
                    {chevron}
                  </a>
                ) : null;

                if (upNum >= 5) {
                  // Session 5+: no tasks, everything in my documents
                  return (
                    <>
                      <p className="text-white/35 text-sm mb-3 mt-1">
                        my documents
                      </p>
                      <div className="flex flex-col gap-2 mb-5">
                        {portfolioRow("portfolio")}
                        {reviewRow}
                        {resumeRow("resume")}
                        {sheetRow("google sheet", false)}
                      </div>
                    </>
                  );
                }
                if (upNum === 4) {
                  return (
                    <>
                      <p className="text-white/35 text-sm mb-3 mt-1">
                        my tasks
                      </p>
                      <div className="flex flex-col gap-2 mb-5">
                        {portfolioRow(
                          hasPortfolioUploads
                            ? "update portfolio"
                            : "upload portfolio"
                        )}
                        {resumeRow(
                          hasResumeUploads ? "update resume" : "upload resume"
                        )}
                        {sheetRow("google sheet", false)}
                      </div>
                      {reportUrl && (
                        <>
                          <p className="text-white/35 text-sm mb-3">
                            my documents
                          </p>
                          <div className="flex flex-col gap-2">{reviewRow}</div>
                        </>
                      )}
                    </>
                  );
                }
                if (upNum === 3) {
                  return (
                    <>
                      <p className="text-white/35 text-sm mb-3 mt-1">
                        my tasks
                      </p>
                      <div className="flex flex-col gap-2 mb-5">
                        {sheetRow("update google sheet – your niche", true)}
                        {portfolioRow(
                          hasPortfolioUploads
                            ? "update portfolio"
                            : "upload portfolio"
                        )}
                        {resumeRow(
                          hasResumeUploads ? "update resume" : "upload resume"
                        )}
                      </div>
                      {reportUrl && (
                        <>
                          <p className="text-white/35 text-sm mb-3">
                            my documents
                          </p>
                          <div className="flex flex-col gap-2">{reviewRow}</div>
                        </>
                      )}
                    </>
                  );
                }
                // Default (session 2 upcoming)
                return (
                  <>
                    <p className="text-white/35 text-sm mb-3 mt-1">my tasks</p>
                    <div className="flex flex-col gap-2 mb-5">
                      {sheetRow("google sheet", false)}
                      {portfolioRow(
                        hasPortfolioUploads
                          ? "update portfolio"
                          : "upload portfolio"
                      )}
                      {resumeRow(
                        hasResumeUploads ? "update resume" : "upload resume"
                      )}
                    </div>
                    {reportUrl && (
                      <>
                        <p className="text-white/35 text-sm mb-3">
                          my documents
                        </p>
                        <div className="flex flex-col gap-2">{reviewRow}</div>
                      </>
                    )}
                  </>
                );
              })()}
          </div>

          {/* ── Resources ── */}
          <div className="mt-10">
            <p className="text-white/35 text-sm mb-4">
              while you wait, here are some resources
            </p>
            <div className="flex flex-col gap-2">
              {[
                {
                  bg: "#0F9D58",
                  label: "skill tracker sheet",
                  desc: "track your weekly design skills and progress",
                  url: "#",
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <rect
                        x="2"
                        y="2"
                        width="18"
                        height="18"
                        rx="2"
                        fill="white"
                        opacity="0.92"
                      />
                      <path
                        d="M10 2v18M2 9h18M2 15h18"
                        stroke="#0F9D58"
                        strokeWidth="1.2"
                        opacity="0.45"
                      />
                      <rect
                        x="2"
                        y="2"
                        width="8"
                        height="7"
                        rx="2"
                        fill="#0F9D58"
                        opacity="0.15"
                      />
                    </svg>
                  )
                },
                {
                  bg: "#1a1a1a",
                  label: "colour theory in movies",
                  desc: "how filmmakers use colour to tell powerful stories",
                  url: "#",
                  icon: (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 22 22"
                      fill="white"
                    >
                      <circle cx="6" cy="11" r="5" />
                      <ellipse cx="15" cy="11" rx="3.5" ry="5" />
                      <ellipse cx="20.5" cy="11" rx="1.5" ry="5" />
                    </svg>
                  )
                },
                {
                  bg: "#CC0000",
                  label: "new york subway system",
                  desc: "design systems in the real world, simplified",
                  url: "#",
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <rect
                        x="2"
                        y="5"
                        width="18"
                        height="12"
                        rx="3"
                        fill="white"
                        opacity="0.9"
                      />
                      <path d="M9 8.5l6 3-6 3v-6z" fill="#CC0000" />
                    </svg>
                  )
                },
                {
                  bg: "#92400E",
                  label: "creative confidence",
                  desc: "build the mindset to create without fear",
                  url: "#",
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <path
                        d="M11 3C8 3 5 5 5 8v1H4a1 1 0 000 2h1v1H4a1 1 0 000 2h1v1a6 6 0 0012 0v-1h1a1 1 0 000-2h-1v-1h1a1 1 0 000-2h-1V8c0-3-3-5-6-5z"
                        fill="white"
                        opacity="0.92"
                      />
                      <circle cx="8.5" cy="10" r="1.2" fill="#92400E" />
                      <circle cx="13.5" cy="10" r="1.2" fill="#92400E" />
                      <path
                        d="M8.5 14c.8 1 4.2 1 5 0"
                        stroke="#92400E"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </svg>
                  )
                },
                {
                  bg: "#1A56DB",
                  label: "claude design features",
                  desc: "designing smarter with AI-powered tools",
                  url: "#",
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <path
                        d="M14 2H6a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V7l-4-5z"
                        fill="white"
                        opacity="0.9"
                      />
                      <path
                        d="M14 2v5h5"
                        fill="none"
                        stroke="rgba(26,86,219,0.3)"
                        strokeWidth="1"
                      />
                      <path
                        d="M7 11h8M7 14h8M7 8h5"
                        stroke="#1A56DB"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  )
                }
              ].map((r) => (
                <a
                  key={r.label}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 px-4 py-3.5 rounded-2xl active:opacity-75"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.07)"
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: r.bg }}
                  >
                    {r.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold">
                      {r.label}
                    </p>
                    <p className="text-white/40 text-xs leading-relaxed">
                      {r.desc}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* view past sessions — shown when at least one recorded session exists */}
        {hasPastRecordings && (
          <button
            onClick={onViewPastSessions}
            className="w-full flex items-center justify-center gap-2 font-bold rounded-2xl mt-8 py-4"
            style={{
              background: "#FFD007",
              color: "#161618",
              fontSize: "clamp(15px, 3vw, 17px)",
              letterSpacing: "-0.01em"
            }}
          >
            view past sessions
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
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Screen 3 — Session detail
═══════════════════════════════════════════════════════════════════════════ */
const EVOLVE_TEAM = [
  {
    name: "yagnesh",
    role: "mentor",
    photo: mentor_yagnesh,
    linkedin: "https://www.linkedin.com/in/yagnesh-ahir-24676516/"
  },
  {
    name: "chesna",
    role: "support team lead",
    photo: chesna1,
    linkedin: "https://www.linkedin.com/in/chesna-sorathiya/"
  },
  {
    name: "yash",
    role: "community manager",
    photo: yash1,
    linkedin: "https://www.linkedin.com/in/yvd-singh/"
  }
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
          className="mx-4 md:max-w-[75vw] md:mx-auto md:w-full rounded-3xl overflow-hidden mb-10"
          style={{ background: "#1D1D1F" }}
        >
          {/* Tabs row */}
          {/* <div className="flex gap-1.5 p-3"> */}
          <div className="flex gap-1 px-3 pt-3 pb-2 w-full">
            {Array.from({ length: tabCount }, (_, i) => {
              const s = sessions[i];
              const isActive = activeTab === i;
              return (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className="flex-1 min-w-0 py-1.5 rounded-lg text-[11px] font-semibold transition-colors text-center"
                  style={{
                    background: "transparent",
                    border: isActive
                      ? "1px solid #FFD007"
                      : "1px solid transparent",
                    color: isActive ? "#FFD007" : "rgba(255,255,255,0.35)"
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
          <div className="px-5 py-6 md:min-h-[230px]">
            {loading ? (
              <div className="flex flex-col gap-3 animate-pulse">
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
                {/* <p className="text-white/40 text-sm mb-1">
                  session {session.session_number}
                </p> */}
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
                <div>
                  <p className="text-white/35 text-xs mb-1.5">happening on</p>
                  <p
                    className="font-semibold text-base"
                    style={{
                      color: past ? "rgba(255,255,255,0.65)" : "#FFD007"
                    }}
                  >
                    {fmt.full.replace(" IST", "")}{" "}
                    <span style={{ textTransform: "uppercase" }}>IST</span>
                  </p>
                </div>
              </>
            ) : (
              <p className="text-white/30 text-sm">no session data found.</p>
            )}
          </div>
        </div>

        {/* ── Team + FAQs (outside the tab card) ── */}
        <div className="px-5 md:max-w-[75vw] md:mx-auto">
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
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4 md:gap-6 mb-12">
            {EVOLVE_TEAM.map((member) => (
              <a
                key={member.name}
                href={member.linkedin || undefined}
                target={member.linkedin ? "_blank" : undefined}
                rel={member.linkedin ? "noopener noreferrer" : undefined}
                className="flex flex-col active:opacity-75 transition-opacity"
                style={{
                  cursor: member.linkedin ? "pointer" : "default",
                  textDecoration: "none"
                }}
              >
                <div
                  className="w-full rounded-2xl mb-2 overflow-hidden"
                  style={{
                    aspectRatio: "1 / 1",
                    background: "rgba(255,255,255,0.06)"
                  }}
                >
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-full h-full object-cover object-top"
                      decoding="async"
                      style={{
                        imageRendering: "high-quality",
                        filter:
                          "grayscale(100%) contrast(1.05) brightness(0.95)"
                      }}
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
                <div className="flex items-center justify-between gap-2">
                  <p className="text-white font-semibold text-sm leading-tight">
                    {member.name}
                  </p>
                  {member.linkedin && (
                    <span
                      className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                      // style={{ background: "#0A66C2" }}
                    >
                      <img
                        src={linkedin_logo}
                        alt="LinkedIn"
                        className="w-4 h-4 object-contain"
                      />
                    </span>
                  )}
                </div>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  {member.role}
                </p>
              </a>
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
                  <span className="text-white font-medium text-[1rem]">
                    {faq.q}
                  </span>
                  <span className="text-white/40 text-xl flex-shrink-0 leading-none mt-0.5">
                    {openFAQ === i ? "−" : "+"}
                  </span>
                </button>
                {openFAQ === i && (
                  <p className="text-white font-normal text-sm pb-4 leading-relaxed">
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
            <a
              href="https://wa.me/919227123007?text=Hi%2C%20I%20have%20a%20question%20about%20evolve%20mentorship%20session"
              target="_blank"
              rel="noopener noreferrer"
              className="text-evolve-yellow font-semibold underline underline-offset-2"
              style={{
                textDecorationColor: "#FFD007",
                textDecorationThickness: "1px"
              }}
            >
              contact us
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CommentBubble — single comment row
═══════════════════════════════════════════════════════════════════════════ */
function CommentBubble({ comment, onReply, isReply }) {
  const avatarSrc =
    comment.avatar_url ||
    `https://api.dicebear.com/7.x/thumbs/svg?seed=${comment.user_id}`;
  const timeStr = new Date(comment.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short"
  });
  return (
    <div className="flex gap-3">
      <img
        src={avatarSrc}
        alt=""
        className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-white text-xs font-semibold">
            {comment.user_name || "user"}
          </span>
          <span className="text-white/30 text-[10px]">{timeStr}</span>
        </div>
        <p className="text-white/70 text-sm leading-relaxed">{comment.body}</p>
        {!isReply && onReply && (
          <button
            onClick={onReply}
            className="text-[11px] text-white/30 mt-1 hover:text-white/60 transition-colors"
          >
            reply
          </button>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CommentsSection
═══════════════════════════════════════════════════════════════════════════ */
function CommentsSection({ session, user }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [posting, setPosting] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("mentorship_session_comments")
      .select("*")
      .eq("session_id", session.id)
      .order("created_at", { ascending: true });
    setComments(data || []);
  };

  useEffect(() => {
    load();
  }, [session.id]);

  const post = async (body, parentId = null, clearFn) => {
    if (!body.trim() || posting) return;
    setPosting(true);
    await supabase.from("mentorship_session_comments").insert({
      session_id: session.id,
      user_id: user.id,
      user_name: user.name || "user",
      avatar_url: user.avatar_url || null,
      body: body.trim(),
      parent_id: parentId
    });
    await load();
    clearFn?.();
    setPosting(false);
  };

  const topLevel = comments.filter((c) => !c.parent_id);
  const repliesFor = (id) => comments.filter((c) => c.parent_id === id);

  return (
    <div>
      {/* new comment input */}
      <div
        className="flex items-center gap-2 mb-6 rounded-2xl px-4 py-3"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)"
        }}
      >
        <input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              post(newComment, null, () => setNewComment(""));
            }
          }}
          placeholder="share something with the group…"
          className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/25"
        />
        <button
          onClick={() => post(newComment, null, () => setNewComment(""))}
          disabled={!newComment.trim() || posting}
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
          style={{
            background: newComment.trim() ? "#FFD007" : "rgba(255,255,255,0.08)"
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M7 12V2M2 7l5-5 5 5"
              stroke={newComment.trim() ? "#161618" : "rgba(255,255,255,0.3)"}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* comment list */}
      <div className="flex flex-col gap-5">
        {topLevel.map((comment) => (
          <div key={comment.id}>
            <CommentBubble
              comment={comment}
              onReply={() => {
                setReplyTo(comment.id);
                setReplyText("");
              }}
            />
            {/* replies */}
            <div className="ml-11 mt-3 flex flex-col gap-3">
              {repliesFor(comment.id).map((reply) => (
                <CommentBubble key={reply.id} comment={reply} isReply />
              ))}
              {replyTo === comment.id && (
                <div className="flex gap-2">
                  <input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`reply to ${comment.user_name}…`}
                    autoFocus
                    className="flex-1 rounded-xl px-3 py-2 text-white text-xs outline-none placeholder:text-white/25"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.1)"
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        post(replyText, comment.id, () => {
                          setReplyText("");
                          setReplyTo(null);
                        });
                      if (e.key === "Escape") setReplyTo(null);
                    }}
                  />
                  <button
                    onClick={() =>
                      post(replyText, comment.id, () => {
                        setReplyText("");
                        setReplyTo(null);
                      })
                    }
                    className="text-xs font-bold px-3 py-2 rounded-xl flex-shrink-0"
                    style={{ background: "#FFD007", color: "#161618" }}
                  >
                    send
                  </button>
                  <button
                    onClick={() => setReplyTo(null)}
                    className="text-xs text-white/35 px-1"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {topLevel.length === 0 && (
          <p className="text-white/25 text-sm">
            no comments yet — be the first!
          </p>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Screen 4 — Past sessions list
═══════════════════════════════════════════════════════════════════════════ */
function PastSessionsScreen({ batchId, onSelectSession, onBack }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!batchId) {
      setLoading(false);
      return;
    }
    supabase
      .from("mentorship_sessions")
      .select("*")
      .eq("batch_id", batchId)
      .not("recording_path", "is", null)
      .order("session_number", { ascending: true })
      .then(({ data }) => {
        const rows = data || [];
        setSessions(rows);
        setLoading(false);
        // Only one recording — skip the listing and go straight to the player
        if (rows.length === 1) {
          onSelectSession(rows[0], true);
        }
      });
  }, [batchId]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#161618" }}
    >
      <BackButton onClick={onBack} />
      <div className="flex-1 flex flex-col justify-center px-5 pt-24 pb-16 md:max-w-5xl md:mx-auto md:px-8 md:w-full">
        <h1
          className="text-white font-bold mb-8"
          style={{
            fontSize: "clamp(24px, 5vw, 36px)",
            letterSpacing: "-0.02em"
          }}
        >
          past sessions
        </h1>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl animate-pulse"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  aspectRatio: "16/9"
                }}
              />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-white/30 text-sm">no recordings available yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSelectSession(session)}
                className="text-left"
              >
                {/* thumbnail */}
                {(() => {
                  const thumb = getVideoThumbnail(session.recording_path);
                  return (
                    <div
                      className="w-full rounded-2xl flex items-center justify-center mb-3 overflow-hidden relative"
                      style={{
                        aspectRatio: "16/9",
                        background: "rgba(255,255,255,0.07)"
                      }}
                    >
                      {thumb ? (
                        <>
                          <img
                            src={thumb}
                            alt={`session ${session.session_number} thumbnail`}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div
                            className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center"
                            style={{ background: "rgba(0,0,0,0.5)" }}
                          >
                            <svg
                              width="22"
                              height="22"
                              viewBox="0 0 24 24"
                              fill="white"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </>
                      ) : (
                        <div
                          className="w-14 h-14 rounded-full flex items-center justify-center"
                          style={{ background: "rgba(255,255,255,0.15)" }}
                        >
                          <svg
                            width="26"
                            height="26"
                            viewBox="0 0 24 24"
                            fill="rgba(255,255,255,0.8)"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })()}
                <p className="text-white font-bold text-sm mb-1">
                  session {session.session_number}: {session.name}
                </p>
                {session.description && (
                  <p className="text-white/40 text-xs leading-relaxed line-clamp-2">
                    {session.description}
                  </p>
                )}
                <div
                  className="h-px mt-4"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Screen 5 — Session recording player
═══════════════════════════════════════════════════════════════════════════ */
function SessionPlayerScreen({ session, user, onBack }) {
  const [activeTab, setActiveTab] = useState("summary");
  const [signedUrl, setSignedUrl] = useState(null);
  const [urlType, setUrlType] = useState(null); // "embed" | "video"
  const [loadingUrl, setLoadingUrl] = useState(!!session.recording_path);

  useEffect(() => {
    if (!session.recording_path) return;
    (async () => {
      setLoadingUrl(true);
      try {
        const {
          data: { session: authSession }
        } = await supabase.auth.getSession();
        const token = authSession?.access_token;
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-recording-url`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ session_id: session.id })
          }
        );
        const json = await res.json();
        if (json.url) {
          setSignedUrl(json.url);
          setUrlType(json.type);
        }
      } finally {
        setLoadingUrl(false);
      }
    })();
  }, [session.id, session.recording_path]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#161618" }}
    >
      <BackButton onClick={onBack} />
      <div className="flex-1 px-5 pt-24 pb-16 md:max-w-5xl md:mx-auto md:px-8 md:w-full">
        <h1
          className="text-white font-bold mb-5"
          style={{
            fontSize: "clamp(20px, 4vw, 30px)",
            letterSpacing: "-0.02em"
          }}
        >
          session {session.session_number}: {session.name}
        </h1>

        {/* video */}
        <div
          className="w-full rounded-2xl overflow-hidden mb-5"
          style={{ aspectRatio: "16/9", background: "#222" }}
        >
          {loadingUrl ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white/70 animate-spin" />
            </div>
          ) : signedUrl ? (
            urlType === "embed" ? (
              <iframe
                src={signedUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ border: "none" }}
              />
            ) : (
              <video
                src={signedUrl}
                controls
                controlsList="nodownload"
                disablePictureInPicture
                className="w-full h-full"
                style={{ objectFit: "contain" }}
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="rgba(255,255,255,0.35)"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* tab switcher */}
        <div
          className="w-full rounded-2xl flex p-1 mb-6"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          {["summary + transcript", "comments"].map((label) => {
            const key =
              label === "summary + transcript" ? "summary" : "comments";
            return (
              <button
                key={label}
                onClick={() => setActiveTab(key)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                style={{
                  background: activeTab === key ? "#FFD007" : "transparent",
                  color: activeTab === key ? "#161618" : "rgba(255,255,255,0.4)"
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* summary + transcript tab */}
        {activeTab === "summary" && (
          <div className="space-y-7">
            {session.summary && (
              <div>
                <h3 className="text-white font-bold text-sm mb-2">
                  summary of the session
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  {session.summary}
                </p>
              </div>
            )}
            {session.next_steps && (
              <div>
                <h3 className="text-white font-bold text-sm mb-2">
                  suggested next steps
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  {session.next_steps}
                </p>
              </div>
            )}
            {session.transcript && (
              <div>
                <h3 className="text-white font-bold text-sm mb-2">
                  transcript of the session
                </h3>
                <p className="text-white/50 text-sm leading-relaxed whitespace-pre-wrap">
                  {session.transcript}
                </p>
              </div>
            )}
            {!session.summary && !session.next_steps && !session.transcript && (
              <p className="text-white/25 text-sm">
                summary and transcript coming soon
              </p>
            )}
          </div>
        )}

        {/* comments tab */}
        {activeTab === "comments" && (
          <CommentsSection session={session} user={user} />
        )}
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

  // screen: 0=welcome, 1=profile setup, 2=onboarding complete, 3=session detail, 4=past sessions, 5=session player
  const [screen, setScreen] = useState(null); // null = still checking
  const [portfolioReview, setPortfolioReview] = useState(null);
  const [batchId, setBatchId] = useState(null);
  const [defaultSessionIndex, setDefaultSessionIndex] = useState(0);
  const [selectedRecordingSession, setSelectedRecordingSession] =
    useState(null);
  const [listingAutoSkipped, setListingAutoSkipped] = useState(false);
  const [userPlan, setUserPlan] = useState(null);
  const [acceleratorBonus, setAcceleratorBonus] = useState(null);
  const [acceleratorCalls, setAcceleratorCalls] = useState([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      sessionStorage.removeItem("ms_screen");
      sessionStorage.removeItem("ms_batch_id");
      sessionStorage.removeItem("ms_session_id");
      navigate("/signin", { state: { from: "/mentorship-session" } });
      return;
    }

    const savedScreen = parseInt(
      sessionStorage.getItem("ms_screen") || "0",
      10
    );

    if (savedScreen >= 2 && savedScreen <= 5) {
      const savedBatchId = sessionStorage.getItem("ms_batch_id");
      if (savedBatchId) setBatchId(savedBatchId);

      // Always fetch portfolioReview fresh — cached value may be stale
      supabase
        .from("portfolio_reviews")
        .select("id, review_status, review_report_url")
        .eq("user_id", user.id)
        .eq("review_status", "done")
        .not("review_report_url", "is", null)
        .maybeSingle()
        .then(({ data }) => setPortfolioReview(data || null));

      if (savedScreen === 5) {
        // Restore the session player — re-fetch session from DB to ensure it still exists
        const savedSessionId = sessionStorage.getItem("ms_session_id");
        if (savedSessionId) {
          supabase
            .from("mentorship_sessions")
            .select("*")
            .eq("id", savedSessionId)
            .maybeSingle()
            .then(({ data }) => {
              if (data) {
                setSelectedRecordingSession(data);
                setScreen(5);
              } else {
                // Session no longer accessible — fall back to listing
                setScreen(4);
              }
            });
          // Screen will be set async above; keep null until then
        } else {
          setScreen(4); // No session id saved, go to listing
        }
      } else {
        setScreen(savedScreen);
      }
    } else {
      setScreen(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  // Persist screens 2-5 to sessionStorage; clear on 0/1
  useEffect(() => {
    if (screen === null) return;
    if (screen >= 2 && screen <= 5) {
      sessionStorage.setItem("ms_screen", String(screen));
    } else {
      sessionStorage.removeItem("ms_screen");
      sessionStorage.removeItem("ms_session_id");
    }
  }, [screen]);

  // Persist batchId
  useEffect(() => {
    if (batchId) sessionStorage.setItem("ms_batch_id", batchId);
  }, [batchId]);

  // Fetch user plan once user is known
  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("mentorship_payments")
      .select("plan")
      .eq("user_id", user.id)
      .eq("status", "success")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setUserPlan(data?.plan || null));
  }, [user?.id]);

  // Fetch accelerator bonus + calls once batch + plan are known
  useEffect(() => {
    if (!user?.id || !batchId || userPlan !== "accelerator") return;
    supabase
      .from("mentorship_accelerator_bonus")
      .select("*")
      .eq("user_id", user.id)
      .eq("batch_id", batchId)
      .maybeSingle()
      .then(({ data: bonus }) => {
        setAcceleratorBonus(bonus || null);
        if (bonus?.id) {
          supabase
            .from("mentorship_1on1_calls")
            .select("*")
            .eq("bonus_id", bonus.id)
            .order("call_datetime", { ascending: true })
            .then(({ data: calls }) => setAcceleratorCalls(calls || []));
        }
      });
  }, [user?.id, batchId, userPlan]);

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
          onViewPastSessions={() => setScreen(4)}
          onBack={() => setScreen(0)}
          userPlan={userPlan}
          acceleratorBonus={acceleratorBonus}
          acceleratorCalls={acceleratorCalls}
          onRefreshAcceleratorCalls={async (bonusId) => {
            if (!bonusId) return;
            const { data } = await supabase
              .from("mentorship_1on1_calls")
              .select("*")
              .eq("bonus_id", bonusId)
              .order("call_datetime", { ascending: true });
            setAcceleratorCalls(data || []);
          }}
        />
      )}

      {screen === 3 && (
        <SessionDetailScreen
          batchId={batchId}
          defaultSessionIndex={defaultSessionIndex}
          onBack={() => setScreen(2)}
        />
      )}

      {screen === 4 && (
        <PastSessionsScreen
          batchId={batchId}
          onSelectSession={(session, autoSkip = false) => {
            setSelectedRecordingSession(session);
            setListingAutoSkipped(autoSkip);
            sessionStorage.setItem("ms_session_id", session.id);
            setScreen(5);
          }}
          onBack={() => setScreen(2)}
        />
      )}

      {screen === 5 && selectedRecordingSession && (
        <SessionPlayerScreen
          session={selectedRecordingSession}
          user={user}
          onBack={() => {
            if (listingAutoSkipped) {
              setListingAutoSkipped(false);
              setScreen(2);
            } else {
              setScreen(4);
            }
          }}
        />
      )}
    </div>
  );
}
