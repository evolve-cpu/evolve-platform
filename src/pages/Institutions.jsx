import { useNavigate } from "react-router-dom";
import SEO from "../components/SEO";
import BlackNav from "../components/BlackNav";

export default function Institutions() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen lowercase" style={{ backgroundColor: "#161618" }}>
      <SEO
        title="evolve for institutions — design growth for colleges & coaching institutes"
        description="evolve for institutions gives design colleges and coaching institutes industry exposure and readiness for their students."
        path="/institutions"
      />
      <BlackNav onLogoClick={() => navigate("/")} />

      <div className="px-6 pt-32 pb-24 max-w-2xl mx-auto text-center">
        <h1
          className="text-evolve-yellow font-extrabold"
          style={{ fontSize: "clamp(32px,6vw,56px)", letterSpacing: "-0.02em" }}
        >
          institutions
        </h1>
        <p className="text-white/70 mt-6 text-lg leading-relaxed">
          for design colleges, coaching institutes, and co-horts looking to
          give their students industry exposure and get them ready for the
          world.
        </p>
        <p className="text-white/40 mt-10 text-sm">
          this page is coming soon — reach out at{" "}
          <a
            href="mailto:content@evolvedesign.academy"
            className="text-evolve-yellow underline"
          >
            content@evolvedesign.academy
          </a>{" "}
          in the meantime.
        </p>
      </div>
    </div>
  );
}
