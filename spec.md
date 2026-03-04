# Legend X Arena

## Current State
- 5-tab dashboard: Shop, Ranking, Play, Deposit, Profile
- Shop has 10 purchasable avatar logos
- Profile has avatar gallery (logo selection) accessible via scrolling
- Pencil icon on profile picture scrolls to avatar gallery in Profile tab
- PWA install button in landing page using beforeinstallprompt
- Backend stores selectedProfilePic (bigint index) per user

## Requested Changes (Diff)

### Add
- 15 special profile frames to the Shop (purchasable with Legend Coins)
- Frame data: index 20-34, each with name, price, image, glowColor
- Frames are overlaid on top of profile pictures (ring/border effect)
- Backend: `selectedFrame` field per user, `purchasedFrames` array, `buyShopFrame()`, `setProfileFrame()` functions
- Pencil button popup: modal with 2 tabs — "Logo" (all avatar logos) and "Frames" (all frames owned/available)
- Shop tab: new "Frames" section below Avatars section with all 15 frames
- PWA: proper manifest.json in public folder with correct icons and display mode, service worker for install prompt

### Modify
- Pencil icon on profile: clicking opens a popup modal (not scroll to section)
- Profile avatar display: show selected frame overlaid on profile pic (absolutely positioned ring image over the avatar circle)
- Leaderboard player avatars: also show their selected frame
- Header avatar: show frame overlay

### Remove
- Pencil click behavior that scrolled to avatar-gallery-section (replace with modal)

## Implementation Plan
1. Create `public/manifest.json` with proper PWA config
2. Update `index.html` to link manifest.json
3. Add FRAMES_COLLECTION array to DashboardPage (15 frames with imported images)
4. Add frame overlay rendering helper component `FrameOverlay`
5. All avatar circles across the app: wrap in relative container and overlay frame image
6. Replace pencil button handler with `setShowAvatarModal(true)` state
7. Create `AvatarCollectionModal` component with 2 tabs: Logo + Frames
8. In Logo tab: show FREE joker + AVATAR_TIERS + SHOP_AVATARS (owned ones selectable)
9. In Frames tab: show all 15 FRAMES, owned ones selectable, unowned show price + buy button
10. Shop tab: add Frames Grid section after avatars
11. Wire `buyShopFrame` / `setProfileFrame` calls (backend extended type cast like buyShopAvatar)
