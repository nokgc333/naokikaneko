# Work・Blogページ（Plan 2） Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Decap CMSで管理する`work`・`blog`コンテンツを、`/work`・`/blog`（一覧）・`/work/[slug]`・`/blog/[slug]`（詳細）の4ページとして表示できるようにする。

**Architecture:** コンテンツは`content/work/*.md`・`content/blog/*.md`にfrontmatter+Markdown本文として保存される（Decap CMSが読み書き）。Next.jsのServer Componentがビルド時/リクエスト時にファイルシステムから直接読み込み、`gray-matter`でfrontmatterを分離、Zodで型検証、`unified`系ライブラリでMarkdown本文をHTMLに変換して表示する。work/blogは同一スキーマ・同一実装パターンを共有する。

**Tech Stack:** Next.js(App Router, Server Components) / gray-matter / zod / unified + remark-parse + remark-gfm + remark-rehype + rehype-stringify

**Spec:** `docs/superpowers/specs/2026-09-09-portfolio-card-site-design.md`

## Global Constraints

- `work`と`blog`は同一フィールド構成（`title`, `slug`, `date`, `tags`, `thumbnail`, `url`, `description`, `body`）。実装もロジックを共有する
- コンテンツファイルの配置場所: `content/work/*.md`, `content/blog/*.md`（`public/admin/config.yml`の`folder`設定と一致させる）
- frontmatterのバリデーションはZodで行う。不正なfrontmatterがあればビルド時に例外を投げて気づけるようにする（サイレントに無視しない）
- Markdown本文のHTML変換は`dangerouslySetInnerHTML`を使う。コンテンツはDecap CMS経由でサイト管理者本人のみが書き込むため、外部ユーザー入力のサニタイズは不要（本文はXSSの入力経路にならない）
- 一覧ページは日付の新しい順に並べる
- git関連コマンドはすべてユーザー自身が実行する。Claudeはファイル作成・編集と非gitコマンドのみ実行する

---

## File Structure

```
naokikaneko/
├── content/
│   ├── work/
│   │   └── example-project.md      # 動作確認用のサンプルエントリ
│   └── blog/
│       └── example-post.md         # 動作確認用のサンプルエントリ
├── src/
│   ├── lib/
│   │   ├── schemas/
│   │   │   └── content.ts          # Zodスキーマ（work/blog共通）
│   │   ├── content.ts              # frontmatter読み込み・検証・一覧/単体取得
│   │   ├── content.test.ts
│   │   └── markdown.ts             # Markdown→HTML変換
│   ├── components/
│   │   └── content-card.tsx        # 一覧グリッド用カード（work/blog共通）
│   └── app/
│       ├── work/
│       │   ├── page.tsx            # 一覧（グリッド）
│       │   └── [slug]/
│       │       └── page.tsx        # 詳細
│       └── blog/
│           ├── page.tsx            # 一覧（グリッド）
│           └── [slug]/
│               └── page.tsx        # 詳細
└── e2e/
    └── work-blog.spec.ts           # 一覧→詳細への導線のE2Eテスト
```

---

### Task 1: Zodスキーマ + コンテンツ読み込みロジック

**Files:**
- Create: `src/lib/schemas/content.ts`, `src/lib/content.ts`, `src/lib/content.test.ts`
- Test: `src/lib/content.test.ts`

**Interfaces:**
- Consumes: なし
- Produces: `contentEntrySchema`（Zodスキーマ、`src/lib/schemas/content.ts`からexport）、`ContentEntry`型、`getEntries(collection: 'work' | 'blog'): ContentEntry[]`、`getEntry(collection: 'work' | 'blog', slug: string): ContentEntry | undefined`（`src/lib/content.ts`からexport）

- [ ] **Step 1: gray-matterをインストールする**

Run:
```bash
cd /Users/naokikaneko/dev/naokikaneko && npm install gray-matter
```

- [ ] **Step 2: Zodスキーマを作成する**

`src/lib/schemas/content.ts`:

```ts
import { z } from "zod";

export const contentFrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  date: z.string().min(1),
  tags: z.array(z.string()).default([]),
  thumbnail: z.string().optional(),
  url: z.string().optional(),
  description: z.string().min(1),
});

export type ContentFrontmatter = z.infer<typeof contentFrontmatterSchema>;

export type ContentEntry = ContentFrontmatter & { body: string };
```

- [ ] **Step 3: 失敗するテストを書く**

`src/lib/content.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";
import { getEntries, getEntry } from "./content";

describe("getEntries", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "content-test-"));
    fs.mkdirSync(path.join(tempDir, "work"), { recursive: true });
    vi.spyOn(process, "cwd").mockReturnValue(tempDir);
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it("frontmatterを検証し、日付の新しい順に並べて返す", () => {
    fs.writeFileSync(
      path.join(tempDir, "work", "old.md"),
      `---\ntitle: Old\nslug: old\ndate: "2024-01-01"\ndescription: old entry\n---\nOld body`
    );
    fs.writeFileSync(
      path.join(tempDir, "work", "new.md"),
      `---\ntitle: New\nslug: new\ndate: "2025-01-01"\ndescription: new entry\n---\nNew body`
    );

    const entries = getEntries("work");

    expect(entries).toHaveLength(2);
    expect(entries[0].slug).toBe("new");
    expect(entries[1].slug).toBe("old");
    expect(entries[0].body.trim()).toBe("New body");
  });

  it("存在しないディレクトリの場合は空配列を返す", () => {
    const entries = getEntries("blog");
    expect(entries).toEqual([]);
  });
});

describe("getEntry", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "content-test-"));
    fs.mkdirSync(path.join(tempDir, "work"), { recursive: true });
    vi.spyOn(process, "cwd").mockReturnValue(tempDir);
    fs.writeFileSync(
      path.join(tempDir, "work", "target.md"),
      `---\ntitle: Target\nslug: target\ndate: "2025-01-01"\ndescription: target entry\n---\nTarget body`
    );
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it("slugが一致するエントリを返す", () => {
    const entry = getEntry("work", "target");
    expect(entry?.title).toBe("Target");
  });

  it("slugが一致しない場合はundefinedを返す", () => {
    const entry = getEntry("work", "not-found");
    expect(entry).toBeUndefined();
  });
});
```

- [ ] **Step 4: テストが失敗することを確認する**

Run:
```bash
npx vitest run src/lib/content.test.ts
```

Expected: FAIL（`./content`が存在しないため import エラー）

- [ ] **Step 5: 実装する**

`src/lib/content.ts`:

```ts
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { contentFrontmatterSchema, type ContentEntry } from "./schemas/content";

type Collection = "work" | "blog";

export function getEntries(collection: Collection): ContentEntry[] {
  const dir = path.join(process.cwd(), "content", collection);

  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = fs.readdirSync(dir).filter((file) => file.endsWith(".md"));

  const entries = files.map((file) => {
    const raw = fs.readFileSync(path.join(dir, file), "utf-8");
    const { data, content } = matter(raw);
    const frontmatter = contentFrontmatterSchema.parse(data);
    return { ...frontmatter, body: content.trim() };
  });

  return entries.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getEntry(collection: Collection, slug: string): ContentEntry | undefined {
  return getEntries(collection).find((entry) => entry.slug === slug);
}
```

- [ ] **Step 6: テストが通ることを確認する**

Run:
```bash
npx vitest run src/lib/content.test.ts
```

Expected: PASS（4件）

- [ ] **Step 7: ユーザーが実行するコマンド**

```bash
cd /Users/naokikaneko/dev/naokikaneko
git add -A
git commit -m "feat: add content schema and frontmatter loader for work/blog"
```

---

### Task 2: Markdown→HTML変換ユーティリティ

**Files:**
- Create: `src/lib/markdown.ts`, `src/lib/markdown.test.ts`

**Interfaces:**
- Consumes: なし
- Produces: `renderMarkdown(markdown: string): Promise<string>`（`src/lib/markdown.ts`からexport）

- [ ] **Step 1: 必要なパッケージをインストールする**

Run:
```bash
npm install unified remark-parse remark-gfm remark-rehype rehype-stringify
```

- [ ] **Step 2: 失敗するテストを書く**

`src/lib/markdown.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { renderMarkdown } from "./markdown";

describe("renderMarkdown", () => {
  it("見出しをHTMLに変換する", async () => {
    const html = await renderMarkdown("# Hello");
    expect(html).toContain("<h1>Hello</h1>");
  });

  it("GFMのテーブル記法を変換する", async () => {
    const html = await renderMarkdown("| a | b |\n| - | - |\n| 1 | 2 |");
    expect(html).toContain("<table>");
  });
});
```

- [ ] **Step 3: テストが失敗することを確認する**

Run:
```bash
npx vitest run src/lib/markdown.test.ts
```

Expected: FAIL

- [ ] **Step 4: 実装する**

`src/lib/markdown.ts`:

```ts
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

export async function renderMarkdown(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(markdown);

  return String(file);
}
```

- [ ] **Step 5: テストが通ることを確認する**

Run:
```bash
npx vitest run src/lib/markdown.test.ts
```

Expected: PASS（2件）

- [ ] **Step 6: ユーザーが実行するコマンド**

```bash
git add -A
git commit -m "feat: add markdown to HTML renderer"
```

---

### Task 3: 共通カードコンポーネント

**Files:**
- Create: `src/components/content-card.tsx`, `src/components/content-card.test.tsx`

**Interfaces:**
- Consumes: `ContentEntry`型（Task 1の`src/lib/schemas/content.ts`）
- Produces: `<ContentCard entry={entry} href={href} />`（`src/components/content-card.tsx`のdefault export）。`href`はリンク先パス（`/work/[slug]`または`/blog/[slug]`）を呼び出し側が渡す

- [ ] **Step 1: 失敗するテストを書く**

`src/components/content-card.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ContentCard from "./content-card";
import type { ContentEntry } from "@/lib/schemas/content";

const entry: ContentEntry = {
  title: "Sample Project",
  slug: "sample-project",
  date: "2025-06-01",
  tags: ["Next.js", "TypeScript"],
  description: "A sample project description",
  body: "",
};

describe("ContentCard", () => {
  it("タイトル・説明文・タグを表示する", () => {
    render(<ContentCard entry={entry} href="/work/sample-project" />);
    expect(screen.getByText("Sample Project")).toBeInTheDocument();
    expect(screen.getByText("A sample project description")).toBeInTheDocument();
    expect(screen.getByText("Next.js")).toBeInTheDocument();
  });

  it("詳細ページへのリンクを持つ", () => {
    render(<ContentCard entry={entry} href="/work/sample-project" />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/work/sample-project");
  });
});
```

- [ ] **Step 2: テストが失敗することを確認する**

Run:
```bash
npx vitest run src/components/content-card.test.tsx
```

Expected: FAIL

- [ ] **Step 3: 実装する**

`src/components/content-card.tsx`:

```tsx
import Link from "next/link";
import type { ContentEntry } from "@/lib/schemas/content";

type ContentCardProps = {
  entry: ContentEntry;
  href: string;
};

export default function ContentCard({ entry, href }: ContentCardProps) {
  return (
    <Link href={href} className="block rounded-lg border border-border p-4 hover:bg-muted">
      {entry.thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={entry.thumbnail}
          alt={entry.title}
          className="mb-3 aspect-video w-full rounded object-cover"
        />
      ) : (
        <div className="mb-3 aspect-video w-full rounded bg-muted" />
      )}
      <h3 className="text-lg font-semibold">{entry.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{entry.description}</p>
      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <time>{entry.date}</time>
        {entry.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </Link>
  );
}
```

- [ ] **Step 4: テストが通ることを確認する**

Run:
```bash
npx vitest run src/components/content-card.test.tsx
```

Expected: PASS（2件）

- [ ] **Step 5: ユーザーが実行するコマンド**

```bash
git add -A
git commit -m "feat: add shared content card component"
```

---

### Task 4: `/work` 一覧・詳細ページ + サンプルエントリ

**Files:**
- Create: `src/app/work/page.tsx`, `src/app/work/[slug]/page.tsx`, `content/work/example-project.md`

**Interfaces:**
- Consumes: `getEntries`, `getEntry`（Task 1）、`renderMarkdown`（Task 2）、`ContentCard`（Task 3）
- Produces: `/work`, `/work/[slug]` の2ルート

- [ ] **Step 1: サンプルエントリを作成する**

`content/work/example-project.md`:

```markdown
---
title: "Example Project"
slug: "example-project"
date: "2026-01-01"
tags: ["Next.js", "TypeScript"]
description: "サンプル実績データです。動作確認用に配置しています。"
---

これはサンプルの本文です。実際のコンテンツはDecap CMSから編集してください。
```

- [ ] **Step 2: 一覧ページを実装する**

`src/app/work/page.tsx`:

```tsx
import { getEntries } from "@/lib/content";
import ContentCard from "@/components/content-card";

export default function WorkPage() {
  const entries = getEntries("work");

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="mb-6 text-3xl font-bold">Work</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <ContentCard key={entry.slug} entry={entry} href={`/work/${entry.slug}`} />
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 3: 詳細ページを実装する**

`src/app/work/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { getEntry } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getEntry("work", slug);

  if (!entry) {
    notFound();
  }

  const html = await renderMarkdown(entry.body);

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-bold">{entry.title}</h1>
      <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
        <time>{entry.date}</time>
        {entry.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      {entry.url ? (
        <a href={entry.url} className="mt-4 inline-block text-primary underline">
          {entry.url}
        </a>
      ) : null}
      <div className="prose mt-6" dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
}
```

- [ ] **Step 4: ビルドで動作確認する**

Run:
```bash
npm run build
```

Expected: `/work`が静的ページとして、`/work/[slug]`が動的ルートとしてビルドされる（ビルド出力の`Route (app)`一覧に表示される）

- [ ] **Step 5: ユーザーが実行するコマンド**

```bash
git add -A
git commit -m "feat: add work list and detail pages"
```

---

### Task 5: `/blog` 一覧・詳細ページ + サンプルエントリ

**Files:**
- Create: `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`, `content/blog/example-post.md`

**Interfaces:**
- Consumes: Task 1, 2, 3と同じ
- Produces: `/blog`, `/blog/[slug]` の2ルート

- [ ] **Step 1: サンプルエントリを作成する**

`content/blog/example-post.md`:

```markdown
---
title: "Example Post"
slug: "example-post"
date: "2026-01-01"
tags: ["Blog"]
description: "サンプルのブログ記事です。動作確認用に配置しています。"
---

これはサンプルの本文です。実際のコンテンツはDecap CMSから編集してください。
```

- [ ] **Step 2: 一覧ページを実装する（Task 4の`/work`と同じ構造）**

`src/app/blog/page.tsx`:

```tsx
import { getEntries } from "@/lib/content";
import ContentCard from "@/components/content-card";

export default function BlogPage() {
  const entries = getEntries("blog");

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="mb-6 text-3xl font-bold">Blog</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <ContentCard key={entry.slug} entry={entry} href={`/blog/${entry.slug}`} />
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 3: 詳細ページを実装する**

`src/app/blog/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { getEntry } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getEntry("blog", slug);

  if (!entry) {
    notFound();
  }

  const html = await renderMarkdown(entry.body);

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-bold">{entry.title}</h1>
      <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
        <time>{entry.date}</time>
        {entry.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <div className="prose mt-6" dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
}
```

- [ ] **Step 4: ビルドで動作確認する**

Run:
```bash
npm run build
```

Expected: `/blog`, `/blog/[slug]`がビルド出力に表示される

- [ ] **Step 5: ユーザーが実行するコマンド**

```bash
git add -A
git commit -m "feat: add blog list and detail pages"
```

---

### Task 6: E2Eテスト（一覧→詳細の導線）

**Files:**
- Create: `e2e/work-blog.spec.ts`

**Interfaces:**
- Consumes: Task 4, 5で実装したページ、`content/work/example-project.md`・`content/blog/example-post.md`のサンプルデータ
- Produces: なし（テストのみ）

- [ ] **Step 1: E2Eテストを書く**

`e2e/work-blog.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("work一覧から詳細ページに遷移できる", async ({ page }) => {
  await page.goto("/work");
  await expect(page.getByRole("heading", { name: "Work" })).toBeVisible();
  await page.getByRole("link", { name: /Example Project/ }).click();
  await expect(page).toHaveURL("/work/example-project");
  await expect(page.getByRole("heading", { name: "Example Project" })).toBeVisible();
});

test("blog一覧から詳細ページに遷移できる", async ({ page }) => {
  await page.goto("/blog");
  await expect(page.getByRole("heading", { name: "Blog" })).toBeVisible();
  await page.getByRole("link", { name: /Example Post/ }).click();
  await expect(page).toHaveURL("/blog/example-post");
  await expect(page.getByRole("heading", { name: "Example Post" })).toBeVisible();
});
```

- [ ] **Step 2: テストを実行して確認する**

Run:
```bash
npm run test:e2e
```

Expected: 2件ともPASS

- [ ] **Step 3: ユーザーが実行するコマンド**

```bash
git add -A
git commit -m "test: add e2e coverage for work and blog navigation"
git push
```

---

## Self-Review

- **Spec coverage**: `docs/superpowers/specs/2026-09-09-portfolio-card-site-design.md`のデータモデル（title/slug/date/tags/thumbnail/url/description/body）・ページ構成（`/work`, `/work/[slug]`, `/blog`, `/blog/[slug]`）・グリッドレイアウトを、Task 1〜6でカバー
- **Placeholder scan**: 「TBD」等の記載なし。各Stepに実コードを記載済み
- **Type consistency**: `ContentEntry`型・`getEntries`/`getEntry`関数名・`ContentCard`のprops（`entry`, `href`）をTask間で統一
- **未カバー（意図的、Plan 3以降）**: Topページ本実装、Contact機能、MDX移行
