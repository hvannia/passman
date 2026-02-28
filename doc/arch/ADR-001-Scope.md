# ADR 001: Scope – Local‑Only Password Manager

**Status:** Accepted  
**Date:** 2026‑02‑28

## Context

We are building a password manager for personal use. Key requirements:

- Work fully offline on a single desktop device.
- Simple threat model, focused on local compromise and offline brute‑force.
- No operational overhead for servers, user accounts, or cloud infrastructure.

We considered several scope options.

## Considered Options

1. **Local‑only, single‑device, no sync (chosen)**
2. Local with optional cloud sync (e.g., custom backend, Firebase, Supabase)
3. Cloud‑first service with web and mobile clients
4. Local app with third‑party sync storage (e.g., Dropbox, iCloud, OneDrive)

## Decision

We choose **local‑only, single‑device, no sync** for the initial version.

## Rationale

- Aligns with the goal of a simple, personal tool.
- Minimizes moving parts and security surfaces.
- Easier to reason about encryption and threat model.

## Consequences

### Positive

- No backend infrastructure to build, host, secure, or pay for.
- All secrets are stored only on the user’s machine; no third‑party copies.
- Threat model is clear: attacker must obtain the local vault file and attempt offline cracking.

### Negative

- No automatic multi‑device sync; user must rely on manual backup (file copy, local backup tools).
- Losing the device or vault file without a backup is catastrophic.

### Why Other Options Were Not Chosen

- **Local + optional cloud sync (custom backend / Firebase / Supabase):**
  - Adds backend complexity (auth, storage, API, monitoring) for limited benefit in v1.
  - Increases attack surface (online access, server breaches).
  - Conflicts with the “no cloud” requirement.

- **Cloud‑first service (full SaaS):**
  - Requires full multi‑tenant architecture, user management, compliance considerations.
  - Far beyond current scope; significantly more complex security and operations.

- **Local app + third‑party sync (Dropbox/iCloud/OneDrive):**
  - Still introduces a dependency on cloud vendors and their operational model.
  - Complicates support and UX (auth to third‑party, sync conflicts).
  - Not necessary to deliver a useful first version.
