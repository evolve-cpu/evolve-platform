import { useEffect, useRef, useState } from "react";
import { supabaseAdmin } from "../../supabaseAdminClient";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const BREVO_PORTFOLIO_TEMPLATE_ID = import.meta.env.VITE_BREVO_PORTFOLIO_TEMPLATE_ID;

const Y = "#FFD007";
const GR = "#22c55e";

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function statusInfo(row) {
  if (row.review_report_url) return { label: "report ready", color: GR };
  if (row.review_status === "in_review") return { label: "call booked", color: "#60a5fa" };
  if (row.review_status === "pending") return { label: "awaiting call booking", color: Y };
  return { label: "in progress", color: "#94a3b8" };
}

function downloadCSV(filename, rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(","))
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── report PDF upload + send-ready-email ─────────────────────────────── */
function ReportUploadCell({ review, onDone }) {
  const [state, setState] = useState("idle"); // idle | uploading | sending | done | error
  const [msg, setMsg] = useState("");
  const inputRef = useRef(null);

  async function handle(file) {
    if (!file || file.type !== "application/pdf") {
      setState("error");
      setMsg("PDF only");
      return;
    }
    setState("uploading");
    setMsg("");

    const path = `${review.user_id}/report/${review.id}.pdf`;
    const { error: upErr } = await supabaseAdmin.storage
      .from("evolve-portfolio-reviews")
      .upload(path, file, { upsert: true, contentType: "application/pdf" });
    if (upErr) { setState("error"); setMsg(upErr.message); return; }

    const { data: urlData } = supabaseAdmin.storage.from("evolve-portfolio-reviews").getPublicUrl(path);
    const reportUrl = urlData?.publicUrl;

    const { error: dbErr } = await supabaseAdmin
      .from("evolve_portfolio_reviews")
      .update({ review_report_url: reportUrl })
      .eq("id", review.id);
    if (dbErr) { setState("error"); setMsg(dbErr.message); return; }

    setState("sending");
    const fnUrl = `${SUPABASE_URL}/functions/v1/send-review-email`;
    const res = await fetch(fnUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        to_email: review.email,
        to_name: review.name,
        report_url: reportUrl,
        template_id: BREVO_PORTFOLIO_TEMPLATE_ID,
        remarks: review.remarks || ""
      })
    }).catch(() => null);

    if (!res || !res.ok) {
      const err = await res?.json().catch(() => ({}));
      setState("error");
      setMsg(err?.error || err?.message || "email failed — report is saved, retry sending");
      onDone(review.id, reportUrl);
      return;
    }

    setState("done");
    setMsg("sent ✓");
    onDone(review.id, reportUrl);
  }

  if (review.review_report_url) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold" style={{ color: GR }}>report uploaded</span>
        <a href={review.review_report_url} target="_blank" rel="noreferrer" className="text-xs underline text-white/50">
          view pdf
        </a>
      </div>
    );
  }

  const busy = state === "uploading" || state === "sending";
  return (
    <div className="flex flex-col gap-1.5">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => handle(e.target.files?.[0])}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="text-xs font-bold rounded-lg px-3 py-1.5 disabled:opacity-50 w-fit"
        style={{ background: "rgba(255,208,7,0.15)", color: Y }}
      >
        {state === "uploading" ? "uploading…" : state === "sending" ? "sending email…" : "upload report PDF"}
      </button>
      {msg && <span className="text-[11px] text-red-400">{msg}</span>}
    </div>
  );
}

export default function EvolveReviewsPanel() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [remarksDraft, setRemarksDraft] = useState("");
  const [recordingDraft, setRecordingDraft] = useState("");
  const [savingField, setSavingField] = useState("");

  async function load() {
    const { data } = await supabaseAdmin
      .from("evolve_portfolio_reviews")
      .select("*")
      .order("created_at", { ascending: false });
    setRows(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setRemarksDraft(selected?.remarks || "");
    setRecordingDraft(selected?.meet_recording_url || "");
  }, [selected?.id]);

  function applyRowUpdate(id, patch) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setSelected((prev) => (prev?.id === id ? { ...prev, ...patch } : prev));
  }

  async function saveRemarks() {
    if (!selected) return;
    setSavingField("remarks");
    await supabaseAdmin.from("evolve_portfolio_reviews").update({ remarks: remarksDraft }).eq("id", selected.id);
    applyRowUpdate(selected.id, { remarks: remarksDraft });
    setSavingField("");
  }

  async function saveRecording() {
    if (!selected) return;
    setSavingField("recording");
    await supabaseAdmin
      .from("evolve_portfolio_reviews")
      .update({ meet_recording_url: recordingDraft.trim() })
      .eq("id", selected.id);
    applyRowUpdate(selected.id, { meet_recording_url: recordingDraft.trim() });
    setSavingField("");
  }

  const filtered = rows.filter((r) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (r.name || "").toLowerCase().includes(s) || (r.email || "").toLowerCase().includes(s);
  });

  function exportCSV() {
    downloadCSV(
      "evolve_portfolio_reviews.csv",
      rows.map((r) => ({
        name: r.name,
        email: r.email,
        status: statusInfo(r).label,
        resume: r.resume_value || "",
        portfolio: r.portfolio_value || "",
        remarks: r.remarks || "",
        submitted: fmtDate(r.created_at)
      }))
    );
  }

  if (loading) {
    return <div className="text-white/40 text-sm py-8">loading evolve portfolio reviews…</div>;
  }

  const QA = [
    ["hardest part about their portfolio", "q1"],
    ["what kind of work they're hoping to land", "q2"],
    ["what they'd like reviewed closely", "q3"],
    ["anything else", "q4"]
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="search by name or email…"
          className="text-sm rounded-lg px-3 py-2 outline-none border"
          style={{ background: "#111827", borderColor: "#1f2937", color: "#fff", minWidth: 240 }}
        />
        <button
          onClick={exportCSV}
          className="text-xs font-bold rounded-lg px-3 py-2"
          style={{ background: "#111827", color: Y }}
        >
          export CSV
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 min-h-0">
        <div className={`flex flex-col min-w-0 ${selected ? "md:w-[52%]" : "w-full"}`}>
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#1f2937" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#0f172a" }}>
                  <th className="text-left px-3 py-2 text-white/40 font-semibold text-xs">name</th>
                  <th className="text-left px-3 py-2 text-white/40 font-semibold text-xs">status</th>
                  <th className="text-left px-3 py-2 text-white/40 font-semibold text-xs">submitted</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => {
                  const st = statusInfo(r);
                  const isSel = selected?.id === r.id;
                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelected(isSel ? null : r)}
                      className="cursor-pointer border-t"
                      style={{
                        borderColor: "#1f2937",
                        background: isSel ? "rgba(255,208,7,0.06)" : i % 2 ? "#0b1120" : "#0f172a"
                      }}
                    >
                      <td className="px-3 py-2.5 text-white">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold">{r.name || "—"}</span>
                          {r.attempt > 1 && (
                            <span
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                              style={{ background: "rgba(255,208,7,0.12)", color: Y }}
                            >
                              review {r.attempt}
                            </span>
                          )}
                        </div>
                        <div className="text-white/30 text-xs">{r.email}</div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-xs font-bold" style={{ color: st.color }}>{st.label}</span>
                      </td>
                      <td className="px-3 py-2.5 text-white/40 text-xs">{fmtDate(r.created_at)}</td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center text-white/30 text-sm py-8">
                      no evolve portfolio reviews yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selected && (
          <div
            className="flex flex-col md:w-[48%] rounded-xl border overflow-hidden"
            style={{ borderColor: "#1f2937", maxHeight: "calc(100vh - 220px)" }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "#1f2937" }}>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-white font-bold text-sm">{selected.name || "—"}</p>
                  {selected.attempt > 1 && (
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: "rgba(255,208,7,0.12)", color: Y }}
                    >
                      review {selected.attempt}
                    </span>
                  )}
                </div>
                <p className="text-white/40 text-xs">{selected.email}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-white/40 hover:text-white text-lg leading-none">
                ×
              </button>
            </div>

            <div className="flex flex-col gap-4 px-4 py-4 overflow-y-auto">
              <div className="flex flex-wrap gap-3 text-xs">
                {selected.resume_value && (
                  <a href={selected.resume_value} target="_blank" rel="noreferrer" className="underline" style={{ color: Y }}>
                    resume ↗
                  </a>
                )}
                {selected.portfolio_value && (
                  <a href={selected.portfolio_value} target="_blank" rel="noreferrer" className="underline" style={{ color: Y }}>
                    portfolio ↗
                  </a>
                )}
              </div>

              <div className="flex flex-col gap-3">
                {QA.map(([label, key]) => (
                  selected[key] ? (
                    <div key={key}>
                      <p className="text-white/30 text-[11px] font-semibold uppercase tracking-wide mb-1">{label}</p>
                      <p className="text-white/70 text-sm whitespace-pre-wrap">{selected[key]}</p>
                    </div>
                  ) : null
                ))}
              </div>

              <p className="text-white/30 text-xs">submitted {fmtDate(selected.created_at)}</p>

              <div className="flex flex-col gap-1.5">
                <p className="text-white/30 text-[11px] font-semibold uppercase tracking-wide">session recording link</p>
                <div className="flex gap-2">
                  <input
                    value={recordingDraft}
                    onChange={(e) => setRecordingDraft(e.target.value)}
                    placeholder="https://drive.google.com/…"
                    className="flex-1 text-sm rounded-lg px-3 py-2 outline-none border"
                    style={{ background: "#111827", borderColor: "#1f2937", color: "#fff" }}
                  />
                  <button
                    onClick={saveRecording}
                    disabled={savingField === "recording"}
                    className="text-xs font-bold rounded-lg px-3 disabled:opacity-50"
                    style={{ background: "rgba(255,208,7,0.15)", color: Y }}
                  >
                    save
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <p className="text-white/30 text-[11px] font-semibold uppercase tracking-wide">internal remarks</p>
                <textarea
                  rows={3}
                  value={remarksDraft}
                  onChange={(e) => setRemarksDraft(e.target.value)}
                  className="text-sm rounded-lg px-3 py-2 outline-none border resize-none"
                  style={{ background: "#111827", borderColor: "#1f2937", color: "#fff" }}
                />
                <button
                  onClick={saveRemarks}
                  disabled={savingField === "remarks"}
                  className="self-start text-xs font-bold rounded-lg px-3 py-1.5 disabled:opacity-50"
                  style={{ background: "rgba(255,208,7,0.15)", color: Y }}
                >
                  save remarks
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                <p className="text-white/30 text-[11px] font-semibold uppercase tracking-wide">report</p>
                {!selected.meet_recording_url ? (
                  <p className="text-white/30 text-xs italic">add the session recording link before uploading the report.</p>
                ) : (
                  <ReportUploadCell
                    review={selected}
                    onDone={(id, reportUrl) => applyRowUpdate(id, { review_report_url: reportUrl })}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
