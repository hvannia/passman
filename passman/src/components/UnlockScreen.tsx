import { useState } from "react";

export default function UnlockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await window.api.unlockVault(password);
      onUnlock();
    } catch {
      setError("Wrong password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border border-zinc-700 bg-zinc-800 p-8 shadow-xl"
      >
        <h1 className="mb-6 text-center text-2xl font-bold text-zinc-100">
          Passman
        </h1>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Master Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          className="mb-4 w-full rounded border border-zinc-600 bg-zinc-700 px-3 py-2 text-zinc-100 placeholder-zinc-400 focus:border-purple-500 focus:outline-none"
          placeholder="Enter master password"
        />
        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className="w-full rounded bg-purple-800 px-4 py-2 font-medium text-white hover:bg-purple-500 disabled:opacity-50"
        >
          {loading ? "Unlocking..." : "Unlock"}
        </button>
      </form>
    </div>
  );
}
