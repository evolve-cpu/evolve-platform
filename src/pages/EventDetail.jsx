import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams, Link } from "react-router-dom";
import html2canvas from "html2canvas";
import { supabase } from "../supabaseClient";
import { useAuth } from "../hooks/useAuth";
import { findFreeSlug } from "../lib/slug";
import SEO from "../components/SEO";

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
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, user?.id]);

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
      navigate("/signin", { state: { from: `/events/${slug}` } });
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
                className="w-full h-40 object-cover"
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
    </div>
  );
}
