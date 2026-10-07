import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { createClient } from "@supabase/supabase-js";
import { recogniseLetters, validRecogniseImages } from "./api/_typetoberRecognise.js";
import { postSubmissionsToDiscord } from "./api/_typetoberDiscord.js";
import { priceItem, fulfilPurchase, redeemReviewCredit } from "./api/_membership.js";

// Dev-only: the after-trial membership flows (see api/_membership.js) —
// fake checkout (devConfirm), the free-review redeem, and the DEMO panel's
// scenario switcher (src/components/membership/DevMembershipPanel.jsx),
// which rewrites the signed-in tester's own trial/plan columns so every
// state can be tried for real, server-side checks included.
const DEV_SCENARIOS = {
  trial: () => ({ trial_ends_at: new Date(Date.now() + 30 * 864e5).toISOString(), plan: null, plan_expires_at: null, review_credits: 0 }),
  popup: () => ({ trial_ends_at: new Date(Date.now() - 6e4).toISOString(), plan: null, plan_expires_at: null, review_credits: 0 }),
  payg: () => ({ trial_ends_at: new Date(Date.now() - 6e4).toISOString(), plan: null, plan_expires_at: null, review_credits: 0 }),
  subM: () => ({ trial_ends_at: new Date(Date.now() - 6e4).toISOString(), plan: "monthly", plan_expires_at: new Date(Date.now() + 30 * 864e5).toISOString(), review_credits: 0 }),
  subA: () => ({ trial_ends_at: new Date(Date.now() - 6e4).toISOString(), plan: "annual", plan_expires_at: new Date(Date.now() + 365 * 864e5).toISOString(), review_credits: 1 })
};

async function handleMembershipDev(payload, supabase, res) {
  const send = (status, body) => {
    res.statusCode = status;
    res.end(JSON.stringify(body));
  };
  const { data: { user }, error: authError } = await supabase.auth.getUser(payload.token);
  if (authError || !user) return send(401, { error: "unauthorized" });

  if (payload.action === "dev_scenario") {
    const patch = DEV_SCENARIOS[payload.scenario]?.();
    if (!patch) return send(400, { error: "unknown scenario" });
    const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
    if (error) return send(500, { error: error.message });
    return send(200, { ok: true });
  }

  if (payload.action === "redeem_review") {
    const out = await redeemReviewCredit(supabase, user);
    return out.error ? send(400, { error: out.error }) : send(200, { ok: true, review: out.review });
  }

  if (!payload.devConfirm) return send(400, { error: "real Razorpay checkout doesn't run locally" });
  const priced = await priceItem(supabase, user.id, { kind: payload.kind, plan: payload.plan, eventId: payload.event_id });
  if (priced.error) return send(400, { error: priced.error });
  const orderId = `dev_${user.id.slice(0, 8)}_${Date.now()}`;
  const { error: insertErr } = await supabase.from("purchases").insert({
    user_id: user.id,
    ...priced.row,
    title: priced.title,
    amount: priced.rupees,
    razorpay_order_id: orderId,
    status: "pending"
  });
  if (insertErr) return send(500, { error: insertErr.message });
  const purchase = await fulfilPurchase(supabase, orderId);
  return send(200, { ok: true, purchase });
}

// Dev-only stand-in for api/razorpay-create-order.js's devConfirm branch
// (mentorship plans + Typetober submissions).
// The real /api/*.js files are Vercel serverless functions — `vite` (plain
// `npm run dev`) never runs them, it just serves the SPA, so a fetch to
// "/api/razorpay-create-order" 404s/falls through with nothing behind it.
// (This repo also has no server-side RAZORPAY_KEY_ID/SUPABASE_URL etc. in
// .env at all — only VITE_-prefixed client vars — and VITE_RAZORPAY_API_KEY
// here is a LIVE key, not a test one, so real Razorpay must never run
// locally anyway.) This intercepts ONLY devConfirm payloads and completes
// the mentorship_enrollments insert directly via the service-role client —
// same effect as the real endpoint's devConfirm path, no Razorpay involved.
// Never runs in production: this plugin only attaches to Vite's own dev
// server, which Vercel's build never starts.
function mentorshipDevPaymentBypass(env) {
  return {
    name: "mentorship-dev-payment-bypass",
    configureServer(server) {
      server.middlewares.use("/api/razorpay-create-order", async (req, res, next) => {
        if (req.method !== "POST") return next();
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        let payload = {};
        try {
          payload = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
        } catch {
          // fall through to the "invalid JSON" branch below
        }
        const isRecognise = payload.product === "typetober" && payload.action === "recognise";
        const isMembership = payload.product === "membership";
        if (!payload.devConfirm && !isRecognise && !isMembership) return next(); // real order/verify calls: unhandled locally, as before

        res.setHeader("Content-Type", "application/json");
        // `process.env` is NOT auto-populated from .env for vite.config.ts
        // itself (that only happens for import.meta.env in client code) —
        // must go through Vite's own loadEnv() instead, see below.
        const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
        const serviceKey = env.VITE_SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !serviceKey) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: "VITE_SUPABASE_URL / VITE_SUPABASE_SERVICE_ROLE_KEY missing in .env" }));
          return;
        }

        if (isMembership) {
          try {
            await handleMembershipDev(payload, createClient(supabaseUrl, serviceKey), res);
          } catch (err) {
            console.error("[membership-dev] error:", err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err?.message || "server error" }));
          }
          return;
        }

        // Typetober bulk upload: letter recognition, same helper as production.
        if (isRecognise) {
          try {
            const supabase = createClient(supabaseUrl, serviceKey);
            const { data: { user }, error: authError } = await supabase.auth.getUser(payload.token);
            if (authError || !user) {
              res.statusCode = 401;
              res.end(JSON.stringify({ error: "unauthorized" }));
              return;
            }
            if (!validRecogniseImages(payload.images)) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: "send 1-12 images" }));
              return;
            }
            const letters = await recogniseLetters(
              payload.images,
              env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY
            );
            res.statusCode = 200;
            res.end(JSON.stringify({ letters }));
          } catch (err) {
            console.error("[typetober-dev] recognise error:", err);
            res.statusCode = 502;
            res.end(JSON.stringify({ error: "couldn't read the images" }));
          }
          return;
        }

        // Typetober: same effect as the real endpoint's devConfirm branch —
        // one paid ("success") row per image, single or bulk, no Razorpay.
        if (payload.product === "typetober") {
          const items = Array.isArray(payload.items)
            ? payload.items
            : [{ letterIndex: payload.letterIndex, imagePath: payload.imagePath }];
          const valid =
            items.length > 0 &&
            items.length <= 60 &&
            items.every(
              (it) =>
                it &&
                Number.isInteger(it.letterIndex) &&
                it.letterIndex >= 0 &&
                it.letterIndex <= 25 &&
                typeof it.imagePath === "string" &&
                it.imagePath.length > 0
            );
          if (!valid) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: "missing letter or image" }));
            return;
          }
          try {
            const supabase = createClient(supabaseUrl, serviceKey);
            const { data: { user }, error: authError } = await supabase.auth.getUser(payload.token);
            if (authError || !user) {
              res.statusCode = 401;
              res.end(JSON.stringify({ error: "unauthorized" }));
              return;
            }
            const usd = payload.currency === "USD";
            const { data: submissions, error: insertErr } = await supabase
              .from("typetober_submissions")
              .insert(
                items.map((it) => ({
                  user_id: user.id,
                  letter_index: it.letterIndex,
                  image_path: it.imagePath,
                  amount: usd ? 1 : 10,
                  currency: usd ? "USD" : "INR",
                  status: "success"
                }))
              )
              .select();
            if (insertErr) {
              console.error("[typetober-dev-payment-bypass] insert error:", insertErr);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: insertErr.message || "server error" }));
              return;
            }
            // Posts to Discord only if DISCORD_TYPETOBER_WEBHOOK_URL is in your .env.
            await postSubmissionsToDiscord(supabase, submissions, {
              webhookUrl: env.DISCORD_TYPETOBER_WEBHOOK_URL,
              supabaseUrl
            });
            res.statusCode = 200;
            res.end(JSON.stringify({ ok: true, submissions, submission: submissions[0] }));
          } catch (err) {
            console.error("[typetober-dev-payment-bypass] error:", err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: "server error" }));
          }
          return;
        }

        const DEV_PLAN_AMOUNTS_PAISE = { core: 100, application_support: 100 };
        if (!DEV_PLAN_AMOUNTS_PAISE[payload.plan]) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: "invalid plan" }));
          return;
        }

        try {
          const supabase = createClient(supabaseUrl, serviceKey);
          const { data: { user }, error: authError } = await supabase.auth.getUser(payload.token);
          if (authError || !user) {
            res.statusCode = 401;
            res.end(JSON.stringify({ error: "unauthorized" }));
            return;
          }

          const { data: enrollment, error: insertErr } = await supabase
            .from("mentorship_enrollments")
            .insert({
              user_id: user.id,
              plan: payload.plan,
              amount: DEV_PLAN_AMOUNTS_PAISE[payload.plan] / 100,
              currency: "INR",
              phone: payload.phone || "",
              stream: payload.stream || "",
              status: "success"
            })
            .select()
            .single();
          if (insertErr) {
            console.error("[mentorship-dev-payment-bypass] insert error:", insertErr);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: "server error" }));
            return;
          }
          res.statusCode = 200;
          res.end(JSON.stringify({ ok: true, enrollment }));
        } catch (err) {
          console.error("[mentorship-dev-payment-bypass] error:", err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: "server error" }));
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
  server: {
    host: "::",
    port: 8080,
    allowedHosts: true,
    headers: {
      "Content-Security-Policy":
        "default-src 'self' https:; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; " +
        "style-src 'self' 'unsafe-inline' https:; " +
        "img-src 'self' data: https:; " +
        "font-src 'self' https: data:; " +
        "connect-src 'self' https: blob:; " +
        "worker-src 'self' blob:;"
    }
  },

  plugins: [
    react(),
    mode === "development" && componentTagger(),
    mode === "development" && mentorshipDevPaymentBypass(env)
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-core": ["react", "react-dom", "react-router-dom"],
          "animations": ["framer-motion", "gsap", "@gsap/react"],
          "supabase": ["@supabase/supabase-js"],
          "lottie": ["@lottiefiles/dotlottie-react"],
          "query": ["@tanstack/react-query"],
          "pdf-tools": ["jspdf", "html2canvas"],
          "react-pdf": ["@react-pdf/renderer"],
          "ui-radix": [
            "@radix-ui/react-accordion",
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-avatar",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-label",
            "@radix-ui/react-popover",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-select",
            "@radix-ui/react-separator",
            "@radix-ui/react-slot",
            "@radix-ui/react-switch",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toast",
            "@radix-ui/react-tooltip"
          ],
          "charts": ["recharts"],
        },
      },
    },
  },
  };
});