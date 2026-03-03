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
      <div
        style={{
          width: "22px",
          height: "22px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 35% 35%, #ffe066, #ffd700, #b8860b)",
          border: "1.5px solid #ffec6e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "11px",
          color: "#7a5c00",
          fontWeight: "bold",
          flexShrink: 0,
        }}
      >
        ₡
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
