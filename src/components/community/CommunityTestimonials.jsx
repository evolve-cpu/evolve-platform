import { useRef, useState } from "react";

const TESTIMONIALS = [
  {
    quote:
      "evolve has honestly ignited the fun side of design for me again. It’s made me think beyond just creating something and actually engage with new people, ideas and perspectives. I’ve really enjoyed seeing how differently people can approach the same thing, while still finding so many common points in how we think. That exchange of perspectives has probably been one of the biggest things I’ve taken away from evolve so far.",
    name: "Srishti Mehta",
    role: "Freelance Graphic Designer"
  },
  {
    quote:
      "Actually knowing new things in this industry in design wise as well as connections made impacts here have impacted my design journey.",
    name: "Jessen Joshua Thomas",
    role: "Graphic Designer"
  },
  {
    quote:
      "This community has given me a better perspective of the design field, to say the least. There are human beings behind the most creative and stunning portfolios and they are all ready to learn even more than they already have!!",
    name: "Unnati Lalwani",
    role: "Design Student"
  },
  {
    quote:
      "It’s great to see a community that is consistently creating opportunities for designers to learn, connect, get feedback, and grow. I genuinely appreciate the work Evolve is doing for the design community.",
    name: "Umar Badi",
    role: "Junior Product Designer"
  },
  {
    quote:
      "It was very helpful to attend some of the sessions, they were very great and the book club was good! It helped me restart the book reading journey.",
    name: "Siddhartha",
    role: "Designer"
  }
];

const N = TESTIMONIALS.length;
// three copies so there is always a card on either side; after a move into
// the outer copies the track snaps back to the middle one without animating
const SLIDES = [...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS];
const DURATION = 550;

const Chevron = ({ dir }) => (
  <svg
    viewBox="0 0 24 24"
    className="w-8 h-8 md:w-10 md:h-10"
    aria-hidden="true"
  >
    <path
      d={dir === "left" ? "M15 4l-8 8 8 8" : "M9 4l8 8-8 8"}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowButton = ({ dir, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={dir === "left" ? "Previous testimonial" : "Next testimonial"}
    className={`group grid place-items-center w-12 h-12 md:w-14 md:h-14 rounded-full text-white transition-colors duration-200 md:hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white`}
  >
    <span
      className={`transition-transform duration-200 ${
        dir === "left"
          ? "md:group-hover:-translate-x-1"
          : "md:group-hover:translate-x-1"
      }`}
    >
      <Chevron dir={dir} />
    </span>
  </button>
);

const Card = ({ t }) => (
  <article className="flex-none w-[var(--card-w)] flex flex-col rounded-[40px] bg-evolve-yellow text-evolve-black px-10 pt-14 pb-14 md:px-[clamp(32px,4.4vw,88px)] md:pt-[clamp(40px,4.8vw,92px)] md:pb-[clamp(40px,4.8vw,92px)] md:min-h-[clamp(460px,32vw,640px)]">
    <span
      aria-hidden="true"
      className="block font-extrabold text-evolve-pink leading-none h-[34px] md:h-[clamp(36px,2.6vw,52px)] overflow-hidden"
      style={{ fontSize: "clamp(80px, 5vw, 100px)" }}
    >
      “
    </span>
    <blockquote
      className="mt-4 md:mt-[clamp(20px,1.8vw,34px)] font-bold line-clamp-[11]"
      style={{ fontSize: "clamp(22px, 1.3vw, 25px)", lineHeight: 1.25 }}
    >
      {t.quote}
    </blockquote>
    <footer className="mt-auto pt-8">
      <p
        className="font-bold"
        style={{ fontSize: "clamp(15px, 1.05vw, 20px)" }}
      >
        {t.name}
      </p>
      <p className="mt-1" style={{ fontSize: "clamp(15px, 1.05vw, 20px)" }}>
        {t.role}
      </p>
    </footer>
  </article>
);

const CommunityTestimonials = () => {
  const [pos, setPos] = useState(N);
  const [animate, setAnimate] = useState(true);
  const busy = useRef(false);
  const touchX = useRef(null);

  const go = (next) => {
    if (busy.current) return;
    busy.current = true;
    setTimeout(() => (busy.current = false), DURATION + 100);
    setAnimate(true);
    setPos(next);
  };

  const onTransitionEnd = (e) => {
    if (e.target !== e.currentTarget) return;
    busy.current = false;
    if (pos < N || pos >= 2 * N) {
      setAnimate(false);
      setPos(N + ((((pos - N) % N) + N) % N));
    }
  };

  const active = (((pos - N) % N) + N) % N;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Community testimonials"
      className="w-full bg-evolve-pink overflow-hidden py-16 md:py-[clamp(80px,7.5vw,144px)]"
    >
      <h2
        className="px-6 text-center font-extrabold text-white max-w-[320px] md:max-w-none mx-auto"
        style={{
          fontSize: "clamp(40px, 3.2vw, 60px)",
          lineHeight: 1.05,
          letterSpacing: "-0.03em"
        }}
      >
        Hear from our community members
      </h2>

      {/* --card-w / --gap / --offset place the active card: centred alone on
          mobile, as the left one of a centred pair on desktop */}
      <div
        className="mt-10 md:mt-[clamp(48px,4.2vw,80px)] [--card-w:calc(100vw-24px)] [--gap:12px] [--offset:12px] md:[--card-w:clamp(360px,25vw,500px)] md:[--gap:24px] md:[--offset:calc(50vw-var(--card-w)-var(--gap)/2)]"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current == null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) > 40) go(pos + (dx < 0 ? 1 : -1));
        }}
      >
        <div
          className="flex gap-[var(--gap)]"
          onTransitionEnd={onTransitionEnd}
          style={{
            transform: `translateX(calc(var(--offset) - ${pos} * (var(--card-w) + var(--gap))))`,
            transition: animate
              ? `transform ${DURATION}ms cubic-bezier(0.22, 1, 0.36, 1)`
              : "none"
          }}
        >
          {SLIDES.map((t, i) => (
            <div key={i} aria-hidden={i !== pos} className="contents">
              <Card t={t} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 md:mt-[clamp(32px,2.6vw,52px)] mx-auto flex items-center justify-between px-6 max-w-[440px] md:max-w-[clamp(560px,36vw,720px)]">
        <ArrowButton dir="left" onClick={() => go(pos - 1)} />
        <div className="flex items-center gap-2 md:gap-3">
          {TESTIMONIALS.map((t, i) => (
            <button
              key={t.name}
              type="button"
              aria-label={`Show testimonial ${i + 1}`}
              aria-current={i === active}
              onClick={() => i !== active && go(N + i)}
              className={`h-3 md:h-4 rounded-full transition-all duration-300 ${
                i === active
                  ? "w-3 md:w-4 bg-evolve-yellow"
                  : "w-3 md:w-4 bg-[#7A0049] hover:bg-[#9b0060]"
              }`}
            />
          ))}
        </div>
        <ArrowButton dir="right" onClick={() => go(pos + 1)} />
      </div>
    </section>
  );
};

export default CommunityTestimonials;
