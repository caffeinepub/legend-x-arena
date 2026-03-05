import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";

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
    var isFirstAdminSet : Bool;
    users : Map.Map<Text, UserProfile>;
    depositRequests : Map.Map<Text, DepositRequest>;
    tournaments : Map.Map<Text, Tournament>;
    depositIdCounter : Nat;
    tournamentIdCounter : Nat;
    userIdCounter : Nat;
  };

  type NewActor = {
    var isFirstAdminSet : Bool;
    users : Map.Map<Text, UserProfile>;
    depositRequests : Map.Map<Text, DepositRequest>;
    tournaments : Map.Map<Text, Tournament>;
    depositIdCounter : Nat;
    tournamentIdCounter : Nat;
    userIdCounter : Nat;
  };

  public func run(old : OldActor) : NewActor {
    {
      var isFirstAdminSet = old.isFirstAdminSet;
      users = old.users;
      depositRequests = old.depositRequests;
      tournaments = old.tournaments;
      depositIdCounter = old.depositIdCounter;
      tournamentIdCounter = old.tournamentIdCounter;
      userIdCounter = old.userIdCounter;
    };
  };
};
