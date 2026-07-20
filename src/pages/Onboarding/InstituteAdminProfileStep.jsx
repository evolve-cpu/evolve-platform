import { useState } from "react";

export const INSTITUTION_ROLES = [
  { value: "founder", label: "founder / director" },
  { value: "principal", label: "principal / dean" },
  { value: "hod", label: "head of department" },
  { value: "faculty", label: "faculty / studio instructor" },
  { value: "placement", label: "training & placement officer" },
  { value: "partnerships", label: "industry partnerships lead" },
  { value: "coordinator", label: "program coordinator" },
  { value: "registrar", label: "registrar / admin office" },
  { value: "other", label: "something else" }
];

function initialsOf(first, last) {
  return `${(first[0] || "").toUpperCase()}${(last[0] || "").toUpperCase()}`;
}

/**
 * Institute flow · step 1 — the admin's own identity within this org.
 * Deliberately separate from the individual persona chat: an institute admin
 * doesn't need "are you a high schooler or career shifter", they need their
 * name, their title, and (optionally) something to link their real identity to.
 */
export default function InstituteAdminProfileStep({ initial, onBack, onContinue }) {
  const [firstName, setFirstName] = useState(initial?.firstName || "");
  const [lastName, setLastName] = useState(initial?.lastName || "");
  const [role, setRole] = useState(initial?.role || "");
  const [portfolio, setPortfolio] = useState(initial?.portfolio || "");
  const [touched, setTouched] = useState(false);

  const canContinue = firstName.trim().length > 0 && lastName.trim().length > 0 && role;
  const initials = initialsOf(firstName, lastName);
  const roleLabel = INSTITUTION_ROLES.find((r) => r.value === role)?.label || "";

  function handleContinue() {
    setTouched(true);
    if (!canContinue) return;
    onContinue({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role,
      roleLabel,
      portfolio: portfolio.trim()
    });
  }

  const inputCls =
    "w-full border rounded-2xl px-5 py-4 text-white placeholder-white/30 text-base outline-none focus:border-evolve-lavender-indigo/70 transition-colors";
  const inputStyle = { backgroundColor: "rgba(255,255,255,0.06)" };
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
          🏫 institute space · step 1 of 2
        </p>
        <h1 className="text-white font-bold text-3xl md:text-4xl leading-tight">
          tell us about yourself.
        </h1>
        <p className="text-white/50 text-sm max-w-sm">
          you'll be the admin of this space — this helps us verify it and shows on your profile too.
        </p>

        <div className="flex items-center gap-3 w-full mt-2">
          <div
            className={`min-w-[52px] rounded-full flex items-center justify-center font-bold text-lg transition-colors ${
              initials ? "text-white" : "text-white/30 border border-dashed border-white/20"
            }`}
            style={{
              width: 52,
              height: 52,
              background: initials
                ? "linear-gradient(135deg, rgba(163,91,251,1), rgba(194,122,255,1))"
                : "rgba(255,255,255,0.05)"
            }}
          >
            {initials}
          </div>
          <p className="text-white/30 text-xs text-left leading-snug">
            this becomes your profile picture — you can add a real photo later.
          </p>
        </div>

        <div className="w-full flex flex-col gap-4 mt-2 text-left">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-white/40 text-xs font-semibold uppercase tracking-wide mb-2 block">
                first name
              </label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Priya"
                className={`${inputCls} ${touched && !firstName.trim() ? "border-evolve-red" : "border-white/15"}`}
                style={inputStyle}
              />
            </div>
            <div className="flex-1">
              <label className="text-white/40 text-xs font-semibold uppercase tracking-wide mb-2 block">
                last name
              </label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Sharma"
                className={`${inputCls} ${touched && !lastName.trim() ? "border-evolve-red" : "border-white/15"}`}
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label className="text-white/40 text-xs font-semibold uppercase tracking-wide mb-2 block">
              your role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={`${inputCls} ${touched && !role ? "border-evolve-red" : "border-white/15"} appearance-none`}
              style={inputStyle}
            >
              <option value="" disabled style={optionStyle}>
                select your role
              </option>
              {INSTITUTION_ROLES.map((r) => (
                <option key={r.value} value={r.value} style={optionStyle}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-white/40 text-xs font-semibold uppercase tracking-wide mb-2 block">
              linkedin or portfolio url{" "}
              <span className="normal-case font-normal text-white/25">(optional)</span>
            </label>
            <input
              value={portfolio}
              onChange={(e) => setPortfolio(e.target.value)}
              placeholder="https://linkedin.com/in/yourname"
              className={inputCls}
              style={inputStyle}
            />
          </div>
        </div>

        <div className="w-full flex gap-3 mt-2">
          <button
            onClick={onBack}
            className="flex-1 border border-white/20 text-white font-semibold text-sm rounded-2xl py-4 active:opacity-80"
          >
            back
          </button>
          <button
            onClick={handleContinue}
            className="flex-[2] bg-evolve-yellow text-evolve-black font-bold text-base rounded-2xl py-4 transition-opacity active:scale-[0.98]"
          >
            continue →
          </button>
        </div>
      </div>
    </div>
  );
}
