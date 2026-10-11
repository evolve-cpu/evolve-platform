import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import {
  marquee_vector_1,
  marquee_vector_2,
  evolve_text
} from "../../assets/images/Nav";

const ITEMS = [marquee_vector_2, evolve_text, marquee_vector_1, evolve_text];

// Same clone-and-loop approach as the footer marquee, laid flat.
const EvolveMarquee = () => {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const groupRef = useRef(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    const group = groupRef.current;
    if (!container || !track || !group) return;

    let tween = null;

    const start = () => {
      tween?.kill();
      [...track.querySelectorAll("[data-marquee-clone]")].forEach((n) =>
        n.remove()
      );
      gsap.set(track, { x: 0 });

      const groupWidth = group.getBoundingClientRect().width || 1;
      const containerWidth = container.getBoundingClientRect().width || 1;
      const needed = Math.max(2, Math.ceil(containerWidth / groupWidth) + 1);

      for (let i = 0; i < needed; i++) {
        const clone = group.cloneNode(true);
        clone.setAttribute("data-marquee-clone", "1");
        track.appendChild(clone);
      }

      tween = gsap.to(track, {
        x: -groupWidth,
        duration: 10,
        ease: "none",
        repeat: -1
      });
    };

    start();
    const ro = new ResizeObserver(() => requestAnimationFrame(start));
    ro.observe(container);

    return () => {
      tween?.kill();
      ro.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="relative w-full h-20 md:h-[clamp(120px,11vw,220px)] bg-evolve-lavender-indigo overflow-hidden"
    >
      <div
        ref={trackRef}
        className="absolute top-1/2 -translate-y-1/2 left-0 flex whitespace-nowrap"
        style={{ willChange: "transform" }}
      >
        <div
          ref={groupRef}
          className="flex items-center flex-none gap-6 pr-6 md:gap-[3.5vw] md:pr-[3.5vw]"
        >
          {ITEMS.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className={`w-auto flex-none ${
                src === evolve_text
                  ? "h-10 md:h-[clamp(56px,5.2vw,110px)]"
                  : "h-8 md:h-[clamp(44px,4vw,84px)]"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EvolveMarquee;
