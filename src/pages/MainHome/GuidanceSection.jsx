import { useNavigate } from "react-router-dom";
import { MotionConfig, motion } from "framer-motion";
import CtaButton from "./CtaButton";
import { mentorship, portfolio_review } from "../../assets/images/Home_images";

const CARDS = [
  {
    id: "mentorship",
    title: "Mentorship Programme",
    desc: "Get personalised guidance to define your direction, identify the right roles, and build a plan to get there.",
    image: mentorship,
    path: "/mentorship"
  },
  {
    id: "portfolio-review",
    title: "Portfolio Review",
    desc: "Get an expert assessment of your portfolio, with clear feedback on what’s working, what’s missing, and what to improve.",
    image: portfolio_review,
    path: "/portfolio-review"
  }
];

const EASE = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } }
};

const GuidanceSection = () => {
  const navigate = useNavigate();

  return (
    <MotionConfig reducedMotion="user">
      <section className="w-full bg-evolve-yellow px-6 md:px-[8.7vw] py-14 md:py-[clamp(72px,7vw,140px)]">
        <motion.div
          className="max-w-[1600px] mx-auto"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={{ show: { transition: { staggerChildren: 0.12 } } }}
        >
          <motion.h2
            variants={fadeUp}
            className="font-extrabold text-evolve-black"
            style={{
              fontSize: "clamp(44px, 3.4vw, 64px)",
              lineHeight: 1,
              letterSpacing: "-0.04em"
            }}
          >
            Need dedicated
            <br className="md:hidden" /> 1:1 guidance?
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mt-6 md:mt-[clamp(20px,1.8vw,32px)] font-medium text-evolve-black max-w-[340px] md:max-w-none"
            style={{ fontSize: "clamp(20px, 1.85vw, 36px)", lineHeight: 1.35 }}
          >
            Accelerate your career with targeted, senior-led feedback on demand.
          </motion.p>

          <div className="mt-10 md:mt-[clamp(40px,4vw,80px)] grid grid-cols-1 md:grid-cols-2 gap-11 md:gap-[clamp(32px,3.1vw,60px)]">
            {CARDS.map((card) => (
              <motion.article
                key={card.id}
                variants={fadeUp}
                className="group flex flex-col border border-black rounded-[16px] md:rounded-[clamp(16px,1.2vw,24px)] overflow-hidden bg-evolve-yellow"
              >
                <div className="border-b border-black overflow-hidden">
                  <img
                    src={card.image}
                    alt=""
                    loading="lazy"
                    draggable={false}
                    className="w-full h-auto block select-none transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                </div>

                <div className="flex flex-col items-start flex-1 px-7 pt-12 pb-10 md:px-[clamp(28px,2.8vw,54px)] md:pt-[clamp(36px,3.4vw,64px)] md:pb-[clamp(40px,3.6vw,68px)]">
                  <h3
                    className="font-extrabold text-evolve-black"
                    style={{
                      fontSize: "clamp(30px, 2.3vw, 44px)",
                      lineHeight: 1.05,
                      letterSpacing: "-0.03em"
                    }}
                  >
                    {card.title}
                  </h3>
                  <p
                    className="mt-4 md:mt-[clamp(16px,1.8vw,34px)] text-evolve-black max-w-[520px] flex-1"
                    style={{
                      fontSize: "clamp(18px, 1.35vw, 26px)",
                      lineHeight: 1.5
                    }}
                  >
                    {card.desc}
                  </p>
                  <div className="mt-12 md:mt-[clamp(32px,3.3vw,64px)]">
                    <CtaButton onClick={() => navigate(card.path)}>
                      Know more
                    </CtaButton>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </section>
    </MotionConfig>
  );
};

export default GuidanceSection;
