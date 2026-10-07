import { useState } from "react";
import { supabase } from "../../supabaseClient";

/* ── localhost-only DEMO bar (the reference's .at-demo panel) ───────────────
   Only mounted when import.meta.env.DEV — `vite build` strips it, so it can
   never reach a deployment. The five scenarios really rewrite the signed-in
   tester's own trial / plan columns (via the dev middleware in
   vite.config.ts), so the database-side checks — paid events, recordings,
   public profile — behave exactly as they will live. Student / Pro and
   "spent this month" only change what this browser shows. ─────────────── */

const SCENARIOS = [
  ["trial", "Trial active"],
  ["popup", "Trial ended pop-up"],
  ["payg", "Pay as you go"],
  ["subM", "Monthly plan"],
  ["subA", "Annual plan"]
];

function currentScenario(access) {
  if (access.phase === "trial") return "trial";
  if (access.mode === "sub") return access.plan === "annual" ? "subA" : "subM";
  return "payg";
}

export default function DevMembershipPanel({
  user,
  access,
  role,
  setRole,
  spent,
  setSpent,
  refreshUser,
  openPlans,
  showWelcome,
  showVerified
}) {
  const [busy, setBusy] = useState(false);
  const [min, setMin] = useState(false);
  const [err, setErr] = useState("");
  const scn = currentScenario(access);

  async function run(scenario) {
    setBusy(true);
    setErr("");
    try {
      const {
        data: { session }
      } = await supabase.auth.getSession();
      const res = await fetch("/api/razorpay-create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: "membership", action: "dev_scenario", scenario, token: session?.access_token })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      await refreshUser?.();
      if (scenario === "popup") {
        try {
          localStorage.removeItem(`evolve_trial_ended_seen_${user.id}`);
        } catch {
          /* ignore */
        }
        openPlans(1);
      }
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`at-demo ${min ? "min" : ""}`}>
      <b>
        DEMO
        <button type="button" style={{ padding: "1px 8px" }} onClick={() => setMin((v) => !v)}>
          {min ? "+" : "–"}
        </button>
      </b>
      {SCENARIOS.map(([key, label]) => (
        <button
          key={key}
          type="button"
          disabled={busy}
          className={(key === "popup" ? false : scn === key) ? "on" : ""}
          onClick={() => run(key)}
        >
          {label}
        </button>
      ))}
      <button type="button" className={role === "student" ? "on" : ""} onClick={() => setRole("student")}>
        Student
      </button>
      <button type="button" className={role === "professional" ? "on" : ""} onClick={() => setRole("professional")}>
        Pro
      </button>
      <select
        value={spent ?? ""}
        onChange={(e) => setSpent(e.target.value === "" ? null : Number(e.target.value))}
        aria-label="Spent this month"
      >
        <option value="">Spent: real</option>
        <option value="0">Spent ₹0</option>
        <option value="150">Spent ₹150</option>
        <option value="650">Spent ₹650</option>
        <option value="2400">Spent ₹2,400</option>
      </select>
      <button type="button" onClick={showWelcome}>
        VIP welcome
      </button>
      <button type="button" onClick={showVerified}>
        Verified sheet
      </button>
      {err && <span style={{ color: "#ff355b" }}>{err}</span>}
    </div>
  );
}
