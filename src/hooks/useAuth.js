// useAuth now lives in src/context/AuthContext.jsx as a shared AuthProvider —
// every component reads/writes the SAME auth state instead of each getting
// its own independent Supabase listener (that split caused stale-state bugs,
// e.g. OnboardingGate not seeing onboarding_completed flip to true right
// after Onboarding.jsx's own refreshUser() call). Re-exported here so
// existing `import { useAuth } from "../hooks/useAuth"` call sites are
// unaffected.
export { useAuth } from "../context/AuthContext";
