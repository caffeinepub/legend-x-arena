import { useEffect, useState } from "react";

interface FireAnimationProps {
  side: "left" | "right";
  intensity: "low" | "high";
}

export function FireAnimation({ side, intensity }: FireAnimationProps) {
  const isLeft = side === "left";
  const isHigh = intensity === "high";

  // Single lightweight CSS-only gradient strip — zero per-frame JS, one GPU layer
  const width = isHigh ? 56 : 18;

  // Left side: red/orange, Right side: blue
  const gradientA = isLeft
    ? "linear-gradient(to top, #ff2200cc, #ff660088, transparent)"
    : "linear-gradient(to top, #0055ffcc, #00aaff88, transparent)";

  const gradientB = isLeft
    ? "linear-gradient(to top, #ff440066, #ff990044, transparent)"
    : "linear-gradient(to top, #0033cc66, #0099ff44, transparent)";

  const keyA = isLeft ? "fireEdgeLeft" : "fireEdgeRight";
  const keyB = isLeft ? "fireEdgeFadeLeft" : "fireEdgeFadeRight";

  return (
    <>
      <style>{`
        @keyframes ${keyA} {
          0%,100% { opacity:0.55; transform:scaleY(1) translateZ(0); }
          50%      { opacity:0.85; transform:scaleY(1.06) translateZ(0); }
        }
        @keyframes ${keyB} {
          0%,100% { opacity:0.25; transform:scaleY(0.92) translateZ(0); }
          50%      { opacity:0.5;  transform:scaleY(1.04) translateZ(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .fire-strip-a, .fire-strip-b { animation: none !important; }
        }
      `}</style>

      {/* Primary strip */}
      <div
        aria-hidden="true"
        className="fire-strip-a"
        style={{
          position: "fixed",
          top: 0,
          bottom: 0,
          [isLeft ? "left" : "right"]: 0,
          width,
          background: gradientA,
          zIndex: 0,
          pointerEvents: "none",
          willChange: "transform, opacity",
          animation: `${keyA} 3s ease-in-out infinite`,
        }}
      />

      {/* Secondary glow strip (offset) */}
      <div
        aria-hidden="true"
        className="fire-strip-b"
        style={{
          position: "fixed",
          top: 0,
          bottom: 0,
          [isLeft ? "left" : "right"]: 0,
          width: Math.round(width * 0.6),
          background: gradientB,
          zIndex: 0,
          pointerEvents: "none",
          willChange: "transform, opacity",
          animation: `${keyB} 3.8s ease-in-out 0.6s infinite`,
        }}
      />
    </>
  );
}
