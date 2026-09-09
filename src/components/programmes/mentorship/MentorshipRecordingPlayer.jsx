// A plain <video src> can't play a Google Drive "view"/"share" link — it's
// an HTML page, not a media file, so the browser just shows nothing. Admins
// pasting a Drive link (the realistic case, per api/…/MentorshipV2Tab.jsx's
// "recording link" field) need it converted to Drive's iframe-embeddable
// /preview form instead.
function driveEmbedUrl(url) {
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (fileMatch) return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
  if (url.includes("drive.google.com")) {
    const idMatch = url.match(/[?&]id=([^&]+)/);
    if (idMatch) return `https://drive.google.com/file/d/${idMatch[1]}/preview`;
  }
  return null;
}

function isDirectVideoFile(url) {
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

/**
 * Renders a session/call recording regardless of what kind of link an
 * admin pasted: a Google Drive share link (embedded via Drive's own
 * /preview iframe), a direct video file URL (<video>), or anything else
 * (Loom, a generic share link) — falls back to an "open recording" link
 * rather than silently showing a blank player.
 */
export default function MentorshipRecordingPlayer({ url }) {
  if (!url) {
    return (
      <div className="aspect-video flex items-center justify-center text-white/30 text-sm px-6 text-center">
        Your recording is being processed — check back soon.
      </div>
    );
  }

  const embedUrl = driveEmbedUrl(url);
  if (embedUrl) {
    return (
      <iframe
        src={embedUrl}
        className="w-full aspect-video bg-black"
        allow="autoplay"
        allowFullScreen
        title="session recording"
      />
    );
  }

  if (isDirectVideoFile(url)) {
    return <video src={url} controls className="w-full aspect-video bg-black" />;
  }

  return (
    <div className="aspect-video bg-black flex flex-col items-center justify-center gap-3">
      <p className="text-white/40 text-sm px-6 text-center">Preview isn't available for this link.</p>
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-evolve-yellow text-sm font-bold underline">
        Open recording ↗
      </a>
    </div>
  );
}
