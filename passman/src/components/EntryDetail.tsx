import { useState } from "react";
import type { VaultEntry } from "../types";

export default function EntryDetail({
  entry,
  onEdit,
  onDelete,
}: {
  entry: VaultEntry;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  async function copyValue(label: string, value: string) {
    await window.api.copyToClipboard(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-zinc-100">{entry.title}</h2>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="rounded bg-zinc-600 px-3 py-1 text-sm text-zinc-100 hover:bg-zinc-500"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="rounded bg-red-700 px-3 py-1 text-sm text-white hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="space-y-3 rounded border border-zinc-700 bg-zinc-800/50 p-4">
        <Field
          label="Username"
          value={entry.username}
          onCopy={() => copyValue("Username", entry.username)}
          copied={copied === "Username"}
        />
        <div>
          <span className="text-sm text-zinc-400">Password</span>
          <div className="mt-1 flex items-center gap-2">
            <span className="flex-1 font-mono text-zinc-100">
              {showPassword ? entry.password : "••••••••••••"}
            </span>
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="rounded bg-zinc-600 px-2 py-1 text-xs text-zinc-100 hover:bg-zinc-500"
            >
              {showPassword ? "Hide" : "Reveal"}
            </button>
            <button
              onClick={() => copyValue("Password", entry.password)}
              className="rounded bg-zinc-600 px-2 py-1 text-xs text-zinc-100 hover:bg-zinc-500"
            >
              {copied === "Password" ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
        {entry.url && (
          <Field
            label="URL"
            value={entry.url}
            onCopy={() => copyValue("URL", entry.url!)}
            copied={copied === "URL"}
          />
        )}
        {entry.notes && (
          <div>
            <span className="text-sm text-zinc-400">Notes</span>
            <p className="mt-1 whitespace-pre-wrap text-zinc-100">
              {entry.notes}
            </p>
          </div>
        )}
        {entry.tags.length > 0 && (
          <div>
            <span className="text-sm text-zinc-400">Tags</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {entry.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-zinc-600 px-2 py-0.5 text-xs text-zinc-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="text-xs text-zinc-500">
          Updated {new Date(entry.updatedAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div>
      <span className="text-sm text-zinc-400">{label}</span>
      <div className="mt-1 flex items-center gap-2">
        <span className="flex-1 text-zinc-100">{value}</span>
        <button
          onClick={onCopy}
          className="rounded bg-zinc-600 px-2 py-1 text-xs text-zinc-100 hover:bg-zinc-500"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}
