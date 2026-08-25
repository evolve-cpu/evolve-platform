import { useEffect, useRef, useState } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  LabelList,
  PieChart,
  Pie,
  ResponsiveContainer
} from "recharts";
import { supabase } from "../supabaseClient";
import { useAuth } from "../hooks/useAuth";
import { slugify } from "../lib/slug";
import { QUESTIONS } from "../pages/Onboarding/questions";

// Portfolio & Resume / AI-profile tab is still in testing — keep this false
// on main. On merges from development this line should conflict (development
// keeps it true), which is the point: it forces a conscious choice instead of
// silently shipping the test feature to production.
// const ENABLE_PORTFOLIO_AI = false;
const ENABLE_PORTFOLIO_AI = true;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/* ── shared bits ──────────────────────────────────────────────────────── */
function BackHeader({ title, onBack }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm font-semibold w-fit transition-colors"
    >
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <path
          d="M12.5 15L7.5 10L12.5 5"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {title}
    </button>
  );
}

export function UserIcon({ className }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M4.5 20c1.5-3.8 4.8-6 7.5-6s6 2.2 7.5 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function InvoiceIcon({ className }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M6 3h9l4 4v13a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9 10h6M9 14h6M9 18h3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LogOutIcon({ className }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M9 21H5a1 1 0 01-1-1V4a1 1 0 011-1h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 17l5-5-5-5M21 12H9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TrashIcon({ className }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M4 7h16M9 7V4h6v3M6 7l1 13a1 1 0 001 1h8a1 1 0 001-1l1-13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 11v6M14 11v6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

// how each onboarding answer should be edited here — mirrors the shape each
// question's own parse()/chips already use in src/pages/Onboarding/questions.js.
// Anything not listed falls back to a plain text input (country, school_name,
// motivation, work_type — all free text in practice even though a couple of
// them also carry suggestion chips there).
const CHIP_SINGLE = new Set([
  "persona",
  "standard",
  "learning_method",
  "level"
]);
const CHIP_MULTI_ARRAY = new Set(["learning_modes", "discipline", "intent"]);
const CHIP_MULTI_STRING = new Set(["stream"]); // stored as a joined string, edited as chips

function ChipField({ options, value, onChange, multi }) {
  const selected = multi ? value || [] : value;
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = multi ? selected.includes(opt) : selected === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => {
              if (multi) {
                onChange(
                  active
                    ? selected.filter((v) => v !== opt)
                    : [...selected, opt]
                );
              } else {
                onChange(opt);
              }
            }}
            className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-colors ${
              active
                ? "border-evolve-yellow/50 bg-evolve-yellow/[0.12] text-evolve-yellow"
                : "border-[#373737] text-white/50 hover:bg-[#232325] hover:border-white/20"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function fmtRupees(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

function fmtDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

/* ── the 4-item menu (used as its own panel on mobile — desktop uses the
   floating dropdown in PublicProfile.jsx instead) ───────────────────────── */
export function AccountMenuList({
  onSelect,
  onBack,
  onLogOut,
  onDeleteAccount
}) {
  const items = [
    { key: "account", label: "My Account", Icon: UserIcon },
    { key: "invoice", label: "Invoice", Icon: InvoiceIcon },
    { key: "logout", label: "Log Out", Icon: LogOutIcon },
    { key: "delete", label: "Delete Account", Icon: TrashIcon, danger: true }
  ];
  return (
    <div className="flex flex-col gap-6">
      <BackHeader title="Back" onBack={onBack} />
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              if (item.key === "logout") return onLogOut();
              if (item.key === "delete") return onDeleteAccount();
              onSelect(item.key);
            }}
            className={`flex items-center justify-between rounded-2xl px-4 py-3.5 border border-[#373737] hover:bg-[#232325] transition-colors ${
              item.danger ? "text-red-400" : "text-white"
            }`}
          >
            <span className="flex items-center gap-3 font-semibold text-sm">
              <item.Icon
                className={item.danger ? "text-red-400" : "text-white/60"}
              />
              {item.label}
            </span>
            {!item.danger && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 20 20"
                fill="none"
                className="text-white/30"
              >
                <path
                  d="M7.5 5L12.5 10L7.5 15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Portfolio & Resume — profile-building test flow ─────────────────────
   Lets someone paste a link or upload a file for each of portfolio/resume,
   then kicks off the extract-profile-data edge function and shows the raw
   scraped text back as a preview "profile" (no AI summarization layer yet —
   this is deliberately the pre-LLM output, not a finished profile). ─────── */

const PORTFOLIO_ACCEPTED_TYPES = ".pdf,.pptx,.ppt,.odp,.zip";
const RESUME_ACCEPTED_TYPES = ".pdf,.doc,.docx";
const MAX_FILE_MB = 10;

// work/social links a designer might want on their one-stop shared profile —
// same {platform, url} shape as organizations.social_links so both features
// share one mental model (see InstituteInfoPanel / InstitutePublicPage).
const LINK_PLATFORMS = [
  "linkedin",
  "behance",
  "dribbble",
  "github",
  "website",
  "x / twitter",
  "instagram",
  "youtube"
];

function SourceEditor({
  mode,
  setMode,
  linkValue,
  setLinkValue,
  file,
  setFile,
  accept,
  placeholder
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("link")}
          className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-colors ${
            mode === "link"
              ? "border-evolve-yellow/50 bg-evolve-yellow/[0.12] text-evolve-yellow"
              : "border-[#373737] text-white/50 hover:border-white/20"
          }`}
        >
          paste a link
        </button>
        <button
          type="button"
          onClick={() => setMode("file")}
          className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-colors ${
            mode === "file"
              ? "border-evolve-yellow/50 bg-evolve-yellow/[0.12] text-evolve-yellow"
              : "border-[#373737] text-white/50 hover:border-white/20"
          }`}
        >
          upload a file
        </button>
      </div>
      {mode === "link" ? (
        <input
          type="url"
          value={linkValue}
          onChange={(e) => setLinkValue(e.target.value)}
          placeholder={placeholder}
          className="w-full text-sm text-white outline-none border border-[#373737] rounded-xl px-4 py-3 transition-colors focus:border-evolve-yellow/60"
          style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
        />
      ) : (
        <div>
          <input
            type="file"
            accept={accept}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              if (f.size > MAX_FILE_MB * 1024 * 1024) {
                alert(`file must be under ${MAX_FILE_MB}MB`);
                return;
              }
              setFile(f);
            }}
            className="w-full text-xs text-white/60 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border file:border-[#373737] file:bg-transparent file:text-white/70 file:text-xs"
          />
          {file && <p className="text-white/40 text-xs mt-1.5">{file.name}</p>}
        </div>
      )}
    </div>
  );
}

function ExistingSourceRow({ link, fileUrl, onChange }) {
  const value = link || fileUrl;
  const isFile = !!fileUrl && !link;
  return (
    <div className="flex items-center justify-between gap-3 border border-[#373737] rounded-xl px-4 py-3">
      <a
        href={value}
        target="_blank"
        rel="noreferrer"
        className="text-white text-sm truncate hover:text-evolve-yellow transition-colors min-w-0"
      >
        {isFile ? "uploaded file" : value}
      </a>
      <button
        type="button"
        onClick={onChange}
        className="text-evolve-yellow text-xs font-semibold flex-shrink-0 hover:opacity-80"
      >
        Change
      </button>
    </div>
  );
}

function LinksEditor({ links, onAdd, onUpdate, onRemove }) {
  return (
    <div className="flex flex-col gap-2">
      {links.map((l, i) => (
        <div key={i} className="flex items-center gap-2">
          <select
            value={l.platform}
            onChange={(e) => onUpdate(i, { platform: e.target.value })}
            className="text-xs text-white/70 font-semibold rounded-lg px-2.5 py-2.5 outline-none flex-shrink-0 w-[110px] border border-[#373737]"
            style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
          >
            {LINK_PLATFORMS.map((p) => (
              <option
                key={p}
                value={p}
                style={{ backgroundColor: "#1c1c1f", color: "#fff" }}
              >
                {p}
              </option>
            ))}
          </select>
          <input
            value={l.url}
            onChange={(e) => onUpdate(i, { url: e.target.value })}
            placeholder="paste link…"
            className="flex-1 text-sm text-white outline-none border border-[#373737] rounded-xl px-3 py-2.5 transition-colors focus:border-evolve-yellow/60"
            style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
          />
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="text-white/30 hover:text-red-400 w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg hover:bg-white/[0.04]"
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="text-evolve-yellow text-xs font-semibold w-fit hover:opacity-80"
      >
        + add link
      </button>
    </div>
  );
}

function ClippedText({ text, rawLength, previewLen = 600 }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;
  const isClipped = text.length > previewLen;
  const shown = expanded || !isClipped ? text : text.slice(0, previewLen) + "…";
  const totalChars = rawLength ?? text.length;
  const wasTruncatedServerSide = rawLength != null && rawLength > text.length;
  return (
    <div>
      <p className="text-white/60 text-xs mt-1 whitespace-pre-wrap">{shown}</p>
      <div className="flex items-center gap-3 mt-1">
        {isClipped && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-evolve-yellow text-[11px] font-semibold hover:opacity-80"
          >
            {expanded ? "show less" : "show full text"}
          </button>
        )}
        <span className="text-white/25 text-[11px]">
          {totalChars.toLocaleString()} characters captured
          {wasTruncatedServerSide ? " (capped)" : ""}
        </span>
      </div>
    </div>
  );
}

function ExtractedProfilePreview({ data }) {
  return (
    <div
      className="border border-[#373737] rounded-xl p-4 flex flex-col gap-4"
      style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
    >
      <div>
        <p className="text-evolve-yellow text-xs font-bold mb-1">
          Preview — raw extracted profile
        </p>
        <p className="text-white/40 text-xs">{data.note}</p>
      </div>

      {data.portfolio && (
        <div className="flex flex-col gap-2">
          <p className="text-white text-xs font-semibold">Portfolio</p>
          {data.portfolio.rendered_with && (
            <p className="text-white/30 text-[11px]">
              {data.portfolio.rendered_with}
            </p>
          )}
          {data.portfolio.note && (
            <p className="text-white/40 text-xs">{data.portfolio.note}</p>
          )}
          {(data.portfolio.pages || []).map((p, i) => (
            <div key={i} className="border-t border-[#2a2a2a] pt-2">
              <p className="text-white/50 text-[11px] flex items-center gap-1.5">
                <span
                  className={p.ok ? "text-evolve-inchworm" : "text-red-400"}
                >
                  {p.ok ? "✓" : "✗"}
                </span>
                <span className="truncate">{p.url}</span>
              </p>
              {p.screenshot_urls?.length > 0 && (
                <div className="flex gap-2 overflow-x-auto mt-2 pb-1">
                  {p.screenshot_urls.map((shotUrl, si) => (
                    <a
                      key={si}
                      href={shotUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-shrink-0"
                    >
                      <img
                        src={shotUrl}
                        alt=""
                        className="h-40 rounded-lg border border-[#2a2a2a] hover:border-evolve-yellow/40 transition-colors"
                      />
                    </a>
                  ))}
                </div>
              )}
              {p.screenshot_debug && (
                <p className="text-white/25 text-[10px] mt-1 font-mono break-all">
                  {p.screenshot_debug}
                </p>
              )}
              <ClippedText text={p.text} rawLength={p.raw_length} />
            </div>
          ))}
        </div>
      )}

      {data.resume && (
        <div className="flex flex-col gap-2 border-t border-[#2a2a2a] pt-3">
          <p className="text-white text-xs font-semibold">Resume</p>
          <p className="text-white/50 text-[11px] truncate">
            {data.resume.source_url}
          </p>
          {data.resume.note && (
            <p className="text-white/40 text-xs">{data.resume.note}</p>
          )}
          <ClippedText
            text={data.resume.text}
            rawLength={data.resume.raw_length}
          />
        </div>
      )}
    </div>
  );
}

/* ── AI Profile Reveal — the Gemini-analyzed profile. Role/Niche/Domain/
   Sector/Location stay as tags (they're identity, not magnitude — charting
   a label doesn't make it truer). Everything that IS a real score or ratio
   gets a real chart: a radar for the five qualitative signals together, a
   ranked bar for tool emphasis, a donut for the validation ratio, and a
   hero ring for the composite score — all derived from data already on the
   profile, nothing fabricated to look more precise than it is. ─────────── */

const YELLOW = "#FFD007";
const TRACK = "rgba(255,255,255,0.08)";

const EXPERIENCE_BUCKETS = [
  "Starting",
  "<1",
  "1-2",
  "2-5",
  "5-10",
  "10-15",
  "15+",
  "over 20"
];
const STRENGTH_LEVELS = {
  high: 3,
  strong: 3,
  medium: 2,
  partial: 2,
  low: 1,
  absent: 0
};
const TEAM_LEVELS = { leadership: 3, collaborative: 2, mixed: 2, solo: 1 };

function levelOf(v) {
  return STRENGTH_LEVELS[String(v || "").toLowerCase()] ?? 0;
}

function computeSkillAxes(profile) {
  return [
    {
      axis: "Business",
      value: levelOf(profile?.understanding_of_business?.score)
    },
    { axis: "Clarity", value: levelOf(profile?.foundational_clarity?.score) },
    {
      axis: "Leadership",
      value:
        TEAM_LEVELS[
          String(profile?.team_work_proficiency?.mode || "").toLowerCase()
        ] ?? 0
    },
    { axis: "Learning", value: profile?.learning?.present ? 3 : 0 },
    { axis: "Community", value: profile?.contributing_back?.present ? 3 : 0 }
  ];
}

// The headline "signal score" has to agree with the strong/growth map right
// below it, so it's driven by the same dimension_ratings data (already
// calibrated per-person by the model) rather than a fixed checklist that
// includes bonus signals like "has a blog" — those are genuinely optional
// for most working designers and shouldn't be able to drag a strong,
// well-validated profile down to a middling-looking number. The old
// axes-based calc is kept only as a fallback for profiles saved before
// dimension_ratings existed.
function computeHeroScore(profile, axes) {
  const dims = (profile?.dimension_ratings || []).filter((r) => r?.dimension);
  if (dims.length > 0) {
    const avg =
      dims.reduce(
        (s, r) => s + (DIMENSION_SCORE_LEVELS[String(r.score || "").toLowerCase()] ?? 1),
        0
      ) / (dims.length * 4);
    return Math.round(avg * 100);
  }
  const avg = axes.reduce((s, a) => s + a.value, 0) / (axes.length * 3);
  return Math.round(avg * 100);
}

function Tag({ children }) {
  if (!children) return null;
  return (
    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full border border-[#373737] text-white/60">
      {children}
    </span>
  );
}

/* Hand-drawn ring (not a chart-library radial) so the score can sit
   centered inside it — a simple stroked circle, no illustrative path data. */
function HeroScoreRing({ score }) {
  const r = 54,
    c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div className="relative w-36 h-36 flex-shrink-0">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={TRACK}
          strokeWidth="10"
        />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={YELLOW}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 900ms ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-white text-3xl font-bold">{score}</span>
        <span className="text-white/40 text-[10px] uppercase tracking-wide">
          Signal score
        </span>
      </div>
    </div>
  );
}

function SkillRadarChart({ axes }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={axes} outerRadius="72%">
          <PolarGrid stroke="rgba(255,255,255,0.12)" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }}
          />
          <Radar
            dataKey="value"
            stroke={YELLOW}
            fill={YELLOW}
            fillOpacity={0.35}
            strokeWidth={2}
            isAnimationActive
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

const KNOWN_TOOL_NAMES = [
  "Figma",
  "FigJam",
  "Sketch",
  "Framer",
  "Webflow",
  "Adobe XD",
  "Photoshop",
  "Illustrator",
  "InDesign",
  "After Effects",
  "Premiere Pro",
  "Blender",
  "Cinema 4D",
  "Miro",
  "Notion",
  "Jira",
  "Maze",
  "Hotjar",
  "Google Analytics",
  "HTML",
  "CSS",
  "JavaScript",
  "React",
  "Spline",
  "Canva",
  "Procreate",
  "Midjourney",
  "ChatGPT"
];

function inferToolRowsFromProfile(profile) {
  const explicit = [...(profile?.tool_proficiency || [])].filter((t) => t?.name);
  const seen = new Set(explicit.map((t) => t.name.toLowerCase()));
  const haystack = JSON.stringify({
    skills: profile?.skills,
    works: profile?.notable_works,
    highlights: profile?.recruiter_highlights,
    ai: profile?.ai_proficiency,
    summary: profile?.summary
  }).toLowerCase();

  const inferred = [];
  for (const name of KNOWN_TOOL_NAMES) {
    const key = name.toLowerCase();
    if (seen.has(key) || !haystack.includes(key)) continue;
    inferred.push({ name, emphasis: 1, inferred: true });
    seen.add(key);
  }

  for (const name of profile?.ai_proficiency?.tools || []) {
    if (!name || seen.has(String(name).toLowerCase())) continue;
    inferred.push({ name, emphasis: 1, inferred: true });
    seen.add(String(name).toLowerCase());
  }

  return [...explicit, ...inferred];
}

function ToolBarChart({ tools }) {
  const rows = [...(tools || [])]
    .filter((t) => t?.name)
    .sort((a, b) => (b.emphasis || 0) - (a.emphasis || 0))
    .slice(0, 8);
  if (!rows.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/10 p-4">
        <p className="text-white/45 text-xs leading-snug">
          No tool names were detected in the analyzed portfolio or resume.
        </p>
      </div>
    );
  }
  return (
    <div style={{ height: Math.max(rows.length * 34, 100) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={rows}
          layout="vertical"
          margin={{ top: 0, right: 24, bottom: 0, left: 0 }}
        >
          <XAxis type="number" domain={[0, 3]} hide />
          <YAxis
            type="category"
            dataKey="name"
            width={110}
            tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Bar
            dataKey="emphasis"
            radius={[0, 6, 6, 0]}
            barSize={12}
            isAnimationActive
          >
            {rows.map((r, i) => (
              <Cell
                key={i}
                fill={YELLOW}
                fillOpacity={0.4 + (r.emphasis || 0) * 0.2}
              />
            ))}
            <LabelList
              dataKey="emphasis"
              position="right"
              formatter={(v) => "●".repeat(v)}
              fill={YELLOW}
              fontSize={10}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ValidationDonut({ validated, unvalidated }) {
  const v = validated || 0,
    u = unvalidated || 0,
    total = v + u;
  const pct = total > 0 ? Math.round((v / total) * 100) : 0;
  const data =
    total > 0
      ? [
          { name: "verified", value: v },
          { name: "self-initiated", value: u }
        ]
      : [{ name: "none", value: 1 }];
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-24 h-24 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={32}
              outerRadius={44}
              startAngle={90}
              endAngle={-270}
              stroke="none"
              isAnimationActive
            >
              {total > 0 ? (
                <>
                  <Cell fill={YELLOW} />
                  <Cell fill={TRACK} />
                </>
              ) : (
                <Cell fill={TRACK} />
              )}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-sm font-bold">
            {total > 0 ? `${pct}%` : "—"}
          </span>
        </div>
      </div>
      <p className="text-white/50 text-xs leading-relaxed">
        {total > 0 ? (
          <>
            <span className="text-white font-semibold">{v}</span> verified
            project{v === 1 ? "" : "s"} tied to named clients,{" "}
            <span className="text-white font-semibold">{u}</span>{" "}
            self-initiated.
          </>
        ) : (
          "No project ties detected."
        )}
      </p>
    </div>
  );
}

function SignalEvidence({ label, badge, points }) {
  const list = Array.isArray(points)
    ? points.filter(Boolean)
    : points
      ? [points]
      : [];
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-white/40 text-[11px] uppercase tracking-wide">
          {label}
        </p>
        {badge}
      </div>
      {list.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {list.map((pt, i) => (
            <span
              key={i}
              title={pt}
              className="max-w-full rounded-full border border-white/10 bg-white/[0.03] px-2 py-1 text-white/55 text-[11px] leading-snug"
            >
              {pt}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function StatTile({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5 border border-[#2a2a2a] rounded-xl px-4 py-3 bg-white/[0.02]">
      <span className="text-white text-xl font-bold">{value}</span>
      <span className="text-white/40 text-[10px] uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

function SignalMetric({ label, value, max = 3, tone = YELLOW }) {
  const safeValue = Math.max(0, Math.min(max, value || 0));
  const pct = max > 0 ? (safeValue / max) * 100 : 0;
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-white/65 text-xs font-semibold">{label}</span>
        <span className="text-white/35 text-[10px] font-bold">
          {safeValue}/{max}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: TRACK }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: tone }}
        />
      </div>
      <div className="grid grid-cols-3 gap-1">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className="h-5 rounded-md border"
            style={{
              borderColor: n <= safeValue ? tone : "rgba(255,255,255,0.08)",
              background: n <= safeValue ? `${tone}22` : "rgba(255,255,255,0.02)"
            }}
          />
        ))}
      </div>
    </div>
  );
}

function FactStrip({ items }) {
  const list = items.filter((item) => item.value && item.value !== "Not specified");
  if (!list.length) return null;
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
      {list.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-white/10 bg-white/[0.025] p-3 flex flex-col gap-2"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-white/35 text-[10px] uppercase tracking-wide">
              {item.label}
            </span>
            <span
              className="w-7 h-1 rounded-full"
              style={{ background: item.tone || YELLOW }}
            />
          </div>
          <p className="text-white/75 text-xs font-semibold leading-snug">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function SignalMeterGrid({ profile, axes }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 flex flex-col gap-3">
      <p className="text-white/40 text-[11px] uppercase tracking-wide">
        Signal Meters
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
      {axes.map((a) => (
        <SignalMetric key={a.axis} label={a.axis} value={a.value} />
      ))}
      {profile?.ai_proficiency?.present && (
        <SignalMetric label="AI" value={2} tone={STRONG_GREEN} />
      )}
      </div>
    </div>
  );
}

const DIMENSION_SCORE_LEVELS = {
  strong: 4,
  good: 3,
  partial: 2,
  developing: 2,
  unclear: 1,
  weak: 1
};
const STRONG_GREEN = "#8DD57C";
const GROWTH_AMBER = "#FFB14F";

function isStrongDimension(score) {
  return (DIMENSION_SCORE_LEVELS[String(score || "").toLowerCase()] ?? 1) >= 3;
}

// the strong-zones/growth-zones map — the single place a strength or a
// growth area shows up now, derived entirely from dimension_ratings and
// color-coded instead of written as a critique sentence someone has to
// weigh and verify against the portfolio itself.
function ZoneCard({ tone, title, items }) {
  if (!items.length) return null;
  const strong = tone === "strong";
  const color = strong ? STRONG_GREEN : GROWTH_AMBER;
  return (
    <div
      className="flex-1 min-w-[220px] flex flex-col gap-3 rounded-2xl border p-4"
      style={{
        borderColor: strong ? "rgba(141,213,124,0.28)" : "rgba(255,177,79,0.28)",
        background: strong ? "rgba(141,213,124,0.06)" : "rgba(255,177,79,0.06)"
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: color }}
        />
        <p
          className="text-[11px] font-bold uppercase tracking-wide"
          style={{ color }}
        >
          {title}
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {items.map((r, i) => (
          <div key={i} className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-white text-xs font-semibold">
                {r.dimension}
              </span>
              <span className="text-white/40 text-[10px] font-semibold flex-shrink-0">
                {r.score}
              </span>
            </div>
            <div
              className="w-full h-1 rounded-full overflow-hidden"
              style={{ background: TRACK }}
            >
              <div
                className="h-1 rounded-full"
                style={{
                  width: `${((DIMENSION_SCORE_LEVELS[String(r.score || "").toLowerCase()] ?? 1) / 4) * 100}%`,
                  background: color
                }}
              />
            </div>
            {r.evidence && (
              <p
                title={r.evidence}
                className="text-white/40 text-[11px] leading-snug"
              >
                {r.evidence}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StrongGrowthZones({ ratings }) {
  const list = (ratings || []).filter((r) => r?.dimension);
  if (!list.length) return null;
  const strong = list.filter((r) => isStrongDimension(r.score));
  const growth = list.filter((r) => !isStrongDimension(r.score));
  return (
    <div className="flex flex-col gap-2">
      <p className="text-white/40 text-[11px] uppercase tracking-wide">
        Strong Zones &amp; Growth Areas
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <ZoneCard tone="strong" title="Strong Zones" items={strong} />
        <ZoneCard tone="growth" title="Growth Areas" items={growth} />
      </div>
    </div>
  );
}

function RecruiterHighlights({ points }) {
  const list = (points || []).filter(Boolean);
  if (!list.length) return null;
  return (
    <div className="rounded-2xl border border-evolve-yellow/30 bg-evolve-yellow/[0.05] p-4 flex flex-col gap-3">
      <p className="text-evolve-yellow text-[11px] font-bold uppercase tracking-wide">
        For Recruiters — at a glance
      </p>
      <div className="grid sm:grid-cols-2 gap-2">
        {list.map((pt, i) => (
          <div
            key={i}
            title={pt}
            className="flex items-center gap-2 rounded-xl border border-evolve-yellow/15 bg-black/15 px-3 py-2 min-w-0"
          >
            <span className="w-2 h-2 rounded-full bg-evolve-yellow flex-shrink-0" />
            <span className="text-white/85 text-xs font-semibold leading-snug">
              {pt}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// AI-extracted case studies with (when the source actually gave one) their
// own link — clickable proof, pulled straight from the resume/portfolio
// text instead of asked of the user.
function NotableWorks({ works }) {
  const list = (works || []).filter((w) => w?.title);
  if (!list.length) return null;
  return (
    <div className="flex flex-col gap-2">
      <p className="text-white/40 text-[11px] uppercase tracking-wide">
        Project Blocks
      </p>
      <div className="grid sm:grid-cols-3 gap-2">
        {list.map((w, i) => {
          const Tag = w.link ? "a" : "div";
          const tagProps = w.link
            ? {
                href: withScheme(w.link),
                target: "_blank",
                rel: "noopener noreferrer"
              }
            : {};
          return (
            <Tag
              key={i}
              {...tagProps}
              title={[w.title, w.client, w.summary].filter(Boolean).join(" - ")}
              className={`relative overflow-hidden flex flex-col justify-between rounded-xl border p-3 transition-colors ${
                i % 5 === 0 ? "col-span-2" : ""
              } ${
                w.link
                  ? "border-evolve-yellow/25 bg-evolve-yellow/[0.06] hover:border-evolve-yellow/60"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <div className="flex items-start justify-between gap-2 min-w-0">
                <p className="text-white text-sm font-bold leading-tight">{w.title}</p>
                {w.link && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-evolve-yellow/70 flex-shrink-0 mt-0.5"
                  >
                    <path
                      d="M7 17L17 7M7 7h10v10"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              {w.summary && (
                <p className="text-white/50 text-[11px] leading-snug mt-2">
                  {w.summary}
                </p>
              )}
              <div className="flex items-end justify-between gap-2 mt-3">
                <div className="min-w-0">
                  <span className="text-evolve-yellow/80 text-[10px] font-bold uppercase tracking-wide">
                    {w.client || "Self / Academic"}
                  </span>
                  <div className="grid grid-cols-3 gap-1 mt-2 w-20">
                    {[0, 1, 2].map((n) => (
                      <span
                        key={n}
                        className="h-1 rounded-full"
                        style={{
                          background:
                            n <= (w.link ? 2 : 1) ? YELLOW : "rgba(255,255,255,0.12)"
                        }}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-white/25 text-2xl font-black leading-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
            </Tag>
          );
        })}
      </div>
    </div>
  );
}

function CareerJourney({ journey }) {
  if (!journey?.length) return null;
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {journey.map((stage, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full border border-[#373737] text-white/60">
            {stage}
          </span>
          {i < journey.length - 1 && (
            <span className="text-white/30 text-xs">→</span>
          )}
        </div>
      ))}
    </div>
  );
}

// small circular icon buttons for portfolio / resume / each social link —
// what makes the shared AI profile a one-stop hub instead of just a summary.
// design-craft skill tags (logo design, illustration, motion, etc.) — the
// thing that used to be buried inside a gap/strength sentence and never
// surfaced anywhere on its own. Read straight off profile.skills.
const SKILL_LEVEL_DOTS = { Core: 3, Practiced: 2, Exposure: 1 };

function SkillChips({ skills }) {
  const list = (skills || []).filter((s) => s?.skill);
  if (!list.length) return null;
  return (
    <div className="flex flex-col gap-2">
      <p className="text-white/40 text-[11px] uppercase tracking-wide">
        Design Skills
      </p>
      <div className="flex flex-wrap gap-2">
        {list.map((s, i) => (
          <div
            key={i}
            title={s.evidence}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] pl-3 pr-2.5 py-1.5"
          >
            <span className="text-white text-xs font-semibold">{s.skill}</span>
            <span className="flex items-center gap-0.5">
              {[1, 2, 3].map((n) => (
                <span
                  key={n}
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{
                    background:
                      n <= (SKILL_LEVEL_DOTS[s.level] || 1) ? YELLOW : TRACK
                  }}
                />
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoleFitMap({ role, business, clarity }) {
  const businessLevel = levelOf(business?.score);
  const clarityLevel = levelOf(clarity?.score);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-white/40 text-[11px] uppercase tracking-wide">
          Role Fit Snapshot
        </p>
        <Tag>{role?.primary}</Tag>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-evolve-yellow/20 bg-evolve-yellow/[0.06] p-3">
          <p className="text-white/35 text-[10px] uppercase tracking-wide">
            Primary
          </p>
          <p className="text-white text-sm font-bold leading-tight mt-1">
            {role?.primary || "Role unclear"}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/10 p-3">
          <p className="text-white/35 text-[10px] uppercase tracking-wide">
            Secondary
          </p>
          <p className="text-white/70 text-sm font-bold leading-tight mt-1">
            {role?.secondary || "Not split"}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <SignalMetric label="Business framing" value={businessLevel} />
        <SignalMetric label="Case-study clarity" value={clarityLevel} tone={STRONG_GREEN} />
      </div>
    </div>
  );
}

function ProofDepthPanel({ links, projects, validated, tools }) {
  const projectList = (projects || []).filter((w) => w?.title);
  const linkedProjects = projectList.filter((w) => w.link).length;
  const clientProjects = projectList.filter((w) => w.client).length;
  const linkCount = mergeLinks([], linksObjectToArray(links)).length;
  const checks = [
    { label: "Named projects", active: projectList.length > 0, value: projectList.length },
    { label: "Project links", active: linkedProjects > 0, value: linkedProjects },
    { label: "Client proof", active: (validated || 0) > 0 || clientProjects > 0, value: validated || clientProjects },
    { label: "Tools found", active: (tools || []).length > 0, value: (tools || []).length },
    { label: "Contact links", active: linkCount > 0, value: linkCount }
  ];
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 flex flex-col gap-3">
      <p className="text-white/40 text-[11px] uppercase tracking-wide">
        Recruiter Evidence
      </p>
      <div className="flex flex-col gap-2">
        {checks.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-white/10 bg-black/10 px-3 py-2 flex items-center gap-3"
          >
            <span
              className="w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{
                borderColor: item.active ? `${YELLOW}88` : "rgba(255,255,255,0.12)",
                background: item.active ? "rgba(255,208,7,0.12)" : "rgba(255,255,255,0.03)",
                color: item.active ? YELLOW : "rgba(255,255,255,0.35)"
              }}
            >
              {item.value}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-white/75 text-xs font-semibold">{item.label}</p>
              <div className="h-1 rounded-full mt-1.5 overflow-hidden" style={{ background: TRACK }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, (item.value / 5) * 100)}%`,
                    background: item.active ? YELLOW : "rgba(255,255,255,0.15)"
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InterviewFocus({ ratings, traits }) {
  const growth = (ratings || [])
    .filter((r) => r?.dimension && !isStrongDimension(r.score))
    .slice(0, 3);
  const extremes = (traits || [])
    .filter((t) => t?.left_label && t?.right_label)
    .slice(0, 2);
  if (!growth.length && !extremes.length) return null;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 flex flex-col gap-3">
      <p className="text-white/40 text-[11px] uppercase tracking-wide">
        Interview Focus
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {growth.map((r, i) => (
          <div key={`g-${i}`} className="rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-3">
            <p className="text-amber-200/90 text-xs font-bold">{r.dimension}</p>
            {r.evidence && (
              <p className="text-white/50 text-[11px] leading-snug mt-1">
                {r.evidence}
              </p>
            )}
          </div>
        ))}
        {extremes.map((t, i) => {
          const left = (t.score || 3) <= 3;
          return (
            <div key={`t-${i}`} className="rounded-xl border border-white/10 bg-black/10 p-3">
              <p className="text-white/70 text-xs font-bold">
                {left ? t.left_label : t.right_label}
              </p>
              <p className="text-white/40 text-[11px] leading-snug mt-1">
                {t.evidence}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// bipolar sliders for the tensions a review sentence usually smuggles in
// ("focuses on visuals without showing research") — placed as an evidenced
// score between two labeled poles instead of left as a sentence to parse.
function PersonaTraitBar({ trait }) {
  if (!trait?.left_label || !trait?.right_label) return null;
  const score = Math.min(5, Math.max(1, trait.score || 3));
  const pct = ((score - 1) / 4) * 100;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2 text-[11px] font-semibold">
        <span className={score <= 2 ? "text-evolve-yellow" : "text-white/40"}>
          {trait.left_label}
        </span>
        <span className={score >= 4 ? "text-evolve-yellow" : "text-white/40"}>
          {trait.right_label}
        </span>
      </div>
      <div
        className="relative w-full h-1.5 rounded-full"
        style={{ background: TRACK }}
      >
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full transition-[left] duration-500"
          style={{ left: `calc(${pct}% - 7px)`, background: YELLOW }}
        />
      </div>
      {trait.evidence && (
        <p
          title={trait.evidence}
          className="text-white/40 text-[11px] leading-snug"
        >
          {trait.evidence}
        </p>
      )}
    </div>
  );
}

function PersonaTraits({ traits }) {
  const list = (traits || []).filter((t) => t?.left_label && t?.right_label);
  if (!list.length) return null;
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <p className="text-white/40 text-[11px] uppercase tracking-wide">
        How They Work
      </p>
      <div className="flex flex-col gap-4">
        {list.map((t, i) => (
          <PersonaTraitBar key={i} trait={t} />
        ))}
      </div>
    </div>
  );
}

function withScheme(url) {
  return /^(https?:|mailto:)/.test(url) ? url : `https://${url}`;
}

// the AI extracts these straight out of the resume/portfolio text (see
// `links` in analyze-profile-data's schema) — turned into the same
// {platform, url} shape as the user's manually-added social_links so both
// sources render through one merged, deduped list below.
function linksObjectToArray(links) {
  if (!links) return [];
  const out = [];
  if (links.linkedin) out.push({ platform: "linkedin", url: links.linkedin });
  if (links.github) out.push({ platform: "github", url: links.github });
  if (links.behance) out.push({ platform: "behance", url: links.behance });
  if (links.dribbble) out.push({ platform: "dribbble", url: links.dribbble });
  if (links.personal_website)
    out.push({ platform: "website", url: links.personal_website });
  if (links.email)
    out.push({ platform: "email", url: `mailto:${links.email}` });
  for (const o of links.other || []) {
    if (o?.url) out.push({ platform: o.platform || "link", url: o.url });
  }
  return out;
}

function mergeLinks(manual, extracted) {
  const seen = new Set();
  const merged = [];
  for (const l of [...(manual || []), ...extracted]) {
    if (!l?.url) continue;
    const key = l.url.trim().toLowerCase().replace(/\/$/, "");
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(l);
  }
  return merged;
}

const PLATFORM_LABELS = {
  linkedin: "LinkedIn",
  github: "GitHub",
  behance: "Behance",
  dribbble: "Dribbble",
  website: "Website",
  email: "Email",
  youtube: "YouTube",
  instagram: "Instagram",
  twitter: "X / Twitter",
  x: "X / Twitter",
  "x / twitter": "X / Twitter",
  medium: "Medium",
  notion: "Notion"
};

function prettyPlatform(p) {
  if (!p) return "Link";
  const known = PLATFORM_LABELS[p.toLowerCase().trim()];
  if (known) return known;
  return p.replace(/\b\w/g, (c) => c.toUpperCase());
}

// text-labeled (not a bare initial) so every extracted link is legible on
// sight — a single ambiguous letter reads as "did this even extract?".
function SocialLinkPill({ platform, url }) {
  if (!url) return null;
  return (
    <a
      href={withScheme(url)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] pl-2.5 pr-3 py-1.5 text-white/70 text-[11px] font-semibold hover:text-evolve-yellow hover:border-evolve-yellow/40 transition-colors flex-shrink-0"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-evolve-yellow/70 flex-shrink-0" />
      {prettyPlatform(platform)}
    </a>
  );
}

function LinkPill({ href, label, children }) {
  if (!href) return null;
  return (
    <a
      href={withScheme(href)}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/60 hover:text-evolve-yellow hover:border-evolve-yellow/40 text-[11px] font-bold flex-shrink-0 transition-colors"
    >
      {children}
    </a>
  );
}

function ProfileLinksRow({
  portfolioLink,
  portfolioFileUrl,
  resumeLink,
  resumeFileUrl,
  socialLinks,
  extractedLinks
}) {
  const portfolio = portfolioLink || portfolioFileUrl;
  const resume = resumeLink || resumeFileUrl;
  const links = mergeLinks(socialLinks, linksObjectToArray(extractedLinks));
  if (!portfolio && !resume && !links.length) return null;
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {portfolio && (
        <LinkPill href={portfolio} label="Portfolio">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <rect
              x="3"
              y="7"
              width="18"
              height="13"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"
              stroke="currentColor"
              strokeWidth="1.8"
            />
          </svg>
        </LinkPill>
      )}
      {resume && (
        <LinkPill href={resume} label="Resume">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path
              d="M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path
              d="M9 13h6M9 17h6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </LinkPill>
      )}
      {links.map((l, i) => (
        <SocialLinkPill key={i} platform={l.platform} url={l.url} />
      ))}
    </div>
  );
}

export function AIProfileReveal({
  profile,
  portfolioLink,
  portfolioFileUrl,
  resumeLink,
  resumeFileUrl,
  socialLinks
}) {
  if (!profile) return null;
  const {
    role,
    skills,
    persona_traits,
    niche,
    domain,
    sector,
    stage,
    work_experience,
    type_of_work_wanted,
    team_work_proficiency,
    understanding_of_business,
    foundational_clarity,
    learning,
    contributing_back,
    tool_proficiency,
    ai_proficiency,
    real_work_validation,
    career_switching,
    location,
    work_preference,
    salary_expectations,
    current_status,
    links,
    summary,
    recruiter_highlights,
    notable_works,
    dimension_ratings
  } = profile;

  const displayTools = inferToolRowsFromProfile(profile);
  const axes = computeSkillAxes(profile);
  const heroScore = computeHeroScore(profile, axes);
  const expIdx = EXPERIENCE_BUCKETS.findIndex(
    (b) =>
      b.toLowerCase() ===
      String(work_experience || "")
        .trim()
        .toLowerCase()
  );
  const verifiedCount = real_work_validation?.validated_count || 0;
  const toolCount = displayTools.length;

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-white/10 p-6 sm:p-8 flex flex-col gap-8"
      style={{ backgroundColor: "#18181b" }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: `linear-gradient(90deg, ${YELLOW}, ${STRONG_GREEN})`
        }}
      />
      <div className="flex flex-col sm:flex-row gap-6 sm:items-center">
        <HeroScoreRing score={heroScore} />
        <div className="flex flex-col gap-3 min-w-0">
          <p className="text-evolve-yellow text-[11px] font-bold uppercase tracking-[0.15em]">
            AI-Built Profile
          </p>
          <h2 className="text-white text-2xl sm:text-3xl font-bold leading-tight">
            {role?.primary}
            {role?.secondary && (
              <span className="text-white/40"> · {role.secondary}</span>
            )}
          </h2>
          <div className="flex flex-wrap gap-2">
            {stage?.level && <Tag>{stage.level}</Tag>}
            {niche && niche.toLowerCase() !== "not specified" && (
              <Tag>{niche}</Tag>
            )}
            <Tag>{domain}</Tag>
            <Tag>{sector}</Tag>
            {type_of_work_wanted && <Tag>wants: {type_of_work_wanted}</Tag>}
          </div>
          <ProfileLinksRow
            portfolioLink={portfolioLink}
            portfolioFileUrl={portfolioFileUrl}
            resumeLink={resumeLink}
            resumeFileUrl={resumeFileUrl}
            socialLinks={socialLinks}
            extractedLinks={links}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatTile label="Experience" value={work_experience || "—"} />
        <StatTile label="Verified Projects" value={verifiedCount} />
        <StatTile label="Tools Cited" value={toolCount} />
      </div>

      <FactStrip
        items={[
          { label: "Location", value: location, tone: STRONG_GREEN },
          { label: "Preference", value: work_preference, tone: YELLOW },
          { label: "Status", value: current_status, tone: GROWTH_AMBER },
          { label: "Target Work", value: type_of_work_wanted, tone: YELLOW }
        ]}
      />

      <SignalMeterGrid profile={profile} axes={axes} />

      <div className="grid md:grid-cols-2 gap-4">
        <RoleFitMap
          role={role}
          business={understanding_of_business}
          clarity={foundational_clarity}
        />
        <ProofDepthPanel
          links={links}
          projects={notable_works}
          validated={real_work_validation?.validated_count}
          tools={displayTools}
        />
      </div>

      <StrongGrowthZones ratings={dimension_ratings} />

      <SkillChips skills={skills} />

      <RecruiterHighlights points={recruiter_highlights} />

      <PersonaTraits traits={persona_traits} />

      {summary && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3.5 flex items-center gap-3">
          <span className="w-2 h-10 rounded-full bg-evolve-yellow flex-shrink-0" />
          <p className="text-white/75 text-sm leading-snug">
            {summary}
          </p>
        </div>
      )}

      <InterviewFocus ratings={dimension_ratings} traits={persona_traits} />

      <NotableWorks works={notable_works} />

      <div className="flex flex-col gap-2">
        <p className="text-white/40 text-[11px] uppercase tracking-wide">
          Experience
        </p>
        <div className="flex items-end gap-1.5">
          {EXPERIENCE_BUCKETS.map((b, i) => (
            <div key={b} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className="w-full h-1.5 rounded-full transition-colors"
                style={
                  expIdx !== -1 && i <= expIdx
                    ? {
                        background: `linear-gradient(90deg, ${YELLOW}55, ${YELLOW})`
                      }
                    : { background: TRACK }
                }
              />
              <span
                className={`text-[9px] whitespace-nowrap ${expIdx === i ? "text-evolve-yellow font-bold" : "text-white/30"}`}
              >
                {b}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-start rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex flex-col gap-2">
          <p className="text-white/40 text-[11px] uppercase tracking-wide">
            Skill Signal
          </p>
          <SkillRadarChart axes={axes} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <SignalEvidence
            label="Team Work"
            badge={<Tag>{team_work_proficiency?.mode}</Tag>}
            points={team_work_proficiency?.key_points}
          />
          <SignalEvidence
            label="Business"
            badge={<Tag>{understanding_of_business?.score}</Tag>}
            points={understanding_of_business?.key_points}
          />
          <SignalEvidence
            label="Clarity"
            badge={<Tag>{foundational_clarity?.score}</Tag>}
            points={foundational_clarity?.key_points}
          />
          <SignalEvidence
            label="Learning"
            badge={<Tag>{learning?.present ? "Active" : "Not evident"}</Tag>}
            points={learning?.key_points}
          />
          <SignalEvidence
            label="Community"
            badge={
              <Tag>{contributing_back?.present ? "Yes" : "Not evident"}</Tag>
            }
            points={contributing_back?.types}
          />
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="text-white/40 text-[11px] uppercase tracking-wide">
                Career Switch
              </p>
              <Tag>{career_switching?.detected ? "Detected" : "None"}</Tag>
            </div>
            <CareerJourney journey={career_switching?.journey} />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex flex-col gap-2">
          <p className="text-white/40 text-[11px] uppercase tracking-wide">
            Tool Emphasis
          </p>
          <ToolBarChart tools={displayTools} />
          {ai_proficiency?.present && (
            <Tag>
              AI ·{" "}
              {(ai_proficiency.tools || []).join(", ") || ai_proficiency.mode}
            </Tag>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-white/40 text-[11px] uppercase tracking-wide">
            Real Work Validation
          </p>
          <ValidationDonut
            validated={real_work_validation?.validated_count}
            unvalidated={real_work_validation?.unvalidated_count}
          />
          {real_work_validation?.key_points?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {real_work_validation.key_points.map((pt, i) => (
                <span
                  key={i}
                  title={pt}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-1 text-white/50 text-[11px] leading-none"
                >
                  {pt}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10">
        {[
          ["Location", location],
          ["Work Preference", work_preference],
          ["Current Status", current_status],
          ["Salary", salary_expectations]
        ].map(([label, val]) => (
          <div key={label}>
            <p className="text-white/30 text-[10px] uppercase tracking-wide mb-1">
              {label}
            </p>
            <p className="text-white/60 text-xs">{val || "Not specified"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PortfolioResumeSection({ user }) {
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);

  const [portfolioLink, setPortfolioLink] = useState("");
  const [portfolioFileUrl, setPortfolioFileUrl] = useState(null);
  const [portfolioFile, setPortfolioFile] = useState(null);
  const [portfolioMode, setPortfolioMode] = useState("link");
  const [editingPortfolio, setEditingPortfolio] = useState(false);

  const [resumeLink, setResumeLink] = useState("");
  const [resumeFileUrl, setResumeFileUrl] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeMode, setResumeMode] = useState("link");
  const [editingResume, setEditingResume] = useState(false);

  const [saving, setSaving] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractStatus, setExtractStatus] = useState("none");
  const [extractedProfile, setExtractedProfile] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeStatus, setAnalyzeStatus] = useState("none");
  const [aiProfile, setAiProfile] = useState(null);
  const [analyzeError, setAnalyzeError] = useState("");

  const [isPublic, setIsPublic] = useState(false);
  const [publicToggling, setPublicToggling] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const [socialLinks, setSocialLinks] = useState([]);
  const [savedSocialLinks, setSavedSocialLinks] = useState([]);
  const [savingLinks, setSavingLinks] = useState(false);
  const linksDirty =
    JSON.stringify(socialLinks) !== JSON.stringify(savedSocialLinks);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select(
          "portfolio_link, portfolio_file_url, resume_link, resume_file_url, extracted_profile, extracted_profile_status, ai_profile, ai_profile_status, ai_profile_public, social_links, username"
        )
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (data) {
        setPortfolioLink(data.portfolio_link || "");
        setPortfolioFileUrl(data.portfolio_file_url || null);
        setResumeLink(data.resume_link || "");
        setResumeFileUrl(data.resume_file_url || null);
        setExtractedProfile(data.extracted_profile || null);
        setExtractStatus(data.extracted_profile_status || "none");
        setAiProfile(data.ai_profile || null);
        setAnalyzeStatus(data.ai_profile_status || "none");
        setIsPublic(!!data.ai_profile_public);
        setSocialLinks(data.social_links || []);
        setSavedSocialLinks(data.social_links || []);
        setEditingPortfolio(!data.portfolio_link && !data.portfolio_file_url);
        setEditingResume(!data.resume_link && !data.resume_file_url);
      }
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  function addLinkRow() {
    setSocialLinks((l) => [...l, { platform: LINK_PLATFORMS[0], url: "" }]);
  }
  function updateLinkRow(i, patch) {
    setSocialLinks((l) =>
      l.map((row, idx) => (idx === i ? { ...row, ...patch } : row))
    );
  }
  function removeLinkRow(i) {
    setSocialLinks((l) => l.filter((_, idx) => idx !== i));
  }
  async function handleSaveLinks() {
    setSavingLinks(true);
    const cleaned = socialLinks.filter((l) => l.url.trim());
    const { error } = await supabase
      .from("profiles")
      .update({ social_links: cleaned })
      .eq("id", user.id);
    if (!error) {
      setSocialLinks(cleaned);
      setSavedSocialLinks(cleaned);
    }
    setSavingLinks(false);
  }

  async function handleTogglePublic() {
    setPublicToggling(true);
    const next = !isPublic;
    const { error } = await supabase
      .from("profiles")
      .update({ ai_profile_public: next })
      .eq("id", user.id);
    if (!error) setIsPublic(next);
    setPublicToggling(false);
  }

  const shareUrl = user?.username
    ? `${window.location.origin}/profile/${user.username}`
    : "";

  function handleCopyLink() {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  }

  async function handleAnalyze() {
    setAnalyzeError("");
    setAnalyzing(true);
    setAnalyzeStatus("pending");
    try {
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/analyze-profile-data`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            apikey: SUPABASE_ANON_KEY
          },
          body: JSON.stringify({ user_id: user.id })
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "AI analysis failed");
      setAiProfile(json.ai_profile);
      setAnalyzeStatus("done");
    } catch (err) {
      setAnalyzeError(err.message || "AI analysis failed");
      setAnalyzeStatus("failed");
    } finally {
      setAnalyzing(false);
    }
  }

  async function uploadFile(file, prefix) {
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${prefix}-${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from("portfolio-files")
      .upload(path, file, { upsert: true });
    if (uploadErr) throw new Error(uploadErr.message);
    const { data } = supabase.storage
      .from("portfolio-files")
      .getPublicUrl(path);
    return data?.publicUrl || null;
  }

  const hasPortfolioValue = editingPortfolio
    ? portfolioMode === "link"
      ? !!portfolioLink.trim()
      : !!portfolioFile
    : !!(portfolioLink || portfolioFileUrl);
  const hasResumeValue = editingResume
    ? resumeMode === "link"
      ? !!resumeLink.trim()
      : !!resumeFile
    : !!(resumeLink || resumeFileUrl);
  const canBuild = hasPortfolioValue || hasResumeValue;

  async function handleBuildProfile() {
    setErrorMsg("");
    if (!canBuild) {
      setErrorMsg("add at least a portfolio or a resume first.");
      return;
    }

    setSaving(true);
    try {
      const payload = {};

      if (editingPortfolio) {
        if (portfolioMode === "link" && portfolioLink.trim()) {
          payload.portfolio_link = portfolioLink.trim();
          payload.portfolio_file_url = null;
        } else if (portfolioMode === "file" && portfolioFile) {
          payload.portfolio_file_url = await uploadFile(
            portfolioFile,
            "portfolio"
          );
          payload.portfolio_link = null;
        }
      }

      if (editingResume) {
        if (resumeMode === "link" && resumeLink.trim()) {
          payload.resume_link = resumeLink.trim();
          payload.resume_file_url = null;
        } else if (resumeMode === "file" && resumeFile) {
          payload.resume_file_url = await uploadFile(resumeFile, "resume");
          payload.resume_link = null;
        }
      }

      if (Object.keys(payload).length > 0) {
        await supabase.from("profiles").update(payload).eq("id", user.id);
        if ("portfolio_link" in payload) {
          setPortfolioLink(payload.portfolio_link || "");
          setPortfolioFileUrl(payload.portfolio_file_url || null);
        }
        if ("resume_link" in payload) {
          setResumeLink(payload.resume_link || "");
          setResumeFileUrl(payload.resume_file_url || null);
        }
      }

      setEditingPortfolio(false);
      setEditingResume(false);
      setSaving(false);

      setExtracting(true);
      setExtractStatus("pending");
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/extract-profile-data`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            apikey: SUPABASE_ANON_KEY
          },
          body: JSON.stringify({ user_id: user.id })
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "extraction failed");
      setExtractedProfile(json.extracted_profile);
      setExtractStatus("done");
    } catch (err) {
      setErrorMsg(err.message || "something went wrong");
      setExtractStatus("failed");
    } finally {
      setSaving(false);
      setExtracting(false);
    }
  }

  if (!loaded) return null;

  return (
    <div className="border border-evolve-yellow/20 rounded-2xl overflow-hidden md:w-[135%]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-3.5 text-left"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-evolve-yellow flex-shrink-0" />
        <span className="text-white text-sm font-bold flex-1">
          Portfolio &amp; Resume
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 20 20"
          fill="none"
          className={`text-evolve-yellow/70 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="flex flex-col gap-6 px-4 pb-5">
          <p className="text-white/40 text-xs -mt-1">
            Give us your portfolio and resume once — we'll build a profile from
            them so you don't have to keep sharing either separately.
          </p>

          <div className="flex flex-col gap-2">
            <label className="text-white/40 text-xs">Portfolio</label>
            {!editingPortfolio && (portfolioLink || portfolioFileUrl) ? (
              <ExistingSourceRow
                link={portfolioLink}
                fileUrl={portfolioFileUrl}
                onChange={() => setEditingPortfolio(true)}
              />
            ) : (
              <SourceEditor
                mode={portfolioMode}
                setMode={setPortfolioMode}
                linkValue={portfolioLink}
                setLinkValue={setPortfolioLink}
                file={portfolioFile}
                setFile={setPortfolioFile}
                accept={PORTFOLIO_ACCEPTED_TYPES}
                placeholder="https://your-portfolio.com"
              />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-white/40 text-xs">Resume</label>
            {!editingResume && (resumeLink || resumeFileUrl) ? (
              <ExistingSourceRow
                link={resumeLink}
                fileUrl={resumeFileUrl}
                onChange={() => setEditingResume(true)}
              />
            ) : (
              <SourceEditor
                mode={resumeMode}
                setMode={setResumeMode}
                linkValue={resumeLink}
                setLinkValue={setResumeLink}
                file={resumeFile}
                setFile={setResumeFile}
                accept={RESUME_ACCEPTED_TYPES}
                placeholder="https://drive.google.com/..."
              />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-white/40 text-xs">
              Work &amp; social links
            </label>
            <p className="text-white/30 text-[11px] -mt-1">
              LinkedIn, Behance, Dribbble, GitHub, your site — shown on your
              shared profile alongside the AI summary.
            </p>
            <LinksEditor
              links={socialLinks}
              onAdd={addLinkRow}
              onUpdate={updateLinkRow}
              onRemove={removeLinkRow}
            />
            {linksDirty && (
              <button
                type="button"
                onClick={handleSaveLinks}
                disabled={savingLinks}
                className="self-start bg-white/5 border border-evolve-yellow/40 text-evolve-yellow font-bold text-xs rounded-xl px-4 py-2 disabled:opacity-40 hover:bg-white/10 active:opacity-80 transition-colors"
              >
                {savingLinks ? "Saving…" : "Save links"}
              </button>
            )}
          </div>

          {errorMsg && <p className="text-red-400 text-xs">{errorMsg}</p>}

          <button
            type="button"
            onClick={handleBuildProfile}
            disabled={saving || extracting || !canBuild}
            className="self-start bg-evolve-yellow text-evolve-black font-bold text-xs rounded-xl px-5 py-2.5 disabled:opacity-40 active:opacity-80 transition-opacity"
          >
            {saving
              ? "Saving…"
              : extracting
                ? "Building profile…"
                : "Save & build profile"}
          </button>

          {extractedProfile && extractStatus === "done" && (
            <ExtractedProfilePreview data={extractedProfile} />
          )}
          {extractStatus === "failed" && !errorMsg && (
            <p className="text-red-400 text-xs">
              extraction failed — try again in a moment.
            </p>
          )}

          {extractStatus === "done" && (
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={analyzing}
                className="self-start bg-white/5 border border-evolve-yellow/40 text-evolve-yellow font-bold text-xs rounded-xl px-5 py-2.5 disabled:opacity-40 hover:bg-white/10 active:opacity-80 transition-colors"
              >
                {analyzing
                  ? "Building AI profile…"
                  : aiProfile
                    ? "Rebuild AI profile"
                    : "✨ Build AI profile"}
              </button>
              {analyzeError && (
                <p className="text-red-400 text-xs">{analyzeError}</p>
              )}

              {aiProfile && (
                <div className="flex flex-col gap-2 border border-[#2a2a2a] rounded-xl p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-white text-sm font-semibold">
                        Share with recruiters
                      </p>
                      <p className="text-white/40 text-xs mt-0.5">
                        Publishes a read-only link to this AI profile — no login
                        required to view.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleTogglePublic}
                      disabled={publicToggling}
                      className={`flex-shrink-0 w-11 h-6 rounded-full transition-colors relative disabled:opacity-40 ${isPublic ? "bg-evolve-yellow" : "bg-white/15"}`}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${isPublic ? "left-[22px]" : "left-0.5"}`}
                      />
                    </button>
                  </div>
                  {isPublic && shareUrl && (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        readOnly
                        value={shareUrl}
                        className="flex-1 text-xs text-white/70 bg-white/5 border border-[#373737] rounded-lg px-3 py-2 outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="text-evolve-yellow text-xs font-semibold px-3 py-2 rounded-lg border border-evolve-yellow/40 hover:bg-evolve-yellow/10 flex-shrink-0"
                      >
                        {linkCopied ? "Copied ✓" : "Copy"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {analyzeStatus === "done" && aiProfile && (
                <AIProfileReveal
                  profile={aiProfile}
                  portfolioLink={portfolioLink}
                  portfolioFileUrl={portfolioFileUrl}
                  resumeLink={resumeLink}
                  resumeFileUrl={resumeFileUrl}
                  socialLinks={savedSocialLinks}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── "My Account" — edit name/username, view (read-only) onboarding
   answers, disabled email ───────────────────────────────────────────────── */
export function MyAccountPanel({ onBack, onSaved }) {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  // fixed at mount — the questions already answered at onboarding, each
  // editable here in place. Doesn't re-derive as persona/etc. are edited so
  // the set of visible rows doesn't shift under the person mid-edit.
  const [answeredQuestions] = useState(() =>
    QUESTIONS.filter((q) => {
      if (q.id === "name") return false;
      if (q.condition && !q.condition(user || {})) return false;
      const val = user?.[q.id];
      return Array.isArray(val) ? val.length > 0 : !!val;
    })
  );

  const [onboardingDraft, setOnboardingDraft] = useState(() => {
    const draft = {};
    answeredQuestions.forEach((q) => {
      if (CHIP_MULTI_STRING.has(q.id)) {
        draft[q.id] = (user?.[q.id] || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      } else {
        draft[q.id] = user?.[q.id];
      }
    });
    return draft;
  });

  // auto-suggest a username from the name — only once the person actually
  // edits the name field (not on initial mount, which would clobber their
  // existing username with a freshly-slugified one), and only until they
  // edit the username field themselves, so it never overrides a deliberate
  // choice either.
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (!usernameTouched) setUsername(slugify(name));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  function onboardingFieldChanged(q) {
    const draftVal = onboardingDraft[q.id];
    if (CHIP_MULTI_STRING.has(q.id)) {
      const original = (user?.[q.id] || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      return draftVal.join(",") !== original.join(",");
    }
    if (Array.isArray(draftVal)) {
      const original = user?.[q.id] || [];
      return draftVal.join(",") !== original.join(",");
    }
    return draftVal !== (user?.[q.id] ?? draftVal);
  }

  const onboardingDirty = answeredQuestions.some(onboardingFieldChanged);
  const dirty =
    name !== (user?.name || "") ||
    username !== (user?.username || "") ||
    onboardingDirty;

  async function handleSave() {
    if (!name.trim()) {
      setUsernameError("");
      return;
    }
    setSaving(true);
    setUsernameError("");

    if (username !== (user?.username || "")) {
      if (!username.trim()) {
        setUsernameError("Username can't be empty.");
        setSaving(false);
        return;
      }
      const { data: taken } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .neq("id", user.id)
        .maybeSingle();
      if (taken) {
        setUsernameError("That username's already taken — try another.");
        setSaving(false);
        return;
      }
    }

    const usernameChanged = username !== (user?.username || "");
    const payload = { name: name.trim(), username };
    answeredQuestions.forEach((q) => {
      if (!onboardingFieldChanged(q)) return;
      payload[q.id] = CHIP_MULTI_STRING.has(q.id)
        ? onboardingDraft[q.id].join(", ")
        : onboardingDraft[q.id];
    });

    await supabase.from("profiles").update(payload).eq("id", user.id);
    await refreshUser();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    // the page this panel lives on is keyed off the username in the URL —
    // if it just changed, the caller needs to move to the new URL or the
    // page will 404 against the now-stale one.
    if (usernameChanged) onSaved?.(username);
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <BackHeader title="My Account" onBack={onBack} />

      <div className="flex flex-col gap-5">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-white/10 flex items-center justify-center text-white text-2xl font-bold">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            (user?.name || "?")[0].toUpperCase()
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-white/40 text-xs">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-sm text-white outline-none border border-[#373737] rounded-xl px-4 py-3 transition-colors focus:border-evolve-yellow/60"
            style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-white/40 text-xs">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsernameTouched(true);
              setUsername(slugify(e.target.value));
              setUsernameError("");
            }}
            className="w-full text-sm text-white outline-none border border-[#373737] rounded-xl px-4 py-3 transition-colors focus:border-evolve-yellow/60"
            style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
          />
          {usernameError && (
            <p className="text-red-400 text-xs">{usernameError}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-white/40 text-xs">Email</label>
          <input
            type="email"
            value={user?.email || ""}
            disabled
            className="w-full text-sm text-white/40 outline-none border border-[#373737] rounded-xl px-4 py-3 cursor-not-allowed"
            style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
          />
        </div>

        {answeredQuestions.length > 0 && (
          <div className="border border-evolve-yellow/20 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setOnboardingOpen((v) => !v)}
              className="w-full flex items-center gap-2 px-4 py-3.5 text-left"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-evolve-yellow flex-shrink-0" />
              <span className="text-white text-sm font-bold flex-1">
                Onboarding Questions
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 20 20"
                fill="none"
                className={`text-evolve-yellow/70 transition-transform ${onboardingOpen ? "rotate-180" : ""}`}
              >
                <path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {onboardingOpen && (
              <div className="flex flex-col px-4 pb-4">
                {answeredQuestions.map((q, i) => {
                  const draftVal = onboardingDraft[q.id];
                  const options =
                    typeof q.chips === "function"
                      ? q.chips(user || {})
                      : q.chips;
                  const isChipSingle = CHIP_SINGLE.has(q.id) && options?.length;
                  const isChipMulti =
                    (CHIP_MULTI_ARRAY.has(q.id) ||
                      CHIP_MULTI_STRING.has(q.id)) &&
                    options?.length;
                  const label = q.cardLabel
                    ? q.cardLabel[0].toUpperCase() + q.cardLabel.slice(1)
                    : q.id;
                  return (
                    <div
                      key={q.id}
                      className={`flex flex-col gap-2 py-4 ${i > 0 ? "border-t border-evolve-yellow/10" : ""}`}
                    >
                      <label className="text-white/40 text-xs">{label}</label>
                      {isChipSingle || isChipMulti ? (
                        <ChipField
                          options={options}
                          value={draftVal}
                          multi={isChipMulti}
                          onChange={(next) =>
                            setOnboardingDraft((d) => ({ ...d, [q.id]: next }))
                          }
                        />
                      ) : (
                        <input
                          type="text"
                          value={draftVal || ""}
                          onChange={(e) =>
                            setOnboardingDraft((d) => ({
                              ...d,
                              [q.id]: e.target.value
                            }))
                          }
                          className="w-full text-sm text-white outline-none border border-[#373737] rounded-xl px-4 py-3 transition-colors focus:border-evolve-yellow/60"
                          style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {ENABLE_PORTFOLIO_AI && <PortfolioResumeSection user={user} />}

        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving}
          className="self-start bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl px-7 py-3.5 disabled:opacity-40 active:opacity-80 transition-opacity"
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

/* ── "Invoice" — payment/transaction history across mentorship + portfolio
   review, the only two paid programmes on the platform right now ──────────── */
export function InvoicePanel({ onBack }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [{ data: mentorship }, { data: portfolio }] = await Promise.all([
        supabase
          .from("mentorship_payments")
          .select("id, plan, amount, currency, status, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("portfolio_review_payments")
          .select("id, amount, currency, status, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
      ]);

      const merged = [
        ...(mentorship || []).map((r) => ({
          id: `m_${r.id}`,
          label: `Mentorship — ${r.plan}`,
          amount: r.amount / 100,
          currency: r.currency,
          status: r.status,
          date: r.created_at
        })),
        ...(portfolio || []).map((r) => ({
          id: `p_${r.id}`,
          label: "Portfolio Review",
          amount: r.amount,
          currency: r.currency,
          status: r.status,
          date: r.created_at
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      if (!cancelled) {
        setRows(merged);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  const STATUS_STYLE = {
    success: "text-evolve-inchworm",
    pending: "text-evolve-yellow",
    failed: "text-red-400",
    refunded: "text-white/40"
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <BackHeader title="Invoice" onBack={onBack} />
      <p className="text-white/40 text-sm -mt-3">
        Your payment history across every evolve programme.
      </p>

      {loading ? (
        <p className="text-white/40 text-sm">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-white/40 text-sm">No payments yet.</p>
      ) : (
        <div className="flex flex-col">
          {rows.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between gap-3 py-4 border-b border-[#373737]"
            >
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold">{r.label}</p>
                <p className="text-white/40 text-xs mt-0.5">
                  {fmtDate(r.date)}
                </p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <span
                  className={`text-xs font-bold uppercase tracking-wide ${STATUS_STYLE[r.status] || "text-white/40"}`}
                >
                  {r.status}
                </span>
                <span className="text-white font-bold text-sm">
                  {fmtRupees(r.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
