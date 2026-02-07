# Single Device local Password manager

## High‑level behavior

    •	Local encrypted vault file:Store everything (logins, notes, metadata) in one file on disk, e.g., an encrypted SQLite DB or custom binary file, similar to how KeePass stores data in an encrypted database.The app never writes plaintext secrets to disk, only the encrypted vault.

    •	Master password and key derivation:On first run, user sets a master password; you derive a key from it using a slow KDF (PBKDF2, Argon2, or scrypt) with a random salt stored in the file header. On unlock, user types the master password, you re‑derive the key and decrypt the vault; if decryption fails, the password is wrong.

    •	Encryption choices:Use an authenticated symmetric cipher like AES‑256‑GCM or ChaCha20‑Poly1305 to encrypt the vault so you get confidentiality and integrity.Encrypt the entire vault blob (or all sensitive tables) with a random IV/nonce stored alongside in the file header.

    •	In‑memory handling:After unlocking, keep decrypted data only in RAM, ideally in structures you can zero when locking or exiting.Avoid logging or paging secrets: no debug logs of values, and be careful with crash dumps.

## Data model and storage

    •	Entries table (in the decrypted view):Each record can have: id, title, username, password, URL, notes, created_at, updated_at, last_used_at, tags.You can also support attachments by encrypting file blobs and storing them in the vault.

    •	Vault file layout (on disk):
    		Header: magic bytes, version, KDF parameters (salt, iterations, memory/cpu cost), cipher info, maybe a checksum.
    		Encrypted payload: serialized DB or structured JSON/binary containing all entries.

    •	Locking behavior:App auto‑locks after inactivity or when the window is closed, discarding keys from memory and requiring the master password again.Manual “Lock now” option should also clear sensitive structures.

## Desktop UX features

    •	CRUD for entries:Basic UI to create, edit, delete entries, search by title/URL, group by folder or tag.A simple password generator dialog for creating strong passwords with configurable length and character sets.

    •	Clipboard and reveal:“Copy username/password” buttons that copy to clipboard and optionally clear it after N seconds.“Reveal password” toggle for viewing in the UI, with the default view masked.

    •	No networking path:Do not include any automatic sync, telemetry, or update checks in the first iteration so you can reason easily about the threat model: attacker must get the vault file and then brute‑force the master password.
