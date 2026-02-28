# ADR 002: Desktop Shell – Electron vs Alternatives

**Status:** Accepted  
**Date:** 2026‑02‑28

## Context

We need a desktop shell that:

- Runs cross‑platform (at least Windows and macOS, Linux desirable).
- Integrates well with TypeScript and web tooling.
- Provides access to filesystem, OS clipboard, and system APIs.
- Allows a separation between a more trusted backend and less trusted UI.

We considered several shells.

## Considered Options

1. **Electron (chosen)**
2. Tauri (Rust backend + webview)
3. Native desktop frameworks (e.g., .NET/WPF, Swift/SwiftUI, Qt)
4. Web‑only app in browser (no desktop shell)

## Decision

We choose **Electron** as the desktop shell, with:

- Main process (Node) for backend logic.
- Renderer process (React/Vite) for UI.
- Preload script and IPC for communication.

## Rationale

- Fits existing JS/TS skills; no new language (Rust, C#, Swift) is required.
- Mature ecosystem and documentation for secure IPC, packaging, and auto‑updates.
- Multiple examples and guidance for Electron + React + Vite.

## Consequences

### Positive

- Single‑language (TypeScript/JavaScript) stack across main, preload, and renderer.
- Rich ecosystem (SQLite bindings, crypto libraries, devtools).
- Well‑documented security practices (contextIsolation, preload APIs, CSP).

### Negative

- Larger runtime footprint and memory usage compared to more “native” shells.
- Electron apps can be targets for specific security research; misconfiguration can lead to vulnerabilities.

### Why Other Options Were Not Chosen

- **Tauri:**
  - Requires Rust for the backend, which is not currently a skill requirement and would slow development.
  - While more lightweight, introduces a mixed‑language stack (Rust + TS) and a new toolchain.
  - We already shifted away from Tauri due to lack of Rust experience.

- **Native frameworks (.NET/WPF, Swift/SwiftUI, Qt):**
  - Would require building the UI and logic in non‑web stacks, discarding the React/Vite work.
  - Often not cross‑platform without separate code paths or significant framework learning curve.
  - Less alignment with existing React and web tooling workflows.

- **Pure web app (browser only):**
  - Limited access to local filesystem and secure local storage; would require browser‑based storage workarounds.
  - Harder to isolate and protect a single vault file in a predictable location.
  - No direct integration with OS clipboard at the same level as a desktop shell.
