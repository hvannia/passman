import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UnlockScreen from "./UnlockScreen";

describe("UnlockScreen", () => {
  const onUnlock = vi.fn();

  it("renders password input and unlock button", () => {
    render(<UnlockScreen onUnlock={onUnlock} />);
    expect(screen.getByPlaceholderText("Enter master password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Unlock" })).toBeInTheDocument();
  });

  it("button is disabled when password is empty", () => {
    render(<UnlockScreen onUnlock={onUnlock} />);
    expect(screen.getByRole("button", { name: "Unlock" })).toBeDisabled();
  });

  it("calls window.api.unlockVault with password on submit", async () => {
    const user = userEvent.setup();
    vi.mocked(window.api.unlockVault).mockResolvedValue(undefined);
    render(<UnlockScreen onUnlock={onUnlock} />);

    await user.type(screen.getByPlaceholderText("Enter master password"), "mypassword");
    await user.click(screen.getByRole("button", { name: "Unlock" }));

    expect(window.api.unlockVault).toHaveBeenCalledWith("mypassword");
  });

  it("calls onUnlock on success", async () => {
    const user = userEvent.setup();
    vi.mocked(window.api.unlockVault).mockResolvedValue(undefined);
    render(<UnlockScreen onUnlock={onUnlock} />);

    await user.type(screen.getByPlaceholderText("Enter master password"), "pw");
    await user.click(screen.getByRole("button", { name: "Unlock" }));

    expect(onUnlock).toHaveBeenCalled();
  });

  it("shows error on failed unlock", async () => {
    const user = userEvent.setup();
    vi.mocked(window.api.unlockVault).mockRejectedValue(new Error("bad pw"));
    render(<UnlockScreen onUnlock={onUnlock} />);

    await user.type(screen.getByPlaceholderText("Enter master password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Unlock" }));

    expect(await screen.findByText("Wrong password. Please try again.")).toBeInTheDocument();
    expect(onUnlock).not.toHaveBeenCalled();
  });

  it('shows "Unlocking..." during loading', async () => {
    const user = userEvent.setup();
    let resolveUnlock!: () => void;
    vi.mocked(window.api.unlockVault).mockImplementation(
      () => new Promise<void>((r) => { resolveUnlock = r; }),
    );
    render(<UnlockScreen onUnlock={onUnlock} />);

    await user.type(screen.getByPlaceholderText("Enter master password"), "pw");
    await user.click(screen.getByRole("button", { name: "Unlock" }));

    expect(screen.getByRole("button", { name: "Unlocking..." })).toBeDisabled();

    // Resolve the pending promise and let React flush state updates
    await act(() => {
      resolveUnlock();
    });
  });
});
