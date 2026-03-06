# Legend X Arena

## Current State
Full-stack ICP esports tournament app with authentication, shop, leaderboard, admin panel, deposit/withdraw system, and animated frames/avatars. Backend uses stable var storage. Frontend has React + Tailwind.

## Requested Changes (Diff)

### Add
- Refresh button in dashboard header between LXA logo (left) and coins display (right) -- clicking it refetches all user data (profile, balance, leaderboard, etc.)
- Upload Avatar button visible in Shop page (Avatars tab) for admin users -- "+" button in top-right of Avatars tab header to open upload modal (same as AdminStoreAvatarSection upload form)

### Modify
1. **Login bug fix**: In `AuthPage.tsx` `handleLogin`, add better error handling -- catch specific errors from `getUserByLegendId` separately so network/backend startup errors show "Backend not ready, please wait and retry" instead of the generic "Login failed". Also ensure the generic catch does NOT override the "Invalid Legend ID or password" toast -- currently if `getUserByLegendId` throws (e.g. actor loading), it swallows the real error. Fix: only set isSubmitting=false in finally, and use separate try/catch for the profile fetch step.

2. **Admin User Lookup search isolation**: In `AdminPage.tsx`, the search input `onChange` handler calls `e.stopPropagation()` but that's not enough -- the issue is that other `useQuery` hooks in the same component (PendingDepositsSection, MatchManagementSection) automatically refetch when the component re-renders due to typing in the search box. Fix: add `refetchOnWindowFocus: false` and `refetchInterval: false` to all auto-fetching queries in AdminPage so they only refetch when explicitly triggered, not on every render/focus. Also ensure `handleSearch` only sets `searchTerm` -- it should NOT trigger any other query invalidation.

3. **Header always on top**: In `DashboardPage.tsx`, the header `<header>` already has `sticky top-0 z-100` but the background may not fully cover underlying content. Change header `position` to `sticky`, ensure `zIndex: 110` (higher than modals at z-50), and add `background: "rgba(8, 8, 14, 0.98)"` (slightly more opaque). This ensures LXA and coins never appear behind scrolled content.

4. **Header black background popup**: The header area (from top of screen to bottom of header bar) should have a solid dark background so no text from the main content scrolls visually behind/through it. Ensure the header div has `background: "rgba(8,8,14,0.98)"` with `backdropFilter: "blur(20px)"` and `zIndex: 110`.

### Remove
- Nothing removed

## Implementation Plan
1. Fix `AuthPage.tsx` login error handling: split `getUserByLegendId` into its own try/catch so backend errors don't show "Login failed" -- only show "Invalid Legend ID or password" when `authenticate()` returns false, and show "Backend error, please retry" on thrown exceptions.
2. Fix `AdminPage.tsx` search isolation: add `refetchOnWindowFocus: false` to `PendingDepositsSection` and `MatchManagementSection` queries; ensure `handleSearch` only updates `searchTerm` state without side effects on other queries.
3. Add refresh button to dashboard header: between LXA `<a>` link and `<WalletDisplay>`, add a circular refresh `<button>` that calls `queryClient.invalidateQueries()` on all profile/leaderboard/tournament query keys and shows a brief spin animation.
4. Harden header z-index and background opacity in `DashboardPage.tsx` header.
5. Add admin upload avatar shortcut to Shop tab: when `role === "admin"` and `activeTab === "shop"`, show a "+" upload button in the Avatars tab header that opens an inline upload modal (reuse the same upload logic from `AdminStoreAvatarSection`).
