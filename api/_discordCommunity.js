// api/_discordCommunity.js
// The app's Community tab: a read-only feed of chosen Discord channels.
//
//   DISCORD_BOT_TOKEN               bot token (server only, never VITE_)
//   DISCORD_COMMUNITY_CHANNEL_IDS   comma-separated channel ids to show
//
// No cron (Vercel Hobby only runs crons daily): api/admin.js op
// "community_feed" calls syncIfStale() first, which pulls the latest
// messages at most once every SYNC_EVERY_MS, whoever opens the tab. The one
// request that claims the community_sync_state row does the pull.
//
// Discord attachment URLs are signed and expire after about a day, so
// images are copied into the public "community-media" bucket. Avatars are
// not signed and are linked directly. Messages deleted on Discord drop out
// of the feed on the next sync. Underscore prefix = not its own function.

const API = "https://discord.com/api/v10";
const SYNC_EVERY_MS = 2 * 60 * 1000;
// a sync that dies mid-way (Vercel can stop a function once it has
// answered) frees the slot after this long, so the next viewer retries
const LEASE_MS = 60 * 1000;
const PER_CHANNEL = 50;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const BUCKET = "community-media";

function config() {
  const token = process.env.DISCORD_BOT_TOKEN;
  const channels = (process.env.DISCORD_COMMUNITY_CHANNEL_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return { token, channels };
}

async function discord(token, path) {
  const res = await fetch(`${API}${path}`, { headers: { Authorization: `Bot ${token}` } });
  if (!res.ok) throw new Error(`discord ${res.status} on ${path}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

const avatarUrl = (u) =>
  u.avatar
    ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${u.avatar.startsWith("a_") ? "gif" : "png"}?size=96`
    : `https://cdn.discordapp.com/embed/avatars/${Number((BigInt(u.id) >> 22n) % 6n)}.png`;

// Discord's raw mention syntax → readable text, resolved at sync time
function cleanContent(msg, channelNames) {
  const users = Object.fromEntries((msg.mentions || []).map((u) => [u.id, u.global_name || u.username]));
  return (msg.content || "")
    .replace(/<@!?(\d+)>/g, (_, id) => `@${users[id] || "member"}`)
    .replace(/<@&\d+>/g, "@role")
    .replace(/<#(\d+)>/g, (_, id) => `#${channelNames[id] || "channel"}`)
    .replace(/<a?:(\w+):\d+>/g, ":$1:")
    .replace(/<t:(\d+)(?::\w)?>/g, (_, s) => new Date(Number(s) * 1000).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));
}

async function copyImage(db, messageId, att) {
  if (!att.content_type?.startsWith("image/") || att.size > MAX_IMAGE_BYTES) return null;
  const res = await fetch(att.url);
  if (!res.ok) return null;
  const path = `${messageId}/${att.id}-${att.filename.replace(/[^\w.-]/g, "_")}`;
  const { error } = await db.storage
    .from(BUCKET)
    .upload(path, Buffer.from(await res.arrayBuffer()), { contentType: att.content_type, upsert: true });
  if (error) return null;
  return db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

async function toRow(db, msg, channel, existing) {
  // unchanged since the last sync → keep the images already copied
  const same = existing && existing.edited_at === (msg.edited_timestamp || null);
  const attachments = same
    ? existing.attachments
    : (
        await Promise.all(
          (msg.attachments || []).map(async (a) => {
            const url = await copyImage(db, msg.id, a);
            return url
              ? { kind: "image", url, width: a.width || null, height: a.height || null, name: a.filename }
              : { kind: "file", name: a.filename };
          })
        )
      ).filter(Boolean);
  return {
    id: msg.id,
    channel_id: channel.id,
    channel_name: channel.name,
    author_name: msg.author.global_name || msg.author.username,
    author_avatar_url: avatarUrl(msg.author),
    content: cleanContent(msg, channel.names),
    attachments,
    reactions: (msg.reactions || [])
      .filter((r) => !r.emoji.id) // unicode emoji only; custom ones need Discord's CDN
      .map((r) => ({ emoji: r.emoji.name, count: r.count }))
      .slice(0, 6),
    jump_url: `https://discord.com/channels/${channel.guild_id}/${channel.id}/${msg.id}`,
    posted_at: msg.timestamp,
    edited_at: msg.edited_timestamp || null,
    synced_at: new Date().toISOString()
  };
}

// A forwarded message keeps its text and files in message_snapshots, not
// on the message itself — lift them up so it isn't skipped as empty.
function normalize(m) {
  const snap = m.message_snapshots?.[0]?.message;
  if (!snap || m.content || m.attachments?.length) return m;
  return { ...m, content: snap.content || "", attachments: snap.attachments || [], mentions: snap.mentions || [] };
}

export async function syncChannels(db) {
  const { token, channels } = config();
  if (!token || !channels.length) throw new Error("DISCORD_BOT_TOKEN / DISCORD_COMMUNITY_CHANNEL_IDS not set");

  const infos = await Promise.all(channels.map((id) => discord(token, `/channels/${id}`)));
  const names = Object.fromEntries(infos.map((c) => [c.id, c.name]));

  for (const info of infos) {
    const channel = { id: info.id, name: info.name, guild_id: info.guild_id, names };
    const msgs = (await discord(token, `/channels/${info.id}/messages?limit=${PER_CHANNEL}`))
      .map(normalize)
      .filter(
        // ordinary posts and replies; skip joins, pins and other system lines
        (m) => (m.type === 0 || m.type === 19) && !m.author?.bot && (m.content || m.attachments?.length)
      );

    const ids = msgs.map((m) => m.id);
    const { data: existingRows } = ids.length
      ? await db.from("community_posts").select("id, edited_at, attachments").in("id", ids)
      : { data: [] };
    const existing = Object.fromEntries((existingRows || []).map((r) => [r.id, r]));

    // newest first, saved 5 at a time, so a sync that gets cut off still
    // lands the latest posts
    for (let i = 0; i < msgs.length; i += 5) {
      const rows = await Promise.all(msgs.slice(i, i + 5).map((m) => toRow(db, m, channel, existing[m.id])));
      const { error } = await db.from("community_posts").upsert(rows, { onConflict: "id" });
      if (error) throw new Error(error.message);
    }

    // anything in this window that's no longer on Discord was deleted there
    if (msgs.length) {
      const oldest = msgs[msgs.length - 1].timestamp;
      await db
        .from("community_posts")
        .delete()
        .eq("channel_id", info.id)
        .gte("posted_at", oldest)
        .not("id", "in", `(${ids.join(",")})`);
    } else {
      await db.from("community_posts").delete().eq("channel_id", info.id);
    }
  }
}

// Claim the sync slot — due (last success older than SYNC_EVERY_MS) and not
// already running (or its lease ran out) — then pull. Success and failure
// both release the slot; a failure is recorded in last_error.
export async function syncIfStale(db) {
  const now = Date.now();
  const due = new Date(now - SYNC_EVERY_MS).toISOString();
  const leaseGone = new Date(now - LEASE_MS).toISOString();
  const { data: claimed } = await db
    .from("community_sync_state")
    .update({ sync_started_at: new Date(now).toISOString() })
    .eq("id", 1)
    .or(`last_synced_at.is.null,last_synced_at.lt.${due}`)
    .or(`sync_started_at.is.null,sync_started_at.lt.${leaseGone}`)
    .select("id")
    .maybeSingle();
  if (!claimed) return;
  let lastError = null;
  try {
    await syncChannels(db);
  } catch (err) {
    console.error("community sync failed:", err.message);
    lastError = err.message.slice(0, 500);
  }
  await db
    .from("community_sync_state")
    .update({ last_synced_at: new Date().toISOString(), sync_started_at: null, last_error: lastError })
    .eq("id", 1);
}

export async function communityFeed(db) {
  // don't make the reader wait long on Discord; a slow first sync carries on
  // from where it stopped on the next visit
  await Promise.race([syncIfStale(db), new Promise((r) => setTimeout(r, 8000))]);
  const { data, error } = await db
    .from("community_posts")
    .select("id, channel_id, channel_name, author_name, author_avatar_url, content, attachments, reactions, jump_url, posted_at")
    .order("posted_at", { ascending: false })
    .limit(60);
  if (error) throw new Error(error.message);
  return { posts: data || [] };
}
