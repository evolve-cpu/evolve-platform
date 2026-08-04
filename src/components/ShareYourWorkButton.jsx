import { useNavigate } from "react-router-dom";

const ShareYourWorkButton = ({ to, onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) onClick();
    if (to) navigate(to);
  };

  return (
    <button
      onClick={handleClick}
      className="font-extrabold cursor-pointer flex items-center gap-3 px-7 py-4 rounded-2xl"
      style={{
        backgroundColor: "#000",
        color: "var(--color-evolve-yellow, #FFD007)",
        boxShadow: "4px 4px 0 0 #BF9C05"
      }}
    >
      <span>Share your work</span>
      <span style={{ fontSize: "1.1em" }}>→</span>
    </button>
  );
};

export default ShareYourWorkButton;
