# Legend X Arena

## Current State

- DashboardPage.tsx has 5 bottom nav tabs: Matches, Ranking, Play (center), Deposit, Profile
- "Matches" tab (far left) shows joined match history (all matches user has entered)
- Play tab has a welcome banner that shows "Welcome, {gameName}" with WalletDisplay
- Throughout the app, coin amounts are shown as "L{number}" (e.g. L50, L100)
- DepositTab shows a section titled "Deposit via JazzCash" with the jazzcash number
- No "Shop" tab or avatar shop exists in the nav
- No "My Matches" button inside the Play tab
- No "Withdraw" button near the Deposit section header
- TabId type currently has: "matches" | "ranking" | "play" | "deposit" | "profile"

## Requested Changes (Diff)

### Add

1. **SHOP tab** replacing "Matches" in the bottom nav bar:
   - Nav label: "SHOP", with a shopping bag / store icon
   - Tab ID: "shop" (replace "matches" in TabId)
   - Shop content: avatar cards for sale, each with a price and a buy button
   - 10 avatars in the shop, each with a unique gaming character name and sale price:
     - "Shadow Reaper" - 200 Legend Coins
     - "Inferno King" - 350 Legend Coins
     - "Cyber Ghost" - 500 Legend Coins
     - "Frost Viper" - 150 Legend Coins
     - "Blaze Hunter" - 275 Legend Coins
     - "Dark Phantom" - 450 Legend Coins
     - "Storm Ninja" - 325 Legend Coins
     - "Blood Wolf" - 600 Legend Coins
     - "Void Striker" - 400 Legend Coins
     - "Thunder Ace" - 250 Legend Coins
   - Each avatar card shows: avatar image (use generated images), name, price in Legend Coins (shown as coin icon + number, NOT "L{number}")
   - Shop avatar purchase deducts from wallet balance (call actor.spendCoins or similar if available; otherwise show a "Buy" button with a toast for now)
   - Purchased avatars become selectable in profile avatar gallery

2. **"My Matches" button** in Play tab:
   - In the welcome banner row, to the RIGHT of "Welcome, {name}", add a small "My Matches" button
   - Clicking it navigates/switches to the "shop" tab is WRONG -- it should switch to a new "mymatches" section OR show a dropdown/modal of the user's joined matches
   - Actually per request: place "My Matches" as a button in the play tab header area (right of "Welcome 0001") that when clicked switches activeTab to "matches" -- but since "matches" is being renamed to "shop"... 
   - Clarification: "Matches" tab is being renamed to "SHOP". The user wants "My Matches" as a button in the PLAY tab welcome area (right side) so users can see which tournaments they joined. Clicking it should show a modal/drawer or switch to a dedicated my-matches view.
   - Implement as: add a "My Matches" button in the Play tab welcome banner (right side). It opens a modal listing the user's joined active tournaments (from joinedMatchIds + activeTournaments data).

3. **Legend Coin icon** replacing "L" prefix everywhere:
   - Wherever "L{number}" is shown as a coin amount (prize, entry fee, wallet balance, leaderboard values, deposit requests, transaction history, match cards, ViewDetailsModal, etc.), replace "L" with the animated coin SVG component (the existing L-coin design from DepositTab balance display)
   - Create a reusable `<LegendCoin size={number} />` inline component that renders the gold coin with "L" inside
   - Show it inline before the number: `<LegendCoin size={16} /> {amount}`
   - This affects: TournamentCard (Entry/Profit/Returning pills -- note Profit shows prizePool string so keep as-is), MatchHistoryRow coins wagered, TransactionRow amounts, Deposit request list amounts, Leaderboard values (Global profit, Prime deposited), Ranking section description texts, profile stats "Legend Coins" value

4. **Deposit tab header**: 
   - Add "DEPOSIT" as a heading above the "Deposit via JazzCash" section
   - Add a "WITHDRAW" button to the right of the DEPOSIT heading (same row)
   - The WITHDRAW button opens a modal where user enters amount + JazzCash number + submits a withdraw request
   - Withdraw requests go to admin the same way deposit requests do (use actor.submitWithdrawRequest if available, otherwise toast "Request submitted")

### Modify

- **TabId** type: rename "matches" to "shop", add "matches" as a separate concept accessible via My Matches modal in Play tab. Actually: TabId = "shop" | "ranking" | "play" | "deposit" | "profile". The old "matches" tab content becomes the SHOP tab content is WRONG -- the old "Matches" tab shows joined match history, but now the FAR LEFT tab should be "SHOP" with avatar shop content. The joined match history is accessible via "My Matches" button inside Play tab.
- **Nav bar**: Far-left button changes from Matches (Trophy icon) to Shop (ShoppingBag or Store icon), label "SHOP"
- **Default activeTab**: was "play", keep as "play"
- **All "L{number}" coin displays**: replace "L" prefix with inline LegendCoin icon component

### Remove

- The "Matches" tab from the bottom nav bar (replaced by "Shop")
- "L" text prefix before coin amounts throughout (replaced by LegendCoin icon)

## Implementation Plan

1. Generate 10 shop avatar images (one per avatar name above) using generate_image tool
2. Create inline `LegendCoin` component (small gold coin with "L" inside, glow animation)
3. Rename TabId "matches" to "shop"; update nav bar far-left item to ShoppingBag icon + "SHOP" label
4. Build ShopTab component with 10 avatar cards (image, name, price with LegendCoin icon, Buy button)
5. Add "My Matches" button to PlayTab welcome banner (right side); clicking opens a modal listing joined tournaments
6. Replace all "L{number}" patterns with `<LegendCoin /> {number}` throughout DashboardPage
7. Add DEPOSIT heading + WITHDRAW button row at the top of DepositTab content; wire WITHDRAW modal
8. Fix deposit request amount display to use LegendCoin icon (remove "L" + "LC" suffix)
