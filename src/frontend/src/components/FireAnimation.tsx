interface FireAnimationProps {
  side: "left" | "right";
  intensity: "low" | "high";
}

// Ultra-lightweight CSS-only red+blue breathing background strips.
// Zero JS, zero particles, zero per-frame computation.
// Uses will-change:opacity + translateZ(0) for GPU compositing.
export function FireAnimation({ side, intensity }: FireAnimationProps) {
  const isLeft = side === "left";
  const isHigh = intensity === "high";
  const keyName = isLeft ? "breatheLeft" : "breatheRight";
  const color = isLeft ? "rgba(204,0,0,0.08)" : "rgba(0,68,204,0.08)";
  const colorPeak = isLeft ? "rgba(204,0,0,0.14)" : "rgba(0,68,204,0.14)";
  const width = isHigh ? "40%" : "30%";
  const pos = isLeft ? "left" : "right";

  return (
    <>
      <style>{`
        @keyframes ${keyName} {
          0%,100% { opacity:1; }
          50%      { opacity:1.8; }
        }
        @media (prefers-reduced-motion: reduce) {
          .arena-bg-strip { animation: none !important; }
        }
      `}</style>
      <div
        aria-hidden="true"
        className="arena-bg-strip"
        style={{
          position: "fixed",
          top: 0,
          bottom: 0,
          [pos]: 0,
          width,
          background: `linear-gradient(to ${isLeft ? "right" : "left"}, ${colorPeak} 0%, ${color} 50%, transparent 100%)`,
          zIndex: 0,
          pointerEvents: "none",
          willChange: "opacity",
          transform: "translateZ(0)",
          animation: `${keyName} 5s ease-in-out infinite`,
        }}
      />
    </>
  );
}
