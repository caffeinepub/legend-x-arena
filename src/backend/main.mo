import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Migration "migration";

(with migration = Migration.run)
actor {
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

  var isFirstAdminSet = false;
  let users = Map.empty<Principal, UserProfile>();
  let depositRequests = Map.empty<Text, DepositRequest>();
  var depositIdCounter = 0;

  module UserProfile {
    public func compare(a : UserProfile, b : UserProfile) : Order.Order {
      Text.compare(a.legendId, b.legendId);
    };
  };

  func isAdmin(caller : Principal) : Bool {
    switch (users.get(caller)) {
      case (null) { false };
      case (?userProfile) {
        switch (userProfile.role) {
          case (#admin) { true };
          case (#user) { false };
        };
      };
    };
  };

  func assertAdmin(caller : Principal) {
    if (not isAdmin(caller)) { Runtime.trap("Admin privileges required") };
  };

  func getUserByLegendIdInternal(legendId : Text) : ?(Principal, UserProfile) {
    users.entries().find(func((_, profile)) { profile.legendId == legendId });
  };

  func getUserByPrincipalOrTrap(principal : Principal) : UserProfile {
    switch (users.get(principal)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };
  };

  func updateUser(
    principal : Principal,
    updateFunc : UserProfile -> UserProfile,
  ) {
    let profile = getUserByPrincipalOrTrap(principal);
    users.add(principal, updateFunc(profile));
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
      totalDeposited = 0;
      selectedProfilePic = 0;
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
    switch (getUserByLegendIdInternal(legendId)) {
      case (null) { Runtime.trap("User not found") };
      case (?(_, profile)) { profile };
    };
  };

  public shared ({ caller }) func toggleBan(legendId : Text) : async () {
    assertAdmin(caller);
    switch (getUserByLegendIdInternal(legendId)) {
      case (null) { Runtime.trap("User not found") };
      case (?(principal, profile)) {
        let updatedProfile = { profile with isBanned = not profile.isBanned };
        users.add(principal, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func joinTournament(mode : GameMode, wager : Nat) : async () {
    updateUser(
      caller,
      func(userProfile) {
        if (userProfile.isBanned) {
          Runtime.trap("Banned users cannot join tournaments");
        };
        if (userProfile.walletBalance < wager) {
          Runtime.trap("Insufficient balance");
        };
        { userProfile with walletBalance = userProfile.walletBalance - wager };
      },
    );
  };

  // Deposit Management

  public shared ({ caller }) func submitDepositRequest(amount : Nat, transactionId : Text) : async () {
    let userProfile = getUserByPrincipalOrTrap(caller);

    let depositId = depositIdCounter.toText();
    depositIdCounter += 1;

    let newRequest : DepositRequest = {
      id = depositId;
      legendId = userProfile.legendId;
      amount;
      transactionId;
      status = #pending;
      submittedAt = Time.now();
    };

    depositRequests.add(depositId, newRequest);
  };

  public shared ({ caller }) func getMyDepositRequests() : async [DepositRequest] {
    let userProfile = getUserByPrincipalOrTrap(caller);
    depositRequests.values().toArray().filter(
      func(r) {
        r.legendId == userProfile.legendId;
      }
    );
  };

  public shared ({ caller }) func getPendingDepositRequests() : async [DepositRequest] {
    assertAdmin(caller);
    depositRequests.values().toArray().filter(
      func(r) { r.status == #pending }
    );
  };

  public shared ({ caller }) func approveDepositRequest(requestId : Text) : async () {
    assertAdmin(caller);
    let request = switch (depositRequests.get(requestId)) {
      case (null) { Runtime.trap("Deposit request not found") };
      case (?r) { r };
    };

    let userEntry = getUserByLegendIdInternal(request.legendId);
    switch (userEntry) {
      case (null) { Runtime.trap("User not found for deposit") };
      case (?(userPrincipal, userData)) {
        // Update deposit status
        depositRequests.add(requestId, { request with status = #approved });

        let newTransaction : Transaction = {
          txType = #deposit;
          amount = request.amount;
          date = Time.now();
          description = "Deposit Approved";
        };

        // Update user and transactions
        let updatedProfile = {
          userData with
          walletBalance = userData.walletBalance + request.amount;
          transactions = userData.transactions.concat([newTransaction]);
          totalDeposited = userData.totalDeposited + request.amount;
        };
        users.add(userPrincipal, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func rejectDepositRequest(requestId : Text) : async () {
    assertAdmin(caller);
    let request = switch (depositRequests.get(requestId)) {
      case (null) { Runtime.trap("Deposit request not found") };
      case (?r) { r };
    };
    depositRequests.add(requestId, { request with status = #rejected });
  };

  public shared ({ caller }) func setProfilePicture(picIndex : Nat) : async () {
    let userProfile = getUserByPrincipalOrTrap(caller);

    let minDeposit = switch (picIndex) {
      case (0) { 0 };
      case (1) { 50 };
      case (2) { 100 };
      case (3) { 200 };
      case (4) { 500 };
      case (5) { 800 };
      case (6) { 1000 };
      case (_) { Runtime.trap("Invalid profile picture index") };
    };

    if (userProfile.totalDeposited < minDeposit) {
      Runtime.trap("Insufficient total deposits to unlock this profile picture");
    };

    let updatedProfile = { userProfile with selectedProfilePic = picIndex };
    users.add(caller, updatedProfile);
  };
};
