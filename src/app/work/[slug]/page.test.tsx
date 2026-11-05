import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import WorkDetailPage, { generateMetadata, generateStaticParams } from "./page";

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
  default: (props: { entry: { title: string }; afterMeta?: React.ReactNode }) => (
    <div>
      <h1>{props.entry.title}</h1>
      {props.afterMeta}
    </div>
  ),
}));

const baseEntry = {
  title: "Tool",
  slug: "tool",
  date: "2025-06-01",
  updatedDate: "2025-06-02",
  description: "A tool",
  tags: [] as string[],
};

const params = (slug: string) => ({ params: Promise.resolve({ slug }) });

describe("work detail page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generates one static param per work entry", () => {
    getEntries.mockReturnValue([{ slug: "a" }, { slug: "b" }]);

    expect(generateStaticParams()).toEqual([{ slug: "a" }, { slug: "b" }]);
    expect(getEntries).toHaveBeenCalledWith("work");
  });

  it("builds metadata for the requested slug", async () => {
    buildEntryMetadata.mockReturnValue({ title: "T" });

    await expect(generateMetadata(params("a"))).resolves.toEqual({ title: "T" });
    expect(buildEntryMetadata).toHaveBeenCalledWith("work", "a");
  });

  it("calls notFound when the entry does not exist", async () => {
    getEntry.mockReturnValue(undefined);

    await expect(WorkDetailPage(params("missing"))).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalled();
  });

  it("shows the external link when the entry has a url", async () => {
    getEntry.mockReturnValue({ ...baseEntry, url: "https://example.com/tool" });

    render(await WorkDetailPage(params("tool")));

    expect(screen.getByRole("link", { name: "https://example.com/tool" })).toHaveAttribute(
      "href",
      "https://example.com/tool",
    );
  });

  it("omits the external link when the entry has no url", async () => {
    getEntry.mockReturnValue(baseEntry);

    render(await WorkDetailPage(params("tool")));

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("embeds CreativeWork structured data for the entry", async () => {
    getEntry.mockReturnValue(baseEntry);

    const { container } = render(await WorkDetailPage(params("tool")));

    const data = JSON.parse(
      container.querySelector('script[type="application/ld+json"]')?.textContent ?? "{}",
    );
    expect(data).toMatchObject({ "@type": "CreativeWork", name: "Tool" });
  });
});
