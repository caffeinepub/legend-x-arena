import {
  type DepositRequest,
  DepositStatus,
  GameMode,
  type Match,
  type Tournament,
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
  Edit2,
  ImageIcon,
  Key,
  Loader2,
  LogOut,
  Plus,
  RefreshCcw,
  Search,
  Shield,
  Trash2,
  Trophy,
  Users,
  X,
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
            {/* Player game info */}
            <div className="flex flex-wrap gap-3 mt-2">
              {profile.gameName && (
                <span
                  className="flex items-center gap-1.5 text-xs font-body px-2.5 py-1 rounded-lg"
                  style={{
                    background: "rgba(0,153,255,0.08)",
                    border: "1px solid rgba(0,153,255,0.2)",
                    color: "rgba(0,153,255,0.9)",
                  }}
                >
                  🎮 <span className="font-bold">{profile.gameName}</span>
                </span>
              )}
              {profile.gameUID && (
                <span
                  className="flex items-center gap-1.5 text-xs font-body px-2.5 py-1 rounded-lg"
                  style={{
                    background: "rgba(255,215,0,0.08)",
                    border: "1px solid rgba(255,215,0,0.2)",
                    color: "rgba(255,215,0,0.9)",
                  }}
                >
                  🆔 <span className="font-mono">{profile.gameUID}</span>
                </span>
              )}
              {profile.jazzCashNumber && (
                <span
                  className="flex items-center gap-1.5 text-xs font-body px-2.5 py-1 rounded-lg"
                  style={{
                    background: "rgba(34,204,102,0.08)",
                    border: "1px solid rgba(34,204,102,0.2)",
                    color: "rgba(34,204,102,0.9)",
                  }}
                >
                  💳 <span className="font-mono">{profile.jazzCashNumber}</span>
                </span>
              )}
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

/* ─── Match Management Section ─────────────────────────────── */
const EMPTY_FORM = {
  title: "",
  category: "",
  mode: "",
  entryFee: "",
  prizePool: "",
  maxPlayers: "",
  imageUrl: "",
  isActive: true,
  returningCoins: "0",
};

function MatchManagementSection() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  /* ── Set Room state ── */
  const [roomFormId, setRoomFormId] = useState<string | null>(null); // which tournament's room form is open
  const [roomIdInput, setRoomIdInput] = useState("");
  const [roomPasswordInput, setRoomPasswordInput] = useState("");
  const [isSavingRoom, setIsSavingRoom] = useState(false);

  /* ── Declare Result state ── */
  const [declareFormId, setDeclareFormId] = useState<string | null>(null);
  const [winnerIdInput, setWinnerIdInput] = useState("");
  const [loserIdInput, setLoserIdInput] = useState("");
  const [winnerCoinsInput, setWinnerCoinsInput] = useState("");
  const [loserCoinsInput, setLoserCoinsInput] = useState("");
  const [isDeclaring, setIsDeclaring] = useState(false);

  const {
    data: tournaments = [],
    isFetching: isLoadingTournaments,
    refetch: refetchTournaments,
  } = useQuery<Tournament[]>({
    queryKey: ["allTournaments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTournaments();
    },
    enabled: !!actor && !isFetching,
  });

  function openRoomForm(t: Tournament) {
    setRoomFormId(t.id);
    setRoomIdInput(t.roomId ?? "");
    setRoomPasswordInput(t.roomPassword ?? "");
  }

  function cancelRoomForm() {
    setRoomFormId(null);
    setRoomIdInput("");
    setRoomPasswordInput("");
  }

  function openDeclareForm(t: Tournament) {
    setDeclareFormId(t.id);
    setWinnerIdInput("");
    setLoserIdInput("");
    setWinnerCoinsInput("");
    setLoserCoinsInput("");
    // close room form if open
    setRoomFormId(null);
  }

  function cancelDeclareForm() {
    setDeclareFormId(null);
    setWinnerIdInput("");
    setLoserIdInput("");
    setWinnerCoinsInput("");
    setLoserCoinsInput("");
  }

  async function handleDeclareResult(tournamentId: string) {
    if (!actor) return;
    const winnerCoins = Math.max(0, Math.floor(Number(winnerCoinsInput)));
    const loserCoins = Math.max(0, Math.floor(Number(loserCoinsInput)));
    if (!winnerIdInput.trim() || !loserIdInput.trim()) {
      toast.error("Please enter both Winner and Loser Legend IDs");
      return;
    }
    setIsDeclaring(true);
    try {
      await actor.declareMatchResult(
        tournamentId,
        winnerIdInput.trim(),
        loserIdInput.trim(),
        BigInt(winnerCoins),
        BigInt(loserCoins),
      );
      toast.success("Result declared! Players updated.");
      queryClient.invalidateQueries({ queryKey: ["allTournaments"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      cancelDeclareForm();
    } catch (err) {
      console.error(err);
      toast.error("Failed to declare result.");
    } finally {
      setIsDeclaring(false);
    }
  }

  async function handleSaveRoom(tournamentId: string) {
    if (!actor) return;
    setIsSavingRoom(true);
    try {
      await actor.setTournamentRoom(
        tournamentId,
        roomIdInput.trim(),
        roomPasswordInput.trim(),
      );
      toast.success("Room details set! Players can now see the room.");
      queryClient.invalidateQueries({ queryKey: ["allTournaments"] });
      queryClient.invalidateQueries({ queryKey: ["activeTournaments"] });
      queryClient.invalidateQueries({ queryKey: ["tournamentRoom"] });
      await refetchTournaments();
      cancelRoomForm();
    } catch (err) {
      console.error(err);
      toast.error("Failed to set room details. Please try again.");
    } finally {
      setIsSavingRoom(false);
    }
  }

  function openAddForm() {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setShowForm(true);
  }

  function openEditForm(t: Tournament) {
    setEditingId(t.id);
    setFormData({
      title: t.title,
      category: t.category,
      mode: t.mode,
      entryFee: Number(t.entryFee).toString(),
      prizePool: t.prizePool,
      maxPlayers: Number(t.maxPlayers).toString(),
      imageUrl: t.imageUrl,
      isActive: t.isActive,
      returningCoins: Number(t.returningCoins).toString(),
    });
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!actor) return;

    const title = formData.title.trim();
    const category = formData.category.trim();
    const mode = formData.mode.trim();
    const entryFee = Number(formData.entryFee);
    const prizePool = formData.prizePool.trim();
    const maxPlayers = Number(formData.maxPlayers);
    const imageUrl = formData.imageUrl.trim();
    const returningCoins = Number(formData.returningCoins);

    if (!title || !category || !mode || !prizePool || maxPlayers < 1) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        await actor.updateTournament(
          editingId,
          title,
          category,
          mode,
          BigInt(Math.max(0, Math.floor(entryFee))),
          prizePool,
          BigInt(Math.max(1, Math.floor(maxPlayers))),
          imageUrl,
          formData.isActive,
          BigInt(Math.max(0, Math.floor(returningCoins))),
        );
        toast.success("Match updated successfully!");
      } else {
        await actor.createTournament(
          title,
          category,
          mode,
          BigInt(Math.max(0, Math.floor(entryFee))),
          prizePool,
          BigInt(Math.max(1, Math.floor(maxPlayers))),
          imageUrl,
          BigInt(Math.max(0, Math.floor(returningCoins))),
        );
        toast.success("Match created successfully!");
      }
      queryClient.invalidateQueries({ queryKey: ["allTournaments"] });
      queryClient.invalidateQueries({ queryKey: ["activeTournaments"] });
      await refetchTournaments();
      cancelForm();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save match. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(t: Tournament) {
    if (!actor) return;
    if (!confirm(`Delete "${t.title}"? This cannot be undone.`)) return;
    setDeletingId(t.id);
    try {
      await actor.deleteTournament(t.id);
      toast.success(`"${t.title}" deleted`);
      queryClient.invalidateQueries({ queryKey: ["allTournaments"] });
      queryClient.invalidateQueries({ queryKey: ["activeTournaments"] });
      await refetchTournaments();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete match");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleToggleActive(t: Tournament) {
    if (!actor) return;
    setTogglingId(t.id);
    try {
      await actor.updateTournament(
        t.id,
        t.title,
        t.category,
        t.mode,
        t.entryFee,
        t.prizePool,
        t.maxPlayers,
        t.imageUrl,
        !t.isActive,
        t.returningCoins,
      );
      toast.success(!t.isActive ? "Match activated" : "Match deactivated");
      queryClient.invalidateQueries({ queryKey: ["allTournaments"] });
      queryClient.invalidateQueries({ queryKey: ["activeTournaments"] });
      await refetchTournaments();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update match status");
    } finally {
      setTogglingId(null);
    }
  }

  const inputStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff",
    outline: "none",
    width: "100%",
  };

  const inputFocus = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    e.target.style.borderColor = "rgba(255,180,0,0.5)";
    e.target.style.boxShadow = "0 0 0 2px rgba(255,180,0,0.1)";
  };
  const inputBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    e.target.style.borderColor = "rgba(255,255,255,0.1)";
    e.target.style.boxShadow = "none";
  };

  return (
    <div
      className="rounded-2xl p-6 mb-8"
      style={{
        background: "rgba(13, 13, 26, 0.9)",
        border: "1px solid rgba(255,180,0,0.2)",
      }}
    >
      {/* Section heading */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
            style={{
              background: "rgba(255,180,0,0.12)",
              border: "1px solid rgba(255,180,0,0.3)",
            }}
          >
            <Trophy className="w-4 h-4" style={{ color: "#ffb400" }} />
          </div>
          <h2 className="font-display font-bold text-base uppercase tracking-wider text-foreground">
            Match Management
          </h2>
          <span
            className="text-xs font-display font-black px-2.5 py-0.5 rounded-full"
            style={{
              background: "rgba(255,180,0,0.12)",
              border: "1px solid rgba(255,180,0,0.3)",
              color: "#ffb400",
            }}
          >
            {tournaments.length} matches
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-ocid="admin.match.refresh_button"
            onClick={() => refetchTournaments()}
            disabled={isLoadingTournaments}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-bold uppercase tracking-wider transition-all duration-200 hover:opacity-80 disabled:opacity-50"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            <RefreshCcw
              className={`w-3.5 h-3.5 ${isLoadingTournaments ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          {!showForm && (
            <button
              type="button"
              data-ocid="admin.match.open_modal_button"
              onClick={openAddForm}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-display font-bold uppercase tracking-wider transition-all duration-200 hover:opacity-90"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,180,0,0.9), rgba(255,120,0,0.9))",
                color: "#000",
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              Add New Match
            </button>
          )}
        </div>
      </div>

      {/* ── Add / Edit Form ── */}
      {showForm && (
        <div
          data-ocid="admin.match.modal"
          className="rounded-xl p-5 mb-5 animate-fade-up"
          style={{
            background: "rgba(255,180,0,0.04)",
            border: "1px solid rgba(255,180,0,0.2)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className="font-display font-bold text-sm uppercase tracking-wider"
              style={{ color: "#ffb400" }}
            >
              {editingId ? "Edit Match" : "New Match"}
            </h3>
            <button
              type="button"
              data-ocid="admin.match.close_button"
              onClick={cancelForm}
              className="p-1 rounded-lg hover:opacity-70 transition-opacity"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Title */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="match-title"
                  className="block text-xs font-display font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Title *
                </label>
                <input
                  id="match-title"
                  data-ocid="admin.match.title_input"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="e.g. Free Fire Championship #1"
                  className="px-4 py-2.5 rounded-xl font-body text-sm placeholder:text-muted-foreground transition-all duration-200"
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="match-category"
                  className="block text-xs font-display font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Category *
                </label>
                <input
                  id="match-category"
                  data-ocid="admin.match.category_input"
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, category: e.target.value }))
                  }
                  placeholder="Solo / Duo / Squad"
                  className="px-4 py-2.5 rounded-xl font-body text-sm placeholder:text-muted-foreground transition-all duration-200"
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>

              {/* Mode */}
              <div>
                <label
                  htmlFor="match-mode"
                  className="block text-xs font-display font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Mode *
                </label>
                <input
                  id="match-mode"
                  data-ocid="admin.match.mode_input"
                  type="text"
                  required
                  value={formData.mode}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, mode: e.target.value }))
                  }
                  placeholder="BR / CS / Lone Wolf"
                  className="px-4 py-2.5 rounded-xl font-body text-sm placeholder:text-muted-foreground transition-all duration-200"
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>

              {/* Entry Fee */}
              <div>
                <label
                  htmlFor="match-entry-fee"
                  className="block text-xs font-display font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Entry Fee (LC)
                </label>
                <input
                  id="match-entry-fee"
                  data-ocid="admin.match.entry_fee_input"
                  type="number"
                  min="0"
                  value={formData.entryFee}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, entryFee: e.target.value }))
                  }
                  placeholder="100"
                  className="px-4 py-2.5 rounded-xl font-body text-sm placeholder:text-muted-foreground transition-all duration-200"
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>

              {/* Prize Pool */}
              <div>
                <label
                  htmlFor="match-prize-pool"
                  className="block text-xs font-display font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Prize Pool *
                </label>
                <input
                  id="match-prize-pool"
                  data-ocid="admin.match.prize_pool_input"
                  type="text"
                  required
                  value={formData.prizePool}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, prizePool: e.target.value }))
                  }
                  placeholder="₡5000 or PKR 1000"
                  className="px-4 py-2.5 rounded-xl font-body text-sm placeholder:text-muted-foreground transition-all duration-200"
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>

              {/* Returning Coins */}
              <div>
                <label
                  htmlFor="match-returning-coins"
                  className="block text-xs font-display font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Returning Coins (LC)
                </label>
                <input
                  id="match-returning-coins"
                  data-ocid="admin.match.returning_coins_input"
                  type="number"
                  min="0"
                  value={formData.returningCoins}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      returningCoins: e.target.value,
                    }))
                  }
                  placeholder="0"
                  className="px-4 py-2.5 rounded-xl font-body text-sm placeholder:text-muted-foreground transition-all duration-200"
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>

              {/* Max Players */}
              <div>
                <label
                  htmlFor="match-max-players"
                  className="block text-xs font-display font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Max Players *
                </label>
                <input
                  id="match-max-players"
                  data-ocid="admin.match.max_players_input"
                  type="number"
                  min="1"
                  required
                  value={formData.maxPlayers}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, maxPlayers: e.target.value }))
                  }
                  placeholder="50"
                  className="px-4 py-2.5 rounded-xl font-body text-sm placeholder:text-muted-foreground transition-all duration-200"
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>

              {/* Image URL */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="match-image-url"
                  className="block text-xs font-display font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Image URL (optional)
                </label>
                <input
                  id="match-image-url"
                  data-ocid="admin.match.image_url_input"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, imageUrl: e.target.value }))
                  }
                  placeholder="https://example.com/banner.jpg"
                  className="px-4 py-2.5 rounded-xl font-body text-sm placeholder:text-muted-foreground transition-all duration-200"
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
                {formData.imageUrl && (
                  <div
                    className="mt-2 rounded-lg overflow-hidden"
                    style={{ maxWidth: 120, height: 60 }}
                  >
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Active toggle (edit only) */}
              {editingId && (
                <div className="sm:col-span-2 flex items-center gap-3">
                  <button
                    type="button"
                    data-ocid="admin.match.active_toggle"
                    onClick={() =>
                      setFormData((p) => ({ ...p, isActive: !p.isActive }))
                    }
                    className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200"
                    style={{
                      background: formData.isActive
                        ? "rgba(34,204,102,0.8)"
                        : "rgba(255,255,255,0.15)",
                    }}
                  >
                    <span
                      className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200"
                      style={{
                        transform: formData.isActive
                          ? "translateX(18px)"
                          : "translateX(2px)",
                      }}
                    />
                  </button>
                  <span
                    className="text-sm font-body"
                    style={{
                      color: formData.isActive
                        ? "#22cc66"
                        : "rgba(255,255,255,0.5)",
                    }}
                  >
                    {formData.isActive
                      ? "Active (visible to players)"
                      : "Inactive (hidden from players)"}
                  </span>
                </div>
              )}
            </div>

            {/* Form actions */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                data-ocid="admin.match.save_button"
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-display font-bold text-sm uppercase tracking-wider transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,180,0,0.9), rgba(255,120,0,0.9))",
                  color: "#000",
                }}
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isSaving
                  ? "Saving…"
                  : editingId
                    ? "Update Match"
                    : "Create Match"}
              </button>
              <button
                type="button"
                data-ocid="admin.match.cancel_button"
                onClick={cancelForm}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl font-display font-bold text-sm uppercase tracking-wider transition-all duration-200 hover:opacity-80 disabled:opacity-50"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading state */}
      {isLoadingTournaments && tournaments.length === 0 && (
        <div
          data-ocid="admin.match.loading_state"
          className="flex items-center justify-center py-10 gap-3 text-muted-foreground"
        >
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="font-body text-sm">Loading matches…</span>
        </div>
      )}

      {/* Empty state */}
      {!isLoadingTournaments && tournaments.length === 0 && !showForm && (
        <div
          data-ocid="admin.match.empty_state"
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
            No matches yet. Click "Add New Match" to create one.
          </p>
        </div>
      )}

      {/* Tournament list */}
      {tournaments.length > 0 && (
        <div className="space-y-3">
          {tournaments.map((t, i) => {
            const isDeleting = deletingId === t.id;
            const isToggling = togglingId === t.id;
            const fill = Number(t.currentPlayers);
            const max = Number(t.maxPlayers);
            const fillPct =
              max > 0 ? Math.min(Math.round((fill / max) * 100), 100) : 0;

            return (
              <div
                key={t.id}
                data-ocid={`admin.match.item.${i + 1}`}
                className="rounded-xl p-4 transition-all duration-200"
                style={{
                  background: t.isActive
                    ? "rgba(255,180,0,0.04)"
                    : "rgba(255,255,255,0.02)",
                  border: t.isActive
                    ? "1px solid rgba(255,180,0,0.18)"
                    : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Thumbnail */}
                  <div
                    className="flex-shrink-0 rounded-lg overflow-hidden flex items-center justify-center"
                    style={{
                      width: 56,
                      height: 56,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    {t.imageUrl ? (
                      <img
                        src={t.imageUrl}
                        alt={t.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <ImageIcon
                        className="w-5 h-5"
                        style={{ color: "rgba(255,255,255,0.2)" }}
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <h4 className="font-display font-bold text-sm text-foreground truncate">
                          {t.title}
                        </h4>
                        {/* Category badge */}
                        <span
                          className="text-xs font-display font-black px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{
                            background: "rgba(0,153,255,0.15)",
                            border: "1px solid rgba(0,153,255,0.35)",
                            color: "#0099ff",
                          }}
                        >
                          {t.category}
                        </span>
                        {/* Active/Inactive badge */}
                        <span
                          className="text-xs font-display font-black px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{
                            background: t.isActive
                              ? "rgba(34,204,102,0.12)"
                              : "rgba(255,255,255,0.06)",
                            border: t.isActive
                              ? "1px solid rgba(34,204,102,0.3)"
                              : "1px solid rgba(255,255,255,0.1)",
                            color: t.isActive
                              ? "#22cc66"
                              : "rgba(255,255,255,0.35)",
                          }}
                        >
                          {t.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {/* Toggle active */}
                        <button
                          type="button"
                          data-ocid={`admin.match.active_toggle.${i + 1}`}
                          onClick={() => handleToggleActive(t)}
                          disabled={isToggling || isDeleting}
                          title={t.isActive ? "Deactivate" : "Activate"}
                          className="p-1.5 rounded-lg transition-all duration-200 hover:opacity-80 disabled:opacity-50"
                          style={{
                            background: t.isActive
                              ? "rgba(255,34,0,0.1)"
                              : "rgba(34,204,102,0.1)",
                            border: t.isActive
                              ? "1px solid rgba(255,34,0,0.25)"
                              : "1px solid rgba(34,204,102,0.25)",
                            color: t.isActive ? "#ff4422" : "#22cc66",
                          }}
                        >
                          {isToggling ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <span className="text-xs font-display font-black leading-none">
                              {t.isActive ? "OFF" : "ON"}
                            </span>
                          )}
                        </button>
                        {/* Set Room */}
                        <button
                          type="button"
                          data-ocid={`admin.match.secondary_button.${i + 1}`}
                          onClick={() => openRoomForm(t)}
                          disabled={isDeleting || isToggling}
                          title="Set Room ID & Password"
                          className="p-1.5 rounded-lg transition-all duration-200 hover:opacity-80 disabled:opacity-50"
                          style={{
                            background: "rgba(34,204,102,0.1)",
                            border: "1px solid rgba(34,204,102,0.25)",
                            color: "#22cc66",
                          }}
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>
                        {/* Declare Result */}
                        <button
                          type="button"
                          data-ocid={`admin.match.declare_button.${i + 1}`}
                          onClick={() =>
                            declareFormId === t.id
                              ? cancelDeclareForm()
                              : openDeclareForm(t)
                          }
                          disabled={isDeleting || isToggling}
                          title="Declare Match Result"
                          className="p-1.5 rounded-lg transition-all duration-200 hover:opacity-80 disabled:opacity-50"
                          style={{
                            background: "rgba(180,80,255,0.1)",
                            border: "1px solid rgba(180,80,255,0.25)",
                            color: "#b450ff",
                          }}
                        >
                          <Trophy className="w-3.5 h-3.5" />
                        </button>
                        {/* Edit */}
                        <button
                          type="button"
                          data-ocid={`admin.match.edit_button.${i + 1}`}
                          onClick={() => openEditForm(t)}
                          disabled={isDeleting || isToggling}
                          className="p-1.5 rounded-lg transition-all duration-200 hover:opacity-80 disabled:opacity-50"
                          style={{
                            background: "rgba(255,180,0,0.1)",
                            border: "1px solid rgba(255,180,0,0.25)",
                            color: "#ffb400",
                          }}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {/* Delete */}
                        <button
                          type="button"
                          data-ocid={`admin.match.delete_button.${i + 1}`}
                          onClick={() => handleDelete(t)}
                          disabled={isDeleting || isToggling}
                          className="p-1.5 rounded-lg transition-all duration-200 hover:opacity-80 disabled:opacity-50"
                          style={{
                            background: "rgba(255,34,0,0.1)",
                            border: "1px solid rgba(255,34,0,0.25)",
                            color: "#ff4422",
                          }}
                        >
                          {isDeleting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Details row */}
                    <div
                      className="flex flex-wrap gap-3 mt-1.5 text-xs font-body"
                      style={{ color: "rgba(255,255,255,0.45)" }}
                    >
                      <span>
                        Mode: <span className="text-foreground">{t.mode}</span>
                      </span>
                      <span>
                        Entry:{" "}
                        <span style={{ color: "#ffd700" }}>
                          ₡{Number(t.entryFee)}
                        </span>
                      </span>
                      <span>
                        Prize:{" "}
                        <span style={{ color: "#22cc66" }}>{t.prizePool}</span>
                      </span>
                      <span>
                        Players:{" "}
                        <span className="text-foreground">
                          {Number(t.currentPlayers)}/{Number(t.maxPlayers)}
                        </span>
                      </span>
                    </div>

                    {/* Room badges (if set) */}
                    {t.roomId && t.roomId.trim() !== "" && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span
                          className="text-xs font-display font-black px-2.5 py-1 rounded-full"
                          style={{
                            background: "rgba(255,215,0,0.1)",
                            border: "1px solid rgba(255,215,0,0.3)",
                            color: "#ffd700",
                          }}
                        >
                          Room: {t.roomId}
                        </span>
                        {t.roomPassword && t.roomPassword.trim() !== "" && (
                          <span
                            className="text-xs font-display font-black px-2.5 py-1 rounded-full"
                            style={{
                              background: "rgba(34,204,102,0.1)",
                              border: "1px solid rgba(34,204,102,0.3)",
                              color: "#22cc66",
                            }}
                          >
                            Pass: {t.roomPassword}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Progress bar */}
                    <div
                      className="mt-2 h-1 rounded-full overflow-hidden"
                      style={{ background: "rgba(255,255,255,0.06)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${fillPct}%`,
                          background:
                            fillPct >= 90
                              ? "linear-gradient(90deg, #ff4422aa, #ff4422)"
                              : "linear-gradient(90deg, rgba(255,180,0,0.7), #ffb400)",
                        }}
                      />
                    </div>

                    {/* Set Room inline form */}
                    {roomFormId === t.id && (
                      <div
                        data-ocid={`admin.match.panel.${i + 1}`}
                        className="mt-3 rounded-xl p-4 animate-fade-up"
                        style={{
                          background: "rgba(34,204,102,0.04)",
                          border: "1px solid rgba(34,204,102,0.2)",
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <p
                            className="text-xs font-display font-bold uppercase tracking-[0.18em]"
                            style={{ color: "#22cc66" }}
                          >
                            Set Room ID &amp; Password
                          </p>
                          <button
                            type="button"
                            data-ocid="admin.match.close_button"
                            onClick={cancelRoomForm}
                            className="p-1 rounded hover:opacity-70"
                            style={{ color: "rgba(255,255,255,0.4)" }}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <input
                            data-ocid="admin.match.input"
                            type="text"
                            value={roomIdInput}
                            onChange={(e) => setRoomIdInput(e.target.value)}
                            placeholder="Room ID"
                            className="flex-1 px-3 py-2 rounded-lg font-body text-sm text-foreground placeholder:text-muted-foreground"
                            style={{
                              background: "rgba(255,255,255,0.06)",
                              border: "1px solid rgba(34,204,102,0.2)",
                              outline: "none",
                            }}
                          />
                          <input
                            data-ocid="admin.match.search_input"
                            type="text"
                            value={roomPasswordInput}
                            onChange={(e) =>
                              setRoomPasswordInput(e.target.value)
                            }
                            placeholder="Password"
                            className="flex-1 px-3 py-2 rounded-lg font-body text-sm text-foreground placeholder:text-muted-foreground"
                            style={{
                              background: "rgba(255,255,255,0.06)",
                              border: "1px solid rgba(34,204,102,0.2)",
                              outline: "none",
                            }}
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              data-ocid="admin.match.save_button"
                              onClick={() => handleSaveRoom(t.id)}
                              disabled={isSavingRoom}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-display font-bold text-xs uppercase tracking-wider transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                              style={{
                                background:
                                  "linear-gradient(135deg, rgba(34,204,102,0.9), rgba(0,160,70,0.9))",
                                color: "#fff",
                              }}
                            >
                              {isSavingRoom ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Key className="w-3.5 h-3.5" />
                              )}
                              Save
                            </button>
                            <button
                              type="button"
                              data-ocid="admin.match.cancel_button"
                              onClick={cancelRoomForm}
                              disabled={isSavingRoom}
                              className="px-3 py-2 rounded-lg font-display font-bold text-xs uppercase tracking-wider transition-all duration-200 hover:opacity-80 disabled:opacity-50"
                              style={{
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                color: "rgba(255,255,255,0.5)",
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Declare Result inline panel */}
                    {declareFormId === t.id && (
                      <div
                        data-ocid={`admin.match.declare_panel.${i + 1}`}
                        className="mt-3 rounded-xl p-4 animate-fade-up"
                        style={{
                          background: "rgba(180,80,255,0.04)",
                          border: "1px solid rgba(180,80,255,0.2)",
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Trophy
                              className="w-3.5 h-3.5"
                              style={{ color: "#b450ff" }}
                            />
                            <p
                              className="text-xs font-display font-bold uppercase tracking-[0.18em]"
                              style={{ color: "#b450ff" }}
                            >
                              Declare Match Result
                            </p>
                          </div>
                          <button
                            type="button"
                            data-ocid={`admin.match.declare_close_button.${i + 1}`}
                            onClick={cancelDeclareForm}
                            className="p-1 rounded hover:opacity-70"
                            style={{ color: "rgba(255,255,255,0.4)" }}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                          {/* Winner Legend ID */}
                          <div>
                            <label
                              htmlFor={`declare-winner-${t.id}`}
                              className="block text-xs font-display font-bold uppercase tracking-wider mb-1"
                              style={{ color: "rgba(255,255,255,0.4)" }}
                            >
                              Winner Legend ID
                            </label>
                            <input
                              id={`declare-winner-${t.id}`}
                              data-ocid={`admin.match.winner_input.${i + 1}`}
                              type="text"
                              value={winnerIdInput}
                              onChange={(e) => setWinnerIdInput(e.target.value)}
                              placeholder="e.g. 0001"
                              className="w-full px-3 py-2 rounded-lg font-body text-sm text-foreground placeholder:text-muted-foreground"
                              style={{
                                background: "rgba(255,255,255,0.06)",
                                border: "1px solid rgba(180,80,255,0.25)",
                                outline: "none",
                              }}
                              onFocus={(e) => {
                                e.target.style.borderColor =
                                  "rgba(180,80,255,0.6)";
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor =
                                  "rgba(180,80,255,0.25)";
                              }}
                            />
                          </div>

                          {/* Loser Legend ID */}
                          <div>
                            <label
                              htmlFor={`declare-loser-${t.id}`}
                              className="block text-xs font-display font-bold uppercase tracking-wider mb-1"
                              style={{ color: "rgba(255,255,255,0.4)" }}
                            >
                              Loser Legend ID
                            </label>
                            <input
                              id={`declare-loser-${t.id}`}
                              data-ocid={`admin.match.loser_input.${i + 1}`}
                              type="text"
                              value={loserIdInput}
                              onChange={(e) => setLoserIdInput(e.target.value)}
                              placeholder="e.g. 0002"
                              className="w-full px-3 py-2 rounded-lg font-body text-sm text-foreground placeholder:text-muted-foreground"
                              style={{
                                background: "rgba(255,255,255,0.06)",
                                border: "1px solid rgba(180,80,255,0.25)",
                                outline: "none",
                              }}
                              onFocus={(e) => {
                                e.target.style.borderColor =
                                  "rgba(180,80,255,0.6)";
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor =
                                  "rgba(180,80,255,0.25)";
                              }}
                            />
                          </div>

                          {/* Winner Coins */}
                          <div>
                            <label
                              htmlFor={`declare-winner-coins-${t.id}`}
                              className="block text-xs font-display font-bold uppercase tracking-wider mb-1"
                              style={{ color: "rgba(255,255,255,0.4)" }}
                            >
                              Winner Coins to Give (LC)
                            </label>
                            <input
                              id={`declare-winner-coins-${t.id}`}
                              data-ocid={`admin.match.winner_coins_input.${i + 1}`}
                              type="number"
                              min="0"
                              value={winnerCoinsInput}
                              onChange={(e) =>
                                setWinnerCoinsInput(e.target.value)
                              }
                              placeholder="0"
                              className="w-full px-3 py-2 rounded-lg font-body text-sm text-foreground placeholder:text-muted-foreground"
                              style={{
                                background: "rgba(255,255,255,0.06)",
                                border: "1px solid rgba(180,80,255,0.25)",
                                outline: "none",
                              }}
                              onFocus={(e) => {
                                e.target.style.borderColor =
                                  "rgba(180,80,255,0.6)";
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor =
                                  "rgba(180,80,255,0.25)";
                              }}
                            />
                          </div>

                          {/* Loser Return Coins */}
                          <div>
                            <label
                              htmlFor={`declare-loser-coins-${t.id}`}
                              className="block text-xs font-display font-bold uppercase tracking-wider mb-1"
                              style={{ color: "rgba(255,255,255,0.4)" }}
                            >
                              Loser Return Coins (LC)
                            </label>
                            <input
                              id={`declare-loser-coins-${t.id}`}
                              data-ocid={`admin.match.loser_coins_input.${i + 1}`}
                              type="number"
                              min="0"
                              value={loserCoinsInput}
                              onChange={(e) =>
                                setLoserCoinsInput(e.target.value)
                              }
                              placeholder="0"
                              className="w-full px-3 py-2 rounded-lg font-body text-sm text-foreground placeholder:text-muted-foreground"
                              style={{
                                background: "rgba(255,255,255,0.06)",
                                border: "1px solid rgba(180,80,255,0.25)",
                                outline: "none",
                              }}
                              onFocus={(e) => {
                                e.target.style.borderColor =
                                  "rgba(180,80,255,0.6)";
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor =
                                  "rgba(180,80,255,0.25)";
                              }}
                            />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            data-ocid={`admin.match.declare_confirm_button.${i + 1}`}
                            onClick={() => handleDeclareResult(t.id)}
                            disabled={isDeclaring}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-display font-bold text-xs uppercase tracking-wider transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                            style={{
                              background:
                                "linear-gradient(135deg, rgba(180,80,255,0.9), rgba(120,40,200,0.9))",
                              color: "#fff",
                            }}
                          >
                            {isDeclaring ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trophy className="w-3.5 h-3.5" />
                            )}
                            {isDeclaring ? "Declaring…" : "Declare"}
                          </button>
                          <button
                            type="button"
                            data-ocid={`admin.match.declare_cancel_button.${i + 1}`}
                            onClick={cancelDeclareForm}
                            disabled={isDeclaring}
                            className="px-3 py-2 rounded-lg font-display font-bold text-xs uppercase tracking-wider transition-all duration-200 hover:opacity-80 disabled:opacity-50"
                            style={{
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              color: "rgba(255,255,255,0.5)",
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Pending Deposits Section ─────────────────────────────── */
function PendingDepositsSection() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const {
    data: pendingDeposits = [],
    isFetching: isLoadingDeposits,
    refetch: refetchDeposits,
  } = useQuery<DepositRequest[]>({
    queryKey: ["pendingDeposits"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingDepositRequests();
    },
    enabled: !!actor && !isFetching,
  });

  async function handleApprove(req: DepositRequest) {
    if (!actor) return;
    setLoadingId(req.id);
    try {
      await actor.approveDepositRequest(req.id);
      toast.success(
        `Deposit approved! ₡${Number(req.amount).toLocaleString()} added to ${req.legendId}`,
      );
      queryClient.invalidateQueries({ queryKey: ["pendingDeposits"] });
      await refetchDeposits();
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve deposit request");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleReject(req: DepositRequest) {
    if (!actor) return;
    setLoadingId(req.id);
    try {
      await actor.rejectDepositRequest(req.id);
      toast.success("Deposit request rejected");
      queryClient.invalidateQueries({ queryKey: ["pendingDeposits"] });
      await refetchDeposits();
    } catch (err) {
      console.error(err);
      toast.error("Failed to reject deposit request");
    } finally {
      setLoadingId(null);
    }
  }

  function formatDate(ts: bigint): string {
    try {
      const ms = Number(ts) / 1_000_000;
      return new Date(ms).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  }

  return (
    <div
      className="rounded-2xl p-6 mb-8"
      style={{
        background: "rgba(13, 13, 26, 0.9)",
        border: "1px solid rgba(255,215,0,0.15)",
      }}
    >
      {/* Section heading */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="font-display font-bold text-base uppercase tracking-wider text-foreground">
            Pending Deposit Requests
          </h2>
          <span
            className="text-xs font-display font-black px-2.5 py-0.5 rounded-full"
            style={{
              background:
                pendingDeposits.length > 0
                  ? "rgba(255,165,0,0.2)"
                  : "rgba(255,255,255,0.08)",
              border:
                pendingDeposits.length > 0
                  ? "1px solid rgba(255,165,0,0.45)"
                  : "1px solid rgba(255,255,255,0.12)",
              color:
                pendingDeposits.length > 0
                  ? "#ffaa00"
                  : "rgba(255,255,255,0.4)",
            }}
          >
            {pendingDeposits.length} pending
          </span>
        </div>
        <button
          type="button"
          data-ocid="admin.deposit.refresh_button"
          onClick={() => refetchDeposits()}
          disabled={isLoadingDeposits}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-bold uppercase tracking-wider transition-all duration-200 hover:opacity-80 disabled:opacity-50"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          <RefreshCcw
            className={`w-3.5 h-3.5 ${isLoadingDeposits ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Loading state */}
      {isLoadingDeposits && pendingDeposits.length === 0 && (
        <div
          data-ocid="admin.deposit.loading_state"
          className="flex items-center justify-center py-10 gap-3 text-muted-foreground"
        >
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="font-body text-sm">Loading requests…</span>
        </div>
      )}

      {/* Empty state */}
      {!isLoadingDeposits && pendingDeposits.length === 0 && (
        <div
          data-ocid="admin.deposit.empty_state"
          className="rounded-xl py-12 text-center"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px dashed rgba(255,255,255,0.08)",
          }}
        >
          <Coins
            className="w-10 h-10 mx-auto mb-3"
            style={{ color: "rgba(255,255,255,0.15)" }}
          />
          <p className="font-body text-muted-foreground text-sm">
            No pending deposit requests
          </p>
        </div>
      )}

      {/* Requests list */}
      {pendingDeposits.length > 0 && (
        <div className="space-y-3">
          {pendingDeposits.map((req, i) => {
            const isProcessing = loadingId === req.id;
            return (
              <div
                key={req.id}
                data-ocid={`admin.deposit.item.${i + 1}`}
                className="rounded-xl p-4"
                style={{
                  background: "rgba(255,165,0,0.04)",
                  border: "1px solid rgba(255,165,0,0.15)",
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1.5">
                      <span className="font-display font-black text-lg text-foreground">
                        {req.legendId}
                      </span>
                      <span
                        className="font-display font-black text-base tabular-nums"
                        style={{ color: "#ffd700" }}
                      >
                        ₡{Number(req.amount).toLocaleString()} LC
                      </span>
                    </div>
                    <p
                      className="text-xs font-mono mb-1 truncate max-w-xs"
                      style={{ color: "rgba(255,255,255,0.5)" }}
                    >
                      TxID: {req.transactionId}
                    </p>
                    <p
                      className="text-xs font-body"
                      style={{ color: "rgba(255,255,255,0.3)" }}
                    >
                      {formatDate(req.submittedAt)}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      data-ocid={`admin.deposit.accept_button.${i + 1}`}
                      onClick={() => handleApprove(req)}
                      disabled={isProcessing || loadingId !== null}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-display font-bold text-xs uppercase tracking-wider transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                      style={{
                        background: "rgba(34,204,102,0.15)",
                        border: "1px solid rgba(34,204,102,0.4)",
                        color: "#22cc66",
                      }}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5" />
                      )}
                      Accept
                    </button>
                    <button
                      type="button"
                      data-ocid={`admin.deposit.reject_button.${i + 1}`}
                      onClick={() => handleReject(req)}
                      disabled={isProcessing || loadingId !== null}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-display font-bold text-xs uppercase tracking-wider transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                      style={{
                        background: "rgba(255,34,0,0.15)",
                        border: "1px solid rgba(255,34,0,0.4)",
                        color: "#ff4422",
                      }}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Ban className="w-3.5 h-3.5" />
                      )}
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
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

        {/* ── Match Management ── */}
        <MatchManagementSection />

        {/* ── Pending Deposit Requests ── */}
        <PendingDepositsSection />

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
