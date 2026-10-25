import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, it, expect } from "vitest";
import ContactField from "./contact-field";

type Values = { name: string };

function Harness(props: { error?: string; type?: string; rows?: number }) {
  const { register } = useForm<Values>();
  return <ContactField id="name" label="お名前" registration={register("name")} {...props} />;
}

describe("ContactField", () => {
  it("renders a labelled text input by default", () => {
    render(<Harness />);

    const input = screen.getByLabelText("お名前");
    expect(input.tagName).toBe("INPUT");
  });

  it("renders a textarea when rows are given", () => {
    render(<Harness rows={5} />);

    expect(screen.getByLabelText("お名前").tagName).toBe("TEXTAREA");
  });

  it("passes the input type through", () => {
    render(<Harness type="email" />);

    expect(screen.getByLabelText("お名前")).toHaveAttribute("type", "email");
  });

  it("ties the error alert to the field and marks it invalid", () => {
    render(<Harness error="入力してください" />);

    const input = screen.getByLabelText("お名前");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("入力してください");
    expect(screen.getByRole("alert")).toHaveTextContent("入力してください");
  });

  it("does not mark the field invalid without an error", () => {
    render(<Harness />);

    expect(screen.getByLabelText("お名前")).not.toHaveAttribute("aria-invalid");
  });
});
