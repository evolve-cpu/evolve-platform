// Generated letter "illustrations" for the landing backdrop — a port of the
// art() helper in the Typetober reference mock, so the ink-reveal wall looks
// the same. Returns an SVG string built only from our own constants.

const PAL = [
  ["#FFD007", "#161616"],
  ["#DF0586", "#FFD007"],
  ["#A35BFB", "#C2FD5C"],
  ["#C2FD5C", "#DF0586"],
  ["#01F1D9", "#161616"],
  ["#EB5328", "#F4F4F4"],
  ["#3139FF", "#FFD007"],
  ["#161616", "#C2FD5C"]
];

export function letterArt(ch, seed) {
  const [bg, fg] = PAL[seed % 8];
  const st = (seed * 7 + ch.charCodeAt(0)) % 6;
  const rot = ((seed % 5) - 2) * 4;
  const f = 'font-family="Bricolage Grotesque,Arial Black,sans-serif" font-weight="800" text-anchor="middle"';
  const t = (x, y, sz, extra) => `<text x="${x}" y="${y}" font-size="${sz}" ${f} ${extra}>${ch}</text>`;
  let o = `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"><rect width="100" height="100" fill="${bg}"/><g transform="rotate(${rot} 50 50)">`;
  if (st === 0) {
    o += t(50, 70, 86, `fill="${fg}"`);
  } else if (st === 1) {
    o += `<circle cx="50" cy="50" r="38" fill="${fg}"/>` + t(50, 68, 66, `fill="${bg}"`);
  } else if (st === 2) {
    for (let i = 0; i < 10; i++) o += `<rect y="${i * 10}" width="100" height="4" fill="${fg}" opacity=".28"/>`;
    o += t(50, 68, 84, `fill="none" stroke="${fg}" stroke-width="3"`);
  } else if (st === 3) {
    o += t(55, 75, 80, `fill="${fg}" opacity=".55"`) + t(48, 68, 80, `fill="${bg}" stroke="${fg}" stroke-width="2.5"`);
  } else if (st === 4) {
    o += `<path d="M16 100V50a34 34 0 0 1 68 0v50z" fill="${fg}"/>` + t(50, 86, 62, `fill="${bg}"`);
  } else {
    for (let i = 0; i < 25; i++) {
      o += `<circle cx="${10 + (i % 5) * 20}" cy="${10 + Math.floor(i / 5) * 20}" r="${2 + ((i * seed) % 5)}" fill="${fg}" opacity=".4"/>`;
    }
    o += t(50, 70, 78, `fill="${fg}"`);
  }
  return o + "</g></svg>";
}
