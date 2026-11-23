import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../supabaseClient";
import { supabaseAdmin } from "../../supabaseAdminClient";

/* ── Human review of an AI profile, field by field ────────────────────────
   Every verdict (agree / disagree / missing) plus the reviewer's REASONING
   lands in ai_profile_reviews + ai_profile_review_items — the dataset we
   later use for few-shot examples, evals and fine-tuning. See
   supabase/migrations/ai_profile_reviews.sql and
   docs/ai-profile-training/REVIEW_GUIDE.md. ── */

const Y = "#FFD007";
const GR = "#22c55e";
const RED = "#f87171";
const P = "#DF0586";
const BLUE = "#60a5fa";

export const GAP_TYPES = [
  ["missed_info", "Missed info", "it's in the source, AI didn't pick it up"],
  ["made_up", "Made up", "no evidence for it in the source"],
  ["overrated", "Overrated", "higher than the evidence supports"],
  ["underrated", "Underrated", "lower than the evidence supports"],
  ["wrong_interpretation", "Wrong interpretation", "read the evidence, drew the wrong conclusion"],
  ["bad_input", "Bad input", "AI couldn't see the content (images, broken link, PDF)"],
  ["wording", "Wording / format", "right idea, badly phrased or wrong field"]
];
export const SEVERITIES = [
  ["minor", "Minor"],
  ["major", "Major"],
  ["wrong", "Wrong"]
];

/* ── turn any profile value into a readable string ── */
function fmt(v) {
  if (v == null || v === "") return "—";
  if (typeof v !== "object") return String(v);
  if (Array.isArray(v)) {
    if (!v.length) return "(empty)";
    return v.map((x) => (typeof x === "object" ? fmtObj(x) : String(x))).join(" · ");
  }
  return fmtObj(v);
}
function fmtObj(o) {
  return Object.entries(o)
    .filter(([, x]) => x != null && x !== "" && !(Array.isArray(x) && !x.length))
    .map(([k, x]) => `${k.replace(/_/g, " ")}: ${Array.isArray(x) ? x.map((y) => (typeof y === "object" ? fmtObj(y) : y)).join(", ") : typeof x === "object" ? fmtObj(x) : x}`)
    .join(" | ");
}

// Field groups shown to the reviewer. `list` fields are reviewed per item
// (skills[0], skills[1] …) and get a "+ missing" button; everything else is
// reviewed as a whole.
const GROUPS = [
  {
    title: "Who they are",
    fields: [
      ["stage", "Career stage"],
      ["role", "Role"],
      ["work_experience", "Work experience"],
      ["career_switching", "Career switching"],
      ["niche", "Niche"],
      ["domain", "Domain"],
      ["sector", "Sector"],
      ["current_status", "Current status"],
      ["location", "Location"],
      ["summary", "Summary"]
    ]
  },
  {
    title: "Skills",
    fields: [
      ["skills", "Design skills", { list: true, item: (s) => `${s.skill} (${s.level}) — ${s.evidence}` }],
      ["skill_profile", "Skill profile", { list: true, item: (s) => `${s.category} ${s.pct}%` }],
      ["technical_skills", "Technical skills"],
      ["tool_proficiency", "Tool proficiency"],
      ["ai_proficiency", "AI proficiency"],
      ["soft_skills", "Soft skills"],
      ["interpersonal_skills", "Interpersonal skills"]
    ]
  },
  {
    title: "Judgement calls",
    fields: [
      ["persona_traits", "Persona traits", { list: true, item: (t) => `${t.left_label} ↔ ${t.right_label}: ${t.score}/5 — ${t.evidence}` }],
      ["dimension_ratings", "Strong / growth zones", { list: true, item: (d) => `${d.dimension}: ${d.score} — ${d.evidence}` }],
      ["understanding_of_business", "Understanding of business"],
      ["foundational_clarity", "Foundational clarity"],
      ["team_work_proficiency", "Team work"],
      ["real_work_validation", "Real work validation"],
      ["learning", "Learning"],
      ["contributing_back", "Contributing back"],
      ["competency_matrix", "Competency matrix"]
    ]
  },
  {
    title: "Story & future",
    fields: [
      ["recruiter_highlights", "Recruiter highlights"],
      ["notable_works", "Notable works"],
      ["career_timeline", "Career timeline"],
      ["career_trajectory", "Career trajectory"],
      ["type_of_work_wanted", "Type of work wanted"],
      ["work_preference", "Work preference"]
    ]
  }
];

function buildItems(profile) {
  const groups = [];
  for (const g of GROUPS) {
    const rows = [];
    for (const [key, label, opts] of g.fields) {
      const v = profile?.[key];
      if (opts?.list) {
        const arr = Array.isArray(v) ? v : [];
        arr.forEach((x, i) =>
          rows.push({ path: `${key}[${i}]`, label: `${label} #${i + 1}`, display: safeItem(opts.item, x), raw: x, listKey: key })
        );
        if (!arr.length) rows.push({ path: key, label, display: "(empty)", raw: v ?? null, listKey: key });
        rows.push({ addMissing: true, listKey: key, label });
      } else {
        rows.push({ path: key, label, display: fmt(v), raw: v ?? null });
      }
    }
    groups.push({ title: g.title, rows });
  }
  return groups;
}
function safeItem(fn, x) {
  try {
    return fn(x);
  } catch {
    return fmt(x);
  }
}

/* ── draft autosave (per user + profile build), so a long review survives
   a closed modal. Best-effort only. ── */
const draftKey = (userId, profile) => `ai-review-draft:${userId}:${profile?.generated_at || "x"}`;
function loadDraft(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}
function saveDraft(key, v) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {
    /* ignore */
  }
}
function clearDraft(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

const inputStyle = { background: "#111", border: "1px solid #2a2a2a", color: "#fff" };

function VerdictButtons({ verdict, onChange }) {
  const btn = (v, label, color) => (
    <button
      type="button"
      onClick={() => onChange(verdict === v ? null : v)}
      className="text-[11px] px-2.5 py-1 rounded-md font-bold"
      style={{
        background: verdict === v ? `${color}22` : "#141414",
        border: `1px solid ${verdict === v ? color : "#2a2a2a"}`,
        color: verdict === v ? color : "#777"
      }}
    >
      {label}
    </button>
  );
  return (
    <div className="flex gap-1.5 shrink-0">
      {btn("agree", "✓ agree", GR)}
      {btn("disagree", "✕ disagree", RED)}
    </div>
  );
}

function CorrectionForm({ value, onChange, isMissing }) {
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value });
  const missingReason = !value.reasoning?.trim();
  return (
    <div className="mt-2 grid gap-2 sm:grid-cols-2">
      <input
        value={value.human_value || ""}
        onChange={set("human_value")}
        placeholder={isMissing ? "what's missing (e.g. 'Packaging Design (Practiced)')" : "should be…"}
        className="px-3 py-2 rounded-lg text-xs outline-none sm:col-span-2"
        style={inputStyle}
      />
      <select value={value.gap_type || ""} onChange={set("gap_type")} className="px-3 py-2 rounded-lg text-xs outline-none" style={inputStyle}>
        <option value="">gap type…</option>
        {GAP_TYPES.map(([v, l, d]) => (
          <option key={v} value={v}>
            {l} — {d}
          </option>
        ))}
      </select>
      <select value={value.severity || ""} onChange={set("severity")} className="px-3 py-2 rounded-lg text-xs outline-none" style={inputStyle}>
        <option value="">severity…</option>
        {SEVERITIES.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
      <textarea
        value={value.reasoning || ""}
        onChange={set("reasoning")}
        rows={2}
        placeholder="WHY — cite the evidence. e.g. 'Only internships (1 yr), no full-time role yet, so Early not Mid-level'"
        className="px-3 py-2 rounded-lg text-xs outline-none sm:col-span-2"
        style={{ ...inputStyle, borderColor: missingReason ? `${RED}66` : "#2a2a2a" }}
      />
      <input
        value={value.evidence || ""}
        onChange={set("evidence")}
        placeholder="where — e.g. 'Portfolio > Café rebrand case study' or 'Resume > Experience'"
        className="px-3 py-2 rounded-lg text-xs outline-none sm:col-span-2"
        style={inputStyle}
      />
    </div>
  );
}

export default function ProfileReviewPanel({ row, onSubmitted }) {
  const profile = row.aiProfile;
  const groups = useMemo(() => buildItems(profile), [profile]);
  const reviewable = useMemo(() => groups.flatMap((g) => g.rows.filter((r) => !r.addMissing)), [groups]);
  const key = draftKey(row.userId, profile);

  const [draft] = useState(() => loadDraft(key));
  const [verdicts, setVerdicts] = useState(draft?.verdicts || {}); // path -> { verdict, human_value, gap_type, severity, reasoning, evidence }
  const [missing, setMissing] = useState(draft?.missing || []); // [{ listKey, label, human_value, ... }]
  const [overall, setOverall] = useState(draft?.overall || { accuracy: null, notes: "" });
  const [past, setPast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    saveDraft(key, { verdicts, missing, overall });
  }, [key, verdicts, missing, overall]);

  useEffect(() => {
    if (!row.userId) return;
    supabaseAdmin
      .from("ai_profile_reviews")
      .select("id, reviewer_email, created_at, agree_count, disagree_count, missing_count, overall_accuracy")
      .eq("user_id", row.userId)
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data, error: e }) => setPast(e ? { error: e.message } : data || []));
  }, [row.userId, done]);

  const setVerdict = (path, v) =>
    setVerdicts((prev) => {
      const next = { ...prev };
      if (!v) delete next[path];
      else next[path] = { ...(prev[path] || {}), verdict: v };
      return next;
    });
  const setCorrection = (path, value) => setVerdicts((prev) => ({ ...prev, [path]: { ...value, verdict: "disagree" } }));

  const counts = useMemo(() => {
    const vs = Object.values(verdicts);
    return {
      agree: vs.filter((v) => v.verdict === "agree").length,
      disagree: vs.filter((v) => v.verdict === "disagree").length,
      missing: missing.length,
      unreviewed: reviewable.filter((r) => !verdicts[r.path]).length
    };
  }, [verdicts, missing, reviewable]);

  const incomplete = [
    ...Object.entries(verdicts).filter(([, v]) => v.verdict === "disagree" && (!v.reasoning?.trim() || !v.gap_type)),
    ...missing.filter((m) => !m.reasoning?.trim() || !m.gap_type || !m.human_value?.trim())
  ].length;

  function agreeRest() {
    setVerdicts((prev) => {
      const next = { ...prev };
      for (const r of reviewable) if (!next[r.path]) next[r.path] = { verdict: "agree" };
      return next;
    });
  }

  async function submit() {
    setError("");
    if (incomplete) return setError(`${incomplete} correction(s) still need a gap type and a reason.`);
    if (!counts.agree && !counts.disagree && !counts.missing) return setError("Review at least one field first.");
    if (!overall.accuracy) return setError("Pick an overall accuracy (1–5).");
    setSaving(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const me = sess?.session?.user;
      const { data: src } = await supabaseAdmin.from("profiles").select("extracted_profile").eq("id", row.userId).maybeSingle();

      const { data: review, error: rErr } = await supabaseAdmin
        .from("ai_profile_reviews")
        .insert({
          user_id: row.userId,
          run_id: profile.run_id || null,
          reviewer_id: me?.id || null,
          reviewer_email: me?.email || null,
          profile_source: row.selfBuilt == null ? null : row.selfBuilt ? "self_built" : "team_built",
          model: profile.model || null,
          prompt_version: profile.prompt_version || null,
          profile_generated_at: profile.generated_at || null,
          input_snapshot: src?.extracted_profile ?? null,
          ai_output: profile,
          overall_accuracy: overall.accuracy,
          overall_notes: overall.notes?.trim() || null,
          agree_count: counts.agree,
          disagree_count: counts.disagree,
          missing_count: counts.missing
        })
        .select("id")
        .single();
      if (rErr || !review?.id) throw new Error(rErr?.message || "couldn't save review");

      const byPath = new Map(reviewable.map((r) => [r.path, r]));
      const items = [
        ...Object.entries(verdicts).map(([path, v]) => ({
          review_id: review.id,
          field_path: path,
          field_label: byPath.get(path)?.label || path,
          verdict: v.verdict,
          ai_value: byPath.get(path)?.raw ?? null,
          human_value: v.verdict === "disagree" ? v.human_value?.trim() || null : null,
          gap_type: v.verdict === "disagree" ? v.gap_type : null,
          severity: v.verdict === "disagree" ? v.severity || null : null,
          reasoning: v.verdict === "disagree" ? v.reasoning.trim() : null,
          evidence: v.verdict === "disagree" ? v.evidence?.trim() || null : null
        })),
        ...missing.map((m) => ({
          review_id: review.id,
          field_path: `${m.listKey}[+]`,
          field_label: `${m.label} (missing)`,
          verdict: "missing",
          ai_value: null,
          human_value: m.human_value.trim(),
          gap_type: m.gap_type,
          severity: m.severity || null,
          reasoning: m.reasoning.trim(),
          evidence: m.evidence?.trim() || null
        }))
      ];
      const { error: iErr } = await supabaseAdmin.from("ai_profile_review_items").insert(items);
      if (iErr) {
        // don't leave a review with no items behind
        await supabaseAdmin.from("ai_profile_reviews").delete().eq("id", review.id);
        throw new Error(iErr.message);
      }

      clearDraft(key);
      setVerdicts({});
      setMissing([]);
      setOverall({ accuracy: null, notes: "" });
      setDone(true);
      onSubmitted?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (!row.userId) {
    return <p className="text-sm text-center py-10" style={{ color: "#555" }}>no linked account — can't review.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* header: how-to + past reviews */}
      <div className="rounded-xl p-4 text-xs flex flex-col gap-2" style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", color: "#888" }}>
        <p className="font-black uppercase tracking-widest" style={{ color: P }}>
          review this ai profile
        </p>
        <p>
          Open the portfolio & resume above, then mark each field <b style={{ color: GR }}>agree</b> or{" "}
          <b style={{ color: RED }}>disagree</b>. Every disagreement needs a gap type and a <b style={{ color: "#fff" }}>reason that cites evidence</b> — the
          reason is what teaches the model. Use <b style={{ color: BLUE }}>+ missing</b> when a list leaves something out. Drafts save automatically.
        </p>
        <p style={{ color: "#555" }}>
          model: {profile.model || "gemini-3.5-flash-lite (assumed)"} · prompt: {profile.prompt_version || "unversioned"} · generated{" "}
          {profile.generated_at ? new Date(profile.generated_at).toLocaleString() : "—"}
        </p>
        {past?.error && <p style={{ color: RED }}>couldn't load past reviews: {past.error} (has the migration been run?)</p>}
        {Array.isArray(past) && past.length > 0 && (
          <div className="flex flex-col gap-0.5">
            {past.map((p) => (
              <span key={p.id} style={{ color: "#666" }}>
                reviewed {new Date(p.created_at).toLocaleDateString()} by {p.reviewer_email || "?"} — accuracy {p.overall_accuracy ?? "?"}/5 · {p.agree_count} agree ·{" "}
                {p.disagree_count} disagree · {p.missing_count} missing
              </span>
            ))}
          </div>
        )}
        {done && <p style={{ color: GR }}>✓ review saved. Thanks — this goes straight into the training set.</p>}
      </div>

      {groups.map((g) => (
        <div key={g.title} className="rounded-xl overflow-hidden" style={{ border: "1px solid #1e1e1e" }}>
          <p className="px-4 py-2 text-[11px] font-black uppercase tracking-widest" style={{ background: "#111", color: Y }}>
            {g.title}
          </p>
          <div className="flex flex-col">
            {g.rows.map((r) => {
              if (r.addMissing) {
                const mine = missing.map((m, i) => [m, i]).filter(([m]) => m.listKey === r.listKey);
                return (
                  <div key={`${r.listKey}-missing`} className="px-4 py-2" style={{ borderTop: "1px solid #161616" }}>
                    {mine.map(([m, i]) => (
                      <div key={i} className="mb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold" style={{ color: BLUE }}>
                            missing from {r.label.toLowerCase()}
                          </span>
                          <button
                            type="button"
                            onClick={() => setMissing((prev) => prev.filter((_, j) => j !== i))}
                            className="text-[11px]"
                            style={{ color: "#666" }}
                          >
                            remove
                          </button>
                        </div>
                        <CorrectionForm
                          isMissing
                          value={m}
                          onChange={(v) => setMissing((prev) => prev.map((x, j) => (j === i ? { ...v, listKey: m.listKey, label: m.label } : x)))}
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setMissing((prev) => [...prev, { listKey: r.listKey, label: r.label, gap_type: "missed_info" }])}
                      className="text-[11px] font-bold"
                      style={{ color: BLUE }}
                    >
                      + missing {r.label.toLowerCase()}
                    </button>
                  </div>
                );
              }
              const v = verdicts[r.path];
              return (
                <div
                  key={r.path}
                  className="px-4 py-3"
                  style={{ borderTop: "1px solid #161616", background: v?.verdict === "disagree" ? "#1a0d0d" : "transparent" }}
                >
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold" style={{ color: "#777" }}>
                        {r.label}
                      </p>
                      <p className="text-xs mt-0.5 break-words" style={{ color: "#ddd" }}>
                        {r.display}
                      </p>
                    </div>
                    <VerdictButtons verdict={v?.verdict} onChange={(nv) => setVerdict(r.path, nv)} />
                  </div>
                  {v?.verdict === "disagree" && <CorrectionForm value={v} onChange={(nv) => setCorrection(r.path, nv)} />}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* overall + submit */}
      <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: "#0d0d0d", border: "1px solid #1e1e1e" }}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold" style={{ color: "#888" }}>
            overall, how accurate is this profile?
          </span>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setOverall((o) => ({ ...o, accuracy: n }))}
              className="w-8 h-8 rounded-lg text-xs font-black"
              style={{
                background: overall.accuracy === n ? `${Y}22` : "#141414",
                border: `1px solid ${overall.accuracy === n ? Y : "#2a2a2a"}`,
                color: overall.accuracy === n ? Y : "#777"
              }}
            >
              {n}
            </button>
          ))}
          <span className="text-[11px]" style={{ color: "#555" }}>
            1 = misleading · 5 = I'd send it to a recruiter as is
          </span>
        </div>
        <textarea
          value={overall.notes}
          onChange={(e) => setOverall((o) => ({ ...o, notes: e.target.value }))}
          rows={2}
          placeholder="anything the field-by-field review doesn't capture (overall impression, patterns you noticed)"
          className="px-3 py-2 rounded-lg text-xs outline-none"
          style={inputStyle}
        />
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs" style={{ color: "#666" }}>
            <b style={{ color: GR }}>{counts.agree}</b> agree · <b style={{ color: RED }}>{counts.disagree}</b> disagree ·{" "}
            <b style={{ color: BLUE }}>{counts.missing}</b> missing · {counts.unreviewed} not reviewed
          </span>
          <button
            type="button"
            onClick={agreeRest}
            disabled={!counts.unreviewed}
            className="text-xs px-3 py-1.5 rounded-lg font-semibold disabled:opacity-30 ml-auto"
            style={{ background: "#161616", border: "1px solid #333", color: GR }}
          >
            mark the rest as agree
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="text-xs px-4 py-1.5 rounded-lg font-black disabled:opacity-40"
            style={{ background: Y, color: "#000" }}
          >
            {saving ? "saving…" : "submit review"}
          </button>
        </div>
        {error && <p className="text-xs" style={{ color: RED }}>{error}</p>}
      </div>
    </div>
  );
}
