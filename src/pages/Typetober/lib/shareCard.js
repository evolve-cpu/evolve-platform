// Canvas-rendered share images: one per submission ("here's my letter"),
// one per certificate tier (bronze/silver/gold). Both come back as a Blob
// so the caller can either hand it to navigator.share (native share sheet
// with the image attached) or offer it as a download.

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function toBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

async function ensureFonts() {
  try {
    await Promise.all([
      document.fonts.load('800 100px "Bricolage Grotesque"'),
      document.fonts.load('700 30px "Bricolage Grotesque"')
    ]);
  } catch {
    // best-effort — canvas falls back to a system sans if this fails
  }
}

export async function renderWorkCard({ letter, dayNumber, name, imageUrl, accent }) {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const c = canvas.getContext("2d");
  await ensureFonts();

  c.fillStyle = "#000";
  c.fillRect(0, 0, W, H);

  const X = 90;
  const Z = 900;
  const IY = 232;

  c.textAlign = "left";
  c.font = '800 90px "Bricolage Grotesque", Arial Black, sans-serif';
  c.fillStyle = "#DF0586";
  c.fillText("Typetober", X + 5, 122 + 5);
  c.fillStyle = "#FFD007";
  c.fillText("Typetober", X, 122);

  c.font = '700 30px "Bricolage Grotesque", Arial, sans-serif';
  c.fillStyle = "#F4F4F4";
  c.fillText("1 month. 26 alphabets. evolvedesign.academy", X, 178);

  // Small offset shadow; the caption below sits well clear of it.
  c.fillStyle = accent || "#DF0586";
  roundedRect(c, X + 10, IY + 10, Z, Z, 36);
  c.fill();

  c.save();
  roundedRect(c, X, IY, Z, Z, 36);
  c.fillStyle = "#161616";
  c.fill();
  c.clip();
  if (imageUrl) {
    try {
      const img = await loadImage(imageUrl);
      const s = Math.min(img.width, img.height);
      c.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, X, IY, Z, Z);
    } catch {
      c.fillStyle = accent || "#DF0586";
      c.fillRect(X, IY, Z, Z);
    }
  } else {
    c.fillStyle = accent || "#DF0586";
    c.fillRect(X, IY, Z, Z);
  }
  c.restore();

  c.lineWidth = 8;
  c.strokeStyle = "#F4F4F4";
  roundedRect(c, X, IY, Z, Z, 36);
  c.stroke();

  c.fillStyle = "#F4F4F4";
  c.font = '700 44px "Bricolage Grotesque", Arial, sans-serif';
  c.fillText(`${letter} · Day ${dayNumber}`, X, IY + Z + 92);
  c.fillStyle = "#FFD007";
  c.font = '700 26px "Bricolage Grotesque", Arial, sans-serif';
  c.fillText(`@${name || "you"}`, X, IY + Z + 136);

  return toBlob(canvas);
}

export async function renderCertificateCard({ tier, tierColor, name, why }) {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const c = canvas.getContext("2d");
  await ensureFonts();

  c.fillStyle = "#000";
  c.fillRect(0, 0, W, H);

  c.fillStyle = "#DF0586";
  roundedRect(c, 64 + 18, 64 + 18, W - 128, H - 128 - 140, 44);
  c.fill();

  c.fillStyle = tierColor;
  roundedRect(c, 64, 64, W - 128, H - 128 - 140, 44);
  c.fill();
  c.lineWidth = 10;
  c.strokeStyle = "#161616";
  c.stroke();

  c.fillStyle = "#161616";
  c.textAlign = "left";
  c.font = '700 36px "Bricolage Grotesque", Arial, sans-serif';
  c.fillText("Typetober · Evolve", 130, 180);
  c.font = '700 44px "Bricolage Grotesque", Arial, sans-serif';
  c.fillText("Certificate of", 130, 420);
  c.font = '800 220px "Bricolage Grotesque", Arial Black, sans-serif';
  c.fillText(tier.charAt(0).toUpperCase() + tier.slice(1), 120, 620);
  c.font = '800 60px "Bricolage Grotesque", Arial Black, sans-serif';
  c.fillText(`Awarded to @${name || "you"}`, 130, 750);
  c.globalAlpha = 0.75;
  c.font = '700 40px "Bricolage Grotesque", Arial, sans-serif';
  c.fillText(why, 130, 815);
  c.globalAlpha = 1;

  c.beginPath();
  c.arc(840, 270, 120, 0, Math.PI * 2);
  c.setLineDash([16, 14]);
  c.lineWidth = 6;
  c.strokeStyle = "rgba(0,0,0,.4)";
  c.stroke();
  c.setLineDash([]);

  c.font = '800 100px "Bricolage Grotesque", Arial Black, sans-serif';
  c.fillStyle = "#161616";
  c.textAlign = "center";
  c.fillText({ bronze: "10", silver: "18", gold: "26" }[tier] || "", 840, 305);

  c.font = '800 44px "Bricolage Grotesque", Arial Black, sans-serif';
  c.fillStyle = "#FFD007";
  c.fillText("evolve", W / 2, H - 90);

  return toBlob(canvas);
}
