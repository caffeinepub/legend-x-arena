import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  type Role = { #admin; #user };
  type GameMode = { #loneWolf; #csMod; #brMod };
  type Result = { #win; #loss; #draw };
  type TransactionType = { #deposit; #withdraw };

  type OldUserProfile = {
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
    users : Map.Map<Principal, OldUserProfile>;
    depositRequests : Map.Map<Text, DepositRequest>;
    tournaments : Map.Map<Text, Tournament>;
    isFirstAdminSet : Bool;
    depositIdCounter : Nat;
    tournamentIdCounter : Nat;
    userIdCounter : Nat;
  };

  type NewUserProfile = {
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

  type NewActor = {
    users : Map.Map<Principal, NewUserProfile>;
    depositRequests : Map.Map<Text, DepositRequest>;
    tournaments : Map.Map<Text, Tournament>;
    isFirstAdminSet : Bool;
    depositIdCounter : Nat;
    tournamentIdCounter : Nat;
    userIdCounter : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newUsers = old.users.map<Principal, OldUserProfile, NewUserProfile>(
      func(_p, oldProfile) {
        {
          oldProfile with
          purchasedShopAvatars = [];
          purchasedFrames = [];
          selectedFrame = 0;
        };
      }
    );
    { old with users = newUsers };
  };
};
