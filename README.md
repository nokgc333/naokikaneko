# naokikaneko.com

個人用ポートフォリオ・名刺サイト。プロフィール / 実績（Work） / 技術ブログ（Blog） / お問い合わせを1つのサイトに集約。

- **公開URL**: https://naokikaneko.com
- **リポジトリ**: https://github.com/nokgc333/naokikaneko

## 概要

Next.js（App Router）+ TypeScript + Tailwind CSSで構築したフルスクラッチのポートフォリオサイト。
コンテンツはMarkdown/MDXで管理し、Decap CMSによるノーコード編集とGitベースの手動運用の両方に対応している。
単なる静的な自己紹介ページではなく、実務を想定した設計判断・テスト・CI/CDまで一通り実装した。

## 主な機能

| 機能 | 概要 |
|---|---|
| Work（実績）一覧・詳細 | カテゴリ絞り込み、MDXによる本文レンダリング |
| Blog（技術記事）一覧・詳細 | グリッド/リスト表示切替、新しい順・古い順の並び替え、見出し目次（TOC）、関連記事サイドバー |
| お問い合わせフォーム | React Hook Form + Zodバリデーション、Resend経由のメール送信（独自ドメインでDKIM/SPF/DMARC認証済み） |
| コンテンツ管理 | Decap CMS（`/admin`からのWeb編集）と、Gitへの直接コミットの両方でMarkdown/MDXコンテンツを追加可能 |
| SEO | 動的サイトマップ・robots.txt、Open Graph / Twitter Card対応 |

## 技術スタック

| 分類 | 技術 |
|---|---|
| フレームワーク | Next.js 16（App Router / Turbopack） |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS v4, shadcn/ui |
| コンテンツ | Markdown / MDX（`next-mdx-remote`, `remark`/`rehype`系プラグイン）, Decap CMS |
| バリデーション | Zod |
| フォーム | React Hook Form |
| メール送信 | Resend |
| テスト | Vitest（単体・結合）, Playwright（E2E） |
| CI | GitHub Actions（Lint / 型チェック / テスト / E2E） |
| ホスティング | Vercel |

## 設計・実装上のポイント

- **レンダリング方式の統一**: 

Work・Blog双方の詳細ページを`MDXRemote`ベースに統一し、コンテンツ種別によるレンダリングロジックの分岐をなくした。

- **コンテナクエリによるレスポンシブ画像**:

サムネイルの`object-fit`を、ビューポート幅ではなくカード自身の実測アスペクト比に応じて切り替え、多カラムレイアウトでも崩れないようにした。

- **フォールバック込みのフォント設計**:

Google Fonts（Roboto / Noto Sans JP）にOSフォントの完全なフォールバックスタックを付与し、フォント読み込み前後でのレイアウトシフトを抑制している。

- **Zodによるフロントマター検証**:

Markdown/MDXのfrontmatterをZodスキーマでパースし、不正なコンテンツをビルド時に検知できるようにした。

- **アクセシビリティへの配慮**:

アイコンのみのUIには`aria-label`を付与し、視覚的な省略とスクリーンリーダー向けの情報を両立している。

## テスト・品質管理

```bash
npm run lint         # ESLint
npm run type-check   # tsc --noEmit
npm run test         # Vitest（単体・結合テスト）
npm run test:coverage
npm run test:e2e     # Playwright（E2E）
```

GitHub Actions上でPull Requestごとに上記すべてを自動実行している（`.github/workflows/ci.yml`）。

## ローカルでの起動方法

```bash
npm install
npm run dev
```

`http://localhost:3000` で確認できる。
お問い合わせフォームの送信機能を使う場合は、Resendの APIキー等を`.env.local`に設定する。

## ディレクトリ構成

```
src/
  app/            # App Router（ページ・APIルート）
  components/     # UIコンポーネント
  lib/            # コンテンツ取得・バリデーション等のロジック
content/
  work/           # Work記事（.mdx）
  blog/           # Blog記事（.mdx）
public/admin/     # Decap CMS設定
e2e/              # Playwright E2Eテスト
```
