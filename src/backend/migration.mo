import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Nat "mo:core/Nat";

module {
  type Role = { #admin; #user };
  type GameMode = { #loneWolf; #csMod; #brMod };
  type Result = { #win; #loss; #draw };
  type TransactionType = { #deposit; #withdraw };

  type UserProfile = {
    legendId : Text;
    passwordHash : Text;
    role : Role;
    walletBalance : Nat;
    isBanned : Bool;
    createdAt : Int;
    matchHistory : [Match];
    transactions : [Transaction];
    totalDeposited : Nat;
    selectedProfilePic : Nat;
    jazzCashNumber : Text;
    gameName : Text;
    gameUID : Text;
    totalProfit : Nat;
    purchasedShopAvatars : [Nat];
    purchasedFrames : [Nat];
    selectedFrame : Nat;
  };

  type Match = {
    matchId : Text;
    mode : GameMode;
    result : Result;
    coinsWagered : Nat;
    date : Int;
  };

  type Transaction = {
    txType : TransactionType;
    amount : Nat;
    date : Int;
    description : Text;
  };

  type DepositStatus = { #pending; #approved; #rejected };

  type DepositRequest = {
    id : Text;
    legendId : Text;
    amount : Nat;
    transactionId : Text;
    status : DepositStatus;
    submittedAt : Int;
  };

  type Tournament = {
    id : Text;
    title : Text;
    category : Text;
    mode : Text;
    entryFee : Nat;
    prizePool : Text;
    maxPlayers : Nat;
    currentPlayers : Nat;
    imageUrl : Text;
    isActive : Bool;
    createdAt : Int;
    roomId : Text;
    roomPassword : Text;
    joinedPlayers : [Text];
    returningCoins : Nat;
  };

  type OldActor = {
    isFirstAdminSet : Bool;
    users : Map.Map<Principal, UserProfile>;
    depositRequests : Map.Map<Text, DepositRequest>;
    tournaments : Map.Map<Text, Tournament>;
    depositIdCounter : Nat;
    tournamentIdCounter : Nat;
    userIdCounter : Nat;
  };

  type NewActor = {
    isFirstAdminSet : Bool;
    users : Map.Map<Text, UserProfile>;
    depositRequests : Map.Map<Text, DepositRequest>;
    tournaments : Map.Map<Text, Tournament>;
    depositIdCounter : Nat;
    tournamentIdCounter : Nat;
    userIdCounter : Nat;
  };

  // Migration function called by the main actor via with-clause
  public func run(old : OldActor) : NewActor {
    let newUsers = Map.empty<Text, UserProfile>();
    old.users.entries().forEach(
      func((_principal, profile)) {
        newUsers.add(profile.legendId, profile);
      }
    );
    { old with users = newUsers };
  };
};
