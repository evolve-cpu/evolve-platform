import { useState } from "react";
import ReactDOM from "react-dom";
import { signInWithGoogle, signInWithLinkedIn } from "../../auth/signInLogic";
import { accentFor } from "./lib/constants";

/**
 * Shared bottom-sheet-on-mobile / centred-modal-on-desktop shell. Every
 * modal uses the same width; the outer box clips to its rounded corners and
 * only the inner area scrolls (thin themed scrollbar, see .tt-sheet-scroll),
 * so the close button stays put while long content scrolls under it.
 * Anything passed as `header` (e.g. a title + tabs) stays pinned above the
 * scrolling body.
 */
export function SheetShell({ open, onClose, children, header }) {
  if (!open) return null;
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[10050] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div
        className="relative w-full md:w-[calc(100%-48px)] md:max-w-[640px] max-h-[90vh] md:max-h-[88vh] md:min-h-[min(560px,88vh)] flex flex-col overflow-hidden bg-[#161616] text-white border-t-2 md:border-2 border-white/10 rounded-t-[26px] md:rounded-[28px]"
        style={{ boxShadow: "0 -10px 40px rgba(0,0,0,.5)" }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 md:right-5 md:top-5 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 grid place-items-center text-white"
          aria-label="close"
        >
          ×
        </button>
        {header ? (
          <>
            <div className="flex-none px-6 md:px-8 pt-3 md:pt-8 pb-4 border-b border-white/10">
              <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4 md:hidden" />
              {header}
            </div>
            <div className="tt-sheet-scroll flex-1 min-h-0 overflow-y-auto px-6 md:px-8 pt-1 pb-8 md:pb-9">
              {children}
            </div>
          </>
        ) : (
          <div className="tt-sheet-scroll flex-1 min-h-0 overflow-y-auto px-6 md:px-8 pt-3 pb-8 md:pt-8 md:pb-9">
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4 md:hidden" />
            {children}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export function AuthSheet({ open, onClose }) {
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  async function go(provider) {
    setError("");
    setLoading(provider);
    try {
      if (provider === "google") await signInWithGoogle("/typetober");
      else await signInWithLinkedIn("/typetober");
    } catch (err) {
      setError(err.message || `${provider} sign-in failed. Try again.`);
      setLoading("");
    }
  }

  return (
    <SheetShell open={open} onClose={onClose}>
      <h2 className="text-[28px] md:text-[34px] font-extrabold leading-tight mr-8">
        Join the challenge
      </h2>
      <p className="text-white/60 mt-2 text-[15px] leading-snug">
        Sign in to unlock today's letter, submit your work and collect
        certificates.
      </p>

      <div className="flex flex-col gap-3 mt-6">
        <button
          onClick={() => go("google")}
          disabled={!!loading}
          className="w-full h-14 bg-white text-black font-semibold text-[16px] rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            />
          </svg>
          {loading === "google" ? "Opening Google…" : "Continue with Google"}
        </button>

        <button
          onClick={() => go("linkedin")}
          disabled={!!loading}
          className="w-full h-14 bg-[#2d64bc] text-white font-semibold text-[16px] rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <rect width="24" height="24" rx="4" fill="#fff" />
            <path
              fill="#2d64bc"
              d="M6.9 9.7h2.6V18H6.9zM8.2 5.7a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM10.8 9.7h2.5v1.1c.4-.7 1.3-1.3 2.6-1.3 2.7 0 3.2 1.8 3.2 4.1V18h-2.6v-3.9c0-.9 0-2.1-1.3-2.1s-1.5 1-1.5 2V18h-2.6z"
            />
          </svg>
          {loading === "linkedin"
            ? "Opening LinkedIn…"
            : "Continue with LinkedIn"}
        </button>
      </div>

      {error && <p className="text-red-400 text-[13px] mt-3">{error}</p>}
    </SheetShell>
  );
}

const MEDAL = { gold: "#FFD007", silver: "#D9DDE8", bronze: "#E28B4F" };

function Tier({ badge, color, title, sub }) {
  return (
    <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-4">
      <div
        className="w-11 h-11 rounded-full grid place-items-center font-extrabold text-black text-[14px] flex-none border-2 border-black"
        style={{
          background: color,
          boxShadow: "inset 0 -4px 0 rgba(0,0,0,.18)"
        }}
      >
        {badge}
      </div>
      <div>
        <b className="block">{title}</b>
        <span className="text-white/50 text-[14px]">{sub}</span>
      </div>
    </div>
  );
}

const SECTION_LABEL =
  "text-[13px] font-extrabold tracking-[.06em] uppercase text-white/50 mt-6";

export function PrizeSheet({ open, onClose }) {
  return (
    <SheetShell open={open} onClose={onClose}>
      <h2 className="text-[30px] md:text-[34px] font-extrabold leading-tight mr-10">
        Prizes
      </h2>
      <div className="font-extrabold text-[16px] mt-3">Prizes worth over</div>
      <div className="text-[52px] md:text-[56px] font-extrabold text-evolve-yellow leading-none mt-1.5 tracking-tight">
        ₹50,000
      </div>

      <h3 className={SECTION_LABEL}>Top prizes</h3>
      <div className="flex flex-col gap-2.5 mt-3">
        <Tier
          badge="1st"
          color={MEDAL.gold}
          title="First place"
          sub="Strongest whole series"
        />
        <Tier
          badge="2nd"
          color={MEDAL.silver}
          title="Second place"
          sub="Strongest whole series"
        />
        <Tier
          badge="3rd"
          color={MEDAL.bronze}
          title="Third place"
          sub="Strongest whole series"
        />
      </div>
      <p className="text-white font-bold text-[14px] leading-5 mt-3">
        Submit all 26 alphabets as a series to qualify for the top prizes. Extra
        versions of a letter count once here.
      </p>

      <h3 className={SECTION_LABEL}>Certificates</h3>
      <div className="flex flex-col gap-2.5 mt-3">
        <Tier
          badge="10"
          color={MEDAL.bronze}
          title="Bronze certificate"
          sub="Upon 10 alphabet submissions"
        />
        <Tier
          badge="18"
          color={MEDAL.silver}
          title="Silver certificate"
          sub="Upon 18 alphabet submissions"
        />
        <Tier
          badge="26"
          color={MEDAL.gold}
          title="Gold certificate"
          sub="Upon 26 alphabet submissions"
        />
      </div>

      <p className="text-white/80 font-semibold text-[15px] leading-[22px] text-center mt-5">
        …and many more prizes. Best on paper, best digital, community favourite
        and more. Every submission counts for these, including extra versions of
        a letter.
      </p>
    </SheetShell>
  );
}

// Copy from the Typetober design reference.
const GUIDELINES = [
  [
    "Eligibility & accounts",
    "Participants must create one account on the evolve platform prior to submitting."
  ],
  [
    "Format & themes",
    "Create one letter per day (A–Z) from 1 to 31 October. There are no themes, so you have full creative freedom. We encourage you to submit all 26 alphabets by 31 October. You can upload them together or daily."
  ],
  [
    "Submissions & fees",
    "Submit unlimited entries per letter across paper or digital categories. Participation costs ₹10 per letter. All entries must be submitted by 31 October, 11:59 PM IST."
  ],
  [
    "Strict no-AI policy",
    "Generative AI, AI image generators, font generators, or editing AI output are strictly prohibited. All entries must be 100% human-made. Shortlisted participants must provide process proof (timelapses, layered files, or 3+ stage photos) within 48 hours."
  ],
  [
    "Originality & copyright",
    "Work must be original and created specifically for Typetober. Tracing, plagiarism, using existing fonts as-is, and using copyrighted logos/characters are not allowed."
  ]
];

const FAQS = [
  [
    "Do I need to be a designer?",
    "Nope. If you can draw, doodle, paint or build, you're in."
  ],
  ["Do I need to follow a theme?", "No theme. It's open."],
  [
    "Can I submit more than one version of a letter?",
    "Yes, as many as you like. Each one is a separate submission with its own fee. Judges look at everything you submit."
  ],
  [
    "What if I miss a day?",
    "You can submit all the letters anytime before 31st Oct 2026."
  ],
  [
    "Can I submit letters ahead of their date?",
    "No. Submissions open on a daily basis, 1 letter a day."
  ],
  [
    "Can I animate my letter?",
    "Not this time. Only still images, square (1:1)."
  ],
  [
    "Can I use a font?",
    "Only as a starting point, and you must change it visibly. A letter typed as-is doesn't count."
  ],
  [
    "Can I use AI?",
    "No generative AI. Regular tools, filters and photo edits are fine."
  ],
  [
    "Why is there a fee?",
    "It keeps everyone committed, and it's only Rs 10 per submission."
  ],
  ["Can I pay from outside India?", "No."],
  [
    "My payment failed. What now?",
    <>
      Reach out to +91-8209326997 (Yash) or mail us at{" "}
      <a
        href="mailto:content@evolvedesign.academy"
        className="text-evolve-yellow underline underline-offset-4"
      >
        content@evolvedesign.academy
      </a>
      .
    </>
  ],
  [
    "Do I have to post on Instagram?",
    "No. Submitting on evolve is what counts. Posting on Instagram gets you featured."
  ],
  [
    "How are the top 3 picked?",
    "On the strongest whole series. Only those who submit all 26 alphabets as a series qualify."
  ],
  ["When are the results out?", "7 Nov"],
  [
    "Who owns my work?",
    "You do. evolve may repost it, always with credit to you."
  ],
  [
    "What do I get?",
    <>
      <b className="text-white">Top prizes:</b> 1st, 2nd and 3rd place.
      <br />
      <b className="text-white">Certificates:</b> Participant (1 alphabet),
      Bronze (10), Silver (18) and Gold (26).
      <br />
      <b className="text-white">Best of awards:</b> best on paper, best digital,
      best use of colour, best craft &amp; detail, most experimental, wittiest
      idea, best letter play, best found-object letter, best roots, best
      minimal, most consistent series, most improved, best newcomer and
      community favourite.
      <br />
      <b className="text-white">Weekly top picks:</b> the best work of the week
      gets featured.
    </>
  ]
];

export function GuideSheet({ open, onClose }) {
  const [tab, setTab] = useState("guidelines");
  const header = (
    <>
      <h2 className="text-[30px] md:text-[34px] font-extrabold leading-tight mr-10">
        Participant guidelines
      </h2>
      <div
        className="flex gap-1 bg-white/5 rounded-full p-1 mt-5"
        role="tablist"
      >
        {[
          ["guidelines", "Guidelines"],
          ["faqs", "FAQs"]
        ].map(([k, label]) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`flex-1 py-2.5 rounded-full font-extrabold text-[15px] transition-colors ${
              tab === k
                ? "bg-evolve-yellow text-black"
                : "text-white/60 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </>
  );
  return (
    <SheetShell open={open} onClose={onClose} header={header}>
      {tab === "guidelines" ? (
        <ul className="flex flex-col mt-2">
          {GUIDELINES.map(([t, d], i) => (
            <li
              key={t}
              className={`flex gap-4 py-4 ${i ? "border-t border-white/10" : ""}`}
            >
              <div
                className="w-9 h-9 rounded-lg bg-white/10 grid place-items-center font-extrabold flex-none"
                style={{ color: accentFor(i) }}
              >
                {i + 1}
              </div>
              <div>
                <b className="block text-[17px]">{t}</b>
                <span className="block text-white/55 text-[14px] leading-[22px] mt-1">
                  {d}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-1">
          {FAQS.map(([q, a]) => (
            <details key={q} className="tt-faq border-b border-white/10">
              <summary className="flex items-center justify-between gap-3 py-4 font-bold text-[16px] leading-[22px] cursor-pointer">
                {q}
              </summary>
              <p className="pb-4 text-white/55 text-[15px] leading-[22px]">
                {a}
              </p>
            </details>
          ))}
        </div>
      )}
    </SheetShell>
  );
}

export function Lightbox({
  open,
  onClose,
  letter,
  dayNumber,
  item,
  mine,
  shared,
  onShare,
  onJoin
}) {
  if (!item) return null;
  return (
    <SheetShell open={open} onClose={onClose}>
      <div className="relative rounded-2xl overflow-hidden aspect-square bg-white/5 w-full mx-auto md:max-w-[min(100%,58vh)]">
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt={letter}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </div>
      <div className="flex items-center justify-between mt-4">
        <div>
          <b className="text-[20px] font-extrabold">
            {item.isExample
              ? `${letter} · Example${item.credit ? ` by ${item.credit}` : ""}`
              : `${letter} · @${item.profiles?.username || item.profiles?.name || "you"}`}
          </b>
          <div className="text-white/50 text-[14px]">
            Typetober · Day {dayNumber}
          </div>
        </div>
      </div>
      {mine ? (
        <button
          onClick={onShare}
          className="tt-btn w-full mt-5 bg-evolve-yellow text-black font-extrabold py-3.5 rounded-2xl"
        >
          Share this letter
        </button>
      ) : shared ? (
        <>
          <p className="text-white/60 text-[15px] mt-4 leading-snug">
            1 month, 26 alphabets. Illustrate them your way and put yours on the
            wall.
          </p>
          <button
            onClick={onJoin}
            className="tt-btn w-full mt-4 bg-evolve-yellow text-black font-extrabold py-3.5 rounded-2xl"
          >
            Take the challenge
          </button>
        </>
      ) : null}
    </SheetShell>
  );
}
