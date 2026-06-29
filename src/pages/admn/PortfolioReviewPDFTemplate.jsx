/* ─────────────────────────────────────────────────────────────────────────
   PortfolioReviewPDFTemplate
   Renders the report JSON as a styled HTML page at A4 width (794 px).
   Captured by html2canvas → jsPDF in AIReportModal.
───────────────────────────────────────────────────────────────────────── */

const BG       = "#0a0a0a";
const CARD_BG  = "#111111";
const CARD_BG2 = "#161616";
const BORDER   = "#1e1e1e";
const WHITE    = "#ffffff";
const MUTED    = "rgba(255,255,255,0.52)";
const YELLOW   = "#FFDC47";
const PINK     = "#DF0586";
const PURPLE   = "#A35BFB";
const GREEN    = "#22c55e";

const base = {
  fontFamily: "'Inter', 'Helvetica Neue', 'Arial', sans-serif",
  fontSize: 13,
  color: WHITE,
  lineHeight: 1.6,
  background: BG,
};

function Tag({ children }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: 99,
      border: `1px solid rgba(255,220,71,0.3)`,
      color: YELLOW,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.03em",
      marginRight: 6,
      marginBottom: 6,
    }}>
      {children}
    </span>
  );
}

function MetricCard({ title, label, description }) {
  return (
    <div style={{
      flex: 1,
      background: CARD_BG,
      border: `1px solid ${BORDER}`,
      borderRadius: 10,
      padding: "16px 14px",
      minWidth: 0,
    }}>
      <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: MUTED, textTransform: "uppercase", margin: "0 0 8px" }}>
        {title}
      </p>
      <p style={{ fontSize: 20, fontWeight: 900, color: WHITE, margin: "0 0 6px", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
        {label || "—"}
      </p>
      <p style={{ fontSize: 10, color: MUTED, margin: 0, lineHeight: 1.45 }}>
        {description || ""}
      </p>
    </div>
  );
}

function SectionNumber({ n }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 900, color: PINK, marginRight: 8, letterSpacing: "0.05em" }}>
      {String(n).padStart(2, "0")}
    </span>
  );
}

function SectionTitle({ n, children }) {
  return (
    <p style={{ fontSize: 13, fontWeight: 900, color: WHITE, letterSpacing: "0.04em", textTransform: "lowercase", margin: "0 0 14px", display: "flex", alignItems: "center" }}>
      <SectionNumber n={n} />
      {children}
    </p>
  );
}

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 8, fontSize: 12 }}>
      <span style={{ color: YELLOW, fontWeight: 700, minWidth: 80, flexShrink: 0 }}>{label}</span>
      <span style={{ color: "rgba(255,255,255,0.78)", lineHeight: 1.55 }}>{value}</span>
    </div>
  );
}

function BulletList({ items }) {
  if (!items?.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {items.filter(Boolean).map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, lineHeight: 1.55 }}>
          <span style={{ color: PINK, flexShrink: 0, marginTop: 1 }}>—</span>
          <span style={{ color: "rgba(255,255,255,0.72)" }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

function WorkingWellCard({ title, description }) {
  return (
    <div style={{
      background: CARD_BG2,
      border: `1px solid ${BORDER}`,
      borderRadius: 10,
      padding: "16px 16px",
      flex: 1,
      minWidth: 0,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
        <span style={{ color: YELLOW, fontSize: 14, flexShrink: 0 }}>✦</span>
        <p style={{ fontSize: 13, fontWeight: 800, color: WHITE, margin: 0, lineHeight: 1.3 }}>{title}</p>
      </div>
      <p style={{ fontSize: 11, color: MUTED, margin: 0, lineHeight: 1.6 }}>{description}</p>
    </div>
  );
}

function FocusItem({ number, action, timing }) {
  return (
    <div style={{
      display: "flex",
      gap: 14,
      background: CARD_BG,
      border: `1px solid ${BORDER}`,
      borderRadius: 10,
      padding: "14px 16px",
      marginBottom: 8,
    }}>
      <span style={{ fontSize: 20, fontWeight: 900, color: PURPLE, flexShrink: 0, lineHeight: 1 }}>
        {number}
      </span>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", margin: 0, lineHeight: 1.65 }}>{action}</p>
      </div>
      <span style={{
        fontSize: 10,
        fontWeight: 700,
        padding: "3px 10px",
        borderRadius: 99,
        flexShrink: 0,
        alignSelf: "flex-start",
        background: timing === "now" ? "rgba(255,220,71,0.12)" : "rgba(163,91,251,0.12)",
        color: timing === "now" ? YELLOW : PURPLE,
        border: `1px solid ${timing === "now" ? "rgba(255,220,71,0.2)" : "rgba(163,91,251,0.2)"}`,
      }}>
        {timing}
      </span>
    </div>
  );
}

export default function PortfolioReviewPDFTemplate({ report, review }) {
  if (!report) return null;

  const monthYear = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" }).toLowerCase();

  const m  = report.metrics         || {};
  const wy = report.where_you_are   || {};
  const ww = (report.working_well   || []).filter((p) => p.title);
  const hb = report.holding_back    || {};
  const fn = (report.focus_next     || []).filter((p) => p.action);

  const pairRows = (arr) => {
    const rows = [];
    for (let i = 0; i < arr.length; i += 2) {
      rows.push(arr.slice(i, i + 2));
    }
    return rows;
  };

  return (
    <div style={{ ...base, width: 794, padding: "48px 56px 64px", boxSizing: "border-box" }}>

      {/* ── Top header bar ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 36 }}>
        <span style={{ fontSize: 10, color: MUTED, letterSpacing: "0.06em" }}>
          evolve portfolio review · {monthYear}
        </span>
        <span style={{ fontSize: 10, color: MUTED, letterSpacing: "0.04em" }}>
          evolve · portfolio review · {monthYear} · evolve.design
        </span>
      </div>

      {/* ── "portfolio review" label ── */}
      <p style={{ fontSize: 12, fontWeight: 700, color: PINK, letterSpacing: "0.08em", textTransform: "lowercase", margin: "0 0 8px" }}>
        portfolio review
      </p>

      {/* ── Student name ── */}
      <h1 style={{ fontSize: 52, fontWeight: 900, color: WHITE, margin: "0 0 8px", letterSpacing: "-0.03em", lineHeight: 1.0, textTransform: "lowercase" }}>
        {(report.student?.name || review?.name || "").toLowerCase()}
      </h1>

      {/* ── Tagline ── */}
      {report.student?.tagline && (
        <p style={{ fontSize: 13, color: MUTED, margin: "0 0 14px", fontStyle: "italic" }}>
          {report.student.tagline}
        </p>
      )}

      {/* ── Skill tags ── */}
      {Array.isArray(report.student?.tags) && report.student.tags.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          {report.student.tags.map((t, i) => <Tag key={i}>{t}</Tag>)}
        </div>
      )}

      {/* ── Metric cards ── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 36 }}>
        <MetricCard title="first impression"  label={m.first_impression?.label}  description={m.first_impression?.description} />
        <MetricCard title="project depth"     label={m.project_depth?.label}     description={m.project_depth?.description} />
        <MetricCard title="stack breadth"     label={m.stack_breadth?.label}     description={m.stack_breadth?.description} />
        <MetricCard title="direction clarity" label={m.direction_clarity?.label} description={m.direction_clarity?.description} />
      </div>

      {/* ══ Section 01 ══ */}
      <div style={{ marginBottom: 32 }}>
        <SectionTitle n={1}>where you are right now</SectionTitle>
        <Row label="stage"    value={wy.stage}    />
        <Row label="strength" value={wy.strength} />
        <Row label="role fit" value={wy.role_fit} />
        {wy.summary && (
          <div style={{
            marginTop: 14,
            borderLeft: `3px solid ${YELLOW}`,
            paddingLeft: 14,
            fontSize: 12,
            color: "rgba(255,255,255,0.72)",
            lineHeight: 1.7,
          }}>
            {wy.summary}
          </div>
        )}
      </div>

      {/* ══ Section 02 ══ */}
      {ww.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <SectionTitle n={2}>what is working well</SectionTitle>
          {pairRows(ww).map((pair, ri) => (
            <div key={ri} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              {pair.map((pt, pi) => <WorkingWellCard key={pi} title={pt.title} description={pt.description} />)}
              {pair.length === 1 && <div style={{ flex: 1 }} />}
            </div>
          ))}
        </div>
      )}

      {/* ══ Section 03 ══ */}
      {(hb.portfolio_gaps?.length || hb.thinking_gaps?.length || hb.positioning_gaps?.length) ? (
        <div style={{ marginBottom: 32 }}>
          <SectionTitle n={3}>what is holding you back</SectionTitle>

          {hb.portfolio_gaps?.filter(Boolean).length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>
                a. portfolio and project gaps
              </p>
              <BulletList items={hb.portfolio_gaps} />
            </div>
          )}

          {hb.thinking_gaps?.filter(Boolean).length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>
                b. thinking and process gaps
              </p>
              <BulletList items={hb.thinking_gaps} />
            </div>
          )}

          {hb.positioning_gaps?.filter(Boolean).length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>
                c. positioning and direction gaps
              </p>
              <BulletList items={hb.positioning_gaps} />
            </div>
          )}
        </div>
      ) : null}

      {/* ══ Section 04 ══ */}
      {fn.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <SectionTitle n={4}>what you should focus on next</SectionTitle>
          {fn.map((pr, i) => (
            <FocusItem key={i} number={pr.number || String(i + 1).padStart(2, "0")} action={pr.action} timing={pr.timing || "now"} />
          ))}
        </div>
      )}

      {/* ══ Section 05 ══ */}
      {report.what_this_means && (
        <div style={{ marginBottom: 32 }}>
          <SectionTitle n={5}>what this means</SectionTitle>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.72)", lineHeight: 1.75, margin: 0 }}>
            {report.what_this_means}
          </p>
        </div>
      )}

      {/* ══ Section 06 ══ */}
      {report.where_to_go && (
        <div style={{ marginBottom: 40 }}>
          <SectionTitle n={6}>where to go from here</SectionTitle>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.72)", lineHeight: 1.75, margin: 0 }}>
            {report.where_to_go}
          </p>
        </div>
      )}

      {/* ── CTAs ── */}
      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <div style={{
          padding: "12px 22px",
          borderRadius: 10,
          background: YELLOW,
          color: "#000",
          fontWeight: 800,
          fontSize: 12,
          letterSpacing: "0.01em",
        }}>
          book a 30-min call
        </div>
        <div style={{
          padding: "12px 22px",
          borderRadius: 10,
          border: `1px solid rgba(255,255,255,0.15)`,
          color: WHITE,
          fontWeight: 700,
          fontSize: 12,
        }}>
          explore our mentorship
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{
        marginTop: 48,
        paddingTop: 16,
        borderTop: `1px solid ${BORDER}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <span style={{ fontSize: 10, color: MUTED }}>evolve · evolvedesign.academy</span>
        <span style={{ fontSize: 10, color: MUTED }}>portfolio review · {monthYear}</span>
      </div>
    </div>
  );
}
