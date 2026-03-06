# Legend X Arena

## Current State

Full-stack Free Fire esports tournament app with:
- Auto-assigned Legend ID system (0001, 0002...)
- Role-based access: first registered user = admin
- Shop with avatars + 5 animated frames
- Leaderboard (Global/Prime/Oldest)
- Deposit/Withdraw with JazzCash
- Custom admin-uploaded shop avatars stored on backend
- PWA manifest configured

## Requested Changes (Diff)

### Add
- Registration form: live-fetch `getNextLegendId()` every time register tab is shown and just before submit, so the previewed ID is always the latest (not a stale cached one from earlier).
- Backend: `getNextLegendId()` must be called fresh right before register to confirm no race condition; if assigned ID ends up taken, increment and retry.
- Session lock: store current Legend ID in `localStorage` on login/register. If a different user tries to log in on same device/browser, warn them that another account is active. Admin can override by clearing session.
- PWA: add `screenshots` array to manifest and ensure `display_override: ["standalone", "window-controls-overlay"]` so Chrome's "Install App" prompt appears in the address bar AND the 3-dot side menu.

### Modify
- **Admin access leak fix**: `isFirstAdminSet` is already `stable var` — the real bug is frontend `authStore` role check. After login, confirm role from backend profile, never trust localStorage role for admin gating. The `beforeLoad` route guard must re-read from backend, not from potentially-stale localStorage role.
- **Legend ID uniqueness**: Backend `register()` already checks — but frontend must not cache `nextLegendId` stale. On register tab open AND on form submit, always call `getNextLegendId()` fresh. Show loading spinner in the ID preview while fetching.
- **Mobile vs PC leaderboard inconsistency**: `getProfilePicSrc` is called without `customShopAvatars` in most leaderboard rows (lines 4530, 4699, 4867). Fix: pass `customShopAvatars` to every `getProfilePicSrc` call site across the entire DashboardPage.
- **Custom avatars not showing in collections**: In the pencil modal (avatar collection picker), custom shop avatars from backend are not displayed. Fix: include `customShopAvatars` in the "Logo" tab of the pencil collection modal, and in `getProfilePicSrc` calls in the pencil modal and profile header.
- **PWA install from browser side panel**: Update manifest.json to add `display_override`, proper icon sizes (192 and 512 with separate `maskable` and `any` purpose entries), and ensure service worker is registered. In LandingPage, detect `beforeinstallprompt` event and also listen on `appinstalled`. Show a persistent install button that works from any browser menu.

### Remove
- Nothing removed.

## Implementation Plan

1. **Frontend: Registration Legend ID preview** — On register tab open AND right before submit, call `actor.getNextLegendId()` fresh. Add a small loading state. Do not cache the ID for more than a few seconds.

2. **Frontend: Fix all `getProfilePicSrc` calls** — Pass `customShopAvatars` as second argument to every call of `getProfilePicSrc` in DashboardPage (leaderboard rows at ~4530, ~4699, ~4867, profile header at ~2911, ~4110, ~5072, ~6593, pencil modal, shop preview).

3. **Frontend: Custom avatars in pencil collection modal** — In the "Logo" tab of the avatar collection popup (pencil icon), render `customShopAvatars` from backend. Mark as owned if in `purchasedShopAvatars`. If not owned, show "Go to Store".

4. **Frontend: Admin role gating** — On dashboard load, fetch fresh user profile from backend and confirm role is `#admin` before showing admin panel link. Do not rely solely on localStorage role.

5. **Frontend: Session lock (one ID per device)** — On login/register success, store `legendId` in `localStorage["lxa_active_id"]`. On Auth page load, if `lxa_active_id` exists and user tries to register a new account or login with a DIFFERENT id, show a warning modal: "Another account (XXXX) is active on this device. Log out first or continue?" with "Switch Account" (clears storage) and "Cancel" buttons.

6. **Manifest: PWA install improvements** — Add `display_override: ["standalone", "minimal-ui"]`, add both 192x192 (any) and 512x512 (maskable) icon entries, add `screenshots` with at least one entry, and ensure `prefer_related_applications: false`.
