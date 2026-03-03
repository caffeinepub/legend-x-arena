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
    createdAt: bigint;
    role: Role;
    isBanned: boolean;
    passwordHash: string;
    selectedProfilePic: bigint;
    transactions: Array<Transaction>;
    totalDeposited: bigint;
    walletBalance: bigint;
    matchHistory: Array<Match>;
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
    approveDepositRequest(requestId: string): Promise<void>;
    authenticate(legendId: string, passwordHash: string): Promise<boolean>;
    createTournament(title: string, category: string, mode: string, entryFee: bigint, prizePool: string, maxPlayers: bigint, imageUrl: string): Promise<string>;
    deleteTournament(id: string): Promise<void>;
    getActiveTournaments(): Promise<Array<Tournament>>;
    getMyDepositRequests(): Promise<Array<DepositRequest>>;
    getPendingDepositRequests(): Promise<Array<DepositRequest>>;
    getTournamentRoom(tournamentId: string, legendId: string): Promise<{
        roomPassword: string;
        roomId: string;
    }>;
    getTournaments(): Promise<Array<Tournament>>;
    getUserByLegendId(legendId: string): Promise<UserProfile>;
    joinTournamentById(tournamentId: string): Promise<void>;
    register(legendId: string, passwordHash: string): Promise<void>;
    rejectDepositRequest(requestId: string): Promise<void>;
    setProfilePicture(picIndex: bigint): Promise<void>;
    setTournamentRoom(tournamentId: string, roomId: string, roomPassword: string): Promise<void>;
    submitDepositRequest(amount: bigint, transactionId: string): Promise<void>;
    toggleBan(legendId: string): Promise<void>;
    updateTournament(id: string, title: string, category: string, mode: string, entryFee: bigint, prizePool: string, maxPlayers: bigint, imageUrl: string, isActive: boolean): Promise<void>;
}
