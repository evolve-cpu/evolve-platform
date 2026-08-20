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
const ENABLE_PORTFOLIO_AI =
  import.meta.env.VERCEL_ENV === "production" ? false : true;
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

function computeHeroScore(axes) {
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

function ToolBarChart({ tools }) {
  const rows = [...(tools || [])]
    .filter((t) => t?.name)
    .sort((a, b) => (b.emphasis || 0) - (a.emphasis || 0))
    .slice(0, 8);
  if (!rows.length) return null;
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
        <ul className="flex flex-col gap-1">
          {list.map((pt, i) => (
            <li
              key={i}
              className="text-white/50 text-xs leading-snug flex gap-1.5"
            >
              <span className="text-evolve-yellow/60 flex-shrink-0">•</span>
              <span>{pt}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatTile({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5 border border-[#2a2a2a] rounded-xl px-4 py-3">
      <span className="text-white text-xl font-bold">{value}</span>
      <span className="text-white/40 text-[10px] uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

function RecruiterHighlights({ points }) {
  const list = (points || []).filter(Boolean);
  if (!list.length) return null;
  return (
    <div className="rounded-2xl border border-evolve-yellow/30 bg-evolve-yellow/[0.05] p-4 flex flex-col gap-2.5">
      <p className="text-evolve-yellow text-[11px] font-bold uppercase tracking-wide">
        For Recruiters — at a glance
      </p>
      <ul className="flex flex-col gap-1.5">
        {list.map((pt, i) => (
          <li key={i} className="text-white/85 text-sm leading-snug flex gap-2">
            <span className="text-evolve-yellow flex-shrink-0">▸</span>
            <span>{pt}</span>
          </li>
        ))}
      </ul>
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

export function AIProfileReveal({ profile }) {
  if (!profile) return null;
  const {
    role,
    niche,
    domain,
    sector,
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
    summary,
    recruiter_highlights
  } = profile;

  const axes = computeSkillAxes(profile);
  const heroScore = computeHeroScore(axes);
  const expIdx = EXPERIENCE_BUCKETS.findIndex(
    (b) =>
      b.toLowerCase() ===
      String(work_experience || "")
        .trim()
        .toLowerCase()
  );
  const verifiedCount = real_work_validation?.validated_count || 0;
  const toolCount = (tool_proficiency || []).length;

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-evolve-yellow/25 p-6 sm:p-8 flex flex-col gap-8"
      style={{
        background:
          "linear-gradient(160deg, rgba(255,208,7,0.06), rgba(255,255,255,0.015))"
      }}
    >
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
            {niche && niche.toLowerCase() !== "not specified" && (
              <Tag>{niche}</Tag>
            )}
            <Tag>{domain}</Tag>
            <Tag>{sector}</Tag>
            {type_of_work_wanted && <Tag>wants: {type_of_work_wanted}</Tag>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatTile label="Experience" value={work_experience || "—"} />
        <StatTile label="Verified Projects" value={verifiedCount} />
        <StatTile label="Tools Cited" value={toolCount} />
      </div>

      <RecruiterHighlights points={recruiter_highlights} />

      {summary && (
        <blockquote className="border-l-2 border-evolve-yellow pl-4 text-white/80 text-base leading-relaxed italic">
          &ldquo;{summary}&rdquo;
        </blockquote>
      )}

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

      <div className="grid md:grid-cols-2 gap-6 items-start">
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

      <div className="grid md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-white/40 text-[11px] uppercase tracking-wide">
            Tool Emphasis
          </p>
          <ToolBarChart tools={tool_proficiency} />
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
            <ul className="flex flex-col gap-1 mt-1">
              {real_work_validation.key_points.map((pt, i) => (
                <li
                  key={i}
                  className="text-white/50 text-xs leading-snug flex gap-1.5"
                >
                  <span className="text-evolve-yellow/60 flex-shrink-0">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select(
          "portfolio_link, portfolio_file_url, resume_link, resume_file_url, extracted_profile, extracted_profile_status, ai_profile, ai_profile_status, ai_profile_public, username"
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
        setEditingPortfolio(!data.portfolio_link && !data.portfolio_file_url);
        setEditingResume(!data.resume_link && !data.resume_file_url);
      }
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [user.id]);

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
                <AIProfileReveal profile={aiProfile} />
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
