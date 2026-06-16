import { useEffect, useRef, useState } from "react";
import { supabaseAdmin } from "../../supabaseAdminClient";

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";
const BREVO_KEY = import.meta.env.VITE_BREVO_API_KEY;
const ANU_ORIGIN = "https://anu.evolvedesign.academy";

/* ── small helpers ── */
function parseCSV(raw) {
  const lines = raw.trim().split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/\s+/g, "_"));
  return lines.slice(1).map(line => {
    const vals = line.split(",").map(v => v.trim());
    const row = {};
    headers.forEach((h, i) => { row[h] = vals[i] ?? ""; });
    return row;
  });
}

async function sendBrevoEmail({ to, subject, htmlContent }) {
  if (!BREVO_KEY) return { error: "VITE_BREVO_API_KEY not set" };
  const res = await fetch(BREVO_URL, {
    method: "POST",
    headers: { "api-key": BREVO_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: { name: "Anant × evolve", email: "noreply@evolvedesign.academy" },
      to: [{ email: to }],
      subject,
      htmlContent
    })
  });
  if (!res.ok) { const t = await res.text(); return { error: t }; }
  return { ok: true };
}

async function sendInviteEmail({ email, magicLink, role }) {
  const isStudent = role === "student";
  const subject = isStudent
    ? "Your portfolio review portal is ready, Anant National University x Evolve"
    : "Your admin portal access, Anant National University x Evolve";

  const headline = isStudent
    ? "Your portfolio review portal is ready"
    : `Your ${role === "uni_admin" ? "admin" : "faculty"} portal is ready`;

  const body = isStudent
    ? "Your portfolio review portal at Anant National University is ready. Click below to sign in and submit your portfolio for expert feedback. No password needed."
    : "You've been invited to the Anant National University x evolve admin panel. Click below to access your dashboard. No password needed.";

  const cta = isStudent ? "Open my portfolio review portal" : "Access my dashboard";
  const link = magicLink || (isStudent ? `${ANU_ORIGIN}/signin` : `${ANU_ORIGIN}/admin`);

  const htmlContent = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:40px 32px;background:#060c17;color:#fff;border-radius:16px">
      <img src="${ANU_ORIGIN}/images/anant-logo.png" alt="Anant National University" style="height:40px;margin-bottom:32px;display:block" />
      <p style="color:rgba(255,255,255,0.5);font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 10px">Anant National University x evolve</p>
      <h1 style="font-size:24px;font-weight:800;letter-spacing:-0.02em;line-height:1.25;margin:0 0 16px">${headline}</h1>
      <p style="font-size:15px;line-height:1.7;color:rgba(255,255,255,0.72);margin:0 0 32px">${body}</p>
      <a href="${link}" style="display:inline-block;background:#2563eb;color:#fff;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;text-decoration:none">${cta}</a>
      <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:36px 0 20px" />
      <p style="font-size:12px;color:rgba(255,255,255,0.28);margin:0">This link is for ${email}. If this wasn't you, ignore this email.</p>
    </div>`;

  return sendBrevoEmail({ to: email, subject, htmlContent });
}

/* ── single-person invite ── */
async function generateAndSend({ email, role }) {
  const redirectTo = role === "student"
    ? `${ANU_ORIGIN}/portfolio-review/form`
    : `${ANU_ORIGIN}/admin/dashboard`;

  let magicLink = null;
  try {
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink", email, options: { redirectTo }
    });
    if (!error && data?.properties?.action_link) magicLink = data.properties.action_link;
  } catch {}

  return sendInviteEmail({ email, magicLink, role });
}

/* ═══════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════ */

function Badge({ label, color }) {
  const colors = {
    green:  { bg: "rgba(34,197,94,0.12)",  text: "#4ade80",  bord: "rgba(34,197,94,0.25)"  },
    amber:  { bg: "rgba(251,191,36,0.1)",  text: "#fbbf24",  bord: "rgba(251,191,36,0.2)"  },
    gray:   { bg: "rgba(255,255,255,0.05)", text: "rgba(255,255,255,0.35)", bord: "rgba(255,255,255,0.1)" }
  };
  const c = colors[color] || colors.gray;
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold border"
      style={{ background: c.bg, color: c.text, borderColor: c.bord }}>{label}</span>
  );
}

function LoadingDot() {
  return (
    <span className="inline-flex items-center gap-1">
      {[0,1,2].map(i => (
        <span key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"
          style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </span>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */

export default function AnantPeopleManager({ dark = true, readOnly = false }) {
  const [tab, setTab]           = useState("students");
  const [people, setPeople]     = useState({ students: null, faculty: null, admins: null });
  const [loading, setLoading]   = useState({ students: false, faculty: false, admins: false });
  const [csvRows, setCsvRows]   = useState([]);
  const [csvErr,  setCsvErr]    = useState("");
  const [importing, setImporting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [sending, setSending]   = useState({});
  const [bulkSending, setBulkSending] = useState(false);
  const [toast, setToast]       = useState(null);
  const fileRef = useRef();

  /* ── theme ── */
  const bg       = dark ? "#060c17"   : "#f8fafc";
  const cardBg   = dark ? "#071022"   : "#ffffff";
  const border   = dark ? "#0d1f3c"   : "#e2e8f0";
  const text      = dark ? "#ffffff"   : "#0f172a";
  const sub      = dark ? "rgba(255,255,255,0.45)" : "#64748b";
  const inputBg  = dark ? "rgba(255,255,255,0.06)" : "#f1f5f9";
  const inputBord= dark ? "rgba(255,255,255,0.12)" : "#e2e8f0";
  const accent   = "#2563eb";
  const rowBord  = dark ? "#0d1f3c"   : "#f1f5f9";

  // Auto-load the first tab on mount
  useEffect(() => { loadTab("students"); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function showToast(msg, type = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  /* ── load people ── */
  async function loadTab(t) {
    if (people[t] !== null) return;
    setLoading(l => ({ ...l, [t]: true }));
    const table = t === "students" ? "anu_students" : t === "faculty" ? "anu_faculty" : "anu_admins";
    const { data, error } = await supabaseAdmin.from(table).select("*").order("created_at", { ascending: false });
    if (!error) setPeople(p => ({ ...p, [t]: data || [] }));
    setLoading(l => ({ ...l, [t]: false }));
  }

  function switchTab(t) {
    setTab(t);
    setCsvRows([]); setCsvErr(""); setShowForm(false); setFormData({});
    loadTab(t);
  }

  /* ── CSV handling ── */
  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvErr(""); setCsvRows([]);
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const rows = parseCSV(ev.target.result);
        if (!rows.length) { setCsvErr("CSV is empty or unreadable."); return; }
        setCsvRows(rows);
      } catch { setCsvErr("Could not parse CSV."); }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const CSV_FIELDS = {
    students: ["first_name", "last_name", "anu_email", "program", "stream", "year"],
    faculty:  ["first_name", "last_name", "anu_email", "designation", "program", "stream"],
    admins:   ["first_name", "last_name", "anu_email", "designation"]
  };

  function normRow(row, t) {
    const fields = CSV_FIELDS[t];
    const out = {};
    fields.forEach(f => { out[f] = row[f] || ""; });
    return out;
  }

  async function importCSV() {
    if (!csvRows.length) return;
    setImporting(true);
    const table = tab === "students" ? "anu_students" : tab === "faculty" ? "anu_faculty" : "anu_admins";
    const rows  = csvRows.map(r => normRow(r, tab));
    const { error } = await supabaseAdmin.from(table).upsert(rows, { onConflict: "anu_email", ignoreDuplicates: false });
    setImporting(false);
    if (error) { setCsvErr(error.message); return; }
    showToast(`${rows.length} ${tab} imported.`);
    setCsvRows([]);
    setPeople(p => ({ ...p, [tab]: null }));
    loadTab(tab);
  }

  /* ── manual form ── */
  const FORM_FIELDS = {
    students: [
      { key: "first_name", label: "First Name", type: "text" },
      { key: "last_name",  label: "Last Name",  type: "text" },
      { key: "anu_email",  label: "ANU Email",  type: "email" },
      { key: "program",    label: "Program (BDes / BArch)", type: "text" },
      { key: "stream",     label: "Stream", type: "text" },
      { key: "year",       label: "Year (1–5)", type: "text" }
    ],
    faculty: [
      { key: "first_name",   label: "First Name",   type: "text" },
      { key: "last_name",    label: "Last Name",    type: "text" },
      { key: "anu_email",    label: "ANU Email",    type: "email" },
      { key: "designation",  label: "Designation",  type: "text" },
      { key: "program",      label: "Program (BDes / BArch)", type: "text" },
      { key: "stream",       label: "Stream", type: "text" }
    ],
    admins: [
      { key: "first_name",  label: "First Name",  type: "text" },
      { key: "last_name",   label: "Last Name",   type: "text" },
      { key: "anu_email",   label: "ANU Email",   type: "email" },
      { key: "designation", label: "Designation", type: "text" }
    ]
  };

  async function handleManualAdd(e) {
    e.preventDefault();
    const table = tab === "students" ? "anu_students" : tab === "faculty" ? "anu_faculty" : "anu_admins";
    const { error } = await supabaseAdmin.from(table).upsert(formData, { onConflict: "anu_email" });
    if (error) { showToast(error.message, "err"); return; }
    showToast("Person added.");
    setFormData({}); setShowForm(false);
    setPeople(p => ({ ...p, [tab]: null }));
    loadTab(tab);
  }

  /* ── invites ── */
  async function sendOneInvite(person) {
    const role = tab === "students" ? "student" : "admin";
    setSending(s => ({ ...s, [person.id]: true }));
    const result = await generateAndSend({ email: person.anu_email, role });
    setSending(s => ({ ...s, [person.id]: false }));
    if (result.error) { showToast(`Failed: ${result.error}`, "err"); return; }
    showToast(`Invite sent to ${person.anu_email}`);
    // mark invite_sent_at
    const table = tab === "students" ? "anu_students" : tab === "faculty" ? "anu_faculty" : "anu_admins";
    await supabaseAdmin.from(table).update({ invite_sent_at: new Date().toISOString() }).eq("id", person.id);
    setPeople(p => ({
      ...p,
      [tab]: (p[tab] || []).map(x => x.id === person.id ? { ...x, invite_sent_at: new Date().toISOString() } : x)
    }));
  }

  async function sendBulkInvites() {
    const list = (people[tab] || []).filter(p => !p.invite_accepted_at);
    if (!list.length) { showToast("Everyone has already accepted their invite."); return; }
    setBulkSending(true);
    const role = tab === "students" ? "student" : "admin";
    let sent = 0, failed = 0;
    for (const person of list) {
      const result = await generateAndSend({ email: person.anu_email, role });
      if (result.ok) sent++; else failed++;
    }
    setBulkSending(false);
    showToast(`${sent} invites sent${failed ? `, ${failed} failed` : ""}.`, failed ? "warn" : "ok");
    setPeople(p => ({ ...p, [tab]: null }));
    loadTab(tab);
  }

  /* ── table columns ── */
  const cols = {
    students: ["Name", "Email", "Program", "Stream", "Year", "Status", ""],
    faculty:  ["Name", "Email", "Designation", "Program", "Stream", "Status", ""],
    admins:   ["Name", "Email", "Designation", "Status", ""]
  };

  function statusBadge(p) {
    if (p.invite_accepted_at) return <Badge label="accepted" color="green" />;
    if (p.invite_sent_at)     return <Badge label="invited"  color="amber" />;
    return <Badge label="pending" color="gray" />;
  }

  function renderRow(p) {
    const isSending = sending[p.id];
    if (tab === "students") return (
      <tr key={p.id} className="border-b" style={{ borderColor: rowBord }}>
        <td className="py-3 px-4 text-sm font-semibold" style={{ color: text }}>{p.first_name} {p.last_name}</td>
        <td className="py-3 px-4 text-sm" style={{ color: sub }}>{p.anu_email}</td>
        <td className="py-3 px-4 text-sm" style={{ color: sub }}>{p.program}</td>
        <td className="py-3 px-4 text-sm" style={{ color: sub }}>{p.stream}</td>
        <td className="py-3 px-4 text-sm" style={{ color: sub }}>{p.year}</td>
        <td className="py-3 px-4">{statusBadge(p)}</td>
        <td className="py-3 px-4 text-right">
          {!readOnly && !p.invite_accepted_at && (
            <button onClick={() => sendOneInvite(p)} disabled={isSending}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border disabled:opacity-40 transition-opacity"
              style={{ borderColor: accent, color: "#60a5fa" }}>
              {isSending ? "sending…" : p.invite_sent_at ? "resend" : "invite"}
            </button>
          )}
        </td>
      </tr>
    );
    if (tab === "faculty") return (
      <tr key={p.id} className="border-b" style={{ borderColor: rowBord }}>
        <td className="py-3 px-4 text-sm font-semibold" style={{ color: text }}>{p.first_name} {p.last_name}</td>
        <td className="py-3 px-4 text-sm" style={{ color: sub }}>{p.anu_email}</td>
        <td className="py-3 px-4 text-sm" style={{ color: sub }}>{p.designation}</td>
        <td className="py-3 px-4 text-sm" style={{ color: sub }}>{p.program}</td>
        <td className="py-3 px-4 text-sm" style={{ color: sub }}>{p.stream}</td>
        <td className="py-3 px-4">{statusBadge(p)}</td>
        <td className="py-3 px-4 text-right">
          {!readOnly && !p.invite_accepted_at && (
            <button onClick={() => sendOneInvite(p)} disabled={isSending}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border disabled:opacity-40 transition-opacity"
              style={{ borderColor: accent, color: "#60a5fa" }}>
              {isSending ? "sending…" : p.invite_sent_at ? "resend" : "invite"}
            </button>
          )}
        </td>
      </tr>
    );
    // admins
    return (
      <tr key={p.id} className="border-b" style={{ borderColor: rowBord }}>
        <td className="py-3 px-4 text-sm font-semibold" style={{ color: text }}>{p.first_name} {p.last_name}</td>
        <td className="py-3 px-4 text-sm" style={{ color: sub }}>{p.anu_email}</td>
        <td className="py-3 px-4 text-sm" style={{ color: sub }}>{p.designation}</td>
        <td className="py-3 px-4">{statusBadge(p)}</td>
        <td className="py-3 px-4 text-right">
          {!readOnly && !p.invite_accepted_at && (
            <button onClick={() => sendOneInvite(p)} disabled={isSending}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border disabled:opacity-40 transition-opacity"
              style={{ borderColor: accent, color: "#60a5fa" }}>
              {isSending ? "sending…" : p.invite_sent_at ? "resend" : "invite"}
            </button>
          )}
        </td>
      </tr>
    );
  }

  const list = people[tab];

  return (
    <div className="relative flex flex-col gap-6" style={{ color: text }}>

      {/* toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-xl"
          style={{
            background: toast.type === "err" ? "#ef4444" : toast.type === "warn" ? "#f59e0b" : "#22c55e",
            color: "#fff"
          }}>
          {toast.msg}
        </div>
      )}

      {/* section header + sub-tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-extrabold text-xl" style={{ color: text, letterSpacing: "-0.02em" }}>people</h2>
          <p className="text-xs mt-0.5" style={{ color: sub }}>manage students, faculty, and admins — upload CSV or add individually</p>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl border" style={{ borderColor: border, background: inputBg }}>
          {["students", "faculty", "admins"].map(t => (
            <button key={t} onClick={() => switchTab(t)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors"
              style={tab === t
                ? { background: accent, color: "#fff" }
                : { color: sub }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* actions row — only evolve admin can add/import/invite */}
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ borderColor: border, color: text, background: cardBg }}>
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
              <path d="M10 3v10M6 7l4-4 4 4M4 14v1a2 2 0 002 2h8a2 2 0 002-2v-1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            upload CSV
          </button>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />

          <button
            onClick={() => { setShowForm(v => !v); setFormData({}); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ borderColor: border, color: text, background: cardBg }}>
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
              <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            add one
          </button>

          <button
            onClick={sendBulkInvites}
            disabled={bulkSending || !list?.length}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-40 hover:opacity-90"
            style={{ background: accent, color: "#fff" }}>
            {bulkSending ? <LoadingDot /> : (
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                <path d="M2 3l16 7-16 7V12l11-2-11-2V3z" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
              </svg>
            )}
            {bulkSending ? "sending…" : "send invites to all pending"}
          </button>
        </div>
      )}

      {/* CSV preview — only shown to evolve admin */}
      {!readOnly && csvRows.length > 0 && (
        <div className="rounded-2xl border p-5 flex flex-col gap-4" style={{ borderColor: border, background: cardBg }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold" style={{ color: text }}>{csvRows.length} rows ready to import</p>
            <div className="flex gap-2">
              <button onClick={() => setCsvRows([])}
                className="text-xs px-3 py-1.5 rounded-lg border"
                style={{ borderColor: border, color: sub }}>discard</button>
              <button onClick={importCSV} disabled={importing}
                className="text-xs font-bold px-4 py-1.5 rounded-lg disabled:opacity-40"
                style={{ background: accent, color: "#fff" }}>
                {importing ? "importing…" : "confirm import"}
              </button>
            </div>
          </div>
          {csvErr && <p className="text-red-400 text-xs">{csvErr}</p>}
          <div className="overflow-x-auto max-h-52 overflow-y-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  {Object.keys(csvRows[0]).map(h => (
                    <th key={h} className="text-left py-1.5 px-2 font-semibold" style={{ color: sub }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {csvRows.slice(0, 10).map((row, i) => (
                  <tr key={i} className="border-t" style={{ borderColor: rowBord }}>
                    {Object.values(row).map((v, j) => (
                      <td key={j} className="py-1.5 px-2" style={{ color: text }}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {csvRows.length > 10 && <p className="text-xs mt-2" style={{ color: sub }}>… and {csvRows.length - 10} more rows</p>}
          </div>
          <p className="text-xs" style={{ color: sub }}>
            Required columns for {tab}: <span style={{ color: text }}>{CSV_FIELDS[tab].join(", ")}</span>
          </p>
        </div>
      )}

      {/* CSV field guide — only shown to evolve admin */}
      {!readOnly && !csvRows.length && (
        <p className="text-xs" style={{ color: sub }}>
          CSV columns for <strong>{tab}</strong>: <span style={{ color: dark ? "rgba(255,255,255,0.6)" : "#475569" }}>{CSV_FIELDS[tab].join(", ")}</span>
        </p>
      )}

      {/* manual add form */}
      {!readOnly && showForm && (
        <form onSubmit={handleManualAdd}
          className="rounded-2xl border p-5 grid grid-cols-1 sm:grid-cols-2 gap-4"
          style={{ borderColor: border, background: cardBg }}>
          <h3 className="col-span-full text-sm font-bold" style={{ color: text }}>add {tab.slice(0, -1)}</h3>
          {FORM_FIELDS[tab].map(({ key, label, type }) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-xs font-semibold" style={{ color: sub }}>{label}</label>
              <input
                type={type}
                value={formData[key] || ""}
                onChange={e => setFormData(d => ({ ...d, [key]: e.target.value }))}
                required
                className="rounded-xl px-4 py-3 text-sm outline-none border"
                style={{ background: inputBg, borderColor: inputBord, color: text }}
              />
            </div>
          ))}
          <div className="col-span-full flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl text-sm border"
              style={{ borderColor: border, color: sub }}>cancel</button>
            <button type="submit"
              className="px-5 py-2 rounded-xl text-sm font-bold"
              style={{ background: accent, color: "#fff" }}>save</button>
          </div>
        </form>
      )}

      {/* people table */}
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: border, background: cardBg }}>
        {(loading[tab] || list === null) ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : list.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm" style={{ color: sub }}>no {tab} added yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b" style={{ borderColor: border }}>
                <tr>
                  {cols[tab].map(c => (
                    <th key={c} className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wide"
                      style={{ color: sub }}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map(p => renderRow(p))}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t" style={{ borderColor: border }}>
              <p className="text-xs" style={{ color: sub }}>
                {list.length} {tab} · {list.filter(p => p.invite_accepted_at).length} accepted · {list.filter(p => !p.invite_accepted_at).length} pending
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
