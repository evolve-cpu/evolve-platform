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
const MULTI_TENANT_HOSTS = new Set([
  "behance.net", "www.behance.net",
  "dribbble.com", "www.dribbble.com",
]);

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

// Jina's pageshot mode is the one renderer that actually gets past Behance/
// Dribbble's bot-block (confirmed — Browserless and Microlink both got 403).
// It has no scroll-position control (stateless, one render per request), so
// this is a single best-effort capture, capped at roughly 1280px tall —
// not a full-page or multi-segment shot the way non-blocked sites get.
async function captureViaJina(url: string, userId: string): Promise<{ screenshotUrls: string[]; debug: string }> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), SCREENSHOT_TIMEOUT_MS);
  try {
    const res = await fetch(`https://r.jina.ai/${url}`, {
      headers: {
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
      ? `timed out after ${SCREENSHOT_TIMEOUT_MS / 1000}s`
      : (err as Error)?.message || "unknown error";
    return { screenshotUrls: [], debug: `exception: ${reason}` };
  }
}

/* ── Rendered fetch — routes through r.jina.ai, a free reader proxy that runs
   a real headless browser server-side (executes JS, waits for render) and
   hands back the page as clean text. This is the stand-in for hosting our
   own headless-browser step. Falls back to plain fetch if it errors/times out
   so a slow/rate-limited render doesn't take the whole page down. ────────── */

async function fetchRendered(url: string, linkBudget: number): Promise<{ ok: boolean; text: string; rawLength: number; links: string[]; renderedWith: string }> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), RENDER_TIMEOUT_MS);
  try {
    const res = await fetch(`https://r.jina.ai/${url}`, {
      headers: {
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
    return {
      ok: true,
      text: body.slice(0, TEXT_SNIPPET_LEN),
      rawLength: body.length,
      links: discoverLinksFromMarkdown(body, url, linkBudget),
      renderedWith: "headless-rendered (r.jina.ai)",
    };
  } catch (err) {
    clearTimeout(t);
    const reason = err instanceof Error && err.name === "AbortError"
      ? `timed out after ${RENDER_TIMEOUT_MS / 1000}s`
      : (err as Error)?.message || "unknown error";
    const plain = await fetchPagePlain(url);
    return {
      ok: plain.ok,
      text: plain.text,
      rawLength: plain.text.length,
      links: plain.ok ? discoverLinksFromHtml(plain.html, url, linkBudget) : [],
      renderedWith: `plain fetch — headless render failed (${reason})`,
    };
  }
}

/* ── PDF text extraction — unpdf runs pdf.js without a DOM/worker/filesystem,
   so it works inside this Deno edge sandbox. DOCX isn't handled yet. ─────── */

async function extractPdfText(fileUrl: string): Promise<{ ok: boolean; text: string }> {
  try {
    const res = await fetch(fileUrl);
    if (!res.ok) return { ok: false, text: "" };
    const buf = new Uint8Array(await res.arrayBuffer());
    const pdf = await getDocumentProxy(buf);
    const { text } = await extractText(pdf, { mergePages: true });
    return { ok: true, text: (text || "").trim().slice(0, TEXT_SNIPPET_LEN) };
  } catch {
    return { ok: false, text: "" };
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

    // ── Portfolio: base page (headless-rendered) + discovered same-domain sub-pages ──
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
      // screenshots run in parallel, one per successfully-rendered page.
      // Behance/Dribbble block a driven browser session (403) — for those,
      // fall back to microlink.io's dedicated URL-to-screenshot service.
      const screenshots = await Promise.all(
        rendered.map((p) => {
          if (!p.ok) return Promise.resolve({ screenshotUrls: [], debug: "page render failed — screenshot skipped" });
          return singlePageOnly ? captureViaJina(p.url, user_id) : captureScrolledScreenshots(p.url, user_id);
        })
      );

      const pages: Array<{ url: string; ok: boolean; text: string; raw_length: number; screenshot_urls: string[]; screenshot_debug: string }> =
        rendered.map((p, i) => ({
          url: p.url,
          ok: p.ok,
          text: p.text,
          raw_length: p.rawLength,
          screenshot_urls: screenshots[i].screenshotUrls,
          screenshot_debug: screenshots[i].debug,
        }));

      result.portfolio = {
        source_url: baseUrl,
        pages,
        pages_found: pages.length,
        rendered_with: base.renderedWith,
        note: singlePageOnly
          ? "This is a shared platform (Behance/Dribbble) — only the submitted gallery page was captured, not the rest of the site."
          : undefined,
      };
    } else if (profile.portfolio_file_url) {
      result.portfolio = {
        source_url: profile.portfolio_file_url,
        pages: [],
        note: "Portfolio was uploaded as a file — file text extraction isn't wired up yet in this test build.",
      };
    }

    // ── Resume: link gets rendered the same way; a PDF upload gets real text extraction ──
    if (profile.resume_link) {
      const resumeUrl = profile.resume_link as string;
      const page = await fetchRendered(resumeUrl, 0);
      result.resume = {
        source_url: resumeUrl,
        ok: page.ok,
        text: page.text,
        raw_length: page.rawLength,
      };
    } else if (profile.resume_file_url) {
      const fileUrl = profile.resume_file_url as string;
      if (/\.pdf(\?|$)/i.test(fileUrl)) {
        const pdf = await extractPdfText(fileUrl);
        result.resume = {
          source_url: fileUrl,
          ok: pdf.ok,
          text: pdf.ok ? pdf.text : null,
          note: pdf.ok ? undefined : "couldn't extract text from this PDF — it may be a scanned/image-only file.",
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

    await dbUpdate(user_id, {
      extracted_profile: result,
      extracted_profile_status: "done",
      extracted_profile_updated_at: new Date().toISOString(),
    });

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
