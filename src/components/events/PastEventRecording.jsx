import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useMembership, MEMBERSHIP_ICONS } from "../membership/MembershipProvider";
import { inr, recordingPrice } from "../../lib/membership";
import YouTubeLockedPlayer from "./YouTubeLockedPlayer";

// Past-event recording, uploaded through the admin Events CMS
// (src/pages/admn/EventsTab.jsx). Locked behind the after-trial rules: open
// during the trial / on a plan / once bought (₹30 default), otherwise
// the thumbnail with a lock and a sticky "Unlock" bar (LockedPlayer).
//
// Anti-piracy, layer by layer:
//   • file sits in a PRIVATE bucket — the DB only hands a short-lived signed
//     URL to someone storage RLS says is entitled (membership_plans.sql)
//   • URL expires after SIGNED_URL_TTL, so a copied link dies quickly
//   • a moving watermark with the viewer's email over the player, so a
//     screen recording is traceable back to the account that made it
//   • download / picture-in-picture / right-click are switched off
//   • a pasted link (YouTube / Bunny / Vimeo) lives in event_recording_links,
//     which RLS only lets entitled viewers read (events_recording_links.sql),
//     and YouTube plays in YouTubeLockedPlayer with no links out to youtube.com
// None of that stops a determined screen recorder — for that, use a DRM
// host (VdoCipher / Bunny Stream DRM), which this component plays through
// an iframe.

const SIGNED_URL_TTL = 60 * 60 * 2; // 2 hours

// Admins paste whatever YouTube gives them (watch?v=, youtu.be/, /live/,
// /shorts/); only the /embed/ form plays inside an iframe. Videos must be
// Unlisted — Private ones refuse to embed. Non-YouTube URLs pass through.
export function youTubeId(url) {
  const m = url?.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|live\/|shorts\/)|youtu\.be\/)([\w-]{11})/
  );
  return m ? m[1] : null;
}

export function toEmbedUrl(url) {
  const id = youTubeId(url);
  return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1` : url;
}

// has_recording_link: set by the admin when a link is saved (the link
// itself isn't on the public row). recording_url: rows saved before
// events_recording_links.sql ran.
export function eventHasRecording(ev) {
  return !!(ev?.recording_path || ev?.has_recording_link || ev?.recording_url);
}

export const PlayIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 ml-0.5">
    <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
  </svg>
);

// our thumbnail + play button over an embedded player, so the page shows the
// session's own artwork (not YouTube's frame grab) and the iframe only loads
// once someone actually presses play
function PosterButton({ src, onPlay }) {
  return (
    <button type="button" onClick={onPlay} className="group absolute inset-0 w-full h-full" aria-label="Play recording">
      <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <span className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors" />
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-[76px] md:h-[76px] rounded-full bg-black/70 backdrop-blur-sm text-white flex items-center justify-center group-hover:scale-105 transition-transform">
        {PlayIcon}
      </span>
    </button>
  );
}

function withAutoplay(url) {
  return url + (url.includes("?") ? "&" : "?") + "autoplay=1";
}

function Watermark({ text }) {
  const [pos, setPos] = useState({ x: 12, y: 14 });
  useEffect(() => {
    const t = setInterval(
      () => setPos({ x: 6 + Math.random() * 60, y: 8 + Math.random() * 70 }),
      7000
    );
    return () => clearInterval(t);
  }, []);
  if (!text) return null;
  return (
    <span
      aria-hidden="true"
      className="absolute pointer-events-none select-none text-[11px] font-semibold text-white/35 transition-all duration-[1500ms] ease-in-out"
      style={{ left: `${pos.x}%`, top: `${pos.y}%`, textShadow: "0 1px 2px rgba(0,0,0,.6)" }}
    >
      {text}
    </span>
  );
}

function Player({ event, user }) {
  const [src, setSrc] = useState(null);
  const [link, setLink] = useState(null);
  const [error, setError] = useState("");
  const thumb = event.recording_thumbnail_url || event.cover_image_url;
  const [started, setStarted] = useState(!thumb);

  useEffect(() => {
    let cancelled = false;
    if (event.recording_path) {
      supabase.storage
        .from("event-recordings")
        .createSignedUrl(event.recording_path, SIGNED_URL_TTL)
        .then(({ data, error: err }) => {
          if (cancelled) return;
          if (err || !data?.signedUrl) setError("Couldn't load the recording. Please refresh.");
          else setSrc(data.signedUrl);
        });
    } else {
      // RLS returns the row only to people entitled to the recording
      supabase
        .from("event_recording_links")
        .select("url")
        .eq("event_id", event.id)
        .maybeSingle()
        .then(({ data }) => {
          if (cancelled) return;
          const url = data?.url || event.recording_url;
          if (url) setLink(url);
          else setError("Couldn't load the recording. Please refresh.");
        });
    }
    return () => {
      cancelled = true;
    };
  }, [event.id, event.recording_path, event.recording_url]);

  const mark = user?.email || user?.username || "";
  const ytId = youTubeId(link);

  if (ytId) {
    return (
      <YouTubeLockedPlayer videoId={ytId} poster={thumb} title={event.title}>
        <Watermark text={mark} />
      </YouTubeLockedPlayer>
    );
  }

  const status = (
    <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">
      {error || "Loading recording…"}
    </div>
  );

  return (
    <div
      className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/10"
      onContextMenu={(e) => e.preventDefault()}
    >
      {event.recording_path ? (
        src ? (
          <video
            src={src}
            controls
            playsInline
            controlsList="nodownload noplaybackrate noremoteplayback"
            disablePictureInPicture
            poster={thumb || undefined}
            className="w-full h-full object-contain bg-black"
          />
        ) : (
          status
        )
      ) : !started ? (
        <PosterButton src={thumb} onPlay={() => setStarted(true)} />
      ) : link ? (
        <iframe
          src={thumb ? withAutoplay(link) : link}
          title={event.title}
          className="w-full h-full"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
        />
      ) : (
        status
      )}
      <Watermark text={mark} />
    </div>
  );
}

// The app's mobile tab bar (AppTabNav) is fixed to the bottom too; the unlock
// bar sits just above it so neither covers the other.
function useTabBarHeight() {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const nav = document.querySelector("[data-app-tabnav]");
    if (!nav) return;
    const measure = () =>
      setHeight(getComputedStyle(nav).display === "none" ? 0 : nav.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(nav);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);
  return height;
}

// Locked recording: the session's thumbnail stays as-is with a lock in place
// of the play button, and the unlock CTA lives in a bar stuck to the bottom
// of the screen.
function LockedPlayer({ thumb, price, signedIn, onUnlock }) {
  const tabBar = useTabBarHeight();
  const cta = signedIn ? `Unlock for ${inr(price)}` : "Sign in to watch";

  // keeps the page's last content clear of the fixed bar
  useEffect(() => {
    const prev = document.body.style.paddingBottom;
    document.body.style.paddingBottom = "6rem";
    return () => {
      document.body.style.paddingBottom = prev;
    };
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={onUnlock}
        className="group relative block w-full aspect-video rounded-2xl overflow-hidden border border-white/10 bg-[#19191b]"
        aria-label={cta}
      >
        {thumb && <img src={thumb} alt="" className="absolute inset-0 w-full h-full object-cover" />}
        <span className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-[76px] md:h-[76px] rounded-full bg-black/70 backdrop-blur-sm text-white flex items-center justify-center group-hover:scale-105 transition-transform [&>svg]:w-6 [&>svg]:h-6 md:[&>svg]:w-7 md:[&>svg]:h-7">
          {MEMBERSHIP_ICONS.lock}
        </span>
      </button>

      <div
        className="fixed inset-x-0 z-[45] border-t border-white/10 bg-[#161618]/95 backdrop-blur-md"
        style={{ bottom: tabBar }}
      >
        <div className="max-w-5xl mx-auto px-5 md:px-8 py-3 md:py-4 flex items-center gap-4">
          <span className="hidden sm:flex w-10 h-10 flex-none rounded-full bg-evolve-pink/15 text-evolve-pink items-center justify-center [&>svg]:w-5 [&>svg]:h-5">
            {MEMBERSHIP_ICONS.lock}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-white font-bold text-sm md:text-base leading-tight">Watch this session</p>
            <p className="text-white/50 text-xs md:text-sm leading-tight mt-0.5">
              {signedIn ? "Unlock the full recording, yours to rewatch anytime" : "Sign in to unlock the full recording"}
            </p>
          </div>
          <button
            type="button"
            onClick={onUnlock}
            className="flex-none rounded-xl bg-evolve-yellow text-evolve-black font-extrabold text-sm md:text-base px-4 md:px-6 py-2.5 md:py-3 transition-transform active:scale-95 hover:brightness-105"
          >
            {cta}
          </button>
        </div>
      </div>
    </>
  );
}

// `bare` drops the small "recording" label and length line, for layouts
// that already show them (EventDetail.jsx → PastEventView)
export default function PastEventRecording({ event, user, ownedRecording, onPurchased, onSignIn, bare = false }) {
  const { access, pay } = useMembership();
  if (!eventHasRecording(event)) return null;

  const price = recordingPrice(event);
  const open = !!user && (access.full || price === 0 || ownedRecording);
  const thumb = event.recording_thumbnail_url || event.cover_image_url;

  return (
    <div className="flex flex-col gap-3">
      {!bare && <p className="text-[10px] font-black uppercase tracking-wide text-white/40">recording</p>}

      {open ? (
        <Player event={event} user={user} />
      ) : (
        <LockedPlayer
          thumb={thumb}
          price={price}
          signedIn={!!user}
          onUnlock={
            user
              ? () =>
                  pay(
                    {
                      kind: "recording",
                      event_id: event.id,
                      title: event.title,
                      sub: "Past session",
                      price
                    },
                    onPurchased
                  )
              : onSignIn
          }
        />
      )}

      {!bare && event.recording_duration_min ? (
        <p className="text-white/40 text-xs">{event.recording_duration_min} min recording</p>
      ) : null}
    </div>
  );
}

export function EventGuests({ guests }) {
  const list = (guests || []).filter((g) => g?.name);
  if (!list.length) return null;
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-wide text-white/40 mb-3">guests</p>
      <div className="flex flex-col gap-3">
        {list.map((g, i) => (
          <div key={i} className="flex items-center gap-3">
            {g.photo_url ? (
              <img src={g.photo_url} alt={g.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
            ) : (
              <span className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold flex-shrink-0">
                {g.name[0].toUpperCase()}
              </span>
            )}
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">{g.name}</p>
              {g.title && <p className="text-white/50 text-xs truncate">{g.title}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
