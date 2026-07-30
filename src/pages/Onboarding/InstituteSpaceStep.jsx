import { useState, useEffect, useRef } from "react";
import GrowthMascot from "../../components/GrowthMascot";

const MEMBER_OPTIONS = ["1–10", "11–25", "26–50", "51–100", "100+"];
const MODE_OPTIONS = ["online", "offline (in-person)", "hybrid"];

// A tiny seed of well-known institutes so the demo/early rollout feels like a
// real fetch for the names people are most likely to try first. Everything
// else still gets a real favicon (Google's public favicon service needs no
// backend) plus a best-effort name guess from the domain/LinkedIn slug.
const KNOWN_SITES = {
  "nid.edu": {
    name: "National Institute of Design",
    location: "Ahmedabad, Gujarat",
    yearFounded: "1961",
    bio: "India's premier multi-disciplinary design institute, offering education across industrial, communication, textile and interaction design since 1961.",
    programmeDetails:
      "UG & PG programmes in Industrial Design, Communication Design, Textile & Apparel Design, and a PhD in Design."
  }
};

// what shows above the loader while the space is being put together — timed
// rather than driven by real backend progress events (there aren't any
// granular ones to hook into), but each label is genuinely describing the
// stage that's happening around when it appears.
const PROGRESS_STEPS = ["fetching your website…", "reading through the details…", "putting your page together…", "almost done…"];

function guessFromLink(raw) {
  let s = raw.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  const domain = s.split("/")[0];
  let nameGuess = "";
  const liMatch = s.match(/linkedin\.com\/(?:school|company)\/([^/?#]+)/i);
  if (liMatch) {
    nameGuess = liMatch[1].replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  } else {
    const core = domain.split(".")[0];
    nameGuess = core.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return { domain, nameGuess };
}

function Field({ label, optional, half, children }) {
  return (
    <div className={half ? "flex-1 min-w-0" : "w-full"}>
      <label className="text-white/40 text-xs font-semibold uppercase tracking-wide mb-2 block">
        {label}
        {optional && <span className="normal-case font-normal text-white/25"> (optional)</span>}
      </label>
      {children}
    </div>
  );
}

/**
 * Institute flow · step 2 — the space itself. One screen: drop a link (or
 * just a name, if there's no site) plus the two things only the admin can
 * answer (how programmes run, how many people to onboard), then evolve
 * builds the actual space directly — no intermediate "here's what we found,
 * please review" form. Everything pulled from the site (bio, logo, socials,
 * awards, calendar dates, testimonials, news) gets seeded for real; it's
 * all still fully editable afterward from the space itself, which is a much
 * better place to fine-tune it than a one-time onboarding screen.
 */
export default function InstituteSpaceStep({ initial, onBack, onSubmit, submitting, error }) {
  const [phase, setPhase] = useState("form"); // form | building
  const [linkInput, setLinkInput] = useState(initial?.sourceUrl || "");
  const [noWebsite, setNoWebsite] = useState(false);
  const [manualName, setManualName] = useState(initial?.spaceName || "");
  const [mode, setMode] = useState(initial?.mode || "");
  const [members, setMembers] = useState(initial?.members || "");
  const [touched, setTouched] = useState(false);
  const [progressLabel, setProgressLabel] = useState(PROGRESS_STEPS[0]);
  const [progressStep, setProgressStep] = useState(0);
  const tickerRef = useRef(null);

  // a failure bounces Onboarding.jsx back to this step with `error` set —
  // without this the loader would otherwise just sit on "almost done…"
  // forever since nothing else resets `phase`
  useEffect(() => {
    if (error) {
      clearInterval(tickerRef.current);
      setPhase("form");
    }
  }, [error]);

  useEffect(() => () => clearInterval(tickerRef.current), []);

  const canSubmit = (noWebsite ? manualName.trim().length > 0 : linkInput.trim().length > 0) && mode && members;

  const inputCls =
    "w-full border rounded-xl px-4 py-3.5 text-white placeholder-white/30 text-sm outline-none focus:border-evolve-lavender-indigo/70 transition-colors";
  const inputStyle = { backgroundColor: "rgba(255,255,255,0.06)" };
  const errCls = (bad) => (bad ? "border-evolve-red" : "border-white/15");
  // <option> elements ignore the select's own background/text classes in
  // most browsers (they render with the OS-native listbox by default) —
  // set colors explicitly on each option so the dropdown stays readable.
  const optionStyle = { backgroundColor: "#1f1f22", color: "#fff" };

  async function buildSpace() {
    setTouched(true);
    if (!canSubmit || submitting) return;

    setPhase("building");
    setProgressStep(0);
    setProgressLabel(PROGRESS_STEPS[0]);

    if (noWebsite) {
      // nothing to fetch — just a short "setting things up" beat before
      // handing off to org creation
      setProgressStep(PROGRESS_STEPS.length - 1);
      setProgressLabel(PROGRESS_STEPS[PROGRESS_STEPS.length - 1]);
      onSubmit({
        spaceName: manualName.trim(),
        website: "",
        logoUrl: "",
        bio: "",
        location: "",
        yearFounded: "",
        mode,
        members,
        programmeDetails: "",
        sourceUrl: "",
        socialLinks: [],
        awards: [],
        seedEvents: [],
        seedTestimonials: [],
        seedPosts: []
      });
      return;
    }

    let stepIdx = 0;
    tickerRef.current = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, PROGRESS_STEPS.length - 1);
      setProgressStep(stepIdx);
      setProgressLabel(PROGRESS_STEPS[stepIdx]);
    }, 1400);

    const val = linkInput.trim();
    const { domain, nameGuess } = guessFromLink(val);
    const known = KNOWN_SITES[domain];
    const fallbackWebsite = /^https?:\/\//i.test(val) ? val : `https://${val}`;

    let extracted = null;
    try {
      const res = await fetch("/api/fetch-institute-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: val })
      });
      const data = await res.json();
      if (data.ok) extracted = data;
    } catch {
      // fall through to the domain-guess heuristic below
    }

    clearInterval(tickerRef.current);
    setProgressStep(PROGRESS_STEPS.length - 1);
    setProgressLabel(PROGRESS_STEPS[PROGRESS_STEPS.length - 1]);

    onSubmit({
      spaceName: (extracted?.name || known?.name || nameGuess || "").trim(),
      website: extracted?.website || fallbackWebsite,
      logoUrl: extracted?.logoUrl || `https://www.google.com/s2/favicons?sz=128&domain=${domain}`,
      bio: (extracted?.about || known?.bio || "").trim(),
      location: (extracted?.location || known?.location || "").trim(),
      yearFounded: (extracted?.yearFounded || known?.yearFounded || "").trim(),
      mode,
      members,
      programmeDetails: known?.programmeDetails || "",
      sourceUrl: val,
      socialLinks: extracted?.socialLinks || [],
      awards: extracted?.awards || [],
      // only keep events with a real stated date — nothing here should show
      // an admin a date evolve made up
      seedEvents: (extracted?.events || []).filter((e) => e.date && /^\d{4}-\d{2}-\d{2}$/.test(e.date)),
      seedTestimonials: extracted?.testimonials || [],
      seedPosts: extracted?.posts || []
    });
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
      style={{ backgroundColor: "#161618" }}
    >
      <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-6 text-center">
        <p className="text-evolve-lavender-indigo text-xs font-bold tracking-widest uppercase">
          🏫 institute space · step 2 of 2
        </p>
        <h1 className="text-white font-bold text-3xl md:text-4xl leading-tight">
          set up your institute space.
        </h1>
        <p className="text-white/50 text-sm max-w-sm">
          this is the shared space for your institute on evolve.
        </p>

        {phase === "form" && (
          <div className="w-full flex flex-col gap-4 mt-1 text-left">
            {!noWebsite ? (
              <div className="w-full rounded-2xl border border-white/10 p-5" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
                <p className="text-white/50 text-xs leading-relaxed mb-3">
                  drop your institute's website or LinkedIn page — evolve builds your page directly from it. everything stays editable on your space afterward.
                </p>
                <input
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && buildSpace()}
                  placeholder="yourinstitute.edu or linkedin.com/school/..."
                  className={`w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none border ${errCls(touched && !noWebsite && !linkInput.trim())} focus:border-evolve-lavender-indigo/70`}
                  style={inputStyle}
                />
                <button
                  onClick={() => setNoWebsite(true)}
                  className="text-white/40 text-xs underline underline-offset-2 mt-3 hover:text-white/70 transition-colors"
                >
                  don't have a website? enter your institute name instead →
                </button>
              </div>
            ) : (
              <div className="w-full rounded-2xl border border-white/10 p-5" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
                <Field label="institute name">
                  <input
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="e.g. National Institute of Design"
                    className={`${inputCls} ${errCls(touched && !manualName.trim())}`}
                    style={inputStyle}
                  />
                </Field>
                <button
                  onClick={() => setNoWebsite(false)}
                  className="text-white/40 text-xs underline underline-offset-2 mt-3 hover:text-white/70 transition-colors"
                >
                  ← actually, use a website link
                </button>
              </div>
            )}

            <div className="flex gap-3">
              <Field label="how do you run programmes?" half>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className={`${inputCls} ${errCls(touched && !mode)} appearance-none`}
                  style={inputStyle}
                >
                  <option value="" disabled style={optionStyle}>
                    select setup
                  </option>
                  {MODE_OPTIONS.map((m) => (
                    <option key={m} value={m} style={optionStyle}>
                      {m}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="members to onboard" half>
                <select
                  value={members}
                  onChange={(e) => setMembers(e.target.value)}
                  className={`${inputCls} ${errCls(touched && !members)} appearance-none`}
                  style={inputStyle}
                >
                  <option value="" disabled style={optionStyle}>
                    select range
                  </option>
                  {MEMBER_OPTIONS.map((m) => (
                    <option key={m} value={m} style={optionStyle}>
                      {m}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>
        )}

        {phase === "building" && (
          <div className="w-full flex flex-col items-center gap-5 py-10">
            <GrowthMascot progress={20 + progressStep * 25} size={56} />
            <p className="text-white font-semibold text-sm">{progressLabel}</p>
            <div className="w-full max-w-[220px] h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-evolve-lavender-indigo transition-all duration-700"
                style={{ width: `${((progressStep + 1) / PROGRESS_STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {error && <p className="text-evolve-red text-sm">{error}</p>}

        {phase === "form" && (
          <div className="w-full flex gap-3 mt-2">
            <button
              onClick={onBack}
              className="flex-1 border border-white/20 text-white font-semibold text-sm rounded-2xl py-4 active:opacity-80"
            >
              back
            </button>
            <button
              onClick={buildSpace}
              className="flex-[2] bg-evolve-yellow text-evolve-black font-bold text-base rounded-2xl py-4 transition-opacity active:scale-[0.98]"
            >
              build my space →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
