# Legend X Arena

## Current State
- Full Free Fire esports tournament app with 5-tab navigation (Shop, Ranking, Play, Deposit, Profile)
- User registration with auto-assigned Legend ID (0001, 0002...)
- JazzCash deposit system with admin approve/reject
- Withdraw section in Deposit tab
- Leaderboard with 3 sections: Global Winners (by totalProfit), Prime Legends (by deposit), Oldest Legends (by createdAt)
- Match join system with View Details modal showing Room ID/Password
- First-login roulette (5/10/15/20 RS coins) with biased odds
- Avatar/frame collection system with shop purchase
- Admin panel with match management, deposit approval, user management

## Requested Changes (Diff)

### Add
- **JazzCash uniqueness validation**: Backend must reject registration if `jazzCashNumber` already exists on another account. Similarly, `updatePlayerInfo` must block if new jazzCashNumber is already used by a different user.
- **Duplicate field validation on registration**: `gameName`, `gameUID`, and `jazzCashNumber` must all be globally unique. If any already exists, registration fails with a clear error message indicating which field is duplicate.
- **Withdraw JazzCash uniqueness**: In withdraw form, once a user has saved their JazzCash number (from their profile), it auto-fills and locks. They cannot change it — it's their registered number. First time they set it during registration, it stays.
- **APP OWNER title for Legend ID 0001**: Wherever any user's name is shown (leaderboard, ranking cards, profile header, any player row), if that user's legendId is "0001", show a gold "APP OWNER" badge/title next to their game name.
- **Registration bonus coins**: Change from 100 coins to 5 coins on registration. The roulette spin can give 5 or 10 (luck). Roulette coins already go to wallet — no change needed there except starting balance.
- **Roulette coins excluded from leaderboard**: Roulette coins (spin reward) should NOT count toward totalProfit or appear in any leaderboard. They just go to walletBalance silently. Currently roulette coins may increment totalProfit — fix so they only go to walletBalance.
- **Global Winners leaderboard shows only match-declared wins**: The totalProfit field (incremented via declareMatchResult winner coins) is correctly used. Ensure roulette coins do NOT add to totalProfit.
- **My Matches tab: "View Details" button on each joined match + "Joined" badge**: In the "My Matches" section (the modal/panel that shows joined matches), each match card should show a green "JOINED" badge and a "View Details" button that opens the ViewDetailsModal. No "Loss" label anywhere in My Matches — only show "JOINED" in green.
- **updatePlayerInfo duplicate check**: Backend `updatePlayerInfo` must check that the new gameName/gameUID/jazzCashNumber don't already exist on a DIFFERENT user.

### Modify
- **Backend register**: walletBalance starts at 5 (down from 100). Validate uniqueness of gameName, gameUID, jazzCashNumber across existing users before creating.
- **Backend updatePlayerInfo**: Add duplicate checks for gameName, gameUID, jazzCashNumber — reject if another user already has that value.
- **Withdraw form**: Pre-fill JazzCash number from user's profile `jazzCashNumber` field. Make it read-only (disabled input). User cannot change it — it's locked to their registered number.
- **Global Leaderboard (totalProfit)**: Roulette collectReward must NOT modify `totalProfit` — only `walletBalance`. Winning from admin-declared match result correctly increments `totalProfit`. This is already correctly set in the backend for `declareMatchResult`; no backend change needed unless roulette was adding to totalProfit.
- **My Matches section**: Show "JOINED" green badge on each match card. Remove any "Loss" display. Add "View Details" button that opens the existing ViewDetailsModal. 

### Remove
- **Nothing to remove** — only additions and modifications.

## Implementation Plan
1. Backend (`main.mo`):
   - Change starting `walletBalance` in `register` from 100 to 5
   - Add uniqueness check in `register` for `gameName`, `gameUID`, `jazzCashNumber` — trap with descriptive message if duplicate
   - Add uniqueness check in `updatePlayerInfo` for `gameName`, `gameUID`, `jazzCashNumber` — exclude the current user from check
   - Ensure `declareMatchResult` is the only place that increments `totalProfit` — roulette coin collect only modifies `walletBalance` (frontend-only change)

2. Frontend (`DashboardPage.tsx`):
   - **APP OWNER badge**: Create a helper `isAppOwner(legendId)` that returns true if legendId === "0001". Wrap any game name display in leaderboard / ranking sections with a gold "APP OWNER" badge if true.
   - **Withdraw form**: Pre-fill `withdrawJazzCash` with `profile.jazzCashNumber` and make input `readOnly` + visually disabled.
   - **My Matches**: In the My Matches modal/section, for each joined match, show green "JOINED" badge. Replace any "Loss" text. Add "View Details" button that opens ViewDetailsModal for that tournament.
   - **Roulette**: `collectReward` already only sets `walletBalance` in state — confirm it does NOT call any backend function that touches `totalProfit`. No backend call needed for roulette reward.
   - **Registration error messages**: Show which field is a duplicate when registration fails (backend trap message propagated to toast).
