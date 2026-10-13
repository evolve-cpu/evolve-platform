import { useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { community as COPY } from "../../content";
import {
  ama_poster_1,
  ama_poster_2,
  ama_poster_3,
  ama_poster_4,
  activities_poster_1,
  activities_poster_2,
  activities_poster_3,
  activities_poster_4,
  activities_poster_5,
  book_1,
  book_2,
  book_3,
  book_4,
  ama_poster_5,
  ama_poster_6
} from "../../assets/images/Community";

// Posters per tab, in the same order as COPY.cards (AMA, Activities, Bookclub).
// `framed` posters get the thin pink border; book covers sit bare.
const TAB_MEDIA = [
  {
    id: "ama",
    framed: true,
    images: [
      ama_poster_1,
      ama_poster_2,
      ama_poster_3,
      ama_poster_4,
      ama_poster_5,
      ama_poster_6
    ]
  },
  {
    id: "activities",
    framed: true,
    images: [
      activities_poster_1,
      activities_poster_2,
      activities_poster_3,
      // activities_poster_4
      activities_poster_5
    ]
  },
  { id: "bookclub", framed: false, images: [book_1, book_2, book_3, book_4] }
];

const TABS = COPY.cards.map((card, i) => ({ ...card, ...TAB_MEDIA[i] }));

const EASE = [0.22, 1, 0.36, 1];

const MARQUEE_CSS = `
@keyframes community-posters { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.community-posters { animation: community-posters var(--marquee-duration) linear infinite; }
.community-posters:hover { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) { .community-posters { animation: none; } }
`;

// Continuous right-to-left strip. The poster set is repeated so one copy is
// always wider than the viewport, then doubled so translating -50% loops.
const PosterMarquee = ({ images, framed, className = "" }) => {
  const set = [...images, ...images];
  return (
    <div className={`overflow-hidden ${className}`}>
      <div
        className="community-posters flex w-max"
        style={{ "--marquee-duration": `${set.length * 5}s` }}
      >
        {[0, 1].map((copy) => (
          <div
            key={copy}
            aria-hidden={copy === 1}
            className="flex flex-none gap-6 pr-6 md:gap-[clamp(20px,1.7vw,32px)] md:pr-[clamp(20px,1.7vw,32px)]"
          >
            {set.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                loading="lazy"
                draggable={false}
                className={`flex-none w-auto select-none h-[280px] md:h-[clamp(260px,22.5vw,440px)] ${
                  framed ? "border border-evolve-pink" : ""
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const TabCopy = ({ tab }) => (
  <>
    <h2
      className="font-extrabold text-evolve-pink"
      style={{
        fontSize: "clamp(48px, 7vw, 136px)",
        lineHeight: 1,
        letterSpacing: "-0.04em"
      }}
    >
      {tab.title}
    </h2>
    <p
      className="mt-4 md:mt-[clamp(16px,2vw,36px)] font-bold text-evolve-black"
      style={{ fontSize: "clamp(20px, 1.9vw, 36px)", lineHeight: 1.2 }}
    >
      {tab.subtitle}
    </p>
    <p className="mt-5 md:mt-[clamp(16px,1.8vw,32px)] mx-auto text-evolve-black md:hidden max-w-[320px] text-[16px] leading-[1.3]">
      {tab.descriptionMobile}
    </p>
    <p
      className="hidden md:block mt-[clamp(16px,1.8vw,32px)] mx-auto text-evolve-black max-w-[clamp(560px,46vw,880px)]"
      style={{ fontSize: "clamp(16px, 1.25vw, 24px)", lineHeight: 1.3 }}
    >
      {tab.descriptionDesktop}
    </p>
  </>
);

/* ------------------------------ Desktop: tabs ------------------------------ */
const DesktopShowcase = () => {
  const [activeId, setActiveId] = useState(TABS[0].id);
  const active = TABS.find((t) => t.id === activeId);

  return (
    <div className="relative w-full max-w-[1800px] mx-auto">
      {/* Folder-style tab strip sitting on top of the card */}
      <div
        role="tablist"
        aria-label="Community activities"
        className="relative z-[2] mx-auto w-[69%] bg-evolve-yellow rounded-t-[clamp(20px,1.6vw,32px)] flex items-center p-[clamp(10px,1vw,18px)] pb-0 -mb-px"
      >
        {TABS.map((tab) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls="community-showcase-panel"
              onClick={() => setActiveId(tab.id)}
              className={`relative flex-1 rounded-[clamp(14px,1.1vw,20px)] font-bold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-black ${
                isActive ? "text-white" : "text-[#806804] hover:text-black"
              }`}
              style={{
                fontSize: "clamp(16px, 1.4vw, 28px)",
                paddingBlock: "clamp(12px, 1.4vw, 26px)"
              }}
            >
              {isActive && (
                <motion.span
                  layoutId="community-tab-pill"
                  className="absolute inset-0 rounded-[inherit] bg-evolve-pink"
                  transition={{ type: "spring", stiffness: 420, damping: 36 }}
                />
              )}
              <span className="relative">{tab.title}</span>
            </button>
          );
        })}
      </div>

      {/* Card */}
      <div
        id="community-showcase-panel"
        role="tabpanel"
        className="relative z-[1] bg-evolve-yellow border border-black rounded-[clamp(28px,2.4vw,48px)] overflow-hidden"
        style={{ marginTop: "calc(-1 * clamp(20px, 1.6vw, 32px))" }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <div className="text-center px-[4vw] pt-[clamp(64px,6vw,120px)] pb-[clamp(72px,7vw,136px)]">
              <TabCopy tab={active} />
            </div>
            <PosterMarquee
              images={active.images}
              framed={active.framed}
              className="mb-[clamp(20px,1.8vw,36px)]"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ---------------------------- Mobile: stacked ----------------------------- */
const MobileShowcase = () => (
  <div className="flex flex-col gap-8">
    {TABS.map((tab) => (
      <motion.article
        key={tab.id}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="bg-evolve-yellow rounded-[24px] pt-12 pb-14 overflow-hidden text-center"
      >
        <div className="px-6">
          <TabCopy tab={tab} />
        </div>
        <PosterMarquee
          images={tab.images}
          framed={tab.framed}
          className="mt-10 pl-6"
        />
      </motion.article>
    ))}
  </div>
);

const CommunityShowcase = () => (
  <MotionConfig reducedMotion="user">
    <style>{MARQUEE_CSS}</style>
    <section className="w-full bg-evolve-pink px-4 md:px-[3vw] py-14 md:py-[clamp(72px,7vw,140px)]">
      <div className="hidden md:block">
        <DesktopShowcase />
      </div>
      <div className="md:hidden">
        <MobileShowcase />
      </div>
    </section>
  </MotionConfig>
);

export default CommunityShowcase;
