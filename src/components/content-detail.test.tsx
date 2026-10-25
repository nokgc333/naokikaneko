import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ContentDetail from "./content-detail";
import type { ContentEntry } from "@/lib/schemas/content";

vi.mock("next-mdx-remote/rsc", () => ({
  MDXRemote: ({ source }: { source: string }) => <div data-testid="mdx">{source}</div>,
}));

const entry: ContentEntry = {
  title: "Sample Title",
  slug: "sample",
  date: "2025-01-01",
  updatedDate: "2025-02-02",
  tags: ["alpha", "beta"],
  category: "Tool",
  description: "sample description",
  thumbnail: "/images/sample.png",
  body: "Hello **body**",
};

function renderDetail(props: Partial<React.ComponentProps<typeof ContentDetail>> = {}) {
  return render(
    <ContentDetail entry={entry} rehypePlugins={[]} proseClassName="prose" {...props} />,
  );
}

describe("ContentDetail", () => {
  it("shows the title, tags and both dates", () => {
    renderDetail();

    expect(screen.getByRole("heading", { level: 1, name: "Sample Title" })).toBeInTheDocument();
    expect(screen.getByText("#alpha")).toBeInTheDocument();
    expect(screen.getByText("#beta")).toBeInTheDocument();
    expect(screen.getByText("2025-01-01")).toBeInTheDocument();
    expect(screen.getByText("2025-02-02")).toBeInTheDocument();
  });

  it("passes the body to the MDX renderer", () => {
    renderDetail();

    expect(screen.getByTestId("mdx")).toHaveTextContent("Hello **body**");
  });

  it("applies the prose class name to the body wrapper", () => {
    renderDetail({ proseClassName: "prose custom-prose" });

    expect(screen.getByTestId("mdx").parentElement).toHaveClass("custom-prose");
  });

  it("falls back to the placeholder image when there is no thumbnail", () => {
    renderDetail({ entry: { ...entry, thumbnail: undefined } });

    expect(screen.getByRole("img", { name: "Sample Title" }).getAttribute("src")).toContain(
      "placeholder.svg",
    );
  });

  it("renders the sidebar and the content after the meta row when given", () => {
    renderDetail({
      sidebar: <aside>side content</aside>,
      afterMeta: <p>after meta content</p>,
    });

    expect(screen.getByText("side content")).toBeInTheDocument();
    expect(screen.getByText("after meta content")).toBeInTheDocument();
  });

  it("uses a cropped aspect-ratio frame for the eyecatch when requested", () => {
    renderDetail({ cropEyecatch: true, eyecatchMaxWidth: 864 });

    const frame = screen.getByRole("img", { name: "Sample Title" }).parentElement as HTMLElement;
    expect(frame.style.maxWidth).toBe("864px");
    expect(frame.style.aspectRatio).toBe("864 / 414");
  });

  it("uses the given max width class for the main element", () => {
    renderDetail({ mainMaxWidthClassName: "max-w-5xl" });

    expect(screen.getByRole("main")).toHaveClass("max-w-5xl");
  });
});

describe("ContentDetail cropped eyecatch", () => {
  it("uses the entry thumbnail inside the cropped frame", () => {
    render(<ContentDetail entry={entry} rehypePlugins={[]} proseClassName="p" cropEyecatch />);

    expect(screen.getByRole("img", { name: "Sample Title" }).getAttribute("src")).toContain(
      "sample.png",
    );
  });

  it("falls back to the placeholder inside the cropped frame too", () => {
    render(
      <ContentDetail
        entry={{ ...entry, thumbnail: undefined }}
        rehypePlugins={[]}
        proseClassName="p"
        cropEyecatch
      />,
    );

    expect(screen.getByRole("img", { name: "Sample Title" }).getAttribute("src")).toContain(
      "placeholder.svg",
    );
  });
});

describe("ContentDetail eyecatch loading", () => {
  it("loads the eyecatch eagerly with high priority because it is the main image", () => {
    render(
      <ContentDetail
        entry={{ ...entry, thumbnail: "/images/uploads/sample.png" }}
        rehypePlugins={[]}
        proseClassName="p"
      />,
    );

    const image = screen.getByRole("img", { name: "Sample Title" });
    expect(image).toHaveAttribute("loading", "eager");
    expect(image).toHaveAttribute("fetchpriority", "high");
    expect(image.getAttribute("sizes")).toBe("(min-width: 1024px) 736px, 100vw");
  });

  it("does the same for the cropped eyecatch and sizes it to its frame", () => {
    render(
      <ContentDetail
        entry={{ ...entry, thumbnail: "/images/uploads/sample.png" }}
        rehypePlugins={[]}
        proseClassName="p"
        cropEyecatch
        eyecatchMaxWidth={864}
      />,
    );

    const image = screen.getByRole("img", { name: "Sample Title" });
    expect(image).toHaveAttribute("loading", "eager");
    expect(image).toHaveAttribute("fetchpriority", "high");
    expect(image.getAttribute("sizes")).toBe("864px");
  });
});
