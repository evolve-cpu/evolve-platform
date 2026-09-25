import { useEffect, useRef, useState } from "react";
import { supabase } from "../../supabaseClient";
import OnboardingProgressBar from "../../pages/Onboarding/OnboardingProgressBar";

/* ── "Get evolve verified" — a short 2-question + 1:1-call-booking flow,
   reviewed by an admin (VerificationTab.jsx), gating whether the AI
   profile can ever be published/shared. VerifyCard renders whichever
   state the profile is currently in; VerifyFlowModal is the 3-step
   wizard (desktop: centered step-counter modal, mobile: full screen). ── */

const YELLOW = "#FFD007";

function fmtSlotDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "numeric",
    month: "short"
  });
}
function fmtSlotTime(iso) {
  return new Date(iso).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}

/* ── icon badges — a plain circle + line-icon, matching the reference
   design instead of a filled illustration. ──────────────────────────── */
function IconBadge({ children, tone = YELLOW }) {
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ background: `${tone}1f`, color: tone }}
    >
      {children}
    </div>
  );
}
function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="5" width="16" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 9.5h16M8 3v3.5M16 3v3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8v4.5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function WarningIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 4.5l8.5 14.5H3.5L12 4.5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M12 10v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="16.7" r="0.9" fill="currentColor" />
    </svg>
  );
}
function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
      <path
        d="M4 10h11.5M10.5 5l5 5-5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function VerifyPrimaryButton({ children, ...rest }) {
  return (
    <button
      type="button"
      className="w-full flex items-center justify-center gap-1.5 bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl px-5 py-3 disabled:opacity-40 active:opacity-80 transition-opacity"
      {...rest}
    >
      {children}
    </button>
  );
}

/* ── VerifyCard — one component, every state, used on both mobile and
   desktop so the design stays a single source of truth. ────────────── */
export function VerifyCard({
  status,
  slot,
  meetLink,
  notes,
  isPublic,
  publishing,
  onStart,
  onReschedule,
  onReapply,
  onPublish,
  onUnpublish,
  shareUrl,
  copied,
  onCopyLink
}) {
  const [copiedLocalHint, setCopiedLocalHint] = useState(false);

  if (status === "verified" && isPublic) {
    return (
      <div className="rounded-2xl border border-evolve-yellow/25 bg-evolve-yellow/[0.05] p-5 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <IconBadge>
            <ShieldIcon />
          </IconBadge>
          <div className="min-w-0">
            <p className="text-white font-bold text-sm">Profile published</p>
            <p className="text-white/40 text-xs mt-1 leading-relaxed">
              Verified profiles are the ones we put in front of hiring
              partners. Yours is live and shareable.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={shareUrl}
            className="flex-1 text-xs text-white/70 bg-white/5 border border-[#373737] rounded-lg px-3 py-2 outline-none"
          />
          <button
            type="button"
            onClick={onCopyLink}
            className="text-evolve-yellow text-xs font-semibold px-3 py-2 rounded-lg border border-evolve-yellow/40 hover:bg-evolve-yellow/10 flex-shrink-0"
          >
            {copied ? "Copied ✓" : "Copy"}
          </button>
        </div>
        <button
          type="button"
          onClick={onUnpublish}
          className="self-start text-white/40 text-[11px] font-semibold hover:text-white/70"
        >
          Unpublish
        </button>
      </div>
    );
  }

  if (status === "verified") {
    return (
      <div className="rounded-2xl border border-evolve-yellow/25 bg-evolve-yellow/[0.05] p-5 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <IconBadge>
            <ShieldIcon />
          </IconBadge>
          <div className="min-w-0">
            <p className="text-white font-bold text-sm">You're evolve verified</p>
            <p className="text-white/40 text-xs mt-1 leading-relaxed">
              Publish your profile to get a shareable link recruiters and
              hiring partners can open — nothing's public until you do.
            </p>
          </div>
        </div>
        <VerifyPrimaryButton onClick={onPublish} disabled={publishing}>
          {publishing ? "Publishing…" : "Publish profile"}
          <ArrowIcon />
        </VerifyPrimaryButton>
      </div>
    );
  }

  if (status === "needs_attention") {
    return (
      <div className="rounded-2xl border border-red-400/25 bg-red-400/[0.05] p-5 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <IconBadge tone="#f87171">
            <WarningIcon />
          </IconBadge>
          <div className="min-w-0">
            <p className="text-white font-bold text-sm">We need one more thing</p>
            <p className="text-white/40 text-xs mt-1 leading-relaxed">
              {notes ||
                "We couldn't confirm your work details from what you shared. An updated resume or portfolio usually clears it up."}
            </p>
          </div>
        </div>
        <VerifyPrimaryButton onClick={onReapply}>
          Re-upload &amp; reapply
          <ArrowIcon />
        </VerifyPrimaryButton>
      </div>
    );
  }

  if (status === "verifying") {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <IconBadge tone="#7FB8FF">
            <ClockIcon />
          </IconBadge>
          <div className="min-w-0">
            <p className="text-white font-bold text-sm">Verification in progress</p>
            <p className="text-white/40 text-xs mt-1 leading-relaxed">
              We're reviewing what you shared. This usually takes a couple
              of days.
            </p>
          </div>
        </div>
        {meetLink && (
          <a
            href={meetLink}
            target="_blank"
            rel="noreferrer"
            className="self-start text-evolve-yellow text-[11px] font-semibold hover:underline"
          >
            Your call link →
          </a>
        )}
      </div>
    );
  }

  if (status === "booked") {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <IconBadge>
            <CalendarIcon />
          </IconBadge>
          <div className="min-w-0 flex-1">
            <p className="text-white font-bold text-sm">Call booked</p>
            <p className="text-white/40 text-xs mt-0.5">
              {slot ? `${fmtSlotDate(slot.starts_at)} · ${fmtSlotTime(slot.starts_at)}` : "…"}
            </p>
            <div className="flex items-center gap-3 mt-1.5">
              {!meetLink && (
                <button
                  type="button"
                  onClick={onReschedule}
                  className="text-white/40 text-[11px] font-semibold hover:text-white/70"
                >
                  Reschedule
                </button>
              )}
              {meetLink && (
                <a
                  href={meetLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-evolve-yellow text-[11px] font-semibold hover:underline"
                >
                  Join call →
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // idle — nothing started yet
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <IconBadge>
          <ShieldIcon />
        </IconBadge>
        <div className="min-w-0">
          <p className="text-white font-bold text-sm">Get evolve verified</p>
          <p className="text-white/40 text-xs mt-1 leading-relaxed">
            Verified profiles are the ones we put in front of hiring
            partners. A few quick questions and a short call gets you
            there.
          </p>
        </div>
      </div>
      <VerifyPrimaryButton onClick={onStart}>
        Start verification
        <ArrowIcon />
      </VerifyPrimaryButton>
    </div>
  );
}

/* ── Type-or-record answer input — text always uploads inline; a
   recorded answer uploads to Supabase Storage as soon as recording
   stops (not deferred to the final submit) so the wizard only ever
   carries a small storage path around, never a blob. ────────────────── */
function VoiceOrTextInput({ userId, questionKey, value, onChange, placeholder }) {
  const mode = value?.mode || "type";
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [permissionError, setPermissionError] = useState("");
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function setMode(next) {
    onChange({ ...value, mode: next });
  }

  async function startRecording() {
    setPermissionError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => handleRecordingStopped(recorder.mimeType || "audio/webm");
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setPermissionError("Couldn't access your microphone — try typing instead.");
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    clearInterval(timerRef.current);
    setRecording(false);
  }

  async function handleRecordingStopped(mimeType) {
    const blob = new Blob(chunksRef.current, { type: mimeType });
    setPreviewUrl(URL.createObjectURL(blob));
    setUploading(true);
    const ext = mimeType.includes("mp4") ? "m4a" : "webm";
    const path = `${userId}/${questionKey}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("verification-audio")
      .upload(path, blob, { contentType: mimeType });
    setUploading(false);
    if (error) {
      setPermissionError("Upload failed — try recording again.");
      return;
    }
    onChange({ mode: "record", text: null, audioPath: path });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("type")}
          className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-colors ${
            mode === "type"
              ? "border-evolve-yellow/50 bg-evolve-yellow/[0.12] text-evolve-yellow"
              : "border-[#373737] text-white/50 hover:border-white/20"
          }`}
        >
          Type
        </button>
        <button
          type="button"
          onClick={() => setMode("record")}
          className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-colors ${
            mode === "record"
              ? "border-evolve-yellow/50 bg-evolve-yellow/[0.12] text-evolve-yellow"
              : "border-[#373737] text-white/50 hover:border-white/20"
          }`}
        >
          Record
        </button>
      </div>

      {mode === "type" ? (
        <textarea
          value={value?.text || ""}
          onChange={(e) => onChange({ mode: "type", text: e.target.value, audioPath: null })}
          placeholder={placeholder}
          rows={6}
          className="w-full text-sm text-white outline-none border border-[#373737] rounded-xl px-4 py-3 transition-colors focus:border-evolve-yellow/60 resize-none"
          style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
        />
      ) : (
        <div className="rounded-xl border border-[#373737] px-4 py-5 flex flex-col items-center gap-3" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
          {!previewUrl && !recording && (
            <button
              type="button"
              onClick={startRecording}
              className="w-14 h-14 rounded-full bg-evolve-yellow text-evolve-black flex items-center justify-center"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="8" />
              </svg>
            </button>
          )}
          {recording && (
            <button
              type="button"
              onClick={stopRecording}
              className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center animate-pulse"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            </button>
          )}
          {recording && (
            <p className="text-white/50 text-xs">
              recording… {String(Math.floor(seconds / 60)).padStart(1, "0")}:
              {String(seconds % 60).padStart(2, "0")}
            </p>
          )}
          {!recording && !previewUrl && (
            <p className="text-white/40 text-xs">Tap to record your answer</p>
          )}
          {uploading && <p className="text-white/40 text-xs">Uploading…</p>}
          {previewUrl && !uploading && (
            <div className="flex flex-col items-center gap-2 w-full">
              <audio src={previewUrl} controls className="w-full" />
              <button
                type="button"
                onClick={() => {
                  setPreviewUrl(null);
                  onChange({ mode: "record", text: null, audioPath: null });
                }}
                className="text-evolve-yellow text-[11px] font-semibold hover:opacity-80"
              >
                Re-record
              </button>
            </div>
          )}
          {permissionError && (
            <p className="text-red-400 text-[11px]">{permissionError}</p>
          )}
        </div>
      )}
    </div>
  );
}

const QUESTIONS = [
  {
    key: "about",
    title: "Tell us about yourself",
    subtitle: "A couple of sentences on who you are and what you do.",
    placeholder: "Start typing…"
  },
  {
    key: "goals",
    title: "What are your career goals?",
    subtitle: "Where do you want this to take you?",
    placeholder: "Start typing…"
  }
];

function answerIsEmpty(a) {
  if (!a) return true;
  if (a.mode === "type") return !a.text?.trim();
  return !a.audioPath;
}

/* ── the 3-step wizard itself — desktop: centered card with a step
   counter; mobile: true full screen (not a bottom sheet, per the
   reference — this flow reads like its own short page, not an
   overlay). `startAtSlot` skips straight to the slot step, used by
   "Reschedule" on an already-booked call. ───────────────────────────── */
export function VerifyFlowModal({ open, user, startAtSlot, initialAnswers, onClose, onBooked }) {
  const [step, setStep] = useState(startAtSlot ? 3 : 1);
  const [answers, setAnswers] = useState(
    initialAnswers || { about: { mode: "type", text: "" }, goals: { mode: "type", text: "" } }
  );
  const [slots, setSlots] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setStep(startAtSlot ? 3 : 1);
    setError("");
    setSelectedSlot(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open || step !== 3) return;
    let cancelled = false;
    (async () => {
      setSlots(null);
      const { data } = await supabase
        .from("verification_slots")
        .select("id, starts_at, is_booked")
        .eq("is_booked", false)
        .gte("starts_at", new Date().toISOString())
        .order("starts_at", { ascending: true })
        .limit(8);
      if (!cancelled) setSlots(data || []);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, step]);

  if (!open) return null;

  const currentQuestion = QUESTIONS[step - 1];
  const canContinue = currentQuestion ? !answerIsEmpty(answers[currentQuestion.key]) : false;

  async function handleConfirmBooking() {
    if (!selectedSlot) return;
    setSubmitting(true);
    setError("");

    const { data: claimed, error: claimErr } = await supabase
      .from("verification_slots")
      .update({ is_booked: true, booked_by: user.id })
      .eq("id", selectedSlot.id)
      .select("id, starts_at");

    if (claimErr || !claimed || claimed.length === 0) {
      setError("That slot was just taken — pick another.");
      setSubmitting(false);
      setSlots((s) => (s || []).filter((sl) => sl.id !== selectedSlot.id));
      setSelectedSlot(null);
      return;
    }

    // reschedule: release the previous slot now that the new one is held
    if (startAtSlot && user.verification_slot_id) {
      await supabase
        .from("verification_slots")
        .update({ is_booked: false, booked_by: null })
        .eq("id", user.verification_slot_id);
    }

    const payload = startAtSlot
      ? { verification_slot_id: claimed[0].id }
      : {
          verification_status: "booked",
          verification_answers: answers,
          verification_slot_id: claimed[0].id
        };

    const { error: saveErr } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", user.id);

    setSubmitting(false);

    if (saveErr) {
      // best-effort rollback so the slot doesn't stay stranded as booked
      await supabase
        .from("verification_slots")
        .update({ is_booked: false, booked_by: null })
        .eq("id", claimed[0].id);
      setError(saveErr.message || "couldn't save your booking — try again.");
      return;
    }

    onBooked({
      status: "booked",
      answers,
      slot: { id: claimed[0].id, starts_at: claimed[0].starts_at }
    });
  }

  return (
    <div className="fixed inset-0 z-[80] flex flex-col md:items-center md:justify-center md:bg-black/60">
      <div
        className="relative flex-1 md:flex-none w-full md:max-w-md md:h-auto md:max-h-[85vh] overflow-y-auto md:rounded-3xl md:border md:border-[#373737] flex flex-col gap-6 p-6 pb-10"
        style={{ backgroundColor: "#1c1c1f" }}
      >
        <div className="flex items-center justify-between">
          {step > 1 && !startAtSlot ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm font-semibold transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-white/10 text-white/50 hover:text-white flex items-center justify-center"
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {!startAtSlot && (
          <div className="flex flex-col gap-2">
            <p className="text-white/40 text-[11px] font-bold uppercase tracking-wide">
              Question {Math.min(step, 3)} of 3
            </p>
            <OnboardingProgressBar step={step} total={3} />
          </div>
        )}

        {step <= 2 && currentQuestion && (
          <div className="flex flex-col gap-5 flex-1">
            <div>
              <h3 className="text-white font-bold text-xl leading-tight">{currentQuestion.title}</h3>
              <p className="text-white/40 text-sm mt-1.5">{currentQuestion.subtitle}</p>
            </div>
            <VoiceOrTextInput
              userId={user.id}
              questionKey={currentQuestion.key}
              value={answers[currentQuestion.key]}
              onChange={(next) =>
                setAnswers((a) => ({ ...a, [currentQuestion.key]: next }))
              }
              placeholder={currentQuestion.placeholder}
            />
            <div className="flex-1" />
            <VerifyPrimaryButton
              disabled={!canContinue}
              onClick={() => setStep((s) => s + 1)}
            >
              Continue
              <ArrowIcon />
            </VerifyPrimaryButton>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-5 flex-1">
            <div>
              <h3 className="text-white font-bold text-xl leading-tight">
                {startAtSlot ? "Pick a new time" : "Book your 1:1 call"}
              </h3>
              <p className="text-white/40 text-sm mt-1.5">
                15 minutes with someone from the evolve team — pick whatever
                works.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {slots === null && (
                <p className="text-white/40 text-xs">Loading available times…</p>
              )}
              {slots?.length === 0 && (
                <p className="text-white/40 text-xs">
                  No open slots right now — check back shortly.
                </p>
              )}
              {slots?.map((s) => {
                const active = selectedSlot?.id === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSlot(s)}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                      active
                        ? "border-evolve-yellow/60 bg-evolve-yellow/[0.08]"
                        : "border-[#373737] hover:border-white/25"
                    }`}
                  >
                    <span className="text-white text-sm font-bold">{fmtSlotDate(s.starts_at)}</span>
                    <span className="text-white/50 text-sm">{fmtSlotTime(s.starts_at)}</span>
                  </button>
                );
              })}
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <div className="flex-1" />
            <VerifyPrimaryButton
              disabled={!selectedSlot || submitting}
              onClick={handleConfirmBooking}
            >
              {submitting ? "Booking…" : "Confirm booking"}
              <ArrowIcon />
            </VerifyPrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
}
