import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  type OldUserProfile = {
    legendId : Text;
    passwordHash : Text;
    role : { #admin; #user };
    walletBalance : Nat;
    isBanned : Bool;
    createdAt : Int;
    matchHistory : [{ matchId : Text; mode : { #loneWolf; #csMod; #brMod }; result : { #win; #loss; #draw }; coinsWagered : Nat; date : Int }];
    transactions : [{
      txType : { #deposit; #withdraw };
      amount : Nat;
      date : Int;
      description : Text;
    }];
  };

  type OldDepositRequest = {
    id : Text;
    legendId : Text;
    amount : Nat;
    transactionId : Text;
    status : { #pending; #approved; #rejected };
    submittedAt : Int;
  };

  type OldActor = {
    users : Map.Map<Principal, OldUserProfile>;
    depositRequests : Map.Map<Text, OldDepositRequest>;
    depositIdCounter : Nat;
    isFirstAdminSet : Bool;
  };

  type NewUserProfile = {
    legendId : Text;
    passwordHash : Text;
    role : { #admin; #user };
    walletBalance : Nat;
    isBanned : Bool;
    createdAt : Int;
    matchHistory : [{ matchId : Text; mode : { #loneWolf; #csMod; #brMod }; result : { #win; #loss; #draw }; coinsWagered : Nat; date : Int }];
    transactions : [{
      txType : { #deposit; #withdraw };
      amount : Nat;
      date : Int;
      description : Text;
    }];
    totalDeposited : Nat;
    selectedProfilePic : Nat;
  };

  type NewDepositRequest = {
    id : Text;
    legendId : Text;
    amount : Nat;
    transactionId : Text;
    status : { #pending; #approved; #rejected };
    submittedAt : Int;
  };

  type NewActor = {
    users : Map.Map<Principal, NewUserProfile>;
    depositRequests : Map.Map<Text, NewDepositRequest>;
    depositIdCounter : Nat;
    isFirstAdminSet : Bool;
  };

  public func run(old : OldActor) : NewActor {
    let newUsers = old.users.map<Principal, OldUserProfile, NewUserProfile>(
      func(_principal, oldUser) {
        {
          oldUser with
          totalDeposited = 0;
          selectedProfilePic = 0;
        };
      }
    );
    { old with users = newUsers };
  };
};
