import { useEffect, useMemo, useState } from "react";
import { supabaseAdmin, callAdminApi } from "../../supabaseAdminClient";

// Typetober winners → a coupon for a free annual evolve plan. Paste the
// winners, each gets a code; they see it in the app's membership pop-ups
// and redeem it there. The codes are listed here so they can be DMed too —
// a code only works for the account with the winner's email.
// Server side: api/_typetoberCoupons.js (ops "coupon_issue" / "coupon_delete").

const Y = "#FFD007";
const inputStyle = { backgroundColor: "#0d0d0d", border: "1px solid #262626" };
const labelStyle = { color: "#666" };

const EMAIL_RE = /[^\s<>(),;:]+@[^\s<>(),;:]+\.[^\s<>(),;:]+/;

// same paste formats as GrantAccessTab: "Jane Doe - jane@x.com", "jane@x.com"
function parsePeople(text) {
  return text
    .split(/\n/)
    .map((line) => {
      const match = line.match(EMAIL_RE);
      if (!match) return null;
      const name = line
        .slice(0, match.index)
        .split(/\s-|:|,|\t|</)[0]
        .replace(/[-–—]\s*$/, "")
        .trim();
      return { email: match[0].toLowerCase(), name };
    })
    .filter(Boolean);
}

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function TypetoberCouponsTab() {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState(null);
  const [reload, setReload] = useState(0);
  const [copied, setCopied] = useState(null);

  const people = useMemo(() => parsePeople(text), [text]);

  useEffect(() => {
    let cancelled = false;
    supabaseAdmin
      .from("typetober_coupons")
      .select("id, code, name, email, plan, created_at, redeemed_at, profiles:redeemed_by(name, email)")
      .order("created_at", { ascending: false })
      .then(({ data, error: err }) => {
        if (cancelled) return;
        if (err) setError(err.message);
        setRows(data || []);
      });
    return () => {
      cancelled = true;
    };
  }, [reload]);

  async function issue() {
    if (!people.length || busy) return;
    setBusy(true);
    setError("");
    const res = await callAdminApi({ op: "coupon_issue", people });
    setBusy(false);
    if (res.error) return setError(res.error.message);
    const failed = (res.results || []).filter((r) => r.error);
    if (failed.length) setError(failed.map((r) => `${r.email}: ${r.error}`).join(" · "));
    else setText("");
    setReload((k) => k + 1);
  }

  async function remove(c) {
    if (!window.confirm(`Delete the coupon for ${c.email}?`)) return;
    const res = await callAdminApi({ op: "coupon_delete", id: c.id });
    if (res.error) setError(res.error.message);
    setReload((k) => k + 1);
  }

  async function copy(code) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied((c) => (c === code ? null : c)), 1500);
    } catch {
      /* clipboard blocked — the code is on screen anyway */
    }
  }

  const used = rows?.filter((r) => r.redeemed_at).length || 0;

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="rounded-xl p-4 flex flex-col gap-3" style={inputStyle}>
        <p className="text-sm font-bold text-white">Typetober winner coupons</p>
        <p className="text-xs" style={labelStyle}>
          Each winner gets a code for a free annual evolve plan. They’ll see it in the app’s trial and
          plan pop-ups. A code only works for the account signed in with that email, so use the email
          they sign in to evolve with. One person per line: “Name - email”, or just the email.
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder={"Jane Doe - jane@example.com\nsam@example.com"}
          className="w-full text-sm text-white rounded-lg px-3 py-2 outline-none"
          style={inputStyle}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button
          type="button"
          onClick={issue}
          disabled={busy || !people.length}
          className="self-start text-sm font-bold rounded-lg px-5 py-2.5 disabled:opacity-40"
          style={{ background: Y, color: "#000" }}
        >
          {busy ? "issuing…" : `issue ${people.length || ""} ${people.length === 1 ? "coupon" : "coupons"}`}
        </button>
      </div>

      <div className="rounded-xl p-4" style={inputStyle}>
        <p className="text-sm font-bold text-white mb-3">
          Coupons
          {rows?.length ? (
            <span className="font-normal text-white/40"> · {rows.length} issued · {used} redeemed</span>
          ) : null}
        </p>
        {rows === null && <p className="text-xs" style={labelStyle}>loading…</p>}
        {rows?.length === 0 && <p className="text-xs" style={labelStyle}>none yet</p>}
        <div className="flex flex-col divide-y divide-white/5">
          {rows?.map((c) => (
            <div key={c.id} className="py-2 text-xs flex flex-wrap items-center gap-x-4 gap-y-0.5">
              <span className="text-white/40 w-24 shrink-0">{fmtDate(c.created_at)}</span>
              <span className="text-white font-semibold">{c.name || c.email}</span>
              {c.name && <span className="text-white/40">{c.email}</span>}
              <button
                type="button"
                onClick={() => copy(c.code)}
                className="font-mono font-bold"
                style={{ color: Y }}
                title="copy"
              >
                {copied === c.code ? "copied" : c.code}
              </button>
              {c.redeemed_at ? (
                <span className="ml-auto text-green-400">
                  redeemed {fmtDate(c.redeemed_at)}
                  {c.profiles?.email && c.profiles.email !== c.email ? ` by ${c.profiles.email}` : ""}
                </span>
              ) : (
                <>
                  <span className="ml-auto text-white/50">not used yet</span>
                  <button type="button" onClick={() => remove(c)} className="text-red-400 hover:text-red-300">
                    delete
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
