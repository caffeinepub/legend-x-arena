/**
 * FrameAnimations.tsx — 15 premium animated SVG frame components
 * Each is a circular ring that wraps tightly around a profile picture.
 * All animations are pure CSS/SVG, GPU-composited, infinite loop.
 */

import React from "react";

interface FrameProps {
  size?: number;
  isPreview?: boolean;
  isActive?: boolean;
}

function outerSize(size: number, bleed: number) {
  return size + bleed * 2;
}
function cx(size: number, bleed: number) {
  return size / 2 + bleed;
}
function ringR(size: number, bleed: number) {
  return size / 2 + bleed / 2;
}

/* ── 1. Lightning Strike (index 20) ── */
export function FrameLightning({
  size = 80,
  isPreview = false,
  isActive = false,
}: FrameProps) {
  const bleed = Math.round(size * 0.22);
  const total = outerSize(size, bleed);
  const C = cx(size, bleed);
  const R = ringR(size, bleed);
  const op = isPreview ? 0.55 : 1;
  const uid = `lgt_${size}`;
  const bolts = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * 2 * Math.PI - Math.PI / 2;
    const x1 = C + R * Math.cos(a);
    const y1 = C + R * Math.sin(a);
    const x2 = C + (R + bleed * 0.7) * Math.cos(a + 0.15);
    const y2 = C + (R + bleed * 0.7) * Math.sin(a + 0.15);
    const xm = C + (R + bleed * 0.35) * Math.cos(a - 0.05);
    const ym = C + (R + bleed * 0.35) * Math.sin(a - 0.05);
    return { x1, y1, x2, y2, xm, ym, delay: (i / 8) * 1.6, key: i };
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
        opacity: op,
      }}
      aria-hidden="true"
    >
      <defs>
        <filter id={`${uid}g`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feComposite in="SourceGraphic" in2="b" operator="over" />
        </filter>
      </defs>
      <circle
        cx={C}
        cy={C}
        r={R}
        fill="none"
        stroke="#ffe066"
        strokeWidth={Math.max(2, size * 0.03)}
        strokeDasharray={`${R * 0.15} ${R * 0.05}`}
        filter={`url(#${uid}g)`}
        opacity={isActive ? 0.9 : 0.65}
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`0 ${C} ${C}`}
          to={`360 ${C} ${C}`}
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke"
          values="#ffe066;#ffffff;#88aaff;#ffe066"
          dur="0.8s"
          repeatCount="indefinite"
        />
      </circle>
      {bolts.map(({ x1, y1, x2, y2, xm, ym, delay, key }) => (
        <polyline
          key={key}
          points={`${x1},${y1} ${xm},${ym} ${x2},${y2}`}
          fill="none"
          stroke="#ffffff"
          strokeWidth={Math.max(1.2, size * 0.018)}
          strokeLinecap="round"
          filter={`url(#${uid}g)`}
          opacity={0}
        >
          <animate
            attributeName="opacity"
            values="0;1;0.8;0"
            keyTimes="0;0.1;0.35;1"
            dur="1.2s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="stroke"
            values="#ffffff;#aaddff;#ffe066;#ffffff"
            dur="1.2s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
        </polyline>
      ))}
      {bolts.map(({ xm, ym, delay, key }) => (
        <circle
          key={`sp_${key}`}
          cx={xm}
          cy={ym}
          r={Math.max(1.5, size * 0.022)}
          fill="#ffe066"
          filter={`url(#${uid}g)`}
          opacity={0}
        >
          <animate
            attributeName="opacity"
            values="0;1;0"
            dur="0.5s"
            begin={`${delay + 0.08}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="r"
            values={`${Math.max(1.5, size * 0.022)};${Math.max(3, size * 0.045)};0.5`}
            dur="0.5s"
            begin={`${delay + 0.08}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </svg>
  );
}

/* ── 2. Galaxy Spiral (index 21) ── */
export function FrameGalaxy({
  size = 80,
  isPreview = false,
  // biome-ignore lint/correctness/noUnusedVariables: part of shared FrameProps interface
  isActive: _isActive = false,
}: FrameProps) {
  const bleed = Math.round(size * 0.2);
  const total = outerSize(size, bleed);
  const C = cx(size, bleed);
  const R = ringR(size, bleed);
  const op = isPreview ? 0.55 : 1;
  const uid = `gal_${size}`;
  const stars = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * 2 * Math.PI;
    const r = R + (i % 3) * (bleed * 0.22);
    return {
      x: C + r * Math.cos(a),
      y: C + r * Math.sin(a),
      delay: (i / 16) * 4,
      key: i,
    };
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
        opacity: op,
      }}
      aria-hidden="true"
    >
      <defs>
        <filter id={`${uid}g`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feComposite in="SourceGraphic" in2="b" operator="over" />
        </filter>
      </defs>
      <circle
        cx={C}
        cy={C}
        r={R}
        fill="none"
        stroke="url(#galaxyGrad)"
        strokeWidth={Math.max(2.5, size * 0.038)}
        strokeDasharray={`${R * 0.4} ${R * 0.1}`}
        filter={`url(#${uid}g)`}
        opacity={0.85}
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`0 ${C} ${C}`}
          to={`360 ${C} ${C}`}
          dur="8s"
          repeatCount="indefinite"
        />
      </circle>
      <defs>
        <linearGradient id="galaxyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9933ff" />
          <stop offset="35%" stopColor="#0066ff" />
          <stop offset="65%" stopColor="#ff33aa" />
          <stop offset="100%" stopColor="#9933ff" />
        </linearGradient>
      </defs>
      <circle
        cx={C}
        cy={C}
        r={R + bleed * 0.3}
        fill="none"
        stroke="#221133"
        strokeWidth={bleed * 0.6}
        opacity={0.4}
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`360 ${C} ${C}`}
          to={`0 ${C} ${C}`}
          dur="12s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke"
          values="#221133;#331155;#221133"
          dur="3s"
          repeatCount="indefinite"
        />
      </circle>
      {stars.map(({ x, y, delay, key }) => (
        <circle
          key={key}
          cx={x}
          cy={y}
          r={Math.max(1, size * 0.015)}
          fill="#ffffff"
          opacity={0}
          filter={`url(#${uid}g)`}
        >
          <animate
            attributeName="opacity"
            values="0;1;0.4;1;0"
            dur="3.5s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="r"
            values={`${Math.max(1, size * 0.015)};${Math.max(2, size * 0.03)};${Math.max(1, size * 0.015)}`}
            dur="3.5s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </svg>
  );
}

/* ── 3. Blood Drip (index 22) ── */
export function FrameBloodDrip({
  size = 80,
  isPreview = false,
  isActive = false,
}: FrameProps) {
  const bleed = Math.round(size * 0.22);
  const total = outerSize(size, bleed);
  const C = cx(size, bleed);
  const R = ringR(size, bleed);
  const op = isPreview ? 0.55 : 1;
  const uid = `bld_${size}`;
  const drops = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * 2 * Math.PI - Math.PI / 2;
    const x = C + R * Math.cos(a);
    const y = C + R * Math.sin(a);
    const yEnd = y + bleed * 0.85;
    return { x, y, yEnd, delay: (i / 10) * 2.5, key: i };
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
        opacity: op,
      }}
      aria-hidden="true"
    >
      <defs>
        <filter id={`${uid}g`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.8" result="b" />
          <feComposite in="SourceGraphic" in2="b" operator="over" />
        </filter>
      </defs>
      <circle
        cx={C}
        cy={C}
        r={R}
        fill="none"
        stroke="#cc0000"
        strokeWidth={Math.max(3, size * 0.045)}
        filter={`url(#${uid}g)`}
        opacity={isActive ? 1 : 0.85}
      >
        <animate
          attributeName="stroke"
          values="#cc0000;#ff2200;#880000;#cc0000"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      {drops.map(({ x, y, yEnd, delay, key }) => (
        <g key={key}>
          <ellipse
            cx={x}
            cy={y}
            rx={Math.max(2, size * 0.028)}
            ry={Math.max(2.5, size * 0.035)}
            fill="#cc0000"
            filter={`url(#${uid}g)`}
            opacity={0}
          >
            <animate
              attributeName="opacity"
              values="0;0.9;0.7;0"
              keyTimes="0;0.2;0.6;1"
              dur="2.2s"
              begin={`${delay}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="cy"
              values={`${y};${y + bleed * 0.2};${yEnd}`}
              dur="2.2s"
              begin={`${delay}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="ry"
              values={`${Math.max(2.5, size * 0.035)};${Math.max(4, size * 0.055)};${Math.max(1.5, size * 0.02)}`}
              dur="2.2s"
              begin={`${delay}s`}
              repeatCount="indefinite"
            />
          </ellipse>
          <circle
            cx={x}
            cy={yEnd}
            r={Math.max(1.8, size * 0.025)}
            fill="#880000"
            opacity={0}
          >
            <animate
              attributeName="opacity"
              values="0;0.7;0"
              keyTimes="0;0.6;1"
              dur="2.2s"
              begin={`${delay + 0.4}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="r"
              values={`0;${Math.max(3, size * 0.042)};${Math.max(1, size * 0.015)}`}
              dur="2.2s"
              begin={`${delay + 0.4}s`}
              repeatCount="indefinite"
            />
          </circle>
        </g>
      ))}
    </svg>
  );
}

/* ── 4. Neon Pulse (index 23) ── */
export function FrameNeonPulse({
  size = 80,
  isPreview = false,
  isActive: _isActive = false,
}: FrameProps) {
  const bleed = Math.round(size * 0.2);
  const total = outerSize(size, bleed);
  const C = cx(size, bleed);
  const R = ringR(size, bleed);
  const op = isPreview ? 0.55 : 1;
  const uid = `neo_${size}`;
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
        opacity: op,
      }}
      aria-hidden="true"
    >
      <defs>
        <filter id={`${uid}g`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feComposite in="SourceGraphic" in2="b" operator="over" />
        </filter>
      </defs>
      {[0, 1, 2].map((layer) => (
        <circle
          key={layer}
          cx={C}
          cy={C}
          r={R + layer * (bleed * 0.2)}
          fill="none"
          strokeWidth={Math.max(1.5, size * 0.022) * (layer === 1 ? 1 : 0.6)}
          filter={`url(#${uid}g)`}
          stroke="#ff00ff"
          opacity={layer === 1 ? 0.9 : 0.4}
        >
          <animate
            attributeName="stroke"
            values="#ff00ff;#00ffff;#ffff00;#ff6600;#00ff88;#ff00ff"
            dur={`${2.4 + layer * 0.6}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values={`${layer === 1 ? "0.9" : "0.3"};${layer === 1 ? "1" : "0.6"};${layer === 1 ? "0.9" : "0.3"}`}
            dur={`${1.2 + layer * 0.4}s`}
            repeatCount="indefinite"
          />
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`${layer % 2 === 0 ? 0 : 360} ${C} ${C}`}
            to={`${layer % 2 === 0 ? 360 : 0} ${C} ${C}`}
            dur={`${4 + layer * 2}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </svg>
  );
}

/* ── 5. Ice Shatter (index 24) ── */
export function FrameIceShatter({
  size = 80,
  isPreview = false,
  isActive: _isActive = false,
}: FrameProps) {
  const bleed = Math.round(size * 0.2);
  const total = outerSize(size, bleed);
  const C = cx(size, bleed);
  const R = ringR(size, bleed);
  const op = isPreview ? 0.55 : 1;
  const uid = `ice_${size}`;
  const shards = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * 2 * Math.PI;
    const x = C + R * Math.cos(a);
    const y = C + R * Math.sin(a);
    const angleDeg = (a * 180) / Math.PI + 90;
    return { x, y, angleDeg, delay: (i / 12) * 3, key: i };
  });
  const sw = Math.max(2.5, size * 0.036);
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
        opacity: op,
      }}
      aria-hidden="true"
    >
      <defs>
        <filter id={`${uid}g`} x="-35%" y="-35%" width="170%" height="170%">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feComposite in="SourceGraphic" in2="b" operator="over" />
        </filter>
      </defs>
      <circle
        cx={C}
        cy={C}
        r={R}
        fill="none"
        stroke="#aaeeff"
        strokeWidth={sw * 0.7}
        strokeDasharray={`${R * 0.2} ${R * 0.08}`}
        filter={`url(#${uid}g)`}
        opacity={0.7}
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`0 ${C} ${C}`}
          to={`360 ${C} ${C}`}
          dur="6s"
          repeatCount="indefinite"
        />
      </circle>
      {shards.map(({ x, y, angleDeg, delay, key }) => {
        const h = bleed * 0.65;
        return (
          <polygon
            key={key}
            points={`${x - h * 0.2},${y} ${x},${y - h} ${x + h * 0.2},${y}`}
            fill="#aaeeff"
            transform={`rotate(${angleDeg} ${x} ${y})`}
            filter={`url(#${uid}g)`}
            opacity={0}
          >
            <animate
              attributeName="opacity"
              values="0;0.85;0.6;0"
              keyTimes="0;0.2;0.6;1"
              dur="2.5s"
              begin={`${delay}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="fill"
              values="#aaeeff;#ffffff;#66ccff;#aaeeff"
              dur="2.5s"
              begin={`${delay}s`}
              repeatCount="indefinite"
            />
          </polygon>
        );
      })}
    </svg>
  );
}

/* ── 6. Lava Flow (index 25) ── */
export function FrameLavaFlow({
  size = 80,
  isPreview = false,
  isActive: _isActive = false,
}: FrameProps) {
  const bleed = Math.round(size * 0.2);
  const total = outerSize(size, bleed);
  const C = cx(size, bleed);
  const R = ringR(size, bleed);
  const op = isPreview ? 0.55 : 1;
  const uid = `lav_${size}`;
  const sw = Math.max(3, size * 0.044);
  const blobs = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * 2 * Math.PI;
    return {
      x: C + R * Math.cos(a),
      y: C + R * Math.sin(a),
      delay: (i / 8) * 2.4,
      key: i,
    };
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
        opacity: op,
      }}
      aria-hidden="true"
    >
      <defs>
        <filter id={`${uid}g`} x="-35%" y="-35%" width="170%" height="170%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feComposite in="SourceGraphic" in2="b" operator="over" />
        </filter>
      </defs>
      <circle
        cx={C}
        cy={C}
        r={R}
        fill="none"
        stroke="#ff4400"
        strokeWidth={sw}
        strokeDasharray={`${R * 0.35} ${R * 0.08}`}
        filter={`url(#${uid}g)`}
        opacity={0.9}
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`0 ${C} ${C}`}
          to={`360 ${C} ${C}`}
          dur="5s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke"
          values="#ff4400;#ff8800;#ff2200;#ff6600;#ff4400"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      <circle
        cx={C}
        cy={C}
        r={R - sw * 0.4}
        fill="none"
        stroke="#ff8800"
        strokeWidth={sw * 0.5}
        strokeDasharray={`${R * 0.28} ${R * 0.12}`}
        filter={`url(#${uid}g)`}
        opacity={0.6}
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`360 ${C} ${C}`}
          to={`0 ${C} ${C}`}
          dur="3.5s"
          repeatCount="indefinite"
        />
      </circle>
      {blobs.map(({ x, y, delay, key }) => (
        <circle
          key={key}
          cx={x}
          cy={y}
          r={Math.max(2.5, size * 0.036)}
          fill="#ffaa00"
          filter={`url(#${uid}g)`}
          opacity={0}
        >
          <animate
            attributeName="opacity"
            values="0;0.95;0.7;0"
            keyTimes="0;0.25;0.6;1"
            dur="2s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="fill"
            values="#ffaa00;#ff6600;#ff2200;#ffaa00"
            dur="2s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="r"
            values={`${Math.max(2.5, size * 0.036)};${Math.max(4, size * 0.06)};${Math.max(1, size * 0.015)}`}
            dur="2s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </svg>
  );
}

/* ── 7. Sakura Petals (index 26) ── */
export function FrameSakura({
  size = 80,
  isPreview = false,
  isActive: _isActive = false,
}: FrameProps) {
  const bleed = Math.round(size * 0.22);
  const total = outerSize(size, bleed);
  const C = cx(size, bleed);
  const R = ringR(size, bleed);
  const op = isPreview ? 0.55 : 1;
  const uid = `sak_${size}`;
  const petals = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * 2 * Math.PI - Math.PI / 2;
    const x = C + R * Math.cos(a);
    const y = C + R * Math.sin(a);
    return { x, y, delay: (i / 12) * 3.2, key: i };
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
        opacity: op,
      }}
      aria-hidden="true"
    >
      <defs>
        <filter id={`${uid}g`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.5" result="b" />
          <feComposite in="SourceGraphic" in2="b" operator="over" />
        </filter>
      </defs>
      <circle
        cx={C}
        cy={C}
        r={R}
        fill="none"
        stroke="#ffaacc"
        strokeWidth={Math.max(2, size * 0.03)}
        strokeDasharray={`${R * 0.25} ${R * 0.07}`}
        filter={`url(#${uid}g)`}
        opacity={0.75}
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`0 ${C} ${C}`}
          to={`360 ${C} ${C}`}
          dur="15s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke"
          values="#ffaacc;#ffccee;#ff88bb;#ffaacc"
          dur="4s"
          repeatCount="indefinite"
        />
      </circle>
      {petals.map(({ x, y, delay, key }) => (
        <g key={key}>
          <ellipse
            cx={x}
            cy={y - bleed * 0.12}
            rx={Math.max(3, size * 0.042)}
            ry={Math.max(2, size * 0.026)}
            fill="#ffaacc"
            filter={`url(#${uid}g)`}
            opacity={0}
          >
            <animate
              attributeName="opacity"
              values="0;0.9;0.7;0"
              keyTimes="0;0.15;0.55;1"
              dur="3s"
              begin={`${delay}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="cy"
              values={`${y - bleed * 0.12};${y + bleed * 0.25};${y + bleed * 0.65}`}
              dur="3s"
              begin={`${delay}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="cx"
              values={`${x};${x + (key % 2 === 0 ? -size * 0.06 : size * 0.06)};${x + (key % 2 === 0 ? size * 0.04 : -size * 0.04)}`}
              dur="3s"
              begin={`${delay}s`}
              repeatCount="indefinite"
            />
            <animateTransform
              attributeName="transform"
              type="rotate"
              values={`0 ${x} ${y};${key % 2 === 0 ? 25 : -25} ${x} ${y};${key % 2 === 0 ? -15 : 15} ${x} ${y}`}
              dur="3s"
              begin={`${delay}s`}
              repeatCount="indefinite"
              additive="replace"
            />
          </ellipse>
        </g>
      ))}
    </svg>
  );
}

/* ── 8. Shadow Smoke (index 27) ── */
export function FrameShadowSmoke({
  size = 80,
  isPreview = false,
  isActive: _isActive = false,
}: FrameProps) {
  const bleed = Math.round(size * 0.22);
  const total = outerSize(size, bleed);
  const C = cx(size, bleed);
  const R = ringR(size, bleed);
  const op = isPreview ? 0.55 : 1;
  const uid = `smk_${size}`;
  const puffs = Array.from({ length: 9 }, (_, i) => {
    const a = (i / 9) * 2 * Math.PI;
    const x = C + R * Math.cos(a);
    const y = C + R * Math.sin(a);
    return { x, y, delay: (i / 9) * 3.5, key: i };
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
        opacity: op,
      }}
      aria-hidden="true"
    >
      <defs>
        <filter id={`${uid}g`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="b" />
          <feComposite in="SourceGraphic" in2="b" operator="over" />
        </filter>
      </defs>
      <circle
        cx={C}
        cy={C}
        r={R}
        fill="none"
        stroke="#6622aa"
        strokeWidth={Math.max(3, size * 0.04)}
        strokeDasharray={`${R * 0.4} ${R * 0.1}`}
        filter={`url(#${uid}g)`}
        opacity={0.8}
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`360 ${C} ${C}`}
          to={`0 ${C} ${C}`}
          dur="7s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke"
          values="#6622aa;#3300aa;#aa22ff;#6622aa"
          dur="3s"
          repeatCount="indefinite"
        />
      </circle>
      {puffs.map(({ x, y, delay, key }) => (
        <circle
          key={key}
          cx={x}
          cy={y}
          r={Math.max(4, size * 0.055)}
          fill="#330066"
          filter={`url(#${uid}g)`}
          opacity={0}
        >
          <animate
            attributeName="opacity"
            values="0;0.6;0.4;0"
            keyTimes="0;0.3;0.6;1"
            dur="3s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="r"
            values={`${Math.max(4, size * 0.055)};${Math.max(8, size * 0.11)};${Math.max(12, size * 0.16)}`}
            dur="3s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="cx"
            values={`${x};${x + (key % 2 === 0 ? -size * 0.05 : size * 0.05)};${x}`}
            dur="3s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </svg>
  );
}

/* ── 9. Gold Crown (index 28) ── */
export function FrameGoldCrown({
  size = 80,
  isPreview = false,
  isActive = false,
}: FrameProps) {
  const bleed = Math.round(size * 0.2);
  const total = outerSize(size, bleed);
  const C = cx(size, bleed);
  const R = ringR(size, bleed);
  const op = isPreview ? 0.55 : 1;
  const uid = `cro_${size}`;
  const sparkles = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * 2 * Math.PI;
    const r = R + (i % 2 === 0 ? 0 : bleed * 0.28);
    return {
      x: C + r * Math.cos(a),
      y: C + r * Math.sin(a),
      delay: (i / 14) * 2.8,
      key: i,
    };
  });
  const sw = Math.max(3, size * 0.042);
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
        opacity: op,
      }}
      aria-hidden="true"
    >
      <defs>
        <filter id={`${uid}g`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feComposite in="SourceGraphic" in2="b" operator="over" />
        </filter>
      </defs>
      <circle
        cx={C}
        cy={C}
        r={R}
        fill="none"
        stroke="#ffd700"
        strokeWidth={sw}
        filter={`url(#${uid}g)`}
        opacity={isActive ? 1 : 0.88}
      >
        <animate
          attributeName="stroke"
          values="#ffd700;#fff4aa;#ffaa00;#ffd700"
          dur="2.2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.88;1;0.88"
          dur="1.8s"
          repeatCount="indefinite"
        />
      </circle>
      <circle
        cx={C}
        cy={C}
        r={R + bleed * 0.45}
        fill="none"
        stroke="#ffd700"
        strokeWidth={sw * 0.35}
        strokeDasharray={`3 ${R * 0.12}`}
        filter={`url(#${uid}g)`}
        opacity={0.5}
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`0 ${C} ${C}`}
          to={`360 ${C} ${C}`}
          dur="10s"
          repeatCount="indefinite"
        />
      </circle>
      {sparkles.map(({ x, y, delay, key }) => (
        <g key={key}>
          <line
            x1={x - bleed * 0.1}
            y1={y}
            x2={x + bleed * 0.1}
            y2={y}
            stroke="#fff4aa"
            strokeWidth={Math.max(1, size * 0.015)}
            filter={`url(#${uid}g)`}
            opacity={0}
          >
            <animate
              attributeName="opacity"
              values="0;1;0"
              dur="1.4s"
              begin={`${delay}s`}
              repeatCount="indefinite"
            />
          </line>
          <line
            x1={x}
            y1={y - bleed * 0.1}
            x2={x}
            y2={y + bleed * 0.1}
            stroke="#fff4aa"
            strokeWidth={Math.max(1, size * 0.015)}
            filter={`url(#${uid}g)`}
            opacity={0}
          >
            <animate
              attributeName="opacity"
              values="0;1;0"
              dur="1.4s"
              begin={`${delay}s`}
              repeatCount="indefinite"
            />
          </line>
        </g>
      ))}
    </svg>
  );
}

/* ── 10. Cyber Hex (index 29) ── */
export function FrameCyberHex({
  size = 80,
  isPreview = false,
  isActive: _isActive = false,
}: FrameProps) {
  const bleed = Math.round(size * 0.22);
  const total = outerSize(size, bleed);
  const C = cx(size, bleed);
  const R = ringR(size, bleed);
  const op = isPreview ? 0.55 : 1;
  const uid = `hex_${size}`;
  const hexes = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * 2 * Math.PI;
    const x = C + R * Math.cos(a);
    const y = C + R * Math.sin(a);
    const s = Math.max(5, size * 0.07);
    const pts = Array.from({ length: 6 }, (_, j) => {
      const ja = (j / 6) * 2 * Math.PI;
      return `${x + s * Math.cos(ja)},${y + s * Math.sin(ja)}`;
    }).join(" ");
    return { pts, delay: (i / 10) * 2.5, key: i };
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
        opacity: op,
      }}
      aria-hidden="true"
    >
      <defs>
        <filter id={`${uid}g`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feComposite in="SourceGraphic" in2="b" operator="over" />
        </filter>
      </defs>
      <circle
        cx={C}
        cy={C}
        r={R}
        fill="none"
        stroke="#00ffcc"
        strokeWidth={Math.max(1.5, size * 0.022)}
        strokeDasharray={`${R * 0.2} ${R * 0.06}`}
        filter={`url(#${uid}g)`}
        opacity={0.7}
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`0 ${C} ${C}`}
          to={`360 ${C} ${C}`}
          dur="4s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke"
          values="#00ffcc;#00aaff;#00ffcc"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      {hexes.map(({ pts, delay, key }) => (
        <polygon
          key={key}
          points={pts}
          fill="none"
          stroke="#00ffcc"
          strokeWidth={Math.max(1, size * 0.014)}
          filter={`url(#${uid}g)`}
          opacity={0}
        >
          <animate
            attributeName="opacity"
            values="0;0.85;0.5;0"
            keyTimes="0;0.2;0.6;1"
            dur="2s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="stroke"
            values="#00ffcc;#00aaff;#aaffee;#00ffcc"
            dur="2s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
        </polygon>
      ))}
    </svg>
  );
}

/* ── 11. Void Portal (index 30) ── */
export function FrameVoidPortal({
  size = 80,
  isPreview = false,
  isActive: _isActive = false,
}: FrameProps) {
  const bleed = Math.round(size * 0.22);
  const total = outerSize(size, bleed);
  const C = cx(size, bleed);
  const R = ringR(size, bleed);
  const op = isPreview ? 0.55 : 1;
  const uid = `voi_${size}`;
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
        opacity: op,
      }}
      aria-hidden="true"
    >
      <defs>
        <filter id={`${uid}g`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feComposite in="SourceGraphic" in2="b" operator="over" />
        </filter>
      </defs>
      {[0, 1, 2, 3].map((i) => (
        <circle
          key={i}
          cx={C}
          cy={C}
          r={R + i * (bleed * 0.18)}
          fill="none"
          stroke={i % 2 === 0 ? "#4400cc" : "#220088"}
          strokeWidth={Math.max(2, size * 0.03) * (1 - i * 0.18)}
          filter={`url(#${uid}g)`}
          opacity={0.85 - i * 0.15}
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`${i % 2 === 0 ? 0 : 360} ${C} ${C}`}
            to={`${i % 2 === 0 ? 360 : 0} ${C} ${C}`}
            dur={`${3 + i * 1.5}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="stroke"
            values={
              i % 2 === 0
                ? "#4400cc;#6600ff;#220088;#4400cc"
                : "#220088;#000044;#4400cc;#220088"
            }
            dur={`${2.5 + i}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </svg>
  );
}

/* ── 12. Dragon Scale (index 31) ── */
export function FrameDragonScale({
  size = 80,
  isPreview = false,
  isActive: _isActive = false,
}: FrameProps) {
  const bleed = Math.round(size * 0.2);
  const total = outerSize(size, bleed);
  const C = cx(size, bleed);
  const R = ringR(size, bleed);
  const op = isPreview ? 0.55 : 1;
  const uid = `dra_${size}`;
  const scaleCount = 14;
  const sw = Math.max(3, size * 0.04);
  const scales = Array.from({ length: scaleCount }, (_, i) => {
    const arcSpan = (2 * Math.PI) / scaleCount;
    const startA = i * arcSpan - Math.PI / 2;
    const endA = startA + arcSpan * 0.85;
    const sx = C + R * Math.cos(startA);
    const sy = C + R * Math.sin(startA);
    const ex = C + R * Math.cos(endA);
    const ey = C + R * Math.sin(endA);
    const largeArc = arcSpan * 0.85 > Math.PI ? 1 : 0;
    return {
      d: `M ${sx} ${sy} A ${R} ${R} 0 ${largeArc} 1 ${ex} ${ey}`,
      key: i,
    };
  });
  const colors = [
    "#cc2200",
    "#ff4400",
    "#ffd700",
    "#cc2200",
    "#ff6600",
    "#ffaa00",
    "#cc2200",
  ];
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
        opacity: op,
      }}
      aria-hidden="true"
    >
      <defs>
        <filter id={`${uid}g`} x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="1.8" result="b" />
          <feComposite in="SourceGraphic" in2="b" operator="over" />
        </filter>
      </defs>
      {scales.map(({ d, key }) => (
        <path
          key={key}
          d={d}
          fill="none"
          stroke={colors[key % colors.length]}
          strokeWidth={sw}
          strokeLinecap="butt"
          filter={`url(#${uid}g)`}
        >
          <animate
            attributeName="stroke"
            values={`${colors[key % colors.length]};${colors[(key + 2) % colors.length]};${colors[key % colors.length]}`}
            dur={`${1.8 + (key % 4) * 0.3}s`}
            begin={`${(key / scaleCount) * 1.8}s`}
            repeatCount="indefinite"
          />
        </path>
      ))}
      <animateTransform
        attributeName="transform"
        type="rotate"
        from={`0 ${C} ${C}`}
        to={`360 ${C} ${C}`}
        dur="8s"
        repeatCount="indefinite"
      />
    </svg>
  );
}

/* ── 13. Storm Cloud (index 32) ── */
export function FrameStormCloud({
  size = 80,
  isPreview = false,
  isActive: _isActive = false,
}: FrameProps) {
  const bleed = Math.round(size * 0.22);
  const total = outerSize(size, bleed);
  const C = cx(size, bleed);
  const R = ringR(size, bleed);
  const op = isPreview ? 0.55 : 1;
  const uid = `sto_${size}`;
  const streaks = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * 2 * Math.PI;
    const x1 = C + R * Math.cos(a);
    const y1 = C + R * Math.sin(a);
    const span = 0.3 + (i % 3) * 0.1;
    const x2 = C + R * Math.cos(a + span);
    const y2 = C + R * Math.sin(a + span);
    return { x1, y1, x2, y2, delay: (i / 12) * 2.2, key: i };
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
        opacity: op,
      }}
      aria-hidden="true"
    >
      <defs>
        <filter id={`${uid}g`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feComposite in="SourceGraphic" in2="b" operator="over" />
        </filter>
      </defs>
      <circle
        cx={C}
        cy={C}
        r={R}
        fill="none"
        stroke="#334455"
        strokeWidth={Math.max(4, size * 0.055)}
        filter={`url(#${uid}g)`}
        opacity={0.85}
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`0 ${C} ${C}`}
          to={`360 ${C} ${C}`}
          dur="5s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke"
          values="#334455;#445566;#223344;#334455"
          dur="2.5s"
          repeatCount="indefinite"
        />
      </circle>
      {streaks.map(({ x1, y1, x2, y2, delay, key }) => (
        <line
          key={key}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#aabbcc"
          strokeWidth={Math.max(1.5, size * 0.02)}
          strokeLinecap="round"
          filter={`url(#${uid}g)`}
          opacity={0}
        >
          <animate
            attributeName="opacity"
            values="0;0.8;0.5;0"
            keyTimes="0;0.15;0.5;1"
            dur="1.8s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
        </line>
      ))}
    </svg>
  );
}

/* ── 14. Crystal Clear (index 33) ── */
export function FrameCrystalClear({
  size = 80,
  isPreview = false,
  isActive: _isActive = false,
}: FrameProps) {
  const bleed = Math.round(size * 0.2);
  const total = outerSize(size, bleed);
  const C = cx(size, bleed);
  const R = ringR(size, bleed);
  const op = isPreview ? 0.55 : 1;
  const uid = `cry_${size}`;
  const prisms = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * 2 * Math.PI;
    return {
      x: C + R * Math.cos(a),
      y: C + R * Math.sin(a),
      delay: (i / 12) * 3.6,
      key: i,
    };
  });
  const rainbowColors = [
    "#ff0000",
    "#ff8800",
    "#ffff00",
    "#00ff00",
    "#0088ff",
    "#8800ff",
  ];
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
        opacity: op,
      }}
      aria-hidden="true"
    >
      <defs>
        <filter id={`${uid}g`} x="-35%" y="-35%" width="170%" height="170%">
          <feGaussianBlur stdDeviation="1.8" result="b" />
          <feComposite in="SourceGraphic" in2="b" operator="over" />
        </filter>
      </defs>
      <circle
        cx={C}
        cy={C}
        r={R}
        fill="none"
        stroke="#ffffff"
        strokeWidth={Math.max(2, size * 0.028)}
        strokeDasharray={`${R * 0.22} ${R * 0.06}`}
        filter={`url(#${uid}g)`}
        opacity={0.8}
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`0 ${C} ${C}`}
          to={`360 ${C} ${C}`}
          dur="7s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke"
          values="#ffffff;#ffccff;#ccffff;#ffffcc;#ffffff"
          dur="4s"
          repeatCount="indefinite"
        />
      </circle>
      {prisms.map(({ x, y, delay, key }) => (
        <circle
          key={key}
          cx={x}
          cy={y}
          r={Math.max(2, size * 0.028)}
          fill="#ffffff"
          filter={`url(#${uid}g)`}
          opacity={0}
        >
          <animate
            attributeName="opacity"
            values="0;1;0.6;0"
            keyTimes="0;0.2;0.5;1"
            dur="2.8s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="fill"
            values={rainbowColors.concat([rainbowColors[0]]).join(";")}
            dur="2.8s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="r"
            values={`${Math.max(2, size * 0.028)};${Math.max(4, size * 0.055)};0.5`}
            dur="2.8s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </svg>
  );
}

/* ── 15. Matrix Rain (index 34) ── */
export function FrameMatrixRain({
  size = 80,
  isPreview = false,
  isActive: _isActive = false,
}: FrameProps) {
  const bleed = Math.round(size * 0.22);
  const total = outerSize(size, bleed);
  const C = cx(size, bleed);
  const R = ringR(size, bleed);
  const op = isPreview ? 0.55 : 1;
  const uid = `mat_${size}`;
  const drops = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * 2 * Math.PI - Math.PI / 2;
    const x = C + R * Math.cos(a);
    const y = C + R * Math.sin(a);
    const yEnd = y + bleed * 0.9;
    return { x, y, yEnd, delay: (i / 14) * 2.8, key: i };
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
        opacity: op,
      }}
      aria-hidden="true"
    >
      <defs>
        <filter id={`${uid}g`} x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="1.5" result="b" />
          <feComposite in="SourceGraphic" in2="b" operator="over" />
        </filter>
      </defs>
      <circle
        cx={C}
        cy={C}
        r={R}
        fill="none"
        stroke="#00ff44"
        strokeWidth={Math.max(2, size * 0.028)}
        strokeDasharray={`${R * 0.15} ${R * 0.05}`}
        filter={`url(#${uid}g)`}
        opacity={0.75}
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`0 ${C} ${C}`}
          to={`360 ${C} ${C}`}
          dur="3s"
          repeatCount="indefinite"
        />
      </circle>
      {drops.map(({ x, y, yEnd, delay, key }) => (
        <line
          key={key}
          x1={x}
          y1={y}
          x2={x}
          y2={y}
          stroke="#00ff44"
          strokeWidth={Math.max(1.5, size * 0.02)}
          strokeLinecap="round"
          filter={`url(#${uid}g)`}
          opacity={0}
        >
          <animate
            attributeName="opacity"
            values="0;1;0.7;0"
            keyTimes="0;0.2;0.7;1"
            dur="1.8s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="y2"
            values={`${y};${y + bleed * 0.45};${yEnd}`}
            dur="1.8s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="stroke"
            values="#00ff44;#88ffaa;#00cc33;#00ff44"
            dur="1.8s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
        </line>
      ))}
    </svg>
  );
}

/* ── ANIMATED_FRAMES lookup table ── */
export const ANIMATED_FRAMES = [
  {
    index: 20,
    name: "Lightning Strike",
    label: "LIGHTNING",
    price: 150,
    color: "#ffe066",
    Component: FrameLightning,
    description: "Electric sparks orbit your profile",
  },
  {
    index: 21,
    name: "Galaxy Spiral",
    label: "GALAXY",
    price: 150,
    color: "#9933ff",
    Component: FrameGalaxy,
    description: "Stars & nebula rotate in deep space",
  },
  {
    index: 22,
    name: "Blood Drip",
    label: "BLOOD",
    price: 150,
    color: "#cc0000",
    Component: FrameBloodDrip,
    description: "Red drops fall around the ring",
  },
  {
    index: 23,
    name: "Neon Pulse",
    label: "NEON",
    price: 150,
    color: "#ff00ff",
    Component: FrameNeonPulse,
    description: "Color-cycling neon border pulses",
  },
  {
    index: 24,
    name: "Ice Shatter",
    label: "ICE",
    price: 150,
    color: "#aaeeff",
    Component: FrameIceShatter,
    description: "Crystalline shards spin outward",
  },
  {
    index: 25,
    name: "Lava Flow",
    label: "LAVA",
    price: 150,
    color: "#ff4400",
    Component: FrameLavaFlow,
    description: "Molten lava flows around the ring",
  },
  {
    index: 26,
    name: "Sakura Petals",
    label: "SAKURA",
    price: 150,
    color: "#ffaacc",
    Component: FrameSakura,
    description: "Pink petals drift and fall",
  },
  {
    index: 27,
    name: "Shadow Smoke",
    label: "SMOKE",
    price: 150,
    color: "#8833cc",
    Component: FrameShadowSmoke,
    description: "Dark purple smoke swirls mysteriously",
  },
  {
    index: 28,
    name: "Gold Crown",
    label: "CROWN",
    price: 150,
    color: "#ffd700",
    Component: FrameGoldCrown,
    description: "Golden crown sparkles and shines",
  },
  {
    index: 29,
    name: "Cyber Hex",
    label: "CYBER",
    price: 150,
    color: "#00ffcc",
    Component: FrameCyberHex,
    description: "Teal hexagons pulse with energy",
  },
  {
    index: 30,
    name: "Void Portal",
    label: "VOID",
    price: 150,
    color: "#4400cc",
    Component: FrameVoidPortal,
    description: "Deep vortex pulls you in",
  },
  {
    index: 31,
    name: "Dragon Scale",
    label: "DRAGON",
    price: 150,
    color: "#cc2200",
    Component: FrameDragonScale,
    description: "Red & gold scales gleam",
  },
  {
    index: 32,
    name: "Storm Cloud",
    label: "STORM",
    price: 150,
    color: "#334455",
    Component: FrameStormCloud,
    description: "Dark swirling storm rumbles",
  },
  {
    index: 33,
    name: "Crystal Clear",
    label: "CRYSTAL",
    price: 150,
    color: "#ccddff",
    Component: FrameCrystalClear,
    description: "Rainbow prism shimmer effect",
  },
  {
    index: 34,
    name: "Matrix Rain",
    label: "MATRIX",
    price: 150,
    color: "#00ff44",
    Component: FrameMatrixRain,
    description: "Green digital rain falls",
  },
] as const;

export type AnimatedFrameEntry = (typeof ANIMATED_FRAMES)[number];

export function getAnimatedFrame(index: number): AnimatedFrameEntry | null {
  return (
    (ANIMATED_FRAMES.find((f) => f.index === index) as
      | AnimatedFrameEntry
      | undefined) ?? null
  );
}

export function AnimatedFrameOverlay({
  frameIndex,
  size = 80,
  isActive = false,
}: { frameIndex: number; size?: number; isActive?: boolean }) {
  const frame = getAnimatedFrame(frameIndex);
  if (!frame) return null;
  const { Component } = frame;
  return <Component size={size} isPreview={false} isActive={isActive} />;
}
