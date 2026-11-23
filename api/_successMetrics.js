// Success metrics: the admin "success metrics" tab (op "success_metrics" in
// api/admin.js). Not per user: one story for the business, in order:
//
//   1. funnel      came → looked around → wanted to join → signed in →
//                  explored the platform → took a real action
//   2. groups      what signed-in vs. not-signed-in people did (pages,
//                  sessions, time, where they entered / left)
//   3. why not     every visitor who never signed in, put in one bucket
//                  that explains the most likely reason
//   4. sources     which channel brings people, and which brings people
//                  who join / act (not just traffic)
//   5. events      per event: viewers → clicked "Book your spot" →
//                  registered, where viewers came from, what the ones who
//                  didn't register did instead
//   +  focus       a short list of plain-English "look here" notes
//
// A "person" is an account where we know it, else a browser (visitor id).
// Sessions and steps come from _platformJourneys.js (same rules: 30 min
// idle = new session, evolve team left out, India days).
// "Book your spot" clicks need supabase/migrations/success_metrics.sql.
// The leading underscore keeps Vercel from deploying this as a function.

import { addDays, fetchAll, hostOf, istDayStartIso, soft, tally, windows } from "./_platformReport.js";
import { buildSessions, loadActions, loadPeople } from "./_platformJourneys.js";

const MIN_SAMPLE = 10; // fewer people than this and a % is noise
const EVENT_PATH = /^\/(?:app\/)?events\/([^/?#]+)/;
const LEFT_SITE = "Left the site";

const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);
const round1 = (x) => Math.round((x || 0) * 10) / 10;
const ms = (t) => Date.parse(t);
function median(xs) {
  const s = xs.filter((x) => x != null).sort((a, b) => a - b);
  if (!s.length) return null;
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// ── channels: UTM tag first, then the referring site ──────────────────
const CHANNEL_RULES = [
  [/mail\.google|gmail|outlook|brevo|sendib|sendinblue|newsletter|^e-?mail/, "Email"],
  [/chatgpt|openai|perplexity|claude\.ai|gemini|copilot/, "AI assistants"],
  [/instagram|^ig$/, "Instagram"],
  [/linkedin|lnkd\.in/, "LinkedIn"],
  [/whatsapp|wa\.me/, "WhatsApp"],
  [/facebook|fb\.(com|me)|^fb$|^meta$/, "Facebook"],
  [/youtube|youtu\.be|^yt$/, "YouTube"],
  [/^t\.co$|twitter|^x\.com$|^x$/, "X / Twitter"],
  [/discord/, "Discord"],
  [/reddit/, "Reddit"],
  [/google/, "Google search"],
  [/bing|duckduckgo|yahoo|ecosia/, "Other search"],
  [/evolvedesign\.academy/, "Other evolve sites"]
];
const matchChannel = (s) => {
  if (!s) return null;
  for (const [re, name] of CHANNEL_RULES) if (re.test(s)) return name;
  return null;
};

export function channelOf(v) {
  if (!v) return "Direct / unknown";
  const tag = (v.utm_source || "").toLowerCase().trim();
  if (tag) return matchChannel(tag) || ((v.utm_medium || "").toLowerCase() === "email" ? "Email" : tag);
  const host = hostOf(v.referrer);
  if (host) return matchChannel(host) || host;
  return "Direct / unknown";
}

const regChannel = (r) => (r.source === "admin_invite" ? "Invited by the team" : channelOf(r));

// "App · Event detail" is still the Events area
const areaOf = (name) => (name === "App · Event detail" ? "App · Events" : name);

// ── funnel ────────────────────────────────────────────────────────────
const FUNNEL = [
  { key: "came", name: "Came to evolve", help: "Unique people with at least one visit in the range." },
  { key: "looked", name: "Looked around", help: "Opened more than one page or clicked something (didn't bounce)." },
  {
    key: "intent",
    name: "Wanted to join",
    help: "Clicked Sign in / Start for free / Book your spot, or opened the sign-in page. People already signed in count as passed."
  },
  { key: "signed_in", name: "Signed in", help: "Used evolve with an account: new sign-ups and returning members." },
  { key: "explored", name: "Explored the platform", help: "Opened 2+ areas of the platform (profile, grow, events, community…)." },
  {
    key: "acted",
    name: "Took a real action",
    help: "Registered for an event, built their AI profile, submitted a portfolio review, enrolled, paid or asked for verification."
  }
];

const LEAK_HINT = {
  looked: "People leave after the first page. Check the entry pages in section 2 and whether that source sends the right audience.",
  intent: "People read but are never moved to join. Give a clearer reason to sign up on the pages they read most.",
  signed_in: "People try to join but don't finish signing in. Look at the sign-in step itself: methods, errors, mobile.",
  explored: "New accounts stay on their first screen. Onboarding should walk them into a second area.",
  acted: "People explore but don't do anything. Make one first action (event, AI profile, review) the obvious next step."
};

// ── why visitors didn't sign in ───────────────────────────────────────
// first match wins, so each visitor sits in exactly one bucket
const REASONS = [
  {
    key: "event_signin_wall",
    name: "Wanted an event, stopped at sign-in",
    why: "Clicked “Book your spot” while signed out, then never signed in. They wanted the event; the sign-in wall lost them.",
    fix: "Make sign-in on the event page one tap (Google One Tap), or let people register with just an email first.",
    test: (p) => p.eventClicks.some((c) => !c.signedIn)
  },
  {
    key: "signin_dropoff",
    name: "Started signing in, didn't finish",
    why: "Clicked Sign in / Start for free or opened the sign-in page, but no account came of it.",
    fix: "Check the sign-in page on mobile, errors from Google / LinkedIn, and whether email sign-in links arrive.",
    test: (p) => p.cta || p.signinPage
  },
  {
    key: "event_no_click",
    name: "Read an event, didn't try to book",
    why: "Opened an event page and left without clicking “Book your spot”. The event (topic, date, price) didn't convince them.",
    fix: "Look at the events with the most viewers and lowest booking in section 5: title, speaker, date, price, the button above the fold.",
    test: (p) => p.eventViews.size > 0
  },
  {
    key: "bounced",
    name: "Left after one page",
    why: "Saw a single page and left. Either the page didn't hook them or the source sent the wrong audience.",
    fix: "See which entry pages and sources these come from; fix the top entry page first.",
    test: (p) => p.pageViews <= 1
  },
  {
    key: "browsed",
    name: "Browsed, never asked to join",
    why: "Read several pages but never clicked a sign-up button. They're interested, but nothing told them why to make an account.",
    fix: "Add a clear sign-up reason and button on the pages they read most (listed below).",
    test: () => true
  }
];

function personFrom(key) {
  return {
    key,
    userId: null,
    sessions: [],
    channel: null,
    campaign: null,
    pageNames: new Set(),
    areas: new Set(),
    pageViews: 0,
    actions: new Set(),
    signedUp: false,
    cta: false,
    signinPage: false,
    eventClicks: [], // { slug, signedIn }
    eventViews: new Map() // slug -> { source, next, dwellMs }
  };
}

function stageOf(p) {
  let st = 0;
  if (p.pageViews > 1 || p.cta || p.eventClicks.length || p.actions.size) st = 1;
  if (p.cta || p.signinPage || p.eventClicks.length) st = 2;
  if (p.userId) st = 3;
  if (p.areas.size >= 2) st = 4;
  if (p.actions.size) st = 5;
  return st;
}

function funnelOf(stages) {
  const counts = FUNNEL.map((_, i) => stages.filter((s) => s >= i).length);
  return FUNNEL.map((f, i) => ({
    ...f,
    people: counts[i],
    ofPrev: i ? pct(counts[i], counts[i - 1]) : 100,
    dropped: i ? counts[i - 1] - counts[i] : 0,
    ofAll: pct(counts[i], counts[0])
  }));
}

function groupStats(list) {
  const ses = list.flatMap((p) => p.sessions);
  const multi = ses.filter((s) => s.steps.length > 1);
  const bounced = ses.filter((s) => s.pages.length <= 1 && !s.steps.some((x) => x.kind === "cta" || x.kind === "action"));
  return {
    people: list.length,
    sessions: ses.length,
    sessionsPerPerson: list.length ? round1(ses.length / list.length) : 0,
    avgPages: ses.length ? round1(ses.reduce((a, s) => a + s.pages.length, 0) / ses.length) : 0,
    avgMinutes: multi.length ? round1(multi.reduce((a, s) => a + s.durationMs, 0) / multi.length / 60000) : 0,
    bounceRate: pct(bounced.length, ses.length),
    // pages: by people who opened them (not raw views)
    topPages: tally(
      list.flatMap((p) => [...p.pageNames]),
      (x) => x
    ).slice(0, 15),
    entries: tally(ses, (s) => s.pages[0]?.name || null).slice(0, 10),
    exits: tally(ses, (s) => s.pages[s.pages.length - 1]?.name || null).slice(0, 10)
  };
}

export async function buildSuccessMetrics(db, { rangeDays = 30, now = Date.now() } = {}) {
  const days = Math.min(Math.max(Number(rangeDays) || 30, 1), 90);
  const w = windows(now);
  const fromDay = addDays(w.today, -(days - 1));
  const from = istDayStartIso(fromDay);
  const to = istDayStartIso(addDays(w.today, 1));
  const fromMs = ms(from);
  const toMs = ms(to);
  const warnings = [];
  const inRange = (col) => (q) => q.gte(col, from).lt(col, to).order("id");

  const people = await loadPeople(db, warnings);
  const [rawSteps, visits, events, actions, eventRows, regs] = await Promise.all([
    soft(fetchAll(db, "analytics_steps", "visitor_id,session_id,user_id,kind,path,created_at", inRange("created_at")), "analytics_steps", warnings),
    soft(
      fetchAll(
        db,
        "analytics_visits",
        "visitor_id,session_id,user_id,landing_path,referrer,utm_source,utm_medium,utm_campaign,created_at",
        inRange("created_at")
      ),
      "analytics_visits",
      warnings
    ),
    soft(fetchAll(db, "analytics_events", "visitor_id,session_id,user_id,event,props,created_at", inRange("created_at")), "analytics_events", warnings),
    loadActions(db, people, warnings),
    soft(fetchAll(db, "events", "id,slug,title,start_time,status"), "events", warnings),
    soft(
      fetchAll(
        db,
        "event_registrations",
        "id,event_id,user_id,status,registered_at,attended,source,utm_source,utm_medium,utm_campaign,referrer",
        (q) => q.gte("registered_at", from).lt("registered_at", to).order("registered_at").order("id")
      ),
      "event_registrations",
      warnings
    )
  ]);

  // a browser that signed in at any point in the range is that account
  // all through it (the visits before sign-up are how they found us)
  const visitorUser = new Map();
  for (const r of [...rawSteps, ...events, ...visits])
    if (r.user_id && r.visitor_id && !visitorUser.has(r.visitor_id)) visitorUser.set(r.visitor_id, r.user_id);
  const steps = rawSteps.map((s) => (s.user_id ? s : { ...s, user_id: visitorUser.get(s.visitor_id) || null }));

  const sessions = buildSessions({
    steps,
    visits,
    events,
    actions: actions.filter((a) => ms(a.at) >= fromMs && ms(a.at) < toMs),
    people
  });

  // the channel of each session = the visit it started with
  const visitBySession = new Map(visits.filter((v) => v.session_id).map((v) => [v.session_id, v]));
  const firstVisitByVisitor = new Map();
  for (const v of [...visits].sort((a, b) => ms(a.created_at) - ms(b.created_at)))
    if (!firstVisitByVisitor.has(v.visitor_id)) firstVisitByVisitor.set(v.visitor_id, v);

  // ── people ──────────────────────────────────────────────────────────
  const persons = new Map();
  const personOfSession = new Map();
  for (const s of [...sessions].reverse()) {
    // oldest first, so the first session sets the channel
    const key = s.userId || `v:${s.visitor}`;
    if (!persons.has(key)) persons.set(key, personFrom(key));
    const p = persons.get(key);
    p.userId ||= s.userId;
    p.sessions.push(s);
    personOfSession.set(s.id, p);
    const visit = visitBySession.get(s.id) || firstVisitByVisitor.get(s.visitor);
    s.channel = channelOf(visit);
    if (!p.channel) {
      p.channel = s.channel;
      p.campaign = visit?.utm_campaign || null;
    }

    let firstPage = true;
    let prevPage = null;
    s.steps.forEach((st, i) => {
      if (st.kind === "page") {
        p.pageViews += 1;
        p.pageNames.add(st.name);
        if (st.name.startsWith("App · ")) p.areas.add(areaOf(st.name));
        if (st.name === "Sign-in page") p.signinPage = true;
        const slug = EVENT_PATH.exec(st.path || "")?.[1];
        if (slug && !p.eventViews.has(slug)) {
          const next = s.steps[i + 1];
          p.eventViews.set(slug, {
            source: firstPage ? s.channel : `Inside evolve · from ${prevPage}`,
            next: !next || next.kind === "leave" ? LEFT_SITE : next.name,
            dwellMs: next ? ms(next.t) - ms(st.t) : null
          });
        }
        firstPage = false;
        prevPage = st.name;
      } else if (st.kind === "cta") {
        p.cta = true;
      } else if (st.kind === "action") {
        if (st.name === "Signed up") p.signedUp = true;
        else p.actions.add(st.name);
      }
    });
  }

  // "Book your spot" clicks
  const clickRows = events.filter((e) => e.event === "event_register_click" && e.props?.slug);
  const personByVisitor = new Map();
  for (const p of persons.values()) for (const s of p.sessions) if (!personByVisitor.has(s.visitor)) personByVisitor.set(s.visitor, p);
  for (const e of clickRows) {
    const p = personOfSession.get(e.session_id) || personByVisitor.get(e.visitor_id);
    if (p) p.eventClicks.push({ slug: e.props.slug, signedIn: !!e.props.signed_in });
  }

  const all = [...persons.values()];
  for (const p of all) {
    const prof = p.userId ? people.byId.get(p.userId) : null;
    // a new account = created in this range (even if the sign-up step wasn't tracked)
    p.isNew = p.signedUp || (!!prof?.created_at && ms(prof.created_at) >= fromMs && ms(prof.created_at) < toMs);
    p.stage = stageOf(p);
    p.lastPage = (() => {
      for (let i = p.sessions.length - 1; i >= 0; i--) {
        const pg = p.sessions[i].pages;
        if (pg.length) return pg[pg.length - 1].name;
      }
      return null;
    })();
  }
  const signedIn = all.filter((p) => p.userId);
  const anon = all.filter((p) => !p.userId);

  // ── 1. funnel ───────────────────────────────────────────────────────
  const funnel = funnelOf(all.map((p) => p.stage));
  // the same funnel for people who arrived without an account only:
  // acquisition, without returning members flattering it
  const newcomers = all.filter((p) => !p.userId || p.isNew);
  const newcomerFunnel = funnelOf(newcomers.map((p) => p.stage));

  // ── 2. signed in vs not ─────────────────────────────────────────────
  const signedInStats = {
    ...groupStats(signedIn),
    newSignups: signedIn.filter((p) => p.isNew).length,
    returning: signedIn.filter((p) => !p.isNew).length,
    neverOpenedPlatform: signedIn.filter((p) => !p.areas.size).length,
    exploredNoAction: signedIn.filter((p) => p.areas.size && !p.actions.size).length,
    acted: signedIn.filter((p) => p.actions.size).length,
    areas: tally(
      signedIn.flatMap((p) => [...p.areas]),
      (x) => x
    ),
    actions: tally(
      signedIn.flatMap((p) => [...p.actions]),
      (x) => x
    )
  };
  const anonStats = {
    ...groupStats(anon),
    returningVisitors: anon.filter((p) => p.sessions.length > 1).length,
    lastPages: tally(anon, (p) => p.lastPage).slice(0, 10)
  };

  // ── 3. why they didn't sign in ──────────────────────────────────────
  const reasonPeople = new Map(REASONS.map((r) => [r.key, []]));
  for (const p of anon) reasonPeople.get(REASONS.find((r) => r.test(p)).key).push(p);
  const reasons = REASONS.map(({ key, name, why, fix }) => {
    const list = reasonPeople.get(key);
    return {
      key,
      name,
      why,
      fix,
      people: list.length,
      pct: pct(list.length, anon.length),
      leftFrom: tally(list, (p) => p.lastPage).slice(0, 6),
      channels: tally(list, (p) => p.channel).slice(0, 6),
      pages:
        key === "browsed"
          ? tally(
              list.flatMap((p) => [...p.pageNames]),
              (x) => x
            ).slice(0, 6)
          : []
    };
  }).sort((a, b) => b.people - a.people);

  // ── 4. sources ──────────────────────────────────────────────────────
  const regUsersByEvent = new Map();
  const activeRegs = regs.filter((r) => r.status !== "cancelled");
  for (const r of activeRegs) {
    if (!r.user_id) continue;
    if (!regUsersByEvent.has(r.event_id)) regUsersByEvent.set(r.event_id, new Set());
    regUsersByEvent.get(r.event_id).add(r.user_id);
  }
  const eventIdBySlug = new Map(eventRows.map((e) => [e.slug, e.id]));
  const registeredFor = (p, slug) => !!p.userId && !!regUsersByEvent.get(eventIdBySlug.get(slug))?.has(p.userId);
  const registeredAny = (p) => [...p.eventViews.keys()].some((slug) => registeredFor(p, slug));

  function sourceRow(label, list) {
    const fresh = list.filter((p) => !p.userId || p.isNew);
    const joined = fresh.filter((p) => p.isNew).length;
    const viewers = list.filter((p) => p.eventViews.size);
    return {
      label,
      people: list.length,
      share: pct(list.length, all.length),
      newcomers: fresh.length,
      newSignups: joined,
      joinRate: pct(joined, fresh.length),
      returning: list.filter((p) => p.userId && !p.isNew).length,
      bounced: pct(list.filter((p) => p.stage === 0).length, list.length),
      acted: list.filter((p) => p.actions.size).length,
      actRate: pct(list.filter((p) => p.actions.size).length, list.length),
      eventViewers: viewers.length,
      eventRegistered: viewers.filter(registeredAny).length,
      enough: list.length >= MIN_SAMPLE
    };
  }
  const groupBy = (list, keyOf) => {
    const m = new Map();
    for (const p of list) {
      const k = keyOf(p);
      if (k == null) continue;
      (m.get(k) || m.set(k, []).get(k)).push(p);
    }
    return [...m.entries()];
  };
  const channels = groupBy(all, (p) => p.channel || "Direct / unknown")
    .map(([k, list]) => sourceRow(k, list))
    .sort((a, b) => b.people - a.people);
  const campaigns = groupBy(all, (p) => p.campaign)
    .map(([k, list]) => sourceRow(k, list))
    .sort((a, b) => b.people - a.people)
    .slice(0, 20);
  const realChannels = channels.filter((c) => c.label !== "Direct / unknown");
  const mainSource = realChannels[0] || channels[0] || null;
  const bestSource =
    [...channels].filter((c) => c.newcomers >= MIN_SAMPLE).sort((a, b) => b.joinRate - a.joinRate || b.newcomers - a.newcomers)[0] || null;

  // ── 5. events ───────────────────────────────────────────────────────
  const eventBySlug = new Map(eventRows.map((e) => [e.slug, e]));
  const eventById = new Map(eventRows.map((e) => [e.id, e]));
  const slugs = new Set([
    ...all.flatMap((p) => [...p.eventViews.keys()]),
    ...activeRegs.map((r) => eventById.get(r.event_id)?.slug).filter(Boolean)
  ]);
  const clickTracking = clickRows.length > 0;

  const eventList = [...slugs]
    .map((slug) => {
      const ev = eventBySlug.get(slug);
      const viewers = all.filter((p) => p.eventViews.has(slug));
      const clickers = all.filter((p) => p.eventClicks.some((c) => c.slug === slug));
      const signedOutClickers = clickers.filter((p) => p.eventClicks.some((c) => c.slug === slug && !c.signedIn));
      const evRegs = ev ? activeRegs.filter((r) => r.event_id === ev.id) : [];
      const viewerRegs = viewers.filter((p) => registeredFor(p, slug));
      const notReg = viewers.filter((p) => !registeredFor(p, slug));
      const viewerUserIds = new Set(viewers.map((p) => p.userId).filter(Boolean));
      const bySource = groupBy(viewers, (p) => p.eventViews.get(slug).source)
        .map(([source, list]) => ({
          source,
          viewers: list.length,
          registered: list.filter((p) => registeredFor(p, slug)).length,
          rate: pct(list.filter((p) => registeredFor(p, slug)).length, list.length)
        }))
        .sort((a, b) => b.viewers - a.viewers);
      return {
        slug,
        title: ev?.title || slug,
        startTime: ev?.start_time || null,
        status: ev?.status || "unknown",
        past: ev?.start_time ? ms(ev.start_time) < now : false,
        viewers: viewers.length,
        signedInViewers: viewers.filter((p) => p.userId).length,
        clicked: clickers.length,
        clickedSignedOut: signedOutClickers.length,
        signedInAfterClick: signedOutClickers.filter((p) => p.userId).length,
        registered: evRegs.length,
        registeredFromViewers: viewerRegs.length,
        registeredUntracked: evRegs.filter((r) => !r.user_id || !viewerUserIds.has(r.user_id)).length,
        pending: evRegs.filter((r) => r.status === "pending").length,
        attended: evRegs.filter((r) => r.attended).length,
        viewedNotRegistered: notReg.length,
        conversion: pct(viewerRegs.length, viewers.length),
        bySource,
        regSources: tally(evRegs, regChannel),
        nextAfter: tally(notReg, (p) => p.eventViews.get(slug).next).slice(0, 8),
        medianSecNotReg: (() => {
          const m = median(notReg.map((p) => p.eventViews.get(slug).dwellMs));
          return m == null ? null : Math.round(m / 1000);
        })(),
        medianSecReg: (() => {
          const m = median(viewerRegs.map((p) => p.eventViews.get(slug).dwellMs));
          return m == null ? null : Math.round(m / 1000);
        })()
      };
    })
    .sort((a, b) => b.viewers - a.viewers || b.registered - a.registered);

  const eventViewers = all.filter((p) => p.eventViews.size);
  const eventClickers = all.filter((p) => p.eventClicks.length);
  const eventSignedOutClickers = eventClickers.filter((p) => p.eventClicks.some((c) => !c.signedIn));
  const listingPages = new Set(["Events (site)", "App · Events"]);
  const listingOnly = all.filter((p) => [...p.pageNames].some((n) => listingPages.has(n)) && !p.eventViews.size);
  const eventsOverview = {
    clickTracking,
    listingVisitorsNoDetail: listingOnly.length,
    viewers: eventViewers.length,
    clicked: eventClickers.length,
    clickedSignedOut: eventSignedOutClickers.length,
    signedInAfterClick: eventSignedOutClickers.filter((p) => p.userId).length,
    registeredFromViewers: eventViewers.filter(registeredAny).length,
    registrations: activeRegs.length,
    attended: activeRegs.filter((r) => r.attended).length,
    conversion: pct(eventViewers.filter(registeredAny).length, eventViewers.length),
    // first event page each person opened: how they got there
    viewerSources: tally(eventViewers, (p) => [...p.eventViews.values()][0].source).slice(0, 12),
    regSources: tally(activeRegs, regChannel).slice(0, 12)
  };

  // ── focus: what to look at first ────────────────────────────────────
  const focus = [];
  const leaks = newcomerFunnel
    .slice(1)
    .map((f, i) => ({ ...f, prev: newcomerFunnel[i] }))
    .filter((f) => f.prev.people >= MIN_SAMPLE && f.key !== "explored" && f.key !== "acted");
  const postSignup = funnel.slice(4).map((f, i) => ({ ...f, prev: funnel[3 + i] })).filter((f) => f.prev.people >= MIN_SAMPLE);
  const worstLeak = [...leaks, ...postSignup].sort((a, b) => a.ofPrev - b.ofPrev)[0];
  if (worstLeak)
    focus.push({
      level: "high",
      title: `Biggest drop: “${worstLeak.prev.name}” → “${worstLeak.name}”`,
      detail: `Only ${worstLeak.ofPrev}% of ${worstLeak.prev.people} people make it past this step; ${worstLeak.dropped} drop here. ${LEAK_HINT[worstLeak.key] || ""}`
    });
  const topReason = reasons[0];
  if (topReason?.people >= MIN_SAMPLE)
    focus.push({
      level: "high",
      title: `Most visitors who don't sign in: “${topReason.name}” (${topReason.pct}%)`,
      detail: `${topReason.people} of ${anon.length} visitors without an account. ${topReason.fix}`
    });
  const wall = reasons.find((r) => r.key === "event_signin_wall");
  if (wall && wall !== topReason && wall.people >= 3)
    focus.push({
      level: "high",
      title: `${wall.people} people wanted an event but stopped at sign-in`,
      detail: `These are the warmest leads you're losing: they clicked “Book your spot”. ${wall.fix}`
    });
  if (mainSource)
    focus.push({
      level: "info",
      title: `Main source: ${mainSource.label} (${mainSource.share}% of people)`,
      detail: `${mainSource.people} people; ${mainSource.joinRate}% of its new visitors made an account${mainSource.enough ? "" : " (small sample)"}.`
    });
  if (bestSource && bestSource.label !== mainSource?.label)
    focus.push({
      level: "medium",
      title: `Best-converting source: ${bestSource.label} (${bestSource.joinRate}% join)`,
      detail: `It brings fewer people (${bestSource.people}) but they join more often. Worth putting more into.`
    });
  const weak = channels.filter((c) => c.newcomers >= 20 && c.joinRate < (bestSource?.joinRate || 0) / 3);
  if (weak[0])
    focus.push({
      level: "medium",
      title: `${weak[0].label} brings traffic that rarely joins (${weak[0].joinRate}%)`,
      detail: `${weak[0].newcomers} new visitors, ${weak[0].bounced}% bounced. Check what that source promises vs. the page they land on.`
    });
  if (eventViewers.length >= MIN_SAMPLE)
    focus.push({
      level: eventsOverview.conversion < 20 ? "high" : "info",
      title: `Events: ${eventsOverview.conversion}% of event-page viewers register`,
      detail: `${eventViewers.length} people opened an event, ${eventsOverview.registeredFromViewers} registered${
        clickTracking ? `, ${eventClickers.length} clicked “Book your spot”` : ""
      }. ${eventViewers.length - eventsOverview.registeredFromViewers} looked and didn't register.`
    });
  const weakEvent = eventList.filter((e) => e.viewers >= MIN_SAMPLE).sort((a, b) => a.conversion - b.conversion)[0];
  if (weakEvent && eventList.filter((e) => e.viewers >= MIN_SAMPLE).length > 1)
    focus.push({
      level: "medium",
      title: `Lowest-converting event: “${weakEvent.title}” (${weakEvent.conversion}%)`,
      detail: `${weakEvent.viewers} viewers, ${weakEvent.registeredFromViewers} registered. Compare its title, timing and price with your best event.`
    });
  if (anonStats.returningVisitors >= 5)
    focus.push({
      level: "medium",
      title: `${anonStats.returningVisitors} visitors came back more than once without signing up`,
      detail: "They're interested enough to return. A reminder (email capture, newsletter, event alert) could turn them into members."
    });
  if (signedInStats.neverOpenedPlatform >= 5)
    focus.push({
      level: "medium",
      title: `${signedInStats.neverOpenedPlatform} signed-in people never opened the platform`,
      detail: "They have an account but stayed on the website. Send them into /app right after sign-in."
    });

  return {
    generatedAt: new Date(now).toISOString(),
    range: { days, from: fromDay, to: w.today },
    totals: {
      people: all.length,
      sessions: sessions.length,
      signedIn: signedIn.length,
      anonymous: anon.length,
      newSignups: signedInStats.newSignups
    },
    focus,
    funnel,
    newcomerFunnel,
    signedIn: signedInStats,
    anonymous: anonStats,
    reasons,
    sources: { channels, campaigns, main: mainSource?.label || null, best: bestSource?.label || null },
    events: { overview: eventsOverview, list: eventList.slice(0, 40) },
    warnings: [
      ...warnings,
      ...(clickTracking
        ? []
        : [
            "No “Book your spot” clicks recorded in this range yet, so the event funnel shows views → registrations only. Clicks are recorded from real visitors on the live site once supabase/migrations/success_metrics.sql has run and the new event page is deployed (not on localhost, and not from evolve team browsers)."
          ])
    ]
  };
}
