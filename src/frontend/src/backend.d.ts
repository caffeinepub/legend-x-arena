import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    legendId: string;
    createdAt: bigint;
    role: Role;
    isBanned: boolean;
    passwordHash: string;
    transactions: Array<Transaction>;
    walletBalance: bigint;
    matchHistory: Array<Match>;
}
export interface Transaction {
    date: bigint;
    description: string;
    txType: TransactionType;
    amount: bigint;
}
export interface Match {
    result: Result;
    date: bigint;
    mode: GameMode;
    matchId: string;
    coinsWagered: bigint;
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
    authenticate(legendId: string, passwordHash: string): Promise<boolean>;
    getUserByLegendId(legendId: string): Promise<UserProfile>;
    joinTournament(mode: GameMode, wager: bigint): Promise<void>;
    register(legendId: string, passwordHash: string): Promise<void>;
    toggleBan(legendId: string): Promise<void>;
}
