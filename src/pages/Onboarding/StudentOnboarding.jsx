import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { right_arrow_icon } from "../../assets/images/Nav";
import OnboardingProgressBar from "./OnboardingProgressBar";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const ID_ACCEPTED_TYPES = ".jpg,.jpeg,.png,.pdf";
const MAX_FILE_MB = 10;
const YEAR_OPTIONS = ["1st", "2nd", "3rd", "4th", "5th"];

const inputClass =
  "w-full text-sm text-white outline-none border border-[#373737] rounded-xl px-4 py-3 transition-colors focus:border-evolve-yellow/60";
const inputStyle = { backgroundColor: "rgba(255,255,255,0.03)" };

// Fills the details form with example values instead of running a real
// upload + verify-student-id call — handy for demos/local testing without a
// real ID photo (and a fallback while that edge function's Gemini dependency
// is flaky).
const SAMPLE_STUDENT_ID = {
  college_name: "MIT Institute of Design",
  year: "3rd",
  program: "B.Des",
  stream: "Communication Design"
};

function IdCardIcon({ className }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="2.5" y="5" width="19" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="8.5" cy="11" r="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5.5 15.5c.6-1.4 1.8-2 3-2s2.4.6 3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M14 10h5M14 13h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon({ className }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="5" y="10.5" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 10.5V8a4 4 0 018 0v2.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

async function uploadStudentId(userId, file) {
  const ext = file.name.split(".").pop();
  const path = `${userId}/id-${Date.now()}.${ext}`;
  const { error: uploadErr } = await supabase.storage
    .from("student-ids")
    .upload(path, file, { upsert: true });
  if (uploadErr) throw new Error(uploadErr.message);
  return path;
}

async function callVerifyStudentId(userId, storagePath) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/verify-student-id`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY
    },
    body: JSON.stringify({ user_id: userId, storage_path: storagePath })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "couldn't read that ID");
  return json;
}

/**
 * The Student half of the new role-split onboarding. Two phases:
 * "upload" — name (editable, prefilled) + locked email + ID upload, with an
 *   always-visible "enter details manually" escape hatch — then
 * "details" — a shared academic-details form (college/year/program/stream),
 *   reached either pre-filled from a successful OCR read, blank after an
 *   unclear read, or blank via the manual-entry link. Every path funnels
 *   into this one form so there's always a final, editable confirmation
 *   step before anything is saved.
 *
 * Picking a file only stages it (shows the filename) — the actual upload +
 * verify-student-id call happens on "Continue", not on file selection, so
 * the person can see what they picked before committing to it.
 */
export default function StudentOnboarding({ user, onBack, onComplete }) {
  const [phase, setPhase] = useState("upload");
  const [name, setName] = useState(user.name || "");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [banner, setBanner] = useState(null); // { tone: "success" | "warning", text }
  const [verificationStatus, setVerificationStatus] = useState("manual");

  const [collegeName, setCollegeName] = useState("");
  const [year, setYear] = useState(null);
  const [program, setProgram] = useState("");
  const [stream, setStream] = useState("");
  const [detailsError, setDetailsError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function goToManualDetails() {
    setBanner(null);
    setVerificationStatus("manual");
    setPhase("details");
  }

  function handleUseSampleId() {
    setUploadError("");
    setCollegeName(SAMPLE_STUDENT_ID.college_name);
    setYear(SAMPLE_STUDENT_ID.year);
    setProgram(SAMPLE_STUDENT_ID.program);
    setStream(SAMPLE_STUDENT_ID.stream);
    setVerificationStatus("manual");
    setBanner({ tone: "warning", text: "Sample details — demo only, feel free to edit." });
    setPhase("details");
  }

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.size > MAX_FILE_MB * 1024 * 1024) {
      setUploadError(`file must be under ${MAX_FILE_MB}MB`);
      return;
    }
    setUploadError("");
    setFile(f);
  }

  async function handleContinueUpload() {
    if (!file || uploading) return;
    setUploading(true);
    try {
      const path = await uploadStudentId(user.id, file);
      const result = await callVerifyStudentId(user.id, path);
      if (result.is_clear) {
        setCollegeName(result.college_name || "");
        setYear(YEAR_OPTIONS.includes(result.year) ? result.year : null);
        setProgram(result.program || "");
        setStream(result.stream || "");
        setVerificationStatus("verified");
        setBanner({ tone: "success", text: "Extracted from your ID — please confirm." });
      } else {
        setVerificationStatus("unclear");
        setBanner({
          tone: "warning",
          text: "Your ID isn't clear enough to read — please enter your details manually."
        });
      }
      setPhase("details");
    } catch {
      setVerificationStatus("unclear");
      setBanner({
        tone: "warning",
        text: "We couldn't read your ID — please enter your details manually."
      });
      setPhase("details");
    } finally {
      setUploading(false);
    }
  }

  function handleSubmitDetails() {
    if (!collegeName.trim() || !year) {
      setDetailsError("college name and year are required");
      return;
    }
    setDetailsError("");
    setSubmitting(true);
    onComplete({
      name: name.trim(),
      college_name: collegeName.trim(),
      year,
      program: program.trim(),
      stream: stream.trim(),
      verificationStatus
    });
  }

  if (phase === "details") {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
        style={{ backgroundColor: "#161618" }}
      >
        <div
          className="w-full max-w-md mx-auto rounded-3xl border border-[#373737] p-6 sm:p-8 flex flex-col gap-5"
          style={{ backgroundColor: "#1c1c1f" }}
        >
          <OnboardingProgressBar step={3} total={3} />
          <button
            onClick={() => setPhase("upload")}
            className="self-start text-white/40 text-xs font-semibold hover:text-white/70 transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-white font-bold text-2xl leading-tight">
            Your academic details
          </h1>
          {banner && (
            <p
              className={`text-xs font-semibold rounded-xl px-4 py-3 ${
                banner.tone === "success"
                  ? "bg-evolve-yellow/10 text-evolve-yellow border border-evolve-yellow/30"
                  : "bg-white/5 text-white/60 border border-white/10"
              }`}
            >
              {banner.text}
            </p>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-white/40 text-xs">College name</label>
            <input
              type="text"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              placeholder="e.g. National Institute of Design"
              className={inputClass}
              style={inputStyle}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-white/40 text-xs">Year</label>
            <div className="flex flex-wrap gap-2">
              {YEAR_OPTIONS.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setYear(y)}
                  className="text-xs font-semibold px-4 py-2 rounded-full border transition-colors"
                  style={{
                    borderColor: year === y ? "rgba(255,208,7,0.6)" : "#373737",
                    backgroundColor: year === y ? "rgba(255,208,7,0.12)" : "transparent",
                    color: year === y ? "#FFD007" : "rgba(255,255,255,0.6)"
                  }}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-white/40 text-xs">Program</label>
            <input
              type="text"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              placeholder="e.g. B.Des"
              className={inputClass}
              style={inputStyle}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-white/40 text-xs">Stream</label>
            <input
              type="text"
              value={stream}
              onChange={(e) => setStream(e.target.value)}
              placeholder="e.g. Communication Design"
              className={inputClass}
              style={inputStyle}
            />
          </div>

          {detailsError && <p className="text-red-400 text-xs">{detailsError}</p>}

          <button
            onClick={handleSubmitDetails}
            disabled={submitting}
            className="flex items-center justify-center gap-2 bg-evolve-yellow text-evolve-black font-bold text-base rounded-2xl py-4 disabled:opacity-40 transition-opacity active:scale-[0.98] mt-2"
          >
            {submitting ? "Saving…" : (
              <>
                Continue
                <img src={right_arrow_icon} alt="" className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
      style={{ backgroundColor: "#161618" }}
    >
      <div
        className="w-full max-w-md mx-auto rounded-3xl border border-[#373737] p-6 sm:p-8 flex flex-col gap-5"
        style={{ backgroundColor: "#1c1c1f" }}
      >
        <OnboardingProgressBar step={2} total={3} />
        {onBack && (
          <button
            onClick={onBack}
            className="self-start text-white/40 text-xs font-semibold hover:text-white/70 transition-colors"
          >
            ← Back
          </button>
        )}
        <div className="flex flex-col gap-1.5">
          <h1 className="text-white font-bold text-2xl leading-tight">
            You're a student — nice.
          </h1>
          <p className="text-white/50 text-sm">
            Upload your college ID and we'll read your college, year and
            program from it. Nothing else to fill in.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-white/40 text-xs">Full name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-white/40 text-xs">Email</label>
          <div className="relative">
            <input
              type="email"
              value={user.email || ""}
              disabled
              className="w-full text-sm text-white/40 outline-none border border-[#373737] rounded-xl pl-4 pr-10 py-3 cursor-not-allowed"
              style={inputStyle}
            />
            <LockIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30" />
          </div>
          <p className="text-white/30 text-[11px]">
            From your sign-in, so it can't be changed here.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-white/40 text-xs">College ID</label>
          <label
            className="flex items-center gap-3 border border-dashed border-[#373737] rounded-xl px-4 py-3.5 cursor-pointer hover:border-white/25 transition-colors"
            style={inputStyle}
          >
            <IdCardIcon className="text-white/40 flex-shrink-0" />
            <span className="flex-1 min-w-0">
              <span className="block text-white text-sm font-semibold truncate">
                {file ? file.name : "Photo or PDF, front side"}
              </span>
              <span className="block text-white/30 text-[11px]">Up to {MAX_FILE_MB} MB</span>
            </span>
            <span className="flex-shrink-0 text-white text-xs font-semibold rounded-lg border border-[#373737] px-3 py-2 hover:bg-white/5 transition-colors">
              Choose file
            </span>
            <input
              type="file"
              accept={ID_ACCEPTED_TYPES}
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
          </label>
          {uploading && <p className="text-evolve-yellow text-xs mt-1">reading your ID…</p>}
          {uploadError && <p className="text-red-400 text-xs mt-1">{uploadError}</p>}
        </div>

        <button
          onClick={goToManualDetails}
          className="self-start text-white/50 text-xs font-semibold underline hover:text-white/80 transition-colors"
        >
          Prefer to type it in? Enter details manually
        </button>

        <button
          onClick={handleContinueUpload}
          disabled={!file || uploading}
          className="flex items-center justify-center gap-2 bg-evolve-yellow text-evolve-black font-bold text-base rounded-2xl py-4 disabled:opacity-40 transition-opacity active:scale-[0.98] mt-2"
        >
          {uploading ? "Reading your ID…" : (
            <>
              Continue
              <img src={right_arrow_icon} alt="" className="w-3.5 h-3.5" />
            </>
          )}
        </button>

        <button
          onClick={handleUseSampleId}
          className="self-center text-white/30 text-[11px] font-semibold underline hover:text-white/60 transition-colors"
        >
          Use a sample student ID (demo)
        </button>
      </div>
    </div>
  );
}
