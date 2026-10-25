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
| コンテンツ管理 | Decap CMS（`/admin`からのWeb編集）と、Gitへの直接コミットの両方でMarkdown/MDXコンテンツを追加可能。手順と書式は `CONTENT_GUIDE.md`、検査は `npm run content:check` |
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
npm run content:check # コンテンツ（frontmatter・画像・slug）の検査
```

GitHub Actions上でPull Requestごとに上記すべてを自動実行している（`.github/workflows/ci.yml`）。

## セットアップ

### 前提

- Node.js 24（`.nvmrc` で固定。`nvm use` で切り替える）。別の版では `npm install` が失敗する（`engine-strict`）。
- npm 11 以上。

### 起動

```bash
nvm use
npm ci
cp .env.example .env.local   # 値は次の節を見て埋める
npm run dev                  # http://localhost:3000
```

環境変数が空でも、サイトの閲覧は動く。お問い合わせの送信と CMS のログインだけが、それぞれの設定を必要とする（未設定の機能は 500 を返し、ログに不足している変数名が出る）。

### 環境変数

| 変数 | 必要な機能 | 値 | Vercel での種別 |
|---|---|---|---|
| `RESEND_API_KEY` | お問い合わせ | Resend の API キー | シークレット（Sensitive） |
| `ADMIN_EMAIL` | お問い合わせ | 問い合わせの届け先（自分のメール） | 通常 |
| `CONTACT_MAIL_FROM` | お問い合わせ | 送信元。`名前 <address@your-domain>` の形。ドメインは Resend で認証済みであること | 通常 |
| `GITHUB_OAUTH_CLIENT_ID` | CMS のログイン | GitHub OAuth App の Client ID | 通常 |
| `GITHUB_OAUTH_CLIENT_SECRET` | CMS のログイン | GitHub OAuth App の Client Secret | シークレット（Sensitive） |

- 本番（Vercel）では、同じ名前を Project Settings > Environment Variables に登録する。Production と Preview の両方に設定する。
- 値はコミットしない（`.env*` は `.gitignore` 済みで、`.env.example` だけが追跡される）。
- 値が不正（形式が違う）な場合も、不足と同じく該当機能が 500 を返し、ログに変数名だけが出る（値は出ない）。

### 外部サービスの設定

**Resend（お問い合わせのメール送信）**

1. Resend でドメインを追加し、DNS に DKIM / SPF / DMARC のレコードを登録して認証する。
2. API キーを発行し、`RESEND_API_KEY` に設定する。
3. `CONTACT_MAIL_FROM` に、認証済みドメインの送信元アドレスを設定する。

**GitHub OAuth App（CMS のログイン）**

1. GitHub > Settings > Developer settings > OAuth Apps で、新しい OAuth App を作る。
2. Homepage URL にサイトの URL、Authorization callback URL に `<サイトの URL>/api/decap-oauth/callback` を設定する。
3. Client ID と、発行した Client Secret を、`GITHUB_OAUTH_CLIENT_ID` / `GITHUB_OAUTH_CLIENT_SECRET` に設定する。
4. 要求するスコープは `public_repo` のみ（公開リポジトリへの書き込み）。

**Decap CMS**

- 設定は `public/admin/config.yml`。`backend.repo` / `branch` / `base_url` / `auth_endpoint` を自分のリポジトリとサイトに合わせる。
- 本番: `<サイトの URL>/admin/index.html` を開き、GitHub でログインする。記事を保存すると、`main` に直接コミットされる。
- ローカル（ログイン不要）: 別のターミナルで `npm run cms:proxy` を起動し、`http://localhost:3000/admin/index.html` を開く（`local_backend: true`）。ローカルの `content/` を直接編集する。

## ライセンス

- ソースコードは MIT License（`LICENSE`）。
- `content/`（記事）、`public/images/uploads/`（画像）、About ページのプロフィール文は対象外で、すべての権利を留保する（`CONTENT_LICENSE.md`）。

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
