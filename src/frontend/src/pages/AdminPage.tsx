import {
  GameMode,
  type Match,
  type Transaction,
  TransactionType,
  type UserProfile,
} from "@/backend.d";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useActor } from "@/hooks/useActor";
import { useAuthStore } from "@/store/authStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  Ban,
  CheckCircle,
  Coins,
  Loader2,
  LogOut,
  Search,
  Shield,
  Users,
} from "lucide-react";
import { useState } from "react";
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

function modeLabel(mode: GameMode): string {
  if (mode === GameMode.loneWolf) return "Lone Wolf";
  if (mode === GameMode.csMod) return "CS Mod";
  return "BR Mod";
}

function UserCard({
  profile,
  onToggleBan,
  isToggling,
}: {
  profile: UserProfile;
  onToggleBan: () => void;
  isToggling: boolean;
}) {
  const recentMatches = profile.matchHistory.slice(-10).reverse();
  const recentTxs = profile.transactions.slice(-10).reverse();

  return (
    <div
      className="rounded-2xl overflow-hidden mt-6 animate-fade-up"
      style={{
        background: "rgba(13, 13, 26, 0.9)",
        border: profile.isBanned
          ? "1px solid rgba(255,34,0,0.5)"
          : "1px solid rgba(255,255,255,0.08)",
        boxShadow: profile.isBanned
          ? "0 0 30px rgba(255,34,0,0.1)"
          : "0 4px 30px rgba(0,0,0,0.3)",
      }}
    >
      {/* User header */}
      <div
        className="p-6 border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-display font-black text-2xl text-foreground">
                {profile.legendId}
              </h3>
              <span
                className="text-xs font-display font-bold px-2 py-0.5 rounded uppercase tracking-wider"
                style={{
                  background:
                    profile.role === "admin"
                      ? "rgba(255,215,0,0.15)"
                      : "rgba(0,102,255,0.15)",
                  border:
                    profile.role === "admin"
                      ? "1px solid rgba(255,215,0,0.4)"
                      : "1px solid rgba(0,102,255,0.4)",
                  color: profile.role === "admin" ? "#ffd700" : "#4499ff",
                }}
              >
                {profile.role}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm font-body text-muted-foreground">
              <span>
                Registered:{" "}
                <span className="text-foreground">
                  {formatDate(profile.createdAt)}
                </span>
              </span>
              <span>
                Matches:{" "}
                <span className="text-foreground">
                  {profile.matchHistory.length}
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Wallet */}
            <div
              className="px-4 py-2 rounded-xl text-center"
              style={{
                background: "rgba(255,215,0,0.08)",
                border: "1px solid rgba(255,215,0,0.2)",
              }}
            >
              <div
                className="font-display font-black text-lg tabular-nums"
                style={{ color: "#ffd700" }}
              >
                {Number(profile.walletBalance).toLocaleString()}
              </div>
              <div
                className="text-xs font-body uppercase tracking-wider"
                style={{ color: "rgba(255,215,0,0.6)" }}
              >
                LC
              </div>
            </div>

            {/* Status badge */}
            <div
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-display font-bold uppercase tracking-wider"
              style={{
                background: profile.isBanned
                  ? "rgba(255,34,0,0.15)"
                  : "rgba(34,204,102,0.15)",
                border: profile.isBanned
                  ? "1px solid rgba(255,34,0,0.4)"
                  : "1px solid rgba(34,204,102,0.4)",
                color: profile.isBanned ? "#ff4422" : "#22cc66",
              }}
            >
              {profile.isBanned ? (
                <Ban className="w-4 h-4" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              {profile.isBanned ? "BANNED" : "ACTIVE"}
            </div>

            {/* Ban/Unban button */}
            <button
              type="button"
              data-ocid="admin.ban_toggle_button"
              onClick={onToggleBan}
              disabled={isToggling}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-display font-bold text-sm uppercase tracking-wider transition-all duration-200 hover:opacity-80 disabled:opacity-50"
              style={{
                background: profile.isBanned
                  ? "rgba(34,204,102,0.15)"
                  : "rgba(255,34,0,0.15)",
                border: profile.isBanned
                  ? "1px solid rgba(34,204,102,0.4)"
                  : "1px solid rgba(255,34,0,0.4)",
                color: profile.isBanned ? "#22cc66" : "#ff4422",
              }}
            >
              {isToggling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : profile.isBanned ? (
                <>
                  <CheckCircle className="w-4 h-4" /> UNBAN
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4" /> BAN
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Match history */}
      <div
        className="p-6 border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <h4 className="font-display font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">
          Match History (Last 10)
        </h4>
        {recentMatches.length === 0 ? (
          <p className="text-sm font-body text-muted-foreground italic">
            No matches played
          </p>
        ) : (
          <div
            className="overflow-x-auto rounded-xl"
            style={{ border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <Table>
              <TableHeader>
                <TableRow style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <TableHead className="font-display text-xs uppercase tracking-wider">
                    Mode
                  </TableHead>
                  <TableHead className="font-display text-xs uppercase tracking-wider">
                    Result
                  </TableHead>
                  <TableHead className="font-display text-xs uppercase tracking-wider">
                    Wagered
                  </TableHead>
                  <TableHead className="font-display text-xs uppercase tracking-wider">
                    Date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentMatches.map((match: Match, i: number) => {
                  const resultColor =
                    match.result === "win"
                      ? "#22cc66"
                      : match.result === "loss"
                        ? "#ff4422"
                        : "#ffd700";
                  return (
                    <TableRow
                      key={match.matchId}
                      data-ocid={`admin.match.item.${i + 1}`}
                      style={{ borderColor: "rgba(255,255,255,0.04)" }}
                    >
                      <TableCell className="font-body text-sm">
                        {modeLabel(match.mode)}
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell
                        className="font-display font-bold text-sm tabular-nums"
                        style={{ color: "#ffd700" }}
                      >
                        ₡{Number(match.coinsWagered)}
                      </TableCell>
                      <TableCell className="font-body text-sm text-muted-foreground">
                        {formatDate(match.date)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Transaction history */}
      <div className="p-6">
        <h4 className="font-display font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">
          Transaction History (Last 10)
        </h4>
        {recentTxs.length === 0 ? (
          <p className="text-sm font-body text-muted-foreground italic">
            No transactions
          </p>
        ) : (
          <div
            className="overflow-x-auto rounded-xl"
            style={{ border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <Table>
              <TableHeader>
                <TableRow style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <TableHead className="font-display text-xs uppercase tracking-wider">
                    Type
                  </TableHead>
                  <TableHead className="font-display text-xs uppercase tracking-wider">
                    Amount
                  </TableHead>
                  <TableHead className="font-display text-xs uppercase tracking-wider">
                    Description
                  </TableHead>
                  <TableHead className="font-display text-xs uppercase tracking-wider">
                    Date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTxs.map((tx: Transaction, i: number) => {
                  const isDeposit = tx.txType === TransactionType.deposit;
                  const txKey = `${tx.txType}-${tx.amount.toString()}-${tx.date.toString()}-${i}`;
                  return (
                    <TableRow
                      key={txKey}
                      data-ocid={`admin.transaction.item.${i + 1}`}
                      style={{ borderColor: "rgba(255,255,255,0.04)" }}
                    >
                      <TableCell>
                        <span
                          className="text-xs font-display font-bold uppercase px-2 py-0.5 rounded"
                          style={{
                            background: isDeposit
                              ? "rgba(34,204,102,0.15)"
                              : "rgba(255,34,0,0.15)",
                            color: isDeposit ? "#22cc66" : "#ff4422",
                            border: `1px solid ${isDeposit ? "rgba(34,204,102,0.3)" : "rgba(255,34,0,0.3)"}`,
                          }}
                        >
                          {tx.txType}
                        </span>
                      </TableCell>
                      <TableCell
                        className="font-display font-bold text-sm tabular-nums"
                        style={{ color: isDeposit ? "#22cc66" : "#ff4422" }}
                      >
                        {isDeposit ? "+" : "-"}₡{Number(tx.amount)}
                      </TableCell>
                      <TableCell className="font-body text-sm text-muted-foreground max-w-xs truncate">
                        {tx.description}
                      </TableCell>
                      <TableCell className="font-body text-sm text-muted-foreground">
                        {formatDate(tx.date)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminPage() {
  const navigate = useNavigate();
  const { legendId } = useAuthStore();
  const logout = useAuthStore((s) => s.logout);
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState<string | null>(null);

  const {
    data: searchResult,
    isFetching: isSearching,
    isError: searchError,
    refetch: refetchSearch,
  } = useQuery({
    queryKey: ["adminSearch", searchTerm],
    queryFn: async () => {
      if (!actor || !searchTerm) return null;
      return actor.getUserByLegendId(searchTerm);
    },
    enabled: !!actor && !isFetching && !!searchTerm,
    retry: false,
  });

  const toggleBanMutation = useMutation({
    mutationFn: async (targetLegendId: string) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.toggleBan(targetLegendId);
    },
    onSuccess: () => {
      toast.success("Ban status updated");
      queryClient.invalidateQueries({ queryKey: ["adminSearch", searchTerm] });
      refetchSearch();
    },
    onError: () => {
      toast.error("Failed to update ban status");
    },
  });

  function handleSearch() {
    const trimmed = searchInput.trim();
    if (!trimmed) {
      toast.error("Enter a Legend ID to search");
      return;
    }
    setSearchTerm(trimmed);
  }

  function handleLogout() {
    logout();
    navigate({ to: "/" });
  }

  return (
    <div className="relative min-h-screen" style={{ background: "#0a0a0f" }}>
      {/* Top accent */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: "linear-gradient(90deg, #ff2200, #ffd700, #0066ff)",
          zIndex: 100,
        }}
      />

      {/* Background glow */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,215,0,0.04) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      {/* ── HEADER ── */}
      <header
        className="relative z-10 sticky top-0"
        style={{
          background: "rgba(10, 10, 15, 0.95)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,215,0,0.15)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg"
              style={{
                background: "rgba(255,215,0,0.15)",
                border: "1px solid rgba(255,215,0,0.3)",
              }}
            >
              <Shield className="w-4 h-4" style={{ color: "#ffd700" }} />
            </div>
            <div>
              <h1
                className="font-display font-black text-base tracking-widest uppercase"
                style={{ color: "#ffd700" }}
              >
                Admin Control
              </h1>
              <p
                className="text-xs font-body"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                {legendId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate({ to: "/dashboard" })}
              className="text-xs font-display font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all duration-200 hover:opacity-80"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-display font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all duration-200 hover:opacity-80"
              style={{
                background: "rgba(255,34,0,0.1)",
                border: "1px solid rgba(255,34,0,0.3)",
                color: "#ff4422",
              }}
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Stats bar */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div
            className="flex items-center gap-4 p-5 rounded-xl"
            style={{
              background: "rgba(0,102,255,0.06)",
              border: "1px solid rgba(0,102,255,0.15)",
            }}
          >
            <div
              className="flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0"
              style={{
                background: "rgba(0,102,255,0.15)",
                color: "#4499ff",
              }}
            >
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="font-display font-black text-xl text-foreground">
                Platform Stats
              </div>
              <div className="text-xs font-body text-muted-foreground">
                Search users to view their data
              </div>
            </div>
          </div>

          <div
            className="flex items-center gap-4 p-5 rounded-xl"
            style={{
              background: "rgba(255,215,0,0.06)",
              border: "1px solid rgba(255,215,0,0.15)",
            }}
          >
            <div
              className="flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0"
              style={{
                background: "rgba(255,215,0,0.15)",
                color: "#ffd700",
              }}
            >
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="font-display font-black text-xl text-foreground">
                Legend Coins
              </div>
              <div className="text-xs font-body text-muted-foreground">
                Per-user balance visible below
              </div>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: "rgba(13, 13, 26, 0.9)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <h2 className="font-display font-bold text-base uppercase tracking-wider mb-4 text-foreground">
            User Lookup
          </h2>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "rgba(255,255,255,0.3)" }}
              />
              <input
                data-ocid="admin.search_input"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Enter Legend ID…"
                className="w-full pl-10 pr-4 py-3 rounded-xl font-body text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  outline: "none",
                }}
              />
            </div>
            <button
              type="button"
              data-ocid="admin.search_button"
              onClick={handleSearch}
              disabled={isSearching}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-display font-bold text-sm uppercase tracking-wider transition-all duration-200 hover:opacity-90 disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #ffd700, #ff9900)",
                color: "#000",
              }}
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Search
            </button>
          </div>

          {/* Search result */}
          {isSearching && (
            <div
              data-ocid="admin.search.loading_state"
              className="mt-4 flex items-center justify-center py-8 gap-3 text-muted-foreground"
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-body text-sm">Searching…</span>
            </div>
          )}

          {searchError && !isSearching && (
            <div
              data-ocid="admin.search.error_state"
              className="mt-4 text-center py-8"
            >
              <p className="font-body text-sm" style={{ color: "#ff4422" }}>
                User not found. Check the Legend ID and try again.
              </p>
            </div>
          )}

          {searchResult && !isSearching && (
            <div data-ocid="admin.search.success_state">
              <UserCard
                profile={searchResult}
                onToggleBan={() =>
                  toggleBanMutation.mutate(searchResult.legendId)
                }
                isToggling={toggleBanMutation.isPending}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
