import { FireAnimation } from "@/components/FireAnimation";
import { Link } from "@tanstack/react-router";
import {
  Apple,
  ArrowDown,
  Globe,
  MonitorDown,
  Shield,
  Smartphone,
  Sword,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

/* ─── Animated Download Button ─────────────────────────────── */
function DownloadButton({
  label,
  sub,
  icon,
  ocid,
  color,
}: {
  label: string;
  sub: string;
  icon: React.ReactNode;
  ocid: string;
  color: string;
}) {
  return (
    <button
      type="button"
      data-ocid={ocid}
      onClick={() =>
        toast.info("Coming Soon!", {
          description:
            "The Legend X Arena app is launching shortly. Stay tuned!",
        })
      }
      className="relative group flex items-center gap-4 px-7 py-4 rounded-2xl transition-all duration-300 hover:scale-[1.05] hover:-translate-y-1"
      style={{
        background: `linear-gradient(135deg, ${color}22, ${color}10)`,
        border: `1.5px solid ${color}55`,
        minWidth: "200px",
        boxShadow: `0 4px 30px ${color}25`,
      }}
    >
      {/* Sonar rings */}
      <span
        aria-hidden="true"
        className="animate-sonar-1 absolute inset-0 rounded-2xl"
        style={{ border: `1px solid ${color}30` }}
      />
      <span
        aria-hidden="true"
        className="animate-sonar-2 absolute inset-0 rounded-2xl"
        style={{ border: `1px solid ${color}20` }}
      />
      <span
        aria-hidden="true"
        className="animate-sonar-3 absolute inset-0 rounded-2xl"
        style={{ border: `1px solid ${color}15` }}
      />

      {/* Icon */}
      <div
        className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl relative z-10"
        style={{ background: `${color}22`, color }}
      >
        {icon}
      </div>

      {/* Text */}
      <div className="text-left relative z-10">
        <div className="text-xs font-body text-muted-foreground uppercase tracking-wider">
          {sub}
        </div>
        <div
          className="font-display font-black text-base tracking-wide"
          style={{ color }}
        >
          {label}
        </div>
      </div>

      {/* Bouncing arrow */}
      <div
        className="animate-download-bounce relative z-10 ml-auto"
        aria-hidden="true"
      >
        <ArrowDown className="w-5 h-5" style={{ color }} />
      </div>
    </button>
  );
}

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

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt.current) {
      await deferredPrompt.current.prompt();
      deferredPrompt.current = null;
    } else {
      toast.info("Open in Chrome on Android, then tap 'Download App'", {
        description:
          "Open this page in Chrome on Android, then tap 'Download App' button to install directly to your home screen.",
      });
    }
  };

  const color = "#4285F4";

  return (
    <button
      type="button"
      data-ocid="landing.install_pwa_button"
      onClick={handleInstall}
      className="relative group flex items-center gap-4 px-7 py-4 rounded-2xl transition-all duration-300 hover:scale-[1.05] hover:-translate-y-1"
      style={{
        background: `linear-gradient(135deg, ${color}22, ${color}10)`,
        border: `1.5px solid ${color}55`,
        minWidth: "200px",
        boxShadow: `0 4px 30px ${color}25`,
      }}
    >
      {/* Sonar rings */}
      <span
        aria-hidden="true"
        className="animate-sonar-1 absolute inset-0 rounded-2xl"
        style={{ border: `1px solid ${color}30` }}
      />
      <span
        aria-hidden="true"
        className="animate-sonar-2 absolute inset-0 rounded-2xl"
        style={{ border: `1px solid ${color}20` }}
      />
      <span
        aria-hidden="true"
        className="animate-sonar-3 absolute inset-0 rounded-2xl"
        style={{ border: `1px solid ${color}15` }}
      />

      {/* Icon */}
      <div
        className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl relative z-10"
        style={{ background: `${color}22`, color }}
      >
        <MonitorDown className="w-6 h-6" />
      </div>

      {/* Text */}
      <div className="text-left relative z-10">
        <div className="text-xs font-body text-muted-foreground uppercase tracking-wider">
          Install the App
        </div>
        <div
          className="font-display font-black text-base tracking-wide"
          style={{ color }}
        >
          Download App
        </div>
      </div>

      {/* Bouncing arrow */}
      <div
        className="animate-download-bounce relative z-10 ml-auto"
        aria-hidden="true"
      >
        <ArrowDown className="w-5 h-5" style={{ color }} />
      </div>
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
          <DownloadButton
            ocid="landing.download_appstore_button"
            label="App Store"
            sub="Available on"
            icon={<Apple className="w-6 h-6" />}
            color="#ffffff"
          />
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
                  ₡{gm.fee} LC Entry
                </div>
              </div>
            ))}
          </div>

          {/* Second CTA */}
          <div className="text-center mt-12 flex flex-col items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                type="button"
                onClick={() =>
                  toast.info("Coming Soon!", {
                    description:
                      "Download the app to access the full experience.",
                  })
                }
                className="font-display font-black text-sm tracking-widest uppercase px-8 py-3.5 rounded-xl transition-all duration-200 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #cc1100, #ff4400)",
                  color: "#fff",
                  boxShadow: "0 0 30px rgba(255,34,0,0.4)",
                  animation: "pulseGlow 2s ease-in-out infinite",
                }}
              >
                ↓ DOWNLOAD NOW
              </button>
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
