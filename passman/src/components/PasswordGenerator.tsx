import { useState } from "react";

export default function PasswordGenerator({
  onUse,
}: {
  onUse: (password: string) => void;
}) {
  const [length, setLength] = useState(20);
  const [generated, setGenerated] = useState("");

  async function handleGenerate() {
    const pw = await window.api.generatePassword(length);
    setGenerated(pw);
  }

  return (
    <div className="rounded border border-zinc-600 bg-zinc-750 p-3">
      <div className="mb-2 flex items-center gap-3">
        <label className="text-sm text-zinc-300">Length: {length}</label>
        <input
          type="range"
          min={8}
          max={64}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="flex-1"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleGenerate}
          className="rounded bg-zinc-600 px-3 py-1 text-sm text-zinc-100 hover:bg-zinc-500"
        >
          Generate
        </button>
        {generated && (
          <button
            type="button"
            onClick={() => onUse(generated)}
            className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-500"
          >
            Use
          </button>
        )}
      </div>
      {generated && (
        <p className="mt-2 break-all rounded bg-zinc-900 p-2 font-mono text-sm text-green-400">
          {generated}
        </p>
      )}
    </div>
  );
}
