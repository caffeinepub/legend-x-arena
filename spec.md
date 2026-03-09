# Legend X Arena

## Current State
- Legend Coin component exists in DashboardPage.tsx with L centered but sometimes not perfectly centered due to fontSize/lineHeight settings
- Admin Panel (AdminPage.tsx) has: User Lookup, Match Management, Store Avatar Upload, Deposit/Withdraw tab toggle
- No L Badge system (like Free Fire V badge) exists
- Admin Player Lookup in DashboardPage has no badge assign feature
- AdminPage has no "Matches Dep/With" bottom button
- Match Management + Deposit/Withdraw requests are directly in AdminPage main body
- Deposit Tier Avatar section has "Reset" button — needs to be replaced with "Exchange" concept
- Collection persistence exists but purchase with discount deducts wrong amount (full price instead of discounted)
- Mobile lag exists on leaderboard and shop tabs due to heavy animations/blur
- "Something went wrong" error occurs when navigating out of admin panel or performing actions

## Requested Changes (Diff)

### Add
- **L Badge component**: SVG badge exactly like Free Fire V badge (hexagon shape, red gradient fill, golden border, laurel wreath, golden glow) but with "L" instead of "V". Same coin-style bold golden "𝐋". Badge must glow/pulse.
- **Auto-assign L Badge** to users 0003, 0004, 0005 (hardcoded in leaderboard + profile display logic using legendId check)
- **Admin Player Lookup** in AdminPage UserCard: add "Assign L Badge" toggle button (only visible when admin legendId === "0001"). This uses a localStorage-based badge list (since backend has no badge field) — store in `lxa_l_badges` key as JSON array of legendIds.
- **"Matches Dep/With" button** at very bottom of AdminPage (below all existing sections). When clicked, opens a full-screen overlay/modal page showing: Match Management + Deposit Requests + Withdraw Requests all in one place.
- **Exchange section** replacing the "Reset" buttons in Deposit Tier Avatar section. Admin (0001) can exchange/swap a user's deposit-tier avatar with another tier avatar. UI: select source tier → select target tier → apply exchange for all users with that tier.
- **Avatar section in admin** with delete/edit tabs similar to frames section (AdminStoreAvatarSection already partially has this, needs edit/discount/expiry support like frames)

### Modify
- **LegendCoin component**: Fix `𝐋` to be perfectly centered. Use `display: flex, alignItems: center, justifyContent: center` on outer span, inner span with `lineHeight: 1, display: block, textAlign: center`. Remove any margin/padding offsets.
- **Discount purchase bug**: In DashboardPage shop buy functions, when calculating price to deduct, use `Math.round(price * (1 - discount/100))` instead of full price. The backend `buyShopFrame` and `buyCustomShopAvatar` functions should already handle this — but frontend must pass correct discounted price check before calling backend. Actually the backend deducts coins server-side, so the fix is to ensure backend `buyShopFrame` and `buyCustomShopAvatar` correctly use discounted price. Frontend side: show correct discounted price in UI and trust backend to deduct correctly. The real fix: frontend confirmation dialog should show discounted price and the backend call should work. If backend always deducts full price, we need to ensure the buy functions in backend use `effectivePrice = price * (100 - discount) / 100`.
- **Mobile performance**: Remove/reduce all `backdropFilter: blur(...)` on leaderboard rows, shop item cards, and frame cards. Replace with solid semi-transparent backgrounds. Disable heavy CSS animations on mobile using `@media (prefers-reduced-motion)` or JS-based mobile detection. Reduce animation complexity on FrameOverlay components when in list/shop view (not active/equipped).
- **Something went wrong error**: This is caused by React Query throwing on navigation. Add `retry: false` and proper error boundaries. Wrap async calls in try/catch with graceful fallbacks. Ensure all queries have `staleTime` and `refetchOnWindowFocus: false` to prevent cascade refetch errors.
- **Collection persistence**: Already implemented but ensure `purchasedShopAvatars` and `purchasedFrames` arrays from backend are always respected — never clear collection on store item deletion.
- **L Badge display**: Show L Badge next to username in leaderboard, profile header, and admin lookup for IDs 0003/0004/0005 and any IDs in localStorage `lxa_l_badges`.

### Remove
- **Match Management** from AdminPage main body (move to "Matches Dep/With" overlay)
- **Deposit/Withdraw tab toggle + sections** from AdminPage main body (move to "Matches Dep/With" overlay)
- **Reset buttons** in Deposit Tier section (replace with Exchange UI)

## Implementation Plan

1. **Fix LegendCoin centering** — update inner span styles for perfect flex centering
2. **Create LBadge SVG component** — hexagon SVG with gradient, golden border, laurel wreath, glowing "𝐋", pulse animation. Export from a shared component file.
3. **Add L Badge display logic** — check `legendId` against hardcoded set {0003,0004,0005} + localStorage `lxa_l_badges` array. Show LBadge in: leaderboard rows, profile page header, admin lookup result card.
4. **Admin UserCard badge assign button** — in AdminPage UserCard Action Tools panel, add "Assign L Badge / Remove L Badge" toggle button (only shown when current admin is 0001). Updates localStorage `lxa_l_badges`.
5. **"Matches Dep/With" button** — add at bottom of AdminPage after all sections. Creates a full-screen modal/overlay with tabs: Matches | Deposits | Withdrawals. Move MatchManagementSection, PendingDepositsSection, PendingWithdrawsSection rendering into this overlay. Remove them from main AdminPage body.
6. **Exchange section** — replace "Deposit Tier Avatar Reset" section with "Deposit Tier Avatar Exchange". Shows 2 dropdowns: "From Tier" and "To Tier". Button: "Exchange". Calls same `resetUsersWithDepositTierAvatar` with target tier logic or just resets and reassigns.
7. **Admin avatar edit support** — add Edit button to custom avatar cards (edit name/price/discount/expiry using `updateCustomShopAvatar`)
8. **Discount purchase fix** — in frontend DashboardPage, wherever `buyShopFrame` or `buyCustomShopAvatar` is called, first verify effective price = `price * (100 - discount) / 100`. The backend should handle deduction — add a frontend check that shows the correct discounted amount.
9. **Mobile lag fix** — in FrameOverlay, shop cards, leaderboard: remove blur effects, reduce animation complexity, use `will-change: transform` only on active/equipped items, lazy-render frame animations.
10. **Something went wrong fix** — add error boundaries in DashboardPage, wrap all useQuery hooks with proper error handling, add `retry: false` and `refetchOnWindowFocus: false` to all queries, ensure navigation doesn't trigger cascading query errors.
