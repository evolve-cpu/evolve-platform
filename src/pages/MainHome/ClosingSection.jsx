import { motion, MotionConfig } from "framer-motion";
import CtaButton from "./CtaButton";
import {
  evolve_text,
  marquee_vector_1,
  marquee_vector_2
} from "../../assets/images/Nav";

const MARQUEE_CSS = `
@keyframes closing-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@media (prefers-reduced-motion: reduce) { .closing-marquee { animation: none !important; } }
`;

// One repeatable unit of the strip; rendered several times, then the whole
// strip is doubled so translating by -50% loops seamlessly.
const MarqueeGroup = () => (
  <div className="flex items-center flex-none gap-10 pr-10 md:gap-16 md:pr-16">
    {[marquee_vector_1, marquee_vector_2].map((vector, i) => (
      <div key={i} className="flex items-center flex-none gap-10 md:gap-16">
        <img
          src={evolve_text}
          alt=""
          className="h-12 md:h-[clamp(64px,5.6vw,108px)] w-auto flex-none"
        />
        <img
          src={vector}
          alt=""
          className="h-12 md:h-[clamp(56px,4.4vw,84px)] w-auto flex-none"
        />
      </div>
    ))}
  </div>
);

const ClosingSection = ({ onStart }) => (
  <MotionConfig reducedMotion="user">
    <section className="relative w-full min-h-[80svh] md:min-h-screen bg-evolve-lavender-indigo border-y-2 border-evolve-yellow overflow-hidden flex flex-col">
      <style>{MARQUEE_CSS}</style>

      <motion.div
        className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2
          className="font-extrabold text-white max-w-[1100px]"
          style={{
            fontSize: "clamp(32px, 3.4vw, 64px)",
            lineHeight: 1.05,
            letterSpacing: "-0.03em"
          }}
        >
          We’re here to change how you think,
          <br className="hidden md:block" /> so you’ll never see the world, the
          <br className="hidden md:block" /> same way again.
        </h2>

        <div className="mt-10 md:mt-[clamp(32px,3.2vw,60px)]">
          <CtaButton onClick={onStart}>Start for free</CtaButton>
        </div>
      </motion.div>

      {/* evolve marquee */}
      <div
        aria-hidden="true"
        className="w-full border-t-2 border-evolve-yellow overflow-hidden py-6 md:py-[clamp(24px,2.4vw,48px)]"
      >
        <div
          className="closing-marquee flex w-max"
          style={{ animation: "closing-marquee 24s linear infinite" }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <MarqueeGroup key={i} />
          ))}
        </div>
      </div>
    </section>
  </MotionConfig>
);

export default ClosingSection;
