import { useState } from "react";
import type { EntrySummary, EntryInput, VaultEntry } from "../types";
import EntryList from "./EntryList";
import EntryDetail from "./EntryDetail";
import EntryForm from "./EntryForm";

type Mode = "view" | "create" | "edit";

export default function VaultView({ onLock }: { onLock: () => void }) {
  const [entries, setEntries] = useState<EntrySummary[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<VaultEntry | null>(null);
  const [mode, setMode] = useState<Mode>("view");
  const [searchQuery, setSearchQuery] = useState("");
  const [initialized, setInitialized] = useState(false);

  // Load entries on first render via ref callback (avoids setState-in-effect lint error)
  const initRef = (node: HTMLDivElement | null) => {
    if (node && !initialized) {
      setInitialized(true);
      window.api.listEntries().then(setEntries);
    }
  };

  async function loadEntries() {
    const list = await window.api.listEntries();
    setEntries(list);
  }

  async function handleSelect(id: string) {
    const entry = await window.api.getEntry(id);
    setSelectedEntry(entry);
    setMode("view");
  }

  function handleCreate() {
    setSelectedEntry(null);
    setMode("create");
  }

  async function handleSaveNew(input: EntryInput) {
    const created = await window.api.createEntry(input);
    await loadEntries();
    const entry = await window.api.getEntry(created.id);
    setSelectedEntry(entry);
    setMode("view");
  }

  async function handleSaveEdit(input: EntryInput) {
    if (!selectedEntry) return;
    await window.api.updateEntry(selectedEntry.id, input);
    await loadEntries();
    const updated = await window.api.getEntry(selectedEntry.id);
    setSelectedEntry(updated);
    setMode("view");
  }

  async function handleDelete() {
    if (!selectedEntry) return;
    await window.api.deleteEntry(selectedEntry.id);
    setSelectedEntry(null);
    setMode("view");
    await loadEntries();
  }

  async function handleLock() {
    await window.api.lockVault();
    onLock();
  }

  const selectedId = selectedEntry?.id ?? null;

  return (
    <div ref={initRef} className="flex h-screen text-zinc-100">
      {/* Sidebar */}
      <div className="flex w-72 flex-col border-r border-zinc-700 bg-zinc-800">
        <div className="flex items-center justify-between border-b border-zinc-700 px-3 py-3">
          <span className="text-sm font-semibold text-zinc-300">Passman</span>
          <button
            onClick={handleLock}
            className="rounded bg-zinc-600 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-500"
          >
            Lock
          </button>
        </div>
        <EntryList
          entries={entries}
          selectedId={selectedId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelect={handleSelect}
          onCreate={handleCreate}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6">
        {mode === "create" && (
          <EntryForm
            onSave={handleSaveNew}
            onCancel={() => {
              setMode("view");
            }}
          />
        )}
        {mode === "edit" && selectedEntry && (
          <EntryForm
            initial={selectedEntry}
            onSave={handleSaveEdit}
            onCancel={() => setMode("view")}
          />
        )}
        {mode === "view" && selectedEntry && (
          <EntryDetail
            entry={selectedEntry}
            onEdit={() => setMode("edit")}
            onDelete={handleDelete}
          />
        )}
        {mode === "view" && !selectedEntry && (
          <div className="flex h-full items-center justify-center text-zinc-500">
            Select an entry or create a new one
          </div>
        )}
      </div>
    </div>
  );
}
