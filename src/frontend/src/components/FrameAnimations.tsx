/**
 * FrameAnimations.tsx
 *
 * 5 premium animated SVG frames -- each is a circular ring that wraps
 * tightly around a profile picture.  All animations are pure CSS/SVG,
 * run in an infinite loop, and have zero glitch because they only use
 * CSS keyframe transforms / opacity / stroke-dashoffset changes that
 * are GPU-composited.
 *
 * Usage:
 *   <FrameAnimationFire size={80} isPreview={false} />
 *
 * size      = diameter of the INNER circle (same as the profile img size)
 * isPreview = true in the shop card (slightly dimmed when not owned)
 */

import React from "react";

interface FrameProps {
  size?: number; // inner circle diameter (profile img size)
  isPreview?: boolean; // dim when used as locked preview
  isActive?: boolean; // extra highlight for active equipped frame
}

/* ──────────────────────────────────────────────────────────────── */
/*  Shared helpers                                                  */
/* ──────────────────────────────────────────────────────────────── */

/** Full outer size (frame extends beyond the circle by `bleed` px on each side) */
function outerSize(size: number, bleed: number) {
  return size + bleed * 2;
}

/** Center of the SVG canvas */
function cx(size: number, bleed: number) {
  return size / 2 + bleed;
}

/** Radius of the decorative ring (midpoint between inner circle edge and canvas edge) */
function ringR(size: number, bleed: number) {
  return size / 2 + bleed / 2;
}

/* ──────────────────────────────────────────────────────────────── */
/*  1. TREE  -- Falling leaves around a verdant green ring          */
/* ──────────────────────────────────────────────────────────────── */
export function FrameAnimationTree({
  size = 80,
  isPreview = false,
  isActive = false,
}: FrameProps) {
  const bleed = Math.round(size * 0.38);
  const total = outerSize(size, bleed);
  const C = cx(size, bleed);
  const R = ringR(size, bleed);
  const opacity = isPreview ? 0.55 : 1;

  // Generate leaf positions evenly around the ring
  const leafCount = 12;
  const leaves = Array.from({ length: leafCount }, (_, i) => {
    const angle = (i / leafCount) * 360;
    const rad = (angle * Math.PI) / 180;
    const x = C + R * Math.cos(rad);
    const y = C + R * Math.sin(rad);
    const delay = (i / leafCount) * 3.6;
    return { x, y, angle, delay, key: i };
  });

  return (
    <svg
      width={total}
      height={total}
      viewBox={`0 0 ${total} ${total}`}
      style={{
        position: "absolute",
        inset: -bleed,
        pointerEvents: "none",
        overflow: "visible",
        opacity,
      }}
      aria-hidden="true"
    >
      <defs>
        {/* Animated gradient ring */}
        <linearGradient id="treeRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22cc44">
            <animate
              attributeName="stopColor"
              values="#22cc44;#88ff44;#44ee66;#22cc44"
              dur="4s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="50%" stopColor="#88ff44">
            <animate
              attributeName="stopColor"
              values="#88ff44;#44ee66;#22cc44;#88ff44"
              dur="4s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="100%" stopColor="#44ee66">
            <animate
              attributeName="stopColor"
              values="#44ee66;#22cc44;#88ff44;#44ee66"
              dur="4s"
              repeatCount="indefinite"
            />
          </stop>
        </linearGradient>
        {/* Glow filter */}
        <filter id="treeGlow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Main ring */}
      <circle
        cx={C}
        cy={C}
        r={R}
        fill="none"
        stroke="url(#treeRingGrad)"
        strokeWidth={Math.max(3, size * 0.045)}
        filter="url(#treeGlow)"
        opacity={isActive ? 1 : 0.85}
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`0 ${C} ${C}`}
          to={`360 ${C} ${C}`}
          dur="12s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Decorative dots (buds) on ring */}
      {leaves.map(({ x, y, delay, key }) => (
        <g key={key}>
          {/* Branch dot */}
          <circle
            cx={x}
            cy={y}
            r={Math.max(2.5, size * 0.033)}
            fill="#22cc44"
            opacity={0.8}
          >
            <animate
              attributeName="opacity"
              values="0.5;1;0.5"
              dur="3.6s"
              begin={`${delay}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="r"
              values={`${Math.max(2, size * 0.025)};${Math.max(3.5, size * 0.045)};${Math.max(2, size * 0.025)}`}
              dur="3.6s"
              begin={`${delay}s`}
              repeatCount="indefinite"
            />
          </circle>
          {/* Falling leaf -- small ellipse that moves down */}
          <ellipse
            cx={x}
            cy={y}
            rx={Math.max(3, size * 0.04)}
            ry={Math.max(1.5, size * 0.02)}
            fill="#44ee66"
            opacity={0}
            transform={`rotate(${key * 30} ${x} ${y})`}
          >
            <animate
              attributeName="opacity"
              values="0;0.9;0"
              dur="3.6s"
              begin={`${delay}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="cy"
              values={`${y};${y + size * 0.18};${y + size * 0.35}`}
              dur="3.6s"
              begin={`${delay}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="cx"
              values={`${x};${x + (key % 2 === 0 ? -size * 0.06 : size * 0.06)};${x + (key % 2 === 0 ? size * 0.08 : -size * 0.08)}`}
              dur="3.6s"
              begin={`${delay}s`}
              repeatCount="indefinite"
            />
          </ellipse>
        </g>
      ))}

      {/* Outer glow ring (faint) */}
      <circle
        cx={C}
        cy={C}
        r={R + Math.max(4, bleed * 0.35)}
        fill="none"
        stroke="#22cc44"
        strokeWidth={1}
        opacity={0.25}
      >
        <animate
          attributeName="opacity"
          values="0.15;0.4;0.15"
          dur="3s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────── */
/*  2. FIRE  -- Flame particles orbiting the ring                   */
/* ──────────────────────────────────────────────────────────────── */
export function FrameAnimationFire({
  size = 80,
  isPreview = false,
  isActive = false,
}: FrameProps) {
  const bleed = Math.round(size * 0.4);
  const total = outerSize(size, bleed);
  const C = cx(size, bleed);
  const R = ringR(size, bleed);
  const opacity = isPreview ? 0.55 : isActive ? 1 : 0.92;

  const flameCount = 10;
  const flames = Array.from({ length: flameCount }, (_, i) => {
    const angle = (i / flameCount) * 360;
    const rad = (angle * Math.PI) / 180;
    const x = C + R * Math.cos(rad);
    const y = C + R * Math.sin(rad);
    const delay = (i / flameCount) * 2.8;
    return { x, y, angle, delay, key: i };
  });

  return (
    <svg
      width={total}
      height={total}
      viewBox={`0 0 ${total} ${total}`}
      style={{
        position: "absolute",
        inset: -bleed,
        pointerEvents: "none",
        overflow: "visible",
        opacity,
      }}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="fireRingGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd700" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#ff6600" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ff2200" stopOpacity="0.6" />
        </radialGradient>
        <filter id="fireGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        {/* Stroke gradient */}
        <linearGradient id="fireStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff2200">
            <animate
              attributeName="stopColor"
              values="#ff2200;#ffd700;#ff6600;#ff2200"
              dur="2s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="100%" stopColor="#ffd700">
            <animate
              attributeName="stopColor"
              values="#ffd700;#ff2200;#ffd700"
              dur="2s"
              repeatCount="indefinite"
            />
          </stop>
        </linearGradient>
      </defs>

      {/* Spinning fire ring */}
      <circle
        cx={C}
        cy={C}
        r={R}
        fill="none"
        stroke="url(#fireStrokeGrad)"
        strokeWidth={Math.max(3.5, size * 0.05)}
        strokeDasharray={`${R * 0.3} ${R * 0.12}`}
        filter="url(#fireGlow)"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`0 ${C} ${C}`}
          to={`360 ${C} ${C}`}
          dur="3s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.7;1;0.7"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Flame particles */}
      {flames.map(({ x, y, delay, key }) => {
        const direction = key % 2 === 0 ? 1 : -1;
        const riseH = size * 0.22;
        return (
          <g key={key}>
            {/* Flame teardrop */}
            <ellipse
              cx={x}
              cy={y}
              rx={Math.max(2.5, size * 0.034)}
              ry={Math.max(4, size * 0.055)}
              fill={
                key % 3 === 0
                  ? "#ffd700"
                  : key % 3 === 1
                    ? "#ff6600"
                    : "#ff2200"
              }
              filter="url(#fireGlow)"
              opacity={0}
            >
              <animate
                attributeName="opacity"
                values="0;1;0.8;0"
                dur="2.8s"
                begin={`${delay}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="cy"
                values={`${y};${y - riseH * 0.5};${y - riseH}`}
                dur="2.8s"
                begin={`${delay}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="cx"
                values={`${x};${x + direction * size * 0.05};${x + direction * size * 0.08}`}
                dur="2.8s"
                begin={`${delay}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="ry"
                values={`${Math.max(4, size * 0.055)};${Math.max(6, size * 0.08)};${Math.max(2, size * 0.03)}`}
                dur="2.8s"
                begin={`${delay}s`}
                repeatCount="indefinite"
              />
            </ellipse>
            {/* Ember spark */}
            <circle
              cx={x}
              cy={y}
              r={Math.max(1.5, size * 0.02)}
              fill="#fff8aa"
              opacity={0}
            >
              <animate
                attributeName="opacity"
                values="0;0.9;0"
                dur="2.8s"
                begin={`${delay + 0.3}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="cy"
                values={`${y};${y - riseH * 1.4}`}
                dur="2.8s"
                begin={`${delay + 0.3}s`}
                repeatCount="indefinite"
              />
            </circle>
          </g>
        );
      })}

      {/* Outer halo */}
      <circle
        cx={C}
        cy={C}
        r={R + Math.max(5, bleed * 0.4)}
        fill="none"
        stroke="#ff2200"
        strokeWidth={1}
        opacity={0.2}
      >
        <animate
          attributeName="opacity"
          values="0.1;0.35;0.1"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="r"
          values={`${R + bleed * 0.3};${R + bleed * 0.5};${R + bleed * 0.3}`}
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────── */
/*  3. WATER -- Ripple waves orbiting the ring                      */
/* ──────────────────────────────────────────────────────────────── */
export function FrameAnimationWater({
  size = 80,
  isPreview = false,
  isActive = false,
}: FrameProps) {
  const bleed = Math.round(size * 0.38);
  const total = outerSize(size, bleed);
  const C = cx(size, bleed);
  const R = ringR(size, bleed);
  const opacity = isPreview ? 0.55 : isActive ? 1 : 0.92;

  const dropCount = 10;
  const drops = Array.from({ length: dropCount }, (_, i) => {
    const angle = (i / dropCount) * 360;
    const rad = (angle * Math.PI) / 180;
    const x = C + R * Math.cos(rad);
    const y = C + R * Math.sin(rad);
    const delay = (i / dropCount) * 3.5;
    return { x, y, delay, key: i };
  });

  return (
    <svg
      width={total}
      height={total}
      viewBox={`0 0 ${total} ${total}`}
      style={{
        position: "absolute",
        inset: -bleed,
        pointerEvents: "none",
        overflow: "visible",
        opacity,
      }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="waterRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00ccff">
            <animate
              attributeName="stopColor"
              values="#00ccff;#0099ff;#00eeff;#00ccff"
              dur="4s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="100%" stopColor="#0066cc">
            <animate
              attributeName="stopColor"
              values="#0066cc;#00ccff;#0044aa;#0066cc"
              dur="4s"
              repeatCount="indefinite"
            />
          </stop>
        </linearGradient>
        <filter id="waterGlow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Rotating water ring -- counter-clockwise ripple */}
      <circle
        cx={C}
        cy={C}
        r={R}
        fill="none"
        stroke="url(#waterRingGrad)"
        strokeWidth={Math.max(3, size * 0.042)}
        strokeDasharray={`${R * 0.4} ${R * 0.08}`}
        filter="url(#waterGlow)"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`360 ${C} ${C}`}
          to={`0 ${C} ${C}`}
          dur="6s"
          repeatCount="indefinite"
        />
      </circle>
      {/* Second ring -- slower, thinner, opposite direction */}
      <circle
        cx={C}
        cy={C}
        r={R - Math.max(3, size * 0.04)}
        fill="none"
        stroke="#00eeff"
        strokeWidth={Math.max(1.5, size * 0.02)}
        strokeDasharray={`${R * 0.18} ${R * 0.22}`}
        opacity={0.5}
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`0 ${C} ${C}`}
          to={`360 ${C} ${C}`}
          dur="9s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.3;0.65;0.3"
          dur="3s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Water drop ripples */}
      {drops.map(({ x, y, delay, key }) => (
        <g key={key}>
          {/* Drop teardrop shape */}
          <ellipse
            cx={x}
            cy={y}
            rx={Math.max(2, size * 0.028)}
            ry={Math.max(3, size * 0.042)}
            fill="#00aaff"
            opacity={0}
          >
            <animate
              attributeName="opacity"
              values="0;0.9;0"
              dur="3.5s"
              begin={`${delay}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="ry"
              values={`${Math.max(3, size * 0.042)};${Math.max(5, size * 0.06)};${Math.max(2, size * 0.028)}`}
              dur="3.5s"
              begin={`${delay}s`}
              repeatCount="indefinite"
            />
          </ellipse>
          {/* Ripple ring expanding outward */}
          <circle
            cx={x}
            cy={y}
            r={Math.max(3, size * 0.04)}
            fill="none"
            stroke="#00ccff"
            strokeWidth={1.2}
            opacity={0}
          >
            <animate
              attributeName="opacity"
              values="0;0.8;0"
              dur="3.5s"
              begin={`${delay + 0.3}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="r"
              values={`${Math.max(3, size * 0.04)};${Math.max(7, size * 0.1)}`}
              dur="3.5s"
              begin={`${delay + 0.3}s`}
              repeatCount="indefinite"
            />
          </circle>
        </g>
      ))}
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────── */
/*  4. WIND  -- Swoosh arcs swirling around the ring                */
/* ──────────────────────────────────────────────────────────────── */
export function FrameAnimationWind({
  size = 80,
  isPreview = false,
  isActive = false,
}: FrameProps) {
  const bleed = Math.round(size * 0.38);
  const total = outerSize(size, bleed);
  const C = cx(size, bleed);
  const R = ringR(size, bleed);
  const opacity = isPreview ? 0.55 : isActive ? 1 : 0.92;

  const streamCount = 6;
  const streams = Array.from({ length: streamCount }, (_, i) => {
    const startAngle = (i / streamCount) * 360;
    const startRad = (startAngle * Math.PI) / 180;
    const endAngle = startAngle + 60;
    const endRad = (endAngle * Math.PI) / 180;
    const mx = C + R * 1.18 * Math.cos(((startAngle + 30) * Math.PI) / 180);
    const my = C + R * 1.18 * Math.sin(((startAngle + 30) * Math.PI) / 180);
    const sx = C + R * Math.cos(startRad);
    const sy = C + R * Math.sin(startRad);
    const ex = C + R * Math.cos(endRad);
    const ey = C + R * Math.sin(endRad);
    const delay = (i / streamCount) * 2.4;
    return { sx, sy, mx, my, ex, ey, delay, key: i };
  });

  return (
    <svg
      width={total}
      height={total}
      viewBox={`0 0 ${total} ${total}`}
      style={{
        position: "absolute",
        inset: -bleed,
        pointerEvents: "none",
        overflow: "visible",
        opacity,
      }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="windRingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#aaeeff">
            <animate
              attributeName="stopColor"
              values="#aaeeff;#ffffff;#88ccff;#aaeeff"
              dur="3s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="100%" stopColor="#66bbff">
            <animate
              attributeName="stopColor"
              values="#66bbff;#aaeeff;#ffffff;#66bbff"
              dur="3s"
              repeatCount="indefinite"
            />
          </stop>
        </linearGradient>
        <filter id="windGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Base ring -- fast spin */}
      <circle
        cx={C}
        cy={C}
        r={R}
        fill="none"
        stroke="url(#windRingGrad)"
        strokeWidth={Math.max(2.5, size * 0.035)}
        strokeDasharray={`${R * 0.5} ${R * 0.1}`}
        filter="url(#windGlow)"
        opacity={0.9}
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`0 ${C} ${C}`}
          to={`360 ${C} ${C}`}
          dur="2.5s"
          repeatCount="indefinite"
        />
      </circle>
      {/* Opposite thin ring */}
      <circle
        cx={C}
        cy={C}
        r={R + Math.max(3, bleed * 0.22)}
        fill="none"
        stroke="#cceeFF"
        strokeWidth={Math.max(1, size * 0.015)}
        strokeDasharray={`${R * 0.25} ${R * 0.15}`}
        opacity={0.45}
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`360 ${C} ${C}`}
          to={`0 ${C} ${C}`}
          dur="3.5s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.25;0.6;0.25"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Swoosh arc streams */}
      {streams.map(({ sx, sy, mx, my, ex, ey, delay, key }) => (
        <path
          key={key}
          d={`M ${sx} ${sy} Q ${mx} ${my} ${ex} ${ey}`}
          fill="none"
          stroke="#e0f8ff"
          strokeWidth={Math.max(2, size * 0.026)}
          strokeLinecap="round"
          filter="url(#windGlow)"
          opacity={0}
        >
          <animate
            attributeName="opacity"
            values="0;0.85;0.85;0"
            keyTimes="0;0.15;0.7;1"
            dur="2.4s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="strokeDasharray"
            values={`0 ${R * 2};${R * 0.8} ${R * 1.2};${R * 1.8} 0`}
            dur="2.4s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
        </path>
      ))}
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────── */
/*  5. STONE  -- Rotating stone/rock segments with grinding motion  */
/* ──────────────────────────────────────────────────────────────── */
export function FrameAnimationStone({
  size = 80,
  isPreview = false,
  isActive = false,
}: FrameProps) {
  const bleed = Math.round(size * 0.4);
  const total = outerSize(size, bleed);
  const C = cx(size, bleed);
  const R = ringR(size, bleed);
  const opacity = isPreview ? 0.55 : isActive ? 1 : 0.92;

  const segmentCount = 8;
  const arcSpan = (2 * Math.PI) / segmentCount;
  const gap = arcSpan * 0.18; // gap between segments
  const sw = Math.max(4, size * 0.06); // stroke width

  const segments = Array.from({ length: segmentCount }, (_, i) => {
    const startAngle = i * arcSpan;
    const endAngle = startAngle + arcSpan - gap;
    const sx = C + R * Math.cos(startAngle - Math.PI / 2);
    const sy = C + R * Math.sin(startAngle - Math.PI / 2);
    const ex = C + R * Math.cos(endAngle - Math.PI / 2);
    const ey = C + R * Math.sin(endAngle - Math.PI / 2);
    const largeArc = arcSpan - gap > Math.PI ? 1 : 0;
    const d = `M ${sx} ${sy} A ${R} ${R} 0 ${largeArc} 1 ${ex} ${ey}`;
    // Alternate granite colors
    const colors = [
      "#888899",
      "#aaaaaa",
      "#99998a",
      "#777788",
      "#aaa9a0",
      "#8a8a9a",
      "#9a9988",
      "#7a7a8a",
    ];
    const color = colors[i % colors.length];
    return { d, color, key: i };
  });

  return (
    <svg
      width={total}
      height={total}
      viewBox={`0 0 ${total} ${total}`}
      style={{
        position: "absolute",
        inset: -bleed,
        pointerEvents: "none",
        overflow: "visible",
        opacity,
      }}
      aria-hidden="true"
    >
      <defs>
        <filter id="stoneGlow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="stoneDeep">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer glow circle -- slow rumble */}
      <circle
        cx={C}
        cy={C}
        r={R + Math.max(3, bleed * 0.28)}
        fill="none"
        stroke="#555566"
        strokeWidth={Math.max(2, size * 0.028)}
        filter="url(#stoneDeep)"
        opacity={0.35}
      >
        <animate
          attributeName="opacity"
          values="0.2;0.45;0.2"
          dur="2.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`360 ${C} ${C}`}
          to={`0 ${C} ${C}`}
          dur="20s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Spinning stone segments */}
      <g filter="url(#stoneGlow)">
        {segments.map(({ d, color, key }) => (
          <path
            key={key}
            d={d}
            fill="none"
            stroke={color}
            strokeWidth={sw}
            strokeLinecap="round"
          >
            {/* Each segment brightens slightly in sequence */}
            <animate
              attributeName="stroke"
              values={`${color};#cccccc;${color}`}
              dur="4s"
              begin={`${(key / segmentCount) * 4}s`}
              repeatCount="indefinite"
            />
          </path>
        ))}
        {/* Rotate all stone segments */}
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`0 ${C} ${C}`}
          to={`360 ${C} ${C}`}
          dur="8s"
          repeatCount="indefinite"
          additive="sum"
        />
      </g>

      {/* Small rock chips flying off -- small circles at random positions */}
      {([0, 1, 2, 3, 4, 5] as const).map((i) => {
        const angle = (i / 6) * Math.PI * 2;
        const cx2 = C + R * Math.cos(angle);
        const cy2 = C + R * Math.sin(angle);
        const delay = (i / 6) * 8;
        const outX = C + (R + bleed * 0.6) * Math.cos(angle);
        const outY = C + (R + bleed * 0.6) * Math.sin(angle);
        return (
          <circle
            key={i}
            cx={cx2}
            cy={cy2}
            r={Math.max(1.5, size * 0.02)}
            fill="#aaaaaa"
            opacity={0}
          >
            <animate
              attributeName="opacity"
              values="0;0.8;0"
              dur="8s"
              begin={`${delay}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="cx"
              values={`${cx2};${outX}`}
              dur="8s"
              begin={`${delay}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="cy"
              values={`${cy2};${outY}`}
              dur="8s"
              begin={`${delay}s`}
              repeatCount="indefinite"
            />
          </circle>
        );
      })}
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────── */
/*  Frame lookup by index                                           */
/* ──────────────────────────────────────────────────────────────── */

export const ANIMATED_FRAMES = [
  {
    index: 20,
    name: "Forest Spirit",
    label: "TREE",
    price: 200,
    color: "#22cc44",
    Component: FrameAnimationTree,
    description: "Leaves fall around your profile",
  },
  {
    index: 21,
    name: "Inferno Ring",
    label: "FIRE",
    price: 200,
    color: "#ff6600",
    Component: FrameAnimationFire,
    description: "Flames orbit the circle",
  },
  {
    index: 22,
    name: "Tidal Halo",
    label: "WATER",
    price: 200,
    color: "#00ccff",
    Component: FrameAnimationWater,
    description: "Water ripples spin around",
  },
  {
    index: 23,
    name: "Storm Wreath",
    label: "WIND",
    price: 200,
    color: "#aaeeff",
    Component: FrameAnimationWind,
    description: "Wind swooshes in a gust",
  },
  {
    index: 24,
    name: "Granite Grind",
    label: "STONE",
    price: 200,
    color: "#999999",
    Component: FrameAnimationStone,
    description: "Stone ring grinds in orbit",
  },
] as const;

/** Get a frame definition by its index */
export function getAnimatedFrame(index: number) {
  return ANIMATED_FRAMES.find((f) => f.index === index) ?? null;
}

/** Render the animated frame overlay at the given size */
export function AnimatedFrameOverlay({
  frameIndex,
  size = 80,
  isActive = false,
}: {
  frameIndex: number;
  size?: number;
  isActive?: boolean;
}) {
  const frame = getAnimatedFrame(frameIndex);
  if (!frame) return null;
  const { Component } = frame;
  return <Component size={size} isPreview={false} isActive={isActive} />;
}
