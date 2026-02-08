import { randomBytes } from "crypto";
import { encryptJson, decryptJson, deriveKey } from "../crypto";

describe("encryptJson / decryptJson", () => {
  const key = randomBytes(32);
  const plaintext = Buffer.from(JSON.stringify({ hello: "world" }), "utf8");

  it("returns ciphertext, 12-byte nonce, and 16-byte tag", () => {
    const { ciphertext, nonce, tag } = encryptJson(plaintext, key);
    expect(ciphertext).toBeInstanceOf(Buffer);
    expect(nonce).toHaveLength(12);
    expect(tag).toHaveLength(16);
  });

  it("ciphertext differs from plaintext", () => {
    const { ciphertext } = encryptJson(plaintext, key);
    expect(ciphertext.equals(plaintext)).toBe(false);
  });

  it("roundtrips correctly", () => {
    const { ciphertext, nonce, tag } = encryptJson(plaintext, key);
    const result = decryptJson(ciphertext, nonce, tag, key);
    expect(result.toString("utf8")).toBe(plaintext.toString("utf8"));
  });

  it("throws with wrong key", () => {
    const { ciphertext, nonce, tag } = encryptJson(plaintext, key);
    const wrongKey = randomBytes(32);
    expect(() => decryptJson(ciphertext, nonce, tag, wrongKey)).toThrow();
  });

  it("throws with tampered ciphertext", () => {
    const { ciphertext, nonce, tag } = encryptJson(plaintext, key);
    const tampered = Buffer.from(ciphertext);
    tampered[0] ^= 0xff;
    expect(() => decryptJson(tampered, nonce, tag, key)).toThrow();
  });

  it("throws with tampered tag", () => {
    const { ciphertext, nonce, tag } = encryptJson(plaintext, key);
    const tampered = Buffer.from(tag);
    tampered[0] ^= 0xff;
    expect(() => decryptJson(ciphertext, nonce, tampered, key)).toThrow();
  });
});

describe("deriveKey", () => {
  const params = { timeCost: 3, memoryCost: 65536, parallelism: 1 };

  it("returns a 32-byte Buffer", async () => {
    const salt = randomBytes(16);
    const key = await deriveKey("password", salt, params);
    expect(key).toBeInstanceOf(Buffer);
    expect(key).toHaveLength(32);
  });

  it("produces different output for different passwords", async () => {
    const salt = randomBytes(16);
    const key1 = await deriveKey("password1", salt, params);
    const key2 = await deriveKey("password2", salt, params);
    expect(key1.equals(key2)).toBe(false);
  });

  it("produces different output for different salts", async () => {
    const key1 = await deriveKey("password", randomBytes(16), params);
    const key2 = await deriveKey("password", randomBytes(16), params);
    expect(key1.equals(key2)).toBe(false);
  });
});
