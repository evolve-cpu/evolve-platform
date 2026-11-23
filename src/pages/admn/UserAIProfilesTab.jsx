import { useEffect, useState } from "react";
import { supabaseAdmin } from "../../supabaseAdminClient";
import { ViewModal, SourceLink } from "./AIProfilesTab";

/* ── AI profiles users built themselves in the app ──────────────────────
   Only rows with profiles.ai_profile_self_built_at (stamped by
   AccountPanel on every self-build) — never the ones the team
   pre-generated from portfolio-review uploads (see "ai profiles" tab).
   Migration: supabase/migrations/ai_profile_self_built.sql ── */

const Y = "#FFD007";
const GR = "#22c55e";

function fmtDateTime(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

export default function UserAIProfilesTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select(
        "id, name, email, username, portfolio_link, portfolio_file_url, resume_link, resume_file_url, social_links, ai_profile, ai_profile_status, ai_profile_updated_at, ai_profile_self_built_at, ai_profile_public, verification_status"
      )
      .not("ai_profile_self_built_at", "is", null)
      .order("ai_profile_self_built_at", { ascending: false });
    if (error) setError(error.message);
    setRows(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const q = search.trim().toLowerCase();
  const filtered = q
    ? rows.filter((r) =>
        [r.name, r.email, r.username].some((v) => v && v.toLowerCase().includes(q))
      )
    : rows;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="search by name, email or username…"
          className="flex-1 max-w-sm px-4 py-2 rounded-lg text-sm outline-none"
          style={{ background: "#111", border: "1px solid #222", color: "#fff" }}
        />
        <span className="text-xs" style={{ color: "#555" }}>
          {filtered.length} built by users in the app
        </span>
        <button
          onClick={load}
          className="text-xs px-3 py-1.5 rounded-lg font-semibold"
          style={{ background: "#111", border: "1px solid #333", color: Y }}
        >
          ↻ refresh
        </button>
      </div>

      {error && (
        <p className="text-xs" style={{ color: "#f87171" }}>
          couldn't load: {error}
          {/column .*ai_profile_self_built_at/.test(error) &&
            " — run supabase/migrations/ai_profile_self_built.sql first"}
        </p>
      )}

      <div className="rounded-xl border overflow-x-auto" style={{ borderColor: "#222" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#0d0d0d", color: "#666" }}>
              {["name", "email", "built", "portfolio", "resume", "public page", "verification", ""].map((h) => (
                <th key={h} className="text-left text-[11px] font-semibold px-4 py-3 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-xs" style={{ color: "#555" }}>
                  loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-xs" style={{ color: "#555" }}>
                  no user-built AI profiles yet
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="border-t" style={{ borderColor: "#1a1a1a" }}>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: "#fff" }}>
                    {r.name || r.username || "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: "#aaa" }}>
                    {r.email || "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: "#aaa" }}>
                    {fmtDateTime(r.ai_profile_self_built_at)}
                  </td>
                  <td className="px-4 py-3">
                    <SourceLink link={r.portfolio_link} fileUrl={r.portfolio_file_url} />
                  </td>
                  <td className="px-4 py-3">
                    <SourceLink link={r.resume_link} fileUrl={r.resume_file_url} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {r.ai_profile_public && r.username ? (
                      <a
                        href={`/profile/${r.username}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs underline"
                        style={{ color: GR }}
                      >
                        open
                      </a>
                    ) : (
                      <span className="text-xs" style={{ color: "#444" }}>
                        private
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: "#aaa" }}>
                    {r.verification_status || "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      disabled={!r.ai_profile}
                      onClick={() => setViewing(r)}
                      className="text-xs px-3 py-1 rounded-lg font-semibold disabled:opacity-30"
                      style={{ background: `${Y}22`, color: Y }}
                    >
                      view
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {viewing && (
        <ViewModal
          row={{
            userId: viewing.id,
            selfBuilt: true,
            name: viewing.name,
            email: viewing.email,
            portfolioLink: viewing.portfolio_link,
            portfolioFileUrl: viewing.portfolio_file_url,
            resumeLink: viewing.resume_link,
            resumeFileUrl: viewing.resume_file_url,
            socialLinks: viewing.social_links,
            aiProfile: viewing.ai_profile,
            aiProfileUpdatedAt: viewing.ai_profile_updated_at
          }}
          onClose={() => setViewing(null)}
        />
      )}
    </div>
  );
}
