import { useState } from "react";
import GrowthMascot from "../../components/GrowthMascot";
import { toTitleCase } from "./questions";

function TagCloud({ label, values, onRemove, onAdd }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  return (
    <div>
      <p className="text-white/30 text-[10px] font-bold uppercase tracking-wide mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {values.map((v, i) => (
          <span
            key={`${v}-${i}`}
            className="inline-flex items-center gap-1.5 rounded-full pl-3 pr-1.5 py-1.5 text-xs font-semibold bg-evolve-lavender-indigo/15 text-evolve-lavender-indigo"
          >
            {v}
            <button
              onClick={() => onRemove(i)}
              className="w-4 h-4 rounded-full bg-evolve-lavender-indigo/25 flex items-center justify-center text-[10px] leading-none"
              aria-label={`remove ${v}`}
            >
              ×
            </button>
          </span>
        ))}
        {adding ? (
          <span className="inline-flex items-center gap-1">
            <input
              autoFocus
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && draft.trim()) { onAdd(draft.trim()); setDraft(""); setAdding(false); }
                if (e.key === "Escape") { setAdding(false); setDraft(""); }
              }}
              className="text-xs rounded-full px-3 py-1.5 bg-white/10 text-white outline-none border border-white/20 w-32"
              placeholder="add…"
            />
          </span>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-7 h-7 rounded-full border border-dashed border-white/20 text-white/40 flex items-center justify-center text-sm"
            aria-label={`add to ${label}`}
          >
            +
          </button>
        )}
      </div>
    </div>
  );
}

function TextField({ label, value, onChange, placeholder }) {
  return (
    <div>
      <p className="text-white/30 text-[10px] font-bold uppercase tracking-wide mb-1.5">{label}</p>
      <input
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none border border-white/10 focus:border-evolve-yellow/50 transition-colors"
        style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
      />
    </div>
  );
}

export default function ReviewStep({ profile, onBack, onConfirm, submitting }) {
  const [p, setP] = useState(profile);

  function set(key, value) { setP(prev => ({ ...prev, [key]: value })); }
  function removeFromArray(key, i) { setP(prev => ({ ...prev, [key]: prev[key].filter((_, idx) => idx !== i) })); }
  function addToArray(key, value) { setP(prev => ({ ...prev, [key]: [...(prev[key] || []), value] })); }

  return (
    <div className="min-h-screen px-6 py-12 md:py-16" style={{ backgroundColor: "#161618" }}>
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col items-center text-center gap-3">
          <GrowthMascot progress={70} size={64} />
          <h1 className="text-white font-bold text-2xl md:text-3xl">your profile snapshot</h1>
          <p className="text-white/50 text-sm max-w-sm">here's what we picked up — edit anything before we build your space.</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col gap-4">
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-wide">the basics</p>
          <TextField label="name" value={p.name} onChange={v => set("name", v)} />
          <TextField label="country" value={p.country} onChange={v => set("country", v)} />
          <TextField label="current role" value={p.persona} onChange={v => set("persona", v)} />
          <TextField label="level" value={p.level ? toTitleCase(p.level) : ""} onChange={v => set("level", v.toLowerCase())} />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col gap-5">
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-wide">your design journey</p>
          <TextField label="why design" value={p.motivation} onChange={v => set("motivation", v)} />
          <TextField label="learning method" value={p.learning_method} onChange={v => set("learning_method", v)} />
          <TagCloud
            label="learning modes"
            values={p.learning_modes || []}
            onRemove={i => removeFromArray("learning_modes", i)}
            onAdd={v => addToArray("learning_modes", v)}
          />
          <TagCloud
            label="discipline"
            values={p.discipline || []}
            onRemove={i => removeFromArray("discipline", i)}
            onAdd={v => addToArray("discipline", v)}
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col gap-5">
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-wide">future</p>
          <TagCloud
            label="intent"
            values={p.intent || []}
            onRemove={i => removeFromArray("intent", i)}
            onAdd={v => addToArray("intent", v)}
          />
          <TextField label="kind of work" value={p.work_type} onChange={v => set("work_type", v)} />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onBack}
            disabled={submitting}
            className="border border-white/20 text-white font-semibold text-sm rounded-2xl px-6 py-4 disabled:opacity-30"
          >
            back
          </button>
          <button
            onClick={() => onConfirm(p)}
            disabled={submitting}
            className="flex-1 bg-evolve-yellow text-evolve-black font-bold text-base rounded-2xl py-4 disabled:opacity-50 transition-opacity active:scale-[0.98]"
          >
            {submitting ? "setting up your space…" : "looks good, let's go →"}
          </button>
        </div>
      </div>
    </div>
  );
}
