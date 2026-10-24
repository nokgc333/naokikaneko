import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import RelatedPosts from "./related-posts";
import type { ContentEntry } from "@/lib/schemas/content";

const posts: ContentEntry[] = [
  {
    title: "Post A",
    slug: "post-a",
    date: "2025-06-01",
    updatedDate: "2025-06-01",
    tags: [],
    category: "Others",
    description: "Post A description",
    body: "",
  },
  {
    title: "Post B",
    slug: "post-b",
    date: "2025-06-02",
    updatedDate: "2025-06-02",
    tags: [],
    category: "Others",
    description: "Post B description",
    body: "",
  },
];

describe("RelatedPosts", () => {
  it("renders nothing when there are no posts", () => {
    const { container } = render(<RelatedPosts posts={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("shows the title, date and link of each post", () => {
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
