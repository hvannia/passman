# High-level Electron architecture

### Main process (Node, trusted):

- Owns SQLite (or SQLCipher) DB and the encryption key.
- Implements Argon2id + AES‑GCM (or uses SQLCipher for transparent AES).
- Exposes a small IPC API:  unlockVault ,  lockVault ,  listEntries ,  getEntry ,  createEntry ,  updateEntry ,  deleteEntry ,  generatePassword ,  copyToClipboard .

### Preload script:

- Uses  contextBridge.exposeInMainWorld  to expose a narrow  window.api  interface with those functions, not raw  ipcRenderer .
- Renderer (Vite + React + TS):
- Calls  window.api.

### Renderer (Vite + React + TS):

- Holds only decrypted entries as JS objects; never sees the key or touches the DB file.
  Security‑wise, treat the renderer as untrusted and keep Node/electron APIs out of it (contextIsolation on, nodeIntegration off).
