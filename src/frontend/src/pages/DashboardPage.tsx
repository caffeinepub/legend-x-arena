import type { backendInterface } from "@/backend";
import {
  type DepositRequest,
  DepositStatus,
  GameMode,
  type Match,
  Result,
  Role,
  type Transaction,
  TransactionType,
} from "@/backend.d";
import { CoinShower } from "@/components/CoinShower";
import { FireAnimation } from "@/components/FireAnimation";
import { GameModeCard } from "@/components/GameModeCard";
import { RifleAnimation } from "@/components/RifleAnimation";
import { WalletDisplay } from "@/components/WalletDisplay";
import { useActor } from "@/hooks/useActor";
import { useAuthStore } from "@/store/authStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  BarChart2,
  CheckCircle2,
  Copy,
  Globe,
  Lock,
  LogOut,
  Medal,
  Shield,
  Sword,
  Trophy,
  User,
  Wallet,
} from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

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

/* ─── Mock leaderboard ─────────────────────────────────────── */
const MOCK_LEADERBOARD = [
  { rank: 1, id: "DragonSlayer_X", wins: 312, lc: 48200 },
  { rank: 2, id: "GhostReaper99", wins: 297, lc: 43100 },
  { rank: 3, id: "BlazeFire_Pro", wins: 281, lc: 39750 },
  { rank: 4, id: "ShadowKing_V2", wins: 264, lc: 35900 },
  { rank: 5, id: "StormHawk_Elite", wins: 248, lc: 32400 },
  { rank: 6, id: "CrimsonBlade_07", wins: 235, lc: 29800 },
  { rank: 7, id: "IronWolf_BR", wins: 219, lc: 27100 },
  { rank: 8, id: "PhoenixRise_FF", wins: 204, lc: 24600 },
  { rank: 9, id: "NightHunter_Z", wins: 191, lc: 22300 },
  { rank: 10, id: "LegendArcher_1", wins: 178, lc: 20000 },
];

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

/* ─── Main Dashboard ───────────────────────────────────────── */
export function DashboardPage() {
  const navigate = useNavigate();
  const { legendId, role } = useAuthStore();
  const logout = useAuthStore((s) => s.logout);
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabId>("play");
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
  const allMatches = profile?.matchHistory ?? [];
  const transactions = profile?.transactions ?? [];
  const totalDeposited = Number(profile?.totalDeposited ?? BigInt(0));
  const selectedProfilePic = Number(profile?.selectedProfilePic ?? BigInt(0));

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
      <section className="animate-tab-in px-4 py-6" aria-label="Global Ranking">
        <div className="mb-6">
          <h2 className="font-display font-black text-xl uppercase tracking-wider text-foreground mb-1">
            Global Leaderboard
          </h2>
          <p className="text-xs font-body text-muted-foreground">
            Top Free Fire warriors worldwide
          </p>
        </div>

        <div className="space-y-2">
          {MOCK_LEADERBOARD.map((player, i) => {
            const isMe =
              player.id.toLowerCase() === (legendId ?? "").toLowerCase();
            const medalColor =
              player.rank === 1
                ? "#ffd700"
                : player.rank === 2
                  ? "#c0c0c0"
                  : player.rank === 3
                    ? "#cd7f32"
                    : "rgba(255,255,255,0.3)";

            return (
              <div
                key={player.rank}
                data-ocid={`ranking.item.${i + 1}`}
                className="flex items-center gap-3 py-3 px-4 rounded-xl transition-all"
                style={{
                  background: isMe
                    ? "rgba(255,215,0,0.08)"
                    : "rgba(255,255,255,0.03)",
                  border: isMe
                    ? "1px solid rgba(255,215,0,0.3)"
                    : "1px solid rgba(255,255,255,0.06)",
                  boxShadow: isMe ? "0 0 12px rgba(255,215,0,0.15)" : "none",
                }}
              >
                {/* Rank badge */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-display font-black text-sm"
                  style={{
                    background:
                      player.rank <= 3
                        ? `radial-gradient(circle at 35% 35%, ${medalColor}88, ${medalColor}44)`
                        : "rgba(255,255,255,0.06)",
                    border: `1.5px solid ${medalColor}`,
                    color:
                      player.rank <= 3 ? medalColor : "rgba(255,255,255,0.5)",
                  }}
                >
                  {player.rank <= 3 ? (
                    <Medal
                      className="w-3.5 h-3.5"
                      style={{ color: medalColor }}
                    />
                  ) : (
                    player.rank
                  )}
                </div>

                {/* Player ID */}
                <div className="flex-1 min-w-0">
                  <div
                    className="font-display font-bold text-sm truncate"
                    style={{
                      color: isMe ? "#ffd700" : "rgba(255,255,255,0.9)",
                    }}
                  >
                    {player.id}
                    {isMe && (
                      <span className="ml-2 text-xs font-body text-muted-foreground">
                        (you)
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-body text-muted-foreground">
                    {player.wins} wins
                  </div>
                </div>

                {/* LC total */}
                <div className="text-right">
                  <div
                    className="font-display font-bold text-sm tabular-nums"
                    style={{ color: "#ffd700" }}
                  >
                    ₡{player.lc.toLocaleString()}
                  </div>
                  <div className="text-xs font-body text-muted-foreground">
                    Legend Coins
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    ),

    /* ── PLAY ── */
    play: (
      <section className="animate-tab-in" aria-label="Choose game mode">
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
              background:
                "linear-gradient(90deg, #ff2200, #ffd700 50%, #0066ff)",
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
                Welcome, <span style={{ color: "#ff4422" }}>{legendId}</span>
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <WalletDisplay balance={balance} />
            </div>
          </div>
        </div>

        {/* Game modes */}
        <div className="px-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-base uppercase tracking-wider text-foreground">
              Choose Your Battle
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <GameModeCard
              mode="1v1 SOLO"
              title="Lone Wolf"
              description="1v1 Solo Combat — Prove your supremacy in direct confrontation."
              entryFee={50}
              accentColor="red"
              icon={<Sword className="w-6 h-6" />}
              playerCount="2 Players"
              isLoading={joiningMode === GameMode.loneWolf}
              onJoin={() => handleJoin(GameMode.loneWolf, 50)}
              joinButtonOcid="play.lone_wolf_join_button"
            />
            <GameModeCard
              mode="4v4 TEAMS"
              title="CS Mod"
              description="4v4 Team Clash — Lead your squad to victory in coordinated combat."
              entryFee={100}
              accentColor="blue"
              icon={<Shield className="w-6 h-6" />}
              playerCount="8 Players"
              isLoading={joiningMode === GameMode.csMod}
              onJoin={() => handleJoin(GameMode.csMod, 100)}
              joinButtonOcid="play.cs_mod_join_button"
            />
            <GameModeCard
              mode="FULL MAP"
              title="BR Mod"
              description="50 Players, One Champion — The ultimate test of survival."
              entryFee={200}
              accentColor="purple"
              icon={<Globe className="w-6 h-6" />}
              playerCount="50 Players"
              isLoading={joiningMode === GameMode.brMod}
              onJoin={() => handleJoin(GameMode.brMod, 200)}
              joinButtonOcid="play.br_mod_join_button"
            />
          </div>
        </div>
      </section>
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
            {selectedProfilePic > 0 ? (
              <img
                src={
                  AVATAR_TIERS.find((t) => t.index === selectedProfilePic)
                    ?.src ?? ""
                }
                alt="Profile avatar"
                className="w-full h-full rounded-full object-cover"
                style={{
                  border: `2px solid ${avatarGlowColor}`,
                  boxShadow: `0 0 12px ${avatarGlowColor}66`,
                }}
              />
            ) : (
              <div
                className="w-full h-full rounded-full flex items-center justify-center font-display font-black text-xl uppercase"
                style={{
                  background:
                    "radial-gradient(circle at 35% 35%, rgba(255,60,0,0.6), rgba(200,0,0,0.8))",
                  border: "2px solid rgba(255,100,0,0.5)",
                  color: "#fff",
                }}
              >
                {(legendId ?? "??").substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <div
              className="font-display font-black text-lg tracking-wide"
              style={{ color: "#fff" }}
            >
              {legendId}
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
            className="font-display font-black text-lg tracking-widest"
          >
            <span style={{ color: "#ff2200" }}>LX</span>
            <span style={{ color: "#ffd700" }}>A</span>
          </a>

          <div className="hidden sm:flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: "#22cc66", boxShadow: "0 0 6px #22cc66" }}
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
