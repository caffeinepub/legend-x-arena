# Legend X Arena

## Current State
Fresh Caffeine project with default React/Vite frontend, empty Motoko backend, and no application pages or components.

## Requested Changes (Diff)

### Add
- **Landing Page** (`/`): Hero with "LEGEND X ARENA" glowing title, animated fire particles left (red/orange) and right (blue/cyan), "DOMINATE THE ARENA" tagline, pulsing download/play CTA button, game modes feature section.
- **Auth Page** (`/auth`): Sliding Login/Register tabs (Legend ID + Password only, no email). First registered user auto-becomes admin. Fire explosion CSS animation on register submit.
- **Dashboard Page** (`/dashboard`): Protected route. Shows Legend ID, Legend Coins wallet balance, three game mode cards (Lone Wolf 50 coins, CS Mod 100 coins, BR Mod 200 coins). Join button checks balance; insufficient balance shows error toast; sufficient shows success. Coin shower CSS animation when balance updates.
- **Admin Page** (`/admin`): Hidden admin-only route. Search any Legend ID, view full user biodata (ID, balance, match history, transactions, ban status, registration date). Toggle ban status. Stats overview (total users, active tournaments, total coins).
- **Reusable Components**: FireAnimation (edge fire particles), CoinShower (falling coins animation), GameModeCard, WalletDisplay.
- **Auth/Session Service**: Custom auth using ICP backend (no Firebase Auth). SHA-256 hashed passwords, localStorage session (legendId + role). First-user auto-admin logic via backend atomic check.
- **Backend canister**: User management (register, login, getUser, banUser, getStats), persistent storage of users with hashed passwords, wallet balances, match history, transactions, roles, ban flags.
- **Design system**: Deep black backgrounds, red fire left / blue fire right palette, gold coin accent, Orbitron + Mona Sans fonts (from bundled fonts), dark mode only.
- **Animations**: CSS keyframe fire particles (fireRise), coin shower (coinFall), register fire explosion (fireExplosion), sliding auth form (cubic-bezier transition), pulsing glow effects.

### Modify
- `index.css`: Replace default tokens with dark gaming palette (black bg, red/blue/gold accents).
- `tailwind.config.js`: Add fire-red, fire-blue, gold token extensions and Orbitron/Mona Sans font families.
- `App.tsx`: Set up TanStack Router with routes: `/`, `/auth`, `/dashboard`, `/admin`.

### Remove
- Default placeholder content/pages.

## Implementation Plan
1. Update `index.css` design tokens and global animation keyframes.
2. Update `tailwind.config.js` with custom colors and fonts.
3. Generate Motoko backend (user CRUD, auth, wallet, admin ops).
4. Implement frontend: App.tsx router, auth service/store (Zustand), all pages and components.
5. Wire backend calls via `useActor` hook for register, login, getUser, banUser, getStats.
6. Validate and build.
