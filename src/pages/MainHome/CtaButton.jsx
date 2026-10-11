import { right_arrow_yellow } from "../../assets/images/Home_images";

const CLASS_NAME =
  "inline-flex items-center gap-3 rounded-[12px] bg-evolve-black text-evolve-yellow font-bold px-7 py-3 md:px-[clamp(28px,3.3vw,64px)] md:py-[clamp(12px,1vw,18px)] shadow-[4px_4px_0px_#806804] transition-transform duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#806804] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none";

const STYLE = { fontSize: "clamp(16px, 1.15vw, 22px)" };

// Renders an external link when `href` is given, otherwise a button.
const CtaButton = ({ children, onClick, href }) => {
  const content = (
    <>
      {children}
      <img src={right_arrow_yellow} alt="" className="w-5 h-5" />
    </>
  );

  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={CLASS_NAME}
      style={STYLE}
    >
      {content}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={CLASS_NAME} style={STYLE}>
      {content}
    </button>
  );
};

export default CtaButton;
