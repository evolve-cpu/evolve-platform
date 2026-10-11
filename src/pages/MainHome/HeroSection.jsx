import {
  Hero_bottom,
  Hero_left,
  Hero_left_mobile,
  Hero_right,
  Hero_right_mobile,
  rays,
  rays_mobile,
  right_arrow_yellow
} from "../../assets/images/Home_images";

const HeroSection = ({ onStart }) => (
  <section className="relative w-full min-h-[100svh] md:min-h-screen bg-evolve-yellow overflow-hidden flex items-center justify-center">
    {/* Rays */}
    <img
      src={rays}
      alt=""
      aria-hidden="true"
      className="md:block absolute bottom-0 left-0 w-full h-full object-cover object-bottom z-0 pointer-events-none select-none"
    />
    {/* <img
      src={rays_mobile}
      alt=""
      aria-hidden="true"
      className="md:hidden absolute bottom-0 left-0 w-full h-full object-cover object-bottom z-0 pointer-events-none select-none"
    /> */}

    {/* Bottom arc (desktop) */}
    <img
      src={Hero_bottom}
      alt=""
      aria-hidden="true"
      className="hidden md:block absolute top-[80%] left-1/2 -translate-x-1/2 w-[110vw] max-w-none h-auto z-[1] pointer-events-none select-none"
    />

    {/* Bottom arc (mobile) */}
    <img
      src={Hero_bottom}
      alt=""
      aria-hidden="true"
      className="md:hidden absolute bottom-0 left-1/2 -translate-x-1/2 w-[200vw] max-w-none h-auto z-[1] pointer-events-none select-none"
    />

    {/* Side illustrations (desktop) */}
    <img
      src={Hero_left}
      alt=""
      aria-hidden="true"
      className="hidden md:block absolute bottom-0 left-0 z-[2] h-auto pointer-events-none select-none md:w-[29vw]"
    />
    <img
      src={Hero_right}
      alt=""
      aria-hidden="true"
      className="hidden md:block absolute bottom-0 right-0 z-[2] h-auto pointer-events-none select-none md:w-[31.5vw]"
    />

    {/* Side illustrations (mobile) */}
    <img
      src={Hero_left_mobile}
      alt=""
      aria-hidden="true"
      className="md:hidden absolute bottom-0 left-0 z-[2] w-[45vw] h-auto pointer-events-none select-none"
    />
    <img
      src={Hero_right_mobile}
      alt=""
      aria-hidden="true"
      className="md:hidden absolute bottom-0 right-0 z-[2] w-[45vw] h-auto pointer-events-none select-none"
    />

    {/* Copy */}
    <div className="relative z-[3] flex flex-col items-center text-center px-6 pt-20 pb-[26svh] md:pt-24 md:pb-16 max-w-[1100px]">
      <h1
        className="font-extrabold text-evolve-pink"
        style={{
          fontSize: "clamp(44px, 5vw, 96px)",
          lineHeight: 0.9,
          letterSpacing: "-0.03em"
        }}
      >
        Empowering designers to shape a better world.
      </h1>

      <p
        className="mt-6 font-medium text-black max-w-[560px]"
        style={{
          fontSize: "clamp(18px, 1.67vw, 28px)",
          lineHeight: 1.2
        }}
      >
        The all-in-one platform to learn, track
        <br />
        and excel in your design journey
      </p>

      <button
        type="button"
        onClick={onStart}
        className="mt-10 inline-flex items-center gap-3 rounded-[16px] bg-black text-evolve-yellow border border-evolve-yellow font-semibold px-8 py-4 shadow-[4px_4px_0px_#806804] transition-transform duration-150 hover:translate-x-[2px] hover:translate-y-[2px]  active:translate-x-[6px] active:translate-y-[6px] active:shadow-none"
        style={{ fontSize: "clamp(16px, 1.25vw, 20px)" }}
      >
        Start for free
        <img
          src={right_arrow_yellow}
          alt=""
          className="w-5 h-5 md:w-6 md:h-6"
        />
      </button>
    </div>
  </section>
);

export default HeroSection;
