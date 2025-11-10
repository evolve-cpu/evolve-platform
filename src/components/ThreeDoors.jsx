import * as React from "react";

const ThreeDoors = React.forwardRef(({ leftRef, middleRef, rightRef }, ref) => (
  <svg
    ref={ref}
    width={1010}
    height={518}
    viewBox="0 0 1010 518"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0_2961_1689)">
      <circle
        cx={506}
        cy={573}
        r={572}
        fill="#DF0586"
        stroke="black"
        strokeWidth={2}
      />
    </g>

    {/* LEFT DOOR */}
    <path
      ref={leftRef}
      d="M8 526.5V190.592C8 99.0083 75.6831 24.5 158.939 24.5C242.195 24.5 309.879 99.0083 309.879 190.592V526.5H8.09986H8Z"
      fill="#161616"
      stroke="#FFD007"
      strokeWidth={16}
      strokeMiterlimit={10}
    />

    {/* MIDDLE DOOR */}
    <path
      ref={middleRef}
      d="M353.859 526.6V202C353.859 113.5 421.632 41.5 504.999 41.5C588.365 41.5 656.138 113.5 656.138 202V526.6H353.959H353.859Z"
      fill="#161616"
      stroke="#FFD007"
      strokeWidth={16}
      strokeMiterlimit={10}
    />

    {/* RIGHT DOOR */}
    <path
      ref={rightRef}
      d="M699.723 526.6V202C699.723 113.5 767.495 41.5 850.862 41.5C934.228 41.5 1002 113.5 1002 202V526.6H699.823H699.723Z"
      fill="#161616"
      stroke="#FFD007"
      strokeWidth={16}
      strokeMiterlimit={10}
    />

    <defs>
      <clipPath id="clip0_2961_1689">
        <rect width={945} height={535} fill="white" transform="translate(32)" />
      </clipPath>
    </defs>
  </svg>
));

export default React.memo(ThreeDoors);
