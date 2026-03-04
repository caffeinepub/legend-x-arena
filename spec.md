# Legend X Arena

## Current State
Full Free Fire esports tournament platform with:
- Manual Legend ID selection during registration (user types their own ID)
- Leaderboard with 3 sections (Global Winners, Prime Legends, Oldest Legends) but NO profile picture shown per player row
- Top 3 rank medals shown only as small medal icons inside rank badge circles
- Backend has `register(legendId, passwordHash, jazzCash, uid, ignName)` - legendId is user-provided

## Requested Changes (Diff)

### Add
- `userIdCounter` variable in backend (starts at 1) to auto-increment unique Legend IDs
- Auto-generated Legend ID format: 4-digit zero-padded number (0001, 0002, 0003, etc.)
- Leaderboard rows: show player's profile avatar (small circle, 40x40) beside their name
- Leaderboard top 3 rank badges: prominent gold/silver/bronze badge overlaid (like a profile pencil icon style -- visible badge positioned on the avatar)

### Modify
- Backend `register` function: remove `legendId` parameter, auto-generate it as `userIdCounter.toText()` zero-padded to 4 digits, then increment counter
- Frontend AuthPage register form: remove "Choose Legend ID" text input field entirely; after successful registration show user their auto-assigned Legend ID (e.g. "Your Legend ID is 0042")
- Frontend login form: Legend ID field stays (user types it to login)
- Leaderboard entries: add profile pic (small avatar circle) to each row in all 3 leaderboard sections; show rank number/medal badge overlaid on the avatar for top 3

### Remove
- Manual Legend ID input from the registration form only (login still uses it)

## Implementation Plan
1. Regenerate backend with auto-increment userIdCounter, register removes legendId param, pads to 4 digits
2. Update backend.d.ts register signature accordingly
3. Update AuthPage.tsx: remove legendId register field, show assigned ID in success toast/modal
4. Update DashboardPage.tsx leaderboard sections: add avatar circle to each row, make top 3 badge overlay on avatar prominent
