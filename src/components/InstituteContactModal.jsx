import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { supabase } from "../supabaseClient";

const WhatsAppIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12.004 2C6.486 2 2 6.486 2 12.004c0 1.858.505 3.6 1.383 5.096L2 22l5.03-1.352a9.96 9.96 0 004.974 1.328h.004c5.518 0 10.004-4.486 10.004-10.004C22.012 6.486 17.526 2 12.004 2zm0 18.312a8.25 8.25 0 01-4.213-1.156l-.302-.18-3.03.813.81-2.955-.196-.303a8.25 8.25 0 01-1.263-4.427c0-4.55 3.703-8.253 8.253-8.253 4.549 0 8.252 3.703 8.252 8.253 0 4.55-3.703 8.253-8.252 8.253zm4.522-6.18c-.248-.124-1.463-.722-1.69-.805-.227-.083-.392-.124-.557.124-.164.248-.638.805-.782.97-.144.165-.289.186-.536.062-.248-.124-1.046-.386-1.992-1.23-.736-.657-1.233-1.469-1.378-1.717-.144-.248-.015-.382.109-.505.112-.112.248-.29.372-.434.124-.145.165-.248.248-.413.083-.165.041-.31-.02-.434-.062-.124-.557-1.344-.763-1.84-.201-.483-.406-.418-.557-.425-.144-.007-.31-.008-.475-.008-.165 0-.434.062-.661.31-.227.248-.867.847-.867 2.066 0 1.22.888 2.398 1.012 2.563.124.165 1.747 2.668 4.233 3.74.591.255 1.052.408 1.412.522.593.189 1.133.162 1.56.098.476-.071 1.463-.598 1.67-1.176.207-.578.207-1.074.145-1.177-.062-.104-.227-.165-.475-.29z" />
  </svg>
);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// const CALENDLY_URL = "https://calendly.com/chesna-paperclip/new-meeting";
const CALENDLY_URL = "https://calendly.com/chesna-evolvedesign/30min";

const InstituteContactModal = ({
  isOpen,
  onClose,
  programme,
  whatsappUrl,
  intent = "contact",
  handbookUrl,
  onTrack,
  // Institute vs corporate leads land in different tables with a differently
  // named organisation column — these three default to the institute shape.
  table = "institute_inquiries",
  orgLabel = "institute name",
  orgField = "institute_name"
}) => {
  const [name, setName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // null | "success" | "error"
  const [errorMsg, setErrorMsg] = useState("");
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setOrgName("");
      setEmail("");
      setPhone("");
      setLookingFor("");
      setStatus(null);
      setErrorMsg("");
    }
  }, [isOpen]);

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
  };

  const triggerHandbookDownload = () => {
    if (!handbookUrl) return;
    const link = document.createElement("a");
    link.href = handbookUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim() || !orgName.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg("please fill in all mandatory fields.");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setErrorMsg("please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from(table).insert({
        name: name.trim(),
        [orgField]: orgName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        looking_for: lookingFor.trim() || null,
        programme,
        intent
      });

      if (error) throw error;

      setStatus("success");
      if (intent === "handbook") triggerHandbookDownload();
    } catch (err) {
      console.error("inquiry submit error", err);
      setErrorMsg("something went wrong, please try again.");
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isFormFilled =
    name.trim() && orgName.trim() && email.trim() && phone.trim();

  const inputClass =
    "w-full rounded-2xl px-4 py-3 md:py-3.5 bg-transparent border-2 border-[#806804] placeholder-black/60 font-bold text-black outline-none focus:ring-2 ring-[#806804] focus:border-black text-[15px] md:text-[17px]";

  return (
    <div
      className="fixed inset-0 z-[10050] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-[92vw] md:max-w-[600px] max-h-[90vh] bg-[#FFD007] border-2 border-black rounded-2xl overflow-hidden"
        style={{ boxShadow: "8px 8px 0 0 rgba(0,0,0,0.5)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-1.5 rounded-full hover:bg-black/10 transition-colors"
          aria-label="close modal"
        >
          <X className="w-6 h-6 text-black" />
        </button>

        <div className="modal-scrollbar overflow-y-auto max-h-[90vh] px-6 md:px-9 pt-10 pb-8">
          {status === "success" ? (
            <div className="flex flex-col items-center text-center gap-4 py-6">
              <svg className="w-14 h-14" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="17" stroke="#000" strokeWidth="2" />
                <path
                  d="M9 18l6 6 12-13"
                  stroke="#000"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <h2 className="font-extrabold lowercase text-black text-[28px] md:text-[34px] leading-tight">
                {intent === "handbook"
                  ? "handbook on its way!"
                  : "thanks for reaching out!"}
              </h2>
              <p className="font-normal lowercase text-black text-[15px] md:text-[17px]">
                {intent === "handbook"
                  ? "Your download should begin in a few seconds. We'll also reach out to you soon."
                  : "our team will get back to you shortly."}
              </p>
              <button
                onClick={onClose}
                className="mt-2 font-extrabold lowercase px-6 py-3 rounded-2xl border-2 border-black bg-black text-[#FFD007]"
                style={{ boxShadow: "4px 4px 0 0 #BF9C05" }}
              >
                close
              </button>
            </div>
          ) : (
            <>
              <h2 className="font-extrabold lowercase text-black text-[28px] md:text-[36px] leading-tight">
                {intent === "handbook" ? "get the handbook" : "let's talk"}
              </h2>
              {/* <p className="font-normal lowercase text-black text-[15px] md:text-[18px] mt-2">
                {intent === "handbook"
                  ? "share a few details and we'll send it right over."
                  : "tell us a bit about you and we'll get back to you."}
              </p> */}

              <form
                onSubmit={handleSubmit}
                className="mt-5 flex flex-col gap-2"
              >
                <div className="flex flex-col md:flex-row gap-2">
                  <input
                    type="text"
                    required
                    placeholder="name*"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`${inputClass} md:flex-1`}
                  />
                  <input
                    type="text"
                    required
                    placeholder={`${orgLabel}*`}
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className={`${inputClass} md:flex-1`}
                  />
                </div>
                <div className="flex flex-col md:flex-row gap-2">
                  <input
                    type="email"
                    required
                    placeholder="email*"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className={`${inputClass} md:flex-1`}
                  />
                  <input
                    type="tel"
                    required
                    placeholder="phone number*"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    className={`${inputClass} md:flex-1`}
                  />
                </div>
                {intent !== "handbook" && (
                  <textarea
                    placeholder="what're you looking for? (optional)"
                    rows={2}
                    value={lookingFor}
                    onChange={(e) => setLookingFor(e.target.value)}
                    className={`${inputClass} resize-none`}
                  />
                )}

                {errorMsg && (
                  <p className="text-sm md:text-base font-semibold text-red-700 lowercase">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting || !isFormFilled}
                  className="mt-1 font-extrabold lowercase px-6 py-3.5 rounded-2xl border-2 border-black bg-black text-evolve-yellow transition-colors hover:bg-[#FFE470] hover:text-black disabled:opacity-60 disabled:hover:bg-evolve-yellow"
                  style={{ boxShadow: "4px 4px 0 0 #BF9C05" }}
                >
                  {submitting
                    ? "sending…"
                    : intent === "handbook"
                      ? "submit & download"
                      : "submit"}
                </button>
              </form>

              {intent !== "handbook" && (
                <>
                  <div className="flex items-center gap-3 mt-4">
                    <div className="h-px flex-1 bg-black/20" />
                    <span className="font-bold lowercase text-black/60 text-[13px]">
                      or
                    </span>
                    <div className="h-px flex-1 bg-black/20" />
                  </div>
                  <a
                    href={CALENDLY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 font-extrabold lowercase px-6 py-3.5 rounded-2xl border-2 border-black bg-black text-[#FFD007] hover:opacity-90 transition-opacity"
                    style={{ boxShadow: "4px 4px 0 0 #BF9C05" }}
                  >
                    book a 30-min call
                  </a>
                </>
              )}

              {whatsappUrl && intent !== "handbook" && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onTrack?.("whatsapp")}
                  className="mt-4 flex items-center justify-center gap-2 font-bold lowercase text-black text-[14px] md:text-[16px] underline underline-offset-4"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                  or message us on whatsapp
                </a>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstituteContactModal;
