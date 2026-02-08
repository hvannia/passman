import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EntryList from "./EntryList";
import { makeSummary } from "../../test/fixtures";

describe("EntryList", () => {
  const entries = [
    makeSummary({ id: "1", title: "GitHub", username: "user1", tags: ["dev"] }),
    makeSummary({ id: "2", title: "Gmail", username: "user2", url: "https://mail.google.com", tags: ["email"] }),
  ];

  const defaults = {
    entries,
    selectedId: null,
    searchQuery: "",
    onSearchChange: vi.fn(),
    onSelect: vi.fn(),
    onCreate: vi.fn(),
  };

  it("renders all entries", () => {
    render(<EntryList {...defaults} />);
    expect(screen.getByText("GitHub")).toBeInTheDocument();
    expect(screen.getByText("Gmail")).toBeInTheDocument();
  });

  it("highlights the selected entry", () => {
    render(<EntryList {...defaults} selectedId="1" />);
    const button = screen.getByText("GitHub").closest("button")!;
    expect(button.className).toContain("bg-zinc-700");
  });

  it("filters by title (case-insensitive)", () => {
    render(<EntryList {...defaults} searchQuery="git" />);
    expect(screen.getByText("GitHub")).toBeInTheDocument();
    expect(screen.queryByText("Gmail")).not.toBeInTheDocument();
  });

  it("filters by username", () => {
    render(<EntryList {...defaults} searchQuery="user2" />);
    expect(screen.queryByText("GitHub")).not.toBeInTheDocument();
    expect(screen.getByText("Gmail")).toBeInTheDocument();
  });

  it("filters by url", () => {
    render(<EntryList {...defaults} searchQuery="google" />);
    expect(screen.queryByText("GitHub")).not.toBeInTheDocument();
    expect(screen.getByText("Gmail")).toBeInTheDocument();
  });

  it("filters by tags", () => {
    render(<EntryList {...defaults} searchQuery="email" />);
    expect(screen.queryByText("GitHub")).not.toBeInTheDocument();
    expect(screen.getByText("Gmail")).toBeInTheDocument();
  });

  it('shows "No entries yet" when entries array is empty', () => {
    render(<EntryList {...defaults} entries={[]} />);
    expect(screen.getByText("No entries yet")).toBeInTheDocument();
  });

  it('shows "No matches" when filter matches nothing', () => {
    render(<EntryList {...defaults} searchQuery="zzzzz" />);
    expect(screen.getByText("No matches")).toBeInTheDocument();
  });

  it("fires onSelect callback", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<EntryList {...defaults} onSelect={onSelect} />);

    await user.click(screen.getByText("GitHub"));
    expect(onSelect).toHaveBeenCalledWith("1");
  });

  it("fires onCreate callback", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();
    render(<EntryList {...defaults} onCreate={onCreate} />);

    await user.click(screen.getByText("+ New Entry"));
    expect(onCreate).toHaveBeenCalled();
  });

  it("fires onSearchChange callback", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    render(<EntryList {...defaults} onSearchChange={onSearchChange} />);

    await user.type(screen.getByPlaceholderText("Search entries..."), "a");
    expect(onSearchChange).toHaveBeenCalledWith("a");
  });
});
