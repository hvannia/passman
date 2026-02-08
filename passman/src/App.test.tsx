import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("App", () => {
  it("renders unlock screen initially", () => {
    render(<App />);
    expect(screen.getByText("Passman")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter master password")).toBeInTheDocument();
  });

  it("shows vault view after successful unlock", async () => {
    const user = userEvent.setup();
    vi.mocked(window.api.unlockVault).mockResolvedValue(undefined);
    vi.mocked(window.api.listEntries).mockResolvedValue([]);
    render(<App />);

    await user.type(screen.getByPlaceholderText("Enter master password"), "pw");
    await user.click(screen.getByRole("button", { name: "Unlock" }));

    expect(await screen.findByText("Select an entry or create a new one")).toBeInTheDocument();
  });
});
