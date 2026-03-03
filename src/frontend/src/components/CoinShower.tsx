import { useEffect } from "react";

interface CoinShowerProps {
  active: boolean;
  onComplete: () => void;
}

interface CoinConfig {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

function generateCoins(count: number): CoinConfig[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.floor(Math.random() * 90) + 5,
    delay: Math.floor(Math.random() * 1000),
    duration: 1500 + Math.floor(Math.random() * 800),
    size: 20 + Math.floor(Math.random() * 16),
  }));
}

const COINS = generateCoins(20);

export function CoinShower({ active, onComplete }: CoinShowerProps) {
  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(onComplete, 2600);
    return () => clearTimeout(timer);
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {COINS.map((coin) => (
        <div
          key={coin.id}
          style={{
            position: "absolute",
            top: "-60px",
            left: `${coin.left}%`,
            width: `${coin.size}px`,
            height: `${coin.size}px`,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 35% 35%, #ffe066, #ffd700, #b8860b)",
            border: "1.5px solid #ffec6e",
            boxShadow: "0 0 8px rgba(255, 215, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: `${coin.size * 0.45}px`,
            color: "#7a5c00",
            fontWeight: "bold",
            animation: `coinFall ${coin.duration}ms ease-in ${coin.delay}ms forwards`,
          }}
        >
          ₡
        </div>
      ))}
    </div>
  );
}
