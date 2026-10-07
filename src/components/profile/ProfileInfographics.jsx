import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/* ── AI Profile info-graphics — competency matrix (pentagon), skill profile
   (donut), skill chip groups, and a spiral career timeline. Colours,
   geometry and interactions match evolve_mobile_after_trial.html: each
   chart shows only shape/colour up front; tapping a vertex/segment opens
   the detail in a panel that slides in from the right, and the timeline is
   travelled through by pinching (zoom in = back in time). ─────────────── */

const C = {
  yellow: "#FFD007",
  pink: "#DF0586",
  purple: "#A35BFB",
  green: "#C2FD5C",
  cyan: "#01F1D9",
  orange: "#EB5328",
  white: "#FFFFFF",
  grey: "#9a9a9a",
  greyDim: "#6f6f72",
  card: "#232325",
  card2: "#1c1c1e",
  line: "rgba(255,255,255,0.08)",
  lineStrong: "rgba(255,255,255,0.14)",
  bg: "#161616"
};

/* ── shared right-slide detail panel (reference: .panel / #vertexPanel) ── */
export function DetailPanel({ open, onClose, eyebrow, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            className="fixed inset-0 z-[60] bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            key="panel"
            role="dialog"
            aria-modal="true"
            className="fixed top-0 right-0 bottom-0 z-[61] w-[84%] max-w-[340px] flex flex-col overflow-hidden"
            style={{
              background: "#19191b",
              borderLeft: `1px solid ${C.lineStrong}`,
              boxShadow: "-20px 0 50px rgba(0,0,0,0.45)"
            }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0.35, 1] }}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-1">
              <span
                className="text-[11px] font-bold uppercase tracking-[0.08em]"
                style={{ color: C.greyDim }}
              >
                {eyebrow}
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="close"
                className="w-8 h-8 rounded-full flex items-center justify-center text-white active:bg-[#2c2c2e]"
                style={{ background: C.card, border: `1px solid ${C.line}` }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M5 5l14 14M19 5L5 19" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pt-3 pb-6">{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* panel building blocks (reference: .vp-*) */
const LEVELS = {
  strong: { label: "Strong", color: C.green, bg: "rgba(194,253,92,0.1)", border: "rgba(194,253,92,0.25)" },
  growing: { label: "Growing", color: C.yellow, bg: "rgba(255,208,7,0.1)", border: "rgba(255,208,7,0.25)" },
  emerging: { label: "Emerging", color: "#ffb15c", bg: "rgba(255,177,92,0.1)", border: "rgba(255,177,92,0.25)" },
  notyet: { label: "Not yet", color: C.grey, bg: "rgba(255,255,255,0.06)", border: C.lineStrong }
};

function LevelPill({ level, children }) {
  const l = LEVELS[level] || LEVELS.growing;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.03em] rounded-[20px] px-3 py-[5px] mb-3.5"
      style={{ color: l.color, background: l.bg, border: `1px solid ${l.border}` }}
    >
      {children ?? l.label}
    </span>
  );
}

function PanelLabel({ children, first }) {
  return (
    <div
      className={`text-[11px] font-bold uppercase tracking-[0.06em] ${first ? "" : "mt-[18px]"} mb-0.5`}
      style={{ color: C.purple }}
    >
      {children}
    </div>
  );
}

function PanelBlurb({ children, className = "" }) {
  return (
    <p className={`text-[13.5px] leading-[1.55] ${className}`} style={{ color: C.grey }}>
      {children}
    </p>
  );
}

const CheckPath = <path d="M20 6L9 17l-5-5" />;

function EvidenceItem({ children, sub }) {
  return (
    <div className="flex items-start gap-2.5 py-3 border-b last:border-b-0" style={{ borderColor: C.line }}>
      <span className="w-[30px] h-[30px] rounded-[9px] flex-shrink-0 flex items-center justify-center" style={{ background: C.card }}>
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke={C.yellow} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {CheckPath}
        </svg>
      </span>
      <span className="text-[13px] leading-[1.4] text-white pt-1">
        {children}
        {sub && <span className="block text-[11px] mt-0.5" style={{ color: C.greyDim }}>{sub}</span>}
      </span>
    </div>
  );
}

function EmptyLine({ children = "Nothing on record yet" }) {
  return (
    <div className="text-[12.5px] italic py-2 pb-2.5 border-b" style={{ color: C.greyDim, borderColor: C.line }}>
      {children}
    </div>
  );
}

function Hint({ children }) {
  return (
    <p className="text-[11.5px] text-center mt-0.5" style={{ color: C.greyDim }}>
      {children}
    </p>
  );
}

/* ── Competency Matrix — pentagon/radar, tap a vertex for its evidence ── */
const MATRIX_MAX = 4;
const AXIS_COPY = {
  "Design Core": {
    short: ["Design core"],
    blurb: "How strong your fundamentals are, and how well you solve problems and read context within your craft.",
    empty: "Nothing on record yet — this builds through projects that show your craft end to end."
  },
  Collaboration: {
    short: ["Collab"],
    blurb: "Working with, or across, other teams to get things done.",
    empty: "Nothing on record yet — this builds through group challenges or team-based projects."
  },
  "Business Understanding": {
    short: ["Business", "understanding"],
    blurb: "Connecting design decisions to research and to measurable outcomes.",
    empty: "Nothing on record yet — add a case study with business context."
  },
  Leadership: {
    short: ["Leadership"],
    blurb: "Making calls, allocating resources, and setting direction for others.",
    empty: "Nothing on record yet — this builds through leading a project, team, or initiative."
  },
  "Continuous Learning": {
    short: ["Continuous", "learning"],
    blurb: "How actively you keep growing outside of assigned work.",
    empty: "Nothing on record yet — this builds through courses, events and community activity."
  }
};

function levelFor(score) {
  const s = score || 0;
  if (s >= 3) return "strong";
  if (s === 2) return "growing";
  if (s === 1) return "emerging";
  return "notyet";
}

export function CompetencyMatrix({ axes }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const list = (axes || []).filter((a) => a?.axis);
  if (!list.length) return null;

  const cx = 200,
    cy = 200,
    maxR = 145,
    labelR = 180;
  const step = (2 * Math.PI) / list.length;
  const pointAt = (i, r) => {
    const a = -Math.PI / 2 + i * step;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const ring = (r) => list.map((_, i) => pointAt(i, r).map((v) => v.toFixed(1)).join(",")).join(" L ");
  const scoreR = (score) => maxR * (Math.min(MATRIX_MAX, Math.max(0, score || 0)) / MATRIX_MAX);
  const dataPath = "M " + list.map((a, i) => pointAt(i, scoreR(a.score)).map((v) => v.toFixed(1)).join(",")).join(" L ") + " Z";
  const active = activeIndex != null ? list[activeIndex] : null;
  const activeCopy = active ? AXIS_COPY[active.axis] || {} : {};
  const evidence = (active?.evidence || []).filter(Boolean);

  return (
    <div>
      <div className="relative w-full flex justify-center mt-1">
        <svg viewBox="0 0 400 400" className="w-[86%] max-w-[320px] h-auto overflow-visible">
          <defs>
            <linearGradient id="radarFillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={C.pink} stopOpacity="0.55" />
              <stop offset="100%" stopColor={C.purple} stopOpacity="0.55" />
            </linearGradient>
          </defs>
          {[1, 2, 3, 4, 5].map((lvl) => (
            <path key={lvl} d={`M ${ring((maxR * lvl) / 5)} Z`} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          ))}
          {list.map((_, i) => {
            const [x, y] = pointAt(i, maxR);
            return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.14)" strokeWidth="1" />;
          })}
          <path d={dataPath} fill="url(#radarFillGrad)" stroke={C.yellow} strokeWidth="2" strokeLinejoin="round" />

          {list.map((a, i) => {
            const [x, y] = pointAt(i, labelR);
            const lines = AXIS_COPY[a.axis]?.short || [a.axis];
            const below = y > cy + 20;
            const y0 = below ? y + 6 : lines.length > 1 ? y - 7 : y;
            return (
              <text
                key={i}
                x={x}
                y={y0}
                textAnchor="middle"
                fill={C.grey}
                fontFamily="Inter, sans-serif"
                fontSize="11.5"
                fontWeight="600"
                className="cursor-pointer select-none"
                onClick={() => setActiveIndex(i)}
              >
                {lines.map((line, li) => (
                  <tspan key={li} x={x} dy={li === 0 ? 0 : 14}>
                    {line}
                  </tspan>
                ))}
              </text>
            );
          })}

          {/* tappable vertices: visible dot + larger invisible hit target */}
          {list.map((a, i) => {
            const [x, y] = pointAt(i, scoreR(a.score));
            return (
              <g
                key={i}
                className="cursor-pointer group outline-none"
                tabIndex={0}
                role="button"
                aria-label={`${a.axis}: ${LEVELS[levelFor(a.score)].label}`}
                onClick={() => setActiveIndex(i)}
                onKeyDown={(e) => e.key === "Enter" && setActiveIndex(i)}
              >
                <circle cx={x} cy={y} r="24" fill="transparent" />
                <circle
                  cx={x}
                  cy={y}
                  r="5.5"
                  fill={C.yellow}
                  stroke="#19191b"
                  strokeWidth="2"
                  className="transition-[r] duration-[120ms] group-hover:[r:7.5px] group-active:[r:7.5px]"
                />
              </g>
            );
          })}
        </svg>
      </div>
      <Hint>Tap on the graph to explore</Hint>

      <DetailPanel open={activeIndex != null} onClose={() => setActiveIndex(null)} eyebrow={active?.axis}>
        {active && (
          <>
            <LevelPill level={levelFor(active.score)} />
            {activeCopy.blurb && <PanelBlurb className="mb-[22px]">{activeCopy.blurb}</PanelBlurb>}
            <PanelLabel first>Evidence</PanelLabel>
            {evidence.length ? evidence.map((pt, i) => <EvidenceItem key={i}>{pt}</EvidenceItem>) : <EmptyLine />}
            {active.reasoning && (
              <>
                <PanelLabel>Our read</PanelLabel>
                <PanelBlurb className="pt-2">{active.reasoning}</PanelBlurb>
              </>
            )}
            {!evidence.length && activeCopy.empty && (
              <div className="text-center pt-5 px-1 pb-2">
                <p className="text-[13px] leading-[1.55]" style={{ color: C.grey }}>
                  {activeCopy.empty}
                </p>
              </div>
            )}
          </>
        )}
      </DetailPanel>
    </div>
  );
}

/* ── Skill Profile donut — tap a segment for subskills/tools/domain/sector ── */
const DONUT_PALETTE = [C.pink, C.yellow, C.purple, C.green, C.cyan, C.orange];

export function SkillDonut({ categories, centerLabel }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const list = (categories || []).filter((c) => c?.category);
  if (!list.length) return null;
  const active = activeIndex != null ? list[activeIndex] : null;

  const r = 120;
  const circ = 2 * Math.PI * r;
  const total = list.reduce((s, c) => s + (c.pct || 0), 0) || 1;
  let offset = 0;
  const segs = list.map((c, i) => {
    const len = ((c.pct || 0) / total) * circ;
    const seg = { len, offset, color: DONUT_PALETTE[i % DONUT_PALETTE.length] };
    offset += len;
    return seg;
  });

  const label = (
    typeof centerLabel === "string" && centerLabel && centerLabel !== "Not specified"
      ? centerLabel
      : "skill profile"
  )
    .trim()
    .toLowerCase();
  const sp = label.indexOf(" ");
  const [l1, l2] = sp > 0 ? [label.slice(0, sp), label.slice(sp + 1)] : [label, ""];
  const isSet = (v) => v && v !== "Not specified";

  return (
    <div className="flex flex-col items-center mt-1">
      <svg viewBox="0 0 400 400" className="w-[78%] max-w-[270px] h-auto">
        <circle cx="200" cy="200" r={r} fill="none" stroke={C.card} strokeWidth="40" />
        <g transform="rotate(-90 200 200)">
          {segs.map((s, i) => (
            <circle
              key={i}
              cx="200"
              cy="200"
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="40"
              strokeDasharray={`${s.len.toFixed(2)} ${(circ - s.len).toFixed(2)}`}
              strokeDashoffset={(-s.offset).toFixed(2)}
              strokeLinecap="butt"
              className="cursor-pointer transition-opacity duration-[120ms] active:opacity-75"
              onClick={() => setActiveIndex(i)}
            />
          ))}
        </g>
        <text x="200" y={l2 ? 194 : 205} textAnchor="middle" fill="#fff" fontFamily="Inter, sans-serif" fontSize="15" fontWeight="700">
          {l1}
        </text>
        {l2 && (
          <text x="200" y="216" textAnchor="middle" fill="#fff" fontFamily="Inter, sans-serif" fontSize="15" fontWeight="700">
            {l2}
          </text>
        )}
      </svg>
      <div className="flex flex-col gap-[9px] w-full mt-3.5">
        {list.map((c, i) => (
          <button
            type="button"
            key={i}
            onClick={() => setActiveIndex(i)}
            className="flex items-center gap-[9px] py-0.5 text-left text-[13px] text-white bg-transparent"
          >
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: segs[i].color }} />
            <span className="min-w-0 truncate">{c.category.toLowerCase()}</span>
            <b className="ml-auto text-xs font-semibold" style={{ color: C.greyDim }}>
              {c.pct}%
            </b>
          </button>
        ))}
      </div>
      <Hint>Tap a segment to see the breakdown</Hint>

      <DetailPanel open={activeIndex != null} onClose={() => setActiveIndex(null)} eyebrow={active?.category}>
        {active && (
          <>
            <LevelPill level="growing">{active.pct}% of your practice</LevelPill>
            <PanelLabel first>Sub-skills</PanelLabel>
            {(active.subskills || []).filter(Boolean).length ? (
              active.subskills.filter(Boolean).map((s, i) => <EvidenceItem key={i}>{s}</EvidenceItem>)
            ) : (
              <EmptyLine />
            )}
            <PanelLabel>Tools</PanelLabel>
            {(active.tools || []).filter(Boolean).length ? (
              <div className="flex flex-wrap gap-1.5 mt-1.5 mb-4">
                {active.tools.filter(Boolean).map((t, i) => (
                  <Chip key={i}>{t}</Chip>
                ))}
              </div>
            ) : (
              <EmptyLine />
            )}
            <PanelLabel>Domain</PanelLabel>
            <PanelBlurb className="pt-1 mb-2.5">{isSet(active.domain) ? active.domain : "Not specified"}</PanelBlurb>
            <PanelLabel>Sector</PanelLabel>
            <PanelBlurb className="pt-1">{isSet(active.sector) ? active.sector : "Not specified"}</PanelBlurb>
          </>
        )}
      </DetailPanel>
    </div>
  );
}

/* ── Technical / Soft / Interpersonal skill chips — plain name lists ── */
function Chip({ children }) {
  return (
    <span
      className="inline-flex items-center gap-[5px] rounded-[20px] px-[11px] py-[5px] text-[11.5px] font-semibold text-white"
      style={{ background: C.card, border: `1px solid ${C.line}` }}
    >
      {children}
    </span>
  );
}

function ChipRow({ label, items, first }) {
  const list = (items || []).filter(Boolean);
  if (!list.length) return null;
  return (
    <div>
      <div
        className={`text-[11px] font-bold uppercase tracking-[0.08em] ml-0.5 ${first ? "mb-3" : "mt-[22px] mb-3"}`}
        style={{ color: C.greyDim }}
      >
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5 mt-1.5">
        {list.map((s, i) => (
          <Chip key={i}>{s}</Chip>
        ))}
      </div>
    </div>
  );
}

export function SkillChipGroups({ technical, soft, interpersonal }) {
  if (!technical?.length && !soft?.length && !interpersonal?.length) return null;
  const groups = [
    ["Technical skills", technical],
    ["Soft skills", soft],
    ["Interpersonal", interpersonal]
  ].filter(([, items]) => (items || []).filter(Boolean).length);
  return (
    <div>
      {groups.map(([label, items], i) => (
        <ChipRow key={label} label={label} items={items} first={i === 0} />
      ))}
    </div>
  );
}

/* ── Spiral career timeline (pinch to travel through time) ─────────────────
   The spiral grows outward as time moves forward. Zooming in travels back
   to where it began; zooming out reveals it one milestone at a time and
   stops at "till date". Nothing past the current zoom level is shown (just
   a faint ghost of the path) — the progressive disclosure. Ported from the
   reference's initTimeline(); drawn imperatively in a rAF loop so pinching
   stays smooth instead of re-rendering React 60 times a second. */
function synthesizedYear(entry, list) {
  if (entry.calendar_year) return String(entry.calendar_year);
  const lastIndexed = [...list].reverse().find((e) => e.calendar_year);
  const nowYear = new Date().getFullYear();
  const anchor = lastIndexed ? Number(lastIndexed.calendar_year) - lastIndexed.year_index : nowYear - entry.year_index;
  return String(anchor + entry.year_index);
}

// an Archimedean spiral from the centre outward, ~2.25 turns
function buildSpiral() {
  const pts = [];
  const turns = 2.25;
  const T = turns * 2 * Math.PI;
  for (let t = 0; t <= T; t += 0.06) {
    const r = 6 + 9.6 * t;
    pts.push([200 + r * Math.sin(t), 212 - r * Math.cos(t + Math.PI)]);
  }
  return pts;
}

const START_P = 0; // opens zoomed all the way in on the first milestone
const PAD = 34;
const MIN_SPAN = 44;
const PINCH_RANGE = 3;
const TAU = 110;
const REVEAL = 0.05;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export function SpiralTimeline({ entries }) {
  const list = (entries || [])
    .filter((e) => e?.year_index != null)
    .sort((a, b) => a.year_index - b.year_index)
    .map((e) => ({
      year: synthesizedYear(e, entries),
      title: e.title || e.highlight || "",
      kind: e.category === "Academics" ? "academics" : "work"
    }));
  const n = list.length;
  const key = list.map((m) => m.year + m.title).join("|");

  const frameRef = useRef(null);
  const svgRef = useRef(null);
  const ghostRef = useRef(null);
  const trailRef = useRef(null);
  const dotRefs = useRef([]);
  const fillRef = useRef(null);
  const thumbRef = useRef(null);
  const ticksRef = useRef(null);
  const railRef = useRef(null);
  const trackRef = useRef(null);
  const btnInRef = useRef(null);
  const btnOutRef = useRef(null);
  const [shown, setShown] = useState(0);
  const [hintGone, setHintGone] = useState(START_P >= 1);
  const [swapKey, setSwapKey] = useState(0);

  useEffect(() => {
    if (!n) return;
    const frame = frameRef.current;
    const svg = svgRef.current;

    // ---- the spiral and milestone stops along it ----
    let pts = buildSpiral();
    let cum = [0];
    for (let i = 1; i < pts.length; i++) cum[i] = cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    const total = cum[cum.length - 1];
    const pointAtLen = (L) => {
      for (let i = 1; i < pts.length; i++) {
        if (cum[i] >= L) {
          const t = (L - cum[i - 1]) / (cum[i] - cum[i - 1] || 1);
          return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t];
        }
      }
      return pts[pts.length - 1];
    };
    const Lstart = total * 0.08;
    const ms = list.map((m, i) => {
      const L = n > 1 ? Lstart + ((total - Lstart) * i) / (n - 1) : total * 0.5;
      const [x, y] = pointAtLen(L);
      return { ...m, L, x, y, p: n > 1 ? i / (n - 1) : 0, v: 0, el: dotRefs.current[i] };
    });

    function prefixTo(L) {
      const out = [];
      for (let i = 0; i < pts.length; i++) {
        if (cum[i] <= L) {
          out.push(pts[i]);
          continue;
        }
        const t = (L - cum[i - 1]) / (cum[i] - cum[i - 1]);
        out.push([pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t]);
        break;
      }
      return out;
    }
    // the spiral ends at the last milestone ("till date")
    pts = prefixTo(ms[n - 1].L);
    cum = [0];
    for (let i = 1; i < pts.length; i++) cum[i] = cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);

    const lengthAt = (p) => {
      if (n < 2) return ms[0].L;
      const f = clamp(p, 0, 1) * (n - 1);
      const i = Math.min(Math.floor(f), n - 2);
      return ms[i].L + (ms[i + 1].L - ms[i].L) * (f - i);
    };
    const tipIdx = (p) => {
      let k = 0;
      ms.forEach((m, i) => {
        if (p >= m.p - 1e-3) k = i;
      });
      return k;
    };

    // ---- year rail ----
    const years = [];
    ms.forEach((m) => {
      if (!years.some((y) => y.label === m.year)) years.push({ label: m.year, p: m.p });
    });
    if (years[years.length - 1].p >= 0.999) years[years.length - 1].label = "Today";
    else years.push({ label: "Today", p: 1 });
    const ticksEl = ticksRef.current;
    ticksEl.innerHTML = years
      .map(
        (y, i) =>
          `<span data-p="${y.p}" style="position:absolute;top:0;left:${y.p * 100}%;white-space:nowrap;font:600 11px Inter,sans-serif;color:${C.greyDim};transition:color .15s ease;transform:${
            i === 0 ? "none" : i === years.length - 1 ? "translateX(-100%)" : "translateX(-50%)"
          }">${y.label}</span>`
      )
      .join("");
    const tickEls = Array.from(ticksEl.children);

    // ---- camera ----
    let W = 0,
      H = 0,
      sNear = 1,
      sFar = 1;
    function fitFor(L) {
      const pf = prefixTo(L);
      let x0 = Infinity,
        x1 = -Infinity,
        y0 = Infinity,
        y1 = -Infinity;
      pf.forEach((q) => {
        x0 = Math.min(x0, q[0]);
        x1 = Math.max(x1, q[0]);
        y0 = Math.min(y0, q[1]);
        y1 = Math.max(y1, q[1]);
      });
      const bw = Math.max(x1 - x0, MIN_SPAN),
        bh = Math.max(y1 - y0, MIN_SPAN);
      return { pf, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, fit: Math.min((W - 2 * PAD) / bw, (H - 2 * PAD) / bh) };
    }
    function layout() {
      W = frame.clientWidth;
      H = frame.clientHeight;
      if (!W || !H) return false;
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      sNear = fitFor(lengthAt(0)).fit;
      sFar = fitFor(lengthAt(1)).fit;
      return true;
    }
    const toPath = (arr, X, Y) => arr.map((q, i) => (i ? "L" : "M") + X(q[0]).toFixed(1) + "," + Y(q[1]).toFixed(1)).join(" ");

    let pT = START_P,
      pV = START_P,
      userSel = null,
      shownIdx = -1,
      raf = 0,
      last = 0,
      pinchD = 0,
      pinchedAt = 0;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    function showMilestone(i) {
      if (i === shownIdx) return;
      shownIdx = i;
      ms.forEach((o, j) => o.el?.classList.toggle("is-sel", j === i));
      setShown(i);
      setSwapKey((k) => k + 1);
    }

    function render() {
      if (!W) return;
      const cam = fitFor(lengthAt(pV));
      const s = Math.min(cam.fit, sNear * Math.pow(sFar / sNear, pV));
      const X = (x) => W / 2 + (x - cam.cx) * s;
      const Y = (y) => H / 2 + (y - cam.cy) * s;
      ghostRef.current.setAttribute("d", toPath(pts, X, Y));
      trailRef.current.setAttribute("d", toPath(cam.pf, X, Y));
      ms.forEach((m) => {
        m.v = clamp((pV - (m.p - REVEAL)) / REVEAL, 0, 1);
        if (!m.el) return;
        if (m.v < 0.02) {
          m.el.style.visibility = "hidden";
          return;
        }
        m.el.style.visibility = "visible";
        m.el.style.opacity = m.v;
        m.el.setAttribute("transform", `translate(${X(m.x).toFixed(1)} ${Y(m.y).toFixed(1)}) scale(${(0.55 + 0.45 * m.v).toFixed(3)})`);
      });
      const ti = tipIdx(pV);
      showMilestone(userSel !== null ? userSel : ti);
      fillRef.current.style.width = pV * 100 + "%";
      thumbRef.current.style.left = pV * 100 + "%";
      tickEls.forEach((t) => (t.style.color = pV >= +t.dataset.p - 1e-3 ? C.white : C.greyDim));
      btnInRef.current.disabled = pT <= 1e-4;
      btnOutRef.current.disabled = pT >= 1 - 1e-4;
      ms[n - 1].el?.classList.toggle("is-now", pV >= 1 - 1e-3);
      railRef.current.setAttribute("aria-valuenow", ti);
      railRef.current.setAttribute("aria-valuetext", `${ms[ti].year}: ${ms[ti].title}`);
    }
    function tick(t) {
      const dt = Math.min(64, t - last);
      last = t;
      pV += (pT - pV) * (reduceMotion ? 1 : 1 - Math.exp(-dt / TAU));
      if (Math.abs(pT - pV) < 1.5e-3) pV = pT;
      render();
      raf = pV !== pT ? requestAnimationFrame(tick) : 0;
    }
    function wake() {
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    }
    function setTarget(p) {
      pT = clamp(p, 0, 1);
      userSel = null;
      setHintGone(true);
      wake();
    }
    function step(dir) {
      if (n < 2) return;
      const f = pT * (n - 1);
      const i = dir > 0 ? Math.floor(f + 1e-6) + 1 : Math.ceil(f - 1e-6) - 1;
      setTarget(clamp(i, 0, n - 1) / (n - 1));
    }

    // ---- input: pinch (touch) — fingers apart = zoom in = back in time ----
    const dist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        pinchD = dist(e.touches);
        if (e.cancelable) e.preventDefault();
      }
    };
    const onTouchMove = (e) => {
      if (e.touches.length !== 2 || !pinchD) return;
      if (e.cancelable) e.preventDefault();
      const d = dist(e.touches);
      if (d < 1) return;
      const ratio = d / pinchD;
      pinchD = d;
      setTarget(pT - Math.log(ratio) / Math.log(PINCH_RANGE));
      pinchedAt = performance.now();
    };
    const endPinch = (e) => {
      if (e.touches.length < 2) {
        if (pinchD) pinchedAt = performance.now();
        pinchD = 0;
      }
    };
    const noGesture = (e) => e.preventDefault(); // stop Safari zooming the page
    // trackpad pinch / ctrl + scroll (plain scrolling still scrolls the page)
    const onWheel = (e) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      setTarget(pT + clamp(e.deltaY * (e.deltaMode === 1 ? 16 : 1), -30, 30) * 0.004);
    };
    frame.addEventListener("touchstart", onTouchStart, { passive: false });
    frame.addEventListener("touchmove", onTouchMove, { passive: false });
    frame.addEventListener("touchend", endPinch);
    frame.addEventListener("touchcancel", endPinch);
    ["gesturestart", "gesturechange", "gestureend"].forEach((t) => frame.addEventListener(t, noGesture));
    frame.addEventListener("wheel", onWheel, { passive: false });

    // ---- input: buttons ----
    const onIn = () => step(-1);
    const onOut = () => step(1);
    btnInRef.current.addEventListener("click", onIn);
    btnOutRef.current.addEventListener("click", onOut);

    // ---- input: the year rail (tap a year, or drag) ----
    const rail = railRef.current;
    const pFromX = (x) => {
      const r = trackRef.current.getBoundingClientRect();
      return clamp((x - r.left) / r.width, 0, 1);
    };
    let scrubbing = false,
      downX = 0,
      snapP = null;
    const onDown = (e) => {
      if (e.button > 0) return;
      scrubbing = true;
      downX = e.clientX;
      try {
        rail.setPointerCapture(e.pointerId);
      } catch {
        /* older browsers */
      }
      const tk = e.target.closest?.("[data-p]");
      snapP = tk ? +tk.dataset.p : null;
      setTarget(snapP !== null ? snapP : pFromX(e.clientX));
    };
    const onMove = (e) => {
      if (!scrubbing) return;
      if (snapP !== null && Math.abs(e.clientX - downX) < 4) return;
      snapP = null;
      setTarget(pFromX(e.clientX));
    };
    const endScrub = () => {
      scrubbing = false;
      snapP = null;
    };
    const onKey = (e) => {
      const k = e.key;
      if (k === "ArrowRight" || k === "ArrowUp") {
        e.preventDefault();
        step(1);
      } else if (k === "ArrowLeft" || k === "ArrowDown") {
        e.preventDefault();
        step(-1);
      } else if (k === "Home") {
        e.preventDefault();
        setTarget(0);
      } else if (k === "End") {
        e.preventDefault();
        setTarget(1);
      }
    };
    rail.addEventListener("pointerdown", onDown);
    rail.addEventListener("pointermove", onMove);
    rail.addEventListener("pointerup", endScrub);
    rail.addEventListener("pointercancel", endScrub);
    rail.addEventListener("keydown", onKey);

    // ---- input: tap a milestone to read it ----
    const picks = ms.map((m, i) => {
      const pick = () => {
        if (performance.now() - pinchedAt < 350 || m.v < 0.5) return; // ignore the tap that ends a pinch, and unrevealed dots
        userSel = i;
        showMilestone(i);
      };
      const onDotKey = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          pick();
        }
      };
      m.el?.addEventListener("click", pick);
      m.el?.addEventListener("keydown", onDotKey);
      return [m.el, pick, onDotKey];
    });

    if (layout()) render();
    const ro = new ResizeObserver(() => {
      if (layout()) render();
    });
    ro.observe(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      frame.removeEventListener("touchstart", onTouchStart);
      frame.removeEventListener("touchmove", onTouchMove);
      frame.removeEventListener("touchend", endPinch);
      frame.removeEventListener("touchcancel", endPinch);
      ["gesturestart", "gesturechange", "gestureend"].forEach((t) => frame.removeEventListener(t, noGesture));
      frame.removeEventListener("wheel", onWheel);
      btnInRef.current?.removeEventListener("click", onIn);
      btnOutRef.current?.removeEventListener("click", onOut);
      rail.removeEventListener("pointerdown", onDown);
      rail.removeEventListener("pointermove", onMove);
      rail.removeEventListener("pointerup", endScrub);
      rail.removeEventListener("pointercancel", endScrub);
      rail.removeEventListener("keydown", onKey);
      picks.forEach(([el, pick, onDotKey]) => {
        el?.removeEventListener("click", pick);
        el?.removeEventListener("keydown", onDotKey);
      });
    };
    // re-run only when the milestones themselves change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (!n) return null;
  const coarse = typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches;
  const cur = list[Math.min(shown, n - 1)];

  // full width on phones (the reference gives it the whole fold); capped
  // on desktop so it doesn't dominate the wider profile card
  return (
    <div className="flex flex-col w-full md:max-w-[420px] md:mx-auto">
      <style>{`
        .tl-dot{cursor:pointer;outline:none}
        .tl-dot .tl-core{stroke:#19191b;stroke-width:1.5;transition:r .16s ease}
        .tl-dot[data-kind="academics"] .tl-core{fill:${C.pink}}
        .tl-dot[data-kind="work"] .tl-core{fill:${C.purple}}
        .tl-dot .tl-sel{fill:none;stroke:#fff;stroke-width:1.25;opacity:0;transition:opacity .16s ease}
        .tl-dot.is-sel .tl-sel{opacity:.9}
        .tl-dot.is-sel .tl-core{r:6.5px}
        .tl-dot:focus-visible .tl-sel{opacity:1;stroke:${C.yellow}}
        .tl-dot .tl-pulse{fill:none;stroke:${C.yellow};stroke-width:1.5;opacity:0;pointer-events:none;transform-box:fill-box;transform-origin:center}
        .tl-dot.is-now .tl-pulse{animation:tl-pulse 2s ease-out infinite}
        @keyframes tl-pulse{0%{transform:scale(.7);opacity:.85}100%{transform:scale(2.1);opacity:0}}
        .tl-swap{animation:tl-swap .2s ease-out}
        @keyframes tl-swap{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
        .tl-zoom-btn:disabled{opacity:.32;cursor:default}
        @media (prefers-reduced-motion: reduce){.tl-dot.is-now .tl-pulse,.tl-swap{animation:none}}
      `}</style>

      <div className="flex gap-[18px] justify-center mt-0.5 mb-3.5 text-[11.5px]" style={{ color: C.grey }}>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: C.pink }} />
          academics
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: C.purple }} />
          work &amp; project experience
        </span>
      </div>

      <div
        ref={frameRef}
        role="group"
        aria-label="Timeline of studies and work. Zoom in to go back in time, zoom out to see later years, up to today."
        className="relative w-full overflow-hidden rounded-2xl select-none min-h-[320px] md:min-h-0 [touch-action:pan-y]"
        style={{ aspectRatio: "1 / 0.92", background: C.card2, border: `1px solid ${C.line}` }}
      >
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full block"
          style={{
            WebkitMaskImage: "radial-gradient(ellipse farthest-corner at 50% 50%, #000 62%, transparent 99%)",
            maskImage: "radial-gradient(ellipse farthest-corner at 50% 50%, #000 62%, transparent 99%)"
          }}
        >
          <path ref={ghostRef} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path ref={trailRef} fill="none" stroke="rgba(255,255,255,0.46)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          {list.map((m, i) => (
            <g
              key={i}
              ref={(el) => (dotRefs.current[i] = el)}
              className="tl-dot"
              data-kind={m.kind}
              role="button"
              tabIndex={0}
              aria-label={`${m.year} — ${m.title}`}
              style={{ visibility: "hidden" }}
            >
              {i === n - 1 && <circle className="tl-pulse" r="9" />}
              <circle r="16" fill="transparent" />
              <circle className="tl-sel" r="11" />
              <circle className="tl-core" r="5.5" />
            </g>
          ))}
        </svg>

        <div
          aria-hidden="true"
          className="absolute left-3 bottom-3 z-[2] inline-flex items-center gap-[7px] py-[7px] pl-2.5 pr-3 rounded-full pointer-events-none transition-all duration-[250ms]"
          style={{
            background: "rgba(22,22,22,0.82)",
            border: `1px solid ${C.line}`,
            color: C.grey,
            font: "500 11.5px Inter, sans-serif",
            opacity: hintGone ? 0 : 1,
            transform: hintGone ? "translateY(4px)" : "none"
          }}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4l6 6M10 5.5V10H5.5M20 20l-6-6M14 18.5V14h4.5" />
          </svg>
          {coarse ? "Pinch to zoom out for later years" : "Ctrl + scroll to zoom out for later years"}
        </div>

        <div className="absolute right-3 bottom-3 z-[2] flex flex-col gap-2">
          {[
            { ref: btnInRef, label: "Zoom in, back in time", d: "M12 5v14M5 12h14" },
            { ref: btnOutRef, label: "Zoom out, toward today", d: "M5 12h14" }
          ].map((b) => (
            <button
              key={b.label}
              ref={b.ref}
              type="button"
              aria-label={b.label}
              className="tl-zoom-btn w-[34px] h-[34px] p-0 rounded-full flex items-center justify-center text-white active:bg-[#2c2c2e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFD007]"
              style={{ background: "rgba(35,35,37,0.92)", border: `1px solid ${C.lineStrong}` }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d={b.d} />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div
        ref={railRef}
        role="slider"
        tabIndex={0}
        aria-label="Timeline position"
        aria-valuemin={0}
        aria-valuemax={n - 1}
        className="mt-3.5 px-2 cursor-pointer outline-none select-none [touch-action:pan-y] group"
      >
        <div ref={trackRef} className="relative h-[22px]">
          <div className="absolute left-0 right-0 top-1/2 h-[3px] -mt-[1.5px] rounded-sm" style={{ background: C.lineStrong }} />
          <div ref={fillRef} className="absolute left-0 top-1/2 h-[3px] -mt-[1.5px] w-0 rounded-sm" style={{ background: C.yellow }} />
          <div
            ref={thumbRef}
            className="absolute top-1/2 left-0 w-3.5 h-3.5 -mt-[7px] -ml-[7px] rounded-full group-focus-visible:shadow-[0_0_0_3px_#161616,0_0_0_5px_#FFD007]"
            style={{ background: C.yellow, boxShadow: `0 0 0 3px ${C.bg}` }}
          />
        </div>
        <div ref={ticksRef} className="relative h-[18px]" aria-hidden="true" />
      </div>

      <div
        className="mt-3.5 rounded-2xl px-3.5 pt-[11px] pb-3"
        style={{ background: C.card, border: `1px solid ${C.line}` }}
        aria-live="polite"
      >
        <div key={swapKey} className="tl-swap">
          <span className="block text-xs font-semibold leading-[1.2]" style={{ color: cur.kind === "academics" ? C.pink : C.purple }}>
            {cur.year}
          </span>
          <p className="mt-1 text-[12.5px] leading-[1.4] text-white">{cur.title}</p>
        </div>
      </div>
    </div>
  );
}
