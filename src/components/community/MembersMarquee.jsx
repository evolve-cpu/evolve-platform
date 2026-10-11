import { marquee_vector_2 } from "../../assets/images/Nav";

const MARQUEE_CSS = `
@keyframes members-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.members-marquee { animation: members-marquee 20s linear infinite; }
@media (prefers-reduced-motion: reduce) { .members-marquee { animation: none; } }
`;

// Lavender band from the mentorship page (MarqueeStrip), as a static block
// rather than pinned to the bottom of a hero.
const Group = ({ label }) => (
  <div className="flex items-center flex-none gap-8 pr-8 md:gap-14 md:pr-14">
    {[0, 1, 2, 3].map((i) => (
      <div key={i} className="flex items-center flex-none gap-8 md:gap-14">
        <img src={marquee_vector_2} alt="" className="w-auto flex-none h-10 md:h-[5rem]" />
        <span className="flex-none font-paralucent text-evolve-yellow text-3xl md:text-5xl">
          {label}
        </span>
      </div>
    ))}
  </div>
);

const MembersMarquee = ({ label }) => (
  <section
    aria-label={label}
    className="relative w-full h-24 md:h-[7rem] border-y-2 border-black bg-evolve-lavender-indigo overflow-hidden flex items-center"
  >
    <style>{MARQUEE_CSS}</style>
    <div className="members-marquee flex w-max whitespace-nowrap" aria-hidden="true">
      <Group label={label} />
      <Group label={label} />
    </div>
  </section>
);

export default MembersMarquee;
