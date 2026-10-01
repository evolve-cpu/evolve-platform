// Shared by the single-letter and bulk upload sheets.

export function loadRazorpayScript() {
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
 * Centre-crops any picked file to a 720x720 JPEG. Returns the blob to upload,
 * a data: URL for previews (blob: URLs are blocked by the site's img-src CSP)
 * and a small 256px JPEG as bare base64 for letter recognition.
 */
export function toSquareBlob(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        const s = Math.min(img.width, img.height);
        const sx = (img.width - s) / 2;
        const sy = (img.height - s) / 2;
        const canvas = document.createElement("canvas");
        canvas.width = 720;
        canvas.height = 720;
        canvas.getContext("2d").drawImage(img, sx, sy, s, s, 0, 0, 720, 720);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.86);
        const small = document.createElement("canvas");
        small.width = 256;
        small.height = 256;
        small.getContext("2d").drawImage(canvas, 0, 0, 256, 256);
        const aiData = small.toDataURL("image/jpeg", 0.8).split(",")[1];
        canvas.toBlob(
          (blob) => (blob ? resolve({ blob, dataUrl, aiData }) : reject(new Error("crop failed"))),
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

// ₹10 in India, $1 international, per image. Default from the browser's
// timezone; the user can switch, and the server sets the actual amount.
export const PRICE = { INR: "₹10", USD: "$1" };
export const UNIT = { INR: 10, USD: 1 };
export const formatPrice = (currency, n) =>
  currency === "USD" ? `$${n * UNIT.USD}` : `₹${(n * UNIT.INR).toLocaleString("en-IN")}`;

export function defaultCurrency() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    return tz === "Asia/Kolkata" || tz === "Asia/Calcutta" ? "INR" : "USD";
  } catch {
    return "INR";
  }
}

/** Guess the letter from a file name: "typetober-D.jpg", "d (2).png", "07.jpg". */
export function guessLetterFromName(name) {
  const n = (name || "").replace(/\.[^.]+$/, "");
  let m = n.match(/(?:^|[^a-z0-9])([a-z])(?:[^a-z0-9]|$)/i);
  if (m) return m[1].toUpperCase().charCodeAt(0) - 65;
  m = n.match(/^(?:(?:letter|day|no|n)[-_ ]?)?(\d{1,2})$/i);
  if (m && +m[1] >= 1 && +m[1] <= 26) return +m[1] - 1;
  return null;
}

/** POST to the shared payment endpoint; throws with the server's message. */
export async function postOrder(payload) {
  const res = await fetch("/api/razorpay-create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || "request failed");
  return data;
}
