# Legend X Arena

## Current State
Full-stack Free Fire esports tournament app with:
- ICP Motoko backend with user profiles, tournaments, leaderboard, deposit management
- UserProfile has: legendId, passwordHash, role, walletBalance, isBanned, createdAt, matchHistory, transactions, totalDeposited, selectedProfilePic, jazzCashNumber, gameName, gameUID, totalProfit
- Shop avatars (indices 10-19) and shop frames (indices 20-34) exist in frontend but NO backend purchase logic
- setProfilePicture exists (deposit-gated only, indices 0-6)
- No buyShopAvatar, buyShopFrame, setProfileFrame backend functions
- No purchasedShopAvatars, purchasedFrames, selectedFrame fields in UserProfile
- Data loading issue: app data sometimes stale on first open, requires 5-8 refreshes

## Requested Changes (Diff)

### Add
- UserProfile fields: `purchasedShopAvatars: [Nat]`, `purchasedFrames: [Nat]`, `selectedFrame: Nat`
- `buyShopAvatar(index: Nat)` -- deducts coins (price defined per index), adds to purchasedShopAvatars, sets as active selectedProfilePic
- `buyShopFrame(index: Nat)` -- deducts coins (price defined per index), adds to purchasedFrames, sets as active selectedFrame
- `setProfileFrame(frameIndex: Nat)` -- sets selectedFrame, must own the frame (index 0 = remove frame)
- Avatar shop prices: 10=200, 11=350, 12=500, 13=150, 14=275, 15=450, 16=325, 17=600, 18=400, 19=250
- Frame shop prices: 20=100, 21=150, 22=200, 23=200, 24=250, 25=300, 26=300, 27=350, 28=400, 29=450, 30=500, 31=600, 32=700, 33=800, 34=1000
- setProfilePicture must also allow shop avatar indices (10-19) if owned

### Modify
- setProfilePicture: allow indices 0-19 (not just 0-6); for indices 10-19 check purchasedShopAvatars instead of totalDeposited
- register: initialize purchasedShopAvatars=[], purchasedFrames=[], selectedFrame=0
- getUserByLegendId: include new fields in returned profile

### Remove
- Nothing removed

## Implementation Plan
1. Add purchasedShopAvatars, purchasedFrames, selectedFrame to UserProfile type
2. Update register to initialize new fields
3. Add shopAvatarPrice and shopFramePrice helper functions
4. Implement buyShopAvatar: check balance >= price, deduct coins, add to purchasedShopAvatars, set selectedProfilePic
5. Implement buyShopFrame: check balance >= price, deduct coins, add to purchasedFrames, set selectedFrame
6. Implement setProfileFrame: check ownership (or 0 to remove), set selectedFrame
7. Update setProfilePicture to allow indices 0-19, use correct ownership check
8. All existing functions preserved as-is
