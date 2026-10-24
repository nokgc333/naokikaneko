import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import ContactWidget from "./contact-widget";

describe("ContactWidget", () => {
  it("initially shows only the round open button and hides the form", () => {
    render(<ContactWidget />);

    expect(screen.getByRole("button", { name: "お問い合わせを開く" })).toBeInTheDocument();
    expect(screen.queryByLabelText("個人・法人名")).not.toBeInTheDocument();
  });

  it("shows the form when the open button is pressed and hides it again with the close button", async () => {
    const user = userEvent.setup();
    render(<ContactWidget />);

    await user.click(screen.getByRole("button", { name: "お問い合わせを開く" }));
    expect(screen.getByLabelText("個人・法人名")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "閉じる" }));
    expect(screen.queryByLabelText("個人・法人名")).not.toBeInTheDocument();
  });
});
