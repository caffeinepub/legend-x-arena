import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Transaction {
    date: bigint;
    description: string;
    txType: TransactionType;
    amount: bigint;
}
export interface LeaderboardEntry {
    legendId: string;
    totalMatches: bigint;
    createdAt: bigint;
    wins: bigint;
    totalProfit: bigint;
    gameName: string;
    totalDeposited: bigint;
}
export interface DepositRequest {
    id: string;
    status: DepositStatus;
    legendId: string;
    submittedAt: bigint;
    amount: bigint;
    transactionId: string;
}
export interface Tournament {
    id: string;
    title: string;
    mode: string;
    createdAt: bigint;
    isActive: boolean;
    roomPassword: string;
    imageUrl: string;
    returningCoins: bigint;
    currentPlayers: bigint;
    category: string;
    entryFee: bigint;
    joinedPlayers: Array<string>;
    roomId: string;
    maxPlayers: bigint;
    prizePool: string;
}
export interface Match {
    result: Result;
    date: bigint;
    mode: GameMode;
    matchId: string;
    coinsWagered: bigint;
}
export interface UserProfile {
    legendId: string;
    purchasedShopAvatars: Array<bigint>;
    createdAt: bigint;
    role: Role;
    purchasedFrames: Array<bigint>;
    jazzCashNumber: string;
    totalProfit: bigint;
    gameUID: string;
    isBanned: boolean;
    passwordHash: string;
    gameName: string;
    selectedProfilePic: bigint;
    transactions: Array<Transaction>;
    totalDeposited: bigint;
    walletBalance: bigint;
    matchHistory: Array<Match>;
    selectedFrame: bigint;
}
export enum DepositStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum GameMode {
    csMod = "csMod",
    loneWolf = "loneWolf",
    brMod = "brMod"
}
export enum Result {
    win = "win",
    draw = "draw",
    loss = "loss"
}
export enum Role {
    admin = "admin",
    user = "user"
}
export enum TransactionType {
    withdraw = "withdraw",
    deposit = "deposit"
}
export interface backendInterface {
    addCoins(legendId: string, amount: bigint): Promise<void>;
    approveDepositRequest(requestId: string): Promise<void>;
    authenticate(legendId: string, passwordHash: string): Promise<boolean>;
    createTournament(title: string, category: string, mode: string, entryFee: bigint, prizePool: string, maxPlayers: bigint, imageUrl: string, returningCoins: bigint): Promise<string>;
    declareMatchResult(tournamentId: string, winnerLegendId: string, loserLegendId: string, winnerCoins: bigint, loserCoins: bigint): Promise<void>;
    deleteTournament(id: string): Promise<void>;
    getActiveTournaments(): Promise<Array<Tournament>>;
    getLeaderboard(): Promise<Array<LeaderboardEntry>>;
    getMyDepositRequests(): Promise<Array<DepositRequest>>;
    getPendingDepositRequests(): Promise<Array<DepositRequest>>;
    getTournamentRoom(tournamentId: string, legendId: string): Promise<{
        roomPassword: string;
        roomId: string;
    }>;
    getTournaments(): Promise<Array<Tournament>>;
    getUserByLegendId(legendId: string): Promise<UserProfile>;
    joinTournamentById(tournamentId: string): Promise<void>;
    register(passwordHash: string, jazzCash: string, uid: string, ignName: string): Promise<string>;
    rejectDepositRequest(requestId: string): Promise<void>;
    setProfilePicture(picIndex: bigint): Promise<void>;
    setTournamentRoom(tournamentId: string, roomId: string, roomPassword: string): Promise<void>;
    submitDepositRequest(amount: bigint, transactionId: string): Promise<void>;
    toggleBan(legendId: string): Promise<void>;
    updatePlayerInfo(gameName: string, gameUID: string, jazzCashNumber: string): Promise<void>;
    updateTournament(id: string, title: string, category: string, mode: string, entryFee: bigint, prizePool: string, maxPlayers: bigint, imageUrl: string, isActive: boolean, returningCoins: bigint): Promise<void>;
}
