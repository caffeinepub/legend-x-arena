import { useMemo } from "react";

interface FireAnimationProps {
  side: "left" | "right";
  intensity: "low" | "high";
}

interface ParticleConfig {
  width: number;
  height: number;
  left: number;
  duration: number;
  delay: number;
  bottom: string;
  id: string;
}

function generateParticles(
  count: number,
  colOffset: number,
  colIndex: number,
): ParticleConfig[] {
  // Use deterministic pseudo-random based on index so particles don't
  // regenerate on re-render (no Math.random() during render)
  return Array.from({ length: count }, (_, i) => {
    const seed = colIndex * 100 + i;
    const r1 = ((seed * 9301 + 49297) % 233280) / 233280;
    const r2 = (((seed + 1) * 9301 + 49297) % 233280) / 233280;
    const r3 = (((seed + 2) * 9301 + 49297) % 233280) / 233280;
    const r4 = (((seed + 3) * 9301 + 49297) % 233280) / 233280;
    const r5 = (((seed + 4) * 9301 + 49297) % 233280) / 233280;
    return {
      id: `col${colIndex}-p${i}`,
      width: Math.floor(r1 * 8) + 4,
      height: Math.floor(r2 * 14) + 8,
      left: colOffset + Math.floor(r3 * 10) - 5,
      duration: 800 + i * 150 + Math.floor(r4 * 300),
      delay: i * 200 + Math.floor(r5 * 400),
      bottom: `${Math.floor(r1 * 80)}%`,
    };
  });
}

export function FireAnimation({ side, intensity }: FireAnimationProps) {
  const isLeft = side === "left";
  const columnCount = intensity === "high" ? 3 : 1;

  const colors = isLeft
    ? ["#ff2200", "#ff6600", "#ff9900"]
    : ["#0066ff", "#00aaff", "#00ccff"];

  // Memoize so particles aren't regenerated on parent re-renders
  const columns = useMemo(
    () =>
      Array.from({ length: columnCount }, (_, ci) => {
        const offset = ci * 18;
        const particles = generateParticles(6, offset, ci);
        return { id: `col-${ci}`, offset, particles };
      }),
    [columnCount],
  );

  const baseStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    bottom: 0,
    width: intensity === "high" ? "64px" : "22px",
    zIndex: 0,
    pointerEvents: "none",
    overflow: "hidden",
    willChange: "transform", // promote to GPU layer
    ...(isLeft ? { left: 0 } : { right: 0 }),
  };

  return (
    <div style={baseStyle} aria-hidden="true">
      {columns.map((col) => (
        <div
          key={col.id}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: isLeft ? col.offset : undefined,
            right: !isLeft ? col.offset : undefined,
            width: "18px",
          }}
        >
          {col.particles.map((p, pi) => (
            <div
              key={p.id}
              style={{
                position: "absolute",
                bottom: p.bottom,
                left: `${p.left}px`,
                width: `${p.width}px`,
                height: `${p.height}px`,
                borderRadius: "50% 50% 40% 40%",
                background: colors[pi % colors.length],
                opacity: 0.7,
                // Avoid per-particle blur — too expensive on mobile; use single
                // container-level opacity instead
                animation: `fireRise ${p.duration}ms ease-out ${p.delay}ms infinite`,
                willChange: "transform, opacity",
                transform: "translateZ(0)",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
