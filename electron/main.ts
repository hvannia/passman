import { app, BrowserWindow, ipcMain, clipboard } from "electron";
import path from "node:path";
import { initDb } from "./db";
import { deriveKey } from "./crypto";
import {
  readKdfParams,
  writeKdfParams,
  loadVaultEncrypted,
  saveVaultEncrypted,
  vaultInitialized,
} from "./helpers";
import type { VaultModel, EntryInput, EntrySummary, VaultEntry } from "./vault";
import { v4 as uuid } from "uuid";

let win: BrowserWindow | null = null;

// In-memory state while unlocked
let currentKey: Buffer | null = null;
let currentVault: VaultModel | null = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // load your Vite-built index.html
  win.loadFile(path.join(__dirname, "../passman/dist/index.html"));
}

app.whenReady().then(async () => {
  await initDb(app); // ensure DB file & schema
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// IPC handlers
ipcMain.handle("vault:unlock", async (_event, password: string) => {
  const initialized = await vaultInitialized();
  if (!initialized) {
    // first run: create empty vault
    const { salt, params } = await writeKdfParams(app);
    const key = await deriveKey(password, salt, params);
    const model: VaultModel = { entries: [] };
    await saveVaultEncrypted(app, key, model);
    currentKey = key;
    currentVault = model;
    return;
  } else {
    const { salt, params } = await readKdfParams(app);
    const key = await deriveKey(password, salt, params);
    const decrypted = await loadVaultEncrypted(app, key); // throws on auth failure
    currentKey = key;
    currentVault = decrypted;
    return;
  }
});

ipcMain.handle("vault:lock", () => {
  currentKey = null;
  currentVault = null;
});

ipcMain.handle("vault:listEntries", (): EntrySummary[] => {
  if (!currentVault) throw new Error("Vault locked");
  return currentVault.entries.map((e) => ({
    id: e.id,
    title: e.title,
    username: e.username,
    url: e.url ?? null,
    tags: e.tags,
    updatedAt: e.updatedAt,
  }));
});

ipcMain.handle("vault:getEntry", (_event, id: string): VaultEntry => {
  if (!currentVault) throw new Error("Vault locked");
  const entry = currentVault.entries.find((e) => e.id === id);
  if (!entry) throw new Error("Not found");
  return entry;
});

async function persistVault() {
  if (!currentVault || !currentKey) throw new Error("Vault locked");
  await saveVaultEncrypted(app, currentKey, currentVault);
}

ipcMain.handle(
  "vault:createEntry",
  async (_event, input: EntryInput): Promise<VaultEntry> => {
    if (!currentVault) throw new Error("Vault locked");
    const now = new Date().toISOString();
    const entry: VaultEntry = {
      id: uuid(),
      title: input.title,
      username: input.username,
      password: input.password,
      url: input.url,
      notes: input.notes,
      tags: input.tags,
      createdAt: now,
      updatedAt: now,
      lastUsedAt: null,
    };
    currentVault.entries.push(entry);
    await persistVault();
    return entry;
  },
);

ipcMain.handle(
  "vault:updateEntry",
  async (_event, id: string, input: EntryInput): Promise<VaultEntry> => {
    if (!currentVault) throw new Error("Vault locked");
    const now = new Date().toISOString();
    const idx = currentVault.entries.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error("Not found");
    const existing = currentVault.entries[idx];
    const updated: VaultEntry = {
      ...existing,
      ...input,
      updatedAt: now,
    };
    currentVault.entries[idx] = updated;
    await persistVault();
    return updated;
  },
);

ipcMain.handle("vault:deleteEntry", async (_event, id: string) => {
  if (!currentVault) throw new Error("Vault locked");
  currentVault.entries = currentVault.entries.filter((e) => e.id !== id);
  await persistVault();
});

ipcMain.handle("vault:generatePassword", (_event, length: number): string => {
  // simple CSPRNG-based generator
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+";
  const buf = require("crypto").randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[buf[i] % chars.length];
  }
  return out;
});

ipcMain.handle("vault:copyToClipboard", (_event, value: string) => {
  clipboard.writeText(value);
});
