// api/admin.js
// The only place the admin panel's service-role access happens. The
// browser used to hold SUPABASE_SERVICE_ROLE_KEY itself (as a VITE_ var,
// so it shipped in the public JS bundle) and the panel was behind a
// 4-digit PIN that shipped the same way. Now:
//
//   • the browser sends the signed-in user's Supabase access token
//   • this function works out who that is (admin_users → Evolve admin,
//     anu_admins / anu_faculty → Anant staff) and refuses everyone else
//   • only then does it run the request with the service role
//
// src/supabaseAdminClient.js is a drop-in stand-in for the old
// supabaseAdmin client: it records the query chain
// (.from().select().eq()…) and posts it here as { op: "query" }, so the
// admin screens didn't need rewriting.
//
// Ops:
//   whoami              signed in → { role, … } (+ links Anant staff's auth id)
//   query               admin roles → replay a query chain
//   storage             admin roles → signed upload/read URLs, remove, list
//   gemini              admin roles → dashboard insights, key stays here
//   grant_access        Evolve admins → manual access (paid outside Razorpay / free), see _manualGrant.js
//   anu_student_self    signed in → the caller's own anu_students row
//   welcome_email       signed in → "Welcome to Evolve" to the caller, once
//   delete_account      signed in → deletes the caller's account, then "Sorry to see you go"
//   community_feed      signed in → Discord posts for the Community tab (syncs if stale)
//   anu_student_check   public → { exists } for the student sign-in form
//   anant_staff_login   public → emails a magic link to listed Anant staff
//
// Replaces api/send-admin-login-email.js (Vercel Hobby: 12-function cap).

import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "./_sendEmail.js";
import { firstNameOf, sendWelcomeEmail, sendGoodbyeEmail } from "./_lifecycleEmails.js";
import { communityFeed } from "./_discordCommunity.js";
import { grantAccess } from "./_manualGrant.js";

const ANU_ORIGIN = "https://anu.evolvedesign.academy";
const GEMINI_MODEL = "gemini-2.5-flash-lite";

const ANANT_ROLES = ["anant_admin", "anant_faculty"];
const ADMIN_ROLES = ["evolve", ...ANANT_ROLES];

// Anant staff only reach their own data. Evolve admins reach everything.
const ANANT_TABLES = {
  portfolio_reviews: { read: ANANT_ROLES, write: ANANT_ROLES, tenantLocked: true },
  anu_students: { read: ANANT_ROLES, write: ANANT_ROLES },
  anu_faculty: { read: ANANT_ROLES, write: ["anant_admin"] },
  anu_admins: { read: ANANT_ROLES, write: ["anant_admin"] }
};
const ANANT_BUCKETS = ["review-reports"];

const VERBS = new Set(["select", "insert", "update", "upsert", "delete"]);
const CHAIN_METHODS = new Set([
  "select", "eq", "neq", "gt", "gte", "lt", "lte", "like", "ilike",
  "likeAllOf", "likeAnyOf", "ilikeAllOf", "ilikeAnyOf", "is", "in",
  "contains", "containedBy", "rangeGt", "rangeGte", "rangeLt", "rangeLte",
  "rangeAdjacent", "overlaps", "textSearch", "match", "not", "or", "filter",
  "order", "limit", "range", "single", "maybeSingle", "csv"
]);
const STORAGE_METHODS = new Set([
  "createSignedUploadUrl", "createSignedUrl", "createSignedUrls", "remove", "list"
]);

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function serviceClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new HttpError(500, "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set on the server");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function callerFrom(db, req) {
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const { data, error } = await db.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

// Evolve admin wins over Anant roles; an unverified email counts as nobody,
// so signing up with someone else's address gets you nothing.
async function roleOf(db, user) {
  const email = user?.email?.toLowerCase();
  if (!email || !user.email_confirmed_at) return { role: null };
  const [{ data: evolve }, { data: anuAdmin }, { data: faculty }] = await Promise.all([
    db.from("admin_users").select("email").eq("email", email).maybeSingle(),
    db.from("anu_admins").select("id, first_name, last_name, auth_user_id").eq("anu_email", email).maybeSingle(),
    db.from("anu_faculty").select("id, first_name, last_name, stream, program, auth_user_id").eq("anu_email", email).maybeSingle()
  ]);
  if (evolve) return { role: "evolve", email };
  if (anuAdmin) return { role: "anant_admin", email, person: anuAdmin, table: "anu_admins" };
  if (faculty) return { role: "anant_faculty", email, person: faculty, table: "anu_faculty" };
  return { role: null, email };
}

function rowsOf(payload) {
  return Array.isArray(payload) ? payload : [payload];
}

// ── query replay ───────────────────────────────────────────────────────
async function runQuery(db, who, { table, chain }) {
  if (typeof table !== "string" || !Array.isArray(chain) || !chain.length) {
    throw new HttpError(400, "bad query");
  }
  const [verb, verbArgs = []] = chain[0];
  if (!VERBS.has(verb)) throw new HttpError(400, `query must start with select/insert/update/upsert/delete, got ${verb}`);
  for (const [m] of chain.slice(1)) {
    if (!CHAIN_METHODS.has(m)) throw new HttpError(400, `method not allowed: ${m}`);
  }

  let steps = chain;
  if (who.role !== "evolve") {
    const rule = ANANT_TABLES[table];
    const allowed = rule && (verb === "select" ? rule.read : rule.write);
    if (!allowed?.includes(who.role)) throw new HttpError(403, `no access to ${table}`);

    if (rule.tenantLocked) {
      if (verb === "insert" || verb === "upsert") {
        const rows = rowsOf(verbArgs[0]);
        if (rows.some((r) => r?.tenant_id !== "anant")) throw new HttpError(403, "Anant staff can only write Anant rows");
        const ids = rows.map((r) => r.id).filter(Boolean);
        if (ids.length) {
          const { data: existing } = await db.from(table).select("id, tenant_id").in("id", ids);
          if ((existing || []).some((r) => r.tenant_id !== "anant")) throw new HttpError(403, "Anant staff can only write Anant rows");
        }
      } else {
        // select / update / delete only ever see Anant rows
        steps = [chain[0], ["eq", ["tenant_id", "anant"]], ...chain.slice(1)];
        if (verb === "update" && verbArgs[0]?.tenant_id && verbArgs[0].tenant_id !== "anant") {
          throw new HttpError(403, "Anant staff can only write Anant rows");
        }
      }
    }
  }

  let q = db.from(table);
  for (const [m, args = []] of steps) q = q[m](...args);
  const { data, error, count, status } = await q;
  return { data: data ?? null, error: error ?? null, count: count ?? null, status };
}

// ── storage ────────────────────────────────────────────────────────────
async function runStorage(db, who, { bucket, method, args = [] }) {
  if (!STORAGE_METHODS.has(method)) throw new HttpError(400, `storage method not allowed: ${method}`);
  if (who.role !== "evolve" && !ANANT_BUCKETS.includes(bucket)) throw new HttpError(403, `no access to ${bucket}`);
  const { data, error } = await db.storage.from(bucket)[method](...args);
  return { data: data ?? null, error: error ? { message: error.message } : null };
}

// ── gemini ─────────────────────────────────────────────────────────────
async function runGemini({ prompt, generationConfig }) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new HttpError(500, "GEMINI_API_KEY not set on the server");
  if (typeof prompt !== "string" || !prompt || prompt.length > 20000) throw new HttpError(400, "bad prompt");
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig })
    }
  );
  const data = await res.json();
  return { text: data?.candidates?.[0]?.content?.parts?.[0]?.text || "", error: data?.error?.message || null };
}

// ── Anant sign-in helpers ──────────────────────────────────────────────
async function linkAuthUser(db, table, person, userId) {
  if (person && !person.auth_user_id) {
    await db.from(table).update({ auth_user_id: userId, invite_accepted_at: new Date().toISOString() }).eq("id", person.id);
  }
}

async function anantStaffLogin(db, email) {
  const addr = String(email || "").trim().toLowerCase();
  if (!addr) throw new HttpError(400, "email required");
  // Evolve admins (admin_users) can sign in here too, for the full Anant view
  const [{ data: faculty }, { data: admin }, { data: evolve }] = await Promise.all([
    db.from("anu_faculty").select("id").eq("anu_email", addr).maybeSingle(),
    db.from("anu_admins").select("id").eq("anu_email", addr).maybeSingle(),
    db.from("admin_users").select("email").eq("email", addr).maybeSingle()
  ]);
  if (!faculty && !admin && !evolve) return { ok: false, error: "This email is not registered as faculty or admin." };

  const { data: link, error } = await db.auth.admin.generateLink({
    type: "magiclink",
    email: addr,
    options: { redirectTo: `${ANU_ORIGIN}/admin/dashboard` }
  });
  const magicLink = link?.properties?.action_link;
  if (error || !magicLink) return { ok: false, error: "Could not generate sign-in link. Please try again." };

  const roleLabel = admin || evolve ? "admin" : "faculty";
  await sendEmail({
    from: "noreply@evolvedesign.academy",
    fromName: "Anant National University x evolve",
    to: addr,
    subject: `Your ${roleLabel} portal access, Anant National University x Evolve`,
    html: `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:40px 32px;background:#060c17;color:#fff;border-radius:16px">
      <img src="${ANU_ORIGIN}/images/anant-logo.png" alt="Anant National University" style="height:40px;margin:0 auto 32px 0;display:block" />
      <p style="color:rgba(255,255,255,0.5);font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 10px">Anant National University x evolve</p>
      <h1 style="font-size:24px;font-weight:800;letter-spacing:-0.02em;line-height:1.25;margin:0 0 16px">Your ${roleLabel} portal is ready</h1>
      <p style="font-size:15px;line-height:1.7;color:rgba(255,255,255,0.72);margin:0 0 32px">
        Click below to sign in to the Anant National University ${roleLabel} dashboard. No password needed.
      </p>
      <a href="${magicLink}" style="display:inline-block;background:#2563eb;color:#fff;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;text-decoration:none">
        Open my ${roleLabel} dashboard
      </a>
      <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:36px 0 20px" />
      <p style="font-size:12px;color:rgba(255,255,255,0.28);margin:0">This link is for ${addr}. If this wasn't you, ignore this email.</p>
    </div>`
  });
  return { ok: true };
}

// ── handler ────────────────────────────────────────────────────────────
export async function handleAdmin(body, req) {
  const db = serviceClient();
  const { op } = body || {};

  // public ops
  if (op === "anu_student_check") {
    const addr = String(body.email || "").trim().toLowerCase();
    if (!addr) throw new HttpError(400, "email required");
    const { data } = await db.from("anu_students").select("id").eq("anu_email", addr).maybeSingle();
    return { exists: !!data };
  }
  if (op === "anant_staff_login") return anantStaffLogin(db, body.email);

  // everything else needs a signed-in user
  const user = await callerFrom(db, req);
  if (!user) throw new HttpError(401, "sign in required");

  if (op === "anu_student_self") {
    const email = user.email?.toLowerCase();
    if (!email || !user.email_confirmed_at) return { student: null };
    const { data } = await db.from("anu_students").select("*").eq("anu_email", email).maybeSingle();
    if (data) await linkAuthUser(db, "anu_students", data, user.id);
    return { student: data || null };
  }

  if (op === "community_feed") return communityFeed(db);

  // first sign-up → welcome email, at most once (claim the stamp first)
  if (op === "welcome_email") {
    const { data: claimed } = await db
      .from("profiles")
      .update({ welcome_email_sent_at: new Date().toISOString() })
      .eq("id", user.id)
      .is("welcome_email_sent_at", null)
      .select("name, email")
      .maybeSingle();
    if (!claimed) return { sent: false };
    const to = claimed.email || user.email;
    if (!to) return { sent: false };
    await sendWelcomeEmail({ to, firstName: firstNameOf(claimed.name, to) });
    return { sent: true };
  }

  // delete the caller's own account (profile cascades, then the auth user),
  // then say goodbye — only once the delete has actually gone through
  if (op === "delete_account") {
    const { data: profile } = await db.from("profiles").select("name, email").eq("id", user.id).maybeSingle();
    const { error: profErr } = await db.from("profiles").delete().eq("id", user.id);
    if (profErr) throw new HttpError(500, profErr.message);
    const { error: authErr } = await db.auth.admin.deleteUser(user.id);
    if (authErr) throw new HttpError(500, authErr.message);
    const to = profile?.email || user.email;
    if (to) {
      try {
        await sendGoodbyeEmail({ to, firstName: firstNameOf(profile?.name || user.user_metadata?.full_name, to) });
      } catch (err) {
        console.error("goodbye email failed:", err.message);
      }
    }
    return { deleted: true };
  }

  const who = await roleOf(db, user);

  if (op === "whoami") {
    if (who.person) await linkAuthUser(db, who.table, who.person, user.id);
    const p = who.person || {};
    return {
      role: who.role,
      email: who.email || null,
      name: [p.first_name, p.last_name].filter(Boolean).join(" ") || null,
      stream: p.stream || null,
      program: p.program || null
    };
  }

  if (!ADMIN_ROLES.includes(who.role)) throw new HttpError(403, "not an admin");

  if (op === "query") return runQuery(db, who, body);
  if (op === "storage") return runStorage(db, who, body);
  if (op === "gemini") return runGemini(body);
  if (op === "grant_access") {
    if (who.role !== "evolve") throw new HttpError(403, "Evolve admins only");
    try {
      return await grantAccess(db, body);
    } catch (err) {
      throw new HttpError(400, err.message);
    }
  }

  throw new HttpError(400, `unknown op: ${op}`);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    return res.status(200).json(await handleAdmin(body, req));
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    if (status === 500) console.error("api/admin error:", err);
    return res.status(status).json({ error: err.message || "server error" });
  }
}
