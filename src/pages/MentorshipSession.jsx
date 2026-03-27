import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../supabaseClient";
import BlackNav from "../components/BlackNav";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const FAQS = [
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

/* ─── helpers ─────────────────────────────────────────────────────────────── */
function ordinalDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDate();
  const suffix = ["th","st","nd","rd"][((day % 100) - 20 + 100) % 100 < 4 ? ((day % 100) - 20 + 100) % 100 : day % 10 < 4 ? day % 10 : 0] || "th";
  return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" }).replace(/^/, `${day}${suffix} `);
}

/* ─── Profile mini-sheet ──────────────────────────────────────────────────── */
function ProfileSheet({ user, onClose }) {
  const avatarSrc = user?.avatar_url
    || `https://api.dicebear.com/7.x/thumbs/svg?seed=${user?.id || "u"}`;
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
    const canvas = await html2canvas(receiptRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const w = canvas.width / 2;
    const h = canvas.height / 2;
    const pdf = new jsPDF({ unit: "px", format: [w, h] });
    pdf.addImage(imgData, "PNG", 0, 0, w, h);
    pdf.save(`evolve-receipt-${payment.razorpay_payment_id || Date.now()}.pdf`);
  };

  const rows = payment ? [
    ["plan",       payment.plan === "starter" ? "starter" : "accelerator"],
    ["amount",     `₹${Number(payment.amount).toLocaleString("en-IN")}`],
    ["date",       new Date(payment.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })],
    ["batch",      `batch ${payment.batch?.batch_number ?? "—"}`],
    ["starts on",  payment.batch?.start_date ? ordinalDate(payment.batch.start_date) : "—"],
    ["ref",        payment.razorpay_payment_id || "—"],
  ] : [];

  return (
    <>
      <div className="fixed inset-0 z-[60]" onClick={onClose} />
      <div
        className="fixed top-16 right-4 z-[70] rounded-2xl border border-white/10 p-5 flex flex-col gap-4 w-72 max-h-[85vh] overflow-y-auto"
        style={{ background: "rgba(30,30,30,1)" }}
      >
        {/* user info */}
        <div className="flex items-center gap-3">
          <img src={avatarSrc} alt="avatar" className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate">{user?.name || "—"}</p>
            <p className="text-white/40 text-xs truncate">{user?.email || ""}</p>
          </div>
        </div>

        <div className="h-px bg-white/10" />

        {/* receipt */}
        {payment === undefined && (
          <p className="text-white/30 text-xs">loading…</p>
        )}
        {payment === null && (
          <p className="text-white/30 text-xs">no payments yet</p>
        )}
        {payment && (
          <>
            <div ref={receiptRef} className="rounded-xl bg-white p-4 flex flex-col gap-1.5">
              <p className="font-extrabold text-black text-[10px] uppercase tracking-widest mb-1 text-center">
                evolve mentorship · receipt
              </p>
              <div className="w-full h-px bg-black/10 mb-1" />
              {rows.map(([label, value]) => (
                <div key={label} className="flex justify-between items-start gap-2">
                  <span className="text-black/40 text-[11px] lowercase shrink-0">{label}</span>
                  <span className="text-black font-semibold text-[11px] text-right break-all">{value}</span>
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

/* ─── Avatar slot (right side of BlackNav) ───────────────────────────────── */
function AvatarSlot({ user }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const avatarSrc = user?.avatar_url
    || `https://api.dicebear.com/7.x/thumbs/svg?seed=${user?.id || "u"}`;
  if (!user) return null;
  return (
    <div className="flex items-center gap-2 relative">
      <span className="hidden md:block text-white text-sm font-semibold">{user.name}</span>
      <button onClick={() => setProfileOpen(p => !p)} className="focus:outline-none">
        <img src={avatarSrc} alt="avatar" className="w-9 h-9 rounded-full object-cover" />
      </button>
      {profileOpen && <ProfileSheet user={user} onClose={() => setProfileOpen(false)} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MentorshipSession page
═══════════════════════════════════════════════════════════════════════════ */
export default function MentorshipSession() {
  const navigate = useNavigate();
  const { user, authLoading } = useAuth();
  const [openFAQ, setOpenFAQ] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/signin", { state: { from: "/mentorship-session" } });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  if (authLoading) return null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#161618" }}>
      <BlackNav onLogoClick={() => navigate("/mentorship")} right={<AvatarSlot user={user} />} />

      <div className="px-6 pt-24 pb-16 md:max-w-2xl md:mx-auto md:pt-28">

        {/* ── Heading ──────────────────────────────────────────────────────── */}
        <h1 className="text-white font-bold leading-tight mb-1"
          style={{ fontSize: "clamp(32px,6vw,48px)", letterSpacing: "-0.02em" }}>
          here's how it begins
        </h1>
        <p className="text-white/45 text-sm mb-8">three things to do right now</p>

        {/* ── Action boxes ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 mb-12">
          {/* Check email */}
          <div className="flex items-center gap-4 px-1 py-2">
            <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,208,7,0.12)" }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M1.5 5A1.5 1.5 0 0 1 3 3.5h14A1.5 1.5 0 0 1 18.5 5v10A1.5 1.5 0 0 1 17 16.5H3A1.5 1.5 0 0 1 1.5 15V5Z"
                  stroke="#FFD007" strokeWidth="1.3"/>
                <path d="M1.5 5 10 11 18.5 5" stroke="#FFD007" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-base">check your email</p>
              <p className="text-white/40 text-sm">confirmation + calendar invite on the way</p>
            </div>
          </div>

          {/* Join WhatsApp */}
          <a
            href="https://wa.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-2xl border border-white/10 p-5 transition-opacity active:opacity-70"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(37,211,102,0.12)" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path fillRule="evenodd" clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.477 2 12c0 1.85.5 3.58 1.376 5.063L2 22l5.09-1.336A9.965 9.965 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2Z"
                  fill="#25D366" opacity="0.2"/>
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.85.5 3.58 1.376 5.063L2 22l5.09-1.336A9.965 9.965 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2Z"
                  stroke="#25D366" strokeWidth="1.5"/>
                <path d="M8.5 9c0-.28.22-.5.5-.5h1a.5.5 0 0 1 .47.33l.75 2a.5.5 0 0 1-.12.53l-.63.63a4.51 4.51 0 0 0 2.05 2.05l.63-.63a.5.5 0 0 1 .53-.12l2 .75a.5.5 0 0 1 .33.47v1a.5.5 0 0 1-.5.5C10.57 16 8 13.43 8 9.5V9Z"
                  fill="#25D366"/>
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-base">join our community</p>
              <p className="text-white/40 text-sm">get session links + connect with the batch</p>
            </div>
          </a>
        </div>

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <h2 className="text-white font-bold text-2xl md:text-3xl mb-1">got questions?</h2>
        <p className="text-white/45 text-sm mb-6">everything you need to know</p>

        <div className="flex flex-col">
          {FAQS.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                className="w-full flex items-start justify-between gap-4 py-4 text-left"
              >
                <span className="text-white font-medium text-base">{faq.q}</span>
                <span className="text-white/40 text-xl flex-shrink-0 leading-none mt-0.5">
                  {openFAQ === i ? "−" : "+"}
                </span>
              </button>
              {openFAQ === i && (
                <p className="text-white/50 text-sm pb-4 leading-relaxed">{faq.a}</p>
              )}
              {i < FAQS.length - 1 && <hr className="border-white/10" />}
            </div>
          ))}
        </div>

        {/* ── Contact ──────────────────────────────────────────────────────── */}
        <div className="mt-12 flex flex-col items-center gap-3">
          <p className="text-white/35 text-sm">something else on your mind?</p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("openContactModal"))}
            className="border border-evolve-yellow text-evolve-yellow font-semibold text-sm rounded-2xl px-10 py-3 active:opacity-80"
          >
            contact us
          </button>
        </div>

      </div>
    </div>
  );
}
