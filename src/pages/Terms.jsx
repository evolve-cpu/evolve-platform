import { useNavigate } from "react-router-dom";
import BlackNav from "../components/BlackNav";

/* ─── sections — paste your T&C content here ─────────────────────────────── */
const SECTIONS = [
  {
    title: "1. acceptance of terms",
    body: `By accessing or using the evolve design mentorship platform ("Service"), you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the Service.`
  },
  {
    title: "2. description of service",
    body: `evolve design provides a group mentorship programme comprising live online sessions, portfolio and resume guidance, and career support for aspiring and early-career product designers. Session details, batch dates, and pricing are as displayed on the website at the time of purchase.`
  },
  {
    title: "3. eligibility",
    body: `You must be at least 18 years old to purchase or participate in the mentorship programme. By completing payment you represent that you meet this requirement.`
  },
  {
    title: "4. payments",
    body: `All payments are processed securely through Razorpay. Prices are listed in Indian Rupees (INR) and include applicable GST. Your spot in the batch is confirmed only after successful payment.`
  },
  {
    title: "5. refund policy",
    body: `We do not offer refunds once a batch has commenced. If you are unable to attend before the batch begins, please contact us at least 48 hours in advance and we will do our best to accommodate you in a future batch.`
  },
  {
    title: "6. session recordings",
    body: `Sessions may be recorded for the benefit of enrolled students only. Recordings are shared exclusively within the batch group and must not be redistributed, published, or shared outside the programme.`
  },
  {
    title: "7. intellectual property",
    body: `All content, materials, and recordings produced as part of the evolve design programme are the intellectual property of evolve design. You may not reproduce or distribute them without prior written consent.`
  },
  {
    title: "8. conduct",
    body: `Participants are expected to maintain a respectful and constructive environment. evolve design reserves the right to remove any participant from the programme without refund in cases of disruptive or harmful behaviour.`
  },
  {
    title: "9. limitation of liability",
    body: `evolve design provides guidance and mentorship in good faith but does not guarantee specific career outcomes such as job placement or salary increases. Our total liability to you shall not exceed the amount paid for the programme.`
  },
  {
    title: "10. changes to terms",
    body: `We may update these Terms from time to time. Continued use of the Service after changes constitutes your acceptance of the revised Terms.`
  },
  {
    title: "11. contact",
    body: `For any questions regarding these Terms, please contact us at content@evolvedesign.academy`
  }
];

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#161618" }}>
      <BlackNav onLogoClick={() => navigate("/")} />

      {/* content */}
      <div className="px-6 pt-28 pb-20 max-w-2xl mx-auto">
        <h1
          className="text-white font-bold mb-2"
          style={{ fontSize: "clamp(32px,6vw,52px)", letterSpacing: "-0.02em" }}
        >
          terms &amp; conditions
        </h1>
        <p className="text-white/40 text-sm mb-12">last updated: March 2026</p>

        <div className="flex flex-col gap-10">
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h2 className="text-evolve-yellow font-bold text-base mb-2">
                {s.title}
              </h2>
              <p className="text-white/70 text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-white/10">
          <button
            onClick={() => navigate(-1)}
            className="text-evolve-yellow text-sm font-semibold hover:opacity-80"
          >
            ← back
          </button>
        </div>
      </div>
    </div>
  );
}
