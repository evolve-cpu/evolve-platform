import { useEffect, useRef, useState } from "react";

// YouTube recording with our own controls. YouTube's player chrome (title,
// logo, "Watch on YouTube", share, right-click "copy video URL", end-screen
// suggestions) all link out to youtube.com, where an Unlisted video can be
// opened in any browser. So: the iframe runs with controls=0, a transparent
// layer sits over it and takes every click / right-click, and the controls
// below drive it through the IFrame API. Because the iframe never sees the
// mouse, its hover chrome never appears; while paused or ended our poster
// covers it.
//
// This hides the way out for normal viewers. Someone entitled who opens
// devtools can still find the video id, which only a DRM host prevents.

let apiPromise;
function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        resolve(window.YT);
      };
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(s);
    });
  }
  return apiPromise;
}

function fmtTime(sec) {
  const t = Math.max(0, Math.floor(sec || 0));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = String(t % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

const RATES = [1, 1.25, 1.5, 2];

const Icon = {
  play: <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" fill="currentColor" />,
  pause: (
    <>
      <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
      <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
    </>
  ),
  volume: (
    <>
      <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
      <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    </>
  ),
  muted: (
    <>
      <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
      <path d="M16.5 9.5l5 5M21.5 9.5l-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  fullscreen: (
    <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  )
};

function Svg({ children, className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {children}
    </svg>
  );
}

export default function YouTubeLockedPlayer({ videoId, poster, title, children }) {
  const wrapRef = useRef(null);
  const mountRef = useRef(null);
  const playerRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [ready, setReady] = useState(false);
  const [state, setState] = useState(-1); // YT.PlayerState
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef(null);

  const playing = state === 1 || state === 3; // playing / buffering
  const canFullscreen = typeof document !== "undefined" && !!document.fullscreenEnabled;

  // create the player only once someone presses play
  useEffect(() => {
    if (!started || !videoId) return;
    let cancelled = false;
    loadYouTubeApi().then((YT) => {
      if (cancelled || !mountRef.current) return;
      playerRef.current = new YT.Player(mountRef.current, {
        videoId,
        host: "https://www.youtube-nocookie.com",
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          iv_load_policy: 3,
          playsinline: 1,
          modestbranding: 1
        },
        events: {
          onReady: (e) => {
            if (cancelled) return;
            setReady(true);
            setDuration(e.target.getDuration());
            e.target.playVideo();
          },
          onStateChange: (e) => !cancelled && setState(e.data)
        }
      });
    });
    return () => {
      cancelled = true;
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
  }, [started, videoId]);

  // progress while playing
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      const p = playerRef.current;
      if (!p?.getCurrentTime) return;
      setTime(p.getCurrentTime());
      if (!duration) setDuration(p.getDuration());
    }, 250);
    return () => clearInterval(t);
  }, [playing, duration]);

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  function poke() {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 2500);
  }

  function togglePlay() {
    const p = playerRef.current;
    if (!p) return;
    if (playing) p.pauseVideo();
    else p.playVideo();
    poke();
  }

  function seek(sec) {
    playerRef.current?.seekTo(sec, true);
    setTime(sec);
    poke();
  }

  function toggleMute() {
    const p = playerRef.current;
    if (!p) return;
    if (muted) p.unMute();
    else p.mute();
    setMuted(!muted);
  }

  function cycleRate() {
    const next = RATES[(RATES.indexOf(rate) + 1) % RATES.length];
    playerRef.current?.setPlaybackRate(next);
    setRate(next);
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else wrapRef.current?.requestFullscreen?.();
  }

  // paused (not just started) or ended → our poster hides YouTube's
  // pause/end screens, which carry links out
  const coverWithPoster = !started || (ready && (state === 2 || state === 0));
  const pct = duration ? (time / duration) * 100 : 0;

  return (
    <div
      ref={wrapRef}
      className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 select-none"
      onContextMenu={(e) => e.preventDefault()}
      onMouseMove={started ? poke : undefined}
    >
      {started && (
        <div className="absolute inset-0 pointer-events-none">
          <div ref={mountRef} className="w-full h-full" />
        </div>
      )}

      {/* click shield — every click lands here, never on YouTube */}
      {started && <div className="absolute inset-0" onClick={togglePlay} />}

      {coverWithPoster && (
        <button
          type="button"
          onClick={() => (started ? togglePlay() : setStarted(true))}
          className="group absolute inset-0 w-full h-full"
          aria-label={state === 0 ? "Replay" : "Play recording"}
        >
          {poster ? (
            <img src={poster} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <span className="absolute inset-0 bg-[#19191b]" />
          )}
          <span className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-[76px] md:h-[76px] rounded-full bg-black/70 backdrop-blur-sm text-white flex items-center justify-center group-hover:scale-105 transition-transform">
            <Svg className="w-6 h-6 ml-0.5">{Icon.play}</Svg>
          </span>
        </button>
      )}

      {started && !ready && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        </div>
      )}

      {/* watermark etc. from the caller */}
      {children}

      {started && ready && (
        <div
          className={`absolute inset-x-0 bottom-0 px-3 md:px-4 pb-2.5 pt-10 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${
            showControls || !playing ? "opacity-100" : "opacity-0"
          }`}
        >
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={1}
            value={Math.min(time, duration || 0)}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label="Seek"
            className="w-full h-1 cursor-pointer accent-evolve-yellow"
            style={{
              background: `linear-gradient(to right, #FFD007 ${pct}%, rgba(255,255,255,0.25) ${pct}%)`
            }}
          />
          <div className="mt-2 flex items-center gap-3 text-white">
            <button type="button" onClick={togglePlay} aria-label={playing ? "Pause" : "Play"} className="hover:text-evolve-yellow">
              <Svg>{playing ? Icon.pause : Icon.play}</Svg>
            </button>
            <button type="button" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"} className="hover:text-evolve-yellow">
              <Svg>{muted ? Icon.muted : Icon.volume}</Svg>
            </button>
            <span className="text-xs tabular-nums text-white/80">
              {fmtTime(time)} / {fmtTime(duration)}
            </span>
            <span className="flex-1" />
            <button
              type="button"
              onClick={cycleRate}
              aria-label="Playback speed"
              className="text-xs font-bold tabular-nums px-2 py-0.5 rounded border border-white/25 hover:border-evolve-yellow hover:text-evolve-yellow"
            >
              {rate}x
            </button>
            {canFullscreen && (
              <button type="button" onClick={toggleFullscreen} aria-label="Fullscreen" className="hover:text-evolve-yellow">
                <Svg>{Icon.fullscreen}</Svg>
              </button>
            )}
          </div>
        </div>
      )}
      <span className="sr-only">{title}</span>
    </div>
  );
}
