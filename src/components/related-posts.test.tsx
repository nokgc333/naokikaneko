import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import RelatedPosts from "./related-posts";
import type { ContentEntry } from "@/lib/schemas/content";

const posts: ContentEntry[] = [
  {
    title: "Post A",
    slug: "post-a",
    date: "2025-06-01",
    tags: [],
    category: "Others",
    description: "Post A description",
    body: "",
  },
  {
    title: "Post B",
    slug: "post-b",
    date: "2025-06-02",
    tags: [],
    category: "Others",
    description: "Post B description",
    body: "",
  },
];

describe("RelatedPosts", () => {
  it("記事が無い場合は何も描画しない", () => {
    const { container } = render(<RelatedPosts posts={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("各記事のタイトル・日付・リンク先を表示する", () => {
    render(<RelatedPosts posts={posts} />);

    expect(screen.getByText("Post A")).toBeInTheDocument();
    expect(screen.getByText("Post B")).toBeInTheDocument();
    expect(screen.getByText("2025-06-01")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Post A/ })).toHaveAttribute(
      "href",
      "/blog/post-a"
    );
  });
});
