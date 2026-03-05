# Legend X Arena

## Current State
- Full esports tournament app with Shop, Ranking, Play, Deposit, and Profile tabs
- Registration uses `users.add(caller, newUser)` where `caller` is the ICP Principal -- this changes on every new session/reload, causing registration failures and login failures
- Login/register after every app update fails because the new actor has a fresh anonymous Principal
- Play tab welcome banner shows "Welcome, Name" + My Matches button (left-aligned next to name), plus a WalletDisplay below
- No profile avatar/frame shown in the welcome banner
- Registration success only shows a toast with Legend ID
- Data load takes 3-5 minutes because actor is awaited and retried

## Requested Changes (Diff)

### Add
- After successful registration, show the assigned Legend ID prominently on-screen (inside AuthPage) in red color with red glow, before auto-navigating to dashboard
- Player profile avatar + frame display in the Play tab welcome banner, placed below the "Welcome, Name" text (display-only, not clickable for editing -- editing only via Profile tab)

### Modify
- **Critical bug fix**: Backend `register` function currently stores users by `caller` (ICP Principal). Since the anonymous Principal changes per session, this breaks re-login after app updates. Fix: store users by a stable key derived from legendId instead of caller. Use a separate Map keyed by legendId (Text) rather than Principal.
- **Backend**: `getUserByPrincipalOrTrap` used by `submitDepositRequest`, `updatePlayerInfo`, `setProfilePicture`, `buyShopAvatar`, `buyShopFrame`, `setProfileFrame`, `joinTournamentById` -- all use caller Principal. These all need to accept a `legendId` parameter instead, or pass legendId from the frontend session.
- **Backend alternative (simpler)**: Store users in a Map<Text, UserProfile> keyed by legendId (not Principal). Update all functions that currently use `caller` to instead require legendId + password verification, OR pass legendId as explicit param for already-authenticated operations. For admin functions, keep admin check by legendId stored in session.
- **Frontend AuthPage**: After register succeeds, show the assigned Legend ID (e.g. "0001") inside the register form area in a styled red box with glow animation, then navigate to dashboard after 2 seconds or on button press
- **Frontend PlayTab welcome banner**: 
  - Move `My Matches` button to the right side (flex row, space-between)
  - Remove `WalletDisplay` from inside the welcome banner (coins already shown in header top-right)
  - Add profile avatar circle + frame overlay below the "Welcome, Name" heading inside the banner -- display-only, no pen icon, no edit capability here

### Remove
- WalletDisplay component from inside the Play tab welcome banner
- Coins shown below My Matches button inside Play tab (the WalletDisplay)

## Implementation Plan
1. **Backend**: Change `users` Map from `Map<Principal, UserProfile>` to `Map<Text, UserProfile>` keyed by legendId. Update all functions accordingly -- `register` stores by legendId, `getUserByPrincipalOrTrap` becomes `getUserByLegendIdOrTrap(legendId)`, all shared functions that use `caller` now require `legendId: Text` param (passed from authenticated frontend session). Keep admin check via stored role. Remove Principal imports if unused.
2. **Frontend AuthPage**: After `actor.register(...)` returns `assignedLegendId`, display a red-glowing "YOUR LEGEND ID: 0001" box inside the register form. Auto-navigate after 2.5s or on "Enter Arena" button click.
3. **Frontend DashboardPage PlayTab**: 
   - In welcome banner, restructure flex layout: left side has "Commander Online" subtitle + "Welcome, Name" heading; right side has My Matches button (no WalletDisplay)
   - Below the heading row, add a small profile avatar circle (40px) with frame overlay -- same getProfilePicSrc() logic, display only
4. **Frontend AuthStore**: No changes needed -- legendId-based session still works the same.
5. **Frontend backend.d.ts / backend.ts**: Regenerate or manually update function signatures for changed backend methods.
