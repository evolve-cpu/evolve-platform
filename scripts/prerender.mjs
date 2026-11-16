// Prerender public pages into static HTML so AI readers (ChatGPT, Claude,
// Perplexity…) and crawlers that don't run JavaScript see real content.
//
// Runs after `vite build`:
//   1. keeps the untouched SPA shell as dist/app-shell.html (vercel.json
//      rewrites every non-prerendered URL to it)
//   2. serves dist/ on localhost, opens each public page in headless Chrome,
//      follows same-site links to discover more pages (events, etc.)
//   3. writes the rendered page into dist/<route>/index.html
//
// Never fails the build: if Chrome can't start, the site deploys as a plain
// SPA, exactly like before.

import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";

const DIST = path.resolve("dist");
const PORT = 4789;
const MAX_PAGES = 400;

const SEED_ROUTES = [
  "/",
  "/pricing",
  "/about",
  "/mentorship",
  "/community",
  "/events",
  "/webinars",
  "/grow",
  "/profile-creation",
  "/portfolio-review",
  "/community/portfolio-review",
  "/for-institutes/portfolio-review-programme",
  "/for-institutes/find-your-niche-programme",
  "/programmes/portfolio-review",
  "/programmes/mentorship",
  "/institutions",
  "/corporates",
  "/designers",
  "/evolve-in-person",
  "/course",
  "/what-is-design",
  "/quiz",
  "/typetober",
  "/terms",
  "/privacy",
];

// Private, personal, or form pages: never prerendered or crawled.
const SKIP = [
  /^\/admin/,
  /^\/app(\/|$)/,
  /^\/signin/,
  /^\/onboarding/,
  /^\/invite\//,
  /^\/payment/,
  /^\/mentorship-session/,
  /^\/profile\//,
  /^\/space\//,
  /^\/institute\/[^/]+\/settings/,
  /^\/evolve-in-person\/.+/,
  /\/form$/,
  /\/become-a-reviewer$/,
];

const BLOCKED_HOSTS = [
  "googletagmanager.com",
  "google-analytics.com",
  "clarity.ms",
  "facebook.net",
  "facebook.com",
  "doubleclick.net",
];

const isSkipped = (route) => SKIP.some((re) => re.test(route));

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".txt": "text/plain",
  ".xml": "application/xml",
};

function startServer(shell) {
  const server = http.createServer(async (req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
    const file = path.join(DIST, urlPath);
    try {
      if (file.startsWith(DIST) && (await fs.stat(file)).isFile()) {
        res.writeHead(200, {
          "Content-Type": MIME[path.extname(file)] || "application/octet-stream",
        });
        return res.end(await fs.readFile(file));
      }
    } catch {}
    // SPA fallback: always the original shell, never an already-rendered page
    res.writeHead(200, { "Content-Type": MIME[".html"] });
    res.end(shell);
  });
  return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
}

async function launchBrowser() {
  const puppeteer = (await import("puppeteer-core")).default;
  if (process.platform === "linux") {
    // Vercel / CI build machines
    const chromium = (await import("@sparticuz/chromium")).default;
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }
  const local =
    process.env.CHROME_PATH ||
    (process.platform === "win32"
      ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
      : "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome");
  return puppeteer.launch({ executablePath: local, headless: true });
}

const escAttr = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

// Put the page's own <title>/<meta>/<link> (from react-helmet-async) into the
// shell, replacing the site-wide defaults with the same name/property/rel.
function applyHead(html, head) {
  if (head.title) {
    html = html.replace(
      /<title>[\s\S]*?<\/title>/,
      `<title>${head.title.replace(/</g, "&lt;")}</title>`,
    );
  }
  for (const tag of head.tags) {
    const key = tag.match(/\b(name|property|rel)="([^"]+)"/);
    if (key) {
      const [, attr, val] = key;
      const tagName = tag.startsWith("<link") ? "link" : "meta";
      const re = new RegExp(
        `\\s*<${tagName}\\b[^>]*\\b${attr}="${val.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*>`,
        "g",
      );
      html = html.replace(re, "");
    }
    html = html.replace("</head>", `    ${tag}\n  </head>`);
  }
  return html;
}

function injectRoot(shell, rootHtml) {
  const start = shell.indexOf('<div id="root">');
  const bodyEnd = shell.lastIndexOf("</body>");
  const end = shell.lastIndexOf("</div>", bodyEnd);
  if (start === -1 || end === -1) throw new Error("root div not found in shell");
  return (
    shell.slice(0, start) +
    `<div id="root" data-prerendered="true">${rootHtml}</div>` +
    shell.slice(end + "</div>".length)
  );
}

async function render(browser, route) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  // never count prerender visits anywhere (GA, Clarity, platform analytics);
  // index.html and src/lib/platformAnalytics.js check this flag
  await page.evaluateOnNewDocument(() => {
    window.__evolveNoAnalytics = true;
  });
  await page.setUserAgent((await browser.userAgent()) + " evolve-prerender");
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const type = req.resourceType();
    const url = req.url();
    if (
      ["image", "media", "font"].includes(type) ||
      BLOCKED_HOSTS.some((h) => url.includes(h)) ||
      /\/rest\/v1\/rpc\/analytics_/.test(url) // safety net: platform analytics
    ) {
      return req.abort();
    }
    req.continue();
  });

  try {
    await page.goto(`http://localhost:${PORT}${route}`, {
      waitUntil: "networkidle0",
      timeout: 45000,
    });
    // wait until React replaced the loading screen
    await page.waitForFunction(
      () => !document.getElementById("il") && document.getElementById("root")?.innerText.trim().length > 50,
      { timeout: 20000 },
    );
    // let lazy sections / data fetches settle
    await new Promise((r) => setTimeout(r, 1500));

    const finalPath = new URL(page.url()).pathname.replace(/\/$/, "") || "/";
    if (finalPath !== (route.replace(/\/$/, "") || "/")) {
      return { skipped: `redirected to ${finalPath}` };
    }

    return await page.evaluate(() => {
      // drop inline scripts React never needs and that would re-run
      document.querySelectorAll("#root script").forEach((s) => s.remove());
      const tags = [...document.head.querySelectorAll("[data-rh]")].map((el) => {
        el.removeAttribute("data-rh");
        return el.outerHTML;
      });
      const links = [...document.querySelectorAll("a[href]")]
        .map((a) => a.getAttribute("href"))
        .filter(Boolean);
      return {
        title: document.title,
        tags,
        root: document.getElementById("root").innerHTML,
        links,
      };
    });
  } finally {
    await page.close();
  }
}

function normaliseLink(href) {
  try {
    const u = new URL(href, `http://localhost:${PORT}`);
    if (u.host !== `localhost:${PORT}`) return null;
    const p = u.pathname.replace(/\/$/, "") || "/";
    if (path.extname(p)) return null; // files, not pages
    return p;
  } catch {
    return null;
  }
}

async function main() {
  const shellPath = path.join(DIST, "index.html");
  const shell = await fs.readFile(shellPath, "utf8");
  await fs.writeFile(path.join(DIST, "app-shell.html"), shell);

  let browser;
  try {
    browser = await launchBrowser();
  } catch (err) {
    console.warn(`[prerender] Chrome unavailable, skipping prerender: ${err.message}`);
    return;
  }

  const server = await startServer(shell);
  const queue = [...SEED_ROUTES];
  const seen = new Set(queue);
  const done = [];

  try {
    while (queue.length && done.length < MAX_PAGES) {
      const route = queue.shift();
      if (isSkipped(route)) continue;
      try {
        const result = await render(browser, route);
        if (result.skipped) {
          console.log(`[prerender] skip ${route} (${result.skipped})`);
          continue;
        }
        let html = injectRoot(shell, result.root);
        html = applyHead(html, { title: result.title, tags: result.tags });
        // canonical must point at this page, not the homepage
        const canonical = `https://www.evolvedesign.academy${route === "/" ? "" : route}`;
        html = html
          .replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${escAttr(canonical)}"`)
          .replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${escAttr(canonical)}"`);

        const out =
          route === "/"
            ? shellPath
            : path.join(DIST, route.slice(1), "index.html");
        await fs.mkdir(path.dirname(out), { recursive: true });
        await fs.writeFile(out, html);
        done.push(route);
        console.log(`[prerender] ok   ${route}`);

        for (const href of result.links) {
          const p = normaliseLink(href);
          if (p && !seen.has(p) && !isSkipped(p)) {
            seen.add(p);
            queue.push(p);
          }
        }
      } catch (err) {
        console.warn(`[prerender] fail ${route}: ${err.message}`);
      }
    }
  } finally {
    await browser.close();
    server.close();
  }

  console.log(`[prerender] ${done.length} pages prerendered`);
}

main().catch((err) => {
  console.warn(`[prerender] skipped: ${err.message}`);
});
