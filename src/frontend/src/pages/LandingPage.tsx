import { FireAnimation } from "@/components/FireAnimation";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Globe, Shield, Sword, X } from "lucide-react";
import { useState } from "react";

function TrailerModal({ onClose }: { onClose: () => void }) {
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop dismiss with button fallback
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0, 0, 0, 0.85)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: stop propagation only */}
      <div
        className="relative rounded-2xl p-8 max-w-md w-full mx-4 text-center"
        style={{
          background: "linear-gradient(135deg, #0d0d1a, #111122)",
          border: "1px solid rgba(255, 34, 0, 0.4)",
          boxShadow: "0 0 60px rgba(255, 34, 0, 0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="text-5xl mb-4">🎬</div>
        <h3 className="font-display font-bold text-2xl text-foreground mb-2">
          COMING SOON
        </h3>
        <p className="font-body text-muted-foreground text-sm">
          The Legend X Arena trailer is currently in production. Stay tuned for
          the ultimate esports experience.
        </p>
        <div
          className="mt-4 h-1 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, #ff2200, #ff6600, #ffd700, #0066ff, #00ccff)",
          }}
        />
      </div>
    </div>
  );
}

const GAME_MODES = [
  {
    icon: <Sword className="w-6 h-6" />,
    title: "Lone Wolf",
    mode: "1v1",
    description: "Solo Combat — Prove your supremacy",
    fee: 50,
    color: "#ff2200",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "CS Mod",
    mode: "4v4",
    description: "Team Clash — Lead your squad",
    fee: 100,
    color: "#0066ff",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "BR Mod",
    mode: "Full Map",
    description: "50 Players, One Champion",
    fee: 200,
    color: "#ffd700",
  },
];

export function LandingPage() {
  const [showTrailer, setShowTrailer] = useState(false);

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: "#0a0a0f" }}
    >
      {/* Fire edge animations */}
      <FireAnimation side="left" intensity="high" />
      <FireAnimation side="right" intensity="high" />

      {/* Radial background gradients */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(ellipse 40% 60% at 5% 50%, rgba(255,34,0,0.08) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 95% 50%, rgba(0,102,255,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Scanline overlay */}
      <div
        aria-hidden="true"
        className="arena-scanline"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* ── HERO ── */}
      <section
        className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20"
        aria-label="Hero"
      >
        {/* Nav */}
        <nav className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4">
          <div className="font-display font-black text-lg tracking-widest text-foreground">
            <span style={{ color: "#ff2200" }}>LEGEND</span>
            <span style={{ color: "#ffd700" }}> X </span>
            <span style={{ color: "#0066ff" }}>ARENA</span>
          </div>
          <Link to="/auth">
            <Button
              size="sm"
              className="font-display font-bold text-xs tracking-wider uppercase"
              style={{
                background: "rgba(255, 34, 0, 0.15)",
                border: "1px solid rgba(255, 34, 0, 0.4)",
                color: "#ff4422",
              }}
            >
              ENTER
            </Button>
          </Link>
        </nav>

        {/* Hero content */}
        <div className="text-center max-w-4xl mx-auto animate-fade-up">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-body uppercase tracking-widest"
            style={{
              background: "rgba(255, 215, 0, 0.08)",
              border: "1px solid rgba(255, 215, 0, 0.25)",
              color: "#ffd700",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#ffd700",
                boxShadow: "0 0 6px #ffd700",
              }}
            />
            Free Fire Esports Platform
          </div>

          {/* Main title */}
          <h1
            className="font-display font-black leading-none mb-4 animate-text-glow"
            style={{
              fontSize: "clamp(3.5rem, 10vw, 8rem)",
              letterSpacing: "-0.02em",
            }}
          >
            <span style={{ display: "block", color: "#ff2200" }}>LEGEND</span>
            <span
              style={{
                display: "block",
                fontSize: "0.45em",
                letterSpacing: "0.3em",
                color: "#ffd700",
              }}
            >
              ✕
            </span>
            <span style={{ display: "block", color: "#0066ff" }}>ARENA</span>
          </h1>

          {/* Tagline */}
          <p
            className="font-display font-bold uppercase tracking-[0.4em] mb-12"
            style={{
              fontSize: "clamp(0.9rem, 2.5vw, 1.4rem)",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            DOMINATE THE ARENA
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth">
              <button
                type="button"
                data-ocid="nav.enter_arena_button"
                className="font-display font-black text-base tracking-widest uppercase px-10 py-4 rounded-xl transition-all duration-200 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #cc1100, #ff4400)",
                  color: "#fff",
                  animation: "pulseGlow 2s ease-in-out infinite",
                  border: "1px solid rgba(255, 100, 0, 0.4)",
                  minWidth: "200px",
                }}
              >
                ENTER ARENA
              </button>
            </Link>

            <button
              type="button"
              data-ocid="nav.watch_trailer_button"
              onClick={() => setShowTrailer(true)}
              className="font-display font-bold text-base tracking-widest uppercase px-10 py-4 rounded-xl transition-all duration-200 hover:scale-105"
              style={{
                background: "transparent",
                border: "2px solid rgba(0, 102, 255, 0.5)",
                color: "#00ccff",
                minWidth: "200px",
                boxShadow: "0 0 20px rgba(0, 102, 255, 0.15)",
              }}
            >
              WATCH TRAILER
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-float"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          <span className="text-xs font-body uppercase tracking-widest">
            Scroll
          </span>
          <ChevronDown className="w-4 h-4" />
        </div>
      </section>

      {/* ── GAME MODES SECTION ── */}
      <section
        className="relative z-10 py-24 px-4"
        aria-label="Game modes preview"
      >
        <div className="max-w-5xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <p
              className="text-xs font-body uppercase tracking-[0.4em] mb-3"
              style={{ color: "#ff2200" }}
            >
              Choose Your Battleground
            </p>
            <h2
              className="font-display font-black text-4xl sm:text-5xl uppercase"
              style={{ color: "#fff" }}
            >
              GAME MODES
            </h2>
            <div
              className="h-0.5 w-24 mx-auto mt-4 rounded-full"
              style={{
                background: "linear-gradient(90deg, #ff2200, #ffd700, #0066ff)",
              }}
            />
          </div>

          {/* Mode cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {GAME_MODES.map((gm) => (
              <div
                key={gm.title}
                className="rounded-xl p-6 text-center transition-all duration-300 hover:scale-[1.03]"
                style={{
                  background: "rgba(13, 13, 26, 0.8)",
                  border: `1px solid ${gm.color}33`,
                  boxShadow: `0 4px 30px ${gm.color}15`,
                  backdropFilter: "blur(10px)",
                }}
              >
                <div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4"
                  style={{
                    background: `${gm.color}20`,
                    color: gm.color,
                  }}
                >
                  {gm.icon}
                </div>
                <div
                  className="text-xs font-body uppercase tracking-widest mb-1"
                  style={{ color: gm.color }}
                >
                  {gm.mode}
                </div>
                <h3 className="font-display font-bold text-xl text-foreground mb-2">
                  {gm.title}
                </h3>
                <p className="text-sm font-body text-muted-foreground mb-4">
                  {gm.description}
                </p>
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-display font-bold"
                  style={{
                    background: `${gm.color}15`,
                    border: `1px solid ${gm.color}40`,
                    color: gm.color,
                  }}
                >
                  <span
                    style={{
                      width: "14px",
                      height: "14px",
                      borderRadius: "50%",
                      background:
                        "radial-gradient(circle at 35% 35%, #ffe066, #ffd700, #b8860b)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "8px",
                      color: "#7a5c00",
                    }}
                  >
                    ₡
                  </span>
                  {gm.fee} LC Entry
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-14">
            <Link to="/auth">
              <button
                type="button"
                className="font-display font-bold text-sm tracking-widest uppercase px-8 py-3 rounded-xl transition-all duration-200 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #ff2200, #ff6600)",
                  color: "#fff",
                  boxShadow: "0 0 30px rgba(255, 34, 0, 0.3)",
                }}
              >
                START COMPETING →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="relative z-10 py-8 text-center border-t"
        style={{
          borderColor: "rgba(255,255,255,0.06)",
          color: "rgba(255,255,255,0.3)",
        }}
      >
        <p className="text-xs font-body">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
            style={{ color: "#ffd700" }}
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      {/* Trailer modal */}
      {showTrailer && <TrailerModal onClose={() => setShowTrailer(false)} />}
    </div>
  );
}
