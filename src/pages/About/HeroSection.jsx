import { rays } from "../../assets/images/Home_images";
import { vector, vector_mobile } from "../../assets/images/About";

const HeroSection = () => (
  <section className="relative w-full min-h-[100svh] md:min-h-[47vw] bg-evolve-yellow overflow-hidden flex items-center justify-center">
    {/* Rays */}
    <img
      src={rays}
      alt=""
      aria-hidden="true"
      className="absolute inset-0 w-full h-full object-cover object-bottom z-0 pointer-events-none select-none"
    />

    {/* Bottom arc (desktop) */}
    <img
      src={vector}
      alt=""
      aria-hidden="true"
      className="hidden md:block absolute bottom-0 left-0 w-full h-auto z-[1] pointer-events-none select-none"
    />

    {/* Bottom arc (mobile) */}
    <img
      src={vector_mobile}
      alt=""
      aria-hidden="true"
      className="md:hidden absolute bottom-0 left-0 w-full h-auto z-[1] pointer-events-none select-none"
    />

    {/* Copy */}
    <div className="relative z-[2] flex flex-col items-center text-center px-6 pt-20 pb-[30vw] md:pt-24 md:pb-[10vw] max-w-[1100px]">
      <h1
        className="font-extrabold text-evolve-pink"
        style={{
          fontSize: "clamp(44px, 4.4vw, 84px)",
          lineHeight: 0.95,
          letterSpacing: "-0.03em"
        }}
      >
        A design growth ecosystem
      </h1>

      <p
        className="mt-6 font-medium text-black max-w-[300px] md:max-w-[640px]"
        style={{
          fontSize: "clamp(18px, 1.67vw, 28px)",
          lineHeight: 1.25
        }}
      >
        evolve brings designers together on one platform - creating a space to
        learn, connect, share, and grow.
      </p>
    </div>
  </section>
);

export default HeroSection;
