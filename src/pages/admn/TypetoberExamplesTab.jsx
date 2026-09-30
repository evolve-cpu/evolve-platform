import { useEffect, useState } from "react";
import { supabaseAdmin } from "../../supabaseAdminClient";

// Admin: up to two example illustrations per Typetober letter. They show as
// the first tiles of that letter's grid once it unlocks. Images go in the
// typetober-submissions bucket under examples/; rows in typetober_examples
// (see supabase/migrations/typetober_submissions.sql).

const Y = "#FFD007";
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const BUCKET = "typetober-submissions";

/**
 * Centre-crop to a 720x720 JPEG so every example matches the square grid.
 * Reads the file as a data: URL — blob: URLs are blocked by the site's
 * img-src CSP.
 */
function toSquareJpeg(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const s = Math.min(img.width, img.height);
        const canvas = document.createElement("canvas");
        canvas.width = 720;
        canvas.height = 720;
        canvas.getContext("2d").drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 720, 720);
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("crop failed"))), "image/jpeg", 0.88);
      };
      img.onerror = () => reject(new Error("that file didn't open"));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error("couldn't read that file"));
    reader.readAsDataURL(file);
  });
}

function publicUrl(path) {
  return supabaseAdmin.storage.from(BUCKET).getPublicUrl(path).data?.publicUrl;
}

function Slot({ letterIndex, slot, row, credit, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(file) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const blob = await toSquareJpeg(file);
      const path = `examples/${LETTERS[letterIndex].toLowerCase()}-${slot}-${Date.now()}.jpg`;
      const { error: upErr } = await supabaseAdmin.storage.from(BUCKET).upload(path, blob, { contentType: "image/jpeg" });
      if (upErr) throw upErr;
      const { error: dbErr } = await supabaseAdmin
        .from("typetober_examples")
        .upsert(
          { letter_index: letterIndex, slot, image_path: path, credit: credit || null },
          { onConflict: "letter_index,slot" }
        );
      if (dbErr) throw dbErr;
      if (row?.image_path) await supabaseAdmin.storage.from(BUCKET).remove([row.image_path]);
      onChanged();
    } catch (err) {
      setError(err.message || "upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!row || !window.confirm(`Remove example ${slot} for ${LETTERS[letterIndex]}?`)) return;
    setBusy(true);
    const { error: dbErr } = await supabaseAdmin.from("typetober_examples").delete().eq("id", row.id);
    if (!dbErr && row.image_path) await supabaseAdmin.storage.from(BUCKET).remove([row.image_path]);
    setBusy(false);
    if (dbErr) setError(dbErr.message);
    else onChanged();
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="relative aspect-square rounded-lg overflow-hidden grid place-items-center cursor-pointer text-[11px] font-semibold"
        style={{ background: "#0d0d0d", border: row ? `1px solid ${Y}` : "1px dashed #333", color: "#666" }}
      >
        {row ? (
          <img src={publicUrl(row.image_path)} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <span>{busy ? "uploading…" : `+ example ${slot}`}</span>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={busy}
          onChange={(e) => {
            upload(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </label>
      {row && (
        <div className="flex justify-between text-[11px]">
          <span style={{ color: "#888" }}>{busy ? "working…" : "click to replace"}</span>
          <button onClick={remove} disabled={busy} style={{ color: "#ef4444" }}>
            remove
          </button>
        </div>
      )}
      {error && <span className="text-[11px]" style={{ color: "#ef4444" }}>{error}</span>}
    </div>
  );
}

export default function TypetoberExamplesTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [credit, setCredit] = useState("");

  async function load() {
    const { data, error } = await supabaseAdmin.from("typetober_examples").select("*");
    if (error) console.error("typetober examples admin load:", error);
    setRows(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const rowFor = (i, slot) => rows.find((r) => r.letter_index === i && r.slot === slot);

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-lg font-bold text-white">Typetober examples</h2>
        <p className="text-sm mt-1" style={{ color: "#888" }}>
          Up to two example illustrations per letter. They appear as the first boxes of the letter's grid once it
          unlocks. Letters without examples start with the upload box. Images are cropped to a square.
        </p>
        <div className="flex items-center gap-2 mt-3">
          <label className="text-xs font-semibold" style={{ color: "#666" }}>
            Credit for new uploads (optional)
          </label>
          <input
            value={credit}
            onChange={(e) => setCredit(e.target.value)}
            placeholder="e.g. Evolve team"
            className="text-sm text-white rounded-lg px-3 py-1.5"
            style={{ backgroundColor: "#0d0d0d", border: "1px solid #262626" }}
          />
        </div>
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: "#666" }}>loading…</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {LETTERS.map((ch, i) => (
            <div key={ch} className="rounded-xl p-3" style={{ background: "#111", border: "1px solid #1f1f1f" }}>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-2xl font-extrabold" style={{ color: Y }}>
                  {ch}
                </span>
                <span className="text-[11px]" style={{ color: "#666" }}>
                  Oct {i + 1}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2].map((slot) => (
                  <Slot
                    key={slot}
                    letterIndex={i}
                    slot={slot}
                    row={rowFor(i, slot)}
                    credit={credit}
                    onChanged={load}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
