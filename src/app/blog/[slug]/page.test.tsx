import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import BlogDetailPage, { generateMetadata, generateStaticParams } from "./page";

const getEntries = vi.fn();
const getEntry = vi.fn();
const buildEntryMetadata = vi.fn();
const notFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

vi.mock("@/lib/content", () => ({
  getEntries: (...args: unknown[]) => getEntries(...args),
  getEntry: (...args: unknown[]) => getEntry(...args),
}));
vi.mock("@/lib/seo/metadata", () => ({
  buildEntryMetadata: (...args: unknown[]) => buildEntryMetadata(...args),
}));
vi.mock("next/navigation", () => ({ notFound: () => notFound() }));
vi.mock("@/components/content-detail", () => ({
  default: (props: { entry: { title: string }; sidebar?: React.ReactNode }) => (
    <div>
      <h1>{props.entry.title}</h1>
      {props.sidebar}
    </div>
  ),
}));
vi.mock("@/components/related-posts", () => ({
  default: ({ posts }: { posts: { slug: string }[] }) => (
    <div data-testid="related">{posts.map((post) => post.slug).join(",")}</div>
  ),
}));
vi.mock("@/components/table-of-contents", () => ({
  default: ({ headings }: { headings: { text: string }[] }) => (
    <div data-testid="toc">{headings.map((heading) => heading.text).join(",")}</div>
  ),
}));

const basePost = {
  title: "Post",
  slug: "current",
  date: "2025-06-01",
  updatedDate: "2025-06-02",
  description: "A post",
  tags: [] as string[],
};

const params = (slug: string) => ({ params: Promise.resolve({ slug }) });

describe("blog detail page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generates one static param per blog entry", () => {
    getEntries.mockReturnValue([{ slug: "a" }, { slug: "b" }]);

    expect(generateStaticParams()).toEqual([{ slug: "a" }, { slug: "b" }]);
    expect(getEntries).toHaveBeenCalledWith("blog");
  });

  it("builds metadata for the requested slug", async () => {
    buildEntryMetadata.mockReturnValue({ title: "T" });

    await expect(generateMetadata(params("a"))).resolves.toEqual({ title: "T" });
    expect(buildEntryMetadata).toHaveBeenCalledWith("blog", "a");
  });

  it("calls notFound when the entry does not exist", async () => {
    getEntry.mockReturnValue(undefined);

    await expect(BlogDetailPage(params("missing"))).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalled();
  });

  it("shows the table of contents and related posts without the current post", async () => {
    getEntry.mockReturnValue({ ...basePost, body: "## First\n\n## Second" });
    getEntries.mockReturnValue(
      ["current", "p1", "p2", "p3", "p4", "p5", "p6"].map((slug) => ({ slug })),
    );

    render(await BlogDetailPage(params("current")));

    expect(screen.getByRole("heading", { level: 1, name: "Post" })).toBeInTheDocument();
    expect(screen.getByTestId("toc")).toHaveTextContent("First,Second");
    expect(screen.getByTestId("related")).toHaveTextContent("p1,p2,p3,p4,p5");
  });

  it("embeds BlogPosting structured data for the entry", async () => {
    getEntry.mockReturnValue({ ...basePost, body: "" });
    getEntries.mockReturnValue([]);

    const { container } = render(await BlogDetailPage(params("current")));

    const data = JSON.parse(
      container.querySelector('script[type="application/ld+json"]')?.textContent ?? "{}",
    );
    expect(data).toMatchObject({ "@type": "BlogPosting", headline: "Post" });
  });
});
