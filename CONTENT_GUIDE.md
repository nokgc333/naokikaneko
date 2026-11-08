# コンテンツ運用ガイド（Work / Blog）

Work と Blog の原稿は `content/work/` と `content/blog/` の `.mdx` ファイルで管理する。

## 追加の流れ

1. `content/work/<slug>.mdx` または `content/blog/<slug>.mdx` を作る。ファイル名は slug と同じにする。
2. 画像を `public/images/uploads/` に置く。
3. `npm run content:check` で検査する。

## frontmatter

ファイルの先頭に `---` で囲んで書く。

| 項目 | 必須 | 形式 | 説明 |
|---|---|---|---|
| `title` | 必須 | 文字列 | ページの題名。原稿の題名 |
| `slug` | 必須 | 小文字・数字・ハイフン | **ファイル名と同じにする** |
| `date` | 必須 | `YYYY-MM-DD` | 追加日。原稿の追加日 |
| `updatedDate` | 必須 | `YYYY-MM-DD` | 更新日。`date` 以降にする |
| `tags` | 任意 | 文字列の配列 | 空の値や前後の空白は不可 |
| `category` | Work は必須 | `Tool` / `HDA` / `HP` / `Others` | Blog は省略すると `Others` |
| `thumbnail` | 任意 | `/images/uploads/` 配下の画像 | 下の「サムネイルの規格」 |
| `url` | 任意 | `http://` か `https://` | 外部リンク |
| `description` | 必須 | 文字列 | 原稿の説明文 |

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

