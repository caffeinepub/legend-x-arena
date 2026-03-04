import { useEffect, useRef, useState } from "react";

interface WalletDisplayProps {
  balance: bigint;
}

export function WalletDisplay({ balance }: WalletDisplayProps) {
  const [flash, setFlash] = useState(false);
  const prevBalance = useRef(balance);

  useEffect(() => {
    if (prevBalance.current !== balance) {
      setFlash(true);
      const timer = setTimeout(() => setFlash(false), 600);
      prevBalance.current = balance;
      return () => clearTimeout(timer);
    }
  }, [balance]);

  return (
    <div
      data-ocid="dashboard.wallet_display"
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
      style={{
        background: "rgba(255, 215, 0, 0.08)",
        border: "1px solid rgba(255, 215, 0, 0.3)",
        transition: "box-shadow 0.3s ease",
        boxShadow: flash
          ? "0 0 20px rgba(255, 215, 0, 0.6), 0 0 40px rgba(255, 215, 0, 0.3)"
          : "0 0 8px rgba(255, 215, 0, 0.2)",
      }}
    >
      {/* L-coin -- static position, shining glow only */}
      <div
        style={{
          width: "26px",
          height: "26px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 35% 30%, #fff7aa, #ffd700 40%, #b8860b 80%, #8b6914)",
          border: "2px solid #ffa500",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "13px",
          fontFamily: "Mona Sans, sans-serif",
          fontWeight: 900,
          color: "#3d2200",
          flexShrink: 0,
          animation: "coinLGlow 2s ease-in-out infinite",
          textShadow:
            "0 1px 2px rgba(255,255,180,0.8), 0 0 4px rgba(255,200,0,0.6)",
          letterSpacing: "-0.5px",
        }}
      >
        L
      </div>
      <span
        className="font-display font-bold tabular-nums"
        style={{
          color: "#ffd700",
          fontSize: "15px",
          transition: "color 0.3s ease",
        }}
      >
        {Number(balance).toLocaleString()}
      </span>
    </div>
  );
}
