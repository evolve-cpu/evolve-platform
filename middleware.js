// Vercel Edge Middleware — routes bot/AI crawlers through Prerender.io
// so they receive fully rendered HTML instead of the empty SPA shell.

const BOT_AGENTS = /googlebot|bingbot|yandexbot|duckduckbot|slurp|baiduspider|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|discordbot|slackbot|applebot|GPTBot|ChatGPT-User|Claude-Web|claudebot|PerplexityBot|anthropic-ai|cohere-ai|CCBot|Bytespider|ia_archiver|rogerbot|embedly|quora|outbrain|pinterest|chrome-lighthouse/i;

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

export default async function middleware(request) {
  const { NextResponse } = await import("next/server");
  const ua = request.headers.get("user-agent") || "";
  const token = process.env.PRERENDER_TOKEN;

  if (token && BOT_AGENTS.test(ua)) {
    const url = request.url;
    const prerenderUrl = `https://service.prerender.io/${url}`;
    try {
      const res = await fetch(prerenderUrl, {
        headers: {
          "X-Prerender-Token": token,
          "X-Prerender-Host": "evolvedesign.academy",
        },
      });
      const html = await res.text();
      return new NextResponse(html, {
        status: res.status,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    } catch {
      // fall through to normal SPA on error
    }
  }

  return NextResponse.next();
}
