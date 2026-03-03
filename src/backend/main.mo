import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";



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
    jazzCashNumber : Text;
    gameName : Text;
    gameUID : Text;
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
  };

  var isFirstAdminSet = false;
  let users = Map.empty<Principal, UserProfile>();
  let depositRequests = Map.empty<Text, DepositRequest>();
  let tournaments = Map.empty<Text, Tournament>();
  var depositIdCounter = 0;
  var tournamentIdCounter = 0;

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

  // UPDATED: Registration now takes jazzCashNumber, gameName, and gameUID
  public shared ({ caller }) func register(legendId : Text, passwordHash : Text, jazzCash : Text, uid : Text, ignName : Text) : async () {
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
      jazzCashNumber = jazzCash;
      gameName = ignName;
      gameUID = uid;
    };

    users.add(caller, newUser);
  };

  // NEW METHOD: Only update IGN, UID, and JazzCash
  public shared ({ caller }) func updatePlayerInfo(gameName : Text, gameUID : Text, jazzCashNumber : Text) : async () {
    let userProfile = getUserByPrincipalOrTrap(caller);
    let updatedProfile = {
      userProfile with
      gameName;
      gameUID;
      jazzCashNumber;
    };
    users.add(caller, updatedProfile);
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

  // Tournament Management

  public shared ({ caller }) func createTournament(
    title : Text,
    category : Text,
    mode : Text,
    entryFee : Nat,
    prizePool : Text,
    maxPlayers : Nat,
    imageUrl : Text,
  ) : async Text {
    assertAdmin(caller);

    let tournamentId = tournamentIdCounter.toText();
    tournamentIdCounter += 1;

    let newTournament : Tournament = {
      id = tournamentId;
      title;
      category;
      mode;
      entryFee;
      prizePool;
      maxPlayers;
      currentPlayers = 0;
      imageUrl;
      isActive = true;
      createdAt = Time.now();
      roomId = "";
      roomPassword = "";
      joinedPlayers = [];
    };

    tournaments.add(tournamentId, newTournament);
    tournamentId;
  };

  public shared ({ caller }) func updateTournament(
    id : Text,
    title : Text,
    category : Text,
    mode : Text,
    entryFee : Nat,
    prizePool : Text,
    maxPlayers : Nat,
    imageUrl : Text,
    isActive : Bool,
  ) : async () {
    assertAdmin(caller);

    let tournament = switch (tournaments.get(id)) {
      case (null) { Runtime.trap("Tournament not found") };
      case (?t) { t };
    };

    let updatedTournament = {
      id = tournament.id;
      title;
      category;
      mode;
      entryFee;
      prizePool;
      maxPlayers;
      currentPlayers = tournament.currentPlayers; // Preserve existing players count
      imageUrl;
      isActive;
      createdAt = tournament.createdAt;
      roomId = tournament.roomId; // Preserve roomId
      roomPassword = tournament.roomPassword; // Preserve roomPassword
      joinedPlayers = tournament.joinedPlayers; // Preserve joinedPlayers
    };

    tournaments.add(id, updatedTournament);
  };

  public shared ({ caller }) func deleteTournament(id : Text) : async () {
    assertAdmin(caller);

    switch (tournaments.get(id)) {
      case (null) { Runtime.trap("Tournament not found") };
      case (?_) {
        tournaments.remove(id);
      };
    };
  };

  public query ({ caller }) func getTournaments() : async [Tournament] {
    assertAdmin(caller);
    tournaments.values().toArray();
  };

  public query ({ caller }) func getActiveTournaments() : async [Tournament] {
    tournaments.values().toArray().filter(
      func(t) { t.isActive }
    );
  };

  public shared ({ caller }) func setTournamentRoom(tournamentId : Text, roomId : Text, roomPassword : Text) : async () {
    assertAdmin(caller);

    switch (tournaments.get(tournamentId)) {
      case (null) { Runtime.trap("Tournament not found") };
      case (?tournament) {
        let updatedTournament = { tournament with roomId; roomPassword };
        tournaments.add(tournamentId, updatedTournament);
      };
    };
  };

  public shared ({ caller }) func joinTournamentById(tournamentId : Text) : async () {
    switch (tournaments.get(tournamentId)) {
      case (null) { Runtime.trap("Tournament not found") };
      case (?tournament) {
        if (not tournament.isActive) {
          Runtime.trap("This tournament is no longer active");
        };
        if (tournament.currentPlayers >= tournament.maxPlayers) {
          Runtime.trap("Tournament is full");
        };

        let userProfile = getUserByPrincipalOrTrap(caller);

        if (userProfile.isBanned) {
          Runtime.trap("Banned users cannot join tournaments");
        };

        if (userProfile.walletBalance < tournament.entryFee) {
          Runtime.trap("Insufficient balance");
        };

        // Check if already joined
        if (tournament.joinedPlayers.any(func(pid) { pid == userProfile.legendId })) {
          Runtime.trap("Already joined this tournament");
        };

        let updatedMatchHistory = userProfile.matchHistory.concat([{
          matchId = tournamentId;
          mode = #loneWolf;
          result = #loss;
          coinsWagered = tournament.entryFee;
          date = Time.now();
        }]);

        users.add(caller, {
          userProfile with
          walletBalance = userProfile.walletBalance - tournament.entryFee;
          matchHistory = updatedMatchHistory;
        });

        // Add user to joinedPlayers
        let updatedTournament = {
          tournament with
          currentPlayers = tournament.currentPlayers + 1;
          joinedPlayers = tournament.joinedPlayers.concat([userProfile.legendId]);
        };
        tournaments.add(tournamentId, updatedTournament);
      };
    };
  };

  public query ({ caller }) func getTournamentRoom(tournamentId : Text, legendId : Text) : async { roomId : Text; roomPassword : Text } {
    switch (tournaments.get(tournamentId)) {
      case (null) { Runtime.trap("Tournament not found") };
      case (?tournament) {
        // Check if user has joined
        if (not tournament.joinedPlayers.any(func(id) { id == legendId })) {
          Runtime.trap("You must join the tournament to view room details");
        };
        { roomId = tournament.roomId; roomPassword = tournament.roomPassword };
      };
    };
  };

  // New leaderboard query implementation // <-------------------- COMMENT: EXPLAIN THIS
  type LeaderboardEntry = {
    legendId : Text;
    wins : Nat;
    totalDeposited : Nat;
    createdAt : Int;
    totalMatches : Nat;
  };

  public query ({ caller }) func getLeaderboard() : async [LeaderboardEntry] {
    users.values().toArray().map(
      func(user) {
        {
          legendId = user.legendId;
          wins = user.matchHistory.foldLeft(
            0,
            func(acc, match) {
              if (match.result == #win) { acc + 1 } else { acc };
            },
          );
          totalDeposited = user.totalDeposited;
          createdAt = user.createdAt;
          totalMatches = user.matchHistory.size();
        };
      }
    );
  };
};
