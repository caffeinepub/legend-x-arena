import { useEffect, useRef, useState } from "react";

/* ─── Types ────────────────────────────────────────────── */
interface FirstLoginModalProps {
  legendId: string;
  onClose: () => void;
}

/* ─── Constants ──────────────────────────────────────── */
const WHEEL_SEGMENTS = [
  {
    label: "5 RS",
    color: "#1a5aff",
    textColor: "#fff",
    degrees: 200,
    weight: 85,
  },
  {
    label: "10 RS",
    color: "#22cc44",
    textColor: "#fff",
    degrees: 100,
    weight: 14,
  },
  {
    label: "15 RS",
    color: "#ff8800",
    textColor: "#fff",
    degrees: 40,
    weight: 0.7,
  },
  {
    label: "20 RS",
    color: "#ff2200",
    textColor: "#fff",
    degrees: 20,
    weight: 0.3,
  },
];

const COIN_POSITIONS = [
  { id: "c1", top: "8%", left: "5%" },
  { id: "c2", top: "12%", left: "82%" },
  { id: "c3", top: "22%", left: "15%" },
  { id: "c4", top: "18%", left: "70%" },
  { id: "c5", top: "55%", left: "3%" },
  { id: "c6", top: "60%", left: "88%" },
  { id: "c7", top: "72%", left: "12%" },
  { id: "c8", top: "75%", left: "78%" },
  { id: "c9", top: "40%", left: "7%" },
  { id: "c10", top: "38%", left: "85%" },
];

const CONFETTI_COLORS = [
  "#ffd700",
  "#ff2200",
  "#0066ff",
  "#ffffff",
  "#ff8800",
  "#22cc44",
  "#cc44ff",
];
const CONFETTI_ITEMS = Array.from({ length: 32 }, (_, i) => ({
  id: `cf${i}`,
  index: i,
}));

/* ─── Weighted random picker ─────────────────────────── */
function pickWeightedSegment(): number {
  const totalWeight = WHEEL_SEGMENTS.reduce((s, seg) => s + seg.weight, 0);
  let rand = Math.random() * totalWeight;
  for (let i = 0; i < WHEEL_SEGMENTS.length; i++) {
    rand -= WHEEL_SEGMENTS[i].weight;
    if (rand <= 0) return i;
  }
  return 0;
}

/* ─── Compute segment stop angle ────────────────────── */
// Conic gradient starts at top (12 o'clock), but CSS conic-gradient starts at 3 o'clock (right)
// We need the pointer (fixed at top = 270deg in CSS conic) to land on segment center
// Pointer is at the top. CSS conic starts from right (3 o'clock). Top = 270deg offset from start.
// Segment starts accumulate from 0 (right side).
// The pointer is at angle 270deg on the static wheel.
// When wheel rotates by R degrees, the section that aligns with pointer = (270 - R) mod 360
// To land segment center at pointer: R = (270 - segCenter) + 1440*k
function getStopRotation(
  segmentIndex: number,
  currentRotation: number,
): number {
  let cumStart = 0;
  for (let i = 0; i < segmentIndex; i++) {
    cumStart += WHEEL_SEGMENTS[i].degrees;
  }
  const segCenter = cumStart + WHEEL_SEGMENTS[segmentIndex].degrees / 2;
  // Normalize: make sure we always add at least 4 full spins
  const baseAngle = (270 - segCenter + 360) % 360;
  const minSpins = 4;
  const minRotation = currentRotation + minSpins * 360;
  // Find the smallest target >= minRotation that lands on baseAngle
  const nearest = Math.ceil((minRotation - baseAngle) / 360) * 360 + baseAngle;
  return nearest < minRotation ? nearest + 360 : nearest;
}

/* ─── 3D Coin component ──────────────────────────────── */
function Coin({ style, delay }: { style: React.CSSProperties; delay: number }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        width: 36,
        height: 36,
        borderRadius: "50%",
        background:
          "radial-gradient(circle at 35% 30%, #fff7aa, #ffd700 40%, #b8860b 80%, #8b6914)",
        border: "2px solid #ffa500",
        boxShadow:
          "inset 0 2px 4px rgba(255,255,200,0.8), inset 0 -2px 4px rgba(0,0,0,0.4), 0 0 10px rgba(255,215,0,0.6)",
        animation: `coinSpin3D 1.8s linear ${delay}s infinite, coinFloat 2.5s ease-in-out ${delay * 0.3}s infinite`,
        ...style,
      }}
    >
      {/* Inner coin mark */}
      <div
        style={{
          position: "absolute",
          inset: 4,
          borderRadius: "50%",
          border: "1px solid rgba(255,200,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Mona Sans, sans-serif",
          fontWeight: 900,
          fontSize: 10,
          color: "#8b6914",
          textShadow: "0 1px 0 rgba(255,255,200,0.6)",
        }}
      >
        ₡
      </div>
    </div>
  );
}

/* ─── Confetti Particle ──────────────────────────────── */
function ConfettiParticle({ index }: { index: number }) {
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const angle = (index / 32) * 360;
  const dist = 60 + (index % 5) * 30;
  const size = 4 + (index % 4) * 2;
  const dx = Math.cos((angle * Math.PI) / 180) * dist;
  const dy = Math.sin((angle * Math.PI) / 180) * dist;

  return (
    <div
      aria-hidden="true"
      style={
        {
          position: "absolute",
          top: "50%",
          left: "50%",
          width: size,
          height: size,
          background: color,
          borderRadius: index % 3 === 0 ? "50%" : "2px",
          animation: `confettiBurst 1.6s ease-out ${(index * 0.04) % 0.8}s forwards`,
          "--dx": `${dx}px`,
          "--dy": `${dy}px`,
          "--dist": `${dist + 80}px`,
        } as React.CSSProperties
      }
    />
  );
}

/* ─── Roulette Wheel SVG ─────────────────────────────── */
function RouletteWheel({ rotation }: { rotation: number }) {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;

  // Build SVG path for each segment
  function polarToXY(angleDeg: number, radius: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  }

  const paths: React.ReactNode[] = [];
  const labels: React.ReactNode[] = [];
  let cumAngle = 0;

  for (let i = 0; i < WHEEL_SEGMENTS.length; i++) {
    const seg = WHEEL_SEGMENTS[i];
    const startAngle = cumAngle;
    const endAngle = cumAngle + seg.degrees;
    const midAngle = startAngle + seg.degrees / 2;
    const largeArc = seg.degrees > 180 ? 1 : 0;

    const start = polarToXY(startAngle, r);
    const end = polarToXY(endAngle, r);

    const pathD = [
      `M ${cx} ${cy}`,
      `L ${start.x} ${start.y}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`,
      "Z",
    ].join(" ");

    // Label position at 72% of radius
    const labelPos = polarToXY(midAngle, r * 0.68);

    paths.push(
      <path
        key={`seg-${i}`}
        d={pathD}
        fill={seg.color}
        stroke="#0a0a0f"
        strokeWidth="2"
      />,
    );

    labels.push(
      <text
        key={`lbl-${i}`}
        x={labelPos.x}
        y={labelPos.y}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={seg.textColor}
        fontFamily="Mona Sans, sans-serif"
        fontWeight="900"
        fontSize={seg.degrees > 80 ? "16" : "12"}
        style={{ userSelect: "none" }}
      >
        {seg.label}
      </text>,
    );

    cumAngle += seg.degrees;
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        transform: `rotate(${rotation}deg)`,
        transition:
          rotation > 0
            ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)"
            : "none",
        borderRadius: "50%",
        boxShadow: "0 0 30px rgba(255,215,0,0.4), 0 0 60px rgba(255,100,0,0.2)",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ borderRadius: "50%", overflow: "visible" }}
        aria-label="Roulette wheel"
        role="img"
      >
        {/* Outer ring */}
        <circle
          cx={cx}
          cy={cy}
          r={r + 4}
          fill="none"
          stroke="#ffd700"
          strokeWidth="4"
        />
        {paths}
        {labels}
        {/* Center hub */}
        <circle
          cx={cx}
          cy={cy}
          r={20}
          fill="#0a0a0f"
          stroke="#ffd700"
          strokeWidth="2"
        />
        <circle cx={cx} cy={cy} r={10} fill="#ffd700" />
        {/* Segment divider lines */}
        {(() => {
          const lines: React.ReactNode[] = [];
          let a = 0;
          for (let i = 0; i < WHEEL_SEGMENTS.length; i++) {
            const pt = polarToXY(a, r);
            lines.push(
              <line
                key={`line-${i}`}
                x1={cx}
                y1={cy}
                x2={pt.x}
                y2={pt.y}
                stroke="#0a0a0f"
                strokeWidth="2"
              />,
            );
            a += WHEEL_SEGMENTS[i].degrees;
          }
          return lines;
        })()}
      </svg>
    </div>
  );
}

/* ─── Main Modal ─────────────────────────────────────── */
export function FirstLoginModal({ legendId, onClose }: FirstLoginModalProps) {
  const [step, setStep] = useState<"congrats" | "roulette">("congrats");
  const [wheelRotation, setWheelRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [spinComplete, setSpinComplete] = useState(false);
  const [wonAmount, setWonAmount] = useState<string>("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentRotationRef = useRef(0);

  // Auto-advance from congrats after 3.5 seconds
  useEffect(() => {
    if (step === "congrats") {
      timerRef.current = setTimeout(() => {
        setStep("roulette");
      }, 3500);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [step]);

  function handleSpinNow() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStep("roulette");
  }

  function handleSpin() {
    if (spinning || spinComplete) return;
    setSpinning(true);

    const segIdx = pickWeightedSegment();
    const targetRotation = getStopRotation(segIdx, currentRotationRef.current);
    currentRotationRef.current = targetRotation;
    setWheelRotation(targetRotation);

    // After spin completes (4.2s = 4s animation + 0.2s buffer)
    timerRef.current = setTimeout(() => {
      setWonAmount(WHEEL_SEGMENTS[segIdx].label);
      setSpinComplete(true);
      setSpinning(false);
    }, 4200);
  }

  function handleCollect() {
    onClose();
  }

  return (
    <>
      {/* CSS Animations injected via style tag */}
      <style>{`
        @keyframes coinSpin3D {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        @keyframes coinFloat {
          0%, 100% { transform: rotateY(var(--spin-offset, 0deg)) translateY(0px); }
          50% { transform: rotateY(var(--spin-offset, 180deg)) translateY(-14px); }
        }
        @keyframes confettiBurst {
          0% { transform: translate(-50%, -50%) translate(0, 0) rotate(0deg); opacity: 1; }
          80% { opacity: 0.7; }
          100% {
            transform: translate(-50%, -50%) translate(var(--dx), calc(var(--dy) + 120px)) rotate(540deg);
            opacity: 0;
          }
        }
        @keyframes congratsEntrance {
          0% { opacity: 0; transform: scale(0.7) translateY(40px); }
          60% { opacity: 1; transform: scale(1.05) translateY(-5px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes goldGlow {
          0%, 100% { text-shadow: 0 0 20px #ffd700, 0 0 40px #ff9900, 0 0 60px #ffd700; }
          50% { text-shadow: 0 0 30px #fff0a0, 0 0 60px #ffd700, 0 0 90px #ff6600; }
        }
        @keyframes rouletteIn {
          0% { opacity: 0; transform: scale(0.8) translateY(30px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes wonBounce {
          0% { opacity: 0; transform: scale(0.4) translateY(-20px); }
          50% { transform: scale(1.15) translateY(0); }
          70% { transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes pointerBob {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-4px); }
        }
        @keyframes fireTextPulse {
          0%, 100% {
            background-position: 0% center;
            text-shadow: 0 0 20px rgba(255,100,0,0.6);
          }
          50% {
            background-position: 100% center;
            text-shadow: 0 0 40px rgba(255,200,0,0.9), 0 0 60px rgba(255,60,0,0.5);
          }
        }
      `}</style>

      {/* Backdrop */}
      <dialog
        open
        data-ocid="welcome.modal"
        aria-label="Welcome to Legend X Arena"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 100,
          background: "rgba(0,0,0,0.95)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          width: "100%",
          height: "100%",
          maxWidth: "100%",
          maxHeight: "100%",
          border: "none",
          padding: 0,
          margin: 0,
        }}
      >
        {/* ── STEP 1: CONGRATULATIONS ── */}
        {step === "congrats" && (
          <div
            style={{
              width: "100%",
              maxWidth: 480,
              padding: "32px 24px",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              animation:
                "congratsEntrance 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards",
            }}
          >
            {/* Floating 3D Coins */}
            {COIN_POSITIONS.map((pos, i) => (
              <Coin
                key={pos.id}
                delay={i * 0.18}
                style={{
                  top: pos.top,
                  left: pos.left,
                  transform: `scale(${0.6 + (i % 3) * 0.25})`,
                  zIndex: 1,
                }}
              />
            ))}

            {/* Confetti burst */}
            {CONFETTI_ITEMS.map((item) => (
              <ConfettiParticle key={item.id} index={item.index} />
            ))}

            {/* Top badge */}
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,34,0,0.2), rgba(255,153,0,0.2))",
                border: "1px solid rgba(255,153,0,0.4)",
                borderRadius: 100,
                padding: "6px 20px",
                fontSize: 11,
                fontFamily: "Mona Sans, sans-serif",
                fontWeight: 900,
                letterSpacing: "0.25em",
                color: "#ffa500",
                textTransform: "uppercase",
                zIndex: 10,
              }}
            >
              🏆 Legend X Arena
            </div>

            {/* Main CONGRATULATIONS heading */}
            <h1
              style={{
                fontFamily: "Mona Sans, sans-serif",
                fontWeight: 900,
                fontSize: "clamp(28px, 8vw, 48px)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                textAlign: "center",
                lineHeight: 1.1,
                margin: 0,
                zIndex: 10,
                background:
                  "linear-gradient(135deg, #fff0a0, #ffd700 30%, #ff9900 60%, #ff6600)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation:
                  "goldGlow 2.5s ease-in-out infinite, fireTextPulse 3s ease-in-out infinite",
              }}
            >
              Congratulations!
            </h1>

            {/* Welcome, legendId */}
            <div
              style={{
                fontFamily: "Mona Sans, sans-serif",
                fontWeight: 900,
                fontSize: "clamp(18px, 5vw, 28px)",
                color: "#fff",
                textAlign: "center",
                zIndex: 10,
                letterSpacing: "0.02em",
              }}
            >
              Welcome,{" "}
              <span
                style={{
                  color: "#ff4422",
                  textShadow: "0 0 16px rgba(255,68,34,0.7)",
                }}
              >
                {legendId}
              </span>
              !
            </div>

            {/* Subtext */}
            <p
              style={{
                fontFamily: "Outfit, sans-serif",
                fontSize: 14,
                color: "rgba(255,255,255,0.55)",
                textAlign: "center",
                zIndex: 10,
                letterSpacing: "0.04em",
                margin: 0,
              }}
            >
              You have entered the arena. Claim your welcome reward!
            </p>

            {/* Large coin showcase */}
            <div
              aria-hidden="true"
              style={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle at 35% 30%, #fff7aa, #ffd700 40%, #b8860b 80%, #6b4c08)",
                border: "4px solid #ffa500",
                boxShadow:
                  "inset 0 4px 8px rgba(255,255,200,0.9), inset 0 -4px 8px rgba(0,0,0,0.5), 0 0 30px rgba(255,215,0,0.8), 0 0 60px rgba(255,150,0,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
                animation: "coinSpin3D 2s linear infinite",
                perspective: 400,
              }}
            >
              <span
                style={{
                  fontFamily: "Mona Sans, sans-serif",
                  fontWeight: 900,
                  fontSize: 28,
                  color: "#8b6914",
                  textShadow: "0 2px 4px rgba(255,255,200,0.7)",
                }}
              >
                ₡
              </span>
            </div>

            {/* SPIN NOW button */}
            <button
              type="button"
              data-ocid="welcome.spin_now_button"
              onClick={handleSpinNow}
              style={{
                marginTop: 8,
                padding: "14px 36px",
                borderRadius: 100,
                border: "2px solid rgba(255,215,0,0.6)",
                background:
                  "linear-gradient(135deg, rgba(255,150,0,0.9), rgba(255,34,0,0.85))",
                color: "#fff",
                fontFamily: "Mona Sans, sans-serif",
                fontWeight: 900,
                fontSize: 16,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: "pointer",
                zIndex: 10,
                boxShadow:
                  "0 0 24px rgba(255,120,0,0.6), 0 4px 16px rgba(0,0,0,0.4)",
                transition: "transform 0.1s, box-shadow 0.1s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "scale(1.04)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "scale(1)";
              }}
            >
              SPIN NOW →
            </button>

            {/* Auto-timer hint */}
            <p
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.25)",
                fontFamily: "Outfit, sans-serif",
                zIndex: 10,
                margin: 0,
              }}
            >
              Spinning automatically in a moment…
            </p>
          </div>
        )}

        {/* ── STEP 2: ROULETTE ── */}
        {step === "roulette" && (
          <div
            style={{
              width: "100%",
              maxWidth: 400,
              padding: "24px 20px 32px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 18,
              animation: "rouletteIn 0.5s ease-out forwards",
            }}
          >
            {/* Header */}
            <div
              style={{
                textAlign: "center",
                zIndex: 10,
              }}
            >
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,34,0,0.2), rgba(255,153,0,0.2))",
                  border: "1px solid rgba(255,153,0,0.4)",
                  borderRadius: 100,
                  padding: "5px 18px",
                  fontSize: 10,
                  fontFamily: "Mona Sans, sans-serif",
                  fontWeight: 900,
                  letterSpacing: "0.25em",
                  color: "#ffa500",
                  textTransform: "uppercase",
                  display: "inline-block",
                  marginBottom: 10,
                }}
              >
                Welcome Gift
              </div>
              <h2
                style={{
                  fontFamily: "Mona Sans, sans-serif",
                  fontWeight: 900,
                  fontSize: "clamp(32px, 9vw, 52px)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  margin: 0,
                  lineHeight: 1,
                  background:
                    "linear-gradient(135deg, #fff0a0, #ffd700 40%, #ff9900)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "goldGlow 2.5s ease-in-out infinite",
                }}
              >
                FREE SPIN
              </h2>
              <p
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontSize: 13,
                  color: "rgba(255,255,255,0.45)",
                  margin: "6px 0 0",
                  letterSpacing: "0.02em",
                }}
              >
                Spin to claim your welcome reward!
              </p>
            </div>

            {/* Wheel + pointer container */}
            <div style={{ position: "relative", width: 280, height: 300 }}>
              {/* Pointer triangle (fixed, above the wheel) */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: -8,
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 20,
                  animation: spinning
                    ? "none"
                    : "pointerBob 1.2s ease-in-out infinite",
                }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 28 28"
                  aria-label="Pointer"
                  role="img"
                >
                  <polygon
                    points="14,28 1,4 27,4"
                    fill="#ffd700"
                    stroke="#0a0a0f"
                    strokeWidth="2"
                  />
                  <polygon points="14,24 4,7 24,7" fill="#ff9900" />
                </svg>
              </div>

              {/* The wheel */}
              <div style={{ marginTop: 20 }}>
                <RouletteWheel rotation={wheelRotation} />
              </div>

              {/* Won overlay */}
              {spinComplete && wonAmount && (
                <div
                  style={{
                    position: "absolute",
                    inset: 20,
                    borderRadius: "50%",
                    background: "rgba(0,0,0,0.88)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    animation:
                      "wonBounce 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards",
                    zIndex: 15,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "Mona Sans, sans-serif",
                      fontWeight: 900,
                      fontSize: 13,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "rgba(255,215,0,0.7)",
                      marginBottom: 4,
                    }}
                  >
                    YOU WON!
                  </div>
                  <div
                    style={{
                      fontFamily: "Mona Sans, sans-serif",
                      fontWeight: 900,
                      fontSize: 40,
                      color: "#ffd700",
                      textShadow:
                        "0 0 20px rgba(255,215,0,0.9), 0 0 40px rgba(255,150,0,0.5)",
                      lineHeight: 1,
                    }}
                  >
                    {wonAmount}
                  </div>
                  <div
                    style={{
                      fontFamily: "Outfit, sans-serif",
                      fontSize: 11,
                      color: "rgba(255,255,255,0.4)",
                      marginTop: 4,
                      textAlign: "center",
                      padding: "0 20px",
                    }}
                  >
                    Welcome bonus
                  </div>
                </div>
              )}
            </div>

            {/* SPIN button */}
            {!spinComplete && (
              <button
                type="button"
                data-ocid="welcome.spin_button"
                onClick={handleSpin}
                disabled={spinning}
                style={{
                  padding: "14px 48px",
                  borderRadius: 100,
                  border: spinning
                    ? "2px solid rgba(255,215,0,0.3)"
                    : "2px solid rgba(255,215,0,0.7)",
                  background: spinning
                    ? "rgba(255,153,0,0.2)"
                    : "linear-gradient(135deg, #ffd700, #ff9900 50%, #ff6600)",
                  color: spinning ? "rgba(255,215,0,0.5)" : "#0a0a0f",
                  fontFamily: "Mona Sans, sans-serif",
                  fontWeight: 900,
                  fontSize: 18,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  cursor: spinning ? "not-allowed" : "pointer",
                  boxShadow: spinning
                    ? "none"
                    : "0 0 24px rgba(255,180,0,0.5), 0 4px 16px rgba(0,0,0,0.4)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!spinning)
                    (e.currentTarget as HTMLButtonElement).style.transform =
                      "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform =
                    "scale(1)";
                }}
              >
                {spinning ? "SPINNING…" : "SPIN"}
              </button>
            )}

            {/* COLLECT REWARD button — appears after spin */}
            {spinComplete && (
              <button
                type="button"
                data-ocid="welcome.collect_button"
                onClick={handleCollect}
                style={{
                  padding: "14px 40px",
                  borderRadius: 100,
                  border: "2px solid rgba(255,215,0,0.7)",
                  background:
                    "linear-gradient(135deg, rgba(34,204,102,0.9), rgba(0,180,80,0.85))",
                  color: "#fff",
                  fontFamily: "Mona Sans, sans-serif",
                  fontWeight: 900,
                  fontSize: 16,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  animation:
                    "wonBounce 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards",
                  boxShadow:
                    "0 0 24px rgba(34,204,102,0.5), 0 4px 16px rgba(0,0,0,0.4)",
                  transition: "transform 0.1s, box-shadow 0.1s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform =
                    "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform =
                    "scale(1)";
                }}
              >
                🎉 COLLECT REWARD
              </button>
            )}

            {/* Segment legend */}
            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {WHEEL_SEGMENTS.map((seg) => (
                <div
                  key={seg.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontFamily: "Outfit, sans-serif",
                    fontSize: 12,
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: seg.color,
                    }}
                  />
                  {seg.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
