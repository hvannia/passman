# ADR 004: Storage and Security – SQLite + Argon2id + AES‑GCM vs Alternatives

**Status:** Accepted  
**Date:** 2026‑02‑28

## Context

We need to store secrets securely on disk with:

- Strong protection against offline attacks.
- A simple and auditable design.
- Good library support in a Node/Electron environment.

We considered several combinations of storage and crypto.

## Considered Options

1. **SQLite + encrypted JSON blob + Argon2id + AES‑256‑GCM (chosen)**
2. SQLite with per‑field encryption (some columns encrypted, others clear)
3. SQLCipher (encrypted SQLite engine)
4. File‑based vault (no DB, just a custom encrypted file)
5. Using OS credential stores (e.g., keychain, Windows Credential Manager) via libraries like keytar

## Decision

We choose:

- **SQLite** as the storage engine.
- A **single AES‑256‑GCM encrypted JSON blob** representing the entire vault stored in a `vault` table.
- **Argon2id** as the key derivation function from the master password.
- Derived key and decrypted vault living only in memory while the app is unlocked.

## Rationale

- SQLite gives a single file with mature tooling and predictable behavior.
- Encrypted JSON blob keeps the schema simple and makes it easy to refactor internals.
- Argon2id + AES‑GCM is a well‑understood, modern combination for password‑based encryption.
- Implementation complexity stays manageable for a solo developer.

## Consequences

### Positive

- Strong at‑rest protection: an attacker with the file still needs to brute‑force Argon2id.
- Authenticated encryption (AES‑GCM) detects tampering of the vault blob.
- Clean separation: DB is just a container; all cryptographic semantics live in the app layer.
- Simple DB schema and migration story.

### Negative

- No SQL‑level querying; all filtering and search must be done in memory.
- Entire vault must be re‑encrypted on every write (acceptable for expected vault sizes).
- Correct nonce management and KDF parameter selection must be carefully implemented.

### Why Other Options Were Not Chosen

- **SQLite with per‑field encryption:**
  - More complex: must manage multiple nonces and tags per row, and ensure consistent encryption policy per field.
  - Easy to accidentally leak metadata or partial information in cleartext columns.
  - Gains (SQL‑level queries) are not critical for a small, single‑user vault.

- **SQLCipher (encrypted SQLite engine):**
  - Would add an extra dependency and potentially more complex cross‑platform build setup.
  - Moves crypto down into the DB layer, making it slightly harder to reason about application‑level encryption semantics.
  - The chosen approach already provides strong at‑rest encryption without needing a custom SQLite build.

- **File‑based vault (no DB, single encrypted file):**
  - Feasible, but we would have to re‑implement some of the structure that SQLite already provides (file management, basic metadata).
  - SQLite gives us flexibility for future features (e.g., audit tables, metadata) with minimal cost.
  - No compelling benefit over using SQLite as a thin container.

- **OS credential stores (keychain, Windows Credential Manager, keytar):**
  - These stores are better suited for a small number of secrets per app rather than an entire password manager vault.
  - Cross‑platform behavior and backup/restore semantics can be inconsistent.
  - We want a portable vault file that can be manually backed up and moved if necessary.
