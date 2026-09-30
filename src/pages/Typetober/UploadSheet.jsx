import { useRef, useState } from "react";
import { SheetShell } from "./Sheets";
import { supabase } from "../../supabaseClient";
import { LETTERS, ordinalOctDate } from "./lib/constants";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

/**
 * Centre-crops any picked file to a 720x720 JPEG. Returns the blob to upload
 * plus a data: URL for the preview (blob: URLs are blocked by the site's
 * img-src CSP, which is why the preview used to come up empty).
 */
function toSquareBlob(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        const s = Math.min(img.width, img.height);
        const canvas = document.createElement("canvas");
        canvas.width = 720;
        canvas.height = 720;
        canvas
          .getContext("2d")
          .drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 720, 720);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.86);
        canvas.toBlob(
          (blob) => (blob ? resolve({ blob, dataUrl }) : reject(new Error("crop failed"))),
          "image/jpeg",
          0.86
        );
      };
      img.onerror = () => reject(new Error("that file didn't open"));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error("couldn't read that file"));
    reader.readAsDataURL(file);
  });
}

// ₹10 in India, $1 international. Default from the browser's timezone; the
// user can switch, and the server sets the actual amount.
const PRICE = { INR: "₹10", USD: "$1" };
function defaultCurrency() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    return tz === "Asia/Kolkata" || tz === "Asia/Calcutta" ? "INR" : "USD";
  } catch {
    return "INR";
  }
}

export default function UploadSheet({ open, onClose, user, letterIndex, onSuccess }) {
  const [currency, setCurrency] = useState(defaultCurrency);
  const [step, setStep] = useState(1); // 1 pick, 2 pay, 3 done
  const [blob, setBlob] = useState(null);
  const [preview, setPreview] = useState(null);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const galRef = useRef(null);
  const camRef = useRef(null);

  if (letterIndex === null || letterIndex === undefined) return null;
  const letter = LETTERS[letterIndex];

  function reset() {
    setStep(1);
    setBlob(null);
    setPreview(null);
    setAgree(false);
    setBusy(false);
    setError("");
  }

  function close() {
    reset();
    onClose();
  }

  async function pick(file) {
    if (!file) return;
    setError("");
    try {
      const { blob: b, dataUrl } = await toSquareBlob(file);
      setBlob(b);
      setPreview(dataUrl);
    } catch (err) {
      setError(err.message);
    }
  }

  async function pay() {
    setError("");
    setBusy(true);
    try {
      const {
        data: { session }
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError("Your session expired — sign in again.");
        setBusy(false);
        return;
      }

      const path = `${user.id}/${letterIndex}-${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage
        .from("typetober-submissions")
        .upload(path, blob, { contentType: "image/jpeg" });
      if (upErr) throw upErr;

      const verify = async (payload) => {
        const res = await fetch("/api/razorpay-create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error || "payment could not be confirmed");
        return data;
      };

      if (import.meta.env.DEV) {
        await verify({
          product: "typetober",
          token: session.access_token,
          letterIndex,
          imagePath: path,
          currency,
          devConfirm: true
        });
        setBusy(false);
        setStep(3);
        onSuccess?.(letterIndex);
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Razorpay failed to load. Check your connection.");

      const orderRes = await fetch("/api/razorpay-create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: "typetober", token: session.access_token, letterIndex, imagePath: path, currency })
      });
      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order?.error || "couldn't start payment");

      const rzp = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_API_KEY,
        amount: String(order.amount),
        currency: order.currency,
        order_id: order.order_id,
        name: "Typetober · Evolve",
        description: `Letter ${letter} submission`,
        prefill: { name: user?.name || "", email: user?.email || "" },
        theme: { color: "#FFD007" },
        handler: async (response) => {
          try {
            await verify({
              product: "typetober",
              action: "verify",
              token: session.access_token,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            setBusy(false);
            setStep(3);
            onSuccess?.(letterIndex);
          } catch (err) {
            setBusy(false);
            setError(err.message);
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
      console.error("typetober upload error:", err);
      setError(err.message || "Something went wrong. Try again.");
      setBusy(false);
    }
  }

  return (
    <SheetShell open={open} onClose={close}>
      <input ref={galRef} type="file" accept="image/*" hidden onChange={(e) => { pick(e.target.files[0]); e.target.value = ""; }} />
      <input ref={camRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { pick(e.target.files[0]); e.target.value = ""; }} />

      <div className="flex gap-2 mr-8 mb-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className={`h-1 flex-1 rounded-full ${n <= step ? "bg-evolve-yellow" : "bg-white/10"}`} />
        ))}
      </div>

      {step === 1 && (
        <>
          <h2 className="text-[26px] font-extrabold">Drop your illustration</h2>
          <p className="text-white/50 text-[14px] mt-1">
            Letter {letter} · {ordinalOctDate(letterIndex)}. Shoot it or upload it — we'll crop it to a square.
          </p>
          <div className={`mt-4 aspect-square w-full mx-auto md:max-w-[min(100%,50vh)] relative rounded-2xl border-2 grid place-items-center overflow-hidden bg-white/5 ${preview ? "border-evolve-yellow" : "border-dashed border-white/20"}`}>
            {preview ? (
              <img src={preview} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <span className="text-white/10 font-extrabold text-[140px]">{letter}</span>
            )}
          </div>
          {error && <p className="text-red-400 text-[13px] mt-3">{error}</p>}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button onClick={() => galRef.current?.click()} className="bg-white/10 text-white font-bold py-3 rounded-2xl">
              {preview ? "Change" : "Upload"}
            </button>
            <button onClick={() => camRef.current?.click()} className="bg-white/10 text-white font-bold py-3 rounded-2xl">
              Take photo
            </button>
          </div>
          <p className="text-white/30 text-[12px] mt-3">Only your own work — copied or unlawful work gets removed, no refund.</p>
          <button
            disabled={!blob}
            onClick={() => setStep(2)}
            className="tt-btn w-full mt-5 bg-evolve-yellow text-black font-extrabold py-3.5 rounded-2xl disabled:opacity-40"
          >
            Continue →
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <h2 className="text-[26px] font-extrabold">Lock it in</h2>
          <p className="text-white/50 text-[14px] mt-1">{PRICE[currency]} per submission and it goes on the wall. Add as many as you like; each one counts toward your certificates.</p>
          <div className="flex gap-1 bg-white/5 rounded-full p-1 mt-4" role="radiogroup" aria-label="Pay with">
            {[
              ["INR", "India · ₹10"],
              ["USD", "International · $1"]
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
          <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-3 mt-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-none">
              {preview && <img src={preview} alt={letter} className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1">
              <b className="block">Typetober · Letter {letter}</b>
              <span className="text-white/50 text-[13px]">@{user?.username || user?.name}</span>
            </div>
            <div className="text-evolve-yellow font-extrabold text-[22px]">{PRICE[currency]}</div>
          </div>
          <label className="flex items-start gap-2 mt-4 text-white/60 text-[13px]">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5" />
            This is my own work and I agree to the terms. Payments are final.
          </label>
          {error && <p className="text-red-400 text-[13px] mt-3">{error}</p>}
          <button
            disabled={!agree || busy}
            onClick={pay}
            className="tt-btn w-full mt-4 bg-evolve-yellow text-black font-extrabold py-3.5 rounded-2xl disabled:opacity-40"
          >
            {busy ? "Confirming payment…" : `Pay ${PRICE[currency]} & submit`}
          </button>
          <button onClick={() => setStep(1)} className="w-full mt-2 text-white/40 text-[13px] font-bold">
            Back
          </button>
        </>
      )}

      {step === 3 && (
        <>
          <h2 className="text-[26px] font-extrabold">You're on the wall</h2>
          <p className="text-white/50 text-[14px] mt-1">Your illustration for {letter} is live.</p>
          <div className="mt-4 aspect-square w-full mx-auto md:max-w-[min(100%,50vh)] relative rounded-2xl overflow-hidden">
            {preview && <img src={preview} alt={letter} className="w-full h-full object-cover" />}
          </div>
          <button onClick={close} className="tt-btn w-full mt-5 bg-evolve-yellow text-black font-extrabold py-3.5 rounded-2xl">
            See it on the wall
          </button>
        </>
      )}
    </SheetShell>
  );
}
