import { useState } from "react";
import GrowthMascot from "../../components/GrowthMascot";

const MEMBER_OPTIONS = ["1–10", "11–25", "26–50", "51–100", "100+"];
const MODE_OPTIONS = ["online", "offline (in-person)", "hybrid"];

// A tiny seed of well-known institutes so the demo/early rollout feels like a
// real fetch for the names people are most likely to try first. Everything
// else still gets a real favicon (Google's public favicon service needs no
// backend) plus a best-effort name guess from the domain/LinkedIn slug —
// and every field stays fully editable either way.
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

// a removable-row list used for everything pulled from the site (socials,
// awards, calendar events, testimonials, posts) — same shape, so admins
// review it once instead of learning five different mini-editors
function RemovableList({ label, items, onRemove, renderItem }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="text-white/30 text-[10.5px] font-bold uppercase tracking-wide mb-1.5">{label}</p>
      <div className="flex flex-col gap-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-start justify-between gap-2 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2">
            <div className="min-w-0 text-xs text-white/70 leading-relaxed">{renderItem(item)}</div>
            <button onClick={() => onRemove(i)} className="text-white/30 hover:text-evolve-red flex-shrink-0 text-sm leading-none mt-0.5">
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Institute flow · step 2 — the space itself. Leads with a link-fetch so an
 * admin doesn't have to hand-type everything about their own institute; the
 * fetched (or manually entered) fields stay fully editable before creating
 * the space.
 */
export default function InstituteSpaceStep({ initial, onBack, onSubmit, submitting, error }) {
  const [phase, setPhase] = useState("fetch"); // fetch | loading | fields
  const [autoFilled, setAutoFilled] = useState(false);
  const [fetchNote, setFetchNote] = useState("");
  const [linkInput, setLinkInput] = useState(initial?.sourceUrl || "");
  const [linkError, setLinkError] = useState(false);

  const [spaceName, setSpaceName] = useState(initial?.spaceName || "");
  const [website, setWebsite] = useState(initial?.website || "");
  const [logoUrl, setLogoUrl] = useState(initial?.logoUrl || "");
  const [bio, setBio] = useState(initial?.bio || "");
  const [location, setLocation] = useState(initial?.location || "");
  const [yearFounded, setYearFounded] = useState(initial?.yearFounded || "");
  const [mode, setMode] = useState(initial?.mode || "");
  const [members, setMembers] = useState(initial?.members || "");
  const [programmeDetails, setProgrammeDetails] = useState(initial?.programmeDetails || "");
  const [touched, setTouched] = useState(false);

  // pulled from the institute's own site — reviewed here as removable
  // drafts, then seeded onto the space once it's created. Anything left in
  // these lists is exactly what gets saved.
  const [socialLinks, setSocialLinks] = useState(initial?.socialLinks || []);
  const [awards, setAwards] = useState(initial?.awards || []);
  const [seedEvents, setSeedEvents] = useState(initial?.seedEvents || []);
  const [seedTestimonials, setSeedTestimonials] = useState(initial?.seedTestimonials || []);
  const [seedPosts, setSeedPosts] = useState(initial?.seedPosts || []);

  async function runFetch() {
    const val = linkInput.trim();
    if (!val) {
      setLinkError(true);
      return;
    }
    setLinkError(false);
    setPhase("loading");
    setFetchNote("");

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
      else if (data.reason) setFetchNote(data.reason + " — everything below is still editable.");
    } catch {
      setFetchNote("couldn't reach that site — everything below is still editable.");
    }

    setSpaceName(extracted?.name || known?.name || nameGuess);
    setLocation(extracted?.location || known?.location || "");
    setYearFounded(extracted?.yearFounded || known?.yearFounded || "");
    setBio(extracted?.about || known?.bio || "");
    setProgrammeDetails(known?.programmeDetails || "");
    setWebsite(extracted?.website || fallbackWebsite);
    setLogoUrl(extracted?.logoUrl || `https://www.google.com/s2/favicons?sz=128&domain=${domain}`);
    setSocialLinks(extracted?.socialLinks || []);
    setAwards(extracted?.awards || []);
    // only keep events with a real stated date — nothing here should show
    // an admin a date evolve made up
    setSeedEvents((extracted?.events || []).filter((e) => e.date && /^\d{4}-\d{2}-\d{2}$/.test(e.date)));
    setSeedTestimonials(extracted?.testimonials || []);
    setSeedPosts(extracted?.posts || []);
    setAutoFilled(true);
    setPhase("fields");
  }

  function skipToManual() {
    setAutoFilled(false);
    setPhase("fields");
  }

  const canSubmit =
    spaceName.trim().length > 0 && location.trim().length > 0 && mode && members;

  function handleSubmit() {
    setTouched(true);
    if (!canSubmit || submitting) return;
    onSubmit({
      spaceName: spaceName.trim(),
      website: website.trim(),
      logoUrl,
      bio: bio.trim(),
      location: location.trim(),
      yearFounded: yearFounded.trim(),
      mode,
      members,
      programmeDetails: programmeDetails.trim(),
      sourceUrl: linkInput.trim(),
      socialLinks,
      awards,
      seedEvents,
      seedTestimonials,
      seedPosts
    });
  }

  const inputCls =
    "w-full border rounded-xl px-4 py-3.5 text-white placeholder-white/30 text-sm outline-none focus:border-evolve-lavender-indigo/70 transition-colors";
  const inputStyle = { backgroundColor: "rgba(255,255,255,0.06)" };
  const errCls = (bad) => (bad ? "border-evolve-red" : "border-white/15");
  // <option> elements ignore the select's own background/text classes in
  // most browsers (they render with the OS-native listbox by default) —
  // set colors explicitly on each option so the dropdown stays readable.
  const optionStyle = { backgroundColor: "#1f1f22", color: "#fff" };

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

        {phase === "fetch" && (
          <div className="w-full rounded-2xl border border-white/10 p-5 mt-2 text-left" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
            <p className="text-white/50 text-xs leading-relaxed mb-3">
              drop your institute's website or LinkedIn page — we'll pull the name, logo &amp; details in for you.
            </p>
            <div className="flex gap-2">
              <input
                value={linkInput}
                onChange={(e) => { setLinkInput(e.target.value); setLinkError(false); }}
                onKeyDown={(e) => e.key === "Enter" && runFetch()}
                placeholder="yourinstitute.edu or linkedin.com/school/..."
                className={`flex-1 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none border ${errCls(linkError)} focus:border-evolve-lavender-indigo/70`}
                style={inputStyle}
              />
              <button
                onClick={runFetch}
                className="bg-evolve-lavender-indigo text-white font-bold text-sm rounded-xl px-5 flex-shrink-0"
              >
                fetch details
              </button>
            </div>
            <button
              onClick={skipToManual}
              className="text-white/40 text-xs underline underline-offset-2 mt-3 hover:text-white/70 transition-colors"
            >
              don't have a link? enter details manually →
            </button>
          </div>
        )}

        {phase === "loading" && (
          <div className="w-full flex items-center justify-center gap-3 py-8 text-white/50 text-sm">
            <GrowthMascot progress={12} size={28} />
            pulling in your details…
          </div>
        )}

        {phase === "fields" && (
          <div className="w-full flex flex-col gap-4 mt-1 text-left">
            {autoFilled && !fetchNote && (
              <div className="flex items-center gap-2 rounded-full bg-evolve-inchworm/10 border border-evolve-inchworm/25 text-evolve-inchworm text-xs font-bold px-3 py-1.5 w-fit">
                ✨ auto-filled from your link — feel free to edit
              </div>
            )}
            {fetchNote && (
              <div className="flex items-center gap-2 rounded-full bg-evolve-yellow/10 border border-evolve-yellow/25 text-evolve-yellow text-xs font-bold px-3 py-1.5 w-fit">
                ⚠ {fetchNote}
              </div>
            )}

            {autoFilled && (
              <div
                className="rounded-2xl border p-4 flex items-center gap-3"
                style={{ borderColor: "rgba(163,91,251,0.35)", background: "rgba(163,91,251,0.08)" }}
              >
                <div className="w-12 h-12 min-w-[48px] rounded-xl overflow-hidden bg-black/20 border border-white/10 flex items-center justify-center">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt=""
                      className="w-full h-full object-contain"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  ) : (
                    <span className="text-white/40 text-lg font-bold">
                      {(spaceName || "?").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm truncate">{spaceName || "your space"}</p>
                  {website && <p className="text-evolve-lavender-indigo text-xs truncate">{website.replace(/^https?:\/\//, "")}</p>}
                </div>
              </div>
            )}

            <button
              onClick={() => setPhase("fetch")}
              className="text-evolve-lavender-indigo text-xs font-semibold self-end -mb-1"
            >
              change link
            </button>

            {(socialLinks.length > 0 || awards.length > 0 || seedEvents.length > 0 || seedTestimonials.length > 0 || seedPosts.length > 0) && (
              <div className="rounded-2xl border border-white/10 p-4 flex flex-col gap-3" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
                <p className="text-white/50 text-xs font-semibold">found on your site — remove anything that's not right. everything else stays fully editable on your space later.</p>
                <RemovableList
                  label="social links"
                  items={socialLinks}
                  onRemove={(i) => setSocialLinks((l) => l.filter((_, idx) => idx !== i))}
                  renderItem={(l) => (
                    <>
                      <span className="font-semibold text-white capitalize">{l.platform}</span> · {l.url}
                    </>
                  )}
                />
                <RemovableList
                  label="awards & accreditations"
                  items={awards}
                  onRemove={(i) => setAwards((a) => a.filter((_, idx) => idx !== i))}
                  renderItem={(a) => (
                    <>
                      <span className="font-semibold text-white">{a.title}</span>
                      {a.issuer ? ` · ${a.issuer}` : ""}
                    </>
                  )}
                />
                <RemovableList
                  label="calendar events found"
                  items={seedEvents}
                  onRemove={(i) => setSeedEvents((e) => e.filter((_, idx) => idx !== i))}
                  renderItem={(e) => (
                    <>
                      <span className="font-semibold text-white">{e.title}</span> · {e.date}
                      {e.meta ? ` · ${e.meta}` : ""}
                    </>
                  )}
                />
                <RemovableList
                  label="testimonials found"
                  items={seedTestimonials}
                  onRemove={(i) => setSeedTestimonials((t) => t.filter((_, idx) => idx !== i))}
                  renderItem={(t) => (
                    <>
                      "{t.quote}" — <span className="font-semibold text-white">{t.name}</span>
                      {t.role ? `, ${t.role}` : ""}
                    </>
                  )}
                />
                <RemovableList
                  label="news & posts found"
                  items={seedPosts}
                  onRemove={(i) => setSeedPosts((p) => p.filter((_, idx) => idx !== i))}
                  renderItem={(p) => (
                    <>
                      <span className="font-semibold text-white">{p.title}</span>
                      {p.description ? ` · ${p.description}` : ""}
                    </>
                  )}
                />
              </div>
            )}

            <Field label="institute name">
              <input
                value={spaceName}
                onChange={(e) => setSpaceName(e.target.value)}
                placeholder="e.g. National Institute of Design"
                className={`${inputCls} ${errCls(touched && !spaceName.trim())}`}
                style={inputStyle}
              />
            </Field>

            <Field label="website" optional>
              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://"
                className={`${inputCls} border-white/15`}
                style={inputStyle}
              />
            </Field>

            <Field label="short bio" optional>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="a couple lines about the institute"
                className={`${inputCls} border-white/15 resize-y`}
                style={inputStyle}
              />
            </Field>

            <div className="flex gap-3">
              <Field label="city / campus location" half>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Ahmedabad, Mumbai"
                  className={`${inputCls} ${errCls(touched && !location.trim())}`}
                  style={inputStyle}
                />
              </Field>
              <Field label="year established" optional half>
                <input
                  value={yearFounded}
                  onChange={(e) => setYearFounded(e.target.value)}
                  placeholder="e.g. 1961"
                  className={`${inputCls} border-white/15`}
                  style={inputStyle}
                />
              </Field>
            </div>

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

            <Field label="programme details" optional>
              <textarea
                value={programmeDetails}
                onChange={(e) => setProgrammeDetails(e.target.value)}
                rows={3}
                placeholder="e.g. UG & PG programmes in Industrial Design, Communication Design..."
                className={`${inputCls} border-white/15 resize-y`}
                style={inputStyle}
              />
            </Field>
          </div>
        )}

        {error && <p className="text-evolve-red text-sm">{error}</p>}

        {phase === "fields" && (
          <div className="w-full flex gap-3 mt-2">
            <button
              onClick={onBack}
              disabled={submitting}
              className="flex-1 border border-white/20 text-white font-semibold text-sm rounded-2xl py-4 disabled:opacity-30 active:opacity-80"
            >
              back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-[2] bg-evolve-yellow text-evolve-black font-bold text-base rounded-2xl py-4 disabled:opacity-50 transition-opacity active:scale-[0.98]"
            >
              {submitting ? "setting up your space…" : "create my space →"}
            </button>
          </div>
        )}

        {phase === "fetch" && (
          <button
            onClick={onBack}
            className="text-white/40 text-sm font-semibold mt-1"
          >
            ← back
          </button>
        )}
      </div>
    </div>
  );
}
