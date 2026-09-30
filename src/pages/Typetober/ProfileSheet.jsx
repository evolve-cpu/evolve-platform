import { useState } from "react";
import { SheetShell } from "./Sheets";
import { CERT_TIERS, LETTERS } from "./lib/constants";
import { renderCertificateCard } from "./lib/shareCard";

const CERT_WHY = {
  bronze: "10 submissions",
  silver: "18 submissions",
  gold: "26 submissions. In the prize draw."
};

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function CertCard({ tier, unlocked, name }) {
  const [busy, setBusy] = useState(false);
  if (!unlocked) {
    return (
      <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-white/40">
        <div className="text-[11px] font-bold tracking-wide">Typetober · {tier.label}</div>
        <div className="text-[28px] font-extrabold mt-2 text-white/50">Locked</div>
        <div className="text-[13px] mt-1">Reach {tier.need} submissions to unlock. Every illustration counts, even repeat letters.</div>
      </div>
    );
  }
  return (
    <div
      className="rounded-2xl p-5 text-black relative overflow-hidden"
      style={{ background: tier.color, boxShadow: `5px 5px 0 rgba(0,0,0,.35)` }}
    >
      <div className="text-[11px] font-bold tracking-wide opacity-70">Typetober · Evolve</div>
      <div className="text-[34px] font-extrabold leading-none mt-2">{tier.label}</div>
      <div className="text-[14px] font-bold mt-2">Awarded to @{name}</div>
      <div className="text-[13px] opacity-75">{CERT_WHY[tier.key]}</div>
      <button
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            const blob = await renderCertificateCard({ tier: tier.key, tierColor: tier.color, name, why: CERT_WHY[tier.key] });
            downloadBlob(blob, `typetober-${tier.key}-certificate.png`);
          } finally {
            setBusy(false);
          }
        }}
        className="mt-4 bg-black text-white font-extrabold text-[13px] px-4 py-2.5 rounded-xl"
      >
        {busy ? "Making…" : "Download certificate"}
      </button>
    </div>
  );
}

export default function ProfileSheet({
  open,
  onClose,
  user,
  stats,
  streak,
  mySubmissions,
  currentDay,
  onGoToLetter,
  onViewLetter,
  onLogout
}) {
  const [tab, setTab] = useState("subs");
  const pct = Math.min(100, (stats.total / 26) * 100);

  return (
    <SheetShell open={open} onClose={onClose}>
      <div className="flex items-center gap-4 mr-8">
        <img
          src={user?.avatar_url || `https://api.dicebear.com/7.x/thumbs/svg?seed=${user?.id}`}
          alt={user?.name}
          className="w-16 h-16 rounded-full border-2 border-evolve-yellow"
        />
        <div>
          <h2 className="text-[26px] font-extrabold leading-none">@{user?.username || user?.name}</h2>
          <span className="text-white/50 text-[13px]">{user?.email}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-5">
        <div className="bg-white/5 rounded-2xl p-4">
          <div className="text-[28px] font-extrabold leading-none text-evolve-inchworm">
            🔥 {streak?.current || 0}
          </div>
          <div className="text-white/50 text-[13px] mt-1.5">
            Day streak
            {streak?.current > 0 && !streak?.today ? " · submit today to keep it" : ""}
          </div>
        </div>
        <div className="bg-white/5 rounded-2xl p-4">
          <div className="text-[28px] font-extrabold leading-none">{streak?.best || 0}</div>
          <div className="text-white/50 text-[13px] mt-1.5">Best streak</div>
        </div>
      </div>

      {stats.total === 0 ? (
        <div className="mt-5 bg-white/5 rounded-2xl p-4 text-white/50 text-[14px]">
          Nothing here yet — submit today's letter on the board to get started.
        </div>
      ) : (
        <>
          <div className="mt-6">
            <div className="flex justify-between text-[14px] text-white/60">
              <span>
                <b className="text-white">{stats.total}</b> {stats.total === 1 ? "submission" : "submissions"}
              </span>
              <span>
                <b className="text-white">{stats.letters}</b> of 26 letters
              </span>
            </div>
            <div className="relative h-2.5 rounded-full bg-white/10 mt-6 mb-8">
              <div className="absolute inset-y-0 left-0 rounded-full bg-evolve-pink transition-all" style={{ width: `${pct}%` }} />
              {CERT_TIERS.map((t) => (
                <div
                  key={t.key}
                  className="absolute -top-[11px] w-8 h-8 rounded-full grid place-items-center text-[12px] font-extrabold border-2 border-black -ml-4"
                  style={{
                    left: `${(t.need / 26) * 100}%`,
                    background: stats[t.key] ? t.color : "rgba(255,255,255,.08)",
                    color: stats[t.key] ? "#000" : "rgba(255,255,255,.4)"
                  }}
                >
                  {t.need}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-1 bg-white/5 rounded-full p-1 mt-3">
            {[
              ["subs", "Submissions"],
              ["certs", "Certificates"]
            ].map(([k, label]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`flex-1 py-2 rounded-full font-extrabold text-[14px] ${tab === k ? "bg-evolve-yellow text-black" : "text-white/60"}`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "subs" ? (
            <>
              <div className="grid grid-cols-6 gap-1.5 mt-4">
                {LETTERS.map((ch, i) => {
                  const subs = mySubmissions.get(i) || [];
                  const paid = subs.filter((r) => r.status === "success");
                  const row = paid[paid.length - 1];
                  const unlocked = i < currentDay;
                  if (row) {
                    return (
                      <button key={ch} onClick={() => onViewLetter(i)} className="relative aspect-square rounded-lg overflow-hidden">
                        {row.imageUrl && <img src={row.imageUrl} alt={ch} className="w-full h-full object-cover" />}
                        {paid.length > 1 && (
                          <span className="absolute right-1 bottom-1 bg-evolve-yellow text-black text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                            ×{paid.length}
                          </span>
                        )}
                      </button>
                    );
                  }
                  if (subs.some((r) => r.status === "pending")) {
                    return (
                      <div key={ch} className="aspect-square rounded-lg bg-white/10 grid place-items-center text-white/50 font-extrabold text-[13px]">
                        {ch}·⏳
                      </div>
                    );
                  }
                  if (unlocked) {
                    return (
                      <button
                        key={ch}
                        onClick={() => onGoToLetter(i)}
                        className="aspect-square rounded-lg border border-dashed border-white/25 grid place-items-center text-white/30 font-extrabold text-[18px]"
                      >
                        {ch}
                      </button>
                    );
                  }
                  return (
                    <div key={ch} className="aspect-square rounded-lg bg-white/[0.03] grid place-items-center text-white/15 font-extrabold text-[18px]">
                      {ch}
                    </div>
                  );
                })}
              </div>
              <p className="text-white/40 text-[13px] mt-3">Tap a dashed letter to go submit it.</p>
            </>
          ) : (
            <div className="flex flex-col gap-3 mt-4">
              {CERT_TIERS.map((t) => (
                <CertCard key={t.key} tier={t} unlocked={stats[t.key]} name={user?.username || user?.name} />
              ))}
            </div>
          )}
        </>
      )}

      <button onClick={onLogout} className="mt-6 text-white/40 text-[13px] font-bold underline">
        Sign out
      </button>
    </SheetShell>
  );
}
