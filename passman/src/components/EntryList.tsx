import type { EntrySummary } from "../types";

export default function EntryList({
  entries,
  selectedId,
  searchQuery,
  onSearchChange,
  onSelect,
  onCreate,
  allTags,
  selectedTag,
  onTagSelect,
}: {
  entries: EntrySummary[];
  selectedId: string | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelect: (id: string) => void;
  onCreate: () => void;
  allTags: string[];
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
}) {
  const tagFiltered = selectedTag
    ? entries.filter((e) => e.tags.includes(selectedTag))
    : entries;
  const query = searchQuery.toLowerCase();
  const filtered = tagFiltered.filter(
    (e) =>
      e.title.toLowerCase().includes(query) ||
      e.username.toLowerCase().includes(query) ||
      (e.url && e.url.toLowerCase().includes(query)) ||
      e.tags.some((t) => t.toLowerCase().includes(query)),
  );

  return (
    <div className="flex h-full flex-col">
      <div className="p-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search entries..."
          className="w-full rounded border border-zinc-600 bg-zinc-700 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-400 focus:border-purple-500 focus:outline-none"
        />
      </div>
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1 px-3 pb-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagSelect(selectedTag === tag ? null : tag)}
              className={`rounded-full px-2 py-0.5 text-xs transition-colors ${
                selectedTag === tag
                  ? "bg-purple-600 text-white"
                  : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <p className="px-3 py-6 text-center text-sm text-zinc-500">
            {entries.length === 0 ? "No entries yet" : "No matches"}
          </p>
        )}
        {filtered.map((entry) => (
          <button
            key={entry.id}
            onClick={() => onSelect(entry.id)}
            className={`w-full border-b border-zinc-700 px-3 py-3 text-left transition-colors hover:bg-zinc-700 ${
              selectedId === entry.id ? "bg-zinc-700" : ""
            }`}
          >
            <div className="font-medium text-zinc-100">{entry.title}</div>
            <div className="text-sm text-zinc-400">{entry.username}</div>
            {entry.tags.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-zinc-600 px-1.5 py-0.5 text-xs text-zinc-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </button>
        ))}
      </div>
      <div className="border-t border-zinc-700 p-3">
        <button
          onClick={onCreate}
          className="w-full rounded bg-purple-800 px-3 py-2 text-sm font-medium text-white hover:purple-500"
        >
          + New Entry
        </button>
      </div>
    </div>
  );
}
