import { randomBytes } from "crypto";
import { vi } from "vitest";
import {
  vaultInitialized,
  writeKdfParams,
  readKdfParams,
  saveVaultEncrypted,
  loadVaultEncrypted,
} from "../helpers";
import type { VaultModel } from "../vault";

// Mock the db module
const mockGet = vi.fn();
const mockRun = vi.fn();

vi.mock("../db", () => ({
  getDb: () => ({
    get: mockGet,
    run: mockRun,
  }),
}));

const fakeApp = { getPath: () => "/tmp/test" } as unknown as Electron.App;

beforeEach(() => {
  mockGet.mockReset();
  mockRun.mockReset();
});

describe("vaultInitialized", () => {
  it("returns true when kdf_salt row exists", async () => {
    mockGet.mockResolvedValue({ value: Buffer.from("salt") });
    expect(await vaultInitialized()).toBe(true);
  });

  it("returns false when kdf_salt row is missing", async () => {
    mockGet.mockResolvedValue(undefined);
    expect(await vaultInitialized()).toBe(false);
  });
});

describe("writeKdfParams", () => {
  it("generates a 16-byte salt and stores salt + params via db.run", async () => {
    const { salt, params } = await writeKdfParams(fakeApp);
    expect(salt).toBeInstanceOf(Buffer);
    expect(salt).toHaveLength(16);
    expect(params).toEqual({
      timeCost: 3,
      memoryCost: 64 * 1024,
      parallelism: 1,
    });
    expect(mockRun).toHaveBeenCalledTimes(2);
    // First call stores salt
    expect(mockRun.mock.calls[0][0]).toContain("kdf_salt");
    expect(mockRun.mock.calls[0][1]).toBe(salt);
    // Second call stores params as JSON
    expect(mockRun.mock.calls[1][0]).toContain("kdf_params");
    expect(mockRun.mock.calls[1][1]).toBe(JSON.stringify(params));
  });
});

describe("readKdfParams", () => {
  it("reads and parses salt + params from db", async () => {
    const salt = randomBytes(16);
    const params = { timeCost: 3, memoryCost: 65536, parallelism: 1 };
    mockGet
      .mockResolvedValueOnce({ value: salt })
      .mockResolvedValueOnce({ value: Buffer.from(JSON.stringify(params)) });

    const result = await readKdfParams(fakeApp);
    expect(result.salt).toBe(salt);
    expect(result.params).toEqual(params);
  });

  it("throws when rows are missing", async () => {
    mockGet.mockResolvedValue(undefined);
    await expect(readKdfParams(fakeApp)).rejects.toThrow("KDF params missing");
  });
});

describe("saveVaultEncrypted / loadVaultEncrypted", () => {
  const key = randomBytes(32);
  const model: VaultModel = {
    entries: [
      {
        id: "1",
        title: "Test",
        username: "user",
        password: "pw",
        url: null,
        notes: null,
        tags: [],
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
        lastUsedAt: null,
      },
    ],
  };

  it("encrypts and calls db.run with UPDATE", async () => {
    await saveVaultEncrypted(fakeApp, key, model);
    expect(mockRun).toHaveBeenCalledTimes(1);
    const [sql, ciphertext, nonce, tag] = mockRun.mock.calls[0];
    expect(sql).toContain("UPDATE vault");
    expect(ciphertext).toBeInstanceOf(Buffer);
    expect(nonce).toHaveLength(12);
    expect(tag).toHaveLength(16);
  });

  it("save then load roundtrip preserves VaultModel", async () => {
    // Capture the encrypted data from save
    let savedCiphertext: Buffer;
    let savedNonce: Buffer;
    let savedTag: Buffer;

    mockRun.mockImplementation(
      (_sql: string, ct: Buffer, n: Buffer, t: Buffer) => {
        savedCiphertext = ct;
        savedNonce = n;
        savedTag = t;
      },
    );

    await saveVaultEncrypted(fakeApp, key, model);

    mockGet.mockResolvedValue({
      ciphertext: savedCiphertext!,
      nonce: savedNonce!,
      tag: savedTag!,
    });

    const loaded = await loadVaultEncrypted(fakeApp, key);
    expect(loaded).toEqual(model);
  });
});
