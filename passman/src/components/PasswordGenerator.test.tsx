import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PasswordGenerator from "./PasswordGenerator";

describe("PasswordGenerator", () => {
  const onUse = vi.fn();

  it("slider defaults to 20", () => {
    render(<PasswordGenerator onUse={onUse} />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveValue("20");
  });

  it("generate calls window.api.generatePassword(length)", async () => {
    const user = userEvent.setup();
    vi.mocked(window.api.generatePassword).mockResolvedValue("abc123");
    render(<PasswordGenerator onUse={onUse} />);

    await user.click(screen.getByRole("button", { name: "Generate" }));
    expect(window.api.generatePassword).toHaveBeenCalledWith(20);
  });

  it("shows generated password and Use button after generation", async () => {
    const user = userEvent.setup();
    vi.mocked(window.api.generatePassword).mockResolvedValue("generated-pw!");
    render(<PasswordGenerator onUse={onUse} />);

    // Use button should not be present before generation
    expect(screen.queryByRole("button", { name: "Use" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Generate" }));

    expect(screen.getByText("generated-pw!")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Use" })).toBeInTheDocument();
  });

  it("Use button calls onUse with generated password", async () => {
    const user = userEvent.setup();
    vi.mocked(window.api.generatePassword).mockResolvedValue("pw-to-use");
    render(<PasswordGenerator onUse={onUse} />);

    await user.click(screen.getByRole("button", { name: "Generate" }));
    await user.click(screen.getByRole("button", { name: "Use" }));

    expect(onUse).toHaveBeenCalledWith("pw-to-use");
  });
});
