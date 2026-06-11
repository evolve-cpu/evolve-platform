import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { supabaseAdmin } from "../../supabaseAdminClient";
import { anant_logo } from "../../assets/images/Community";
import { useAnantTheme } from "../../context/AnantThemeContext";

const FORM_PATH = "/portfolio-review/form";

export default function AnantStudentProfile() {
  const navigate = useNavigate();
  const { dark, toggleDark } = useAnantTheme();

  const [authUser,  setAuthUser]  = useState(null);
  const [student,   setStudent]   = useState(null);
  const [review,    setReview]    = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [notFound,  setNotFound]  = useState(false);

  /* ── theme ── */
  const bg       = dark ? "#060c17"  : "#ffffff";
  const bg2      = dark ? "#040810"  : "#f8fafc";
  const cardBg   = dark ? "#071022"  : "#ffffff";
  const border   = dark ? "#0d1f3c"  : "#e2e8f0";
  const text      = dark ? "#ffffff"  : "#0f172a";
  const sub      = dark ? "rgba(255,255,255,0.5)"  : "#64748b";
  const labelCol = dark ? "rgba(255,255,255,0.35)" : "#94a3b8";
  const accent   = "#2563eb";

  useEffect(() => {
    let cancelled = false;

    async function fetchStudent(email) {
      // sessionStorage cache — populated by sign-in page or portfolio form
      try {
        const cached = sessionStorage.getItem("anu_student_cache");
        if (cached) {
          const p = JSON.parse(cached);
          if (p.anu_email === email) return p;
        }
      } catch {}

      // DB query — service role key bypasses RLS (null storage prevents JWT bleed-through)
      const { data } = await supabaseAdmin
        .from("anu_students").select("*").eq("anu_email", email).maybeSingle();
      if (data) sessionStorage.setItem("anu_student_cache", JSON.stringify(data));
      return data || null;
    }

    async function init() {
      // Step 1: try localStorage session immediately (fast path)
      let { data: { session } } = await supabase.auth.getSession();

      // Step 2: if no session yet, wait up to 4s for magic link hash to resolve
      if (!session?.user) {
        session = await new Promise((resolve) => {
          const tid = setTimeout(() => resolve(null), 4000);
          const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
            if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && s?.user) {
              clearTimeout(tid);
              subscription.unsubscribe();
              resolve(s);
            }
          });
        });
      }

      if (cancelled) return;
      if (!session?.user) { navigate("/signin", { replace: true }); return; }

      const u = session.user;
      setAuthUser(u);
      const email = u.email?.toLowerCase();

      const stu = await fetchStudent(email);
      if (cancelled) return;

      if (!stu) { setNotFound(true); setLoading(false); return; }
      setStudent(stu);

      const { data: rev } = await supabase
        .from("portfolio_reviews")
        .select("id, created_at, review_status, review_report_url, portfolio_link, portfolio_file_url")
        .eq("email", email)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!cancelled) { setReview(rev || null); setLoading(false); }
    }

    // Handle sign-out while on this page
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") { cancelled = true; navigate("/signin", { replace: true }); }
    });

    init();
    return () => { cancelled = true; sub.subscription.unsubscribe(); };
  }, [navigate]);

  async function handleSignOut() {
    sessionStorage.removeItem("anu_student_cache");
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#060c17" }}>
        <div className="w-7 h-7 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-6 text-center" style={{ background: "#060c17" }}>
        <img src={anant_logo} alt="" className="h-10 opacity-60" />
        <h1 className="text-white font-extrabold text-2xl">couldn't load your profile</h1>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
          your session is active but your profile data didn't load in time.
        </p>
        <button onClick={() => window.location.reload()}
          className="px-6 py-3 rounded-xl text-sm font-bold"
          style={{ background: "#2563eb", color: "#fff" }}>
          refresh page
        </button>
        <button onClick={handleSignOut}
          className="text-xs"
          style={{ color: "rgba(255,255,255,0.3)" }}>
          sign out instead
        </button>
      </div>
    );
  }

  const statusMeta = {
    pending:     { label: "submitted — under review", color: "#fbbf24", bg: "rgba(251,191,36,0.1)",   bord: "rgba(251,191,36,0.2)" },
    in_review:   { label: "review in progress",        color: "#60a5fa", bg: "rgba(96,165,250,0.1)",   bord: "rgba(96,165,250,0.2)" },
    done:        { label: "report ready",               color: "#4ade80", bg: "rgba(34,197,94,0.1)",    bord: "rgba(34,197,94,0.2)" },
    rejected:    { label: "not accepted",               color: "#f87171", bg: "rgba(248,113,113,0.1)", bord: "rgba(248,113,113,0.2)" }
  };
  const sm = review?.review_status ? statusMeta[review.review_status] : null;

  return (
    <div className="min-h-screen flex flex-col font-bricolage" style={{ background: bg, color: text }}>

      {/* nav */}
      <header className="flex items-center justify-between px-5 md:px-8 border-b"
        style={{ height: "64px", background: "#060c17", borderColor: "#0d1f3c" }}>
        <button onClick={() => navigate("/")} className="focus:outline-none">
          <img src={anant_logo} alt="Anant National University" className="h-10 w-auto object-contain" />
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs hidden md:block" style={{ color: "rgba(255,255,255,0.3)" }}>
            powered by evolve
          </span>
          {/* theme toggle */}
          <button onClick={toggleDark}
            className="w-8 h-8 rounded-full flex items-center justify-center border"
            style={{ borderColor: "#0d1f3c", backgroundColor: "#0a1628" }}
            aria-label="toggle theme">
            {dark ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="4" stroke="#93c5fd" strokeWidth="1.8"/>
                <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="#93c5fd" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" stroke="#93c5fd" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
          <button onClick={handleSignOut}
            className="text-xs px-3 py-1.5 rounded-lg border"
            style={{ borderColor: "#1e3a8a", color: "#60a5fa" }}>
            sign out
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10 flex flex-col gap-6">

        {/* greeting */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] mb-1" style={{ color: sub }}>
            my profile
          </p>
          <h1 className="font-extrabold leading-none" style={{ fontSize: "clamp(28px, 5vw, 44px)", letterSpacing: "-0.03em" }}>
            {student.first_name} {student.last_name}
          </h1>
        </div>

        {/* profile card */}
        <div className="rounded-2xl border p-6 grid grid-cols-2 md:grid-cols-3 gap-5"
          style={{ borderColor: border, background: cardBg }}>
          {[
            { label: "email",   value: student.anu_email },
            { label: "program", value: student.program },
            { label: "stream",  value: student.stream },
            { label: "year",    value: student.year ? `Year ${student.year}` : "—" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: labelCol }}>{label}</p>
              <p className="text-sm font-semibold" style={{ color: text }}>{value || "—"}</p>
            </div>
          ))}
        </div>

        {/* portfolio review section */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] mb-3" style={{ color: sub }}>
            portfolio review
          </p>

          {!review ? (
            <div className="rounded-2xl border p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              style={{ borderColor: border, background: cardBg }}>
              <div>
                <p className="font-bold text-sm" style={{ color: text }}>no submission yet</p>
                <p className="text-sm mt-0.5" style={{ color: sub }}>
                  submit your portfolio for an expert review — feedback within 5–7 working days.
                </p>
              </div>
              <button onClick={() => navigate(FORM_PATH)}
                className="font-bold px-5 py-3 rounded-xl text-sm flex-shrink-0 transition-opacity hover:opacity-90"
                style={{ background: accent, color: "#fff" }}>
                submit portfolio →
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: border, background: cardBg }}>
              <div className="p-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex flex-col gap-3 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    {sm && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold border"
                        style={{ background: sm.bg, color: sm.color, borderColor: sm.bord }}>
                        {sm.label}
                      </span>
                    )}
                    {review.submitted_at && (
                      <span className="text-xs" style={{ color: labelCol }}>
                        submitted {new Date(review.submitted_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    {[
                      { label: "submitted",   value: review.created_at ? new Date(review.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—" },
                      { label: "portfolio",  value: review.portfolio_link
                          ? <a href={review.portfolio_link} target="_blank" rel="noreferrer"
                              className="underline underline-offset-2" style={{ color: "#60a5fa" }}>
                              view →
                            </a>
                          : review.portfolio_file_url
                          ? <a href={review.portfolio_file_url} target="_blank" rel="noreferrer"
                              className="underline underline-offset-2" style={{ color: "#60a5fa" }}>
                              view file →
                            </a>
                          : "—" },
                      { label: "report",
                        value: review.review_report_url
                          ? <a href={review.review_report_url} target="_blank" rel="noreferrer"
                              className="underline underline-offset-2" style={{ color: "#4ade80" }}>
                              download report →
                            </a>
                          : "not ready yet"
                      }
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: labelCol }}>{label}</p>
                        <p className="text-sm font-semibold" style={{ color: text }}>{value || "—"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="border-t px-5 py-3 flex items-center justify-between" style={{ borderColor: border }}>
                <p className="text-xs" style={{ color: sub }}>
                  questions? contact <a href="mailto:portfolio@evolvedesign.academy" style={{ color: "#60a5fa" }}>portfolio@evolvedesign.academy</a>
                </p>
                <button onClick={() => navigate(FORM_PATH)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-opacity hover:opacity-80"
                  style={{ borderColor: border, color: sub }}>
                  view form
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="px-6 py-4 text-xs border-t flex justify-between"
        style={{ borderColor: border, color: dark ? "#334155" : "#94a3b8" }}>
        <span>Anant National University × evolve</span>
        <span>powered by evolvedesign.academy</span>
      </footer>
    </div>
  );
}
