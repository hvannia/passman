import { useState } from "react";
import type { EntryInput, VaultEntry } from "../types";
import PasswordGenerator from "./PasswordGenerator";

export default function EntryForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: VaultEntry;
  onSave: (input: EntryInput) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [username, setUsername] = useState(initial?.username ?? "");
  const [password, setPassword] = useState(initial?.password ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [tagsStr, setTagsStr] = useState(initial?.tags.join(", ") ?? "");
  const [showGenerator, setShowGenerator] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const tags = tagsStr
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    onSave({
      title,
      username,
      password,
      url: url || null,
      notes: notes || null,
      tags,
    });
  }

  const inputClass =
    "w-full rounded border border-zinc-600 bg-zinc-700 px-3 py-2 text-zinc-100 placeholder-zinc-400 focus:border-blue-500 focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-zinc-100">
        {initial ? "Edit Entry" : "New Entry"}
      </h2>

      <div>
        <label className="mb-1 block text-sm text-zinc-300">Title *</label>
        <input
          className={inputClass}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. GitHub"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-zinc-300">Username *</label>
        <input
          className={inputClass}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. user@example.com"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-zinc-300">Password *</label>
        <div className="flex gap-2">
          <input
            type={showPassword ? "text" : "password"}
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="shrink-0 rounded bg-zinc-600 px-3 py-2 text-sm text-zinc-100 hover:bg-zinc-500"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <button
          type="button"
          onClick={() => setShowGenerator(!showGenerator)}
          className="mt-2 text-sm text-blue-400 hover:text-blue-300"
        >
          {showGenerator ? "Hide generator" : "Generate password"}
        </button>
        {showGenerator && (
          <div className="mt-2">
            <PasswordGenerator onUse={(pw) => { setPassword(pw); setShowGenerator(false); }} />
          </div>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm text-zinc-300">URL</label>
        <input
          className={inputClass}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-zinc-300">Notes</label>
        <textarea
          className={inputClass + " resize-y"}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-zinc-300">
          Tags (comma-separated)
        </label>
        <input
          className={inputClass}
          value={tagsStr}
          onChange={(e) => setTagsStr(e.target.value)}
          placeholder="e.g. work, dev"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={!title || !username || !password}
          className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {initial ? "Save Changes" : "Create Entry"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded bg-zinc-600 px-4 py-2 font-medium text-zinc-100 hover:bg-zinc-500"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
