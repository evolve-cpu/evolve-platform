import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import CtaButton from "../MainHome/CtaButton";
import { linkedin_logo } from "../../assets/images/Mentorship";
import MobileMemberSheet, { MobileMemberGrid } from "./MobileMemberSheet";

const BUILDER_FORM_URL = "https://forms.gle/rM6fbKVHxaY7Pnkx8";

// Each builder has a photo (driveId) and EITHER a video OR a written testimonial.
//   video        — Cloudinary video URL, plays inline with our controls
//   testimonial  — no video: the photo flips over to show this text
// Drive ids are the part between /d/ and /view in the share URL.
const BUILDERS = [
  {
    name: "Ayush Negi",
    role: "Student, Graphic Era University",
    driveId: "12sZOPS8aTLohAqTv38YbLJvcjvC6A_r8",
    video:
      "https://res.cloudinary.com/diuswhkzn/video/upload/v1791575245/Ayush_builder_fk5nqi.mp4",
    linkedin: "https://www.linkedin.com/in/ayush-negi-4a1098377"
  },
  {
    name: "Smriti Agarwal",
    role: "Designer at Docsumo",
    driveId: "17xGYuOHdpRDh6UY7IGtgkH2nBOOmErwD",
    video:
      "https://res.cloudinary.com/diuswhkzn/video/upload/v1791575673/Smriti_builder_dlbdss.mp4",
    linkedin: "http://linkedin.com/in/smriti-ag"
  },
  {
    name: "Murtuza Banani",
    role: "Designer",
    driveId: "1DmE1272XQtDoY9AkuyTJ7-YNqXcqPUk2",
    video:
      "https://res.cloudinary.com/diuswhkzn/video/upload/v1791575794/Murtuza_builder_plr6it.mp4",
    linkedin: "http://linkedin.com/in/murtuzabanani"
  },
  {
    name: "Harshi Adamya",
    role: "Product Designer",
    driveId: "1tmva_TKWWD8eFWTRMG80DzgL8KK39BSC",
    video:
      "https://res.cloudinary.com/diuswhkzn/video/upload/v1791576087/Harshi_vj1pqy.mp4",
    linkedin: "https://www.linkedin.com/in/harshi-adamya-a76958230/"
  },
  {
    name: "Kopal Srivastava",
    role: "Student, Galgotias University",
    driveId: "1zlsGjgNtFSxtz9Jto5Ts6ntaHsS-wIxF",
    video:
      "https://res.cloudinary.com/diuswhkzn/video/upload/v1791575824/Kopal_builder_aie43h.mp4",
    linkedin:
      "https://www.linkedin.com/in/kopal-srivastava-0b1309411?utm_source=share_via&utm_content=profile&utm_medium=member_android"
  },
  {
    name: "Siddh Mehta",
    role: "Student, Gujarat Technological University",
    driveId: "1OTC9cl_lMIelwIE_c_TzyVqIywOcAFqy",
    linkedin: "https://www.linkedin.com/in/siddh-mehta1320",
    testimonial:
      "evolve Community has been an incredible space for my growth. It has given me the opportunity to meet and learn from people across so many diverse backgrounds, broadening my perspective in ways I didn't expect.\n\nBeyond the engaging content and exciting events that keep the energy high, what makes Evolve truly special is its wholesome community initiatives, especially the portfolio reviews and masterclasses."
  },
  {
    name: "Pusti Hissaria",
    role: "Student, NIFT Gandhinagar",
    driveId: "1OUTUMArYiXR4s5YXVV1VY4JYsei97_hR",
    linkedin: "https://www.linkedin.com/in/pusti-hissaria-4b65a12a9",
    testimonial:
      "evolve community is rare and it's activities, speakers and even audience is diverse. I had a lovely experience at Evolve, even though I had attended 4-5 sessions but comparing it with other design communities, it's workshop's concepts are always top notch.  From workshops to conversations around books, careers, and design, Evolve has built a genuinely engaging community. I’d definitely recommend it to designers looking to learn and grow with great peers."
  },
  {
    name: "Srishti Mehta ",
    role: "Graphic Designer",
    driveId: "1OJmvc6ao2uJyHU98mFyw1aJu3EOZ7JMe",
    linkedin: "https://www.linkedin.com/in/srishti-mehta-sm",
    testimonial:
      "evolve has honestly ignited the fun side of design for me again. It’s made me think beyond just creating something and actually engage with new people, ideas and perspectives. I’ve really enjoyed seeing how differently people can approach the same thing, while still finding so many common points in how we think. That exchange of perspectives has probably been one of the biggest things I’ve taken away from evolve so far."
  }
  // TODO: 4 more builders
];

const DESKTOP_VISIBLE = 3;

const drivePhoto = (id) => `https://lh3.googleusercontent.com/d/${id}=w1000`;

const PlayIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <path d="M8 5v14l11-7-11-7z" fill="#161616" />
  </svg>
);

// Pink quote marks on the yellow button (flips a card to its testimonial).
const QuoteIcon = () => (
  <span
    aria-hidden="true"
    className="font-extrabold text-evolve-pink leading-none translate-y-[0.22em] text-[48px] md:text-[clamp(44px,3.4vw,64px)]"
  >
    “
  </span>
);

const PauseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="6" y="5" width="4" height="14" rx="1" fill="#161616" />
    <rect x="14" y="5" width="4" height="14" rx="1" fill="#161616" />
  </svg>
);

const ROUND_BUTTON =
  "absolute bottom-5 right-5 md:bottom-[clamp(20px,2vw,40px)] md:right-[clamp(20px,2vw,40px)] w-14 h-14 md:w-[clamp(52px,4.2vw,80px)] md:h-[clamp(52px,4.2vw,80px)] rounded-full bg-evolve-yellow text-evolve-black flex items-center justify-center shadow-lg transition-transform duration-200 hover:scale-105";

const Photo = ({ b }) =>
  b.driveId ? (
    <img
      src={drivePhoto(b.driveId)}
      alt={b.name}
      loading="lazy"
      referrerPolicy="no-referrer"
      className="absolute inset-0 w-full h-full object-cover"
    />
  ) : null;

// The builder's photo shows whenever the video isn't playing (before start,
// on pause, after it ends). Pausing keeps the position; ending rewinds.
const VideoMedia = ({ b, isPlaying, onToggle }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isPlaying) v.play().catch(() => {});
    else v.pause();
  }, [isPlaying]);

  const toggle = () => onToggle(!isPlaying);

  return (
    <>
      <video
        ref={videoRef}
        src={b.video}
        preload="none"
        playsInline
        onClick={toggle}
        onEnded={(e) => {
          e.currentTarget.currentTime = 0;
          onToggle(false);
        }}
        className="absolute inset-0 w-full h-full object-cover cursor-pointer"
      />
      {!isPlaying && (
        <div onClick={toggle} className="absolute inset-0 cursor-pointer">
          <Photo b={b} />
        </div>
      )}
      <button
        type="button"
        onClick={toggle}
        aria-label={`${isPlaying ? "Pause" : "Play"} ${b.name}'s testimonial video`}
        className={ROUND_BUTTON}
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>
    </>
  );
};

const FACE = "absolute inset-0 [backface-visibility:hidden]";

const FlipMedia = ({ b }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="absolute inset-0 [perspective:1600px]">
      <div
        className="relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d]"
        style={{ transform: flipped ? "rotateY(180deg)" : "none" }}
      >
        {/* Front: photo */}
        <div className={FACE}>
          <Photo b={b} />
          <button
            type="button"
            onClick={() => setFlipped(true)}
            aria-label={`Read ${b.name}'s testimonial`}
            className={ROUND_BUTTON}
          >
            <QuoteIcon />
          </button>
        </div>

        {/* Back: written testimonial */}
        <div
          className={`${FACE} bg-evolve-lavender-indigo [transform:rotateY(180deg)]`}
        >
          <div className="h-full overflow-y-auto px-6 pt-8 pb-24 md:px-[clamp(24px,2.1vw,40px)] md:pt-[clamp(32px,2.6vw,52px)]">
            <span
              aria-hidden="true"
              className="block font-extrabold text-evolve-yellow leading-none"
              style={{ fontSize: "clamp(40px, 3vw, 60px)" }}
            >
              “
            </span>
            <p
              className="mt-2 font-semibold text-white whitespace-pre-line"
              style={{ fontSize: "clamp(16px, 1.15vw, 22px)", lineHeight: 1.4 }}
            >
              {b.testimonial}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFlipped(false)}
            aria-label={`Show ${b.name}'s photo`}
            className={ROUND_BUTTON}
          >
            <RotateCcw className="w-6 h-6 md:w-[clamp(22px,1.6vw,30px)] md:h-[clamp(22px,1.6vw,30px)]" />
          </button>
        </div>
      </div>
    </div>
  );
};

const BuilderCard = ({ b, isPlaying, onToggle }) => {
  const hasVideo = Boolean(b.video);

  return (
    <article className="h-full flex flex-col">
      <div className="relative aspect-[554/742] bg-black/10 overflow-hidden">
        {hasVideo ? (
          <VideoMedia b={b} isPlaying={isPlaying} onToggle={onToggle} />
        ) : b.testimonial ? (
          <FlipMedia b={b} />
        ) : (
          <Photo b={b} />
        )}
      </div>

      <div className="mt-5 md:mt-[clamp(20px,2vw,40px)] flex items-start justify-between gap-3">
        <h3
          className="font-extrabold text-evolve-black"
          style={{
            fontSize: "clamp(20px, 1.75vw, 34px)",
            letterSpacing: "-0.02em",
            lineHeight: 1.1
          }}
        >
          {b.name}
        </h3>
        {b.linkedin && (
          <a
            href={b.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${b.name} on LinkedIn`}
            className="shrink-0"
          >
            <img
              src={linkedin_logo}
              alt=""
              className="w-6 h-6 md:w-[clamp(24px,2vw,38px)] md:h-[clamp(24px,2vw,38px)]"
            />
          </a>
        )}
      </div>
      <p
        className="mt-2 font-medium text-evolve-black"
        style={{ fontSize: "clamp(15px, 1.2vw, 22px)", lineHeight: 1.3 }}
      >
        {b.role}
      </p>
    </article>
  );
};

const BuildersSection = () => {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const [playingIdx, setPlayingIdx] = useState(null);
  const [sheetIdx, setSheetIdx] = useState(null);
  const [sheetPlaying, setSheetPlaying] = useState(false);
  const sheetBuilder = sheetIdx === null ? null : BUILDERS[sheetIdx];
  const [isDesktop, setIsDesktop] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 768px)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = (e) => setIsDesktop(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const count = BUILDERS.length;
  const visible = isDesktop ? DESKTOP_VISIBLE : 1;
  const pages = Math.max(1, count - visible + 1);
  // mobile shows a grid + bottom sheet instead of the carousel
  const showControls = isDesktop && count > visible;

  // Keep the dots in sync with manual swipes / scrolls.
  const handleScroll = () => {
    const el = trackRef.current;
    if (!el || !el.firstElementChild) return;
    const step =
      el.firstElementChild.getBoundingClientRect().width +
      parseFloat(getComputedStyle(el).columnGap || "0");
    const idx = Math.round(el.scrollLeft / step);
    if (idx !== active) {
      setActive(idx);
      setPlayingIdx(null);
    }
  };

  // Wraps around at both ends.
  const goTo = (idx) => {
    const el = trackRef.current;
    const target = el?.children[(idx + pages) % pages];
    if (!target) return;
    el.scrollTo({
      left: target.offsetLeft - el.offsetLeft,
      behavior: "smooth"
    });
  };

  // Stop any playing video once the section leaves the screen.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) setPlayingIdx(null);
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="w-full bg-evolve-yellow py-16 md:py-[clamp(72px,6vw,140px)]">
      <div className="px-6 md:px-[6.8vw]">
        <h2
          className="font-extrabold text-evolve-pink text-left md:text-center"
          style={{
            fontSize: "clamp(40px, 3.4vw, 72px)",
            lineHeight: 1,
            letterSpacing: "-0.03em"
          }}
        >
          evolve builders
        </h2>

        <p
          className="mt-5 font-medium text-black text-left md:text-center md:mx-auto md:max-w-[min(54vw,1100px)]"
          style={{ fontSize: "clamp(18px, 1.67vw, 32px)", lineHeight: 1.3 }}
        >
          Community members who turn ideas into sessions, events, experiences
          and shape what evolve becomes.
        </p>

        <div
          ref={trackRef}
          onScroll={handleScroll}
          className={`hidden md:flex mt-8 md:mt-[clamp(48px,4vw,80px)] md:mx-auto md:max-w-[min(82vw,1500px)] gap-6 md:gap-[2.1vw] overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            count < DESKTOP_VISIBLE ? "md:justify-center" : ""
          }`}
        >
          {BUILDERS.map((b, i) => (
            <div
              key={b.name}
              className="snap-start shrink-0 w-full md:w-[calc((100%-2*2.1vw)/3)]"
            >
              <BuilderCard
                b={b}
                isPlaying={playingIdx === i}
                onToggle={(play) => setPlayingIdx(play ? i : null)}
              />
            </div>
          ))}
        </div>

        <MobileMemberGrid
          members={BUILDERS}
          photoBg="rgba(0,0,0,0.1)"
          onSelect={(i) => {
            setSheetPlaying(false);
            setSheetIdx(i);
          }}
        />
        <MobileMemberSheet
          open={Boolean(sheetBuilder)}
          onClose={() => {
            setSheetPlaying(false);
            setSheetIdx(null);
          }}
          label={sheetBuilder?.name}
        >
          {sheetBuilder && (
            <BuilderCard
              key={sheetBuilder.name}
              b={sheetBuilder}
              isPlaying={sheetPlaying}
              onToggle={setSheetPlaying}
            />
          )}
        </MobileMemberSheet>

        {showControls && (
          <div className="mt-10 md:mt-[clamp(40px,4vw,80px)] mx-auto md:max-w-[min(30vw,600px)] flex items-center justify-between">
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              aria-label="Previous builder"
              className="p-1 text-black transition-opacity hover:opacity-70"
            >
              <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
            </button>
            <div className="flex items-center gap-2 md:gap-3">
              {Array.from({ length: pages }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to builder ${i + 1}`}
                  className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-colors ${
                    i === active ? "bg-black" : "bg-[#806804]"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              aria-label="Next builder"
              className="p-1 text-black transition-opacity hover:opacity-70"
            >
              <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
            </button>
          </div>
        )}

        <div className="mt-12 md:mt-[clamp(48px,4.5vw,88px)] flex justify-center">
          <CtaButton href={BUILDER_FORM_URL}>Be a builder</CtaButton>
        </div>
      </div>
    </section>
  );
};

export default BuildersSection;
