import { FireAnimation } from "@/components/FireAnimation";
import { Link } from "@tanstack/react-router";
import { ChevronUp, Globe, Shield, Sword } from "lucide-react";
import { useEffect, useState } from "react";

/* ─── Feature Card ──────────────────────────────────────────── */
function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div
      className="rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 relative overflow-hidden"
      style={{
        background: "rgba(13,13,26,0.8)",
        border: `1px solid ${color}30`,
        boxShadow: `0 4px 30px ${color}10`,
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }}
      />
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
        style={{ background: `${color}18`, color }}
      >
        {icon}
      </div>
      <h3 className="font-display font-bold text-lg text-foreground mb-2">
        {title}
      </h3>
      <p className="text-sm font-body text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

/* ─── Big Enter Button ──────────────────────────────────────── */
function EnterButton() {
  return (
    <Link to="/auth" data-ocid="landing.enter_button">
      <button
        type="button"
        className="relative group flex items-center justify-center transition-all duration-300 hover:scale-[1.06] hover:-translate-y-1 active:scale-[0.97]"
        style={{
          background: "linear-gradient(135deg, #cc1100, #ff4400, #ff6600)",
          border: "2px solid rgba(255,215,0,0.6)",
          borderRadius: "20px",
          minWidth: "260px",
          padding: "20px 48px",
          boxShadow:
            "0 0 40px rgba(255,34,0,0.5), 0 0 80px rgba(255,100,0,0.2), 0 8px 32px rgba(0,0,0,0.6)",
        }}
      >
        <span
          className="font-display font-black uppercase tracking-[0.2em]"
          style={{
            color: "#fff",
            fontSize: "clamp(1.5rem, 4vw, 2rem)",
            letterSpacing: "0.2em",
          }}
        >
          ENTER
        </span>
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-[18px] pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,150,0,0.18), transparent)",
          }}
        />
      </button>
    </Link>
  );
}

/* ─── Scroll To Top Button ───────────────────────────────────── */
function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      style={{
        position: "fixed",
        bottom: "28px",
        right: "20px",
        zIndex: 9999,
        width: "48px",
        height: "48px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #cc1100, #ff4400)",
        border: "2px solid rgba(255,215,0,0.6)",
        boxShadow: "0 0 18px rgba(255,34,0,0.55), 0 4px 16px rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "opacity 0.25s ease, transform 0.25s ease",
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translateY(0) scale(1)"
          : "translateY(20px) scale(0.85)",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <ChevronUp
        style={{ color: "#fff", width: "22px", height: "22px", strokeWidth: 3 }}
      />
    </button>
  );
}

/* ─── Landing Page ──────────────────────────────────────────── */
export function LandingPage() {
  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: "#0a0a0f" }}
    >
      {/* Fire edge animations */}
      <FireAnimation side="left" intensity="high" />
      <FireAnimation side="right" intensity="high" />

      {/* Radial background glow */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(ellipse 50% 60% at 5% 50%, rgba(255,34,0,0.07) 0%, transparent 70%), radial-gradient(ellipse 50% 60% at 95% 50%, rgba(0,102,255,0.07) 0%, transparent 70%)",
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

      {/* ── TOP NAV ── */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-4">
        <div className="font-display font-black text-lg text-foreground flex items-center gap-0">
          <span style={{ color: "#ff2200", textShadow: "0 0 6px #ff2200" }}>
            LEGEND
          </span>
          <span
            style={{
              color: "#ffd700",
              fontSize: "1.25em",
              margin: "0 0.15em",
              textShadow: "0 0 6px #ffd700",
            }}
          >
            X
          </span>
          <span style={{ color: "#0066ff", textShadow: "0 0 6px #0066ff" }}>
            ARENA
          </span>
        </div>
        <Link to="/auth">
          <button
            type="button"
            className="font-display font-bold text-xs tracking-wider uppercase px-4 py-2 rounded-lg transition-all duration-200 hover:opacity-80"
            style={{
              background: "rgba(255,34,0,0.15)",
              border: "1px solid rgba(255,34,0,0.4)",
              color: "#ff4422",
            }}
          >
            ENTER
          </button>
        </Link>
      </nav>

      {/* ── HERO ── */}
      <section
        className="relative z-10 flex flex-col items-center justify-center px-4 py-16 sm:py-20"
        aria-label="Hero"
      >
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-body uppercase tracking-widest"
          style={{
            background: "rgba(255,215,0,0.08)",
            border: "1px solid rgba(255,215,0,0.25)",
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
              display: "inline-block",
            }}
          />
          The #1 Free Fire Esports Platform
        </div>

        {/* Main title */}
        <h1
          className="font-display font-black leading-none mb-4 text-center"
          style={{
            fontSize: "clamp(3.5rem, 10vw, 7rem)",
            letterSpacing: "-0.02em",
          }}
        >
          <span
            style={{
              display: "block",
              color: "#ff2200",
              textShadow: "0 0 8px #ff2200",
            }}
          >
            LEGEND
          </span>
          <span
            style={{
              display: "block",
              fontSize: "0.55em",
              letterSpacing: "0.25em",
              color: "#ffd700",
              lineHeight: 1.1,
              textShadow: "0 0 8px #ffd700",
            }}
          >
            ✕
          </span>
          <span
            style={{
              display: "block",
              color: "#0066ff",
              textShadow: "0 0 8px #0066ff",
            }}
          >
            ARENA
          </span>
        </h1>

        {/* Tagline */}
        <p
          className="font-display font-bold uppercase tracking-[0.4em] mb-4 text-center"
          style={{
            fontSize: "clamp(0.75rem, 2vw, 1.1rem)",
            color: "rgba(255,255,255,0.65)",
          }}
        >
          DOMINATE THE ARENA
        </p>

        <p
          className="font-body text-center mb-12 max-w-sm"
          style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.95rem" }}
        >
          Real tournaments. Real coins. Real glory.
        </p>

        {/* ── BIG ENTER BUTTON ── */}
        <EnterButton />
      </section>

      {/* ── FEATURE HIGHLIGHTS ── */}
      <section className="relative z-10 py-16 px-4" aria-label="Features">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p
              className="text-xs font-body uppercase tracking-[0.4em] mb-3"
              style={{ color: "#ff2200" }}
            >
              Everything you need
            </p>
            <h2 className="font-display font-black text-3xl sm:text-4xl uppercase text-foreground">
              BUILT FOR CHAMPIONS
            </h2>
            <div
              className="h-0.5 w-20 mx-auto mt-4 rounded-full"
              style={{
                background: "linear-gradient(90deg, #ff2200, #ffd700, #0066ff)",
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="5-Tab Arena Dashboard"
              description="Matches, Ranking, PLAY, Deposit, and Profile — everything in one slick bottom nav built for mobile-first gaming."
              color="#0066ff"
            />
            <FeatureCard
              icon={<Sword className="w-6 h-6" />}
              title="Legend Coins Wallet"
              description="Earn, wager, and manage your Legend Coins. Track every deposit and tournament entry with full transaction history."
              color="#ffd700"
            />
            <FeatureCard
              icon={<Globe className="w-6 h-6" />}
              title="Global Leaderboard"
              description="See where you rank against the best Free Fire warriors worldwide. Top 3 earn special champion medals."
              color="#ff2200"
            />
          </div>
        </div>
      </section>

      {/* ── GAME MODES TEASER ── */}
      <section
        className="relative z-10 py-16 px-4"
        aria-label="Game modes preview"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p
              className="text-xs font-body uppercase tracking-[0.4em] mb-3"
              style={{ color: "#0066ff" }}
            >
              Pick your battleground
            </p>
            <h2 className="font-display font-black text-3xl sm:text-4xl uppercase text-foreground">
              3 GAME MODES
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: <Sword className="w-5 h-5" />,
                title: "Lone Wolf",
                mode: "1v1",
                fee: 50,
                color: "#ff2200",
              },
              {
                icon: <Shield className="w-5 h-5" />,
                title: "CS Mod",
                mode: "4v4",
                fee: 100,
                color: "#0066ff",
              },
              {
                icon: <Globe className="w-5 h-5" />,
                title: "BR Mod",
                mode: "Full Map",
                fee: 200,
                color: "#ffd700",
              },
            ].map((gm) => (
              <div
                key={gm.title}
                className="rounded-xl p-5 text-center transition-all duration-300 hover:scale-[1.03]"
                style={{
                  background: "rgba(13,13,26,0.8)",
                  border: `1px solid ${gm.color}33`,
                  backdropFilter: "blur(10px)",
                }}
              >
                <div
                  className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3"
                  style={{ background: `${gm.color}20`, color: gm.color }}
                >
                  {gm.icon}
                </div>
                <div
                  className="text-xs font-body uppercase tracking-widest mb-1"
                  style={{ color: gm.color }}
                >
                  {gm.mode}
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">
                  {gm.title}
                </h3>
                <div
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-display font-bold"
                  style={{
                    background: `${gm.color}15`,
                    border: `1px solid ${gm.color}40`,
                    color: gm.color,
                  }}
                >
                  L{gm.fee} LC Entry
                </div>
              </div>
            ))}
          </div>

          {/* Second CTA */}
          <div className="text-center mt-12">
            <EnterButton />
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

      {/* ── SCROLL TO TOP BUTTON ── */}
      <ScrollToTopButton />
    </div>
  );
}
