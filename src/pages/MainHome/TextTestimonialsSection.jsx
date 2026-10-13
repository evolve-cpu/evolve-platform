import { useState } from "react";
import { noWidow } from "../../lib/noWidow";

// TODO: add the remaining testimonials (Umar Badi, Tanisha Sant, Abdul Fadhil,
// Shivani Saini, and the "evolve community is rare…" one) once the full copy
// is available.
const TEXT_TESTIMONIALS = [
  {
    quote:
      "evolve’s portfolio review gave me clear direction on what was working, what needed improvement, and what to prioritize next. The “What this means” section helped me understand the core problems and revise my portfolio to better align with industry expectations.",
    name: "Ishad Sanjiv Pande",
    role: "Product Designer"
  },
  {
    quote:
      "it was very helpful to attend some of the sessions they were very great and the book club was good! It helped me restart the book reading journey.",
    name: "Siddhartha",
    role: "Designer"
  },
  {
    quote:
      "I discovered evolve through a LinkedIn session and was immediately drawn to its engaging, industry-led approach. Later, I had the opportunity to contribute as a speaker and experienced firsthand how curious and eager new designers are to learn. Evolve creates a safe, accessible space for meaningful industry-led learning.",
    name: "Ankit Passi",
    role: "Deputy Manager (Design) at Deloitte"
  },
  {
    quote:
      "Actually knowing new things in this industry in design wise as well as connections made impacts here have impacted my design journey",
    name: "Jessen Joshua Thomas",
    role: "Graphic Designer"
  },
  {
    quote:
      "evolve has honestly ignited the fun side of design for me again. It’s made me think beyond just creating something and actually engage with new people, ideas and perspectives.",
    name: "Sristi Mehta",
    role: "Freelance Graphic Designer"
  },
  {
    quote:
      "This community has given me a better perspective of the design field, to say the least. There are human beings behind the most creative and stunning portfolios and they are all ready to learn even more than they already have!!",
    name: "Unnati Lalwani",
    role: "Design Student"
  }
];

const MIN_PER_TRACK = 4;

// Split into n groups round-robin so every column/row gets a mix.
const splitInto = (items, n) =>
  Array.from({ length: n }, (_, i) => items.filter((_, j) => j % n === i));

const MARQUEE_CSS = `
@keyframes tt-up    { from { transform: translateY(0); }    to { transform: translateY(-50%); } }
@keyframes tt-down  { from { transform: translateY(-50%); } to { transform: translateY(0); } }
@keyframes tt-left  { from { transform: translateX(0); }    to { transform: translateX(-50%); } }
@keyframes tt-right { from { transform: translateX(-50%); } to { transform: translateX(0); } }
@media (prefers-reduced-motion: reduce) {
  .tt-track { animation: none !important; }
}
`;

const TestimonialCard = ({ t, className = "" }) => (
  <article
    className={`border-2 border-evolve-pink bg-evolve-yellow rounded-[28px] md:rounded-[clamp(28px,2.4vw,48px)] px-6 py-8 md:px-[clamp(32px,3.3vw,64px)] md:py-[clamp(40px,3.9vw,76px)] ${className}`}
  >
    <span
      aria-hidden="true"
      className="block font-extrabold italic text-evolve-pink"
      style={{
        fontSize: "clamp(40px, 3vw, 56px)",
        lineHeight: 0.6,
        height: "0.45em"
      }}
    >
      “
    </span>
    <p
      className="mt-3 md:mt-[clamp(12px,1vw,20px)] font-bold text-evolve-black"
      style={{ fontSize: "clamp(14px, 1.3vw, 24px)", lineHeight: 1.25 }}
    >
      {noWidow(t.quote)}
    </p>
    <p
      className="mt-6 md:mt-[clamp(24px,2.7vw,52px)] font-bold text-evolve-black"
      style={{ fontSize: "clamp(14px, 1.3vw, 24px)" }}
    >
      {t.name}
    </p>
    <p
      className="mt-1 text-evolve-black"
      style={{ fontSize: "clamp(13px, 1.25vw, 23px)", lineHeight: 1.3 }}
    >
      {t.role}
    </p>
  </article>
);

/* The list is rendered twice and the track moves by exactly half its length,
   so the loop is seamless. Hovering (desktop) or tapping (mobile) a card
   pauses that track; leaving / tapping again resumes it. */
const MarqueeTrack = ({ items, direction, duration, vertical }) => {
  const [paused, setPaused] = useState(false);
  // Pad short lists so one half of the loop always overflows the viewport.
  const base = Array.from(
    { length: Math.ceil(MIN_PER_TRACK / items.length) },
    () => items
  ).flat();
  const loop = [...base, ...base];

  return (
    <div
      className={vertical ? "h-full overflow-hidden" : "w-full overflow-hidden"}
      onMouseEnter={vertical ? () => setPaused(true) : undefined}
      onMouseLeave={vertical ? () => setPaused(false) : undefined}
      onClick={vertical ? undefined : () => setPaused((p) => !p)}
    >
      <div
        className={`tt-track flex ${vertical ? "flex-col" : "flex-row w-max"}`}
        style={{
          animation: `tt-${direction} ${duration}s linear infinite`,
          animationPlayState: paused ? "paused" : "running"
        }}
      >
        {loop.map((t, i) => (
          <div
            key={`${t.name}-${i}`}
            aria-hidden={i >= base.length ? "true" : undefined}
            className={
              vertical
                ? "pb-[clamp(24px,2.1vw,40px)]"
                : "pr-4 w-[78vw] max-w-[340px] shrink-0"
            }
          >
            <TestimonialCard t={t} className={vertical ? "" : "h-full"} />
          </div>
        ))}
      </div>
    </div>
  );
};

const TextTestimonialsSection = () => {
  const columns = splitInto(TEXT_TESTIMONIALS, 3);
  const rows = splitInto(TEXT_TESTIMONIALS, 2);

  return (
    <section className="w-full bg-evolve-yellow overflow-hidden">
      <style>{MARQUEE_CSS}</style>

      {/* Desktop: three columns — up, down, up */}
      <div
        className="hidden md:grid grid-cols-3 gap-[clamp(32px,3.9vw,76px)] max-w-[1590px] mx-auto px-[8.6vw]"
        style={{ height: "clamp(720px, 62vw, 1200px)" }}
      >
        {columns.map((col, i) => (
          <MarqueeTrack
            key={i}
            items={col}
            vertical
            direction={i === 1 ? "down" : "up"}
            duration={36 + i * 6}
          />
        ))}
      </div>

      {/* Mobile: two rows, both left→right */}
      <div className="md:hidden flex flex-col gap-4 py-14">
        {rows.map((row, i) => (
          <MarqueeTrack
            key={i}
            items={row}
            direction="right"
            duration={28 + i * 4}
          />
        ))}
      </div>
    </section>
  );
};

export default TextTestimonialsSection;
