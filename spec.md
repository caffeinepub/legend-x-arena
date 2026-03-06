# Legend X Arena

## Current State
- Full-stack Free Fire tournament platform with ICP/Motoko backend
- 5-tab dashboard: Shop, Ranking, Play (center), Deposit, Profile
- Admin panel with user lookup, match management, deposit/withdraw management
- Shop with 10 avatars + 5 animated frames
- Roulette spin (first login only) -- currently gives 5 coins
- Profile picture system with deposit tiers + shop purchases
- My Matches section in Play tab showing joined tournaments
- Avatar upload in Admin Panel (image URL stored as base64 in backend)
- `setProfilePicture` backend function does not allow re-equipping shop avatars already purchased (bug)
- Roulette still shows values 5/10/15/20 -- needs update to 10/15/20/30 but all pay 10
- Admin panel shop avatar upload exists but has UX issues on mobile

## Requested Changes (Diff)

### Add
1. **Profile section: ID Search / Player Lookup** -- New section in Profile tab (not Admin panel) that lets admin search a Legend ID and see player data inline. Only shown when logged-in user is admin. This avoids issues with Admin panel refreshing when searching.
2. **Admin Panel: Add Avatar Upload via file input** -- Admin panel Store section must have a clearly visible "+ Upload Avatar" button that works on both PC and mobile (file input, no URL required). Mobile must be able to pick from gallery.
3. **Roulette: Change coin values** -- Wheel segments show 10, 15, 20, 30. Odds: ~85% pay 10, ~12% pay 10 still (so effectively everyone gets 10), small chance 15 or 20, very rare 30. All users get exactly 10 most of the time. Update wheel display to show 10/15/20/30.
4. **Roulette: One-time per registration only** -- Roulette should appear ONLY on first registration (not every login, not on app re-open). Controlled by backend flag, not just localStorage.

### Modify
1. **My Matches: Auto-remove after result declared** -- When admin declares a match result (win or loss), that match must disappear from the player's "My Matches" section. Only active/pending joined matches show there.
2. **Roulette: Improve spin animation** -- Glow effect on roulette wheel, prettier spin (neon glow, smoother animation, more visual appeal).
3. **Roulette: Award 10 coins (not 5)** -- All players get 10 coins from roulette on registration. Segments show 10/15/20/30 but actual payout is weighted heavily toward 10.
4. **Backend: `register` gives 10 coins** -- Change starting wallet balance from 5 to 10 (roulette gives 10 as the reward, wallet starts at 0 or keep at some base).
5. **Backend: Add `hasClaimedRouletteReward` field** -- Track per-user whether they claimed the roulette reward so it never reappears.
6. **Backend: `claimRouletteReward` function** -- New function that marks user as claimed and adds coins, can only be called once per account.
7. **Admin Panel store upload** -- Fix mobile gallery pick issue; the file input must accept image/*, trigger native gallery on mobile.

### Remove
- Nothing removed

## Implementation Plan

### Backend
1. Add `hasClaimedRouletteReward: Bool` field to `UserProfile`
2. Add `claimRouletteReward(legendId, passwordHash, amount)` function -- validates not already claimed, adds coins, sets flag
3. Registration: set `walletBalance = 0` and `hasClaimedRouletteReward = false`
4. Add `getUserHasClaimedRoulette(legendId) : async Bool` query for frontend to check

### Frontend
1. **Profile tab -- Admin Lookup section**: When logged-in user is admin, show a search box at top of Profile tab (new collapsible section "Player Lookup"). Enter Legend ID, press search, show player card inline with game name, coins, game UID, JazzCash, deposit total, ban status. No extra refreshes triggered.
2. **My Matches**: Filter out matches where a result has been declared (i.e., match.result is `#win` or `#loss` -- only show matches where result is still `#loss` AND the tournament is still active). After declareMatchResult, the match record is updated to `#win` or `#loss` -- use this to hide from My Matches.
3. **Roulette flow**: Check `hasClaimedRouletteReward` from backend on login. If false AND first-time user (just registered), show roulette. Use `claimRouletteReward` API when collecting. Store nothing in localStorage for this -- rely on backend flag.
4. **Roulette wheel UI**: Update segments to 10/15/20/30. Add neon glow to wheel border, add spinning glow trail animation. Make segments vibrant and premium. 
5. **Admin Panel store upload button**: Change to `<input type="file" accept="image/*" capture="environment">` -- this triggers native gallery/camera on mobile. Must be clearly visible "+ Upload Avatar" button.
6. **Declare result + My Matches auto-remove**: After declareMatchResult succeeds, invalidate the joined matches query so My Matches updates immediately for that user.
