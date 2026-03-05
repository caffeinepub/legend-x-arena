# Legend X Arena

## Current State
- DashboardPage.tsx has a DepositTab with a vertical layout: balance, JazzCash number, form, and separate withdraw modal triggered by a button at the top-right.
- CoinShower animation exists and fires when a user joins a tournament.
- Leaderboard Global section shows "N wins" in the subtitle and "Profit" as the right-side metric.
- Oldest Legends section shows account age (days) on the right.
- FirstLoginModal has a roulette + congratulations flow that can award coins.
- Admin approving a deposit triggers coins addition but no animation is queued for the recipient.

## Requested Changes (Diff)

### Add
1. **Pending coin shower queue** – When admin approves a deposit, store a flag in localStorage: `lxa_pending_coinshower_${legendId}`. On every app load/focus, if that flag exists, fire the CoinShower animation and clear the flag. This covers: user was offline when approved → sees animation on next login/app open.
2. **Win coin shower** – After `declareMatchResult` is successfully called by admin and coins are awarded, the winning player's pending flag should be set so they see the animation on next app open. Since admin calls it, we store the flag client-side only on the admin flow side, and the winner (logged in or next login) checks on mount.
3. **Deposit/Withdraw split layout** – Replace the current top "DEPOSIT" heading + right-side "Withdraw" button with two equal half-width buttons side-by-side at the top of the tab:
   - Left: **DEPOSIT** button (yellow, `rgba(255,215,0,…)` theme)
   - Right: **WITHDRAW** button (green, `rgba(34,204,102,…)` theme)
   - Clicking DEPOSIT shows the existing deposit form section below.
   - Clicking WITHDRAW shows the existing withdraw form section below.
   - Default selected = DEPOSIT.
   - Each section fills the remaining space below the toggle.
   - Deposit section background/accent: yellow (`#ffd700`).
   - Withdraw section background/accent: green (`#22cc66`).
4. **Global Winners – no win count, only profit** – Remove "N wins ·" from the subtitle in the global leaderboard row. Only show total profit. Right-side metric stays as `+ LegendCoin totalProfit` in green. No loss data anywhere in rankings.
5. **Oldest Legends – live time counter** – Replace the static "Old Member" label with a live updating ticker that shows days AND hours (e.g. "42d 6h") and updates every minute/second. Show exact join date below.

### Modify
- `DepositTab` component: replace top header row with two toggle buttons (Deposit left / Withdraw right), conditionally render the deposit form or withdraw section below.
- `CoinShower`: keep as-is but ensure it is triggered in three scenarios: tournament join (existing), deposit approved (new – via localStorage flag), and roulette collect (check existing logic).
- Oldest Legends row: replace the static "Old Member" subtitle with a live `useEffect`-based counter showing `Xd Yh` format, updated every 60 seconds.
- Global Winners row: remove "N wins ·" from the description text.

### Remove
- The old separate "DEPOSIT" heading + right-side "Withdraw" button from the top of DepositTab.
- No loss data in any ranking section (already not shown, confirm none added).

## Implementation Plan
1. Add a `usePendingCoinShower` hook or inline logic in `DashboardPage` that: on mount + on window focus, checks localStorage for `lxa_pending_coinshower_${legendId}`, fires `setShowCoinShower(true)` and removes the key.
2. In Admin panel's approve deposit handler (AdminPage.tsx), after `approveDepositRequest`, set `localStorage.setItem(`lxa_pending_coinshower_${req.legendId}`, '1')`.
3. In Admin panel's `declareMatchResult` handler, after success, set the same flag for the winner's legendId.
4. Refactor `DepositTab`: add `activeSection: 'deposit' | 'withdraw'` state; render two side-by-side styled buttons at top; show deposit form or withdraw form based on state.
5. Update Global Winners leaderboard row: remove "N wins ·" from the subtitle text under the player name.
6. Update Oldest Legends row: add `useState` for current time + `useEffect` interval every 60s to re-render; compute `Xd Yh` from `Date.now() - createdAt_ms`; replace "Old Member" static label.
