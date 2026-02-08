# Passman

Local, single-device password manager. Electron desktop app with React frontend.

## Architecture

Three-layer Electron security model:

- **Main process** (`electron/`) — Node.js, trusted. Owns SQLite DB, encryption keys, all vault operations. Exposes IPC API.
- **Preload** (`electron/preload.ts`) — Bridge layer. Exposes narrow `window.api` via `contextBridge`. Never exposes raw `ipcRenderer`.
- **Renderer** (`passman/src/`) — React + Vite, untrusted. Calls `window.api.*` methods only. `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`.

## Project structure

```
electron/
  main.ts        # Electron main process, IPC handlers, in-memory vault state
  crypto.ts      # Argon2id key derivation, AES-256-GCM encrypt/decrypt
  db.ts          # SQLite init, KDF param storage, encrypted vault I/O
  helpers.ts     # Vault init check, KDF param I/O, encrypted vault save/load
  preload.ts     # contextBridge API surface
  vault.ts       # Type definitions (VaultEntry, VaultModel, EntryInput, EntrySummary, KdfParams)
  __tests__/     # Backend unit tests (crypto, helpers)
passman/
  src/
    App.tsx      # Root component — unlock screen vs vault view switching
    main.tsx     # React entry point
    types.ts     # window.api type declarations + shared interfaces
    components/
      UnlockScreen.tsx    # Master password form
      VaultView.tsx       # Main layout — sidebar (EntryList) + detail pane
      EntryList.tsx       # Searchable/filterable entry list with selection
      EntryDetail.tsx     # Read-only entry view with copy/reveal actions
      EntryForm.tsx       # Create/edit entry form with password generator toggle
      PasswordGenerator.tsx # CSPRNG password generator with length slider
  test/
    setup-backend.ts    # Backend test mocks (argon2, sqlite, electron)
    setup-frontend.ts   # Frontend test mocks (window.api, jest-dom matchers)
    fixtures.ts         # Test data factories (makeEntry, makeSummary, makeInput)
  vite.config.ts  # Vite + Vitest config (backend/frontend test projects)
  package.json    # Frontend deps (React 19, Vite 7, TailwindCSS 4, Vitest 4)
specs.md          # Feature specifications
```

## Tech stack

- **Frontend:** React 19, TypeScript 5.9, Vite 7, TailwindCSS 4
- **Backend:** Electron, Node.js, SQLite3 (`sqlite` + `sqlite3` packages)
- **Crypto:** Argon2id (key derivation), AES-256-GCM (vault encryption), Node.js `crypto.randomBytes` (CSPRNG)
- **Testing:** Vitest 4, jsdom 25, Testing Library (React + user-event + jest-dom)
- **Linting:** ESLint with TypeScript-ESLint and React hooks plugin

## Commands

Run from project root:

```sh
npm start          # Build frontend + electron backend, launch app
```

Run from `passman/` directory:

```sh
npm run dev        # Vite dev server with HMR
npm run build      # tsc + vite build (outputs to dist/)
npm run lint       # ESLint
npm run preview    # Preview production build
npm test           # Vitest run (all tests)
npm run test:watch # Vitest watch mode
```

Electron loads `passman/dist/index.html` — the start script builds everything automatically.

## IPC API

All vault operations go through IPC channels handled in `electron/main.ts`:

- `vault:unlock` — derive key from master password, decrypt vault into memory
- `vault:lock` — clear key and decrypted vault from memory
- `vault:listEntries` — return entry summaries (no passwords)
- `vault:getEntry` — return full entry including password
- `vault:createEntry` / `vault:updateEntry` / `vault:deleteEntry` — CRUD, re-encrypts and persists after each mutation
- `vault:generatePassword` — CSPRNG-based password generation
- `vault:copyToClipboard` — write to system clipboard

## Data model

- `VaultEntry`: id, title, username, password, url?, notes?, tags[], createdAt, updatedAt, lastUsedAt?
- `EntryInput`: title, username, password, url?, notes?, tags[] (for create/update)
- `EntrySummary`: id, title, username, url?, tags[], updatedAt (no password)
- `VaultModel`: { entries: VaultEntry[] }

## Security constraints

- Renderer is untrusted — never give it access to Node APIs, DB, or encryption keys
- Decrypted vault and key exist only in main process memory (`currentKey`, `currentVault`)
- Vault is re-encrypted and persisted to SQLite after every mutation
- No networking, sync, telemetry, or auto-updates
- Never write plaintext secrets to disk or logs

## Current status

Backend and frontend are complete. The app has a working unlock screen, entry list with search/filter, entry detail view with copy/reveal, create/edit form with password generator, and lock functionality. Unit tests cover both layers (54 tests: 16 backend, 38 frontend).
