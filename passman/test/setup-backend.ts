import { vi } from "vitest";
import { createHash } from "crypto";

vi.mock("argon2", () => ({
  default: {
    argon2id: 2,
    hash: async (
      password: string,
      opts: { salt: Buffer; hashLength: number },
    ) => {
      // Deterministic stand-in: SHA-256 of password+salt, truncated to hashLength
      const h = createHash("sha256")
        .update(password)
        .update(opts.salt)
        .digest();
      return h.subarray(0, opts.hashLength);
    },
  },
}));

vi.mock("sqlite3", () => ({
  default: { Database: class {} },
}));

vi.mock("sqlite", () => ({
  open: vi.fn(),
}));

vi.mock("electron", () => ({
  app: {
    getPath: () => "/tmp/test",
  },
}));
