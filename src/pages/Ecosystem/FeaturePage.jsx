import { MotionConfig, motion } from "framer-motion";
import SEO from "../../components/SEO";
import EvolveMarquee from "../About/EvolveMarquee";
import { noWidow } from "../../lib/noWidow";

const EASE = [0.22, 1, 0.36, 1];

// Shared layout for the ecosystem feature pages (Profile creation, Grow):
// centred hero copy, a row of feature cards (stacked on mobile), optional
// CTA, then the flat evolve marquee above the footer.
// `variant="compact"` renders the smaller icon-tile visuals used on Grow.
const FeaturePage = ({
  seo,
  eyebrow,
  title,
  intro,
  features,
  variant = "full",
  action
}) => {
  const compact = variant === "compact";

  return (
    <>
      <SEO {...seo} />
      <MotionConfig reducedMotion="user">
        <main className="w-full overflow-x-hidden bg-evolve-yellow">
          <section className="px-6 md:px-[4vw] pt-[clamp(120px,12vw,220px)] pb-16 md:pb-[clamp(80px,7vw,140px)]">
            <motion.header
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="mx-auto max-w-[1100px] flex flex-col items-center text-center"
            >
              {eyebrow && (
                <p
                  className="mb-6 md:mb-[clamp(20px,2vw,36px)] font-extrabold text-black"
                  style={{ fontSize: "clamp(20px, 1.6vw, 30px)" }}
                >
                  {eyebrow}
                </p>
              )}
              <h1
                className="font-extrabold text-evolve-pink"
                style={{
                  fontSize: "clamp(40px, 4.4vw, 84px)",
                  lineHeight: 1,
                  letterSpacing: "-0.04em"
                }}
              >
                {title}
              </h1>
              <p
                className="mt-5 md:mt-[clamp(16px,1.4vw,28px)] font-medium text-black max-w-[880px]"
                style={{
                  fontSize: "clamp(18px, 1.67vw, 30px)",
                  lineHeight: 1.3
                }}
              >
                {noWidow(intro)}
              </p>
            </motion.header>

            <div
              className={`mx-auto mt-16 md:mt-[clamp(64px,6vw,120px)] grid grid-cols-1 md:grid-cols-3 ${
                compact
                  ? "max-w-[1300px] gap-16 md:gap-[3vw]"
                  : "max-w-[1640px] gap-14 md:gap-[2.6vw]"
              }`}
            >
              {features.map((f, i) => (
                <motion.article
                  key={f.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.55, ease: EASE, delay: i * 0.1 }}
                  className="flex flex-col items-center text-center"
                >
                  <motion.img
                    src={f.image}
                    alt={`${f.title} preview`}
                    loading="lazy"
                    draggable={false}
                    whileHover={{ y: -6, rotate: compact ? -2 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`h-auto select-none ${
                      compact
                        ? "w-[62%] max-w-[300px] md:w-[clamp(200px,14vw,280px)]"
                        : "w-full max-w-[560px]"
                    }`}
                  />
                  <h2
                    className="mt-6 md:mt-[clamp(20px,1.8vw,36px)] font-extrabold text-black"
                    style={{
                      fontSize: "clamp(24px, 1.6vw, 32px)",
                      lineHeight: 1.15,
                      letterSpacing: "-0.02em"
                    }}
                  >
                    {f.title}
                  </h2>
                  <p
                    className="mt-3 text-black max-w-[440px]"
                    style={{
                      fontSize: "clamp(18px, 1.3vw, 24px)",
                      lineHeight: 1.4
                    }}
                  >
                    {noWidow(f.desc)}
                  </p>
                </motion.article>
              ))}
            </div>

            {action && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: EASE }}
                className="mt-16 md:mt-[clamp(56px,5vw,96px)] flex justify-center"
              >
                {action}
              </motion.div>
            )}
          </section>

          <EvolveMarquee />
        </main>
      </MotionConfig>
    </>
  );
};

export default FeaturePage;
