import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { supabaseAdmin } from "../../supabaseAdminClient";
import { AIProfileReveal } from "../../components/AccountPanel";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const Y = "#FFD007";
const GR = "#22c55e";
const RED = "#f87171";
const P = "#DF0586";

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function statusBadge(status) {
  const map = {
    done: { label: "done", color: GR },
    pending: { label: "generating…", color: Y },
    failed: { label: "failed", color: RED },
    none: { label: "not generated", color: "#555" },
    no_account: { label: "no linked account", color: "#a78bfa" }
  };
  const s = map[status] || map.none;
  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap"
      style={{ background: `${s.color}22`, color: s.color }}
    >
      {s.label}
    </span>
  );
}

function SourceLink({ link, fileUrl }) {
  const href = link || fileUrl;
  if (!href) return <span style={{ color: "#333" }}>—</span>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-xs underline"
      style={{ color: "#60a5fa" }}
    >
      open{fileUrl && !link ? " (file)" : ""}
    </a>
  );
}

async function callEdgeFn(name, user_id) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY
    },
    body: JSON.stringify({ user_id })
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || `${name} failed`);
  return json;
}

/* ── modal: source (portfolio/resume) + the generated profile, side by
   side, so an admin can eyeball how close the AI output landed ── */
function ViewModal({ row, onClose }) {
  const modal = (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative flex flex-col w-full max-w-4xl max-h-[92vh] rounded-2xl overflow-hidden"
        style={{ background: "#0a0a0a", border: "1px solid #222" }}
      >
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0 gap-3"
          style={{ borderBottom: "1px solid #1a1a1a" }}
        >
          <div className="min-w-0">
            <p className="text-white font-black text-base truncate">{row.name || row.email}</p>
            <p className="text-xs mt-0.5" style={{ color: "#555" }}>
              {row.aiProfileUpdatedAt
                ? `generated ${new Date(row.aiProfileUpdatedAt).toLocaleString()}`
                : "not generated yet"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-xs px-3 py-1.5 rounded-lg font-semibold shrink-0"
            style={{ background: "#161616", border: "1px solid #333", color: "#888" }}
          >
            close
          </button>
        </div>

        {/* Plain block, not a flex container — a flex column here would let
            its children flex-shrink to fit instead of overflowing, which
            silently compresses/clips content and never triggers the
            scrollbar. The gap-4 stacking lives on the inner wrapper
            instead, whose height is unconstrained (sized to content) so
            it never needs to shrink anything. */}
        <div className="overflow-y-auto flex-1 min-h-0 px-6 py-5">
          <div className="flex flex-col gap-4">
            <div
              className="rounded-xl p-4 flex flex-col gap-2"
              style={{ background: "#0d0d0d", border: "1px solid #1e1e1e" }}
            >
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: P }}>
                source used to generate this
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
                <span style={{ color: "#888" }}>
                  portfolio: <SourceLink link={row.portfolioLink} fileUrl={row.portfolioFileUrl} />
                </span>
                <span style={{ color: "#888" }}>
                  resume: <SourceLink link={row.resumeLink} fileUrl={row.resumeFileUrl} />
                </span>
              </div>
            </div>

            {row.aiProfile ? (
              <AIProfileReveal
                profile={row.aiProfile}
                portfolioLink={row.portfolioLink}
                portfolioFileUrl={row.portfolioFileUrl}
                resumeLink={row.resumeLink}
                resumeFileUrl={row.resumeFileUrl}
                socialLinks={row.socialLinks}
              />
            ) : (
              <p className="text-sm text-center py-10" style={{ color: "#555" }}>
                no ai_profile generated yet for this user.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  return createPortal(modal, document.body);
}

/* ── self-contained tab: own fetch/state, matches EvolveReviewsPanel's
   pattern of not touching AdminDashboard's shared state.

   Source of truth is `portfolio_reviews` (every submission, all ~111),
   merged with whatever `profiles`/`ai_profile` data already exists — so
   every submission shows up here immediately, whether or not it's been
   copied into `profiles` / generated yet. "regenerate" does the copy (if
   needed) + the two edge-function calls in one go. ── */
export default function AIProfilesTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewing, setViewing] = useState(null);
  const [regeneratingIds, setRegeneratingIds] = useState(new Set());
  const [rowErrors, setRowErrors] = useState({});
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(null); // { done, total }

  async function load() {
    setLoading(true);

    const { data: submissions, error: subErr } = await supabaseAdmin
      .from("portfolio_reviews")
      .select("id, user_id, name, email, portfolio_link, portfolio_file_url")
      .order("created_at", { ascending: false });

    if (subErr) {
      console.error("Failed to load portfolio_reviews:", subErr.message);
      setLoading(false);
      return;
    }

    // Resolve user_id for rows submitted before the person had an account.
    const emailToId = new Map();
    const needEmailLookup = submissions.filter((s) => !s.user_id && s.email);
    for (const s of needEmailLookup) {
      const { data } = await supabaseAdmin.from("profiles").select("id").ilike("email", s.email).maybeSingle();
      if (data?.id) emailToId.set(s.email, data.id);
    }

    const userIds = [...new Set(submissions.map((s) => s.user_id || emailToId.get(s.email)).filter(Boolean))];

    const profileById = new Map();
    for (let i = 0; i < userIds.length; i += 100) {
      const chunk = userIds.slice(i, i + 100);
      const { data } = await supabaseAdmin
        .from("profiles")
        .select(
          "id, name, email, portfolio_link, portfolio_file_url, resume_link, resume_file_url, social_links, ai_profile, ai_profile_status, ai_profile_updated_at"
        )
        .in("id", chunk);
      for (const p of data || []) profileById.set(p.id, p);
    }

    const merged = submissions.map((sub) => {
      const userId = sub.user_id || emailToId.get(sub.email) || null;
      const profile = userId ? profileById.get(userId) : null;

      // Only patch in the submission's portfolio if the profile doesn't
      // already have one of its own — never touch resume (portfolio_reviews
      // has no resume field, and a portfolio_file_url here is never
      // guessed to secretly be a resume even if the filename looks like one).
      const patch = {};
      if (profile && !profile.portfolio_link && !profile.portfolio_file_url) {
        if (sub.portfolio_link) patch.portfolio_link = sub.portfolio_link;
        else if (sub.portfolio_file_url) patch.portfolio_file_url = sub.portfolio_file_url;
      }

      return {
        submissionId: sub.id,
        userId,
        name: profile?.name || sub.name,
        email: profile?.email || sub.email,
        portfolioLink: profile?.portfolio_link || sub.portfolio_link || null,
        portfolioFileUrl: profile?.portfolio_file_url || sub.portfolio_file_url || null,
        resumeLink: profile?.resume_link || null,
        resumeFileUrl: profile?.resume_file_url || null,
        socialLinks: profile?.social_links,
        aiProfile: profile?.ai_profile || null,
        aiProfileStatus: userId ? profile?.ai_profile_status || "none" : "no_account",
        aiProfileUpdatedAt: profile?.ai_profile_updated_at || null,
        hasProfileRow: !!profile,
        patch
      };
    });

    setRows(merged);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = rows.filter((r) => {
    if (statusFilter !== "all" && r.aiProfileStatus !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (r.name || "").toLowerCase().includes(q) || (r.email || "").toLowerCase().includes(q);
  });

  // Shared by the per-row button and the "regenerate all" bulk runner.
  // Copies the submission's portfolio into `profiles` first (if it isn't
  // there yet), then runs the same two edge functions the onboarding flow
  // uses.
  async function regenerateOne(row) {
    if (!row.userId) {
      setRowErrors((prev) => ({ ...prev, [row.submissionId]: "no linked profiles account for this email yet" }));
      return false;
    }
    setRegeneratingIds((prev) => new Set([...prev, row.submissionId]));
    setRowErrors((prev) => ({ ...prev, [row.submissionId]: null }));
    try {
      if (Object.keys(row.patch).length > 0) {
        const { error: patchErr } = await supabaseAdmin.from("profiles").update(row.patch).eq("id", row.userId);
        if (patchErr) throw new Error(`couldn't save portfolio to profile: ${patchErr.message}`);
      }

      await callEdgeFn("extract-profile-data", row.userId);
      const analyzed = await callEdgeFn("analyze-profile-data", row.userId);

      setRows((prev) =>
        prev.map((r) =>
          r.submissionId === row.submissionId
            ? {
                ...r,
                portfolioLink: row.patch.portfolio_link || r.portfolioLink,
                portfolioFileUrl: row.patch.portfolio_file_url || r.portfolioFileUrl,
                patch: {},
                hasProfileRow: true,
                aiProfile: analyzed?.ai_profile ?? r.aiProfile,
                aiProfileStatus: "done",
                aiProfileUpdatedAt: analyzed?.ai_profile?.generated_at || new Date().toISOString()
              }
            : r
        )
      );
      return true;
    } catch (err) {
      setRowErrors((prev) => ({ ...prev, [row.submissionId]: err.message }));
      setRows((prev) =>
        prev.map((r) => (r.submissionId === row.submissionId ? { ...r, aiProfileStatus: "failed" } : r))
      );
      return false;
    } finally {
      setRegeneratingIds((prev) => {
        const s = new Set(prev);
        s.delete(row.submissionId);
        return s;
      });
    }
  }

  const notDoneRows = rows.filter((r) => r.userId && r.aiProfileStatus !== "done");

  // Re-run every user that isn't "done" yet — one at a time with a pause
  // between (be gentle on the scrape/Gemini step, same reasoning as the
  // one-time batch script under /scripts).
  async function handleBulkRegenerate() {
    setBulkRunning(true);
    setBulkProgress({ done: 0, total: notDoneRows.length });
    for (let i = 0; i < notDoneRows.length; i++) {
      await regenerateOne(notDoneRows[i]);
      setBulkProgress({ done: i + 1, total: notDoneRows.length });
      if (i < notDoneRows.length - 1) await new Promise((r) => setTimeout(r, 3000));
    }
    setBulkRunning(false);
    setBulkProgress(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="search by name or email…"
          className="flex-1 max-w-sm px-4 py-2 rounded-lg text-sm outline-none"
          style={{ background: "#111", border: "1px solid #222", color: "#fff" }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg text-xs outline-none"
          style={{ background: "#111", border: "1px solid #222", color: "#fff" }}
        >
          <option value="all">all statuses</option>
          <option value="done">done</option>
          <option value="pending">generating</option>
          <option value="failed">failed</option>
          <option value="none">not generated</option>
          <option value="no_account">no linked account</option>
        </select>
        <span className="text-xs" style={{ color: "#555" }}>
          {filtered.length} of {rows.length} submissions
        </span>
        <button
          onClick={load}
          disabled={bulkRunning}
          className="text-xs px-3 py-1.5 rounded-lg font-semibold disabled:opacity-40"
          style={{ background: "#111", border: "1px solid #333", color: Y }}
        >
          ↻ refresh
        </button>
        <button
          onClick={handleBulkRegenerate}
          disabled={bulkRunning || notDoneRows.length === 0}
          className="text-xs px-3 py-1.5 rounded-lg font-semibold disabled:opacity-40"
          style={{ background: "#161616", border: "1px solid #333", color: GR }}
        >
          {bulkRunning
            ? `regenerating ${bulkProgress?.done ?? 0}/${bulkProgress?.total ?? 0}…`
            : `▶ regenerate all not-done (${notDoneRows.length})`}
        </button>
      </div>

      <div className="rounded-xl border overflow-x-auto" style={{ borderColor: "#222" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#111", borderBottom: "1px solid #222" }}>
              {["name", "email", "status", "portfolio", "resume", "generated", "actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold" style={{ color: "#555" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center" style={{ color: "#444" }}>
                  loading…
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center" style={{ color: "#444" }}>
                  no users found
                </td>
              </tr>
            )}
            {filtered.map((r, i) => {
              const regenerating = regeneratingIds.has(r.submissionId);
              return (
                <tr
                  key={r.submissionId}
                  style={{
                    borderBottom: "1px solid #1a1a1a",
                    background: i % 2 === 0 ? "#0d0d0d" : "#0a0a0a"
                  }}
                >
                  <td className="px-4 py-3 font-semibold text-white">{r.name || "—"}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: "#666" }}>
                    {r.email || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {statusBadge(regenerating ? "pending" : r.aiProfileStatus)}
                  </td>
                  <td className="px-4 py-3">
                    <SourceLink link={r.portfolioLink} fileUrl={r.portfolioFileUrl} />
                  </td>
                  <td className="px-4 py-3">
                    <SourceLink link={r.resumeLink} fileUrl={r.resumeFileUrl} />
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "#555" }}>
                    {fmtDate(r.aiProfileUpdatedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewing(r)}
                        disabled={!r.aiProfile}
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold disabled:opacity-30"
                        style={{ background: "#161616", border: "1px solid #333", color: "#fff" }}
                      >
                        view
                      </button>
                      <button
                        onClick={() => regenerateOne(r)}
                        disabled={regenerating || bulkRunning || !r.userId}
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold disabled:opacity-40"
                        style={{ background: "#161616", border: "1px solid #333", color: Y }}
                      >
                        {regenerating ? "regenerating…" : "regenerate"}
                      </button>
                    </div>
                    {rowErrors[r.submissionId] && (
                      <p className="text-[10px] mt-1 max-w-[220px]" style={{ color: RED }}>
                        {rowErrors[r.submissionId]}
                      </p>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {viewing && <ViewModal row={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}
