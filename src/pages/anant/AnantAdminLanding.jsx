import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { supabaseAdmin } from "../../supabaseAdminClient";
import { anant_logo } from "../../assets/images/Community";
import { anu_admin_hero_img_1 } from "../../assets/anant";

export default function AnantAdminLanding() {
  const navigate = useNavigate();
  const [signedIn, setSignedIn] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [adminInitial, setAdminInitial] = useState("A");
  const [adminRole, setAdminRole] = useState("");

  useEffect(() => {
    // PIN-based evolve admin session
    if (sessionStorage.getItem("admin_access") === "true") {
      setSignedIn(true);
      setAdminName("Admin");
      setAdminInitial("A");
      setAdminRole("evolve admin");
      return;
    }

    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const email = session.user.email || "";
      setSignedIn(true);
      setAdminInitial(email[0]?.toUpperCase() || "A");

      const [{ data: fac }, { data: adm }] = await Promise.all([
        supabaseAdmin.from("anu_faculty").select("first_name, last_name").eq("anu_email", email).maybeSingle(),
        supabaseAdmin.from("anu_admins").select("first_name, last_name").eq("anu_email", email).maybeSingle()
      ]);
      const person = fac || adm;
      if (person) {
        const name = [person.first_name, person.last_name].filter(Boolean).join(" ");
        setAdminName(name || email);
        if (name) setAdminInitial(name[0].toUpperCase());
        setAdminRole(fac ? "faculty" : "college admin");
      } else {
        setAdminName(email);
        setAdminRole("");
      }
    }
    checkSession();

    const { data: sub } = supabase.auth.onAuthStateChange((_ev, session) => {
      if (!session?.user) {
        setSignedIn(false);
        setAdminName("");
        setAdminInitial("A");
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#ffffff", color: "#0f172a" }}
    >
      {/* ── Navbar ── */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 border-b"
        style={{ height: 64, background: "#060c17", borderColor: "#0d1f3c" }}
      >
        <div className="flex items-center gap-3">
          <img
            src={anant_logo}
            alt="Anant National University"
            className="h-10 w-auto object-contain"
          />
          <span
            className="text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
            style={{
              background: "rgba(37,99,235,0.2)",
              color: "#93c5fd",
              border: "1px solid rgba(37,99,235,0.3)"
            }}
          >
            Admin Portal
          </span>
        </div>

        <div className="flex items-center gap-3">
          {signedIn ? (
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="text-sm font-semibold px-4 py-2 rounded-lg border"
              style={{ borderColor: "#1e3a8a", color: "#93c5fd" }}
            >
              View dashboard
            </button>
          ) : (
            <button
              onClick={() => navigate("/admin/signin")}
              className="text-sm font-semibold px-4 py-2 rounded-lg border"
              style={{ borderColor: "#1e3a8a", color: "#93c5fd" }}
            >
              Sign in
            </button>
          )}
        </div>
      </header>

      {/* ── Hero ── */}
      <section
        className="px-6 md:px-10 py-16 md:py-24 border-b"
        style={{ borderColor: "#e2e8f0" }}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left copy */}
          <div>
            <span
              className="inline-block text-[11px] font-bold tracking-widest px-3 py-1.5 rounded border mb-6"
              style={{ borderColor: "#e2e8f0", color: "#94a3b8" }}
            >
              Anant National University × evolve
            </span>
            <h1
              className="font-extrabold leading-tight mb-5"
              style={{
                fontSize: "clamp(30px, 5vw, 52px)",
                letterSpacing: "-0.025em",
                color: "#0f172a"
              }}
            >
              Track your students' portfolio reviews, in one place
            </h1>
            <p
              className="text-base leading-relaxed mb-8"
              style={{ color: "#475569", maxWidth: "44ch" }}
            >
              A shared dashboard to monitor where each student stands in the
              portfolio review process, access completed reports, and view
              private reviewer remarks.
            </p>
            <button
              onClick={() => navigate(signedIn ? "/admin/dashboard" : "/admin/signin")}
              className="font-bold px-7 py-3.5 rounded-xl text-white"
              style={{ background: "#0f172a", fontSize: 15 }}
            >
              {signedIn ? "Go to dashboard" : "Sign in to dashboard"}
            </button>
          </div>

          {/* Right image */}
          <div className="flex items-center justify-center">
            <img
              src={anu_admin_hero_img_1}
              alt="Anant Admin Hero Image"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-6 md:px-10 py-16">
        <div className="max-w-6xl mx-auto">
          <h2
            className="font-bold mb-2"
            style={{ fontSize: "clamp(22px, 3vw, 30px)", color: "#0f172a" }}
          >
            What you can do here
          </h2>
          <p className="mb-10 text-base" style={{ color: "#475569" }}>
            Everything your team needs to follow up with students, in one screen
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                n: "1",
                title: "Track progress",
                body: "See where every student stands, from submission pending to report generated, all in one glance."
              },
              {
                n: "2",
                title: "Access reports & remarks",
                body: "View completed reports along with a short private note from the reviewer, written for your reference."
              },
              {
                n: "3",
                title: "Search & filter",
                body: "Quickly find students by name, programme, year or review status using tabs and filters."
              }
            ].map(({ n, title, body }) => (
              <div
                key={n}
                className="rounded-2xl border p-6"
                style={{ borderColor: "#e2e8f0" }}
              >
                <div
                  className="w-8 h-8 rounded-full border flex items-center justify-center mb-4 text-sm font-bold"
                  style={{ borderColor: "#cbd5e1", color: "#64748b" }}
                >
                  {n}
                </div>
                <p className="font-bold text-base mb-2" style={{ color: "#0f172a" }}>
                  {title}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="mt-auto px-6 md:px-10 py-5 border-t flex flex-col sm:flex-row items-center justify-between gap-2 text-xs"
        style={{ borderColor: "#e2e8f0", color: "#94a3b8" }}
      >
        <span>Evolve Team</span>
        <span>Anant National University, Ahmedabad</span>
      </footer>
    </div>
  );
}
