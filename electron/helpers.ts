import { randomBytes } from "crypto";
import { getDb } from "./db";
import type { VaultModel } from "./vault";

export interface KdfParams {
  timeCost: number;
  memoryCost: number;
  parallelism: number;
}

export async function writeKdfParams(appRef: Electron.App) {
  const db = getDb();
  const salt = randomBytes(16);
  const params: KdfParams = {
    timeCost: 3,
    memoryCost: 64 * 1024,
    parallelism: 1,
  };

  await db.run(
    "INSERT OR REPLACE INTO meta (key, value) VALUES ('kdf_salt', ?)",
    salt,
  );
  await db.run(
    "INSERT OR REPLACE INTO meta (key, value) VALUES ('kdf_params', ?)",
    JSON.stringify(params),
  );

  return { salt, params };
}

export async function readKdfParams(appRef: Electron.App) {
  const db = getDb();
  const saltRow = await db.get("SELECT value FROM meta WHERE key = 'kdf_salt'");
  const paramsRow = await db.get(
    "SELECT value FROM meta WHERE key = 'kdf_params'",
  );
  if (!saltRow || !paramsRow) throw new Error("KDF params missing");
  const salt: Buffer = saltRow.value;
  const params: KdfParams = JSON.parse(paramsRow.value.toString());
  return { salt, params };
}

export async function saveVaultEncrypted(
  appRef: Electron.App,
  key: Buffer,
  model: VaultModel,
) {
  const db = getDb();
  const plaintext = Buffer.from(JSON.stringify(model), "utf8");
  const { ciphertext, nonce, tag } = encryptJson(plaintext, key);
  await db.run(
    "UPDATE vault SET ciphertext = ?, nonce = ?, tag = ? WHERE id = 1",
    ciphertext,
    nonce,
    tag,
  );
}

export async function loadVaultEncrypted(
  appRef: Electron.App,
  key: Buffer,
): Promise<VaultModel> {
  const db = getDb();
  const row = await db.get(
    "SELECT ciphertext, nonce, tag FROM vault WHERE id = 1",
  );
  if (!row) throw new Error("Vault row missing");
  const plaintext = decryptJson(row.ciphertext, row.nonce, row.tag, key);
  return JSON.parse(plaintext.toString("utf8"));
}
