import { useState } from "react";
import { supabase } from "../../supabaseClient";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const ID_ACCEPTED_TYPES = ".jpg,.jpeg,.png,.pdf";
const MAX_FILE_MB = 10;
const YEAR_OPTIONS = ["1st", "2nd", "3rd", "4th", "5th"];

const inputClass =
  "w-full text-sm text-white outline-none border border-[#373737] rounded-xl px-4 py-3 transition-colors focus:border-evolve-yellow/60";
const inputStyle = { backgroundColor: "rgba(255,255,255,0.03)" };

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

  async function handleFileChange(e) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.size > MAX_FILE_MB * 1024 * 1024) {
      setUploadError(`file must be under ${MAX_FILE_MB}MB`);
      return;
    }
    setUploadError("");
    setFile(f);
    setUploading(true);
    try {
      const path = await uploadStudentId(user.id, f);
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
        <div className="w-full max-w-md mx-auto flex flex-col gap-5">
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
            className="bg-evolve-yellow text-evolve-black font-bold text-base rounded-2xl py-4 disabled:opacity-40 transition-opacity active:scale-[0.98] mt-2"
          >
            {submitting ? "Saving…" : "Continue →"}
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
      <div className="w-full max-w-md mx-auto flex flex-col gap-5">
        {onBack && (
          <button
            onClick={onBack}
            className="self-start text-white/40 text-xs font-semibold hover:text-white/70 transition-colors"
          >
            ← Back
          </button>
        )}
        <h1 className="text-white font-bold text-2xl leading-tight">
          Tell us about yourself
        </h1>

        <div className="flex flex-col gap-1.5">
          <label className="text-white/40 text-xs">Name</label>
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
          <input
            type="email"
            value={user.email || ""}
            disabled
            className="w-full text-sm text-white/40 outline-none border border-[#373737] rounded-xl px-4 py-3 cursor-not-allowed"
            style={inputStyle}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-white/40 text-xs">Upload your college ID card</label>
          <input
            type="file"
            accept={ID_ACCEPTED_TYPES}
            onChange={handleFileChange}
            disabled={uploading}
            className="w-full text-xs text-white/60 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border file:border-[#373737] file:bg-transparent file:text-white/70 file:text-xs disabled:opacity-40"
          />
          {file && !uploading && <p className="text-white/40 text-xs mt-1">{file.name}</p>}
          {uploading && <p className="text-evolve-yellow text-xs mt-1">reading your ID…</p>}
          {uploadError && <p className="text-red-400 text-xs mt-1">{uploadError}</p>}
        </div>

        <button
          onClick={goToManualDetails}
          className="self-start text-white/50 text-xs font-semibold underline hover:text-white/80 transition-colors"
        >
          Prefer to type it in? Enter details manually
        </button>
      </div>
    </div>
  );
}
