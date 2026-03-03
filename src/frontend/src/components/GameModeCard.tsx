import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

interface GameModeCardProps {
  mode: string;
  title: string;
  description: string;
  entryFee: number;
  accentColor: "red" | "blue" | "purple";
  icon: ReactNode;
  onJoin: () => void;
  isLoading?: boolean;
  playerCount?: string;
  joinButtonOcid?: string;
}

const accentStyles = {
  red: {
    border: "1px solid rgba(255, 34, 0, 0.5)",
    boxShadow:
      "0 4px 30px rgba(255, 34, 0, 0.15), 0 0 60px rgba(255, 34, 0, 0.05)",
    iconBg: "rgba(255, 34, 0, 0.15)",
    iconColor: "#ff4422",
    gradientFrom: "rgba(255, 34, 0, 0.08)",
    buttonStyle: {
      background: "linear-gradient(135deg, #ff2200, #ff6600)",
      color: "#fff",
    },
    hoverGlow: "0 0 30px rgba(255, 34, 0, 0.4)",
    feeBg: "rgba(255, 34, 0, 0.1)",
    feeColor: "#ff6644",
    feeBorder: "rgba(255, 34, 0, 0.3)",
  },
  blue: {
    border: "1px solid rgba(0, 102, 255, 0.5)",
    boxShadow:
      "0 4px 30px rgba(0, 102, 255, 0.15), 0 0 60px rgba(0, 102, 255, 0.05)",
    iconBg: "rgba(0, 102, 255, 0.15)",
    iconColor: "#2288ff",
    gradientFrom: "rgba(0, 102, 255, 0.08)",
    buttonStyle: {
      background: "linear-gradient(135deg, #0066ff, #00ccff)",
      color: "#fff",
    },
    hoverGlow: "0 0 30px rgba(0, 102, 255, 0.4)",
    feeBg: "rgba(0, 102, 255, 0.1)",
    feeColor: "#44aaff",
    feeBorder: "rgba(0, 102, 255, 0.3)",
  },
  purple: {
    border: "1px solid rgba(180, 0, 255, 0.4)",
    boxShadow:
      "0 4px 30px rgba(180, 0, 255, 0.1), 0 0 60px rgba(255, 215, 0, 0.05)",
    iconBg: "rgba(180, 0, 255, 0.15)",
    iconColor: "#cc44ff",
    gradientFrom: "rgba(180, 0, 255, 0.08)",
    buttonStyle: {
      background: "linear-gradient(135deg, #9900cc, #ffd700)",
      color: "#fff",
    },
    hoverGlow: "0 0 30px rgba(255, 215, 0, 0.3)",
    feeBg: "rgba(255, 215, 0, 0.1)",
    feeColor: "#ffd700",
    feeBorder: "rgba(255, 215, 0, 0.3)",
  },
};

export function GameModeCard({
  mode,
  title,
  description,
  entryFee,
  accentColor,
  icon,
  onJoin,
  isLoading = false,
  playerCount,
  joinButtonOcid,
}: GameModeCardProps) {
  const style = accentStyles[accentColor];

  return (
    <div
      className="relative rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02]"
      style={{
        background: `linear-gradient(135deg, ${style.gradientFrom}, rgba(13, 13, 26, 0.9))`,
        border: style.border,
        boxShadow: style.boxShadow,
        backdropFilter: "blur(10px)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = style.hoverGlow;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = style.boxShadow;
      }}
    >
      {/* Top accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background:
            accentColor === "red"
              ? "linear-gradient(90deg, transparent, #ff2200, #ff6600, transparent)"
              : accentColor === "blue"
                ? "linear-gradient(90deg, transparent, #0066ff, #00ccff, transparent)"
                : "linear-gradient(90deg, transparent, #9900cc, #ffd700, transparent)",
        }}
      />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-12 h-12 rounded-lg"
              style={{
                background: style.iconBg,
                color: style.iconColor,
              }}
            >
              {icon}
            </div>
            <div>
              <div className="text-xs font-body uppercase tracking-widest text-muted-foreground mb-0.5">
                {mode}
              </div>
              <h3 className="font-display font-bold text-lg text-foreground">
                {title}
              </h3>
            </div>
          </div>
          {playerCount && (
            <div
              className="text-xs font-body px-2 py-1 rounded"
              style={{
                background: style.iconBg,
                color: style.iconColor,
                border: `1px solid ${style.feeBorder}`,
              }}
            >
              {playerCount}
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm font-body text-muted-foreground mb-5 leading-relaxed">
          {description}
        </p>

        {/* Entry fee + button */}
        <div className="flex items-center justify-between gap-3">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{
              background: style.feeBg,
              border: `1px solid ${style.feeBorder}`,
            }}
          >
            <span
              style={{
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle at 35% 35%, #ffe066, #ffd700, #b8860b)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "9px",
                color: "#7a5c00",
                fontWeight: "bold",
                flexShrink: 0,
              }}
            >
              ₡
            </span>
            <span
              className="font-display font-bold text-sm tabular-nums"
              style={{ color: style.feeColor }}
            >
              {entryFee}
            </span>
          </div>

          <Button
            onClick={onJoin}
            disabled={isLoading}
            data-ocid={joinButtonOcid}
            className="font-display font-bold text-sm tracking-wider px-5 py-2 rounded-lg uppercase transition-all duration-200 hover:opacity-90 hover:scale-[1.03]"
            style={style.buttonStyle}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "JOIN BATTLE"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
