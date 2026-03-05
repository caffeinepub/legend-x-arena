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
/*  1. TREE -- Vine tendrils with swaying leaves around the ring   */
/* ──────────────────────────────────────────────────────────────── */
export function FrameAnimationTree({
  size = 80,
  isPreview = false,
  isActive = false,
}: FrameProps) {
  const bleed = Math.round(size * 0.18);
  const total = outerSize(size, bleed);
  const C = cx(size, bleed);
  const R = ringR(size, bleed);
  const opacity = isPreview ? 0.55 : 1;
  const sw = Math.max(2.5, size * 0.036);

  // 6 vine segments evenly distributed
  const vineCount = 6;
  const vines = Array.from({ length: vineCount }, (_, i) => {
    const baseAngle = (i / vineCount) * 2 * Math.PI - Math.PI / 2;
    const spanRad = Math.PI * 0.28; // how long each vine arc is
    const startAngle = baseAngle - spanRad / 2;
    const endAngle = baseAngle + spanRad / 2;
    const midAngle = baseAngle;

    // Arc points on ring
    const sx = C + R * Math.cos(startAngle);
    const sy = C + R * Math.sin(startAngle);
    const ex = C + R * Math.cos(endAngle);
    const ey = C + R * Math.sin(endAngle);
    // Bezier control point slightly outside ring
    const mx = C + (R + bleed * 0.55) * Math.cos(midAngle);
    const my = C + (R + bleed * 0.55) * Math.sin(midAngle);

    // Leaf at end of vine
    const leafX = C + (R + bleed * 0.18) * Math.cos(endAngle + 0.15);
    const leafY = C + (R + bleed * 0.18) * Math.sin(endAngle + 0.15);
    const leafAngleDeg = (endAngle * 180) / Math.PI + 90;

    const delay = (i / vineCount) * 3.0;
    return {
      sx,
      sy,
      mx,
      my,
      ex,
      ey,
      leafX,
      leafY,
      leafAngleDeg,
      delay,
      key: i,
    };
  });

  const uid = `tree_${size}`;

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
        <filter id={`${uid}_glow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Slow-rotating base ring -- vine base */}
      <circle
        cx={C}
        cy={C}
        r={R}
        fill="none"
        stroke="#1a6b0a"
        strokeWidth={sw * 0.65}
        strokeDasharray={`${R * 0.22} ${R * 0.08}`}
        opacity={isActive ? 0.85 : 0.65}
        filter={`url(#${uid}_glow)`}
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`0 ${C} ${C}`}
          to={`360 ${C} ${C}`}
          dur="20s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Vine tendrils */}
      {vines.map(
        ({
          sx,
          sy,
          mx,
          my,
          ex,
          ey,
          leafX,
          leafY,
          leafAngleDeg,
          delay,
          key,
        }) => (
          <g key={key}>
            {/* Vine arc path */}
            <path
              d={`M ${sx} ${sy} Q ${mx} ${my} ${ex} ${ey}`}
              fill="none"
              stroke="#44dd22"
              strokeWidth={sw * 0.85}
              strokeLinecap="round"
              filter={`url(#${uid}_glow)`}
              opacity={0}
            >
              <animate
                attributeName="opacity"
                values="0;0.9;0.9;0"
                keyTimes="0;0.2;0.75;1"
                dur="3s"
                begin={`${delay}s`}
                repeatCount="indefinite"
              />
            </path>

            {/* Leaf at tip -- sways gently */}
            <ellipse
              cx={leafX}
              cy={leafY}
              rx={Math.max(3.5, size * 0.048)}
              ry={Math.max(2, size * 0.026)}
              fill="#88ff44"
              transform={`rotate(${leafAngleDeg} ${leafX} ${leafY})`}
              opacity={0}
              filter={`url(#${uid}_glow)`}
            >
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                keyTimes="0;0.25;0.7;1"
                dur="3s"
                begin={`${delay + 0.2}s`}
                repeatCount="indefinite"
              />
              {/* Gentle sway rotation */}
              <animateTransform
                attributeName="transform"
                type="rotate"
                values={`${leafAngleDeg - 18} ${leafX} ${leafY};${leafAngleDeg + 18} ${leafX} ${leafY};${leafAngleDeg - 18} ${leafX} ${leafY}`}
                dur="2.4s"
                begin={`${delay}s`}
                repeatCount="indefinite"
                additive="replace"
              />
            </ellipse>

            {/* Tiny leaf particle drifting off */}
            <ellipse
              cx={leafX}
              cy={leafY}
              rx={Math.max(2, size * 0.026)}
              ry={Math.max(1.2, size * 0.015)}
              fill="#44ee66"
              opacity={0}
            >
              <animate
                attributeName="opacity"
                values="0;0.85;0"
                dur="2.8s"
                begin={`${delay + 0.5}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="cy"
                values={`${leafY};${leafY + size * 0.12};${leafY + size * 0.22}`}
                dur="2.8s"
                begin={`${delay + 0.5}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="cx"
                values={`${leafX};${leafX + (key % 2 === 0 ? -size * 0.05 : size * 0.05)};${leafX + (key % 2 === 0 ? size * 0.07 : -size * 0.07)}`}
                dur="2.8s"
                begin={`${delay + 0.5}s`}
                repeatCount="indefinite"
              />
            </ellipse>
          </g>
        ),
      )}
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────── */
/*  2. FIRE -- Realistic asynchronous flame tongues + embers       */
/* ──────────────────────────────────────────────────────────────── */
export function FrameAnimationFire({
  size = 80,
  isPreview = false,
  isActive = false,
}: FrameProps) {
  const bleed = Math.round(size * 0.18);
  const total = outerSize(size, bleed);
  const C = cx(size, bleed);
  const R = ringR(size, bleed);
  const opacity = isPreview ? 0.55 : isActive ? 1 : 0.92;
  const sw = Math.max(2.5, size * 0.036);

  const flameCount = 9;
  const flames = Array.from({ length: flameCount }, (_, i) => {
    const angle = (i / flameCount) * 2 * Math.PI - Math.PI / 2;
    const x = C + R * Math.cos(angle);
    const y = C + R * Math.sin(angle);
    // Each flame points outward from center
    const angleDeg = (angle * 180) / Math.PI - 90;
    // Unique timing per flame -- slightly different durations to desync
    const dur = 1.6 + (i % 4) * 0.22;
    const delay = (i / flameCount) * 1.4;
    const colors = [
      "#fff200",
      "#ff8800",
      "#ff4400",
      "#ff8800",
      "#ff2200",
      "#ffd000",
      "#ff6600",
      "#ff3300",
      "#ffaa00",
    ];
    const color = colors[i % colors.length];
    return { x, y, angleDeg, dur, delay, color, key: i };
  });

  const emberCount = 7;
  const embers = Array.from({ length: emberCount }, (_, i) => {
    const angle = (i / emberCount) * 2 * Math.PI;
    const x = C + R * Math.cos(angle);
    const y = C + R * Math.sin(angle);
    const outX = C + (R + bleed * 0.85) * Math.cos(angle + 0.3);
    const outY = C + (R + bleed * 0.85) * Math.sin(angle + 0.3);
    const delay = (i / emberCount) * 2.5 + 0.3;
    return { x, y, outX, outY, delay, key: i };
  });

  const uid = `fire_${size}`;

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
        <filter id={`${uid}_glow`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id={`${uid}_halo`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Base ring -- pulsing orange fire */}
      <circle
        cx={C}
        cy={C}
        r={R}
        fill="none"
        stroke="#ff4400"
        strokeWidth={sw}
        strokeDasharray={`${R * 0.28} ${R * 0.1}`}
        filter={`url(#${uid}_glow)`}
        opacity={isActive ? 1 : 0.85}
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`0 ${C} ${C}`}
          to={`360 ${C} ${C}`}
          dur="2.8s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke"
          values="#ff4400;#ffd000;#ff6600;#ff2200;#ff4400"
          dur="1.8s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Outer corona pulse */}
      <circle
        cx={C}
        cy={C}
        r={R + bleed * 0.5}
        fill="none"
        stroke="#ff2200"
        strokeWidth={sw * 0.4}
        filter={`url(#${uid}_halo)`}
        opacity={0.2}
      >
        <animate
          attributeName="opacity"
          values="0.1;0.38;0.1"
          dur="1.6s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="r"
          values={`${R + bleed * 0.35};${R + bleed * 0.65};${R + bleed * 0.35}`}
          dur="1.6s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Flame tongues -- each independent */}
      {flames.map(({ x, y, angleDeg, dur, delay, color, key }) => {
        const riseH = size * 0.18 + (key % 3) * size * 0.04;
        const rx = Math.max(2, size * 0.028) + (key % 2) * size * 0.008;
        const ryBase = Math.max(3.5, size * 0.05);
        const ryTall = Math.max(5.5, size * 0.08);
        return (
          <g key={key}>
            {/* Main flame teardrop */}
            <ellipse
              cx={x}
              cy={y}
              rx={rx}
              ry={ryBase}
              fill={color}
              filter={`url(#${uid}_glow)`}
              opacity={0}
              transform={`rotate(${angleDeg} ${x} ${y})`}
            >
              <animate
                attributeName="opacity"
                values="0;0.95;0.75;0"
                keyTimes="0;0.25;0.65;1"
                dur={`${dur}s`}
                begin={`${delay}s`}
                repeatCount="indefinite"
              />
              {/* Flame rises outward from ring */}
              <animate
                attributeName="cy"
                values={`${y};${y - riseH * 0.45};${y - riseH}`}
                dur={`${dur}s`}
                begin={`${delay}s`}
                repeatCount="indefinite"
              />
              {/* Stretch tall then shrink to tip */}
              <animate
                attributeName="ry"
                values={`${ryBase};${ryTall};${Math.max(1.5, size * 0.02)}`}
                dur={`${dur}s`}
                begin={`${delay}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="rx"
                values={`${rx};${rx * 1.3};${rx * 0.4}`}
                dur={`${dur}s`}
                begin={`${delay}s`}
                repeatCount="indefinite"
              />
            </ellipse>
          </g>
        );
      })}

      {/* Embers flying outward */}
      {embers.map(({ x, y, outX, outY, delay, key }) => (
        <circle
          key={key}
          cx={x}
          cy={y}
          r={Math.max(1.2, size * 0.016)}
          fill="#fff8aa"
          opacity={0}
        >
          <animate
            attributeName="opacity"
            values="0;0.95;0"
            keyTimes="0;0.35;1"
            dur="2.2s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="cx"
            values={`${x};${outX}`}
            dur="2.2s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="cy"
            values={`${y};${outY}`}
            dur="2.2s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="r"
            values={`${Math.max(1.2, size * 0.016)};0.5`}
            dur="2.2s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────── */
/*  3. WATER -- Flowing stream with water droplets + ripples       */
/* ──────────────────────────────────────────────────────────────── */
export function FrameAnimationWater({
  size = 80,
  isPreview = false,
  isActive = false,
}: FrameProps) {
  const bleed = Math.round(size * 0.18);
  const total = outerSize(size, bleed);
  const C = cx(size, bleed);
  const R = ringR(size, bleed);
  const opacity = isPreview ? 0.55 : isActive ? 1 : 0.92;
  const sw = Math.max(2.5, size * 0.036);

  // 14 water droplets distributed around the ring
  const dropCount = 14;
  const drops = Array.from({ length: dropCount }, (_, i) => {
    const angle = (i / dropCount) * 2 * Math.PI;
    const x = C + R * Math.cos(angle);
    const y = C + R * Math.sin(angle);
    const delay = (i / dropCount) * 3.8;
    return { x, y, delay, key: i };
  });

  // 3 expanding ripple rings
  const rippleCount = 3;
  const ripples = Array.from({ length: rippleCount }, (_, i) => ({
    delay: (i / rippleCount) * 2.5,
    key: i,
  }));

  const uid = `water_${size}`;
  const circumference = 2 * Math.PI * R;

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
        <filter id={`${uid}_glow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer thin ring -- slowest flow */}
      <circle
        cx={C}
        cy={C}
        r={R + sw * 0.4}
        fill="none"
        stroke="#00eeff"
        strokeWidth={sw * 0.4}
        strokeDasharray={`${circumference * 0.18} ${circumference * 0.07}`}
        opacity={0.45}
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`360 ${C} ${C}`}
          to={`0 ${C} ${C}`}
          dur="9s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.25;0.6;0.25"
          dur="3.5s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Mid ring -- medium flow counter-clockwise */}
      <circle
        cx={C}
        cy={C}
        r={R}
        fill="none"
        stroke="#0088dd"
        strokeWidth={sw * 0.7}
        strokeDasharray={`${circumference * 0.28} ${circumference * 0.07}`}
        filter={`url(#${uid}_glow)`}
        opacity={0.7}
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`360 ${C} ${C}`}
          to={`0 ${C} ${C}`}
          dur="5.5s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Inner ring -- fastest flow */}
      <circle
        cx={C}
        cy={C}
        r={R - sw * 0.5}
        fill="none"
        stroke="#00ccff"
        strokeWidth={sw}
        strokeDasharray={`${circumference * 0.38} ${circumference * 0.08}`}
        filter={`url(#${uid}_glow)`}
        opacity={isActive ? 1 : 0.88}
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`360 ${C} ${C}`}
          to={`0 ${C} ${C}`}
          dur="3.8s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke"
          values="#00ccff;#aaeeff;#00aaff;#00eeff;#00ccff"
          dur="4s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Water droplets appear, stretch, and dissolve */}
      {drops.map(({ x, y, delay, key }) => (
        <g key={key}>
          <ellipse
            cx={x}
            cy={y}
            rx={Math.max(1.8, size * 0.024)}
            ry={Math.max(2.5, size * 0.036)}
            fill="#00aaff"
            opacity={0}
          >
            <animate
              attributeName="opacity"
              values="0;0.92;0.5;0"
              keyTimes="0;0.2;0.65;1"
              dur="3.5s"
              begin={`${delay}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="ry"
              values={`${Math.max(2.5, size * 0.036)};${Math.max(4.5, size * 0.06)};${Math.max(1.5, size * 0.02)}`}
              dur="3.5s"
              begin={`${delay}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="rx"
              values={`${Math.max(1.8, size * 0.024)};${Math.max(1.2, size * 0.016)};0.5`}
              dur="3.5s"
              begin={`${delay}s`}
              repeatCount="indefinite"
            />
          </ellipse>
        </g>
      ))}

      {/* Expanding ripple rings pulsing outward */}
      {ripples.map(({ delay, key }) => (
        <circle
          key={key}
          cx={C}
          cy={C}
          r={R}
          fill="none"
          stroke="#aaeeff"
          strokeWidth={sw * 0.35}
          opacity={0}
        >
          <animate
            attributeName="opacity"
            values="0;0.6;0"
            dur="2.8s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="r"
            values={`${R};${R + bleed * 0.8}`}
            dur="2.8s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="strokeWidth"
            values={`${sw * 0.35};0.3`}
            dur="2.8s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────── */
/*  4. WIND -- Turbulent streaks rushing around the ring           */
/* ──────────────────────────────────────────────────────────────── */
export function FrameAnimationWind({
  size = 80,
  isPreview = false,
  isActive = false,
}: FrameProps) {
  const bleed = Math.round(size * 0.18);
  const total = outerSize(size, bleed);
  const C = cx(size, bleed);
  const R = ringR(size, bleed);
  const opacity = isPreview ? 0.55 : isActive ? 1 : 0.92;
  const sw = Math.max(2.5, size * 0.036);

  // 9 wind streaks -- mix CW and CCW at different speeds
  const streakCount = 9;
  const streaks = Array.from({ length: streakCount }, (_, i) => {
    const baseAngle = (i / streakCount) * 2 * Math.PI;
    const spanRad = Math.PI * 0.32; // quarter-ish arc
    const startAngle = baseAngle;
    const endAngle = baseAngle + spanRad;
    const midAngle = baseAngle + spanRad / 2;

    const sx = C + R * Math.cos(startAngle);
    const sy = C + R * Math.sin(startAngle);
    const ex = C + R * Math.cos(endAngle);
    const ey = C + R * Math.sin(endAngle);
    // Control point slightly outside for the curve
    const bulge = i % 3 === 0 ? 1.12 : i % 3 === 1 ? 0.9 : 1.05;
    const mx = C + R * bulge * Math.cos(midAngle);
    const my = C + R * bulge * Math.sin(midAngle);

    const isCCW = i % 2 === 0;
    const dur = 1.5 + (i % 4) * 0.38;
    const delay = (i / streakCount) * 2.2;
    const alpha = 0.5 + (i % 3) * 0.15;
    return { sx, sy, mx, my, ex, ey, isCCW, dur, delay, alpha, key: i };
  });

  // Tiny drift particles
  const particleCount = 6;
  const particles = Array.from({ length: particleCount }, (_, i) => {
    const angle = (i / particleCount) * 2 * Math.PI;
    const x = C + R * Math.cos(angle);
    const y = C + R * Math.sin(angle);
    const delay = (i / particleCount) * 1.8;
    const dur = 1.4 + (i % 3) * 0.4;
    const endAngle = angle + (i % 2 === 0 ? 1.2 : -0.9);
    const ex = C + R * Math.cos(endAngle);
    const ey = C + R * Math.sin(endAngle);
    return { x, y, ex, ey, delay, dur, key: i };
  });

  const uid = `wind_${size}`;
  const arcLen = 2 * Math.PI * R * 0.32;

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
        <filter id={`${uid}_glow`} x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Faint base ring */}
      <circle
        cx={C}
        cy={C}
        r={R}
        fill="none"
        stroke="#cceeFF"
        strokeWidth={sw * 0.45}
        opacity={0.22}
      >
        <animate
          attributeName="opacity"
          values="0.12;0.32;0.12"
          dur="2.2s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Wind streak arcs -- each races around */}
      {streaks.map(
        ({ sx, sy, mx, my, ex, ey, isCCW, dur, delay, alpha, key }) => (
          <path
            key={key}
            d={`M ${sx} ${sy} Q ${mx} ${my} ${ex} ${ey}`}
            fill="none"
            stroke={
              key % 3 === 0 ? "#ffffff" : key % 3 === 1 ? "#ddeeff" : "#ccddee"
            }
            strokeWidth={Math.max(1.5, sw * (0.55 + (key % 3) * 0.15))}
            strokeLinecap="round"
            filter={`url(#${uid}_glow)`}
            opacity={0}
          >
            {/* Flash in fast, hold briefly, disappear */}
            <animate
              attributeName="opacity"
              values={`0;${alpha};${alpha * 0.7};0`}
              keyTimes="0;0.18;0.6;1"
              dur={`${dur}s`}
              begin={`${delay}s`}
              repeatCount="indefinite"
            />
            {/* Stroke dash sweeps across: line rushes from start to end */}
            <animate
              attributeName="strokeDasharray"
              values={`0 ${arcLen * 1.2};${arcLen * 0.7} ${arcLen * 0.5};${arcLen * 1.2} 0`}
              keyTimes="0;0.5;1"
              dur={`${dur}s`}
              begin={`${delay}s`}
              repeatCount="indefinite"
            />
            {/* Subtle transform spin to sell motion */}
            <animateTransform
              attributeName="transform"
              type="rotate"
              from={`${isCCW ? 360 : 0} ${C} ${C}`}
              to={`${isCCW ? 0 : 360} ${C} ${C}`}
              dur={`${dur * 1.5}s`}
              begin={`${delay}s`}
              repeatCount="indefinite"
            />
          </path>
        ),
      )}

      {/* Tiny drift particles */}
      {particles.map(({ x, y, ex, ey, delay, dur, key }) => (
        <circle
          key={key}
          cx={x}
          cy={y}
          r={Math.max(1, size * 0.014)}
          fill="#e8f8ff"
          opacity={0}
        >
          <animate
            attributeName="opacity"
            values="0;0.8;0"
            dur={`${dur}s`}
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="cx"
            values={`${x};${ex}`}
            dur={`${dur}s`}
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="cy"
            values={`${y};${ey}`}
            dur={`${dur}s`}
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────── */
/*  5. STONE -- Grinding rock segments with sparks & dust          */
/* ──────────────────────────────────────────────────────────────── */
export function FrameAnimationStone({
  size = 80,
  isPreview = false,
  isActive = false,
}: FrameProps) {
  const bleed = Math.round(size * 0.18);
  const total = outerSize(size, bleed);
  const C = cx(size, bleed);
  const R = ringR(size, bleed);
  const opacity = isPreview ? 0.55 : isActive ? 1 : 0.92;

  const segmentCount = 8;
  const arcSpan = (2 * Math.PI) / segmentCount;
  const gap = arcSpan * 0.18;
  const sw = Math.max(4, size * 0.062);
  const swOuter = Math.max(2.5, size * 0.038);

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
  const highlightColors = [
    "#c0c0c8",
    "#d0d0cc",
    "#c0bfb0",
    "#a8a8b8",
    "#cccccc",
    "#b0b0ba",
    "#bebe aa",
    "#a8a8b8",
  ];

  const segments = Array.from({ length: segmentCount }, (_, i) => {
    const startAngle = i * arcSpan - Math.PI / 2;
    const endAngle = startAngle + arcSpan - gap;
    const sx = C + R * Math.cos(startAngle);
    const sy = C + R * Math.sin(startAngle);
    const ex = C + R * Math.cos(endAngle);
    const ey = C + R * Math.sin(endAngle);
    const largeArc = arcSpan - gap > Math.PI ? 1 : 0;
    const d = `M ${sx} ${sy} A ${R} ${R} 0 ${largeArc} 1 ${ex} ${ey}`;

    // Outer highlight ring slightly bigger radius
    const Rh = R + sw * 0.28;
    const hsx = C + Rh * Math.cos(startAngle);
    const hsy = C + Rh * Math.sin(startAngle);
    const hex = C + Rh * Math.cos(endAngle);
    const hey = C + Rh * Math.sin(endAngle);
    const dh = `M ${hsx} ${hsy} A ${Rh} ${Rh} 0 ${largeArc} 1 ${hex} ${hey}`;

    return {
      d,
      dh,
      color: colors[i % colors.length],
      highlight: highlightColors[i % highlightColors.length],
      key: i,
    };
  });

  // Crack lines (precomputed to avoid Array.from in JSX)
  const crackLines = Array.from({ length: 4 }, (_, i) => {
    const angle = (i / 4) * 2 * Math.PI - Math.PI / 2;
    const inner = size / 2 - sw * 0.1;
    const outer = size / 2 + sw * 1.2;
    return {
      ix: C + inner * Math.cos(angle),
      iy: C + inner * Math.sin(angle),
      ox: C + outer * Math.cos(angle),
      oy: C + outer * Math.sin(angle),
      key: i,
    };
  });

  // Dust particles at segment ends
  const dustCount = 6;
  const dusts = Array.from({ length: dustCount }, (_, i) => {
    const angle = (i / dustCount) * 2 * Math.PI - Math.PI / 2;
    const x = C + R * Math.cos(angle);
    const y = C + R * Math.sin(angle);
    const outAngle = angle + 0.25;
    const outX = C + (R + bleed * 0.8) * Math.cos(outAngle);
    const outY = C + (R + bleed * 0.8) * Math.sin(outAngle);
    const delay = (i / dustCount) * 8;
    return { x, y, outX, outY, delay, key: i };
  });

  const uid = `stone_${size}`;

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
        <filter id={`${uid}_glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id={`${uid}_deep`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Deep shadow ring (depth effect) */}
      <circle
        cx={C}
        cy={C}
        r={R}
        fill="none"
        stroke="#33334a"
        strokeWidth={sw * 1.5}
        filter={`url(#${uid}_deep)`}
        opacity={0.5}
      />

      {/* Spinning stone segments group */}
      <g filter={`url(#${uid}_glow)`}>
        {segments.map(({ d, color, key }) => (
          <path
            key={key}
            d={d}
            fill="none"
            stroke={color}
            strokeWidth={sw}
            strokeLinecap="butt"
          >
            {/* Spark flash: each segment briefly flashes near-white */}
            <animate
              attributeName="stroke"
              values={`${color};${color};#e8e8ee;${color};${color}`}
              keyTimes={`0;${(key / segmentCount) * 0.9};${(key / segmentCount) * 0.9 + 0.04};${(key / segmentCount) * 0.9 + 0.08};1`}
              dur="6s"
              repeatCount="indefinite"
            />
          </path>
        ))}

        {/* Highlight arcs on top (3D effect) */}
        {segments.map(({ dh, highlight, key }) => (
          <path
            key={`h_${key}`}
            d={dh}
            fill="none"
            stroke={highlight}
            strokeWidth={swOuter * 0.5}
            strokeLinecap="butt"
            opacity={0.55}
          />
        ))}

        {/* Rotate all stone segments together */}
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`0 ${C} ${C}`}
          to={`360 ${C} ${C}`}
          dur="10s"
          repeatCount="indefinite"
          additive="sum"
        />
      </g>

      {/* Crack lines between segments for realism */}
      {crackLines.map(({ ix, iy, ox, oy, key }) => (
        <line
          key={key}
          x1={ix}
          y1={iy}
          x2={ox}
          y2={oy}
          stroke="#22222a"
          strokeWidth={1.2}
          opacity={0.6}
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`0 ${C} ${C}`}
            to={`360 ${C} ${C}`}
            dur="10s"
            repeatCount="indefinite"
          />
        </line>
      ))}

      {/* Dust particles flying off at segment ends */}
      {dusts.map(({ x, y, outX, outY, delay, key }) => (
        <circle
          key={key}
          cx={x}
          cy={y}
          r={Math.max(1.5, size * 0.02)}
          fill="#aaaaaa"
          opacity={0}
        >
          <animate
            attributeName="opacity"
            values="0;0.82;0"
            keyTimes="0;0.3;1"
            dur="8s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="cx"
            values={`${x};${outX}`}
            dur="8s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="cy"
            values={`${y};${outY}`}
            dur="8s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="r"
            values={`${Math.max(1.5, size * 0.02)};0.5`}
            dur="8s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
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
    description: "Vine tendrils grow around your profile",
  },
  {
    index: 21,
    name: "Inferno Ring",
    label: "FIRE",
    price: 200,
    color: "#ff6600",
    Component: FrameAnimationFire,
    description: "Real flames dance and embers fly",
  },
  {
    index: 22,
    name: "Tidal Halo",
    label: "WATER",
    price: 200,
    color: "#00ccff",
    Component: FrameAnimationWater,
    description: "Water streams flow and droplets ripple",
  },
  {
    index: 23,
    name: "Storm Wreath",
    label: "WIND",
    price: 200,
    color: "#aaeeff",
    Component: FrameAnimationWind,
    description: "Turbulent wind streaks race around",
  },
  {
    index: 24,
    name: "Granite Grind",
    label: "STONE",
    price: 200,
    color: "#999999",
    Component: FrameAnimationStone,
    description: "Stone segments grind with sparks",
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
