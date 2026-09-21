import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams, Link } from "react-router-dom";
import html2canvas from "html2canvas";
import { supabase } from "../supabaseClient";
import { useAuth } from "../hooks/useAuth";
import { findFreeSlug } from "../lib/slug";
import SEO from "../components/SEO";
import SignIn from "./SignIn";

const WHATSAPP_COMMUNITY_URL =
  "https://chat.whatsapp.com/DsLtzxlHPQXC4Gaee76qz4?s=cl&p=a&ilr=4";
const PENDING_KEY = "event_register_pending";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// best-effort — never blocks the registration itself, same convention as
// BecomeAReviewer.jsx's append-reviewer-sheet call
function notifyRegistration(registrationId) {
  fetch(`${SUPABASE_URL}/functions/v1/events-notify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY
    },
    body: JSON.stringify({ mode: "notify", registration_id: registrationId })
  }).catch(() => {});
}

function fmtDateTime(dtStr) {
  if (!dtStr) return "";
  const d = new Date(dtStr);
  const date = d.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    day: "numeric",
    month: "short"
  });
  const time = d.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
  return `${date} · ${time} IST`;
}

// Platform is detected from the URL itself — nothing to keep in sync in the
// database beyond the raw link (see EventsTab.jsx's "speaker social links").
const SOCIAL_MATCHERS = [
  { key: "linkedin", test: /linkedin\.com/i },
  { key: "instagram", test: /instagram\.com/i },
  { key: "twitter", test: /twitter\.com|x\.com/i },
  { key: "youtube", test: /youtube\.com|youtu\.be/i },
  { key: "behance", test: /behance\.net/i },
  { key: "dribbble", test: /dribbble\.com/i },
  { key: "github", test: /github\.com/i }
];

function detectPlatform(url) {
  return SOCIAL_MATCHERS.find((m) => m.test.test(url))?.key || "website";
}

const SOCIAL_ICON_PATHS = {
  linkedin: "M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3.5a1.96 1.96 0 1 0 0 3.92 1.96 1.96 0 0 0 0-3.92ZM20.44 20h-3.37v-5.6c0-1.34-.03-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.96V20h-3.37V8.5h3.24v1.57h.05c.45-.86 1.56-1.77 3.2-1.77 3.42 0 4.05 2.25 4.05 5.18V20Z",
  instagram: "M12 8.7a3.3 3.3 0 1 0 0 6.6 3.3 3.3 0 0 0 0-6.6Zm0 1.8a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.6-3.9a1.05 1.05 0 1 1 0 2.1 1.05 1.05 0 0 1 0-2.1ZM12 4.9c2.4 0 2.68.01 3.63.05.94.05 1.58.2 2.14.42.58.23 1.07.53 1.55 1.02.49.48.79.97 1.02 1.55.22.56.37 1.2.42 2.14.04.95.05 1.23.05 3.63s-.01 2.68-.05 3.63c-.05.94-.2 1.58-.42 2.14-.23.58-.53 1.07-1.02 1.55-.48.49-.97.79-1.55 1.02-.56.22-1.2.37-2.14.42-.95.04-1.23.05-3.63.05s-2.68-.01-3.63-.05c-.94-.05-1.58-.2-2.14-.42a4.17 4.17 0 0 1-1.55-1.02 4.17 4.17 0 0 1-1.02-1.55c-.22-.56-.37-1.2-.42-2.14C4.19 14.68 4.18 14.4 4.18 12s.01-2.68.05-3.63c.05-.94.2-1.58.42-2.14.23-.58.53-1.07 1.02-1.55.48-.49.97-.79 1.55-1.02.56-.22 1.2-.37 2.14-.42.95-.04 1.23-.05 3.64-.05Z",
  twitter: "M18.24 3H21l-6.3 7.2L22.1 21h-6.3l-4.94-6.46L5.1 21H2.3l6.74-7.7L1.9 3h6.46l4.47 5.9L18.24 3Zm-1.1 16.2h1.74L7.94 4.7H6.08l11.06 14.5Z",
  youtube: "M22 12s0-3.3-.42-4.9a2.78 2.78 0 0 0-1.96-1.96C18.02 4.7 12 4.7 12 4.7s-6.02 0-7.62.44a2.78 2.78 0 0 0-1.96 1.96C2 8.7 2 12 2 12s0 3.3.42 4.9c.24.9 1 1.66 1.96 1.9C6 19.3 12 19.3 12 19.3s6.02 0 7.62-.5a2.78 2.78 0 0 0 1.96-1.9C22 15.3 22 12 22 12ZM10 15.3V8.7l5.5 3.3-5.5 3.3Z",
  behance: "M8.85 12.7a2.53 2.53 0 0 0 1.4-2.42c0-1.86-1.3-2.78-3.3-2.78H2v10.9h5.2c2.1 0 3.85-1 3.85-3.1 0-1.3-.63-2.2-2.2-2.6ZM4.3 9.2h2.1c.9 0 1.6.3 1.6 1.15 0 .8-.6 1.2-1.5 1.2H4.3V9.2Zm2.4 7.4H4.3v-2.7h2.5c1 0 1.7.4 1.7 1.35 0 .95-.7 1.35-1.8 1.35Zm10.9-9.75h-4.2v1.1h4.2v-1.1ZM22 14c0-2.7-1.5-4.8-4.35-4.8-2.7 0-4.5 1.9-4.5 4.55 0 2.7 1.7 4.5 4.6 4.5 1.9 0 3.3-.8 4-2.3l-1.85-.6c-.35.7-.95 1.1-2.05 1.1-1.3 0-2.15-.75-2.3-2.05h6.4c.02-.15.05-.3.05-.4Zm-6.4-1c.2-1.15 1-1.8 2.1-1.8 1.1 0 1.85.7 1.95 1.8h-4.05Z",
  dribbble: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.6 4.6a8.3 8.3 0 0 1 1.85 5.1c-.27-.06-2.95-.6-5.65-.26-.06-.14-.11-.29-.17-.44-.17-.4-.35-.8-.55-1.19 2.95-1.2 4.3-2.93 4.52-3.21ZM12 3.75c1.9 0 3.65.68 5.01 1.8-.19.27-1.4 1.85-4.25 2.94a29 29 0 0 0-3.36-4.42A8.3 8.3 0 0 1 12 3.75Zm-3.9 1.03A28 28 0 0 1 11.4 9.1c-3.4.9-6.4.86-6.72.85a8.35 8.35 0 0 1 3.42-5.17ZM3.75 12v-.24c.3.01 3.83.05 7.47-1.03.21.4.4.82.58 1.23-.1.03-.19.05-.29.09-3.75 1.21-5.75 4.53-5.92 4.81A8.28 8.28 0 0 1 3.75 12Zm8.25 8.25a8.28 8.28 0 0 1-4.9-1.6c.13-.28 1.63-3.24 5.72-4.65.02 0 .03-.01.05-.02a30 30 0 0 1 1.5 5.86 8.28 8.28 0 0 1-2.37.41Zm3.83-1.07a31.4 31.4 0 0 0-1.4-5.53c2.5-.4 4.7.25 4.97.34a8.32 8.32 0 0 1-3.57 5.19Z",
  github: "M12 2a10 10 0 0 0-3.16 19.5c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.36 1.09 2.93.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.3 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z",
  website: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0c-1.66 0-3-4-3-9s1.34-9 3-9m0 18c1.66 0 3-4 3-9s-1.34-9-3-9m-9 9h18"
};

function SocialIcon({ platform, className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d={SOCIAL_ICON_PATHS[platform]} stroke={platform === "website" ? "currentColor" : "none"} strokeWidth="1.5" fill={platform === "website" ? "none" : "currentColor"} />
    </svg>
  );
}

function QuestionModal({ event, onClose, onSubmit, submitting, error }) {
  const [category, setCategory] = useState("");
  const [question, setQuestion] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[9990] bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed z-[9991] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-[480px] bg-[#111] border border-white/10 rounded-2xl px-6 py-7 text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-5 text-white/50 text-2xl leading-none"
          aria-label="close"
        >
          ×
        </button>
        <h2 className="text-xl font-extrabold">You're almost in</h2>
        <p className="text-white/50 text-sm mt-1.5">
          Have a question for the speaker? Pick a category and ask away. It's
          optional.
        </p>

        <div className="mt-5 flex flex-col gap-3">
          {event.question_categories?.length > 0 && (
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-sm bg-[#0d0d0d] border border-white/10 outline-none"
            >
              <option value="">Select question category</option>
              {event.question_categories.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
            placeholder="Enter your question"
            className="w-full rounded-lg px-3 py-2.5 text-sm bg-[#0d0d0d] border border-white/10 outline-none resize-y"
          />
          <label className="flex items-start gap-2 text-xs text-white/50">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="mt-0.5"
            />
            Submit this question anonymously. We won't show your name to the
            speaker or other attendees.
          </label>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            onClick={() => onSubmit({ category, question, anonymous })}
            disabled={submitting}
            className="mt-1 w-full bg-evolve-yellow text-evolve-black font-extrabold text-sm py-3 rounded-lg disabled:opacity-50"
          >
            {submitting ? "Registering…" : "Register →"}
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}

function TicketModal({ event, registration, user, onClose }) {
  const ticketRef = useRef(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!ticketRef.current) return;
    setSaving(true);
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null
      });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `${event.slug}-ticket.png`;
      a.click();
    } finally {
      setSaving(false);
    }
  }

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[9990] bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed z-[9991] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-[380px]">
        <button
          onClick={onClose}
          className="absolute -top-9 right-0 text-white/70 text-2xl leading-none"
          aria-label="close"
        >
          ×
        </button>

        <div
          ref={ticketRef}
          className="bg-evolve-black border-2 border-evolve-yellow rounded-[24px] p-6 text-white overflow-hidden"
        >
          <span className="inline-flex items-center justify-center leading-none bg-evolve-yellow text-black text-[10px] font-extrabold uppercase px-3 py-2 rounded-md -rotate-6 mb-3">
            {event.event_type || "webinar"}
          </span>
          <h3 className="text-2xl font-extrabold leading-[1.05]">
            {event.title}
          </h3>

          <div className="border-t border-dashed border-white/15 mt-4 pt-4 grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-white/40 font-bold">
                date
              </p>
              <p className="text-sm font-bold mt-0.5">
                {fmtDateTime(event.start_time).split(" · ")[0]}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-white/40 font-bold">
                time
              </p>
              <p className="text-sm font-bold mt-0.5">
                {fmtDateTime(event.start_time).split(" · ")[1]}
              </p>
            </div>
          </div>

          {event.speaker_name && (
            <div className="border-t border-dashed border-white/15 mt-4 pt-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-white/40 font-bold">
                  host
                </p>
                <p className="text-sm font-bold mt-0.5 leading-snug">
                  {event.speaker_name}
                  {event.speaker_title ? `, ${event.speaker_title}` : ""}
                </p>
              </div>
              {event.speaker_photo_url ? (
                <img
                  src={event.speaker_photo_url}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-evolve-yellow flex-shrink-0" />
              )}
            </div>
          )}

          <div className="border-t border-dashed border-white/15 mt-4 pt-4">
            <p className="text-[10px] uppercase tracking-wide text-white/40 font-bold">
              attendee
            </p>
            <p className="text-sm font-bold mt-0.5">
              {user?.name || user?.email}
            </p>
            <p className="text-white/30 text-[11px] tracking-wide mt-1">
              EVLV-{registration?.id?.slice(0, 6).toUpperCase()}
            </p>
          </div>

          <p className="text-white/25 text-[10px] mt-5">
            evolvedesign.academy/events/{event.slug}
          </p>
        </div>

        <div className="flex flex-col gap-2 mt-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-evolve-yellow text-black font-extrabold text-sm py-3 rounded-full disabled:opacity-50"
          >
            ↓ {saving ? "saving…" : "save ticket to share"}
          </button>
          <a
            href={WHATSAPP_COMMUNITY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-center border border-white/20 text-white font-bold text-sm py-3 rounded-full"
          >
            ⚡ join evolve community
          </a>
        </div>
      </div>
    </>,
    document.body
  );
}

export default function EventDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [registrantCount, setRegistrantCount] = useState(0);
  const [myRegistration, setMyRegistration] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, user?.id]);

  // Signed in (any method) while the sign-in modal was open — close it and
  // let the booking flow continue on this same page.
  useEffect(() => {
    if (user) setShowSignInModal(false);
  }, [user]);

  async function fetchEvent() {
    setLoading(true);
    const { data: eventRow } = await supabase
      .from("events")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (!eventRow) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setEvent(eventRow);

    const { count } = await supabase
      .from("event_registrations")
      .select("id", { count: "exact", head: true })
      .eq("event_id", eventRow.id)
      .eq("status", "registered");
    setRegistrantCount(count || 0);

    if (user) {
      const { data: existing } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("event_id", eventRow.id)
        .eq("user_id", user.id)
        .maybeSingle();
      setMyRegistration(existing || null);

      if (!existing && sessionStorage.getItem(PENDING_KEY) === slug) {
        sessionStorage.removeItem(PENDING_KEY);
        setShowQuestionModal(true);
      }
    }
    setLoading(false);
  }

  function handleBookSpot() {
    if (!user) {
      sessionStorage.setItem(PENDING_KEY, slug);
      // location.state alone doesn't survive the full-page redirect round trip
      // for Google/LinkedIn OAuth sign-in, so also persist it the same way
      // PortfolioReviewForm.jsx does for its own deep-link-back-after-signin flow.
      sessionStorage.setItem("signin_from", `/events/${slug}`);
      // Desktop: sign in without leaving the event page (modal). Mobile: the
      // full /signin page has more room to breathe, so keep the normal nav.
      if (window.innerWidth >= 768) {
        setShowSignInModal(true);
      } else {
        navigate("/signin", { state: { from: `/events/${slug}` } });
      }
      return;
    }
    if (myRegistration) {
      setShowTicketModal(true);
      return;
    }
    setShowQuestionModal(true);
  }

  async function handleRegisterSubmit({ category, question, anonymous }) {
    setSubmitting(true);
    setSubmitError("");
    const { data, error } = await supabase
      .from("event_registrations")
      .insert({
        event_id: event.id,
        user_id: user.id,
        question_category: category || null,
        question_text: question.trim() || null,
        question_anonymous: anonymous
      })
      .select()
      .single();

    if (error) {
      setSubmitError(error.message);
      setSubmitting(false);
      return;
    }

    if (!user.username) {
      const username = await findFreeSlug(
        supabase,
        "profile_cards",
        "username",
        user.name || user.email
      );
      await supabase.from("profiles").update({ username }).eq("id", user.id);
      await refreshUser();
    }

    setMyRegistration(data);
    setRegistrantCount((c) => c + 1);
    setSubmitting(false);
    setShowQuestionModal(false);
    setShowTicketModal(true);
    notifyRegistration(data.id);
  }

  if (loading) {
    return <div className="min-h-screen bg-evolve-black" />;
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-evolve-black text-white">
        <p className="text-lg font-bold">
          This event doesn't exist or isn't published yet.
        </p>
        <Link to="/events" className="text-evolve-yellow underline">
          Back to events
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-evolve-black text-white">
      <SEO
        title={`${event.title} — Evolve Events`}
        description={event.description || event.title}
        path={`/events/${event.slug}`}
        image={event.cover_image_url}
      />

      <div className="max-w-5xl mx-auto px-5 md:px-8 pt-28 pb-10 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
        {/* left card */}
        <div className="md:sticky md:top-24 h-fit flex flex-col gap-4">
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03]">
            {event.cover_image_url && (
              <img
                src={event.cover_image_url}
                alt=""
                className="w-full aspect-square object-cover"
              />
            )}
            <div className="p-4">
              <p className="text-[10px] font-black uppercase tracking-wide text-evolve-yellow">
                session
              </p>
              <h1 className="text-lg font-extrabold leading-tight mt-1">
                {event.title}
              </h1>
              <p className="text-white/50 text-xs mt-2">
                {fmtDateTime(event.start_time)}
              </p>
            </div>
          </div>

          {event.speaker_name && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] font-black uppercase tracking-wide text-white/40 mb-2">
                about the speaker
              </p>
              <div className="flex items-center gap-3">
                {event.speaker_photo_url && (
                  <img
                    src={event.speaker_photo_url}
                    alt={event.speaker_name}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                )}
                <div>
                  <p className="font-bold text-sm">{event.speaker_name}</p>
                  {event.speaker_title && (
                    <p className="text-white/50 text-xs">
                      {event.speaker_title}
                    </p>
                  )}
                </div>
              </div>
              {event.speaker_bio && (
                <p className="text-white/60 text-xs mt-3 leading-relaxed">
                  {event.speaker_bio}
                </p>
              )}
              {event.speaker_socials?.length > 0 && (
                <div className="flex items-center gap-3 mt-3">
                  {event.speaker_socials.map((url) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/50 hover:text-evolve-yellow transition-colors"
                      aria-label={detectPlatform(url)}
                    >
                      <SocialIcon platform={detectPlatform(url)} className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* main content */}
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-extrabold">{event.title}</h1>
            <p className="text-white/50 text-sm mt-2">
              {fmtDateTime(event.start_time)}
            </p>
          </div>

          {event.description && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wide text-white/40 mb-2">
                about the session
              </p>
              <p className="border-l-2 border-evolve-yellow pl-4 text-white/70 text-sm leading-relaxed">
                {event.description}
              </p>
            </div>
          )}

          {event.question_categories?.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wide text-white/40 mb-3">
                question categories
              </p>
              <div className="flex flex-col gap-3">
                {event.question_categories.map((cat) => (
                  <div key={cat.name}>
                    <p className="text-evolve-yellow font-bold text-sm">
                      {cat.name}
                    </p>
                    <ul className="list-disc list-inside text-white/60 text-sm mt-1">
                      {cat.questions?.map((q, i) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="font-bold text-sm">Register</p>
            <p className="text-white/50 text-xs mt-1">
              Save your spot for this session. You can ask the speaker a
              question when you register.
            </p>
            <button
              onClick={handleBookSpot}
              className="mt-4 bg-evolve-yellow text-evolve-black font-extrabold text-sm px-6 py-3 rounded-lg"
            >
              {myRegistration
                ? "You're going ✓ — view ticket"
                : "Book my spot →"}
            </button>
            {registrantCount > 0 && (
              <p className="text-white/40 text-xs mt-3">
                {registrantCount} going
              </p>
            )}
          </div>
        </div>
      </div>

      {showQuestionModal && (
        <QuestionModal
          event={event}
          onClose={() => setShowQuestionModal(false)}
          onSubmit={handleRegisterSubmit}
          submitting={submitting}
          error={submitError}
        />
      )}
      {showTicketModal && (
        <TicketModal
          event={event}
          registration={myRegistration}
          user={user}
          onClose={() => setShowTicketModal(false)}
        />
      )}
      {showSignInModal &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[9990] bg-black/70 backdrop-blur-sm"
              onClick={() => setShowSignInModal(false)}
            />
            <div
              className="fixed z-[9991] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl"
              style={{ backgroundColor: "#161618" }}
            >
              <SignIn onClose={() => setShowSignInModal(false)} />
            </div>
          </>,
          document.body
        )}
    </div>
  );
}
