import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

const drivePhoto = (id) => `https://lh3.googleusercontent.com/d/${id}=w600`;

// Mobile-only 2-up grid of photos + names. Tapping one calls onSelect(index).
export const MobileMemberGrid = ({ members, photoBg, onSelect }) => (
  <div className="md:hidden mt-8 grid grid-cols-2 gap-x-7 gap-y-6">
    {members.map((m, i) => (
      <button
        key={m.name}
        type="button"
        onClick={() => onSelect(i)}
        className="text-left"
      >
        <div
          className="w-full aspect-square overflow-hidden"
          style={{ backgroundColor: photoBg }}
        >
          {m.driveId && (
            <img
              src={drivePhoto(m.driveId)}
              alt={m.name}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <p className="mt-3 font-extrabold text-black text-[16px] leading-tight">
          {m.name.trim()}
        </p>
      </button>
    ))}
  </div>
);

// Bottom sheet that slides up over a dimmed page. Locks page scroll while open.
const MobileMemberSheet = ({ open, onClose, label, children }) => {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="md:hidden fixed inset-0 z-[10020]">
          <motion.div
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className="absolute bottom-0 left-0 right-0 max-h-[78svh] overflow-y-auto bg-evolve-yellow border-t border-x border-black rounded-t-[32px] px-12 pt-16 pb-10"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-8 right-9 text-evolve-pink"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 4l16 16M20 4L4 20"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default MobileMemberSheet;
