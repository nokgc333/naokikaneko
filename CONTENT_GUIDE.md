# コンテンツ運用ガイド（Work / Blog）

Work（実績）と Blog（記事）の追加・編集の手順です。記事は `content/work/` と `content/blog/` の `.mdx` ファイルで、1ファイル = 1ページです。

## 追加の流れ

### A. CMS から（ブラウザ）

1. `<サイトの URL>/admin/index.html` を開き、GitHub でログインする（設定は README の「セットアップ」）。
2. Work か Blog を選び、「New」で新規作成する。各項目は下の「frontmatter」を見て入力する。
3. 保存（Publish）すると、`main` に直接コミットされ、Vercel が自動でデプロイする。

CMS のフォームにない項目は、保存時に消える。そのため、追加したい項目は先に `public/admin/config.yml` に定義する（`src/project/cms-config.test.ts` が、スキーマと設定のずれを検出する）。

### B. ローカルから（Git）

1. `develop` にいることを確認する（`git switch develop`）。
2. `content/work/<slug>.mdx`（または `content/blog/<slug>.mdx`）を作る。ファイル名は slug と同じにする。
3. 画像は `public/images/uploads/` に置く。
4. `npm run content:check` で検査する（下の「検査」）。
5. コミットして PR を作り、CI が通ったらマージする。

CMS の編集は `main` に直接入るため、ローカルで大きな作業をする前に、`develop` で `git pull origin main` を実行して取り込む。

### ローカルで CMS を使う

別のターミナルで `npm run cms:proxy` を起動し、`http://localhost:3000/admin/index.html` を開く。ログインなしで、手元の `content/` を直接編集できる。

## frontmatter

ファイルの先頭に `---` で囲んで書く。

| 項目 | 必須 | 形式 | 説明 |
|---|---|---|---|
| `title` | 必須 | 文字列 | ページの題名。一覧と詳細に表示される |
| `slug` | 必須 | 小文字・数字・ハイフン | URL になる（`/work/<slug>`）。**ファイル名と同じにする** |
| `date` | 必須 | `YYYY-MM-DD` | 追加日。一覧は新しい順に並ぶ |
| `updatedDate` | 必須 | `YYYY-MM-DD` | 更新日。`date` 以降にする |
| `tags` | 任意 | 文字列の配列 | `#タグ` として表示される。空の値や前後の空白は不可 |
| `category` | Work は必須 | `Tool` / `HDA` / `HP` / `Others` | 一覧の絞り込みに使う。Blog は省略すると `Others` |
| `thumbnail` | 任意 | `/images/uploads/` 配下の画像 | 下の「サムネイルの規格」 |
| `url` | 任意 | `http://` か `https://` | Work の詳細に外部リンクとして表示される |
| `description` | 必須 | 文字列 | 検索結果と共有時の説明文 |

例:

```yaml
---
title: "pipeboard"
slug: "pipeboard"
date: "2026-09-28"
updatedDate: "2026-09-28"
tags: ["FastAPI", "Next.js"]
category: "Tool"
thumbnail: "/images/uploads/pipeboard.svg"
url: "https://github.com/nokgc333/pipeboard"
description: "ショット/アセットの進捗をカンバン形式で管理するミニ・プロダクショントラッカー。"
---
```

## サムネイルの規格

- 置き場所: `public/images/uploads/`。ファイル名は `<slug>.<拡張子>` にそろえる。
- 形式: PNG / JPG / JPEG / WebP / SVG。
- 比率: 約 2:1 の横長（目安 1600×800 px）。一覧・詳細で自動的にクロップされるので、主要な被写体は中央に置く。
- 容量: 300 KB 以下を目安にする（性能予算に影響する）。
- 共有（SNS）用の画像は、題名から自動で生成される。サムネイルとは別なので、共有のために作る必要はない。
- 画像が無い場合は、プレースホルダーが表示される。

## 本文（MDX）で使える書式

- 見出し（`##` `###`）、段落、リスト、引用、リンク、画像、コード、表、打ち消し線、チェックリスト（GitHub 形式の Markdown）。
- Blog は、`###` までの見出しから、右側に目次が作られる。
- HTML は安全な範囲だけが通る（`<script>` やスタイル属性などは取り除かれる）。
- 独自の React コンポーネントや `import` は使えない（チェックボックスだけが専用の部品に置き換わる）。

## 検査

```bash
npm run content:check
```

次の誤りを検出し、見つけたら終了コード 1 で失敗する。CI の Lint ジョブでも実行される。

- frontmatter が定義に合わない（必須項目の欠落、カテゴリの誤りなど）
- Work の `category` が未設定
- `slug` がファイル名と違う、使えない文字を含む、他の記事と重複している
- `date` / `updatedDate` が実在しない日付、または更新日が追加日より前
- `thumbnail` が `/images/uploads/` の外にある、拡張子が違う、ファイルが存在しない
- `url` が `http(s)://` ではない、`tags` に空の値がある

## 公開前のチェックリスト

- [ ] `npm run content:check` が成功する
- [ ] `npm run dev` で、一覧と詳細の表示を確認した
- [ ] 画像は `public/images/uploads/` に置き、容量が大きすぎない
- [ ] 個人情報や、公開できない情報が含まれていない
- [ ] 他社サイトの画像を使う場合は、権利を確認した（`CONTENT_LICENSE.md`）
