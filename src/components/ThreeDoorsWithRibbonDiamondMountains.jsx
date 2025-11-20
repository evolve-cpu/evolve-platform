import * as React from "react";
import { useRef, forwardRef, useImperativeHandle } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

const ThreeDoorsWithRibbonDiamondMountains = forwardRef(function TDwRDM(
  props,
  ref
) {
  const starRef = useRef(null);
  const diamondRef = useRef(null);
  const leftMountainsRef = useRef(null);
  const rightMountainsRef = useRef(null);

  useImperativeHandle(ref, () => ({
    // call this from the parent timeline right before you swap to the eye svg
    buildOutroToEye: ({ y = -70, scale = 1, duration = 1.5 } = {}) => {
      const tl = gsap.timeline();
      if (diamondRef.current && starRef.current) {
        tl.to([diamondRef.current, starRef.current], {
          y,
          scale,
          transformOrigin: "50% 50%",
          ease: "power2.out",
          duration,
          force3D: true
        });
      }
      return tl;
    },
    buildMountainsRise: ({ yStart = 140, duration = 0.9 } = {}) => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      const left = leftMountainsRef.current;
      const right = rightMountainsRef.current;

      tl.fromTo(
        [left, right],
        { y: yStart, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration,
          stagger: 0.08,
          immediateRender: false,
          lazy: false
        }
      )
        .to(
          [left, right],
          { y: -6, duration: 0.18, ease: "sine.out" },
          ">-0.08"
        )
        .to(
          [left, right],
          { y: 0, duration: 0.22, ease: "sine.inOut" },
          ">-0.06"
        );

      return tl;
    }
  }));

  useGSAP(() => {
    // Star twinkle animation
    if (starRef.current) {
      gsap.to(starRef.current, {
        opacity: 0,
        scale: 1.2,
        duration: 0.5,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
        transformOrigin: "center center"
      });
    }

    // Diamond breathing animation
    if (diamondRef.current) {
      gsap.to(diamondRef.current, {
        scale: 1.01,
        duration: 1.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        transformOrigin: "50% 50%"
      });
    }
  }, []);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1920 709"
      fill="none"
      width="100vw"
      height="auto"
      preserveAspectRatio="xMidYMid slice"
      style={{
        width: "100vw",
        height: "auto",
        display: "block",
        position: "relative"
      }}
      {...props}
    >
      <g clipPath="url(#clip0_3522_5292)">
        <g clipPath="url(#clip1_3522_5292)">
          {/* Large pink/magenta circle in the center background */}
          <circle
            cx={961}
            cy={787}
            r={572}
            fill="#DF0586"
            stroke="black"
            strokeWidth={2}
          />
        </g>

        {/* LEFT SECTION - Three "W" letter shapes forming part of the logo */}

        {/* First "W" arch - leftmost, black fill with yellow stroke */}
        <path
          d="M463 741V405.092C463 313.508 530.683 239 613.939 239C697.195 239 764.879 313.508 764.879 405.092V741H463.1H463Z"
          fill="#161616"
          stroke="#FFD007"
          strokeWidth={16}
          strokeMiterlimit={10}
        />

        {/* Second "W" arch - center-left, black fill with yellow stroke */}
        <path
          d="M808.859 741.1V416.5C808.859 328 876.632 256 959.999 256C1043.37 256 1111.14 328 1111.14 416.5V741.1H808.959H808.859Z"
          fill="#161616"
          stroke="#FFD007"
          strokeWidth={16}
          strokeMiterlimit={10}
        />

        {/* Third "W" arch - center-right, black fill with yellow stroke */}
        <path
          d="M1154.72 741.1V416.5C1154.72 328 1222.5 256 1305.86 256C1389.23 256 1457 328 1457 416.5V741.1H1154.82H1154.72Z"
          fill="#161616"
          stroke="#FFD007"
          strokeWidth={16}
          strokeMiterlimit={10}
        />

        {/* LEFT HAND - Purple gradient crystal/gem shapes */}
        <g
          ref={leftMountainsRef}
          style={{
            opacity: 0,
            transform: "translateY(140px)",
            transformBox: "fill-box",
            transformOrigin: "50% 100%"
          }}
        >
          {/* Leftmost purple crystal */}
          <path
            d="M516.056 732.822L470.969 731.562L492.979 642.938L516.056 555.672L539.036 642.938L561.144 731.562L516.056 732.822Z"
            fill="#7A44BC"
          />

          {/* Second crystal from left - purple */}
          <path
            d="M658.525 731.61L613.438 729.962L635.448 607.983L658.525 487.75L681.505 607.983L703.612 729.962L658.525 731.61Z"
            fill="#7A44BC"
          />

          {/* Center-left crystal - lighter purple */}
          <path
            d="M590.815 731.231L537.195 730.164L563.375 657.636L590.815 586.078L618.256 657.636L644.533 730.164L590.815 731.231Z"
            fill="#A35BFB"
          />

          {/* Center crystal - lighter purple */}
          <path
            d="M711.818 731.858L666.73 730.694L688.741 642.071L711.818 554.805L734.798 642.071L756.905 730.694L711.818 731.858Z"
            fill="#A35BFB"
          />
        </g>

        {/* LEFT HAND ARM - Dark pink/magenta hand shape */}
        <path
          d="M221.422 624.808C234.293 633.634 247.271 642.355 260.142 651.182C279.608 667.453 296.627 678.407 310.136 685.958C310.987 686.49 311.838 686.915 313.008 687.553C319.072 690.744 339.282 701.06 365.343 706.271C378.64 708.929 421.933 716.906 470.119 696.061C528.943 670.538 553.196 620.234 557.451 611.088C583.405 554.83 569.896 503.676 566.067 490.808C549.685 435.826 510.753 406.686 499.053 398.604C489.798 393.392 483.5 389.5 472 387.5C470.5 400.5 471.183 408.175 471.077 420.83C480.65 426.999 490.224 433.167 499.691 439.335C508.945 446.461 524.475 460.499 534.793 483.044C550.962 518.352 543.941 551.108 540.538 565.89C536.921 581.417 525.752 618.214 490.968 646.184C445.973 682.449 386.405 683.618 347.792 668.304C339.282 664.901 323.433 656.925 306.732 645.439C295.882 637.995 289.926 633.422 261.418 611.514C251.313 603.75 241.207 596.2 231.102 588.436C210.04 572.271 145.898 524.095 -11 407.324C-10.5745 424.659 -10.0427 441.888 -9.61725 459.222C67.3959 514.417 144.409 569.612 221.316 624.914L221.422 624.808Z"
          fill="#A30462"
        />

        {/* LEFT HAND FOREARM - Brighter pink overlay */}
        <path
          d="M470.647 421.153C470.647 432.426 470.435 443.699 470.435 454.972C477.668 458.375 489.156 464.969 499.261 477.199C513.515 494.534 516.387 513.038 518.089 524.205C521.6 547.389 517.026 565.362 515.749 569.935C514.047 575.997 509.154 591.63 496.496 607.689C479.902 628.746 460.223 637.679 450.969 641.827C429.907 651.186 411.717 652.462 404.697 652.674C395.868 652.993 374.807 652.781 351.724 642.784C342.576 638.849 335.981 634.595 325.769 627.895C309.069 617.048 297.687 607.476 295.347 605.456C276.094 589.397 156.957 495.916 -10.3656 365.001C-10.3656 379.145 -10.3656 393.396 -10.4719 407.54C86.3264 480.07 183.125 552.6 280.029 625.13C288.007 632.043 299.602 641.295 314.6 650.547C329.599 659.906 342.257 667.776 360.234 672.881C385.763 680.112 407.037 677.56 417.781 676.178C429.056 674.689 456.819 670.754 485.327 650.973C494.794 644.379 532.343 616.516 542.98 567.489C547.554 546.326 545.64 528.459 544.682 521.121C543.512 511.337 541.066 491.981 529.897 472.094C511.494 439.551 481.923 425.513 470.86 420.94L470.647 421.153Z"
          fill="#DE0686"
        />

        {/* LIGHTNING BOLT - Two-toned lightning in the center "W" */}
        <g ref={diamondRef}>
          {/* Right side of lightning bolt - darker gold/brown */}
          <path
            d="M1010.8 386.619L950.561 306.588L949.81 417.864L1010.8 386.619Z"
            fill="#BF9C05"
          />

          {/* Left side of lightning bolt - bright yellow */}
          <path
            d="M889.243 385.792L950.558 306.581L949.807 417.857L889.243 385.792Z"
            fill="#FFD007"
          />
        </g>

        {/* Star/sparkle element near the lightning bolt - white */}
        <path
          ref={starRef}
          d="M979.098 324.748L979.273 325.383C981.166 331.9 985.894 337.288 992.217 340.006L991.542 340.275C985.294 342.844 980.284 347.734 977.605 353.963L977.078 355.19L976.903 354.555C975.009 348.038 970.282 342.65 963.959 339.931L964.634 339.663C970.882 337.094 975.892 332.204 978.57 325.975L979.098 324.748Z"
          fill="white"
        />

        {/* RIGHT HAND - Purple gradient crystal/gem shapes (mirrored) */}
        <g
          ref={rightMountainsRef}
          style={{
            opacity: 0,
            transform: "translateY(140px)",
            transformBox: "fill-box",
            transformOrigin: "50% 100%"
          }}
        >
          {/* Rightmost purple crystal */}
          <path
            d="M1405.8 737.501L1452 736.21L1429.45 645.441L1405.8 556.062L1382.25 645.441L1359.6 736.21L1405.8 737.501Z"
            fill="#7A44BC"
          />

          {/* Second crystal from right - purple */}
          <path
            d="M1259.81 736.263L1306.02 734.575L1283.46 609.644L1259.81 486.5L1236.27 609.644L1213.61 734.575L1259.81 736.263Z"
            fill="#7A44BC"
          />

          {/* Center-right crystal - lighter purple */}
          <path
            d="M1329.2 735.869L1384.15 734.777L1357.32 660.493L1329.2 587.203L1301.08 660.493L1274.16 734.777L1329.2 735.869Z"
            fill="#A35BFB"
          />

          {/* Center crystal - lighter purple */}
          <path
            d="M1205.2 736.511L1251.41 735.319L1228.85 644.55L1205.2 555.172L1181.66 644.55L1159 735.319L1205.2 736.511Z"
            fill="#A35BFB"
          />
        </g>

        {/* CENTER CHEVRON/ARROW - Dark pink double chevron pointing up */}
        <path
          d="M956.524 501.624L817 676.004V634.694L956.524 462.398L1103 635.004V675.943L956.524 501.624Z"
          fill="#A30462"
        />

        {/* CENTER CHEVRON/ARROW - Bright pink overlay chevron */}
        <path
          d="M956.767 540.898L817 718.504V675.824L956.767 501.125L1103 675.824V717.611L956.767 540.898Z"
          fill="#DF0586"
        />

        {/* RIGHT HAND ARM - Dark pink/magenta hand shape (mirrored) */}
        <path
          d="M1698.58 624.808C1685.71 633.634 1672.73 642.355 1659.86 651.182C1640.39 667.453 1623.37 678.407 1609.86 685.958C1609.01 686.49 1608.16 686.915 1606.99 687.553C1600.93 690.744 1580.72 701.06 1554.66 706.271C1541.36 708.929 1498.07 716.906 1449.88 696.061C1391.06 670.538 1366.8 620.234 1362.55 611.088C1336.59 554.83 1350.1 503.676 1353.93 490.808C1370.31 435.826 1409.25 406.686 1420.95 398.604C1430.2 393.392 1436.85 388.711 1446 383.5C1448.5 396 1449.58 408.17 1449 421C1439.43 427.168 1429.78 433.167 1420.31 439.335C1411.05 446.461 1395.52 460.499 1385.21 483.044C1369.04 518.352 1376.06 551.108 1379.46 565.89C1383.08 581.417 1394.25 618.214 1429.03 646.184C1474.03 682.449 1533.6 683.618 1572.21 668.304C1580.72 664.901 1596.57 656.925 1613.27 645.439C1624.12 637.995 1630.07 633.422 1658.58 611.514C1668.69 603.75 1678.79 596.2 1688.9 588.436C1709.96 572.271 1774.1 524.095 1931 407.324C1930.57 424.659 1930.04 441.888 1929.62 459.222C1852.6 514.417 1775.59 569.612 1698.68 624.914L1698.58 624.808Z"
          fill="#A30462"
        />

        {/* RIGHT HAND FOREARM - Brighter pink overlay (mirrored) */}
        <path
          d="M1449.03 421.161C1449.03 432.434 1449 443.735 1449 455.008C1441.77 458.411 1430.52 464.977 1420.42 477.207C1406.16 494.542 1403.29 513.046 1401.59 524.213C1398.08 547.397 1402.65 565.37 1403.93 569.943C1405.63 576.005 1410.53 591.638 1423.18 607.697C1439.78 628.754 1459.46 637.687 1468.71 641.835C1489.77 651.193 1507.96 652.47 1514.98 652.682C1523.81 653.001 1544.87 652.789 1567.96 642.792C1577.1 638.857 1583.7 634.603 1593.91 627.903C1610.61 617.055 1621.99 607.484 1624.33 605.463C1643.59 589.405 1762.72 495.924 1930.05 365.009C1930.05 379.153 1930.05 393.404 1930.15 407.548C1833.35 480.078 1736.56 552.608 1639.65 625.138C1631.67 632.051 1620.08 641.303 1605.08 650.555C1590.08 659.914 1577.42 667.784 1559.45 672.889C1533.92 680.12 1512.64 677.568 1501.9 676.185C1490.62 674.696 1462.86 670.762 1434.35 650.981C1424.89 644.387 1387.34 616.524 1376.7 567.497C1372.13 546.333 1374.04 528.467 1375 521.129C1376.17 511.345 1378.61 491.989 1389.78 472.102C1408.19 439.559 1437.94 425.581 1449 421.008L1449.03 421.161Z"
          fill="#DE0686"
        />
      </g>

      {/* Clipping path definitions for masking elements */}
      <defs>
        {/* Main canvas clip area */}
        <clipPath id="clip0_3522_5292">
          <rect width={1920} height={720} fill="white" />
        </clipPath>

        {/* Circle background clip area */}
        <clipPath id="clip1_3522_5292">
          <rect
            width={945}
            height={1146}
            fill="white"
            transform="translate(487 214)"
          />
        </clipPath>
      </defs>
    </svg>
  );
});

export default React.memo(ThreeDoorsWithRibbonDiamondMountains);
