import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MemberCard from "./MemberCard";

const SLIDE_GAP = 48;

// Mobile-only, one card at a time. Arrows, dots and swipe; wraps around.
const MemberCarousel = ({ members, photoBg, size }) => {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(null);
  const count = members.length;

  const go = (next) => setIndex((next + count) % count);

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? index + 1 : index - 1);
    touchStartX.current = null;
  };

  return (
    <div className="md:hidden mt-10">
      <div
        className="overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Gap keeps the outgoing card's icon from butting against the
            incoming card's name mid-slide; the offset accounts for it. */}
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{
            gap: `${SLIDE_GAP}px`,
            transform: `translateX(calc(-${index} * (100% + ${SLIDE_GAP}px)))`
          }}
        >
          {members.map((member) => (
            <div key={member.name} className="w-full shrink-0">
              <MemberCard member={member} photoBg={photoBg} size={size} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 flex items-center justify-between">
        <button
          type="button"
          onClick={() => go(index - 1)}
          aria-label="Previous"
          className="p-1 text-black"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          {members.map((member, i) => (
            <button
              key={member.name}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show ${member.name}`}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === index ? "bg-black" : "bg-[#806804]"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => go(index + 1)}
          aria-label="Next"
          className="p-1 text-black"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default MemberCarousel;
