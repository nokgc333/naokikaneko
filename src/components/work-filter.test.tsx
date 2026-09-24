import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import WorkFilter from "./work-filter";
import type { ContentEntry } from "@/lib/schemas/content";

const entries: ContentEntry[] = [
  {
    title: "Tools Project",
    slug: "tools-project",
    date: "2025-06-01",
    tags: [],
    category: "Tools",
    description: "A tools project",
    body: "",
  },
  {
    title: "HDA Project",
    slug: "hda-project",
    date: "2025-06-02",
    tags: [],
    category: "HDA",
    description: "An HDA project",
    body: "",
  },
];

describe("WorkFilter", () => {
  it("初期表示ではToolsが選択され、Toolsカテゴリの作品のみ表示される", () => {
    render(<WorkFilter entries={entries} />);
    expect(screen.getByRole("button", { name: "Tools" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByText("Tools Project")).toBeInTheDocument();
    expect(screen.queryByText("HDA Project")).not.toBeInTheDocument();
  });

  it("タブを切り替えると該当カテゴリの作品のみ表示される", async () => {
    const user = userEvent.setup();
    render(<WorkFilter entries={entries} />);

    await user.click(screen.getByRole("button", { name: "HDA" }));

    expect(screen.getByText("HDA Project")).toBeInTheDocument();
    expect(screen.queryByText("Tools Project")).not.toBeInTheDocument();
  });

  it("Allを選択すると全ての作品が表示される", async () => {
    const user = userEvent.setup();
    render(<WorkFilter entries={entries} />);

    await user.click(screen.getByRole("button", { name: "All" }));

    expect(screen.getByText("Tools Project")).toBeInTheDocument();
    expect(screen.getByText("HDA Project")).toBeInTheDocument();
  });
});
