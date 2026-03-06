import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";



actor {
  type Role = { #admin; #user };
  type GameMode = { #loneWolf; #csMod; #brMod };
  type Result = { #win; #loss; #draw };
  type TransactionType = { #deposit; #withdraw };
  type DepositStatus = { #pending; #approved; #rejected };

  type CustomShopAvatar = {
    index : Nat;
    name : Text;
    price : Nat;
    src : Text;
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
    totalDeposited : Nat;
    selectedProfilePic : Nat;
    jazzCashNumber : Text;
    gameName : Text;
    gameUID : Text;
    totalProfit : Nat;
    purchasedShopAvatars : [Nat];
    purchasedFrames : [Nat];
    selectedFrame : Nat;
    hasClaimedRouletteReward : Bool;
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

  type LeaderboardEntry = {
    legendId : Text;
    wins : Nat;
    totalDeposited : Nat;
    createdAt : Int;
    totalMatches : Nat;
    totalProfit : Nat;
    gameName : Text;
    selectedProfilePic : Nat;
    selectedFrame : Nat;
  };

  stable var isFirstAdminSet = false;
  stable var users = Map.empty<Text, UserProfile>();
  stable var depositRequests = Map.empty<Text, DepositRequest>();
  stable var tournaments = Map.empty<Text, Tournament>();
  stable var depositIdCounter = 0;
  stable var tournamentIdCounter = 0;
  stable var userIdCounter = 1;

  stable var customShopAvatars = Map.empty<Nat, CustomShopAvatar>();
  stable var customAvatarIndexCounter = 30; // Start at 30

  module UserProfile {
    public func compare(a : UserProfile, b : UserProfile) : Order.Order {
      switch (Text.compare(a.legendId, b.legendId)) {
        case (#equal) { #equal };
        case (#less) { #less };
        case (#greater) { #greater };
      };
    };
  };

  func assertAdmin(legendId : Text, passwordHash : Text) {
    switch (users.get(legendId)) {
      case (null) { Runtime.trap("Admin not found") };
      case (?userProfile) {
        switch (userProfile.role) {
          case (#admin) {
            if (not (userProfile.passwordHash == passwordHash)) { Runtime.trap("Incorrect password") };
          };
          case (#user) { Runtime.trap("Not admin") };
        };
      };
    };
  };

  func getUserByLegendIdOrTrap(legendId : Text) : UserProfile {
    switch (users.get(legendId)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };
  };

  func generateLegendId(counter : Nat) : Text {
    if (counter >= 1000) {
      counter.toText();
    } else if (counter >= 100) {
      "0" # counter.toText();
    } else if (counter >= 10) {
      "00" # counter.toText();
    } else {
      "000" # counter.toText();
    };
  };

  public query ({ caller }) func getNextLegendId() : async Text {
    var maxExistingId = 0;
    for (user in users.values()) {
      let numericId = switch (user.legendId.size()) {
        case (4) {
          let chars : [Char] = user.legendId.toArray();
          let idText = "" # chars[0].toText() # chars[1].toText() # chars[2].toText() # chars[3].toText();
          switch (Nat.fromText(idText)) {
            case (?id) { id };
            case (null) { 0 };
          };
        };
        case (3) { 0 };
        case (2) { 0 };
        case (1) { 0 };
        case (0) { 0 };
        case (_) { 0 };
      };
      if (numericId > maxExistingId) {
        maxExistingId := numericId;
      };
    };

    let nextId = if (maxExistingId >= userIdCounter) { maxExistingId + 1 } else { userIdCounter };
    generateLegendId(nextId);
  };

  public shared ({ caller }) func register(passwordHash : Text, jazzCash : Text, uid : Text, ignName : Text) : async Text {
    for (user in users.values()) {
      if (user.gameName == ignName and ignName != "") {
        Runtime.trap("Game Name already taken. Please choose a different Game Name.");
      };
      if (user.gameUID == uid and uid != "") {
        Runtime.trap("Game UID already registered. Each UID can only be used once.");
      };
      if (user.jazzCashNumber == jazzCash and jazzCash != "") {
        Runtime.trap("JazzCash number already registered on another account. Each number can only be used once.");
      };
    };
    var maxExistingId = 0;
    for (user in users.values()) {
      let numericId = switch (user.legendId.size()) {
        case (4) {
          let chars : [Char] = user.legendId.toArray();
          let idText = "" # chars[0].toText() # chars[1].toText() # chars[2].toText() # chars[3].toText();
          switch (Nat.fromText(idText)) {
            case (?id) { id };
            case (null) { 0 };
          };
        };
        case (3) { 0 };
        case (2) { 0 };
        case (1) { 0 };
        case (0) { 0 };
        case (_) { 0 };
      };
      if (numericId > maxExistingId) {
        maxExistingId := numericId;
      };
    };

    let usedId = if (maxExistingId >= userIdCounter) { maxExistingId + 1 } else { userIdCounter };

    let legendId = generateLegendId(usedId);

    if (users.values().any(func(p) { p.legendId == legendId })) {
      Runtime.trap("Legend ID generation error, already taken");
    };

    let role = if (not isFirstAdminSet) { isFirstAdminSet := true; #admin } else {
      #user;
    };

    let newUser : UserProfile = {
      legendId;
      passwordHash;
      role;
      walletBalance = 0;
      isBanned = false;
      createdAt = Time.now();
      matchHistory = [];
      transactions = [];
      totalDeposited = 0;
      selectedProfilePic = 0;
      jazzCashNumber = jazzCash;
      gameName = ignName;
      gameUID = uid;
      totalProfit = 0;
      purchasedShopAvatars = [];
      purchasedFrames = [];
      selectedFrame = 0;
      hasClaimedRouletteReward = false;
    };

    users.add(legendId, newUser);
    userIdCounter := usedId + 1;
    legendId;
  };

  public query ({ caller }) func authenticate(legendId : Text, passwordHash : Text) : async Bool {
    switch (users.get(legendId)) {
      case (null) { false };
      case (?profile) { profile.passwordHash == passwordHash and not profile.isBanned };
    };
  };

  public query ({ caller }) func getUserByLegendId(legendId : Text) : async UserProfile {
    switch (users.get(legendId)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };
  };

  public shared ({ caller }) func updatePlayerInfo(
    legendId : Text,
    passwordHash : Text,
    gameName : Text,
    gameUID : Text,
    jazzCashNumber : Text,
  ) : async () {
    let userProfile = getUserByLegendIdOrTrap(legendId);
    if (not (userProfile.passwordHash == passwordHash)) { Runtime.trap("Incorrect password") };
    for (otherUser in users.values()) {
      if (otherUser.legendId != legendId) {
        if (otherUser.gameName == gameName and gameName != "") {
          Runtime.trap("Game Name already taken by another account.");
        };
        if (otherUser.gameUID == gameUID and gameUID != "") {
          Runtime.trap("Game UID already registered on another account.");
        };
        if (otherUser.jazzCashNumber == jazzCashNumber and jazzCashNumber != "") {
          Runtime.trap("JazzCash number already registered on another account.");
        };
      };
    };
    let updatedProfile = {
      userProfile with
      gameName;
      gameUID;
      jazzCashNumber;
    };
    users.add(legendId, updatedProfile);
  };

  public shared ({ caller }) func toggleBan(adminLegendId : Text, adminPasswordHash : Text, targetLegendId : Text) : async () {
    assertAdmin(adminLegendId, adminPasswordHash);
    switch (users.get(targetLegendId)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) {
        let updatedProfile = {
          profile with isBanned = not profile.isBanned;
        };
        users.add(targetLegendId, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func deleteUser(adminLegendId : Text, adminPasswordHash : Text, targetLegendId : Text) : async () {
    assertAdmin(adminLegendId, adminPasswordHash);
    if (adminLegendId == targetLegendId) {
      Runtime.trap("Admins cannot delete their own account");
    };
    switch (users.get(targetLegendId)) {
      case (null) { Runtime.trap("User not found") };
      case (?_) {
        users.remove(targetLegendId);
      };
    };
  };

  public shared ({ caller }) func submitDepositRequest(legendId : Text, passwordHash : Text, amount : Nat, transactionId : Text) : async () {
    let userProfile = getUserByLegendIdOrTrap(legendId);
    if (not (userProfile.passwordHash == passwordHash)) { Runtime.trap("Incorrect password") };

    let depositId = depositIdCounter.toText();
    depositIdCounter += 1;

    let newRequest : DepositRequest = {
      id = depositId;
      legendId;
      amount;
      transactionId;
      status = #pending;
      submittedAt = Time.now();
    };

    depositRequests.add(depositId, newRequest);
  };

  public shared ({ caller }) func getMyDepositRequests(legendId : Text, passwordHash : Text) : async [DepositRequest] {
    let userProfile = getUserByLegendIdOrTrap(legendId);
    if (not (userProfile.passwordHash == passwordHash)) { Runtime.trap("Incorrect password") };
    depositRequests.values().toArray().filter(
      func(r) {
        r.legendId == legendId;
      }
    );
  };

  public shared ({ caller }) func getPendingDepositRequests(adminLegendId : Text, adminPasswordHash : Text) : async [DepositRequest] {
    assertAdmin(adminLegendId, adminPasswordHash);
    depositRequests.values().toArray().filter(
      func(r) { r.status == #pending }
    );
  };

  public shared ({ caller }) func approveDepositRequest(adminLegendId : Text, adminPasswordHash : Text, requestId : Text) : async () {
    assertAdmin(adminLegendId, adminPasswordHash);
    let request = switch (depositRequests.get(requestId)) {
      case (null) { Runtime.trap("Deposit request not found") };
      case (?r) { r };
    };

    let userProfile = getUserByLegendIdOrTrap(request.legendId);

    depositRequests.add(requestId, { request with status = #approved });

    let newTransaction : Transaction = {
      txType = #deposit;
      amount = request.amount;
      date = Time.now();
      description = "Deposit Approved";
    };

    let updatedProfile = {
      userProfile with
      walletBalance = userProfile.walletBalance + request.amount;
      transactions = userProfile.transactions.concat([newTransaction]);
      totalDeposited = userProfile.totalDeposited + request.amount;
    };
    users.add(request.legendId, updatedProfile);
  };

  public shared ({ caller }) func rejectDepositRequest(adminLegendId : Text, adminPasswordHash : Text, requestId : Text) : async () {
    assertAdmin(adminLegendId, adminPasswordHash);
    let request = switch (depositRequests.get(requestId)) {
      case (null) { Runtime.trap("Deposit request not found") };
      case (?r) { r };
    };
    depositRequests.add(requestId, { request with status = #rejected });
  };

  public shared ({ caller }) func setProfilePicture(legendId : Text, passwordHash : Text, picIndex : Nat) : async () {
    let userProfile = getUserByLegendIdOrTrap(legendId);
    if (not (userProfile.passwordHash == passwordHash)) { Runtime.trap("Incorrect password") };

    switch (picIndex) {
      case (0) { // Default avatar, always allowed
        let updatedProfile = { userProfile with selectedProfilePic = 0 };
        users.add(legendId, updatedProfile);
        return ();
      };
      case (1) { if (userProfile.totalDeposited < 50) { Runtime.trap("Insufficient total deposits to unlock this avatar (50 coins required)"); } };
      case (2) { if (userProfile.totalDeposited < 100) { Runtime.trap("Insufficient total deposits to unlock this avatar (100 coins required)"); } };
      case (3) { if (userProfile.totalDeposited < 200) { Runtime.trap("Insufficient total deposits to unlock this avatar (200 coins required)"); } };
      case (4) { if (userProfile.totalDeposited < 500) { Runtime.trap("Insufficient total deposits to unlock this avatar (500 coins required)"); } };
      case (5) { if (userProfile.totalDeposited < 800) { Runtime.trap("Insufficient total deposits to unlock this avatar (800 coins required)"); } };
      case (6) { if (userProfile.totalDeposited < 1000) { Runtime.trap("Insufficient total deposits to unlock this avatar (1000 coins required)"); } };
      case (_) {
        if (picIndex >= 10 and picIndex <= 19) { // Shop avatars
          if (not userProfile.purchasedShopAvatars.any(func(v) { v == picIndex })) {
            Runtime.trap("You must purchase this shop avatar before using it");
          };
        } else if (picIndex >= 30 and picIndex <= 1000) { // Custom avatars
          if (not userProfile.purchasedShopAvatars.any(func(v) { v == picIndex })) {
            switch (customShopAvatars.get(picIndex)) {
              case (null) { Runtime.trap("This custom avatar does not exist") };
              case (?_) {};
            };
          };
        } else {
          Runtime.trap("Invalid profile picture index. Please choose a valid avatar.");
        };
      };
    };

    let updatedProfile = { userProfile with selectedProfilePic = picIndex };
    users.add(legendId, updatedProfile);
  };

  public shared ({ caller }) func createTournament(
    adminLegendId : Text,
    adminPasswordHash : Text,
    title : Text,
    category : Text,
    mode : Text,
    entryFee : Nat,
    prizePool : Text,
    maxPlayers : Nat,
    imageUrl : Text,
    returningCoins : Nat,
  ) : async Text {
    assertAdmin(adminLegendId, adminPasswordHash);

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
      returningCoins;
    };

    tournaments.add(tournamentId, newTournament);
    tournamentId;
  };

  public shared ({ caller }) func updateTournament(
    adminLegendId : Text,
    adminPasswordHash : Text,
    id : Text,
    title : Text,
    category : Text,
    mode : Text,
    entryFee : Nat,
    prizePool : Text,
    maxPlayers : Nat,
    imageUrl : Text,
    isActive : Bool,
    returningCoins : Nat,
  ) : async () {
    assertAdmin(adminLegendId, adminPasswordHash);

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
      currentPlayers = tournament.currentPlayers;
      imageUrl;
      isActive;
      createdAt = tournament.createdAt;
      roomId = tournament.roomId;
      roomPassword = tournament.roomPassword;
      joinedPlayers = tournament.joinedPlayers;
      returningCoins;
    };

    tournaments.add(id, updatedTournament);
  };

  public shared ({ caller }) func deleteTournament(adminLegendId : Text, adminPasswordHash : Text, id : Text) : async () {
    assertAdmin(adminLegendId, adminPasswordHash);

    switch (tournaments.get(id)) {
      case (null) { Runtime.trap("Tournament not found") };
      case (?_) {
        tournaments.remove(id);
      };
    };
  };

  public query ({ caller }) func getTournaments(adminLegendId : Text) : async [Tournament] {
    let adminProfile = getUserByLegendIdOrTrap(adminLegendId);
    switch (adminProfile.role) {
      case (#admin) { tournaments.values().toArray() };
      case (#user) { Runtime.trap("Not admin") };
    };
  };

  public query ({ caller }) func getActiveTournaments() : async [Tournament] {
    tournaments.values().toArray().filter(
      func(t) { t.isActive }
    );
  };

  public shared ({ caller }) func setTournamentRoom(
    adminLegendId : Text,
    adminPasswordHash : Text,
    tournamentId : Text,
    roomId : Text,
    roomPassword : Text,
  ) : async () {
    assertAdmin(adminLegendId, adminPasswordHash);

    switch (tournaments.get(tournamentId)) {
      case (null) { Runtime.trap("Tournament not found") };
      case (?tournament) {
        let updatedTournament = { tournament with roomId; roomPassword };
        tournaments.add(tournamentId, updatedTournament);
      };
    };
  };

  public shared ({ caller }) func joinTournamentById(legendId : Text, passwordHash : Text, tournamentId : Text) : async () {
    switch (tournaments.get(tournamentId)) {
      case (null) { Runtime.trap("Tournament not found") };
      case (?tournament) {
        if (not tournament.isActive) {
          Runtime.trap("This tournament is no longer active");
        };
        if (tournament.currentPlayers >= tournament.maxPlayers) {
          Runtime.trap("Tournament is full");
        };

        let userProfile = getUserByLegendIdOrTrap(legendId);
        if (not (userProfile.passwordHash == passwordHash)) {
          Runtime.trap("Incorrect password");
        };

        if (userProfile.isBanned) {
          Runtime.trap("Banned users cannot join tournaments");
        };

        if (userProfile.walletBalance < tournament.entryFee) {
          Runtime.trap("Insufficient balance");
        };

        if (
          tournament.joinedPlayers.any(func(pid) { pid == legendId })
        ) {
          Runtime.trap("Already joined this tournament");
        };

        let updatedMatchHistory = userProfile.matchHistory.concat([{
          matchId = tournamentId;
          mode = #loneWolf;
          result = #loss;
          coinsWagered = tournament.entryFee;
          date = Time.now();
        }]);

        users.add(legendId, {
          userProfile with
          walletBalance = userProfile.walletBalance - tournament.entryFee;
          matchHistory = updatedMatchHistory;
        });

        let updatedTournament = {
          tournament with
          currentPlayers = tournament.currentPlayers + 1;
          joinedPlayers = tournament.joinedPlayers.concat([legendId]);
        };
        tournaments.add(tournamentId, updatedTournament);
      };
    };
  };

  public query ({ caller }) func getTournamentRoom(
    tournamentId : Text,
    legendId : Text,
  ) : async { roomId : Text; roomPassword : Text } {
    switch (tournaments.get(tournamentId)) {
      case (null) { Runtime.trap("Tournament not found") };
      case (?tournament) {
        if (not tournament.joinedPlayers.any(func(id) { id == legendId })) {
          Runtime.trap("You must join the tournament to view room details");
        };
        { roomId = tournament.roomId; roomPassword = tournament.roomPassword };
      };
    };
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
          totalProfit = user.totalProfit;
          gameName = user.gameName;
          selectedProfilePic = user.selectedProfilePic;
          selectedFrame = user.selectedFrame;
        };
      }
    );
  };

  public shared ({ caller }) func declareMatchResult(
    adminLegendId : Text,
    adminPasswordHash : Text,
    tournamentId : Text,
    winnerLegendId : Text,
    loserLegendId : Text,
    winnerCoins : Nat,
    loserCoins : Nat,
  ) : async () {
    assertAdmin(adminLegendId, adminPasswordHash);

    let winnerProfile = getUserByLegendIdOrTrap(winnerLegendId);
    let loserProfile = getUserByLegendIdOrTrap(loserLegendId);

    let winnerTx = {
      txType = #deposit;
      amount = winnerCoins;
      date = Time.now();
      description = "Match Win Prize";
    };

    let winnerMatchIndex = winnerProfile.matchHistory.findIndex(
      func(m) { m.matchId == tournamentId }
    );

    let winnerMatchHistory = switch (winnerMatchIndex) {
      case (?idx) {
        let updatedMatch = {
          winnerProfile.matchHistory[idx] with result = #win
        };
        Array.tabulate(winnerProfile.matchHistory.size(), func(i) { if (i == idx) { updatedMatch } else {
          winnerProfile.matchHistory[i];
        } });
      };
      case (null) {
        winnerProfile.matchHistory.concat([{
          matchId = tournamentId;
          mode = #loneWolf;
          result = #win;
          coinsWagered = 0;
          date = Time.now();
        }]);
      };
    };

    users.add(
      winnerLegendId,
      {
        winnerProfile with
        walletBalance = winnerProfile.walletBalance + winnerCoins;
        transactions = winnerProfile.transactions.concat([winnerTx]);
        matchHistory = winnerMatchHistory;
        totalProfit = winnerProfile.totalProfit + winnerCoins;
      },
    );

    if (loserCoins > 0) {
      let loserTx = {
        txType = #deposit;
        amount = loserCoins;
        date = Time.now();
        description = "Match Return Coins";
      };

      let loserMatchIndex = loserProfile.matchHistory.findIndex(
        func(m) { m.matchId == tournamentId }
      );

      let loserMatchHistory = switch (loserMatchIndex) {
        case (?idx) {
          let updatedMatch = {
            loserProfile.matchHistory[idx] with result = #loss
          };
          Array.tabulate(loserProfile.matchHistory.size(), func(i) { if (i == idx) {
            updatedMatch;
          } else {
            loserProfile.matchHistory[i];
          } });
        };
        case (null) {
          loserProfile.matchHistory.concat([{
            matchId = tournamentId;
            mode = #loneWolf;
            result = #loss;
            coinsWagered = 0;
            date = Time.now();
          }]);
        };
      };

      users.add(
        loserLegendId,
        {
          loserProfile with
          walletBalance = loserProfile.walletBalance + loserCoins;
          transactions = loserProfile.transactions.concat([loserTx]);
          matchHistory = loserMatchHistory;
        },
      );
    };
  };

  public shared ({ caller }) func addCoins(adminLegendId : Text, adminPasswordHash : Text, targetLegendId : Text, amount : Nat) : async () {
    assertAdmin(adminLegendId, adminPasswordHash);
    switch (users.get(targetLegendId)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) {
        let newTransaction : Transaction = {
          txType = #deposit; amount; date = Time.now(); description = "Admin Bonus Coins";
        };
        let updatedProfile = {
          profile with walletBalance = profile.walletBalance + amount;
          transactions = profile.transactions.concat([newTransaction]);
        };
        users.add(targetLegendId, updatedProfile);
      };
    };
  };

  func isValidRange(value : Nat, start : Nat, end : Nat) : Bool {
    value >= start and value <= end
  };

  public shared ({ caller }) func buyShopAvatar(legendId : Text, passwordHash : Text, avatarIndex : Nat) : async () {
    if (not isValidRange(avatarIndex, 10, 19)) {
      Runtime.trap("Invalid avatar index");
    };

    let price = switch (avatarIndex) {
      case (10) { 200 };
      case (11) { 350 };
      case (12) { 500 };
      case (13) { 150 };
      case (14) { 275 };
      case (15) { 450 };
      case (16) { 325 };
      case (17) { 600 };
      case (18) { 400 };
      case (19) { 250 };
      case (_) { Runtime.trap("Invalid avatar index") };
    };

    let userProfile = getUserByLegendIdOrTrap(legendId);
    if (not (userProfile.passwordHash == passwordHash)) { Runtime.trap("Incorrect password") };

    if (userProfile.purchasedShopAvatars.any(func(v) { v == avatarIndex })) {
      Runtime.trap("Avatar already purchased");
    };

    if (userProfile.walletBalance < price) {
      Runtime.trap("Insufficient balance");
    };

    let avatarArray = userProfile.purchasedShopAvatars.concat([avatarIndex]);

    let newTransaction : Transaction = {
      txType = #withdraw;
      amount = price;
      date = Time.now();
      description = "Avatar Purchase";
    };

    let updatedProfile : UserProfile = {
      userProfile with
      walletBalance = userProfile.walletBalance - price;
      transactions = userProfile.transactions.concat([newTransaction]);
      purchasedShopAvatars = avatarArray;
      selectedProfilePic = avatarIndex;
    };

    users.add(legendId, updatedProfile);
  };

  public shared ({ caller }) func buyShopFrame(legendId : Text, passwordHash : Text, frameIndex : Nat) : async () {
    if (not isValidRange(frameIndex, 20, 24)) {
      Runtime.trap("Invalid frame index");
    };

    let price = 200;
    let userProfile = getUserByLegendIdOrTrap(legendId);
    if (not (userProfile.passwordHash == passwordHash)) { Runtime.trap("Incorrect password") };

    if (userProfile.purchasedFrames.any(func(v) { v == frameIndex })) {
      Runtime.trap("Frame already purchased");
    };

    if (userProfile.walletBalance < price) {
      Runtime.trap("Insufficient balance");
    };

    let frameArray = userProfile.purchasedFrames.concat([frameIndex]);

    let newTransaction : Transaction = {
      txType = #withdraw;
      amount = price;
      date = Time.now();
      description = "Frame Purchase";
    };

    let updatedProfile = {
      userProfile with
      walletBalance = userProfile.walletBalance - price;
      transactions = userProfile.transactions.concat([newTransaction]);
      purchasedFrames = frameArray;
      selectedFrame = frameIndex;
    };

    users.add(legendId, updatedProfile);
  };

  public shared ({ caller }) func setProfileFrame(legendId : Text, passwordHash : Text, frameIndex : Nat) : async () {
    let userProfile = getUserByLegendIdOrTrap(legendId);
    if (not (userProfile.passwordHash == passwordHash)) { Runtime.trap("Incorrect password") };

    if (frameIndex == 0) {
      let updatedProfile = {
        userProfile with selectedFrame = 0;
      };
      users.add(legendId, updatedProfile);
    } else if (
      userProfile.purchasedFrames.any(func(v) { v == frameIndex })
    ) {
      let updatedProfile = {
        userProfile with selectedFrame = frameIndex;
      };
      users.add(legendId, updatedProfile);
    } else {
      Runtime.trap("Frame not purchased");
    };
  };

  public query ({ caller }) func getAllUsers(adminLegendId : Text) : async [UserProfile] {
    let adminProfile = getUserByLegendIdOrTrap(adminLegendId);
    switch (adminProfile.role) {
      case (#admin) { users.values().toArray() };
      case (#user) { Runtime.trap("Not admin") };
    };
  };

  public shared ({ caller }) func addCustomShopAvatar(
    adminLegendId : Text,
    adminPasswordHash : Text,
    name : Text,
    price : Nat,
    src : Text,
  ) : async Nat {
    assertAdmin(adminLegendId, adminPasswordHash);

    let newAvatar : CustomShopAvatar = {
      index = customAvatarIndexCounter;
      name;
      price;
      src;
    };
    customShopAvatars.add(customAvatarIndexCounter, newAvatar);
    customAvatarIndexCounter += 1;
    newAvatar.index;
  };

  public shared ({ caller }) func deleteCustomShopAvatar(
    adminLegendId : Text,
    adminPasswordHash : Text,
    avatarIndex : Nat,
  ) : async () {
    assertAdmin(adminLegendId, adminPasswordHash);
    if (not isValidRange(avatarIndex, 30, 1000)) {
      Runtime.trap("Invalid custom avatar index");
    };
    switch (customShopAvatars.get(avatarIndex)) {
      case (null) { Runtime.trap("Custom avatar not found") };
      case (?_) {
        customShopAvatars.remove(avatarIndex);

        let newUsers = users.map<Text, UserProfile, UserProfile>(
          func(_id, profile) {
            if (profile.selectedProfilePic == avatarIndex) {
              { profile with selectedProfilePic = 0 };
            } else {
              profile;
            };
          }
        );
        users := newUsers;
      };
    };
  };

  public shared ({ caller }) func resetUsersWithDepositTierAvatar(
    adminLegendId : Text,
    adminPasswordHash : Text,
    tierIndex : Nat,
  ) : async () {
    assertAdmin(adminLegendId, adminPasswordHash);
    if (not isValidRange(tierIndex, 1, 6)) {
      Runtime.trap("Invalid deposit tier avatar index");
    };

    let newUsers = users.map<Text, UserProfile, UserProfile>(
      func(_id, profile) {
        if (profile.selectedProfilePic == tierIndex) {
          { profile with selectedProfilePic = 0 };
        } else {
          profile;
        };
      }
    );
    users := newUsers;
  };

  public query ({ caller }) func getCustomShopAvatars() : async [CustomShopAvatar] {
    customShopAvatars.values().toArray();
  };

  public query ({ caller }) func getUserHasClaimedRoulette(legendId : Text) : async Bool {
    switch (users.get(legendId)) {
      case (null) { false };
      case (?profile) { profile.hasClaimedRouletteReward };
    };
  };

  public shared ({ caller }) func claimRouletteReward(
    legendId : Text,
    passwordHash : Text,
    amount : Nat,
  ) : async () {
    switch (users.get(legendId)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) {
        if (not (profile.passwordHash == passwordHash)) { Runtime.trap("Incorrect password") };
        if (profile.hasClaimedRouletteReward) {
          Runtime.trap("Roulette reward already claimed");
        };

        let updatedProfile = {
          profile with
          walletBalance = profile.walletBalance + amount;
          hasClaimedRouletteReward = true;
          transactions = profile.transactions.concat([{
            txType = #deposit;
            amount;
            date = Time.now();
            description = "Roulette Reward";
          }]);
        };
        users.add(legendId, updatedProfile);
      };
    };
  };
};
