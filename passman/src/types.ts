export interface VaultEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string | null;
  notes?: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string | null;
}

export interface EntrySummary {
  id: string;
  title: string;
  username: string;
  url?: string | null;
  tags: string[];
  updatedAt: string;
}

export interface EntryInput {
  title: string;
  username: string;
  password: string;
  url?: string | null;
  notes?: string | null;
  tags: string[];
}

declare global {
  interface Window {
    api: {
      unlockVault(password: string): Promise<void>;
      lockVault(): Promise<void>;
      listEntries(): Promise<EntrySummary[]>;
      getEntry(id: string): Promise<VaultEntry>;
      createEntry(input: EntryInput): Promise<VaultEntry>;
      updateEntry(id: string, input: EntryInput): Promise<VaultEntry>;
      deleteEntry(id: string): Promise<void>;
      generatePassword(length: number): Promise<string>;
      copyToClipboard(value: string): Promise<void>;
    };
  }
}
