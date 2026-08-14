import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../hooks/useAuth";
import { slugify } from "../lib/slug";
import { QUESTIONS } from "../pages/Onboarding/questions";

/* ── shared bits ──────────────────────────────────────────────────────── */
function BackHeader({ title, onBack }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm font-semibold w-fit transition-colors"
    >
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {title}
    </button>
  );
}

export function UserIcon({ className }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4.5 20c1.5-3.8 4.8-6 7.5-6s6 2.2 7.5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function InvoiceIcon({ className }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M6 3h9l4 4v13a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 10h6M9 14h6M9 18h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function LogOutIcon({ className }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M9 21H5a1 1 0 01-1-1V4a1 1 0 011-1h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TrashIcon({ className }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13a1 1 0 001 1h8a1 1 0 001-1l1-13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// how each onboarding answer should be edited here — mirrors the shape each
// question's own parse()/chips already use in src/pages/Onboarding/questions.js.
// Anything not listed falls back to a plain text input (country, school_name,
// motivation, work_type — all free text in practice even though a couple of
// them also carry suggestion chips there).
const CHIP_SINGLE = new Set(["persona", "standard", "learning_method", "level"]);
const CHIP_MULTI_ARRAY = new Set(["learning_modes", "discipline", "intent"]);
const CHIP_MULTI_STRING = new Set(["stream"]); // stored as a joined string, edited as chips

function ChipField({ options, value, onChange, multi }) {
  const selected = multi ? value || [] : value;
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = multi ? selected.includes(opt) : selected === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => {
              if (multi) {
                onChange(active ? selected.filter((v) => v !== opt) : [...selected, opt]);
              } else {
                onChange(opt);
              }
            }}
            className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-colors ${
              active
                ? "border-evolve-yellow/50 bg-evolve-yellow/[0.12] text-evolve-yellow"
                : "border-[#373737] text-white/50 hover:bg-[#232325] hover:border-white/20"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function fmtRupees(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

function fmtDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/* ── the 4-item menu (used as its own panel on mobile — desktop uses the
   floating dropdown in PublicProfile.jsx instead) ───────────────────────── */
export function AccountMenuList({ onSelect, onBack, onLogOut, onDeleteAccount }) {
  const items = [
    { key: "account", label: "My Account", Icon: UserIcon },
    { key: "invoice", label: "Invoice", Icon: InvoiceIcon },
    { key: "logout", label: "Log Out", Icon: LogOutIcon },
    { key: "delete", label: "Delete Account", Icon: TrashIcon, danger: true }
  ];
  return (
    <div className="flex flex-col gap-6">
      <BackHeader title="Back" onBack={onBack} />
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              if (item.key === "logout") return onLogOut();
              if (item.key === "delete") return onDeleteAccount();
              onSelect(item.key);
            }}
            className={`flex items-center justify-between rounded-2xl px-4 py-3.5 border border-[#373737] hover:bg-[#232325] transition-colors ${
              item.danger ? "text-red-400" : "text-white"
            }`}
          >
            <span className="flex items-center gap-3 font-semibold text-sm">
              <item.Icon className={item.danger ? "text-red-400" : "text-white/60"} />
              {item.label}
            </span>
            {!item.danger && (
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="text-white/30">
                <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── "My Account" — edit name/username, view (read-only) onboarding
   answers, disabled email ───────────────────────────────────────────────── */
export function MyAccountPanel({ onBack, onSaved }) {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  // fixed at mount — the questions already answered at onboarding, each
  // editable here in place. Doesn't re-derive as persona/etc. are edited so
  // the set of visible rows doesn't shift under the person mid-edit.
  const [answeredQuestions] = useState(() =>
    QUESTIONS.filter((q) => {
      if (q.id === "name") return false;
      if (q.condition && !q.condition(user || {})) return false;
      const val = user?.[q.id];
      return Array.isArray(val) ? val.length > 0 : !!val;
    })
  );

  const [onboardingDraft, setOnboardingDraft] = useState(() => {
    const draft = {};
    answeredQuestions.forEach((q) => {
      if (CHIP_MULTI_STRING.has(q.id)) {
        draft[q.id] = (user?.[q.id] || "").split(",").map((s) => s.trim()).filter(Boolean);
      } else {
        draft[q.id] = user?.[q.id];
      }
    });
    return draft;
  });

  // auto-suggest a username from the name — only once the person actually
  // edits the name field (not on initial mount, which would clobber their
  // existing username with a freshly-slugified one), and only until they
  // edit the username field themselves, so it never overrides a deliberate
  // choice either.
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (!usernameTouched) setUsername(slugify(name));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  function onboardingFieldChanged(q) {
    const draftVal = onboardingDraft[q.id];
    if (CHIP_MULTI_STRING.has(q.id)) {
      const original = (user?.[q.id] || "").split(",").map((s) => s.trim()).filter(Boolean);
      return draftVal.join(",") !== original.join(",");
    }
    if (Array.isArray(draftVal)) {
      const original = user?.[q.id] || [];
      return draftVal.join(",") !== original.join(",");
    }
    return draftVal !== (user?.[q.id] ?? draftVal);
  }

  const onboardingDirty = answeredQuestions.some(onboardingFieldChanged);
  const dirty = name !== (user?.name || "") || username !== (user?.username || "") || onboardingDirty;

  async function handleSave() {
    if (!name.trim()) {
      setUsernameError("");
      return;
    }
    setSaving(true);
    setUsernameError("");

    if (username !== (user?.username || "")) {
      if (!username.trim()) {
        setUsernameError("Username can't be empty.");
        setSaving(false);
        return;
      }
      const { data: taken } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .neq("id", user.id)
        .maybeSingle();
      if (taken) {
        setUsernameError("That username's already taken — try another.");
        setSaving(false);
        return;
      }
    }

    const usernameChanged = username !== (user?.username || "");
    const payload = { name: name.trim(), username };
    answeredQuestions.forEach((q) => {
      if (!onboardingFieldChanged(q)) return;
      payload[q.id] = CHIP_MULTI_STRING.has(q.id) ? onboardingDraft[q.id].join(", ") : onboardingDraft[q.id];
    });

    await supabase.from("profiles").update(payload).eq("id", user.id);
    await refreshUser();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    // the page this panel lives on is keyed off the username in the URL —
    // if it just changed, the caller needs to move to the new URL or the
    // page will 404 against the now-stale one.
    if (usernameChanged) onSaved?.(username);
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <BackHeader title="My Account" onBack={onBack} />

      <div className="flex flex-col gap-5">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-white/10 flex items-center justify-center text-white text-2xl font-bold">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            (user?.name || "?")[0].toUpperCase()
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-white/40 text-xs">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-sm text-white outline-none border border-[#373737] rounded-xl px-4 py-3 transition-colors focus:border-evolve-yellow/60"
            style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-white/40 text-xs">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsernameTouched(true);
              setUsername(slugify(e.target.value));
              setUsernameError("");
            }}
            className="w-full text-sm text-white outline-none border border-[#373737] rounded-xl px-4 py-3 transition-colors focus:border-evolve-yellow/60"
            style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
          />
          {usernameError && <p className="text-red-400 text-xs">{usernameError}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-white/40 text-xs">Email</label>
          <input
            type="email"
            value={user?.email || ""}
            disabled
            className="w-full text-sm text-white/40 outline-none border border-[#373737] rounded-xl px-4 py-3 cursor-not-allowed"
            style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
          />
        </div>

        {answeredQuestions.length > 0 && (
          <div className="border border-evolve-yellow/20 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setOnboardingOpen((v) => !v)}
              className="w-full flex items-center gap-2 px-4 py-3.5 text-left"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-evolve-yellow flex-shrink-0" />
              <span className="text-white text-sm font-bold flex-1">Onboarding Questions</span>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className={`text-evolve-yellow/70 transition-transform ${onboardingOpen ? "rotate-180" : ""}`}>
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {onboardingOpen && (
              <div className="flex flex-col px-4 pb-4">
                {answeredQuestions.map((q, i) => {
                  const draftVal = onboardingDraft[q.id];
                  const options = typeof q.chips === "function" ? q.chips(user || {}) : q.chips;
                  const isChipSingle = CHIP_SINGLE.has(q.id) && options?.length;
                  const isChipMulti = (CHIP_MULTI_ARRAY.has(q.id) || CHIP_MULTI_STRING.has(q.id)) && options?.length;
                  const label = q.cardLabel ? q.cardLabel[0].toUpperCase() + q.cardLabel.slice(1) : q.id;
                  return (
                    <div
                      key={q.id}
                      className={`flex flex-col gap-2 py-4 ${i > 0 ? "border-t border-evolve-yellow/10" : ""}`}
                    >
                      <label className="text-white/40 text-xs">{label}</label>
                      {isChipSingle || isChipMulti ? (
                        <ChipField
                          options={options}
                          value={draftVal}
                          multi={isChipMulti}
                          onChange={(next) => setOnboardingDraft((d) => ({ ...d, [q.id]: next }))}
                        />
                      ) : (
                        <input
                          type="text"
                          value={draftVal || ""}
                          onChange={(e) => setOnboardingDraft((d) => ({ ...d, [q.id]: e.target.value }))}
                          className="w-full text-sm text-white outline-none border border-[#373737] rounded-xl px-4 py-3 transition-colors focus:border-evolve-yellow/60"
                          style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving}
          className="self-start bg-evolve-yellow text-evolve-black font-bold text-sm rounded-2xl px-7 py-3.5 disabled:opacity-40 active:opacity-80 transition-opacity"
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

/* ── "Invoice" — payment/transaction history across mentorship + portfolio
   review, the only two paid programmes on the platform right now ──────────── */
export function InvoicePanel({ onBack }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [{ data: mentorship }, { data: portfolio }] = await Promise.all([
        supabase
          .from("mentorship_payments")
          .select("id, plan, amount, currency, status, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("portfolio_review_payments")
          .select("id, amount, currency, status, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
      ]);

      const merged = [
        ...(mentorship || []).map((r) => ({
          id: `m_${r.id}`,
          label: `Mentorship — ${r.plan}`,
          amount: r.amount / 100,
          currency: r.currency,
          status: r.status,
          date: r.created_at
        })),
        ...(portfolio || []).map((r) => ({
          id: `p_${r.id}`,
          label: "Portfolio Review",
          amount: r.amount,
          currency: r.currency,
          status: r.status,
          date: r.created_at
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      if (!cancelled) {
        setRows(merged);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  const STATUS_STYLE = {
    success: "text-evolve-inchworm",
    pending: "text-evolve-yellow",
    failed: "text-red-400",
    refunded: "text-white/40"
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <BackHeader title="Invoice" onBack={onBack} />
      <p className="text-white/40 text-sm -mt-3">Your payment history across every evolve programme.</p>

      {loading ? (
        <p className="text-white/40 text-sm">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-white/40 text-sm">No payments yet.</p>
      ) : (
        <div className="flex flex-col">
          {rows.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3 py-4 border-b border-[#373737]">
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold">{r.label}</p>
                <p className="text-white/40 text-xs mt-0.5">{fmtDate(r.date)}</p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <span className={`text-xs font-bold uppercase tracking-wide ${STATUS_STYLE[r.status] || "text-white/40"}`}>
                  {r.status}
                </span>
                <span className="text-white font-bold text-sm">{fmtRupees(r.amount)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
