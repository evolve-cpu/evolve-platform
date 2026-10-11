import { community as COPY } from "../../content";
import { trackCommunityJoin } from "../../utils/analytics";
import { vector_1, vector_2, vector_3 } from "../../assets/images/Community";

// TODO: paste the Cloudinary links for each row. Until then each row shows
// placeholder tiles so the layout and motion can be checked.
const ROWS = [
  {
    direction: "right",
    images: [
      "https://res.cloudinary.com/diuswhkzn/image/upload/v1791529015/7_ldgczc.png",
      "https://res.cloudinary.com/diuswhkzn/image/upload/v1791529015/6_jiqlbf.png",
      "https://res.cloudinary.com/diuswhkzn/image/upload/v1791529015/4_foom8o.png",
      "https://res.cloudinary.com/diuswhkzn/image/upload/v1791529015/5_lc39sv.png",
      "https://res.cloudinary.com/diuswhkzn/image/upload/v1791529014/3_iqjdf6.png",
      "https://res.cloudinary.com/diuswhkzn/image/upload/v1791529014/8_gmteci.png",
      "https://res.cloudinary.com/diuswhkzn/image/upload/v1791529014/1_kdgtfv.png",
      "https://res.cloudinary.com/diuswhkzn/image/upload/v1791529013/2_txhdrx.png"
    ]
  },
  {
    direction: "left",
    images: [
      "https://res.cloudinary.com/diuswhkzn/image/upload/v1791530618/5_skrjoi.png",
      "https://res.cloudinary.com/diuswhkzn/image/upload/v1791530617/1_yjoeqs.png",
      "https://res.cloudinary.com/diuswhkzn/image/upload/v1791530617/6_hc2ann.png",
      "https://res.cloudinary.com/diuswhkzn/image/upload/v1791530617/3_oew6go.png",
      "https://res.cloudinary.com/diuswhkzn/image/upload/v1791530616/4_gwuvcp.png",
      "https://res.cloudinary.com/diuswhkzn/image/upload/v1791530616/2_wjtrwm.png"
    ]
  },
  {
    direction: "right",
    images: [
      "https://res.cloudinary.com/diuswhkzn/image/upload/v1791530760/4_qrl20j.png",
      "https://res.cloudinary.com/diuswhkzn/image/upload/v1791530759/3_yzyg2m.png",
      "https://res.cloudinary.com/diuswhkzn/image/upload/v1791530759/1_hz7wac.png",
      "https://res.cloudinary.com/diuswhkzn/image/upload/v1791530759/5_vdgc7i.png",
      "https://res.cloudinary.com/diuswhkzn/image/upload/v1791530759/2_uxslh2.png"
    ]
  }
];

const PLACEHOLDER_WIDTHS = [0.75, 1.5, 1.6, 1.2, 0.9, 1.4];

// Ask Cloudinary for a compressed, format-negotiated copy at 2x the display
// height, unless the link already carries its own transformations.
function cld(url, height) {
  if (!url.includes("/upload/") || /\/upload\/[^/]*(f_|q_|w_|h_)/.test(url))
    return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,h_${height * 2}/`);
}

const MARQUEE_CSS = `
@keyframes meetups-left { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes meetups-right { from { transform: translateX(-50%); } to { transform: translateX(0); } }
.meetups-row { animation: var(--meetups-anim) var(--meetups-duration) linear infinite; }
.meetups-row:hover { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) { .meetups-row { animation: none; } }
`;

const TILE_CLASS = "flex-none h-[130px] md:h-[clamp(260px,24vw,480px)]";

const Row = ({ images, direction }) => {
  const items = images.length ? images : PLACEHOLDER_WIDTHS;
  // repeat short sets so one copy always spans the viewport, then double it
  const set = items.length < 6 ? [...items, ...items] : items;

  return (
    <div className="overflow-hidden">
      <div
        className="meetups-row flex w-max"
        style={{
          "--meetups-anim":
            direction === "right" ? "meetups-right" : "meetups-left",
          "--meetups-duration": `${set.length * 7}s`
        }}
      >
        {[0, 1].map((copy) => (
          <div
            key={copy}
            aria-hidden={copy === 1}
            className="flex flex-none gap-2 pr-2 md:gap-[clamp(14px,1.2vw,24px)] md:pr-[clamp(14px,1.2vw,24px)]"
          >
            {set.map((item, i) =>
              images.length ? (
                <img
                  key={i}
                  src={cld(item, 480)}
                  alt={copy === 0 ? "evolve offline meetup" : ""}
                  loading="lazy"
                  draggable={false}
                  className={`${TILE_CLASS} w-auto object-cover select-none`}
                />
              ) : (
                <div
                  key={i}
                  className={`${TILE_CLASS} bg-[#E6BC00]`}
                  style={{ aspectRatio: item }}
                />
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const MeetupsSection = () => (
  <section className="relative w-full bg-evolve-yellow overflow-hidden py-16 md:py-[clamp(96px,7.5vw,150px)]">
    <style>{MARQUEE_CSS}</style>

    {/* Background curves: one top-right above row 1, two below row 3 */}
    <img
      src={vector_1}
      alt=""
      aria-hidden="true"
      className="pointer-events-none select-none absolute right-0 top-[5%] md:top-[5%] w-[75%] md:w-[clamp(480px,40vw,780px)] z-0"
    />
    <img
      src={vector_3}
      alt=""
      aria-hidden="true"
      className="pointer-events-none select-none absolute left-0 bottom-[4%] w-[75%] md:w-[clamp(520px,45vw,880px)] z-0"
    />
    <img
      src={vector_2}
      alt=""
      aria-hidden="true"
      className="hidden md:block pointer-events-none select-none absolute right-0 bottom-[4%] w-[clamp(480px,40vw,780px)] z-0"
    />

    <div className="relative z-[1]">
      <h2
        className="text-center font-extrabold text-evolve-black max-w-[260px] md:max-w-none mx-auto"
        style={{
          fontSize: "clamp(32px, 3vw, 56px)",
          lineHeight: 1.1,
          letterSpacing: "-0.03em"
        }}
      >
        evolve offline meetups
      </h2>

      <div className="mt-8 md:mt-[clamp(64px,6.5vw,128px)] flex flex-col gap-2 md:gap-[clamp(14px,1.2vw,24px)]">
        {ROWS.map((row, i) => (
          <Row key={i} images={row.images} direction={row.direction} />
        ))}
      </div>

      <div className="mt-14 md:mt-[clamp(72px,6vw,120px)] flex justify-center">
        <a
          href={COPY.hero.joinUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={trackCommunityJoin}
          className="inline-flex items-center justify-center w-[160px] md:w-[200px] h-[52px] md:h-[58px] rounded-[16px] bg-[#1F1F1F] text-white text-[18px] md:text-[24px] font-bold leading-none transition-all duration-150 hover:opacity-90 select-none"
          style={{ boxShadow: "0 6px 0 #808080" }}
        >
          Join Us
        </a>
      </div>
    </div>
  </section>
);

export default MeetupsSection;
