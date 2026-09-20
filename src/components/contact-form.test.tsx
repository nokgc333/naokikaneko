import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ContactForm from "./contact-form";

describe("ContactForm", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) })
    );
  });

  it("必須項目が空のまま送信するとエラーメッセージを表示する", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.click(screen.getByRole("button", { name: "送信" }));

    expect(await screen.findByText("個人・法人名を入力してください")).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("正しく入力して送信すると成功メッセージを表示する", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText("個人・法人名"), "Taro");
    await user.type(screen.getByLabelText("メールアドレス"), "taro@example.com");
    await user.type(screen.getByLabelText("本文"), "Hello");
    await user.click(screen.getByRole("button", { name: "送信" }));

    await waitFor(() => {
      expect(screen.getByText("送信しました")).toBeInTheDocument();
    });
    expect(fetch).toHaveBeenCalledWith(
      "/api/contact",
      expect.objectContaining({ method: "POST" })
    );
  });
});
