import { GameMode, type Match, Result } from "@/backend.d";
import { CoinShower } from "@/components/CoinShower";
import { FireAnimation } from "@/components/FireAnimation";
import { GameModeCard } from "@/components/GameModeCard";
import { WalletDisplay } from "@/components/WalletDisplay";
import { useActor } from "@/hooks/useActor";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Clock, Globe, LogOut, Shield, Sword, Trophy } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

function formatDate(ts: bigint): string {
  try {
    const ms = Number(ts) / 1_000_000;
    return new Date(ms).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function MatchHistoryRow({
  match,
  index,
}: {
  match: Match;
  index: number;
}) {
  const modeLabel =
    match.mode === GameMode.loneWolf
      ? "Lone Wolf"
      : match.mode === GameMode.csMod
        ? "CS Mod"
        : "BR Mod";

  const resultColor =
    match.result === Result.win
      ? "#22cc66"
      : match.result === Result.loss
        ? "#ff4422"
        : "#ffd700";

  return (
    <div
      data-ocid={`dashboard.match.item.${index}`}
      className="flex items-center justify-between py-3 px-4 rounded-lg"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center gap-3">
        <Trophy
          className="w-4 h-4 flex-shrink-0"
          style={{ color: resultColor }}
        />
        <div>
          <div className="text-sm font-display font-bold text-foreground">
            {modeLabel}
          </div>
          <div className="text-xs font-body text-muted-foreground">
            {formatDate(match.date)}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span
          className="text-xs font-display font-bold uppercase px-2 py-0.5 rounded"
          style={{
            background: `${resultColor}20`,
            color: resultColor,
            border: `1px solid ${resultColor}40`,
          }}
        >
          {match.result}
        </span>
        <span
          className="text-xs font-display font-bold tabular-nums"
          style={{ color: "#ffd700" }}
        >
          ₡{Number(match.coinsWagered)}
        </span>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { legendId, role } = useAuthStore();
  const logout = useAuthStore((s) => s.logout);
  const { actor, isFetching } = useActor();
  const [joiningMode, setJoiningMode] = useState<string | null>(null);
  const [showCoinShower, setShowCoinShower] = useState(false);

  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ["userProfile", legendId],
    queryFn: async () => {
      if (!actor || !legendId) return null;
      return actor.getUserByLegendId(legendId);
    },
    enabled: !!actor && !isFetching && !!legendId,
  });

  const handleLogout = useCallback(() => {
    logout();
    navigate({ to: "/" });
  }, [logout, navigate]);

  const handleJoin = useCallback(
    async (mode: GameMode, fee: number) => {
      if (!actor || !profile) return;

      const balance = Number(profile.walletBalance);
      if (balance < fee) {
        toast.error("Insufficient Legend Coins!", {
          description: `You need ${fee} LC but have ${balance} LC`,
        });
        return;
      }

      setJoiningMode(mode);
      try {
        await actor.joinTournament(mode, BigInt(fee));
        await refetchProfile();
        setShowCoinShower(true);
        toast.success("Joining tournament…", {
          description: "Battle stations — you're in!",
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to join tournament. Please try again.");
      } finally {
        setJoiningMode(null);
      }
    },
    [actor, profile, refetchProfile],
  );

  const balance = profile?.walletBalance ?? BigInt(0);
  const recentMatches = profile?.matchHistory?.slice(-5).reverse() ?? [];

  return (
    <div className="relative min-h-screen" style={{ background: "#0a0a0f" }}>
      <FireAnimation side="left" intensity="low" />
      <FireAnimation side="right" intensity="low" />
      <CoinShower
        active={showCoinShower}
        onComplete={() => setShowCoinShower(false)}
      />

      {/* Background glow */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(ellipse 40% 50% at 10% 30%, rgba(255,34,0,0.05) 0%, transparent 60%), radial-gradient(ellipse 40% 50% at 90% 30%, rgba(0,102,255,0.05) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      {/* ── HEADER ── */}
      <header
        className="relative z-10 sticky top-0"
        style={{
          background: "rgba(10, 10, 15, 0.9)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <a
            href="/"
            className="font-display font-black text-lg tracking-widest"
          >
            <span style={{ color: "#ff2200" }}>LX</span>
            <span style={{ color: "#ffd700" }}>A</span>
          </a>

          {/* Center: Legend ID */}
          <div className="hidden sm:flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: "#22cc66",
                boxShadow: "0 0 6px #22cc66",
              }}
            />
            <span
              className="font-display font-bold text-sm tracking-wider"
              style={{ color: "rgba(255,255,255,0.8)" }}
            >
              {legendId}
            </span>
            {role === "admin" && (
              <span
                className="text-xs font-display font-bold px-2 py-0.5 rounded uppercase tracking-wider"
                style={{
                  background: "rgba(255, 215, 0, 0.15)",
                  border: "1px solid rgba(255, 215, 0, 0.4)",
                  color: "#ffd700",
                }}
              >
                ADMIN
              </span>
            )}
          </div>

          {/* Right: wallet + logout */}
          <div className="flex items-center gap-3">
            <WalletDisplay balance={balance} />
            {role === "admin" && (
              <button
                type="button"
                onClick={() => navigate({ to: "/admin" })}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-bold uppercase tracking-wider transition-all duration-200 hover:opacity-80"
                style={{
                  background: "rgba(255,215,0,0.1)",
                  border: "1px solid rgba(255,215,0,0.3)",
                  color: "#ffd700",
                }}
              >
                ADMIN
              </button>
            )}
            <button
              type="button"
              data-ocid="dashboard.logout_button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-bold uppercase tracking-wider transition-all duration-200 hover:opacity-80"
              style={{
                background: "rgba(255,34,0,0.1)",
                border: "1px solid rgba(255,34,0,0.3)",
                color: "#ff4422",
              }}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">LOGOUT</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Welcome banner */}
        <div
          className="rounded-2xl p-6 sm:p-8 mb-10 overflow-hidden relative"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,34,0,0.08), rgba(0,102,255,0.08))",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* Decorative top line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background:
                "linear-gradient(90deg, #ff2200, #ffd700 50%, #0066ff)",
            }}
          />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p
                className="text-xs font-body uppercase tracking-[0.3em] mb-1"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Commander Online
              </p>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-foreground">
                Welcome back,{" "}
                <span style={{ color: "#ff4422" }}>{legendId}</span>
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="px-4 py-2 rounded-xl text-center"
                style={{
                  background: "rgba(255,215,0,0.08)",
                  border: "1px solid rgba(255,215,0,0.2)",
                }}
              >
                <div
                  className="font-display font-black text-xl tabular-nums"
                  style={{ color: "#ffd700" }}
                >
                  {Number(balance).toLocaleString()}
                </div>
                <div
                  className="text-xs font-body uppercase tracking-wider"
                  style={{ color: "rgba(255,215,0,0.6)" }}
                >
                  Legend Coins
                </div>
              </div>
              <div
                className="px-4 py-2 rounded-xl text-center"
                style={{
                  background: "rgba(34,204,102,0.08)",
                  border: "1px solid rgba(34,204,102,0.2)",
                }}
              >
                <div
                  className="font-display font-black text-xl"
                  style={{ color: "#22cc66" }}
                >
                  {profile?.matchHistory?.length ?? 0}
                </div>
                <div
                  className="text-xs font-body uppercase tracking-wider"
                  style={{ color: "rgba(34,204,102,0.6)" }}
                >
                  Matches
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── GAME MODES ── */}
        <section aria-label="Game modes" className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-xl uppercase tracking-wider text-foreground">
              Choose Your Battle
            </h3>
            <div
              className="h-px flex-1 ml-6"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,34,0,0.4), transparent)",
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GameModeCard
              mode="1v1 SOLO"
              title="Lone Wolf"
              description="1v1 Solo Combat — Prove your supremacy in direct confrontation. Only the strongest survives."
              entryFee={50}
              accentColor="red"
              icon={<Sword className="w-6 h-6" />}
              playerCount="2 Players"
              isLoading={joiningMode === GameMode.loneWolf}
              onJoin={() => handleJoin(GameMode.loneWolf, 50)}
              joinButtonOcid="dashboard.lone_wolf_join_button"
            />
            <GameModeCard
              mode="4v4 TEAMS"
              title="CS Mod"
              description="4v4 Team Clash — Lead your squad to victory. Coordination wins battles here."
              entryFee={100}
              accentColor="blue"
              icon={<Shield className="w-6 h-6" />}
              playerCount="8 Players"
              isLoading={joiningMode === GameMode.csMod}
              onJoin={() => handleJoin(GameMode.csMod, 100)}
              joinButtonOcid="dashboard.cs_mod_join_button"
            />
            <GameModeCard
              mode="FULL MAP"
              title="BR Mod"
              description="Full Battle Royale — 50 Players, One Champion. The ultimate test of skill and survival."
              entryFee={200}
              accentColor="purple"
              icon={<Globe className="w-6 h-6" />}
              playerCount="50 Players"
              isLoading={joiningMode === GameMode.brMod}
              onJoin={() => handleJoin(GameMode.brMod, 200)}
              joinButtonOcid="dashboard.br_mod_join_button"
            />
          </div>
        </section>

        {/* ── RECENT ACTIVITY ── */}
        <section aria-label="Recent activity">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-xl uppercase tracking-wider text-foreground">
              Recent Activity
            </h3>
            <Clock
              className="w-4 h-4"
              style={{ color: "rgba(255,255,255,0.3)" }}
            />
          </div>

          {recentMatches.length === 0 ? (
            <div
              data-ocid="dashboard.match.empty_state"
              className="rounded-xl py-12 text-center"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px dashed rgba(255,255,255,0.08)",
              }}
            >
              <Trophy
                className="w-10 h-10 mx-auto mb-3"
                style={{ color: "rgba(255,255,255,0.15)" }}
              />
              <p className="font-body text-muted-foreground text-sm">
                No battles yet. Choose a game mode and enter the arena!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentMatches.map((match, i) => (
                <MatchHistoryRow
                  key={match.matchId}
                  match={match}
                  index={i + 1}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer
        className="relative z-10 py-6 text-center mt-10 border-t"
        style={{
          borderColor: "rgba(255,255,255,0.04)",
          color: "rgba(255,255,255,0.25)",
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
