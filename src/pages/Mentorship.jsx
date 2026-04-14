import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SEO from "../components/SEO";
import { renderWithBreaks } from "../utils/renderWithBreaks";
import { useAuth } from "../hooks/useAuth";

import gsap from "gsap";
import {
  hero_mentorship,
  hero_mentorship_mobile,
  hero_mentorship_tab,
  apply_now_button,
  apply_now_button_hover,
  how_button,
  how_button_hover,
  mentor_yagnesh,
  get_started_button,
  // get_started_button_hover
  explore_plans,
  // right_ribbon,
  impact_thing,
  impact_thing_mobile,
  right_eye_ribbon,
  left_eye_ribbon,
  right_eye_ribbon_mobile,
  left_eye_ribbon_mobile,
  mentorship_vector,
  mentorship_vector_mobile,
  apply_to_mentorship,
  chinmayImg,
  jonImg,
  anishImg,
  pradyumnaImg,
  explore_mentorship,
  join_the_waitlist
} from "../assets/images/Mentorship";
import { right_ribbon } from "../assets/images/Home";
import { marquee_vector_2 } from "../assets/images/Nav";
import { supabase } from "../supabaseClient";
import { mentorship as COPY } from "../content";

/* ─────────────────────────────────────────────
   Testimonial data (edit text in src/content.js)
───────────────────────────────────────────── */
const TESTIMONIALS = [
  { ...COPY.testimonials.items[0], image: chinmayImg },
  { ...COPY.testimonials.items[1], image: jonImg },
  { ...COPY.testimonials.items[2], image: anishImg },
  { ...COPY.testimonials.items[3], image: pradyumnaImg }
];

/* ─────────────────────────────────────────────
   FAQ data (edit text in src/content.js)
───────────────────────────────────────────── */
const FAQS = COPY.faqs;

/* ─────────────────────────────────────────────
   TestimonialsMobile
───────────────────────────────────────────── */
const TestimonialsMobile = () => {
  const [order, setOrder] = useState(TESTIMONIALS.map((_, i) => i));
  const [animating, setAnimating] = useState(false);
  const cardRefs = useRef([]);
  const rotations = [-3, 4, -6, 2];
  const touchStartX = useRef(null);

  const advance = (direction) => {
    if (animating) return;
    setAnimating(true);
    const topIdx = order[order.length - 1];
    const topEl = cardRefs.current[topIdx];
    if (topEl) {
      gsap.to(topEl, {
        x: direction === "right" ? 400 : -400,
        opacity: 0,
        duration: 0.35,
        ease: "power2.in",
        onComplete: () => {
          gsap.set(topEl, { x: 0, opacity: 1 });
          setOrder((prev) => {
            const next = [...prev];
            const top = next.pop();
            next.unshift(top);
            return next;
          });
          setAnimating(false);
        }
      });
    } else {
      setOrder((prev) => {
        const next = [...prev];
        const top = next.pop();
        next.unshift(top);
        return next;
      });
      setAnimating(false);
    }
  };

  return (
    <section className="block md:hidden relative bg-evolve-yellow overflow-hidden py-10 px-5">
      <h2
        className="text-black font-extrabold lowercase text-center w-full leading-tight mb-10"
        style={{ fontSize: "clamp(32px, 10vw, 46px)", letterSpacing: "-0.5px" }}
      >
        {COPY.testimonials.sectionHeading}
      </h2>
      <div
        className="relative flex items-center justify-center -mb-2"
        style={{ height: "570px" }}
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return;
          const diff = e.changedTouches[0].clientX - touchStartX.current;
          touchStartX.current = null;
          if (Math.abs(diff) < 40) return;
          advance(diff < 0 ? "left" : "right");
        }}
      >
        {order.map((testimonialIdx, stackPos) => {
          const depthOffset = (order.length - 1 - stackPos) * 8;
          const tilt = rotations[stackPos % rotations.length];
          return (
            <div
              key={testimonialIdx}
              ref={(el) => (cardRefs.current[testimonialIdx] = el)}
              className="absolute rounded-2xl border-2 flex flex-col justify-center px-6 py-7"
              style={{
                width: "80vw",
                maxWidth: "350px",
                height: "500px",
                backgroundColor: "var(--color-evolve-jasper, #6C3FC5)",
                borderColor: "var(--color-evolve-yellow, #FFD600)",
                transform: `rotate(${tilt}deg) translateY(${depthOffset}px)`,
                zIndex: stackPos + 1,
                top: 0
              }}
            >
              <span
                className="text-evolve-yellow font-extrabold leading-none"
                style={{
                  fontSize: "72px",
                  lineHeight: "0.7",
                  fontStyle: "italic"
                }}
              >
                "
              </span>
              <p
                className="font-bold text-white -mt-4"
                style={{ fontSize: "15px", lineHeight: "1.45" }}
              >
                {TESTIMONIALS[testimonialIdx].quote}
              </p>
              <div className="flex items-center gap-3 mt-5">
                <img
                  src={TESTIMONIALS[testimonialIdx].image}
                  alt={TESTIMONIALS[testimonialIdx].name}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2"
                  style={{ borderColor: "var(--color-evolve-yellow, #FFD600)" }}
                />
                <div>
                  <p
                    className="font-bold"
                    style={{
                      fontSize: "15px",
                      color: "var(--color-evolve-yellow, #FFD600)"
                    }}
                  >
                    {TESTIMONIALS[testimonialIdx].name}
                  </p>
                  <p
                    className="font-normal text-white"
                    style={{ fontSize: "13px", lineHeight: "1.3" }}
                  >
                    {TESTIMONIALS[testimonialIdx].role}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-6">
        <button
          onClick={() => advance("left")}
          className="text-black font-normal text-xl leading-none hover:opacity-60 transition-opacity"
          aria-label="previous"
        >
          &lt;
        </button>
        <span className="text-black font-normal" style={{ fontSize: "16px" }}>
          swipe
        </span>
        <button
          onClick={() => advance("right")}
          className="text-black font-normal text-xl leading-none hover:opacity-60 transition-opacity"
          aria-label="next"
        >
          &gt;
        </button>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────
   PlanColumn — desktop pricing half
   NOTE: uses apply_now_button / apply_now_button_hover
   from module-level imports above
───────────────────────────────────────────── */
const PlanColumn = ({
  tier,
  cutPrice,
  price,
  tagline,
  features,
  isRight,
  onPay,
  hasPaid,
  allBatchesFull
}) => {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="flex flex-col items-center"
      style={{
        width: "100%",
        paddingTop: "clamp(40px, 5vh, 72px)",
        paddingBottom: "clamp(40px, 5vh, 72px)",
        paddingLeft: "clamp(32px, 4vw, 64px)",
        paddingRight: "clamp(32px, 4vw, 64px)",
        borderLeft: isRight ? "2px solid #000000" : "none"
      }}
    >
      {/* Tier badge */}
      <div
        className="bg-evolve-pink"
        style={{
          // backgroundColor: "#FF3D6B",
          width: "50%",
          minWidth: "120px",
          textAlign: "center",
          padding: "4px 0 6px",
          marginBottom: "clamp(18px, 2.5vh, 32px)"
        }}
      >
        <span
          className="font-extrabold lowercase text-white"
          style={{ fontSize: "28px", lineHeight: "1" }}
        >
          {tier}
        </span>
      </div>

      {/* Strikethrough price */}
      <p
        className="font-extrabold lowercase"
        style={{
          fontSize: "36px",
          lineHeight: "1",
          color: "#BF9C05",
          textDecoration: "line-through",
          textDecorationColor: "#BF9C05",
          textDecorationThickness: "2px",
          letterSpacing: "-0.5px"
        }}
      >
        {cutPrice}
      </p>

      {/* Actual price */}
      <p
        className="font-extrabold lowercase text-black"
        style={{
          fontSize: "clamp(64px, 6.5vw, 96px)",
          lineHeight: "1",
          letterSpacing: "-0.5px",
          marginTop: "4px"
        }}
      >
        {price}
      </p>

      {/* Tagline */}
      <p
        className="lowercase text-black text-center"
        style={{
          fontWeight: 500,
          fontSize: "clamp(16px, 1.6vw, 28px)",
          lineHeight: "1.35",
          letterSpacing: "-0.3px",
          marginTop: "clamp(10px, 1.5vh, 20px)",
          maxWidth: "34ch"
        }}
      >
        {tagline}
      </p>

      {/* Divider */}
      <div
        style={{
          width: "75%",
          height: "2px",
          backgroundColor: "#000000",
          margin: "clamp(14px, 2vh, 24px) 0"
        }}
      />

      {/* Features */}
      <div
        className="text-black lowercase text-center"
        style={{
          fontSize: "clamp(14px, 1.4vw, 22px)",
          lineHeight: "1.5",
          letterSpacing: "-0.2px",
          fontWeight: 400
        }}
      >
        {features.map((f, i) => (
          <p key={i}>{f}</p>
        ))}
      </div>

      {/* Apply button */}
      {!hasPaid && (
        <img
          src={
            allBatchesFull
              ? join_the_waitlist
              : hover
                ? apply_now_button_hover
                : apply_now_button
          }
          alt={allBatchesFull ? "join the waitlist" : "apply now"}
          onClick={() => onPay(tier)}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          className="cursor-pointer transition-opacity duration-150"
          style={{
            width: "clamp(200px, 22vw, 320px)",
            marginTop: "clamp(20px, 3vh, 40px)"
          }}
        />
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   PlanCardMobile — mobile stacked plan card
   NOTE: uses apply_now_button / apply_now_button_hover
   from module-level imports above
───────────────────────────────────────────── */
const PlanCardMobile = ({
  tier,
  cutPrice,
  price,
  tagline,
  features,
  onPay,
  hasPaid,
  allBatchesFull
}) => {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="flex flex-col items-center"
      style={{
        padding: "40px 24px 48px"
        // borderBottom: "2px solid #000000"
      }}
    >
      {/* Badge */}
      <div
        className="bg-evolve-pink"
        style={{
          // backgroundColor: "#FF3D6B",
          width: "45%",
          minWidth: "110px",
          textAlign: "center",
          padding: "4px 0 6px",
          marginBottom: "20px"
        }}
      >
        <span
          className="font-extrabold lowercase text-white"
          style={{ fontSize: "22px", lineHeight: "1" }}
        >
          {tier}
        </span>
      </div>

      {/* Strikethrough price */}
      <p
        className="font-extrabold lowercase"
        style={{
          fontSize: "28px",
          lineHeight: "1",
          color: "#BF9C05",
          textDecoration: "line-through",
          textDecorationColor: "#BF9C05",
          textDecorationThickness: "2px"
        }}
      >
        {cutPrice}
      </p>

      {/* Actual price */}
      <p
        className="font-extrabold lowercase text-black"
        style={{
          fontSize: "clamp(52px, 14vw, 72px)",
          lineHeight: "1",
          marginTop: "4px"
        }}
      >
        {price}
      </p>

      {/* Tagline */}
      <p
        className="lowercase text-black text-center"
        style={{
          fontWeight: 500,
          fontSize: "18px",
          lineHeight: "1.4",
          marginTop: "12px",
          maxWidth: "28ch"
        }}
      >
        {tagline}
      </p>

      {/* HR */}
      <div
        style={{
          width: "70%",
          height: "2px",
          backgroundColor: "#000000",
          margin: "16px 0"
        }}
      />

      {/* Features */}
      <div
        className="text-black lowercase text-center"
        style={{ fontSize: "16px", lineHeight: "1.5", fontWeight: 400 }}
      >
        {features.map((f, i) => (
          <p key={i}>{f}</p>
        ))}
      </div>

      {/* Button */}
      {!hasPaid && (
        <img
          src={
            allBatchesFull
              ? join_the_waitlist
              : hover
                ? apply_now_button_hover
                : apply_now_button
          }
          alt={allBatchesFull ? "join the waitlist" : "apply now"}
          onClick={() => onPay(tier)}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          className="cursor-pointer transition-opacity duration-150"
          style={{ width: "240px", marginTop: "28px" }}
        />
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Marquee animation helper
───────────────────────────────────────────── */
const initMarquee = (groupRef, trackRef) => {
  const group = groupRef.current;
  const track = trackRef.current;
  if (!group || !track) return () => {};

  const clone = group.cloneNode(true);
  track.appendChild(clone);
  let cleanupAnim = null;

  const start = () => {
    const groupWidth = group.getBoundingClientRect().width;
    if (!groupWidth) return;
    gsap.set(track, { x: 0 });
    const anim = gsap.to(track, {
      x: -groupWidth,
      duration: 20,
      ease: "none",
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize((x) => {
          const v = parseFloat(x);
          return (v % -groupWidth) + 0 || 0;
        })
      }
    });
    cleanupAnim = () => anim.kill();
  };

  const imgs = track.querySelectorAll("img");
  const allLoaded = Array.from(imgs).every((im) => im.complete);
  if (allLoaded || imgs.length === 0) {
    start();
  } else {
    let loadedCount = 0;
    imgs.forEach((im) => {
      const done = () => {
        loadedCount += 1;
        if (loadedCount >= imgs.length) start();
      };
      im.addEventListener("load", done, { once: true });
      im.addEventListener("error", done, { once: true });
    });
  }

  const ro = new ResizeObserver(() => {
    if (cleanupAnim) cleanupAnim();
    requestAnimationFrame(start);
  });
  ro.observe(group);

  return () => {
    if (cleanupAnim) cleanupAnim();
    ro.disconnect();
    if (track.contains(clone)) track.removeChild(clone);
  };
};

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function ordinalDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDate();
  const sfx =
    day >= 11 && day <= 13
      ? "th"
      : { 1: "st", 2: "nd", 3: "rd" }[day % 10] || "th";
  const month = d.toLocaleString("en-US", { month: "long" }).toLowerCase();
  return `${day}${sfx} ${month}`;
}

function closeDateLabel(startDateStr) {
  const d = new Date(startDateStr + "T00:00:00");
  d.setDate(d.getDate() - 4);
  return ordinalDate(d.toISOString().split("T")[0]);
}

/* ─────────────────────────────────────────────
   MarqueeStrip — self-contained marquee band
───────────────────────────────────────────── */
const MarqueeStrip = ({ isMobile, spotsText, marqueeLabel }) => {
  const trackRef = useRef(null);
  const groupRef = useRef(null);

  useEffect(() => {
    return initMarquee(groupRef, trackRef);
  }, []);

  return (
    <div
      className={`absolute left-0 w-full border-t-2 border-b-2 border-black bg-evolve-lavender-indigo overflow-hidden z-40 bottom-0 ${
        isMobile ? "h-24" : "h-[7rem]"
      }`}
    >
      <div
        ref={trackRef}
        className="absolute top-1/2 -translate-y-1/2 left-0 flex whitespace-nowrap"
        style={{ willChange: "transform" }}
      >
        <div
          ref={groupRef}
          className={`flex items-center flex-none ${
            isMobile ? "gap-8 pr-8" : "gap-14 pr-14"
          }`}
        >
          {[0, 1, 2].map((i) => (
            <>
              <img
                key={`icon-a-${i}`}
                src={marquee_vector_2}
                alt=""
                className={`w-auto flex-none ${isMobile ? "h-10" : "h-[5rem]"}`}
              />
              <span
                key={`label-${i}`}
                className={`flex-none font-paralucent lowercase text-evolve-yellow ${
                  isMobile ? "text-3xl" : "text-5xl"
                }`}
              >
                {marqueeLabel}
              </span>
              <img
                key={`icon-b-${i}`}
                src={marquee_vector_2}
                alt=""
                className={`w-auto flex-none ${isMobile ? "h-10" : "h-[5rem]"}`}
              />
              <span
                key={`spots-${i}`}
                className={`flex-none font-paralucent lowercase text-evolve-yellow ${
                  isMobile ? "text-3xl" : "text-5xl"
                }`}
              >
                {spotsText}
              </span>
            </>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   GetStartedButton — shared hover button
───────────────────────────────────────────── */
const GetStartedButton = ({ onClick }) => {
  const [hover, setHover] = useState(false);
  return (
    <img
      // src={hover ? get_started_button_hover : get_started_button}
      src={apply_to_mentorship}
      alt="get started"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
      className="cursor-pointer transition-opacity duration-150"
      style={{
        width: "clamp(200px, 22vw, 320px)",
        marginTop: "clamp(24px, 3vh, 48px)"
      }}
    />
  );
};

/* ─────────────────────────────────────────────
   Main Mentorship page
───────────────────────────────────────────── */
const Mentorship = () => {
  const [applyHover, setApplyHover] = useState(false);
  const [howHover, setHowHover] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(null);
  const [batch, setBatch] = useState(null);
  const [batch1Full, setBatch1Full] = useState(false);
  const [allBatchesFull, setAllBatchesFull] = useState(false);
  const [pricingTab, setPricingTab] = useState("starter");
  const [hasPaid, setHasPaid] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const section5Ref = useRef(null); // framework
  const section6Ref = useRef(null); // pricing

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: "smooth" });

  // derived batch values (fallback to hardcoded while loading)
  const spotsLeft = batch?.spots_remaining ?? 5;
  const batchLabel = batch1Full
    ? "now open"
    : batch
      ? ordinalDate(batch.start_date)
      : "16th april";
  const closeLabel = batch ? closeDateLabel(batch.start_date) : "12th april";
  // shown in marquee + CTA
  const spotsText = allBatchesFull
    ? "join waitlist"
    : batch1Full
      ? "new batches"
      : `only ${spotsLeft} spots`;
  // full display label used in marquee and section headings
  const marqueeLabel = allBatchesFull
    ? "batches full"
    : batchLabel === "now open"
      ? "now open"
      : `batch starts on ${batchLabel}`;

  // CTA marquee refs
  const marqueeRef = useRef(null);
  const marqueeTrackRef = useRef(null);
  const marqueeGroupRef = useRef(null);

  // Pricing marquee refs
  // const pricingMarqueeRef = useRef(null);

  const pricingMarqueeTrackRef = useRef(null);
  const pricingMarqueeGroupRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    supabase
      .from("batch_spots")
      .select("*")
      .then(({ data }) => {
        if (!data || data.length === 0) return;
        const sorted = data.sort((a, b) => a.batch_number - b.batch_number);
        const lowestBatch = sorted[0];
        const isLowestFull =
          lowestBatch &&
          (lowestBatch.spots_remaining <= 0 || lowestBatch.status === "closed");
        setBatch1Full(isLowestFull);
        const isAllFull = sorted.every(
          (b) => b.spots_remaining <= 0 || b.status === "closed"
        );
        setAllBatchesFull(isAllFull);
        const available = sorted.filter(
          (b) => b.status === "open" && b.spots_remaining > 0
        );
        if (available.length > 0) setBatch(available[0]);
      });
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("mentorship_payments")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "success")
      .maybeSingle()
      .then(({ data }) => setHasPaid(!!data));
  }, [user]);

  useEffect(() => {
    return initMarquee(marqueeGroupRef, marqueeTrackRef);
  }, [marqueeLabel]);

  useEffect(() => {
    if (isMobile) return;
    return initMarquee(pricingMarqueeGroupRef, pricingMarqueeTrackRef);
  }, [isMobile]);

  const handlePayment = (plan) => {
    if (!user) {
      sessionStorage.setItem("signin_via_apply", "1");
      const dest = allBatchesFull
        ? "/payment?waitlist=true"
        : `/payment?plan=${plan}`;
      navigate("/signin", { state: { from: dest } });
      return;
    }
    if (hasPaid) {
      navigate("/mentorship-session");
      return;
    }
    if (allBatchesFull) {
      navigate("/payment?waitlist=true");
      return;
    }
    navigate(`/payment?plan=${plan}`);
  };

  const starterFeatures = COPY.pricing.starterFeatures;
  const acceleratorFeatures = COPY.pricing.acceleratorFeatures;

  return (
    <div className="bg-evolve-yellow">
      <SEO
        title={COPY.seo.title}
        description={COPY.seo.description}
        path="/mentorship"
      />
      {/* ================= SECTION 1 — HERO ================= */}
      <section className="relative h-screen bg-evolve-yellow overflow-hidden">
        <div className="absolute inset-x-0 z-30 flex flex-col items-center text-center px-4 top-[15%]">
          {/* <h1
            className="lowercase text-black font-semibold max-w-[80vw]"
            style={{
              fontSize: "clamp(20px, 2.5vw, 32px)",
              lineHeight: "clamp(28px, 3vw, 36px)"
            }}
          >
            evolve mentorship
          </h1> */}
          <p
            className="hidden lg:block mt-2 font-extrabold lowercase text-evolve-pink max-w-[100vw]"
            style={{
              fontSize: "clamp(58px, 8vw, 92px)",
              lineHeight: "1",
              letterSpacing: "-0.03em"
            }}
          >
            {renderWithBreaks(COPY.hero.headlineDesktop)}
          </p>
          <p
            className="md:hidden mt-2 font-extrabold lowercase text-evolve-pink max-w-[100vw]"
            style={{
              fontSize: "clamp(58px, 8vw, 92px)",
              lineHeight: "1",
              letterSpacing: "-0.03em"
            }}
          >
            {COPY.hero.headline}
          </p>
          <div className="mt-6 flex flex-col items-center gap-2">
            {hasPaid ? (
              <button
                onClick={() => navigate("/mentorship-session")}
                className="font-extrabold lowercase text-white cursor-pointer px-7 py-4 rounded-2xl"
                style={{
                  backgroundColor: "#000",
                  boxShadow: "4px 4px 0 0 #BF9C05"
                }}
              >
                my mentorship session
              </button>
            ) : (
              <>
                <img
                  src={applyHover ? explore_mentorship : explore_mentorship}
                  alt="apply now"
                  onMouseEnter={() => setApplyHover(true)}
                  onMouseLeave={() => setApplyHover(false)}
                  onClick={() => scrollTo(section5Ref)}
                  className="cursor-pointer transition-opacity duration-150"
                  style={{ width: isMobile ? "220px" : "220px" }}
                />
                <p className="text-black text-sm font-semibold">
                  {COPY.limitedSeatsNote}
                </p>
              </>
            )}
          </div>
        </div>
        <img
          src={hero_mentorship_mobile}
          alt="mentorship hero mobile"
          className="block md:hidden absolute bottom-0 w-full z-10 object-contain origin-bottom"
        />
        <img
          src={hero_mentorship_tab}
          alt="mentorship hero tablet"
          className="hidden md:block lg:hidden absolute bottom-0 w-full z-10 object-contain"
        />
        <img
          src={hero_mentorship}
          alt="mentorship hero desktop"
          className="hidden lg:block absolute -bottom-5 w-full z-10 object-contain"
        />
      </section>

      {/* ================= SECTION 2 — CTA ================= */}
      <section className="relative min-h-screen bg-evolve-yellow overflow-hidden">
        <div
          className="absolute inset-x-0 z-30 flex flex-col items-center text-center px-6"
          style={{ top: "20%" }}
        >
          <p
            className="text-black font-normal lowercase"
            style={{
              fontSize: isMobile
                ? "clamp(22px, 7vw, 36px)"
                : "clamp(36px, 3.2vw, 48px)",
              lineHeight: "1.35",
              maxWidth: isMobile ? "90vw" : "75%"
            }}
          >
            {COPY.cta.body}
          </p>
          <div className="flex flex-col items-center mt-10 gap-6">
            <img
              src={howHover ? how_button_hover : how_button}
              alt="how it works"
              onMouseEnter={() => setHowHover(true)}
              onMouseLeave={() => setHowHover(false)}
              onClick={() => scrollTo(section6Ref)}
              className="cursor-pointer transition-opacity duration-150"
              style={{ width: isMobile ? "180px" : "220px" }}
            />
          </div>
        </div>
        <img
          src={right_ribbon}
          alt=""
          className="hidden md:block absolute -bottom-[12rem] left-[-15rem] z-20 rotate-[250deg] w-[60%]"
        />
        <img
          src={right_ribbon}
          alt=""
          className="hidden md:block w-[60%] absolute -bottom-[10rem] right-[-20rem] z-20 rotate-[182deg]"
        />

        {/* CTA Marquee */}
        <div
          ref={marqueeRef}
          className={`absolute left-0 w-full border-t-2 border-b-2 border-evolve-yellow bg-evolve-lavender-indigo overflow-hidden z-30 ${isMobile ? "bottom-0 h-24" : "bottom-0 h-[7rem]"}`}
        >
          <div
            ref={marqueeTrackRef}
            className="absolute top-1/2 -translate-y-1/2 left-0 flex whitespace-nowrap"
            style={{ willChange: "transform" }}
          >
            <div
              ref={marqueeGroupRef}
              className={`flex items-center flex-none ${isMobile ? "gap-8 pr-8" : "gap-14 pr-14"}`}
            >
              {[0, 1, 2].map((i) => (
                <>
                  <img
                    key={`icon-a-${i}`}
                    src={marquee_vector_2}
                    alt=""
                    className={`w-auto flex-none ${isMobile ? "h-10" : "h-[5rem]"}`}
                  />
                  <span
                    key={`label-${i}`}
                    className={`flex-none font-paralucent lowercase text-evolve-yellow ${isMobile ? "text-4xl" : "text-5xl"}`}
                  >
                    {marqueeLabel}
                  </span>
                  <img
                    key={`icon-b-${i}`}
                    src={marquee_vector_2}
                    alt=""
                    className={`w-auto flex-none ${isMobile ? "h-10" : "h-[5rem]"}`}
                  />
                  <span
                    key={`spots-${i}`}
                    className={`flex-none font-paralucent lowercase text-evolve-yellow ${isMobile ? "text-4xl" : "text-5xl"}`}
                  >
                    {spotsText}
                  </span>
                </>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 3 — MENTOR (Desktop) ================= */}
      <section className="hidden md:block relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 flex flex-col pointer-events-none">
          <div className="bg-evolve-yellow" style={{ height: "40%" }} />
          <div className="bg-evolve-pink" style={{ height: "60%" }} />
        </div>
        <div className="relative z-10 h-screen flex">
          <div className="relative w-[45%] flex-shrink-0">
            <img
              src={mentor_yagnesh}
              alt="Yagnesh Ahir"
              className="absolute bottom-0 left-0 h-[100%] w-auto object-contain object-bottom"
            />
          </div>
          <div className="flex-1 flex flex-col">
            <div className="flex items-end pb-8" style={{ height: "40%" }}>
              <h2
                className="text-black font-extrabold lowercase leading-none"
                style={{
                  fontSize: "clamp(56px, 6.5vw, 96px)",
                  letterSpacing: "-0.5px"
                }}
              >
                {COPY.mentor.sectionHeading}
              </h2>
            </div>
            <div
              className="flex flex-col justify-center"
              style={{ height: "60%", paddingRight: "2vw" }}
            >
              <p
                className="font-extrabold lowercase text-evolve-yellow"
                style={{
                  fontSize: "clamp(40px, 4vw, 64px)",
                  letterSpacing: "-0.5px",
                  lineHeight: "1"
                }}
              >
                {COPY.mentor.name}
              </p>
              <p
                className="font-semibold text-evolve-yellow mt-3"
                style={{
                  fontSize: "clamp(16px, 1.8vw, 32px)",
                  letterSpacing: "-0.44px",
                  lineHeight: "1.1",
                  maxWidth: "800px"
                }}
              >
                {COPY.mentor.role}
              </p>
              <p
                className="font-normal text-white mt-5"
                style={{
                  fontSize: "clamp(14px, 1.4vw, 24px)",
                  letterSpacing: "-0.31px",
                  lineHeight: "1.3",
                  maxWidth: "800px"
                }}
              >
                8 years building products, improving UX for SaaS companies, and
                sitting on the other side of hiring decisions. He knows what
                gets designers noticed — and what quietly eliminates them.
                <br />
                <br />
                He's mentored 100+ designers. His approach: no noise, no fluff.
                Just clarity on who you are, where you fit, and exactly how to
                get there.
              </p>
              <a
                href="https://www.linkedin.com/in/yagnesh-ahir-24676516/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 mt-6 text-white font-normal hover:opacity-70 transition-opacity duration-150 w-fit"
                style={{
                  fontSize: "clamp(14px, 1vw, 18px)",
                  letterSpacing: "-0.2px"
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="white"
                  width="22"
                  height="22"
                  style={{ flexShrink: 0 }}
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.327-.025-3.037-1.852-3.037-1.854 0-2.137 1.446-2.137 2.94v5.666H9.351V9h3.414v1.561h.049c.476-.899 1.637-1.849 3.37-1.849 3.602 0 4.268 2.37 4.268 5.455v6.285zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                <span>view linkedin</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 3 — MENTOR (Mobile) ================= */}
      <section className="block md:hidden relative overflow-hidden min-h-screen">
        <div className="absolute inset-0 flex flex-col pointer-events-none">
          <div className="bg-evolve-yellow" style={{ height: "80%" }} />
          <div className="bg-evolve-pink" style={{ height: "20%" }} />
        </div>
        <img
          src={mentor_yagnesh}
          alt="Yagnesh Ahir"
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-10 object-contain object-bottom"
          style={{ height: "82%", width: "72%", maxWidth: "340px" }}
        />
        <div className="relative z-20 flex flex-col px-5 pt-[10%]">
          <h2
            className="text-black font-extrabold lowercase text-center w-full leading-tight"
            style={{
              fontSize: "clamp(32px, 10vw, 46px)",
              letterSpacing: "-0.5px"
            }}
          >
            who's guiding you.
          </h2>
          <div className="flex flex-col mt-5 w-full">
            <p
              className="font-extrabold lowercase text-evolve-pink"
              style={{
                fontSize: "clamp(26px, 7.5vw, 40px)",
                letterSpacing: "-0.29px",
                lineHeight: "1"
              }}
            >
              Yagnesh ahir
            </p>
            <p
              className="font-semibold text-black mt-2"
              style={{
                fontSize: "18px",
                letterSpacing: "-0.24px",
                lineHeight: "1.4"
              }}
            >
              {COPY.mentor.role}
            </p>
            <p
              className="font-normal text-black mt-3"
              style={{ fontSize: "16px", lineHeight: "1.55" }}
            >
              8 years building products, improving UX for SaaS companies, and
              sitting on the other side of hiring decisions. He knows what gets
              designers noticed — and what quietly eliminates them.
              <br />
              <br />
              He's mentored 100+ designers. His approach: no noise, no fluff.
              Just clarity on who you are, where you fit, and exactly how to get
              there.
            </p>
            <a
              href="https://www.linkedin.com/in/yagnesh-ahir-24676516/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 mt-4 font-normal hover:opacity-70 transition-opacity duration-150 w-fit"
              style={{
                fontSize: "16px",
                color: "var(--color-evolve-pink, #FF3366)"
              }}
            >
              <span>view linkedin</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                width="18"
                height="18"
                style={{ flexShrink: 0 }}
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.327-.025-3.037-1.852-3.037-1.854 0-2.137 1.446-2.137 2.94v5.666H9.351V9h3.414v1.561h.049c.476-.899 1.637-1.849 3.37-1.849 3.602 0 4.268 2.37 4.268 5.455v6.285zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ================= SECTION 4 — TESTIMONIALS (Desktop) ================= */}
      <section
        className="hidden md:flex flex-col relative bg-evolve-yellow overflow-hidden"
        style={{ height: "100vh", padding: "4vh 1vw" }}
      >
        <h2
          className="text-black font-extrabold lowercase text-center flex-shrink-0"
          style={{
            fontSize: "clamp(42px, 4vw, 64px)",
            letterSpacing: "-0.53px",
            lineHeight: "1",
            marginBottom: "3vh"
          }}
        >
          {COPY.testimonials.sectionHeading}
        </h2>
        <div className="flex gap-2 flex-1 min-h-0">
          <div
            className="rounded-2xl bg-[#7A44BC] flex flex-col justify-center p-8"
            style={{ flex: "0 0 30%" }}
          >
            <span
              className="text-evolve-yellow font-extrabold"
              style={{
                fontSize: "clamp(60px, 7vw, 120px)",
                lineHeight: "0.7",
                fontStyle: "italic"
              }}
            >
              "
            </span>
            <p
              className="font-bold text-white -mt-4"
              style={{
                fontSize: "clamp(14px, 1.5vw, 24px)",
                lineHeight: "1.4"
              }}
            >
              incredibly friendly from the get-go. he gave really clear and
              actionable points for me to move ahead in my design career.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <img
                src={TESTIMONIALS[0].image}
                alt={TESTIMONIALS[0].name}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2"
                style={{ borderColor: "var(--color-evolve-yellow, #FFD600)" }}
              />
              <div>
                <p
                  className="font-bold text-white"
                  style={{ fontSize: "clamp(12px, 1.2vw, 20px)" }}
                >
                  chinmay zinjal
                </p>
                <p
                  className="font-normal text-white"
                  style={{
                    fontSize: "clamp(11px, 1.1vw, 18px)",
                    lineHeight: "1.3"
                  }}
                >
                  chemical engineering student, IIT Guwahati
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2" style={{ flex: "0 0 35%" }}>
            <div
              className="rounded-2xl bg-[#7A44BC] flex flex-col justify-center p-8"
              style={{ flex: "4" }}
            >
              <span
                className="text-evolve-yellow font-extrabold"
                style={{
                  fontSize: "clamp(60px, 7vw, 120px)",
                  lineHeight: "0.7",
                  fontStyle: "italic"
                }}
              >
                "
              </span>
              <p
                className="font-bold text-white -mt-4"
                style={{
                  fontSize: "clamp(14px, 1.5vw, 24px)",
                  lineHeight: "1.4"
                }}
              >
                yagnesh gave me wonderful advice on how he approaches UX
                problems and runs a remote team. i walked away truly feeling
                inspired and enlightened.
              </p>
              <div className="flex items-center gap-3 mt-6">
                <img
                  src={TESTIMONIALS[1].image}
                  alt={TESTIMONIALS[1].name}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2"
                  style={{ borderColor: "var(--color-evolve-yellow, #FFD600)" }}
                />
                <div>
                  <p
                    className="font-bold text-white"
                    style={{ fontSize: "clamp(12px, 1.2vw, 20px)" }}
                  >
                    jon hwang
                  </p>
                  <p
                    className="font-normal text-white"
                    style={{
                      fontSize: "clamp(11px, 1.1vw, 18px)",
                      lineHeight: "1.3"
                    }}
                  >
                    communication coach &amp; UX research consultant
                  </p>
                </div>
              </div>
            </div>
            <div
              className="rounded-2xl bg-[#7A44BC] flex flex-col justify-center p-8"
              style={{ flex: "2" }}
            >
              <span
                className="text-evolve-yellow font-extrabold"
                style={{
                  fontSize: "clamp(60px, 7vw, 120px)",
                  lineHeight: "0.7",
                  fontStyle: "italic"
                }}
              >
                "
              </span>
              <p
                className="font-bold text-white -mt-4"
                style={{
                  fontSize: "clamp(14px, 1.5vw, 24px)",
                  lineHeight: "1.4"
                }}
              >
                he helped me a lot in understanding my path. i would 10/10
                recommend him.
              </p>
              <div className="flex items-center gap-3 mt-6">
                <img
                  src={TESTIMONIALS[2].image}
                  alt={TESTIMONIALS[2].name}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2"
                  style={{ borderColor: "var(--color-evolve-yellow, #FFD600)" }}
                />
                <div>
                  <p
                    className="font-bold text-white"
                    style={{ fontSize: "clamp(12px, 1.2vw, 20px)" }}
                  >
                    anish kumar
                  </p>
                  <p
                    className="font-normal text-white"
                    style={{
                      fontSize: "clamp(11px, 1.1vw, 18px)",
                      lineHeight: "1.3"
                    }}
                  >
                    lead product designer, smart energy waters
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div
            className="rounded-2xl bg-[#7A44BC] flex flex-col justify-center p-8"
            style={{ flex: "1" }}
          >
            <span
              className="text-evolve-yellow font-extrabold"
              style={{
                fontSize: "clamp(60px, 7vw, 120px)",
                lineHeight: "0.7",
                fontStyle: "italic"
              }}
            >
              "
            </span>
            <p
              className="font-bold text-white -mt-4"
              style={{
                fontSize: "clamp(14px, 1.5vw, 24px)",
                lineHeight: "1.4"
              }}
            >
              i'm thankful to yagnesh for his invaluable perspectives. the
              practical advice he provided on navigating the job search process
              was truly valuable. his positive outlook on the design industry
              and his insights on how my background in creative direction can
              contribute to product design have significantly bolstered my
              confidence. i eagerly anticipate further sessions with him in the
              future.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <img
                src={TESTIMONIALS[3].image}
                alt={TESTIMONIALS[3].name}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2"
                style={{ borderColor: "var(--color-evolve-yellow, #FFD600)" }}
              />
              <div>
                <p
                  className="font-bold text-white"
                  style={{ fontSize: "clamp(12px, 1.2vw, 20px)" }}
                >
                  Pradyumna K S
                </p>
                <p
                  className="font-normal text-white"
                  style={{
                    fontSize: "clamp(11px, 1.1vw, 18px)",
                    lineHeight: "1.3"
                  }}
                >
                  Product Designer, Kraverich
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 4 — TESTIMONIALS (Mobile) ================= */}
      <TestimonialsMobile />

      {/* scroll anchor for section 5 */}
      <div ref={section5Ref} />

      {/* ================= SECTION 5 — FRAMEWORK (Desktop) ================= */}
      <section
        className="hidden md:flex relative overflow-hidden"
        style={{ height: "100vh" }}
      >
        <div
          className="bg-evolve-yellow flex flex-col justify-center px-10 py-12"
          style={{ flex: "0 0 35%" }}
        >
          <p
            className="text-black font-normal lowercase"
            style={{
              fontSize: "clamp(22px, 2vw, 40px)",
              letterSpacing: "-2px"
            }}
          >
            {COPY.framework.sectionLabel}
          </p>
          <h2
            className="text-black font-extrabold lowercase mt-6"
            style={{
              fontSize: "clamp(52px, 5vw, 96px)",
              letterSpacing: "-0.53px",
              lineHeight: "1.05"
            }}
          >
            {spotsLeft} spots.
            <br />4 stages.
            <br />5 sessions.
          </h2>
          <p
            className="text-black font-bold lowercase mt-6"
            style={{
              fontSize: "clamp(18px, 2vw, 40px)",
              letterSpacing: "-2px"
            }}
          >
            {COPY.framework.sessionTime}
          </p>
        </div>
        <div className="bg-evolve-lavender-indigo flex flex-1 overflow-hidden py-12 px-10">
          <div
            className="flex flex-col justify-between"
            style={{ width: "38%" }}
          >
            {COPY.framework.stagesDesktop.map(({ label }) => (
              <p
                key={label}
                className="font-extrabold lowercase text-evolve-yellow"
                style={{
                  fontSize: "clamp(20px, 2vw, 40px)",
                  letterSpacing: "0.07px",
                  lineHeight: "1"
                }}
              >
                {label}
              </p>
            ))}
          </div>
          <div className="flex flex-col justify-between flex-1 pl-6">
            {COPY.framework.stagesDesktop.map(({ body }, i) => (
              <div key={i}>
                <div
                  className="w-full mb-3"
                  style={{
                    height: "2px",
                    backgroundColor: "var(--color-evolve-yellow, #FFD600)"
                  }}
                />
                <p
                  className="font-semibold text-white"
                  style={{
                    fontSize: "clamp(12px, 1.2vw, 24px)",
                    lineHeight: "1.4"
                  }}
                >
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SECTION 5 — FRAMEWORK (Mobile) ================= */}
      <section className="block md:hidden">
        <div className="bg-evolve-yellow px-5 pt-10 pb-8">
          <p
            className="text-black font-normal lowercase"
            style={{ fontSize: "24px", letterSpacing: "-1px" }}
          >
            {COPY.framework.sectionLabel}
          </p>
          <h2
            className="text-black font-extrabold lowercase mt-4"
            style={{
              fontSize: "48px",
              letterSpacing: "-0.53px",
              lineHeight: "1.05"
            }}
          >
            5 spots.
            <br />4 stages.
            <br />5 sessions.
          </h2>
          <p
            className="text-black font-bold lowercase mt-4"
            style={{ fontSize: "24px", letterSpacing: "-1px" }}
          >
            {COPY.framework.sessionTime}
          </p>
        </div>
        <div className="bg-evolve-lavender-indigo px-5 py-8 flex flex-col gap-8">
          {COPY.framework.stagesMobile.map(({ label, body }) => (
            <div key={label}>
              <p
                className="font-extrabold lowercase text-evolve-yellow"
                style={{
                  fontSize: "24px",
                  letterSpacing: "-0.53px",
                  lineHeight: "1"
                }}
              >
                {label}
              </p>
              <div
                className="w-full my-3"
                style={{
                  height: "2px",
                  backgroundColor: "var(--color-evolve-yellow, #FFD600)"
                }}
              />
              <p
                className="font-semibold text-white"
                style={{ fontSize: "20px", lineHeight: "1.45" }}
              >
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* scroll anchor for section 6 */}
      <div ref={section6Ref} />

      {/* ================= SECTION 6 — PRICING ================= */}
      <section className="bg-evolve-yellow overflow-hidden">
        {/* ── Full-width pink header banner ── */}
        <div className="w-full bg-evolve-pink flex items-center justify-center py-5 md:py-7">
          <h2
            className="text-white font-extrabold lowercase text-center"
            style={{
              fontSize: "clamp(28px, 5vw, 56px)",
              letterSpacing: "-0.02em"
            }}
          >
            what it costs.
          </h2>
        </div>

        {/* ── DESKTOP: two columns ── */}
        <div className="hidden md:flex w-full">
          <div style={{ flex: "0 0 50%" }}>
            <PlanColumn
              tier="starter"
              cutPrice="₹ 35,000"
              price="₹ 15,000"
              tagline="for those who need a direction on where to start"
              features={starterFeatures}
              isRight={false}
              onPay={handlePayment}
              hasPaid={hasPaid}
              allBatchesFull={allBatchesFull}
            />
          </div>
          <div style={{ flex: "0 0 50%" }}>
            <PlanColumn
              tier="accelerator"
              cutPrice="₹ 50,000"
              price="₹ 35,000"
              tagline="for those who have interviews lined up and need to crack it"
              features={acceleratorFeatures}
              isRight={true}
              onPay={handlePayment}
              hasPaid={hasPaid}
              allBatchesFull={allBatchesFull}
            />
          </div>
        </div>

        {/* ── DESKTOP: marquee ── */}
        {/* <div
          ref={pricingMarqueeRef}
          className="hidden md:block relative left-0 w-full border-t-2 border-b-2 border-evolve-yellow bg-evolve-lavender-indigo overflow-hidden z-30 h-[7rem]"
        >
          <div
            ref={pricingMarqueeTrackRef}
            className="absolute top-1/2 -translate-y-1/2 left-0 flex whitespace-nowrap"
            style={{ willChange: "transform" }}
          >
            <div
              ref={pricingMarqueeGroupRef}
              className="flex items-center flex-none gap-14 pr-14"
            >
              <img
                src={marquee_vector_2}
                alt=""
                className="w-auto flex-none h-[5rem]"
              />
              <span className="flex-none font-paralucent lowercase text-evolve-yellow text-5xl">
                batch starts on 16th april
              </span>
              <img
                src={marquee_vector_2}
                alt=""
                className="w-auto flex-none h-[5rem]"
              />
              <span className="flex-none font-paralucent lowercase text-evolve-yellow text-5xl">
                only 5 spots left
              </span>
              <img
                src={marquee_vector_2}
                alt=""
                className="w-auto flex-none h-[5rem]"
              />
              <span className="flex-none font-paralucent lowercase text-evolve-yellow text-5xl">
                batch starts on 16th april
              </span>
            </div>
          </div>
        </div> */}

        {/* ── MOBILE: tab system ── */}
        <div className="block md:hidden">
          {!hasPaid && (
            <div className="flex">
              <button
                onClick={() => setPricingTab("starter")}
                className="flex-1 py-3 font-extrabold lowercase text-lg"
                style={{
                  backgroundColor:
                    pricingTab === "starter" ? "rgba(223,5,134,1)" : "#BF9C05",
                  color: pricingTab === "starter" ? "#fff" : "#000"
                }}
              >
                starter
              </button>
              <button
                onClick={() => setPricingTab("accelerator")}
                className="flex-1 py-3 font-extrabold lowercase text-lg"
                style={{
                  backgroundColor:
                    pricingTab === "accelerator"
                      ? "rgba(223,5,134,1)"
                      : "#BF9C05",
                  color: pricingTab === "accelerator" ? "#fff" : "#000"
                }}
              >
                accelerator
              </button>
            </div>
          )}
          {pricingTab === "starter" && (
            <PlanCardMobile
              tier="starter"
              cutPrice="₹ 35,000"
              price="₹ 15,000"
              tagline="for those who need a direction on where to start"
              features={starterFeatures}
              onPay={handlePayment}
              hasPaid={hasPaid}
              allBatchesFull={allBatchesFull}
            />
          )}
          {pricingTab === "accelerator" && (
            <PlanCardMobile
              tier="accelerator"
              cutPrice="₹ 50,000"
              price="₹ 35,000"
              tagline="for those who have interviews lined up and need to crack it"
              features={acceleratorFeatures}
              onPay={handlePayment}
              hasPaid={hasPaid}
              allBatchesFull={allBatchesFull}
            />
          )}
        </div>
      </section>
      {/* ================= SECTION 7 — IMPACT ================= */}
      {/* Desktop */}
      <div className="hidden md:block w-full">
        <img src={impact_thing} alt="impact" className="w-full h-auto block" />
      </div>
      {/* Mobile */}
      <div className="block md:hidden w-full">
        <img
          src={impact_thing_mobile}
          alt="impact"
          className="w-full h-auto block"
        />
      </div>

      {/* ================= SECTION 8 — WHY WE BUILT THIS (Desktop) ================= */}
      <section className="hidden md:flex relative min-h-screen bg-evolve-yellow overflow-hidden flex-col items-center">
        {/* Content — centered top */}
        <div
          className="relative z-10 flex flex-col items-center text-center"
          style={{
            paddingTop: "clamp(64px, 8vh, 120px)",
            paddingLeft: "clamp(32px, 6vw, 120px)",
            paddingRight: "clamp(32px, 6vw, 120px)"
          }}
        >
          {/* Heading */}
          <h2
            className="font-extrabold lowercase text-black"
            style={{
              fontSize: "clamp(56px, 7vw, 96px)",
              lineHeight: "1",
              letterSpacing: "-3%"
            }}
          >
            why we built this
          </h2>

          {/* Sub heading */}
          <p
            className="font-normal lowercase text-black mt-6"
            style={{
              fontSize: "clamp(28px, 3.2vw, 48px)",
              lineHeight: "1.15",
              letterSpacing: "-3%",
              maxWidth: "80vw"
            }}
          >
            the gap isn't skill. it's direction
          </p>

          {/* Body text */}
          <p
            className="font-normal text-evolve-pink mt-6"
            style={{
              fontSize: "clamp(18px, 2.2vw, 32px)",
              lineHeight: "1.45",
              letterSpacing: "-0.3px",
              maxWidth: "70vw"
            }}
          >
            Most designers know how to design. What's harder is knowing which
            roles fit, how to position yourself, and where to even start. That's
            what this is for.
          </p>

          {/* Explore plans / session button */}
          {hasPaid ? (
            <button
              onClick={() => navigate("/mentorship-session")}
              className="font-extrabold lowercase text-white cursor-pointer mt-8 px-7 py-4 rounded-2xl"
              style={{
                backgroundColor: "#000",
                boxShadow: "4px 4px 0 0 #BF9C05"
              }}
            >
              my mentorship session
            </button>
          ) : (
            <img
              src={explore_plans}
              alt="explore plans"
              onClick={() => scrollTo(section6Ref)}
              className="cursor-pointer mt-8 transition-opacity duration-150 hover:opacity-80"
              style={{ width: "clamp(200px, 22vw, 320px)" }}
            />
          )}
        </div>

        {/* Ribbons — bottom corners */}
        <img
          src={right_eye_ribbon}
          alt=""
          className="absolute bottom-[6rem] right-0 z-10 w-[45%]"
          // style={{ height: "clamp(200px, 30vh, 420px)" }}
        />
        <img
          src={left_eye_ribbon}
          alt=""
          className="absolute bottom-[4rem] left-0 z-20 w-[45%]"
          // style={{ height: "clamp(200px, 30vh, 420px)" }}
        />
        <MarqueeStrip
          key={marqueeLabel}
          isMobile={false}
          spotsText={spotsText}
          marqueeLabel={marqueeLabel}
        />
      </section>

      {/* ================= SECTION 8 — WHY WE BUILT THIS (Mobile) ================= */}
      <section className="block md:hidden relative bg-evolve-yellow overflow-hidden min-h-screen">
        {/* Content */}
        <div
          className="relative z-30 flex flex-col items-center text-center px-5"
          style={{ paddingTop: "clamp(48px, 10vh, 80px)" }}
        >
          {/* Heading */}
          <h2
            className="font-extrabold lowercase text-black"
            style={{
              fontSize: "clamp(36px, 10vw, 52px)",
              lineHeight: "1.05",
              letterSpacing: "-0.03em"
            }}
          >
            why we built this
          </h2>

          {/* Sub heading */}
          <p
            className="font-normal lowercase text-black mt-4"
            style={{
              fontSize: "clamp(22px, 6vw, 32px)",
              lineHeight: "1.2",
              letterSpacing: "-0.03em"
            }}
          >
            the gap isn't skill. it's direction
          </p>

          {/* Body text */}
          <p
            className="font-normal text-evolve-pink mt-4"
            style={{
              fontSize: "clamp(16px, 4.5vw, 22px)",
              lineHeight: "1.5",
              letterSpacing: "-0.2px",
              maxWidth: "86vw"
            }}
          >
            Most designers know how to design. What's harder is knowing which
            roles fit, how to position yourself, and where to even start. That's
            what this is for.
          </p>

          {/* Explore plans / session button */}
          {hasPaid ? (
            <button
              onClick={() => navigate("/mentorship-session")}
              className="font-extrabold lowercase text-white cursor-pointer mt-6 px-7 py-4 rounded-2xl"
              style={{
                backgroundColor: "#000",
                boxShadow: "4px 4px 0 0 #BF9C05"
              }}
            >
              my mentorship session
            </button>
          ) : (
            <img
              src={explore_plans}
              alt="explore plans"
              onClick={() => scrollTo(section6Ref)}
              className="cursor-pointer mt-6 transition-opacity duration-150 active:opacity-70"
              style={{ width: "clamp(180px, 55vw, 260px)" }}
            />
          )}
        </div>

        {/* Ribbons — bottom corners, mobile variants */}
        <img
          src={right_eye_ribbon_mobile}
          alt=""
          className="absolute bottom-[4rem] right-0 z-20 w-full"
          // style={{ height: "clamp(140px, 28vw, 220px)" }}
        />
        <img
          src={left_eye_ribbon_mobile}
          alt=""
          className="absolute bottom-[4rem] left-0 z-10 w-auto"
          // style={{ height: "clamp(140px, 28vw, 220px)" }}
        />
        <MarqueeStrip
          key={marqueeLabel}
          isMobile={true}
          spotsText={spotsText}
          marqueeLabel={marqueeLabel}
        />
      </section>

      {/* ================= SECTION 9 — FAQ (Desktop) ================= */}
      <section className="hidden md:flex bg-evolve-yellow min-h-screen">
        {/* Left 35% — heading */}
        <div
          className="flex-shrink-0 flex flex-col"
          style={{
            width: "35%",
            paddingTop: "clamp(80px, 10vh, 140px)",
            paddingLeft: "clamp(40px, 5vw, 80px)",
            paddingRight: "clamp(24px, 2vw, 40px)"
          }}
        >
          <h2
            className="font-extrabold lowercase text-black"
            style={{
              fontSize: "clamp(64px, 7vw, 96px)",
              lineHeight: "1.05",
              letterSpacing: "-0.53px"
            }}
          >
            good
            <br />
            to know.
          </h2>
          <div className="mt-10">
            <p className="font-semibold lowercase text-black text-base mb-4">
              have more questions?
            </p>
            <a
              href="https://wa.me/919227123007?text=Hi%2C%20I%20have%20a%20question%20about%20evolve%20mentorship"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-extrabold lowercase text-white rounded-xl px-6 py-3 text-base transition-opacity hover:opacity-90 active:opacity-80"
              style={{ backgroundColor: "#000" }}
            >
              connect with us
            </a>
          </div>
        </div>

        {/* Right 65% — accordion */}
        <div
          className="flex-1 flex items-center"
          style={{
            paddingRight: "clamp(40px, 5vw, 80px)",
            paddingTop: "clamp(48px, 6vh, 80px)",
            paddingBottom: "clamp(48px, 6vh, 80px)"
          }}
        >
          <div className="w-full">
            {FAQS.map((item, i) => (
              <div key={i}>
                <div
                  className="flex items-center justify-between cursor-pointer"
                  style={{
                    paddingTop: "clamp(20px, 4vh, 32px)",
                    paddingBottom: "clamp(20px, 4vh, 32px)"
                  }}
                  onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                >
                  <span
                    className="font-semibold lowercase text-black"
                    style={{
                      fontSize: "34px",
                      letterSpacing: "-0.02em",
                      lineHeight: "1.2"
                    }}
                  >
                    {item.q}
                  </span>
                  <span className="ml-4 flex-shrink-0">
                    <svg
                      width="34"
                      height="34"
                      viewBox="0 0 32 32"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{
                        transform:
                          openFAQ === i ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.25s ease"
                      }}
                    >
                      <path
                        d="M8 12L16 20L24 12"
                        stroke="black"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
                {openFAQ === i && (
                  <p
                    className="font-normal lowercase text-black"
                    style={{
                      fontSize: "29px",
                      lineHeight: "1.4",
                      letterSpacing: "-0.02em",
                      paddingBottom: "clamp(20px, 2.5vh, 32px)"
                    }}
                  >
                    {item.a}
                  </p>
                )}
                {i !== FAQS.length - 1 && (
                  <div
                    style={{
                      height: "1px",
                      backgroundColor: "#000000",
                      width: "100%"
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SECTION 9 — FAQ (Mobile) ================= */}
      <section
        className="block md:hidden bg-evolve-yellow"
        style={{
          padding: "clamp(40px, 10vw, 64px) 20px clamp(48px, 10vw, 72px)"
        }}
      >
        <h2
          className="font-extrabold lowercase text-black"
          style={{
            fontSize: "clamp(40px, 12vw, 56px)",
            lineHeight: "1.05",
            letterSpacing: "-0.53px",
            marginBottom: "clamp(28px, 7vw, 40px)"
          }}
        >
          good
          <br />
          to know.
        </h2>
        <div className="w-full">
          {FAQS.map((item, i) => (
            <div key={i}>
              <div
                className="flex items-center justify-between cursor-pointer"
                style={{ paddingTop: "20px", paddingBottom: "20px" }}
                onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
              >
                <span
                  className="font-semibold lowercase text-black"
                  style={{
                    fontSize: "clamp(17px, 5vw, 22px)",
                    letterSpacing: "-0.02em",
                    lineHeight: "1.2"
                  }}
                >
                  {item.q}
                </span>
                <span className="ml-3 flex-shrink-0">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      transform:
                        openFAQ === i ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.25s ease"
                    }}
                  >
                    <path
                      d="M8 12L16 20L24 12"
                      stroke="black"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
              {openFAQ === i && (
                <p
                  className="font-normal lowercase text-black"
                  style={{
                    fontSize: "clamp(15px, 4.5vw, 19px)",
                    lineHeight: "1.4",
                    letterSpacing: "-0.02em",
                    paddingBottom: "20px"
                  }}
                >
                  {item.a}
                </p>
              )}
              {i !== FAQS.length - 1 && (
                <div
                  style={{
                    height: "1px",
                    backgroundColor: "#000000",
                    width: "100%"
                  }}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-start gap-3">
          <p className="font-semibold lowercase text-black text-base">
            have more questions?
          </p>
          <a
            href="https://wa.me/919227123007?text=Hi%2C%20I%20have%20a%20question%20about%20evolve%20mentorship"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-extrabold lowercase text-white rounded-xl px-6 py-3 text-base active:opacity-80"
            style={{ backgroundColor: "#000" }}
          >
            connect with us
          </a>
        </div>
      </section>

      {/* ================= SECTION 10 — CLOSING CTA (Desktop) ================= */}
      <section className="hidden md:flex relative bg-evolve-lavender-indigo overflow-hidden flex-col items-center justify-center min-h-screen">
        {/* Content — vertically & horizontally centered */}
        <div
          className="relative z-10 flex flex-col  items-center text-center max-w-[50%] px-8"
          style={{ paddingBottom: "clamp(120px, 18vh, 200px)" }}
        >
          {/* Batch heading */}
          <h2
            className="font-extrabold  lowercase text-evolve-yellow"
            style={{
              fontSize: "clamp(72px, 6vw, 128px)",
              lineHeight: "0.9",
              letterSpacing: "-0.03em"
            }}
          >
            {marqueeLabel}
          </h2>

          {/* Limited seats */}
          <p
            className="font-normal lowercase text-white"
            style={{
              fontSize: "clamp(28px, 3vw, 48px)",
              letterSpacing: "-3px",
              marginTop: "clamp(16px, 2vh, 28px)"
            }}
          >
            {spotsText}
          </p>

          {/* Applications close */}
          {!allBatchesFull && (
            <p
              className="font-extrabold lowercase text-white"
              style={{
                fontSize: "clamp(28px, 3vw, 48px)",
                letterSpacing: "-0.5px",
                marginTop: "clamp(32px, 4vh, 56px)",
                lineHeight: "1.1"
              }}
            >
              {`applications close on ${closeLabel}`}
            </p>
          )}

          {/* Tagline */}
          <p
            className="font-normal lowercase text-white"
            style={{
              fontSize: "clamp(20px, 2vw, 32px)",
              lineHeight: "1.2",
              marginTop: "clamp(24px, 3vh, 40px)",
              maxWidth: "60ch"
            }}
          >
            if you're serious about your design career,
            <br />
            this is where to start.
          </p>

          {/* CTA button */}
          {hasPaid ? (
            <button
              onClick={() => navigate("/mentorship-session")}
              className="font-extrabold lowercase text-white cursor-pointer px-7 py-4 rounded-2xl"
              style={{
                backgroundColor: "#000",
                boxShadow: "4px 4px 0 0 #BF9C05"
              }}
            >
              my mentorship session
            </button>
          ) : (
            <GetStartedButton onClick={() => scrollTo(section6Ref)} />
          )}
        </div>

        {/* Bottom vector — full width */}
        <img
          src={mentorship_vector}
          alt=""
          className="absolute -bottom-[3rem] left-0 w-full z-0 block"
        />
      </section>

      {/* ================= SECTION 10 — CLOSING CTA (Mobile) ================= */}
      <section className="flex md:hidden relative bg-evolve-lavender-indigo overflow-hidden min-h-screen flex-col items-center justify-center">
        <div
          className="relative z-10 flex flex-col items-center text-center px-5"
          style={{ paddingBottom: "clamp(100px, 32vw, 160px)" }}
        >
          {/* Batch heading */}
          <h2
            className="font-extrabold lowercase text-evolve-yellow"
            style={{
              fontSize: "clamp(44px, 12vw, 64px)",
              lineHeight: "1.05",
              letterSpacing: "-0.03em"
            }}
          >
            {marqueeLabel}
          </h2>

          {/* Limited seats */}
          <p
            className="font-normal lowercase text-white"
            style={{
              fontSize: "clamp(20px, 5.5vw, 28px)",
              letterSpacing: "-1px",
              marginTop: "clamp(10px, 3vw, 18px)"
            }}
          >
            {spotsText}
          </p>

          {/* Applications close */}
          {!allBatchesFull && (
            <p
              className="font-extrabold lowercase text-white"
              style={{
                fontSize: "clamp(20px, 5.5vw, 28px)",
                letterSpacing: "-0.5px",
                marginTop: "clamp(20px, 6vw, 36px)",
                lineHeight: "1.15"
              }}
            >
              {`applications close on ${closeLabel}`}
            </p>
          )}

          {/* Tagline */}
          <p
            className="font-normal lowercase mb-2 text-white"
            style={{
              fontSize: "clamp(16px, 4.5vw, 22px)",
              lineHeight: "1.4",
              marginTop: "clamp(16px, 5vw, 28px)",
              maxWidth: "36ch"
            }}
          >
            if you're serious about your design career, this is where to start.
          </p>

          {/* CTA button */}
          {hasPaid ? (
            <button
              onClick={() => navigate("/mentorship-session")}
              className="font-extrabold lowercase text-white cursor-pointer px-7 py-4 rounded-2xl"
              style={{
                backgroundColor: "#000",
                boxShadow: "4px 4px 0 0 #BF9C05"
              }}
            >
              my mentorship session
            </button>
          ) : (
            <GetStartedButton onClick={() => scrollTo(section6Ref)} />
          )}
        </div>

        {/* Bottom vector — full width */}
        <img
          src={mentorship_vector_mobile}
          alt=""
          className="absolute bottom-0 left-0 w-full z-0 block"
        />
      </section>
    </div>
  );
};

export default Mentorship;
