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
  return Array.from({ length: count }, (_, i) => ({
    id: `col${colIndex}-p${i}`,
    width: Math.floor(Math.random() * 8) + 4,
    height: Math.floor(Math.random() * 14) + 8,
    left: colOffset + Math.floor(Math.random() * 10) - 5,
    duration: 800 + i * 150 + Math.floor(Math.random() * 300),
    delay: i * 200 + Math.floor(Math.random() * 400),
    bottom: `${Math.floor(Math.random() * 80)}%`,
  }));
}

export function FireAnimation({ side, intensity }: FireAnimationProps) {
  const isLeft = side === "left";
  const columnCount = intensity === "high" ? 3 : 1;

  // Left: red/orange, Right: blue/cyan
  const colors = isLeft
    ? ["#ff2200", "#ff6600", "#ff9900"]
    : ["#0066ff", "#00aaff", "#00ccff"];

  const columns = Array.from({ length: columnCount }, (_, ci) => {
    const offset = ci * 18;
    const particles = generateParticles(6, offset, ci);
    return { id: `col-${ci}`, offset, particles };
  });

  const baseStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    bottom: 0,
    width: intensity === "high" ? "64px" : "22px",
    zIndex: 0,
    pointerEvents: "none",
    overflow: "hidden",
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
                opacity: 0.85,
                filter: `blur(${intensity === "high" ? 2 : 1}px)`,
                animation: `fireRise ${p.duration}ms ease-out ${p.delay}ms infinite`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
