/* ─────────────────────────────────────────────────────────────────────────
   PortfolioReviewPDFTemplate
   Uses @react-pdf/renderer — its own PDF layout engine, NOT the DOM.

   Known constraints:
   • Only paralucent-medium.otf (weight 500) is available. Never use > 500.
   • Paralucent does NOT have ✦ (U+2736) — use a small yellow View dot instead.
   • rgba() on borderColor can mis-parse in some react-pdf versions — use solid
     hex colours for all borders/backgrounds.
   • letterSpacing in react-pdf is measured in pt per glyph — 0.5 is plenty.
───────────────────────────────────────────────────────────────────────── */
import { Document, Page, View, Text, Font, Link } from "@react-pdf/renderer";
import paralucentRawUrl from "../../assets/fonts/paralucent-medium.otf?url";

// @react-pdf/renderer's worker fetches the font via fetch().
// A root-relative URL like "/src/assets/..." fails in the worker context
// because the worker resolves it against blob:// — not the page origin.
// Making it absolute fixes the font not loading.
const FONT_URL =
  typeof globalThis.location !== "undefined"
    ? new URL(paralucentRawUrl, globalThis.location.href).href
    : paralucentRawUrl;

Font.register({ family: "Paralucent", src: FONT_URL });
Font.registerHyphenationCallback((word) => [word]);

/* ── Solid colour palette (no rgba on borders — react-pdf can misparse) ── */
const BG = "#0a0a0a";
const CARD = "#111111";
const CARD2 = "#161616";
const BORDER = "#252525";
const WHITE = "#ffffff";
const MUTED = "#606060"; // ≈ rgba(255,255,255,0.38) on #0a0a0a
const MUTED2 = "#c2c2c2"; // ≈ rgba(255,255,255,0.76)
const YELLOW = "#FFD007";
const YELLOW_BG = "#1f1b00"; // ≈ rgba(255,208,7,0.12) on #0a0a0a
const YELLOW_BD = "#4d4200"; // ≈ rgba(255,208,7,0.30) border
const PINK = "#DF0586";
const PURPLE = "#A35BFB";
const PURPLE_BG = "#130d21"; // ≈ rgba(163,91,251,0.12) on #0a0a0a
const PURPLE_BD = "#2e1a4d"; // ≈ rgba(163,91,251,0.30) border
const TAG_BD = "#4a3e00"; // ≈ rgba(255,208,7,0.28) border for tag chips

const F = "Paralucent";

/* ── Small yellow dot (replaces ✦ which Paralucent doesn't have) ── */
function YellowDot() {
  return (
    <View
      style={{
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: YELLOW,
        marginRight: 8,
        marginTop: 3,
        flexShrink: 0
      }}
    />
  );
}

/* ── Section header ── */
function SectionHeader({ n, title }) {
  return (
    <View
      style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}
    >
      <Text
        style={{ fontSize: 10, color: PINK, fontFamily: F, marginRight: 10 }}
      >
        {String(n).padStart(2, "0")}
      </Text>
      <Text style={{ fontSize: 14, color: WHITE, fontFamily: F }}>{title}</Text>
    </View>
  );
}

/* ── Row (stage / strength / role fit) ── */
function Row({ label, value }) {
  if (!value) return null;
  return (
    <View style={{ flexDirection: "row", marginBottom: 9 }}>
      <Text
        style={{
          fontSize: 10,
          color: YELLOW,
          fontFamily: F,
          width: 62,
          flexShrink: 0
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: 10,
          color: MUTED2,
          fontFamily: F,
          flex: 1,
          lineHeight: 1.6
        }}
      >
        {value}
      </Text>
    </View>
  );
}

/* ── Bullet item ── */
function Bullet({ text }) {
  if (!text) return null;
  return (
    <View style={{ flexDirection: "row", marginBottom: 7 }}>
      <Text
        style={{ fontSize: 10, color: MUTED, fontFamily: F, marginRight: 10 }}
      >
        —
      </Text>
      <Text
        style={{
          fontSize: 10,
          color: MUTED2,
          fontFamily: F,
          flex: 1,
          lineHeight: 1.65
        }}
      >
        {text}
      </Text>
    </View>
  );
}

/* ── Sub-label (a. portfolio and project gaps) — lowercase, minimal spacing ── */
function SubLabel({ children }) {
  return (
    <Text
      style={{
        fontSize: 8,
        color: MUTED,
        fontFamily: F,
        letterSpacing: 0.5,
        marginBottom: 9
      }}
    >
      {children}
    </Text>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main component
═══════════════════════════════════════════════════════════════════════════ */
export default function PortfolioReviewPDFTemplate({ report, review }) {
  if (!report) return null;

  const monthYear = new Date()
    .toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric"
    })
    .toLowerCase();

  const m = report.metrics || {};
  const wy = report.where_you_are || {};
  const ww = (report.working_well || []).filter((p) => p?.title);
  const hb = report.holding_back || {};
  const fn = (report.focus_next || []).filter((p) => p?.action);
  const tags = Array.isArray(report.student?.tags) ? report.student.tags : [];
  const name = (report.student?.name || review?.name || "").toLowerCase();

  const pairs = [];
  for (let i = 0; i < ww.length; i += 2) pairs.push(ww.slice(i, i + 2));

  const METRIC_CARDS = [
    { title: "first impression", data: m.first_impression },
    { title: "project depth", data: m.project_depth },
    { title: "stack breadth", data: m.stack_breadth },
    { title: "direction clarity", data: m.direction_clarity }
  ];

  const GAPS = [
    { label: "a. portfolio and project gaps", items: hb.portfolio_gaps },
    { label: "b. thinking and process gaps", items: hb.thinking_gaps },
    { label: "c. positioning and direction gaps", items: hb.positioning_gaps }
  ].filter((g) => g.items?.some(Boolean));

  return (
    <Document>
      <Page
        size="A4"
        style={{
          backgroundColor: BG,
          paddingHorizontal: 48,
          paddingTop: 44,
          paddingBottom: 44,
          fontFamily: F
        }}
      >
        {/* ── Header bar ── */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 28
          }}
        >
          <Text style={{ fontSize: 8, color: MUTED, fontFamily: F }}>
            evolve portfolio review · {monthYear}
          </Text>
          <Text style={{ fontSize: 8, color: MUTED, fontFamily: F }}>
            evolvedesign.academy
          </Text>
        </View>

        {/* ── "portfolio review" label ── */}
        <Text
          style={{
            fontSize: 10,
            color: PINK,
            fontFamily: F,
            letterSpacing: 0.8,
            marginBottom: 10
          }}
        >
          portfolio review
        </Text>

        {/* ── Student name ── */}
        <Text
          style={{
            fontSize: 54,
            color: WHITE,
            fontFamily: F,
            letterSpacing: -0.5,
            lineHeight: 1.0,
            marginBottom: 10
          }}
        >
          {name}
        </Text>

        {/* ── Tagline ── */}
        {report.student?.tagline ? (
          <Text
            style={{
              fontSize: 11,
              color: MUTED2,
              fontFamily: F,
              marginBottom: 14,
              lineHeight: 1.5
            }}
          >
            {report.student.tagline}
          </Text>
        ) : null}

        {/* ── Tags ── */}
        {tags.length > 0 ? (
          <View
            style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 28 }}
          >
            {tags.map((t, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  borderRadius: 99,
                  borderWidth: 1,
                  borderColor: TAG_BD,
                  borderStyle: "solid",
                  marginRight: 8,
                  marginBottom: 6
                }}
              >
                <Text style={{ fontSize: 10, color: YELLOW, fontFamily: F }}>
                  {t}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* ── 4 metric cards ── */}
        <View style={{ flexDirection: "row", marginBottom: 36 }}>
          {METRIC_CARDS.map(({ title, data }, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                backgroundColor: CARD,
                borderWidth: 1,
                borderColor: BORDER,
                borderStyle: "solid",
                borderRadius: 8,
                padding: 14,
                marginRight: i < 3 ? 8 : 0,
                overflow: "hidden"
              }}
            >
              {/* title: uppercase, tight letter spacing */}
              <Text
                style={{
                  fontSize: 7,
                  color: MUTED,
                  fontFamily: F,
                  letterSpacing: 0.5,
                  marginBottom: 8
                }}
              >
                {title.toUpperCase()}
              </Text>
              {/* font size 16 → long labels like "surface-level" won't overflow
                  the ~90 pt inner card width (A4 499pt − 24pt gaps, ÷4 cards − 28pt padding) */}
              <Text
                style={{
                  fontSize: 16,
                  color: WHITE,
                  fontFamily: F,
                  lineHeight: 1.2,
                  marginBottom: 6
                }}
              >
                {data?.label || "—"}
              </Text>
              <Text
                style={{
                  fontSize: 9,
                  color: MUTED,
                  fontFamily: F,
                  lineHeight: 1.5
                }}
              >
                {data?.description || ""}
              </Text>
            </View>
          ))}
        </View>

        {/* ══ 01 ══ */}
        <View style={{ marginBottom: 36 }}>
          <SectionHeader n={1} title="where you are right now" />
          <Row label="stage" value={wy.stage} />
          <Row label="strength" value={wy.strength} />
          <Row label="role fit" value={wy.role_fit} />
          {wy.summary ? (
            <View
              style={{
                marginTop: 12,
                paddingLeft: 14,
                borderLeftWidth: 2,
                borderLeftColor: YELLOW,
                borderLeftStyle: "solid"
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  color: MUTED2,
                  fontFamily: F,
                  lineHeight: 1.8
                }}
              >
                {wy.summary}
              </Text>
            </View>
          ) : null}
        </View>

        {/* ══ 02 ══ */}
        {ww.length > 0 ? (
          <View style={{ marginBottom: 36 }}>
            <SectionHeader n={2} title="what is working well" />
            {pairs.map((pair, ri) => (
              <View key={ri} style={{ flexDirection: "row", marginBottom: 8 }}>
                {pair.map((pt, pi) => (
                  <View
                    key={pi}
                    style={{
                      flex: 1,
                      backgroundColor: CARD2,
                      borderWidth: 1,
                      borderColor: BORDER,
                      borderStyle: "solid",
                      borderRadius: 8,
                      padding: 14,
                      marginRight: pi === 0 ? 8 : 0
                    }}
                  >
                    {/* ✦ replaced by yellow dot — Paralucent has no ✦ glyph */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        marginBottom: 8
                      }}
                    >
                      <YellowDot />
                      <Text
                        style={{
                          fontSize: 11,
                          color: WHITE,
                          fontFamily: F,
                          flex: 1,
                          lineHeight: 1.4
                        }}
                      >
                        {pt.title}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 9,
                        color: MUTED,
                        fontFamily: F,
                        lineHeight: 1.65
                      }}
                    >
                      {pt.description}
                    </Text>
                  </View>
                ))}
                {pair.length === 1 ? <View style={{ flex: 1 }} /> : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* ══ 03 ══ */}
        {GAPS.length > 0 ? (
          <View style={{ marginBottom: 36 }}>
            <SectionHeader n={3} title="what is holding you back" />
            {GAPS.map(({ label, items }, gi) => (
              <View key={gi} style={{ marginBottom: 14 }}>
                {/* lowercase sub-label, minimal letter spacing to match Rahul PDF */}
                <SubLabel>{label}</SubLabel>
                {items.filter(Boolean).map((item, ii) => (
                  <Bullet key={ii} text={item} />
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {/* ══ 04 ══ */}
        {fn.length > 0 ? (
          <View style={{ marginBottom: 36 }}>
            <SectionHeader n={4} title="what you should focus on next" />
            {fn.map((pr, i) => {
              const isNow = pr.timing === "now";
              return (
                <View
                  key={i}
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    backgroundColor: CARD,
                    borderWidth: 1,
                    borderColor: BORDER,
                    borderStyle: "solid",
                    borderRadius: 8,
                    padding: 14,
                    marginBottom: 8
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      color: PURPLE,
                      fontFamily: F,
                      marginRight: 14,
                      lineHeight: 1,
                      width: 28
                    }}
                  >
                    {pr.number || String(i + 1).padStart(2, "0")}
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 10,
                      color: MUTED2,
                      fontFamily: F,
                      lineHeight: 1.65
                    }}
                  >
                    {pr.action}
                  </Text>
                  {/* solid colours — no rgba on borders */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 99,
                      backgroundColor: isNow ? YELLOW_BG : PURPLE_BG,
                      borderWidth: 1,
                      borderColor: isNow ? YELLOW_BD : PURPLE_BD,
                      borderStyle: "solid",
                      marginLeft: 12
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 9,
                        color: isNow ? YELLOW : PURPLE,
                        fontFamily: F
                      }}
                    >
                      {pr.timing || "now"}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}

        {/* ══ 05 ══ */}
        {report.what_this_means ? (
          <View style={{ marginBottom: 36 }}>
            <SectionHeader n={5} title="what this means" />
            <Text
              style={{
                fontSize: 10,
                color: MUTED2,
                fontFamily: F,
                lineHeight: 1.85
              }}
            >
              {report.what_this_means}
            </Text>
          </View>
        ) : null}

        {/* ══ 06 ══ */}
        {report.where_to_go ? (
          <View style={{ marginBottom: 40 }}>
            <SectionHeader n={6} title="where to go from here" />
            <Text
              style={{
                fontSize: 10,
                color: MUTED2,
                fontFamily: F,
                lineHeight: 1.85
              }}
            >
              {report.where_to_go}
            </Text>
          </View>
        ) : null}

        {/* ── CTA ── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 44
          }}
        >
          <Link
            src="https://calendly.com/chesna-paperclip/new-meeting"
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 22,
              paddingVertical: 11,
              borderRadius: 8,
              backgroundColor: YELLOW,
              textDecoration: "none"
            }}
          >
            <Text style={{ fontSize: 11, color: "#000000", fontFamily: F }}>
              book a 30-min call
            </Text>
          </Link>
        </View>

        {/* ── Footer ── */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 14,
            borderTopWidth: 1,
            borderTopColor: BORDER,
            borderTopStyle: "solid"
          }}
        >
          <Text style={{ fontSize: 8, color: MUTED, fontFamily: F }}>
            evolve · evolvedesign.academy
          </Text>
          <Text style={{ fontSize: 8, color: MUTED, fontFamily: F }}>
            portfolio review · {monthYear}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
