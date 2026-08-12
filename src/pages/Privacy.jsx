import { useNavigate } from "react-router-dom";
import BlackNav from "../components/BlackNav";

/* ─── sections — paste your Privacy Policy content here ──────────────────── */
const SECTIONS = [
  {
    title: "1. who we are",
    body: `evolve design ("we", "us", "our") operates the website evolvedesign.academy and the mentorship programme described therein. We are committed to protecting your personal information and your right to privacy.`
  },
  {
    title: "2. information we collect",
    body: `We collect information you provide directly to us, including:\n\n• Name and email address (when you sign in or register)\n• Phone number (when completing a mentorship payment)\n• Payment transaction details (processed and stored by Razorpay — we do not store card details)\n• Usage data collected automatically via Vercel Analytics`
  },
  {
    title: "3. how we use your information",
    body: `We use the information we collect to:\n\n• Create and manage your account\n• Process payments and send receipts\n• Communicate session details, recordings, and batch updates\n• Improve our platform and services\n• Comply with legal obligations`
  },
  {
    title: "4. how we share your information",
    body: `We do not sell your personal data. We share data only with:\n\n• Razorpay — for payment processing\n• Supabase — for secure data storage and authentication\n• Vercel — for website hosting and analytics\n\nAll third-party services are bound by their own privacy policies and appropriate data processing agreements.`
  },
  {
    title: "5. data retention",
    body: `We retain your personal data for as long as your account is active or as needed to provide services. You may request deletion of your data at any time by contacting us at content@evolvedesign.academy`
  },
  {
    title: "6. cookies",
    body: `We use minimal cookies and local storage necessary for authentication and session management. We do not use tracking cookies for advertising purposes.`
  },
  {
    title: "7. your rights",
    body: `You have the right to access, correct, or delete your personal data. To exercise these rights, please email us at content@evolvedesign.academy and we will respond within 30 days.`
  },
  {
    title: "8. security",
    body: `We implement industry-standard security measures to protect your data. All data transmission is encrypted via HTTPS. Authentication is handled by Supabase with secure token management.`
  },
  {
    title: "9. children's privacy",
    body: `Our service is not directed to individuals under the age of 18. We do not knowingly collect personal information from children.`
  },
  {
    title: "10. changes to this policy",
    body: `We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page with an updated date.`
  },
  {
    title: "11. contact us",
    body: `If you have any questions about this Privacy Policy, please contact us at:\n\ncontent@evolvedesign.academy`
  }
];

export default function Privacy() {
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
          privacy policy
        </h1>
        <p className="text-white/40 text-sm mb-12">last updated: March 2026</p>

        <div className="flex flex-col gap-10">
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h2 className="text-evolve-yellow font-bold text-base mb-2">
                {s.title}
              </h2>
              <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">
                {s.body}
              </p>
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
