import Map "mo:core/Map";
import Principal "mo:core/Principal";

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

  type OldActor = {
    users : Map.Map<Principal, UserProfile>;
    isFirstAdminSet : Bool;
  };

  type NewActor = {
    users : Map.Map<Principal, UserProfile>;
    isFirstAdminSet : Bool;
    depositRequests : Map.Map<Text, DepositRequest>;
    depositIdCounter : Nat;
  };

  public func run(old : OldActor) : NewActor {
    {
      users = old.users;
      isFirstAdminSet = old.isFirstAdminSet;
      depositRequests = Map.empty<Text, DepositRequest>();
      depositIdCounter = 0;
    };
  };
};
