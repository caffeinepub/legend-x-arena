/**
 * RifleAnimation — two AR/AK rifles crossing in an X pattern
 * Pure SVG + CSS keyframe animation, no external deps.
 * Designed to fit inside a ~68px circular button.
 */
export function RifleAnimation() {
  return (
    <div
      className="animate-rifle-glow"
      style={{ width: 48, height: 48, position: "relative", flexShrink: 0 }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%", overflow: "visible" }}
        role="img"
        aria-label="Two crossing rifles"
      >
        {/* ── RIFLE 1 (top-left → bottom-right, rotated +42°) ── */}
        <g transform="rotate(42, 24, 24)">
          {/* Barrel */}
          <rect x="6" y="22" width="22" height="3" rx="1" fill="#888" />
          {/* Front sight */}
          <rect x="8" y="20.5" width="1.5" height="2" rx="0.5" fill="#aaa" />
          {/* Body / receiver */}
          <rect x="28" y="20.5" width="11" height="6.5" rx="1.2" fill="#555" />
          {/* Magazine */}
          <rect x="31" y="27" width="3" height="5" rx="1" fill="#444" />
          {/* Trigger guard */}
          <path
            d="M29 24 Q29.5 28 31 27.5"
            stroke="#666"
            strokeWidth="1.2"
            fill="none"
          />
          {/* Stock */}
          <path
            d="M39 21 L44 20 L44 27 L39 27 Z"
            fill="#8B5E3C"
            stroke="#6B4728"
            strokeWidth="0.5"
          />
          {/* Scope */}
          <rect x="30" y="19" width="6" height="2" rx="1" fill="#333" />
          <rect x="32" y="17.5" width="2" height="2" rx="0.5" fill="#222" />
          {/* Accent stripe */}
          <rect
            x="28"
            y="22.5"
            width="11"
            height="1"
            rx="0.5"
            fill="#ff4400"
            opacity="0.7"
          />
          {/* Muzzle flash 1 */}
          <g className="animate-muzzle">
            <ellipse
              cx="5.5"
              cy="23.5"
              rx="3.5"
              ry="2.2"
              fill="#ffcc00"
              opacity="0.9"
            />
            <ellipse
              cx="4"
              cy="23.5"
              rx="2"
              ry="1.2"
              fill="#fff"
              opacity="0.8"
            />
            <line
              x1="2"
              y1="23.5"
              x2="-1"
              y2="23.5"
              stroke="#ff6600"
              strokeWidth="1.2"
            />
            <line
              x1="3"
              y1="21.5"
              x2="1"
              y2="19.5"
              stroke="#ff6600"
              strokeWidth="0.8"
            />
            <line
              x1="3"
              y1="25.5"
              x2="1"
              y2="27.5"
              stroke="#ff6600"
              strokeWidth="0.8"
            />
          </g>
        </g>

        {/* ── RIFLE 2 (top-right → bottom-left, rotated -42°) ── */}
        <g transform="rotate(-42, 24, 24)">
          {/* Barrel */}
          <rect x="20" y="22" width="22" height="3" rx="1" fill="#777" />
          {/* Front sight */}
          <rect x="38.5" y="20.5" width="1.5" height="2" rx="0.5" fill="#999" />
          {/* Body / receiver */}
          <rect
            x="9"
            y="20.5"
            width="11"
            height="6.5"
            rx="1.2"
            fill="#4a4a4a"
          />
          {/* Magazine */}
          <rect x="14" y="27" width="3" height="5" rx="1" fill="#3a3a3a" />
          {/* Trigger guard */}
          <path
            d="M19 24 Q18.5 28 17 27.5"
            stroke="#666"
            strokeWidth="1.2"
            fill="none"
          />
          {/* Stock */}
          <path
            d="M9 21 L4 20 L4 27 L9 27 Z"
            fill="#7B4E2C"
            stroke="#5B3718"
            strokeWidth="0.5"
          />
          {/* Scope */}
          <rect x="12" y="19" width="6" height="2" rx="1" fill="#2a2a2a" />
          <rect x="14" y="17.5" width="2" height="2" rx="0.5" fill="#1a1a1a" />
          {/* Accent stripe */}
          <rect
            x="9"
            y="22.5"
            width="11"
            height="1"
            rx="0.5"
            fill="#0066ff"
            opacity="0.7"
          />
          {/* Muzzle flash 2 */}
          <g className="animate-muzzle-alt">
            <ellipse
              cx="42.5"
              cy="23.5"
              rx="3.5"
              ry="2.2"
              fill="#ffcc00"
              opacity="0.9"
            />
            <ellipse
              cx="44"
              cy="23.5"
              rx="2"
              ry="1.2"
              fill="#fff"
              opacity="0.8"
            />
            <line
              x1="46"
              y1="23.5"
              x2="49"
              y2="23.5"
              stroke="#ff6600"
              strokeWidth="1.2"
            />
            <line
              x1="45"
              y1="21.5"
              x2="47"
              y2="19.5"
              stroke="#ff6600"
              strokeWidth="0.8"
            />
            <line
              x1="45"
              y1="25.5"
              x2="47"
              y2="27.5"
              stroke="#ff6600"
              strokeWidth="0.8"
            />
          </g>
        </g>

        {/* Center crosshair dot */}
        <circle cx="24" cy="24" r="2.5" fill="#ffd700" opacity="0.9" />
        <circle cx="24" cy="24" r="1.2" fill="#fff" opacity="0.8" />
      </svg>
    </div>
  );
}
