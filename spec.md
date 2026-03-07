# Legend X Arena

## Current State
Full-stack Free Fire esports app with:
- ICP Motoko backend with stable storage (users, tournaments, depositRequests, customShopAvatars)
- 5-tab bottom nav: Shop, Ranking, Play (center), Deposit, Profile
- Shop: 10 static avatars + 5 animated frames (all hardcoded)
- Admin panel: match management, deposit/withdraw tabs, user lookup, custom avatar upload
- Profile: pencil popup with Logo/Frames tabs, avatar collection, deposit tier avatars
- Custom shop avatars stored in stable backend map
- Frames: 5 animated SVG frames, price 200 each, no admin management

## Requested Changes (Diff)

### Add
1. **"L" coin logo on all coin displays** -- Replace any plain text "L" prefix with the actual animated LegendCoin component everywhere (coin amounts throughout app)
2. **15 new unique frames in Shop** -- All price 150, admin can edit price/name/discount/expiry date per frame
3. **Frame management for admin** -- Edit name, price, discount %, expiry date per frame; expired frames auto-removed from store but NOT from users' collections
4. **Avatar management for admin** -- Edit name, price, discount %, expiry date per avatar in store; same expiry rules
5. **"Only For Admins" section** -- In both Avatars and Frames sections of Shop, add a special "Only For Admins" subsection visible only to users with IDs 0001–0005; owner (0001) can upload content there; others in that group can only view/purchase
6. **Admin text/name editor** -- Admin can change any item's name/text in store directly
7. **Store avatar purchase bug fix** -- Fix "Purchase failed" error when equipping previously-purchased custom avatars
8. **Expiry live timer on store items** -- Show live countdown on items that have expiry set
9. **Admin discount display** -- Show discount badge on store items when discount is set
10. **Performance/lag fix** -- Reduce re-renders, optimize mobile performance

### Modify
1. **Frames: update to 15 unique animated frames** -- Remove existing 5 frames (indices 20-24), add 15 new frames (indices 20-34) each with distinct premium animations; all price 150
2. **Backend: ShopFrame type** -- Add `name`, `price`, `discount`, `expiryDate` fields to frames stored in backend
3. **Backend: CustomShopAvatar** -- Add `discount` and `expiryDate` fields
4. **setProfilePicture** -- Fix to allow equipping any purchased custom avatar without re-checking deposit (was causing "purchase failed" for previously-bought items)
5. **buyShopFrame** -- Use dynamic price from backend frame record instead of hardcoded 200
6. **Player Lookup in Profile tab** -- Already exists; ensure ban/unban/delete/coins edit tools are visible there (currently they exist in admin panel only -- profile lookup is view-only)

### Remove
1. **Old 5 animated frames (20-24)** -- Replaced by 15 new frames
2. **Hardcoded frame prices** -- Now driven by backend

## Implementation Plan

### Backend (Motoko)
- Add `ShopFrame` type: `{ index: Nat; name: Text; price: Nat; discount: Nat; expiryDate: Int; src: Text }`
- Add stable `shopFrames` map and `shopFrameIndexCounter`
- Add `CustomShopAvatar` fields: `discount: Nat; expiryDate: Int`
- Add functions: `addShopFrame`, `deleteShopFrame`, `updateShopFrame`, `getShopFrames`
- Add function: `updateCustomShopAvatar` (edit name/price/discount/expiry)
- Fix `setProfilePicture` -- allow any index in purchasedShopAvatars without deposit check
- Fix `buyShopFrame` -- use frame price from `shopFrames` map
- Add `buyCustomShopAvatar` -- purchase by dynamic index from customShopAvatars map
- Update `LeaderboardEntry` to include `purchasedShopAvatars` so frame/avatar info accessible

### Frontend
- Replace all "L{amount}" text with `<LegendCoin/>` component inline
- Add 15 new CSS/SVG animated frame components (unique themes: lightning, galaxy, blood, neon, ice shatter, lava, sakura, shadow, gold crown, cyber, void, dragon, storm, crystal, matrix)
- Frame price 150, all editable from admin
- Shop sections: "Only For Admins" subsection in both Avatars and Frames (visible to IDs 0001-0005 only, upload restricted to 0001)
- Admin store management: edit button on each avatar/frame item (name, price, discount %, expiry date)
- Show discount badge + live expiry countdown on store items
- Fix purchase/equip flow: after buying, equip by updating local state immediately
- Performance: memoize components, reduce unnecessary queries, use `will-change: transform` on animated frames
