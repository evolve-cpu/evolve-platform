import { useEffect, useRef, useState } from "react";
import { LETTERS } from "./lib/constants";
import { letterArt } from "./lib/letterArt";

const isDesktop = () => window.matchMedia("(min-width: 768px)").matches;
const wallCols = () => (window.innerWidth >= 1100 ? 9 : window.innerWidth >= 768 ? 7 : 4);
const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The landing screen's "scratch to reveal" backdrop: a wall of coloured
 * letter tiles sits under a solid black canvas; dragging a finger/cursor
 * over it erases (destination-out) a smudgy hole in the canvas, revealing
 * the wall beneath. The hole slowly "heals" back to black over time, and a
 * short auto-played demo stroke hints at the interaction on first load.
 *
 * `heroRef` (the opaque hero panel above the canvas) is measured only to aim
 * the mobile demo stroke above it.
 */
export default function InkWall({ heroRef }) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const lastRef = useRef(null);
  const heroTopRef = useRef({ y: 0 });
  const rafRef = useRef(null);
  const [hintGone, setHintGone] = useState(false);
  const [wall, setWall] = useState({ cols: 4, count: 0 });

  // The hero panel is opaque and sits above the canvas, so the ink isn't
  // clipped around it (a clipped rectangle is what peeked out as a black box
  // behind the panel). Only its top edge is kept, for the mobile demo stroke.
  function measureHero() {
    const root = rootRef.current;
    const hero = heroRef.current;
    if (!root || !hero) return;
    const r = root.getBoundingClientRect();
    const hr = hero.getBoundingClientRect();
    heroTopRef.current = { y: Math.max(120, hr.top - r.top) };
  }

  function sizeCanvas() {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    measureHero();
    // Enough rows of art tiles to cover the screen (6px padding + gaps).
    const cols = wallCols();
    const tile = (root.clientWidth - 12 - 6 * (cols - 1)) / cols;
    setWall({ cols, count: cols * Math.ceil(root.clientHeight / (tile + 6) + 1) });
    canvas.width = root.clientWidth;
    canvas.height = root.clientHeight;
    const ctx = canvas.getContext("2d");
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function blot(x, y, v) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const r = 30 + Math.min(v, 30) * 1.1;
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    for (let k = 0; k < 4; k++) {
      const ox = x + (Math.random() - 0.5) * r * 0.7;
      const oy = y + (Math.random() - 0.5) * r * 0.7;
      const rr = r * (0.5 + Math.random() * 0.6);
      const g = ctx.createRadialGradient(ox, oy, rr * 0.25, ox, oy, rr);
      g.addColorStop(0, "rgba(0,0,0,1)");
      g.addColorStop(0.7, "rgba(0,0,0,.85)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(ox, oy, rr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function strokeTo(x, y, real) {
    const last = lastRef.current;
    if (last) {
      const dx = x - last.x;
      const dy = y - last.y;
      const d = Math.hypot(dx, dy);
      const steps = Math.max(1, Math.floor(d / 12));
      for (let i = 1; i <= steps; i++) blot(last.x + (dx * i) / steps, last.y + (dy * i) / steps, d);
    } else {
      blot(x, y, 0);
    }
    lastRef.current = { x, y };
    if (real) setHintGone(true);
  }

  useEffect(() => {
    sizeCanvas();
    const onResize = () => sizeCanvas();
    window.addEventListener("resize", onResize);

    const reduced = prefersReducedMotion();
    if (!reduced) {
      const loop = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          ctx.globalCompositeOperation = "source-over";
          ctx.fillStyle = "rgba(0,0,0,.012)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    }

    let demoTimer;
    let demoInterval;
    if (!reduced) {
      demoTimer = setTimeout(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const w = canvas.width;
        const h = canvas.height;
        const desk = isDesktop();
        let i = 0;
        demoInterval = setInterval(() => {
          const t = i / 40;
          if (desk) blot(w * (0.07 + Math.sin(t * 6.3) * 0.025), h * (0.18 + 0.64 * t), 14);
          else blot(w * (0.15 + 0.7 * t), heroTopRef.current.y * 0.5 + Math.sin(t * 6.3) * heroTopRef.current.y * 0.14, 14);
          i++;
          if (i > 40) clearInterval(demoInterval);
        }, 22);
      }, 700);
    }

    return () => {
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      clearTimeout(demoTimer);
      clearInterval(demoInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePointer(e, real) {
    if (e.pointerType === "touch" && e.type === "pointermove" && !e.buttons && e.pressure === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const r = canvas.getBoundingClientRect();
    strokeTo(e.clientX - r.left, e.clientY - r.top, real);
  }

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 overflow-hidden"
      style={{ touchAction: "none", cursor: "crosshair" }}
      onPointerDown={(e) => {
        lastRef.current = null;
        handlePointer(e, true);
      }}
      onPointerMove={(e) => handlePointer(e, true)}
      onPointerUp={() => (lastRef.current = null)}
      onPointerLeave={() => (lastRef.current = null)}
    >
      <div className="tt-wall" aria-hidden="true" style={{ "--wc": wall.cols }}>
        {Array.from({ length: wall.count }).map((_, i) => (
          <div key={i} dangerouslySetInnerHTML={{ __html: letterArt(LETTERS[i % 26], i * 3 + 1) }} />
        ))}
      </div>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className={`tt-inkhint ${hintGone ? "tt-inkhint-gone" : ""}`}>Psst. Rub the screen 👀</div>
    </div>
  );
}
