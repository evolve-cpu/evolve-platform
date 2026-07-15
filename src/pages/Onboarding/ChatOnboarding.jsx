import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QUESTIONS, PHASES, PHASE_LABEL } from "./questions";
import GrowthMascot from "../../components/GrowthMascot";

let msgId = 0;

function resolveChips(q, p) {
  return typeof q.chips === "function" ? q.chips(p) : q.chips || [];
}
function resolveOptions(q, p) {
  return typeof q.options === "function" ? q.options(p) : q.options || [];
}

function PhaseBar({ qIndex }) {
  return (
    <div className="flex items-center gap-2">
      {PHASES.map((phase) => {
        const qs = QUESTIONS.filter((q) => q.phase === phase);
        const total = qs.length;
        const doneCount = qs.filter(
          (q) => QUESTIONS.indexOf(q) < qIndex
        ).length;
        const isCurrent =
          qIndex < QUESTIONS.length && QUESTIONS[qIndex].phase === phase;
        const pct = total ? Math.round((doneCount / total) * 100) : 0;
        const done = total > 0 && doneCount === total;
        return (
          <div
            key={phase}
            className="flex-1 flex flex-col gap-1.5 items-center"
          >
            <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${pct}%`,
                  background: done ? "rgba(194,253,92,1)" : "rgba(163,91,251,1)"
                }}
              />
            </div>
            <span
              className="text-[9px] font-semibold uppercase tracking-wide"
              style={{
                color: done
                  ? "rgba(194,253,92,1)"
                  : isCurrent
                    ? "rgba(163,91,251,1)"
                    : "rgba(255,255,255,0.3)"
              }}
            >
              {PHASE_LABEL[phase]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function LiveProfileCard({ profile }) {
  const rows = [
    ["👤", "name", profile.name],
    ["🌍", "country", profile.country],
    ["🧭", "persona", profile.persona],
    ["📊", "level", profile.level],
    ["💭", "why design", profile.motivation],
    ["📚", "learning method", profile.learning_method]
  ];
  const tagRows = [
    ["🧩", "learning modes", profile.learning_modes],
    ["🎨", "discipline", profile.discipline],
    ["🎯", "intent", profile.intent]
  ];
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col gap-1 sticky top-24 max-h-[calc(100vh-140px)] overflow-y-auto">
      <div className="flex items-center gap-3 pb-4 mb-3 border-b border-white/10">
        <GrowthMascot progress={5} size={40} />
        <div>
          <p className="text-white font-bold text-sm">
            {profile.name || "your profile"}
          </p>
          <p className="text-white/30 text-[11px]">
            builds in real time as you answer
          </p>
        </div>
      </div>
      {rows.map(([emoji, label, value]) => (
        <div
          key={label}
          className="flex items-start gap-2.5 py-2 border-b border-white/5 last:border-b-0"
        >
          <span className="text-sm w-5 text-center">{emoji}</span>
          <div className="min-w-0">
            <p className="text-white/30 text-[9px] font-bold uppercase tracking-wide mb-0.5">
              {label}
            </p>
            <p
              className={`text-xs leading-snug ${value ? "text-white" : "text-white/25 italic"}`}
            >
              {value || "—"}
            </p>
          </div>
        </div>
      ))}
      {tagRows.map(([emoji, label, arr]) => (
        <div
          key={label}
          className="flex items-start gap-2.5 py-2 border-b border-white/5 last:border-b-0"
        >
          <span className="text-sm w-5 text-center">{emoji}</span>
          <div className="min-w-0 flex-1">
            <p className="text-white/30 text-[9px] font-bold uppercase tracking-wide mb-1">
              {label}
            </p>
            {arr && arr.length ? (
              <div className="flex flex-wrap gap-1">
                {arr.map((v) => (
                  <span
                    key={v}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-evolve-lavender-indigo/15 text-evolve-lavender-indigo"
                  >
                    {v}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-white/25 text-xs italic">—</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ChatOnboarding({ initialProfile, onComplete }) {
  const [profile, setProfile] = useState(initialProfile);
  const [qIndex, setQIndex] = useState(0);
  const [messages, setMessages] = useState([]);
  const [chips, setChips] = useState([]);
  const [optionCards, setOptionCards] = useState(null);
  const [followUpUsed, setFollowUpUsed] = useState({});
  const [inputValue, setInputValue] = useState("");
  const [busy, setBusy] = useState(false);
  const logRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const q = QUESTIONS[0];
    setChips(resolveChips(q, initialProfile));
    aiSay(q.ask(initialProfile), 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages, optionCards]);

  function pushMessage(role, text) {
    setMessages((prev) => [...prev, { id: ++msgId, role, text }]);
  }

  function aiSay(text, delayBase = 400) {
    return new Promise((resolve) => {
      const typingId = ++msgId;
      setBusy(true);
      setMessages((prev) => [
        ...prev,
        { id: typingId, role: "ai", typing: true }
      ]);
      const delay = Math.min(1400, delayBase + text.length * 6);
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === typingId ? { id: typingId, role: "ai", text } : m
          )
        );
        setBusy(false);
        resolve();
      }, delay);
    });
  }

  async function handlePick(fillText) {
    setOptionCards(null);
    pushMessage("user", fillText);
    await processAnswer(fillText);
  }

  async function handleSend() {
    const text = inputValue.trim();
    if (!text || busy) return;
    pushMessage("user", text);
    setInputValue("");
    await processAnswer(text);
  }

  async function processAnswer(text) {
    const q = QUESTIONS[qIndex];
    const vague = q.isVague ? q.isVague(text) : false;

    if (vague && !followUpUsed[q.id]) {
      setFollowUpUsed((prev) => ({ ...prev, [q.id]: true }));
      const opts = resolveOptions(q, profile);
      if (opts.length) {
        await aiSay(
          "no worries — let's try that a little differently. tap whichever fits best, or just type it out:",
          300
        );
        setOptionCards(opts);
        return;
      } else if (q.followUp) {
        await aiSay(q.followUp(), 300);
        return;
      }
    }

    const parsedFields = q.parse(text, profile);
    const nextProfile = { ...profile };
    Object.entries(parsedFields).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        if (v.length) nextProfile[k] = v;
      } else if (v) nextProfile[k] = v;
    });
    setProfile(nextProfile);

    const nextIndex = qIndex + 1;
    setQIndex(nextIndex);
    setOptionCards(null);

    if (nextIndex < QUESTIONS.length) {
      const ackText = q.ack(nextProfile, parsedFields);
      const nextQ = QUESTIONS[nextIndex];
      const nextAsk = nextQ.ask(nextProfile);
      await aiSay(`${ackText}\n\n${nextAsk}`, 300);
      setChips(resolveChips(nextQ, nextProfile));
    } else {
      await aiSay(
        `${q.ack(nextProfile, parsedFields)}\n\nperfect — that's everything i need. let's take a look at your profile. 🌱`,
        300
      );
      setTimeout(() => onComplete(nextProfile), 900);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const progress = Math.round((qIndex / QUESTIONS.length) * 100);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#161618" }}
    >
      <div className="flex flex-col items-center text-center gap-2 px-5 pt-10 pb-4 md:pt-12">
        <h1 className="text-white font-bold text-2xl md:text-3xl">
          let's build your profile
        </h1>
        <p className="text-white/50 text-sm max-w-sm">
          the more you share, the more this feels like your space.
        </p>
      </div>

      <div className="flex-1 flex flex-col min-h-0 md:items-center md:px-10 md:pb-10">
        {/* chat column */}
        <div className="flex-1 flex flex-col min-h-0 w-full md:max-w-2xl md:rounded-3xl md:border md:border-white/10 md:bg-white/[0.02] overflow-hidden">
          <div className="px-5 pt-6 pb-3 md:px-7 flex items-center justify-center gap-3">
            {/* <GrowthMascot progress={progress} size={32} /> */}
            <div className="flex-1">
              <PhaseBar qIndex={qIndex} />
            </div>
          </div>

          <div
            ref={logRef}
            className="flex-1 min-h-0 overflow-y-auto px-5 md:px-7 py-3 flex flex-col gap-3"
          >
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="max-w-[80%] md:max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
                  style={
                    m.role === "user"
                      ? {
                          background: "rgba(163,91,251,1)",
                          color: "#fff",
                          borderBottomRightRadius: 4
                        }
                      : {
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "#eae8e2",
                          borderBottomLeftRadius: 4
                        }
                  }
                >
                  {m.typing ? (
                    <span className="flex gap-1 items-center py-1">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-white/40"
                          animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.15
                          }}
                        />
                      ))}
                    </span>
                  ) : (
                    m.text
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="border-t border-white/10 px-5 md:px-7 py-4 flex flex-col gap-3">
            <AnimatePresence mode="wait">
              {optionCards ? (
                <motion.div
                  key="cards"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col gap-2"
                >
                  {optionCards.map((o) => (
                    <button
                      key={o.title}
                      onClick={() => handlePick(o.fill)}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] hover:border-evolve-lavender-indigo/60 px-4 py-3 text-left transition-colors"
                    >
                      <span className="text-xl">{o.emoji}</span>
                      <span>
                        <span className="block text-white text-sm font-bold">
                          {o.title}
                        </span>
                        {o.sub && (
                          <span className="block text-white/40 text-xs">
                            {o.sub}
                          </span>
                        )}
                      </span>
                    </button>
                  ))}
                </motion.div>
              ) : (
                chips.length > 0 && (
                  <motion.div
                    key="chips"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-2 overflow-x-auto pb-1"
                  >
                    {chips.map((c) => (
                      <button
                        key={c}
                        onClick={() =>
                          setInputValue((v) => (v ? v.trim() + ", " + c : c))
                        }
                        className="flex-shrink-0 text-xs font-semibold px-3.5 py-2 rounded-full border border-white/10 bg-white/[0.04] text-white/60 hover:border-evolve-lavender-indigo/60 hover:text-evolve-lavender-indigo transition-colors whitespace-nowrap"
                      >
                        {c}
                      </button>
                    ))}
                  </motion.div>
                )
              )}
            </AnimatePresence>

            <div className="flex items-end gap-2">
              <textarea
                rows={1}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="type your answer…"
                className="flex-1 resize-none max-h-24 min-h-[46px] rounded-2xl px-4 py-3 text-white text-sm placeholder-white/30 outline-none border border-white/10 focus:border-evolve-yellow/50 transition-colors"
                style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || busy}
                className="w-11 h-11 rounded-full bg-evolve-yellow text-evolve-black flex items-center justify-center flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M3.75 9h10.5M9.75 4.5 14.25 9l-4.5 4.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
