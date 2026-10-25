import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ContactForm from "./contact-form";

describe("ContactForm", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) }),
    );
  });

  it("shows error messages when submitted with required fields empty", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.click(screen.getByRole("button", { name: "送信" }));

    expect(await screen.findByText("個人・法人名を入力してください")).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("shows a success message when submitted with valid input", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText("個人・法人名"), "Taro");
    await user.type(screen.getByLabelText("メールアドレス"), "taro@example.com");
    await user.type(screen.getByLabelText("本文"), "Hello");
    await user.click(screen.getByRole("button", { name: "送信" }));

    await waitFor(() => {
      expect(screen.getByText("送信しました")).toBeInTheDocument();
    });
    expect(fetch).toHaveBeenCalledWith("/api/contact", expect.objectContaining({ method: "POST" }));
  });

  it("shows an error message and writes a developer log when submission fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText("個人・法人名"), "Taro");
    await user.type(screen.getByLabelText("メールアドレス"), "taro@example.com");
    await user.type(screen.getByLabelText("本文"), "Hello");
    await user.click(screen.getByRole("button", { name: "送信" }));

    expect(
      await screen.findByText("送信に失敗しました。時間をおいて再度お試しください。"),
    ).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});

describe("ContactForm accessibility", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) }),
    );
  });

  it("announces validation errors through alert regions tied to their fields", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.click(screen.getByRole("button", { name: "送信" }));

    const nameField = screen.getByLabelText("個人・法人名");
    await waitFor(() => expect(nameField).toHaveAttribute("aria-invalid", "true"));
    expect(nameField).toHaveAccessibleDescription(/入力してください/);
    expect(screen.getAllByRole("alert").length).toBeGreaterThan(0);
  });

  it("does not mark untouched fields as invalid", () => {
    render(<ContactForm />);

    expect(screen.getByLabelText("個人・法人名")).not.toHaveAttribute("aria-invalid");
  });

  it("announces the successful submission as a status", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.type(screen.getByLabelText("個人・法人名"), "Taro");
    await user.type(screen.getByLabelText("メールアドレス"), "taro@example.com");
    await user.type(screen.getByLabelText("本文"), "Hello");

    await user.click(screen.getByRole("button", { name: "送信" }));

    expect(await screen.findByRole("status")).toHaveTextContent("送信しました");
  });

  it("announces a failed submission as an alert", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.type(screen.getByLabelText("個人・法人名"), "Taro");
    await user.type(screen.getByLabelText("メールアドレス"), "taro@example.com");
    await user.type(screen.getByLabelText("本文"), "Hello");

    await user.click(screen.getByRole("button", { name: "送信" }));

    expect(await screen.findByText(/送信に失敗しました/)).toBeInTheDocument();
    expect(
      screen.getAllByRole("alert").some((el) => /送信に失敗しました/.test(el.textContent ?? "")),
    ).toBe(true);
    errorSpy.mockRestore();
  });
});
