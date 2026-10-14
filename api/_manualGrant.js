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

export const GRANT_KINDS = ["none", "plan", "event", "recording", "portfolio_review", "mentorship"];

const LANDING = {
  none: "/app",
  plan: "/app",
  event: "/app/events",
  recording: "/app/events",
  portfolio_review: "/app/grow/portfolio-review",
  mentorship: "/app/grow/mentorship"
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
  if (latest && !latest.review_report_url) return "already had an open review";
  const { error } = await db.from("evolve_portfolio_reviews").insert({
    user_id: profile.id,
    name: profile.name || "",
    email: profile.email || "",
    review_status: "draft",
    attempt: (latest?.attempt || 0) + 1
  });
  if (error) throw new Error(error.message);
  return `review ${(latest?.attempt || 0) + 1} opened`;
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
      const { error } = await db.from("portfolio_review_payments").insert({
        user_id: userId,
        name: profile.name || "",
        email: profile.email || "",
        amount: amount * 100, // this table stores paise
        phone: "",
        razorpay_order_id: manualOrderId(),
        razorpay_payment_id: audit,
        status: "success"
      });
      if (error) throw new Error(error.message);
      return await openReviewCycle(db, profile);
    }

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
  mentorship: "Your mentorship is set up and ready to go."
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

// body: { people: [{ email, name }], grant: { kind, plan?, event_id?, mentorship_plan?, tier? },
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
