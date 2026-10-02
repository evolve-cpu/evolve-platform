import * as React from "react";
import grain from "../assets/images/Home/grain_overlay.webp";

// Film-grain overlay. Used to be the full 5554x3703 photo inlined as base64
// (13.6 MB inside the main JS bundle, blocking every first load). Grain is
// random noise, so a small 512px tile repeated across the area looks the
// same at the overlay's low opacity.
const GrainTexture = ({ style, ...props }) => (
  <div
    aria-hidden="true"
    style={{
      width: "100%",
      height: "100%",
      display: "block",
      backgroundImage: `url(${grain})`,
      backgroundRepeat: "repeat",
      backgroundSize: "512px 512px",
      ...style
    }}
    {...props}
  />
);
export default React.memo(GrainTexture);
