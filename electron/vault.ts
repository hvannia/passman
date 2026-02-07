// electron/vault.ts
export interface VaultEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string | null;
  notes?: string | null;
  tags: string[];
  createdAt: string; // ISO
  updatedAt: string;
  lastUsedAt?: string | null;
}

export interface VaultModel {
  entries: VaultEntry[];
}

export interface EntryInput {
  title: string;
  username: string;
  password: string;
  url?: string | null;
  notes?: string | null;
  tags: string[];
}

export interface KdfParams {
  timeCost: number;
  memoryCost: number;
  parallelism: number;
}

export interface EntrySummary {
  id: string;
  title: string;
  username: string;
  url?: string | null;
  tags: string[];
  updatedAt: string;
}
