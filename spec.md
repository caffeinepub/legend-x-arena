# Legend X Arena

## Current State
Full Free Fire esports app with:
- 5-tab bottom navigation (Matches, Ranking, Play, Deposit, Profile)
- JazzCash deposit system with admin approve/reject
- User walletBalance tracks total deposited Legend Coins
- Profile tab shows avatar (initials-based), stats, and logout

## Requested Changes (Diff)

### Add
- **Profile Picture Unlock System**: 6 tiered profile pictures that unlock based on total coins ever deposited (cumulative lifetime deposit, not current balance)
- Unlock tiers: 50 LC = Pic 1, 100 LC = Pic 2, 200 LC = Pic 3, 500 LC = Pic 4, 800 LC = Pic 5, 1000 LC = Pic 6
- **Avatar Selector UI**: In Profile tab, show all 6 avatars. Locked ones show lock icon + required deposit. Unlocked ones are selectable.
- **setProfilePicture** backend API: stores which picture the user has selected
- **totalDeposited** field tracked in backend UserProfile (incremented on each approved deposit)
- Selected profile picture shown in profile header and anywhere avatar is displayed

### Modify
- `UserProfile` backend type: add `selectedProfilePic: Nat` (0 = default initials) and `totalDeposited: Nat`
- `approveDepositRequest` to also increment `totalDeposited`
- Profile tab avatar area: replace initials circle with selected profile image (or initials if none selected)

### Remove
- Nothing removed

## Implementation Plan
1. Update `main.mo`: add `selectedProfilePic` and `totalDeposited` to UserProfile, add `setProfilePicture` update function, update `approveDepositRequest` to increment `totalDeposited`
2. Generate 6 gaming-themed Free Fire style avatar images
3. Frontend: Profile tab update -- show avatar grid with lock/unlock states, allow selecting unlocked pics, display selected pic in header
4. Wire `setProfilePicture` call to backend on selection
