// api/_manualGrant.js
// Manual access grants from the admin panel (op "grant_access" in
// api/admin.js, Evolve admins only). For when someone paid outside the
// platform (UPI / bank transfer after a failed Razorpay attempt), or gets
// something free (a demo, a partner college). Underscore prefix = not its
// own Vercel function.
//
// Each grant writes the same "success" row a Razorpay payment would, so
// every existing access check (has_event_access, plan_expires_at, review
// cycles, mentorship_enrollments) unlocks it with no special-casing.
// razorpay_order_id is "manual_…" so the webhook never matches it, and
// razorpay_payment_id holds "manual: <reference> · <note>" as the audit
// trail.
//
// People who don't have an account yet get one (email confirmed, empty
// profile; the app gives it a username on first sign-in), and can be
// sent a one-click sign-in link.

import crypto from "node:crypto";
import { sendEmail } from "./_sendEmail.js";
import { grantPlan } from "./_membership.js";
import { firstNameOf, emailLayout, esc } from "./_lifecycleEmails.js";

const SITE = "https://www.evolvedesign.academy";

export const GRANT_KINDS = ["none", "plan", "event", "recording", "portfolio_review", "mentorship", "demo"];

const LANDING = {
  none: "/app",
  plan: "/app",
  event: "/app/events",
  recording: "/app/events",
  portfolio_review: "/app/grow/portfolio-review",
  mentorship: "/app/grow/mentorship",
  demo: "/app/grow" // straight to the programmes, not My Profile
};

const manualOrderId = () => `manual_${crypto.randomUUID()}`;
const auditNote = (reference, note) =>
  ["manual:", reference || "no reference", note ? `· ${note}` : ""].join(" ").trim();

// Finds the account for an email, or creates one. Returns { user, profile, created }.
async function ensureAccount(db, email, name) {
  const { data: existing } = await db
    .from("profiles")
    .select("id, name, email")
    .eq("email", email)
    .maybeSingle();
  if (existing) return { user: { id: existing.id }, profile: existing, created: false };

  const fullName = String(name || "").trim();
  const meta = fullName ? { full_name: fullName, first_name: fullName.split(/\s+/)[0] } : {};
  let userId;
  const { data: made, error } = await db.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: meta
  });
  if (made?.user) {
    userId = made.user.id;
  } else {
    // signed in once but never got a profile row — find the auth user
    const { data: link } = await db.auth.admin.generateLink({ type: "magiclink", email });
    userId = link?.user?.id;
    if (!userId) throw new Error(error?.message || "couldn't create the account");
  }

  const profileName = fullName || email.split("@")[0];
  const { data: profile, error: profErr } = await db
    .from("profiles")
    .upsert({ id: userId, email, name: profileName }, { onConflict: "id" })
    .select("id, name, email")
    .single();
  if (profErr) throw new Error(profErr.message);
  return { user: { id: userId }, profile, created: true };
}

// Same "reuse an open cycle, else start the next attempt" rule as the
// Razorpay webhook and redeemReviewCredit().
async function openReviewCycle(db, profile) {
  const { data: latest } = await db
    .from("evolve_portfolio_reviews")
    .select("id, attempt, review_report_url")
    .eq("user_id", profile.id)
    .order("attempt", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (latest && !latest.review_report_url) return { note: "already had an open review", id: null };
  const { data: made, error } = await db
    .from("evolve_portfolio_reviews")
    .insert({
      user_id: profile.id,
      name: profile.name || "",
      email: profile.email || "",
      review_status: "draft",
      attempt: (latest?.attempt || 0) + 1
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return { note: `review ${(latest?.attempt || 0) + 1} opened`, id: made.id };
}

async function insertReviewPayment(db, profile, amount, audit) {
  const { error } = await db.from("portfolio_review_payments").insert({
    user_id: profile.id,
    name: profile.name || "",
    email: profile.email || "",
    amount: amount * 100, // this table stores paise
    phone: "",
    razorpay_order_id: manualOrderId(),
    razorpay_payment_id: audit,
    status: "success"
  });
  if (error) throw new Error(error.message);
}

// Demo access (supabase/migrations/demo_access.sql): everything except
// mentorship until demo_until — an active plan (events, recordings, public
// profile, verification all key off plan_expires_at) plus an open review.
// What it replaced is kept in demo_restore so revokeDemo() can undo it.
// Granting again while a demo is running just moves the end date.
async function grantDemo(db, profile, grant, amount, audit) {
  const until = new Date(grant.demo_until || "");
  if (isNaN(until.getTime()) || until.getTime() <= Date.now()) throw new Error("pick a demo end date in the future");
  until.setHours(23, 59, 59, 999);
  const untilIso = until.toISOString();

  const { data: cur } = await db
    .from("profiles")
    .select("plan, plan_expires_at, review_credits, demo_until, demo_restore")
    .eq("id", profile.id)
    .single();

  // never cut short a real plan that runs past the demo
  const ts = (v) => (v ? new Date(v).getTime() : 0);
  const restore = cur?.demo_until ? cur.demo_restore || {} : null;
  const prevExpiry = restore ? restore.plan_expires_at : cur?.plan_expires_at;
  const keepRealPlan = ts(prevExpiry) > until.getTime();

  if (restore) {
    const { error } = await db
      .from("profiles")
      .update({ demo_until: untilIso, ...(keepRealPlan ? {} : { plan_expires_at: untilIso }) })
      .eq("id", profile.id);
    if (error) throw new Error(error.message);
    return `demo extended to ${until.toDateString()}`;
  }

  await insertReviewPayment(db, profile, amount, audit);
  const review = await openReviewCycle(db, profile);
  const { error } = await db
    .from("profiles")
    .update({
      ...(keepRealPlan ? {} : { plan: "annual", plan_expires_at: untilIso }),
      demo_until: untilIso,
      demo_restore: {
        plan: cur?.plan ?? null,
        plan_expires_at: cur?.plan_expires_at ?? null,
        review_credits: cur?.review_credits ?? 0,
        review_id: review.id
      }
    })
    .eq("id", profile.id);
  if (error) throw new Error(error.message);
  return `demo access till ${until.toDateString()} · ${review.note}`;
}

// Cancels demos: plan fields go back to what they were (unless the person
// bought a plan during the demo — then plan_expires_at no longer matches
// demo_until and it's left alone), and the review the demo opened is
// deleted if it was never submitted.
export async function revokeDemo(db, body) {
  const ids = (Array.isArray(body.user_ids) ? body.user_ids : []).filter(Boolean);
  if (!ids.length) throw new Error("no users picked");
  const { data: rows, error } = await db
    .from("profiles")
    .select("id, email, plan_expires_at, demo_until, demo_restore")
    .in("id", ids)
    .not("demo_until", "is", null);
  if (error) throw new Error(error.message);

  const results = [];
  for (const p of rows || []) {
    const r = { email: p.email };
    try {
      const restore = p.demo_restore || {};
      const planUntouched = p.plan_expires_at && new Date(p.plan_expires_at).getTime() === new Date(p.demo_until).getTime();
      const { error: upErr } = await db
        .from("profiles")
        .update({
          ...(planUntouched
            ? {
                plan: restore.plan ?? null,
                plan_expires_at: restore.plan_expires_at ?? null,
                review_credits: restore.review_credits ?? 0
              }
            : {}),
          demo_until: null,
          demo_restore: null
        })
        .eq("id", p.id);
      if (upErr) throw new Error(upErr.message);
      if (restore.review_id) {
        await db
          .from("evolve_portfolio_reviews")
          .delete()
          .eq("id", restore.review_id)
          .eq("review_status", "draft")
          .is("review_report_url", null);
      }
      r.ok = true;
    } catch (err) {
      r.ok = false;
      r.error = err.message;
    }
    results.push(r);
  }
  return { results };
}

// A free portfolio review invite (e.g. a partner college cohort) — see
// supabase/migrations/review_invite.sql. No 30-day trial for them: if they
// haven't started one yet, it's stamped as started and already over, so
// public.start_trial() leaves it alone. Their review upload also builds
// their AI profile (api/admin.js op "review_profile_build").
async function markReviewInvite(db, userId) {
  const now = new Date().toISOString();
  const { error } = await db.from("profiles").update({ review_invite_at: now }).eq("id", userId);
  if (error) throw new Error(error.message);
  await db
    .from("profiles")
    .update({ trial_started_at: now, trial_ends_at: now })
    .eq("id", userId)
    .is("trial_started_at", null);
}

async function applyGrant(db, profile, grant, amount, audit) {
  const userId = profile.id;
  switch (grant.kind) {
    case "none":
      return "no access change";

    case "plan": {
      if (!["monthly", "annual"].includes(grant.plan)) throw new Error("pick monthly or annual");
      const { error } = await db.from("purchases").insert({
        user_id: userId,
        kind: "plan",
        plan: grant.plan,
        title: `${grant.plan === "annual" ? "Annual" : "Monthly"} plan`,
        amount,
        razorpay_order_id: manualOrderId(),
        razorpay_payment_id: audit,
        status: "success"
      });
      if (error) throw new Error(error.message);
      await grantPlan(db, userId, grant.plan);
      return `${grant.plan} plan granted`;
    }

    case "event":
    case "recording": {
      if (!grant.event_id) throw new Error("pick an event");
      const { data: ev } = await db.from("events").select("id, title").eq("id", grant.event_id).maybeSingle();
      if (!ev) throw new Error("event not found");
      const { data: had } = await db
        .from("purchases")
        .select("id")
        .eq("user_id", userId)
        .eq("event_id", ev.id)
        .eq("kind", grant.kind)
        .eq("status", "success")
        .limit(1)
        .maybeSingle();
      if (had) return `already had ${grant.kind} access`;
      const { error } = await db.from("purchases").insert({
        user_id: userId,
        kind: grant.kind,
        event_id: ev.id,
        title: ev.title,
        amount,
        razorpay_order_id: manualOrderId(),
        razorpay_payment_id: audit,
        status: "success"
      });
      if (error) throw new Error(error.message);
      return `${grant.kind} access: ${ev.title}`;
    }

    case "portfolio_review": {
      if (amount === 0) await markReviewInvite(db, userId);
      await insertReviewPayment(db, profile, amount, audit);
      return (await openReviewCycle(db, profile)).note;
    }

    case "demo":
      return await grantDemo(db, profile, grant, amount, audit);

    case "mentorship": {
      if (!["core", "application_support"].includes(grant.mentorship_plan)) throw new Error("pick a mentorship plan");
      const { error } = await db.from("mentorship_enrollments").insert({
        user_id: userId,
        plan: grant.mentorship_plan,
        amount,
        phone: "",
        razorpay_order_id: manualOrderId(),
        razorpay_payment_id: audit,
        status: "success"
      });
      if (error) throw new Error(error.message);
      return `mentorship (${grant.mentorship_plan.replace("_", " ")}) granted`;
    }

    default:
      throw new Error(`unknown grant: ${grant.kind}`);
  }
}

const GRANT_LINE = {
  none: null,
  plan: "Your evolve membership is active.",
  event: "Your event access is ready.",
  recording: "Your recording is unlocked.",
  portfolio_review: "Your portfolio review is ready to start. Upload your portfolio and resume, and our reviewers will take it from there.",
  mentorship: "Your mentorship is set up and ready to go.",
  demo: "Your demo access is on: events, recordings, your portfolio review and the full platform are all unlocked."
};

async function sendSignInLink(db, profile, kind) {
  const { data, error } = await db.auth.admin.generateLink({
    type: "magiclink",
    email: profile.email,
    options: { redirectTo: `${SITE}${LANDING[kind] || "/app"}` }
  });
  const link = data?.properties?.action_link;
  if (error || !link) throw new Error(error?.message || "couldn't make a sign-in link");

  const button = `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px"><tr><td style="background:#FFD007;border-radius:12px">
          <a href="${link}" style="display:inline-block;padding:14px 26px;font-family:Inter,Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;color:#161616;text-decoration:none">Sign in to evolve</a>
        </td></tr></table>`;
  const paragraphs = [
    `Hi ${esc(firstNameOf(profile.name, profile.email))},`,
    "Your evolve account is ready. No password needed, just tap the button below.",
    GRANT_LINE[kind],
    button,
    `<span style="font-size:13px;color:#a3a3a3">The button works once and expires after a while. After that, sign in at <a href="${SITE}/signin" style="color:#FFD007">evolvedesign.academy/signin</a> with ${esc(profile.email)} and everything will be there.</span>`
  ].filter(Boolean);

  await sendEmail({
    from: "noreply@evolvedesign.academy",
    fromName: "Team evolve",
    to: profile.email,
    subject: "Your evolve account is ready",
    html: emailLayout({ title: "You're in!", preheader: "Your evolve account is ready.", paragraphs })
  });
}

// body: { people: [{ email, name }], grant: { kind, plan?, event_id?, mentorship_plan?, tier?, demo_until? },
//         amount (rupees, 0 = free), reference, note, send_link }
export async function grantAccess(db, body) {
  const grant = body.grant || {};
  if (!GRANT_KINDS.includes(grant.kind)) throw new Error("pick what to grant");
  const amount = Math.max(0, Math.round(Number(body.amount) || 0));
  const audit = auditNote(String(body.reference || "").trim(), String(body.note || "").trim());
  const people = (Array.isArray(body.people) ? body.people : [])
    .map((p) => ({ email: String(p?.email || "").trim().toLowerCase(), name: String(p?.name || "").trim() }))
    .filter((p) => p.email);
  if (!people.length) throw new Error("add at least one email");
  if (people.length > 50) throw new Error("50 people at a time, max");

  const results = [];
  for (const person of people) {
    const r = { email: person.email };
    try {
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(person.email)) throw new Error("not an email address");
      const { profile, created } = await ensureAccount(db, person.email, person.name);
      r.created = created;
      if (grant.tier === "student" || grant.tier === "professional") {
        await db.from("profiles").update({ role: grant.tier }).eq("id", profile.id);
      }
      r.granted = await applyGrant(db, profile, grant, amount, audit);
      if (body.send_link) {
        try {
          await sendSignInLink(db, profile, grant.kind);
          r.emailed = true;
        } catch (err) {
          r.emailError = err.message;
        }
      }
      r.ok = true;
    } catch (err) {
      r.ok = false;
      r.error = err.message;
    }
    results.push(r);
  }
  return { results };
}

// Undoes one manual grant from the "Recent manual grants" list (op
// "revoke_grant" in api/admin.js). The row is kept as the audit trail but
// marked status "refunded", which every access check already ignores;
// whatever the grant switched on elsewhere is switched back off:
//   plan          plan_expires_at moves back by the month/year it added
//                 (cleared if that's already past), annual's review credit
//                 comes back off
//   event         their registration for that event is cancelled
//   review        the review cycle is removed if it hasn't been started
//                 (no uploads, no report); a started one is left in place
//   mentorship    status alone is enough
// Demo access isn't revoked here — cancel it from Active demos.
const REVOCABLE = ["purchases", "portfolio_review_payments", "mentorship_enrollments"];

export async function revokeGrant(db, body) {
  const { table, id } = body || {};
  if (!REVOCABLE.includes(table) || !id) throw new Error("bad grant");
  const { data: row, error } = await db.from(table).select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!row) throw new Error("grant not found");
  if (!String(row.razorpay_order_id || "").startsWith("manual_")) throw new Error("only manual grants can be revoked here");
  if (row.status !== "success") throw new Error("already revoked");

  const { error: stErr } = await db.from(table).update({ status: "refunded" }).eq("id", id);
  if (stErr) throw new Error(stErr.message);
  const userId = row.user_id;
  const notes = [];

  if (table === "purchases" && row.kind === "plan") {
    const { data: p } = await db
      .from("profiles")
      .select("plan_expires_at, review_credits, demo_until")
      .eq("id", userId)
      .single();
    if (p?.plan_expires_at) {
      const back = new Date(p.plan_expires_at);
      if (row.plan === "annual") back.setFullYear(back.getFullYear() - 1);
      else back.setMonth(back.getMonth() - 1);
      const over = back.getTime() <= Date.now();
      await db
        .from("profiles")
        .update({
          plan: over ? null : undefined,
          plan_expires_at: over ? null : back.toISOString(),
          review_credits: Math.max(0, (p.review_credits || 0) - (row.plan === "annual" ? 1 : 0))
        })
        .eq("id", userId);
      notes.push(over ? "plan ended" : `plan now ends ${back.toDateString()}`);
    }
  }

  if (table === "purchases" && row.kind === "event" && row.event_id) {
    const { data: other } = await db
      .from("purchases")
      .select("id")
      .eq("user_id", userId)
      .eq("event_id", row.event_id)
      .eq("kind", "event")
      .eq("status", "success")
      .limit(1)
      .maybeSingle();
    if (!other) {
      await db
        .from("event_registrations")
        .update({ status: "cancelled" })
        .eq("user_id", userId)
        .eq("event_id", row.event_id);
      notes.push("event registration cancelled");
    }
  }

  if (table === "portfolio_review_payments") {
    const { data: latest } = await db
      .from("evolve_portfolio_reviews")
      .select("id, resume_value, portfolio_value, review_report_url")
      .eq("user_id", userId)
      .order("attempt", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (latest && !latest.review_report_url) {
      if (!latest.resume_value && !latest.portfolio_value) {
        await db.from("evolve_portfolio_reviews").delete().eq("id", latest.id);
        notes.push("open review removed");
      } else {
        notes.push("review already started, left in place");
      }
    }
    if (!row.amount) await db.from("profiles").update({ review_invite_at: null }).eq("id", userId);
  }

  return { ok: true, note: notes.join(" · ") || "revoked" };
}
