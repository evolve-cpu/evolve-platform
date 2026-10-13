import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CtaButton from "../MainHome/CtaButton";
import MemberCard from "./MemberCard";
import MobileMemberSheet, { MobileMemberGrid } from "./MobileMemberSheet";

const PHOTO_BG = "#FFE470";
const COLLABORATOR_PATH = "/portfolio-review/become-a-reviewer";

// Fill driveId / linkedin per person (see MemberCard for the driveId format).
const COLLABORATORS = [
  {
    name: "Param singh Dayani",
    role: "Founder: Antispace.in",
    note: "Mentor and Webinar Speaker",
    driveId: "1ntxbvMqPVjKqLxJ4YwmyBXOhvH51CMXg",
    instagram: "https://www.instagram.com/antispace.in/"
  },
  {
    name: "Aman Gupta",
    role: "Product Designer at Stadium",
    note: "Webinar Speaker",
    driveId: "1MNuy0ezUn13uUtcFM1vfH_u_EBi-pMSP",
    linkedin: "https://in.linkedin.com/in/iamanguptaa"
  },
  {
    name: "Dwipal Patel",
    role: "Marketing Director at Printwell Offset",
    note: "Webinar Speaker",
    driveId: "1wKL5lmQhuL1AA7NtKhh83RCugNcsY3Yf",
    linkedin: "https://in.linkedin.com/in/dwipalupatel"
  },
  {
    name: "Nandini Kulkarni",
    role: "Co-founder at Idiom services",
    note: "Webinar Speaker",
    driveId: "1eI09rIvHkhhAKrDZcgnci2fp1yi8D06X",
    linkedin: "https://in.linkedin.com/in/nandini-kulkarni-9b0a61175"
  },
  {
    name: "Abhinav Agarwal",
    role: "Co-founder at Idiom services",
    note: "Mentor and Webinar Speaker",
    driveId: "1FmQTZLBpeD5LiYel6E84iOjZn1Ie8DL8",
    linkedin: "https://www.linkedin.com/in/abhinav3335/?isSelfProfile=false"
  },
  {
    name: "Padmaja Amin",
    role: "Product Designer at Stadium",
    note: "external Jury & Webinar Speaker",
    driveId: "13ki61Czpt8uL_x0KcghutikQIT0CvVli",
    linkedin: "https://in.linkedin.com/in/padmaja-amin"
  },
  {
    name: "Adya Sinha",
    role: "Product Designer at Stadium",
    note: "Webinar Speaker",
    driveId: "1UDI0BBEVFYc-xV-qTI9Ii8fkUNRbaYLP",
    linkedin: "https://in.linkedin.com/in/adya-sinha-96789b15a"
  },
  {
    name: "Uma Muthu",
    role: "Product Designer, at Servicemax",
    note: "Webinar Speaker",
    driveId: "1j5_JkRonwjEzB_JQWtb7aeFqyVSiGyOk",
    linkedin: "https://www.linkedin.com/in/umamuthu19"
  },
  {
    name: "Danesh Tolani",
    role: "UX Designer at Stadium",
    note: "Visiting faculty at NID",
    driveId: "1nDaUaTtTtRZdVioPS8LqX_iwxqgKDnUw",
    linkedin: "https://www.linkedin.com/in/daneshtolani/"
  },
  {
    name: "Jai Ranjit",
    role: "Assistant Professor,\nATLAS SkillTech University",
    note: "Webinar Speaker",
    driveId: "1r4YAxwf50DbwIQYwkU36LgzDmW9vp3uH",
    linkedin: "https://in.linkedin.com/in/jai-ranjit-05314675"
  },
  {
    name: "Ankit Passi",
    role: "Deputy Manager (Design),\nDeloitte Digital",
    note: "Webinar Speaker",
    driveId: "1RmJRetTLht0BaD3fUX_j9YiMnolkMjJj",
    linkedin: "https://in.linkedin.com/in/ankitpassi"
  },
  {
    name: "Kishan Parasu",
    role: "Asst. Professor (Economics) at IRMA",
    note: "Webinar Speaker",
    driveId: "1CTwjsJkf1pl_w_YlHOWj1vT8IpqKL_n4",
    linkedin: "https://in.linkedin.com/in/kishanparasu"
  }
].map((c) => ({ driveId: "", linkedin: "", ...c }));

const CollaboratorsSection = () => {
  const navigate = useNavigate();
  const [openIdx, setOpenIdx] = useState(null);
  const openMember = openIdx === null ? null : COLLABORATORS[openIdx];

  return (
    <section className="w-full bg-evolve-yellow">
      <div className="px-6 py-16 md:py-[5vw]">
        <h2
          className="font-extrabold text-evolve-pink text-left md:text-center"
          style={{
            fontSize: "clamp(40px, 3.4vw, 72px)",
            lineHeight: 1,
            letterSpacing: "-0.03em"
          }}
        >
          evolve collaborators
        </h2>

        <p
          className="mt-5 font-medium text-black text-left md:text-center md:mx-auto md:max-w-[min(44vw,900px)]"
          style={{ fontSize: "clamp(18px, 1.67vw, 32px)", lineHeight: 1.3 }}
        >
          The people who bring industry experience, ideas, and perspectives into
          evolve.
        </p>

        {/* Desktop grid */}
        <div className="hidden md:grid grid-cols-4 gap-x-[2.6vw] gap-y-[3.5vw] mt-[3.5vw] mx-auto max-w-[min(82vw,1800px)]">
          {COLLABORATORS.map((member) => (
            <MemberCard
              key={member.name}
              member={member}
              photoBg={PHOTO_BG}
              size="sm"
            />
          ))}
        </div>

        <MobileMemberGrid
          members={COLLABORATORS}
          photoBg={PHOTO_BG}
          onSelect={setOpenIdx}
        />
        <MobileMemberSheet
          open={Boolean(openMember)}
          onClose={() => setOpenIdx(null)}
          label={openMember?.name}
        >
          {openMember && (
            <MemberCard member={openMember} photoBg={PHOTO_BG} socialBelow />
          )}
        </MobileMemberSheet>

        <div className="mt-14 md:mt-[4vw] flex justify-center">
          <CtaButton onClick={() => navigate(COLLABORATOR_PATH)}>
            Be a collaborator
          </CtaButton>
        </div>
      </div>
    </section>
  );
};

export default CollaboratorsSection;
