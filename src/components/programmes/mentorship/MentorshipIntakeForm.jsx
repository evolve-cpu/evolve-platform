import { useState } from "react";
import { supabase } from "../../../supabaseClient";

function UploadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 15V4M12 4L7 9M12 4l5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * The "Before we begin.." intake form — portfolio, resume, walkthrough
 * recording, and expectations, saved to mentorship_intake (one row per
 * user, editable). File upload only captures the filename for now (no
 * Storage bucket wired yet) — good enough to unblock the "link" path,
 * which is the one most people will use.
 *
 * Every field here is optional — this step comes after "Book a slot" now,
 * and gating session 1 on a fully-filled intake caused drop-off before
 * anyone even reached their first call. Continue always saves (even an
 * all-blank row) so the learner can move on immediately and fill these in
 * later — before session 1, between sessions, or any time via "My docs" on
 * each session page (MentorshipDocsAndResources), which edits this same
 * mentorship_intake row.
 *
 * `initialIntake` is passed down by MentorshipWorkspaceShell (which owns
 * the single fetch of this row, since it also needs it to decide which
 * step to render) rather than fetched again here. `onSaved` reports the
 * saved row back up so the shell can move on to session 1.
 */
export default function MentorshipIntakeForm({ user, enrollmentId, initialIntake, onSaved }) {
  const [portfolioMode, setPortfolioMode] = useState(initialIntake?.portfolio_mode || "link");
  const [portfolioLink, setPortfolioLink] = useState(
    initialIntake?.portfolio_mode !== "file" ? initialIntake?.portfolio_value || "" : ""
  );
  const [portfolioFileName, setPortfolioFileName] = useState(
    initialIntake?.portfolio_mode === "file" ? initialIntake?.portfolio_value || "" : ""
  );
  const [resumeLink, setResumeLink] = useState(initialIntake?.resume_link || "");
  const [walkthroughLink, setWalkthroughLink] = useState(initialIntake?.walkthrough_link || "");
  const [notes, setNotes] = useState(initialIntake?.notes || "");
  const [expectations, setExpectations] = useState(initialIntake?.expectations || "");
  const [status, setStatus] = useState("idle"); // idle | saving | saved | error
  const [dragOver, setDragOver] = useState(false);

  function markDirty() {
    if (status !== "idle") setStatus("idle");
  }

  function handleFile(file) {
    if (!file) return;
    setPortfolioFileName(file.name);
    markDirty();
  }

  async function handleContinue() {
    if (!user?.id) return;
    setStatus("saving");
    const { data, error } = await supabase
      .from("mentorship_intake")
      .upsert(
        {
          user_id: user.id,
          enrollment_id: enrollmentId || null,
          portfolio_mode: portfolioMode,
          portfolio_value: portfolioMode === "file" ? portfolioFileName : portfolioLink.trim(),
          resume_link: resumeLink.trim(),
          walkthrough_link: walkthroughLink.trim(),
          notes: notes.trim(),
          expectations: expectations.trim()
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();
    setStatus(error ? "error" : "saved");
    if (!error) onSaved?.(data);
  }

  return (
    <div className="flex-1 flex flex-col gap-6">
      <div>
        <h1
          className="text-white font-bold font-bricolage"
          style={{ fontSize: "clamp(24px,4vw,32px)", letterSpacing: "-0.02em" }}
        >
          Before we begin..
        </h1>
        <p className="text-white/50 text-sm mt-2">
          Tell us your expectations from this mentorship. This helps us
          personalise your experience — everything below is optional, add
          what you can now and fill in the rest before any session.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-6 flex flex-col gap-6 divide-y divide-white/10">
        {/* portfolio */}
        <div className="flex flex-col gap-3">
          <label className="text-white text-sm font-bold">
            Submit your portfolio{" "}
            <span className="text-white/30 font-normal">(optional)</span>
          </label>
          <div className="flex gap-2 w-fit rounded-xl border border-white/10 p-1">
            <button
              type="button"
              onClick={() => {
                setPortfolioMode("link");
                markDirty();
              }}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                portfolioMode === "link"
                  ? "bg-evolve-yellow text-evolve-black"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Paste a link
            </button>
            <button
              type="button"
              onClick={() => {
                setPortfolioMode("file");
                markDirty();
              }}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                portfolioMode === "file"
                  ? "bg-evolve-yellow text-evolve-black"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Upload a file
            </button>
          </div>

          {portfolioMode === "link" ? (
            <input
              type="text"
              placeholder="https://..."
              value={portfolioLink}
              onChange={(e) => {
                setPortfolioLink(e.target.value);
                markDirty();
              }}
              className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 outline-none border border-white/15 focus:border-evolve-yellow/60 transition-colors"
              style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
            />
          ) : (
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFile(e.dataTransfer.files?.[0]);
              }}
              className={`flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-8 text-center cursor-pointer transition-colors ${
                dragOver ? "border-evolve-yellow/60 bg-evolve-yellow/5" : "border-white/15"
              }`}
            >
              <input
                type="file"
                accept=".pdf,.zip,.png,.jpg,.jpeg"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <UploadIcon />
              <p className="text-white text-sm font-semibold">
                {portfolioFileName || (
                  <>
                    Drop your file here or <span className="text-evolve-yellow">browse</span>
                  </>
                )}
              </p>
              <p className="text-white/30 text-xs">PDF, ZIP, or a single image works best</p>
              <p className="text-white/20 text-[11px]">PDF · ZIP · PNG · JPG · max 25MB</p>
            </label>
          )}
        </div>

        {/* resume */}
        <div className="flex flex-col gap-2 pt-6">
          <label className="text-white text-sm font-bold">
            Submit your resume{" "}
            <span className="text-white/30 font-normal">(optional)</span>
          </label>
          <p className="text-white/40 text-xs -mt-1">
            Paste a link to your resume — Google Drive, Dropbox, or similar.
          </p>
          <input
            type="text"
            placeholder="https://drive.google.com/..."
            value={resumeLink}
            onChange={(e) => {
              setResumeLink(e.target.value);
              markDirty();
            }}
            className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 outline-none border border-white/15 focus:border-evolve-yellow/60 transition-colors"
            style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
          />
        </div>

        {/* walkthrough */}
        <div className="flex flex-col gap-2 pt-6">
          <label className="text-white text-sm font-bold">
            Your walkthrough recording{" "}
            <span className="text-white/30 font-normal">(optional)</span>
          </label>
          <p className="text-white/40 text-xs -mt-1">
            No face cam needed, just walk us through your work. Record with{" "}
            <a
              href="https://www.loom.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-evolve-yellow underline"
            >
              Loom
            </a>
            .
          </p>
          <input
            type="text"
            placeholder="https://loom.com/share.."
            value={walkthroughLink}
            onChange={(e) => {
              setWalkthroughLink(e.target.value);
              markDirty();
            }}
            className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 outline-none border border-white/15 focus:border-evolve-yellow/60 transition-colors"
            style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
          />
        </div>

        {/* notes */}
        <div className="flex flex-col gap-2 pt-6">
          <label className="text-white text-sm font-bold">
            Anything we should know? <span className="text-white/30 font-normal">(optional)</span>
          </label>
          <textarea
            rows={3}
            placeholder="Anything we should consider while reviewing?"
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              markDirty();
            }}
            className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 outline-none border border-white/15 focus:border-evolve-yellow/60 transition-colors resize-y"
            style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
          />
        </div>
      </div>

      {/* expectations — its own card, outside the main one */}
      <div className="flex flex-col gap-2">
        <label className="text-white text-sm font-bold">
          Your expectations from the mentorship
        </label>
        <textarea
          rows={4}
          placeholder="Ex. I want to get clarity on what design role fits me, and build a portfolio that actually gets replies."
          value={expectations}
          onChange={(e) => {
            setExpectations(e.target.value);
            markDirty();
          }}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3.5 text-white text-sm placeholder-white/30 outline-none focus:border-evolve-yellow/60 transition-colors resize-y"
        />
      </div>

      {status === "error" && (
        <p className="text-red-400 text-sm">
          Couldn't save that — please try again.
        </p>
      )}

      <button
        type="button"
        onClick={handleContinue}
        disabled={status === "saving"}
        className="w-full bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl py-3.5 disabled:opacity-40 active:opacity-80 transition-opacity"
      >
        {status === "saving" ? "Saving…" : status === "saved" ? "Saved ✓" : "Continue"}
      </button>
    </div>
  );
}
