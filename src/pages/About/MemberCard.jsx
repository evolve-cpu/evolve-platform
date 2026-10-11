import { linkedin_logo } from "../../assets/images/Mentorship";
import { instagram_logo } from "../../assets/images/About";

// Photos are Google Drive files shared as "anyone with the link".
// driveId is the part between /d/ and /view in the share URL.
const drivePhoto = (id) => `https://lh3.googleusercontent.com/d/${id}=w800`;

// LinkedIn by default; Instagram for members who set `instagram` instead.
const getSocial = (member) => {
  if (member.linkedin)
    return { href: member.linkedin, icon: linkedin_logo, label: "LinkedIn" };
  if (member.instagram)
    return { href: member.instagram, icon: instagram_logo, label: "Instagram" };
  return null;
};

const SIZES = {
  lg: {
    name: "clamp(18px, 1.25vw, 24px)",
    text: "clamp(15px, 1.05vw, 20px)"
  },
  sm: {
    name: "clamp(18px, 1.05vw, 22px)",
    text: "clamp(15px, 0.9vw, 18px)"
  }
};

const MemberCard = ({ member, photoBg, size = "lg" }) => {
  const s = SIZES[size];
  const social = getSocial(member);

  return (
    <article className="w-full">
      <div
        className="w-full aspect-[355/361] overflow-hidden"
        style={{ backgroundColor: photoBg }}
      >
        {member.driveId && (
          <img
            src={drivePhoto(member.driveId)}
            alt={member.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <h3
          className="font-extrabold text-black"
          style={{ fontSize: s.name, lineHeight: 1.2 }}
        >
          {member.name}
        </h3>
        {social && (
          <a
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${member.name} on ${social.label}`}
            className="shrink-0"
          >
            <img src={social.icon} alt="" className="w-6 h-6" />
          </a>
        )}
      </div>

      <p
        className="mt-1 font-medium text-black/85 whitespace-pre-line"
        style={{ fontSize: s.text, lineHeight: 1.35 }}
      >
        {member.role}
      </p>

      {member.note && (
        <>
          <hr className="my-2 border-t border-black/15" />
          <p
            className="font-medium text-black/85"
            style={{ fontSize: s.text, lineHeight: 1.35 }}
          >
            {member.note}
          </p>
        </>
      )}
    </article>
  );
};

export default MemberCard;
