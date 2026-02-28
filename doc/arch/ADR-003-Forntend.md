# ADR 003: Frontend Technology – React, TypeScript, Vite vs Alternatives

**Status:** Accepted  
**Date:** 2026‑02‑28

## Context

We need a frontend stack to:

- Build UI for listing, viewing, editing, and searching entries.
- Provide good developer ergonomics and type safety.
- Integrate well with Electron and hot‑reload.

We considered multiple frontend stacks.

## Considered Options

1. **React + TypeScript + Vite (chosen)**
2. React + TypeScript + Webpack (or CRA)
3. Other frameworks: Vue, Svelte, Angular
4. Plain HTML/JS or minimal framework

## Decision

We choose **React + TypeScript + Vite** for the renderer.

## Rationale

- Existing experience and muscle memory with React and TypeScript.
- Vite provides fast dev server and simple configuration, especially for new projects.
- Good ecosystem together with Vitest for testing.

## Consequences

### Positive

- Consistent use of TypeScript models across main and renderer (e.g., `VaultEntry`, `EntryInput`).
- Fast feedback via Vite’s HMR, especially useful for UI iteration.
- Large ecosystem of third‑party components and patterns.

### Negative

- Some initial configuration to integrate Vite dev server with Electron dev process.
- Need to manage separate build steps: one for Electron main/preload, one for the renderer.

### Why Other Options Were Not Chosen

- **React + Webpack / CRA:**
  - Heavier and slower dev experience compared to Vite.
  - CRA is de‑emphasized in the React ecosystem; less future‑proof.
  - More configuration boilerplate for modern setups.

- **Vue / Svelte / Angular:**
  - Would require learning or context‑switching to different frameworks without clear benefit for this project’s scope.
  - React already matches the developer’s primary experience and existing code patterns.
  - Angular would be overkill for the relatively small, single‑user app.

- **Plain HTML/JS or minimal framework:**
  - Less structure for state management and componentization.
  - Would sacrifice TypeScript‑powered abstractions and reuse from the broader React ecosystem.
  - Harder to maintain and scale the UI as features grow (tags, filters, settings, etc.).
