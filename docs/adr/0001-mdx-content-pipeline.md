# ADR-0001: コンテンツは MDX ファイル + `next-mdx-remote`（RSC）で描画する

- 状態: 採用（2026-09）
- 関連: `src/lib/content/`、`src/components/content-detail.tsx`

## 背景

Work と Blog の記事を、Git で管理する Markdown 系ファイルとして持ちたい。CMS（Decap）からも、手元のエディタからも編集でき、誤った frontmatter はビルド前に気づける必要がある。

## 決定

- 記事は `content/work/*.mdx` と `content/blog/*.mdx`。frontmatter は `gray-matter` で読み、`zod` のスキーマ（`lib/content/schema.ts`）で検証する。不正な記事は、読み込み時に例外になる。
- 本文の描画は `next-mdx-remote/rsc` の `MDXRemote`。Work と Blog で同じ部品（`ContentDetail`）を使い、違いはプラグインだけにする。
  - 共通: `remark-gfm`（表・チェックリスト・打ち消し線）
  - 両方: `rehype-sanitize`（安全でない HTML を取り除く）
  - Blog のみ: `rehype-slug`（見出しに id を付ける）
- Blog の目次は、同じ Markdown を `remark-parse` で解析して見出しを集める（`lib/content/toc.ts`）。`rehype-sanitize` が id に付ける `user-content-` の接頭辞を合わせ、目次のリンクと見出しの id を一致させる。
- 独自の React コンポーネントは公開せず、チェックボックスだけを専用部品に置き換える（アクセシブルな名前を付けるため）。

## 結果

- 良い: 記事は純粋なデータで、CMS と Git のどちらからでも編集できる。ビルドが静的に完結し、詳細ページも `generateStaticParams` で事前生成される。サニタイズ済みなので、記事に紛れた HTML が実行される経路がない。
- 悪い: 記事の中で React コンポーネントを使えない。見出しの id が `user-content-` で始まるため、外部から見出しへリンクする URL が長くなる。
- 検査: `npm run content:check` が frontmatter・slug・日付・画像を検査する（`CONTENT_GUIDE.md`）。

## 検討した代替案

- `@next/mdx`（ファイルをルートにする方式）: frontmatter の検証と CMS との相性が悪い。記事の一覧を作るには、別に索引が要る。
- 記事をデータベースや外部の CMS API に置く: 静的生成と Git の履歴という利点を失う。

## 見直す条件

記事で対話的な部品（図・計算機など）が必要になったら、`components` に許可する部品を足す。その場合はサニタイズの設定も合わせて見直す。
