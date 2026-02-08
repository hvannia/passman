import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EntryDetail from "./EntryDetail";
import { makeEntry } from "../../test/fixtures";

describe("EntryDetail", () => {
  const onEdit = vi.fn();
  const onDelete = vi.fn();
  const entry = makeEntry();

  it("displays title, username, url, notes, and tags", () => {
    render(<EntryDetail entry={entry} onEdit={onEdit} onDelete={onDelete} />);
    expect(screen.getByText("GitHub")).toBeInTheDocument();
    expect(screen.getByText("user@example.com")).toBeInTheDocument();
    expect(screen.getByText("https://github.com")).toBeInTheDocument();
    expect(screen.getByText("Work account")).toBeInTheDocument();
    expect(screen.getByText("dev")).toBeInTheDocument();
    expect(screen.getByText("work")).toBeInTheDocument();
  });

  it("hides optional fields when null", () => {
    const minimal = makeEntry({ url: null, notes: null, tags: [] });
    render(<EntryDetail entry={minimal} onEdit={onEdit} onDelete={onDelete} />);
    expect(screen.queryByText("URL")).not.toBeInTheDocument();
    expect(screen.queryByText("Notes")).not.toBeInTheDocument();
    expect(screen.queryByText("Tags")).not.toBeInTheDocument();
  });

  it("password is masked by default", () => {
    render(<EntryDetail entry={entry} onEdit={onEdit} onDelete={onDelete} />);
    expect(screen.getByText("••••••••••••")).toBeInTheDocument();
    expect(screen.queryByText("s3cret!")).not.toBeInTheDocument();
  });

  it("reveal/hide toggle works", async () => {
    const user = userEvent.setup();
    render(<EntryDetail entry={entry} onEdit={onEdit} onDelete={onDelete} />);

    await user.click(screen.getByRole("button", { name: "Reveal" }));
    expect(screen.getByText("s3cret!")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Hide" }));
    expect(screen.queryByText("s3cret!")).not.toBeInTheDocument();
    expect(screen.getByText("••••••••••••")).toBeInTheDocument();
  });

  it('copy calls window.api.copyToClipboard and shows "Copied!"', async () => {
    const user = userEvent.setup();
    vi.mocked(window.api.copyToClipboard).mockResolvedValue(undefined);
    render(<EntryDetail entry={entry} onEdit={onEdit} onDelete={onDelete} />);

    // Copy password — it's the second Copy button (after Username, before URL)
    const copyButtons = screen.getAllByRole("button", { name: "Copy" });
    await user.click(copyButtons[1]);

    expect(window.api.copyToClipboard).toHaveBeenCalledWith("s3cret!");
    expect(screen.getByText("Copied!")).toBeInTheDocument();
  });

  it("fires onEdit callback", async () => {
    const user = userEvent.setup();
    render(<EntryDetail entry={entry} onEdit={onEdit} onDelete={onDelete} />);
    await user.click(screen.getByRole("button", { name: "Edit" }));
    expect(onEdit).toHaveBeenCalled();
  });

  it("fires onDelete callback", async () => {
    const user = userEvent.setup();
    render(<EntryDetail entry={entry} onEdit={onEdit} onDelete={onDelete} />);
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalled();
  });
});
