// Typetober → Discord, through channel webhooks (no bot needed).
//   DISCORD_TYPETOBER_WEBHOOK_URL         every paid submission, with image
//                                         (the #typetober-2026 channel)
//   DISCORD_TYPETOBER_REPORT_WEBHOOK_URL  the daily report (an admin channel;
//                                         falls back to the one above)
// Either unset = that post is skipped. A Discord failure never breaks a
// payment: everything here logs and returns. The leading underscore keeps
// Vercel from deploying this file as its own function.

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const COLORS = [0xffd007, 0xdf0586, 0xa35bfb, 0xc2fd5c, 0x01f1d9, 0xeb5328];
const SITE = (process.env.SITE_URL || "https://www.evolvedesign.academy").replace(/\/$/, "");

const imageUrl = (supabaseUrl, path) =>
  `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/typetober-submissions/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;

async function send(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ allowed_mentions: { parse: [] }, ...body })
  });
  if (!res.ok) throw new Error(`discord ${res.status}: ${await res.text()}`);
}

/**
 * Posts freshly paid submissions (rows of typetober_submissions, status
 * success) to the community channel: one embed per image, 10 per message.
 */
export async function postSubmissionsToDiscord(supabase, submissions, opts = {}) {
  const url = opts.webhookUrl || process.env.DISCORD_TYPETOBER_WEBHOOK_URL;
  const supabaseUrl = opts.supabaseUrl || process.env.SUPABASE_URL;
  if (!url || !supabaseUrl || !submissions?.length) return;
  try {
    const userId = submissions[0].user_id;
    const [{ data: profile }, { count: total }] = await Promise.all([
      supabase.from("profiles").select("name,username,avatar_url").eq("id", userId).maybeSingle(),
      supabase
        .from("typetober_submissions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "success")
    ]);
    const name = profile?.name || profile?.username || "A participant";
    const handle = profile?.username ? `@${profile.username}` : "";
    const author = {
      name: handle ? `${name} (${handle})` : name,
      ...(profile?.avatar_url?.startsWith("http") ? { icon_url: profile.avatar_url } : {})
    };

    const sorted = [...submissions].sort((a, b) => a.letter_index - b.letter_index);
    const letters = [...new Set(sorted.map((s) => LETTERS[s.letter_index]))].join(", ");
    const intro =
      sorted.length === 1
        ? `**${name}** just added **${letters}** to Typetober ✍️`
        : `**${name}** just added **${sorted.length} letters** (${letters}) to Typetober ✍️`;

    const embeds = sorted.map((s) => ({
      author,
      title: `Letter ${LETTERS[s.letter_index]}`,
      url: profile?.username
        ? `${SITE}/typetober/${encodeURIComponent(profile.username)}/${LETTERS[s.letter_index].toLowerCase()}`
        : `${SITE}/typetober?s=${s.id}`,
      color: COLORS[s.letter_index % COLORS.length],
      image: { url: imageUrl(supabaseUrl, s.image_path) },
      footer: { text: `Typetober 2026 · ${total ?? sorted.length} submissions so far` },
      timestamp: s.created_at
    }));

    for (let k = 0; k < embeds.length; k += 10) {
      await send(url, {
        username: "Typetober",
        ...(k === 0 ? { content: intro } : {}),
        embeds: embeds.slice(k, k + 10)
      });
    }
  } catch (err) {
    console.error("typetober discord post error:", err);
  }
}

// ── daily report ──────────────────────────────────────────────────────
const istDay = (ts) => new Date(Date.parse(ts) + 5.5 * 3600000).toISOString().slice(0, 10);

async function fetchAll(supabase, table, columns) {
  const out = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from(table).select(columns).range(from, from + 999);
    if (error) throw new Error(`${table}: ${error.message}`);
    out.push(...(data || []));
    if (!data || data.length < 1000) return out;
  }
}

/** Same numbers as the admin "typetober report" tab, for one IST day + totals. */
export async function buildDailyReport(supabase, day) {
  const [subs, parts, acts] = await Promise.all([
    fetchAll(supabase, "typetober_submissions", "user_id,letter_index,amount,currency,status,razorpay_order_id,id,created_at"),
    fetchAll(supabase, "typetober_participants", "user_id,joined_at,new_account"),
    fetchAll(supabase, "typetober_activity", "user_id,day")
  ]);
  const paid = subs.filter((r) => r.status === "success");
  const sum = (rows, cur) =>
    rows.filter((r) => (cur === "USD") === (r.currency === "USD")).reduce((s, r) => s + (Number(r.amount) || 0), 0);
  const orders = (rows) => new Set(rows.map((r) => r.razorpay_order_id || r.id)).size;
  const bulk = (rows) => {
    const m = new Map();
    rows.forEach((r) => m.set(r.razorpay_order_id || r.id, (m.get(r.razorpay_order_id || r.id) || 0) + 1));
    return [...m.values()].filter((n) => n > 1).length;
  };
  const dPaid = paid.filter((r) => istDay(r.created_at) === day);
  const dParts = parts.filter((r) => istDay(r.joined_at) === day);
  const perUser = new Map();
  paid.forEach((r) => perUser.set(r.user_id, (perUser.get(r.user_id) || new Set()).add(r.letter_index)));
  const perLetter = LETTERS.map((_, i) => dPaid.filter((r) => r.letter_index === i).length);
  const top = perLetter
    .map((n, i) => [LETTERS[i], n])
    .filter(([, n]) => n)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return {
    day,
    today: {
      newAccounts: dParts.filter((r) => r.new_account).length,
      joined: dParts.length,
      active: acts.filter((r) => r.day === day).length,
      submissions: dPaid.length,
      payers: new Set(dPaid.map((r) => r.user_id)).size,
      orders: orders(dPaid),
      bulkOrders: bulk(dPaid),
      inr: sum(dPaid, "INR"),
      usd: sum(dPaid, "USD"),
      topLetters: top
    },
    total: {
      newAccounts: parts.filter((r) => r.new_account).length,
      joined: parts.length,
      submissions: paid.length,
      payers: perUser.size,
      allLetters: [...perUser.values()].filter((s) => s.size === 26).length,
      orders: orders(paid),
      inr: sum(paid, "INR"),
      usd: sum(paid, "USD")
    }
  };
}

export async function postReportToDiscord(report, opts = {}) {
  const url =
    opts.webhookUrl ||
    process.env.DISCORD_TYPETOBER_REPORT_WEBHOOK_URL ||
    process.env.DISCORD_TYPETOBER_WEBHOOK_URL;
  if (!url) return { skipped: "no webhook configured" };
  const t = report.today;
  const a = report.total;
  const inr = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;
  const usd = (n) => `$${Number(n).toFixed(2).replace(/\.00$/, "")}`;
  const label = new Date(`${report.day}T00:00:00Z`).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC"
  });
  await send(url, {
    username: "Typetober report",
    embeds: [
      {
        title: `Typetober daily report · ${label}`,
        color: 0xffd007,
        fields: [
          { name: "New accounts for Typetober", value: String(t.newAccounts), inline: true },
          { name: "Joined Typetober", value: String(t.joined), inline: true },
          { name: "Active users", value: String(t.active), inline: true },
          { name: "Paid submissions", value: String(t.submissions), inline: true },
          { name: "Paying users", value: String(t.payers), inline: true },
          { name: "Orders (bulk)", value: `${t.orders} (${t.bulkOrders})`, inline: true },
          { name: "Revenue", value: `${inr(t.inr)} + ${usd(t.usd)}`, inline: true },
          {
            name: "Most submitted",
            value: t.topLetters.length ? t.topLetters.map(([l, n]) => `${l} ${n}`).join(" · ") : "–",
            inline: true
          },
          {
            name: "Totals so far",
            value: [
              `${a.submissions} paid submissions from ${a.payers} people (${a.allLetters} finished all 26)`,
              `${a.newAccounts} accounts created for Typetober · ${a.joined} joined`,
              `${a.orders} orders · ${inr(a.inr)} + ${usd(a.usd)}`
            ].join("\n")
          }
        ],
        footer: { text: "Days are India time" }
      }
    ]
  });
  return { ok: true };
}
