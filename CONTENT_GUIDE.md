# コンテンツ運用ガイド（Work / Blog）

## Git から追加する

1. `content/work/<slug>.mdx` または `content/blog/<slug>.mdx` を作る。
2. ファイル名を frontmatter の `slug` とそろえる。
3. 画像を `public/images/uploads/` に置く。
4. `npm run lint`、`npm run type-check`、`npm test`、`npm run build` を実行する。
5. `npm start` で一覧と詳細を確認する。

## frontmatter

- `title`: 必須の題名。
- `slug`: 必須。小文字・数字・ハイフンを使用する。
- `date`: 必須。実在する日付を `YYYY-MM-DD` で記す。
- `updatedDate`: 必須。`date` 以降の日付を記す。
- `description`: 必須の説明文。
- `tags`: 任意の文字列配列。空文字と前後の空白は使わない。
- `category`: Work は必須。`Tool`、`HDA`、`HP`、`Others` から選ぶ。Blog の省略時は `Others`。
- `thumbnail`: 任意。`/images/uploads/` 配下の PNG、JPG、JPEG、WebP、SVG を指定する。
- `url`: 任意。`http://` または `https://` の外部リンク。

## 本文と画像

- 見出し、段落、リスト、引用、リンク、画像、コード、表、打ち消し線、チェックリストを使用できる。
- Blog は深さ 3 までの見出しから目次を生成する。同じ見出しでもリンク先を区別する。
- HTML は sanitize される。独自の React コンポーネントと `import` は使わない。
- サムネイルは約 2:1 の横長で、主要な被写体を中央に置く。画像がない場合はプレースホルダーになる。

## 表示確認

- 一覧から詳細へ移動し、題名、日付、タグ、本文と画像を確認する。
- Blog の目次リンクと関連記事を確認する。
- 狭幅と広幅で文字の欠け、横スクロール、画像のクロップを確認する。
- 公開できない情報や権利を確認できない画像を含めない。

## 公開前の検査

- `npm run content:check` で Work と Blog の原稿を検査する。
- slug の形式・ファイル名との一致・重複、frontmatter、カテゴリ、日付と更新順を確認する。
- タグの空文字・前後空白、外部 URL、画像の配置・拡張子・実在を確認する。
- `dummy-` から始まる原稿は検査対象外になる。
- 問題がある場合はファイル名と理由を表示して終了コード 1 を返す。修正して再実行する。
