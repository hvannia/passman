# Passman

Local, single-device password manager. Electron desktop app with React frontend.

## Getting Started

### Prerequisites

- **Node.js** v20.18+
- **npm**
- A C++ compiler for native modules (`argon2`, `sqlite3`):
  - **macOS:** Xcode Command Line Tools (`xcode-select --install`)
  - **Linux:** `build-essential` (`sudo apt install build-essential`)
  - **Windows:** `windows-build-tools` (`npm install -g windows-build-tools`)

### Setup

```sh
# Clone the repo
git clone <repo-url>
cd passman

# Install root dependencies (Electron, SQLite, Argon2)
npm install

# Install frontend dependencies (React, Vite, Tailwind)
cd passman
npm install
cd ..

# Launch the app
npm start
```

`npm start` builds the React frontend, compiles the Electron backend, and launches the app.

### Other Commands

Run from the `passman/` directory:

| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server with HMR (frontend only) |
| `npm test` | Run all tests |
| `npm run test:watch` | Vitest watch mode |
| `npm run lint` | ESLint |
| `npm run build` | Production build |

## High Level

### Behavior

    •	Local encrypted vault file:Store everything (logins, notes, metadata) in one file on disk, e.g., an encrypted SQLite DB or custom binary file, similar to how KeePass stores data in an encrypted database.The app never writes plaintext secrets to disk, only the encrypted vault.

    •	Master password and key derivation:On first run, user sets a master password; you derive a key from it using a slow KDF (PBKDF2, Argon2, or scrypt) with a random salt stored in the file header. On unlock, user types the master password, you re‑derive the key and decrypt the vault; if decryption fails, the password is wrong.

    •	Encryption choices:Use an authenticated symmetric cipher like AES‑256‑GCM or ChaCha20‑Poly1305 to encrypt the vault so you get confidentiality and integrity.Encrypt the entire vault blob (or all sensitive tables) with a random IV/nonce stored alongside in the file header.

    •	In‑memory handling:After unlocking, keep decrypted data only in RAM, ideally in structures you can zero when locking or exiting.Avoid logging or paging secrets: no debug logs of values, and be careful with crash dumps.

### Data model and storage

    •	Entries table (in the decrypted view):Each record can have: id, title, username, password, URL, notes, created_at, updated_at, last_used_at, tags.You can also support attachments by encrypting file blobs and storing them in the vault.

    •	Vault file layout (on disk):
    		Header: magic bytes, version, KDF parameters (salt, iterations, memory/cpu cost), cipher info, maybe a checksum.
    		Encrypted payload: serialized DB or structured JSON/binary containing all entries.

    •	Locking behavior:App auto‑locks after inactivity or when the window is closed, discarding keys from memory and requiring the master password again.Manual "Lock now" option should also clear sensitive structures.

### Desktop UX features

    •	CRUD for entries:Basic UI to create, edit, delete entries, search by title/URL, group by folder or tag.A simple password generator dialog for creating strong passwords with configurable length and character sets.

    •	Clipboard and reveal:"Copy username/password" buttons that copy to clipboard and optionally clear it after N seconds."Reveal password" toggle for viewing in the UI, with the default view masked.

    •	No networking path:Do not include any automatic sync, telemetry, or update checks in the first iteration so you can reason easily about the threat model: attacker must get the vault file and then brute‑force the master password.

## Electron Architecture

### Main process (Node, trusted):

- Owns SQLite DB and the encryption key.
- Implements Argon2id key derivation + AES-256-GCM encryption via Node.js `crypto` and `argon2`.
- Exposes a small IPC API: `unlockVault`, `lockVault`, `listEntries`, `getEntry`, `createEntry`, `updateEntry`, `deleteEntry`, `generatePassword`, `copyToClipboard`.

### Preload script:

- Uses `contextBridge.exposeInMainWorld` to expose a narrow `window.api` interface with those functions, not raw `ipcRenderer`.

### Renderer (Vite + React + TS):

- Calls `window.api.*` methods only.
- Holds only decrypted entries as JS objects; never sees the key or touches the DB file.
- Treated as untrusted: `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`.

## Static Application Security Testing (SAST)

Checks and findings at [SAST.md](SAST.md) (private)
