import { useEffect, useRef, useState } from "react";
import { SheetShell } from "./Sheets";
import { supabase } from "../../supabaseClient";
import { LETTERS, accentFor } from "./lib/constants";
import {
  loadRazorpayScript,
  toSquareBlob,
  PRICE,
  formatPrice,
  defaultCurrency,
  guessLetterFromName,
  postOrder
} from "./lib/upload";

const MAX_IMAGES = 60;
const RECOGNISE_BATCH = 12; // matches RECOGNISE_MAX_IMAGES on the server
const UNMAPPED = "u";

export function BulkIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="#FFD007"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`flex-none ${className}`}
    >
      <rect x="3" y="7" width="14" height="14" rx="2.5" />
      <path d="M7 3h12a2 2 0 0 1 2 2v12" />
    </svg>
  );
}

async function sessionToken() {
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Your session expired. Sign in again.");
  return session.access_token;
}

/** Runs `fn` over `list` with at most `limit` in flight. */
async function pool(list, limit, fn) {
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, list.length) }, async () => {
    while (next < list.length) {
      const k = next++;
      await fn(list[k], k);
    }
  });
  await Promise.all(workers);
}

// Only one drag can be live at a time; this ends it (and removes its
// floating copy) whatever happens: release, cancel, blur, Escape, unmount.
let endActiveDrag = null;

/**
 * Pointer drag for a thumbnail: works for touch and mouse. Listens on the
 * window (not the small thumbnail), so a fast drag that leaves the
 * thumbnail before the drag starts can't lose its release and leave the
 * floating copy stuck on screen. Drops onto the [data-lane] under the
 * pointer; a plain tap calls onTap instead.
 */
function useThumbDrag(onTap, onDrop) {
  const handlers = useRef({ onTap, onDrop });
  handlers.current = { onTap, onDrop };
  useEffect(() => () => endActiveDrag?.(null, true), []);

  return (id, imgSrc) => ({
    onPointerDown(e) {
      if (e.button > 0 || !e.isPrimary) return;
      e.preventDefault(); // no text selection or native image drag
      endActiveDrag?.(null, true);

      const el = e.currentTarget;
      const pid = e.pointerId;
      const sx = e.clientX;
      const sy = e.clientY;
      const scroller = el.closest(".tt-sheet-scroll");
      let ghost = null;
      let hot = null;
      let last = { x: sx, y: sy };
      let raf = 0;
      const laneAt = (x, y) => document.elementFromPoint(x, y)?.closest("[data-lane]") || null;

      const setHot = (t) => {
        if (t === hot) return;
        hot?.classList.remove("tt-bk-hot");
        hot = t;
        hot?.classList.add("tt-bk-hot");
      };

      // Keeps scrolling while the pointer rests near the list's top/bottom edge.
      const tick = () => {
        raf = 0;
        if (!ghost || !scroller) return;
        const r = scroller.getBoundingClientRect();
        let dy = 0;
        if (last.y < r.top + 56) dy = -Math.ceil((r.top + 56 - last.y) / 4);
        else if (last.y > r.bottom - 56) dy = Math.ceil((last.y - (r.bottom - 56)) / 4);
        if (dy) {
          scroller.scrollTop += Math.max(-20, Math.min(20, dy));
          setHot(laneAt(last.x, last.y));
          raf = requestAnimationFrame(tick);
        }
      };

      const move = (ev) => {
        if (ev.pointerId !== pid) return;
        last = { x: ev.clientX, y: ev.clientY };
        if (!ghost) {
          if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < 6) return;
          ghost = document.createElement("div");
          ghost.className = "tt-bk-ghost";
          const img = document.createElement("img");
          img.src = imgSrc;
          img.alt = "";
          ghost.appendChild(img);
          document.body.appendChild(ghost);
          el.classList.add("tt-bk-lift");
          document.body.classList.add("tt-bk-dragging");
        }
        ev.preventDefault();
        ghost.style.transform = `translate(${ev.clientX}px, ${ev.clientY}px) rotate(-5deg) scale(1.08)`;
        setHot(laneAt(ev.clientX, ev.clientY));
        if (!raf) raf = requestAnimationFrame(tick);
      };

      const end = (ev, cancelled) => {
        if (ev && ev.pointerId !== undefined && ev.pointerId !== pid) return;
        endActiveDrag = null;
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", cancel);
        window.removeEventListener("blur", cancel);
        window.removeEventListener("keydown", onKey);
        if (raf) cancelAnimationFrame(raf);
        const target = hot;
        setHot(null);
        el.classList.remove("tt-bk-lift");
        document.body.classList.remove("tt-bk-dragging");
        if (ghost) {
          ghost.remove();
          if (!cancelled) {
            const t = (ev && laneAt(ev.clientX, ev.clientY)) || target;
            if (t) handlers.current.onDrop(id, t.dataset.lane);
          }
        } else if (!cancelled) {
          handlers.current.onTap(id);
        }
      };
      const up = (ev) => end(ev, false);
      const cancel = () => end(null, true);
      const onKey = (ev) => ev.key === "Escape" && cancel();

      endActiveDrag = end;
      window.addEventListener("pointermove", move, { passive: false });
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", cancel);
      window.addEventListener("blur", cancel);
      window.addEventListener("keydown", onKey);
    }
  });
}

function Thumb({ item, selected, drag, onRemove, size = "md" }) {
  const dim = size === "sm" ? "w-12 h-12 md:w-14 md:h-14" : "w-14 h-14 md:w-16 md:h-16";
  return (
    <div
      {...drag(item.id, item.dataUrl)}
      onClick={(e) => e.stopPropagation()}
      className={`relative ${dim} flex-none rounded-lg overflow-hidden bg-white/5 cursor-grab select-none`}
      style={{
        touchAction: "none",
        outline: selected ? "3px solid #FFD007" : "none",
        outlineOffset: "-3px"
      }}
    >
      <img src={item.dataUrl} alt="" draggable={false} className="w-full h-full object-cover pointer-events-none" />
      {selected && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(item.id);
          }}
          className="absolute right-0.5 top-0.5 w-5 h-5 rounded-full bg-black/75 text-white text-[13px] leading-none grid place-items-center"
          aria-label="Remove this image"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default function BulkUploadSheet({ open, onClose, user, onSuccess }) {
  // pick → reading → map → pay → done
  const [step, setStep] = useState("pick");
  const [items, setItems] = useState([]); // { id, name, blob, dataUrl, aiData, letter, path }
  const [selected, setSelected] = useState(null);
  const [readNote, setReadNote] = useState("");
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [currency, setCurrency] = useState(defaultCurrency);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [paidCount, setPaidCount] = useState(0);
  const fileRef = useRef(null);
  const uid = useRef(0);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const unmapped = items.filter((it) => it.letter === null);
  const count = items.length;

  function close() {
    if (busy) return;
    onClose();
  }

  async function addFiles(fileList) {
    let files = [...fileList].filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;
    const room = MAX_IMAGES - items.length;
    let note = "";
    if (files.length > room) {
      note = `You can add up to ${MAX_IMAGES} images at a time, so ${files.length - room} were left out.`;
      files = files.slice(0, room);
    }
    if (!files.length) {
      setError(note);
      return;
    }
    setError("");
    setStep("reading");
    setProgress({ done: 0, total: files.length });

    const fresh = [];
    for (const f of files) {
      try {
        const { blob, dataUrl, aiData } = await toSquareBlob(f);
        fresh.push({
          id: `b${++uid.current}`,
          name: f.name,
          blob,
          dataUrl,
          aiData,
          letter: null,
          path: null
        });
      } catch {
        note = note || "Some files didn't open and were skipped. Use JPG or PNG.";
      }
      if (!alive.current) return;
      setProgress((p) => ({ ...p, done: p.done + 1 }));
    }

    // Recognition: ask the model in batches; fall back to the file name.
    let aiFailed = false;
    try {
      const token = await sessionToken();
      for (let k = 0; k < fresh.length; k += RECOGNISE_BATCH) {
        const batch = fresh.slice(k, k + RECOGNISE_BATCH);
        try {
          const { letters } = await postOrder({
            product: "typetober",
            action: "recognise",
            token,
            images: batch.map((b) => b.aiData)
          });
          batch.forEach((b, j) => {
            const l = letters?.[j];
            if (Number.isInteger(l) && l >= 0 && l <= 25) b.letter = l;
          });
        } catch (err) {
          console.error("typetober recognise error:", err);
          aiFailed = true;
        }
      }
    } catch (err) {
      setError(err.message);
    }
    fresh.forEach((b) => {
      if (b.letter === null) b.letter = guessLetterFromName(b.name);
    });
    if (!alive.current) return;

    if (!fresh.length && !items.length) {
      setError(note || "Those files didn't open. Use JPG or PNG.");
      setStep("pick");
      return;
    }
    if (aiFailed) note = note || "We couldn't read every image automatically. Map the rest below.";
    setReadNote(note);
    setItems((prev) => [...prev, ...fresh]);
    setSelected(null);
    setStep("map");
  }

  function moveTo(id, lane) {
    const letter = lane === UNMAPPED ? null : Number(lane);
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, letter } : it)));
    setSelected(null);
  }

  function remove(id) {
    setItems((prev) => prev.filter((it) => it.id !== id));
    setSelected(null);
  }

  const drag = useThumbDrag(
    (id) => setSelected((s) => (s === id ? null : id)),
    (id, lane) => moveTo(id, lane)
  );

  function tapLane(lane) {
    if (selected) moveTo(selected, lane);
  }

  async function pay() {
    setError("");
    setBusy(true);
    // Upload every image first (skipping ones already uploaded on an
    // earlier, failed attempt), then charge once for all of them.
    const list = items.map((it) => ({ ...it }));
    try {
      const token = await sessionToken();

      const toUpload = list.filter((it) => !it.path);
      setProgress({ done: list.length - toUpload.length, total: list.length });
      const stamp = Date.now();
      await pool(toUpload, 4, async (it, k) => {
        const path = `${user.id}/${it.letter}-${stamp}-${k}.jpg`;
        const { error: upErr } = await supabase.storage
          .from("typetober-submissions")
          .upload(path, it.blob, { contentType: "image/jpeg" });
        if (upErr) throw upErr;
        it.path = path;
        setProgress((p) => ({ ...p, done: p.done + 1 }));
      });
      setItems(list);
      const payload = {
        product: "typetober",
        token,
        currency,
        items: list.map((it) => ({ letterIndex: it.letter, imagePath: it.path }))
      };

      const finish = () => {
        setBusy(false);
        setPaidCount(list.length);
        setStep("done");
        onSuccess?.(list.length);
      };

      if (import.meta.env.DEV) {
        await postOrder({ ...payload, devConfirm: true });
        finish();
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Razorpay failed to load. Check your connection.");
      const order = await postOrder(payload);

      const rzp = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_API_KEY,
        amount: String(order.amount),
        currency: order.currency,
        order_id: order.order_id,
        name: "Typetober · Evolve",
        description: `${list.length} letter submissions`,
        prefill: { name: user?.name || "", email: user?.email || "" },
        theme: { color: "#FFD007" },
        handler: async (response) => {
          try {
            await postOrder({
              product: "typetober",
              action: "verify",
              token,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            finish();
          } catch (err) {
            setBusy(false);
            setError(err.message || "Payment couldn't be confirmed.");
          }
        },
        modal: { ondismiss: () => setBusy(false) }
      });
      rzp.on("payment.failed", () => {
        setBusy(false);
        setError("Payment failed. Nothing was charged for a failed attempt.");
      });
      rzp.open();
    } catch (err) {
      console.error("typetober bulk error:", err);
      setItems(list);
      setError(err.message || "Something went wrong. Try again.");
      setBusy(false);
    }
  }

  const fileInput = (
    <input
      ref={fileRef}
      type="file"
      accept="image/*"
      multiple
      hidden
      onChange={(e) => {
        addFiles(e.target.files);
        e.target.value = "";
      }}
    />
  );

  const stepBar = (n) => (
    <div className="flex gap-2 mr-10 mb-4">
      {[0, 1, 2].map((k) => (
        <div key={k} className={`h-1 flex-1 rounded-full ${k <= n ? "bg-evolve-yellow" : "bg-white/10"}`} />
      ))}
    </div>
  );

  // ── map step: pinned header (unmapped tray), scrolling A–Z lanes, pinned button
  if (step === "map") {
    const letters = new Set(items.filter((it) => it.letter !== null).map((it) => it.letter)).size;
    const header = (
      <div>
        {stepBar(1)}
        <h2 className="text-[24px] md:text-[28px] font-extrabold mr-10 leading-tight">Check your letters</h2>
        <p className="text-[14px] mt-1 text-white/60">
          {unmapped.length ? (
            <>
              <b className="text-white">{count - unmapped.length}</b> matched ·{" "}
              <span className="text-evolve-pink font-bold">{unmapped.length} need your help</span>
            </>
          ) : (
            <>
              <b className="text-white">{count}</b> {count === 1 ? "image" : "images"} across{" "}
              <b className="text-white">{letters}</b> {letters === 1 ? "letter" : "letters"}. Look right?
            </>
          )}
        </p>
        {unmapped.length > 0 && (
          <div
            data-lane={UNMAPPED}
            className="tt-bk-lane mt-3 rounded-2xl border-[1.5px] border-dashed border-evolve-pink/80 bg-evolve-pink/10 p-3"
          >
            <div className="text-[12px] font-extrabold uppercase tracking-wider text-evolve-pink mb-2">
              Which letter is this?
            </div>
            <div className="flex flex-wrap gap-2">
              {unmapped.map((it) => (
                <Thumb key={it.id} item={it} selected={selected === it.id} drag={drag} onRemove={remove} />
              ))}
            </div>
          </div>
        )}
        <p className="text-white/40 text-[12px] mt-2">
          {selected
            ? "Now tap the letter it belongs to, or tap × to remove it."
            : "Tap a picture, then its letter. Or drag it there."}
        </p>
      </div>
    );
    const footer = (
      <>
        {error && <p className="text-red-400 text-[13px] mb-2">{error}</p>}
        <div className="flex gap-2">
          {count < MAX_IMAGES && (
            <button
              onClick={() => fileRef.current?.click()}
              className="flex-none px-4 rounded-2xl bg-white/10 font-bold text-[14px]"
            >
              Add more
            </button>
          )}
          <button
            disabled={!count || unmapped.length > 0}
            onClick={() => {
              setSelected(null);
              setStep("pay");
            }}
            className="tt-btn tt-btn-dark flex-1 py-3.5 rounded-2xl font-extrabold text-[17px] disabled:opacity-40"
          >
            {unmapped.length
              ? `Map ${unmapped.length} more to continue`
              : `Continue · ${formatPrice(currency, count)}`}
          </button>
        </div>
      </>
    );
    return (
      <SheetShell open={open} onClose={close} header={header} footer={footer}>
        {fileInput}
        {readNote && <p className="text-evolve-yellow text-[13px] mt-3">{readNote}</p>}
        <div className="flex flex-col gap-1.5 mt-3">
          {LETTERS.map((ch, i) => {
            const inLane = items.filter((it) => it.letter === i);
            return (
              <div
                key={ch}
                data-lane={i}
                onClick={() => tapLane(String(i))}
                className={`tt-bk-lane flex items-center gap-3 min-h-[64px] md:min-h-[72px] rounded-2xl bg-white/5 border-[1.5px] px-2 py-1.5 ${
                  selected ? "border-white/15 cursor-pointer" : "border-transparent"
                }`}
              >
                <div className="flex-none w-10 text-center font-extrabold text-[30px] leading-none" style={{ color: accentFor(i) }}>
                  {ch}
                </div>
                <div className="flex-1 min-w-0 flex flex-wrap gap-1.5 items-center">
                  {inLane.length ? (
                    inLane.map((it) => (
                      <Thumb key={it.id} item={it} size="sm" selected={selected === it.id} drag={drag} onRemove={remove} />
                    ))
                  ) : (
                    <span className="text-white/20 text-[13px]">{selected ? "Tap to put it here" : "Drop here"}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </SheetShell>
    );
  }

  return (
    <SheetShell open={open} onClose={close}>
      {fileInput}

      {step === "pick" && (
        <>
          {stepBar(0)}
          <h2 className="text-[26px] font-extrabold">Bulk upload</h2>
          <p className="text-white/50 text-[14px] mt-1">
            Pick all your letters at once. We'll work out which letter each image is, you fix any we miss, then
            pay once: {PRICE[currency]} per image.
          </p>
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full mt-5 rounded-3xl border-2 border-dashed border-white/20 hover:border-evolve-yellow/60 py-12 px-4 text-center"
          >
            <BulkIcon className="mx-auto mb-3 w-9 h-9" />
            <b className="block text-[20px] font-extrabold">Choose images</b>
            <span className="text-white/50 text-[14px]">Select up to {MAX_IMAGES} from your gallery or computer</span>
          </button>
          <ul className="mt-5 space-y-2 text-[13px] text-white/50">
            <li>· Square works best. Anything else is centre-cropped to a square.</li>
            <li>· You can submit more than one image for the same letter.</li>
            <li>· Only your own work. Copied or unlawful work gets removed, no refund.</li>
          </ul>
          {error && <p className="text-red-400 text-[13px] mt-3">{error}</p>}
        </>
      )}

      {step === "reading" && (
        <div className="py-10 text-center">
          <div className="w-11 h-11 mx-auto rounded-full border-4 border-white/10 border-t-evolve-yellow animate-spin" />
          <h2 className="text-[22px] font-extrabold mt-5">Reading your letters</h2>
          <p className="text-white/50 text-[14px] mt-1">
            {progress.done < progress.total
              ? `Preparing ${progress.done + 1} of ${progress.total}…`
              : "Matching each image to its letter…"}
          </p>
        </div>
      )}

      {step === "pay" && (
        <>
          {stepBar(2)}
          <h2 className="text-[26px] font-extrabold">Pay and submit</h2>
          <p className="text-white/50 text-[14px] mt-1">
            {PRICE[currency]} per image. Every image counts toward your certificates.
          </p>
          <div className="flex gap-1 bg-white/5 rounded-full p-1 mt-4" role="radiogroup" aria-label="Pay with">
            {[
              ["INR", "India · ₹10 each"],
              ["USD", "International · $1 each"]
            ].map(([c, label]) => (
              <button
                key={c}
                role="radio"
                aria-checked={currency === c}
                disabled={busy}
                onClick={() => setCurrency(c)}
                className={`flex-1 py-2 rounded-full font-extrabold text-[13px] ${
                  currency === c ? "bg-evolve-yellow text-black" : "text-white/60"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-6 md:grid-cols-8 gap-1.5 mt-4">
            {[...items]
              .sort((a, b) => a.letter - b.letter)
              .map((it) => (
                <div key={it.id} className="relative aspect-square rounded-lg overflow-hidden bg-white/5">
                  <img src={it.dataUrl} alt={LETTERS[it.letter]} className="w-full h-full object-cover" />
                  <span className="absolute left-0.5 top-0.5 bg-evolve-yellow text-black text-[10px] font-extrabold px-1.5 py-0.5 rounded-full leading-none">
                    {LETTERS[it.letter]}
                  </span>
                </div>
              ))}
          </div>
          <div className="flex items-baseline justify-between bg-white/5 rounded-2xl px-4 py-3 mt-4">
            <span className="text-white/60 text-[14px]">
              {count} × {PRICE[currency]}
            </span>
            <b className="text-evolve-yellow font-extrabold text-[24px]">{formatPrice(currency, count)}</b>
          </div>
          <label className="flex items-start gap-2 mt-4 text-white/60 text-[13px]">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5" />
            These are my own work and I agree to the terms. Payments are final.
          </label>
          {error && <p className="text-red-400 text-[13px] mt-3">{error}</p>}
          <button
            disabled={!agree || busy}
            onClick={pay}
            className="tt-btn tt-btn-dark w-full mt-4 py-3.5 rounded-2xl font-extrabold text-[17px] disabled:opacity-40"
          >
            {busy
              ? progress.done < progress.total
                ? `Uploading ${progress.done} of ${progress.total}…`
                : "Confirming payment…"
              : `Pay ${formatPrice(currency, count)} & submit`}
          </button>
          <button
            disabled={busy}
            onClick={() => setStep("map")}
            className="w-full mt-2 text-white/40 text-[13px] font-bold"
          >
            Back
          </button>
        </>
      )}

      {step === "done" && (
        <>
          <div className="w-16 h-16 rounded-full bg-evolve-inchworm grid place-items-center mt-2">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#161616" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </div>
          <h2 className="text-[26px] font-extrabold mt-4">
            {paidCount} {paidCount === 1 ? "letter" : "letters"} submitted
          </h2>
          <p className="text-white/50 text-[14px] mt-1">They're on the wall now. Each one counts toward your certificates.</p>
          <div className="grid grid-cols-6 md:grid-cols-8 gap-1.5 mt-4">
            {items.map((it) => (
              <div key={it.id} className="aspect-square rounded-lg overflow-hidden">
                <img src={it.dataUrl} alt={LETTERS[it.letter]} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <button onClick={onClose} className="tt-btn w-full mt-5 bg-evolve-yellow text-black font-extrabold py-3.5 rounded-2xl">
            See them on the wall
          </button>
        </>
      )}
    </SheetShell>
  );
}
