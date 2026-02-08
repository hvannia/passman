import "@testing-library/jest-dom/vitest";
import { vi, beforeEach } from "vitest";

window.api = {
  unlockVault: vi.fn(),
  lockVault: vi.fn(),
  listEntries: vi.fn(),
  getEntry: vi.fn(),
  createEntry: vi.fn(),
  updateEntry: vi.fn(),
  deleteEntry: vi.fn(),
  generatePassword: vi.fn(),
  copyToClipboard: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});
