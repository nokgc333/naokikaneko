import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import ContactWidget from "./contact-widget";

describe("ContactWidget", () => {
  it("初期状態では円形の開くボタンのみ表示し、フォームは非表示", () => {
    render(<ContactWidget />);

    expect(screen.getByRole("button", { name: "お問い合わせを開く" })).toBeInTheDocument();
    expect(screen.queryByLabelText("個人・法人名")).not.toBeInTheDocument();
  });

  it("開くボタンを押すとフォームが表示され、閉じるボタンで非表示に戻る", async () => {
    const user = userEvent.setup();
    render(<ContactWidget />);

    await user.click(screen.getByRole("button", { name: "お問い合わせを開く" }));
    expect(screen.getByLabelText("個人・法人名")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "閉じる" }));
    expect(screen.queryByLabelText("個人・法人名")).not.toBeInTheDocument();
  });
});
