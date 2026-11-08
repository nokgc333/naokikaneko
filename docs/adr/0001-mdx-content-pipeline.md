# ADR-0001: コンテンツは MDX ファイル + `next-mdx-remote`（RSC）で描画する

- 状態: 採用
- 関連: `src/lib/content/`、`src/components/content-detail.tsx`

## 背景

Work と Blog の原稿を Git で管理し、誤った frontmatter を公開前に検出する必要がある。

## 決定

- 原稿は `content/work/*.mdx` と `content/blog/*.mdx` に置く。
- `gray-matter` で frontmatter を読み、`zod` のスキーマで検証する。不正な原稿は読み込み時に例外になる。
- 共通の `ContentDetail` は `next-mdx-remote/rsc` の `MDXRemote` で本文を描画する。
- `remark-gfm` で表・チェックリスト・打ち消し線を扱う。
- チェックボックスは `TaskListCheckbox` に置き換え、アクセシブルな名前を付ける。
- `npm run content:check` で frontmatter・slug・日付・画像を検査する。編集手順は `CONTENT_GUIDE.md` に記す。

## 結果

原稿の検証と本文の描画を分離し、描画に使うプラグインを呼び出し側から指定できる。
