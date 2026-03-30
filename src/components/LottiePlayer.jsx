import { DotLottieReact } from "@lottiefiles/dotlottie-react";

// During react-snap pre-rendering, navigator.userAgent === "ReactSnap".
// We skip Lottie entirely so its WASM CDN fetch doesn't crash the snapshot.
// In the real browser, renders exactly like DotLottieReact.
export default function LottiePlayer(props) {
  if (typeof navigator !== "undefined" && navigator.userAgent === "ReactSnap") {
    return null;
  }
  return <DotLottieReact {...props} />;
}
