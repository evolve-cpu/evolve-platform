import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../supabaseClient";
import { signin_left_pannel } from "../assets/images/Nav";

// the global site nav (rendered by AppLayout) is fixed at 56px tall
const NAV_HEIGHT = 56;

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const WHATSAPP_COMMUNITY_URL =
  "https://chat.whatsapp.com/DsLtzxlHPQXC4Gaee76qz4?s=cl&p=a&ilr=4";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidUrl = (str) => {
  try {
    const u = new URL(str.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

const isValidPhone = (str) => /^[0-9]{7,15}$/.test(str.trim());

const COUNTRY_CODES = [
  "+91",
  "+1",
  "+44",
  "+61",
  "+971",
  "+65",
  "+49",
  "+33",
  "+81",
  "+86",
  "+27",
  "+55"
];

const EXPERIENCE_OPTIONS = [
  "0-2 years",
  "2-5 years",
  "5-10 years",
  "10-15 years",
  "15+ years"
];

const STREAM_OPTIONS = [
  "Interior design",
  "Interaction design",
  "Product design",
  "Communication design",
  "Space design",
  "Fashion and textile design",
  "Moving images",
  "Architecture",
  "Visual arts",
  "Transdisciplinary design"
];

const HIRING_OPTIONS = ["Yes", "No"];

const SELECT_CHEVRON_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M5 8l5 5 5-5' stroke='%23000000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")";

/* ─── validation icons ────────────────────────────────────────────────────── */
function SuccessIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" stroke="#16a34a" strokeWidth="1.5" />
      <path
        d="M6 10.5l2.5 2.5L14 7"
        stroke="#16a34a"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" stroke="#dc2626" strokeWidth="1.5" />
      <path
        d="M10 6v5"
        stroke="#dc2626"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="10" cy="13.5" r="1" fill="#dc2626" />
    </svg>
  );
}

function RightArrowIcon({ className = "w-5 h-5" }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M5 12H19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 5L19 12L12 19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const OPTION_STYLE = { backgroundColor: "#FFD007", color: "#000" };

/* ─── shared field pieces (module scope — never remounted on re-render) ────── */
function TextField({
  label,
  value,
  onChange,
  onBlur,
  touched,
  valid,
  placeholder,
  type = "text"
}) {
  const borderColor = !touched
    ? "border-black"
    : valid
      ? "border-green-600"
      : "border-red-600";
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-black">
        {label} <span className="text-red-600">*</span>
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`w-full rounded-2xl px-4 py-3 md:py-3.5 bg-transparent border-2 ${borderColor} placeholder-black/50 font-bold text-black outline-none text-[15px] md:text-[16px] pr-10 transition-colors`}
        />
        {touched && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
            {valid ? <SuccessIcon /> : <ErrorIcon />}
          </span>
        )}
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  onBlur,
  touched,
  valid,
  options,
  placeholder = "Select an option"
}) {
  const borderColor = !touched
    ? "border-black"
    : valid
      ? "border-green-600"
      : "border-red-600";
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-black">
        {label} <span className="text-red-600">*</span>
      </label>
      <select
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`w-full rounded-2xl px-4 py-3 md:py-3.5 bg-transparent border-2 ${borderColor} font-bold text-black outline-none text-[15px] md:text-[16px] appearance-none bg-no-repeat transition-colors`}
        style={{
          backgroundImage: SELECT_CHEVRON_BG,
          backgroundPosition: "right 1rem center"
        }}
      >
        <option value="" disabled style={OPTION_STYLE}>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} style={OPTION_STYLE}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function PhoneField({
  countryCode,
  setCountryCode,
  phone,
  onChange,
  onBlur,
  touched,
  valid
}) {
  const borderColor = !touched
    ? "border-black"
    : valid
      ? "border-green-600"
      : "border-red-600";
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-black">
        Enter your phone <span className="text-red-600">*</span>
      </label>
      <div className="flex gap-2">
        <select
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
          className="rounded-2xl pl-3 pr-8 py-3 md:py-3.5 bg-transparent border-2 border-black font-bold text-black outline-none text-[15px] md:text-[16px] appearance-none bg-no-repeat"
          style={{
            backgroundImage: SELECT_CHEVRON_BG,
            backgroundPosition: "right 0.6rem center"
          }}
        >
          {COUNTRY_CODES.map((c) => (
            <option key={c} value={c} style={OPTION_STYLE}>
              {c}
            </option>
          ))}
        </select>
        <div className="relative flex-1">
          <input
            type="tel"
            value={phone}
            onChange={onChange}
            onBlur={onBlur}
            placeholder="98XXXXXXXX"
            className={`w-full rounded-2xl px-4 py-3 md:py-3.5 bg-transparent border-2 ${borderColor} placeholder-black/50 font-bold text-black outline-none text-[15px] md:text-[16px] pr-10 transition-colors`}
          />
          {touched && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
              {valid ? <SuccessIcon /> : <ErrorIcon />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── the form fields block — shared by desktop and mobile layouts ─────────── */
function ReviewerFormFields(props) {
  const {
    name,
    setName,
    email,
    setEmail,
    countryCode,
    setCountryCode,
    phone,
    setPhone,
    linkedin,
    setLinkedin,
    designationWorkplace,
    setDesignationWorkplace,
    experience,
    setExperience,
    stream,
    setStream,
    hiringExperience,
    setHiringExperience,
    touched,
    markTouched,
    validity,
    submitError,
    submitting,
    handleSubmit
  } = props;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <TextField
        label="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => markTouched("name")}
        touched={touched.name}
        valid={validity.name}
        placeholder="Your name here"
      />
      <TextField
        label="Enter your email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => markTouched("email")}
        touched={touched.email}
        valid={validity.email}
        placeholder="Your email here"
      />
      <PhoneField
        countryCode={countryCode}
        setCountryCode={setCountryCode}
        phone={phone}
        onChange={(e) => setPhone(e.target.value)}
        onBlur={() => markTouched("phone")}
        touched={touched.phone}
        valid={validity.phone}
      />
      <TextField
        label="Enter your LinkedIn profile link"
        type="url"
        value={linkedin}
        onChange={(e) => setLinkedin(e.target.value)}
        onBlur={() => markTouched("linkedin")}
        touched={touched.linkedin}
        valid={validity.linkedin}
        placeholder="e.g. linkedin.com/in/yourname"
      />
      <TextField
        label="Enter your designation and workplace"
        value={designationWorkplace}
        onChange={(e) => setDesignationWorkplace(e.target.value)}
        onBlur={() => markTouched("designationWorkplace")}
        touched={touched.designationWorkplace}
        valid={validity.designationWorkplace}
        placeholder="e.g. Senior Product Designer, Google"
      />
      <SelectField
        label="How much experience do you have in industry?"
        value={experience}
        onChange={(e) => setExperience(e.target.value)}
        onBlur={() => markTouched("experience")}
        touched={touched.experience}
        valid={validity.experience}
        options={EXPERIENCE_OPTIONS}
      />
      <SelectField
        label="What's your stream or area of expertise?"
        value={stream}
        onChange={(e) => setStream(e.target.value)}
        onBlur={() => markTouched("stream")}
        touched={touched.stream}
        valid={validity.stream}
        options={STREAM_OPTIONS}
      />
      <SelectField
        label="Do you have any hiring experience or have you been a part of the hiring process?"
        value={hiringExperience}
        onChange={(e) => setHiringExperience(e.target.value)}
        onBlur={() => markTouched("hiringExperience")}
        touched={touched.hiringExperience}
        valid={validity.hiringExperience}
        options={HIRING_OPTIONS}
      />

      {submitError && (
        <p className="text-sm font-semibold text-red-700">{submitError}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 inline-flex items-center justify-center gap-2 font-extrabold px-6 py-3.5 rounded-2xl border-2 border-black bg-black text-evolve-yellow transition-opacity duration-150 hover:opacity-80 disabled:opacity-60"
        style={{ boxShadow: "4px 4px 0 0 #BF9C05" }}
      >
        {submitting ? "Submitting…" : "Submit"}
        {!submitting && <RightArrowIcon />}
      </button>
    </form>
  );
}

/* ─── success content — swapped in place of the form, inside the existing
   layout (right panel on desktop, same block on mobile) ─────────────────── */
function ReviewerSuccessContent() {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-10">
      <div className="w-16 h-16 rounded-full border-4 border-green-500 flex items-center justify-center">
        <svg width="30" height="30" viewBox="0 0 36 36" fill="none">
          <path
            d="M8 18l7 7 13-14"
            stroke="#16a34a"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h1
        className="font-extrabold text-black"
        style={{ fontSize: "clamp(26px,6vw,34px)" }}
      >
        Your submission is successful!
      </h1>
      <p className="text-black/70 text-sm md:text-base">
        we've got your details, we will reach out to you shortly :)
      </p>
      <a
        href={WHATSAPP_COMMUNITY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 font-extrabold px-6 py-3.5 rounded-2xl border-2 border-black bg-black text-evolve-yellow hover:opacity-90 transition-opacity"
        style={{ boxShadow: "4px 4px 0 0 #806804" }}
      >
        Join evolve community
      </a>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   BecomeAReviewer — page
══════════════════════════════════════════════════════════════════════════ */
export default function BecomeAReviewer() {
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [designationWorkplace, setDesignationWorkplace] = useState("");
  const [experience, setExperience] = useState("");
  const [stream, setStream] = useState("");
  const [hiringExperience, setHiringExperience] = useState("");
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [done, setDone] = useState(false);

  // prefill from an already-signed-in user — they can still edit either field
  useEffect(() => {
    if (!user) return;
    setName((prev) => prev || user.name || "");
    setEmail((prev) => prev || user.email || "");
  }, [user]);

  const markTouched = (field) => setTouched((t) => ({ ...t, [field]: true }));

  const validity = {
    name: name.trim().length > 1,
    email: EMAIL_RE.test(email.trim()),
    phone: isValidPhone(phone),
    linkedin: isValidUrl(linkedin),
    designationWorkplace: designationWorkplace.trim().length > 1,
    experience: !!experience,
    stream: !!stream,
    hiringExperience: !!hiringExperience
  };
  const isFormValid = Object.values(validity).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setTouched({
      name: true,
      email: true,
      phone: true,
      linkedin: true,
      designationWorkplace: true,
      experience: true,
      stream: true,
      hiringExperience: true
    });

    if (!isFormValid) {
      setSubmitError("please fill in all the fields correctly.");
      return;
    }

    setSubmitting(true);
    const [designationPart, ...workplaceParts] = designationWorkplace
      .trim()
      .split(",");
    const payload = {
      user_id: user?.id || null,
      name: name.trim(),
      email: email.trim(),
      country_code: countryCode,
      phone: phone.trim(),
      linkedin_url: linkedin.trim(),
      designation: designationPart.trim(),
      workplace: workplaceParts.join(",").trim(),
      experience,
      stream,
      hiring_experience: hiringExperience
    };

    try {
      const { error } = await supabase
        .from("reviewer_applications")
        .insert(payload);
      if (error) throw error;

      // best-effort mirror into the team's Google Sheet — never blocks the submission.
      // Runs as a Supabase Edge Function (not a Vercel one) to stay under Vercel's
      // per-project serverless function cap.
      fetch(`${SUPABASE_URL}/functions/v1/append-reviewer-sheet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_ANON_KEY
        },
        body: JSON.stringify(payload)
      }).catch(() => {});

      setDone(true);
    } catch (err) {
      console.error("reviewer application submit error", err);
      setSubmitError("something went wrong, please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldProps = {
    name,
    setName,
    email,
    setEmail,
    countryCode,
    setCountryCode,
    phone,
    setPhone,
    linkedin,
    setLinkedin,
    designationWorkplace,
    setDesignationWorkplace,
    experience,
    setExperience,
    stream,
    setStream,
    hiringExperience,
    setHiringExperience,
    touched,
    markTouched,
    validity,
    submitError,
    submitting,
    handleSubmit
  };

  return (
    <div className="font-bricolage bg-evolve-yellow">
      {/* ── Desktop — pinned to the viewport below the nav, independent of any
          ancestor layout height, so only the right column ever scrolls ── */}
      <div
        className="hidden md:flex"
        style={{
          position: "fixed",
          top: NAV_HEIGHT,
          left: 0,
          right: 0,
          bottom: 0
        }}
      >
        <div className="w-[42%] h-full flex-shrink-0 bg-[#161616]">
          <img
            src={signin_left_pannel}
            alt="evolve — grow your design career in public."
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 h-full overflow-y-auto bg-evolve-yellow">
          <div className="pl-16 lg:pl-24 pr-10 lg:pr-16 py-12 max-w-3xl">
            {done ? (
              <ReviewerSuccessContent />
            ) : (
              <>
                <h1
                  className="font-extrabold text-black whitespace-nowrap text-[28px] lg:text-[34px] leading-tight"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  Portfolio Reviewers for evolve
                </h1>
                <p className="text-black text-[15px] md:text-[16px] mt-3 leading-tight">
                  We're super excited that you have shown interest in being a
                  reviewer at evolve. Please help us know you better by
                  filling this form and we will reach out to you shortly :)
                </p>
                <div className="mt-8">
                  <ReviewerFormFields {...fieldProps} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile ── */}
      <div
        className="flex md:hidden flex-col"
        style={{ paddingTop: NAV_HEIGHT }}
      >
        <div className="px-5 py-8">
          {done ? (
            <ReviewerSuccessContent />
          ) : (
            <>
              <h1
                className="font-extrabold text-black text-[26px] leading-[1.1]"
                style={{ letterSpacing: "-0.02em" }}
              >
                Portfolio Reviewers <br />
                for evolve
              </h1>
              <p className="text-black text-[14px] mt-3 leading-tight">
                We're super excited that you have shown interest in being a
                reviewer at evolve. Please help us know you better by filling
                this form and we will reach out to you shortly :)
              </p>
              <div className="mt-7">
                <ReviewerFormFields {...fieldProps} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
