import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EntryForm from "./EntryForm";
import { makeEntry } from "../../test/fixtures";

describe("EntryForm", () => {
  const onSave = vi.fn();
  const onCancel = vi.fn();

  it('"New Entry" heading without initial', () => {
    render(<EntryForm onSave={onSave} onCancel={onCancel} />);
    expect(screen.getByText("New Entry")).toBeInTheDocument();
  });

  it('"Edit Entry" heading with initial', () => {
    render(<EntryForm initial={makeEntry()} onSave={onSave} onCancel={onCancel} />);
    expect(screen.getByText("Edit Entry")).toBeInTheDocument();
  });

  it("pre-fills fields from initial", () => {
    const entry = makeEntry();
    render(<EntryForm initial={entry} onSave={onSave} onCancel={onCancel} />);

    expect(screen.getByDisplayValue("GitHub")).toBeInTheDocument();
    expect(screen.getByDisplayValue("user@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("https://github.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Work account")).toBeInTheDocument();
    expect(screen.getByDisplayValue("dev, work")).toBeInTheDocument();
  });

  it("submit disabled when required fields empty", () => {
    render(<EntryForm onSave={onSave} onCancel={onCancel} />);
    expect(screen.getByRole("button", { name: "Create Entry" })).toBeDisabled();
  });

  it("calls onSave with correct EntryInput", async () => {
    const user = userEvent.setup();
    render(<EntryForm onSave={onSave} onCancel={onCancel} />);

    await user.type(screen.getByPlaceholderText("e.g. GitHub"), "MyApp");
    await user.type(screen.getByPlaceholderText("e.g. user@example.com"), "me@test.com");
    // Password input has no placeholder; find by type attribute
    const passwordInput = document.querySelector('input[type="password"]')!;
    await user.type(passwordInput, "secret123");

    await user.type(screen.getByPlaceholderText("https://example.com"), "https://myapp.com");
    await user.type(screen.getByPlaceholderText("e.g. work, dev"), "tag1, tag2");

    await user.click(screen.getByRole("button", { name: "Create Entry" }));

    expect(onSave).toHaveBeenCalledWith({
      title: "MyApp",
      username: "me@test.com",
      password: "secret123",
      url: "https://myapp.com",
      notes: null,
      tags: ["tag1", "tag2"],
    });
  });

  it("empty url/notes become null", async () => {
    const user = userEvent.setup();
    render(<EntryForm onSave={onSave} onCancel={onCancel} />);

    await user.type(screen.getByPlaceholderText("e.g. GitHub"), "App");
    await user.type(screen.getByPlaceholderText("e.g. user@example.com"), "u");
    await user.type(document.querySelector('input[type="password"]')!, "p");

    await user.click(screen.getByRole("button", { name: "Create Entry" }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ url: null, notes: null }),
    );
  });

  it("cancel calls onCancel", async () => {
    const user = userEvent.setup();
    render(<EntryForm onSave={onSave} onCancel={onCancel} />);
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalled();
  });

  it("password generator toggle shows/hides PasswordGenerator", async () => {
    const user = userEvent.setup();
    render(<EntryForm onSave={onSave} onCancel={onCancel} />);

    expect(screen.queryByText("Generate")).not.toBeInTheDocument();

    await user.click(screen.getByText("Generate password"));
    expect(screen.getByText("Generate")).toBeInTheDocument();

    await user.click(screen.getByText("Hide generator"));
    expect(screen.queryByText("Generate")).not.toBeInTheDocument();
  });
});
