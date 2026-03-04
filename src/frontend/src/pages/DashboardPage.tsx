import type { backendInterface } from "@/backend";
import {
  type DepositRequest,
  DepositStatus,
  GameMode,
  type LeaderboardEntry,
  type Match,
  Result,
  Role,
  type Tournament,
  type Transaction,
  TransactionType,
  type UserProfile,
} from "@/backend.d";
import { CoinShower } from "@/components/CoinShower";
import { FireAnimation } from "@/components/FireAnimation";
import { FirstLoginModal } from "@/components/FirstLoginModal";
import { RifleAnimation } from "@/components/RifleAnimation";
import { WalletDisplay } from "@/components/WalletDisplay";
import { useActor } from "@/hooks/useActor";
import { useAuthStore } from "@/store/authStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  BarChart2,
  CheckCircle2,
  Clock,
  Copy,
  Edit2,
  Gamepad2,
  History,
  ImageIcon,
  Loader2,
  Lock,
  LogOut,
  Medal,
  Shield,
  Star,
  Swords,
  Trophy,
  User,
  Wallet,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

/* ─── Default Joker profile pic (FREE, always unlocked) ───────── */
const DEFAULT_PROFILE_PIC =
  "/assets/uploads/eca553eded03ba3da1b6cdce6d22ba73-1-1.jpg";

/* ─── Profile Picture Tiers ──────────────────────────────────── */
const AVATAR_TIERS = [
  {
    index: 1,
    src: "/assets/generated/avatar1-transparent.dim_200x200.png",
    required: 50,
    label: "T1",
    glowColor: "#ff4422",
  },
  {
    index: 2,
    src: "/assets/generated/avatar2-transparent.dim_200x200.png",
    required: 100,
    label: "T2",
    glowColor: "#0099ff",
  },
  {
    index: 3,
    src: "/assets/generated/avatar3-transparent.dim_200x200.png",
    required: 200,
    label: "T3",
    glowColor: "#22cc66",
  },
  {
    index: 4,
    src: "/assets/generated/avatar4-transparent.dim_200x200.png",
    required: 500,
    label: "T4",
    glowColor: "#ff9900",
  },
  {
    index: 5,
    src: "/assets/generated/avatar5-transparent.dim_200x200.png",
    required: 800,
    label: "T5",
    glowColor: "#cc44ff",
  },
  {
    index: 6,
    src: "/assets/generated/avatar6-transparent.dim_200x200.png",
    required: 1000,
    label: "T6",
    glowColor: "#ffd700",
  },
] as const;

/* ─── Get profile pic src by index ──────────────────────────── */
function getProfilePicSrc(picIndex: number): string {
  if (picIndex === 0) return DEFAULT_PROFILE_PIC;
  const tier = AVATAR_TIERS.find((t) => t.index === picIndex);
  return tier?.src ?? DEFAULT_PROFILE_PIC;
}

/* ─── helpers ─────────────────────────────────────────────── */

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

type TabId = "matches" | "ranking" | "play" | "deposit" | "profile";

/* ─── Leaderboard helpers ──────────────────────────────────── */

function getPrimeLevel(totalDeposited: bigint): string {
  const d = Number(totalDeposited);
  if (d >= 1000) return "Diamond";
  if (d >= 500) return "Platinum";
  if (d >= 200) return "Gold";
  if (d >= 100) return "Silver";
  return "Bronze";
}

/* ─── Match Row ────────────────────────────────────────────── */
function MatchHistoryRow({ match, index }: { match: Match; index: number }) {
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

  const resultLabel =
    match.result === Result.win
      ? "WIN"
      : match.result === Result.loss
        ? "LOSS"
        : "DRAW";

  return (
    <div
      data-ocid={`matches.item.${index}`}
      className="flex items-center justify-between py-3 px-4 rounded-xl"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        transition: "background 0.15s",
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
      <div className="flex items-center gap-3">
        <span
          className="text-xs font-display font-bold uppercase px-2 py-0.5 rounded"
          style={{
            background: `${resultColor}20`,
            color: resultColor,
            border: `1px solid ${resultColor}40`,
          }}
        >
          {resultLabel}
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

/* ─── Transaction Row ──────────────────────────────────────── */
function TransactionRow({ tx, index }: { tx: Transaction; index: number }) {
  const isDeposit = tx.txType === TransactionType.deposit;
  const color = isDeposit ? "#22cc66" : "#ff4422";
  return (
    <div
      data-ocid={`deposit.transaction.item.${index}`}
      className="flex items-center justify-between py-3 px-4 rounded-xl"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}20`, border: `1px solid ${color}40` }}
        >
          <span className="text-xs font-bold" style={{ color }}>
            {isDeposit ? "+" : "−"}
          </span>
        </div>
        <div>
          <div className="text-sm font-body text-foreground line-clamp-1 max-w-[140px]">
            {tx.description}
          </div>
          <div className="text-xs font-body text-muted-foreground">
            {formatDate(tx.date)}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-display font-bold px-2 py-0.5 rounded uppercase"
          style={{
            background: `${color}15`,
            color,
            border: `1px solid ${color}30`,
          }}
        >
          {isDeposit ? "DEP" : "WIT"}
        </span>
        <span
          className="text-sm font-display font-bold tabular-nums"
          style={{ color }}
        >
          {isDeposit ? "+" : "−"}₡{Number(tx.amount).toLocaleString()}
        </span>
      </div>
    </div>
  );
}

/* ─── Deposit Tab ──────────────────────────────────────────── */
function DepositTab({
  balance,
  transactions,
  actor,
  isFetching,
}: {
  balance: bigint;
  transactions: Transaction[];
  actor: backendInterface | null;
  isFetching: boolean;
}) {
  const queryClient = useQueryClient();
  const [pkrAmount, setPkrAmount] = useState("");
  const [txId, setTxId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: myRequests = [], refetch: refetchRequests } = useQuery<
    DepositRequest[]
  >({
    queryKey: ["myDepositRequests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyDepositRequests();
    },
    enabled: !!actor && !isFetching,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(pkrAmount);
    if (!pkrAmount || amount <= 0) {
      toast.error("Enter a valid amount in PKR");
      return;
    }
    if (!txId.trim()) {
      toast.error("Enter your JazzCash Transaction ID");
      return;
    }
    if (!actor) return;
    setIsSubmitting(true);
    try {
      await actor.submitDepositRequest(BigInt(amount), txId.trim());
      toast.success("Request submitted! Admin will approve shortly.");
      setPkrAmount("");
      setTxId("");
      await refetchRequests();
      queryClient.invalidateQueries({ queryKey: ["myDepositRequests"] });
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function copyNumber() {
    navigator.clipboard.writeText("03242646964").then(() => {
      toast.success("Number copied!");
    });
  }

  function statusBadge(status: DepositStatus) {
    if (status === DepositStatus.approved)
      return (
        <span
          className="text-xs font-display font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider"
          style={{
            background: "rgba(34,204,102,0.15)",
            border: "1px solid rgba(34,204,102,0.4)",
            color: "#22cc66",
          }}
        >
          APPROVED
        </span>
      );
    if (status === DepositStatus.rejected)
      return (
        <span
          className="text-xs font-display font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider"
          style={{
            background: "rgba(255,34,0,0.15)",
            border: "1px solid rgba(255,34,0,0.4)",
            color: "#ff4422",
          }}
        >
          REJECTED
        </span>
      );
    return (
      <span
        className="text-xs font-display font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider"
        style={{
          background: "rgba(255,165,0,0.15)",
          border: "1px solid rgba(255,165,0,0.4)",
          color: "#ffaa00",
        }}
      >
        PENDING
      </span>
    );
  }

  return (
    <section
      className="animate-tab-in px-4 py-6 space-y-6"
      aria-label="Wallet & Deposit"
    >
      {/* ── Balance display ── */}
      <div
        className="rounded-2xl p-6 text-center relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,153,0,0.06))",
          border: "1px solid rgba(255,215,0,0.25)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background:
              "linear-gradient(90deg, transparent, #ffd700, transparent)",
          }}
        />
        <p
          className="text-xs font-body uppercase tracking-[0.3em] mb-2"
          style={{ color: "rgba(255,215,0,0.6)" }}
        >
          Legend Coins Balance
        </p>
        <div
          className="font-display font-black text-4xl tabular-nums mb-1"
          style={{
            color: "#ffd700",
            textShadow: "0 0 20px rgba(255,215,0,0.5)",
          }}
        >
          ₡{Number(balance).toLocaleString()}
        </div>
        <p className="text-xs font-body text-muted-foreground">
          Available to spend in tournaments
        </p>
      </div>

      {/* ── JazzCash Instructions ── */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: "rgba(34,204,102,0.06)",
          border: "1px solid rgba(34,204,102,0.2)",
        }}
      >
        <h3
          className="font-display font-black text-base uppercase tracking-wider mb-3"
          style={{ color: "#22cc66" }}
        >
          Deposit via JazzCash
        </h3>
        <p
          className="text-xs font-body mb-4"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          Send any amount to this JazzCash number, then fill in the form below
          to submit your deposit request.
        </p>
        <button
          type="button"
          data-ocid="deposit.jazzcash_copy_button"
          onClick={copyNumber}
          className="w-full flex items-center justify-between gap-3 px-5 py-4 rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
          style={{
            background: "rgba(34,204,102,0.1)",
            border: "1px solid rgba(34,204,102,0.35)",
          }}
        >
          <span
            className="font-display font-black text-2xl tabular-nums tracking-widest"
            style={{
              color: "#22cc66",
              textShadow: "0 0 16px rgba(34,204,102,0.5)",
            }}
          >
            0324-2646964
          </span>
          <Copy
            className="w-5 h-5 flex-shrink-0"
            style={{ color: "rgba(34,204,102,0.7)" }}
          />
        </button>
        <p
          className="text-xs font-body mt-2 text-center"
          style={{ color: "rgba(34,204,102,0.5)" }}
        >
          Tap number to copy
        </p>
      </div>

      {/* ── Deposit Request Form ── */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <h3 className="font-display font-black text-base uppercase tracking-wider mb-4 text-foreground">
          Submit Deposit Request
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="deposit-amount"
              className="block text-xs font-display font-bold uppercase tracking-wider mb-1.5"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Amount (PKR)
            </label>
            <input
              id="deposit-amount"
              data-ocid="deposit.amount_input"
              type="number"
              min="1"
              value={pkrAmount}
              onChange={(e) => setPkrAmount(e.target.value)}
              placeholder="Enter amount in PKR"
              className="w-full px-4 py-3 rounded-xl font-body text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                outline: "none",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(34,204,102,0.5)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255,255,255,0.1)";
              }}
            />
          </div>
          <div>
            <label
              htmlFor="deposit-txid"
              className="block text-xs font-display font-bold uppercase tracking-wider mb-1.5"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              JazzCash Transaction ID
            </label>
            <input
              id="deposit-txid"
              data-ocid="deposit.txid_input"
              type="text"
              value={txId}
              onChange={(e) => setTxId(e.target.value)}
              placeholder="Enter your JazzCash Transaction ID"
              className="w-full px-4 py-3 rounded-xl font-body text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                outline: "none",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(34,204,102,0.5)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255,255,255,0.1)";
              }}
            />
          </div>
          <button
            type="submit"
            data-ocid="deposit.submit_button"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-display font-bold text-sm uppercase tracking-wider transition-all duration-200 hover:opacity-90 disabled:opacity-50"
            style={{
              background: isSubmitting
                ? "rgba(34,204,102,0.2)"
                : "linear-gradient(135deg, rgba(34,204,102,0.9), rgba(0,180,80,0.9))",
              color: isSubmitting ? "rgba(34,204,102,0.8)" : "#fff",
              border: "1px solid rgba(34,204,102,0.3)",
            }}
          >
            {isSubmitting ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Submitting…
              </>
            ) : (
              "Submit Request"
            )}
          </button>
        </form>
      </div>

      {/* ── My Deposit Requests ── */}
      <div>
        <h3 className="font-display font-bold text-sm uppercase tracking-wider text-foreground mb-3">
          My Deposit Requests
        </h3>
        {myRequests.length === 0 ? (
          <div
            data-ocid="deposit.request.empty_state"
            className="rounded-xl py-12 text-center"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px dashed rgba(255,255,255,0.08)",
            }}
          >
            <Wallet
              className="w-10 h-10 mx-auto mb-3"
              style={{ color: "rgba(255,255,255,0.15)" }}
            />
            <p className="font-body text-muted-foreground text-sm">
              No deposit requests yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {[...myRequests].reverse().map((req, i) => (
              <div
                key={req.id}
                data-ocid={`deposit.request.item.${i + 1}`}
                className="flex items-start justify-between gap-3 py-3 px-4 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className="font-display font-black text-base tabular-nums"
                      style={{ color: "#ffd700" }}
                    >
                      ₡{Number(req.amount).toLocaleString()} LC
                    </span>
                    {statusBadge(req.status)}
                  </div>
                  <p
                    className="text-xs font-mono truncate max-w-[200px]"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    ID: {req.transactionId}
                  </p>
                  <p
                    className="text-xs font-body mt-0.5"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    {formatDate(req.submittedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Transaction History ── */}
      <div>
        <h3 className="font-display font-bold text-sm uppercase tracking-wider text-foreground mb-3">
          Transaction History
        </h3>
        {transactions.length === 0 ? (
          <div
            data-ocid="deposit.transaction.empty_state"
            className="rounded-xl py-12 text-center"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px dashed rgba(255,255,255,0.08)",
            }}
          >
            <Wallet
              className="w-10 h-10 mx-auto mb-3"
              style={{ color: "rgba(255,255,255,0.15)" }}
            />
            <p className="font-body text-muted-foreground text-sm">
              No transactions yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {[...transactions].reverse().map((tx, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: transactions have no unique ID
              <TransactionRow key={`tx-${i}`} tx={tx} index={i + 1} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── Category badge colors ────────────────────────────────── */
function categoryColor(cat: string): {
  bg: string;
  border: string;
  text: string;
} {
  const c = cat.toLowerCase();
  if (c.includes("solo") || c.includes("lone"))
    return {
      bg: "rgba(255,34,0,0.12)",
      border: "rgba(255,34,0,0.35)",
      text: "#ff4422",
    };
  if (c.includes("duo"))
    return {
      bg: "rgba(255,180,0,0.12)",
      border: "rgba(255,180,0,0.35)",
      text: "#ffb400",
    };
  if (c.includes("squad"))
    return {
      bg: "rgba(0,153,255,0.12)",
      border: "rgba(0,153,255,0.35)",
      text: "#0099ff",
    };
  if (c.includes("cs"))
    return {
      bg: "rgba(0,204,102,0.12)",
      border: "rgba(0,204,102,0.35)",
      text: "#00cc66",
    };
  return {
    bg: "rgba(180,80,255,0.12)",
    border: "rgba(180,80,255,0.35)",
    text: "#b450ff",
  };
}

/* ─── View Details Modal ───────────────────────────────────── */
function ViewDetailsModal({
  tournament,
  legendId,
  actor,
  onClose,
}: {
  tournament: Tournament;
  legendId: string | null;
  actor: backendInterface | null;
  onClose: () => void;
}) {
  const { data: roomInfo, isLoading: isLoadingRoom } = useQuery({
    queryKey: ["tournamentRoom", tournament.id, legendId],
    queryFn: async () => {
      if (!actor || !legendId) return null;
      return actor.getTournamentRoom(tournament.id, legendId);
    },
    enabled: !!actor && !!legendId,
  });

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied!`);
    });
  }

  const hasRoomSet = roomInfo?.roomId && roomInfo.roomId.trim() !== "";

  return (
    /* Backdrop */
    // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop close handled via Escape in close button
    <div
      data-ocid="play.tournament.modal"
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Card */}
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden animate-fade-up"
        style={{
          background: "rgba(13,13,26,0.98)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div
          className="relative p-5"
          style={{
            background:
              "linear-gradient(135deg, rgba(34,204,102,0.08), rgba(0,180,80,0.04))",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background:
                "linear-gradient(90deg, transparent, #22cc66 40%, transparent)",
            }}
          />
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p
                className="text-xs font-body uppercase tracking-[0.2em] mb-0.5"
                style={{ color: "rgba(34,204,102,0.6)" }}
              >
                Match Details
              </p>
              <h3 className="font-display font-black text-lg text-foreground leading-snug truncate">
                {tournament.title}
              </h3>
              <p
                className="text-xs font-body mt-0.5"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                {tournament.category} · {tournament.mode}
              </p>
            </div>
            <button
              type="button"
              data-ocid="play.tournament.close_button"
              onClick={onClose}
              className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-opacity hover:opacity-70"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Loading */}
          {isLoadingRoom && (
            <div
              data-ocid="play.tournament.loading_state"
              className="flex items-center justify-center gap-2 py-6 text-muted-foreground"
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-body text-sm">Fetching room details…</span>
            </div>
          )}

          {/* Wait state */}
          {!isLoadingRoom && !hasRoomSet && (
            <div
              data-ocid="play.tournament.success_state"
              className="rounded-xl p-5 text-center"
              style={{
                background: "rgba(255,170,0,0.06)",
                border: "1px solid rgba(255,170,0,0.2)",
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{
                  background: "rgba(255,170,0,0.12)",
                  border: "1px solid rgba(255,170,0,0.3)",
                  animation: "profileGlowPulse 2s ease-in-out infinite",
                }}
              >
                <Clock className="w-6 h-6" style={{ color: "#ffaa00" }} />
              </div>
              <p
                className="font-display font-black text-sm uppercase tracking-wider mb-1"
                style={{ color: "#ffaa00" }}
              >
                Please Wait
              </p>
              <p
                className="font-body text-xs"
                style={{ color: "rgba(255,170,0,0.7)" }}
              >
                Admin has not set the Room ID &amp; Password yet.
                <br />
                Please wait for Admin response.
              </p>
            </div>
          )}

          {/* Room details */}
          {!isLoadingRoom && hasRoomSet && (
            <div className="space-y-3">
              {/* Room ID */}
              <div>
                <p
                  className="text-xs font-display font-bold uppercase tracking-[0.2em] mb-1.5"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  Room ID
                </p>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(roomInfo?.roomId ?? "", "Room ID")
                  }
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:opacity-80 active:scale-[0.99]"
                  style={{
                    background: "rgba(255,215,0,0.07)",
                    border: "1px solid rgba(255,215,0,0.25)",
                  }}
                >
                  <span
                    className="font-display font-black text-xl tabular-nums tracking-widest"
                    style={{
                      color: "#ffd700",
                      textShadow: "0 0 12px rgba(255,215,0,0.4)",
                    }}
                  >
                    {roomInfo?.roomId}
                  </span>
                  <Copy
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: "rgba(255,215,0,0.6)" }}
                  />
                </button>
                <p
                  className="text-xs font-body mt-1 text-center"
                  style={{ color: "rgba(255,215,0,0.4)" }}
                >
                  Tap to copy
                </p>
              </div>

              {/* Room Password */}
              <div>
                <p
                  className="text-xs font-display font-bold uppercase tracking-[0.2em] mb-1.5"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  Password
                </p>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(roomInfo?.roomPassword ?? "", "Password")
                  }
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:opacity-80 active:scale-[0.99]"
                  style={{
                    background: "rgba(34,204,102,0.07)",
                    border: "1px solid rgba(34,204,102,0.25)",
                  }}
                >
                  <span
                    className="font-display font-black text-xl tabular-nums tracking-widest"
                    style={{
                      color: "#22cc66",
                      textShadow: "0 0 12px rgba(34,204,102,0.4)",
                    }}
                  >
                    {roomInfo?.roomPassword}
                  </span>
                  <Copy
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: "rgba(34,204,102,0.6)" }}
                  />
                </button>
                <p
                  className="text-xs font-body mt-1 text-center"
                  style={{ color: "rgba(34,204,102,0.4)" }}
                >
                  Tap to copy
                </p>
              </div>
            </div>
          )}

          {/* Entry / Profit / Returning recap */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div
              className="rounded-lg px-2 py-2 text-center"
              style={{
                background: "rgba(255,215,0,0.05)",
                border: "1px solid rgba(255,215,0,0.12)",
              }}
            >
              <p
                className="text-xs font-body mb-0.5"
                style={{ color: "rgba(255,215,0,0.5)" }}
              >
                Entry
              </p>
              <p
                className="font-display font-black text-sm tabular-nums truncate"
                style={{ color: "#ffd700" }}
              >
                ₡{Number(tournament.entryFee).toLocaleString()}
              </p>
            </div>
            <div
              className="rounded-lg px-2 py-2 text-center"
              style={{
                background: "rgba(34,204,102,0.05)",
                border: "1px solid rgba(34,204,102,0.12)",
              }}
            >
              <p
                className="text-xs font-body mb-0.5"
                style={{ color: "rgba(34,204,102,0.5)" }}
              >
                Profit
              </p>
              <p
                className="font-display font-black text-sm truncate"
                style={{ color: "#22cc66" }}
              >
                {tournament.prizePool}
              </p>
            </div>
            <div
              className="rounded-lg px-2 py-2 text-center"
              style={{
                background: "rgba(0,153,255,0.05)",
                border: "1px solid rgba(0,153,255,0.12)",
              }}
            >
              <p
                className="text-xs font-body mb-0.5"
                style={{ color: "rgba(0,153,255,0.5)" }}
              >
                Returning
              </p>
              <p
                className="font-display font-black text-sm tabular-nums truncate"
                style={{ color: "#0099ff" }}
              >
                ₡{Number(tournament.returningCoins).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            data-ocid="play.tournament.cancel_button"
            onClick={onClose}
            className="w-full py-3 rounded-xl font-display font-bold text-sm uppercase tracking-wider transition-all duration-200 hover:opacity-80"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Player Info Card ─────────────────────────────────────── */
function PlayerInfoCard({
  profile,
  actor,
  refetchProfile,
}: {
  profile: UserProfile | null | undefined;
  actor: backendInterface | null;
  refetchProfile: () => void;
}) {
  const [showEdit, setShowEdit] = useState(false);
  const [editGameName, setEditGameName] = useState("");
  const [editGameUID, setEditGameUID] = useState("");
  const [editJazzCash, setEditJazzCash] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function openEdit() {
    setEditGameName(profile?.gameName ?? "");
    setEditGameUID(profile?.gameUID ?? "");
    setEditJazzCash(profile?.jazzCashNumber ?? "");
    setShowEdit(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!actor) return;
    setIsSaving(true);
    try {
      await actor.updatePlayerInfo(
        editGameName.trim(),
        editGameUID.trim(),
        editJazzCash.trim(),
      );
      toast.success("Player info updated!");
      refetchProfile();
      setShowEdit(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update player info.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      {/* Edit Modal */}
      {showEdit && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop close
        <div
          data-ocid="profile.player_info.modal"
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowEdit(false);
          }}
        >
          <div
            className="w-full max-w-sm rounded-2xl overflow-hidden"
            style={{
              background: "rgba(13,13,26,0.98)",
              border: "1px solid rgba(0,153,255,0.25)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
            }}
          >
            {/* Modal Header */}
            <div
              className="relative p-5"
              style={{
                background:
                  "linear-gradient(135deg, rgba(0,153,255,0.08), rgba(0,102,255,0.04))",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "2px",
                  background:
                    "linear-gradient(90deg, transparent, #0099ff 40%, transparent)",
                }}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5" style={{ color: "#0099ff" }} />
                  <h3
                    className="font-display font-black text-base uppercase tracking-wider"
                    style={{ color: "#0099ff" }}
                  >
                    Edit Player Info
                  </h3>
                </div>
                <button
                  type="button"
                  data-ocid="profile.player_info.close_button"
                  onClick={() => setShowEdit(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-opacity hover:opacity-70"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label
                  htmlFor="edit-game-name"
                  className="block text-xs font-display font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Free Fire Name
                </label>
                <input
                  id="edit-game-name"
                  data-ocid="profile.player_info.game_name_input"
                  type="text"
                  value={editGameName}
                  onChange={(e) => setEditGameName(e.target.value)}
                  placeholder="Your Free Fire in-game name"
                  className="w-full px-4 py-3 rounded-xl font-body text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(0,153,255,0.25)",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(0,153,255,0.6)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(0,153,255,0.25)";
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="edit-game-uid"
                  className="block text-xs font-display font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Free Fire UID
                </label>
                <input
                  id="edit-game-uid"
                  data-ocid="profile.player_info.game_uid_input"
                  type="text"
                  value={editGameUID}
                  onChange={(e) => setEditGameUID(e.target.value)}
                  placeholder="Your Free Fire unique ID"
                  className="w-full px-4 py-3 rounded-xl font-body text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(0,153,255,0.25)",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(0,153,255,0.6)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(0,153,255,0.25)";
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="edit-jazzcash"
                  className="block text-xs font-display font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  JazzCash Number
                </label>
                <input
                  id="edit-jazzcash"
                  data-ocid="profile.player_info.jazzcash_input"
                  type="tel"
                  value={editJazzCash}
                  onChange={(e) => setEditJazzCash(e.target.value)}
                  placeholder="Your JazzCash mobile number"
                  className="w-full px-4 py-3 rounded-xl font-body text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(0,153,255,0.25)",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(0,153,255,0.6)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(0,153,255,0.25)";
                  }}
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  data-ocid="profile.player_info.save_button"
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-display font-bold text-sm uppercase tracking-wider transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(0,153,255,0.9), rgba(0,100,200,0.9))",
                    color: "#fff",
                  }}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : null}
                  {isSaving ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  data-ocid="profile.player_info.cancel_button"
                  onClick={() => setShowEdit(false)}
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-xl font-display font-bold text-sm uppercase tracking-wider transition-all duration-200 hover:opacity-80 disabled:opacity-50"
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
        </div>
      )}

      {/* Card */}
      <div
        data-ocid="profile.player_info.card"
        className="rounded-xl p-4 mb-5"
        style={{
          background: "rgba(0,102,255,0.04)",
          border: "1px solid rgba(0,153,255,0.18)",
        }}
      >
        {/* Card header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Gamepad2
              className="w-4 h-4"
              style={{ color: "rgba(0,153,255,0.8)" }}
            />
            <h4
              className="font-display font-black text-xs uppercase tracking-[0.2em]"
              style={{ color: "rgba(0,153,255,0.9)" }}
            >
              Player Info
            </h4>
          </div>
          <button
            type="button"
            data-ocid="profile.player_info.edit_button"
            onClick={openEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-display font-bold text-xs uppercase tracking-wider transition-all duration-200 hover:opacity-80"
            style={{
              background: "rgba(0,153,255,0.1)",
              border: "1px solid rgba(0,153,255,0.25)",
              color: "#0099ff",
            }}
          >
            <Edit2 className="w-3 h-3" />
            Edit
          </button>
        </div>

        {/* Info rows */}
        <div className="space-y-2">
          {/* Read-only Legend ID row */}
          <div
            className="flex items-center justify-between py-2 px-3 rounded-lg"
            style={{
              background: "rgba(255,215,0,0.04)",
              border: "1px solid rgba(255,215,0,0.12)",
            }}
          >
            <div className="flex items-center gap-2">
              <Lock
                className="w-3.5 h-3.5 flex-shrink-0"
                style={{ color: "rgba(255,215,0,0.6)" }}
              />
              <span
                className="text-xs font-display font-bold uppercase tracking-wider"
                style={{ color: "rgba(255,215,0,0.55)" }}
              >
                Legend ID
              </span>
            </div>
            <span
              className="text-sm font-mono font-medium tabular-nums"
              style={{ color: "rgba(255,215,0,0.8)" }}
            >
              {profile?.legendId || "—"}
            </span>
          </div>

          {[
            { label: "Game Name", value: profile?.gameName || "—", icon: "🎮" },
            { label: "Game UID", value: profile?.gameUID || "—", icon: "🆔" },
            {
              label: "JazzCash",
              value: profile?.jazzCashNumber || "—",
              icon: "💳",
            },
          ].map(({ label, value, icon }) => (
            <div
              key={label}
              className="flex items-center justify-between py-2 px-3 rounded-lg"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div className="flex items-center gap-2">
                <span style={{ fontSize: "14px" }}>{icon}</span>
                <span
                  className="text-xs font-display font-bold uppercase tracking-wider"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  {label}
                </span>
              </div>
              <span
                className="text-sm font-body font-medium tabular-nums"
                style={{
                  color:
                    value === "—"
                      ? "rgba(255,255,255,0.2)"
                      : "rgba(255,255,255,0.85)",
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ─── Tournament Card ──────────────────────────────────────── */
function TournamentCard({
  tournament,
  index,
  isJoined,
  isJoining,
  onJoin,
  legendId,
  actor,
  balance,
}: {
  tournament: Tournament;
  index: number;
  isJoined: boolean;
  isJoining: boolean;
  onJoin: () => void;
  legendId: string | null;
  actor: backendInterface | null;
  balance: bigint;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const fill = Number(tournament.currentPlayers);
  const max = Number(tournament.maxPlayers);
  const fillPct = max > 0 ? Math.min(Math.round((fill / max) * 100), 100) : 0;
  const catColor = categoryColor(tournament.category);
  const isFull = fill >= max;
  const hasEnough = Number(balance) >= Number(tournament.entryFee);

  return (
    <>
      {showDetails && (
        <ViewDetailsModal
          tournament={tournament}
          legendId={legendId}
          actor={actor}
          onClose={() => setShowDetails(false)}
        />
      )}
      <div
        data-ocid={`play.tournament.item.${index}`}
        className="rounded-2xl overflow-hidden flex flex-col transition-all duration-200"
        style={{
          background: "rgba(13,13,26,0.95)",
          border: isJoined
            ? "1px solid rgba(34,204,102,0.25)"
            : "1px solid rgba(255,255,255,0.08)",
          boxShadow: isJoined
            ? "0 4px 24px rgba(34,204,102,0.08)"
            : "0 4px 24px rgba(0,0,0,0.3)",
        }}
      >
        {/* Tournament image */}
        <div
          className="relative flex-shrink-0"
          style={{ height: 140, background: "rgba(255,255,255,0.04)" }}
        >
          {tournament.imageUrl ? (
            <img
              src={tournament.imageUrl}
              alt={tournament.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <Swords
                className="w-10 h-10"
                style={{ color: "rgba(255,60,0,0.35)" }}
              />
              <span
                className="text-xs font-display font-bold uppercase tracking-wider"
                style={{ color: "rgba(255,255,255,0.2)" }}
              >
                No Image
              </span>
            </div>
          )}
          {/* Gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, transparent 40%, rgba(13,13,26,0.9) 100%)",
            }}
          />
          {/* Category badge over image */}
          <div className="absolute top-3 left-3">
            <span
              className="text-xs font-display font-black px-2.5 py-1 rounded-full"
              style={{
                background: catColor.bg,
                border: `1px solid ${catColor.border}`,
                color: catColor.text,
                backdropFilter: "blur(8px)",
              }}
            >
              {tournament.category}
            </span>
          </div>
          {/* Joined badge */}
          {isJoined && (
            <div className="absolute top-3 right-3">
              <span
                className="text-xs font-display font-black px-2.5 py-1 rounded-full"
                style={{
                  background: "rgba(34,204,102,0.85)",
                  color: "#fff",
                  backdropFilter: "blur(8px)",
                }}
              >
                JOINED ✓
              </span>
            </div>
          )}
          {!isJoined && isFull && (
            <div className="absolute top-3 right-3">
              <span
                className="text-xs font-display font-black px-2.5 py-1 rounded-full"
                style={{
                  background: "rgba(255,34,0,0.8)",
                  color: "#fff",
                  backdropFilter: "blur(8px)",
                }}
              >
                FULL
              </span>
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="p-4 flex flex-col flex-1 gap-3">
          {/* Title + Mode */}
          <div>
            <h4 className="font-display font-black text-base text-foreground leading-snug mb-0.5">
              {tournament.title}
            </h4>
            <p
              className="text-xs font-body"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              {tournament.mode}
            </p>
          </div>

          {/* Entry fee + Profit + Returning row */}
          <div className="grid grid-cols-3 gap-2">
            <div
              className="rounded-lg px-2 py-2 text-center"
              style={{
                background: "rgba(255,215,0,0.06)",
                border: "1px solid rgba(255,215,0,0.15)",
              }}
            >
              <p
                className="text-xs font-body mb-0.5"
                style={{ color: "rgba(255,215,0,0.5)" }}
              >
                Entry
              </p>
              <p
                className="font-display font-black text-sm tabular-nums truncate"
                style={{ color: "#ffd700" }}
              >
                ₡{Number(tournament.entryFee).toLocaleString()}
              </p>
            </div>
            <div
              className="rounded-lg px-2 py-2 text-center"
              style={{
                background: "rgba(34,204,102,0.06)",
                border: "1px solid rgba(34,204,102,0.15)",
              }}
            >
              <p
                className="text-xs font-body mb-0.5"
                style={{ color: "rgba(34,204,102,0.5)" }}
              >
                Profit
              </p>
              <p
                className="font-display font-black text-sm truncate"
                style={{ color: "#22cc66" }}
              >
                {tournament.prizePool}
              </p>
            </div>
            <div
              className="rounded-lg px-2 py-2 text-center"
              style={{
                background: "rgba(0,153,255,0.06)",
                border: "1px solid rgba(0,153,255,0.15)",
              }}
            >
              <p
                className="text-xs font-body mb-0.5"
                style={{ color: "rgba(0,153,255,0.5)" }}
              >
                Returning
              </p>
              <p
                className="font-display font-black text-sm tabular-nums truncate"
                style={{ color: "#0099ff" }}
              >
                ₡{Number(tournament.returningCoins).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Players progress */}
          <div>
            <div
              className="flex justify-between text-xs font-body mb-1.5"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              <span>Players</span>
              <span className="font-display font-bold text-foreground">
                {fill} / {max}
              </span>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${fillPct}%`,
                  background: isFull
                    ? "linear-gradient(90deg, #ff4422aa, #ff4422)"
                    : "linear-gradient(90deg, rgba(255,180,0,0.7), #ffb400)",
                }}
              />
            </div>
          </div>

          {/* Action button -- VIEW DETAILS if joined, JOIN/disabled otherwise */}
          {isJoined ? (
            <button
              type="button"
              data-ocid={`play.tournament.secondary_button.${index}`}
              onClick={() => setShowDetails(true)}
              className="w-full py-3 rounded-xl font-display font-bold text-sm uppercase tracking-wider transition-all duration-200 hover:opacity-90 flex items-center justify-center gap-2 mt-auto"
              style={{
                background:
                  "linear-gradient(135deg, rgba(34,204,102,0.85), rgba(0,160,70,0.85))",
                color: "#fff",
              }}
            >
              <Shield className="w-4 h-4" />
              View Details
            </button>
          ) : !hasEnough ? (
            <button
              type="button"
              data-ocid={`play.tournament.join_button.${index}`}
              disabled
              className="w-full py-3 rounded-xl font-display font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 mt-auto opacity-50 cursor-not-allowed"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              Insufficient Coins
            </button>
          ) : (
            <button
              type="button"
              data-ocid={`play.tournament.join_button.${index}`}
              onClick={onJoin}
              disabled={isJoining || isFull}
              className="w-full py-3 rounded-xl font-display font-bold text-sm uppercase tracking-wider transition-all duration-200 hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 mt-auto"
              style={{
                background: isFull
                  ? "rgba(255,255,255,0.06)"
                  : isJoining
                    ? "rgba(255,60,0,0.4)"
                    : "linear-gradient(135deg, rgba(255,60,0,0.9), rgba(200,20,0,0.9))",
                border: isFull ? "1px solid rgba(255,255,255,0.1)" : "none",
                color: isFull ? "rgba(255,255,255,0.35)" : "#fff",
              }}
            >
              {isJoining ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isFull ? null : (
                <Swords className="w-4 h-4" />
              )}
              {isJoining ? "Joining…" : isFull ? "Match Full" : "JOIN"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

/* ─── Play Tab ─────────────────────────────────────────────── */
function PlayTab({
  legendId,
  gameName,
  balance,
  actor,
  isFetchingActor,
  joiningTournamentId,
  onJoin,
  joinedMatchIds,
}: {
  legendId: string | null;
  gameName: string | null;
  balance: bigint;
  actor: backendInterface | null;
  isFetchingActor: boolean;
  joiningTournamentId: string | null;
  onJoin: (t: Tournament) => void;
  joinedMatchIds: Set<string>;
}) {
  const { data: activeTournaments = [], isLoading } = useQuery<Tournament[]>({
    queryKey: ["activeTournaments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveTournaments();
    },
    enabled: !!actor && !isFetchingActor,
    refetchInterval: 30_000, // refresh every 30s
  });

  return (
    <section className="animate-tab-in" aria-label="Active matches">
      {/* Welcome banner */}
      <div
        className="mx-4 mt-6 mb-6 rounded-2xl p-5 overflow-hidden relative"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,34,0,0.08), rgba(0,102,255,0.08))",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: "linear-gradient(90deg, #ff2200, #ffd700 50%, #0066ff)",
          }}
        />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p
              className="text-xs font-body uppercase tracking-[0.3em] mb-0.5"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Commander Online
            </p>
            <h2 className="font-display font-black text-xl text-foreground">
              Welcome,{" "}
              <span style={{ color: "#ff4422" }}>{gameName || legendId}</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <WalletDisplay balance={balance} />
          </div>
        </div>
      </div>

      {/* Heading */}
      <div className="px-4 mb-4">
        <h3 className="font-display font-bold text-base uppercase tracking-wider text-foreground">
          Active Matches
        </h3>
        <p className="text-xs font-body text-muted-foreground mt-0.5">
          Join a tournament — entry fees are deducted from your wallet
        </p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div
          data-ocid="play.loading_state"
          className="flex items-center justify-center py-16 gap-3 text-muted-foreground px-4"
        >
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="font-body text-sm">Loading matches…</span>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && activeTournaments.length === 0 && (
        <div
          data-ocid="play.empty_state"
          className="mx-4 rounded-xl py-16 text-center"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px dashed rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex justify-center mb-3">
            <Swords
              className="w-12 h-12"
              style={{ color: "rgba(255,60,0,0.2)" }}
            />
          </div>
          <p className="font-display font-bold text-sm text-muted-foreground">
            No active matches right now.
          </p>
          <p className="text-xs font-body text-muted-foreground mt-1">
            Check back soon!
          </p>
        </div>
      )}

      {/* Tournament grid */}
      {!isLoading && activeTournaments.length > 0 && (
        <div className="px-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {activeTournaments.map((t, i) => (
            <TournamentCard
              key={t.id}
              tournament={t}
              index={i + 1}
              isJoined={joinedMatchIds.has(t.id)}
              isJoining={joiningTournamentId === t.id}
              onJoin={() => onJoin(t)}
              legendId={legendId}
              actor={actor}
              balance={balance}
            />
          ))}
        </div>
      )}

      {/* Spacer */}
      <div className="h-6" />
    </section>
  );
}

/* ─── Main Dashboard ───────────────────────────────────────── */
export function DashboardPage() {
  const navigate = useNavigate();
  const { legendId, role } = useAuthStore();
  const logout = useAuthStore((s) => s.logout);
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabId>("play");
  const [rankingSection, setRankingSection] = useState<
    "global" | "prime" | "oldest"
  >("global");
  const [joiningTournamentId, setJoiningTournamentId] = useState<string | null>(
    null,
  );
  const [showCoinShower, setShowCoinShower] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(() => {
    if (!legendId) return false;
    const key = `lxa_welcome_shown_${legendId}`;
    return !localStorage.getItem(key);
  });

  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ["userProfile", legendId],
    queryFn: async () => {
      if (!actor || !legendId) return null;
      return actor.getUserByLegendId(legendId);
    },
    enabled: !!actor && !isFetching && !!legendId,
  });

  const { data: leaderboardRaw = [], isLoading: isLeaderboardLoading } =
    useQuery<LeaderboardEntry[]>({
      queryKey: ["leaderboard"],
      queryFn: async () => {
        if (!actor) return [];
        return actor.getLeaderboard();
      },
      enabled: !!actor && !isFetching,
      refetchInterval: 60_000,
    });

  const handleLogout = useCallback(() => {
    logout();
    navigate({ to: "/" });
  }, [logout, navigate]);

  const handleJoinTournament = useCallback(
    async (tournament: Tournament) => {
      if (!actor || !profile) return;
      const balance = Number(profile.walletBalance);
      const entryFee = Number(tournament.entryFee);
      if (balance < entryFee) {
        toast.error("Insufficient coins", {
          description: `You need ₡${entryFee} LC but have ₡${balance} LC`,
        });
        return;
      }
      setJoiningTournamentId(tournament.id);
      try {
        await actor.joinTournamentById(tournament.id);
        await refetchProfile();
        queryClient.invalidateQueries({ queryKey: ["activeTournaments"] });
        setShowCoinShower(true);
        toast.success("You're in the arena!", {
          description: `Joined ${tournament.title}`,
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to join match. Please try again.");
      } finally {
        setJoiningTournamentId(null);
      }
    },
    [actor, profile, refetchProfile, queryClient],
  );

  const balance = profile?.walletBalance ?? BigInt(0);
  const allMatches = profile?.matchHistory ?? [];
  const transactions = profile?.transactions ?? [];
  const totalDeposited = Number(profile?.totalDeposited ?? BigInt(0));
  const selectedProfilePic = Number(profile?.selectedProfilePic ?? BigInt(0));

  /* ── Live leaderboard derived lists ── */
  const globalLeaderboard = [...leaderboardRaw].sort(
    (a, b) => Number(b.totalProfit) - Number(a.totalProfit),
  );

  const primeLeaderboard = [...leaderboardRaw].sort(
    (a, b) => Number(b.totalDeposited) - Number(a.totalDeposited),
  );

  // Oldest by createdAt ascending (earliest = oldest member). createdAt is unique per user.
  const oldestLeaderboard = [...leaderboardRaw].sort((a, b) => {
    const diff = Number(a.createdAt) - Number(b.createdAt);
    return diff;
  });

  /* set of tournament IDs the user has already joined */
  const joinedMatchIds = new Set<string>(allMatches.map((m) => m.matchId));

  /* avatar helpers */
  const highestUnlocked = AVATAR_TIERS.filter(
    (t) => totalDeposited >= t.required,
  ).at(-1);
  const avatarGlowColor = highestUnlocked?.glowColor ?? "rgba(255,255,255,0.2)";

  const nextTier = AVATAR_TIERS.find((t) => totalDeposited < t.required);
  const allUnlocked = !nextTier;
  const progressPercent = nextTier
    ? Math.min(Math.round((totalDeposited / nextTier.required) * 100), 100)
    : 100;

  const [selectingPic, setSelectingPic] = useState<number | null>(null);
  const [profileImgError, setProfileImgError] = useState(false);

  // Reset error state whenever user selects a different avatar
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional reset when pic changes
  useEffect(() => {
    setProfileImgError(false);
  }, [selectedProfilePic]);

  async function handleSelectAvatar(picIndex: number) {
    if (!actor) return;
    setSelectingPic(picIndex);
    try {
      await actor.setProfilePicture(BigInt(picIndex));
      await refetchProfile();
      queryClient.invalidateQueries({ queryKey: ["userProfile", legendId] });
      toast.success("Profile picture updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile picture.");
    } finally {
      setSelectingPic(null);
    }
  }

  /* stats */
  const wins = allMatches.filter((m) => m.result === Result.win).length;
  const losses = allMatches.filter((m) => m.result === Result.loss).length;
  const winRate =
    allMatches.length > 0 ? Math.round((wins / allMatches.length) * 100) : 0;

  /* mode breakdown */
  const loneWolfCount = allMatches.filter(
    (m) => m.mode === GameMode.loneWolf,
  ).length;
  const csModCount = allMatches.filter((m) => m.mode === GameMode.csMod).length;
  const brModCount = allMatches.filter((m) => m.mode === GameMode.brMod).length;
  const modeTotal = Math.max(loneWolfCount + csModCount + brModCount, 1);

  /* Tab sections */
  const tabContent: Record<TabId, React.ReactNode> = {
    /* ── MATCHES ── */
    matches: (
      <section className="animate-tab-in px-4 py-6" aria-label="Joined Matches">
        <div className="mb-6">
          <h2 className="font-display font-black text-xl uppercase tracking-wider text-foreground mb-1">
            Joined Matches
          </h2>
          <p className="text-xs font-body text-muted-foreground">
            All tournaments you have entered
          </p>
        </div>

        {allMatches.length === 0 ? (
          <div
            data-ocid="matches.empty_state"
            className="rounded-xl py-14 text-center"
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
              No battles yet. Hit PLAY and enter the arena!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {[...allMatches].reverse().map((match, i) => (
              <MatchHistoryRow
                key={match.matchId}
                match={match}
                index={i + 1}
              />
            ))}
          </div>
        )}
      </section>
    ),

    /* ── RANKING ── */
    ranking: (
      <section className="animate-tab-in px-4 py-6" aria-label="Rankings">
        {/* Header */}
        <div className="mb-5">
          <h2 className="font-display font-black text-xl uppercase tracking-wider text-foreground mb-1">
            Leaderboard
          </h2>
          <p className="text-xs font-body text-muted-foreground flex items-center gap-0.5 flex-wrap">
            The elite warriors of{" "}
            <span
              className="animate-legend-flame font-bold"
              style={{ color: "#ff2200", fontSize: "0.75rem" }}
            >
              LEGEND
            </span>
            <span
              className="animate-x-beat font-black"
              style={{ color: "#ffd700", fontSize: "0.85rem", margin: "0 1px" }}
            >
              X
            </span>
            <span
              className="animate-arena-electric font-bold"
              style={{ color: "#0066ff", fontSize: "0.75rem" }}
            >
              ARENA
            </span>
          </p>
        </div>

        {/* Section Toggle Tabs */}
        <div
          className="flex gap-1 p-1 rounded-xl mb-5"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {/* Global Winners */}
          <button
            type="button"
            data-ocid="ranking.global_tab"
            onClick={() => setRankingSection("global")}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg font-display font-bold text-xs uppercase tracking-wider transition-all duration-200"
            style={
              rankingSection === "global"
                ? {
                    background:
                      "linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,150,0,0.15))",
                    border: "1px solid rgba(255,215,0,0.35)",
                    color: "#ffd700",
                    boxShadow: "0 0 12px rgba(255,215,0,0.15)",
                  }
                : {
                    background: "transparent",
                    border: "1px solid transparent",
                    color: "rgba(255,255,255,0.35)",
                  }
            }
          >
            <Trophy className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">Global</span>
            <span className="sm:hidden">Global</span>
          </button>

          {/* Prime Legends */}
          <button
            type="button"
            data-ocid="ranking.prime_tab"
            onClick={() => setRankingSection("prime")}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg font-display font-bold text-xs uppercase tracking-wider transition-all duration-200"
            style={
              rankingSection === "prime"
                ? {
                    background:
                      "linear-gradient(135deg, rgba(180,80,255,0.2), rgba(120,40,200,0.15))",
                    border: "1px solid rgba(180,80,255,0.4)",
                    color: "#cc66ff",
                    boxShadow: "0 0 12px rgba(180,80,255,0.2)",
                  }
                : {
                    background: "transparent",
                    border: "1px solid transparent",
                    color: "rgba(255,255,255,0.35)",
                  }
            }
          >
            <Star className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">Prime</span>
            <span className="sm:hidden">Prime</span>
          </button>

          {/* Oldest Legends */}
          <button
            type="button"
            data-ocid="ranking.oldest_tab"
            onClick={() => setRankingSection("oldest")}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg font-display font-bold text-xs uppercase tracking-wider transition-all duration-200"
            style={
              rankingSection === "oldest"
                ? {
                    background:
                      "linear-gradient(135deg, rgba(0,204,255,0.2), rgba(0,120,200,0.15))",
                    border: "1px solid rgba(0,204,255,0.35)",
                    color: "#00ccff",
                    boxShadow: "0 0 12px rgba(0,204,255,0.15)",
                  }
                : {
                    background: "transparent",
                    border: "1px solid transparent",
                    color: "rgba(255,255,255,0.35)",
                  }
            }
          >
            <History className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">Oldest</span>
            <span className="sm:hidden">Oldest</span>
          </button>
        </div>

        {/* Section Title + Description */}
        <div
          className="mb-4 px-4 py-3 rounded-xl"
          style={{
            background:
              rankingSection === "global"
                ? "linear-gradient(135deg, rgba(255,215,0,0.06), rgba(255,150,0,0.03))"
                : rankingSection === "prime"
                  ? "linear-gradient(135deg, rgba(180,80,255,0.06), rgba(120,40,200,0.03))"
                  : "linear-gradient(135deg, rgba(0,204,255,0.06), rgba(0,120,200,0.03))",
            border: `1px solid ${rankingSection === "global" ? "rgba(255,215,0,0.12)" : rankingSection === "prime" ? "rgba(180,80,255,0.15)" : "rgba(0,204,255,0.12)"}`,
          }}
        >
          <div className="flex items-center gap-2">
            {rankingSection === "global" && (
              <Trophy
                className="w-4 h-4 flex-shrink-0"
                style={{ color: "#ffd700" }}
              />
            )}
            {rankingSection === "prime" && (
              <Star
                className="w-4 h-4 flex-shrink-0"
                style={{ color: "#cc66ff" }}
              />
            )}
            {rankingSection === "oldest" && (
              <History
                className="w-4 h-4 flex-shrink-0"
                style={{ color: "#00ccff" }}
              />
            )}
            <div>
              <p
                className="font-display font-black text-sm uppercase tracking-wider"
                style={{
                  color:
                    rankingSection === "global"
                      ? "#ffd700"
                      : rankingSection === "prime"
                        ? "#cc66ff"
                        : "#00ccff",
                }}
              >
                {rankingSection === "global"
                  ? "Global Winners"
                  : rankingSection === "prime"
                    ? "Prime Legends"
                    : "Oldest Legends"}
              </p>
              <p className="text-xs font-body text-muted-foreground mt-0.5">
                {rankingSection === "global"
                  ? "Ranked by total profit earned"
                  : rankingSection === "prime"
                    ? "Ranked by Legend Coins earned"
                    : "Ranked by account seniority"}
              </p>
            </div>
          </div>
        </div>

        {/* ── Loading state ── */}
        {isLeaderboardLoading && (
          <div
            data-ocid="ranking.loading_state"
            className="flex items-center justify-center gap-2 py-16 text-muted-foreground"
          >
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-body text-sm">Loading rankings…</span>
          </div>
        )}

        {/* ── Empty state ── */}
        {!isLeaderboardLoading && leaderboardRaw.length === 0 && (
          <div
            data-ocid="ranking.empty_state"
            className="rounded-xl py-16 text-center"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px dashed rgba(255,255,255,0.08)",
            }}
          >
            <Trophy
              className="w-10 h-10 mx-auto mb-3"
              style={{ color: "rgba(255,255,255,0.12)" }}
            />
            <p className="font-body text-muted-foreground text-sm">
              No players registered yet.
            </p>
          </div>
        )}

        {/* ── Global Winners List ── */}
        {!isLeaderboardLoading &&
          rankingSection === "global" &&
          globalLeaderboard.length > 0 && (
            <div className="space-y-2">
              {globalLeaderboard.map((player, i) => {
                const rank = i + 1;
                const isMe =
                  player.legendId.toLowerCase() ===
                  (legendId ?? "").toLowerCase();
                const medalColor =
                  rank === 1
                    ? "#ffd700"
                    : rank === 2
                      ? "#c0c0c0"
                      : rank === 3
                        ? "#cd7f32"
                        : "rgba(255,255,255,0.3)";

                return (
                  <div
                    key={player.legendId}
                    data-ocid={`ranking.item.${rank}`}
                    className="flex items-center gap-3 py-3 px-4 rounded-xl transition-all"
                    style={{
                      background: isMe
                        ? "rgba(255,215,0,0.08)"
                        : "rgba(255,255,255,0.03)",
                      border: isMe
                        ? "1px solid rgba(255,215,0,0.3)"
                        : "1px solid rgba(255,255,255,0.06)",
                      boxShadow: isMe
                        ? "0 0 12px rgba(255,215,0,0.15)"
                        : "none",
                    }}
                  >
                    {/* Avatar with rank badge overlay */}
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center"
                        style={{
                          border:
                            rank <= 3
                              ? `2px solid ${medalColor}`
                              : "2px solid rgba(255,255,255,0.1)",
                          background: "rgba(255,255,255,0.06)",
                        }}
                      >
                        <img
                          src={getProfilePicSrc(0)}
                          alt={player.gameName || "Player"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const el = e.currentTarget;
                            el.style.display = "none";
                            const parent = el.parentElement;
                            if (
                              parent &&
                              !parent.querySelector(".fallback-letter")
                            ) {
                              const fb = document.createElement("span");
                              fb.className =
                                "fallback-letter font-display font-black text-sm";
                              fb.style.color = "#ff4422";
                              fb.textContent =
                                (player.gameName ||
                                  player.legendId)[0]?.toUpperCase() ?? "?";
                              parent.appendChild(fb);
                            }
                          }}
                        />
                      </div>
                      {rank <= 3 ? (
                        <div
                          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{
                            background: `radial-gradient(circle at 35% 35%, ${medalColor}cc, ${medalColor}88)`,
                            border: "1.5px solid rgba(0,0,0,0.5)",
                            boxShadow: `0 0 6px ${medalColor}66`,
                          }}
                        >
                          <Medal
                            className="w-3 h-3"
                            style={{ color: "#000", opacity: 0.85 }}
                          />
                        </div>
                      ) : (
                        <div
                          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center font-display font-black"
                          style={{
                            background: "rgba(20,20,35,0.95)",
                            border: "1px solid rgba(255,255,255,0.15)",
                            color: "rgba(255,255,255,0.5)",
                            fontSize: "9px",
                          }}
                        >
                          {rank}
                        </div>
                      )}
                    </div>

                    {/* Player Name */}
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-display font-bold text-sm truncate"
                        style={{
                          color: isMe ? "#ffd700" : "rgba(255,255,255,0.9)",
                        }}
                      >
                        {player.gameName || "Player"}
                        {isMe && (
                          <span className="ml-2 text-xs font-body text-muted-foreground">
                            (you)
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-body text-muted-foreground">
                        {Number(player.wins)} wins · ₡
                        {Number(player.totalProfit).toLocaleString()} profit
                      </div>
                    </div>

                    {/* Profit count */}
                    <div className="text-right">
                      <div
                        className="font-display font-bold text-sm tabular-nums"
                        style={{ color: "#22cc66" }}
                      >
                        ₡{Number(player.totalProfit).toLocaleString()}
                      </div>
                      <div className="text-xs font-body text-muted-foreground">
                        Profit
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        {/* ── Prime Legends List ── */}
        {!isLeaderboardLoading &&
          rankingSection === "prime" &&
          primeLeaderboard.length > 0 && (
            <div className="space-y-2">
              {primeLeaderboard.map((player, i) => {
                const rank = i + 1;
                const isMe =
                  player.legendId.toLowerCase() ===
                  (legendId ?? "").toLowerCase();
                const medalColor =
                  rank === 1
                    ? "#ffd700"
                    : rank === 2
                      ? "#c0c0c0"
                      : rank === 3
                        ? "#cd7f32"
                        : "rgba(255,255,255,0.3)";
                const level = getPrimeLevel(player.totalDeposited);
                const levelColor =
                  level === "Diamond"
                    ? "#00ccff"
                    : level === "Platinum"
                      ? "#cc66ff"
                      : level === "Gold"
                        ? "#ffd700"
                        : level === "Silver"
                          ? "#c0c0c0"
                          : "#cd7f32";

                return (
                  <div
                    key={player.legendId}
                    data-ocid={`ranking.item.${rank}`}
                    className="flex items-center gap-3 py-3 px-4 rounded-xl transition-all"
                    style={{
                      background: isMe
                        ? "rgba(180,80,255,0.08)"
                        : "rgba(255,255,255,0.03)",
                      border: isMe
                        ? "1px solid rgba(180,80,255,0.3)"
                        : "1px solid rgba(255,255,255,0.06)",
                      boxShadow: isMe
                        ? "0 0 12px rgba(180,80,255,0.15)"
                        : "none",
                    }}
                  >
                    {/* Avatar with rank badge overlay */}
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center"
                        style={{
                          border:
                            rank <= 3
                              ? `2px solid ${medalColor}`
                              : "2px solid rgba(255,255,255,0.1)",
                          background: "rgba(255,255,255,0.06)",
                        }}
                      >
                        <img
                          src={getProfilePicSrc(0)}
                          alt={player.gameName || "Player"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const el = e.currentTarget;
                            el.style.display = "none";
                            const parent = el.parentElement;
                            if (
                              parent &&
                              !parent.querySelector(".fallback-letter")
                            ) {
                              const fb = document.createElement("span");
                              fb.className =
                                "fallback-letter font-display font-black text-sm";
                              fb.style.color = "#ff4422";
                              fb.textContent =
                                (player.gameName ||
                                  player.legendId)[0]?.toUpperCase() ?? "?";
                              parent.appendChild(fb);
                            }
                          }}
                        />
                      </div>
                      {rank <= 3 ? (
                        <div
                          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{
                            background: `radial-gradient(circle at 35% 35%, ${medalColor}cc, ${medalColor}88)`,
                            border: "1.5px solid rgba(0,0,0,0.5)",
                            boxShadow: `0 0 6px ${medalColor}66`,
                          }}
                        >
                          <Medal
                            className="w-3 h-3"
                            style={{ color: "#000", opacity: 0.85 }}
                          />
                        </div>
                      ) : (
                        <div
                          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center font-display font-black"
                          style={{
                            background: "rgba(20,20,35,0.95)",
                            border: "1px solid rgba(255,255,255,0.15)",
                            color: "rgba(255,255,255,0.5)",
                            fontSize: "9px",
                          }}
                        >
                          {rank}
                        </div>
                      )}
                    </div>

                    {/* Player Name */}
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-display font-bold text-sm truncate"
                        style={{
                          color: isMe ? "#cc66ff" : "rgba(255,255,255,0.9)",
                        }}
                      >
                        {player.gameName || "Player"}
                        {isMe && (
                          <span className="ml-2 text-xs font-body text-muted-foreground">
                            (you)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className="text-xs font-display font-bold uppercase px-1.5 py-px rounded"
                          style={{
                            background: `${levelColor}18`,
                            border: `1px solid ${levelColor}35`,
                            color: levelColor,
                            fontSize: "9px",
                            letterSpacing: "0.1em",
                          }}
                        >
                          {level}
                        </span>
                      </div>
                    </div>

                    {/* Total deposited */}
                    <div className="text-right">
                      <div
                        className="font-display font-bold text-sm tabular-nums"
                        style={{ color: "#cc66ff" }}
                      >
                        ₡{Number(player.totalDeposited).toLocaleString()}
                      </div>
                      <div className="text-xs font-body text-muted-foreground">
                        Deposited
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        {/* ── Oldest Legends List ── */}
        {!isLeaderboardLoading &&
          rankingSection === "oldest" &&
          oldestLeaderboard.length > 0 && (
            <div className="space-y-2">
              {oldestLeaderboard.map((player, i) => {
                const rank = i + 1;
                const isMe =
                  player.legendId.toLowerCase() ===
                  (legendId ?? "").toLowerCase();
                const medalColor =
                  rank === 1
                    ? "#ffd700"
                    : rank === 2
                      ? "#c0c0c0"
                      : rank === 3
                        ? "#cd7f32"
                        : "rgba(255,255,255,0.3)";

                return (
                  <div
                    key={player.legendId}
                    data-ocid={`ranking.item.${rank}`}
                    className="flex items-center gap-3 py-3 px-4 rounded-xl transition-all"
                    style={{
                      background: isMe
                        ? "rgba(0,204,255,0.08)"
                        : "rgba(255,255,255,0.03)",
                      border: isMe
                        ? "1px solid rgba(0,204,255,0.3)"
                        : "1px solid rgba(255,255,255,0.06)",
                      boxShadow: isMe
                        ? "0 0 12px rgba(0,204,255,0.15)"
                        : "none",
                    }}
                  >
                    {/* Avatar with rank badge overlay */}
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center"
                        style={{
                          border:
                            rank <= 3
                              ? `2px solid ${medalColor}`
                              : "2px solid rgba(255,255,255,0.1)",
                          background: "rgba(255,255,255,0.06)",
                        }}
                      >
                        <img
                          src={getProfilePicSrc(0)}
                          alt={player.gameName || "Player"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const el = e.currentTarget;
                            el.style.display = "none";
                            const parent = el.parentElement;
                            if (
                              parent &&
                              !parent.querySelector(".fallback-letter")
                            ) {
                              const fb = document.createElement("span");
                              fb.className =
                                "fallback-letter font-display font-black text-sm";
                              fb.style.color = "#ff4422";
                              fb.textContent =
                                (player.gameName ||
                                  player.legendId)[0]?.toUpperCase() ?? "?";
                              parent.appendChild(fb);
                            }
                          }}
                        />
                      </div>
                      {rank <= 3 ? (
                        <div
                          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{
                            background: `radial-gradient(circle at 35% 35%, ${medalColor}cc, ${medalColor}88)`,
                            border: "1.5px solid rgba(0,0,0,0.5)",
                            boxShadow: `0 0 6px ${medalColor}66`,
                          }}
                        >
                          <Medal
                            className="w-3 h-3"
                            style={{ color: "#000", opacity: 0.85 }}
                          />
                        </div>
                      ) : (
                        <div
                          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center font-display font-black"
                          style={{
                            background: "rgba(20,20,35,0.95)",
                            border: "1px solid rgba(255,255,255,0.15)",
                            color: "rgba(255,255,255,0.5)",
                            fontSize: "9px",
                          }}
                        >
                          {rank}
                        </div>
                      )}
                    </div>

                    {/* Player Name + join date */}
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-display font-bold text-sm truncate"
                        style={{
                          color: isMe ? "#00ccff" : "rgba(255,255,255,0.9)",
                        }}
                      >
                        {player.gameName || "Player"}
                        {isMe && (
                          <span className="ml-2 text-xs font-body text-muted-foreground">
                            (you)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock
                          className="w-3 h-3 flex-shrink-0"
                          style={{ color: "rgba(0,204,255,0.5)" }}
                        />
                        <span className="text-xs font-body text-muted-foreground">
                          Old Member
                        </span>
                      </div>
                    </div>

                    {/* Account age */}
                    <div className="text-right flex-shrink-0">
                      <div
                        className="font-display font-bold text-sm tabular-nums"
                        style={{ color: "#00ccff" }}
                      >
                        {(() => {
                          const ms =
                            Date.now() - Number(player.createdAt) / 1_000_000;
                          const days = Math.floor(ms / 86_400_000);
                          if (days >= 365)
                            return `${Math.floor(days / 365)}y ${Math.floor((days % 365) / 30)}m`;
                          if (days >= 30)
                            return `${Math.floor(days / 30)}m ${days % 30}d`;
                          return `${days}d`;
                        })()}
                      </div>
                      <div className="text-xs font-body text-muted-foreground">
                        {new Date(
                          Number(player.createdAt) / 1_000_000,
                        ).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </section>
    ),

    /* ── PLAY ── */
    play: (
      <PlayTab
        legendId={legendId}
        gameName={profile?.gameName ?? null}
        balance={balance}
        actor={actor}
        isFetchingActor={isFetching}
        joiningTournamentId={joiningTournamentId}
        onJoin={handleJoinTournament}
        joinedMatchIds={joinedMatchIds}
      />
    ),

    /* ── DEPOSIT ── */
    deposit: (
      <DepositTab
        balance={balance}
        transactions={transactions}
        actor={actor}
        isFetching={isFetching}
      />
    ),

    /* ── PROFILE ── */
    profile: (
      <section className="animate-tab-in px-4 py-6" aria-label="Player Profile">
        {/* Avatar & ID */}
        <div
          className="rounded-2xl p-6 mb-6 flex items-center gap-5 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,34,0,0.07), rgba(0,102,255,0.07))",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
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
          {/* Smart Avatar */}
          <div
            className="flex-shrink-0 relative"
            style={{ width: 72, height: 72 }}
          >
            {/* Glow ring based on highest tier unlocked */}
            <div
              style={{
                position: "absolute",
                inset: -4,
                borderRadius: "50%",
                border: `2px solid ${avatarGlowColor}`,
                boxShadow: `0 0 16px ${avatarGlowColor}88, 0 0 32px ${avatarGlowColor}44`,
                animation: highestUnlocked
                  ? "profileGlowPulse 2.5s ease-in-out infinite"
                  : "none",
              }}
            />
            {!profileImgError ? (
              <img
                src={getProfilePicSrc(selectedProfilePic)}
                alt="Profile avatar"
                className="w-full h-full rounded-full object-cover"
                style={{
                  border: `2px solid ${avatarGlowColor}`,
                  boxShadow: `0 0 12px ${avatarGlowColor}66`,
                }}
                onError={() => setProfileImgError(true)}
              />
            ) : (
              <div
                className="w-full h-full rounded-full flex items-center justify-center font-display font-black text-2xl"
                style={{
                  background: "linear-gradient(135deg, #ff4422, #cc1100)",
                  color: "#fff",
                  border: `2px solid ${avatarGlowColor}`,
                  boxShadow: `0 0 12px ${avatarGlowColor}66`,
                }}
              >
                {(legendId ?? "?")[0].toUpperCase()}
              </div>
            )}
            {/* Pen edit icon */}
            <button
              type="button"
              data-ocid="profile.avatar_edit_button"
              onClick={() => {
                setActiveTab("profile");
                setTimeout(() => {
                  const el = document.getElementById("avatar-gallery-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }, 150);
              }}
              className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center transition-opacity hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #ffd700, #ff9900)",
                border: "2px solid #0a0a0f",
                zIndex: 5,
              }}
              title="Change profile picture"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#000"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </div>
          <div>
            <div
              className="font-display font-black text-lg tracking-wide"
              style={{ color: "#fff" }}
            >
              {profile?.gameName || legendId}
            </div>
            {/* Legend ID — visible only to the player themselves (this is always their own profile) */}
            <div
              className="text-xs font-body mt-0.5 flex items-center gap-1"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              <Lock
                className="w-3 h-3 flex-shrink-0"
                style={{ color: "rgba(255,215,0,0.45)" }}
              />
              <span>
                Legend ID:{" "}
                <span
                  className="font-mono"
                  style={{ color: "rgba(255,215,0,0.65)" }}
                >
                  {legendId}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="text-xs font-display font-bold px-2 py-0.5 rounded uppercase tracking-wider"
                style={
                  role === "admin"
                    ? {
                        background: "rgba(255,215,0,0.15)",
                        border: "1px solid rgba(255,215,0,0.4)",
                        color: "#ffd700",
                      }
                    : {
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "rgba(255,255,255,0.6)",
                      }
                }
              >
                {role === "admin" ? "ADMIN" : "PLAYER"}
              </span>
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: "#22cc66", boxShadow: "0 0 6px #22cc66" }}
              />
              <span className="text-xs font-body text-muted-foreground">
                Online
              </span>
            </div>
            {/* Total deposited badge */}
            <div className="mt-1.5">
              <span
                className="text-xs font-display font-bold tracking-wider"
                style={{ color: "rgba(255,215,0,0.7)" }}
              >
                ₡{totalDeposited.toLocaleString()} total deposited
              </span>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-3">
          {[
            {
              label: "Total Matches",
              value: allMatches.length,
              color: "#00ccff",
            },
            { label: "Wins", value: wins, color: "#22cc66" },
            { label: "Losses", value: losses, color: "#ff4422" },
            { label: "Win Rate", value: `${winRate}%`, color: "#ffd700" },
            {
              label: "Legend Coins",
              value: `₡${Number(balance).toLocaleString()}`,
              color: "#ffd700",
            },
            {
              label: "Member Since",
              value: profile?.createdAt ? formatDate(profile.createdAt) : "—",
              color: "rgba(255,255,255,0.5)",
            },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-xl p-4 text-center"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                className="font-display font-black text-xl tabular-nums mb-1"
                style={{ color }}
              >
                {value}
              </div>
              <div className="text-xs font-body text-muted-foreground uppercase tracking-wider">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Player Info Card ── */}
        <PlayerInfoCard
          profile={profile}
          actor={actor}
          refetchProfile={refetchProfile}
        />

        {/* ── Unlock Progress Bar ── */}
        <div
          data-ocid="profile.avatar_unlock_progress"
          className="rounded-xl p-4 mb-5"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {allUnlocked ? (
            <div className="flex items-center justify-center gap-2 py-1">
              <CheckCircle2 className="w-5 h-5" style={{ color: "#ffd700" }} />
              <span
                className="font-display font-black text-sm tracking-wider"
                style={{ color: "#ffd700" }}
              >
                All pictures unlocked! 🏆
              </span>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-2">
                <span
                  className="text-xs font-display font-bold uppercase tracking-wider"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  Next Unlock: {nextTier?.label} at ₡{nextTier?.required}
                </span>
                <span
                  className="text-xs font-display font-black tabular-nums"
                  style={{ color: nextTier?.glowColor ?? "#ffd700" }}
                >
                  {progressPercent}%
                </span>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${progressPercent}%`,
                    background: `linear-gradient(90deg, ${nextTier?.glowColor ?? "#ffd700"}88, ${nextTier?.glowColor ?? "#ffd700"})`,
                    boxShadow: `0 0 8px ${nextTier?.glowColor ?? "#ffd700"}66`,
                  }}
                />
              </div>
              <div
                className="mt-1.5 text-xs font-body text-center"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                ₡{totalDeposited} / ₡{nextTier?.required} deposited
              </div>
            </>
          )}
        </div>

        {/* ── Avatar Gallery ── */}
        <div
          id="avatar-gallery-section"
          data-ocid="profile.avatar_gallery.section"
          className="rounded-xl p-4 mb-6"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Lock
              className="w-3.5 h-3.5"
              style={{ color: "rgba(255,215,0,0.7)" }}
            />
            <h4
              className="font-display font-black text-xs uppercase tracking-[0.2em]"
              style={{ color: "rgba(255,215,0,0.9)" }}
            >
              Profile Pictures
            </h4>
          </div>

          {/* Scrollable grid */}
          <div
            className="flex gap-3 overflow-x-auto pb-2"
            style={{ scrollbarWidth: "none" }}
          >
            {/* FREE Joker Avatar (index 0, always unlocked) */}
            {(() => {
              const isFreeSelected = selectedProfilePic === 0;
              const isFreeLoading = selectingPic === 0;
              return (
                <button
                  key="joker-free"
                  type="button"
                  data-ocid="profile.avatar_item.0"
                  disabled={isFreeLoading}
                  onClick={() => !isFreeSelected && handleSelectAvatar(0)}
                  className="flex-shrink-0 flex flex-col items-center gap-2 transition-all duration-200"
                  style={{
                    outline: "none",
                    cursor: isFreeSelected ? "default" : "pointer",
                    transform: isFreeSelected ? "scale(1.05)" : "scale(1)",
                  }}
                >
                  <div className="relative" style={{ width: 80, height: 80 }}>
                    <div
                      style={{
                        position: "absolute",
                        inset: isFreeSelected ? -3 : -2,
                        borderRadius: "50%",
                        border: isFreeSelected
                          ? "3px solid #ffd700"
                          : "2px solid rgba(255,60,0,0.5)",
                        boxShadow: isFreeSelected
                          ? "0 0 16px #ffd70088, 0 0 32px #ffd70044"
                          : "0 0 12px rgba(255,60,0,0.3)",
                        animation: isFreeSelected
                          ? "profileGlowPulse 2s ease-in-out infinite"
                          : "none",
                        zIndex: 2,
                      }}
                    />
                    <img
                      src={DEFAULT_PROFILE_PIC}
                      alt="Joker - Default avatar"
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (
                          target.src !==
                          window.location.origin + DEFAULT_PROFILE_PIC
                        ) {
                          target.src = DEFAULT_PROFILE_PIC;
                        }
                      }}
                    />
                    {isFreeLoading && (
                      <div
                        className="absolute inset-0 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(0,0,0,0.6)" }}
                      >
                        <svg
                          className="w-5 h-5 animate-spin"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          aria-label="Loading"
                          role="img"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="#ffd700"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="#ffd700"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          />
                        </svg>
                      </div>
                    )}
                    {isFreeSelected && (
                      <div
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-px rounded-full"
                        style={{ background: "#ffd700", zIndex: 3 }}
                      >
                        <span
                          className="font-display font-black uppercase"
                          style={{
                            fontSize: "8px",
                            color: "#000",
                            letterSpacing: "0.1em",
                          }}
                        >
                          ACTIVE
                        </span>
                      </div>
                    )}
                  </div>
                  <span
                    className="font-display font-black uppercase"
                    style={{
                      fontSize: "10px",
                      letterSpacing: "0.12em",
                      color: isFreeSelected ? "#ffd700" : "#ff4422",
                    }}
                  >
                    JOKER
                  </span>
                  <span
                    className="font-body text-center"
                    style={{
                      fontSize: "10px",
                      color: "rgba(34,204,102,0.7)",
                      lineHeight: 1.2,
                    }}
                  >
                    ✓ FREE
                  </span>
                </button>
              );
            })()}

            {AVATAR_TIERS.map((tier) => {
              const isUnlocked = totalDeposited >= tier.required;
              const isSelected = selectedProfilePic === tier.index;
              const isLoading = selectingPic === tier.index;

              return (
                <button
                  key={tier.index}
                  type="button"
                  data-ocid={`profile.avatar_item.${tier.index}`}
                  disabled={!isUnlocked || isLoading}
                  onClick={() =>
                    isUnlocked && !isSelected && handleSelectAvatar(tier.index)
                  }
                  className="flex-shrink-0 flex flex-col items-center gap-2 transition-all duration-200"
                  style={{
                    outline: "none",
                    cursor:
                      isUnlocked && !isSelected
                        ? "pointer"
                        : isSelected
                          ? "default"
                          : "not-allowed",
                    opacity: isUnlocked ? 1 : 0.65,
                    transform: isSelected ? "scale(1.05)" : "scale(1)",
                  }}
                >
                  {/* Avatar image container */}
                  <div className="relative" style={{ width: 80, height: 80 }}>
                    {/* Ring: gold for selected, green for unlocked, dark for locked */}
                    <div
                      style={{
                        position: "absolute",
                        inset: isSelected ? -3 : -2,
                        borderRadius: "50%",
                        border: isSelected
                          ? "3px solid #ffd700"
                          : isUnlocked
                            ? `2px solid ${tier.glowColor}88`
                            : "2px solid rgba(255,255,255,0.1)",
                        boxShadow: isSelected
                          ? "0 0 16px #ffd70088, 0 0 32px #ffd70044"
                          : isUnlocked
                            ? `0 0 12px ${tier.glowColor}55`
                            : "none",
                        animation: isSelected
                          ? "profileGlowPulse 2s ease-in-out infinite"
                          : "none",
                        zIndex: 2,
                      }}
                    />

                    <img
                      src={tier.src}
                      alt={`Avatar tier ${tier.index}`}
                      className="w-full h-full rounded-full object-cover"
                      style={{
                        filter: isUnlocked
                          ? "none"
                          : "grayscale(80%) brightness(0.4)",
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />

                    {/* Lock overlay */}
                    {!isUnlocked && (
                      <div
                        className="absolute inset-0 rounded-full flex items-center justify-center"
                        style={{
                          background: "rgba(0,0,0,0.55)",
                          backdropFilter: "blur(1px)",
                        }}
                      >
                        <Lock
                          className="w-5 h-5"
                          style={{ color: "rgba(255,255,255,0.5)" }}
                        />
                      </div>
                    )}

                    {/* Loading spinner */}
                    {isLoading && (
                      <div
                        className="absolute inset-0 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(0,0,0,0.6)" }}
                      >
                        <svg
                          className="w-5 h-5 animate-spin"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          aria-label="Loading"
                          role="img"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="#ffd700"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="#ffd700"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          />
                        </svg>
                      </div>
                    )}

                    {/* Active badge */}
                    {isSelected && (
                      <div
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-px rounded-full"
                        style={{
                          background: "#ffd700",
                          zIndex: 3,
                        }}
                      >
                        <span
                          className="font-display font-black uppercase"
                          style={{
                            fontSize: "8px",
                            color: "#000",
                            letterSpacing: "0.1em",
                          }}
                        >
                          ACTIVE
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tier label */}
                  <span
                    className="font-display font-black uppercase"
                    style={{
                      fontSize: "10px",
                      letterSpacing: "0.12em",
                      color: isSelected
                        ? "#ffd700"
                        : isUnlocked
                          ? tier.glowColor
                          : "rgba(255,255,255,0.3)",
                    }}
                  >
                    {tier.label}
                  </span>

                  {/* Deposit requirement */}
                  <span
                    className="font-body text-center"
                    style={{
                      fontSize: "10px",
                      color: isUnlocked ? "rgba(255,255,255,0.4)" : "#ff4422",
                      lineHeight: 1.2,
                    }}
                  >
                    {isUnlocked ? (
                      <span style={{ color: "rgba(34,204,102,0.7)" }}>
                        ✓ Unlocked
                      </span>
                    ) : (
                      <>
                        ₡{tier.required}
                        <br />
                        to unlock
                      </>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mode breakdown bars */}
        {allMatches.length > 0 && (
          <div
            className="rounded-xl p-4 mb-6"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Mode Breakdown
            </h4>
            {[
              { label: "Lone Wolf", count: loneWolfCount, color: "#ff4422" },
              { label: "CS Mod", count: csModCount, color: "#0099ff" },
              { label: "BR Mod", count: brModCount, color: "#cc44ff" },
            ].map(({ label, count, color }) => (
              <div key={label} className="mb-2">
                <div className="flex justify-between text-xs font-body mb-1">
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>
                    {label}
                  </span>
                  <span style={{ color }}>{count}</span>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(count / modeTotal) * 100}%`,
                      background: `linear-gradient(90deg, ${color}aa, ${color})`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3">
          {role === "admin" && (
            <button
              type="button"
              data-ocid="profile.admin_button"
              onClick={() => navigate({ to: "/admin" })}
              className="w-full py-3.5 rounded-xl font-display font-bold text-sm uppercase tracking-wider transition-all duration-200 hover:opacity-80"
              style={{
                background: "rgba(255,215,0,0.1)",
                border: "1px solid rgba(255,215,0,0.35)",
                color: "#ffd700",
              }}
            >
              ⚙ Admin Panel
            </button>
          )}
          <button
            type="button"
            data-ocid="profile.logout_button"
            onClick={handleLogout}
            className="w-full py-3.5 rounded-xl font-display font-bold text-sm uppercase tracking-wider transition-all duration-200 hover:opacity-80 flex items-center justify-center gap-2"
            style={{
              background: "rgba(255,34,0,0.1)",
              border: "1px solid rgba(255,34,0,0.3)",
              color: "#ff4422",
            }}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </section>
    ),
  };

  /* ─── NAV ITEM helper ─────────────────────────────────────── */
  const NavItem = ({
    id,
    icon,
    label,
    ocid,
  }: {
    id: TabId;
    icon: React.ReactNode;
    label: string;
    ocid: string;
  }) => {
    const isActive = activeTab === id;
    return (
      <button
        type="button"
        data-ocid={ocid}
        onClick={() => setActiveTab(id)}
        className="flex flex-col items-center justify-center gap-1 py-2 flex-1 relative transition-all duration-150"
        style={{ color: isActive ? "#ff4422" : "rgba(255,255,255,0.4)" }}
        aria-current={isActive ? "page" : undefined}
      >
        {isActive && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "24px",
              height: "2px",
              background: "#ff4422",
              borderRadius: "0 0 2px 2px",
              boxShadow: "0 0 8px #ff4422",
            }}
          />
        )}
        <div
          style={{
            transition: "transform 0.15s",
            transform: isActive ? "scale(1.15)" : "scale(1)",
          }}
        >
          {icon}
        </div>
        <span
          className="font-display font-bold uppercase"
          style={{ fontSize: "9px", letterSpacing: "0.08em" }}
        >
          {label}
        </span>
      </button>
    );
  };

  return (
    <div
      className="relative min-h-screen"
      style={{ background: "#0a0a0f", paddingBottom: "88px" }}
    >
      {showWelcomeModal && legendId && (
        <FirstLoginModal
          legendId={legendId}
          actor={actor}
          onClose={() => {
            localStorage.setItem(`lxa_welcome_shown_${legendId}`, "1");
            setShowWelcomeModal(false);
          }}
        />
      )}
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
          zIndex: 0,
        }}
      />

      {/* ── HEADER ── */}
      <header
        className="relative z-10 sticky top-0"
        style={{
          background: "rgba(10, 10, 15, 0.92)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <a
            href="/"
            className="font-display font-black text-base flex items-center gap-0"
          >
            <span
              className="animate-legend-flame"
              style={{ color: "#ff2200", fontSize: "0.9rem" }}
            >
              L
            </span>
            <span
              className="animate-x-beat"
              style={{
                color: "#ffd700",
                fontSize: "1.1rem",
                margin: "0 0.05em",
              }}
            >
              X
            </span>
            <span
              className="animate-arena-electric"
              style={{ color: "#0066ff", fontSize: "0.9rem" }}
            >
              A
            </span>
          </a>

          <div className="hidden sm:flex items-center gap-2">
            {/* Profile avatar in header */}
            {!profileImgError ? (
              <img
                src={getProfilePicSrc(selectedProfilePic)}
                alt="Profile"
                className="rounded-full object-cover flex-shrink-0"
                style={{
                  width: 28,
                  height: 28,
                  border: `1.5px solid ${avatarGlowColor}`,
                  boxShadow: `0 0 8px ${avatarGlowColor}55`,
                }}
                onError={() => setProfileImgError(true)}
              />
            ) : (
              <div
                className="rounded-full flex-shrink-0 flex items-center justify-center font-display font-black"
                style={{
                  width: 28,
                  height: 28,
                  background: "linear-gradient(135deg, #ff4422, #cc1100)",
                  border: `1.5px solid ${avatarGlowColor}`,
                  boxShadow: `0 0 8px ${avatarGlowColor}55`,
                  color: "#fff",
                  fontSize: "11px",
                }}
              >
                {(legendId ?? "?")[0].toUpperCase()}
              </div>
            )}
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: "#22cc66", boxShadow: "0 0 6px #22cc66" }}
            />
            <span
              className="font-display font-bold text-sm tracking-wider"
              style={{ color: "rgba(255,255,255,0.8)" }}
            >
              {profile?.gameName || legendId}
            </span>
            {role === "admin" && (
              <span
                className="text-xs font-display font-bold px-2 py-0.5 rounded uppercase tracking-wider"
                style={{
                  background: "rgba(255,215,0,0.15)",
                  border: "1px solid rgba(255,215,0,0.4)",
                  color: "#ffd700",
                }}
              >
                ADMIN
              </span>
            )}
          </div>

          <WalletDisplay balance={balance} />
        </div>
      </header>

      {/* ── MAIN SCROLLABLE CONTENT ── */}
      <main className="relative z-10 max-w-2xl mx-auto">
        {tabContent[activeTab]}
      </main>

      {/* ── BOTTOM NAV BAR ── */}
      <nav
        aria-label="Main navigation"
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: "rgba(8, 8, 14, 0.97)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          height: "70px",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="max-w-2xl mx-auto h-full flex items-center relative">
          {/* Matches */}
          <NavItem
            id="matches"
            ocid="nav.matches_tab"
            icon={<Trophy className="w-5 h-5" />}
            label="Matches"
          />

          {/* Ranking */}
          <NavItem
            id="ranking"
            ocid="nav.ranking_tab"
            icon={<BarChart2 className="w-5 h-5" />}
            label="Ranking"
          />

          {/* CENTER PLAY BUTTON */}
          <div
            className="flex flex-col items-center flex-1 relative"
            style={{ bottom: "16px" }}
          >
            <button
              type="button"
              data-ocid="nav.play_button"
              onClick={() => setActiveTab("play")}
              className="animate-play-pulse flex flex-col items-center justify-center rounded-full relative"
              style={{
                width: 70,
                height: 70,
                background:
                  "radial-gradient(circle at 35% 30%, #ff6600, #cc1100 60%)",
                border: "3px solid rgba(255,120,0,0.6)",
                position: "absolute",
                top: "-28px",
                left: "50%",
                transform: "translateX(-50%)",
              }}
              aria-label="Play"
            >
              {/* Active ring */}
              {activeTab === "play" && (
                <div
                  style={{
                    position: "absolute",
                    inset: -5,
                    borderRadius: "50%",
                    border: "2px solid rgba(255,180,0,0.7)",
                    animation: "playButtonPulse 1.4s ease-in-out infinite",
                  }}
                />
              )}
              <RifleAnimation />
            </button>
            {/* PLAY label below (visible in nav bar row) */}
            <span
              className="font-display font-black uppercase absolute"
              style={{
                fontSize: "9px",
                letterSpacing: "0.12em",
                color:
                  activeTab === "play" ? "#ff4422" : "rgba(255,255,255,0.5)",
                bottom: "4px",
              }}
            >
              PLAY
            </span>
          </div>

          {/* Deposit */}
          <NavItem
            id="deposit"
            ocid="nav.deposit_tab"
            icon={<Wallet className="w-5 h-5" />}
            label="Deposit"
          />

          {/* Profile */}
          <NavItem
            id="profile"
            ocid="nav.profile_tab"
            icon={<User className="w-5 h-5" />}
            label="Profile"
          />
        </div>
      </nav>
    </div>
  );
}
