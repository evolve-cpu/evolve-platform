import { useEffect, useMemo, useState } from "react";
import { supabaseAdmin, callAdminApi } from "../../supabaseAdminClient";

// Manual access: for people whose Razorpay payment failed and who paid
// another way (UPI / bank transfer), or who get something free (demos,
// partner colleges). Writes the same rows a real payment would, creates
// accounts that don't exist yet and can email a one-click sign-in link.
// Server side: api/_manualGrant.js (op "grant_access", Evolve admins only).

const Y = "#FFD007";
const inputStyle = { backgroundColor: "#0d0d0d", border: "1px solid #262626" };
const labelStyle = { color: "#666" };
const fieldClass = "w-full text-sm text-white rounded-lg px-3 py-2 outline-none";

const KINDS = [
  { id: "portfolio_review", label: "portfolio review" },
  { id: "plan", label: "membership plan" },
  { id: "event", label: "event (live)" },
  { id: "recording", label: "event recording" },
  { id: "mentorship", label: "mentorship (individual)" },
  { id: "none", label: "nothing, just an account + sign-in link" }
];

const EMAIL_RE = /[^\s<>(),;:]+@[^\s<>(),;:]+\.[^\s<>(),;:]+/;

// One person per line, in whatever shape it was pasted:
//   "Jane Doe - jane@x.com", "Jane Doe - M.Des: jane@x.com", "jane@x.com"
function parsePeople(text) {
  return text
    .split(/\n/)
    .map((line) => {
      const match = line.match(EMAIL_RE);
      if (!match) return null;
      const before = line.slice(0, match.index);
      const name = before
        .split(/\s-|:|,|\t|</)[0]
        .replace(/[-–—]\s*$/, "")
        .trim();
      return { email: match[0].toLowerCase(), name };
    })
    .filter(Boolean);
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-semibold mb-1 block" style={labelStyle}>
        {label}
      </label>
      {children}
    </div>
  );
}

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

function RecentGrants({ refreshKey }) {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const manual = (q) => q.like("razorpay_order_id", "manual_%").order("created_at", { ascending: false }).limit(50);
    Promise.all([
      manual(supabaseAdmin.from("purchases").select("created_at, kind, plan, title, amount, razorpay_payment_id, profiles(name, email)")),
      manual(supabaseAdmin.from("portfolio_review_payments").select("created_at, name, email, amount, razorpay_payment_id")),
      manual(supabaseAdmin.from("mentorship_enrollments").select("created_at, plan, amount, razorpay_payment_id, profiles(name, email)"))
    ]).then(([p, r, m]) => {
      if (cancelled) return;
      const all = [
        ...(p.data || []).map((x) => ({
          at: x.created_at,
          who: x.profiles?.name || x.profiles?.email,
          email: x.profiles?.email,
          what: x.kind === "plan" ? `${x.plan} plan` : `${x.kind}: ${x.title}`,
          amount: x.amount,
          audit: x.razorpay_payment_id
        })),
        ...(r.data || []).map((x) => ({
          at: x.created_at,
          who: x.name || x.email,
          email: x.email,
          what: "portfolio review",
          amount: Math.round((x.amount || 0) / 100),
          audit: x.razorpay_payment_id
        })),
        ...(m.data || []).map((x) => ({
          at: x.created_at,
          who: x.profiles?.name || x.profiles?.email,
          email: x.profiles?.email,
          what: `mentorship (${String(x.plan).replace("_", " ")})`,
          amount: x.amount,
          audit: x.razorpay_payment_id
        }))
      ].sort((a, b) => new Date(b.at) - new Date(a.at));
      setRows(all);
    });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <div className="rounded-xl p-4" style={inputStyle}>
      <p className="text-sm font-bold text-white mb-3">Recent manual grants</p>
      {rows === null && <p className="text-xs" style={labelStyle}>loading…</p>}
      {rows?.length === 0 && <p className="text-xs" style={labelStyle}>none yet</p>}
      <div className="flex flex-col divide-y divide-white/5">
        {rows?.map((g, i) => (
          <div key={i} className="py-2 text-xs flex flex-wrap gap-x-4 gap-y-0.5">
            <span className="text-white/40 w-24 shrink-0">{fmtDate(g.at)}</span>
            <span className="text-white font-semibold">{g.who}</span>
            {g.email && g.email !== g.who && <span className="text-white/40">{g.email}</span>}
            <span style={{ color: Y }}>{g.what}</span>
            <span className="text-white/70">{g.amount ? `₹${Number(g.amount).toLocaleString("en-IN")}` : "free"}</span>
            <span className="text-white/40 basis-full">{g.audit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GrantAccessTab() {
  const [peopleText, setPeopleText] = useState("");
  const [kind, setKind] = useState("portfolio_review");
  const [plan, setPlan] = useState("annual");
  const [eventId, setEventId] = useState("");
  const [mentorshipPlan, setMentorshipPlan] = useState("core");
  const [tier, setTier] = useState("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [sendLink, setSendLink] = useState(true);
  const [events, setEvents] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const people = useMemo(() => parsePeople(peopleText), [peopleText]);

  useEffect(() => {
    supabaseAdmin
      .from("events")
      .select("id, title, start_time")
      .order("start_time", { ascending: false })
      .limit(100)
      .then(({ data }) => setEvents(data || []));
  }, []);

  const needsEvent = kind === "event" || kind === "recording";
  const kindLabel = KINDS.find((k) => k.id === kind)?.label;

  async function submit() {
    setError("");
    setResults(null);
    if (!people.length) return setError("add at least one email");
    if (needsEvent && !eventId) return setError("pick an event");
    const amt = Number(amount) || 0;
    const summary = [
      `Grant "${kindLabel}" to ${people.length} ${people.length === 1 ? "person" : "people"}`,
      amt ? `₹${amt} received each` : "for free",
      sendLink ? "and email them a sign-in link" : "(no email)"
    ].join(", ");
    if (!window.confirm(`${summary}?`)) return;

    setBusy(true);
    const res = await callAdminApi({
      op: "grant_access",
      people,
      grant: {
        kind,
        plan,
        event_id: eventId || null,
        mentorship_plan: mentorshipPlan,
        tier: tier || null
      },
      amount: amt,
      reference,
      note,
      send_link: sendLink
    });
    setBusy(false);
    if (res.error) return setError(res.error.message);
    setResults(res.results);
    setRefreshKey((k) => k + 1);
    if (res.results.every((r) => r.ok)) setPeopleText("");
  }

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <div>
        <h2 className="text-lg font-bold text-white">Grant access</h2>
        <p className="text-xs mt-1" style={labelStyle}>
          For payments taken outside the platform, or free access. Creates the
          account if it doesn't exist and unlocks exactly what a successful
          payment would.
        </p>
      </div>

      <div className="rounded-xl p-4 flex flex-col gap-4" style={inputStyle}>
        <Field label="People (one per line, name optional: “Jane Doe - jane@x.com”)">
          <textarea
            rows={5}
            value={peopleText}
            onChange={(e) => setPeopleText(e.target.value)}
            placeholder={"Jane Doe - jane@example.com\nsam@example.com"}
            className={`${fieldClass} font-mono`}
            style={inputStyle}
          />
        </Field>
        {people.length > 0 && (
          <div className="flex flex-col gap-0.5">
            {people.map((p) => (
              <p key={p.email} className="text-xs">
                <span className="text-white">{p.name || <span style={labelStyle}>no name</span>}</span>
                <span className="text-white/40"> · {p.email}</span>
              </p>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="What to grant">
            <select value={kind} onChange={(e) => setKind(e.target.value)} className={fieldClass} style={inputStyle}>
              {KINDS.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.label}
                </option>
              ))}
            </select>
          </Field>

          {kind === "plan" && (
            <Field label="Plan">
              <select value={plan} onChange={(e) => setPlan(e.target.value)} className={fieldClass} style={inputStyle}>
                <option value="monthly">monthly</option>
                <option value="annual">annual (includes 1 free review)</option>
              </select>
            </Field>
          )}

          {needsEvent && (
            <Field label="Event">
              <select value={eventId} onChange={(e) => setEventId(e.target.value)} className={fieldClass} style={inputStyle}>
                <option value="">pick an event…</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                    {ev.start_time ? ` · ${fmtDate(ev.start_time)}` : ""}
                  </option>
                ))}
              </select>
            </Field>
          )}

          {kind === "mentorship" && (
            <Field label="Mentorship plan">
              <select
                value={mentorshipPlan}
                onChange={(e) => setMentorshipPlan(e.target.value)}
                className={fieldClass}
                style={inputStyle}
              >
                <option value="core">core</option>
                <option value="application_support">application support</option>
              </select>
            </Field>
          )}

          <Field label="Student or professional">
            <select value={tier} onChange={(e) => setTier(e.target.value)} className={fieldClass} style={inputStyle}>
              <option value="">leave as is</option>
              <option value="student">student</option>
              <option value="professional">professional</option>
            </select>
          </Field>

          <Field label="Amount received per person (₹, 0 = free)">
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className={fieldClass}
              style={inputStyle}
            />
          </Field>

          <Field label="Payment reference (UPI / bank txn id)">
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. UPI 4183…"
              className={fieldClass}
              style={inputStyle}
            />
          </Field>

          <Field label="Note">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. razorpay failed, paid via UPI"
              className={fieldClass}
              style={inputStyle}
            />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
          <input type="checkbox" checked={sendLink} onChange={(e) => setSendLink(e.target.checked)} />
          Email them a one-click sign-in link
        </label>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          type="button"
          onClick={submit}
          disabled={busy || !people.length}
          className="self-start text-sm font-bold rounded-lg px-5 py-2.5 disabled:opacity-40"
          style={{ background: Y, color: "#000" }}
        >
          {busy ? "granting…" : `grant to ${people.length || ""} ${people.length === 1 ? "person" : "people"}`}
        </button>

        {results && (
          <div className="flex flex-col gap-1 pt-2 border-t border-white/5">
            {results.map((r) => (
              <p key={r.email} className="text-xs">
                <span className={r.ok ? "text-green-400" : "text-red-400"}>{r.ok ? "✓" : "✗"}</span>{" "}
                <span className="text-white">{r.email}</span>
                <span className="text-white/50">
                  {r.ok
                    ? ` · ${r.created ? "account created · " : ""}${r.granted}${r.emailed ? " · link emailed" : ""}`
                    : ` · ${r.error}`}
                </span>
                {r.emailError && <span className="text-red-400"> · email failed: {r.emailError}</span>}
              </p>
            ))}
          </div>
        )}
      </div>

      <RecentGrants refreshKey={refreshKey} />
    </div>
  );
}
