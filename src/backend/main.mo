import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Principal "mo:core/Principal";

actor {
  type Role = { #admin; #user };
  type GameMode = { #loneWolf; #csMod; #brMod };
  type Result = { #win; #loss; #draw };
  type TransactionType = {
    #deposit;
    #withdraw;
  };

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

  var isFirstAdminSet = false;

  let users = Map.empty<Principal, UserProfile>();

  module UserProfile {
    public func compare(a : UserProfile, b : UserProfile) : Order.Order {
      Text.compare(a.legendId, b.legendId);
    };
  };

  func isAdmin(caller : Principal) : Bool {
    switch (users.get(caller)) {
      case (null) { false };
      case (?userProfile) {
        userProfile.role == #admin;
      };
    };
  };

  func assertAdmin(caller : Principal) {
    if (not isAdmin(caller)) { Runtime.trap("Admin privileges required") };
  };

  public shared ({ caller }) func register(legendId : Text, passwordHash : Text) : async () {
    if (users.values().any(func(p) { p.legendId == legendId })) {
      Runtime.trap("Legend ID already taken");
    };

    let role = if (not isFirstAdminSet) { isFirstAdminSet := true; #admin } else {
      #user;
    };

    let newUser : UserProfile = {
      legendId;
      passwordHash;
      role;
      walletBalance = 100;
      isBanned = false;
      createdAt = Time.now();
      matchHistory = [];
      transactions = [];
    };

    users.add(caller, newUser);
  };

  public shared ({ caller }) func authenticate(legendId : Text, passwordHash : Text) : async Bool {
    switch (users.get(caller)) {
      case (null) { false };
      case (?userProfile) {
        userProfile.legendId == legendId and userProfile.passwordHash == passwordHash;
      };
    };
  };

  public query ({ caller }) func getUserByLegendId(legendId : Text) : async UserProfile {
    switch (users.values().find(func(p) { p.legendId == legendId })) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };
  };

  public shared ({ caller }) func toggleBan(legendId : Text) : async () {
    assertAdmin(caller);
    let entry = users.entries().find(func((_, profile)) { profile.legendId == legendId });
    switch (entry) {
      case (null) { Runtime.trap("User not found") };
      case (?(principal, profile)) {
        let updatedProfile = {
          profile with
          isBanned = not profile.isBanned;
        };
        users.add(principal, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func joinTournament(mode : GameMode, wager : Nat) : async () {
    switch (users.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?userProfile) {
        if (userProfile.isBanned) {
          Runtime.trap("Banned users cannot join tournaments");
        };

        if (userProfile.walletBalance < wager) {
          Runtime.trap("Insufficient balance");
        };

        let updatedProfile : UserProfile = {
          userProfile with
          walletBalance = userProfile.walletBalance - wager;
        };

        users.add(caller, updatedProfile);
      };
    };
  };
};
