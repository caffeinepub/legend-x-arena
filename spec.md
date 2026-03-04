# Legend X Arena

## Current State
- Full Free Fire esports tournament app with 5-tab navigation (Matches, Ranking, Play, Deposit, Profile)
- Ranking tab: 3 sections -- Global Winners (by wins), Prime Legends (by total deposit), Oldest Legends (by join date)
- Global Winners shows: wins count on right, total matches below
- Admin panel: Match Management with room ID/password setter
- Match cards show Entry fee and Prize Pool only
- No admin ability to declare post-match results or assign coins to players
- LeaderboardEntry has: legendId, wins, totalDeposited, createdAt, totalMatches
- UserProfile has: walletBalance, totalDeposited, matchHistory (result = #win/#loss/#draw)

## Requested Changes (Diff)

### Add
- Backend: `totalProfit` field on UserProfile (tracks net coins won from matches, i.e. prize received minus entry paid)
- Backend: `declareMatchResult(tournamentId, winnerId, loserId, winnerPoints, loserPoints)` -- admin-only function that sets match result for winner/loser and credits/debits coins, records profit
- Backend: LeaderboardEntry gets `totalProfit` field
- Frontend Ranking: Global Winners tab now sorts by `totalProfit` (Top Profit) instead of wins. Right side shows profit amount (e.g. ₡1200 Profit)
- Frontend Admin: Each match row gets a "Trophy" declare-result button. Opens an inline panel with: winner Legend ID input, loser Legend ID input, winner coins to give, loser coins to give (can be 0 or return amount), and a Declare button
- Frontend Match cards: Bottom section shows 3 pills instead of 2 -- "Entry", "Profit" (prize pool), "Returning" (coins returned to losers if any)

### Modify
- Global Winners leaderboard section: description changes to "Ranked by total profit earned", right-side value shows profit not raw wins
- LeaderboardEntry type in backend.d.ts: add totalProfit field
- UserProfile in backend: add totalProfit field

### Remove
- Nothing removed

## Implementation Plan
1. Add `totalProfit: Nat` to UserProfile in Motoko, default 0
2. Add `totalProfit` to LeaderboardEntry type
3. Add `declareMatchResult(tournamentId, winnerLegendId, loserLegendId, winnerCoins, loserCoins)` admin func:
   - Finds winner and loser by legendId
   - Credits winnerCoins to winner wallet, adds to totalProfit
   - Credits loserCoins to loser wallet (returning coins), records as return
   - Records transactions for both
   - Updates match result in matchHistory for both players (win/loss)
4. Update `getLeaderboard` to return totalProfit
5. Update backend.d.ts accordingly
6. Frontend: Global Winners -- sort by totalProfit, show ₡profit on right
7. Frontend: Admin match rows -- add declare result inline panel with winner/loser ID + coins fields
8. Frontend: Tournament/match cards -- add 3rd "Returning" pill showing returning coins (stored in prizePool or a new returningCoins field parsed from prizePool)
   - Since adding a new field requires backend change, store returning coins as part of the match card UI: admin sets it when declaring result; for display use a separate `returningCoins` field on Tournament
