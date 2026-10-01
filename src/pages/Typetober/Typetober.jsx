import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../hooks/useAuth";
import TypetoberNav from "./TypetoberNav";
import InkWall from "./InkWall";
import { AuthSheet, PrizeSheet, GuideSheet, Lightbox } from "./Sheets";
import ProfileSheet from "./ProfileSheet";
import UploadSheet from "./UploadSheet";
import BulkUploadSheet, { BulkIcon } from "./BulkUploadSheet";
import ShareSheet from "./ShareSheet";
import { useTypetoberData, publicImageUrl } from "./lib/useTypetoberData";
import {
  LETTERS,
  accentFor,
  getCurrentDay,
  ordinalOctDate,
  formatCountdown
} from "./lib/constants";
import "./Typetober.css";

function Landing({ onAccept, currentDay }) {
  const heroRef = useRef(null);
  const countdown = formatCountdown();
  return (
    <div className="absolute inset-0">
      <InkWall heroRef={heroRef} />
      <div
        className="relative z-10 h-full flex flex-col justify-end md:justify-center items-stretch md:items-center px-4 md:px-14 pb-8 md:pb-0"
        style={{ pointerEvents: "none" }}
      >
        {/* The yellow panel is the one area the ink never covers (InkWall measures heroRef). */}
        <div
          ref={heroRef}
          className="relative w-full md:w-[min(750px,calc(100%-64px))] bg-evolve-yellow text-black rounded-[28px] md:rounded-[32px] px-5 pt-6 pb-6 md:px-14 md:pt-12 md:pb-12 flex flex-col items-start md:items-center gap-4 md:gap-5 text-left md:text-center"
          style={{ pointerEvents: "auto" }}
        >
          <span
            className="bg-evolve-pink text-white font-extrabold text-[13px] px-3.5 py-2 rounded-full border-2 border-white"
            style={{ transform: "rotate(-4deg)" }}
          >
            October 1 - 31st
            {/* {currentDay === 0
              ? "Starts Oct 1 - Oct 30"
              : currentDay >= 26
                ? "26 letters live"
                : `Day ${currentDay} is open`} */}
          </span>
          <div className="flex flex-col md:items-center">
            <span className="text-black font-bold text-[16px] md:text-[32px] mb-1">
              evolve's
            </span>
            <h1
              className="font-extrabold text-evolve-pink leading-[0.9] text-[60px] md:text-[130px]
             [text-shadow:4px_4px_0_#7A034A]
             md:[text-shadow:6px_6px_0_#7A034A]"
              style={{
                letterSpacing: "-0.05em"
              }}
            >
              Typetober
            </h1>
          </div>
          <p className="text-black font-semibold text-[18px] md:text-[26px] leading-snug">
            1 month. 26 alphabets.
            <br />
            <span>Illustrate them your way.</span>
            <br />
            <b className="text-[#DF0586]">Take the challenge. Win prizes.</b>
          </p>
          {countdown && (
            <p className="text-black/55 text-[14px] font-bold">
              {countdown.days}d {countdown.hours}h until letters start unlocking
            </p>
          )}
          <button
            onClick={onAccept}
            className="tt-cta w-full md:w-auto md:min-w-[360px] bg-black text-evolve-yellow font-extrabold text-[20px] py-4 px-8 rounded-2xl border-2 border-black"
          >
            Accept challenge
          </button>
        </div>
      </div>
    </div>
  );
}

function Tile({ t, ch, i, accent, onAdd, onView }) {
  if (t.type === "example") {
    return (
      <button
        onClick={() => onView(i, t.item)}
        className="relative aspect-square rounded-lg overflow-hidden bg-white/5"
        style={{ outline: `1px solid ${accent}`, outlineOffset: "-1px" }}
      >
        {t.item.imageUrl && (
          <img
            src={t.item.imageUrl}
            alt={`Example ${ch}`}
            className="w-full h-full object-cover"
          />
        )}
        <span
          className="absolute left-1 bottom-1 text-black text-[9px] font-extrabold px-1.5 py-0.5 rounded-full"
          style={{ background: accent }}
        >
          Example
        </span>
      </button>
    );
  }
  if (t.type === "img" || t.type === "mine") {
    const mine = t.type === "mine";
    return (
      <button
        onClick={() => onView(i, t.item)}
        className="relative aspect-square rounded-lg overflow-hidden bg-white/5"
        style={
          mine
            ? { outline: "2px solid #FFD007", outlineOffset: "-2px" }
            : undefined
        }
      >
        {t.item.imageUrl && (
          <img
            src={t.item.imageUrl}
            alt={ch}
            className="w-full h-full object-cover"
          />
        )}
        {mine && (
          <span className="absolute left-1 bottom-1 bg-evolve-yellow text-black text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
            You
          </span>
        )}
      </button>
    );
  }
  if (t.type === "pending") {
    return (
      <div className="aspect-square rounded-lg bg-white/10 grid place-items-center text-white/40 font-extrabold text-[13px]">
        ⏳
      </div>
    );
  }
  if (t.type === "add") {
    return (
      <button
        onClick={() => onAdd(i)}
        className="tt-slot tt-slot-add relative aspect-square rounded-lg grid place-items-center"
        style={{ "--c": accent }}
        aria-label={`Add your ${ch}`}
      >
        <span
          className="font-extrabold text-[34px] md:text-[44px] leading-none"
          style={{ color: accent }}
        >
          {ch}
        </span>
        <span
          className="absolute right-1.5 bottom-1.5 w-5 h-5 rounded-full grid place-items-center"
          style={{ background: accent }}
        >
          <svg viewBox="0 0 12 12" width="10" height="10">
            <path
              d="M6 1v10M1 6h10"
              stroke="#161616"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </button>
    );
  }
  // Open slot: clearly outlined, shows the letter faintly, and also opens the upload.
  return (
    <button
      onClick={() => onAdd(i)}
      className="tt-slot tt-slot-open aspect-square rounded-lg grid place-items-center"
      style={{ "--c": accent }}
      aria-label={`Open slot for ${ch}`}
    >
      <span className="font-medium text-[30px] md:text-[40px] leading-none">
        {ch}
      </span>
    </button>
  );
}

const GRID_GAP = 6; // gap-1.5

/**
 * Sizes one letter's grid so it fills a full screen of the board with
 * empty boxes. Base columns: 4 on phones, 6 on tablets, 8 on desktop.
 * When the tiles no longer fit on one screen, columns grow (boxes get
 * smaller) up to double the base; past that, rows keep being added with one
 * spare row at the end.
 */
function useFoldGrid(tileCount) {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const gridRef = useRef(null);
  const [box, setBox] = useState({ width: 0, avail: 0, viewH: 0 });

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const scroller = section?.closest(".tt-scroller");
    if (!section || !scroller) return;
    const measure = () => {
      const viewH = scroller.clientHeight;
      const headerH = headerRef.current?.offsetHeight || 0;
      const cs = getComputedStyle(section);
      const pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
      setBox({
        width: gridRef.current?.clientWidth || 0,
        avail: viewH - headerH - pad,
        viewH
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(scroller);
    if (gridRef.current) ro.observe(gridRef.current);
    return () => ro.disconnect();
  }, []);

  const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
  const base = vw >= 1024 ? 8 : vw >= 768 ? 6 : 4;
  if (!box.width || box.avail <= 0) {
    return {
      sectionRef,
      headerRef,
      gridRef,
      cols: base,
      slots: Math.ceil((tileCount + base) / base) * base,
      minHeight: undefined
    };
  }

  const rowsFor = (cols) => {
    const tile = (box.width - GRID_GAP * (cols - 1)) / cols;
    return Math.max(1, Math.floor((box.avail + GRID_GAP) / (tile + GRID_GAP)));
  };

  let cols = base;
  while (cols < base * 2 && tileCount > rowsFor(cols) * cols) cols++;
  const screenRows = rowsFor(cols);
  const neededRows = Math.ceil(tileCount / cols);
  const rows = neededRows <= screenRows ? screenRows : neededRows + 1;

  return {
    sectionRef,
    headerRef,
    gridRef,
    cols,
    slots: rows * cols,
    minHeight: box.viewH
  };
}

function Fold({
  i,
  ch,
  showStreak,
  wallItems,
  examples,
  mySubs,
  streak,
  onAdd,
  onView
}) {
  const accent = accentFor(i);
  const mine = wallItems.filter((it) => it.isMine);
  const others = wallItems.filter((it) => !it.isMine);
  const pendingCount = (mySubs || []).filter(
    (r) => r.status === "pending"
  ).length;

  // Order: admin examples (max two), then the upload slot (the very first
  // box when there are no examples), then the user's own work, then
  // everyone else's. Multiple submissions per letter are allowed, so the
  // upload slot is always there.
  const tiles = (examples || []).map((item) => ({ type: "example", item }));
  tiles.push({ type: "add" });
  mine.forEach((item) => tiles.push({ type: "mine", item }));
  for (let k = 0; k < pendingCount; k++) tiles.push({ type: "pending" });
  others.forEach((item) => tiles.push({ type: "img", item }));

  const { sectionRef, headerRef, gridRef, cols, slots, minHeight } =
    useFoldGrid(tiles.length);
  while (tiles.length < slots) tiles.push({ type: "ghost" });

  return (
    <section
      ref={sectionRef}
      id={`tt-fold-${i}`}
      className="pt-3 pb-8 max-w-[1240px] mx-auto"
      style={{ minHeight }}
    >
      <div ref={headerRef} className="flex items-end gap-3 pb-3">
        <div
          className="font-extrabold text-[52px] md:text-[84px] leading-[0.85]"
          style={{ color: accent }}
        >
          {ch}
        </div>
        <div className="flex-1 min-w-0 pb-1">
          <div className="text-[13px] md:text-[15px] font-bold">
            Letter {i + 1} of 26
          </div>
          <div className="text-[13px] text-white/40">
            {wallItems.length} submissions
          </div>
        </div>
        {showStreak && streak?.current > 0 && (
          <span
            className="text-[12px] font-bold text-black bg-evolve-inchworm rounded-full px-2.5 py-1 flex-none"
            title={
              streak.today
                ? "You've submitted today"
                : "Submit today to keep it going"
            }
          >
            🔥 {streak.current}-day streak
          </span>
        )}
        {mine.length > 0 && (
          <span className="text-[12px] font-bold text-black bg-evolve-yellow rounded-full px-2.5 py-1 flex-none">
            {mine.length > 1 ? `Yours ×${mine.length}` : "Yours ✓"}
          </span>
        )}
      </div>
      <div
        ref={gridRef}
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {tiles.map((t, idx) => (
          <Tile
            key={idx}
            t={t}
            ch={ch}
            i={i}
            accent={accent}
            onAdd={onAdd}
            onView={onView}
          />
        ))}
      </div>
    </section>
  );
}

function Board({
  currentDay,
  wallByLetter,
  examplesByLetter,
  mySubmissions,
  streak,
  onAdd,
  onView
}) {
  if (currentDay === 0) {
    const cd = formatCountdown();
    return (
      <div className="tt-scroller flex items-center justify-center px-6 text-center">
        <div>
          <div className="text-[90px] font-extrabold text-evolve-yellow leading-none">
            A
          </div>
          <p className="text-white/60 mt-3 text-[16px]">
            Letter A unlocks Oct 1
            {cd ? ` — ${cd.days}d ${cd.hours}h to go` : ""}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="tt-scroller pr-11 md:pr-16 pl-4 md:pl-8">
      {LETTERS.slice(0, currentDay).map((ch, i) => (
        <Fold
          key={ch}
          i={i}
          ch={ch}
          showStreak={i === 0}
          wallItems={wallByLetter.get(i) || []}
          examples={examplesByLetter.get(i)}
          mySubs={mySubmissions.get(i)}
          streak={streak}
          onAdd={onAdd}
          onView={onView}
        />
      ))}
      <div className="h-28" />
    </div>
  );
}

function Rail({ currentDay, mySubmissions, onClick }) {
  return (
    <div className="tt-rail" aria-label="jump to letter">
      {LETTERS.map((ch, i) => {
        const unlocked = i < currentDay;
        const done = (mySubmissions.get(i) || []).some(
          (r) => r.status === "success"
        );
        return (
          <button
            key={ch}
            className={!unlocked ? "locked" : done ? "done" : ""}
            onClick={() => onClick(i)}
          >
            {ch}
          </button>
        );
      })}
    </div>
  );
}

export default function Typetober() {
  const { user, logout } = useAuth();
  const [stage, setStage] = useState("landing");
  const [sheet, setSheet] = useState(null);
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);

  // Dev-only override so the board is testable before Oct 1 / after Oct 26 —
  // import.meta.env.DEV is compiled to `false` and dead-code-eliminated in
  // production builds, so none of this ships.
  const [devDay, setDevDay] = useState(null);
  const [devToolsOpen, setDevToolsOpen] = useState(false);
  const currentDay =
    import.meta.env.DEV && devDay !== null ? devDay : getCurrentDay();

  const {
    wallByLetter,
    examplesByLetter,
    streak,
    mySubmissions,
    stats,
    refresh
  } = useTypetoberData(user);

  // Shared links open one submission in the lightbox:
  //   /typetober/<username>/<letter>[-n]  (e.g. /typetober/arnab/a-2)
  //   /typetober?s=<submission id>        (fallback when there's no username)
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sharedId = searchParams.get("s");
  const handleMatch = location.pathname.match(
    /^\/typetober\/([^/]+)\/([a-z])(?:-(\d+))?\/?$/i
  );
  const sharedKey = handleMatch ? location.pathname : sharedId;
  useEffect(() => {
    let req;
    if (handleMatch) {
      req = supabase.rpc("typetober_submission_by_handle", {
        handle: decodeURIComponent(handleMatch[1]),
        letter: handleMatch[2].toUpperCase().charCodeAt(0) - 65,
        n: Number(handleMatch[3] || 1)
      });
    } else if (sharedId && /^[0-9a-f-]{36}$/i.test(sharedId)) {
      req = supabase.rpc("typetober_public_submission", { sub_id: sharedId });
    } else return;
    let cancelled = false;
    req.then(({ data, error }) => {
      if (cancelled) return;
      const row = data?.[0];
      if (error || !row) {
        if (error) console.error("typetober shared link error:", error);
        showToast("That submission isn't available.");
        return;
      }
      setSheet({
        type: "lightbox",
        shared: true,
        letterIndex: row.letter_index,
        item: {
          ...row,
          imageUrl: publicImageUrl(row.image_path),
          profiles: {
            name: row.name,
            username: row.username,
            avatar_url: row.avatar_url
          }
        }
      });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedKey]);

  // Path of the share link for one of the signed-in user's submissions.
  function sharePathFor(item, letterIndex) {
    if (!user?.username || !item?.id)
      return item?.id ? `/typetober?s=${item.id}` : "/typetober";
    const paid = (mySubmissions.get(letterIndex) || []).filter(
      (r) => r.status === "success"
    );
    const n = Math.max(1, paid.findIndex((r) => r.id === item.id) + 1);
    const slug = LETTERS[letterIndex].toLowerCase() + (n > 1 ? `-${n}` : "");
    return `/typetober/${encodeURIComponent(user.username)}/${slug}`;
  }

  // Admin report: records that this account opened Typetober (and whether
  // it was just created from our sign-in sheet) plus a heartbeat for the
  // daily-active and online-now counts. See typetober_ping in the migration.
  const signedInHereRef = useRef(false);
  const userId = user?.id;
  useEffect(() => {
    if (!userId) return;
    const ping = () => {
      if (document.visibilityState !== "visible") return;
      supabase
        .rpc("typetober_ping", {
          signed_in_here:
            signedInHereRef.current || !!sessionStorage.getItem("tt_pending")
        })
        .then(({ error }) => {
          if (error) console.error("typetober ping error:", error);
        });
    };
    ping();
    const t = setInterval(ping, 120000);
    document.addEventListener("visibilitychange", ping);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", ping);
    };
  }, [userId]);

  useEffect(() => {
    if (user && sessionStorage.getItem("tt_pending")) {
      sessionStorage.removeItem("tt_pending");
      signedInHereRef.current = true;
      setStage("board");
    }
    // Email sign-in completes in place (no redirect), so close the sheet here.
    if (user) setSheet((s) => (s?.type === "auth" ? null : s));
  }, [user]);

  function showToast(msg) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2600);
  }

  function handleAccept() {
    if (user) {
      setStage("board");
      return;
    }
    sessionStorage.setItem("tt_pending", "1");
    setSheet({ type: "auth" });
  }

  function goToFold(i) {
    setStage("board");
    requestAnimationFrame(() => {
      setTimeout(() => {
        document
          .getElementById(`tt-fold-${i}`)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
    });
  }

  function handleRailClick(i) {
    if (i >= currentDay) {
      showToast(`${LETTERS[i]} unlocks ${ordinalOctDate(i)}`);
      return;
    }
    goToFold(i);
  }

  function handleAdd(i) {
    if (!user) {
      handleAccept();
      return;
    }
    setSheet({ type: "upload", letterIndex: i });
  }

  function handleBulk() {
    if (!user) {
      handleAccept();
      return;
    }
    setSheet({ type: "bulk" });
  }

  function handleView(i, item) {
    setSheet({ type: "lightbox", letterIndex: i, item, mine: !!item?.isMine });
  }

  function closeSheet() {
    setSheet(null);
    if (location.pathname !== "/typetober" || sharedId)
      navigate("/typetober", { replace: true });
  }

  return (
    <div className="tt-root">
      <TypetoberNav
        user={user}
        onAvatarClick={() => setSheet({ type: "profile" })}
        onPrize={() => setSheet({ type: "prize" })}
        onGuide={() => setSheet({ type: "guide" })}
      />

      {stage === "landing" ? (
        <Landing onAccept={handleAccept} currentDay={currentDay} />
      ) : (
        <>
          <Board
            currentDay={currentDay}
            wallByLetter={wallByLetter}
            examplesByLetter={examplesByLetter}
            mySubmissions={mySubmissions}
            streak={streak}
            onAdd={handleAdd}
            onView={handleView}
          />
          <Rail
            currentDay={currentDay}
            mySubmissions={mySubmissions}
            onClick={handleRailClick}
          />
          {currentDay > 0 && (
            <button
              onClick={handleBulk}
              className="tt-bulk-fab ml-[-22px] md:ml-[-30px]"
            >
              <BulkIcon />
              Bulk upload
            </button>
          )}
        </>
      )}

      <AuthSheet open={sheet?.type === "auth"} onClose={closeSheet} />
      <PrizeSheet open={sheet?.type === "prize"} onClose={closeSheet} />
      <GuideSheet open={sheet?.type === "guide"} onClose={closeSheet} />

      {sheet?.type === "profile" && (
        <ProfileSheet
          open
          onClose={closeSheet}
          user={user}
          stats={stats}
          streak={streak}
          mySubmissions={mySubmissions}
          currentDay={currentDay}
          onBulk={currentDay > 0 ? () => setSheet({ type: "bulk" }) : undefined}
          onGoToLetter={(i) => {
            closeSheet();
            goToFold(i);
          }}
          onViewLetter={(i) => {
            const row = (mySubmissions.get(i) || [])
              .filter((r) => r.status === "success")
              .pop();
            if (row)
              setSheet({
                type: "lightbox",
                letterIndex: i,
                item: row,
                mine: true
              });
          }}
          onLogout={async () => {
            await logout();
            setStage("landing");
            closeSheet();
          }}
        />
      )}

      {sheet?.type === "upload" && (
        <UploadSheet
          open
          onClose={closeSheet}
          user={user}
          letterIndex={sheet.letterIndex}
          onBulk={() => setSheet({ type: "bulk" })}
          onSuccess={(i) => {
            refresh();
            showToast(`${LETTERS[i]} is live on the wall`);
          }}
        />
      )}

      {sheet?.type === "bulk" && (
        <BulkUploadSheet
          open
          onClose={closeSheet}
          user={user}
          onSuccess={(n) => {
            refresh();
            showToast(`${n} ${n === 1 ? "letter is" : "letters are"} live on the wall`);
          }}
        />
      )}

      {sheet?.type === "lightbox" && (
        <Lightbox
          open
          onClose={closeSheet}
          letter={LETTERS[sheet.letterIndex]}
          dayNumber={sheet.letterIndex + 1}
          item={sheet.item}
          mine={!!(sheet.mine || (user && sheet.item?.user_id === user.id))}
          shared={!!sheet.shared}
          onShare={() => setSheet({ ...sheet, type: "share" })}
          onJoin={() => {
            closeSheet();
            handleAccept();
          }}
        />
      )}

      {sheet?.type === "share" && (
        <ShareSheet
          open
          onClose={closeSheet}
          letter={LETTERS[sheet.letterIndex]}
          dayNumber={sheet.letterIndex + 1}
          name={user?.username || user?.name}
          imageUrl={sheet.item?.imageUrl}
          sharePath={sharePathFor(sheet.item, sheet.letterIndex)}
          accent={accentFor(sheet.letterIndex)}
        />
      )}

      <div className={`tt-toast ${toast ? "show" : ""}`}>{toast}</div>

      {import.meta.env.DEV && (
        <div className="absolute left-3 bottom-3 z-[110]">
          {devToolsOpen ? (
            <div className="bg-[#161616] border border-white/20 rounded-2xl p-3 w-56 text-white">
              <div className="flex justify-between text-[12px] font-bold text-white/60 mb-1">
                <span>Dev: challenge day</span>
                <b className="text-white">{currentDay}</b>
              </div>
              <input
                type="range"
                min={0}
                max={26}
                value={currentDay}
                onChange={(e) => setDevDay(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setDevDay(null)}
                  className="flex-1 bg-white/10 rounded-lg text-[11px] py-1.5 font-bold"
                >
                  Use real date
                </button>
                <button
                  onClick={() => setDevToolsOpen(false)}
                  className="flex-1 bg-evolve-yellow text-black rounded-lg text-[11px] py-1.5 font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setDevToolsOpen(true)}
              className="text-[10px] font-bold tracking-wide text-white/40 border border-dashed border-white/20 rounded-full px-3 py-1.5 bg-black/70"
            >
              DEV TOOLS
            </button>
          )}
        </div>
      )}
    </div>
  );
}
