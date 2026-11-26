import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { extractText, getDocumentProxy } from "npm:unpdf";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";

const SERVICE_ROLE_KEY = (() => {
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (legacy) return legacy;
  const newKeys = Deno.env.get("SUPABASE_SECRET_KEYS") ?? "";
  if (newKeys) {
    try {
      const parsed = JSON.parse(newKeys);
      return parsed?.service_role ?? parsed?.v1?.service_role ?? "";
    } catch { return ""; }
  }
  return "";
})();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DB_HEADERS = {
  "apikey": SERVICE_ROLE_KEY,
  "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
};

const MAX_PORTFOLIO_PAGES = 5; // base page + up to 4 discovered sub-pages
const TEXT_SNIPPET_LEN = 12000;
const RENDER_TIMEOUT_MS = 30000; // r.jina.ai can genuinely take >20s on a cold, JS-heavy SPA
const NON_PAGE_EXT = /\.(css|js|mjs|json|png|jpe?g|gif|svg|webp|ico|woff2?|ttf|map|xml|txt|pdf|zip)$/i;

// Multi-tenant platforms — one hostname shared by millions of unrelated
// profiles. "Same domain" is meaningless as a portfolio-ownership signal
// here: a gallery URL's own-domain links are the platform's nav (Sign In,
// Explore, Jobs, …), not more of this designer's work. For these, the
// submitted URL is treated as the complete, self-contained source — no
// sub-page discovery, no wasted screenshots on Behance's marketing pages.
// Figma is here too: its own-domain links are pricing/login/community pages,
// and a file/prototype URL is the whole piece of work on its own.
const MULTI_TENANT_HOSTS = new Set([
  "behance.net", "www.behance.net",
  "dribbble.com", "www.dribbble.com",
  "figma.com", "www.figma.com",
]);

// optional — without it r.jina.ai runs on its anonymous rate limit, which a
// profile with many linked projects can hit
const JINA_API_KEY = Deno.env.get("JINA_API_KEY") ?? "";
function jinaAuth(): Record<string, string> {
  return JINA_API_KEY ? { "Authorization": `Bearer ${JINA_API_KEY}` } : {};
}

function isMultiTenantHost(url: string): boolean {
  try {
    return MULTI_TENANT_HOSTS.has(new URL(url).hostname);
  } catch {
    return false;
  }
}

/* ── Supabase REST helpers ───────────────────────────────────────────────── */

async function dbUpdate(userId: string, payload: Record<string, unknown>): Promise<void> {
  await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`,
    {
      method: "PATCH",
      headers: { ...DB_HEADERS, "Prefer": "return=minimal" },
      body: JSON.stringify(payload),
    }
  );
}

async function dbFetchProfile(userId: string): Promise<Record<string, unknown> | null> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=portfolio_link,portfolio_file_url,resume_link,resume_file_url`,
    { headers: DB_HEADERS }
  );
  if (!res.ok) return null;
  const rows = await res.json();
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

/* ── Every rebuild captures a fresh set of screenshots and overwrites
   extracted_profile, so the previous build's set is left unreferenced in
   storage. Runs only after the new result is saved — a failed rebuild keeps
   the old profile's images intact. ── */
async function pruneOldScreenshots(userId: string, keepUrls: string[]): Promise<void> {
  const prefix = `${userId}/screenshots/`;
  const listRes = await fetch(`${SUPABASE_URL}/storage/v1/object/list/portfolio-files`, {
    method: "POST",
    headers: DB_HEADERS,
    body: JSON.stringify({ prefix, limit: 1000 }),
  });
  if (!listRes.ok) return;
  const objects = await listRes.json();
  if (!Array.isArray(objects)) return;

  const keep = new Set(keepUrls.map((u) => u.split("/portfolio-files/").pop()));
  const stale = objects
    .filter((o: { id: string | null }) => o.id !== null)
    .map((o: { name: string }) => prefix + o.name)
    .filter((path: string) => !keep.has(path));
  if (!stale.length) return;

  await fetch(`${SUPABASE_URL}/storage/v1/object/portfolio-files`, {
    method: "DELETE",
    headers: DB_HEADERS,
    body: JSON.stringify({ prefixes: stale }),
  });
}

/* ── Plain fetch — no JS execution. Works for static/server-rendered pages,
   comes back empty for JS-rendered SPAs (Framer/Wix/Webflow/CRA shells).
   Used as the fallback when the rendered fetch below fails or times out. ── */

async function fetchPagePlain(url: string): Promise<{ ok: boolean; html: string; text: string }> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; evolve-bot/1.0)" },
      signal: controller.signal,
    });
    clearTimeout(t);
    if (!res.ok) return { ok: false, html: "", text: "" };
    const html = await res.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, TEXT_SNIPPET_LEN);
    return { ok: true, html, text };
  } catch {
    clearTimeout(t);
    return { ok: false, html: "", text: "" };
  }
}

function discoverLinksFromHtml(html: string, baseUrl: string, max: number): string[] {
  const found = new Set<string>();
  const base = new URL(baseUrl);
  const anchorRe = /<a\b[^>]*href\s*=\s*["']([^"'#]+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = anchorRe.exec(html)) && found.size < max * 4) {
    try {
      const resolved = new URL(match[1], base);
      if (resolved.hostname !== base.hostname) continue;
      if (resolved.href === base.href) continue;
      if (NON_PAGE_EXT.test(resolved.pathname)) continue;
      found.add(resolved.href);
    } catch { /* ignore unparseable hrefs */ }
  }
  return Array.from(found).slice(0, max);
}

function discoverLinksFromMarkdown(markdown: string, baseUrl: string, max: number): string[] {
  const found = new Set<string>();
  const base = new URL(baseUrl);
  const linkRe = /\]\(([^)\s]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = linkRe.exec(markdown)) && found.size < max * 4) {
    try {
      const resolved = new URL(match[1], base);
      if (resolved.hostname !== base.hostname) continue;
      if (resolved.href === base.href) continue;
      if (NON_PAGE_EXT.test(resolved.pathname)) continue;
      found.add(resolved.href);
    } catch { /* ignore unparseable hrefs */ }
  }
  return Array.from(found).slice(0, max);
}

/* ── Every link/image on a page, any domain — the raw material for the
   linked-work pass below. (discoverLinks* above stay same-domain only.) ── */

function absoluteUrl(raw: string, base: URL): string | null {
  try {
    const u = new URL(raw.trim().replace(/[.,;:!?]+$/, ""), base);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    u.hash = "";
    return u.href;
  } catch {
    return null;
  }
}

function harvestFromMarkdown(markdown: string, baseUrl: string): { links: string[]; images: string[] } {
  const base = new URL(baseUrl);
  const images = new Set<string>();
  const links = new Set<string>();
  const imageRe = /!\[[^\]]*\]\(([^)\s]+)/g;
  const linkRe = /\]\(([^)\s]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = imageRe.exec(markdown))) {
    const u = absoluteUrl(m[1], base);
    if (u) images.add(u);
  }
  while ((m = linkRe.exec(markdown))) {
    const u = absoluteUrl(m[1], base);
    if (u && !images.has(u)) links.add(u);
  }
  for (const u of urlsInText(markdown)) if (!images.has(u)) links.add(u);
  return { links: Array.from(links), images: Array.from(images) };
}

function harvestFromHtml(html: string, baseUrl: string): { links: string[]; images: string[] } {
  const base = new URL(baseUrl);
  const links = new Set<string>();
  const images = new Set<string>();
  let m: RegExpExecArray | null;
  const anchorRe = /<a\b[^>]*href\s*=\s*["']([^"']+)["']/gi;
  while ((m = anchorRe.exec(html))) {
    const u = absoluteUrl(m[1], base);
    if (u) links.add(u);
  }
  const imgRe = /<img\b[^>]*src\s*=\s*["']([^"']+)["']|<meta\b[^>]*property\s*=\s*["']og:image["'][^>]*content\s*=\s*["']([^"']+)["']/gi;
  while ((m = imgRe.exec(html))) {
    const u = absoluteUrl(m[1] || m[2], base);
    if (u) images.add(u);
  }
  return { links: Array.from(links), images: Array.from(images) };
}

// bare URLs typed into text — resumes often have "behance.net/jane" with no
// hyperlink at all
function urlsInText(text: string): string[] {
  const out = new Set<string>();
  const re = /\b(?:https?:\/\/|www\.)[^\s<>"'()[\]]+|\b(?:behance\.net|dribbble\.com|figma\.com|[a-z0-9-]+\.figma\.site)\/[^\s<>"'()[\]]*/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const raw = m[0].replace(/[.,;:!?]+$/, "");
    const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    try {
      const u = new URL(withScheme);
      u.hash = "";
      out.add(u.href);
    } catch { /* not a URL */ }
  }
  return Array.from(out);
}

// Jina's pageshot mode is the one renderer that actually gets past Behance/
// Dribbble's bot-block (confirmed — Browserless and Microlink both got 403).
// It has no scroll-position control (stateless, one render per request), so
// this is a single best-effort capture, capped at roughly 1280px tall —
// not a full-page or multi-segment shot the way non-blocked sites get.
async function captureViaJina(
  url: string,
  userId: string,
  timeoutMs: number = SCREENSHOT_TIMEOUT_MS,
): Promise<{ screenshotUrls: string[]; debug: string }> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`https://r.jina.ai/${url}`, {
      headers: {
        ...jinaAuth(),
        "Accept": "application/json",
        "x-respond-with": "pageshot",
        "x-respond-timing": "media-idle",
        "x-timeout": "40",
        "x-no-cache": "true",
      },
      signal: controller.signal,
    });
    clearTimeout(t);
    if (!res.ok) {
      const bodyText = await res.text().catch(() => "");
      return { screenshotUrls: [], debug: `jina responded ${res.status}${bodyText ? `: ${bodyText.slice(0, 300)}` : ""}` };
    }
    const json = await res.json();
    const shotUrl: string | undefined = json?.data?.screenshotUrl ?? json?.data?.screenshot;
    if (!shotUrl) {
      return { screenshotUrls: [], debug: `no screenshot field — keys: [${Object.keys(json?.data ?? json ?? {}).join(", ")}] raw: ${JSON.stringify(json).slice(0, 300)}` };
    }

    const imgRes = await fetch(shotUrl);
    if (!imgRes.ok) return { screenshotUrls: [], debug: `image fetch failed: ${imgRes.status}` };
    const bytes = new Uint8Array(await imgRes.arrayBuffer());
    const contentType = imgRes.headers.get("content-type") || "image/png";
    const ext = contentType.includes("jpeg") ? "jpg" : "png";
    const path = `${userId}/screenshots/${crypto.randomUUID()}.${ext}`;
    const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/portfolio-files/${path}`, {
      method: "POST",
      headers: {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": contentType,
        "x-upsert": "true",
      },
      body: bytes,
    });
    if (!uploadRes.ok) return { screenshotUrls: [], debug: `storage upload failed: ${uploadRes.status}` };

    return {
      screenshotUrls: [`${SUPABASE_URL}/storage/v1/object/public/portfolio-files/${path}`],
      debug: `${bytes.length.toLocaleString()} bytes — via r.jina.ai (single best-effort capture, no scroll control)`,
    };
  } catch (err) {
    clearTimeout(t);
    const reason = err instanceof Error && err.name === "AbortError"
      ? `timed out after ${timeoutMs / 1000}s`
      : (err as Error)?.message || "unknown error";
    return { screenshotUrls: [], debug: `exception: ${reason}` };
  }
}

/* ── Rendered fetch — routes through r.jina.ai, a free reader proxy that runs
   a real headless browser server-side (executes JS, waits for render) and
   hands back the page as clean text. This is the stand-in for hosting our
   own headless-browser step. Falls back to plain fetch if it errors/times out
   so a slow/rate-limited render doesn't take the whole page down. ────────── */

type RenderResult = {
  ok: boolean;
  text: string;
  rawLength: number;
  links: string[]; // same-domain sub-pages, for portfolio discovery
  allLinks: string[]; // every link on the page, any domain
  images: string[];
  title: string | null;
  renderedWith: string;
};

async function fetchRendered(url: string, linkBudget: number): Promise<RenderResult> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), RENDER_TIMEOUT_MS);
  try {
    const res = await fetch(`https://r.jina.ai/${url}`, {
      headers: {
        ...jinaAuth(),
        "Accept": "text/plain",
        // best-effort — asks Jina's headless browser to wait longer before
        // snapshotting, so scroll/animation-triggered content (typewriter
        // text, fade-ins, lazy-mounted sections) has a chance to finish.
        // Ignored harmlessly if this isn't a header they respect.
        "X-Timeout": "15",
        // r.jina.ai caches renders server-side per URL — without this, a
        // page edited since the last time anyone submitted this exact URL
        // (including us, a moment ago while testing) can come back stale.
        "X-No-Cache": "true",
      },
      signal: controller.signal,
    });
    clearTimeout(t);
    if (!res.ok) {
      const bodyText = await res.text().catch(() => "");
      throw new Error(`jina responded ${res.status}${bodyText ? `: ${bodyText.slice(0, 200)}` : ""}`);
    }
    const body = (await res.text()).trim();
    if (!body) throw new Error("jina returned an empty response");
    const harvested = harvestFromMarkdown(body, url);
    return {
      ok: true,
      text: body.slice(0, TEXT_SNIPPET_LEN),
      rawLength: body.length,
      links: discoverLinksFromMarkdown(body, url, linkBudget),
      allLinks: harvested.links,
      images: harvested.images,
      title: body.match(/^Title:\s*(.+)$/m)?.[1]?.trim() || null,
      renderedWith: "headless-rendered (r.jina.ai)",
    };
  } catch (err) {
    clearTimeout(t);
    const reason = err instanceof Error && err.name === "AbortError"
      ? `timed out after ${RENDER_TIMEOUT_MS / 1000}s`
      : (err as Error)?.message || "unknown error";
    const plain = await fetchPagePlain(url);
    const harvested = plain.ok ? harvestFromHtml(plain.html, url) : { links: [], images: [] };
    return {
      ok: plain.ok,
      text: plain.text,
      rawLength: plain.text.length,
      links: plain.ok ? discoverLinksFromHtml(plain.html, url, linkBudget) : [],
      allLinks: harvested.links,
      images: harvested.images,
      title: plain.html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() || null,
      renderedWith: `plain fetch — headless render failed (${reason})`,
    };
  }
}

/* ── PDF text extraction — unpdf runs pdf.js without a DOM/worker/filesystem,
   so it works inside this Deno edge sandbox. DOCX isn't handled yet. ─────── */

// parsing a big image-heavy PDF burns through the edge function's CPU/memory
// budget (WORKER_RESOURCE_LIMIT) — skip text extraction above this size;
// analyze-profile-data hands the whole PDF to Gemini anyway.
const MAX_PDF_PARSE_BYTES = 4 * 1024 * 1024;
const MAX_PDF_LINK_PAGES = 40;

// Text + every link in the PDF. Clickable links ("View case study →") live in
// the page's link annotations, not its text, so they're read separately —
// plain text extraction alone loses the URL behind every hyperlinked label.
async function extractPdf(fileUrl: string): Promise<{ ok: boolean; text: string; links: string[] }> {
  try {
    const res = await fetch(fileUrl);
    if (!res.ok) return { ok: false, text: "", links: [] };
    if (Number(res.headers.get("content-length") || 0) > MAX_PDF_PARSE_BYTES) {
      await res.body?.cancel();
      return { ok: true, text: "", links: [] };
    }
    const buf = new Uint8Array(await res.arrayBuffer());
    const pdf = await getDocumentProxy(buf);

    const links = new Set<string>();
    const pageCount = Math.min(pdf.numPages ?? 0, MAX_PDF_LINK_PAGES);
    for (let i = 1; i <= pageCount; i++) {
      try {
        const page = await pdf.getPage(i);
        const annotations = await page.getAnnotations();
        for (const a of annotations ?? []) {
          const u = (a as { url?: string })?.url;
          if (u && /^https?:\/\//i.test(u)) links.add(u);
        }
      } catch { /* a broken page shouldn't lose the rest */ }
    }

    const { text } = await extractText(pdf, { mergePages: true });
    const fullText = (text || "").trim();
    for (const u of urlsInText(fullText)) links.add(u);
    return { ok: true, text: fullText.slice(0, TEXT_SNIPPET_LEN), links: Array.from(links) };
  } catch {
    return { ok: false, text: "", links: [] };
  }
}

/* ── Screenshot capture — Jina's free proxy caps full-page shots at ~1280px
   tall (confirmed via debug output), and has no scroll control at all. A
   real scroll-and-shoot pass needs an actual browser session, which is what
   Browserless (or any compatible hosted-Chrome API) gives us: we send it a
   Puppeteer script, it runs on a real browser on their infrastructure, and
   hands back an array of screenshots taken at successive scroll positions.
   Requires BROWSERLESS_TOKEN (and optionally BROWSERLESS_URL) to be set as
   edge function secrets — without a token this step is skipped, not fatal. */

const BROWSERLESS_TOKEN = Deno.env.get("BROWSERLESS_TOKEN") ?? "";
const BROWSERLESS_URL = Deno.env.get("BROWSERLESS_URL") ?? "https://production-sfo.browserless.io";
const SCREENSHOT_TIMEOUT_MS = 60000; // scrolling through a real page + several screenshots takes longer than a single render
const MAX_SCROLL_SHOTS = 6;
const SHOT_VIEWPORT_HEIGHT = 1600;

// Puppeteer code executed server-side by Browserless's /function endpoint —
// we never run a browser ourselves, we just ship it this script. It scrolls
// the page once fully (to trigger lazy-loaded sections), then walks back
// down in viewport-sized steps taking one screenshot per step.
const SCROLL_SCREENSHOT_CODE = `
export default async ({ page, context }) => {
  const { url, viewportHeight, maxShots } = context;
  await page.setViewport({ width: 1280, height: viewportHeight });
  await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });

  const totalHeight = await page.evaluate(async () => {
    await new Promise((resolve) => {
      let scrolled = 0;
      const step = 600;
      const timer = setInterval(() => {
        window.scrollBy(0, step);
        scrolled += step;
        if (scrolled >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve(undefined);
        }
      }, 250);
    });
    return document.body.scrollHeight;
  });

  const shotCount = Math.max(1, Math.min(maxShots, Math.ceil(totalHeight / viewportHeight)));
  const shots = [];
  for (let i = 0; i < shotCount; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), i * viewportHeight);
    await new Promise((r) => setTimeout(r, 300));
    shots.push(await page.screenshot({ encoding: "base64" }));
  }

  return { data: { shots, totalHeight, shotCount }, type: "application/json" };
};
`;

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function captureScrolledScreenshots(url: string, userId: string): Promise<{ screenshotUrls: string[]; debug: string }> {
  if (!BROWSERLESS_TOKEN) {
    return { screenshotUrls: [], debug: "BROWSERLESS_TOKEN not set — screenshot capture skipped" };
  }
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), SCREENSHOT_TIMEOUT_MS);
  try {
    const res = await fetch(`${BROWSERLESS_URL}/function?token=${BROWSERLESS_TOKEN}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: SCROLL_SCREENSHOT_CODE,
        context: { url, viewportHeight: SHOT_VIEWPORT_HEIGHT, maxShots: MAX_SCROLL_SHOTS },
      }),
      signal: controller.signal,
    });
    clearTimeout(t);
    if (!res.ok) {
      const bodyText = await res.text().catch(() => "");
      return { screenshotUrls: [], debug: `browserless responded ${res.status}${bodyText ? `: ${bodyText.slice(0, 300)}` : ""}` };
    }
    const json = await res.json();
    const shots: string[] | undefined = json?.data?.shots ?? json?.shots;
    if (!shots || !shots.length) {
      return { screenshotUrls: [], debug: `no shots in response — keys: [${Object.keys(json ?? {}).join(", ")}] raw: ${JSON.stringify(json).slice(0, 300)}` };
    }

    const urls: string[] = [];
    for (let i = 0; i < shots.length; i++) {
      const bytes = base64ToBytes(shots[i]);
      const path = `${userId}/screenshots/${crypto.randomUUID()}-${i}.png`;
      const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/portfolio-files/${path}`, {
        method: "POST",
        headers: {
          "apikey": SERVICE_ROLE_KEY,
          "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
          "Content-Type": "image/png",
          "x-upsert": "true",
        },
        body: bytes,
      });
      if (uploadRes.ok) {
        urls.push(`${SUPABASE_URL}/storage/v1/object/public/portfolio-files/${path}`);
      }
    }
    const totalHeight = json?.data?.totalHeight ?? json?.totalHeight;
    return {
      screenshotUrls: urls,
      debug: `${urls.length}/${shots.length} segment(s) stored — page height ~${totalHeight ?? "?"}px`,
    };
  } catch (err) {
    clearTimeout(t);
    const reason = err instanceof Error && err.name === "AbortError"
      ? `timed out after ${SCREENSHOT_TIMEOUT_MS / 1000}s`
      : (err as Error)?.message || "unknown error";
    return { screenshotUrls: [], debug: `exception: ${reason}` };
  }
}

/* ── Linked work ─────────────────────────────────────────────────────────────
   The resume/portfolio are rarely the whole story — the real case studies sit
   behind links (Behance projects, Figma files, live sites, Drive decks). This
   pass harvests every link from the resume, the portfolio pages and any PDF,
   classifies it, and opens each one the way that platform can actually be
   read. Every link gets a status (opened / private / not_found / failed /
   skipped) so "do the links work?" is a fact, not a guess. ─────────────── */

const MAX_OUTLINKS = 6; // links actually opened, first wave
const MAX_PROFILE_EXPANSION = 3; // extra project pages pulled from a linked Behance/Dribbble profile
const MAX_RECORDED_OUTLINKS = 20; // over-budget links are still listed (unopened) so the AI knows they exist
const MAX_SOCIAL_LINKS = 10;
const OUTLINK_TEXT_LEN = 3000;
const MAX_IMAGES_PER_OUTLINK = 3;
const OUTLINK_TIMEOUT_MS = 50000;
const OUTLINK_SHOT_TIMEOUT_MS = 40000;
const OUTLINK_WAVE2_DEADLINE_MS = 70000; // skip profile expansion if the run is already this old
const MAX_STORED_IMAGE_BYTES = 5 * 1024 * 1024;
const FIGMA_TOKEN = Deno.env.get("FIGMA_TOKEN") ?? "";

type LinkType =
  | "behance_project" | "behance_profile"
  | "dribbble_shot" | "dribbble_profile"
  | "figma_file" | "figma_community"
  | "google_drive" | "website" | "social";
type LinkStatus = "opened" | "private" | "not_found" | "failed" | "skipped";
type Outlink = {
  url: string;
  type: LinkType;
  found_in: string;
  status: LinkStatus;
  title?: string | null;
  text?: string;
  image_urls: string[];
  note?: string;
  project_links?: string[];
};

const SOCIAL_HOSTS = [
  "linkedin.com", "instagram.com", "twitter.com", "x.com", "facebook.com", "youtube.com", "youtu.be",
  "github.com", "threads.net", "tiktok.com", "pinterest.com", "t.me", "wa.me", "whatsapp.com", "discord.gg",
];
// site-builder badges, trackers, app stores, CDNs — never someone's work
const IGNORED_HOSTS = [
  "adobe.com", "google.com", "apple.com", "microsoft.com", "jina.ai", "googleapis.com", "gstatic.com",
  "googletagmanager.com", "google-analytics.com", "schema.org", "w3.org", "calendly.com", "framer.com",
  "webflow.com", "wix.com", "squarespace.com", "cloudflare.com", "gravatar.com", "typeform.com",
];
const BEHANCE_RESERVED = new Set([
  "search", "galleries", "joblist", "jobs", "hire", "signup", "login", "about", "blog", "assets", "live",
  "onboarding", "for_you", "following", "privacy", "terms", "misc", "pro", "adobe", "moodboard",
  "collection", "dev", "help", "resume", "creativejobs", "premium", "assets-store", "hire-freelancers",
]);
const DRIBBBLE_RESERVED = new Set([
  "shots", "search", "jobs", "designers", "signup", "session", "tags", "learn", "pro", "hiring",
  "stories", "about", "terms", "privacy", "colors", "places", "following", "popular", "uploads",
  "account", "resources", "freelance-jobs", "services", "for-designers", "pricing",
]);
const FIGMA_FILE_KINDS = new Set(["file", "design", "proto", "board", "slides", "deck"]);

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

function hostIn(host: string, list: string[]): boolean {
  return list.some((h) => host === h || host.endsWith(`.${h}`));
}

function parseFigmaUrl(raw: string): { key: string; nodeId: string | null } | null {
  try {
    const u = new URL(raw);
    if (!/(^|\.)figma\.com$/i.test(u.hostname)) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    if (!FIGMA_FILE_KINDS.has(parts[0]) || !parts[1]) return null;
    const branchAt = parts.indexOf("branch");
    const key = branchAt > 0 && parts[branchAt + 1] ? parts[branchAt + 1] : parts[1];
    const nodeId = u.searchParams.get("node-id")?.replace(/-/g, ":") || null;
    return { key, nodeId };
  } catch {
    return null;
  }
}

function classifyLink(url: string): LinkType | null {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  const host = u.hostname.toLowerCase().replace(/^www\./, "");
  const segs = u.pathname.split("/").filter(Boolean);
  if (NON_PAGE_EXT.test(u.pathname)) return null;

  if (host === "behance.net") {
    if (segs[0] === "gallery" && /^\d+$/.test(segs[1] || "")) return "behance_project";
    if (segs.length === 1 && !BEHANCE_RESERVED.has(segs[0].toLowerCase())) return "behance_profile";
    return null;
  }
  if (host === "dribbble.com") {
    if (segs[0] === "shots" && /^\d+/.test(segs[1] || "")) return "dribbble_shot";
    if (segs.length === 1 && !DRIBBBLE_RESERVED.has(segs[0].toLowerCase())) return "dribbble_profile";
    return null;
  }
  if (host === "figma.com") {
    if (parseFigmaUrl(url)) return "figma_file";
    if (segs[0] === "community" && (segs[1] === "file" || segs[1] === "proto")) return "figma_community";
    return null;
  }
  if (host === "drive.google.com" || host === "docs.google.com") return "google_drive";
  if (hostIn(host, SOCIAL_HOSTS)) return "social";
  if (hostIn(host, IGNORED_HOSTS)) return null;
  return "website";
}

// one key per piece of work, so the same Behance project reached via two
// differently-slugged URLs is only opened once
function linkKey(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    const path = u.pathname.replace(/\/+$/, "");
    const behance = path.match(/^\/gallery\/(\d+)/);
    if (host === "behance.net" && behance) return `behance:${behance[1]}`;
    const shot = path.match(/^\/shots\/(\d+)/);
    if (host === "dribbble.com" && shot) return `dribbble:${shot[1]}`;
    const figma = parseFigmaUrl(url);
    if (figma) return `figma:${figma.key}:${figma.nodeId ?? ""}`;
    return `${host}${path.toLowerCase()}${u.search}`;
  } catch {
    return url;
  }
}

function withTimeout<T>(p: Promise<T>, ms: number, fallback: () => T): Promise<T> {
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve(fallback()), ms);
    p.then((v) => { clearTimeout(t); resolve(v); }, () => { clearTimeout(t); resolve(fallback()); });
  });
}

async function uploadImageBytes(bytes: Uint8Array, contentType: string, userId: string): Promise<string | null> {
  const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
  const path = `${userId}/screenshots/${crypto.randomUUID()}.${ext}`;
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/portfolio-files/${path}`, {
    method: "POST",
    headers: {
      "apikey": SERVICE_ROLE_KEY,
      "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body: bytes,
  });
  return res.ok ? `${SUPABASE_URL}/storage/v1/object/public/portfolio-files/${path}` : null;
}

// Copies a remote image into our storage. Figma render URLs expire, and
// re-running the analysis later shouldn't depend on a third-party CDN.
async function storeRemoteImage(url: string, userId: string): Promise<string | null> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; evolve-bot/1.0)" },
      signal: controller.signal,
    });
    const type = (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    // gif is skipped on purpose — Mistral only takes single-frame gifs
    if (!res.ok || !/^image\/(png|jpe?g|webp)$/.test(type) || Number(res.headers.get("content-length") || 0) > MAX_STORED_IMAGE_BYTES) {
      await res.body?.cancel();
      return null;
    }
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.length > MAX_STORED_IMAGE_BYTES) return null;
    return await uploadImageBytes(bytes, type, userId);
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

// tries a resized variant first (smaller, faster to send to the model), then the original
async function storeImages(
  urls: string[],
  userId: string,
  max: number,
  resize: (u: string) => string = (u) => u,
): Promise<string[]> {
  const picks = Array.from(new Set(urls)).slice(0, max);
  const stored = await Promise.all(picks.map(async (u) => {
    const sized = resize(u);
    return (await storeRemoteImage(sized, userId)) ?? (sized !== u ? await storeRemoteImage(u, userId) : null);
  }));
  return stored.filter((u): u is string => !!u);
}

const behanceSized = (u: string) => u.replace(/\/project_modules\/[^/]+\//, "/project_modules/max_1200/");
const dribbbleSized = (u: string) => `${u.split("?")[0]}?resize=1200x900&vertical=center`;
const isBehanceWorkImage = (u: string) => /behance\.net\/project_modules\//i.test(u);
const isBehanceCover = (u: string) => /behance\.net\/projects\//i.test(u);
const isDribbbleImage = (u: string) => /cdn\.dribbble\.com\/userupload\//i.test(u);

async function probeUrl(url: string): Promise<{ status: number | null; finalHost: string }> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; evolve-bot/1.0)" },
      redirect: "follow",
      signal: controller.signal,
    });
    await res.body?.cancel();
    return { status: res.status, finalHost: hostOf(res.url || url) };
  } catch {
    return { status: null, finalHost: "" };
  } finally {
    clearTimeout(t);
  }
}

// password-protected case studies (Framer/Notion/Webflow NDA pages) are
// common in design portfolios — they render fine but show nothing
function looksLoginWalled(text: string): boolean {
  return text.length < 800 && /password|protected|sign in|log in|request access/i.test(text);
}

type Candidate = { url: string; type: LinkType; found_in: string };

async function fetchProjectPage(c: Candidate, userId: string): Promise<Outlink> {
  const base: Outlink = { url: c.url, type: c.type, found_in: c.found_in, status: "failed", image_urls: [] };
  const page = await fetchRendered(c.url, 0);
  if (!page.ok) return { ...base, note: page.renderedWith };
  if (/page not found|404/i.test(page.title || "")) return { ...base, status: "not_found" };

  const isBehance = c.type === "behance_project";
  const work = page.images.filter(isBehance ? isBehanceWorkImage : isDribbbleImage);
  const images = await storeImages(work, userId, MAX_IMAGES_PER_OUTLINK, isBehance ? behanceSized : dribbbleSized);
  let note: string | undefined;
  if (!images.length) {
    const shot = await captureViaJina(c.url, userId, OUTLINK_SHOT_TIMEOUT_MS);
    images.push(...shot.screenshotUrls);
    note = "project images not found on the page — a page screenshot was used instead";
  }
  return { ...base, status: "opened", title: page.title, text: page.text.slice(0, OUTLINK_TEXT_LEN), image_urls: images, note };
}

async function fetchPlatformProfile(c: Candidate, userId: string): Promise<Outlink> {
  const base: Outlink = { url: c.url, type: c.type, found_in: c.found_in, status: "failed", image_urls: [] };
  const page = await fetchRendered(c.url, 0);
  if (!page.ok) return { ...base, note: page.renderedWith };

  const projectType: LinkType = c.type === "behance_profile" ? "behance_project" : "dribbble_shot";
  const projectLinks = Array.from(new Set(page.allLinks.filter((u) => classifyLink(u) === projectType)));
  const covers = page.images.filter(c.type === "behance_profile" ? isBehanceCover : isDribbbleImage);
  const images = await storeImages(covers, userId, 2);
  return {
    ...base,
    status: "opened",
    title: page.title,
    text: page.text.slice(0, OUTLINK_TEXT_LEN),
    image_urls: images,
    project_links: projectLinks,
    note: `profile page — ${projectLinks.length} project link(s) found on it`,
  };
}

async function figmaApi(path: string): Promise<{ status: number; json: Record<string, any> | null }> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 25000);
  try {
    const res = await fetch(`https://api.figma.com/v1${path}`, {
      headers: { "X-Figma-Token": FIGMA_TOKEN },
      signal: controller.signal,
    });
    const json = await res.json().catch(() => null);
    return { status: res.status, json };
  } catch {
    return { status: 0, json: null };
  } finally {
    clearTimeout(t);
  }
}

function figmaFailure(base: Outlink, status: number): Outlink {
  if (status === 403) return { ...base, status: "private", note: "Figma file isn't shared with 'anyone with the link'" };
  if (status === 404) return { ...base, status: "not_found", note: "Figma file doesn't exist (deleted or wrong link)" };
  if (status === 429) return { ...base, status: "failed", note: "Figma API rate limit — try again later" };
  return { ...base, status: "failed", note: `Figma API responded ${status || "no response"}` };
}

// Figma draws the design on a canvas, so a page render has no text and the
// screenshot is often a loading/login screen. The REST API instead gives the
// file's structure and renders its actual frames to images.
async function fetchFigma(c: Candidate, userId: string): Promise<Outlink> {
  const base: Outlink = { url: c.url, type: c.type, found_in: c.found_in, status: "failed", image_urls: [] };
  const parsed = parseFigmaUrl(c.url);
  if (!parsed) return base;

  if (!FIGMA_TOKEN) {
    const shot = await captureViaJina(c.url, userId, OUTLINK_SHOT_TIMEOUT_MS);
    return {
      ...base,
      status: shot.screenshotUrls.length ? "opened" : "failed",
      image_urls: shot.screenshotUrls,
      note: "FIGMA_TOKEN not set — one browser screenshot only; the canvas may not have finished drawing",
    };
  }

  const RENDERABLE = new Set(["FRAME", "SECTION", "COMPONENT", "COMPONENT_SET", "GROUP"]);
  type FigmaNode = { id: string; name: string; type: string; children?: FigmaNode[] };
  let fileName = "";
  let pageNames: string[] = [];
  let frames: FigmaNode[] = [];

  if (parsed.nodeId) {
    const r = await figmaApi(`/files/${parsed.key}/nodes?ids=${encodeURIComponent(parsed.nodeId)}&depth=1`);
    if (r.status !== 200 || !r.json) return figmaFailure(base, r.status);
    fileName = r.json.name ?? "";
    const doc: FigmaNode | undefined = r.json.nodes?.[parsed.nodeId]?.document;
    if (!doc) return { ...base, status: "not_found", note: "the linked frame no longer exists in the file" };
    const kids = (doc.children ?? []).filter((k) => RENDERABLE.has(k.type));
    frames = doc.type === "CANVAS" && kids.length ? kids : [doc];
  } else {
    const r = await figmaApi(`/files/${parsed.key}?depth=2`);
    if (r.status !== 200 || !r.json) return figmaFailure(base, r.status);
    fileName = r.json.name ?? "";
    const pages: FigmaNode[] = r.json.document?.children ?? [];
    pageNames = pages.map((p) => p.name);
    frames = pages.flatMap((p) => (p.children ?? []).filter((k) => RENDERABLE.has(k.type)));
  }

  const picks = frames.slice(0, MAX_IMAGES_PER_OUTLINK);
  let images: string[] = [];
  if (picks.length) {
    const ids = picks.map((f) => f.id).join(",");
    const r = await figmaApi(`/images/${parsed.key}?ids=${encodeURIComponent(ids)}&format=jpg&scale=0.5`);
    const renderUrls = Object.values((r.json?.images ?? {}) as Record<string, string | null>).filter((u): u is string => !!u);
    images = await storeImages(renderUrls, userId, MAX_IMAGES_PER_OUTLINK);
  }

  const text = [
    `Figma file: ${fileName || "(untitled)"}`,
    pageNames.length ? `Pages: ${pageNames.join(", ")}` : "",
    frames.length ? `Top-level frames (${frames.length}): ${frames.slice(0, 30).map((f) => f.name).join(", ")}` : "",
  ].filter(Boolean).join("\n");

  return {
    ...base,
    status: "opened",
    title: fileName || null,
    text,
    image_urls: images,
    note: images.length ? `${images.length} frame(s) rendered via the Figma API` : "file opened but no frames could be rendered",
  };
}

async function fetchWebsite(c: Candidate, userId: string): Promise<Outlink> {
  const base: Outlink = { url: c.url, type: c.type, found_in: c.found_in, status: "failed", image_urls: [] };
  // run together — the plain probe is only there to catch dead/private links
  const [probe, page, shot] = await Promise.all([
    probeUrl(c.url),
    fetchRendered(c.url, 0),
    captureViaJina(c.url, userId, OUTLINK_SHOT_TIMEOUT_MS),
  ]);
  if (probe.status === 404 || probe.status === 410) return { ...base, status: "not_found", note: `HTTP ${probe.status}` };
  if (c.type === "google_drive" && (probe.finalHost === "accounts.google.com" || probe.status === 401 || probe.status === 403)) {
    return { ...base, status: "private", note: "Google Drive file isn't shared publicly" };
  }
  if (page.ok && looksLoginWalled(page.text)) {
    return { ...base, status: "private", title: page.title, note: "page is password-protected or needs a login" };
  }
  if (!page.ok && !shot.screenshotUrls.length) return { ...base, note: page.renderedWith };
  return {
    ...base,
    status: "opened",
    title: page.title,
    text: page.ok ? page.text.slice(0, OUTLINK_TEXT_LEN) : "",
    image_urls: shot.screenshotUrls,
    note: page.ok ? undefined : "page text couldn't be read — screenshot only",
  };
}

function fetchOutlink(c: Candidate, userId: string): Promise<Outlink> {
  const run = (() => {
    switch (c.type) {
      case "behance_project":
      case "dribbble_shot":
        return fetchProjectPage(c, userId);
      case "behance_profile":
      case "dribbble_profile":
        return fetchPlatformProfile(c, userId);
      case "figma_file":
        return fetchFigma(c, userId);
      case "figma_community":
        return Promise.resolve<Outlink>({
          ...c, status: "skipped", image_urls: [],
          note: "Figma Community file — can't be read through the API",
        });
      default:
        return fetchWebsite(c, userId);
    }
  })();
  return withTimeout(run, OUTLINK_TIMEOUT_MS, () => ({
    ...c, status: "failed" as LinkStatus, image_urls: [], note: `timed out after ${OUTLINK_TIMEOUT_MS / 1000}s`,
  }));
}

async function checkOutlinks(
  sources: Array<{ from: string; urls: string[] }>,
  opts: { excludeKeys: Set<string>; excludeHost: string | null; startedAt: number },
  userId: string,
): Promise<Outlink[]> {
  const seen = new Set(opts.excludeKeys);
  const candidates: Candidate[] = [];
  const social: Outlink[] = [];

  for (const src of sources) {
    for (const url of src.urls) {
      const type = classifyLink(url);
      if (!type) continue;
      // a personal site's own pages are already covered by sub-page discovery
      if (opts.excludeHost && hostOf(url) === opts.excludeHost) continue;
      const key = linkKey(url);
      if (seen.has(key)) continue;
      seen.add(key);
      if (type === "social") {
        if (social.length < MAX_SOCIAL_LINKS) {
          social.push({ url, type, found_in: src.from, status: "skipped", image_urls: [], note: "social profile — recorded, not opened" });
        }
        continue;
      }
      candidates.push({ url, type, found_in: src.from });
    }
  }

  const wave1 = candidates.slice(0, MAX_OUTLINKS);
  const overflow: Outlink[] = candidates.slice(MAX_OUTLINKS, MAX_RECORDED_OUTLINKS).map((c) => ({
    ...c, status: "skipped", image_urls: [], note: "not opened — over the per-profile link limit",
  }));
  const opened = await Promise.all(wave1.map((c) => fetchOutlink(c, userId)));

  // a linked Behance/Dribbble profile is only thumbnails — open a few of its projects too
  const wave2: Candidate[] = [];
  if (Date.now() - opts.startedAt < OUTLINK_WAVE2_DEADLINE_MS) {
    for (const r of opened) {
      for (const url of r.project_links ?? []) {
        if (wave2.length >= MAX_PROFILE_EXPANSION) break;
        const type = classifyLink(url);
        const key = linkKey(url);
        if (!type || seen.has(key)) continue;
        seen.add(key);
        wave2.push({ url, type, found_in: `${r.type} ${r.url}` });
      }
    }
  }
  const expanded = await Promise.all(wave2.map((c) => fetchOutlink(c, userId)));

  return [...opened, ...expanded, ...overflow, ...social];
}

function summarizeOutlinks(list: Outlink[]): Record<string, number> {
  const counts: Record<string, number> = { found: list.length, opened: 0, private: 0, not_found: 0, failed: 0, skipped: 0 };
  for (const o of list) counts[o.status] = (counts[o.status] ?? 0) + 1;
  return counts;
}

/* ── Main handler ────────────────────────────────────────────────────────── */

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let user_id = "";

  try {
    const body = await req.json();
    user_id = body.user_id ?? "";

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "user_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await dbUpdate(user_id, { extracted_profile_status: "pending" });

    const profile = await dbFetchProfile(user_id);
    if (!profile) {
      await dbUpdate(user_id, { extracted_profile_status: "failed" });
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result: Record<string, unknown> = {
      generated_at: new Date().toISOString(),
      note:
        "Raw extracted content only — no AI summarization yet. This is a preview of the text that would be sent to the model to build the structured profile.",
    };

    const startedAt = Date.now();
    // links found anywhere, resume first — they're the ones the person chose to list
    const resumeLinks: string[] = [];
    const portfolioLinks: string[] = [];
    const alreadyFetched = new Set<string>();
    let screenshotsDone: Promise<unknown> = Promise.resolve();

    // ── Portfolio: base page (headless-rendered) + discovered same-domain sub-pages ──
    const portfolioTask = (async () => {
    if (profile.portfolio_link) {
      const baseUrl = profile.portfolio_link as string;
      const singlePageOnly = isMultiTenantHost(baseUrl);
      const base = await fetchRendered(baseUrl, singlePageOnly ? 0 : MAX_PORTFOLIO_PAGES - 1);

      // fetched in parallel — sequential would multiply the worst-case wait
      // (up to 4 pages × RENDER_TIMEOUT_MS) instead of bounding it to one
      const subLinks = singlePageOnly ? [] : base.links.slice(0, MAX_PORTFOLIO_PAGES - 1);
      const subResults = await Promise.all(subLinks.map((link) => fetchRendered(link, 0)));

      const rendered = [
        { url: baseUrl, ...base },
        ...subLinks.map((url, i) => ({ url, ...subResults[i] })),
      ];
      for (const p of rendered) {
        alreadyFetched.add(linkKey(p.url));
        portfolioLinks.push(...p.allLinks);
      }

      const pages: Array<{ url: string; ok: boolean; text: string; raw_length: number; screenshot_urls: string[]; screenshot_debug: string }> =
        rendered.map((p) => ({
          url: p.url,
          ok: p.ok,
          text: p.text,
          raw_length: p.rawLength,
          screenshot_urls: [],
          screenshot_debug: "",
        }));

      // screenshots run in parallel, one per successfully-rendered page, and
      // keep running while the linked-work pass below opens outside links.
      // Behance/Dribbble/Figma block a driven browser session — those get
      // Jina's single pageshot instead.
      screenshotsDone = Promise.all(
        rendered.map((p) => {
          if (!p.ok) return Promise.resolve({ screenshotUrls: [], debug: "page render failed — screenshot skipped" });
          return singlePageOnly ? captureViaJina(p.url, user_id) : captureScrolledScreenshots(p.url, user_id);
        })
      ).then((shots) => shots.forEach((s, i) => {
        pages[i].screenshot_urls = s.screenshotUrls;
        pages[i].screenshot_debug = s.debug;
      }));

      result.portfolio = {
        source_url: baseUrl,
        pages,
        pages_found: pages.length,
        rendered_with: base.renderedWith,
        note: singlePageOnly
          ? "This is a shared platform (Behance/Dribbble/Figma) — only the submitted page was captured directly; projects linked from it are opened in the linked-work pass."
          : undefined,
      };
    } else if (profile.portfolio_file_url) {
      // Design portfolios are mostly images, so whatever text layer the PDF
      // has is only a bonus — analyze-profile-data also attaches the PDF
      // itself to the model, which reads every page visually.
      const fileUrl = profile.portfolio_file_url as string;
      const isPdf = /\.pdf(\?|$)/i.test(fileUrl);
      const pdf = isPdf ? await extractPdf(fileUrl) : { ok: false, text: "", links: [] as string[] };
      portfolioLinks.push(...pdf.links);
      result.portfolio = {
        source_url: fileUrl,
        file: true,
        is_pdf: isPdf,
        pages: pdf.text ? [{ url: fileUrl, ok: true, text: pdf.text, raw_length: pdf.text.length, screenshot_urls: [] }] : [],
        note: isPdf
          ? pdf.text
            ? undefined
            : "Portfolio PDF has little or no selectable text (image-based pages) — the PDF itself is sent to the analysis."
          : "Portfolio was uploaded as a non-PDF file (.pptx/.zip) — only PDF portfolios can be read right now.",
      };
    }
    })();

    // ── Resume: link gets rendered the same way; a PDF upload gets real text extraction ──
    const resumeTask = (async () => {
    if (profile.resume_link) {
      const resumeUrl = profile.resume_link as string;
      const page = await fetchRendered(resumeUrl, 0);
      alreadyFetched.add(linkKey(resumeUrl));
      resumeLinks.push(...page.allLinks);
      result.resume = {
        source_url: resumeUrl,
        ok: page.ok,
        text: page.text,
        raw_length: page.rawLength,
      };
    } else if (profile.resume_file_url) {
      const fileUrl = profile.resume_file_url as string;
      if (/\.pdf(\?|$)/i.test(fileUrl)) {
        const pdf = await extractPdf(fileUrl);
        resumeLinks.push(...pdf.links);
        result.resume = {
          source_url: fileUrl,
          file: true,
          is_pdf: true,
          ok: pdf.ok,
          text: pdf.text || null,
          // Canva / Illustrator / Figma exports often outline their text, so
          // an empty result here is normal — the PDF goes to the analysis too
          note: pdf.text
            ? undefined
            : "Resume PDF has no selectable text (designed/outlined export) — the PDF itself is sent to the analysis.",
        };
      } else {
        result.resume = {
          source_url: fileUrl,
          ok: true,
          text: null,
          note: "Resume was uploaded as a .doc/.docx or other non-PDF file — text extraction for that format isn't wired up yet (PDF is supported).",
        };
      }
    }
    })();

    await Promise.all([portfolioTask, resumeTask]);

    // ── Linked work: open the project links found in the resume / portfolio ──
    const portfolioBase = (profile.portfolio_link as string) || "";
    const outlinks = await checkOutlinks(
      [
        { from: "resume", urls: resumeLinks },
        { from: "portfolio", urls: portfolioLinks },
      ],
      {
        excludeKeys: alreadyFetched,
        // on a shared platform (Behance profile) same-host links ARE the projects
        excludeHost: portfolioBase && !isMultiTenantHost(portfolioBase) ? hostOf(portfolioBase) : null,
        startedAt,
      },
      user_id,
    );
    result.outlinks = outlinks;
    result.outlinks_summary = summarizeOutlinks(outlinks);

    await screenshotsDone;

    await dbUpdate(user_id, {
      extracted_profile: result,
      extracted_profile_status: "done",
      extracted_profile_updated_at: new Date().toISOString(),
    });

    const portfolioPages = (result.portfolio as { pages?: Array<{ screenshot_urls?: string[] }> } | undefined)?.pages ?? [];
    const keepUrls = [
      ...portfolioPages.flatMap((p) => p.screenshot_urls ?? []),
      ...outlinks.flatMap((o) => o.image_urls),
    ];
    await pruneOldScreenshots(user_id, keepUrls).catch(() => {});

    return new Response(
      JSON.stringify({ success: true, extracted_profile: result, status: "done" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    const msg = (err as Error).message ?? "unknown error";
    if (user_id) {
      await dbUpdate(user_id, { extracted_profile_status: "failed" }).catch(() => {});
    }
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
