import SEO from "../components/SEO";
import AudienceNav from "../components/AudienceNav";
import AudienceFooter from "../components/AudienceFooter";

export default function Corporates() {
  return (
    <div className="w-full lowercase">
      <SEO
        title="evolve for corporates — build strong design teams"
        description="evolve for corporates helps organizations build strong design teams through continuous learning, upskilling, and the right talent."
        path="/corporates"
      />
      <AudienceNav />

      <section
        className="w-full bg-evolve-black flex flex-col items-center text-center"
        style={{
          padding:
            "clamp(120px,20vh,180px) clamp(24px,6vw,96px) clamp(96px,16vh,160px)"
        }}
      >
        <h1
          className="text-evolve-yellow font-extrabold"
          style={{ fontSize: "clamp(32px,6vw,56px)", letterSpacing: "-0.02em" }}
        >
          corporates
        </h1>
        <p
          className="text-white/70 mt-6 max-w-2xl"
          style={{ fontSize: "clamp(16px,1.4vw,20px)", lineHeight: 1.5 }}
        >
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
      </section>

      <AudienceFooter programme="corporates" />
    </div>
  );
}
