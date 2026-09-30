import { useEffect, useMemo, useRef, useState } from "react";
import { SheetShell } from "./Sheets";
import { renderWorkCard } from "./lib/shareCard";

// Typetober channel on the Evolve Discord server.
const DISCORD_INVITE = "https://discord.gg/HpDcGubnYW";

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** Clipboard API first; falls back to a hidden textarea + execCommand (http, older Safari). */
async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

const ICONS = {
  whatsapp: (
    <path d="M4 20l1.3-4.2A8 8 0 1 1 8.3 18.8zM9.2 8.8c.3 3 2.7 5.4 5.8 6l1.1-1.3-1.9-.9-.8.6a4.3 4.3 0 0 1-2.2-2.2l.6-.8-.9-1.9z" />
  ),
  instagram: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="5" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="16.8" cy="7.2" r=".6" />
    </>
  ),
  linkedin: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M8 11v5M8 8v.01M12 16v-5M12 13a2 2 0 0 1 4 0v3" />
    </>
  ),
  x: <path d="M5 5l14 14M19 5L5 19" />,
  facebook: (
    <path d="M14 8h2V5h-2a3 3 0 0 0-3 3v2H9v3h2v6h3v-6h2l.5-3H14V8.5a.5.5 0 0 1 .5-.5z" />
  ),
  telegram: (
    <path d="M20.5 4L3.5 10.8l5.3 2 2 5.7 2.8-3.6 4.5 3.3zM8.8 12.8L20.5 4" />
  ),
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V6a2 2 0 0 1 2-2h9" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  save: <path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19h14" />,
  share: (
    <>
      <circle cx="18" cy="5" r="2.6" />
      <circle cx="6" cy="12" r="2.6" />
      <circle cx="18" cy="19" r="2.6" />
      <path d="M8.3 10.8l7.4-4.4M8.3 13.2l7.4 4.4" />
    </>
  )
};

function Icon({ name, size = 22 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

export default function ShareSheet({
  open,
  onClose,
  letter,
  dayNumber,
  name,
  imageUrl,
  sharePath,
  accent
}) {
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(""); // "link" | "caption" | ""
  const [note, setNote] = useState("");
  const copiedTimer = useRef(null);

  // Each submission gets its own link, e.g. /typetober/arnab/a (or a-2 for a
  // second A); opening it shows that illustration in a modal. See the
  // shared-link handler in Typetober.jsx.
  const shareUrl = useMemo(
    () => `${window.location.origin}${sharePath || "/typetober"}`,
    [sharePath]
  );
  const displayUrl = shareUrl.replace(/^https?:\/\/(www\.)?/, "");

  useEffect(() => {
    if (!open) return;
    setCaption(
      `My ${letter} for Typetober is up! ✍️\nDay ${dayNumber} of 26 alphabets, 1 month, with Evolve. See it and make yours:\n${shareUrl}\n#Typetober #Evolve`
    );
  }, [open, letter, dayNumber, shareUrl]);

  useEffect(() => () => clearTimeout(copiedTimer.current), []);

  async function copy(kind, text) {
    const ok = await copyText(text);
    if (ok) {
      setCopied(kind);
      clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(""), 2000);
    } else {
      setNote("Couldn't copy automatically. Select the text and copy it.");
    }
    return ok;
  }

  async function makeCard() {
    setBusy(true);
    try {
      return await renderWorkCard({
        letter,
        dayNumber,
        name,
        imageUrl,
        accent
      });
    } finally {
      setBusy(false);
    }
  }

  const fileName = `typetober-${letter.toLowerCase()}.png`;

  async function saveImage() {
    try {
      downloadBlob(await makeCard(), fileName);
    } catch {
      setNote("Couldn't make the image. Try again.");
    }
  }

  async function nativeShare() {
    try {
      const blob = await makeCard();
      const file = new File([blob], fileName, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Typetober",
          text: caption
        });
        return;
      }
      if (navigator.share) {
        await navigator.share({
          title: "Typetober",
          text: caption,
          url: shareUrl
        });
        return;
      }
      downloadBlob(blob, fileName);
      setNote("Image saved. Add it to your post along with the caption.");
    } catch (e) {
      if (e?.name !== "AbortError")
        setNote(
          "Sharing didn't work here. Save the image and copy the link instead."
        );
    }
  }

  const encoded = encodeURIComponent(caption);
  const encodedUrl = encodeURIComponent(shareUrl);

  const apps = [
    ["whatsapp", "WhatsApp", `https://wa.me/?text=${encoded}`],
    [
      "linkedin",
      "LinkedIn",
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    ],
    ["x", "X", `https://twitter.com/intent/tweet?text=${encoded}`],
    [
      "facebook",
      "Facebook",
      `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encoded}`
    ],
    [
      "telegram",
      "Telegram",
      `https://t.me/share/url?url=${encodedUrl}&text=${encoded}`
    ]
  ];

  const appClass =
    "group flex flex-col items-center gap-2 text-[13px] font-bold text-white";
  const appDot =
    "w-12 h-12 rounded-full bg-white/10 border border-white/15 grid place-items-center group-hover:bg-evolve-pink group-hover:border-evolve-pink transition-colors";

  return (
    <SheetShell open={open} onClose={onClose}>
      <h2 className="text-[26px] font-extrabold mr-8">Share your {letter}</h2>

      <div className="flex gap-3 mt-4">
        <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-white/5 flex-none">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={letter}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </div>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={5}
          aria-label="Caption"
          className="tt-sheet-scroll flex-1 min-w-0 rounded-xl bg-white/5 border border-white/15 text-white text-[14px] leading-[19px] p-3 resize-none focus:outline-none focus:border-evolve-yellow"
        />
      </div>

      <div className="text-[12px] font-bold tracking-wide text-white/40 mt-5 mb-2">
        YOUR LINK
      </div>
      <div className="flex gap-2">
        <input
          readOnly
          value={displayUrl}
          onFocus={(e) => e.target.select()}
          aria-label="Share link"
          className="flex-1 min-w-0 rounded-xl bg-white/5 border border-white/15 text-white/80 text-[14px] px-3 py-3 focus:outline-none focus:border-evolve-yellow"
        />
        <button
          onClick={() => copy("link", shareUrl)}
          className={`flex-none flex items-center gap-2 px-4 rounded-xl font-extrabold text-[14px] transition-colors ${
            copied === "link"
              ? "bg-evolve-inchworm text-black"
              : "bg-evolve-yellow text-black"
          }`}
          aria-live="polite"
        >
          <Icon name={copied === "link" ? "check" : "copy"} size={18} />
          {copied === "link" ? "Copied" : "Copy link"}
        </button>
      </div>
      <div className="flex items-center gap-3 mt-5 p-4 rounded-2xl bg-[#5865F2]/15 border border-[#5865F2]/40">
        <div className="w-11 h-11 rounded-full bg-[#5865F2] grid place-items-center flex-none text-white">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M19.3 5.3A17 17 0 0 0 15.1 4l-.5 1.1a15.6 15.6 0 0 0-5.2 0L8.9 4a17 17 0 0 0-4.2 1.3C2.1 9.2 1.4 13 1.7 16.7a17 17 0 0 0 5.2 2.6l1.1-1.8a11 11 0 0 1-1.7-.8l.4-.3a12 12 0 0 0 10.2 0l.4.3c-.5.3-1.1.6-1.7.8l1.1 1.8a17 17 0 0 0 5.2-2.6c.4-4.3-.7-8-2.8-11.4zM8.7 14.5c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2zm6.6 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <b className="block text-[15px]">Share it on our Discord</b>
          <span className="block text-white/55 text-[13px] leading-snug">
            Post your {letter} in the Typetober channel and see what others
            made.
          </span>
        </div>
        <a
          href={DISCORD_INVITE}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => copyText(caption)}
          className="flex-none px-4 py-2.5 rounded-full bg-evolve-yellow text-black font-extrabold text-[14px]"
        >
          Join
        </a>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        <button
          onClick={nativeShare}
          disabled={busy}
          className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-[13px] disabled:opacity-50"
        >
          <Icon name="share" />
          {busy ? "Making…" : "Share"}
        </button>
        <button
          onClick={saveImage}
          disabled={busy}
          className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-[13px] disabled:opacity-50"
        >
          <Icon name="save" />
          Save image
        </button>
        <button
          onClick={() => copy("caption", caption)}
          className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-[13px]"
        >
          <Icon name={copied === "caption" ? "check" : "copy"} />
          {copied === "caption" ? "Copied" : "Copy caption"}
        </button>
      </div>

      <div className="text-[12px] font-bold tracking-wide text-white/40 mt-5 mb-3">
        POST TO
      </div>
      <div className="grid grid-cols-3 gap-y-4 gap-x-2">
        {apps.map(([icon, label, href]) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => copyText(caption)}
            className={appClass}
          >
            <span className={appDot}>
              <Icon name={icon} />
            </span>
            {label}
          </a>
        ))}
        {/* Instagram has no web share URL: copy the caption and save the image to post from the app. */}
        <button
          onClick={async () => {
            await copy("caption", caption);
            await saveImage();
            setNote(
              "Caption copied and image saved. Open Instagram to post it."
            );
          }}
          className={appClass}
        >
          <span className={appDot}>
            <Icon name="instagram" />
          </span>
          Instagram
        </button>
      </div>

      {note && (
        <p className="text-evolve-yellow text-[13px] mt-4 leading-snug">
          {note}
        </p>
      )}

      <p className="text-white/30 text-[12px] mt-4 leading-snug">
        Websites can't attach an image directly, so save the image first and add
        it to your post. The caption is copied when you tap an app.
      </p>
    </SheetShell>
  );
}
