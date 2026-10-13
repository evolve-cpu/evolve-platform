import { useEffect, useRef, useState } from "react";

// Desktop shows 3 cards side by side; with more than 3 it becomes a carousel.
// Mobile always shows one card at a time.
const VIDEO_TESTIMONIALS = [
  {
    name: "Prisha Shah",
    role: "Design Student, MIT ADT University",
    video:
      "https://res.cloudinary.com/diuswhkzn/video/upload/v1787313601/Prisha_s_testimonial_video_dilhcu.mp4"
  },
  {
    name: "Mishti Purohit",
    role: "Design Student, Anant University",
    video:
      "https://res.cloudinary.com/diuswhkzn/video/upload/v1787313592/Mishti_s_testimonial_video_2_gp4zyw.mp4"
  },
  // TODO: add Ankit Passi once the video is uploaded
  {
    name: "Ankit Passi",
    role: "Deputy Manager (Design), Deloitte Digital",
    video:
      "https://res.cloudinary.com/diuswhkzn/video/upload/v1791490923/Ankit_testimonial_tbzm35.mp4"
  }
];

const DESKTOP_VISIBLE = 3;
const AUTO_SWIPE_MS = 2000;

const PlayIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <path d="M8 5v14l11-7-11-7z" fill="#161616" />
  </svg>
);

const PauseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="6" y="5" width="4" height="14" rx="1" fill="#161616" />
    <rect x="14" y="5" width="4" height="14" rx="1" fill="#161616" />
  </svg>
);

const ChevronIcon = ({ direction }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d={
        direction === "left"
          ? "M12.5 15L7.5 10L12.5 5"
          : "M7.5 15L12.5 10L7.5 5"
      }
      stroke="white"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const VideoCard = ({ t, isPlaying, onToggle }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isPlaying) v.play().catch(() => {});
    else v.pause();
  }, [isPlaying]);

  return (
    <article className="h-full flex flex-col rounded-[24px] md:rounded-[clamp(24px,2vw,40px)] overflow-hidden bg-evolve-yellow">
      <div className="relative aspect-[554/742] bg-black">
        {/* #t=0.1 makes the browser paint the first frame as a thumbnail */}
        <video
          ref={videoRef}
          src={`${t.video}#t=0.1`}
          preload="metadata"
          playsInline
          onClick={() => onToggle(!isPlaying)}
          onEnded={() => onToggle(false)}
          className="absolute inset-0 w-full h-full object-cover cursor-pointer"
        />
        <button
          type="button"
          onClick={() => onToggle(!isPlaying)}
          aria-label={`${isPlaying ? "Pause" : "Play"} ${t.name}'s testimonial video`}
          className="absolute bottom-5 right-5 md:bottom-[clamp(20px,2vw,40px)] md:right-[clamp(20px,2.7vw,52px)] w-14 h-14 md:w-[clamp(52px,4.2vw,80px)] md:h-[clamp(52px,4.2vw,80px)] rounded-full bg-evolve-yellow flex items-center justify-center shadow-lg transition-transform duration-200 hover:scale-105"
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
      </div>
      <div className="px-6 py-6 md:px-[clamp(24px,2.1vw,40px)] md:py-[clamp(24px,2.3vw,44px)]">
        <h3
          className="font-extrabold text-evolve-black"
          style={{
            fontSize: "clamp(20px, 1.75vw, 34px)",
            letterSpacing: "-0.02em",
            lineHeight: 1.1
          }}
        >
          {t.name}
        </h3>
        <p
          className="mt-2 text-evolve-black"
          style={{ fontSize: "clamp(14px, 1.2vw, 22px)", lineHeight: 1.3 }}
        >
          {t.role}
        </p>
      </div>
    </article>
  );
};

const VideoTestimonialsSection = () => {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const [playingIdx, setPlayingIdx] = useState(null);
  const [inView, setInView] = useState(false);
  const [touching, setTouching] = useState(false);
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

  const count = VIDEO_TESTIMONIALS.length;
  const visible = isDesktop ? DESKTOP_VISIBLE : 1;
  const pages = Math.max(1, count - visible + 1);
  const showControls = count > visible;

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
      setInView(entry.isIntersecting);
      if (!entry.isIntersecting) setPlayingIdx(null);
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Auto-swipe to the next card (wrapping round) while the section is on
  // screen — paused while a video plays or a finger is on the carousel.
  // Keyed on `active`, so a manual swipe restarts the countdown.
  useEffect(() => {
    if (!showControls || !inView || touching || playingIdx !== null) return;
    const id = setTimeout(() => goTo(active + 1), AUTO_SWIPE_MS);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, showControls, inView, touching, playingIdx, pages]);

  return (
    <section className="w-full bg-evolve-pink py-14 md:py-[clamp(72px,6vw,120px)]">
      <h2
        className="font-extrabold text-white px-6 md:text-center"
        style={{
          fontSize: "clamp(36px, 3.4vw, 64px)",
          lineHeight: 1.05,
          letterSpacing: "-0.04em"
        }}
      >
        evolve,
        <br className="md:hidden" /> in their words
      </h2>

      <div className="mt-8 md:mt-[clamp(48px,4.6vw,88px)] px-6 md:px-[4.6vw]">
        <div
          ref={trackRef}
          onScroll={handleScroll}
          onTouchStart={() => setTouching(true)}
          onTouchEnd={() => setTouching(false)}
          onTouchCancel={() => setTouching(false)}
          onMouseEnter={() => setTouching(true)}
          onMouseLeave={() => setTouching(false)}
          className={`flex gap-4 md:gap-[2.1vw] overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            count < DESKTOP_VISIBLE ? "md:justify-center" : ""
          }`}
        >
          {VIDEO_TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              className="snap-start shrink-0 w-full md:w-[calc((100%-2*2.1vw)/3)]"
            >
              <VideoCard
                t={t}
                isPlaying={playingIdx === i}
                onToggle={(play) => setPlayingIdx(play ? i : null)}
              />
            </div>
          ))}
        </div>

        {showControls && (
          <div className="flex items-center justify-center gap-6 mt-8">
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              aria-label="Previous testimonial"
              className="p-2 transition-opacity hover:opacity-70 disabled:opacity-30"
            >
              <ChevronIcon direction="left" />
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: pages }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === active ? "bg-evolve-yellow" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              aria-label="Next testimonial"
              className="p-2 transition-opacity hover:opacity-70 disabled:opacity-30"
            >
              <ChevronIcon direction="right" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default VideoTestimonialsSection;
