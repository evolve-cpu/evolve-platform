import MemberCard from "./MemberCard";
import MemberCarousel from "./MemberCarousel";

const PHOTO_BG = "rgba(255, 208, 7, 1)"; // evolve-yellow

// Fill driveId / linkedin per person (see MemberCard for the driveId format).
const TEAM = [
  {
    name: "Yagnesh Ahir",
    role: "Founder, Mentor",
    driveId: "1P0m2ABeHIq4bo_BYuJCw2U85O3PxVzTu",
    linkedin:
      "https://www.linkedin.com/in/yagnesh-ahir-24676516/?isSelfProfile=false"
  },
  {
    name: "Sonam Gandhi",
    role: "Product Owner",
    driveId: "1ZVMlCAE07QsEJwiR_kOg_9wJJKUn8Zd1",
    linkedin: "https://www.linkedin.com/in/gandhisonam/"
  },
  {
    name: "Sakshi Patki",
    role: "Visual Design Lead",
    driveId: "1TBM7bpZ0QcSacXq1gaKcpm9Z5-C5WSUW",
    linkedin:
      "https://www.linkedin.com/in/sakshi-patki-97473b200/?isSelfProfile=true"
  },
  {
    name: "Arnab Majumdar",
    role: "Tech Lead",
    driveId: "1WrrZ8oUMw1v9hafFB2K9xrgScwhT6TBl",
    linkedin: "https://www.linkedin.com/in/arnab-majumder-923ab41bb/"
  },
  {
    name: "Yash singh dhandal",
    role: "Community Lead",
    driveId: "1aRHTkAkXEa9c8MMJ5PPD1w4AjqeoNRyx",
    linkedin: "https://www.linkedin.com/in/yvd-singh/"
  },
  {
    name: "Chesna Sorathia",
    role: "Support Team Lead",
    driveId: "12WO8HgaQ8JO-cooIhIPn6EwGIcovgcX9",
    linkedin: "https://www.linkedin.com/in/chesna-sorathiya/"
  }
];

const TeamSection = () => (
  <section className="w-full bg-[#FFE470] px-6 py-16 md:py-[5vw]">
    <h2
      className="font-extrabold text-evolve-pink text-left md:text-center"
      style={{
        fontSize: "clamp(40px, 3.4vw, 72px)",
        lineHeight: 1,
        letterSpacing: "-0.03em"
      }}
    >
      evolve team
    </h2>

    {/* Desktop grid */}
    <div className="hidden md:grid grid-cols-3 gap-x-[2.5vw] gap-y-[2.6vw] mt-[3.5vw] mx-auto max-w-[min(61vw,1400px)]">
      {TEAM.map((member) => (
        <MemberCard key={member.name} member={member} photoBg={PHOTO_BG} />
      ))}
    </div>

    <MemberCarousel members={TEAM} photoBg={PHOTO_BG} />
  </section>
);

export default TeamSection;
