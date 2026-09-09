import { useState } from "react";
import { supabase } from "../../../supabaseClient";

function Heart({ filled, onClick }) {
  return (
    <button type="button" onClick={onClick} aria-label="rate" className="p-0.5">
      <svg width="28" height="28" viewBox="0 0 24 24" fill={filled ? "#FFD007" : "none"}>
        <path
          d="M12 20.5s-7.5-4.7-10-9.3C.5 8 2 4.5 5.3 4A5 5 0 0112 6.5 5 5 0 0118.7 4C22 4.5 23.5 8 22 11.2c-2.5 4.6-10 9.3-10 9.3z"
          stroke={filled ? "#FFD007" : "rgba(255,255,255,0.3)"}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

/**
 * "How was your session?" — post-session feedback, shown once a session's
 * scheduled time has passed and feedback hasn't been submitted yet (see
 * MentorshipSessionPage.jsx's feedbackDue check). Responsive modal/full-
 * screen shell, same pattern as MentorshipPricingModal. Saving a row here
 * (attended or not) is what marks the session "completed" and unlocks its
 * recording view.
 */
export default function MentorshipFeedbackModal({ user, sessionNumber, onClose, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  const canSubmit = rating > 0 && text.trim().length > 0;

  async function submit(attended) {
    setSaving(true);
    const { data, error } = await supabase
      .from("mentorship_session_feedback_v2")
      .upsert(
        {
          user_id: user.id,
          session_number: sessionNumber,
          attended,
          rating: attended ? rating : null,
          feedback_text: attended ? text.trim() : null
        },
        { onConflict: "user_id,session_number" }
      )
      .select()
      .single();
    setSaving(false);
    if (!error) onSubmitted(data);
  }

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center md:px-6">
      <div className="absolute inset-0 bg-evolve-black/70 md:bg-evolve-black/85" />
      <div
        className="relative w-full h-full md:h-auto md:max-w-sm rounded-none md:rounded-3xl border-0 md:border md:border-white/10 px-8 py-10 flex flex-col gap-5"
        style={{ backgroundColor: "#161618" }}
      >
        <button
          onClick={onClose}
          aria-label="close"
          className="absolute top-5 right-5 w-8 h-8 rounded-full border border-white/10 bg-white/[0.04] flex items-center justify-center text-white/40 hover:text-white hover:border-white/25 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>

        <h3 className="text-white font-bold text-2xl font-bricolage text-center mt-4">
          How was your session?
        </h3>

        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <Heart key={n} filled={n <= rating} onClick={() => setRating(n)} />
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-white/50 text-sm">Tell us more about your experience...</label>
          <textarea
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Your answer here..."
            className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 outline-none border border-white/15 focus:border-evolve-yellow/60 transition-colors resize-y"
            style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
          />
        </div>

        <button
          onClick={() => submit(true)}
          disabled={!canSubmit || saving}
          className="w-full bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl py-3.5 flex items-center justify-center gap-2 disabled:opacity-40 active:opacity-80 transition-opacity"
        >
          {saving ? "Submitting…" : "Submit"}
          {!saving && (
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
        <button
          onClick={() => submit(false)}
          disabled={saving}
          className="text-evolve-yellow text-sm font-semibold underline text-center"
        >
          I did not attend the session
        </button>
      </div>
    </div>
  );
}
