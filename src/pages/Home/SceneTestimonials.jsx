import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

// TODO: confirm Mishti's full name, role, and quote — placeholder for now.
const TESTIMONIALS = [
  {
    name: "Prisha Shah",
    role: "Design Student, MIT ADT University",
    quote:
      "evolve gave me my first real glimpse into the world of design beyond classrooms and portfolios. I had the space to contribute, experiment, make mistakes, and ask questions. I couldn't have asked for a better start to my design journey.",
    video:
      "https://res.cloudinary.com/diuswhkzn/video/upload/v1787313601/Prisha_s_testimonial_video_dilhcu.mp4"
  },
  {
    name: "Mishti Purohit",
    role: "Design Student, Anant university",
    quote:
      "My time at evolve helped me understand how UX and research shape the way we interact with things in our everyday lives. I’m grateful to the team for creating such a welcoming space where I felt comfortable asking questions, sharing my ideas, and learning along the way.",
    video:
      "https://res.cloudinary.com/diuswhkzn/video/upload/v1787313592/Mishti_s_testimonial_video_2_gp4zyw.mp4"
  }
];

// Single source of truth for the card box — used both by the card itself and
// by SceneTestimonials to size the stage it sits in.
const CARD_SIZE = {
  mobile: { width: "min(88vw, 360px)", height: "min(70vh, 560px)" },
  desktop: { width: "min(80vw, 1000px)", height: "min(62vh, 500px)" }
};

const PlayIcon = () => (
  <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
    <path d="M8 5v14l11-7-11-7z" fill="#161616" />
  </svg>
);

const PauseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="6" y="5" width="4" height="14" rx="1" fill="#161616" />
    <rect x="14" y="5" width="4" height="14" rx="1" fill="#161616" />
  </svg>
);

const ChevronIcon = ({ direction = "left" }) => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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

/* ─────────────────────────────────────────────
   TestimonialCard — video half + quote half,
   row on desktop, column on mobile
───────────────────────────────────────────── */
const TestimonialCard = ({ t, isMobile, isActive, isFront }) => {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const size = isMobile ? CARD_SIZE.mobile : CARD_SIZE.desktop;

  // Pause + reset the play button whenever this card drops to the back, or
  // the scene is scrolled away from — a testimonial video shouldn't keep
  // talking underneath the next scene (or behind the other card).
  useEffect(() => {
    if ((!isActive || !isFront) && videoRef.current) {
      videoRef.current.pause();
      setPlaying(false);
    }
  }, [isActive, isFront]);

  const togglePlay = () => {
    if (playing) {
      videoRef.current?.pause();
      setPlaying(false);
    } else {
      videoRef.current?.play();
      setPlaying(true);
    }
  };

  return (
    <div
      className="rounded-[28px] border-2 border-black overflow-hidden bg-black"
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        width: size.width,
        height: size.height
      }}
    >
      {/* video half */}
      <div
        className="relative bg-black flex-shrink-0"
        style={{
          width: isMobile ? "100%" : "50%",
          height: isMobile ? "50%" : "100%"
        }}
      >
        <video
          ref={videoRef}
          src={t.video}
          playsInline
          controls={false}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          className="w-full h-full object-cover"
        />
        <button
          onClick={togglePlay}
          aria-label={
            playing
              ? `pause ${t.name}'s testimonial video`
              : `play ${t.name}'s testimonial video`
          }
          className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-evolve-yellow flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
      </div>

      {/* quote half */}
      <div
        className="bg-evolve-yellow flex flex-col justify-center overflow-y-auto"
        style={{
          width: isMobile ? "100%" : "50%",
          height: isMobile ? "50%" : "100%",
          padding: isMobile ? "20px 24px" : "clamp(28px,3.5vw,48px)"
        }}
      >
        <span
          className="text-evolve-pink font-extrabold"
          style={{
            fontSize: isMobile ? "48px" : "64px",
            lineHeight: 0.5,
            fontStyle: "italic"
          }}
        >
          "
        </span>
        <p
          className="font-bold text-black mt-2"
          style={{
            fontSize: isMobile ? "13px" : "clamp(14px,1.15vw,17px)",
            lineHeight: 1.3
          }}
        >
          {t.quote}
        </p>
        <div className="mt-4">
          <p
            className="font-bold text-black"
            style={{ fontSize: isMobile ? "13px" : "15px" }}
          >
            {t.name}
          </p>
          <p
            className="font-normal text-black"
            style={{ fontSize: isMobile ? "11px" : "13px" }}
          >
            {t.role}
          </p>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   SceneTestimonials — "evolve, in their words"
───────────────────────────────────────────── */
const SceneTestimonials = ({ isMobile = false, isActive = false }) => {
  const [current, setCurrent] = useState(0);
  const size = isMobile ? CARD_SIZE.mobile : CARD_SIZE.desktop;

  const prev = () =>
    setCurrent((c) => (c - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const next = () => setCurrent((c) => (c + 1) % TESTIMONIALS.length);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-evolve-pink overflow-hidden">
      <h2
        className="font-extrabold text-white text-center"
        style={{
          fontSize: isMobile ? "clamp(32px,9vw,44px)" : "clamp(36px,4vw,56px)",
          marginBottom: isMobile ? "28px" : "44px"
        }}
      >
        evolve, in their words
      </h2>

      {/* Both cards stay mounted the whole time — clicking next/prev swaps
          which one is "front" (full size, on top) and which is "back"
          (scaled wider+shorter so it peeks out left/right, behind). Both
          transitions run together, so the front card visibly recedes into
          the back slot as the back card grows into the front slot. */}
      <div
        className="relative grid"
        style={{ width: size.width, height: size.height }}
      >
        {TESTIMONIALS.map((t, i) => {
          const isFront = i === current;
          return (
            <motion.div
              key={t.name}
              className="[grid-area:1/1]"
              animate={{
                scaleX: isFront ? 1 : 1.08,
                scaleY: isFront ? 1 : 0.8,
                opacity: isFront ? 1 : 0.85,
                zIndex: isFront ? 2 : 1
              }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
              <TestimonialCard
                t={t}
                isMobile={isMobile}
                isActive={isActive}
                isFront={isFront}
              />
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-5 mt-6">
        <button
          onClick={prev}
          className="flex items-center justify-center hover:opacity-70 transition-opacity"
          aria-label="previous"
        >
          <ChevronIcon direction="left" />
        </button>
        <div className="flex items-center gap-2">
          {TESTIMONIALS.map((_, i) => (
            <span
              key={i}
              className="rounded-full"
              style={{
                width: 8,
                height: 8,
                backgroundColor:
                  i === current ? "#FFD007" : "rgba(255,255,255,0.4)"
              }}
            />
          ))}
        </div>
        <button
          onClick={next}
          className="flex items-center justify-center hover:opacity-70 transition-opacity"
          aria-label="next"
        >
          <ChevronIcon direction="right" />
        </button>
      </div>
    </div>
  );
};

export default SceneTestimonials;
