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
  preload.ts     # contextBridge API surface
  vault.ts       # Type definitions (VaultEntry, VaultModel, EntryInput, EntrySummary)
passman/
  src/
    App.tsx      # Main React component (scaffold — UI not yet built)
    main.tsx     # React entry point
    types.ts     # window.api type declarations
  package.json   # Frontend deps (React 19, Vite 7, TailwindCSS 4)
  vite.config.ts
specs.md         # Feature specifications
arch_electron.md # Architecture notes
```

## Tech stack

- **Frontend:** React 19, TypeScript 5.9, Vite 7, TailwindCSS 4
- **Backend:** Electron, Node.js, SQLite3 (`sqlite` + `sqlite3` packages)
- **Crypto:** Argon2id (key derivation), AES-256-GCM (vault encryption), Node.js `crypto.randomBytes` (CSPRNG)
- **Linting:** ESLint with TypeScript-ESLint and React hooks plugin

## Commands

Run from `passman/` directory:

```sh
npm run dev       # Vite dev server with HMR
npm run build     # tsc + vite build (outputs to dist/)
npm run lint      # ESLint
npm run preview   # Preview production build
```

Electron loads `dist/index.html` — build the frontend before running Electron.

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

Backend (Electron main process, crypto, DB, IPC) is complete. Frontend React UI is still the default Vite scaffold — needs to be built out with unlock screen, entry list, entry detail/edit views, password generator dialog, etc.
