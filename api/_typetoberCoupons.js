// api/_typetoberCoupons.js
// Typetober winner coupons: a free annual evolve plan (see
// supabase/migrations/typetober_coupons.sql). Underscore prefix = not its
// own Vercel function; ops are routed from api/admin.js:
//
//   coupon_issue   Evolve admins → one code per winner (name + email)
//   coupon_delete  Evolve admins → removes a code that hasn't been used
//   coupon_self    signed in     → the caller's unused code, matched by email
//   coupon_redeem  signed in     → spends a code on the caller's account
//
// A code only works for the account signed in with the winner's (verified)
// email, so passing it on to someone else does nothing. Each code works once.

import crypto from "node:crypto";
import { grantPlan } from "./_membership.js";

// no 0/O/1/I, so a DMed code survives being retyped
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function newCode() {
  const bytes = crypto.randomBytes(6);
  let s = "";
  for (const b of bytes) s += ALPHABET[b % ALPHABET.length];
  return `TYPE-${s}`;
}

const normCode = (code) => String(code || "").trim().toUpperCase();

// Winners already on the list keep the code they have.
export async function issueCoupons(db, body) {
  const people = (body?.people || [])
    .map((p) => ({ name: String(p?.name || "").trim(), email: String(p?.email || "").trim().toLowerCase() }))
    .filter((p) => p.email);
  if (!people.length) throw new Error("add at least one email");

  const { data: existing, error } = await db
    .from("typetober_coupons")
    .select("email, code")
    .in("email", people.map((p) => p.email));
  if (error) throw new Error(error.message);
  const had = new Map((existing || []).map((r) => [r.email, r.code]));

  const results = [];
  for (const p of people) {
    if (had.has(p.email)) {
      results.push({ email: p.email, code: had.get(p.email), existed: true });
      continue;
    }
    // retry on the (unlikely) code collision
    let made = null;
    for (let i = 0; i < 3 && !made; i++) {
      const { data, error: insErr } = await db
        .from("typetober_coupons")
        .insert({ name: p.name || null, email: p.email, code: newCode() })
        .select("code")
        .single();
      if (data) made = data;
      else if (insErr && insErr.code !== "23505") {
        results.push({ email: p.email, error: insErr.message });
        break;
      }
    }
    if (made) {
      had.set(p.email, made.code);
      results.push({ email: p.email, code: made.code });
    } else if (!results.some((r) => r.email === p.email)) {
      results.push({ email: p.email, error: "couldn't make a code, try again" });
    }
  }
  return { results };
}

export async function deleteCoupon(db, body) {
  if (!body?.id) throw new Error("bad coupon");
  const { data, error } = await db
    .from("typetober_coupons")
    .delete()
    .eq("id", body.id)
    .is("redeemed_at", null)
    .select("id")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("already redeemed, revoke the plan from Grant access instead");
  return { ok: true };
}

export async function couponForUser(db, user) {
  const email = user.email?.toLowerCase();
  if (!email || !user.email_confirmed_at) return { coupon: null };
  const { data } = await db
    .from("typetober_coupons")
    .select("code, plan")
    .eq("email", email)
    .is("redeemed_at", null)
    .maybeSingle();
  return { coupon: data || null };
}

export async function redeemCoupon(db, user, body) {
  const code = normCode(body?.code);
  if (!code) throw new Error("enter a coupon code");
  const email = user.email?.toLowerCase();
  if (!email || !user.email_confirmed_at) throw new Error("this code isn't for this account");

  // claim it first, so two tabs can't both spend it — and only for the
  // account the code was issued to
  const { data: claimed, error } = await db
    .from("typetober_coupons")
    .update({ redeemed_at: new Date().toISOString(), redeemed_by: user.id })
    .eq("code", code)
    .eq("email", email)
    .is("redeemed_at", null)
    .select("id, plan")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!claimed) {
    const { data: row } = await db.from("typetober_coupons").select("email, redeemed_at").eq("code", code).maybeSingle();
    if (!row) throw new Error("that code doesn't exist");
    if (row.email !== email) throw new Error("this code isn't for this account");
    throw new Error("this code has already been used");
  }

  try {
    // same row a manual grant writes, so it can be revoked from Grant access
    const { error: insErr } = await db.from("purchases").insert({
      user_id: user.id,
      kind: "plan",
      plan: claimed.plan,
      title: `${claimed.plan === "annual" ? "Annual" : "Monthly"} plan`,
      amount: 0,
      razorpay_order_id: `manual_${crypto.randomUUID()}`,
      razorpay_payment_id: `manual: coupon ${code} · typetober winner`,
      status: "success"
    });
    if (insErr) throw new Error(insErr.message);
    await grantPlan(db, user.id, claimed.plan);
  } catch (err) {
    await db.from("typetober_coupons").update({ redeemed_at: null, redeemed_by: null }).eq("id", claimed.id);
    throw err;
  }
  // the app patches these in place instead of reloading the whole profile
  const { data: profile } = await db
    .from("profiles")
    .select("plan, plan_expires_at, review_credits")
    .eq("id", user.id)
    .single();
  return { ok: true, plan: claimed.plan, profile };
}
