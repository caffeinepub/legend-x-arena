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
    selectedProfilePic: bigint;
    totalDeposited: bigint;
    selectedFrame: bigint;
}
export interface CustomShopAvatar {
    src: string;
    name: string;
    index: bigint;
    price: bigint;
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
    addCoins(adminLegendId: string, adminPasswordHash: string, targetLegendId: string, amount: bigint): Promise<void>;
    addCustomShopAvatar(adminLegendId: string, adminPasswordHash: string, name: string, price: bigint, src: string): Promise<bigint>;
    approveDepositRequest(adminLegendId: string, adminPasswordHash: string, requestId: string): Promise<void>;
    authenticate(legendId: string, passwordHash: string): Promise<boolean>;
    buyShopAvatar(legendId: string, passwordHash: string, avatarIndex: bigint): Promise<void>;
    buyShopFrame(legendId: string, passwordHash: string, frameIndex: bigint): Promise<void>;
    createTournament(adminLegendId: string, adminPasswordHash: string, title: string, category: string, mode: string, entryFee: bigint, prizePool: string, maxPlayers: bigint, imageUrl: string, returningCoins: bigint): Promise<string>;
    declareMatchResult(adminLegendId: string, adminPasswordHash: string, tournamentId: string, winnerLegendId: string, loserLegendId: string, winnerCoins: bigint, loserCoins: bigint): Promise<void>;
    deleteCustomShopAvatar(adminLegendId: string, adminPasswordHash: string, avatarIndex: bigint): Promise<void>;
    deleteTournament(adminLegendId: string, adminPasswordHash: string, id: string): Promise<void>;
    deleteUser(adminLegendId: string, adminPasswordHash: string, targetLegendId: string): Promise<void>;
    getActiveTournaments(): Promise<Array<Tournament>>;
    getAllUsers(adminLegendId: string): Promise<Array<UserProfile>>;
    getCustomShopAvatars(): Promise<Array<CustomShopAvatar>>;
    getLeaderboard(): Promise<Array<LeaderboardEntry>>;
    getMyDepositRequests(legendId: string, passwordHash: string): Promise<Array<DepositRequest>>;
    getNextLegendId(): Promise<string>;
    getPendingDepositRequests(adminLegendId: string, adminPasswordHash: string): Promise<Array<DepositRequest>>;
    getTournamentRoom(tournamentId: string, legendId: string): Promise<{
        roomPassword: string;
        roomId: string;
    }>;
    getTournaments(adminLegendId: string): Promise<Array<Tournament>>;
    getUserByLegendId(legendId: string): Promise<UserProfile>;
    joinTournamentById(legendId: string, passwordHash: string, tournamentId: string): Promise<void>;
    register(passwordHash: string, jazzCash: string, uid: string, ignName: string): Promise<string>;
    rejectDepositRequest(adminLegendId: string, adminPasswordHash: string, requestId: string): Promise<void>;
    resetUsersWithDepositTierAvatar(adminLegendId: string, adminPasswordHash: string, tierIndex: bigint): Promise<void>;
    setProfileFrame(legendId: string, passwordHash: string, frameIndex: bigint): Promise<void>;
    setProfilePicture(legendId: string, passwordHash: string, picIndex: bigint): Promise<void>;
    setTournamentRoom(adminLegendId: string, adminPasswordHash: string, tournamentId: string, roomId: string, roomPassword: string): Promise<void>;
    submitDepositRequest(legendId: string, passwordHash: string, amount: bigint, transactionId: string): Promise<void>;
    toggleBan(adminLegendId: string, adminPasswordHash: string, targetLegendId: string): Promise<void>;
    updatePlayerInfo(legendId: string, passwordHash: string, gameName: string, gameUID: string, jazzCashNumber: string): Promise<void>;
    updateTournament(adminLegendId: string, adminPasswordHash: string, id: string, title: string, category: string, mode: string, entryFee: bigint, prizePool: string, maxPlayers: bigint, imageUrl: string, isActive: boolean, returningCoins: bigint): Promise<void>;
}
