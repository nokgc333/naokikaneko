# 設計仕様書: naokikaneko（名刺サイト）

作成日: 2026-09-09
ステータス: 承認待ち

## 背景・目的

名刺として本人概要・過去経歴・実績・連絡先を掲載する個人Webサイトを新規に作成する。
将来的に `naokikaneko.com` ドメインを本サイトが引き継ぐ想定（既存の `my-web` プロジェクトは同ドメインの記載を撤去済み）。

デザイン面は以下のサイトを参考にする（技術スタックの参考ではなくデザイン・構成の参考）:

- https://shujihirai.com/about — Top/About/Skill/Contact、Work
  - 太字タイポグラフィ中心、オフホワイト背景のミニマルなレイアウト
  - 経歴を年表形式（Archive）で見せる構成
- https://anne-fc.com/ — Blog
  - 会員限定コンテンツの見せ方・UI導線を参考（技術はBitfan SaaSのため不参照）

## 技術スタック

| 項目 | 選定 |
|---|---|
| フレームワーク | Next.js（App Router） |
| 言語 | TypeScript |
| UI | Tailwind CSS + shadcn/ui（ベース） + daisyUI（アクセント） |
| コンテンツ管理 | Decap CMS |
| コンテンツエディタ | Decap標準Markdownエディタ（将来MDX移行を見据えた設計） |
| バリデーション | Zod（frontmatter型検証 + 問い合わせフォーム入力検証） |
| メール送信 | Resend + `/api/contact` |
| DB・認証 | 保留（将来 Supabase + Prisma、NextAuth 追加を想定した設計にしておく） |
| テスト | Vitest（ユニット/統合） + Playwright（E2E） |
| ホスティング | Vercel（新規GitHubリポジトリ、まずは `*.vercel.app` で公開） |

### 技術選定の経緯

- 参考サイトのうち shujihirai.com は Studio.Design（ノーコードツール）製、anne-fc.com は Bitfan（ファンクラブSaaS）のテナントサイトであり、いずれも技術スタックの参考にはならないと判断。デザイン・構成のみ参照する。
- コンテンツ管理は「Web上のCMSからの更新」と「リポジトリ格納→デプロイでの更新」を両立したいという要望から、単一の正本（リポジトリ内ファイル）に対して2つの編集経路（CMS画面 / 直接ファイル編集）を持つ Git連携型CMS を採用。
- Decap CMS と Tina CMS を比較し、外部サービス依存の少なさ・コスト・実績を優先して Decap CMS を採用。

## ページ構成

| パス | 内容 | データソース |
|---|---|---|
| `/` | Top＋About＋Skill＋Contact | ハードコード（JSXに直書き、CMS管理対象外） |
| `/work` | 実績一覧 | Decapの `work` コレクション |
| `/work/[slug]` | 実績詳細 | 同上、個別ファイル |
| `/blog` | ブログ一覧 | Decapの `blog` コレクション |
| `/blog/[slug]` | ブログ詳細 | 同上、個別ファイル |
| `/admin` | Decap CMS管理画面 | — |
| `/api/contact` | 問い合わせフォーム送信処理（Resend経由） | — |

## データモデル

`work` と `blog` は共通スキーマとする。フィールドは運用しながら随時追加可能な設計とする。

- `date`
- `title`
- `slug`
- `tags`
- `thumbnail`
- `url`
- `description`
- `body`（Markdown本文）

profile情報（自己紹介・スキル等）はCMS管理せず、Top ページ内に直接記述する。

## コンテンツ管理（Decap CMS）詳細

- コンテンツはリポジトリ内の Markdown ファイル（frontmatter + body）として保存
- 編集経路:
  1. `/admin` のDecap管理画面からWeb編集 → GitHub OAuth認証 → コミット
  2. リポジトリのファイルを直接編集（Claude Code経由 / 手動） → push
  - いずれの経路でも同一ファイルへの書き込みとなり、pushをトリガーにVercelが自動デプロイする
- GitHub OAuth認証には、Vercel上のAPI Routeで簡易OAuthプロキシを実装する（Decap CMSの `base_url` / `auth_endpoint` 設定に対応）

## Contact機能

- 問い合わせフォーム（名前・メール・本文）を設置
- `/api/contact` でZodによる入力検証後、Resend経由でメール送信
- my-webと同様のResend利用パターンを踏襲

## テスト方針

- Vitest: ユニット/統合テスト（frontmatterのZod検証、API Routeのロジックなど）
- Playwright: E2Eテスト（Chromiumのみ、my-web同様）
- CI: GitHub Actions（Lint → 型チェック → ユニット/統合テスト → E2Eテスト）※my-webの `.github/workflows/ci.yml` を参考に構築

## 未確定・将来検討事項

- DB・認証（Supabase + Prisma、NextAuth）の追加要否とタイミング
- ブログ本文のMDX移行タイミング
- 独自ドメイン取得タイミング（サイト完成後に取得予定）
- `work` / `blog` フィールドの追加項目（運用しながら拡張）

## 運用上の注意（my-webの実績を踏まえて）

- 新しい環境変数を追加する機能を実装した場合、Vercelへの環境変数設定をデプロイ前に必ず行う（my-webで設定漏れによる本番障害が複数回発生した実績あり）
- GitHub関連の操作（`git init`含む全てのgitコマンド、リポジトリ作成、push、Vercel連携）はユーザー自身が手動で実施する。Claudeはファイル作成・編集のみを行い、実行すべきコマンドをその都度案内する
