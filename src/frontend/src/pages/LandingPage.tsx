import { FireAnimation } from "@/components/FireAnimation";
import { Link } from "@tanstack/react-router";
import {
  Apple,
  ArrowDown,
  Globe,
  Shield,
  Smartphone,
  Sword,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

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

/* ─── PWA Install Button ────────────────────────────────────── */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function PWAInstallButton() {
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const [isGlowing, setIsGlowing] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
    };
    window.addEventListener("beforeinstallprompt", handler);
    // Start glow pulse
    const interval = setInterval(() => setIsGlowing((g) => !g), 1800);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearInterval(interval);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt.current) {
      await deferredPrompt.current.prompt();
      deferredPrompt.current = null;
    }
    // If no prompt available, do nothing -- the browser will show its own UI
    // or the user is already on a device that can't install PWAs this way
  };

  const colorB = "#ffd700";

  return (
    <button
      type="button"
      data-ocid="landing.install_pwa_button"
      onClick={handleInstall}
      className="relative group flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.06] hover:-translate-y-1 active:scale-[0.97]"
      style={{
        background: "linear-gradient(135deg, #cc1100, #ff4400)",
        border: "2px solid rgba(255,215,0,0.5)",
        borderRadius: "16px",
        minWidth: "220px",
        padding: "14px 28px",
        boxShadow: isGlowing
          ? "0 0 32px rgba(255,34,0,0.6), 0 0 64px rgba(255,150,0,0.3), 0 4px 20px rgba(0,0,0,0.5)"
          : "0 0 16px rgba(255,34,0,0.35), 0 4px 20px rgba(0,0,0,0.4)",
        transition: "box-shadow 1.8s ease-in-out, transform 0.2s",
      }}
    >
      {/* Main label */}
      <div className="flex flex-col items-start relative z-10">
        <span
          className="font-display font-black text-lg tracking-widest uppercase"
          style={{ color: "#fff", letterSpacing: "0.15em", lineHeight: 1.1 }}
        >
          Download App
        </span>
        <span
          className="font-body text-xs uppercase tracking-wider mt-0.5"
          style={{ color: "rgba(255,215,0,0.8)" }}
        >
          Free · Legend X Arena
        </span>
      </div>

      {/* Bouncing arrow */}
      <ArrowDown
        className="w-5 h-5 relative z-10 ml-1 animate-download-bounce flex-shrink-0"
        style={{ color: colorB }}
        aria-hidden="true"
      />

      {/* Glow pulse overlay */}
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,100,0,0.15), transparent)",
          animation: "pulseGlow 2s ease-in-out infinite",
        }}
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

      {/* ── STICKY DOWNLOAD BANNER ── */}
      <div
        className="sticky top-0 z-30 w-full py-3 px-4 text-center"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,34,0,0.18), rgba(0,102,255,0.18))",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid",
          borderImageSlice: 1,
          borderImageSource:
            "linear-gradient(90deg, #ff2200, #ffd700, #0066ff)",
        }}
      >
        <div className="flex items-center justify-center gap-3">
          <Smartphone
            className="w-4 h-4 flex-shrink-0"
            style={{ color: "#ffd700" }}
          />
          <p className="font-display font-black text-sm sm:text-base uppercase tracking-[0.12em] text-foreground">
            Download the App to Continue
          </p>
          <Smartphone
            className="w-4 h-4 flex-shrink-0"
            style={{ color: "#ffd700" }}
          />
        </div>
      </div>

      {/* ── TOP NAV ── */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-4">
        <div className="font-display font-black text-lg text-foreground flex items-center gap-0">
          <span className="animate-legend-flame" style={{ color: "#ff2200" }}>
            LEGEND
          </span>
          <span
            className="animate-x-beat"
            style={{ color: "#ffd700", fontSize: "1.25em", margin: "0 0.15em" }}
          >
            X
          </span>
          <span className="animate-arena-electric" style={{ color: "#0066ff" }}>
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
            className="animate-legend-flame"
            style={{ display: "block", color: "#ff2200" }}
          >
            LEGEND
          </span>
          <span
            className="animate-x-beat"
            style={{
              display: "block",
              fontSize: "0.55em",
              letterSpacing: "0.25em",
              color: "#ffd700",
              lineHeight: 1.1,
            }}
          >
            ✕
          </span>
          <span
            className="animate-arena-electric"
            style={{ display: "block", color: "#0066ff" }}
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
          Compete in real Free Fire tournaments, earn Legend Coins, and climb
          the global leaderboard.
        </p>

        {/* ── ANIMATED DOWNLOAD BUTTONS ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8 w-full max-w-sm sm:max-w-none sm:w-auto">
          {/* App Store button */}
          <a
            href="https://apps.apple.com"
            target="_blank"
            rel="noopener noreferrer"
            data-ocid="landing.download_appstore_button"
            className="relative group flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.05] hover:-translate-y-1 active:scale-[0.97] no-underline"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
              border: "1.5px solid rgba(255,255,255,0.3)",
              borderRadius: "16px",
              minWidth: "200px",
              padding: "14px 28px",
              boxShadow: "0 4px 24px rgba(255,255,255,0.08)",
              animation: "appStoreGlow 3s ease-in-out infinite",
            }}
          >
            <Apple
              className="w-7 h-7 flex-shrink-0"
              style={{ color: "#fff" }}
            />
            <div className="flex flex-col items-start">
              <span
                className="font-body text-xs uppercase tracking-wider"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                Download on the
              </span>
              <span
                className="font-display font-black text-base tracking-wide"
                style={{ color: "#fff" }}
              >
                App Store
              </span>
            </div>
          </a>
          <PWAInstallButton />
        </div>

        {/* Continue on web link */}
        <Link
          to="/auth"
          data-ocid="landing.continue_web_link"
          className="font-body text-xs transition-colors hover:underline"
          style={{ color: "rgba(255,255,255,0.28)" }}
        >
          or continue with limited access on web →
        </Link>
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
          <div className="text-center mt-12 flex flex-col items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <PWAInstallButton />
            </div>
            <Link
              to="/auth"
              data-ocid="landing.continue_web_link"
              className="font-body text-xs transition-colors hover:underline"
              style={{ color: "rgba(255,255,255,0.25)" }}
            >
              or continue with limited access on web →
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
    </div>
  );
}
