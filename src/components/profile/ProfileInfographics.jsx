import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { AnimatePresence, motion } from "framer-motion";

/* ── AI Profile info-graphics — competency matrix (pentagon), skill profile
   (donut), skill chip groups, and a spiral career timeline. Each chart shows
   only shape/color up front; clicking a vertex/segment/node opens the detail
   (evidence, subskills, tools, per-year breakdown) in a panel that slides in
   from the right, instead of putting that detail on the chart itself. ───── */

const YELLOW = "#FFD007";
const STRONG_GREEN = "#8DD57C";
const LEADERSHIP_BLUE = "#7FB8FF";
const GROWTH_AMBER = "#FFB14F";
const COMMUNITY_PURPLE = "#C58CFF";
const ACADEMICS_PINK = "#FF8FB1";
const TRACK = "rgba(255,255,255,0.08)";

/* ── shared right-slide detail panel ─────────────────────────────────────── */
export function DetailPanel({ open, onClose, eyebrow, title, accent = YELLOW, children }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            className="fixed inset-0 z-[60] bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            key="panel"
            className="fixed top-0 right-0 z-[61] h-full w-[78%] sm:w-[380px] bg-[#131316] border-l border-white/10 shadow-2xl flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
          >
            <div className="h-1 w-full flex-shrink-0" style={{ background: accent }} />
            <div className="flex items-start justify-between gap-3 p-5 border-b border-white/10 flex-shrink-0">
              <div className="min-w-0">
                {eyebrow && (
                  <p
                    className="text-[11px] font-bold uppercase tracking-wide"
                    style={{ color: accent }}
                  >
                    {eyebrow}
                  </p>
                )}
                {title && (
                  <h3 className="text-white text-lg font-bold leading-tight mt-1">
                    {title}
                  </h3>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex-shrink-0 w-8 h-8 rounded-full border border-white/10 text-white/60 hover:text-white hover:border-white/30 flex items-center justify-center transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M4 4l12 12M16 4L4 16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── Competency Matrix — pentagon/radar, click a vertex for its evidence ── */
const MATRIX_MAX = 4;

export function CompetencyMatrix({ axes }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const list = (axes || []).filter((a) => a?.axis);
  if (!list.length) return null;

  const cx = 130,
    cy = 130,
    maxR = 76;
  const angleStep = (2 * Math.PI) / list.length;
  const angleAt = (i) => -Math.PI / 2 + i * angleStep;
  const pointAt = (i, r) => {
    const a = angleAt(i);
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const ringPoints = (r) => list.map((_, i) => pointAt(i, r).join(",")).join(" ");
  const scoreRadius = (score) => maxR * (Math.min(MATRIX_MAX, Math.max(0, score || 0)) / MATRIX_MAX);
  const scorePoints = list.map((a, i) => pointAt(i, scoreRadius(a.score)).join(",")).join(" ");
  const active = activeIndex != null ? list[activeIndex] : null;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 260 260" className="w-full max-w-[280px] overflow-visible">
        {[1, 2, 3, 4].map((lvl) => (
          <polygon
            key={lvl}
            points={ringPoints((maxR * lvl) / 4)}
            fill="none"
            stroke="rgba(255,255,255,0.10)"
            strokeWidth="1"
          />
        ))}
        {list.map((_, i) => {
          const [x, y] = pointAt(i, maxR);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="rgba(255,255,255,0.10)"
              strokeWidth="1"
            />
          );
        })}
        <polygon points={scorePoints} fill={YELLOW} fillOpacity="0.28" stroke={YELLOW} strokeWidth="2" />
        {list.map((a, i) => {
          const [x, y] = pointAt(i, scoreRadius(a.score));
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={activeIndex === i ? 7 : 5.5}
              fill={YELLOW}
              stroke="#18181b"
              strokeWidth="2"
              className="cursor-pointer transition-all"
              onClick={() => setActiveIndex(i)}
            />
          );
        })}
        {list.map((a, i) => {
          const [x, y] = pointAt(i, maxR + 26);
          const anchor = Math.abs(x - cx) < 6 ? "middle" : x > cx ? "start" : "end";
          const words = (a.axis || "").split(" ");
          const lines = words.length > 1 ? [words.slice(0, -1).join(" "), words[words.length - 1]] : [a.axis];
          const baseDy = Math.abs(y - cy) < 6 ? 4 : y > cy ? 10 : -4;
          const startDy = lines.length > 1 ? baseDy - 6 : baseDy;
          return (
            <text
              key={i}
              x={x}
              y={y + startDy}
              textAnchor={anchor}
              fill="rgba(255,255,255,0.55)"
              fontSize="10"
              fontWeight="600"
              className="cursor-pointer"
              onClick={() => setActiveIndex(i)}
            >
              {lines.map((line, li) => (
                <tspan key={li} x={x} dy={li === 0 ? 0 : 12}>
                  {line}
                </tspan>
              ))}
            </text>
          );
        })}
      </svg>
      <p className="text-white/30 text-[10px]">Tap a point for the evidence behind it</p>

      <DetailPanel
        open={activeIndex != null}
        onClose={() => setActiveIndex(null)}
        eyebrow="Competency Matrix"
        title={active?.axis}
        accent={YELLOW}
      >
        {active && (
          <>
            <div className="flex items-center gap-3">
              <span className="text-white text-2xl font-bold">
                {active.score ?? 0}/{MATRIX_MAX}
              </span>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: TRACK }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(scoreRadius(active.score) / maxR) * 100}%`, background: YELLOW }}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {(active.evidence || []).filter(Boolean).map((pt, i) => (
                <p
                  key={i}
                  className="text-white/70 text-xs leading-snug rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
                >
                  {pt}
                </p>
              ))}
              {!(active.evidence || []).filter(Boolean).length && (
                <p className="text-white/40 text-xs">No specific evidence recorded for this axis.</p>
              )}
            </div>
          </>
        )}
      </DetailPanel>
    </div>
  );
}

/* ── Skill Profile donut — categories of the flat skill list, click a
   segment for its subskills/tools/domain/sector ────────────────────────── */
const DONUT_PALETTE = [YELLOW, STRONG_GREEN, LEADERSHIP_BLUE, GROWTH_AMBER, COMMUNITY_PURPLE, "#FF8A8A"];

export function SkillDonut({ categories }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const list = (categories || []).filter((c) => c?.category);
  if (!list.length) return null;
  const active = activeIndex != null ? list[activeIndex] : null;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <div className="relative w-40 h-40 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={list}
              dataKey="pct"
              nameKey="category"
              innerRadius={52}
              outerRadius={78}
              paddingAngle={2}
              stroke="none"
              isAnimationActive
              onClick={(_, i) => setActiveIndex(i)}
            >
              {list.map((c, i) => (
                <Cell
                  key={i}
                  fill={DONUT_PALETTE[i % DONUT_PALETTE.length]}
                  className="cursor-pointer outline-none"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-white text-lg font-bold">{list.length}</span>
          <span className="text-white/35 text-[9px] uppercase tracking-wide">categories</span>
        </div>
      </div>
      <div className="flex flex-col gap-1.5 w-full min-w-0">
        {list.map((c, i) => (
          <button
            type="button"
            key={i}
            onClick={() => setActiveIndex(i)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/[0.04] transition-colors text-left"
          >
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: DONUT_PALETTE[i % DONUT_PALETTE.length] }}
            />
            <span className="text-white/75 text-xs font-semibold flex-1 min-w-0 truncate">
              {c.category}
            </span>
            <span className="text-white/40 text-xs font-bold flex-shrink-0">{c.pct}%</span>
          </button>
        ))}
      </div>

      <DetailPanel
        open={activeIndex != null}
        onClose={() => setActiveIndex(null)}
        eyebrow="Skill Profile"
        title={active?.category}
        accent={DONUT_PALETTE[(activeIndex ?? 0) % DONUT_PALETTE.length]}
      >
        {active && (
          <>
            <div className="flex items-center gap-3">
              <span className="text-white text-2xl font-bold">{active.pct}%</span>
              <span className="text-white/40 text-xs">of this skill profile</span>
            </div>
            {active.subskills?.filter(Boolean).length > 0 && (
              <div className="flex flex-col gap-1.5">
                <p className="text-white/40 text-[10px] uppercase tracking-wide">Subskills</p>
                <div className="flex flex-wrap gap-1.5">
                  {active.subskills.filter(Boolean).map((s, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-white/70 text-[11px]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {active.tools?.filter(Boolean).length > 0 && (
              <div className="flex flex-col gap-1.5">
                <p className="text-white/40 text-[10px] uppercase tracking-wide">Tools</p>
                <div className="flex flex-wrap gap-1.5">
                  {active.tools.filter(Boolean).map((s, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-white/70 text-[11px]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {active.domain && active.domain !== "Not specified" && (
                <div className="rounded-lg border border-white/10 bg-black/10 p-2.5">
                  <p className="text-white/35 text-[9px] uppercase tracking-wide">Domain</p>
                  <p className="text-white/80 text-xs font-semibold mt-0.5">{active.domain}</p>
                </div>
              )}
              {active.sector && active.sector !== "Not specified" && (
                <div className="rounded-lg border border-white/10 bg-black/10 p-2.5">
                  <p className="text-white/35 text-[9px] uppercase tracking-wide">Sector</p>
                  <p className="text-white/80 text-xs font-semibold mt-0.5">{active.sector}</p>
                </div>
              )}
            </div>
          </>
        )}
      </DetailPanel>
    </div>
  );
}

/* ── Technical / Soft / Interpersonal skill chips — plain name lists, no
   detail panel: these are meant to stay minimal, nothing to click through. ── */
function ChipRow({ label, items, tone }) {
  const list = (items || []).filter(Boolean);
  if (!list.length) return null;
  return (
    <div className="flex flex-col gap-2">
      <p className="text-white/40 text-[11px] uppercase tracking-wide">{label}</p>
      <div className="flex flex-wrap gap-2">
        {list.map((s, i) => (
          <span
            key={i}
            className="rounded-full border px-3 py-1.5 text-xs font-semibold text-white"
            style={{ borderColor: `${tone}55`, background: `${tone}14` }}
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

export function SkillChipGroups({ technical, soft, interpersonal }) {
  if (!technical?.length && !soft?.length && !interpersonal?.length) return null;
  return (
    <div className="flex flex-col gap-4">
      <ChipRow label="Technical Skills" items={technical} tone={YELLOW} />
      <ChipRow label="Soft Skills" items={soft} tone={STRONG_GREEN} />
      <ChipRow label="Interpersonal Skills" items={interpersonal} tone={LEADERSHIP_BLUE} />
    </div>
  );
}

/* ── Spiral career timeline — one node per career_timeline year, click a
   node for that year's highlight + growth-axis breakdown ───────────────── */
const TIMELINE_CATEGORY_COLOR = {
  Academics: ACADEMICS_PINK,
  "Work Experience": COMMUNITY_PURPLE
};
const TIMELINE_AXES = [
  { key: "business", label: "Business", color: STRONG_GREEN },
  { key: "clarity", label: "Clarity", color: YELLOW },
  { key: "leadership", label: "Leadership", color: LEADERSHIP_BLUE },
  { key: "learning", label: "Learning", color: GROWTH_AMBER },
  { key: "community", label: "Community", color: COMMUNITY_PURPLE }
];

function synthesizedYear(entry, list) {
  if (entry.calendar_year) return entry.calendar_year;
  const lastIndexed = [...list].reverse().find((e) => e.calendar_year);
  const nowYear = new Date().getFullYear();
  const anchor = lastIndexed ? Number(lastIndexed.calendar_year) - lastIndexed.year_index : nowYear - entry.year_index;
  return String(anchor + entry.year_index);
}

export function SpiralTimeline({ entries }) {
  const list = (entries || [])
    .filter((e) => e?.year_index != null)
    .sort((a, b) => a.year_index - b.year_index)
    .map((e) => ({ ...e, calendar_year: synthesizedYear(e, entries) }));
  const [activeIndex, setActiveIndex] = useState(list.length ? list.length - 1 : null);
  const [zoom, setZoom] = useState(1);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  if (!list.length) return null;

  const n = list.length;
  const cx = 130,
    cy = 130,
    rStart = 20,
    maxR = 100;
  const rStep = n > 1 ? (maxR - rStart) / (n - 1) : 0;
  const thetaStep = 2.55;
  const thetaAt = (i) => -Math.PI / 2 + i * thetaStep;
  const pointAt = (i) => {
    const r = rStart + i * rStep;
    const a = thetaAt(i);
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };

  const pathPoints = [];
  const steps = Math.max(n - 1, 1) * 24;
  for (let s = 0; s <= steps; s++) {
    const t = (s / steps) * (n - 1);
    const r = rStart + t * rStep;
    const a = thetaAt(t);
    pathPoints.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
  }

  const years = Array.from(new Set(list.map((e) => e.calendar_year))).sort();
  const nowYear = String(new Date().getFullYear());
  const lastYear = years[years.length - 1];
  const ticks = lastYear === nowYear ? [...years.slice(0, -1), "Today"] : [...years, "Today"];
  const tickIndexForEntry = (entry, isLast) => {
    if (isLast) return ticks.length - 1;
    const idx = years.indexOf(entry.calendar_year);
    return idx >= 0 ? idx : 0;
  };
  const nearestEntryForTick = (tickIdx) => {
    if (tickIdx === ticks.length - 1) return list.length - 1;
    const targetYear = ticks[tickIdx];
    let best = 0,
      bestDist = Infinity;
    list.forEach((e, idx) => {
      const dist = Math.abs(years.indexOf(e.calendar_year) - years.indexOf(targetYear));
      if (dist < bestDist) {
        bestDist = dist;
        best = idx;
      }
    });
    return best;
  };

  const active = activeIndex != null ? list[activeIndex] : list[list.length - 1];
  const activeTickIdx = tickIndexForEntry(active, activeIndex === list.length - 1);
  const activeFraction = ticks.length > 1 ? activeTickIdx / (ticks.length - 1) : 0;
  const activeColor = TIMELINE_CATEGORY_COLOR[active.category] || TIMELINE_CATEGORY_COLOR["Work Experience"];
  const isCurrent = activeIndex === list.length - 1;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-end gap-4">
        <span className="flex items-center gap-1.5 text-white/45 text-[11px]">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: TIMELINE_CATEGORY_COLOR.Academics }}
          />
          academics
        </span>
        <span className="flex items-center gap-1.5 text-white/45 text-[11px]">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: TIMELINE_CATEGORY_COLOR["Work Experience"] }}
          />
          work &amp; project experience
        </span>
      </div>

      <div className="relative rounded-2xl border border-white/10 bg-[#0d0d0f] p-3">
        <div
          className="mx-auto transition-transform duration-200"
          style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
        >
          <svg viewBox="0 0 260 260" className="w-full max-w-[280px] mx-auto block">
            <polyline
              points={pathPoints.join(" ")}
              fill="none"
              stroke="rgba(255,255,255,0.16)"
              strokeWidth="1.5"
            />
            {list.map((e, i) => {
              const [x, y] = pointAt(i);
              const color = TIMELINE_CATEGORY_COLOR[e.category] || TIMELINE_CATEGORY_COLOR["Work Experience"];
              const isActive = i === (activeIndex ?? list.length - 1);
              return (
                <g key={i} className="cursor-pointer" onClick={() => setActiveIndex(i)}>
                  {isActive && (
                    <circle cx={x} cy={y} r={11} fill="none" stroke={color} strokeWidth="1.5" opacity="0.55" />
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r={isActive ? 7 : 5.5}
                    fill={color}
                    stroke="#0d0d0f"
                    strokeWidth="2"
                  />
                </g>
              );
            })}
          </svg>
        </div>
        <div className="absolute bottom-3 right-3 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.5, +(z + 0.15).toFixed(2)))}
            className="w-7 h-7 rounded-full border border-white/15 bg-white/[0.04] text-white/60 hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.75, +(z - 0.15).toFixed(2)))}
            className="w-7 h-7 rounded-full border border-white/15 bg-white/[0.04] text-white/60 hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
          >
            −
          </button>
        </div>
      </div>

      <div className="px-1">
        <div className="relative h-1 rounded-full bg-white/10">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-evolve-yellow"
            style={{ width: `${activeFraction * 100}%` }}
          />
          <span
            className="absolute top-1/2 w-3 h-3 rounded-full bg-evolve-yellow border-2 border-[#18181b] -translate-y-1/2 -translate-x-1/2"
            style={{ left: `${activeFraction * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          {ticks.map((t, i) => (
            <button
              type="button"
              key={i}
              onClick={() => setActiveIndex(nearestEntryForTick(i))}
              className="text-[10px] font-semibold transition-colors"
              style={{ color: i === activeTickIdx ? YELLOW : "rgba(255,255,255,0.35)" }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-white text-xl font-bold">{active.calendar_year}</span>
            {isCurrent && (
              <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-evolve-yellow text-black">
                Till date
              </span>
            )}
          </div>
          <span className="flex items-center gap-1.5 text-white/50 text-[11px]">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: activeColor }} />
            {active.category === "Academics" ? "academics" : "work & projects"}
          </span>
        </div>
        {(active.title || active.highlight) && (
          <p className="text-white text-sm font-semibold leading-snug">{active.title || active.highlight}</p>
        )}
        {active.title && active.highlight && (
          <p className="text-white/50 text-xs leading-snug">{active.highlight}</p>
        )}
        <button
          type="button"
          onClick={() => setEvidenceOpen(true)}
          className="self-start text-evolve-yellow text-[11px] font-semibold mt-1 hover:underline"
        >
          View skill breakdown →
        </button>
      </div>

      <DetailPanel
        open={evidenceOpen}
        onClose={() => setEvidenceOpen(false)}
        eyebrow={active.category === "Academics" ? "academics" : "work & projects"}
        title={active.calendar_year}
        accent={activeColor}
      >
        {active.highlight && (
          <p className="text-white/75 text-sm leading-snug rounded-xl border border-white/10 bg-white/[0.03] p-3">
            {active.highlight}
          </p>
        )}
        <div className="flex flex-col gap-2">
          {TIMELINE_AXES.map((ax) => {
            const v = Math.max(0, Math.min(3, active[ax.key] || 0));
            return (
              <div key={ax.key} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-[11px]">{ax.label}</span>
                  <span className="text-white/35 text-[10px] font-bold">{v}/3</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: TRACK }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(v / 3) * 100}%`, background: ax.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </DetailPanel>
    </div>
  );
}
