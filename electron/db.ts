//For a first cut, AES‑GCM + single blob is fine. Rough idea:

import path from "node:path";
import { app } from "electron";
import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";

let db: Database | null = null;

export async function initDb(appRef: Electron.App) {
  const userData = appRef.getPath("userData");
  const dbPath = path.join(userData, "vault.sqlite");
  db = await open({ filename: dbPath, driver: sqlite3.Database });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value BLOB
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS vault (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      ciphertext BLOB,
      nonce BLOB,
      tag BLOB
    );
  `);

  const row = await db.get("SELECT id FROM vault WHERE id = 1");
  if (!row) {
    await db.run(
      "INSERT INTO vault (id, ciphertext, nonce, tag) VALUES (1, x'', x'', x'')",
    );
  }
}

function getDb(): Database {
  if (!db) throw new Error("DB not initialized");
  return db;
}

export async function dbExists(appRef: Electron.App): Promise<boolean> {
  const userData = appRef.getPath("userData");
  const dbPath = path.join(userData, "vault.sqlite");
  return require("fs").existsSync(dbPath);
}
