import React from "react";
import { RotateCw } from "lucide-react";

const TabletOrientationOverlay = () => {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.95)",
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        backdropFilter: "blur(10px)"
      }}
    >
      <div
        style={{
          maxWidth: "400px",
          textAlign: "center",
          color: "white"
        }}
      >
        {/* Animated Rotate Icon */}
        <div
          style={{
            marginBottom: "2rem",
            display: "inline-block",
            animation: "rotate-pulse 2s ease-in-out infinite"
          }}
        >
          <RotateCw size={80} strokeWidth={1.5} />
        </div>

        {/* Message */}
        <h2
          style={{
            fontSize: "1.75rem",
            fontWeight: "600",
            marginBottom: "1rem",
            lineHeight: "1.3"
          }}
        >
          Please Rotate Your Device
        </h2>

        <p
          style={{
            fontSize: "1.125rem",
            opacity: 0.8,
            lineHeight: "1.6",
            marginBottom: "1.5rem"
          }}
        >
          This experience is optimized for landscape orientation. Please rotate
          your tablet to landscape mode for the best viewing experience.
        </p>

        <div
          style={{
            display: "inline-block",
            padding: "0.75rem 1.5rem",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            borderRadius: "8px",
            fontSize: "0.875rem",
            opacity: 0.6
          }}
        >
          Landscape Mode Required
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes rotate-pulse {
          0%, 100% {
            transform: rotate(0deg) scale(1);
            opacity: 0.8;
          }
          25% {
            transform: rotate(90deg) scale(1.1);
            opacity: 1;
          }
          50% {
            transform: rotate(90deg) scale(1);
            opacity: 0.8;
          }
          75% {
            transform: rotate(0deg) scale(0.9);
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
};

export default TabletOrientationOverlay;
