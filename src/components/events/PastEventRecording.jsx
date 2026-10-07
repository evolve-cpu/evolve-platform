import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useMembership, MEMBERSHIP_ICONS } from "../membership/MembershipProvider";
import { inr, recordingPrice } from "../../lib/membership";

// Past-event recording, uploaded through the admin Events CMS
// (src/pages/admn/EventsTab.jsx). Locked behind the after-trial rules: open
// during the trial / on a plan / once bought (₹30 default), otherwise a
// blurred thumbnail with the reference's "Unlock this session" card.
//
// Anti-piracy, layer by layer:
//   • file sits in a PRIVATE bucket — the DB only hands a short-lived signed
//     URL to someone storage RLS says is entitled (membership_plans.sql)
//   • URL expires after SIGNED_URL_TTL, so a copied link dies quickly
//   • a moving watermark with the viewer's email over the player, so a
//     screen recording is traceable back to the account that made it
//   • download / picture-in-picture / right-click are switched off
// None of that stops a determined screen recorder — for that, swap
// recording_url to a DRM host (VdoCipher / Bunny Stream DRM), which this
// component already plays through an iframe.

const SIGNED_URL_TTL = 60 * 60 * 2; // 2 hours

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
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (!event.recording_path) return;
    supabase.storage
      .from("event-recordings")
      .createSignedUrl(event.recording_path, SIGNED_URL_TTL)
      .then(({ data, error: err }) => {
        if (cancelled) return;
        if (err || !data?.signedUrl) setError("Couldn't load the recording. Please refresh.");
        else setSrc(data.signedUrl);
      });
    return () => {
      cancelled = true;
    };
  }, [event.recording_path]);

  const mark = user?.email || user?.username || "";

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
            poster={event.recording_thumbnail_url || event.cover_image_url || undefined}
            className="w-full h-full object-contain bg-black"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">
            {error || "Loading recording…"}
          </div>
        )
      ) : (
        <iframe
          src={event.recording_url}
          title={event.title}
          className="w-full h-full"
          allow="encrypted-media; fullscreen"
          allowFullScreen
        />
      )}
      <Watermark text={mark} />
    </div>
  );
}

export default function PastEventRecording({ event, user, ownedRecording, onPurchased, onSignIn }) {
  const { access, pay } = useMembership();
  if (!event.recording_path && !event.recording_url) return null;

  const price = recordingPrice(event);
  const open = !!user && (access.full || price === 0 || ownedRecording);
  const thumb = event.recording_thumbnail_url || event.cover_image_url;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[10px] font-black uppercase tracking-wide text-white/40">recording</p>

      {open ? (
        <Player event={event} user={user} />
      ) : (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 bg-[#19191b]">
          {thumb && (
            <img src={thumb} alt="" className="absolute inset-0 w-full h-full object-cover blur-[8px] scale-110 opacity-60" />
          )}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="at-pastlock-card w-full max-w-[320px]">
              <div className="lk">{MEMBERSHIP_ICONS.lock}</div>
              <div className="t">Unlock this session</div>
              <div className="s">Watch the full recording anytime</div>
              {user ? (
                <button
                  type="button"
                  onClick={() =>
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
                  }
                >
                  Unlock for {inr(price)}
                </button>
              ) : (
                <button type="button" onClick={onSignIn}>
                  Sign in to watch
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {event.recording_duration_min ? (
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
