import { useState } from "react";
import { Link } from "react-router-dom";
import InstituteContactModal from "./InstituteContactModal";

const NAV_LINKS = [
  { path: "/designers", label: "designers" },
  { path: "/institutions", label: "institutions" },
  { path: "/corporates", label: "corporates" }
];

const SOCIAL_LINKS = [
  { label: "instagram", url: "https://www.instagram.com/evolvebypaperclip/" },
  { label: "youtube", url: "https://www.youtube.com/@evolvebypaperclip" },
  { label: "medium", url: "https://medium.com/@evolvebypaperclip" },
  {
    label: "linkedin",
    url: "https://www.linkedin.com/company/evolvedesignacademy/"
  },
  { label: "discord", url: "https://discord.gg/wKRYG7cSWt" }
];

/**
 * AudienceFooter — shared footer for the institutions & corporates pages.
 * `programme` tags the lead so institute vs. corporate inbound is distinguishable.
 */
const AudienceFooter = ({ programme = "general" }) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <footer className="w-full bg-evolve-black text-white lowercase">
      <div className="px-6 md:px-16 pt-20 md:pt-32 pb-16 md:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-0">
          {/* CTA — left half */}
          <div className="md:pr-16">
            <h2
              className="text-evolve-yellow font-extrabold"
              style={{ fontSize: "clamp(28px,4vw,44px)", lineHeight: 1.1 }}
            >
              ready to be remarkable?
            </h2>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-6 inline-flex items-center justify-center bg-evolve-yellow text-evolve-black font-extrabold px-6 py-3 text-[16px] hover:opacity-90 transition-opacity"
              style={{ borderRadius: 16, boxShadow: "4px 4px 0 0 #806804" }}
            >
              get in touch
            </button>
          </div>

          {/* nav + socials — right half, 50/50 split with the CTA */}
          <div className="md:border-l md:border-white/15 md:pl-16">
            <div className="flex flex-col-reverse md:flex-row gap-8 md:gap-20">
              <div>
                <div className="text-white/40 text-[13px] mb-3">
                  navigation
                </div>
                <ul className="space-y-2">
                  {NAV_LINKS.map((item) => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className="text-white hover:text-evolve-yellow transition-colors duration-200 text-[16px]"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-white/40 text-[13px] mb-3">socials</div>
                <ul className="space-y-2">
                  {SOCIAL_LINKS.map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-evolve-yellow transition-colors duration-200 text-[16px]"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-white/15 my-8 md:my-10" />

        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-white/40 text-[13px]">
          <span>©2026 evolve. all rights reserved</span>
          <span className="hidden md:inline">·</span>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-white transition-colors duration-200">
              privacy policy
            </Link>
            <span>·</span>
            <Link to="/terms" className="hover:text-white transition-colors duration-200">
              terms &amp; conditions
            </Link>
          </div>
        </div>
      </div>

      <InstituteContactModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        programme={programme}
        intent="contact"
      />
    </footer>
  );
};

export default AudienceFooter;
