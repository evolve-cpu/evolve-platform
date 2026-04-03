import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../supabaseClient";
import BlackNav from "../components/BlackNav";

/* ─── constants ────────────────────────────────────────────────────────────── */
const WHAT_WE_LOOK_AT = [
  "what's working in your portfolio",
  "what needs fixing before you send it out",
  "how you're positioning yourself",
  "feedback on your presentation, not just the screens"
];

const ACCEPTED_TYPES = ".pdf,.pptx,.ppt,.odp,.zip";
const MAX_FILE_MB = 10;

/* ─── Back button ─────────────────────────────────────────────────────────── */
function BackBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-evolve-yellow w-fit"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M12.5 15L7.5 10L12.5 5"
          stroke="#FFD007"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-sm font-semibold">back</span>
    </button>
  );
}

/* ─── Avatar slot ─────────────────────────────────────────────────────────── */
function AvatarSlot({ user }) {
  const avatarSrc =
    user?.avatar_url ||
    `https://api.dicebear.com/7.x/thumbs/svg?seed=${user?.id || "u"}`;
  if (!user) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="hidden md:block text-white text-sm font-semibold">
        {user.name}
      </span>
      <img
        src={avatarSrc}
        alt="avatar"
        className="w-9 h-9 rounded-full object-cover"
      />
    </div>
  );
}

/* ─── Success Screen ──────────────────────────────────────────────────────── */
function SuccessScreen({ onBackToCommunity, onApplyMentorship }) {
  return (
    <div
      className="font-bricolage min-h-screen flex flex-col"
      style={{ backgroundColor: "#161618" }}
    >
      <BlackNav onLogoClick={onBackToCommunity} />
      <div className="absolute top-20 left-6 z-50">
        <button
          onClick={onBackToCommunity}
          className="text-evolve-yellow text-xs hover:opacity-80 transition-colors flex items-center gap-1 font-semibold"
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
            <path
              d="M12.5 15L7.5 10L12.5 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          back to community
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-6 text-center">
          {/* Green checkmark icon — same as payment success */}
          <div className="w-20 h-20 rounded-full border-4 border-green-400 flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path
                d="M8 18l7 7 13-14"
                stroke="#4ade80"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Heading */}
          <div>
            <h1
              className="text-white font-extrabold"
              style={{
                fontSize: "clamp(36px,9vw,48px)",
                letterSpacing: "-0.02em",
                lineHeight: "1"
              }}
            >
              you're in.
            </h1>
            <p className="text-white/60 text-sm mt-3 leading-relaxed max-w-[32ch] mx-auto">
              your portfolio is with us. we'll review it and get back to you
              with{" "}
              <span className="text-evolve-yellow font-semibold">
                personalised feedback within 24–48 hours
              </span>{" "}
              — straight to your inbox.
            </p>
          </div>

          {/* Progress pill */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/15"
            style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
          >
            <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
            <span className="text-white/70 text-xs font-semibold lowercase tracking-wide">
              review in progress · 24–48 hrs
            </span>
          </div>

          <div className="h-px w-full bg-white/10" />

          {/* While you wait */}
          <div className="w-full text-left">
            <p className="text-evolve-yellow text-sm font-bold mb-3">
              while you wait —
            </p>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              the review is just the start. if you're serious about your design
              career — knowing which roles fit, how to position yourself, and
              where to even begin — our{" "}
              <span className="text-white font-semibold">
                mentorship program
              </span>{" "}
              is where that happens.
            </p>

            {/* Mentorship CTA card */}
            <button
              onClick={onApplyMentorship}
              className="w-full flex items-center justify-between px-4 py-4 rounded-2xl border border-yellow-300 hover:border-evolve-yellow transition-colors"
              style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
            >
              <div className="text-left">
                <p className="text-white font-bold text-sm">
                  apply for mentorship
                </p>
                <p className="text-white/40 text-xs mt-0.5">
                  limited spots · designed for you
                </p>
              </div>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className="flex-shrink-0 ml-3 text-evolve-yellow"
              >
                <path
                  d="M4.5 10h11M10.5 5l5 5-5 5"
                  stroke="#FFD007"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* <div className="h-px w-full bg-white/10" /> */}

          {/* Footer */}
          {/* <div className="w-full flex items-center justify-between">
            <span className="text-white/30 text-xs font-bold uppercase tracking-widest font-bricolage">
              evolve community
            </span>
            <button
              onClick={onBackToCommunity}
              className="text-white/50 text-xs hover:text-white transition-colors flex items-center gap-1"
            >
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <path
                  d="M12.5 15L7.5 10L12.5 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              back to community
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
}

/* ─── Already Submitted Screen ────────────────────────────────────────────── */
function AlreadySubmittedScreen({ onBack }) {
  return (
    <div
      className="font-bricolage min-h-screen flex flex-col"
      style={{ backgroundColor: "#161618" }}
    >
      <BlackNav onLogoClick={onBack} />
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-6 text-center">
          <div className="w-20 h-20 rounded-full border-4 border-evolve-yellow flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path
                d="M8 18l7 7 13-14"
                stroke="#FFD007"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <h1
              className="text-white font-extrabold"
              style={{
                fontSize: "clamp(28px,7vw,40px)",
                letterSpacing: "-0.02em",
                lineHeight: "1.1"
              }}
            >
              already submitted.
            </h1>
            <p className="text-white/50 text-sm mt-3 max-w-[30ch] mx-auto leading-relaxed">
              we already have your portfolio. sit tight — feedback is on its way
              within 24–48 hours.
            </p>
          </div>
          <button
            onClick={onBack}
            className="text-evolve-yellow text-sm font-semibold flex items-center gap-1.5"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path
                d="M12.5 15L7.5 10L12.5 5"
                stroke="#FFD007"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            back to community
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   Mobile form — defined OUTSIDE main component so React never remounts it
══════════════════════════════════════════════════════════════════════════════ */
function MobileForm({
  user,
  portfolioMode,
  setPortfolioMode,
  portfolioLink,
  setPortfolioLink,
  portfolioFile,
  setPortfolioFile,
  walkthroughLink,
  setWalkthroughLink,
  notes,
  setNotes,
  submitting,
  error,
  dragOver,
  setDragOver,
  fileInputRef,
  debugMsg,
  handleFile,
  handleSubmit,
  onBack
}) {
  return (
    <div
      className="font-bricolage flex md:hidden min-h-screen flex-col"
      style={{ backgroundColor: "#161618" }}
    >
      <BlackNav onLogoClick={onBack} right={<AvatarSlot user={user} />} />

      <div className="flex-1 flex flex-col px-5 pt-20 pb-10 gap-6">
        {/* Back */}
        <BackBtn onClick={onBack} />

        {/* Greeting */}
        <div>
          <h1
            className="text-white font-extrabold lowercase"
            style={{
              fontSize: "clamp(26px,7vw,36px)",
              letterSpacing: "-0.02em"
            }}
          >
            hi!{" "}
            <span className="text-evolve-yellow">
              {user?.name?.split(" ")[0] || user?.name}
            </span>
          </h1>
          <p className="text-white/50 text-sm mt-1">
            ready to submit your portfolio?
          </p>
        </div>

        {/* ── Portfolio ── */}
        <div className="flex flex-col gap-2">
          <p className="text-white text-sm font-semibold lowercase">
            your portfolio
          </p>

          {/* Tabs */}
          <div className="flex rounded-xl overflow-hidden border border-white/10">
            <button
              onClick={() => setPortfolioMode("link")}
              className="flex-1 py-3 text-sm font-bold lowercase transition-colors"
              style={{
                backgroundColor:
                  portfolioMode === "link"
                    ? "#FFD007"
                    : "rgba(255,255,255,0.06)",
                color:
                  portfolioMode === "link" ? "#161616" : "rgba(255,255,255,0.5)"
              }}
            >
              paste a link
            </button>
            <button
              type="button"
              onClick={() => setPortfolioMode("file")}
              className="flex-1 py-3 text-sm font-bold lowercase transition-colors"
              style={{
                backgroundColor:
                  portfolioMode === "file"
                    ? "rgba(223,5,134,1)"
                    : "rgba(255,255,255,0.06)",
                color:
                  portfolioMode === "file" ? "#fff" : "rgba(255,255,255,0.5)"
              }}
            >
              upload a file
            </button>
          </div>

          {portfolioMode === "link" && (
            <input
              type="url"
              placeholder="your site, behance, figma, notion – any link works"
              value={portfolioLink}
              onChange={(e) => setPortfolioLink(e.target.value)}
              className="w-full rounded-2xl px-4 py-3.5 text-white placeholder-white/30 text-sm outline-none border border-white/10 focus:border-evolve-yellow/50 transition-colors"
              style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
            />
          )}

          {portfolioMode === "file" && (
            // <label className="w-full cursor-pointer">
            //   <div className="rounded-2xl px-4 py-8 flex flex-col items-center justify-center gap-2 border">
            //     {portfolioFile ? (
            //       <div className="flex flex-col items-center gap-2">
            //         <p className="text-evolve-yellow text-sm font-semibold text-center">
            //           {portfolioFile.name}
            //         </p>
            //         <button
            //           type="button"
            //           onClick={(e) => {
            //             e.stopPropagation();
            //             setPortfolioFile(null);
            //           }}
            //           className="text-white/40 text-xs"
            //         >
            //           × remove file
            //         </button>
            //       </div>
            //     ) : (
            //       <>
            //         <p className="text-white/40 text-sm text-center">
            //           tap to upload
            //         </p>
            //         <p className="text-white/25 text-xs text-center">
            //           pdf, pptx or zip. max 10mb
            //         </p>
            //       </>
            //     )}
            //   </div>

            //   <input
            //     type="file"
            //     accept={ACCEPTED_TYPES}
            //     className="hidden"
            //     onChange={(e) => handleFile(e.target.files?.[0])}
            //   />
            // </label>
            // Replace the <label> wrapper with a div + onClick:
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full cursor-pointer"
            >
              <div className="rounded-2xl px-4 py-8 flex flex-col items-center justify-center gap-2 border">
                {portfolioFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-evolve-yellow text-sm font-semibold text-center">
                      {portfolioFile.name}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation(); // now actually stops the file picker
                        setPortfolioFile(null);
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                      className="text-white/40 text-xs"
                    >
                      × remove file
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-white/40 text-sm text-center">
                      tap to upload
                    </p>
                    <p className="text-white/25 text-xs text-center">
                      pdf, pptx or zip. max 10mb
                    </p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES}
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>
          )}
        </div>

        {/* ── Walkthrough ── */}
        <div className="flex flex-col gap-2">
          <p className="text-white text-sm font-semibold lowercase">
            your walkthrough recording
          </p>
          <p className="text-white/40 text-xs leading-relaxed">
            no face cam needed. just walk us through your work.{" "}
            <a
              href="https://loom.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-evolve-yellow underline underline-offset-2"
            >
              record with loom
            </a>
          </p>
          <input
            type="url"
            placeholder="https://loom.com/share/..."
            value={walkthroughLink}
            onChange={(e) => setWalkthroughLink(e.target.value)}
            className="w-full rounded-2xl px-4 py-3.5 text-white placeholder-white/30 text-sm outline-none border border-white/10 focus:border-evolve-yellow/50 transition-colors"
            style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
          />
        </div>

        {/* ── Notes ── */}
        <div className="flex flex-col gap-2">
          <p className="text-white text-sm font-semibold lowercase">
            anything we should know?{" "}
            <span className="text-white/30 font-normal">(optional)</span>
          </p>
          <textarea
            rows={3}
            placeholder="anything we should consider while reviewing?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-2xl px-4 py-3.5 text-white placeholder-white/30 text-sm outline-none border border-white/10 focus:border-evolve-yellow/50 transition-colors resize-none"
            style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-evolve-yellow text-evolve-black font-extrabold lowercase text-base rounded-2xl py-4 disabled:opacity-40 active:opacity-80 transition-opacity"
        >
          {submitting ? (
            "submitting…"
          ) : (
            <>
              submit for review <span>→</span>
            </>
          )}
        </button>

        <p className="text-white/25 text-xs text-center">
          we'll be in touch within 48 hours
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   Desktop form — defined OUTSIDE main component so React never remounts it
══════════════════════════════════════════════════════════════════════════════ */
function DesktopForm({
  user,
  portfolioMode,
  setPortfolioMode,
  portfolioLink,
  setPortfolioLink,
  portfolioFile,
  setPortfolioFile,
  walkthroughLink,
  setWalkthroughLink,
  notes,
  setNotes,
  submitting,
  error,
  dragOver,
  setDragOver,
  fileInputRef,
  handleFile,
  handleSubmit,
  onBack
}) {
  return (
    <div
      className="font-bricolage hidden md:flex min-h-screen flex-col"
      style={{ backgroundColor: "#161618" }}
    >
      <BlackNav onLogoClick={onBack} right={<AvatarSlot user={user} />} />

      <div className="flex flex-1 pt-14">
        {/* ─── LEFT PANEL ─── */}
        <div
          className="flex-shrink-0 flex flex-col justify-between px-10 py-10 border-r border-white/10"
          style={{ width: "38%" }}
        >
          <div className="flex flex-col gap-8 mt-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-evolve-pink flex-shrink-0" />
              <span className="text-white/50 text-xs font-bold uppercase tracking-widest">
                portfolio review
              </span>
            </div>

            <div>
              <h1
                className="font-extrabold lowercase leading-none"
                style={{
                  fontSize: "clamp(40px,4vw,64px)",
                  letterSpacing: "-0.03em",
                  lineHeight: "1"
                }}
              >
                <span className="text-white">honest </span>
                <span className="text-evolve-pink">feedback.</span>
                <br />
                <span className="text-evolve-yellow">real growth.</span>
              </h1>
              <p className="text-white/50 text-sm mt-4 leading-relaxed max-w-[38ch]">
                getting a review isn't just about what's on screen. it's about
                how you think, present, and what you're actually going for.
              </p>
            </div>

            <div
              className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/10"
              style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
            >
              <img
                src={
                  user?.avatar_url ||
                  `https://api.dicebear.com/7.x/thumbs/svg?seed=${user?.id}`
                }
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">
                  {user?.name}
                </p>
                <p className="text-white/40 text-xs truncate">{user?.email}</p>
              </div>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: "rgba(163,91,251,0.2)",
                  color: "#A35BFB"
                }}
              >
                signed in
              </span>
            </div>

            <div>
              <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-3">
                what we look at
              </p>
              <ul className="flex flex-col gap-2.5">
                {WHAT_WE_LOOK_AT.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                      style={{
                        backgroundColor: [
                          "#DF0586",
                          "#A35BFB",
                          "#FFD007",
                          "#4ade80"
                        ][i % 4]
                      }}
                    />
                    <span className="text-white/60 text-sm leading-snug">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/10 w-fit"
            style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
          >
            <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
            <span className="text-white/60 text-xs font-semibold lowercase tracking-wide">
              feedback within&nbsp;&nbsp;48 hours
            </span>
          </div>
        </div>

        {/* ─── RIGHT PANEL (form) ─── */}
        <div className="flex-1 flex flex-col px-10 py-10 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <BackBtn onClick={onBack} />
            <button
              onClick={onBack}
              className="text-white/40 hover:text-white transition-colors"
              aria-label="close"
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path
                  d="M5 5l12 12M17 5L5 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="flex flex-col gap-7 max-w-lg">
            {/* Step 1 — Portfolio */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-black font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: "#FFD007" }}
                >
                  1
                </span>
                <p className="text-white font-semibold lowercase">
                  your portfolio
                </p>
              </div>
              <p className="text-white/40 text-xs pl-10 leading-relaxed">
                behance, figma, notion, your own site — any link works. or
                upload your file directly.
              </p>

              <div className="pl-10 flex gap-2">
                <button
                  onClick={() => setPortfolioMode("link")}
                  className="px-4 py-2 rounded-xl text-sm font-bold lowercase border transition-all"
                  style={{
                    backgroundColor:
                      portfolioMode === "link"
                        ? "#FFD007"
                        : "rgba(255,255,255,0.06)",
                    borderColor:
                      portfolioMode === "link"
                        ? "#FFD007"
                        : "rgba(255,255,255,0.12)",
                    color:
                      portfolioMode === "link"
                        ? "#161616"
                        : "rgba(255,255,255,0.5)"
                  }}
                >
                  paste a link
                </button>
                <button
                  onClick={() => setPortfolioMode("file")}
                  className="px-4 py-2 rounded-xl text-sm font-bold lowercase border transition-all"
                  style={{
                    backgroundColor:
                      portfolioMode === "file"
                        ? "rgba(223,5,134,1)"
                        : "rgba(255,255,255,0.06)",
                    borderColor:
                      portfolioMode === "file"
                        ? "rgba(223,5,134,1)"
                        : "rgba(255,255,255,0.12)",
                    color:
                      portfolioMode === "file"
                        ? "#fff"
                        : "rgba(255,255,255,0.5)"
                  }}
                >
                  upload a file
                </button>
              </div>

              {portfolioMode === "link" && (
                <input
                  type="url"
                  placeholder="https://your-portfolio.com"
                  value={portfolioLink}
                  onChange={(e) => setPortfolioLink(e.target.value)}
                  className="ml-10 w-full rounded-2xl px-4 py-3.5 text-white placeholder-white/30 text-sm outline-none border border-white/10 focus:border-evolve-yellow/50 transition-colors"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                />
              )}

              {portfolioMode === "file" && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    handleFile(e.dataTransfer.files?.[0]);
                  }}
                  className="ml-10 rounded-2xl px-4 py-10 flex flex-col items-center justify-center gap-2 cursor-pointer border transition-colors"
                  style={{
                    backgroundColor: dragOver
                      ? "rgba(255,208,7,0.06)"
                      : "rgba(255,255,255,0.04)",
                    borderColor: dragOver
                      ? "rgba(255,208,7,0.4)"
                      : "rgba(255,255,255,0.12)"
                  }}
                >
                  {portfolioFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-evolve-yellow text-sm font-semibold text-center">
                        {portfolioFile.name}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPortfolioFile(null);
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                        }}
                        className="text-white/40 hover:text-red-400 text-xs font-semibold transition-colors"
                      >
                        × remove file
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-white/40 text-sm text-center">
                        drag & drop or click to upload
                      </p>
                      <p className="text-white/25 text-xs text-center">
                        pdf, pptx or zip. max size 10mb
                      </p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_TYPES}
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                  />
                </div>
              )}
            </div>

            {/* Step 2 — Walkthrough */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-black font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: "#FFD007" }}
                >
                  2
                </span>
                <p className="text-white font-semibold lowercase">
                  your walkthrough recording
                </p>
              </div>
              <p className="text-white/40 text-xs pl-10 leading-relaxed">
                paste your recording link here. no face cam needed — just walk
                us through your work.{" "}
                <a
                  href="https://loom.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-evolve-yellow underline underline-offset-2"
                >
                  record with loom →
                </a>
              </p>
              <input
                type="url"
                placeholder="https://loom.com/share/..."
                value={walkthroughLink}
                onChange={(e) => setWalkthroughLink(e.target.value)}
                className="ml-10 w-full rounded-2xl px-4 py-3.5 text-white placeholder-white/30 text-sm outline-none border border-white/10 focus:border-evolve-yellow/50 transition-colors"
                style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
              />
            </div>

            {/* Step 3 — Notes */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 border border-white/15"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.5)"
                  }}
                >
                  3
                </span>
                <p className="text-white font-semibold lowercase">
                  anything we should know?{" "}
                  <span className="text-white/30 font-normal text-xs">
                    (optional)
                  </span>
                </p>
              </div>
              <p className="text-white/40 text-xs pl-10 leading-relaxed">
                helps us give you more relevant feedback — where you're at, what
                you're going for.
              </p>
              <textarea
                rows={3}
                placeholder="e.g. applying to studios, switching from graphic design…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="ml-10 w-full rounded-2xl px-4 py-3.5 text-white placeholder-white/30 text-sm outline-none border border-white/10 focus:border-evolve-yellow/50 transition-colors resize-none"
                style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
              />
            </div>

            {error && <p className="text-red-400 text-sm pl-10">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="ml-10 w-full flex items-center justify-center gap-2 bg-evolve-yellow text-evolve-black font-extrabold lowercase text-base rounded-2xl py-4 disabled:opacity-40 active:opacity-80 transition-opacity"
            >
              {submitting ? (
                "submitting…"
              ) : (
                <>
                  get reviewed <span>→</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   PortfolioReviewForm — main page component
══════════════════════════════════════════════════════════════════════════════ */
export default function PortfolioReviewForm() {
  const navigate = useNavigate();
  const { user, authLoading } = useAuth();

  /* ── form state ─────────────────────────────────────────────────────────── */
  const [portfolioMode, setPortfolioMode] = useState("link");
  const [portfolioLink, setPortfolioLink] = useState("");
  const [portfolioFile, setPortfolioFile] = useState(null);
  const [walkthroughLink, setWalkthroughLink] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [checkingSubmission, setCheckingSubmission] = useState(true);
  const fileInputRef = useRef(null);
  const mobileFileInputRef = useRef(null); // mobile ← add this
  const [debugMsg, setDebugMsg] = useState("none"); // ← add here alongside other useState

  function isValidUrl(str) {
    try {
      const url = new URL(str.trim());
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }

  /* ── auth guard ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!authLoading && !user) {
      sessionStorage.setItem("signin_from", "/community/portfolio-review/form");
      navigate("/signin", { replace: true });
    }
  }, [user, authLoading, navigate]);

  // useEffect(() => {
  //   if (!authLoading && user === null) {
  //     const timeout = setTimeout(() => {
  //       if (!user) {
  //         navigate("/signin", { replace: true });
  //       }
  //     }, 800); // delay prevents mobile flicker

  //     return () => clearTimeout(timeout);
  //   }
  // }, [user, authLoading, navigate]);

  /* ── check if already submitted ─────────────────────────────────────────── */
  useEffect(() => {
    if (!user) return;
    supabase
      .from("portfolio_reviews")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setAlreadySubmitted(true);
        setCheckingSubmission(false);
      });
  }, [user]);

  /* ── file helper ─────────────────────────────────────────────────────────── */
  // const handleFile = (file) => {
  //   if (!file) return;
  //   if (file.size > MAX_FILE_MB * 1024 * 1024) {
  //     setError(`file too large — max ${MAX_FILE_MB}mb`);
  //     return;
  //   }
  //   setError("");
  //   setPortfolioFile(file);
  // };

  const handleFile = (file) => {
    setDebugMsg("handleFile called: " + (file?.name || "no file"));
    if (!file) {
      setDebugMsg("file was null/undefined");
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`file too large — max ${MAX_FILE_MB}mb`);
      return;
    }
    setError("");
    setPortfolioFile(file);
    setDebugMsg("file set: " + file.name);
  };

  /* ── submit ─────────────────────────────────────────────────────────────── */
  const handleSubmit = async () => {
    setError("");

    if (portfolioMode === "link") {
      if (!portfolioLink.trim()) {
        setError("please paste your portfolio link");
        return;
      }
      if (!isValidUrl(portfolioLink)) {
        setError(
          "that doesn't look like a valid URL — try starting with https://"
        );
        return;
      }
    }

    if (portfolioMode === "file" && !portfolioFile) {
      setError("please upload your portfolio file");
      return;
    }

    if (!walkthroughLink.trim()) {
      setError("please add your walkthrough recording link");
      return;
    }
    if (!isValidUrl(walkthroughLink)) {
      setError("that walkthrough link doesn't look valid");
      return;
    }

    if (
      portfolioMode === "link" &&
      portfolioLink.trim() &&
      portfolioLink.trim() === walkthroughLink.trim()
    ) {
      setError("your portfolio and walkthrough links can't be the same URL");
      return;
    }

    // ... rest of the submit logic unchanged

    setSubmitting(true);
    try {
      let portfolio_file_url = null;

      if (portfolioMode === "file" && portfolioFile) {
        const ext = portfolioFile.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("portfolio-files")
          .upload(path, portfolioFile, { upsert: true });
        if (uploadErr)
          throw new Error("file upload failed: " + uploadErr.message);
        const { data: urlData } = supabase.storage
          .from("portfolio-files")
          .getPublicUrl(path);
        portfolio_file_url = urlData?.publicUrl || null;
      }

      const { error: insertErr } = await supabase
        .from("portfolio_reviews")
        .insert({
          user_id: user.id,
          name: user.name,
          email: user.email,
          portfolio_link:
            portfolioMode === "link" ? portfolioLink.trim() : null,
          portfolio_file_url,
          walkthrough_link: walkthroughLink.trim(),
          notes: notes.trim() || null
        });

      if (insertErr) throw new Error(insertErr.message);
      setDone(true);
    } catch (err) {
      setError(err.message || "something went wrong — please try again");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── render guards ──────────────────────────────────────────────────────── */
  if (authLoading || checkingSubmission) return null;
  if (!user) return null;

  if (done) {
    return (
      <SuccessScreen
        onBackToCommunity={() => navigate("/community")}
        onApplyMentorship={() => navigate("/mentorship")}
      />
    );
  }

  if (alreadySubmitted) {
    return <AlreadySubmittedScreen onBack={() => navigate("/community")} />;
  }

  /* ── shared props ───────────────────────────────────────────────────────── */
  const formProps = {
    user,
    portfolioMode,
    setPortfolioMode,
    portfolioLink,
    setPortfolioLink,
    portfolioFile,
    setPortfolioFile, // ← add this
    walkthroughLink,
    setWalkthroughLink,
    notes,
    setNotes,
    submitting,
    error,
    dragOver,
    setDragOver,
    fileInputRef,
    handleFile,
    handleSubmit,
    debugMsg,
    onBack: () => navigate("/community/portfolio-review")
  };

  const mobileFormProps = {
    ...formProps,
    fileInputRef: mobileFileInputRef // ← override with mobile ref
  };

  return (
    <>
      <MobileForm {...mobileFormProps} />
      <DesktopForm {...formProps} />
    </>
  );
}
