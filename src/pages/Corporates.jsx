import { useNavigate } from "react-router-dom";
import SEO from "../components/SEO";
import BlackNav from "../components/BlackNav";

export default function Corporates() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen lowercase" style={{ backgroundColor: "#161618" }}>
      <SEO
        title="evolve for corporates — build strong design teams"
        description="evolve for corporates helps organizations build strong design teams through continuous learning, upskilling, and the right talent."
        path="/corporates"
      />
      <BlackNav onLogoClick={() => navigate("/")} />

      <div className="px-6 pt-32 pb-24 max-w-2xl mx-auto text-center">
        <h1
          className="text-evolve-yellow font-extrabold"
          style={{ fontSize: "clamp(32px,6vw,56px)", letterSpacing: "-0.02em" }}
        >
          corporates
        </h1>
        <p className="text-white/70 mt-6 text-lg leading-relaxed">
          for organisations who believe in building strong design teams
          through constant learning, upskilling, and finding the right kind
          of members to join them.
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
