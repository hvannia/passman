import type { VaultEntry, EntrySummary, EntryInput } from "../src/types";

export function makeEntry(overrides: Partial<VaultEntry> = {}): VaultEntry {
  return {
    id: "entry-1",
    title: "GitHub",
    username: "user@example.com",
    password: "s3cret!",
    url: "https://github.com",
    notes: "Work account",
    tags: ["dev", "work"],
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-06-01T00:00:00.000Z",
    lastUsedAt: null,
    ...overrides,
  };
}

export function makeSummary(
  overrides: Partial<EntrySummary> = {},
): EntrySummary {
  return {
    id: "entry-1",
    title: "GitHub",
    username: "user@example.com",
    url: "https://github.com",
    tags: ["dev", "work"],
    updatedAt: "2025-06-01T00:00:00.000Z",
    ...overrides,
  };
}

export function makeInput(overrides: Partial<EntryInput> = {}): EntryInput {
  return {
    title: "GitHub",
    username: "user@example.com",
    password: "s3cret!",
    url: "https://github.com",
    notes: "Work account",
    tags: ["dev", "work"],
    ...overrides,
  };
}
