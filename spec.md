# Legend X Arena

## Current State
Full Free Fire esports tournament platform with 5-tab bottom nav (Shop, Ranking, Play, Deposit, Profile). Admin panel has User Lookup with ban/unban, send coins, delete. Ranking has 3 sections: Global (totalProfit), Prime (totalDeposited), Oldest (createdAt). Registration has JazzCash Number field.

## Requested Changes (Diff)

### Add
- Backend: `adjustPlayerRanking` function for admin to manually add/subtract points from any player's totalProfit (Global), totalDeposited (Prime), or a new `rankingPoints` style approach -- simpler: adjust existing fields directly
- Admin Player Lookup: "Ranking Adjustments" panel with 3 sections:
  - Global Ranking: +/- adjust totalProfit
  - Prime Ranking: +/- adjust totalDeposited  
  - Oldest Ranking: show current join date, allow admin to set a custom earlier or later join date (adjusting createdAt offset)

### Modify
- Registration form: JazzCash Number label → "Jazzcash/Easypaisa Number"
- Backend: New `adminAdjustRanking` function accepting (adminId, adminPh, targetId, rankingType, delta) where rankingType is "global" (adjusts totalProfit), "prime" (adjusts totalDeposited), "oldest" (adjusts createdAt timestamp by given nanosecond delta)

### Remove
- Nothing removed

## Implementation Plan
1. Add `adminAdjustRanking` to backend Motoko -- accepts targetLegendId, rankingType ("global"/"prime"/"oldest"), delta (Int for signed add/subtract)
2. Update backend.d.ts to include the new function type
3. In AdminPage.tsx UserCard Action Tools panel, add "Ranking Adjustments" collapsible section with Global/Prime/Oldest tabs and +/- amount inputs
4. In AuthPage.tsx, change the JazzCash Number label text to "Jazzcash/Easypaisa Number"
