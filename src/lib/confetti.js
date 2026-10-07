// One-shot confetti burst (trial welcome, "you're evolve verified") —
// a straight port of the reference prototype's canvas confetti so the
// colours, count and fall match it exactly.
const COLORS = ["#FFD007", "#DF0586", "#A35BFB", "#C2FD5C", "#01F1D9", "#FFFFFF"];

export function fireConfetti() {
  if (typeof window === "undefined") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  const cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  Object.assign(cv.style, {
    position: "fixed",
    inset: "0",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: "9600"
  });
  document.body.appendChild(cv);

  const ctx = cv.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const W = window.innerWidth;
  const H = window.innerHeight;
  cv.width = W * dpr;
  cv.height = H * dpr;
  ctx.scale(dpr, dpr);

  const P = Array.from({ length: 150 }, (_, i) => ({
    x: W / 2 + (Math.random() - 0.5) * 60,
    y: H * 0.42,
    vx: (Math.random() - 0.5) * 16,
    vy: -Math.random() * 15 - 5,
    w: 6 + Math.random() * 6,
    h: 4 + Math.random() * 6,
    r: Math.random() * 6.28,
    vr: (Math.random() - 0.5) * 0.35,
    c: COLORS[i % COLORS.length]
  }));

  const t0 = performance.now();
  (function frame(now) {
    const t = now - t0;
    ctx.clearRect(0, 0, W, H);
    P.forEach((p) => {
      p.vy += 0.33;
      p.vx *= 0.992;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - t / 3600);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (t < 3600) requestAnimationFrame(frame);
    else cv.remove();
  })(t0);
}
