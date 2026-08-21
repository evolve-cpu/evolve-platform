import React, { useRef, useState, useEffect, useCallback } from "react";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import {
  community_logo,
  mentorship_logo,
  portfolio_review_logo,
  portfolio_review_logo_hover,
  webinar_logo
} from "../../assets/images/Home";

// ─── Card data ────────────────────────────────────────────────────────────────
const CARDS = [
  {
    id: "Portfolio-review",
    title: "Portfolio review",
    desc: "Find out if your portfolio is",
    logo: portfolio_review_logo,
    hoverLogo: portfolio_review_logo_hover,
    imageWidth: "70%",
    link: "/portfolio-review"
  },
  {
    id: "mentorship",
    title: "Mentorship",
    desc: "1:1 support. learn from experienced designers.",
    logo: mentorship_logo,
    imageWidth: "72%",
    link: "/mentorship"
  },
  {
    id: "webinar",
    title: "Webinar",
    desc: "Expert-led sessions. learn, engage, and grow.",
    logo: webinar_logo,
    imageWidth: "60%",
    link: "/webinars"
  }
];

// ─── OvalFullCard ─────────────────────────────────────────────────────────────
const OvalFullCard = React.forwardRef(({ card, onClick, style }, ref) => {
  const innerRef = useRef(null);
  const touchStart = useRef({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const { title, desc, logo, hoverLogo, imageWidth } = card;

  const handleTouchStart = (e) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };
  const handleTouchEnd = (e) => {
    const dx = Math.abs(e.changedTouches[0].clientX - touchStart.current.x);
    const dy = Math.abs(e.changedTouches[0].clientY - touchStart.current.y);
    if (dx < 10 && dy < 10) {
      e.stopPropagation();
      e.preventDefault();
      if (onClick) onClick();
    }
  };

  return (
    <div
      ref={ref}
      onClick={onClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => {
        if (innerRef.current)
          innerRef.current.style.background = "rgba(223,5,134,1)";
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        if (innerRef.current)
          innerRef.current.style.background = "rgba(163,91,251,1)";
        setIsHovered(false);
      }}
      style={{
        display: "block",
        flexShrink: 0,
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
        ...style
      }}
    >
      <div
        ref={innerRef}
        style={{
          background: "rgba(163,91,251,1)",
          transition: "background 0.22s ease",
          borderRadius: "180px",
          width: "100%",
          aspectRatio: "0.65 / 1",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16% 12% 12%",
          boxSizing: "border-box"
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "5%",
            borderRadius: "150px",
            border: "1.5px solid rgba(255,208,7,0.8)",
            pointerEvents: "none"
          }}
        />
        <img
          src={isHovered && hoverLogo ? hoverLogo : logo}
          alt={title}
          style={{
            width: imageWidth,
            height: "auto",
            flexShrink: 0,
            position: "relative",
            zIndex: 1
          }}
        />
        <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <p
            style={{
              color: "#fff",
              fontWeight: 800,
              fontSize: "1.4rem",
              margin: 0,
              marginBottom: "0.3rem",
              letterSpacing: "-0.02em"
            }}
          >
            {title}
          </p>
          <p
            style={{
              color: "rgba(255,255,255,0.88)",
              fontSize: "0.92rem",
              margin: 0,
              lineHeight: 1.45
            }}
          >
            {desc}
          </p>
        </div>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "rgba(20,20,20,0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            zIndex: 1,
            flexShrink: 0
          }}
        >
          <span style={{ color: "#fff", fontSize: "1rem" }}>{"→"}</span>
        </div>
      </div>
    </div>
  );
});
OvalFullCard.displayName = "OvalFullCard";

// ─── Scene3_refined ───────────────────────────────────────────────────────────
const Scene3_refined = React.forwardRef(
  ({ isMobile = false, isActive = false }, ref) => {
    const containerRef = useRef(null);
    const card1Ref = useRef(null);
    const card2Ref = useRef(null);
    const card3Ref = useRef(null);
    const navigate = useNavigate();

    const [currentCard, setCurrentCard] = useState(0);
    const isAnimatingRef = useRef(false);
    const touchStartXRef = useRef(0);
    const touchStartYRef = useRef(0);

    React.useImperativeHandle(ref, () => ({
      container: containerRef.current
    }));

    // Desktop: floating animation when active
    useEffect(() => {
      if (isMobile || !isActive) return;
      const refs = [card1Ref.current, card2Ref.current, card3Ref.current];
      const tweens = refs.map((el, i) => {
        if (!el) return null;
        return gsap.to(el, {
          y: "-=15",
          duration: 2.5,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: i * 0.3
        });
      });
      return () => tweens.forEach((t) => t?.kill());
    }, [isMobile, isActive]);

    // Mobile: carousel card slide
    const goToCard = useCallback(
      (next) => {
        if (isAnimatingRef.current) return;
        const clampedNext = Math.max(0, Math.min(CARDS.length - 1, next));
        if (clampedNext === currentCard) return;
        isAnimatingRef.current = true;

        const dir = clampedNext > currentCard ? 1 : -1;
        const cardRefs = [card1Ref.current, card2Ref.current, card3Ref.current];
        const outEl = cardRefs[currentCard];
        const inEl = cardRefs[clampedNext];

        if (outEl) {
          gsap.to(outEl, {
            x: dir > 0 ? "-100%" : "100%",
            opacity: 0,
            duration: 0.4,
            ease: "power2.inOut"
          });
        }
        if (inEl) {
          gsap.fromTo(
            inEl,
            { x: dir > 0 ? "100%" : "-100%", opacity: 0 },
            {
              x: "0%",
              opacity: 1,
              duration: 0.4,
              ease: "power2.inOut",
              onComplete: () => {
                isAnimatingRef.current = false;
              }
            }
          );
        }
        setCurrentCard(clampedNext);
      },
      [currentCard]
    );

    // Mobile: reset positions when cards change
    useEffect(() => {
      if (!isMobile) return;
      const cardRefs = [card1Ref.current, card2Ref.current, card3Ref.current];
      cardRefs.forEach((el, i) => {
        if (!el) return;
        if (i === currentCard) {
          gsap.set(el, { x: "0%", opacity: 1 });
        } else {
          gsap.set(el, { x: i < currentCard ? "-100%" : "100%", opacity: 0 });
        }
      });
    }, [isMobile]); // only on mount/mode change

    // Mobile swipe on container
    const handleTouchStart = (e) => {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
    };
    const handleTouchEnd = (e) => {
      const dx = touchStartXRef.current - e.changedTouches[0].clientX;
      const dy = Math.abs(touchStartYRef.current - e.changedTouches[0].clientY);
      if (Math.abs(dx) > 40 && dy < 60) {
        goToCard(currentCard + (dx > 0 ? 1 : -1));
      }
    };

    // ─── Desktop layout ────────────────────────────────────────────────────────
    if (!isMobile) {
      return (
        <section
          ref={containerRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            background: "rgb(255,208,7)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          {/* Title at top */}
          <div
            style={{
              paddingTop: "clamp(48px,8vh,96px)",
              textAlign: "center",
              fontWeight: 800,
              fontSize: "clamp(40px,4vw,64px)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "#000",
              zIndex: 10
            }}
          >
            The evolve ecosystem
          </div>

          {/* Cards row */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "row",
              gap: "clamp(16px,2vw,40px)",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 clamp(24px,4vw,80px)",
              width: "100%",
              boxSizing: "border-box"
            }}
          >
            {CARDS.map((card, i) => {
              const cardRefs = [card1Ref, card2Ref, card3Ref];
              return (
                <OvalFullCard
                  key={card.id}
                  ref={cardRefs[i]}
                  card={card}
                  onClick={() => navigate(card.link)}
                  style={{
                    width: "clamp(220px,22vw,340px)",
                    flexShrink: 0
                  }}
                />
              );
            })}
          </div>
        </section>
      );
    }

    // ─── Mobile / tablet-portrait layout ──────────────────────────────────────
    return (
      <section
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          background: "rgb(255,208,7)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        {/* Title at top */}
        <div
          style={{
            paddingTop: "clamp(74px,16vh,110px)",
            textAlign: "center",
            fontWeight: 800,
            fontSize: "clamp(32px,8vw,52px)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "#000",
            zIndex: 10,
            flexShrink: 0,
            paddingLeft: "5vw",
            paddingRight: "5vw"
          }}
        >
          The evolve ecosystem
        </div>

        {/* Card area (clipping container) */}
        <div
          style={{
            flex: 1,
            width: "100%",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {CARDS.map((card, i) => {
            const cardRefs = [card1Ref, card2Ref, card3Ref];
            return (
              <OvalFullCard
                key={card.id}
                ref={cardRefs[i]}
                card={card}
                onClick={() => navigate(card.link)}
                style={{
                  position: "absolute",
                  width: "clamp(220px,68vw,380px)",
                  opacity: i === 0 ? 1 : 0
                }}
              />
            );
          })}
        </div>

        {/* Carousel controls */}
        <div
          style={{
            flexShrink: 0,
            paddingBottom: "clamp(24px,5vh,48px)",
            display: "flex",
            alignItems: "center",
            gap: "clamp(16px,5vw,32px)",
            // add this
            transform: "translateY(-30px)"
          }}
        >
          {/* Left arrow */}
          <button
            onClick={() => goToCard(currentCard - 1)}
            disabled={currentCard === 0}
            style={{
              background: "none",
              border: "none",
              color: currentCard === 0 ? "rgba(0,0,0,0.3)" : "#000",
              fontSize: "1.6rem",
              fontWeight: 700,
              cursor: currentCard === 0 ? "not-allowed" : "pointer",
              padding: "0 8px",
              lineHeight: 1,
              flexShrink: 0
            }}
          >
            {"<"}
          </button>

          {/* Dots */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {CARDS.map((_, i) => (
              <button
                key={i}
                onClick={() => goToCard(i)}
                style={{
                  width: i === currentCard ? 10 : 8,
                  height: i === currentCard ? 10 : 8,
                  borderRadius: "50%",
                  border: "2px solid rgba(163,91,251,1)",
                  background:
                    i === currentCard ? "rgba(163,91,251,1)" : "transparent",
                  padding: 0,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  flexShrink: 0
                }}
              />
            ))}
          </div>

          {/* Right arrow */}
          <button
            onClick={() => goToCard(currentCard + 1)}
            disabled={currentCard === CARDS.length - 1}
            style={{
              background: "none",
              border: "none",
              color:
                currentCard === CARDS.length - 1 ? "rgba(0,0,0,0.3)" : "#000",
              fontSize: "1.6rem",
              fontWeight: 700,
              cursor:
                currentCard === CARDS.length - 1 ? "not-allowed" : "pointer",
              padding: "0 8px",
              lineHeight: 1,
              flexShrink: 0
            }}
          >
            {">"}
          </button>
        </div>
      </section>
    );
  }
);

Scene3_refined.displayName = "Scene3_refined";
export default Scene3_refined;
