import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";

module {
  type Role = { #admin; #user };
  type GameMode = { #loneWolf; #csMod; #brMod };
  type Result = { #win; #loss; #draw };
  type TransactionType = { #deposit; #withdraw };
  type DepositStatus = { #pending; #approved; #rejected };

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

  type UserProfileOld = {
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
  };

  type TournamentOld = {
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
  };

  type DepositRequest = {
    id : Text;
    legendId : Text;
    amount : Nat;
    transactionId : Text;
    status : DepositStatus;
    submittedAt : Int;
  };

  type ActorOld = {
    isFirstAdminSet : Bool;
    users : Map.Map<Principal, UserProfileOld>;
    depositRequests : Map.Map<Text, DepositRequest>;
    tournaments : Map.Map<Text, TournamentOld>;
    depositIdCounter : Nat;
    tournamentIdCounter : Nat;
    userIdCounter : Nat;
  };

  // New Types (don't need to redefine everything, just new fields)
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

  type Actor = {
    isFirstAdminSet : Bool;
    users : Map.Map<Principal, UserProfile>;
    depositRequests : Map.Map<Text, DepositRequest>;
    tournaments : Map.Map<Text, Tournament>;
    depositIdCounter : Nat;
    tournamentIdCounter : Nat;
    userIdCounter : Nat;
  };

  public func run(old : ActorOld) : Actor {
    let newUsers = old.users.map<Principal, UserProfileOld, UserProfile>(
      func(_p, oldProfile) {
        { oldProfile with totalProfit = 0 };
      }
    );

    let newTournaments = old.tournaments.map<Text, TournamentOld, Tournament>(
      func(_id, oldTournament) {
        { oldTournament with returningCoins = 0 };
      }
    );

    {
      old with
      users = newUsers;
      tournaments = newTournaments;
    };
  };
};
