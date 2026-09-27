import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";
import { toString } from "mdast-util-to-string";
import GithubSlugger from "github-slugger";
import type { Heading } from "mdast";

export type TocHeading = {
  id: string;
  text: string;
  depth: number;
};

export function extractHeadings(markdown: string): TocHeading[] {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);
  const slugger = new GithubSlugger();
  const headings: TocHeading[] = [];

  visit(tree, "heading", (node: Heading) => {
    const text = toString(node);
    headings.push({
      // rehype-sanitize prefixes heading ids with "user-content-" by default
      // (DOM clobbering protection), so the extracted id must match.
      id: `user-content-${slugger.slug(text)}`,
      text,
      depth: node.depth,
    });
  });

  return headings;
}
