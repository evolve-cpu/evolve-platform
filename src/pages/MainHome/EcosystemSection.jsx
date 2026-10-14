import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import CtaButton from "./CtaButton";
import {
  my_profile,
  grow,
  events,
  community
} from "../../assets/images/Home_images";
import { noWidow } from "../../lib/noWidow";

const DISCORD_URL = "https://discord.gg/MmfaqCPdF7";

const TABS = [
  {
    id: "profile",
    label: "My Profile",
    image: my_profile,
    tagline: "Make Your Skill Growth Visible.",
    desc: "Stop letting your capabilities stay hidden behind portfolios and static PDFs. Build a living, verified profile that proves your design momentum with real competency data.",
    cta: "Know more",
    path: "/profile-creation"
  },
  {
    id: "events",
    label: "Events",
    image: events,
    tagline: "Learn real-world practices from industry leaders.",
    desc: "Join live sessions, AMAs and workshops with practising designers. Ask questions, see how real work gets done, and catch up on recordings whenever you need them.",
    cta: "Know more",
    path: "/events"
  },
  {
    id: "community",
    label: "Community",
    image: community,
    tagline: "Connect with an ambitious network of peers.",
    desc: "Meet designers who are as driven as you are. From AMAs and bookclubs to in-person activities, find the people who will push your work and your thinking forward.",
    cta: "Join community",
    // href: DISCORD_URL
    path: "/community"
  },
  {
    id: "grow",
    label: "Grow",
    image: grow,
    tagline: "5 Minutes a Day. Continuous Career Growth.",
    desc: "No endless courses or burnt-out schedules. Build an unstoppable daily habit with bite-sized lessons, instant quizzes, and curated industry news",
    cta: "Know more",
    path: "/grow"
  }
];

const EASE = [0.22, 1, 0.36, 1];

// Coming-soon tabs get a label instead of a button; `href` tabs open externally.
const TabAction = ({ tab, onNavigate }) =>
  tab.comingSoon ? (
    <p
      className="font-extrabold text-black"
      style={{ fontSize: "clamp(20px, 1.5vw, 28px)" }}
    >
      Coming soon...
    </p>
  ) : (
    <CtaButton
      href={tab.href}
      onClick={tab.href ? undefined : () => onNavigate(tab.path)}
    >
      {tab.cta}
    </CtaButton>
  );

/* ------------------------------ Desktop: tabs ------------------------------ */
const DesktopEcosystem = ({ onNavigate }) => {
  const [activeId, setActiveId] = useState(TABS[0].id);
  const active = TABS.find((t) => t.id === activeId);

  return (
    <div className="relative w-full max-w-[1480px] mx-auto mt-[clamp(40px,3.4vw,64px)]">
      {/* Folder-style tab strip sitting on top of the card */}
      <div
        role="tablist"
        aria-label="Evolve ecosystem"
        className="relative z-[2] mx-auto w-[79.5%] bg-evolve-yellow rounded-t-[clamp(20px,1.6vw,32px)] flex items-center p-[clamp(10px,1vw,18px)] pb-0 -mb-px"
      >
        {TABS.map((tab) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls="ecosystem-panel"
              onClick={() => setActiveId(tab.id)}
              className={`relative flex-1 rounded-[clamp(14px,1.1vw,20px)] font-bold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-black ${
                isActive ? "text-white" : "text-[#806804] hover:text-black"
              }`}
              style={{
                fontSize: "clamp(16px, 1.25vw, 24px)",
                paddingBlock: "clamp(12px, 1.2vw, 20px)"
              }}
            >
              {isActive && (
                <motion.span
                  layoutId="ecosystem-tab-pill"
                  className="absolute inset-0 rounded-[inherit] bg-evolve-pink"
                  transition={{ type: "spring", stiffness: 420, damping: 36 }}
                />
              )}
              <span className="relative">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Card */}
      <div
        id="ecosystem-panel"
        role="tabpanel"
        className="relative z-[1] bg-evolve-yellow border border-black rounded-[clamp(28px,2.4vw,48px)] overflow-hidden"
        style={{
          marginTop: "calc(-1 * clamp(20px, 1.6vw, 32px))",
          minHeight: "clamp(440px, 45vw, 780px)"
        }}
      >
        <div
          className="grid grid-cols-2 items-center gap-[4vw] h-full"
          style={{
            minHeight: "inherit",
            padding:
              "clamp(56px, 4.4vw, 88px) clamp(40px, 5vw, 100px) clamp(32px, 2.8vw, 56px)"
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`img-${active.id}`}
              initial={{ opacity: 0, x: -40, scale: 0.96, rotate: -1.5 }}
              animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, x: -24, scale: 0.98 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="flex items-center justify-center"
            >
              <motion.img
                src={active.image}
                alt={`${active.label} preview`}
                className="w-full max-w-[600px] h-auto select-none"
                draggable={false}
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 5,
                  ease: "easeInOut",
                  repeat: Infinity
                }}
              />
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`copy-${active.id}`}
              initial="hidden"
              animate="show"
              exit="exit"
              variants={{
                hidden: {},
                show: {
                  transition: { staggerChildren: 0.08, delayChildren: 0.1 }
                },
                exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
              }}
              className="flex flex-col items-start"
            >
              {[
                <h3
                  key="h"
                  className="font-bold text-black"
                  style={{
                    fontSize: "clamp(24px, 1.9vw, 38px)",
                    lineHeight: 1.2
                  }}
                >
                  {noWidow(active.tagline)}
                </h3>,
                <p
                  key="p"
                  className="mt-[clamp(12px,1.1vw,22px)] text-black max-w-[620px]"
                  style={{
                    fontSize: "clamp(15px, 1.2vw, 23px)",
                    lineHeight: 1.6
                  }}
                >
                  {noWidow(active.desc)}
                </p>,
                <div key="b" className="mt-[clamp(24px,2.6vw,48px)]">
                  <TabAction tab={active} onNavigate={onNavigate} />
                </div>
              ].map((el) => (
                <motion.div
                  key={el.key}
                  variants={{
                    hidden: { opacity: 0, y: 18 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.4, ease: EASE }
                    }
                  }}
                >
                  {el}
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

/* ---------------------------- Mobile: stacked ----------------------------- */
const MobileEcosystem = ({ onNavigate }) => (
  <div className="mt-10 flex flex-col gap-8">
    {TABS.map((tab) => (
      <motion.article
        key={tab.id}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="bg-evolve-yellow rounded-[24px] px-6 pt-8 pb-10"
      >
        <img
          src={tab.image}
          alt={`${tab.label} preview`}
          loading="lazy"
          className="w-full h-auto select-none"
          draggable={false}
        />
        <h3
          className="mt-8 font-extrabold text-evolve-pink"
          style={{
            fontSize: "36px",
            lineHeight: 1.1,
            letterSpacing: "-0.03em"
          }}
        >
          {tab.label}
        </h3>
        <p className="mt-3 text-black text-[22px] leading-[1.3]">
          {noWidow(tab.tagline)}
        </p>
        <div className="mt-8">
          <TabAction tab={tab} onNavigate={onNavigate} />
        </div>
      </motion.article>
    ))}
  </div>
);

const EcosystemSection = () => {
  const navigate = useNavigate();

  return (
    <MotionConfig reducedMotion="user">
      <section className="w-full bg-evolve-pink px-6 md:px-[3vw] py-14 md:py-[clamp(80px,8vw,160px)]">
        <h2
          className="font-extrabold text-white md:text-center"
          style={{
            fontSize: "clamp(48px, 4.6vw, 88px)",
            lineHeight: 1,
            letterSpacing: "-0.04em"
          }}
        >
          The evolve
          <br className="md:hidden" /> ecosystem
        </h2>

        <div className="hidden md:block">
          <DesktopEcosystem onNavigate={navigate} />
        </div>
        <div className="md:hidden">
          <MobileEcosystem onNavigate={navigate} />
        </div>
      </section>
    </MotionConfig>
  );
};

export default EcosystemSection;
