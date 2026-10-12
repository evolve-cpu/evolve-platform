import { useEffect, useMemo, useState } from "react";
import { callAdminApi } from "../../supabaseAdminClient";

// The app's Community tab: recent posts from the Evolve Discord channels
// chosen on the server (DISCORD_COMMUNITY_CHANNEL_IDS). Posts are synced and
// stored by api/_discordCommunity.js; this only reads them. Read-only by
// design: replying happens on Discord, one tap away on every post.

const DISCORD_INVITE = "https://discord.gg/MmfaqCPdF7";

function DiscordGlyph({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.3 5.3A17 17 0 0 0 15.1 4l-.5 1.1a15.6 15.6 0 0 0-5.2 0L8.9 4a17 17 0 0 0-4.2 1.3C2.1 9.2 1.4 13 1.7 16.7a17 17 0 0 0 5.2 2.6l1.1-1.8a11 11 0 0 1-1.7-.8l.4-.3a12 12 0 0 0 10.2 0l.4.3c-.5.3-1.1.6-1.7.8l1.1 1.8a17 17 0 0 0 5.2-2.6c.4-4.3-.7-8-2.8-11.4zM8.7 14.5c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2zm6.6 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2z" />
    </svg>
  );
}

function timeAgo(iso) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 7 * 86400) return `${Math.floor(s / 86400)}d`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// Discord's light markdown (links, **bold**, *italic*, __underline__,
// `code`) as React elements — never raw HTML
const INLINE = /(https?:\/\/[^\s<]+[^\s<.,:;"')\]])|\*\*([^*]+)\*\*|__([^_]+)__|`([^`]+)`|\*([^*\s][^*]*)\*|_([^_\s][^_]*)_/g;

function Inline({ text }) {
  const out = [];
  let last = 0;
  let k = 0;
  for (const m of text.matchAll(INLINE)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const [, url, bold, underline, code, italic, italic2] = m;
    if (url)
      out.push(
        <a key={k++} href={url} target="_blank" rel="noopener noreferrer" className="text-evolve-yellow underline underline-offset-2 break-all">
          {url.replace(/^https?:\/\/(www\.)?/, "")}
        </a>
      );
    else if (bold) out.push(<strong key={k++} className="font-bold text-white">{bold}</strong>);
    else if (underline) out.push(<u key={k++}>{underline}</u>);
    else if (code) out.push(<code key={k++} className="px-1 py-0.5 rounded bg-white/10 text-[13px]">{code}</code>);
    else out.push(<em key={k++}>{italic || italic2}</em>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function PostBody({ content }) {
  const lines = content.replace(/\n{3,}/g, "\n\n").split("\n");
  return (
    <div className="text-[14.5px] leading-[1.6] text-white/80 break-words">
      {lines.map((line, i) => {
        const heading = line.match(/^#{1,3}\s+(.*)/);
        const quote = line.match(/^>\s?(.*)/);
        const bullet = line.match(/^\s*[-*]\s+(.*)/);
        if (heading) return <p key={i} className="font-extrabold text-white text-[15.5px] mt-1"><Inline text={heading[1]} /></p>;
        if (quote) return <p key={i} className="border-l-2 border-white/20 pl-3 text-white/60"><Inline text={quote[1]} /></p>;
        if (bullet) return <p key={i} className="pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-white/40"><Inline text={bullet[1]} /></p>;
        return line.trim() ? <p key={i}><Inline text={line} /></p> : <div key={i} className="h-2" />;
      })}
    </div>
  );
}

function PostImages({ images }) {
  if (!images.length) return null;
  const single = images.length === 1;
  return (
    <div className={`mt-3 grid gap-1.5 ${single ? "grid-cols-1" : "grid-cols-2"}`}>
      {images.slice(0, 4).map((img) => (
        <a key={img.url} href={img.url} target="_blank" rel="noopener noreferrer" className="block rounded-xl overflow-hidden bg-white/5">
          <img
            src={img.url}
            alt={img.name || ""}
            loading="lazy"
            className={`w-full object-cover ${single ? "max-h-[420px]" : "aspect-square"}`}
            style={single && img.width && img.height ? { aspectRatio: `${img.width} / ${img.height}` } : undefined}
          />
        </a>
      ))}
    </div>
  );
}

function Post({ post, showChannel }) {
  const images = (post.attachments || []).filter((a) => a.kind === "image");
  const files = (post.attachments || []).filter((a) => a.kind === "file");
  return (
    <article className="py-5 border-b border-white/[0.07] last:border-b-0">
      <header className="flex items-center gap-3">
        {post.author_avatar_url ? (
          <img src={post.author_avatar_url} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
        ) : (
          <span className="w-9 h-9 rounded-full bg-white/10 flex-shrink-0" />
        )}
        <div className="min-w-0">
          <p className="text-[14px] font-bold text-white truncate">{post.author_name}</p>
          <p className="text-[12px] text-white/40 truncate">
            {showChannel && post.channel_name ? `#${post.channel_name} · ` : ""}
            {timeAgo(post.posted_at)}
          </p>
        </div>
      </header>

      <div className="mt-3 pl-12">
        {post.content && <PostBody content={post.content} />}
        <PostImages images={images} />
        {files.map((f) => (
          <p key={f.name} className="mt-2 text-[13px] text-white/50">
            Attachment: {f.name}
          </p>
        ))}

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {(post.reactions || []).map((r) => (
            <span key={r.emoji} className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] border border-white/10 px-2 py-0.5 text-[12px] text-white/70">
              <span>{r.emoji}</span>
              {r.count}
            </span>
          ))}
          <a
            href={post.jump_url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-[12.5px] font-semibold text-white/50 hover:text-evolve-yellow"
          >
            Reply on Discord →
          </a>
        </div>
      </div>
    </article>
  );
}

export default function CommunityFeed() {
  const [state, setState] = useState({ loading: true, posts: [], error: "" });
  const [channel, setChannel] = useState("all");

  async function load() {
    setState((s) => ({ ...s, loading: true, error: "" }));
    const res = await callAdminApi({ op: "community_feed" });
    if (res.error) setState({ loading: false, posts: [], error: res.error.message || "error" });
    else setState({ loading: false, posts: res.posts || [], error: "" });
  }

  useEffect(() => {
    load();
  }, []);

  const channels = useMemo(() => {
    const seen = new Map();
    for (const p of state.posts) if (!seen.has(p.channel_id)) seen.set(p.channel_id, p.channel_name);
    return [...seen.entries()];
  }, [state.posts]);

  const shown = channel === "all" ? state.posts : state.posts.filter((p) => p.channel_id === channel);

  return (
    <div className="w-full max-w-2xl mx-auto pb-24">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-white font-extrabold text-2xl">Community</h2>
          <p className="text-white/45 text-sm mt-1">What's happening on the Evolve Discord</p>
        </div>
        <a
          href={DISCORD_INVITE}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 inline-flex items-center gap-2 rounded-full bg-evolve-yellow text-evolve-black font-extrabold text-[13.5px] px-4 py-2.5"
        >
          <DiscordGlyph className="w-4 h-4" />
          Join
        </a>
      </div>

      {channels.length > 1 && (
        <div className="mt-5 flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
          {[["all", "All"], ...channels.map(([id, name]) => [id, `#${name}`])].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setChannel(id)}
              className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold border transition-colors ${
                channel === id
                  ? "bg-white text-evolve-black border-white"
                  : "border-white/15 text-white/65 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="mt-2">
        {state.loading && !state.posts.length ? (
          <div className="flex flex-col gap-5 py-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <span className="w-9 h-9 rounded-full bg-white/10" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3 w-1/3 rounded bg-white/10" />
                  <div className="h-3 w-5/6 rounded bg-white/[0.07]" />
                  <div className="h-3 w-2/3 rounded bg-white/[0.07]" />
                </div>
              </div>
            ))}
          </div>
        ) : state.error ? (
          <div className="py-16 text-center">
            <p className="text-white font-bold">Couldn't load the community feed</p>
            <button type="button" onClick={load} className="mt-3 text-evolve-yellow text-sm font-semibold hover:underline">
              Try again
            </button>
          </div>
        ) : shown.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-white font-bold">Nothing posted yet</p>
            <p className="text-white/45 text-sm mt-1">Join the Discord and start the conversation.</p>
          </div>
        ) : (
          shown.map((p) => <Post key={p.id} post={p} showChannel={channels.length > 1 && channel === "all"} />)
        )}
      </div>
    </div>
  );
}
