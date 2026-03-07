import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";

module {
  type Role = { #admin; #user };
  type GameMode = { #loneWolf; #csMod; #brMod };
  type Result = { #win; #loss; #draw };
  type TransactionType = { #deposit; #withdraw };
  type DepositStatus = { #pending; #approved; #rejected };
  type WithdrawStatus = DepositStatus;

  type ShopFrame = {
    index : Nat;
    name : Text;
    price : Nat;
    discount : Nat;
    expiryDate : Int;
    src : Text;
  };

  type OldCustomShopAvatar = {
    index : Nat;
    name : Text;
    price : Nat;
    src : Text;
  };

  type NewCustomShopAvatar = {
    index : Nat;
    name : Text;
    price : Nat;
    discount : Nat;
    expiryDate : Int;
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

  type WithdrawRequest = {
    id : Text;
    legendId : Text;
    amount : Nat;
    jazzCashNumber : Text;
    jazzCashName : Text;
    status : WithdrawStatus;
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
    users : Map.Map<Text, UserProfile>;
    depositRequests : Map.Map<Text, DepositRequest>;
    tournaments : Map.Map<Text, Tournament>;
    depositIdCounter : Nat;
    tournamentIdCounter : Nat;
    userIdCounter : Nat;
    customShopAvatars : Map.Map<Nat, OldCustomShopAvatar>;
    customAvatarIndexCounter : Nat;
  };

  type NewActor = {
    isFirstAdminSet : Bool;
    users : Map.Map<Text, UserProfile>;
    depositRequests : Map.Map<Text, DepositRequest>;
    tournaments : Map.Map<Text, Tournament>;
    withdrawRequests : Map.Map<Text, WithdrawRequest>;
    depositIdCounter : Nat;
    tournamentIdCounter : Nat;
    userIdCounter : Nat;
    shopFrames : Map.Map<Nat, ShopFrame>;
    shopFrameIndexCounter : Nat;
    customShopAvatars : Map.Map<Nat, NewCustomShopAvatar>;
    customAvatarIndexCounter : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let emptyShopFrames = Map.empty<Nat, ShopFrame>();

    let withdrawRequests = Map.empty<Text, WithdrawRequest>();

    let newCustomShopAvatars = old.customShopAvatars.map<Nat, OldCustomShopAvatar, NewCustomShopAvatar>(
      func(_idx, oldAvatar) {
        {
          oldAvatar with
          discount = 0;
          expiryDate = 0;
        };
      }
    );

    {
      old with
      shopFrames = emptyShopFrames;
      shopFrameIndexCounter = 20;
      withdrawRequests;
      customShopAvatars = newCustomShopAvatars;
    };
  };
};
