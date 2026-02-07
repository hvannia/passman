import { randomBytes, createCipheriv, createDecipheriv } from "crypto";
import argon2 from "argon2";
import type { KdfParams } from "./vault";

export async function deriveKey(
  password: string,
  salt: Buffer,
  params: KdfParams,
): Promise<Buffer> {
  const hash = await argon2.hash(password, {
    type: argon2.argon2id,
    salt,
    timeCost: params.timeCost,
    memoryCost: params.memoryCost,
    parallelism: params.parallelism,
    hashLength: 32,
    raw: true,
  });
  return Buffer.from(hash);
}

export function encryptJson(plaintext: Buffer, key: Buffer) {
  const nonce = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, nonce);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { ciphertext, nonce, tag };
}

export function decryptJson(
  ciphertext: Buffer,
  nonce: Buffer,
  tag: Buffer,
  key: Buffer,
): Buffer {
  const decipher = createDecipheriv("aes-256-gcm", key, nonce);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return plaintext;
}
