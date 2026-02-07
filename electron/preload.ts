import { contextBridge, ipcRenderer } from "electron";
import type { EntryInput, EntrySummary, VaultEntry } from "./vault";

contextBridge.exposeInMainWorld("api", {
  unlockVault: (password: string) =>
    ipcRenderer.invoke("vault:unlock", password),
  lockVault: () => ipcRenderer.invoke("vault:lock"),
  listEntries: (): Promise<EntrySummary[]> =>
    ipcRenderer.invoke("vault:listEntries"),
  getEntry: (id: string): Promise<VaultEntry> =>
    ipcRenderer.invoke("vault:getEntry", id),
  createEntry: (input: EntryInput): Promise<VaultEntry> =>
    ipcRenderer.invoke("vault:createEntry", input),
  updateEntry: (id: string, input: EntryInput): Promise<VaultEntry> =>
    ipcRenderer.invoke("vault:updateEntry", id, input),
  deleteEntry: (id: string): Promise<void> =>
    ipcRenderer.invoke("vault:deleteEntry", id),
  generatePassword: (length: number): Promise<string> =>
    ipcRenderer.invoke("vault:generatePassword", length),
  copyToClipboard: (value: string): Promise<void> =>
    ipcRenderer.invoke("vault:copyToClipboard", value),
});
import { contextBridge, ipcRenderer } from "electron";
import type { EntryInput, EntrySummary, VaultEntry } from "./vault";

contextBridge.exposeInMainWorld("api", {
  unlockVault: (password: string) =>
    ipcRenderer.invoke("vault:unlock", password),
  lockVault: () => ipcRenderer.invoke("vault:lock"),
  listEntries: (): Promise<EntrySummary[]> =>
    ipcRenderer.invoke("vault:listEntries"),
  getEntry: (id: string): Promise<VaultEntry> =>
    ipcRenderer.invoke("vault:getEntry", id),
  createEntry: (input: EntryInput): Promise<VaultEntry> =>
    ipcRenderer.invoke("vault:createEntry", input),
  updateEntry: (id: string, input: EntryInput): Promise<VaultEntry> =>
    ipcRenderer.invoke("vault:updateEntry", id, input),
  deleteEntry: (id: string): Promise<void> =>
    ipcRenderer.invoke("vault:deleteEntry", id),
  generatePassword: (length: number): Promise<string> =>
    ipcRenderer.invoke("vault:generatePassword", length),
  copyToClipboard: (value: string): Promise<void> =>
    ipcRenderer.invoke("vault:copyToClipboard", value),
});
